const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

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

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMessage })
            });

            if (response.ok) {
                const aiResponse = await response.text();
                addMessage(aiResponse, 'ai');
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
    addMessage("Hello, I'm here to listen. How are you feeling today?", 'ai');
}, 1000);