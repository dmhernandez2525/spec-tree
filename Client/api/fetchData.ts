/**
 * Strapi API Data Fetching Module
 *
 * This module provides type-safe API calls to the Strapi CMS backend.
 * Future improvements planned:
 * - Centralize environment variable configuration
 * - Extract reusable query parameters to dedicated config file
 * - Migrate all functions to use the generic fetchCmsData pattern
 */
import axios, { AxiosResponse, Method } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

// Reusable query parameters for common API calls
const userData = 'populate[confirmed]=*&populate[blocked]=*&populate[avatar]=*';

import type {
  ApiSettings,
  NewsFeedData,
  PostAttributes,
  ApiResponse,
  SingleApiResponse,
  ImageAttributes,
  Section1,
  Section4,
  FaqSection,
  CTA,
  Section2,
  Section3,
  metricCards,
  HomePageData,
} from '../types/main';

import type { UserData, UserAttributes } from '@/types/user';

/**
 * Type for API error responses
 */
interface ApiErrorResponse {
  error: {
    message: string;
    status?: number;
    details?: Record<string, unknown>;
  };
}

/**
 * Type guard to check if a response is an error
 */
function isApiError(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as ApiErrorResponse).error === 'object'
  );
}

const handleError = (
  error: unknown,
  endpoint: string
): ApiErrorResponse => {
  console.error(`API Error on ${endpoint}:`, error);
  if (axios.isAxiosError(error)) {
    return {
      error: {
        message: error.response?.data?.message || error.message || 'Request failed',
        status: error.response?.status,
        details: error.response?.data,
      },
    };
  }
  if (error instanceof Error) {
    return {
      error: {
        message: error.message,
      },
    };
  }
  return {
    error: {
      message: 'An unknown error occurred',
    },
  };
};

/**
 * Generic API request function with proper typing
 */
async function makeApiRequest<T>({
  method,
  endpoint,
  data,
  params,
  usersToken,
}: {
  method: Method;
  endpoint: string;
  data?: Record<string, unknown>;
  params?: Record<string, unknown>;
  usersToken?: string;
}): Promise<T | null | undefined | ApiErrorResponse> {
  try {
    const url = `${API_URL}/api/${endpoint}`;
    const config = {
      method,
      url,
      data,
      params,
      headers: {
        Authorization: `Bearer ${usersToken}`,
      },
    };
    const response: AxiosResponse<T> = await axios(config);
    return response.data;
  } catch (error) {
    return handleError(error, endpoint);
  }
}
async function makeSettingsApiRequest<T>({
  method,
  endpoint,
  data,
  params,
  usersToken,
}: {
  method: Method;
  endpoint: string;
  data?: Record<string, unknown>;
  params?: Record<string, unknown>;
  usersToken?: string;
}): Promise<T | null | undefined> {
  try {
    const url = `${API_URL}/${endpoint}`;
    const config = {
      method,
      url,
      data,
      params,
      headers: {
        Authorization: `Bearer ${usersToken}`,
      },
    };
    const response: AxiosResponse<T> = await axios(config);
    return response.data;
  } catch (error) {
    handleError(error, endpoint);
    return null;
  }
}
// Utility function to form query strings
const formQueryString = (queryParams: string): URLSearchParams => {
  return new URLSearchParams(queryParams);
};

// Simplified API functions
const getData = async <T>(
  endpoint: string,
  params?: URLSearchParams
): Promise<T | null | undefined | ApiErrorResponse> =>
  makeApiRequest<T>({
    method: 'GET',
    endpoint,
    params: params ? Object.fromEntries(params.entries()) : undefined,
  });
// Simplified API functions
const getSettingsData = async <T>(
  endpoint: string,
  params?: URLSearchParams
): Promise<T | null | undefined> =>
  makeSettingsApiRequest<T>({
    method: 'GET',
    endpoint,
    params: params ? Object.fromEntries(params.entries()) : undefined,
  });

