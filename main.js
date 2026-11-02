const app = {
    user: null,
    cart: (() => { try { return JSON.parse(localStorage.getItem('pk_cart') || '[]'); } catch(e) { return []; } })(),
    budget: null,
    products: [],
    orders: [],
    fee: 50,
    isSignUp: false,
    authBusy: false,
    gcashBase64: '',
    selectedCategory: 'all',
    
    carouselIndex: 0,
    departments: [
        {
            name: "PASO",
            desc: "Nourishing meals crafted with love. Discover our local delicacies and comfort food, bringing the warmth of home-cooked Filipino cuisine straight to your table.",
            featured: "Chicken Adobo with Rice",
            image: "https://placehold.co/400x400/eee/333?text=Paso+Food"
        },
        {
            name: "NIPA",
            desc: "Kalinga sa Tahanan. Curated essentials to keep your home clean, organized, and welcoming. Quality finds for your everyday household needs.",
            featured: "Tabo & Home Essentials",
            image: "https://placehold.co/400x400/eee/333?text=Nipa+Home"
        },
        {
            name: "HABI",
            desc: "Ganda ng Pilipino. Celebrate our rich cultural heritage with beautifully crafted clothing and local beauty products made by skilled Filipino artisans.",
            featured: "Barong Tagalog",
            image: "https://placehold.co/400x400/eee/333?text=Habi+Fashion"
        },
        {
            name: "APOLLO",
            desc: "Galing at Teknolohiya. Empowering your daily life with practical tech gadgets and smart innovations designed for the modern Filipino.",
            featured: "Mini Karaoke Machine",
            image: "https://placehold.co/400x400/eee/333?text=Apollo+Tech"
        }
    ],

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
            if (this.user.role === 'admin') {
                this.go('admin');
                this.renderAdmin();
            } else {
                this.go('home'); 
            }
        } else {
            this.go('landing');
        }
 
        this.renderCarousel();
        this.renderMenu();
        this.renderCart();
        this.checkTheme();
        this.updateNavDrawerAuthUI();
        
        setInterval(() => {
            if (!document.getElementById('view-home').classList.contains('hidden')) {
                this.carouselIndex = (this.carouselIndex + 1) % this.departments.length;
                this.renderCarousel();
            }
        }, 5000);
    },
 
    go(view) {
        document.querySelectorAll('main > div').forEach(d => d.classList.add('hidden'));
        const target = document.getElementById('view-' + view);
        if (target) target.classList.remove('hidden');
 
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

    scrollToMenu() {
        const menuSec = document.getElementById('home-menu-section');
        if (document.getElementById('view-home').classList.contains('hidden')) {
            this.go('home');
            setTimeout(() => { if (menuSec) menuSec.scrollIntoView({ behavior: 'smooth' }); }, 100);
        } else if (menuSec) {
            menuSec.scrollIntoView({ behavior: 'smooth' });
        }
    },

    toggleNavDrawer() {
        const drawer = document.getElementById('nav-drawer');
        const backdrop = document.getElementById('nav-drawer-backdrop');
        const isOpen = drawer.classList.toggle('open');
        backdrop.classList.toggle('show', isOpen);
    },

    navTo(view) {
        this.toggleNavDrawer();
        this.go(view);
    },

    navToAccount() {
        this.toggleNavDrawer();
        if (this.user) {
            this.go('orders');
            this.showToast(`Logged in as ${this.user.name}`);
        } else {
            this.go('auth');
            this.setAuthMode('signup', false);
        }
    },

    updateNavDrawerAuthUI() {
        const btnLabel = document.getElementById('nd-auth-label');
        const accountSub = document.getElementById('nav-account-sub');
        if (this.user) {
            btnLabel.textContent = 'Logout';
            accountSub.textContent = this.user.name;
        } else {
            btnLabel.textContent = 'Sign In / Sign Up';
            accountSub.textContent = 'Profile & Settings';
        }
    },

    handleAuthFromDrawer() {
        this.toggleNavDrawer();
        this.handleAuth();
    },
 
    showToast(msg) {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.style.display = 'block';
        setTimeout(() => t.style.display = 'none', 3000);
    },
 
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
 
        if (animate) {
            card.classList.remove('bump'); void card.offsetWidth; card.classList.add('bump');
            setTimeout(() => (next ? $('auth-name') : $('auth-email')).focus(), 380);
        }
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
        this.go('home');
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
        if (this.isSignUp) payload.name = name; else payload.role = 'customer';
 
        this.authBusy = true;
        try {
            const res = await fetch(`api.php?action=${this.isSignUp ? 'signup' : 'login'}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.ok) {
                this.authBusy = false;
                return this.authFail(data.error || 'Hindi makapasok. Subukan ulit.');
            }
 
            await new Promise(r => setTimeout(r, 400));
            el('auth-form').reset();
            this.showToast(this.isSignUp ? 'Maligayang pagdating sa PiliKart!' : 'Welcome back!');
            await this.init();
            this.authBusy = false;
        } catch (err) {
            this.authBusy = false;
            this.authFail('Walang koneksyon sa server.');
        }
    },

    prefillCheckout() {
        if (!this.user) return;
        const set = (id, v) => { const f = document.getElementById(id); if (f && !f.value && v) f.value = v; };
        set('co-name', this.user.name); set('co-phone', this.user.phone); set('co-addr', this.user.address);
    },

    renderCarousel() {
        const container = document.getElementById('carousel-card-container');
        if (!container) return;
        if (!container.querySelector('.carousel-flip-inner')) container.innerHTML = `<div class="carousel-flip-inner"></div>`;
        const inner = container.querySelector('.carousel-flip-inner');

        container.classList.add('flip-out');
        container.classList.remove('flip-in');

        setTimeout(() => {
            const dept = this.departments[this.carouselIndex];
            inner.innerHTML = `
                <img src="${dept.image}" class="carousel-img" alt="${dept.name}">
                <div class="carousel-cat-tag">Department: ${dept.name}</div>
                <h3 class="carousel-title">${dept.featured}</h3>
                <p class="carousel-desc">${dept.desc}</p>
            `;
            document.querySelectorAll('.dot').forEach((dot, idx) => dot.classList.toggle('active', idx === this.carouselIndex));
            container.classList.remove('flip-out');
            container.classList.add('flip-in');
        }, 400);
    },

    setCarouselSlide(idx) {
        this.carouselIndex = idx;
        this.renderCarousel();
    },
 
    filterDepartment(category, btn) {
        this.selectedCategory = category;
        document.querySelectorAll('.dept-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        this.renderMenu();
    },

    renderMenu() {
        const qInput = document.getElementById('search-input');
        const bInput = document.getElementById('budget-input');
        if (!qInput || !bInput) return;
 
        const q = qInput.value.toLowerCase();
        const budget = parseFloat(bInput.value) || Infinity;
        
        // Map category to exact sub-label and icon style shown in user reference
        const categoryMeta = {
            paso: { label: 'PAGKAIN', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>' },
            nipa: { label: 'TAHANAN', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>' },
            habi: { label: 'DAMIT', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H5v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10h1.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path></svg>' },
            apollo: { label: 'TEKNOLOHIYA', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>' }
        };

        const html = this.products.filter(p => {
            const cat = p.category ? p.category.toLowerCase() : '';
            const matchCat = this.selectedCategory === 'all' || cat === this.selectedCategory.toLowerCase();
            const matchQ = p.name.toLowerCase().includes(q) || (p.tags && p.tags.toLowerCase().includes(q));
            const matchB = p.price <= budget;
            return matchCat && matchQ && matchB;
        }).map(p => {
            const catKey = (p.category || 'paso').toLowerCase();
            const meta = categoryMeta[catKey] || { label: catKey.toUpperCase(), icon: '' };
            const formattedPrice = Number(p.price).toLocaleString('en-US', { minimumFractionDigits: p.price % 1 !== 0 ? 2 : 0 });

            return `
                <div class="card product-card">
                    <div class="prod-card-header">
                        <span class="dept-badge ${catKey}">${meta.icon} ${catKey}</span>
                        <span class="prod-type-label">${meta.label}</span>
                    </div>
                    <div class="prod-img-wrap">
                        <img src="${p.image}" class="product-img" alt="${p.name}">
                    </div>
                    <div class="prod-info">
                        <h3 class="prod-title">${p.name}</h3>
                        <p class="prod-desc">${p.description}</p>
                    </div>
                    <div class="prod-footer">
                        <div>
                            <span class="prod-price-label">Presyo</span>
                            <span class="prod-price-val">₱${formattedPrice}</span>
                        </div>
                        <button class="btn btn-brand" onclick="app.addToCart(${p.id})" ${p.stock <= 0 ? 'disabled' : ''}>${p.stock <= 0 ? 'Out' : '+ Add'}</button>
                    </div>
                    <div class="nutshell">
                        <h3>${p.name}</h3>
                        <p style="font-size:12px; margin:5px 0 10px;">${p.description}</p>
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:var(--leaf); font-size:12px; font-weight:bold;">${p.stock} left</span>
                            <button class="btn btn-brand" onclick="app.addToCart(${p.id})">Quick Add</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('product-grid').innerHTML = html || '<p style="text-align:center; width:100%; grid-column: 1 / -1; padding: 40px; color:var(--muted);">Walang nakitang produkto sa kategoryang ito.</p>';
    },
 
    addToCart(id) {
        const p = this.products.find(x => x.id === id);
        const item = this.cart.find(x => x.id === id);
        if (item) { item.qty++; } else { this.cart.push({ ...p, qty: 1 }); }
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
        if (totalEl) totalEl.textContent = '₱' + total.toLocaleString();
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
 
    renderAdmin() {
        if (!this.user || this.user.role !== 'admin') return;
 
        let sales = this.orders.reduce((s, o) => s + parseInt(o.total), 0);
        document.getElementById('stat-sales').textContent = '₱' + sales.toLocaleString();
        document.getElementById('stat-orders').textContent = this.orders.length;
 
        document.getElementById('admin-orders-body').innerHTML = this.orders.map(o => `
            <tr>
                <td><b>#${o.id}</b></td>
                <td>${o.customer_name}<br><small>${o.address}</small></td>
                <td>₱${o.total}</td>
                <td>${o.payment === 'gcash' && o.payment_proof ? `<button class="btn btn-ghost" style="padding:4px 8px; font-size:11px;" onclick="app.viewProof('${o.payment_proof}')">View</button>` : 'COD'}</td>
                <td>
                    <select class="input" style="padding:5px; width:120px; margin-bottom:5px;" onchange="app.updateOrderStatus(${o.id}, this.value)">
                        <option ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option ${o.status === 'Shipping' ? 'selected' : ''}>Shipping</option>
                        <option ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    </select><br>
                    <button class="btn btn-danger" style="padding:4px 8px; font-size:11px;" onclick="app.deleteOrder(${o.id})">Delete</button>
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
                    <button class="btn btn-danger" style="padding:4px 8px; font-size:11px;" onclick="app.deleteProduct(${p.id})">Delete</button>
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
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ order_id: id, status }) 
        });
        this.showToast('Status updated');
        this.init();
    },
 
    async deleteOrder(id) {
        if (!confirm('Delete this order permanently?')) return;
        await fetch('api.php?action=admin-delete-order', { 
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ order_id: id }) 
        });
        this.init();
    },
 
    async saveProduct(id) {
        const price = document.getElementById(`p-price-${id}`).value;
        const stock = document.getElementById(`p-stock-${id}`).value;
        await fetch('api.php?action=admin-update-product', { 
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id, price, stock }) 
        });
        this.showToast('Product saved');
        this.init();
    },
 
    async deleteProduct(id) {
        if (!confirm('Delete this product?')) return;
        await fetch('api.php?action=admin-delete-product', { 
            method: 'POST', headers: {'Content-Type': 'application/json'},
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
            tagline: '', description: 'New product',
            image: 'https://placehold.co/400x400/eee/333?text=New', tags: ''
        };
        await fetch('api.php?action=admin-add-product', { 
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload) 
        });
        this.showToast('Product added');
        this.init();
    },
 
    toggleTheme() {
        const html = document.documentElement;
        const isSunset = html.getAttribute('data-theme') === 'sunset';
        const nextTheme = isSunset ? 'day' : 'sunset';
        html.setAttribute('data-theme', nextTheme);
        localStorage.setItem('pk_theme', nextTheme);

        const pillWrap = document.getElementById('nd-theme-pill').parentElement;
        if (pillWrap) pillWrap.classList.toggle('is-sunset', !isSunset);
    },
 
    checkTheme() {
        const saved = localStorage.getItem('pk_theme') || 'day';
        document.documentElement.setAttribute('data-theme', saved);
        const pillWrap = document.getElementById('nd-theme-pill').parentElement;
        if (pillWrap) pillWrap.classList.toggle('is-sunset', saved === 'sunset');
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