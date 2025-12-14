const datos = require("./cad.js");
const correo = require("./email.js");
const bcrypt = require("bcrypt");

function Sistema(test) {
  this.usuarios = {};
  this.partidas = {};
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

  this.crearPartida = function(email) {
    if (!this.usuarios[email]) {
      console.log("Usuario no encontrado:", email);
      return -1;
    }

    let codigo = this.obtenerCodigo();
    let partida = new Partida(codigo);
    
    partida.jugadores.push(this.usuarios[email]);
    partida.estado = "esperando";
    
    this.partidas[codigo] = partida;
    
    this.cad.insertarLog({
      tipoOperacion: "crearPartida",
      usuario: email,
      detalles: { codigo: codigo },
      fechaHora: new Date()
    });
    
    console.log("Partida creada con código:", codigo);
    return codigo;
  };

  this.unirAPartida = function(email, codigo) {
    let usuario = this.usuarios[email];
    if (!usuario) {
      console.log("Usuario no encontrado:", email);
      return { resultado: -1, mensaje: "Usuario no encontrado" };
    }

    let partida = this.partidas[codigo];
    if (!partida) {
      console.log("Partida no encontrada:", codigo);
      return { resultado: -1, mensaje: "Partida no encontrada" };
    }

    if (partida.estado === "enCurso") {
      return { resultado: -1, mensaje: "La partida ya está en curso" };
    }

    if (partida.estado === "finalizada") {
      return { resultado: -1, mensaje: "La partida ha finalizado" };
    }

    if (partida.jugadores.length >= partida.maxJug) {
      console.log("Partida llena");
      return { resultado: -1, mensaje: "Partida llena" };
    }

    for (let i = 0; i < partida.jugadores.length; i++) {
      if (partida.jugadores[i].nick === email) {
        console.log("El usuario ya está en la partida");
        return { resultado: -1, mensaje: "Ya estás en esta partida" };
      }
    }

    partida.jugadores.push(usuario);
    
    if (partida.jugadores.length >= partida.maxJug) {
      partida.estado = "enCurso";
      console.log("¡Partida llena! Estado: enCurso");
    }
    
    this.cad.insertarLog({
      tipoOperacion: "unirAPartida",
      usuario: email,
      detalles: { 
        codigo: codigo,
        nuevoEstado: partida.estado
      },
      fechaHora: new Date()
    });
    
    console.log("Usuario unido a partida:", email, "->", codigo);
    
    return { 
      resultado: codigo, 
      mensaje: "Unido correctamente",
      estado: partida.estado
    };
  };

  this.abandonarPartida = function(email, codigo) {
    let partida = this.partidas[codigo];
    
    if (!partida) {
      return { resultado: -1, mensaje: "Partida no encontrada" };
    }

    let indexJugador = -1;
    for (let i = 0; i < partida.jugadores.length; i++) {
      if (partida.jugadores[i].nick === email) {
        indexJugador = i;
        break;
      }
    }

    if (indexJugador === -1) {
      return { resultado: -1, mensaje: "No estás en esta partida" };
    }

    partida.estado = "finalizada";
    partida.ganador = null;
    partida.abandonadoPor = email;

    this.cad.insertarLog({
      tipoOperacion: "abandonarPartida",
      usuario: email,
      detalles: { 
        codigo: codigo,
        estadoFinal: "finalizada"
      },
      fechaHora: new Date()
    });

    console.log("Usuario abandonó partida:", email, "->", codigo);

    return { 
      resultado: codigo, 
      mensaje: "Has abandonado la partida",
      estado: "finalizada"
    };
  };

  this.obtenerPartidasDisponibles = function() {
    let lista = [];
    for (let codigo in this.partidas) {
      let partida = this.partidas[codigo];
      
      let obj = {
        codigo: partida.codigo,
        creador: partida.jugadores[0].nick,
        numJugadores: partida.jugadores.length,
        maxJugadores: partida.maxJug,
        estado: partida.estado
      };

      if (partida.estado === "finalizada") {
        obj.abandonadoPor = partida.abandonadoPor || null;
      }

      lista.push(obj);
    }
    return lista;
  };

  this.obtenerPartidaUsuario = function(email) {
    for (let codigo in this.partidas) {
      let partida = this.partidas[codigo];
      
      for (let i = 0; i < partida.jugadores.length; i++) {
        if (partida.jugadores[i].nick === email) {
          return {
            codigo: partida.codigo,
            estado: partida.estado,
            jugadores: partida.jugadores.map(j => j.nick),
            abandonadoPor: partida.abandonadoPor || null
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
    } while (this.partidas[codigo]);
    
    return codigo;
  };
}

function Usuario(nick) {
  this.nick = nick;
}

function Partida(codigo) {
  this.codigo = codigo;
  this.jugadores = [];
  this.maxJug = 2;
  this.estado = "esperando";
  this.ganador = null;
  this.abandonadoPor = null;
}

module.exports.Sistema = Sistema;