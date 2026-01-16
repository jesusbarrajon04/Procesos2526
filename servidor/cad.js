const mongo = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

function CAD() {
  this.usuarios = null;
  this.logs = null;
  this.grupos = null;
  this.mensajes = null;
  this.pedidos = null;
  this.menu = null;
  this.reservas = null;
  this.client = null;

  this.conectar = async function(callback) {
    try {
      let cad = this;
      let stringConexion = process.env.CONEXION_STRING;
      let client = new mongo(stringConexion);
      await client.connect();
      console.log("Conectado a Mongo Atlas...");
      
      const database = client.db("sistema");
      
      // Colecciones existentes
      cad.usuarios = database.collection("usuarios");
      cad.logs = database.collection("logs");
      
      // Nuevas colecciones para funcionalidad de cafetería
      cad.grupos = database.collection("grupos");
      cad.mensajes = database.collection("mensajes");
      cad.pedidos = database.collection("pedidos");
      cad.menu = database.collection("menu");
      cad.reservas = database.collection("reservas");
      
      console.log("✓ Colecciones inicializadas: usuarios, logs, grupos, mensajes, pedidos, menu, reservas");
      
      callback(database);
    } catch (error) {
      console.error("Error al conectar a MongoDB:", error);
      throw error;
    }
  };

  // ==================== USUARIOS (existentes) ====================
  
  this.buscarOCrearUsuario = function(usr, callback) {
    if (!this.usuarios) {
      console.error("La colección 'usuarios' no está inicializada");
      callback({ email: -1, error: "Base de datos no conectada" });
      return;
    }
    buscarOCrear(this.usuarios, usr, callback);
  };

  this.buscarUsuario = function(usr, callback) {
    if (!this.usuarios) {
      console.error("La colección 'usuarios' no está inicializada");
      callback({ email: -1, error: "Base de datos no conectada" });
      return;
    }
    buscar(this.usuarios, usr, callback);
  };

  this.insertarUsuario = function(usr, callback) {
    if (!this.usuarios) {
      console.error("La colección 'usuarios' no está inicializada");
      callback({ email: -1, error: "Base de datos no conectada" });
      return;
    }
    insertar(this.usuarios, usr, callback);
  };

  this.actualizarUsuario = function (obj, callback) {
    actualizar(this.usuarios, obj, callback);
  };

  // ==================== LOGS (existentes) ====================
  
  this.insertarLog = function(log, callback) {
    if (!this.logs) {
      console.error("La colección 'logs' no está inicializada");
      if (callback) callback({ insertado: false });
      return;
    }
    
    if (!log.fechaHora) {
      log.fechaHora = new Date();
    }
    
    this.logs.insertOne(log, function(err, result) {
      if (err) {
        console.error("Error al insertar log:", err);
        if (callback) callback({ insertado: false });
      } else {
        console.log("Log registrado:", log.tipoOperacion, "-", log.usuario);
        if (callback) callback({ insertado: true });
      }
    });
  };

  this.obtenerLogs = function(filtro, callback) {
    if (!this.logs) {
      console.error("La colección 'logs' no está inicializada");
      callback([]);
      return;
    }
    
    let query = filtro || {};
    
    this.logs
      .find(query)
      .sort({ fechaHora: -1 })
      .limit(100)
      .toArray(function(error, logs) {
        if (error) {
          console.error("Error al obtener logs:", error);
          callback([]);
        } else {
          callback(logs);
        }
      });
  };

  // ==================== GRUPOS (nuevo) ====================
  
  this.guardarGrupo = function(grupo, callback) {
    if (!this.grupos) {
      console.error("La colección 'grupos' no está inicializada");
      if (callback) callback({ guardado: false });
      return;
    }
    
    const grupoDoc = {
      codigo: grupo.codigo,
      nombre: grupo.nombre,
      creador: grupo.creador,
      miembros: grupo.miembros.map(m => m.nick),
      estado: grupo.estado,
      fechaCreacion: grupo.fechaCreacion,
      fechaActualizacion: new Date().toISOString()
    };
    
    this.grupos.updateOne(
      { codigo: grupo.codigo },
      { $set: grupoDoc },
      { upsert: true },
      function(err, result) {
        if (err) {
          console.error("Error al guardar grupo:", err);
          if (callback) callback({ guardado: false });
        } else {
          console.log("Grupo guardado:", grupo.codigo);
          if (callback) callback({ guardado: true });
        }
      }
    );
  };

  this.obtenerGrupo = function(codigo, callback) {
    if (!this.grupos) {
      console.error("La colección 'grupos' no está inicializada");
      callback(null);
      return;
    }
    
    this.grupos.findOne({ codigo: codigo }, function(err, grupo) {
      if (err) {
        console.error("Error al obtener grupo:", err);
        callback(null);
      } else {
        callback(grupo);
      }
    });
  };

  this.obtenerGruposActivos = function(callback) {
    if (!this.grupos) {
      console.error("La colección 'grupos' no está inicializada");
      callback([]);
      return;
    }
    
    this.grupos
      .find({ estado: "abierto" })
      .sort({ fechaActualizacion: -1 })
      .toArray(function(err, grupos) {
        if (err) {
          console.error("Error al obtener grupos:", err);
          callback([]);
        } else {
          callback(grupos);
        }
      });
  };

  // ==================== MENSAJES (nuevo - CON SOPORTE PRIVADO) ====================
  
  this.guardarMensaje = function(mensaje, callback) {
    if (!this.mensajes) {
      console.error("La colección 'mensajes' no está inicializada");
      if (callback) callback({ guardado: false });
      return;
    }
    
    const mensajeDoc = {
      grupoId: mensaje.grupoId || null,
      conversacionId: mensaje.conversacionId || null, // Para mensajes privados
      autor: mensaje.autor,
      destinatario: mensaje.destinatario || null, // Para mensajes privados
      mensaje: mensaje.mensaje,
      tipo: mensaje.tipo || "texto", // texto, sistema, imagen, privado
      fecha: mensaje.fecha || new Date().toISOString(),
      leido: mensaje.leido || false
    };
    
    this.mensajes.insertOne(mensajeDoc, function(err, result) {
      if (err) {
        console.error("Error al guardar mensaje:", err);
        if (callback) callback({ guardado: false });
      } else {
        if (callback) callback({ guardado: true, id: result.insertedId });
      }
    });
  };

  this.obtenerMensajesGrupo = function(grupoId, limite, callback) {
    if (!this.mensajes) {
      console.error("La colección 'mensajes' no está inicializada");
      callback([]);
      return;
    }
    
    const limiteNum = limite || 50;
    
    this.mensajes
      .find({ grupoId: grupoId })
      .sort({ fecha: -1 })
      .limit(limiteNum)
      .toArray(function(err, mensajes) {
        if (err) {
          console.error("Error al obtener mensajes:", err);
          callback([]);
        } else {
          // Invertir para que el más antiguo esté primero
          callback(mensajes.reverse());
        }
      });
  };

  // ==================== MENSAJES PRIVADOS (nuevo) ====================
  
  this.obtenerMensajesPrivados = function(usuario1, usuario2, limite, callback) {
    if (!this.mensajes) {
      console.error("La colección 'mensajes' no está inicializada");
      callback([]);
      return;
    }
    
    const limiteNum = limite || 100;
    
    // Buscar mensajes donde usuario1 es autor Y usuario2 es destinatario
    // O donde usuario2 es autor Y usuario1 es destinatario
    this.mensajes
      .find({
        $or: [
          { autor: usuario1, destinatario: usuario2 },
          { autor: usuario2, destinatario: usuario1 }
        ],
        tipo: "privado"
      })
      .sort({ fecha: 1 })
      .limit(limiteNum)
      .toArray(function(err, mensajes) {
        if (err) {
          console.error("Error al obtener mensajes privados:", err);
          callback([]);
        } else {
          console.log(`Mensajes privados cargados entre ${usuario1} y ${usuario2}:`, mensajes.length);
          callback(mensajes);
        }
      });
  };

  // ==================== MENÚ (nuevo) ====================
  
  this.obtenerMenu = function(callback) {
    if (!this.menu) {
      console.error("La colección 'menu' no está inicializada");
      callback([]);
      return;
    }
    
    this.menu
      .find({ activo: true })
      .sort({ orden: 1 })
      .toArray(function(err, items) {
        if (err) {
          console.error("Error al obtener menú:", err);
          callback([]);
        } else {
          callback(items);
        }
      });
  };

  this.inicializarMenu = function(callback) {
    if (!this.menu) {
      console.error("La colección 'menu' no está inicializada");
      if (callback) callback({ inicializado: false });
      return;
    }
    
    const menuInicial = [
      // BOCADILLOS
      { id: 1, title: "Bocadillo de jamón", desc: "Pan, jamón, tomate", price: 4.5, activo: true, orden: 1, categoria: "bocadillos" },
      { id: 2, title: "Bocadillo vegetal", desc: "Verduras, hummus", price: 3.9, activo: true, orden: 2, categoria: "bocadillos" },
      { id: 7, title: "Bocadillo de lomo", desc: "Lomo, tomate, aceite", price: 4.8, activo: true, orden: 7, categoria: "bocadillos" },
      { id: 8, title: "Bocadillo de calamares", desc: "Calamares rebozados", price: 5.2, activo: true, orden: 8, categoria: "bocadillos" },
      
      // CAFÉS
      { id: 3, title: "Café solo", desc: "Pequeño", price: 1.2, activo: true, orden: 3, categoria: "cafes" },
      { id: 4, title: "Café con leche", desc: "Grande", price: 1.8, activo: true, orden: 4, categoria: "cafes" },
      
      // COMIDAS
      { id: 5, title: "Tortilla", desc: "Tortilla tradicional", price: 2.7, activo: true, orden: 5, categoria: "comidas" },
      { id: 6, title: "Ensalada", desc: "Mix de hojas", price: 4.2, activo: true, orden: 6, categoria: "comidas" },
      
      // BEBIDAS FRÍAS
      { id: 9, title: "Coca-Cola", desc: "Refresco 33cl", price: 1.5, activo: true, orden: 9, categoria: "bebidas" },
      { id: 10, title: "Coca-Cola Zero", desc: "Sin azúcar 33cl", price: 1.5, activo: true, orden: 10, categoria: "bebidas" },
      { id: 11, title: "Fanta Naranja", desc: "Refresco naranja 33cl", price: 1.5, activo: true, orden: 11, categoria: "bebidas" },
      { id: 12, title: "Agua mineral", desc: "Botella 50cl", price: 1.0, activo: true, orden: 12, categoria: "bebidas" },
      { id: 13, title: "Cerveza", desc: "Cerveza rubia 33cl", price: 2.0, activo: true, orden: 13, categoria: "bebidas" },
      { id: 14, title: "Zumo de naranja", desc: "Natural recién exprimido", price: 2.5, activo: true, orden: 14, categoria: "bebidas" },
      { id: 15, title: "Fanta limón", desc: "Refresco limón 33cl", price: 1.5, activo: true, orden: 15, categoria: "bebidas" },
    ];
    
    this.menu.countDocuments({}, (err, count) => {
      if (err) {
        console.error("Error al verificar menú:", err);
        if (callback) callback({ inicializado: false });
        return;
      }
      
      if (count === 0) {
        this.menu.insertMany(menuInicial, function(err, result) {
          if (err) {
            console.error("Error al inicializar menú:", err);
            if (callback) callback({ inicializado: false });
          } else {
            console.log("✓ Menú inicializado con", result.insertedCount, "items");
            if (callback) callback({ inicializado: true, items: result.insertedCount });
          }
        });
      } else {
        console.log("✓ Menú ya existe con", count, "items");
        if (callback) callback({ inicializado: true, items: count });
      }
    });
  };

  // ==================== PEDIDOS (nuevo) ====================
  
  this.guardarPedido = function(pedido, callback) {
    if (!this.pedidos) {
      console.error("La colección 'pedidos' no está inicializada");
      if (callback) callback({ guardado: false });
      return;
    }
    
    // Generar orderId único si no existe
    if (!pedido.orderId) {
      pedido.orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    
    const pedidoDoc = {
      orderId: pedido.orderId,
      usuarioEmail: pedido.usuarioEmail,
      items: pedido.items,
      total: pedido.total,
      metodoPago: pedido.metodoPago,
      estado: pedido.estado || "pendiente",
      tipo: pedido.tipo || "local",
      reserva: pedido.reserva || null,
      direccion: pedido.direccion || null,
      fecha: pedido.fecha || new Date().toISOString(),
      fechaCreacion: new Date().toISOString()
    };
    
    this.pedidos.insertOne(pedidoDoc, function(err, result) {
      if (err) {
        console.error("Error al guardar pedido:", err);
        if (callback) callback({ guardado: false });
      } else {
        console.log("✓ Pedido guardado:", pedidoDoc.orderId);
        if (callback) callback({ 
          guardado: true, 
          id: result.insertedId,
          orderId: pedidoDoc.orderId
        });
      }
    });
  };

  this.obtenerPedidosUsuario = function(email, callback) {
    if (!this.pedidos) {
      console.error("La colección 'pedidos' no está inicializada");
      callback([]);
      return;
    }
    
    this.pedidos
      .find({ usuarioEmail: email })
      .sort({ fecha: -1 })
      .limit(50)
      .toArray(function(err, pedidos) {
        if (err) {
          console.error("Error al obtener pedidos:", err);
          callback([]);
        } else {
          callback(pedidos);
        }
      });
  };

  // ==================== RESERVAS (nuevo) ====================
  
  this.guardarReserva = function(reserva, callback) {
    if (!this.reservas) {
      console.error("La colección 'reservas' no está inicializada");
      if (callback) callback({ guardado: false, error: "Base de datos no conectada" });
      return;
    }
    
    const reservaDoc = {
      usuarioEmail: reserva.usuarioEmail,
      mesas: reserva.mesas || [],
      numPersonas: reserva.numPersonas,
      fecha: reserva.fecha,
      horaInicio: reserva.horaInicio,
      horaFin: reserva.horaFin,
      estado: reserva.estado || "confirmada", // confirmada, cancelada, completada
      fechaCreacion: new Date().toISOString()
    };
    
    this.reservas.insertOne(reservaDoc, function(err, result) {
      if (err) {
        console.error("Error al guardar reserva:", err);
        if (callback) callback({ guardado: false });
      } else {
        console.log("✓ Reserva guardada:", result.insertedId);
        if (callback) callback({ guardado: true, id: result.insertedId });
      }
    });
  };

  this.obtenerReservasUsuario = function(email, callback) {
    if (!this.reservas) {
      console.error("La colección 'reservas' no está inicializada");
      callback([]);
      return;
    }
    
    this.reservas
      .find({ usuarioEmail: email })
      .sort({ fechaCreacion: -1 })
      .limit(20)
      .toArray(function(err, reservas) {
        if (err) {
          console.error("Error al obtener reservas:", err);
          callback([]);
        } else {
          callback(reservas);
        }
      });
  };

  // ==================== FUNCIONES AUXILIARES ====================
  
  function buscarOCrear(coleccion, criterio, callback) {
    coleccion.findOneAndUpdate(
      criterio,
      { $set: criterio },
      { 
        upsert: true, 
        returnDocument: "after", 
        projection: { email: 1 } 
      },
      function (err, doc) {
        if (err) {
          console.error("Error en buscarOCrear:", err);
          throw err;
        } else {
          console.log("Usuario encontrado/creado:", doc.value.email);
          callback({ email: doc.value.email });
        }
      }
    );
  }

  function buscar(coleccion, criterio, callback) {
    coleccion.find(criterio).toArray(function (error, usuarios) {
      if (usuarios.length == 0) {
        callback(undefined);
      } else {
        callback(usuarios[0]);
      }
    });
  }

  function insertar(coleccion, elemento, callback) {
    coleccion.insertOne(elemento, function (err, result) {
      if (err) {
        console.log("error");
      } else {
        console.log("Nuevo elemento creado");
        callback(elemento);
      }
    });
  }

  function actualizar(coleccion, obj, callback) {
    coleccion.findOneAndUpdate(
      { _id: ObjectId(obj._id) }, 
      { $set: obj },
      { upsert: false, returnDocument: "after", projection: { email: 1 } },
      function (err, doc) {
        if (err) { throw err; }
        if (!doc.value) {
          callback({ email: -1 });
        } else {
          console.log("Elemento actualizado");
          callback({ email: doc.value.email });
        }
      }
    );
  }
}

this.obtenerPedido = function(pedidoId, email, callback) {
  if (!this.pedidos) {
    console.error("La colección 'pedidos' no está inicializada");
    callback(null);
    return;
  }
  
  const ObjectId = require("mongodb").ObjectId;
  let query = { usuarioEmail: email };
  
  // Intentar por ObjectId o por orderId string
  try {
    if (ObjectId.isValid(pedidoId)) {
      query = { 
        _id: ObjectId(pedidoId),
        usuarioEmail: email 
      };
    } else {
      // Buscar por orderId string personalizado
      query = { 
        orderId: pedidoId,
        usuarioEmail: email 
      };
    }
  } catch (e) {
    query = { 
      orderId: pedidoId,
      usuarioEmail: email 
    };
  }
  
  this.pedidos.findOne(query, function(err, pedido) {
    if (err) {
      console.error("Error al obtener pedido:", err);
      callback(null);
    } else {
      callback(pedido);
    }
  });
};

/**
 * Actualizar estado de un pedido
 */
this.actualizarEstadoPedido = function(pedidoId, email, nuevoEstado, callback) {
  if (!this.pedidos) {
    console.error("La colección 'pedidos' no está inicializada");
    if (callback) callback({ actualizado: false });
    return;
  }
  
  const ObjectId = require("mongodb").ObjectId;
  let query = { usuarioEmail: email };
  
  try {
    if (ObjectId.isValid(pedidoId)) {
      query._id = ObjectId(pedidoId);
    } else {
      query.orderId = pedidoId;
    }
  } catch (e) {
    query.orderId = pedidoId;
  }
  
  this.pedidos.updateOne(
    query,
    { 
      $set: { 
        estado: nuevoEstado,
        fechaActualizacion: new Date().toISOString()
      } 
    },
    function(err, result) {
      if (err) {
        console.error("Error al actualizar estado:", err);
        if (callback) callback({ actualizado: false });
      } else {
        const actualizado = result.modifiedCount > 0;
        console.log(`${actualizado ? '✓' : '✗'} Estado actualizado:`, pedidoId, '->', nuevoEstado);
        if (callback) callback({ actualizado: actualizado });
      }
    }
  );
};

/**
 * Cancelar un pedido (cambiar estado a 'cancelado')
 */
this.cancelarPedido = function(pedidoId, email, callback) {
  if (!this.pedidos) {
    console.error("La colección 'pedidos' no está inicializada");
    if (callback) callback({ cancelado: false });
    return;
  }
  
  // Solo se pueden cancelar pedidos en estado 'pendiente'
  const ObjectId = require("mongodb").ObjectId;
  let query = { 
    usuarioEmail: email,
    estado: 'pendiente' // Solo pendientes se pueden cancelar
  };
  
  try {
    if (ObjectId.isValid(pedidoId)) {
      query._id = ObjectId(pedidoId);
    } else {
      query.orderId = pedidoId;
    }
  } catch (e) {
    query.orderId = pedidoId;
  }
  
  this.pedidos.updateOne(
    query,
    { 
      $set: { 
        estado: 'cancelado',
        fechaCancelacion: new Date().toISOString()
      } 
    },
    function(err, result) {
      if (err) {
        console.error("Error al cancelar pedido:", err);
        if (callback) callback({ cancelado: false });
      } else {
        const cancelado = result.modifiedCount > 0;
        console.log(`${cancelado ? '✓' : '✗'} Pedido cancelado:`, pedidoId);
        if (callback) callback({ cancelado: cancelado });
      }
    }
  );
};

/**
 * Obtener estadísticas de pedidos de un usuario
 */
this.obtenerEstadisticasPedidos = function(email, callback) {
  if (!this.pedidos) {
    console.error("La colección 'pedidos' no está inicializada");
    callback({ total: 0, gastado: 0, pendientes: 0 });
    return;
  }
  
  this.pedidos
    .find({ usuarioEmail: email })
    .toArray(function(err, pedidos) {
      if (err) {
        console.error("Error al obtener estadísticas:", err);
        callback({ total: 0, gastado: 0, pendientes: 0 });
      } else {
        const stats = {
          total: pedidos.length,
          gastado: pedidos.reduce((sum, p) => sum + (p.total || 0), 0),
          pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
          completados: pedidos.filter(p => p.estado === 'entregado').length
        };
        callback(stats);
      }
    });
};

/**
 * Obtener todos los pedidos (admin)
 */
this.obtenerTodosPedidos = function(limite, callback) {
  if (!this.pedidos) {
    console.error("La colección 'pedidos' no está inicializada");
    callback([]);
    return;
  }
  
  const limiteNum = limite || 100;
  
  this.pedidos
    .find({})
    .sort({ fecha: -1 })
    .limit(limiteNum)
    .toArray(function(err, pedidos) {
      if (err) {
        console.error("Error al obtener todos los pedidos:", err);
        callback([]);
      } else {
        callback(pedidos);
      }
    });
};

/**
 * Buscar pedidos por estado
 */
this.obtenerPedidosPorEstado = function(estado, callback) {
  if (!this.pedidos) {
    console.error("La colección 'pedidos' no está inicializada");
    callback([]);
    return;
  }
  
  this.pedidos
    .find({ estado: estado })
    .sort({ fecha: -1 })
    .toArray(function(err, pedidos) {
      if (err) {
        console.error("Error al obtener pedidos por estado:", err);
        callback([]);
      } else {
        callback(pedidos);
      }
    });
};

/**
 * Obtener pedidos recientes (últimos N días)
 */
this.obtenerPedidosRecientes = function(dias, callback) {
  if (!this.pedidos) {
    console.error("La colección 'pedidos' no está inicializada");
    callback([]);
    return;
  }
  
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - dias);
  
  this.pedidos
    .find({ 
      fecha: { 
        $gte: fechaLimite.toISOString() 
      } 
    })
    .sort({ fecha: -1 })
    .toArray(function(err, pedidos) {
      if (err) {
        console.error("Error al obtener pedidos recientes:", err);
        callback([]);
      } else {
        console.log(`✓ Pedidos recientes (últimos ${dias} días):`, pedidos.length);
        callback(pedidos);
      }
    });
};

console.log('✓ Métodos adicionales de pedidos cargados');

module.exports.CAD = CAD;