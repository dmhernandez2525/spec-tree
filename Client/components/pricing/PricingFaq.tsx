// components/pricing/PricingFaq.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How does the 14-day free trial work?',
    answer:
      'You can try Spec Tree free for 14 days with full access to all features of your chosen plan. No credit card is required to start your trial. At the end of the trial, you can choose to subscribe or your account will be automatically downgraded to a limited free version.',
  },
  {
    question: 'Can I change plans at any time?',
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. When upgrading, the new features will be immediately available. When downgrading, you'll continue to have access to your current plan until the end of your billing period.",
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express) and can also arrange alternative payment methods such as bank transfers for Enterprise customers.',
  },
  {
    question:
      'Do you offer any discounts for non-profits or educational institutions?',
    answer:
      'Yes, we offer special pricing for non-profit organizations and educational institutions. Please contact our sales team for more information.',
  },
  {
    question: 'What happens to my data if I cancel my subscription?',
    answer:
      "You'll have 30 days to export your data after cancelling. After that period, your data will be permanently deleted from our systems in accordance with our data retention policies.",
  },
  {
    question: 'Do you offer custom plans?',
    answer:
      "Yes, we offer custom Enterprise plans tailored to your organization's specific needs. Contact our sales team to discuss your requirements.",
  },
];

export function PricingFaq() {
  return (
    <div>
      <h2 className="text-center text-3xl font-bold">
        Frequently Asked Questions
      </h2>
      <div className="mt-8 max-w-3xl mx-auto">
        <Accordion type="single" collapsible>
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
