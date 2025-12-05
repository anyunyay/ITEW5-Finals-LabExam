import './Logo.css';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

function Logo({ size = 'medium', showText = true, className = '' }: LogoProps) {
  const sizeMap = {
    small: 36,
    medium: 52,
    large: 72
  };

  const iconSize = sizeMap[size];

  return (
    <div className={`logo ${size} ${className}`}>
      <svg 
        width={iconSize} 
        height={iconSize} 
        viewBox="0 0 48 48" 
        xmlns="http://www.w3.org/2000/svg"
        className="logo-icon"
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D6BCFA" />
            <stop offset="100%" stopColor="#9F7AEA" />
          </linearGradient>
        </defs>
        
        {/* Background Circle */}
        <circle cx="24" cy="24" r="22" fill="url(#purpleGradient)" />
        
        {/* Checkmark Icon */}
        <path 
          d="M 14 24 L 20 30 L 34 16" 
          fill="none" 
          stroke="#FFFFFF" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Decorative Dots */}
        <circle cx="12" cy="12" r="2" fill="#FFFFFF" opacity="0.6" />
        <circle cx="36" cy="36" r="2" fill="#FFFFFF" opacity="0.6" />
      </svg>
      {showText && <span className="logo-text">Sports Task Manager</span>}
    </div>
  );
}

export default Logo;
