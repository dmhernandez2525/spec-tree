'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';
import Link from 'next/link';

export default function EmailConfirmationPage() {
  return (
    <div className="container flex min-h-screen items-center justify-center py-8 md:py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Icons.check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Your Account is Confirmed</h1>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You can now login to your account
          </p>
          <Button asChild className="mt-6">
            <Link href="/login">Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
