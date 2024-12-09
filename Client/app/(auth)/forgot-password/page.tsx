'use client';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import img from '@/public/spec-tree-icon.svg';

export default function ForgotPasswordPage() {
  return (
    <div className=" flex min-h-screen items-center justify-center py-8 md:py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Image
            src={img.src}
            alt="Spec Tree Logo"
            width={150}
            height={150}
            className="h-20 w-auto"
            priority
          />
          <span className="font-bold text-lg">Spec Tree</span>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
