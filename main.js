const $ = id => document.getElementById(id);
const FEE = window.DELIVERY_FEE || 50;

/* ---------- CART (localStorage) ---------- */
const getCart = () => { try { return JSON.parse(localStorage.getItem('pk_cart') || '[]'); } catch { return []; } };
const setCart = c => { localStorage.setItem('pk_cart', JSON.stringify(c)); renderCart(); };

function addToCart(id, name, price) {
  const c = getCart();
  const f = c.find(x => x.id === id);
  f ? f.qty++ : c.push({ id, name, price, qty: 1 });
  setCart(c);
}

function renderCart() {
  const c = getCart();
  const count = c.reduce((s, x) => s + x.qty, 0);
  if ($('cart-count')) $('cart-count').textContent = count;
  const items = $('cart-items');
  if (!items) return;
  if (!c.length) { items.innerHTML = '<p class="muted">Walang laman ang cart.</p>'; }
  else {
    items.innerHTML = c.map(it => `
      <div class="cart-item">
        <div><b>${it.name}</b><br><small>₱${it.price} × ${it.qty}</small></div>
        <div>
          <button data-dec="${it.id}">−</button>
          <button data-inc="${it.id}">+</button>
        </div>
      </div>`).join('');
  }
  const total = c.reduce((s, x) => s + x.price * x.qty, 0) + (c.length ? FEE : 0);
  if ($('cart-total')) $('cart-total').textContent = '₱' + total.toLocaleString();
}

document.addEventListener('click', e => {
  const inc = e.target.closest('[data-inc]');
  const dec = e.target.closest('[data-dec]');
  if (inc) { const c = getCart(); const f = c.find(x => x.id === +inc.dataset.inc); if (f) { f.qty++; setCart(c); } }
  if (dec) {
    const c = getCart(); const f = c.find(x => x.id === +dec.dataset.dec);
    if (f) { f.qty--; if (f.qty <= 0) c.splice(c.indexOf(f), 1); setCart(c); }
  }
});

/* ---------- LOGIN ---------- */
if ($('login-form')) {
  $('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    $('login-err').textContent = '';
    const r = await fetch('api.php?action=login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: $('email').value, password: $('password').value })
    });
    const j = await r.json();
    if (r.ok) location.reload();
    else $('login-err').textContent = j.error || 'Error';
  });
}

/* ---------- ADD TO CART ---------- */
document.querySelectorAll('.add-btn').forEach(b => {
  b.addEventListener('click', () => {
    addToCart(+b.dataset.add, b.dataset.name, +b.dataset.price);
    const orig = b.textContent;
    b.textContent = '✓ Added'; b.disabled = true;
    setTimeout(() => { b.textContent = orig; b.disabled = false; }, 900);
  });
});

/* ---------- SEARCH + FILTER ---------- */
let activeTab = 'all';
const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function applyFilter() {
  const q = norm($('menu-search')?.value);
  document.querySelectorAll('.product').forEach(card => {
    const dept = card.dataset.department;
    const hay = norm(card.textContent) + ' ' + norm(card.dataset.tags);
    const matchTab = activeTab === 'all' || dept === activeTab;
    const matchQ = !q || hay.includes(q);
    card.style.display = (matchTab && matchQ) ? '' : 'none';
  });
}

document.querySelectorAll('.filter-tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    activeTab = t.dataset.tab;
    applyFilter();
  });
});

$('menu-search')?.addEventListener('input', applyFilter);

/* ---------- CART DRAWER ---------- */
$('cart-btn')?.addEventListener('click', () => { $('cart-drawer').hidden = false; renderCart(); });
$('cart-close')?.addEventListener('click', () => { $('cart-drawer').hidden = true; });
document.querySelector('.drawer-bg')?.addEventListener('click', () => { $('cart-drawer').hidden = true; });

/* ---------- CHECKOUT ---------- */
$('checkout-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  $('order-err').textContent = '';
  const cart = getCart();
  if (!cart.length) { $('order-err').textContent = 'Walang laman ang cart.'; return; }
  const fd = new FormData(e.target);
  const r = await fetch('api.php?action=place-order', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: cart.map(c => ({ id: c.id, qty: c.qty })),
      name: fd.get('name'), phone: fd.get('phone'),
      address: fd.get('address'), payment: fd.get('payment')
    })
  });
  const j = await r.json();
  if (r.ok) {
    localStorage.removeItem('pk_cart');
    alert('Order placed! #' + (1023 + j.order_id));
    location.reload();
  } else $('order-err').textContent = j.error || 'Error';
});

/* ---------- ADMIN TABS ---------- */
document.querySelectorAll('.admin-tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.querySelectorAll('.admin-panel').forEach(p => p.hidden = true);
    $('panel-' + t.dataset.panel).hidden = false;
  });
});

/* ---------- ADMIN: ORDER STATUS ---------- */
document.querySelectorAll('.status-select').forEach(sel => {
  sel.addEventListener('change', async () => {
    await fetch('api.php?action=update-order', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: +sel.dataset.order, status: sel.value })
    });
    location.reload();
  });
});

/* ---------- ADMIN: UPDATE / DELETE PRODUCT ---------- */
document.querySelectorAll('.product-save').forEach(b => {
  b.addEventListener('click', async () => {
    const row = b.closest('tr');
    await fetch('api.php?action=update-product', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: +b.dataset.pid,
        stock: +row.querySelector('[name=stock]').value,
        price: +row.querySelector('[name=price]').value
      })
    });
    location.reload();
  });
});

/* ===== CHANGED: true DELETE with confirmation + error feedback ===== */
document.querySelectorAll('.product-del').forEach(b => {
  b.addEventListener('click', async () => {
    const name = b.dataset.name || 'this item';
    if (!confirm(`Permanently delete "${name}"?\n\nThis cannot be undone. Past orders will keep their item details.`)) return;

    const res = await fetch('api.php?action=delete-product', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: +b.dataset.pid })
    });

    if (res.ok) {
      location.reload();
    } else {
      const j = await res.json().catch(() => ({}));
      alert(j.error || 'Failed to delete product.');
    }
  });
});
/* ===== END CHANGED ===== */

/* ---------- ADMIN: ADD PRODUCT ---------- */
$('add-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  await fetch('api.php?action=add-product', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(fd))
  });
  location.reload();
});

renderCart();