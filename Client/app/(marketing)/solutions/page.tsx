// app/(marketing)/solutions/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';
import { HeadingSection } from '@/components/shared/HeadingSection';
import Link from 'next/link';
import { SolutionShowcase } from '@/components/solutions/SolutionShowcase';
import { TestimonialCard } from '@/components/solutions/TestimonialCard';

interface IndustryCardProps {
  title: string;
  description: string;
  icon: keyof typeof Icons;
  benefits: string[];
  href: string;
}

const industries: IndustryCardProps[] = [
  {
    title: 'Enterprise Organizations',
    description:
      'Scale your project management across teams while maintaining consistency and clarity.',
    icon: 'eye',
    benefits: [
      'Cross-team collaboration',
      'Enterprise-wide templates',
      'Advanced security features',
      'Custom workflows',
    ],
    href: '/solutions/enterprise',
  },
  {
    title: 'Software Development',
    description:
      'Streamline your development process with AI-powered planning and context management.',
    icon: 'eye',
    benefits: [
      'Technical requirement gathering',
      'Sprint planning assistance',
      'Integration with dev tools',
      'Automated documentation',
    ],
    href: '/solutions/software',
  },
  {
    title: 'Marketing Agencies',
    description:
      'Manage multiple client projects with intelligent context gathering and timeline planning.',
    icon: 'eye',
    benefits: [
      'Client-specific templates',
      'Campaign planning',
      'Resource allocation',
      'Deliverable tracking',
    ],
    href: '/solutions/agency',
  },
  {
    title: 'Product Teams',
    description:
      'Turn product vision into actionable plans with comprehensive context management.',
    icon: 'eye',
    benefits: [
      'Feature planning',
      'User story generation',
      'Roadmap creation',
      'stakeholder management',
    ],
    href: '/solutions/product',
  },
  {
    title: 'Consulting Services',
    description:
      'Deliver consistent, high-quality project plans and documentation for your clients.',
    icon: 'eye',
    benefits: [
      'Client requirements gathering',
      'Proposal generation',
      'Project templates',
      'Deliverable tracking',
    ],
    href: '/solutions/consulting',
  },
  {
    title: 'Startups',
    description:
      'Move fast and stay organized with AI-assisted project planning and execution.',
    icon: 'eye',
    benefits: [
      'Quick project setup',
      'Flexible workflows',
      'Resource optimization',
      'Scaling guidance',
    ],
    href: '/solutions/startup',
  },
];

const testimonials = [
  {
    quote:
      'Spec Tree transformed how we manage our enterprise-wide projects. The AI-powered context gathering saves us countless hours in planning.',
    author: 'Sarah Chen',
    role: 'Director of PMO',
    company: 'Global Tech Solutions',
    image: '/testimonials/sarah-chen.jpg',
  },
  {
    quote:
      "As a software development team, we've cut our planning time in half while improving our requirement coverage.",
    author: 'Michael Rodriguez',
    role: 'Engineering Manager',
    company: 'InnovateX',
    image: '/testimonials/michael-rodriguez.jpg',
  },
  {
    quote:
      'Managing multiple client projects has never been easier. The template system is a game-changer for our agency.',
    author: 'Emma Thompson',
    role: 'Agency Director',
    company: 'Creative Solutions Agency',
    image: '/testimonials/emma-thompson.jpg',
  },
];

export default function SolutionsPage() {
  return (
    <div className="container py-8 md:py-12">
      {/* Hero Section */}
      <HeadingSection
        heading="Solutions for Every Team"
        description="Whether you're an enterprise organization or a growing startup, Spec Tree adapts to your unique needs."
        className="text-center"
      />

      {/* Industry Solutions Grid */}
      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {industries.map((industry) => {
          const Icon = Icons[industry.icon];
          return (
            <Card
              key={industry.title}
              className="group relative overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{industry.title}</h3>
                </div>
                <p className="mt-4 text-muted-foreground">
                  {industry.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {industry.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2">
                      <Icons.check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-6" variant="ghost">
                  <Link href={industry.href}>
                    Learn More
                    <Icons.arrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Solution Showcases */}
      <div className="mt-24 space-y-24">
        <SolutionShowcase
          title="Enterprise-Grade Project Management"
          description="Scale your project management while maintaining clarity and consistency across teams."
          features={[
            {
              title: 'Cross-Team Collaboration',
              description: 'Share templates and context across departments',
            },
            {
              title: 'Advanced Security',
              description: 'Enterprise-grade security and compliance features',
            },
            {
              title: 'Custom Workflows',
              description: "Adapt the system to your organization's needs",
            },
          ]}
          image="/images/solutions/enterprise-dashboard.svg"
        />

        <SolutionShowcase
          title="Agile Development Teams"
          description="Streamline your development process with intelligent planning and context management."
          features={[
            {
              title: 'Sprint Planning',
              description: 'AI-assisted sprint planning and story breakdown',
            },
            {
              title: 'Technical Context',
              description: 'Capture and propagate technical requirements',
            },
            {
              title: 'Integration Ready',
              description: 'Connect with your development tools',
            },
          ]}
          image="/images/solutions/dev-workflow.svg"
          imageLeft={false}
        />
      </div>

      {/* Testimonials */}
      <div className="mt-24">
        <h2 className="text-center text-3xl font-bold">
          What Our Customers Say
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.author} {...testimonial} />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-24 rounded-lg bg-primary p-12 text-primary-foreground">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Ready to Transform Your Projects?
          </h2>
          <p className="mt-4 text-xl opacity-90">
            Join thousands of teams using Spec Tree to deliver better
            projects.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
