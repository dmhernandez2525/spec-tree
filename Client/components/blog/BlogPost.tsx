'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { CommentSection } from '@/components/blog/CommentSection';
import { PostAttributes } from '@/types/main';

interface BlogPostProps {
  post: PostAttributes;
}

export function BlogPost({ post }: BlogPostProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!post) {
    return <div>Blog post not found.</div>;
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-8"
        onClick={() => {
          setIsLoading(true);
          router.push('/blog');
        }}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Blog
      </Button>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="space-y-4 mb-8">
            <div className="flex gap-2">
              <Badge variant="outline">
                {format(new Date(post.updatedAt), 'MMMM d, yyyy')}
              </Badge>
              {post.category?.name && <Badge>{post.category.name}</Badge>}
            </div>
            <h1 className="text-4xl font-bold">{post.title}</h1>
            <p className="text-xl text-muted-foreground">{post.description}</p>
          </div>

          <div
            className="prose prose-blue dark:prose-invert max-w-none mb-16"
            dangerouslySetInnerHTML={{ __html: post.entireBlogPage }}
          />

          <CommentSection postId={post.id} />
        </>
      )}
    </article>
  );
}
