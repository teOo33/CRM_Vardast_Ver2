import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

import {
  LayoutDashboard,
  AlertTriangle,
  Snowflake,
  Lightbulb,
  CreditCard,
  Plus,
  X,
  Menu,
  User,
  Sparkles,
  Loader2,
  Download,
  Phone,
  Instagram,
  Search,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Globe,
  Send,
  Edit,
  History,
  UserPlus,
  BrainCircuit,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

import {
  XAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const appPassword = import.meta.env.VITE_APP_PASSWORD || '';

const INITIAL_FORM_DATA = {
  username: '', phone_number: '', instagram_username: '', telegram_id: '', website: '', bio: '', 
  subscription_status: '', desc_text: '', module: '', type: '', status: '', support: '', resolved_at: '',
  technical_note: '', cause: '', first_frozen_at: '', freeze_count: '',
  last_frozen_at: '', resolve_status: '', note: '', title: '', category: '',
  repeat_count: '', importance: '', internal_note: '', reason: '', duration: '',
  action: '', suggestion: '', can_return: '', sales_source: '', ops_note: '', flag: '',
};

const useTailwind = () => {
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
      
      const style = document.createElement('style');
      style.innerHTML = `
        * { box-sizing: border-box; }
        html, body, #root { margin: 0; padding: 0; height: 100%; width: 100%; }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `;
      document.head.appendChild(style);
    }
  }, []);
};

let supabase;
try {
  if (supabaseUrl && supabaseUrl.startsWith('http')) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
} catch (e) {
  console.error('Supabase init error:', e);
}

const callGeminiAI = async (prompt, isJson = false) => {
  if (!geminiApiKey) return alert('کلید هوش مصنوعی وارد نشده است.');
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: isJson ? 'application/json' : 'text/plain' },
        }),
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (error) {
    console.error('AI Error:', error);
    return null;
  }
};

const downloadCSV = (data, fileName) => {
  if (!data || !data.length) return alert('داده‌ای وجود ندارد.');
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) => headers.map((f) => `"${(row[f] || '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.csv`;
  link.click();
};

const UserAvatar = ({ name, size = 'md' }) => {
  const safeName = name || '?';
  const colors = ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-pink-400 to-pink-600', 'from-emerald-400 to-emerald-600', 'from-orange-400 to-orange-600'];
  const colorIndex = safeName.length % colors.length;
  const sizeClasses = size === 'lg' ? 'w-12 h-12 text-lg' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm';
  return (
    <div className={`${sizeClasses} rounded-full bg-gradient-to-br ${colors[colorIndex]} text-white flex items-center justify-center font-bold shadow-md ring-2 ring-white flex-shrink-0`}>
      {safeName.charAt(0)}
    </div>
  );
};

// Extracted UserSearchInput component
const UserSearchInput = ({ value, onChange, onSelect, allUsers }) => {
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
    return allUsers.filter(u => 
      (u.username && u.username.toLowerCase().includes(lower)) ||
      (u.phone_number && u.phone_number.includes(lower)) ||
      (u.instagram_username && u.instagram_username.toLowerCase().includes(lower)) ||
      (u.telegram_id && u.telegram_id.toLowerCase().includes(lower))
    ).slice(0, 5); // Limit to 5 suggestions
  }, [term, allUsers]);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input 
          value={term}
          onChange={(e) => { setTerm(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="جستجوی نام کاربری، اینستاگرام، شماره یا تلگرام..."
          className="w-full border p-3 pl-10 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 text-sm"
        />
        <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full right-0 left-0 bg-white shadow-xl rounded-xl mt-1 border z-50 overflow-hidden">
          {filtered.map((u) => (
            <div 
              key={u.username} 
              className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 text-sm flex items-center gap-3"
              onClick={() => {
                onChange(u.username);
                if (onSelect) onSelect(u);
                setOpen(false);
              }}
            >
              <UserAvatar name={u.username} size="sm" />
              <div className="flex flex-col">
                <span className="font-bold text-gray-700">{u.username}</span>
                <div className="flex gap-2 text-[10px] text-gray-400">
                  {u.instagram_username && <span>IG: {u.instagram_username}</span>}
                  {u.phone_number && <span>PH: {u.phone_number}</span>}
                  {u.telegram_id && <span>TG: {u.telegram_id}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Extracted UserProfile component
const UserProfile = ({ allUsers, issues, frozen, features, refunds, openModal, profileSearch, setProfileSearch }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSearch = (val) => {
    setProfileSearch(val);
    if (val) {
      const lowerVal = val.toLowerCase();
      setSuggestions(allUsers.filter(u => 
        u.username.toLowerCase().includes(lowerVal) || 
        (u.phone_number && u.phone_number.includes(lowerVal)) || 
        (u.instagram_username && u.instagram_username.toLowerCase().includes(lowerVal)) ||
        (u.telegram_id && u.telegram_id.toLowerCase().includes(lowerVal))
      ));
    } else setSuggestions([]);
  };

  // Find full profile data for the searched user
  useEffect(() => {
    const found = allUsers.find(u => u.username === profileSearch);
    setSelectedUser(found || null);
  }, [profileSearch, allUsers]);

  const allRecords = useMemo(() => {
    if (!profileSearch) return [];
    const records = [
      ...issues.map(x=>({...x,src:'issue',date:x.created_at})),
      ...frozen.map(x=>({...x,src:'frozen',date:x.frozen_at})),
      ...features.map(x=>({...x,src:'feature',date:x.created_at})),
      ...refunds.map(x=>({...x,src:'refund',date:x.requested_at}))
    ].filter(r => r.username === profileSearch);
    return records.sort((a,b) => (b.date||'').localeCompare(a.date||''));
  }, [profileSearch, issues, frozen, features, refunds]);

  const createReportForUser = (type) => {
    if (!selectedUser) return;
    openModal(type, { 
      username: selectedUser.username,
      phone_number: selectedUser.phone_number,
      instagram_username: selectedUser.instagram_username
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      {/* Search Header */}
      <div className="bg-white/80 backdrop-blur-md p-4 sm:p-6 rounded-3xl shadow-sm border border-white relative z-20">
        <h2 className="font-bold text-gray-800 mb-3">جستجوی پروفایل کاربر</h2>
        <div className="relative">
          <div className="flex items-center border border-gray-200 rounded-2xl bg-gray-50/50 overflow-hidden focus-within:ring-2 ring-blue-100">
            <div className="pl-3 pr-4 text-gray-400"><Search size={18}/></div>
            <input placeholder="نام کاربری، شماره تماس، اینستاگرام یا آیدی تلگرام..." value={profileSearch} className="w-full p-3 bg-transparent outline-none text-sm" onChange={(e) => handleSearch(e.target.value)} />
          </div>
          {suggestions.length > 0 && (
            <div className="absolute top-full right-0 left-0 bg-white shadow-xl rounded-2xl mt-2 max-h-60 overflow-auto border z-50">
              {suggestions.map((u) => (
                <div key={u.username} onClick={() => { setProfileSearch(u.username); setSuggestions([]); }} className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 text-sm flex gap-3 items-center">
                  <UserAvatar name={u.username} size="sm" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-700">{u.username}</span>
                    <div className="flex gap-3 text-xs text-gray-400">
                      {u.phone_number && <span>📞 {u.phone_number}</span>}
                      {u.instagram_username && <span>📸 {u.instagram_username}</span>}
                      {u.telegram_id && <span>✈️ {u.telegram_id}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Details & Timeline */}
      {selectedUser ? (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar: Profile Info */}
          <div className="w-full lg:w-1/3 space-y-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 relative overflow-hidden group">
               <div className="absolute top-0 right-0 left-0 h-24 bg-gradient-to-br from-blue-500 to-purple-600 opacity-90"></div>
               <div className="relative pt-12 flex flex-col items-center">
                  <UserAvatar name={selectedUser.username} size="lg" />
                  <h2 className="text-xl font-bold text-gray-800 mt-3">{selectedUser.username}</h2>
                  {selectedUser.bio && <p className="text-xs text-gray-500 text-center mt-2 px-4 leading-relaxed">{selectedUser.bio}</p>}
                  
                  <button onClick={() => openModal('profile', selectedUser)} className="mt-4 flex items-center gap-1 text-xs bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-full shadow-sm text-gray-600 transition">
                    <Edit size={12}/> ویرایش پروفایل
                  </button>

                  <div className="w-full mt-6 space-y-3">
                    {selectedUser.phone_number && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl">
                        <Phone size={16} className="text-emerald-500" />
                        <span>{selectedUser.phone_number}</span>
                      </div>
                    )}
                    {selectedUser.instagram_username && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl">
                        <Instagram size={16} className="text-rose-500" />
                        <span>@{selectedUser.instagram_username}</span>
                      </div>
                    )}
                    {selectedUser.telegram_id && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl">
                        <Send size={16} className="text-blue-500" />
                        <span>@{selectedUser.telegram_id}</span>
                      </div>
                    )}
                    {selectedUser.website && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl">
                        <Globe size={16} className="text-indigo-500" />
                        <a href={selectedUser.website} target="_blank" rel="noreferrer" className="truncate hover:text-blue-600">{selectedUser.website}</a>
                      </div>
                    )}
                  </div>
               </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 mb-3">ثبت گزارش سریع</h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => createReportForUser('issue')} className="p-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition flex items-center justify-center gap-1"><AlertTriangle size={14}/> مشکل</button>
                <button onClick={() => createReportForUser('frozen')} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition flex items-center justify-center gap-1"><Snowflake size={14}/> فریز</button>
                <button onClick={() => createReportForUser('feature')} className="p-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold hover:bg-amber-100 transition flex items-center justify-center gap-1"><Lightbulb size={14}/> فیچر</button>
                <button onClick={() => createReportForUser('refund')} className="p-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition flex items-center justify-center gap-1"><CreditCard size={14}/> بازپرداخت</button>
              </div>
            </div>
          </div>

          {/* Main: Timeline */}
          <div className="flex-1">
            <div className="bg-white/80 backdrop-blur p-6 rounded-3xl shadow-sm border border-white h-full">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <History size={18} className="text-blue-500" />
                تایم‌لاین فعالیت‌ها
              </h3>
              {allRecords.length > 0 ? (
                <div className="space-y-4 relative before:absolute before:right-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
                  {allRecords.map((r, i) => (
                    <div key={i} className="relative pr-12">
                      <div className={`absolute right-[21px] top-4 w-3 h-3 rounded-full border-2 border-white ring-1 ring-slate-300 ${r.src === 'issue' ? 'bg-amber-400' : r.src === 'frozen' ? 'bg-blue-400' : r.src === 'feature' ? 'bg-purple-400' : 'bg-rose-400'}`}></div>
                      <div className="bg-slate-50 border rounded-2xl p-4 hover:bg-white hover:shadow-md transition">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 text-xs font-bold">
                            <span className={`px-2 py-0.5 rounded-full ${r.src === 'issue' ? 'bg-amber-100 text-amber-700' : r.src === 'frozen' ? 'bg-blue-100 text-blue-700' : r.src === 'feature' ? 'bg-purple-100 text-purple-700' : 'bg-rose-100 text-rose-700'}`}>
                              {r.src === 'issue' ? 'مشکل فنی' : r.src === 'frozen' ? 'اکانت فریز' : r.src === 'feature' ? 'درخواست فیچر' : 'بازگشت وجه'}
                            </span>
                            <span className="text-gray-400 font-mono font-normal">{r.date}</span>
                          </div>
                          <button onClick={() => openModal(r.src, r)} className="text-xs text-gray-400 hover:text-blue-600">ویرایش</button>
                        </div>
                        <p className="text-sm text-gray-700 mb-2 leading-relaxed">{r.desc_text || r.reason || r.title}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs px-2 py-0.5 rounded-lg border bg-white text-gray-500">وضعیت: {r.status || r.action || 'نامشخص'}</span>
                          {r.flag && <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-1 rounded">{r.flag}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-10">هنوز گزارشی ثبت نشده است.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-300">
           <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-400 mb-4"><Search size={32}/></div>
           <p className="text-gray-500 font-medium">لطفاً نام کاربری را جستجو کنید تا پروفایل نمایش داده شود</p>
           <button onClick={() => openModal('profile')} className="mt-4 px-6 py-2 bg-white border hover:bg-gray-50 rounded-xl text-sm font-bold text-gray-700 shadow-sm flex items-center gap-2">
             <UserPlus size={16}/> ثبت کاربر جدید
           </button>
        </div>
      )}
    </div>
  );
};

// Extracted AI Analysis Tab component
const AIAnalysisTab = ({ issues, navigateToProfile }) => {
  const [generalAnalysis, setGeneralAnalysis] = useState(null);
  const [generalLoading, setGeneralLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleGeneralAnalysis = async () => {
    setGeneralLoading(true);
    // Take last 50 issues for broad analysis to avoid token limits
    const recentIssues = issues.slice(0, 50).map(i => i.desc_text).filter(Boolean);
    const prompt = `Analyze these user reports and identify the top 3 most common technical problems or user pain points. 
    Reports: ${JSON.stringify(recentIssues)}
    Format output as HTML with <ul> and <li> tags, bolding the key terms.`;
    
    const res = await callGeminiAI(prompt, false);
    setGeneralAnalysis(res);
    setGeneralLoading(false);
  };

  const handleProblemSearch = async () => {
    if (!searchQuery) return;
    setSearchLoading(true);
    
    // Prepare data for AI: List of {username, desc}
    const dataForAI = issues.slice(0, 100).map(i => ({ username: i.username, desc: i.desc_text }));
    
    const prompt = `I have a list of user reports: ${JSON.stringify(dataForAI)}.
    Find the users who have reported a problem similar to this description: "${searchQuery}".
    Return ONLY a JSON array of objects with "username" and "reason" keys. 
    Example: [{"username": "ali", "reason": "mentioned login error"}]`;

    const res = await callGeminiAI(prompt, true);
    setSearchLoading(false);
    
    if (res) {
      try {
        const parsed = JSON.parse(res);
        if (Array.isArray(parsed)) {
          setSearchResults(parsed);
        } else {
          alert('Invalid AI response format.');
        }
      } catch (e) {
        console.error(e);
        alert('Could not parse AI response.');
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold mb-2 flex items-center gap-3">
            <BrainCircuit size={32} />
            تحلیل هوشمند جمنای
          </h2>
          <p className="text-purple-100 max-w-xl text-sm leading-relaxed">
            با استفاده از هوش مصنوعی، الگوهای پرتکرار مشکلات کاربران را کشف کنید یا کاربرانی که مشکل خاصی را تجربه کرده‌اند پیدا کنید.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feature 1: General Analysis */}
        <div className="bg-white/80 backdrop-blur p-6 rounded-3xl shadow-sm border border-white flex flex-col">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl"><TrendingUp size={20}/></div>
             <h3 className="font-bold text-gray-800">تحلیل کلی گزارشات</h3>
          </div>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            بررسی ۵۰ گزارش اخیر و شناسایی ۳ چالش اصلی که کاربران با آن مواجه هستند.
          </p>
          
          <div className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-100 min-h-[200px] text-sm text-gray-700 leading-7">
            {generalLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-purple-500 gap-2">
                <Loader2 size={24} className="animate-spin"/>
                <span className="text-xs">در حال تحلیل داده‌ها...</span>
              </div>
            ) : generalAnalysis ? (
              <div dangerouslySetInnerHTML={{ __html: generalAnalysis }} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">نتایج تحلیل اینجا نمایش داده می‌شود</div>
            )}
          </div>

          <button onClick={handleGeneralAnalysis} disabled={generalLoading} className="mt-4 w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-200 transition flex justify-center gap-2 items-center">
            {generalLoading ? '...' : <><Sparkles size={16}/> شروع تحلیل هوشمند</>}
          </button>
        </div>

        {/* Feature 2: Semantic Search */}
        <div className="bg-white/80 backdrop-blur p-6 rounded-3xl shadow-sm border border-white flex flex-col">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><Search size={20}/></div>
             <h3 className="font-bold text-gray-800">یافتن کاربران با مشکل مشابه</h3>
          </div>
          
          <div className="relative mb-4">
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="مثلا: کاربرانی که مشکل درگاه پرداخت داشتند..." 
              className="w-full p-4 pl-12 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-sm outline-none focus:ring-2 ring-indigo-200 transition"
            />
            <button 
              onClick={handleProblemSearch}
              disabled={searchLoading || !searchQuery}
              className="absolute left-2 top-2 bottom-2 bg-indigo-600 text-white px-4 rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1 disabled:opacity-50"
            >
              {searchLoading ? <Loader2 size={14} className="animate-spin"/> : <ArrowRight size={14}/>}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[300px] custom-scrollbar space-y-2">
            {searchResults.length > 0 ? (
              searchResults.map((res, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md transition group">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={res.username} size="sm" />
                    <div>
                      <div className="font-bold text-sm text-gray-800">{res.username}</div>
                      <div className="text-[10px] text-gray-500 max-w-[150px] truncate" title={res.reason}>{res.reason}</div>
                    </div>
                  </div>
                  <button onClick={() => navigateToProfile(res.username)} className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold opacity-0 group-hover:opacity-100 transition">
                    مشاهده
                  </button>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs py-10">
                <MessageSquare size={32} className="mb-2 opacity-20"/>
                هنوز جستجویی انجام نشده است
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  useTailwind();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [isConnected, setIsConnected] = useState(false);
  const [issues, setIssues] = useState([]);
  const [frozen, setFrozen] = useState([]);
  const [features, setFeatures] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [editingId, setEditingId] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isAuthed, setIsAuthed] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (!appPassword) return true;
    return localStorage.getItem('vardast_ops_authed') === '1';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Lifted state for profile search
  const [profileSearch, setProfileSearch] = useState('');

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!appPassword) { setIsAuthed(true); return; }
    if (passwordInput === appPassword) {
      setIsAuthed(true);
      localStorage.setItem('vardast_ops_authed', '1');
      setLoginError('');
    } else {
      setLoginError('رمز عبور اشتباه است.');
    }
  };

  const navigateToProfile = (username) => {
    setProfileSearch(username);
    setActiveTab('profile');
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  useEffect(() => {
    if (!supabase) return;
    setIsConnected(true);
    const fetchAll = async () => {
      const { data: d1 } = await supabase.from('issues').select('*').order('id', { ascending: false });
      if (d1) setIssues(d1);
      const { data: d2 } = await supabase.from('frozen').select('*').order('id', { ascending: false });
      if (d2) setFrozen(d2);
      const { data: d3 } = await supabase.from('features').select('*').order('id', { ascending: false });
      if (d3) setFeatures(d3);
      const { data: d4 } = await supabase.from('refunds').select('*').order('id', { ascending: false });
      if (d4) setRefunds(d4);
      const { data: d5 } = await supabase.from('profiles').select('*').order('id', { ascending: false });
      if (d5) setProfiles(d5);
    };
    fetchAll();
    const channel = supabase.channel('updates').on('postgres_changes', { event: 'INSERT', schema: 'public' }, (payload) => {
      const newRow = payload.new;
      if (payload.table === 'issues') setIssues((prev) => [newRow, ...prev]);
      if (payload.table === 'frozen') setFrozen((prev) => [newRow, ...prev]);
      if (payload.table === 'features') setFeatures((prev) => [newRow, ...prev]);
      if (payload.table === 'refunds') setRefunds((prev) => [newRow, ...prev]);
      if (payload.table === 'profiles') setProfiles((prev) => [newRow, ...prev.filter(p => p.username !== newRow.username)]);
    }).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const allUsers = useMemo(() => {
    const map = {};
    // First populate from profiles
    profiles.forEach(p => {
      map[p.username] = { ...p, source: 'profile' };
    });
    // Then backfill from reports if not exists (legacy data)
    [...issues, ...frozen, ...features, ...refunds].forEach(r => {
      if (!r.username) return;
      if (!map[r.username]) {
        map[r.username] = { 
          username: r.username, 
          phone_number: r.phone_number, 
          instagram_username: r.instagram_username,
          telegram_id: '',
          website: '',
          bio: '',
          source: 'report' 
        };
      }
    });
    return Object.values(map);
  }, [profiles, issues, frozen, features, refunds]);

  const analytics = useMemo(() => {
    const resolved = issues.filter((i) => i.status === 'حل‌شده').length;
    const total = issues.length;
    const ratio = total ? Math.round((resolved / total) * 100) : 0;
    return { solvedRatio: ratio, activeFrozen: frozen.filter((f) => f.status === 'فریز').length, refundCount: refunds.length };
  }, [issues, frozen, refunds]);

  const churnRisks = useMemo(() => {
    // Filter last ~30 days (taking last 200 items as proxy)
    const recentIssues = issues.slice(0, 200); 
    const userCounts = {};
    recentIssues.forEach(i => {
      if (!userCounts[i.username]) userCounts[i.username] = { count: 0, issues: [] };
      userCounts[i.username].count += 1;
      userCounts[i.username].issues.push(i.desc_text);
    });
    return Object.entries(userCounts).filter(([_, data]) => data.count >= 3).map(([username, data]) => ({ username, count: data.count, issues: data.issues }));
  }, [issues]);

  const chartData = useMemo(() => {
    const acc = {};
    issues.forEach((i) => { const d = i.created_at ? i.created_at.split(' ')[0] : 'نامشخص'; acc[d] = (acc[d] || 0) + 1; });
    return Object.keys(acc).map((d) => ({ date: d, count: acc[d] }));
  }, [issues]);

  const pieChartData = useMemo(() => {
    const acc = {};
    refunds.forEach((r) => { const cat = r.category || 'سایر'; acc[cat] = (acc[cat] || 0) + 1; });
    return Object.keys(acc).map((name) => ({ name, value: acc[name] }));
  }, [refunds]);

  const COLORS = ['#0ea5e9', '#22c55e', '#f97316', '#a855f7', '#e11d48'];

  const handleAiChurnAnalysis = async (user) => {
    setAiLoading(true);
    // Updated prompt for a specific report on user problems
    const prompt = `Generate a Persian report about the user "${user.username}". They had ${user.count} recent issues: ${JSON.stringify(user.issues)}. 
    Analyze:
    1. What is the recurring technical theme?
    2. Is the user at high risk of churn?
    3. Actionable advice for the support team.
    Format as a short paragraph.`;
    
    const res = await callGeminiAI(prompt, false);
    setAiLoading(false);
    if (res) {
      alert(res);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const today = new Date().toLocaleDateString('fa-IR');
    const isEdit = !!editingId;
    let table = '';
    const commonFields = { username: formData.username, phone_number: formData.phone_number, instagram_username: formData.instagram_username, flag: formData.flag || null };
    let payload = {};

    if (modalType === 'issue') {
      table = 'issues';
      payload = { ...commonFields, desc_text: formData.desc_text, module: formData.module, type: formData.type, status: formData.status || 'باز', support: formData.support, subscription_status: formData.subscription_status, resolved_at: formData.resolved_at, technical_note: formData.technical_note };
      if (!isEdit) payload.created_at = today;
    } else if (modalType === 'frozen') {
      table = 'frozen';
      payload = { ...commonFields, desc_text: formData.desc_text, module: formData.module, cause: formData.cause, status: formData.status || 'فریز', subscription_status: formData.subscription_status, first_frozen_at: formData.first_frozen_at, freeze_count: formData.freeze_count ? Number(formData.freeze_count) : null, last_frozen_at: formData.last_frozen_at, resolve_status: formData.resolve_status, note: formData.note };
      if (!isEdit) payload.frozen_at = today;
    } else if (modalType === 'feature') {
      table = 'features';
      payload = { ...commonFields, desc_text: formData.desc_text, title: formData.title, category: formData.category, status: formData.status || 'بررسی نشده', repeat_count: formData.repeat_count ? Number(formData.repeat_count) : null, importance: formData.importance ? Number(formData.importance) : null, internal_note: formData.internal_note };
      if (!isEdit) payload.created_at = today;
    } else if (modalType === 'refund') {
      table = 'refunds';
      payload = { ...commonFields, reason: formData.reason, duration: formData.duration, category: formData.category, action: formData.action || 'در حال بررسی', suggestion: formData.suggestion, can_return: formData.can_return, sales_source: formData.sales_source, ops_note: formData.ops_note };
      if (!isEdit) payload.requested_at = today;
    } else if (modalType === 'profile') {
      table = 'profiles';
      payload = { 
        username: formData.username, 
        phone_number: formData.phone_number, 
        instagram_username: formData.instagram_username,
        telegram_id: formData.telegram_id,
        website: formData.website,
        bio: formData.bio
      };
      if (!isEdit) payload.created_at = today;
    }

    if (!supabase) return alert('دیتابیس متصل نیست.');
    let error = null;
    if (isEdit) {
      const res = await supabase.from(table).update(payload).eq('id', editingId);
      error = res.error;
      if (!error) {
        const updater = (prev) => prev.map((r) => (r.id === editingId ? { ...r, ...payload } : r));
        if (table === 'issues') setIssues(updater);
        if (table === 'frozen') setFrozen(updater);
        if (table === 'features') setFeatures(updater);
        if (table === 'refunds') setRefunds(updater);
        if (table === 'profiles') setProfiles(updater);
      }
    } else {
      const res = await supabase.from(table).insert([payload]);
      error = res.error;
      if (!error && table === 'profiles') {
        // Since we don't have real-time for manual inserts sometimes, safe to update local state too if no error
        // But the subscription should handle it. If not, we can force it here.
      }
    }
    if (error) alert('خطا: ' + error.message);
    else { setIsModalOpen(false); setEditingId(null); setFormData({ ...INITIAL_FORM_DATA }); }
  };

  const openModal = (t, record = null) => {
    setModalType(t);
    if (record) { 
      setEditingId(record.id); 
      setFormData({ ...INITIAL_FORM_DATA, ...record }); 
    } else { 
      setEditingId(null); 
      setFormData({ ...INITIAL_FORM_DATA }); 
    }
    setIsModalOpen(true);
  };

  // صفحه لاگین
  if (appPassword && !isAuthed) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-l from-slate-100 to-white p-4" dir="rtl">
        <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md border">
          <h1 className="text-xl font-extrabold mb-4 text-center text-slate-800">ورود به داشبورد پشتیبانی</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="رمز عبور" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
            {loginError && <div className="text-xs text-red-500 text-center">{loginError}</div>}
            <button type="submit" className="w-full bg-gradient-to-l from-blue-600 to-sky-500 text-white rounded-xl py-2.5 text-sm font-bold">ورود</button>
          </form>
        </div>
      </div>
    );
  }

  // ===== صفحه اصلی =====
  return (
    <div className="h-screen w-screen flex bg-[#F3F4F6] overflow-hidden" dir="rtl">
      
      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
      <div className="fixed top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="fixed -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 pointer-events-none"></div>

      {/* Overlay موبایل */}
      {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-40 md:hidden" />}
      
      {/* ===== SIDEBAR ===== */}
      <aside 
        className={`
          ${isSidebarOpen ? 'w-64' : 'w-0 md:w-20'} 
          h-full bg-white/90 backdrop-blur-xl border-l border-gray-200 
          flex flex-col transition-all duration-300 overflow-hidden
          fixed md:static inset-y-0 right-0 z-50
        `}
      >
        {/* Header سایدبار */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-purple-600 text-xl">وردست</span>
              <span className="text-[10px] text-slate-400">داشبورد هوشمند</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl border mr-auto">
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* منوی ناوبری */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
            { id: 'issues', label: 'مشکلات فنی', icon: AlertTriangle },
            { id: 'frozen', label: 'اکانت فریز', icon: Snowflake },
            { id: 'features', label: 'درخواست فیچر', icon: Lightbulb },
            { id: 'refunds', label: 'بازگشت وجه', icon: CreditCard },
            { id: 'profile', label: 'پروفایل کاربر', icon: User },
            { id: 'ai-analysis', label: 'تحلیل هوشمند', icon: BrainCircuit }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); if(window.innerWidth < 768) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100' 
                  : 'text-slate-600 hover:bg-gray-50'
              }`}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* فوتر سایدبار */}
        <div className="p-4 text-xs text-center text-gray-400 border-t flex-shrink-0">
          {isConnected ? (
            <span className="text-emerald-600 flex justify-center gap-1 font-bold items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isSidebarOpen && <span>آنلاین</span>}
            </span>
          ) : 'آفلاین'}
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden">
        <div className="px-4 sm:px-8 py-6 min-h-full">
          
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 bg-white border rounded-xl shadow-sm text-gray-600">
                <Menu size={20} />
              </button>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">داشبورد پشتیبانی</h1>
            </div>
            <div className="hidden sm:block text-xs text-slate-500 bg-white/60 px-3 py-1.5 rounded-full border">
              امروز {new Date().toLocaleDateString('fa-IR', { weekday: 'long', month: '2-digit', day: '2-digit' })}
            </div>
          </header>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <section className="space-y-6">
              {/* Cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { title: 'نرخ حل مشکلات', value: `%${analytics.solvedRatio}`, sub: 'بسته شده', color: 'from-emerald-500 to-teal-400', icon: CheckCircle2 },
                  { title: 'اکانت‌های فریز', value: analytics.activeFrozen, sub: 'کاربر فعال', color: 'from-blue-500 to-indigo-400', icon: Snowflake },
                  { title: 'بازگشت وجه', value: analytics.refundCount, sub: 'درخواست', color: 'from-rose-500 to-pink-400', icon: CreditCard },
                  { title: 'کل تیکت‌ها', value: issues.length, sub: 'ثبت شده', color: 'from-slate-700 to-slate-500', icon: Activity }
                ].map((card, idx) => (
                  <div key={idx} className="bg-white/70 backdrop-blur p-4 sm:p-5 rounded-2xl shadow-sm border border-white flex flex-col justify-between h-28 sm:h-32 relative overflow-hidden group hover:shadow-md transition">
                    <div className={`absolute -right-6 -top-6 p-4 rounded-full bg-gradient-to-br ${card.color} opacity-10 group-hover:opacity-20 transition scale-150`}>
                      <card.icon size={50} />
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-500 z-10">{card.title}</span>
                    <div className="flex items-end gap-2 z-10">
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-800">{card.value}</h3>
                      <span className="text-[9px] sm:text-[10px] text-gray-400 mb-1">{card.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Churn Risk */}
                <div className="xl:col-span-1 bg-white/70 backdrop-blur p-5 rounded-2xl shadow-sm border border-red-100 flex flex-col h-80">
                  <h4 className="font-bold text-gray-700 text-sm mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center"><AlertCircle size={14}/></span>
                    ریسک ریزش کاربر (۳۰ روز اخیر)
                  </h4>
                  <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                    {churnRisks.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <CheckCircle2 size={40} className="text-emerald-500 mb-2" />
                        <span className="text-xs">هیچ کاربری در خطر نیست!</span>
                      </div>
                    ) : churnRisks.map((user, idx) => (
                      <div key={idx} className="bg-white border border-red-50 p-3 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 cursor-pointer hover:opacity-70" onClick={() => navigateToProfile(user.username)}>
                            <UserAvatar name={user.username} size="sm"/>
                            <span className="font-bold text-sm text-gray-800">{user.username}</span>
                          </div>
                          <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-red-100">{user.count} خطا</span>
                        </div>
                        <button onClick={() => handleAiChurnAnalysis(user)} className="w-full flex items-center justify-center gap-1 text-[10px] text-purple-600 bg-purple-50 hover:bg-purple-600 hover:text-white border border-purple-100 px-3 py-1.5 rounded-lg transition">
                          {aiLoading ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>}
                          گزارش مشکلات
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Charts */}
                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/70 backdrop-blur p-5 rounded-2xl shadow-sm border border-white flex flex-col h-80">
                    <h4 className="font-bold text-gray-700 text-sm mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-blue-500"/>روند ثبت مشکلات</h4>
                    <div className="flex-1 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs><linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                          <XAxis dataKey="date" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px'}} />
                          <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCount)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white/70 backdrop-blur p-5 rounded-2xl shadow-sm border border-white flex flex-col h-80">
                    <h4 className="font-bold text-gray-700 text-sm mb-4">دلایل بازگشت وجه</h4>
                    <div className="flex-1 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieChartData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5}>
                            {pieChartData.map((e, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={2} />))}
                          </Pie>
                          <Tooltip contentStyle={{borderRadius: '12px', fontSize: '11px'}} />
                          <Legend wrapperStyle={{ fontSize: '9px' }} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <UserProfile 
              allUsers={allUsers} 
              issues={issues} 
              frozen={frozen} 
              features={features} 
              refunds={refunds} 
              openModal={openModal} 
              profileSearch={profileSearch}
              setProfileSearch={setProfileSearch}
            />
          )}

          {/* AI Analysis Tab */}
          {activeTab === 'ai-analysis' && (
            <AIAnalysisTab issues={issues} navigateToProfile={navigateToProfile} />
          )}

          {/* Data Tables Tab */}
          {['issues', 'frozen', 'features', 'refunds'].includes(activeTab) && (
            <section>
              <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-white p-4 sm:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                  <div>
                    <h2 className="font-bold text-lg text-gray-800">
                      {activeTab === 'issues' ? 'مشکلات فنی' : activeTab === 'frozen' ? 'اکانت فریز' : activeTab === 'features' ? 'درخواست فیچر' : 'بازگشت وجه'}
                    </h2>
                    <p className="text-xs text-slate-500">لیست کامل داده‌ها</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => downloadCSV(activeTab === 'issues' ? issues : activeTab === 'frozen' ? frozen : activeTab === 'features' ? features : refunds, activeTab)} className="flex-1 md:flex-none justify-center border px-4 py-2 rounded-xl text-sm flex gap-2 items-center hover:bg-gray-50 bg-white font-medium">
                      <Download size={16} /><span className="hidden sm:inline">خروجی CSV</span>
                    </button>
                    <button onClick={() => openModal(activeTab === 'issues' ? 'issue' : activeTab === 'frozen' ? 'frozen' : activeTab === 'features' ? 'feature' : 'refund')} className="flex-1 md:flex-none justify-center bg-blue-600 text-white px-4 py-2 rounded-xl text-sm flex gap-2 items-center hover:bg-blue-700 shadow-lg shadow-blue-200 font-bold">
                      <Plus size={16} /> ثبت جدید
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-2xl border">
                  <table className="w-full text-sm text-right min-w-[600px]">
                    <thead className="bg-slate-50 text-gray-500 border-b">
                      <tr>
                        <th className="p-4 font-medium">تاریخ</th>
                        <th className="p-4 font-medium">کاربر</th>
                        <th className="p-4 font-medium">توضیحات</th>
                        <th className="p-4 font-medium">وضعیت</th>
                        <th className="p-4 font-medium">اقدام</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y">
                      {(activeTab === 'issues' ? issues : activeTab === 'frozen' ? frozen : activeTab === 'features' ? features : refunds).map((row) => (
                        <tr key={row.id} className={`hover:bg-blue-50/30 ${row.flag === 'پیگیری فوری' ? 'bg-red-50/50' : row.flag === 'پیگیری مهم' ? 'bg-amber-50/50' : ''}`}>
                          <td className="p-4 text-gray-500 text-xs whitespace-nowrap font-mono">{row.created_at || row.frozen_at || row.requested_at}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 cursor-pointer hover:opacity-70" onClick={() => navigateToProfile(row.username)}>
                              <UserAvatar name={row.username} size="sm" />
                              <span className="font-bold text-gray-700 text-sm">{row.username}</span>
                            </div>
                          </td>
                          <td className="p-4 max-w-xs truncate text-gray-600 text-sm">{row.desc_text || row.reason || row.title}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${row.status === 'حل‌شده' || row.status === 'انجام شد' || row.action === 'بازپرداخت شد' || row.status === 'رفع شد' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-white text-slate-600 border-slate-200'}`}>
                              {row.status || row.action}
                            </span>
                          </td>
                          <td className="p-4">
                            <button onClick={() => openModal(activeTab === 'issues' ? 'issue' : activeTab === 'frozen' ? 'frozen' : activeTab === 'features' ? 'feature' : 'refund', row)} className="text-xs px-3 py-1.5 rounded-full border hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 bg-white font-medium">
                              ویرایش
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* ===== MODAL ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-[60] p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b flex justify-between items-center flex-shrink-0">
              <h3 className="font-bold text-base text-gray-800">{editingId ? (modalType === 'profile' ? 'ویرایش پروفایل' : 'ویرایش گزارش') : (modalType === 'profile' ? 'ثبت پروفایل جدید' : 'ثبت مورد جدید')}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              
              {modalType === 'profile' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium">نام کاربری (یکتا)</label>
                    <input required value={formData.username || ''} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full border p-3 rounded-xl outline-none focus:border-blue-500 bg-slate-50/50 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-xs text-gray-500 font-medium">شماره تماس</label><input placeholder="0912..." value={formData.phone_number || ''} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} className="w-full border p-3 rounded-xl outline-none focus:border-blue-500 bg-white text-sm" /></div>
                    <div className="space-y-1"><label className="text-xs text-gray-500 font-medium">اینستاگرام</label><input placeholder="username" value={formData.instagram_username || ''} onChange={(e) => setFormData({ ...formData, instagram_username: e.target.value })} className="w-full border p-3 rounded-xl outline-none focus:border-blue-500 bg-white text-sm" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-xs text-gray-500 font-medium">آیدی تلگرام</label><input placeholder="@id" value={formData.telegram_id || ''} onChange={(e) => setFormData({ ...formData, telegram_id: e.target.value })} className="w-full border p-3 rounded-xl outline-none focus:border-blue-500 bg-white text-sm" /></div>
                    <div className="space-y-1"><label className="text-xs text-gray-500 font-medium">وبسایت</label><input placeholder="https://..." value={formData.website || ''} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full border p-3 rounded-xl outline-none focus:border-blue-500 bg-white text-sm" /></div>
                  </div>
                  <div className="space-y-1"><label className="text-xs text-gray-500 font-medium">بیوگرافی / یادداشت</label><textarea rows="3" value={formData.bio || ''} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="w-full border p-3 rounded-xl outline-none focus:border-blue-500 bg-white text-sm"></textarea></div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium">نام کاربری</label>
                    <UserSearchInput 
                      value={formData.username || ''} 
                      onChange={(val) => setFormData(prev => ({ ...prev, username: val }))} 
                      onSelect={(u) => setFormData(prev => ({ 
                        ...prev, 
                        username: u.username, 
                        phone_number: u.phone_number || prev.phone_number, 
                        instagram_username: u.instagram_username || prev.instagram_username,
                        allUsers: allUsers // Pass allUsers to UserSearchInput
                      }))}
                      allUsers={allUsers}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-xs text-gray-500 font-medium">شماره تماس</label><input placeholder="0912..." value={formData.phone_number || ''} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} className="w-full border p-3 rounded-xl outline-none focus:border-blue-500 bg-white text-sm" /></div>
                    <div className="space-y-1"><label className="text-xs text-gray-500 font-medium">اینستاگرام</label><input placeholder="username" value={formData.instagram_username || ''} onChange={(e) => setFormData({ ...formData, instagram_username: e.target.value })} className="w-full border p-3 rounded-xl outline-none focus:border-blue-500 bg-white text-sm" /></div>
                  </div>
                  <div className="border-b my-2"></div>
                </>
              )}

              {modalType === 'issue' && (
                <>
                  <div className="space-y-1"><label className="text-xs text-gray-500 font-medium">وضعیت</label>
                  <select value={formData.status || 'باز'} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border p-3 rounded-xl text-xs bg-white outline-none"><option value="باز">باز</option><option value="در حال بررسی">در حال بررسی</option><option value="حل‌شده">حل‌شده</option></select></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-xs text-gray-500 font-medium">وضعیت اشتراک</label><select value={formData.subscription_status || ''} onChange={(e) => setFormData({ ...formData, subscription_status: e.target.value })} className="w-full border p-3 rounded-xl text-xs bg-white outline-none"><option value="">انتخاب...</option><option value="Active">Active</option><option value="Paused">Paused</option><option value="Expired">Expired</option></select></div>
                    <div className="space-y-1"><label className="text-xs text-gray-500 font-medium">پشتیبان</label><input value={formData.support || ''} onChange={(e) => setFormData({ ...formData, support: e.target.value })} className="w-full border p-3 rounded-xl text-xs bg-white outline-none" /></div>
                  </div>
                  <div className="relative space-y-1"><label className="text-xs text-gray-500 font-medium">شرح مشکل</label><textarea rows="3" value={formData.desc_text || ''} onChange={(e) => setFormData({ ...formData, desc_text: e.target.value })} className="w-full border p-3 rounded-xl outline-none focus:border-blue-500 bg-white text-sm"></textarea></div>
                  <div className="space-y-1"><label className="text-xs text-gray-500 font-medium">یادداشت فنی</label><textarea rows="2" value={formData.technical_note || ''} onChange={(e) => setFormData({ ...formData, technical_note: e.target.value })} className="w-full border p-3 rounded-xl text-xs bg-white outline-none"></textarea></div>
                </>
              )}
              {modalType === 'frozen' && (
                <div className="space-y-3">
                  <div className="space-y-1"><label className="text-xs text-gray-500 font-medium">وضعیت</label><select value={formData.status || 'فریز'} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border p-3 rounded-xl text-xs bg-white outline-none"><option value="فریز">فریز</option><option value="در حال رفع">در حال رفع</option><option value="رفع شد">رفع شد</option></select></div>
                  <div className="grid grid-cols-2 gap-3"><div className="space-y-1"><label className="text-xs text-gray-500 font-medium">ماژول</label><input value={formData.module || ''} onChange={(e) => setFormData({ ...formData, module: e.target.value })} className="w-full border p-3 rounded-xl text-xs bg-white outline-none" /></div><div className="space-y-1"><label className="text-xs text-gray-500 font-medium">علت</label><input value={formData.cause || ''} onChange={(e) => setFormData({ ...formData, cause: e.target.value })} className="w-full border p-3 rounded-xl text-xs bg-white outline-none" /></div></div>
                  <textarea placeholder="توضیحات تکمیلی..." value={formData.desc_text || ''} onChange={(e) => setFormData({...formData, desc_text: e.target.value})} className="w-full border p-3 rounded-xl text-xs bg-white outline-none" />
                </div>
              )}
              {modalType === 'feature' && (
                <div className="space-y-3">
                  <div className="space-y-1"><label className="text-xs text-gray-500 font-medium">وضعیت</label><select value={formData.status || 'بررسی نشده'} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border p-3 rounded-xl text-xs bg-white outline-none"><option value="بررسی نشده">بررسی نشده</option><option value="در تحلیل">در تحلیل</option><option value="در توسعه">در توسعه</option><option value="انجام شد">انجام شد</option></select></div>
                  <input placeholder="عنوان فیچر" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full border p-3 rounded-xl text-xs bg-white outline-none" />
                  <textarea placeholder="شرح..." value={formData.desc_text || ''} onChange={(e) => setFormData({...formData, desc_text: e.target.value})} className="w-full border p-3 rounded-xl text-xs bg-white outline-none" />
                </div>
              )}
              {modalType === 'refund' && (
                <div className="space-y-3">
                  <div className="space-y-1"><label className="text-xs text-gray-500 font-medium">وضعیت</label><select value={formData.action || 'در حال بررسی'} onChange={(e) => setFormData({...formData, action: e.target.value})} className="w-full border p-3 rounded-xl text-xs bg-white outline-none"><option value="در حال بررسی">در حال بررسی</option><option value="بازپرداخت شد">بازپرداخت شد</option><option value="رد شد">رد شد</option></select></div>
                  <textarea placeholder="دلیل..." rows="3" value={formData.reason || ''} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full border p-3 rounded-xl text-xs bg-white outline-none" />
                </div>
              )}
              
              {modalType !== 'profile' && (
                <div className="space-y-1 mt-4"><label className="text-xs text-gray-500 font-medium">اولویت</label><select value={formData.flag || ''} onChange={(e) => setFormData({ ...formData, flag: e.target.value })} className="w-full border p-3 rounded-xl text-xs bg-white outline-none"><option value="">عادی</option><option value="پیگیری مهم">پیگیری مهم</option><option value="پیگیری فوری">پیگیری فوری</option></select></div>
              )}
              
              <button type="submit" className="w-full bg-gradient-to-l from-blue-600 to-blue-500 text-white p-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-200 mt-2 text-sm">ذخیره اطلاعات</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
