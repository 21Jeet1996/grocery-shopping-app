// ==========================
// SEARCH, FILTERS & VOICE SEARCH
// ==========================

let autocompleteIndex = -1;
let autocompleteItems = [];

// Filter State
let activeFilters = {
  categories: [],
  minPrice: 0,
  maxPrice: 1000,
  minRating: 0,
  sortBy: 'relevance'
};

// Voice Search State
let voiceRecognition = null;
let isListening = false;

// ==================
// AUTOCOMPLETE
// ==================
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
    item.innerHTML = `
      <div class="autocomplete-image">
        <img src="${getProductImage(m)}" onerror="this.src='${createPlaceholderSVG(m.name,40,32)}'"/>
      </div>
      <div class="autocomplete-info">
        <div class="autocomplete-name">${m.name}</div>
        <div class="autocomplete-meta">
          <span class="ac-category">${m.category}</span>
          <span class="ac-dot">•</span>
          <span class="ac-price">₹${m.price}</span>
        </div>
      </div>
    `;
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

// ==================
// SEARCH PRODUCTS
// ==================
function searchProducts() {
  const input = (document.getElementById('search-bar')?.value || '').trim().toLowerCase();
  
  // Update autocomplete
  updateAutocomplete(input);

  const cats = document.querySelectorAll('.category');
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

  const products = document.querySelectorAll('.product');
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

  if (input && !catFound && !prodFound) {
    console.log('No results found for:', input);
  }
}

// ==================
// VOICE SEARCH
// ==================
function initVoiceSearch() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    const voiceBtn = document.getElementById('voiceSearchBtn');
    if (voiceBtn) {
      voiceBtn.style.display = 'none';
    }
    console.log('Voice search not supported in this browser');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  voiceRecognition = new SpeechRecognition();
  voiceRecognition.continuous = false;
  voiceRecognition.interimResults = true;
  voiceRecognition.lang = 'en-IN';

  voiceRecognition.onstart = function() {
    isListening = true;
    updateVoiceUI(true);
  };

  voiceRecognition.onend = function() {
    isListening = false;
    updateVoiceUI(false);
    hideVoiceOverlay();
  };

  voiceRecognition.onresult = function(event) {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    const voiceTranscript = document.getElementById('voiceTranscript');
    if (voiceTranscript) {
      voiceTranscript.textContent = finalTranscript || interimTranscript || 'Listening...';
    }

    if (finalTranscript) {
      const searchBar = document.getElementById('search-bar');
      if (searchBar) {
        searchBar.value = finalTranscript;
        searchProducts();
      }
      setTimeout(hideVoiceOverlay, 500);
    }
  };

  voiceRecognition.onerror = function(event) {
    console.error('Voice recognition error:', event.error);
    isListening = false;
    updateVoiceUI(false);
    hideVoiceOverlay();
    
    if (event.error === 'not-allowed') {
      showToast('Please allow microphone access for voice search', 'error');
    } else if (event.error === 'no-speech') {
      showToast('No speech detected. Please try again.', 'info');
    }
  };
}

function startVoiceSearch() {
  if (!voiceRecognition) {
    showToast('Voice search is not supported in your browser', 'error');
    return;
  }

  if (isListening) {
    voiceRecognition.stop();
    return;
  }

  showVoiceOverlay();
  voiceRecognition.start();
}

function stopVoiceSearch() {
  if (voiceRecognition && isListening) {
    voiceRecognition.stop();
  }
  hideVoiceOverlay();
}

function showVoiceOverlay() {
  const overlay = document.getElementById('voiceListeningOverlay');
  if (overlay) {
    overlay.classList.add('show');
    const transcript = document.getElementById('voiceTranscript');
    if (transcript) transcript.textContent = 'Listening...';
  }
}

function hideVoiceOverlay() {
  const overlay = document.getElementById('voiceListeningOverlay');
  if (overlay) {
    overlay.classList.remove('show');
  }
}

function updateVoiceUI(listening) {
  const voiceBtn = document.getElementById('voiceSearchBtn');
  if (voiceBtn) {
    voiceBtn.classList.toggle('listening', listening);
  }
}

// ==================
// FILTERS
// ==================
function initFilters() {
  createFilterPanel();
  loadCategoryFilters();
  setupFilterEventListeners();
}

