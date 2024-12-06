export type TutorialCategory =
  | 'all'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export interface TutorialChapter {
  title: string;
  timestamp: string;
}

export interface TutorialAuthor {
  name: string;
  role: string;
  avatarUrl: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  type: 'tutorial';
  category: Exclude<TutorialCategory, 'all'>;
  duration: number;
  lastUpdated: string;
  thumbnailUrl: string;
  videoUrl: string;
  chapters: TutorialChapter[];
  author: TutorialAuthor;
}
