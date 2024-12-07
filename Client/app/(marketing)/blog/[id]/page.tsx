'use client';

import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { BlogPost } from '@/components/blog/BlogPost';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchPostsById } from '@/api/fetchData';
import { PostAttributes } from '@/types/main';
import Section from '@/components/layout/Section';

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<PostAttributes | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetchPostsById(params.id);
        setPost(response?.data || null);
      } catch (error) {
        console.error('Failed to fetch blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Blog post not found.</p>
      </div>
    );
  }

  return (
    <Section className=" py-8 md:py-12">
      <BlogPost post={post} />
    </Section>
  );
}
