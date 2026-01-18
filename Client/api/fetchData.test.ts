/**
 * Tests for Strapi API Data Fetching Module
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios, { AxiosError } from 'axios';

// Mock axios
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    ...actual,
    default: {
      ...actual,
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      isAxiosError: vi.fn((error) => error.isAxiosError === true),
      create: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      })),
    },
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => 'mock-token'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('fetchData module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_STRAPI_API_URL', 'http://localhost:1337');
    vi.stubEnv('NEXT_PUBLIC_STRAPI_TOKEN', 'test-token');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('fetchData', () => {
    it('fetches data successfully with default populate', async () => {
      const mockResponse = {
        data: {
          data: [{ id: 1, title: 'Test' }],
          meta: { pagination: { page: 1 } },
        },
      };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { fetchData } = await import('./fetchData');

      const result = await fetchData('posts');

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/posts?populate=*'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
          }),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('fetches data with custom query', async () => {
      const mockResponse = {
        data: {
          data: [{ id: 1, title: 'Test' }],
          meta: {},
        },
      };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { fetchData } = await import('./fetchData');

      await fetchData('posts', 'filters[title][$eq]=Test');

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('filters[title][$eq]=Test'),
        expect.any(Object)
      );
    });

    it('handles errors gracefully', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: { message: 'Server error' },
        },
        message: 'Request failed',
      };
      vi.mocked(axios.get).mockRejectedValueOnce(axiosError);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      vi.resetModules();
      const { fetchData } = await import('./fetchData');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await fetchData('posts');

      expect(result).toBeUndefined();
      consoleSpy.mockRestore();
    });
  });

  describe('fetchSingleData', () => {
    it('fetches single item by id', async () => {
      const mockResponse = {
        data: {
          data: { id: 1, title: 'Single Post' },
          meta: {},
        },
      };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { fetchSingleData } = await import('./fetchData');

      const result = await fetchSingleData('posts', '1');

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/posts/1'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('handles errors when fetching single item', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Not found'));

      vi.resetModules();
      const { fetchSingleData } = await import('./fetchData');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await fetchSingleData('posts', '999');

      expect(result).toBeUndefined();
      consoleSpy.mockRestore();
    });
  });

  describe('fetchPosts', () => {
    it('fetches blog posts', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: 1, attributes: { title: 'Post 1' } },
            { id: 2, attributes: { title: 'Post 2' } },
          ],
          meta: {},
        },
      };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { fetchPosts } = await import('./fetchData');

      const result = await fetchPosts();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/blog-posts'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('fetchNewsFeed', () => {
    it('fetches news feed data', async () => {
      const mockResponse = {
        data: {
          data: [{ id: 1, title: 'News 1' }],
          meta: {},
        },
      };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { fetchNewsFeed } = await import('./fetchData');

      const result = await fetchNewsFeed();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/news-feeds'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('fetchPostsById', () => {
    it('fetches a single post by id', async () => {
      const mockResponse = {
        data: {
          data: { id: 1, attributes: { title: 'Test Post' } },
          meta: {},
        },
      };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { fetchPostsById } = await import('./fetchData');

      const result = await fetchPostsById('1');

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/blog-posts/1'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('refreshUser', () => {
    it('fetches current user data with token', async () => {
      const mockResponse = {
        data: {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
        },
      };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { refreshUser } = await import('./fetchData');

      const result = await refreshUser('user-token');

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/me'),
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer user-token',
          },
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('handles unauthorized error', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Unauthorized'));

      vi.resetModules();
      const { refreshUser } = await import('./fetchData');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await refreshUser('invalid-token');

      expect(result).toBeUndefined();
      consoleSpy.mockRestore();
    });
  });

  describe('getUserRole', () => {
    it('fetches user role with populated role', async () => {
      const mockResponse = {
        data: {
          id: 1,
          email: 'test@example.com',
          role: { id: 1, name: 'Admin' },
        },
      };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { getUserRole } = await import('./fetchData');

      const result = await getUserRole('user-token');

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('populate[role]=*'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('registerNewUser', () => {
    it('registers a new user successfully', async () => {
      const mockResponse = {
        status: 200,
        data: { user: { id: 1, email: 'new@example.com' } },
      };
      vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { registerNewUser } = await import('./fetchData');

      const result = await registerNewUser({
        email: 'new@example.com',
        password: 'password123',
      });

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/local/register'),
        expect.objectContaining({
          email: 'new@example.com',
          password: 'password123',
        })
      );
      expect(result).toBe(true);
    });

    it('returns false on registration failure', async () => {
      vi.mocked(axios.post).mockRejectedValueOnce(new Error('Registration failed'));

      vi.resetModules();
      const { registerNewUser } = await import('./fetchData');

      const result = await registerNewUser({
        email: 'existing@example.com',
        password: 'password123',
      });

      expect(result).toBe(false);
    });
  });

  describe('confirmEmail', () => {
    it('confirms email successfully', async () => {
      const mockResponse = { status: 200 };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { confirmEmail } = await import('./fetchData');

      const result = await confirmEmail('confirmation-token');

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('email-confirmation?confirmation=confirmation-token')
      );
      expect(result.success).toBe(true);
      expect(result.message).toBe('Email confirmed successfully');
    });

    it('handles invalid confirmation token', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          data: {
            error: { message: 'Invalid token' },
          },
        },
      };
      vi.mocked(axios.get).mockRejectedValueOnce(axiosError);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      vi.resetModules();
      const { confirmEmail } = await import('./fetchData');

      const result = await confirmEmail('invalid-token');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid token');
    });
  });

  describe('resendConfirmationEmail', () => {
    it('resends confirmation email successfully', async () => {
      const mockResponse = { status: 200 };
      vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { resendConfirmationEmail } = await import('./fetchData');

      const result = await resendConfirmationEmail('test@example.com');

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/send-email-confirmation'),
        { email: 'test@example.com' }
      );
      expect(result.success).toBe(true);
    });

    it('handles resend failure', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          data: {
            error: { message: 'Too many requests' },
          },
        },
      };
      vi.mocked(axios.post).mockRejectedValueOnce(axiosError);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      vi.resetModules();
      const { resendConfirmationEmail } = await import('./fetchData');

      const result = await resendConfirmationEmail('test@example.com');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Too many requests');
    });
  });

  describe('addToNewsletter', () => {
    it('exports addToNewsletter function', async () => {
      vi.resetModules();
      const { addToNewsletter } = await import('./fetchData');

      expect(typeof addToNewsletter).toBe('function');
    });
  });

  describe('sendContactUsEmail', () => {
    it('exports sendContactUsEmail function', async () => {
      vi.resetModules();
      const { sendContactUsEmail } = await import('./fetchData');

      expect(typeof sendContactUsEmail).toBe('function');
    });
  });

  describe('createComment', () => {
    it('exports createComment function', async () => {
      vi.resetModules();
      const { createComment } = await import('./fetchData');

      expect(typeof createComment).toBe('function');
    });
  });

  describe('fetchUserInfo', () => {
    it('searches for user by full name', async () => {
      const mockResponse = {
        data: {
          data: [{ id: 1, firstName: 'John', lastName: 'Doe' }],
        },
      };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { fetchUserInfo } = await import('./fetchData');

      await fetchUserInfo({ name: 'John Doe' });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('filters[$and][0][firstName]'),
        expect.any(Object)
      );
    });

    it('searches for user by single name', async () => {
      const mockResponse = {
        data: {
          data: [{ id: 1, firstName: 'John' }],
        },
      };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { fetchUserInfo } = await import('./fetchData');

      await fetchUserInfo({ name: 'John' });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('filters[$or]'),
        expect.any(Object)
      );
    });
  });

  describe('CMS Page Data Functions', () => {
    it('fetchHomePageData fetches home page data', async () => {
      const mockResponse = {
        data: {
          data: { id: 1, heroData: {} },
          meta: {},
        },
      };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { fetchHomePageData } = await import('./fetchData');

      const result = await fetchHomePageData();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/home-page'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('fetchAboutPageData fetches about page data', async () => {
      const mockResponse = {
        data: {
          data: { id: 1, aboutSection: {} },
          meta: {},
        },
      };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { fetchAboutPageData } = await import('./fetchData');

      const result = await fetchAboutPageData();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/about-page'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('fetchOurProcessPageData fetches our process page data', async () => {
      const mockResponse = {
        data: {
          data: { id: 1, aboutSection: {} },
          meta: {},
        },
      };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { fetchOurProcessPageData } = await import('./fetchData');

      const result = await fetchOurProcessPageData();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/our-process-page'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('fetchTermsPageData fetches terms page data', async () => {
      const mockResponse = {
        data: {
          data: { id: 1, contentSection: '' },
          meta: {},
        },
      };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { fetchTermsPageData } = await import('./fetchData');

      const result = await fetchTermsPageData();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/terms-page'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('fetchPrivacyPageData fetches privacy page data', async () => {
      const mockResponse = {
        data: {
          data: { id: 1, contentSection: '' },
          meta: {},
        },
      };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { fetchPrivacyPageData } = await import('./fetchData');

      const result = await fetchPrivacyPageData();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/privacy-page'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('fetchCookiesPageData fetches cookies page data', async () => {
      const mockResponse = {
        data: {
          data: { id: 1, contentSection: '' },
          meta: {},
        },
      };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { fetchCookiesPageData } = await import('./fetchData');

      const result = await fetchCookiesPageData();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/cookies-page'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('fetchContactPageData fetches contact page data', async () => {
      const mockResponse = {
        data: {
          data: { id: 1, aboutSection: {} },
          meta: {},
        },
      };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { fetchContactPageData } = await import('./fetchData');

      const result = await fetchContactPageData();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/contact-page'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('fetchBlogPageData fetches blog page data', async () => {
      const mockResponse = {
        data: {
          data: { id: 1, aboutSection: {} },
          meta: {},
        },
      };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { fetchBlogPageData } = await import('./fetchData');

      const result = await fetchBlogPageData();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/blog-page'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('makeApiRequest', () => {
    it('exports makeApiRequest function', async () => {
      vi.resetModules();
      const { makeApiRequest } = await import('./fetchData');

      expect(typeof makeApiRequest).toBe('function');
    });
  });

  describe('fetchCmsData', () => {
    it('exports fetchCmsData function', async () => {
      vi.resetModules();
      const { fetchCmsData } = await import('./fetchData');

      expect(typeof fetchCmsData).toBe('function');
    });
  });

  describe('getSettings and setSettings', () => {
    it('exports getSettings function', async () => {
      vi.resetModules();
      const { getSettings } = await import('./fetchData');

      expect(typeof getSettings).toBe('function');
    });

    it('exports setSettings function', async () => {
      vi.resetModules();
      const { setSettings } = await import('./fetchData');

      expect(typeof setSettings).toBe('function');
    });
  });

  describe('User Update Functions', () => {
    it('updateUserEmail updates user email', async () => {
      const mockResponse = {
        data: { id: 1, email: 'newemail@example.com' },
      };
      vi.mocked(axios.put).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { updateUserEmail } = await import('./fetchData');

      const result = await updateUserEmail('1', 'newemail@example.com');

      expect(result).toBeDefined();
    });

    it('updateUserPassword updates user password', async () => {
      const mockResponse = {
        data: { id: 1, email: 'test@example.com' },
      };
      vi.mocked(axios.put).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { updateUserPassword } = await import('./fetchData');

      const result = await updateUserPassword('1', 'newpassword123');

      expect(result).toBeDefined();
    });

    it('updateUserInfo updates user info', async () => {
      const mockResponse = {
        data: { id: 1, firstName: 'Jane' },
      };
      vi.mocked(axios.put).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { updateUserInfo } = await import('./fetchData');

      const result = await updateUserInfo({
        userId: '1',
        data: { firstName: 'Jane' },
      });

      expect(result).toBeDefined();
    });
  });

  describe('fetchGoogleReviews', () => {
    it('fetches Google reviews', async () => {
      const mockResponse = {
        data: {
          result: {
            reviews: [
              { author_name: 'Test User', rating: 5, text: 'Great!' },
            ],
          },
        },
      };
      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      vi.resetModules();
      const { fetchGoogleReviews } = await import('./fetchData');

      const result = await fetchGoogleReviews('place-id-123');

      expect(result).toEqual(mockResponse.data.result.reviews);
    });

    it('returns null on error', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('API Error'));

      vi.resetModules();
      const { fetchGoogleReviews } = await import('./fetchData');

      const result = await fetchGoogleReviews('invalid-place-id');

      expect(result).toBeNull();
    });
  });
});
