'use client';

import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DragOverlayContentProps, WorkItemType } from './types';

const typeColors: Record<WorkItemType, string> = {
  epic: 'border-l-blue-600 bg-blue-50',
  feature: 'border-l-green-600 bg-green-50',
  userStory: 'border-l-purple-600 bg-purple-50',
  task: 'border-l-orange-600 bg-orange-50',
};

const typeLabels: Record<WorkItemType, string> = {
  epic: 'Epic',
  feature: 'Feature',
  userStory: 'Story',
  task: 'Task',
};

export function DragOverlayContent({ item }: DragOverlayContentProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 rounded-md shadow-lg',
        'border-l-4 bg-background',
        'opacity-95',
        typeColors[item.type]
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs font-medium text-muted-foreground uppercase">
        {typeLabels[item.type]}
      </span>
      <span className="font-medium truncate max-w-[300px]">{item.title}</span>
    </div>
  );
}

export default DragOverlayContent;
