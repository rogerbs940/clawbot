#!/bin/bash

# Script para instalar Ollama y configurar modelos locales gratuitos
# Compatible con Linux, macOS y Windows (WSL)

echo "🤖 Instalando Ollama para modelos de IA locales y gratuitos..."

# Detectar sistema operativo
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Detectado Linux"
    curl -fsSL https://ollama.ai/install.sh | sh
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Detectado macOS"
    curl -fsSL https://ollama.ai/install.sh | sh
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "🪟 Detectado Windows"
    echo "Descarga Ollama desde: https://ollama.ai/download"
    echo "Ejecuta el instalador y luego vuelve aquí"
    exit 1
else
    echo "❌ Sistema operativo no soportado"
    exit 1
fi

echo "✅ Ollama instalado!"

echo "📥 Descargando modelos gratuitos..."

# Modelos recomendados (elige uno o instala varios)
echo "Instalando Llama 2 (7B parameters - rápido)..."
ollama pull llama2

echo "Instalando Llama 3 (8B parameters - más inteligente)..."
ollama pull llama3

echo "Instalando Code Llama (para código)..."
ollama pull codellama

echo "🎉 ¡Listo! Modelos instalados:"
echo "   - llama2 (rápido, general)"
echo "   - llama3 (inteligente, conversacional)"
echo "   - codellama (especializado en código)"

echo ""
echo "📝 Para usar en tu agente, actualiza .env:"
echo "OLLAMA_MODEL=llama2"
echo ""
echo "🚀 Prueba con: npm run test-ai 'Hola mundo'"

echo ""
echo "💡 Comandos útiles:"
echo "   ollama list          # Ver modelos instalados"
echo "   ollama serve         # Iniciar servidor"
echo "   ollama pull <modelo> # Descargar más modelos"