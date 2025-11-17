// ==========================
// 🔹 UTILITY FUNCTIONS
// ==========================

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

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

// ---------- Image Error Handling ----------
function createPlaceholderSVG(text, width = 230, height = 180) {
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

// ---------- Mobile Menu Toggle ----------
function toggleMobileMenu() {
  const nav = document.querySelector('.main-nav');
  if (nav) {
    nav.classList.toggle('mobile-active');
  }
}

// ---------- Scroll Categories ----------
function scrollCategories(px) {
  const container = $('#categoryContainer');
  if (!container) return;
  container.scrollBy({ left: px, behavior: 'smooth' });
}

// ---------- Helper Functions ----------
function parsePriceFromText(text) {
  const m = text && text.match(/[\d,.]+/);
  return m ? parseFloat(m[0].replace(/,/g, '')) : 0;
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
