// ==========================
// 🔹 SEARCH & AUTOCOMPLETE
// ==========================

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

function searchProducts() {
  const input = ($('#search-bar')?.value || '').trim().toLowerCase();

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

  if (input && !catFound && !prodFound) {
    console.log('No results found for:', input);
  }
}
