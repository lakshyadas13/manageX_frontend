import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Clock3,
  Flag,
  Tag,
  StickyNote,
  UserRound,
  Users,
  MessageSquare,
  History,
  Send,
  Pencil,
  Trash2,
  CheckCircle2,
  PlusCircle,
  Calendar,
  RotateCcw,
  Edit3,
  CalendarDays,
  Check,
  AlertCircle
} from 'lucide-react';
import type { Task, UserInfo, TaskComment, TaskActivity } from '../../types/task';
import {
  getTaskComments,
  createTaskComment,
  updateTaskComment,
  deleteTaskComment,
  getTaskActivity,
  updateTaskCollaborators
} from '../../api/tasksApi';
import MultiUserPicker from './MultiUserPicker';

interface TaskDetailsModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: { id: string; name: string };
  allUsers: UserInfo[];
  onTaskUpdated?: (updatedTask: Task) => void;
  onToggleComplete?: (id: string, completed: boolean) => Promise<void>;
  onEditInForm?: (task: Task) => void;
}

type TabType = 'details' | 'comments' | 'activity';

const formatTimestamp = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

const getActivityIcon = (action: string) => {
  const lower = action.toLowerCase();
  if (lower.includes('created')) return <PlusCircle size={15} className="text-emerald-500" />;
  if (lower.includes('completed')) return <CheckCircle2 size={15} className="text-emerald-600" />;
  if (lower.includes('incomplete') || lower.includes('reopened'))
    return <RotateCcw size={15} className="text-amber-500" />;
  if (lower.includes('priority')) return <Flag size={15} className="text-rose-500" />;
  if (lower.includes('due date')) return <Calendar size={15} className="text-indigo-500" />;
  if (lower.includes('collaborator')) return <Users size={15} className="text-blue-500" />;
  if (lower.includes('comment')) return <MessageSquare size={15} className="text-purple-500" />;
  return <Edit3 size={15} className="text-slate-500" />;
};

