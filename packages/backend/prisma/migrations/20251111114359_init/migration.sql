-- CreateEnum
CREATE TYPE "TipoTicket" AS ENUM ('VENTANILLA', 'CAJA', 'ASESORIA');

-- CreateEnum
CREATE TYPE "EstadoTicket" AS ENUM ('EnEspera', 'Llamado', 'Atendido', 'Cancelado');

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" "TipoTicket" NOT NULL,
    "estado" "EstadoTicket" NOT NULL DEFAULT 'EnEspera',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "llamadoAt" TIMESTAMP(3),

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "llamado_tickets" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "cajeroId" TEXT NOT NULL,
    "llamadoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "llamado_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickets_numero_key" ON "tickets"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "llamado_tickets_ticketId_key" ON "llamado_tickets"("ticketId");

-- AddForeignKey
ALTER TABLE "llamado_tickets" ADD CONSTRAINT "llamado_tickets_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
