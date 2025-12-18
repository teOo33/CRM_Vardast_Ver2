import React from 'react';
import { ArrowRight } from 'lucide-react';

const BackButton = ({ onClick, label = 'بازگشت' }) => {
  return (
    <button 
      onClick={onClick} 
      className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
    >
      <ArrowRight size={18} />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
