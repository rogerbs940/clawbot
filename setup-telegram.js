#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log(`🤖 CONFIGURANDO BOT DE TELEGRAM PARA CLAWBOT`);
console.log(`================================================`);

async function setupTelegramBot() {
  const envPath = path.join(__dirname, '.env');

  // Verificar si ya tiene token
  let hasToken = false;
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    hasToken = envContent.includes('TELEGRAM_BOT_TOKEN=') &&
               !envContent.includes('TELEGRAM_BOT_TOKEN=your_bot_token_here');
  }

  if (!hasToken) {
    console.log('1️⃣ CONFIGURACIÓN DEL BOT DE TELEGRAM:');
    console.log('   📝 PASOS PARA OBTENER TOKEN:');
    console.log('   1. Abre Telegram y busca @BotFather');
    console.log('   2. Envía: /newbot');
    console.log('   3. Sigue las instrucciones (nombre del bot)');
    console.log('   4. Copia el TOKEN que te da BotFather');
    console.log('   5. Actualiza tu .env:');
    console.log('      TELEGRAM_BOT_TOKEN=tu_token_aqui');
    console.log('');
    console.log('   🔗 Link directo: https://t.me/BotFather');
    console.log('');
    return;
  }

  console.log('✅ TOKEN DE TELEGRAM CONFIGURADO');

  // Verificar skill instalada
  const telegramSkillPath = path.join(__dirname, 'skills', 'telegram');
  if (!fs.existsSync(telegramSkillPath)) {
    console.log('❌ Skill de Telegram no instalada');
    console.log('   Ejecuta: npx clawhub@latest install telegram');
    return;
  }

  console.log('✅ SKILL DE TELEGRAM INSTALADA');

  // Crear script de bot básico
  const botScript = `#!/usr/bin/env node

import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE_URL = \`https://api.telegram.org/bot\${BOT_TOKEN}\`;

if (!BOT_TOKEN || BOT_TOKEN.includes('your_bot_token_here')) {
  console.log('❌ TELEGRAM_BOT_TOKEN no configurado en .env');
  process.exit(1);
}

console.log('🤖 Clawbot Telegram Bot iniciado...');

// Función para enviar mensajes
async function sendMessage(chatId, text) {
  const url = \`\${BASE_URL}/sendMessage\`;
  const data = JSON.stringify({
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown'
  });

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Función para obtener updates
async function getUpdates(offset = 0) {
  const url = \`\${BASE_URL}/getUpdates?offset=\${offset}&timeout=30\`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    }).on('error', reject);
  });
}

// Procesar mensajes
async function processMessage(message) {
  const chatId = message.chat.id;
  const text = message.text;
  const user = message.from.first_name;

  console.log(\`📨 Mensaje de \${user}: \${text}\`);

  let response = \`Hola \${user}! Soy Clawbot, un agente verificado en Billions Network.\\n\\n\`;

  if (text === '/start') {
    response += \`🤖 Mi DID: \`did:iden3:billions:main:2VmAkXrihYaLF1n9oFxpXUgQVUV2nSiTZ9ScDdbBrw\`\\n\`;
    response += \`💰 Estoy ganando \$BILL en el programa FAIAR\\n\\n\`;
    response += \`Comandos disponibles:\\n\`;
    response += \`/status - Ver mi estado\\n\`;
    response += \`/help - Ayuda\\n\`;
  } else if (text === '/status') {
    response += \`✅ Estado: Activo y verificado\\n\`;
    response += \`🔗 Ver en: https://8004scan.io/agents\\n\`;
    response += \`💰 Ganando recompensas automáticamente\\n\`;
  } else if (text === '/help') {
    response += \`Soy un agente de IA verificado. Puedo:\\n\`;
    response += \`• Responder preguntas\\n\`;
    response += \`• Ejecutar comandos\\n\`;
    response += \`• Ganar \$BILL automáticamente\\n\`;
  } else {
    response += \`Recibí tu mensaje: "\${text}"\\n\\n\`;
    response += \`¿En qué puedo ayudarte?\`;
  }

  await sendMessage(chatId, response);
}

// Loop principal
let lastUpdateId = 0;

async function main() {
  console.log('🚀 Bot listo para recibir mensajes...');

  while (true) {
    try {
      const updates = await getUpdates(lastUpdateId + 1);

      if (updates.ok && updates.result.length > 0) {
        for (const update of updates.result) {
          if (update.message) {
            await processMessage(update.message);
          }
          lastUpdateId = update.update_id;
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Esperar un poco antes del siguiente poll
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

main().catch(console.error);
`;

  const botScriptPath = path.join(__dirname, 'telegram-bot.js');
  fs.writeFileSync(botScriptPath, botScript);

  console.log('✅ SCRIPT DE BOT CREADO: telegram-bot.js');

  // Actualizar package.json
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  packageJson.scripts['telegram-bot'] = 'node telegram-bot.js';
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log('✅ SCRIPT AGREGADO A package.json');

  console.log('\n🚀 PARA INICIAR EL BOT:');
  console.log('   npm run telegram-bot');
  console.log('');
  console.log('📱 PRUEBA EL BOT:');
  console.log('   1. Abre Telegram');
  console.log('   2. Busca tu bot (el nombre que pusiste)');
  console.log('   3. Envía: /start');
  console.log('');
  console.log('⚠️ NOTA: El bot usa polling. Para producción, configura webhook.');
}

setupTelegramBot().catch(console.error);