import React from 'react';
import { GraduationCap, Plus, Edit } from 'lucide-react';
import UserAvatar from './UserAvatar';

const OnboardingTab = ({ onboardings, openModal, navigateToProfile }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/80 backdrop-blur p-4 rounded-2xl shadow-sm border border-white">
        <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2"><GraduationCap size={24} className="text-indigo-500"/> ورود کاربران جدید</h2>
        <div className="flex gap-2">
            <button onClick={() => openModal('onboarding')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm flex gap-2 items-center hover:bg-indigo-700 shadow-lg shadow-indigo-200 font-bold">
            <Plus size={16} /> ثبت کاربر جدید
            </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {onboardings.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-50 hover:shadow-md transition relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateToProfile(item.username)}><UserAvatar name={item.username} size="md" /><div><h3 className="font-bold text-gray-800">{item.username}</h3><div className="flex gap-2 text-xs text-gray-400 mt-0.5"><span>{item.phone_number}</span></div></div></div>
              <button onClick={() => openModal('onboarding', item)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><Edit size={16}/></button>
            </div>
            <div className="mb-4"><div className="flex justify-between text-xs font-bold text-gray-600 mb-1"><span>پیشرفت آنبوردینگ</span><span>{item.progress}%</span></div><div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden"><div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${item.progress}%` }}></div></div></div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl mb-3"><div className="flex flex-col gap-1"><span className="text-[10px] text-gray-400">تماس اولیه</span><span className={`font-bold ${item.initial_call_status === 'پاسخ داد' ? 'text-emerald-600' : 'text-red-500'}`}>{item.initial_call_status || '-'}</span></div><div className="flex flex-col gap-1"><span className="text-[10px] text-gray-400">وبسایت</span><span className="font-bold text-gray-700">{item.has_website ? 'دارد' : 'ندارد'}</span></div></div>
            {item.conversation_summary && (<p className="text-xs text-gray-600 bg-indigo-50/50 p-3 rounded-xl italic line-clamp-2">{item.conversation_summary}</p>)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnboardingTab;
