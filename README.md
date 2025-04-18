# Text2Image - AI Text to Image Generator

A modern web application that uses Google's Gemini API to generate images from text prompts. This project includes a stylish, animated frontend and a Node.js backend with Gemini API integration.

## Features

- Text to image generation using Google's Gemini API
- Modern, responsive UI with animations
- Light and dark mode support
- "Star" feature to save favorite generated images
- Image download functionality
- Sharing capabilities

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express
- **API**: Google Gemini AI (gemini-2.0-flash-exp-image-generation model)

## Prerequisites

- Node.js (v14 or higher)
- A Google API key with access to the Gemini API

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/text-image.git
   cd text-image
   ```

2. Install the dependencies:
   ```
   npm install
   ```
   
   This will install all required packages including:
   - express
   - dotenv
   - cors
   - body-parser
   - @google/generative-ai
   
   If you need to install the Google Generative AI package separately:
   ```
   npm install @google/generative-ai
   ```

3. Configure your environment variables:
   - Create a `.env` file in the root directory
   - Add your Gemini API key: `GEMINI_API_KEY=your-api-key-here`

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
text-image/
├── public/               # Static files
│   ├── css/              # CSS styles
│   │   └── styles.css    # Main stylesheet
│   ├── js/               # JavaScript files
│   │   └── main.js       # Main frontend script
│   └── index.html        # Main HTML file
├── server.js             # Node.js server and API routes
├── package.json          # Project dependencies
├── .env                  # Environment variables (create this file)
└── README.md             # Project documentation
```

## API Endpoints

- `POST /api/generate-image` - Generate an image from a text prompt
  - Request body: `{ "prompt": "Your text prompt here" }`
  - Response: `{ "imageData": "base64 encoded image" }`

## Customization

- Modify `public/css/styles.css` to change the appearance of the application
- Edit `public/js/main.js` to modify frontend behavior
- Update `server.js` to add new API endpoints or modify backend functionality

## Note on Gemini API

This project uses Google's Gemini API for text-to-image generation. You will need to:

1. Sign up for a Google AI Studio account
2. Create an API key with access to the Gemini models
3. Make sure you have access to the `gemini-2.0-flash-exp-image-generation` model
4. Add your API key to the `.env` file

## License

[MIT License](LICENSE)

## Acknowledgements

- Google Gemini API for image generation capabilities
- Font Awesome for icons
- Google Fonts for typography 