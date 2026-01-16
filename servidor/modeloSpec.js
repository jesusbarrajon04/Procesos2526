const modelo = require("./modelo.js");

// ==================== PRUEBAS DE USUARIOS (SIN BD) ====================

describe('El sistema - Usuarios', function() {
  let sistema;

  beforeEach(function() {
    sistema = new modelo.Sistema({test: true});
  });

  it('inicialmente no hay usuarios', function() {
    expect(sistema.numeroUsuarios().num).toEqual(0);
  });

  it('usuario agregado correctamente', function() {
    sistema.agregarUsuario("jesus@uclm.es");
    expect(sistema.numeroUsuarios().num).toEqual(1);
    expect(sistema.usuarioActivo("jesus@uclm.es")).toBe(true);
  });

  it('no permite agregar el mismo usuario dos veces', function() {
    let res1 = sistema.agregarUsuario("maria@uclm.es");
    let res2 = sistema.agregarUsuario("maria@uclm.es");
    
    expect(res1.nick).toEqual("maria@uclm.es");
    expect(res2.nick).toEqual(-1);
    expect(sistema.numeroUsuarios().num).toEqual(1);
  });

  it('devuelve todos los usuarios registrados', function() {
    sistema.agregarUsuario("jesus@uclm.es");
    sistema.agregarUsuario("maria@uclm.es");
    const usuarios = sistema.obtenerUsuarios();
    
    expect(usuarios.length).toEqual(2);
    expect(usuarios[0].nick).toEqual("jesus@uclm.es");
    expect(usuarios[1].nick).toEqual("maria@uclm.es");
  });

  it('devuelve si un usuario está activo o no', function() {
    sistema.agregarUsuario("juan@uclm.es");
    
    expect(sistema.usuarioActivo("juan@uclm.es")).toBe(true);
    expect(sistema.usuarioActivo("pedro@uclm.es")).toBe(false);
  });

  it('elimina un usuario del sistema', function() {
    sistema.agregarUsuario("ana@uclm.es");
    expect(sistema.usuarioActivo("ana@uclm.es")).toBe(true);
    
    let res = sistema.eliminarUsuario("ana@uclm.es");
    
    expect(res.nick).toEqual("ana@uclm.es");
    expect(sistema.usuarioActivo("ana@uclm.es")).toBe(false);
    expect(sistema.numeroUsuarios().num).toEqual(0);
  });

  it('no puede eliminar un usuario inexistente', function() {
    let res = sistema.eliminarUsuario("noexiste@uclm.es");
    expect(res.nick).toEqual(-1);
  });

  it('gestiona múltiples usuarios simultáneamente', function() {
    sistema.agregarUsuario("user1@uclm.es");
    sistema.agregarUsuario("user2@uclm.es");
    sistema.agregarUsuario("user3@uclm.es");
    
    expect(sistema.numeroUsuarios().num).toEqual(3);
    
    sistema.eliminarUsuario("user2@uclm.es");
    expect(sistema.numeroUsuarios().num).toEqual(2);
    expect(sistema.usuarioActivo("user2@uclm.es")).toBe(false);
    expect(sistema.usuarioActivo("user1@uclm.es")).toBe(true);
    expect(sistema.usuarioActivo("user3@uclm.es")).toBe(true);
  });
});

// ==================== PRUEBAS DE GRUPOS (SIN BD) ====================

