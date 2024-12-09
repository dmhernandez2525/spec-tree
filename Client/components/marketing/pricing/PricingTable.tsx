'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icons } from '@/components/shared/icons';
import { ComparisonFeature } from '@/types/pricing';
import { featureComparison } from '@/lib/data/pricing';

interface FeatureComparisonTableProps {
  features?: ComparisonFeature[];
}

export function FeatureComparisonTable({
  features = featureComparison,
}: FeatureComparisonTableProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    'all',
    ...Array.from(new Set(features.map((f) => f.category))),
  ];

  const filteredFeatures =
    selectedCategory === 'all'
      ? features
      : features.filter((f) => f.category === selectedCategory);

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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Features' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
          {filteredFeatures.map((feature) => (
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
                {renderValue(feature.plans.starter)}
              </TableCell>
              <TableCell className="text-center">
                {renderValue(feature.plans.professional)}
              </TableCell>
              <TableCell className="text-center">
                {renderValue(feature.plans.enterprise)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
