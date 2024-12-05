import { useState, useEffect } from 'react';
import {
  fetchCookiesPageData,
  CookiesPageAttributes,
} from '../../api/fetchData';

export const useCookiesPageData = () => {
  const [cookiesSections, setCookiesSections] =
    useState<CookiesPageAttributes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCookiesData = async () => {
      setLoading(true);
      try {
        const response = await fetchCookiesPageData();
        setCookiesSections(response?.data || null);
      } catch (error) {
        console.error('Failed to fetch Cookies page data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCookiesData();
  }, []);

  return { cookiesSections, loading };
};
