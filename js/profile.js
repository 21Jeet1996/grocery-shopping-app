// ==========================
// 🔹 PROFILE MANAGEMENT
// ==========================

function initDeliverTo() {
  const el = document.getElementById('deliverToText');
  let addr = localStorage.getItem('currentAddress');
  if (!addr) {
    const currentUser = localStorage.getItem('currentUser');
    const addresses = JSON.parse(localStorage.getItem(`addresses_${currentUser}`) || '[]');
    addr = addresses.find(a => a.isDefault)?.address || '';
  }
  el && (el.textContent = addr ? addr : 'Set location');
}

function chooseDeliveryLocation() {
  openAddressPage();
}

function updateProfileUI() {
  const currentUser = localStorage.getItem('currentUser');
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profileInitial = document.getElementById('profileInitial');

  if (currentUser) {
    if (profileName) profileName.textContent = currentUser;
    if (profileEmail) profileEmail.textContent = 'Logged in';
    if (profileInitial) profileInitial.textContent = currentUser.charAt(0).toUpperCase();
    
    const profileData = JSON.parse(localStorage.getItem(`profile_${currentUser}`) || '{}');
    if (profileData.fullName && profileName) {
      profileName.textContent = profileData.fullName;
    }
    if (profileData.email && profileEmail) {
      profileEmail.textContent = profileData.email;
    }
    
    updateProfileStats();
  } else {
    if (profileName) profileName.textContent = 'Guest User';
    if (profileEmail) profileEmail.textContent = 'Not logged in';
    if (profileInitial) profileInitial.textContent = 'U';
  }
}

function updateProfileStats() {
  const currentUser = localStorage.getItem('currentUser');
  const currentOrders = JSON.parse(localStorage.getItem(`currentOrders_${currentUser}`) || '[]');
  const orderHistory = JSON.parse(localStorage.getItem(`orderHistory_${currentUser}`) || '[]');
  const walletBalance = parseFloat(localStorage.getItem(`walletBalance_${currentUser}`) || '0');

  const statActiveOrders = document.getElementById('statActiveOrders');
  const statWalletBalance = document.getElementById('statWalletBalance');
  const statOrderHistory = document.getElementById('statOrderHistory');

  if (statActiveOrders) statActiveOrders.textContent = currentOrders.length;
  if (statWalletBalance) statWalletBalance.textContent = walletBalance.toFixed(2);
  if (statOrderHistory) statOrderHistory.textContent = orderHistory.length;
}

function showProfileTab(tabName) {
  // Legacy function kept for compatibility if called from other modules
  openProfilePage(tabName);
}

// 🔹 NAVIGATION & SUB-PAGES

function openProfilePage(pageName) {
  // Hide main view
  const mainView = document.getElementById('profileMainView');
  const subPages = document.getElementById('profileSubPages');
  
  if (mainView) mainView.style.display = 'none';
  if (subPages) {
    subPages.style.display = 'block';
    subPages.classList.add('active');
  }
  
  // Hide all sections first
  document.querySelectorAll('.profile-view-section').forEach(el => {
    el.style.display = 'none';
    el.classList.remove('active');
  });
  
  // Show target section
  const targetId = `profile${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Tab`;
  const targetSection = document.getElementById(targetId);
  
  if (targetSection) {
    targetSection.style.display = 'block';
    targetSection.classList.add('active');
    
    // Update title based on section
    const titleMap = {
      'currentOrders': 'Current Orders',
      'orderHistory': 'Order History',
      'track': 'Track Order',
      'wallet': 'Wallet',
      'addresses': 'Saved Addresses',
      'payment': 'Payment Methods',
      'account': 'Account Details',
      'support': 'Support & Help',
      'about': "About Grain's Mart"
    };
    
    const titleEl = document.getElementById('subPageTitle');
    if (titleEl) titleEl.textContent = titleMap[pageName] || 'Details';
    
    // Scroll to top for smooth feeling
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Load specific data
    if (pageName === 'currentOrders') loadCurrentOrders();
    else if (pageName === 'orderHistory') loadOrderHistory();
    else if (pageName === 'wallet') loadPaymentsHub();
    else if (pageName === 'addresses') loadAddresses();
    else if (pageName === 'account') renderAccountDetails();
    else if (pageName === 'payment') loadPaymentsHub();
    else if (pageName === 'support') loadSupport();
    else if (pageName === 'track') loadTrackOrderTab();
  }
}

