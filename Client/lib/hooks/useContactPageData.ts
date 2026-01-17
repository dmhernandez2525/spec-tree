import { useState, useEffect } from 'react';
import {
  fetchContactPageData,
  ContactPageAttributes,
} from '../../api/fetchData';
import { fallbackContactPageData } from '../data/fallback-content';

export const useContactPageData = () => {
  const [contactSections, setContactSections] =
    useState<ContactPageAttributes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactData = async () => {
      setLoading(true);
      try {
        const response = await fetchContactPageData();
        // Use fallback data if API returns null or empty
        setContactSections(response?.data || fallbackContactPageData);
      } catch (error) {
        console.error('Failed to fetch contact page data, using fallback:', error);
        setContactSections(fallbackContactPageData);
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, []);

  return { contactSections, loading };
};
