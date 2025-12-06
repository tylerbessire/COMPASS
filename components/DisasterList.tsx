import React from 'react';
import { Disaster } from '../types';

interface DisasterListProps {
  disasters: Disaster[];
  selectedId: string | null;
  onSelect: (disaster: Disaster) => void;
}

export const DisasterList: React.FC<DisasterListProps> = ({ disasters, selectedId, onSelect }) => {
  return (
    <aside className="w-80 bg-[#111] border-r border-gray-800 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">Active Disasters</h3>
        
        {disasters.length === 0 && (
          <div className="text-gray-600 text-sm italic">Scanning global feeds...</div>
        )}

        <div className="space-y-2">
          {disasters.map((disaster) => (
            <div
              key={disaster.id}
              onClick={() => onSelect(disaster)}
              className={`
                p-4 rounded-lg cursor-pointer border transition-all duration-200
                ${selectedId === disaster.id 
                  ? 'bg-red-900/20 border-red-500/50' 
                  : 'bg-[#1a1a2e] border-transparent hover:border-red-500/30 hover:bg-[#1f1f35]'}
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`
                  px-2 py-1 rounded text-xs font-bold text-white
                  ${(disaster.magnitude >= 7) ? 'bg-red-600' : 'bg-orange-500'}
                `}>
                  M {disaster.magnitude.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">
                  {disaster.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-200 mb-1 leading-snug">
                {disaster.place}
              </div>
              {disaster.tsunami && (
                <div className="text-xs text-blue-400 flex items-center gap-1 mt-2">
                  <span>🌊</span> Tsunami Warning
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-b border-gray-800">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-3">Data Streams</h3>
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            USGS Earthquake Feed
          </div>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500"></span>
             GDELT News Network
          </div>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500"></span>
             Sentinel Hub (Sat)
          </div>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500"></span>
             OpenStreetMap Infra
          </div>
        </div>
      </div>
      
      <div className="mt-auto p-4 border-t border-gray-800">
         <div className="text-xs text-gray-600 text-center">
            System Online • v2.5.0-beta
         </div>
      </div>
    </aside>
  );
};
