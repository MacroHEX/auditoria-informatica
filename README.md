# Sistema de Agendamiento de Tickets - Banco

## 📋 Descripción
Sistema de gestión de tickets en tiempo real para sucursales bancarias, desarrollado como proyecto final de auditoría informática. **Incluye vulnerabilidades intencionales para demostración de auditoría con framework NIST**.

## 🏗️ Arquitectura
- **Backend**: Node.js + Express + Socket.IO + Prisma + PostgreSQL
- **Frontend**: React + Vite + Mantine UI
- **Base de datos**: PostgreSQL
- **Package Manager**: pnpm
- **Comunicación**: Socket.IO para tiempo real

## 🎯 Objetivo de Auditoría
Demostrar aplicación del framework NIST CSF 2.0:
- Identify, Protect, Detect, Respond, Recover
- Vulnerabilidades intencionales para análisis
- Principios SOLID aplicados
- Documentación completa para auditoría

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+
- pnpm (se instala automáticamente)

### Instalación Rápida

```bash
# Ejecutar script de setup completo
chmod +x setup.sh
./setup.sh