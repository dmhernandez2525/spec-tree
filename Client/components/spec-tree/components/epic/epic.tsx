import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Droppable, Draggable, DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { GripVertical } from 'lucide-react';
import { RootState, AppDispatch } from '../../../../lib/store';
import {
  deleteEpic,
  updateEpicField,
  addFeature,
  requestAdditionalFeatures,
  selectFeatureById,
} from '../../../../lib/store/sow-slice';
import {
  EpicType,
  FeatureType,
  EpicFields,
  RiskMitigationType,
} from '../../lib/types/work-items';
import Feature from '../feature';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '../loading-spinner';
import MetricsDisplay from '../metrics-display';
import RegenerateFeedback from '../regenerate-feedback';
import generateId from '../../lib/utils/generate-id';
import {
  calculateTotalTasks,
  calculateTotalFeatures,
  calculateTotalUserStories,
} from '../../lib/utils/calculation-utils';
import calculateTotalPoints from '../../lib/utils/calculate-total-points';

interface EpicProps {
  epic: EpicType;
  index: number;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

interface FeatureFormState {
  title: string;
  description: string;
  details: string;
  notes: string;
}

const initialFeatureFormState: FeatureFormState = {
  title: '',
  description: '',
  details: '',
  notes: '',
};

const Epic: React.FC<EpicProps> = ({ epic, index: _index, dragHandleProps }) => {
  // TODO: use _index then remove underscore prefix
  const dispatch = useDispatch<AppDispatch>();
  const localState = useSelector((state: RootState) => state);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formState, setFormState] = React.useState<FeatureFormState>(
    initialFeatureFormState
  );
  const [isAddFeatureDialogOpen, setIsAddFeatureDialogOpen] =
    React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const features = epic.featureIds.map((id) =>
    selectFeatureById(localState, id)
  );

  const handleUpdate = (field: EpicFields, newValue: string) => {
    dispatch(
      updateEpicField({
        epicName: epic.id,
        field,
        newValue,
      })
    );
  };

  const handleUpdateRiskMitigation = (
    category: keyof RiskMitigationType,
    index: number,
    value: string
  ) => {
    const updatedRiskMitigation = [...epic.risksAndMitigation];
    if (updatedRiskMitigation[index]) {
      updatedRiskMitigation[index] = {
        ...updatedRiskMitigation[index],
        [category]: [{ text: value }],
      };
    } else {
      updatedRiskMitigation[index] = {
        ...updatedRiskMitigation[0],
        [category]: [{ text: value }],
      };
    }

    dispatch(
      updateEpicField({
        epicName: epic.id,
        field: 'risksAndMitigation',
        newValue: JSON.stringify(updatedRiskMitigation),
      })
    );
  };

  const handleDelete = () => {
    dispatch(deleteEpic(epic.id));
    setIsDeleteDialogOpen(false);
  };

  const handleGenerateFeatures = async (feedback?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(
        requestAdditionalFeatures({
          epic,
          state: localState,
          context: feedback,
        })
      );
    } catch (_err) {
      setError('Failed to generate features. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFeature = () => {
    const feature: FeatureType = {
      id: generateId(),
      title: formState.title,
      description: formState.description,
      details: formState.details,
      dependencies: '',
      acceptanceCriteria: [{ text: '' }],
      parentEpicId: epic.id,
      userStoryIds: [],
      notes: formState.notes,
      contextualQuestions: [],
      priority: 'Low',
      effort: 'Low',
    };

    dispatch(addFeature(feature));
    setFormState(initialFeatureFormState);
    setIsAddFeatureDialogOpen(false);
  };

  const metrics = [
    {
      label: 'Total Points',
      value: calculateTotalPoints(localState, epic),
    },
    {
      label: 'Features',
      value: calculateTotalFeatures(epic),
    },
    {
      label: 'User Stories',
      value: calculateTotalUserStories(localState, epic),
    },
    {
      label: 'Tasks',
      value: calculateTotalTasks(localState, epic),
    },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card id={`work-item-${epic.id}`} className="mb-8 border-l-4 border-l-blue-600 transition-all">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={epic.id} className="border-none">
          <CardHeader className="bg-slate-50">
            <AccordionTrigger>
              <CardTitle className="flex justify-between items-center w-full text-lg">
                <div className="flex items-center gap-3">
                  {dragHandleProps && (
                    <div
                      {...dragHandleProps}
                      className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-200 rounded"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="h-5 w-5 text-slate-400" />
                    </div>
                  )}
                  <span className="text-blue-600 font-semibold">Epic</span>
                  <span className="text-slate-600">{epic.title}</span>
                </div>
                <MetricsDisplay metrics={metrics} className="ml-4" />
              </CardTitle>
            </AccordionTrigger>
          </CardHeader>

          <AccordionContent>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddFeatureDialogOpen(true)}
                  >
                    Add Feature
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    Delete Epic
                  </Button>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="details">
                    <AccordionTrigger>Epic Details</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {Object.values(EpicFields).map((field) => (
                          <div key={field} className="space-y-2">
                            <Label>{field}</Label>
                            {field === 'description' || field === 'notes' ? (
                              <Textarea
                                value={epic[field] || ''}
                                onChange={(e) =>
                                  handleUpdate(field, e.target.value)
                                }
                              />
                            ) : (
                              <Input
                                value={epic[field] || ''}
                                onChange={(e) =>
                                  handleUpdate(field, e.target.value)
                                }
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="risks">
                    <AccordionTrigger>Risks and Mitigation</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {['resolve', 'own', 'accept', 'mitigate'].map(
                          (category) => (
                            <div key={category} className="space-y-2">
                              <Label>
                                {category.charAt(0).toUpperCase() +
                                  category.slice(1)}
                              </Label>
                              <Textarea
                                value={
                                  epic.risksAndMitigation[0]?.[
                                    category as keyof RiskMitigationType
                                  ]?.[0]?.text || ''
                                }
                                onChange={(e) =>
                                  handleUpdateRiskMitigation(
                                    category as keyof RiskMitigationType,
                                    0,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          )
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Separator className="my-6" />

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Features</h3>
                    <RegenerateFeedback
                      onRegenerate={handleGenerateFeatures}
                      isLoading={isLoading}
                      itemType="features"
                    />
                  </div>

                  <Droppable droppableId={`features-${epic.id}`} type="FEATURE">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <Accordion type="single" collapsible className="w-full">
                          {features.map((feature, i) => (
                            <Draggable
                              key={feature.id}
                              draggableId={feature.id}
                              index={i}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={snapshot.isDragging ? 'opacity-75 bg-white rounded shadow-lg' : ''}
                                >
                                  <AccordionItem value={feature.id}>
                                    <Feature
                                      epic={epic}
                                      feature={feature}
                                      index={i}
                                      dragHandleProps={provided.dragHandleProps}
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
        </AccordionItem>
      </Accordion>

      {/* Dialogs */}
      <Dialog
        open={isAddFeatureDialogOpen}
        onOpenChange={setIsAddFeatureDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Feature</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {Object.entries(formState).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Label>
                {key === 'description' ||
                key === 'details' ||
                key === 'notes' ? (
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
            <Button onClick={handleAddFeature}>Add Feature</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Epic</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this epic? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Epic;
