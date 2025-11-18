// ==========================
// 🔹 CHATBOT FUNCTIONALITY
// ==========================

function toggleChatbot() {
  const chatbotWindow = document.getElementById('chatbotWindow');
  const chatbotToggle = document.getElementById('chatbotToggle');
  
  if (chatbotWindow && chatbotToggle) {
    // Check current computed style or inline style
    const isVisible = chatbotWindow.style.display === 'flex' || getComputedStyle(chatbotWindow).display === 'flex';
    
    if (!isVisible) {
      chatbotWindow.style.display = 'flex';
      chatbotToggle.style.display = 'none';
    } else {
      chatbotWindow.style.display = 'none';
      chatbotToggle.style.display = 'flex';
    }
  }
}

// Expose close function specifically for the close button
function closeChatbot() {
  const chatbotWindow = document.getElementById('chatbotWindow');
  const chatbotToggle = document.getElementById('chatbotToggle');
  if (chatbotWindow) chatbotWindow.style.display = 'none';
  if (chatbotToggle) chatbotToggle.style.display = 'flex';
}

function sendChatbotMessage() {
  const input = document.getElementById('chatbotInput');
  const messagesContainer = document.getElementById('chatbotMessages');
  
  if (!input || !messagesContainer) return;
  
  const message = input.value.trim();
  if (!message) return;
  
  const userMessage = document.createElement('div');
  userMessage.className = 'chatbot-message user';
  userMessage.innerHTML = `<p>${message}</p>`;
  messagesContainer.appendChild(userMessage);
  
  input.value = '';
  
  setTimeout(() => {
    const botMessage = document.createElement('div');
    botMessage.className = 'chatbot-message bot';
    
    const responses = {
      'hello': 'Hi there! How can I assist you today?',
      'help': 'I can help you with orders, products, or any questions you have!',
      'order': 'You can track your orders in the Profile section under Current Orders.',
      'delivery': 'We offer express delivery in 10-20 minutes for orders in your area!',
      'payment': 'We accept UPI, Cards, Net Banking, Wallets, and Cash on Delivery.',
      'default': 'Thank you for your message! Our support team will get back to you soon.'
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
  }, 1000);
  
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
