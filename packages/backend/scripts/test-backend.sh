#!/bin/bash
echo "🧪 Probando backend en http://localhost:3000"
echo "=============================================="

echo "1. Health:"
curl -s http://localhost:3000/health

echo -e "\n2. Tickets:"
curl -s http://localhost:3000/api/tickets

echo -e "\n3. Generar ticket:"
curl -s -X POST http://localhost:3000/api/tickets/generar \
  -H "Content-Type: application/json" \
  -d '{"tipo":"VENTANILLA"}'

echo -e "\n🎉 Listo!"