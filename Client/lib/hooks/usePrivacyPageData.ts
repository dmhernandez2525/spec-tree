import { useState, useEffect } from 'react';
import {
  fetchPrivacyPageData,
  PrivacyPageAttributes,
} from '../../api/fetchData';

export const usePrivacyPageData = () => {
  const [privacySections, setPrivacySections] =
    useState<PrivacyPageAttributes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrivacyData = async () => {
      setLoading(true);
      try {
        const response = await fetchPrivacyPageData();
        setPrivacySections(response?.data || null);
      } catch (error) {
        console.error('Failed to fetch Privacy page data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyData();
  }, []);

  return { privacySections, loading };
};
