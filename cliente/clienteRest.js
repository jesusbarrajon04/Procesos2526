function ClienteRest() {

  this.registrarUsuario = function (email, password) {
    $.ajax({
      type: 'POST',
      url: '/registrarUsuario',
      data: JSON.stringify({ "email": email, "password": password }),
      success: function (data) {
        if (data.nick && data.nick != -1) {
          console.log("Usuario " + data.nick + " ha sido registrado");
          mostrarSalida("✓ Registro exitoso. Revisa tu email para confirmar la cuenta.");
          
          // Mostrar mensaje y luego el login
          setTimeout(function() {
            cw.mostrarLogin();
          }, 2000);
        } else {
          console.log("El email ya está registrado");
          mostrarSalida("✗ Error: El email ya está registrado");
          alert("Este email ya está registrado");
        }
      },
      error: function (xhr, textStatus, errorThrown) {
        console.log("Error al registrar - Status: " + textStatus);
        console.log("Error: " + errorThrown);
        mostrarSalida("✗ Error en el registro: " + textStatus);
        alert("Error al registrar usuario. Inténtalo de nuevo.");
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
          mostrarSalida("✓ Inicio de sesión exitoso");
          
          // Recargar para mostrar bienvenida
          setTimeout(function() {
            location.reload();
          }, 500);
        } else {
          console.log("Usuario o clave incorrectos");
          mostrarSalida("✗ Email o contraseña incorrectos");
          alert("Email o contraseña incorrectos");
        }
      },
      error: function (xhr, textStatus, errorThrown) {
        console.log("Error al iniciar sesión - Status: " + textStatus);
        console.log("Error: " + errorThrown);
        mostrarSalida("✗ Error al iniciar sesión: " + textStatus);
        alert("Error al iniciar sesión. Verifica que tu cuenta esté confirmada.");
      },
      contentType: 'application/json'
    });
  };

  this.agregarUsuario = function (nick) {
    $.getJSON("/agregarUsuario/" + nick, function (data) {
      let msg = "El nick " + nick + " ya está ocupado";
      if (data.nick != -1) {
        mostrarSalida("✓ Usuario " + nick + " ha sido registrado");
        console.log("Bienvenido al sistema " + nick);
        $.cookie("nick", nick);
      } else {
        mostrarSalida("✗ " + msg);
      }
    }).fail(function (jqxhr, textStatus, error) {
      mostrarSalida("✗ Error en agregarUsuario: " + textStatus + " - " + error);
    });
  };

  this.obtenerUsuarios = function () {
    $.getJSON("/obtenerUsuarios", function (data) {
      mostrarSalida({ action: "obtenerUsuarios", usuarios: data });
    }).fail(function (jqxhr, textStatus, error) {
      mostrarSalida("✗ Error en obtenerUsuarios: " + textStatus + " - " + error);
    });
  };

  this.usuarioActivo = function (nick) {
    $.getJSON("/usuarioActivo/" + nick, function (data) {
      mostrarSalida({ action: "usuarioActivo", nick: nick, activo: data.activo });
    }).fail(function (jqxhr, textStatus, error) {
      mostrarSalida("✗ Error en usuarioActivo: " + textStatus + " - " + error);
    });
  };

  this.numeroUsuarios = function () {
    $.getJSON("/numeroUsuarios", function (data) {
      mostrarSalida({ action: "numeroUsuarios", num: data.num });
    }).fail(function (jqxhr, textStatus, error) {
      mostrarSalida("✗ Error en numeroUsuarios: " + textStatus + " - " + error);
    });
  };

  this.eliminarUsuario = function (nick) {
    $.getJSON("/eliminarUsuario/" + nick, function (data) {
      mostrarSalida({ action: "eliminarUsuario", eliminado: data.eliminado });
    }).fail(function (jqxhr, textStatus, error) {
      mostrarSalida("✗ Error en eliminarUsuario: " + textStatus + " - " + error);
    });
  };
}