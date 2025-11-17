// ==========================
// 🔹 PAYMENT PROCESSING
// ==========================

let currentPaymentTotal = 0;
let selectedPaymentMethod = '';
let selectedWallet = '';

function proceedToCheckout() {
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }
  
  const total = parseFloat($('#cart-total')?.textContent || '0.00');
  showPaymentOptions(total);
}

function showPaymentOptions(total) {
  currentPaymentTotal = total;
  $('#paymentTotal').textContent = total.toFixed(2);
  $('#paymentOptionsModal').style.display = 'block';
}

function closePaymentOptions() {
  $('#paymentOptionsModal').style.display = 'none';
}

function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
  closePaymentOptions();
  showPaymentDetails(method);
}

function showPaymentDetails(method) {
  $$('.payment-form').forEach(form => form.style.display = 'none');
  
  const titles = {
    'upi': 'UPI Payment',
    'card': 'Card Payment',
    'netbanking': 'Net Banking',
    'wallet': 'Wallet Payment',
    'cod': 'Cash on Delivery'
  };
  
  $('#paymentDetailsTitle').textContent = titles[method] || 'Payment Details';
  
  $('#upiAmount').textContent = currentPaymentTotal.toFixed(2);
  $('#cardAmount').textContent = currentPaymentTotal.toFixed(2);
  $('#netbankingAmount').textContent = currentPaymentTotal.toFixed(2);
  $('#walletAmount').textContent = currentPaymentTotal.toFixed(2);
  $('#codAmount').textContent = currentPaymentTotal.toFixed(2);
  
  const formMap = {
    'upi': 'upiPaymentForm',
    'card': 'cardPaymentForm',
    'netbanking': 'netbankingPaymentForm',
    'wallet': 'walletPaymentForm',
    'cod': 'codPaymentForm'
  };
  
  const formId = formMap[method];
  if (formId) {
    $('#' + formId).style.display = 'block';
  }
  
  $('#paymentDetailsModal').style.display = 'block';
}

function closePaymentDetails() {
  $('#paymentDetailsModal').style.display = 'none';
  $$('.payment-input').forEach(input => input.value = '');
  selectedWallet = '';
  $$('.wallet-option').forEach(option => option.style.borderColor = '#e0e0e0');
}

function backToPaymentOptions() {
  closePaymentDetails();
  showPaymentOptions(currentPaymentTotal);
}

function selectWallet(wallet) {
  selectedWallet = wallet;
  $$('.wallet-option').forEach(option => option.style.borderColor = '#e0e0e0');
  const payBtn = document.querySelector('#walletPaymentForm .pay-btn');
  const options = $$('.wallet-option');
  options.forEach(opt => {
    if ((opt.querySelector('span')?.textContent || '').toLowerCase().includes(wallet)) {
      opt.style.borderColor = '#667eea';
    }
  });
  if (payBtn) payBtn.style.display = 'block';
}

function processUPIPayment() {
  const upiId = $('#upiId')?.value.trim();
  
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

function processCardPayment() {
  const cardNumber = $('#cardNumber')?.value.trim();
  const cardExpiry = $('#cardExpiry')?.value.trim();
  const cardCvv = $('#cardCvv')?.value.trim();
  const cardName = $('#cardName')?.value.trim();
  
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

function processNetBankingPayment() {
  const bankSelect = $('#bankSelect')?.value;
  
  if (!bankSelect) {
    showToast('Please select your bank', 'error');
    return;
  }
  
  showToast('Redirecting to bank...', 'info');
  
  setTimeout(() => {
    completeOrder('Net Banking', bankSelect.toUpperCase());
  }, 2000);
}

function processWalletPayment() {
  if (!selectedWallet) {
    showToast('Please select a wallet', 'error');
    return;
  }
  
  showToast('Processing wallet payment...', 'info');
  
  setTimeout(() => {
    completeOrder('Wallet', selectedWallet);
  }, 2000);
}

function processCODPayment() {
  completeOrder('Cash on Delivery', 'COD');
}

function completeOrder(paymentMethod, paymentDetails) {
  const currentUser = localStorage.getItem('currentUser');
  
  if (!currentUser) {
    closePaymentDetails();
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
    status: 'Pending',
    orderDate: new Date().toISOString()
  };

  const currentOrders = JSON.parse(localStorage.getItem(`currentOrders_${currentUser}`) || '[]');
  currentOrders.unshift(orderData);
  localStorage.setItem(`currentOrders_${currentUser}`, JSON.stringify(currentOrders));

  cart = [];
  saveCart();

  closePaymentDetails();
  
  showToast(`Order placed successfully! Order ID: ${orderId}`, 'success');
  
  navigateToSection('#profile');
  showProfileTab('currentOrders');
}
