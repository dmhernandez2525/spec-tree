import { useState, useEffect } from 'react';
import { fetchBlogPageData, BlogPageAttributes } from '../../api/fetchData';
import { fallbackBlogPageData } from '../data/fallback-content';

export const useBlogPageData = () => {
  const [blogSections, setBlogSections] = useState<BlogPageAttributes | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogData = async () => {
      setLoading(true);
      try {
        const response = await fetchBlogPageData();
        // Use fallback data if API returns null or empty
        setBlogSections(response?.data || fallbackBlogPageData);
      } catch (error) {
        console.error('Failed to fetch blog page data, using fallback:', error);
        setBlogSections(fallbackBlogPageData);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, []);

  return { blogSections, loading };
};
