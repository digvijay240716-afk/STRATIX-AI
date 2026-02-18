import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Metric } from '../types';

const data = [
  { name: 'Jan', revenue: 4000, efficiency: 2400 },
  { name: 'Feb', revenue: 3000, efficiency: 1398 },
  { name: 'Mar', revenue: 2000, efficiency: 9800 },
  { name: 'Apr', revenue: 2780, efficiency: 3908 },
  { name: 'May', revenue: 1890, efficiency: 4800 },
  { name: 'Jun', revenue: 2390, efficiency: 3800 },
  { name: 'Jul', revenue: 3490, efficiency: 4300 },
];

const metrics: Metric[] = [
  { label: 'Total Revenue', value: '$2.4M', change: 12.5, trend: 'up' },
  { label: 'Efficiency Index', value: '94.2', change: 4.1, trend: 'up' },
  { label: 'Risk Score', value: 'Low', change: -2.3, trend: 'down' },
  { label: 'Active Agents', value: '8', change: 0, trend: 'neutral' },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Executive Overview</h2>
          <p className="text-slate-400">Real-time enterprise performance metrics.</p>
        </div>
        <div className="flex space-x-2">
            <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-mono">LIVE CONNECTED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-2xl">
            <div className="text-slate-400 text-sm font-medium mb-2">{metric.label}</div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-white font-mono">{metric.value}</div>
              <div className={`flex items-center text-sm font-medium ${
                metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-slate-400'
              }`}>
                {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'} {Math.abs(metric.change)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-6">Revenue Trajectory</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748B" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-6">Operational Efficiency</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{fill: '#334155', opacity: 0.2}}
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar dataKey="efficiency" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
