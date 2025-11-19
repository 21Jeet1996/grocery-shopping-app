// ==========================
// 🔹 PRODUCTS MANAGEMENT
// ==========================

let allProducts = [];
const CATEGORY_IMAGES = {
  'fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80',
  'vegetables': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=400&q=80',
  'dairy': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80',
  'atta': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
  'soap': 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&w=400&q=80',
  'biscuit': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80',
  'cold drink': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
  'pulses': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
  'chocolate': 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=400&q=80'
};

function getProductImage(product) {
  // 1. Use the image URL directly from the product object if available
  if (product.img && product.img.startsWith('http')) {
    return product.img;
  }

  // 2. Fallback to category image
  const key = (product.category || '').trim().toLowerCase();
  if (CATEGORY_IMAGES[key]) {
    return CATEGORY_IMAGES[key];
  }

  // 3. Final fallback placeholder
  return 'https://placehold.co/400x400?text=' + encodeURIComponent(product.name || 'Product');
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

function getProductUnit(category) {
  const units = {
    'fruits': 'kg',
    'vegetables': 'kg',
    'cold drink': 'bottle',
    'dairy': 'pack',
    'pulses': 'kg'
  };
  return units[category?.toLowerCase()] || 'piece';
}

function getProductBadge(product) {
  if (product.searchCount > 180) return { text: 'Best Seller', class: 'bestseller' };
  if (product.price > 300) return { text: 'Premium', class: 'offer' };
  if (Math.random() > 0.7) return { text: 'Offer', class: 'new' };
  return null;
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let stars = '★'.repeat(fullStars);
  if (hasHalf) stars += '☆';
  return stars;
}

function loadTopProducts() {
  const homeProducts = $('#homeProducts');
  if (!homeProducts) return;
  
  const topProducts = [...allProducts]
    .sort((a, b) => b.searchCount - a.searchCount)
    .slice(0, 8);
  
  homeProducts.innerHTML = '';
  topProducts.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.className = 'product product-view-only';
    productDiv.setAttribute('data-category', product.category);
    
    const unit = getProductUnit(product.category);
    const badge = getProductBadge(product);
    const placeholderImg = createPlaceholderSVG(product.name, 260, 240);
    
    productDiv.innerHTML = `
      <div class="product-image-container">
        ${badge ? `<div class="product-badge ${badge.class}">${badge.text}</div>` : ''}
        <img src="${getProductImage(product)}" alt="${product.name}" onerror="this.src='${placeholderImg}'">
      </div>
      <div class="product-content">
        <h3>${product.name}</h3>
        <div class="product-rating">
          <span class="rating-stars">${generateStars(product.rating || 4.0)}</span>
          <span class="rating-count">(${Math.floor(Math.random() * 500 + 100)})</span>
        </div>
        <div class="product-price-row">
          <span class="product-price">₹${product.price}</span>
        </div>
        <p class="view-only-text">Click to view details</p>
      </div>
    `;
    productDiv.addEventListener('click', () => {
      openProductDetail(product.name);
    });
    homeProducts.appendChild(productDiv);
  });
}

