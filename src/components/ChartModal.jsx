import React from 'react';
import { X } from 'lucide-react';

const ChartModal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full h-full max-w-5xl max-h-[80vh] rounded-3xl p-6 flex flex-col relative animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-gray-500 dark:text-gray-400"><X size={24}/></button>
                </div>
                <div className="flex-1 w-full h-full min-h-0">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ChartModal;
