import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import {
  selectCollaborationEnabled,
  selectCollaborationMode,
  setEnabled,
  setMode,
} from '@/lib/store/collaboration-slice';
import type { CollaborationMode } from '@/types/collaboration';

interface CollaborationSettingsProps {
  className?: string;
}

const CollaborationSettings: React.FC<CollaborationSettingsProps> = ({
  className,
}) => {
  const dispatch = useDispatch();
  const isEnabled = useSelector(selectCollaborationEnabled);
  const mode = useSelector(selectCollaborationMode);

  const handleModeChange = (value: string) => {
    if (!value) return;
    dispatch(setMode(value as CollaborationMode));
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between rounded-lg border border-muted p-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Collaboration enabled
          </p>
          <p className="text-xs text-muted-foreground">
            Toggle live collaboration features for this workspace.
          </p>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={(checked) => dispatch(setEnabled(checked))}
          aria-label="Enable collaboration"
        />
      </div>

      <div
        className={cn(
          'space-y-3 rounded-lg border border-muted p-4',
          !isEnabled && 'opacity-60'
        )}
      >
        <Label className="text-sm font-medium">Editing mode</Label>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={handleModeChange}
          className="justify-start"
          disabled={!isEnabled}
        >
          <ToggleGroupItem value="edit" aria-label="Edit mode">
            Edit
          </ToggleGroupItem>
          <ToggleGroupItem value="read-only" aria-label="Read-only mode">
            Read-only
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="text-xs text-muted-foreground">
          Read-only mode prevents edits while still allowing navigation and
          exports.
        </p>
      </div>
    </div>
  );
};

export default CollaborationSettings;
