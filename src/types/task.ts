export type Priority = 'low' | 'medium' | 'high';

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
  assignedTo?: string;
}

export interface TaskPayload {
  title: string;
  priority: Priority;
  dueDate: string | null;
  dueTime: string;
  notes: string;
  tags: string[];
  completed?: boolean;
  assignedTo?: string;
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
