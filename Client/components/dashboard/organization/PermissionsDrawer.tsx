import { useState } from 'react';
import { Organization, OrganizationSubscription } from '@/types/organization';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';

interface Permission {
  id: string;
  name: string;
  description: string;
  roles: {
    owner: boolean;
    admin: boolean;
    manager: boolean;
    member: boolean;
    viewer: boolean;
  };
}

interface PermissionsDrawerProps {
  organization: Organization;
  subscription: OrganizationSubscription | null;
  openPermissions: boolean;
  setOpenPermissions: (open: boolean) => void;
}

const permissions: Permission[] = [
  {
    id: 'manage_members',
    name: 'Manage Members',
    description: 'Invite and remove members from the organization',
    roles: {
      owner: true,
      admin: true,
      manager: true,
      member: false,
      viewer: false,
    },
  },
  {
    id: 'manage_settings',
    name: 'Manage Settings',
    description: 'Modify organization settings and configurations',
    roles: {
      owner: true,
      admin: true,
      manager: false,
      member: false,
      viewer: false,
    },
  },
  {
    id: 'manage_billing',
    name: 'Manage Billing',
    description: 'Access and modify billing settings',
    roles: {
      owner: true,
      admin: true,
      manager: false,
      member: false,
      viewer: false,
    },
  },
  // Add more permissions as needed
];

export function PermissionsDrawer({
  organization: _organization,
  subscription: _subscription,
  openPermissions,
  setOpenPermissions,
}: PermissionsDrawerProps) {
  const [modifiedPermissions, setModifiedPermissions] =
    useState<Permission[]>(permissions);

  const handlePermissionChange = (
    permissionId: string,
    role: string,
    value: boolean
  ) => {
    setModifiedPermissions((prev) =>
      prev.map((permission) => {
        if (permission.id === permissionId) {
          return {
            ...permission,
            roles: {
              ...permission.roles,
              [role]: value,
            },
          };
        }
        return permission;
      })
    );
  };

  return (
    <Sheet open={openPermissions} onOpenChange={setOpenPermissions}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Role Permissions</SheetTitle>
          <SheetDescription>
            Configure permissions for different roles in your organization
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Permission</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Viewer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modifiedPermissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium">
                    <div>
                      {permission.name}
                      <p className="text-xs text-muted-foreground">
                        {permission.description}
                      </p>
                    </div>
                  </TableCell>
                  {Object.entries(permission.roles).map(([role, enabled]) => (
                    <TableCell key={role}>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(permission.id, role, checked)
                        }
                        disabled={role === 'owner'} // Owner permissions cannot be modified
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SheetContent>
    </Sheet>
  );
}
