import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setSow } from '../../lib/store/slices/sow-slice';
import { strapiService } from '../../lib/api/strapi-service';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface FormatDataProps {
  selectedApp: string | null;
  chatApi: string | null;
}

interface FormattedData {
  sow: {
    chatApi: string | null;
    id: string;
    epics: any[];
    features: any[];
    userStories: any[];
    tasks: any[];
    contextualQuestions: any[];
    globalInformation: string;
  };
}

const formatDBData = ({
  data,
  chatApi,
  id,
}: {
  data: any;
  chatApi: string | null;
  id: string;
}): FormattedData => {
  const sow: FormattedData['sow'] = {
    chatApi,
    id,
    epics: [],
    features: [],
    userStories: [],
    tasks: [],
    contextualQuestions: [],
    globalInformation: '',
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

  // Format epics and their nested data
  sow.epics =
    data?.epics?.map((epic: any) => ({
      id: epic.documentId,
      title: epic.title,
      description: epic.description,
      goal: epic.goal,
      successCriteria: epic.successCriteria,
      dependencies: epic.dependencies,
      timeline: epic.timeline,
      resources: epic.resources,
      risksAndMitigation: epic.risksAndMitigation || [],
      featureIds: epic.features?.map((f: any) => f.documentId) || [],
      notes: epic.notes,
      contextualQuestions: epic.contextualQuestions?.map((q: any) => ({
        id: q.documentId,
        question: q.question,
        answer: q.answer,
      })),
    })) || [];

  // Format features
  sow.features =
    data?.epics?.flatMap((epic: any) =>
      epic.features?.map((feature: any) => ({
        id: feature.documentId,
        title: feature.title,
        description: feature.description,
        details: feature.details,
        dependencies: feature.dependencies || '',
        acceptanceCriteria: feature.acceptanceCriteria || [{ text: '' }],
        parentEpicId: epic.documentId,
        userStoryIds:
          feature.userStories?.map((us: any) => us.documentId) || [],
        notes: feature.notes,
        contextualQuestions: feature.contextualQuestions?.map((q: any) => ({
          id: q.documentId,
          question: q.question,
          answer: q.answer,
        })),
      }))
    ) || [];

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
