import React from 'react';
import { useDispatch } from 'react-redux';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { GripVertical } from 'lucide-react';
import { deleteTask, updateTaskField } from '../../../../lib/store/sow-slice';
import { TaskType, TaskFields } from '../../lib/types/work-items';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AccordionContent, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface TaskProps {
  task: TaskType;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

const Task: React.FC<TaskProps> = ({ task, dragHandleProps }) => {
  const dispatch = useDispatch();
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  const handleDelete = () => {
    dispatch(deleteTask(task.id));
  };

  const handleUpdate = (field: TaskFields, newValue: string) => {
    dispatch(
      updateTaskField({
        taskId: task.id,
        field,
        newValue,
      })
    );
  };

  const fields: Array<{ label: TaskFields; type: 'text' | 'textarea' }> = [
    { label: TaskFields.Title, type: 'text' },
    { label: TaskFields.Details, type: 'textarea' },
    { label: TaskFields.Priority, type: 'text' },
    { label: TaskFields.Notes, type: 'textarea' },
  ];

  return (
    <div id={`work-item-${task.id}`} className="transition-all">
      <AccordionTrigger className="hover:bg-slate-50 rounded-lg px-4">
        <CardTitle className="flex justify-between items-center w-full text-sm">
          <div className="flex items-center gap-3">
            {dragHandleProps && (
              <div
                {...dragHandleProps}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-200 rounded"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-4 w-4 text-slate-400" />
              </div>
            )}
            <span className="text-amber-600 font-semibold">Task</span>
            <span className="text-slate-600">{task.title}</span>
          </div>
          <Badge variant="outline" className="ml-4">
            Priority: {task.priority}
          </Badge>
        </CardTitle>
      </AccordionTrigger>

      <AccordionContent>
        <div className="border-l-2 border-l-amber-200 ml-4 mt-2 pl-6 space-y-6 p-4">
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Details</Label>
              <p className="text-sm text-gray-600 mt-1">{task.details}</p>
            </div>
            <div>
              <Label>Priority</Label>
              <p className="text-sm text-gray-600 mt-1">{task.priority}</p>
            </div>
            {task.notes && (
              <div>
                <Label>Notes</Label>
                <p className="text-sm text-gray-600 mt-1">{task.notes}</p>
              </div>
            )}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {fields.map(({ label, type }) => (
                  <div key={label} className="space-y-2">
                    <Label htmlFor={label}>
                      {label.charAt(0).toUpperCase() + label.slice(1)}
                    </Label>
                    {type === 'textarea' ? (
                      <Textarea
                        id={label}
                        value={task[label] || ''}
                        onChange={(e) => handleUpdate(label, e.target.value)}
                        className="min-h-[100px]"
                      />
                    ) : (
                      <Input
                        id={label}
                        type="text"
                        value={task[label] || ''}
                        onChange={(e) => handleUpdate(label, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </AccordionContent>
    </div>
  );
};

export default Task;
