// ==========================
// 🔹 CART MANAGEMENT
// ==========================

let cart = JSON.parse(localStorage.getItem('gm_cart') || '[]');

function saveCart() {
  localStorage.setItem('gm_cart', JSON.stringify(cart));
  updateCart();
}

function findProductElementByName(name) {
  name = name.trim().toLowerCase();
  return $$('.product').find(p => {
    const productName = (p.querySelector('h3')?.textContent || '').trim().toLowerCase();
    return productName === name;
  });
}

function addToCart(name) {
  let product = allProducts.find(p => p.name.toLowerCase() === name.toLowerCase());
  
  if (!product) {
    const el = findProductElementByName(name);
    if (!el) {
      showToast('Product not found!', 'error');
      return;
    }
    
    const img = el.querySelector('img')?.getAttribute('src') || '';
    const priceText = el.querySelector('p')?.textContent || '0';
    const price = parsePriceFromText(priceText);
    const category = el.getAttribute('data-category') || '';
    product = { name, price, img, category };
  }

  const existing = cart.find(i => i.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.qty = (existing.qty || 0) + 1;
    showToast(`${name} quantity updated!`, 'success');
  } else {
    cart.push({ name: product.name, price: product.price, qty: 1, img: product.img, category: product.category || '' });
    showToast(`${name} added to cart!`, 'success');
  }
  saveCart();
}

function changeQty(index, val) {
  const qty = Math.max(1, parseInt(val) || 1);
  if (cart[index]) {
    cart[index].qty = qty;
    saveCart();
  }
}

function removeItem(index) {
  if (cart[index]) {
    const itemName = cart[index].name;
    cart.splice(index, 1);
    saveCart();
    showToast(`${itemName} removed from cart`, 'info');
  }
}

function updateCart() {
  const cartItemsList = $('#cart-items-list');
  const emptyCart = $('#empty-cart');
  const cartCount = $('#cart-count');
  const cartTotal = $('#cart-total');
  const cartSubtotal = $('#cart-subtotal');
  const cartItemCountText = $('#cart-item-count-text');
  const discountEl = $('#discount-amount');
  const deliveryEl = $('#delivery-charges');

  if (!cartItemsList || !cartCount || !cartTotal) return;

  cartItemsList.innerHTML = '';
  let subtotal = 0, count = 0;

  if (cart.length === 0) {
    if (emptyCart) emptyCart.style.display = 'flex';
    if (cartItemsList) cartItemsList.style.display = 'none';
  } else {
    if (emptyCart) emptyCart.style.display = 'none';
    if (cartItemsList) cartItemsList.style.display = 'block';

    cart.forEach((item, i) => {
      const lineSubtotal = (item.price || 0) * (item.qty || 0);
      subtotal += lineSubtotal;
      count += item.qty || 0;

      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item-card';
      const placeholderImg = createPlaceholderSVG(item.name, 100, 100);
      cartItem.innerHTML = `
        <div class="cart-item-image">
          <img src="${item.img || placeholderImg}" alt="${item.name}" onerror="this.src='${placeholderImg}'">
        </div>
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p class="cart-item-price">₹${(item.price || 0).toFixed(2)}</p>
          <div class="cart-item-actions">
            <div class="quantity-controls">
              <button class="qty-btn minus" onclick="changeQty(${i}, ${(item.qty || 1) - 1})">-</button>
              <input type="number" min="1" value="${item.qty}" class="quantity-input-zepto" data-index="${i}" onchange="changeQty(${i}, this.value)">
              <button class="qty-btn plus" onclick="changeQty(${i}, ${(item.qty || 1) + 1})">+</button>
            </div>
            <button class="remove-item-btn" onclick="removeItem(${i})">🗑️</button>
          </div>
        </div>
        <div class="cart-item-subtotal">
          <span>₹${lineSubtotal.toFixed(2)}</span>
        </div>
      `;
      cartItemsList.appendChild(cartItem);
    });
  }

  const activeOffer = (localStorage.getItem('activeOffer') || '').toUpperCase();
  let discount = 0;

  if (activeOffer === 'FRUIT50') {
    cart.forEach(item => {
      if ((item.category || '').toLowerCase() === 'fruits') {
        discount += (item.price || 0) * (item.qty || 0) * 0.5;
      }
    });
  } else if (activeOffer === 'DRINK3') {
    cart.forEach(item => {
      if ((item.category || '').toLowerCase() === 'cold drink') {
        const freeUnits = Math.floor((item.qty || 0) / 3);
        discount += freeUnits * (item.price || 0);
      }
    });
  } else if (activeOffer === 'DAIRY20') {
    cart.forEach(item => {
      if ((item.category || '').toLowerCase() === 'dairy') {
        discount += (item.price || 0) * (item.qty || 0) * 0.2;
      }
    });
  }

  const afterDiscount = Math.max(0, subtotal - discount);
  const delivery = afterDiscount >= 500 ? 0 : 40;
  const finalTotal = afterDiscount + delivery;

  cartCount.textContent = count;
  if (cartSubtotal) cartSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
  if (discountEl) discountEl.textContent = `₹${discount.toFixed(2)}`;
  if (deliveryEl) deliveryEl.textContent = delivery === 0 ? 'Free' : `₹${delivery.toFixed(2)}`;
  cartTotal.textContent = finalTotal.toFixed(2);
  if (cartItemCountText) {
    cartItemCountText.textContent = count === 1 ? '1 item' : `${count} items`;
  }

  updateMiniCartBar(finalTotal, count);
}

function updateMiniCartBar(total, count) {
  const bar = $('#miniCartBar');
  const countEl = $('#miniCartCount');
  const totalEl = $('#miniCartTotal');
  const slotEl = $('#miniCartSlot');
  
  if (count > 0) {
    if (bar) bar.style.display = 'flex';
    if (countEl) countEl.textContent = count === 1 ? '1 item' : `${count} items`;
    if (totalEl) totalEl.textContent = total.toFixed(2);
    const slot = localStorage.getItem('delivery_slot') || 'Express 10–20 min';
    if (slotEl) slotEl.textContent = slot;
  } else {
    bar.style.display = 'none';
  }
}
