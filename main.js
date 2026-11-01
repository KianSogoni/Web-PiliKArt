const app = {
    user: null,
    cart: JSON.parse(localStorage.getItem('pk_cart') || '[]'),
    budget: null,
    products: [],
    orders: [],
    fee: 50,
    isSignUp: false,
    authRole: 'customer',
    authBusy: false,
    gcashBase64: '',
 
    async init() {
        document.getElementById('main-content').style.display = 'block';
 
        try {
            const res = await fetch('api.php?action=load');
            const data = await res.json();
            this.user = data.user;
            this.products = data.products || [];
            this.orders = data.orders || [];
            this.fee = data.fee || 50;
        } catch (e) {
            console.warn('Backend not connected or error:', e);
        }
 
        if (this.user) {
            document.getElementById('auth-btn').textContent = 'Logout';
            if (this.user.role === 'admin') {
                this.go('admin');
                this.renderAdmin();
            } else {
                this.go('menu');
            }
        } else {
            document.getElementById('auth-btn').textContent = 'Login';
            // Start guests on the landing page
            this.go('landing');
        }
 
        this.renderMenu();
        this.renderCart();
        this.checkTheme();
    },
 
    go(view) {
        document.querySelectorAll('main > div').forEach(d => d.classList.add('hidden'));
        
        const target = document.getElementById('view-' + view);
        if (target) {
            target.classList.remove('hidden');
        }
 
        const header = document.getElementById('global-header');
        if (view === 'landing' || view === 'auth') {
            header.classList.add('hidden');
            document.body.style.overflow = 'hidden';
        } else {
            header.classList.remove('hidden');
            document.body.style.overflow = 'auto';
        }
 
        if (view === 'orders') this.renderOrders();
        if (view === 'checkout') { this.renderCheckoutSummary(); this.prefillCheckout(); }
        if (view === 'auth') this.clearAuthError();
        if (view === 'admin') this.renderAdmin();
    },
 
    showToast(msg) {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.style.display = 'block';
        setTimeout(() => t.style.display = 'none', 3000);
    },
 
    // --- AUTHENTICATION (sliding toggle, roles, validation, loading states) ---
    handleAuth() {
        if (this.user) {
            fetch('api.php?action=logout').then(() => location.reload());
        } else {
            this.go('auth');
            this.setAuthMode('signin', false);
        }
    },
 
    setAuthMode(mode, animate = true) {
        const next = (mode === 'signup');
        if (next === this.isSignUp) return;
        this.isSignUp = next;
 
        const $ = id => document.getElementById(id);
        const card = $('auth-card');
        $('auth-toggle').classList.toggle('is-signup', next);
        card.classList.toggle('mode-signup', next);
        $('btn-tab-signin').classList.toggle('active', !next);
        $('btn-tab-signup').classList.toggle('active', next);
        $('btn-tab-signin').setAttribute('aria-selected', String(!next));
        $('btn-tab-signup').setAttribute('aria-selected', String(next));
        $('auth-submit-label').textContent = next ? 'Gawa na!' : 'Pasok na!';
        $('auth-pass').setAttribute('autocomplete', next ? 'new-password' : 'current-password');
        this.clearAuthError();
 
        if (animate) {                       // small "pop" so the whole card reacts
            card.classList.remove('bump'); void card.offsetWidth; card.classList.add('bump');
            setTimeout(() => (next ? $('auth-name') : $('auth-email')).focus(), 380);
        }
    },
 
    setDemoRole(role) {
        this.authRole = role;
        const c = document.getElementById('role-customer'), o = document.getElementById('role-owner');
        c.classList.toggle('selected', role === 'customer'); c.setAttribute('aria-pressed', String(role === 'customer'));
        o.classList.toggle('selected', role === 'owner');    o.setAttribute('aria-pressed', String(role === 'owner'));
        document.getElementById('auth-hint').textContent = role === 'owner'
            ? 'Demo owner: admin@pilikart.ph / admin'
            : 'Demo: maria@example.com / maria';
        this.clearAuthError();
    },
 
    fillOwnerDemo(e) {
        if (e) e.preventDefault();
        this.setAuthMode('signin', false);
        this.setDemoRole('owner');
        document.getElementById('auth-email').focus();
    },
 
    togglePassword() {
        const p = document.getElementById('auth-pass'), eye = document.getElementById('auth-eye');
        const show = p.type === 'password';
        p.type = show ? 'text' : 'password';
        eye.setAttribute('aria-pressed', String(show));
        eye.innerHTML = show ? '&#128584;' : '&#128065;';
        p.focus();
    },
 
    continueAsGuest() {
        this.go('menu');
        this.showToast('Nagba-browse ka bilang guest');
    },
 
    clearAuthError() {
        const err = document.getElementById('auth-error');
        if (err) { err.classList.remove('show'); err.textContent = ''; }
        document.querySelectorAll('.auth-input.invalid').forEach(i => i.classList.remove('invalid'));
    },
 
    authFail(msg, fieldId) {
        const err = document.getElementById('auth-error');
        err.textContent = msg; err.classList.add('show');
        const f = fieldId && document.getElementById(fieldId);
        if (f) { f.classList.remove('invalid'); void f.offsetWidth; f.classList.add('invalid'); f.focus(); }
        else {                                // no specific field: shake the whole card
            const card = document.getElementById('auth-card');
            card.style.animation = 'none'; void card.offsetWidth; card.style.animation = 'authShake .4s';
        }
    },
 
    setAuthBusy(busy) {
        this.authBusy = busy;
        const btn = document.getElementById('auth-submit');
        btn.disabled = busy;
        btn.classList.toggle('loading', busy);
    },
 
    async submitAuth(e) {
        if (e) e.preventDefault();
        if (this.authBusy) return;
        this.clearAuthError();
 
        const el = id => document.getElementById(id);
        const name = el('auth-name').value.trim();
        const email = el('auth-email').value.trim();
        const password = el('auth-pass').value;
 
        if (this.isSignUp && !name) return this.authFail('Ilagay ang buong pangalan mo.', 'auth-name');
        if (!/^\S+@\S+\.\S+$/.test(email)) return this.authFail('Mali ang email format.', 'auth-email');
        if (!password) return this.authFail('Ilagay ang password.', 'auth-pass');
        if (this.isSignUp && password.length < 6) return this.authFail('Password: hindi bababa sa 6 characters.', 'auth-pass');
 
        const payload = { email, password };
        if (this.isSignUp) payload.name = name; else payload.role = this.authRole;
 
        this.setAuthBusy(true);
        try {
            const res = await fetch(`api.php?action=${this.isSignUp ? 'signup' : 'login'}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.ok) {
                this.setAuthBusy(false);
                return this.authFail(data.error || 'Hindi makapasok. Subukan ulit.', this.isSignUp ? null : 'auth-pass');
            }
 
            // success: green button pop, then load the app
            const btn = el('auth-submit');
            btn.classList.remove('loading'); btn.classList.add('success');
            el('auth-submit-label').textContent = 'Tagumpay! ✓';
            await new Promise(r => setTimeout(r, 550));
 
            el('auth-form').reset();
            this.showToast(this.isSignUp ? 'Maligayang pagdating sa PiliKart!' : 'Welcome back!');
            await this.init();
 
            btn.classList.remove('success');
            el('auth-submit-label').textContent = this.isSignUp ? 'Gawa na!' : 'Pasok na!';
            this.setAuthBusy(false);
        } catch (err) {
            this.setAuthBusy(false);
            this.authFail('Walang koneksyon sa server. Naka-ON ba ang Apache at MySQL?');
        }
    },
 
    // Fill checkout details from the logged-in account (never overwrites what the user typed)
    prefillCheckout() {
        if (!this.user) return;
        const set = (id, v) => { const f = document.getElementById(id); if (f && !f.value && v) f.value = v; };
        set('co-name', this.user.name); set('co-phone', this.user.phone); set('co-addr', this.user.address);
    },
 
    // --- MENU & SEARCH ---
    renderMenu() {
        const qInput = document.getElementById('search-input');
        const bInput = document.getElementById('budget-input');
        if (!qInput || !bInput) return;
 
        const q = qInput.value.toLowerCase();
        const budget = parseFloat(bInput.value) || Infinity;
        
        const html = this.products.filter(p => {
            const matchQ = p.name.toLowerCase().includes(q) || (p.tags && p.tags.toLowerCase().includes(q));
            const matchB = p.price <= budget;
            return matchQ && matchB;
        }).map(p => `
            <div class="card product-card">
                <span class="chip" style="position:absolute; top:10px; left:10px; background:var(--amber); color:#000;">${p.category}</span>
                <img src="${p.image}" class="product-img" style="background:#fff;">
                <div style="margin-top:10px; flex:1;">
                    <h3 style="font-size:18px; line-height:1.2;">${p.name}</h3>
                    <p style="font-size:12px; color:var(--muted); margin:5px 0;">${p.description}</p>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; border-top:1px solid var(--line); padding-top:10px;">
                    <h2 style="color:var(--brand);">₱${p.price}</h2>
                    <button class="btn btn-brand" onclick="app.addToCart(${p.id})" ${p.stock <= 0 ? 'disabled' : ''}>${p.stock <= 0 ? 'Out' : '+ Add'}</button>
                </div>
                <div class="nutshell">
                    <h3>${p.name}</h3>
                    <p style="font-size:12px; margin:5px 0 10px;">${p.description}</p>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--leaf); font-size:12px; font-weight:bold;">🔥 ${p.stock} left</span>
                        <button class="btn btn-brand" onclick="app.addToCart(${p.id})">Quick Add</button>
                    </div>
                </div>
            </div>
        `).join('');
        
        document.getElementById('product-grid').innerHTML = html || '<p style="text-align:center; width:100%;">No products found.</p>';
    },
 
    // --- CART & CHECKOUT ---
    addToCart(id) {
        const p = this.products.find(x => x.id === id);
        const item = this.cart.find(x => x.id === id);
        if (item) {
            item.qty++;
        } else {
            this.cart.push({ ...p, qty: 1 });
        }
        this.saveCart();
        this.toggleCart(true);
    },
 
    saveCart() {
        localStorage.setItem('pk_cart', JSON.stringify(this.cart));
        this.renderCart();
    },
 
    renderCart() {
        const badge = document.getElementById('cart-badge');
        if (badge) badge.textContent = this.cart.reduce((s, x) => s + x.qty, 0);
        
        const itemsDiv = document.getElementById('cart-items');
        if (itemsDiv) {
            itemsDiv.innerHTML = this.cart.map(c => `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--line); padding:10px 0;">
                    <div>
                        <b>${c.name}</b><br>
                        <small style="color:var(--brand);">₱${c.price} × ${c.qty}</small>
                    </div>
                    <div>
                        <button class="btn btn-ghost" style="padding:2px 8px;" onclick="app.updateQty(${c.id}, -1)">−</button>
                        <button class="btn btn-ghost" style="padding:2px 8px;" onclick="app.updateQty(${c.id}, 1)">+</button>
                    </div>
                </div>
            `).join('') || '<p style="text-align:center; color:var(--muted);">Cart is empty.</p>';
        }
 
        const total = this.cart.reduce((s, x) => s + x.price * x.qty, 0) + (this.cart.length ? this.fee : 0);
        const totalEl = document.getElementById('cart-total');
        if (totalEl) totalEl.textContent = '₱' + total;
    },
 
    updateQty(id, d) {
        const i = this.cart.find(x => x.id === id);
        if (i) {
            i.qty += d;
            if (i.qty <= 0) this.cart = this.cart.filter(x => x.id !== id);
            this.saveCart();
        }
    },
 
    toggleCart(force = false) {
        const d = document.getElementById('cart-drawer');
        if (force) d.classList.remove('hidden');
        else d.classList.toggle('hidden');
    },
 
    renderCheckoutSummary() {
        let subtotal = this.cart.reduce((s, x) => s + x.price * x.qty, 0);
        let html = this.cart.map(c => `<div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>${c.qty}x ${c.name}</span><span>₱${c.price * c.qty}</span></div>`).join('');
        html += `<hr style="margin:10px 0;"><div style="display:flex; justify-content:space-between;"><span>Shipping</span><span>₱${this.fee}</span></div>`;
        html += `<div style="display:flex; justify-content:space-between; font-size:20px; color:var(--brand); margin-top:10px;"><span>Total</span><span>₱${subtotal + this.fee}</span></div>`;
        document.getElementById('checkout-summary').innerHTML = html;
    },
 
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const scale = 800 / Math.max(img.width, img.height);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                this.gcashBase64 = canvas.toDataURL('image/jpeg', 0.7);
                
                const prev = document.getElementById('gcash-preview');
                prev.src = this.gcashBase64;
                prev.style.display = 'block';
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    },
 
    async submitOrder() {
        if (!this.cart.length) return this.showToast('Cart is empty');
        
        const payment = document.getElementById('co-payment').value;
        if (payment === 'gcash' && !this.gcashBase64) return this.showToast('Please upload GCash receipt');
 
        const payload = {
            items: this.cart.map(c => ({ id: c.id, qty: c.qty })),
            name: document.getElementById('co-name').value,
            phone: document.getElementById('co-phone').value,
            address: document.getElementById('co-addr').value,
            payment: payment,
            proof: this.gcashBase64,
            fee: this.fee
        };
 
        const res = await fetch('api.php?action=place-order', { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload) 
        });
        const data = await res.json();
        
        if (data.ok) {
            this.cart = [];
            this.saveCart();
            this.gcashBase64 = '';
            this.go('orders');
            this.showToast('Order placed successfully!');
            this.init();
        } else {
            this.showToast(data.error || 'Failed to place order');
        }
    },
 
    // --- CUSTOMER ORDERS ---
    renderOrders() {
        const list = document.getElementById('orders-list');
        if (!this.user) {
            list.innerHTML = '<p>Please login to view orders.</p>';
            return;
        }
        list.innerHTML = this.orders.map(o => `
            <div class="card">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <h3>Order #${o.id}</h3>
                    <span class="chip" style="background:var(--leaf-soft); color:var(--leaf);">${o.status}</span>
                </div>
                <p style="font-size:13px; color:var(--muted); margin-bottom:10px;">${o.items.map(i => `${i.qty}x ${i.name}`).join(', ')}</p>
                <h3 style="text-align:right; color:var(--brand);">₱${o.total}</h3>
            </div>
        `).join('') || '<p>No orders yet.</p>';
    },
 
    // --- ADMIN DASHBOARD ---
    renderAdmin() {
        if (!this.user || this.user.role !== 'admin') return;
 
        let sales = this.orders.reduce((s, o) => s + parseInt(o.total), 0);
        document.getElementById('stat-sales').textContent = '₱' + sales;
        document.getElementById('stat-orders').textContent = this.orders.length;
 
        document.getElementById('admin-orders-body').innerHTML = this.orders.map(o => `
            <tr>
                <td><b>#${o.id}</b></td>
                <td>${o.customer_name}<br><small>${o.address}</small></td>
                <td>₱${o.total}</td>
                <td>${o.payment === 'gcash' && o.payment_proof ? `<button class="btn btn-ghost" style="padding:4px 8px; font-size:11px;" onclick="app.viewProof('${o.payment_proof}')">📸 View</button>` : 'COD'}</td>
                <td>
                    <select class="input" style="padding:5px; width:120px; margin-bottom:5px;" onchange="app.updateOrderStatus(${o.id}, this.value)">
                        <option ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option ${o.status === 'Shipping' ? 'selected' : ''}>Shipping</option>
                        <option ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    </select><br>
                    <button class="btn btn-danger" style="padding:4px 8px; font-size:11px;" onclick="app.deleteOrder(${o.id})">🗑 Delete</button>
                </td>
            </tr>
        `).join('');
 
        document.getElementById('admin-stock-body').innerHTML = this.products.map(p => `
            <tr>
                <td>${p.name}</td>
                <td><input type="number" id="p-price-${p.id}" class="input" style="padding:5px; width:80px;" value="${p.price}"></td>
                <td><input type="number" id="p-stock-${p.id}" class="input" style="padding:5px; width:80px;" value="${p.stock}"></td>
                <td>
                    <button class="btn btn-leaf" style="padding:4px 8px; font-size:11px;" onclick="app.saveProduct(${p.id})">Save</button>
                    <button class="btn btn-danger" style="padding:4px 8px; font-size:11px;" onclick="app.deleteProduct(${p.id})">🗑</button>
                </td>
            </tr>
        `).join('');
    },
 
    switchAdminTab(tab, btn) {
        document.querySelectorAll('#view-admin .btn-brand, #view-admin .btn-ghost').forEach(b => b.className = 'btn btn-ghost');
        btn.className = 'btn btn-brand';
        ['orders', 'stock', 'add'].forEach(t => document.getElementById('admin-' + t).classList.add('hidden'));
        document.getElementById('admin-' + tab).classList.remove('hidden');
    },
 
    viewProof(src) {
        document.getElementById('proof-img').src = src;
        document.getElementById('proof-modal').classList.remove('hidden');
    },
 
    async updateOrderStatus(id, status) {
        await fetch('api.php?action=admin-update-order', { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ order_id: id, status }) 
        });
        this.showToast('Status updated');
        this.init();
    },
 
    async deleteOrder(id) {
        if (!confirm('Delete this order permanently?')) return;
        await fetch('api.php?action=admin-delete-order', { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ order_id: id }) 
        });
        this.init();
    },
 
    async saveProduct(id) {
        const price = document.getElementById(`p-price-${id}`).value;
        const stock = document.getElementById(`p-stock-${id}`).value;
        await fetch('api.php?action=admin-update-product', { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id, price, stock }) 
        });
        this.showToast('Product saved');
        this.init();
    },
 
    async deleteProduct(id) {
        if (!confirm('Delete this product?')) return;
        await fetch('api.php?action=admin-delete-product', { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id }) 
        });
        this.init();
    },
 
    async addProduct() {
        const payload = {
            name: document.getElementById('add-name').value,
            price: document.getElementById('add-price').value,
            stock: document.getElementById('add-stock').value,
            category: document.getElementById('add-cat').value,
            tagline: '',
            description: 'New product',
            image: 'https://placehold.co/400x400/eee/333?text=New',
            tags: ''
        };
        await fetch('api.php?action=admin-add-product', { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload) 
        });
        this.showToast('Product added');
        this.init();
    },
 
    // --- EXTRAS (Theme & PiliBot) ---
    toggleTheme() {
        const html = document.documentElement;
        const isSunset = html.getAttribute('data-theme') === 'sunset';
        html.setAttribute('data-theme', isSunset ? 'day' : 'sunset');
        document.getElementById('theme-btn').textContent = isSunset ? '🌙' : '☀️';
        localStorage.setItem('pk_theme', isSunset ? 'day' : 'sunset');
    },
 
    checkTheme() {
        if (localStorage.getItem('pk_theme') === 'sunset') {
            document.documentElement.setAttribute('data-theme', 'sunset');
            document.getElementById('theme-btn').textContent = '☀️';
        }
    },
 
    toggleBot() {
        document.getElementById('pilibot-window').classList.toggle('hidden');
    },
 
    sendBotMsg(e) {
        e.preventDefault();
        const input = document.getElementById('pb-text');
        const chat = document.getElementById('pb-chat');
        if (!input.value) return;
        
        chat.innerHTML += `<div class="pb-msg user">${input.value}</div>`;
        const q = input.value.toLowerCase();
        input.value = '';
        chat.scrollTop = chat.scrollHeight;
 
        setTimeout(() => {
            let reply = "I'm not sure. Try asking about delivery, GCash, or budget mode!";
            if (q.includes('deliver')) reply = `Our delivery fee is ₱${this.fee} within Calamba.`;
            if (q.includes('gcash')) reply = "Yes! We accept GCash. Just upload your receipt at checkout.";
            if (q.includes('budget')) reply = "Use Budget Mode at the top of the menu to hide expensive items!";
            if (q.includes('order')) reply = "Go to 'My Orders' to track your food.";
            
            chat.innerHTML += `<div class="pb-msg">${reply}</div>`;
            chat.scrollTop = chat.scrollHeight;
        }, 600);
    }
};
 
window.app = app;
document.addEventListener('DOMContentLoaded', () => app.init());