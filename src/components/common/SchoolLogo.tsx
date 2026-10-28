import React, { useState } from 'react';
import { SCHOOL_CONFIG } from '../../constants/schoolConfig';

interface SchoolLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'circle' | 'rounded' | 'plain';
  showBackground?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'rounded',
  showBackground = true,
}) => {
  const [imgIndex, setImgIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const logoCandidates = [
    SCHOOL_CONFIG.logoUrl,
    SCHOOL_CONFIG.logoThumbnailUrl,
    SCHOOL_CONFIG.logoDriveDirectUrl,
  ].filter(Boolean);

  const isNumericSize = typeof size === 'number';

  const sizeClasses = !isNumericSize
    ? {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-16 h-16 sm:w-20 sm:h-20',
        xl: 'w-20 h-20 sm:w-24 sm:h-24',
      }[size]
    : '';

  const variantClasses = {
    circle: 'rounded-full',
    rounded: 'rounded-xl',
    plain: '',
  }[variant];

  const handleImageError = () => {
    if (imgIndex < logoCandidates.length - 1) {
      setImgIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  const currentSrc = logoCandidates[imgIndex];

  if (hasError || !currentSrc) {
    return (
      <div
        className={`flex items-center justify-center font-black text-white bg-gradient-to-br from-indigo-700 to-blue-800 shadow-xs select-none ${sizeClasses} ${variantClasses} ${className}`}
        style={isNumericSize ? { width: size, height: size } : undefined}
        title={SCHOOL_CONFIG.name}
      >
        <span className="text-xs uppercase font-sans font-black tracking-tight">SMPN 2</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center overflow-hidden shrink-0 ${
        showBackground ? 'bg-white p-1 shadow-xs border border-slate-200/80' : ''
      } ${sizeClasses} ${variantClasses} ${className}`}
      style={isNumericSize ? { width: size, height: size } : undefined}
    >
      <img
        src={currentSrc}
        alt={`Logo Resmi ${SCHOOL_CONFIG.name}`}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={handleImageError}
        className="w-full h-full object-contain"
        loading="eager"
      />
    </div>
  );
};

