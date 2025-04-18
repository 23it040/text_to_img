require('dotenv').config();
const express = require('express');
const { GoogleGenAI, Modality } = require('@google/genai');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize the Gemini API with the API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// API endpoint for text to image generation
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Create the enhanced prompt for better image generation
    const enhancedPrompt = "Hi, can you create a image of " + prompt;

    console.log('Sending request to Gemini API with prompt:', enhancedPrompt);
    
    // Use the exact format from the working example
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: enhancedPrompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    // Process the response using the working example format
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        console.log('Text response:', part.text);
        res.json({ textResponse: part.text });
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        return res.json({ imageUrl: `data:image/png;base64,${imageData}` });
      }
    }

  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to generate image: ' + error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
}); 