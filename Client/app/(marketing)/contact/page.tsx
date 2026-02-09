'use client';

import { useContactPageData } from '@/lib/hooks/useContactPageData';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/shared/icons';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { sendContactUsEmail } from '@/api/fetchData';
import Section from '@/components/layout/Section';

export default function ContactPage() {
  const { contactSections, loading } = useContactPageData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    businessInfo: '',
    message: '',
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!contactSections) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          The page is not available at the moment. Please try again later.
        </p>
      </div>
    );
  }

  const {
    aboutSection,
    emailSection,
    phoneSection,
    contactSection,
    faqSection,
  } = contactSections;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await sendContactUsEmail({
        senderEmail: formData.email,
        message: formData.message,
        businessInfo: formData.businessInfo,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
      });

      toast.success('Message sent successfully!');
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        businessInfo: '',
        message: '',
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section className=" py-8 md:py-12">
      {/* Header Section */}
      <HeadingSection
        heading={aboutSection?.header}
        description={aboutSection?.subHeader}
      />

      {/* Contact Information */}
      <div className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        {/* Email */}
        <Card>
          <CardContent className="flex flex-col items-center p-6">
            <Icons.mail className="h-12 w-12 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">
              {emailSection?.header}
            </h3>
            <p className="mt-2 text-center text-muted-foreground">
              {emailSection?.subHeader}
            </p>
            <a
              href={`mailto:${emailSection?.helperText}`}
              className="mt-4 text-primary hover:underline"
            >
              {emailSection?.helperText}
            </a>
          </CardContent>
        </Card>

        {/* Phone */}
        <Card>
          <CardContent className="flex flex-col items-center p-6">
            <Icons.phone className="h-12 w-12 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">
              {phoneSection?.header}
            </h3>
            <p className="mt-2 text-center text-muted-foreground">
              {phoneSection?.subHeader}
            </p>
            <a
              href={`tel:${phoneSection?.helperText}`}
              className="mt-4 text-primary hover:underline"
            >
              {phoneSection?.helperText}
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Contact Form */}
      <Card className="mt-12">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold">{contactSection?.header}</h2>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>
            <Input
              type="tel"
              placeholder="Phone number"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phoneNumber: e.target.value,
                }))
              }
            />
            <Textarea
              placeholder="Tell us about your business and customers"
              value={formData.businessInfo}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  businessInfo: e.target.value,
                }))
              }
              required
            />
            <Textarea
              placeholder="Any budget or timeline considerations?"
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              required
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      {faqSection && (
        <div className="mt-12">
          <HeadingSection
            heading={faqSection.header}
            description={faqSection.subHeader}
          />
          <div className="mt-8 max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              {faqSection.items?.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.header}</AccordionTrigger>
                  <AccordionContent>{faq.subHeader}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      )}
    </Section>
  );
}
