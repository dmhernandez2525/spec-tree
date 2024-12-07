import React from 'react';
import {
  ExtendedWorkItemType,
  WorkItemTypeTypes,
} from '../../lib/types/work-items';
import { Button } from '@/components/ui/button';
import GlobalContextualInfo from './global-contextual-info-component';
import WorkitemsContextualInfo from './workitems-contextual-info-component';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MainContextualComponentProps {
  workItemType: ExtendedWorkItemType;
  content: 'Global' | 'Work Item';
  workItem?: WorkItemTypeTypes;
}

const MainContextualComponent: React.FC<MainContextualComponentProps> = ({
  workItemType,
  workItem,
  content,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClose = () => setIsOpen(false);

  const getDialogTitle = () => {
    if (content === 'Global') {
      return 'Global Context Refinement';
    }
    return `${workItemType.slice(0, -1)} Context Refinement`;
  };

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          {content === 'Global' ? (
            <GlobalContextualInfo onClose={handleClose} />
          ) : (
            <WorkitemsContextualInfo
              workItemType={workItemType}
              workItem={workItem!}
              onClose={handleClose}
            />
          )}
        </DialogContent>
      </Dialog>
      <Button onClick={() => setIsOpen(true)} className="w-full">
        Open Context Wizard
      </Button>
    </div>
  );
};

export default MainContextualComponent;
