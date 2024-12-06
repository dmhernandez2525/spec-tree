// components/marketing/CTASection.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';

export function CTASection() {
  return (
    <div className="container">
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-12">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Ready to Transform Your Project Planning?
              </h2>
              <p className="text-xl opacity-90">
                Join thousands of teams using Spec Tree to deliver
                better projects, faster.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">
                    <Icons.phone className="mr-2 h-4 w-4" />
                    Schedule Demo
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Active Users', value: '10,000+' },
                { label: 'Projects Completed', value: '25,000+' },
                { label: 'Time Saved', value: '40%' },
                { label: 'Customer Satisfaction', value: '98%' },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
