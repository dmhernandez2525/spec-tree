import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Droppable, Draggable, DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { GripVertical } from 'lucide-react';
import { RootState, AppDispatch } from '../../../../lib/store';
import {
  deleteFeature,
  requestUserStories,
  updateFeatureField,
  addUserStory,
  selectUserStoryById,
} from '../../../../lib/store/sow-slice';
import {
  EpicType,
  FeatureType,
  UserStoryType,
  FeatureFields,
} from '../../lib/types/work-items';
import UserStory from '../user-story';
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
import useActivityLogger from '../../lib/hooks/useActivityLogger';
import CommentsPanel from '../comments';
import ActiveCursors from '../collaboration/active-cursors';
import {
  calculateTotalTasks,
  calculateTotalUserStories,
} from '../../lib/utils/calculation-utils';
import calculateTotalPoints from '../../lib/utils/calculate-total-points';
import type { PresenceUser } from '@/types/collaboration';

interface FeatureProps {
  feature: FeatureType;
  epic: EpicType;
  index: number;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isReadOnly?: boolean;
  presenceUsers?: PresenceUser[];
  currentUserId?: string;
  onActiveItem?: (itemId: string) => void;
}

interface FormState {
  Title: string;
  Goal: string;
  DevelopmentOrder: string;
  Role: string;
  ActionStr: string;
  AcceptanceCriteria: string[];
  Notes: string;
  Points: string;
}

const initialFormState: FormState = {
  Title: '',
  Goal: '',
  DevelopmentOrder: '0',
  Role: '',
  ActionStr: '',
  AcceptanceCriteria: [''],
  Notes: '',
  Points: '',
};

