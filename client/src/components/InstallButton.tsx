import { useState, useEffect } from 'react';
import './InstallButton.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

const InstallButton = ({ variant = 'primary', size = 'medium', showIcon = true }: InstallButtonProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    console.log('🔍 InstallButton: Checking installation status...');

    // Check if already installed
    const installed = localStorage.getItem('pwa-installed') === 'true';
    console.log('📱 Stored installation status:', installed);
    setIsInstalled(installed);

    if (installed) {
      console.log('✅ App already installed (from localStorage)');
      return;
    }

    // Check if running as standalone (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;

    console.log('🖥️ Display mode check:', {
      isStandalone,
      isIOSStandalone,
      displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
    });

    if (isStandalone || isIOSStandalone) {
      console.log('✅ App running in standalone mode (already installed)');
      localStorage.setItem('pwa-installed', 'true');
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎯 beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      console.log('✅ Install button should now be visible');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    const handleAppInstalled = () => {
      console.log('🎉 PWA was installed successfully!');
      localStorage.setItem('pwa-installed', 'true');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if event already fired (for debugging)
    setTimeout(() => {
      if (!isInstallable && !isInstalled) {
        console.log('⚠️ Install button not showing. Possible reasons:');
        console.log('  1. App already installed');
        console.log('  2. Not running on HTTPS (except localhost)');
        console.log('  3. Service worker not registered');
        console.log('  4. Running in development mode (event may not fire)');
        console.log('  5. Browser doesn\'t support PWA installation');
        console.log('💡 Try building for production: npm run build && npm run preview');
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`User response to the install prompt: ${outcome}`);

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        localStorage.setItem('pwa-installed', 'true');
        setIsInstalled(true);
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  // Check if in development mode
  const isDevelopment = import.meta.env.DEV;

  // Don't show button if already installed (except in development mode)
  if (isInstalled && !isDevelopment) {
    console.log('InstallButton: Hidden - app is installed');
    return null;
  }

  // ALWAYS show button in development mode for testing
  const showButton = isDevelopment || isInstallable;

  console.log('InstallButton render check:', {
    isInstallable,
    isDevelopment,
    isInstalled,
    showButton,
    deferredPrompt: !!deferredPrompt,
    mode: import.meta.env.MODE
  });

  if (!showButton) {
    console.log('InstallButton: Not showing - conditions not met');
    return null;
  }

  // In development, show a message if not actually installable
  const handleClick = async () => {
    if (!deferredPrompt) {
      if (isDevelopment) {
        alert(
          'Install prompt not available in development mode.\n\n' +
          'To test PWA installation:\n' +
          '1. Build for production: npm run build --prefix client\n' +
          '2. Preview build: npm run preview --prefix client\n' +
          '3. Open in browser and try installing\n\n' +
          'Or check browser DevTools > Application > Manifest'
        );
      }
      return;
    }
    await handleInstallClick();
  };

  return (
    <button
      className={`install-btn install-btn-${variant} install-btn-${size}`}
      onClick={handleClick}
      aria-label="Install app"
      title={!deferredPrompt && isDevelopment ? 'Install prompt not available (dev mode)' : 'Install app'}
    >
      {showIcon && (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="install-btn-icon">
          <path d="M9 2V12M9 12L6 9M9 12L12 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 12V14C3 15.1046 3.89543 16 5 16H13C14.1046 16 15 15.1046 15 14V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
      <span className="install-btn-text">
        {!deferredPrompt && isDevelopment ? 'Install App (Dev)' : 'Install App'}
      </span>
    </button>
  );
};

export default InstallButton;