function backToProfileMain() {
  const mainView = document.getElementById('profileMainView');
  const subPages = document.getElementById('profileSubPages');
  
  if (subPages) {
    subPages.style.display = 'none';
    subPages.classList.remove('active');
  }
  if (mainView) mainView.style.display = 'block';
}

// 🔹 DATA LOADING FUNCTIONS

function loadCurrentOrders() {
  const currentOrdersList = $('#currentOrdersList');
  if (!currentOrdersList) return;
  
  const currentUser = localStorage.getItem('currentUser');
  const orders = JSON.parse(localStorage.getItem(`currentOrders_${currentUser}`) || '[]');
  
  if (orders.length === 0) {
    currentOrdersList.innerHTML = `
      <div class="empty-state">
        <div style="font-size:48px; margin-bottom:15px; opacity:0.5;">📦</div>
        <h3 style="font-size:18px; margin:0 0 10px; color:var(--text-dark);">No active orders</h3>
        <p style="color:var(--text-gray); margin-bottom:20px;">Looks like you haven't ordered anything yet.</p>
        <button class="add-money-btn" onclick="navigateToSection('#home')" style="max-width:200px; background:var(--primary-color); color:white; border:none;">Start Shopping</button>
      </div>
    `;
    return;
  }
  
  currentOrdersList.innerHTML = orders.map(order => {
    const itemsScroll = order.items.map(item => {
      const imgUrl = item.img || createPlaceholderSVG(item.name, 100, 100);
      return `
        <div class="order-item-mini">
          <div class="order-item-img-box">
            <img src="${imgUrl}" alt="${item.name}" onerror="this.src='${createPlaceholderSVG(item.name, 100, 100)}'">
            <div class="qty-badge">${item.quantity}</div>
          </div>
          <div style="font-size: 11px; color: var(--text-gray); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</div>
        </div>
      `;
    }).join('');

    return `
    <div class="order-card-enhanced">
      <div class="order-header-enhanced">
        <div class="order-header-left">
          <h4>Order #${order.orderId}</h4>
          <p>Placed on ${new Date(order.orderDate).toLocaleDateString()}</p>
        </div>
        <span class="order-status-badge ${order.status.toLowerCase()}">${order.status}</span>
      </div>
      
      <div class="order-items-scroll">
        ${itemsScroll}
      </div>
      
      <div class="order-footer-enhanced">
        <div class="order-total-group">
          <span class="label-total">Total Amount</span>
          <span class="amount-total">₹${order.total.toFixed(2)}</span>
        </div>
        <div class="order-actions">
          <button class="action-btn btn-track" onclick="trackOrder('${order.orderId}')">Track Order</button>
        </div>
      </div>
    </div>
  `}).join('');
}

function loadOrderHistory() {
  const orderHistoryList = $('#orderHistoryList');
  if (!orderHistoryList) return;
  
  const currentUser = localStorage.getItem('currentUser');
  const orders = JSON.parse(localStorage.getItem(`orderHistory_${currentUser}`) || '[]');
  
  if (orders.length === 0) {
    orderHistoryList.innerHTML = '<p class="empty-state">No order history yet. Start shopping to see your orders here!</p>';
    return;
  }
  
  orderHistoryList.innerHTML = orders.map(order => {
    const itemsScroll = order.items.map(item => {
       const imgUrl = item.img || createPlaceholderSVG(item.name, 100, 100);
       return `
        <div class="order-item-mini">
          <div class="order-item-img-box">
            <img src="${imgUrl}" alt="${item.name}" onerror="this.src='${createPlaceholderSVG(item.name, 100, 100)}'">
            <div class="qty-badge">${item.quantity}</div>
          </div>
          <div style="font-size: 11px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</div>
        </div>
      `;
    }).join('');

    return `
    <div class="order-card-enhanced">
      <div class="order-header-enhanced">
        <div class="order-header-left">
          <h4>Order #${order.orderId}</h4>
          <p>${new Date(order.orderDate).toLocaleDateString()}</p>
        </div>
        <span class="order-status-badge ${order.status.toLowerCase()}">${order.status}</span>
      </div>
      
      <div class="order-items-scroll">
        ${itemsScroll}
      </div>
      
      <div class="order-footer-enhanced">
        <div class="order-total-group">
          <span class="label-total">Total Paid</span>
          <span class="amount-total">₹${order.total.toFixed(2)}</span>
        </div>
        <div class="order-actions">
          <button class="action-btn btn-reorder" onclick="reorder('${order.orderId}')">Buy Again</button>
        </div>
      </div>
    </div>
  `}).join('');
}

