// ==========================
// 🔹 OFFERS & PROMOTIONS
// ==========================

function applyOffer(code) {
  const offerCode = code.toUpperCase().trim();
  
  if (!offerCode) {
    showToast('Please enter an offer code', 'error');
    return;
  }

  const validOffers = ['FRUIT50', 'DRINK3', 'DAIRY20'];
  
  if (validOffers.includes(offerCode)) {
    localStorage.setItem('activeOffer', offerCode);
    updateCart();
    
    const offerMessages = {
      'FRUIT50': '50% off on fruits applied!',
      'DRINK3': 'Buy 2 Get 1 Free on cold drinks applied!',
      'DAIRY20': '20% off on dairy products applied!'
    };
    
    showToast(offerMessages[offerCode], 'success');
  } else {
    showToast('Invalid offer code', 'error');
  }
}

function clearOffer() {
  localStorage.removeItem('activeOffer');
  updateCart();
  showToast('Offer removed', 'info');
}

function loadOffers() {
  const offersList = document.getElementById('offersList');
  if (!offersList) return;

  const offers = [
    {
      code: 'FRUIT50',
      title: 'Fresh Fruits',
      description: 'Get 50% off on all fruits',
      badge: '50% OFF'
    },
    {
      code: 'DRINK3',
      title: 'Cold Drinks',
      description: 'Buy 2 bottles, get 1 free',
      badge: 'BUY 2 GET 1'
    },
    {
      code: 'DAIRY20',
      title: 'Dairy Products',
      description: '20% off on all dairy products',
      badge: '20% OFF'
    }
  ];

  offersList.innerHTML = offers.map(offer => `
    <div class="offer-card">
      <div class="offer-badge">${offer.badge}</div>
      <h3>${offer.title}</h3>
      <p>${offer.description}</p>
      <span class="offer-code">Code: ${offer.code}</span>
      <button class="apply-offer-btn" onclick="applyOffer('${offer.code}')">Apply Offer</button>
    </div>
  `).join('');
}
