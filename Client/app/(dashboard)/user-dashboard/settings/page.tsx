'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useAppSelector } from '@/lib/hooks/use-store';
import { toast } from 'sonner';

const profileFormSchema = z.object({
  username: z.string().min(2).max(30),
  email: z.string().email(),
  bio: z.string().max(160).optional(),
  urls: z
    .object({
      twitter: z.string().url().optional(),
      github: z.string().url().optional(),
      linkedin: z.string().url().optional(),
    })
    .optional(),
});

const notificationFormSchema = z.object({
  marketing_emails: z.boolean(),
  security_emails: z.boolean(),
  project_updates: z.boolean(),
  team_invites: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function SettingsPage() {
  const user = useAppSelector((state) => state.user.user);
  const [activeTab, setActiveTab] = useState('profile');

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      bio: '',
      urls: {
        twitter: '',
        github: '',
        linkedin: '',
      },
    },
  });

  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      marketing_emails: true,
      security_emails: true,
      project_updates: true,
      team_invites: true,
    },
  });

  async function onProfileSubmit(data: ProfileFormValues) {
    try {
      // Handle profile update
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  }

  async function onNotificationSubmit(data: NotificationFormValues) {
    try {
      // Handle notification settings update
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error('Failed to update notification settings');
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 p-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={profileForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Save Changes</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form
                    onSubmit={notificationForm.handleSubmit(
                      onNotificationSubmit
                    )}
                    className="space-y-6"
                  >
                    <FormField
                      control={notificationForm.control}
                      name="marketing_emails"
                      render={({ field }) => (
                        <FormItem className="flex justify-between items-center">
                          <div>
                            <FormLabel>Marketing Emails</FormLabel>
                            <FormDescription>
                              Receive emails about new features and updates
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="security_emails"
                      render={({ field }) => (
                        <FormItem className="flex justify-between items-center">
                          <div>
                            <FormLabel>Security Updates</FormLabel>
                            <FormDescription>
                              Receive important security notifications
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Save Preferences</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="security">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Change your password
                  </p>
                  <Button variant="outline">Change Password</Button>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Sessions</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your active sessions
                  </p>
                  <Button variant="outline">View Sessions</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
