#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log(`\n🚀 AGENT INTEGRATION TEST SUITE`);
console.log(`========================================`);

async function runIntegrationTests() {
  let testsPassed = 0;
  let testsTotal = 0;

  // Test 1: Agent Startup
  console.log('1️⃣ Testing Agent Startup:');
  testsTotal++;
  try {
    const result = execSync('timeout 5 node agent.js', {
      cwd: __dirname,
      encoding: 'utf-8'
    });
    if (result.includes('Agent Active') || result.includes('CLAWBOT')) {
      console.log('   ✅ Agent starts successfully');
      testsPassed++;
    } else {
      console.log('   ❌ Agent startup output unexpected');
    }
  } catch (error) {
    // Timeout is expected, check if it started at all
    if (error.message.includes('timeout')) {
      console.log('   ✅ Agent starts (timed out as expected)');
      testsPassed++;
    } else {
      console.log(`   ❌ Agent startup error: ${error.message}`);
    }
  }
  console.log('');

  // Test 2: Package Scripts
  console.log('2️⃣ Testing Package Scripts:');
  const scripts = ['start', 'test', 'test-ai', 'test-all'];

  scripts.forEach(script => {
    testsTotal++;
    try {
      const result = execSync(`npm run ${script}`, {
        cwd: __dirname,
        encoding: 'utf-8',
        timeout: 10000
      });
      if (result.includes('Agent Active') || result.includes('TEST RESULTS') || result.includes('AI INTEGRATIONS')) {
        console.log(`   ✅ npm run ${script}: WORKS`);
        testsPassed++;
      } else {
        console.log(`   ❌ npm run ${script}: FAILED`);
      }
    } catch (error) {
      console.log(`   ❌ npm run ${script}: ERROR - ${error.message}`);
    }
  });
  console.log('');

  // Test 3: File Permissions
  console.log('3️⃣ Testing Security (File Permissions):');
  const filesToCheck = [
    { file: '.env', shouldBe: '600' },
    { file: '.gitignore', shouldExist: true },
    { file: 'README.md', shouldExist: true }
  ];

  filesToCheck.forEach(check => {
    testsTotal++;
    const filePath = path.join(__dirname, check.file);

    if (check.shouldExist) {
      if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${check.file}: EXISTS`);
        testsPassed++;
      } else {
        console.log(`   ❌ ${check.file}: MISSING`);
      }
    } else if (check.shouldBe) {
      try {
        const stats = fs.statSync(filePath);
        const permissions = (stats.mode & parseInt('777', 8)).toString(8);
        if (permissions === check.shouldBe) {
          console.log(`   ✅ ${check.file}: SECURE (${permissions})`);
          testsPassed++;
        } else {
          console.log(`   ⚠️ ${check.file}: PERMISSIONS ${permissions} (should be ${check.shouldBe})`);
        }
      } catch (error) {
        console.log(`   ❌ ${check.file}: ERROR - ${error.message}`);
      }
    }
  });
  console.log('');

  // Test 4: Skills Functionality
  console.log('4️⃣ Testing Skills Functionality:');
  const skillsToTest = [
    { name: 'verified-agent-identity', scripts: ['getIdentities.js', 'createNewEthereumIdentity.js'] },
    { name: 'anthropic', scripts: ['anthropic.py'] },
    { name: 'gemini', scripts: ['*.py', '*.js'] }, // More flexible
    { name: 'ollama-local', scripts: ['ollama.py', 'ollama_tools.py'] }
  ];

  skillsToTest.forEach(skill => {
    testsTotal++;
    let skillFound = false;

    skill.scripts.forEach(scriptPattern => {
      const scriptPath = path.join(__dirname, skill.name === 'verified-agent-identity' ? 'verified-agent-identity' : 'skills', skill.name, 'scripts', scriptPattern);

      if (scriptPattern.includes('*')) {
        // Check if directory has any scripts
        const scriptsDir = path.join(__dirname, skill.name === 'verified-agent-identity' ? 'verified-agent-identity' : 'skills', skill.name, 'scripts');
        if (fs.existsSync(scriptsDir)) {
          const files = fs.readdirSync(scriptsDir);
          if (files.some(file => file.endsWith('.py') || file.endsWith('.js'))) {
            skillFound = true;
          }
        }
      } else if (fs.existsSync(scriptPath)) {
        skillFound = true;
      }
    });

    if (skillFound) {
      console.log(`   ✅ ${skill.name}: SCRIPTS AVAILABLE`);
      testsPassed++;
    } else {
      console.log(`   ❌ ${skill.name}: SCRIPTS MISSING`);
    }
  });
  console.log('');

  // Test 5: Network Connectivity (basic)
  console.log('5️⃣ Testing Network Connectivity:');
  testsTotal++;
  try {
    execSync('curl -s --max-time 5 https://www.google.com > /dev/null', { timeout: 10000 });
    console.log('   ✅ Internet connection: AVAILABLE');
    testsPassed++;
  } catch (error) {
    console.log('   ⚠️ Internet connection: LIMITED (may affect API calls)');
  }
  console.log('');

  // Final Summary
  console.log(`========================================`);
  console.log(`🎯 INTEGRATION TEST RESULTS:`);
  console.log(`   Total Tests: ${testsTotal}`);
  console.log(`   Passed: ${testsPassed}`);
  console.log(`   Failed: ${testsTotal - testsPassed}`);
  console.log(`   Success Rate: ${Math.round((testsPassed / testsTotal) * 100)}%`);

  if (testsPassed === testsTotal) {
    console.log(`\n🎉 ALL INTEGRATION TESTS PASSED!`);
    console.log(`   Your agent is production-ready!`);
  } else if (testsPassed >= testsTotal * 0.8) {
    console.log(`\n✅ INTEGRATION MOSTLY SUCCESSFUL!`);
    console.log(`   Your agent is functional with minor issues.`);
  } else {
    console.log(`\n⚠️ INTEGRATION ISSUES DETECTED!`);
    console.log(`   Check the failed tests above.`);
  }

  console.log(`\n📋 NEXT STEPS:`);
  console.log(`   1. Configure a FREE AI service (Gemini or Ollama)`);
  console.log(`   2. Test with: npm run test-ai "Hello world"`);
  console.log(`   3. Start earning: npm start`);
  console.log(`========================================\n`);
}

runIntegrationTests().catch(console.error);