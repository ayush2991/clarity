const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Store conversation history in Gemini API format
let conversationHistory = [];

function addMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender + '-message');
    messageElement.innerText = message;
    chatHistory.appendChild(messageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

async function handleUserInput() {
    const userMessage = userInput.value;
    if (userMessage.trim() !== '') {
        addMessage(userMessage, 'user');
        userInput.value = '';

        // Add user message to conversation history
        conversationHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        console.log('=== SENDING REQUEST ===');
        console.log('User Message:', userMessage);
        console.log('Conversation History:', JSON.stringify(conversationHistory, null, 2));
        console.log('=======================');

        try {
            const requestBody = { 
                message: userMessage,
                history: conversationHistory.slice(0, -1) // Send history without the current message
            };

            console.log('Request Body:', JSON.stringify(requestBody, null, 2));

            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const aiResponse = await response.text();
                addMessage(aiResponse, 'ai');

                // Add AI response to conversation history
                conversationHistory.push({
                    role: 'model',
                    parts: [{ text: aiResponse }]
                });

                console.log('=== RECEIVED RESPONSE ===');
                console.log('AI Response:', aiResponse);
                console.log('Updated History:', JSON.stringify(conversationHistory, null, 2));
                console.log('=========================');
            } else {
                addMessage('Sorry, something went wrong. Please try again later.', 'ai');
            }
        } catch (error) {
            console.error('Error calling chat function:', error);
            addMessage('Sorry, something went wrong. Please try again later.', 'ai');
        }
    }
}

sendButton.addEventListener('click', handleUserInput);

userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleUserInput();
    }
});

// Initial AI message
setTimeout(() => {
    const initialMessage = "Hello, I'm here to listen. How are you feeling today?";
    addMessage(initialMessage, 'ai');
    
    // Add initial message to conversation history
    conversationHistory.push({
        role: 'model',
        parts: [{ text: initialMessage }]
    });
}, 1000);