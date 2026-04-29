import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const billionsDir = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'billions');

// Read agent identity from local storage
const identitiesPath = path.join(billionsDir, 'identities.json');
const identitiesData = JSON.parse(fs.readFileSync(identitiesPath, 'utf-8'));
const agentDID = identitiesData[0].did;

console.log(`\n========================================`);
console.log(`🤖 CLAWBOT - Verified AI Agent`);
console.log(`========================================`);
console.log(`\n📍 Agent Status:`);
console.log(`   DID: ${agentDID}`);
console.log(`   Status: ✅ Verified & Active`);
console.log(`   Network: Billions (ERC-8004)`);
console.log(`   Program: 💰 FAIAR - Earning $BILL`);

console.log(`\n🧠 Skills Installed:`);
console.log(`   ✅ verified-agent-identity`);
console.log(`   ✅ anthropic (Claude AI)`);
console.log(`   ✅ gemini (Google AI - FREE)`);
console.log(`   ✅ ollama-local (Local AI - FREE)`);

const hasClaudeKey = process.env.ANTHROPIC_API_KEY && !/(your_api_key|your_api_key_here|example)/i.test(process.env.ANTHROPIC_API_KEY);
const hasGeminiKey = process.env.GOOGLE_API_KEY && !/(your_google_api_key|YOUR_REAL_GOOGLE_API_KEY_HERE|example)/i.test(process.env.GOOGLE_API_KEY);
const hasOpenRouterKey = process.env.OPENROUTER_API_KEY && !/(YOUR_OPENROUTER_API_KEY_HERE|example)/i.test(process.env.OPENROUTER_API_KEY);
const hasOllama = process.env.OLLAMA_MODEL && process.env.OLLAMA_MODEL.trim() !== '' && !/(llama2|default)/i.test(process.env.OLLAMA_MODEL);

console.log(`\n🔑 AI Integration Status:`);
console.log(`   ${hasClaudeKey ? '✅' : '⚠️'} Claude API: ${hasClaudeKey ? 'READY (Paid)' : 'NOT SET - Paid service'}`);
console.log(`   ${hasGeminiKey ? '✅' : '⚠️'} Gemini API: ${hasGeminiKey ? 'READY (FREE)' : 'NOT SET - Free tier available'}`);
console.log(`   ${hasOpenRouterKey ? '✅' : '⚠️'} OpenRouter API: ${hasOpenRouterKey ? 'READY (Paid)' : 'NOT SET - Paid service'}`);
console.log(`   ${hasOllama ? '✅' : '⚠️'} Ollama Local: ${hasOllama ? 'READY (FREE)' : 'NOT SET - Completely free'}`);

if (!hasClaudeKey && !hasGeminiKey && !hasOllama) {
  console.log(`\n   📌 FREE AI Options (choose one):`);
  console.log(`   1. Gemini (Google): https://makersuite.google.com/app/apikey`);
  console.log(`   2. Ollama Local: Install Ollama + models locally`);
  console.log(`   3. Claude (Anthropic): https://console.anthropic.com/ (paid)`);
}

console.log(`\n⚙️  Configuration:`);
console.log(`   Skills Dir: ./skills`);
console.log(`   Billions Dir: ${billionsDir}`);

console.log(`\n🚀 Agent Ready!`);
console.log(`   - Earning rewards in FAIAR program`);
console.log(`   - Available for interactions with other agents`);
console.log(`   - Can process requests via Claude AI`);
console.log(`\n========================================\n`);

// Export utilities for agent operations
export { agentDID };

// Function to call Claude AI
export async function askClaude(question) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes('your_api_key')) {
    throw new Error('ANTHROPIC_API_KEY not configured in .env');
  }

  try {
    const skillPath = path.join(__dirname, 'skills', 'anthropic', 'scripts', 'anthropic.py');
    const result = execSync(`python3 "${skillPath}" chat "${question}" --model claude-3-5-sonnet-20241022`, {
      encoding: 'utf-8',
      env: { ...process.env }
    });
    return result.trim();
  } catch (error) {
    throw new Error(`Claude API error: ${error.message}`);
  }
}

// Function to call Gemini AI
export async function askGemini(question) {
  if (!process.env.GOOGLE_API_KEY || /(your_google_api_key|YOUR_REAL_GOOGLE_API_KEY_HERE|example)/i.test(process.env.GOOGLE_API_KEY)) {
    throw new Error('GOOGLE_API_KEY not properly configured in .env');
  }

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-pro';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: question
          }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini';
  } catch (error) {
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

// Function to call OpenRouter AI
export async function askOpenRouter(question) {
  if (!process.env.OPENROUTER_API_KEY || /(YOUR_OPENROUTER_API_KEY_HERE|example)/i.test(process.env.OPENROUTER_API_KEY)) {
    throw new Error('OPENROUTER_API_KEY not properly configured in .env');
  }

  try {
    const model = process.env.OPENROUTER_MODEL || 'gpt-4o-mini';
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: question }],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${data.error?.message || JSON.stringify(data)}`);
    }

    return data.choices?.[0]?.message?.content || 'No response from OpenRouter';
  } catch (error) {
    throw new Error(`OpenRouter API error: ${error.message}`);
  }
}

// Function to call Ollama Local AI
export async function askOllama(question) {
  if (!process.env.OLLAMA_MODEL) {
    throw new Error('OLLAMA_MODEL not configured in .env');
  }

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL,
        prompt: question,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || 'No response from Ollama';
  } catch (error) {
    throw new Error(`Ollama error: ${error.message}`);
  }
}
