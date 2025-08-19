import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LightBulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 text-amber-300">
        <path d="M10 2a.75.75 0 0 1 .75.75v1.256a.75.75 0 0 1-.504.706C9.177 5.111 8.5 6.16 8.5 7.25V9.5a.75.75 0 0 0 1.5 0V8a1 1 0 0 1 1-1h.25a.75.75 0 0 0 .75-.75V2.75A.75.75 0 0 1 10 2Z" />
        <path d="M4.75 9.5A5.25 5.25 0 0 0 10 14.75a5.25 5.25 0 0 0 5.25-5.25V8.5A5.25 5.25 0 0 0 10 3.25a5.25 5.25 0 0 0-5.25 5.25V9.5ZM10 18a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-1.5 0v1.5A.75.75 0 0 0 10 18Z" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity">
        <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
);


interface AutomatedInsightsProps {
  insights: string[] | null;
  isLoading: boolean;
  onPromptClick: (prompt: string) => void;
}

const AutomatedInsights: React.FC<AutomatedInsightsProps> = ({ insights, isLoading, onPromptClick }) => {
  if (isLoading) {
    return (
        <div className="p-4 my-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <LoadingSpinner message="AI is discovering key insights..." />
        </div>
    );
  }

  if (!insights || insights.length === 0) {
    return null; // Don't render anything if there are no insights and not loading
  }

  return (
    <div className="my-4 p-4 bg-slate-700/30 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
      <h3 className="text-md font-semibold text-slate-100 mb-3 flex items-center">
        <LightBulbIcon />
        AI Suggested Insights
      </h3>
      <div className="space-y-2">
        {insights.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptClick(prompt)}
            className="group w-full text-left p-3 bg-slate-600/40 hover:bg-primary-600/50 border border-slate-600 hover:border-primary-500 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-200 group-hover:text-white">
                {prompt}
              </p>
              <ChevronRightIcon />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AutomatedInsights;