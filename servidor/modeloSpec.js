const modelo = require("./modelo.js");

describe('El sistema', function() {
  let sistema;

  beforeEach(function() {
    sistema = new modelo.Sistema();
  });

  it('inicialmente no hay usuarios', function() {
    expect(sistema.numeroUsuarios().num).toEqual(0);
  });

  it('usuario agregado correctamente', function() {
    sistema.agregarUsuario("Jesus");
    expect(sistema.numeroUsuarios().num).toEqual(1);
    expect(sistema.usuarioActivo("Jesus")).toBe(true);
  });

  it('devuelve todos los usuarios registrados', function() {
    sistema.agregarUsuario("Jesus");
    sistema.agregarUsuario("Maria");
    const usuarios = sistema.obtenerUsuarios();
    expect(Object.keys(usuarios)).toEqual(["Jesus", "Maria"]);
  });

  it('devuelve si un usuario está activo o no', function() {
    sistema.agregarUsuario("Juan");
    expect(sistema.usuarioActivo("Juan")).toBe(true);
    expect(sistema.usuarioActivo("Pedro")).toBe(false);
  });

  it('elimina un usuario del sistema', function() {
    sistema.agregarUsuario("Ana");
    expect(sistema.usuarioActivo("Ana")).toBe(true);
    sistema.eliminarUsuario("Ana");
    expect(sistema.usuarioActivo("Ana")).toBe(false);
    expect(sistema.numeroUsuarios().num).toEqual(0);
  });

});