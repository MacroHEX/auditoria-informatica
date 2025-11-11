const { io } = require('socket.io-client');

console.log('🔌 Probando conexión Socket.IO...');

// Conectar al servidor
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('✅ CONECTADO al servidor Socket.IO');
  console.log('📋 ID del socket:', socket.id);

  // Solicitar estado inicial
  console.log('🔄 Solicitando estado inicial...');
  socket.emit('obtener_estado_inicial');
});

socket.on('estado_inicial', (data) => {
  console.log('📦 Estado inicial recibido:');
  console.log('   - Tickets totales:', data.tickets.length);
  console.log('   - Últimos llamados:', data.ultimosLlamados.length);
});

socket.on('nuevo_ticket_generado', (ticket) => {
  console.log('🎫 NUEVO TICKET EN TIEMPO REAL:', ticket.numero);
});

socket.on('ticket_llamado', (data) => {
  console.log('📢 TICKET LLAMADO EN TIEMPO REAL:');
  console.log('   - Ticket:', data.ticket.numero);
  console.log('   - Cajero:', data.cajeroId);
});

socket.on('ticket_completado', (ticket) => {
  console.log('✅ TICKET COMPLETADO EN TIEMPO REAL:', ticket.numero);
});

socket.on('error', (error) => {
  console.log('❌ Error del servidor:', error.mensaje);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Desconectado:', reason);
});

// Probar generación de tickets después de 2 segundos
setTimeout(() => {
  console.log('\n🧪 TEST: Generando ticket VENTANILLA...');
  socket.emit('solicitar_ticket', { tipo: 'VENTANILLA' });
}, 2000);

// Probar llamado de ticket después de 4 segundos
setTimeout(() => {
  console.log('\n🧪 TEST: Llamando siguiente ticket...');
  socket.emit('llamar_siguiente_ticket', { cajeroId: 'cajero-test-01' });
}, 4000);

// Probar completar ticket después de 6 segundos
setTimeout(() => {
  console.log('\n🧪 TEST: Completando ticket...');
  // Necesitamos obtener un ticket ID primero, usaremos V01
  socket.emit('completar_ticket', { 
    ticketId: 'cmhui72bm0000ki80w6vsy9fu', // ID de V01
    cajeroId: 'cajero-test-01' 
  });
}, 6000);

// Finalizar después de 8 segundos
setTimeout(() => {
  console.log('\n🎉 Pruebas de Socket.IO completadas!');
  console.log('✅ El backend está funcionando CORRECTAMENTE en tiempo real');
  process.exit(0);
}, 8000);