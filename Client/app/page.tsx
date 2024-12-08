'use client';

import { Hero } from '@/components/marketing/Hero';
import { Features } from '@/components/marketing/Features';
import { Benefits } from '@/components/marketing/Benefits';
import { SampleWorkflows } from '@/components/marketing/SampleWorkflows';
import { ClientSuccess } from '@/components/marketing/ClientSuccess';
import { NewsletterForm } from '@/components/marketing/NewsletterForm';
import { CTASection } from '@/components/marketing/CTASection';
import { ColorHeader } from '@/components/shared/ColorHeader';
import { useHomePageData } from '@/lib/hooks/useHomePageData';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import Section from '@/components/layout/Section';
import { ResultsGraph } from '@/components/marketing/ResultsGraph';

export default function HomePage() {
  const { homeSections, loading } = useHomePageData();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!homeSections) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Failed to load home page data</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <Hero
        data={homeSections?.heroData}
        onScrollDown={() =>
          document
            .getElementById('features')
            ?.scrollIntoView({ behavior: 'smooth' })
        }
      />

      {/* Results Section */}
      <Section className="bg-muted py-16 md:py-24">
        <ResultsGraph />
      </Section>

      {/* Features Section */}
      <section id="features" className="bg-background py-16 md:py-24">
        <Features />
      </section>

      {/* Benefits Section */}
      <section className="bg-muted py-16 md:py-24">
        <Benefits />
      </section>

      {/* Sample Workflows */}
      <section className="bg-background py-16 md:py-24">
        <SampleWorkflows />
      </section>

      {/* Client Success Stories */}
      <section className="bg-muted py-16 md:py-24">
        <ClientSuccess />
      </section>

      {/* Our Mission Section */}
      <section id="ourMission" className="bg-background py-16 md:py-24">
        <Section>
          <ColorHeader
            header={homeSections.ourMissionData?.Header || 'Our Mission'}
            headerColor={homeSections.ourMissionData?.HeaderColor || '#000'}
            textColor="#717D96"
          />
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              {homeSections.ourMissionData?.SubHeader1 ||
                'At our company, our mission is to spark innovation and transform everyday experiences into extraordinary opportunities.'}
            </p>
            <p>
              {homeSections.ourMissionData?.SubHeader2 ||
                'We believe in leveraging cutting-edge technology, user-focused design, and a relentless commitment to quality to empower individuals and organizations across the globe.'}
            </p>
            <p>
              {homeSections.ourMissionData?.SubHeader3 ||
                'By fostering a culture rooted in collaboration, integrity, and continuous growth, we strive to make a lasting, positive impact on the world—one breakthrough at a time.'}
            </p>
          </div>
        </Section>
      </section>

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
    </main>
  );
}
