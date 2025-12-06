import { Disaster } from './types';

export const TURKEY_EARTHQUAKE_DEMO: Disaster = {
  id: 'us6000jllz',
  type: 'earthquake',
  magnitude: 7.8,
  place: 'Pazarcık, Kahramanmaraş, Turkey',
  time: new Date('2023-02-06T01:17:35.000Z'),
  lat: 37.166,
  lng: 37.042,
  depth: 17.9,
  alert: 'red',
  tsunami: false,
  usgsUrl: 'https://earthquake.usgs.gov/earthquakes/eventpage/us6000jllz',
};

// Simulation of "Aftershock"
export const AFTERSHOCK_DEMO: Disaster = {
  id: 'us6000jllz_after',
  type: 'earthquake',
  magnitude: 7.5,
  place: 'Elbistan, Kahramanmaraş, Turkey',
  time: new Date('2023-02-06T10:24:49.000Z'),
  lat: 38.024,
  lng: 37.203,
  depth: 10.0,
  alert: 'orange',
  tsunami: false,
  usgsUrl: 'https://earthquake.usgs.gov/earthquakes/eventpage/us6000jllz',
};

export const API_ENDPOINTS = {
  USGS_SIGNIFICANT_DAY: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson',
  GDELT_GEO: 'https://api.gdeltproject.org/api/v2/geo/geo',
  GDELT_DOC: 'https://api.gdeltproject.org/api/v2/doc/doc',
  OVERPASS: 'https://overpass-api.de/api/interpreter',
};

export const MOCK_ANALYSIS_RESULT = {
  executiveSummary: "A catastrophic magnitude 7.8 earthquake has struck southeastern Turkey. Satellite analysis confirms widespread structural collapse in urban centers. News reports indicate thousands trapped under rubble with critical infrastructure compromised.",
  casualtyEstimate: {
    deaths: { low: 35000, high: 55000 },
    injuries: { low: 80000, high: 120000 },
    trapped: { confirmed: 2300, reported: 15000 },
    confidence: 'high'
  },
  damageZones: [
    {
      name: "Antakya Center",
      lat: 36.202,
      lng: 36.160,
      radiusKm: 5,
      severity: 'critical',
      confidence: 0.95,
      evidence: ["satellite", "multiple_news"]
    },
    {
      name: "Pazarcık Epicenter",
      lat: 37.166,
      lng: 37.042,
      radiusKm: 8,
      severity: 'severe',
      confidence: 0.9,
      evidence: ["satellite", "seismic_data"]
    },
    {
      name: "Islahiye District",
      lat: 37.025,
      lng: 36.631,
      radiusKm: 4,
      severity: 'critical',
      confidence: 0.88,
      evidence: ["satellite", "social_media"]
    }
  ],
  rescuePriorities: [
    {
      location: "Rönesans Rezidans, Antakya",
      lat: 36.202,
      lng: 36.160,
      priority: 'critical',
      reason: "Large residential complex collapse, estimated 800+ residents",
      reportedTrapped: 400,
      source: "Twitter/X Reports"
    },
    {
      location: "Kahramanmaraş State Hospital",
      lat: 37.575,
      lng: 36.923,
      priority: 'critical',
      reason: "Partial collapse reported, patients require evacuation",
      reportedTrapped: 50,
      source: "GDELT News"
    },
    {
      location: "Adıyaman City Hall Area",
      lat: 37.764,
      lng: 38.276,
      priority: 'high',
      reason: "Heavy damage to civic buildings",
      reportedTrapped: 20,
      source: "Local News"
    }
  ],
  blockedRoutes: [
    {
      type: 'road',
      name: 'D400 Highway',
      fromLat: 36.2,
      fromLng: 36.1,
      toLat: 36.3,
      toLng: 36.2,
      confidence: 0.9
    },
    {
      type: 'bridge',
      name: 'Nurdağı Viaduct',
      fromLat: 37.1,
      fromLng: 36.8,
      toLat: 37.11,
      toLng: 36.81,
      confidence: 0.85
    }
  ],
  operationalFacilities: [
    {
      type: 'hospital',
      name: 'Gaziantep City Hospital',
      lat: 37.066,
      lng: 37.383,
      status: 'operational'
    },
    {
      type: 'hospital',
      name: 'Adana City Training Hospital',
      lat: 37.034,
      lng: 35.289,
      status: 'operational'
    },
    {
      type: 'shelter',
      name: 'Malatya Stadium',
      lat: 38.351,
      lng: 38.332,
      status: 'operational'
    }
  ]
};
