# PWA Icons

This directory contains the icons for the Sports Task Manager PWA.

## Current Icons

- `icon-192x192.svg` - SVG version of the 192x192 icon
- `icon-512x512.svg` - SVG version of the 512x512 icon

## Generating PNG Icons

To generate PNG icons from the SVG files, you can use one of these methods:

### Method 1: Using ImageMagick (Command Line)
```bash
magick convert -background none -resize 192x192 icon-192x192.svg icon-192x192.png
magick convert -background none -resize 512x512 icon-512x512.svg icon-512x512.png
```

### Method 2: Using Online Tools
1. Visit https://cloudconvert.com/svg-to-png
2. Upload the SVG files
3. Convert to PNG at the specified dimensions
4. Download and place in this directory

### Method 3: Using Node.js (sharp library)
```bash
npm install sharp
node generate-icons.js
```

## Icon Design

The icons feature:
- Sports blue background (#0066CC)
- Gold trophy with checkmark (task completion)
- Victory green stars (achievement)
- Bold, athletic styling

The design represents task management through sports metaphors - winning, achievement, and completion.
