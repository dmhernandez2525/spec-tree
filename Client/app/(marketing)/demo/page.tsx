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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="video">Video Demo</TabsTrigger>
                <TabsTrigger value="interactive">Interactive Demo</TabsTrigger>
                <TabsTrigger value="guided">Guided Tour</TabsTrigger>
                <TabsTrigger value="roi">ROI Calculator</TabsTrigger>
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
  );
}
