
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisReport, Disaster, GatheredData } from "../types";

/**
 * Main analysis function using Gemini 3 Pro
 * Uses structured JSON output to ensure type safety with the frontend.
 */
export const analyzeDisasterData = async (
  disaster: Disaster, 
  data: GatheredData,
  isDemo: boolean = false
): Promise<AnalysisReport | null> => {
  
  if (!process.env.API_KEY) {
    console.error("Gemini API Client not initialized. Check API_KEY.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Constructing a context-rich prompt
  const infrastructureSummary = `
    HOSPITALS:
    ${data.infrastructure.hospitals.map(h => `- ${h.name} (${h.status || 'unknown'}) @ ${h.lat},${h.lng}`).join('\n')}
    
    ROADS:
    ${data.infrastructure.roads.map(r => `- ${r.name} (${r.status || 'unknown'}) @ ${r.lat},${r.lng}`).join('\n')}
  `;

  const newsSummary = data.news.articles.slice(0, 25).map(a => 
    `- [${a.seendate}] ${a.title} (${a.domain})`
  ).join('\n');

  const prompt = `
    You are the Crisis Coordinator AI, a specialized system for disaster response.
    
    EVENT CONTEXT:
    Type: ${disaster.type}
    Magnitude: ${disaster.magnitude}
    Location: ${disaster.place}
    Coordinates: ${disaster.lat}, ${disaster.lng}
    Time: ${disaster.time.toISOString()}
    
    REAL-TIME DATA STREAMS:
    
    --- NEWS REPORTS (GDELT) ---
    ${newsSummary}
    
    --- INFRASTRUCTURE STATUS (OSM/GOV) ---
    ${infrastructureSummary}

    MISSION:
    Analyze the provided data to generate a tactical response plan. 
    1. Cross-reference news reports with infrastructure data to confirm damages.
    2. Estimate casualties based on building collapse reports and population density.
    3. Identify specific 'Rescue Priorities' - locations with reported trapped civilians.
    4. Detect 'Blocked Routes' mentioned in reports (e.g., collapsed bridges, debris).

    OUTPUT REQUIREMENT:
    Return a strictly valid JSON object adhering to the schema. 
    - 'damageZones': Estimate 3-5 distinct zones based on clustered reports.
    - 'rescuePriorities': Identify 3-5 specific buildings/neighborhoods.
    - 'blockedRoutes': Identify critical logistical failures.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using the advanced model for complex reasoning
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING, description: "A concise 2-sentence briefing for incident command." },
            casualtyEstimate: {
              type: Type.OBJECT,
              properties: {
                deaths: { type: Type.OBJECT, properties: { low: { type: Type.NUMBER }, high: { type: Type.NUMBER } } },
                injuries: { type: Type.OBJECT, properties: { low: { type: Type.NUMBER }, high: { type: Type.NUMBER } } },
                trapped: { type: Type.OBJECT, properties: { confirmed: { type: Type.NUMBER }, reported: { type: Type.NUMBER } } },
                confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] }
              }
            },
            damageZones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                  radiusKm: { type: Type.NUMBER },
                  severity: { type: Type.STRING, enum: ['critical', 'severe', 'moderate', 'minor'] },
                  confidence: { type: Type.NUMBER },
                  evidence: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            rescuePriorities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  location: { type: Type.STRING },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                  priority: { type: Type.STRING, enum: ['critical', 'high', 'medium', 'low'] },
                  reason: { type: Type.STRING },
                  reportedTrapped: { type: Type.NUMBER },
                  source: { type: Type.STRING }
                }
              }
            },
            blockedRoutes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ['road', 'bridge', 'tunnel'] },
                  name: { type: Type.STRING },
                  fromLat: { type: Type.NUMBER },
                  fromLng: { type: Type.NUMBER },
                  toLat: { type: Type.NUMBER },
                  toLng: { type: Type.NUMBER },
                  confidence: { type: Type.NUMBER }
                }
              }
            },
            operationalFacilities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ['hospital', 'shelter'] },
                  name: { type: Type.STRING },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                  status: { type: Type.STRING, enum: ['operational', 'damaged', 'unknown', 'destroyed'] }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    
    return JSON.parse(text) as AnalysisReport;
    
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    // Exponential backoff logic could go here in a production env
    // For now, we return null to signal failure to the UI
    return null;
  }
};

export const generateBriefingVideo = async (analysis: AnalysisReport): Promise<string | null> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key for video generation");
    return null;
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Creating a focused script for Veo
  const script = `
    Breaking News: Crisis in ${analysis.damageZones[0]?.name || 'the region'}. 
    ${analysis.executiveSummary}
    Casualty estimates are rising with over ${analysis.casualtyEstimate.deaths.low} feared dead.
    Search and rescue is underway at key locations like ${analysis.rescuePriorities[0]?.location}.
    Urgent medical support needed.
  `;

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Cinematic news briefing drone shot of disaster zone, earthquake rubble, emergency lights. Voiceover: "${script}"`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Polling for video completion
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (uri) {
        return `${uri}&key=${process.env.API_KEY}`;
    }
    return null;

  } catch (error) {
    console.error("Video generation failed", error);
    return null;
  }
};

export const generateInfographicPrompt = (analysis: AnalysisReport): string => {
   return `
    Create a professional crisis response map infographic.
    Headline: ${analysis.executiveSummary.slice(0, 50)}...
    Data points: 
    - Deaths: ${analysis.casualtyEstimate.deaths.high}
    - Injured: ${analysis.casualtyEstimate.injuries.high}
    - Critical Zones: ${analysis.damageZones.length}
    Visual style: High-tech HUD, dark mode map, red alert zones, clean typography.
  `;
};