// _index reserved for drag-and-drop reordering feature
const Feature: React.FC<FeatureProps> = ({
  feature,
  epic,
  index: _index,
  dragHandleProps,
  isReadOnly = false,
  presenceUsers = [],
  currentUserId,
  onActiveItem,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const localState = useSelector((state: RootState) => state);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [formState, setFormState] = React.useState<FormState>(initialFormState);
  const { logActivity } = useActivityLogger();

  const userStories = feature.userStoryIds?.map((id) =>
    selectUserStoryById(localState, id)
  );

  const handleUpdateFeature = (params: {
    field: FeatureFields;
    newValue: string | Array<{ text: string }>;
    arrayIndex?: number;
    isArrayItem?: boolean;
  }) => {
    if (isReadOnly) return;
    dispatch(
      updateFeatureField({
        featureId: feature.id,
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

    handleUpdateFeature({
      field: params.field as FeatureFields,
      newValue: convertedValue,
      arrayIndex: params.arrayIndex,
      isArrayItem: params.isArrayItem,
    });
  };

  const { add, remove, update } = useAcceptanceCriteria(
    feature.acceptanceCriteria.map((criteria) => criteria.text),
    handleAcceptanceCriteriaUpdate
  );

  const handleGenerateUserStories = async (feedback?: string) => {
    if (isReadOnly) return;
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(
        requestUserStories({
          feature,
          state: localState,
          context: feedback,
        })
      );
      logActivity('generated', 'userStory', `User stories for ${feature.title}`);
    } catch (_err) {
      setError('Failed to generate user stories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (isReadOnly) return;
    dispatch(deleteFeature(feature.id));
    logActivity('deleted', 'feature', feature.title || 'Feature');
  };

  const handleAddUserStory = () => {
    if (isReadOnly) return;
    const userStory: UserStoryType = {
      id: generateId(),
      title: formState.Title,
      role: formState.Role,
      action: formState.ActionStr,
      goal: formState.Goal,
      points: formState.Points,
      acceptanceCriteria: [{ text: '' }],
      notes: formState.Notes,
      parentFeatureId: feature.id,
      taskIds: [],
      developmentOrder: parseInt(formState.DevelopmentOrder),
      contextualQuestions: [],
    };

    dispatch(addUserStory(userStory));
    setFormState(initialFormState);
    setShowModal(false);
    logActivity('created', 'userStory', formState.Title || 'New user story');
  };

  const metrics = [
    {
      label: 'Total Points',
      value: calculateTotalPoints(localState, userStories),
    },
    {
      label: 'User Stories',
      value: calculateTotalUserStories(localState, feature),
    },
    {
      label: 'Tasks',
      value: calculateTotalTasks(localState, feature),
    },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div
      id={`work-item-${feature.id}`}
      className="transition-all"
      onFocusCapture={() => onActiveItem?.(feature.id)}
    >
      <AccordionTrigger
        className="hover:bg-slate-50 rounded-lg px-4"
        onClick={() => onActiveItem?.(feature.id)}
      >
        <CardTitle className="flex justify-between items-center w-full text-md">
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
            <span className="text-purple-600 font-semibold">Feature</span>
            <span className="text-slate-600">{feature.title}</span>
            <ActiveCursors
              itemId={feature.id}
              users={presenceUsers}
              currentUserId={currentUserId}
            />
          </div>
          <MetricsDisplay metrics={metrics} className="ml-4" />
        </CardTitle>
      </AccordionTrigger>

      <AccordionContent>
        <CardContent className="border-l-2 border-l-purple-200 ml-4 mt-2 pl-6">
          <div className="space-y-6">
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowModal(true)}
                disabled={isReadOnly}
              >
                Add User Story
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isReadOnly}
              >
                Delete Feature
              </Button>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger>Feature Details</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={feature.title}
                        onChange={(e) =>
                          handleUpdateFeature({
                            field: FeatureFields.Title,
                            newValue: e.target.value,
                          })
                        }
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={feature.description}
                        onChange={(e) =>
                          handleUpdateFeature({
                            field: FeatureFields.Description,
                            newValue: e.target.value,
                          })
                        }
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div>
                      <Label>Details</Label>
                      <Textarea
                        value={feature.details}
                        onChange={(e) =>
                          handleUpdateFeature({
                            field: FeatureFields.Details,
                            newValue: e.target.value,
                          })
                        }
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                      />
                    </div>

                    <AcceptanceCriteriaList
                      acceptanceCriteria={feature.acceptanceCriteria}
                      add={add}
                      remove={remove}
                      update={update}
                      isReadOnly={isReadOnly}
                    />

                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        value={feature.notes}
                        onChange={(e) =>
                          handleUpdateFeature({
                            field: FeatureFields.Notes,
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
                <h3 className="text-lg font-semibold">User Stories</h3>
                <RegenerateFeedback
                  onRegenerate={handleGenerateUserStories}
                  isLoading={isLoading}
                  itemType="user stories"
                  isReadOnly={isReadOnly}
                />
              </div>

              <ContextualQuestions
                content="Work Item"
                workItemType="features"
                workItem={feature}
                isReadOnly={isReadOnly}
              />

              <CommentsPanel
                targetType="feature"
                targetId={feature.id}
                targetTitle={feature.title}
                isReadOnly={isReadOnly}
              />

              <Droppable droppableId={`userStories-${feature.id}`} type="USER_STORY">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <Accordion type="single" collapsible className="w-full">
                      {userStories?.map((userStory, i) => (
                        <Draggable
                          key={userStory.id}
                          draggableId={userStory.id}
                          index={i}
                          isDragDisabled={isReadOnly}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={snapshot.isDragging ? 'opacity-75 bg-white rounded shadow-lg' : ''}
                            >
                              <AccordionItem value={userStory.id}>
                                <UserStory
                                  userStory={userStory}
                                  feature={feature}
                                  epic={epic}
                                  dragHandleProps={provided.dragHandleProps}
                                  isReadOnly={isReadOnly}
                                  presenceUsers={presenceUsers}
                                  currentUserId={currentUserId}
                                  onActiveItem={onActiveItem}
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

      {/* Add User Story Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {Object.entries(formState).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                {key === 'Goal' || key === 'Notes' ? (
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
                    type={
                      key === 'DevelopmentOrder' || key === 'Points'
                        ? 'number'
                        : 'text'
                    }
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
            <Button onClick={handleAddUserStory} disabled={isReadOnly}>
              Add User Story
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Feature;
