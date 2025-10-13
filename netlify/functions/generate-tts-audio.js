const { GoogleGenerativeAI } = require("@google/genai");

// The API key is securely retrieved from Netlify environment variables
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        // Parse the data sent from your frontend
        const { text_to_speak, model, voice } = JSON.parse(event.body);

        if (!text_to_speak) {
            return { statusCode: 400, body: "Missing text_to_speak parameter" };
        }

        // Call the secure Gemini API from the serverless function
        const response = await ai.models.generateContent({
            model: model,
            contents: text_to_speak,
            config: {
                responseMimeType: "audio/wav", 
                responseModality: "AUDIO",
                speechConfig: {
                    voice: {
                        name: voice, 
                    }
                }
            }
        });

        const audioData = response.audio.audioContent; // Base64 audio data

        return {
            statusCode: 200,
            // Return the base64 audio content to the frontend
            body: JSON.stringify({ audioContent: audioData }), 
        };

    } catch (error) {
        console.error("Serverless TTS API error:", error);
        // Return the specific error from the Gemini API if possible
        const errorBody = {
            error: "Failed to generate audio via serverless function.",
            details: error.message 
        };
        return {
            statusCode: 500,
            body: JSON.stringify(errorBody),
        };
    }
};