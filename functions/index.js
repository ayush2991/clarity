const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require('firebase-functions/params');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Declare the GEMINI_API_KEY as a Secret managed by Firebase
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

exports.chat = onRequest({ secrets: [GEMINI_API_KEY] }, async (request, response) => {
  try {
    // Initialize the GoogleGenerativeAI client at runtime
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
    
    // Get the user's message from the request body
    const userMessage = request.body.message;

    if (!userMessage) {
      response.status(400).send('No message provided.');
      return;
    }

    // For text-only input, use the gemini-2.5-flash model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a friendly and empathetic AI therapist named Clarity. Your goal is to provide a safe and supportive space for users to share their thoughts and feelings. You should be a good listener, offer validation, and help users gain clarity of thought. If the user asks for it, you can also suggest actionable ideas.

    User: ${userMessage}
    Clarity:`;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    const text = aiResponse.text();

    response.send(text);

  } catch (error) {
    console.error("Error generating content:", error);
    response.status(500).send("Something went wrong.");
  }
});
