import React from 'react';
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
  Clock,
  Activity,
  Hash,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ViewMode, SortOption } from '@/types/app';

interface AppToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSort: (option: SortOption) => void;
  currentSort: SortOption;
}

const AppToolbar: React.FC<AppToolbarProps> = ({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  onSort,
  currentSort,
}) => {
  const sortOptions: SortOption[] = [
    { label: 'Name', value: 'name', direction: 'asc' },
    { label: 'Last Modified', value: 'modified', direction: 'desc' },
    { label: 'Created Date', value: 'created', direction: 'desc' },
    { label: 'Most Accessed', value: 'access', direction: 'desc' },
    { label: 'Health Status', value: 'health', direction: 'desc' },
  ];

  return (
    <div className="flex items-center justify-between space-x-4 p-4 border-b">
      <div className="flex-1 flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search apps, tags, or descriptions..."
            className="pl-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {currentSort.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onSort(option)}
                className="flex items-center"
              >
                {option.value === 'modified' && (
                  <Clock className="h-4 w-4 mr-2" />
                )}
                {option.value === 'access' && <Hash className="h-4 w-4 mr-2" />}
                {option.value === 'health' && (
                  <Activity className="h-4 w-4 mr-2" />
                )}
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center space-x-1 border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="px-2"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="px-2"
          >
            <ListIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppToolbar;
