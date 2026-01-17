import { useState, useEffect } from 'react';
import {
  fetchPrivacyPageData,
  PrivacyPageAttributes,
} from '../../api/fetchData';
import { fallbackPrivacyPageData } from '../data/fallback-content';

export const usePrivacyPageData = () => {
  const [privacySections, setPrivacySections] =
    useState<PrivacyPageAttributes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrivacyData = async () => {
      setLoading(true);
      try {
        const response = await fetchPrivacyPageData();
        // Use fallback data if API returns null or empty
        setPrivacySections(response?.data || fallbackPrivacyPageData);
      } catch (error) {
        console.error('Failed to fetch privacy page data, using fallback:', error);
        setPrivacySections(fallbackPrivacyPageData);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyData();
  }, []);

  return { privacySections, loading };
};
