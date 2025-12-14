function ServidorWS() {
    
    this.enviarAlRemitente = function(socket, mensaje, datos) {
        socket.emit(mensaje, datos);
    };

    this.enviarATodosMenosRemitente = function(socket, mensaje, datos) {
        socket.broadcast.emit(mensaje, datos);
    };

    this.enviarATodos = function(io, mensaje, datos) {
        io.emit(mensaje, datos);
    };

    this.enviarASala = function(io, sala, mensaje, datos) {
        io.to(sala).emit(mensaje, datos);
    };

    this.lanzarServidor = function(io, sistema) {
        let srv = this;
        
        io.on('connection', function(socket) {
            console.log("Capa WS activa - Cliente conectado:", socket.id);

            socket.on("crearPartida", function(datos) {
                console.log("Solicitud crear partida:", datos);
                
                let codigo = sistema.crearPartida(datos.email);
                
                if (codigo !== -1) {
                    socket.join(codigo);
                    console.log(`Usuario ${datos.email} creó partida ${codigo}`);
                    
                    srv.enviarAlRemitente(socket, "partidaCreada", {
                        codigo: codigo,
                        mensaje: "Partida creada correctamente",
                        estado: "esperando"
                    });
                    
                    let lista = sistema.obtenerPartidasDisponibles();
                    srv.enviarATodosMenosRemitente(socket, "listaPartidas", lista);
                } else {
                    srv.enviarAlRemitente(socket, "errorPartida", {
                        mensaje: "No se pudo crear la partida"
                    });
                }
            });

            socket.on("unirAPartida", function(datos) {
                console.log("Solicitud unir a partida:", datos);
                
                let resultado = sistema.unirAPartida(datos.email, datos.codigo);
                
                if (resultado.resultado !== -1) {
                    socket.join(datos.codigo);
                    console.log(`Usuario ${datos.email} se unió a partida ${datos.codigo}`);
                    
                    srv.enviarAlRemitente(socket, "unidoAPartida", {
                        codigo: datos.codigo,
                        mensaje: resultado.mensaje,
                        estado: resultado.estado
                    });
                    
                    if (resultado.estado === "enCurso") {
                        srv.enviarASala(io, datos.codigo, "partidaComenzada", {
                            codigo: datos.codigo,
                            mensaje: "¡La partida comienza!",
                            estado: "enCurso"
                        });
                    } else {
                        srv.enviarASala(io, datos.codigo, "nuevoJugador", {
                            email: datos.email,
                            codigo: datos.codigo
                        });
                    }
                    
                    let lista = sistema.obtenerPartidasDisponibles();
                    io.emit("listaPartidas", lista);
                } else {
                    srv.enviarAlRemitente(socket, "errorPartida", {
                        mensaje: resultado.mensaje
                    });
                }
            });

            socket.on("abandonarPartida", function(datos) {
                console.log("Solicitud abandonar partida:", datos);
                
                let resultado = sistema.abandonarPartida(datos.email, datos.codigo);
                
                if (resultado.resultado !== -1) {
                    console.log(`Usuario ${datos.email} abandonó partida ${datos.codigo}`);
                    
                    srv.enviarASala(io, datos.codigo, "partidaAbandonada", {
                        codigo: datos.codigo,
                        abandonadoPor: datos.email,
                        mensaje: `${datos.email} ha abandonado la partida`,
                        estado: "finalizada"
                    });
                    
                    socket.leave(datos.codigo);
                    
                    let lista = sistema.obtenerPartidasDisponibles();
                    io.emit("listaPartidas", lista);
                } else {
                    srv.enviarAlRemitente(socket, "errorPartida", {
                        mensaje: resultado.mensaje
                    });
                }
            });

            socket.on("obtenerPartidas", function() {
                console.log("Solicitud obtener partidas");
                
                let lista = sistema.obtenerPartidasDisponibles();
                srv.enviarAlRemitente(socket, "listaPartidas", lista);
            });

            socket.on("obtenerMiPartida", function(datos) {
                console.log("Solicitud obtener mi partida:", datos.email);
                
                let partida = sistema.obtenerPartidaUsuario(datos.email);
                srv.enviarAlRemitente(socket, "miPartida", partida);
            });

            socket.on("disconnect", function() {
                console.log("Cliente desconectado:", socket.id);
            });
        });
    };
}

module.exports.ServidorWS = ServidorWS;