function ClienteWS() {
    this.socket = undefined;
    this.email = undefined;
    this.codigo = undefined;

    this.ini = function() {
        this.socket = io();
        this.lanzarServidorWS();
    };

    // ==================== GESTIÓN DE CONEXIÓN ====================
    
    this.conectarUsuario = function(userData) {
        if (!this.email) {
            console.error("No hay email definido");
            return;
        }
        
        console.log("Conectando usuario al WebSocket:", this.email);
        this.socket.emit("user_connected", {
            userId: userData.userId || this.email,
            email: this.email,
            name: userData.name || this.email
        });
    };

    // ==================== GRUPOS ====================
    
    this.crearGrupo = function(nombreGrupo, esPrivado) {
        if (!this.email) {
            console.error("No hay email definido. Inicia sesión primero.");
            mostrarSalida("❌ Debes iniciar sesión para crear un grupo");
            return;
        }
        
        console.log("Enviando solicitud crear grupo para:", this.email);
        this.socket.emit("crearGrupo", { 
            email: this.email,
            nombreGrupo: nombreGrupo || "Grupo de cafetería",
            privado: esPrivado || false
        });
    };

    this.unirseAlGrupo = function(codigo, invitado) {
        if (!this.email) {
            console.error("No hay email definido. Inicia sesión primero.");
            mostrarSalida("❌ Debes iniciar sesión para unirte a un grupo");
            return;
        }
        
        console.log("Enviando solicitud unir al grupo:", codigo);
        this.socket.emit("unirseAlGrupo", { 
            email: this.email, 
            codigo: codigo,
            invitado: invitado || false
        });
    };

    this.salirDelGrupo = function(codigo) {
        if (!this.email) {
            console.error("No hay email definido");
            return;
        }
        
        console.log("Enviando solicitud salir del grupo:", codigo);
        this.socket.emit("salirDelGrupo", {
            email: this.email,
            codigo: codigo
        });
    };

    this.obtenerGrupos = function() {
        console.log("Solicitando lista de grupos");
        this.socket.emit("obtenerGrupos");
    };

    this.obtenerMiGrupo = function() {
        if (!this.email) return;
        console.log("Solicitando mi grupo");
        this.socket.emit("obtenerMiGrupo", { email: this.email });
    };

    // ==================== MENSAJES DE GRUPO ====================
    
    this.enviarMensajeGrupo = function(codigo, mensaje) {
        if (!this.email || !codigo || !mensaje) {
            console.error("Faltan datos para enviar mensaje");
            return;
        }
        
        this.socket.emit("enviarMensajeGrupo", {
            email: this.email,
            codigo: codigo,
            mensaje: mensaje
        });
    };

    this.obtenerMensajesGrupo = function(codigo, limite) {
        if (!codigo) return;
        
        this.socket.emit("obtenerMensajesGrupo", {
            codigo: codigo,
            limite: limite || 50
        });
    };

    this.indicarEscribiendo = function(codigo, escribiendo) {
        if (!this.email || !codigo) return;
        
        this.socket.emit("usuarioEscribiendo", {
            email: this.email,
            codigo: codigo,
            escribiendo: escribiendo
        });
    };

    // ==================== MENSAJES PRIVADOS ====================
    
    this.enviarMensajePrivado = function(destinatarioEmail, mensaje, nombreRemitente) {
        if (!this.email || !destinatarioEmail || !mensaje) {
            console.error("Faltan datos para enviar mensaje privado");
            return;
        }
        
        console.log("Enviando mensaje privado a:", destinatarioEmail);
        this.socket.emit("private_message", {
            to: destinatarioEmail,
            from: this.email,
            fromName: nombreRemitente || this.email,
            message: mensaje
        });
    };

    // ==================== INVITACIONES Y SOLICITUDES ====================
    
    this.invitarUsuarioGrupo = function(codigo, invitado) {
        if (!this.email || !codigo || !invitado) {
            console.error("Faltan datos para invitar");
            return;
        }
        
        console.log("Invitando a", invitado, "al grupo", codigo);
        this.socket.emit("invitarUsuarioGrupo", {
            codigo: codigo,
            invitado: invitado,
            invitador: this.email
        });
    };

    this.solicitarUnionGrupo = function(codigo) {
        if (!this.email || !codigo) {
            console.error("Faltan datos para solicitar unión");
            return;
        }
        
        console.log("Solicitando unirse al grupo", codigo);
        this.socket.emit("solicitarUnionGrupo", {
            email: this.email,
            codigo: codigo
        });
    };

    this.responderSolicitud = function(codigo, solicitante, aprobado) {
        if (!this.email || !codigo || !solicitante) {
            console.error("Faltan datos para responder solicitud");
            return;
        }
        
        console.log("Respondiendo solicitud:", aprobado ? "APROBAR" : "RECHAZAR");
        this.socket.emit("responderSolicitud", {
            codigo: codigo,
            solicitante: solicitante,
            aprobado: aprobado,
            email: this.email
        });
    };

    // ==================== LISTENERS DEL SERVIDOR ====================
    
    this.lanzarServidorWS = function() {
        let cli = this;

        // ========== USUARIOS ONLINE ==========
        
        this.socket.on("online_users", function(listaUsuarios) {
            console.log("👥 Usuarios online actualizados:", listaUsuarios);
            
            if (typeof cw !== 'undefined' && cw.actualizarUsuariosOnline) {
                cw.actualizarUsuariosOnline(listaUsuarios);
            }
        });

        // ========== GRUPOS ==========
        
        this.socket.on("grupoCreado", function(datos) {
            console.log("✓ Grupo creado:", datos);
            cli.codigo = datos.codigo;
            mostrarSalida(`✓ Grupo creado: ${datos.nombre}`);
            mostrarSalida(`Código: ${datos.codigo}`);
            
            if (typeof cw !== 'undefined' && cw.mostrarGrupoCreado) {
                cw.mostrarGrupoCreado(datos);
            }
        });

        this.socket.on("unidoAlGrupo", function(datos) {
            console.log("✓ Unido al grupo:", datos);
            cli.codigo = datos.codigo;
            mostrarSalida(`✓ Te has unido al grupo: ${datos.codigo}`);
            
            if (typeof cw !== 'undefined' && cw.mostrarGrupoActivo) {
                cw.mostrarGrupoActivo(datos);
            }
        });

        this.socket.on("salidaDelGrupo", function(datos) {
            console.log("🚪 Saliste del grupo:", datos);
            cli.codigo = null;
            mostrarSalida(`🚪 ${datos.mensaje}`);
            
            if (typeof cw !== 'undefined' && cw.mostrarSalidaGrupo) {
                cw.mostrarSalidaGrupo(datos);
            }
        });

        this.socket.on("nuevoMiembro", function(datos) {
            console.log("✓ Nuevo miembro en el grupo:", datos);
            mostrarSalida(`✓ ${datos.email} se ha unido al grupo`);
            
            if (typeof cw !== 'undefined' && cw.actualizarMiembrosGrupo) {
                cw.actualizarMiembrosGrupo(datos);
            }
        });

        this.socket.on("miembroSalio", function(datos) {
            console.log("🚪 Un miembro salió:", datos);
            mostrarSalida(`🚪 ${datos.email} ha salido del grupo`);
            
            if (datos.estado === "cerrado") {
                mostrarSalida("⚠️ El grupo ha sido cerrado");
                cli.codigo = null;
            } else if (datos.nuevoCreador) {
                mostrarSalida(`ℹ️ Nuevo creador: ${datos.nuevoCreador}`);
            }
            
            if (typeof cw !== 'undefined' && cw.actualizarMiembrosGrupo) {
                cw.actualizarMiembrosGrupo(datos);
            }
        });

        this.socket.on("listaGrupos", function(lista) {
            console.log("📋 Lista de grupos recibida:", lista);
            
            if (typeof cw !== 'undefined' && cw.mostrarListaGrupos) {
                cw.mostrarListaGrupos(lista);
            }
        });

        this.socket.on("miGrupo", function(grupo) {
            console.log("🔍 Mi grupo:", grupo);
            
            if (grupo) {
                cli.codigo = grupo.codigo;
                
                if (typeof cw !== 'undefined' && cw.mostrarGrupoActivo) {
                    cw.mostrarGrupoActivo(grupo);
                }
            }
        });

        // ========== MENSAJES DE GRUPO ==========
        
        this.socket.on("mensajeGrupo", function(datos) {
            console.log("💬 Mensaje recibido:", datos);
            
            // Mostrar notificación si no estás en el chat del grupo
            if (typeof cw !== 'undefined') {
                if (!$("#mensajesChat").length || cli.codigo !== datos.codigo) {
                    cw.mostrarNotificacionMensaje('grupo', datos.mensaje.autor, datos.mensaje.mensaje, () => {
                        cli.codigo = datos.codigo;
                        cw.mostrarChatGrupo();
                    });
                }
                
                if (cw.agregarMensajeGrupo && cli.codigo === datos.codigo) {
                    cw.agregarMensajeGrupo(datos.mensaje);
                }
            }
        });

        this.socket.on("mensajesGrupo", function(datos) {
            console.log("📜 Historial de mensajes cargado:", datos.mensajes.length);
            
            if (typeof cw !== 'undefined' && cw.cargarHistorialMensajes) {
                cw.cargarHistorialMensajes(datos.mensajes);
            }
        });

        this.socket.on("alguienEscribiendo", function(datos) {
            if (typeof cw !== 'undefined' && cw.mostrarIndicadorEscribiendo) {
                cw.mostrarIndicadorEscribiendo(datos);
            }
        });

        this.socket.on("errorMensaje", function(datos) {
            console.error("✗ Error al enviar mensaje:", datos.mensaje);
            mostrarSalida(`✗ Error: ${datos.mensaje}`);
        });

        // ========== MENSAJES PRIVADOS ==========
        
        this.socket.on("receive_message", function(datos) {
            console.log("💌 Mensaje privado recibido de:", datos.from);
            
            if (typeof cw !== 'undefined' && cw.mostrarMensajePrivadoRecibido) {
                cw.mostrarMensajePrivadoRecibido(datos);
            } else {
                mostrarSalida(`💌 Mensaje de ${datos.fromName}: ${datos.message}`);
            }
        });

        this.socket.on("message_sent", function(datos) {
            console.log("✓ Mensaje privado enviado a:", datos.to);
            // No hacer nada aquí, ya se añadió a la UI localmente
        });

        this.socket.on("mensajes_privados_cargados", function(datos) {
            console.log("📜 Historial cargado:", datos.mensajes.length, "mensajes");
            
            if (typeof cw !== 'undefined' && cw.mostrarHistorialCargado) {
                cw.mostrarHistorialCargado(datos);
            }
        });

        this.socket.on("user_offline", function(datos) {
            console.log("⚠️ Usuario offline:", datos.userId);
            // No hacer nada, el mensaje ya se guardó en BD
        });

        // ========== ERRORES ==========
        
        this.socket.on("errorGrupo", function(datos) {
            console.error("✗ Error:", datos.mensaje);
            mostrarSalida(`✗ Error: ${datos.mensaje}`);
            
            if (typeof cw !== 'undefined' && cw.mostrarModal) {
                cw.mostrarModal(datos.mensaje);
            }
        });

        // ========== INVITACIONES Y SOLICITUDES ==========
        
        this.socket.on("invitacion_grupo", function(datos) {
            console.log("📨 Invitación recibida:", datos);
            
            if (typeof cw !== 'undefined' && cw.mostrarInvitacionGrupo) {
                cw.mostrarInvitacionGrupo(datos);
            }
        });

        this.socket.on("invitacion_enviada", function(datos) {
            console.log("✓ Invitación enviada");
            mostrarSalida(`✓ ${datos.mensaje}`);
        });

        this.socket.on("solicitud_enviada", function(datos) {
            console.log("✓ Solicitud enviada");
            mostrarSalida(`✓ ${datos.mensaje}`);
        });

        this.socket.on("solicitud_aprobada", function(datos) {
            console.log("✓ Solicitud aprobada:", datos);
            mostrarSalida(`✓ ${datos.mensaje}`);
            
            if (typeof cw !== 'undefined' && cw.mostrarNotificacionMensaje) {
                cw.mostrarNotificacionMensaje('grupo', 'SISTEMA', datos.mensaje, () => {
                    cli.codigo = datos.codigo;
                    cli.unirseAlGrupo(datos.codigo, true);
                });
            }
        });

        this.socket.on("respuesta_enviada", function(datos) {
            console.log("✓ Respuesta enviada");
            mostrarSalida(`✓ ${datos.mensaje}`);
        });

        // ========== DESCONEXIÓN ==========
        
        this.socket.on("disconnect", function() {
            console.log("❌ Desconectado del servidor WebSocket");
            mostrarSalida("⚠️ Conexión perdida con el servidor");
        });

        this.socket.on("reconnect", function() {
            console.log("✓ Reconectado al servidor WebSocket");
            mostrarSalida("✓ Conexión restablecida");
            
            // Reconectar usuario si hay email
            if (cli.email) {
                cli.conectarUsuario({ email: cli.email });
            }
        });
    };

    this.ini();
}