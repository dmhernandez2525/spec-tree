import { Timestamps, ImageAttributes } from '@/types/main';
export interface UserData {
  id: number;
  documentId: string;
  attributes: UserAttributes;
}

export interface UserAttributes extends Timestamps {
  id: number;
  documentId: string;
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
  avatar: ImageAttributes;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  company?: string;
  role?: string;
  bio?: string;
  organization: {
    name: string;
    address: string;
    phoneNumber: string;
    email: string;
    website: string;
    size: string;
    industry:
      | 'technology'
      | 'finance'
      | 'healthcare'
      | 'education'
      | 'manufacturing'
      | 'retail'
      | 'other';
  };
  userRole: 'admin' | 'user' | 'owner';
}
