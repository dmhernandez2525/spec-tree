// components/features/FeatureComparison.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Icons } from '@/components/shared/icons';

interface ComparisonFeature {
  name: string;
  blueprint: boolean;
  traditional: boolean;
  description: string;
}

const features: ComparisonFeature[] = [
  {
    name: 'AI-Powered Context Gathering',
    blueprint: true,
    traditional: false,
    description:
      'Intelligent system that asks relevant questions based on project type',
  },
  {
    name: 'Automated Work Item Generation',
    blueprint: true,
    traditional: false,
    description:
      'Generate complete project hierarchies from high-level concepts',
  },
  {
    name: 'Context Propagation',
    blueprint: true,
    traditional: false,
    description: 'Automatically sync context across related items',
  },
  {
    name: 'Template System',
    blueprint: true,
    traditional: true,
    description: 'Save and reuse project templates',
  },
  {
    name: 'Integration Capabilities',
    blueprint: true,
    traditional: true,
    description: 'Connect with other project management tools',
  },
  {
    name: 'Analytics & Reporting',
    blueprint: true,
    traditional: true,
    description: 'Track project progress and performance',
  },
];

export function FeatureComparison() {
  return (
    <div>
      <div className="text-center">
        <h2 className="text-3xl font-bold">Why Choose Spec Tree?</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          See how our modern approach compares to traditional project management
          tools
        </p>
      </div>

      <div className="mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Feature</TableHead>
              <TableHead className="text-center">Spec Tree</TableHead>
              <TableHead className="text-center">Traditional Tools</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((feature) => (
              <TableRow key={feature.name}>
                <TableCell className="font-medium">
                  <div>
                    {feature.name}
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {feature.blueprint ? (
                    <div className="flex justify-center">
                      <Icons.check className="h-5 w-5 text-primary" />
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <Icons.x className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {feature.traditional ? (
                    <div className="flex justify-center">
                      <Icons.check className="h-5 w-5 text-primary" />
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <Icons.x className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
