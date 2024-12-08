import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const notificationFormSchema = z.object({
  emailNotifications: z.object({
    updates: z.boolean(),
    projectChanges: z.boolean(),
    mentions: z.boolean(),
    teamUpdates: z.boolean(),
  }),
  pushNotifications: z.object({
    taskAssigned: z.boolean(),
    deadlines: z.boolean(),
    mentions: z.boolean(),
    projectUpdates: z.boolean(),
  }),
  emailDigest: z.boolean(),
  desktopNotifications: z.boolean(),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

export function NotificationSettings() {
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: {
        updates: true,
        projectChanges: true,
        mentions: true,
        teamUpdates: false,
      },
      pushNotifications: {
        taskAssigned: true,
        deadlines: true,
        mentions: true,
        projectUpdates: false,
      },
      emailDigest: false,
      desktopNotifications: true,
    },
  });

  function onSubmit(data: NotificationFormValues) {
    toast.success('Notification preferences updated');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how and when you want to be notified
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Email Notifications</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="emailNotifications.updates"
                  render={({ field }) => (
                    // /components/settings/NotificationSettings.tsx (continued)
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Project Changes
                        </FormLabel>
                        <FormDescription>
                          Get notified about important project updates and
                          changes
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
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Push Notifications</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="pushNotifications.taskAssigned"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Task Assignments
                        </FormLabel>
                        <FormDescription>
                          Receive notifications when tasks are assigned to you
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
                  control={form.control}
                  name="pushNotifications.deadlines"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Deadlines</FormLabel>
                        <FormDescription>
                          Get reminded about upcoming deadlines
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
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">General Settings</h3>
              <FormField
                control={form.control}
                name="emailDigest"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Weekly Digest</FormLabel>
                      <FormDescription>
                        Receive a weekly summary of all activities
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
                control={form.control}
                name="desktopNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Desktop Notifications
                      </FormLabel>
                      <FormDescription>
                        Show notifications on your desktop
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
            </div>

            <Button type="submit">Save Preferences</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
