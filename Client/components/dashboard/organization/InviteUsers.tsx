import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/use-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { sendInvite, cancelInvite } from '@/lib/store/organization-slice';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/shared/icons';
import { OrganizationRole } from '@/types/organization';

const userRoles: {
  value: OrganizationRole;
  label: string;
  description: string;
}[] = [
  {
    value: 'admin',
    label: 'Administrator',
    description: 'Full access to all features and settings',
  },
  {
    value: 'manager',
    label: 'Project Manager',
    description: 'Can manage projects and team members',
  },
  {
    value: 'member',
    label: 'Team Member',
    description: 'Basic access to assigned projects',
  },
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'View-only access to projects',
  },
];

const inviteFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'member', 'viewer'] as const),
  message: z.string().optional(),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;

interface InviteUsersProps {
  currentSubscription: {
    seats: number;
    usedSeats: number;
    pricePerSeat: number;
  };
  onUpgradeSubscription: () => void;
}

export function InviteUsers({
  currentSubscription,
  onUpgradeSubscription,
}: InviteUsersProps) {
  const [isInviting, setIsInviting] = useState(false);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const dispatch = useAppDispatch();
  const invites = useAppSelector((state) => state.organization.invites);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: 'member',
      message: '',
    },
  });

  const availableSeats =
    currentSubscription.seats - currentSubscription.usedSeats;

  async function onSubmit(values: InviteFormData) {
    if (availableSeats <= 0) {
      setShowPaymentPrompt(true);
      return;
    }

    setIsInviting(true);
    try {
      await dispatch(
        sendInvite({
          email: values.email!,
          role: values.role,
          message: values.message,
        })
      ).unwrap();
      toast.success('Invitation sent successfully');
      form.reset();
    } catch (error) {
      console.log(`Failed to send invitation: ${error}`);
      toast.error('Failed to send invitation. Please try again.');
    } finally {
      setIsInviting(false);
    }
  }

  async function handleResendInvite(inviteId: string) {
    // TODO: Remove this console.log statement when we are are using inviteId
    console.log({ inviteId });
    try {
      // TODO: Implement resend functionality
      toast.success('Invitation resent successfully');
    } catch (error) {
      console.log(`Failed to resend invitation: ${error}`);
      toast.error('Failed to resend invitation');
    }
  }

  async function handleCancelInvite(inviteId: string) {
    try {
      await dispatch(cancelInvite(inviteId)).unwrap();
      toast.success('Invitation cancelled successfully');
    } catch (error) {
      console.log(`Failed to cancel invitation: ${error}`);
      toast.error('Failed to cancel invitation');
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite Team Members</CardTitle>
          <CardDescription>
            Add new members to your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">Available Seats</h4>
                <p className="text-sm text-muted-foreground">
                  {availableSeats} of {currentSubscription.seats} seats
                  remaining
                </p>
              </div>
              {availableSeats <= 2 && (
                <Button onClick={onUpgradeSubscription} variant="outline">
                  Add More Seats
                </Button>
              )}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="team@example.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {userRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex flex-col">
                              <span>{role.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {role.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Message (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Add a personal message to your invitation..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isInviting || availableSeats <= 0}
              >
                {isInviting ? 'Sending invitation...' : 'Send Invitation'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell>
                      {userRoles.find((r) => r.value === invite.role)?.label}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invite.status === 'pending' ? 'outline' : 'secondary'
                        }
                      >
                        {invite.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(invite.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResendInvite(invite.id)}
                        >
                          <Icons.alert className="h-4 w-4" />
                          <span className="sr-only">Resend</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelInvite(invite.id)}
                        >
                          <Icons.alert className="h-4 w-4" />
                          <span className="sr-only">Cancel</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showPaymentPrompt} onOpenChange={setShowPaymentPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add More Seats</DialogTitle>
            <DialogDescription>
              Youve reached your seat limit. Would you like to add more seats to
              your subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Additional seats are{' '}
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(currentSubscription.pricePerSeat)}{' '}
              per seat per month
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setShowPaymentPrompt(false)}
              >
                Cancel
              </Button>
              <Button onClick={onUpgradeSubscription}>
                Upgrade Subscription
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
