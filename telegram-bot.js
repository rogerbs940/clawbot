#!/usr/bin/env node

import dotenv from 'dotenv';
import https from 'https';
import { askOpenRouter, askGemini, askOllama, askClaude } from './agent.js';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

if (!BOT_TOKEN || BOT_TOKEN.includes('your_bot_token_here')) {
  console.log('❌ TELEGRAM_BOT_TOKEN no configurado en .env');
  process.exit(1);
}

console.log('🤖 Clawbot Telegram Bot iniciado...');

// ========== SEGURIDAD Y ANÁLISIS MALICIOSO ==========

// Rate limiting: máximo 10 mensajes por usuario por minuto
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 10;

// Palabras clave maliciosas para filtrar
const MALICIOUS_KEYWORDS = [
  'hack', 'exploit', 'malware', 'virus', 'trojan', 'ransomware',
  'sql injection', 'xss', 'csrf', 'ddos', 'brute force',
  'password crack', 'keylogger', 'spyware', 'rootkit',
  'phishing', 'scam', 'fraud', 'illegal', 'drug', 'weapon',
  'bomb', 'terrorist', 'hate speech', 'racist', 'violent'
];

// Patrones peligrosos
const DANGEROUS_PATTERNS = [
  /system\([^)]*\)/i,  // system() calls
  /exec\([^)]*\)/i,    // exec() calls
  /eval\([^)]*\)/i,    // eval() calls
  /require\([^)]*\)/i, // require() calls
  /import\([^)]*\)/i,  // import() calls
  /process\.env/i,     // environment access
  /fs\./i,             // file system access
  /child_process/i,    // child process
  /__dirname/i,        // directory access
  /global\./i,         // global object
  /window\./i,         // browser global
  /document\./i,       // DOM access
  /localStorage/i,     // local storage
  /sessionStorage/i,   // session storage
  /cookie/i,           // cookies
  /innerHTML/i,        // DOM manipulation
  /outerHTML/i,        // DOM manipulation
  /insertAdjacentHTML/i, // DOM manipulation
  /dangerouslySetInnerHTML/i, // React dangerous
  /script/i,           // script tags
  /javascript:/i,      // javascript: URLs
  /data:/i,            // data: URLs
  /vbscript:/i,        // vbscript: URLs
  /on\w+\s*=/i,        // event handlers
  /<script/i,          // script tags
  /<\/script/i,        // script tags
  /<iframe/i,          // iframe tags
  /<object/i,          // object tags
  /<embed/i,           // embed tags
  /<form/i,           // form tags
  /<input/i,           // input tags
  /<button/i,          // button tags
  /onclick/i,          // onclick handlers
  /onload/i,           // onload handlers
  /onerror/i,          // onerror handlers
  /onmouseover/i,      // mouseover handlers
  /onmouseout/i,       // mouseout handlers
  /onkeydown/i,        // keydown handlers
  /onkeyup/i,          // keyup handlers
  /onkeypress/i,       // keypress handlers
  /onchange/i,         // change handlers
  /onsubmit/i,         // submit handlers
  /onfocus/i,          // focus handlers
  /onblur/i,          // blur handlers
  /onselect/i,         // select handlers
  /onscroll/i,         // scroll handlers
  /onresize/i,         // resize handlers
  /onunload/i,         // unload handlers
  /onbeforeunload/i,   // beforeunload handlers
  /onhashchange/i,     // hashchange handlers
  /onpopstate/i,       // popstate handlers
  /onstorage/i,        // storage handlers
  /onmessage/i,        // message handlers
  /ononline/i,         // online handlers
  /onoffline/i,        // offline handlers
  /onpagehide/i,       // pagehide handlers
  /onpageshow/i,       // pageshow handlers
  /onbeforeprint/i,    // beforeprint handlers
  /onafterprint/i,     // afterprint handlers
  /oncontextmenu/i,    // contextmenu handlers
  /ondrag/i,           // drag handlers
  /ondrop/i,           // drop handlers
  /ondragstart/i,      // dragstart handlers
  /ondragend/i,        // dragend handlers
  /ondragover/i,       // dragover handlers
  /ondragenter/i,      // dragenter handlers
  /ondragleave/i,      // dragleave handlers
  /ondblclick/i,       // dblclick handlers
  /onwheel/i,          // wheel handlers
  /oncopy/i,           // copy handlers
  /oncut/i,            // cut handlers
  /onpaste/i,          // paste handlers
  /onabort/i,          // abort handlers
  /oncanplay/i,        // canplay handlers
  /oncanplaythrough/i, // canplaythrough handlers
  /ondurationchange/i, // durationchange handlers
  /onemptied/i,        // emptied handlers
  /onended/i,          // ended handlers
  /onloadeddata/i,     // loadeddata handlers
  /onloadedmetadata/i, // loadedmetadata handlers
  /onloadstart/i,      // loadstart handlers
  /onpause/i,          // pause handlers
  /onplay/i,           // play handlers
  /onplaying/i,        // playing handlers
  /onprogress/i,       // progress handlers
  /onratechange/i,     // ratechange handlers
  /onseeked/i,         // seeked handlers
  /onseeking/i,        // seeking handlers
  /onstalled/i,        // stalled handlers
  /onsuspend/i,        // suspend handlers
  /ontimeupdate/i,     // timeupdate handlers
  /onvolumechange/i,   // volumechange handlers
  /onwaiting/i,        // waiting handlers
  /onshow/i,           // show handlers
  /ontoggle/i,         // toggle handlers
  /oninvalid/i,        // invalid handlers
  /onsearch/i,         // search handlers
  /oninput/i,          // input handlers
  /onbeforeinput/i,    // beforeinput handlers
  /onselectstart/i,    // selectstart handlers
  /onselectionchange/i, // selectionchange handlers
  /onpointerdown/i,    // pointerdown handlers
  /onpointerup/i,      // pointerup handlers
  /onpointermove/i,    // pointermove handlers
  /onpointerover/i,    // pointerover handlers
  /onpointerout/i,     // pointerout handlers
  /onpointerenter/i,   // pointerenter handlers
  /onpointerleave/i,   // pointerleave handlers
  /onpointercancel/i,  // pointercancel handlers
  /ongotpointercapture/i, // gotpointercapture handlers
  /onlostpointercapture/i, // lostpointercapture handlers
  /onpointerrawupdate/i, // pointerrawupdate handlers
  /ontouchstart/i,     // touchstart handlers
  /ontouchend/i,       // touchend handlers
  /ontouchmove/i,      // touchmove handlers
  /ontouchcancel/i,    // touchcancel handlers
  /ontransitionstart/i, // transitionstart handlers
  /ontransitionend/i,  // transitionend handlers
  /ontransitionrun/i,  // transitionrun handlers
  /ontransitioncancel/i, // transitioncancel handlers
  /onanimationstart/i, // animationstart handlers
  /onanimationend/i,   // animationend handlers
  /onanimationiteration/i, // animationiteration handlers
  /onanimationcancel/i, // animationcancel handlers
];

