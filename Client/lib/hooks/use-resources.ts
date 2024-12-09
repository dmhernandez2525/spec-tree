// lib/hooks/use-resources.ts
import { useState, useCallback } from 'react';
import { Resource } from '@/types/resources';

export function useResources(initialResources: Resource[]) {
  const [resources, setResources] = useState(initialResources);
  // TODO: use setResources then remove console.log
  console.log(setResources);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filterResources = useCallback(
    (query: string, category: string) => {
      return resources.filter((resource) => {
        const matchesSearch = resource.title
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesCategory =
          category === 'all' || resource.category === category;
        return matchesSearch && matchesCategory;
      });
    },
    [resources]
  );

  const filteredResources = filterResources(searchQuery, selectedCategory);

  return {
    resources: filteredResources,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filterResources,
  };
}
