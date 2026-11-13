const app = {
    generateCombinationsUI(containerId, optionsContainerId) {
        const optContainer = document.getElementById(optionsContainerId);
        const stockContainer = document.getElementById(containerId);
        if (!optContainer || !stockContainer) return;

        const isEdit = containerId === 'pe-combo-stocks-container';
        const stockInputId = isEdit ? 'pe-stock' : 'add-stock';
        const stockHintId = isEdit ? 'pe-stock-hint' : 'add-stock-hint';
        const stockInput = document.getElementById(stockInputId);
        const stockHint = document.getElementById(stockHintId);

        // 1. Read current specs from the DOM
        const groups = [];
        optContainer.querySelectorAll('.pe-option-group').forEach(group => {
            const name = group.querySelector('.pe-opt-name').value.trim();
            if (!name) return;
            const choices = [];
            group.querySelectorAll('.pe-opt-choice-name').forEach(inp => {
                const val = inp.value.trim();
                if (val) choices.push(val);
            });
            if (choices.length > 0) groups.push({ name, choices });
        });

        // 2. Preserve existing values so we don't lose them on re-render
        const currentStocks = {};
        stockContainer.querySelectorAll('.combo-stock-row').forEach(row => {
            const combo = row.dataset.combo;
            const val = row.querySelector('input').value;
            if (combo && val !== '') currentStocks[combo] = parseInt(val) || 0;
        });

        // 3. Generate Cartesian Product of Combinations
        let combinations = [];
        if (groups.length > 0) {
            const keys = groups.map(g => g.name);
            const choices = groups.map(g => g.choices);

            const build = (index, currentCombo) => {
                if (index === keys.length) {
                    combinations.push(currentCombo.join(', '));
                    return;
                }
                for (let choice of choices[index]) {
                    build(index + 1, [...currentCombo, `${keys[index]}: ${choice}`]);
                }
            };
            build(0, []);
        }

        // 4. Render Inputs & Handle Stock Locking
        if (combinations.length === 0) {
            stockContainer.innerHTML = '<p style="font-size:12px; color:var(--muted);">Add specifications above to set combination stocks.</p>';
            if (stockInput) { stockInput.readOnly = false; stockInput.style.backgroundColor = ''; stockInput.style.cursor = ''; }
            if (stockHint) stockHint.style.display = 'none';
            return;
        }

        // If combinations exist, make the main stock field read-only
        if (stockInput) {
            stockInput.readOnly = true;
            stockInput.style.backgroundColor = 'var(--bg)';
            stockInput.style.cursor = 'not-allowed';
        }
        if (stockHint) stockHint.style.display = 'inline';

        stockContainer.innerHTML = combinations.map(combo => {
            const val = currentStocks[combo] !== undefined ? currentStocks[combo] : '';
            return `
                <div class="combo-stock-row" data-combo="${this.esc(combo)}" style="display:flex; align-items:center; justify-content:space-between; background:var(--bg); padding:8px 12px; border-radius:8px; border:1px solid var(--line);">
                    <span style="font-size:12px; font-weight:700; color:var(--ink); flex:1; padding-right:10px;">${this.esc(combo)}</span>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:11px; font-weight:800; color:var(--muted);">Stock:</span>
                        <input type="number" class="input combo-stock-input" value="${val}" min="0" placeholder="0" required style="width:80px; padding:4px 8px; text-align:center;" oninput="app.handleNumInput(this); app.updateTotalComboStock('${containerId}', '${stockInputId}')">
                    </div>
                </div>
            `;
        }).join('');

        // Auto-compute the total stock sum
        this.updateTotalComboStock(containerId, stockInputId);
    },

    updateTotalComboStock(containerId, stockInputId) {
        const stockInput = document.getElementById(stockInputId);
        if (!stockInput) return;
        let total = 0;
        document.querySelectorAll(`#${containerId} .combo-stock-input`).forEach(inp => {
            total += parseInt(inp.value) || 0;
        });
        stockInput.value = total;
    },

    // 🟢 Read combination stocks from UI into a JSON object
    _getComboStocksFromUI(containerId) {
        const comboStocks = {};
        document.querySelectorAll(`#${containerId} .combo-stock-row`).forEach(row => {
            const combo = row.dataset.combo;
            const val = parseInt(row.querySelector('input').value);
            if (combo && !isNaN(val) && val >= 0) {
                comboStocks[combo] = val;
            }
        });
        return comboStocks;
    },

    showConfirm(title, message, onConfirm, btnText = 'Confirm') {
        document.getElementById('cc-title').innerHTML = title;
        document.getElementById('cc-message').innerHTML = message; 
        const btn = document.getElementById('cc-confirm-btn');
        const cancelBtn = btn.previousElementSibling;
        
        // Force the cancel button to be visible and functional
        if (cancelBtn) cancelBtn.style.display = 'flex'; 
        btn.textContent = btnText;
        
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.onclick = () => {
            this.closeModal('custom-confirm-modal');
            onConfirm();
        };
        
        document.getElementById('custom-confirm-modal').classList.remove('hidden');
        this.updateBodyScrollLock();
    },
    
    showAlert(title, message) {
        document.getElementById('cc-title').textContent = title;
        document.getElementById('cc-message').innerHTML = message; 
        const btn = document.getElementById('cc-confirm-btn');
        const cancelBtn = btn.previousElementSibling;
        
        // Hide the cancel button for alerts
        if (cancelBtn) cancelBtn.style.display = 'none';
        btn.textContent = 'OK';
        
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.onclick = () => {
            this.closeModal('custom-confirm-modal');
        };
        
        document.getElementById('custom-confirm-modal').classList.remove('hidden');
        this.updateBodyScrollLock();
    },

    promptAdminDelete(type, id, name, actionCallback) {
        this._adminDeleteTarget = { type, id, name, actionCallback };
        document.getElementById('adr-type').textContent = type;
        document.getElementById('adr-name').textContent = name;
        document.getElementById('adr-reason').value = '';
        document.getElementById('admin-delete-reason-modal').classList.remove('hidden');
        this.updateBodyScrollLock();
    },

    async submitAdminDelete() {
        const reason = document.getElementById('adr-reason').value.trim();
        if (!reason) return this.showToast('Please provide a reason for deletion.');

        const { type, id, actionCallback } = this._adminDeleteTarget;
        const btn = document.getElementById('adr-confirm-btn');
        this.setBtnLoading(btn, true);

        try {
            const res = await fetch(`api.php?action=${actionCallback}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, order_id: id, reason: reason })
            });
            const data = await res.json();
            
            if (data.ok) {
                this.closeModal('admin-delete-reason-modal');
                this.showToast(`${type} deleted successfully.`);
                await this.reloadAdminData();
                if (type === 'Bayanihan Cart') this.go('admin'); 
            } else {
                this.showToast(data.error || 'Failed to delete.');
            }
        } catch (e) {
            this.showToast('Connection error.');
        } finally {
            this.setBtnLoading(btn, false);
        }
    },

        // 🟢 NEW: Global Loader Helper
    showLoader(text = 'Inihahanda ang PiliKart...') {
        const loader = document.getElementById('global-loader');
        if (!loader) return;
        document.getElementById('loader-text').textContent = text;
        loader.classList.remove('hidden');
        void loader.offsetWidth; // Trigger reflow
        loader.classList.add('show');
        this.updateBodyScrollLock(); // Lock scroll
    },

    hideLoader() {
        const loader = document.getElementById('global-loader');
        if (!loader) return;
        loader.classList.remove('show');
        setTimeout(() => {
            loader.classList.add('hidden');
            this.updateBodyScrollLock();
        }, 400);
    },

    // 🟢 NEW: Button Loading State Helper
    setBtnLoading(btn, isLoading, loadingText = '') {
        if (!btn) return;
        if (isLoading) {
            btn.dataset.originalText = btn.innerHTML;
            btn.classList.add('btn-loading');
            if (loadingText) btn.innerHTML = loadingText;
            btn.disabled = true;
        } else {
            btn.classList.remove('btn-loading');
            if (btn.dataset.originalText) btn.innerHTML = btn.dataset.originalText;
            btn.disabled = false;
        }
    },
        handleNumInput(el) {
        if (el.value !== '' && parseFloat(el.value) < 0) {
            el.value = '';
        }
    },
    updateBudgetFromCart(val) {
        let num = parseFloat(val);
        if (isNaN(num) || num < 0) num = 0;
        this.budget = num > 0 ? num : null;
        
        // Sync the budget to the main menu inputs
        const topMax = document.getElementById('budget-input');
        const advMax = document.getElementById('filter-max-price');
        if (topMax) topMax.value = this.budget || '';
        if (advMax) advMax.value = this.budget || '';
        
        this.renderMenu();
        this.renderCart();
    },

        botBrain: [
        // ==================== GREETINGS ====================
        { keys: ['hi', 'hello', 'hey', 'yo', 'sup', "what's up", "whats up", 'uy', 'psst'], reply: "Uy, kumusta, suki! :) Ako si PiliBot. Ano ang maitutulong ko sa iyo ngayon? Pwede kang magtanong tungkol sa delivery, GCash, orders, Bayanihan, o products!" },
        { keys: ['kumusta', 'kamusta', 'musta'], reply: "Mabuti naman ako, suki! <3 Salamat sa pagtanong. Ikaw, kumusta? Ano'ng hanap mo ngayon sa PiliKart?" },
        { keys: ['magandang umaga', 'good morning'], reply: "Magandang umaga, suki! :) Simulan natin ang araw nang may ngiti. Kape o almusal ba ang hanap mo?" },
        { keys: ['magandang tanghali', 'good noon'], reply: "Magandang tanghali, suki! :D Tanghalian na, kain muna tayo! May mga pagkain ba akong maitutulong sa iyo?" },
        { keys: ['magandang hapon', 'good afternoon'], reply: "Magandang hapon, suki! :) Mainit-init pa ba ang araw diyan? Tara, mag-ikot tayo sa menu!" },
        { keys: ['magandang gabi', 'good evening'], reply: "Magandang gabi, suki! <3 Pahinga ka na ba? Pwede mo namang i-browse ang mga paninda namin bago matulog." },
        { keys: ['mabuhay'], reply: "Mabuhay ka rin, suki! ^_^ Ipinagmamalaki namin ang gawang Pinoy. Tara, pumili ka na!" },
        { keys: ['bye', 'goodbye', 'paalam', 'ingat'], reply: "Paalam, suki! :) Ingat ka palagi diyan. Balik ka agad ha, andito lang kami palagi para sa iyo. <3" },

        // ==================== CORE FEATURES ====================
        { keys: ['delivery', 'fee', 'shipping', 'ship', 'padala'], reply: "Ang delivery fee namin ay depende sa iyong Barangay. Pumunta ka lang sa checkout para makita ang eksaktong fee - walang hidden charges, promise!<br><button class='pb-action-btn' onclick=\"app.go('cart')\">Go to Checkout</button>" },
        { keys: ['gcash', 'bayad', 'payment', 'resibo'], reply: "Oo naman po, suki! <3 Tumatanggap kami ng GCash at COD. Kapag GCash, i-upload mo lang ang screenshot ng resibo sa checkout para ma-verify agad.<br><button class='pb-action-btn' onclick=\"app.go('cart')\">Go to Checkout</button>" },
        { keys: ['track', 'tracking', 'saan na', 'status', 'nasaan'], reply: "Gusto mo bang malaman kung nasaan na ang order mo? Pumunta lang sa Mga Order Ko para masubaybayan ang biyahe nito.<br><button class='pb-action-btn' onclick=\"app.go('orders')\">View My Orders</button>" },
        { keys: ['budget', 'mahal', 'mura', 'tipid'], reply: "Gamitin ang <b>Budget Mode</b> sa itaas ng menu - ilagay mo lang ang max price at awtomatikong itatago namin ang mga mamahaling item. Tipid na, saya pa!<br><button class='pb-action-btn' onclick=\"app.scrollToMenu()\">Go to Menu</button>" },
        { keys: ['refund', 'sira', 'mali', 'reklamo', 'malasakit'], reply: "Naku, pasensya na suki! :( Kung may sira o maling item, may <b>Malasakit Policy</b> kami. Pwede mag-refund within 24 hours (pagkain) o 7 days (gamit) sa My Orders.<br><button class='pb-action-btn' onclick=\"app.go('orders')\">Go to My Orders</button>" },
        { keys: ['protection', 'insurance', 'nawala'], reply: "Ang <b>Delivery Protection</b> ay parang insurance ng order mo. ₱50 kada ₱200 ng inorder mo. Kapag nawala o nasira ng rider, sagot namin 'yan! Pwede mo itong i-tick sa checkout." },
        { keys: ['theme', 'sunset', 'dark mode', 'night mode'], reply: "Gusto mo ba ng Sunset Mode? Puntahan mo lang ang hamburger menu sa taas tapos pindutin ang Forest (Dark). Mas madali sa mata kapag gabi!<br><button class='pb-action-btn' onclick=\"app.toggleTheme()\">Toggle Theme</button>" },
        { keys: ['recipe', 'luto', 'resipi', 'adobong banga', 'sinigang', 'bibingka'], reply: "May Recipe Box kami! Mga lutong bahay na pwede mong i-try sa sarili mong kusina o i-order na lang dito.<br><button class='pb-action-btn' onclick=\"app.go('recipes')\">Open Recipe Box</button>" },
        { keys: ['faq', 'tanong', 'help', 'tulong', 'support'], reply: "Nandito ako para tumulong! Kung may iba ka pang katanungan, puntahan mo ang aming FAQ page o i-message ang support team.<br><button class='pb-action-btn' onclick=\"app.go('faq')\">View FAQ</button>" },
        { keys: ['contact', 'email', 'message'], reply: "May espesyal na request o concern? I-message mo lang kami sa Contact page namin, suki!<br><button class='pb-action-btn' onclick=\"app.go('contact')\">Contact Us</button>" },
        { keys: ['account', 'register', 'signup', 'login'], reply: "Pwede kang gumawa ng account o mag-log in para mas madaling ma-access ang iyong orders at updates.<br><button class='pb-action-btn' onclick=\"app.openAuthModal('signin')\">Sign In / Sign Up</button>" },
        { keys: ['bayanihan', 'group', 'split', 'hati'], reply: "Ang <b>Bayanihan Cart</b> ay para sa sabay-sabay na order at paghati ng bayad kasama ang tropa! Gumawa ng group cart, i-share ang code, at hatiin ang bill (Equal, By Items, Fixed, o One Payer).<br><button class='pb-action-btn' onclick=\"app.go('bayanihan')\">Go to Bayanihan</button>" },

        // ==================== DEPARTMENTS ====================
        { keys: ['paso', 'banga', 'food'], reply: "Welcome sa <b>BANGA</b> Food Essentials! Dito ang mga paborito mong lutong-bahay at grocery essentials.<br><button class='pb-action-btn' onclick=\"app.filterFromFooter('paso')\">View BANGA Menu</button>" },
        { keys: ['nipa', 'home', 'bahay'], reply: "Welcome sa <b>NIPA</b> Home Essentials! Dito ang mga gamit para sa bahay.<br><button class='pb-action-btn' onclick=\"app.filterFromFooter('nipa')\">View NIPA Menu</button>" },
        { keys: ['habi', 'fashion', 'beauty', 'damit'], reply: "Welcome sa <b>HABI</b> Fashion & Cosmetics! Dito ang mga fashion at beauty finds.<br><button class='pb-action-btn' onclick=\"app.filterFromFooter('habi')\">View HABI Menu</button>" },
        { keys: ['apollo', 'tech', 'gadget'], reply: "Welcome sa <b>APOLLO</b> Technologies! Dito ang mga gadgets at tech finds.<br><button class='pb-action-btn' onclick=\"app.filterFromFooter('apollo')\">View APOLLO Menu</button>" },

        // ==================== PASO (FOOD) ====================
        { keys: ['adobo'], reply: "Adobo is life! :D Walang tatalo sa adobong manok na may toyo, suka, at bawang. Nasa BANGA section namin 'yan, suki!<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Chicken Adobo with Rice')\">View Adobo</button>" },
        { keys: ['sisig'], reply: "Sizzling sarap! :D Paborito mo ba ang maanghang at malutong na sisig? Nasa BANGA menu namin yan!<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Pork Sisig with Rice')\">View Sisig</button>" },
        { keys: ['inasal'], reply: "Smoky, juicy, at rich in flavor! Paborito mo ba ang inasal?<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Chicken Inasal with Rice')\">View Inasal</button>" },
        { keys: ['pancit', 'bihon'], reply: "Pampaswerte at pampasaya sa handaan! Tara, pancit tayo.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Pancit Bihon Guisado')\">View Pancit</button>" },
        { keys: ['beefsilog', 'tapa', 'silog'], reply: "Simula ng araw na puno ng pag-asa! Paborito mong almusal?<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Beefsilog')\">View Beefsilog</button>" },
        { keys: ['lumpia', 'shanghai'], reply: "Crispy at masarap na pang-meryenda! Paboritong pulutan at baon.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Lumpiang Shanghai')\">View Lumpia</button>" },
        { keys: ['leche flan', 'flan'], reply: "Tamis na laging hinahanap! Ang creamy at caramel goodness.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Leche Flan Cup')\">View Leche Flan</button>" },
        { keys: ['buko pandan', 'buko'], reply: "Preskong kaginhawahan sa bawat subo! Perfect pang-dessert.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Buko Pandan Cup')\">View Buko Pandan</button>" },
        { keys: ['turon'], reply: "Sarap ng kabataan sa bawat kagat! Sweet saba at caramelized sugar.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Turon')\">View Turon</button>" },
        { keys: ['fried chicken'], reply: "Lutong bahay na hatid ay ginhawa! Crispy fried chicken with egg.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Classic Fried Chicken')\">View Fried Chicken</button>" },
        { keys: ['cheese sticks'], reply: "Kada kagat, puno ng sarap! Gooey melted cheese inside crispy wrappers.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Cheese Sticks')\">View Cheese Sticks</button>" },
        { keys: ['fries', 'french fries'], reply: "Crispy na pang-meryenda! Golden fried potatoes with salt.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('French Fries')\">View Fries</button>" },
        { keys: ['brownies'], reply: "Tsokolateng tamis ng pagmamahal! Fudgy and rich chocolate brownies.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Fudgy Brownies')\">View Brownies</button>" },
        { keys: ['milk tea', 'wintermelon'], reply: "Sarap ng Wintermelon Milk Tea pag mainit ang panahon! 🧋 Nasa BANGA menu namin yan.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Wintermelon Milk Tea')\">View Milk Tea</button>" },
        { keys: ['pastil'], reply: "Pantawid gutom ng kolehiyo! Shredded chicken sa banana leaf. Sulit na sulit!<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Chicken Pastil')\">View Pastil</button>" },
        { keys: ['arroz caldo', 'lugaw'], reply: "Init ng sabaw, hagod ng pagmamahal! Perfect comfort food kapag maulan.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Arroz Caldo')\">View Arroz Caldo</button>" },

        // ==================== NIPA (HOME) ====================
        { keys: ['tabo'], reply: "Ah, ang ultimate Pinoy bathroom essential! 🚿 Sturdy at reliable para sa tabo-bucket bath!<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Classic Plastic Tabo')\">View Tabo</button>" },
        { keys: ['banig'], reply: "Himbing ng tulog sa banig ng probinsya! Traditional hand-woven sleeping mat.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Banig')\">View Banig</button>" },
        { keys: ['abaca'], reply: "Malinis ang bahay, alaga pa ang kalikasan! Eco-friendly abaca cleaning pad.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Abaca Scrubbing Pad')\">View Abaca Pad</button>" },
        { keys: ['bamboo utensil', 'kubyertos'], reply: "Kubyertos na gawa ng kalikasan! Sustainable bamboo fork, spoon, at knife.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Bamboo Utensil Set')\">View Utensils</button>" },
        { keys: ['coconut bowl'], reply: "Gawang likas, espesyal ang dating! Bowls polished from real coconut shells.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Coconut Shell Bowl')\">View Coconut Bowl</button>" },
        { keys: ['capiz lamp', 'lamp', 'ilaw'], reply: "Ilaw na nagbibigay ng init sa tahanan! Elegant lamp made with Capiz shells.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Capiz Shell Lamp')\">View Capiz Lamp</button>" },
        { keys: ['tray'], reply: "Paghahain nang may karangalan! Sturdy serving tray carved from Acacia wood.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Wooden Serving Tray')\">View Tray</button>" },
        { keys: ['sampaguita', 'air freshener'], reply: "Halimuyak ng tahanang Pinoy! Room spray with the sweet scent of Sampaguita.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Sampaguita Air Freshener')\">View Spray</button>" },
        { keys: ['palayok'], reply: "Mabagal lutuin, puno ng lasa at alaala! Traditional clay pot for your stews.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Palayok')\">View Palayok</button>" },
        { keys: ['broom', 'walis', 'dustpan'], reply: "Katuwang sa pagpapanatili ng linis! Practical cleaning set.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Broom and Dustpan Set')\">View Broom Set</button>" },
        { keys: ['pitcher', 'water pitcher'], reply: "Sariwang tubig para sa buong angkan! Durable pitcher with easy-pour spout.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Plastic Water Pitcher')\">View Pitcher</button>" },
        { keys: ['hangers', 'sampayan'], reply: "Ayos at maaliwalas na pamamahay! Set of sturdy plastic hangers.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Plastic Clothes Hangers')\">View Hangers</button>" },
        { keys: ['towel', 'tuwalya'], reply: "Lambot na yakap pagkatapos maligo! Ultra-soft and absorbent cotton towel.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Bath Towel')\">View Towel</button>" },
        { keys: ['waste bin', 'basurahan'], reply: "Maliit na basurahan, malaking tulong! Compact bin for personal spaces.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Small Waste Bin')\">View Waste Bin</button>" },
        { keys: ['laundry basket'], reply: "Organisado at maayos na labahan! Durable and ventilated laundry basket.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Plastic Laundry Basket')\">View Basket</button>" },
        { keys: ['bayong'], reply: "Mabisang katuwang sa pamimili! Traditional handwoven market bag.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Woven Bayong')\">View Bayong</button>" },

        // ==================== HABI (FASHION & BEAUTY) ====================
        { keys: ['scarf', 'habi scarf'], reply: "Ang Indigenous Woven Scarf ay perfect para sa weather at proud na pag-suot ng kulturang Pinoy!<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Indigenous Woven Scarf')\">View Scarf</button>" },
        { keys: ['barot saya', 'filipiniana'], reply: "Proud na suot, yaman ng kultura! The prestigious Filipiniana dress.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Barot Saya')\">View Barot Saya</button>" },
        { keys: ['inabel', 'tote bag'], reply: "Gawang Ilocos, yaman na dala-dala! Beautifully crafted tote bag.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Inabel Woven Tote Bag')\">View Tote</button>" },
        { keys: ['pina', 'pina scarf'], reply: "Pinong habi, marangal na ganda! Delicately woven from pineapple leaves.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Pina Fabric Scarf')\">View Pina Scarf</button>" },
        { keys: ['tint', 'cheek tint', 'calamansi'], reply: "Natural na ganda mula sa kalikasan! Calamansi extract for a healthy flush.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Calamansi Lip & Cheek Tint')\">View Tint</button>" },
        { keys: ['coconut oil', 'vco'], reply: "Likas na lunas para sa kutis at buhok! Cold-pressed pure VCO.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Virgin Coconut Oil')\">View VCO</button>" },
        { keys: ['perfume', 'pabango'], reply: "Amoy ng bulaklak, alaala ng bayan! Gentle floral scent.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Sampaguita Perfume')\">View Perfume</button>" },
        { keys: ['slippers', 'tsinelas'], reply: "Sarap ng pambahay sa bawat hakbang! Slippers made from banig material.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Banig Slide Slippers')\">View Slippers</button>" },
        { keys: ['coin purse', 'purse'], reply: "Gawang kamay, pusong Pilipino! Handwoven coin purse from T'nalak fabric.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Tnalak Coin Purse')\">View Purse</button>" },
        { keys: ['barong', 'polo'], reply: "Modernong suot, may pusong Pinoy! Lightweight and subtly embroidered.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Barong-inspired Polo')\">View Barong</button>" },
        { keys: ['sinamay hat', 'hat', 'sumbrero'], reply: "Proteksyon sa araw, may klasikong ganda! Wide-brimmed sinamay hat.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Sinamay Hat')\">View Hat</button>" },
        { keys: ['lipstick'], reply: "Gusto mo bang mag-glow?  Tingnan ang aming Velvet Matte Lipstick para sa confidence all day.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Velvet Matte Lipstick')\">View Lipstick</button>" },
        { keys: ['foundation'], reply: "Kutis na puno ng ningning! Lightweight liquid foundation for a radiant finish.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Dewy Liquid Foundation')\">View Foundation</button>" },
        { keys: ['blush'], reply: "Ningning ng pisngi, hatid ay ngiti! Silky and blendable cheek color.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Glow Blush')\">View Blush</button>" },
        { keys: ['mascara'], reply: "Titig na hindi kakalas! Smudge-proof and waterproof mascara.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Waterproof Mascara')\">View Mascara</button>" },
        { keys: ['concealer'], reply: "Tagong kapaguran, liwanag ang bida! Creamy and full-coverage concealer.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Soft Focus Concealer')\">View Concealer</button>" },

        // ==================== APOLLO (TECH) ====================
        { keys: ['karaoke', 'videoke'], reply: "Kantahan na, buong pamilya ay masaya! Bring the videoke experience anywhere.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Mini Karaoke Machine')\">View Karaoke</button>" },
        { keys: ['speaker', 'bluetooth speaker'], reply: "Musika at saya, kahit saan dalhin! Powerful speaker housed in real bamboo.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Bamboo Bluetooth Speaker')\">View Speaker</button>" },
        { keys: ['phone case'], reply: "Gadget na may pusong Pinoy! Protect your phone with authentic Inabel fabric.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Handwoven Inabel Phone Case')\">View Phone Case</button>" },
        { keys: ['powerbank', 'power bank'], reply: "Laging handa, laging may karga! Fast-charging power bank with a wooden casing.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Wooden Powerbank')\">View Powerbank</button>" },
        { keys: ['laptop sleeve'], reply: "Likas na proteksyon sa iyong gadget! Padded sleeve handwoven from abaca fiber.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Abaca Laptop Sleeve')\">View Laptop Sleeve</button>" },
        { keys: ['phone stand'], reply: "Tibay ng kahoy, suporta sa'yo! Sturdy desk companion carved from Acacia wood.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Acacia Wood Phone Stand')\">View Phone Stand</button>" },
        { keys: ['cable organizer'], reply: "Ayos ang kable, ayos ang espasyo! Beautifully hand-woven rattan basket.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Rattan Cable Organizer')\">View Organizer</button>" },
        { keys: ['mousepad', 'mouse pad'], reply: "Swabeng galaw, Pinoy na karangyaan! Unique mousepad layered with Capiz shells.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Capiz Shell Mousepad')\">View Mousepad</button>" },
        { keys: ['tripod'], reply: "Kuha ng alaala, tibay ng kawayan! Lightweight, adjustable tripod made from bamboo.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Bamboo Tripod')\">View Tripod</button>" },
        { keys: ['tablet case'], reply: "Proteksyon na gawa sa kulturang Pinoy! Padded case made with native woven textiles.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Woven Tablet Case')\">View Tablet Case</button>" },
        { keys: ['charging cord', 'type-c', 'charger'], reply: "Mabilis na karga, tuloy ang saya! Durable, high-speed braided Type-C cable.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Charging Cord')\">View Cable</button>" },
        { keys: ['flash drive', 'usb'], reply: "Bitbit ang alaala at dokumento! Compact and highly reliable storage drive.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('USB Flash Drive')\">View Flash Drive</button>" },
        { keys: ['mouse', 'wireless mouse'], reply: "Tahimik na galaw, tumpak na aksyon! Ergonomic wireless mouse with silent clicks.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Wireless Mouse')\">View Mouse</button>" },
        { keys: ['keyboard', 'mechanical keyboard'], reply: "Sarap mag-type, sarap magtrabaho! Responsive mechanical keyboard with tactile switches.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Mechanical Keyboard')\">View Keyboard</button>" },
        { keys: ['microphone', 'mic'], reply: "Boses ay malinaw, mensahe ay malinaw! High-quality clip-on wireless microphone.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Wireless Microphone')\">View Mic</button>" },
        { keys: ['solar lamp', 'solar light'], reply: "Liwanag sa gitna ng dilim! Reliable solar-powered lamp for emergencies.<br><button class='pb-action-btn' onclick=\"app.openBotProduct('Solar-Powered Lamp')\">View Solar Lamp</button>" },

        // ==================== LOCATIONS ====================
        { keys: ['binan', 'biñan'], reply: "Sa <b>Biñan</b>, ang delivery fee ay ₱2 hanggang ₱144 depende sa barangay.<br><button class='pb-action-btn' onclick=\"app.go('cart')\">Checkout</button>" },
        { keys: ['cabuyao'], reply: "Sa <b>Cabuyao</b>, ang delivery fee ay ₱8 hanggang ₱90 depende sa barangay.<br><button class='pb-action-btn' onclick=\"app.go('cart')\">Checkout</button>" },
        { keys: ['calamba'], reply: "Sa <b>Calamba</b>, ang delivery fee ay ₱2 hanggang ₱120. Dito lang din pwedeng i-deliver ang mga PASO (pagkain)!<br><button class='pb-action-btn' onclick=\"app.go('cart')\">Checkout</button>" },
        { keys: ['san pablo'], reply: "Sa <b>San Pablo</b>, ang delivery fee ay ₱6 hanggang ₱170 depende sa barangay.<br><button class='pb-action-btn' onclick=\"app.go('cart')\">Checkout</button>" },
        { keys: ['san pedro'], reply: "Sa <b>San Pedro</b>, ang delivery fee ay ₱6 hanggang ₱86 depende sa barangay.<br><button class='pb-action-btn' onclick=\"app.go('cart')\">Checkout</button>" },
        { keys: ['santa rosa', 'sta rosa'], reply: "Sa <b>Santa Rosa</b>, ang delivery fee ay ₱10 hanggang ₱70 depende sa barangay.<br><button class='pb-action-btn' onclick=\"app.go('cart')\">Checkout</button>" },

        // ==================== EASTER EGGS ====================
        { keys: ['rizal', 'pepe'], reply: "Si Dr. Jose Rizal? Ang ultimate 'Suki's Choice' ng bayan! :) Kung buhay lang siya ngayon, nagta-TikTok na siguro siya para i-promote ang PiliKart." },
        { keys: ['mahal kita', 'i love you'], reply: "Awww! <3 Kinikilig naman si PiliBot! Mahal ko rin kayong lahat ng mga suki ko. Mwah! ^_^" },
        { keys: ['human', 'tao ka ba', 'robot', 'ai'], reply: "100% Robot po ako, suki! :) Pero ang puso ko, pusong-Pinoy na marunong mag-malasakit. <3" },
        { keys: ['pumili ka'], reply: "Yan ang aming motto! ^_^ 'Pumili ka + Cart.' Huwag kang mahiyang mag-add sa cart, walang bayad ang mag-window shopping!" },
        { keys: ['tanginamo', 'gago', 'bobo', 'pangit', 'bad words'], reply: "Naku po, suki! :( Baka magalit si Lola. Kalmado lang tayo, ha? Andito ako para tumulong, hindi para makipag-away. :)" },
        { keys: ['god bless', 'dasal'], reply: "God bless din sa iyo, suki! :) Ingat ka palagi at salamat sa pagtangkilik sa PiliKart. <3" },
        { keys: ['secret', 'password', 'admin', 'hack'], reply: "Sshhh! ;) Wala akong alam diyan, suki. Wala kang narinig sa akin. Basta mag-shopping ka na lang!" }
    ],

    _refundOrderId: null,
    _refundProof: '',
    openRefundModal(orderId) {
        this._refundOrderId = orderId;
        this._refundProof = '';
        document.getElementById('refund-reason').value = '';
        const prev = document.getElementById('refund-preview');
        prev.src = ''; prev.style.display = 'none';
        document.getElementById('refund-drop').classList.remove('has-file');
        document.getElementById('refund-drop-title').textContent = 'I-upload ang litrato';
        document.getElementById('refund-drop-sub').textContent = 'I-click para pumili ng file';
        document.getElementById('refund-modal').classList.remove('hidden');
        this.updateBodyScrollLock();
    },

    handleRefundProof(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { this.showToast('Max 10MB lang.'); e.target.value = ''; return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const c = document.createElement('canvas');
                const scale = Math.min(1, 800 / Math.max(img.width, img.height));
                c.width = img.width * scale; c.height = img.height * scale;
                c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
                this._refundProof = c.toDataURL('image/jpeg', 0.7);
                
                const prev = document.getElementById('refund-preview');
                prev.src = this._refundProof; prev.style.display = 'block';
                document.getElementById('refund-drop').classList.add('has-file');
                document.getElementById('refund-drop-title').textContent = 'Litrato attached ✓';
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    },

        async submitRefund() {
        const reason = document.getElementById('refund-reason').value.trim();
        if (!reason) return this.showToast('Ilagay ang dahilan ng refund.');
        if (!this._refundProof) return this.showToast('I-upload ang litrato bilang patunay.');

        this.showConfirm('Request Refund', 'Sigurado ka bang i-submit ang refund request na ito?', async () => {
            const btn = document.querySelector('#custom-confirm-modal #cc-confirm-btn');
            this.setBtnLoading(btn, true);
            try {
                const res = await fetch('api.php?action=request-refund', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order_id: this._refundOrderId, reason: reason, proof: this._refundProof })
                });
                
                const text = await res.text();
                let data;
                try { data = JSON.parse(text); } catch (err) {
                    console.error("Server returned non-JSON response:", text);
                    return this.showToast('Server Error: Check console for details.');
                }

                if (data.ok) {
                    this.closeModal('refund-modal');
                    this.showToast('Refund request submitted! Hintayin ang approval.');
                    await this.refreshData();
                    this.renderOrders();
                } else {
                    this.showToast(data.error || 'Failed to submit refund.');
                }
            } catch (e) { 
                this.showToast('Connection error. Please try again.'); 
            } finally {
                this.setBtnLoading(btn, false);
            }
        }, 'Submit');
    },

    deleteUser(userId, userName) {
        this.showConfirm('Delete Account', `Sigurado ka bang i-delete si <b>${this.esc(userName)}</b>?<br><br>Hindi na siya makaka-login at mawawala siya sa listahan.`, async () => {
            try {
                const res = await fetch('api.php?action=admin-archive-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId })
                });
                const data = await res.json();
                if (data.ok) {
                    this.showToast('User account deleted.');
                    this.renderAdminUsers();
                } else {
                    this.showToast(data.error || 'Failed to delete user.');
                }
            } catch(e) { this.showToast('Connection error.'); }
        }, 'Delete');
    },

    async renderAdminUsers() {
        const grid = document.getElementById('admin-users-grid');
        if (!grid) return;
        grid.innerHTML = '<p style="text-align:center; color:var(--muted);">Loading users...</p>';

        try {
            const res = await fetch('api.php?action=admin-get-users');
            const users = await res.json();
            
            if (!Array.isArray(users)) {
                grid.innerHTML = `<p style="text-align:center; color:#e5604d; font-weight:800;">${users.error || 'Failed to load users.'}</p>`;
                return;
            }
            const filteredUsers = users.filter(u => {
                const query = this.adminUserFilter.search;
                const matchSearch = (u.name || '').toLowerCase().includes(query) || 
                                    (u.email || '').toLowerCase().includes(query) || 
                                    (u.phone && u.phone.includes(query));
                const matchRole = this.adminUserFilter.role === 'all' || u.role === this.adminUserFilter.role;
                return matchSearch && matchRole;
            });

            if (filteredUsers.length === 0) {
                grid.innerHTML = '<p style="text-align:center; color:var(--muted); grid-column: 1/-1; padding: 20px;">No users found matching your criteria.</p>';
                return;
            }

            grid.innerHTML = filteredUsers.map(u => `
                <div class="admin-inv-card" style="flex-direction: column; align-items: flex-start; gap: 8px;">
                    <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                        <h4 style="font-size:16px;">${this.esc(u.name)}</h4>
                        <span class="meta-chip ${u.role === 'admin' ? 'stock-low' : 'stock-high'}" style="font-size: 11px; font-weight:800; text-transform:uppercase;">${u.role}</span>
                    </div>
                    <div style="font-size: 12px; color: var(--muted); font-weight: 600; line-height: 1.6; word-break: break-word;">
                        <div>📧 ${this.esc(u.email)}</div>
                        <div>📱 ${this.esc(u.phone || 'No phone')}</div>
                        <div>📍 ${this.esc(this.formatAddress(u.address) || 'No address')}</div>
                    </div>
                    <div style="margin-top: 8px; display:flex; justify-content:space-between; align-items:center; width:100%; border-top: 1px dashed var(--line); padding-top: 12px;">
                        <span style="font-size: 11px; font-weight:800; color: var(--muted);">${u.order_count} Order(s)</span>
                        ${u.id === this.user.id 
                            ? '<span style="font-size: 11px; color: var(--muted); font-style: italic;">Current Session</span>' 
                            : `<div style="display:flex; gap:6px;">
                                <button class="btn btn-ghost" style="padding: 4px 12px; font-size: 11px; border-radius: 6px;" onclick='app.openRoleChangeModal(${u.id}, "${u.role}", "${this.esc(u.name)}")'>Change Role</button>
                                <button class="btn btn-danger" style="padding: 4px 12px; font-size: 11px; border-radius: 6px;" onclick='app.deleteUser(${u.id}, "${this.esc(u.name)}")'>Delete</button>
                               </div>`
                        }
                    </div>
                </div>
            `).join('');
        } catch (e) { 
            grid.innerHTML = '<p>Error loading users.</p>'; 
            console.error(e); 
        }
    },

    filterAdminUsers() {
        this.adminUserFilter.search = document.getElementById('admin-user-search').value.toLowerCase().trim();
        this.adminUserFilter.role = document.getElementById('admin-user-role-filter').value;
        this.renderAdminUsers();
    },

    openRoleChangeModal(userId, currentRole, userName) {
        this._rcTargetId = userId;
        document.getElementById('rc-user-name').textContent = userName;
        document.getElementById('rc-new-role').value = currentRole;
        
        // Clear passwords
        document.getElementById('rc-admin-pass').value = '';
        document.getElementById('rc-confirm-pass').value = '';
        
        document.getElementById('role-change-modal').classList.remove('hidden');
        document.getElementById('rc-admin-pass').focus();
        this.updateBodyScrollLock();
    },

    async submitRoleChange() {
        if (!this._rcTargetId) return;

        const newRole = document.getElementById('rc-new-role').value;
        const adminPass = document.getElementById('rc-admin-pass').value;
        const confirmPass = document.getElementById('rc-confirm-pass').value;

        if (!adminPass) return this.showToast('Enter your password to verify.');
        if (adminPass !== confirmPass) return this.showToast('Passwords do not match.');

        const targetName = document.getElementById('rc-user-name').textContent;

        this.showConfirm('Change Role', `Baguhin ang role ni <b>${this.esc(targetName)}</b> to <b>${newRole.toUpperCase()}</b>?`, async () => {
            const btn = document.querySelector('#role-change-modal .btn-brand');
            const ogText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = 'Verifying...';

            try {
                const res = await fetch('api.php?action=admin-update-user-role', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: this._rcTargetId,
                        new_role: newRole,
                        admin_password: adminPass,
                        confirm_password: confirmPass
                    })
                });
                const data = await res.json();

                if (data.ok) {
                    this.closeModal('role-change-modal');
                    this.showToast('User role updated successfully!');
                    await this.renderAdminUsers();
                } else {
                    this.showToast(data.error || 'Failed to update role.');
                }
            } catch (e) {
                this.showToast('Connection error. Please try again.');
            } finally {
                btn.disabled = false;
                btn.innerHTML = ogText;
            }
        }, 'Change Role');
    },

    _analyticsLimit: 5,
    _analyticsSort: 'total_sold',

    setAnalyticsLimit(limit, btn) {
        this._analyticsLimit = limit;
        document.querySelectorAll('#admin-analytics .admin-tab-btn').forEach(b => { b.className = 'btn btn-ghost admin-tab-btn'; });
        btn.className = 'btn btn-brand admin-tab-btn';
        this.renderAdminAnalytics();
    },

        setAnalyticsSort(sort, btn) {
        if (this._analyticsSort === sort) return; // Prevent duplicate clicks
        
        this._analyticsSort = sort;
        
        // Update button styles
        document.querySelectorAll('#admin-analytics .sort-btn').forEach(b => { 
            b.className = 'btn btn-ghost sort-btn'; 
            b.classList.remove('active');
        });
        btn.className = 'btn btn-brand sort-btn active';
        
        this.renderAdminAnalytics();
    },

    async renderAdminAnalytics() {
        const grid = document.getElementById('admin-analytics-grid');
        const deptGrid = document.getElementById('admin-analytics-depts');
        const cityGrid = document.getElementById('admin-analytics-cities');
        const brgyGrid = document.getElementById('admin-analytics-brgys');
        if (!grid) return;

        // 🟢 1. FADE OUT EXISTING CONTENT
        const hasExistingData = grid.querySelector('.analytics-row-item') !== null;
        if (hasExistingData) {
            grid.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            grid.style.opacity = '0';
            grid.style.transform = 'translateY(10px)';
            if (deptGrid) { deptGrid.style.transition = 'opacity 0.25s ease'; deptGrid.style.opacity = '0'; }
            await new Promise(r => setTimeout(r, 250)); // Wait for fade out
        } else {
            grid.innerHTML = '<p style="text-align:center; color:var(--muted);">Loading...</p>';
        }

        try {
            const res = await fetch(`api.php?action=admin-get-analytics&limit=${this._analyticsLimit}&sort=${this._analyticsSort}`);
            const data = await res.json();

            if (data.length === 0) {
                grid.innerHTML = '<p style="text-align:center; color:var(--muted);">No sales data yet.</p>';
            } else {
                const maxVal = Math.max(...data.map(d => this._analyticsSort === 'total_revenue' ? d.total_revenue : d.total_sold));
                
                // 🟢 2. RENDER ROWS WITH INITIAL HIDDEN STATE
                grid.innerHTML = data.map((item, index) => {
                    const currentVal = this._analyticsSort === 'total_revenue' ? item.total_revenue : item.total_sold;
                    const percent = (maxVal === 0) ? 0 : (currentVal / maxVal) * 100;
                    return `
                    <div class="analytics-row-item" style="display:flex; align-items:center; gap: 16px; background: var(--bg); padding: 16px; border-radius: 16px; border: 1px solid var(--line); position:relative; overflow:hidden; opacity:0; transform:translateY(15px); transition: opacity 0.4s ease, transform 0.4s ease; transition-delay: ${index * 40}ms;">
                        <div class="analytics-bar" data-width="${percent}%" style="position:absolute; left:0; top:0; bottom:0; width:0%; background:color-mix(in srgb, var(--brand) 10%, transparent); z-index:0; transition: width 0.8s cubic-bezier(0.25, 1, 0.5, 1);"></div>
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--brand); color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'Baloo 2'; font-weight: 800; font-size: 18px; z-index:1;">#${index + 1}</div>
                        <div style="flex: 1; z-index:1;">
                            <h4 style="font-size: 16px; font-weight: 800; color: var(--ink);">${this.esc(item.name)}</h4>
                            <p style="font-size: 13px; color: var(--muted); font-weight: 700;">Total Sold: <span style="color: var(--brand);">${item.total_sold}</span> units</p>
                        </div>
                        <div style="text-align: right; font-family: 'Baloo 2'; font-size: 20px; color: var(--leaf); font-weight: 800; z-index:1;">${this.money(item.total_revenue)}</div>
                    </div>`;
                }).join('');
            }

            // 🟢 3. TRIGGER FADE IN & BAR GROWTH ANIMATIONS
            grid.style.opacity = '1';
            grid.style.transform = 'translateY(0)';
            
            requestAnimationFrame(() => {
                grid.querySelectorAll('.analytics-row-item').forEach(row => {
                    row.style.opacity = '1';
                    row.style.transform = 'translateY(0)';
                });
                grid.querySelectorAll('.analytics-bar').forEach(bar => {
                    bar.style.width = bar.getAttribute('data-width');
                });
            });

            // Department Pie Chart Logic
            const dRes = await fetch('api.php?action=admin-get-dept-analytics');
            const dData = await dRes.json();
            
            if (dData.length > 0) {
                const isRevenueSort = this._analyticsSort === 'total_revenue';
                const totalValue = dData.reduce((s, d) => s + (isRevenueSort ? parseInt(d.total_revenue) : parseInt(d.total_sold)), 0);
                const colors = { paso: '#f0905a', nipa: '#f2b354', habi: '#ff7b7b', apollo: '#5bc0de' };
                let gradientParts = []; let currentAngle = 0; let legendHtml = '';
                
                dData.forEach((d, index) => {
                    const currentValue = isRevenueSort ? parseInt(d.total_revenue) : parseInt(d.total_sold);
                    const percent = totalValue === 0 ? 0 : (currentValue / totalValue) * 100;
                    const deg = (percent / 100) * 360;
                    const endAngle = index === dData.length - 1 ? 360 : currentAngle + deg;
                    gradientParts.push(`${colors[d.name] || '#ccc'} ${currentAngle}deg ${endAngle}deg`);
                    currentAngle = endAngle;

                    const mainDisplay = isRevenueSort ? this.money(d.total_revenue) : `${d.total_sold} items`;
                    const subDisplay = isRevenueSort ? `${d.total_sold} items` : this.money(d.total_revenue);

                    const deptLabels = { paso: 'BANGA', nipa: 'NIPA', habi: 'HABI', apollo: 'APOLLO' };
                    legendHtml += `
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-size:13px; font-weight:700;">
                            <span style="width:12px; height:12px; border-radius:50%; background:${colors[d.name] || '#ccc'};"></span>
                            <span style="width:60px;">${deptLabels[d.name] || d.name.toUpperCase()}</span>
                            <span style="color:var(--brand);">${mainDisplay}</span>
                            <span style="color:var(--muted); font-size:11px;">(${subDisplay})</span>
                        </div>`;
                });

                deptGrid.innerHTML = `
                    <div style="width: 200px; height: 200px; border-radius: 50%; background: conic-gradient(${gradientParts.join(', ')}); box-shadow: 0 4px 12px rgba(0,0,0,0.2);"></div>
                    <div style="flex:1; min-width:250px; background:var(--bg); padding:20px; border-radius:16px; border:1px solid var(--line);">${legendHtml}</div>`;
                if (deptGrid) deptGrid.style.opacity = '1';
            } else { deptGrid.innerHTML = '<p>No department data.</p>'; if(deptGrid) deptGrid.style.opacity = '1'; }

            // Locations Logic
            const cityCount = {}; const brgyCount = {};
            this.orders.forEach(o => {
                try {
                    const addr = JSON.parse(o.address);
                    if (addr.city) cityCount[addr.city] = (cityCount[addr.city] || 0) + 1;
                    if (addr.brgy) brgyCount[addr.brgy] = (brgyCount[addr.brgy] || 0) + 1;
                } catch(e) {}
            });

            const renderLocations = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => `<div class="admin-item-row" style="padding:8px 0; border-bottom:1px dashed var(--line);"><span>${this.esc(name)}</span> <b style="color:var(--brand);">${count} orders</b></div>`).join('');

            cityGrid.innerHTML = `<div class="co-card"><h4 style="margin-bottom:12px; font-size:16px; color:var(--brand);">Top Cities</h4>${renderLocations(cityCount) || '<p>No data</p>'}</div>`;
            brgyGrid.innerHTML = `<div class="co-card"><h4 style="margin-bottom:12px; font-size:16px; color:var(--leaf);">Top Barangays</h4>${renderLocations(brgyCount) || '<p>No data</p>'}</div>`;

        } catch (e) { 
            grid.innerHTML = '<p>Error loading analytics.</p>'; 
            if (deptGrid) deptGrid.style.opacity = '1';
            console.error(e); 
        }
    },

    tapPiliBot() {
        this.toggleBot();
        const btn = document.getElementById('pilibot-btn');
        const heartContainer = document.getElementById('pilibot-heart-container');
        if (btn) {
            btn.classList.add('is-leaf');
            if (heartContainer) {
                const heart = document.createElement('div');
                heart.className = 'floating-heart';
                heart.innerHTML = '❤️';
                heartContainer.appendChild(heart);
                setTimeout(() => heart.remove(), 1000);
            }
            clearTimeout(this._piliLeafTimer);
            this._piliLeafTimer = setTimeout(() => { btn.classList.remove('is-leaf'); }, 1500);
        }
    },
    triggerHappyBot() {
        const btn = document.getElementById('pilibot-btn');
        if (!btn) return;
        const face = btn.querySelector('.bot-face');
        if (!face) return;

        // If already happy, just reset the timer
        if (btn.classList.contains('is-happy')) {
            clearTimeout(this._happyBotTimer);
        } else {
            // Save the original eyes (the rectangles)
            this._originalBotFace = face.innerHTML;
            
            // Replace with the ^^ happy eyes using SVG paths
            face.innerHTML = `
                <path d="M 34 56 L 39 48 L 44 56" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M 56 56 L 61 48 L 66 56" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
            `;
            btn.classList.add('is-happy');
        }

        // Revert back to normal face after 4 seconds
        clearTimeout(this._happyBotTimer);
        this._happyBotTimer = setTimeout(() => {
            face.innerHTML = this._originalBotFace;
            btn.classList.remove('is-happy');
        }, 4000);
    },

    /* ============================================================
   NOTIFICATIONS
   ============================================================ */
    updateNotifBadge() {
        const badge = document.getElementById('notif-badge');
        if (!badge) return;
        const unread = (this.notifications || []).filter(n => !Number(n.is_read)).length;
        if (unread > 0) {
            badge.textContent = unread > 99 ? '99+' : String(unread);
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    },

    toggleNotifications(force = false) {
        const d = document.getElementById('notifications-drawer');
        if (!d) return;
        if (force) { 
            d.classList.add('hidden'); 
            d.classList.remove('closing'); 
            this.updateBodyScrollLock();
            return; 
        }
        
        if (d.classList.contains('hidden')) {
            d.classList.remove('hidden', 'closing');
            this.renderNotifications();
            this.updateBodyScrollLock();
        } 
        else {
            d.classList.add('closing');
            setTimeout(() => { 
                d.classList.add('hidden'); 
                d.classList.remove('closing'); 
                this.updateBodyScrollLock(); 
            }, 400); // 🟢 Changed from 800 to 400
        }
    },

    renderNotifications() {
        const list = document.getElementById('notifications-list');
        const showAllContainer = document.getElementById('notif-show-all-container');
        const toggleBtn = document.getElementById('notif-toggle-btn');
        
        if (!list || !showAllContainer || !toggleBtn) return;

        if (!this.notifications || this.notifications.length === 0) {
            list.innerHTML = `
                <div class="empty-state" style="padding: 40px 16px;">
                    <svg viewBox="0 0 24 24" style="width:64px;height:64px;stroke:var(--muted);fill:none;stroke-width:1.5;margin-bottom:8px;">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <h3 style="font-size:18px;color:var(--ink);">Wala pang notifications</h3>
                    <p style="font-size:13px;color:var(--muted);">Mga update sa iyong account, order, at Bayanihan Cart ay dito lalabas.</p>
                </div>`;
            showAllContainer.classList.add('hidden');
            return;
        }

        const limit = 10;
        const displayNotifs = this.notifShowAll ? this.notifications : this.notifications.slice(0, limit);

        if (this.notifications.length > limit) {
            showAllContainer.classList.remove('hidden');
            toggleBtn.textContent = this.notifShowAll ? 'Show Less' : 'Show All Notifications';
        } else {
            showAllContainer.classList.add('hidden');
        }

        const iconFor = (msg) => {
            const m = (msg || '').toLowerCase();
            if (m.includes('refund')) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20V4h6a5 5 0 0 1 0 10H7" /><path d="M4 8h10" /><path d="M4 12h10" /></svg>';
            if (m.includes('order') || m.includes('deliver') || m.includes('shipping')) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>';
            if (m.includes('bayanihan') || m.includes('group') || m.includes('cart') || m.includes('join') || m.includes('invite')) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
            if (m.includes('profile') || m.includes('password') || m.includes('account')) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
            if (m.includes('product') || m.includes('item')) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>';
            return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
        };

        list.innerHTML = displayNotifs.map(n => {
            const unread = !Number(n.is_read);
            return `<div class="notif-item ${unread ? 'unread' : ''}" onclick="app.handleNotifClick(${n.id}, ${n.order_id || 0})">
                <div class="notif-icon">${iconFor(n.message)}</div>
                <div class="notif-content">
                    <p>${n.message}</p>
                    <div class="notif-time">${this.relativeTime(n.created_at)}</div>
                </div>
            </div>`;
        }).join('');
        
        this.markNotificationsRead();
    },

    toggleNotificationsView() {
        this.notifShowAll = !this.notifShowAll;
        this.renderNotifications();
    },

    relativeTime(str) {
        if (!str) return '';
        const d = new Date(String(str).replace(' ', 'T'));
        if (isNaN(d.getTime())) return '';
        const diff = Math.floor((Date.now() - d.getTime()) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
        if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
        return d.toLocaleDateString();
    },

    async markNotificationsRead() {
        if (!this.notifications || !this.notifications.some(n => !Number(n.is_read))) return;
        try {
            await fetch('api.php?action=mark-read');
            this.notifications.forEach(n => n.is_read = 1);
            this.updateNotifBadge();
        } catch (e) {}
    },

    handleNotifClick(id, orderId) {
        this.toggleNotifications(true);
        const n = this.notifications.find(x => Number(x.id) === Number(id));
        if (!n) return;
        const m = (n.message || '').toLowerCase();
        if (m.includes('refund') || m.includes('order') || m.includes('deliver')) this.go('orders');
        else if (m.includes('bayanihan') || m.includes('group') || m.includes('cart') || m.includes('invite')) this.go('bayanihan');
        else if (m.includes('profile') || m.includes('password') || m.includes('account')) this.go('account');
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
    cart: [],
    budget: null,
    products: [],
    orders: [],
    notifications: [],
    fee: 0,
    feeSet: false,
    isSignUp: false,
    authBusy: false,
    gcashBase64: '',
    selectedCategory: 'all',
    selectedTags: [],
    availableTags: [],
    hoverTimeout: null,
    adminUserFilter: { search: '', role: 'all' },
    adminOrderFilter: { search: '', status: 'all', dept: 'all', type: 'all' },
    adminInventoryFilter: { search: '', category: 'all', stockStatus: 'all', sort: 'default' },
    editingProductId: null,
    protectionEnabled: false,
    bayanihan: { list: [], invites: [], current: null, activeGroupId: null },
    notifShowAll: false,

    deptIcons: {
        paso: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8z"/><path d="M2 10h20"/><path d="M8 6c0-2 1-3 2-3s2 1 2 3"/><path d="M14 6c0-2 1-3 2-3s2 1 2 3"/></svg>',
        nipa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        habi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H5v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10h1.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>',
        apollo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>'
    },

    carouselIndex: 0,
    carouselTimer: null,

    async init() {
        const mainContent = document.getElementById('main-content');
        mainContent.classList.remove('opacity-0');
        mainContent.classList.add('opacity-100');
        try {
            const res = await fetch('api.php?action=load');
            const data = await res.json();
            this.user = data.user;
            this.products = data.products || [];
            this.orders = data.orders || [];
            this.notifications = data.notifications || [];
            this.fee = data.fee || 0;
            this.deliveryFeesRaw = data.deliveryFees || []; 

            const cartKey = this.user ? `pk_cart_${this.user.id}` : 'pk_cart_guest';
            try {
                const savedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
                this.cart = savedCart.map(item => ({ 
                    ...item, 
                    selected: item.selected === false ? false : true 
                }));
            } catch(e) { 
                this.cart = []; 
            }

            this.lagunaData = {};
            this.deliveryFeesRaw.forEach(f => {
                if (!this.lagunaData[f.city]) this.lagunaData[f.city] = {};
                this.lagunaData[f.city][f.barangay] = parseInt(f.fee);
            });
            this.updateFaqDeliveryInfo(); 

            if (this.user && this.user.address) {
                try {
                    let addrObj = null;
                    if (this.user.address.trim().startsWith('{')) addrObj = JSON.parse(this.user.address);
                    if (addrObj && addrObj.city && addrObj.brgy && this.lagunaData[addrObj.city] && this.lagunaData[addrObj.city][addrObj.brgy] !== undefined) {
                        this.fee = this.lagunaData[addrObj.city][addrObj.brgy];
                        this.feeSet = true;
                    }
                } catch (e) { }
            }
        } catch (e) { 
            console.warn('Backend not connected or error:', e); 
            this.cart = [];
        }

        if (this.user) {
            if (this.user.role === 'admin') { this.go('admin'); this.renderAdmin(); }
            else { this.go('home'); }
        } else { this.go('landing'); }

        this.renderCarousel();
        this.renderMenu();
        this.initMenuFilters();
        this.renderCart(); // Now renders the newly loaded user-specific cart
        this.checkTheme();
        this.updateNavDrawerAuthUI();
        this.updateNavActiveState()
        this.sizeHeroVideo();
        this.initLeavesAnimation();
        this.checkCartStock();
        this.updateNotifBadge();

        const authPassInput = document.getElementById('auth-pass');
        if (authPassInput) {
            authPassInput.addEventListener('input', (e) => {
                if (this.isSignUp) this.updatePasswordUI(e.target.value, 'auth');
            });
        }

        const accNewPassInput = document.getElementById('acc-new-pass');
        if (accNewPassInput) {
            accNewPassInput.addEventListener('input', (e) => {
                this.updatePasswordUI(e.target.value, 'acc');
            });
        }
        this.initLandingPage();
        this.initLandingInteractions();
        this.resetCarouselTimer();

        const carouselCol = document.querySelector('.home-carousel-col');
        if (carouselCol) {
            carouselCol.addEventListener('mouseenter', () => { if (this.carouselTimer) clearInterval(this.carouselTimer); });
            carouselCol.addEventListener('mouseleave', () => { this.resetCarouselTimer(); });
        }

        if (this._groupPollTimer) clearInterval(this._groupPollTimer);
        this._groupPollTimer = setInterval(async () => {
            if (!this.user) return;
            const isModalOpen = ['edit-group-item-modal', 'bayanihan-pay-modal', 'custom-confirm-modal', 'add-confirm-modal'].some(id => { const el = document.getElementById(id); return el && !el.classList.contains('hidden'); });
            const isTyping = document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'TEXTAREA');
            if (isModalOpen || isTyping) return;

            if (this.currentView === 'bayanihan') {
                await this.loadGroups(); this.renderBayanihan();
            } else if (this.currentView === 'bayanihan-detail' && this.bayanihan.current) {
                const gid = this.bayanihan.current.id;
                try {
                    const res = await fetch('api.php?action=group-get', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: gid }) });
                    const data = await res.json();
                    if (data.id) { this.bayanihan.current = data; this.renderGroupDetail(); }
                } catch (e) {}
            }

            try {
                const nres = await fetch('api.php?action=get-notifications');
                const ndata = await nres.json();
                if (Array.isArray(ndata)) {
                    const oldIds = new Set((this.notifications || []).map(n => Number(n.id)));
                    const newNotifs = ndata.filter(n => !oldIds.has(Number(n.id)) && !Number(n.is_read));

                    this.notifications = ndata;
                    this.updateNotifBadge();
                    const drawer = document.getElementById('notifications-drawer');
                    if (drawer && !drawer.classList.contains('hidden')) this.renderNotifications();

                    if (newNotifs.length > 0) {
                        const latest = newNotifs[0];
                        // Strip HTML tags from the message for the clean toast text
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = latest.message;
                        const textMsg = tempDiv.textContent || tempDiv.innerText || "";
                        this.showToast(`🔔 ${textMsg}`);
                    }
                }
            } catch (e) {}
        }, 10000);

        this.hideLoader();
    },

    checkCartStock() {
        if (!this.products.length || !this.cart.length) return;
        const missing = [];
        let cartUpdated = false;

        this.cart.forEach(c => {
            const p = this.products.find(x => x.id === c.id);
            
            // 1. Product was deleted/archived entirely by Admin
            if (!p) {
                missing.push(`${c.name} (No longer available)`);
                return;
            }

            // 2. Product price changed
            if (p.price !== c.price) {
                this.showToast(`Price Update: The price of ${c.name} was changed to ₱${p.price}.`);
                c.price = p.price;
                cartUpdated = true;
            }

            // 3. Stock dropped to 0 or below cart quantity
            const varStock = this.getVariationStock(p, c.variation || '');
            if (varStock <= 0 || varStock < c.qty) {
                missing.push(c.name + (c.variation ? ` (${c.variation})` : ''));
            }
        });

        if (cartUpdated) this.saveCart();

        if (missing.length > 0) {
            const listEl = document.getElementById('stock-alert-list');
            if (listEl) listEl.innerHTML = missing.map(name => `<li>${this.esc(name)}</li>`).join('');
            document.getElementById('stock-alert-modal').classList.remove('hidden');
        }
    },

    removeOutOfStockItems() {
        this.cart = this.cart.filter(c => { const p = this.products.find(x => x.id === c.id); return p && p.stock > 0 && p.stock >= c.qty; });
        this.saveCart();
        document.getElementById('stock-alert-modal').classList.add('hidden');
        this.showToast('Inalis na ang mga kulang/ubos na items sa cart mo.');
    },

    formatAddress(addrStr) {
        if (!addrStr) return '';
        try {
            const obj = JSON.parse(addrStr);
            if (obj.street !== undefined || obj.brgy !== undefined || obj.city !== undefined) return [obj.street, obj.brgy, obj.city].filter(Boolean).join(', ');
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

        // 🟢 FIX: Only show the warning if they have PASO items AND their current city is NOT Calamba
        const warning = document.getElementById('paso-restriction-note');
        if (warning) {
            const currentCity = citySelect.value;
            warning.classList.toggle('hidden', !(hasPaso && currentCity !== 'Calamba'));
        }
        
        this.feeSet = false; this.fee = 0;
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

        // 🟢 FIX: Hide the warning dynamically if they switch to Calamba
        const warning = document.getElementById('paso-restriction-note');
        const hasPaso = this.cart.some(c => c.selected && (c.category || '').toLowerCase() === 'paso');
        if (warning) {
            warning.classList.toggle('hidden', !(hasPaso && city !== 'Calamba'));
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
            this.feeSet = true;
        } else { this.fee = 0; this.feeSet = false; }
        this.renderCheckoutSummary();
        this.renderCart();
        if (this.currentView === 'cart') this.renderCartPage();
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
            if (!isActive) { el.classList.add('active'); body.style.maxHeight = body.scrollHeight + 'px'; }
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
        if (wrapAspect > videoAspect) { w = rect.width; h = rect.width / videoAspect; } else { h = rect.height; w = rect.height * videoAspect; }
        iframe.style.width = Math.ceil(w) + 'px'; iframe.style.height = Math.ceil(h) + 'px';
    },

    go(view) {
        const protectedViews = ['bayanihan', 'bayanihan-detail', 'account', 'orders'];
        if (!this.user && protectedViews.includes(view)) {
            this.showToast('Mag-sign in muna para ma-access ito, suki!');
            this.openAuthModal('signin');
            return;
        }

        document.querySelectorAll('main > div').forEach(d => d.classList.add('hidden'));
        const target = document.getElementById('view-' + view);
        const bare = (view === 'landing');
        if (target) {
            target.classList.remove('hidden');
            if (!bare) { target.classList.remove('view-enter'); void target.offsetWidth; target.classList.add('view-enter'); }
        }
        const header = document.getElementById('global-header');
        const footer = document.getElementById('site-footer');
        header.classList.toggle('hidden', bare);
        if (footer) footer.classList.toggle('hidden', bare);
        
        this.currentView = view;
        this.updateBodyScrollLock();
        if (!bare) window.scrollTo({ top: 0 });

        this.updateNavActiveState();
        
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
        if (view === 'bayanihan') this.renderBayanihan();
        if (view === 'bayanihan-detail') this.renderGroupDetail();
        if (view === 'contact') this.prefillContactForm(); 

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

    getVariationStock(p, varStr) {
        if (!p) return 0;
        let stock = p.stock;
        if (p.options && varStr) {
            try {
                const opts = JSON.parse(p.options);
                if (opts._stocks && Object.keys(opts._stocks).length > 0) {
                    stock = (opts._stocks[varStr] !== undefined)
                        ? parseInt(opts._stocks[varStr]) || 0
                        : 0; // combo not in _stocks = new combo = 0 stock
                }
            } catch(e) {}
        }
        return stock;
    },

    // 🟢 NEW: Rolling Number Animation
    setAnimatedValue(id, endValue, suffixHtml = '', isMoney = true) {
        const el = document.getElementById(id);
        if (!el) return;
        
        let startValue = parseFloat(el.dataset.val);
        if (isNaN(startValue)) {
            const rawText = el.innerText.replace(/[^0-9.-]+/g, "");
            startValue = parseFloat(rawText) || 0;
        }

        // If the element is not visible (e.g., cart drawer is closed), just set it instantly
        if (!el.offsetParent && startValue === 0) {
            el.dataset.val = endValue;
            el.innerHTML = (isMoney ? this.money(endValue) : endValue) + suffixHtml;
            return;
        }

        if (Math.abs(endValue - startValue) < 0.01) {
            el.dataset.val = endValue;
            el.innerHTML = (isMoney ? this.money(endValue) : endValue) + suffixHtml;
            return;
        }

        if (el._animFrame) cancelAnimationFrame(el._animFrame);
        
        const duration = 450; // 450ms for a smooth roll
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (easeOutQuart) for a satisfying "settle"
            const easeOut = 1 - Math.pow(1 - progress, 4);
            const current = startValue + (endValue - startValue) * easeOut;
            
            let displayStr;
            if (isMoney) {
                const hasDecimals = endValue % 1 !== 0;
                displayStr = '\u20B1' + current.toLocaleString('en-US', { 
                    minimumFractionDigits: hasDecimals ? 2 : 0, 
                    maximumFractionDigits: hasDecimals ? 2 : 0 
                });
            } else {
                displayStr = Math.round(current);
            }
            
            el.innerHTML = displayStr + suffixHtml;
            
            if (progress < 1) {
                el._animFrame = requestAnimationFrame(update);
            } else {
                el.dataset.val = endValue;
                el.innerHTML = (isMoney ? this.money(endValue) : endValue) + suffixHtml;
                el._animFrame = null;
            }
        };
        el._animFrame = requestAnimationFrame(update);
    },
    firstName() { return this.user && this.user.name ? this.user.name.trim().split(/\s+/)[0] : ''; },
    greeting() {
        const h = new Date().getHours();
        if (h < 12) return 'Magandang umaga';
        if (h < 14) return 'Magandang tanghali';
        if (h < 18) return 'Magandang hapon';
        return 'Magandang gabi';
    },
    updateGreeting() { const el = document.getElementById('home-greeting'); if (el) el.textContent = `${this.greeting()}, ${this.firstName() || 'kababayan'}!`; },
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
        } else if (menuSec) menuSec.scrollIntoView({ behavior: 'smooth' });
    },

    filterFromFooter(category) {
        this.go('home');
        
        setTimeout(() => {
            this.scrollToMenu();
            
            // Find the correct department pill and click it
            const pills = document.querySelectorAll('.dept-pill');
            for (let pill of pills) {
                if (pill.getAttribute('onclick') && pill.getAttribute('onclick').includes(`'${category}'`)) {
                    pill.click(); 
                    break;
                }
            }
        }, 150);
    },

    toggleNavDrawer() {
        const drawer = document.getElementById('nav-drawer');
        const backdrop = document.getElementById('nav-drawer-backdrop');
        
        if (drawer.classList.contains('open')) {
            // Closing the drawer
            drawer.classList.remove('open');
            backdrop.classList.remove('show');
            // Instantly disable clicks on the backdrop so it doesn't catch stray clicks while fading
            backdrop.style.pointerEvents = 'none'; 
        } else {
            // Opening the drawer
            drawer.classList.add('open');
            backdrop.classList.add('show');
            backdrop.style.pointerEvents = 'auto';
        }
        this.updateBodyScrollLock(); 
    },

    navTo(view) { this.toggleNavDrawer(); this.go(view); },
    navToAccount() {
        this.toggleNavDrawer();
        if (this.user) {
            this.go('account');
        } else { 
            this.showToast('Mag-sign in muna para ma-access ang account mo, suki!');
            this.openAuthModal('signin'); 
        }
    },

    populateAuthCities() {
        const citySelect = document.getElementById('auth-city');
        if (!citySelect) return;
        citySelect.innerHTML = '<option value="" disabled selected>Pumili ng Lungsod *</option>';
        Object.keys(this.lagunaData).forEach(c => {
            citySelect.innerHTML += `<option value="${c}">${c}</option>`;
        });
    },

    updateAuthBrgyDropdown() {
        const city = document.getElementById('auth-city').value;
        const brgySelect = document.getElementById('auth-brgy');
        if (!brgySelect) return;
        brgySelect.innerHTML = '<option value="" disabled selected>Pumili ng Barangay *</option>';
        if (this.lagunaData[city]) {
            Object.keys(this.lagunaData[city]).forEach(b => {
                brgySelect.innerHTML += `<option value="${b}">${b}</option>`;
            });
        }
    },

    openAuthModal(mode = 'signin') {
        const modal = document.getElementById('view-auth');
        if (!modal) return;
        
        const emailInput = document.getElementById('auth-email');
        const passInput = document.getElementById('auth-pass');
        const confirmPassInput = document.getElementById('auth-confirm-pass');
        
        if (emailInput) { emailInput.value = ''; emailInput.setAttribute('readonly', 'readonly'); }
        if (passInput) { passInput.value = ''; passInput.setAttribute('readonly', 'readonly'); }
        if (confirmPassInput) { confirmPassInput.value = ''; confirmPassInput.setAttribute('readonly', 'readonly'); }

        const isLanding = this.currentView === 'landing';
        
        modal.classList.toggle('landing-mode', isLanding);
        modal.classList.toggle('signup-active', mode === 'signup');
        modal.classList.remove('hidden');
        
        void modal.offsetWidth; 
        modal.classList.add('show');

        document.body.style.overflow = 'hidden';
        this.setAuthMode(mode, false);
        this.clearAuthError();
        this.populateAuthCities();
        this.updateBodyScrollLock();
    },

    closeAuthModal() {
        const modal = document.getElementById('view-auth');
        if (!modal) return;
    
        modal.classList.remove('show'); 
    
        setTimeout(() => {
            modal.classList.add('hidden');
            this.updateBodyScrollLock();
            
        }, 600); 

        document.body.style.overflow = (this.currentView === 'landing') ? 'hidden' : 'auto';
    },

    updateNavDrawerAuthUI() {
        const btnLabel = document.getElementById('nd-auth-label');
        const accountSub = document.getElementById('nav-account-sub');
        const ordersLink = document.getElementById('nav-orders-link');
        const ordersTitle = document.getElementById('nav-orders-title');
        const ordersSub = document.getElementById('nav-orders-sub');
        const ordersIcon = document.getElementById('nav-orders-icon');
        const adminMyOrdersLink = document.getElementById('nav-admin-my-orders');

        if (this.user) {
            btnLabel.textContent = 'Logout';
            accountSub.textContent = this.user.name;
            if (this.user.role === 'admin') {
                ordersTitle.textContent = 'Admin Dashboard';
                ordersSub.textContent = 'Manage Store';
                ordersLink.setAttribute('onclick', "app.navTo('admin')");
                ordersLink.setAttribute('data-view', 'admin'); // 🟢 Set to admin
                ordersIcon.innerHTML = '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>';
                if (adminMyOrdersLink) adminMyOrdersLink.classList.remove('hidden');
            } else {
                ordersTitle.textContent = 'My Orders';
                ordersSub.textContent = 'Kasaysayan ng Order';
                ordersLink.setAttribute('onclick', "app.navTo('orders')");
                ordersLink.setAttribute('data-view', 'orders'); // 🟢 Set to orders
                ordersIcon.innerHTML = '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>';
                if (adminMyOrdersLink) adminMyOrdersLink.classList.add('hidden');
            }
        } else { if (adminMyOrdersLink) adminMyOrdersLink.classList.add('hidden'); }
        this.updateFooterLinks();
    },

    updateNavActiveState() {
        if (!this.currentView) return;
        document.querySelectorAll('.nav-drawer-links a').forEach(link => {
            link.classList.remove('active');
            const targetView = link.getAttribute('data-view');
            if (targetView === this.currentView) {
                link.classList.add('active');
            }
        });
    },

    updateFooterLinks() {
        const ul = document.getElementById('footer-dynamic-links');
        if (!ul) return;

        let links = `<li><a href="#" onclick="app.scrollToMenu(); return false;">Menu</a></li>`;

        if (this.user) {
            if (this.user.role === 'admin') {
                links += `
                    <li><a href="#" onclick="app.go('admin'); return false;">Admin Dashboard</a></li>
                    <li><a href="#" onclick="app.go('orders'); return false;">My Orders</a></li>
                `;
            } else {
                links += `<li><a href="#" onclick="app.go('orders'); return false;">My Orders</a></li>`;
            }
        } else {
            links += `<li><a href="#" onclick="app.openAuthModal('signin'); return false;">Sign In</a></li>`;
        }

        links += `
            <li><a href="#" onclick="app.go('recipes'); return false;">Recipe Box</a></li>
            <li><a href="#" onclick="app.go('faq'); return false;">FAQ</a></li>
        `;

        ul.innerHTML = links;
    },

    handleAuthFromDrawer() { this.toggleNavDrawer(); this.handleAuth(); },

    updateBodyScrollLock() {
        const isDrawerOpen = document.querySelector('.drawer:not(.hidden)') !== null;
        const isModalOpen = document.querySelector('.modal:not(.hidden)') !== null;
        const isAuthOpen = document.getElementById('view-auth') && !document.getElementById('view-auth').classList.contains('hidden');
        const isNavOpen = document.getElementById('nav-drawer').classList.contains('open');
        const isLanding = document.getElementById('view-landing') && !document.getElementById('view-landing').classList.contains('hidden');

        if (isDrawerOpen || isModalOpen || isAuthOpen || isNavOpen || isLanding) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    },

    showToast(msg, isNotification = false) {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.classList.add('show');
        
        const botBtn = document.getElementById('pilibot-btn');
        if (botBtn) {
            botBtn.classList.remove('bot-notif-active', 'bot-toast-active');
            void botBtn.offsetWidth; 
            if (isNotification) {
                botBtn.classList.add('bot-notif-active');
                clearTimeout(this._botAnimTimer);
                this._botAnimTimer = setTimeout(() => botBtn.classList.remove('bot-notif-active'), 2000);
            } else {
                botBtn.classList.add('bot-toast-active');
                clearTimeout(this._botAnimTimer);
                this._botAnimTimer = setTimeout(() => botBtn.classList.remove('bot-toast-active'), 1500);
            }
        }
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => t.classList.remove('show'), 3600);
    },

    showCredits() {
        document.getElementById('credits-modal').classList.remove('hidden');
    },
    
    initLandingPage() {
        const text = "Where you can choose to your hearts' desires.";
        const el = document.getElementById('typewriter-text');
        if (el) {
            el.innerHTML = '<span class="type-cursor"></span>';
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    el.innerHTML = text.substring(0, i + 1) + '<span class="type-cursor"></span>';
                    i++;
                    setTimeout(typeWriter, 40); 
                }
            };
            setTimeout(typeWriter, 500);
        }
        this.setupTrail('menu-cursor-glow', { particleClass: 'trail-brand' });
    },

    enterStore() {
        if (this.user) {
            this.go(this.user.role === 'admin' ? 'admin' : 'home');
        } else {
            this.openAuthModal('signin');
        }
    },

initLandingInteractions() {
    this.setupTrail('menu-cursor-glow', { particleClass: 'mixed' });
},

    setupTrail(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const parent = container.parentElement;
        if (!parent) return;

        let lastSpawn = 0;
        const spawnInterval = options.spawnInterval || 25;   // Slightly slower for elegance
        const lifetime      = options.lifetime      || 850;

        // Array of theme colors
        const themeClasses = ['trail-amber', 'trail-brand', 'trail-leaf'];

        parent.addEventListener('mousemove', (e) => {
            if (parent.classList.contains('hidden')) return;
            const now = performance.now();
            if (now - lastSpawn < spawnInterval) return;
            lastSpawn = now;

            const rect = parent.getBoundingClientRect();
            const particle = document.createElement('div');
            
            // Randomly pick a theme color
            let particleClass = options.particleClass;
            if (options.particleClass === 'mixed') {
                particleClass = themeClasses[Math.floor(Math.random() * themeClasses.length)];
            }
            
            particle.className = 'trail-particle ' + (particleClass || '');
            particle.style.left = (e.clientX - rect.left) + 'px';
            particle.style.top  = (e.clientY - rect.top)  + 'px';
            
            // Randomize the size slightly for a more organic feel
            const randomScale = 0.5 + Math.random() * 0.7;
            particle.style.transform = `translate(-50%, -50%) scale(${randomScale})`;

            container.appendChild(particle);

            setTimeout(() => particle.remove(), lifetime);
        });
    },

    handleAuth() {
        if (this.user) {  
            this.showConfirm('Logout', 'Sigurado ka bang gusto mong mag-logout?', () => {
                fetch('api.php?action=logout').then(() => location.reload());
            }, 'Logout');
        }
        else { this.openAuthModal('signin'); }
    },

    setAuthMode(mode, animate = true) {
        const next = (mode === 'signup');
        if (next === this.isSignUp) return;
        this.isSignUp = next;

        const modal = document.getElementById('view-auth');
        if (modal) {
            modal.classList.toggle('signup-active', next);
            const guestSection = document.getElementById('auth-guest-section');
            if (guestSection) guestSection.style.display = next ? 'none' : 'block';
        }

        // Reset password checklist state
        const reqList = document.getElementById('auth-pass-req');
        if (reqList) {
            reqList.style.display = next ? 'grid' : 'none'; // ✅ Force grid for signup, none for signin
            if (!next) this.updatePasswordUI('', 'auth'); // Clear checks
        }

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
        $('auth-confirm-pass').value = '';
        $('auth-city').value = ''; 
        $('auth-brgy').value = ''; 
        $('auth-street').value = '';
        if ($('auth-pass').type === 'text') $('auth-pass').type = 'password';
        if ($('auth-confirm-pass').type === 'text') $('auth-confirm-pass').type = 'password';
        document.querySelectorAll('.eye-show-icon').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.eye-hide-icon').forEach(el => el.style.display = 'none');
        if (animate) {
            card.classList.remove('bump'); void card.offsetWidth; card.classList.add('bump');
            setTimeout(() => (next ? $('auth-name') : $('auth-email')).focus(), 380);
        }
    },

    checkPasswordStrength(password) {
        return {
            len: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            num: /[0-9]/.test(password),
            spec: /[^A-Za-z0-9]/.test(password)
        };
    },

    updatePasswordUI(password, prefix) {
        const reqs = this.checkPasswordStrength(password);
        const list = document.getElementById(`${prefix}-pass-req`);
        
        if (list) {
            if (password.length > 0 || (prefix === 'auth' && this.isSignUp)) {
                list.style.display = 'grid'; // 🟢 Changed from 'flex' to 'grid'
            } else {
                list.style.display = 'none';
            }
        }

        ['len', 'upper', 'lower', 'num', 'spec'].forEach(k => {
            const el = document.getElementById(`${prefix}-req-${k}`);
            if (el) {
                if (reqs[k]) {
                    el.classList.add('met');
                    el.querySelector('.req-icon').textContent = '✓';
                } else {
                    el.classList.remove('met');
                    el.querySelector('.req-icon').textContent = '○';
                }
            }
        });

        return Object.values(reqs).every(Boolean); // Returns true if ALL rules are met
    },

    togglePassword() {
        const p1 = document.getElementById('auth-pass');
        const p2 = document.getElementById('auth-confirm-pass');
        
        const show = p1.type === 'password';
        
        p1.type = show ? 'text' : 'password';
        if (p2) p2.type = show ? 'text' : 'password';
        
        document.querySelectorAll('.eye-show-icon').forEach(el => el.style.display = show ? 'none' : 'block');
        document.querySelectorAll('.eye-hide-icon').forEach(el => el.style.display = show ? 'block' : 'none');
        
        p1.focus();
    },

    continueAsGuest() { 
        this.closeAuthModal(); 
        if (this.currentView === 'landing') {
            this.go('home');
        }
        this.showToast('Tuloy ka, bisita! Mag-ikot ka lang nang dahan-dahan.'); 
    },

    clearAuthError() {
        const err = document.getElementById('auth-error');
        if (err) { err.classList.remove('show'); err.textContent = ''; }
        document.querySelectorAll('.auth-input.invalid').forEach(i => i.classList.remove('invalid'));
    },

    prefillContactForm() {
        const nameInput = document.getElementById('contact-name');
        const emailInput = document.getElementById('contact-email');
        const nameGroup = document.getElementById('group-fullname');
        const emailGroup = document.getElementById('group-email');
        if (!nameInput || !emailInput) return;

        if (this.user) {
            // 1. Logged In: Prefill and lock the fields
            nameInput.value = this.user.name || '';
            emailInput.value = this.user.email || '';
            
            nameInput.setAttribute('readonly', 'readonly');
            emailInput.setAttribute('readonly', 'readonly');
            
            // Apply visual styling to indicate it's locked
            const lockedStyle = { bg: 'var(--bg)', color: 'var(--muted)', cursor: 'not-allowed' };
            nameInput.style.backgroundColor = lockedStyle.bg;
            nameInput.style.color = lockedStyle.color;
            nameInput.style.cursor = lockedStyle.cursor;
            
            emailInput.style.backgroundColor = lockedStyle.bg;
            emailInput.style.color = lockedStyle.color;
            emailInput.style.cursor = lockedStyle.cursor;

            // Remove any previous error states
            if (nameGroup) nameGroup.classList.remove('error');
            if (emailGroup) emailGroup.classList.remove('error');
            
        } else {
            // 2. Guest Mode: Make editable and clear values
            nameInput.removeAttribute('readonly');
            emailInput.removeAttribute('readonly');
            
            nameInput.style.backgroundColor = '';
            nameInput.style.color = '';
            nameInput.style.cursor = '';
            
            emailInput.style.backgroundColor = '';
            emailInput.style.color = '';
            emailInput.style.cursor = '';

            nameInput.value = '';
            emailInput.value = '';
        }
    },

    async renderAdminContacts() {
        const grid = document.getElementById('admin-contacts-grid');
        if (!grid) return;
        
        grid.innerHTML = '<p style="text-align:center; color:var(--muted);">Loading messages...</p>';
        
        try {
            const res = await fetch('api.php?action=admin-get-contacts');
            const data = await res.json();
            
            if (!data.length) {
                grid.innerHTML = '<p style="text-align:center; color:var(--muted); padding:20px;">Wala pang mensahe.</p>';
                return;
            }

            grid.innerHTML = data.map(m => `
                <div class="admin-order-card" style="border-left: 4px solid ${m.is_read ? 'var(--line)' : 'var(--brand)'};">
                    <div class="admin-order-header">
                        <div>
                            <h4>${this.esc(m.subject)}</h4>
                            <span class="admin-order-date">Mula kay: ${this.esc(m.name)} (${this.esc(m.email)})</span>
                        </div>
                        <span class="pay-badge" style="background:${m.is_read ? 'var(--surface2)' : 'rgba(217, 91, 51, 0.15)'}; color:${m.is_read ? 'var(--muted)' : 'var(--brand)'}; border-color:${m.is_read ? 'var(--line)' : 'var(--brand)'};">
                            ${m.is_read ? 'Read' : 'New'}
                        </span>
                    </div>
                    <div style="padding: 10px 0; font-size: 14px; color: var(--ink); line-height: 1.6;">
                        ${this.esc(m.message).replace(/\n/g, '<br>')}
                    </div>
                </div>
            `).join('');
        } catch (err) {
            grid.innerHTML = '<p style="text-align:center; color:#e5604d;">Error loading messages.</p>';
        }
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
        
        const confirmPassword = el('auth-confirm-pass').value;
        const city = el('auth-city').value;
        const brgy = el('auth-brgy').value;
        const street = el('auth-street').value.trim();

        if (this.isSignUp && !name) return this.authFail('Ilagay ang buong pangalan mo.', 'auth-name');
        
        const nameRegex = /^[a-zA-Z\s\.\-]+$/;
        if (this.isSignUp && !nameRegex.test(name)) {
            return this.authFail('Mali ang format ng pangalan. Letters, spaces, hyphens, at periods lang ang pwede.', 'auth-name');
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) return this.authFail('Mali ang email format.', 'auth-email');
        if (!password) return this.authFail('Ilagay ang password.', 'auth-pass');
        if (this.isSignUp && !this.updatePasswordUI(password, 'auth')) {
            return this.authFail('Please ensure your password meets all requirements.', 'auth-pass');
        }

        if (this.isSignUp && password !== confirmPassword) return this.authFail('Hindi nagtutugma ang password at confirm password.', 'auth-confirm-pass');
        if (this.isSignUp && !city) return this.authFail('Pumili ng Lungsod.', 'auth-city');
        if (this.isSignUp && !brgy) return this.authFail('Pumili ng Barangay.', 'auth-brgy');
        if (this.isSignUp && !street) return this.authFail('Ilagay ang House no., Street, o Subd.', 'auth-street');

        const payload = { email, password };
        if (this.isSignUp) {
            payload.name = name;
            payload.confirm_password = confirmPassword;
            payload.city = city;
            payload.brgy = brgy;
            payload.street = street;
        } else {
            payload.role = 'customer';
        }

        this.authBusy = true;
        const submitBtn = el('auth-submit');
        this.setBtnLoading(submitBtn, true);

        try {
            const res = await fetch(`api.php?action=${this.isSignUp ? 'signup' : 'login'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.ok) { 
                this.authBusy = false; 
                this.setBtnLoading(submitBtn, false);
                return this.authFail(data.error || 'Hindi makapasok. Subukan ulit.'); 
            }
            
            this.showLoader(this.isSignUp ? 'Ginagawa ang account...' : 'Nagsi-sign in...');
            await new Promise(r => setTimeout(r, 800)); // Smooth fake delay
            el('auth-form').reset();
            this.closeAuthModal();
            this.showToast(this.isSignUp ? 'Welcome sa PiliKart, suki! Ready na ang account mo.' : 'Welcome back, suki! Tuloy ka.');
            await this.init();
            this.hideLoader();
            this.authBusy = false;
        } catch (err) {
            this.authBusy = false;
            this.setBtnLoading(submitBtn, false);
            this.authFail('Walang koneksyon sa server.');
        }
    },

    renderCarousel() {
        const container = document.getElementById('carousel-card-container');
        if (!container) return;
        let highlights = this.products.filter(p => Number(p.best_seller) === 1);
        if (highlights.length < 4 && this.products.length > 0) {
            const otherProducts = this.products.filter(p => Number(p.best_seller) !== 1);
            let i = 0;
            while (highlights.length < 4 && i < otherProducts.length) { highlights.push(otherProducts[i]); i++; }
        }
        if (highlights.length === 0) { container.innerHTML = ''; return; }

        this._carouselItems = highlights.map(p => {
            const catKey = (p.category || 'paso').toLowerCase();
            const displayCategory = catKey === 'paso' ? 'BANGA' : (p.category || 'ITEM').toUpperCase();
return { id: p.id, name: displayCategory, catKey: catKey, icon: this.deptIcons[catKey] || '', desc: p.description || p.tagline || '', featured: p.name, image: p.image };
        });

        if (this.carouselIndex >= this._carouselItems.length) this.carouselIndex = 0;

        const dotsContainer = document.getElementById('carousel-dots');
        if (dotsContainer) {
            dotsContainer.innerHTML = this._carouselItems.map((_, i) => `<span class="dot ${i === this.carouselIndex ? 'active' : ''}" onclick="app.setCarouselSlide(${i})"></span>`).join('');
        }

        const sig = this._carouselItems.map(c => c.id).join(',');
        if (container.dataset.sig !== sig) {
            container.dataset.sig = sig;
            container.innerHTML = this._carouselItems.map((dept, index) => `
                <div class="carousel-card" id="carousel-card-${index}" onclick="app.handleCarouselClick(${index}, ${dept.id})">
                    <img src="${dept.image}" class="carousel-img" alt="${dept.name}">
                    <div class="carousel-glass-panel">
                        <span class="dept-badge ${dept.catKey}" style="margin-bottom: 12px;">${dept.icon} ${dept.name}</span>
                        <h3 class="carousel-title">${dept.featured}</h3>
                        <p class="carousel-desc">${dept.desc}</p>
                    </div>
                </div>`).join('');
        }

        this._carouselItems.forEach((_, index) => {
            const card = document.getElementById(`carousel-card-${index}`);
            if (!card) return;
            card.classList.remove('active', 'prev', 'next', 'hidden');
            const len = this._carouselItems.length;
            if (index === this.carouselIndex) card.classList.add('active');
            else if (index === (this.carouselIndex - 1 + len) % len) card.classList.add('prev');
            else if (index === (this.carouselIndex + 1) % len) card.classList.add('next');
            else card.classList.add('hidden');
        });
    },

    handleCarouselClick(index, productId) {
        if (index !== this.carouselIndex) { this.setCarouselSlide(index); return; }
        if (productId && productId !== 'null') this.addToCart(productId);
        else this.showToast('hmm, hindi namin makita iyan sa menu.');
    },

    prevCarouselSlide() { const len = this._carouselItems ? this._carouselItems.length : 0; if (len === 0) return; this.carouselIndex = (this.carouselIndex - 1 + len) % len; this.renderCarousel(); this.resetCarouselTimer(); },
    nextCarouselSlide() { const len = this._carouselItems ? this._carouselItems.length : 0; if (len === 0) return; this.carouselIndex = (this.carouselIndex + 1) % len; this.renderCarousel(); this.resetCarouselTimer(); },
    resetCarouselTimer() {
        if (this.carouselTimer) clearInterval(this.carouselTimer);
        this.carouselTimer = setInterval(() => {
            if (!document.getElementById('view-home').classList.contains('hidden')) {
                const len = this._carouselItems ? this._carouselItems.length : 0;
                if (len > 0) { this.carouselIndex = (this.carouselIndex + 1) % len; this.renderCarousel(); }
            }
        }, 7000);
    },
    setCarouselSlide(idx) { this.carouselIndex = idx; this.renderCarousel(); },

    filterDepartment(category, btn) {
        this.selectedCategory = category;
        document.querySelectorAll('.dept-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        this.renderMenu();
    },

    syncMaxPrice(source) {
        const topMax = document.getElementById('budget-input');
        const advMax = document.getElementById('filter-max-price');

        if (source === 'top') {
            advMax.value = topMax.value;
        } else if (source === 'adv') {
            topMax.value = advMax.value;
        }
        
        this.renderMenu();
    },

renderMenu() {
    const qInput = document.getElementById('search-input');
    const bInput = document.getElementById('budget-input');
    if (!qInput || !bInput) return;

    const q = qInput.value.toLowerCase();
    const minPrice = Math.max(0, parseFloat(document.getElementById('filter-min-price')?.value) || 0);

    // Max price: take the smaller of budget-input and filter-max-price
    let maxPrice = parseFloat(bInput.value);
    if (isNaN(maxPrice) || maxPrice < 0) maxPrice = Infinity;
    const advMax = parseFloat(document.getElementById('filter-max-price')?.value);
    if (!isNaN(advMax) && advMax >= 0 && advMax < maxPrice) maxPrice = advMax;

    const sortBy        = document.getElementById('filter-sort')?.value || 'default';
    const inStockOnly   = document.getElementById('filter-in-stock')?.checked || false;
    const bestSellerOnly= document.getElementById('filter-best-seller')?.checked || false;

    // Budget tracker for cart sidebar
    this.budget = maxPrice === Infinity ? null : maxPrice;
    this.updateCartBudgetUI();

    const categoryMeta = { paso: { label: 'BANGA' }, nipa: { label: 'NIPA' }, habi: { label: 'HABI' }, apollo: { label: 'APOLLO' } };
    // 1. Filter
    let filtered = this.products.filter(p => {
        const cat = p.category ? p.category.toLowerCase() : '';
        const matchCat  = this.selectedCategory === 'all' || cat === this.selectedCategory.toLowerCase();
        const matchQ    = p.name.toLowerCase().includes(q) || (p.tags && p.tags.toLowerCase().includes(q));
        const matchPrice= p.price >= minPrice && p.price <= maxPrice;

        let matchTags = true;
        if (this.selectedTags.length > 0) {
            const productTags = (p.tags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
            matchTags = this.selectedTags.some(tag => productTags.includes(tag.toLowerCase()));
        }

        const matchStock      = !inStockOnly || p.stock > 0;
        const matchBestSeller = !bestSellerOnly || Number(p.best_seller) === 1;

        return matchCat && matchQ && matchPrice && matchTags && matchStock && matchBestSeller;
    });

    // 2. Sort
    if (sortBy === 'price-asc')       filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name-asc')   filtered.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'name-desc')  filtered.sort((a, b) => b.name.localeCompare(a.name));

    // 3. Render
    const sig = this.selectedCategory + '|' + this.products.length;
    const animate = sig !== this._menuSig;
    this._menuSig = sig;

    const html = filtered.map((p, idx) => {
        const catKey = (p.category || 'paso').toLowerCase();
        const meta = categoryMeta[catKey] || { label: catKey.toUpperCase() };
        const icon = this.deptIcons[catKey] || '';
        const formattedPrice = Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const out = p.stock <= 0;
        const stockPill = out ? '<span class="stock-pill out">Ubos na</span>' : (p.stock <= 5 ? `<span class="stock-pill">${p.stock} na lang!</span>` : '');
        let stockClass = 'stock-high';
        if (p.stock <= 0) stockClass = 'stock-out';
        else if (p.stock <= 10) stockClass = 'stock-low';
        const isBestSeller = Number(p.best_seller) === 1;
        const bestSellerPill = isBestSeller ? `<span class="best-seller-pill">⭐ Suki's Choice</span>` : '';

        return `
            <div class="card product-card ${out ? 'is-out' : ''} ${animate ? 'enter' : ''}" style="--i:${idx}">
                <div class="prod-badges-row">
                    <span class="dept-badge ${catKey}">${icon} ${meta.label}</span>
                    <div class="badges-right">${bestSellerPill} ${stockPill}</div>
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
                            <span class="meta-chip stock ${stockClass}"><strong>${p.stock}</strong><span>in stock</span></span>
                            <div class="tags-wrap">
                                ${(p.tags || '').split(',').map(t => t.trim()).filter(Boolean).map(t => `<span class="meta-chip tag">${this.esc(t)}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="prod-footer" style="gap: 8px;">
                    <div>
                        <span class="prod-price-label">Presyo</span>
                        <span class="prod-price-val">₱${formattedPrice}</span>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        ${out 
                            ? `<button class="btn btn-brand add-btn" disabled style="height: 44px; padding: 0 16px; border-radius: 99px;">Ubos na</button>`
                            : `
                            <!-- Add to Cart (SVG + Text) -->
                            <button class="btn btn-brand add-btn" onclick="app.addToCart(${p.id}, this)" style="height: 44px; padding: 0 20px; border-radius: 99px; display: flex; align-items: center; gap: 6px; flex-shrink: 0; transition: transform 0.2s;" title="Add to Cart">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                                Add
                            </button>
                            `
                        }
                    </div>
                </div>
            </div>`;
    }).join('');

    document.getElementById('product-grid').innerHTML = html || this.emptyState('search', 'Hmm, wala pa kaming nahanap', 'Subukan ang ibang salita o kategorya — baka nasa kabilang sulok lang ang hinahanap mo.');
},

    showAllTags: false,

    initMenuFilters() {
        const tagSet = new Set();
        this.products.forEach(p => {
            if (p.tags) {
                p.tags.split(',').forEach(t => {
                    const cleanTag = t.trim();
                    if (cleanTag) tagSet.add(cleanTag);
                });
            }
        });
        this.availableTags = Array.from(tagSet).sort();
        
        const container = document.getElementById('filter-tags-container');
        if (!container) return;

        // Render all tags in a single horizontal row
        container.innerHTML = this.availableTags.map(tag => {
            const isActive = this.selectedTags.includes(tag);
            return `<button class="filter-tag-btn ${isActive ? 'active' : ''}" style="flex-shrink: 0;" onclick="app.toggleMenuTag('${this.esc(tag)}')">${this.esc(tag)}</button>`;
        }).join('');
    },

    toggleMenuTag(tag) {
        if (this.selectedTags.includes(tag)) {
            this.selectedTags = this.selectedTags.filter(t => t !== tag);
        } else {
            this.selectedTags.push(tag);
        }
        this.initMenuFilters(); 
        this.renderMenu();      
    },

    clearMenuFilters() {
        this.selectedTags = [];
        document.getElementById('search-input').value = '';
        document.getElementById('budget-input').value = '';
        document.getElementById('filter-min-price').value = '';
        document.getElementById('filter-max-price').value = ''; // 🟢 Added this
        document.getElementById('filter-sort').value = 'default';
        document.getElementById('filter-in-stock').checked = false;
        document.getElementById('filter-best-seller').checked = false;
        
        this.selectedCategory = 'all';
        document.querySelectorAll('.dept-pill').forEach(p => p.classList.remove('active'));
        document.querySelector('.dept-pill').classList.add('active'); 
        
        this.initMenuFilters();
        this.renderMenu();
    },

    pendingCartItem: null,
    pendingQty: 1,

    addToCart(id, btn) {
        if (!this.user) {
            this.showToast('Sign in muna, suki — para ma-save namin ang cart mo.');
            this.openAuthModal('signin');
            return; // Stop the function here so the modal doesn't open
        }

        const p = this.products.find(x => x.id === id);
        if (!p || p.stock <= 0) return;
        this.pendingCartItem = p;
        this.pendingQty = 1;
        this.renderAddConfirmModal(); 
        const modal = document.getElementById('add-confirm-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.updateBodyScrollLock();
        }
    },

    pendingPriceModifier: 0,

    async renderAddConfirmModal() {
        const p = this.pendingCartItem;
        if (!p) return;

        const box = document.getElementById('add-confirm-item-box');
        const bayanihanContainer = document.getElementById('bayanihan-options-container');
        if (!box) return;
        
        if (bayanihanContainer) bayanihanContainer.innerHTML = '';

        const currentSelections = {};
        document.querySelectorAll('#add-confirm-item-box input[type="radio"]:checked').forEach(inp => {
            currentSelections[inp.name] = inp.value;
        });

        let optionsHtml = '';
        if (p.options) {
            try {
                const parsedOpts = JSON.parse(p.options);
                
                // 🟢 NEW: Find the first valid in-stock combination to auto-select by default
                let defaultSelections = {};
                if (!Object.keys(currentSelections).length && parsedOpts._stocks) {
                    const availableCombo = Object.keys(parsedOpts._stocks).find(combo => parseInt(parsedOpts._stocks[combo]) > 0);
                    if (availableCombo) {
                        availableCombo.split(', ').forEach(part => {
                            const [k, v] = part.split(': ');
                            defaultSelections[`opt_${k}`] = v;
                        });
                    }
                }

                for (const [groupName, choices] of Object.entries(parsedOpts)) {
                    if (groupName === '_stocks') continue; // Skip rendering _stocks
                    
                    let choiceList = [];
                    if (Array.isArray(choices)) {
                        choiceList = choices.map(c => ({ name: c, price: 0 }));
                    } else if (typeof choices === 'object' && choices !== null) {
                        choiceList = Object.entries(choices).map(([name, price]) => ({ name, price: parseInt(price) || 0 }));
                    }

                    if (choiceList.length > 0) {
                        optionsHtml += `
                            <div class="ci-option-group">
                                <label class="ci-option-label">${groupName}</label>
                                <div class="ci-radio-pills">
                                    ${choiceList.map((c, i) => {
                                        let isChecked = false;
                                        if (currentSelections[`opt_${groupName}`]) {
                                            isChecked = currentSelections[`opt_${groupName}`] === c.name;
                                        } else if (defaultSelections[`opt_${groupName}`]) {
                                            isChecked = defaultSelections[`opt_${groupName}`] === c.name;
                                        } else {
                                            isChecked = i === 0; // Fallback if EVERYTHING is out of stock
                                        }

                                        return `
                                        <label class="ci-radio-label">
                                            <input type="radio" name="opt_${groupName}" value="${this.esc(c.name)}" data-price="${c.price}" ${isChecked ? 'checked' : ''} onchange="app.updateModalPrice()">
                                            <span>${this.esc(c.name)} ${c.price > 0 ? `(+₱${c.price})` : ''}</span>
                                        </label>
                                    `}).join('')}
                                </div>
                            </div>
                        `;
                    }
                }
            } catch(e) { console.warn('Invalid options JSON', e); }
        }

        box.innerHTML = `
            <div class="ci-horizontal-layout">
                <div class="ci-left-col">
                    <img src="${this.esc(p.image || '')}" class="ci-hero-thumb" alt="${this.esc(p.name)}">
                </div>
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
                                <input type="number" class="qty-input" value="${this.pendingQty}" min="1" max="${p.stock}" onchange="app.updatePendingQty(this.value)">
                                <button class="qty-step-btn" onclick="app.adjustPendingQty(1)">+</button>
                            </div>
                        </div>
                        <div class="ci-price-wrap">
                            <span class="ci-stock-text">${p.stock} available</span>
                            <span class="ci-total-text">Total: <b id="ci-total-price">₱0.00</b></span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.updateModalPrice(); 

        if (this.user && bayanihanContainer) {
            try {
                await this.loadGroups(); 
                const openGroups = this.bayanihan.list.filter(g => g.status === 'open' && g.my_status === 'approved');
                if (openGroups.length > 0) {
                    bayanihanContainer.innerHTML = `
                        <div style="margin-top:15px; border-top:1px dashed var(--line); padding-top:15px;">
                            <p style="font-size:12px; font-weight:800; color:var(--muted); margin-bottom:8px; text-align:center;">O idagdag sa Bayanihan Cart:</p>
                            <div style="display:flex; gap:8px;">
                                <select id="add-to-bayanihan-select" class="input" style="flex:1; padding:10px; font-size:13px;">
                                    ${openGroups.map(g => `<option value="${g.id}" ${g.id == this._lastGroupId ? 'selected' : ''}>${this.esc(g.name)}</option>`).join('')}
                                </select>
                                <button class="btn btn-leaf" style="padding:0 20px; border-radius:14px; font-size:14px;" onclick="app.confirmAddToBayanihanNew()">Add</button>
                            </div>
                        </div>
                    `;
                }
            } catch(e) { console.warn(e); }
        }
    },

    updateModalPrice() {
        if (!this.pendingCartItem) return;
        let extra = 0;
        const selectedOptions = [];
        const currentSelections = {};

        // 1. Gather currently selected options
        document.querySelectorAll('#add-confirm-item-box input[type="radio"]:checked').forEach(inp => {
            currentSelections[inp.name] = inp.value;
        });

        if (this.pendingCartItem.options) {
            const parsedOpts = JSON.parse(this.pendingCartItem.options);
            for (const groupName of Object.keys(parsedOpts)) {
                if (groupName === '_stocks') continue;
                const checked = document.querySelector(`input[name="opt_${groupName}"]:checked`);
                if (checked) {
                    selectedOptions.push(`${groupName}: ${checked.value}`);
                    extra += Number(checked.dataset.price) || 0;
                }
            }
        }

        this.pendingPriceModifier = extra;
        const varStr = selectedOptions.join(', ');
        this.pendingVariationStock = this.getVariationStock(this.pendingCartItem, varStr);

        // 🟢 NEW: Auto-fix if the current selection is out of stock
        if (this.pendingVariationStock <= 0 && this.pendingCartItem.options) {
            const parsedOpts = JSON.parse(this.pendingCartItem.options);
            const availableCombo = Object.keys(parsedOpts._stocks || {}).find(combo => parseInt(parsedOpts._stocks[combo]) > 0);
            
            if (availableCombo) {
                let changed = false;
                availableCombo.split(', ').forEach(part => {
                    const [k, v] = part.split(': ');
                    const radioName = `opt_${k}`;
                    
                    if (currentSelections[radioName] !== v) {
                        const radio = document.querySelector(`#add-confirm-item-box input[name="${radioName}"][value="${v}"]`);
                        if (radio) {
                            radio.checked = true;
                            changed = true;
                        }
                    }
                });
                
                // If we had to change the selection to a valid one, re-run the calculation
                if (changed) {
                    return this.updateModalPrice(); 
                }
            }
        }
        
        // 2. Update max qty if current qty exceeds new stock
        if (this.pendingQty > this.pendingVariationStock) {
            this.pendingQty = Math.max(1, this.pendingVariationStock);
            const qtyInput = document.querySelector('.qty-input');
            if (qtyInput) qtyInput.value = this.pendingQty;
        }

        // Update stock text
        const stockText = document.querySelector('.ci-stock-text');
        if (stockText) {
            stockText.textContent = `${this.pendingVariationStock} available`;
            stockText.style.color = this.pendingVariationStock <= 0 ? '#e5604d' : 'var(--muted)';
        }
        
        // Update qty input max
        const qtyInput = document.querySelector('.qty-input');
        if (qtyInput) {
            qtyInput.max = this.pendingVariationStock;
        }

        const total = (Number(this.pendingCartItem.price) + extra) * this.pendingQty;
        this.setAnimatedValue('ci-total-price', total);

        // 3. Disable out-of-stock combinations dynamically
        if (this.pendingCartItem.options) {
            const parsedOpts = JSON.parse(this.pendingCartItem.options);
            
            document.querySelectorAll('#add-confirm-item-box input[type="radio"]').forEach(inp => {
                const groupName = inp.name.replace('opt_', '');
                
                const testSelections = { ...currentSelections, [inp.name]: inp.value };
                const testParts = [];
                
                for (const key of Object.keys(parsedOpts)) {
                    if (key === '_stocks') continue;
                    if (testSelections['opt_' + key]) {
                        testParts.push(`${key}: ${testSelections['opt_' + key]}`);
                    }
                }
                
                const testVar = testParts.join(', ');
                const testStock = this.getVariationStock(this.pendingCartItem, testVar);

                const label = inp.closest('label');
                
                // If the hypothetical combination has 0 stock, disable it visually
                if (testStock <= 0) {
                    inp.disabled = true;
                    if (label) label.classList.add('disabled-option');
                } else {
                    inp.disabled = false;
                    if (label) label.classList.remove('disabled-option');
                }
            });
        }
    },

    adjustPendingQty(d) {
        if (!this.pendingCartItem) return;
        this.pendingQty = Math.max(1, Math.min(this.pendingVariationStock, this.pendingQty + d));
        this.renderAddConfirmModal();
    },

    updatePendingQty(val) {
        if (!this.pendingCartItem) return;
        let qty = parseInt(val);
        if (isNaN(qty) || qty < 1) qty = 1;
        if (qty > this.pendingVariationStock) qty = this.pendingVariationStock;
        this.pendingQty = qty;
        this.renderAddConfirmModal();
    },   

    confirmAddToCart(isBuyNow = false) {
        if (!this.pendingCartItem) return;
        const p = this.pendingCartItem;

        const selectedOptions = [];
        let modifier = 0;
        document.querySelectorAll('#add-confirm-item-box input[type="radio"]:checked').forEach(input => {
            const groupName = input.name.replace('opt_', '');
            selectedOptions.push(`${groupName}: ${input.value}`);
            modifier += Number(input.dataset.price) || 0;
        });
        const variationStr = selectedOptions.join(', ');
        const finalPrice = Number(p.price) + modifier; 

        if (this.pendingVariationStock <= 0) {
            this.showToast('Sorry suki, ubos na ang stock para sa combination na ito.');
            return;
        }

        // 🟢 Check if adding this exceeds stock based on what's ALREADY in the cart
        const existingItem = this.cart.find(x => x.id === p.id && (x.variation || '') === variationStr);
        const existingQty = existingItem ? existingItem.qty : 0;
        
        if (existingQty + this.pendingQty > this.pendingVariationStock) {
            const remaining = this.pendingVariationStock - existingQty;
            this.showToast(`Hindi na kasya! May ${existingQty} na sa cart mo, at ${remaining} lang ang pwedeng idagdag.`);
            return;
        }

        // 🟢 BUDGET RESTRICTION CHECK (Now triggers a popup)
        if (this.budget) {
            let newTotal = finalPrice * this.pendingQty;
            if (!isBuyNow) {
                newTotal += this.cart.filter(c => c.selected).reduce((s, x) => s + x.price * x.qty, 0);
            }
            if (newTotal > this.budget) {
                this.showAlert('Budget Exceeded', `Hindi mo na kayang idagdag ang item na ito dahil lalampas na ang iyong gastos sa budget na <b>${this.money(this.budget)}</b>.<br><br>Mangyaring i-adjust ang iyong budget sa cart sidebar o bawasan ang mga napiling item.`);
                return;
            }
        }

        if (isBuyNow) {
            this.cart.forEach(c => c.selected = false);
        }

        const item = this.cart.find(x => x.id === p.id && (x.variation || '') === variationStr);
        
        if (item) {
            // If Buy Now, we reset the quantity. Otherwise, we add to it.
            item.qty = isBuyNow ? this.pendingQty : (item.qty + this.pendingQty);
            item.selected = true;
        } else {
            this.cart.push({ ...p, price: finalPrice, qty: this.pendingQty, selected: true, variation: variationStr });
        }

        this.saveCart();

        // 🟢 NEW: Flying to Cart Animation
        const flyingImg = document.createElement('img');
        flyingImg.src = p.image;
        flyingImg.style.cssText = `
            position: fixed; width: 50px; height: 50px; border-radius: 50%; object-fit: cover;
            z-index: 999999; top: 50%; left: 50%; pointer-events: none;
            transition: all 0.8s cubic-bezier(0.25, 1, 0.5, 1);
            box-shadow: 0 10px 20px rgba(0,0,0,0.3); border: 2px solid var(--brand);
        `;
        document.body.appendChild(flyingImg);

        // Force reflow
        void flyingImg.offsetWidth;

        // Target the cart button in the header
        const cartBtn = document.querySelector('.nav-btn');
        if (cartBtn) {
            const rect = cartBtn.getBoundingClientRect();
            flyingImg.style.top = `${rect.top + (rect.height/2) - 25}px`;
            flyingImg.style.left = `${rect.left + (rect.width/2) - 25}px`;
            flyingImg.style.transform = 'scale(0.2)';
            flyingImg.style.opacity = '0';
        }

        setTimeout(() => flyingImg.remove(), 850);
        this.closeAddModal();

        const badge = document.getElementById('cart-badge');
        if (badge) { badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); }
        
        const varText = variationStr ? ` (${variationStr})` : '';
        this.showToast(`${p.name}${varText} (${this.pendingQty}x) — nasa basket mo na!`);

        if (isBuyNow) {
            this.toggleCart(true);
            setTimeout(() => {
                this.attemptCheckout(); 
            }, 300); 
        }
    },

    closeAddModal() {
        const modal = document.getElementById('add-confirm-modal');
        if (!modal) return;
        modal.classList.add('closing');
        setTimeout(() => { 
            modal.classList.add('hidden'); 
            modal.classList.remove('closing'); 
            this.pendingCartItem = null; 
            this.updateBodyScrollLock();
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
        const cartKey = this.user ? `pk_cart_${this.user.id}` : 'pk_cart_guest';
        
        localStorage.setItem(cartKey, JSON.stringify(this.cart)); 
        
        this.renderCart(); 
        if (this.currentView === 'cart') this.renderCartPage(); 
        if (this.currentView === 'checkout') this.renderCheckoutSummary(); // 🟢 Add this line
    },

    updateCartBudgetUI() {
        const budgetContainer = document.getElementById('cart-budget-mode');
        if (!budgetContainer) return;

        const budget = this.budget;
        const budgetInput = document.getElementById('cart-budget-input');
        
        if (budget && budget > 0) {
            budgetContainer.style.display = 'block';
            
            if (budgetInput && document.activeElement !== budgetInput) {
                budgetInput.value = budget;
            }
            
            const selectedCart = this.cart.filter(c => c.selected);
            const spent = selectedCart.reduce((s, x) => s + x.price * x.qty, 0);
            const remaining = budget - spent;
            
             this.setAnimatedValue('cart-budget-spent', spent);
            
            const remEl = document.getElementById('cart-budget-remaining');
            const bar = document.getElementById('cart-budget-bar');
            
            if (remaining >= 0) {
                remEl.textContent = `${this.money(remaining)} pa!`;
                remEl.style.color = 'var(--leaf)';
                bar.style.background = 'linear-gradient(90deg, #f0a93b, #d95b33)'; // Orange gradient
                bar.style.width = `${Math.min(100, (spent / budget) * 100)}%`;
            } else {
                remEl.textContent = `Lumampas ng ${this.money(Math.abs(remaining))}!`;
                remEl.style.color = '#e5604d';
                bar.style.background = '#e5604d'; // Red for overbudget
                bar.style.width = '100%';
            }
        } else {
            budgetContainer.style.display = 'none';
            if (budgetInput) budgetInput.value = '';
        }
    },

    renderCart() {
        const count = this.cart.reduce((s, x) => s + x.qty, 0);
        const badge = document.getElementById('cart-badge');
        if (badge) badge.textContent = count;
        const itemsDiv = document.getElementById('cart-items');
        const foot = document.getElementById('cart-foot');
        
        const topBar = document.getElementById('cart-sidebar-select-all-container');
        if (topBar) {
            topBar.style.display = this.cart.length ? 'flex' : 'none';
        }

        const selectAllSidebar = document.getElementById('cart-sidebar-select-all');
        if (selectAllSidebar) {
            selectAllSidebar.checked = this.cart.length > 0 && this.cart.every(c => c.selected);
        }

        if (itemsDiv) {
            itemsDiv.innerHTML = this.cart.map((c, i) => {
                const maxStock = this.products.find(x => x.id === c.id)?.stock || 9999;
                return `
                <div class="cart-row-card" style="animation-delay:${i * 80}ms; ${c.selected ? '' : 'opacity: 0.6;'}">
                    <label class="cart-checkbox-wrap" style="margin-right: 0px;">
                        <input type="checkbox" ${c.selected ? 'checked' : ''} onchange="app.toggleCartItem(${c.id}, ${c.variation ? `'${this.esc(c.variation)}'` : 'null'})">
                        <span class="cart-checkbox-custom" style="width: 20px; height: 20px;"></span>
                    </label>
                    <img class="cart-card-thumb" src="${this.esc(c.image || '')}" alt="${this.esc(c.name)}">
                    <div class="cart-card-info">
                        <b class="cart-card-title">${this.esc(c.name)}</b>
                        ${c.variation ? `<small style="display:block; font-size:11px; color:var(--brand); margin-top:2px;">${this.esc(c.variation)}</small>` : ''}
                        <span class="cart-card-price" style="font-size: 14px;">₱${(c.price * c.qty).toFixed(2)}</span>
                    </div>
                    <div class="cart-card-qty" style="gap: 6px;">
                        <button class="qty-circle-btn" style="width: 24px; height: 24px; font-size: 14px;" onclick="app.updateQty(${c.id}, ${c.variation ? `'${this.esc(c.variation)}'` : 'null'}, -1)">−</button>
                        <input type="number" class="qty-input-sm" value="${c.qty}" min="1" max="${maxStock}" onchange="app.updateQtyInput(${c.id}, ${c.variation ? `'${this.esc(c.variation)}'` : 'null'}, this.value)">
                        <button class="qty-circle-btn" style="width: 24px; height: 24px; font-size: 14px;" onclick="app.updateQty(${c.id}, ${c.variation ? `'${this.esc(c.variation)}'` : 'null'}, 1)">+</button>
                        <button class="qty-circle-btn" style="width: 24px; height: 24px; color:#e5604d; border-color:rgba(229,96,77,0.3); margin-left:2px;" onclick="app.removeFromCart(${c.id}, ${c.variation ? `'${this.esc(c.variation)}'` : 'null'})" title="Alisin">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            `}).join('') || this.emptyState('cart', 'Ay, bakante pa ang cart mo!', 'Mukhang wala pang laman ang iyong cart. Mamili na ng paborito mo!', 'Tingnan ang Menu', 'app.toggleCart(); app.scrollToMenu();');
        }
        
        if (foot) foot.style.display = this.cart.length ? '' : 'none';
        const bayBtn = document.getElementById('btn-cart-bayanihan');
        if (bayBtn) bayBtn.innerHTML = this.cart.length > 0 ? 'Convert to Bayanihan Cart 🏘️' : 'Create a Bayanihan Cart 🏘️';

        const selectedCart = this.cart.filter(c => c.selected);
        const subtotal = selectedCart.reduce((s, x) => s + x.price * x.qty, 0);
        const feeSet = this.feeSet;
        const fee = (selectedCart.length && feeSet) ? this.fee : 0;
        const total = subtotal + fee;

        const setText = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
        const setHTML = (id, h) => { const el = document.getElementById(id); if (el) el.innerHTML = h; };

        this.setAnimatedValue('cart-subtotal', subtotal);
        if (feeSet) {
            this.setAnimatedValue('cart-fee', fee);
            this.setAnimatedValue('cart-total', total);
        } else {
            const feeEl = document.getElementById('cart-fee');
            if (feeEl) { feeEl.innerHTML = '<span style="color:var(--muted); font-style:italic; font-weight:700;">--</span>'; feeEl.dataset.val = ''; }
            this.setAnimatedValue('cart-total', subtotal, ' <small style="font-size:10px; color:var(--muted); font-weight:600; font-family:\'Nunito\',sans-serif;">+ shipping</small>');
        }

        this.updateCartBudgetUI();
    },

    async promptBayanihanFromCart() {
        if (!this.user) { this.toggleCart(true); this.showToast('Mag-login muna para makagawa ng Bayanihan Cart.'); this.openAuthModal('signin'); return; }
        if (this.cart.length === 0) { this.toggleCart(true); this.go('bayanihan'); return; }

        await this.loadGroups();
        const openGroups = this.bayanihan.list.filter(g => g.status === 'open' && g.my_status === 'approved');
        const listEl = document.getElementById('existing-groups-list');
        if (openGroups.length > 0) {
            listEl.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
                    <div style="flex:1; height:1px; background:var(--line);"></div><span style="font-size:11px; font-weight:800; color:var(--muted); text-transform:uppercase;">Or add to existing</span><div style="flex:1; height:1px; background:var(--line);"></div>
                </div>
                ${openGroups.map(g => `
                    <button class="btn btn-ghost btn-block" style="margin-bottom:8px; justify-content:space-between; border-color:var(--line); text-align:left; padding:12px 16px;" onclick="app.addCartToExistingBayanihan(${g.id})">
                        <div><b style="color:var(--ink); font-size:14px;">${this.esc(g.name)}</b><br><small style="color:var(--muted); font-size:11px;">Code: ${g.code} · ${g.member_count} member(s)</small></div>
                        <span style="color:var(--brand); font-weight:800; font-size:18px;">→</span>
                    </button>`).join('')}`;
        } else { listEl.innerHTML = ''; }

        // Populate defaults from user profile
        document.getElementById('convert-group-name').value = `Bayanihan Order (${this.user.name.split(' ')[0]})`;
        document.getElementById('bg-convert-recipient').value = this.user.name || '';
        document.getElementById('bg-convert-phone').value = this.user.phone || '';
        
        let addr = { street: '', brgy: '', city: '' };
        if (this.user.address) {
            try { if (this.user.address.trim().startsWith('{')) addr = JSON.parse(this.user.address); else addr.street = this.user.address; } catch(e){}
        }
        document.getElementById('bg-convert-street').value = addr.street || '';

        const citySelect = document.getElementById('bg-convert-city');
        citySelect.innerHTML = '<option value="" disabled selected>Pumili ng Lungsod</option>';
        Object.keys(this.lagunaData).forEach(c => { citySelect.innerHTML += `<option value="${c}" ${addr.city === c ? 'selected' : ''}>${c}</option>`; });
        this.updateModalBrgyDropdown('convert', addr.brgy);

        this.toggleCart(true);
        document.getElementById('bayanihan-convert-modal').classList.remove('hidden');
        this.updateBodyScrollLock();
    },

    async createBayanihanFromCart() {
        const nameInput = document.getElementById('convert-group-name');
        const name = nameInput.value.trim() || `Bayanihan Order (${this.user.name.split(' ')[0]})`;
        
        const customer_name = document.getElementById('bg-convert-recipient').value.trim();
        const phone = document.getElementById('bg-convert-phone').value.trim();
        const city = document.getElementById('bg-convert-city').value;
        const brgy = document.getElementById('bg-convert-brgy').value;
        const street = document.getElementById('bg-convert-street').value.trim();
        const fee = parseInt(document.getElementById('bg-convert-fee').value) || 0;

        if (!customer_name || !phone || !city || !brgy) {
            return this.showToast('Kumpletuhin ang delivery details.');
        }

        // 🟢 Phone Validation
        const cleanPhone = phone.replace(/[\s-]/g, '');
        if (!/^(09|\+639)\d{9}$/.test(cleanPhone)) {
            return this.showToast('Mali ang format ng number. Dapat 09XXXXXXXXX o +639XXXXXXXXX.');
        }

        const address = JSON.stringify({ street, brgy, city });

        this.closeModal('bayanihan-convert-modal');
        
        try {
            const res = await fetch('api.php?action=group-create', { 
                method: 'POST', headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ name, customer_name, phone: cleanPhone, address, fee }) 
            });
            const data = await res.json();
            if (!data.ok) return this.showToast(data.error || 'Failed to create cart');

            const gid = data.id; 
            let successCount = 0;
            
            for (const item of this.cart) {
                const addRes = await fetch('api.php?action=group-add-item', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ group_id: gid, product_id: item.id, qty: item.qty, variation: item.variation || '' }) 
                });
                const addData = await addRes.json(); 
                if (addData.ok) successCount++;
            }
            
            this.cart = []; 
            this.saveCart();
            this.showToast(`Converted ${successCount} item(s) to new Bayanihan Cart!`);
            this.openGroupDetail(gid);
        } catch (e) { 
            this.showToast('Connection error'); 
        }
    },

    async addCartToExistingBayanihan(gid) {
        this.closeModal('bayanihan-convert-modal');
        try {
            let successCount = 0;
            for (const item of this.cart) {
                const addRes = await fetch('api.php?action=group-add-item', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ group_id: gid, product_id: item.id, qty: item.qty, variation: item.variation || '' }) });
                const addData = await addRes.json(); if (addData.ok) successCount++;
            }
            this.cart = []; this.saveCart();
            this.showToast(`Added ${successCount} item(s) to the Bayanihan Cart!`);
            this.openGroupDetail(gid);
        } catch (e) { this.showToast('Connection error'); }
    },

    updateQty(id, variation, d) {
        const i = this.cart.find(x => x.id === id && (x.variation || '') === (variation || ''));
        if (i) {
            const p = this.products.find(x => x.id === id);
            const varStock = this.getVariationStock(p, variation || '');
            if (d > 0 && p && i.qty >= varStock) {
                this.showToast(`Pasensya na, suki — ${varStock} na lang ang stock namin para sa kombinasyong ito.`);
                return;
            }
            if (d > 0 && i.selected && this.budget) {
                const currentTotal = this.cart.filter(c => c.selected).reduce((s, x) => s + x.price * x.qty, 0);
                if (currentTotal + i.price > this.budget) {
                    this.showToast(`Hindi na kasya sa budget mo (₱${this.budget})!`);
                    this.renderCart();
                    if (this.currentView === 'cart') this.renderCartPage();
                    return;
                }
            }
            i.qty += d;
            if (i.qty <= 0) this.cart = this.cart.filter(x => !(x.id === id && (x.variation || '') === (variation || '')));
            this.saveCart();
        }
    },

    updateQtyInput(id, variation, val) {
        const i = this.cart.find(x => x.id === id && (x.variation || '') === (variation || ''));
        if (i) {
            let qty = parseInt(val);
            if (isNaN(qty) || qty < 1) qty = 1;
            const p = this.products.find(x => x.id === id);
            const varStock = this.getVariationStock(p, variation || '');
            if (p && qty > varStock) {
                qty = varStock;
                this.showToast(`Pasensya na, suki — ${varStock} na lang ang stock namin para sa kombinasyong ito.`);
            }
            // Check budget if increasing quantity
            if (i.selected && this.budget && qty > i.qty) {
                const currentTotal = this.cart.filter(c => c.selected).reduce((s, x) => s + x.price * x.qty, 0);
                const newTotal = currentTotal + (i.price * (qty - i.qty));
                if (newTotal > this.budget) {
                    this.showToast(`Hindi na kasya sa budget mo (₱${this.budget})!`);
                    this.renderCart();
                    if (this.currentView === 'cart') this.renderCartPage();
                    return; 
                }
            }
            i.qty = qty;
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
            this.updateBodyScrollLock();
            return; 
        }
        const isOpen = !d.classList.contains('hidden');
        if (!isOpen) { 
            d.classList.remove('hidden', 'closing'); 
            this.updateBodyScrollLock(); 
            return; 
        }
        this._cartBusy = true;
        d.classList.add('closing');
        setTimeout(() => { 
            d.classList.add('hidden'); 
            d.classList.remove('closing'); 
            this._cartBusy = false; 
            this.updateBodyScrollLock(); 
        }, 400); // 🟢 Changed from 800 to 400
    },

    closeModal(id) {
        const m = document.getElementById(id);
        if (!m || m.classList.contains('hidden')) return;
        m.classList.add('closing');
        setTimeout(() => { 
            m.classList.add('hidden'); 
            m.classList.remove('closing'); 
            this.updateBodyScrollLock(); 
        }, 650);
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
        // 🟢 Ensure out-of-stock items are deselected on the full page too
        let needsSave = false;
        this.cart.forEach(c => { 
            if (c.selected === undefined || c.selected === null) { c.selected = true; needsSave = true; }
            const p = this.products.find(x => x.id === c.id);
            const isOutOfStock = !p || p.stock <= 0 || p.stock < c.qty;
            if (isOutOfStock && c.selected) { c.selected = false; needsSave = true; }
        });
        if (needsSave) this.saveCart();

        const allSelected = this.cart.every(c => c.selected);
        if (selectAll) selectAll.checked = allSelected;

        list.innerHTML = this.cart.map(c => {
            const p = this.products.find(x => x.id === c.id);
            const maxStock = p?.stock || 0;
            const isOutOfStock = !p || p.stock <= 0 || p.stock < c.qty;

            return `
            <div class="cart-page-item ${c.selected ? 'selected' : ''}" style="${isOutOfStock ? 'border-color: #e5604d; background: rgba(229, 96, 77, 0.05);' : ''}">
                <label class="cart-checkbox-wrap" style="${isOutOfStock ? 'pointer-events:none; opacity:0.5;' : ''}">
                    <input type="checkbox" ${c.selected ? 'checked' : ''} ${isOutOfStock ? 'disabled' : ''} onchange="app.toggleCartItem(${c.id}, ${c.variation ? `'${this.esc(c.variation)}'` : 'null'})">
                    <span class="cart-checkbox-custom"></span>
                </label>
                <img src="${this.esc(c.image || '')}" class="cart-page-img" alt="${this.esc(c.name)}" style="${isOutOfStock ? 'filter:grayscale(1);' : ''}">
                <div class="cart-page-info">
                    <h4>${this.esc(c.name)}</h4>
                    ${c.variation ? `<p style="font-size:12px; font-weight:800; color:var(--brand); margin-bottom:4px;">${this.esc(c.variation)}</p>` : ''}
                    <p class="cart-page-price">₱${Number(c.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} bawat isa</p>
                    <p class="cart-page-subtotal-inline" style="font-weight:800; color:var(--brand); font-size:15px; margin-top:4px;">₱${(Number(c.price || 0) * c.qty).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    ${isOutOfStock ? `<p style="color: #e5604d; font-weight: 800; font-size: 12px; margin-top: 4px;">⚠️ Kulang/Ubos na stock</p>` : ''}
                </div>
                <div class="cart-page-actions" style="display:flex; align-items:center; gap:8px; margin-left:auto;">
                    <button class="qty-circle-btn" onclick="app.updateQty(${c.id}, ${c.variation ? `'${this.esc(c.variation)}'` : 'null'}, 1)" title="Dagdagan" ${isOutOfStock ? 'disabled style="opacity:0.5;"' : ''}>+</button>
                    <input type="number" class="qty-input-sm" style="font-size:16px; width: 40px;" value="${c.qty}" min="1" max="${maxStock}" ${isOutOfStock ? 'disabled' : ''} onchange="app.updateQtyInput(${c.id}, ${c.variation ? `'${this.esc(c.variation)}'` : 'null'}, this.value)">
                    <button class="qty-circle-btn" onclick="app.updateQty(${c.id}, ${c.variation ? `'${this.esc(c.variation)}'` : 'null'}, -1)" title="Bawasan" ${isOutOfStock ? 'disabled style="opacity:0.5;"' : ''}>−</button>
                    <div style="width:1px; height:20px; background:var(--line); margin: 0 6px;"></div>
                    <button class="qty-circle-btn" onclick="app.removeFromCart(${c.id}, ${c.variation ? `'${this.esc(c.variation)}'` : 'null'})" style="color:#e5604d; border-color:rgba(229,96,77,0.3);" title="Alisin">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>`;
        }).join('') + `<div style="margin-top:20px; text-align:left;"><a href="#" onclick="app.clearCart(); return false;" style="color:var(--muted); font-size:13px; font-weight:700; text-decoration:underline;">I-clear ang buong cart</a></div>`;
        
        this.updateCartPageSummary();
    },

    removeFromCart(id, variation) { this.cart = this.cart.filter(x => !(x.id === id && (x.variation || '') === (variation || ''))); this.saveCart(); },
    clearCart() { 
        if (!this.cart || this.cart.length === 0) {
            return this.showToast('Bakante na ang cart mo, suki!');
        }

        this.showConfirm('Clear Cart', 'Sigurado ka bang i-clear ang buong cart?', () => {
            this.cart = []; 
            this.saveCart(); 
            this.showToast('Na-clear na ang buong cart mo.');
        }, 'Clear');
    },
    viewFullCart() {
        if (!this.cart || this.cart.length === 0) {
            this.toggleCart(true); // Close the sidebar
            return this.showToast('Bakante pa ang cart mo, suki!');
        }
        this.toggleCart(true);
        this.go('cart');
    },
    toggleCartItem(id, variation) { 
        const item = this.cart.find(x => x.id === id && (x.variation || '') === (variation || ''));
        if (item) { 
            // If trying to select, check if it exceeds budget
            if (!item.selected && this.budget) {
                const currentTotal = this.cart.filter(c => c.selected).reduce((s, x) => s + x.price * x.qty, 0);
                const newTotal = currentTotal + (item.price * item.qty);
                if (newTotal > this.budget) {
                    this.showToast(`Hindi na kasya sa budget mo (₱${this.budget})!`);
                    // Force a re-render to immediately uncheck the box visually
                    this.renderCart();
                    if (this.currentView === 'cart') this.renderCartPage();
                    return;
                }
            }
            item.selected = !item.selected; 
            this.saveCart(); 
            this.renderCart();
            if (this.currentView === 'cart') this.renderCartPage();
        } 
    },

    toggleAllCartItems(checked) {
        this.cart.forEach(c => {
            if (checked) {
                const p = this.products.find(x => x.id === c.id);
                const available = p ? this.getVariationStock(p, c.variation || '') : 0;
                // only select rows that still have enough stock
                c.selected = !(!p || available <= 0 || available < c.qty);
            } else {
                c.selected = false;
            }
        });
        this.saveCart();
    },

    updateCartPageSummary() {
        const selected = this.cart.filter(c => c.selected);
        const subtotal = selected.reduce((s, x) => s + x.price * x.qty, 0);
        const feeSet = this.feeSet;
        const fee = (selected.length && feeSet) ? this.fee : 0;
        const total = subtotal + fee;
        const setText = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
        const setHTML = (id, h) => { const el = document.getElementById(id); if (el) el.innerHTML = h; };

        this.setAnimatedValue('cart-page-subtotal', subtotal);
        if (feeSet) {
            this.setAnimatedValue('cart-page-fee', fee);
            this.setAnimatedValue('cart-page-total', total);
        } else {
            const feeEl = document.getElementById('cart-page-fee');
            if (feeEl) { feeEl.innerHTML = '<span style="color:var(--muted); font-style:italic; font-weight:700;">--</span>'; feeEl.dataset.val = ''; }
            this.setAnimatedValue('cart-page-total', subtotal, ' <small style="font-size:10px; color:var(--muted); font-weight:600; font-family:\'Nunito\',sans-serif;">+ shipping</small>');
        }
    },

    toggleProtection(checked) { this.protectionEnabled = checked; this.renderCheckoutSummary(); },

    async attemptCheckout() {
        if (!this.user) {
            this.toggleCart(true);
            this.showToast('Mag-sign in muna para makapag-checkout, suki!');
            this.openAuthModal('signin');
            return;
        }
        
        const selectedCart = this.cart.filter(c => c.selected);
        
        // 🟢 CHECK BUDGET FIRST
        if (this.budget) {
            const subtotal = selectedCart.reduce((s, x) => s + x.price * x.qty, 0);
            if (subtotal > this.budget) {
                this.showAlert('Budget Exceeded', `Lumampas na ang iyong gastos (<b>${this.money(subtotal)}</b>) sa budget na <b>${this.money(this.budget)}</b>.<br><br>Mangyaring bawasan ang mga napiling item o i-adjust ang iyong budget sa cart sidebar.`);
                return;
            }
        }

        // 🟢 USE VARIATION-AWARE STOCK CHECK (matches checkCartStock)
        for (let c of selectedCart) {
            const p = this.products.find(x => x.id === c.id);
            const available = p ? this.getVariationStock(p, c.variation || '') : 0;
            if (!p || available <= 0 || available < c.qty) {
                this.showToast(`Sorry suki, ubos na o kulang ang stock ng ${c.name}${c.variation ? ` (${c.variation})` : ''}.`);
                await this.refreshData(); 
                this.checkCartStock();
                return; 
            }
        }

        const pasoItems = selectedCart.filter(c => (c.category || '').toLowerCase() === 'paso');
        
        if (pasoItems.length === 0) {
            this.toggleCart(true);
            this.go('checkout');
            return;
        }

        let profileCity = '';
        if (this.user.address) {
            try {
                const addr = JSON.parse(this.user.address);
                profileCity = addr.city || '';
            } catch(e) { profileCity = this.user.address; }
        }

        if (profileCity && profileCity.toLowerCase() !== 'calamba') {
            const listContainer = document.getElementById('paso-restriction-items');
            if (listContainer) {
                listContainer.innerHTML = pasoItems.map(c => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed var(--line); last-child: border-bottom: none;">
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <img src="${this.esc(c.image || '')}" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover; background: #fff;">
                            <span style="font-size: 13px; font-weight: 800; color: var(--ink);">${this.esc(c.name)}</span>
                        </div>
                        <span style="font-size: 13px; font-weight: 800; color: var(--brand);">${c.qty}x</span>
                    </div>
                `).join('');
            }
            document.getElementById('paso-restriction-modal').classList.remove('hidden');
            this.updateBodyScrollLock();
        } else {
            this.toggleCart(true);
            this.go('checkout');
        }
    },

    pasoEditLocation() {
        this.closeModal('paso-restriction-modal');
        this.toggleCart(true);
        this.go('account');
    },

    pasoDeleteItems() {
        this.closeModal('paso-restriction-modal');
        this.cart = this.cart.filter(c => (c.category || '').toLowerCase() !== 'paso');
        this.saveCart();
        this.renderCart();
        this.showToast('Inalis ang mga BANGA items sa iyong cart.');
        this.toggleCart(true);
        this.go('checkout');
    },

    pasoConvertToBayanihan() {
        this.closeModal('paso-restriction-modal');
        this.promptBayanihanFromCart();
    },

    pasoUseBayanihan() {
        this.closeModal('paso-restriction-modal');
        this.toggleCart(true);
        this.go('bayanihan');
    },

        prefillCheckout() {
        const guestNote = document.getElementById('co-guest-note');
        const noAddressNote = document.getElementById('co-no-address-note');
        const nameInput = document.getElementById('co-name');
        const phoneInput = document.getElementById('co-phone');
        const streetInput = document.getElementById('co-street');
        const citySelect = document.getElementById('co-city');
        const brgySelect = document.getElementById('co-brgy');

        if (!this.user) {
            // Guest Mode
            if (guestNote) guestNote.classList.remove('hidden');
            if (noAddressNote) noAddressNote.classList.add('hidden');
            return;
        }

        // Logged In Mode
        if (guestNote) guestNote.classList.add('hidden');
        
        if (nameInput) nameInput.value = this.user.name || '';
        if (phoneInput) phoneInput.value = this.user.phone || '';

        if (this.user.address) {
            let addrObj = { street: '', brgy: '', city: '' };
            try { 
                if (this.user.address.trim().startsWith('{')) {
                    addrObj = JSON.parse(this.user.address);
                } else {
                    addrObj.street = this.user.address;
                }
            } catch(e) {}

            // Check if the user's saved city and barangay are in our delivery list
            if (addrObj.city && addrObj.brgy && this.lagunaData[addrObj.city] && this.lagunaData[addrObj.city][addrObj.brgy] !== undefined) {
                if (citySelect) {
                    citySelect.value = addrObj.city;
                    this.updateBrgyDropdown();
                    if (brgySelect) brgySelect.value = addrObj.brgy;
                    this.updateShippingFee();
                }
                if (streetInput) streetInput.value = addrObj.street || '';
                if (noAddressNote) noAddressNote.classList.add('hidden');
            } else {
                // Address is incomplete or outside the delivery area
                if (noAddressNote) noAddressNote.classList.remove('hidden');
                if (streetInput) streetInput.value = addrObj.street || '';
                if (citySelect && addrObj.city) {
                    citySelect.value = addrObj.city;
                    this.updateBrgyDropdown();
                    if (brgySelect && addrObj.brgy) brgySelect.value = addrObj.brgy;
                }
            }
        } else {
            if (noAddressNote) noAddressNote.classList.remove('hidden');
        }
    },

        renderCheckoutSummary() {
        const el = document.getElementById('checkout-summary');
        if (!el) return;

        // 🟢 Capture current values before re-rendering to use as animation start points
        const oldSubtotal = parseFloat(document.getElementById('co-subtotal')?.dataset.val) || 0;
        const oldFee = parseFloat(document.getElementById('co-fee')?.dataset.val) || 0;
        const oldProt = parseFloat(document.getElementById('co-prot')?.dataset.val) || 0;
        const oldTotal = parseFloat(document.getElementById('co-total')?.dataset.val) || 0;

        let needsSave = false;
        this.cart.forEach(c => { if (c.selected === undefined) { c.selected = true; needsSave = true; } });
        if (needsSave) this.saveCart();

        if (this.cart.length > 0 && !this.cart.some(c => c.selected) && this.currentView === 'checkout') {
            // intentionally do NOT auto-reselect; show empty state instead
        }

        const selectedCart = this.cart.filter(c => c.selected);
        const subtotal = selectedCart.reduce((s, x) => s + x.price * x.qty, 0);
        const feeSet = this.feeSet;
        const fee = (selectedCart.length && feeSet) ? this.fee : 0;
        const protectionFee = this.protectionEnabled ? Math.ceil(subtotal / 200) * 50 : 0;

        if (!selectedCart.length) {
            el.innerHTML = this.emptyState('cart', 'Walang napiling item', 'Bumalik ka muna sa cart at pumili ng item.', 'Balik sa Cart', 'app.go(\'cart\')');
        } else {
            // Render HTML with IDs for the numbers
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
                        <span class="protection-label"><b>Delivery Protection</b><small>+${this.money(Math.ceil(subtotal / 200) * 50)} (₱50 per ₱200 subtotal)</small></span>
                    </label>
                </div>
                <div class="sum-totals">
                    <div class="sum-row"><span>Subtotal</span><span id="co-subtotal">${this.money(subtotal)}</span></div>
                    <div class="sum-row"><span>Shipping fee</span><span id="co-fee">${feeSet ? this.money(fee) : '<span style="color:var(--muted); font-style:italic; font-weight:700;">--</span>'}</span></div>
                    ${this.protectionEnabled ? `<div class="sum-row"><span>Protection fee</span><span id="co-prot">${this.money(protectionFee)}</span></div>` : ''}
                    <div class="sum-row total"><span>Kabuuan</span><span id="co-total">${feeSet ? this.money(subtotal + fee + protectionFee) : this.money(subtotal + protectionFee) + ' <small style="font-size:11px;color:var(--muted);font-weight:600;font-family:\'Nunito\',sans-serif;">+ shipping</small>'}</span></div>
                </div>`;

            // 🟢 Feed the old values and trigger the animations
            const subEl = document.getElementById('co-subtotal');
            if (subEl) subEl.dataset.val = oldSubtotal;
            this.setAnimatedValue('co-subtotal', subtotal);

            const feeEl = document.getElementById('co-fee');
            if (feeEl) {
                if (feeSet) {
                    feeEl.dataset.val = oldFee;
                    this.setAnimatedValue('co-fee', fee);
                } else {
                    feeEl.dataset.val = '';
                }
            }

            const protEl = document.getElementById('co-prot');
            if (protEl) {
                protEl.dataset.val = oldProt;
                this.setAnimatedValue('co-prot', protectionFee);
            }

            const totEl = document.getElementById('co-total');
            if (totEl) {
                totEl.dataset.val = oldTotal;
                this.setAnimatedValue('co-total', subtotal + fee + protectionFee, feeSet ? '' : ' <small style="font-size:11px;color:var(--muted);font-weight:600;font-family:\'Nunito\',sans-serif;">+ shipping</small>');
            }
        }
        
        const amt = document.getElementById('gcash-amount');
        if (amt) amt.textContent = feeSet ? this.money(subtotal + fee + protectionFee) : this.money(subtotal + protectionFee) + ' + shipping';
    },

    selectPayment(method) {
        document.getElementById('co-payment').value = method;
        document.getElementById('pay-cod').classList.toggle('active', method === 'cod');
        document.getElementById('pay-gcash').classList.toggle('active', method === 'gcash');
        document.getElementById('gcash-box').classList.toggle('open', method === 'gcash');
        document.getElementById('co-foot-note').textContent = method === 'gcash' ? 'I-upload muna ang screenshot ng GCash payment bago ipadala ang order.' : 'Magbabayad ka pag dating ng rider. Salamat sa tiwala, suki!';
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
                canvas.width = img.width * scale; canvas.height = img.height * scale;
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                this.gcashBase64 = canvas.toDataURL('image/jpeg', 0.7);
                const prev = document.getElementById('gcash-preview'); prev.src = this.gcashBase64; prev.style.display = 'block';
                const drop = document.getElementById('gcash-drop'); drop.classList.add('has-file'); drop.classList.remove('invalid');
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
            this.deliveryFeesRaw = data.deliveryFees || [];
            this.lagunaData = {};
            
            const ndata = data.notifications || [];
            const oldIds = new Set((this.notifications || []).map(n => Number(n.id)));
            const newNotifs = ndata.filter(n => !oldIds.has(Number(n.id)) && !Number(n.is_read));

            this.notifications = ndata;
            
            this.deliveryFeesRaw.forEach(f => { if (!this.lagunaData[f.city]) this.lagunaData[f.city] = {}; this.lagunaData[f.city][f.barangay] = parseInt(f.fee); });
            this.updateFaqDeliveryInfo(); 
            this.renderMenu(); 
            this.initMenuFilters();
            this.renderCart(); 
            this.renderCarousel();
            this.updateNotifBadge();

            if (newNotifs.length > 0) {
                const latest = newNotifs[0];
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = latest.message;
                const textMsg = tempDiv.textContent || tempDiv.innerText || "";
                this.showToast(`🔔 ${textMsg}`, true);
            }
        } catch (e) { console.warn('Refresh failed', e); }
    },

    updateFaqDeliveryInfo() {
        if (!this.deliveryFeesRaw || this.deliveryFeesRaw.length === 0) return;
        const fees = this.deliveryFeesRaw.map(f => parseInt(f.fee));
        const minFee = Math.min(...fees); const maxFee = Math.max(...fees);
        const uniqueCities = [...new Set(this.deliveryFeesRaw.map(f => f.city))];
        let citiesStr = '';
        if (uniqueCities.length > 1) citiesStr = uniqueCities.slice(0, -1).join(', ') + ', at ' + uniqueCities[uniqueCities.length - 1];
        else if (uniqueCities.length === 1) citiesStr = uniqueCities[0];

        const minEl = document.getElementById('faq-min-fee'); const maxEl = document.getElementById('faq-max-fee'); const citiesEl = document.getElementById('faq-delivery-cities');
        if (minEl) minEl.textContent = this.money(minFee);
        if (maxEl) maxEl.textContent = this.money(maxFee);
        if (citiesEl) citiesEl.textContent = citiesStr;
        const btn = document.getElementById('faq-toggle-fees-btn');
        if (btn) btn.style.display = this.user ? 'inline-flex' : 'none';
    },

    toggleFaqFees(e) {
        if (e) e.stopPropagation();
        if (!this.user) return;
        const container = document.getElementById('faq-fees-container');
        const isOpening = container.classList.contains('hidden');
        if (isOpening) { this.renderFaqFeesTable(); container.classList.remove('hidden'); } else { container.classList.add('hidden'); }
        const faqBody = container.closest('.faq-recipe-body');
        if (faqBody && faqBody.parentElement.classList.contains('active')) setTimeout(() => { faqBody.style.maxHeight = faqBody.scrollHeight + 'px'; }, 50);
    },

    renderFaqFeesTable() {
        const container = document.getElementById('faq-fees-container');
        if (!container) return;
        const grouped = {};
        this.deliveryFeesRaw.forEach(f => { if (!grouped[f.city]) grouped[f.city] = []; grouped[f.city].push(f); });
        let html = '<table style="width:100%; border-collapse:collapse; font-size:13px;">';
        html += '<thead><tr style="background:var(--surface2); color:var(--ink); position:sticky; top:0; z-index:10;"><th style="padding:8px 12px; text-align:left; border-bottom:2px solid var(--line);">Lungsod</th><th style="padding:8px 12px; text-align:left; border-bottom:2px solid var(--line);">Barangay</th><th style="padding:8px 12px; text-align:right; border-bottom:2px solid var(--line);">Fee</th></tr></thead><tbody>';
        Object.keys(grouped).sort().forEach(city => {
            const brgys = grouped[city].sort((a, b) => a.barangay.localeCompare(b.barangay));
            brgys.forEach((b, index) => {
                html += `<tr style="border-bottom:1px solid var(--line); background:${index % 2 === 0 ? 'transparent' : 'var(--surface2)'};">`;
                html += `<td style="padding:8px 12px; font-weight:${index === 0 ? '800' : '400'}; color:${index === 0 ? 'var(--brand)' : 'var(--ink)'};">${index === 0 ? city : ''}</td>`;
                html += `<td style="padding:8px 12px; color:var(--muted); font-weight:600;">${b.barangay}</td>`;
                html += `<td style="padding:8px 12px; text-align:right; font-weight:800; color:var(--leaf);">${this.money(b.fee)}</td>`;
                html += `</tr>`;
            });
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    },

    async submitOrder() {
        if (!this.user) {
            this.showToast('Mag-sign in muna para makapag-order, suki!');
            this.openAuthModal('signin');
            return;
        }
        if (this.orderBusy) return;
        const selectedCart = this.cart.filter(c => c.selected);
        if (!selectedCart.length) return this.showToast('Walang napiling item, suki!');

        const val = id => document.getElementById(id).value.trim();
        const payment = val('co-payment') === 'gcash' ? 'gcash' : 'cod';
        const name = val('co-name'), phone = val('co-phone'), city = val('co-city'), brgy = val('co-brgy'), street = val('co-street');

        if (!name) return this.fieldFail('co-name', 'Sino ang tatanggap, suki? Ilagay ang pangalan.');
        const cleanPhone = phone.replace(/[\s-]/g, '');
        if (!/^(09|\+639)\d{9}$/.test(cleanPhone)) return this.fieldFail('co-phone', 'Mali ang format ng number. Dapat 09XXXXXXXXX o +639XXXXXXXXX.');
        if (!city) return this.fieldFail('co-city', 'Saan namin ihahatid? Pumili ng lungsod.');
        if (!brgy) return this.fieldFail('co-brgy', 'Pumili ng barangay.');

        const hasPaso = selectedCart.some(c => (c.category || '').toLowerCase() === 'paso');
        if (hasPaso && city !== 'Calamba') return this.fieldFail('co-city', 'Ang BANGA (pagkain) items ay pwede lang i-deliver sa loob ng Calamba, Laguna.');
        if (payment === 'gcash' && !this.gcashBase64) return this.fieldFail('gcash-drop', 'I-upload muna ang screenshot ng GCash receipt.');

        const address = JSON.stringify({ street, brgy, city });
        const snapshot = selectedCart.map(c => ({ ...c }));
        const subtotal = snapshot.reduce((s, x) => s + x.price * x.qty, 0);
        const protectionFee = this.protectionEnabled ? Math.ceil(subtotal / 200) * 50 : 0;

        const payload = {
            items: selectedCart.map(c => ({ id: c.id, qty: c.qty, variation: c.variation || '', price: c.price })),
            name, phone: cleanPhone, address, payment, proof: this.gcashBase64, fee: this.fee, 
            protection_fee_enabled: this.protectionEnabled
        };

        const btn = document.getElementById('co-submit');
        this.orderBusy = true;
        this.setBtnLoading(btn, true);
        
        try {
            const res = await fetch('api.php?action=place-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await res.json();

            if (data.ok) {
            this.lastOrder = { id: data.order_id, items: snapshot, subtotal, fee: this.fee, protectionFee, total: subtotal + this.fee + protectionFee, name, address, payment };
            this.cart = this.cart.filter(c => !c.selected); this.saveCart();
            this.gcashBase64 = ''; this.protectionEnabled = false;
            this.resetCheckoutForm(); this.go('success'); this.refreshData();
        
            this.triggerHappyBot();
        } else { 
                this.showToast(data.error || 'Hindi natuloy ang order. Subukan ulit, suki.'); 
            }
            if (data.error && (data.error.includes('stock') || data.error.includes('Kulang'))) {
                await this.refreshData();
                this.checkCartStock();
            }
        } catch (err) { this.showToast('Walang signal sa server. Try mo ulit mamaya.'); } 
        finally { 
            this.orderBusy = false; 
            this.setBtnLoading(btn, false); 
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
        this.protectionEnabled = false; this.selectPayment('cod'); this.updateShippingFee();
    },

    renderSuccess() {
        const box = document.getElementById('success-body');
        if (!box) return;
        const o = this.lastOrder;
        if (!o) { box.innerHTML = this.emptyState('orders', 'Wala pang bagong order', 'Kapag nakapag-order ka na, dito mo makikita ang biyahe nito.', 'Mamili na', 'app.scrollToMenu()'); return; }
        
        const ic = {
            clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
            box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
            bike: '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-8h5l3 8M10 9H8"/>',
            home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-6h6v6"/>'
        };
        const steps = [['clock', 'Pending', 'Natanggap'], ['box', 'Shipping', 'Naka-package'], ['bike', 'Out for Delivery', 'Palapit na!'], ['home', 'Delivered', 'Dumating na!']];
        const who = this.esc(o.name.split(/\s+/)[0]);

        box.innerHTML = `
            <div class="success-hero">
                <div class="check-badge"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                <h1>Salamat, ${who}!</h1>
                <p>Natanggap na namin ang <b>Order #${this.esc(o.id)}</b>. Inihahanda na namin ito nang buong puso.</p>
            </div>
            <div class="tracker-card">
                <h3>Ang biyahe ng order mo</h3>
                <div class="tracker">${steps.map((st, i) => `<div class="t-step ${i === 0 ? 'active' : ''}"><div class="t-dot"><svg viewBox="0 0 24 24">${ic[st[0]]}</svg></div><b>${st[1]}</b><small>${st[2]}</small></div>`).join('')}</div>
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
            ${this.user ? '' : '<p class="success-tip">Tip: <a href="#" onclick="app.go(\'auth\'); return false;">Gumawa ng account</a> para ma-track at makatanggap ng abiso sa susunod mong order!</p>'}`;
    },

    renderOrders() {
        const list = document.getElementById('orders-list');
        if (!this.user) { 
            this.showToast('Mag-sign in muna para makita ang orders mo, suki!');
            this.openAuthModal('signin');
            return; 
        }
        if (!this.user) { list.innerHTML = this.emptyState('login', 'Mag-login muna tayo, suki', 'Para makita ang mga order mo, mag-sign in sa iyong account.', 'Mag-sign in', 'app.handleAuth()'); return; }

        const displayOrders = this.user.role === 'admin' ? this.orders.filter(o => o.user_id === this.user.id) : this.orders;

        list.innerHTML = displayOrders.map(o => {
            let statusClass = 'status-pending';
            if (o.status === 'Preparing') statusClass = 'status-preparing';
            if (o.status === 'Shipping') statusClass = 'status-shipping';
            if (o.status === 'Out for Delivery') statusClass = 'status-out';
            if (o.status === 'Cancelled') statusClass = 'status-out';
            if (o.status === 'Delivered') statusClass = 'status-delivered';

            return `
            <div class="card order-card">
                <div class="order-header">
                    <div class="order-icon-title">
                        <div class="order-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></div>
                        <div><h3>Order #${o.id}</h3><p class="order-subtitle">Salamat sa pagtangkilik!</p></div>
                    </div>
                    <span class="order-status ${statusClass}">${this.esc(o.status)}</span>
                </div>

                <div class="order-body">
                    <div class="order-items-list">
                        ${(() => { const grouped = {}; o.items.forEach(i => { const key = i.product_id + '|' + (i.variation || ''); if (!grouped[key]) grouped[key] = { ...i }; else grouped[key].qty += i.qty; });
                            return Object.values(grouped).map(i => `<div class="order-item-row"><div class="order-item-info"><span class="item-qty">${i.qty}x</span><span class="item-name">${this.esc(i.name)} ${i.variation ? `<small style="color:var(--brand); font-size:11px;">(${this.esc(i.variation)})</small>` : ''}</span></div><span class="item-total">${this.money(i.price * i.qty)}</span></div>`).join(''); })()}
                    </div>
                    <div class="order-summary-row"><span>Delivery Fee</span><span>${this.money(o.delivery_fee || 50)}</span></div>
                    ${(o.protection_fee && o.protection_fee > 0) ? `<div class="order-summary-row"><span>Protection Fee</span><span>${this.money(o.protection_fee)}</span></div>` : ''}
                </div>

                ${o.is_group_order ? `<div style="padding:12px; background:color-mix(in srgb, var(--leaf) 10%, transparent); border-left:3px solid var(--leaf); border-radius:8px; font-size:11px; cursor:pointer; transition: all 0.2s;" onclick="app.viewAdminGroup(${o.group_cart_id})" onmouseover="this.style.background='color-mix(in srgb, var(--leaf) 20%, transparent)'; this.style.transform='translateX(4px)';" onmouseout="this.style.background='color-mix(in srgb, var(--leaf) 10%, transparent)'; this.style.transform='translateX(0)';"><div style="font-weight:800; color:var(--leaf); text-transform:uppercase; margin-bottom:4px; display:flex; justify-content:space-between; align-items:center;"><span>🏘️ Bayanihan Cart</span><span style="font-size:10px; background:var(--leaf); color:#fff; padding:2px 8px; border-radius:4px;">Click to View Details →</span></div><div style="color:var(--ink); font-weight:600; line-height:1.5;">${(o.contributors || []).map(c => `${this.esc(c.name)}${c.paid_amount ? ` (${this.money(c.paid_amount)})` : ''}`).join(' · ') || 'N/A'}</div></div>` : ''}
                ${o.refund_status === 'requested' ? `<div style="padding:12px; background:rgba(240,169,59,0.15); border:1px solid rgba(240,169,59,0.4); border-radius:8px; font-size:12px;"><div style="font-weight:800; color:#d98c1d; text-transform:uppercase; margin-bottom:6px;">⏳ Refund Pending</div><div style="color:var(--ink); font-weight:600; margin-bottom:8px;"><b>Reason:</b> ${this.esc(o.refund_reason || 'N/A')}</div>${o.refund_proof ? `<button class="btn btn-ghost" style="padding:4px 8px; font-size:11px;" onclick="app.viewProof('${o.refund_proof}')">View Proof</button>` : ''}</div>` : ''}
                ${o.refund_status === 'approved' ? `<div style="padding:8px; background:rgba(63,122,69,0.1); color:var(--leaf); border-radius:8px; font-size:11px; font-weight:800; text-align:center;">✓ Refund Approved</div>` : ''}
                ${o.refund_status === 'rejected' ? `<div style="padding:8px; background:rgba(229,96,77,0.1); color:#e5604d; border-radius:8px; font-size:11px; font-weight:800; text-align:center;">✕ Refund Rejected</div>` : ''}

                <div class="order-footer" style="flex-wrap: wrap; gap: 10px;">
                    <div style="display:flex; align-items:center; gap:10px;"><span class="footer-label">Kabuuan</span><span class="footer-total">${this.money(o.total)}</span></div>
                    ${o.status === 'Cancelled' ? `
                        <div style="padding:16px; background:rgba(229,96,77,0.05); border:1px solid rgba(229,96,77,0.3); border-radius:12px; margin: 12px 24px;">
                            <h4 style="color:#e5604d; font-weight:800; margin-bottom:8px;">Order Cancelled</h4>
                            <p style="font-size:13px; color:var(--ink); font-weight:600; margin-bottom:12px;"><b>Admin Reason:</b> ${this.esc(o.cancel_reason || 'No reason provided')}</p>
                            
                            ${o.appeal_status === 'none' ? `<button class="btn btn-brand" style="padding:6px 16px; font-size:12px; border-radius:99px;" onclick="app.openAppealModal(${o.id}, '${this.esc(o.cancel_reason || '')}')">Appeal Cancellation</button>` : ''}
                            ${o.appeal_status === 'requested' ? `<span style="color:#d98c1d; font-weight:800; font-size:12px;">Appeal Pending Admin Review...</span>` : ''}
                            ${o.appeal_status === 'approved' ? `<span style="color:var(--leaf); font-weight:800; font-size:12px;">✓ Appeal Approved (Order Restored)</span>` : ''}
                            ${o.appeal_status === 'rejected' ? `<span style="color:#e5604d; font-weight:800; font-size:12px;">✕ Appeal Rejected</span>` : ''}
                        </div>
                    ` : ''}
                    ${o.status === 'Delivered' ? ` ${(() => {
                            const deliveryTime = o.delivered_at ? new Date(o.delivered_at).getTime() : new Date(o.created_at).getTime();
                            const hoursElapsed = (Date.now() - deliveryTime) / (1000 * 60 * 60);
                            const hasPaso = o.items.some(i => { const p = this.products.find(x => x.id === i.product_id); return p && p.category === 'paso'; });
                            const isExpired = hasPaso ? hoursElapsed > 24 : hoursElapsed > (24 * 7);
                            if (o.refund_status === 'requested') return '<span style="background:rgba(240,169,59,0.15); color:#d98c1d; padding:6px 12px; border-radius:99px; font-size:12px; font-weight:800; border:1px solid rgba(240,169,59,0.4);">⏳ Refund Pending</span>';
                            else if (o.refund_status === 'approved') return '<span style="background:rgba(63,122,69,0.15); color:var(--leaf); padding:6px 12px; border-radius:99px; font-size:12px; font-weight:800; border:1px solid rgba(63,122,69,0.4);">✓ Refund Approved</span>';
                            else if (o.refund_status === 'rejected') return '<span style="background:rgba(229,96,77,0.15); color:#e5604d; padding:6px 12px; border-radius:99px; font-size:12px; font-weight:800; border:1px solid rgba(229,96,77,0.4);">✕ Refund Rejected</span>';
                            else if (isExpired) return '<span style="color:var(--muted); font-size:12px; font-weight:700; padding:6px 12px;">Refund period expired</span>';
                            else return `<button class="btn btn-ghost" style="padding:6px 12px; font-size:12px; border-color:#e5604d; color:#e5604d;" onclick="app.openRefundModal(${o.id})">Request Refund</button>`;
                        })()}` : ''}
                </div>
            </div>`;
        }).join('') || this.emptyState('orders', 'Wala ka pang individual order', 'Wala pang laman ang listahan mo. Tara, mamili tayo nang dahan-dahan!', 'Mamili na', 'app.scrollToMenu()');

        if (list.innerHTML) {
            list.innerHTML += `<div class="card" style="text-align:center; border-color:var(--leaf); padding:24px; margin-top:20px; background:linear-gradient(135deg, var(--surface2), var(--surface));"><h3 style="color:var(--leaf); margin-bottom:8px;">🏘️ Gusto mo bang mag-order kasama ang tropa?</h3><p style="color:var(--muted); font-size:14px; margin-bottom:16px;">Gamitin ang <b>Bayanihan Cart</b> para sabay-sabay kayong umorder at awtomatikong hatiin ang bayad!</p><button class="btn btn-leaf" onclick="app.navTo('bayanihan')">Try Bayanihan Cart</button></div>`;
        }
    },

    renderAccount() {
        if (!this.user) { 
            this.showToast('Mag-sign in muna para ma-access ang account mo, suki!');
            this.openAuthModal('signin'); 
            return; 
        }
        document.getElementById('acc-name').value = this.user.name || '';
        document.getElementById('acc-email').value = this.user.email || '';
        document.getElementById('acc-phone').value = this.user.phone || '';

        let addrObj = { street: '', brgy: '', city: '' };
        try { if (this.user.address && this.user.address.trim().startsWith('{')) addrObj = JSON.parse(this.user.address); else if (this.user.address) { addrObj.street = this.user.address; if (this.user.address.toLowerCase().includes('calamba')) addrObj.city = 'Calamba'; } } catch(e) {}

        const citySelect = document.getElementById('acc-city');
        citySelect.innerHTML = '<option value="" disabled selected>Pumili ng Lungsod</option>';
        Object.keys(this.lagunaData).forEach(c => { citySelect.innerHTML += `<option value="${c}">${c}</option>`; });
        citySelect.value = addrObj.city || '';
        this.updateAccBrgyDropdown(addrObj.brgy || '');
        document.getElementById('acc-street').value = addrObj.street || '';

        const logsEl = document.getElementById('account-order-logs');
        if (!this.orders.length) { logsEl.innerHTML = '<p style="color:var(--muted); font-size:13px; text-align:center; padding:10px;">Wala ka pang order, suki.</p>'; } 
        else {
            logsEl.innerHTML = this.orders.slice(0, 3).map(o => `<div class="acc-order-row"><div><b>Order #${o.id}</b><div style="font-size:11px; color:var(--muted);">${o.items.length} item(s)</div></div><div style="text-align:right;"><div style="font-weight:800; color:var(--brand); font-size:14px;">${this.money(o.total)}</div><div style="font-size:10px; font-weight:800; text-transform:uppercase; color:${o.status === 'Pending' ? '#f0a93b' : '#85b56d'};">${o.status}</div></div></div>`).join('');
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
        
        // 🟢 Name Validation (No numbers, no special characters except . and -)
        const nameRegex = /^[a-zA-Z\s\.\-]+$/;
        if (!nameRegex.test(name)) return this.showToast('Mali ang format ng pangalan. Letters, spaces, hyphens, at periods lang ang pwede.');

        if (!/^\S+@\S+\.\S+$/.test(email)) return this.showToast('Mali ang email format.');
        let cleanPhone = phone.replace(/[\s-]/g, '');
        if (cleanPhone && !/^(09|\+639)\d{9}$/.test(cleanPhone)) return this.showToast('Mali ang format ng contact number. Dapat 09XXXXXXXXX o +639XXXXXXXXX.');

        const address = (city || brgy || street) ? JSON.stringify({ street, brgy, city }) : '';

        this.showConfirm('Save Profile', 'I-save ang mga pagbabago sa iyong profile?', async () => {
            try {
                const res = await fetch('api.php?action=update-profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, phone: cleanPhone, address }) });
                const data = await res.json();
                if (data.ok) { this.showToast('Updated na ang profile mo, suki!'); await this.refreshData(); this.updateNavDrawerAuthUI(); } 
                else { this.showToast(data.error || 'Hindi na-update ang profile.'); }
            } catch (e) { this.showToast('Walang signal sa server. Try mo ulit mamaya.'); }
        }, 'Save');
    },

    toggleAccPasswords() {
        const p1 = document.getElementById('acc-current-pass');
        const p2 = document.getElementById('acc-new-pass');
        const p3 = document.getElementById('acc-confirm-pass');

        if (!p1 || !p2 || !p3) return;

        // Check the current state
        const show = p1.type === 'password';

        // Toggle input types
        p1.type = show ? 'text' : 'password';
        p2.type = show ? 'text' : 'password';
        p3.type = show ? 'text' : 'password';

        // Toggle icons globally for the account section
        document.querySelectorAll('.acc-eye-show').forEach(el => el.style.display = show ? 'none' : 'block');
        document.querySelectorAll('.acc-eye-hide').forEach(el => el.style.display = show ? 'block' : 'none');
    },

    async changePassword() {
        const current = document.getElementById('acc-current-pass').value;
        const newPass = document.getElementById('acc-new-pass').value;
        const confirmPass = document.getElementById('acc-confirm-pass').value;

        const triggerError = (id, msg) => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.remove('invalid');
                void el.offsetWidth; 
                el.classList.add('invalid');
                el.focus();
                const clearError = () => { el.classList.remove('invalid'); el.removeEventListener('input', clearError); };
                el.addEventListener('input', clearError);
            }
            this.showToast(msg);
        };

        if (!current) return triggerError('acc-current-pass', 'Ilagay ang kasalukuyang password.');
        
        if (!this.updatePasswordUI(newPass, 'acc')) {
            return triggerError('acc-new-pass', 'New Password does not meet all requirements.');
        }
        
        if (newPass !== confirmPass) {
            return triggerError('acc-confirm-pass', 'Hindi nagtutugma ang new password at confirm password.');
        }

        this.showConfirm('Update Password', 'Sigurado ka bang gusto mong palitan ang iyong password?', async () => {
            try {
                const res = await fetch('api.php?action=change-password', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ current, new: newPass }) 
                });
                const data = await res.json();
                
                if (data.ok) { 
                    this.showToast('Matagumpay na nabago ang password!'); 
                    document.getElementById('acc-current-pass').value = ''; 
                    document.getElementById('acc-new-pass').value = ''; 
                    document.getElementById('acc-confirm-pass').value = ''; 
                    document.getElementById('acc-pass-req').style.display = 'none';
                } else { 
                    triggerError('acc-current-pass', data.error || 'Mali ang kasalukuyang password.'); 
                }
            } catch (e) { 
                this.showToast('Walang koneksyon sa server.'); 
            }
        }, 'Update');
    },

    openDeleteAccountModal() {
        const passInput = document.getElementById('del-acc-pass');
        const confirmCheck = document.getElementById('del-acc-confirm');
        if (passInput) passInput.value = '';
        if (confirmCheck) confirmCheck.checked = false;

        document.getElementById('delete-account-modal').classList.remove('hidden');
        setTimeout(() => { if (passInput) passInput.focus(); }, 120);
        this.updateBodyScrollLock();
    },

    async submitDeleteAccount() {
        const password = (document.getElementById('del-acc-pass').value || '').trim();
        const confirmed = document.getElementById('del-acc-confirm').checked;

        if (!password) return this.showToast('Ilagay ang iyong password para makumpirma.');
        if (!confirmed) return this.showToast('Kailangan mong i-check ang confirmation box.');

        const btn = document.getElementById('del-acc-submit');
        const ogHtml = btn.innerHTML;
        this.setBtnLoading(btn, true, 'Binubura...');

        try {
            const res = await fetch('api.php?action=delete-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();

            if (data.ok) {
                this.closeModal('delete-account-modal');
                this.showToast('Nabura na ang iyong account. Salamat sa pagtangkilik sa PiliKart!');
                // Reload after a short delay so the toast is visible
                setTimeout(() => location.reload(), 1800);
            } else {
                this.showToast(data.error || 'Hindi nabura ang account.');
                this.setBtnLoading(btn, false, ogHtml);
            }
        } catch (e) {
            this.showToast('Walang koneksyon sa server. Subukan muli.');
            this.setBtnLoading(btn, false, ogHtml);
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
        document.querySelectorAll('#view-admin .admin-tab-btn').forEach(b => { b.className = 'btn btn-ghost admin-tab-btn'; });
        btn.className = 'btn btn-brand admin-tab-btn';
        
        // 🟢 Added 'contacts' to the array
        ['orders', 'stock', 'users', 'analytics', 'bayanihan', 'fees', 'contacts'].forEach(t => { const el = document.getElementById('admin-' + t); if (el) el.classList.add('hidden'); });
        
        const target = document.getElementById('admin-' + tab);
        if (target) target.classList.remove('hidden');
        if (tab === 'users') this.renderAdminUsers();
        if (tab === 'stock') this.renderAdminInventory();
        if (tab === 'analytics') this.renderAdminAnalytics();
        if (tab === 'bayanihan') this.renderAdminBayanihan();
        if (tab === 'fees') this.renderAdminFees(); 
        if (tab === 'contacts') this.renderAdminContacts(); // 🟢 Added this
    },

toggleAdvancedMenuFilters(btn) {
    const panel = document.getElementById('advanced-filter-panel');
    if (!panel) return;
    
    const isOpen = panel.dataset.open === 'true';
    
    if (isOpen) {
        panel.dataset.open = 'false';
        panel.style.gridTemplateRows = '0fr';
        panel.style.opacity = '0';
        if (btn) btn.classList.remove('active');
    } else {
        panel.dataset.open = 'true';
        panel.style.gridTemplateRows = '1fr';
        panel.style.opacity = '1';
        if (btn) btn.classList.add('active');
    }
},

    filterAdminOrders() {
        this.adminOrderFilter.search = document.getElementById('admin-order-search').value.toLowerCase();
        this.adminOrderFilter.status = document.getElementById('admin-order-status').value;
        this.adminOrderFilter.dept = document.getElementById('admin-order-dept').value;
        this.adminOrderFilter.type = document.getElementById('admin-order-type').value;
        this.renderAdminOrders();
    },

    renderAdminOrders() {
        const grid = document.getElementById('admin-orders-grid');
        if (!grid) return;

        const filteredOrders = this.orders.filter(o => {
            const formattedAddr = this.formatAddress(o.address);
            const customerName = (o.customer_name || '').toLowerCase();
            const searchMatch = String(o.id).includes(this.adminOrderFilter.search) || customerName.includes(this.adminOrderFilter.search) || formattedAddr.toLowerCase().includes(this.adminOrderFilter.search) || (o.phone && o.phone.includes(this.adminOrderFilter.search));
            const statusMatch = this.adminOrderFilter.status === 'all' || o.status === this.adminOrderFilter.status;
            let typeMatch = true;
            if (this.adminOrderFilter.type === 'bayanihan') typeMatch = !!o.is_group_order;
            if (this.adminOrderFilter.type === 'individual') typeMatch = !o.is_group_order;
            let deptMatch = true;
            if (this.adminOrderFilter.dept !== 'all') deptMatch = (o.items || []).some(i => { const p = this.products.find(x => x.id === i.product_id); return p && p.category === this.adminOrderFilter.dept; });
            return searchMatch && statusMatch && typeMatch && deptMatch;
        });

        grid.innerHTML = filteredOrders.map(o => {
            let statusClass = 'status-pending';
            if (o.status === 'Preparing') statusClass = 'status-preparing';
            if (o.status === 'Shipping') statusClass = 'status-shipping';
            if (o.status === 'Out for Delivery') statusClass = 'status-out';
            if (o.status === 'Cancelled') statusClass = 'status-out';
            if (o.status === 'Delivered') statusClass = 'status-delivered';
            const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

            return `
            <div class="admin-order-card">
                <div class="admin-order-header"><div><h4>Order #${o.id}</h4><span class="admin-order-date">${dateStr}</span></div><span class="order-status ${statusClass}">${this.esc(o.status)}</span></div>
                <div class="admin-order-customer"><div class="admin-cust-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div><div class="admin-cust-details"><b>${this.esc(o.customer_name)}</b><p>${this.esc(o.phone || 'No phone provided')}</p><p class="admin-address">${this.esc(this.formatAddress(o.address))}</p></div></div>
                <div class="admin-order-items">${(() => { const grouped = {}; o.items.forEach(i => { const key = i.product_id + '|' + (i.variation || ''); if (!grouped[key]) grouped[key] = { ...i }; else grouped[key].qty += i.qty; }); return Object.values(grouped).map(i => `<div class="admin-item-row"><span>${i.qty}x ${this.esc(i.name)} ${i.variation ? `<small style="color:var(--brand);">(${this.esc(i.variation)})</small>` : ''}</span><span>${this.money(i.price * i.qty)}</span></div>`).join(''); })()}</div>
                ${o.is_group_order ? `<div style="padding:10px 12px; background:color-mix(in srgb, var(--leaf) 10%, transparent); border-left:3px solid var(--leaf); border-radius:8px; font-size:11px;"><div style="font-weight:800; color:var(--leaf); text-transform:uppercase; margin-bottom:4px;">🏘️ Bayanihan Cart</div><div style="color:var(--ink); font-weight:600; line-height:1.5;">${(o.contributors || []).map(c => `${this.esc(c.name)}${c.paid_amount ? ` (${this.money(c.paid_amount)})` : ''}`).join(' · ') || 'N/A'}</div></div>` : ''}
                ${o.refund_status === 'requested' ? `<div style="padding:12px; background:rgba(229,96,77,0.1); border:1px solid rgba(229,96,77,0.3); border-radius:8px; font-size:12px;"><div style="font-weight:800; color:#e5604d; text-transform:uppercase; margin-bottom:6px;">⚠️ Refund Requested</div><div style="color:var(--ink); font-weight:600; margin-bottom:8px;"><b>Reason:</b> ${this.esc(o.refund_reason || 'N/A')}</div><div style="display:flex; gap:8px; flex-wrap:wrap;">${o.refund_proof ? `<button class="btn btn-ghost" style="padding:4px 8px; font-size:11px;" onclick="app.viewProof('${o.refund_proof}')">View Proof</button>` : ''}<button class="btn btn-leaf" style="padding:4px 8px; font-size:11px;" onclick="app.handleAdminRefund(${o.id}, 'approve')">Approve</button><button class="btn btn-danger" style="padding:4px 8px; font-size:11px;" onclick="app.handleAdminRefund(${o.id}, 'reject')">Reject</button></div></div>` : ''}
                ${o.refund_status === 'approved' ? `<div style="padding:8px; background:rgba(63,122,69,0.1); color:var(--leaf); border-radius:8px; font-size:11px; font-weight:800; text-align:center;">✓ Refund Approved</div>` : ''}
                ${o.refund_status === 'rejected' ? `<div style="padding:8px; background:rgba(229,96,77,0.1); color:#e5604d; border-radius:8px; font-size:11px; font-weight:800; text-align:center;">✕ Refund Rejected</div>` : ''}
                ${o.status === 'Cancelled' && o.appeal_status === 'requested' ? `<div style="padding:12px; background:rgba(240,169,59,0.15); border:1px solid var(--amber); border-radius:8px; font-size:12px;"><div style="font-weight:800; color:#d98c1d; text-transform:uppercase; margin-bottom:6px;">Appeal Requested</div><div style="color:var(--ink); font-weight:600; margin-bottom:8px;"><b>Reason:</b> ${this.esc(o.appeal_reason || 'N/A')}</div><div style="display:flex; gap:8px;"><button class="btn btn-leaf" style="padding:4px 8px; font-size:11px;" onclick="app.handleAdminAppeal(${o.id}, 'approve')">Approve & Restore</button><button class="btn btn-danger" style="padding:4px 8px; font-size:11px;" onclick="app.handleAdminAppeal(${o.id}, 'reject')">Reject Appeal</button></div></div>` : ''}
                ${o.appeal_status === 'approved' ? `<div style="padding:8px; background:rgba(63,122,69,0.1); color:var(--leaf); border-radius:8px; font-size:11px; font-weight:800; text-align:center;">✓ Appeal Approved (Order Restored)</div>` : ''}
                ${o.appeal_status === 'rejected' ? `<div style="padding:8px; background:rgba(229,96,77,0.1); color:#e5604d; border-radius:8px; font-size:11px; font-weight:800; text-align:center;">✕ Appeal Rejected</div>` : ''}
                <div class="admin-order-footer"><div class="admin-order-total"><span>Total:</span><b>${this.money(o.total)}</b>${(o.protection_fee && o.protection_fee > 0) ? `<small style="display:block; font-size:10px; color:var(--muted); font-weight:700;">incl. ${this.money(o.protection_fee)} protection</small>` : ''}</div><div class="admin-order-payment">${o.payment === 'gcash' ? (o.payment_proof ? `<button class="btn btn-ghost" style="padding:4px 8px; font-size:11px;" onclick="app.viewProof('${o.payment_proof}')">View GCash Proof</button>` : '<span class="pay-badge" style="background:rgba(47,140,255,0.15); color:#2f8cff;">GCash</span>') : '<span class="pay-badge">COD</span>'}</div></div>
                <div class="admin-order-actions" style="position: relative;">
                    <div style="flex: 1; position: relative;">
                        ${o.status === 'Cancelled' ? `
                            <!-- Static locked box for Cancelled orders -->
                            <div class="input" style="padding:8px; font-size:12px; display:flex; justify-content:space-between; align-items:center; background-color: rgba(229, 96, 77, 0.1); color: #e5604d; cursor: not-allowed; border-color: rgba(229, 96, 77, 0.3); font-weight: 800;">
                                <span>${this.esc(o.status)}</span>
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            </div>
                        ` : `
                            <!-- Interactive Dropdown for Active orders -->
                            <div class="input" style="padding:8px; font-size:12px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; background-color: var(--surface); color: var(--ink);" onclick="app.toggleStatusDropdown(event, ${o.id})">
                                <span>${this.esc(o.status)}</span>
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                            <div class="status-dropdown-menu hidden" id="status-dropdown-${o.id}" style="position:absolute; bottom: 100%; left:0; right:0; background:var(--surface); border:1px solid var(--line); border-radius:8px; margin-bottom:4px; z-index:100; box-shadow:var(--shadow); overflow:hidden;">
                                ${['Pending', 'Preparing', 'Shipping', 'Out for Delivery', 'Delivered'].map(st => `
                                    <div style="padding:10px; font-size:12px; cursor:pointer; color:var(--ink); border-bottom: 1px solid var(--line); ${o.status === st ? 'background:var(--surface2); font-weight:800;' : ''}" 
                                         onclick="app.selectOrderStatus(${o.id}, '${st}')" 
                                         onmouseover="this.style.background='var(--surface2)'" 
                                         onmouseout="this.style.background='${o.status === st ? 'var(--surface2)' : 'transparent'}'">
                                        ${st}
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                    ${o.status === 'Cancelled' 
                        ? `<button class="btn btn-danger" style="padding:8px 12px; font-size:12px; opacity:0.5; cursor:not-allowed; pointer-events:none;" disabled title="Order is already cancelled">Cancelled</button>`
                        : `<button class="btn btn-danger" style="padding:8px 12px; font-size:12px;" onclick="app.cancelOrder(${o.id})">Cancel</button>`
                    }
                </div>
            </div>`;
        }).join('') || '<div class="empty-state"><h3>No orders found</h3><p>Try adjusting your search or filter.</p></div>';
    },

    filterAdminInventory() {
        this.adminInventoryFilter.search = document.getElementById('admin-inv-search').value.toLowerCase().trim();
        this.adminInventoryFilter.category = document.getElementById('admin-inv-category').value;
        this.adminInventoryFilter.stockStatus = document.getElementById('admin-inv-stock-status').value;
        this.adminInventoryFilter.sort = document.getElementById('admin-inv-sort').value;
        this.renderAdminInventory();
    },

    renderAdminInventory() {
        const container = document.getElementById('admin-inventory-container');
        if (!container) return;
        
        const categories = { paso: { name: 'BANGA (Food Essentials)' }, nipa: { name: 'NIPA (Home Essentials)' }, habi: { name: 'HABI (Fashion)' }, apollo: { name: 'APOLLO (Technologies)' } };
        
        let html = '';
        for (const [key, meta] of Object.entries(categories)) {
            if (this.adminInventoryFilter.category !== 'all' && this.adminInventoryFilter.category !== key) continue;

            let prods = this.products.filter(p => (p.category || '').toLowerCase() === key);
            
            if (this.adminInventoryFilter.search) {
                prods = prods.filter(p => p.name.toLowerCase().includes(this.adminInventoryFilter.search));
            }

            if (this.adminInventoryFilter.stockStatus === 'in-stock') {
                prods = prods.filter(p => p.stock > 10);
            } else if (this.adminInventoryFilter.stockStatus === 'low-stock') {
                prods = prods.filter(p => p.stock > 0 && p.stock <= 10);
            } else if (this.adminInventoryFilter.stockStatus === 'out-of-stock') {
                prods = prods.filter(p => p.stock <= 0);
            }

            if (this.adminInventoryFilter.sort === 'name-asc') {
                prods.sort((a, b) => a.name.localeCompare(b.name));
            } else if (this.adminInventoryFilter.sort === 'price-asc') {
                prods.sort((a, b) => a.price - b.price);
            } else if (this.adminInventoryFilter.sort === 'price-desc') {
                prods.sort((a, b) => b.price - a.price);
            } else if (this.adminInventoryFilter.sort === 'stock-asc') {
                prods.sort((a, b) => a.stock - b.stock);
            } else if (this.adminInventoryFilter.sort === 'stock-desc') {
                prods.sort((a, b) => b.stock - a.stock);
            }

            if (prods.length === 0) continue; 

            html += `
                <div class="admin-inventory-section">
                    <div class="admin-inv-header"><h3><span class="inv-dept-ic ${key}">${this.deptIcons[key]}</span> ${meta.name}</h3></div>
                    <div class="admin-inv-grid">${prods.map(p => `
                            <div class="admin-inv-card">
                                <img src="${this.esc(p.image)}" alt="${this.esc(p.name)}" class="admin-inv-img">
                                <div class="admin-inv-info">
                                    <h4>${this.esc(p.name)}</h4>
                                    <div style="display:flex; gap:15px; font-size:12px; font-weight:700; color:var(--muted); margin: 4px 0 8px 0;"><span>Price: <b style="color:var(--brand);">₱${p.price}</b></span><span>Stock: <b style="color:${p.stock > 0 ? 'var(--leaf)' : '#e5604d'}">${p.stock}</b></span></div>
                                    <div class="admin-inv-actions"><button class="btn btn-ghost" style="padding:6px 12px; font-size:12px; width: 100%;" onclick="app.openProductEditor(${p.id})">Edit</button></div>
                                </div>
                            </div>`).join('')}</div>
                </div>`;
        }
        
        container.innerHTML = html || '<div class="empty-state"><h3>No products found</h3><p>Try adjusting your search or filter.</p></div>';
    },

    async reloadAdminData() { await this.refreshData(); this.renderAdmin(); },

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

        const optContainer = document.getElementById('pe-options-container');
        optContainer.innerHTML = ''; 
        if (p.options) {
            try {
                const parsed = JSON.parse(p.options);
                for (const [groupName, choices] of Object.entries(parsed)) {
                    if (groupName === '_stocks') continue; // Skip the stocks object
                    this.addPeOptionGroup(groupName, choices); 
                }
            } catch(e) { console.warn('Invalid options JSON from DB', e); }
        }

        // 🟢 Generate the combination UI
        this.generateCombinationsUI('pe-combo-stocks-container', 'pe-options-container');

        // 🟢 Pre-fill the generated inputs with existing stock values
        if (p.options) {
            try {
                const parsed = JSON.parse(p.options);
                if (parsed._stocks) {
                    document.querySelectorAll('#pe-combo-stocks-container .combo-stock-row').forEach(row => {
                        const combo = row.dataset.combo;
                        if (parsed._stocks[combo] !== undefined) {
                            row.querySelector('input').value = parsed._stocks[combo];
                        }
                    });
                }
            } catch(e) {}
        }

        document.getElementById('pe-delete-btn').style.display = 'block';
        this.updateEditorPreview();
        document.getElementById('product-editor-modal').classList.remove('hidden');
        this.updateBodyScrollLock();
    },

    updateEditorPreview() { const img = document.getElementById('pe-preview'); if (!img) return; const src = document.getElementById('pe-image').value.trim(); img.src = src || 'https://placehold.co/400x400/eee/333?text=No+Image'; },
    closeProductEditor() { 
        const m = document.getElementById('product-editor-modal'); 
        if (!m) return; 
        m.classList.add('hidden'); 
        this.editingProductId = null; 
        this.updateBodyScrollLock();
    },

    addPeOptionGroup(groupName = '', choices = {}) {
        const container = document.getElementById('pe-options-container');
        const groupDiv = document.createElement('div');
        groupDiv.className = 'pe-option-group';
        groupDiv.style.cssText = 'background:var(--bg); padding:12px; border-radius:12px; border:1px solid var(--line);';
        groupDiv.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <input type="text" class="input pe-opt-name" placeholder="Specification Name (e.g. Size)" value="${this.esc(groupName)}" style="padding:6px 10px; font-size:13px; width:75%; font-weight:800;">
                <button type="button" class="qty-circle-btn" onclick="this.closest('.pe-option-group').remove()" style="color:#e5604d; border-color:rgba(229,96,77,0.3);" title="Remove Group">✕</button>
            </div>
            <div class="pe-opt-choices-container" style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;"></div>
            <button type="button" class="btn btn-ghost" style="padding:4px 10px; font-size:11px; border-radius:6px;" onclick="app.addPeOptionChoice(this)">+ Add Choice</button>`;
        container.appendChild(groupDiv);

        const choicesContainer = groupDiv.querySelector('.pe-opt-choices-container');
        if (Object.keys(choices).length > 0) {
            if (Array.isArray(choices)) { choices.forEach(c => this._appendChoiceInput(choicesContainer, c, 0)); } 
            else { Object.entries(choices).forEach(([c, price]) => this._appendChoiceInput(choicesContainer, c, price)); }
        } else { this._appendChoiceInput(choicesContainer, '', 0); }
    },

    // 🟢 NEW: Generic function to build the specification UI
    _renderOptionGroup(containerId, groupName = '', choices = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const groupDiv = document.createElement('div');
        groupDiv.className = 'pe-option-group';
        groupDiv.style.cssText = 'background:var(--bg); padding:12px; border-radius:12px; border:1px solid var(--line);';
        
        const isEdit = containerId === 'pe-options-container';
        const stockContainerId = isEdit ? 'pe-combo-stocks-container' : 'add-combo-stocks-container';

        groupDiv.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <input type="text" class="input pe-opt-name" placeholder="Specification Name (e.g. Size)" value="${this.esc(groupName)}" style="padding:6px 10px; font-size:13px; width:75%; font-weight:800;" oninput="app.generateCombinationsUI('${stockContainerId}', '${containerId}')">
                <button type="button" class="qty-circle-btn" onclick="this.closest('.pe-option-group').remove(); app.generateCombinationsUI('${stockContainerId}', '${containerId}')" style="color:#e5604d; border-color:rgba(229,96,77,0.3);" title="Remove Group">✕</button>
            </div>
            <div class="pe-opt-choices-container" style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;"></div>
            <button type="button" class="btn btn-ghost" style="padding:4px 10px; font-size:11px; border-radius:6px;" onclick="app._appendChoiceInput(this.previousElementSibling, '', 0, '${stockContainerId}', '${containerId}')">+ Add Choice</button>`;
        
        container.appendChild(groupDiv);

        const choicesContainer = groupDiv.querySelector('.pe-opt-choices-container');
        if (choices && Object.keys(choices).length > 0) {
            if (Array.isArray(choices)) {
                choices.forEach(c => this._appendChoiceInput(choicesContainer, c, 0, stockContainerId, containerId));
            } else {
                Object.entries(choices).forEach(([c, price]) => this._appendChoiceInput(choicesContainer, c, price, stockContainerId, containerId));
            }
        } else {
            this._appendChoiceInput(choicesContainer, '', 0, stockContainerId, containerId);
        }
        
        this.generateCombinationsUI(stockContainerId, containerId);
    },

    // Wrapper for Edit Modal
    addPeOptionGroup(groupName = '', choices = {}) {
        this._renderOptionGroup('pe-options-container', groupName, choices);
    },

    // Wrapper for Add Modal
    addAddOptionGroup() {
        this._renderOptionGroup('add-options-container', '', {});
    },

    _appendChoiceInput(container, name = '', price = 0, stockContainerId = '', optionsContainerId = '') {
        const div = document.createElement('div');
        div.style.cssText = 'display:flex; align-items:center; gap:8px; margin-bottom:4px;';
        div.innerHTML = `
            <input type="text" class="input pe-opt-choice-name" placeholder="Choice (e.g. Medium)" value="${this.esc(name)}" style="padding:6px 10px; font-size:12px; flex:2;" oninput="app.generateCombinationsUI('${stockContainerId}', '${optionsContainerId}')">
            <input type="number" class="input pe-opt-choice-price" placeholder="Add'l ₱" value="${price}" style="padding:6px 10px; font-size:12px; flex:1;" min="0">
            <button type="button" class="qty-circle-btn" onclick="this.parentElement.remove(); app.generateCombinationsUI('${stockContainerId}', '${optionsContainerId}')" style="color:#e5604d; border-color:rgba(229,96,77,0.3); width:22px; height:22px; font-size:10px; flex-shrink:0;">✕</button>
        `;
        container.appendChild(div);
    },

    addPeOptionChoice(btn) { const container = btn.previousElementSibling; this._appendChoiceInput(container); },

    _appealOrderId: null,
    openAppealModal(orderId, cancelReason) {
        this._appealOrderId = orderId;
        document.getElementById('appeal-cancel-reason').textContent = cancelReason;
        document.getElementById('appeal-text').value = '';
        document.getElementById('appeal-modal').classList.remove('hidden');
        this.updateBodyScrollLock();
    },

    async submitAppeal() {
        const reason = document.getElementById('appeal-text').value.trim();
        if (!reason) return this.showToast('Please provide a reason for your appeal.');

        const btn = document.getElementById('appeal-submit-btn');
        this.setBtnLoading(btn, true);

        try {
            const res = await fetch('api.php?action=submit-appeal', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: this._appealOrderId, reason: reason })
            });
            const data = await res.json();
            
            if (data.ok) {
                this.closeModal('appeal-modal');
                this.showToast('Appeal submitted! Waiting for Admin review.');
                await this.refreshData();
                this.renderOrders();
            } else {
                this.showToast(data.error || 'Failed to submit appeal.');
            }
        } catch(e) { this.showToast('Connection error.'); } 
        finally { this.setBtnLoading(btn, false); }
    },

    async handleAdminAppeal(orderId, action) {
        const actStr = action === 'approve' ? 'APPROVE and restore' : 'REJECT';
        this.showConfirm('Review Appeal', `Are you sure you want to ${actStr} the appeal for Order #${orderId}?`, async () => {
            try {
                const res = await fetch('api.php?action=admin-handle-appeal', {
                    method: 'POST', headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({ order_id: orderId, action })
                });
                const data = await res.json();
                if (data.ok) { this.showToast(`Appeal ${action}d.`); await this.reloadAdminData(); } 
                else this.showToast(data.error || 'Failed.');
            } catch(e) { this.showToast('Connection error.'); }
        }, 'Confirm');
    },

    async saveProductEditor(e) {
        if (e) e.preventDefault();
        if (!this.editingProductId) return;

        const v = id => document.getElementById(id).value.trim();
        const name = v('pe-name');
        const price = parseInt(v('pe-price'), 10);
        const stock = parseInt(v('pe-stock'), 10);

        if (!name) return this.showToast('Ilagay ang pangalan ng produkto.');
        if (isNaN(price) || price < 0) return this.showToast('Mali ang presyo. Hindi pwedeng negatibo.');
        if (isNaN(stock) || stock < 0) return this.showToast('Mali ang stock. Hindi pwedeng negatibo.');

        const optionsObj = {};
        document.querySelectorAll('#pe-options-container .pe-option-group').forEach(group => {
            const groupName = group.querySelector('.pe-opt-name').value.trim();
            if (!groupName) return;

            const choicesObj = {};
            let hasChoices = false;
            group.querySelectorAll('.pe-opt-choice-name').forEach(input => {
                const cName = input.value.trim();
                const cPrice = parseInt(input.nextElementSibling.value) || 0;
                if (cName) {
                    choicesObj[cName] = cPrice;
                    hasChoices = true;
                }
            });

            if (hasChoices) {
                optionsObj[groupName] = choicesObj;
            }
        });

        // 🟢 Read from the new UI
        const comboStocks = this._getComboStocksFromUI('pe-combo-stocks-container');
        
        // 🟢 Validation: Enforce combination stocks if specs exist
        if (Object.keys(optionsObj).length > 0) {
            const totalRows = document.querySelectorAll('#pe-combo-stocks-container .combo-stock-row').length;
            const filledRows = Object.keys(comboStocks).length;
            if (filledRows < totalRows) {
                return this.showToast('Kailangang ilagay ang stock para sa lahat ng combinations.');
            }
            optionsObj._stocks = comboStocks;
        }

        const optionsStr = Object.keys(optionsObj).length > 0 ? JSON.stringify(optionsObj) : '';

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
            options: optionsStr 
        };

        // Detect stock loss from renamed/removed variations
        const p = this.products.find(x => x.id === this.editingProductId);
        if (!p) return this.showToast('Product not found.');
        
        if (p.options) {
            try {
                const oldOpts = JSON.parse(p.options);
                const oldStocks = oldOpts._stocks || {};
                let lostUnits = 0;
                const lostCombos = [];
                Object.entries(oldStocks).forEach(([combo, qty]) => {
                    if (!(combo in comboStocks) && qty > 0) {
                        lostUnits += qty;
                        lostCombos.push(`${combo} (${qty})`);
                    }
                });
                if (lostUnits > 0) {
                    return this.showAlert(
                        'Stock Being Discarded',
                        `You are removing/renaming these variations, which will <b>delete ${lostUnits} units of stock</b>:<br><br>• ${lostCombos.join('<br>• ')}<br><br>Add them back or reduce their stock first if this is not intended.`
                    );
                }
            } catch(e) {}
        }

        this.showConfirm('Save Changes', 'I-save ang mga pagbabago sa produktong ito?', async () => {
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
        }, 'Save');
    },

    viewProof(src) { 
        document.getElementById('proof-img').src = src; 
        document.getElementById('proof-modal').classList.remove('hidden'); 
        this.updateBodyScrollLock();
    },

    async updateOrderStatus(id, status) {
        try {
            const res = await fetch('api.php?action=admin-update-order', { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({ order_id: id, status }) 
            });
            const data = await res.json();
            
            if (data.ok) {
                this.showToast(`Status updated to ${status}`);
            } else {
                this.showToast(data.error || 'Failed to update status');
            }
        } catch (e) {
            this.showToast('Connection error while updating status');
        }
        
        // Always reload data to ensure UI reflects the actual database state
        await this.reloadAdminData();
    },

    toggleStatusDropdown(e, id) {
        e.stopPropagation();
        const menu = document.getElementById(`status-dropdown-${id}`);
        if (!menu) return;
        const isHidden = menu.classList.contains('hidden');
        
        // Close all other dropdowns
        document.querySelectorAll('.status-dropdown-menu').forEach(m => m.classList.add('hidden'));
        
        if (isHidden) menu.classList.remove('hidden');
    },

    selectOrderStatus(id, status) {
        // Close all dropdowns
        document.querySelectorAll('.status-dropdown-menu').forEach(m => m.classList.add('hidden'));
        
        // Show confirmation modal before updating
        this.showConfirm('Update Status', `Palitan ang status ng <b>Order #${id}</b> to <b>${status}</b>?`, () => {
            this.updateOrderStatus(id, status);
        }, 'Update');
    },

    cancelOrder(id) {
        this.promptAdminDelete('Cancel Order', id, `Order #${id}`, 'admin-cancel-order');
        // Change the submit button text to say Cancel instead of Delete
        setTimeout(() => {
            const btn = document.getElementById('adr-confirm-btn');
            if (btn) btn.textContent = 'Confirm Cancellation';
            const title = document.querySelector('#admin-delete-reason-modal .pe-title');
            if (title) title.style.color = 'var(--brand)';
        }, 10);
    },

    async handleAdminRefund(orderId, action) {
        const actionText = action === 'approve' ? 'I-APPROVE' : 'I-REJECT';
        if (!confirm(`Sigurado ka bang ${actionText} ang refund para sa Order #${orderId}?`)) return;
        try {
            const res = await fetch('api.php?action=admin-handle-refund', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ order_id: orderId, action }) });
            const data = await res.json();
            if (data.ok) { this.showToast(`Refund ${action === 'approve' ? 'approved' : 'rejected'}.`); await this.reloadAdminData(); } 
            else { this.showToast(data.error || 'Failed to process refund.'); }
        } catch (e) { this.showToast('Connection error.'); }
    },

    deleteProductEditor() { 
        if (!this.editingProductId) return; 
        const id = this.editingProductId; 
        const p = this.products.find(x => x.id === id);
        this.closeProductEditor(); 
        this.promptAdminDelete('Product', id, p.name, 'admin-delete-product'); 
    },
    
    deleteProduct(id) {
        const p = this.products.find(x => x.id === id);
        this.promptAdminDelete('Product', id, p ? p.name : `Product #${id}`, 'admin-delete-product');
    },

    openAddProductModal() {
        document.getElementById('admin-add-form').reset();
        document.getElementById('add-options-container').innerHTML = '';
        this.generateCombinationsUI('add-combo-stocks-container', 'add-options-container');
        document.getElementById('add-product-modal').classList.remove('hidden');
        this.updateBodyScrollLock();
    },

    closeAddProductModal() {
        document.getElementById('add-product-modal').classList.add('hidden');
        this.updateBodyScrollLock();
    },

    async addProduct(e) {
        if (e) e.preventDefault();
        
        const optionsObj = {};
        document.querySelectorAll('#add-options-container .pe-option-group').forEach(group => {
            const groupName = group.querySelector('.pe-opt-name').value.trim();
            if (!groupName) return;

            const choicesObj = {};
            let hasChoices = false;
            group.querySelectorAll('.pe-opt-choice-name').forEach(input => {
                const cName = input.value.trim();
                const cPrice = parseInt(input.nextElementSibling.value) || 0;
                if (cName) {
                    choicesObj[cName] = cPrice;
                    hasChoices = true;
                }
            });

            if (hasChoices) {
                optionsObj[groupName] = choicesObj;
            }
        });

        // 🟢 Read from new UI
        const comboStocks = this._getComboStocksFromUI('add-combo-stocks-container');
        
        // 🟢 Validation: Enforce combination stocks if specs exist
        if (Object.keys(optionsObj).length > 0) {
            const totalRows = document.querySelectorAll('#add-combo-stocks-container .combo-stock-row').length;
            const filledRows = Object.keys(comboStocks).length;
            if (filledRows < totalRows) {
                return this.showToast('Kailangang ilagay ang stock para sa lahat ng combinations.');
            }
            optionsObj._stocks = comboStocks;
        }

        const optionsStr = Object.keys(optionsObj).length > 0 ? JSON.stringify(optionsObj) : '';

        const payload = {
            name: document.getElementById('add-name').value.trim(),
            tagline: document.getElementById('add-tagline').value.trim(),
            description: document.getElementById('add-desc').value.trim(),
            price: Math.max(0, parseInt(document.getElementById('add-price').value) || 0),
            stock: Math.max(0, parseInt(document.getElementById('add-stock').value) || 0),
            category: document.getElementById('add-cat').value,
            image: document.getElementById('add-image').value.trim(),
            tags: document.getElementById('add-tags').value.trim(),
            best_seller: document.getElementById('add-bestseller').checked ? 1 : 0,
            options: optionsStr
        };

        this.showConfirm('Add Product', `I-add ang bagong product na <b>${this.esc(payload.name)}</b> sa store?`, async () => {
            try {
                const res = await fetch('api.php?action=admin-add-product', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
                const data = await res.json();
                if (data.ok) { 
                    this.showToast('Product added successfully!'); 
                    this.closeAddProductModal();
                    await this.reloadAdminData(); 
                } 
                else { this.showToast(data.error || 'Failed to add product.'); }
            } catch (err) { this.showToast('Connection error.'); }
        }, 'Add Product');
    },

    toggleTheme() {
        const html = document.documentElement;
        const next = html.getAttribute('data-theme') === 'sunset' ? 'day' : 'sunset';
        html.classList.add('theme-switching'); void html.offsetWidth; 
        html.setAttribute('data-theme', next); localStorage.setItem('pk_theme', next);
        
        // Update Nav Drawer toggle pill
        const pillWrap = document.getElementById('nd-theme-pill')?.parentElement;
        if (pillWrap) pillWrap.classList.toggle('is-sunset', next === 'sunset');
        
        // Update Header Button Icon
        this.updateThemeButton();

        clearTimeout(this._themeTimeout); 
        this._themeTimeout = setTimeout(() => { html.classList.remove('theme-switching'); }, 1000); 
    },

    setTheme(theme) {
        const html = document.documentElement;
        if (html.getAttribute('data-theme') === theme) return;
        html.classList.add('theme-switching');
        void html.offsetWidth;
        html.setAttribute('data-theme', theme);
        localStorage.setItem('pk_theme', theme);
        const pillWrap = document.getElementById('nd-theme-pill')?.parentElement;
        if (pillWrap) pillWrap.classList.toggle('is-sunset', theme === 'sunset');
        this.updateThemeButton();
        clearTimeout(this._themeTimeout);
        this._themeTimeout = setTimeout(() => html.classList.remove('theme-switching'), 1000);
    },

    updateThemeButton() {
        const theme = document.documentElement.getAttribute('data-theme') || 'day';
        const sunIcon = document.getElementById('theme-icon-sun');
        const sunsetIcon = document.getElementById('theme-icon-sunset');
        if (sunIcon && sunsetIcon) {
            if (theme === 'sunset') {
                sunIcon.style.display = 'none';
                sunsetIcon.style.display = 'block';
            } else {
                sunIcon.style.display = 'block';
                sunsetIcon.style.display = 'none';
            }
        }
    },

    checkTheme() {
        const saved = localStorage.getItem('pk_theme') || 'day';
        document.documentElement.setAttribute('data-theme', saved);
        
        const pillWrap = document.getElementById('nd-theme-pill')?.parentElement;
        if (pillWrap) pillWrap.classList.toggle('is-sunset', saved === 'sunset');
        
        // Initialize Header Button Icon based on saved theme
        this.updateThemeButton();
    },

    toggleBot() { 
        document.getElementById('pilibot-window').classList.toggle('hidden'); 
    },

    sendBotMsg(e) {
        e.preventDefault();
        const input = document.getElementById('pb-text');
        const chat  = document.getElementById('pb-chat');
        if (!input.value.trim()) return;

        const userMessage = input.value.trim();
        chat.innerHTML += `<div class="pb-msg user">${this.esc(userMessage)}</div>`;
        
        // Clean the query for matching
        const q = ' ' + userMessage.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
        input.value = ''; chat.scrollTop = chat.scrollHeight;

        setTimeout(() => {
            let reply = "Hmm, di ko pa alam 'yan, suki! :) Subukan mong itanong ang delivery, GCash, orders, products, o Budget Mode.";
            
            // 🟢 NEW: DYNAMIC BARANGAY LOOKUP
            let isLocationQuery = q.includes(' fee ') || q.includes(' deliver ') || q.includes(' magkano ') || q.includes(' presyo ') || q.includes(' shipping ');
            
            if (isLocationQuery && this.deliveryFeesRaw) {
                // Find if any barangay matches the user's text
                const match = this.deliveryFeesRaw.find(f => {
                    const bName = ' ' + f.barangay.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
                    return q.includes(bName);
                });

                if (match) {
                    reply = `Ah, suki! Ang delivery fee sa <b>${this.esc(match.barangay)}, ${this.esc(match.city)}</b> ay <b>${this.money(match.fee)}</b>.<br><button class='pb-action-btn' onclick="app.go('cart')">Go to Checkout</button>`;
                }
            } 
            
            // If no barangay match was found, fallback to the standard botBrain search
            if (reply.includes("Hmm, di ko pa alam")) {
                const match = this.botBrain.find(bot =>
                    bot.keys.some(k => {
                        const cleanKey = k.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
                        if (!cleanKey) return false;
                        if (cleanKey.includes(' ')) return q.includes(' ' + cleanKey);
                        return q.includes(' ' + cleanKey + ' ');
                    })
                );
                if (match) reply = typeof match.reply === 'function' ? match.reply.call(this) : match.reply;
            }

            chat.innerHTML += `<div class="pb-msg">${reply}</div>`;
            chat.scrollTop = chat.scrollHeight;
        }, 600);
    },

    openBotProduct(productName) {
        this.toggleBot(); // Close the chatbot window
        // Find the product by name (case-insensitive)
        const product = this.products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));
        
        if (product) {
            // Reuse the existing addToCart function which handles the modal and login check
            this.addToCart(product.id); 
        } else {
            this.showToast('Sorry suki, hindi ko mahanap ang product na iyon sa catalog.');
        }
    },

    async loadGroups() {
        if (!this.user) return;
        try {
            const [gr, ir] = await Promise.all([fetch('api.php?action=group-list'), fetch('api.php?action=group-my-invites')]);
            this.bayanihan.list = await gr.json();
            this.bayanihan.invites = await ir.json();
        } catch (e) { console.warn('loadGroups', e); }
    },

    copyText(text) {
        if (navigator.clipboard) { navigator.clipboard.writeText(text).then(() => this.showToast('Copied!')).catch(() => this._fallbackCopy(text)); } else this._fallbackCopy(text);
    },
    _fallbackCopy(text) {
        const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); this.showToast('Copied!');
    },

    openCreateGroupModal() { 
        document.getElementById('bg-create-name').value = ''; 
        
        // Populate defaults from user profile
        document.getElementById('bg-create-recipient').value = this.user ? this.user.name : '';
        document.getElementById('bg-create-phone').value = this.user ? this.user.phone : '';
        
        let addr = { street: '', brgy: '', city: '' };
        if (this.user && this.user.address) {
            try {
                if (this.user.address.trim().startsWith('{')) addr = JSON.parse(this.user.address);
                else addr.street = this.user.address;
            } catch(e){}
        }
        document.getElementById('bg-create-street').value = addr.street || '';

        // Populate City Dropdown
        const citySelect = document.getElementById('bg-create-city');
        citySelect.innerHTML = '<option value="" disabled selected>Pumili ng Lungsod</option>';
        Object.keys(this.lagunaData).forEach(c => { citySelect.innerHTML += `<option value="${c}" ${addr.city === c ? 'selected' : ''}>${c}</option>`; });
        
        // Populate Brgy Dropdown based on selected city
        this.updateModalBrgyDropdown('create', addr.brgy);

        document.getElementById('bayanihan-create-modal').classList.remove('hidden'); 
        this.updateBodyScrollLock();
    },
    
    async submitCreateGroup() {
        const name = document.getElementById('bg-create-name').value.trim() || 'Bayanihan Cart';
        const customer_name = document.getElementById('bg-create-recipient').value.trim();
        const phone = document.getElementById('bg-create-phone').value.trim();
        const city = document.getElementById('bg-create-city').value;
        const brgy = document.getElementById('bg-create-brgy').value;
        const street = document.getElementById('bg-create-street').value.trim();
        const fee = parseInt(document.getElementById('bg-create-fee').value) || 0;

        if (!customer_name || !phone || !city || !brgy) {
            return this.showToast('Kumpletuhin ang delivery details.');
        }

        // 🟢 Phone Validation
        const cleanPhone = phone.replace(/[\s-]/g, '');
        if (!/^(09|\+639)\d{9}$/.test(cleanPhone)) {
            return this.showToast('Mali ang format ng number. Dapat 09XXXXXXXXX o +639XXXXXXXXX.');
        }

        const address = JSON.stringify({ street, brgy, city });

        try {
            const res = await fetch('api.php?action=group-create', { 
                method: 'POST', headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ name, customer_name, phone: cleanPhone, address, fee }) 
            });
            const data = await res.json();
            if (data.ok) {
                this.closeModal('bayanihan-create-modal'); this._newGroupId = data.id;
                this.showCodeShareModal(data.code, data.name || name, data.id);
                await this.loadGroups(); if (this.currentView === 'bayanihan') this.renderBayanihan();
            } else this.showToast(data.error || 'Failed');
        } catch (e) { this.showToast('Connection error'); }
    },

    showCodeShareModal(code, name, gid) {
        this._newGroupId = gid; document.getElementById('bg-code-display').textContent = code; document.getElementById('bg-code-group-name').textContent = name; document.getElementById('bayanihan-code-modal').classList.remove('hidden');
    },
    copyGroupCode() { this.copyText(document.getElementById('bg-code-display').textContent); },
    async shareGroupCode() {
        const code = document.getElementById('bg-code-display').textContent; const name = document.getElementById('bg-code-group-name').textContent;
        const text = `Join my PiliKart Bayanihan Cart "${name}"! Use code: ${code}`;
        if (navigator.share) { try { await navigator.share({ title: 'PiliKart Bayanihan Cart', text }); } catch (e) {} } else this.copyText(text);
    },

    openJoinGroupModal() { 
        document.getElementById('bg-join-code').value = ''; 
        document.getElementById('bayanihan-join-modal').classList.remove('hidden'); 
        this.updateBodyScrollLock();
    },

    switchBayanihanTab(tab, btn) {
        document.querySelectorAll('#view-bayanihan .admin-tab-btn').forEach(b => { b.className = 'btn btn-ghost admin-tab-btn'; });
        btn.className = 'btn btn-brand admin-tab-btn';
        if (tab === 'active') { document.getElementById('bayanihan-active-list').classList.remove('hidden'); document.getElementById('bayanihan-history-list').classList.add('hidden'); } 
        else { document.getElementById('bayanihan-active-list').classList.add('hidden'); document.getElementById('bayanihan-history-list').classList.remove('hidden'); }
    },
    async submitJoinGroup() {
        const code = (document.getElementById('bg-join-code').value || '').toUpperCase().trim();
        if (code.length !== 6) return this.showToast('Kailangan ng 6-character code.');
        try {
            const res = await fetch('api.php?action=group-join-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
            const data = await res.json();
            if (data.ok) { this.closeModal('bayanihan-join-modal'); this.showToast('Join request sent! Hintayin ang approval.'); await this.loadGroups(); this.renderBayanihan(); } 
            else this.showToast(data.error || 'Failed');
        } catch (e) { this.showToast('Connection error'); }
    },

    async renderBayanihan() {
        if (!this.user) { 
            this.showToast('Mag-sign in muna para makagawa ng Bayanihan Cart, suki!');
            this.openAuthModal('signin'); 
            return; 
        }
        await this.loadGroups();
        const invEl = document.getElementById('bayanihan-invites');
        if (this.bayanihan.invites && this.bayanihan.invites.length) {
            invEl.innerHTML = `<div class="card" style="margin-bottom:20px; border-color:var(--amber);"><h3 style="margin-bottom:12px; font-size:18px;">📬 Pending Invites</h3>${this.bayanihan.invites.map(inv => `<div style="display:flex; justify-content:space-between; align-items:center; gap:10px; padding:12px; background:var(--surface2); border-radius:12px; margin-bottom:8px; flex-wrap:wrap;"><div><b>${this.esc(inv.group_name)}</b><div style="font-size:12px; color:var(--muted);">Host: ${this.esc(inv.host_name)} · Code: ${this.esc(inv.code)}</div></div><div style="display:flex; gap:8px;"><button class="btn btn-leaf" style="padding:6px 12px; font-size:12px;" onclick="app.acceptInvite(${inv.group_id})">Accept</button><button class="btn btn-ghost" style="padding:6px 12px; font-size:12px;" onclick="app.declineInvite(${inv.group_id})">Decline</button></div></div>`).join('')}</div>`;
        } else invEl.innerHTML = '';

        const activeList = document.getElementById('bayanihan-active-list');
        const historyList = document.getElementById('bayanihan-history-list');
        let activeHtml = ''; let historyHtml = '';

        this.bayanihan.list.forEach(g => {
            let displayStatus = g.status; let statusClass = 'status-shipping';
            if (g.status === 'ordered' && g.order_status) {
                displayStatus = g.order_status;
                if (g.order_status === 'Pending') statusClass = 'status-pending';
                else if (g.order_status === 'Shipping') statusClass = 'status-shipping';
                else if (g.order_status === 'Out for Delivery') statusClass = 'status-out';
                else if (g.order_status === 'Delivered') statusClass = 'status-delivered';
            } else {
                if (g.status === 'open') { displayStatus = 'Open'; statusClass = 'status-pending'; }
                else if (g.status === 'ordered') { displayStatus = 'Ordered'; statusClass = 'status-delivered'; }
                else if (g.status === 'cancelled') { displayStatus = 'Cancelled'; statusClass = 'status-out'; }
            }
            let myStatus = '';
            if (g.my_status === 'pending') myStatus = '<div style="color:var(--amber); font-size:11px; font-weight:800; margin-top:8px;">⏳ Waiting for host approval</div>';
            else if (g.my_status === 'invited') myStatus = '<div style="color:var(--amber); font-size:11px; font-weight:800; margin-top:8px;">📬 Check invites above</div>';
            
            const cardHtml = `
                <div class="admin-order-card" style="cursor:pointer; margin-bottom:20px;" onclick="app.openGroupDetail(${g.id})">
                    <div class="admin-order-header"><div><h4>${this.esc(g.name)}</h4><span class="admin-order-date">Host: ${this.esc(g.host_name)}</span></div><span class="order-status ${statusClass}">${this.esc(displayStatus)}</span></div>
                    <div style="padding:14px; background:var(--surface2); border-radius:12px; text-align:center; position:relative;"><div style="font-size:10px; font-weight:800; color:var(--muted); text-transform:uppercase;">Cart Code</div><div style="font-size:28px; font-weight:900; letter-spacing:5px; color:var(--brand); font-family:'Baloo 2';">${this.esc(g.code)}</div><button class="qty-circle-btn" style="position:absolute; top:8px; right:8px; width:30px; height:30px;" onclick="event.stopPropagation(); app.copyText('${g.code}')" title="Copy">📋</button></div>
                    <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700;"><span>👥 <b>${g.member_count}</b> member${g.member_count === 1 ? '' : 's'}</span><span style="color:var(--brand);">${this.money(g.subtotal)}</span></div>
                    ${myStatus}
                </div>`;
            if (g.status === 'open') activeHtml += cardHtml; else historyHtml += cardHtml;
        });

        if (activeHtml) activeList.innerHTML = `<div class="admin-orders-grid">${activeHtml}</div>`;
        else activeList.innerHTML = this.emptyState('orders', 'Wala kang Active na Bayanihan Cart', 'Gumawa ng bagong Bayanihan Cart o sumali gamit ang code.', 'Create Bayanihan Cart', 'app.openCreateGroupModal()');
        if (historyHtml) historyList.innerHTML = `<div class="admin-orders-grid">${historyHtml}</div>`;
        else historyList.innerHTML = this.emptyState('orders', 'Walang Order History', 'Wala ka pang nakaraang Bayanihan orders.');
    },
    async acceptInvite(gid) { await fetch('api.php?action=group-accept-invite', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ group_id: gid }) }); this.showToast('Invite accepted!'); await this.renderBayanihan(); },
    async declineInvite(gid) { await fetch('api.php?action=group-decline-invite', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ group_id: gid }) }); await this.renderBayanihan(); },
    async withdrawJoin(gid) { if (!confirm('Withdraw your join request?')) return; await fetch('api.php?action=group-leave', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ group_id: gid }) }); this.showToast('Request withdrawn.'); await this.renderBayanihan(); },

    async openGroupDetail(gid) {
        try {
            const res = await fetch('api.php?action=group-get', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: gid }) });
            const data = await res.json();
            if (data.error) { this.showToast(data.error); return; }
            this.bayanihan.current = data; this.go('bayanihan-detail'); this.renderGroupDetail();
        } catch (e) { this.showToast('Error loading'); }
    },

    computeGroupSplit(g, subtotal, deliveryFee) {
        const approved = g.members.filter(m => m.status === 'approved'); const n = approved.length;
        if (n === 0) return [];
        const total = subtotal + deliveryFee; const method = g.split_method || 'equal';
        const result = approved.map(m => ({ userId: m.user_id, name: m.name, role: m.role, amount: 0, isFixed: !!m.is_fixed, isPayer: !!m.is_payer }));
        if (method === 'equal') {
            const per = Math.floor(total / n); let rem = total - per * n;
            result.forEach(r => r.amount = per); for (let i = 0; i < rem; i++) result[i % n].amount += 1;
        } else if (method === 'by_adder') {
            const userSub = {}; g.items.forEach(it => { userSub[it.user_id] = (userSub[it.user_id] || 0) + it.price * it.qty; });
            const feePer = Math.floor(deliveryFee / n); let feeRem = deliveryFee - feePer * n;
            result.forEach(r => r.amount = (userSub[r.userId] || 0) + feePer); for (let i = 0; i < feeRem; i++) result[i % n].amount += 1;
        } else if (method === 'fixed_contribution') {
            const fixed = result.filter(r => { const m = g.members.find(mm => mm.user_id === r.userId); return (parseInt(m.fixed_share_amount) || 0) > 0; });
            const unfixed = result.filter(r => { const m = g.members.find(mm => mm.user_id === r.userId); return (parseInt(m.fixed_share_amount) || 0) <= 0; });
            let sumFixed = 0;
            fixed.forEach(r => { const m = g.members.find(mm => mm.user_id === r.userId); r.amount = parseInt(m.fixed_share_amount) || 0; sumFixed += r.amount; });
            if (fixed.length === 0) {
                const per = Math.floor(total / n); let rem = total - per * n;
                result.forEach(r => r.amount = per); for (let i = 0; i < rem; i++) result[i % n].amount += 1;
            } else if (unfixed.length > 0) {
                const remainder = total - sumFixed;
                if (remainder > 0) { const per = Math.floor(remainder / unfixed.length); let rem = remainder - per * unfixed.length; unfixed.forEach((r, i) => r.amount = per + (i < rem ? 1 : 0)); } 
                else if (remainder < 0) unfixed.forEach(r => r.amount = 0);
            }
        } else if (method === 'one_payer') {
            const payers = result.filter(r => r.isPayer);
            if (!payers.length) {
                const per = Math.floor(total / n); let rem = total - per * n;
                result.forEach(r => r.amount = per); for (let i = 0; i < rem; i++) result[i % n].amount += 1;
            } else {
                const per = Math.floor(total / payers.length); let rem = total - per * payers.length;
                payers.forEach((r, i) => r.amount = per + (i < rem ? 1 : 0)); result.filter(r => !r.isPayer).forEach(r => r.amount = 0);
            }
        }
        return result;
    },

    renderGroupDetail() {
        const g = this.bayanihan.current; const body = document.getElementById('bayanihan-detail-body');
        if (!body || !g || !this.user) return;
        const me = g.members.find(m => m.user_id === this.user.id);
        if (!me) { body.innerHTML = '<p>Access denied.</p>'; return; }
        
        if (me.status === 'pending') {
            body.innerHTML = `<div class="page-head"><button class="btn btn-ghost" style="margin-bottom:12px; padding:6px 14px; font-size:13px;" onclick="app.go('bayanihan')">← Back</button><h1>${this.esc(g.name)}</h1></div><div class="co-card" style="text-align:center; padding:40px;"><h3>⏳ Waiting for approval</h3><p style="color:var(--muted); margin:12px 0;">Pending ang request mo. Tanungin ang host na i-approve.</p><button class="btn btn-ghost" onclick="app.go('bayanihan')">Back</button></div>`;
            return;
        }

        const isReadOnly = me.status === 'invited'; const isHost = me.role === 'host';
        const subtotal = g.items.reduce((s, it) => s + it.price * it.qty, 0);
        const approvedMembers = g.members.filter(m => m.status === 'approved');
        const pendingMembers = g.members.filter(m => m.status === 'pending');
        const invitedMembers = g.members.filter(m => m.status === 'invited');
        const allPaid = approvedMembers.length > 0 && approvedMembers.every(m => m.paid === 1 && m.payer_verified === 1);
        const deliveryFee = parseInt(g.delivery_fee) || 0; const total = subtotal + deliveryFee;
        const split = this.computeGroupSplit(g, subtotal, deliveryFee);
        
        const totalFixed = approvedMembers.reduce((s, m) => s + (parseInt(m.fixed_share_amount) || 0), 0);
        const hasUnfixed = approvedMembers.some(m => (parseInt(m.fixed_share_amount) || 0) <= 0);
        const sumPaid = split.reduce((s, r) => { const m = g.members.find(mm => mm.user_id === r.userId); return s + (m && m.paid ? m.paid_amount : 0); }, 0);
        const shortfall = total - sumPaid;
        const itemsByUser = {}; g.items.forEach(it => { if (!itemsByUser[it.user_id]) itemsByUser[it.user_id] = { name: it.user_name, items: [] }; itemsByUser[it.user_id].items.push(it); });
        const hostMember = g.members.find(m => m.role === 'host');
        const isOrdered = g.status === 'ordered'; const isCancelled = g.status === 'cancelled'; const orderStatus = g.order_status || 'Pending';
        const isDeliverySet = !!(g.customer_name && g.phone && g.delivery_address);

        const topCards = `
            <div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
                <div style="padding:12px 20px; background:var(--surface); border:1px solid var(--line); border-radius:14px; text-align:center;"><div style="font-size:10px; font-weight:800; color:var(--muted); text-transform:uppercase;">Cart Code</div><div style="font-size:24px; font-weight:900; letter-spacing:4px; color:var(--brand); font-family:'Baloo 2';">${this.esc(g.code)}</div><button class="btn btn-ghost" style="padding:2px 10px; font-size:11px; margin-top:4px;" onclick="app.copyText('${g.code}')">Copy</button></div>
                <div style="padding:12px 20px; background:var(--surface); border:1px solid var(--line); border-radius:14px; text-align:center;"><div style="font-size:10px; font-weight:800; color:var(--muted); text-transform:uppercase;">Status</div><div style="font-size:18px; font-weight:800; text-transform:uppercase;">${this.esc(isOrdered ? orderStatus : g.status)}</div></div>
                <div style="padding:12px 20px; background:var(--surface); border:1px solid var(--line); border-radius:14px; text-align:center; flex:1;"><div style="font-size:10px; font-weight:800; color:var(--muted); text-transform:uppercase;">Total Bill</div><div style="font-size:24px; font-weight:800; color:var(--brand); font-family:'Baloo 2';">${this.money(total)}</div></div>
            </div>`;

        let actions = '';
        if (isReadOnly) {
            actions = `<div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;"><div style="flex:1; padding:14px; background:rgba(240, 169, 59, 0.15); border:1px solid var(--amber); border-radius:14px; text-align:center; color:var(--ink); font-weight:700;">📬 You are invited to this cart. Accept to join and split the bill.</div><button class="btn btn-leaf btn-large" onclick="app.acceptInvite(${g.id})">✓ Accept Invite</button><button class="btn btn-ghost btn-large" onclick="app.declineInvite(${g.id})">Decline</button></div>`;
        } else if (isHost && g.status === 'open') {
            const isDeliverySet = g.customer_name && g.phone && g.delivery_address;
            const isFixedMismatch = g.split_method === 'fixed_contribution' && !hasUnfixed && totalFixed !== total;
            const isOverTotal = g.split_method === 'fixed_contribution' && totalFixed > total;
            const canConfirm = allPaid && shortfall <= 0 && g.items.length > 0 && isDeliverySet && approvedMembers.length >= 2 && !isOverTotal && !isFixedMismatch;
            const byAdderBlocked = g.split_method === 'by_adder' && !g.all_have_items;

            let statusMsg = ''; let isError = false;
            if (!g.items.length) statusMsg = 'Walang laman pa ang cart.';
            else if (approvedMembers.length < 2) { statusMsg = 'Kailangan ng hindi bababa sa 2 miyembro para ma-confirm.'; isError = true; }
            else if (byAdderBlocked) { statusMsg = 'Cannot confirm: "By Items" split is chosen but someone has not added any items yet.'; isError = true; }
            else if (!isDeliverySet) statusMsg = "Please click 'Save Delivery Details' sa kaliwa para makapag-bayad.";
            else if (isOverTotal) { statusMsg = 'Lumalampas ang fixed amounts sa total bill! Bawasan ang ilan.'; isError = true; }
            else if (isFixedMismatch) { statusMsg = 'Kulang ang kabuuang fixed amounts. Kailangang eksaktong magtugma ito sa Total Bill.'; isError = true; }
            else if (shortfall > 0) statusMsg = `Kulang ang bayad ng ${this.money(shortfall)}.`;
            else if (!allPaid) statusMsg = 'Hintayin munang magbayad at ma-verify ang lahat.';

            actions = `<div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">${canConfirm ? '<button class="btn btn-brand btn-large" onclick="app.confirmGroupOrder()">✓ Confirm & Place Order</button>' : `<div style="flex:1; padding:16px; background:${isError ? 'rgba(229,96,77,0.1)' : 'var(--surface2)'}; border:${isError ? '1px solid #e5604d' : '1px solid transparent'}; border-radius:14px; text-align:center; color:${isError ? '#e5604d' : 'var(--muted)'}; font-weight:700;">${statusMsg}</div>`}<button class="btn btn-ghost" onclick="app.inviteToGroup()">📧 Invite via Email</button><button class="btn btn-danger" onclick="app.cancelGroup()">Cancel Bayanihan Cart</button></div>`;
        } else if (g.status === 'open') {
            const blocked = me.paid == 1 && me.payment_method === 'gcash';
            actions = blocked ? '<div style="padding:14px; background:var(--surface2); border-radius:10px; text-align:center; font-weight:700; color:var(--muted); margin-bottom:20px;">Hindi ka pwedeng umalis: nagbayad ka na via GCash. Ipa-refund muna sa host.</div>' : '<button class="btn btn-ghost" style="margin-bottom:20px;" onclick="app.leaveGroup()">Leave Bayanihan Cart</button>';
        }

        let deliveredHighlight = '';
        if (isOrdered) {
            deliveredHighlight = `<div class="co-card" style="margin-bottom:20px; border-color:var(--leaf);"><h3 style="color:var(--leaf); display:flex; justify-content:space-between; align-items:center;"><span style="display:flex; align-items:center; gap:8px;"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Bayanihan Order Summary</span><span class="order-status ${orderStatus === 'Delivered' ? 'status-delivered' : 'status-pending'}">${orderStatus}</span></h3><p style="color:var(--muted); margin-bottom:16px;">Order #${g.order_id} — Here is what everyone contributed:</p><div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">${Object.entries(itemsByUser).map(([uid, grp]) => `<div style="background:var(--bg); padding:16px; border-radius:14px; border:1px solid var(--line);"><div style="font-weight:800; color:var(--brand); margin-bottom:8px; display:flex; align-items:center; gap:6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>${this.esc(grp.name)}</div>${grp.items.map(it => `<div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600; margin-bottom:4px;"><span>${it.qty}× ${this.esc(it.name)}</span><span>${this.money(it.price * it.qty)}</span></div>`).join('')}</div>`).join('')}</div></div>`;
        }

        const editable = isHost && g.status === 'open' && !isReadOnly;
        let currentAddr = { city: '', brgy: '', street: '' };
        let hasSavedAddr = false;
        
        // 1. Check if group cart already has a saved address
        if (g.delivery_address) {
            try { 
                if (g.delivery_address.trim().startsWith('{')) currentAddr = JSON.parse(g.delivery_address);
                else currentAddr.street = g.delivery_address; 
                if (currentAddr.city || currentAddr.brgy || currentAddr.street) hasSavedAddr = true;
            } catch(e) {}
        }
        
        const defaultRecipientName = g.customer_name || (hostMember ? hostMember.name : '');
        const defaultMemberObj = approvedMembers.find(m => m.name === defaultRecipientName);
        const defaultRecipientPhone = g.phone || (defaultMemberObj ? defaultMemberObj.phone : '');

        // 2. If no saved address, fallback to the recipient's saved profile address
        if (!hasSavedAddr && defaultMemberObj && defaultMemberObj.address) {
            try {
                if (defaultMemberObj.address.trim().startsWith('{')) {
                    currentAddr = JSON.parse(defaultMemberObj.address);
                } else {
                    currentAddr.street = defaultMemberObj.address;
                }
            } catch(e) {}
        }

        // 3. Remove phone number from dropdown
        const memberOptions = approvedMembers.map(m => `<option value="${this.esc(m.name)}" ${defaultRecipientName === m.name ? 'selected' : ''}>${this.esc(m.name)}</option>`).join('');
        
        const cityOptions = Object.keys(this.lagunaData).map(c => `<option value="${c}" ${currentAddr.city === c ? 'selected' : ''}>${c}</option>`).join('');
        let brgyOptions = '<option value="" disabled selected>Pumili ng Barangay</option>';
        if (currentAddr.city && this.lagunaData[currentAddr.city]) {
            brgyOptions = Object.keys(this.lagunaData[currentAddr.city]).map(b => `<option value="${b}" ${currentAddr.brgy === b ? 'selected' : ''}>${b}</option>`).join('');
        }

        const deliveryHtml = `
            <div class="co-card" style="margin-bottom:0;">
                <h3><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg> Delivery Details ${!editable ? '<small style="color:var(--muted); font-weight:600; font-size:11px;">(locked)</small>' : ''}</h3>
                <div class="co-row">
                    <div class="co-field">
                        <label>Recipient (Member)</label>
                        <select id="bg-member" class="input" ${editable ? '' : 'disabled'} onchange="app.updateGroupRecipient(this.value)">
                            <option value="" disabled ${!defaultRecipientName ? 'selected' : ''}>Select member...</option>
                            ${memberOptions}
                        </select>
                    </div>
                    <div class="co-field"><label>Contact Number</label><input type="text" id="bg-phone" class="input" value="${this.esc(defaultRecipientPhone || '')}" ${editable ? '' : 'disabled'} placeholder="Ilagay ang contact number"></div>
                </div>
                <div class="co-row">
                    <div class="co-field"><label>Lungsod</label><select id="bg-city" class="input" ${editable ? '' : 'disabled'} onchange="app.updateGroupBrgyDropdown()"><option value="" disabled ${!currentAddr.city ? 'selected' : ''}>Pumili ng Lungsod</option>${cityOptions}</select></div>
                    <div class="co-field"><label>Barangay</label><select id="bg-brgy" class="input" ${editable ? '' : 'disabled'} onchange="app.updateGroupFee()">${brgyOptions}</select></div>
                </div>
                <div class="co-row">
                    <div class="co-field"><label>Additional info (Street, Bldg, Subd)</label><input type="text" id="bg-street" class="input" value="${this.esc(currentAddr.street || '')}" ${editable ? '' : 'disabled'}></div>
                    <div class="co-field"><label>Payment Method (Auto)</label><input type="text" class="input" value="${g.payment_summary}" readonly style="background:var(--bg); color:var(--brand); font-weight:800;"></div>
                </div>
                <div class="co-row">
                    <div class="co-field"><label>Delivery Fee (₱) <span style="color:var(--brand); font-weight:800; font-size:10px;">(Auto)</span></label><input type="number" id="bg-fee" class="input" value="${deliveryFee}" readonly style="background:var(--bg); color:var(--brand); font-weight:800; cursor:not-allowed;"></div>
                </div>
                ${editable ? '<button class="btn btn-ghost" style="margin-top:8px;" onclick="app.saveDeliveryDetails()">Save Delivery Details</button>' : ''}
            </div>`;

        const itemsHtml = `
            <div class="co-card" style="margin-bottom:0; height: 100%;">
                <h3><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg> Items (${g.items.length})</h3>
                ${g.items.length === 0 ? '<p style="color:var(--muted); text-align:center; padding:20px;">Walang laman ang cart.</p>' : Object.entries(itemsByUser).map(([uid, grp]) => `
                    <div style="margin-bottom:16px; border-left:3px solid var(--brand); padding-left:12px;">
                        <div style="font-weight:800; color:var(--brand); margin-bottom:8px; font-size:13px;">Added by: ${this.esc(grp.name)}</div>
                        ${grp.items.map(it => `
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:var(--surface2); border-radius:10px; margin-bottom:6px; gap:10px; flex-wrap:wrap;">
                                <div style="flex:1;"><b style="font-size:13px;">${this.esc(it.name)}</b>${it.variation ? `<div style="font-size:11px; color:var(--brand); font-weight:800;">${this.esc(it.variation)}</div>` : ''}<div style="font-size:11px; color:var(--muted);">${it.qty} × ${this.money(it.price)}</div></div>
                                <div style="display:flex; align-items:center; gap:10px;"><div style="font-family:'Baloo 2'; font-weight:800;">${this.money(it.price * it.qty)}</div>${(g.status === 'open' && (it.user_id === this.user.id || isHost) && !isReadOnly) ? `<button class="btn btn-ghost" style="padding:4px 10px; font-size:11px; border-radius:6px;" onclick='app.openEditGroupItem(${JSON.stringify(it).replace(/'/g, "&#39;")})'>Edit</button>` : ''}</div>
                            </div>`).join('')}
                    </div>`).join('')}
                ${(g.status === 'open' && me.status === 'approved' && !isReadOnly) ? `<button class="btn btn-brand" style="margin-top:10px; width:100%;" onclick="app.addMoreToGroup()">+ Add More Items from Menu</button>` : ''}
            </div>`;

        let splitSettings = '';
        if (isHost && g.status === 'open') {
            splitSettings = `<div class="co-card" style="margin-bottom:0; height: 100%; display: flex; flex-direction: column;">
                <h3><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M3 7h18"/><path d="M6 7l-3 7a3 3 0 0 0 6 0z"/><path d="M18 7l-3 7a3 3 0 0 0 6 0z"/></svg> Split Method</h3>
                <div class="pay-grid" style="grid-template-columns: 1fr; gap: 12px; flex: 1;">
                    ${[['equal', '👥 Equal', 'Pare-pareho ang bayad.'], ['by_adder', '🛒 By Items', 'Bayaran ang idinagdag + equal delivery.'], ['fixed_contribution', '📌 Fixed + Equal', 'Fixed amount sa may marka; rest split.'], ['one_payer', '💳 One Payer', 'Ang designated payer(s) ang sasagot.']].map(([v, l, d]) => `
                        <button type="button" class="pay-opt ${g.split_method === v ? 'active' : ''}" onclick="app.setGroupSplit('${v}')" style="padding: 16px; text-align: left; display: flex; flex-direction: column; gap: 4px;">
                            <b style="font-size: 16px;">${l}</b>
                            <small style="font-size: 12px; color: var(--muted);">${d}</small>
                        </button>
                    `).join('')}
                </div>
            </div>`;
        }

        let approvals = '';
        if (isHost && (pendingMembers.length || invitedMembers.length)) {
            approvals = `<div class="co-card" style="margin-bottom:20px;"><h3><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Pending Members</h3>${pendingMembers.map(p => `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:var(--bg); border-radius:10px; margin-bottom:6px; gap:8px; flex-wrap:wrap;"><div><b>${this.esc(p.name)}</b> <span style="font-size:11px; color:var(--muted);">(requesting)</span></div><div style="display:flex; gap:6px;"><button class="btn btn-leaf" style="padding:4px 10px; font-size:11px;" onclick="app.approveMember(${p.id})">Approve</button><button class="btn btn-ghost" style="padding:4px 10px; font-size:11px;" onclick="app.rejectMember(${p.id})">Reject</button></div></div>`).join('')}${invitedMembers.map(p => `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:var(--bg); border-radius:10px; margin-bottom:6px; gap:8px; flex-wrap:wrap;"><div><b>${this.esc(p.name)}</b> <span style="font-size:11px; color:var(--muted);">(invited)</span></div><button class="btn btn-ghost" style="padding:4px 10px; font-size:11px;" onclick="app.rejectMember(${p.id})">Cancel Invite</button></div>`).join('')}</div>`;
        }

        const splitRows = split.map(s => {
            const m = g.members.find(mm => mm.user_id === s.userId); const isMine = s.userId === this.user.id; const verified = !!m.payer_verified;
            const initials = s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(); const avatarBg = isMine ? 'var(--brand)' : (m.role === 'host' ? 'var(--leaf)' : 'var(--wood)');
            let statusBadge = '';
            if (!m.paid) statusBadge = '<span style="background: rgba(240, 169, 59, 0.15); color: #d98c1d; border: 1px solid rgba(240, 169, 59, 0.4); padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase;">Unpaid</span>';
            else if (verified) statusBadge = '<span style="background: rgba(63, 122, 69, 0.15); color: var(--leaf); border: 1px solid rgba(63, 122, 69, 0.4); padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase;">✓ Verified</span>';
            else statusBadge = '<span style="background: rgba(47, 140, 255, 0.15); color: #2f8cff; border: 1px solid rgba(47, 140, 255, 0.4); padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase;">Awaiting Verify</span>';
            const methodLabel = m.payment_method === 'gcash' ? '📱 GCash' : m.payment_method === 'cash' ? '💵 Cash' : '';
            let flagCtrl = '';
            if (isHost && g.status === 'open') {
                if (g.split_method === 'fixed_contribution') flagCtrl = `<div style="display:flex; align-items:center; gap:6px; margin-top:6px;"><span style="font-size:10px; font-weight:800; color:var(--muted);">₱ Fixed:</span><input type="number" class="input" style="width:60px; padding:2px 6px; font-size:11px; font-weight:800; border-radius:6px; border:1px solid var(--brand); background:var(--bg);" value="${m.fixed_share_amount || 0}" min="0" oninput="app.handleNumInput(this)"><button type="button" class="btn btn-leaf" style="padding: 4px 10px; font-size: 10px; border-radius: 6px; line-height: 1.2; box-shadow: none;" onclick="app.setMemberFixedAmount(${m.id}, this.previousElementSibling.value)">Save</button></div>`;
                else if (g.split_method === 'one_payer') flagCtrl = `<label class="switch" style="transform:scale(0.6); margin-left:-5px; margin-top:6px;"><input type="checkbox" ${m.is_payer ? 'checked' : ''} onchange="app.setMemberFlag(${m.id}, 'is_payer', this.checked)"><span class="slider round"></span></label><span style="font-size:10px; font-weight:800; color:var(--muted); margin-left:-4px;">Payer</span>`;
            }
            const canPaySelf = isMine && !m.paid && g.status === 'open' && s.amount > 0 && !isReadOnly && isDeliverySet;
            const canVerify = isHost && m.paid && !verified && g.status === 'open' && !isReadOnly;
            const canHostMark = isHost && !m.paid && g.status === 'open' && !isReadOnly;
            let actions = '';
            if (canPaySelf) actions = `<button class="btn btn-brand" style="padding:6px 16px; font-size:12px; border-radius:99px; box-shadow:0 4px 10px rgba(217,91,51,0.3);" onclick="app.openPayShareModal(${m.id}, ${s.amount}, false)">Pay ${this.money(s.amount)}</button>`;
            else if (isMine && !isDeliverySet && g.status === 'open' && !isReadOnly) actions = `<span style="color:var(--muted); font-size:11px; font-weight:800; text-align:right; line-height:1.2;">Waiting for<br>Delivery Details</span>`;
            else if (canVerify) actions = `<div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;">${m.payment_method === 'gcash' && m.payment_proof ? `<button class="btn btn-ghost" style="padding:6px 10px; font-size:11px; border-radius:99px;" onclick="app.viewProof('${m.payment_proof}')">View Proof</button>` : ''}<button class="btn btn-leaf" style="padding:6px 12px; font-size:11px; border-radius:99px;" onclick="app.verifyPayment(${m.id}, true)">Verify ✓</button></div>`;
            else if (canHostMark) actions = `<button class="btn btn-leaf" style="padding:6px 12px; font-size:11px; border-radius:99px;" onclick="app.openPayShareModal(${m.id}, ${s.amount}, true)">Mark Paid</button>`;
            else if (isHost && verified && g.status === 'open' && !isReadOnly) actions = `<div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;">${m.payment_method === 'gcash' && m.payment_proof ? `<button class="btn btn-ghost" style="padding:6px 10px; font-size:11px; border-radius:99px;" onclick="app.viewProof('${m.payment_proof}')">View Proof</button>` : ''}<button class="btn btn-ghost" style="padding:4px 10px; font-size:10px; border-radius:99px;" onclick="app.verifyPayment(${m.id}, false)">Unverify</button></div>`;
            if (isHost && m.role !== 'host' && g.status === 'open' && !isReadOnly) {
                const gcashLocked = m.paid == 1 && m.payment_method === 'gcash';
                actions += ` <button class="btn btn-danger group-remove-btn" data-member-id="${m.id}" data-member-name="${this.esc(s.name)}" data-gcash-locked="${gcashLocked ? '1' : '0'}" style="padding:4px 10px; font-size:10px; border-radius:99px; ${gcashLocked ? 'opacity:0.5; cursor:not-allowed;' : ''}" title="${gcashLocked ? 'Locked: Paid via GCash' : 'Remove member'}">✕</button>`;
            }
            return `<div style="display:flex; align-items:center; gap:12px; padding:12px; background:var(--bg); border-radius:14px; margin-bottom:10px; border:1px solid var(--line); flex-wrap:wrap;"><div style="display:flex; align-items:center; gap:10px; flex:1; min-width:150px;"><div style="width:36px; height:36px; border-radius:50%; background:${avatarBg}; color:#fff; display:flex; align-items:center; justify-content:center; font-family:'Baloo 2'; font-weight:800; font-size:14px; flex-shrink:0;">${initials}</div><div><div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;"><b style="font-size:14px; color:var(--ink);">${this.esc(s.name)}</b>${isMine ? '<span style="font-size:9px; color:var(--brand); font-weight:800; background:rgba(217,91,51,0.1); padding:1px 6px; border-radius:4px;">YOU</span>' : ''}${m.role === 'host' ? '<span style="font-size:9px; color:var(--leaf); font-weight:800; background:rgba(63,122,69,0.1); padding:1px 6px; border-radius:4px;">HOST</span>' : ''}</div><div style="display:flex; align-items:center; gap:6px; margin-top:4px; flex-wrap:wrap;">${statusBadge}${methodLabel ? `<span style="font-size:10px; color:var(--muted); font-weight:700;">${methodLabel}</span>` : ''}${flagCtrl}</div></div></div><div style="text-align:right; display:flex; align-items:center; gap:12px; margin-left:auto;"><div style="font-family:'Baloo 2'; font-size:20px; font-weight:800; color:var(--brand); line-height:1;">${this.money(s.amount)}</div><div style="display:flex; flex-direction:column; gap:4px; align-items:flex-end;">${actions}</div></div></div>`;
        }).join('');

        const splitBreakdownHtml = `
            <div class="co-card" style="margin-bottom:0; height: 100%; display: flex; flex-direction: column;">
                <h3 style="margin-bottom: 16px;"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 20V4h5a4 4 0 0 1 0 8H9" /><path d="M5 8h15" /></svg> Split Breakdown</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; background: var(--bg); padding: 12px; border-radius: 14px; border: 1px solid var(--line); text-align: center;">
                    <div><div style="font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase;">Method</div><div style="font-size: 13px; font-weight: 800; color: var(--ink);">${g.split_method === 'equal' ? 'Equal' : g.split_method === 'by_adder' ? 'By Items' : g.split_method === 'fixed_contribution' ? 'Fixed + Equal' : 'One Payer'}</div></div>
                    <div style="border-left: 1px solid var(--line); border-right: 1px solid var(--line);"><div style="font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase;">Subtotal</div><div style="font-size: 13px; font-weight: 800; color: var(--ink);">${this.money(subtotal)}</div></div>
                    <div><div style="font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase;">Delivery</div><div style="font-size: 13px; font-weight: 800; color: var(--ink);">${this.money(deliveryFee)}</div></div>
                </div>
                <div style="flex: 1;">
                    ${!isDeliverySet && g.status === 'open' ? `<div style="margin-bottom: 12px; padding: 10px; background: rgba(240, 169, 59, 0.15); border: 1px solid rgba(240, 169, 59, 0.4); border-radius: 8px; text-align: center; font-size: 12px; color: #d98c1d; font-weight: 800;">⏳ Hintayin munang i-save ng host ang delivery details para makapag-bayad.</div>` : ''}
                    ${splitRows}
                </div>
                <div style="margin-top: 20px; padding-top: 16px; border-top: 2px dashed var(--line); display: flex; justify-content: space-between; align-items: center;"><span style="font-family: 'Baloo 2'; font-size: 20px; font-weight: 800; color: var(--ink);">TOTAL</span><span style="font-family: 'Baloo 2'; font-size: 26px; font-weight: 800; color: var(--brand);">${this.money(total)}</span></div>
                ${!allPaid && g.status === 'open' ? '<div style="margin-top: 16px; padding: 10px; background: rgba(240, 169, 59, 0.1); border: 1px solid rgba(240, 169, 59, 0.3); border-radius: 8px; text-align: center; font-size: 12px; color: #d98c1d; font-weight: 800;">⏳ Hintayin munang magbayad at ma-verify ang lahat.</div>' : (allPaid && g.status === 'open' ? '<div style="margin-top: 16px; padding: 10px; background: rgba(63, 122, 69, 0.1); border: 1px solid rgba(63, 122, 69, 0.3); border-radius: 8px; text-align: center; font-size: 12px; color: var(--leaf); font-weight: 800;">✓ Lahat ay bayad at verified na!</div>' : '')}
                ${shortfall > 0 && allPaid && g.status === 'open' ? `<div style="margin-top: 8px; padding: 10px; background: rgba(229, 96, 77, 0.1); border: 1px solid rgba(229, 96, 77, 0.3); border-radius: 8px; text-align: center; font-size: 12px; color: #e5604d; font-weight: 800;">⚠️ Kulang ng ${this.money(shortfall)} sa total.</div>` : ''}
                ${g.split_method === 'fixed_contribution' && approvedMembers.every(m => (parseInt(m.fixed_share_amount) || 0) > 0) && totalFixed !== total ? `<div style="margin-top: 8px; padding: 10px; background: rgba(229, 96, 77, 0.1); border: 1px solid rgba(229, 96, 77, 0.3); border-radius: 8px; text-align: center; font-size: 12px; color: #e5604d; font-weight: 800;">⚠️ Paalala: Ang total ng fixed amounts ay ${this.money(totalFixed)}, pero ang bill ay ${this.money(total)}. Kailangang magtugma ito.</div>` : ''}
            </div>`;

        let mainContentHtml = '';
        if (isOrdered) mainContentHtml = `<div style="margin-bottom: 20px;">${splitBreakdownHtml}</div><div style="margin-bottom: 20px;">${itemsHtml}</div>`;
        else mainContentHtml = `<div style="display: grid; grid-template-columns: minmax(320px, 1fr) minmax(400px, 1.5fr); gap: 20px; margin-bottom: 20px; align-items: stretch;"><div style="display: flex; flex-direction: column; gap: 20px;">${splitSettings}${deliveryHtml}</div><div>${splitBreakdownHtml}</div></div><div style="margin-bottom: 20px;">${itemsHtml}</div>`;

        body.innerHTML = `
            <div class="page-head" style="margin-bottom:16px;"><button class="btn btn-ghost" style="margin-bottom:12px; padding:6px 14px; font-size:13px;" onclick="app.go('bayanihan')">← Back</button><h1>${this.esc(g.name)}</h1><p>Host: ${this.esc(hostMember.name)}</p></div>
            ${isCancelled ? `<div style="background:rgba(229,96,77,0.1); border-left:3px solid #e5604d; padding:14px; border-radius:8px; margin-bottom:20px; text-align:center;"><b style="color:#e5604d;">❌ Cancelled na ang Bayanihan Cart na ito.</b></div>` : ''}
            ${topCards}${actions}${deliveredHighlight}${approvals}${mainContentHtml}`;

        document.querySelectorAll('.group-remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); this.removeMember(parseInt(btn.dataset.memberId), btn.dataset.memberName, btn.dataset.gcashLocked === '1'); });
        });
    },

    async removeMember(memberId, name, gcashLocked) {
        if (gcashLocked) {
            return this.showToast('Hindi ma-remove: nagbayad na via GCash. I-refund muna.');
        }
        this.showConfirm(
            'Remove Member',
            `Sigurado ka bang aalisin si <b>${this.esc(name)}</b> sa Bayanihan Cart?`,
            async () => {
                const g = this.bayanihan.current;
                const res = await fetch('api.php?action=group-reject-member', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ group_id: g.id, member_id: memberId })
                });
                const data = await res.json();
                if (data.ok) { this.showToast('Naalis na si ' + name + '.'); this.openGroupDetail(g.id); }
                else this.showToast(data.error || 'Failed');
            },
            'Remove'
        );
    },

    openEditGroupItem(item) {
        this._editItemId = item.id;
        document.getElementById('egi-name').textContent = item.name; document.getElementById('egi-qty').value = item.qty;
        const wrap = document.getElementById('egi-options-wrap'); const container = document.getElementById('egi-options-container');
        const prod = this.products.find(p => p.id === item.product_id);
        if (prod && prod.options) {
            try {
                const parsedOpts = JSON.parse(prod.options);
                let html = '';
                for (const [groupName, choices] of Object.entries(parsedOpts)) {
                    const currentVal = item.variation.split(', ').find(v => v.startsWith(groupName + ':'))?.split(': ')[1] || (Array.isArray(choices) ? choices[0] : Object.keys(choices)[0]);
                    const list = Array.isArray(choices) ? choices : Object.keys(choices);
                    html += `<div style="margin-bottom:12px;"><div style="font-size:11px; font-weight:800; color:var(--muted); margin-bottom:4px;">${groupName}</div><div class="ci-radio-pills">${list.map(c => `<label class="ci-radio-label"><input type="radio" name="egi_opt_${groupName}" value="${this.esc(c)}" ${currentVal === c ? 'checked' : ''}><span>${this.esc(c)}</span></label>`).join('')}</div></div>`;
                }
                container.innerHTML = html; wrap.classList.remove('hidden');
            } catch(e) { wrap.classList.add('hidden'); }
        } else { wrap.classList.add('hidden'); }
        document.getElementById('edit-group-item-modal').classList.remove('hidden');
        this.updateBodyScrollLock();
    },

    async saveGroupItemEdit() {
        const qty = parseInt(document.getElementById('egi-qty').value); if (isNaN(qty) || qty < 0) return this.showToast('Invalid quantity.');
        const opts = []; document.querySelectorAll('#egi-options-container input[type="radio"]:checked').forEach(inp => { opts.push(`${inp.name.replace('egi_opt_', '')}: ${inp.value}`); });
        const variation = opts.join(', '); const g = this.bayanihan.current;
        const res = await fetch('api.php?action=group-edit-item', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ group_id: g.id, item_id: this._editItemId, qty, variation }) });
        const data = await res.json();
        if (data.ok) { this.closeModal('edit-group-item-modal'); this.openGroupDetail(g.id); } else this.showToast(data.error || 'Failed');
    },

    updateGroupRecipient(val) { 
        if (!this.bayanihan.current) return;
        const member = this.bayanihan.current.members.find(m => m.name === val);
        
        if (member) {
            // Auto-fill Phone
            const phoneInput = document.getElementById('bg-phone');
            if (phoneInput) {
                phoneInput.value = member.phone || '';
                phoneInput.readOnly = false;
            }

            // Auto-fill Address
            let addr = { street: '', brgy: '', city: '' };
            if (member.address) {
                try {
                    if (member.address.trim().startsWith('{')) {
                        addr = JSON.parse(member.address);
                    } else {
                        addr.street = member.address;
                    }
                } catch(e) {}
            }

            const citySelect = document.getElementById('bg-city');
            const brgySelect = document.getElementById('bg-brgy');
            const streetInput = document.getElementById('bg-street');

            if (citySelect && addr.city && this.lagunaData[addr.city]) {
                // Set City
                citySelect.value = addr.city;
                
                // Manually populate Barangays to ensure it stays editable and selects the right one
                brgySelect.innerHTML = '<option value="" disabled>Pumili ng Barangay</option>';
                Object.keys(this.lagunaData[addr.city]).forEach(b => {
                    brgySelect.innerHTML += `<option value="${b}" ${addr.brgy === b ? 'selected' : ''}>${b}</option>`;
                });
                
                // Update Fee based on the auto-selected Barangay
                if (addr.brgy && this.lagunaData[addr.city][addr.brgy] !== undefined) {
                    document.getElementById('bg-fee').value = this.lagunaData[addr.city][addr.brgy];
                } else {
                    document.getElementById('bg-fee').value = 0;
                }
            }
            
            if (streetInput) streetInput.value = addr.street || '';
        }
    },

    updateGroupBrgyDropdown() {
        const city = document.getElementById('bg-city').value; const brgySelect = document.getElementById('bg-brgy');
        brgySelect.innerHTML = '<option value="" disabled selected>Pumili ng Barangay</option>';
        if (this.lagunaData[city]) { Object.keys(this.lagunaData[city]).forEach(b => { brgySelect.innerHTML += `<option value="${b}">${b}</option>`; }); }
        this.updateGroupFee();
    },

    updateModalBrgyDropdown(prefix, selectedBrgy = '') {
        const city = document.getElementById(`bg-${prefix}-city`).value;
        const brgySelect = document.getElementById(`bg-${prefix}-brgy`);
        brgySelect.innerHTML = '<option value="" disabled selected>Pumili ng Barangay</option>';
        if (this.lagunaData[city]) {
            Object.keys(this.lagunaData[city]).forEach(b => {
                brgySelect.innerHTML += `<option value="${b}" ${selectedBrgy === b ? 'selected' : ''}>${b}</option>`;
            });
        }
        this.updateModalFee(prefix);
    },

    updateModalFee(prefix) {
        const city = document.getElementById(`bg-${prefix}-city`).value;
        const brgy = document.getElementById(`bg-${prefix}-brgy`).value;
        let fee = 0;
        if (city && brgy && this.lagunaData[city] && this.lagunaData[city][brgy] !== undefined) {
            fee = this.lagunaData[city][brgy];
        }
        document.getElementById(`bg-${prefix}-fee`).value = fee;
    },

    updateGroupFee() {
        const city = document.getElementById('bg-city').value; const brgy = document.getElementById('bg-brgy').value;
        let fee = 0; if (city && brgy && this.lagunaData[city] && this.lagunaData[city][brgy] !== undefined) fee = this.lagunaData[city][brgy];
        document.getElementById('bg-fee').value = fee;
    },
    async saveDeliveryDetails() {
        const g = this.bayanihan.current; const sel = document.getElementById('bg-member'); const name = sel.options[sel.selectedIndex].text.split(' (')[0];
        const phone = document.getElementById('bg-phone').value.trim(); const city = document.getElementById('bg-city').value; const brgy = document.getElementById('bg-brgy').value;
        const street = document.getElementById('bg-street').value.trim(); const fee = parseInt(document.getElementById('bg-fee').value) || 0;
        
        if (!city || !brgy) return this.showToast('Pumili ng Lungsod at Barangay.'); 
        if (!phone) return this.showToast('Ilagay ang contact number.');
        
        const address = JSON.stringify({ street, brgy, city }); const payload = { group_id: g.id, name, phone, address, fee };

        this.showConfirm('Save Delivery', 'I-save ang delivery details na ito?', async () => {
            const res = await fetch('api.php?action=group-set-delivery', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
            const data = await res.json();
            if (data.ok) { this.showToast('Delivery details saved!'); this.openGroupDetail(g.id); } else this.showToast(data.error || 'Failed');
        }, 'Save');
    },

    async setGroupSplit(method) {
        const g = this.bayanihan.current; if (!g) return;
        const alreadyPaid = g.members.filter(m => m.status === 'approved' && m.paid == 1);
        const doChange = async () => { await fetch('api.php?action=group-set-split', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ group_id: g.id, method, fixed_amount: g.fixed_amount || 0 }) }); this.openGroupDetail(g.id); };
        if (alreadyPaid.length > 0) {
            const msg = `Baguhin ang split to <b>"${method.replace(/_/g,' ')}"</b>?<br><br>⚠️ <b>${alreadyPaid.length} member(s) already paid:</b><br><div style="text-align: left; background: rgba(0,0,0,0.05); padding: 12px; border-radius: 8px; margin: 12px 0; line-height: 1.5;">` + alreadyPaid.map(m => `• ${this.esc(m.name)}`).join('<br>') + `</div>Ma-reset lahat ng bayad. Tuloy?`;
            this.showConfirm('Change Split Method', msg, doChange, 'Tuloy');
        } else doChange();
    },

    async setMemberFlag(memberId, field, value) {
        const g = this.bayanihan.current; const alreadyPaid = g.members.filter(m => m.status === 'approved' && m.paid == 1);
        const doChange = async () => { await fetch('api.php?action=group-set-member-flag', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ group_id: g.id, member_id: memberId, field, value: value ? 1 : 0 }) }); this.openGroupDetail(g.id); };
        if (alreadyPaid.length > 0) this.showConfirm('Change Member Flag', `Baguhin ang <b>${field.replace('is_','')}</b> flag?<br><br>⚠️ Ma-reset ang bayad ng <b>${alreadyPaid.length}</b> member(s).<br><br>Tuloy?`, doChange, 'Tuloy');
        else doChange();
    },

    async setMemberFixedAmount(memberId, val) {
        const g = this.bayanihan.current; const alreadyPaid = g.members.filter(m => m.status === 'approved' && m.paid == 1);
        if (alreadyPaid.length > 0) { if (!confirm(`Baguhin ang fixed amount?\n\n⚠️ Ma-reset ang bayad ng ${alreadyPaid.length} member(s). Tuloy?`)) return; }
        await fetch('api.php?action=group-set-member-fixed-amount', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ group_id: g.id, member_id: memberId, amount: parseInt(val) || 0 }) });
        this.openGroupDetail(g.id);
    },

    async approveMember(memberId) { const g = this.bayanihan.current; await fetch('api.php?action=group-approve-member', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ group_id: g.id, member_id: memberId }) }); this.openGroupDetail(g.id); },
    async rejectMember(memberId) { const g = this.bayanihan.current; await fetch('api.php?action=group-reject-member', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ group_id: g.id, member_id: memberId }) }); this.openGroupDetail(g.id); },
    
    openPayShareModal(memberId, amount, isHostMarking = false) {
        this._payMemberId = memberId; this._payAmount = amount; this._isHostMarking = isHostMarking; this._shareProof = '';
        document.getElementById('bg-pay-amount').textContent = isHostMarking ? `Mark as Paid: ${this.money(amount)}` : `Amount: ${this.money(amount)}`;
        document.getElementById('bg-share-preview').style.display = 'none'; document.getElementById('bg-share-title').textContent = 'Upload GCash screenshot'; document.getElementById('bg-share-drop').classList.remove('has-file');
        this.selectShareMethod('cash'); 
        document.getElementById('bayanihan-pay-modal').classList.remove('hidden');
        this.updateBodyScrollLock();
    },
    selectShareMethod(method) {
        document.getElementById('bg-pay-cash').classList.toggle('active', method === 'cash'); document.getElementById('bg-pay-gcash').classList.toggle('active', method === 'gcash');
        document.getElementById('bg-gcash-box').classList.toggle('hidden', method !== 'gcash'); this._shareMethod = method;
    },
    handleShareProof(e) {
        const file = e.target.files[0]; if (!file) return;
        if (file.size > 10 * 1024 * 1024) { this.showToast('Max 10MB lang.'); e.target.value = ''; return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const c = document.createElement('canvas'); const scale = Math.min(1, 800 / Math.max(img.width, img.height));
                c.width = img.width * scale; c.height = img.height * scale; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
                this._shareProof = c.toDataURL('image/jpeg', 0.7);
                const prev = document.getElementById('bg-share-preview'); prev.src = this._shareProof; prev.style.display = 'block';
                document.getElementById('bg-share-drop').classList.add('has-file'); document.getElementById('bg-share-title').textContent = 'Screenshot attached ✓';
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    },
    async submitSharePayment() {
        const g = this.bayanihan.current; if (!g || !this._payMemberId) return;
        if (this._shareMethod === 'gcash' && !this._shareProof) return this.showToast('I-upload muna ang GCash screenshot.');
        
        const action = this._isHostMarking ? 'group-mark-paid' : 'group-member-pay';
        const payload = this._isHostMarking 
            ? { group_id: g.id, member_id: this._payMemberId, paid: 1, amount: this._payAmount, method: this._shareMethod, proof: this._shareProof } 
            : { group_id: g.id, method: this._shareMethod, proof: this._shareProof, amount: this._payAmount };

        this.showConfirm('Confirm Payment', `I-submit ang bayad na <b>${this.money(this._payAmount)}</b>?`, async () => {
            const res = await fetch(`api.php?action=${action}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
            const data = await res.json();
            if (data.ok) { 
                this.closeModal('bayanihan-pay-modal'); 
                this.showToast(this._isHostMarking ? 'Payment marked as paid and verified!' : (this._shareMethod === 'gcash' ? 'Payment submitted! Hintayin ang verification ng host.' : 'Marked as cash. Host will verify.')); 
                this.openGroupDetail(g.id); 
            } else this.showToast(data.error || 'Failed');
        }, 'Submit Payment');
    },

    async verifyPayment(memberId, verify) {
        const g = this.bayanihan.current; const m = g.members.find(mm => mm.id === memberId); if (!m) return;
        let msg = verify ? `Verify payment from <b>${this.esc(m.name)}</b>?` : `Unverify payment from <b>${this.esc(m.name)}</b>?`;
        if (verify && m.payment_method === 'gcash' && m.payment_proof) msg += `<div style="margin-top:12px; border-radius:8px; overflow:hidden; border:1px solid var(--line);"><img src="${m.payment_proof}" style="width:100%; max-height:200px; object-fit:contain; background:#fff;"></div>`;
        this.showConfirm(verify ? 'Verify Payment' : 'Unverify Payment', msg, async () => {
            await fetch('api.php?action=group-verify-payment', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ group_id: g.id, member_id: memberId, verify: verify ? 1 : 0 }) });
            this.openGroupDetail(g.id);
        }, verify ? 'Verify ✓' : 'Unverify');
    },

    inviteToGroup() { document.getElementById('bg-invite-email').value = ''; document.getElementById('bayanihan-invite-modal').classList.remove('hidden'); },
    async submitInvite() {
        const g = this.bayanihan.current; const email = document.getElementById('bg-invite-email').value.trim();
        if (!email) return this.showToast('Ilagay ang email address.');

        this.showConfirm('Invite User', `Ipadala ang invite kay <b>${this.esc(email)}</b>?`, async () => {
            const res = await fetch('api.php?action=group-invite', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ group_id: g.id, email }) });
            const data = await res.json();
            if (data.ok) { this.closeModal('bayanihan-invite-modal'); this.showToast('Invite sent!'); this.openGroupDetail(g.id); } else this.showToast(data.error || 'Failed');
        }, 'Send Invite');
    },

    addMoreToGroup() { const g = this.bayanihan.current; if (!g) return; this._lastGroupId = g.id; this.showToast(`Adding items to: ${g.name}`); this.go('home'); setTimeout(() => this.scrollToMenu(), 200); },

    async confirmGroupOrder() {
        this.showConfirm('Confirm Order', 'Confirm this Bayanihan order? Stock will be deducted.', async () => {
            const g = this.bayanihan.current;
            const res = await fetch('api.php?action=group-confirm-order', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ group_id: g.id }) });
            const data = await res.json();
            if (data.ok) { 
                this.showToast(`Order #${data.order_id} placed!`); 
                this.bayanihan.activeGroupId = null; 
                await this.refreshData(); 
                this.go('orders'); 
                
                // 🟢 Trigger Happy Bot
                this.triggerHappyBot();
                
            } else this.showToast(data.error || 'Failed');
        }, 'Confirm');
    },

    async leaveGroup() {
        const g = this.bayanihan.current; if (!g) return;
        const me = g.members.find(m => m.user_id === this.user.id);
        if (me && me.paid == 1 && me.payment_method === 'gcash') return this.showToast('Hindi ka pwedeng umalis: nagbayad ka na via GCash. Ipa-refund muna sa host.');
        const myItems = g.items.filter(it => it.user_id === this.user.id); const itemCount = myItems.reduce((s, it) => s + it.qty, 0);
        const itemList = myItems.length ? `\n\n⚠️ MAWAWALA ang iyong ${itemCount} item(s):\n• ${myItems.map(it => `${it.qty}× ${it.name}`).join('\n• ')}` : '';
        this.showConfirm('Leave Bayanihan Cart?', `Ma-reset din ang bayad ng iba pang miyembro.${itemList}\n\nSigurado ka ba?`, async () => {
            const res = await fetch('api.php?action=group-leave', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ group_id: g.id }) });
            const data = await res.json(); if (!data.ok) { this.showToast(data.error || 'Failed'); return; }
            this.bayanihan.activeGroupId = null; this.showToast('You left the Bayanihan Cart.'); this.go('bayanihan');
        }, 'Leave');
    },

    async cancelGroup() {
        const g = this.bayanihan.current; if (!g) return;
        const gcashPaid = g.members.filter(m => m.paid == 1 && m.payment_method === 'gcash');
        if (gcashPaid.length > 0) return this.showToast(`Hindi ma-cancel: may ${gcashPaid.length} member na nagbayad via GCash. Ipa-refund muna.`);
        const approvedCount = g.members.filter(m => m.status === 'approved').length; const itemCount = g.items.reduce((s, it) => s + it.qty, 0);
        
        const trashIcon = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#e5604d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-left: 6px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
        
        const messageHtml = `
            <div style="text-align: left; background: rgba(0,0,0,0.04); padding: 12px 16px; border-radius: 12px; margin-bottom: 16px; line-height: 1.6;">
                • ${approvedCount} member(s) mawawalan ng access<br>
                • ${itemCount} item(s) mawawala<br>
                • Lahat ng bayad mawawala
            </div>
            <b style="color: var(--ink); font-size: 15px;">HINDI na maibabalik. Sigurado ka ba?</b>
        `;

        this.showConfirm(`Cancel Bayanihan Cart? ${trashIcon}`, messageHtml, async () => {
            const res = await fetch('api.php?action=group-cancel', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ group_id: g.id }) });
            const data = await res.json(); if (!data.ok) { this.showToast(data.error || 'Failed'); return; }
            this.bayanihan.activeGroupId = null; this.showToast('Bayanihan Cart cancelled.'); this.go('bayanihan');
        }, 'Yes, Cancel');
    },

    async confirmAddToBayanihanNew() {
        const gid = document.getElementById('add-to-bayanihan-select').value; if (!gid || !this.pendingCartItem) return;
        const p = this.pendingCartItem; const grp = this.bayanihan.list.find(x => x.id == gid); const grpName = grp ? grp.name : 'Bayanihan Cart';
        const opts = []; document.querySelectorAll('#add-confirm-item-box input[type="radio"]:checked').forEach(inp => { opts.push(`${inp.name.replace('opt_', '')}: ${inp.value}`); });
        const variation = opts.join(', ');
        try {
            const res = await fetch('api.php?action=group-add-item', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ group_id: gid, product_id: p.id, qty: this.pendingQty, variation }) });
            const data = await res.json();
            if (data.ok) { this.showToast(`${p.name} added to ${grpName}!`); this.closeAddModal(); } else this.showToast(data.error || 'Failed');
        } catch (e) { this.showToast('Connection error'); }
    },

    async renderAdminBayanihan() {
        const grid = document.getElementById('admin-groups-grid'); if (!grid) return;
        grid.innerHTML = '<p style="text-align:center; color:var(--muted); padding:20px;">Loading...</p>';
        try {
            const res = await fetch('api.php?action=admin-list-groups'); 
            const groups = await res.json();

            if (groups.error) {
                grid.innerHTML = `<p style="text-align:center; color:#e5604d; padding:20px; font-weight:800;">Error: ${groups.error}</p>`;
                return;
            }

            const searchQuery = (document.getElementById('admin-group-search')?.value || '').toLowerCase().trim();
            const filter = (document.getElementById('admin-group-status')?.value) || 'all'; 
            
            const filtered = groups.filter(g => {
                const matchStatus = filter === 'all' || g.status === filter;
                const matchSearch = (g.name || '').toLowerCase().includes(searchQuery) || (g.host_name || '').toLowerCase().includes(searchQuery);
                return matchStatus && matchSearch;
            });
            
            if (!filtered.length) { 
                grid.innerHTML = '<div class="empty-state"><h3>Walang Bayanihan Cart</h3><p>Wala pang gumawa ng group cart.</p></div>'; 
                return; 
            }
            
            grid.innerHTML = filtered.map(g => {
                const statusClass = g.status === 'open' ? 'status-pending' : g.status === 'ordered' ? 'status-delivered' : g.status === 'cancelled' ? 'status-out' : 'status-shipping';
                const hasGcash = parseInt(g.gcash_paid_count) > 0;
                return `<div class="admin-order-card" style="cursor:pointer;" onclick="app.viewAdminGroup(${g.id})"><div class="admin-order-header"><div><h4>${this.esc(g.name)}</h4><span class="admin-order-date">Host: ${this.esc(g.host_name)}</span></div><span class="order-status ${statusClass}">${this.esc(g.status)}</span></div><div style="padding:12px; background:var(--surface2); border-radius:12px; text-align:center;"><div style="font-size:10px; font-weight:800; color:var(--muted); text-transform:uppercase;">Code</div><div style="font-size:22px; font-weight:900; letter-spacing:4px; color:var(--brand); font-family:'Baloo 2';">${this.esc(g.code)}</div></div><div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:12px; font-weight:700;"><div>👥 Members: <b>${g.member_count}</b></div><div>⏳ Pending: <b>${g.pending_count}</b></div><div>💰 Subtotal: <b style="color:var(--brand);">${this.money(g.subtotal)}</b></div><div>✅ Verified: <b>${g.verified_count}/${g.member_count}</b></div></div>${hasGcash ? `<div style="padding:8px 12px; background:rgba(47,140,255,0.1); border-left:3px solid #2f8cff; border-radius:6px; font-size:11px; font-weight:800; color:#2f8cff;">📱 ${g.gcash_paid_count} member(s) paid via GCash — cart locked from cancellation</div>` : ''}</div>`;
            }).join('');
        } catch (e) { 
            grid.innerHTML = '<p style="text-align:center; color:#e5604d;">Error loading groups. Check console for details.</p>'; 
            console.error('Bayanihan Error:', e); 
        }
    },

    async viewAdminGroup(gid) {
        try {
            const res = await fetch('api.php?action=admin-get-group', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: gid }) });
            const g = await res.json(); 
            if (g.error) { this.showToast(g.error); return; }
            
            // Safely default arrays to empty if undefined to prevent .reduce() / .filter() crashes
            const items = g.items || [];
            const members = g.members || [];
            
            const subtotal = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0); 
            const deliveryFee = parseInt(g.delivery_fee) || 0; 
            const total = subtotal + deliveryFee;
            
            const approved = members.filter(m => m.status === 'approved'); 
            const gcashPaid = approved.filter(m => m.paid == 1 && m.payment_method === 'gcash');
            
            const body = document.getElementById('admin-group-detail-body');
            if (!body) return; // Safety check

            body.innerHTML = `
                <div class="page-head">
                    <button class="btn btn-ghost" style="margin-bottom:12px; padding:6px 14px; font-size:13px;" onclick="app.go('admin')">← Back to Dashboard</button>
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div>
                            <h1>${this.esc(g.name)}</h1>
                            <p>Host: ${this.esc(approved.find(m => m.role === 'host')?.name || '—')} · Status: <b>${this.esc(g.status)}</b></p>
                        </div>
                        ${g.status !== 'cancelled' ? `<button class="btn btn-danger" onclick="app.promptAdminDelete('Bayanihan Cart', ${g.id}, '${this.esc(g.name)}', 'admin-archive-group')">Archive Cart</button>` : ''}
                    </div>
                </div>
                ${gcashPaid.length ? `<div style="padding:14px; background:rgba(47,140,255,0.1); border-left:4px solid #2f8cff; border-radius:10px; margin-bottom:20px;"><b style="color:#2f8cff;">📱 GCash Payments Locked</b><p style="font-size:12px; margin-top:4px; color:var(--ink); font-weight:600;">${gcashPaid.length} member(s) already paid via GCash — this cart cannot be cancelled.</p></div>` : ''}
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
                    <div class="co-card"><h3>📍 Delivery</h3><p style="font-size:13px; font-weight:600; line-height:1.7;"><b>Recipient:</b> ${this.esc(g.customer_name || '—')}<br><b>Phone:</b> ${this.esc(g.phone || '—')}<br><b>Address:</b> ${this.esc(this.formatAddress(g.delivery_address) || '—')}<br><b>Payment:</b> ${g.payment ? g.payment.toUpperCase() : 'N/A'}<br><b>Delivery Fee:</b> ${this.money(deliveryFee)}</p></div>
                    <div class="co-card"><h3>💰 Totals</h3><p style="font-size:13px; font-weight:600; line-height:1.7;"><b>Subtotal:</b> ${this.money(subtotal)}<br><b>Total:</b> <span style="color:var(--brand); font-size:18px; font-family:'Baloo 2';">${this.money(total)}</span><br><b>Split Method:</b> ${(g.split_method || 'equal').replace(/_/g, ' ')}<br><b>Order ID:</b> ${g.order_id || '—'}</p></div>
                </div>
                <div class="co-card" style="margin-bottom:20px;">
                    <h3>👥 Members (${approved.length} approved)</h3>
                    ${members.length === 0 ? '<p style="text-align:center; color:var(--muted); padding:20px;">No members.</p>' : members.map(m => {
                        const statusBadge = m.status === 'approved' ? '✅' : m.status === 'pending' ? '⏳' : m.status === 'invited' ? '📬' : '❌';
                        // Safely default payment_method to 'CASH' if null to prevent .toUpperCase() crash
                        const payBadge = m.paid == 1 ? (m.payer_verified == 1 ? `<span style="color:var(--leaf); font-weight:800;">✓ Verified (${(m.payment_method || 'CASH').toUpperCase()}) ${this.money(m.paid_amount || 0)}</span>${m.payment_method === 'gcash' && m.payment_proof ? `<button class="btn btn-ghost" style="padding:2px 8px; font-size:10px; margin-left:8px;" onclick="app.viewProof('${m.payment_proof}')">View Proof</button>` : ''}` : `<span style="color:var(--amber); font-weight:800;">⏳ Awaiting verify (${(m.payment_method || 'CASH').toUpperCase()})</span>`) : '<span style="color:var(--muted); font-weight:700;">Unpaid</span>';
                        return `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:var(--bg); border-radius:10px; margin-bottom:6px; gap:8px; flex-wrap:wrap;"><div><b>${statusBadge} ${this.esc(m.name)}</b> <span style="font-size:11px; color:var(--muted);">${this.esc(m.email || '')}</span> ${m.role === 'host' ? '<span style="font-size:10px; color:var(--leaf); font-weight:800; margin-left:6px;">HOST</span>' : ''}</div><div style="font-size:12px;">${payBadge}</div></div>`;
                    }).join('')}
                </div>
                <div class="co-card"><h3><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg> Items (${items.length})</h3>${items.length === 0 ? '<p style="text-align:center; color:var(--muted); padding:20px;">No items.</p>' : items.map(it => `<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:var(--surface2); border-radius:10px; margin-bottom:6px;"><div><b style="font-size:13px;">${this.esc(it.name)}</b><div style="font-size:11px; color:var(--muted);">by ${this.esc(it.user_name || 'Unknown')} · ${it.qty} × ${this.money(it.price)}</div></div><div style="font-family:'Baloo 2'; font-weight:800;">${this.money(it.price * it.qty)}</div></div>`).join('')}</div>`;
            this.go('admin-group-detail');
        } catch (e) { this.showToast('Error loading group'); console.error(e); }
    },

    renderAdminFees() {
        const grid = document.getElementById('admin-fees-grid'); if (!grid) return;
        const query = (document.getElementById('admin-fee-search')?.value || '').toLowerCase();
        const filtered = this.deliveryFeesRaw.filter(f => f.city.toLowerCase().includes(query) || f.barangay.toLowerCase().includes(query));
        if (!filtered.length) { grid.innerHTML = '<p style="text-align:center; color:var(--muted); grid-column:1/-1;">No locations found.</p>'; return; }
        grid.innerHTML = filtered.map(f => `
            <div class="admin-inv-card" style="flex-direction:column; align-items:stretch; gap:12px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div><h4 style="color:var(--brand); font-size:15px; margin-bottom:2px;">${this.esc(f.barangay)}</h4><div style="font-size:11px; color:var(--muted); font-weight:700;">${this.esc(f.city)}</div></div>
                    <button class="qty-circle-btn" style="color:#e5604d; border-color:rgba(229,96,77,0.3); width:28px; height:28px;" onclick="app.deleteFee(${f.id})" title="Delete">✕</button>
                </div>
                <div style="display:flex; gap:8px; align-items:center;"><span style="font-weight:800; color:var(--muted);">₱</span><input type="number" class="input" style="padding:6px 10px; font-size:14px; font-weight:800;" value="${f.fee}" id="fee-input-${f.id}" min="0" oninput="app.handleNumInput(this)"><button class="btn btn-leaf" style="padding:6px 12px; font-size:12px;" onclick="app.saveFee(${f.id})">Save</button></div>
            </div>`).join('');
    },

    async saveFee(id) {
        const fee = parseInt(document.getElementById(`fee-input-${id}`).value); 
        if (isNaN(fee) || fee < 0) return this.showToast('Invalid fee amount. Must be 0 or greater.');

        this.showConfirm('Update Fee', 'I-save ang bagong delivery fee?', async () => {
            try {
                const res = await fetch('api.php?action=admin-update-fee', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id, fee }) });
                const data = await res.json();
                if (data.ok) { this.showToast('Fee updated!'); await this.refreshData(); this.renderAdminFees(); } else this.showToast(data.error || 'Failed');
            } catch(e) { this.showToast('Connection error'); }
        }, 'Save');
    },

    deleteFee(id) {
        const fee = this.deliveryFeesRaw.find(f => f.id === id);
        const name = fee ? `${fee.barangay}, ${fee.city}` : 'Location';
        this.promptAdminDelete('Delivery Location', id, name, 'admin-delete-fee');
    },

    openAddFeeModal() {
        document.getElementById('new-fee-city').value = ''; 
        document.getElementById('new-fee-brgy').value = ''; 
        document.getElementById('new-fee-amount').value = ''; 
        document.getElementById('add-fee-modal').classList.remove('hidden');
        this.updateBodyScrollLock();
    },

    async submitAddFee() {
        const city = document.getElementById('new-fee-city').value.trim(); 
        const barangay = document.getElementById('new-fee-brgy').value.trim(); 
        const fee = parseInt(document.getElementById('new-fee-amount').value);
        
        if (!city || !barangay) return this.showToast('Fill in City and Barangay.'); 
        if (isNaN(fee) || fee < 0) return this.showToast('Invalid fee amount.');

        this.showConfirm('Add Location', `I-add ang <b>${this.esc(barangay)}, ${this.esc(city)}</b> na may fee na <b>₱${fee}</b>?`, async () => {
            const btn = document.querySelector('#custom-confirm-modal #cc-confirm-btn');
            this.setBtnLoading(btn, true);
            try {
                const res = await fetch('api.php?action=admin-add-fee', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ city, barangay, fee }) });
                const data = await res.json();
                if (data.ok) { this.closeModal('add-fee-modal'); this.showToast('Location added!'); await this.refreshData(); this.renderAdminFees(); } 
                else this.showToast(data.error || 'Failed');
            } catch(e) { this.showToast('Connection error'); } 
            finally {
                this.setBtnLoading(btn, false);
            }
        }, 'Add Location');
    },
}

window.addEventListener('resize', () => app.sizeHeroVideo());
window.addEventListener('orientationchange', () => setTimeout(() => app.sizeHeroVideo(), 300));
window.addEventListener('load', () => app.sizeHeroVideo());
document.addEventListener('click', () => {
    document.querySelectorAll('.status-dropdown-menu').forEach(m => m.classList.add('hidden'));
});
window.app = app;
document.addEventListener('DOMContentLoaded', () => app.init());

/* ============================================================
   GLOBAL DRAG PREVENTION FOR IMAGES
   ============================================================ */
document.addEventListener('dragstart', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

/* ============================================================
   GLOBAL IMAGE PROTECTION DETERRENTS
   ============================================================ */

// 1. Prevent Right-Click (Context Menu) on Images
document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
        if (window.app && typeof window.app.showToast === 'function') {
            window.app.showToast('Right-click is disabled to protect our images, suki!');
        }
    }
});

// 2. Prevent Middle-Click (Open in new tab) on Images
document.addEventListener('mousedown', function(e) {
    if (e.button === 1 && e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

// 3. Prevent Ctrl+S (Save Page) which saves all images
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        // Check if we are inside an input field first
        const activeEl = document.activeElement;
        const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
        
        if (!isInput) {
            e.preventDefault();
            if (window.app && typeof window.app.showToast === 'function') {
                window.app.showToast('Saving the page is disabled, suki.');
            }
        }
    }
});

// 4. Prevent dragging (redundant with CSS, but safe for older browsers)
document.addEventListener('dragstart', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');
  const charCounter = document.getElementById('char-counter');
  const submitBtn = document.getElementById('contact-submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnSpinner = submitBtn.querySelector('.btn-spinner');
  const alertBox = document.getElementById('contact-alert');
  const alertIcon = document.getElementById('contact-alert-icon');
  const alertMsg = document.getElementById('contact-alert-msg');

  // 1. Validators
  const isValidEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  // 🟢 Reject numbers and special characters (allows letters, spaces, dots, hyphens)
  const isValidName = (name) => {
    const re = /^[a-zA-Z\s\.\-]+$/;
    return re.test(name) && name.trim().length >= 2;
  };

  const validateField = (group, condition) => {
    if (condition) {
      group.classList.remove('error');
      group.classList.add('success');
      return true;
    } else {
      group.classList.remove('success');
      group.classList.add('error');
      return false;
    }
  };

  // 2. Real-time Character Counter
  const messageGroup = document.getElementById('group-message');
  messageInput.addEventListener('input', () => {
    const currentLength = messageInput.value.length;
    charCounter.textContent = `${currentLength} / 500`;

    if (currentLength < 10 || currentLength > 500) {
      charCounter.style.color = '#e5604d';
    } else {
      charCounter.style.color = 'var(--leaf)';
    }

    // Auto-clear error once it hits valid length
    if (currentLength >= 10 && currentLength <= 500) {
      messageGroup.classList.remove('error');
      messageGroup.classList.add('success');
    } else {
      messageGroup.classList.remove('success');
    }
  });

  // 3. Real-time Event Listeners
  nameInput.addEventListener('blur', () => {
    validateField(document.getElementById('group-fullname'), isValidName(nameInput.value.trim()));
  });

  emailInput.addEventListener('blur', () => {
    validateField(document.getElementById('group-email'), isValidEmail(emailInput.value.trim()));
  });

  subjectInput.addEventListener('blur', () => {
    validateField(document.getElementById('group-subject'), subjectInput.value.trim().length >= 4);
  });

  // 4. Alert Helpers
  const showAlert = (type, message) => {
    alertBox.className = `contact-alert ${type}`;
    
    // Inject SVG icons instead of emojis
    if (type === 'success') {
      alertIcon.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else {
      alertIcon.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    }
    
    alertMsg.textContent = message;
    alertBox.classList.remove('hidden');
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const hideAlert = () => {
    alertBox.classList.add('hidden');
  };

  // 5. Form Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    // Validate all fields
    const isNameValid = validateField(document.getElementById('group-fullname'), isValidName(nameInput.value.trim()));
    const isEmailValid = validateField(document.getElementById('group-email'), isValidEmail(emailInput.value.trim()));
    const isSubjectValid = validateField(document.getElementById('group-subject'), subjectInput.value.trim().length >= 4);
    const isMessageValid = validateField(document.getElementById('group-message'), messageInput.value.trim().length >= 10);

    if (!isNameValid || !isEmailValid || !isSubjectValid || !isMessageValid) {
      showAlert('error', 'Paki-ayos ang mga inputs. Tingnan ang mga pulang box.');
      return;
    }

    // Set UI to loading state
    submitBtn.disabled = true;
    btnText.textContent = 'Ipinapadala...';
    btnSpinner.classList.remove('hidden');

    const formData = new FormData(form);
    formData.append('action', 'contact_submit');

    try {
      const response = await fetch('api.php', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showAlert('success', result.message || 'Salamat! Naimbak na ang iyong mensahe.');
        form.reset();
        charCounter.textContent = '0 / 500';
        
        // Clear borders
        document.querySelectorAll('.form-group').forEach(g => {
          g.classList.remove('success', 'error');
        });
      } else {
        showAlert('error', result.error || 'Nagkaroon ng problema sa server. Subukan muli.');
      }
    } catch (error) {
      showAlert('error', 'Walang signal sa server. Paki-check ang iyong internet connection.');
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'Ipadala ang Mensahe';
      btnSpinner.classList.add('hidden');
    }
  });
});
document.addEventListener('touchstart', function(e) {
  if (e.target.closest('button, .btn, .dept-pill')) {
    e.target.closest('button, .btn, .dept-pill').style.touchAction = 'manipulation';
  }
}, { passive: true });