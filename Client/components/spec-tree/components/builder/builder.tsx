import React, { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import { RootState, AppDispatch } from '../../../../lib/store';
import {
  selectCollaborationEnabled,
  selectCollaborationMode,
} from '@/lib/store/collaboration-slice';
import {
  addEpics,
  requestAdditionalEpics,
  requestAdditionalFeatures,
  requestUserStories,
  requestTasks,
  selectAllEpics,
  selectAllFeatures,
  selectAllUserStories,
  selectAllTasks,
  selectFeatureById,
  selectUserStoryById,
  reorderEpics,
  reorderFeatures,
  reorderUserStories,
  reorderTasks,
} from '../../../../lib/store/sow-slice';
import { strapiService } from '../../lib/api/strapi-service';
import { logger } from '../../../../lib/logger';
import type { PresenceUser } from '@/types/collaboration';
import {
  EpicType,
  FeatureType,
  UserStoryType,
} from '../../lib/types/work-items';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

import LoadingSpinner from '../loading-spinner';
import MetricsDisplay from '../metrics-display';
import Epic from '../epic';
import ContextualQuestions from '../contextual-questions';
import SowInput from '../sow-input';
import FormatData from '../format-data';
import Config from '../config';
import Chat from '../chat';
import ImportExport from '../import-export';
import Templates from '../templates';
import VersionControl from '../version-control';
import BuilderSearch, { SearchResult } from '../builder-search';
import CollaborationPanel from '../collaboration';
import generateId from '../../lib/utils/generate-id';
import {
  calculateTotalTasks,
  calculateTotalFeatures,
  calculateTotalUserStories,
} from '../../lib/utils/calculation-utils';
import calculateTotalPoints from '../../lib/utils/calculate-total-points';
import useAsyncState from '@/lib/hooks/useAsyncState';
import useCollaborationPresence from '../../lib/hooks/useCollaborationPresence';
import useActivityLogger from '../../lib/hooks/useActivityLogger';
import { dispatchAutoSnapshotEvent } from '../../lib/utils/version-snapshot-events';

interface BuilderProps {
  setSelectedApp: (id: string | null) => void;
  selectedApp: string | null;
  chatApi: string;
}

interface FormState {
  Title: string;
  Description: string;
  Goal: string;
  SuccessCriteria: string;
  Dependencies: string;
  Timeline: string;
  Resources: string;
  Notes: string;
}

const initialFormState: FormState = {
  Title: '',
  Description: '',
  Goal: '',
  SuccessCriteria: '',
  Dependencies: '',
  Timeline: '',
  Resources: '',
  Notes: '',
};

const Builder: React.FC<BuilderProps> = ({
  setSelectedApp,
  selectedApp,
  chatApi,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isAddEpicDialogOpen, setIsAddEpicDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<FormState>(initialFormState);
  const {
    state,
    errorMessage,
    startLoading,
    stopLoading,
    handleError,
    clearError,
  } = useAsyncState();

  // Memoize selectors
  const localState = useSelector((state: RootState) => state);
  const collaborationEnabled = useSelector(selectCollaborationEnabled);
  const collaborationMode = useSelector(selectCollaborationMode);
  const isReadOnly = collaborationEnabled && collaborationMode === 'read-only';
  const currentUser = useSelector((state: RootState) => state.user.user);
  const { logActivity } = useActivityLogger();
  const epics = useSelector(selectAllEpics);
  const features = useSelector(selectAllFeatures);
  const userStories = useSelector(selectAllUserStories);
  const allTasks = useSelector(selectAllTasks);

  const currentPresenceUser = useMemo<PresenceUser>(() => {
    const fullName = [currentUser?.firstName, currentUser?.lastName]
      .filter(Boolean)
      .join(' ');
    return {
      id:
        currentUser?.documentId ||
        (currentUser?.id ? String(currentUser.id) : 'current-user'),
      name: fullName || currentUser?.username || currentUser?.email || 'You',
      color: '#6366f1',
      status: 'active',
      lastActive: new Date().toISOString(),
    };
  }, [
    currentUser?.documentId,
    currentUser?.id,
    currentUser?.firstName,
    currentUser?.lastName,
    currentUser?.username,
    currentUser?.email,
  ]);

  const { presenceUsers, setActiveItem } = useCollaborationPresence({
    currentUser: currentPresenceUser,
  });

  // Convert arrays to records for search component
  const featuresRecord = useMemo(() => {
    return features.reduce((acc, feature) => {
      acc[feature.id] = feature;
      return acc;
    }, {} as Record<string, FeatureType>);
  }, [features]);

  const userStoriesRecord = useMemo(() => {
    return userStories.reduce((acc, story) => {
      acc[story.id] = story;
      return acc;
    }, {} as Record<string, UserStoryType>);
  }, [userStories]);

  const tasksRecord = useMemo(() => {
    return allTasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {} as Record<string, import('../../lib/types/work-items').TaskType>);
  }, [allTasks]);

  const handleSearchResultSelect = useCallback((result: SearchResult) => {
    setActiveItem(result.item.id);
    // Scroll to and highlight the selected item
    const element = document.getElementById(`work-item-${result.item.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
      }, 2000);
    }
  }, [setActiveItem]);

  // Memoize computed values
  const featuresById = useMemo(() => {
    return epics?.reduce((acc, epic) => {
      epic.featureIds.forEach((featureId) => {
        acc[featureId] = selectFeatureById(localState, featureId);
      });
      return acc;
    }, {} as Record<string, FeatureType>);
  }, [epics, localState]);

  const userStoriesById = useMemo(() => {
    return features
      .flatMap((feature) => feature.userStoryIds || [])
      .reduce((acc, userStoryId) => {
        acc[userStoryId] = selectUserStoryById(localState, userStoryId);
        return acc;
      }, {} as Record<string, UserStoryType>);
  }, [features, localState]);

  const handleAddEpics = useCallback(async () => {
    try {
      if (isReadOnly) return;
      startLoading();
      await dispatch(requestAdditionalEpics({ state: localState })).unwrap();
      stopLoading();
      logActivity('generated', 'epic', 'Additional epics');
      dispatchAutoSnapshotEvent({
        eventType: 'batch-generation',
        label: 'Additional epics',
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to generate epics. Please try again.';
      handleError(errorMessage);
    }
  }, [
    dispatch,
    isReadOnly,
    localState,
    logActivity,
    startLoading,
    stopLoading,
    handleError,
  ]);

  const handleAddFeatures = useCallback(async () => {
    try {
      if (isReadOnly) return;
      startLoading();
      await Promise.all(
        epics.map((epic) =>
          dispatch(
            requestAdditionalFeatures({ epic, state: localState })
          ).unwrap()
        )
      );
      stopLoading();
      logActivity('generated', 'feature', 'Additional features');
      dispatchAutoSnapshotEvent({
        eventType: 'batch-generation',
        label: 'Additional features',
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to generate features. Please try again.';
      handleError(errorMessage);
    }
  }, [
    dispatch,
    epics,
    isReadOnly,
    localState,
    logActivity,
    startLoading,
    stopLoading,
    handleError,
  ]);

  const handleAddUserStories = useCallback(async () => {
    try {
      if (isReadOnly) return;
      startLoading();
      await Promise.all(
        epics.flatMap((epic) =>
          epic.featureIds
            .map((featureId) => featuresById[featureId])
            .filter((feature): feature is FeatureType => !!feature)
            .map((feature) =>
              dispatch(
                requestUserStories({ feature, state: localState })
              ).unwrap()
            )
        )
      );
      stopLoading();
      logActivity('generated', 'userStory', 'Additional user stories');
      dispatchAutoSnapshotEvent({
        eventType: 'batch-generation',
        label: 'Additional user stories',
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to generate user stories. Please try again.';
      handleError(errorMessage);
    }
  }, [
    dispatch,
    epics,
    featuresById,
    isReadOnly,
    localState,
    logActivity,
    startLoading,
    stopLoading,
    handleError,
  ]);

  const handleAddTasksToAllUserStories = useCallback(async () => {
    try {
      if (isReadOnly) return;
      startLoading();
      await Promise.all(
        Object.values(userStoriesById)
          .filter((story): story is UserStoryType => !!story)
          .map((userStory) =>
            dispatch(requestTasks({ userStory, state: localState })).unwrap()
          )
      );
      stopLoading();
      logActivity('generated', 'task', 'Additional tasks');
      dispatchAutoSnapshotEvent({
        eventType: 'batch-generation',
        label: 'Additional tasks',
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to generate tasks. Please try again.';
      handleError(errorMessage);
    }
  }, [
    dispatch,
    isReadOnly,
    userStoriesById,
    localState,
    logActivity,
    startLoading,
    stopLoading,
    handleError,
  ]);

  const handleAddEpic = useCallback(() => {
    try {
      if (isReadOnly) return;
      const epic: EpicType = {
        parentAppId: selectedApp,
        id: generateId(),
        title: formState.Title,
        description: formState.Description,
        goal: formState.Goal,
        successCriteria: formState.SuccessCriteria,
        dependencies: formState.Dependencies,
        timeline: formState.Timeline,
        resources: formState.Resources,
        risksAndMitigation: [],
        featureIds: [],
        notes: formState.Notes,
      };
      dispatch(addEpics(epic));
      setFormState(initialFormState);
      setIsAddEpicDialogOpen(false);
      logActivity('created', 'epic', formState.Title || 'New epic');
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to add epic. Please try again.';
      handleError(errorMessage);
    }
  }, [
    dispatch,
    formState,
    isReadOnly,
    selectedApp,
    logActivity,
    handleError,
  ]);

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, type, draggableId } = result;

      if (isReadOnly) return;
      if (!destination) return;
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      // Helper to persist position update to API
      const persistPosition = async (
        itemType: 'epic' | 'feature' | 'userStory' | 'task',
        itemId: string,
        newPosition: number,
        parentId?: string
      ) => {
        try {
          switch (itemType) {
            case 'epic': {
              const epic = localState.sow.epics[itemId];
              const docId = epic?.documentId || itemId;
              await strapiService.updateEpicPosition(docId, newPosition);
              break;
            }
            case 'feature': {
              const feature = localState.sow.features[itemId];
              const docId = feature?.documentId || itemId;
              await strapiService.updateFeaturePosition(docId, newPosition, parentId);
              break;
            }
            case 'userStory': {
              const userStory = localState.sow.userStories[itemId];
              const docId = userStory?.documentId || itemId;
              await strapiService.updateUserStoryPosition(docId, newPosition, parentId);
              break;
            }
            case 'task': {
              const task = localState.sow.tasks[itemId];
              const docId = task?.documentId || itemId;
              await strapiService.updateTaskPosition(docId, newPosition, parentId);
              break;
            }
          }
          logger.log('Builder', `${itemType} position updated`, { itemId, newPosition });
        } catch (error) {
          logger.error('Builder', `Failed to persist ${itemType} position`, { error, itemId });
        }
      };

      switch (type) {
        case 'EPIC':
          dispatch(
            reorderEpics({
              sourceIndex: source.index,
              destinationIndex: destination.index,
            })
          );
          persistPosition('epic', draggableId, destination.index);
          dispatchAutoSnapshotEvent({
            eventType: 'bulk-move',
            label: 'Epic reorder',
          });
          break;
        case 'FEATURE': {
          const epicId = source.droppableId.replace('features-', '');
          dispatch(
            reorderFeatures({
              epicId,
              sourceIndex: source.index,
              destinationIndex: destination.index,
            })
          );
          persistPosition('feature', draggableId, destination.index, epicId);
          dispatchAutoSnapshotEvent({
            eventType: 'bulk-move',
            label: 'Feature reorder',
          });
          break;
        }
        case 'USER_STORY': {
          const featureId = source.droppableId.replace('userStories-', '');
          dispatch(
            reorderUserStories({
              featureId,
              sourceIndex: source.index,
              destinationIndex: destination.index,
            })
          );
          persistPosition('userStory', draggableId, destination.index, featureId);
          dispatchAutoSnapshotEvent({
            eventType: 'bulk-move',
            label: 'User story reorder',
          });
          break;
        }
        case 'TASK': {
          const userStoryId = source.droppableId.replace('tasks-', '');
          dispatch(
            reorderTasks({
              userStoryId,
              sourceIndex: source.index,
              destinationIndex: destination.index,
            })
          );
          persistPosition('task', draggableId, destination.index, userStoryId);
          dispatchAutoSnapshotEvent({
            eventType: 'bulk-move',
            label: 'Task reorder',
          });
          break;
        }
      }
    },
    [dispatch, isReadOnly, localState]
  );

  // Memoize metrics
  const metrics = useMemo(
    () => [
      {
        label: 'Total Project Points',
        value: calculateTotalPoints(localState, userStories),
      },
      {
        label: 'Total Epics',
        value: epics?.length ?? 0,
      },
      {
        label: 'Total Features',
        value: calculateTotalFeatures(epics),
      },
      {
        label: 'Total User Stories',
        value: calculateTotalUserStories(localState, epics),
      },
      {
        label: 'Total Tasks',
        value: calculateTotalTasks(localState, epics),
      },
    ],
    [localState, userStories, epics]
  );

  if (state === 'loading') {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen">
      <div className="w-min w-80 border-r bg-background  space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-2 p-2">
          <div className="flex gap-2">
            <Templates appId={selectedApp} />
            <ImportExport appId={selectedApp} />
            <VersionControl appId={selectedApp} />
          </div>
          {selectedApp && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedApp(null)}
            >
              Back to Apps
            </Button>
          )}
        </div>
        <ContextualQuestions
          content="Global"
          workItemType="Global"
          isReadOnly={isReadOnly}
        />
        <FormatData chatApi={chatApi} selectedApp={selectedApp} />

        <div className="space-y-2">
          <Button
            className="w-full"
            onClick={handleAddEpics}
            disabled={isReadOnly}
          >
            Add Epics
          </Button>
          <Button
            className="w-full"
            onClick={handleAddFeatures}
            disabled={isReadOnly}
          >
            Add Features
          </Button>
          <Button
            className="w-full"
            onClick={handleAddUserStories}
            disabled={isReadOnly}
          >
            Add User Stories
          </Button>
          <Button
            className="w-full"
            onClick={handleAddTasksToAllUserStories}
            disabled={isReadOnly}
          >
            Add Tasks
          </Button>
          <Button
            className="w-full"
            onClick={() => setIsAddEpicDialogOpen(true)}
            disabled={isReadOnly}
          >
            Add Epic Manually
          </Button>
        </div>

        <Separator />

        <Chat />
        <Config />
        <SowInput selectedApp={selectedApp} />

        {state === 'error' && errorMessage && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              <span>{errorMessage}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="ml-2 h-auto py-1"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="p-6">
          <div className="mb-6">
            <CollaborationPanel presenceUsers={presenceUsers} />
          </div>
          <div className="mb-6">
            <BuilderSearch
              epics={epics}
              features={featuresRecord}
              userStories={userStoriesRecord}
              tasks={tasksRecord}
              onResultSelect={handleSearchResultSelect}
            />
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <MetricsDisplay metrics={metrics} />
            </CardContent>
          </Card>

          <DragDropContext onDragEnd={handleDragEnd}>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <Droppable droppableId="epics" type="EPIC">
                {(provided) => (
                  <div
                    className="space-y-6 pr-4"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {epics.map((epic, index) => (
                      <Draggable
                        key={epic.id}
                        draggableId={epic.id}
                        index={index}
                        isDragDisabled={isReadOnly}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={snapshot.isDragging ? 'opacity-75' : ''}
                          >
                            <Epic
                              epic={epic}
                              index={index}
                              dragHandleProps={provided.dragHandleProps}
                              isReadOnly={isReadOnly}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </ScrollArea>
          </DragDropContext>
        </div>
      </div>

      {/* Add Epic Dialog */}
      <Dialog open={isAddEpicDialogOpen} onOpenChange={setIsAddEpicDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Epic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {Object.entries(formState).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{key}</Label>
                {key === 'Description' || key === 'Notes' ? (
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
            <Button onClick={handleAddEpic} disabled={isReadOnly}>
              Add Epic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Builder;