function createFilterPanel() {
  const existingPanel = document.getElementById('filterPanel');
  if (existingPanel) return;

  const header = document.querySelector('header');
  if (!header) return;

  const filterPanel = document.createElement('div');
  filterPanel.id = 'filterPanel';
  filterPanel.className = 'filter-panel';
  filterPanel.innerHTML = `
    <div class="filter-panel-inner">
      <div class="filter-header">
        <h3>Filter & Sort</h3>
        <div class="filter-actions">
          <button class="clear-filters-btn" onclick="clearAllFilters()">Clear All</button>
          <button class="apply-filters-btn" onclick="applyFilters()">Apply Filters</button>
        </div>
      </div>
      <div class="filter-groups">
        <div class="filter-group">
          <div class="filter-group-title"><span>📂</span> Categories</div>
          <div class="category-pills" id="categoryPills"></div>
        </div>
        <div class="filter-group">
          <div class="filter-group-title"><span>💰</span> Price Range</div>
          <div class="price-range-container">
            <div class="price-range-values">
              <span id="minPriceDisplay">₹0</span>
              <span id="maxPriceDisplay">₹1000</span>
            </div>
            <input type="range" class="price-slider" id="maxPriceSlider" min="0" max="1000" value="1000" oninput="updatePriceFilter(this.value)">
            <div class="price-quick-filters">
              <button class="price-quick-btn" onclick="setPriceRange(0, 50)">Under ₹50</button>
              <button class="price-quick-btn" onclick="setPriceRange(50, 100)">₹50-₹100</button>
              <button class="price-quick-btn" onclick="setPriceRange(100, 200)">₹100-₹200</button>
              <button class="price-quick-btn" onclick="setPriceRange(200, 500)">₹200-₹500</button>
              <button class="price-quick-btn" onclick="setPriceRange(500, 1000)">₹500+</button>
            </div>
          </div>
        </div>
        <div class="filter-group">
          <div class="filter-group-title"><span>⭐</span> Rating</div>
          <div class="rating-options">
            <label class="rating-option" onclick="setRatingFilter(4)">
              <input type="radio" name="rating" value="4">
              <span class="rating-stars-filter">★★★★☆</span>
              <span class="rating-label">4+ Stars</span>
            </label>
            <label class="rating-option" onclick="setRatingFilter(3)">
              <input type="radio" name="rating" value="3">
              <span class="rating-stars-filter">★★★☆☆</span>
              <span class="rating-label">3+ Stars</span>
            </label>
            <label class="rating-option" onclick="setRatingFilter(2)">
              <input type="radio" name="rating" value="2">
              <span class="rating-stars-filter">★★☆☆☆</span>
              <span class="rating-label">2+ Stars</span>
            </label>
            <label class="rating-option" onclick="setRatingFilter(0)">
              <input type="radio" name="rating" value="0" checked>
              <span class="rating-stars-filter">All</span>
              <span class="rating-label">All Ratings</span>
            </label>
          </div>
        </div>
        <div class="filter-group">
          <div class="filter-group-title"><span>🔀</span> Sort By</div>
          <div class="sort-options">
            <button class="sort-btn active" data-sort="relevance" onclick="setSortBy('relevance', this)">Relevance</button>
            <button class="sort-btn" data-sort="price-low" onclick="setSortBy('price-low', this)">Price: Low to High</button>
            <button class="sort-btn" data-sort="price-high" onclick="setSortBy('price-high', this)">Price: High to Low</button>
            <button class="sort-btn" data-sort="rating" onclick="setSortBy('rating', this)">Top Rated</button>
            <button class="sort-btn" data-sort="popularity" onclick="setSortBy('popularity', this)">Popularity</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  header.insertAdjacentElement('afterend', filterPanel);
  
  // Create active filters bar
  const activeFiltersBar = document.createElement('div');
  activeFiltersBar.id = 'activeFiltersBar';
  activeFiltersBar.className = 'active-filters-bar';
  activeFiltersBar.innerHTML = `<span class="active-filters-label">Active Filters:</span>`;
  filterPanel.insertAdjacentElement('afterend', activeFiltersBar);
}

function loadCategoryFilters() {
  const categoryPills = document.getElementById('categoryPills');
  if (!categoryPills || !allProducts.length) return;

  const categories = [...new Set(allProducts.map(p => p.category))];
  categoryPills.innerHTML = '';
  
  categories.forEach(cat => {
    const pill = document.createElement('button');
    pill.className = 'category-pill';
    pill.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    pill.dataset.category = cat;
    pill.onclick = () => toggleCategoryFilter(cat, pill);
    categoryPills.appendChild(pill);
  });
}

function toggleCategoryFilter(category, element) {
  const index = activeFilters.categories.indexOf(category);
  if (index > -1) {
    activeFilters.categories.splice(index, 1);
    element.classList.remove('active');
  } else {
    activeFilters.categories.push(category);
    element.classList.add('active');
  }
  updateFilterCount();
}

function updatePriceFilter(maxPrice) {
  activeFilters.maxPrice = parseInt(maxPrice);
  const display = document.getElementById('maxPriceDisplay');
  if (display) {
    display.textContent = `₹${maxPrice}`;
  }
}

function setPriceRange(min, max) {
  activeFilters.minPrice = min;
  activeFilters.maxPrice = max;
  
  const slider = document.getElementById('maxPriceSlider');
  const minDisplay = document.getElementById('minPriceDisplay');
  const maxDisplay = document.getElementById('maxPriceDisplay');
  
  if (slider) slider.value = max;
  if (minDisplay) minDisplay.textContent = `₹${min}`;
  if (maxDisplay) maxDisplay.textContent = `₹${max}`;
  
  document.querySelectorAll('.price-quick-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

function setRatingFilter(rating) {
  activeFilters.minRating = rating;
  document.querySelectorAll('.rating-option').forEach(opt => {
    opt.classList.toggle('active', opt.querySelector('input').value == rating);
  });
}

function setSortBy(sortType, element) {
  activeFilters.sortBy = sortType;
  document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');
}

// toggleFilterPanel removed - filters now only in category section

function applyFilters() {
  const searchQuery = (document.getElementById('search-bar')?.value || '').trim().toLowerCase();
  
  let filteredProducts = [...allProducts];
  
  // Apply search query
  if (searchQuery) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery) || 
      p.category.toLowerCase().includes(searchQuery)
    );
  }
  
  // Apply category filter
  if (activeFilters.categories.length > 0) {
    filteredProducts = filteredProducts.filter(p => 
      activeFilters.categories.includes(p.category.toLowerCase()) ||
      activeFilters.categories.includes(p.category)
    );
  }
  
  // Apply price filter
  filteredProducts = filteredProducts.filter(p => 
    p.price >= activeFilters.minPrice && p.price <= activeFilters.maxPrice
  );
  
  // Apply rating filter
  if (activeFilters.minRating > 0) {
    filteredProducts = filteredProducts.filter(p => 
      (p.rating || 4) >= activeFilters.minRating
    );
  }
  
  // Apply sorting
  switch (activeFilters.sortBy) {
    case 'price-low':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filteredProducts.sort((a, b) => (b.rating || 4) - (a.rating || 4));
      break;
    case 'popularity':
      filteredProducts.sort((a, b) => (b.searchCount || 0) - (a.searchCount || 0));
      break;
  }
  
  // Display filtered products
  displayFilteredProducts(filteredProducts);
  updateActiveFiltersBar();
  
  // Close filter panel
  toggleFilterPanel();
  
  showToast(`Found ${filteredProducts.length} products`, 'success');
}

function displayFilteredProducts(products) {
  // Navigate to categories section if not there
  const categoriesSection = document.getElementById('categories');
  const categoryContainer = document.getElementById('categoryContainer');
  const categoryProductsSection = document.getElementById('categoryProductsSection');
  const categoryProductsList = document.getElementById('categoryProductsList');
  const categoryProductsTitle = document.getElementById('categoryProductsTitle');
  
  if (!categoryProductsSection || !categoryProductsList) {
    // Fallback: filter existing products on page
    const productElements = document.querySelectorAll('.product');
    const productNames = products.map(p => p.name.toLowerCase());
    
    productElements.forEach(el => {
      const name = (el.querySelector('h3')?.textContent || '').toLowerCase();
      el.style.display = productNames.includes(name) ? 'block' : 'none';
    });
    return;
  }
  
  // Show filtered results
  if (categoriesSection) categoriesSection.style.display = 'block';
  if (categoryContainer) categoryContainer.style.display = 'none';
  categoryProductsSection.style.display = 'block';
  
  if (categoryProductsTitle) {
    categoryProductsTitle.textContent = 'Filtered Results';
  }
  
  categoryProductsList.innerHTML = '';
  
  if (products.length === 0) {
    categoryProductsList.innerHTML = '<p class="empty-state">No products found matching your filters.</p>';
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
    
    productDiv.onclick = () => openProductDetail(product.name);
    categoryProductsList.appendChild(productDiv);
  });
  
  categoryProductsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateActiveFiltersBar() {
  const bar = document.getElementById('activeFiltersBar');
  if (!bar) return;
  
  const hasFilters = activeFilters.categories.length > 0 || 
                     activeFilters.minRating > 0 || 
                     activeFilters.maxPrice < 1000 ||
                     activeFilters.sortBy !== 'relevance';
  
  bar.classList.toggle('has-filters', hasFilters);
  
  if (!hasFilters) return;
  
  let chipsHTML = '<span class="active-filters-label">Active Filters:</span>';
  
  activeFilters.categories.forEach(cat => {
    chipsHTML += `<div class="active-filter-chip">${cat} <span class="remove-chip" onclick="removeCategoryFilter('${cat}')">×</span></div>`;
  });
  
  if (activeFilters.maxPrice < 1000 || activeFilters.minPrice > 0) {
    chipsHTML += `<div class="active-filter-chip">₹${activeFilters.minPrice}-₹${activeFilters.maxPrice} <span class="remove-chip" onclick="resetPriceFilter()">×</span></div>`;
  }
  
  if (activeFilters.minRating > 0) {
    chipsHTML += `<div class="active-filter-chip">${activeFilters.minRating}+ Stars <span class="remove-chip" onclick="resetRatingFilter()">×</span></div>`;
  }
  
  if (activeFilters.sortBy !== 'relevance') {
    const sortLabels = {
      'price-low': 'Price: Low to High',
      'price-high': 'Price: High to Low',
      'rating': 'Top Rated',
      'popularity': 'Popularity'
    };
    chipsHTML += `<div class="active-filter-chip">${sortLabels[activeFilters.sortBy]} <span class="remove-chip" onclick="resetSortFilter()">×</span></div>`;
  }
  
  bar.innerHTML = chipsHTML;
}

function updateFilterCount() {
  const count = activeFilters.categories.length + 
                (activeFilters.minRating > 0 ? 1 : 0) + 
                (activeFilters.maxPrice < 1000 ? 1 : 0);
  
  const filterBtn = document.getElementById('filterToggleBtn');
  if (filterBtn) {
    const countEl = filterBtn.querySelector('.filter-count');
    if (count > 0) {
      if (countEl) {
        countEl.textContent = count;
      } else {
        filterBtn.insertAdjacentHTML('beforeend', `<span class="filter-count">${count}</span>`);
      }
    } else if (countEl) {
      countEl.remove();
    }
  }
}

function removeCategoryFilter(category) {
  const index = activeFilters.categories.indexOf(category);
  if (index > -1) {
    activeFilters.categories.splice(index, 1);
  }
  
  const pill = document.querySelector(`.category-pill[data-category="${category}"]`);
  if (pill) pill.classList.remove('active');
  
  applyFilters();
}

function resetPriceFilter() {
  activeFilters.minPrice = 0;
  activeFilters.maxPrice = 1000;
  
  const slider = document.getElementById('maxPriceSlider');
  const minDisplay = document.getElementById('minPriceDisplay');
  const maxDisplay = document.getElementById('maxPriceDisplay');
  
  if (slider) slider.value = 1000;
  if (minDisplay) minDisplay.textContent = '₹0';
  if (maxDisplay) maxDisplay.textContent = '₹1000';
  
  document.querySelectorAll('.price-quick-btn').forEach(btn => btn.classList.remove('active'));
  
  applyFilters();
}

function resetRatingFilter() {
  activeFilters.minRating = 0;
  document.querySelectorAll('.rating-option input').forEach(input => {
    input.checked = input.value === '0';
  });
  document.querySelectorAll('.rating-option').forEach(opt => opt.classList.remove('active'));
  
  applyFilters();
}

function resetSortFilter() {
  activeFilters.sortBy = 'relevance';
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sort === 'relevance');
  });
  
  applyFilters();
}

function clearAllFilters() {
  activeFilters = {
    categories: [],
    minPrice: 0,
    maxPrice: 1000,
    minRating: 0,
    sortBy: 'relevance'
  };
  
  // Reset UI
  document.querySelectorAll('.category-pill').forEach(pill => pill.classList.remove('active'));
  document.querySelectorAll('.price-quick-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.rating-option').forEach(opt => opt.classList.remove('active'));
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sort === 'relevance');
  });
  
  const slider = document.getElementById('maxPriceSlider');
  const minDisplay = document.getElementById('minPriceDisplay');
  const maxDisplay = document.getElementById('maxPriceDisplay');
  
  if (slider) slider.value = 1000;
  if (minDisplay) minDisplay.textContent = '₹0';
  if (maxDisplay) maxDisplay.textContent = '₹1000';
  
  document.querySelectorAll('.rating-option input[value="0"]').forEach(input => {
    input.checked = true;
  });
  
  updateFilterCount();
  updateActiveFiltersBar();
  
  showToast('All filters cleared', 'info');
}

function setupFilterEventListeners() {
  // Close filter panel when clicking outside
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('filterPanel');
    const btn = document.getElementById('filterToggleBtn');
    
    if (panel && panel.classList.contains('open')) {
      if (!panel.contains(e.target) && !btn?.contains(e.target)) {
        panel.classList.remove('open');
        btn?.classList.remove('active');
      }
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    initVoiceSearch();
    initFilters();
  }, 500);
});
