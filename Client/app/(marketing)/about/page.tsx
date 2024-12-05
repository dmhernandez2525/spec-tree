// app/(marketing)/about/page.tsx
'use client';

import { useAboutPageData } from '@/lib/hooks/useAboutPageData';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { NewsletterForm } from '@/components/marketing/NewsletterForm';
import { HeadingSection } from '@/components/shared/HeadingSection';

export default function AboutPage() {
  const { aboutSections, loading } = useAboutPageData();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!aboutSections) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          There was an error loading the about page data. Please try refreshing
          the page.
        </p>
      </div>
    );
  }

  const {
    aboutSection,
    metricSection,
    newsletterSection,
    mediaContent,
    wysiwyg,
    mediaContentHeader,
  } = aboutSections;

  return (
    <div className="container py-8 md:py-12">
      {/* Main Content */}
      <div className="space-y-8 md:space-y-12">
        {/* About Section */}
        <HeadingSection
          heading={aboutSection?.header}
          description={aboutSection?.subHeader}
        />

        {/* Metrics Section */}
        {metricSection && (
          <div
            className="relative rounded-lg p-12 text-white"
            style={{
              backgroundImage: `linear-gradient(0deg, rgba(0, 43, 122, 0.7), rgba(0, 43, 122, 0.7)), url(${
                metricSection.backgroundImage?.data?.url || ''
              })`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="grid gap-8 md:grid-cols-3">
              {metricSection.cards?.map((card, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-white/60 bg-white/30 p-6 text-center backdrop-blur-lg"
                >
                  <h3 className="text-4xl font-semibold">{card.header}</h3>
                  <p className="mt-4">{card.subHeader}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media Content */}
        {mediaContent?.data?.url && (
          <div className="space-y-6">
            {mediaContentHeader && (
              <h2 className="text-center text-2xl font-bold">
                {mediaContentHeader}
              </h2>
            )}
            <div className="flex justify-center">
              {mediaContent.data.mime.includes('video') ? (
                <video
                  src={mediaContent.data.url}
                  controls
                  autoPlay
                  className="w-full max-w-3xl rounded-lg"
                />
              ) : (
                <img
                  src={mediaContent.data.url}
                  alt={mediaContent.data.alternativeText || 'Media content'}
                  className="w-full max-w-3xl rounded-lg object-cover"
                />
              )}
            </div>
          </div>
        )}

        {/* WYSIWYG Content */}
        {wysiwyg && (
          <div
            className="prose max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: wysiwyg }}
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