describe('El sistema - Grupos', function() {
  let sistema;
  let usr1, usr2, usr3, usr4;

  beforeEach(function() {
    sistema = new modelo.Sistema({test: true});
    
    usr1 = "pepe@uclm.es";
    usr2 = "luis@uclm.es";
    usr3 = "ana@uclm.es";
    usr4 = "carlos@uclm.es";
    
    sistema.agregarUsuario(usr1);
    sistema.agregarUsuario(usr2);
    sistema.agregarUsuario(usr3);
    sistema.agregarUsuario(usr4);
  });

  it('inicialmente no hay grupos', function() {
    expect(sistema.obtenerGruposDisponibles().length).toEqual(0);
  });

  it('puede crear un grupo público', function() {
    let codigo = sistema.crearGrupo(usr1, "Grupo Café", false);
    
    expect(codigo).not.toEqual(-1);
    expect(typeof codigo).toBe('string');
    expect(codigo.length).toEqual(6);
    expect(sistema.grupos[codigo]).toBeDefined();
    expect(sistema.grupos[codigo].miembros.length).toEqual(1);
    expect(sistema.grupos[codigo].creador).toEqual(usr1);
    expect(sistema.grupos[codigo].privado).toBe(false);
  });

  it('puede crear un grupo privado', function() {
    let codigo = sistema.crearGrupo(usr1, "Grupo Privado", true);
    
    expect(codigo).not.toEqual(-1);
    expect(sistema.grupos[codigo].privado).toBe(true);
  });

  it('no puede crear grupo con usuario inexistente', function() {
    let codigo = sistema.crearGrupo("noexiste@uclm.es", "Grupo Test", false);
    expect(codigo).toEqual(-1);
  });

  it('genera códigos únicos para cada grupo', function() {
    let codigo1 = sistema.crearGrupo(usr1, "Grupo 1", false);
    let codigo2 = sistema.crearGrupo(usr2, "Grupo 2", false);
    let codigo3 = sistema.crearGrupo(usr3, "Grupo 3", false);
    
    expect(codigo1).not.toEqual(codigo2);
    expect(codigo1).not.toEqual(codigo3);
    expect(codigo2).not.toEqual(codigo3);
  });

  it('puede unirse a un grupo público', function() {
    let codigo = sistema.crearGrupo(usr1, "Grupo Abierto", false);
    let resultado = sistema.unirseAlGrupo(usr2, codigo, false);
    
    expect(resultado.resultado).toEqual(codigo);
    expect(resultado.mensaje).toEqual("Unido correctamente");
    expect(sistema.grupos[codigo].miembros.length).toEqual(2);
  });

  it('NO puede unirse a un grupo privado sin invitación', function() {
    let codigo = sistema.crearGrupo(usr1, "Grupo Privado", true);
    let resultado = sistema.unirseAlGrupo(usr2, codigo, false);
    
    expect(resultado.resultado).toEqual(-1);
    expect(resultado.mensaje).toContain("privado");
  });

  it('puede unirse a un grupo privado con invitación', function() {
    let codigo = sistema.crearGrupo(usr1, "Grupo Privado", true);
    let resultado = sistema.unirseAlGrupo(usr2, codigo, true);
    
    expect(resultado.resultado).toEqual(codigo);
    expect(sistema.grupos[codigo].miembros.length).toEqual(2);
  });

  it('puede salir de un grupo', function() {
    let codigo = sistema.crearGrupo(usr1, "Grupo Test", false);
    sistema.unirseAlGrupo(usr2, codigo, false);
    
    let resultado = sistema.salirDelGrupo(usr2, codigo);
    
    expect(resultado.resultado).toEqual(codigo);
    expect(sistema.grupos[codigo].miembros.length).toEqual(1);
  });

  it('el grupo se cierra cuando sale el último miembro', function() {
    let codigo = sistema.crearGrupo(usr1, "Grupo Test", false);
    let resultado = sistema.salirDelGrupo(usr1, codigo);
    
    expect(resultado.estado).toEqual("cerrado");
    expect(sistema.grupos[codigo].estado).toEqual("cerrado");
  });
});

// ==================== PRUEBAS DE MENSAJES (SIN BD) ====================

describe('El sistema - Mensajes de Grupo', function() {
  let sistema;
  let usr1, usr2, codigo;

  beforeEach(function() {
    sistema = new modelo.Sistema({test: true});
    
    usr1 = "pepe@uclm.es";
    usr2 = "luis@uclm.es";
    
    sistema.agregarUsuario(usr1);
    sistema.agregarUsuario(usr2);
    
    codigo = sistema.crearGrupo(usr1, "Grupo Chat", false);
    sistema.unirseAlGrupo(usr2, codigo, false);
  });

  it('puede enviar un mensaje al grupo', function() {
    let resultado = sistema.enviarMensajeGrupo(usr1, codigo, "Hola a todos");
    
    expect(resultado.resultado).toEqual(codigo);
    expect(resultado.mensaje.autor).toEqual(usr1);
    expect(resultado.mensaje.mensaje).toEqual("Hola a todos");
  });

  it('no puede enviar mensaje si no es miembro', function() {
    let usr3 = "ana@uclm.es";
    sistema.agregarUsuario(usr3);
    
    let resultado = sistema.enviarMensajeGrupo(usr3, codigo, "Hola");
    
    expect(resultado.resultado).toEqual(-1);
  });

  it('los mensajes se almacenan en el grupo', function() {
    sistema.enviarMensajeGrupo(usr1, codigo, "Mensaje 1");
    sistema.enviarMensajeGrupo(usr2, codigo, "Mensaje 2");
    
    let mensajes = sistema.obtenerMensajesGrupo(codigo);
    
    expect(mensajes.length >= 2).toBe(true);
  });
});

// ==================== PRUEBAS DE SOLICITUDES (SIN BD) ====================

