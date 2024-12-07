import { HeadingSection } from '@/components/shared/HeadingSection';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ResourcesHeaderProps {
  title: string;
  description: string;
  className?: string;
}

export function ResourcesHeader({
  title,
  description,
  className,
}: ResourcesHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <HeadingSection heading={title} description={description} align="left" />
      <Separator />
    </div>
  );
}
