const datos = require("./cad.js");
const correo = require("./email.js");
const bcrypt = require("bcrypt");

function Sistema(test) {
  this.usuarios = {};
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
    this.cad.buscarUsuario({"email": obj.email, "confirmada": false, "key": obj.key}, function(usr) {
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
    this.cad.buscarUsuario({email: obj.email,"confirmada": true}, function (usr) {
      if (!usr) {
        callback({ "email": -1 });
      } else {
        bcrypt.compare(obj.password, usr.password, function (err, result) {
          if (result) {
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
      callback(obj);
      modelo.agregarUsuario(obj.email);  /// AQUI
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
    }
    return res;
  };

  this.numeroUsuarios = function() {
    return Object.keys(this.usuarios).length;
  };
}

function Usuario(nick) {
  this.nick = nick;
}

module.exports.Sistema = Sistema;