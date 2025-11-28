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
  const countBadge = document.getElementById('productCountBadge');
  if (!grid) return;
  
  if (title) title.textContent = category.charAt(0).toUpperCase() + category.slice(1);
  
  // Reset filters when changing category
  currentCategoryFilters = {
    sortBy: 'relevance',
    minPrice: 0,
    maxPrice: 1000,
    minRating: 0
  };
  updateFilterTags();
  showClearFiltersBtn();
  
  const products = allProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
  
  // Update product count
  if (countBadge) countBadge.textContent = `${products.length} products`;
  
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

// ==================
// INLINE FILTERS
// ==================
let currentCategoryFilters = {
  sortBy: 'relevance',
  minPrice: 0,
  maxPrice: 1000,
  minRating: 0
};

let currentActiveCategory = '';

function toggleCategoryFilterPanel() {
  const panel = document.getElementById('categoryFilterPanel');
  const btn = document.querySelector('.category-filter-btn');
  const content = document.querySelector('.categories-content');
  
  if (!panel) {
    createCategoryFilterPanel();
    document.getElementById('categoryFilterPanel').classList.add('open');
    document.querySelector('.category-filter-btn').classList.add('active');
    if (content) content.classList.add('with-panel');
  } else {
    panel.classList.toggle('open');
    btn.classList.toggle('active');
    if (content) content.classList.toggle('with-panel');
  }
}

function createCategoryFilterPanel() {
  if (document.getElementById('categoryFilterPanel')) return;
  
  const panel = document.createElement('div');
  panel.id = 'categoryFilterPanel';
  panel.className = 'category-filter-panel';
  panel.innerHTML = `
    <div class="filter-panel-header">
      <h3>Filter & Sort</h3>
      <button class="filter-panel-close" onclick="toggleCategoryFilterPanel()">✕</button>
    </div>
    
    <div class="filter-panel-content">
      <div class="filter-section">
        <div class="filter-section-title">Sort By</div>
        <div class="filter-option" onclick="applySortFilter('relevance')">Relevance</div>
        <div class="filter-option" onclick="applySortFilter('price-low')">Price: Low to High</div>
        <div class="filter-option" onclick="applySortFilter('price-high')">Price: High to Low</div>
        <div class="filter-option" onclick="applySortFilter('rating')">Top Rated</div>
        <div class="filter-option" onclick="applySortFilter('popularity')">Popularity</div>
      </div>
      
      <div class="filter-section">
        <div class="filter-section-title">Price Range</div>
        <div class="filter-option" onclick="applyPriceFilter(0, 1000)">All Prices</div>
        <div class="filter-option" onclick="applyPriceFilter(0, 50)">Under ₹50</div>
        <div class="filter-option" onclick="applyPriceFilter(50, 100)">₹50 - ₹100</div>
        <div class="filter-option" onclick="applyPriceFilter(100, 200)">₹100 - ₹200</div>
        <div class="filter-option" onclick="applyPriceFilter(200, 500)">₹200 - ₹500</div>
        <div class="filter-option" onclick="applyPriceFilter(500, 1000)">₹500+</div>
      </div>
      
      <div class="filter-section">
        <div class="filter-section-title">Rating</div>
        <div class="filter-option" onclick="applyRatingFilter(0)">All Ratings</div>
        <div class="filter-option" onclick="applyRatingFilter(4)">⭐ 4+ Stars</div>
        <div class="filter-option" onclick="applyRatingFilter(3)">⭐ 3+ Stars</div>
        <div class="filter-option" onclick="applyRatingFilter(2)">⭐ 2+ Stars</div>
      </div>
    </div>
    
    <div class="filter-panel-actions">
      <button class="clear-filters-btn" onclick="clearInlineFilters()">Clear All</button>
      <button class="apply-filters-btn" onclick="closeCategoryFilterPanel()">Done</button>
    </div>
  `;
  
  document.body.appendChild(panel);
}

function closeCategoryFilterPanel() {
  const panel = document.getElementById('categoryFilterPanel');
  const btn = document.querySelector('.category-filter-btn');
  const content = document.querySelector('.categories-content');
  if (panel) panel.classList.remove('open');
  if (btn) btn.classList.remove('active');
  if (content) content.classList.remove('with-panel');
}

