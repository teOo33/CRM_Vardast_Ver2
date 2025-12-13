import React from 'react';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Calendar, X } from 'lucide-react';

const TimeFilter = ({ value, onChange, customRange, onCustomChange }) => {
    return (
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border dark:border-slate-700 shadow-sm">
            {['1d', '7d', '30d', '1y'].map((range) => (
                <button key={range} onClick={() => { onChange(range); onCustomChange(null); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${value === range ? 'bg-blue-100 text-blue-700' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                    {range === '1d' ? '۲۴ ساعت' : range === '7d' ? '۷ روز' : range === '30d' ? '۳۰ روز' : 'یک سال'}
                </button>
            ))}
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            <DatePicker
                value={customRange}
                onChange={(date) => { onCustomChange(date); onChange('custom'); }}
                range
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-left"
                render={(value, openCalendar) => (
                    <button onClick={openCalendar} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${value ? 'bg-blue-100 text-blue-700' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                        <Calendar size={14}/>
                        {value ? value.toString() : 'تاریخ دلخواه'}
                    </button>
                )}
            />
            {value && <button onClick={() => { onChange(null); onCustomChange(null); }} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition"><X size={14}/></button>}
        </div>
    );
};

export default TimeFilter;
