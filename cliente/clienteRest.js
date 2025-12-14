function ClienteRest() {
    
    this.registrarUsuario = function (email, password) {
        $.ajax({
            type: 'POST',
            url: '/registrarUsuario',
            data: JSON.stringify({ "email": email, "password": password }),
            success: function (data) {
                if (data.nick && data.nick != -1) {
                    console.log("Usuario " + data.nick + " ha sido registrado");
                    mostrarSalida("Registro exitoso. Revisa tu email para confirmar.");
                    
                    setTimeout(function() {
                        cw.mostrarLogin();
                    }, 2000);
                } else {
                    console.log("El email ya está registrado");
                    mostrarSalida("Error: El email ya está registrado");
                    cw.mostrarModal("No se ha podido registrar el usuario. El email ya está en uso.");
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Error - Status: " + textStatus);
                console.log("Error: " + errorThrown);
                mostrarSalida("Error en el registro");
                alert("Error al registrar. Inténtalo de nuevo.");
            },
            contentType: 'application/json'
        });
    };

    this.loginUsuario = function (email, password) {
        $.ajax({
            type: 'POST',
            url: '/loginUsuario',
            data: JSON.stringify({ "email": email, "password": password }),
            success: function (data) {
                if (data.nick && data.nick != -1) {
                    console.log("Usuario " + data.nick + " ha iniciado sesión");
                    $.cookie("nick", data.nick);
                    
                    if (typeof ws !== 'undefined') {
                        ws.email = data.nick;
                    }
                    
                    mostrarSalida("Inicio de sesión exitoso");

                    setTimeout(function() {
                        location.reload();
                    }, 500);
                } else {
                    console.log("Usuario o clave incorrectos");
                    mostrarSalida("Credenciales incorrectas");
                    cw.mostrarModal("No se ha podido iniciar sesión. Comprueba tu email y contraseña.");
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Error - Status: " + textStatus);
                console.log("Error: " + errorThrown);
                mostrarSalida("Error al iniciar sesión");
                alert("Error. Verifica que tu cuenta esté confirmada.");
            },
            contentType: 'application/json'
        });
    };

    this.cerrarSesion = function () {
      $.getJSON("/cerrarSesion", function () {
        console.log("Sesión cerrada en el servidor");
        $.removeCookie("nick");
      });
    };

    this.agregarUsuario = function (nick) {
        $.getJSON("/agregarUsuario/" + nick, function (data) {
            if (data.nick != -1) {
                console.log("Usuario " + nick + " ha sido registrado");
                $.cookie("nick", data.nick);
                
                if (typeof ws !== 'undefined') {
                    ws.email = data.nick;
                }
                
                mostrarSalida("Usuario agregado: " + nick);
                cw.mostrarHome(nick);
            } else {
                console.log("El nick ya está ocupado");
                mostrarSalida("El nick ya está ocupado");
            }
        });
    };

    this.obtenerUsuarios = function () {
        $.getJSON("/obtenerUsuarios", function (data) {
            console.log(data);
            mostrarSalida("Usuarios: " + JSON.stringify(data, null, 2));
        });
    };

    this.eliminarUsuario = function (nick) {
        $.getJSON("/eliminarUsuario/" + nick, function (data) {
            if (data.nick != -1) {
                console.log("Usuario " + nick + " ha sido eliminado");
                mostrarSalida("Usuario eliminado: " + nick);
            } else {
                console.log("El nick no existe");
                mostrarSalida("El nick no existe");
            }
        });
    };

    this.numeroUsuarios = function () {
        $.getJSON("/numeroUsuarios", function (data) {
            console.log(data.numero);
            mostrarSalida("Número de usuarios: " + data.numero);
        });
    };
    
    this.usuarioActivo = function (nick) {
        $.getJSON("/usuarioActivo/" + nick, function (data) {
            console.log(data.activo);
            mostrarSalida("Usuario " + nick + " activo: " + data.activo);
        });
    };
}