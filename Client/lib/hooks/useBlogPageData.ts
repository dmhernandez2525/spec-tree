import { useState, useEffect } from 'react';
import { fetchBlogPageData, BlogPageAttributes } from '../../api/fetchData';

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
        setBlogSections(response?.data || null);
      } catch (error) {
        console.error('Failed to fetch blog page data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, []);

  return { blogSections, loading };
};
