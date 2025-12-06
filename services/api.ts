import { API_ENDPOINTS } from '../constants';
import { Disaster, NewsArticle, Infrastructure } from '../types';

// USGS Service
export const fetchSignificantEarthquakes = async (): Promise<Disaster[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.USGS_SIGNIFICANT_DAY);
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

// GDELT Service
export const fetchDisasterNews = async (disaster: Disaster): Promise<{ geoTagged: any, articles: NewsArticle[] }> => {
  const query = encodeURIComponent(`${disaster.type} ${disaster.place.split(',')[0]}`);
  
  try {
    // Parallel fetch for demo speed
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

// OSM Service
export const fetchInfrastructure = async (lat: number, lng: number): Promise<Infrastructure> => {
  const radiusKm = 10;
  const latOffset = radiusKm / 111;
  const lngOffset = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
  const bbox = [lat - latOffset, lng - lngOffset, lat + latOffset, lng + lngOffset];

  const query = `
    [out:json][timeout:15];
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
    
    const hospitals = data.elements.filter((e: any) => e.tags?.amenity === 'hospital');
    const shelters = data.elements.filter((e: any) => e.tags?.amenity === 'shelter' || e.tags?.emergency === 'shelter');
    const roads = data.elements.filter((e: any) => e.tags?.highway);

    return { hospitals, shelters, roads };
  } catch (error) {
    console.error('Failed to fetch OSM data', error);
    return { hospitals: [], shelters: [], roads: [] };
  }
};
