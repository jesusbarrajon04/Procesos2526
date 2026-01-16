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
        
        // Mapa de usuarios conectados: email -> socketId
        const usuariosConectados = new Map();
        
        io.on('connection', function(socket) {
            console.log("🔌 WebSocket conectado:", socket.id);

            // ==================== CONEXIÓN DE USUARIO ====================
            
            socket.on('user_connected', (userData) => {
                const { userId, email, name } = userData;
                
                usuariosConectados.set(email, {
                    socketId: socket.id,
                    email,
                    name,
                    userId
                });
                
                console.log("✓ Usuario conectado:", email);
                
                // Notificar a todos los usuarios online
                const listaOnline = Array.from(usuariosConectados.values()).map(u => ({
                    userId: u.userId,
                    email: u.email,
                    name: u.name
                }));
                
                io.emit('online_users', listaOnline);
            });

            // ==================== GESTIÓN DE GRUPOS ====================
            
            socket.on("crearGrupo", function(datos) {
                console.log("📝 Solicitud crear grupo:", datos);
                
                const nombreGrupo = datos.nombreGrupo || "Grupo de cafetería";
                const esPrivado = datos.privado || false;
                let codigo = sistema.crearGrupo(datos.email, nombreGrupo, esPrivado);
                
                if (codigo !== -1) {
                    socket.join(codigo);
                    console.log(`✓ Usuario ${datos.email} creó grupo ${codigo}`);
                    
                    srv.enviarAlRemitente(socket, "grupoCreado", {
                        codigo: codigo,
                        nombre: nombreGrupo,
                        mensaje: "Grupo creado correctamente",
                        estado: "abierto",
                        privado: esPrivado
                    });
                    
                    // Actualizar lista de grupos para todos
                    let lista = sistema.obtenerGruposDisponibles();
                    srv.enviarATodosMenosRemitente(socket, "listaGrupos", lista);
                } else {
                    srv.enviarAlRemitente(socket, "errorGrupo", {
                        mensaje: "No se pudo crear el grupo"
                    });
                }
            });

            socket.on("unirseAlGrupo", function(datos) {
                console.log("🤝 Solicitud unirse al grupo:", datos);
                
                const invitado = datos.invitado || false;
                let resultado = sistema.unirseAlGrupo(datos.email, datos.codigo, invitado);
                
                if (resultado.resultado !== -1) {
                    socket.join(datos.codigo);
                    console.log(`✓ Usuario ${datos.email} se unió al grupo ${datos.codigo}`);
                    
                    srv.enviarAlRemitente(socket, "unidoAlGrupo", {
                        codigo: datos.codigo,
                        mensaje: resultado.mensaje,
                        estado: resultado.estado,
                        miembros: resultado.miembros
                    });
                    
                    // Enviar mensaje de sistema a todos en el grupo
                    if (resultado.mensajeSistema) {
                        srv.enviarASala(io, datos.codigo, "mensajeGrupo", {
                            codigo: datos.codigo,
                            mensaje: resultado.mensajeSistema
                        });
                    }
                    
                    // Notificar a todos en el grupo
                    srv.enviarASala(io, datos.codigo, "nuevoMiembro", {
                        email: datos.email,
                        codigo: datos.codigo,
                        miembros: resultado.miembros
                    });
                    
                    // Actualizar lista de grupos
                    let lista = sistema.obtenerGruposDisponibles();
                    io.emit("listaGrupos", lista);
                } else {
                    srv.enviarAlRemitente(socket, "errorGrupo", {
                        mensaje: resultado.mensaje
                    });
                }
            });

            socket.on("salirDelGrupo", function(datos) {
                console.log("🚪 Solicitud salir del grupo:", datos);
                
                let resultado = sistema.salirDelGrupo(datos.email, datos.codigo);
                
                if (resultado.resultado !== -1) {
                    console.log(`✓ Usuario ${datos.email} salió del grupo ${datos.codigo}`);
                    
                    // Notificar al usuario
                    srv.enviarAlRemitente(socket, "salidaDelGrupo", {
                        codigo: datos.codigo,
                        mensaje: resultado.mensaje,
                        estado: resultado.estado
                    });
                    
                    // Enviar mensaje de sistema a todos en el grupo
                    if (resultado.mensajeSistema) {
                        srv.enviarASala(io, datos.codigo, "mensajeGrupo", {
                            codigo: datos.codigo,
                            mensaje: resultado.mensajeSistema
                        });
                    }
                    
                    // Notificar a todos en el grupo
                    srv.enviarASala(io, datos.codigo, "miembroSalio", {
                        email: datos.email,
                        codigo: datos.codigo,
                        estado: resultado.estado,
                        nuevoCreador: resultado.nuevoCreador
                    });
                    
                    socket.leave(datos.codigo);
                    
                    // Actualizar lista de grupos
                    let lista = sistema.obtenerGruposDisponibles();
                    io.emit("listaGrupos", lista);
                } else {
                    srv.enviarAlRemitente(socket, "errorGrupo", {
                        mensaje: resultado.mensaje
                    });
                }
            });

            socket.on("obtenerGrupos", function() {
                console.log("📋 Solicitud obtener grupos");
                
                let lista = sistema.obtenerGruposDisponibles();
                srv.enviarAlRemitente(socket, "listaGrupos", lista);
            });

            socket.on("obtenerMiGrupo", function(datos) {
                console.log("🔍 Solicitud obtener mi grupo:", datos.email);
                
                let grupo = sistema.obtenerGrupoUsuario(datos.email);
                srv.enviarAlRemitente(socket, "miGrupo", grupo);
            });

            // ==================== INVITACIONES Y SOLICITUDES ====================
            
            socket.on("invitarUsuarioGrupo", function(datos) {
                console.log("📨 Invitación a grupo:", datos);
                
                const { codigo, invitado, invitador } = datos;
                
                // Enviar mensaje privado con la invitación
                const recipient = usuariosConectados.get(invitado);
                
                if (recipient) {
                    io.to(recipient.socketId).emit('invitacion_grupo', {
                        codigo: codigo,
                        invitador: invitador,
                        mensaje: `${invitador} te ha invitado a unirte al grupo ${codigo}`
                    });
                    
                    srv.enviarAlRemitente(socket, "invitacion_enviada", {
                        mensaje: `Invitación enviada a ${invitado}`
                    });
                } else {
                    srv.enviarAlRemitente(socket, "error_invitacion", {
                        mensaje: "El usuario no está conectado"
                    });
                }
            });

            socket.on("solicitarUnionGrupo", function(datos) {
                console.log("📋 Solicitud de unión:", datos);
                
                let resultado = sistema.solicitarUnionGrupo(datos.email, datos.codigo);
                
                if (resultado.resultado !== -1) {
                    // Enviar mensaje de solicitud a todos en el grupo
                    srv.enviarASala(io, datos.codigo, "mensajeGrupo", {
                        codigo: datos.codigo,
                        mensaje: resultado.mensajeSolicitud
                    });
                    
                    srv.enviarAlRemitente(socket, "solicitud_enviada", {
                        mensaje: resultado.mensaje
                    });
                } else {
                    srv.enviarAlRemitente(socket, "errorGrupo", {
                        mensaje: resultado.mensaje
                    });
                }
            });

            socket.on("responderSolicitud", function(datos) {
                console.log("✅ Respuesta a solicitud:", datos);
                
                const { codigo, solicitante, aprobado, email } = datos;
                
                let resultado = sistema.responderSolicitud(codigo, solicitante, aprobado, email);
                
                if (resultado.resultado !== -1) {
                    // Enviar mensaje de respuesta a todos en el grupo
                    if (resultado.mensajeRespuesta) {
                        srv.enviarASala(io, codigo, "mensajeGrupo", {
                            codigo: codigo,
                            mensaje: resultado.mensajeRespuesta
                        });
                    }
                    
                    // Si fue aprobado, notificar al solicitante
                    if (resultado.aprobado) {
                        const recipient = usuariosConectados.get(solicitante);
                        if (recipient) {
                            io.to(recipient.socketId).emit('solicitud_aprobada', {
                                codigo: codigo,
                                mensaje: `Tu solicitud para unirte al grupo ${codigo} ha sido aprobada`
                            });
                        }
                        
                        // Actualizar lista de grupos
                        let lista = sistema.obtenerGruposDisponibles();
                        io.emit("listaGrupos", lista);
                    }
                    
                    srv.enviarAlRemitente(socket, "respuesta_enviada", {
                        mensaje: resultado.mensaje
                    });
                } else {
                    srv.enviarAlRemitente(socket, "errorGrupo", {
                        mensaje: resultado.mensaje
                    });
                }
            });

            // ==================== MENSAJES DE GRUPO ====================
            
            socket.on("enviarMensajeGrupo", function(datos) {
                console.log("💬 Mensaje al grupo:", datos.codigo);
                
                let resultado = sistema.enviarMensajeGrupo(
                    datos.email, 
                    datos.codigo, 
                    datos.mensaje
                );
                
                if (resultado.resultado !== -1) {
                    // Enviar mensaje a todos en el grupo (incluyendo al remitente)
                    srv.enviarASala(io, datos.codigo, "mensajeGrupo", {
                        codigo: datos.codigo,
                        mensaje: resultado.mensaje
                    });
                    
                    // Guardar en BD (opcional, para persistencia)
                    if (sistema.cad && sistema.cad.guardarMensaje) {
                        sistema.cad.guardarMensaje({
                            grupoId: datos.codigo,
                            autor: datos.email,
                            mensaje: datos.mensaje,
                            fecha: resultado.mensaje.fecha,
                            tipo: "texto"
                        });
                    }
                } else {
                    srv.enviarAlRemitente(socket, "errorMensaje", {
                        mensaje: resultado.mensaje
                    });
                }
            });

            socket.on("obtenerMensajesGrupo", function(datos) {
                console.log("📜 Solicitud mensajes del grupo:", datos.codigo);
                
                let mensajes = sistema.obtenerMensajesGrupo(datos.codigo, datos.limite || 50);
                srv.enviarAlRemitente(socket, "mensajesGrupo", {
                    codigo: datos.codigo,
                    mensajes: mensajes
                });
            });

            socket.on("usuarioEscribiendo", function(datos) {
                // Notificar a otros en el grupo que alguien está escribiendo
                socket.to(datos.codigo).emit("alguienEscribiendo", {
                    codigo: datos.codigo,
                    email: datos.email,
                    escribiendo: datos.escribiendo
                });
            });

            // ==================== MENSAJES PRIVADOS ====================
            
            socket.on('private_message', ({ to, from, message, fromName }) => {
                const recipient = usuariosConectados.get(to);
                
                console.log(`💌 Mensaje privado: ${from} → ${to}`);
                
                // Guardar mensaje en BD SIEMPRE (aunque el destinatario esté offline)
                if (sistema.cad && sistema.cad.guardarMensaje) {
                    sistema.cad.guardarMensaje({
                        autor: from,
                        destinatario: to,
                        mensaje: message,
                        tipo: "privado",
                        fecha: new Date().toISOString(),
                        leido: false
                    }, function(result) {
                        if (result.guardado) {
                            console.log("✓ Mensaje privado guardado en BD");
                        }
                    });
                }
                
                // Enviar al destinatario (si está online)
                if (recipient) {
                    io.to(recipient.socketId).emit('receive_message', {
                        from,
                        fromName,
                        message,
                        timestamp: new Date().toISOString()
                    });
                    
                    console.log(`✓ Mensaje enviado a ${to} (online)`);
                } else {
                    console.log(`⚠️ Usuario ${to} offline - mensaje guardado en BD`);
                }
                
                // Confirmar al remitente SIEMPRE (aunque el destinatario esté offline)
                socket.emit('message_sent', {
                    to,
                    message,
                    timestamp: new Date().toISOString()
                });
            });

            socket.on('cargar_mensajes_privados', ({ usuario1, usuario2 }) => {
                console.log(`📜 Cargando mensajes entre ${usuario1} y ${usuario2}`);
                
                if (sistema.cad && sistema.cad.obtenerMensajesPrivados) {
                    sistema.cad.obtenerMensajesPrivados(usuario1, usuario2, 100, function(mensajes) {
                        socket.emit('mensajes_privados_cargados', {
                            usuario1,
                            usuario2,
                            mensajes: mensajes
                        });
                        console.log(`✓ ${mensajes.length} mensajes privados enviados al cliente`);
                    });
                } else {
                    socket.emit('mensajes_privados_cargados', {
                        usuario1,
                        usuario2,
                        mensajes: []
                    });
                }
            });

            // ==================== DESCONEXIÓN ====================
            
            socket.on("disconnect", function() {
                console.log("❌ Socket desconectado:", socket.id);
                
                // Buscar y eliminar usuario de la lista
                for (const [email, userData] of usuariosConectados.entries()) {
                    if (userData.socketId === socket.id) {
                        usuariosConectados.delete(email);
                        console.log("✓ Usuario desconectado:", email);
                        
                        // Actualizar lista de usuarios online
                        const listaOnline = Array.from(usuariosConectados.values()).map(u => ({
                            userId: u.userId,
                            email: u.email,
                            name: u.name
                        }));
                        
                        io.emit('online_users', listaOnline);
                        break;
                    }
                }
            });
        });
    };
}

module.exports.ServidorWS = ServidorWS;