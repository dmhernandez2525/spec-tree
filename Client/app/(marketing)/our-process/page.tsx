'use client';

import { HeadingSection } from '@/components/shared/HeadingSection';
import ProcessImplementationSteps from '@/components/marketing/our-process/ProcessImplementationSteps';
import SupportTraining from '@/components/marketing/our-process/SupportTraining';
import SuccessMetrics from '@/components/marketing/our-process/SuccessMetrics';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import Section from '@/components/layout/Section';

export default function OurProcessPage() {
  return (
    <Section className=" py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HeadingSection
          heading="Our Implementation Process"
          description="A proven methodology for successful adoption of Spec Tree in your organization"
          className="mb-12"
        />
      </motion.div>

      <div className="space-y-24">
        <section>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-8">Implementation Steps</h2>
            <ProcessImplementationSteps />
          </motion.div>
        </section>

        <Separator />

        <section>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-8">Support & Training</h2>
            <p className="text-muted-foreground mb-8 max-w-3xl">
              We provide comprehensive support and training resources to ensure
              your team gets the most out of Spec Tree. Our
              multi-faceted approach includes documentation, video tutorials,
              live training sessions, and dedicated support.
            </p>
            <SupportTraining />
          </motion.div>
        </section>

        <Separator />

        <section>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-8">Success Metrics</h2>
            <p className="text-muted-foreground mb-8 max-w-3xl">
              Our customers consistently see significant improvements in their
              project management metrics after implementing Spec Tree.
              Here are some key performance indicators from our successful
              implementations.
            </p>
            <SuccessMetrics />
          </motion.div>
        </section>

        <section className="bg-muted rounded-lg p-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Begin your journey with Spec Tree today. Our team is ready
              to help you transform your project management process.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/register">Start Free Trial</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </div>
    </Section>
  );
}
