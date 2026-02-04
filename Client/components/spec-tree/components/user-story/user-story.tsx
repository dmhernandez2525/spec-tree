import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Droppable, Draggable, DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { GripVertical } from 'lucide-react';
import { RootState, AppDispatch } from '../../../../lib/store';
import {
  deleteUserStory,
  updateUserStoryField,
  addTask,
  requestTasks,
  selectTaskById,
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
import RegenerateFeedback from '../regenerate-feedback';
import generateId from '../../lib/utils/generate-id';
import { calculateTotalTasks } from '../../lib/utils/calculation-utils';
import useActivityLogger from '../../lib/hooks/useActivityLogger';
import CommentsPanel from '../comments';

interface UserStoryProps {
  userStory: UserStoryType;
  feature: FeatureType;
  epic: EpicType;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isReadOnly?: boolean;
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

// _feature and _epic reserved for context propagation and breadcrumb features
const UserStory: React.FC<UserStoryProps> = ({
  userStory,
  feature: _feature,
  epic: _epic,
  dragHandleProps,
  isReadOnly = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const localState = useSelector((state: RootState) => state);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [formState, setFormState] = React.useState<FormState>(initialFormState);
  const { logActivity } = useActivityLogger();

  const tasks = userStory.taskIds?.map((id) => selectTaskById(localState, id));

  const handleUpdateUserStory = (params: {
    field: UserStoryFields;
    newValue: string | Array<{ text: string }>;
    arrayIndex?: number;
    isArrayItem?: boolean;
  }) => {
    if (isReadOnly) return;
    dispatch(
      updateUserStoryField({
        userStoryId: userStory.id,
        ...params,
      })
    );
  };

  // Adapter for useAcceptanceCriteria hook which expects string-based handler
  const handleAcceptanceCriteriaUpdate = (params: {
    field: string;
    newValue: string | string[];
    arrayIndex?: number;
    isArrayItem?: boolean;
  }) => {
    // Convert string[] to Array<{ text: string }> for acceptance criteria
    const convertedValue: string | Array<{ text: string }> = Array.isArray(params.newValue)
      ? params.newValue.map((text) => ({ text }))
      : params.newValue;

    handleUpdateUserStory({
      field: params.field as UserStoryFields,
      newValue: convertedValue,
      arrayIndex: params.arrayIndex,
      isArrayItem: params.isArrayItem,
    });
  };

  const { add, remove, update } = useAcceptanceCriteria(
    userStory.acceptanceCriteria.map((criteria) => criteria.text),
    handleAcceptanceCriteriaUpdate
  );

  const handleGenerateTasks = async (feedback?: string) => {
    if (isReadOnly) return;
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(
        requestTasks({
          userStory,
          state: localState,
          context: feedback,
        })
      );
      logActivity('generated', 'task', `Tasks for ${userStory.title}`);
    } catch (_err) {
      setError('Failed to generate tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (isReadOnly) return;
    dispatch(deleteUserStory(userStory.id));
    logActivity('deleted', 'userStory', userStory.title || 'User story');
  };

  const handleAddTask = () => {
    if (isReadOnly) return;
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
    logActivity('created', 'task', formState.Title || 'New task');
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
    <div id={`work-item-${userStory.id}`} className="transition-all">
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
              <Button
                variant="outline"
                onClick={() => setShowModal(true)}
                disabled={isReadOnly}
              >
                Add Task
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isReadOnly}
              >
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
                          readOnly={isReadOnly}
                          disabled={isReadOnly}
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
                          readOnly={isReadOnly}
                          disabled={isReadOnly}
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
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
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
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                      />
                    </div>

                    <AcceptanceCriteriaList
                      acceptanceCriteria={userStory.acceptanceCriteria}
                      add={add}
                      remove={remove}
                      update={update}
                      isReadOnly={isReadOnly}
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
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
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
                <RegenerateFeedback
                  onRegenerate={handleGenerateTasks}
                  isLoading={isLoading}
                  itemType="tasks"
                  isReadOnly={isReadOnly}
                />
              </div>

              <ContextualQuestions
                content="Work Item"
                workItemType="userStories"
                workItem={userStory}
                isReadOnly={isReadOnly}
              />

              <CommentsPanel
                targetType="userStory"
                targetId={userStory.id}
                targetTitle={userStory.title}
                isReadOnly={isReadOnly}
              />

              <Droppable droppableId={`tasks-${userStory.id}`} type="TASK">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <Accordion type="single" collapsible className="w-full">
                      {tasks?.map((task, i) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={i}
                          isDragDisabled={isReadOnly}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={snapshot.isDragging ? 'opacity-75 bg-white rounded shadow-lg' : ''}
                            >
                              <AccordionItem value={task.id}>
                                <Task
                                  task={task}
                                  dragHandleProps={provided.dragHandleProps}
                                  isReadOnly={isReadOnly}
                                />
                              </AccordionItem>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </Accordion>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
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
                    readOnly={isReadOnly}
                    disabled={isReadOnly}
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
                    readOnly={isReadOnly}
                    disabled={isReadOnly}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleAddTask} disabled={isReadOnly}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserStory;
