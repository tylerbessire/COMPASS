
import { Disaster, NewsArticle, Infrastructure } from './types';

// ==========================================
// DEMO CONFIGURATION
// ==========================================

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

// ==========================================
// HISTORICAL DATASET: FEB 6, 2023
// ==========================================

export const HISTORICAL_NEWS_TURKEY_2023: NewsArticle[] = [
  { title: "7.8 Magnitude Earthquake Strikes Southern Turkey and Syria", url: "https://reuters.com", domain: "reuters.com", seendate: "20230206T020000Z" },
  { title: "Iskenderun State Hospital A-Block Collapses, Patients Trapped", url: "https://dhapress.com", domain: "dha.com.tr", seendate: "20230206T043000Z" },
  { title: "Runway at Hatay Airport destroyed, flights suspended indefinitely", url: "https://aa.com.tr", domain: "anadoluagency.com", seendate: "20230206T051500Z" },
  { title: "Rönesans Rezidans in Antakya reported collapsed with hundreds inside", url: "https://twitter.com", domain: "twitter.com", seendate: "20230206T064500Z" },
  { title: "Fire breaks out at Iskenderun Port following massive tremors", url: "https://trthaber.com", domain: "trtworld.com", seendate: "20230206T070000Z" },
  { title: "Roads between Gaziantep and Adana blocked by snow and debris", url: "https://cnn.com", domain: "cnn.com", seendate: "20230206T072000Z" },
  { title: "Castle of Gaziantep, historic landmark, heavily damaged", url: "https://bbc.com", domain: "bbc.com", seendate: "20230206T080000Z" },
  { title: "AFAD declares Level 4 alert, calls for international assistance", url: "https://afad.gov.tr", domain: "afad.gov.tr", seendate: "20230206T023000Z" },
  { title: "Power outages widespread across Hatay, Kahramanmaraş, and Adıyaman", url: "https://bloomberg.com", domain: "bloomberg.com", seendate: "20230206T030000Z" },
  { title: "Isias Hotel in Adıyaman collapsed, sports team trapped", url: "https://hurriyet.com.tr", domain: "hurriyetdailynews.com", seendate: "20230206T090000Z" },
  { title: "Natural gas pipelines exploded in Amik Valley, fires reported", url: "https://reuters.com", domain: "reuters.com", seendate: "20230206T054500Z" },
  { title: "Nurdağı viaduct damaged, traffic halted on E90 highway", url: "https://sabah.com.tr", domain: "dailysabah.com", seendate: "20230206T061000Z" },
  { title: "Severe aftershocks continue, hindering rescue operations in Elbistan", url: "https://usgs.gov", domain: "usgs.gov", seendate: "20230206T103000Z" },
  { title: "Citizens in Malatya sharing coordinates of trapped relatives on social media", url: "https://twitter.com", domain: "twitter.com", seendate: "20230206T041500Z" },
  { title: "Adana City Hospital receiving overflow of patients from neighboring provinces", url: "https://moh.gov.tr", domain: "saglik.gov.tr", seendate: "20230206T110000Z" },
  { title: "Snowstorm in the region complicates access to rural villages", url: "https://weather.com", domain: "weather.com", seendate: "20230206T033000Z" },
  { title: "Ten provinces affected, state of emergency discussions underway", url: "https://aljazeera.com", domain: "aljazeera.com", seendate: "20230206T120000Z" },
  { title: "Grand Isias Hotel wreckage: Voices heard, crane needed urgently", url: "https://twitter.com", domain: "twitter.com", seendate: "20230206T093000Z" },
  { title: "Hatay Education and Research Hospital damaged, field hospital setup required", url: "https://aa.com.tr", domain: "aa.com.tr", seendate: "20230206T084500Z" },
  { title: "Massive destruction in central Antakya, historic parliament building ruined", url: "https://nytimes.com", domain: "nytimes.com", seendate: "20230206T130000Z" }
];

export const HISTORICAL_INFRASTRUCTURE_TURKEY: Infrastructure = {
  hospitals: [
    { type: "hospital", name: "Iskenderun State Hospital", lat: 36.586, lng: 36.164, status: "collapsed" },
    { type: "hospital", name: "Hatay Training and Research Hospital", lat: 36.223, lng: 36.185, status: "damaged" },
    { type: "hospital", name: "Gaziantep City Hospital", lat: 37.066, lng: 37.383, status: "operational" },
    { type: "hospital", name: "Kahramanmaraş Necip Fazıl City Hospital", lat: 37.575, lng: 36.923, status: "operational" }, // Main block ok, others damaged
    { type: "hospital", name: "Adana City Training & Research Hospital", lat: 37.034, lng: 35.289, status: "operational" },
    { type: "hospital", name: "Malatya Training and Research Hospital", lat: 38.351, lng: 38.332, status: "operational" },
    { type: "hospital", name: "Adıyaman Training and Research Hospital", lat: 37.764, lng: 38.276, status: "damaged" },
    { type: "hospital", name: "Osmaniye State Hospital", lat: 37.074, lng: 36.247, status: "operational" },
    { type: "hospital", name: "Kilis State Hospital", lat: 36.716, lng: 37.115, status: "operational" },
    { type: "hospital", name: "Defne State Hospital", lat: 36.140, lng: 36.100, status: "unknown" } // Was u/c or new
  ],
  shelters: [
    { type: "shelter", name: "Gaziantep University Stadium", lat: 37.033, lng: 37.366, status: "operational" },
    { type: "shelter", name: "Hatay Stadium", lat: 36.250, lng: 36.200, status: "operational" },
    { type: "shelter", name: "12 Şubat Stadium (Kahramanmaraş)", lat: 37.580, lng: 36.930, status: "operational" },
    { type: "shelter", name: "Adana 5 Ocak Stadium", lat: 36.990, lng: 35.330, status: "operational" }
  ],
  roads: [
    { type: "road", name: "E90 Highway", lat: 37.100, lng: 36.800, status: "blocked" }, // Nurdağı
    { type: "road", name: "D825 Highway", lat: 37.200, lng: 36.900, status: "damaged" }, // Road to Maraş
    { type: "road", name: "Hatay Airport Road", lat: 36.360, lng: 36.280, status: "blocked" },
    { type: "road", name: "Tag Highway (O-52)", lat: 37.150, lng: 37.000, status: "damaged" }
  ]
};

export const SATELLITE_IMAGES = {
  BEFORE: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Antakya_Turkey_2022_Sentinal-2_satellite_image.jpg/640px-Antakya_Turkey_2022_Sentinal-2_satellite_image.jpg",
  AFTER: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Antakya_Turkey_Feb_13_2023_Sentinal-2_satellite_image.jpg/640px-Antakya_Turkey_Feb_13_2023_Sentinal-2_satellite_image.jpg"
};
