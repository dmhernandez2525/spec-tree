'use client';

import { useOurProcessPageData } from '@/lib/hooks/useOurProcessData';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { NewsletterForm } from '@/components/marketing/NewsletterForm';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function OurProcessPage() {
  const { aboutSections, loading } = useOurProcessPageData();
  const router = useRouter();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!aboutSections) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          The process page is not available at the moment. Please check back
          later.
        </p>
      </div>
    );
  }

  const {
    aboutSection,
    sectionTwo,
    newsletterSection,
    wysiwyg,
    wysiwygSectionTwo,
    button,
  } = aboutSections;

  return (
    <div className="container py-8 md:py-12">
      {/* First Section */}
      <div className="space-y-8">
        <HeadingSection
          heading={aboutSection?.header}
          description={aboutSection?.subHeader}
        />

        {wysiwyg && (
          <div
            className="prose max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: wysiwyg }}
          />
        )}

        {button?.text && (
          <div className="flex justify-center">
            <Button onClick={() => router.push(button.url || '/booking')}>
              {button.text}
            </Button>
          </div>
        )}
      </div>

      {/* Second Section */}
      <div className="mt-16 space-y-8">
        <HeadingSection
          heading={sectionTwo?.header}
          description={sectionTwo?.subHeader}
        />

        {wysiwygSectionTwo && (
          <div
            className="prose max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: wysiwygSectionTwo }}
          />
        )}
      </div>

      {/* Newsletter Section */}
      <div className="mt-16">
        <NewsletterForm data={newsletterSection} />
      </div>
    </div>
  );
}
