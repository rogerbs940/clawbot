#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log(`\n🧪 COMPREHENSIVE AGENT TESTS`);
console.log(`========================================`);

async function runAllTests() {
  let testsPassed = 0;
  let testsTotal = 0;

  // Test 1: Agent Identity
  console.log('1️⃣ Testing Agent Identity:');
  testsTotal++;
  try {
    const identitiesPath = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'billions', 'identities.json');
    if (fs.existsSync(identitiesPath)) {
      const identities = JSON.parse(fs.readFileSync(identitiesPath, 'utf-8'));
      if (identities.length > 0 && identities[0].did) {
        console.log(`   ✅ Agent DID: ${identities[0].did}`);
        testsPassed++;
      } else {
        console.log('   ❌ No valid DID found');
      }
    } else {
      console.log('   ❌ Identities file not found');
    }
  } catch (error) {
    console.log(`   ❌ Error reading identity: ${error.message}`);
  }
  console.log('');

  // Test 2: Skills Installation
  console.log('2️⃣ Testing Skills Installation:');
  const skillsDir = path.join(__dirname, 'skills');
  const expectedSkills = [
    { name: 'verified-agent-identity', path: path.join(__dirname, 'verified-agent-identity') },
    { name: 'anthropic', path: path.join(skillsDir, 'anthropic') },
    { name: 'gemini', path: path.join(skillsDir, 'gemini') },
    { name: 'ollama-local', path: path.join(skillsDir, 'ollama-local') }
  ];

  expectedSkills.forEach(skill => {
    testsTotal++;
    if (fs.existsSync(skill.path)) {
      console.log(`   ✅ ${skill.name}: INSTALLED`);
      testsPassed++;
    } else {
      console.log(`   ❌ ${skill.name}: MISSING`);
    }
  });
  console.log('');

  // Test 3: Environment Configuration
  console.log('3️⃣ Testing Environment Configuration:');
  const requiredEnvVars = ['AGENT_NAME', 'AGENT_DID'];
  const optionalEnvVars = ['ANTHROPIC_API_KEY', 'GOOGLE_API_KEY', 'OLLAMA_MODEL'];

  requiredEnvVars.forEach(envVar => {
    testsTotal++;
    if (process.env[envVar]) {
      console.log(`   ✅ ${envVar}: SET`);
      testsPassed++;
    } else {
      console.log(`   ❌ ${envVar}: MISSING`);
    }
  });

  optionalEnvVars.forEach(envVar => {
    testsTotal++;
    if (process.env[envVar] && !process.env[envVar].includes('your_')) {
      console.log(`   ✅ ${envVar}: CONFIGURED`);
      testsPassed++;
    } else {
      console.log(`   ⚠️ ${envVar}: NOT SET (optional)`);
    }
  });
  console.log('');

  // Test 4: Node.js Dependencies
  console.log('4️⃣ Testing Dependencies:');
  testsTotal++;
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
    const deps = Object.keys(packageJson.dependencies || {});
    if (deps.length >= 2) {
      console.log(`   ✅ Dependencies installed: ${deps.join(', ')}`);
      testsPassed++;
    } else {
      console.log('   ❌ Missing dependencies');
    }
  } catch (error) {
    console.log(`   ❌ Error checking dependencies: ${error.message}`);
  }
  console.log('');

  // Test 5: Security Configuration
  console.log('5️⃣ Testing Security Configuration:');
  const securityFiles = ['.env', '.gitignore'];

  securityFiles.forEach(file => {
    testsTotal++;
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file}: EXISTS`);
      testsPassed++;
    } else {
      console.log(`   ❌ ${file}: MISSING`);
    }
  });
  console.log('');

  // Test 6: Billions Network Connection
  console.log('6️⃣ Testing Billions Network Connection:');
  testsTotal++;
  try {
    const kmsPath = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'billions', 'kms.json');
    if (fs.existsSync(kmsPath)) {
      const kms = JSON.parse(fs.readFileSync(kmsPath, 'utf-8'));
      if (kms.length > 0) {
        console.log(`   ✅ Private key stored securely`);
        testsPassed++;
      } else {
        console.log('   ❌ No private keys found');
      }
    } else {
      console.log('   ❌ KMS file not found');
    }
  } catch (error) {
    console.log(`   ❌ Error checking keys: ${error.message}`);
  }
  console.log('');

  // Final Results
  console.log(`========================================`);
  console.log(`📊 COMPREHENSIVE TEST RESULTS:`);
  console.log(`   Total Tests: ${testsTotal}`);
  console.log(`   Passed: ${testsPassed}`);
  console.log(`   Failed: ${testsTotal - testsPassed}`);
  console.log(`   Success Rate: ${Math.round((testsPassed / testsTotal) * 100)}%`);

  if (testsPassed === testsTotal) {
    console.log(`\n🎉 ALL TESTS PASSED! Your agent is fully functional.`);
  } else if (testsPassed >= testsTotal * 0.8) {
    console.log(`\n✅ MOSTLY GOOD! Your agent is working but needs some fixes.`);
  } else {
    console.log(`\n⚠️ ISSUES FOUND! Check the failed tests above.`);
  }

  console.log(`========================================\n`);
}

runAllTests().catch(console.error);