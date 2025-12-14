import React, { useState, useRef } from "react";

const ElasticSlider = ({ value, onChange, min = 0, max = 100 }) => {
  return (
      <div className="w-full relative h-10 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center px-2 overflow-hidden shadow-inner">
          <input 
            type="range" 
            min={min} 
            max={max} 
            value={value} 
            onChange={(e) => onChange(Number(e.target.value))} 
            className="w-full absolute inset-0 opacity-0 cursor-pointer z-20"
          />
          <div 
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl z-10 transition-all duration-75 ease-out" 
            style={{ width: `${(value / max) * 100}%` }}
          />
          <div className="relative z-20 flex justify-between w-full pointer-events-none text-xs font-bold px-2">
             <span className="text-slate-500 dark:text-slate-400">{min}%</span>
             <span className="text-white drop-shadow-md">{value}%</span>
             <span className="text-slate-500 dark:text-slate-400">{max}%</span>
          </div>
      </div>
  );
};

export default ElasticSlider;
