import React from 'react';

const FlagFilter = ({ selectedFlags, onChange }) => {
  const toggleFlag = (flag) => {
    if (selectedFlags.includes(flag)) onChange(selectedFlags.filter(f => f !== flag));
    else onChange([...selectedFlags, flag]);
  };
  return (
    <div className="flex gap-2 items-center text-xs">
      <span className="text-gray-400 font-medium">فیلتر:</span>
      <button onClick={() => toggleFlag('پیگیری فوری')} className={`px-2 py-1 rounded-lg border transition ${selectedFlags.includes('پیگیری فوری') ? 'bg-red-100 border-red-200 text-red-700 font-bold' : 'bg-white text-gray-500'}`}>فوری</button>
      <button onClick={() => toggleFlag('پیگیری مهم')} className={`px-2 py-1 rounded-lg border transition ${selectedFlags.includes('پیگیری مهم') ? 'bg-amber-100 border-amber-200 text-amber-700 font-bold' : 'bg-white text-gray-500'}`}>مهم</button>
      <button onClick={() => toggleFlag('technical_review')} className={`px-2 py-1 rounded-lg border transition ${selectedFlags.includes('technical_review') ? 'bg-indigo-100 border-indigo-200 text-indigo-700 font-bold' : 'bg-white text-gray-500'}`}>بررسی فنی</button>
    </div>
  );
};

export default FlagFilter;
