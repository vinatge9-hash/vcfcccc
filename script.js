// script.js - Interactive behavior: load animations, scroll-into-view, menu filtering, and cart
(function(){
  // Basic prefers-reduced-motion respect
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // On-load animations
  window.addEventListener('load', () => {
    if (!prefersReducedMotion) {
      document.querySelectorAll('.load-animate').forEach(el => {
        requestAnimationFrame(() => el.classList.add('is-visible'));
      });
    } else {
      document.querySelectorAll('.load-animate').forEach(el => el.classList.add('is-visible'));
    }
  });

  // Intersection Observer for scroll-into-view
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('[data-io], .js-io').forEach(el => io.observe(el));

  // Simple menu filtering (used on menu.html)
  const menuItems = Array.from(document.querySelectorAll('#menu-items article'));
  const searchInput = document.getElementById('search');
  const chips = Array.from(document.querySelectorAll('.chip'));
  let currentCategory = 'All';
  if (searchInput) {
    searchInput.addEventListener('input', () => filterMenu());
  }
  function filterMenu() {
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    menuItems.forEach(card => {
      const name = card.querySelector('.item-name')?.textContent.toLowerCase() ?? '';
      const category = card.dataset.category || 'All';
      const matchQuery = name.includes(query);
      const matchCat = currentCategory === 'All' || category === currentCategory;
      card.style.display = (matchQuery && matchCat) ? '' : 'none';
    });
  }
  chips.forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.category || 'All';
      chips.forEach(c => c.classList.remove('bg-primary', 'text-white'));
      btn.classList.add('bg-primary', 'text-white');
      filterMenu();
    });
  });

  // Basic cart (localStorage)
  const cartKey = 'cn_cart';
  function saveCart(items) { localStorage.setItem(cartKey, JSON.stringify(items)); }
  function loadCart() { const raw = localStorage.getItem(cartKey); return raw ? JSON.parse(raw) : []; }
  function renderCart() {
    const cart = loadCart();
    const cartEl = document.getElementById('cart');
    if (!cartEl) return;
    cartEl.innerHTML = '';
    if (cart.length === 0) {
      cartEl.innerHTML = '<p class="text-sm text-gray-600">Your cart is empty. Add items from the Menu page.</p>';
    } else {
      cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between py-1';
        row.innerHTML = `<span>${item.name} x ${item.qty}</span><span>$${(item.price * item.qty).toFixed(2)}</span>`;
        cartEl.appendChild(row);
      });
    }
    // update total
    const total = cart.reduce((sum, it) => sum + it.price * it.qty, 0);
    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = total.toFixed(2);
  }
  window.addToCart = function(item) {
    const cart = loadCart();
    const existing = cart.find(i => i.id === item.id);
    if (existing) existing.qty += 1; else cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
    saveCart(cart);
    renderCart();
  };
  // Attach to existing buttons on index.html and menu.html
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart');
    if (!btn) return;
    const id = btn.dataset.id; const name = btn.dataset.name; const price = parseFloat(btn.dataset.price);
    window.addToCart({ id, name, price });
  });
  // initial render
  renderCart();
  // If on menu page, initialize filter
  if (document.getElementById('search')) {
    filterMenu();
  }
})();
