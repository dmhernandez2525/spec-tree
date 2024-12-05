// app/page.tsx
'use client';

import { Hero } from '@/components/marketing/Hero';
import { OurServices } from '@/components/marketing/OurServices';
import { NewsletterForm } from '@/components/marketing/NewsletterForm';
import { ColorHeader } from '@/components/shared/ColorHeader';
import { useHomePageData } from '@/lib/hooks/useHomePageData';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

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
        data={homeSections.heroData}
        onScrollDown={() =>
          document
            .getElementById('ourMission')
            ?.scrollIntoView({ behavior: 'smooth' })
        }
      />

      {/* Our Mission Section */}
      <section id="ourMission" className="bg-background py-16 md:py-24">
        <div className="container">
          <ColorHeader
            header={homeSections.ourMissionData?.Header}
            headerColor={homeSections.ourMissionData?.HeaderColor}
            textColor="#717D96"
          />
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>{homeSections.ourMissionData?.SubHeader1}</p>
            <p>{homeSections.ourMissionData?.SubHeader2}</p>
            <p>{homeSections.ourMissionData?.SubHeader3}</p>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container">
          <OurServices
            serviceData={homeSections.ourServicesData}
            serviceHeader={homeSections.ourServicesHeader}
          />
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-background py-16 md:py-24">
        <div className="container">
          <ColorHeader
            header={homeSections.OurProcess?.Header}
            headerColor={homeSections.OurProcess?.HeaderColor}
            textColor="#E2E7F0"
            dark
          />
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container max-w-xl">
          <NewsletterForm />
        </div>
      </section>
    </main>
  );
}
