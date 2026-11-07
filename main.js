const app = {
    lagunaData: {
        "Biñan": { "Biñan (Poblacion)": 25, "Bungahan": 19, "Canlalay": 45, "Casile": 44, "De La Paz": 54, "Ganado": 47, "Langkiwa": 90, "Loma": 144, "Malaban": 43, "Malamig": 113, "Mampalasan": 58, "Platero": 20, "San Antonio": 40, "San Francisco": 52, "San Jose": 35, "San Vicente": 28, "Santo Domingo": 42, "Santo Niño": 28, "Soro-soro": 45, "Timbao": 50, "Tubigan": 35, "Zapote": 2 },
        "Cabuyao": { "Baclaran": 86, "Banaybanay": 26, "Banlic": 55, "Barangay Dos": 12, "Barangay Tres": 8, "Barangay Uno": 10, "Bigaa": 19, "Butong": 44, "Casile": 90, "Diezmo": 77, "Gulod": 54, "Mamatid": 71, "Marinig": 31, "Niugan": 15, "Pittland": 70, "Pulo": 25, "Sala": 10, "San Isidro": 30 },
        "Calamba": { "Bagong Kalsada": 35, "Banadero": 14, "Banlic": 47, "Barandal": 59, "Barangay 1": 15, "Barangay 2": 4, "Barangay 3": 8, "Barangay 4": 4, "Barangay 5": 5, "Barangay 6": 2, "Barangay 7": 8, "Batino": 44, "Bubuyan": 40, "Bucal": 30, "Bunggo": 80, "Burol": 60, "Camaligan": 70, "Canlubang": 100, "Halang": 25, "Hornalan": 90, "Kay-Anlog": 80, "La Mesa": 120, "Laguerta": 90, "Lawa": 60, "Lecheria": 15, "Lingga": 50, "Looc": 40, "Mabato": 100, "Majada Labas": 70, "Makiling": 70, "Mapagong": 50, "Masili": 30, "Maunong": 70, "Mayapa": 80, "Milagrosa": 80, "Paciano Rizal": 40, "Palingon": 40, "Palo-Alto": 120, "Pansol": 70, "Parian": 30, "Prinza": 70, "Punta": 60, "Puting Lupa": 80, "Real": 20, "Saimsim": 90, "Sampiruhan": 30, "San Cristobal": 50, "San Jose": 30, "San Juan": 20, "Sirang Lupa": 60, "Sucol": 80, "Turbina": 50, "Ulango": 90, "Uwisan": 40 },
        "San Pablo": { "Atisan": 170, "Bagong Bayan II-A": 14, "Bagong Pook VI-C": 8, "Barangay I-A": 11, "Barangay I-B": 6, "Barangay II-A": 22, "Barangay II-B": 15, "Barangay II-C": 12, "Barangay II-D": 10, "Barangay II-E": 13, "Barangay II-F": 20, "Barangay III-A": 10, "Barangay III-B": 12, "Barangay III-C": 15, "Barangay III-D": 18, "Barangay III-E": 20, "Barangay III-F": 22, "Barangay IV-A": 10, "Barangay IV-B": 12, "Barangay IV-C": 15, "Barangay V-A": 22, "Barangay V-B": 25, "Barangay V-C": 28, "Barangay V-D": 10, "Barangay VI-A": 15, "Barangay VI-B": 18, "Barangay VI-D": 20, "Barangay VI-E": 22, "Barangay VII-A": 15, "Barangay VII-B": 18, "Barangay VII-C": 20, "Barangay VII-D": 22, "Barangay VII-E": 25, "Bautista": 130, "Concepcion": 23, "Del Remedio": 17, "Dolores": 36, "San Antonio 1": 83, "San Antonio 2": 110, "San Bartolome": 72, "San Buenaventura": 51, "San Crispin": 61, "San Cristobal": 130, "San Diego": 73, "San Francisco": 22, "San Gabriel": 25, "San Gregorio": 35, "San Ignacio": 44, "San Joaquin": 61, "San Jose": 93, "San Juan": 42, "San Lorenzo": 69, "San Lucas 1": 12, "San Lucas 2": 13, "San Marcos": 50, "San Mateo": 57, "San Miguel": 57, "San Nicolas": 36, "San Pedro": 29, "San Rafael": 23, "San Roque": 29, "San Vicente": 69, "Santa Ana": 91, "Santa Catalina": 69, "Santa Cruz": 80, "Santa Elena": 73, "Santa Felomina": 55, "Santa Isabel": 66, "Santa Maria": 66, "Santa Maria Magdalena": 45, "Santa Monica": 43, "Santa Veronica": 64, "Santiago I": 82, "Santiago II": 110, "Santisimo Rosario": 90, "Santo Angel": 73, "Santo Cristo": 20, "Santo Niño": 66, "Soledad": 42 },
        "San Pedro": { "Bagong Silang": 70, "Calendola": 42, "Chrysant": 46, "Cuyab": 18, "Estrella": 79, "Fatima": 15, "G.S.I.S.": 53, "Landayan": 23, "Langgam": 86, "Laram": 72, "Magsaysay": 48, "Maharlika": 32, "Narra": 68, "Nueva": 6, "Pacita 1": 29, "Pacita 2": 34, "Riverside": 66, "Rosario": 52, "Sampaguita Village": 46, "San Lorenzo Ruiz": 24, "San Roque": 11, "San Vicente": 79, "Santo Niño": 8, "United Bayanihan": 66, "United Better Living": 79 },
        "Santa Rosa": { "Aplaya": 50, "Balibago": 45, "Caingin": 30, "Dila": 25, "Dita": 40, "Don Jose": 70, "Ibaba": 15, "Kanluran": 15, "Labas": 25, "Macabling": 40, "Malitlit": 60, "Malusak": 10, "Market Area": 10, "Pooc": 30, "Pulong Santa Cruz": 60, "Santo Domingo": 50, "Sinalhan": 45, "Tagapo": 20 }
    },

    // Inside the app object, find tapPiliBot and replace it with this:
    tapPiliBot() {
        this.toggleBot();

        const btn = document.getElementById('pilibot-btn');
        const heartContainer = document.getElementById('pilibot-heart-container');

        if (btn) {
            // Trigger leaf morph animation
            btn.classList.add('is-leaf');

            // Spawn floating heart
            if (heartContainer) {
                const heart = document.createElement('div');
                heart.className = 'floating-heart';
                heart.innerHTML = '❤️';
                heartContainer.appendChild(heart);
                setTimeout(() => heart.remove(), 1000);
            }

            // Revert back to robot icon after 1.5 seconds
            clearTimeout(this._piliLeafTimer);
            this._piliLeafTimer = setTimeout(() => {
                btn.classList.remove('is-leaf');
            }, 1500);
        }
    },
    
    initLeavesAnimation() {
        const container = document.getElementById('leaves-container');
        if (!container) return;

        const leafCount = 10;
        const types = ['leaf-green-dark', 'leaf-green-light', 'leaf-tan'];

        for (let i = 0; i < leafCount; i++) {
            const leaf = document.createElement('div');
            const type = types[Math.floor(Math.random() * types.length)];

            leaf.className = `leaf ${type}`;

            const left = Math.random() * 100;
            const duration = 10 + Math.random() * 10;
            const delay = Math.random() * 15;
            const size = 18 + Math.random() * 14;
            const swayDuration = 3 + Math.random() * 4;

            leaf.style.left = `${left}%`;
            leaf.style.width = `${size}px`;
            leaf.style.height = `${size}px`;
            leaf.style.animationDuration = `${duration}s, ${swayDuration}s`;
            leaf.style.animationDelay = `${delay}s, ${delay}s`;

            container.appendChild(leaf);
        }
    },

    user: null,
    cart: (() => {
        try {
            const c = JSON.parse(localStorage.getItem('pk_cart') || '[]');
            return c.map(item => ({ ...item, selected: item.selected !== undefined ? item.selected : true }));
        } catch(e) { return []; }
    })(),
    budget: null,
    products: [],
    orders: [],
    fee: 0,
    isSignUp: false,
    authBusy: false,
    gcashBase64: '',
    selectedCategory: 'all',
    hoverTimeout: null,
    adminOrderFilter: { search: '', status: 'all' },
    editingProductId: null,
    protectionEnabled: false,

    deptIcons: {
        paso: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8z"/><path d="M2 10h20"/><path d="M8 6c0-2 1-3 2-3s2 1 2 3"/><path d="M14 6c0-2 1-3 2-3s2 1 2 3"/></svg>',
        nipa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        habi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H5v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10h1.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>',
        apollo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>'
    },

    carouselIndex: 0,
    carouselTimer: null,
        departments: [
        {
            name: "PASO",
            desc: "Taste the warmth of Lola's kitchen. Every bite is a memory of home, crafted with the love only a Filipino family knows.",
            featured: "Chicken Adobo with Rice",
            image: "assets/paso/Chicken Adobo with Rice.png"
        },
        {
            name: "NIPA",
            desc: "More than just a house, it's where the heart is. The iconic Tabo is the ultimate symbol of Filipino practical living.",
            featured: "Classic Plastic Tabo",
            image: "https://placehold.co/600x338/1a2b1c/85b56d?text=Tabo"
        },
        {
            name: "HABI",
            desc: "Woven with the threads of our ancestors. Wear your heritage proudly with the elegant Baro't Saya, a true Filipiniana classic.",
            featured: "Baro't Saya",
            image: "https://placehold.co/600x338/1a2b1c/85b56d?text=Baro't+Saya"
        },
        {
            name: "APOLLO",
            desc: "Reach for the stars while keeping your feet on the ground. Because no Filipino gathering is complete without a Videoke session!",
            featured: "Mini Karaoke Machine",
            image: "https://placehold.co/600x338/1a2b1c/85b56d?text=Mini+Karaoke"
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
            this.fee = data.fee || 0;
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
        this.sizeHeroVideo();
        this.initLeavesAnimation();
        this.checkCartStock();
        this.initLandingPage();
        this.initLandingInteractions();

        if (this.carouselTimer) clearInterval(this.carouselTimer);
        this.carouselTimer = setInterval(() => {
            if (!document.getElementById('view-home').classList.contains('hidden')) {
                this.carouselIndex = (this.carouselIndex + 1) % this.departments.length;
                this.renderCarousel();
            }
        }, 7000);
    },

    checkCartStock() {
        if (!this.products.length || !this.cart.length) return;

        const missing = [];
        this.cart.forEach(c => {
            const p = this.products.find(x => x.id === c.id);
            if (!p || p.stock <= 0 || p.stock < c.qty) {
                missing.push(c.name);
            }
        });

        if (missing.length > 0) {
            const listEl = document.getElementById('stock-alert-list');
            if (listEl) {
                listEl.innerHTML = missing.map(name => `<li>${this.esc(name)}</li>`).join('');
            }
            document.getElementById('stock-alert-modal').classList.remove('hidden');
        }
    },

    removeOutOfStockItems() {
        this.cart = this.cart.filter(c => {
            const p = this.products.find(x => x.id === c.id);
            return p && p.stock > 0 && p.stock >= c.qty;
        });
        this.saveCart();
        document.getElementById('stock-alert-modal').classList.add('hidden');
        this.showToast('Inalis na ang mga kulang/ubos na items sa cart mo.');
    },

    formatAddress(addrStr) {
        if (!addrStr) return '';
        try {
            const obj = JSON.parse(addrStr);
            if (obj.street !== undefined || obj.brgy !== undefined || obj.city !== undefined) {
                return [obj.street, obj.brgy, obj.city].filter(Boolean).join(', ');
            }
        } catch(e) {}
        return addrStr;
    },

    populateCities() {
        const citySelect = document.getElementById('co-city');
        if (!citySelect) return;

        const hasPaso = this.cart.some(c => c.selected && (c.category || '').toLowerCase() === 'paso');

        let html = '<option value="" disabled selected>Pumili ng Lungsod</option>';
        Object.keys(this.lagunaData).forEach(city => {
            const disabled = hasPaso && city !== 'Calamba';
            const suffix = disabled ? ' — PASO sa Calamba lang' : '';
            html += `<option value="${city}" ${disabled ? 'disabled' : ''}>${city}${suffix}</option>`;
        });
        citySelect.innerHTML = html;

        if (hasPaso && citySelect.value && citySelect.value !== 'Calamba') {
            citySelect.value = '';
            const brgySelect = document.getElementById('co-brgy');
            if (brgySelect) brgySelect.innerHTML = '<option value="" disabled selected>Pumili ng Barangay</option>';
            this.fee = 0;
        }

        const warning = document.getElementById('paso-restriction-note');
        if (warning) warning.classList.toggle('hidden', !hasPaso);
    },

    updateBrgyDropdown() {
        const city = document.getElementById('co-city').value;
        const brgySelect = document.getElementById('co-brgy');
        if (!brgySelect) return;

        brgySelect.innerHTML = '<option value="" disabled selected>Pumili ng Barangay</option>';
        if (this.lagunaData[city]) {
            Object.keys(this.lagunaData[city]).forEach(brgy => {
                brgySelect.innerHTML += `<option value="${brgy}">${brgy}</option>`;
            });
        }
        this.updateShippingFee();
    },

    updateAccBrgyDropdown(selectedBrgy = '') {
        const city = document.getElementById('acc-city').value;
        const brgySelect = document.getElementById('acc-brgy');
        if (!brgySelect) return;

        brgySelect.innerHTML = '<option value="" disabled selected>Pumili ng Barangay</option>';
        if (this.lagunaData[city]) {
            Object.keys(this.lagunaData[city]).forEach(brgy => {
                brgySelect.innerHTML += `<option value="${brgy}" ${brgy === selectedBrgy ? 'selected' : ''}>${brgy}</option>`;
            });
        }
    },

    updateShippingFee() {
        const city = document.getElementById('co-city').value;
        const brgy = document.getElementById('co-brgy').value;

        if (city && brgy && this.lagunaData[city] && this.lagunaData[city][brgy] !== undefined) {
            this.fee = this.lagunaData[city][brgy];
        } else {
            this.fee = 0;
        }

        this.renderCheckoutSummary();
        this.renderCart();
    },

    toggleAcc(el) {
        if (el.classList.contains('faq-recipe-item')) {
            const body = el.querySelector('.faq-recipe-body');
            if (!body) return;

            const isActive = el.classList.contains('active');

            document.querySelectorAll('.faq-recipe-item').forEach(item => {
                item.classList.remove('active');
                const b = item.querySelector('.faq-recipe-body');
                if (b) b.style.maxHeight = null;
            });

            if (!isActive) {
                el.classList.add('active');
                body.style.maxHeight = body.scrollHeight + 'px';
            }
        }
    },

    sizeHeroVideo() {
        const wrap = document.querySelector('.home-hero-video');
        const iframe = wrap?.querySelector('iframe');
        if (!wrap || !iframe) return;
        const rect = wrap.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const videoAspect = 16 / 9;
        const wrapAspect = rect.width / rect.height;
        let w, h;
        if (wrapAspect > videoAspect) {
            w = rect.width;
            h = rect.width / videoAspect;
        } else {
            h = rect.height;
            w = rect.height * videoAspect;
        }
        iframe.style.width = Math.ceil(w) + 'px';
        iframe.style.height = Math.ceil(h) + 'px';
    },

    go(view) {
        document.querySelectorAll('main > div').forEach(d => d.classList.add('hidden'));
        const target = document.getElementById('view-' + view);
        const bare = (view === 'landing' || view === 'auth');
        if (target) {
            target.classList.remove('hidden');
            if (!bare) { target.classList.remove('view-enter'); void target.offsetWidth; target.classList.add('view-enter'); }
        }

        const header = document.getElementById('global-header');
        const footer = document.getElementById('site-footer');
        header.classList.toggle('hidden', bare);
        if (footer) footer.classList.toggle('hidden', bare);
        document.body.style.overflow = bare ? 'hidden' : 'auto';
        this.currentView = view;
        if (!bare) window.scrollTo({ top: 0 });

        const botBtn = document.getElementById('pilibot-btn');
        if (botBtn) botBtn.style.display = bare ? 'none' : 'flex';

        if (view === 'orders') this.renderOrders();
        if (view === 'cart') this.renderCartPage();
        if (view === 'checkout') { this.populateCities(); this.renderCheckoutSummary(); this.prefillCheckout(); }
        if (view === 'success') this.renderSuccess();
        if (view === 'auth') this.clearAuthError();
        if (view === 'admin') this.renderAdmin();
        if (view === 'account') this.renderAccount();
        if (view === 'home') { this.updateGreeting(); setTimeout(() => this.sizeHeroVideo(), 50); this.maybeWelcome(); }

        if (view === 'faq' || view === 'recipes') {
            document.querySelectorAll('.faq-recipe-item').forEach((item, index) => {
                item.classList.remove('active');
                const body = item.querySelector('.faq-recipe-body');
                if (body) body.style.maxHeight = null;
            });
            const firstItem = document.querySelector('.faq-recipe-item');
            if (firstItem) {
                firstItem.classList.add('active');
                const b = firstItem.querySelector('.faq-recipe-body');
                if (b) setTimeout(() => b.style.maxHeight = b.scrollHeight + 'px', 50);
            }
        }
    },

    esc(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },
    money(n) { n = Number(n) || 0; return '\u20B1' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); },
    firstName() { return this.user && this.user.name ? this.user.name.trim().split(/\s+/)[0] : ''; },
    greeting() {
        const h = new Date().getHours();
        if (h < 12) return 'Magandang umaga';
        if (h < 14) return 'Magandang tanghali';
        if (h < 18) return 'Magandang hapon';
        return 'Magandang gabi';
    },
    updateGreeting() {
        const el = document.getElementById('home-greeting');
        if (el) el.textContent = `${this.greeting()}, ${this.firstName() || 'kababayan'}!`;
    },
    maybeWelcome() {
        try { if (sessionStorage.getItem('pk_welcomed')) return; sessionStorage.setItem('pk_welcomed', '1'); } catch (e) {}
        const n = this.firstName() ? `, ${this.firstName()}` : '';
        setTimeout(() => this.showToast(`${this.greeting()}${n}! Tuloy ka sa PiliKart \u2615`), 1600);
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
            this.go('account');
        } else {
            this.go('auth');
            this.setAuthMode('signup', false);
        }
    },

    updateNavDrawerAuthUI() {
        const btnLabel = document.getElementById('nd-auth-label');
        const accountSub = document.getElementById('nav-account-sub');
        const ordersLink = document.getElementById('nav-orders-link');
        const ordersTitle = document.getElementById('nav-orders-title');
        const ordersSub = document.getElementById('nav-orders-sub');
        const ordersIcon = document.getElementById('nav-orders-icon');

        if (this.user) {
            btnLabel.textContent = 'Logout';
            accountSub.textContent = this.user.name;

            if (this.user.role === 'admin') {
                ordersTitle.textContent = 'Admin Dashboard';
                ordersSub.textContent = 'Manage Store';
                ordersLink.setAttribute('onclick', "app.navTo('admin')");
                ordersIcon.innerHTML = '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>';
            } else {
                ordersTitle.textContent = 'My Orders';
                ordersSub.textContent = 'Kasaysayan ng Order';
                ordersLink.setAttribute('onclick', "app.navTo('orders')");
                ordersIcon.innerHTML = '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>';
            }
        } else {
            btnLabel.textContent = 'Sign In / Sign Up';
            accountSub.textContent = 'Profile & Settings';
            ordersTitle.textContent = 'My Orders';
            ordersSub.textContent = 'Kasaysayan ng Order';
            ordersLink.setAttribute('onclick', "app.navTo('orders')");
            ordersIcon.innerHTML = '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>';
        }
    },

    handleAuthFromDrawer() {
        this.toggleNavDrawer();
        this.handleAuth();
    },

    showToast(msg) {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => t.classList.remove('show'), 3600);
    },
        // --- LANDING PAGE INTERACTIONS ---
    
    initLandingPage() {
        // 1. Typewriter Effect
        const text = "Tuloy ka, suki! Dito, ang bawat pili ay may kasamang init ng tahanan.";
        const el = document.getElementById('typewriter-text');
        if (el) {
            el.innerHTML = '<span class="type-cursor"></span>';
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    el.innerHTML = text.substring(0, i + 1) + '<span class="type-cursor"></span>';
                    i++;
                    setTimeout(typeWriter, 40); // Speed of typing
                }
            };
            // Start typing after a tiny delay
            setTimeout(typeWriter, 500);
        }

        // 2. Mouse Follow Glow (Lantern Effect)
        const landingScreen = document.getElementById('view-landing');
        const glow = document.getElementById('landing-glow');
        
        if (landingScreen && glow) {
            landingScreen.addEventListener('mousemove', (e) => {
                // Only move if we are actually on the landing page
                if (!landingScreen.classList.contains('hidden')) {
                    const rect = landingScreen.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    glow.style.transform = `translate(${x}px, ${y}px)`;
                }
            });
            
            // Reset glow position when mouse leaves
            landingScreen.addEventListener('mouseleave', () => {
                glow.style.transform = `translate(-50%, -50%)`;
            });
        }
    },

    // 3. Cinematic Entry Transition
    enterStore() {
        const landing = document.getElementById('view-landing');
        if (!landing) return;
        
        // Add the zooming class
        landing.classList.add('is-entering');
        
        // Wait for the animation to finish before switching views
        setTimeout(() => {
            this.go('auth');
            // Reset the class so it works again if they log out
            setTimeout(() => landing.classList.remove('is-entering'), 500);
        }, 800); // Matches the CSS transition duration
    },
        // 1. Set up the mouse follower
    initLandingInteractions() {
        const landingScreen = document.getElementById('view-landing');
        const glow = document.getElementById('landing-glow');
        
        if (landingScreen && glow) {
            landingScreen.addEventListener('mousemove', (e) => {
                // Only move if we are actually on the landing page
                if (!landingScreen.classList.contains('hidden')) {
                    const rect = landingScreen.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    glow.style.transform = `translate(${x}px, ${y}px)`;
                }
            });
        }
    },

    // 2. The cinematic entry transition
    enterStore() {
        const landing = document.getElementById('view-landing');
        if (!landing) return;
        
        // Add the zooming class
        landing.classList.add('is-entering');
        
        // Wait for the 1.2s animation to finish before switching the view
        setTimeout(() => {
            this.go('auth');
            
            // Reset the class so it's ready for next time
            setTimeout(() => landing.classList.remove('is-entering'), 100);
        }, 1200); // Must match the CSS transition time
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
        $('auth-pass').value = '';
        $('auth-name').value = '';
        $('auth-email').value = '';
        if ($('auth-pass').type === 'text') $('auth-pass').type = 'password';

        if (animate) {
            card.classList.remove('bump'); void card.offsetWidth; card.classList.add('bump');
            setTimeout(() => (next ? $('auth-name') : $('auth-email')).focus(), 380);
        }
    },

    togglePassword() {
        const p = document.getElementById('auth-pass');
        const iconShow = document.getElementById('eye-icon-show');
        const iconHide = document.getElementById('eye-icon-hide');
        const show = p.type === 'password';
        p.type = show ? 'text' : 'password';
        
        if (show) {
            iconShow.style.display = 'none';
            iconHide.style.display = 'block';
        } else {
            iconShow.style.display = 'block';
            iconHide.style.display = 'none';
        }
        p.focus();
    },

    continueAsGuest() {
        this.go('home');
        this.showToast('Tuloy ka, bisita! Mag-ikot ka lang nang dahan-dahan.');
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
            this.showToast(this.isSignUp ? 'Maligayang pagdating sa PiliKart, suki!' : 'Welcome back, suki! Tuloy ka.');
            await this.init();
            this.authBusy = false;
        } catch (err) {
            this.authBusy = false;
            this.authFail('Walang koneksyon sa server.');
        }
    },

    prefillCheckout() {
        if (!this.user) return;

        let addrObj = { street: '', brgy: '', city: '' };
        try {
            if (this.user.address && this.user.address.trim().startsWith('{')) {
                addrObj = JSON.parse(this.user.address);
            } else if (this.user.address) {
                addrObj.street = this.user.address;
                if (this.user.address.toLowerCase().includes('calamba')) addrObj.city = 'Calamba';
            }
        } catch(e) {}

        const set = (id, v) => { const f = document.getElementById(id); if (f && !f.value && v) f.value = v; };
        set('co-name', this.user.name);
        set('co-phone', this.user.phone);
        
        const citySelect = document.getElementById('co-city');
        if (addrObj.city) {
            citySelect.value = addrObj.city;
            this.updateBrgyDropdown();
            if (addrObj.brgy) {
                document.getElementById('co-brgy').value = addrObj.brgy;
            }
        }
        set('co-street', addrObj.street);

        const noAddrNote = document.getElementById('co-no-address-note');
        if (noAddrNote) {
            if (!addrObj.city && !addrObj.brgy && !addrObj.street) {
                noAddrNote.classList.remove('hidden');
            } else {
                noAddrNote.classList.add('hidden');
            }
        }
    },

    renderCarousel() {
        const container = document.getElementById('carousel-card-container');
        if (!container) return;

        if (container.children.length === 0) {
            container.innerHTML = this.departments.map((dept, index) => {
                return `
                    <div class="carousel-card" id="carousel-card-${index}">
                        <img src="${dept.image}" class="carousel-img" alt="${dept.name}">
                        <div class="carousel-glass-panel">
                            <span class="carousel-badge">${dept.name}</span>
                            <h3 class="carousel-title">${dept.featured}</h3>
                            <p class="carousel-desc">${dept.desc}</p>
                        </div>
                    </div>
                `;
            }).join('');
        }

        this.departments.forEach((_, index) => {
            const card = document.getElementById(`carousel-card-${index}`);
            if (!card) return;

            card.classList.remove('active', 'prev', 'next', 'hidden');

            const len = this.departments.length;
            if (index === this.carouselIndex) {
                card.classList.add('active');
            } else if (index === (this.carouselIndex - 1 + len) % len) {
                card.classList.add('prev');
            } else if (index === (this.carouselIndex + 1) % len) {
                card.classList.add('next');
            } else {
                card.classList.add('hidden');
            }
        });

        document.querySelectorAll('.dot').forEach((dot, idx) => dot.classList.toggle('active', idx === this.carouselIndex));
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

        const categoryMeta = {
            paso: { label: 'PASO' },
            nipa: { label: 'NIPA' },
            habi: { label: 'HABI' },
            apollo: { label: 'APOLLO' }
        };

        const sig = this.selectedCategory + '|' + this.products.length;
        const animate = sig !== this._menuSig;
        this._menuSig = sig;

        const html = this.products.filter(p => {
            const cat = p.category ? p.category.toLowerCase() : '';
            const matchCat = this.selectedCategory === 'all' || cat === this.selectedCategory.toLowerCase();
            const matchQ = p.name.toLowerCase().includes(q) || (p.tags && p.tags.toLowerCase().includes(q));
            const matchB = p.price <= budget;
            return matchCat && matchQ && matchB;
        }).map((p, idx) => {
            const catKey = (p.category || 'paso').toLowerCase();
            const meta = categoryMeta[catKey] || { label: catKey.toUpperCase() };
            const icon = this.deptIcons[catKey] || '';

            const formattedPrice = Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            const out = p.stock <= 0;
            const stockPill = out ? '<span class="stock-pill out">Ubos na</span>'
                : (p.stock <= 5 ? `<span class="stock-pill">${p.stock} na lang!</span>` : '');

            let stockClass = 'stock-high';
            if (p.stock <= 0) stockClass = 'stock-out';
            else if (p.stock <= 10) stockClass = 'stock-low';

            // NEW: Check if it's a best seller
            const isBestSeller = Number(p.best_seller) === 1;
            const bestSellerPill = isBestSeller ? `<span class="best-seller-pill">⭐ Suki's Choice</span>` : '';

            return `
                <div class="card product-card ${out ? 'is-out' : ''} ${animate ? 'enter' : ''}" style="--i:${idx}">
                    <div class="prod-badges-row">
                        <span class="dept-badge ${catKey}">${icon} ${meta.label}</span>
                        <div class="badges-right">
                            ${bestSellerPill}
                            ${stockPill}
                        </div>
                    </div>
                    <div class="prod-img-wrap">
                        <img src="${p.image}" class="product-img" alt="${p.name}" loading="lazy">
                    </div>

                    <div class="prod-info">
                        <h3 class="prod-title">${p.name}</h3>
                        <p class="prod-tagline">${p.tagline || 'Quality finds from PiliKart'}</p>

                        <div class="prod-expanded-details">
                            <p class="prod-desc">${p.description}</p>
                            <div class="prod-meta">
                                <div class="tags-wrap">
                                    ${p.tags ? p.tags.split(',').map(t => `<span class="meta-chip tag">${this.esc(t.trim())}</span>`).join('') : '<span class="meta-chip tag">Local Find</span>'}
                                </div>
                                <span class="meta-chip stock ${stockClass}"><strong>${p.stock}</strong><span>in stock</span></span>
                            </div>
                        </div>
                    </div>

                    <div class="prod-footer">
                        <div>
                            <span class="prod-price-label">Presyo</span>
                            <span class="prod-price-val">₱${formattedPrice}</span>
                        </div>
                        <button class="btn btn-brand add-btn" onclick="app.addToCart(${p.id}, this)" ${out ? 'disabled' : ''}>${out ? 'Ubos na' : '+ Add'}</button>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('product-grid').innerHTML = html || this.emptyState('search', 'Hmm, wala pa kaming nahanap', 'Subukan ang ibang salita o kategorya — baka nasa kabilang sulok lang ang hinahanap mo.');
    },

    pendingCartItem: null,
    pendingQty: 1,

    addToCart(id, btn) {
        const p = this.products.find(x => x.id === id);
        if (!p || p.stock <= 0) return;

        this.pendingCartItem = p;
        this.pendingQty = 1;
        this.renderAddConfirmModal();

        const modal = document.getElementById('add-confirm-modal');
        if (modal) modal.classList.remove('hidden');
    },

    renderAddConfirmModal() {
        const p = this.pendingCartItem;
        if (!p) return;

        const box = document.getElementById('add-confirm-item-box');
        if (!box) return;

        // Parse Options
        let optionsHtml = '';
        if (p.options) {
            try {
                const parsedOpts = JSON.parse(p.options);
                for (const [groupName, choices] of Object.entries(parsedOpts)) {
                    if (Array.isArray(choices) && choices.length > 0) {
                        optionsHtml += `
                            <div class="ci-option-group">
                                <label class="ci-option-label">${groupName}</label>
                                <div class="ci-radio-pills">
                                    ${choices.map((c, i) => `
                                        <label class="ci-radio-label">
                                            <input type="radio" name="opt_${groupName}" value="${this.esc(c)}" ${i === 0 ? 'checked' : ''}>
                                            <span>${this.esc(c)}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    }
                }
            } catch(e) { console.warn('Invalid options JSON', e); }
        }

        const totalCost = p.price * this.pendingQty;
        const formattedUnit = Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const formattedTotal = Number(totalCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        box.innerHTML = `
            <div class="ci-horizontal-layout">
                <!-- Left Column: Image -->
                <div class="ci-left-col">
                    <img src="${this.esc(p.image || '')}" class="ci-hero-thumb" alt="${this.esc(p.name)}">
                </div>

                <!-- Right Column: Details & Options -->
                <div class="ci-right-col">
                    <div class="ci-header">
                        <h3 class="ci-title">${this.esc(p.name)}</h3>
                        ${p.tagline ? `<p class="ci-tagline">${this.esc(p.tagline)}</p>` : ''}
                    </div>
                    
                    <p class="ci-desc">${this.esc(p.description || '')}</p>
                    
                    ${optionsHtml ? `<div class="ci-options-container">${optionsHtml}</div>` : ''}

                    <div class="ci-bottom-controls">
                        <div class="qty-stepper-wrap">
                            <span class="ci-control-label">Quantity</span>
                            <div class="qty-stepper">
                                <button class="qty-step-btn" onclick="app.adjustPendingQty(-1)">−</button>
                                <span class="qty-val">${this.pendingQty}</span>
                                <button class="qty-step-btn" onclick="app.adjustPendingQty(1)">+</button>
                            </div>
                        </div>
                        
                        <div class="ci-price-wrap">
                            <span class="ci-stock-text">${p.stock} available &bull; ₱${formattedUnit} each</span>
                            <span class="ci-total-text">Total: <b>₱${formattedTotal}</b></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    adjustPendingQty(d) {
        if (!this.pendingCartItem) return;
        const max = this.pendingCartItem.stock;
        this.pendingQty = Math.max(1, Math.min(max, this.pendingQty + d));
        this.renderAddConfirmModal();
    },

    confirmAddToCart() {
        if (!this.pendingCartItem) return;
        const p = this.pendingCartItem;

        // Gather selected options
        const selectedOptions = [];
        document.querySelectorAll('#add-confirm-item-box input[type="radio"]:checked').forEach(input => {
            const groupName = input.name.replace('opt_', '');
            selectedOptions.push(`${groupName}: ${input.value}`);
        });
        const variationStr = selectedOptions.join(', ');

        // Check if the exact product + variation is already in the cart
        const item = this.cart.find(x => x.id === p.id && (x.variation || '') === variationStr);
        
        if (item) {
            item.qty += this.pendingQty;
            item.selected = true;
        } else {
            this.cart.push({ ...p, qty: this.pendingQty, selected: true, variation: variationStr });
        }

        this.saveCart();
        this.closeAddModal();

        const badge = document.getElementById('cart-badge');
        if (badge) { badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); }
        
        const varText = variationStr ? ` (${variationStr})` : '';
        this.showToast(`${p.name}${varText} (${this.pendingQty}x) — nasa basket mo na!`);
    },

    closeAddModal() {
        const modal = document.getElementById('add-confirm-modal');
        if (!modal) return;
        modal.classList.add('closing');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('closing');
            this.pendingCartItem = null;
        }, 500);
    },

    emptyState(kind, title, text, btnLabel, btnAction) {
        const icons = {
            cart: '<svg viewBox="0 0 24 24"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 8H6.2"></path><circle cx="10" cy="20" r="1.2"></circle><circle cx="17" cy="20" r="1.2"></circle></svg>',
            orders: '<svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1z"></path><line x1="9" y1="8" x2="15" y2="8"></line><line x1="9" y1="12" x2="13" y2="12"></line></svg>',
            search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
            login: '<svg viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>'
        };
        return `<div class="empty-state">${icons[kind] || ''}<h3 class="font-display">${title}</h3><p>${text}</p>${btnLabel ? `<button class="btn btn-brand" onclick="${btnAction}">${btnLabel}</button>` : ''}</div>`;
    },

    saveCart() {
        localStorage.setItem('pk_cart', JSON.stringify(this.cart));
        this.renderCart();
        if (this.currentView === 'cart') this.renderCartPage();
    },

    renderCart() {
        const count = this.cart.reduce((s, x) => s + x.qty, 0);
        const badge = document.getElementById('cart-badge');
        if (badge) badge.textContent = count;

        const itemsDiv = document.getElementById('cart-items');
        const foot = document.getElementById('cart-foot');
        if (itemsDiv) {
            itemsDiv.innerHTML = this.cart.map((c, i) => `
                <div class="cart-row-card" style="animation-delay:${i * 80}ms">
                    <img class="cart-card-thumb" src="${this.esc(c.image || '')}" alt="${this.esc(c.name)}">
                    <div class="cart-card-info">
                        <b class="cart-card-title">${this.esc(c.name)}</b>
                        ${c.variation ? `<small style="display:block; font-size:11px; color:var(--brand); margin-top:2px;">${this.esc(c.variation)}</small>` : ''}
                        <span class="cart-card-price">₱${(c.price * c.qty).toFixed(2)}</span>
                    </div>
                    <div class="cart-card-qty">
                        <button class="qty-circle-btn" aria-label="${c.qty > 1 ? 'Bawasan' : 'Alisin'}" onclick="app.updateQty(${c.id}, ${c.variation ? `'${this.esc(c.variation)}'` : 'null'}, -1)">−</button>
                        <span class="qty-num">${c.qty}</span>
                        <button class="qty-circle-btn" aria-label="Dagdagan" onclick="app.updateQty(${c.id}, ${c.variation ? `'${this.esc(c.variation)}'` : 'null'}, 1)">+</button>
                    </div>
                </div>
            `).join('') || this.emptyState('cart', 'Ay, bakante pa ang cart mo!', 'Mukhang wala pang laman ang iyong cart. Mamili na ng paborito mo!', 'Tingnan ang Menu', 'app.toggleCart(); app.scrollToMenu();');
        }
        if (foot) foot.style.display = this.cart.length ? '' : 'none';

        const subtotal = this.cart.reduce((s, x) => s + x.price * x.qty, 0);
        const fee = this.cart.length ? this.fee : 0;
        const total = subtotal + fee;

        const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = '₱' + v.toFixed(2); };
        set('cart-subtotal', subtotal);
        set('cart-fee', fee);
        set('cart-total', total);
    },

    updateQty(id, variation, d) {
        const i = this.cart.find(x => x.id === id && (x.variation || '') === (variation || ''));
        if (i) {
            i.qty += d;
            if (i.qty <= 0) this.cart = this.cart.filter(x => !(x.id === id && (x.variation || '') === (variation || '')));
            this.saveCart();
        }
    },

    toggleCart(force = false) {
        const d = document.getElementById('cart-drawer');
        if (!d) return;

        if (force) {
            d.classList.add('hidden');
            d.classList.remove('closing');
            this._cartBusy = false;
            return;
        }

        const isOpen = !d.classList.contains('hidden');
        if (!isOpen) {
            d.classList.remove('hidden', 'closing');
            return;
        }
        this._cartBusy = true;
        d.classList.add('closing');
        setTimeout(() => { d.classList.add('hidden'); d.classList.remove('closing'); this._cartBusy = false; }, 800);
    },

    closeModal(id) {
        const m = document.getElementById(id);
        if (!m || m.classList.contains('hidden')) return;
        m.classList.add('closing');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('closing'); }, 650);
    },

    renderCartPage() {
        if (!Array.isArray(this.cart)) this.cart = [];

        const list = document.getElementById('cart-page-items');
        const summary = document.querySelector('.cart-page-summary');
        const selectAll = document.getElementById('cart-select-all');
        if (!list || !summary) return;

        if (this.cart.length === 0) {
            list.innerHTML = this.emptyState('cart', 'Bakante pa ang cart mo', 'Pumili ka muna ng paborito mo, saka tayo mag-checkout.', 'Tingnan ang Menu', 'app.scrollToMenu()');
            summary.style.display = 'none';
            if (selectAll) selectAll.checked = false;
            return;
        }

        summary.style.display = 'block';

        let needsSave = false;
        this.cart.forEach(c => {
            if (c.selected === undefined) {
                c.selected = true;
                needsSave = true;
            }
        });
        if (needsSave) this.saveCart();

        const allSelected = this.cart.every(c => c.selected);
        if (selectAll) selectAll.checked = allSelected;

        list.innerHTML = this.cart.map(c => `
            <div class="cart-page-item ${c.selected ? 'selected' : ''}">
                <label class="cart-checkbox-wrap">
                    <input type="checkbox" ${c.selected ? 'checked' : ''} onchange="app.toggleCartItem(${c.id}, ${c.variation ? `'${this.esc(c.variation)}'` : 'null'})">
                    <span class="cart-checkbox-custom"></span>
                </label>
                <img src="${this.esc(c.image || '')}" class="cart-page-img" alt="${this.esc(c.name)}">
                <div class="cart-page-info">
                    <h4>${this.esc(c.name)}</h4>
                    ${c.variation ? `<p style="font-size:12px; font-weight:800; color:var(--brand); margin-bottom:4px;">${this.esc(c.variation)}</p>` : ''}
                    <p class="cart-page-price">₱${Number(c.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} bawat isa</p>
                    <p class="cart-page-subtotal-inline" style="font-weight:800; color:var(--brand); font-size:15px; margin-top:4px;">₱${(Number(c.price || 0) * c.qty).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <div class="cart-page-actions" style="display:flex; align-items:center; gap:8px; margin-left:auto;">
                    <button class="qty-circle-btn" onclick="app.updateQty(${c.id}, ${c.variation ? `'${this.esc(c.variation)}'` : 'null'}, 1)" title="Dagdagan">+</button>
                    <span class="qty-num" style="font-size:16px; font-weight:800; min-width:24px; text-align:center;">${c.qty}</span>
                    <button class="qty-circle-btn" onclick="app.updateQty(${c.id}, ${c.variation ? `'${this.esc(c.variation)}'` : 'null'}, -1)" title="Bawasan">−</button>
                    <div style="width:1px; height:20px; background:var(--line); margin: 0 6px;"></div>
                    <button class="qty-circle-btn" onclick="app.removeFromCart(${c.id}, ${c.variation ? `'${this.esc(c.variation)}'` : 'null'})" style="color:#e5604d; border-color:rgba(229,96,77,0.3);" title="Alisin">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('') + `<div style="margin-top:20px; text-align:left;"><a href="#" onclick="app.clearCart(); return false;" style="color:var(--muted); font-size:13px; font-weight:700; text-decoration:underline;">I-clear ang buong cart</a></div>`;

        this.updateCartPageSummary();
    },

    removeFromCart(id, variation) {
        this.cart = this.cart.filter(x => !(x.id === id && (x.variation || '') === (variation || '')));
        this.saveCart();
    },

    clearCart() {
        if(confirm('Sigurado ka bang i-clear ang buong cart?')) {
            this.cart = [];
            this.saveCart();
        }
    },

    toggleCartItem(id, variation) {
        const item = this.cart.find(x => x.id === id && (x.variation || '') === (variation || ''));
        if (item) {
            item.selected = !item.selected;
            this.saveCart();
        }
    },

    toggleAllCartItems(checked) {
        this.cart.forEach(c => c.selected = checked);
        this.saveCart();
    },

    updateCartPageSummary() {
        const selected = this.cart.filter(c => c.selected);
        const subtotal = selected.reduce((s, x) => s + x.price * x.qty, 0);
        const fee = selected.length ? this.fee : 0;
        const total = subtotal + fee;

        const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = '₱' + v.toFixed(2); };
        set('cart-page-subtotal', subtotal);
        set('cart-page-fee', fee);
        set('cart-page-total', total);
    },

    toggleProtection(checked) {
        this.protectionEnabled = checked;
        this.renderCheckoutSummary();
    },

        renderCheckoutSummary() {
        const el = document.getElementById('checkout-summary');
        if (!el) return;

        let needsSave = false;
        this.cart.forEach(c => {
            if (c.selected === undefined) { c.selected = true; needsSave = true; }
        });
        if (needsSave) this.saveCart();

        if (this.cart.length > 0 && !this.cart.some(c => c.selected)) {
            this.cart.forEach(c => c.selected = true);
            this.saveCart();
        }

        const selectedCart = this.cart.filter(c => c.selected);
        const subtotal = selectedCart.reduce((s, x) => s + x.price * x.qty, 0);
        const fee = selectedCart.length ? this.fee : 0;
        const protectionFee = this.protectionEnabled ? Math.ceil(subtotal / 200) * 50 : 0;

        if (!selectedCart.length) {
            el.innerHTML = this.emptyState('cart', 'Walang napiling item', 'Bumalik ka muna sa cart at pumili ng item.', 'Balik sa Cart', 'app.go(\'cart\')');
        } else {
            el.innerHTML = selectedCart.map(c => `
                <div class="sum-item">
                    <img class="sum-thumb" src="${this.esc(c.image || '')}" alt="">
                    <div class="sum-name">
                        <b style="display:block; line-height:1.2; margin-bottom:2px;">${this.esc(c.name)}</b>
                        ${c.variation ? `<div style="color:var(--brand); font-size:11px; font-weight:800; margin-bottom:2px;">${this.esc(c.variation)}</div>` : ''}
                        <div style="color:var(--muted); font-size:12px; font-weight:700;">${c.qty} × ${this.money(c.price)}</div>
                    </div>
                    <span class="sum-price" style="align-self: flex-start; margin-top: 4px;">${this.money(c.price * c.qty)}</span>
                </div>`).join('') + `
                <div class="protection-option">
                    <label class="cart-checkbox-wrap protection-checkbox-wrap">
                        <input type="checkbox" id="protection-checkbox" ${this.protectionEnabled ? 'checked' : ''} onchange="app.toggleProtection(this.checked)">
                        <span class="cart-checkbox-custom"></span>
                        <span class="protection-label">
                            <b>Delivery Protection</b>
                            <small>+${this.money(Math.ceil(subtotal / 200) * 50)} (₱50 per ₱200 subtotal)</small>
                        </span>
                    </label>
                </div>
                <div class="sum-totals">
                    <div class="sum-row"><span>Subtotal</span><span>${this.money(subtotal)}</span></div>
                    <div class="sum-row"><span>Shipping fee</span><span>${this.money(fee)}</span></div>
                    ${this.protectionEnabled ? `<div class="sum-row"><span>Protection fee</span><span>${this.money(protectionFee)}</span></div>` : ''}
                    <div class="sum-row total"><span>Kabuuan</span><span>${this.money(subtotal + fee + protectionFee)}</span></div>
                </div>`;
        }
        const amt = document.getElementById('gcash-amount');
        if (amt) amt.textContent = this.money(subtotal + fee + protectionFee);
        const guest = document.getElementById('co-guest-note');
        if (guest) guest.style.display = this.user ? 'none' : '';
    },

    selectPayment(method) {
        document.getElementById('co-payment').value = method;
        document.getElementById('pay-cod').classList.toggle('active', method === 'cod');
        document.getElementById('pay-gcash').classList.toggle('active', method === 'gcash');
        document.getElementById('gcash-box').classList.toggle('open', method === 'gcash');
        document.getElementById('co-foot-note').textContent = method === 'gcash'
            ? 'I-upload muna ang screenshot ng GCash payment bago ipadala ang order.'
            : 'Magbabayad ka pag dating ng rider. Salamat sa tiwala, suki!';
    },

    fieldFail(id, msg) {
        const f = document.getElementById(id);
        if (f) {
            f.classList.remove('invalid'); void f.offsetWidth; f.classList.add('invalid');
            if (f.focus && f.tagName !== 'LABEL') f.focus();
            if (f.scrollIntoView) f.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const clear = () => { f.classList.remove('invalid'); f.removeEventListener('input', clear); };
            f.addEventListener('input', clear);
        }
        this.showToast(msg);
    },

    handleQrError(img) {
        img.onerror = null;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><g fill="black"><rect x="8" y="8" width="26" height="26"/><rect x="66" y="8" width="26" height="26"/><rect x="8" y="66" width="26" height="26"/></g><g fill="white"><rect x="14" y="14" width="14" height="14"/><rect x="72" y="14" width="14" height="14"/><rect x="14" y="72" width="14" height="14"/></g><g fill="black"><rect x="40" y="10" width="8" height="8"/><rect x="40" y="40" width="8" height="8"/><rect x="56" y="50" width="8" height="8"/><rect x="70" y="66" width="8" height="8"/><rect x="50" y="72" width="8" height="8"/><rect x="80" y="80" width="8" height="8"/><rect x="10" y="46" width="8" height="8"/><rect x="26" y="46" width="8" height="8"/></g></svg>`;
        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    },

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { this.showToast('Masyadong malaki ang file \u2014 max 10MB lang, suki.'); e.target.value = ''; return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const scale = Math.min(1, 800 / Math.max(img.width, img.height));
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                this.gcashBase64 = canvas.toDataURL('image/jpeg', 0.7);

                const prev = document.getElementById('gcash-preview');
                prev.src = this.gcashBase64;
                prev.style.display = 'block';
                const drop = document.getElementById('gcash-drop');
                drop.classList.add('has-file'); drop.classList.remove('invalid');
                document.getElementById('gcash-drop-title').textContent = 'Natanggap na ang screenshot mo!';
                document.getElementById('gcash-drop-sub').textContent = 'I-click para palitan';
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    },

    async refreshData() {
        try {
            const res = await fetch('api.php?action=load');
            const data = await res.json();
            this.user = data.user;
            this.products = data.products || [];
            this.orders = data.orders || [];
            this.fee = data.fee || this.fee;
            this.renderMenu();
            this.renderCart();
        } catch (e) { console.warn('Refresh failed', e); }
    },

    async submitOrder() {
        if (this.orderBusy) return;
        const selectedCart = this.cart.filter(c => c.selected);
        if (!selectedCart.length) return this.showToast('Walang napiling item, suki!');

        const val = id => document.getElementById(id).value.trim();
        const payment = val('co-payment') === 'gcash' ? 'gcash' : 'cod';
        const name = val('co-name'), phone = val('co-phone');
        const city = val('co-city'), brgy = val('co-brgy'), street = val('co-street');

        if (!name) return this.fieldFail('co-name', 'Sino ang tatanggap, suki? Ilagay ang pangalan.');
        
        const cleanPhone = phone.replace(/[\s-]/g, '');
        if (!/^(09|\+639)\d{9}$/.test(cleanPhone)) {
            return this.fieldFail('co-phone', 'Mali ang format ng number. Dapat 09XXXXXXXXX o +639XXXXXXXXX.');
        }

        if (!city) return this.fieldFail('co-city', 'Saan namin ihahatid? Pumili ng lungsod.');
        if (!brgy) return this.fieldFail('co-brgy', 'Pumili ng barangay.');

        const hasPaso = selectedCart.some(c => (c.category || '').toLowerCase() === 'paso');
        if (hasPaso && city !== 'Calamba') {
            return this.fieldFail('co-city', 'Ang PASO (pagkain) items ay pwede lang i-deliver sa loob ng Calamba, Laguna.');
        }

        if (payment === 'gcash' && !this.gcashBase64) return this.fieldFail('gcash-drop', 'I-upload muna ang screenshot ng GCash receipt.');

        const address = JSON.stringify({ street, brgy, city });

        const snapshot = selectedCart.map(c => ({ ...c }));
        const subtotal = snapshot.reduce((s, x) => s + x.price * x.qty, 0);
        const protectionFee = this.protectionEnabled ? Math.ceil(subtotal / 200) * 50 : 0;

        const payload = {
            items: selectedCart.map(c => ({ id: c.id, qty: c.qty, variation: c.variation || '' })),
            name, phone: cleanPhone, address, payment,
            proof: this.gcashBase64,
            fee: this.fee,
            protection_fee: protectionFee
        };

        const btn = document.getElementById('co-submit');
        const label = btn.innerHTML;
        this.orderBusy = true;
        btn.disabled = true; btn.classList.add('loading'); btn.textContent = 'Ipinapadala...';

        try {
            const res = await fetch('api.php?action=place-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.ok) {
                this.lastOrder = { id: data.order_id, items: snapshot, subtotal, fee: this.fee, protectionFee, total: subtotal + this.fee + protectionFee, name, address, payment };

                this.cart = this.cart.filter(c => !c.selected);
                this.saveCart();

                this.gcashBase64 = '';
                this.protectionEnabled = false;
                this.resetCheckoutForm();
                this.go('success');
                this.refreshData();
            } else {
                this.showToast(data.error || 'Hindi natuloy ang order. Subukan ulit, suki.');
            }
        } catch (err) {
            this.showToast('Walang koneksyon sa server. Subukan ulit mamaya.');
        } finally {
            this.orderBusy = false;
            btn.disabled = false; btn.classList.remove('loading'); btn.innerHTML = label;
        }
    },

    resetCheckoutForm() {
        ['co-name', 'co-phone', 'co-street'].forEach(id => { const f = document.getElementById(id); if (f) f.value = ''; });
        ['co-city', 'co-brgy'].forEach(id => { const f = document.getElementById(id); if (f) f.selectedIndex = 0; });
        const file = document.getElementById('gcash-file'); if (file) file.value = '';
        const prev = document.getElementById('gcash-preview'); if (prev) { prev.src = ''; prev.style.display = 'none'; }
        const drop = document.getElementById('gcash-drop'); if (drop) drop.classList.remove('has-file');
        const t = document.getElementById('gcash-drop-title'); if (t) t.textContent = 'Pumili ng screenshot';
        const sub = document.getElementById('gcash-drop-sub'); if (sub) sub.textContent = 'I-click para pumili ng file mula sa device mo';
        this.protectionEnabled = false;
        this.selectPayment('cod');
        this.updateShippingFee();
    },

    renderSuccess() {
        const box = document.getElementById('success-body');
        if (!box) return;
        const o = this.lastOrder;
        if (!o) {
            box.innerHTML = this.emptyState('orders', 'Wala pang bagong order', 'Kapag nakapag-order ka na, dito mo makikita ang biyahe nito.', 'Mamili na', 'app.scrollToMenu()');
            return;
        }
        const ic = {
            clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
            box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
            bike: '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-8h5l3 8M10 9H8"/>',
            home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-6h6v6"/>'
        };
        const steps = [
            ['clock', 'Pending', 'Natanggap'],
            ['box', 'Shipping', 'Naka-package'],
            ['bike', 'Out for Delivery', 'Palapit na!'],
            ['home', 'Delivered', 'Dumating na!']
        ];
        const who = this.esc(o.name.split(/\s+/)[0]);
        box.innerHTML = `
            <div class="success-hero">
                <div class="check-badge"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                <h1>Salamat, ${who}!</h1>
                <p>Natanggap na namin ang <b>Order #${this.esc(o.id)}</b>. Inihahanda na namin ito nang buong puso.</p>
            </div>

            <div class="tracker-card">
                <h3>Ang biyahe ng order mo</h3>
                <div class="tracker">
                    ${steps.map((st, i) => `
                        <div class="t-step ${i === 0 ? 'active' : ''}">
                            <div class="t-dot"><svg viewBox="0 0 24 24">${ic[st[0]]}</svg></div>
                            <b>${st[1]}</b><small>${st[2]}</small>
                        </div>`).join('')}
                </div>
            </div>

            <div class="items-card">
                <h3>Mga napili mo</h3>
                ${o.items.map(c => `<div class="sum-row item"><span>${c.qty}\u00D7 ${this.esc(c.name)} ${c.variation ? `<small>(${this.esc(c.variation)})</small>` : ''}</span><span>${this.money(c.price * c.qty)}</span></div>`).join('')}
                <div class="sum-totals">
                    <div class="sum-row"><span>Shipping fee</span><span>${this.money(o.fee)}</span></div>
                    ${o.protectionFee ? `<div class="sum-row"><span>Protection fee</span><span>${this.money(o.protectionFee)}</span></div>` : ''}
                    <div class="sum-row total"><span>Kabuuan</span><span>${this.money(o.total)}</span></div>
                </div>
                <p class="deliver-to">Ihahatid sa: <b>${this.esc(this.formatAddress(o.address))}</b> &middot; ${o.payment === 'gcash' ? 'GCash' : 'Cash on Delivery'}</p>
            </div>

            <div class="success-actions">
                <button class="btn btn-brand btn-large" onclick="app.go('orders')">I-track sa Mga Order Ko</button>
                <button class="btn btn-ghost btn-large" onclick="app.scrollToMenu()">Mamili Ulit</button>
            </div>
            ${this.user ? '' : '<p class="success-tip">Tip: <a href="#" onclick="app.go(\'auth\'); return false;">Gumawa ng account</a> para ma-track at makatanggap ng abiso sa susunod mong order!</p>'}
        `;
    },

    renderOrders() {
        const list = document.getElementById('orders-list');
        if (!this.user) {
            list.innerHTML = this.emptyState('login', 'Mag-login muna tayo, suki', 'Para makita ang mga order mo, mag-sign in sa iyong account.', 'Mag-sign in', 'app.handleAuth()');
            return;
        }

        list.innerHTML = this.orders.map(o => {
            let statusClass = 'status-pending';
            if (o.status === 'Shipping') statusClass = 'status-shipping';
            if (o.status === 'Out for Delivery') statusClass = 'status-out';
            if (o.status === 'Delivered') statusClass = 'status-delivered';

            return `
            <div class="card order-card">
                <div class="order-header">
                    <div class="order-icon-title">
                        <div class="order-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                        </div>
                        <div>
                            <h3>Order #${o.id}</h3>
                            <p class="order-subtitle">Salamat sa pagtangkilik!</p>
                        </div>
                    </div>
                    <span class="order-status ${statusClass}">${this.esc(o.status)}</span>
                </div>

                <div class="order-body">
                    <div class="order-items-list">
                        ${o.items.map(i => `
                            <div class="order-item-row">
                                <div class="order-item-info">
                                    <span class="item-qty">${i.qty}x</span>
                                    <span class="item-name">${this.esc(i.name)} ${i.variation ? `<small style="color:var(--brand); font-size:11px;">(${this.esc(i.variation)})</small>` : ''}</span>
                                </div>
                                <span class="item-total">${this.money(i.price * i.qty)}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="order-summary-row">
                        <span>Delivery Fee</span>
                        <span>${this.money(o.delivery_fee || 50)}</span>
                    </div>
                    ${(o.protection_fee && o.protection_fee > 0) ? `
                    <div class="order-summary-row">
                        <span>Protection Fee</span>
                        <span>${this.money(o.protection_fee)}</span>
                    </div>` : ''}
                </div>

                <div class="order-footer">
                    <span class="footer-label">Kabuuan</span>
                    <span class="footer-total">${this.money(o.total)}</span>
                </div>
            </div>
            `;
        }).join('') || this.emptyState('orders', 'Wala ka pang order', 'Wala pang laman ang listahan mo. Tara, mamili tayo nang dahan-dahan!', 'Mamili na', 'app.scrollToMenu()');
    },

    renderAccount() {
        if (!this.user) { this.go('auth'); return; }

        document.getElementById('acc-name').value = this.user.name || '';
        document.getElementById('acc-email').value = this.user.email || '';
        document.getElementById('acc-phone').value = this.user.phone || '';

        let addrObj = { street: '', brgy: '', city: '' };
        try {
            if (this.user.address && this.user.address.trim().startsWith('{')) {
                addrObj = JSON.parse(this.user.address);
            } else if (this.user.address) {
                addrObj.street = this.user.address;
                if (this.user.address.toLowerCase().includes('calamba')) addrObj.city = 'Calamba';
            }
        } catch(e) {}

        const citySelect = document.getElementById('acc-city');
        citySelect.innerHTML = '<option value="" disabled selected>Pumili ng Lungsod</option>';
        Object.keys(this.lagunaData).forEach(c => {
            citySelect.innerHTML += `<option value="${c}">${c}</option>`;
        });
        citySelect.value = addrObj.city || '';

        this.updateAccBrgyDropdown(addrObj.brgy || '');
        document.getElementById('acc-street').value = addrObj.street || '';

        const logsEl = document.getElementById('account-order-logs');
        if (!this.orders.length) {
            logsEl.innerHTML = '<p style="color:var(--muted); font-size:13px; text-align:center; padding:10px;">Wala ka pang order, suki.</p>';
        } else {
            logsEl.innerHTML = this.orders.slice(0, 3).map(o => `
                <div class="acc-order-row">
                    <div>
                        <b>Order #${o.id}</b>
                        <div style="font-size:11px; color:var(--muted);">${o.items.length} item(s)</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:800; color:var(--brand); font-size:14px;">${this.money(o.total)}</div>
                        <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:${o.status === 'Pending' ? '#f0a93b' : '#85b56d'};">${o.status}</div>
                    </div>
                </div>
            `).join('');
        }
    },

    async updateProfile() {
        const name = document.getElementById('acc-name').value.trim();
        const email = document.getElementById('acc-email').value.trim();
        const phone = document.getElementById('acc-phone').value.trim();
        const street = document.getElementById('acc-street').value.trim();
        const brgy = document.getElementById('acc-brgy').value;
        const city = document.getElementById('acc-city').value;

        if (!name) return this.showToast('Ilagay ang iyong pangalan.');
        if (!/^\S+@\S+\.\S+$/.test(email)) return this.showToast('Mali ang email format.');

        let cleanPhone = phone.replace(/[\s-]/g, '');
        if (cleanPhone && !/^(09|\+639)\d{9}$/.test(cleanPhone)) {
            return this.showToast('Mali ang format ng contact number. Dapat 09XXXXXXXXX o +639XXXXXXXXX.');
        }

        const address = (city || brgy || street) ? JSON.stringify({ street, brgy, city }) : '';

        try {
            const res = await fetch('api.php?action=update-profile', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone: cleanPhone, address })
            });
            const data = await res.json();
            if (data.ok) {
                this.showToast('Na-update na ang iyong profile!');
                await this.refreshData();
                this.updateNavDrawerAuthUI();
            } else {
                this.showToast(data.error || 'Hindi na-update ang profile.');
            }
        } catch (e) {
            this.showToast('Walang koneksyon sa server.');
        }
    },

    async changePassword() {
        const current = document.getElementById('acc-current-pass').value;
        const newPass = document.getElementById('acc-new-pass').value;
        const confirmPass = document.getElementById('acc-confirm-pass').value;

        if (!current) return this.showToast('Ilagay ang kasalukuyang password.');
        if (newPass.length < 6) return this.showToast('New Password: hindi bababa sa 6 characters.');
        if (newPass !== confirmPass) return this.showToast('Hindi nagtutugma ang new password at confirm password.');

        try {
            const res = await fetch('api.php?action=change-password', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ current, new: newPass })
            });
            const data = await res.json();
            if (data.ok) {
                this.showToast('Matagumpay na nabago ang password!');
                document.getElementById('acc-current-pass').value = '';
                document.getElementById('acc-new-pass').value = '';
                document.getElementById('acc-confirm-pass').value = '';
            } else {
                this.showToast(data.error || 'Mali ang kasalukuyang password.');
            }
        } catch (e) {
            this.showToast('Walang koneksyon sa server.');
        }
    },

    renderAdmin() {
        if (!this.user || this.user.role !== 'admin') return;

        let sales = this.orders.reduce((s, o) => s + parseInt(o.total), 0);
        document.getElementById('stat-sales').textContent = '\u20B1' + sales.toLocaleString();
        document.getElementById('stat-orders').textContent = this.orders.length;

        this.renderAdminOrders();
        this.renderAdminInventory();
    },

    switchAdminTab(tab, btn) {
        document.querySelectorAll('.admin-tab-btn').forEach(b => {
            b.className = 'btn btn-ghost admin-tab-btn';
        });
        btn.className = 'btn btn-brand admin-tab-btn';
        ['orders', 'stock', 'add'].forEach(t => document.getElementById('admin-' + t).classList.add('hidden'));
        document.getElementById('admin-' + tab).classList.remove('hidden');
    },

    filterAdminOrders() {
        this.adminOrderFilter.search = document.getElementById('admin-order-search').value.toLowerCase();
        this.adminOrderFilter.status = document.getElementById('admin-order-status').value;
        this.renderAdminOrders();
    },

    renderAdminOrders() {
        const grid = document.getElementById('admin-orders-grid');
        if (!grid) return;

        const filteredOrders = this.orders.filter(o => {
            const formattedAddr = this.formatAddress(o.address);
            const searchMatch =
                String(o.id).includes(this.adminOrderFilter.search) ||
                o.customer_name.toLowerCase().includes(this.adminOrderFilter.search) ||
                formattedAddr.toLowerCase().includes(this.adminOrderFilter.search) ||
                (o.phone && o.phone.includes(this.adminOrderFilter.search));

            const statusMatch = this.adminOrderFilter.status === 'all' || o.status === this.adminOrderFilter.status;

            return searchMatch && statusMatch;
        });

        grid.innerHTML = filteredOrders.map(o => {
            let statusClass = 'status-pending';
            if (o.status === 'Shipping') statusClass = 'status-shipping';
            if (o.status === 'Out for Delivery') statusClass = 'status-out';
            if (o.status === 'Delivered') statusClass = 'status-delivered';

            const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

            return `
            <div class="admin-order-card">
                <div class="admin-order-header">
                    <div>
                        <h4>Order #${o.id}</h4>
                        <span class="admin-order-date">${dateStr}</span>
                    </div>
                    <span class="order-status ${statusClass}">${this.esc(o.status)}</span>
                </div>

                <div class="admin-order-customer">
                    <div class="admin-cust-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div class="admin-cust-details">
                        <b>${this.esc(o.customer_name)}</b>
                        <p>${this.esc(o.phone || 'No phone provided')}</p>
                        <p class="admin-address">${this.esc(this.formatAddress(o.address))}</p>
                    </div>
                </div>

                <div class="admin-order-items">
                    ${o.items.map(i => `<div class="admin-item-row"><span>${i.qty}x ${this.esc(i.name)} ${i.variation ? `<small style="color:var(--brand);">(${this.esc(i.variation)})</small>` : ''}</span><span>${this.money(i.price * i.qty)}</span></div>`).join('')}
                </div>

                <div class="admin-order-footer">
                    <div class="admin-order-total">
                        <span>Total:</span>
                        <b>${this.money(o.total)}</b>
                        ${(o.protection_fee && o.protection_fee > 0) ? `<small style="display:block; font-size:10px; color:var(--muted); font-weight:700;">incl. ${this.money(o.protection_fee)} protection</small>` : ''}
                    </div>
                    <div class="admin-order-payment">
                        ${o.payment === 'gcash' ? `<button class="btn btn-ghost" style="padding:4px 8px; font-size:11px;" onclick="app.viewProof('${o.payment_proof}')">View GCash Proof</button>` : '<span class="pay-badge">COD</span>'}
                    </div>
                </div>

                <div class="admin-order-actions">
                    <select class="input" style="padding:8px; font-size:12px; flex:1;" onchange="app.updateOrderStatus(${o.id}, this.value)">
                        <option ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option ${o.status === 'Shipping' ? 'selected' : ''}>Shipping</option>
                        <option ${o.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                        <option ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                    <button class="btn btn-danger" style="padding:8px 12px; font-size:12px;" onclick="app.deleteOrder(${o.id})">Delete</button>
                </div>
            </div>
            `;
        }).join('') || '<div class="empty-state"><h3>No orders found</h3><p>Try adjusting your search or filter.</p></div>';
    },

    renderAdminInventory() {
        const container = document.getElementById('admin-inventory-container');
        if (!container) return;

        const categories = {
            paso: { name: 'PASO (Food Essentials)' },
            nipa: { name: 'NIPA (Home Essentials)' },
            habi: { name: 'HABI (Fashion)' },
            apollo: { name: 'APOLLO (Technologies)' }
        };

        let html = '';

        for (const [key, meta] of Object.entries(categories)) {
            const prods = this.products.filter(p => (p.category || '').toLowerCase() === key);
            if (prods.length === 0) continue;

            html += `
                <div class="admin-inventory-section">
                    <div class="admin-inv-header">
                        <h3><span class="inv-dept-ic ${key}">${this.deptIcons[key]}</span> ${meta.name}</h3>
                    </div>
                    <div class="admin-inv-grid">
                        ${prods.map(p => `
                            <div class="admin-inv-card">
                                <img src="${this.esc(p.image)}" alt="${this.esc(p.name)}" class="admin-inv-img">
                                <div class="admin-inv-info">
                                    <h4>${this.esc(p.name)}</h4>
                                    <div class="admin-inv-inputs">
                                        <div class="inv-input-group">
                                            <label>Price (₱)</label>
                                            <input type="number" id="p-price-${p.id}" class="input" value="${p.price}">
                                        </div>
                                        <div class="inv-input-group">
                                            <label>Stock</label>
                                            <input type="number" id="p-stock-${p.id}" class="input" value="${p.stock}">
                                        </div>
                                    </div>
                                    <div class="admin-inv-actions">
                                        <button class="btn btn-leaf" style="padding:6px 12px; font-size:12px;" onclick="app.saveProduct(${p.id})">Save</button>
                                        <button class="btn btn-ghost" style="padding:6px 12px; font-size:12px;" onclick="app.openProductEditor(${p.id})">Edit</button>
                                        <button class="btn btn-danger" style="padding:6px 12px; font-size:12px;" onclick="app.deleteProduct(${p.id})">Delete</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html || '<div class="empty-state"><h3>Walang laman ang inventory</h3><p>Mag-add ka ng item sa "Add Item" tab.</p></div>';
    },

    async reloadAdminData() {
        await this.refreshData();
        this.renderAdmin();
    },

    openProductEditor(id) {
        const p = this.products.find(x => x.id === id);
        if (!p) return;

        this.editingProductId = id;
        const $ = i => document.getElementById(i);

        $('pe-name').value = p.name || '';
        $('pe-tagline').value = p.tagline || '';
        $('pe-desc').value = p.description || '';
        $('pe-price').value = p.price;
        $('pe-stock').value = p.stock;
        $('pe-cat').value = (p.category || 'paso').toLowerCase();
        $('pe-image').value = p.image || '';
        $('pe-tags').value = p.tags || '';
        $('pe-bestseller').checked = Number(p.best_seller) === 1;
        $('pe-options').value = p.options || ''; // NEW

        this.updateEditorPreview();
        document.getElementById('product-editor-modal').classList.remove('hidden');
    },

    updateEditorPreview() {
        const img = document.getElementById('pe-preview');
        if (!img) return;
        const src = document.getElementById('pe-image').value.trim();
        img.src = src || 'https://placehold.co/400x400/eee/333?text=No+Image';
    },

    closeProductEditor() {
        const m = document.getElementById('product-editor-modal');
        if (!m) return;
        m.classList.add('hidden');
        this.editingProductId = null;
    },

    async saveProductEditor(e) {
        if (e) e.preventDefault();
        if (!this.editingProductId) return;

        const v = id => document.getElementById(id).value.trim();
        const name = v('pe-name');
        const price = parseInt(v('pe-price'), 10);
        const stock = parseInt(v('pe-stock'), 10);

        if (!name) return this.showToast('Ilagay ang pangalan ng produkto.');
        if (isNaN(price) || price < 0) return this.showToast('Mali ang presyo.');
        if (isNaN(stock) || stock < 0) return this.showToast('Mali ang stock.');

        const payload = {
            id: this.editingProductId,
            name,
            tagline: v('pe-tagline'),
            description: v('pe-desc'),
            price,
            stock,
            category: v('pe-cat'),
            image: v('pe-image'),
            tags: v('pe-tags'),
            best_seller: document.getElementById('pe-bestseller').checked ? 1 : 0,
            options: v('pe-options') // NEW
        };

        try {
            const res = await fetch('api.php?action=admin-edit-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!data.ok) return this.showToast(data.error || 'Hindi na-save ang produkto.');

            this.closeProductEditor();
            this.showToast('Na-update na ang produkto!');
            await this.reloadAdminData();
        } catch (err) {
            this.showToast('Walang koneksyon sa server.');
        }
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
        await this.reloadAdminData();
    },

    async deleteOrder(id) {
        if (!confirm('Delete this order permanently?')) return;
        await fetch('api.php?action=admin-delete-order', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ order_id: id })
        });
        await this.reloadAdminData();
    },

    async saveProduct(id) {
        const price = document.getElementById(`p-price-${id}`).value;
        const stock = document.getElementById(`p-stock-${id}`).value;
        await fetch('api.php?action=admin-update-product', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id, price, stock })
        });
        this.showToast('Product saved');
        await this.reloadAdminData();
    },

    async deleteProduct(id) {
        if (!confirm('Delete this product?')) return;
        await fetch('api.php?action=admin-delete-product', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id })
        });
        await this.reloadAdminData();
    },

    async addProduct(e) {
        if (e) e.preventDefault();

        const payload = {
            name: document.getElementById('add-name').value.trim(),
            tagline: document.getElementById('add-tagline').value.trim(),
            description: document.getElementById('add-desc').value.trim(),
            price: document.getElementById('add-price').value,
            stock: document.getElementById('add-stock').value,
            category: document.getElementById('add-cat').value,
            image: document.getElementById('add-image').value.trim(),
            tags: document.getElementById('add-tags').value.trim(),
            best_seller: document.getElementById('add-bestseller').checked ? 1 : 0,
            options: document.getElementById('add-options').value.trim() // NEW
        };

        try {
            const res = await fetch('api.php?action=admin-add-product', {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.ok) {
                this.showToast('Product added successfully!');
                document.getElementById('admin-add-form').reset();
                await this.reloadAdminData();
            } else {
                this.showToast(data.error || 'Failed to add product.');
            }
        } catch (err) {
            this.showToast('Connection error.');
        }
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
            let reply = "Hmm, di ko pa alam 'yan, suki! Subukan mong itanong ang delivery, GCash, o Budget Mode.";
            if (q.includes('deliver')) reply = `Ang delivery fee ay depende sa iyong barangay. Pumunta sa checkout para makita ang exact fee.`;
            if (q.includes('gcash')) reply = "Oo naman! Tumatanggap kami ng GCash — i-upload lang ang screenshot ng receipt mo sa checkout.";
            if (q.includes('budget')) reply = "Gamitin ang Budget Mode sa itaas ng menu para itago ang mga mas mahal na items.";
            if (q.includes('order')) reply = "Pumunta sa 'Mga Order Ko' para masubaybayan ang biyahe ng order mo.";
            if (q.includes('paso') || q.includes('pagkain') || q.includes('food')) reply = "Ang PASO (pagkain) items ay pwede lang i-deliver sa loob ng Calamba, Laguna.";
            if (q.includes('protect') || q.includes('spill') || q.includes('damage')) reply = "May 'Proteksyon sa spill/damage' checkbox sa checkout — ₱50 kada ₱200 ng subtotal mo. Pwede mong piliin o hindi.";

            chat.innerHTML += `<div class="pb-msg">${reply}</div>`;
            chat.scrollTop = chat.scrollHeight;
        }, 600);
    }
};

// Menu glow follows mouse
document.addEventListener('mousemove', e => {
    const g = document.getElementById('menu-cursor-glow');
    const sec = document.getElementById('home-menu-section');
    if (!g || !sec) return;
    const rect = sec.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
    g.style.transform = `translate(${e.clientX - rect.left - 200}px, ${e.clientY - rect.top - 200}px)`;
});

// Keep the hero video "cover"-sized on any viewport change
window.addEventListener('resize', () => app.sizeHeroVideo());
window.addEventListener('orientationchange', () => setTimeout(() => app.sizeHeroVideo(), 300));
window.addEventListener('load', () => app.sizeHeroVideo());

window.app = app;
document.addEventListener('DOMContentLoaded', () => app.init());