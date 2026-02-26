require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());


app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) return res.status(400).json({ reply: "No message provided" });
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("Missing API Key");
      return res.status(500).json({ reply: "API Key setup missing on server." });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", 
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are AgriSense AI. Reply in the SAME language the user uses (Hindi or English). Keep answers short, clear, and agricultural-focused." 
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      console.error("OpenRouter Error:", data);
      res.json({ reply: "I am having trouble connecting to my brain. Please try again." });
    }

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ reply: "Server error! Check your connection." });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server live at http://localhost:${PORT}`));