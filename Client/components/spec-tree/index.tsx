'use client';

import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

import AppSelector from './components/app-selector';
import Builder from './components/builder';
import { strapiService } from './lib/api/strapi-service';

import { App } from './lib/types/work-items';
import { AppExtended } from '@/types/app';

/**
 * Convert App to AppExtended with default values for extended properties
 */
const toAppExtended = (app: App): AppExtended => ({
  ...app,
  id: app.documentId || app.name,
  status: 'draft',
  modifiedAt: new Date(),
  tags: [],
  teamMembers: [],
  metrics: { health: 100, uptime: 100, errors24h: 0 },
  isFavorite: false,
  accessCount: 0,
});

export default function SpecTree() {
  return <SpecTreeContent />;
}

function SpecTreeContent() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [chatApi, _setChatApi] = useState<string | null>(null);
  // TODO: use _setChatApi then remove underscore prefix
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for create app dialog and logic
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [applicationInformation, setApplicationInformation] = useState('');
  const [createAppError, setCreateAppError] = useState<string | null>(null);
  const [isCreateAppLoading, setIsCreateAppLoading] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const fetchAppsResponse = await strapiService.fetchApps();
        if (fetchAppsResponse) {
          setApps(fetchAppsResponse);
        }
      } catch (_error) {
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const onAppCreated = async () => {
    const fetchAppsResponse = await strapiService.fetchApps();
    if (fetchAppsResponse) {
      setApps(fetchAppsResponse);
    }
  };

  const handleOpenCreateDialog = () => {
    setApplicationInformation('');
    setCreateAppError(null);
    setIsCreateDialogOpen(true);
  };

  const handleCreateApp = async () => {
    if (!applicationInformation.trim()) {
      setCreateAppError('Please enter application information');
      return;
    }

    setIsCreateAppLoading(true);
    setCreateAppError(null);

    try {
      const newApp = await strapiService.createApp({
        applicationInformation:
          applicationInformation.split('\n')[0] || 'New App',
        globalInformation: applicationInformation,
      });

      setSelectedApp(newApp.documentId || null);
      setIsCreateDialogOpen(false);
      setApplicationInformation('');
      await onAppCreated();
    } catch (err) {
      setCreateAppError(
        err instanceof Error ? err.message : 'Failed to create app'
      );
    } finally {
      setIsCreateAppLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto px-4 py-4 max-w-7xl">
          <div className="flex justify-between items-center">
            {selectedApp && (
              <Button
                variant="outline"
                onClick={() => setSelectedApp(null)}
                className="border-gray-300 hover:border-gray-400 text-gray-700 bg-white hover:bg-gray-50 transition-colors rounded-md"
              >
                Back to App Selector
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 py-6 max-w-full w-full">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg space-y-2 text-center">
              <p className="font-semibold text-gray-700">Loading...</p>
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
          <Card className="w-full bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
            <CardHeader className="p-6 border-b border-gray-200 flex-row justify-between align-middle">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Select an App
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 mt-1">
                Choose an existing app to work with or create a new one
              </CardDescription>
              <div className="flex justify-between items-center">
                <Button
                  variant="default"
                  className="bg-black text-white hover:bg-gray-900 transition-colors rounded-md px-4 py-2 font-medium"
                  onClick={handleOpenCreateDialog}
                >
                  Create New App
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <AppSelector
                selectedApp={selectedApp}
                setSelectedApp={setSelectedApp}
                apps={apps.map(toAppExtended)}
                onAppCreated={onAppCreated}
              />
            </CardContent>
          </Card>
        )}
      </main>
      <Toaster />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Create New App
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label
                htmlFor="applicationInfo"
                className="text-gray-700 font-medium"
              >
                Application Information
              </Label>
              <Textarea
                id="applicationInfo"
                value={applicationInformation}
                onChange={(e) => setApplicationInformation(e.target.value)}
                placeholder="Enter detailed information about your application..."
                className="min-h-[150px]"
              />
            </div>

            {createAppError && (
              <Alert variant="destructive">
                <AlertDescription>{createAppError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter className="space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreateAppLoading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateApp}
              disabled={isCreateAppLoading}
              className="bg-black text-white hover:bg-gray-900 rounded-md"
            >
              {isCreateAppLoading ? 'Creating...' : 'Create App'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
