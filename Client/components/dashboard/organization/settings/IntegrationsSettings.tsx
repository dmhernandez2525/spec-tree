import React, { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Icons } from '@/components/shared/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Icons;
  status: 'connected' | 'disconnected' | 'pending';
  category:
    | 'project-management'
    | 'communication'
    | 'version-control'
    | 'analytics';
  configuration?: Record<string, string>;
  requiredScopes?: string[];
}

const integrations: Integration[] = [
  {
    id: 'github',
    name: 'GitHub',
    description:
      'Connect your GitHub repositories for seamless code integration',
    icon: 'gitHub',
    status: 'disconnected',
    category: 'version-control',
    requiredScopes: ['repo', 'user'],
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Synchronize work items with your Jira projects',
    icon: 'jira',
    status: 'disconnected',
    category: 'project-management',
    requiredScopes: ['read', 'write'],
  },
  {
    id: 'slack',
    name: 'Slack',
    description:
      'Get notifications and updates directly in your Slack channels',
    icon: 'slack',
    status: 'disconnected',
    category: 'communication',
    requiredScopes: ['chat:write', 'channels:read'],
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'Connect your GitLab repositories',
    icon: 'gitLab',
    status: 'disconnected',
    category: 'version-control',
    requiredScopes: ['api', 'read_user'],
  },
  {
    id: 'azure-devops',
    name: 'Azure DevOps',
    description: 'Integrate with Azure DevOps projects and pipelines',
    icon: 'microsoft',
    status: 'disconnected',
    category: 'project-management',
    requiredScopes: ['vso.work', 'vso.code'],
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    description: 'Connect your Bitbucket repositories',
    icon: 'bitbucket',
    status: 'disconnected',
    category: 'version-control',
    requiredScopes: ['repository', 'pullrequest'],
  },
];

const categories = {
  'project-management': 'Project Management',
  communication: 'Communication',
  'version-control': 'Version Control',
  analytics: 'Analytics',
} as const;

export function IntegrationsSettings() {
  const [_activeIntegration, setActiveIntegration] =
    useState<Integration | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesCategory =
      selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleConnect = async (integration: Integration) => {
    setIsConfiguring(true);
    try {
      // TODO: Implement integration connection logic
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulated API call
      toast.success(`Successfully connected to ${integration.name}`);
      integration.status = 'connected';
    } catch {
      toast.error(`Failed to connect to ${integration.name}`);
    } finally {
      setIsConfiguring(false);
      setActiveIntegration(null);
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    try {
      // TODO: Implement integration disconnection logic
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call
      toast.success(`Successfully disconnected from ${integration.name}`);
      integration.status = 'disconnected';
    } catch {
      toast.error(`Failed to disconnect from ${integration.name}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Integrations</h2>
          <p className="text-sm text-muted-foreground">
            Connect Spec Tree with your favorite tools and services
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categories).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[600px] rounded-md border">
        <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredIntegrations.map((integration) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {Icons[integration.icon] &&
                          React.createElement(Icons[integration.icon], {
                            className: 'h-6 w-6',
                          })}
                        <CardTitle>{integration.name}</CardTitle>
                      </div>
                      <Badge
                        variant={
                          integration.status === 'connected'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {integration.status}
                      </Badge>
                    </div>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="text-sm text-muted-foreground">
                        Category: {categories[integration.category]}
                      </div>
                      {integration.status === 'connected' && (
                        <div className="text-sm text-muted-foreground">
                          Connected on {new Date().toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    {integration.status === 'connected' ? (
                      <Button
                        variant="outline"
                        onClick={() => handleDisconnect(integration)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => setActiveIntegration(integration)}
                          >
                            Connect
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Connect to {integration.name}
                            </DialogTitle>
                            <DialogDescription>
                              Configure your {integration.name} integration
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            {integration.requiredScopes && (
                              <div className="rounded-lg border p-4">
                                <h4 className="mb-2 font-medium">
                                  Required Permissions
                                </h4>
                                <ul className="list-inside list-disc space-y-1">
                                  {integration.requiredScopes.map((scope) => (
                                    <li
                                      key={scope}
                                      className="text-sm text-muted-foreground"
                                    >
                                      {scope}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {/* Add integration-specific configuration fields here */}
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setActiveIntegration(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleConnect(integration)}
                              disabled={isConfiguring}
                            >
                              {isConfiguring ? (
                                <>
                                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                  Connecting...
                                </>
                              ) : (
                                'Connect'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}
