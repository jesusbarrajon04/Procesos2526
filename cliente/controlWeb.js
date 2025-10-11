function ControlWeb() {
  this.mostrarAgregarUsuario = function () {
    $("#mAU").remove();

    let cadena = '<div id="mAU" class="form-group">';
    cadena += '<label for="usr">Name:</label>';
    cadena += '<input type="text" class="form-control" id="usr" placeholder="Introduce tu nick">';
    cadena += '<button type="submit" class="btn btn-primary mt-2" id="btnAgregar">Submit</button>';
    cadena += '<button type="button" class="btn btn-secondary mt-2" id="btnCancelar">Cancelar</button>';
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
}
