import { StaticImageData } from 'next/image';

export interface IndustryFeature {
  title: string;
  description: string;
  icon: keyof typeof import('@/components/shared/icons').Icons;
}

export interface IndustrySolution {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  features: IndustryFeature[];
  benefits: string[];
  keyMetrics: {
    value: string;
    label: string;
  }[];
  caseStudies: {
    id: string;
    title: string;
    href: string;
  }[];
}

export interface RoleSolution {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  keyResponsibilities: string[];
  challenges: string[];
  benefits: {
    title: string;
    description: string;
    icon: keyof typeof import('@/components/shared/icons').Icons;
  }[];
  features: string[];
}

export interface SolutionsData {
  industries: IndustrySolution[];
  roles: RoleSolution[];
}
