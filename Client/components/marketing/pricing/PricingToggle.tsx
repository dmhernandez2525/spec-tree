'use client';

import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PricingToggleProps {
  isAnnual: boolean;
  onToggle: () => void;
}

export function PricingToggle({ isAnnual, onToggle }: PricingToggleProps) {
  return (
    <div className="flex items-center gap-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
      >
        <Label
          htmlFor="pricing-toggle"
          className={isAnnual ? 'text-muted-foreground' : ''}
        >
          Monthly
        </Label>
        <Switch
          id="pricing-toggle"
          checked={isAnnual}
          onCheckedChange={onToggle}
        />
        <div className="flex items-center gap-2">
          <Label
            htmlFor="pricing-toggle"
            className={!isAnnual ? 'text-muted-foreground' : ''}
          >
            Annual
          </Label>
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
          >
            Save up to 20%
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}
