import type { Task } from '../types/task';
import { CalendarDays, Circle } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => Promise<void>;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
  onEdit: (task: Task) => void;
  isBusy: boolean;
}

const PRIORITY_STYLES: Record<Task['priority'], string> = {
  high: 'bg-rose-50 text-rose-700 border-rose-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200'
};

const formatDueDate = (dueDate: string | null) => {
  if (!dueDate) {
    return 'No due date';
  }

  return new Date(dueDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function TaskItem({
  task,
  onDelete,
  onToggleComplete,
  onEdit,
  isBusy
}: TaskItemProps) {
  const getCalendarUrl = () => {
    const text = encodeURIComponent(task.title);
    const details = encodeURIComponent(task.notes || '');
    let datesParam = '';

    if (task.dueDate) {
      const start = new Date(task.dueDate);
      if (task.dueTime) {
        const [h, m] = task.dueTime.split(':').map(Number);
        start.setHours(h, m, 0);
      } else {
        start.setHours(9, 0, 0); // Default 9 AM
      }
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration
      const toUTC = (d: Date) => d.toISOString().replace(/-|:|\.\d{3}/g, '');
      datesParam = `&dates=${toUTC(start)}/${toUTC(end)}`;
    }

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}${datesParam}`;
  };

  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3
            className={`text-base font-semibold tracking-tight ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}
          >
            {task.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <CalendarDays size={14} />
            <span>
              {formatDueDate(task.dueDate)} {task.dueTime ? `at ${task.dueTime}` : ''}
            </span>
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
            PRIORITY_STYLES[task.priority]
          }`}
        >
          {task.priority}
        </span>
      </div>

      {task.notes ? (
        <p className="mb-3 max-h-12 overflow-hidden text-sm text-slate-600">{task.notes}</p>
      ) : (
        <p className="mb-3 text-sm italic text-slate-400">No notes</p>
      )}

      {task.tags.length ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {task.tags.map((tag) => (
            <span
              key={`${task._id}-${tag}`}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
            >
              <Circle size={8} />
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <a
          href={getCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
        >
          Add to Calendar
        </a>

        <button
          type="button"
          onClick={() => onToggleComplete(task._id, !task.completed)}
          disabled={isBusy}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
            task.completed
              ? 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          } disabled:opacity-70`}
        >
          {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
        </button>

        <button
          type="button"
          onClick={() => onEdit(task)}
          disabled={isBusy}
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-70"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(task._id)}
          disabled={isBusy}
          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-70"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
