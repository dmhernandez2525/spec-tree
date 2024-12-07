import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Icons } from '@/components/shared/icons';

interface Feature {
  name: string;
  description: string;
  starter: boolean | string;
  professional: boolean | string;
  enterprise: boolean | string;
}

const features: Feature[] = [
  {
    name: 'Team Members',
    description: 'Number of users who can access the system',
    starter: 'Up to 5',
    professional: 'Up to 20',
    enterprise: 'Unlimited',
  },
  {
    name: 'Active Projects',
    description: 'Number of concurrent projects',
    starter: '10',
    professional: 'Unlimited',
    enterprise: 'Unlimited',
  },
  {
    name: 'AI Context Gathering',
    description: 'AI-powered requirements and context collection',
    starter: 'Basic',
    professional: 'Advanced',
    enterprise: 'Premium',
  },
  {
    name: 'Templates',
    description: 'Pre-built and custom project templates',
    starter: 'Pre-built only',
    professional: 'Custom + Pre-built',
    enterprise: 'Enterprise Library',
  },
  {
    name: 'Support',
    description: 'Access to customer support',
    starter: 'Email',
    professional: 'Priority',
    enterprise: 'Dedicated',
  },
  {
    name: 'Integrations',
    description: 'Connect with other tools',
    starter: 'Basic',
    professional: 'Advanced',
    enterprise: 'Custom',
  },
  {
    name: 'Analytics',
    description: 'Project and team analytics',
    starter: false,
    professional: true,
    enterprise: 'Advanced',
  },
  {
    name: 'SSO',
    description: 'Single Sign-On',
    starter: false,
    professional: false,
    enterprise: true,
  },
  {
    name: 'SLA',
    description: 'Service Level Agreement',
    starter: false,
    professional: false,
    enterprise: true,
  },
];

export function PricingTable() {
  const renderValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Icons.check className="mx-auto h-5 w-5 text-primary" />
      ) : (
        <Icons.x className="mx-auto h-5 w-5 text-muted-foreground" />
      );
    }
    return <span className="text-center">{value}</span>;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Feature</TableHead>
          <TableHead className="text-center">Starter</TableHead>
          <TableHead className="text-center">Professional</TableHead>
          <TableHead className="text-center">Enterprise</TableHead>
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
              {renderValue(feature.starter)}
            </TableCell>
            <TableCell className="text-center">
              {renderValue(feature.professional)}
            </TableCell>
            <TableCell className="text-center">
              {renderValue(feature.enterprise)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
