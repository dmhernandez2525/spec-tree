import { useState, useEffect } from 'react';
import { fetchAboutPageData, AboutPageAttributes } from '../../api/fetchData';
import { fallbackAboutPageData } from '../data/fallback-content';

export const useAboutPageData = () => {
  const [aboutSections, setAboutSections] =
    useState<AboutPageAttributes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      setLoading(true);
      try {
        const response = await fetchAboutPageData();
        // Use fallback data if API returns null or empty
        setAboutSections(response?.data || fallbackAboutPageData);
      } catch (error) {
        console.error('Failed to fetch about page data, using fallback:', error);
        setAboutSections(fallbackAboutPageData);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  return { aboutSections, loading };
};
