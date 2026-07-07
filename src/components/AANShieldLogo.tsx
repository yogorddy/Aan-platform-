import React from 'react';

interface AANShieldLogoProps {
  className?: string;
  size?: number | string;
  strokeWidth?: number;
  color?: string;
}

export default function AANShieldLogo({ 
  className = "w-full h-full", 
  size, 
  strokeWidth = 5,
  color = "#58E38A"
}: AANShieldLogoProps) {
  return (
    <svg 
      viewBox="0 0 128 128" 
      className={className} 
      width={size} 
      height={size}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* thin rounded shield outline */}
      <path 
        d="M 64 16 C 90 16 104 24 104 52 C 104 84 80 108 64 112 C 48 108 24 84 24 52 C 24 24 38 16 64 16 Z" 
        stroke={color} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* small circle inside near the top center */}
      <circle 
        cx="64" 
        cy="44" 
        r="7" 
        stroke={color} 
        strokeWidth={strokeWidth} 
        fill="none" 
      />
      {/* short identity mark beneath the circle */}
      <path 
        d="M 64 64 L 64 88" 
        stroke={color} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
      />
    </svg>
  );
}
