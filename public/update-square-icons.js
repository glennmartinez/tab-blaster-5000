#!/usr/bin/env node

/**
 * Icon Converter Script - Square design with maximized BookmarkCheck
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertFaviconToPng(pngPath, size) {
  try {
    console.log(`Converting favicon.svg to ${pngPath} (${size}x${size})`);
    
    const svgContent = fs.readFileSync('favicon.svg');
    await sharp(svgContent)
      .resize(size, size)
      .png()
      .toFile(pngPath);
      
    console.log(`✅ Created ${pngPath}`);
  } catch (error) {
    console.error(`❌ Error converting to ${pngPath}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Converting square favicon.svg to PNG icons...\n');
  
  // Convert favicon to all icon sizes
  await convertFaviconToPng('icons/icon16.png', 16);
  await convertFaviconToPng('icons/icon48.png', 48);
  await convertFaviconToPng('icons/icon128.png', 128);
  
  console.log('\n🎉 Square icon conversion complete!');
  console.log('Icons now have square format with maximized BookmarkCheck design.');
}

main().catch(console.error);
