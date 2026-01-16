// cliente/cafeteria-bot.js

const cafeteriaBot = {
  botUser: {
    userId: 'cafeteria-bot',
    email: 'bot@cafeteria.com',
    name: '🤖 Asistente de Cafetería'
  },
  
  chatClient: null,
  conversationState: 'idle', // idle, ordering, reserving
  tempOrder: [],
  tempReservation: {},
  
  async init(chatClientInstance) {
    this.chatClient = chatClientInstance;
    
    // Añadir el bot a la lista de usuarios online
    this.addBotToOnlineUsers();
    
    console.log('✓ Bot de cafetería inicializado');
  },
  
  addBotToOnlineUsers() {
    if (!this.chatClient) return;
    
    // Añadir el bot al principio de la lista
    if (!this.chatClient.onlineUsers.find(u => u.userId === this.botUser.userId)) {
      this.chatClient.onlineUsers.unshift(this.botUser);
      this.chatClient.updateOnlineUsersList();
    }
  },
  
  async handleUserResponse(message) {
    const lowerMessage = message.toLowerCase().trim();
    
    let botResponse = '';
    
    // Estado: ordenando
    if (this.conversationState === 'ordering') {
      botResponse = await this.handleOrderingFlow(lowerMessage);
    }
    // Estado: reservando
    else if (this.conversationState === 'reserving') {
      botResponse = await this.handleReservingFlow(lowerMessage);
    }
    // Estado: idle (comandos generales)
    else {
      botResponse = await this.handleIdleCommands(lowerMessage);
    }
    
    // Enviar respuesta del bot
    this.sendBotMessage(botResponse);
  },
  
  async handleIdleCommands(message) {
    // Comando: pedir / ordenar / menú
    if (message.includes('pedir') || message.includes('ordenar') || message.includes('menú') || message.includes('menu')) {
      this.conversationState = 'ordering';
      this.tempOrder = [];
      
      try {
        const res = await fetch('/api/menu');
        const menu = await res.json();
        
        let response = '🍽️ ¡Claro! Aquí está nuestro menú:\n\n';
        menu.forEach((item, index) => {
          response += `${index + 1}. ${item.title} - ${item.price.toFixed(2)}€\n`;
        });
        response += '\n¿Qué te gustaría pedir? (escribe el nombre o número)';
        
        return response;
      } catch (error) {
        return '❌ Error al cargar el menú. Inténtalo de nuevo.';
      }
    }
    
    // Comando: reservar / mesa
    else if (message.includes('reservar') || message.includes('mesa') || message.includes('reserva')) {
      this.conversationState = 'reserving';
      this.tempReservation = {};
      return '📅 ¿Para qué día quieres reservar? (formato: DD/MM/YYYY o "hoy")';
    }
    
    // Comando: ayuda
    else if (message.includes('ayuda') || message.includes('help') || message.includes('hola')) {
      return `¡Hola! 👋 Soy tu asistente de cafetería.\n\nPuedo ayudarte con:\n• "Pedir" o "Menú" - Ver el menú y hacer pedidos\n• "Reservar" - Reservar una mesa\n• "Mis pedidos" - Ver tus pedidos anteriores\n\n¿En qué puedo ayudarte?`;
    }
    
    // Comando: mis pedidos
    else if (message.includes('mis pedidos') || message.includes('historial')) {
      try {
        const res = await fetch('/api/orders');
        const pedidos = await res.json();
        
        if (pedidos.length === 0) {
          return '📦 No tienes pedidos anteriores.';
        }
        
        let response = '📦 Tus últimos pedidos:\n\n';
        pedidos.slice(0, 5).forEach((pedido, index) => {
          const fecha = new Date(pedido.fecha).toLocaleDateString();
          response += `${index + 1}. ${fecha} - ${pedido.total.toFixed(2)}€ (${pedido.estado})\n`;
        });
        
        return response;
      } catch (error) {
        return '❌ Error al cargar tus pedidos.';
      }
    }
    
    // Comando desconocido
    else {
      return 'No entiendo eso. Escribe "ayuda" para ver qué puedo hacer. 🤔';
    }
  },
  
  async handleOrderingFlow(message) {
    // Cancelar
    if (message === 'cancelar' || message === 'salir') {
      this.conversationState = 'idle';
      this.tempOrder = [];
      return 'Pedido cancelado. ¿Necesitas algo más?';
    }
    
    // Confirmar pedido
    if (message === 'confirmar' || message === 'listo' || message === 'terminar') {
      if (this.tempOrder.length === 0) {
        return '❌ No has añadido ningún producto. ¿Qué quieres pedir?';
      }
      
      // Crear pedido
      try {
        const res = await fetch('/api/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: this.tempOrder,
            method: 'Efectivo'
          })
        });
        
        const data = await res.json();
        
        if (data.ok) {
          const total = this.tempOrder.reduce((sum, item) => sum + (item.price * item.qty), 0);
          this.conversationState = 'idle';
          this.tempOrder = [];
          return `✅ ¡Pedido confirmado!\n\nTotal: ${total.toFixed(2)}€\nPodrás recogerlo en breve. ¡Gracias!`;
        } else {
          return '❌ Error al procesar el pedido. Inténtalo de nuevo.';
        }
      } catch (error) {
        return '❌ Error de conexión. Inténtalo más tarde.';
      }
    }
    
    // Añadir producto
    try {
      const res = await fetch('/api/menu');
      const menu = await res.json();
      
      // Buscar producto por nombre o número
      let producto = null;
      
      if (!isNaN(message)) {
        const index = parseInt(message) - 1;
        if (index >= 0 && index < menu.length) {
          producto = menu[index];
        }
      } else {
        producto = menu.find(item => 
          item.title.toLowerCase().includes(message) ||
          message.includes(item.title.toLowerCase())
        );
      }
      
      if (producto) {
        // Añadir al pedido temporal
        const existe = this.tempOrder.find(item => item.id === producto.id);
        if (existe) {
          existe.qty++;
        } else {
          this.tempOrder.push({ ...producto, qty: 1 });
        }
        
        const total = this.tempOrder.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        let response = `✅ Añadido: ${producto.title}\n\nTu pedido actual:\n`;
        this.tempOrder.forEach(item => {
          response += `• ${item.title} x${item.qty} - ${(item.price * item.qty).toFixed(2)}€\n`;
        });
        response += `\nTotal: ${total.toFixed(2)}€\n\n¿Algo más? (escribe "confirmar" para finalizar)`;
        
        return response;
      } else {
        return '❌ No encontré ese producto. Intenta con otro nombre o número.';
      }
    } catch (error) {
      return '❌ Error al buscar el producto.';
    }
  },
  
  async handleReservingFlow(message) {
    // Cancelar
    if (message === 'cancelar' || message === 'salir') {
      this.conversationState = 'idle';
      this.tempReservation = {};
      return 'Reserva cancelada. ¿Necesitas algo más?';
    }
    
    // Paso 1: Fecha
    if (!this.tempReservation.fecha) {
      let fecha = '';
      
      if (message === 'hoy') {
        fecha = new Date().toISOString().split('T')[0];
      } else {
        // Intentar parsear fecha DD/MM/YYYY
        const parts = message.split('/');
        if (parts.length === 3) {
          const [dia, mes, año] = parts;
          fecha = `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
      }
      
      if (fecha) {
        this.tempReservation.fecha = fecha;
        return `📅 Perfecto, reserva para el ${new Date(fecha).toLocaleDateString()}.\n\n¿A qué hora? (ejemplo: 14:00)`;
      } else {
        return '❌ Formato de fecha incorrecto. Usa DD/MM/YYYY o escribe "hoy".';
      }
    }
    
    // Paso 2: Hora de inicio
    else if (!this.tempReservation.horaInicio) {
      const hora = message.match(/(\d{1,2}):?(\d{2})?/);
      if (hora) {
        const horaFormato = `${hora[1].padStart(2, '0')}:${(hora[2] || '00').padStart(2, '0')}`;
        this.tempReservation.horaInicio = horaFormato;
        return `⏰ Reserva a las ${horaFormato}.\n\n¿Hasta qué hora? (ejemplo: 15:30)`;
      } else {
        return '❌ Formato de hora incorrecto. Usa HH:MM (ejemplo: 14:00)';
      }
    }
    
    // Paso 3: Hora de fin
    else if (!this.tempReservation.horaFin) {
      const hora = message.match(/(\d{1,2}):?(\d{2})?/);
      if (hora) {
        const horaFormato = `${hora[1].padStart(2, '0')}:${(hora[2] || '00').padStart(2, '0')}`;
        this.tempReservation.horaFin = horaFormato;
        return `🪑 ¿Qué mesa prefieres? (números del 1 al 10, escribe "cualquiera" para una aleatoria)`;
      } else {
        return '❌ Formato de hora incorrecto. Usa HH:MM (ejemplo: 15:30)';
      }
    }
    
    // Paso 4: Mesa y confirmación
    else {
      let mesa = '';
      
      if (message === 'cualquiera' || message === 'la que sea') {
        mesa = Math.floor(Math.random() * 10) + 1;
      } else if (!isNaN(message)) {
        mesa = parseInt(message);
        if (mesa < 1 || mesa > 10) {
          return '❌ Elige una mesa entre 1 y 10.';
        }
      } else {
        return '❌ Escribe un número de mesa (1-10) o "cualquiera".';
      }
      
      this.tempReservation.mesa = mesa;
      
      // Crear reserva
      try {
        const res = await fetch('/api/reserva', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.tempReservation)
        });
        
        const data = await res.json();
        
        if (data.ok) {
          const response = `✅ ¡Reserva confirmada!\n\n📅 Fecha: ${new Date(this.tempReservation.fecha).toLocaleDateString()}\n⏰ Horario: ${this.tempReservation.horaInicio} - ${this.tempReservation.horaFin}\n🪑 Mesa: ${this.tempReservation.mesa}\n\n¡Te esperamos!`;
          
          this.conversationState = 'idle';
          this.tempReservation = {};
          
          return response;
        } else {
          return '❌ Error al confirmar la reserva. Inténtalo de nuevo.';
        }
      } catch (error) {
        return '❌ Error de conexión. Inténtalo más tarde.';
      }
    }
  },
  
  sendBotMessage(message) {
    if (!this.chatClient) return;
    
    // Guardar mensaje del bot
    if (!this.chatClient.messages.has(this.botUser.userId)) {
      this.chatClient.messages.set(this.botUser.userId, []);
    }
    
    this.chatClient.messages.get(this.botUser.userId).push({
      type: 'received',
      message: message,
      timestamp: new Date().toISOString(),
      fromName: this.botUser.name
    });
    
    // Actualizar UI si es el chat actual
    if (this.chatClient.selectedUser?.userId === this.botUser.userId) {
      this.renderBotMessages();
    } else {
      // Mostrar notificación
      this.chatClient.showNotification(this.botUser.name, message, this.botUser.userId);
    }
  },
  
  renderBotMessages() {
    const container = document.getElementById('chat-messages');
    if (!container || !this.chatClient) return;
    
    const messages = this.chatClient.messages.get(this.botUser.userId) || [];
    
    if (messages.length === 0) {
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #999;">
          ¡Hola! Soy tu asistente. Escribe "ayuda" para ver qué puedo hacer. 🤖
        </div>
      `;
      return;
    }
    
    container.innerHTML = '';
    
    messages.forEach(msg => {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-message ${msg.type}`;
      
      const time = new Date(msg.timestamp).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      // Reemplazar saltos de línea por <br>
      const formattedMessage = msg.message.replace(/\n/g, '<br>');
      
      msgDiv.innerHTML = `
        <div class="message-content ${msg.type === 'received' ? 'bot-message' : ''}">${formattedMessage}</div>
        <div class="message-time">${time}</div>
      `;
      
      container.appendChild(msgDiv);
    });
    
    // Scroll al final
    container.scrollTop = container.scrollHeight;
  }
};