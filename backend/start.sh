#!/bin/bash
echo "📦 Instalando o navegador Chromium para o Playwright..."
playwright install chromium

echo "🚀 Iniciando o servidor Uvicorn..."
exec uvicorn api:app --host 0.0.0.0 --port ${PORT}
