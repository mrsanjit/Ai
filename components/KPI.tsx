import React from 'react';
import { ProcessedKPIData } from '../types';

interface KPIProps {
  data: ProcessedKPIData;
}

const KPI: React.FC<KPIProps> = ({ data }) => {
  const { title, value, prefix, suffix } = data;

  const displayValue = typeof value === 'number' 
    ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) 
    : value;

  return (
    <div className="p-5 bg-slate-700/50 backdrop-blur-md rounded-xl shadow-xl text-center h-full flex flex-col justify-center items-center transform transition-all duration-300 hover:scale-105 hover:bg-slate-600/60 border border-slate-600/70">
      <h3 className="text-sm sm:text-base font-semibold text-slate-300 uppercase tracking-wider mb-1.5 truncate max-w-full" title={title}>
        {title}
      </h3>
      <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-sky-400">
        {prefix}{displayValue}{suffix}
      </p>
    </div>
  );
};

export default KPI;