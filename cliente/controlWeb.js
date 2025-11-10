function ControlWeb() {
  
  this.limpiar = function() {
    $("#au").empty();
    $("#registro").empty();
  };

  this.mostrarMensaje = function(msg) {
    if (typeof mostrarSalida === "function") {
      mostrarSalida(msg);
    } else {
      console.log(msg);
    }
  };

  this.comprobarSesion = function() {
    try {
      let nick = $.cookie("nick");
      if (nick) {
        this.mostrarBienvenida(nick);
      } else {
        this.mostrarLogin();
      }
    } catch (e) {
      console.warn("Error al comprobar sesión:", e);
      this.mostrarLogin();
    }
  };

  this.mostrarBienvenida = function(nick) {
    this.limpiar();
    
    let cadena = '<div id="bienvenida" class="auth-section">';
    cadena += `<h4>¡Bienvenido, ${nick}!</h4>`;
    cadena += '<p>Has iniciado sesión correctamente.</p>';
    cadena += '<button id="btnSalir" class="btn btn-danger">Cerrar sesión</button>';
    cadena += "</div>";

    $("#au").html(cadena);

    $("#btnSalir").on("click", () => {
      this.salir();
    });
  };

  this.mostrarLogin = function () {
    this.limpiar();
    
    $("#au").load("./cliente/login.html", function () {
      $("#btnLogin").on("click", function (e) {
        e.preventDefault();
        let email = $("#email").val();
        let pwd = $("#pwd").val();
        
        if (!email || !pwd) {
          alert("Por favor, introduce email y contraseña");
          return;
        }
        
        rest.loginUsuario(email, pwd);
        console.log("Intentando login:", email);
      });
      
      $("#btnRegistro").on("click", function (e) {
        e.preventDefault();
        cw.mostrarRegistro();
      });
    });
  };

  this.mostrarRegistro = function () {
    this.limpiar();
    
    $("#registro").load("./cliente/registro.html", function () {
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
        console.log("Registrando usuario:", email);
      });
      
      let btnVolver = '<button type="button" id="btnVolverLogin" class="btn btn-link mt-2">¿Ya tienes cuenta? Inicia sesión</button>';
      $("#fmRegistro form").append(btnVolver);
      
      $("#btnVolverLogin").on("click", function(e) {
        e.preventDefault();
        cw.mostrarLogin();
      });
    });
  };

  this.salir = function() {
    let nick = $.cookie("nick");
    $.removeCookie("nick");
    
    if (nick) {
      this.mostrarMensaje("Hasta pronto, " + nick);
    }
    
    location.reload();
  };

  this.mostrarMsg = function(msg) {
    this.mostrarMensaje(msg);
  };
}