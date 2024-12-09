'use client';
import { useEffect, useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAppSelector } from '@/lib/hooks/use-store';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import img from '@/public/spec-tree-icon.svg';

export default function LoginPage() {
  const user = useAppSelector((state) => state.user.user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      redirect('/user-dashboard');
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-8 md:py-12">
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
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