function loadWalletData() {
  const currentUser = localStorage.getItem('currentUser');
  const walletBalance = parseFloat(localStorage.getItem(`walletBalance_${currentUser}`) || '0');
  const transactions = JSON.parse(localStorage.getItem(`walletTransactions_${currentUser}`) || '[]');
  
  const walletTab = $('#profileWalletTab');
  if(!walletTab) return;

  const txHtml = transactions.length === 0 
    ? '<p class="empty-state">No transactions yet.</p>' 
    : `<div class="tx-list">
        ${transactions.map(trans => `
          <div class="tx-item">
            <div style="display:flex; align-items:center;">
              <div class="tx-icon" style="background:${trans.type === 'credit' ? '#e6fffa' : '#fff5f5'}; color:${trans.type === 'credit' ? '#00b894' : '#d63031'}">
                ${trans.type === 'credit' ? '↓' : '↑'}
              </div>
              <div class="tx-info">
                <h5>${trans.description}</h5>
                <p>${new Date(trans.date).toLocaleDateString()}</p>
              </div>
            </div>
            <span class="tx-amount ${trans.type === 'credit' ? 'credit' : 'debit'}">
              ${trans.type === 'credit' ? '+' : '-'}₹${trans.amount.toFixed(2)}
            </span>
          </div>
        `).join('')}
      </div>`;

  walletTab.innerHTML = `
    <div class="wallet-card-modern">
      <div class="wallet-balance-label">Available Balance</div>
      <div class="wallet-balance-amount">₹${walletBalance.toFixed(2)}</div>
      <div class="wallet-actions-row">
        <button class="wallet-action-btn" onclick="showAddMoneyForm()">+ Add Money</button>
        <button class="wallet-action-btn">Withdraw</button>
      </div>
    </div>
    
    <h4 style="margin: 0 0 15px 0; color:#333;">Transaction History</h4>
    ${txHtml}
  `;
}

function loadSupport() {
  const supportTab = document.getElementById('profileSupportTab');
  if (!supportTab) return;

  supportTab.innerHTML = `
    <div class="support-hero">
      <h3>How can we help you?</h3>
      <p>Our support team is available 24/7 to assist you.</p>
    </div>
    
    <div class="support-options-grid">
      <div class="support-option-card" onclick="contactSupport('phone')">
        <span class="support-opt-icon">📞</span>
        <span class="support-opt-title">Call Us</span>
      </div>
      <div class="support-option-card" onclick="toggleChatbot()">
        <span class="support-opt-icon">💬</span>
        <span class="support-opt-title">Live Chat</span>
      </div>
      <div class="support-option-card" onclick="contactSupport('email')">
        <span class="support-opt-icon">✉️</span>
        <span class="support-opt-title">Email Us</span>
      </div>
       <div class="support-option-card">
        <span class="support-opt-icon">🎫</span>
        <span class="support-opt-title">My Tickets</span>
      </div>
    </div>

    <div class="faq-section">
      <h4>Frequently Asked Questions</h4>
      <div class="faq-list">
        <div class="faq-item">
          <div class="faq-question" onclick="toggleFaq(this)">
            How do I track my order? <span>+</span>
          </div>
          <div class="faq-answer">
            You can track your order by going to the "Track Order" section in your profile or clicking "Track" on any active order card.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-question" onclick="toggleFaq(this)">
            What is the return policy? <span>+</span>
          </div>
          <div class="faq-answer">
            We accept returns within 24 hours for perishable items and 7 days for non-perishable items if they are damaged or incorrect.
          </div>
        </div>
         <div class="faq-item">
          <div class="faq-question" onclick="toggleFaq(this)">
            How do I use my wallet balance? <span>+</span>
          </div>
          <div class="faq-answer">
            Your wallet balance can be selected as a payment method during checkout. It will be automatically applied to your total.
          </div>
        </div>
      </div>
    </div>
  `;
}

