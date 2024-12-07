import { cn } from '@/lib/utils';
import Container from './Container';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  containerSize?: 'default' | 'narrow' | 'wide' | 'full';
  background?: 'default' | 'muted' | 'primary';
  containerClassName?: string;
}

export default function Section({
  children,
  className,
  containerSize = 'narrow',
  background = 'default',
  containerClassName,
}: SectionProps) {
  return (
    <section
      className={cn(
        'w-full',
        {
          'bg-background': background === 'default',
          'bg-muted': background === 'muted',
          'bg-primary text-primary-foreground': background === 'primary',
        },
        className
      )}
    >
      <Container size={containerSize} className={containerClassName}>
        {children}
      </Container>
    </section>
  );
}
