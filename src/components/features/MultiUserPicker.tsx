import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, UserRound, X, Users, Check } from 'lucide-react';
import type { UserInfo } from '../../types/task';

interface MultiUserPickerProps {
  users: UserInfo[];
  selectedUserIds: string[];
  onChange: (userIds: string[]) => void;
  disabled?: boolean;
  label?: string;
}

export default function MultiUserPicker({
  users,
  selectedUserIds,
  onChange,
  disabled = false,
  label = 'Collaborators'
}: MultiUserPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const checkPosition = useCallback(() => {
    if (inputContainerRef.current) {
      const rect = inputContainerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If space below is less than 210px and space above is sufficient, flip upwards
      const shouldOpenUp = spaceBelow < 210 && rect.top > 160;
      setOpenUpward(shouldOpenUp);
    }
  }, []);

  // Update position on open, scroll, or resize
  useEffect(() => {
    if (isOpen) {
      checkPosition();
      window.addEventListener('resize', checkPosition);
      window.addEventListener('scroll', checkPosition, true);
      return () => {
        window.removeEventListener('resize', checkPosition);
        window.removeEventListener('scroll', checkPosition, true);
      };
    }
  }, [isOpen, checkPosition]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedUsers = users.filter((u) => selectedUserIds.includes(u._id));

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleToggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onChange(selectedUserIds.filter((id) => id !== userId));
    } else {
      onChange([...selectedUserIds, userId]);
    }
  };

  const handleRemoveUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedUserIds.filter((id) => id !== userId));
  };

  return (
    <div className="flex flex-col gap-2" ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <Users size={14} className="text-indigo-400" />
            <span>{label}</span>
          </label>
          {selectedUsers.length > 0 && (
            <span className="text-xs text-slate-400">
              {selectedUsers.length} selected
            </span>
          )}
        </div>
      )}

      {/* Selected Collaborator Chips */}
      {selectedUsers.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selectedUsers.map((user) => (
            <span
              key={user._id}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-200 text-[10px] font-bold text-indigo-800">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span>{user.name}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => handleRemoveUser(user._id, e)}
                  aria-label={`Remove ${user.name}`}
                  className="rounded-full p-0.5 text-indigo-400 hover:bg-indigo-200 hover:text-indigo-800 transition"
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">No collaborators selected</p>
      )}

      {/* Search and Picker Input */}
      {!disabled && (
        <div className="relative" ref={inputContainerRef}>
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                checkPosition();
                setIsOpen(true);
              }}
              onFocus={() => {
                checkPosition();
                setIsOpen(true);
              }}
              placeholder="Search users to add..."
              className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/50 hover:border-indigo-200 placeholder:text-slate-400"
            />
          </div>

          {/* User Selection Dropdown */}
          {isOpen && (
            <div
              className={`absolute left-0 right-0 z-50 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 transition-all ${
                openUpward
                  ? 'bottom-full mb-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] animate-in fade-in slide-in-from-bottom-2 duration-150'
                  : 'top-full mt-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)] animate-in fade-in slide-in-from-top-2 duration-150'
              }`}
            >
              {filteredUsers.length === 0 ? (
                <div className="px-3 py-2 text-center text-xs text-slate-400">
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user._id);
                  return (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => handleToggleUser(user._id)}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-900 font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="truncate">
                          <p className="truncate font-medium text-slate-800">{user.name}</p>
                          <p className="truncate text-[11px] text-slate-400">{user.email}</p>
                        </div>
                      </div>
                      {isSelected ? (
                        <Check size={14} className="text-indigo-600 shrink-0 ml-2" />
                      ) : (
                        <UserRound size={13} className="text-slate-300 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
