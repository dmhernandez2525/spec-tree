import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks/use-store';
import { OrganizationMember, OrganizationRole } from '@/types/organization';
import { toast } from 'sonner';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/shared/icons';

const roleOptions: { value: OrganizationRole; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Project Manager' },
  { value: 'member', label: 'Team Member' },
  { value: 'viewer', label: 'Viewer' },
];

export function MemberManagement() {
  const members = useAppSelector((state) => state.organization.members);
  const currentUserRole = useAppSelector(
    (state) => state.auth.organizationRole
  );
  const [memberToRemove, setMemberToRemove] =
    useState<OrganizationMember | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const canManageRoles =
    currentUserRole === 'owner' || currentUserRole === 'admin';

  const handleRoleChange = async (
    memberId: string,
    newRole: OrganizationRole
  ) => {
    // TODO: Remove this console.log statement when we are are using memberId, newRole
    console.log({ memberId, newRole });
    if (!canManageRoles) {
      toast.error("You don't have permission to change member roles");
      return;
    }

    setIsUpdating(true);
    try {
      // TODO: Implement role update API call
      toast.success('Member role updated successfully');
    } catch (error) {
      console.log(`Failed to update member role: ${error}`);

      toast.error('Failed to update member role');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveMember = async (member: OrganizationMember) => {
    if (!canManageRoles) {
      toast.error("You don't have permission to remove members");
      return;
    }

    setMemberToRemove(member);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      // TODO: Implement member removal API call
      toast.success('Member removed successfully');
    } catch (error) {
      console.log(`Failed to remove member: ${error}`);
      toast.error('Failed to remove member');
    } finally {
      setMemberToRemove(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>
          Manage your organizations team members and their roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src="/placeholder-avatar.jpg"
                        alt="User avatar"
                      />
                      <AvatarFallback>
                        {member.userId[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">User Name</p>
                      <p className="text-sm text-muted-foreground">
                        user@example.com
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {canManageRoles ? (
                    <Select
                      defaultValue={member.role}
                      onValueChange={(value) =>
                        handleRoleChange(member.id, value as OrganizationRole)
                      }
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem
                            key={role.value}
                            value={role.value}
                            disabled={role.value === 'owner'}
                          >
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline">
                      {roleOptions.find((r) => r.value === member.role)?.label}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(member.joinedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge>Active</Badge>
                </TableCell>
                <TableCell>
                  {canManageRoles && member.role !== 'owner' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member)}
                    >
                      <Icons.alert className="h-4 w-4" />
                      <span className="sr-only">Remove member</span>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <AlertDialog
          open={!!memberToRemove}
          onOpenChange={() => setMemberToRemove(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this team member? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRemoveMember}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