function applySortFilter(sortBy) {
  currentCategoryFilters.sortBy = sortBy;
  updateFilterOptionActive();
  updateFilterTags();
  reloadFilteredProducts();
  showClearFiltersBtn();
}

function applyPriceFilter(min, max) {
  currentCategoryFilters.minPrice = min;
  currentCategoryFilters.maxPrice = max;
  updateFilterOptionActive();
  updateFilterTags();
  reloadFilteredProducts();
  showClearFiltersBtn();
}

function applyRatingFilter(rating) {
  currentCategoryFilters.minRating = rating;
  updateFilterOptionActive();
  updateFilterTags();
  reloadFilteredProducts();
  showClearFiltersBtn();
}

function updateFilterOptionActive() {
  const panel = document.getElementById('categoryFilterPanel');
  if (!panel) return;
  
  // Update sort options
  const sortOptions = panel.querySelectorAll('.filter-section:nth-child(1) .filter-option');
  sortOptions.forEach(opt => {
    opt.classList.remove('active');
    if (opt.textContent.includes('Relevance') && currentCategoryFilters.sortBy === 'relevance') opt.classList.add('active');
    if (opt.textContent.includes('Low to High') && currentCategoryFilters.sortBy === 'price-low') opt.classList.add('active');
    if (opt.textContent.includes('High to Low') && currentCategoryFilters.sortBy === 'price-high') opt.classList.add('active');
    if (opt.textContent.includes('Top Rated') && currentCategoryFilters.sortBy === 'rating') opt.classList.add('active');
    if (opt.textContent.includes('Popularity') && currentCategoryFilters.sortBy === 'popularity') opt.classList.add('active');
  });
  
  // Update price options
  const priceOptions = panel.querySelectorAll('.filter-section:nth-child(2) .filter-option');
  priceOptions.forEach(opt => {
    opt.classList.remove('active');
    if (opt.textContent.includes('All Prices') && currentCategoryFilters.minPrice === 0 && currentCategoryFilters.maxPrice === 1000) opt.classList.add('active');
    if (opt.textContent.includes('50') && currentCategoryFilters.minPrice === 0 && currentCategoryFilters.maxPrice === 50) opt.classList.add('active');
    if (opt.textContent.includes('50 - ₹100') && currentCategoryFilters.minPrice === 50 && currentCategoryFilters.maxPrice === 100) opt.classList.add('active');
    if (opt.textContent.includes('100 - ₹200') && currentCategoryFilters.minPrice === 100 && currentCategoryFilters.maxPrice === 200) opt.classList.add('active');
    if (opt.textContent.includes('200 - ₹500') && currentCategoryFilters.minPrice === 200 && currentCategoryFilters.maxPrice === 500) opt.classList.add('active');
    if (opt.textContent.includes('500+') && currentCategoryFilters.minPrice === 500 && currentCategoryFilters.maxPrice === 1000) opt.classList.add('active');
  });
  
  // Update rating options
  const ratingOptions = panel.querySelectorAll('.filter-section:nth-child(3) .filter-option');
  ratingOptions.forEach(opt => {
    opt.classList.remove('active');
    if (opt.textContent.includes('All Ratings') && currentCategoryFilters.minRating === 0) opt.classList.add('active');
    if (opt.textContent.includes('4+') && currentCategoryFilters.minRating === 4) opt.classList.add('active');
    if (opt.textContent.includes('3+') && currentCategoryFilters.minRating === 3) opt.classList.add('active');
    if (opt.textContent.includes('2+') && currentCategoryFilters.minRating === 2) opt.classList.add('active');
  });
}

function showClearFiltersBtn() {
  const badge = document.getElementById('filterCountBadge');
  const hasFilters = currentCategoryFilters.sortBy !== 'relevance' ||
                     currentCategoryFilters.minPrice > 0 ||
                     currentCategoryFilters.maxPrice < 1000 ||
                     currentCategoryFilters.minRating > 0;
  
  if (hasFilters) {
    let count = 0;
    if (currentCategoryFilters.sortBy !== 'relevance') count++;
    if (currentCategoryFilters.minPrice > 0 || currentCategoryFilters.maxPrice < 1000) count++;
    if (currentCategoryFilters.minRating > 0) count++;
    
    if (badge) {
      badge.textContent = count;
      badge.style.display = 'flex';
    }
  } else {
    if (badge) badge.style.display = 'none';
  }
}

