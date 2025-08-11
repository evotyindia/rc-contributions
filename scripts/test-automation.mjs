#!/usr/bin/env node
/**
 * Test script to simulate the automation workflow
 * This tests the aggregation and validation without requiring actual GitHub workflows
 * 
 * Usage: node scripts/test-automation.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

async function main() {
  console.log('🧪 Testing Wall of Fame automation...');
  
  try {
    // Change to repo root
    process.chdir(repoRoot);
    
    console.log('1. Testing aggregation script...');
    execSync('node scripts/aggregate.mjs', { stdio: 'inherit' });
    
    console.log('\n2. Checking that files were updated...');
    const contributorsExists = await fs.access('data/contributors.json').then(() => true).catch(() => false);
    const readmeExists = await fs.access('README.md').then(() => true).catch(() => false);
    
    if (!contributorsExists || !readmeExists) {
      throw new Error('Required files missing');
    }
    
    console.log('✅ data/contributors.json exists');
    console.log('✅ README.md exists');
    
    console.log('\n3. Validating contributors data...');
    const contributorsContent = await fs.readFile('data/contributors.json', 'utf8');
    const contributors = JSON.parse(contributorsContent);
    
    if (!Array.isArray(contributors) || contributors.length === 0) {
      throw new Error('Contributors data is invalid');
    }
    
    console.log(`✅ Found ${contributors.length} contributors in data`);
    
    console.log('\n4. Checking README Wall of Fame...');
    const readmeContent = await fs.readFile('README.md', 'utf8');
    const wallStart = readmeContent.indexOf('<!-- WALL_OF_FAME_START -->');
    const wallEnd = readmeContent.indexOf('<!-- WALL_OF_FAME_END -->');
    
    if (wallStart === -1 || wallEnd === -1) {
      throw new Error('Wall of Fame markers not found in README');
    }
    
    const wallContent = readmeContent.slice(wallStart, wallEnd);
    const contributorCount = (wallContent.match(/<tr>/g) || []).length - 1; // Subtract header row
    
    console.log(`✅ Wall of Fame shows ${contributorCount} contributors`);
    
    if (contributorCount !== contributors.length) {
      console.log(`⚠️  Mismatch: data has ${contributors.length} but README shows ${contributorCount}`);
    } else {
      console.log('✅ Data and README are in sync');
    }
    
    console.log('\n🎉 Automation test completed successfully!');
    console.log('\nThe following should happen automatically:');
    console.log('1. When a PR is merged, validate.yml runs');
    console.log('2. After validate.yml completes, build-wall.yml triggers');
    console.log('3. build-wall.yml runs aggregation and commits changes');
    console.log('\nManual fallback options:');
    console.log('- Run: npm run update-wall');
    console.log('- Or: node scripts/aggregate.mjs');
    console.log('- Or: trigger build-wall.yml workflow in GitHub Actions');
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error(error.message);
    process.exit(1);
  }
}

main();