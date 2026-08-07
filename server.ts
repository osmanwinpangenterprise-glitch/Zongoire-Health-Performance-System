import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini AI Client
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      system: "Zongoire Sub-District Health Performance Monitoring System",
      timestamp: new Date().toISOString(),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Gemini AI M&E Officer Narrative Analysis API
  app.post("/api/gemini/analyze-report", async (req, res) => {
    try {
      const ai = getAiClient();
      if (!ai) {
        return res.status(400).json({
          error: "GEMINI_API_KEY environment variable is missing or not configured.",
        });
      }

      const { period, year, facilityData, overallScore, topFacility, lowestFacility, alerts } = req.body;

      const systemInstruction = `You are a Senior Monitoring and Evaluation (M&E) Officer for the Ghana Health Service (GHS), specifically monitoring the Zongoire Sub-District in the Bawku West District, Upper East Region.
Your role is to transform routine DHIMS2 performance metrics, EPI coverage, disease surveillance data, maternal health stats, and facility rankings into an official, professional M&E narrative report.
Use official Ghana Health Service tone, M&E terminology (e.g. catchment coverage, dropout rate, left-outs, skilled delivery rate, IPT coverage, disease burden, data quality audit).
Structure your response cleanly using Markdown headings, bullet points, and actionable recommendations.`;

      const prompt = `Generate an Official Ghana Health Service M&E Review & Narrative Report for Zongoire Sub-District.

Reporting Context:
- Period: ${period || "Monthly Review"} (${year || "2026"})
- Total Facilities Monitored: 4 (Zongoire Health Centre, Zongoire CHPS, Apodabogo CHPS, Dagunga CHPS)
- Overall Sub-District Performance Score: ${overallScore || "78"}%
- Top Performing Facility: ${topFacility || "Zongoire Health Centre"}
- Lowest Performing Facility: ${lowestFacility || "Dagunga CHPS"}
- Active Critical Alerts Count: ${alerts?.length || 0}

Data Overview Summary:
${JSON.stringify(facilityData || {}, null, 2)}

Please generate the report with the following structured sections:
1. **Executive Summary**: Overview of sub-district health performance for the period.
2. **Key Achievements**: Notable successes in EPI immunization, maternal health, or disease surveillance.
3. **Underperforming Indicators & Coverage Gaps**: Specific facilities, coverage bottlenecks, Penta1 vs Penta3 or MR1 dropout rates, ANC4/8 gaps, or low skilled delivery rates.
4. **Disease Surveillance & Burden Ranking**: Insights on top causes of morbidity (Malaria, URTI, Diarrhoea, Typhoid, etc.) and outbreak risk alerts.
5. **Facility Rankings & Comparative Performance**: Summary of Zongoire HC vs the 3 CHPS compounds.
6. **Strategic M&E Recommendations & Action Points**: 4-5 concrete, prioritized actionable steps for the Sub-District Health Management Team (SDHMT) and community health officers.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reportNarrative = response.text || "Unable to generate M&E narrative report.";
      return res.json({ success: true, report: reportNarrative });
    } catch (error: any) {
      console.error("Error generating M&E report with Gemini:", error);
      return res.status(500).json({
        error: "Failed to generate AI M&E Officer Report",
        details: error?.message || String(error),
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ZSHPMS] Express Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
