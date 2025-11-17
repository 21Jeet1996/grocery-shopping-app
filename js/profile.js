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
  const tabs = document.querySelectorAll('.profile-tab-content');
  const buttons = document.querySelectorAll('.profile-tab-btn');
  
  tabs.forEach(tab => tab.classList.remove('active'));
  buttons.forEach(btn => btn.classList.remove('active'));

  const targetTab = document.getElementById(`profile${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`);
  if (targetTab) {
    targetTab.classList.add('active');
  }

  const targetButton = Array.from(buttons).find(btn => 
    btn.textContent.trim().toLowerCase().includes(tabName.replace(/([A-Z])/g, ' $1').trim().toLowerCase())
  );
  if (targetButton) {
    targetButton.classList.add('active');
  }

  if (tabName === 'currentOrders') loadCurrentOrders();
  else if (tabName === 'orderHistory') loadOrderHistory();
  else if (tabName === 'wallet') loadWalletData();
  else if (tabName === 'invoices') loadInvoices();
  else if (tabName === 'addresses') loadAddresses();
  else if (tabName === 'account') renderAccountDetails();
}

function loadCurrentOrders() {
  const currentOrdersList = $('#currentOrdersList');
  if (!currentOrdersList) return;
  
  const currentUser = localStorage.getItem('currentUser');
  const orders = JSON.parse(localStorage.getItem(`currentOrders_${currentUser}`) || '[]');
  
  if (orders.length === 0) {
    currentOrdersList.innerHTML = '<p class="empty-state">No active orders. Your current orders will appear here!</p>';
    return;
  }
  
  currentOrdersList.innerHTML = orders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <div>
          <h4>Order #${order.orderId}</h4>
          <p class="order-date">Placed on ${new Date(order.orderDate).toLocaleDateString()}</p>
        </div>
        <span class="order-status ${order.status}">${order.status}</span>
      </div>
      <div class="order-items">
        ${order.items.map(item => `
          <div class="order-item">
            <span>${item.name} x${item.quantity}</span>
            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
      </div>
      <div class="order-footer">
        <span class="order-total">Total: ₹${order.total.toFixed(2)}</span>
        <button class="track-order-btn" onclick="trackOrder('${order.orderId}')">Track Order</button>
      </div>
    </div>
  `).join('');
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
  
  orderHistoryList.innerHTML = orders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <div>
          <h4>Order #${order.orderId}</h4>
          <p class="order-date">${new Date(order.orderDate).toLocaleDateString()}</p>
        </div>
        <span class="order-status ${order.status}">${order.status}</span>
      </div>
      <div class="order-items">
        ${order.items.map(item => `
          <div class="order-item">
            <span>${item.name} x${item.quantity}</span>
            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
      </div>
      <div class="order-footer">
        <span class="order-total">Total: ₹${order.total.toFixed(2)}</span>
        <button class="reorder-btn" onclick="reorder('${order.orderId}')">Reorder</button>
      </div>
    </div>
  `).join('');
}

function loadWalletData() {
  const currentUser = localStorage.getItem('currentUser');
  const walletBalance = parseFloat(localStorage.getItem(`walletBalance_${currentUser}`) || '0');
  const transactions = JSON.parse(localStorage.getItem(`walletTransactions_${currentUser}`) || '[]');
  
  const walletBalanceEl = $('#walletBalance');
  const walletTransactionsList = $('#walletTransactionsList');
  
  if (walletBalanceEl) walletBalanceEl.textContent = walletBalance.toFixed(2);
  
  if (!walletTransactionsList) return;
  
  if (transactions.length === 0) {
    walletTransactionsList.innerHTML = '<p class="empty-state">No transactions yet. Your wallet transactions will appear here!</p>';
    return;
  }
  
  walletTransactionsList.innerHTML = transactions.map(trans => `
    <div class="transaction-card">
      <div class="transaction-info">
        <span class="transaction-type ${trans.type}">${trans.type === 'credit' ? '+' : '-'}</span>
        <div>
          <h4>${trans.description}</h4>
          <p class="transaction-date">${new Date(trans.date).toLocaleDateString()}</p>
        </div>
      </div>
      <span class="transaction-amount ${trans.type}">₹${trans.amount.toFixed(2)}</span>
    </div>
  `).join('');
}

function loadInvoices() {
  const invoicesList = $('#invoicesList');
  if (!invoicesList) return;
  
  const currentUser = localStorage.getItem('currentUser');
  const invoices = JSON.parse(localStorage.getItem(`invoices_${currentUser}`) || '[]');
  
  if (invoices.length === 0) {
    invoicesList.innerHTML = '<p class="empty-state">No invoices available. Invoices will appear here after order completion!</p>';
    return;
  }
  
  invoicesList.innerHTML = invoices.map(invoice => `
    <div class="invoice-card">
      <div class="invoice-info">
        <h4>Invoice #${invoice.id}</h4>
        <p class="invoice-date">${new Date(invoice.date).toLocaleDateString()}</p>
        <p class="invoice-amount">Amount: ₹${invoice.amount}</p>
      </div>
      <button class="download-invoice-btn" onclick="downloadInvoice('${invoice.id}')">📥 Download</button>
    </div>
  `).join('');
}

function showAddPaymentForm() {
  const method = prompt('Enter payment method (Card/UPI/Cash):');
  if (method) {
    showToast('Payment method added successfully!', 'success');
  }
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
  showToast(`Reordering order #${orderId}...`, 'info');
}

function downloadInvoice(invoiceId) {
  showToast(`Downloading invoice #${invoiceId}...`, 'info');
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
  
  const profileData = {
    fullName: fullName || currentUser,
    email: email || '',
    phone: phone || '',
    dob: dob || ''
  };
  
  localStorage.setItem(`profile_${currentUser}`, JSON.stringify(profileData));
  updateProfileUI();
  renderAccountDetails();
  const form = $('#profileInfoForm');
  const view = $('#accountDetailsView');
  if (form) form.style.display = 'none';
  if (view) view.style.display = 'block';
  showToast('Profile updated successfully!', 'success');
}

function showAddAddressForm() {
  openAddressPage();
}

function renderAccountDetails() {
  const currentUser = localStorage.getItem('currentUser');
  const view = document.getElementById('accountDetailsView');
  const form = document.getElementById('profileInfoForm');
  if (!view) return;
  const raw = localStorage.getItem(`profile_${currentUser}`) || '';
  if (!raw) {
    view.innerHTML = `
      <div class="empty-state">No account details added.</div>
      <button onclick="openAccountEdit()">Add Details</button>
    `;
    if (form) form.style.display = 'none';
    view.style.display = 'block';
    return;
  }
  const profile = JSON.parse(raw);
  const rows = [
    { label: 'Full Name', key: 'fullName', value: profile.fullName || '' },
    { label: 'Email', key: 'email', value: profile.email || '' },
    { label: 'Phone Number', key: 'phone', value: profile.phone || '' },
    { label: 'Date of Birth', key: 'dob', value: profile.dob || '' }
  ];
  view.innerHTML = rows.map(r => `
    <div class="address-card">
      <div>
        <p><strong>${r.label}</strong></p>
        <p>${r.value || '-'}</p>
      </div>
      <div>
        <button onclick="openAccountEdit('${r.key}')">Edit</button>
      </div>
    </div>
  `).join('');
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
  if (nameEl) nameEl.value = profile.fullName || '';
  if (emailEl) emailEl.value = profile.email || '';
  if (phoneEl) phoneEl.value = profile.phone || '';
  if (dobEl) dobEl.value = profile.dob || '';
  if (field === 'fullName' && nameEl) nameEl.focus();
  if (field === 'email' && emailEl) emailEl.focus();
  if (field === 'phone' && phoneEl) phoneEl.focus();
  if (field === 'dob' && dobEl) dobEl.focus();
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
    <div class="address-card">
      <div>
        <p><strong>${addr.fullName}</strong> • ${addr.phone}</p>
        <p>${addr.address}</p>
      </div>
      <div style="display:flex; gap:8px; align-items:center;">
        ${addr.isDefault ? '<span class="default-badge">Default</span>' : `<button onclick="setDefaultAddress(${addr.id})">Make Default</button>`}
        <button onclick="editAddress(${addr.id})">Edit</button>
        <button onclick="deleteAddress(${addr.id})">Delete</button>
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
  const name = document.getElementById('addrFullName');
  const phone = document.getElementById('addrPhone');
  const pincode = document.getElementById('addrPincode');
  const line1 = document.getElementById('addrLine1');
  const line2 = document.getElementById('addrLine2');
  const landmark = document.getElementById('addrLandmark');
  const city = document.getElementById('addrCity');
  const state = document.getElementById('addrState');
  const type = document.getElementById('addrType');
  const def = document.getElementById('addrDefault');
  [name, phone, pincode, line1, line2, landmark, city, state].forEach(el => el && (el.value = ''));
  type && (type.value = 'Home');
  def && (def.checked = true);
  window.editingAddressId = null;
}

function closeAddressPage() {
  const page = document.getElementById('addressPage');
  if (page) page.style.display = 'none';
  const home = document.getElementById('home');
  if (home) home.style.display = 'block';
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
