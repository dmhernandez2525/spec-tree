import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setSow } from '../../../../lib/store/sow-slice';
import { strapiService } from '../../lib/api/strapi-service';
import {
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
  Sow,
} from '../../lib/types/work-items';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface FormatDataProps {
  selectedApp: string | null;
  chatApi: string | null;
}

interface FormattedData {
  sow: Sow;
}

export const formatDBData = ({
  data,
  chatApi,
  id,
}: {
  data: any;
  chatApi: string | null;
  id: string;
}): FormattedData => {
  const sow: FormattedData['sow'] = {
    chatApi: chatApi || '',
    id,
    apps: {},
    epics: {},
    features: {},
    userStories: {},
    tasks: {},
    contextualQuestions: [],
    globalInformation: '',
    selectedModel: 'gpt-3.5-turbo-16k',
  };

  // Format contextual questions
  sow.contextualQuestions =
    data.contextualQuestions?.map((q: any) => ({
      id: q.documentId,
      question: q.question,
      answer: q.answer,
    })) || [];

  // Format global information
  sow.globalInformation = data?.globalInformation || '';

  // Format epics
  if (data?.epics) {
    sow.epics = data.epics.reduce(
      (acc: Record<string, EpicType>, epic: any) => {
        acc[epic.documentId] = {
          id: epic.documentId,
          documentId: epic.documentId,
          title: epic.title,
          description: epic.description,
          goal: epic.goal,
          successCriteria: epic.successCriteria,
          dependencies: epic.dependencies,
          timeline: epic.timeline,
          resources: epic.resources,
          risksAndMitigation: epic.risksAndMitigation || [],
          featureIds: epic.features?.map((f: any) => f.documentId) || [],
          parentAppId: id,
          notes: epic.notes,
          contextualQuestions:
            epic.contextualQuestions?.map((q: any) => ({
              id: q.documentId,
              question: q.question,
              answer: q.answer,
            })) || [],
        };
        return acc;
      },
      {}
    );
  }

  // Format features
  if (data?.epics) {
    sow.features = data.epics.reduce(
      (acc: Record<string, FeatureType>, epic: any) => {
        if (epic.features) {
          epic.features.forEach((feature: any) => {
            acc[feature.documentId] = {
              id: feature.documentId,
              documentId: feature.documentId,
              title: feature.title,
              description: feature.description,
              details: feature.details,
              dependencies: feature.dependencies || '',
              acceptanceCriteria: feature.acceptanceCriteria || [{ text: '' }],
              parentEpicId: epic.documentId,
              userStoryIds:
                feature.userStories?.map((us: any) => us.documentId) || [],
              priority: feature.priority,
              effort: feature.effort,
              notes: feature.notes,
              contextualQuestions:
                feature.contextualQuestions?.map((q: any) => ({
                  id: q.documentId,
                  question: q.question,
                  answer: q.answer,
                })) || [],
            };
          });
        }
        return acc;
      },
      {}
    );
  }

  // Format user stories
  if (data?.epics) {
    sow.userStories = data.epics.reduce(
      (acc: Record<string, UserStoryType>, epic: any) => {
        epic.features?.forEach((feature: any) => {
          feature.userStories?.forEach((story: any) => {
            acc[story.documentId] = {
              id: story.documentId,
              documentId: story.documentId,
              title: story.title,
              role: story.role,
              action: story.action,
              goal: story.goal,
              points: story.points,
              acceptanceCriteria: story.acceptanceCriteria || [{ text: '' }],
              notes: story.notes,
              parentFeatureId: feature.documentId,
              taskIds: story.tasks?.map((t: any) => t.documentId) || [],
              developmentOrder: story.developmentOrder || 0,
              dependentUserStoryIds: [],
              contextualQuestions:
                story.contextualQuestions?.map((q: any) => ({
                  id: q.documentId,
                  question: q.question,
                  answer: q.answer,
                })) || [],
            };
          });
        });
        return acc;
      },
      {}
    );
  }

  // Format tasks
  if (data?.epics) {
    sow.tasks = data.epics.reduce(
      (acc: Record<string, TaskType>, epic: any) => {
        epic.features?.forEach((feature: any) => {
          feature.userStories?.forEach((story: any) => {
            story.tasks?.forEach((task: any) => {
              acc[task.documentId] = {
                id: task.documentId,
                documentId: task.documentId,
                title: task.title,
                details: task.details,
                priority: task.priority,
                notes: task.notes,
                parentUserStoryId: story.documentId,
                dependentTaskIds: [],
                contextualQuestions:
                  task.contextualQuestions?.map((q: any) => ({
                    id: q.documentId,
                    question: q.question,
                    answer: q.answer,
                  })) || [],
              };
            });
          });
        });
        return acc;
      },
      {}
    );
  }

  return { sow };
};

const FormatData: React.FC<FormatDataProps> = ({ selectedApp, chatApi }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAndFormatData = async () => {
      if (!selectedApp) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await strapiService.fetchAppById(selectedApp);
        const formattedData = formatDBData({
          data: response,
          chatApi,
          id: selectedApp,
        });
        dispatch(setSow(formattedData));
      } catch (err) {
        setError('Failed to fetch and format data');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndFormatData();
  }, [selectedApp, chatApi, dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default FormatData;
