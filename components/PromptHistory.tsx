import React from 'react';

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 text-primary-300">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity">
        <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
);


interface PromptHistoryProps {
  history: string[] | null;
  onPromptClick: (prompt: string) => void;
}

const PromptHistory: React.FC<PromptHistoryProps> = ({ history, onPromptClick }) => {
  if (!history || history.length === 0) {
    return null; 
  }

  return (
    <div className="my-4 p-4 bg-slate-700/30 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
      <h3 className="text-md font-semibold text-slate-100 mb-3 flex items-center">
        <HistoryIcon />
        Analysis History
      </h3>
      <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar-dark-thin pr-1">
        {history.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptClick(prompt)}
            className="group w-full text-left p-3 bg-slate-600/40 hover:bg-primary-600/50 border border-slate-600 hover:border-primary-500 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-200 group-hover:text-white truncate" title={prompt}>
                {prompt}
              </p>
              <ChevronRightIcon />
            </div>
          </button>
        ))}
      </div>
      <style>{`
        .custom-scrollbar-dark-thin::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar-dark-thin::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar-dark-thin::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default PromptHistory;