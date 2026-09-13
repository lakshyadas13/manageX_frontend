import { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, RotateCcw, X, ChevronDown } from 'lucide-react';
import type { TaskFilters as FiltersType } from '../types/task';

interface TaskFiltersProps {
  filters: FiltersType;
  onChange: <K extends keyof FiltersType>(key: K, value: FiltersType[K]) => void;
}

export default function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPriorityFiltered = filters.priority !== 'all';
  const isSortFiltered = filters.sort !== 'dueDateAsc';
  const isTagsFiltered = Boolean(filters.tags && filters.tags.trim());

  const activeFilterCount =
    (isPriorityFiltered ? 1 : 0) +
    (isSortFiltered ? 1 : 0) +
    (isTagsFiltered ? 1 : 0);

  const handleClearFilters = () => {
    onChange('priority', 'all');
    onChange('sort', 'dueDateAsc');
    onChange('tags', '');
  };

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Filter tasks"
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition shadow-sm ${
          isOpen || activeFilterCount > 0
            ? 'border-indigo-200 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100/70'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <SlidersHorizontal size={15} className={activeFilterCount > 0 ? 'text-indigo-600' : 'text-slate-500'} />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-[290px] sm:w-[320px] rounded-xl border border-slate-200/90 bg-white p-4 shadow-xl backdrop-blur-md">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Filter & Sort</span>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 transition"
              >
                <RotateCcw size={11} />
                Clear
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                aria-label="Close popover"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            {/* Priority */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(event) => onChange('priority', event.target.value as FiltersType['priority'])}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Sort By
              </label>
              <select
                value={filters.sort}
                onChange={(event) => onChange('sort', event.target.value as FiltersType['sort'])}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
              >
                <option value="dueDateAsc">Due Date (Earliest)</option>
                <option value="dueDateDesc">Due Date (Latest)</option>
                <option value="priorityHigh">Priority (High to Low)</option>
                <option value="priorityLow">Priority (Low to High)</option>
                <option value="createdAtDesc">Newest First</option>
                <option value="createdAtAsc">Oldest First</option>
              </select>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Tag Filter
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.tags}
                  onChange={(event) => onChange('tags', event.target.value)}
                  placeholder="e.g. work, urgent"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 pr-7 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 placeholder:text-slate-400"
                />
                {filters.tags ? (
                  <button
                    type="button"
                    onClick={() => onChange('tags', '')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Clear tags"
                  >
                    <X size={13} />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