function toggleFaq(el) {
  const item = el.parentElement;
  item.classList.toggle('active');
  const span = el.querySelector('span');
  span.textContent = item.classList.contains('active') ? '-' : '+';
}

function loadPaymentMethods() {
  const paymentTab = document.getElementById('profilePaymentTab');
  if (!paymentTab) return;

  const savedCards = [
    { last4: '4242', brand: 'Visa', expiry: '12/25', holder: 'John Doe' }
  ];

  paymentTab.innerHTML = `
    <h4 style="margin-bottom:20px;">Saved Cards</h4>
    <div class="saved-cards-container">
      ${savedCards.map(card => `
        <div class="credit-card-visual">
          <div class="card-chip"></div>
          <div class="card-number-display">**** **** **** ${card.last4}</div>
          <div class="card-meta">
            <div>
              <div class="card-holder-name">${card.holder}</div>
              <div class="card-expiry">EXP: ${card.expiry}</div>
            </div>
            <div class="card-brand-logo">${card.brand}</div>
          </div>
        </div>
      `).join('')}
      
      <div class="credit-card-visual" style="background: #f8f9fa; color: #2d3436; align-items:center; justify-content:center; border: 2px dashed #ccc; cursor:pointer;" onclick="showAddPaymentForm()">
        <div style="font-size:40px; color:#ccc;">+</div>
        <div style="font-weight:600;">Add New Card</div>
      </div>
    </div>

    <h4 style="margin-bottom:20px;">UPI Accounts</h4>
    <div class="upi-list">
      <div class="payment-upi-item">
        <div class="upi-logo">UPI</div>
        <div style="flex:1;">
          <div style="font-weight:600;">user@oksbi</div>
          <div style="font-size:12px; color:#666;">Google Pay</div>
        </div>
        <button class="delete-btn" style="background:none; border:none; color:#ef4444; cursor:pointer;">Remove</button>
      </div>
       <div class="payment-upi-item" style="justify-content:center; cursor:pointer; border:1px dashed #ccc;" onclick="showAddPaymentForm()">
        <span style="color:#4f46e5; font-weight:600;">+ Add New UPI ID</span>
      </div>
    </div>
  `;
}

