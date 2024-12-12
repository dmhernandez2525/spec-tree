import React from 'react';
import { Calendar, Tag, Filter } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchFilters, AppStatus, AppTag } from '@/types/app';

interface AppSelectorFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableTags: AppTag[];
  availableCategories: string[];
}

const AppSelectorFilters: React.FC<AppSelectorFiltersProps> = ({
  filters,
  onFiltersChange,
  availableTags,
  availableCategories,
}) => {
  const statusOptions: AppStatus[] = ['draft', 'live', 'archived'];

  const handleStatusChange = (status: AppStatus) => {
    const newStatuses = filters.status?.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...(filters.status || []), status];
    onFiltersChange({ ...filters, status: newStatuses });
  };

  const handleDateRangeChange = (date: Date | undefined, isStart: boolean) => {
    if (!date) return;
    const newDateRange = {
      start: isStart ? date : filters.dateRange?.start || new Date(),
      end: isStart ? filters.dateRange?.end || new Date() : date,
    };
    onFiltersChange({ ...filters, dateRange: newDateRange });
  };

  const handleTagChange = (tagId: string) => {
    const newTags = filters.tags?.includes(tagId)
      ? filters.tags.filter((t) => t !== tagId)
      : [...(filters.tags || []), tagId];
    onFiltersChange({ ...filters, tags: newTags });
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b border-gray-200">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="w-4 h-4 mr-2" />
            Status
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <div className="space-y-2">
            {statusOptions.map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={status}
                  checked={filters.status?.includes(status)}
                  onCheckedChange={() => handleStatusChange(status)}
                />
                <label htmlFor={status} className="text-sm capitalize">
                  {status}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2">
          <div>
            <label className="text-sm font-medium mb-1 block">Start Date</label>
            <CalendarComponent
              mode="single"
              selected={filters.dateRange?.start}
              onSelect={(date) => handleDateRangeChange(date, true)}
              className="rounded-md border"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">End Date</label>
            <CalendarComponent
              mode="single"
              selected={filters.dateRange?.end}
              onSelect={(date) => handleDateRangeChange(date, false)}
              className="rounded-md border"
            />
          </div>
        </PopoverContent>
      </Popover>

      <Select
        value={filters.category}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, category: value })
        }
      >
        <SelectTrigger className="h-8 w-[150px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Categories</SelectLabel>
            {availableCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Tag className="w-4 h-4 mr-2" />
            Tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <div className="space-y-2">
            {availableTags.map((tag) => (
              <div key={tag.id} className="flex items-center space-x-2">
                <Checkbox
                  id={tag.id}
                  checked={filters.tags?.includes(tag.id)}
                  onCheckedChange={() => handleTagChange(tag.id)}
                />
                <label htmlFor={tag.id} className="text-sm flex items-center">
                  <div
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {(filters.status?.length > 0 ||
        filters.tags?.length > 0 ||
        filters.category ||
        filters.dateRange) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-destructive"
          onClick={() =>
            onFiltersChange({
              ...filters,
              status: undefined,
              tags: undefined,
              category: undefined,
              dateRange: undefined,
            })
          }
        >
          Clear Filters
        </Button>
      )}

      <div className="flex gap-1 flex-wrap">
        {filters.status?.map((status) => (
          <Badge key={status} variant="secondary" className="capitalize">
            {status}
          </Badge>
        ))}
        {filters.tags?.map((tagId) => {
          const tag = availableTags.find((t) => t.id === tagId);
          return (
            tag && (
              <Badge
                key={tag.id}
                variant="secondary"
                style={{ backgroundColor: tag.color + '20', color: tag.color }}
              >
                {tag.name}
              </Badge>
            )
          );
        })}
        {filters.category && (
          <Badge variant="secondary">Category: {filters.category}</Badge>
        )}
        {filters.dateRange && (
          <Badge variant="secondary">
            {format(filters.dateRange.start, 'MMM d')} -{' '}
            {format(filters.dateRange.end, 'MMM d')}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default AppSelectorFilters;
