import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DisasterList } from './components/DisasterList';
import { MapVisualizer } from './components/MapVisualizer';
import { AnalysisPanel } from './components/AnalysisPanel';
import { Disaster, AnalysisReport, ProcessingStatus, GatheredData } from './types';
import { TURKEY_EARTHQUAKE_DEMO, AFTERSHOCK_DEMO } from './constants';
import { fetchSignificantEarthquakes, fetchDisasterNews, fetchInfrastructure } from './services/api';
import { analyzeDisasterData, generateBriefingVideo } from './services/gemini';

const App: React.FC = () => {
  const [disasters, setDisasters] = useState<Disaster[]>([TURKEY_EARTHQUAKE_DEMO, AFTERSHOCK_DEMO]);
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<ProcessingStatus>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalysisReport | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  // Poll for new disasters
  useEffect(() => {
    const loadDisasters = async () => {
      const realDisasters = await fetchSignificantEarthquakes();
      // Merge real with demo, keeping demo at top for presentation
      const existingIds = new Set(realDisasters.map(d => d.id));
      const demoFiltered = [TURKEY_EARTHQUAKE_DEMO, AFTERSHOCK_DEMO].filter(d => !existingIds.has(d.id));
      
      setDisasters([...demoFiltered, ...realDisasters]);
    };

    loadDisasters();
    const interval = setInterval(loadDisasters, 60000); // 1 min poll
    return () => clearInterval(interval);
  }, []);

  // Handle Disaster Selection
  const handleSelectDisaster = async (disaster: Disaster) => {
    if (selectedDisaster?.id === disaster.id) return;
    
    setSelectedDisaster(disaster);
    setAnalysisStatus('gathering');
    setAnalysisResult(null);

    // 1. Gather Data
    const [news, infra] = await Promise.all([
      fetchDisasterNews(disaster),
      fetchInfrastructure(disaster.lat, disaster.lng)
    ]);

    const gatheredData: GatheredData = {
      satellite: { before: 'url-placeholder', after: 'url-placeholder' }, // Simplified
      news,
      infrastructure: infra
    };

    // 2. Analyze
    setAnalysisStatus('analyzing');
    // Force demo mode for the Turkey event to match the hardcoded demo data quality
    const isDemoEvent = disaster.id === TURKEY_EARTHQUAKE_DEMO.id || disaster.id === AFTERSHOCK_DEMO.id;
    const report = await analyzeDisasterData(disaster, gatheredData, isDemoEvent);
    
    setAnalysisResult(report);
    setAnalysisStatus('complete');
  };

  const handleGenerateBriefing = async () => {
    if (!analysisResult) return;
    setIsVideoLoading(true);
    
    const videoUrl = await generateBriefingVideo(analysisResult);
    
    setIsVideoLoading(false);
    
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    } else {
      alert("Simulating Veo 3.1 Video Generation...\n\n(A video link would open here in a real deployment with a paid key. For this hackathon demo, imagine a professional AI-narrated briefing playing!)");
    }
  };

  const handleExport = () => {
    alert("Exporting PDF Report and GeoJSON layers to incident command...");
  };

  const handlePlanRoutes = () => {
    alert("Optimizing supply routes avoiding 'D400 Highway' and 'Nurdağı Viaduct' due to confirmed collapse.");
  };

  return (
    <div className="flex flex-col h-screen font-sans">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <DisasterList 
          disasters={disasters}
          selectedId={selectedDisaster?.id || null}
          onSelect={handleSelectDisaster}
        />
        
        <MapVisualizer 
          disaster={selectedDisaster}
          analysis={analysisResult}
        />
        
        <AnalysisPanel 
          status={analysisStatus}
          analysis={analysisResult}
          onGenerateBriefing={handleGenerateBriefing}
          onExport={handleExport}
          onPlanRoutes={handlePlanRoutes}
        />
      </div>

      {isVideoLoading && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center">
            <div className="text-white text-xl mb-4">Generating Veo 3.1 Briefing...</div>
            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 animate-pulse w-full"></div>
            </div>
            <div className="text-gray-400 text-sm mt-4">Rendering neural frames & synthesizing audio</div>
        </div>
      )}
    </div>
  );
};

export default App;
