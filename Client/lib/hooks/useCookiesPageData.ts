import { useState, useEffect } from 'react';
import {
  fetchCookiesPageData,
  CookiesPageAttributes,
} from '../../api/fetchData';
import { fallbackCookiesPageData } from '../data/fallback-content';

export const useCookiesPageData = () => {
  const [cookiesSections, setCookiesSections] =
    useState<CookiesPageAttributes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCookiesData = async () => {
      setLoading(true);
      try {
        const response = await fetchCookiesPageData();
        // Use fallback data if API returns null or empty
        setCookiesSections(response?.data || fallbackCookiesPageData);
      } catch (error) {
        console.error('Failed to fetch cookies page data, using fallback:', error);
        setCookiesSections(fallbackCookiesPageData);
      } finally {
        setLoading(false);
      }
    };

    fetchCookiesData();
  }, []);

  return { cookiesSections, loading };
};
