import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  User,
  LockKeyhole,
  Target,
  FileDown,
  LogOut,
  ChevronDown,
  X,
  Check,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar
} from 'lucide-react';
import type { Task } from '../../types/task';
import { changePassword } from '../../api/userApi';
import { generateWeeklyReport } from '../features/ReportButton';

interface ProfileHubProps {
  userName: string;
  userEmail: string;
  userId: string;
  tasks: Task[];
  completionDateByTask: Record<string, string>;
  onLogout: () => void;
}

const toDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export default function ProfileHub({
  userName,
  userEmail,
  userId,
  tasks,
  completionDateByTask,
  onLogout
}: ProfileHubProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Report download state
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  // Heatmap hover state
  const [hoveredCell, setHoveredCell] = useState<{ date: Date; count: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape
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

  // Statistics calculation
  const totalTasks = tasks.length;
  const completedTasks = useMemo(() => tasks.filter((t) => t.completed), [tasks]);
  const completedCount = completedTasks.length;
  const pendingCount = totalTasks - completedCount;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Real completion date mapping (10 weeks)
  const completionCountByDate = useMemo(() => {
    const map: Record<string, number> = {};
    completedTasks.forEach((task) => {
      let dateKey: string | null = null;
      if (task.completedAt) {
        dateKey = toDateKey(new Date(task.completedAt));
      } else if (completionDateByTask[task._id]) {
        dateKey = completionDateByTask[task._id];
      } else if (task.createdAt) {
        dateKey = toDateKey(new Date(task.createdAt));
      }

      if (dateKey) {
        map[dateKey] = (map[dateKey] || 0) + 1;
      }
    });
    return map;
  }, [completedTasks, completionDateByTask]);

  // 10 weeks of activity columns (7 days each)
  const activityWeeks = useMemo(() => {
    const weeks = 10;
    const today = new Date();
    const totalDays = weeks * 7;
    const start = new Date(today.getTime() - (totalDays - 1) * DAY_MS);

    return Array.from({ length: weeks }, (_, col) =>
      Array.from({ length: 7 }, (_, row) => {
        const date = new Date(start.getTime() + (col * 7 + row) * DAY_MS);
        const dateKey = toDateKey(date);
        const count = completionCountByDate[dateKey] || 0;
        return {
          date,
          dateKey,
          count
        };
      })
    );
  }, [completionCountByDate]);

  const getActivityClass = (count: number) => {
    if (count === 0) return 'bg-slate-100 border-slate-200/70';
    if (count === 1) return 'bg-emerald-200 border-emerald-300';
    if (count <= 3) return 'bg-emerald-400 border-emerald-500';
    return 'bg-emerald-600 border-emerald-700';
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await changePassword({ currentPassword, newPassword });
      setPasswordSuccess(res.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess('');
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDownloadWeeklyReport = () => {
    setIsDownloadingReport(true);
    try {
      generateWeeklyReport(tasks);
    } finally {
      setTimeout(() => setIsDownloadingReport(false), 800);
    }
  };

  return (
    <div ref={containerRef} className="relative z-50">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User profile & productivity menu"
        className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 p-1 pr-3 shadow-sm transition hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
      >
        <img
          src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(userName)}&backgroundColor=e2e8f0`}
          alt={`${userName}'s avatar`}
          className="h-7 w-7 rounded-full bg-slate-100"
        />
        <span className="hidden text-sm font-medium text-slate-700 sm:inline-block">{userName}</span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Profile & Productivity Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-[90] w-[320px] sm:w-[350px] rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xl backdrop-blur-md">
          {/* Top User Info Header */}
          <div className="mb-3.5 flex items-center gap-3 border-b border-slate-100 pb-3">
            <img
              src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(userName)}&backgroundColor=e2e8f0`}
              alt={userName}
              className="h-10 w-10 rounded-full border border-slate-200 bg-slate-100"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{userName}</p>
              <p className="truncate text-xs text-slate-500">{userEmail || 'No email provided'}</p>
            </div>
          </div>

          {/* Section: ACCOUNT */}
          <div className="mb-3">
            <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Account
            </p>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600"
              >
                <User size={14} className="text-slate-400 group-hover:text-indigo-500" />
                <span>Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setPasswordError('');
                  setPasswordSuccess('');
                  setIsPasswordModalOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600"
              >
                <LockKeyhole size={14} className="text-slate-400 group-hover:text-indigo-500" />
                <span>Change Password</span>
              </button>
            </div>
          </div>

          {/* Section: PRODUCTIVITY */}
          <div className="mb-3 border-t border-slate-100 pt-2.5">
            <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Productivity
            </p>

            {/* Quick Metrics */}
            <div className="mb-3 grid grid-cols-3 gap-1.5 text-center">
              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-1.5">
                <p className="text-[10px] text-slate-400">Total</p>
                <p className="text-sm font-semibold text-slate-800">{totalTasks}</p>
              </div>
              <div className="rounded-lg border border-emerald-100/60 bg-emerald-50/50 p-1.5">
                <p className="text-[10px] text-emerald-600">Done</p>
                <p className="text-sm font-semibold text-emerald-700">{completedCount}</p>
              </div>
              <div className="rounded-lg border border-amber-100/60 bg-amber-50/50 p-1.5">
                <p className="text-[10px] text-amber-600">Pending</p>
                <p className="text-sm font-semibold text-amber-700">{pendingCount}</p>
              </div>
            </div>

            {/* Completion Progress Bar */}
            <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50/50 p-2.5">
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-700">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Target size={13} className="text-indigo-500" />
                  Completion Progress
                </span>
                <span className="font-semibold text-slate-900">{completionRate}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            {/* GitHub-style Task Activity Grid */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5">
              <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-slate-600">
                <span>Task Activity</span>
                <span className="text-[10px] text-slate-400">Past 10 weeks</span>
              </div>

              {hoveredCell ? (
                <div className="mb-1.5 text-[10px] text-slate-600">
                  <span className="font-semibold text-slate-800">{hoveredCell.count}</span>{' '}
                  {hoveredCell.count === 1 ? 'task' : 'tasks'} on{' '}
                  {hoveredCell.date.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              ) : null}

              <div className="overflow-x-auto pb-1">
                <div className="inline-flex gap-1">
                  {activityWeeks.map((week, wIdx) => (
                    <div key={`w-${wIdx}`} className="grid grid-rows-7 gap-1">
                      {week.map((cell) => (
                        <div
                          key={cell.dateKey}
                          onMouseEnter={() => setHoveredCell({ date: cell.date, count: cell.count })}
                          onMouseLeave={() => setHoveredCell(null)}
                          title={`${cell.count} task${cell.count === 1 ? '' : 's'} completed on ${cell.date.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}`}
                          className={`h-2.5 w-2.5 rounded-[2px] border ${getActivityClass(
                            cell.count
                          )} transition hover:ring-1 hover:ring-slate-400`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-1.5 flex items-center justify-end gap-1.5 text-[9px] text-slate-400">
                <span>Less</span>
                <span className="h-2 w-2 rounded-[2px] border border-slate-200/70 bg-slate-100" />
                <span className="h-2 w-2 rounded-[2px] border border-emerald-300 bg-emerald-200" />
                <span className="h-2 w-2 rounded-[2px] border border-emerald-500 bg-emerald-400" />
                <span className="h-2 w-2 rounded-[2px] border border-emerald-700 bg-emerald-600" />
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Section: ACTIONS */}
          <div className="mb-2 border-t border-slate-100 pt-2.5">
            <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Actions
            </p>
            <button
              type="button"
              onClick={handleDownloadWeeklyReport}
              disabled={isDownloadingReport}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-60"
            >
              <FileDown size={14} className="text-indigo-500" />
              <span>{isDownloadingReport ? 'Generating Report...' : 'Download Weekly Report'}</span>
            </button>
          </div>

          {/* Section: SESSION */}
          <div className="border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut size={14} className="text-rose-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && typeof document !== 'undefined'
        ? createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm overflow-y-auto">
              <div className="w-full max-w-md my-auto max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                      <LockKeyhole size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Change Password</h3>
                      <p className="text-xs text-slate-500">Update your account password securely</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>

                {passwordError && (
                  <div className="mb-3.5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="mb-3.5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsPasswordModalOpen(false)}
                      disabled={isChangingPassword}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-70"
                    >
                      {isChangingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )
        : null}

      {/* Profile Details Modal */}
      {isProfileModalOpen && typeof document !== 'undefined'
        ? createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm overflow-y-auto">
              <div className="w-full max-w-md my-auto max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                      <User size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">User Profile</h3>
                      <p className="text-xs text-slate-500">ManageX Workspace Account</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <img
                      src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(userName)}&backgroundColor=e2e8f0`}
                      alt={userName}
                      className="h-14 w-14 rounded-full border border-slate-200 bg-white shadow-sm shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-semibold text-slate-900 truncate">{userName}</h4>
                      <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <ShieldCheck size={11} />
                        Active Workspace Member
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3">
                      <p className="text-xs text-slate-400">Total Tasks Created</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{totalTasks}</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3">
                      <p className="text-xs text-slate-400">Completion Rate</p>
                      <p className="mt-1 text-lg font-semibold text-indigo-600">{completionRate}%</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3 text-xs text-slate-600">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                      Account Identifier
                    </p>
                    <code className="font-mono text-[11px] text-slate-700 break-all">{userId || 'Local User'}</code>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