function loadPaymentsHub() {
  const currentUser = localStorage.getItem('currentUser');
  const walletBalance = parseFloat(localStorage.getItem(`walletBalance_${currentUser}`) || '0');
  const transactions = JSON.parse(localStorage.getItem(`walletTransactions_${currentUser}`) || '[]');

  const savedCards = [
    { last4: '4242', brand: 'Visa', expiry: '12/25', holder: 'John Doe' }
  ];

  const txHtml = transactions.length === 0 
    ? '<p class="empty-state">No transactions yet.</p>' 
    : `<div class="tx-list">
        ${transactions.map(trans => `
          <div class="tx-item">
            <div style="display:flex; align-items:center;">
              <div class="tx-icon" style="background:${trans.type === 'credit' ? '#e6fffa' : '#fff5f5'}; color:${trans.type === 'credit' ? '#00b894' : '#d63031'}">
                ${trans.type === 'credit' ? '↓' : '↑'}
              </div>
              <div class="tx-info">
                <h5>${trans.description}</h5>
                <p>${new Date(trans.date).toLocaleDateString()}</p>
              </div>
            </div>
            <span class="tx-amount ${trans.type === 'credit' ? 'credit' : 'debit'}">
              ${trans.type === 'credit' ? '+' : '-'}₹${trans.amount.toFixed(2)}
            </span>
          </div>
        `).join('')}
      </div>`;

  const combinedHTML = `
    <div class="wallet-layout">
      <div class="wallet-balance-card">
        <div class="wallet-balance">
          <span class="wallet-label">Available Balance</span>
          <span class="wallet-amount">₹<span id="walletBalance">${walletBalance.toFixed(2)}</span></span>
        </div>
        <button class="add-money-btn" onclick="showAddMoneyForm()">+ Add Money</button>
      </div>

      <h4 style="margin: 20px 0 15px 0; color:#333;">Saved Cards</h4>
      <div class="saved-cards-container">
        ${savedCards.map(card => `
          <div class="credit-card-visual">
            <div class="card-chip"></div>
            <div class="card-number-display">**** **** **** ${card.last4}</div>
            <div class="card-meta">
              <div>
                <div class="card-holder-name">${card.holder}</div>
                <div class="card-expiry">EXP: ${card.expiry}</div>
              </div>
              <div class="card-brand-logo">${card.brand}</div>
            </div>
          </div>
        `).join('')}
        <div class="credit-card-visual" style="background: #f8f9fa; color: #2d3436; align-items:center; justify-content:center; border: 2px dashed #ccc; cursor:pointer;" onclick="showAddPaymentForm()">
          <div style="font-size:40px; color:#ccc;">+</div>
          <div style="font-weight:600;">Add New Card</div>
        </div>
      </div>

      <h4 style="margin: 20px 0 15px 0; color:#333;">UPI Accounts</h4>
      <div class="upi-list">
        <div class="payment-upi-item">
          <div class="upi-logo">UPI</div>
          <div style="flex:1;">
            <div style="font-weight:600;">user@oksbi</div>
            <div style="font-size:12px; color:#666;">Google Pay</div>
          </div>
          <button class="delete-btn" style="background:none; border:none; color:#ef4444; cursor:pointer;">Remove</button>
        </div>
        <div class="payment-upi-item" style="justify-content:center; cursor:pointer; border:1px dashed #ccc;" onclick="showAddPaymentForm()">
          <span style="color:#4f46e5; font-weight:600;">+ Add New UPI ID</span>
        </div>
      </div>

      <h4 style="margin: 20px 0 15px 0; color:#333;">Transaction History</h4>
      ${txHtml}
    </div>
  `;

  const paymentTab = document.getElementById('profilePaymentTab');
  const walletTab = document.getElementById('profileWalletTab');
  if (paymentTab) paymentTab.innerHTML = combinedHTML;
  if (walletTab) walletTab.innerHTML = combinedHTML;

  try { updateProfileStats(); } catch(e) {}
}

