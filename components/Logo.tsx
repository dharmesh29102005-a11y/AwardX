import React from 'react';
import { cn } from '@/lib/utils';
import { LOGO_PATH } from '@/lib/brand';

const sizeClasses = {
  xs: 'h-6',
  sm: 'h-9',
  md: 'h-12',
  lg: 'h-14',
  xl: 'h-16',
  '2xl': 'h-20',
  hero: 'h-28 md:h-36',
  home: 'h-24 md:h-32',
  watermark: 'h-40 md:h-56 opacity-[0.06]',
} as const;

export type LogoSize = keyof typeof sizeClasses;

type LogoProps = {
  size?: LogoSize;
  className?: string;
  imgClassName?: string;
};

export const Logo: React.FC<LogoProps> = ({ size = 'md', className, imgClassName }) => (
  <span className={cn('inline-flex shrink-0 items-center', className)}>
    <img
      src={LOGO_PATH}
      alt=""
      className={cn('w-auto object-contain', sizeClasses[size], imgClassName)}
      draggable={false}
    />
  </span>
);

type LogoTitleProps = {
  title: string;
  logoSize?: LogoSize;
  className?: string;
  titleClassName?: string;
};

export const LogoTitle: React.FC<LogoTitleProps> = ({
  title,
  logoSize = 'lg',
  className,
  titleClassName,
}) => (
  <div className={cn('flex items-center gap-4 min-w-0', className)}>
    <Logo size={logoSize} />
    <div className="h-9 w-px shrink-0 bg-slate-200" aria-hidden="true" />
    <p className={cn('truncate text-sm font-semibold text-slate-700', titleClassName)}>{title}</p>
  </div>
);
