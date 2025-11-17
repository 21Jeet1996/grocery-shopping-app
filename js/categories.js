// ==========================
// 🔹 CATEGORIES MANAGEMENT
// ==========================

async function loadCategories() {
  const categoryContainer = $('#categoryContainer');
  if (!categoryContainer) return;

  const categories = {};
  allProducts.forEach(product => {
    const cat = product.category;
    if (!categories[cat]) {
      categories[cat] = { name: cat, count: 0 };
    }
    categories[cat].count++;
  });

  categoryContainer.innerHTML = '';
  
  Object.values(categories).forEach(category => {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category';
    const categoryImage = CATEGORY_IMAGES[category.name.toLowerCase()] || 'assets/images/vegetables.svg';
    const placeholderImg = createPlaceholderSVG(category.name, 150, 120);
    
    categoryDiv.innerHTML = `
      <img src="${categoryImage}" alt="${category.name}" onerror="handleCategoryImageError(this, '${category.name}')">
      <h3>${category.name.charAt(0).toUpperCase() + category.name.slice(1)}</h3>
      <span class="category-count">${category.count} products</span>
    `;
    
    categoryDiv.addEventListener('click', () => {
      showCategoryProducts(category.name);
    });
    
    categoryContainer.appendChild(categoryDiv);
  });

  console.log('Rendering all products to DOM:', allProducts.length);
}

async function loadAllProductsSection() {
  const allProductsList = $('#allProductsList');
  if (!allProductsList) return;

  allProductsList.innerHTML = '';
  
  allProducts.forEach(product => {
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
    allProductsList.appendChild(productDiv);
  });
}