function checkRateLimit(userId) {
  const now = Date.now();
  const userRequests = rateLimit.get(userId) || [];
  
  // Limpiar requests antiguos
  const validRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= RATE_LIMIT_MAX) {
    return false; // Rate limit exceeded
  }
  
  validRequests.push(now);
  rateLimit.set(userId, validRequests);
  return true;
}

function analyzeMaliciousContent(text) {
  if (!text) return { isMalicious: false, reason: null };
  
  const lowerText = text.toLowerCase();
  
  // Check for malicious keywords
  for (const keyword of MALICIOUS_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return { 
        isMalicious: true, 
        reason: `Contiene palabra clave maliciosa: "${keyword}"` 
      };
    }
  }
  
  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(text)) {
      return { 
        isMalicious: true, 
        reason: `Contiene patrón peligroso: ${pattern}` 
      };
    }
  }
  
  // Check for very long messages (potential DoS)
  if (text.length > 10000) {
    return { 
      isMalicious: true, 
      reason: 'Mensaje demasiado largo (potencial ataque DoS)' 
    };
  }
  
  // Check for repeated characters (potential spam)
  const repeatedChars = /(.)\1{100,}/;
  if (repeatedChars.test(text)) {
    return { 
      isMalicious: true, 
      reason: 'Mensaje con caracteres repetidos (posible spam)' 
    };
  }
  
  return { isMalicious: false, reason: null };
}

function sanitizeInput(text) {
  if (!text) return '';
  
  // Remove null bytes and other control characters
  let sanitized = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length
  if (sanitized.length > 5000) {
    sanitized = sanitized.substring(0, 5000) + '...';
  }
  
  return sanitized;
}

