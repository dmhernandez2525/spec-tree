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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
    return <div>Loading organization details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleUpgradeSubscription = () => {
    // This will be handled by the SubscriptionManagement component
  };

  const handleUpdateOrganization = async (data: any) => {
    // TODO: Implement organization update
    console.log('Updating organization:', data);
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
        {subscription?.status === 'active' && (
          <Badge variant="outline" className="text-sm">
            {subscription.plan.toUpperCase()} Plan
          </Badge>
        )}
      </div>
      <Tabs defaultValue="members">
        <TabsList className="w-full">
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="sso">Single Sign-On</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
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
            <div className="text-center p-6">
              <p>You dont have permission to manage organization settings.</p>
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
            <div className="text-center p-6">
              <p>You dont have permission to manage SSO settings.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="integrations">
          {canManageSettings ? (
            <IntegrationsSettings />
          ) : (
            <div className="text-center p-6">
              <p>You dont have permission to manage integrations.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
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
    </div>
  );
}
