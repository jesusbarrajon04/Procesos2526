function ControlWeb() {
    
    this.mostrarAgregarUsuario = function () {
        $('#mAU').remove();

        let cadena = '<div id="mAU" class="form-group">';
         cadena += '<label for="usr">Nick:</label>';
        cadena += '<input type="text" class="form-control" id="usr" placeholder="Introduce tu nick">';
        cadena += '<button type="submit" class="btn btn-primary mt-2" id="btnAgregar">Agregar usuario</button>';
        cadena += '<button type="button" class="btn btn-secondary mt-2" id="btnCancelar">Cancelar</button>';
        cadena += '</div>';
        cadena=cadena+'<div><a href="/auth/google"><img src="/img/neutral/web_neutral_sq_SI@2x.png" style="height:40px;"></a></div>';;
        cadena = cadena + '<div id="msg"></div>'
        cadena = cadena + '</div>';

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
    }

    this.comprobarSesion = function () {
      console.log("Comprobando sesión...");
      let nick = $.cookie("nick");
      if (nick) {
        console.log("Cookie nick:", nick);
        this.mostrarHome(nick); // AQUI
      } else {
        this.mostrarLogin();   /// AQUI
      }
    };

    this.mostrarHome = function (nick) {
        this.limpiar();
        let cadena = "<div id='mH' class='mt-4'>";
        cadena += `<div class="alert alert-success" role="alert">`;
        cadena += `<h4 class="alert-heading">¡Bienvenido, ${nick}!</h4>`;
        cadena += `<p>Has iniciado sesión correctamente en el sistema.</p>`;
        cadena += `</div>`;
        cadena += '<button type="button" class="btn btn-primary mt-2" id="btnCerrarSesion">Cerrar sesión</button>';
        cadena += `</div>`;
        $("#au").html(cadena);

        $("#btnCerrarSesion").on("click", function () {
          cw.salir();
          // cw.mostrarAgregarUsuario();      // AQUI
        });
        
        mostrarSalida("Usuario activo: " + nick);
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
}