const createData = async <T>(
  endpoint: string,
  data: Record<string, unknown>
): Promise<T | null | undefined | ApiErrorResponse> =>
  makeApiRequest<T>({
    method: 'POST',
    endpoint,
    data,
    usersToken: token,
  });

const updateMemData = async <T>(
  endpoint: string,
  id: string | number,
  data: Record<string, unknown>
): Promise<T | null | undefined | ApiErrorResponse> =>
  makeApiRequest<T>({
    method: 'POST',
    endpoint: `${endpoint}/${id}`,
    data,
    usersToken: localStorage.getItem('token') || '',
  });

const createSettingsData = async <T>(
  endpoint: string,
  data: Record<string, unknown>
): Promise<T | null | undefined> =>
  makeSettingsApiRequest<T>({
    method: 'POST',
    endpoint,
    data,
    usersToken: token,
  });

const getSettings = async (): Promise<ApiSettings | null | undefined> => {
  const data = await getSettingsData<ApiSettings>('spec-tree/settings');
  return data;
};

const setSettings = async (data: ApiSettings): Promise<ApiSettings | null | undefined> => {
  return createSettingsData<ApiSettings>('spec-tree/settings', data as Record<string, unknown>);
};

const updateUserData = async <T>(
  endpoint: string,
  id: string | number,
  data: Record<string, unknown>
): Promise<T | null | undefined | ApiErrorResponse> =>
  makeApiRequest<T>({
    method: 'PUT',
    endpoint: `${endpoint}/${id}`,
    data,
    usersToken: localStorage.getItem('token') || '',
  });

const updateData = async <T>(
  endpoint: string,
  id: string | number,
  data: Record<string, unknown>
): Promise<T | null | undefined | ApiErrorResponse> =>
  makeApiRequest<T>({
    method: 'PUT',
    endpoint: `${endpoint}/${id}`,
    data,
    usersToken: token,
  });

const deleteData = async <T>(
  endpoint: string,
  id: string
): Promise<T | null | undefined | ApiErrorResponse> =>
  makeApiRequest<T>({
    method: 'DELETE',
    endpoint: `${endpoint}/${id}`,
  });

/**
 * Fetch CMS data with proper typing
 */
