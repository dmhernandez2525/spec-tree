import { useState } from 'react';
import {
  generateQuestionsForEpic,
  generateQuestionsForFeature,
  generateQuestionsForUserStory,
  generateQuestionsForTask,
  generateQuestionsForGlobalRefinement,
} from '../api/openai';
// TODO: use
// import validateAnswers from '../helpers/validateAnswers';
import { ExtendedWorkItemType, ContextualQuestion } from '../types/work-items';
import generateId from '../utils/generate-id';
import { useSelector } from 'react-redux';
import { selectChatApi } from '../../../../lib/store/sow-slice';

const useQuestionGeneration = (
  workItemType: ExtendedWorkItemType,
  initialQuestions: ContextualQuestion[] = []
) => {
  const chatApi = useSelector(selectChatApi);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] =
    useState<ContextualQuestion[]>(initialQuestions);

  const generateQuestions = async (
    workItem?: any
  ): Promise<ContextualQuestion[] | null> => {
    setLoading(true);
    try {
      let response;
      switch (workItemType) {
        case 'epics':
          response = await generateQuestionsForEpic({
            chatApi,
            epic: workItem,
            selectedModel: 'gpt-3.5-turbo',
          });
          break;
        case 'features':
          response = await generateQuestionsForFeature({
            chatApi,
            feature: workItem,
            selectedModel: 'gpt-3.5-turbo',
          });
          break;
        case 'userStories':
          response = await generateQuestionsForUserStory({
            chatApi,
            userStory: workItem,
            selectedModel: 'gpt-3.5-turbo',
          });
          break;
        case 'tasks':
          response = await generateQuestionsForTask({
            chatApi,
            task: workItem,
            selectedModel: 'gpt-3.5-turbo',
          });
          break;
        case 'Global':
          response = await generateQuestionsForGlobalRefinement({
            chatApi,
            globalInformation: workItem,
            selectedModel: 'gpt-3.5-turbo',
          });
          break;
        default:
          throw new Error('Invalid work item type.');
      }
      const parsedQuestions = response.data.choices[0].message.content
        .split('=+=')
        .map((question: string) => question.trim())
        .filter((question: string) => question.length > 0)
        .map((question: string) => ({
          id: generateId(),
          question,
        }));
      setQuestions(parsedQuestions);
      setLoading(false);
      return parsedQuestions;
    } catch (err) {
      console.error('Failed to generate questions:', err);
      setError('Failed to generate questions.');
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
