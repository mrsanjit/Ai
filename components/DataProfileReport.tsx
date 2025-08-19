import React, { useState } from 'react';
import { DataProfile, ColumnProfile } from '../types';

// Icons for different data types or notes
const TypeNumericalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-sky-400"><path d="M5.5 3.5A1.5 1.5 0 0 0 4 5v2.879a1.5 1.5 0 0 0 .44 1.06l1.88 1.88A1.5 1.5 0 1 0 8.202 9.28L6.322 7.4a.5.5 0 0 1-.141-.353V5a.5.5 0 0 1 .5-.5h2.879a.5.5 0 0 1 .353.141l1.88 1.88a1.5 1.5 0 1 0 1.536-2.617L9.47 1.94A1.5 1.5 0 0 0 7.378 1H5.5a2 2 0 0 0-2 2v6.879A2 2 0 0 0 5.378 12H12.5A1.5 1.5 0 0 0 14 10.5v-5A1.5 1.5 0 0 0 12.5 4H10V3.5a.5.5 0 0 1-.5-.5H7.621A1.5 1.5 0 0 0 5.5 3.5Z" /></svg>;
const TypeCategoricalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-violet-400"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9ZM3.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-9Z" clipRule="evenodd" /><path d="M4 5.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2Zm4 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2Zm-2 4a.5.5 0 0 1 .5-.5H10a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H6.5a.5.5 0 0 1-.5-.5v-2Z" /></svg>;
const TypeDateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-emerald-400"><path fillRule="evenodd" d="M4 1.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75V3h3V1.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75V3A1.75 1.75 0 0 1 14 4.75v1.586A2.254 2.254 0 0 0 12.25 6H3.75A2.254 2.254 0 0 0 2 6.336V4.75A1.75 1.75 0 0 1 3.75 3V1.75H2.75a.75.75 0 0 1-.75-.75V3.5h.75A.75.75 0 0 1 3.5 4V1H2A.75.75 0 0 1 2 1h1.5A.75.75 0 0 1 4 1.75ZM12.25 7.5a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5ZM9.75 7.5a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75V7.5h.008A.75.75 0 0 1 9.75 7.5ZM7.5 7.5a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5ZM5 8.25a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H5.75a.75.75 0 0 1-.75-.75V8.25ZM12.25 10.5a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5ZM9.75 10.5a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75V10.5h.008A.75.75 0 0 1 9.75 10.5ZM7.5 10.5a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5ZM2 7.836v5.414A1.75 1.75 0 0 0 3.75 15h8.5A1.75 1.75 0 0 0 14 13.25V7.836A2.254 2.254 0 0 0 12.25 7.5H3.75A2.254 2.254 0 0 0 2 7.836Z" clipRule="evenodd" /></svg>;
const TypeTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-orange-400"><path d="M3 4.75A.75.75 0 0 1 3.75 4h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 3 4.75ZM3 8a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 3 8Zm0 3.25a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75Z" /></svg>;
const TypeBooleanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-teal-400"><path fillRule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm10.25-1.06a.75.75 0 0 0-1.06-1.06L7 9.065 5.81 7.875a.75.75 0 1 0-1.06 1.06L6.47 10.653a.75.75 0 0 0 1.06 0l3.72-3.72Z" clipRule="evenodd" /></svg>;
const TypeMixedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-red-400"><path fillRule="evenodd" d="M8.583.844a.754.754 0 0 0-1.166 0C6.678.369 5.03.047 3.25 0 1.472-.046 0 .973 0 2.755 0 7.324 7.03 15.068 7.53 15.429a.754.754 0 0 0 .94 0c.5-.36 7.53-8.104 7.53-12.674 0-1.782-1.472-2.8-3.25-2.755-1.78-.047-3.428.37-4.167.844ZM7.75 9.017V4.5a.75.75 0 0 1 1.5 0V9.01l1.96-2.015a.75.75 0 1 1 1.07 1.05l-2.495 2.562a.75.75 0 0 1-1.07 0L6.22 8.045a.75.75 0 1 1 1.07-1.05L9.25 9.017h-1.5Z" clipRule="evenodd" /></svg>;
const TypeUnknownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-slate-500"><path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm0-5.25a.75.75 0 0 0 .75-.75V6.32a.75.75 0 0 0-.433-.693A.755.755 0 0 0 8 5.54c-2.31 0-2.882 1.68-2.926 2.037a.75.75 0 1 0 1.493.153A1.513 1.513 0 0 1 8 6.533V8.5a.75.75 0 0 0 .75.75Zm.75 2.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" clipRule="evenodd" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-sky-400 inline mr-1 align-text-bottom"><path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-7.5 3.25a.75.75 0 0 0 .75.75h.01a.75.75 0 0 0 .75-.75V8.53a.75.75 0 0 0-.75-.75h-.01a.75.75 0 0 0-.75.75v2.97ZM8 5.75A.75.75 0 0 1 7.25 5h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75h-.01a.75.75 0 0 1-.75-.75v-.01Z" clipRule="evenodd" /></svg>;
const WarningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-amber-400 inline mr-1 align-text-bottom"><path fillRule="evenodd" d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566ZM8 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" /></svg>;
const WandIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M9.834 3.033a.75.75 0 0 1 1.059.212l1.25 2.165a.75.75 0 0 1-.64 1.13H10.5v.75a.75.75 0 0 0 1.5 0V6.75h.193a.75.75 0 0 1 .64 1.13l-1.25 2.165a.75.75 0 0 1-1.06.212L9 9.22v1.51a.75.75 0 0 1-1.5 0V9.22l-1.533 1.03a.75.75 0 0 1-1.06-.212l-1.25-2.165a.75.75 0 0 1 .64-1.13H4.5v-.75a.75.75 0 0 0-1.5 0v.75H2.807a.75.75 0 0 1-.64-1.13l1.25-2.165a.75.75 0 0 1 1.06-.212L6 4.78V3.27a.75.75 0 0 1 1.5 0v1.51l1.834-1.24Z" /><path d="M12.75 11.5a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Z" /><path d="M11.5 14.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75Z" /><path d="M9.5 13.25a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Z" /></svg>;

const TypeIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type.toLowerCase()) {
    case 'numerical': return <TypeNumericalIcon />;
    case 'categorical': return <TypeCategoricalIcon />;
    case 'date': return <TypeDateIcon />;
    case 'text': return <TypeTextIcon />;
    case 'boolean': return <TypeBooleanIcon />;
    case 'mixed': return <TypeMixedIcon />;
    default: return <TypeUnknownIcon />;
  }
};

interface DataProfileReportProps {
  profile: DataProfile | null;
  onCleanAction: (columnName: string, action: 'remove_missing' | 'fill_mean') => void;
}

const DataProfileReport: React.FC<DataProfileReportProps> = ({ profile, onCleanAction }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  if (!profile) {
    return (
      <div className="p-4 my-4 text-sm text-center text-slate-400 bg-slate-700/30 rounded-lg border border-slate-600/50">
        No data profile available.
      </div>
    );
  }

  const { overallSummary, columns } = profile;

  const handleDropdownToggle = (columnName: string) => {
    setOpenDropdown(prev => (prev === columnName ? null : columnName));
  };
  
  const handleActionClick = (columnName: string, action: 'remove_missing' | 'fill_mean') => {
    onCleanAction(columnName, action);
    setOpenDropdown(null);
  }

  return (
    <div className="my-4 p-4 bg-slate-700/30 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
      <h3 className="text-md font-semibold text-slate-100 mb-2">AI Data Profile & Quality Check</h3>
      {overallSummary && (
        <div className="mb-4 p-3 bg-primary-700/30 text-primary-200 text-sm rounded-md border border-primary-600/50 italic">
          <InfoIcon /> <span className="font-medium">AI Summary:</span> {overallSummary}
        </div>
      )}

      <div className="overflow-x-auto max-h-80 custom-scrollbar-dark-thin">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-600/50 backdrop-blur-sm sticky top-0 z-10">
            <tr>
              <th className="p-2 text-left font-medium text-slate-300">Column Name</th>
              <th className="p-2 text-left font-medium text-slate-300">Inferred Type</th>
              <th className="p-2 text-left font-medium text-slate-300">Missing %</th>
              <th className="p-2 text-left font-medium text-slate-300">Unique Values</th>
              <th className="p-2 text-left font-medium text-slate-300">Value Range / Samples</th>
              <th className="p-2 text-left font-medium text-slate-300">Notes</th>
              <th className="p-2 text-left font-medium text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-600">
            {columns.map((col, index) => (
              <tr key={index} className="hover:bg-slate-600/40 transition-colors duration-150">
                <td className="p-2 whitespace-nowrap font-medium text-slate-200">{col.columnName}</td>
                <td className="p-2 whitespace-nowrap text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <TypeIcon type={col.inferredType} />
                    {col.inferredType}
                  </div>
                </td>
                <td className={`p-2 whitespace-nowrap text-slate-300 ${col.missingPercentage > 20 ? 'text-red-400 font-medium' : ''}`}>
                  {col.missingPercentage.toFixed(1)}%
                </td>
                <td className="p-2 whitespace-nowrap text-slate-300">{col.uniqueValues ?? 'N/A'}</td>
                <td className="p-2 whitespace-nowrap text-slate-400 text-ellipsis overflow-hidden max-w-xs" title={Array.isArray(col.valueRange) ? col.valueRange.join(' - ') : String(col.valueRange ?? 'N/A')}>
                  {Array.isArray(col.valueRange) ? col.valueRange.map(v => typeof v === 'number' ? v.toLocaleString() : v).join(' - ') : (col.valueRange ?? 'N/A')}
                </td>
                <td className="p-2 text-slate-300 max-w-sm">
                  {col.notes && (col.notes.toLowerCase().includes("error") || col.notes.toLowerCase().includes("warning") || col.notes.toLowerCase().includes("mixed") || col.notes.toLowerCase().includes("outlier")) ? (
                    <span className="flex items-center gap-1 text-amber-400"><WarningIcon /> {col.notes}</span>
                  ) : col.notes ? (
                     <span className="flex items-center gap-1 text-sky-300"><InfoIcon /> {col.notes}</span>
                  ) : (
                    <span className="text-slate-500 italic">None</span>
                  )}
                </td>
                <td className="p-2 whitespace-nowrap">
                    {col.missingPercentage > 0 && (
                        <div className="relative inline-block text-left">
                            <button
                                onClick={() => handleDropdownToggle(col.columnName)}
                                onBlur={() => setTimeout(() => setOpenDropdown(null), 200)}
                                className="flex items-center px-2 py-1 text-xs bg-accent-600/50 text-accent-200 hover:bg-accent-500/60 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
                            >
                                <WandIcon />
                                <span className="ml-1">Fix</span>
                            </button>
                            {openDropdown === col.columnName && (
                                <div className="absolute right-0 mt-2 w-56 origin-top-right bg-slate-700 border border-slate-600 rounded-md shadow-lg z-20 py-1">
                                    <button
                                        onClick={() => handleActionClick(col.columnName, 'remove_missing')}
                                        className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-primary-600"
                                        title={`Removes all rows where '${col.columnName}' is empty.`}
                                    >
                                        Remove Rows with Missing Values
                                    </button>
                                    {col.inferredType === 'Numerical' && (
                                         <button
                                            onClick={() => handleActionClick(col.columnName, 'fill_mean')}
                                            className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-primary-600"
                                            title={`Fills empty cells in '${col.columnName}' with the column's average.`}
                                        >
                                            Fill Missing with Mean
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <style>
        {`
        .custom-scrollbar-dark-thin::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar-dark-thin::-webkit-scrollbar-track {
          background: #1e293b; /* slate-800 */
          border-radius: 10px;
        }
        .custom-scrollbar-dark-thin::-webkit-scrollbar-thumb {
          background: #475569; /* slate-600 */
          border-radius: 10px;
        }
        .custom-scrollbar-dark-thin::-webkit-scrollbar-thumb:hover {
          background: #64748b; /* slate-500 */
        }
      `}
      </style>
    </div>
  );
};

export default DataProfileReport;