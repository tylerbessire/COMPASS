import React, { useEffect, useRef } from 'react';
import { AnalysisReport, Disaster } from '../types';

// Add type definition for window.google
declare global {
  interface Window {
    google: any;
  }
}

interface MapVisualizerProps {
  disaster: Disaster | null;
  analysis: AnalysisReport | null;
}

export const MapVisualizer: React.FC<MapVisualizerProps> = ({ disaster, analysis }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // Use any instead of google.maps types to avoid namespace errors without @types/google.maps
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);

  // Initialize Map
  useEffect(() => {
    // Only attempt to load if window.google is defined (API key present in index.html or injected)
    // For this demo app, we'll gracefully degrade if no key
    if (window.google && mapRef.current && !googleMapRef.current) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
            center: { lat: 39.0, lng: 35.0 }, // Default Turkey view
            zoom: 5,
            styles: [
                { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                {
                  featureType: "administrative.locality",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d59563" }],
                },
                {
                  featureType: "poi",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d59563" }],
                },
                {
                  featureType: "poi.park",
                  elementType: "geometry",
                  stylers: [{ color: "#263c3f" }],
                },
                {
                  featureType: "water",
                  elementType: "geometry",
                  stylers: [{ color: "#17263c" }],
                },
              ],
              streetViewControl: false,
              mapTypeControl: false,
        });
    }
  }, []);

  // Update Map View on Disaster Select
  useEffect(() => {
    if (disaster && googleMapRef.current) {
        googleMapRef.current.panTo({ lat: disaster.lat, lng: disaster.lng });
        googleMapRef.current.setZoom(9);
    }
  }, [disaster]);

  // Render Analysis Overlays
  useEffect(() => {
    const map = googleMapRef.current;
    if (!map || !analysis) return;

    // Clear previous
    markersRef.current.forEach((m: any) => m.setMap(null));
    circlesRef.current.forEach((c: any) => c.setMap(null));
    markersRef.current = [];
    circlesRef.current = [];

    // Render Damage Zones
    analysis.damageZones.forEach(zone => {
        const color = zone.severity === 'critical' ? '#FF0000' : 
                      zone.severity === 'severe' ? '#FF6600' : '#FFCC00';
        
        const circle = new window.google.maps.Circle({
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: color,
            fillOpacity: 0.35,
            map,
            center: { lat: zone.lat, lng: zone.lng },
            radius: zone.radiusKm * 1000,
        });
        circlesRef.current.push(circle);
    });

    // Render Priorities
    analysis.rescuePriorities.forEach((p, idx) => {
        const marker = new window.google.maps.Marker({
            position: { lat: p.lat, lng: p.lng },
            map,
            label: {
                text: (idx + 1).toString(),
                color: "white",
                fontWeight: "bold"
            },
            title: p.location
        });
        markersRef.current.push(marker);
    });

  }, [analysis]);

  // Fallback UI if Google Maps API is missing
  const isMapApiLoaded = typeof window !== 'undefined' && window.google?.maps;

  return (
    <main className="relative flex-1 bg-[#1a1a2e] overflow-hidden">
      {!isMapApiLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 z-0">
           <div className="text-6xl mb-4">🗺️</div>
           <h2 className="text-xl font-semibold text-gray-400">Interactive Map</h2>
           <p className="text-sm mt-2 max-w-md text-center">
             Google Maps API key required to render live map. 
             <br/>
             Coordinates: {disaster ? `${disaster.lat.toFixed(3)}, ${disaster.lng.toFixed(3)}` : 'N/A'}
           </p>
           {analysis && (
               <div className="mt-8 grid grid-cols-2 gap-4">
                   <div className="bg-gray-800 p-4 rounded text-center">
                       <div className="text-red-500 font-bold text-2xl">{analysis.damageZones.length}</div>
                       <div className="text-xs uppercase">Damage Zones</div>
                   </div>
                   <div className="bg-gray-800 p-4 rounded text-center">
                       <div className="text-orange-500 font-bold text-2xl">{analysis.rescuePriorities.length}</div>
                       <div className="text-xs uppercase">Rescue Sites</div>
                   </div>
               </div>
           )}
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full z-10" />

      {/* Map Overlay Info */}
      {disaster && analysis && (
        <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-md p-4 rounded-lg border border-gray-700 max-w-sm z-20 shadow-xl">
            <h2 className="text-red-500 font-bold flex items-center gap-2">
                <span>📍</span> Situation Overview
            </h2>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                Gemini 3 has identified <strong>{analysis.damageZones.length} critical zones</strong>. 
                Casualty estimates indicate <strong>{analysis.casualtyEstimate.deaths.low.toLocaleString()}+</strong> potential fatalities.
                <br/>
                <span className="text-gray-500 mt-1 block italic">Analysis based on satellite imagery & {analysis.evidence?.length || 'multiple'} data sources.</span>
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <span className="w-2 h-2 bg-red-600 rounded-sm"></span> Critical
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <span className="w-2 h-2 bg-orange-500 rounded-sm"></span> Severe
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <span className="w-2 h-2 bg-yellow-500 rounded-sm"></span> Moderate
                </div>
            </div>
        </div>
      )}
    </main>
  );
};