function clearInlineFilters() {
  currentCategoryFilters = {
    sortBy: 'relevance',
    minPrice: 0,
    maxPrice: 1000,
    minRating: 0
  };
  updateFilterTags();
  reloadFilteredProducts();
  showClearFiltersBtn();
  showToast('Filters cleared', 'info');
}

function updateFilterTags() {
  const tagsContainer = document.getElementById('activeFilterTags');
  if (!tagsContainer) return;
  
  tagsContainer.innerHTML = '';
  
  if (currentCategoryFilters.sortBy !== 'relevance') {
    const sortLabels = {
      'price-low': 'Price: Low to High',
      'price-high': 'Price: High to Low',
      'rating': 'Top Rated',
      'popularity': 'Popularity'
    };
    tagsContainer.innerHTML += `
      <div class="filter-tag">
        ${sortLabels[currentCategoryFilters.sortBy]}
        <span class="remove-tag" onclick="removeSortFilter()">×</span>
      </div>
    `;
  }
  
  if (currentCategoryFilters.minPrice > 0 || currentCategoryFilters.maxPrice < 1000) {
    tagsContainer.innerHTML += `
      <div class="filter-tag">
        ₹${currentCategoryFilters.minPrice} - ₹${currentCategoryFilters.maxPrice}
        <span class="remove-tag" onclick="removePriceFilter()">×</span>
      </div>
    `;
  }
  
  if (currentCategoryFilters.minRating > 0) {
    tagsContainer.innerHTML += `
      <div class="filter-tag">
        ${currentCategoryFilters.minRating}+ Stars
        <span class="remove-tag" onclick="removeRatingFilter()">×</span>
      </div>
    `;
  }
}

function removeSortFilter() {
  currentCategoryFilters.sortBy = 'relevance';
  updateFilterTags();
  reloadFilteredProducts();
  showClearFiltersBtn();
}

function removePriceFilter() {
  currentCategoryFilters.minPrice = 0;
  currentCategoryFilters.maxPrice = 1000;
  updateFilterTags();
  reloadFilteredProducts();
  showClearFiltersBtn();
}

function removeRatingFilter() {
  currentCategoryFilters.minRating = 0;
  updateFilterTags();
  reloadFilteredProducts();
  showClearFiltersBtn();
}

function reloadFilteredProducts() {
  const title = document.getElementById('activeCategoryTitle');
  const category = title ? title.textContent.toLowerCase() : '';
  
  if (!category || category === 'select a category') return;
  
  let products = allProducts.filter(p => p.category.toLowerCase() === category);
  
  // Apply price filter
  products = products.filter(p => 
    p.price >= currentCategoryFilters.minPrice && 
    p.price <= currentCategoryFilters.maxPrice
  );
  
  // Apply rating filter
  if (currentCategoryFilters.minRating > 0) {
    products = products.filter(p => (p.rating || 4) >= currentCategoryFilters.minRating);
  }
  
  // Apply sorting
  switch (currentCategoryFilters.sortBy) {
    case 'price-low':
      products.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      products.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      products.sort((a, b) => (b.rating || 4) - (a.rating || 4));
      break;
    case 'popularity':
      products.sort((a, b) => (b.searchCount || 0) - (a.searchCount || 0));
      break;
  }
  
  // Update product count badge
  const countBadge = document.getElementById('productCountBadge');
  if (countBadge) countBadge.textContent = `${products.length} products`;
  
  // Render filtered products
  renderCategoryProducts(products);
}

function renderCategoryProducts(products) {
  const grid = document.getElementById('categoryProductsGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  if (products.length === 0) {
    grid.innerHTML = '<p class="no-products">No products found matching your filters.</p>';
    return;
  }
  
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
          <div class="product-rating">
            <span class="rating-stars">${generateStars(product.rating || 4.0)}</span>
          </div>
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

// Close filter panel when clicking outside
document.addEventListener('click', function(e) {
  const panel = document.getElementById('categoryFilterPanel');
  const btn = document.querySelector('.category-filter-btn');
  const content = document.querySelector('.categories-content');
  
  if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) {
    if (panel.classList.contains('open')) {
      panel.classList.remove('open');
      btn.classList.remove('active');
      if (content) content.classList.remove('with-panel');
    }
  }
});