describe('El sistema - Solicitudes e Invitaciones', function() {
  let sistema;
  let usr1, usr2, codigoPrivado;

  beforeEach(function() {
    sistema = new modelo.Sistema({test: true});
    
    usr1 = "pepe@uclm.es";
    usr2 = "luis@uclm.es";
    
    sistema.agregarUsuario(usr1);
    sistema.agregarUsuario(usr2);
    
    codigoPrivado = sistema.crearGrupo(usr1, "Grupo Privado", true);
  });

  it('puede solicitar unirse a un grupo privado', function() {
    let resultado = sistema.solicitarUnionGrupo(usr2, codigoPrivado);
    
    expect(resultado.resultado).toEqual(codigoPrivado);
    expect(sistema.grupos[codigoPrivado].solicitudesPendientes).toContain(usr2);
  });

  it('puede aprobar una solicitud', function() {
    sistema.solicitarUnionGrupo(usr2, codigoPrivado);
    let resultado = sistema.responderSolicitud(codigoPrivado, usr2, true, usr1);
    
    expect(resultado.aprobado).toBe(true);
    expect(sistema.grupos[codigoPrivado].miembros.length).toEqual(2);
  });

  it('puede rechazar una solicitud', function() {
    sistema.solicitarUnionGrupo(usr2, codigoPrivado);
    let resultado = sistema.responderSolicitud(codigoPrivado, usr2, false, usr1);
    
    expect(resultado.aprobado).toBe(false);
    expect(sistema.grupos[codigoPrivado].miembros.length).toEqual(1);
  });
});

// ==================== PRUEBAS DE CARRITO (SIN BD) ====================

describe('El sistema - Carrito de Compra', function() {
  let carrito;
  let producto1, producto2;

  beforeEach(function() {
    carrito = [];
    
    producto1 = {id: 1, title: "Bocadillo de jamón", price: 4.5, qty: 1};
    producto2 = {id: 2, title: "Café con leche", price: 1.8, qty: 1};
  });

  it('puede añadir un producto al carrito', function() {
    carrito.push(producto1);
    
    expect(carrito.length).toEqual(1);
    expect(carrito[0].id).toEqual(1);
  });

  it('calcula correctamente el total del carrito', function() {
    producto1.qty = 2;
    carrito.push(producto1);
    carrito.push(producto2);
    
    let total = carrito.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    expect(total).toEqual(10.8);
  });

  it('puede eliminar un producto del carrito', function() {
    carrito.push(producto1);
    carrito.push(producto2);
    
    carrito.splice(0, 1);
    
    expect(carrito.length).toEqual(1);
    expect(carrito[0].id).toEqual(2);
  });

  it('incrementa la cantidad si el producto existe', function() {
    carrito.push(producto1);
    
    let existe = carrito.find(item => item.id === producto1.id);
    if (existe) {
      existe.qty++;
    }
    
    expect(carrito[0].qty).toEqual(2);
  });
});

// ==================== PRUEBAS DE VALIDACIÓN ====================

describe('El sistema - Validaciones', function() {
  it('valida estructura de pedido', function() {
    let pedido = {
      usuarioEmail: "test@uclm.es",
      items: [
        {id: 1, title: "Bocadillo", price: 4.5, qty: 2}
      ],
      total: 9.0,
      metodoPago: "Tarjeta"
    };
    
    expect(pedido.usuarioEmail).toBeDefined();
    expect(pedido.items.length).toBeGreaterThan(0);
    expect(pedido.total).toBeGreaterThan(0);
    expect(pedido.metodoPago).toBeDefined();
  });

  it('valida estructura de reserva', function() {
    let reserva = {
      usuarioEmail: "test@uclm.es",
      mesas: [1, 2],
      numPersonas: 6,
      horaInicio: "14:00",
      horaFin: "15:30"
    };
    
    expect(reserva.mesas.length).toBeGreaterThan(0);
    expect(reserva.numPersonas).toBeGreaterThan(0);
    expect(reserva.horaFin > reserva.horaInicio).toBe(true);
  });

  it('calcula mesas necesarias correctamente', function() {
    let capacidadPorMesa = 4;
    let casos = [
      {personas: 1, mesas: 1},
      {personas: 4, mesas: 1},
      {personas: 5, mesas: 2},
      {personas: 8, mesas: 2},
      {personas: 9, mesas: 3}
    ];
    
    casos.forEach(function(caso) {
      let mesasNecesarias = Math.ceil(caso.personas / capacidadPorMesa);
      expect(mesasNecesarias).toEqual(caso.mesas);
    });
  });
});

// PRUEBA ADICIONAL 1: Comprobar que un usuario no puede enviar mensajes a un grupo inexistente.
describe('El sistema - Mensajes (casos límite)', function() {
  let sistema;
  let usr;

  beforeEach(function() {
    sistema = new modelo.Sistema({ test: true });
    usr = "tester@uclm.es";
    sistema.agregarUsuario(usr);
  });

  it('no permite enviar mensajes a un grupo inexistente', function() {
    let resultado = sistema.enviarMensajeGrupo(usr, "XXXXXX", "Hola");

    expect(resultado.resultado).toEqual(-1);
  });
});

