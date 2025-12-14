const mongo = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

function CAD() {
  this.usuarios = null;
  this.logs = null;
  this.client = null;

  this.conectar = async function(callback) {
    try {
      let cad = this;
      let stringConexion = process.env.CONEXION_STRING;
      let client = new mongo(stringConexion);
      await client.connect();
      console.log("Conectado a Mongo Atlas...");
      
      const database = client.db("sistema");
      cad.usuarios = database.collection("usuarios");
      cad.logs = database.collection("logs");
      
      callback(database);
    } catch (error) {
      console.error("Error al conectar a MongoDB:", error);
      throw error;
    }
  };

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

module.exports.CAD = CAD;