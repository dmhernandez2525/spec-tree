import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'narrow' | 'wide';
  as?: keyof JSX.IntrinsicElements;
}

export default function Container({
  children,
  className,
  size = 'default',
  as: Component = 'div',
}: ContainerProps) {
  return (
    <Component
      className={cn(
        {
          container: size === 'default',
          'container-narrow': size === 'narrow',
          'container-wide': size === 'wide',
        },
        className
      )}
    >
      {children}
    </Component>
  );
}
