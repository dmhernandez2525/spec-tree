'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { BenefitCard } from '@/components/solutions/BenefitCard';
import { Icons } from '@/components/shared/icons';
import { roles } from '@/lib/data/solutions';
import { RoleSolution } from '@/types/solutions';

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

export default function RolePage() {
  const params = useParams();
  const [role, setRole] = useState<RoleSolution | null>(null);

  useEffect(() => {
    const currentRole = roles.find((r) => r.slug === params.role);
    setRole(currentRole || null);
  }, [params.role]);

  if (!role) {
    return (
      <div className="container py-8 md:py-12 text-center">
        <h1 className="text-2xl font-bold">Role not found</h1>
        <Button asChild className="mt-4">
          <Link href="/solutions">Back to Solutions</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HeadingSection
          heading={role.title}
          description={role.description}
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
            src={role.imageUrl}
            alt={role.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </motion.div>

      {/* Key Responsibilities */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-16"
      >
        <h2 className="text-2xl font-bold text-center mb-8">
          Key Responsibilities
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {role.keyResponsibilities.map((responsibility, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Icons.check className="h-5 w-5 text-primary" />
                    <span>{responsibility}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Common Challenges */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-16"
      >
        <h2 className="text-2xl font-bold text-center mb-8">
          Common Challenges
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {role.challenges.map((challenge, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Icons.alertCircle className="h-5 w-5 text-primary" />
                    <span>{challenge}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Benefits */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          How Spec Tree Helps
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {role.benefits.map((benefit) => (
            <BenefitCard
              key={benefit.title}
              title={benefit.title}
              description={benefit.description}
              icon={benefit.icon}
            />
          ))}
        </div>
      </div>

      {/* Features */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-16"
      >
        <h2 className="text-2xl font-bold text-center mb-8">Key Features</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {role.features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Icons.check className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-24 rounded-lg bg-primary p-12 text-primary-foreground text-center"
      >
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl opacity-90 mb-8">
          Join other {role.title} using Spec Tree to excel in their role
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
    </div>
  );
}
