'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';

const benefits = [
  'Custom AI model training',
  'Dedicated support team',
  'Custom integrations',
  'Enterprise SLA',
  'Advanced security features',
  'On-premise deployment options',
];

export function EnterpriseCTA() {
  return (
    <Card className="bg-primary text-primary-foreground">
      <CardContent className="grid gap-8 p-12 md:grid-cols-2">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold"
          >
            Enterprise Solutions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-xl opacity-90"
          >
            Custom solutions for large organizations with unique requirements
          </motion.p>
          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 space-y-3"
          >
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2">
                <Icons.check className="h-5 w-5" />
                <span>{benefit}</span>
              </li>
            ))}
          </motion.ul>
        </div>
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold">Ready to get started?</h3>
            <p className="mt-2 text-lg opacity-90">
              Contact our sales team for a custom quote
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/resources/case-studies">View Case Studies</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
