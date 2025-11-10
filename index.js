const path = require("path");
const fs = require("fs");
const express = require("express");
const app = express();
const passport = require("passport");
const cookieSession = require("cookie-session");
require("./servidor/passport-setup.js");
const bodyParser = require("body-parser");
const LocalStrategy = require('passport-local').Strategy;
const modelo = require("./servidor/modelo.js");
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "cliente")));

app.use(cookieSession({ name: 'Sistema', keys: ['key1', 'key2'] }));

app.use((req, res, next) => {
  if (req.session && !req.session.regenerate) {
    req.session.regenerate = (cb) => cb();
  }
  if (req.session && !req.session.save) {
    req.session.save = (cb) => cb();
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new
    LocalStrategy({ usernameField: "email", passwordField: "password" },
      function (email, password, done) {
        sistema.loginUsuario({ "email": email, "password": password }, 
          function (user) {
                return done(null, user);
          })
      }
));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let sistema = new modelo.Sistema({test:false});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "cliente", "index.html"));
});

app.get("/auth/google",passport.authenticate('google', { scope: ['profile','email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/fallo' }), 
function(req, res) { 
  res.redirect('/good'); 
});

app.post('/oneTap/callback',
  passport.authenticate('google-one-tap', { failureRedirect: '/fallo' }),
  function (req, res) {
      res.redirect('/good');
  });

/*
app.get("/good", function (request, response) {
  let email = request.user.emails[0].value;
  sistema.usuarioGoogle({ "email": email }, function (obj) {
      response.cookie('nick', obj.email);
      response.redirect('/');
  });
});
*/

app.get("/good", function (request, response) {
  if (!request.user) {
    console.error("No se pudo obtener información del usuario");
    return response.redirect("/fallo");
  }

  let email;
  
  if (request.user.emails && request.user.emails[0]) {
    email = request.user.emails[0].value;
    console.log("Usuario de OAuth 2.0:", email);
  } else if (request.user.email) {
    email = request.user.email;
    console.log("Usuario de One Tap:", email);
  } else if (request.user._json && request.user._json.email) {
    email = request.user._json.email;
    console.log("Usuario formato alternativo:", email);
  } else {
    console.error("No se pudo extraer el email del usuario");
    console.log("Estructura del usuario:", JSON.stringify(request.user));
    return response.redirect("/fallo");
  }

  console.log("Procesando usuario Google:", email);
  
  sistema.usuarioGoogle({ "email": email }, function (obj) {
    if (obj && obj.email && obj.email !== -1) {
      console.log("Usuario registrado/encontrado:", obj.email);
      response.cookie("nick", obj.email);
      response.redirect("/");
    } else {
      console.error("Error al procesar usuario:", obj);
      response.redirect("/fallo");
    }
  });
});

app.get("/fallo", function (req, res) {
  res.send({ nick: "nook" });
});

app.post("/registrarUsuario", function (request, response) {
    sistema.registrarUsuario(request.body, function (res) {
        response.send({ "nick": res.email });
    });
});

app.get("/confirmarUsuario/:email/:key", function (request, response) {
    let email = request.params.email;
    let key = request.params.key;
    sistema.confirmarUsuario({ "email": email, "key": key }, function (usr) {
        if (usr.email != -1) {
            response.cookie('nick', usr.email);
        }
        response.redirect('/');
    });
})

app.post('/loginUsuario', 
  passport.authenticate("local", { failureRedirect: "/fallo", successRedirect: "/ok" }
));

app.get("/ok", function (request, response) {
    response.send({ nick: request.user.email })
});

app.get("/agregarUsuario/:nick",function(request,response){
  let nick=request.params.nick; 
  let res=sistema.agregarUsuario(nick);
  response.send(res); 
});

app.get("/obtenerUsuarios", function (request, response) {
  let res = sistema.obtenerUsuarios();
  response.send(res);
});

app.get("/usuarioActivo/:nick", function (request, response) {
  let nick = request.params.nick;
  let activo = sistema.usuarioActivo(nick);
  response.send({ activo: activo });
});

app.get("/numeroUsuarios", function (request, response) {
  let num = sistema.numeroUsuarios();
  response.send({ num: num });
});

app.get("/eliminarUsuario/:nick", function (request, response) {
  let nick = request.params.nick;
  sistema.eliminarUsuario(nick);
  response.send({ eliminado: nick });
});

app.listen(PORT, () => {
  console.log(`App está escuchando en el puerto ${PORT}`);
  console.log("Ctrl+C para salir");
});


// cd C:\Repositorios\Procesos2526
// C:\Users\Jesús\AppData\Local\Google\Cloud SDK
// Service URL: https://prototipo1-817150573239.europe-west1.run.app

// console.cloud.google.com
// mongodb+srv://Jesus:<db_password>@cluster0.pmubedt.mongodb.net/?appName=Cluster0