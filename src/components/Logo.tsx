/**
 * شعار ملك الماوية - يستخدم في جميع أنحاء النظام
 */

import logoImage from 'figma:asset/eb93a45a387f09423d4a9ce3fe3a9b5424d58d98.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-12 w-auto',
    md: 'h-16 w-auto',
    lg: 'h-24 w-auto',
    xl: 'h-32 w-auto',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src={logoImage} 
        alt="ملك الماوية" 
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  );
}