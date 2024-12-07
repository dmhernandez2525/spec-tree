'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import AppSelector from './components/app-selector';
import Builder from './components/builder';
import { strapiService } from './lib/api/strapi-service';

import { App } from './lib/types/work-items';
import { setSow } from '../../lib/store/sow-slice';

export default function SpecTree() {
  return <SpecTreeContent />;
}

// Separate component to use Redux hooks
function SpecTreeContent() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [chatApi, setChatApi] = useState<string | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expressUrl, setExpressUrl] = useState<string | null>(null);
  const [apiSettings, setApiSettings] = useState<any>(null);

  // Now useDispatch can be used safely
  const dispatch = useDispatch();

  const handleUpdate = (newValue: string) => {
    setChatApi(newValue);
    dispatch(setSow({ chatApi: newValue }));
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch apps
        const fetchAppsResponse = await strapiService.fetchApps();
        if (fetchAppsResponse) {
          setApps(fetchAppsResponse);
        }

        // Fetch settings
        const settings = await strapiService.getSettings();
        if (settings) {
          setApiSettings(settings.data);
        }

        // Fetch configuration
        const configResponse = await strapiService.getConfig();
        const express_url = configResponse?.data?.config?.expressUrl;
        const configChatApi = configResponse?.data?.config?.chatApi;

        if (express_url) {
          setExpressUrl(express_url);
        }
        if (configChatApi) {
          handleUpdate(configChatApi);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div>
          <div className="flex justify-between items-center">
            {selectedApp && (
              <Button variant="outline" onClick={() => setSelectedApp(null)}>
                Back to App Selector
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg space-y-2">
              <p>Loading...</p>
              <p className="text-sm text-muted-foreground">
                Setting up your workspace
              </p>
            </div>
          </div>
        ) : selectedApp ? (
          <Builder
            chatApi={chatApi || ''}
            setSelectedApp={setSelectedApp}
            selectedApp={selectedApp}
          />
        ) : (
          <Card className=" mx-auto">
            <CardHeader>
              <CardTitle>Select an App</CardTitle>
              <CardDescription>
                Choose an existing app to work with or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppSelector
                selectedApp={selectedApp}
                setSelectedApp={setSelectedApp}
                apps={apps}
                onAppCreated={async () => {
                  // Reload apps after a new app is created
                  const fetchAppsResponse = await strapiService.fetchApps();
                  if (fetchAppsResponse) {
                    setApps(fetchAppsResponse);
                  }
                }}
              />
            </CardContent>
          </Card>
        )}
      </main>
      <Toaster />
    </div>
  );
}
