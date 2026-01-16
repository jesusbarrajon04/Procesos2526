// cliente/reserva-mesas.js
// Sistema de reserva de mesas para cafetería

const ReservaMesas = {
  // Configuración
  totalMesas: 15,
  capacidadPorMesa: 4,
  
  // Estado
  mesasSeleccionadas: [],
  currentStep: 1,
  reservaData: {
    numPersonas: 0,
    horaInicio: '',
    horaFin: '',
    mesas: []
  },
  
  // Mesas simuladas como ocupadas (para realismo)
  mesasOcupadas: [3, 7, 11], // Mesas 3, 7 y 11 están ocupadas
  
  // Inicializar
  init() {
    console.log('✓ Sistema de reserva de mesas inicializado');
  },
  
  // Abrir modal
  abrirModal() {
    document.getElementById('reserva-modal').classList.add('active');
    this.currentStep = 1;
    this.mostrarPaso(1);
    this.resetear();
  },
  
  // Cerrar modal
  cerrarModal() {
    document.getElementById('reserva-modal').classList.remove('active');
    this.resetear();
  },
  
  // Resetear datos
  resetear() {
    this.mesasSeleccionadas = [];
    this.reservaData = {
      numPersonas: 0,
      horaInicio: '',
      horaFin: '',
      mesas: []
    };
    document.querySelectorAll('.mesa').forEach(mesa => {
      mesa.classList.remove('selected');
    });
    document.getElementById('error-reserva').classList.remove('show');
  },
  
  // Mostrar paso específico
  mostrarPaso(paso) {
    document.querySelectorAll('.reserva-step').forEach(step => {
      step.classList.remove('active');
    });
    document.getElementById(`step-${paso}`).classList.add('active');
    this.currentStep = paso;
    
    if (paso === 2) {
      this.renderizarMapa();
    } else if (paso === 3) {
      this.mostrarResumen();
    }
  },
  
  // PASO 1: Validar formulario de datos
  validarPaso1() {
    const numPersonas = parseInt(document.getElementById('num-personas').value);
    const horaInicio = document.getElementById('hora-inicio').value;
    const horaFin = document.getElementById('hora-fin').value;
    
    // Validaciones
    if (!numPersonas || numPersonas < 1) {
      this.mostrarError(AppSettings.t('error_num_personas') || 'Introduce el número de personas');
      return false;
    }
    
    if (numPersonas > this.totalMesas * this.capacidadPorMesa) {
      this.mostrarError(`Máximo ${this.totalMesas * this.capacidadPorMesa} personas`);
      return false;
    }
    
    if (!horaInicio || !horaFin) {
      this.mostrarError(AppSettings.t('error_hours') || 'Introduce hora de inicio y fin');
      return false;
    }
    
    if (horaFin <= horaInicio) {
      this.mostrarError(AppSettings.t('error_end_time') || 'La hora de fin debe ser posterior a la de inicio');
      return false;
    }
    
    // Guardar datos
    this.reservaData.numPersonas = numPersonas;
    this.reservaData.horaInicio = horaInicio;
    this.reservaData.horaFin = horaFin;
    
    return true;
  },
  
  // PASO 2: Renderizar mapa de mesas
  renderizarMapa() {
    const mapa = document.getElementById('mapa-mesas');
    mapa.innerHTML = '';
    
    const mesasNecesarias = Math.ceil(this.reservaData.numPersonas / this.capacidadPorMesa);
    
    for (let i = 1; i <= this.totalMesas; i++) {
      const mesa = document.createElement('div');
      mesa.className = 'mesa';
      mesa.dataset.numero = i;
      
      const estaOcupada = this.mesasOcupadas.includes(i);
      
      if (estaOcupada) {
        mesa.classList.add('ocupada');
        mesa.innerHTML = `
          <span class="mesa-estado">🔒</span>
          <div class="mesa-numero">${i}</div>
          <div class="mesa-capacidad">${this.capacidadPorMesa}p</div>
        `;
      } else {
        mesa.innerHTML = `
          <div class="mesa-numero">${i}</div>
          <div class="mesa-capacidad">${this.capacidadPorMesa}p</div>
        `;
        
        mesa.addEventListener('click', () => this.toggleMesa(i, mesasNecesarias));
      }
      
      mapa.appendChild(mesa);
    }
    
    // Actualizar info
    document.getElementById('mesas-necesarias').textContent = mesasNecesarias;
    document.getElementById('mesas-seleccionadas-count').textContent = this.mesasSeleccionadas.length;
  },
  
  // Toggle selección de mesa
  toggleMesa(numeroMesa, mesasNecesarias) {
    const mesa = document.querySelector(`.mesa[data-numero="${numeroMesa}"]`);
    
    if (this.mesasSeleccionadas.includes(numeroMesa)) {
      // Deseleccionar
      this.mesasSeleccionadas = this.mesasSeleccionadas.filter(m => m !== numeroMesa);
      mesa.classList.remove('selected');
    } else {
      // Seleccionar (si no se ha alcanzado el máximo)
      if (this.mesasSeleccionadas.length < mesasNecesarias) {
        this.mesasSeleccionadas.push(numeroMesa);
        mesa.classList.add('selected');
      } else {
        this.mostrarError(`Solo puedes seleccionar ${mesasNecesarias} mesa(s)`);
        return;
      }
    }
    
    document.getElementById('mesas-seleccionadas-count').textContent = this.mesasSeleccionadas.length;
    
    // Habilitar/deshabilitar botón continuar
    const btnContinuar = document.getElementById('btn-paso2-continuar');
    btnContinuar.disabled = this.mesasSeleccionadas.length !== mesasNecesarias;
  },
  
  // PASO 3: Mostrar resumen
  mostrarResumen() {
    document.getElementById('resumen-personas').textContent = this.reservaData.numPersonas;
    document.getElementById('resumen-hora').textContent = `${this.reservaData.horaInicio} - ${this.reservaData.horaFin}`;
    document.getElementById('resumen-mesas').textContent = this.mesasSeleccionadas.sort((a, b) => a - b).join(', ');
  },
  
  // Confirmar reserva
// Confirmar reserva
async confirmarReserva() {
  this.reservaData.mesas = this.mesasSeleccionadas;
  
  const btnConfirmar = document.getElementById('btn-confirmar-reserva');
  btnConfirmar.disabled = true;
  btnConfirmar.innerHTML = '⏳ <span data-i18n="processing">Procesando...</span>';
  
  try {
    console.log('📤 Enviando reserva:', this.reservaData);
    
    const response = await fetch('/api/reserva', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numPersonas: this.reservaData.numPersonas,
        horaInicio: this.reservaData.horaInicio,
        horaFin: this.reservaData.horaFin,
        mesas: this.reservaData.mesas,
        fecha: new Date().toISOString().split('T')[0]
      })
    });
    
    console.log('📥 Respuesta del servidor:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error HTTP:', response.status, errorText);
      throw new Error(`Error del servidor (${response.status})`);
    }
    
    const data = await response.json();
    console.log('✅ Datos recibidos:', data);
    
    if (data.ok) {
      // Guardar reserva en localStorage
      const reservaCompleta = {
        ...this.reservaData,
        reservaId: data.reservaId,
        fecha: new Date().toISOString().split('T')[0]
      };
      localStorage.setItem('reserva_actual', JSON.stringify(reservaCompleta));
      
      // Reproducir sonido de éxito
      if (typeof AppSounds !== 'undefined') {
        AppSounds.playConfirm();
      }
      
      showAlert('success', AppSettings.t('reserva_confirmada') || '✅ Reserva confirmada correctamente');
      this.cerrarModal();
      
      // Actualizar indicador en el carrito
      const indicator = document.getElementById('reserva-indicator');
      if (indicator) {
        indicator.style.display = 'block';
        indicator.innerHTML = `
          ✅ <span data-i18n="reserva_confirmed_text">Reserva confirmada: Mesa(s) ${this.mesasSeleccionadas.sort((a, b) => a - b).join(', ')} - ${this.reservaData.horaInicio} a ${this.reservaData.horaFin}</span>
        `;
        
        // Aplicar traducciones
        if (typeof AppSettings !== 'undefined') {
          AppSettings.apply(AppSettings.load());
        }
      }
    } else {
      throw new Error(data.mensaje || 'Error desconocido al confirmar reserva');
    }
  } catch (error) {
    console.error('❌ Error completo:', error);
    
    // Reproducir sonido de error
    if (typeof AppSounds !== 'undefined') {
      AppSounds.playError();
    }
    
    showAlert('error', AppSettings.t('error_reserva') || 'Error al procesar la reserva: ' + error.message);
    this.mostrarError('Error: ' + error.message);
  } finally {
    btnConfirmar.disabled = false;
    btnConfirmar.innerHTML = '✅ <span data-i18n="btn_confirm_reservation">Confirmar Reserva</span>';
    
    // Aplicar traducciones al botón
    if (typeof AppSettings !== 'undefined') {
      AppSettings.apply(AppSettings.load());
    }
  }
},
  
  // Mostrar error
  mostrarError(mensaje) {
    const errorDiv = document.getElementById('error-reserva');
    errorDiv.textContent = mensaje;
    errorDiv.classList.add('show');
    
    setTimeout(() => {
      errorDiv.classList.remove('show');
    }, 4000);
  },
  
  // Continuar al siguiente paso
  continuarPaso(pasoActual) {
    if (pasoActual === 1) {
      if (this.validarPaso1()) {
        this.mostrarPaso(2);
      }
    } else if (pasoActual === 2) {
      const mesasNecesarias = Math.ceil(this.reservaData.numPersonas / this.capacidadPorMesa);
      if (this.mesasSeleccionadas.length === mesasNecesarias) {
        this.mostrarPaso(3);
      } else {
        this.mostrarError(`Debes seleccionar ${mesasNecesarias} mesa(s)`);
      }
    }
  }
};

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  ReservaMesas.init();
});

// Exportar globalmente
window.ReservaMesas = ReservaMesas;