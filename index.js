// cliente/index.js
const path = require("path");
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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "cliente", "index.html"));
});

app.use(cookieSession({name: 'Sistema',keys: ['key1', 'key2']}));

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

// ==================== INICIALIZACIÓN ====================
setTimeout(() => {
    if (sistema.cad && sistema.cad.inicializarMenu) {
        sistema.cad.inicializarMenu((result) => {
            if (result.inicializado) {
                console.log("✓ Menú inicializado con", result.items, "items");
            }
        });
    }
}, 3000);

// ==================== AUTENTICACIÓN GOOGLE ====================

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

// ==================== AUTENTICACIÓN LOCAL ====================

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

// ==================== SESIÓN ====================

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

// ==================== USUARIOS ====================

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

// ==================== MENÚ Y PEDIDOS ====================

// Servir páginas HTML
app.get('/menu-productos.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'cliente', 'menu-productos.html'));
});

app.get('/carrito.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'cliente', 'carrito.html'));
});

app.get('/resumen-pedido.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'cliente', 'resumen-pedido.html'));
});

// API Menú
app.get("/api/menu", function(request, response) {
    if (sistema.cad && sistema.cad.obtenerMenu) {
        sistema.cad.obtenerMenu(function(menu) {
            response.json(menu);
        });
    } else {
        const menuDefault = [
            {id: 1, title: "Bocadillo de jamón", desc: "Pan, jamón, tomate", price: 4.5},
            {id: 2, title: "Bocadillo vegetal", desc: "Verduras, hummus", price: 3.9},
            {id: 3, title: "Café solo", desc: "Pequeño", price: 1.2},
            {id: 4, title: "Café con leche", desc: "Grande", price: 1.8},
            {id: 5, title: "Tortilla", desc: "Tortilla tradicional", price: 2.7},
            {id: 6, title: "Ensalada", desc: "Mix de hojas", price: 4.2}
        ];
        response.json(menuDefault);
    }
});

// API Pedidos
app.post("/api/order", function(request, response) {
    try {
        const { items, method, type } = request.body;
        
        // Obtener email del usuario (con o sin sesión)
        let email = 'invitado@cafeteria.com'; // Usuario por defecto
        
        if (request.user && request.user.email) {
            email = request.user.email;
        }
        
        if (!items || items.length === 0) {
            return response.status(400).json({ ok: false, mensaje: "Carrito vacío" });
        }
        
        const total = items.reduce((sum, item) => {
            return sum + (item.price || 0) * (item.qty || 1);
        }, 0);
        
        const pedidoData = {
            usuarioEmail: email,
            items: items,
            total: total,
            metodoPago: method || "Efectivo",
            estado: "pendiente",
            tipo: type || "local"
        };
        
        if (sistema.cad && sistema.cad.guardarPedido) {
            sistema.cad.guardarPedido(pedidoData, function(result) {
                if (result.guardado) {
                    console.log("✓ Pedido guardado:", result.orderId);
                    
                    sistema.cad.insertarLog({
                        tipoOperacion: "crearPedido",
                        usuario: email,
                        detalles: { 
                            total: total,
                            items: items.length,
                            metodo: method
                        },
                        fechaHora: new Date()
                    });
                    
                    response.json({ 
                        ok: true, 
                        orderId: result.orderId,
                        total: total.toFixed(2)
                    });
                } else {
                    response.status(500).json({ ok: false, mensaje: "Error al guardar pedido en BD" });
                }
            });
        } else {
            // Si no hay BD, generar orden simulada
            const orderId = 'ORD-' + Date.now();
            response.json({ ok: true, orderId: orderId, total: total.toFixed(2) });
        }
    } catch (error) {
        console.error("Error en /api/order:", error);
        response.status(500).json({ ok: false, mensaje: "Error interno del servidor" });
    }
});

    app.get("/api/orders", function(request, response) {
        // Obtener email del usuario (con o sin sesión)
        let email = 'invitado@cafeteria.com'; // Usuario por defecto
        
        if (request.user && request.user.email) {
            email = request.user.email;
        }
        
        console.log("📦 Cargando pedidos para:", email);
        
        if (sistema.cad && sistema.cad.obtenerPedidosUsuario) {
            sistema.cad.obtenerPedidosUsuario(email, function(pedidos) {
                console.log("✓ Pedidos encontrados:", pedidos.length);
                response.json(pedidos);
            });
        } else {
            console.warn("⚠️ No hay conexión a BD");
            response.json([]);
        }
    });

// ==================== RESERVAS ====================

