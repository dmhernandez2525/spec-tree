'use client';

import { useBlogPageData } from '@/lib/hooks/useBlogPageData';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { BlogList } from '@/components/marketing/blog/BlogList';
import Section from '@/components/layout/Section';

export default function BlogPage() {
  const { blogSections, loading } = useBlogPageData();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Section className=" py-8 md:py-12">
      <HeadingSection
        heading={blogSections?.aboutSection.header}
        description={blogSections?.aboutSection.subHeader}
      />
      <BlogList />
    </Section>
  );
}
