// ==========================
// 🔹 GRAIN'S MART - Main JavaScript
// ==========================

// ---------- Utility Functions ----------
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

let allProducts = [];
const CATEGORY_IMAGES = {
  'fruits': 'assets/images/fruits.svg',
  'vegetables': 'assets/images/vegetables.svg',
  'dairy': 'assets/images/dairy.svg',
  'atta': 'assets/images/atta.svg',
  'soap': 'assets/images/soap.svg',
  'biscuit': 'assets/images/biscuit.svg',
  'cold drink': 'assets/images/cold-drink.svg',
  'pulses': 'assets/images/pulses.svg',
  'chocolate': 'assets/images/chocolate.svg'
};

function getProductImage(product) {
  const key = (product.category || '').trim().toLowerCase();
  return CATEGORY_IMAGES[key] || product.img || 'assets/images/vegetables.svg';
}
async function loadProducts() {
  try {
    const res = await fetch(`data/products.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allProducts = Array.isArray(data) ? data : (data.products || []);
    const seen = new Set();
    allProducts = allProducts.filter(p => {
      const key = (p.name || '').trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    console.log('Fetched products.json', {
      count: allProducts.length,
      categories: Array.from(new Set(allProducts.map(p => p.category))),
      names: allProducts.map(p => p.name)
    });
  } catch (e) {
    allProducts = [];
    if (location.protocol === 'file:') {
      showToast('Unable to load products from JSON. Please run via a local server.', 'error');
    } else {
      showToast('Unable to load products. Please check network or JSON path.', 'error');
    }
    console.error('Failed to load products.json', e);
  }
}

// ---------- Image Error Handling ----------
function createPlaceholderSVG(text, width = 230, height = 180) {
  // Escape text for URL encoding
  const escapedText = encodeURIComponent(text);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect fill="#f0f0f0" width="${width}" height="${height}"/><text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#999" font-weight="bold">${text}</text><text x="50%" y="60%" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#bbb">No Image</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function handleImageError(img, productName) {
  if (!img.dataset.errorHandled) {
    img.dataset.errorHandled = 'true';
    img.src = createPlaceholderSVG(productName, 230, 180);
    img.style.objectFit = 'cover';
    img.style.backgroundColor = '#f0f0f0';
  }
}

function handleCategoryImageError(img, categoryName) {
  if (!img.dataset.errorHandled) {
    img.dataset.errorHandled = 'true';
    img.src = createPlaceholderSVG(categoryName, 150, 120);
    img.style.objectFit = 'cover';
    img.style.backgroundColor = '#f0f0f0';
  }
}

// ---------- AUTOCOMPLETE HELPERS ----------
let autocompleteIndex = -1;
let autocompleteItems = [];
function createAutocompleteContainer() {
  const searchBox = document.querySelector('.search-box');
  if (!searchBox) return;
  let ac = document.getElementById('autocompleteList');
  if (!ac) {
    ac = document.createElement('div');
    ac.id = 'autocompleteList';
    ac.className = 'autocomplete-list';
    ac.style.display = 'none';
    searchBox.appendChild(ac);
  }
}

function updateAutocomplete(query) {
  const ac = document.getElementById('autocompleteList');
  if (!ac) return;
  query = (query || '').trim().toLowerCase();
  if (!query) { ac.style.display = 'none'; autocompleteItems = []; autocompleteIndex = -1; return; }
  const matches = allProducts.filter(p => p.name.toLowerCase().includes(query) || (p.category || '').toLowerCase().includes(query)).slice(0, 8);
  autocompleteItems = matches;
  ac.innerHTML = '';
  if (matches.length === 0) { ac.style.display = 'none'; return; }
  matches.forEach((m, idx) => {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';
    item.dataset.index = idx;
    item.innerHTML = `<img src="${getProductImage(m)}" onerror="this.src='${createPlaceholderSVG(m.name,40,32)}'"/><div><strong>${m.name}</strong><div style=\"font-size:12px;color:#666\">${m.category} • ₹${m.price}</div></div>`;
    item.addEventListener('click', () => {
      document.getElementById('search-bar').value = m.name;
      ac.style.display = 'none';
      openProductDetail(m.name);
    });
    ac.appendChild(item);
  });
  ac.style.display = 'block';
  autocompleteIndex = -1;
}

