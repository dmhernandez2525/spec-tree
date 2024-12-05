'use client';

import { usePrivacyPageData } from '@/lib/hooks/usePrivacyPageData';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { HeadingSection } from '@/components/shared/HeadingSection';

export default function PrivacyPage() {
  const { privacySections, loading } = usePrivacyPageData();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!privacySections) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          The privacy policy is not available at the moment. Please check back
          later.
        </p>
      </div>
    );
  }

  const { aboutSection, contentSection } = privacySections;

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
