#!/usr/bin/env node

import { askClaude, askGemini, askOllama, askOpenRouter } from './agent.js';
import dotenv from 'dotenv';

dotenv.config();

const question = process.argv[2] || "Hello! Can you tell me about yourself as an AI agent?";

console.log(`\n🧪 TESTING ALL AI INTEGRATIONS`);
console.log(`========================================`);
console.log(`🤖 Question: "${question}"\n`);

async function testAI() {
  let testedCount = 0;
  let successCount = 0;

  // Test Claude (if configured)
  console.log('🟣 Testing Claude (Anthropic - Paid):');
  if (process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('your_api_key')) {
    testedCount++;
    try {
      console.log('   🔄 Calling Claude API...');
      const response = await askClaude(question);
      console.log(`   ✅ SUCCESS: ${response?.substring(0, 150)}...`);
      successCount++;
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
    }
  } else {
    console.log('   ⚠️ SKIPPED: ANTHROPIC_API_KEY not configured');
  }
  console.log('');

  // Test Gemini (if configured)
  console.log('🔵 Testing Gemini (Google - FREE):');
  if (process.env.GOOGLE_API_KEY && !process.env.GOOGLE_API_KEY.includes('your_google_api_key')) {
    testedCount++;
    try {
      console.log('   🔄 Calling Gemini API...');
      const response = await askGemini(question);
      console.log(`   ✅ SUCCESS: ${response?.substring(0, 150)}...`);
      successCount++;
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
    }
  } else {
    console.log('   ⚠️ SKIPPED: GOOGLE_API_KEY not configured');
  }
  console.log('');

  // Test OpenRouter (if configured)
  console.log('🟠 Testing OpenRouter (Paid):');
  if (process.env.OPENROUTER_API_KEY && !process.env.OPENROUTER_API_KEY.includes('YOUR_OPENROUTER_API_KEY_HERE')) {
    testedCount++;
    try {
      console.log('   🔄 Calling OpenRouter API...');
      const response = await askOpenRouter(question);
      console.log(`   ✅ SUCCESS: ${response?.substring(0, 150)}...`);
      successCount++;
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
    }
  } else {
    console.log('   ⚠️ SKIPPED: OPENROUTER_API_KEY not configured');
  }
  console.log('');

  // Test Ollama (if configured)
  console.log('🟢 Testing Ollama (Local - FREE):');
  if (process.env.OLLAMA_MODEL && process.env.OLLAMA_MODEL !== 'llama2') {
    testedCount++;
    try {
      console.log('   🔄 Calling Ollama local model...');
      const response = await askOllama(question);
      console.log(`   ✅ SUCCESS: ${response?.substring(0, 150)}...`);
      successCount++;
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
    }
  } else {
    console.log('   ⚠️ SKIPPED: OLLAMA_MODEL not properly configured');
  }
  console.log('');

  // Summary
  console.log(`========================================`);
  console.log(`📊 TEST RESULTS:`);
  console.log(`   Tested: ${testedCount} AI services`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed: ${testedCount - successCount}`);

  if (testedCount === 0) {
    console.log(`\n⚠️ No AI services configured!`);
    console.log(`\n📌 To configure FREE options:`);
    console.log(`   1. Gemini: https://makersuite.google.com/app/apikey`);
    console.log(`   2. Ollama: Run ./install-ollama.sh`);
    console.log(`   3. Claude: https://console.anthropic.com/ (paid)`);
  } else if (successCount > 0) {
    console.log(`\n🎉 Your agent is ready to use AI!`);
  }

  console.log(`========================================\n`);
}

testAI().catch(console.error);