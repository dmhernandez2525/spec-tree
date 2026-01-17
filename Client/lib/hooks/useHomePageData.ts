import { useState, useEffect } from 'react';
import { fetchHomePageData } from '../../api/fetchData';
import { HomePageData, SingleApiResponse } from '../../types/main';
import { fallbackHomePageData } from '../data/fallback-content';

export const useHomePageData = () => {
  const [homeSections, setHomeSections] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const response: SingleApiResponse<HomePageData> | null | undefined = await fetchHomePageData();
        // Use fallback data if API returns null or empty
        setHomeSections(response?.data || fallbackHomePageData);
      } catch (error) {
        console.error('Failed to fetch home page data, using fallback:', error);
        setHomeSections(fallbackHomePageData);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return { homeSections, loading };
};
