import axios, { AxiosResponse, Method } from 'axios';
// TODO-p2: update how we pull env variables
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

// ======================== Reusable Parameters ========================
// TODO-p2: make this into a file
// This is a section for repeatable parameters that are used in the api calls
const userData = 'populate[confirmed]=*&populate[blocked]=*';

// ======================== Reusable Parameters ========================

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

const handleError = (
  error: any,
  endpoint: string
): {
  error: any;
} => {
  console.error(`Error in API call to ${API_URL}/${endpoint}`);
  console.error(
    'Error details for fetching ${endpoint} data:',
    JSON.stringify(error, null, 2)
  );

  return {
    error,
  };
};
// Generic API request function
async function makeApiRequest<T>({
  method,
  endpoint,
  data,
  params,
  usersToken,
}: {
  method: Method;
  endpoint: string;
  data?: any;
  params?: any;
  usersToken?: string;
}): Promise<
  | T
  | null
  | undefined
  | {
      error: any;
    }
> {
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
    // console.log(`API Request successful: ${method} ${url}`);
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
  data?: any;
  params?: any;
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
    // console.log(`API Request successful: ${method} ${url}`);
    return response.data;
  } catch (error) {
    handleError(error, endpoint);
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
): Promise<
  | T
  | null
  | undefined
  | {
      error: any;
    }
> =>
  makeApiRequest<T>({
    method: 'GET',
    endpoint,
    params,
  });
// Simplified API functions
const getSettingsData = async <T>(
  endpoint: string,
  params?: URLSearchParams
): Promise<T | null | undefined> =>
  makeSettingsApiRequest<T>({
    method: 'GET',
    endpoint,
    params,
  });

const createData = async <T>(
  endpoint: string,
  data: any
): Promise<
  | T
  | null
  | undefined
  | {
      error: any;
    }
> =>
  makeApiRequest<T>({
    method: 'POST',
    endpoint,
    data,
    usersToken: token,
  });

const updateMemData = async <T>(
  endpoint: string,
  id: string | number,

  data: any
): Promise<
  | T
  | null
  | undefined
  | {
      error: any;
    }
> =>
  makeApiRequest<T>({
    method: 'POST',
    endpoint: `${endpoint}/${id}`,
    data,
    usersToken: localStorage.getItem('token') || '',
  });
const createSettingsData = async <T>(
  endpoint: string,
  data: any
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

const setSettings = async (data: ApiSettings) => {
  return createSettingsData('spec-tree/settings', data);
};

const updateUserData = async <T>(
  endpoint: string,
  id: string | number,
  data: any
): Promise<
  | T
  | null
  | undefined
  | {
      error: any;
    }
> =>
  makeApiRequest<T>({
    method: 'PUT',
    endpoint: `${endpoint}/${id}`,
    data,
    usersToken: localStorage.getItem('token') || '',
  });

const updateData = async <T>(
  endpoint: string,
  id: string | number,
  data: any
): Promise<
  | T
  | null
  | undefined
  | {
      error: any;
    }
> =>
  makeApiRequest<T>({
    method: 'PUT',
    endpoint: `${endpoint}/${id}`,
    data,
    usersToken: token,
  });

const deleteData = async <T>(
  endpoint: string,
  id: string
): Promise<
  | T
  | null
  | undefined
  | {
      error: any;
    }
> =>
  makeApiRequest<T>({
    method: 'DELETE',
    endpoint: `${endpoint}/${id}`,
  });
// Interface definitions for types (Example)

const fetchCmsData = async (
  endpoint: string,
  query = 'populate=*'
): Promise<any> => {
  try {
    const response: any = await getData(endpoint, formQueryString(query));
    // console.log('Data fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    handleError(error, endpoint);
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

const fetchUserInfo = async ({ name }: { name: string }): Promise<any> => {
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
// TODO
// ===================================

//// Get user associated users

const updateUserEmail = async (
  userId: string | number,
  newEmail: string
): Promise<any> => {
  return await updateUserData('users', userId, { email: newEmail });
};
const updateUserPassword = async (
  userId: string | number,
  newPassword: string
): Promise<any> => {
  return await updateUserData('users', userId, { password: newPassword });
};
const updateUserInfo = async ({
  userId,
  data,
}: {
  userId: string;
  data: Partial<UserAttributes>;
}): Promise<any> => {
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
    console.error('Registration failed:', error);
    return false;
  }
};

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
}): Promise<any> => {
  // If not, add the email to the user-group
  return await createData('user-groups/newsletter', {
    email,
    firstName,
    lastName,
    phoneNumber,
  });
};

const fetchGoogleReviews = async (placeId: string): Promise<any> => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    return response.data?.result?.reviews;
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return null;
  }
};
const sendContactUsEmail = async (emailDetails: {
  senderEmail: string;
  message: string;
  businessInfo: string;
  name: string;
  phoneNumber: string;
}): Promise<any> => {
  const emailData = {
    email: emailDetails.senderEmail,
    message: `Message: ${emailDetails.message} Business Info: ${emailDetails.businessInfo}`,
    name: emailDetails.name,
    phoneNumber: emailDetails.phoneNumber,
  };
  return await createData('contact-page/contact', emailData);
};
const createComment = async (
  postId: string,
  commentData: {
    post: string;
    user: string;
    content: string;
  }
): Promise<any> => {
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
