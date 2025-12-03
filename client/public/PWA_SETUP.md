# PWA Setup Documentation

## Overview

The Sports Task Manager is configured as a Progressive Web App (PWA) with the following features:

- **Installable**: Users can install the app on their devices
- **Offline-ready**: Service Worker caching (to be implemented in task 20)
- **App-like experience**: Standalone display mode
- **Sports-themed**: Custom icons and branding

## Files Created

### 1. Manifest File (`/manifest.json`)

The web app manifest defines how the app appears when installed:

- **Name**: "Sports Task Manager"
- **Short Name**: "SportsTasks"
- **Display Mode**: Standalone (full-screen, app-like)
- **Theme Color**: #0066CC (Sports Blue)
- **Background Color**: #0066CC
- **Start URL**: / (root)
- **Icons**: 192x192 and 512x512 PNG icons

### 2. Icons (`/icons/`)

PWA icons in multiple formats:

- `icon-192x192.svg` - SVG source for 192x192 icon
- `icon-512x512.svg` - SVG source for 512x512 icon
- `icon-192x192.png` - Required PWA icon (192x192)
- `icon-512x512.png` - Required PWA icon (512x512)
- `favicon.svg` - Browser favicon

**Icon Design**: Features a gold trophy with checkmark on sports blue background, representing task completion and achievement.

### 3. HTML Updates (`/index.html`)

Added PWA-related meta tags:

```html
<!-- PWA Configuration -->
<meta name="theme-color" content="#0066CC" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="SportsTasks" />
<link rel="manifest" href="/manifest.json" />

<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />

<!-- Apple Touch Icons -->
<link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
```

## Generating PNG Icons

The PNG icons need to be generated from the SVG sources. Choose one method:

### Method 1: Browser-Based (Easiest)

1. Open `client/public/icons/generate-icons.html` in a browser
2. Click "Generate Icons"
3. Download both PNG files
4. Place them in `client/public/icons/`

### Method 2: Command Line (ImageMagick)

```bash
cd client/public/icons
magick convert -background none -resize 192x192 icon-192x192.svg icon-192x192.png
magick convert -background none -resize 512x512 icon-512x512.svg icon-512x512.png
```

### Method 3: Node.js Script

```bash
cd client/public/icons
npm install sharp
node generate-icons.js
```

### Method 4: Online Converter

1. Visit https://cloudconvert.com/svg-to-png
2. Upload SVG files
3. Convert at specified dimensions
4. Download and save to `client/public/icons/`

## Testing PWA Installation

### Desktop (Chrome/Edge)

1. Start the development server: `npm run dev`
2. Open http://localhost:3000
3. Look for the install icon in the address bar
4. Click to install the PWA

### Mobile (Chrome/Safari)

1. Access the app on your mobile device
2. Tap the browser menu
3. Select "Add to Home Screen" or "Install App"
4. The app will appear on your home screen

## PWA Requirements Checklist

- [x] Web app manifest created
- [x] Manifest linked in HTML
- [x] Theme color configured
- [x] App icons created (SVG sources)
- [ ] PNG icons generated (manual step)
- [x] Favicon added
- [x] Apple touch icons configured
- [ ] Service Worker implemented (Task 20)
- [ ] HTTPS in production (deployment requirement)

## Next Steps

1. **Generate PNG Icons**: Use one of the methods above to create the PNG files
2. **Implement Service Worker**: Task 20 will add offline capabilities
3. **Test Installation**: Verify the app can be installed on various devices
4. **Deploy with HTTPS**: PWAs require HTTPS in production

## Browser Support

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (iOS 11.3+)
- ✅ Firefox (Desktop & Mobile)
- ✅ Samsung Internet
- ⚠️ Safari (macOS) - Limited PWA support

## Resources

- [MDN: Web App Manifests](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [web.dev: PWA Checklist](https://web.dev/pwa-checklist/)
- [PWA Builder](https://www.pwabuilder.com/)
