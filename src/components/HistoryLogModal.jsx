import React from 'react';
import { History, X } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { formatDate } from '../utils/helpers';

const HistoryLogModal = ({ isOpen, onClose, history }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
             <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[60vh] animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
                    <h3 className="font-bold text-gray-700 dark:text-white flex items-center gap-2"><History size={18}/> تاریخچه تغییرات</h3>
                    <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-red-500"/></button>
                </div>
                <div className="overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {(!history || history.length === 0) ? (
                        <p className="text-center text-gray-400 text-sm py-4">تغییری ثبت نشده است.</p>
                    ) : (
                        history.map((h, i) => (
                            <div key={i} className="flex gap-3 text-sm border-b dark:border-slate-700 pb-3 last:border-0 last:pb-0">
                                <UserAvatar name={h.user} size="sm"/>
                                <div>
                                    <div className="font-bold text-gray-700 dark:text-gray-200">{h.user}</div>
                                    <div className="text-xs text-gray-400">{formatDate(h.date)} - {new Date(h.date).toLocaleTimeString('fa-IR')}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{h.action === 'edit' ? 'ویرایش اطلاعات' : 'ایجاد رکورد'}</div>
                                    {h.changes && h.changes.length > 0 && (
                                        <div className="mt-2 bg-gray-100 dark:bg-slate-900 p-2 rounded-lg space-y-1">
                                            {h.changes.map((change, idx) => (
                                                <div key={idx} className="flex flex-wrap gap-1 text-[10px] items-center">
                                                    <span className="font-bold text-gray-600 dark:text-gray-300">{change.field}:</span>
                                                    <span className="text-red-400 line-through truncate max-w-[50px]">{String(change.old !== undefined && change.old !== null ? change.old : '-')}</span>
                                                    <span className="text-gray-400">{'->'}</span>
                                                    <span className="text-emerald-500 truncate max-w-[80px]">{String(change.new !== undefined && change.new !== null ? change.new : '-')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
             </div>
        </div>
    );
};

export default HistoryLogModal;
