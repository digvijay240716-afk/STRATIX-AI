import React, { useState } from 'react';
import { generateStrategicPlan } from '../services/geminiService';

export const StrategyView: React.FC = () => {
  const [context, setContext] = useState('');
  const [strategy, setStrategy] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleGenerate = async () => {
    if (!context.trim()) return;
    setIsThinking(true);
    setStrategy('');
    const result = await generateStrategicPlan(context);
    setStrategy(result);
    setIsThinking(false);
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-hidden">
       <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Strategy Planner</h2>
          <p className="text-slate-400">Deep reasoning engine for complex business execution plans.</p>
        </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <div className="flex flex-col space-y-4">
          <textarea
            className="flex-1 w-full bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm placeholder-slate-500"
            placeholder="Describe your business context, current challenges, and goals here... (e.g., 'We are a Series B SaaS company facing high churn in the mid-market segment. We need a retention strategy.')"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={isThinking || !context}
            className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all ${
                isThinking 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25'
            }`}
          >
            {isThinking ? (
                <div className="flex items-center justify-center space-x-2">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    <span className="ml-2">THINKING (DEEP REASONING)</span>
                </div>
            ) : 'GENERATE STRATEGIC BLUEPRINT'}
          </button>
        </div>

        <div className="glass-panel rounded-xl border border-slate-700 p-8 overflow-y-auto relative">
            {!strategy && !isThinking && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                    <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <p>Ready to formulate strategy</p>
                    </div>
                </div>
            )}
            {isThinking && (
                 <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                    <div className="h-32 bg-slate-700/50 rounded w-full mt-8"></div>
                 </div>
            )}
            {strategy && (
                <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed">
                        {strategy}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
