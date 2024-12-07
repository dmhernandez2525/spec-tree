'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'code' | 'zip';
  size: string;
  url: string;
}

interface TutorialResourcesProps {
  tutorialId: string;
}

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Getting Started Guide',
    type: 'pdf',
    size: '2.4 MB',
    url: '#',
  },
  {
    id: '2',
    title: 'Sample Project Files',
    type: 'zip',
    size: '4.1 MB',
    url: '#',
  },
  {
    id: '3',
    title: 'Example Code',
    type: 'code',
    size: '156 KB',
    url: '#',
  },
];

const resourceIcons = {
  pdf: Icons.alert,
  code: Icons.alert,
  zip: Icons.alert,
} as const;

export function TutorialResources({ tutorialId }: TutorialResourcesProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Downloadable Resources</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockResources.map((resource) => {
            const Icon = resourceIcons[resource.type];
            return (
              <div
                key={resource.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-muted p-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">{resource.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {resource.size}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Download
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
