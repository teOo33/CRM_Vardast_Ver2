import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { callVardastAI } from '../utils/vardast';
import { getGeneralChatbotPrompt } from '../utils/prompts';

const AIChatBox = ({ contextData }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);
    
    const handleSend = async () => { 
        if (!input.trim()) return; 
        const userMsg = { role: 'user', text: input }; 
        setMessages(prev => [...prev, userMsg]); 
        setInput(''); 
        setLoading(true); 
        
        // Tool 8 (General Chatbot): Send the complete dataset including ALL information from ALL tabs (Technical Issues, Onboarding, Feature Requests, Refunds, Freeze, Meetings, and Churn List).
        // contextData should now contain all these.
        const prompt = getGeneralChatbotPrompt(contextData, userMsg.text); 
        
        const res = await callVardastAI(prompt); 
        setMessages(prev => [...prev, { role: 'ai', text: res || 'Error fetching response' }]); 
        setLoading(false); 
    };
    
    return (
        <div className="flex flex-col h-[500px] bg-white rounded-3xl shadow-lg border overflow-hidden">
            <div className="bg-slate-50 p-4 border-b font-bold text-gray-700 flex items-center gap-2"><MessageSquare size={18} className="text-purple-600"/> چت با دستیار هوشمند</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>{messages.map((m, i) => (<div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}><div className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-purple-100 text-purple-900 rounded-br-none' : 'bg-slate-100 text-gray-800 rounded-bl-none'}`}>{m.text}</div></div>))}</div>
            <div className="p-3 border-t bg-slate-50 flex gap-2"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="پیام خود را بنویسید..." className="flex-1 border rounded-xl px-4 py-2 outline-none focus:border-purple-500"/><button onClick={handleSend} disabled={loading} className="bg-purple-600 text-white p-2 rounded-xl hover:bg-purple-700 transition"><Send size={20} /></button></div>
        </div>
    );
};

export default AIChatBox;
