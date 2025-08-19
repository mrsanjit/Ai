import React, { useState, ChangeEvent } from 'react';

const MicrophoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white">
      <path d="M7 4a3 3 0 0 1 6 0v6a3 3 0 1 1-6 0V4Z" />
      <path d="M5.5 4.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-6Z" clipRule="evenodd" />
      <path d="M1.188 10.13a.75.75 0 0 1 1.06-1.06l1.357 1.356A4.503 4.503 0 0 0 8.5 11.5v.001A4.503 4.503 0 0 0 13.5 10c0-1.633-.898-3.067-2.205-3.812a.75.75 0 0 1 .51-1.404A5.999 5.999 0 0 1 15 10a6 6 0 0 1-6 6c-2.064 0-3.895-.98-5.023-2.522L2.25 14.75a.75.75 0 0 1-1.06-1.06l1.002-1.002-1.004-1.003Z" />
    </svg>
  );

interface RefineInputProps {
  onRefine: (prompt: string) => void;
  disabled: boolean;
  onToggleListening: () => void;
  isListening: boolean;
  voiceError: string | null;
}

const RefineInput: React.FC<RefineInputProps> = ({ onRefine, disabled, onToggleListening, isListening, voiceError }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !disabled) {
      onRefine(prompt.trim());
      setPrompt(''); // Clear input after submission
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 bg-slate-800/50 backdrop-blur-sm shadow-xl rounded-xl border border-slate-600/50">
      <label htmlFor="refine-prompt" className="block text-sm font-medium text-slate-300 mb-2">
        Refine this dashboard with a follow-up command:
      </label>
      <div className="flex items-center gap-3">
        <textarea
          id="refine-prompt"
          value={prompt}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
          placeholder={isListening ? 'Listening...' : `e.g., 'Change the pie chart to a bar chart', 'Only show data for North America', 'Add a KPI for average revenue'`}
          rows={2}
          className="flex-grow p-3 border border-slate-500 rounded-md shadow-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-sm bg-slate-700 text-slate-200 placeholder-slate-400 disabled:opacity-50"
          disabled={disabled}
        />
        <button
            type="button"
            onClick={onToggleListening}
            disabled={disabled}
            className={`p-2.5 rounded-md shadow-lg transition-all duration-200 self-stretch focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-accent-400 disabled:opacity-50 disabled:cursor-not-allowed ${isListening ? 'bg-red-600 animate-pulse' : 'bg-primary-600 hover:bg-primary-500'}`}
            title={isListening ? "Stop Listening" : "Start Voice Command"}
            >
            <MicrophoneIcon />
        </button>
        <button
          type="submit"
          disabled={disabled || !prompt.trim()}
          className="bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold py-2.5 px-4 rounded-md shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-accent-400 transition-all duration-200 self-stretch"
          title="Refine Dashboard"
        >
          Refine
        </button>
      </div>
       {voiceError && <p className="text-xs text-red-400 mt-2">{voiceError}</p>}
    </form>
  );
};

export default RefineInput;