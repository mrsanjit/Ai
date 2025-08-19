import React, { useState, useEffect, ChangeEvent, useMemo } from 'react';
import { FilterConfig, ActiveFilters } from '../types';

// ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon, XCircleIcon SVG components
const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
);
const ChevronUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M14.78 11.78a.75.75 0 0 1-1.06 0L10 8.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
    </svg>
);
const MagnifyingGlassIcon = () => ( // Adjusted for dark theme
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-400">
        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
    </svg>
);
const XCircleIcon = () => ( // Adjusted for dark theme
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-400 hover:text-slate-200">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-11.707a1 1 0 0 0-1.414-1.414L10 8.586 7.707 6.293a1 1 0 0 0-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 1 0 1.414 1.414L10 11.414l2.293 2.293a1 1 0 0 0 1.414-1.414L11.414 10l2.293-2.293Z" clipRule="evenodd" />
    </svg>
);


interface FilterCardProps {
  filterConfig: FilterConfig;
  activeFilterValue: string[] | { min?: number | string; max?: number | string } | undefined;
  onFilterChange: (column: string, value: any) => void;
  onClearFilter: (column: string) => void;
  disabled?: boolean;
}

const FilterCard: React.FC<FilterCardProps> = ({
  filterConfig,
  activeFilterValue,
  onFilterChange,
  onClearFilter,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');

  const { column, type, options, min: dataMin, max: dataMax } = filterConfig;

  const filteredOptions = useMemo(() => {
    if (type !== 'categorical' || !options) return [];
    return options.filter(option =>
      String(option ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, type]);

  const handleCategoricalChange = (optionValue: string) => {
    const currentSelection = (activeFilterValue as string[] || []);
    const newSelection = currentSelection.includes(optionValue)
      ? currentSelection.filter(item => item !== optionValue)
      : [...currentSelection, optionValue];
    onFilterChange(column, newSelection);
  };

  const handleSelectAllCategorical = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onFilterChange(column, filteredOptions); 
    } else {
      onFilterChange(column, []);
    }
  };

  const handleNumericalChange = (rangeType: 'min' | 'max', event: ChangeEvent<HTMLInputElement>) => {
    const currentNumericalValue = (activeFilterValue as { min?: number | string; max?: number | string } || {});
    const value = event.target.value === '' ? undefined : parseFloat(event.target.value);
    onFilterChange(column, { ...currentNumericalValue, [rangeType]: value });
  };
  
  const isFilterActive = activeFilterValue !== undefined && 
    ( (Array.isArray(activeFilterValue) && activeFilterValue.length > 0) || 
      (typeof activeFilterValue === 'object' && !Array.isArray(activeFilterValue) && (activeFilterValue.min !== undefined || activeFilterValue.max !== undefined))
    );

  return (
    <div className="bg-slate-700/50 backdrop-blur-sm border border-slate-600 rounded-lg shadow-md">
      {/* Card Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-600/60 rounded-t-lg transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={`filter-content-${column}`}
      >
        <span className="text-sm font-medium text-slate-200 truncate" title={column}>{column}</span>
        <div className="flex items-center space-x-2 text-slate-400">
          {isFilterActive && !disabled && (
            <button
              onClick={(e) => { e.stopPropagation(); onClearFilter(column); }}
              className="p-0.5"
              aria-label={`Clear filter for ${column}`}
            >
              <XCircleIcon />
            </button>
          )}
          {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
      </div>

      {/* Card Content (Collapsible) */}
      {isExpanded && (
        <div id={`filter-content-${column}`} className="p-3 border-t border-slate-600">
          {type === 'categorical' && options && (
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search values..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={disabled}
                  className="w-full pl-8 pr-2 py-1.5 border border-slate-500 rounded-md text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-slate-700 text-slate-200 placeholder-slate-400 disabled:bg-slate-600 disabled:opacity-70"
                />
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon />
                </div>
              </div>
              {filteredOptions.length > 5 && ( 
                 <div className="flex items-center">
                    <input
                        type="checkbox"
                        id={`select-all-${column}`}
                        checked={filteredOptions.length > 0 && (activeFilterValue as string[] || []).length === filteredOptions.length}
                        onChange={handleSelectAllCategorical}
                        disabled={disabled || filteredOptions.length === 0}
                        className="h-4 w-4 text-primary-500 border-slate-500 rounded focus:ring-primary-500 disabled:opacity-50 bg-slate-600"
                    />
                    <label htmlFor={`select-all-${column}`} className="ml-2 text-xs text-slate-300">
                        Select All (Visible)
                    </label>
                 </div>
              )}
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1 custom-scrollbar-thin-dark">
                {filteredOptions.map(option => (
                  <div key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`filter-${column}-${option}`}
                      value={option}
                      checked={(activeFilterValue as string[] || []).includes(option)}
                      onChange={() => handleCategoricalChange(option)}
                      disabled={disabled}
                      className="h-4 w-4 text-primary-500 border-slate-500 rounded focus:ring-primary-500 disabled:opacity-50 bg-slate-600"
                    />
                    <label htmlFor={`filter-${column}-${option}`} className="ml-2 text-xs text-slate-300 truncate flex-1" title={option === '' ? '[Blank]' : option}>
                      {option === null || option === undefined || option === '' ? <span className="italic text-slate-400">[Blank]</span> : option}
                    </label>
                  </div>
                ))}
                 {filteredOptions.length === 0 && searchTerm && (
                    <p className="text-xs text-slate-400 text-center py-2">No matching values.</p>
                )}
              </div>
            </div>
          )}

          {type === 'numerical' && (
            <div className="space-y-2">
              <input
                type="number"
                placeholder={`Min: ${dataMin?.toLocaleString() ?? 'auto'}`}
                value={(activeFilterValue as { min?: string | number })?.min ?? ''}
                onChange={(e) => handleNumericalChange('min', e)}
                disabled={disabled}
                className="w-full p-1.5 border border-slate-500 rounded-md text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-slate-700 text-slate-200 placeholder-slate-400 disabled:bg-slate-600 disabled:opacity-70"
                step="any"
              />
              <input
                type="number"
                placeholder={`Max: ${dataMax?.toLocaleString() ?? 'auto'}`}
                value={(activeFilterValue as { max?: string | number })?.max ?? ''}
                onChange={(e) => handleNumericalChange('max', e)}
                disabled={disabled}
                className="w-full p-1.5 border border-slate-500 rounded-md text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-slate-700 text-slate-200 placeholder-slate-400 disabled:bg-slate-600 disabled:opacity-70"
                step="any"
              />
            </div>
          )}
        </div>
      )}
      <style>{`
        .custom-scrollbar-thin-dark::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar-thin-dark::-webkit-scrollbar-track {
          background: #334155; /* slate-700 */
        }
        .custom-scrollbar-thin-dark::-webkit-scrollbar-thumb {
          background: #64748b; /* slate-500 */
          border-radius: 10px;
        }
        .custom-scrollbar-thin-dark::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; /* slate-400 */
        }
      `}</style>
    </div>
  );
};

export default FilterCard;