function handleSearchKeydown(e) {
  const ac = document.getElementById('autocompleteList');
  if (!ac || ac.style.display === 'none') return;
  const items = Array.from(ac.querySelectorAll('.autocomplete-item'));
  if (e.key === 'ArrowDown') {
    e.preventDefault(); autocompleteIndex = Math.min(autocompleteIndex + 1, items.length - 1); updateAutocompleteActive(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault(); autocompleteIndex = Math.max(autocompleteIndex - 1, 0); updateAutocompleteActive(items);
  } else if (e.key === 'Enter') {
    e.preventDefault(); if (autocompleteIndex >= 0 && items[autocompleteIndex]) items[autocompleteIndex].click();
  } else if (e.key === 'Escape') {
    ac.style.display = 'none';
  }
}

function updateAutocompleteActive(items) {
  items.forEach((it, i) => it.classList.toggle('active', i === autocompleteIndex));
}

// ---------- Toast Notification System ----------
function showToast(message, type = 'success') {
  const toast = $('#toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.className = `toast toast-${type}`;
  toast.style.display = 'block';
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// ---------- CART (persistent in localStorage) ----------
let cart = JSON.parse(localStorage.getItem('gm_cart') || '[]');

function saveCart() {
  localStorage.setItem('gm_cart', JSON.stringify(cart));
  updateCart();
}

function findProductElementByName(name) {
  name = name.trim().toLowerCase();
  return $$('.product').find(p => {
    const productName = (p.querySelector('h3')?.textContent || '').trim().toLowerCase();
    return productName === name;
  });
}

function parsePriceFromText(text) {
  const m = text && text.match(/[\d,.]+/);
  return m ? parseFloat(m[0].replace(/,/g, '')) : 0;
}

function addToCart(name) {
  // First try to find product in allProducts array
  let product = allProducts.find(p => p.name.toLowerCase() === name.toLowerCase());
  
  // If not found, try to find in DOM
  if (!product) {
    const el = findProductElementByName(name);
    if (!el) {
      showToast('Product not found!', 'error');
      return;
    }
    
    const img = el.querySelector('img')?.getAttribute('src') || '';
    const priceText = el.querySelector('p')?.textContent || '0';
    const price = parsePriceFromText(priceText);
    const category = el.getAttribute('data-category') || '';
    product = { name, price, img, category };
  }

  const existing = cart.find(i => i.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.qty = (existing.qty || 0) + 1;
    showToast(`${name} quantity updated!`, 'success');
  } else {
    cart.push({ name: product.name, price: product.price, qty: 1, img: product.img, category: product.category || '' });
    showToast(`${name} added to cart!`, 'success');
  }
  saveCart();
}

function changeQty(index, val) {
  const qty = Math.max(1, parseInt(val) || 1);
  if (cart[index]) {
    cart[index].qty = qty;
    saveCart();
  }
}

function removeItem(index) {
  if (cart[index]) {
    const itemName = cart[index].name;
    cart.splice(index, 1);
    saveCart();
    showToast(`${itemName} removed from cart`, 'info');
  }
}

function updateCart() {
  const cartItemsList = $('#cart-items-list');
  const emptyCart = $('#empty-cart');
  const cartCount = $('#cart-count');
  const cartTotal = $('#cart-total');
  const cartSubtotal = $('#cart-subtotal');
  const cartItemCountText = $('#cart-item-count-text');
  const discountEl = $('#discount-amount');
  const deliveryEl = $('#delivery-charges');

  if (!cartItemsList || !cartCount || !cartTotal) return;

  cartItemsList.innerHTML = '';
  let subtotal = 0, count = 0;

  if (cart.length === 0) {
    if (emptyCart) emptyCart.style.display = 'flex';
    if (cartItemsList) cartItemsList.style.display = 'none';
  } else {
    if (emptyCart) emptyCart.style.display = 'none';
    if (cartItemsList) cartItemsList.style.display = 'block';

    cart.forEach((item, i) => {
      const lineSubtotal = (item.price || 0) * (item.qty || 0);
      subtotal += lineSubtotal;
      count += item.qty || 0;

      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item-card';
      const placeholderImg = createPlaceholderSVG(item.name, 100, 100);
      cartItem.innerHTML = `
        <div class="cart-item-image">
          <img src="${item.img || placeholderImg}" alt="${item.name}" onerror="this.src='${placeholderImg}'">
        </div>
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p class="cart-item-price">₹${(item.price || 0).toFixed(2)}</p>
          <div class="cart-item-actions">
            <div class="quantity-controls">
              <button class="qty-btn minus" onclick="changeQty(${i}, ${(item.qty || 1) - 1})">-</button>
              <input type="number" min="1" value="${item.qty}" class="quantity-input-zepto" data-index="${i}" onchange="changeQty(${i}, this.value)">
              <button class="qty-btn plus" onclick="changeQty(${i}, ${(item.qty || 1) + 1})">+</button>
            </div>
            <button class="remove-item-btn" onclick="removeItem(${i})">🗑️</button>
          </div>
        </div>
        <div class="cart-item-subtotal">
          <span>₹${lineSubtotal.toFixed(2)}</span>
        </div>
      `;
      cartItemsList.appendChild(cartItem);
    });
  }

  const activeOffer = (localStorage.getItem('activeOffer') || '').toUpperCase();
  let discount = 0;

  if (activeOffer === 'FRUIT50') {
    cart.forEach(item => {
      if ((item.category || '').toLowerCase() === 'fruits') {
        discount += (item.price || 0) * (item.qty || 0) * 0.5;
      }
    });
  } else if (activeOffer === 'DRINK3') {
    cart.forEach(item => {
      if ((item.category || '').toLowerCase() === 'cold drink') {
        const freeUnits = Math.floor((item.qty || 0) / 3);
        discount += freeUnits * (item.price || 0);
      }
    });
  } else if (activeOffer === 'DAIRY20') {
    cart.forEach(item => {
      if ((item.category || '').toLowerCase() === 'dairy') {
        discount += (item.price || 0) * (item.qty || 0) * 0.2;
      }
    });
  }

  const afterDiscount = Math.max(0, subtotal - discount);
  const delivery = afterDiscount >= 500 ? 0 : 40;
  const finalTotal = afterDiscount + delivery;

  cartCount.textContent = count;
  if (cartSubtotal) cartSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
  if (discountEl) discountEl.textContent = `₹${discount.toFixed(2)}`;
  if (deliveryEl) deliveryEl.textContent = delivery === 0 ? 'Free' : `₹${delivery.toFixed(2)}`;
  cartTotal.textContent = finalTotal.toFixed(2);
  if (cartItemCountText) {
    cartItemCountText.textContent = count === 1 ? '1 item' : `${count} items`;
  }

  updateMiniCartBar(finalTotal, count);
}

// ---------- CATEGORY SCROLL ----------
function scrollCategories(px) {
  const container = $('#categoryContainer');
  if (!container) return;
  container.scrollBy({ left: px, behavior: 'smooth' });
}

// ---------- LOAD TOP PRODUCTS ON HOME ----------
function loadTopProducts() {
  const homeProducts = $('#homeProducts');
  if (!homeProducts) return;
  
  // Sort by search count and get top 8
  const topProducts = [...allProducts]
    .sort((a, b) => b.searchCount - a.searchCount)
    .slice(0, 8);
  
  homeProducts.innerHTML = '';
  topProducts.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.className = 'product product-view-only';
    productDiv.setAttribute('data-category', product.category);
    productDiv.innerHTML = `
      <img src="${getProductImage(product)}" alt="${product.name}" onerror="handleImageError(this, '${product.name}')">
      <h3>${product.name}</h3>
      <p>₹${product.price} / ${product.category === 'fruits' ? 'kg' : product.category === 'cold drink' ? 'bottle' : 'piece'}</p>
      <div class="rating">⭐ ${product.rating || 4.0}</div>
      <p class="view-only-text">Click to view details</p>
    `;
    productDiv.addEventListener('click', () => {
      // Navigate to categories and show this product's category
      showCategoryProducts(product.category);
      // Scroll to categories section
      document.querySelector('#categories').scrollIntoView({ behavior: 'smooth' });
    });
    homeProducts.appendChild(productDiv);
  });
}

// ---------- SHOW CATEGORY PRODUCTS ----------
function showCategoryProducts(category) {
  // First navigate to categories section
  const categoriesSection = $('#categories');
  if (categoriesSection) {
    categoriesSection.style.display = 'block';
    categoriesSection.scrollIntoView({ behavior: 'smooth' });
  }
  
  const categoryContainer = $('#categoryContainer');
  const categoryProductsSection = $('#categoryProductsSection');
  const categoryProductsList = $('#categoryProductsList');
  const categoryProductsTitle = $('#categoryProductsTitle');
  
  if (!categoryProductsSection || !categoryProductsList) return;
  
  // Hide category grid, show products
  if (categoryContainer) categoryContainer.style.display = 'none';
  categoryProductsSection.style.display = 'block';
  
  // Set title
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  if (categoryProductsTitle) categoryProductsTitle.textContent = categoryName;
  
  // Filter and display products
  const categoryProducts = allProducts.filter(p => 
    p.category.toLowerCase() === category.toLowerCase()
  );
  
  categoryProductsList.innerHTML = '';
  if (categoryProducts.length === 0) {
    categoryProductsList.innerHTML = '<p class="empty-state">No products found in this category.</p>';
  } else {
    categoryProducts.forEach(product => {
      const productDiv = document.createElement('div');
      productDiv.className = 'product';
      productDiv.setAttribute('data-category', product.category);
      productDiv.innerHTML = `
        <img src="${getProductImage(product)}" alt="${product.name}" onerror="handleImageError(this, '${product.name}')">
        <h3>${product.name}</h3>
        <p>₹${product.price} / ${product.category === 'fruits' ? 'kg' : product.category === 'cold drink' ? 'bottle' : 'piece'}</p>
        <div class="rating">⭐ ${product.rating || 4.0}</div>
        <div class="product-actions-overlay">
          <button class="overlay-btn add" onclick="addToCart('${product.name}')">Add to Cart</button>
          <button class="overlay-btn desc" onclick="openProductDetail('${product.name}')">Check Description</button>
        </div>
      `;
      categoryProductsList.appendChild(productDiv);
    });
  }
  
  // Scroll to products after a short delay
  setTimeout(() => {
    categoryProductsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 300);
}

function backToCategories() {
  const categoryContainer = $('#categoryContainer');
  const categoryProductsSection = $('#categoryProductsSection');
  
  if (categoryContainer) categoryContainer.style.display = 'flex';
  if (categoryProductsSection) categoryProductsSection.style.display = 'none';
}

function openProductDetail(name) {
  const product = allProducts.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (!product) return;
  document.querySelectorAll('main section').forEach(sec => sec.style.display = 'none');
  const detail = document.getElementById('productDetail');
  if (!detail) return;
  detail.style.display = 'block';
  const img = document.getElementById('pdImage');
  const n = document.getElementById('pdName');
  const price = document.getElementById('pdPrice');
  const rating = document.getElementById('pdRating');
  const desc = document.getElementById('pdDesc');
  const addBtn = document.getElementById('pdAdd');
  const buyBtn = document.getElementById('pdBuy');
  if (img) img.src = getProductImage(product);
  if (n) n.textContent = product.name;
  if (price) price.textContent = `₹${product.price}`;
  if (rating) rating.textContent = `⭐ ${product.rating || 4.0}`;
  if (desc) desc.textContent = `High-quality ${product.name}. Fresh and delivered fast.`;
  if (addBtn) addBtn.onclick = () => addToCart(product.name);
  if (buyBtn) buyBtn.onclick = () => { addToCart(product.name); proceedToCheckout(); };
}

function closeProductDetail() {
  const detail = document.getElementById('productDetail');
  if (detail) detail.style.display = 'none';
  const categories = document.getElementById('categories');
  if (categories) categories.style.display = 'block';
}

// ---------- SEARCH FUNCTIONALITY ----------
function searchProducts() {
  const input = ($('#search-bar')?.value || '').trim().toLowerCase();

  // Search categories
  const cats = $$('.category');
  let catFound = false;
  cats.forEach(c => {
    const name = (c.querySelector('h3')?.textContent || '').toLowerCase();
    if (input === '' || name.includes(input)) {
      c.style.display = 'block';
      catFound = catFound || (name.includes(input) && input !== '');
    } else {
      c.style.display = 'none';
    }
  });

  // Search products
  const products = $$('.product');
  let prodFound = false;
  products.forEach(p => {
    const name = (p.querySelector('h3')?.textContent || '').toLowerCase();
    const cat = (p.getAttribute('data-category') || '').toLowerCase();
    if (input === '' || name.includes(input) || cat.includes(input)) {
      p.style.display = 'block';
      if (input !== '' && (name.includes(input) || cat.includes(input))) {
        prodFound = true;
      }
    } else {
      p.style.display = 'none';
    }
  });

  // Show/hide no results message
  let msg = $('#no-results');
  if (!msg && input !== '') {
    msg = document.createElement('p');
    msg.id = 'no-results';
    msg.style.cssText = 'color: #e53935; text-align: center; margin-top: 20px; font-size: 16px;';
    const productsSection = $('#products');
    if (productsSection) {
      productsSection.appendChild(msg);
    }
  }

  if (input === '') {
    if (msg) msg.textContent = '';
    return;
  }

  if (!prodFound && !catFound && msg) {
    msg.textContent = 'No matching products or categories found.';
  } else if (msg) {
    msg.textContent = '';
    const productsSection = $('#products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

// ---------- LOGIN / SIGNUP MODAL WITH TABS ----------
function openLoginModal() {
  const modal = $('#loginModal');
  if (!modal) return;
  modal.style.display = 'flex';
  modal.classList.add('show');
  switchTab('login');
}

// openSignupModal removed - users can access signup via tabs in the login modal

function closeLoginModal() {
  const modal = $('#loginModal');
  if (!modal) return;
  modal.style.display = 'none';
  modal.classList.remove('show');
  
  // Reset forms
  const loginForm = $('#loginForm');
  const signupForm = $('#signupForm');
  if (loginForm) loginForm.reset();
  if (signupForm) signupForm.reset();
  
  // Clear error messages
  const loginError = $('#login-error-msg');
  const signupError = $('#signup-error-msg');
  if (loginError) loginError.textContent = '';
  if (signupError) signupError.textContent = '';
}

function switchTab(tabName) {
  // Update tab buttons
  const loginTab = $('#loginTab');
  const signupTab = $('#signupTab');
  const loginContent = $('#loginTabContent');
  const signupContent = $('#signupTabContent');
  const forgotContent = $('#forgotPasswordTabContent');
  
  // Hide all tabs first
  if (loginContent) loginContent.classList.remove('active');
  if (signupContent) signupContent.classList.remove('active');
  if (forgotContent) forgotContent.classList.remove('active');
  if (loginTab) loginTab.classList.remove('active');
  if (signupTab) signupTab.classList.remove('active');
  
  if (tabName === 'login') {
    if (loginTab) loginTab.classList.add('active');
    if (loginContent) loginContent.classList.add('active');
  } else if (tabName === 'signup') {
    if (signupTab) signupTab.classList.add('active');
    if (signupContent) signupContent.classList.add('active');
  } else if (tabName === 'forgot') {
    if (forgotContent) forgotContent.classList.add('active');
  }
  
  // Clear error messages when switching tabs
  const loginError = $('#login-error-msg');
  const signupError = $('#signup-error-msg');
  const forgotError = $('#forgot-error-msg');
  const forgotSuccess = $('#forgot-success-msg');
  if (loginError) loginError.textContent = '';
  if (signupError) signupError.textContent = '';
  if (forgotError) forgotError.textContent = '';
  if (forgotSuccess) forgotSuccess.textContent = '';
}

function showForgotPassword() {
  switchTab('forgot');
}

function skipLogin() {
  closeLoginModal();
  showToast('Continuing as guest user', 'info');
}

function resetPassword() {
  const username = $('#forgotUsername')?.value.trim();
  const errorMsg = $('#forgot-error-msg');
  const successMsg = $('#forgot-success-msg');
  
  if (!username) {
    if (errorMsg) errorMsg.textContent = 'Please enter your username!';
    return;
  }
  
  const userData = localStorage.getItem(`user_${username}`);
  if (!userData) {
    if (errorMsg) errorMsg.textContent = 'Username not found!';
    if (successMsg) successMsg.textContent = '';
    return;
  }
  
  // Generate a simple reset code (in real app, this would be sent via email)
  const resetCode = Math.floor(100000 + Math.random() * 900000);
  localStorage.setItem(`reset_${username}`, resetCode.toString());
  
  if (errorMsg) errorMsg.textContent = '';
  if (successMsg) {
    successMsg.textContent = `Password reset code: ${resetCode}. Use this to set a new password.`;
    successMsg.style.display = 'block';
  }
  
  showToast('Reset code generated! Check the message above.', 'success');
}

function signUp() {
  const username = $('#signupUsername')?.value.trim();
  const password = $('#signupPassword')?.value.trim();
  const confirmPassword = $('#confirmPassword')?.value.trim();
  const errorMsg = $('#signup-error-msg');

  if (!username || !password || !confirmPassword) {
    if (errorMsg) errorMsg.textContent = 'Please fill in all fields!';
    return;
  }

  if (password !== confirmPassword) {
    if (errorMsg) errorMsg.textContent = 'Passwords do not match!';
    return;
  }

  if (password.length < 6) {
    if (errorMsg) errorMsg.textContent = 'Password must be at least 6 characters!';
    return;
  }

  if (localStorage.getItem(`user_${username}`)) {
    if (errorMsg) errorMsg.textContent = 'Account already exists!';
    return;
  }

  localStorage.setItem(`user_${username}`, JSON.stringify({ 
    password, 
    createdAt: new Date().toISOString() 
  }));
  
  showToast('Sign Up successful! Please log in.', 'success');
  switchTab('login');
  
  // Clear signup form
  const signupForm = $('#signupForm');
  if (signupForm) signupForm.reset();
}

function login() {
  const username = $('#loginUsername')?.value.trim();
  const password = $('#loginPassword')?.value.trim();
  const errorMsg = $('#login-error-msg');
  
  if (!username || !password) {
    if (errorMsg) errorMsg.textContent = 'Please fill in all fields!';
    return;
  }

  const userData = localStorage.getItem(`user_${username}`);
  if (!userData) {
    if (errorMsg) errorMsg.textContent = 'Invalid username or password!';
    return;
  }

  const user = JSON.parse(userData);
  if (user.password === password) {
    localStorage.setItem('currentUser', username);
    showToast('Login successful!', 'success');
    closeLoginModal();
    updateAuthUI();
  } else {
    if (errorMsg) errorMsg.textContent = 'Invalid username or password!';
  }
}

function updateAuthUI() {
  const currentUser = localStorage.getItem('currentUser');
  const authLinks = $('#authLinks');
  const profileNav = $('#profileNav');
  if (!authLinks) return;
  
  if (currentUser) {
    authLinks.innerHTML = `
      <span class="user-welcome">Welcome, <strong>${currentUser}</strong>!</span>
      <a href="#" onclick="logout(); return false;" class="logout-btn">Logout</a>
    `;
    if (profileNav) profileNav.style.display = 'inline-block';
    updateProfileUI();
  } else {
    authLinks.innerHTML = `
      <a href="#" onclick="openLoginModal(); return false;">Login</a>
    `;
    // Profile nav is always visible now, but clicking it will prompt login
    if (profileNav) profileNav.style.display = 'inline-block';
  }
}

function updateProfileUI() {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return;
  
  const profileName = $('#profileName');
  const profileInitial = $('#profileInitial');
  const profileEmail = $('#profileEmail');
  
  if (profileName) profileName.textContent = currentUser;
  if (profileInitial) profileInitial.textContent = currentUser.charAt(0).toUpperCase();
  
  const userData = localStorage.getItem(`profile_${currentUser}`);
  if (userData) {
    const profile = JSON.parse(userData);
    if (profileEmail) profileEmail.textContent = profile.email || 'Not set';
    if (profileName) profileName.textContent = profile.fullName || currentUser;
  } else {
    if (profileEmail) profileEmail.textContent = 'Not set';
  }

  const activeOrdersStat = $('#statActiveOrders');
  const walletBalanceStat = $('#statWalletBalance');
  const orderHistoryStat = $('#statOrderHistory');
  const currentOrders = JSON.parse(localStorage.getItem(`currentOrders_${currentUser}`) || '[]');
  const orderHistory = JSON.parse(localStorage.getItem(`orderHistory_${currentUser}`) || '[]');
  const walletBalance = parseFloat(localStorage.getItem(`walletBalance_${currentUser}`) || '0');
  if (activeOrdersStat) activeOrdersStat.textContent = currentOrders.length.toString();
  if (orderHistoryStat) orderHistoryStat.textContent = orderHistory.length.toString();
  if (walletBalanceStat) walletBalanceStat.textContent = (walletBalance || 0).toFixed(2);
}

function showProfileTab(tabName) {
  const allTabs = ['currentOrders', 'orderHistory', 'payment', 'addresses', 'account', 'wallet', 'invoices', 'support', 'track', 'about'];
  allTabs.forEach(tab => {
    const tabBtn = $(`.profile-tab-btn[onclick*="${tab}"]`);
    const tabId = `profile${tab.charAt(0).toUpperCase() + tab.slice(1)}Tab`;
    const tabContent = $(`#${tabId}`);
    if (tabBtn) tabBtn.classList.remove('active');
    if (tabContent) tabContent.classList.remove('active');
  });
  
  const activeTabBtn = $(`.profile-tab-btn[onclick*="${tabName}"]`);
  const tabId = `profile${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`;
  const activeTabContent = $(`#${tabId}`);
  if (activeTabBtn) activeTabBtn.classList.add('active');
  if (activeTabContent) {
    activeTabContent.classList.add('active');
    // Load data for specific tabs
    if (tabName === 'currentOrders') loadCurrentOrders();
    if (tabName === 'orderHistory') loadOrderHistory();
    if (tabName === 'wallet') loadWalletData();
    if (tabName === 'invoices') loadInvoices();
    if (tabName === 'addresses') loadAddresses();
    if (tabName === 'account') renderAccountDetails();
  }
}

function contactSupport(type) {
  if (type === 'phone') {
    showToast('Calling support: 1800-XXX-XXXX', 'info');
  } else if (type === 'email') {
    window.location.href = 'mailto:support@grainsmart.com';
  }
}

function showFAQs() {
  showToast('Opening FAQs...', 'info');
  // You can implement a FAQ modal here
}

function showHelpTopic(topic) {
  const topics = {
    delivery: 'We offer fast delivery within 2-4 hours!',
    returns: '7-day return policy. Contact support for returns.',
    payment: 'We accept UPI, Cards, and Cash on Delivery.',
    account: 'Manage your account details in the Account Details tab.'
  };
  showToast(topics[topic] || 'Help topic information', 'info');
}

function toggleMobileMenu() {
  const nav = $('.main-nav');
  const btn = document.querySelector('.mobile-menu-toggle');
  if (!nav || !btn) return;
  const isActive = nav.classList.toggle('mobile-active');
  btn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  document.body.classList.toggle('no-scroll', isActive);

  // Add/remove outside click handler to close mobile nav
  if (isActive) {
    setTimeout(() => document.addEventListener('click', handleOutsideNavClick));
  } else {
    document.removeEventListener('click', handleOutsideNavClick);
  }
}

function handleOutsideNavClick(e) {
  const nav = document.querySelector('.main-nav');
  const btn = document.querySelector('.mobile-menu-toggle');
  if (!nav) return;
  if (!nav.contains(e.target) && !btn.contains(e.target)) {
    nav.classList.remove('mobile-active');
    btn && btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
    document.removeEventListener('click', handleOutsideNavClick);
  }
}

function applyOffer(code) {
  code = (code || '').trim().toUpperCase();
  const valid = ['FRUIT50', 'DRINK3', 'DAIRY20'];
  if (!code) {
    showToast('Enter a valid offer code', 'error');
    return;
  }
  if (!valid.includes(code)) {
    showToast('Invalid offer code!', 'error');
    return;
  }
  localStorage.setItem('activeOffer', code);
  showToast(`Offer ${code} applied!`, 'success');
  updateCart();
}

function updateMiniCartBar(total, count) {
  const bar = document.getElementById('miniCartBar');
  const totalEl = document.getElementById('miniCartTotal');
  const countEl = document.getElementById('miniCartCount');
  const slotEl = document.getElementById('miniCartSlot');
  if (!bar || !totalEl || !countEl) return;
  if ((count || 0) > 0) {
    bar.style.display = 'flex';
    countEl.textContent = count === 1 ? '1 item' : `${count} items`;
    totalEl.textContent = (total || 0).toFixed(2);
    const slot = localStorage.getItem('delivery_slot') || 'Express 10–20 min';
    if (slotEl) slotEl.textContent = slot;
  } else {
    bar.style.display = 'none';
  }
}

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

function handleSlotChange() {
  const select = document.getElementById('delivery-slot-select');
  if (!select) return;
  const value = select.value;
  localStorage.setItem('delivery_slot', value === 'Express' ? 'Express 10–20 min' : value);
  const slotEl = document.getElementById('miniCartSlot');
  if (slotEl) slotEl.textContent = localStorage.getItem('delivery_slot');
  showToast(`Delivery slot set: ${localStorage.getItem('delivery_slot')}`, 'info');
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

function hideAllSections() {
  const sections = document.querySelectorAll('main section');
  sections.forEach(section => {
    section.style.display = 'none';
  });
}

function navigateToSection(sectionId) {
  hideAllSections();
  const targetSection = document.querySelector(sectionId);
  if (targetSection) {
    targetSection.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

function logout() {
  localStorage.removeItem('currentUser');
  updateAuthUI();
  showToast('Logged out successfully!', 'info');
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
  const modal = $('#loginModal');
  if (event.target === modal) {
    closeLoginModal();
  }
});

// ---------- CHECKOUT ----------
function proceedToCheckout() {
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }
  
  const total = parseFloat($('#cart-total')?.textContent || '0.00');
  
  // Show payment options modal
  showPaymentOptions(total);
}

// ---------- PAYMENT FUNCTIONS ----------
let currentPaymentTotal = 0;
let selectedPaymentMethod = '';
let selectedWallet = '';

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
  // Hide all payment forms first
  $$('.payment-form').forEach(form => form.style.display = 'none');
  
  // Update title based on method
  const titles = {
    'upi': 'UPI Payment',
    'card': 'Card Payment',
    'netbanking': 'Net Banking',
    'wallet': 'Wallet Payment',
    'cod': 'Cash on Delivery'
  };
  
  $('#paymentDetailsTitle').textContent = titles[method] || 'Payment Details';
  
  // Update amounts in all forms
  $('#upiAmount').textContent = currentPaymentTotal.toFixed(2);
  $('#cardAmount').textContent = currentPaymentTotal.toFixed(2);
  $('#netbankingAmount').textContent = currentPaymentTotal.toFixed(2);
  $('#walletAmount').textContent = currentPaymentTotal.toFixed(2);
  $('#codAmount').textContent = currentPaymentTotal.toFixed(2);
  
  // Show the relevant form
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
  // Reset forms
  $$('.payment-input').forEach(input => input.value = '');
  selectedWallet = '';
  $$('.wallet-option').forEach(option => option.style.borderColor = '#e0e0e0');
  $('.pay-btn').style.display = 'block';
}

function backToPaymentOptions() {
  closePaymentDetails();
  showPaymentOptions(currentPaymentTotal);
}

// Payment processing functions
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
  
  // Simulate UPI payment processing
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
  
  // Validate card number (basic validation)
  if (cardNumber.replace(/\s/g, '').length < 16) {
    showToast('Please enter a valid card number', 'error');
    return;
  }
  
  // Validate expiry (MM/YY format)
  if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
    showToast('Please enter expiry in MM/YY format', 'error');
    return;
  }
  
  // Validate CVV
  if (cardCvv.length !== 3 || !/^\d{3}$/.test(cardCvv)) {
    showToast('Please enter a valid 3-digit CVV', 'error');
    return;
  }
  
  // Simulate card payment processing
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
  
  // Simulate net banking redirect
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
  
  // Simulate wallet payment
  showToast(`Processing ${selectedWallet.toUpperCase()} payment...`, 'info');
  
  setTimeout(() => {
    completeOrder('Wallet', selectedWallet.toUpperCase());
  }, 2000);
}

function processCODPayment() {
  // Cash on delivery doesn't need additional validation
  showToast('Confirming cash on delivery order...', 'info');
  
  setTimeout(() => {
    completeOrder('Cash on Delivery', 'Pay on delivery');
  }, 1500);
}

function completeOrder(paymentMethod, paymentDetails) {
  const currentUser = localStorage.getItem('currentUser');
  
  // Create order
  const orderId = 'ORD' + Date.now();
  const currentAddress = localStorage.getItem('currentAddress') || '123 Main St, Mumbai, Maharashtra 400001';
  const currentUserData = JSON.parse(localStorage.getItem(`profile_${currentUser}`) || '{}');
  
  const order = {
    orderId: orderId,
    orderDate: new Date().toISOString(),
    status: 'processing',
    total: currentPaymentTotal,
    items: cart.map(item => ({
      name: item.name,
      quantity: item.qty,
      price: item.price,
      image: item.image || `https://picsum.photos/seed/${item.name}/50/50`
    })),
    deliveryAddress: {
      name: currentUserData.fullName || currentUser,
      address: currentAddress,
      phone: currentUserData.phone || '+91 9876543210'
    },
    paymentMethod: paymentMethod,
    paymentDetails: paymentDetails
  };
  
  // Save to global orders for tracking
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
  
  // Save to current orders
  const currentOrders = JSON.parse(localStorage.getItem(`currentOrders_${currentUser}`) || '[]');
  currentOrders.push(order);
  localStorage.setItem(`currentOrders_${currentUser}`, JSON.stringify(currentOrders));
  
  // Clear cart
  cart = [];
  saveCart();
  
  // Close payment modals
  closePaymentDetails();
  
  // Show success message
  showToast(`Order placed successfully! Order ID: ${orderId}`, 'success');
  
  // After 5 seconds, move to order history (simulating order completion)
  setTimeout(() => {
    const currentOrdersUpdated = JSON.parse(localStorage.getItem(`currentOrders_${currentUser}`) || '[]');
    const completedOrder = currentOrdersUpdated.find(o => o.orderId === orderId);
    if (completedOrder) {
      // Move to order history
      const orderHistory = JSON.parse(localStorage.getItem(`orderHistory_${currentUser}`) || '[]');
      completedOrder.status = 'delivered';
      orderHistory.push(completedOrder);
      localStorage.setItem(`orderHistory_${currentUser}`, JSON.stringify(orderHistory));
      
      // Remove from current orders
      const filtered = currentOrdersUpdated.filter(o => o.orderId !== orderId);
      localStorage.setItem(`currentOrders_${currentUser}`, JSON.stringify(filtered));
      
      // Update global orders
      const globalOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const globalOrder = globalOrders.find(o => o.orderId === orderId);
      if (globalOrder) {
        globalOrder.status = 'delivered';
        localStorage.setItem('orders', JSON.stringify(globalOrders));
      }
      
      // Create invoice
      const invoices = JSON.parse(localStorage.getItem(`invoices_${currentUser}`) || '[]');
      invoices.push({
        id: 'INV' + Date.now(),
        orderId: orderId,
        date: new Date().toISOString(),
        amount: currentPaymentTotal
      });
      localStorage.setItem(`invoices_${currentUser}`, JSON.stringify(invoices));
    }
  }, 5000);
}

function handleChatbotKeyPress(event) {
  if (event.key === 'Enter') {
    sendChatbotMessage();
  }
}

function toggleChatbot() {
  const win = $('#chatbotWindow');
  if (!win) return;
  const isOpen = win.style.display === 'flex';
  win.style.display = isOpen ? 'none' : 'flex';
}

function trackOrder(orderId) {
  navigateToSection('#profile');
  showProfileTab('track');
  if (orderId) {
    const all = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = all.find(o => o.orderId === orderId);
    if (order) populateTrackingDetails(order);
  } else {
    const inputs = [document.getElementById('orderSearchInput'), document.getElementById('orderSearchTrackInput')].filter(Boolean);
    const input = inputs.find(i => i.offsetParent !== null) || inputs[0] || null;
    const details = document.getElementById('orderDetailsSection');
    if (details) details.style.display = 'none';
    if (input) input.focus();
  }
}

function populateTrackingDetails(order) {
  const idEl = document.getElementById('trackingOrderId');
  const dateEl = document.getElementById('orderDate');
  const totalEl = document.getElementById('trackingOrderTotal');
  const addrEl = document.getElementById('deliveryAddress');
  const badge = document.getElementById('orderStatusBadge');
  const details = document.getElementById('orderDetailsSection');
  if (idEl) idEl.textContent = order.orderId;
  if (dateEl) dateEl.textContent = 'Placed on ' + new Date(order.orderDate).toLocaleDateString();
  if (totalEl) totalEl.textContent = '₹' + Number(order.total || 0).toFixed(2);
  if (badge) badge.querySelector('.status-text').textContent = (order.status || '').toUpperCase();
  if (addrEl) {
    addrEl.innerHTML = `
      <p class="address-name">${order.deliveryAddress?.name || ''}</p>
      <p class="address-text">${order.deliveryAddress?.address || ''}</p>
      <p class="address-phone">📞 ${order.deliveryAddress?.phone || ''}</p>
    `;
  }
  if (details) details.style.display = 'block';
}

function searchOrder(e) {
  const inputs = [document.getElementById('orderSearchInput'), document.getElementById('orderSearchTrackInput')].filter(Boolean);
  const input = inputs.find(i => i.offsetParent !== null) || inputs[0] || null;
  const val = (input?.value || '').trim();
  if (e && e.key && e.key !== 'Enter') return;
  if (!val) return;
  const all = JSON.parse(localStorage.getItem('orders') || '[]');
  const order = all.find(o => (o.orderId || '').toLowerCase() === val.toLowerCase());
  if (order) {
    populateTrackingDetails(order);
    showToast('Order found', 'success');
  } else {
    showToast('Order not found', 'error');
  }
}

function closeTrackOrder() {
  navigateToSection('#profile');
  showProfileTab('currentOrders');
}

function submitProductReview() {
  const name = document.getElementById('reviewName')?.value.trim();
  const rating = document.getElementById('reviewRating')?.value;
  const comment = document.getElementById('reviewComment')?.value.trim();
  const product = document.getElementById('pdName')?.textContent.trim();
  const list = document.getElementById('reviewsList');
  const form = document.getElementById('reviewForm');
  if (!name || !rating || !comment || !product) return;
  const key = `reviews_${product}`;
  const reviews = JSON.parse(localStorage.getItem(key) || '[]');
  reviews.unshift({ name, rating: parseInt(rating), comment, date: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(reviews));
  if (list) {
    list.innerHTML = reviews.map(r => `
      <div class="review-item">
        <strong>${r.name}</strong> • ⭐ ${r.rating}<br>
        <span>${r.comment}</span>
      </div>
    `).join('');
  }
  if (form) form.reset();
  showToast('Review submitted!', 'success');
}

function sendChatbotMessage() {
  const input = $('#chatbotInput');
  const messages = $('#chatbotMessages');
  
  if (!input || !messages || !input.value.trim()) return;
  
  const userMessage = input.value.trim();
  input.value = '';
  
  // Add user message
  const userMsgDiv = document.createElement('div');
  userMsgDiv.className = 'chatbot-message user';
  userMsgDiv.innerHTML = `<p>${userMessage}</p>`;
  messages.appendChild(userMsgDiv);
  messages.scrollTop = messages.scrollHeight;
  
  // Simulate bot response
  setTimeout(() => {
    const botResponse = getBotResponse(userMessage);
    const botMsgDiv = document.createElement('div');
    botMsgDiv.className = 'chatbot-message bot';
    botMsgDiv.innerHTML = `<p>${botResponse}</p>`;
    messages.appendChild(botMsgDiv);
    messages.scrollTop = messages.scrollHeight;
  }, 500);
}

function getBotResponse(message) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return 'Hello! How can I help you today? 😊';
  } else if (lowerMsg.includes('order') || lowerMsg.includes('delivery')) {
    return 'We offer fast delivery! Orders are typically delivered within 2-4 hours. Would you like to know more?';
  } else if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
    return 'Our prices are competitive and we offer great deals! Check out our products section for current prices.';
  } else if (lowerMsg.includes('payment') || lowerMsg.includes('pay')) {
    return 'We accept all major payment methods including UPI, cards, and cash on delivery.';
  } else if (lowerMsg.includes('return') || lowerMsg.includes('refund')) {
    return 'We have a 7-day return policy. If you\'re not satisfied, contact our support team!';
  } else if (lowerMsg.includes('help') || lowerMsg.includes('support')) {
    return 'I\'m here to help! You can ask me about orders, delivery, payments, or products.';
  } else {
    return 'Thanks for your message! For detailed assistance, please contact our support team at support@grainsmart.com or call 1800-XXX-XXXX.';
  }
}

// ---------- INITIALIZATION ----------
document.addEventListener('DOMContentLoaded', () => {
  updateCart();
  loadProducts()
    .catch(() => {})
    .then(() => { renderCategories(); renderAllProducts(); loadTopProducts(); });
  updateAuthUI();

  // Header scroll: compact header when scrolled
  const headerEl = document.querySelector('header');
  if (headerEl) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) headerEl.classList.add('header-scrolled');
      else headerEl.classList.remove('header-scrolled');
    });
  }

  // Wire up search autocomplete
  createAutocompleteContainer();
  const searchBar = document.getElementById('search-bar');
  if (searchBar) {
    searchBar.addEventListener('input', (e) => updateAutocomplete(e.target.value));
    searchBar.addEventListener('keydown', handleSearchKeydown);
    document.addEventListener('click', (e) => {
      const ac = document.getElementById('autocompleteList');
      if (!ac) return;
      if (!document.querySelector('.search-box').contains(e.target)) ac.style.display = 'none';
    });
  }

  initDeliverTo();
  const slotSelect = document.getElementById('delivery-slot-select');
  if (slotSelect) {
    const savedSlot = localStorage.getItem('delivery_slot');
    if (savedSlot) {
      slotSelect.value = savedSlot.includes('Express') ? 'Express' : savedSlot;
    }
    slotSelect.addEventListener('change', handleSlotChange);
  }

  if (localStorage.getItem('currentUser')) {
    loadAddresses();
  }

  const checkoutBtn = $('.checkout-btn-zepto');
  if (checkoutBtn) checkoutBtn.addEventListener('click', proceedToCheckout);
  const checkout = $('.checkout-btn');
  if (checkout) checkout.addEventListener('click', proceedToCheckout);

  const container = $('#categoryContainer');
  if (container) {
    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollCategories(240); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); scrollCategories(-240); }
    });
  }

  $$('.product button').forEach(btn => {
    if (!btn.onclick) {
      btn.addEventListener('click', () => {
        const productEl = btn.closest('.product');
        const name = productEl?.querySelector('h3')?.textContent || '';
        if (name) addToCart(name.trim());
      });
    }
  });

  $$('.product').forEach(p => {
    const name = p.querySelector('h3')?.textContent || '';
    if (!p.querySelector('.product-actions-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'product-actions-overlay';
      overlay.innerHTML = `
        <button class="overlay-btn add">Add to Cart</button>
        <button class="overlay-btn desc">Check Description</button>
      `;
      const add = overlay.querySelector('.add');
      const desc = overlay.querySelector('.desc');
      add && add.addEventListener('click', (e) => { e.stopPropagation(); if (name) addToCart(name); });
      desc && desc.addEventListener('click', (e) => { e.stopPropagation(); if (name) openProductDetail(name); });
      p.appendChild(overlay);
    }
    // product overlay already added above
  });

  const newsletterForm = $('#newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#newsletterEmail')?.value.trim();
      if (email) {
        const subscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
        if (!subscriptions.includes(email)) {
          subscriptions.push(email);
          localStorage.setItem('newsletter_subscriptions', JSON.stringify(subscriptions));
        }
        showToast('Thank you for subscribing! You\'ll receive our latest offers!', 'success');
        newsletterForm.reset();
      }
    });
  }

  // Format card number as user types
  const cardNumberInput = document.getElementById('cardNumber');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\s/g, '');
      let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
      e.target.value = formattedValue;
    });
  }
  
  // Format expiry date
  const cardExpiryInput = document.getElementById('cardExpiry');
  if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
      e.target.value = value;
    });
  }
  
  // Only allow numbers for CVV
  const cardCvvInput = document.getElementById('cardCvv');
  if (cardCvvInput) {
    cardCvvInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
    });
  }
});
function renderCategories() {
  const container = document.getElementById('categoryContainer');
  if (!container) return;
  const cats = Array.from(new Set(allProducts.map(p => (p.category || '').trim()))).filter(Boolean);
  container.innerHTML = '';
  cats.forEach(cat => {
    const div = document.createElement('div');
    div.className = 'category';
    div.onclick = () => showCategoryProducts(cat);
    const img = document.createElement('img');
    img.src = `https://source.unsplash.com/featured/?${encodeURIComponent(cat)}`;
    img.alt = cat;
    img.onerror = () => handleCategoryImageError(img, cat);
    const h3 = document.createElement('h3');
    h3.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    div.appendChild(img);
    div.appendChild(h3);
    container.appendChild(div);
  });
}

function renderAllProducts() {
  const list = document.getElementById('allProductsList');
  if (!list) return;
  list.innerHTML = '';
  console.log('Rendering all products to DOM:', allProducts.length);
  allProducts.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.className = 'product';
    productDiv.setAttribute('data-category', product.category);
    productDiv.innerHTML = `
      <img src="${getProductImage(product)}" alt="${product.name}" onerror="handleImageError(this, '${product.name}')">
      <h3>${product.name}</h3>
      <p>₹${product.price} / ${product.category === 'fruits' ? 'kg' : product.category === 'cold drink' ? 'bottle' : 'piece'}</p>
      <div class="rating">⭐ ${product.rating || 4.0}</div>
      <div class="product-actions-overlay">
        <button class="overlay-btn add" onclick="addToCart('${product.name}')">Add to Cart</button>
        <button class="overlay-btn desc" onclick="openProductDetail('${product.name}')">Check Description</button>
      </div>
    `;
    list.appendChild(productDiv);
  });
}