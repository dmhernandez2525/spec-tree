'use client';
import { cn } from '@/lib/utils';

interface ColorHeaderProps {
  header: string;
  textColor?: string;
  style?: React.CSSProperties;
  dark?: boolean;
}

export function ColorHeader({
  header,
  textColor = 'black',
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
    </div>
  );
}
