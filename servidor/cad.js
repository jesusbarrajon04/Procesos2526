
const mongo = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

function CAD() {
  this.usuarios = null;
  this.client=null;

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

  this.conectar = async function(callback) {
    try {
      let cad = this;
      let client = new mongo("mongodb+srv://jesus:Procesos2526@cluster0.pmubedt.mongodb.net/?appName=Cluster0");
      await client.connect();
      console.log("Conectado a Mongo Atlas...");
      
      const database = client.db("sistema");
      cad.usuarios = database.collection("usuarios");
      
      callback(database);
    } catch (error) {
      console.error("Error al conectar a MongoDB:", error);
      throw error;
    }
  };

  this.actualizarUsuario = function (obj, callback) {
    actualizar(this.usuarios, obj, callback);
  }


  function buscarOCrear(coleccion, criterio, callback) {
  coleccion.findOneAndUpdate(criterio,{ $set: criterio },
    { 
      upsert: true, 
      returnDocument: "after", 
      projection: { email: 1 } 
    },function (err, doc) {
        if (err) {
        console.error("Error en buscarOCrear:", err);
        throw err;
        } else {
        console.log("Usuario encontrado/creado:", doc.value.email);
        callback({ email: doc.value.email });
        }
    });
  }

  function buscar(coleccion, criterio, callback) {
    coleccion.find(criterio).toArray(function (error, usuarios) {
        if (usuarios.length == 0) {
            callback(undefined);
        }
        else {
            callback(usuarios[0]);
        }
    });
  }

  function insertar(coleccion, elemento, callback) {
    coleccion.insertOne(elemento, function (err, result) {
        if (err) {
            console.log("error");
        }
        else {
            console.log("Nuevo elemento creado");
            callback(elemento);
        }
    });
  }

  function actualizar(coleccion, obj, callback) {
    coleccion.findOneAndUpdate({ _id: ObjectId(obj._id) }, { $set: obj },
      { upsert: false, returnDocument: "after", projection: { email: 1 } },
      function (err, doc) {
        if (err) { throw err; }
        if (!doc.value) {
          callback({ email: -1 });
        }
        else {
          console.log("Elemento actualizado");
          callback({ email: doc.value.email });
        }
    });
  }

}
module.exports.CAD = CAD;