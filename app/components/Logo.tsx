import Image from "next/image";

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  height?: number;
}

export const Logo = ({ className = "", variant = 'dark', height = 40 }: LogoProps) => (
  <div className={`relative ${className}`} style={{ height: `${height}px`, width: `${height * 0.7}px` }}>
    <Image
      src={variant === 'dark' ? "/Black.png" : "/White.png"}
      alt="APEX SOLES"
      fill
      sizes={`${Math.round(height * 0.7)}px`}
      className="object-contain"
      priority
      unoptimized  
    />
  </div>
);
