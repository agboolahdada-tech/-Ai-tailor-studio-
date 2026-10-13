import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));

function requireApiKey(res) {
  if (!process.env.OPENAI_API_KEY) {
    res.status(503).json({ error: "The AI service is not connected yet. Add your OPENAI_API_KEY as a server secret, then restart the app." });
    return false;
  }
  return true;
}

async function openAIRequest(endpoint, body) {
  const response = await fetch(`https://api.openai.com/v1/${endpoint}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || "AI request failed. Check your API account and settings.";
    throw new Error(message);
  }
  return data;
}

app.post("/api/advice", async (req, res) => {
  if (!requireApiKey(res)) return;
  const question = String(req.body?.question || "").trim().slice(0, 4000);
  if (!question) return res.status(400).json({ error: "Please enter a fashion question." });
  try {
    const data = await openAIRequest("responses", {
      model: "gpt-4.1-mini",
      instructions: "You are Studio Stylist, a friendly and practical fashion design assistant for tailors and clothing lovers. Give useful, clear advice on silhouettes, fabric, colour matching, modest styling, garment construction ideas and finishing. Keep answers concise and remind users to verify measurements and fabric suitability before cutting. Do not claim to provide exact body measurements unless the user supplies them.",
      input: question
    });
    const answer = data.output_text || "I couldn't create an answer this time. Please try again.";
    res.json({ answer });
  } catch (error) {
    console.error("Advice API error:", error.message);
    res.status(502).json({ error: error.message });
  }
});

app.post("/api/design", async (req, res) => {
  if (!requireApiKey(res)) return;
  const { description = "", category = "Fashion", occasion = "Everyday", colour = "", fabric = "", modest = true } = req.body || {};
  const cleanDescription = String(description).trim().slice(0, 1800);
  if (!cleanDescription) return res.status(400).json({ error: "Please describe the outfit first." });
  const prompt = [
    "Create a polished fashion concept image for a clothing designer's moodboard.",
    `Category: ${String(category).slice(0, 100)}.`,
    `Occasion: ${String(occasion).slice(0, 100)}.`,
    `Outfit brief: ${cleanDescription}.`,
    colour ? `Preferred main colour: ${String(colour).slice(0, 100)}.` : "",
    fabric ? `Suggested fabric: ${String(fabric).slice(0, 100)}.` : "",
    modest ? "Keep the outfit modest, comfortable, and non-revealing." : "",
    "Show the complete outfit clearly, professional fashion editorial lighting, tasteful neutral studio background, high-quality garment details, no words or labels in the image. This is a concept, not a technical sewing pattern."
  ].filter(Boolean).join(" ");

  try {
    const data = await openAIRequest("images/generations", {
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      quality: "medium",
      n: 1
    });
    const image = data.data?.[0]?.b64_json;
    if (!image) throw new Error("The image service returned no image. Please try again.");
    res.json({
      image,
      details: `Concept brief: ${cleanDescription}\nCategory: ${category}\nOccasion: ${occasion}${colour ? `\nMain colour: ${colour}` : ""}${fabric ? `\nFabric idea: ${fabric}` : ""}\n\nBefore cutting: confirm the client's measurements, fabric drape, lining needs and construction details.`
    });
  } catch (error) {
    console.error("Image API error:", error.message);
    res.status(502).json({ error: error.message });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true, app: "AI Tailor Studio" }));

app.listen(PORT, () => console.log(`AI Tailor Studio is running on port ${PORT}`));
