import TaskItem from './TaskItem';
import type { Task } from '../types/task';
import type { UserInfo } from '../api/tasksApi';

interface TaskListProps {
  tasks: Task[];
  onDelete: (id: string) => Promise<void>;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
  onEdit: (task: Task) => void;
  busyTaskId: string | null;
  users: UserInfo[];
}

export default function TaskList({
  tasks,
  onDelete,
  onToggleComplete,
  onEdit,
  busyTaskId,
  users
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
        No tasks found for the current filters.
      </div>
    );
  }

  return (
    <ul className="grid gap-3">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          isBusy={busyTaskId === task._id}
          users={users}
        />
      ))}
    </ul>
  );
}
