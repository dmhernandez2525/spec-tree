import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../../lib/store';
import {
  deleteUserStory,
  updateUserStoryField,
  addTask,
  requestTasks,
  selectTaskById,
  // addContextualQuestionToWorkItem,
} from '../../../../lib/store/sow-slice';
import {
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
  UserStoryFields,
} from '../../lib/types/work-items';
import Task from '../task';
import { Button } from '@/components/ui/button';
import { CardContent, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '../loading-spinner';
import MetricsDisplay from '../metrics-display';
import AcceptanceCriteriaList from '../acceptance-criteria-list';
import { useAcceptanceCriteria } from '../../lib/hooks/use-acceptance-criteria';
import ContextualQuestions from '../contextual-questions';
import generateId from '../../lib/utils/generate-id';
import { calculateTotalTasks } from '../../lib/utils/calculation-utils';

interface UserStoryProps {
  userStory: UserStoryType;
  feature: FeatureType;
  epic: EpicType;
}

interface FormState {
  Title: string;
  Details: string;
  Priority: number;
  Notes: string;
}

const initialFormState: FormState = {
  Title: '',
  Details: '',
  Priority: 0,
  Notes: '',
};

const UserStory: React.FC<UserStoryProps> = ({ userStory, feature: _feature, epic: _epic }) => {
  // TODO: use _feature and _epic then remove underscore prefix
  const dispatch = useDispatch<AppDispatch>();
  const localState = useSelector((state: RootState) => state);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [formState, setFormState] = React.useState<FormState>(initialFormState);

  const tasks = userStory.taskIds?.map((id) => selectTaskById(localState, id));

  const handleUpdateUserStory = (params: {
    field: UserStoryFields;
    newValue: string | Array<{ text: string }>;
    arrayIndex?: number;
    isArrayItem?: boolean;
  }) => {
    dispatch(
      updateUserStoryField({
        userStoryId: userStory.id,
        ...params,
      })
    );
  };

  const { add, remove, update } = useAcceptanceCriteria(
    userStory.acceptanceCriteria.map((criteria) => criteria.text),
    handleUpdateUserStory as any
  );

  const handleGenerateTasks = async () => {
    setIsLoading(true);
    try {
      await dispatch(
        requestTasks({
          userStory,
          state: localState,
        })
      );
    } catch (_err) {
      setError('Failed to generate tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    dispatch(deleteUserStory(userStory.id));
  };

  const handleAddTask = () => {
    const task: TaskType = {
      id: generateId(),
      title: formState.Title,
      details: formState.Details,
      priority: formState.Priority,
      notes: formState.Notes,
      parentUserStoryId: userStory.id,
      dependentTaskIds: [],
      contextualQuestions: [],
    };

    dispatch(addTask(task));
    setFormState(initialFormState);
    setShowModal(false);
  };

  const metrics = [
    {
      label: 'Story Points',
      value: userStory.points || '0',
    },
    {
      label: 'Tasks',
      value: calculateTotalTasks(localState, userStory),
    },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <AccordionTrigger className="hover:bg-slate-50 rounded-lg px-4">
        <CardTitle className="flex justify-between items-center w-full text-sm">
          <div className="flex items-center gap-3">
            <span className="text-green-600 font-semibold">User Story</span>
            <span className="text-slate-600">{userStory.title}</span>
          </div>
          <MetricsDisplay metrics={metrics} className="ml-4" />
        </CardTitle>
      </AccordionTrigger>

      <AccordionContent>
        <CardContent className="border-l-2 border-l-green-200 ml-4 mt-2 pl-6">
          <div className="space-y-6">
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowModal(true)}>
                Add Task
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete User Story
              </Button>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger>User Story Details</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Role</Label>
                        <Input
                          value={userStory.role}
                          onChange={(e) =>
                            handleUpdateUserStory({
                              field: UserStoryFields.Role,
                              newValue: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Points</Label>
                        <Input
                          type="number"
                          value={userStory.points}
                          onChange={(e) =>
                            handleUpdateUserStory({
                              field: UserStoryFields.Points,
                              newValue: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Action</Label>
                      <Textarea
                        value={userStory.action}
                        onChange={(e) =>
                          handleUpdateUserStory({
                            field: UserStoryFields.Action,
                            newValue: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Goal</Label>
                      <Textarea
                        value={userStory.goal}
                        onChange={(e) =>
                          handleUpdateUserStory({
                            field: UserStoryFields.Goal,
                            newValue: e.target.value,
                          })
                        }
                      />
                    </div>

                    <AcceptanceCriteriaList
                      acceptanceCriteria={userStory.acceptanceCriteria}
                      add={add}
                      remove={remove}
                      update={update}
                    />

                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        value={userStory.notes}
                        onChange={(e) =>
                          handleUpdateUserStory({
                            field: UserStoryFields.Notes,
                            newValue: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Tasks</h3>
                <Button onClick={handleGenerateTasks}>Generate Tasks</Button>
              </div>

              <ContextualQuestions
                content="Work Item"
                workItemType="userStories"
                workItem={userStory}
              />

              <Accordion type="single" collapsible className="w-full">
                {tasks?.map((task) => (
                  <AccordionItem key={task.id} value={task.id}>
                    <Task task={task} />
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </CardContent>
      </AccordionContent>

      {/* Add Task Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {Object.entries(formState).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                {key === 'Details' || key === 'Notes' ? (
                  <Textarea
                    id={key}
                    value={value}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <Input
                    id={key}
                    value={value}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserStory;
