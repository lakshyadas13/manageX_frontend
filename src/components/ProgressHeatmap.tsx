import { useMemo, useState } from 'react';

interface ProgressHeatmapProps {
  completionCountByDate: Record<string, number>;
  weeks?: number;
}

interface HeatmapCell {
  date: Date;
  dateKey: string;
  count: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const formatDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getIntensityClass = (count: number) => {
  if (count === 0) return 'bg-slate-200';
  if (count <= 2) return 'bg-emerald-200';
  if (count <= 5) return 'bg-emerald-400';
  return 'bg-emerald-600';
};

const getIntensityText = (count: number) => {
  if (count === 0) return 'No activity';
  if (count <= 2) return 'Light activity';
  if (count <= 5) return 'Medium activity';
  return 'High activity';
};

const buildTooltip = (count: number, date: Date) => {
  const label = date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  const tasksLabel = count === 1 ? 'task' : 'tasks';
  return `${count} ${tasksLabel} completed on ${label}`;
};

export default function ProgressHeatmap({ completionCountByDate, weeks = 16 }: ProgressHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  const columns = useMemo(() => {
    const today = new Date();
    const totalDays = weeks * 7;
    const start = new Date(today.getTime() - (totalDays - 1) * DAY_MS);

    return Array.from({ length: weeks }, (_, col) =>
      Array.from({ length: 7 }, (_, row) => {
        const date = new Date(start.getTime() + (col * 7 + row) * DAY_MS);
        const dateKey = formatDateKey(date);
        const count = completionCountByDate[dateKey] || 0;
        return {
          date,
          dateKey,
          count
        };
      })
    );
  }, [completionCountByDate, weeks]);

  const monthLabels = useMemo(() => {
    return columns.map((column, index) => {
      const first = column[0]?.date;
      if (!first) return '';

      const thisMonth = first.getMonth();
      const prev = columns[index - 1]?.[0]?.date;
      const prevMonth = prev?.getMonth();

      if (index === 0 || thisMonth !== prevMonth) {
        return first.toLocaleDateString(undefined, { month: 'short' });
      }

      return '';
    });
  }, [columns]);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedCell = hoveredCell ?? columns[columns.length - 1]?.[6] ?? null;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">Completion Progress</p>

      {selectedCell ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <p className="font-medium text-slate-800">
            {selectedCell.date.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <p className="mt-0.5">
            {selectedCell.count} {selectedCell.count === 1 ? 'task' : 'tasks'} completed ·{' '}
            {getIntensityText(selectedCell.count)}
          </p>
        </div>
      ) : null}

      <div className="overflow-x-auto pb-1">
        <div className="inline-flex gap-2">
          <div className="grid grid-rows-7 gap-1 pt-5">
            {dayLabels.map((day) => (
              <div key={day} className="h-3 text-[10px] leading-3 text-slate-500">
                {day[0]}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <div className="flex gap-1.5 pl-0.5">
              {monthLabels.map((label, idx) => (
                <div key={`month-${idx}`} className="w-3 text-[10px] leading-3 text-slate-500">
                  {label}
                </div>
              ))}
            </div>

            <div className="flex gap-1.5">
              {columns.map((column, colIndex) => (
                <div key={colIndex} className="grid grid-rows-7 gap-1">
                  {column.map((cell) => {
                    const tooltip = buildTooltip(cell.count, cell.date);
                    return (
                      <div
                        key={cell.dateKey}
                        title={tooltip}
                        onMouseEnter={() => setHoveredCell(cell)}
                        className={`h-3 w-3 rounded-[3px] ${getIntensityClass(cell.count)} ring-1 ring-transparent transition hover:ring-slate-400`}
                        aria-label={tooltip}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 text-[11px] text-slate-500">
        <span>Less</span>
        <span className="h-3 w-3 rounded-[3px] bg-slate-200" />
        <span className="h-3 w-3 rounded-[3px] bg-emerald-200" />
        <span className="h-3 w-3 rounded-[3px] bg-emerald-400" />
        <span className="h-3 w-3 rounded-[3px] bg-emerald-600" />
        <span>More</span>
      </div>
    </div>
  );
}
