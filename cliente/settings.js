// cliente/settings.js
// Sistema de gestión de configuración de la aplicación

const AppSettings = {
  defaults: {
    daltonismo: false,
    idioma: 'es'
  },

  // Traducciones de productos
  productTranslations: {
    es: {
      'Bocadillo de jamón': 'Bocadillo de jamón',
      'Pan, jamón, tomate': 'Pan, jamón, tomate',
      'Bocadillo vegetal': 'Bocadillo vegetal',
      'Verduras, hummus': 'Verduras, hummus',
      'Café solo': 'Café solo',
      'Pequeño': 'Pequeño',
      'Café con leche': 'Café con leche',
      'Grande': 'Grande',
      'Tortilla': 'Tortilla',
      'Tortilla tradicional': 'Tortilla tradicional',
      'Ensalada': 'Ensalada',
      'Mix de hojas': 'Mix de hojas',
      'Producto de cafetería': 'Producto de cafetería',
      
      // NUEVOS PRODUCTOS
      'Bocadillo de lomo': 'Bocadillo de lomo',
      'Lomo, tomate, aceite': 'Lomo, tomate, aceite',
      'Bocadillo de calamares': 'Bocadillo de calamares',
      'Calamares rebozados': 'Calamares rebozados',
      'Coca-Cola': 'Coca-Cola',
      'Refresco 33cl': 'Refresco 33cl',
      'Coca-Cola Zero': 'Coca-Cola Zero',
      'Sin azúcar 33cl': 'Sin azúcar 33cl',
      'Fanta Naranja': 'Fanta Naranja',
      'Refresco naranja 33cl': 'Refresco naranja 33cl',
      'Cerveza': 'Cerveza',
      'Cerveza rubia 33cl': 'Cerveza rubia 33cl',
      'Agua mineral': 'Agua mineral',
      'Botella 50cl': 'Botella 50cl',
      'Zumo de naranja': 'Zumo de naranja',
      'Natural recién exprimido': 'Natural recién exprimido',
      'Fanta limón': 'Fanta limón',
      'Refresco limón 33cl': 'Refresco limón 33cl'
    },
    en: {
      'Bocadillo de jamón': 'Ham Sandwich',
      'Pan, jamón, tomate': 'Bread, ham, tomato',
      'Bocadillo vegetal': 'Veggie Sandwich',
      'Verduras, hummus': 'Vegetables, hummus',
      'Café solo': 'Black Coffee',
      'Pequeño': 'Small',
      'Café con leche': 'Latte',
      'Grande': 'Large',
      'Tortilla': 'Omelette',
      'Tortilla tradicional': 'Traditional omelette',
      'Ensalada': 'Salad',
      'Mix de hojas': 'Mixed greens',
      'Producto de cafetería': 'Café product',
      
      // NUEVOS PRODUCTOS
      'Bocadillo de lomo': 'Pork Loin Sandwich',
      'Lomo, tomate, aceite': 'Pork loin, tomato, oil',
      'Bocadillo de calamares': 'Calamari Sandwich',
      'Calamares rebozados': 'Fried calamari',
      'Coca-Cola': 'Coca-Cola',
      'Refresco 33cl': 'Soft drink 33cl',
      'Coca-Cola Zero': 'Coca-Cola Zero',
      'Sin azúcar 33cl': 'Sugar-free 33cl',
      'Fanta Naranja': 'Fanta Orange',
      'Refresco naranja 33cl': 'Orange soda 33cl',
      'Cerveza': 'Beer',
      'Cerveza rubia 33cl': 'Lager beer 33cl',
      'Agua mineral': 'Mineral Water',
      'Botella 50cl': '50cl bottle',
      'Zumo de naranja': 'Orange Juice',
      'Natural recién exprimido': 'Freshly squeezed',
      'Fanta limón': 'Fanta Lemon',
      'Refresco limón 33cl': 'Lemon soda 33cl'
    },
    fr: {
      'Bocadillo de jamón': 'Sandwich au jambon',
      'Pan, jamón, tomate': 'Pain, jambon, tomate',
      'Bocadillo vegetal': 'Sandwich végétarien',
      'Verduras, hummus': 'Légumes, houmous',
      'Café solo': 'Café noir',
      'Pequeño': 'Petit',
      'Café con leche': 'Café au lait',
      'Grande': 'Grand',
      'Tortilla': 'Omelette',
      'Tortilla tradicional': 'Omelette traditionnelle',
      'Ensalada': 'Salade',
      'Mix de hojas': 'Mélange de feuilles',
      'Producto de cafetería': 'Produit de café',
      
      // NUEVOS PRODUCTOS
      'Bocadillo de lomo': 'Sandwich au filet de porc',
      'Lomo, tomate, aceite': 'Filet de porc, tomate, huile',
      'Bocadillo de calamares': 'Sandwich aux calamars',
      'Calamares rebozados': 'Calamars frits',
      'Coca-Cola': 'Coca-Cola',
      'Refresco 33cl': 'Soda 33cl',
      'Coca-Cola Zero': 'Coca-Cola Zero',
      'Sin azúcar 33cl': 'Sans sucre 33cl',
      'Fanta Naranja': 'Fanta Orange',
      'Refresco naranja 33cl': 'Soda orange 33cl',
      'Cerveza': 'Bière',
      'Cerveza rubia 33cl': 'Bière blonde 33cl',
      'Agua mineral': 'Eau minérale',
      'Botella 50cl': 'Bouteille 50cl',
      'Zumo de naranja': 'Jus d\'orange',
      'Natural recién exprimido': 'Fraîchement pressé',
      'Fanta limón': 'Fanta Citron',
      'Refresco limón 33cl': 'Soda citron 33cl',
    }
  },

  translations: {
    es: {
      // Menú de bienvenida
      welcome_title: 'Cafetería ESII',
      btn_login: 'INICIAR SESIÓN',
      btn_register: 'REGISTRARSE',
      
      // Navegación principal
      nav_home: 'Inicio',
      nav_about: 'Sobre nosotros',
      nav_logout: 'Salir',
      
      // Página principal
      page_title: 'Sistema de Cafetería Universitaria',
      page_subtitle: 'Gestión de pedidos, reservas y grupos - Curso 2025-2026',
      output_title: 'Salida:',
      modal_title: 'Aviso',
      modal_close: 'Cerrar',
      
      // Login
      login_title: 'Iniciar sesión',
      email_label: 'Correo electrónico',
      email_placeholder: 'Introduce tu email',
      password_label: 'Contraseña',
      password_placeholder: 'Introduce tu contraseña',
      btn_access: 'ACCEDER',
      btn_back: 'ATRÁS',
      btn_home: 'Inicio',
      btn_register_link: 'Registrarse',
      btn_register_nick: 'Agregar usuario por Nick',
      
      // Registro
      register_title: 'Registrar nueva cuenta',
      name_label: 'Nombre',
      name_placeholder: 'Tu nombre',
      lastname_label: 'Apellidos',
      lastname_placeholder: 'Tus apellidos',
      email_placeholder_register: 'tu@email.com',
      email_confirmation_text: 'Recibirás un correo de confirmación',
      password_placeholder_register: 'Mínimo 6 caracteres',
      btn_register: 'Registrar cuenta',
      required_fields_text: '* Campos obligatorios',
      
      // Navegación
      btn_see_menu: 'Ver menú',
      btn_remove: 'Eliminar',
      
      // Carrito
      cart_title: 'Tu Carrito',
      cart_summary: 'Resumen de tu pedido',
      cart_subtitle: 'Revisa y confirma tu pedido',
      cart_total: 'Total',
      cart_empty: 'Tu carrito está vacío',
      cart_empty_text: 'Añade productos del menú para continuar',
      btn_confirm_order: 'Confirmar pedido',
      btn_continue_shopping: 'Seguir comprando',
      btn_clear_cart: 'Vaciar carrito',
      confirm_remove_item: '¿Eliminar este producto del carrito?',
      confirm_clear_cart: '¿Vaciar todo el carrito?',
      item_removed: 'Producto eliminado',
      cart_cleared: 'Carrito vaciado',
      subtotal: 'Subtotal',
      products: 'productos',
      summary: 'Resumen',
      
      // Tipo de pedido
      order_type: 'Tipo de pedido',
      eat_here: 'Comer aquí (Reservar mesa)',
      delivery: 'Envío a domicilio',
      
      // Pago
      payment_method: 'Método de pago',
      payment_cash: 'Efectivo',
      payment_cash_desc: 'Paga en el momento de recoger',
      payment_card: 'Tarjeta',
      payment_card_desc: 'Pago con tarjeta bancaria',
      payment_bizum: 'Bizum',
      payment_bizum_desc: 'Pago inmediato con Bizum',
      payment_paypal: 'PayPal',
      payment_paypal_desc: 'Pago seguro con PayPal',
      
      // Modales de pago
      payment_card_title: 'Pago con Tarjeta',
      payment_bizum_title: 'Pago con Bizum',
      payment_paypal_title: 'Pago con PayPal',
      card_number: 'Número de tarjeta',
      card_number_placeholder: '1234 5678 9012 3456',
      expiry_date: 'Fecha de caducidad (MM/YY)',
      cvv_label: 'CVV',
      btn_confirm_payment: 'Confirmar pago',
      bizum_phone: 'Teléfono',
      bizum_notification: 'Recibirás una notificación en tu móvil para autorizar el pago',
      paypal_charge: 'El cargo se realizará en tu cuenta de PayPal',
      
      // Loading
      loading_order: 'Procesando pedido...',
      loading_menu: 'Cargando menú...',
      
      // Menu
      menu_title: 'Menú de Cafetería',
      menu_day_title: 'Menú del día',
      menu_subtitle: 'Selecciona los productos que deseas pedir',
      btn_add: 'Añadir al carrito',
      btn_view: 'Ver',
      btn_add_to_cart: 'Añadir al carrito',
      btn_view_cart: 'Ver carrito',
      btn_reload: 'Recargar',
      no_products: 'No hay productos disponibles',
      come_back_later: 'Por favor, vuelve más tarde',
      error_loading_menu: 'Error al cargar el menú',
      please_reload: 'Por favor, recarga la página',
      product_added: 'Producto añadido al carrito',
      added: 'Añadido',
      product_not_found: 'Producto no encontrado',
      error_adding_product: 'Error al añadir producto',
      
      // Opciones
      settings_title: 'Opciones',
      enable_daltonism: 'Habilitar daltonismo',
      change_language: 'Cambiar idioma',
      language_spanish: 'Español',
      language_english: 'Inglés',
      language_french: 'Francés',
      btn_apply: 'Aplicar',
      
      // Alertas
      empty_cart: 'El carrito está vacío',
      empty_fields: 'Por favor, completa todos los campos obligatorios',
      payment_successful: '¡Pago realizado con éxito!',
      settings_applied: 'Configuración aplicada correctamente',
      error_processing: 'Error al procesar el pedido',
      invalid_card_number: 'El número de tarjeta debe tener 16 dígitos',
      invalid_date_format: 'Formato de fecha inválido (MM/YY)',
      invalid_month: 'Mes inválido (debe ser 01-12)',
      invalid_cvv: 'El CVV debe tener 3 dígitos',

      // Home buttons
      btn_create_group: 'Crear Grupo',
      btn_view_groups: 'Ver Grupos',
      btn_view_menu: 'Ver Menú',
      btn_my_orders: 'Mis Pedidos',
      btn_private_chats: 'Chats Privados',
      btn_logout: 'Cerrar sesión',
      login_link: '¿Ya tienes cuenta? Inicia sesión',

      // Resumen pedido final
      payment_success: '¡Pago realizado con éxito!',
      order_processed: 'Tu pedido ha sido procesado correctamente',
      order_number: 'Número de pedido:',
      order_date: 'Fecha:',
      order_payment_method: 'Método de pago:',
      order_total: 'Total:',
      btn_back_home: 'Volver al inicio',
      btn_new_order: 'Hacer otro pedido',

      // Reserva de mesas
      reserve_table: 'Reservar Mesa',
      delivery_not_available: 'Envío a domicilio no disponible aún',
      reserva_confirmed: 'Reserva confirmada',
      reserva_confirmada: '✅ Reserva confirmada correctamente',
      error_reserva: 'Error al procesar la reserva',
      error_num_personas: 'Introduce el número de personas',
      error_hours: 'Introduce hora de inicio y fin',
      error_end_time: 'La hora de fin debe ser posterior a la de inicio',
      step1_title: 'Datos de la reserva',
      num_people: 'Número de personas',
      start_time: 'Hora de inicio',
      end_time: 'Hora de fin',
      info_title: 'ℹ️ Información:',
      info_text: 'Cada mesa tiene capacidad para 4 personas. El sistema calculará automáticamente el número de mesas necesarias.',
      btn_cancel: 'Cancelar',
      btn_continue: 'Continuar',
      btn_back: 'Atrás',
      step2_title: 'Selecciona tus mesas',
      tables_needed: 'Mesas necesarias:',
      tables_selected: 'Mesas seleccionadas:',
      legend_available: 'Disponible',
      legend_selected: 'Seleccionada',
      legend_occupied: 'Ocupada',
      step3_title: 'Confirmar reserva',
      summary_people: 'Número de personas:',
      summary_time: 'Horario:',
      summary_tables: 'Mesas:',
      confirm_info_title: '✅ Todo listo!',
      confirm_info_text: 'Al confirmar, tus mesas quedarán reservadas. Recuerda llegar puntual.',
      btn_confirm_reservation: 'Confirmar Reserva',
      processing: 'Procesando...',
      reserva_confirmed_text: 'Reserva confirmada',
      btn_my_reservations: 'Mis Reservas',
      my_reservations_title: 'Mis Reservas',
      no_reservations: 'No tienes reservas registradas.',
      btn_make_order: 'Hacer un pedido y reservar',
      created_on: 'Creada el:',
      reservation_date: 'Fecha de reserva:',
      time_slot: 'Horario:',
      tables: 'Mesa(s):',
      btn_cancel_reservation: 'Cancelar Reserva',
      confirm_cancel_reservation: '¿Estás seguro de que quieres cancelar esta reserva?',
      reservation_cancelled: '✓ Reserva cancelada correctamente',
      error_cancelling: 'Error al cancelar la reserva',
      error_loading_reservations: 'Error al cargar reservas',
      error_loading_reservations_title: 'Error al cargar reservas',
      error_loading_reservations_text: 'No se pudieron cargar tus reservas. Por favor, inténtalo más tarde.',

      // Sobre nosotros
      about_us_title: 'Sobre Nosotros',
      cafeteria_name: 'Cafetería Escuela Politécnica Albacete',
      cafeteria_slogan: 'Tu espacio de descanso en el campus universitario',
      schedule_title: 'Horario de Apertura',
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo',
      closed: 'Cerrado',
      contact_title: 'Contacto',
      address_label: 'Dirección:',
      address_value: 'C. Guillermina Medrano Aranda, 02006 Albacete',
      phone_label: 'Teléfono:',
      price_label: 'Precio:',
      price_value: '1-10 € por persona (Menú 10 €)',
      social_label: 'Redes sociales:',
      rating_title: 'Valoración',
      based_on: 'Basado en',
      reviews: 'reseñas',
      category: 'Categoría:',
      cafeteria: 'Cafetería',
      location_title: 'Cómo llegar',
      campus_info: 'Campus de Albacete',
      uclm: 'Universidad de Castilla-La Mancha',
      features_title: 'Nuestros Servicios',
      service_menu: 'Menú variado',
      service_coffee: 'Cafés especiales',
      service_healthy: 'Opciones saludables',
      service_online: 'Pedidos online',
      service_reservation: 'Reserva de mesas',
      service_payment: 'Múltiples pagos',
      get_directions: 'Cómo llegar (Google Maps)'
    },
    
    en: {
      welcome_title: 'ESII Café',
      btn_login: 'LOG IN',
      btn_register: 'SIGN UP',
      
      nav_home: 'Home',
      nav_about: 'About us',
      nav_logout: 'Logout',
      
      page_title: 'University Café System',
      page_subtitle: 'Order, reservation and group management - Course 2025-2026',
      output_title: 'Output:',
      modal_title: 'Notice',
      modal_close: 'Close',
      login_title: 'Log In',
      email_label: 'Email',
      email_placeholder: 'Enter your email',
      password_label: 'Password',
      password_placeholder: 'Enter your password',
      btn_access: 'ACCESS',
      btn_back: 'BACK',
      btn_home: 'Home',
      btn_register_link: 'Sign Up',
      btn_register_nick: 'Add user by Nick',
      
      register_title: 'Register New Account',
      name_label: 'Name',
      name_placeholder: 'Your name',
      lastname_label: 'Last name',
      lastname_placeholder: 'Your last name',
      email_placeholder_register: 'you@email.com',
      email_confirmation_text: 'You will receive a confirmation email',
      password_placeholder_register: 'Minimum 6 characters',
      btn_register: 'Register Account',
      required_fields_text: '* Required fields',
      btn_see_menu: 'See menu',
      btn_remove: 'Remove',
      cart_title: 'Your Cart',
      cart_summary: 'Order summary',
      cart_subtitle: 'Review and confirm your order',
      cart_total: 'Total',
      cart_empty: 'Your cart is empty',
      cart_empty_text: 'Add products from the menu to continue',
      btn_confirm_order: 'Confirm order',
      btn_continue_shopping: 'Continue shopping',
      btn_clear_cart: 'Clear cart',
      confirm_remove_item: 'Remove this product from cart?',
      confirm_clear_cart: 'Clear entire cart?',
      item_removed: 'Product removed',
      cart_cleared: 'Cart cleared',
      subtotal: 'Subtotal',
      products: 'products',
      summary: 'Summary',
      order_type: 'Order type',
      eat_here: 'Eat here (Reserve table)',
      delivery: 'Home delivery',
      payment_method: 'Payment method',
      payment_cash: 'Cash',
      payment_cash_desc: 'Pay when picking up',
      payment_card: 'Card',
      payment_card_desc: 'Bank card payment',
      payment_bizum: 'Bizum',
      payment_bizum_desc: 'Instant payment with Bizum',
      payment_paypal: 'PayPal',
      payment_paypal_desc: 'Secure payment with PayPal',
      payment_card_title: 'Card Payment',
      payment_bizum_title: 'Bizum Payment',
      payment_paypal_title: 'PayPal Payment',
      card_number: 'Card number',
      card_number_placeholder: '1234 5678 9012 3456',
      expiry_date: 'Expiry date (MM/YY)',
      cvv_label: 'CVV',
      btn_confirm_payment: 'Confirm payment',
      bizum_phone: 'Phone',
      bizum_notification: 'You will receive a notification on your phone to authorize the payment',
      paypal_charge: 'The charge will be made to your PayPal account',
      loading_order: 'Processing order...',
      loading_menu: 'Loading menu...',
      menu_title: 'Café Menu',
      menu_day_title: 'Menu of the day',
      menu_subtitle: 'Select the products you want to order',
      btn_add: 'Add to cart',
      btn_view: 'View',
      btn_add_to_cart: 'Add to cart',
      btn_view_cart: 'View cart',
      btn_reload: 'Reload',
      no_products: 'No products available',
      come_back_later: 'Please come back later',
      error_loading_menu: 'Error loading menu',
      please_reload: 'Please reload the page',
      product_added: 'Product added to cart',
      added: 'Added',
      product_not_found: 'Product not found',
      error_adding_product: 'Error adding product',
      settings_title: 'Settings',
      enable_daltonism: 'Enable color blind mode',
      change_language: 'Change language',
      language_spanish: 'Spanish',
      language_english: 'English',
      language_french: 'French',
      btn_apply: 'Apply',
      empty_cart: 'Cart is empty',
      empty_fields: 'Please fill in all required fields',
      payment_successful: 'Payment successful!',
      settings_applied: 'Settings applied successfully',
      error_processing: 'Error processing order',
      invalid_card_number: 'Card number must have 16 digits',
      invalid_date_format: 'Invalid date format (MM/YY)',
      invalid_month: 'Invalid month (must be 01-12)',
      invalid_cvv: 'CVV must have 3 digits',

      // Home buttons
      btn_create_group: 'Create Group',
      btn_view_groups: 'View Groups',
      btn_view_menu: 'View Menu',
      btn_my_orders: 'My Orders',
      btn_private_chats: 'Private Chats',
      btn_logout: 'Logout',
      login_link: 'Already have an account? Log in',

      // Resumen pedido final
      payment_success: 'Payment successful!',
      order_processed: 'Your order has been processed successfully',
      order_number: 'Order number:',
      order_date: 'Date:',
      order_payment_method: 'Payment method:',
      order_total: 'Total:',
      btn_back_home: 'Back to home',
      btn_new_order: 'Make another order',

      // Table reservation
      reserve_table: 'Reserve Table',
      delivery_not_available: 'Home delivery not available yet',
      reserva_confirmed: 'Reservation confirmed',
      reserva_confirmada: '✅ Reservation confirmed successfully',
      error_reserva: 'Error processing reservation',
      error_num_personas: 'Enter number of people',
      error_hours: 'Enter start and end time',
      error_end_time: 'End time must be after start time',
      step1_title: 'Reservation details',
      num_people: 'Number of people',
      start_time: 'Start time',
      end_time: 'End time',
      info_title: 'ℹ️ Information:',
      info_text: 'Each table seats 4 people. The system will automatically calculate the number of tables needed.',
      btn_cancel: 'Cancel',
      btn_continue: 'Continue',
      btn_back: 'Back',
      step2_title: 'Select your tables',
      tables_needed: 'Tables needed:',
      tables_selected: 'Tables selected:',
      legend_available: 'Available',
      legend_selected: 'Selected',
      legend_occupied: 'Occupied',
      step3_title: 'Confirm reservation',
      summary_people: 'Number of people:',
      summary_time: 'Time:',
      summary_tables: 'Tables:',
      confirm_info_title: '✅ All set!',
      confirm_info_text: 'Upon confirmation, your tables will be reserved. Remember to arrive on time.',
      btn_confirm_reservation: 'Confirm Reservation',
      processing: 'Processing...',
      reserva_confirmed_text: 'Reservation confirmed',
      btn_my_reservations: 'My Reservations',
      my_reservations_title: 'My Reservations',
      no_reservations: 'You have no reservations registered.',
      btn_make_order: 'Make an order and reserve',
      created_on: 'Created on:',
      reservation_date: 'Reservation date:',
      time_slot: 'Time slot:',
      tables: 'Table(s):',
      btn_cancel_reservation: 'Cancel Reservation',
      confirm_cancel_reservation: 'Are you sure you want to cancel this reservation?',
      reservation_cancelled: '✓ Reservation cancelled successfully',
      error_cancelling: 'Error cancelling reservation',
      error_loading_reservations: 'Error loading reservations',
      error_loading_reservations_title: 'Error loading reservations',
      error_loading_reservations_text: 'Could not load your reservations. Please try again later.',

      // sobre nosotros
      about_us_title: 'About Us',
      cafeteria_name: 'Polytechnic School Albacete Cafeteria',
      cafeteria_slogan: 'Your rest space on the university campus',
      schedule_title: 'Opening Hours',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
      closed: 'Closed',
      contact_title: 'Contact',
      address_label: 'Address:',
      address_value: 'C. Guillermina Medrano Aranda, 02006 Albacete',
      phone_label: 'Phone:',
      price_label: 'Price:',
      price_value: '1-10 € per person (Menu 10 €)',
      social_label: 'Social media:',
      rating_title: 'Rating',
      based_on: 'Based on',
      reviews: 'reviews',
      category: 'Category:',
      cafeteria: 'Cafeteria',
      location_title: 'How to get there',
      campus_info: 'Albacete Campus',
      uclm: 'University of Castilla-La Mancha',
      features_title: 'Our Services',
      service_menu: 'Varied menu',
      service_coffee: 'Special coffees',
      service_healthy: 'Healthy options',
      service_online: 'Online orders',
      service_reservation: 'Table reservation',
      service_payment: 'Multiple payments',
      get_directions: 'Get directions (Google Maps)'
    },
    
    fr: {
      welcome_title: 'Café ESII',
      btn_login: 'SE CONNECTER',
      btn_register: 'S\'INSCRIRE',
      
      nav_home: 'Accueil',
      nav_about: 'À propos',
      nav_logout: 'Déconnexion',
      
      page_title: 'Système de Café Universitaire',
      page_subtitle: 'Gestion des commandes, réservations et groupes - Année 2025-2026',
      output_title: 'Sortie:',
      modal_title: 'Avis',
      modal_close: 'Fermer',
      login_title: 'Se connecter',
      email_label: 'Email',
      email_placeholder: 'Entrez votre email',
      password_label: 'Mot de passe',
      password_placeholder: 'Entrez votre mot de passe',
      btn_access: 'ACCÉDER',
      btn_back: 'RETOUR',
      btn_home: 'Accueil',
      btn_register_link: 'S\'inscrire',
      btn_register_nick: 'Ajouter utilisateur par Nick',
      
      register_title: 'Créer un nouveau compte',
      name_label: 'Nom',
      name_placeholder: 'Votre nom',
      lastname_label: 'Nom de famille',
      lastname_placeholder: 'Votre nom de famille',
      email_placeholder_register: 'vous@email.com',
      email_confirmation_text: 'Vous recevrez un email de confirmation',
      password_placeholder_register: 'Minimum 6 caractères',
      btn_register: 'Créer le compte',
      required_fields_text: '* Champs obligatoires',
      btn_see_menu: 'Voir le menu',
      btn_remove: 'Supprimer',
      cart_title: 'Votre Panier',
      cart_summary: 'Résumé de la commande',
      cart_subtitle: 'Vérifiez et confirmez votre commande',
      cart_total: 'Total',
      cart_empty: 'Votre panier est vide',
      cart_empty_text: 'Ajoutez des produits du menu pour continuer',
      btn_confirm_order: 'Confirmer la commande',
      btn_continue_shopping: 'Continuer les achats',
      btn_clear_cart: 'Vider le panier',
      confirm_remove_item: 'Supprimer ce produit du panier?',
      confirm_clear_cart: 'Vider tout le panier?',
      item_removed: 'Produit supprimé',
      cart_cleared: 'Panier vidé',
      subtotal: 'Sous-total',
      products: 'produits',
      summary: 'Résumé',
      order_type: 'Type de commande',
      eat_here: 'Manger ici (Réserver une table)',
      delivery: 'Livraison à domicile',
      payment_method: 'Mode de paiement',
      payment_cash: 'Espèces',
      payment_cash_desc: 'Payez lors du retrait',
      payment_card: 'Carte',
      payment_card_desc: 'Paiement par carte bancaire',
      payment_bizum: 'Bizum',
      payment_bizum_desc: 'Paiement instantané avec Bizum',
      payment_paypal: 'PayPal',
      payment_paypal_desc: 'Paiement sécurisé avec PayPal',
      payment_card_title: 'Paiement par Carte',
      payment_bizum_title: 'Paiement Bizum',
      payment_paypal_title: 'Paiement PayPal',
      card_number: 'Numéro de carte',
      card_number_placeholder: '1234 5678 9012 3456',
      expiry_date: 'Date d\'expiration (MM/AA)',
      cvv_label: 'CVV',
      btn_confirm_payment: 'Confirmer le paiement',
      bizum_phone: 'Téléphone',
      bizum_notification: 'Vous recevrez une notification sur votre téléphone pour autoriser le paiement',
      paypal_charge: 'Le montant sera débité de votre compte PayPal',
      loading_order: 'Traitement de la commande...',
      loading_menu: 'Chargement du menu...',
      menu_title: 'Menu du Café',
      menu_day_title: 'Menu du jour',
      menu_subtitle: 'Sélectionnez les produits que vous souhaitez commander',
      btn_add: 'Ajouter au panier',
      btn_view: 'Voir',
      btn_add_to_cart: 'Ajouter au panier',
      btn_view_cart: 'Voir le panier',
      btn_reload: 'Recharger',
      no_products: 'Aucun produit disponible',
      come_back_later: 'Veuillez revenir plus tard',
      error_loading_menu: 'Erreur lors du chargement du menu',
      please_reload: 'Veuillez recharger la page',
      product_added: 'Produit ajouté au panier',
      added: 'Ajouté',
      product_not_found: 'Produit non trouvé',
      error_adding_product: 'Erreur lors de l\'ajout du produit',
      settings_title: 'Paramètres',
      enable_daltonism: 'Activer le mode daltonien',
      change_language: 'Changer de langue',
      language_spanish: 'Espagnol',
      language_english: 'Anglais',
      language_french: 'Français',
      btn_apply: 'Appliquer',
      empty_cart: 'Le panier est vide',
      empty_fields: 'Veuillez remplir tous les champs obligatoires',
      payment_successful: 'Paiement réussi!',
      settings_applied: 'Paramètres appliqués avec succès',
      error_processing: 'Erreur lors du traitement de la commande',
      invalid_card_number: 'Le numéro de carte doit avoir 16 chiffres',
      invalid_date_format: 'Format de date invalide (MM/AA)',
      invalid_month: 'Mois invalide (doit être 01-12)',
      invalid_cvv: 'Le CVV doit avoir 3 chiffres',

      // Home buttons
      btn_create_group: 'Créer un groupe',
      btn_view_groups: 'Voir les groupes',
      btn_view_menu: 'Voir le menu',
      btn_my_orders: 'Mes commandes',
      btn_private_chats: 'Chats privés',
      btn_logout: 'Déconnexion',
      login_link: 'Vous avez déjà un compte? Connectez-vous',

       // Resumen pedido final
      payment_success: 'Paiement réussi!',
      order_processed: 'Votre commande a été traitée avec succès',
      order_number: 'Numéro de commande:',
      order_date: 'Date:',
      order_payment_method: 'Mode de paiement:',
      order_total: 'Total:',
      btn_back_home: 'Retour à l\'accueil',
      btn_new_order: 'Faire une autre commande',

      // Réservation de table
      reserve_table: 'Réserver une table',
      delivery_not_available: 'Livraison à domicile non disponible pour le moment',
      reserva_confirmed: 'Réservation confirmée',
      reserva_confirmada: '✅ Réservation confirmée avec succès',
      error_reserva: 'Erreur lors du traitement de la réservation',
      error_num_personas: 'Entrez le nombre de personnes',
      error_hours: 'Entrez l\'heure de début et de fin',
      error_end_time: 'L\'heure de fin doit être après l\'heure de début',
      step1_title: 'Détails de la réservation',
      num_people: 'Nombre de personnes',
      start_time: 'Heure de début',
      end_time: 'Heure de fin',
      info_title: 'ℹ️ Information:',
      info_text: 'Chaque table peut accueillir 4 personnes. Le système calculera automatiquement le nombre de tables nécessaires.',
      btn_cancel: 'Annuler',
      btn_continue: 'Continuer',
      btn_back: 'Retour',
      step2_title: 'Sélectionnez vos tables',
      tables_needed: 'Tables nécessaires:',
      tables_selected: 'Tables sélectionnées:',
      legend_available: 'Disponible',
      legend_selected: 'Sélectionnée',
      legend_occupied: 'Occupée',
      step3_title: 'Confirmer la réservation',
      summary_people: 'Nombre de personnes:',
      summary_time: 'Horaire:',
      summary_tables: 'Tables:',
      confirm_info_title: '✅ Tout est prêt!',
      confirm_info_text: 'En confirmant, vos tables seront réservées. N\'oubliez pas d\'arriver à l\'heure.',
      btn_confirm_reservation: 'Confirmer la réservation',
      processing: 'Traitement...',
      reserva_confirmed_text: 'Réservation confirmée',
      btn_my_reservations: 'Mes Réservations',
      my_reservations_title: 'Mes Réservations',
      no_reservations: 'Vous n\'avez aucune réservation enregistrée.',
      btn_make_order: 'Passer une commande et réserver',
      created_on: 'Créée le:',
      reservation_date: 'Date de réservation:',
      time_slot: 'Horaire:',
      tables: 'Table(s):',
      btn_cancel_reservation: 'Annuler la réservation',
      confirm_cancel_reservation: 'Êtes-vous sûr de vouloir annuler cette réservation?',
      reservation_cancelled: '✓ Réservation annulée avec succès',
      error_cancelling: 'Erreur lors de l\'annulation',
      error_loading_reservations: 'Erreur lors du chargement des réservations',
      error_loading_reservations_title: 'Erreur lors du chargement',
      error_loading_reservations_text: 'Impossible de charger vos réservations. Veuillez réessayer plus tard.',

      // À propos de nous
      about_us_title: 'À propos de nous',
      cafeteria_name: 'Cafétéria École Polytechnique Albacete',
      cafeteria_slogan: 'Votre espace de repos sur le campus universitaire',
      schedule_title: 'Horaires d\'ouverture',
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche',
      closed: 'Fermé',
      contact_title: 'Contact',
      address_label: 'Adresse:',
      address_value: 'C. Guillermina Medrano Aranda, 02006 Albacete',
      phone_label: 'Téléphone:',
      price_label: 'Prix:',
      price_value: '1-10 € par personne (Menu 10 €)',
      social_label: 'Réseaux sociaux:',
      rating_title: 'Évaluation',
      based_on: 'Basé sur',
      reviews: 'avis',
      category: 'Catégorie:',
      cafeteria: 'Cafétéria',
      location_title: 'Comment s\'y rendre',
      campus_info: 'Campus d\'Albacete',
      uclm: 'Université de Castilla-La Mancha',
      features_title: 'Nos Services',
      service_menu: 'Menu varié',
      service_coffee: 'Cafés spéciaux',
      service_healthy: 'Options saines',
      service_online: 'Commandes en ligne',
      service_reservation: 'Réservation de tables',
      service_payment: 'Paiements multiples',
      get_directions: 'Itinéraire (Google Maps)'
    }
  },

  // Cargar configuración
  load() {
    const saved = localStorage.getItem('app_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error al cargar configuración:', e);
        return { ...this.defaults };
      }
    }
    return { ...this.defaults };
  },

  // Guardar configuración
  save(settings) {
    localStorage.setItem('app_settings', JSON.stringify(settings));
    this.apply(settings);
  },

  // Aplicar configuración SIN RECARGAR PÁGINA
  apply(settings) {
    // Aplicar daltonismo
    if (settings.daltonismo) {
      document.body.classList.add('daltonism-mode');
    } else {
      document.body.classList.remove('daltonism-mode');
    }

    // Aplicar idioma SIN recargar
    this.updatePageTexts(settings.idioma);
    
    console.log('✓ Configuración aplicada:', settings);
  },

  // Actualizar textos de la página
  updatePageTexts(lang) {
    const texts = this.translations[lang] || this.translations['es'];
    
    // Actualizar elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (texts[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = texts[key];
        } else {
          el.textContent = texts[key];
        }
      }
    });
    
    // Actualizar productos en el menú si existe la función
    this.updateProductTexts(lang);
  },
  
  // Actualizar textos de productos dinámicamente
  updateProductTexts(lang) {
    // Actualizar títulos de productos
    document.querySelectorAll('.menu-card-title').forEach(el => {
      const originalText = el.getAttribute('data-original') || el.textContent;
      if (!el.getAttribute('data-original')) {
        el.setAttribute('data-original', originalText);
      }
      el.textContent = this.translateProduct(originalText, lang);
    });
    
    // Actualizar descripciones de productos
    document.querySelectorAll('.menu-card-desc').forEach(el => {
      const originalText = el.getAttribute('data-original') || el.textContent;
      if (!el.getAttribute('data-original')) {
        el.setAttribute('data-original', originalText);
      }
      el.textContent = this.translateProduct(originalText, lang);
    });
    
    // Actualizar items del carrito si existen
    document.querySelectorAll('.item-title').forEach(el => {
      const originalText = el.getAttribute('data-original') || el.textContent;
      if (!el.getAttribute('data-original')) {
        el.setAttribute('data-original', originalText);
      }
      el.textContent = this.translateProduct(originalText, lang);
    });
    
    document.querySelectorAll('.item-desc').forEach(el => {
      const originalText = el.getAttribute('data-original') || el.textContent;
      if (!el.getAttribute('data-original')) {
        el.setAttribute('data-original', originalText);
      }
      el.textContent = this.translateProduct(originalText, lang);
    });
  },

  // Traducir producto
  translateProduct(text, lang = null) {
    if (!lang) {
      const settings = this.load();
      lang = settings.idioma;
    }
    return this.productTranslations[lang]?.[text] || text;
  },

  // Obtener traducción
  t(key, lang = null) {
    if (!lang) {
      const settings = this.load();
      lang = settings.idioma;
    }
    return this.translations[lang]?.[key] || this.translations['es']?.[key] || key;
  }
};

// ✅ APLICAR CONFIGURACIÓN AL CARGAR LA PÁGINA (SIN RECARGAR)
document.addEventListener('DOMContentLoaded', () => {
  const settings = AppSettings.load();
  AppSettings.apply(settings);
});

// Exportar para uso global
window.AppSettings = AppSettings;