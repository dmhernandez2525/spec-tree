'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardProfile } from './DashboardProfile';
import { DashboardNotifications } from './DashboardNotifications';
import { DashboardSettings } from './DashboardSettings';
import { DashboardOverview } from './DashboardOverview';
import { Card } from '@/components/ui/card';

export function DashboardContent() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="overview" className="space-y-4">
            <DashboardOverview />
          </TabsContent>
          <TabsContent value="profile">
            <Card className="p-6">
              <DashboardProfile />
            </Card>
          </TabsContent>
          <TabsContent value="notifications">
            <Card className="p-6">
              <DashboardNotifications />
            </Card>
          </TabsContent>
          <TabsContent value="settings">
            <Card className="p-6">
              <DashboardSettings />
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
