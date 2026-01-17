import React, { useState, useMemo, useCallback } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
} from '../../lib/types/work-items';

export type WorkItemCategory = 'epics' | 'features' | 'userStories' | 'tasks';

interface SearchFilters {
  categories: WorkItemCategory[];
  searchTerm: string;
}

interface SearchResult {
  type: WorkItemCategory;
  item: EpicType | FeatureType | UserStoryType | TaskType;
  matchedField: string;
  parentPath: string[];
}

interface BuilderSearchProps {
  epics: EpicType[];
  features: Record<string, FeatureType>;
  userStories: Record<string, UserStoryType>;
  tasks: Record<string, TaskType>;
  onResultSelect?: (result: SearchResult) => void;
  onFilterChange?: (filters: SearchFilters) => void;
}

const categoryLabels: Record<WorkItemCategory, string> = {
  epics: 'Epics',
  features: 'Features',
  userStories: 'User Stories',
  tasks: 'Tasks',
};

const categoryColors: Record<WorkItemCategory, string> = {
  epics: 'bg-blue-100 text-blue-800',
  features: 'bg-purple-100 text-purple-800',
  userStories: 'bg-green-100 text-green-800',
  tasks: 'bg-amber-100 text-amber-800',
};

const BuilderSearch: React.FC<BuilderSearchProps> = ({
  epics,
  features,
  userStories,
  tasks,
  onResultSelect,
  onFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategories, setActiveCategories] = useState<WorkItemCategory[]>([
    'epics',
    'features',
    'userStories',
    'tasks',
  ]);
  const [showResults, setShowResults] = useState(false);

  const searchInText = useCallback((text: string, term: string): boolean => {
    if (!text || !term) return false;
    return text.toLowerCase().includes(term.toLowerCase());
  }, []);

  const searchResults = useMemo((): SearchResult[] => {
    if (!searchTerm.trim() || searchTerm.length < 2) return [];

    const results: SearchResult[] = [];
    const term = searchTerm.toLowerCase();

    // Search epics
    if (activeCategories.includes('epics')) {
      epics.forEach((epic) => {
        const matchedFields: string[] = [];
        if (searchInText(epic.title, term)) matchedFields.push('title');
        if (searchInText(epic.description, term)) matchedFields.push('description');
        if (searchInText(epic.goal, term)) matchedFields.push('goal');
        if (searchInText(epic.notes, term)) matchedFields.push('notes');

        if (matchedFields.length > 0) {
          results.push({
            type: 'epics',
            item: epic,
            matchedField: matchedFields.join(', '),
            parentPath: [],
          });
        }
      });
    }

    // Search features
    if (activeCategories.includes('features')) {
      Object.values(features).forEach((feature) => {
        const matchedFields: string[] = [];
        if (searchInText(feature.title, term)) matchedFields.push('title');
        if (searchInText(feature.description, term)) matchedFields.push('description');
        if (searchInText(feature.details, term)) matchedFields.push('details');
        if (searchInText(feature.notes, term)) matchedFields.push('notes');

        if (matchedFields.length > 0) {
          const parentEpic = epics.find((e) => e.featureIds.includes(feature.id));
          results.push({
            type: 'features',
            item: feature,
            matchedField: matchedFields.join(', '),
            parentPath: parentEpic ? [parentEpic.title] : [],
          });
        }
      });
    }

    // Search user stories
    if (activeCategories.includes('userStories')) {
      Object.values(userStories).forEach((story) => {
        const matchedFields: string[] = [];
        if (searchInText(story.title, term)) matchedFields.push('title');
        if (searchInText(story.role, term)) matchedFields.push('role');
        if (searchInText(story.action, term)) matchedFields.push('action');
        if (searchInText(story.goal, term)) matchedFields.push('goal');
        if (searchInText(story.notes, term)) matchedFields.push('notes');

        if (matchedFields.length > 0) {
          const parentFeature = Object.values(features).find((f) =>
            f.userStoryIds.includes(story.id)
          );
          const parentEpic = parentFeature
            ? epics.find((e) => e.featureIds.includes(parentFeature.id))
            : undefined;

          results.push({
            type: 'userStories',
            item: story,
            matchedField: matchedFields.join(', '),
            parentPath: [
              ...(parentEpic ? [parentEpic.title] : []),
              ...(parentFeature ? [parentFeature.title] : []),
            ],
          });
        }
      });
    }

    // Search tasks
    if (activeCategories.includes('tasks')) {
      Object.values(tasks).forEach((task) => {
        const matchedFields: string[] = [];
        if (searchInText(task.title, term)) matchedFields.push('title');
        if (searchInText(task.details, term)) matchedFields.push('details');
        if (searchInText(task.notes, term)) matchedFields.push('notes');

        if (matchedFields.length > 0) {
          const parentStory = Object.values(userStories).find((s) =>
            s.taskIds.includes(task.id)
          );
          const parentFeature = parentStory
            ? Object.values(features).find((f) =>
                f.userStoryIds.includes(parentStory.id)
              )
            : undefined;
          const parentEpic = parentFeature
            ? epics.find((e) => e.featureIds.includes(parentFeature.id))
            : undefined;

          results.push({
            type: 'tasks',
            item: task,
            matchedField: matchedFields.join(', '),
            parentPath: [
              ...(parentEpic ? [parentEpic.title] : []),
              ...(parentFeature ? [parentFeature.title] : []),
              ...(parentStory ? [parentStory.title] : []),
            ],
          });
        }
      });
    }

    return results;
  }, [searchTerm, activeCategories, epics, features, userStories, tasks, searchInText]);

  const handleCategoryToggle = (category: WorkItemCategory) => {
    setActiveCategories((prev) => {
      const newCategories = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category];

      onFilterChange?.({
        categories: newCategories,
        searchTerm,
      });

      return newCategories;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowResults(value.length >= 2);
    onFilterChange?.({
      categories: activeCategories,
      searchTerm: value,
    });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
    onFilterChange?.({
      categories: activeCategories,
      searchTerm: '',
    });
  };

  const handleResultClick = (result: SearchResult) => {
    onResultSelect?.(result);
    setShowResults(false);
  };

  const getItemTitle = (result: SearchResult): string => {
    if ('title' in result.item) {
      return result.item.title;
    }
    return 'Unknown';
  };

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search epics, features, stories, tasks..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(categoryLabels) as WorkItemCategory[]).map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={activeCategories.includes(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
              >
                {categoryLabels[category]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2 border-b">
            <span className="text-sm text-muted-foreground">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </span>
          </div>
          <div className="divide-y">
            {searchResults.map((result, index) => (
              <button
                key={`${result.type}-${result.item.id}-${index}`}
                className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={categoryColors[result.type]} variant="secondary">
                    {categoryLabels[result.type]}
                  </Badge>
                  <span className="font-medium text-sm truncate">
                    {getItemTitle(result)}
                  </span>
                </div>
                {result.parentPath.length > 0 && (
                  <div className="text-xs text-muted-foreground truncate">
                    {result.parentPath.join(' → ')}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  Matched in: {result.matchedField}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showResults && searchTerm.length >= 2 && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 p-4">
          <p className="text-sm text-muted-foreground text-center">
            No results found for &quot;{searchTerm}&quot;
          </p>
        </div>
      )}
    </div>
  );
};

export default BuilderSearch;
export type { SearchResult, SearchFilters };
