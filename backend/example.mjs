import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import 'dotenv/config';
import { spawn } from 'child_process';


const app = express();
const openai = new OpenAI();


app.use(cors()); 
app.use(express.json()); 

// Run Python CNN
function runCNNModel(imagePath) {
  return new Promise((resolve, reject) => {
    // const pythonProcess = spawn('python3', ['../ml/scripts/predict.py', imagePath]);
    
    // Simulating python processing time
    setTimeout(() => {
      resolve("Mild Atopic Dermatitis (Eczema)");
    }, 1000); 
  });
}

// API route
app.post('/api/diagnose', async (req, res) => {
  try {
    const imagePath = req.body.imagePath || "dummy_image_path.jpg";
    console.log(`[Server] Received request to diagnose image: ${imagePath}`);

    // Run ML model
    console.log("[Server] Running CNN Model...");
    const cnnDiagnosis = await runCNNModel(imagePath);


    console.log(`[Server] Asking OpenAI about: ${cnnDiagnosis}...`);
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a dermatology assistant. You will receive a skin diagnosis from a CNN model. You must respond in valid JSON format with exactly three keys: 'diagnosis', 'simple_explanation', and 'recommended_action'."
        },
        {
          role: "user",
          content: `The CNN model diagnosed this skin image as: ${cnnDiagnosis}. Please provide details.`
        }
      ]
    });

    // Parse JSON
    const jsonObject = JSON.parse(chatCompletion.choices[0].message.content);
    console.log("[Server] Success! Sending JSON to frontend.");

    res.json(jsonObject);

  } catch (error) {
    console.error("[Server] Error:", error.message);
    res.status(500).json({ error: "Failed to generate diagnosis." });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server is running and listening on http://localhost:${PORT}`);
});