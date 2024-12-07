export type ResourceType =
  | 'all'
  | 'documentation'
  | 'guide'
  | 'api-reference'
  | 'case-study'
  | 'tutorial';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: Exclude<ResourceType, 'all'>;
  category: string;
  readTime: number;
  lastUpdated: string;
  imageUrl: string;
  href: string;
}
