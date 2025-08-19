import React, { useState, ChangeEvent } from 'react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  disabled: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, disabled }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !disabled) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-slate-700/30 shadow-xl rounded-xl border border-slate-600/50">
      <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">
        Ask a question, provide SQL, or Python (for data logic):
      </label>
      <textarea
        id="prompt"
        value={prompt}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
        placeholder={`e.g., 'Total sales by region', 
'SELECT category, SUM(revenue) FROM ? GROUP BY category', 
'df[df.status == "Delivered"].count()' (Python logic will be translated to SQL)`}
        rows={4} 
        className="w-full p-3 border border-slate-500 rounded-md shadow-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-sm bg-slate-700 text-slate-200 placeholder-slate-400"
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || !prompt.trim()}
        className="mt-4 w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold py-2.5 px-4 rounded-md shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-accent-400 transition-all duration-200"
      >
        Generate Dashboard
      </button>
    </form>
  );
};

export default PromptInput;