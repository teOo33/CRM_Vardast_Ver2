import React, { useState, useMemo } from 'react';
import { Sparkles, Activity, GraduationCap, Lightbulb, Loader2, Users } from 'lucide-react';
import AIChatBox from './AIChatBox';
import { callVardastAI } from '../utils/vardast';
import TimeFilter from './TimeFilter';
import { filterDataByTime } from '../utils/helpers';
import { getAnalysisPrompt } from '../utils/prompts';

const AIAnalysisTab = ({ issues, onboardings, features, meetings }) => {
    const [loading, setLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [timeFilter, setTimeFilter] = useState('30d');
    const [customRange, setCustomRange] = useState(null);

    const filteredIssues = useMemo(() => filterDataByTime(issues, timeFilter, customRange), [issues, timeFilter, customRange]);
    const filteredOnboardings = useMemo(() => filterDataByTime(onboardings, timeFilter, customRange), [onboardings, timeFilter, customRange]);
    const filteredFeatures = useMemo(() => filterDataByTime(features, timeFilter, customRange), [features, timeFilter, customRange]);
    const filteredMeetings = useMemo(() => filterDataByTime(meetings, timeFilter, customRange), [meetings, timeFilter, customRange]);

    const handleAnalysis = async (type) => { 
        setLoading(true); 
        let data = []; 
        if (type === 'onboarding') { 
            data = filteredOnboardings;
        } else if (type === 'features') { 
            data = filteredFeatures;
        } else if (type === 'meetings') {
            data = filteredMeetings;
        } else { 
            data = filteredIssues;
        } 
        const prompt = getAnalysisPrompt(type, data); 
        const res = await callVardastAI(prompt); 
        setAnalysisResult(res || 'Error'); 
        setLoading(false); 
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <div className="space-y-6">
                <div className="flex justify-end mb-2">
                    <TimeFilter value={timeFilter} onChange={setTimeFilter} customRange={customRange} onCustomChange={setCustomRange} />
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black mb-4 flex items-center gap-2"><Sparkles className="text-amber-300"/> تحلیل خودکار</h2>
                        <div className="flex gap-3 flex-wrap">
                            <button onClick={() => handleAnalysis('general')} disabled={loading} className="bg-white text-indigo-700 px-4 py-2 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg flex items-center gap-2 text-sm">{loading ? <Loader2 size={16} className="animate-spin"/> : <Activity size={16}/>}مشکلات فنی</button>
                            <button onClick={() => handleAnalysis('onboarding')} disabled={loading} className="bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-600 transition shadow-lg flex items-center gap-2 border border-indigo-400 text-sm">{loading ? <Loader2 size={16} className="animate-spin"/> : <GraduationCap size={16}/>}آنبوردینگ</button>
                            <button onClick={() => handleAnalysis('features')} disabled={loading} className="bg-amber-400 text-indigo-900 px-4 py-2 rounded-xl font-bold hover:bg-amber-300 transition shadow-lg flex items-center gap-2 text-sm">{loading ? <Loader2 size={16} className="animate-spin"/> : <Lightbulb size={16}/>}فیچرها</button>
                            <button onClick={() => handleAnalysis('meetings')} disabled={loading} className="bg-teal-400 text-teal-900 px-4 py-2 rounded-xl font-bold hover:bg-teal-300 transition shadow-lg flex items-center gap-2 text-sm">{loading ? <Loader2 size={16} className="animate-spin"/> : <Users size={16}/>}گزارشات جلسه</button>
                        </div>
                    </div>
                </div>
                {analysisResult && <div className="bg-white p-6 rounded-3xl shadow-sm border prose prose-sm max-w-none dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300">{analysisResult}</div>}
            </div>
            <AIChatBox contextData={{ 
                issues: filteredIssues.length, 
                onboardings: filteredOnboardings.length, 
                features: filteredFeatures?.length, 
                meetings: filteredMeetings?.length,
                sample_issues: filteredIssues.slice(0, 5) 
            }} />
        </div>
    );
};

export default AIAnalysisTab;
