'use client';

import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppSelector } from '@/lib/hooks/use-store';

export default function UserProfile() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user.user);

  // Get user display values with fallbacks for demo mode
  const firstName = user?.firstName || 'Demo';
  const lastName = user?.lastName || 'User';
  const fullName = `${firstName} ${lastName}`.trim();
  const email = user?.email || 'demo@spectree.app';
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'DU';

  return (
    <div className="container mx-auto py-12 px-6 lg:px-12">
      {/* Back Button */}
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => router.push('/user-dashboard')}
      >
        ← Back to Dashboard
      </Button>

      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-8">
        <Avatar className="w-24 h-24">
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{fullName}</h1>
          <p className="text-muted-foreground">{email}</p>
        </div>
      </div>

      {/* Profile Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <div>
            <Label htmlFor="name" className="mb-2 block">
              Name
            </Label>
            <Input id="name" placeholder="Your name" defaultValue={fullName} />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="mb-2 block">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              defaultValue={email}
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="mb-2 block">
              Password
            </Label>
            <Input id="password" type="password" placeholder="********" />
          </div>
        </CardContent>
      </Card>

      {/* Save Changes */}
      <div className="mt-6 flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
