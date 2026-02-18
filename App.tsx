import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { SimulationLab } from './components/SimulationLab';
import { UploadZone } from './components/UploadZone';
import { StrategyView } from './components/StrategyView';
import { InsightEngine } from './components/InsightEngine';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { AppView } from './types';

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard />;
      case AppView.SIMULATION:
        return <SimulationLab />;
      case AppView.UPLOAD:
        return <UploadZone />;
      case AppView.STRATEGY:
        return <StrategyView />;
      case AppView.INSIGHTS:
        return <InsightEngine />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0F172A] text-slate-200 font-sans overflow-hidden">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur z-10">
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <span>Enterprise</span>
                <span>/</span>
                <span className="text-white font-medium">{currentView.charAt(0) + currentView.slice(1).toLowerCase()}</span>
            </div>

            <div className="flex items-center space-x-4">
                <button 
                    onClick={() => setIsLiveModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 rounded-full text-white text-sm font-bold shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all animate-pulse"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span>LIVE CONNECT</span>
                </button>
            </div>
        </header>

        {/* View Container */}
        <div className="flex-1 overflow-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5 relative">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                 <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[100px]"></div>
                 <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[100px]"></div>
            </div>
            
            <div className="relative z-10 h-full">
                {renderView()}
            </div>
        </div>
      </main>

      <LiveVoiceModal isOpen={isLiveModalOpen} onClose={() => setIsLiveModalOpen(false)} />
    </div>
  );
}

export default App;
