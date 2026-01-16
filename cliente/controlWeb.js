function ControlWeb() {
    
    this.mostrarAgregarUsuario = function () {
        $('#mAU').remove();

        let cadena = '<div id="mAU" class="form-group">';
        cadena += '<label for="usr">Nick:</label>';
        cadena += '<input type="text" class="form-control" id="usr" placeholder="Introduce tu nick">';
        cadena += '<button type="submit" class="btn btn-primary mt-2" id="btnAgregar">Agregar usuario</button>';
        cadena += '<button type="button" class="btn btn-secondary mt-2" id="btnCancelar">Cancelar</button>';
        cadena += '</div>';
        cadena += '<div><a href="/auth/google"><img src="/img/neutral/web_neutral_sq_SI@2x.png" style="height:40px;"></a></div>';
        cadena += '<div id="msg"></div>';
        cadena += '</div>';

        $("#au").append(cadena);

        $("#btnAgregar").on("click", function () {
          let nick = $("#usr").val().trim();
          if (!nick) {
            showAlert('error', AppSettings.t('empty_fields'));
            return;
          }

          mostrarSalida("Enviando petición para agregar usuario: " + nick);
          rest.agregarUsuario(nick);

          $("#mAU").remove();
        });

        $("#btnCancelar").on("click", function () {
          $("#mAU").remove();
        });
    };

    this.comprobarSesion = function () {
      console.log("=== Comprobando sesión ===");
      
      try {
        let nick = $.cookie("nick");
        console.log("Cookie 'nick':", nick);
        
        if (nick) {
          console.log("Usuario identificado:", nick);
          
          if (typeof ws !== 'undefined' && ws) {
            ws.email = nick;
            ws.conectarUsuario({ email: nick, name: nick });
            console.log("Email asignado a WebSocket:", ws.email);
          } else {
            console.warn("WebSocket no disponible aún");
          }
          
          this.mostrarHome(nick);
          console.log("Mostrando home para:", nick);
        } else {
          console.log("ℹ No hay sesión activa, mostrando login");
          this.mostrarLogin();
        }
      } catch (error) {
        console.error("Error en comprobarSesion:", error);
        this.mostrarLogin();
      }
    };

    this.mostrarHome = function (nick) {
        console.log("=== mostrarHome iniciado para:", nick, "===");
        
        this.limpiar();
        console.log("Interfaz limpiada");

        let cadena = "<div id='mH' class='mt-4'>";
        cadena += `<div class="alert alert-success" role="alert" id="welcome-alert">`;
        cadena += `<h4 class="alert-heading">¡Bienvenido, ${nick}!</h4>`;
        cadena += `<p>Has iniciado sesión correctamente en el sistema de cafetería universitaria.</p>`;
        cadena += `</div>`;
        
        cadena += '<div class="mt-3">';
        cadena += '<button type="button" class="btn btn-success mr-2" id="btnCrearGrupo">👥 <span data-i18n="btn_create_group">Crear Grupo</span></button>';
        cadena += '<button type="button" class="btn btn-info mr-2" id="btnVerGrupos">📋 <span data-i18n="btn_view_groups">Ver Grupos</span></button>';
        cadena += '<button type="button" class="btn btn-secondary mr-2" id="btnChatPrivado">💬 <span data-i18n="btn_private_chats">Chats Privados</span></button>';
        cadena += '<button type="button" class="btn btn-primary mr-2" id="btnVerMenu">🍽️ <span data-i18n="btn_view_menu">Ver Menú</span></button>';
        cadena += '<button type="button" class="btn btn-warning mr-2" id="btnMisPedidos">📦 <span data-i18n="btn_my_orders">Mis Pedidos</span></button>';
        cadena += '<button type="button" class="btn btn-info mr-2" id="btnMisReservas">🪑 <span data-i18n="btn_my_reservations">Mis Reservas</span></button>';
        cadena += '<button type="button" class="btn btn-danger" id="btnCerrarSesion"><span data-i18n="btn_logout">Cerrar sesión</span></button>';
        cadena += '</div>';
        
        cadena += '<div id="zonaContenido" class="mt-4"></div>';
        
        cadena += `</div>`;
        
        console.log("HTML generado");
        $("#au").html(cadena);
        console.log("HTML insertado en #au");
        
        // Aplicar traducciones después de insertar HTML
        const settings = AppSettings.load();
        AppSettings.apply(settings);
        
        // Ocultar alerta de bienvenida después de 3 segundos
        setTimeout(() => {
            const welcomeAlert = document.getElementById('welcome-alert');
            if (welcomeAlert) {
                welcomeAlert.style.opacity = '0';
                welcomeAlert.style.transform = 'translateY(-20px)';
                welcomeAlert.style.transition = 'all 0.3s ease';
                setTimeout(() => {
                    welcomeAlert.remove();
                }, 300);
            }
        }, 3000);

        $("#btnVerMenu").on("click", function() {
            console.log("Redirigiendo a nueva página de menú");
            window.location.href = '/menu-productos.html';
        });

        $("#btnCerrarSesion").on("click", function () {
            console.log("Botón cerrar sesión clickeado");
            cw.salir();
        });
        
        $("#btnCrearGrupo").on("click", function() {
            console.log("Botón crear grupo clickeado");
            cw.mostrarFormularioCrearGrupo();
        });
        
        $("#btnVerGrupos").on("click", function() {
            console.log("Botón ver grupos clickeado");
            ws.obtenerGrupos();
        });
        
        $("#btnMisPedidos").on("click", function() {
            console.log("Botón mis pedidos clickeado");
            cw.cargarMisPedidos();
        });
        
        $("#btnChatPrivado").on("click", function() {
            console.log("Botón chat privado clickeado");
            cw.mostrarChatsPrivados();
        });

        $("#btnMisReservas").on("click", function() {
            console.log("Botón mis reservas clickeado");
            cw.cargarMisReservas();
        });
        
        console.log("Event listeners configurados");
        mostrarSalida("Usuario activo: " + nick);
        console.log("=== mostrarHome completado ===");
    };

    // ==================== GRUPOS ====================
    
    this.mostrarFormularioCrearGrupo = function() {
        let cadena = '<div class="card">';
        cadena += '<div class="card-header"><h5>👥 Crear Nuevo Grupo</h5></div>';
        cadena += '<div class="card-body">';
        
        cadena += '<div class="form-group">';
        cadena += '<label for="nombreGrupo">Nombre del grupo:</label>';
        cadena += '<input type="text" class="form-control" id="nombreGrupo" placeholder="Ej: Amigos de Ingeniería">';
        cadena += '</div>';
        
        cadena += '<div class="form-group">';
        cadena += '<label>Tipo de grupo:</label><br>';
        cadena += '<div class="custom-control custom-radio">';
        cadena += '<input type="radio" id="grupoAbierto" name="tipoGrupo" class="custom-control-input" value="abierto" checked>';
        cadena += '<label class="custom-control-label" for="grupoAbierto">🌐 Abierto (Cualquiera puede unirse)</label>';
        cadena += '</div>';
        cadena += '<div class="custom-control custom-radio">';
        cadena += '<input type="radio" id="grupoPrivado" name="tipoGrupo" class="custom-control-input" value="privado">';
        cadena += '<label class="custom-control-label" for="grupoPrivado">🔒 Privado (Solo por invitación)</label>';
        cadena += '</div>';
        cadena += '</div>';
        
        cadena += '<button class="btn btn-success" id="btnConfirmarCrearGrupo">Crear Grupo</button>';
        cadena += '<button class="btn btn-secondary ml-2" id="btnCancelarGrupo">Cancelar</button>';
        cadena += '</div></div>';
        
        $("#zonaContenido").html(cadena);
        
        $("#btnConfirmarCrearGrupo").on("click", function() {
            let nombre = $("#nombreGrupo").val().trim();
            if (!nombre) {
                showAlert('error', 'Por favor, introduce un nombre para el grupo');
                return;
            }
            
            let esPrivado = $('input[name="tipoGrupo"]:checked').val() === 'privado';
            ws.crearGrupo(nombre, esPrivado);
        });
        
        $("#btnCancelarGrupo").on("click", function() {
            $("#zonaContenido").empty();
        });
    };

    this.mostrarGrupoCreado = function(datos) {
        let cadena = '<div class="alert alert-success" role="alert">';
        cadena += `<h5>✓ Grupo Creado</h5>`;
        cadena += `<p><strong>Nombre:</strong> ${datos.nombre}</p>`;
        cadena += `<p><strong>Código:</strong> <code class="h4">${datos.codigo}</code></p>`;
        cadena += `<p class="mb-0">Comparte este código con tus amigos para que se unan.</p>`;
        cadena += '<button class="btn btn-primary mt-2" id="btnIrAlChat">Ir al Chat del Grupo</button>';
        cadena += '</div>';
        
        $("#zonaContenido").html(cadena);
        
        $("#btnIrAlChat").on("click", function() {
            cw.mostrarChatGrupo();
        });
    };

    this.mostrarListaGrupos = function(lista) {
        let cadena = '<div class="card">';
        cadena += '<div class="card-header"><h5>📋 Grupos Disponibles</h5></div>';
        cadena += '<div class="card-body">';
        
        if (lista.length === 0) {
            cadena += '<p class="text-muted">No hay grupos disponibles en este momento.</p>';
            cadena += '<button class="btn btn-success" id="btnCrearPrimerGrupo">Crear el Primer Grupo</button>';
        } else {
            cadena += '<table class="table table-striped">';
            cadena += '<thead><tr>';
            cadena += '<th>Código</th><th>Nombre</th><th>Tipo</th><th>Creador</th><th>Miembros</th><th>Estado</th><th>Acción</th>';
            cadena += '</tr></thead><tbody>';
            
            let miEmail = ws.email;
            
            lista.forEach(function(grupo) {
                cadena += '<tr>';
                cadena += `<td><code>${grupo.codigo}</code></td>`;
                cadena += `<td>${grupo.nombre || 'Sin nombre'}</td>`;
                
                let tipoHTML = grupo.privado 
                    ? '<span class="badge badge-warning">🔒 Privado</span>'
                    : '<span class="badge badge-info">🌐 Abierto</span>';
                cadena += `<td>${tipoHTML}</td>`;
                
                cadena += `<td>${grupo.creador}</td>`;
                cadena += `<td>${grupo.numeroMiembros}</td>`;
                
                let estadoHTML = grupo.estado === 'abierto' 
                    ? '<span class="badge badge-success">✓ Abierto</span>'
                    : '<span class="badge badge-secondary">🔒 Cerrado</span>';
                cadena += `<td>${estadoHTML}</td>`;
                
                let accionHTML = '';
                let estoEnGrupo = (grupo.miembros && grupo.miembros.includes && grupo.miembros.includes(miEmail));
                
                if (grupo.estado === 'abierto') {
                    if (estoEnGrupo) {
                        accionHTML = '<button class="btn btn-sm btn-primary btnIrChat" data-codigo="' + grupo.codigo + '">Ver Chat</button>';
                    } else if (grupo.privado) {
                        accionHTML = '<button class="btn btn-sm btn-warning btnSolicitar" data-codigo="' + grupo.codigo + '">Solicitar Unirse</button>';
                    } else {
                        accionHTML = '<button class="btn btn-sm btn-success btnUnir" data-codigo="' + grupo.codigo + '">Unirse</button>';
                    }
                } else {
                    accionHTML = '<small class="text-muted">No disponible</small>';
                }
                
                cadena += `<td>${accionHTML}</td></tr>`;
            });
            cadena += '</tbody></table>';
        }
        cadena += '</div></div>';
        
        $("#zonaContenido").html(cadena);
        
        $("#btnCrearPrimerGrupo").on("click", function() {
            cw.mostrarFormularioCrearGrupo();
        });
        
        $(".btnUnir").on("click", function() {
            ws.unirseAlGrupo($(this).data("codigo"), false);
        });
        
        $(".btnSolicitar").on("click", function() {
            if (confirm("¿Deseas solicitar unirte a este grupo privado?")) {
                ws.solicitarUnionGrupo($(this).data("codigo"));
            }
        });
        
        $(".btnIrChat").on("click", function() {
            ws.codigo = $(this).data("codigo");
            cw.mostrarChatGrupo();
        });
    };

    // ==================== CHAT DE GRUPO ====================
    
    this.mostrarChatGrupo = function() {
        if (!ws.codigo) {
            showAlert('error', 'No estás en ningún grupo. Únete o crea uno primero.');
            ws.obtenerGrupos();
            return;
        }
        
        let cadena = '<div class="card">';
        cadena += '<div class="card-header d-flex justify-content-between align-items-center">';
        cadena += `<h5 class="mb-0">💬 Chat del Grupo <code>${ws.codigo}</code></h5>`;
        cadena += '<div>';
        cadena += '<button class="btn btn-sm btn-info mr-2" id="btnInvitarUsuario">➕ Invitar</button>';
        cadena += '<button class="btn btn-sm btn-danger" id="btnSalirGrupo">Salir del Grupo</button>';
        cadena += '</div></div>';
        cadena += '<div class="card-body">';
        
        cadena += '<div id="mensajesChat" style="height: 400px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; background-color: #f9f9f9;">';
        cadena += '<p class="text-muted">Cargando mensajes...</p></div>';
        
        cadena += '<div id="indicadorEscribiendo" class="text-muted small mb-2" style="min-height: 20px;"></div>';
        
        cadena += '<div class="input-group">';
        cadena += '<input type="text" class="form-control" id="inputMensaje" placeholder="Escribe un mensaje...">';
        cadena += '<div class="input-group-append">';
        cadena += '<button class="btn btn-primary" id="btnEnviarMensaje">Enviar</button>';
        cadena += '</div></div></div></div>';
        
        $("#zonaContenido").html(cadena);
        
        ws.obtenerMensajesGrupo(ws.codigo);
        
        $("#btnEnviarMensaje").on("click", function() {
            cw.enviarMensajeGrupo();
        });
        
        $("#inputMensaje").on("keypress", function(e) {
            if (e.which === 13) cw.enviarMensajeGrupo();
        });
        
        $("#inputMensaje").on("input", function() {
            ws.indicarEscribiendo(ws.codigo, true);
            clearTimeout(window.escribiendoTimeout);
            window.escribiendoTimeout = setTimeout(function() {
                ws.indicarEscribiendo(ws.codigo, false);
            }, 1000);
        });
        
        $("#btnSalirGrupo").on("click", function() {
            if (confirm("¿Estás seguro de que quieres salir del grupo?")) {
                ws.salirDelGrupo(ws.codigo);
            }
        });
        
        $("#btnInvitarUsuario").on("click", function() {
            cw.mostrarModalInvitarUsuario();
        });
    };

    this.enviarMensajeGrupo = function() {
        let mensaje = $("#inputMensaje").val().trim();
        if (!mensaje) return;
        ws.enviarMensajeGrupo(ws.codigo, mensaje);
        $("#inputMensaje").val("");
    };

    this.cargarHistorialMensajes = function(mensajes) {
        let html = '';
        
        if (mensajes.length === 0) {
            html = '<p class="text-muted text-center">No hay mensajes aún. ¡Sé el primero en escribir!</p>';
        } else {
            mensajes.forEach(function(msg) {
                if (msg.tipo === "sistema") {
                    html += `<div class="text-center mb-2"><div class="d-inline-block bg-secondary text-white p-2 rounded" style="font-size: 0.85em;">ℹ️ ${msg.mensaje}</div></div>`;
                }
                else if (msg.tipo === "solicitud") {
                    html += `<div class="text-center mb-3"><div class="alert alert-warning d-inline-block" style="max-width: 80%;"><strong>📋 ${msg.mensaje}</strong><br>`;
                    html += `<button class="btn btn-sm btn-success mt-2 btnAprobar" data-solicitante="${msg.solicitante}">✓ Aprobar</button> `;
                    html += `<button class="btn btn-sm btn-danger mt-2 btnRechazar" data-solicitante="${msg.solicitante}">✗ Rechazar</button></div></div>`;
                }
                else {
                    let esMio = (msg.autor === ws.email);
                    let clase = esMio ? 'text-right' : 'text-left';
                    let color = esMio ? 'bg-primary text-white' : 'bg-light';
                    
                    html += `<div class="${clase} mb-2"><div class="d-inline-block ${color} p-2 rounded" style="max-width: 70%;">`;
                    html += `<small class="d-block font-weight-bold">${msg.autor}</small><span>${msg.mensaje}</span>`;
                    html += `<small class="d-block text-muted" style="font-size: 0.75em;">${new Date(msg.fecha).toLocaleTimeString()}</small></div></div>`;
                }
            });
        }
        
        $("#mensajesChat").html(html);
        $("#mensajesChat").scrollTop($("#mensajesChat")[0].scrollHeight);
        
        $(".btnAprobar").on("click", function() {
            ws.responderSolicitud(ws.codigo, $(this).data("solicitante"), true);
            $(this).closest(".alert").html('<span class="text-success">✓ Aprobando solicitud...</span>');
        });
        
        $(".btnRechazar").on("click", function() {
            ws.responderSolicitud(ws.codigo, $(this).data("solicitante"), false);
            $(this).closest(".alert").html('<span class="text-danger">✗ Rechazando solicitud...</span>');
        });
    };

    this.agregarMensajeGrupo = function(mensaje) {
        let html = '';
        if (mensaje.tipo === "sistema") {
            html = `<div class="text-center mb-2"><div class="d-inline-block bg-secondary text-white p-2 rounded" style="font-size: 0.85em;">ℹ️ ${mensaje.mensaje}</div></div>`;
        }
        else if (mensaje.tipo === "solicitud") {
            html = `<div class="text-center mb-3"><div class="alert alert-warning d-inline-block" style="max-width: 80%;"><strong>📋 ${mensaje.mensaje}</strong><br>`;
            html += `<button class="btn btn-sm btn-success mt-2 btnAprobar" data-solicitante="${mensaje.solicitante}">✓ Aprobar</button> `;
            html += `<button class="btn btn-sm btn-danger mt-2 btnRechazar" data-solicitante="${mensaje.solicitante}">✗ Rechazar</button></div></div>`;
            
            $("#mensajesChat").append(html);
            
            $(".btnAprobar").off("click").on("click", function() {
                ws.responderSolicitud(ws.codigo, $(this).data("solicitante"), true);
                $(this).closest(".alert").html('<span class="text-success">✓ Aprobando solicitud...</span>');
            });
            
            $(".btnRechazar").off("click").on("click", function() {
                ws.responderSolicitud(ws.codigo, $(this).data("solicitante"), false);
                $(this).closest(".alert").html('<span class="text-danger">✗ Rechazando solicitud...</span>');
            });
            return;
        }
        else {
            let esMio = (mensaje.autor === ws.email);
            let clase = esMio ? 'text-right' : 'text-left';
            let color = esMio ? 'bg-primary text-white' : 'bg-light';
            
            html = `<div class="${clase} mb-2"><div class="d-inline-block ${color} p-2 rounded" style="max-width: 70%;">`;
            html += `<small class="d-block font-weight-bold">${mensaje.autor}</small><span>${mensaje.mensaje}</span>`;
            html += `<small class="d-block text-muted" style="font-size: 0.75em;">${new Date(mensaje.fecha).toLocaleTimeString()}</small></div></div>`;
        }
        
        $("#mensajesChat").append(html);
        $("#mensajesChat").scrollTop($("#mensajesChat")[0].scrollHeight);
    };

    this.mostrarIndicadorEscribiendo = function(datos) {
        $("#indicadorEscribiendo").text(datos.escribiendo ? `${datos.email} está escribiendo...` : "");
    };

    this.mostrarGrupoActivo = function(datos) {
        mostrarSalida(`✓ Estás en el grupo: ${datos.codigo}`);
        this.mostrarChatGrupo();
    };

    this.mostrarSalidaGrupo = function(datos) {
        showAlert('success', datos.estado === "cerrado" ? "El grupo ha sido cerrado (no quedan miembros)" : "Has salido del grupo");
        $("#zonaContenido").empty();
    };

    // ==================== CHATS PRIVADOS ====================
    
    this.mostrarChatsPrivados = function() {
        let cadena = '<div class="card"><div class="card-header"><h5>💬 Mensajes Privados</h5></div><div class="card-body"><div class="row">';
        cadena += '<div class="col-md-4" style="border-right: 1px solid #ddd; max-height: 500px; overflow-y: auto;">';
        cadena += '<h6>Usuarios Online</h6><div id="listaUsuariosPrivados"></div></div>';
        cadena += '<div class="col-md-8"><div id="chatPrivadoActivo">';
        cadena += '<p class="text-muted text-center" style="padding-top: 50px;">Selecciona un usuario para chatear</p>';
        cadena += '</div></div></div></div></div>';
        
        $("#zonaContenido").html(cadena);
        this.actualizarListaUsuariosPrivados();
        
        if (window.intervalUsuariosPrivados) clearInterval(window.intervalUsuariosPrivados);
        window.intervalUsuariosPrivados = setInterval(() => {
            if ($("#listaUsuariosPrivados").length > 0) {
                cw.actualizarListaUsuariosPrivados();
            } else {
                clearInterval(window.intervalUsuariosPrivados);
            }
        }, 5000);
    };

    this.actualizarListaUsuariosPrivados = function() {
        $.getJSON("/obtenerUsuarios", function(usuarios) {
            let html = '';
            
            if (!usuarios || usuarios.length === 0) {
                html = '<p class="text-muted small">No hay usuarios online</p>';
            } else {
                usuarios.forEach(function(usuario) {
                    if (usuario.nick !== ws.email) {
                        html += `<div class="usuario-item p-2 mb-2" style="cursor: pointer; border: 1px solid #ddd; border-radius: 5px;" data-nick="${usuario.nick}">`;
                        html += `<strong>👤 ${usuario.nick}</strong></div>`;
                    }
                });
            }
            
            $("#listaUsuariosPrivados").html(html);
            
            $(".usuario-item").on("click", function() {
                let nick = $(this).data("nick");
                $(".usuario-item").removeClass("bg-primary text-white");
                $(this).addClass("bg-primary text-white");
                cw.abrirChatPrivado(nick);
            });
        }).fail(function() {
            $("#listaUsuariosPrivados").html('<p class="text-danger small">Error al cargar usuarios</p>');
        });
    };

    this.abrirChatPrivado = function(destinatario) {
        window.chatPrivadoActual = destinatario;
        
        let cadena = '<div class="d-flex justify-content-between align-items-center mb-3 pb-2" style="border-bottom: 2px solid #ddd;">';
        cadena += `<h6 class="mb-0">Chat con <strong>${destinatario}</strong></h6>`;
        cadena += '<button class="btn btn-sm btn-secondary" id="btnCerrarChatPrivado">Cerrar</button></div>';
        
        cadena += '<div id="mensajesChatPrivado" style="height: 350px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; background-color: #f9f9f9;">';
        cadena += '<p class="text-muted">Cargando conversación...</p></div>';
        
        cadena += '<div class="input-group"><input type="text" class="form-control" id="inputMensajePrivado" placeholder="Escribe un mensaje...">';
        cadena += '<div class="input-group-append"><button class="btn btn-primary" id="btnEnviarMensajePrivado">Enviar</button></div></div>';
        
        $("#chatPrivadoActivo").html(cadena);
        
        $("#btnEnviarMensajePrivado").on("click", function() {
            cw.enviarMensajePrivado();
        });
        
        $("#inputMensajePrivado").on("keypress", function(e) {
            if (e.which === 13) cw.enviarMensajePrivado();
        });
        
        $("#btnCerrarChatPrivado").on("click", function() {
            window.chatPrivadoActual = null;
            $("#chatPrivadoActivo").html('<p class="text-muted text-center" style="padding-top: 50px;">Selecciona un usuario para chatear</p>');
        });
        
        this.cargarHistorialMensajesPrivados(destinatario);
    };

    this.enviarMensajePrivado = function() {
        let mensaje = $("#inputMensajePrivado").val().trim();
        if (!mensaje || !window.chatPrivadoActual) return;
        
        ws.enviarMensajePrivado(window.chatPrivadoActual, mensaje, ws.email);
        this.agregarMensajePrivadoAUI(mensaje, true);
        $("#inputMensajePrivado").val("");
    };

    this.agregarMensajePrivadoAUI = function(mensaje, esMio) {
        let clase = esMio ? 'text-right' : 'text-left';
        let color = esMio ? 'bg-primary text-white' : 'bg-light';
        
        let html = `<div class="${clase} mb-2"><div class="d-inline-block ${color} p-2 rounded" style="max-width: 70%;">`;
        html += `<span>${mensaje}</span>`;
        html += `<small class="d-block text-muted" style="font-size: 0.75em;">${new Date().toLocaleTimeString()}</small></div></div>`;
        
        $("#mensajesChatPrivado").append(html);
        $("#mensajesChatPrivado").scrollTop($("#mensajesChatPrivado")[0].scrollHeight);
    };

    this.cargarHistorialMensajesPrivados = function(usuario) {
        if (ws && ws.socket) {
            ws.socket.emit('cargar_mensajes_privados', {
                usuario1: ws.email,
                usuario2: usuario
            });
        }
    };

    this.mostrarHistorialCargado = function(datos) {
        if (window.chatPrivadoActual !== datos.usuario2 && window.chatPrivadoActual !== datos.usuario1) return;
        
        let html = '';
        
        if (datos.mensajes.length === 0) {
            html = '<p class="text-muted small">Inicia la conversación con ' + window.chatPrivadoActual + '</p>';
        } else {
            datos.mensajes.forEach(function(msg) {
                let esMio = (msg.autor === ws.email);
                let clase = esMio ? 'text-right' : 'text-left';
                let color = esMio ? 'bg-primary text-white' : 'bg-light';
                
                html += `<div class="${clase} mb-2"><div class="d-inline-block ${color} p-2 rounded" style="max-width: 70%;">`;
                html += `<span>${msg.mensaje}</span>`;
                html += `<small class="d-block text-muted" style="font-size: 0.75em;">${new Date(msg.fecha).toLocaleTimeString()}</small></div></div>`;
            });
        }
        
        $("#mensajesChatPrivado").html(html);
        $("#mensajesChatPrivado").scrollTop($("#mensajesChatPrivado")[0].scrollHeight);
    };

    this.mostrarNotificacionMensaje = function(tipo, remitente, mensaje, callback) {
        let notif = $('<div class="notificacion-mensaje"></div>');
        notif.html(`
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">${tipo === 'grupo' ? '👥' : '💬'}</span>
                <div style="flex: 1;">
                    <strong>${remitente}</strong>
                    <div style="font-size: 13px; color: #666;">${mensaje.substring(0, 50)}${mensaje.length > 50 ? '...' : ''}</div>
                </div>
            </div>
        `);
        
        notif.css({
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10000,
            minWidth: '300px',
            maxWidth: '400px',
            cursor: 'pointer',
            opacity: 0,
            transform: 'translateX(400px)',
            transition: 'all 0.3s ease'
        });
        
        $('body').append(notif);
        this.reproducirSonidoNotificacion();
        
        setTimeout(() => {
            notif.css({
                opacity: 1,
                transform: 'translateX(0)'
            });
        }, 100);
        
        notif.on('click', function() {
            if (callback) callback();
            notif.css({
                opacity: 0,
                transform: 'translateX(400px)'
            });
            setTimeout(() => notif.remove(), 300);
        });
        
        setTimeout(() => {
            notif.css({
                opacity: 0,
                transform: 'translateX(400px)'
            });
            setTimeout(() => notif.remove(), 300);
        }, 5000);
    };

    this.reproducirSonidoNotificacion = function() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            console.log("No se pudo reproducir sonido:", e);
        }
    };

    // ==================== INVITACIONES ====================
    
    this.mostrarModalInvitarUsuario = function() {
        $.getJSON("/obtenerUsuarios", function(usuarios) {
            let cadena = '<div class="modal fade" id="modalInvitar" tabindex="-1">';
            cadena += '<div class="modal-dialog"><div class="modal-content">';
            cadena += '<div class="modal-header">';
            cadena += '<h5 class="modal-title">➕ Invitar Usuario al Grupo</h5>';
            cadena += '<button type="button" class="close" data-dismiss="modal">&times;</button>';
            cadena += '</div><div class="modal-body">';
            
            if (!usuarios || usuarios.length <= 1) {
                cadena += '<p class="text-muted">No hay usuarios disponibles para invitar.</p>';
            } else {
                cadena += '<p>Selecciona un usuario para invitar:</p>';
                cadena += '<div class="list-group">';
                
                usuarios.forEach(function(usuario) {
                    if (usuario.nick !== ws.email) {
                        cadena += `<div class="list-group-item list-group-item-action usuarioInvitable" data-nick="${usuario.nick}" style="cursor:pointer;">`;
                        cadena += `<strong>👤 ${usuario.nick}</strong></div>`;
                    }
                });
                
                cadena += '</div>';
            }
            
            cadena += '</div><div class="modal-footer">';
            cadena += '<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>';
            cadena += '</div></div></div></div>';
            
            $('body').append(cadena);
            $('#modalInvitar').modal('show');
            
            $('#modalInvitar').on('hidden.bs.modal', function () {
                $(this).remove();
            });
            
            $(".usuarioInvitable").on("click", function() {
                let nick = $(this).data("nick");
                if (confirm(`¿Invitar a ${nick} al grupo ${ws.codigo}?`)) {
                    ws.invitarUsuarioGrupo(ws.codigo, nick);
                    $('#modalInvitar').modal('hide');
                }
            });
        }).fail(function() {
            showAlert('error', 'Error al cargar usuarios');
        });
    };

    this.mostrarInvitacionGrupo = function(datos) {
        this.mostrarNotificacionInvitacion(datos);
    };

    this.mostrarNotificacionInvitacion = function(datos) {
        let notif = $('<div class="notificacion-invitacion"></div>');
        notif.html(`
            <div style="padding: 20px;">
                <h6 style="margin: 0 0 10px 0;">📨 Invitación a Grupo</h6>
                <p style="margin: 0 0 15px 0;">${datos.mensaje}</p>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-sm btn-success" id="btnAceptarInv">Aceptar</button>
                    <button class="btn btn-sm btn-danger" id="btnRechazarInv">Rechazar</button>
                </div>
            </div>
        `);
        
        notif.css({
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            borderRadius: '15px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            zIndex: 10001,
            minWidth: '350px',
            maxWidth: '500px'
        });
        
        $('body').append(notif);
        this.reproducirSonidoNotificacion();
        
        $("#btnAceptarInv").on("click", function() {
            ws.unirseAlGrupo(datos.codigo, true);
            notif.remove();
            showAlert('success', "✓ Aceptaste la invitación al grupo " + datos.codigo);
        });
        
        $("#btnRechazarInv").on("click", function() {
            notif.remove();
            showAlert('success', "✗ Rechazaste la invitación al grupo " + datos.codigo);
        });
    };

    this.mostrarMensajePrivadoRecibido = function(datos) {
        this.mostrarNotificacionMensaje('privado', datos.fromName, datos.message, () => {
            $("#btnChatPrivado").click();
            setTimeout(() => {
                $(".usuario-item").each(function() {
                    if ($(this).data("nick") === datos.from) {
                        $(this).click();
                    }
                });
            }, 500);
        });
        
        if (window.chatPrivadoActual === datos.from) {
            this.agregarMensajePrivadoAUI(datos.message, false);
        }
    };

    // ==================== PEDIDOS ====================
    this.cargarMisPedidos = function() {
        $.getJSON("/api/orders", function(pedidos) {
            let cadena = '<div class="card">';
            cadena += '<div class="card-header"><h5>📦 Mis Pedidos</h5></div>';
            cadena += '<div class="card-body">';
            
            if (pedidos.length === 0) {
                cadena += '<p class="text-muted">No tienes pedidos aún.</p>';
                cadena += '<button class="btn btn-primary mt-3" onclick="window.location.href=\'/menu-productos.html\'">🍽️ Hacer un pedido</button>';
            } else {
                cadena += '<div class="list-group">';
                pedidos.forEach(function(pedido) {
                    const fecha = new Date(pedido.fecha).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    let estadoBadge = '';
                    switch(pedido.estado) {
                        case 'pendiente':
                            estadoBadge = '<span class="badge badge-warning">⏳ Pendiente</span>';
                            break;
                        case 'preparando':
                            estadoBadge = '<span class="badge badge-info">👨‍🍳 En preparación</span>';
                            break;
                        case 'listo':
                            estadoBadge = '<span class="badge badge-success">✅ Listo</span>';
                            break;
                        case 'entregado':
                            estadoBadge = '<span class="badge badge-secondary">📦 Entregado</span>';
                            break;
                        default:
                            estadoBadge = '<span class="badge badge-secondary">' + pedido.estado + '</span>';
                    }
                    
                    cadena += '<div class="list-group-item">';
                    cadena += `<div class="d-flex justify-content-between align-items-center mb-2">`;
                    cadena += `<h6 class="mb-0"><strong>Pedido #${pedido.orderId || pedido._id}</strong></h6>`;
                    cadena += estadoBadge;
                    cadena += `</div>`;
                    cadena += `<p class="mb-1 text-muted"><small>📅 ${fecha}</small></p>`;
                    cadena += `<p class="mb-1"><strong>Total:</strong> ${pedido.total.toFixed(2)}€</p>`;
                    cadena += `<p class="mb-1"><strong>Método de pago:</strong> ${pedido.metodoPago}</p>`;
                    
                    cadena += '<details style="margin-top: 10px;">';
                    cadena += '<summary style="cursor: pointer; color: #77A159; font-weight: 600;">Ver productos</summary>';
                    cadena += '<ul style="margin-top: 10px; padding-left: 20px;">';
                    pedido.items.forEach(function(item) {
                        cadena += `<li>${item.title} <strong>x${item.qty}</strong> - ${(item.price * item.qty).toFixed(2)}€</li>`;
                    });
                    cadena += '</ul></details>';
                    cadena += '</div>';
                });
                cadena += '</div>';
            }
            
            cadena += '</div></div>';
            
            $("#zonaContenido").html(cadena);
        }).fail(function() {
            showAlert('error', "❌ Error al cargar pedidos");
            
            let cadena = '<div class="alert alert-danger" role="alert">';
            cadena += '<h5>Error al cargar pedidos</h5>';
            cadena += '<p>No se pudieron cargar tus pedidos. Por favor, inténtalo más tarde.</p>';
            cadena += '</div>';
            
            $("#zonaContenido").html(cadena);
        });
    };

    this.cargarMisReservas = function() {
        $.getJSON("/api/reservas", function(reservas) {
            let cadena = '<div class="card">';
            cadena += '<div class="card-header"><h5>🪑 <span data-i18n="my_reservations_title">Mis Reservas</span></h5></div>';
            cadena += '<div class="card-body">';
            
            if (reservas.length === 0) {
                cadena += '<p class="text-muted" data-i18n="no_reservations">No tienes reservas registradas.</p>';
                cadena += '<button class="btn btn-primary mt-3" onclick="window.location.href=\'/menu-productos.html\'">🍽️ <span data-i18n="btn_make_order">Hacer un pedido y reservar</span></button>';
            } else {
                cadena += '<div class="list-group">';
                reservas.forEach(function(reserva, index) {
                    const fechaCompleta = new Date(reserva.fechaCreacion).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    const fechaReserva = new Date(reserva.fecha).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    
                    let estadoBadge = '';
                    let estadoIcon = '';
                    switch(reserva.estado) {
                        case 'confirmada':
                            estadoBadge = '<span class="badge badge-success">✅ Confirmada</span>';
                            estadoIcon = '✅';
                            break;
                        case 'completada':
                            estadoBadge = '<span class="badge badge-secondary">✓ Completada</span>';
                            estadoIcon = '✓';
                            break;
                        case 'cancelada':
                            estadoBadge = '<span class="badge badge-danger">✗ Cancelada</span>';
                            estadoIcon = '✗';
                            break;
                        default:
                            estadoBadge = '<span class="badge badge-info">' + reserva.estado + '</span>';
                            estadoIcon = '📋';
                    }
                    
                    const mesasTexto = Array.isArray(reserva.mesas) 
                        ? reserva.mesas.sort((a, b) => a - b).join(', ')
                        : reserva.mesas || '-';
                    
                    cadena += '<div class="list-group-item">';
                    cadena += `<div class="d-flex justify-content-between align-items-center mb-2">`;
                    cadena += `<h6 class="mb-0"><strong>${estadoIcon} Reserva #${index + 1}</strong></h6>`;
                    cadena += estadoBadge;
                    cadena += `</div>`;
                    
                    cadena += `<p class="mb-1 text-muted"><small>📅 <strong data-i18n="created_on">Creada el:</strong> ${fechaCompleta}</small></p>`;
                    
                    cadena += '<div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-top: 10px;">';
                    cadena += `<p class="mb-2"><strong>📅 <span data-i18n="reservation_date">Fecha de reserva:</span></strong> ${fechaReserva}</p>`;
                    cadena += `<p class="mb-2"><strong>⏰ <span data-i18n="time_slot">Horario:</span></strong> ${reserva.horaInicio} - ${reserva.horaFin}</p>`;
                    cadena += `<p class="mb-2"><strong>👥 <span data-i18n="num_people">Personas:</span></strong> ${reserva.numPersonas}</p>`;
                    cadena += `<p class="mb-0"><strong>🪑 <span data-i18n="tables">Mesa(s):</span></strong> ${mesasTexto}</p>`;
                    cadena += '</div>';
                    
                    // Opciones según estado
                    if (reserva.estado === 'confirmada') {
                        cadena += '<div class="mt-3">';
                        cadena += `<button class="btn btn-sm btn-danger" onclick="cw.cancelarReserva('${reserva._id}')">✗ <span data-i18n="btn_cancel_reservation">Cancelar Reserva</span></button>`;
                        cadena += '</div>';
                    }
                    
                    cadena += '</div>';
                });
                cadena += '</div>';
            }
            
            cadena += '</div></div>';
            
            $("#zonaContenido").html(cadena);
            
            // Aplicar traducciones
            const settings = AppSettings.load();
            AppSettings.apply(settings);
        }).fail(function() {
            showAlert('error', AppSettings.t('error_loading_reservations') || "❌ Error al cargar reservas");
            
            let cadena = '<div class="alert alert-danger" role="alert">';
            cadena += '<h5 data-i18n="error_loading_reservations_title">Error al cargar reservas</h5>';
            cadena += '<p data-i18n="error_loading_reservations_text">No se pudieron cargar tus reservas. Por favor, inténtalo más tarde.</p>';
            cadena += '</div>';
            
            $("#zonaContenido").html(cadena);
            
            // Aplicar traducciones
            const settings = AppSettings.load();
            AppSettings.apply(settings);
        });
    };

    this.cancelarReserva = function(reservaId) {
        const confirmMsg = AppSettings.t('confirm_cancel_reservation') || '¿Estás seguro de que quieres cancelar esta reserva?';
        if (!confirm(confirmMsg)) return;
        
        // Implementar cancelación
        $.ajax({
            type: 'POST',
            url: '/api/cancelar-reserva',
            data: JSON.stringify({ reservaId: reservaId }),
            contentType: 'application/json',
            success: function(data) {
                if (data.ok) {
                    showAlert('success', AppSettings.t('reservation_cancelled') || '✓ Reserva cancelada correctamente');
                    cw.cargarMisReservas(); // Recargar lista
                } else {
                    showAlert('error', data.mensaje || 'Error al cancelar reserva');
                }
            },
            error: function() {
                showAlert('error', AppSettings.t('error_cancelling') || 'Error al cancelar la reserva');
            }
        });
    };

    // ==================== LOGIN Y REGISTRO ====================

    this.mostrarLogin = function () {
        this.limpiar();
        $("#registro").load("login.html", function () {
            const googleBtn = `<div class="text-center mt-3">
                <a href="/auth/google"><img src="/img/neutral/web_neutral_sq_SI@2x.png" style="height:40px;"></a></div>
                <hr class="my-4">`;
            $("#btnGS").replaceWith(googleBtn);

            // Aplicar traducciones después de cargar
            const settings = AppSettings.load();
            AppSettings.apply(settings);

            $("#btnLogin").on("click", function (e) {
                e.preventDefault();
                let email = $("#email").val();
                let pwd = $("#pwd").val();
                
                if (!email || !pwd) {
                    showAlert('error', AppSettings.t('empty_fields'));
                    return;
                }
                
                rest.loginUsuario(email, pwd);
                mostrarSalida("Intentando iniciar sesión: " + email);
            });
            
            $("#btnRegistro").on("click", function (e) {
                e.preventDefault();
                cw.mostrarRegistro();
            });
            
            $("#btnRegistroNick").on("click", function (e) {
                e.preventDefault();
                cw.mostrarAgregarUsuario();
            });
        });
    };

    this.mostrarRegistro = function () {
        this.limpiar();
        $("#registro").load("registro.html", function () {
            // Aplicar traducciones después de cargar
            AppSettings.apply(AppSettings.load());

            $("#btnRegistro").on("click", function (e) {
                e.preventDefault();
                
                let email = $("#email").val();
                let pwd = $("#pwd").val();
                
                if (!email || !pwd) {
                    showAlert('error', AppSettings.t('empty_fields'));
                    return;
                }
                
                rest.registrarUsuario(email, pwd);
                mostrarSalida("Registrando usuario: " + email);
            });
            
            let btnVolver = '<button type="button" id="btnVolverLogin" class="btn btn-link mt-2"><span data-i18n="login_link">¿Ya tienes cuenta? Inicia sesión</span></button>';
            $("#fmRegistro form").append(btnVolver);
            
            // Aplicar traducción al botón recién añadido
            AppSettings.apply(AppSettings.load());
            
            $("#btnVolverLogin").on("click", function(e) {
                e.preventDefault();
                cw.mostrarLogin();
            });
        });
    };

    this.salir = function () {
    let nick = $.cookie("nick");
    $.removeCookie("nick");
    rest.cerrarSesion();
    if (nick) {
        mostrarSalida("Sesión cerrada: " + nick);
    }
    setTimeout(() => {
        location.reload();
    }, 500);
};

    this.limpiar = function () {
        $("#txt").remove();
        $('#mAU').remove();
        $('#mH').remove();
        $("#fmLogin").remove();
        $("#fmRegistro").remove();
        $("#au").empty();
        $("#registro").empty();
    };

    this.mostrarModal = function(m) {
        $("#msg").remove();
        let cadena = "<div id='msg'>" + m + "</div>";
        $('#mBody').empty().append(cadena);
        $('#miModal').modal();
    };

    // ==================== WIDGET DE CONFIGURACIÓN (REUTILIZABLE) ====================
    /*
    this.inicializarWidgetConfiguracion = function() {
        // Verificar que existan los elementos necesarios
        if (!document.getElementById('settings-icon-header') && !document.getElementById('settings-modal')) {
            console.warn('⚠️ Widget de configuración no encontrado en esta página');
            return;
        }

        let tempSettings = AppSettings.load();

        function loadSettingsUI() {
            const settings = AppSettings.load();
            tempSettings = { ...settings };

            const toggle = document.getElementById('toggle-daltonism');
            if (toggle) {
                if (settings.daltonismo) {
                    toggle.classList.add('active');
                } else {
                    toggle.classList.remove('active');
                }
            }

            document.querySelectorAll('.language-option').forEach(opt => {
                opt.classList.remove('selected');
                if (opt.dataset.lang === settings.idioma) {
                    opt.classList.add('selected');
                }
            });
        }

        const settingsIcon = document.getElementById('settings-icon-header');
        if (settingsIcon) {
            settingsIcon.addEventListener('click', () => {
                document.getElementById('settings-modal').classList.add('active');
                loadSettingsUI();
            });
        }

        const closeBtn = document.getElementById('settings-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('settings-modal').classList.remove('active');
            });
        }

        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'settings-modal') {
                    document.getElementById('settings-modal').classList.remove('active');
                }
            });
        }

        const toggleDaltonism = document.getElementById('toggle-daltonism');
        if (toggleDaltonism) {
            toggleDaltonism.addEventListener('click', (e) => {
                e.currentTarget.classList.toggle('active');
                tempSettings.daltonismo = e.currentTarget.classList.contains('active');
            });
        }

        document.querySelectorAll('.language-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('.language-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                tempSettings.idioma = opt.dataset.lang;
            });
        });

        const applyBtn = document.getElementById('settings-apply');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                const previousSettings = AppSettings.load();
                AppSettings.save(tempSettings);
                document.getElementById('settings-modal').classList.remove('active');
                
                // Mostrar mensaje en el idioma aplicado
                const message = AppSettings.t('settings_applied', tempSettings.idioma);
                
                if (typeof showAlert === 'function') {
                    showAlert('success', message);
                } else {
                    alert(message);
                }
                
                // Recargar si cambió el idioma
                if (previousSettings.idioma !== tempSettings.idioma) {
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                }
            });
        }

        // Cargar configuración inicial
        loadSettingsUI();
    };
    */

    // Aplicar configuración al inicializar ControlWeb
    let initialSettings = AppSettings.load();
    AppSettings.apply(initialSettings);

}