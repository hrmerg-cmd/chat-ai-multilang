import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// API สำหรับ Chat AI
app.post("/api/chat", async (req, res) => {
  try {
    const { message, language } = req.body;

    const prompt = `You are a professional support AI. Reply in the same language (${language}) as the user.
User: ${message}
AI:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Sorry, there was an error connecting to AI." });
  }
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
