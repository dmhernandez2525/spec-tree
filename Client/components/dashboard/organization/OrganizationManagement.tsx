import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/use-store';
import { fetchOrganizationData } from '@/lib/store/organization-slice';
import { InviteUsers } from './InviteUsers';
import { MemberManagement } from './MemberManagement';
import { SubscriptionManagement } from './SubscriptionManagement';
import { PermissionsDrawer } from './PermissionsDrawer';
import { OrganizationSettings } from './settings/OrganizationSettings';
import { SSOSettings } from './settings/SSOSettings';
import { IntegrationsSettings } from './settings/IntegrationsSettings';
import { AISettings } from './settings/AISettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

import { Icons } from '@/components/shared/icons';

export function OrganizationManagement() {
  const dispatch = useAppDispatch();
  const { currentOrganization, subscription, isLoading, error } =
    useAppSelector((state) => state.organization);
  const [openPermissions, setOpenPermissions] = useState(false);

  const organizationId = useAppSelector((state) => state.auth.organizationId);
  const userRole = 'owner';
  // TODO-p1: Uncomment this line when the organization role is implemented
  // const userRole = useAppSelector((state) => state.auth.organizationRole);

  useEffect(() => {
    if (organizationId) {
      dispatch(fetchOrganizationData(organizationId));
    }
  }, [dispatch, organizationId]);

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[200px] items-center justify-center text-destructive">
        <Icons.alert className="mr-2 h-5 w-5" />
        <span>Error: {error}</span>
      </div>
    );
  }

  const handleUpgradeSubscription = () => {
    // This will be handled by the SubscriptionManagement component
  };

  const handleUpdateOrganization = async (data: any) => {
    // TODO: Implement organization update
    logger.log('Updating organization:', data);
  };

  const canManageSettings = userRole === 'owner' || userRole === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Organization Management
          </h2>
          <p className="text-muted-foreground">
            Manage your organizations settings and team
          </p>
        </div>
        <div className="flex items-center gap-4">
          {subscription?.status === 'active' && (
            <Badge variant="outline" className="text-sm">
              {subscription.plan.toUpperCase()} Plan
            </Badge>
          )}
          {!canManageSettings && (
            <Badge variant="secondary" className="text-sm">
              Limited Access
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="w-full border-b p-0">
          <TabsTrigger value="members" className="relative px-4 py-2">
            <div className="flex items-center gap-2">
              <Icons.users className="h-4 w-4" />
              Team Members
            </div>
          </TabsTrigger>
          <TabsTrigger value="settings" className="relative px-4 py-2">
            <div className="flex items-center gap-2">
              <Icons.settings className="h-4 w-4" />
              Settings
            </div>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="relative px-4 py-2">
            <div className="flex items-center gap-2">
              <Icons.creditCard className="h-4 w-4" />
              Subscription
            </div>
          </TabsTrigger>
          <TabsTrigger value="sso" className="relative px-4 py-2">
            <div className="flex items-center gap-2">
              <Icons.key className="h-4 w-4" />
              SSO
            </div>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="relative px-4 py-2">
            <div className="flex items-center gap-2">
              <Icons.plug className="h-4 w-4" />
              Integrations
            </div>
          </TabsTrigger>
          <TabsTrigger value="ai" className="relative px-4 py-2">
            <div className="flex items-center gap-2">
              <Icons.brain className="h-4 w-4" />
              AI Settings
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          <MemberManagement />
          <InviteUsers
            currentSubscription={{
              seats: subscription?.seats || 0,
              usedSeats: subscription?.usedSeats || 0,
              pricePerSeat: subscription?.pricePerSeat || 0,
            }}
            onUpgradeSubscription={handleUpgradeSubscription}
          />
        </TabsContent>

        <TabsContent value="settings">
          {canManageSettings ? (
            <OrganizationSettings
              organization={currentOrganization}
              onUpdate={handleUpdateOrganization}
            />
          ) : (
            <div className="flex h-[200px] items-center justify-center">
              <p className="text-muted-foreground">
                You dont have permission to manage organization settings
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionManagement />
        </TabsContent>

        <TabsContent value="sso">
          {canManageSettings ? (
            <SSOSettings />
          ) : (
            <div className="flex h-[200px] items-center justify-center">
              <p className="text-muted-foreground">
                You dont have permission to manage SSO settings
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="integrations">
          {canManageSettings ? (
            <IntegrationsSettings />
          ) : (
            <div className="flex h-[200px] items-center justify-center">
              <p className="text-muted-foreground">
                You dont have permission to manage integrations
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai">
          {canManageSettings ? (
            <AISettings />
          ) : (
            <div className="flex h-[200px] items-center justify-center">
              <p className="text-muted-foreground">
                You dont have permission to manage AI settings
              </p>
            </div>
          )}
        </TabsContent>
        {/* Add permission management drawer */}
        {canManageSettings && (
          <>
            <Button
              className="btn btn-primary"
              onClick={() => setOpenPermissions(true)}
            >
              Manage Permissions
            </Button>

            <PermissionsDrawer
              organization={currentOrganization}
              subscription={subscription}
              openPermissions={openPermissions}
              setOpenPermissions={setOpenPermissions}
            />
          </>
        )}
      </Tabs>
    </div>
  );
}
