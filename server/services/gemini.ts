import { GoogleGenAI } from "@google/genai";

// ⚠️ Best practice: Store API keys in env files, not directly in code.
const ai = new GoogleGenAI({
  apiKey: "AIzaSyB5RWEO1nyqbjkexpDbY-alL22LEMsj0aA",
});

// ---------------- Types ----------------

export interface VitalsData {
  heartRate?: number;
  systolicBP?: number;
  diastolicBP?: number;
  temperature?: number;
  oxygenSaturation?: number;
}

export interface MoodData {
  mood: string;
  description?: string;
}

export interface Hospital {
  name: string;
  address: string;
  phone?: string;
  distance: string;
  type: string;
}

// ---------------- Vitals Analysis ----------------

export async function analyzeVitals(vitals: VitalsData): Promise<string> {
  try {
    const vitalsText = Object.entries(vitals)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        switch (key) {
          case "heartRate":
            return `Heart Rate: ${value} BPM`;
          case "systolicBP":
            return `Systolic BP: ${value} mmHg`;
          case "diastolicBP":
            return `Diastolic BP: ${value} mmHg`;
          case "temperature":
            return `Temperature: ${value}°F`;
          case "oxygenSaturation":
            return `Oxygen Saturation: ${value}%`;
          default:
            return `${key}: ${value}`;
        }
      })
      .join(", ");

    const prompt = `Analyze the following vitals and provide:
1. A brief assessment of whether these readings are within normal range.
2. General health or lifestyle suggestions.
3. A disclaimer that this is not a diagnosis.

Vitals: ${vitalsText}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return response.text?.trim() || "Unable to analyze vitals at this time.";
  } catch (error) {
    console.error("analyzeVitals error:", error);
    throw new Error("Failed to analyze vitals. Please try again.");
  }
}

// ---------------- Mood Activity Suggestion ----------------

export async function recommendActivities(moodData: MoodData): Promise<string> {
  try {
    const context = moodData.description
      ? ` with the note: "${moodData.description}"`
      : "";

    const prompt = `Suggest 3–4 wellbeing activities for someone feeling "${moodData.mood}"${context}. Include:
1. A physical activity or light exercise
2. A mindfulness or calming practice
3. A social/creative engagement idea (if applicable)

Suggestions should be actionable and encouraging.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return response.text?.trim() || "Unable to recommend activities at this time.";
  } catch (error) {
    console.error("recommendActivities error:", error);
    throw new Error("Failed to generate activity suggestions.");
  }
}

// ---------------- Chat with Sakhi ----------------

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithSakhi(
  message: string,
  chatHistory?: ChatMessage[]
): Promise<string> {
  try {
    const historyText = chatHistory
      ?.slice(-6)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const prompt = historyText
      ? `You are Sakhi, a helpful AI health assistant. Here's recent context:

${historyText}

Now the user says: "${message}"`
      : `You are Sakhi, a warm, informative AI health assistant. Answer the user's question:

"${message}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return response.text?.trim() || "Sorry, I couldn’t respond. Try again.";
  } catch (error) {
    console.error("chatWithSakhi error:", error);
    throw new Error("Something went wrong with Sakhi’s response.");
  }
}

// ---------------- Find Nearby Hospitals (AI-generated fallback) ----------------

export async function findNearbyHospitals(
  latitude: number,
  longitude: number
): Promise<Hospital[]> {
  try {
    const prompt = `Given location (${latitude}, ${longitude}), list 5–10 nearby hospitals or clinics in this JSON format:

[
  {
    "name": "Hospital Name",
    "address": "Full address",
    "phone": "Phone number (if known)",
    "distance": "Approximate distance",
    "type": "Hospital/Clinic/Emergency Center"
  }
]

Return only valid data based on the coordinates.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      config: { responseMimeType: "application/json" },
      contents: prompt,
    });

    const data = response.text?.trim();
    if (!data) throw new Error("Empty response from Gemini");

    const hospitals = JSON.parse(data);
    return Array.isArray(hospitals) ? hospitals.slice(0, 10) : [];
  } catch (error) {
    console.error("findNearbyHospitals error:", error);
    throw new Error("Could not retrieve hospitals. Please try again later.");
  }
}