const fetchCmsData = async <T>(
  endpoint: string,
  query = 'populate=*'
): Promise<T | null | undefined> => {
  try {
    const response = await getData<{ data: T }>(endpoint, formQueryString(query));
    if (response && !isApiError(response)) {
      return response.data;
    }
    return null;
  } catch (error) {
    handleError(error, endpoint);
    return null;
  }
};
const fetchData = async <T = any>(
  endpoint: string,
  query = 'populate=*'
): Promise<ApiResponse<T> | null | undefined> => {
  try {
    const response = await axios.get(`${API_URL}/api/${endpoint}?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log('Data fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    handleError(error, endpoint);
  }
};
const fetchSingletonTypeData = async <T = any>(
  endpoint: string,
  query = 'populate=*'
): Promise<SingleApiResponse<T> | null | undefined> => {
  try {
    const response = await axios.get(`${API_URL}/api/${endpoint}?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log('Data fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    handleError(error, endpoint);
  }
};
const fetchSingleData = async <T = any>(
  endpoint: string,
  id: string,
  query = 'populate=*'
): Promise<SingleApiResponse<T> | null | undefined> => {
  try {
    const response = await axios.get(
      `${API_URL}/api/${endpoint}/${id}?${query}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // console.log('Data fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    handleError(error, endpoint);
  }
};

const fetchSingleDataByType = async <T = any>(
  endpoint: string,
  type: string,
  value: string,
  query = 'populate=*'
): Promise<SingleApiResponse<T> | null | undefined> => {
  try {
    const response = await axios.get(
      `${API_URL}/api/${endpoint}?${query}&filters[${type}][$eq]=${value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // In Strapi, filtering by a field does not guarantee a single record, so we pick the first one if available.
    const data = response.data?.data?.[0] || null;
    // console.log('Data fetched successfully:', data);
    return { data, meta: {} }; // Adjust this to match the expected structure of SingleApiResponse
  } catch (error) {
    handleError(error, endpoint);
  }
};
// ======================
// Get All Data Functions
// ======================
const refreshUser = async (
  userToken: string
): Promise<UserAttributes | null | undefined> => {
  try {
    const response = await axios.get(`${API_URL}/api/users/me?${userData}`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    // console.log('Data fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    handleError(error, 'users/me');
  }
};

const getUserRole = async (
  userToken: string
): Promise<UserAttributes | null | undefined> => {
  try {
    // TODO-p3: remove populate=* once we have the user role in the user object coming back from the API
    // const par =
    const response = await axios.get(
      `${API_URL}/api/users/me?populate[role]=*`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    // console.log('Data fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    handleError(error, 'users/me');
  }
};

const fetchPosts = async (): Promise<
  ApiResponse<PostAttributes> | null | undefined
> => {
  // TODO: use fetchCmsData instead of fetchData once it is working

  return await fetchData<PostAttributes>('blog-posts');
};
const fetchNewsFeed = async (): Promise<
  ApiResponse<NewsFeedData> | null | undefined
> => {
  // TODO: use fetchCmsData instead of fetchData once it is working

  return await fetchData<NewsFeedData>('news-feeds');
};

// ========================
// Get Data By id Functions
// ========================

const fetchPostsById = async (
  id: string
): Promise<SingleApiResponse<PostAttributes> | null | undefined> => {
  return await fetchSingleData<PostAttributes>('blog-posts', id);
};

const fetchUserInfo = async ({ name }: { name: string }): Promise<ApiResponse<UserAttributes> | ApiErrorResponse> => {
  const nameStructure = name?.split(' ');
  const firstName = nameStructure?.[0];
  const lastName = nameStructure?.[1];
  // TODO-p2: we need to clean this up and make it more efficient, we should have deferent inputs for each field
  if (firstName && lastName) {
    return await fetchData(
      'users',
      `${userData}&filters[$and][0][firstName][$containsi]=${encodeURIComponent(
        firstName
      )}&filters[$and][1][lastName][$containsi]=${encodeURIComponent(
        lastName
      )}&pagination[limit]=25`
    );
  } else {
    return await fetchData(
      'users',
      `${userData}&filters[$or][0][firstName][$containsi]=${name}&filters[$or][1][lastName][$containsi]=${name}&filters[$or][2][email][$containsi]=${name}&filters[$or][3][phoneNumber][$containsi]=${name}&pagination[limit]=25`
    );
  }
};

// ===================================
// Contact management
// ===================================

const fetchHomePageData = async (): Promise<
  SingleApiResponse<HomePageData> | null | undefined
> => {
  // TODO: use fetchCmsData instead of fetchData once it is working
  // populate[testimonialSection]=*&populate[section]=*&populate[section][populate][image]=*&populate[section][populate][button]=*&populate[aboutSection]=*&populate[metricSection]=*&populate[newsletterSection]=*&populate[socialSection][populate][links][populate][icon]=*&
  return await fetchSingletonTypeData<HomePageData>(
    'home-page',
    'populate[heroData][populate][heroImage]=*&populate[ourMissionData]=*&populate[ourServicesData][populate][serviceList]=*&populate[WheelSection][populate][icon]=*&populate[reviews]=*&populate[ourWorkData][populate][image]=*&populate[ourWorkData][populate][icon]=*&populate[ourServicesHeader]=*&populate[OurProcess]=*&populate[ourWorkHeader]=*&populate[reviewsHeader]=*'
  );
};

export interface AboutPageAttributes {
  aboutSection: Section2;
  metricSection: metricCards;
  newsletterSection: Section1;
  socialSection: Section3;
  mediaContent: SingleApiResponse<ImageAttributes>;
  wysiwyg: string;
  mediaContentHeader: string;
  id: number;
}
const fetchAboutPageData = async (): Promise<
  SingleApiResponse<AboutPageAttributes> | null | undefined
> => {
  // TODO: use fetchCmsData instead of fetchData once it is working
  return await fetchSingletonTypeData<AboutPageAttributes>(
    'about-page',
    'populate[aboutSection][populate][cta]=*&populate[metricSection][populate][cards]=*&populate[metricSection][populate][backgroundImage]=*&populate[mediaContent]=*&populate[newsletterSection]=*&populate[socialSection][populate][links][populate][icon]=*'
  );
};

export interface OurProcessPageAttributes {
  id: number;
  aboutSection: Section1;
  sectionTwo: Section1;
  newsletterSection: Section1;
  socialSection: Section3;
  wysiwyg: string;
  wysiwygSectionTwo: string;
  button: CTA;
}
const fetchOurProcessPageData = async (): Promise<
  SingleApiResponse<OurProcessPageAttributes> | null | undefined
> => {
  // TODO: use fetchCmsData instead of fetchData once it is working

  return await fetchSingletonTypeData<OurProcessPageAttributes>(
    'our-process-page',
    'populate[aboutSection]=*&populate[sectionTwo]=*&populate[button]=*&populate[newsletterSection]=*&populate[socialSection][populate][links][populate][icon]=*'
  );
};

export interface TermsPageAttributes {
  aboutSection: Section1;
  id: number;
  contentSection: string;
}
const fetchTermsPageData = async (): Promise<
  SingleApiResponse<TermsPageAttributes> | null | undefined
> => {
  // TODO: use fetchCmsData instead of fetchData once it is working
  return await fetchSingletonTypeData<TermsPageAttributes>('terms-page');
};

export interface PrivacyPageAttributes {
  aboutSection: Section1;
  contentSection: string;
  id: number;
}
const fetchPrivacyPageData = async (): Promise<
  SingleApiResponse<PrivacyPageAttributes> | null | undefined
> => {
  // TODO: use fetchCmsData instead of fetchData once it is working
  return await fetchSingletonTypeData<PrivacyPageAttributes>('privacy-page');
};

export interface CookiesPageAttributes {
  aboutSection: Section1;
  contentSection: string;
  id: number;
  attributes: CookiesPageAttributes;
}
const fetchCookiesPageData = async (): Promise<
  SingleApiResponse<CookiesPageAttributes> | null | undefined
> => {
  // TODO: use fetchCmsData instead of fetchData once it is working
  return await fetchSingletonTypeData<CookiesPageAttributes>('cookies-page');
};

export interface ContactPageAttributes {
  id: number;
  aboutSection: Section1;
  emailSection: Section4;
  phoneSection: Section4;
  contactSection: Section1;
  faqSection: FaqSection;
}
const fetchContactPageData = async (): Promise<
  SingleApiResponse<ContactPageAttributes> | null | undefined
> => {
  // TODO: use fetchCmsData instead of fetchData once it is working

  return await fetchSingletonTypeData<ContactPageAttributes>(
    'contact-page',
    'populate[aboutSection]=*&populate[emailSection]=*&populate[phoneSection]=*&populate[contactSection]=*&populate[faqSection][populate][items]=*'
  );
};

export interface BlogPageAttributes {
  aboutSection: Section1;
  id: number;
}
const fetchBlogPageData = async (): Promise<
  SingleApiResponse<BlogPageAttributes> | null | undefined
> => {
  // TODO: use fetchCmsData instead of fetchData once it is working

  return await fetchSingletonTypeData<BlogPageAttributes>('blog-page');
};

// ===================================
// User Profile Management
// ===================================

const updateUserEmail = async (
  userId: string | number,
  newEmail: string
): Promise<UserData | ApiErrorResponse> => {
  return await updateUserData('users', userId, { email: newEmail });
};
const updateUserPassword = async (
  userId: string | number,
  newPassword: string
): Promise<UserData | ApiErrorResponse> => {
  return await updateUserData('users', userId, { password: newPassword });
};
const updateUserInfo = async ({
  userId,
  data,
}: {
  userId: string;
  data: Partial<UserAttributes>;
}): Promise<UserData | ApiErrorResponse> => {
  return await updateUserData('users', userId, data);
};
const registerNewUser = async (
  usersData: Partial<UserAttributes>
): Promise<{ user: UserData } | boolean> => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/local/register`,
      usersData
    );
    if (response.status === 200) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

const confirmEmail = async (
  confirmationToken: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.get(
      `${API_URL}/api/auth/email-confirmation?confirmation=${confirmationToken}`
    );
    if (response.status === 200) {
      return { success: true, message: 'Email confirmed successfully' };
    }
    return { success: false, message: 'Failed to confirm email' };
  } catch (error: unknown) {
    let message = 'Invalid or expired confirmation token';
    if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
      message = error.response.data.error.message;
    }
    return { success: false, message };
  }
};

const resendConfirmationEmail = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/send-email-confirmation`,
      { email }
    );
    if (response.status === 200) {
      return { success: true, message: 'Confirmation email sent' };
    }
    return { success: false, message: 'Failed to send confirmation email' };
  } catch (error: unknown) {
    let message = 'Failed to send confirmation email';
    if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
      message = error.response.data.error.message;
    }
    return { success: false, message };
  }
};

interface NewsletterSubscription {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

const addToNewsletter = async ({
  email,
  firstName,
  lastName,
  phoneNumber,
}: {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}): Promise<NewsletterSubscription | ApiErrorResponse> => {
  // If not, add the email to the user-group
  return await createData('user-groups/newsletter', {
    email,
    firstName,
    lastName,
    phoneNumber,
  });
};

interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
}

const fetchGoogleReviews = async (placeId: string): Promise<GoogleReview[] | null> => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    return response.data?.result?.reviews ?? null;
  } catch {
    return null;
  }
};
interface ContactFormResponse {
  success: boolean;
  message?: string;
}

