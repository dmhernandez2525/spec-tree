// /components/marketing/pricing/PricingCalculator.tsx

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface CalculatedCosts {
  monthly: number;
  annual: number;
  savings: number;
}

export function PricingCalculator() {
  const [teamSize, setTeamSize] = useState<number>(5);
  const [projectCount, setProjectCount] = useState<number>(3);

  const calculateCosts = (): CalculatedCosts => {
    let basePrice = 0;

    // Calculate base price based on team size
    if (teamSize <= 5) {
      basePrice = 29;
    } else if (teamSize <= 20) {
      basePrice = 79;
    } else {
      basePrice = 199;
    }

    // Add cost per additional project
    const projectCost = projectCount > 10 ? (projectCount - 10) * 5 : 0;

    const monthlyTotal = basePrice + projectCost;
    const annualTotal = (basePrice + projectCost) * 0.8 * 12; // 20% discount for annual
    const savings = monthlyTotal * 12 - annualTotal;

    return {
      monthly: monthlyTotal,
      annual: annualTotal / 12,
      savings: savings,
    };
  };

  const costs = calculateCosts();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculate Your Price</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="space-y-4">
            <Label>Team Size</Label>
            <Slider
              value={[teamSize]}
              onValueChange={(value) => setTeamSize(value[0])}
              min={1}
              max={50}
              step={1}
              className="py-4"
            />
            <div className="text-sm text-muted-foreground">
              Current team size: {teamSize} members
            </div>
          </div>

          <div className="space-y-4">
            <Label>Active Projects</Label>
            <Slider
              value={[projectCount]}
              onValueChange={(value) => setProjectCount(value[0])}
              min={1}
              max={20}
              step={1}
              className="py-4"
            />
            <div className="text-sm text-muted-foreground">
              Active projects: {projectCount}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="rounded-lg bg-muted p-4 text-center">
                <div className="text-sm text-muted-foreground">
                  Monthly Price
                </div>
                <div className="text-2xl font-bold">${costs.monthly}</div>
                <div className="text-xs text-muted-foreground">per month</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="rounded-lg bg-muted p-4 text-center">
                <div className="text-sm text-muted-foreground">
                  Annual Price
                </div>
                <div className="text-2xl font-bold">
                  ${costs.annual.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">per month</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <div className="text-sm text-primary">Annual Savings</div>
                <div className="text-2xl font-bold text-primary">
                  ${costs.savings.toFixed(2)}
                </div>
                <div className="text-xs text-primary">per year</div>
              </div>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
