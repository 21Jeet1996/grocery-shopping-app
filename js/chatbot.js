// ==========================
// 🔹 CHATBOT FUNCTIONALITY
// ==========================

function toggleChatbot() {
  const chatbotWindow = document.getElementById('chatbotWindow');
  const chatbotToggle = document.getElementById('chatbotToggle');
  
  if (!chatbotWindow) return;

  const isHidden = chatbotWindow.style.display === 'none' || chatbotWindow.style.display === '';
  
  if (isHidden) {
    // Open Chat
    chatbotWindow.style.display = 'flex';
    if (chatbotToggle) {
      chatbotToggle.style.display = 'none'; // Hide the toggle button when chat is open
    }
    // Focus input
    setTimeout(() => document.getElementById('chatbotInput')?.focus(), 100);
  } else {
    // Close Chat
    chatbotWindow.style.display = 'none';
    if (chatbotToggle) {
      chatbotToggle.style.display = 'flex'; // Show the toggle button when chat is closed
    }
  }
}

// Close when clicking outside
document.addEventListener('click', function(event) {
  const chatbotWindow = document.getElementById('chatbotWindow');
  const chatbotToggle = document.getElementById('chatbotToggle');
  
  if (chatbotWindow && chatbotWindow.style.display === 'flex') {
    // If clicking outside the window and NOT on the toggle button (though toggle is hidden now, good to be safe)
    if (!chatbotWindow.contains(event.target) && (!chatbotToggle || !chatbotToggle.contains(event.target))) {
      closeChatbot();
    }
  }
});

function closeChatbot() {
  const chatbotWindow = document.getElementById('chatbotWindow');
  const chatbotToggle = document.getElementById('chatbotToggle');
  
  if (chatbotWindow) chatbotWindow.style.display = 'none';
  if (chatbotToggle) chatbotToggle.style.display = 'flex'; // Show the toggle button again
}

function sendChatbotMessage() {
  const input = document.getElementById('chatbotInput');
  const messagesContainer = document.getElementById('chatbotMessages');
  const typingIndicator = document.getElementById('chatbotTyping');
  
  if (!input || !messagesContainer) return;
  
  const message = input.value.trim();
  if (!message) return;
  
  // User Message
  const userMessage = document.createElement('div');
  userMessage.className = 'chatbot-message user';
  userMessage.innerHTML = `<p>${message}</p>`;
  messagesContainer.appendChild(userMessage);
  
  input.value = '';
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Show Typing
  if (typingIndicator) {
    typingIndicator.style.display = 'flex';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Bot Response Simulation
  setTimeout(() => {
    if (typingIndicator) typingIndicator.style.display = 'none';

    const botMessage = document.createElement('div');
    botMessage.className = 'chatbot-message bot';
    
    const responses = {
      'hello': 'Hi there! How can I assist you today?',
      'hi': 'Hello! Welcome to Grain\'s Mart.',
      'help': 'I can help you with order tracking, product search, or payment issues.',
      'order': 'You can track your active orders in the Profile section.',
      'track': 'Go to Profile > Track Order to see live status.',
      'payment': 'We accept UPI, Cards, and Cash on Delivery.',
      'return': 'Returns are accepted within 24 hours for perishables.',
      'offer': 'Check out the "Offers" section on the home page for latest deals!',
      'default': 'I see. Could you please elaborate? You can also contact our human support.'
    };
    
    const lowerMessage = message.toLowerCase();
    let response = responses.default;
    
    for (const key in responses) {
      if (lowerMessage.includes(key)) {
        response = responses[key];
        break;
      }
    }
    
    botMessage.innerHTML = `<p>${response}</p>`;
    messagesContainer.appendChild(botMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
  }, 1500); // Realistic delay
}

function handleChatbotKeyPress(event) {
  if (event.key === 'Enter') {
    sendChatbotMessage();
  }
}

function contactSupport(type) {
  if (type === 'phone') {
    showToast('Calling support... 1800-XXX-XXXX', 'info');
  } else if (type === 'email') {
    showToast('Opening email client...', 'info');
  }
}

function showFAQs() {
  showToast('Opening FAQs...', 'info');
}

function showHelpTopic(topic) {
  const topics = {
    'delivery': 'Delivery usually takes 10-20 minutes. Free delivery on orders above ₹500.',
    'returns': 'You can return items within 7 days of delivery. Contact support for assistance.',
    'payment': 'We accept all major payment methods. Payment issues? Contact our support team.',
    'account': 'Need help with your account? You can update your profile in the Account Details section.'
  };
  
  showToast(topics[topic] || 'Loading help information...', 'info');
}