function loadTrackOrderTab() {
  const trackTab = document.getElementById('profileTrackTab');
  if (!trackTab) return;
  
  const currentUser = localStorage.getItem('currentUser');
  const currentOrders = JSON.parse(localStorage.getItem(`currentOrders_${currentUser}`) || '[]');
  
  if (currentOrders.length === 0) {
    trackTab.innerHTML = `
      <div class="empty-state">
        <div style="font-size:48px; margin-bottom:15px;">📦</div>
        <p>No active orders to track.</p>
        <button class="add-money-btn" onclick="navigateToSection('#home')" style="margin-top:20px; max-width:200px;">Start Shopping</button>
      </div>
    `;
    return;
  }

  trackTab.innerHTML = `
    <div class="track-order-header" style="text-align:left; margin-bottom:20px;">
      <h3 style="margin:0;">Select an order to track</h3>
    </div>
    <div class="track-orders-list">
      ${currentOrders.map(order => `
        <div class="order-card-enhanced" style="cursor:pointer;" onclick="openFullTracker('${order.orderId}')">
          <div class="order-header-enhanced">
            <div class="order-header-left">
              <h4>Order #${order.orderId}</h4>
              <p>Tap to view live status</p>
            </div>
            <span class="order-status-badge ${order.status.toLowerCase()}">${order.status}</span>
          </div>
          <div class="order-items-scroll" style="padding-bottom:10px;">
             ${order.items.slice(0,4).map(item => `
               <div class="order-item-img-box" style="width:50px; height:50px;">
                 <img src="${item.img || createPlaceholderSVG(item.name)}" style="padding:2px;">
               </div>
             `).join('')}
             ${order.items.length > 4 ? `<div style="display:flex; align-items:center; color:#666; font-size:12px;">+${order.items.length-4} more</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function openFullTracker(orderId) {
  const trackInput = document.getElementById('orderSearchTrackInput');
  if (trackInput) {
    trackInput.value = orderId;
    navigateToSection('#trackOrder');
    if (typeof searchOrder === 'function') {
      setTimeout(() => searchOrder(), 100);
    }
  }
}

function closeTrackOrder() {
  navigateToSection('#profile');
  openProfilePage('track');
}

function renderAccountDetails() {
  const currentUser = localStorage.getItem('currentUser');
  const view = document.getElementById('accountDetailsView');
  const form = document.getElementById('profileInfoForm');
  if (!view) return;
  
  const raw = localStorage.getItem(`profile_${currentUser}`) || '{}';
  const profile = JSON.parse(raw);

  const fullName = profile.fullName || currentUser;
  const email = profile.email || 'Not set';
  const phone = profile.phone || 'Not set';
  const dob = profile.dob || 'Not set';
  const gender = profile.gender || 'Not set';

  view.innerHTML = `
    <div class="account-hero">
      <div class="account-avatar-large">${fullName.charAt(0).toUpperCase()}</div>
      <div class="account-info-main">
        <h3>${fullName}</h3>
        <p>${email}</p>
      </div>
      <button class="edit-profile-btn-small" onclick="openAccountEdit()">✎ Edit Profile</button>
    </div>

    <div class="account-fields-grid">
      <div class="field-box">
        <div class="field-label">Full Name</div>
        <div class="field-value">${fullName}</div>
      </div>
      <div class="field-box">
        <div class="field-label">Email Address</div>
        <div class="field-value">${email}</div>
      </div>
      <div class="field-box">
        <div class="field-label">Phone Number</div>
        <div class="field-value">${phone}</div>
      </div>
      <div class="field-box">
        <div class="field-label">Date of Birth</div>
        <div class="field-value">${dob}</div>
      </div>
       <div class="field-box">
        <div class="field-label">Gender</div>
        <div class="field-value">${gender}</div>
      </div>
    </div>
    
    <div style="margin-top:30px; text-align:center;">
       <button onclick="logoutUser()" class="logout-profile-btn">Log Out</button>
    </div>
  `;
  
  if (form) form.style.display = 'none';
  view.style.display = 'block';
}

function openAccountEdit(field) {
  const currentUser = localStorage.getItem('currentUser');
  const raw = localStorage.getItem(`profile_${currentUser}`) || '{}';
  const profile = JSON.parse(raw);
  const form = document.getElementById('profileInfoForm');
  const view = document.getElementById('accountDetailsView');
  
  if (form) form.style.display = 'block';
  if (view) view.style.display = 'none';
  
  const nameEl = document.getElementById('profileFullName');
  const emailEl = document.getElementById('profileEmailInput');
  const phoneEl = document.getElementById('profilePhone');
  const dobEl = document.getElementById('profileDOB');
  const genderEl = document.getElementById('profileGender');
  
  if (nameEl) nameEl.value = profile.fullName || '';
  if (emailEl) emailEl.value = profile.email || '';
  if (phoneEl) phoneEl.value = profile.phone || '';
  if (dobEl) dobEl.value = profile.dob || '';
  if (genderEl) genderEl.value = profile.gender || '';
  
  if (field === 'fullName' && nameEl) nameEl.focus();
  if (field === 'email' && emailEl) emailEl.focus();
  if (field === 'phone' && phoneEl) phoneEl.focus();
  if (field === 'dob' && dobEl) dobEl.focus();
  if (field === 'gender' && genderEl) genderEl.focus();
}

function saveProfileInfo() {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    showToast('Please login first!', 'error');
    return;
  }
  
  const fullName = $('#profileFullName')?.value.trim();
  const email = $('#profileEmailInput')?.value.trim();
  const phone = $('#profilePhone')?.value.trim();
  const dob = $('#profileDOB')?.value.trim();
  const gender = $('#profileGender')?.value;
  
  const profileData = {
    fullName: fullName || currentUser,
    email: email || '',
    phone: phone || '',
    dob: dob || '',
    gender: gender || ''
  };
  
  localStorage.setItem(`profile_${currentUser}`, JSON.stringify(profileData));
  updateProfileUI();
  renderAccountDetails();
  showToast('Profile updated successfully!', 'success');
}

function loadAddresses() {
  const currentUser = localStorage.getItem('currentUser');
  const addressesList = $('#addressesList');
  if (!addressesList) return;
  
  const addresses = JSON.parse(localStorage.getItem(`addresses_${currentUser}`) || '[]');
  if (addresses.length === 0) {
    addressesList.innerHTML = '<p class="empty-state">No saved addresses. Add one below!</p>';
    return;
  }
  
  addressesList.innerHTML = addresses.map(addr => `
    <div class="address-card-modern">
      <div class="addr-content">
        <span class="addr-type">${addr.type || 'HOME'}</span>
        ${addr.isDefault ? '<span class="default-badge" style="font-size:11px;">DEFAULT</span>' : ''}
        
        <div class="addr-details">
          <h4>${addr.fullName} <span style="font-weight:400; font-size:13px; margin-left:8px;">${addr.phone}</span></h4>
          <p>${addr.address}</p>
        </div>
      </div>
      
      <div class="addr-actions">
        ${!addr.isDefault ? `<button onclick="setDefaultAddress(${addr.id})">Make Default</button>` : ''}
        <button onclick="editAddress(${addr.id})">Edit</button>
        <button class="delete-btn" onclick="deleteAddress(${addr.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function deleteAddress(id) {
  const currentUser = localStorage.getItem('currentUser');
  const addresses = JSON.parse(localStorage.getItem(`addresses_${currentUser}`) || '[]');
  const filtered = addresses.filter(addr => addr.id !== id);
  localStorage.setItem(`addresses_${currentUser}`, JSON.stringify(filtered));
  loadAddresses();
  showToast('Address deleted!', 'info');
}

function openAddressPage() {
  document.querySelectorAll('main section').forEach(sec => sec.style.display = 'none');
  const page = document.getElementById('addressPage');
  if (!page) return;
  page.style.display = 'block';
  
  const fields = ['addrFullName', 'addrPhone', 'addrPincode', 'addrLine1', 'addrLine2', 'addrLandmark', 'addrCity', 'addrState'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  
  const type = document.getElementById('addrType');
  const def = document.getElementById('addrDefault');
  if(type) type.value = 'Home';
  if(def) def.checked = true;
  window.editingAddressId = null;
}

function closeAddressPage() {
  const page = document.getElementById('addressPage');
  if (page) page.style.display = 'none';
  // Return to profile
  navigateToSection('#profile');
  openProfilePage('addresses');
}

function saveAddressFromForm() {
  const name = document.getElementById('addrFullName')?.value.trim();
  const phone = document.getElementById('addrPhone')?.value.trim();
  const pincode = document.getElementById('addrPincode')?.value.trim();
  const line1 = document.getElementById('addrLine1')?.value.trim();
  const line2 = document.getElementById('addrLine2')?.value.trim();
  const landmark = document.getElementById('addrLandmark')?.value.trim();
  const city = document.getElementById('addrCity')?.value.trim();
  const state = document.getElementById('addrState')?.value.trim();
  const type = document.getElementById('addrType')?.value;
  const isDefault = document.getElementById('addrDefault')?.checked;

  if (!name || !phone || !pincode || !line1 || !city || !state) {
    showToast('Please fill required fields', 'error');
    return;
  }
  if (!/^\d{10}$/.test(phone)) {
    showToast('Enter valid 10-digit mobile number', 'error');
    return;
  }
  if (!/^\d{6}$/.test(pincode)) {
    showToast('Enter valid 6-digit pincode', 'error');
    return;
  }

  const addressObj = {
    id: window.editingAddressId || Date.now(),
    fullName: name,
    phone,
    pincode,
    line1,
    line2,
    landmark,
    city,
    state,
    type,
    isDefault: !!isDefault,
    address: `${line1}${line2 ? ', ' + line2 : ''}, ${city}, ${state} - ${pincode}`
  };

  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const addresses = JSON.parse(localStorage.getItem(`addresses_${currentUser}`) || '[]');
    if (isDefault) {
      addresses.forEach(a => a.isDefault = false);
      localStorage.setItem('currentAddress', addressObj.address);
    }
    if (window.editingAddressId) {
      const idx = addresses.findIndex(a => a.id === window.editingAddressId);
      if (idx >= 0) {
        addresses[idx] = addressObj;
      } else {
        addresses.push(addressObj);
      }
      window.editingAddressId = null;
    } else {
      addresses.push(addressObj);
    }
    localStorage.setItem(`addresses_${currentUser}`, JSON.stringify(addresses));
    loadAddresses();
  } else {
    localStorage.setItem('currentAddress', addressObj.address);
  }

  initDeliverTo();
  showToast('Address saved', 'success');
  closeAddressPage();
}

function editAddress(id) {
  const currentUser = localStorage.getItem('currentUser');
  const addresses = JSON.parse(localStorage.getItem(`addresses_${currentUser}`) || '[]');
  const addr = addresses.find(a => a.id === id);
  if (!addr) return;
  window.editingAddressId = id;
  openAddressPage();
  document.getElementById('addrFullName').value = addr.fullName || '';
  document.getElementById('addrPhone').value = addr.phone || '';
  document.getElementById('addrPincode').value = addr.pincode || '';
  document.getElementById('addrLine1').value = addr.line1 || '';
  document.getElementById('addrLine2').value = addr.line2 || '';
  document.getElementById('addrLandmark').value = addr.landmark || '';
  document.getElementById('addrCity').value = addr.city || '';
  document.getElementById('addrState').value = addr.state || '';
  const typeEl = document.getElementById('addrType');
  if (typeEl) typeEl.value = addr.type || 'Home';
  const defEl = document.getElementById('addrDefault');
  if (defEl) defEl.checked = !!addr.isDefault;
}

function setDefaultAddress(id) {
  const currentUser = localStorage.getItem('currentUser');
  const addresses = JSON.parse(localStorage.getItem(`addresses_${currentUser}`) || '[]');
  const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
  const def = updated.find(a => a.id === id);
  if (def) localStorage.setItem('currentAddress', def.address);
  localStorage.setItem(`addresses_${currentUser}`, JSON.stringify(updated));
  loadAddresses();
  initDeliverTo();
  showToast('Default address updated', 'success');
}

function showAddPaymentForm() {
  showToast('This feature is coming soon!', 'info');
}

function showAddMoneyForm() {
  const amount = prompt('Enter amount to add:');
  if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
    const currentUser = localStorage.getItem('currentUser');
    const currentBalance = parseFloat(localStorage.getItem(`walletBalance_${currentUser}`) || '0');
    const newBalance = currentBalance + parseFloat(amount);
    
    localStorage.setItem(`walletBalance_${currentUser}`, newBalance.toString());
    
    const transactions = JSON.parse(localStorage.getItem(`walletTransactions_${currentUser}`) || '[]');
    transactions.unshift({
      type: 'credit',
      amount: parseFloat(amount),
      description: 'Money Added',
      date: new Date().toISOString()
    });
    localStorage.setItem(`walletTransactions_${currentUser}`, JSON.stringify(transactions));
    
    loadWalletData();
    showToast(`₹${amount} added to wallet!`, 'success');
  }
}

function reorder(orderId) {
  showToast(`Reordering items from order #${orderId}...`, 'info');
}

function downloadInvoice(invoiceId) {
  showToast(`Downloading invoice...`, 'info');
}

function submitAppReview(event) {
  event.preventDefault();
  showToast('Thank you for your review!', 'success');
  event.target.reset();
}
