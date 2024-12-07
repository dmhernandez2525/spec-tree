'use client';

import { useCookiesPageData } from '@/lib/hooks/useCookiesPageData';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { HeadingSection } from '@/components/shared/HeadingSection';
import Section from '@/components/layout/Section';

export default function CookiesPage() {
  const { cookiesSections, loading } = useCookiesPageData();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!cookiesSections) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          The cookie policy is not available at the moment. Please check back
          later.
        </p>
      </div>
    );
  }

  const { aboutSection, contentSection } = cookiesSections;

  return (
    <Section className=" py-8 md:py-12">
      <HeadingSection
        heading={aboutSection?.header}
        description={aboutSection?.subHeader}
      />

      <div className="mt-8">
        <div
          className="prose max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: contentSection }}
        />
      </div>
    </Section>
  );
}
