import { useState } from 'react';
import {
  generateQuestionsForEpic,
  generateQuestionsForFeature,
  generateQuestionsForUserStory,
  generateQuestionsForTask,
  generateQuestionsForGlobalRefinement,
} from '../api/openai';
import {
  ExtendedWorkItemType,
  ContextualQuestion,
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
} from '../types/work-items';

/**
 * Union type for work items that can have questions generated
 */
type QuestionableWorkItem = EpicType | FeatureType | UserStoryType | TaskType | string;
import generateId from '../utils/generate-id';
import { useSelector } from 'react-redux';
import { selectChatApi, selectSelectedModel } from '../../../../lib/store/sow-slice';
import { logger } from '../../../../lib/logger';

const useQuestionGeneration = (
  workItemType: ExtendedWorkItemType,
  initialQuestions: ContextualQuestion[] = []
) => {
  const chatApi = useSelector(selectChatApi);
  const selectedModel = useSelector(selectSelectedModel);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] =
    useState<ContextualQuestion[]>(initialQuestions);

  const generateQuestions = async (
    workItem?: QuestionableWorkItem
  ): Promise<ContextualQuestion[] | null> => {
    setLoading(true);
    try {
      let response;
      switch (workItemType) {
        case 'epics':
          response = await generateQuestionsForEpic({
            chatApi,
            epic: workItem as EpicType,
            selectedModel,
          });
          break;
        case 'features':
          response = await generateQuestionsForFeature({
            chatApi,
            feature: workItem as FeatureType,
            selectedModel,
          });
          break;
        case 'userStories':
          response = await generateQuestionsForUserStory({
            chatApi,
            userStory: workItem as UserStoryType,
            selectedModel,
          });
          break;
        case 'tasks':
          response = await generateQuestionsForTask({
            chatApi,
            task: workItem as TaskType,
            selectedModel,
          });
          break;
        case 'Global':
          response = await generateQuestionsForGlobalRefinement({
            chatApi,
            globalInformation: workItem as string,
            selectedModel,
          });
          break;
        default:
          throw new Error(`Invalid work item type: ${workItemType}`);
      }

      // Validate response structure
      const content = response?.data?.choices?.[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        throw new Error('Invalid response format from AI service');
      }

      // Parse questions with delimiter fallback
      const delimiter = '=+=';
      const questionStrings = content.includes(delimiter)
        ? content.split(delimiter)
        : [content]; // Fallback to single question if no delimiter

      const parsedQuestions = questionStrings
        .map((question: string) => question.trim())
        .filter((question: string) => question.length > 0)
        .map((question: string) => ({
          id: generateId(),
          question,
        }));

      if (parsedQuestions.length === 0) {
        throw new Error('No valid questions generated');
      }

      setQuestions(parsedQuestions);
      setLoading(false);
      return parsedQuestions;
    } catch (err) {
      logger.error('Failed to generate questions:', err);
      const errorMessage = err instanceof Error
        ? `Failed to generate questions: ${err.message}`
        : 'Failed to generate questions. Please try again.';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  const addQuestion = (question: ContextualQuestion) => {
    setQuestions([...questions, question]);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, qIndex) => qIndex !== index);
    setQuestions(updatedQuestions);
  };

  const updateQuestion = (
    index: number,
    updatedQuestion: ContextualQuestion
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = updatedQuestion;
    setQuestions(updatedQuestions);
  };

  return {
    loading,
    error,
    questions,
    generateQuestions,
    addQuestion,
    removeQuestion,
    updateQuestion,
    setQuestions,
  };
};

export default useQuestionGeneration;
