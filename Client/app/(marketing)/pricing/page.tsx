'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { PricingToggle } from '@/components/marketing/pricing/PricingToggle';
import { PricingCard } from '@/components/marketing/pricing/PricingCard';
import { FeatureComparisonTable } from '@/components/marketing/pricing/PricingTable';
import { PricingCalculator } from '@/components/marketing/pricing/PricingCalculator';
import { PricingFAQ } from '@/components/marketing/pricing/PricingFaq';
import { EnterpriseCTA } from '@/components/marketing/pricing/EnterpriseCTA';
import { pricingTiers } from '@/lib/data/pricing';
import Section from '@/components/layout/Section';

interface TabProps {
  id: string;
  label: string;
}

const tabs: TabProps[] = [
  { id: 'pricing', label: 'Pricing' },
  { id: 'calculator', label: 'Calculator' },
  { id: 'comparison', label: 'Compare Plans' },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [activeTab, setActiveTab] = useState('pricing');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <Section className="py-8 md:py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-12"
      >
        <div className="text-center">
          <HeadingSection
            heading="Simple, Transparent Pricing"
            description="Choose the perfect plan for your team. All plans include a 14-day free trial."
          />

          <div className="mt-8 flex justify-center">
            <PricingToggle
              isAnnual={isAnnual}
              onToggle={() => setIsAnnual(!isAnnual)}
            />
          </div>

          <div className="mt-6 flex justify-center space-x-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {activeTab === 'pricing' && (
          <motion.div
            variants={containerVariants}
            className="grid gap-8 md:grid-cols-3"
          >
            {pricingTiers.map((tier) => (
              <motion.div key={tier.id} variants={itemVariants}>
                <PricingCard plan={tier} isAnnual={isAnnual} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'calculator' && (
          <motion.div variants={itemVariants} className="mx-auto max-w-2xl">
            <PricingCalculator />
          </motion.div>
        )}

        {activeTab === 'comparison' && (
          <motion.div variants={itemVariants}>
            <FeatureComparisonTable />
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="mx-auto max-w-4xl">
          <PricingFAQ />
        </motion.div>

        <motion.div variants={itemVariants} className="mx-auto max-w-5xl">
          <EnterpriseCTA />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mx-auto max-w-2xl text-center"
        >
          <h3 className="text-xl font-semibold">Need something different?</h3>
          <p className="mt-2 text-muted-foreground">
            We offer custom solutions for large organizations with specific
            requirements. Contact our sales team to discuss your needs.
          </p>
          <Button className="mt-4" variant="outline" size="lg">
            Contact Sales
          </Button>
        </motion.div>
      </motion.div>
    </Section>
  );
}
