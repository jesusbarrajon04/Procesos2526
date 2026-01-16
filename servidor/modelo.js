const datos = require("./cad.js");
const correo = require("./email.js");
const bcrypt = require("bcrypt");

function Sistema(test) {
  this.usuarios = {};
  this.grupos = {}; // Antes "partidas" - Ahora grupos de cafetería
  this.cad = new datos.CAD();
  this.dbConectada = false;

  let sistema = this;

  if (!test || !test.test) {
    this.cad.conectar(function(db) {
      console.log("Sistema conectado a Mongo Atlas");
      sistema.dbConectada = true;
    }).catch(err => {
      console.error("Error al conectar el sistema a MongoDB:", err);
    });
  }

  // ==================== AUTENTICACIÓN ====================
  
  this.registrarUsuario = function (obj, callback) {
    let modelo = this;
    if (!obj.nick) {
      obj.nick = obj.email.split("@")[0];
    }
    this.cad.buscarUsuario({email: obj.email}, async function (usr) {
      if (!usr) {
        obj.key = Date.now().toString();
        obj.confirmada = false;
        const hash = await bcrypt.hash(obj.password, 10);
        obj.password = hash;
        modelo.cad.insertarUsuario(obj, function (res) {
          modelo.cad.insertarLog({
            tipoOperacion: "registroUsuario",
            usuario: res.email,
            fechaHora: new Date()
          });
          callback(res);
        });
        correo.enviarEmail(obj.email, obj.key, "Confirmar cuenta");
      } else {
        callback({ "email": -1 });
      }
    });
  };

  this.confirmarUsuario = function (obj, callback) {
    let modelo = this;
    this.cad.buscarUsuario({
      "email": obj.email, 
      "confirmada": false, 
      "key": obj.key
    }, function(usr) {
      if (usr) {
        usr.confirmada = true;
        modelo.cad.actualizarUsuario(usr, function (res) {
          callback({ "email": res.email });
        })
      } else {
        callback({"email": -1});
      }
    })
  };

  this.loginUsuario = function (obj, callback) {
    let modelo = this;
    this.cad.buscarUsuario({ 
      email: obj.email,
      "confirmada": true 
    }, function (usr) {
      if (!usr) {
        callback({ "email": -1 });
      } else {
        bcrypt.compare(obj.password, usr.password, function (err, result) {
          if (result) {
            modelo.cad.insertarLog({
              tipoOperacion: "inicioLocal",
              usuario: usr.email,
              fechaHora: new Date()
            });
            callback({ "email": usr.email });
            modelo.agregarUsuario(usr.email);
          } else {
            callback({ "email": -1 });
          }
        })
      }
    });
  };

  this.usuarioGoogle = function (usr, callback) {
    let modelo = this;
    this.cad.buscarOCrearUsuario(usr, function (obj) {
      modelo.cad.insertarLog({
        tipoOperacion: "inicioGoogle",
        usuario: obj.email,
        fechaHora: new Date()
      });
      callback(obj);
      modelo.agregarUsuario(obj.email);
    });
  };

  // ==================== USUARIOS EN MEMORIA ====================
  
  this.agregarUsuario = function(nick) {
    let res = { "nick": -1 };
    if (!this.usuarios[nick]) {
      this.usuarios[nick] = new Usuario(nick);
      res.nick = nick;
    } else {
      console.log("el nick " + nick + " está en uso");
    }
    return res;
  };

  this.obtenerUsuarios = function() {
    let lista = [];
    for (let u in this.usuarios) {
      lista.push({ "nick": this.usuarios[u].nick });
    }
    return lista;
  };

  this.usuarioActivo = function(nick) {
    return this.usuarios[nick] != undefined;
  };

  this.eliminarUsuario = function(nick) {
    let res = { "nick": -1 };
    if (this.usuarios[nick]) {
      delete this.usuarios[nick];
      res.nick = nick;
      
      this.cad.insertarLog({
        tipoOperacion: "cerrarSesion",
        usuario: nick,
        fechaHora: new Date()
      });
    }
    return res;
  };

  this.numeroUsuarios = function() {
    return { num: Object.keys(this.usuarios).length };
  };

  // ==================== GRUPOS (antes Partidas) ====================
  
  this.crearGrupo = function(email, nombreGrupo, esPrivado) {
    if (!this.usuarios[email]) {
      console.log("Usuario no encontrado:", email);
      return -1;
    }

    let codigo = this.obtenerCodigo();
    let grupo = new Grupo(codigo, nombreGrupo || "Grupo de cafetería");
    
    grupo.miembros.push(this.usuarios[email]);
    grupo.creador = email;
    grupo.estado = "abierto"; // abierto, cerrado
    grupo.privado = esPrivado || false; // Nuevo: grupos privados
    grupo.solicitudesPendientes = []; // Nuevo: solicitudes de unión
    
    this.grupos[codigo] = grupo;
    
    this.cad.insertarLog({
      tipoOperacion: "crearGrupo",
      usuario: email,
      detalles: { codigo: codigo, nombre: nombreGrupo, privado: esPrivado },
      fechaHora: new Date()
    });
    
    console.log("Grupo creado con código:", codigo, "- Privado:", esPrivado);
    return codigo;
  };

  this.unirseAlGrupo = function(email, codigo, invitado) {
    let usuario = this.usuarios[email];
    if (!usuario) {
      console.log("Usuario no encontrado:", email);
      return { resultado: -1, mensaje: "Usuario no encontrado" };
    }

    let grupo = this.grupos[codigo];
    if (!grupo) {
      console.log("Grupo no encontrado:", codigo);
      return { resultado: -1, mensaje: "Grupo no encontrado" };
    }

    if (grupo.estado === "cerrado") {
      return { resultado: -1, mensaje: "El grupo está cerrado" };
    }

    // Verificar si el grupo es privado y el usuario no fue invitado
    if (grupo.privado && !invitado) {
      return { resultado: -1, mensaje: "Este grupo es privado. Necesitas una invitación o puedes solicitar unirte." };
    }

    // Verificar si ya está en el grupo
    for (let i = 0; i < grupo.miembros.length; i++) {
      if (grupo.miembros[i].nick === email) {
        console.log("El usuario ya está en el grupo");
        return { resultado: -1, mensaje: "Ya estás en este grupo" };
      }
    }

    grupo.miembros.push(usuario);
    
    // Agregar mensaje de sistema
    let mensajeSistema = {
      id: Date.now().toString(),
      autor: "SISTEMA",
      mensaje: `${email} se ha unido al grupo`,
      fecha: new Date().toISOString(),
      tipo: "sistema"
    };
    grupo.mensajes.push(mensajeSistema);
    
    this.cad.insertarLog({
      tipoOperacion: "unirseAlGrupo",
      usuario: email,
      detalles: { 
        codigo: codigo,
        numeroMiembros: grupo.miembros.length
      },
      fechaHora: new Date()
    });
    
    console.log("Usuario unido a grupo:", email, "->", codigo);
    
    return { 
      resultado: codigo, 
      mensaje: "Unido correctamente",
      estado: grupo.estado,
      miembros: grupo.miembros.map(m => m.nick),
      mensajeSistema: mensajeSistema
    };
  };

  this.salirDelGrupo = function(email, codigo) {
    let grupo = this.grupos[codigo];
    
    if (!grupo) {
      return { resultado: -1, mensaje: "Grupo no encontrado" };
    }

    let indexMiembro = -1;
    for (let i = 0; i < grupo.miembros.length; i++) {
      if (grupo.miembros[i].nick === email) {
        indexMiembro = i;
        break;
      }
    }

    if (indexMiembro === -1) {
      return { resultado: -1, mensaje: "No estás en este grupo" };
    }

    // Eliminar miembro
    grupo.miembros.splice(indexMiembro, 1);
    
    // Agregar mensaje de sistema
    let mensajeSistema = {
      id: Date.now().toString(),
      autor: "SISTEMA",
      mensaje: `${email} ha salido del grupo`,
      fecha: new Date().toISOString(),
      tipo: "sistema"
    };
    grupo.mensajes.push(mensajeSistema);
    
    // Si no quedan miembros, cerrar grupo
    if (grupo.miembros.length === 0) {
      grupo.estado = "cerrado";
    } else if (email === grupo.creador) {
      // Si era el creador pero quedan miembros, asignar nuevo creador
      grupo.creador = grupo.miembros[0].nick;
      console.log("Nuevo creador del grupo:", grupo.creador);
    }

    this.cad.insertarLog({
      tipoOperacion: "salirDelGrupo",
      usuario: email,
      detalles: { 
        codigo: codigo,
        estadoFinal: grupo.estado,
        nuevoCreador: grupo.creador
      },
      fechaHora: new Date()
    });

    console.log("Usuario salió del grupo:", email, "->", codigo);

    return { 
      resultado: codigo, 
      mensaje: "Has salido del grupo",
      estado: grupo.estado,
      nuevoCreador: grupo.creador,
      miembrosRestantes: grupo.miembros.length,
      mensajeSistema: mensajeSistema
    };
  };

  this.enviarMensajeGrupo = function(email, codigo, mensaje) {
    let grupo = this.grupos[codigo];
    
    if (!grupo) {
      return { resultado: -1, mensaje: "Grupo no encontrado" };
    }

    // Verificar que el usuario esté en el grupo
    let esMiembro = grupo.miembros.some(m => m.nick === email);
    if (!esMiembro) {
      return { resultado: -1, mensaje: "No eres miembro de este grupo" };
    }

    let mensajeObj = {
      id: Date.now().toString(),
      autor: email,
      mensaje: mensaje,
      fecha: new Date().toISOString()
    };

    grupo.mensajes.push(mensajeObj);
    
    // Mantener solo los últimos 100 mensajes en memoria
    if (grupo.mensajes.length > 100) {
      grupo.mensajes.shift();
    }

    return { 
      resultado: codigo, 
      mensaje: mensajeObj
    };
  };

  this.obtenerMensajesGrupo = function(codigo, limite = 50) {
    let grupo = this.grupos[codigo];
    
    if (!grupo) {
      return [];
    }

    // Retornar los últimos N mensajes
    return grupo.mensajes.slice(-limite);
  };

  this.obtenerGruposDisponibles = function() {
    let lista = [];
    for (let codigo in this.grupos) {
      let grupo = this.grupos[codigo];
      
      let obj = {
        codigo: grupo.codigo,
        nombre: grupo.nombre,
        creador: grupo.creador,
        numeroMiembros: grupo.miembros.length,
        miembros: grupo.miembros.map(m => m.nick),
        estado: grupo.estado,
        privado: grupo.privado || false,
        ultimaActividad: grupo.mensajes.length > 0 
          ? grupo.mensajes[grupo.mensajes.length - 1].fecha 
          : grupo.fechaCreacion
      };

      lista.push(obj);
    }
    return lista;
  };

  // ==================== INVITACIONES Y SOLICITUDES ====================
  
  this.solicitarUnionGrupo = function(email, codigo) {
    let grupo = this.grupos[codigo];
    
    if (!grupo) {
      return { resultado: -1, mensaje: "Grupo no encontrado" };
    }

    // Verificar si ya está en el grupo
    if (grupo.miembros.some(m => m.nick === email)) {
      return { resultado: -1, mensaje: "Ya estás en este grupo" };
    }

    // Verificar si ya tiene una solicitud pendiente
    if (grupo.solicitudesPendientes && grupo.solicitudesPendientes.includes(email)) {
      return { resultado: -1, mensaje: "Ya tienes una solicitud pendiente en este grupo" };
    }

    // Añadir a solicitudes pendientes
    if (!grupo.solicitudesPendientes) {
      grupo.solicitudesPendientes = [];
    }
    grupo.solicitudesPendientes.push(email);

    // Crear mensaje de solicitud en el chat
    let mensajeSolicitud = {
      id: Date.now().toString(),
      autor: "SISTEMA",
      mensaje: `${email} solicita unirse al grupo`,
      fecha: new Date().toISOString(),
      tipo: "solicitud",
      solicitante: email
    };
    grupo.mensajes.push(mensajeSolicitud);

    console.log("Solicitud de unión:", email, "->", codigo);

    return {
      resultado: codigo,
      mensaje: "Solicitud enviada correctamente",
      mensajeSolicitud: mensajeSolicitud
    };
  };

  this.responderSolicitud = function(codigoGrupo, solicitante, aprobado, quienResponde) {
    let grupo = this.grupos[codigoGrupo];
    
    if (!grupo) {
      return { resultado: -1, mensaje: "Grupo no encontrado" };
    }

    // Verificar que quien responde está en el grupo
    if (!grupo.miembros.some(m => m.nick === quienResponde)) {
      return { resultado: -1, mensaje: "No eres miembro de este grupo" };
    }

    // Verificar que hay una solicitud pendiente
    if (!grupo.solicitudesPendientes || !grupo.solicitudesPendientes.includes(solicitante)) {
      return { resultado: -1, mensaje: "No hay solicitud pendiente de este usuario" };
    }

    // Eliminar de solicitudes pendientes
    grupo.solicitudesPendientes = grupo.solicitudesPendientes.filter(s => s !== solicitante);

    let mensajeRespuesta;

    if (aprobado) {
      // Añadir al grupo si fue aprobado
      let usuario = this.usuarios[solicitante];
      if (usuario) {
        grupo.miembros.push(usuario);
        
        mensajeRespuesta = {
          id: Date.now().toString(),
          autor: "SISTEMA",
          mensaje: `${solicitante} ha sido aceptado en el grupo por ${quienResponde}`,
          fecha: new Date().toISOString(),
          tipo: "sistema"
        };
        grupo.mensajes.push(mensajeRespuesta);

        return {
          resultado: codigoGrupo,
          aprobado: true,
          mensaje: "Solicitud aprobada",
          nuevoMiembro: solicitante,
          mensajeRespuesta: mensajeRespuesta
        };
      }
    } else {
      mensajeRespuesta = {
        id: Date.now().toString(),
        autor: "SISTEMA",
        mensaje: `La solicitud de ${solicitante} ha sido rechazada por ${quienResponde}`,
        fecha: new Date().toISOString(),
        tipo: "sistema"
      };
      grupo.mensajes.push(mensajeRespuesta);

      return {
        resultado: codigoGrupo,
        aprobado: false,
        mensaje: "Solicitud rechazada",
        mensajeRespuesta: mensajeRespuesta
      };
    }

    return { resultado: -1, mensaje: "Error al procesar solicitud" };
  };

  this.obtenerGrupoUsuario = function(email) {
    for (let codigo in this.grupos) {
      let grupo = this.grupos[codigo];
      
      for (let i = 0; i < grupo.miembros.length; i++) {
        if (grupo.miembros[i].nick === email) {
          return {
            codigo: grupo.codigo,
            nombre: grupo.nombre,
            estado: grupo.estado,
            miembros: grupo.miembros.map(m => m.nick),
            creador: grupo.creador,
            numeroMensajes: grupo.mensajes.length
          };
        }
      }
    }
    return null;
  };

  this.obtenerCodigo = function() {
    let codigo;
    do {
      codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (this.grupos[codigo]);
    
    return codigo;
  };
}

function Usuario(nick) {
  this.nick = nick;
}

function Grupo(codigo, nombre) {
  this.codigo = codigo;
  this.nombre = nombre || "Grupo sin nombre";
  this.miembros = [];
  this.creador = null;
  this.estado = "abierto"; // abierto, cerrado
  this.privado = false; // Nuevo: grupos privados
  this.solicitudesPendientes = []; // Nuevo: solicitudes de unión
  this.mensajes = []; // Array de mensajes en memoria
  this.fechaCreacion = new Date().toISOString();
}

module.exports.Sistema = Sistema;