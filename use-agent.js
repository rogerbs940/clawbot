#!/usr/bin/env node

// Script personalizado para usar tu agente Clawbot
// Ejemplos de uso: node use-agent.js "traduce al español: hello world"

import { askClaude, askGemini, askOllama, askOpenRouter } from './agent.js';
import dotenv from 'dotenv';

dotenv.config();

const task = process.argv[2];

if (!task) {
  console.log('🤖 CLAWBOT - Tu Asistente Personal');
  console.log('=====================================');
  console.log('');
  console.log('📝 EJEMPLOS DE USO:');
  console.log('');
  console.log('💬 Conversar:');
  console.log('   node use-agent.js "Hola, ¿cómo estás?"');
  console.log('');
  console.log('📚 Aprender:');
  console.log('   node use-agent.js "Explica qué es machine learning en términos simples"');
  console.log('');
  console.log('💻 Programar:');
  console.log('   node use-agent.js "Crea un script de Node.js que lea un archivo JSON"');
  console.log('');
  console.log('🔍 Investigar:');
  console.log('   node use-agent.js "Dame ideas para un negocio de e-commerce"');
  console.log('');
  console.log('📝 Escribir:');
  console.log('   node use-agent.js "Escribe un email profesional solicitando una reunión"');
  console.log('');
  console.log('🎨 Crear:');
  console.log('   node use-agent.js "Diseña un plan de marketing para una app móvil"');
  console.log('');
  console.log('⚙️ Automatizar:');
  console.log('   node use-agent.js "Crea un script bash que haga backup de mis archivos"');
  console.log('');
  console.log('=====================================');
  process.exit(0);
}

console.log(`🤖 CLAWBOT procesando: "${task}"`);
console.log('=====================================');

async function useAgent() {
  try {
    let response;
    let aiUsed;

    // Intentar usar OpenRouter primero si está configurado
    if (process.env.OPENROUTER_API_KEY &&
        !/(YOUR_OPENROUTER_API_KEY_HERE|example)/i.test(process.env.OPENROUTER_API_KEY)) {
      try {
        console.log('🔄 Usando OpenRouter AI (Pago)...');
        response = await askOpenRouter(task);
        aiUsed = 'OpenRouter (Pago)';
      } catch (openRouterError) {
        console.log('⚠️ OpenRouter falló, intentando Gemini...');
        if (process.env.GOOGLE_API_KEY &&
            !process.env.GOOGLE_API_KEY.includes('your_google_api_key') &&
            !process.env.GOOGLE_API_KEY.includes('example')) {
          console.log('🔄 Usando Gemini AI (GRATIS)...');
          response = await askGemini(task);
          aiUsed = 'Gemini (Google - Gratis)';
        } else if (process.env.OLLAMA_MODEL && process.env.OLLAMA_MODEL.trim() !== '') {
          console.log('🔄 Usando Ollama Local (GRATIS)...');
          response = await askOllama(task);
          aiUsed = 'Ollama Local (Gratis - Fallback)';
        } else if (process.env.ANTHROPIC_API_KEY &&
                   !process.env.ANTHROPIC_API_KEY.includes('your_api_key')) {
          console.log('🔄 Usando Claude AI (Pago)...');
          response = await askClaude(task);
          aiUsed = 'Claude (Anthropic - Pago)';
        } else {
          throw openRouterError;
        }
      }
    }
    // Intentar usar Gemini si está configurado
    else if (process.env.GOOGLE_API_KEY &&
             !process.env.GOOGLE_API_KEY.includes('your_google_api_key') &&
             !process.env.GOOGLE_API_KEY.includes('example')) {
      try {
        console.log('🔄 Usando Gemini AI (GRATIS)...');
        response = await askGemini(task);
        aiUsed = 'Gemini (Google - Gratis)';
      } catch (geminiError) {
        console.log('⚠️ Gemini falló, intentando Ollama...');
        if (process.env.OLLAMA_MODEL && process.env.OLLAMA_MODEL.trim() !== '') {
          console.log('🔄 Usando Ollama Local (GRATIS)...');
          response = await askOllama(task);
          aiUsed = 'Ollama Local (Gratis - Fallback)';
        } else if (process.env.ANTHROPIC_API_KEY &&
                   !process.env.ANTHROPIC_API_KEY.includes('your_api_key')) {
          console.log('🔄 Usando Claude AI (Pago)...');
          response = await askClaude(task);
          aiUsed = 'Claude (Anthropic - Pago)';
        } else {
          throw geminiError;
        }
      }
    }
    // Si no hay Gemini configurado, usar Ollama
    else if (process.env.OLLAMA_MODEL && process.env.OLLAMA_MODEL.trim() !== '') {
      console.log('🔄 Usando Ollama Local (GRATIS)...');
      response = await askOllama(task);
      aiUsed = 'Ollama Local (Gratis)';
    }
    // Si no, intentar Claude (de pago)
    else if (process.env.ANTHROPIC_API_KEY &&
             !process.env.ANTHROPIC_API_KEY.includes('your_api_key')) {
      console.log('🔄 Usando Claude AI (Pago)...');
      response = await askClaude(task);
      aiUsed = 'Claude (Anthropic - Pago)';
    }
    else {
      throw new Error('Ningún servicio de IA configurado. Configura Gemini u Ollama gratis primero.');
    }

    console.log(`✅ Respuesta de ${aiUsed}:`);
    console.log('=====================================');
    console.log(response);
    console.log('=====================================');

  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('');
    console.log('💡 Soluciones:');
    if (error.message.includes('OPENROUTER_API_KEY')) {
      console.log('   🔑 Configura OpenRouter: https://openrouter.ai');
      console.log('   Actualiza .env: OPENROUTER_API_KEY=tu_clave_real');
      console.log('   Actualiza .env: OPENROUTER_MODEL=gpt-4o-mini');
    }
    if (error.message.includes('GOOGLE_API_KEY')) {
      console.log('   🔑 Configura Gemini gratis: https://makersuite.google.com/app/apikey');
      console.log('   Actualiza .env: GOOGLE_API_KEY=tu_clave_real');
    }
    if (error.message.includes('OLLAMA_MODEL')) {
      console.log('   🏠 Instala Ollama: curl -fsSL https://ollama.ai/install.sh | sh');
      console.log('   Descarga modelo: ollama pull llama3');
      console.log('   Actualiza .env: OLLAMA_MODEL=llama3');
    }
    if (error.message.includes('ANTHROPIC_API_KEY')) {
      console.log('   💎 Configura Claude: https://console.anthropic.com/');
      console.log('   Actualiza .env: ANTHROPIC_API_KEY=tu_clave');
    }
  }
}

useAgent();