import React, { useState } from 'react';
import { Users, Plus, Edit } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { ALLOWED_USERS } from '../constants';

const MeetingsTab = ({ meetings, openModal, navigateToProfile }) => {
    const [teamFilter, setTeamFilter] = useState('');
    const filtered = teamFilter ? meetings.filter(m => m.created_by === teamFilter) : meetings;
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/80 dark:bg-slate-800/80 dark:border-slate-700 backdrop-blur p-4 rounded-2xl shadow-sm border border-white">
                <div className="flex items-center gap-4"><h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2"><Users size={24} className="text-teal-500"/> جلسات تیم</h2><select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="bg-slate-50 border p-2 rounded-xl text-sm outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"><option value="">همه اعضا</option>{ALLOWED_USERS.map(u => <option key={u} value={u}>{u}</option>)}</select></div>
                <button onClick={() => openModal('meeting')} className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm flex gap-2 items-center hover:bg-teal-700 shadow-lg shadow-teal-200 font-bold"><Plus size={16} /> ثبت جلسه جدید</button>
            </div>
            <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded-2xl border overflow-hidden overflow-x-auto">
                <table className="w-full text-sm text-right whitespace-nowrap">
                    <thead className="bg-slate-50 dark:bg-slate-700 text-gray-500 dark:text-gray-300 border-b dark:border-slate-600"><tr><th className="p-4">زمان</th><th className="p-4">مشتری</th><th className="p-4">علت جلسه</th><th className="p-4">نتیجه</th><th className="p-4">برگزار شد؟</th><th className="p-4">ثبت کننده</th><th className="p-4"></th></tr></thead>
                    <tbody className="divide-y dark:divide-slate-700">{filtered.map((m) => (<tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700"><td className="p-4 font-mono text-xs text-gray-600 dark:text-gray-400">{formatDate(m.date)} - {m.meeting_time}</td><td className="p-4 font-bold cursor-pointer hover:text-blue-600 dark:text-white" onClick={() => navigateToProfile(m.username)}>{m.username}</td><td className="p-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">{m.reason}</td><td className="p-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">{m.result || '-'}</td><td className="p-4">{m.held ? <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">بله</span> : <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs">خیر</span>}</td><td className="p-4 text-xs text-gray-500 dark:text-gray-400">{m.created_by}</td><td className="p-4"><button onClick={() => openModal('meeting', m)} className="text-gray-400 hover:text-teal-600"><Edit size={16}/></button></td></tr>))}</tbody>
                </table>
            </div>
        </div>
    );
};

export default MeetingsTab;
