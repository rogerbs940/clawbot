# 🤖 Clawbot - Verified AI Agent

Un agente de IA verificado en la red Billions que gana recompensas automáticamente en el programa FAIAR.

## 🔒 Seguridad

### ✅ Medidas de seguridad implementadas:
- Archivo `.env` con permisos `600` (solo propietario puede leer)
- `.gitignore` configurado para no subir credenciales
- Claves privadas encriptadas opcionalmente con `BILLIONS_NETWORK_MASTER_KMS_KEY`

### 🛡️ Mejores prácticas:
- Nunca compartas tu `ANTHROPIC_API_KEY` o `GOOGLE_API_KEY`
- Usa variables de entorno para todas las credenciales
- Mantén actualizado tu sistema y dependencias

## 🚀 Inicio rápido

```bash
# Instalar dependencias
npm install

# Ver estado del agente
npm start

# Probar integraciones de IA
npm run test-ai "Hola, ¿cómo estás?"
```

## 🧠 Opciones de IA (elige una o más)

### 1. 🎁 Gemini (Google) - GRATUITO
```bash
# Obtén API key gratis en: https://makersuite.google.com/app/apikey
# Actualiza .env:
GOOGLE_API_KEY=tu_clave_aqui
```

### 2. 🏠 Ollama Local - 100% GRATUITO
```bash
# Instala Ollama: https://ollama.ai/download
# Descarga un modelo: ollama pull llama2
# Actualiza .env:
OLLAMA_MODEL=llama2
```

### 3. 💎 Claude (Anthropic) - PAGO
```bash
# API key en: https://console.anthropic.com/
# Actualiza .env:
ANTHROPIC_API_KEY=tu_clave_aqui
```

## 💰 Ganar $BILL

Tu agente ya está:
- ✅ Verificado en ERC-8004 Registry
- ✅ Participando en FAIAR program
- ✅ Ganando recompensas automáticamente

### Ver recompensas pendientes:
```bash
cd verified-agent-identity/scripts
node getIdentities.js
```

## 📁 Estructura del proyecto

```
/workspaces/clawbot/
├── agent.js              # Punto de entrada principal
├── test-ai.js            # Script para probar IA
├── .env                  # Configuración (NO subir a git)
├── .gitignore           # Archivos ignorados por git
├── package.json         # Dependencias y scripts
└── skills/              # Skills instaladas
    ├── verified-agent-identity/
    ├── gemini/
    ├── ollama-local/
    └── anthropic/
```

## 🔧 Comandos útiles

```bash
# Ver estado del agente
npm start

# Desarrollo con auto-reload
npm run dev

# Probar todas las IA configuradas
npm run test-ai "Pregunta de prueba"

# Instalar nueva skill
npx clawhub@latest search "nombre-skill"
npx clawhub@latest install "nombre-skill"

# Ver identidad del agente
cd verified-agent-identity/scripts && node getIdentities.js
```

## 📊 Estado actual

- **DID**: `did:iden3:billions:main:2VmAkXrihYaLF1n9oFxpXUgQVUV2nSiTZ9ScDdbBrw`
- **Estado**: Verificado y activo
- **Red**: Billions Network (ERC-8004)
- **Programa**: FAIAR - Ganando $BILL

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver LICENSE para más detalles.