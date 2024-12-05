import { useState, useEffect } from 'react';
import { fetchAboutPageData, AboutPageAttributes } from '../../api/fetchData';

export const useAboutPageData = () => {
  const [aboutSections, setAboutSections] =
    useState<AboutPageAttributes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      setLoading(true);
      try {
        const response = await fetchAboutPageData();
        setAboutSections(response?.data || null);
      } catch (error) {
        console.error('Failed to fetch about page data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  return { aboutSections, loading };
};
