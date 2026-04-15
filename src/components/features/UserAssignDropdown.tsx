import type { UserInfo } from '../../api/tasksApi';

interface UserAssignDropdownProps {
  users: UserInfo[];
  selectedUserId: string;
  onChange: (userId: string) => void;
  disabled?: boolean;
}

export default function UserAssignDropdown({
  users,
  selectedUserId,
  onChange,
  disabled
}: UserAssignDropdownProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-600">Assign To</label>
      <select
        value={selectedUserId || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:opacity-50"
      >
        <option value="">-- Unassigned (Creator Only) --</option>
        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.name} ({user.email})
          </option>
        ))}
      </select>
    </div>
  );
}
