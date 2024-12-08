'use client';

import { AccountSettings } from '@/components/settings/AccountSettings';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { PrivacySettings } from '@/components/settings/PrivacySettings';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import Section from '@/components/layout/Section';

export default function SettingsPage() {
  const settingsTabs = [
    {
      value: 'account',
      label: 'Account',
      content: <AccountSettings />,
    },
    {
      value: 'appearance',
      label: 'Appearance',
      content: <AppearanceSettings />,
    },
    {
      value: 'notifications',
      label: 'Notifications',
      content: <NotificationSettings />,
    },
    {
      value: 'privacy',
      label: 'Privacy',
      content: <PrivacySettings />,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      <SettingsLayout tabs={settingsTabs} defaultTab="account" />
    </div>
  );
}