export default function TaskDetailsModal({
  task,
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onTaskUpdated,
  onToggleComplete,
  onEditInForm
}: TaskDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [isManagingCollabs, setIsManagingCollabs] = useState(false);
  const [collabUserIds, setCollabUserIds] = useState<string[]>([]);
  const [isSavingCollabs, setIsSavingCollabs] = useState(false);

  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Sync collaborator IDs when task changes
  useEffect(() => {
    if (task) {
      const ids: string[] = [];
      if (Array.isArray(task.collaborators)) {
        task.collaborators.forEach((c) => {
          if (typeof c === 'string') ids.push(c);
          else if (c && c._id) ids.push(c._id);
        });
      } else if (task.assignedTo) {
        const aId = typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo._id;
        if (aId) ids.push(aId);
      }
      setCollabUserIds(Array.from(new Set(ids)));
    }
  }, [task]);

  // Load comments
  const loadComments = async (taskId: string) => {
    try {
      setIsLoadingComments(true);
      setCommentError('');
      const data = await getTaskComments(taskId);
      setComments(data);
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Load activity
  const loadActivity = async (taskId: string) => {
    try {
      setIsLoadingActivity(true);
      const data = await getTaskActivity(taskId);
      setActivities(data);
    } catch {
      // Non-blocking
    } finally {
      setIsLoadingActivity(false);
    }
  };

  useEffect(() => {
    if (isOpen && task) {
      if (activeTab === 'comments') {
        loadComments(task._id);
      } else if (activeTab === 'activity') {
        loadActivity(task._id);
      }
    }
  }, [isOpen, task?._id, activeTab]);

  if (!isOpen || !task) return null;

  const isCreator =
    (typeof task.userId === 'string' && task.userId === currentUser.id) ||
    (typeof task.userId === 'object' && task.userId?._id === currentUser.id);

  // Get resolved collaborators list
  const resolvedCollaborators: UserInfo[] = (task.collaborators || [])
    .map((c) => {
      if (typeof c === 'string') {
        return allUsers.find((u) => u._id === c);
      }
      return c as UserInfo;
    })
    .filter(Boolean) as UserInfo[];

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed) return;

    try {
      setIsSubmittingComment(true);
      setCommentError('');
      const created = await createTaskComment(task._id, trimmed);
      setComments((prev) => [...prev, created]);
      setNewComment('');

      // Auto-scroll to bottom of comments
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // Notify parent about comment count update
      if (onTaskUpdated) {
        onTaskUpdated({
          ...task,
          commentCount: (task.commentCount || 0) + 1
        });
      }
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSaveEditComment = async (commentId: string) => {
    const trimmed = editingCommentText.trim();
    if (!trimmed) return;

    try {
      const updated = await updateTaskComment(commentId, trimmed);
      setComments((prev) => prev.map((c) => (c._id === commentId ? updated : c)));
      setEditingCommentId(null);
      setEditingCommentText('');
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteTaskComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      if (onTaskUpdated) {
        onTaskUpdated({
          ...task,
          commentCount: Math.max(0, (task.commentCount || 1) - 1)
        });
      }
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Failed to delete comment');
    }
  };

  const handleSaveCollaborators = async () => {
    try {
      setIsSavingCollabs(true);
      const updated = await updateTaskCollaborators(task._id, collabUserIds);
      if (onTaskUpdated) {
        onTaskUpdated(updated);
      }
      setIsManagingCollabs(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update collaborators');
    } finally {
      setIsSavingCollabs(false);
    }
  };

  const priorityStyles: Record<string, string> = {
    high: 'bg-rose-50 text-rose-700 border-rose-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Task Details</h2>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                priorityStyles[task.priority] || 'bg-slate-100 text-slate-700'
              }`}
            >
              <Flag size={11} className="inline mr-1 -mt-0.5" />
              {task.priority}
            </span>
            {task.completed && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={12} />
                Completed
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-sm font-medium transition ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <StickyNote size={15} />
            <span>Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-sm font-medium transition ${
              activeTab === 'comments'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare size={15} />
            <span>Comments</span>
            {comments.length > 0 && (
              <span className="rounded-full bg-indigo-100 px-1.5 py-0.2 text-[11px] font-bold text-indigo-700">
                {comments.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-sm font-medium transition ${
              activeTab === 'activity'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History size={15} />
            <span>Activity</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Title & Notes */}
              <div>
                <h3 className="text-xl font-semibold text-slate-900 leading-snug">
                  {task.title}
                </h3>
                {task.notes ? (
                  <p className="mt-3 text-sm text-slate-600 whitespace-pre-wrap rounded-xl bg-slate-50 border border-slate-100 p-3.5">
                    {task.notes}
                  </p>
                ) : (
                  <p className="mt-2 text-sm italic text-slate-400">No notes provided.</p>
                )}
              </div>

              {/* Due Date & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 text-indigo-500 shadow-xs">
                    <Clock3 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Due Date</p>
                    <p className="text-sm font-medium text-slate-800">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : 'None'}
                      {task.dueTime ? ` at ${task.dueTime}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 text-indigo-500 shadow-xs">
                    <Tag size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tags</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {task.tags.length > 0 ? (
                        task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-xs text-slate-600"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400 italic">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Collaborators Section */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-indigo-500" />
                    <h4 className="text-sm font-semibold text-slate-800">Collaborators</h4>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-medium">
                      {resolvedCollaborators.length}
                    </span>
                  </div>

                  {isCreator && (
                    <button
                      type="button"
                      onClick={() => setIsManagingCollabs(!isManagingCollabs)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition"
                    >
                      {isManagingCollabs ? 'Cancel' : '+ Manage Collaborators'}
                    </button>
                  )}
                </div>

                {isManagingCollabs && isCreator ? (
                  <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3">
                    <MultiUserPicker
                      users={allUsers}
                      selectedUserIds={collabUserIds}
                      onChange={setCollabUserIds}
                      label="Select Collaborators"
                    />
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsManagingCollabs(false)}
                        className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCollaborators}
                        disabled={isSavingCollabs}
                        className="rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-70 transition shadow-xs"
                      >
                        {isSavingCollabs ? 'Saving...' : 'Save Collaborators'}
                      </button>
                    </div>
                  </div>
                ) : null}

                {resolvedCollaborators.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {resolvedCollaborators.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center gap-2.5 rounded-lg border border-slate-200/80 bg-white p-2.5 shadow-xs"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="truncate">
                          <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm italic text-slate-400">No collaborators yet.</p>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5">
                {onToggleComplete && (
                  <button
                    type="button"
                    onClick={() => onToggleComplete(task._id, !task.completed)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                      task.completed
                        ? 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 size={15} />
                    <span>{task.completed ? 'Mark Incomplete' : 'Mark Complete'}</span>
                  </button>
                )}

                {isCreator && onEditInForm && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEditInForm(task);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100 transition"
                  >
                    <Pencil size={14} />
                    <span>Edit Task</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COMMENTS */}
          {activeTab === 'comments' && (
            <div className="flex flex-col h-[400px]">
              {commentError && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
                  <AlertCircle size={14} />
                  <span>{commentError}</span>
                </div>
              )}

              {/* Comments Feed */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
                {isLoadingComments ? (
                  <div className="py-12 text-center text-sm text-slate-400">
                    Loading comments...
                  </div>
                ) : comments.length === 0 ? (
                  <div className="py-12 text-center">
                    <MessageSquare size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-600">No comments yet.</p>
                    <p className="text-xs text-slate-400 mt-0.5">Start the conversation below.</p>
                  </div>
                ) : (
                  comments.map((c) => {
                    const isAuthor = c.user?._id === currentUser.id;
                    const isEditing = editingCommentId === c._id;

                    return (
                      <div
                        key={c._id}
                        className="group rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
                              {c.user?.name ? c.user.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                            <span className="text-xs font-semibold text-slate-800">
                              {c.user?.name || 'Unknown User'}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {formatTimestamp(c.createdAt)}
                            </span>
                          </div>

                          {isAuthor && !isEditing && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCommentId(c._id);
                                  setEditingCommentText(c.message);
                                }}
                                aria-label="Edit comment"
                                className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(c._id)}
                                aria-label="Delete comment"
                                className="rounded p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              rows={2}
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              className="w-full rounded-md border border-indigo-200 bg-white p-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingCommentId(null)}
                                className="rounded px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-200"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEditComment(c._id)}
                                className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 shadow-xs"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-700 whitespace-pre-wrap pl-8">
                            {c.message}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={commentsEndRef} />
              </div>

              {/* Comment Input Box */}
              <form onSubmit={handleAddComment} className="mt-3 border-t border-slate-100 pt-3">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    disabled={isSubmittingComment}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-12 text-xs text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/50 placeholder:text-slate-400 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newComment.trim()}
                    aria-label="Send comment"
                    className="absolute right-2 rounded-lg bg-indigo-600 p-1.5 text-white hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition shadow-xs"
                  >
                    <Send size={13} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: ACTIVITY HISTORY */}
          {activeTab === 'activity' && (
            <div className="h-[400px] overflow-y-auto pr-2">
              {isLoadingActivity ? (
                <div className="py-12 text-center text-sm text-slate-400">
                  Loading activity...
                </div>
              ) : activities.length === 0 ? (
                <div className="py-12 text-center">
                  <History size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-medium text-slate-600">No activity recorded yet.</p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {activities.map((act) => (
                    <div key={act._id} className="relative flex items-start gap-3 text-xs">
                      {/* Timeline icon node */}
                      <span className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-slate-200 shadow-xs">
                        {getActivityIcon(act.action)}
                      </span>

                      <div className="flex-1">
                        <p className="font-medium text-slate-800">
                          <span className="font-semibold text-slate-900">
                            {act.user?.name || 'Someone'}
                          </span>{' '}
                          {act.action}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatTimestamp(act.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
