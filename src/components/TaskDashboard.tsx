import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity } from 'lucide-react';
import type { Task, TaskFilters as TaskFiltersType, TaskPayload } from '../types/task';
import TaskFilters from './TaskFilters';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import ProgressHeatmap from './ProgressHeatmap';
import {
  createTask as createTaskApi,
  deleteTask as deleteTaskApi,
  getTasks,
  updateTask as updateTaskApi
} from '../api/tasksApi';

const INITIAL_FILTERS: TaskFiltersType = {
  priority: 'all',
  completed: 'all',
  sort: 'dueDateAsc',
  tags: ''
};

const toDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const toCreatedDateKey = (createdAt: string) => toDateKey(new Date(createdAt));

const getCompletionStorageKey = (userId: string) => `managex-completion-date-by-task:${userId}`;

const readCompletionDateMap = (userId: string): Record<string, string> => {
  try {
    const raw = localStorage.getItem(getCompletionStorageKey(userId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

interface TaskDashboardProps {
  onLogout: () => void;
  userName: string;
  userId: string;
}

export default function TaskDashboard({ onLogout, userName, userId }: TaskDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFiltersType>(INITIAL_FILTERS);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState('');
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [completionDateByTask, setCompletionDateByTask] = useState<Record<string, string>>({});
  const progressWrapperRef = useRef<HTMLDivElement | null>(null);

  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );

  const fetchTasks = async (nextFilters: TaskFiltersType) => {
    try {
      setError('');
      const data = await getTasks(nextFilters);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const fetchAllTasksForProgress = async () => {
    try {
      const data = await getTasks(INITIAL_FILTERS);
      setAllTasks(data);
    } catch {
      // Keep progress widget non-blocking.
    }
  };

  const completionCountByDate = useMemo(() => {
    return allTasks.reduce<Record<string, number>>((acc, task) => {
      if (!task.completed) {
        return acc;
      }

      const key = completionDateByTask[task._id] || toCreatedDateKey(task.createdAt);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [allTasks, completionDateByTask]);

  useEffect(() => {
    void fetchTasks(filters);
  }, [filters]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    setCompletionDateByTask(readCompletionDateMap(userId));
    void fetchAllTasksForProgress();
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    localStorage.setItem(getCompletionStorageKey(userId), JSON.stringify(completionDateByTask));
  }, [completionDateByTask, userId]);

  useEffect(() => {
    const missingMapEntries = allTasks.filter((task) => task.completed && !completionDateByTask[task._id]);
    if (!missingMapEntries.length) {
      return;
    }

    setCompletionDateByTask((prev) => {
      const next = { ...prev };
      missingMapEntries.forEach((task) => {
        next[task._id] = toCreatedDateKey(task.createdAt);
      });
      return next;
    });
  }, [allTasks, completionDateByTask]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!progressWrapperRef.current) {
        return;
      }

      if (!progressWrapperRef.current.contains(event.target as Node)) {
        setIsProgressOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateOrUpdateTask = async (payload: TaskPayload) => {
    try {
      setError('');
      setIsSubmitting(true);

      if (editingTask) {
        const updatedTask = await updateTaskApi(editingTask._id, payload);
        setTasks((prev) =>
          prev.map((task) => (task._id === editingTask._id ? updatedTask : task))
        );
        setEditingTask(null);
      } else {
        const newTask = await createTaskApi(payload);
        setTasks((prev) => [newTask, ...prev]);
      }

      await fetchTasks(filters);
      await fetchAllTasksForProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      setError('');
      setBusyTaskId(id);
      await deleteTaskApi(id);
      setTasks((prev) => prev.filter((task) => task._id !== id));
      setCompletionDateByTask((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await fetchAllTasksForProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      setError('');
      setBusyTaskId(id);
      const updatedTask = await updateTaskApi(id, { completed });
      setTasks((prev) => prev.map((task) => (task._id === id ? updatedTask : task)));

      if (completed) {
        setCompletionDateByTask((prev) => ({ ...prev, [id]: toDateKey(new Date()) }));
      } else {
        setCompletionDateByTask((prev) => {
          if (!prev[id]) return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }

      await fetchAllTasksForProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleFilterChange = <K extends keyof TaskFiltersType>(
    key: K,
    value: TaskFiltersType[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const statusTabs: Array<{ label: string; value: TaskFiltersType['completed'] }> = [
    { label: 'All', value: 'all' },
    { label: 'Completed', value: 'completed' },
    { label: 'Pending', value: 'incomplete' }
  ];

  return (
    <div className="min-h-screen bg-[#f3f1ea] px-4 py-8">
      <nav className="relative z-40 mx-auto mb-5 w-full max-w-6xl rounded-xl border border-slate-200/80 bg-white/70 px-5 py-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold tracking-tight text-slate-900">ManageX</p>

          <div className="flex items-center gap-2">
            <p className="hidden text-sm text-slate-600 sm:block">{userName}</p>

            <div ref={progressWrapperRef} className="relative z-50">
              <button
                type="button"
                onClick={() => setIsProgressOpen((prev) => !prev)}
                aria-label="Open progress heatmap"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              >
                <Activity size={16} />
              </button>

              {isProgressOpen ? (
                <div className="absolute right-0 top-11 z-[90] w-[340px] rounded-xl border border-slate-200 bg-white/95 p-4 shadow-soft backdrop-blur">
                  <ProgressHeatmap completionCountByDate={completionCountByDate} />
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto mt-4 w-full max-w-6xl space-y-6">
        <header className="animate-appear rounded-xl border border-slate-200/70 bg-white/40 px-6 py-10 opacity-0">
          <p className="font-instrument-sans text-center text-[14px] uppercase tracking-[0.45em] text-slate-800 sm:text-[16px]">
            Introducing ManageX Workspace
          </p>
          <h2 className="font-instrument-serif mt-6 text-center text-[46px] font-normal leading-[1.1] text-slate-900 sm:text-[64px]">
            <span>Your schedule, </span>
            <span className="italic">seamlessly </span>
            <span>connected</span>
            <br />
            <span>to your workspace</span>
          </h2>
          <p className="font-instrument-sans mx-auto mt-6 max-w-3xl text-center text-[20px] font-light leading-[1.35] text-slate-700 sm:text-[24px]">
            ManageX brings your tasks, notes, and schedule together.
          </p>
          <p className="mt-4 text-center text-sm text-slate-500">{completedCount} of {tasks.length} tasks completed</p>
        </header>

        <TaskFilters filters={filters} onChange={handleFilterChange} />

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="grid items-start gap-6 lg:grid-cols-[36%_64%]">
          <aside className="animate-appear delay-100 lg:sticky lg:top-6 opacity-0">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">Add New Task</h3>
              <TaskForm
                onSubmitTask={handleCreateOrUpdateTask}
                isSubmitting={isSubmitting}
                editingTask={editingTask}
                onCancelEdit={() => setEditingTask(null)}
              />
            </div>
          </aside>

          <main className="animate-appear delay-300 rounded-xl border border-slate-200 bg-white p-5 opacity-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">Tasks</h3>
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                {statusTabs.map((tab) => {
                  const isActive = filters.completed === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => handleFilterChange('completed', tab.value)}
                      className={`rounded-md px-3 py-1.5 text-sm transition ${
                        isActive
                          ? 'bg-white font-medium text-slate-900 border border-slate-200'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              {isInitialLoading ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  Loading your tasks...
                </div>
              ) : (
                <TaskList
                  tasks={tasks}
                  onDelete={handleDeleteTask}
                  onToggleComplete={handleToggleComplete}
                  onEdit={setEditingTask}
                  busyTaskId={busyTaskId}
                />
              )}
            </div>
          </main>
        </section>
      </div>
    </div>
  );
}
