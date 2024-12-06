export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface Partner {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
}

export interface TechnologyStack {
  category: string;
  technologies: {
    name: string;
    description: string;
    iconUrl: string;
    link?: string;
  }[];
}

export interface CompanyValue {
  title: string;
  description: string;
  icon: keyof typeof import('@/components/shared/icons').Icons;
}

export interface AboutPageData {
  vision: string;
  mission: string;
  values: CompanyValue[];
  whySpecTree: {
    title: string;
    description: string;
    keyPoints: {
      title: string;
      description: string;
      icon: keyof typeof import('@/components/shared/icons').Icons;
    }[];
  };
  team: TeamMember[];
  techStack: TechnologyStack[];
  partners: Partner[];
}
