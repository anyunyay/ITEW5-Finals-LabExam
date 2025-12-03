// Script to generate PNG icons from SVG files
// Run: node generate-icons.js
// Requires: npm install sharp

const fs = require('fs');
const path = require('path');

async function generateIcons() {
  try {
    const sharp = require('sharp');
    
    const icons = [
      { input: 'icon-192x192.svg', output: 'icon-192x192.png', size: 192 },
      { input: 'icon-512x512.svg', output: 'icon-512x512.png', size: 512 }
    ];
    
    for (const icon of icons) {
      const inputPath = path.join(__dirname, icon.input);
      const outputPath = path.join(__dirname, icon.output);
      
      await sharp(inputPath)
        .resize(icon.size, icon.size)
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${icon.output}`);
    }
    
    console.log('\n✓ All icons generated successfully!');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('Error: sharp module not found.');
      console.error('Please install it by running: npm install sharp');
    } else {
      console.error('Error generating icons:', error.message);
    }
    process.exit(1);
  }
}

generateIcons();
