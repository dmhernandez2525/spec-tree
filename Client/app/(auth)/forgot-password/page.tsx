'use client';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  return (
    <div className="container flex min-h-screen items-center justify-center py-8 md:py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={150}
            height={150}
            className="mx-auto"
            priority
          />
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
