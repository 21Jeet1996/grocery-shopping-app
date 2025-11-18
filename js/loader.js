// Load HTML components dynamically
async function loadHTML(id, file) {
  const element = document.getElementById(id);
  if (!element) return;
  
  try {
    const response = await fetch(file);
    if (response.ok) {
      const html = await response.text();
      element.innerHTML = html;
    } else {
      console.error(`Failed to load ${file}: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error loading ${file}:`, error);
  }
}

async function loadAllComponents() {
  console.log("Loading app components...");
  
  // Map of container IDs to file paths
  const components = [
    { id: 'header-component', file: 'components/header.html' },
    { id: 'home-component', file: 'sections/home.html' },
    { id: 'categories-component', file: 'sections/categories.html' },
    { id: 'products-component', file: 'sections/products.html' },
    { id: 'product-detail-component', file: 'sections/product-detail.html' },
    { id: 'cart-component', file: 'sections/cart.html' },
    { id: 'profile-component', file: 'sections/profile.html' },
    { id: 'track-order-component', file: 'sections/track-order.html' },
    { id: 'address-component', file: 'sections/address.html' },
    { id: 'footer-component', file: 'components/footer.html' },
    { id: 'modals-component', file: 'components/modals.html' },
    { id: 'chatbot-component', file: 'components/chatbot.html' }
  ];

  // Load all components in parallel
  await Promise.all(components.map(c => loadHTML(c.id, c.file)));
  
  console.log("All components loaded.");
  
  // Signal that HTML is ready so main.js can initialize logic
  window.dispatchEvent(new Event('html-loaded'));
}

// Start loading when the initial page skeleton is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAllComponents);
} else {
  loadAllComponents();
}
