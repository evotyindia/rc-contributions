#!/usr/bin/env node
/**
 * Manual script to update the Wall of Fame
 * This script can be run manually to update both contributors.json and README.md
 * 
 * Usage: node scripts/update-wall.mjs
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

async function main() {
  console.log('🔄 Updating Wall of Fame...');
  
  try {
    // Change to repo root and run aggregation
    process.chdir(repoRoot);
    execSync('node scripts/aggregate.mjs', { stdio: 'inherit' });
    
    console.log('✅ Wall of Fame updated successfully!');
    console.log('📄 Files updated: data/contributors.json and README.md');
    console.log('💡 You can now commit and push these changes manually:');
    console.log('   git add data/contributors.json README.md');
    console.log('   git commit -m "chore: update Wall of Fame"');
    console.log('   git push');
  } catch (error) {
    console.error('❌ Failed to update Wall of Fame:');
    console.error(error.message);
    process.exit(1);
  }
}

main();