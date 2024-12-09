'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/shared/icons';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  aiResponse?: string[];
}

const formSchema = z.object({
  projectType: z.string().min(1, 'Please select a project type'),
  description: z.string().min(10, 'Please provide more detail'),
  timeline: z.string().min(1, 'Please select a timeline'),
  teamSize: z.string().min(1, 'Please enter team size'),
});

type FormValues = z.infer<typeof formSchema>;

const projectTypes = [
  { value: 'software', label: 'Software Development' },
  { value: 'marketing', label: 'Marketing Campaign' },
  { value: 'product', label: 'Product Launch' },
  { value: 'consulting', label: 'Consulting Project' },
];

const timelineOptions = [
  { value: '1-3', label: '1-3 months' },
  { value: '3-6', label: '3-6 months' },
  { value: '6-12', label: '6-12 months' },
  { value: '12+', label: '12+ months' },
];

export function InteractiveDemo() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [demoSteps, setDemoSteps] = useState<DemoStep[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectType: '',
      description: '',
      timeline: '',
      teamSize: '',
    },
  });

  async function generateContextualQuestions(data: FormValues) {
    // TODO: use data then remove console.log
    console.log(data);
    // Simulated AI response - in production, this would call your AI service
    const questions = [
      'What are the primary business objectives for this project?',
      'Who are the key stakeholders and what are their main concerns?',
      'What are the critical success factors for this project?',
      'Are there any specific technical constraints or requirements?',
      'What are the potential risks and how do you plan to mitigate them?',
    ];

    return questions;
  }

  async function onSubmit(data: FormValues) {
    const questions = await generateContextualQuestions(data);

    const newSteps: DemoStep[] = [
      {
        id: 'project-info',
        title: 'Project Information',
        description: `${data.projectType} project with ${data.teamSize} team members over ${data.timeline}`,
      },
      {
        id: 'ai-context',
        title: 'AI Context Gathering',
        description:
          'Based on your input, our AI suggests the following questions:',
        aiResponse: questions,
      },
    ];

    setDemoSteps(newSteps);
    setCurrentStep(1);
  }

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
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <AnimatePresence mode="wait">
        {currentStep === 0 ? (
          <motion.div
            key="form"
            variants={itemVariants}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Lets Plan Your Project</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="projectType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select project type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {projectTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Briefly describe your project..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="timeline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Timeline</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timeline" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timelineOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="teamSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Team Size</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter team size"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      Generate Project Context
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            variants={itemVariants}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI-Generated Context</CardTitle>
                  <Button variant="outline" onClick={() => setCurrentStep(0)}>
                    Start Over
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-4">
                  {demoSteps.map((step) => (
                    <AccordionItem key={step.id} value={step.id}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{step.title}</Badge>
                          <span className="text-sm font-normal text-muted-foreground">
                            {step.description}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {step.aiResponse ? (
                          <ul className="space-y-4">
                            {step.aiResponse.map((question, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <Icons.brain className="mt-1 h-4 w-4 text-primary" />
                                <span>{question}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>{step.description}</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
