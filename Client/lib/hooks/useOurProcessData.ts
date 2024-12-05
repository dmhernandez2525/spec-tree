import { useState, useEffect } from 'react';
import {
  fetchOurProcessPageData,
  OurProcessPageAttributes,
} from '../../api/fetchData';

export const useOurProcessPageData = () => {
  const [aboutSections, OurProcessPageSections] =
    useState<OurProcessPageAttributes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameAssessmentData = async () => {
      setLoading(true);
      try {
        const response = await fetchOurProcessPageData();
        OurProcessPageSections(response?.data || null);
      } catch (error) {
        console.error('Failed to fetch OurProcessPage page data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameAssessmentData();
  }, []);

  return { aboutSections, loading };
};
