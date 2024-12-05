import { useState, useCallback } from 'react';
import { strapiService } from '../api/strapi-service';
import {
  App,
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
} from '../types/work-items';

interface UseApiResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  mutate: () => Promise<void>;
}

export function useApp(documentId: string): UseApiResponse<App> {
  const [data, setData] = useState<App | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const mutate = useCallback(async () => {
    try {
      setLoading(true);
      const appData = await strapiService.fetchAppById(documentId);
      setData(appData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch app'));
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  return { data, error, loading, mutate };
}

export function useApps(): UseApiResponse<App[]> {
  const [data, setData] = useState<App[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const mutate = useCallback(async () => {
    try {
      setLoading(true);
      const apps = await strapiService.fetchApps();
      setData(apps);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch apps'));
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, error, loading, mutate };
}

export function useEpics(appId: string): UseApiResponse<EpicType[]> {
  const [data, setData] = useState<EpicType[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const mutate = useCallback(async () => {
    try {
      setLoading(true);
      const epics = await strapiService.fetchEpics(appId);
      setData(epics);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch epics'));
    } finally {
      setLoading(false);
    }
  }, [appId]);

  return { data, error, loading, mutate };
}

export function useFeatures(epicId: string): UseApiResponse<FeatureType[]> {
  const [data, setData] = useState<FeatureType[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const mutate = useCallback(async () => {
    try {
      setLoading(true);
      const features = await strapiService.fetchFeatures(epicId);
      setData(features);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch features')
      );
    } finally {
      setLoading(false);
    }
  }, [epicId]);

  return { data, error, loading, mutate };
}

export function useUserStories(
  featureId: string
): UseApiResponse<UserStoryType[]> {
  const [data, setData] = useState<UserStoryType[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const mutate = useCallback(async () => {
    try {
      setLoading(true);
      const userStories = await strapiService.fetchUserStories(featureId);
      setData(userStories);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch user stories')
      );
    } finally {
      setLoading(false);
    }
  }, [featureId]);

  return { data, error, loading, mutate };
}

export function useTasks(userStoryId: string): UseApiResponse<TaskType[]> {
  const [data, setData] = useState<TaskType[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const mutate = useCallback(async () => {
    try {
      setLoading(true);
      const tasks = await strapiService.fetchTasks(userStoryId);
      setData(tasks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
    } finally {
      setLoading(false);
    }
  }, [userStoryId]);

  return { data, error, loading, mutate };
}
