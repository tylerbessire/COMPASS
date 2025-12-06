export interface Disaster {
  id: string;
  type: string;
  magnitude: number;
  place: string;
  time: Date;
  lat: number;
  lng: number;
  depth?: number;
  alert?: string; // "green", "yellow", "orange", "red"
  tsunami?: boolean;
  usgsUrl?: string;
}

export interface NewsArticle {
  url: string;
  title: string;
  domain: string;
  seendate: string;
}

export interface Infrastructure {
  hospitals: any[];
  shelters: any[];
  roads: any[];
}

export interface GatheredData {
  satellite: {
    before: string | null;
    after: string | null;
  };
  news: {
    geoTagged: any;
    articles: NewsArticle[];
  };
  infrastructure: Infrastructure;
}

export interface AnalysisReport {
  executiveSummary: string;
  casualtyEstimate: {
    deaths: { low: number; high: number };
    injuries: { low: number; high: number };
    trapped: { confirmed: number; reported: number };
    confidence: 'high' | 'medium' | 'low';
  };
  damageZones: {
    name: string;
    lat: number;
    lng: number;
    radiusKm: number;
    severity: 'critical' | 'severe' | 'moderate' | 'minor';
    confidence: number;
    evidence: string[];
  }[];
  rescuePriorities: {
    location: string;
    lat: number;
    lng: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
    reason: string;
    reportedTrapped?: number;
    source: string;
  }[];
  blockedRoutes: {
    type: 'road' | 'bridge' | 'tunnel';
    name: string;
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
    confidence: number;
  }[];
  operationalFacilities: {
    type: 'hospital' | 'shelter';
    name: string;
    lat: number;
    lng: number;
    status: 'operational' | 'damaged' | 'unknown' | 'destroyed';
  }[];
}

export type ProcessingStatus = 'idle' | 'gathering' | 'analyzing' | 'complete' | 'failed';
