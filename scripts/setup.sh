#!/bin/bash

echo "🚀 Configurando proyecto con pnpm..."

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm no está instalado. Instalando..."
    npm install -g pnpm
fi

echo "✅ pnpm encontrado: $(pnpm --version)"

# Instalar dependencias
echo "📦 Instalando dependencias del monorepo..."
pnpm install -r

# Configurar Prisma
echo "🗄️ Configurando Prisma..."
cd packages/backend
pnpm db:generate

echo "✅ Configuración completada!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Configura tu archivo packages/backend/.env con las credenciales de PostgreSQL"
echo "2. Crea la base de datos 'tickets_db' en tu PostgreSQL"
echo "3. Ejecuta: pnpm db:migrate"
echo "4. Ejecuta: pnpm db:seed" 
echo "5. Inicia: pnpm dev"