// ========== FIN SEGURIDAD ==========

function hasOpenRouter() {
  return process.env.OPENROUTER_API_KEY && !/(YOUR_OPENROUTER_API_KEY_HERE|example)/i.test(process.env.OPENROUTER_API_KEY);
}

function hasGemini() {
  return process.env.GOOGLE_API_KEY && !/(your_google_api_key|YOUR_REAL_GOOGLE_API_KEY_HERE|example)/i.test(process.env.GOOGLE_API_KEY);
}

function hasOllama() {
  return process.env.OLLAMA_MODEL && process.env.OLLAMA_MODEL.trim() !== '' && !/(llama2|default)/i.test(process.env.OLLAMA_MODEL);
}

function hasClaude() {
  return process.env.ANTHROPIC_API_KEY && !/(your_api_key|your_api_key_here|example)/i.test(process.env.ANTHROPIC_API_KEY);
}

function getActiveService() {
  if (hasOpenRouter()) return 'openrouter';
  if (hasGemini()) return 'gemini';
  if (hasOllama()) return 'ollama';
  if (hasClaude()) return 'claude';
  return null;
}

async function sendMessage(chatId, text) {
  const url = `${BASE_URL}/sendMessage`;
  const data = JSON.stringify({
    chat_id: chatId,
    text
  });

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data, 'utf8')
      }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve(data);
        } catch (error) {
          console.error('Error parsing response from sendMessage:', error);
          console.error('Response body:', body.substring(0, 500));
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function getUpdates(offset = 0) {
  const url = `${BASE_URL}/getUpdates?offset=${offset}&timeout=10`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve(data);
        } catch (error) {
          console.error('Error parsing response from getUpdates:', error);
          console.error('Response body:', body.substring(0, 500));
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function callAI(service, text) {
  if (service === 'openrouter') return await askOpenRouter(text);
  if (service === 'gemini') return await askGemini(text);
  if (service === 'ollama') return await askOllama(text);
  if (service === 'claude') return await askClaude(text);
  throw new Error('Ningún servicio de IA configurado.');
}

async function processAiCommand(chatId, service, text) {
  try {
    const response = await callAI(service, text);
    await sendMessage(chatId, `✅ Respuesta de *${service.toUpperCase()}*:\n\n${response}`);
  } catch (error) {
    await sendMessage(chatId, `❌ Error en ${service}: ${error.message}`);
  }
}

async function processMessage(message) {
  const chatId = message.chat.id;
  const text = message.text?.trim();
  const user = message.from.first_name || 'amigo';
  const userId = message.from.id;

  if (!text) return;

  // ========== VERIFICACIONES DE SEGURIDAD ==========
  
  // 1. Rate limiting
  if (!checkRateLimit(userId)) {
    await sendMessage(chatId, '⚠️ Demasiados mensajes. Espera un minuto antes de enviar otro.');
    console.log(`🚫 Rate limit excedido por usuario ${userId}`);
    return;
  }
  
  // 2. Sanitizar input
  const sanitizedText = sanitizeInput(text);
  if (sanitizedText !== text) {
    console.log(`🧹 Input sanitizado para usuario ${userId}`);
  }
  
  // 3. Análisis de contenido malicioso
  const analysis = analyzeMaliciousContent(sanitizedText);
  if (analysis.isMalicious) {
    await sendMessage(chatId, 
      `🚨 Contenido potencialmente peligroso detectado.\n` +
      `Razón: ${analysis.reason}\n\n` +
      `Por seguridad, no procesaré este mensaje.`
    );
    console.log(`🚨 Contenido malicioso detectado de ${userId}: ${analysis.reason}`);
    return;
  }
  
  // ========== FIN VERIFICACIONES DE SEGURIDAD ==========

  console.log(`📨 Mensaje de ${user}: ${sanitizedText}`);

  // Usar el texto sanitizado para el resto del procesamiento
  const finalText = sanitizedText;

  if (finalText === '/start') {
    const activeService = getActiveService() || 'ninguno';
    await sendMessage(chatId,
      `Hola ${user}! Soy Clawbot, un agente verificado en Billions Network.\n\n` +
      `🤖 Mi DID: did:iden3:billions:main:2VmAkXrihYaLF1n9oFxpXUgQVUV2nSiTZ9ScDdbBrw\n` +
      `💰 Estoy ganando $BILL en el programa FAIAR\n` +
      `🔧 Servicio IA activo: ${activeService}\n\n` +
      `Comandos disponibles:\n` +
      `/status - Ver mi estado\n` +
      `/help - Ver comandos\n` +
      `/ask <texto> - Preguntar con IA\n` +
      `/openrouter <texto> - Usar OpenRouter\n` +
      `/gemini <texto> - Usar Gemini\n` +
      `/ollama <texto> - Usar Ollama\n` +
      `/claude <texto> - Usar Claude\n`
    );
    return;
  }

  if (finalText === '/status') {
    const active = getActiveService() || 'ninguno';
    await sendMessage(chatId,
      `✅ Estado: Activo y verificado\n` +
      `🔧 Servicio IA activo: ${active}\n` +
      `🔗 Ver en: https://8004scan.io/agents\n` +
      `💰 Ganando recompensas automáticamente\n`
    );
    return;
  }

  if (text === '/help') {
    await sendMessage(chatId,
      `Soy Clawbot, tu agente de IA.\n` +
      `Usa estos comandos:\n` +
      `/ask <texto> - Respuesta con la IA activa\n` +
      `/openrouter <texto> - Fuerza OpenRouter\n` +
      `/gemini <texto> - Fuerza Gemini\n` +
      `/ollama <texto> - Fuerza Ollama\n` +
      `/claude <texto> - Fuerza Claude\n` +
      `/status - Ver servicios configurados\n`
    );
    return;
  }

  const parts = finalText.split(' ');
  const command = parts[0].toLowerCase();
  const commandText = parts.slice(1).join(' ').trim();

  if (command === '/openrouter') {
    if (!hasOpenRouter()) {
      await sendMessage(chatId, '❌ OpenRouter no está configurado o la API key no es válida. Actualiza OPENROUTER_API_KEY en .env.');
      return;
    }
    if (!commandText) {
      await sendMessage(chatId, '❌ Usa: /openrouter <tu pregunta>');
      return;
    }
    await processAiCommand(chatId, 'openrouter', commandText);
    return;
  }

  if (command === '/gemini') {
    if (!hasGemini()) {
      await sendMessage(chatId, '❌ Gemini no está configurado o la API key no es válida. Actualiza GOOGLE_API_KEY en .env.');
      return;
    }
    if (!commandText) {
      await sendMessage(chatId, '❌ Usa: /gemini <tu pregunta>');
      return;
    }
    await processAiCommand(chatId, 'gemini', commandText);
    return;
  }

  if (command === '/ollama') {
    if (!hasOllama()) {
      await sendMessage(chatId, '❌ Ollama no está configurado. Actualiza OLLAMA_MODEL en .env y asegúrate de tener el servidor Ollama ejecutándose.');
      return;
    }
    if (!commandText) {
      await sendMessage(chatId, '❌ Usa: /ollama <tu pregunta>');
      return;
    }
    await processAiCommand(chatId, 'ollama', commandText);
    return;
  }

  if (command === '/claude') {
    if (!hasClaude()) {
      await sendMessage(chatId, '❌ Claude no está configurado. Actualiza ANTHROPIC_API_KEY en .env.');
      return;
    }
    if (!commandText) {
      await sendMessage(chatId, '❌ Usa: /claude <tu pregunta>');
      return;
    }
    await processAiCommand(chatId, 'claude', commandText);
    return;
  }

  if (command === '/ask') {
    if (!commandText) {
      await sendMessage(chatId, '❌ Usa: /ask <tu pregunta>');
      return;
    }
    const active = getActiveService();
    if (!active) {
      await sendMessage(chatId, '❌ No hay servicio de IA configurado. Configura Gemini, Ollama o Claude en .env.');
      return;
    }
    await processAiCommand(chatId, active, commandText);
    return;
  }

  // Mensaje libre: si hay IA configurada, usarla
  const active = getActiveService();
  if (active) {
    await processAiCommand(chatId, active, text);
    return;
  }

  await sendMessage(chatId,
    `Hola ${user}! Recibí tu mensaje: "${text}"\n\n` +
    `No tengo un servicio de IA activo. Usa /help para ver los comandos.`
  );
}

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

    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

main().catch(console.error);
