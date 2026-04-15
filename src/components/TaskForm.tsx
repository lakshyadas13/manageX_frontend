import { useEffect, useState } from 'react';
import type { Task, TaskPayload } from '../types/task';
import type { UserInfo } from '../api/tasksApi';
import UserAssignDropdown from './features/UserAssignDropdown';
import { Type, Flag, CalendarDays, Clock, Tags, AlignLeft } from 'lucide-react';

interface TaskFormState {
  title: string;
  priority: TaskPayload['priority'];
  dueDate: string;
  dueTime: string;
  notes: string;
  tags: string;
  assignedTo: string;
}

interface TaskFormProps {
  onSubmitTask: (payload: TaskPayload) => Promise<void>;
  isSubmitting: boolean;
  editingTask: Task | null;
  onCancelEdit: () => void;
  users: UserInfo[];
}

const INITIAL_FORM: TaskFormState = {
  title: '',
  priority: 'medium',
  dueDate: '',
  dueTime: '',
  notes: '',
  tags: '',
  assignedTo: ''
};

const toFormState = (task: Task): TaskFormState => ({
  title: task.title,
  priority: task.priority,
  dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
  dueTime: task.dueTime || '',
  notes: task.notes || '',
  tags: task.tags.join(', '),
  assignedTo: task.assignedTo || ''
});

export default function TaskForm({
  onSubmitTask,
  isSubmitting,
  editingTask,
  onCancelEdit,
  users
}: TaskFormProps) {
  const [form, setForm] = useState<TaskFormState>(INITIAL_FORM);

  useEffect(() => {
    setForm(editingTask ? toFormState(editingTask) : INITIAL_FORM);
  }, [editingTask]);

  const updateField = <K extends keyof TaskFormState>(key: K, value: TaskFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = form.title.trim();

    if (!trimmedTitle) {
      return;
    }

    const payload: TaskPayload = {
      title: trimmedTitle,
      priority: form.priority,
      dueDate: form.dueDate || null,
      dueTime: form.dueTime,
      notes: form.notes,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      assignedTo: form.assignedTo || undefined
    };

    await onSubmitTask(payload);

    if (!editingTask) {
      setForm(INITIAL_FORM);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
          <div className="flex items-center gap-1.5">
            <Type size={14} className="text-indigo-400" />
            Title
          </div>
          <input
            type="text"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="Task title"
            required
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/50 hover:border-indigo-200"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          <div className="flex items-center gap-1.5">
            <Flag size={14} className="text-indigo-400" />
            Priority
          </div>
          <select
            value={form.priority}
            onChange={(event) => updateField('priority', event.target.value as TaskPayload['priority'])}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/50 hover:border-indigo-200"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={14} className="text-indigo-400" />
            Due Date
          </div>
          <input
            type="date"
            value={form.dueDate}
            onChange={(event) => updateField('dueDate', event.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/50 hover:border-indigo-200"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-indigo-400" />
            Due Time
          </div>
          <input
            type="time"
            value={form.dueTime}
            onChange={(event) => updateField('dueTime', event.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/50 hover:border-indigo-200"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
          <div className="flex items-center gap-1.5">
            <Tags size={14} className="text-indigo-400" />
            Tags (comma separated)
          </div>
          <input
            type="text"
            value={form.tags}
            onChange={(event) => updateField('tags', event.target.value)}
            placeholder="work, backend, urgent"
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/50 hover:border-indigo-200"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
          <div className="flex items-center gap-1.5">
            <AlignLeft size={14} className="text-indigo-400" />
            Notes
          </div>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Add supporting notes"
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/50 hover:border-indigo-200"
          />
        </label>
        
        <div className="sm:col-span-2 pt-1 border-t border-slate-100">
          <UserAssignDropdown 
            users={users} 
            selectedUserId={form.assignedTo} 
            onChange={(val) => updateField('assignedTo', val)} 
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md border border-indigo-600 bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100/50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (editingTask ? 'Updating...' : 'Creating...') : editingTask ? 'Update Task' : 'Add New Task'}
        </button>

        {editingTask ? (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={isSubmitting}
            className="rounded-md border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100/50 disabled:opacity-70"
          >
            Cancel Edit
          </button>
        ) : null}
      </div>
    </form>
  );
}
