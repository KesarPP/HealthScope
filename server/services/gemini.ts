import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI with API key from environment or empty string fallback
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

export async function analyzeVitals(vitals: VitalsData): Promise<string> {
  try {
    const vitalsText = Object.entries(vitals)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        switch (key) {
          case 'heartRate':
            return `Heart Rate: ${value} BPM`;
          case 'systolicBP':
            return `Systolic Blood Pressure: ${value} mmHg`;
          case 'diastolicBP':
            return `Diastolic Blood Pressure: ${value} mmHg`;
          case 'temperature':
            return `Body Temperature: ${value}°F`;
          case 'oxygenSaturation':
            return `Oxygen Saturation: ${value}%`;
          default:
            return `${key}: ${value}`;
        }
      })
      .join(', ');

    const prompt = `As a health AI assistant, analyze these vital signs and provide brief, general health suggestions: ${vitalsText}. 
    
    Please provide:
    1. A brief assessment of whether these readings appear within normal ranges
    2. General health suggestions or lifestyle recommendations
    3. Any recommendations to consult with healthcare professionals if needed
    
    Keep the response concise, helpful, and emphasize that this is general information, not medical diagnosis.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return response.text || "Unable to analyze vitals at this time. Please try again.";
  } catch (error) {
    console.error("Error analyzing vitals:", error);
    throw new Error("Failed to analyze vital signs. Please check your connection and try again.");
  }
}

export async function recommendActivities(moodData: MoodData): Promise<string> {
  try {
    const prompt = `As a wellness AI assistant, suggest personalized activities, exercises, or yoga poses based on this mood: "${moodData.mood}"${moodData.description ? ` with additional context: "${moodData.description}"` : ''}.
    
    Please provide 3-4 specific, actionable suggestions that would be appropriate for someone feeling this way. Include:
    1. Physical activities or exercises
    2. Mindfulness or relaxation techniques
    3. Social or creative activities if appropriate
    
    Keep suggestions practical, positive, and focused on improving wellbeing.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return response.text || "Unable to generate activity recommendations at this time. Please try again.";
  } catch (error) {
    console.error("Error recommending activities:", error);
    throw new Error("Failed to generate activity recommendations. Please check your connection and try again.");
  }
}

export async function chatWithSakhi(message: string, chatHistory?: Array<{role: string, content: string}>): Promise<string> {
  try {
    let contextPrompt = `You are Sakhi, a friendly and knowledgeable AI health assistant. You provide helpful, accurate health and wellness information while emphasizing that you're not a replacement for professional medical advice. Keep responses conversational, supportive, and informative.

User question: "${message}"`;

    if (chatHistory && chatHistory.length > 0) {
      const historyText = chatHistory
        .slice(-6) // Keep last 6 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      
      contextPrompt = `You are Sakhi, a friendly and knowledgeable AI health assistant. Here's our recent conversation:

${historyText}

User question: "${message}"

Please respond in a helpful, conversational manner while maintaining context from our discussion.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contextPrompt,
    });

    return response.text || "I'm sorry, I'm having trouble responding right now. Could you please try asking again?";
  } catch (error) {
    console.error("Error in Sakhi chat:", error);
    throw new Error("I'm experiencing some technical difficulties. Please try again in a moment.");
  }
}
