import React from 'react';
import Image from 'next/image';

// Minimal "SZ" Logo - perfect for navbar/favicon
export function LogoMinimal({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logos/Stylized Red Bus Logo with Integrated Text.png"
        alt="SeeZee Studio Logo"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
    </div>
  );
}

// Full logo
export function LogoFull({ className = "", width = 300 }: { className?: string; width?: number }) {
  const height = width * 0.75; // Maintain aspect ratio based on the image
  
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width }}
    >
      <Image
        src="/logos/Stylized Red Bus Logo with Integrated Text.png"
        alt="SeeZee Studio Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  );
}
