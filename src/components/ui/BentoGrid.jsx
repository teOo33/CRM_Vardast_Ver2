import React from 'react';

const BentoGrid = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(180px,auto)] ${className}`}>
      {children}
    </div>
  );
};

export const BentoItem = ({ children, className = '', span = 1 }) => {
  const spanClass = span === 2 ? 'md:col-span-2' : span === 3 ? 'md:col-span-3' : 'md:col-span-1';
  return (
    <div className={`bg-white/70 dark:bg-slate-800/70 dark:border-slate-700 backdrop-blur p-5 rounded-2xl shadow-sm border border-white flex flex-col justify-between liquid-glass transition-all hover:shadow-md ${spanClass} ${className}`}>
      {children}
    </div>
  );
};

export default BentoGrid;
