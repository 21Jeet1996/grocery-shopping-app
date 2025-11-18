// ==========================
// 🔹 CATEGORIES MANAGEMENT
// ==========================

async function loadCategories() {
  // Check if we have the new sidebar layout
  const sidebar = document.getElementById('categorySidebarList');
  if (sidebar) {
    return loadSidebarCategories();
  }

  // Fallback to Legacy Grid Logic
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
    const categoryImage = getProductImage({category: category.name});
    
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
}

// NEW: Sidebar Logic
function loadSidebarCategories() {
  const sidebar = document.getElementById('categorySidebarList');
  if (!sidebar) return;
  
  const categories = Array.from(new Set(allProducts.map(p => p.category)));
  
  sidebar.innerHTML = '';
  
  categories.forEach((cat, index) => {
    const li = document.createElement('li');
    li.className = `sidebar-category-item ${index === 0 ? 'active' : ''}`;
    li.onclick = () => selectSidebarCategory(cat, li);
    
    li.innerHTML = `
      <img src="${getProductImage({category: cat})}" class="sidebar-cat-img" onerror="this.src='${createPlaceholderSVG(cat, 40, 40)}'">
      <span class="sidebar-cat-name">${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
    `;
    sidebar.appendChild(li);
  });
  
  if (categories.length > 0) {
    loadSidebarCategoryProducts(categories[0]);
  }
}

function selectSidebarCategory(category, element) {
  document.querySelectorAll('.sidebar-category-item').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
  loadSidebarCategoryProducts(category);
}

function loadSidebarCategoryProducts(category) {
  const grid = document.getElementById('categoryProductsGrid');
  const title = document.getElementById('activeCategoryTitle');
  if (!grid) return;
  
  if (title) title.textContent = category.charAt(0).toUpperCase() + category.slice(1);
  
  const products = allProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
  
  grid.innerHTML = '';
  products.forEach(product => {
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
          <img src="${getProductImage(product)}" alt="${product.name}" onerror="this.src='${placeholderImg}'">
        </div>
        <div class="product-content">
          <h3>${product.name}</h3>
          <div class="product-unit">${unit}</div>
          <div class="product-price-row">
            <span class="product-price">₹${product.price}</span>
            ${discount > 0 ? `<span class="product-original-price">₹${originalPrice}</span>` : ''}
          </div>
          <div class="product-actions">
            <button class="product-add-btn" onclick="event.stopPropagation(); addToCart('${product.name}')">
              <span>🛒</span> Add
            </button>
            <button class="product-view-btn" onclick="event.stopPropagation(); openProductDetail('${product.name}')">
              👁️
            </button>
          </div>
        </div>
    `;
    grid.appendChild(productDiv);
  });
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

function scrollCategories(amount) {
  const container = document.getElementById('categoryContainer');
  if (container) {
    container.scrollBy({ left: amount, behavior: 'smooth' });
  }
}

function showCategoryProducts(cat) {
  // Redirect to new sidebar logic if available
  const sidebar = document.getElementById('categorySidebarList');
  if (sidebar) {
    loadSidebarCategoryProducts(cat);
    // Find and active the item
    const items = Array.from(sidebar.children);
    const target = items.find(li => li.textContent.toLowerCase().includes(cat.toLowerCase()));
    if (target) {
        document.querySelectorAll('.sidebar-category-item').forEach(el => el.classList.remove('active'));
        target.classList.add('active');
    }
    return;
  }
}

function backToCategories() {
    // Legacy
}
