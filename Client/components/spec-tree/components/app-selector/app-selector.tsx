import React, { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { ScrollArea } from '@/components/ui/scroll-area';
import { setSow } from '@/lib/store/sow-slice';
import { AppExtended, SearchFilters, SortOption, ViewMode } from '@/types/app';
import AppCard from './AppCard';
import AppToolbar from './AppToolbar';
import AppSelectorFilters from './AppSelectorFilters';
import {
  filterApps,
  sortApps,
  getFavoriteApps,
} from '../../lib/utils/app-utils';

interface AppSelectorProps {
  apps: AppExtended[];
  setSelectedApp: (id: string | null) => void;
  selectedApp: string | null;
  onAppCreated: () => Promise<void>;
}

const AppSelector: React.FC<AppSelectorProps> = ({
  apps,
  setSelectedApp,
  selectedApp,
  onAppCreated: _onAppCreated,
}) => {
  const dispatch = useDispatch();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchQuery: '',
  });
  const [currentSort, setCurrentSort] = useState<SortOption>({
    label: 'Last Modified',
    value: 'modified',
    direction: 'desc',
  });

  // Get unique categories and tags from apps
  const availableCategories = useMemo(() => {
    return Array.from(new Set(apps.map((app) => app.category).filter(Boolean)));
  }, [apps]);

  const availableTags = useMemo(() => {
    const tagMap = new Map();
    apps.forEach((app) => {
      app?.tags?.forEach((tag) => {
        tagMap.set(tag.id, tag);
      });
    });
    return Array.from(tagMap.values());
  }, [apps]);

  // Filter and sort apps
  const processedApps = useMemo(() => {
    let result = filterApps(apps, searchFilters);
    result = sortApps(result, currentSort);

    // Move favorites to top
    const favorites = getFavoriteApps(result);
    const nonFavorites = result.filter((app) => !app.isFavorite);

    return [...favorites, ...nonFavorites];
  }, [apps, searchFilters, currentSort]);

  const handleAppSelect = (id: string | null) => {
    setSelectedApp(id);
    dispatch(setSow({ id }));
  };

  const handleToggleFavorite = (_appId: string) => {
    // This would typically be handled through your state management system
  };

  const handleToggleExpand = (_appId: string) => {
    // This would typically be handled through your state management system
  };

  const handleArchive = (_appId: string) => {
    // This would typically be handled through your state management system
  };

  return (
    <div className="flex flex-col h-full">
      <AppToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchFilters.searchQuery}
        onSearchChange={(query) =>
          setSearchFilters({ ...searchFilters, searchQuery: query })
        }
        onSort={setCurrentSort}
        currentSort={currentSort}
      />

      <AppSelectorFilters
        filters={searchFilters}
        onFiltersChange={setSearchFilters}
        availableTags={availableTags}
        availableCategories={availableCategories}
      />

      <ScrollArea className="flex-1 px-4">
        <div
          className={`
            grid gap-4 py-4
            ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }
          `}
        >
          {processedApps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              isSelected={selectedApp === app.documentId}
              viewMode={viewMode}
              onSelect={handleAppSelect}
              onToggleFavorite={handleToggleFavorite}
              onToggleExpand={handleToggleExpand}
              onArchive={handleArchive}
            />
          ))}
        </div>

        {processedApps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-gray-900">No apps found</p>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default AppSelector;
