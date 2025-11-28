// ==========================
// PAYMENT PROCESSING - Page Based
// ==========================

let currentPaymentTotal = 0;
let selectedPaymentMethod = '';
let selectedCheckoutWallet = '';

function proceedToCheckout() {
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }
  
  const total = parseFloat(document.getElementById('cart-total')?.textContent || '0.00');
  showPaymentPage(total);
}

function showPaymentPage(total) {
  currentPaymentTotal = total;
  
  // Use existing navigation system
  navigateToSection('#payment');
  
  // Populate order summary
  populateOrderSummary();
  updateCheckoutWalletUI();
  
  // Reset payment method selections
  document.querySelectorAll('.payment-method-group').forEach(g => g.classList.remove('active'));
}

function populateOrderSummary() {
  const itemsList = document.getElementById('checkoutItemsList');
  const subtotalEl = document.getElementById('checkoutSubtotal');
  const totalEl = document.getElementById('checkoutTotal');
  const addressEl = document.getElementById('checkoutAddress');
  
  if (itemsList) {
    itemsList.innerHTML = '';
    cart.forEach(item => {
      const product = allProducts.find(p => p.name === item.name);
      const imgSrc = product ? getProductImage(product) : '';
      
      const itemDiv = document.createElement('div');
      itemDiv.className = 'order-item';
      itemDiv.innerHTML = `
        <img src="${imgSrc}" class="order-item-img" onerror="this.src='https://placehold.co/50x50?text=${encodeURIComponent(item.name)}'">
        <div class="order-item-info">
          <div class="order-item-name">${item.name}</div>
          <div class="order-item-qty">Qty: ${item.qty}</div>
        </div>
        <div class="order-item-price">₹${(item.price * item.qty).toFixed(2)}</div>
      `;
      itemsList.appendChild(itemDiv);
    });
  }
  
  if (subtotalEl) subtotalEl.textContent = `₹${currentPaymentTotal.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `₹${currentPaymentTotal.toFixed(2)}`;
  
  // Set delivery address
  if (addressEl) {
    const savedAddress = localStorage.getItem('currentAddress') || localStorage.getItem('deliveryAddress');
    addressEl.textContent = savedAddress || 'Please add a delivery address';
  }
}

function backToCart() {
  navigateToSection('#cart');
  updateCartUI();
}

function togglePaymentMethod(method) {
  const content = document.getElementById(`${method}-content`);
  const group = content ? content.closest('.payment-method-group') : null;
  
  document.querySelectorAll('.payment-method-group').forEach(g => {
    if (g !== group) {
      g.classList.remove('active');
    }
  });
  
  if (group) {
    group.classList.toggle('active');
    selectedPaymentMethod = group.classList.contains('active') ? method : '';
  }
}

function selectCheckoutWallet(wallet, element) {
  selectedCheckoutWallet = wallet;
  document.querySelectorAll('.wallet-item').forEach(w => w.classList.remove('selected'));
  if (element) element.classList.add('selected');
  
  const payBtn = document.getElementById('walletPayBtn');
  if (payBtn) {
    payBtn.style.display = 'block';
    payBtn.textContent = wallet === 'internal' ? 'Pay using Wallet Balance' : 'Pay with Wallet';
  }
}

function processCheckoutUPI() {
  const upiId = document.getElementById('checkoutUpiId')?.value.trim();
  
  if (!upiId) {
    showToast('Please enter UPI ID', 'error');
    return;
  }
  
  if (!upiId.includes('@')) {
    showToast('Please enter a valid UPI ID (e.g., yourupi@paytm)', 'error');
    return;
  }
  
  showToast('Processing UPI payment...', 'info');
  
  setTimeout(() => {
    completeOrder('UPI', upiId);
  }, 2000);
}

function processCheckoutCard() {
  const cardNumber = document.getElementById('checkoutCardNumber')?.value.trim();
  const cardExpiry = document.getElementById('checkoutCardExpiry')?.value.trim();
  const cardCvv = document.getElementById('checkoutCardCvv')?.value.trim();
  const cardName = document.getElementById('checkoutCardName')?.value.trim();
  
  if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
    showToast('Please fill all card details', 'error');
    return;
  }
  
  if (cardNumber.replace(/\s/g, '').length < 16) {
    showToast('Please enter a valid card number', 'error');
    return;
  }
  
  if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
    showToast('Please enter expiry in MM/YY format', 'error');
    return;
  }
  
  if (cardCvv.length !== 3 || !/^\d{3}$/.test(cardCvv)) {
    showToast('Please enter a valid 3-digit CVV', 'error');
    return;
  }
  
  showToast('Processing card payment...', 'info');
  
  setTimeout(() => {
    completeOrder('Card', `**** **** **** ${cardNumber.slice(-4)}`);
  }, 2000);
}

function processCheckoutNetBanking() {
  const bankSelect = document.getElementById('checkoutBankSelect')?.value;
  
  if (!bankSelect) {
    showToast('Please select your bank', 'error');
    return;
  }
  
  showToast('Redirecting to bank...', 'info');
  
  setTimeout(() => {
    completeOrder('Net Banking', bankSelect.toUpperCase());
  }, 2000);
}

function processCheckoutWallet() {
  if (!selectedCheckoutWallet) {
    showToast('Please select a wallet', 'error');
    return;
  }
  if (selectedCheckoutWallet === 'internal') {
    const currentUser = localStorage.getItem('currentUser');
    const walletBalance = parseFloat(localStorage.getItem(`walletBalance_${currentUser}`) || '0');
    if (walletBalance < currentPaymentTotal) {
      showToast('Insufficient wallet balance', 'error');
      return;
    }
    const newBalance = walletBalance - currentPaymentTotal;
    localStorage.setItem(`walletBalance_${currentUser}`, newBalance.toString());
    const transactions = JSON.parse(localStorage.getItem(`walletTransactions_${currentUser}`) || '[]');
    transactions.unshift({ type: 'debit', amount: currentPaymentTotal, description: 'Order Payment', date: new Date().toISOString() });
    localStorage.setItem(`walletTransactions_${currentUser}`, JSON.stringify(transactions));
    try { updateProfileUI(); } catch(e) {}
    try { loadWalletData(); } catch(e) {}
    completeOrder('Wallet Balance', 'Internal Wallet');
    return;
  }
  showToast('Processing wallet payment...', 'info');
  setTimeout(() => {
    completeOrder('Wallet', selectedCheckoutWallet);
  }, 2000);
}

function processCheckoutCOD() {
  completeOrder('Cash on Delivery', 'COD');
}

function completeOrder(paymentMethod, paymentDetails) {
  const currentUser = localStorage.getItem('currentUser');
  
  if (!currentUser) {
    openLoginModal();
    showToast('Please login to complete your order', 'info');
    return;
  }

  const orderId = 'ORD' + Date.now();
  const orderData = {
    orderId: orderId,
    items: cart.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.qty
    })),
    total: currentPaymentTotal,
    paymentMethod: paymentMethod,
    paymentDetails: paymentDetails,
    status: 'Confirmed',
    orderDate: new Date().toISOString()
  };

  const currentOrders = JSON.parse(localStorage.getItem(`currentOrders_${currentUser}`) || '[]');
  currentOrders.unshift(orderData);
  localStorage.setItem(`currentOrders_${currentUser}`, JSON.stringify(currentOrders));

  // Clear cart
  cart = [];
  saveCart();
  
  // Clear payment form inputs
  clearPaymentForms();
  
  showToast(`Order placed successfully! Order ID: ${orderId}`, 'success');
  
  // Navigate to profile orders with slight delay for toast visibility
  setTimeout(() => {
    navigateToSection('#profile');
    if (typeof showProfileTab === 'function') {
      showProfileTab('currentOrders');
    }
  }, 500);
}

function clearPaymentForms() {
  const inputs = document.querySelectorAll('.checkout-input');
  inputs.forEach(input => {
    if (input.tagName === 'SELECT') {
      input.selectedIndex = 0;
    } else {
      input.value = '';
    }
  });
  
  document.querySelectorAll('.wallet-item').forEach(w => w.classList.remove('selected'));
  const walletPayBtn = document.getElementById('walletPayBtn');
  if (walletPayBtn) walletPayBtn.style.display = 'none';
  
  selectedCheckoutWallet = '';
}

function updateCheckoutWalletUI() {
  const currentUser = localStorage.getItem('currentUser');
  const walletBalance = parseFloat(localStorage.getItem(`walletBalance_${currentUser}`) || '0');
  const balEl = document.getElementById('checkoutWalletBalance');
  if (balEl) balEl.textContent = walletBalance.toFixed(2);
  const payBtn = document.getElementById('walletPayBtn');
  if (payBtn) {
    const insufficient = walletBalance < currentPaymentTotal;
    payBtn.disabled = insufficient && selectedCheckoutWallet === 'internal';
    if (selectedCheckoutWallet === 'internal') {
      payBtn.textContent = insufficient ? 'Insufficient wallet balance' : 'Pay using Wallet Balance';
    }
  }
}

function changeDeliveryAddress() {
  navigateToSection('#address');
}

// Keep old modal functions for backward compatibility (but they redirect to page)
function showPaymentOptions(total) {
  showPaymentPage(total);
}

function closePaymentOptions() {
  backToCart();
}

function closePaymentDetails() {
  backToCart();
}
