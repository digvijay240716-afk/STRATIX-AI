import React, { useState } from 'react';
import { performMarketResearch } from '../services/geminiService';
import { GroundingMetadata } from '../services/geminiService';

export const InsightEngine: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ text: string; sources: GroundingMetadata[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setResults(null);
    const data = await performMarketResearch(query);
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="p-8 h-full flex flex-col max-w-5xl mx-auto w-full">
        <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Market Insight Engine</h2>
            <p className="text-slate-400">Real-time web reconnaissance powered by Google Search Grounding.</p>
        </div>

        <form onSubmit={handleSearch} className="mb-8 relative">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about market trends, competitor data, or recent news..."
                className="w-full bg-slate-800/80 border border-slate-600 rounded-full py-4 px-8 pr-16 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg transition-all"
            />
            <button 
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full w-12 flex items-center justify-center transition-colors disabled:opacity-50"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                )}
            </button>
        </form>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            {results ? (
                <div className="space-y-6 animate-fade-in pb-10">
                    <div className="glass-panel p-8 rounded-2xl border border-slate-700">
                        <div className="prose prose-invert max-w-none">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                                <span className="mr-2">🔍</span> Research Summary
                            </h3>
                            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {results.text}
                            </div>
                        </div>
                    </div>

                    {results.sources.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Sources</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {results.sources.map((source, idx) => (
                                    <a 
                                        key={idx} 
                                        href={source.web?.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all group"
                                    >
                                        <div className="text-sm font-medium text-blue-400 group-hover:text-blue-300 truncate mb-1">
                                            {source.web?.title}
                                        </div>
                                        <div className="text-xs text-slate-500 truncate">
                                            {source.web?.uri}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : !loading && (
                 <div className="flex flex-col items-center justify-center h-full opacity-30 mt-12">
                     <svg className="w-24 h-24 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     <p className="text-slate-400 text-lg">Waiting for research target...</p>
                 </div>
            )}
        </div>
    </div>
  );
};
