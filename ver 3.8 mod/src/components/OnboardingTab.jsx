import React, { useState } from 'react';
import { GraduationCap, Plus, Edit, History, List, Columns } from 'lucide-react';
import UserAvatar from './UserAvatar';
import KanbanBoard from './KanbanBoard';

const OnboardingTab = ({ onboardings, openModal, navigateToProfile, setHistoryModalData, onStatusChange }) => {
  const [viewMode, setViewMode] = useState('kanban');

  const kanbanItems = onboardings.map(item => {
      let status = 'in_progress';
      if (item.progress === 0) status = '0_percent';
      else if (item.progress === 100) status = '100_percent';
      
      return { ...item, status };
  });

  const columns = {
      '0_percent': 'شروع نکرده',
      'in_progress': 'در حال تکمیل',
      '100_percent': 'تکمیل شده'
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur p-4 rounded-2xl shadow-sm border border-white dark:border-slate-700 shrink-0 liquid-glass">
        <button onClick={() => openModal('onboarding')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm flex gap-2 items-center hover:bg-indigo-700 shadow-lg shadow-indigo-200 font-bold">
        <Plus size={16} /> ثبت کاربر جدید
        </button>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg text-xs font-bold flex gap-1 ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}><List size={16}/> شبکه</button>
            <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg text-xs font-bold flex gap-1 ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-800 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}><Columns size={16}/> کانبان</button>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto">
            {onboardings.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-indigo-50 dark:border-slate-700 hover:shadow-md transition relative overflow-hidden liquid-glass">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateToProfile(item.username)}><UserAvatar name={item.username} size="md" /><div><h3 className="font-bold text-gray-800 dark:text-white">{item.username}</h3><div className="flex gap-2 text-xs text-gray-400 mt-0.5"><span>{item.phone_number}</span></div></div></div>
                  <div className="flex items-center gap-1">
                      {item.history && item.history.length > 0 && <button onClick={() => setHistoryModalData(item.history)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400 hover:text-blue-500"><History size={16}/></button>}
                      <button onClick={() => openModal('onboarding', item)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400"><Edit size={16}/></button>
                  </div>
                </div>
                <div className="mb-4"><div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-300 mb-1"><span>پیشرفت آنبوردینگ</span><span>{item.progress}%</span></div><div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden"><div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${item.progress}%` }}></div></div></div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700 p-3 rounded-xl mb-3"><div className="flex flex-col gap-1"><span className="text-[10px] text-gray-400">تماس اولیه</span><span className={`font-bold ${item.initial_call_status === 'پاسخ داد' ? 'text-emerald-600' : 'text-red-500'}`}>{item.initial_call_status || '-'}</span></div><div className="flex flex-col gap-1"><span className="text-[10px] text-gray-400">وبسایت</span><span className="font-bold text-gray-700 dark:text-gray-300">{item.has_website ? 'دارد' : 'ندارد'}</span></div></div>
                {item.conversation_summary && (<p className="text-xs text-gray-600 dark:text-gray-400 bg-indigo-50/50 dark:bg-slate-700/50 p-3 rounded-xl italic line-clamp-2">{item.conversation_summary}</p>)}
                {item.created_by && <div className="mt-3 text-[10px] text-gray-400 text-left border-t dark:border-slate-700 pt-2">ثبت شده توسط: <span className="font-bold text-gray-500 dark:text-gray-400">{item.created_by}</span></div>}
              </div>
            ))}
          </div>
      ) : (
          <div className="flex-1 overflow-hidden">
             <KanbanBoard 
                items={kanbanItems} 
                onStatusChange={onStatusChange} 
                columns={columns} 
                navigateToProfile={navigateToProfile} 
                openModal={openModal} 
                setHistoryModalData={setHistoryModalData}
                type="onboarding" 
             />
          </div>
      )}
    </div>
  );
};

export default OnboardingTab;
