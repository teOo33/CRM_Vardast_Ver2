import React, { useState, useMemo, useEffect } from 'react';
import { User, Search, Edit, Clock, History, Plus } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { formatDate } from '../utils/helpers';

const UserProfile = ({ usersData = [], issues, frozen, features, refunds, onboardings, meetings, openModal, profileSearch, setProfileSearch }) => {
    const [search, setSearch] = useState(profileSearch || '');
    const [selectedUserStats, setSelectedUserStats] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    useEffect(() => { setSearch(profileSearch || ''); }, [profileSearch]);
    useEffect(() => { const found = (usersData || []).find(u => u.username === search); setSelectedUserStats(found || null); }, [search, usersData]);
    const handleSearch = (val) => { setSearch(val); setProfileSearch(val); if (val) { const lowerVal = val.toLowerCase(); setSuggestions((usersData || []).filter(u => u.username.toLowerCase().includes(lowerVal) || (u.phone_number && u.phone_number.includes(lowerVal)) || (u.instagram_username && u.instagram_username.toLowerCase().includes(lowerVal)) || (u.telegram_id && u.telegram_id.toLowerCase().includes(lowerVal)) || (u.website && u.website.toLowerCase().includes(lowerVal))).slice(0, 5)); } else { setSuggestions([]); } };
    const userRecords = useMemo(() => { if (!search) return []; return [...issues.map(x => ({ ...x, src: 'issue', date: x.created_at })), ...frozen.map(x => ({ ...x, src: 'frozen', date: x.frozen_at })), ...features.map(x => ({ ...x, src: 'feature', date: x.created_at })), ...refunds.map(x => ({ ...x, src: 'refund', date: x.requested_at })), ...onboardings.map(x => ({ ...x, src: 'onboarding', date: x.created_at })), ...meetings.map(x => ({ ...x, src: 'meeting', date: x.date }))].filter(r => r.username === search).sort((a, b) => (b.date || '').localeCompare(a.date || '')); }, [search, issues, frozen, features, refunds, onboardings, meetings]);
    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
           <div className="bg-white/80 dark:bg-slate-800/80 dark:border-slate-700 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white relative z-20"><div className="flex justify-between items-center mb-3"><h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><User size={20} className="text-blue-600"/> پروفایل کاربر</h2><button onClick={() => openModal('profile')} className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-200 flex items-center gap-1 hover:bg-blue-700 transition"><Plus size={14}/> پروفایل جدید</button></div><div className="relative"><div className="flex items-center border border-gray-200 dark:border-slate-600 rounded-2xl bg-gray-50/50 dark:bg-slate-700/50 overflow-hidden focus-within:ring-2 ring-blue-100 transition-all"><div className="pl-3 pr-4 text-gray-400"><Search size={18} /></div><input placeholder="جستجو (نام، تماس، اینستاگرام، تلگرام، سایت)..." value={search} className="w-full p-3 bg-transparent outline-none text-sm dark:text-white" onChange={(e) => handleSearch(e.target.value)} /></div>{suggestions.length > 0 && search !== suggestions[0]?.username && (<div className="absolute top-full right-0 left-0 bg-white shadow-xl rounded-2xl mt-2 max-h-60 overflow-auto border z-50 p-1">{suggestions.map((u) => (<div key={u.username} onClick={() => handleSearch(u.username)} className="p-3 hover:bg-blue-50 cursor-pointer rounded-xl text-sm flex gap-3 items-center transition-colors"><UserAvatar name={u.username} size="sm" /><div className="flex flex-col"><span className="font-semibold text-gray-700">{u.username}</span><div className="flex flex-wrap gap-2 text-[10px] text-gray-400">{u.phone_number && <span>{u.phone_number}</span>}{u.instagram_username && <span>IG: {u.instagram_username}</span>}</div></div></div>))}</div>)}</div></div>
           {selectedUserStats ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-gradient-to-l from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-3xl shadow-sm border border-blue-100 dark:border-slate-700 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                        <UserAvatar name={selectedUserStats.username} size="lg" />
                        <div className="flex-1 text-center md:text-right z-10 w-full">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">{selectedUserStats.username}</h2>
                                    {selectedUserStats.bio && <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 max-w-lg leading-relaxed">{selectedUserStats.bio}</p>}
                                    <div className="flex flex-wrap gap-3 justify-center md:justify-start text-xs text-gray-600 dark:text-gray-300">
                                        {selectedUserStats.phone_number && <span className="px-2 py-1 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg flex items-center gap-1">📞 {selectedUserStats.phone_number}</span>}
                                        {selectedUserStats.instagram_username && <span className="px-2 py-1 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg flex items-center gap-1">📸 {selectedUserStats.instagram_username}</span>}
                                        {selectedUserStats.telegram_id && <span className="px-2 py-1 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg flex items-center gap-1">✈️ {selectedUserStats.telegram_id}</span>}
                                        {selectedUserStats.website && <span className="px-2 py-1 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg flex items-center gap-1">🌐 {selectedUserStats.website}</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 mt-4 md:mt-0 w-full md:w-auto">
                                    <button onClick={() => openModal('profile', selectedUserStats)} className="text-blue-600 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-xl text-xs font-bold transition flex gap-2 items-center justify-center"><Edit size={14}/> ویرایش پروفایل</button>
                                    <button onClick={() => openModal('meeting', { username: selectedUserStats.username })} className="bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-teal-200 flex items-center gap-2 hover:bg-teal-600 transition justify-center"><Clock size={16}/> تنظیم جلسه</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-800/80 dark:border-slate-700 backdrop-blur p-6 rounded-3xl shadow-sm border border-white dark:border-slate-700"><h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2"><History size={18} className="text-gray-500"/> تاریخچه فعالیت‌ها</h3>{userRecords.length > 0 ? (<div className="space-y-6 relative before:absolute before:right-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">{userRecords.map((r, i) => (<div key={i} className="relative pr-10"><div className={`absolute right-4 top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 ${r.src === 'issue' ? 'bg-amber-400' : 'bg-blue-400'}`}></div><div className="bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-4 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition"><div className="flex flex-wrap items-center justify-between gap-2 mb-2"><div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"><span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border dark:border-slate-700">{formatDate(r.date)}</span><span className="px-2 py-0.5 rounded-full border text-[10px]">{r.src}</span></div><button onClick={() => openModal(r.src, r)} className="text-xs px-3 py-1.5 rounded-xl border bg-white dark:bg-slate-800 dark:text-white hover:bg-blue-600 hover:text-white transition">ویرایش</button></div><div className="font-bold text-sm text-gray-800 dark:text-white mb-2">{r.desc_text || r.title || r.reason}</div></div></div>))}</div>) : (<div className="text-center text-gray-400 py-10">هیچ سابقه‌ای یافت نشد.</div>)}</div>
                </div>
           ) : null}
        </div>
    );
};

export default UserProfile;
