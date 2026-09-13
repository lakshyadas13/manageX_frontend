import { useMemo } from 'react';
import type { Task, UserInfo } from '../types/task';
import {
  CalendarPlus,
  CheckCircle2,
  Clock3,
  Flag,
  Info,
  ListTodo,
  Pencil,
  RotateCcw,
  StickyNote,
  Tag,
  Trash2
} from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => Promise<void>;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
  onEdit: (task: Task) => void;
  onOpenDetails: (task: Task) => void;
  isBusy: boolean;
  users: UserInfo[];
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
  onOpenDetails,
  isBusy,
  users
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

  const resolvedCollaborators: UserInfo[] = useMemo(() => {
    const collabs: UserInfo[] = [];
    if (Array.isArray(task.collaborators) && task.collaborators.length > 0) {
      task.collaborators.forEach((c) => {
        if (typeof c === 'string') {
          const found = users.find((u) => u._id === c);
          if (found) collabs.push(found);
        } else if (c && c._id) {
          collabs.push(c);
        }
      });
    } else if (task.assignedTo) {
      const id = typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo._id;
      const found = users.find((u) => u._id === id);
      if (found) collabs.push(found);
    }
    return collabs;
  }, [task.collaborators, task.assignedTo, users]);

  // Determine state colors based on completion and urgency
  let cardBg = '';

  if (task.completed) {
    cardBg = 'bg-emerald-50/60 border-emerald-200 shadow-sm';
  } else {
    let isUrgent = false;
    if (task.priority === 'high') isUrgent = true;
    if (task.dueDate) {
      const ts = new Date(task.dueDate).getTime();
      if (ts - Date.now() <= 24 * 60 * 60 * 1000) isUrgent = true;
    }

    if (isUrgent) {
      cardBg = 'bg-orange-50/50 border-orange-200 shadow-sm';
    } else {
      cardBg = 'bg-sky-50/40 border-sky-200 shadow-sm';
    }
  }

  return (
    <li className={`rounded-2xl border p-5 transition-all duration-200 hover:shadow-md ${cardBg}`}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-[200px]">
          <h3
            onClick={() => onOpenDetails(task)}
            className={`text-base font-medium tracking-tight flex items-start gap-2 cursor-pointer hover:underline ${
              task.completed ? 'text-slate-500 line-through' : 'text-slate-900'
            }`}
          >
            {task.completed ? (
              <CheckCircle2 size={16} className="text-emerald-500 mt-1 shrink-0" />
            ) : (
              <ListTodo size={16} className="text-indigo-500 mt-1 shrink-0" />
            )}
            <span>{task.title}</span>
          </h3>

          <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-sm font-medium text-slate-600 ml-6">
            <span className="flex items-center gap-1.5">
              <Clock3 size={14} className="text-indigo-400 shrink-0" />
              <span>
                {formatDueDate(task.dueDate)} {task.dueTime ? `at ${task.dueTime}` : ''}
              </span>
            </span>

            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                PRIORITY_STYLES[task.priority]
              }`}
            >
              <Flag size={11} className="shrink-0" />
              {task.priority}
            </span>

            {/* Compact Overlapping Collaborator Avatars */}
            {resolvedCollaborators.length > 0 && (
              <div
                onClick={() => onOpenDetails(task)}
                className="flex items-center -space-x-1.5 cursor-pointer hover:opacity-80 transition py-0.5"
                title={resolvedCollaborators.map((u) => u.name).join(', ')}
              >
                {resolvedCollaborators.slice(0, 3).map((user) => (
                  <span
                    key={user._id}
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 border-2 border-white text-[9px] font-bold text-indigo-700 shadow-xs"
                    title={user.name}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ))}
                {resolvedCollaborators.length > 3 && (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 border-2 border-white text-[9px] font-bold text-slate-600 shadow-xs">
                    +{resolvedCollaborators.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons at Top Right */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* View Details */}
          <button
            type="button"
            onClick={() => onOpenDetails(task)}
            title="View Details"
            aria-label="View Details"
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-xs"
          >
            <Info size={15} />
            {(task.commentCount || 0) > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white shadow-xs">
                {task.commentCount}
              </span>
            )}
          </button>

          {/* Add to Calendar */}
          <a
            href={getCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            title="Add to Calendar"
            aria-label="Add to Calendar"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-xs"
          >
            <CalendarPlus size={15} />
          </a>

          {/* Mark as Complete / Mark as Pending */}
          <button
            type="button"
            onClick={() => onToggleComplete(task._id, !task.completed)}
            disabled={isBusy}
            title={task.completed ? 'Mark as Pending' : 'Mark as Complete'}
            aria-label={task.completed ? 'Mark as Pending' : 'Mark as Complete'}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 disabled:opacity-50 shadow-xs ${
              task.completed
                ? 'border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 focus:ring-amber-100'
                : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus:ring-emerald-100'
            }`}
          >
            {task.completed ? <RotateCcw size={15} /> : <CheckCircle2 size={16} />}
          </button>

          {/* Edit Task */}
          <button
            type="button"
            onClick={() => onEdit(task)}
            disabled={isBusy}
            title="Edit Task"
            aria-label="Edit Task"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-100 disabled:opacity-50 shadow-xs"
          >
            <Pencil size={15} />
          </button>

          {/* Delete Task */}
          <button
            type="button"
            onClick={() => onDelete(task._id)}
            disabled={isBusy}
            title="Delete Task"
            aria-label="Delete Task"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-100 disabled:opacity-50 shadow-xs"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {task.notes ? (
        <div className="mb-3 flex items-start gap-1.5 text-sm text-slate-600">
          <StickyNote size={14} className="text-indigo-400 mt-0.5 shrink-0" />
          <p className="max-h-12 overflow-hidden">{task.notes}</p>
        </div>
      ) : (
        <div className="mb-3 flex items-center gap-1.5 text-sm italic text-slate-400">
          <StickyNote size={14} className="text-slate-300 shrink-0" />
          <span>No notes</span>
        </div>
      )}

      {task.tags.length ? (
        <div className="flex flex-wrap gap-2">
          {task.tags.map((tag) => (
            <span
              key={`${task._id}-${tag}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
            >
              <Tag size={11} className="text-indigo-400 shrink-0" />
              <span>{tag}</span>
            </span>
          ))}
        </div>
      ) : null}
    </li>
  );
}