function showCategoryProducts(category) {
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
  
  if (categoryContainer) categoryContainer.style.display = 'none';
  categoryProductsSection.style.display = 'block';
  
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  if (categoryProductsTitle) categoryProductsTitle.textContent = categoryName;
  
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
      
      const unit = getProductUnit(product.category);
      const badge = getProductBadge(product);
      const placeholderImg = createPlaceholderSVG(product.name, 260, 240);
      const originalPrice = Math.floor(product.price * 1.2);
      const discount = Math.floor(((originalPrice - product.price) / originalPrice) * 100);
      
      productDiv.innerHTML = `
        <div class="product-image-container">
          ${badge ? `<div class="product-badge ${badge.class}">${badge.text}</div>` : ''}
          <button class="product-wishlist-btn" onclick="event.stopPropagation();">♡</button>
          <img src="${getProductImage(product)}" alt="${product.name}" onerror="this.src='${placeholderImg}'">
        </div>
        <div class="product-content">
          <h3>${product.name}</h3>
          <div class="product-unit">${unit}</div>
          <div class="product-rating">
            <span class="rating-stars">${generateStars(product.rating || 4.0)}</span>
            <span class="rating-count">(${Math.floor(Math.random() * 500 + 100)})</span>
          </div>
          <div class="product-price-row">
            <span class="product-price">₹${product.price}</span>
            ${discount > 0 ? `<span class="product-original-price">₹${originalPrice}</span>` : ''}
            ${discount > 0 ? `<span class="product-discount">${discount}% off</span>` : ''}
          </div>
          <div class="product-delivery">🚚 Free delivery on orders above ₹500</div>
          <div class="product-actions">
            <button class="product-add-btn" onclick="event.stopPropagation(); addToCart('${product.name}')">
              <span>🛒</span> Add to Cart
            </button>
            <button class="product-view-btn" onclick="event.stopPropagation(); openProductDetail('${product.name}')">
              👁️
            </button>
          </div>
        </div>
      `;
      categoryProductsList.appendChild(productDiv);
    });
  }
  
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
  const thumb1 = document.getElementById('pdThumb1');
  const thumb2 = document.getElementById('pdThumb2');
  const thumb3 = document.getElementById('pdThumb3');
  const productName = document.getElementById('pdName');
  const ratingDiv = document.getElementById('pdRating');
  const priceDiv = document.getElementById('pdPrice');
  const originalPriceDiv = document.getElementById('pdOriginalPrice');
  const discountDiv = document.getElementById('pdDiscount');
  const badgesDiv = document.getElementById('pdBadges');
  const desc = document.getElementById('pdDesc');
  const addBtn = document.getElementById('pdAdd');
  const buyBtn = document.getElementById('pdBuy');
  const qtyInput = document.getElementById('pdQtyInput');
  const qtyMinus = document.getElementById('pdQtyMinus');
  const qtyPlus = document.getElementById('pdQtyPlus');
  
  const productImg = getProductImage(product);
  const originalPrice = Math.floor(product.price * 1.2);
  const discount = Math.floor(((originalPrice - product.price) / originalPrice) * 100);
  const badge = getProductBadge(product);
  
  if (img) img.src = productImg;
  if (thumb1) thumb1.src = productImg;
  if (thumb2) thumb2.src = productImg;
  if (thumb3) thumb3.src = productImg;
  
  if (productName) productName.textContent = product.name;
  
  if (ratingDiv) {
    ratingDiv.innerHTML = `
      <span class="stars">${generateStars(product.rating || 4.0)}</span>
      <span class="rating-text">${(product.rating || 4.0).toFixed(1)} (${Math.floor(Math.random() * 500 + 100)} reviews)</span>
    `;
  }
  
  if (priceDiv) priceDiv.textContent = `₹${product.price}`;
  if (originalPriceDiv) {
    originalPriceDiv.textContent = discount > 0 ? `₹${originalPrice}` : '';
    originalPriceDiv.style.display = discount > 0 ? 'block' : 'none';
  }
  if (discountDiv) {
    discountDiv.textContent = discount > 0 ? `${discount}% OFF` : '';
    discountDiv.style.display = discount > 0 ? 'inline-block' : 'none';
  }
  
  if (badgesDiv && badge) {
    badgesDiv.innerHTML = `<div class="product-badge ${badge.class}">${badge.text}</div>`;
  }
  
  if (desc) desc.textContent = `Premium quality ${product.name.toLowerCase()}. Sourced fresh from our trusted farmers and delivered straight to your doorstep. Enjoy the taste of farm-fresh goodness with every bite!`;
  
  if (qtyInput) qtyInput.value = 1;
  
  if (qtyMinus) {
    qtyMinus.onclick = () => {
      const current = parseInt(qtyInput.value) || 1;
      qtyInput.value = Math.max(1, current - 1);
    };
  }
  
  if (qtyPlus) {
    qtyPlus.onclick = () => {
      const current = parseInt(qtyInput.value) || 1;
      qtyInput.value = current + 1;
    };
  }
  
  if (addBtn) {
    addBtn.onclick = () => {
      const qty = parseInt(qtyInput?.value) || 1;
      for (let i = 0; i < qty; i++) {
        addToCart(product.name);
      }
    };
  }
  
  if (buyBtn) {
    buyBtn.onclick = () => {
      const qty = parseInt(qtyInput?.value) || 1;
      for (let i = 0; i < qty; i++) {
        addToCart(product.name);
      }
      proceedToCheckout();
    };
  }
  
  detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  loadProductReviews(product.name);
}

function loadProductReviews(productName) {
  const reviewsList = document.getElementById('pdReviewsList');
  if (!reviewsList) return;
  
  // Mock reviews data (since we don't have a backend)
  // In a real app, fetch this from an API
  const storedReviews = JSON.parse(localStorage.getItem(`reviews_${productName}`)) || [];
  
  const defaultReviews = [
    { name: "Rahul S.", rating: 5, date: "2 days ago", comment: "Excellent quality and fresh!" },
    { name: "Priya M.", rating: 4, date: "1 week ago", comment: "Good packaging, timely delivery." },
    { name: "Amit K.", rating: 5, date: "2 weeks ago", comment: "Value for money. Highly recommended." }
  ];
  
  const reviews = [...storedReviews, ...defaultReviews];
  
  // Update Summary
  const avgRating = (reviews.reduce((acc, r) => acc + parseInt(r.rating), 0) / reviews.length).toFixed(1);
  
  const summaryContainer = document.querySelector('.rating-overview');
  if (summaryContainer) {
    summaryContainer.innerHTML = `
      <div class="avg-rating">${avgRating}</div>
      <div>
        <div class="stars">${generateStars(avgRating)}</div>
        <div class="rating-count">${reviews.length} Ratings & Reviews</div>
      </div>
    `;
  }

  // Render List
  reviewsList.innerHTML = reviews.map(review => `
    <div class="review-card">
      <div class="review-header">
        <span class="reviewer-name">${review.name}</span>
        <span class="review-date">${review.date}</span>
      </div>
      <div class="review-stars">${generateStars(review.rating)}</div>
      <p class="review-text">${review.comment}</p>
    </div>
  `).join('');
}

function submitProductReview() {
  const name = document.getElementById('pdReviewName').value;
  const rating = document.getElementById('pdReviewRating').value;
  const comment = document.getElementById('pdReviewComment').value;
  const productName = document.getElementById('pdName').textContent;
  
  if (!name || !comment) {
    showToast('Please fill all fields', 'error');
    return;
  }
  
  const newReview = {
    name,
    rating: parseInt(rating),
    comment,
    date: "Just now"
  };
  
  // Save to local storage
  const key = `reviews_${productName}`;
  const existing = JSON.parse(localStorage.getItem(key)) || [];
  existing.unshift(newReview);
  localStorage.setItem(key, JSON.stringify(existing));
  
  showToast('Review submitted successfully!', 'success');
  
  // Reset form
  document.getElementById('pdReviewForm').reset();
  
  // Reload reviews
  loadProductReviews(productName);
}

function closeProductDetail() {
  const detail = document.getElementById('productDetail');
  if (detail) detail.style.display = 'none';
  const categories = document.getElementById('categories');
  if (categories) categories.style.display = 'block';
}
