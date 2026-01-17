'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/shared/icons';
import Link from 'next/link';
import { toast } from 'sonner';
import { confirmEmail, resendConfirmationEmail } from '@/api/fetchData';

type ConfirmationState = 'pending' | 'verifying' | 'success' | 'error';

export default function EmailConfirmationPage() {
  const searchParams = useSearchParams();
  const confirmationToken = searchParams.get('confirmation');

  const [state, setState] = useState<ConfirmationState>(
    confirmationToken ? 'verifying' : 'pending'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (confirmationToken) {
      verifyEmail(confirmationToken);
    }
  }, [confirmationToken]);

  const verifyEmail = async (token: string) => {
    setState('verifying');
    const result = await confirmEmail(token);

    if (result.success) {
      setState('success');
      toast.success('Email verified successfully!');
    } else {
      setState('error');
      setErrorMessage(result.message);
      toast.error(result.message);
    }
  };

  const handleResendEmail = async () => {
    if (!resendEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResending(true);
    const result = await resendConfirmationEmail(resendEmail);

    if (result.success) {
      toast.success('Confirmation email sent! Please check your inbox.');
      setResendEmail('');
    } else {
      toast.error(result.message);
    }
    setIsResending(false);
  };

  // Verifying state - show spinner
  if (state === 'verifying') {
    return (
      <div className="flex min-h-screen items-center justify-center py-8 md:py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <Icons.spinner className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">Verifying Your Email</h1>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please wait while we verify your email address...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (state === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center py-8 md:py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <Icons.check className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">Email Verified!</h1>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <Button asChild className="mt-6 w-full">
              <Link href="/login">Continue to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center py-8 md:py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <Icons.warning className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">Verification Failed</h1>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {errorMessage || 'The verification link is invalid or has expired.'}
            </p>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Need a new verification email?
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                />
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  variant="outline"
                >
                  {isResending ? (
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                  ) : (
                    'Resend'
                  )}
                </Button>
              </div>
            </div>

            <Button asChild variant="ghost" className="mt-4">
              <Link href="/login">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pending state (no token - user just registered)
  return (
    <div className="flex min-h-screen items-center justify-center py-8 md:py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <Icons.mail className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Check Your Email</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We&apos;ve sent a verification link to your email address. Please click the link to verify your account.
          </p>

          <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Didn&apos;t receive the email?</p>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email</li>
              <li>Wait a few minutes and try again</li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Still no email? Request a new one:
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
              />
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                variant="outline"
              >
                {isResending ? (
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                ) : (
                  'Resend'
                )}
              </Button>
            </div>
          </div>

          <Button asChild variant="ghost" className="mt-4">
            <Link href="/login">Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
