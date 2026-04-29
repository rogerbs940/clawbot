#!/usr/bin/env node

// Test script for Gemini AI integration
// Usage: node test-gemini.js

import { askGemini } from './agent.js';

async function testGemini() {
  console.log('🧪 Testing Gemini AI Integration...\n');

  try {
    const response = await askGemini('Hola Gemini, ¿puedes presentarte en español?');
    console.log('✅ Gemini Response:');
    console.log(response);
    console.log('\n🎉 Gemini integration working correctly!');
  } catch (error) {
    console.log('❌ Error testing Gemini:');
    console.log(error.message);

    if (error.message.includes('GOOGLE_API_KEY')) {
      console.log('\n💡 Solution: Configure your real Google API key in .env file');
      console.log('   Get it from: https://makersuite.google.com/app/apikey');
    }
  }
}

testGemini();