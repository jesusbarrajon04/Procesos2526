function Sistema(test) {
  this.usuarios = {};
  this.partidas = {}; 
  this.agregarUsuario = function(nick) {
    if (typeof nick === 'string') {
      this.usuarios[nick] = new Usuario(nick);
    } else {
      this.usuarios[nick.email || nick.nick] = new Usuario(nick.email || nick.nick);
    }
  };

  this.obtenerUsuarios = function() {
    let lista = [];
    for (let u in this.usuarios) {
      lista.push({ "nick": this.usuarios[u].nick });
    }
    return lista;
  }

  this.usuarioActivo = function(nick) {
    return this.usuarios[nick] != undefined;
  };

  this.eliminarUsuario = function(nick) {
    delete this.usuarios[nick];
  };

  this.numeroUsuarios = function() {
    return { num: Object.keys(this.usuarios).length };
  };

  this.crearPartida = function(email) {
    if (!this.usuarios[email]) {
      console.log("Usuario no encontrado:", email);
      return -1;
    }

    let codigo = this.obtenerCodigo();
    
    let partida = new Partida(codigo);
    
    partida.jugadores.push(this.usuarios[email]);
    
    this.partidas[codigo] = partida;
    
    console.log("Partida creada con código:", codigo);
    return codigo;
  };

  this.unirAPartida = function(email, codigo) {
    let usuario = this.usuarios[email];
    if (!usuario) {
      console.log("Usuario no encontrado:", email);
      return { resultado: -1, mensaje: "Usuario no encontrado" };
    }

    let partida = this.partidas[codigo];
    if (!partida) {
      console.log("Partida no encontrada:", codigo);
      return { resultado: -1, mensaje: "Partida no encontrada" };
    }

    if (partida.jugadores.length >= partida.maxJug) {
      console.log("Partida llena");
      return { resultado: -1, mensaje: "Partida llena" };
    }

    for (let i = 0; i < partida.jugadores.length; i++) {
      if (partida.jugadores[i].nick === email) {
        console.log("El usuario ya está en la partida");
        return { resultado: -1, mensaje: "Ya estás en esta partida" };
      }
    }

    partida.jugadores.push(usuario);
    console.log("Usuario unido a partida:", email, "->", codigo);
    
    return { resultado: codigo, mensaje: "Unido correctamente" };
  };

  this.obtenerPartidasDisponibles = function() {
    let lista = [];
    for (let codigo in this.partidas) {
      let partida = this.partidas[codigo];
      
      if (partida.jugadores.length < partida.maxJug) {
        lista.push({
          codigo: partida.codigo,
          creador: partida.jugadores[0].nick,
          numJugadores: partida.jugadores.length,
          maxJugadores: partida.maxJug
        });
      }
    }
    return lista;
  };

  this.obtenerCodigo = function() {
    let codigo;
    do {
      codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (this.partidas[codigo]);
    
    return codigo;
  };
}

function Usuario(nick) {
  this.nick = nick;
}

function Partida(codigo) {
  this.codigo = codigo;
  this.jugadores = [];
  this.maxJug = 2;
}