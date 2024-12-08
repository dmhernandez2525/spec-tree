'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    question: 'How does the 14-day free trial work?',
    answer:
      'Start your free trial with full access to your chosen plans features. No credit card required. At the end of the trial, choose to subscribe or your account will be automatically downgraded to a limited free version.',
    category: 'Trial & Pricing',
  },
  {
    question: 'Can I change plans at any time?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time. When upgrading, youll get immediate access to new features. When downgrading, youll keep your current features until the end of your billing period.',
    category: 'Trial & Pricing',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express) and can arrange alternative payment methods such as bank transfers for Enterprise customers.',
    category: 'Trial & Pricing',
  },
  {
    question: 'How does AI-powered context gathering work?',
    answer:
      'Our AI system analyzes your project type and requirements to generate relevant questions and suggestions. It learns from your responses to provide increasingly accurate and tailored recommendations over time.',
    category: 'Features',
  },
  {
    question: 'What kind of support is included?',
    answer:
      'Support varies by plan. Starter includes email support, Professional adds priority support with faster response times, and Enterprise includes dedicated support with a named account manager.',
    category: 'Support',
  },
  {
    question: 'Can I integrate Spec Tree with other tools?',
    answer:
      'Yes, we offer various integration options. The Professional plan includes common integrations, while Enterprise allows for custom integrations tailored to your needs.',
    category: 'Features',
  },
  {
    question: 'What happens to my data if I cancel?',
    answer:
      'You have 30 days after cancellation to export your data. After that period, your data will be permanently deleted from our systems in accordance with our data retention policies.',
    category: 'Security',
  },
  {
    question: 'Do you offer custom plans?',
    answer:
      'Yes, our Enterprise tier offers fully customizable plans. Contact our sales team to discuss your specific requirements and get a tailored solution.',
    category: 'Trial & Pricing',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes, we implement enterprise-grade security measures including encryption at rest and in transit, regular security audits, and compliance with industry standards. Enterprise plans include additional security features.',
    category: 'Security',
  },
  {
    question:
      'Do you offer discounts for non-profits or educational institutions?',
    answer:
      'Yes, we offer special pricing for non-profit organizations and educational institutions. Please contact our sales team to learn more about our discount programs.',
    category: 'Trial & Pricing',
  },
];

const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

export function PricingFAQ() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredFaqs =
    selectedCategory === 'All'
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">
          Frequently Asked Questions
        </CardTitle>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button
            variant={selectedCategory === 'All' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('All')}
            size="sm"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <Accordion type="single" collapsible className="w-full">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <AccordionItem value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Still have questions?{' '}
            <Button variant="link" className="p-0" asChild>
              <Link href="/contact">Contact our team</Link>
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
