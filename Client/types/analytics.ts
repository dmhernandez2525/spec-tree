export interface TaskMetric {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTotal: number;
  averageCompletionTime: number;
}

export interface GenerationMetric {
  totalGenerated: number;
  epicsGenerated: number;
  featuresGenerated: number;
  userStoriesGenerated: number;
  tasksGenerated: number;
  averageGenerationTime: number;
  successRate: number;
}

export interface EditMetric {
  totalEdits: number;
  epicsEdited: number;
  featuresEdited: number;
  userStoriesEdited: number;
  tasksEdited: number;
  averageEditTime: number;
  mostEditedType: 'epic' | 'feature' | 'userStory' | 'task';
}

export interface TimelineMetric {
  date: string;
  generatedItems: number;
  editedItems: number;
  completedItems: number;
}

export interface ProjectMetric {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageProjectDuration: number;
  projectSuccessRate: number;
}

export interface UserActivityMetric {
  totalUsers: number;
  activeUsers: number;
  mostActiveTime: string;
  averageSessionDuration: number;
  userEngagementRate: number;
}

export interface AnalyticsDuration {
  startDate: string;
  endDate: string;
}

export interface AnalyticsState {
  taskMetrics: TaskMetric;
  generationMetrics: GenerationMetric;
  editMetrics: EditMetric;
  timelineMetrics: TimelineMetric[];
  projectMetrics: ProjectMetric;
  userActivityMetrics: UserActivityMetric;
  duration: AnalyticsDuration;
  isLoading: boolean;
  error: string | null;
}
