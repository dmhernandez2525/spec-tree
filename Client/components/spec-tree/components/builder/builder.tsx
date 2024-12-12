import React, { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../../lib/store';
import {
  addEpics,
  requestAdditionalEpics,
  requestAdditionalFeatures,
  requestUserStories,
  requestTasks,
  selectAllEpics,
  selectAllFeatures,
  selectAllUserStories,
  selectFeatureById,
  selectUserStoryById,
} from '../../../../lib/store/sow-slice';
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
import generateId from '../../lib/utils/generate-id';
import {
  calculateTotalTasks,
  calculateTotalFeatures,
  calculateTotalUserStories,
} from '../../lib/utils/calculation-utils';
import calculateTotalPoints from '../../lib/utils/calculate-total-points';
import useAsyncState from '@/lib/hooks/useAsyncState';

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
  // TODO: use setSelectedApp and remove console.log
  console.log(setSelectedApp);
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
  const epics = useSelector(selectAllEpics);
  const features = useSelector(selectAllFeatures);
  const userStories = useSelector(selectAllUserStories);

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
      startLoading();
      await dispatch(requestAdditionalEpics({ state: localState })).unwrap();
      stopLoading();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to generate epics. Please try again.';
      console.error('Failed to generate epics:', err);
      handleError(errorMessage);
    }
  }, [dispatch, localState, startLoading, stopLoading, handleError]);

  const handleAddFeatures = useCallback(async () => {
    try {
      startLoading();
      await Promise.all(
        epics.map((epic) =>
          dispatch(
            requestAdditionalFeatures({ epic, state: localState })
          ).unwrap()
        )
      );
      stopLoading();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to generate features. Please try again.';
      console.error('Failed to generate features:', err);
      handleError(errorMessage);
    }
  }, [dispatch, epics, localState, startLoading, stopLoading, handleError]);

  const handleAddUserStories = useCallback(async () => {
    try {
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
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to generate user stories. Please try again.';
      console.error('Failed to generate user stories:', err);
      handleError(errorMessage);
    }
  }, [
    dispatch,
    epics,
    featuresById,
    localState,
    startLoading,
    stopLoading,
    handleError,
  ]);

  const handleAddTasksToAllUserStories = useCallback(async () => {
    try {
      startLoading();
      await Promise.all(
        Object.values(userStoriesById)
          .filter((story): story is UserStoryType => !!story)
          .map((userStory) =>
            dispatch(requestTasks({ userStory, state: localState })).unwrap()
          )
      );
      stopLoading();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to generate tasks. Please try again.';
      console.error('Failed to generate tasks:', err);
      handleError(errorMessage);
    }
  }, [
    dispatch,
    userStoriesById,
    localState,
    startLoading,
    stopLoading,
    handleError,
  ]);

  const handleAddEpic = useCallback(() => {
    try {
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
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to add epic. Please try again.';
      console.error('Failed to add epic:', err);
      handleError(errorMessage);
    }
  }, [dispatch, formState, selectedApp, handleError]);

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
        <ContextualQuestions content="Global" workItemType="Global" />
        {/* TODO-p1: this is here essentially to call and fetch the data/update the state whenever we initially load and it seems like we're also doing it whenever we create new items we could probably not do it whenever we create new items/update the items but just initial load. We should probably turn this into a provider or a hook. */}
        <FormatData chatApi={chatApi} selectedApp={selectedApp} />

        <div className="space-y-2">
          <Button className="w-full" onClick={handleAddEpics}>
            Add Epics
          </Button>
          <Button className="w-full" onClick={handleAddFeatures}>
            Add Features
          </Button>
          <Button className="w-full" onClick={handleAddUserStories}>
            Add User Stories
          </Button>
          <Button className="w-full" onClick={handleAddTasksToAllUserStories}>
            Add Tasks
          </Button>
          <Button
            className="w-full"
            onClick={() => setIsAddEpicDialogOpen(true)}
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
          <Card className="mb-6">
            <CardContent className="pt-6">
              <MetricsDisplay metrics={metrics} />
            </CardContent>
          </Card>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-6 pr-4">
              {epics.map((epic, index) => (
                <Epic key={epic.id} epic={epic} index={index} />
              ))}
            </div>
          </ScrollArea>
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
            <Button onClick={handleAddEpic}>Add Epic</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Builder;
