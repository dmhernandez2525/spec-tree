import { useState, useEffect } from 'react';
import {
  fetchOurProcessPageData,
  OurProcessPageAttributes,
} from '../../api/fetchData';
import { fallbackOurProcessPageData } from '../data/fallback-content';

export const useOurProcessPageData = () => {
  const [aboutSections, setOurProcessPageSections] =
    useState<OurProcessPageAttributes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOurProcessData = async () => {
      setLoading(true);
      try {
        const response = await fetchOurProcessPageData();
        // Use fallback data if API returns null or empty
        setOurProcessPageSections(response?.data || fallbackOurProcessPageData);
      } catch (error) {
        console.error('Failed to fetch our process page data, using fallback:', error);
        setOurProcessPageSections(fallbackOurProcessPageData);
      } finally {
        setLoading(false);
      }
    };

    fetchOurProcessData();
  }, []);

  return { aboutSections, loading };
};
