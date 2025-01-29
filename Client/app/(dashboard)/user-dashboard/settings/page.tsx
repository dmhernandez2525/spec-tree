'use client';

import { AccountSettings } from '@/components/dashboard/settings/AccountSettings';
import { AppearanceSettings } from '@/components/dashboard/settings/AppearanceSettings';
import ThemeConfigurator from '@/components/dashboard/settings/ThemeConfigurator/ThemeConfigurator';
import { NotificationSettings } from '@/components/dashboard/settings/NotificationSettings';
import { PrivacySettings } from '@/components/dashboard/settings/PrivacySettings';
import { SettingsLayout } from '@/components/dashboard/settings/SettingsLayout';

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
      value: 'themeConfigurator',
      label: 'Theme Configurator',
      content: <ThemeConfigurator />,
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
