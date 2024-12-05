// lib/hooks/use-auth.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from './use-store';

export function useAuth() {
  const router = useRouter();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const user = useAppSelector((state) => state.user.user);

  useEffect(() => {
    if (!isLoggedIn && !user) {
      router.push('/login');
    }
  }, [isLoggedIn, user, router]);

  return { isLoggedIn, user };
}
