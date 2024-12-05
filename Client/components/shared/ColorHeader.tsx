'use client';

import { cn } from '@/lib/utils';

interface ColorHeaderProps {
  header: string;
  headerColor: string;
  textColor?: string;
  style?: React.CSSProperties;
  dark?: boolean;
}

export function ColorHeader({
  header,
  headerColor,
  textColor = '#717d96',
  style,
  dark = false,
}: ColorHeaderProps) {
  return (
    <div className="flex items-baseline gap-2" style={style}>
      <span
        className={cn('text-2xl font-bold', dark && 'text-white')}
        style={{ color: textColor }}
      >
        {header}
      </span>
      <span
        className={cn(
          'text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent',
          dark && 'from-blue-300 via-purple-400 to-pink-400'
        )}
      >
        {`{${headerColor}}`}
      </span>
    </div>
  );
}