const sendContactUsEmail = async (emailDetails: {
  senderEmail: string;
  message: string;
  businessInfo: string;
  name: string;
  phoneNumber: string;
}): Promise<ContactFormResponse | ApiErrorResponse> => {
  const emailData = {
    email: emailDetails.senderEmail,
    message: `Message: ${emailDetails.message} Business Info: ${emailDetails.businessInfo}`,
    name: emailDetails.name,
    phoneNumber: emailDetails.phoneNumber,
  };
  return await createData('contact-page/contact', emailData);
};

interface CommentData {
  id: number;
  post: string;
  user: string;
  content: string;
  createdAt: string;
}

const createComment = async (
  postId: string,
  commentData: {
    post: string;
    user: string;
    content: string;
  }
): Promise<CommentData | ApiErrorResponse> => {
  commentData.post = postId;
  return await createData('comments', commentData);
};

export {
  // helpers
  fetchSingleData,
  fetchData,
  fetchCmsData,
  makeApiRequest,
  // ======================
  // tested / typed functions
  // ======================

  // Get All Data Functions
  fetchPosts,
  fetchNewsFeed,
  fetchUserInfo,
  // Get Data By id Functions
  fetchPostsById,

  // ======================
  // Untested functions
  // ======================
  refreshUser,
  addToNewsletter,
  updateUserEmail,
  updateUserInfo,
  registerNewUser,
  confirmEmail,
  resendConfirmationEmail,
  updateUserPassword,
  createComment,
  sendContactUsEmail,
  // ======================
  // Functions that are broken
  // ======================
  fetchGoogleReviews,

  // Content management data
  fetchHomePageData,
  fetchAboutPageData,
  fetchOurProcessPageData,
  fetchTermsPageData,
  fetchPrivacyPageData,
  fetchCookiesPageData,
  fetchContactPageData,
  fetchBlogPageData,
  getUserRole,

  // API ONLY FUNCTIONS
  getSettings,
  setSettings,

  // Cart Functions
};
