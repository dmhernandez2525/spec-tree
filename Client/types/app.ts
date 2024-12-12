import { App } from '@/components/spec-tree/lib/types/work-items';
import { UserAttributes } from '@/types/user';
export type AppStatus = 'draft' | 'live' | 'archived';
export type ViewMode = 'grid' | 'list';

export interface AppTag {
  id: string;
  name: string;
  color: string;
}

export interface AppMetrics {
  health: number; // 0-100
  lastDeployment?: Date;
  uptime: number; // percentage
  errors24h: number;
}

// TODO: fix this inconstancy
export interface AppExtended extends App {
  id: string;
  status: AppStatus;
  modifiedAt: Date;
  tags: AppTag[];
  teamMembers: UserAttributes[];
  metrics: AppMetrics;
  category?: string;
  isFavorite: boolean;
  isExpanded?: boolean;
  accessCount: number;
  archivedAt?: Date;
}

export interface SearchFilters {
  status?: AppStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  category?: string;
  searchQuery: string;
}

export interface SortOption {
  label: string;
  value: 'name' | 'modified' | 'created' | 'access' | 'health';
  direction: 'asc' | 'desc';
}
