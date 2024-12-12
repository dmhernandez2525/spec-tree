import { AppExtended, SearchFilters, SortOption } from '@/types/app';

export const filterApps = (
  apps: AppExtended[],
  filters: SearchFilters
): AppExtended[] => {
  return apps.filter((app) => {
    // Status filter
    if (filters.status?.length && !filters.status.includes(app.status)) {
      return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const modifiedDate = new Date(app.modifiedAt);
      if (
        modifiedDate < filters.dateRange.start ||
        modifiedDate > filters.dateRange.end
      ) {
        return false;
      }
    }

    // Tags filter
    if (filters.tags?.length) {
      const appTagIds = app.tags.map((tag) => tag.id);
      if (!filters.tags.some((tagId) => appTagIds.includes(tagId))) {
        return false;
      }
    }

    // Category filter
    if (filters.category && app.category !== filters.category) {
      return false;
    }

    // Search query
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      const inTitle = app.applactionInformation
        .toLowerCase()
        .includes(searchLower);
      const inDescription = app.globalInformation
        .toLowerCase()
        .includes(searchLower);
      const inTags = app.tags.some((tag) =>
        tag.name.toLowerCase().includes(searchLower)
      );
      if (!inTitle && !inDescription && !inTags) {
        return false;
      }
    }

    return true;
  });
};

export const sortApps = (
  apps: AppExtended[],
  sortOption: SortOption
): AppExtended[] => {
  return [...apps].sort((a, b) => {
    const multiplier = sortOption.direction === 'asc' ? 1 : -1;

    switch (sortOption.value) {
      case 'name':
        return (
          multiplier *
          a.applactionInformation.localeCompare(b.applactionInformation)
        );
      case 'modified':
        return (
          multiplier *
          (new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())
        );
      case 'created':
        return (
          multiplier *
          (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
      case 'access':
        return multiplier * (b.accessCount - a.accessCount);
      case 'health':
        return multiplier * (b.metrics.health - a.metrics.health);
      default:
        return 0;
    }
  });
};

export const getFavoriteApps = (apps: AppExtended[]): AppExtended[] => {
  return apps.filter((app) => app.isFavorite);
};

export const getRecentSearches = (): string[] => {
  const searches = localStorage.getItem('recentSearches');
  return searches ? JSON.parse(searches) : [];
};

export const addRecentSearch = (search: string) => {
  const searches = getRecentSearches();
  const newSearches = [search, ...searches.filter((s) => s !== search)].slice(
    0,
    5
  );
  localStorage.setItem('recentSearches', JSON.stringify(newSearches));
};
