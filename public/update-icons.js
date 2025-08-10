#!/usr/bin/env node

/**
 * Icon Converter Script - Updated with larger BookmarkCheck design
 * Converts the updated favicon SVG to PNG icons for the Chrome extension
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
  console.log('🚀 Converting updated favicon.svg to PNG icons for Chrome extension...\n');
  
  // Ensure icons directory exists
  const iconsDir = path.join(__dirname, 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
    console.log('📁 Created icons directory');
  }
  
  // Convert favicon to all icon sizes
  await convertFaviconToPng('icons/icon16.png', 16);
  await convertFaviconToPng('icons/icon48.png', 48);
  await convertFaviconToPng('icons/icon128.png', 128);
  
  console.log('\n🎉 Icon conversion complete!');
  console.log('Chrome extension icons now match the updated favicon design with larger BookmarkCheck icon.');
}

// Check if sharp is available and run
try {
  await import('sharp');
  main().catch(console.error);
} catch (error) {
  console.error('❌ Sharp is not installed. Please run:');
  console.error('npm install sharp');
}
