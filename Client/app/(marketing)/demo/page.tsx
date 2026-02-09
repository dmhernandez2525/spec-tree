'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DemoForm } from '@/components/marketing/demo/DemoForm';
import { InteractiveDemo } from '@/components/marketing/demo/InteractiveDemo';
import { RoiCalculator } from '@/components/marketing/demo/RoiCalculator';
import { VideoDemo } from '@/components/marketing/demo/VideoDemo';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrialBanner } from '@/components/marketing/pricing/TrialBanner';
import { TrialModal } from '@/components/marketing/pricing/TrialModal';
import { TrialStatus } from '@/types/trial';
import { NewsletterForm } from '@/components/marketing/NewsletterForm';
import { CTASection } from '@/components/marketing/CTASection';
import { startTrial } from '@/api/trialApi';
import { useToast } from '@/lib/hooks/use-toast';

import Section from '@/components/layout/Section';

const demoVideo = {
  videoUrl: '/demo-video.mp4', // This would be your actual video URL
  title: 'Spec Tree Overview',
  description:
    'See how Spec Tree transforms project planning with AI-powered assistance',
  duration: '10:25',
  chapters: [
    { title: 'Introduction to Spec Tree', timestamp: '0:00' },
    { title: 'AI Context Gathering', timestamp: '2:15' },
    { title: 'Work Item Generation', timestamp: '4:30' },
    { title: 'Template System', timestamp: '6:45' },
    { title: 'Integration Features', timestamp: '8:30' },
  ],
};

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('video');
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2,
      },
    },
  };

  const handleStartTrial = async (planId: string) => {
    setIsLoading(true);
    try {
      const status = await startTrial(planId);
      setTrialStatus(status);
      setIsTrialModalOpen(false);
      toast({
        title: 'Trial Started Successfully',
        description:
          'Welcome to Spec Tree! Your 14-day trial has begun.',
      });
    } catch (error) {
      console.error('Failed to start trial:', error);

      toast({
        title: 'Failed to Start Trial',
        description:
          'There was an error starting your trial. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <TrialBanner
        trialStatus={trialStatus}
        onStartTrial={() => setIsTrialModalOpen(true)}
      />

      <Section className="py-8 md:py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          <HeadingSection
            heading="Experience Spec Tree"
            description="See how our AI-powered project management platform can transform your workflow"
            className="text-center"
          />

          <Card>
            <CardHeader>
              <CardTitle>Choose Your Demo Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue={activeTab}
                onValueChange={setActiveTab}
                className="space-y-4"
              >
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                  <TabsTrigger value="video" className="text-xs sm:text-sm">Video</TabsTrigger>
                  <TabsTrigger value="interactive" className="text-xs sm:text-sm">
                    Interactive
                  </TabsTrigger>
                  <TabsTrigger value="guided" className="text-xs sm:text-sm">Guided</TabsTrigger>
                  <TabsTrigger value="roi" className="text-xs sm:text-sm">ROI Calc</TabsTrigger>
                </TabsList>

                <TabsContent value="video">
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <VideoDemo {...demoVideo} />
                  </motion.div>
                </TabsContent>

                <TabsContent value="interactive">
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <InteractiveDemo />
                  </motion.div>
                </TabsContent>

                <TabsContent value="guided">
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <DemoForm />
                  </motion.div>
                </TabsContent>

                <TabsContent value="roi">
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <RoiCalculator />
                  </motion.div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </Section>

      {/* CTA Section */}
      <section className="bg-muted py-16 md:py-24">
        <CTASection />
      </section>

      {/* Newsletter Section */}
      <section className="bg-background py-16 md:py-24">
        <Section>
          <NewsletterForm />
        </Section>
      </section>
      <TrialModal
        isOpen={isTrialModalOpen}
        onClose={() => setIsTrialModalOpen(false)}
        onStartTrial={handleStartTrial}
      />
    </>
  );
}
