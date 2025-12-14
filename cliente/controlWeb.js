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
            alert("Por favor, introduce un nick");
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
        cadena += `<div class="alert alert-success" role="alert">`;
        cadena += `<h4 class="alert-heading">¡Bienvenido, ${nick}!</h4>`;
        cadena += `<p>Has iniciado sesión correctamente en el sistema.</p>`;
        cadena += `</div>`;
        
        cadena += '<div class="mt-3">';
        cadena += '<button type="button" class="btn btn-primary mr-2" id="btnCrearPartida">🎮 Crear Partida</button>';
        cadena += '<button type="button" class="btn btn-info mr-2" id="btnVerPartidas">📋 Ver Partidas</button>';
        cadena += '<button type="button" class="btn btn-warning mr-2" id="btnVerLogs">📊 Ver Actividad</button>';
        cadena += '<button type="button" class="btn btn-danger" id="btnCerrarSesion">Cerrar sesión</button>';
        cadena += '</div>';
        
        cadena += '<div id="zonaPartidas" class="mt-4"></div>';
        
        cadena += `</div>`;
        
        console.log("HTML generado");
        $("#au").html(cadena);
        console.log("HTML insertado en #au");

        $("#btnCerrarSesion").on("click", function () {
          console.log("Botón cerrar sesión clickeado");
          cw.salir();
        });
        
        $("#btnCrearPartida").on("click", function() {
          console.log("Botón crear partida clickeado");
          ws.crearPartida();
        });
        
        $("#btnVerPartidas").on("click", function() {
          console.log("Botón ver partidas clickeado");
          ws.obtenerPartidas();
        });
        
        $("#btnVerLogs").on("click", function() {
          console.log("Botón ver logs clickeado");
          cw.mostrarLogs();
        });
        
        console.log("Event listeners configurados");
        mostrarSalida("Usuario activo: " + nick);
        console.log("=== mostrarHome completado ===");
    };

    this.mostrarEsperandoRival = function(codigo) {
        let cadena = '<div class="alert alert-warning" role="alert">';
        cadena += `<h5>⏳ Esperando rival...</h5>`;
        cadena += `<p><strong>Código de partida:</strong> <code>${codigo}</code></p>`;
        cadena += `<p class="mb-0">Comparte este código con otro jugador para que se una.</p>`;
        cadena += '</div>';
        
        $("#zonaPartidas").html(cadena);
    };

    this.mostrarPartidaIniciada = function(codigo) {
        let cadena = '<div class="alert alert-success" role="alert">';
        cadena += `<h5>¡Partida iniciada!</h5>`;
        cadena += `<p><strong>Código:</strong> <code>${codigo}</code></p>`;
        cadena += `<p class="mb-0">Todos los jugadores están listos.</p>`;
        cadena += '</div>';
        
        $("#zonaPartidas").html(cadena);
    };

    this.mostrarListaPartidas = function(lista) {
        let cadena = '<div class="card">';
        cadena += '<div class="card-header"><h5>📋 Partidas</h5></div>';
        cadena += '<div class="card-body">';
        
        if (lista.length === 0) {
            cadena += '<p class="text-muted">No hay partidas en este momento.</p>';
        } else {
            cadena += '<table class="table table-striped">';
            cadena += '<thead><tr>';
            cadena += '<th>Código</th>';
            cadena += '<th>Creador</th>';
            cadena += '<th>Jugadores</th>';
            cadena += '<th>Estado</th>';
            cadena += '<th>Acción</th>';
            cadena += '</tr></thead>';
            cadena += '<tbody>';
            
            let miEmail = ws.email;
            
            lista.forEach(function(partida) {
                cadena += '<tr>';
                cadena += `<td><code>${partida.codigo}</code></td>`;
                cadena += `<td>${partida.creador}</td>`;
                cadena += `<td>${partida.numJugadores}/${partida.maxJugadores}</td>`;
                
                let estadoHTML = '';
                switch(partida.estado) {
                    case 'esperando':
                        estadoHTML = '<span class="badge badge-warning">⏳ Esperando</span>';
                        break;
                    case 'enCurso':
                        estadoHTML = '<span class="badge badge-success">⚡ En curso</span>';
                        break;
                    case 'finalizada':
                        estadoHTML = '<span class="badge badge-secondary">🏁 Finalizada</span>';
                        break;
                }
                cadena += `<td>${estadoHTML}</td>`;
                
                let accionHTML = '';
                
                let soyCreador = (partida.creador === miEmail);
                
                if (partida.estado === 'esperando') {
                    if (soyCreador) {
                        accionHTML = '<small class="text-info">⏳ Tu partida</small>';
                    } else {
                        accionHTML = `<button class="btn btn-sm btn-success btnUnir" data-codigo="${partida.codigo}">Unirse</button>`;
                    }
                } else if (partida.estado === 'enCurso') {
                    if (soyCreador || partida.numJugadores === 2) {
                        accionHTML = `<button class="btn btn-sm btn-danger btnAbandonar" data-codigo="${partida.codigo}">Abandonar</button>`;
                    } else {
                        accionHTML = '<small class="text-muted">-</small>';
                    }
                } else if (partida.estado === 'finalizada') {
                    if (partida.abandonadoPor) {
                        accionHTML = `<small class="text-muted">Abandonada por ${partida.abandonadoPor}</small>`;
                    } else {
                        accionHTML = '<small class="text-muted">-</small>';
                    }
                } else {
                    accionHTML = '<small class="text-muted">-</small>';
                }
                cadena += `<td>${accionHTML}</td>`;
                cadena += '</tr>';
            });
            cadena += '</tbody></table>';
        }
        cadena += '</div></div>';
        
        $("#zonaPartidas").html(cadena);
        
        $(".btnUnir").on("click", function() {
            let codigo = $(this).data("codigo");
            ws.unirAPartida(codigo);
        });
        
        $(".btnAbandonar").on("click", function() {
            let codigo = $(this).data("codigo");
            if (confirm("¿Estás seguro de que quieres abandonar la partida?")) {
                ws.abandonarPartida(codigo);
            }
        });
    };

    this.mostrarLogin = function () {
        this.limpiar();
        $("#registro").load("login.html", function () {
            const googleBtn = `<div class="text-center mt-3">
                <a href="/auth/google"><img src="/img/neutral/web_neutral_sq_SI@2x.png" style="height:40px;"></a></div>
                <hr class="my-4">`;
            $("#btnGS").replaceWith(googleBtn);

            $("#btnLogin").on("click", function (e) {
                e.preventDefault();
                let email = $("#email").val();
                let pwd = $("#pwd").val();
                
                if (!email || !pwd) {
                    alert("Por favor, introduce email y contraseña");
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
            $("#btnRegistro").on("click", function (e) {
                e.preventDefault();
                
                let email = $("#email").val();
                let pwd = $("#pwd").val();
                let nombre = $("#nombre").val();
                let apellidos = $("#apellidos").val();
                
                if (!email || !pwd) {
                    alert("Email y contraseña son obligatorios");
                    return;
                }
                
                rest.registrarUsuario(email, pwd);
                mostrarSalida("Registrando usuario: " + email);
            });
            
            let btnVolver = '<button type="button" id="btnVolverLogin" class="btn btn-link mt-2">¿Ya tienes cuenta? Inicia sesión</button>';
            $("#fmRegistro form").append(btnVolver);
            
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

    this.mostrarLogs = function() {
        $.getJSON("/obtenerLogs", function(logs) {
            let cadena = '<div class="card">';
            cadena += '<div class="card-header"><h5>Registro de Actividad</h5></div>';
            cadena += '<div class="card-body" style="max-height: 400px; overflow-y: auto;">';
            
            if (logs.length === 0) {
                cadena += '<p class="text-muted">No hay registros de actividad.</p>';
            } else {
                cadena += '<table class="table table-sm table-striped">';
                cadena += '<thead><tr>';
                cadena += '<th>Fecha/Hora</th>';
                cadena += '<th>Operación</th>';
                cadena += '<th>Usuario</th>';
                cadena += '<th>Detalles</th>';
                cadena += '</tr></thead>';
                cadena += '<tbody>';
                
                logs.forEach(function(log) {
                    let fecha = new Date(log.fechaHora);
                    let fechaStr = fecha.toLocaleString('es-ES');
                    
                    let operacion = log.tipoOperacion || '-';
                    let usuario = log.usuario || '-';
                    let detalles = log.detalles ? JSON.stringify(log.detalles) : '-';
                    
                    let icono = '';
                    switch(operacion) {
                        case 'registroUsuario':
                            icono = '👤 ';
                            break;
                        case 'inicioLocal':
                            icono = '🔑 ';
                            break;
                        case 'inicioGoogle':
                            icono = '🌐 ';
                            break;
                        case 'crearPartida':
                            icono = '🎮 ';
                            break;
                        case 'unirAPartida':
                            icono = '🤝 ';
                            break;
                        case 'cerrarSesion':
                            icono = '🚪 ';
                            break;
                    }
                    
                    cadena += '<tr>';
                    cadena += `<td style="font-size: 0.85em;">${fechaStr}</td>`;
                    cadena += `<td>${icono}${operacion}</td>`;
                    cadena += `<td>${usuario}</td>`;
                    cadena += `<td style="font-size: 0.85em;">${detalles}</td>`;
                    cadena += '</tr>';
                });
                
                cadena += '</tbody></table>';
            }
            
            cadena += '</div></div>';
            
            $("#zonaPartidas").html(cadena);
            mostrarSalida(`Logs cargados: ${logs.length} registros`);
        }).fail(function() {
            mostrarSalida("Error al cargar logs");
        });
    };
    this.mostrarPartidaFinalizada = function(codigo, abandonadoPor) {
        let cadena = '<div class="alert alert-danger" role="alert">';
        cadena += `<h5>🏁 Partida Finalizada</h5>`;
        cadena += `<p><strong>Código:</strong> <code>${codigo}</code></p>`;
        
        if (abandonadoPor) {
            if (abandonadoPor === ws.email) {
                cadena += `<p class="mb-0">Has abandonado la partida.</p>`;
            } else {
                cadena += `<p class="mb-0">${abandonadoPor} ha abandonado la partida.</p>`;
            }
        }
        
        cadena += '<button class="btn btn-primary mt-2" id="btnVolverPartidas">Ver otras partidas</button>';
        cadena += '</div>';
        
        $("#zonaPartidas").html(cadena);
        
        $("#btnVolverPartidas").on("click", function() {
            ws.obtenerPartidas();
        });
    };
}