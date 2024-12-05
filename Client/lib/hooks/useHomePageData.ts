import { useState, useEffect } from 'react';
import { fetchHomePageData } from '../../api/fetchData';
import { HomePageData } from '../../types/main';

export const useHomePageData = () => {
  const [homeSections, setHomeSections] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const response: any = await fetchHomePageData();

        setHomeSections(response?.data);
      } catch (error) {
        console.error('Failed to fetch home page data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return { homeSections, loading };
};
