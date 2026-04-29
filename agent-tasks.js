#!/usr/bin/env node

// Script avanzado: Tu agente hace tareas automatizadas
// Ejemplos:
// node agent-tasks.js create-file "mi-archivo.txt" "Contenido del archivo"
// node agent-tasks.js run-command "ls -la"
// node agent-tasks.js analyze-code "agent.js"

import { askClaude, askGemini, askOllama } from './agent.js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

console.log('🤖 CLAWBOT - Modo Automatización');
console.log('=====================================');

async function executeTask() {
  try {
    switch (command) {
      case 'create-file':
        if (!arg1 || !arg2) {
          console.log('❌ Uso: node agent-tasks.js create-file "nombre-archivo" "contenido"');
          return;
        }
        console.log(`📄 Creando archivo: ${arg1}`);
        fs.writeFileSync(arg1, arg2);
        console.log('✅ Archivo creado exitosamente!');
        break;

      case 'read-file':
        if (!arg1) {
          console.log('❌ Uso: node agent-tasks.js read-file "nombre-archivo"');
          return;
        }
        if (!fs.existsSync(arg1)) {
          console.log('❌ Archivo no existe');
          return;
        }
        const content = fs.readFileSync(arg1, 'utf-8');
        console.log(`📖 Contenido de ${arg1}:`);
        console.log('=====================================');
        console.log(content);
        break;

      case 'run-command':
        if (!arg1) {
          console.log('❌ Uso: node agent-tasks.js run-command "comando bash"');
          return;
        }
        console.log(`⚡ Ejecutando: ${arg1}`);
        const result = execSync(arg1, { encoding: 'utf-8' });
        console.log('✅ Resultado:');
        console.log(result);
        break;

      case 'analyze-code':
        if (!arg1) {
          console.log('❌ Uso: node agent-tasks.js analyze-code "archivo.js"');
          return;
        }
        if (!fs.existsSync(arg1)) {
          console.log('❌ Archivo no existe');
          return;
        }
        const code = fs.readFileSync(arg1, 'utf-8');
        const analysisPrompt = `Analiza este código JavaScript y dime:
1. ¿Qué hace?
2. ¿Cómo se puede mejorar?
3. ¿Hay errores potenciales?

Código:
${code}`;

        console.log(`🔍 Analizando código: ${arg1}`);
        const analysis = await getAIResponse(analysisPrompt);
        console.log('📊 Análisis:');
        console.log('=====================================');
        console.log(analysis);
        break;

      case 'generate-code':
        if (!arg1) {
          console.log('❌ Uso: node agent-tasks.js generate-code "describe qué código necesitas"');
          return;
        }
        const codePrompt = `Genera código JavaScript para: ${arg1}
Incluye comentarios explicativos y manejo de errores.`;

        console.log(`💻 Generando código para: ${arg1}`);
        const generatedCode = await getAIResponse(codePrompt);
        console.log('📝 Código generado:');
        console.log('=====================================');
        console.log(generatedCode);
        break;

      case 'translate':
        if (!arg1 || !arg2) {
          console.log('❌ Uso: node agent-tasks.js translate "idioma-destino" "texto a traducir"');
          return;
        }
        const translatePrompt = `Traduce este texto al ${arg1}: "${arg2}"
Mantén el significado original y usa un lenguaje natural.`;

        console.log(`🌐 Traduciendo a ${arg1}: "${arg2}"`);
        const translation = await getAIResponse(translatePrompt);
        console.log('📝 Traducción:');
        console.log('=====================================');
        console.log(translation);
        break;

      case 'help':
      default:
        console.log('📋 TAREAS DISPONIBLES:');
        console.log('');
        console.log('📄 Gestión de archivos:');
        console.log('   create-file "archivo.txt" "contenido"    - Crear archivo');
        console.log('   read-file "archivo.txt"                  - Leer archivo');
        console.log('');
        console.log('⚡ Sistema:');
        console.log('   run-command "ls -la"                     - Ejecutar comando');
        console.log('');
        console.log('💻 Programación:');
        console.log('   analyze-code "archivo.js"                 - Analizar código');
        console.log('   generate-code "crea una función..."       - Generar código');
        console.log('');
        console.log('🌐 Utilidades:');
        console.log('   translate "español" "hello world"         - Traducir texto');
        console.log('');
        console.log('📊 Información:');
        console.log('   help                                      - Mostrar esta ayuda');
        break;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function getAIResponse(prompt) {
  // Intentar Gemini primero (gratis)
  if (process.env.GOOGLE_API_KEY &&
      !process.env.GOOGLE_API_KEY.includes('your_google_api_key') &&
      !process.env.GOOGLE_API_KEY.includes('example')) {
    return await askGemini(prompt);
  }
  // Ollama local
  else if (process.env.OLLAMA_MODEL && process.env.OLLAMA_MODEL !== 'llama2') {
    return await askOllama(prompt);
  }
  // Claude (pago)
  else if (process.env.ANTHROPIC_API_KEY &&
           !process.env.ANTHROPIC_API_KEY.includes('your_api_key')) {
    return await askClaude(prompt);
  }
  else {
    throw new Error('Configura un servicio de IA primero (Gemini gratis recomendado)');
  }
}

executeTask();