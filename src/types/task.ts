export type Priority = 'low' | 'medium' | 'high';

export interface UserInfo {
  _id: string;
  name: string;
  email: string;
}

export interface Task {
  _id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  dueTime: string;
  notes: string;
  tags: string[];
  createdAt: string;
  completedAt?: string | null;
  assignedTo?: string | UserInfo | null;
  collaborators?: (string | UserInfo)[];
  userId?: string | UserInfo;
  commentCount?: number;
}

export interface TaskPayload {
  title: string;
  priority: Priority;
  dueDate: string | null;
  dueTime: string;
  notes: string;
  tags: string[];
  completed?: boolean;
  completedAt?: string | null;
  assignedTo?: string | null;
  collaborators?: string[];
}

export interface TaskFilters {
  priority: 'all' | Priority;
  completed: 'all' | 'completed' | 'incomplete';
  sort:
    | 'dueDateAsc'
    | 'dueDateDesc'
    | 'priorityHigh'
    | 'priorityLow'
    | 'createdAtDesc'
    | 'createdAtAsc';
  tags: string;
}

export interface TaskComment {
  _id: string;
  task: string;
  user: UserInfo;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskActivity {
  _id: string;
  task: string;
  user: UserInfo;
  action: string;
  details?: Record<string, any>;
  createdAt: string;
}
