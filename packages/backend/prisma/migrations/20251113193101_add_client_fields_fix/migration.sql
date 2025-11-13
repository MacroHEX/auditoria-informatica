/*
  Warnings:

  - Added the required column `clienteNombre` to the `tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoIdentificacion` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoIdentificacion" AS ENUM ('CI', 'PASAPORTE', 'CEDULA_EXTRANJERA', 'TELEFONO');

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "clienteDocumento" TEXT,
ADD COLUMN     "clienteNombre" TEXT NOT NULL,
ADD COLUMN     "clienteTelefono" TEXT,
ADD COLUMN     "tipoIdentificacion" "TipoIdentificacion" NOT NULL;
