// cliente/sounds.js
// Sistema unificado de sonidos para toda la aplicación

const AppSounds = {
  error: null,
  confirm: null,
  initialized: false,

  init() {
    if (this.initialized) return;
    
    // Crear instancias de Audio
    this.error = new Audio('/assets/error.mp3');
    this.confirm = new Audio('/assets/confirmacion.mp3');
    
    // Precargar los sonidos
    this.error.load();
    this.confirm.load();
    
    this.initialized = true;
    console.log('✓ Sistema de sonidos inicializado');
  },

  playError() {
    this.init();
    this.error.currentTime = 0;
    this.error.play().catch(e => console.warn('Error al reproducir sonido:', e));
  },

  playConfirm() {
    this.init();
    this.confirm.currentTime = 0;
    this.confirm.play().catch(e => console.warn('Error al reproducir sonido:', e));
  }
};

// Función auxiliar para mostrar alertas con sonido
function showAlert(type, text, timeout = 4200) {
  const existing = document.querySelector('.alert');
  if (existing) existing.remove();
  
  const el = document.createElement('div');
  el.className = 'alert ' + (type === 'error' ? 'error' : 'success');
  el.textContent = text;
  document.body.appendChild(el);
  
  // Reproducir sonido correspondiente
  if (type === 'error') {
    AppSounds.playError();
  } else if (type === 'success') {
    AppSounds.playConfirm();
  }
  
  if (timeout) setTimeout(() => el.remove(), timeout);
}

// Inicializar sonidos cuando el documento esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AppSounds.init());
} else {
  AppSounds.init();
}

// Exportar para uso global
window.AppSounds = AppSounds;
window.showAlert = showAlert;