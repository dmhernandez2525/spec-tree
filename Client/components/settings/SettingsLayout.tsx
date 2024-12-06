import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface SettingsLayoutProps {
  defaultTab?: string;
  tabs: {
    value: string;
    label: string;
    content: React.ReactNode;
  }[];
  className?: string;
}

export function SettingsLayout({
  defaultTab,
  tabs,
  className,
}: SettingsLayoutProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <Tabs defaultValue={defaultTab || tabs[0].value} className="space-y-6">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex-1">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
