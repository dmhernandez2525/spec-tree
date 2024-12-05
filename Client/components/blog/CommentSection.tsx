// components/blog/CommentSection.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { createComment } from '@/api/fetchData';

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user?: {
    name: string;
  };
}

interface CommentSectionProps {
  postId: number;
  initialComments?: Comment[];
}

export function CommentSection({
  postId,
  initialComments = [],
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: '',
    },
  });

  async function onSubmit(values: CommentFormData) {
    setIsSubmitting(true);
    try {
      const response = await createComment(postId.toString(), {
        content: values.content,
        post: postId.toString(),
        user: 'current-user', // Replace with actual user ID
      });

      if (response) {
        setComments((prev) => [...prev, response]);
        form.reset();
        toast.success('Comment posted successfully');
      }
    } catch (error) {
      toast.error('Failed to post comment');
      console.error('Comment submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea placeholder="Add a comment..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold">
                  {comment.user?.name || 'Anonymous'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-muted-foreground">{comment.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
