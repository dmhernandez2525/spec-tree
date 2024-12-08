'use client';

import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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

export default function UserProfile() {
  const router = useRouter();

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
          <AvatarImage src="/images/avatar-placeholder.png" alt="User Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">John Doe</h1>
          <p className="text-muted-foreground">johndoe@example.com</p>
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
            <Input id="name" placeholder="John Doe" defaultValue="John Doe" />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="mb-2 block">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="johndoe@example.com"
              defaultValue="johndoe@example.com"
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
