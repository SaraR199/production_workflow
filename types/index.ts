// Core workflow types for author production management

export type TaskStatus =
  | 'not_started'
  | 'brainstorming'
  | 'outlining'
  | 'first_draft'
  | 'self_edit'
  | 'beta_readers'
  | 'revision'
  | 'copy_edit'
  | 'proofreading'
  | 'final'
  | 'published'
  | 'blocked';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskType =
  | 'chapter'
  | 'section'
  | 'scene'
  | 'revision'
  | 'research'
  | 'review'
  | 'editing'
  | 'publishing'
  | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  parentId?: string; // For hierarchical tasks

  // Deadlines and scheduling
  createdAt: string; // ISO date string
  updatedAt: string;
  deadline?: string; // ISO date string
  estimatedHours?: number;
  actualHours?: number;

  // Progress tracking
  wordCountGoal?: number;
  wordCountCurrent?: number;
  percentComplete?: number;

  // Dependencies
  dependsOn?: string[]; // Array of task IDs
  blockedBy?: string;
  blockedReason?: string;

  // Metadata
  tags?: string[];
  notes?: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  type: 'novel' | 'short_story' | 'article' | 'non_fiction' | 'screenplay' | 'other';

  // Dates
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  targetPublishDate?: string;

  // Progress
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
  totalWordCountGoal?: number;
  currentWordCount?: number;

  // Metadata
  genre?: string;
  tags?: string[];
  notes?: string;
}

export interface ProgressMetrics {
  projectId: string;
  date: string; // ISO date string

  // Daily metrics
  wordsWritten: number;
  tasksCompleted: number;
  hoursWorked: number;

  // Cumulative
  totalWords: number;
  totalTasks: number;
  completedTasks: number;
}

export interface WorkflowAnalysis {
  projectId: string;
  generatedAt: string;

  // AI-generated insights
  overdueTasks: Task[];
  upcomingDeadlines: Task[];
  blockedTasks: Task[];
  suggestedPriorities: string[];
  estimatedCompletion?: string;
  bottlenecks?: string[];
  recommendations?: string[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Storage schema
export interface DataStore {
  projects: Project[];
  tasks: Task[];
  metrics: ProgressMetrics[];
  version: string;
  lastUpdated: string;
}
