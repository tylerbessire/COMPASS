import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="text-2xl">⚡</div>
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Crisis<span className="text-red-500">Coordinator</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2a1a] rounded-full border border-green-900/30">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-fast"></div>
          <span className="text-xs font-medium text-green-400">Monitoring Active</span>
        </div>
        
        <div className="w-px h-6 bg-gray-700"></div>

        <div className="flex items-center gap-3">
           <div className="text-right">
              <div className="text-xs text-gray-400">System Time</div>
              <div className="text-xs font-mono text-gray-200">UTC {new Date().toISOString().slice(11, 16)}</div>
           </div>
        </div>
      </div>
    </header>
  );
};
