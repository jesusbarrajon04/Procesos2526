const path = require("path");
const fs = require("fs");
const express = require('express');
const app = express();
const passport = require("passport");
const cookieSession = require("cookie-session");
require("./servidor/passport-setup.js");
require("dotenv").config();
const bodyParser = require("body-parser");
const LocalStrategy = require('passport-local').Strategy;
const modelo = require("./servidor/modelo.js");
const PORT = process.env.PORT || 3000;
const httpServer = require('http').Server(app);
const { Server } = require("socket.io");
const io = new Server(httpServer);
const moduloWS = require("./servidor/servidorWS.js");

app.use(express.static(path.join(__dirname, "cliente")));

/*
app.get("/", function (request, response) {
    var contenido = fs.readFileSync(__dirname + "/cliente/index.html");
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
});
*/
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "cliente", "index.html"));
});

app.use(cookieSession({name: 'Sistema',keys: ['key1', 'key2']
}));

// este método puede ser innecesario
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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

passport.use(new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    function (email, password, done) {
        sistema.loginUsuario({ "email": email, "password": password }, 
        function (user) {
            return done(null, user);
        })
    }
));

const haIniciado = function (request, response, next) {
    if (request.user) {
        next();
    } else {
        response.redirect("/")
    }
};

let sistema = new modelo.Sistema({test: false});

app.get("/auth/google", 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/fallo' }),
    function (req, res) {
        res.redirect('/good');
    }
);

app.post('/oneTap/callback',
    passport.authenticate('google-one-tap', { failureRedirect: '/fallo' }),
    function (req, res) {
        res.redirect('/good');
    }
);

app.get("/good", function (request, response) {
    if (!request.user) {
        console.error("No se pudo obtener información del usuario");
        return response.redirect("/fallo");
    }

    let email;
    
    if (request.user.emails && request.user.emails[0]) {
        email = request.user.emails[0].value;
    } else if (request.user.email) {
        email = request.user.email;
    } else if (request.user._json && request.user._json.email) {
        email = request.user._json.email;
    } else {
        console.error("No se pudo extraer el email");
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

app.get("/fallo", function (request, response) {
    response.send({ nick: "nook" })
});

app.get("/cerrarSesion", haIniciado, function (request, response) {
  let nick = request.user?.email || request.user?.nick;
  request.logout(function(err) {
  if (err) { console.error("Error al cerrar sesión:", err); }
  });

  if (nick) {
    sistema.eliminarUsuario(nick);
    console.log("Usuario eliminado del sistema:", nick);
  }

  response.redirect("/");
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
});

app.post('/loginUsuario', 
    passport.authenticate("local", { 
        failureRedirect: "/fallo", 
        successRedirect: "/ok" 
    })
);

app.get("/ok", function (request, response) {
    response.send({ nick: request.user.email })
});

app.get("/agregarUsuario/:nick", function (request, response) {
    let nick = request.params.nick;
    let res = sistema.agregarUsuario(nick);
    response.send(res);
});

app.get("/obtenerUsuarios", haIniciado, function (request, response) {
    let res = sistema.obtenerUsuarios();
    response.send(res);
});

app.get("/eliminarUsuario/:nick", function (request, response) {
    let nick = request.params.nick;
    let res = sistema.eliminarUsuario(nick);
    response.send(res);
});

app.get("/numeroUsuarios", haIniciado, function (request, response) {
    let num = sistema.numeroUsuarios();
    response.send({ "numero": num });
});

app.get("/usuarioActivo/:nick", function (request, response) {
    let nick = request.params.nick;
    let res = sistema.usuarioActivo(nick);
    response.send({ "activo": res });
});

app.get("/obtenerLogs", haIniciado, function(request, response) {
    sistema.cad.obtenerLogs({}, function(logs) {
        response.send(logs);
    });
});

app.get("/obtenerLogs/:tipo", haIniciado, function(request, response) {
    let tipo = request.params.tipo;
    sistema.cad.obtenerLogs({ tipoOperacion: tipo }, function(logs) {
        response.send(logs);
    });
});

app.get("/obtenerLogsUsuario/:email", haIniciado, function(request, response) {
    let email = request.params.email;
    sistema.cad.obtenerLogs({ usuario: email }, function(logs) {
        response.send(logs);
    });
});

let ws = new moduloWS.ServidorWS();
ws.lanzarServidor(io, sistema);

httpServer.listen(PORT, () => {
    console.log(`App está escuchando en el puerto ${PORT}`);
    console.log('Ctrl+C para salir');
});