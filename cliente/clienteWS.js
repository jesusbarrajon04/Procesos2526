function ClienteWS() {
    this.socket = undefined;
    this.email = undefined;
    this.codigo = undefined;

    this.ini = function() {
        this.socket = io();
        this.lanzarServidorWS();
    };

    this.crearPartida = function() {
        if (!this.email) {
            console.error("No hay email definido. Inicia sesión primero.");
            mostrarSalida("❌ Debes iniciar sesión para crear una partida");
            return;
        }
        
        console.log("Enviando solicitud crear partida para:", this.email);
        this.socket.emit("crearPartida", { email: this.email });
    };

    this.unirAPartida = function(codigo) {
        if (!this.email) {
            console.error("No hay email definido. Inicia sesión primero.");
            mostrarSalida("❌ Debes iniciar sesión para unirte a una partida");
            return;
        }
        
        console.log("Enviando solicitud unir a partida:", codigo);
        this.socket.emit("unirAPartida", { 
            email: this.email, 
            codigo: codigo 
        });
    };

    this.abandonarPartida = function(codigo) {
        if (!this.email) {
            console.error("No hay email definido");
            return;
        }
        
        console.log("Enviando solicitud abandonar partida:", codigo);
        this.socket.emit("abandonarPartida", {
            email: this.email,
            codigo: codigo
        });
    };

    this.obtenerPartidas = function() {
        console.log("Solicitando lista de partidas");
        this.socket.emit("obtenerPartidas");
    };

    this.obtenerMiPartida = function() {
        if (!this.email) return;
        console.log("Solicitando mi partida");
        this.socket.emit("obtenerMiPartida", { email: this.email });
    };

    this.lanzarServidorWS = function() {
        let cli = this;

        this.socket.on("partidaCreada", function(datos) {
            console.log("✓ Partida creada:", datos);
            cli.codigo = datos.codigo;
            mostrarSalida(`✓ Partida creada con código: ${datos.codigo}`);
            mostrarSalida(`Estado: ${datos.estado} (Esperando rival...)`);
            
            if (typeof cw !== 'undefined' && cw.mostrarEsperandoRival) {
                cw.mostrarEsperandoRival(datos.codigo);
            }
        });

        this.socket.on("unidoAPartida", function(datos) {
            console.log("✓ Unido a partida:", datos);
            cli.codigo = datos.codigo;
            mostrarSalida(`✓ Te has unido a la partida: ${datos.codigo}`);
            
            if (datos.estado === "enCurso") {
                mostrarSalida("⚡ ¡La partida está completa! Esperando inicio...");
            }
        });

        this.socket.on("partidaComenzada", function(datos) {
            console.log("⚡ Partida comenzada:", datos);
            mostrarSalida(`⚡ ${datos.mensaje}`);
            mostrarSalida(`Estado: ${datos.estado}`);
            
            if (typeof cw !== 'undefined' && cw.mostrarPartidaIniciada) {
                cw.mostrarPartidaIniciada(datos.codigo);
            }
        });

        this.socket.on("partidaAbandonada", function(datos) {
            console.log("🚪 Partida abandonada:", datos);
            mostrarSalida(`🚪 ${datos.mensaje}`);
            mostrarSalida(`Estado: ${datos.estado} (Finalizada)`);
            
            if (typeof cw !== 'undefined' && cw.mostrarPartidaFinalizada) {
                cw.mostrarPartidaFinalizada(datos.codigo, datos.abandonadoPor);
            }
        });

        this.socket.on("listaPartidas", function(lista) {
            console.log("Lista de partidas recibida:", lista);
            mostrarSalida(`Partidas totales: ${lista.length}`);
            
            let esperando = lista.filter(p => p.estado === "esperando").length;
            let enCurso = lista.filter(p => p.estado === "enCurso").length;
            let finalizadas = lista.filter(p => p.estado === "finalizada").length;
            
            mostrarSalida(`  - Esperando: ${esperando}`);
            mostrarSalida(`  - En curso: ${enCurso}`);
            mostrarSalida(`  - Finalizadas: ${finalizadas}`);
            
            if (typeof cw !== 'undefined' && cw.mostrarListaPartidas) {
                cw.mostrarListaPartidas(lista);
            }
        });

        this.socket.on("miPartida", function(partida) {
            console.log("Mi partida:", partida);
            if (partida) {
                cli.codigo = partida.codigo;
            }
        });

        this.socket.on("nuevoJugador", function(datos) {
            console.log("✓ Nuevo jugador en partida:", datos);
            mostrarSalida(`✓ ${datos.email} se ha unido a la partida`);
        });

        this.socket.on("errorPartida", function(datos) {
            console.error("✗ Error:", datos.mensaje);
            mostrarSalida(`✗ Error: ${datos.mensaje}`);
            
            if (typeof cw !== 'undefined' && cw.mostrarModal) {
                cw.mostrarModal(datos.mensaje);
            }
        });
    };

    this.ini();
}