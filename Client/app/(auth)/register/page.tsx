'use client';

import { useEffect } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAppSelector } from '@/lib/hooks/use-store';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Section from '@/components/layout/Section';

export default function RegisterPage() {
  const user = useAppSelector((state) => state.user.user);

  useEffect(() => {
    if (user) {
      redirect('/user-dashboard');
    }
  }, [user]);

  return (
    <div className=" flex min-h-screen items-center justify-center py-8 md:py-12">
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
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
