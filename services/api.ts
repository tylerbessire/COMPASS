
import { API_ENDPOINTS, HISTORICAL_NEWS_TURKEY_2023, HISTORICAL_INFRASTRUCTURE_TURKEY, TURKEY_EARTHQUAKE_DEMO, SATELLITE_IMAGES } from '../constants';
import { Disaster, NewsArticle, Infrastructure, GatheredData } from '../types';

// ==========================================
// DATA FETCHING LAYER
// ==========================================

export const fetchSignificantEarthquakes = async (): Promise<Disaster[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.USGS_SIGNIFICANT_DAY);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    
    return data.features.map((feature: any) => ({
      id: feature.id,
      type: 'earthquake',
      magnitude: feature.properties.mag,
      place: feature.properties.place,
      time: new Date(feature.properties.time),
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
      depth: feature.geometry.coordinates[2],
      alert: feature.properties.alert,
      tsunami: feature.properties.tsunami === 1,
      usgsUrl: feature.properties.url,
    }));
  } catch (error) {
    console.error('Failed to fetch USGS data', error);
    return [];
  }
};

export const fetchDisasterNews = async (disaster: Disaster): Promise<{ geoTagged: any, articles: NewsArticle[] }> => {
  // ROUTING LOGIC: Serve historical data for the specific Turkey Demo ID
  if (disaster.id === TURKEY_EARTHQUAKE_DEMO.id || disaster.id === 'us6000jllz_after') {
    return {
      geoTagged: null, // Simulated in analysis
      articles: HISTORICAL_NEWS_TURKEY_2023
    };
  }

  // LIVE API LOGIC: GDELT
  const query = encodeURIComponent(`${disaster.type} ${disaster.place.split(',')[0]}`);
  try {
    const [geoRes, docRes] = await Promise.all([
      fetch(`${API_ENDPOINTS.GDELT_GEO}?query=${query}&mode=pointdata&format=json&timespan=48h&maxpoints=100`),
      fetch(`${API_ENDPOINTS.GDELT_DOC}?query=${query}&mode=artlist&format=json&maxrecords=50&timespan=48h&sort=hybridrel`)
    ]);

    const geoData = await geoRes.json();
    const docData = await docRes.json();

    return {
      geoTagged: geoData,
      articles: docData.articles || [],
    };
  } catch (error) {
    console.error('Failed to fetch GDELT data', error);
    return { geoTagged: null, articles: [] };
  }
};

export const fetchInfrastructure = async (disasterId: string, lat: number, lng: number): Promise<Infrastructure> => {
  // ROUTING LOGIC: Serve historical infrastructure for Demo
  if (disasterId === TURKEY_EARTHQUAKE_DEMO.id || disasterId === 'us6000jllz_after') {
    return HISTORICAL_INFRASTRUCTURE_TURKEY;
  }

  // LIVE API LOGIC: Overpass (OSM)
  // Limited radius to prevent massive payloads in browser
  const radiusKm = 5; 
  const latOffset = radiusKm / 111;
  const lngOffset = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
  const bbox = [lat - latOffset, lng - lngOffset, lat + latOffset, lng + lngOffset];

  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="hospital"](${bbox.join(',')});
      node["amenity"="shelter"](${bbox.join(',')});
      node["emergency"="shelter"](${bbox.join(',')});
      way["highway"="primary"](${bbox.join(',')});
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    const response = await fetch(API_ENDPOINTS.OVERPASS, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
    });
    const data = await response.json();
    
    // Transform OSM data to our Infrastructure interface
    const hospitals = data.elements
      .filter((e: any) => e.tags?.amenity === 'hospital')
      .map((e: any) => ({
        type: 'hospital',
        name: e.tags.name || 'Unknown Hospital',
        lat: e.lat,
        lng: e.lon,
        status: 'unknown'
      }));

    const shelters = data.elements
      .filter((e: any) => e.tags?.amenity === 'shelter' || e.tags?.emergency === 'shelter')
      .map((e: any) => ({
        type: 'shelter',
        name: e.tags.name || 'Emergency Shelter',
        lat: e.lat,
        lng: e.lon,
        status: 'unknown'
      }));

    const roads = data.elements
      .filter((e: any) => e.tags?.highway)
      .map((e: any) => ({
        type: 'road',
        name: e.tags.name || 'Unnamed Road',
        lat: e.lat || 0, // Simplified for nodes, real OSM ways need geometry parsing
        lng: e.lon || 0,
        status: 'unknown'
      }));

    return { hospitals, shelters, roads };
  } catch (error) {
    console.error('Failed to fetch OSM data', error);
    return { hospitals: [], shelters: [], roads: [] };
  }
};

export const fetchGatheredData = async (disaster: Disaster): Promise<GatheredData> => {
    const [news, infra] = await Promise.all([
        fetchDisasterNews(disaster),
        fetchInfrastructure(disaster.id, disaster.lat, disaster.lng)
    ]);

    return {
        satellite: { 
            before: SATELLITE_IMAGES.BEFORE, 
            after: SATELLITE_IMAGES.AFTER 
        },
        news,
        infrastructure: infra
    };
};