app.post("/api/reserva", function(request, response) {
    try {
        const { mesa, mesas, numPersonas, fecha, horaInicio, horaFin } = request.body;
        
        // Obtener email del usuario (con o sin sesión)
        let email = 'invitado@cafeteria.com';
        if (request.user && request.user.email) {
            email = request.user.email;
        }
        
        console.log("📅 Procesando reserva:", { email, numPersonas, mesas, horaInicio, horaFin });
        
        // Validar datos básicos
        if (!numPersonas || !horaInicio || !horaFin) {
            console.error("❌ Datos incompletos en la reserva");
            return response.status(400).json({ 
                ok: false, 
                mensaje: "Datos incompletos" 
            });
        }
        
        // Validar que hay mesas seleccionadas
        const mesasReservar = mesas || (mesa ? [mesa] : []);
        if (mesasReservar.length === 0) {
            console.error("❌ No se especificaron mesas");
            return response.status(400).json({ 
                ok: false, 
                mensaje: "Debes seleccionar al menos una mesa" 
            });
        }
        
        const reservaData = {
            usuarioEmail: email,
            mesas: mesasReservar,
            numPersonas: parseInt(numPersonas),
            fecha: fecha || new Date().toISOString().split('T')[0],
            horaInicio: horaInicio,
            horaFin: horaFin,
            estado: "confirmada"
        };
        
        if (sistema.cad && sistema.cad.guardarReserva) {
            sistema.cad.guardarReserva(reservaData, function(result) {
                if (result.guardado) {
                    console.log("✅ Reserva guardada correctamente:", result.id);
                    
                    // Registrar log
                    sistema.cad.insertarLog({
                        tipoOperacion: "crearReserva",
                        usuario: email,
                        detalles: { 
                            mesas: mesasReservar,
                            numPersonas: numPersonas,
                            horario: `${horaInicio}-${horaFin}`
                        },
                        fechaHora: new Date()
                    });
                    
                    response.json({ 
                        ok: true, 
                        reservaId: result.id,
                        mensaje: "Reserva confirmada correctamente"
                    });
                } else {
                    console.error("❌ Error al guardar reserva en BD");
                    response.status(500).json({ 
                        ok: false, 
                        mensaje: "Error al guardar la reserva en la base de datos" 
                    });
                }
            });
        } else {
            console.warn("⚠️ Base de datos no disponible, simulando éxito");
            // Si no hay BD, simular éxito para desarrollo
            response.json({ 
                ok: true, 
                reservaId: 'DEMO-' + Date.now(),
                mensaje: "Reserva confirmada (modo demo)"
            });
        }
    } catch (error) {
        console.error("❌ Error en /api/reserva:", error);
        response.status(500).json({ 
            ok: false, 
            mensaje: "Error interno del servidor: " + error.message 
        });
    }
});

// Verificar disponibilidad de mesas
app.post("/api/verificar-disponibilidad", function(request, response) {
    try {
        const { fecha, horaInicio, horaFin, mesas } = request.body;
        
        if (!fecha || !horaInicio || !horaFin || !mesas) {
            return response.status(400).json({ ok: false, mensaje: "Datos incompletos" });
        }
        
        // En una versión real, aquí consultarías la BD para verificar conflictos
        // Por ahora, simulamos que las mesas 3, 7 y 11 están ocupadas
        const mesasOcupadas = [3, 7, 11];
        const conflictos = mesas.filter(mesa => mesasOcupadas.includes(mesa));
        
        if (conflictos.length > 0) {
            return response.json({ 
                ok: false, 
                disponible: false,
                conflictos: conflictos,
                mensaje: `Las mesas ${conflictos.join(', ')} no están disponibles en ese horario`
            });
        }
        
        response.json({ ok: true, disponible: true });
    } catch (error) {
        console.error("Error al verificar disponibilidad:", error);
        response.status(500).json({ ok: false, mensaje: "Error interno" });
    }
});

// Obtener reservas del usuario
app.get("/api/reservas", function(request, response) {
    try {
        // Obtener email del usuario (con o sin sesión)
        let email = 'invitado@cafeteria.com';
        if (request.user && request.user.email) {
            email = request.user.email;
        }
        
        console.log("📋 Cargando reservas para:", email);
        
        if (sistema.cad && sistema.cad.obtenerReservasUsuario) {
            sistema.cad.obtenerReservasUsuario(email, function(reservas) {
                console.log("✓ Reservas encontradas:", reservas.length);
                response.json(reservas);
            });
        } else {
            console.warn("⚠️ No hay conexión a BD");
            response.json([]);
        }
    } catch (error) {
        console.error("❌ Error en /api/reservas:", error);
        response.status(500).json([]);
    }
});

// Cancelar reserva
app.post("/api/cancelar-reserva", function(request, response) {
    try {
        const { reservaId } = request.body;
        
        if (!reservaId) {
            return response.status(400).json({ ok: false, mensaje: "ID de reserva no especificado" });
        }
        
        const ObjectId = require("mongodb").ObjectId;
        
        if (sistema.cad && sistema.cad.reservas) {
            sistema.cad.reservas.updateOne(
                { _id: ObjectId(reservaId) },
                { $set: { estado: 'cancelada', fechaCancelacion: new Date().toISOString() } },
                function(err, result) {
                    if (err) {
                        console.error("Error al cancelar reserva:", err);
                        response.status(500).json({ ok: false, mensaje: "Error al cancelar" });
                    } else if (result.modifiedCount > 0) {
                        console.log("✓ Reserva cancelada:", reservaId);
                        response.json({ ok: true, mensaje: "Reserva cancelada correctamente" });
                    } else {
                        response.json({ ok: false, mensaje: "Reserva no encontrada" });
                    }
                }
            );
        } else {
            response.json({ ok: true, mensaje: "Reserva cancelada (modo demo)" });
        }
    } catch (error) {
        console.error("Error al cancelar reserva:", error);
        response.status(500).json({ ok: false, mensaje: "Error interno" });
    }
});

// ==================== WEBSOCKETS ====================

let ws = new moduloWS.ServidorWS();
ws.lanzarServidor(io, sistema);

// ==================== INICIAR SERVIDOR ====================

httpServer.listen(PORT, () => {
    console.log('\n🚀 ===================================');
    console.log('   SERVIDOR CAFETERÍA INICIADO');
    console.log('   ===================================');
    console.log(`\n📱 Puerto: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log('\n✨ Funcionalidades activas:');
    console.log('   ✓ Autenticación (Local + Google)');
    console.log('   ✓ Sistema de chats y grupos');
    console.log('   ✓ Menú de productos');
    console.log('   ✓ Pedidos con persistencia');
    //console.log('   ✓ Sistema de reservas');
    console.log('\n🛑 Ctrl+C para salir\n');
});