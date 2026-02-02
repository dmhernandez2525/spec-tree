/**
 * Template Picker Dialog Component
 *
 * F1.1.18 - Template system foundation
 *
 * Provides a dialog for browsing and selecting templates.
 */

import React, { useState, useMemo } from 'react';
import { Files, Search, BookMarked, Tag, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  WorkItemTemplate,
  TemplateWorkItemType,
  getTemplateTypeDisplayName,
} from '../../lib/hooks/useWorkItemTemplate';

/**
 * Props for TemplatePickerDialog component
 */
export interface TemplatePickerDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Available templates */
  templates: WorkItemTemplate[];
  /** Filter to a specific type (optional) */
  filterType?: TemplateWorkItemType;
  /** Callback when a template is selected */
  onSelect: (template: WorkItemTemplate) => void;
  /** Callback when a template is deleted */
  onDelete?: (templateId: string) => void;
  /** Callback when a template is duplicated */
  onDuplicate?: (templateId: string) => void;
  /** Title override */
  title?: string;
  /** Description override */
  description?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Color mapping for template types
 */
const typeColors: Record<TemplateWorkItemType, string> = {
  epic: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  feature: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  userStory: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  task: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
};

/**
 * Template card component
 */
function TemplateCard({
  template,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  template: WorkItemTemplate;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      className={cn(
        'p-4 rounded-lg border cursor-pointer transition-all',
        'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary',
        isSelected ? 'border-primary bg-primary/5 shadow-md' : 'border-border'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium truncate">{template.name}</h4>
            {template.isBuiltIn && (
              <Badge variant="outline" className="text-xs shrink-0">
                Built-in
              </Badge>
            )}
          </div>
          {template.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {template.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn('text-xs', typeColors[template.type])}>
              {getTemplateTypeDisplayName(template.type)}
            </Badge>
            {template.category && (
              <Badge variant="secondary" className="text-xs">
                {template.category}
              </Badge>
            )}
          </div>
          {template.tags && template.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <Tag className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {template.tags.join(', ')}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          {onDuplicate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              title="Duplicate template"
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
          {onDelete && !template.isBuiltIn && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete template"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * TemplatePickerDialog Component
 *
 * Dialog for browsing, searching, and selecting templates.
 */
export function TemplatePickerDialog({
  open,
  onOpenChange,
  templates,
  filterType,
  onSelect,
  onDelete,
  onDuplicate,
  title = 'Choose Template',
  description = 'Select a template to start with pre-defined content.',
  className,
}: TemplatePickerDialogProps) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<TemplateWorkItemType | 'all'>(
    filterType || 'all'
  );
  const [selectedTemplate, setSelectedTemplate] = useState<WorkItemTemplate | null>(null);

  // Filter templates by search and type
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter((t) => t.type === selectedType);
    } else if (filterType) {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    // Filter by search
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(lowerSearch) ||
          t.description?.toLowerCase().includes(lowerSearch) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(lowerSearch))
      );
    }

    return filtered;
  }, [templates, selectedType, filterType, search]);

  // Group templates by category
  const groupedTemplates = useMemo(() => {
    const groups: Record<string, WorkItemTemplate[]> = {};

    for (const template of filteredTemplates) {
      const category = template.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(template);
    }

    return groups;
  }, [filteredTemplates]);

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      onOpenChange(false);
      setSelectedTemplate(null);
      setSearch('');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedTemplate(null);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-lg', className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Files className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Type filter tabs (only show if not filtering to specific type) */}
        {!filterType && (
          <Tabs
            value={selectedType}
            onValueChange={(v) => setSelectedType(v as TemplateWorkItemType | 'all')}
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="epic">Epic</TabsTrigger>
              <TabsTrigger value="feature">Feature</TabsTrigger>
              <TabsTrigger value="userStory">Story</TabsTrigger>
              <TabsTrigger value="task">Task</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Templates list */}
        <ScrollArea className="h-[300px] pr-4">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookMarked className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {search ? 'No templates match your search' : 'No templates available'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {categoryTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        isSelected={selectedTemplate?.id === template.id}
                        onSelect={() => setSelectedTemplate(template)}
                        onDelete={onDelete ? () => onDelete(template.id) : undefined}
                        onDuplicate={onDuplicate ? () => onDuplicate(template.id) : undefined}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedTemplate}>
            Use Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TemplatePickerDialog;
