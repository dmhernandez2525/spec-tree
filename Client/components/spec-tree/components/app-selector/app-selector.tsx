import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { setSow } from '../../../../lib/store/sow-slice';
import { App } from '../../lib/types/work-items';
import { strapiService } from '../../lib/api/strapi-service';
import Section from '@/components/layout/Section';

interface AppSelectorProps {
  apps: App[];
  setSelectedApp: (id: string | null) => void;
  selectedApp: string | null;
  onAppCreated: () => Promise<void>;
}

const AppSelector: React.FC<AppSelectorProps> = ({
  apps,
  setSelectedApp,
  selectedApp,
  onAppCreated,
}) => {
  const [applicationInformation, setApplicationInformation] =
    useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSelectApp = (id: string | null) => {
    setSelectedApp(id);
    dispatch(setSow({ id }));
  };

  const handleCreateApp = async () => {
    if (!applicationInformation.trim()) {
      setError('Please enter application information');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newApp = await strapiService.createApp({
        applactionInformation:
          applicationInformation.split('\n')[0] || 'New App',
        globalInformation: applicationInformation,
      });

      handleSelectApp(newApp.documentId || null);
      setIsCreateDialogOpen(false);
      setApplicationInformation('');
      await onAppCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create app');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Section className=" mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Select an App to Work With</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Create New App
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => (
            <Card
              key={app.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedApp === app.documentId ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelectApp(app.documentId || null)}
            >
              <CardHeader>
                <CardTitle>{app.applactionInformation}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {app.globalInformation}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  variant={
                    selectedApp === app.documentId ? 'secondary' : 'outline'
                  }
                  className="w-full"
                >
                  {selectedApp === app.documentId ? 'Selected' : 'Select'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New App</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="applicationInfo">Application Information</Label>
                <Textarea
                  id="applicationInfo"
                  value={applicationInformation}
                  onChange={(e) => setApplicationInformation(e.target.value)}
                  placeholder="Enter detailed information about your application..."
                  className="min-h-[150px]"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateApp} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create App'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Section>
  );
};

export default AppSelector;
