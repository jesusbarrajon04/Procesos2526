function ClienteRest() {
  this.agregarUsuario = function (nick) {
    $.getJSON("/agregarUsuario/" + nick, function (data) {
      if (data.nick != -1) {
        mostrarSalida("Usuario " + nick + " ha sido registrado");
      } else {
        mostrarSalida("El nick " + nick + " ya está ocupado");
      }
    }).fail(function (jqxhr, textStatus, error) {
      mostrarSalida("Error en agregarUsuario: " + textStatus + " - " + error);
    });
  };

  this.agregarUsuario2 = function (nick) {
    $.ajax({
      type: "GET",
      url: "/agregarUsuario/" + nick,
      success: function (data) {
        if (data.nick != -1) {
          mostrarSalida("Usuario " + nick + " ha sido registrado (AJAX)");
        } else {
          mostrarSalida("El nick " + nick + " ya está ocupado (AJAX)");
        }
      },
      error: function (xhr, textStatus, errorThrown) {
        mostrarSalida("Error AJAX agregarUsuario2 - Status: " + textStatus + ", Error: " + errorThrown);
      },
      contentType: "application/json"
    });
  };

  this.obtenerUsuarios = function () {
    $.getJSON("/obtenerUsuarios", function (data) {
      mostrarSalida({ action: "obtenerUsuarios", usuarios: data });
    }).fail(function (jqxhr, textStatus, error) {
      mostrarSalida("Error en obtenerUsuarios: " + textStatus + " - " + error);
    });
  };

  this.usuarioActivo = function (nick) {
    $.getJSON("/usuarioActivo/" + nick, function (data) {
      mostrarSalida({ action: "usuarioActivo", nick: nick, activo: data.activo });
    }).fail(function (jqxhr, textStatus, error) {
      mostrarSalida("Error en usuarioActivo: " + textStatus + " - " + error);
    });
  };

  this.numeroUsuarios = function () {
    $.getJSON("/numeroUsuarios", function (data) {
      mostrarSalida({ action: "numeroUsuarios", num: data.num });
    }).fail(function (jqxhr, textStatus, error) {
      mostrarSalida("Error en numeroUsuarios: " + textStatus + " - " + error);
    });
  };

  this.eliminarUsuario = function (nick) {
    $.getJSON("/eliminarUsuario/" + nick, function (data) {
      mostrarSalida({ action: "eliminarUsuario", eliminado: data.eliminado });
    }).fail(function (jqxhr, textStatus, error) {
      mostrarSalida("Error en eliminarUsuario: " + textStatus + " - " + error);
    });
  };
}
