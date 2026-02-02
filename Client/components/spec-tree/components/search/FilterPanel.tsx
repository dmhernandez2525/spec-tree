/**
 * Filter Panel Component
 *
 * F1.1.20 - Search and filter
 *
 * Provides advanced filtering options for work items.
 */

import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { SearchableWorkItemType } from '../../lib/hooks/useWorkItemSearch';

/**
 * Filter configuration
 */
export interface FilterConfig {
  /** Selected work item types */
  types: SearchableWorkItemType[];
  /** Case sensitive search */
  caseSensitive?: boolean;
  /** Search in titles only */
  titlesOnly?: boolean;
}

/**
 * Props for FilterPanel component
 */
export interface FilterPanelProps {
  /** Current filter configuration */
  filters: FilterConfig;
  /** Callback when filters change */
  onFiltersChange: (filters: FilterConfig) => void;
  /** Number of active filters */
  activeFilterCount?: number;
  /** Additional class names */
  className?: string;
}

/**
 * Type info for display
 */
const typeInfo: Record<SearchableWorkItemType, { label: string; color: string }> = {
  epic: { label: 'Epics', color: 'bg-blue-100 text-blue-800' },
  feature: { label: 'Features', color: 'bg-purple-100 text-purple-800' },
  userStory: { label: 'User Stories', color: 'bg-green-100 text-green-800' },
  task: { label: 'Tasks', color: 'bg-amber-100 text-amber-800' },
};

/**
 * FilterPanel Component
 *
 * Provides a slide-out panel with advanced filter options.
 */
export function FilterPanel({
  filters,
  onFiltersChange,
  activeFilterCount = 0,
  className,
}: FilterPanelProps) {
  const [open, setOpen] = React.useState(false);

  const handleTypeToggle = (type: SearchableWorkItemType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];

    onFiltersChange({
      ...filters,
      types: newTypes,
    });
  };

  const handleSelectAllTypes = () => {
    onFiltersChange({
      ...filters,
      types: ['epic', 'feature', 'userStory', 'task'],
    });
  };

  const handleClearTypes = () => {
    onFiltersChange({
      ...filters,
      types: [],
    });
  };

  const handleReset = () => {
    onFiltersChange({
      types: ['epic', 'feature', 'userStory', 'task'],
      caseSensitive: false,
      titlesOnly: false,
    });
  };

  const allTypesSelected = filters.types.length === 4;
  const noTypesSelected = filters.types.length === 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className={cn('relative', className)}>
          <Filter className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </SheetTitle>
          <SheetDescription>
            Refine your search by selecting which types of items to include.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Work Item Types */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Work Item Types</Label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllTypes}
                  disabled={allTypesSelected}
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearTypes}
                  disabled={noTypesSelected}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(typeInfo) as SearchableWorkItemType[]).map((type) => (
                <label
                  key={type}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    filters.types.includes(type)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  )}
                >
                  <Checkbox
                    checked={filters.types.includes(type)}
                    onCheckedChange={() => handleTypeToggle(type)}
                  />
                  <div className="flex-1">
                    <Badge className={typeInfo[type].color} variant="secondary">
                      {typeInfo[type].label}
                    </Badge>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Separator />

          {/* Search Options */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Search Options</Label>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={filters.caseSensitive ?? false}
                  onCheckedChange={(checked) =>
                    onFiltersChange({
                      ...filters,
                      caseSensitive: checked === true,
                    })
                  }
                />
                <div>
                  <div className="text-sm font-medium">Case Sensitive</div>
                  <div className="text-xs text-muted-foreground">
                    Match exact letter casing
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={filters.titlesOnly ?? false}
                  onCheckedChange={(checked) =>
                    onFiltersChange({
                      ...filters,
                      titlesOnly: checked === true,
                    })
                  }
                />
                <div>
                  <div className="text-sm font-medium">Titles Only</div>
                  <div className="text-xs text-muted-foreground">
                    Only search in item titles
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <X className="h-4 w-4" />
            Reset Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default FilterPanel;
