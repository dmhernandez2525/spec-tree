import React from 'react';
import { useDispatch } from 'react-redux';
import { deleteTask, updateTaskField } from '../../lib/store/slices/sow-slice';
import { TaskType, TaskFields } from '../../lib/types/work-items';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TaskProps {
  task: TaskType;
}

const Task: React.FC<TaskProps> = ({ task }) => {
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
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Task: {task.title}</span>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <Label>Details</Label>
            <p className="text-sm text-gray-600">{task.details}</p>
          </div>
          <div>
            <Label>Priority</Label>
            <p className="text-sm text-gray-600">{task.priority}</p>
          </div>
          {task.notes && (
            <div>
              <Label>Notes</Label>
              <p className="text-sm text-gray-600">{task.notes}</p>
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
                  <Label htmlFor={label}>{label}</Label>
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
      </CardContent>
    </Card>
  );
};

export default Task;
