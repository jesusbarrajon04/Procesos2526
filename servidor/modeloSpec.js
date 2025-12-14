const modelo = require("./modelo.js");

// ESTAS PRUEBAS NO SON LAS DEFINITIVAS

describe('El sistema - Usuarios', function() {
  let sistema;

  beforeEach(function() {
    sistema = new modelo.Sistema({test: true});
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
    expect(usuarios.length).toEqual(2);
    expect(usuarios[0].nick).toEqual("Jesus");
    expect(usuarios[1].nick).toEqual("Maria");
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

describe('El sistema - Partidas', function() {
  let sistema;
  let usr1, usr2, usr3;

  beforeEach(function() {
    sistema = new modelo.Sistema({test: true});
    
    usr1 = "pepe@pepe.es";
    usr2 = "luis@luis.es";
    usr3 = "ana@ana.es";
    
    sistema.agregarUsuario(usr1);
    sistema.agregarUsuario(usr2);
    sistema.agregarUsuario(usr3);
  });

  it('inicialmente no hay partidas', function() {
    expect(sistema.obtenerPartidasDisponibles().length).toEqual(0);
  });

  it('usuarios y partidas en el sistema', function() {
    expect(sistema.numeroUsuarios().num).toEqual(3);
    expect(sistema.obtenerPartidasDisponibles().length).toEqual(0);
  });

  it('puede crear una partida', function() {
    let codigo = sistema.crearPartida(usr1);
    
    expect(codigo).not.toEqual(-1);
    expect(typeof codigo).toBe('string');
    expect(codigo.length).toEqual(6);
    expect(sistema.partidas[codigo]).toBeDefined();
    expect(sistema.partidas[codigo].jugadores.length).toEqual(1);
    expect(sistema.partidas[codigo].jugadores[0].nick).toEqual(usr1);
  });

  it('puede unirse a una partida', function() {
    let codigo = sistema.crearPartida(usr1);
    let resultado = sistema.unirAPartida(usr2, codigo);
    
    expect(resultado.resultado).toEqual(codigo);
    expect(resultado.mensaje).toEqual("Unido correctamente");
    expect(sistema.partidas[codigo].jugadores.length).toEqual(2);
    expect(sistema.partidas[codigo].jugadores[1].nick).toEqual(usr2);
  });

  it('un usuario no puede unirse dos veces a la misma partida', function() {
    let codigo = sistema.crearPartida(usr1);
    let resultado = sistema.unirAPartida(usr1, codigo);
    
    expect(resultado.resultado).toEqual(-1);
    expect(resultado.mensaje).toEqual("Ya estás en esta partida");
    expect(sistema.partidas[codigo].jugadores.length).toEqual(1);
  });

  it('no permite unirse a una partida llena', function() {
    let codigo = sistema.crearPartida(usr1);
    sistema.unirAPartida(usr2, codigo);
    let resultado = sistema.unirAPartida(usr3, codigo);
    
    expect(resultado.resultado).toEqual(-1);
    expect(resultado.mensaje).toEqual("Partida llena");
    expect(sistema.partidas[codigo].jugadores.length).toEqual(2);
  });

  it('obtiene solo las partidas disponibles', function() {
    let codigo1 = sistema.crearPartida(usr1);
    
    let codigo2 = sistema.crearPartida(usr2);
    sistema.unirAPartida(usr3, codigo2);
    
    let disponibles = sistema.obtenerPartidasDisponibles();
    
    expect(disponibles.length).toEqual(1);
    expect(disponibles[0].codigo).toEqual(codigo1);
    expect(disponibles[0].creador).toEqual(usr1);
    expect(disponibles[0].numJugadores).toEqual(1);
    expect(disponibles[0].maxJugadores).toEqual(2);
  });

  it('no puede crear partida con usuario inexistente', function() {
    let codigo = sistema.crearPartida("noexiste@noexiste.es");
    expect(codigo).toEqual(-1);
  });

  it('no puede unirse a partida inexistente', function() {
    let resultado = sistema.unirAPartida(usr1, "NOEXISTE");
    expect(resultado.resultado).toEqual(-1);
    expect(resultado.mensaje).toEqual("Partida no encontrada");
  });

  it('genera códigos únicos para cada partida', function() {
    let codigo1 = sistema.crearPartida(usr1);
    let codigo2 = sistema.crearPartida(usr2);
    let codigo3 = sistema.crearPartida(usr3);
    
    expect(codigo1).not.toEqual(codigo2);
    expect(codigo1).not.toEqual(codigo3);
    expect(codigo2).not.toEqual(codigo3);
  });
});