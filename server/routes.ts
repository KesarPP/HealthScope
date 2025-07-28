import type { Express } from "express";
import { createServer, type Server } from "http";
import { analyzeVitals, recommendActivities, chatWithSakhi, findNearbyHospitals, type VitalsData, type MoodData } from "./services/gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // Vitals analysis endpoint
  app.post("/api/vitals/analyze", async (req, res) => {
    try {
      const vitalsData: VitalsData = req.body;
      
      // Validate that at least one vital sign is provided
      const hasVitals = Object.values(vitalsData).some(value => value !== undefined && value !== null);
      
      if (!hasVitals) {
        return res.status(400).json({ 
          message: "Please provide at least one vital sign measurement" 
        });
      }

      const analysis = await analyzeVitals(vitalsData);
      
      res.json({ 
        vitals: vitalsData,
        analysis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Vitals analysis error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to analyze vitals" 
      });
    }
  });

  // Mood-based activity recommendations endpoint
  app.post("/api/mood/recommendations", async (req, res) => {
    try {
      const moodData: MoodData = req.body;
      
      if (!moodData.mood) {
        return res.status(400).json({ 
          message: "Please provide your current mood" 
        });
      }

      const recommendations = await recommendActivities(moodData);
      
      res.json({ 
        mood: moodData.mood,
        description: moodData.description,
        recommendations,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Mood recommendations error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate recommendations" 
      });
    }
  });

  // Sakhi chatbot endpoint
  app.post("/api/chat/sakhi", async (req, res) => {
    try {
      const { message, chatHistory } = req.body;
      
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ 
          message: "Please provide a valid message" 
        });
      }

      const response = await chatWithSakhi(message.trim(), chatHistory);
      
      res.json({ 
        message: message.trim(),
        response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Sakhi chat error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to get response from Sakhi" 
      });
    }
  });

  // Nearby hospitals endpoint
  app.post("/api/hospitals/nearby", async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      
      if (!latitude || !longitude || typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ 
          message: "Please provide valid latitude and longitude coordinates" 
        });
      }

      // Basic coordinate validation
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({ 
          message: "Invalid coordinates provided" 
        });
      }

      const hospitals = await findNearbyHospitals(latitude, longitude);
      
      res.json({ 
        coordinates: { latitude, longitude },
        hospitals,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Nearby hospitals error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to find nearby hospitals" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
