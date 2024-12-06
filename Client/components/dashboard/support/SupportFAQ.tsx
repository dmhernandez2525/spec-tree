'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I create my first project?',
    answer:
      'To create your first project, click the "New Project" button in the dashboard. Follow the AI-guided setup process to define your project scope and requirements.',
    category: 'Getting Started',
  },
  {
    id: '2',
    question: 'What is AI-powered context gathering?',
    answer:
      'AI-powered context gathering uses advanced algorithms to ask relevant questions about your project, helping to capture comprehensive requirements and identify potential gaps or dependencies.',
    category: 'Features',
  },
  {
    id: '3',
    question: 'How do I invite team members?',
    answer:
      'You can invite team members from the Project Settings page. Enter their email addresses and assign appropriate roles. They will receive an invitation email to join your project.',
    category: 'Teams',
  },
  {
    id: '4',
    question: 'What integrations are available?',
    answer:
      'We support integrations with popular tools like Jira, GitHub, Slack, and more. Visit the Integrations page in your project settings to set up and configure integrations.',
    category: 'Integrations',
  },
];

const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

export function SupportFAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={
                    selectedCategory === category ? 'default' : 'secondary'
                  }
                  className="cursor-pointer"
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === category ? null : category
                    )
                  }
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Accordion type="single" collapsible>
              {filteredFaqs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AccordionItem value={faq.id}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-4">
                        <span>{faq.question}</span>
                        <Badge variant="secondary">{faq.category}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose max-w-none dark:prose-invert">
                        <p>{faq.answer}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
