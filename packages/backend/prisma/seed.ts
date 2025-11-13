import {PrismaClient, TipoIdentificacion, TipoTicket} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seeding de la base de datos...');

  try {
    // Limpiar base de datos existente
    await prisma.llamadoTicket.deleteMany();
    await prisma.ticket.deleteMany();

    // Crear algunos tickets de ejemplo con información del cliente
    const ticketsData = [
      {
        numero: 'V01',
        tipo: TipoTicket.VENTANILLA,
        clienteNombre: 'Juan Pérez',
        tipoIdentificacion: TipoIdentificacion.CI,
        clienteDocumento: '12345678'
      },
      {
        numero: 'V02',
        tipo: TipoTicket.VENTANILLA,
        clienteNombre: 'María García',
        tipoIdentificacion: TipoIdentificacion.CI,
        clienteDocumento: '87654321'
      },
      {
        numero: 'C01',
        tipo: TipoTicket.CAJA,
        clienteNombre: 'Carlos López',
        tipoIdentificacion: TipoIdentificacion.PASAPORTE,
        clienteDocumento: 'AB123456'
      },
      {
        numero: 'A01',
        tipo: TipoTicket.ASESORIA,
        clienteNombre: 'Ana Martínez',
        tipoIdentificacion: TipoIdentificacion.TELEFONO,
        clienteTelefono: '+51987654321'
      },
      {
        numero: 'V03',
        tipo: TipoTicket.VENTANILLA,
        clienteNombre: 'Pedro Rodríguez',
        tipoIdentificacion: TipoIdentificacion.CEDULA_EXTRANJERA,
        clienteDocumento: 'CE789012'
      },
    ];

    for (const ticketData of ticketsData) {
      await prisma.ticket.create({
        data: ticketData,
      });
    }

    console.log('Seeding completado exitosamente');
    console.log('Tickets creados:');
    const tickets = await prisma.ticket.findMany();
    tickets.forEach(ticket => {
      console.log(`   - ${ticket.numero} (${ticket.tipo}) - ${ticket.clienteNombre}`);
    });

  } catch (error) {
    console.error('Error durante el seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Error fatal durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });