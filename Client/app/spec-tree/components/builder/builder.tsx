import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../lib/store';
import {
  setSow,
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
} from '../../lib/store/slices/sow-slice';
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
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isAddEpicDialogOpen, setIsAddEpicDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<FormState>(initialFormState);

  const localState = useSelector((state: RootState) => state);
  const epics = useSelector(selectAllEpics);
  const features = useSelector(selectAllFeatures);
  const userStories = useSelector(selectAllUserStories);

  const featuresById = epics?.reduce((acc, epic) => {
    epic.featureIds.forEach((featureId) => {
      acc[featureId] = selectFeatureById(localState, featureId);
    });
    return acc;
  }, {} as Record<string, FeatureType>);

  const userStoriesById = features
    .flatMap((feature) => feature.userStoryIds || [])
    .reduce((acc, userStoryId) => {
      acc[userStoryId] = selectUserStoryById(localState, userStoryId);
      return acc;
    }, {} as Record<string, UserStoryType>);

  const handleAddEpics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(requestAdditionalEpics({ state: localState }));
    } catch (err) {
      setError('Failed to generate epics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFeatures = async () => {
    setIsLoading(true);
    setError(null);
    try {
      for (const epic of epics) {
        await dispatch(requestAdditionalFeatures({ epic, state: localState }));
      }
    } catch (err) {
      setError('Failed to generate features. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUserStories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      for (const epic of epics) {
        for (const featureId of epic.featureIds) {
          const feature = featuresById[featureId];
          if (feature) {
            await dispatch(requestUserStories({ feature, state: localState }));
          }
        }
      }
    } catch (err) {
      setError('Failed to generate user stories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTasksToAllUserStories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      for (const epic of epics) {
        for (const featureId of epic.featureIds) {
          const feature = featuresById[featureId];
          if (feature) {
            for (const userStoryId of feature.userStoryIds) {
              const userStory = userStoriesById[userStoryId];
              if (userStory) {
                await dispatch(requestTasks({ userStory, state: localState }));
              }
            }
          }
        }
      }
    } catch (err) {
      setError('Failed to generate tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEpic = () => {
    const epic: EpicType = {
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
  };

  const metrics = [
    {
      label: 'Total Project Points',
      value: calculateTotalPoints(localState, userStories),
    },
    {
      label: 'Total Epics',
      value: epics?.length,
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
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-80 border-r bg-background p-6 space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setSelectedApp(null)}
        >
          Back to App Selector
        </Button>

        <Separator />

        <FormatData chatApi={chatApi} selectedApp={selectedApp} />
        <SowInput selectedApp={selectedApp} />

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

        <ContextualQuestions content="Global" workItemType="Global" />
        <Chat />
        <Config />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
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
