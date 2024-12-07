import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../../lib/store';
import {
  deleteFeature,
  requestUserStories,
  updateFeatureField,
  addUserStory,
  selectUserStoryById,
  addContextualQuestionToWorkItem,
} from '../../../../lib/store/sow-slice';
import {
  EpicType,
  FeatureType,
  UserStoryType,
  FeatureFields,
} from '../../lib/types/work-items';
import UserStory from '../user-story';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
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
  AccordionTrigger,
  AccordionContent,
  Accordion,
  AccordionItem,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '../loading-spinner';
import MetricsDisplay from '../metrics-display';
import AcceptanceCriteriaList from '../acceptance-criteria-list';
import { useAcceptanceCriteria } from '../../lib/hooks/use-acceptance-criteria';
import ContextualQuestions from '../contextual-questions';
import generateId from '../../lib/utils/generate-id';
import {
  calculateTotalTasks,
  calculateTotalUserStories,
} from '../../lib/utils/calculation-utils';
import calculateTotalPoints from '../../lib/utils/calculate-total-points';

interface FeatureProps {
  feature: FeatureType;
  epic: EpicType;
  index: number;
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

const Feature: React.FC<FeatureProps> = ({ feature, epic, index }) => {
  const dispatch = useDispatch<AppDispatch>();
  const localState = useSelector((state: RootState) => state);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [formState, setFormState] = React.useState<FormState>(initialFormState);

  const userStories = feature.userStoryIds?.map((id) =>
    selectUserStoryById(localState, id)
  );

  const handleUpdateFeature = (params: {
    field: FeatureFields;
    newValue: string | Array<{ text: string }>;
    arrayIndex?: number;
    isArrayItem?: boolean;
  }) => {
    dispatch(
      updateFeatureField({
        featureId: feature.id,
        ...params,
      })
    );
  };

  const { add, remove, update } = useAcceptanceCriteria(
    feature.acceptanceCriteria.map((criteria) => criteria.text),
    handleUpdateFeature
  );

  const handleGenerateUserStories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(
        requestUserStories({
          feature,
          state: localState,
        })
      );
    } catch (err) {
      setError('Failed to generate user stories');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    dispatch(deleteFeature(feature.id));
  };

  const handleAddUserStory = () => {
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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Feature: {feature.title}</span>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setShowModal(true)}>
              Add User Story
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          <MetricsDisplay metrics={metrics} />
        </CardDescription>
      </CardHeader>

      <CardContent>
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
                  />
                </div>

                <AcceptanceCriteriaList
                  acceptanceCriteria={feature.acceptanceCriteria}
                  add={add}
                  remove={remove}
                  update={update}
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
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">User Stories</h3>
            <Button onClick={handleGenerateUserStories}>
              Generate User Stories
            </Button>
          </div>

          <ContextualQuestions
            content="Work Item"
            workItemType="features"
            workItem={feature}
          />

          {userStories?.map((userStory) => (
            <UserStory
              key={userStory.id}
              userStory={userStory}
              feature={feature}
              epic={epic}
            />
          ))}
        </div>
      </CardContent>

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
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleAddUserStory}>Add User Story</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Feature;
