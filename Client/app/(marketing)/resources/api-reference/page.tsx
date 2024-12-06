'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  title: string;
  description: string;
  params?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  response: {
    code: number;
    example: string;
  };
}

interface APISection {
  id: string;
  title: string;
  description: string;
  endpoints: Endpoint[];
}

const apiSections: APISection[] = [
  {
    id: 'authentication',
    title: 'Authentication',
    description: 'Learn how to authenticate your API requests',
    endpoints: [
      {
        id: 'auth-token',
        method: 'POST',
        path: '/api/auth/token',
        title: 'Get Authentication Token',
        description: 'Generate an API token for authenticated requests',
        params: [
          {
            name: 'clientId',
            type: 'string',
            required: true,
            description: 'Your API client ID',
          },
          {
            name: 'clientSecret',
            type: 'string',
            required: true,
            description: 'Your API client secret',
          },
        ],
        response: {
          code: 200,
          example: `{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}`,
        },
      },
    ],
  },
  {
    id: 'epics',
    title: 'Epics',
    description: 'Manage epics in your projects',
    endpoints: [
      {
        id: 'list-epics',
        method: 'GET',
        path: '/api/v1/epics',
        title: 'List Epics',
        description: 'Retrieve a list of all epics in a project',
        params: [
          {
            name: 'projectId',
            type: 'string',
            required: true,
            description: 'ID of the project',
          },
        ],
        response: {
          code: 200,
          example: `{
  "epics": [
    {
      "id": "epic-1",
      "title": "User Authentication",
      "description": "Implement user authentication system",
      "status": "in_progress"
    }
  ],
  "total": 1,
  "page": 1
}`,
        },
      },
    ],
  },
];

const methodColors: Record<Endpoint['method'], string> = {
  GET: 'bg-blue-500',
  POST: 'bg-green-500',
  PUT: 'bg-yellow-500',
  DELETE: 'bg-red-500',
  PATCH: 'bg-purple-500',
};

export default function APIReferencePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState(apiSections[0].id);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="container py-8 md:py-12">
      <HeadingSection
        heading="API Reference"
        description="Complete reference documentation for the Spec Tree API"
        className="mb-12"
      />

      <div className="grid gap-8 lg:grid-cols-[250px,1fr]">
        <aside className="lg:border-r lg:pr-8">
          <div className="sticky top-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search API..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-2">
                {apiSections.map((section) => (
                  <Button
                    key={section.id}
                    variant={
                      selectedSection === section.id ? 'secondary' : 'ghost'
                    }
                    className="w-full justify-start"
                    onClick={() => setSelectedSection(section.id)}
                  >
                    {section.title}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </aside>

        <main className="space-y-8">
          {apiSections
            .filter((section) => section.id === selectedSection)
            .map((section) => (
              <div key={section.id}>
                <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                <p className="text-muted-foreground mb-8">
                  {section.description}
                </p>

                <div className="space-y-6">
                  {section.endpoints.map((endpoint) => (
                    <Card key={endpoint.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <Badge
                            className={`${
                              methodColors[endpoint.method]
                            } text-white`}
                          >
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                        </div>

                        <h3 className="text-xl font-semibold mb-2">
                          {endpoint.title}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          {endpoint.description}
                        </p>

                        {endpoint.params && (
                          <div className="mb-6">
                            <h4 className="font-semibold mb-2">Parameters</h4>
                            <div className="grid gap-2">
                              {endpoint.params.map((param) => (
                                <div
                                  key={param.name}
                                  className="grid grid-cols-[100px,1fr] gap-4 items-center"
                                >
                                  <code className="text-sm">{param.name}</code>
                                  <div>
                                    <span className="text-sm text-muted-foreground">
                                      {param.type}
                                      {param.required && (
                                        <span className="text-red-500 ml-1">
                                          *
                                        </span>
                                      )}
                                      {' - '}
                                      {param.description}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">
                              Response{' '}
                              <Badge variant="outline">
                                {endpoint.response.code}
                              </Badge>
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCopyCode(
                                  endpoint.response.example,
                                  endpoint.id
                                )
                              }
                            >
                              {copiedCode === endpoint.id ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                            <code className="text-sm">
                              {endpoint.response.example}
                            </code>
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </main>
      </div>
    </div>
  );
}
