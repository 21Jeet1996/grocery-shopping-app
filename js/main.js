// ==========================
// 🔹 MAIN INITIALIZATION
// ==========================

window.addEventListener('DOMContentLoaded', async function() {
  console.log('Initializing Grain\'s Mart...');
  
  await loadProducts();
  
  createAutocompleteContainer();
  
  const searchBar = document.getElementById('search-bar');
  if (searchBar) {
    searchBar.addEventListener('input', function() {
      updateAutocomplete(this.value);
      searchProducts();
    });
    searchBar.addEventListener('keydown', handleSearchKeydown);
  }
  
  document.addEventListener('click', function(e) {
    const ac = document.getElementById('autocompleteList');
    const searchBox = document.querySelector('.search-box');
    if (ac && searchBox && !searchBox.contains(e.target)) {
      ac.style.display = 'none';
    }
  });
  
  loadCategories();
  loadAllProductsSection();
  loadTopProducts();
  updateCart();
  updateAuthUI();
  initDeliverTo();
  updateProfileUI();
  
  console.log('Grain\'s Mart initialized successfully!');
});

window.addEventListener('load', function() {
  const sections = document.querySelectorAll('main section');
  sections.forEach(sec => {
    if (sec.id === 'home') {
      sec.style.display = 'block';
    } else {
      sec.style.display = 'none';
    }
  });
});
