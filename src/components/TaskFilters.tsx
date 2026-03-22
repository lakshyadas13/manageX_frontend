import type { TaskFilters as FiltersType } from '../types/task';

interface TaskFiltersProps {
  filters: FiltersType;
  onChange: <K extends keyof FiltersType>(key: K, value: FiltersType[K]) => void;
}

export default function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  return (
    <div className="animate-appear delay-100 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 opacity-0 sm:grid-cols-2 xl:grid-cols-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
        Priority
        <select
          value={filters.priority}
          onChange={(event) => onChange('priority', event.target.value as FiltersType['priority'])}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
        Sort By
        <select
          value={filters.sort}
          onChange={(event) => onChange('sort', event.target.value as FiltersType['sort'])}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        >
          <option value="dueDateAsc">Due Date (Earliest)</option>
          <option value="dueDateDesc">Due Date (Latest)</option>
          <option value="priorityHigh">Priority (High to Low)</option>
          <option value="priorityLow">Priority (Low to High)</option>
          <option value="createdAtDesc">Newest First</option>
          <option value="createdAtAsc">Oldest First</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
        Tag Filter
        <input
          type="text"
          value={filters.tags}
          onChange={(event) => onChange('tags', event.target.value)}
          placeholder="work, urgent"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </label>
    </div>
  );
}
