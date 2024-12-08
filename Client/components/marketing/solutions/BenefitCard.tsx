import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BenefitCardProps {
  title: string;
  description: string;
  icon: keyof typeof Icons;
  className?: string;
}

export function BenefitCard({
  title,
  description,
  icon,
  className,
}: BenefitCardProps) {
  const Icon = Icons[icon];

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Card className={cn('h-full', className)}>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-primary/10 p-3 w-fit">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
