import React, { useCallback } from 'react';
import { FilterConfig, ActiveFilters } from '../types';
import FilterCard from './FilterCard';

// Close Icon SVG
const XMarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);


interface FilterControlsProps {
  isOpen: boolean;
  onClose: () => void;
  filterableColumns: FilterConfig[];
  activeFilters: ActiveFilters;
  onFilterChange: (column: string, value: any) => void;
  onClearIndividualFilter: (column: string) => void;
  onClearFilters: () => void;
  disabled?: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  isOpen,
  onClose,
  filterableColumns,
  activeFilters,
  onFilterChange,
  onClearIndividualFilter,
  onClearFilters,
  disabled = false,
}) => {
  if (filterableColumns.length === 0 && !isOpen) { 
    return null;
  }

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 md:w-96 bg-slate-800/70 backdrop-blur-lg shadow-2xl transform transition-transform duration-300 ease-in-out z-[500] flex flex-col border-l border-slate-600/80
                  ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-pane-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-600/80 sticky top-0 bg-slate-800/70 backdrop-blur-lg z-10">
        <h3 id="filter-pane-title" className="text-xl font-semibold text-slate-100">
          Filters
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
          aria-label="Close filter pane"
        >
          <XMarkIcon />
        </button>
      </div>

      {/* Filter Cards Area */}
      {filterableColumns.length > 0 ? (
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {filterableColumns.map(filter => (
            <FilterCard
              key={filter.column}
              filterConfig={filter}
              activeFilterValue={activeFilters[filter.column]}
              onFilterChange={onFilterChange}
              onClearFilter={() => onClearIndividualFilter(filter.column)}
              disabled={disabled}
            />
          ))}
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center p-4">
            <p className="text-slate-400 text-center">No filterable columns identified in the current dataset.</p>
        </div>
      )}
      

      {/* Footer with Clear All Button */}
      {filterableColumns.length > 0 && (
          <div className="p-4 border-t border-slate-600/80 sticky bottom-0 bg-slate-800/70 backdrop-blur-lg z-10">
            <button
              onClick={onClearFilters}
              disabled={disabled || Object.keys(activeFilters).length === 0}
              className="w-full px-4 py-2 text-sm font-medium text-primary-300 hover:text-primary-200 border border-primary-500 hover:bg-primary-500/20 rounded-md disabled:text-slate-500 disabled:border-slate-600 disabled:cursor-not-allowed disabled:bg-transparent transition-colors"
            >
              Clear All Filters
            </button>
          </div>
      )}
    </div>
  );
};

export default FilterControls;