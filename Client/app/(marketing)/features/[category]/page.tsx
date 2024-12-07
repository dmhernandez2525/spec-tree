'use client';

import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { features, type FeatureCategory } from '@/types/features';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/shared/icons';
import Link from 'next/link';

interface FeatureCategoryPageProps {
  params: {
    category: FeatureCategory;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function FeatureCategoryPage({
  params,
}: FeatureCategoryPageProps) {
  const feature = features[params.category];

  if (!feature) {
    notFound();
  }

  const Icon = Icons[feature.icon];

  return (
    <div className="container py-8 md:py-12">
      <div className="space-y-8">
        {/* Hero Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center"
        >
          <motion.div variants={itemVariants} className="mb-4">
            <Badge variant="secondary" className="mb-4">
              Feature
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {feature.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {feature.description}
            </p>
          </motion.div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid gap-8 md:grid-cols-2"
        >
          {feature.benefits.map((benefit, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="rounded-full p-2 bg-primary/10">
                    <Icons.check className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-lg">{benefit}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Details Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="space-y-8"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold text-center"
          >
            How It Works
          </motion.h2>
          <div className="grid gap-8 md:grid-cols-3">
            {feature.details.map((detail, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{detail.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {detail.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technical Specs Section */}
        {feature.technicalSpecs && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-8"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold text-center"
            >
              Technical Specifications
            </motion.h2>
            <div className="grid gap-4 md:grid-cols-3">
              {feature.technicalSpecs.map((spec, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-medium text-muted-foreground mb-2">
                        {spec.label}
                      </h3>
                      <p className="text-2xl font-bold">{spec.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Use Cases Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="space-y-8"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold text-center"
          >
            Use Cases
          </motion.h2>
          <div className="grid gap-8 md:grid-cols-2">
            {feature.useCases.map((useCase, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{useCase.title}</CardTitle>
                    <p className="text-muted-foreground">
                      {useCase.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {useCase.examples.map((example, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Icons.check className="h-4 w-4 text-primary" />
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="text-center"
        >
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-12">
              <motion.h2
                variants={itemVariants}
                className="text-3xl font-bold mb-4"
              >
                Ready to Get Started?
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-lg mb-8 opacity-90"
              >
                Transform your project planning with{' '}
                {feature.title.toLowerCase()}.
              </motion.p>
              <motion.div
                variants={itemVariants}
                className="flex justify-center gap-4"
              >
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
