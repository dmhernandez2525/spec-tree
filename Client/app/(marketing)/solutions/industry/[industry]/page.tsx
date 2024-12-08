'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { MetricDisplay } from '@/components/marketing/solutions/MetricDisplay';
import { industries } from '@/lib/data/solutions';
import { IndustrySolution } from '@/types/solutions';
import Section from '@/components/layout/Section';

export default function IndustryPage() {
  const params = useParams();
  const [industry, setIndustry] = useState<IndustrySolution | null>(null);
  useEffect(() => {
    const currentIndustry = industries.find((i) => i.slug === params.industry);
    setIndustry(currentIndustry || null);
  }, [params.industry]);

  if (!industry) {
    return (
      <Section className=" py-8 md:py-12 text-center">
        <h1 className="text-2xl font-bold">Industry not found</h1>
        <Button asChild className="mt-4">
          <Link href="/solutions">Back to Solutions</Link>
        </Button>
      </Section>
    );
  }

  return (
    <Section className=" py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HeadingSection
          heading={industry.title}
          description={industry.description}
          className="text-center"
        />
      </motion.div>

      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-12"
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={industry.imageUrl}
            alt={industry.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Key Results</h2>
        <MetricDisplay metrics={industry.keyMetrics} />
      </div>

      {/* Benefits */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Key Benefits</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {industry.benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Icons.check className="h-5 w-5 text-primary" />
                    <span>{benefit}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Key Features</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {industry.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Icons.check className="h-5 w-5 text-primary" />
                    <span>{feature.toString()}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Case Studies */}
      {industry.caseStudies.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Success Stories
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {industry.caseStudies.map((study) => (
              <Card
                key={study.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{study.title}</h3>
                  <Button asChild variant="ghost">
                    <Link href={study.href}>
                      Read Case Study
                      <Icons.arrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-24 rounded-lg bg-primary p-12 text-primary-foreground text-center"
      >
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl opacity-90 mb-8">
          Join leading {industry.title.toLowerCase()} teams using Blueprint
          Builder
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">Start Free Trial</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contact">Talk to Sales</Link>
          </Button>
        </div>
      </motion.div>
    </Section>
  );
}
