// ==========================
// 🔹 MAIN INITIALIZATION
// ==========================

async function initApp() {
  console.log('Initializing Grain\'s Mart...');
  
  // 1. Load Data
  await loadProducts();
  
  // 2. Setup Search
  createAutocompleteContainer();
  
  const searchBar = document.getElementById('search-bar');
  if (searchBar) {
    searchBar.addEventListener('input', function() {
      updateAutocomplete(this.value);
      searchProducts();
    });
    searchBar.addEventListener('keydown', handleSearchKeydown);
  }
  
  // 3. Setup Global Event Listeners
  document.addEventListener('click', function(e) {
    const ac = document.getElementById('autocompleteList');
    const searchBox = document.querySelector('.search-box');
    if (ac && searchBox && !searchBox.contains(e.target)) {
      ac.style.display = 'none';
    }
  });
  
  // 4. Initialize Features
  loadCategories();
  loadAllProductsSection();
  loadTopProducts();
  updateCart();
  updateAuthUI();
  initDeliverTo();
  updateProfileUI();
  
  // 5. Initialize Voice Search & Filters
  if (typeof initVoiceSearch === 'function') initVoiceSearch();
  if (typeof initFilters === 'function') initFilters();
  
  // 6. Setup Navigation (SPA Logic)
  const sections = document.querySelectorAll("main section");
  const navLinks = document.querySelectorAll("nav a");

  // Initial State: Show Home
  sections.forEach(sec => {
    if (sec.id === 'home') {
      sec.style.display = "block";
    } else {
      sec.style.display = "none";
    }
  });

  // Handle navigation clicks (Re-attach listeners since elements were just created)
  navLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const id = this.getAttribute("href");
      if (!id || id === '#') return;

      sections.forEach(sec => sec.style.display = "none");
      const target = document.querySelector(id);
      if (target) {
        target.style.display = "block";
        target.classList.add("fadeIn");
        
        if (id === '#categories') {
          const categoryContainer = document.getElementById('categoryContainer');
          const categoryProductsSection = document.getElementById('categoryProductsSection');
          if (categoryContainer) categoryContainer.style.display = 'flex';
          if (categoryProductsSection) categoryProductsSection.style.display = 'none';
        }
        
        if (id === '#profile') {
          const currentUser = localStorage.getItem('currentUser');
          if (!currentUser) {
            target.style.display = "none";
            openLoginModal();
            return;
          } else {
            try { updateProfileUI(); } catch(e) { }
            // Reset to main profile view instead of opening a specific tab
            try { backToProfileMain(); } catch(e) { }
          }
        }
      }

      navLinks.forEach(l => l.classList.remove("active"));
      this.classList.add("active");
    });
  });
  
  console.log('Grain\'s Mart initialized successfully!');
  
  // Check if user needs to login
  checkLoginOnLoad();
}

// Wait for loader.js to finish injecting HTML
window.addEventListener('html-loaded', initApp);
