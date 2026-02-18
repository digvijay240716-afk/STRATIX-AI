import React, { useState } from 'react';
import { generateQuickSummary } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const SimulationLab: React.FC = () => {
  const [adSpend, setAdSpend] = useState(50);
  const [pricing, setPricing] = useState(100);
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Simple deterministic simulation for demo
  const generateData = () => {
    const data = [];
    let base = 1000;
    for (let i = 0; i < 12; i++) {
      const growth = (adSpend * 0.5) - ((pricing - 100) * 2);
      base = base * (1 + growth / 1000);
      data.push({
        month: `M${i + 1}`,
        value: Math.round(base)
      });
    }
    return data;
  };

  const chartData = generateData();

  const runAnalysis = async () => {
    setIsLoading(true);
    const finalVal = chartData[chartData.length - 1].value;
    const summary = await generateQuickSummary(
      `Simulation Parameters: Ad Spend index ${adSpend} (avg 50), Pricing index ${pricing} (avg 100). Resulting projected Annual Recurring Revenue: ${finalVal}. Growth curve is ${finalVal > 1000 ? 'positive' : 'negative'}.`
    );
    setAnalysis(summary);
    setIsLoading(false);
  };

  return (
    <div className="p-8 h-full flex flex-col space-y-6">
       <div>
          <h2 className="text-3xl font-bold text-white mb-2">Simulation Lab</h2>
          <p className="text-slate-400">Project outcomes based on variable market levers.</p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        {/* Controls */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700 h-fit space-y-8">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">Marketing Aggression</label>
              <span className="text-sm font-mono text-blue-400">{adSpend}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={adSpend}
              onChange={(e) => setAdSpend(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">Pricing Index</label>
              <span className="text-sm font-mono text-purple-400">{pricing}</span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              value={pricing}
              onChange={(e) => setPricing(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          <button
            onClick={runAnalysis}
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all flex justify-center items-center"
          >
            {isLoading ? (
               <span className="animate-pulse">Analysing...</span>
            ) : (
                <>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Analyze Impact
                </>
            )}
          </button>
          
          {analysis && (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-600 animate-fade-in">
                <div className="text-xs text-blue-400 font-bold mb-1 uppercase tracking-wider">AI Analysis</div>
                <p className="text-sm text-slate-200 leading-relaxed">{analysis}</p>
            </div>
          )}
        </div>

        {/* Visualization */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-700 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Revenue Projection</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748B" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10B981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSim)"
                    animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};