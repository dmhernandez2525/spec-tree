import React from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface SnapshotCreateFormProps {
  name: string;
  description: string;
  tags: string;
  milestoneTag: string;
  isMilestone: boolean;
  isReadOnly: boolean;
  isLoading: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onMilestoneTagChange: (value: string) => void;
  onMilestoneToggle: (value: boolean) => void;
  onSubmit: () => void;
}

const SnapshotCreateForm: React.FC<SnapshotCreateFormProps> = ({
  name,
  description,
  tags,
  milestoneTag,
  isMilestone,
  isReadOnly,
  isLoading,
  onNameChange,
  onDescriptionChange,
  onTagsChange,
  onMilestoneTagChange,
  onMilestoneToggle,
  onSubmit,
}) => (
  <div className="space-y-3 rounded-lg border p-4">
    <Label htmlFor="snapshot-name">Snapshot name</Label>
    <Input
      id="snapshot-name"
      value={name}
      onChange={(event) => onNameChange(event.target.value)}
      disabled={isReadOnly}
    />
    <Label htmlFor="snapshot-description">Description</Label>
    <Textarea
      id="snapshot-description"
      value={description}
      onChange={(event) => onDescriptionChange(event.target.value)}
      disabled={isReadOnly}
    />
    <Label htmlFor="snapshot-tags">Tags (comma separated)</Label>
    <Input
      id="snapshot-tags"
      value={tags}
      onChange={(event) => onTagsChange(event.target.value)}
      disabled={isReadOnly}
    />
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Flag className="h-4 w-4" />
        Milestone
      </div>
      <Switch
        checked={isMilestone}
        onCheckedChange={onMilestoneToggle}
        disabled={isReadOnly}
      />
    </div>
    {isMilestone ? (
      <Input
        value={milestoneTag}
        onChange={(event) => onMilestoneTagChange(event.target.value)}
        placeholder="Milestone tag"
        disabled={isReadOnly}
      />
    ) : null}
    <Button
      onClick={onSubmit}
      disabled={!name.trim() || isLoading || isReadOnly}
    >
      Create Snapshot
    </Button>
  </div>
);

export default SnapshotCreateForm;
