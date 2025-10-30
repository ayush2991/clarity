const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const summarizeButton = document.getElementById('summarize-button');
const summaryPanelLeft = document.getElementById('summary-panel-left');
const summaryContent = document.getElementById('summary-content');
const chatCol = document.getElementById('chat-col');
const personalitySelect = document.getElementById('personality-select');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

// Dark mode functionality
const currentTheme = localStorage.getItem('theme');

function applyTheme(theme) {
    document.body.classList.toggle('dark-mode', theme === 'dark');
    // Update icon based on theme
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Apply saved theme or detect system preference
if (currentTheme) {
    applyTheme(currentTheme);
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
} else {
    applyTheme('light');
}

themeToggle.addEventListener('click', () => {
    let theme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(theme);
    localStorage.setItem('theme', theme);
});

// The conversation history is stored in-memory and is not persisted. 
// On page load/new session, the history is cleared. To avoid user confusion 
// from browser session restoration, we explicitly clear the chat UI.
chatHistory.innerHTML = '';
let conversationHistory = [];

const converter = new showdown.Converter();

function addMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender + '-message');

    if (sender === 'ai') {
        messageElement.innerHTML = converter.makeHtml(message);
    } else {
        messageElement.innerText = message;
    }

    chatHistory.appendChild(messageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

async function handleUserInput() {
    const userMessage = userInput.value;
    // Extract personality without emoji (e.g., "💙 Empathetic" -> "Empathetic")
    const selectedPersonalityRaw = personalitySelect.value;
    const selectedPersonality = selectedPersonalityRaw.split(' ').slice(1).join(' ') || selectedPersonalityRaw;

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
                history: conversationHistory.slice(0, -1), // Send history without the current message
                personality: selectedPersonality
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

async function handleSummarize() {
    // Disable input and buttons
    userInput.disabled = true;
    sendButton.disabled = true;
    summarizeButton.disabled = true;

    // Show summary panel
    summaryPanelLeft.style.display = 'block';

    try {
        const response = await fetch('/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ history: conversationHistory })
        });

        if (response.ok) {
            const summary = await response.text();
            summaryContent.innerText = summary;
        } else {
            summaryContent.innerText = 'Sorry, something went wrong. Please try again later.';
        }
    } catch (error) {
        console.error('Error calling summarize function:', error);
        summaryContent.innerText = 'Sorry, something went wrong. Please try again later.';
    }
}

sendButton.addEventListener('click', handleUserInput);
summarizeButton.addEventListener('click', handleSummarize);

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