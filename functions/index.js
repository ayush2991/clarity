const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require('firebase-functions/params');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Declare the GEMINI_API_KEY as a Secret managed by Firebase
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

exports.chat = onRequest({ secrets: [GEMINI_API_KEY] }, async (request, response) => {
  try {
    // Initialize the GoogleGenerativeAI client at runtime
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
    
    // Get the user's message and conversation history from the request body
    const userMessage = request.body.message;
    const conversationHistory = request.body.history || [];

    if (!userMessage) {
      response.status(400).send('No message provided.');
      return;
    }

    // Log the incoming request
    console.log('=== INCOMING REQUEST ===');
    console.log('User Message:', userMessage);
    console.log('Conversation History:', JSON.stringify(conversationHistory, null, 2));
    console.log('========================');

    // For text-only input, use the gemini-2.5-flash model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: "You are a friendly and empathetic AI therapist named Clarity. Your goal is to provide a safe and supportive space for users to share their thoughts and feelings. You should be a good listener, offer validation, and help users gain clarity of thought. If the user asks for it, you can also suggest actionable ideas."
    });

    // Start a chat session with history
    const chat = model.startChat({
      history: conversationHistory,
    });

    // Log the request being sent to Gemini
    console.log('=== GEMINI API REQUEST ===');
    console.log('Model: gemini-2.5-flash');
    console.log('History:', JSON.stringify(conversationHistory, null, 2));
    console.log('New Message:', userMessage);
    console.log('==========================');

    const result = await chat.sendMessage(userMessage);
    const aiResponse = result.response;
    const text = aiResponse.text();

    // Log the response from Gemini
    console.log('=== GEMINI API RESPONSE ===');
    console.log('Response Text:', text);
    console.log('===========================');

    response.send(text);

  } catch (error) {
    console.error("Error generating content:", error);
    response.status(500).send("Something went wrong.");
  }
});
