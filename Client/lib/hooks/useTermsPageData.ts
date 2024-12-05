import { useState, useEffect } from 'react';
import { fetchTermsPageData, TermsPageAttributes } from '../../api/fetchData';

export const useTermsPageData = () => {
  const [termsSections, setTermsSections] =
    useState<TermsPageAttributes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTermsData = async () => {
      setLoading(true);
      try {
        const response = await fetchTermsPageData();
        setTermsSections(response?.data || null);
      } catch (error) {
        console.error('Failed to fetch Terms page data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTermsData();
  }, []);

  return { termsSections, loading };
};
