import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search } from 'lucide-react';
import UserAvatar from './UserAvatar';

const UserSearchInput = ({ value, onChange, onSelect, usersData = [] }) => {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState(value || '');
  const wrapperRef = useRef(null);

  useEffect(() => { setTerm(value || ''); }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!term) return [];
    const lower = term.toLowerCase();
    return (usersData || []).filter(u => 
      (u.username && u.username.toLowerCase().includes(lower)) ||
      (u.phone_number && u.phone_number.includes(lower)) ||
      (u.instagram_username && u.instagram_username.toLowerCase().includes(lower)) ||
      (u.telegram_id && u.telegram_id.toLowerCase().includes(lower)) ||
      (u.website && u.website.toLowerCase().includes(lower))
    ).slice(0, 5); 
  }, [term, usersData]);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input 
          value={term}
          onChange={(e) => { setTerm(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="جستجوی نام کاربری، اینستاگرام، شماره یا تلگرام..."
          className="w-full border p-3 pl-10 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        />
        <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full right-0 left-0 bg-white shadow-xl rounded-xl mt-1 border z-50 overflow-hidden dark:bg-slate-800 dark:border-slate-600">
          {filtered.map((u) => (
            <div 
              key={u.username} 
              className="p-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer border-b dark:border-slate-700 last:border-0 text-sm flex items-center gap-3"
              onClick={() => {
                onChange(u.username);
                if (onSelect) onSelect(u);
                setOpen(false);
              }}
            >
              <UserAvatar name={u.username} size="sm" />
              <div className="flex flex-col">
                <span className="font-bold text-gray-700 dark:text-gray-200">{u.username}</span>
                <div className="flex gap-2 text-[10px] text-gray-400">
                  {u.instagram_username && <span>IG: {u.instagram_username}</span>}
                  {u.phone_number && <span>PH: {u.phone_number}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearchInput;