// PRUEBA ADICIONAL 2: Un usuario no puede enviar un mensaje vacío (string vacío o solo espacios) a un grupo válido.
describe('El sistema - Mensajes (validaciones)', function() {
  let sistema;
  let usr;
  let codigoGrupo;

  beforeEach(function() {
    sistema = new modelo.Sistema({ test: true });
    usr = "tester@uclm.es";

    sistema.agregarUsuario(usr);
    let resGrupo = sistema.crearGrupo(usr, false);
    codigoGrupo = resGrupo.codigo;
  });

  it('no permite enviar mensajes vacíos', function() {
    let resultado = sistema.enviarMensajeGrupo(usr, codigoGrupo, "");

    expect(resultado.resultado).toEqual(-1);
  });
});

// PRUEBA ADICIONAL 3: Comprobar que los mensajes enviados por usuarios se almacenan en el orden correcto, ignorando mensajes automáticos del sistema (como “usuario se ha unido al grupo”).
describe('El sistema - Mensajes (orden relativo)', function() {
  let sistema;
  let usr;
  let codigoGrupo;
  let msj1 = "Mensaje 1";
  let msj2 = "Mensaje 2";

  beforeEach(function() {
    sistema = new modelo.Sistema({ test: true });
    usr = "tester@uclm.es";

    sistema.agregarUsuario(usr);
    codigoGrupo = sistema.crearGrupo(usr, "Grupo Orden", false);
  });

  it('mantiene el orden relativo de los mensajes enviados por el usuario', function() {
    sistema.enviarMensajeGrupo(usr, codigoGrupo, msj1);
    sistema.enviarMensajeGrupo(usr, codigoGrupo, msj2);

    let mensajes = sistema.obtenerMensajesGrupo(codigoGrupo);

    // Nos quedamos SOLO con mensajes del usuario
    let mensajesUsuario = mensajes.filter(m => m.autor === usr);

    expect(mensajesUsuario.length >= 2).toBe(true);
    expect(mensajesUsuario[0].mensaje).toEqual(msj1);
    expect(mensajesUsuario[1].mensaje).toEqual(msj2);
  });
});

// PRUEBA ADICIONAL 4: No permitir enviar mensajes a grupos cerrados
describe('El sistema - Mensajes (grupos cerrados)', function() {
  let sistema;
  let usr;
  let codigoGrupo;

  beforeEach(function() {
    sistema = new modelo.Sistema({ test: true });
    usr = "tester@uclm.es";

    sistema.agregarUsuario(usr);

    // Crear grupo y obtener el código
    codigoGrupo = sistema.crearGrupo(usr, "Grupo Cerrado", false);
  });

  it('no permite enviar mensajes a un grupo cerrado', function() {
    // Salir del grupo -> se cierra automáticamente
    let resultadoSalir = sistema.salirDelGrupo(usr, codigoGrupo);
    expect(resultadoSalir.estado).toEqual("cerrado");

    // Intentar enviar un mensaje al grupo cerrado
    let resultado = sistema.enviarMensajeGrupo(usr, codigoGrupo, "Mensaje en grupo cerrado");
    
    // Debe fallar y devolver -1
    expect(resultado.resultado).toEqual(-1);
  });
});

// ==================== PRUEBAS ADICIONALES DE GRUPOS ====================
describe('El sistema - Grupos (validaciones adicionales)', function() {
  let sistema;
  let usr1, usr2, codigo;

  beforeEach(function() {
    sistema = new modelo.Sistema({ test: true });
    
    usr1 = "pepe@uclm.es";
    usr2 = "luis@uclm.es";
    
    sistema.agregarUsuario(usr1);
    sistema.agregarUsuario(usr2);

    // Creamos un grupo público para las pruebas
    codigo = sistema.crearGrupo(usr1, "Grupo Test Validaciones", false);
  });

  it('un usuario no puede unirse dos veces al mismo grupo', function() {
    // Primer intento de unión
    sistema.unirseAlGrupo(usr2, codigo, false);

    // Segundo intento de unión
    let res = sistema.unirseAlGrupo(usr2, codigo, false);

    expect(res.resultado).toEqual(-1);
    expect(sistema.grupos[codigo].miembros.length).toEqual(2); // usr1 + usr2
  });

  it('no se puede salir de un grupo inexistente', function() {
    let res = sistema.salirDelGrupo(usr2, "XXXXXX");
    expect(res.resultado).toEqual(-1);
  });
});