'use client';

import { useTermsPageData } from '@/lib/hooks/useTermsPageData';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { HeadingSection } from '@/components/shared/HeadingSection';

export default function TermsPage() {
  const { termsSections, loading } = useTermsPageData();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!termsSections) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          The terms of service are not available at the moment. Please check
          back later.
        </p>
      </div>
    );
  }

  const { aboutSection, contentSection } = termsSections;

  return (
    <div className="container py-8 md:py-12">
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
    </div>
  );
}
