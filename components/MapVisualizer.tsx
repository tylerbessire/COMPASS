
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AnalysisReport, Disaster } from '../types';

// ==========================================
// TYPE DECLARATIONS
// ==========================================

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface CameraPosition {
  center: { lat: number; lng: number };
  zoom: number;
  tilt: number;
  heading: number;
}

interface MapVisualizerProps {
  disaster: Disaster | null;
  analysis: AnalysisReport | null;
}

// ==========================================
// STYLES & CONSTANTS
// ==========================================

const MAP_ID = "DEMO_MAP_ID"; // Required for Vector Map features
const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || process.env.API_KEY || ''; 

const SEVERITY_COLORS = {
  critical: '#FF0000',
  severe: '#FF4500',
  moderate: '#FFCC00',
  minor: '#00CC00'
};

const BLOCKED_ROAD_SYMBOL = {
  path: 'M -2,0 0,-2 2,0 0,2 z',
  strokeColor: '#F00',
  fillColor: '#F00',
  fillOpacity: 1
};

const RESCUE_ROUTE_SYMBOL = {
  path: 'M 0,-1 0,1',
  strokeOpacity: 1,
  scale: 4
};

// ==========================================
// COMPONENT
// ==========================================

export const MapVisualizer: React.FC<MapVisualizerProps> = ({ disaster, analysis }) => {
  // Refs for Map Instance and Objects
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const directionsServiceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  
  // Track overlays to clear them on updates
  const overlaysRef = useRef<{
    markers: any[];
    circles: any[];
    polylines: any[];
  }>({ markers: [], circles: [], polylines: [] });

  // Animation State
  const animationFrameRef = useRef<number | null>(null);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [routeInfo, setRouteInfo] = useState<string | null>(null);

  // ==========================================
  // INITIALIZATION
  // ==========================================

  useEffect(() => {
    // Load Script if not present
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,places,marker&callback=initMap&v=beta`;
      script.async = true;
      script.defer = true;
      window.initMap = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current || googleMapRef.current) return;

    try {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 37.166, lng: 37.042 },
        zoom: 6,
        mapId: MAP_ID, // Enables Vector Maps / WebGL
        mapTypeId: 'hybrid',
        tilt: 45,
        heading: 0,
        disableDefaultUI: true,
        zoomControl: true,
        rotateControl: true,
        tiltControl: true,
      });

      directionsServiceRef.current = new window.google.maps.DirectionsService();
      
      // Custom renderer for cleaner look
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map: googleMapRef.current,
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: {
          strokeColor: '#3b82f6',
          strokeOpacity: 0, // We draw our own animated line
          strokeWeight: 0,
          icons: [{
            icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4, strokeColor: '#3b82f6' },
            offset: '0',
            repeat: '20px'
          }]
        }
      });

      setMapReady(true);
      
      // Initial Fly-in
      if (disaster) {
        flyTo({
          center: { lat: disaster.lat, lng: disaster.lng },
          zoom: 10,
          tilt: 45,
          heading: 0
        }, 2000);
      }

    } catch (e) {
      console.error("Map Init Error:", e);
    }
  };

  // ==========================================
  // CAMERA CONTROL SYSTEM
  // ==========================================

  const animateCamera = (target: CameraPosition, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      if (!googleMapRef.current) { resolve(); return; }

      const start = {
        center: googleMapRef.current.getCenter().toJSON(),
        zoom: googleMapRef.current.getZoom(),
        tilt: googleMapRef.current.getTilt(),
        heading: googleMapRef.current.getHeading() || 0
      };

      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (easeInOutCubic)
        const ease = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        if (progress < 1) {
          googleMapRef.current.moveCamera({
            center: {
              lat: start.center.lat + (target.center.lat - start.center.lat) * ease,
              lng: start.center.lng + (target.center.lng - start.center.lng) * ease
            },
            zoom: start.zoom + (target.zoom - start.zoom) * ease,
            tilt: start.tilt + (target.tilt - start.tilt) * ease,
            heading: start.heading + (target.heading - start.heading) * ease
          });
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Ensure final state
          googleMapRef.current.moveCamera(target);
          resolve();
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    });
  };

  const flyTo = async (target: CameraPosition, duration = 2000) => {
    await animateCamera(target, duration);
  };

  const orbitAround = (center: { lat: number; lng: number }, radius: number, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      if (!googleMapRef.current) { resolve(); return; }
      
      const startHeading = googleMapRef.current.getHeading() || 0;
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
          const currentHeading = startHeading + (progress * 180); // Rotate 180 degrees
          googleMapRef.current.moveCamera({ heading: currentHeading });
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      animationFrameRef.current = requestAnimationFrame(animate);
    });
  };

  // ==========================================
  // VISUALIZATION RENDERERS
  // ==========================================

  useEffect(() => {
    if (!mapReady || !analysis || !window.google) return;

    // Clear existing
    overlaysRef.current.markers.forEach(m => m.setMap(null));
    overlaysRef.current.circles.forEach(c => c.setMap(null));
    overlaysRef.current.polylines.forEach(p => p.setMap(null));
    overlaysRef.current = { markers: [], circles: [], polylines: [] };

    // 1. Render Damage Zones (Circles/Polygons)
    analysis.damageZones.forEach(zone => {
      const color = SEVERITY_COLORS[zone.severity] || SEVERITY_COLORS.minor;
      
      const circle = new window.google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.35,
        map: googleMapRef.current,
        center: { lat: zone.lat, lng: zone.lng },
        radius: zone.radiusKm * 1000,
        zIndex: 1
      });

      // Click to focus
      circle.addListener('click', () => {
        flyTo({
          center: { lat: zone.lat, lng: zone.lng },
          zoom: 13,
          tilt: 60,
          heading: 0
        });
      });

      overlaysRef.current.circles.push(circle);
    });

    // 2. Render Rescue Priorities (Advanced Markers)
    analysis.rescuePriorities.forEach((priority, idx) => {
      const pinElement = new window.google.maps.marker.PinElement({
        glyph: (idx + 1).toString(),
        background: priority.priority === 'critical' ? '#EF4444' : '#F59E0B',
        borderColor: '#FFF',
      });

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map: googleMapRef.current,
        position: { lat: priority.lat, lng: priority.lng },
        content: pinElement.element,
        title: priority.location,
        zIndex: 100 - idx // Higher priority on top
      });

      // Info Window logic could go here
      marker.addListener('click', () => {
        flyTo({
          center: { lat: priority.lat, lng: priority.lng },
          zoom: 17,
          tilt: 67.5,
          heading: 45
        });
      });

      overlaysRef.current.markers.push(marker);
    });

    // 3. Render Blocked Routes (Static Red Lines)
    analysis.blockedRoutes.forEach(route => {
      const line = new window.google.maps.Polyline({
        path: [
          { lat: route.fromLat, lng: route.fromLng },
          { lat: route.toLat, lng: route.toLng }
        ],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        icons: [{
          icon: { path: 'M -1,-1 1,1 M 1,-1 -1,1', strokeColor: 'white', strokeWeight: 2, scale: 3 },
          offset: '50%',
          repeat: '50px'
        }],
        map: googleMapRef.current
      });
      overlaysRef.current.polylines.push(line);
    });

  }, [analysis, mapReady]);

  // ==========================================
  // ROUTING & DEMO LOGIC
  // ==========================================

  const calculateAndShowRoute = async (start: any, end: any) => {
    if (!directionsServiceRef.current || !analysis) return;

    // Create waypoints to avoid blocked routes (simulated by avoiding their centers)
    // Real avoidance requires complex graph logic or "avoid" parameter which is limited in JS API
    
    directionsServiceRef.current.route({
      origin: { lat: start.lat, lng: start.lng },
      destination: { lat: end.lat, lng: end.lng },
      travelMode: 'DRIVING',
      provideRouteAlternatives: true
    }, (result: any, status: any) => {
      if (status === 'OK') {
        directionsRendererRef.current.setDirections(result);
        const route = result.routes[0];
        setRouteInfo(`${route.legs[0].distance.text} • ${route.legs[0].duration.text}`);
        
        // Animate the route line (simple dash offset animation)
        let count = 0;
        setInterval(() => {
          count = (count + 1) % 200;
          const icons = directionsRendererRef.current.get('polylineOptions').icons;
          icons[0].offset = count / 2 + '%';
          directionsRendererRef.current.set('polylineOptions', { ...directionsRendererRef.current.get('polylineOptions'), icons: icons });
        }, 20);
      }
    });
  };

  const playDemoSequence = async () => {
    if (!analysis || !mapReady) return;
    setIsDemoPlaying(true);

    try {
      const epicenter = { lat: 37.166, lng: 37.042 };
      const priorityTarget = analysis.rescuePriorities[0];
      const hospitalTarget = analysis.operationalFacilities.find(f => f.type === 'hospital' && f.status === 'operational');

      // 1. High Altitude Overview
      await flyTo({ center: epicenter, zoom: 8, tilt: 0, heading: 0 }, 2000);
      
      // 2. Zoom to Epicenter with Tilt
      await flyTo({ center: epicenter, zoom: 12, tilt: 45, heading: 0 }, 2500);
      
      // 3. Orbit Damage Zone
      await orbitAround(epicenter, 0.05, 4000);
      
      // 4. Fly to Rescue Priority #1
      if (priorityTarget) {
        await flyTo({ 
          center: { lat: priorityTarget.lat, lng: priorityTarget.lng }, 
          zoom: 16, 
          tilt: 60, 
          heading: 30 
        }, 2000);
      }

      // 5. Show Route to Hospital
      if (priorityTarget && hospitalTarget) {
        await new Promise(r => setTimeout(r, 1000)); // Pause to look
        await flyTo({
          center: { lat: (priorityTarget.lat + hospitalTarget.lat)/2, lng: (priorityTarget.lng + hospitalTarget.lng)/2 },
          zoom: 12,
          tilt: 30,
          heading: 0
        }, 2000);
        
        calculateAndShowRoute(priorityTarget, hospitalTarget);
      }

    } catch (e) {
      console.log("Demo interrupted");
    } finally {
      setIsDemoPlaying(false);
    }
  };

  const resetView = () => {
    if (disaster) {
      flyTo({
        center: { lat: disaster.lat, lng: disaster.lng },
        zoom: 10,
        tilt: 45,
        heading: 0
      }, 1500);
    }
    setRouteInfo(null);
    directionsRendererRef.current?.setDirections({ routes: [] });
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className="relative flex-1 bg-gray-900 overflow-hidden">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full z-10 block" />

      {/* Loading State */}
      {!mapReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-50">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-blue-400 font-mono text-sm animate-pulse">INITIALIZING SATELLITE UPLINK...</div>
        </div>
      )}

      {/* Route Info Overlay */}
      {routeInfo && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur border border-blue-500/50 px-6 py-2 rounded-full z-20">
          <div className="text-blue-400 font-bold text-sm flex items-center gap-2">
            <span>🔄</span> ACTIVE EVAC ROUTE: {routeInfo}
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-30 pointer-events-auto">
        <button
          onClick={playDemoSequence}
          disabled={isDemoPlaying || !analysis}
          className={`
            px-6 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all
            ${isDemoPlaying 
              ? 'bg-red-600/50 text-white/50 cursor-not-allowed border border-red-500/30' 
              : 'bg-red-600 hover:bg-red-500 text-white shadow-lg hover:shadow-red-500/30 border border-red-500'}
          `}
        >
          {isDemoPlaying ? '▶ SEQUENCE RUNNING...' : '▶ PLAY DEMO SEQUENCE'}
        </button>
        
        <button
          onClick={resetView}
          className="px-4 py-2.5 rounded-full bg-gray-800 hover:bg-gray-700 text-white font-medium text-sm border border-gray-600 transition-all"
        >
          RESET VIEW
        </button>

        <div className="px-4 py-2.5 rounded-full bg-gray-800/80 backdrop-blur text-gray-400 text-xs flex items-center gap-2 border border-gray-700">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          LIVE 3D FEED
        </div>
      </div>
    </main>
  );
};
