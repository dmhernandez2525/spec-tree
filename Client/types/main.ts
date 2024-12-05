interface ApiSettings {}
interface UserData {
  id: number;
  attributes: UserAttributes;
}
interface UserAttributes extends Timestamps {
  id: number;
  password?: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  gender: string | null;
  dateOfBirth: string | null;
  hasNoEmail: boolean | null;
  createdAt: string;
  updatedAt: string;
  stripUserId: string;
  qboUserId: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}
interface NewsFeedData {
  id: number;
  attributes: NewsFeedAttributes;
}
interface NewsFeedAttributes extends Timestamps {
  title: string;
  description: string;
  flyer?: SingleApiResponse<ImageAttributes>;
  backgroundImage?: SingleApiResponse<ImageAttributes>;
  button: ButtonAttributes;
}
interface ButtonAttributes {
  id: number;
  text: string;
  url: string;
}

interface PostAttributes extends Timestamps {
  id: number;
  color?: string;
  title: string;
  description: string;
  entireBlogPage: string;
  headerImage?: SingleApiResponse<ImageAttributes>;

  createdBy: {
    data: {
      attributes: { firstname: string; lastname: string; createdAt: string };
    };
  };
  updatedBy: {
    data: {
      attributes: { firstname: string; lastname: string; updatedAt: string };
    };
  };
}
interface Timestamps {
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}
interface ApiResponse<T> {
  data: T[];
  meta: {
    pagination: PaginationMeta;
  };
}
interface SingleApiResponse<T> {
  data: T;
  meta: {};
}

interface ImageAttributes extends Timestamps {
  id: number;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any | null;
}

interface Section1 {
  header: string;
  subHeader: string;
  headerColor?: string;
}
interface Section4 extends Section1 {
  helperText: string;
}
interface FaqSection extends Section1 {
  items: Section1[];
}
interface CTA {
  text: string;
  url: string;
}
interface Info {
  icon: string;
  text: string;
}
interface Links {
  icon: SingleApiResponse<ImageAttributes>;
  link: string;
}
interface Section2 extends Section1 {
  cta: CTA;
}

interface Section5 extends Section1 {
  items: Info[];
}
interface Section3 extends Section1 {
  links: Links[];
}
interface metricCards extends Section1 {
  cards: Section1[];
  backgroundImage: SingleApiResponse<ImageAttributes>;
}

interface ServiceListItem {
  id: number;
  listEntry: string;
}

interface ServiceData {
  Service: string;
  ServiceDescription: string;
  serviceList: ServiceListItem[];
  ServiceTitle: string;
  ListTitle: string;
}
interface Step {
  id: number;
  title: string;
  subHeader: string;
  description: string;
  color: string;
  icon?: { url: string; caption: string };
}

interface Review {
  text: string;
  id: number;
}

interface ourWork {
  heading: string;
  description: string;
  id: number;
  image: { url: string; caption: string };
  icon: { url: string; caption: string };
  backgroundColor: string;
}

interface ourMission {
  Header: string;
  HeaderColor: string;
  SubHeader1: string;
  SubHeader2: string;
  SubHeader3: string;
}

interface HomePageData {
  heroData: {
    Header: Text;
    SubHeader: Text;
    heroImage: { url: string; caption: string };
  };
  ourMissionData: ourMission;
  ourServicesData: ServiceData[];
  WheelSection: Step[];
  reviews: Review[];
  ourWorkData: ourWork[];
  ourServicesHeader: { Header: string; HeaderColor: string };
  OurProcess: { Header: string; HeaderColor: string };
  ourWorkHeader: { Header: string; HeaderColor: string };
  reviewsHeader: { Header: string; HeaderColor: string };
  showReviews: Boolean;
}

interface IAdditionalUsersToNotify {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  relationship?: string;
}
interface IEmergencyContact {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  relationship?: string;
}

interface NewsPopupAttributes extends Timestamps {
  title: string;
  description: string;
  flyer?: SingleApiResponse<ImageAttributes>;
  button: ButtonAttributes;
}
interface NewsPopupData {
  id: number;
  attributes: NewsPopupAttributes;
}
export type {
  ApiSettings,
  Timestamps,
  PaginationMeta,
  ApiResponse,
  SingleApiResponse,
  ImageAttributes,
  UserAttributes,
  UserData,
  ButtonAttributes,
  NewsFeedAttributes,
  NewsFeedData,
  PostAttributes,
  Section1,
  Section4,
  FaqSection,
  CTA,
  Info,
  Links,
  Section2,
  Section5,
  Section3,
  ServiceData,
  metricCards,
  HomePageData,
  IAdditionalUsersToNotify,
  IEmergencyContact,
  NewsPopupData,
};
