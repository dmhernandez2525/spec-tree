'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchPosts } from '@/api/fetchData';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PostAttributes } from '@/types/main';

export function BlogList() {
  const router = useRouter();

  const [blogPosts, setBlogPosts] = useState<PostAttributes[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const data = await fetchPosts();
        if (data && data.data) {
          setBlogPosts(data.data);
        }
        setIsLoading(false);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!blogPosts?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center bg-muted rounded-lg p-8">
        <Image
          src="/images/empty-blog-state.png"
          alt="No blog posts"
          width={200}
          height={200}
          className="mb-6"
        />
        <h2 className="text-2xl font-semibold mb-2">No Blog Posts Yet</h2>
        <p className="text-muted-foreground">
          Check back soon for exciting new content!
        </p>
      </div>
    );
  }

  const FeaturedPost = ({ post }: { post: PostAttributes }) => (
    <Card
      className="cursor-pointer group relative h-[400px] overflow-hidden"
      onClick={() => {
        setIsLoading(true);
        router.push(`/blog/${post.documentId}`);
      }}
    >
      {post.headerImage?.url && (
        <Image
          src={post.headerImage.url}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute bottom-0 p-6 text-white">
        <div className="flex gap-2 mb-3">
          <Badge variant="secondary">
            {format(new Date(post.updatedAt), 'MMM d, yyyy')}
          </Badge>
          {post.category?.name && <Badge>{post.category.name}</Badge>}
        </div>
        <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
        <p className="text-white/80 line-clamp-2">{post.description}</p>
      </div>
    </Card>
  );

  const PostCard = ({ post }: { post: PostAttributes }) => (
    <Card
      className="cursor-pointer group h-full"
      onClick={() => {
        setIsLoading(true);
        router.push(`/blog/${post.documentId}`);
      }}
    >
      <CardHeader>
        <div className="flex gap-2 mb-2">
          <Badge variant="outline">
            {format(new Date(post.updatedAt), 'MMM d, yyyy')}
          </Badge>
          {post.category?.name && <Badge>{post.category.name}</Badge>}
        </div>
        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
          {post.title}
        </h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3">{post.description}</p>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }
  return (
    <div className="space-y-8 p-4 sm:p-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <FeaturedPost post={blogPosts[0]} />
        </div>
        <div className="space-y-8">
          {blogPosts.slice(1, 3).map((post) => (
            <PostCard key={post.documentId} post={post} />
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.slice(3).map((post) => (
          <PostCard key={post.documentId} post={post} />
        ))}
      </div>
    </div>
  );
}
