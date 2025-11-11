import { PrismaClient, TipoTicket } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding de la base de datos...');

  try {
    // Limpiar base de datos existente
    await prisma.llamadoTicket.deleteMany();
    await prisma.ticket.deleteMany();

    // Crear algunos tickets de ejemplo
    const ticketsData = [
      { numero: 'V01', tipo: TipoTicket.VENTANILLA },
      { numero: 'V02', tipo: TipoTicket.VENTANILLA },
      { numero: 'C01', tipo: TipoTicket.CAJA },
      { numero: 'A01', tipo: TipoTicket.ASESORIA },
      { numero: 'V03', tipo: TipoTicket.VENTANILLA },
    ];

    for (const ticketData of ticketsData) {
      await prisma.ticket.create({
        data: ticketData,
      });
    }

    console.log('✅ Seeding completado exitosamente');
    console.log('📊 Tickets creados:');
    const tickets = await prisma.ticket.findMany();
    tickets.forEach(ticket => {
      console.log(`   - ${ticket.numero} (${ticket.tipo})`);
    });

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error fatal durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });