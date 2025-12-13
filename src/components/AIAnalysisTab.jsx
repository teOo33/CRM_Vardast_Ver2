import React, { useState } from 'react';
import { Sparkles, Activity, GraduationCap, Lightbulb, Loader2 } from 'lucide-react';
import AIChatBox from './AIChatBox';
import { callVardastAI } from '../utils/vardast';

const AIAnalysisTab = ({ issues, onboardings, features }) => {
    const [loading, setLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const handleAnalysis = async (type) => { setLoading(true); let data = []; if (type === 'onboarding') { data = onboardings.map(u => ({ progress: u.progress, note: u.meeting_note || u.followup_note })); } else if (type === 'features') { data = features.filter(f => f.status !== 'انجام شد').map(f => ({ title: f.title, desc: f.desc_text, status: f.status, votes: f.repeat_count })); } else { data = issues.map(i => ({ type: i.type, desc: i.desc_text })); } const prompt = `Data: ${JSON.stringify(data)}`; const res = await callVardastAI(prompt); setAnalysisResult(res || 'Error'); setLoading(false); };
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10"><h2 className="text-2xl font-black mb-2 flex items-center gap-2"><Sparkles className="text-amber-300"/> تحلیل خودکار</h2><div className="flex gap-3 flex-wrap"><button onClick={() => handleAnalysis('general')} disabled={loading} className="bg-white text-indigo-700 px-4 py-2 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg flex items-center gap-2 text-sm">{loading ? <Loader2 size={16} className="animate-spin"/> : <Activity size={16}/>}مشکلات فنی</button><button onClick={() => handleAnalysis('onboarding')} disabled={loading} className="bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-600 transition shadow-lg flex items-center gap-2 border border-indigo-400 text-sm">{loading ? <Loader2 size={16} className="animate-spin"/> : <GraduationCap size={16}/>}آنبوردینگ</button><button onClick={() => handleAnalysis('features')} disabled={loading} className="bg-amber-400 text-indigo-900 px-4 py-2 rounded-xl font-bold hover:bg-amber-300 transition shadow-lg flex items-center gap-2 text-sm">{loading ? <Loader2 size={16} className="animate-spin"/> : <Lightbulb size={16}/>}فیچرها</button></div></div>
                </div>
                {analysisResult && <div className="bg-white p-6 rounded-3xl shadow-sm border prose prose-sm max-w-none">{analysisResult}</div>}
            </div>
            <AIChatBox contextData={{ issues: issues.length, onboardings: onboardings.length, features: features?.length, sample_issues: issues.slice(0, 10) }} />
        </div>
    );
};

export default AIAnalysisTab;
