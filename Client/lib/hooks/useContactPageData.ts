import { useState, useEffect } from 'react';
import {
  fetchContactPageData,
  ContactPageAttributes,
} from '../../api/fetchData';

export const useContactPageData = () => {
  const [contactSections, setContactSections] =
    useState<ContactPageAttributes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactData = async () => {
      setLoading(true);
      try {
        const response = await fetchContactPageData();
        setContactSections(response?.data || null);
      } catch (error) {
        console.error('Failed to fetch contact page data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, []);

  return { contactSections, loading };
};
