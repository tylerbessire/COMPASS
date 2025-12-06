import React from 'react';
import { AnalysisReport, ProcessingStatus } from '../types';

interface AnalysisPanelProps {
  status: ProcessingStatus;
  analysis: AnalysisReport | null;
  onGenerateBriefing: () => void;
  onExport: () => void;
  onPlanRoutes: () => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ 
  status, 
  analysis, 
  onGenerateBriefing,
  onExport,
  onPlanRoutes
}) => {
  if (status === 'gathering' || status === 'analyzing') {
    return (
      <aside className="w-[340px] bg-[#111] border-l border-gray-800 flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-2 border-gray-800 border-t-red-500 rounded-full animate-spin mb-4"></div>
        <div className="text-sm font-medium text-gray-300">
          {status === 'gathering' ? 'Gathering Multimodal Data...' : 'Gemini 3 Analysis in Progress...'}
        </div>
        <div className="text-xs text-gray-600 mt-2 text-center">
          Connecting to Sentinel Hub & GDELT Streams
        </div>
      </aside>
    );
  }

  if (!analysis) {
    return (
      <aside className="w-[340px] bg-[#111] border-l border-gray-800 flex items-center justify-center p-8 text-gray-600 text-sm">
        Select a disaster to begin analysis
      </aside>
    );
  }

  return (
    <aside className="w-[340px] bg-[#111] border-l border-gray-800 flex flex-col h-full overflow-y-auto">
      {/* Casualty Section */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <span>📊</span> Casualty Estimates
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#1a1a2e] p-3 rounded border border-red-900/30 text-center">
            <div className="text-2xl font-bold text-red-500">
              {analysis.casualtyEstimate.deaths.low.toLocaleString()}+
            </div>
            <div className="text-[10px] uppercase text-gray-500 tracking-wider">Est. Deaths</div>
          </div>
          <div className="bg-[#1a1a2e] p-3 rounded border border-orange-900/30 text-center">
            <div className="text-2xl font-bold text-orange-500">
              {analysis.casualtyEstimate.injuries.low.toLocaleString()}+
            </div>
            <div className="text-[10px] uppercase text-gray-500 tracking-wider">Injured</div>
          </div>
          <div className="bg-[#1a1a2e] p-3 rounded border border-gray-800 text-center">
            <div className="text-xl font-bold text-white">
              {analysis.casualtyEstimate.trapped.confirmed.toLocaleString()}
            </div>
            <div className="text-[10px] uppercase text-gray-500 tracking-wider">Confirmed Trapped</div>
          </div>
          <div className="bg-[#1a1a2e] p-3 rounded border border-gray-800 text-center">
            <div className="text-xl font-bold text-gray-400">High</div>
            <div className="text-[10px] uppercase text-gray-500 tracking-wider">Confidence</div>
          </div>
        </div>
      </div>

      {/* Priorities Section */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
          <span>🎯</span> Rescue Priorities
        </h3>
        <ul className="space-y-2">
          {analysis.rescuePriorities.slice(0, 4).map((item, idx) => (
            <li key={idx} className="bg-[#1a1a2e] p-3 rounded border border-gray-800 flex gap-3">
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                ${item.priority === 'critical' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}
              `}>
                {idx + 1}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-200">{item.location}</div>
                <div className="text-xs text-gray-500 mt-1 leading-tight">{item.reason}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Infrastructure Section */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
          <span>🚧</span> Route Status
        </h3>
        <div className="space-y-2">
          {analysis.blockedRoutes.map((route, idx) => (
             <div key={idx} className="text-xs text-orange-400 flex gap-2">
                <span>⚠️</span>
                <span>{route.name} - {route.type.toUpperCase()} BLOCKED ({Math.round(route.confidence * 100)}% conf)</span>
             </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 mt-auto space-y-3">
        <button 
          onClick={onGenerateBriefing}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-sm transition-colors flex items-center justify-center gap-2"
        >
          <span>🎬</span> Generate Veo Briefing
        </button>
        <div className="flex gap-2">
            <button 
              onClick={onPlanRoutes}
              className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded text-sm transition-colors"
            >
              🗺️ Plan Routes
            </button>
            <button 
              onClick={onExport}
              className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded text-sm transition-colors"
            >
              📤 Export
            </button>
        </div>
      </div>
    </aside>
  );
};
