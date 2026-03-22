import { useEffect, useState } from 'react';
import type { Task, TaskPayload } from '../types/task';

interface TaskFormState {
  title: string;
  priority: TaskPayload['priority'];
  dueDate: string;
  dueTime: string;
  notes: string;
  tags: string;
}

interface TaskFormProps {
  onSubmitTask: (payload: TaskPayload) => Promise<void>;
  isSubmitting: boolean;
  editingTask: Task | null;
  onCancelEdit: () => void;
}

const INITIAL_FORM: TaskFormState = {
  title: '',
  priority: 'medium',
  dueDate: '',
  dueTime: '',
  notes: '',
  tags: ''
};

const toFormState = (task: Task): TaskFormState => ({
  title: task.title,
  priority: task.priority,
  dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
  dueTime: task.dueTime || '',
  notes: task.notes || '',
  tags: task.tags.join(', ')
});

export default function TaskForm({
  onSubmitTask,
  isSubmitting,
  editingTask,
  onCancelEdit
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
        .filter(Boolean)
    };

    await onSubmitTask(payload);

    if (!editingTask) {
      setForm(INITIAL_FORM);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600 sm:col-span-2">
          Title
          <input
            type="text"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="Task title"
            required
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
          Priority
          <select
            value={form.priority}
            onChange={(event) => updateField('priority', event.target.value as TaskPayload['priority'])}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
          Due Date
          <input
            type="date"
            value={form.dueDate}
            onChange={(event) => updateField('dueDate', event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
          Due Time
          <input
            type="time"
            value={form.dueTime}
            onChange={(event) => updateField('dueTime', event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600 sm:col-span-2">
          Tags (comma separated)
          <input
            type="text"
            value={form.tags}
            onChange={(event) => updateField('tags', event.target.value)}
            placeholder="work, backend, urgent"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600 sm:col-span-2">
          Notes
          <textarea
            rows={3}
            value={form.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Add supporting notes"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (editingTask ? 'Updating...' : 'Creating...') : editingTask ? 'Update Task' : 'Add New Task'}
        </button>

        {editingTask ? (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={isSubmitting}
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-70"
          >
            Cancel Edit
          </button>
        ) : null}
      </div>
    </form>
  );
}
