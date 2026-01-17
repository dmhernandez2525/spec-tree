import { useState, useEffect } from 'react';
import { fetchTermsPageData, TermsPageAttributes } from '../../api/fetchData';
import { fallbackTermsPageData } from '../data/fallback-content';

export const useTermsPageData = () => {
  const [termsSections, setTermsSections] =
    useState<TermsPageAttributes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTermsData = async () => {
      setLoading(true);
      try {
        const response = await fetchTermsPageData();
        // Use fallback data if API returns null or empty
        setTermsSections(response?.data || fallbackTermsPageData);
      } catch (error) {
        console.error('Failed to fetch terms page data, using fallback:', error);
        setTermsSections(fallbackTermsPageData);
      } finally {
        setLoading(false);
      }
    };

    fetchTermsData();
  }, []);

  return { termsSections, loading };
};
