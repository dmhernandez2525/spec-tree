import React from 'react';
import { useSelector } from 'react-redux';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  selectCollaborationActivity,
  selectCollaborationEnabled,
  selectCollaborationMode,
} from '@/lib/store/collaboration-slice';
import type { PresenceUser } from '@/types/collaboration';
import PresenceIndicator from './presence-indicator';
import CollaborationSettings from './collaboration-settings';
import ActivityFeed from './activity-feed';

interface CollaborationPanelProps {
  presenceUsers: PresenceUser[];
  className?: string;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  presenceUsers,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const activity = useSelector(selectCollaborationActivity);
  const isEnabled = useSelector(selectCollaborationEnabled);
  const mode = useSelector(selectCollaborationMode);

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <PresenceIndicator users={presenceUsers} />
      <div className="flex items-center gap-2">
        <Badge variant={mode === 'read-only' ? 'secondary' : 'default'}>
          {mode === 'read-only' ? 'Read-only' : 'Editing'}
        </Badge>
        {!isEnabled && (
          <Badge variant="outline" className="text-xs">
            Disabled
          </Badge>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          Collaboration
        </Button>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Collaboration</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <PresenceIndicator users={presenceUsers} />
            <Tabs defaultValue="settings">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="settings" className="mt-4">
                <CollaborationSettings />
              </TabsContent>
              <TabsContent value="activity" className="mt-4">
                <ScrollArea className="h-[420px] pr-2">
                  <ActivityFeed items={activity} />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CollaborationPanel;
