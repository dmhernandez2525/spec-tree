'use client';

import { useBlogPageData } from '@/lib/hooks/useBlogPageData';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { BlogList } from '@/components/blog/BlogList';

export default function BlogPage() {
  const { blogSections, loading } = useBlogPageData();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container py-8 md:py-12">
      <HeadingSection
        heading={blogSections?.aboutSection.header}
        description={blogSections?.aboutSection.subHeader}
      />
      <BlogList />
    </div>
  );
}
