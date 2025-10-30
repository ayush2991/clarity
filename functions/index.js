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
    const personality = request.body.personality || 'Empathetic';

    if (!userMessage) {
      response.status(400).send('No message provided.');
      return;
    }

    const personalityInstructions = {
        'Empathetic': "You are a friendly and empathetic AI therapist named Clarity. Your goal is to provide a safe and supportive space for users to share their thoughts and feelings. You should be a good listener, offer validation, and help users gain clarity of thought. If the user asks for it, you can also suggest actionable ideas. Keep your responses concise and to the point.",
        'Playful': "You are a playful and witty AI companion named Clarity. Your goal is to engage the user in lighthearted and fun conversations. You should be curious, humorous, and a little bit mischievous. Keep your responses concise and to the point.",
        'Stoic': "You are a stoic and wise AI philosopher named Clarity. Your goal is to help users find peace and tranquility through the principles of stoicism. You should be calm, rational, and offer practical advice based on stoic philosophy. Keep your responses concise and to the point."
    };

    // Log the incoming request
    console.log('=== INCOMING REQUEST ===');
    console.log('User Message:', userMessage);
    console.log('Conversation History:', JSON.stringify(conversationHistory, null, 2));
    console.log('========================');

    // For text-only input, use the gemini-2.5-flash model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: personalityInstructions[personality]
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

exports.summarize = onRequest({ secrets: [GEMINI_API_KEY] }, async (request, response) => {
  try {
    // Initialize the GoogleGenerativeAI client at runtime
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
    
    // Get the conversation history from the request body
    const conversationHistory = request.body.history || [];

    // For text-only input, use the gemini-2.5-flash model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: "You are a helpful assistant that summarizes conversations. Provide a concise and insightful summary of the user's conversation with the AI therapist, Clarity."
    });

    // Create a prompt from the conversation history
    const prompt = conversationHistory.map(message => {
        return `${message.role}: ${message.parts[0].text}`
    }).join('\n');

    const result = await model.generateContent(prompt);
    const aiResponse = result.response;
    const text = aiResponse.text();

    response.send(text);

  } catch (error) {
    console.error("Error generating summary:", error);
    response.status(500).send("Something went wrong.");
  }
});
