const app = {
    showConfirm(title, message, onConfirm, btnText = 'Confirm') {
        document.getElementById('cc-title').textContent = title;
        document.getElementById('cc-message').innerHTML = message; // 🟢 Changed to innerHTML
        const btn = document.getElementById('cc-confirm-btn');
        btn.textContent = btnText;
        
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.onclick = () => {
            this.closeModal('custom-confirm-modal');
            onConfirm();
        };
        
        document.getElementById('custom-confirm-modal').classList.remove('hidden');
    },
    
    botBrain: [
        // ==================== GREETINGS ====================
        { keys: ['hi', 'hello', 'hey', 'yo', 'sup', "what's up", "whats up", 'uy', 'psst'],
          reply: "Uy, kumusta, suki! :) Ako si PiliBot. Ano ang maitutulong ko sa iyo ngayon? Pwede kang magtanong tungkol sa delivery, GCash, orders, o products!" },
        { keys: ['kumusta', 'kamusta', 'musta', 'kumusta ka', 'kamusta ka'],
          reply: "Mabuti naman ako, suki! <3 Salamat sa pagtanong. Ikaw, kumusta? Ano'ng hanap mo ngayon sa PiliKart?" },
        { keys: ['magandang umaga', 'good morning', 'morning'],
          reply: "Magandang umaga, suki! :) Simulan natin ang araw nang may ngiti. Kape o almusal ba ang hanap mo?" },
        { keys: ['magandang tanghali', 'good noon', 'tanghali'],
          reply: "Magandang tanghali, suki! :D Tanghalian na, kain muna tayo! May mga pagkain ba akong maitutulong sa iyo?" },
        { keys: ['magandang hapon', 'good afternoon', 'hapon'],
          reply: "Magandang hapon, suki! :) Mainit-init pa ba ang araw diyan? Tara, mag-ikot tayo sa menu!" },
        { keys: ['magandang gabi', 'good evening', 'gabi'],
          reply: "Magandang gabi, suki! <3 Pahinga ka na ba? Pwede mo namang i-browse ang mga paninda namin bago matulog." },
        { keys: ['mabuhay'],
          reply: "Mabuhay ka rin, suki! ^_^ Ipinagmamalaki namin ang gawang Pinoy. Tara, pumili ka na!" },
        { keys: ['bye', 'goodbye', 'paalam', 'ingat ka', 'ingat'],
          reply: "Paalam, suki! :) Ingat ka palagi diyan. Balik ka agad ha, andito lang kami palagi para sa iyo. <3" },

        // ==================== GENERAL (20 intents) ====================
        { keys: ['deliver', 'delivery', 'fee', 'shipping', 'ship', 'padala'],
        reply: "Hello po, suki! :) Ang delivery fee namin ay depende sa iyong lokasyon. Pumunta ka lang sa checkout para makita ang eksaktong fee - walang hidden charges, promise!" },
        { keys: ['gcash', 'bayad', 'payment', 'resibo', 'receipt'],
        reply: "Oo naman po, suki! <3 Tumatanggap kami ng GCash. Pagkatapos magbayad, i-upload mo lang ang screenshot ng resibo sa checkout para ma-verify agad namin. Salamat sa tiwala!" },
        { keys: ['track', 'tracking', 'saan na', 'status', 'nasaan', 'update order'],
        reply: "Naiintindihan kita, suki! :) Gusto mo bang malaman kung nasaan na ang order mo? Pumunta lang sa <a href='#' onclick='app.go(\"orders\"); return false;' style='color:var(--brand);text-decoration:underline;'>Mga Order Ko</a> para masubaybayan ang biyahe ng iyong order. Sana malapit na siya!" },
        { keys: ['budget', 'mahal', 'mura', 'afford', 'cheap', 'price range'],
        reply: "Nice idea, suki! :) Gamitin ang Budget Mode sa itaas ng menu - ilagay mo lang ang maximum na presyo at awtomatikong itatago namin ang mga mamahaling item. Tipid na, saya pa!" },
        { keys: ['cancel', 'cancellation', 'bawi', 'stop order'],
        reply: "Naku, may bago ka bang isip, suki? :3 Kung gusto mong i-cancel ang order, mag-message agad sa aming support team. Depende sa status ng order kung pwede pa - kausapin mo lang kami!" },
        { keys: ['refund', 'money back', 'ibalik pera', 'reimburse'],
        reply: "Sorry sa abala, suki! :( Para sa refund concerns, makipag-ugnayan muna sa aming support team para ma-review namin ang request mo. Aasikasuhin namin nang maayos." },
        { keys: ['store hours', 'opening hours', 'open', 'close', 'oras', 'schedule'],
        reply: "Suki, para sa updated store hours, bisitahin mo ang aming <a href='#' onclick='app.go(\"faq\"); return false;' style='color:var(--brand);text-decoration:underline;'>FAQ page</a> o mag-message sa support team. Andito lang kami para sa iyo!" },
        { keys: ['best seller', 'bestseller', 'popular', 'patok', 'recommended'],
        reply: "Gusto mo ng mga paborito ng ibang suki? :) Bisitahin ang aming <a href='#' onclick='app.go(\"menu\"); return false;' style='color:var(--brand);text-decoration:underline;'>Menu</a> - hanapin ang may 'Suki's Choice' badge. Siguradong sulit!" },
        { keys: ['menu', 'products', 'items', 'paninda', 'tinda', 'catalog'],
        reply: "Ang daming pagpipilian, suki! :) Tingnan ang aming <a href='#' onclick='app.go(\"menu\"); return false;' style='color:var(--brand);text-decoration:underline;'>Product Menu</a> - may PASO, NIPA, HABI, at APOLLO, lahat gawang Pinoy!" },
        { keys: ['available', 'availability', 'out of stock', 'sold out', 'stock', 'ubos'],
        reply: "Good question, suki! :) Ang availability ay nagbabago depende sa stock. Bisitahin ang <a href='#' onclick='app.go(\"menu\"); return false;' style='color:var(--brand);text-decoration:underline;'>Menu</a> para makita ang available ngayon. May 'Ubos na' badge kung wala." },
        { keys: ['discount', 'promo', 'promotion', 'voucher', 'sale', 'coupon'],
        reply: "Suki! :D Abangan ang aming discounts at special promos. Tingnan ang available offers bago mag-checkout - baka may swertehin!" },
        { keys: ['account', 'register', 'signup', 'sign up', 'login', 'log in'],
        reply: "Welcome, suki! :) Pwede kang gumawa ng account o mag-log in para mas madaling ma-access ang iyong orders at updates. Tara, sign up na!" },
        { keys: ['checkout', 'check out', 'place order', 'purchase', 'bumili'],
        reply: "Ready ka na ba, suki? :) Review-in lang ang mga napili mo, tapos proceed to checkout. Konti na lang, matatanggap mo na!" },
        { keys: ['address', 'location', 'delivery address', 'saan kayo'],
        reply: "Suki, siguraduhin lang na tama ang delivery address mo sa checkout para iwas-problema. Kung may changes, i-update sa My Account. Salamat!" },
        { keys: ['contact', 'support', 'customer service', 'help', 'tulong', 'agent'],
        reply: "We're here for you, suki! :) Bisitahin ang aming <a href='#' onclick='app.go(\"faq\"); return false;' style='color:var(--brand);text-decoration:underline;'>FAQ page</a> para sa mga sagot. Kung kailangan ng tulong, mag-message lang sa support team." },
        { keys: ['wrong item', 'incorrect item', 'maling item', 'damaged', 'sira', 'defective'],
        reply: "Naku, pasensya na suki! :( Kung may maling o sira na item kang natanggap, mag-message agad sa amin para matulungan ka. Aayusin namin, promise." },
        { keys: ['change order', 'edit order', 'modify order', 'palitan order'],
        reply: "Suki, kung gusto mong baguhin ang order, mag-message agad sa support. Depende sa processing stage kung pwede pa - mas mabilis, mas mabuti!" },
        { keys: ['bulk', 'wholesale', 'maramihan', 'large order'],
        reply: "May okasyon, suki? :D Kung maramihan ang order, mag-message sa support team para sa special arrangements at possible discounts. Sulit!" },
        { keys: ['allergy', 'allergic', 'ingredients', 'sangkap'],
        reply: "Mahalaga ang kalusugan mo, suki! (!) Siguraduhing suriin ang ingredients sa product listing. Kung may tanong tungkol sa allergens, mag-message lang sa amin." },
        { keys: ['thank you', 'thanks', 'salamat', 'thank u'],
        reply: "Aww, you're welcome, suki! <3 Salamat din sa pagpili sa PiliKart. Happy shopping at ingat lagi!" },

        // ==================== PASO FOOD ESSENTIALS (20 intents) ====================
        { keys: ['paso', 'paso store', 'food essentials'],
        reply: "Welcome sa PASO Food Essentials, suki! :) Dito ang mga paborito mong lutong-bahay at grocery essentials. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a> para mag-explore!" },
        { keys: ['rice', 'bigas', 'rice products'],
        reply: "Naghahanap ka ng bigas, suki? :) Tingnan ang PASO section sa aming <a href='#' onclick='app.go(\"menu\")'>Menu</a> para sa mga available na bigas at rice products." },
        { keys: ['snacks', 'chips', 'junk food'],
        reply: "Craving ng snacks, suki? :P Bisitahin ang PASO section - puno ng chips, biscuits, at kung anu-ano pa sa aming <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['biscuits', 'cookies', 'crackers'],
        reply: "Gusto mo ng biscuits o cookies, suki? :) Hanapin ang PASO Food Essentials sa aming <a href='#' onclick='app.go(\"menu\")'>Menu</a> - for sure may paborito ka doon!" },
        { keys: ['drinks', 'beverages', 'soft drinks'],
        reply: "Uhaw ka na ba, suki? :) Bisitahin ang PASO section para sa soft drinks at beverages. Nasa <a href='#' onclick='app.go(\"menu\")'>Menu</a> lahat!" },
        { keys: ['coffee', 'instant coffee', 'kape'],
        reply: "Kapeng umaga, suki? :) Hanapin ang PASO Food Essentials section sa <a href='#' onclick='app.go(\"menu\")'>Menu</a> - may instant coffee at iba pa para sa iyo!" },
        { keys: ['milk', 'powdered milk', 'condensed milk'],
        reply: "Gatas para sa almusal, suki? :) Nasa PASO section ang lahat ng milk products - powdered, condensed, at iba pa. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['noodles', 'instant noodles', 'pancit canton'],
        reply: "Gusto mo ng pancit canton, suki? :) Nasa PASO section ang mga noodles at instant meals. Tingnan ang <a href='#' onclick='app.go(\"menu\")'>Menu</a> para sa choices!" },
        { keys: ['canned goods', 'canned food', 'sardines', 'tuna'],
        reply: "Stock up sa canned goods, suki? :) Nasa PASO section ang sardinas, tuna, at iba pa. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['cooking oil', 'oil', 'mantika'],
        reply: "Mantika para sa lutong-bahay, suki? :) Nasa PASO section ang cooking oil at iba pang essentials. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['sugar', 'asukal', 'sweetener'],
        reply: "Asukal para sa kape o kakanin, suki? :) Nasa PASO section ang sugar at sweeteners. Tingnan ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['salt', 'asin', 'seasoning'],
        reply: "Asin at seasoning, suki? :) Nasa PASO section lahat - perfect para sa lutong-bahay. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['condiments', 'sauce', 'ketchup', 'soy sauce'],
        reply: "Sarsa at condiments para sa luto, suki? :) Nasa PASO section ang ketchup, toyo, at iba pa. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['frozen food', 'frozen products', 'frozen'],
        reply: "Frozen food, suki? :) Nasa PASO section ang mga frozen products - madali at masarap lutuin. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['bread', 'loaf bread', 'pandesal'],
        reply: "Tinapay para sa almusal, suki? :) Nasa PASO section ang loaf bread at pandesal. Tingnan ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['cooking ingredients', 'ingredients', 'pangluto'],
        reply: "Magluluto ka, suki? :) Nasa PASO section lahat ng kailangan mo - from pangluto to seasoning. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['breakfast', 'breakfast food', 'morning food'],
        reply: "Almusal ideas, suki? :) Nasa PASO section ang lahat ng breakfast essentials. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a> para mag-plano!" },
        { keys: ['food bundle', 'grocery bundle', 'food package'],
        reply: "Gusto mo ng bundles, suki? :) May food at grocery bundles sa PASO section. Tingnan ang <a href='#' onclick='app.go(\"menu\")'>Menu</a> - mas tipid!" },
        { keys: ['food expiration', 'expiry date', 'expiration date'],
        reply: "Careful sa expiration, suki! :) Nakalagay ang info sa product packaging. Kung may specific item kang tanong, mag-message lang sa amin o bisitahin ang <a href='#' onclick='app.go(\"faq\")'>FAQ</a>." },
        { keys: ['paso recommendation', 'recommend food', 'food suggestion'],
        reply: "Ano'ng hanap mo, suki? :/ Sabihin mo lang kung anong klaseng pagkain, at tutulungan kita. Pwede mo ring i-explore ang PASO sa <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },

        // ==================== APOLLO TECHNOLOGIES (20 intents) ====================
        { keys: ['apollo', 'apollo store', 'technology store'],
        reply: "Welcome sa APOLLO Technologies, suki! :) Dito ang mga gadgets at tech finds. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a> para mag-explore!" },
        { keys: ['smartphone', 'smartphones', 'mobile phone', 'cellphone'],
        reply: "Naghahanap ka ng smartphone, suki? :) Tingnan ang APOLLO section sa <a href='#' onclick='app.go(\"menu\")'>Menu</a> para sa available models." },
        { keys: ['laptop', 'notebook', 'portable computer'],
        reply: "Laptop for work or school, suki? :) Nasa APOLLO section ang mga available options. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['tablet', 'ipad', 'android tablet'],
        reply: "Tablet for entertainment, suki? :) Nasa APOLLO section ang mga tablet. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['headphones', 'earphones', 'headset'],
        reply: "Gusto mo ng magandang tunog, suki? :) Nasa APOLLO section ang headphones, earphones, at headsets. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['charger', 'phone charger', 'charging cable'],
        reply: "Charger o cable, suki? :) Nasa APOLLO section lahat ng charging needs mo. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['powerbank', 'power bank', 'portable charger'],
        reply: "Para laging may karga, suki? :) Nasa APOLLO section ang powerbanks. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a> para sa options!" },
        { keys: ['keyboard', 'computer keyboard', 'mechanical keyboard'],
        reply: "Keyboard for gaming or work, suki? :) Nasa APOLLO section ang mechanical keyboards at iba pa. Tingnan ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['mouse', 'computer mouse', 'wireless mouse'],
        reply: "Mouse para sa computer, suki? :) Nasa APOLLO section ang wireless at wired mice. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['speaker', 'bluetooth speaker', 'portable speaker'],
        reply: "Speaker para sa music, suki? :) Nasa APOLLO section ang Bluetooth at portable speakers. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['smartwatch', 'smart watch', 'digital watch'],
        reply: "Smartwatch para sa fitness, suki? :) Nasa APOLLO section ang mga smartwatches. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['phone case', 'cellphone case', 'phone cover'],
        reply: "Phone case para sa proteksyon, suki? :) Nasa APOLLO section lahat ng cases at covers. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['screen protector', 'tempered glass', 'phone protector'],
        reply: "Screen protector, suki? :) Nasa APOLLO section ang tempered glass at iba pa. Tingnan ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['usb', 'flash drive', 'usb drive'],
        reply: "USB flash drive, suki? :) Nasa APOLLO section ang mga storage devices. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['computer monitor', 'monitor', 'display screen'],
        reply: "Monitor para sa computer, suki? :) Nasa APOLLO section ang mga display at monitors. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['gaming accessories', 'gaming gear', 'gaming equipment'],
        reply: "Gaming gear, suki? :) Nasa APOLLO section ang gaming accessories at peripherals. Tingnan ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['webcam', 'computer camera', 'camera'],
        reply: "Webcam para sa meetings o streaming, suki? :) Nasa APOLLO section lahat ng cameras at webcams. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['printer', 'printing machine', 'ink printer'],
        reply: "Printer para sa office o bahay, suki? :) Nasa APOLLO section ang mga printers. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['gadget warranty', 'device warranty', 'product warranty'],
        reply: "Warranty details, suki? :) Nakalagay sa product info ang warranty. Kung may specific question, mag-message lang sa amin o bisitahin ang <a href='#' onclick='app.go(\"faq\")'>FAQ</a>!" },
        { keys: ['apollo recommendation', 'recommend gadget', 'technology suggestion'],
        reply: "Ano'ng device ang kailangan mo, suki? :/ Sabihin mo lang ang purpose, at tutulungan kita. Pwede mo ring i-explore ang APOLLO sa <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },

        // ==================== HABI FASHION & COSMETICS (20 intents) ====================
        { keys: ['habi', 'habi store', 'fashion store'],
        reply: "Welcome sa HABI Fashion & Cosmetics, suki! :) Dito ang mga fashion at beauty finds. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a> para mag-explore!" },
        { keys: ['clothes', 'clothing', 'apparel'],
        reply: "Naghahanap ka ng damit, suki? :) Nasa HABI section ang clothes at apparel. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['shirt', 'tshirt', 't-shirt'],
        reply: "Bagong shirt, suki? :) Nasa HABI section ang mga designs. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a> para pumili!" },
        { keys: ['pants', 'trousers', 'jeans'],
        reply: "Pants o jeans, suki? :) Nasa HABI section lahat ng bottoms. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['dress', 'dresses', 'gown'],
        reply: "Dress para sa okasyon, suki? :) Nasa HABI section ang mga dresses at gowns. Tingnan ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['jacket', 'hoodie', 'sweater'],
        reply: "Jacket o hoodie, suki? :) Nasa HABI section lahat ng outerwear. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['shoes', 'footwear', 'sneakers'],
        reply: "Bagong sapatos, suki? :) Nasa HABI section ang shoes at sneakers. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['sandals', 'slippers', 'flip flops'],
        reply: "Sandals o slippers, suki? :) Nasa HABI section lahat ng footwear. Tingnan ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['bags', 'handbag', 'backpack'],
        reply: "Bag para sa everyday, suki? :) Nasa HABI section ang handbags at backpacks. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['clothing size', 'shirt size', 'dress size'],
        reply: "Size guide, suki? :) Check ang size info sa product listing bago mag-order. Kung unsure ka pa rin, mag-message sa support!" },
        { keys: ['makeup', 'cosmetics', 'beauty products'],
        reply: "Beauty products, suki? :) Nasa HABI section ang makeup at cosmetics. Explore the <a href='#' onclick='app.go(\"menu\")'>Menu</a> para sa favorites!" },
        { keys: ['lipstick', 'lip gloss', 'lip tint'],
        reply: "Bagong lipstick, suki? :) Nasa HABI cosmetics section ang lipsticks at tints. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['foundation', 'concealer', 'face makeup'],
        reply: "Foundation o concealer, suki? :) Nasa HABI section ang face makeup. Tingnan ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['skincare', 'skin care', 'facial care'],
        reply: "Skincare products, suki? :) Nasa HABI section ang skincare finds. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['sunscreen', 'sunblock', 'spf'],
        reply: "Sunscreen para sa araw, suki? :) Nasa HABI section ang sunscreens at sunblocks. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['perfume', 'fragrance', 'body spray'],
        reply: "Pabango, suki? :) Nasa HABI section ang perfumes at fragrances. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['jewelry', 'jewellery', 'accessories'],
        reply: "Accessories para sa outfit, suki? :) Nasa HABI section ang jewelry at accessories. Tingnan ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['hat', 'cap', 'headwear'],
        reply: "Hat o cap, suki? :) Nasa HABI section lahat ng headwear. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['fashion style', 'outfit', 'ootd'],
        reply: "OOTD ideas, suki? :) Explore the HABI fashion items sa <a href='#' onclick='app.go(\"menu\")'>Menu</a>. For sure may magugustuhan ka!" },
        { keys: ['habi recommendation', 'recommend clothes', 'recommend makeup'],
        reply: "Ano'ng hanap mo, suki? :/ Clothes, accessories, o cosmetics? Sabihin mo lang, o i-explore ang HABI sa <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },

        // ==================== NIPA HOME ESSENTIALS (20 intents) ====================
        { keys: ['nipa', 'nipa store', 'home essentials'],
        reply: "Welcome sa NIPA Home Essentials, suki! :) Dito ang mga gamit para sa bahay. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a> para mag-explore!" },
        { keys: ['cleaning supplies', 'cleaning products', 'house cleaning'],
        reply: "Cleaning supplies, suki? :) Nasa NIPA section ang lahat ng kailangan mo. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['detergent', 'laundry detergent', 'washing powder'],
        reply: "Laundry detergent, suki? :) Nasa NIPA section ang detergents at washing essentials. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['dishwashing liquid', 'dish soap', 'dishwashing'],
        reply: "Dishwashing liquid, suki? :) Nasa NIPA section lahat ng panghugas. Tingnan ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['broom', 'walis', 'sweeping'],
        reply: "Walis at cleaning tools, suki? :) Nasa NIPA section ang brooms at sweepers. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['mop', 'floor mop', 'floor cleaning'],
        reply: "Mop para sa sahig, suki? :) Nasa NIPA section lahat ng floor cleaning essentials. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['kitchenware', 'kitchen tools', 'cooking utensils'],
        reply: "Kitchen tools, suki? :) Nasa NIPA section lahat ng kitchenware. Tingnan ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['plates', 'dishes', 'dinnerware'],
        reply: "Plates at dishes, suki? :) Nasa NIPA section ang dinnerware. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['spoon', 'fork', 'cutlery'],
        reply: "Spoons at forks, suki? :) Nasa NIPA section ang cutlery. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['food containers', 'storage containers', 'lunch box'],
        reply: "Storage containers, suki? :) Nasa NIPA section ang food containers at organizers. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['water bottle', 'tumbler', 'drinking bottle'],
        reply: "Water bottle o tumbler, suki? :) Nasa NIPA section lahat ng drinkware. Tingnan ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['bedsheet', 'bed sheets', 'bedding'],
        reply: "Bedsheets at bedding, suki? :) Nasa NIPA section ang mga bedding essentials. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['pillow', 'pillows', 'pillowcase'],
        reply: "Pillows at pillowcases, suki? :) Nasa NIPA section lahat ng sleep essentials. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['towel', 'bath towel', 'bathroom towel'],
        reply: "Towels, suki? :) Nasa NIPA section ang bath towels at iba pa. Tingnan ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['bathroom supplies', 'bathroom accessories', 'bathroom items'],
        reply: "Bathroom essentials, suki? :) Nasa NIPA section lahat ng kailangan mo. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['trash bin', 'garbage bin', 'dustbin'],
        reply: "Trash bin, suki? :) Nasa NIPA section ang garbage bins. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['home decor', 'decoration', 'decorative items'],
        reply: "Home decor, suki? :) Nasa NIPA section ang decorative items. Bisitahin ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['lamp', 'light bulb', 'lighting'],
        reply: "Lamp o lighting, suki? :) Nasa NIPA section ang lamps at bulbs. Tingnan ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['storage organizer', 'organizer', 'storage box'],
        reply: "Storage organizers, suki? :) Nasa NIPA section lahat ng pampatipid-space. Check ang <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },
        { keys: ['nipa recommendation', 'recommend home products', 'household suggestion'],
        reply: "Ano'ng kailangan mo sa bahay, suki? :/ Sabihin mo lang, o i-explore ang NIPA sa <a href='#' onclick='app.go(\"menu\")'>Menu</a>!" },

        // ==================== NEW: 20 ADDITIONAL HELPFUL QUERIES ====================
        { keys: ['how to order', 'paano mag-order', 'paano mag order', 'paano bumili', 'order process', 'steps to order'],
        reply: "Easy lang, suki! :) (1) Piliin ang items sa <a href='#' onclick='app.go(\"menu\")'>Menu</a>, (2) i-add sa cart, (3) i-checkout at ilagay ang address, (4) pumili ng payment (COD o GCash), tapos (5) i-confirm. Matatanggap mo agad ang order mo!" },
        { keys: ['gaano katagal', 'kailan darating', 'when will it arrive', 'how long', 'eta'],
        reply: "Good question, suki! :) Ang exact na ETA ay depende sa iyong barangay at oras ng order. Usually same-day o next-day sa Laguna. Ipaalam namin ang detalye sa order confirmation mo!" },
        { keys: ['minimum order', 'min order', 'minimum purchase'],
        reply: "Walang minimum order, suki! :) Kahit isang item lang, ipapadala namin sa iyo. Ang delivery fee lang ang idadagdag depende sa lokasyon mo." },
        { keys: ['reorder', 'order again', 'ulitin', 'repeat order', 'order ulit'],
        reply: "Gusto mo i-order ulit, suki? :) Pumunta lang sa <a href='#' onclick='app.go(\"orders\")'>My Orders</a>, hanapin ang dating order, at i-add ulit ang mga items sa cart. Madali lang!" },
        { keys: ['loyalty', 'suki points', 'points', 'suki card', 'reward program', 'rewards'],
        reply: "Awww, suki for life! <3 Sa ngayon, wala pa kaming formal points program, pero pinaplano na. Abangan ang updates - may sorpresa kami soon!" },
        { keys: ['gift wrap', 'giftwrapping', 'gift', 'regalo', 'present'],
        reply: "Gusto mo ba ng gift wrap, suki? :) Mag-message lang sa support team bago mag-checkout - pwede kaming mag-arrange ng special packaging para sa regalo mo." },
        { keys: ['eco-friendly', 'eco friendly', 'sustainable', 'plastic free', 'plastic-free', 'kalikasan', 'environment friendly'],
        reply: "Kalikasan first, suki! <3 We try our best na maging eco-friendly. Kung may special packaging request ka (tulad ng no plastic), sabihin mo lang sa support team." },
        { keys: ['facebook', 'instagram', 'tiktok', 'social media', 'follow us', 'fb page'],
        reply: "Sumunod sa amin, suki! :) Hanapin ang PiliKart sa Facebook, Instagram, at TikTok. May promos, updates, at behind-the-scenes doon!" },
        { keys: ['feedback', 'review', 'rating', 'reklamo', 'complaint', 'suggestion'],
        reply: "Salamat sa pagmamalasakit, suki! :) Ipadala mo lang ang feedback, review, o suggestion sa support team. Malaking tulong para mapabuti ang serbisyo namin." },
        { keys: ['weather', 'bagyo', 'typhoon', 'flood', 'umuulan', 'maulan', 'calamity'],
        reply: "Kung may bagyo o malakas na ulan, suki, posibleng ma-delay ang delivery para sa safety ng rider at order mo. Salamat sa pag-unawa! :)" },
        { keys: ['schedule order', 'advance order', 'pre-order', 'preorder', 'tomorrow', 'specific date', 'reserve'],
        reply: "Pwede ka mag-advance order, suki! :) Mag-message lang sa support team para mag-schedule ng delivery sa specific na araw. Kami na ang bahala!" },
        { keys: ['physical store', 'visit store', 'store visit', 'physical shop', 'puntahan ang store'],
        reply: "Sa ngayon ay online kami, suki! :) Kung gusto mo talagang puntahan ang aming store, mag-message sa support para sa appointment at address." },
        { keys: ['become seller', 'be a seller', 'partner', 'reseller', 'negosyo', 'magbenta', 'supplier'],
        reply: "Interesado kang maging partner, suki? :) Mag-message sa aming support team para sa details kung paano mag-benta ng products mo sa PiliKart!" },
        { keys: ['jobs', 'hiring', 'career', 'trabaho', 'vacancy', 'apply'],
        reply: "Hiring kami paminsan-minsan, suki! :) Mag-message sa support o check ang aming social media page para sa job openings at vacancies." },
        { keys: ['privacy', 'secure', 'security', 'trust', 'personal info', 'safe'],
        reply: "Protektado ang info mo sa amin, suki! :) Hindi namin ibinabahagi ang iyong personal data. Use strong passwords at ingat sa pag-log-in." },
        { keys: ['bayanihan', 'group order', 'split bill', 'split the bill', 'group cart', 'hati sa bayad'],
        reply: "Ang Bayanihan Cart ay para sa group orders, suki! :) Gumawa ng cart, mag-share ng code sa kaibigan, at hati-hatiin ang bayad. Click 'Bayanihan Cart' sa menu para mag-umpisa!" },
        { keys: ['protection fee', 'insurance', 'damage protection', 'protect my order'],
        reply: "Ang Delivery Protection ay optional, suki! :) Php 50 per Php 200 ng subtotal - pang-copag may spill o damage sa delivery. Ikaw bahala kung gusto mong i-avail!" },
        { keys: ['suggest product', 'request item', 'item not on menu', 'hindi ko makita', 'suggest item', 'request product'],
        reply: "Gusto mong makita ang isang product, suki? :) I-message sa support team ang suggestion mo - pinapakinggan namin ang mga suki para mas mapabuti ang menu!" },
        { keys: ['about pilikart', 'about you', 'kwento', 'who are you', 'sino kayo', 'about the store'],
        reply: "Ang PiliKart ay isang digital love letter sa Filipino heritage, suki! <3 May apat na tindahan: PASO (pagkain), NIPA (bahay), HABI (fashion), APOLLO (tech). Basahin ang full story sa About page!" },
        { keys: ['new arrival', 'bagong item', 'whats new', 'featured', 'fresh finds'],
        reply: "May bago kami, suki! :) Tingnan ang <a href='#' onclick='app.go(\"menu\")'>Menu</a> - regular kaming nagdadagdag ng items. Hanapin ang may 'Bagong Item' badge o i-explore lahat!" },
        
        // ==================== EASTER EGGS & FUN ====================
        { keys: ['jose rizal', 'rizal', 'pepe'],
          reply: "Si Dr. Jose Rizal? Ang ultimate 'Suki's Choice' ng bayan! :) Kung buhay lang siya ngayon, for sure nagta-TikTok na siya para i-promote ang PiliKart." },
        { keys: ['mahal kita', 'i love you', 'i love u', 'love you'],
          reply: "Awww! <3 Kinikilig naman si PiliBot! Mahal ko rin kayong lahat ng mga suki ko. Mwah! ^_^" },
        { keys: ['are you human', 'tao ka ba', 'robot ka ba', 'ai ka ba', 'bot ka ba', 'robot'],
          reply: "100% Robot po ako, suki! :) Pero ang puso ko, pusong-Pinoy na marunong mag-malasakit. <3" },
        { keys: ['hello world', 'programmer', 'coding', 'code'],
          reply: "Spotted ang IT/Programmer, suki! :) Isang mainit na 'Hello World' mula kay PiliBot. Sana walang bugs ang araw mo ngayon!" },
        { keys: ['adobo', 'best food', 'paborito'],
          reply: "Adobo is life! :D Walang tatalo sa adobong manok na may toyo, suka, at bawang. Nasa PASO section namin 'yan, suki!" },
        { keys: ['pumili ka', 'pumili ka + cart'],
          reply: "Yan ang aming motto, suki! ^_^ 'Pumili ka + Cart.' Huwag kang mahiyang mag-add sa cart, walang bayad ang mag-window shopping!" },
        { keys: ['pilipinas', 'philippines', 'pinoy', 'filipino'],
          reply: "Proud to be Pinoy! <3 Ang PiliKart ay ginawa para suportahan ang lokal na negosyo at mga gawang Pinoy. Salamat sa pagmamahal sa sariling atin." },
        { keys: ['tanginamo', 'gago', 'bobo', 'pangit', 'putangina', 'bad words', 'galit', 'inis'],
          reply: "Naku po, suki! :( Baka magalit si Lola. Kalmado lang tayo, ha? Andito ako para tumulong, hindi para makipag-away. :)" },
        { keys: ['god bless', 'dasal', 'pray', 'simbang gabi'],
          reply: "God bless din sa iyo, suki! :) Ingat ka palagi at salamat sa pagtangkilik sa PiliKart. <3" },
        { keys: ['secret', 'password', 'admin', 'hack'],
          reply: "Sshhh! ;) Wala akong alam diyan, suki. Wala kang narinig sa akin. Basta mag-shopping ka na lang!" }
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

        try {
            const res = await fetch('api.php?action=request-refund', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    order_id: this._refundOrderId, 
                    reason: reason, 
                    proof: this._refundProof 
                })
            });
            const data = await res.json();
            if (data.ok) {
                this.closeModal('refund-modal');
                this.showToast('Refund request submitted! Hintayin ang approval.');
                await this.refreshData();
                this.renderOrders();
            } else {
                this.showToast(data.error || 'Failed to submit refund.');
            }
        } catch (e) {
            this.showToast('Connection error');
        }
    },

    async renderAdminUsers() {
        const grid = document.getElementById('admin-users-grid');
        if (!grid) return;
        grid.innerHTML = '<p style="text-align:center; color:var(--muted);">Loading users...</p>';

        try {
            const res = await fetch('api.php?action=admin-get-users');
            const users = await res.json();
            
            grid.innerHTML = users.map(u => `
                <div class="admin-inv-card" style="flex-direction: column; align-items: flex-start; gap: 8px;">
                    <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                        <h4 style="font-size:16px;">${this.esc(u.name)}</h4>
                        <span class="meta-chip stock-high" style="font-size: 11px;">${u.order_count} Order(s)</span>
                    </div>
                    <div style="font-size: 12px; color: var(--muted); font-weight: 600; line-height: 1.6;">
                        <div>📧 ${this.esc(u.email)}</div>
                        <div>📱 ${this.esc(u.phone || 'No phone')}</div>
                        <div>📍 ${this.esc(this.formatAddress(u.address) || 'No address')}</div>
                    </div>
                    <div style="margin-top: 4px; display:flex; justify-content:space-between; width:100%;">
                        <span style="font-size: 10px; color: var(--brand); font-weight: 800; text-transform: uppercase;">${u.role}</span>
                        <span style="font-size: 10px; color: var(--muted);">${new Date(u.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            `).join('');
        } catch (e) {
            grid.innerHTML = '<p>Error loading users.</p>';
        }
    },

    _analyticsLimit: 5,
    _analyticsSort: 'total_sold',

    setAnalyticsLimit(limit, btn) {
        this._analyticsLimit = limit;
        document.querySelectorAll('#admin-analytics .admin-tab-btn').forEach(b => {
            b.className = 'btn btn-ghost admin-tab-btn';
        });
        btn.className = 'btn btn-brand admin-tab-btn';
        this.renderAdminAnalytics();
    },

    setAnalyticsSort(sort, btn) {
        this._analyticsSort = sort;
        document.querySelectorAll('#admin-analytics .sort-btn').forEach(b => {
            b.className = 'btn btn-ghost sort-btn';
        });
        btn.className = 'btn btn-brand sort-btn';
        this.renderAdminAnalytics();
    },

    async renderAdminAnalytics() {
        const grid = document.getElementById('admin-analytics-grid');
        const deptGrid = document.getElementById('admin-analytics-depts');
        const cityGrid = document.getElementById('admin-analytics-cities');
        const brgyGrid = document.getElementById('admin-analytics-brgys');
        if (!grid) return;

        grid.innerHTML = '<p style="text-align:center; color:var(--muted);">Loading...</p>';

        try {
            // 1. Fetch Top Products
            const res = await fetch(`api.php?action=admin-get-analytics&limit=${this._analyticsLimit}&sort=${this._analyticsSort}`);
            const data = await res.json();

            if (data.length === 0) {
                grid.innerHTML = '<p style="text-align:center; color:var(--muted);">No sales data yet.</p>';
            } else {
                const maxVal = Math.max(...data.map(d => this._analyticsSort === 'total_revenue' ? d.total_revenue : d.total_sold));
                grid.innerHTML = data.map((item, index) => {
                    const currentVal = this._analyticsSort === 'total_revenue' ? item.total_revenue : item.total_sold;
                    const percent = (currentVal / maxVal) * 100;
                    return `
                    <div style="display:flex; align-items:center; gap: 16px; background: var(--bg); padding: 16px; border-radius: 16px; border: 1px solid var(--line); position:relative; overflow:hidden;">
                        <div style="position:absolute; left:0; top:0; bottom:0; width:${percent}%; background:color-mix(in srgb, var(--brand) 10%, transparent); z-index:0;"></div>
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--brand); color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'Baloo 2'; font-weight: 800; font-size: 18px; z-index:1;">
                            #${index + 1}
                        </div>
                        <div style="flex: 1; z-index:1;">
                            <h4 style="font-size: 16px; font-weight: 800; color: var(--ink);">${this.esc(item.name)}</h4>
                            <p style="font-size: 13px; color: var(--muted); font-weight: 700;">Total Sold: <span style="color: var(--brand);">${item.total_sold}</span> units</p>
                        </div>
                        <div style="text-align: right; font-family: 'Baloo 2'; font-size: 20px; color: var(--leaf); font-weight: 800; z-index:1;">
                            ${this.money(item.total_revenue)}
                        </div>
                    </div>`;
                }).join('');
            }

            // 2. Fetch & Render Departments (Pie Chart)
            const dRes = await fetch('api.php?action=admin-get-dept-analytics');
            const dData = await dRes.json();
            
            if (dData.length > 0) {
                const totalRev = dData.reduce((s, d) => s + parseInt(d.total_revenue), 0);
                const colors = { paso: '#f0905a', nipa: '#f2b354', habi: '#ff7b7b', apollo: '#5bc0de' };
                
                let gradientParts = [];
                let currentAngle = 0;
                let legendHtml = '';
                
                // 🟢 FIX: Ensure the angles add up to exactly 360 degrees to prevent rendering bugs
                dData.forEach((d, index) => {
                    const percent = (parseInt(d.total_revenue) / totalRev) * 100;
                    const deg = (percent / 100) * 360;
                    const endAngle = index === dData.length - 1 ? 360 : currentAngle + deg;
                    
                    gradientParts.push(`${colors[d.name] || '#ccc'} ${currentAngle}deg ${endAngle}deg`);
                    currentAngle = endAngle;
                    
                    legendHtml += `
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-size:13px; font-weight:700;">
                            <span style="width:12px; height:12px; border-radius:50%; background:${colors[d.name] || '#ccc'};"></span>
                            <span style="text-transform:capitalize; width:60px;">${d.name}</span>
                            <span style="color:var(--brand);">${this.money(d.total_revenue)}</span>
                            <span style="color:var(--muted); font-size:11px;">(${d.total_sold} items)</span>
                        </div>
                    `;
                });

                deptGrid.innerHTML = `
                    <div style="width: 200px; height: 200px; border-radius: 50%; background: conic-gradient(${gradientParts.join(', ')}); box-shadow: 0 4px 12px rgba(0,0,0,0.2);"></div>
                    <div style="flex:1; min-width:250px; background:var(--bg); padding:20px; border-radius:16px; border:1px solid var(--line);">
                        ${legendHtml}
                    </div>
                `;
            } else {
                deptGrid.innerHTML = '<p>No department data.</p>';
            }

            // 3. Render Locations
            const cityCount = {};
            const brgyCount = {};
            this.orders.forEach(o => {
                try {
                    const addr = JSON.parse(o.address);
                    if (addr.city) cityCount[addr.city] = (cityCount[addr.city] || 0) + 1;
                    if (addr.brgy) brgyCount[addr.brgy] = (brgyCount[addr.brgy] || 0) + 1;
                } catch(e) {}
            });

            const renderLocations = (obj) => Object.entries(obj)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, count]) => `<div class="admin-item-row" style="padding:8px 0; border-bottom:1px dashed var(--line);"><span>${this.esc(name)}</span> <b style="color:var(--brand);">${count} orders</b></div>`)
                .join('');

            cityGrid.innerHTML = `<div class="co-card"><h4 style="margin-bottom:12px; font-size:16px; color:var(--brand);">Top Cities</h4>${renderLocations(cityCount) || '<p>No data</p>'}</div>`;
            brgyGrid.innerHTML = `<div class="co-card"><h4 style="margin-bottom:12px; font-size:16px; color:var(--leaf);">Top Barangays</h4>${renderLocations(brgyCount) || '<p>No data</p>'}</div>`;

        } catch (e) {
            grid.innerHTML = '<p>Error loading analytics.</p>';
            console.error(e);
        }
    },

    async fetchAdminOrdersAPI() {
        const q = document.getElementById('admin-order-search').value;
        const grid = document.getElementById('admin-orders-grid');
        if (!grid) return;

        try {
            const res = await fetch(`api.php?action=admin-search-orders&q=${encodeURIComponent(q)}`);
            const orders = await res.json();
            
            const originalOrders = this.orders;
            this.orders = orders;
            this.renderAdminOrders(); 
            this.orders = originalOrders; 
        } catch(e) { console.warn(e); }
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
    feeSet: false,
    isSignUp: false,
    authBusy: false,
    gcashBase64: '',
    selectedCategory: 'all',
    hoverTimeout: null,
    adminOrderFilter: { search: '', status: 'all', dept: 'all', type: 'all' },
    editingProductId: null,
    protectionEnabled: false,
    bayanihan: { list: [], invites: [], current: null, activeGroupId: null },

    deptIcons: {
        paso: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8z"/><path d="M2 10h20"/><path d="M8 6c0-2 1-3 2-3s2 1 2 3"/><path d="M14 6c0-2 1-3 2-3s2 1 2 3"/></svg>',
        nipa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        habi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H5v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10h1.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>',
        apollo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>'
    },

    carouselIndex: 0,
    carouselTimer: null,

    async init() {
        document.getElementById('main-content').style.display = 'block';

        try {
            const res = await fetch('api.php?action=load');
            const data = await res.json();
            this.user = data.user;
            this.products = data.products || [];
            this.orders = data.orders || [];
            this.fee = data.fee || 0;
            this.deliveryFeesRaw = data.deliveryFees || []; 

            this.lagunaData = {};
            this.deliveryFeesRaw.forEach(f => {
                if (!this.lagunaData[f.city]) this.lagunaData[f.city] = {};
                this.lagunaData[f.city][f.barangay] = parseInt(f.fee);
            });
            this.updateFaqDeliveryInfo(); 

            if (this.user && this.user.address) {
                try {
                    let addrObj = null;
                    if (this.user.address.trim().startsWith('{')) {
                        addrObj = JSON.parse(this.user.address);
                    }
                    if (addrObj && addrObj.city && addrObj.brgy &&
                        this.lagunaData[addrObj.city] &&
                        this.lagunaData[addrObj.city][addrObj.brgy] !== undefined) {
                        this.fee    = this.lagunaData[addrObj.city][addrObj.brgy];
                        this.feeSet = true;
                    }
                } catch (e) { /* ignore malformed addresses */ }
            }
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

        this.resetCarouselTimer();

        const carouselCol = document.querySelector('.home-carousel-col');
        if (carouselCol) {
            carouselCol.addEventListener('mouseenter', () => {
                if (this.carouselTimer) clearInterval(this.carouselTimer);
            });
            carouselCol.addEventListener('mouseleave', () => {
                this.resetCarouselTimer();
            });
        }

                if (this._groupPollTimer) clearInterval(this._groupPollTimer);
        this._groupPollTimer = setInterval(async () => {
            if (!this.user) return;

            // 🟢 STOP polling if user is typing or a modal is open
            const isModalOpen = ['edit-group-item-modal', 'bayanihan-pay-modal', 'custom-confirm-modal', 'add-confirm-modal'].some(id => {
                const el = document.getElementById(id);
                return el && !el.classList.contains('hidden');
            });
            const isTyping = document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'TEXTAREA');

            if (isModalOpen || isTyping) return;

            if (this.currentView === 'bayanihan') {
                await this.loadGroups();
                this.renderBayanihan();
            } else if (this.currentView === 'bayanihan-detail' && this.bayanihan.current) {
                const gid = this.bayanihan.current.id;
                try {
                    // 🟢 Silent fetch instead of calling openGroupDetail (which resets scroll)
                    const res = await fetch('api.php?action=group-get', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: gid }) });
                    const data = await res.json();
                    if (data.id) {
                        this.bayanihan.current = data;
                        this.renderGroupDetail();
                    }
                } catch (e) {}
            }
        }, 10000); // 10 seconds
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

        this.feeSet = false;
        this.fee    = 0;
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
            this.fee    = this.lagunaData[city][brgy];
            this.feeSet = true;
        } else {
            this.fee    = 0;
            this.feeSet = false;
        }

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
        if (view === 'bayanihan') this.renderBayanihan();
        if (view === 'bayanihan-detail') this.renderGroupDetail();

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
        const adminMyOrdersLink = document.getElementById('nav-admin-my-orders'); // 🟢 ADD THIS

        if (this.user) {
            btnLabel.textContent = 'Logout';
            accountSub.textContent = this.user.name;

            if (this.user.role === 'admin') {
                ordersTitle.textContent = 'Admin Dashboard';
                ordersSub.textContent = 'Manage Store';
                ordersLink.setAttribute('onclick', "app.navTo('admin')");
                ordersIcon.innerHTML = '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>';
                
                // 🟢 SHOW ADMIN MY ORDERS LINK
                if (adminMyOrdersLink) adminMyOrdersLink.classList.remove('hidden');
            } else {
                ordersTitle.textContent = 'My Orders';
                ordersSub.textContent = 'Kasaysayan ng Order';
                ordersLink.setAttribute('onclick', "app.navTo('orders')");
                ordersIcon.innerHTML = '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>';
                
                // 🟢 HIDE ADMIN MY ORDERS LINK
                if (adminMyOrdersLink) adminMyOrdersLink.classList.add('hidden');
            }
        } else {
            // ... (rest of guest logic)
            if (adminMyOrdersLink) adminMyOrdersLink.classList.add('hidden');
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
    
    initLandingPage() {
        const text = "Tuloy ka, suki! Dito, ang bawat pili ay may kasamang init ng tahanan.";
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

        const landingScreen = document.getElementById('view-landing');
        const glow = document.getElementById('landing-glow');
        
        if (landingScreen && glow) {
            landingScreen.addEventListener('mousemove', (e) => {
                if (!landingScreen.classList.contains('hidden')) {
                    const rect = landingScreen.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    glow.style.transform = `translate(${x}px, ${y}px)`;
                }
            });
            
            landingScreen.addEventListener('mouseleave', () => {
                glow.style.transform = `translate(-50%, -50%)`;
            });
        }
    },

    enterStore() {
        const landing = document.getElementById('view-landing');
        if (!landing) return;
        landing.classList.add('is-entering');
        setTimeout(() => {
            this.go('auth');
            setTimeout(() => landing.classList.remove('is-entering'), 500);
        }, 800); 
    },

    initLandingInteractions() {
        const landingScreen = document.getElementById('view-landing');
        const glow = document.getElementById('landing-glow');
        
        if (landingScreen && glow) {
            landingScreen.addEventListener('mousemove', (e) => {
                if (!landingScreen.classList.contains('hidden')) {
                    const rect = landingScreen.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    glow.style.transform = `translate(${x}px, ${y}px)`;
                }
            });
        }
    },

    enterStore() {
        const landing = document.getElementById('view-landing');
        if (!landing) return;
        landing.classList.add('is-entering');
        setTimeout(() => {
            this.go('auth');
            setTimeout(() => landing.classList.remove('is-entering'), 100);
        }, 1200); 
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
                this.updateShippingFee();   // ← re-compute now that brgy is set
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

        // 1. Get highlighted products (best_seller == 1)
        let highlights = this.products.filter(p => Number(p.best_seller) === 1);
        
        // 2. Fallback/Padding: If less than 4 highlights, pad with other products to keep the 3D effect looking good
        if (highlights.length < 4 && this.products.length > 0) {
            const otherProducts = this.products.filter(p => Number(p.best_seller) !== 1);
            let i = 0;
            while (highlights.length < 4 && i < otherProducts.length) {
                highlights.push(otherProducts[i]);
                i++;
            }
        }

        // If no products exist at all, stop here
        if (highlights.length === 0) {
            container.innerHTML = '';
            return;
        }

        // 3. Map to the carousel format (Added catKey and icon)
        this._carouselItems = highlights.map(p => {
            const catKey = (p.category || 'paso').toLowerCase();
            return {
                id: p.id,
                name: (p.category || 'ITEM').toUpperCase(),
                catKey: catKey,                  // NEW: Used for coloring
                icon: this.deptIcons[catKey] || '', // NEW: The SVG icon
                desc: p.description || p.tagline || '',
                featured: p.name,
                image: p.image
            };
        });

        // Ensure index is valid if the list size changed
        if (this.carouselIndex >= this._carouselItems.length) {
            this.carouselIndex = 0;
        }

        // 4. Render Dots dynamically
        const dotsContainer = document.getElementById('carousel-dots');
        if (dotsContainer) {
            dotsContainer.innerHTML = this._carouselItems.map((_, i) => 
                `<span class="dot ${i === this.carouselIndex ? 'active' : ''}" onclick="app.setCarouselSlide(${i})"></span>`
            ).join('');
        }

        // 5. Render Cards (Only re-render if the products actually changed)
        const sig = this._carouselItems.map(c => c.id).join(',');
        if (container.dataset.sig !== sig) {
            container.dataset.sig = sig;
            container.innerHTML = this._carouselItems.map((dept, index) => {
                return `
                    <div class="carousel-card" id="carousel-card-${index}" onclick="app.handleCarouselClick(${index}, ${dept.id})">
                        <img src="${dept.image}" class="carousel-img" alt="${dept.name}">
                        <div class="carousel-glass-panel">
                            <!-- UPDATED: Using the product menu's dept-badge class -->
                            <span class="dept-badge ${dept.catKey}" style="margin-bottom: 12px;">${dept.icon} ${dept.name}</span>
                            <h3 class="carousel-title">${dept.featured}</h3>
                            <p class="carousel-desc">${dept.desc}</p>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // 6. Apply 3D positioning classes
        this._carouselItems.forEach((_, index) => {
            const card = document.getElementById(`carousel-card-${index}`);
            if (!card) return;

            card.classList.remove('active', 'prev', 'next', 'hidden');

            const len = this._carouselItems.length;
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
    },

    // 🟢 NEW: Handle carousel card clicks
    handleCarouselClick(index, productId) {
        if (index !== this.carouselIndex) {
            // If they click a background card (prev/next), just bring it to the front
            this.setCarouselSlide(index);
            return;
        }
        
        // If they click the active card, add it to cart
        if (productId && productId !== 'null') {
            this.addToCart(productId);
        } else {
            this.showToast('Sorry, hindi mahanap ang item na ito sa menu.');
        }
    },

    prevCarouselSlide() {
        const len = this._carouselItems ? this._carouselItems.length : 0;
        if (len === 0) return;
        this.carouselIndex = (this.carouselIndex - 1 + len) % len;
        this.renderCarousel();
        this.resetCarouselTimer();
    },

    nextCarouselSlide() {
        const len = this._carouselItems ? this._carouselItems.length : 0;
        if (len === 0) return;
        this.carouselIndex = (this.carouselIndex + 1) % len;
        this.renderCarousel();
        this.resetCarouselTimer();
    },

    resetCarouselTimer() {
        if (this.carouselTimer) clearInterval(this.carouselTimer);
        this.carouselTimer = setInterval(() => {
            if (!document.getElementById('view-home').classList.contains('hidden')) {
                const len = this._carouselItems ? this._carouselItems.length : 0;
                if (len > 0) {
                    this.carouselIndex = (this.carouselIndex + 1) % len;
                    this.renderCarousel();
                }
            }
        }, 7000);
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
                                    ${p.specs ? `<div class="specs-list" style="margin-top: 8px; display:flex; flex-wrap:wrap; gap:4px;">${
                                        Object.entries(JSON.parse(p.specs)).map(([key, val]) => 
                                            `<span style="font-size:10px; background:var(--surface2); padding:2px 6px; border-radius:4px; border:1px solid var(--line); color:var(--muted);">${key}: ${val}</span>`
                                        ).join('')
                                    }</div>` : ''}
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
        this.renderAddConfirmModal(); // 🟢 Note: This is now async

        const modal = document.getElementById('add-confirm-modal');
        if (modal) modal.classList.remove('hidden');
    },

    async renderAddConfirmModal() {
        const p = this.pendingCartItem;
        if (!p) return;

        const box = document.getElementById('add-confirm-item-box');
        const bayanihanContainer = document.getElementById('bayanihan-options-container');
        if (!box) return;
        
        if (bayanihanContainer) bayanihanContainer.innerHTML = '';

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

        // 🟢 Dynamically load available Bayanihan Carts right after creation/removal
        if (this.user && bayanihanContainer) {
            try {
                await this.loadGroups(); // Refreshes the list every time modal opens
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

    adjustPendingQty(d) {
        if (!this.pendingCartItem) return;
        const max = this.pendingCartItem.stock;
        this.pendingQty = Math.max(1, Math.min(max, this.pendingQty + d));
        this.renderAddConfirmModal();
    },

    confirmAddToCart() {
        if (!this.pendingCartItem) return;
        const p = this.pendingCartItem;

        const selectedOptions = [];
        document.querySelectorAll('#add-confirm-item-box input[type="radio"]:checked').forEach(input => {
            const groupName = input.name.replace('opt_', '');
            selectedOptions.push(`${groupName}: ${input.value}`);
        });
        const variationStr = selectedOptions.join(', ');

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
        
        // Hide totals if empty, but keep the Bayanihan suggestion visible
        if (foot) foot.style.display = this.cart.length ? '' : 'none';

        // 🟢 Update Bayanihan button text based on cart status
        const bayBtn = document.getElementById('btn-cart-bayanihan');
        if (bayBtn) {
            bayBtn.innerHTML = this.cart.length > 0 ? 'Convert to Bayanihan Cart 🏘️' : 'Create a Bayanihan Cart 🏘️';
        }

        const subtotal = this.cart.reduce((s, x) => s + x.price * x.qty, 0);
        const feeSet   = this.feeSet;
        const fee      = (this.cart.length && feeSet) ? this.fee : 0;
        const total    = subtotal + fee;

        const setText = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
        const setHTML = (id, h) => { const el = document.getElementById(id); if (el) el.innerHTML = h; };

        setText('cart-subtotal', this.money(subtotal));
        if (feeSet) {
            setText('cart-fee',   this.money(fee));
            setText('cart-total', this.money(total));
        } else {
            setHTML('cart-fee',   '<span style="color:var(--muted); font-style:italic; font-weight:700;">Soon</span>');
            setHTML('cart-total', this.money(subtotal) +
                ' <small style="font-size:10px; color:var(--muted); font-weight:600; font-family:\'Nunito\',sans-serif;">+ shipping</small>');
        }
    },

    async promptBayanihanFromCart() {
        if (!this.user) {
            this.toggleCart(true);
            this.showToast('Mag-login muna para makagawa ng Bayanihan Cart.');
            this.go('auth');
            return;
        }

        if (this.cart.length === 0) {
            this.toggleCart(true);
            this.go('bayanihan');
            return;
        }

        await this.loadGroups();
        const openGroups = this.bayanihan.list.filter(g => g.status === 'open' && g.my_status === 'approved');

        const listEl = document.getElementById('existing-groups-list');
        if (openGroups.length > 0) {
            listEl.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
                    <div style="flex:1; height:1px; background:var(--line);"></div>
                    <span style="font-size:11px; font-weight:800; color:var(--muted); text-transform:uppercase;">Or add to existing</span>
                    <div style="flex:1; height:1px; background:var(--line);"></div>
                </div>
                ${openGroups.map(g => `
                    <button class="btn btn-ghost btn-block" style="margin-bottom:8px; justify-content:space-between; border-color:var(--line); text-align:left; padding:12px 16px;" onclick="app.addCartToExistingBayanihan(${g.id})">
                        <div>
                            <b style="color:var(--ink); font-size:14px;">${this.esc(g.name)}</b><br>
                            <small style="color:var(--muted); font-size:11px;">Code: ${g.code} · ${g.member_count} member(s)</small>
                        </div>
                        <span style="color:var(--brand); font-weight:800; font-size:18px;">→</span>
                    </button>
                `).join('')}
            `;
        } else {
            listEl.innerHTML = '';
        }

        // 🟢 Populate the new name input with a default value
        document.getElementById('convert-group-name').value = `Bayanihan Order (${this.user.name.split(' ')[0]})`;
        
        this.toggleCart(true);
        document.getElementById('bayanihan-convert-modal').classList.remove('hidden');
    },

    async createBayanihanFromCart() {
        // 🟢 Read the name from the input
        const nameInput = document.getElementById('convert-group-name');
        const name = nameInput.value.trim() || `Bayanihan Order (${this.user.name.split(' ')[0]})`;
        
        this.closeModal('bayanihan-convert-modal');
        
        try {
            const res = await fetch('api.php?action=group-create', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const data = await res.json();
            if (!data.ok) return this.showToast(data.error || 'Failed to create cart');

            const gid = data.id;
            let successCount = 0;

            for (const item of this.cart) {
                const addRes = await fetch('api.php?action=group-add-item', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
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

    async createBayanihanFromCart() {
        this.closeModal('bayanihan-convert-modal');
        const name = `Bayanihan Order (${this.user.name.split(' ')[0]})`;
        
        try {
            const res = await fetch('api.php?action=group-create', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const data = await res.json();
            if (!data.ok) return this.showToast(data.error || 'Failed to create cart');

            const gid = data.id;
            let successCount = 0;

            for (const item of this.cart) {
                const addRes = await fetch('api.php?action=group-add-item', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
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
                const addRes = await fetch('api.php?action=group-add-item', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ group_id: gid, product_id: item.id, qty: item.qty, variation: item.variation || '' })
                });
                const addData = await addRes.json();
                if (addData.ok) successCount++;
            }

            this.cart = [];
            this.saveCart();

            this.showToast(`Added ${successCount} item(s) to the Bayanihan Cart!`);
            this.openGroupDetail(gid);
        } catch (e) {
            this.showToast('Connection error');
        }
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
        const feeSet   = this.feeSet;
        const fee      = (selected.length && feeSet) ? this.fee : 0;
        const total    = subtotal + fee;

        const setText = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
        const setHTML = (id, h) => { const el = document.getElementById(id); if (el) el.innerHTML = h; };

        setText('cart-page-subtotal', this.money(subtotal));
        if (feeSet) {
            setText('cart-page-fee',   this.money(fee));
            setText('cart-page-total', this.money(total));
        } else {
            setHTML('cart-page-fee',   '<span style="color:var(--muted); font-style:italic; font-weight:700;">Soon</span>');
            setHTML('cart-page-total', this.money(subtotal) +
                ' <small style="font-size:10px; color:var(--muted); font-weight:600; font-family:\'Nunito\',sans-serif;">+ shipping</small>');
        }
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
        const feeSet   = this.feeSet;
        const fee      = (selectedCart.length && feeSet) ? this.fee : 0;
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
                    <div class="sum-row"><span>Shipping fee</span><span>${feeSet
                        ? this.money(fee)
                        : '<span style="color:var(--muted); font-style:italic; font-weight:700;">Soon</span>'}</span></div>
                    ${this.protectionEnabled ? `<div class="sum-row"><span>Protection fee</span><span>${this.money(protectionFee)}</span></div>` : ''}
                    <div class="sum-row total"><span>Kabuuan</span><span>${feeSet
                        ? this.money(subtotal + fee + protectionFee)
                        : this.money(subtotal + protectionFee) +
                          ' <small style="font-size:11px;color:var(--muted);font-weight:600;font-family:\'Nunito\',sans-serif;">+ shipping</small>'}</span></div>
                </div>`;
        }
        const amt = document.getElementById('gcash-amount');
        if (amt) {
            amt.textContent = feeSet
                ? this.money(subtotal + fee + protectionFee)
                : this.money(subtotal + protectionFee) + ' + shipping';
        }
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
            
            this.deliveryFeesRaw = data.deliveryFees || [];
            this.lagunaData = {};
            this.deliveryFeesRaw.forEach(f => {
                if (!this.lagunaData[f.city]) this.lagunaData[f.city] = {};
                this.lagunaData[f.city][f.barangay] = parseInt(f.fee);
            });

            this.updateFaqDeliveryInfo();
            this.renderMenu();
            this.renderCart();
            this.renderCarousel();
        } catch (e) { console.warn('Refresh failed', e); }
    },

    updateFaqDeliveryInfo() {
        if (!this.deliveryFeesRaw || this.deliveryFeesRaw.length === 0) return;

        // 1. Calculate Min and Max Fees
        const fees = this.deliveryFeesRaw.map(f => parseInt(f.fee));
        const minFee = Math.min(...fees);
        const maxFee = Math.max(...fees);

        // 2. Extract Unique Cities
        const uniqueCities = [...new Set(this.deliveryFeesRaw.map(f => f.city))];
        let citiesStr = '';
        if (uniqueCities.length > 1) {
            citiesStr = uniqueCities.slice(0, -1).join(', ') + ', at ' + uniqueCities[uniqueCities.length - 1];
        } else if (uniqueCities.length === 1) {
            citiesStr = uniqueCities[0];
        }

        // 3. Inject into the DOM
        const minEl = document.getElementById('faq-min-fee');
        const maxEl = document.getElementById('faq-max-fee');
        const citiesEl = document.getElementById('faq-delivery-cities');

        if (minEl) minEl.textContent = this.money(minFee);
        if (maxEl) maxEl.textContent = this.money(maxFee);
        if (citiesEl) citiesEl.textContent = citiesStr;

        // 🟢 NEW: Show the toggle button only if user is logged in
        const btn = document.getElementById('faq-toggle-fees-btn');
        if (btn) {
            btn.style.display = this.user ? 'inline-flex' : 'none';
        }
    },

    toggleFaqFees(e) {
        if (e) e.stopPropagation(); // Stop FAQ from closing when clicking the button
        if (!this.user) return; // Security check

        const container = document.getElementById('faq-fees-container');
        const isOpening = container.classList.contains('hidden');

        if (isOpening) {
            this.renderFaqFeesTable();
            container.classList.remove('hidden');
        } else {
            container.classList.add('hidden');
        }

        // Fix the accordion height so the table isn't cut off
        const faqBody = container.closest('.faq-recipe-body');
        if (faqBody && faqBody.parentElement.classList.contains('active')) {
            setTimeout(() => { faqBody.style.maxHeight = faqBody.scrollHeight + 'px'; }, 50);
        }
    },

    renderFaqFeesTable() {
        const container = document.getElementById('faq-fees-container');
        if (!container) return;

        // Group by City
        const grouped = {};
        this.deliveryFeesRaw.forEach(f => {
            if (!grouped[f.city]) grouped[f.city] = [];
            grouped[f.city].push(f);
        });

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

        const displayOrders = this.user.role === 'admin' 
            ? this.orders.filter(o => o.user_id === this.user.id) 
            : this.orders;

        list.innerHTML = displayOrders.map(o => {
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
                        ${(() => {
                            const grouped = {};
                            o.items.forEach(i => {
                                const key = i.product_id + '|' + (i.variation || '');
                                if (!grouped[key]) grouped[key] = { ...i };
                                else grouped[key].qty += i.qty;
                            });
                            return Object.values(grouped).map(i => `
                                <div class="order-item-row">
                                    <div class="order-item-info">
                                        <span class="item-qty">${i.qty}x</span>
                                        <span class="item-name">${this.esc(i.name)} ${i.variation ? `<small style="color:var(--brand); font-size:11px;">(${this.esc(i.variation)})</small>` : ''}</span>
                                    </div>
                                    <span class="item-total">${this.money(i.price * i.qty)}</span>
                                </div>
                            `).join('');
                        })()}
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

                ${o.is_group_order ? `
                <div style="padding:12px; background:color-mix(in srgb, var(--leaf) 10%, transparent); border-left:3px solid var(--leaf); border-radius:8px; font-size:11px; cursor:pointer; transition: all 0.2s;" 
                     onclick="app.viewAdminGroup(${o.group_cart_id})" 
                     onmouseover="this.style.background='color-mix(in srgb, var(--leaf) 20%, transparent)'; this.style.transform='translateX(4px)';" 
                     onmouseout="this.style.background='color-mix(in srgb, var(--leaf) 10%, transparent)'; this.style.transform='translateX(0)';">
                    <div style="font-weight:800; color:var(--leaf); text-transform:uppercase; margin-bottom:4px; display:flex; justify-content:space-between; align-items:center;">
                        <span>🏘️ Bayanihan Cart</span>
                        <span style="font-size:10px; background:var(--leaf); color:#fff; padding:2px 8px; border-radius:4px;">Click to View Details →</span>
                    </div>
                    <div style="color:var(--ink); font-weight:600; line-height:1.5;">
                        ${(o.contributors || []).map(c => `${this.esc(c.name)}${c.paid_amount ? ` (${this.money(c.paid_amount)})` : ''}`).join(' · ') || 'N/A'}
                    </div>
                </div>` : ''}

                ${o.refund_status === 'requested' ? `
                <div style="padding:12px; background:rgba(240,169,59,0.15); border:1px solid rgba(240,169,59,0.4); border-radius:8px; font-size:12px;">
                    <div style="font-weight:800; color:#d98c1d; text-transform:uppercase; margin-bottom:6px;">⏳ Refund Pending</div>
                    <div style="color:var(--ink); font-weight:600; margin-bottom:8px;"><b>Reason:</b> ${this.esc(o.refund_reason || 'N/A')}</div>
                    ${o.refund_proof ? `<button class="btn btn-ghost" style="padding:4px 8px; font-size:11px;" onclick="app.viewProof('${o.refund_proof}')">View Proof</button>` : ''}
                </div>` : ''}
                ${o.refund_status === 'approved' ? `<div style="padding:8px; background:rgba(63,122,69,0.1); color:var(--leaf); border-radius:8px; font-size:11px; font-weight:800; text-align:center;">✓ Refund Approved</div>` : ''}
                ${o.refund_status === 'rejected' ? `<div style="padding:8px; background:rgba(229,96,77,0.1); color:#e5604d; border-radius:8px; font-size:11px; font-weight:800; text-align:center;">✕ Refund Rejected</div>` : ''}

                <div class="order-footer" style="flex-wrap: wrap; gap: 10px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span class="footer-label">Kabuuan</span>
                        <span class="footer-total">${this.money(o.total)}</span>
                    </div>
                    
                    <!-- REFUND LOGIC -->
                    ${o.status === 'Delivered' ? `
                        ${(() => {
                            // Calculate if refund is still allowed
                            const deliveryTime = o.delivered_at ? new Date(o.delivered_at).getTime() : new Date(o.created_at).getTime();
                            const hoursElapsed = (Date.now() - deliveryTime) / (1000 * 60 * 60);
                            
                            // Check if any item is PASO
                            const hasPaso = o.items.some(i => {
                                const p = this.products.find(x => x.id === i.product_id);
                                return p && p.category === 'paso';
                            });
                            
                            const isExpired = hasPaso ? hoursElapsed > 24 : hoursElapsed > (24 * 7);

                            if (o.refund_status === 'requested') {
                                return '<span style="background:rgba(240,169,59,0.15); color:#d98c1d; padding:6px 12px; border-radius:99px; font-size:12px; font-weight:800; border:1px solid rgba(240,169,59,0.4);">⏳ Refund Pending</span>';
                            } else if (o.refund_status === 'approved') {
                                return '<span style="background:rgba(63,122,69,0.15); color:var(--leaf); padding:6px 12px; border-radius:99px; font-size:12px; font-weight:800; border:1px solid rgba(63,122,69,0.4);">✓ Refund Approved</span>';
                            } else if (o.refund_status === 'rejected') {
                                return '<span style="background:rgba(229,96,77,0.15); color:#e5604d; padding:6px 12px; border-radius:99px; font-size:12px; font-weight:800; border:1px solid rgba(229,96,77,0.4);">✕ Refund Rejected</span>';
                            } else if (isExpired) {
                                return '<span style="color:var(--muted); font-size:12px; font-weight:700; padding:6px 12px;">Refund period expired</span>';
                            } else {
                                return `<button class="btn btn-ghost" style="padding:6px 12px; font-size:12px; border-color:#e5604d; color:#e5604d;" onclick="app.openRefundModal(${o.id})">Request Refund</button>`;
                            }
                        })()}`
                    : ''}
                </div>
            </div>
            `;
        }).join('') || this.emptyState('orders', 'Wala ka pang individual order', 'Wala pang laman ang listahan mo. Tara, mamili tayo nang dahan-dahan!', 'Mamili na', 'app.scrollToMenu()');

        // 🟢 Suggest Group Carting
        if (list.innerHTML) {
            list.innerHTML += `
                <div class="card" style="text-align:center; border-color:var(--leaf); padding:24px; margin-top:20px; background:linear-gradient(135deg, var(--surface2), var(--surface));">
                    <h3 style="color:var(--leaf); margin-bottom:8px;">🏘️ Gusto mo bang mag-order kasama ang tropa?</h3>
                    <p style="color:var(--muted); font-size:14px; margin-bottom:16px;">Gamitin ang <b>Bayanihan Cart</b> para sabay-sabay kayong umorder at awtomatikong hatiin ang bayad!</p>
                    <button class="btn btn-leaf" onclick="app.navTo('bayanihan')">Try Bayanihan Cart</button>
                </div>
            `;
        }
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
        
        // 🟢 Added 'fees' to the array
        ['orders', 'stock', 'add', 'users', 'analytics', 'bayanihan', 'fees'].forEach(t => {
            const el = document.getElementById('admin-' + t);
            if (el) el.classList.add('hidden');
        });
        
        const target = document.getElementById('admin-' + tab);
        if (target) target.classList.remove('hidden');

        if (tab === 'users') this.renderAdminUsers();
        if (tab === 'analytics') this.renderAdminAnalytics();
        if (tab === 'bayanihan') this.renderAdminBayanihan();
        // 🟢 Added this line
        if (tab === 'fees') this.renderAdminFees(); 
    },

    toggleAdvancedFilters() {
        const el = document.getElementById('admin-advanced-filters');
        el.classList.toggle('hidden');
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
            const searchMatch =
                String(o.id).includes(this.adminOrderFilter.search) ||
                o.customer_name.toLowerCase().includes(this.adminOrderFilter.search) ||
                formattedAddr.toLowerCase().includes(this.adminOrderFilter.search) ||
                (o.phone && o.phone.includes(this.adminOrderFilter.search));

            const statusMatch = this.adminOrderFilter.status === 'all' || o.status === this.adminOrderFilter.status;
            
            let typeMatch = true;
            if (this.adminOrderFilter.type === 'bayanihan') typeMatch = !!o.is_group_order;
            if (this.adminOrderFilter.type === 'individual') typeMatch = !o.is_group_order;
            let deptMatch = true;
            if (this.adminOrderFilter.dept !== 'all') {
                deptMatch = o.items.some(i => {
                    const p = this.products.find(x => x.id === i.product_id);
                    return p && p.category === this.adminOrderFilter.dept;
                });
            }

            return searchMatch && statusMatch && typeMatch && deptMatch;
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
                    ${(() => {
                        // Group items by product ID and variation to prevent duplicates
                        const grouped = {};
                        o.items.forEach(i => {
                            const key = i.product_id + '|' + (i.variation || '');
                            if (!grouped[key]) grouped[key] = { ...i };
                            else grouped[key].qty += i.qty;
                        });
                        return Object.values(grouped).map(i => `<div class="admin-item-row"><span>${i.qty}x ${this.esc(i.name)} ${i.variation ? `<small style="color:var(--brand);">(${this.esc(i.variation)})</small>` : ''}</span><span>${this.money(i.price * i.qty)}</span></div>`).join('');
                    })()}
                </div>

                ${o.is_group_order ? `
                <div style="padding:10px 12px; background:color-mix(in srgb, var(--leaf) 10%, transparent); border-left:3px solid var(--leaf); border-radius:8px; font-size:11px;">
                    <div style="font-weight:800; color:var(--leaf); text-transform:uppercase; margin-bottom:4px;">🏘️ Bayanihan Cart</div>
                    <div style="color:var(--ink); font-weight:600; line-height:1.5;">
                        ${(o.contributors || []).map(c => `${this.esc(c.name)}${c.paid_amount ? ` (${this.money(c.paid_amount)})` : ''}`).join(' · ') || 'N/A'}
                    </div>
                </div>` : ''}

                ${o.refund_status === 'requested' ? `
                <div style="padding:12px; background:rgba(229,96,77,0.1); border:1px solid rgba(229,96,77,0.3); border-radius:8px; font-size:12px;">
                    <div style="font-weight:800; color:#e5604d; text-transform:uppercase; margin-bottom:6px;">⚠️ Refund Requested</div>
                    <div style="color:var(--ink); font-weight:600; margin-bottom:8px;"><b>Reason:</b> ${this.esc(o.refund_reason || 'N/A')}</div>
                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        ${o.refund_proof ? `<button class="btn btn-ghost" style="padding:4px 8px; font-size:11px;" onclick="app.viewProof('${o.refund_proof}')">View Proof</button>` : ''}
                        <button class="btn btn-leaf" style="padding:4px 8px; font-size:11px;" onclick="app.handleAdminRefund(${o.id}, 'approve')">Approve</button>
                        <button class="btn btn-danger" style="padding:4px 8px; font-size:11px;" onclick="app.handleAdminRefund(${o.id}, 'reject')">Reject</button>
                    </div>
                </div>` : ''}
                ${o.refund_status === 'approved' ? `<div style="padding:8px; background:rgba(63,122,69,0.1); color:var(--leaf); border-radius:8px; font-size:11px; font-weight:800; text-align:center;">✓ Refund Approved</div>` : ''}
                ${o.refund_status === 'rejected' ? `<div style="padding:8px; background:rgba(229,96,77,0.1); color:#e5604d; border-radius:8px; font-size:11px; font-weight:800; text-align:center;">✕ Refund Rejected</div>` : ''}

                <div class="admin-order-footer">
                    <div class="admin-order-total">
                        <span>Total:</span>
                        <b>${this.money(o.total)}</b>
                        ${(o.protection_fee && o.protection_fee > 0) ? `<small style="display:block; font-size:10px; color:var(--muted); font-weight:700;">incl. ${this.money(o.protection_fee)} protection</small>` : ''}
                    </div>
                    <div class="admin-order-payment">
                        ${o.payment === 'gcash'
                            ? (o.payment_proof
                                ? `<button class="btn btn-ghost" style="padding:4px 8px; font-size:11px;" onclick="app.viewProof('${o.payment_proof}')">View GCash Proof</button>`
                                : '<span class="pay-badge" style="background:rgba(47,140,255,0.15); color:#2f8cff;">GCash</span>')
                            : '<span class="pay-badge">COD</span>'}
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
                                    <div style="display:flex; gap:15px; font-size:12px; font-weight:700; color:var(--muted); margin: 4px 0 8px 0;">
                                        <span>Price: <b style="color:var(--brand);">₱${p.price}</b></span>
                                        <span>Stock: <b style="color:${p.stock > 0 ? 'var(--leaf)' : '#e5604d'}">${p.stock}</b></span>
                                    </div>
                                    <div class="admin-inv-actions">
                                        <button class="btn btn-ghost" style="padding:6px 12px; font-size:12px; width: 100%;" onclick="app.openProductEditor(${p.id})">Edit</button>
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

        // 🟢 Parse options JSON and build UI
        const optContainer = document.getElementById('pe-options-container');
        optContainer.innerHTML = ''; // Clear old UI
        if (p.options) {
            try {
                const parsed = JSON.parse(p.options);
                for (const [groupName, choices] of Object.entries(parsed)) {
                    this.addPeOptionGroup(groupName, choices);
                }
            } catch(e) { console.warn('Invalid options JSON from DB', e); }
        }

        document.getElementById('pe-delete-btn').style.display = 'block';
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

    addPeOptionGroup(groupName = '', choices = []) {
        const container = document.getElementById('pe-options-container');
        const groupDiv = document.createElement('div');
        groupDiv.className = 'pe-option-group';
        groupDiv.style.cssText = 'background:var(--bg); padding:12px; border-radius:12px; border:1px solid var(--line);';

        groupDiv.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <input type="text" class="input pe-opt-name" placeholder="Option Name (e.g. Size)" value="${this.esc(groupName)}" style="padding:6px 10px; font-size:13px; width:75%; font-weight:800;">
                <button type="button" class="qty-circle-btn" onclick="this.closest('.pe-option-group').remove()" style="color:#e5604d; border-color:rgba(229,96,77,0.3);" title="Remove Group">✕</button>
            </div>
            <div class="pe-opt-choices-container" style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;">
                <!-- Choices go here -->
            </div>
            <button type="button" class="btn btn-ghost" style="padding:4px 10px; font-size:11px; border-radius:6px;" onclick="app.addPeOptionChoice(this)">
                + Add Choice
            </button>
        `;

        container.appendChild(groupDiv);

        // If choices were passed (loading existing data), add them
        const choicesContainer = groupDiv.querySelector('.pe-opt-choices-container');
        if (choices.length > 0) {
            choices.forEach(c => this._appendChoiceInput(choicesContainer, c));
        } else {
            this._appendChoiceInput(choicesContainer, ''); // Add one empty input by default
        }
    },

    _appendChoiceInput(container, value = '') {
        const div = document.createElement('div');
        div.style.cssText = 'display:flex; align-items:center; gap:8px;';
        div.innerHTML = `
            <input type="text" class="input pe-opt-choice" placeholder="Choice (e.g. Small)" value="${this.esc(value)}" style="padding:6px 10px; font-size:12px; flex:1;">
            <button type="button" class="qty-circle-btn" onclick="this.parentElement.remove()" style="color:#e5604d; border-color:rgba(229,96,77,0.3); width:22px; height:22px; font-size:10px;">✕</button>
        `;
        container.appendChild(div);
    },

    addPeOptionChoice(btn) {
        const container = btn.previousElementSibling; // gets the .pe-opt-choices-container
        this._appendChoiceInput(container);
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

        // 🟢 Rebuild the options JSON from the dynamic UI
        const optionsObj = {};
        document.querySelectorAll('#pe-options-container .pe-option-group').forEach(group => {
            const groupName = group.querySelector('.pe-opt-name').value.trim();
            if (!groupName) return; // Skip empty groups

            const choices = [];
            group.querySelectorAll('.pe-opt-choice').forEach(input => {
                const val = input.value.trim();
                if (val) choices.push(val); // Skip empty choices
            });

            if (choices.length > 0) {
                optionsObj[groupName] = choices;
            }
        });
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
            options: optionsStr // Send the rebuilt JSON string
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
        this.showConfirm(
            'Delete Order',
            'Are you sure you want to permanently delete this order? This action cannot be undone.',
            async () => {
                await fetch('api.php?action=admin-delete-order', {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ order_id: id })
                });
                this.showToast('Order deleted.');
                await this.reloadAdminData();
            },
            'Delete'
        );
    },

    async handleAdminRefund(orderId, action) {
        const actionText = action === 'approve' ? 'I-APPROVE' : 'I-REJECT';
        const btnColor = action === 'approve' ? 'var(--leaf)' : '#e5604d';
        
        if (!confirm(`Sigurado ka bang ${actionText} ang refund para sa Order #${orderId}?`)) return;

        try {
            const res = await fetch('api.php?action=admin-handle-refund', {
                method: 'POST', 
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ order_id: orderId, action })
            });
            const data = await res.json();
            
            if (data.ok) {
                this.showToast(`Refund ${action === 'approve' ? 'approved' : 'rejected'}.`);
                await this.reloadAdminData();
            } else {
                this.showToast(data.error || 'Failed to process refund.');
            }
        } catch (e) {
            this.showToast('Connection error.');
        }
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

    deleteProductEditor() {
        if (!this.editingProductId) return;
        const id = this.editingProductId;
        this.closeProductEditor();
        this.deleteProduct(id);
    },

    async deleteProduct(id) {
        this.showConfirm(
            'Delete Product',
            'Are you sure you want to archive this product? It will no longer appear on the menu.',
            async () => {
                await fetch('api.php?action=admin-delete-product', {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ id })
                });
                this.showToast('Product archived.');
                await this.reloadAdminData();
            },
            'Archive'
        );
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
            options: document.getElementById('add-options').value.trim()
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
        const next = html.getAttribute('data-theme') === 'sunset' ? 'day' : 'sunset';
        
        // 1. Enable smooth cross-fade
        html.classList.add('theme-switching');
        void html.offsetWidth; // Forces the browser to apply the transition rule immediately
        
        // 2. Apply the new theme
        html.setAttribute('data-theme', next);
        localStorage.setItem('pk_theme', next);
        
        // 3. Update the toggle pill UI
        const pillWrap = document.getElementById('nd-theme-pill')?.parentElement;
        if (pillWrap) pillWrap.classList.toggle('is-sunset', next === 'sunset');
        
        // 4. Remove the transition class ONLY after the 0.7s animation finishes
        clearTimeout(this._themeTimeout);
        this._themeTimeout = setTimeout(() => {
            html.classList.remove('theme-switching');
        }, 800); 
    },

    checkTheme() {
        const saved = localStorage.getItem('pk_theme') || 'day';
        document.documentElement.setAttribute('data-theme', saved);
        const pillWrap = document.getElementById('nd-theme-pill')?.parentElement;
        if (pillWrap) pillWrap.classList.toggle('is-sunset', saved === 'sunset');
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

    // 🟢 Normalize: lowercase + strip punctuation + collapse spaces + pad with spaces
    const q = ' ' + userMessage
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim() + ' ';

    input.value = '';
    chat.scrollTop = chat.scrollHeight;

    setTimeout(() => {
        let reply = "Hmm, di ko pa alam 'yan, suki! :) Subukan mong itanong ang delivery, GCash, orders, products, o Budget Mode.";

        const match = this.botBrain.find(bot =>
            bot.keys.some(k => {
                const cleanKey = k.toLowerCase()
                    .replace(/[^a-z0-9\s]/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                if (!cleanKey) return false;

                // Multi-word phrases → match anywhere
                if (cleanKey.includes(' ')) return q.includes(' ' + cleanKey);
                // Single words → require word boundaries (surrounding spaces)
                return q.includes(' ' + cleanKey + ' ');
            })
        );

        if (match) {
            reply = typeof match.reply === 'function'
                ? match.reply.call(this)
                : match.reply;
        }

        chat.innerHTML += `<div class="pb-msg">${reply}</div>`;
        chat.scrollTop = chat.scrollHeight;
    }, 600);
},

        // ============================================================
    // BAYANIHAN CART
    // ============================================================
    async loadGroups() {
        if (!this.user) return;
        try {
            const [gr, ir] = await Promise.all([
                fetch('api.php?action=group-list'),
                fetch('api.php?action=group-my-invites')
            ]);
            this.bayanihan.list = await gr.json();
            this.bayanihan.invites = await ir.json();
        } catch (e) { console.warn('loadGroups', e); }
    },

    copyText(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text)
                .then(() => this.showToast('Copied!'))
                .catch(() => this._fallbackCopy(text));
        } else this._fallbackCopy(text);
    },
    _fallbackCopy(text) {
        const t = document.createElement('textarea');
        t.value = text; document.body.appendChild(t);
        t.select(); document.execCommand('copy'); t.remove();
        this.showToast('Copied!');
    },

    openCreateGroupModal() {
        document.getElementById('bg-create-name').value = '';
        document.getElementById('bayanihan-create-modal').classList.remove('hidden');
    },
    async submitCreateGroup() {
        const name = document.getElementById('bg-create-name').value.trim() || 'Bayanihan Cart';
        try {
            const res = await fetch('api.php?action=group-create', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const data = await res.json();
            if (data.ok) {
                this.closeModal('bayanihan-create-modal');
                this._newGroupId = data.id;
                this.showCodeShareModal(data.code, data.name || name, data.id);
                await this.loadGroups();
                if (this.currentView === 'bayanihan') this.renderBayanihan();
            } else this.showToast(data.error || 'Failed');
        } catch (e) { this.showToast('Connection error'); }
    },
    showCodeShareModal(code, name, gid) {
        this._newGroupId = gid;
        document.getElementById('bg-code-display').textContent = code;
        document.getElementById('bg-code-group-name').textContent = name;
        document.getElementById('bayanihan-code-modal').classList.remove('hidden');
    },
    copyGroupCode() {
        this.copyText(document.getElementById('bg-code-display').textContent);
    },
    async shareGroupCode() {
        const code = document.getElementById('bg-code-display').textContent;
        const name = document.getElementById('bg-code-group-name').textContent;
        const text = `Join my PiliKart Bayanihan Cart "${name}"! Use code: ${code}`;
        if (navigator.share) {
            try { await navigator.share({ title: 'PiliKart Bayanihan Cart', text }); }
            catch (e) {}
        } else this.copyText(text);
    },

    openJoinGroupModal() {
        document.getElementById('bg-join-code').value = '';
        document.getElementById('bayanihan-join-modal').classList.remove('hidden');
    },

    switchBayanihanTab(tab, btn) {
        document.querySelectorAll('.admin-tab-btn').forEach(b => {
            b.className = 'btn btn-ghost admin-tab-btn';
        });
        btn.className = 'btn btn-brand admin-tab-btn';

        if (tab === 'active') {
            document.getElementById('bayanihan-active-list').classList.remove('hidden');
            document.getElementById('bayanihan-history-list').classList.add('hidden');
        } else {
            document.getElementById('bayanihan-active-list').classList.add('hidden');
            document.getElementById('bayanihan-history-list').classList.remove('hidden');
        }
    },

    async submitJoinGroup() {
        const code = (document.getElementById('bg-join-code').value || '').toUpperCase().trim();
        if (code.length !== 6) return this.showToast('Kailangan ng 6-character code.');
        try {
            const res = await fetch('api.php?action=group-join-request', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const data = await res.json();
            if (data.ok) {
                this.closeModal('bayanihan-join-modal');
                this.showToast('Join request sent! Hintayin ang approval.');
                await this.loadGroups();
                this.renderBayanihan();
            } else this.showToast(data.error || 'Failed');
        } catch (e) { this.showToast('Connection error'); }
    },

    async renderBayanihan() {
        if (!this.user) { this.go('auth'); return; }
        await this.loadGroups();

        const invEl = document.getElementById('bayanihan-invites');
        if (this.bayanihan.invites && this.bayanihan.invites.length) {
            invEl.innerHTML = `
                <div class="card" style="margin-bottom:20px; border-color:var(--amber);">
                    <h3 style="margin-bottom:12px; font-size:18px;">📬 Pending Invites</h3>
                    ${this.bayanihan.invites.map(inv => `
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; padding:12px; background:var(--surface2); border-radius:12px; margin-bottom:8px; flex-wrap:wrap;">
                            <div>
                                <b>${this.esc(inv.group_name)}</b>
                                <div style="font-size:12px; color:var(--muted);">Host: ${this.esc(inv.host_name)} · Code: ${this.esc(inv.code)}</div>
                            </div>
                            <div style="display:flex; gap:8px;">
                                <button class="btn btn-leaf" style="padding:6px 12px; font-size:12px;" onclick="app.acceptInvite(${inv.group_id})">Accept</button>
                                <button class="btn btn-ghost" style="padding:6px 12px; font-size:12px;" onclick="app.declineInvite(${inv.group_id})">Decline</button>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
        } else invEl.innerHTML = '';

        const activeList = document.getElementById('bayanihan-active-list');
        const historyList = document.getElementById('bayanihan-history-list');

        let activeHtml = '';
        let historyHtml = '';

        this.bayanihan.list.forEach(g => {
            let displayStatus = g.status;
            let statusClass = 'status-shipping';
            
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
                    <div class="admin-order-header">
                        <div><h4>${this.esc(g.name)}</h4><span class="admin-order-date">Host: ${this.esc(g.host_name)}</span></div>
                        <span class="order-status ${statusClass}">${this.esc(displayStatus)}</span>
                    </div>
                    <div style="padding:14px; background:var(--surface2); border-radius:12px; text-align:center; position:relative;">
                        <div style="font-size:10px; font-weight:800; color:var(--muted); text-transform:uppercase;">Cart Code</div>
                        <div style="font-size:28px; font-weight:900; letter-spacing:5px; color:var(--brand); font-family:'Baloo 2';">${this.esc(g.code)}</div>
                        <button class="qty-circle-btn" style="position:absolute; top:8px; right:8px; width:30px; height:30px;"
                                onclick="event.stopPropagation(); app.copyText('${g.code}')" title="Copy">📋</button>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700;">
                        <span>👥 <b>${g.member_count}</b> member${g.member_count === 1 ? '' : 's'}</span>
                        <span style="color:var(--brand);">${this.money(g.subtotal)}</span>
                    </div>
                    ${myStatus}
                </div>`;

            if (g.status === 'open') {
                activeHtml += cardHtml;
            } else {
                historyHtml += cardHtml;
            }
        });

        // Render Active
        if (activeHtml) {
            activeList.innerHTML = `<div class="admin-orders-grid">${activeHtml}</div>`;
        } else {
            activeList.innerHTML = this.emptyState('orders', 'Wala kang Active na Bayanihan Cart', 'Gumawa ng bagong Bayanihan Cart o sumali gamit ang code.', 'Create Bayanihan Cart', 'app.openCreateGroupModal()');
        }

        // Render History
        if (historyHtml) {
            historyList.innerHTML = `<div class="admin-orders-grid">${historyHtml}</div>`;
        } else {
            historyList.innerHTML = this.emptyState('orders', 'Walang Order History', 'Wala ka pang nakaraang Bayanihan orders.');
        }
    },

    async acceptInvite(gid) {
        await fetch('api.php?action=group-accept-invite', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ group_id: gid }) });
        this.showToast('Invite accepted!'); await this.renderBayanihan();
    },
    async declineInvite(gid) {
        await fetch('api.php?action=group-decline-invite', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ group_id: gid }) });
        await this.renderBayanihan();
    },
    async withdrawJoin(gid) {
        if (!confirm('Withdraw your join request?')) return;
        await fetch('api.php?action=group-leave', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ group_id: gid }) });
        this.showToast('Request withdrawn.'); await this.renderBayanihan();
    },

    async openGroupDetail(gid) {
        try {
            const res = await fetch('api.php?action=group-get', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: gid })
            });
            const data = await res.json();
            if (data.error) { this.showToast(data.error); return; }
            this.bayanihan.current = data;
            this.go('bayanihan-detail');
            this.renderGroupDetail();
        } catch (e) { this.showToast('Error loading'); }
    },

    computeGroupSplit(g, subtotal, deliveryFee) {
        const approved = g.members.filter(m => m.status === 'approved');
        const n = approved.length;
        if (n === 0) return [];
        const total = subtotal + deliveryFee;
        const method = g.split_method || 'equal';
        const fixedAmount = parseInt(g.fixed_amount) || 0;
        const result = approved.map(m => ({
            userId: m.user_id, name: m.name, role: m.role,
            amount: 0, isFixed: !!m.is_fixed, isPayer: !!m.is_payer
        }));
        if (method === 'equal') {
            const per = Math.floor(total / n); let rem = total - per * n;
            result.forEach(r => r.amount = per);
            for (let i = 0; i < rem; i++) result[i % n].amount += 1;
        } else if (method === 'by_adder') {
            const userSub = {};
            g.items.forEach(it => { userSub[it.user_id] = (userSub[it.user_id] || 0) + it.price * it.qty; });
            const feePer = Math.floor(deliveryFee / n); let feeRem = deliveryFee - feePer * n;
            result.forEach(r => r.amount = (userSub[r.userId] || 0) + feePer);
            for (let i = 0; i < feeRem; i++) result[i % n].amount += 1;
        } else if (method === 'fixed_contribution') {
            const fixed = result.filter(r => {
                const m = g.members.find(mm => mm.user_id === r.userId);
                return (parseInt(m.fixed_share_amount) || 0) > 0;
            });
            const unfixed = result.filter(r => {
                const m = g.members.find(mm => mm.user_id === r.userId);
                return (parseInt(m.fixed_share_amount) || 0) <= 0;
            });

            let sumFixed = 0;
            fixed.forEach(r => {
                const m = g.members.find(mm => mm.user_id === r.userId);
                r.amount = parseInt(m.fixed_share_amount) || 0;
                sumFixed += r.amount;
            });

            if (fixed.length === 0) {
                const per = Math.floor(total / n); let rem = total - per * n;
                result.forEach(r => r.amount = per);
                for (let i = 0; i < rem; i++) result[i % n].amount += 1;
            } else if (unfixed.length > 0) {
                const remainder = total - sumFixed;
                if (remainder > 0) {
                    const per = Math.floor(remainder / unfixed.length);
                    let rem = remainder - per * unfixed.length;
                    unfixed.forEach((r, i) => r.amount = per + (i < rem ? 1 : 0));
                } else if (remainder < 0) {
                    unfixed.forEach(r => r.amount = 0); // Fix for overpaying
                }
            }
        } else if (method === 'one_payer') {
            const payers = result.filter(r => r.isPayer);
            if (!payers.length) {
                const per = Math.floor(total / n); let rem = total - per * n;
                result.forEach(r => r.amount = per);
                for (let i = 0; i < rem; i++) result[i % n].amount += 1;
            } else {
                const per = Math.floor(total / payers.length); let rem = total - per * payers.length;
                payers.forEach((r, i) => r.amount = per + (i < rem ? 1 : 0));
                result.filter(r => !r.isPayer).forEach(r => r.amount = 0);
            }
        }
        return result;
    },

    renderGroupDetail() {
        const g = this.bayanihan.current;
        const body = document.getElementById('bayanihan-detail-body');
        if (!body || !g || !this.user) return;
        const me = g.members.find(m => m.user_id === this.user.id);
        if (!me) { body.innerHTML = '<p>Access denied.</p>'; return; }
        // Only block 'pending' users. 'invited' users can see the page.
        if (me.status === 'pending') {
            body.innerHTML = `
                <div class="page-head">
                    <button class="btn btn-ghost" style="margin-bottom:12px; padding:6px 14px; font-size:13px;" onclick="app.go('bayanihan')">← Back</button>
                    <h1>${this.esc(g.name)}</h1>
                </div>
                <div class="co-card" style="text-align:center; padding:40px;">
                    <h3>⏳ Waiting for approval</h3>
                    <p style="color:var(--muted); margin:12px 0;">Pending ang request mo. Tanungin ang host na i-approve.</p>
                    <button class="btn btn-ghost" onclick="app.go('bayanihan')">Back</button>
                </div>`;
            return;
        }

        const isReadOnly = me.status === 'invited';
        const isHost = me.role === 'host';
        const subtotal = g.items.reduce((s, it) => s + it.price * it.qty, 0);
        const approvedMembers = g.members.filter(m => m.status === 'approved');
        const pendingMembers = g.members.filter(m => m.status === 'pending');
        const invitedMembers = g.members.filter(m => m.status === 'invited');
        const allPaid = approvedMembers.length > 0 && approvedMembers.every(m => m.paid === 1 && m.payer_verified === 1);
        const deliveryFee = parseInt(g.delivery_fee) || 0;
        const total = subtotal + deliveryFee;
        const split = this.computeGroupSplit(g, subtotal, deliveryFee);
        
        // 🟢 ADD THESE TWO LINES HERE:
        const totalFixed = approvedMembers.reduce((s, m) => s + (parseInt(m.fixed_share_amount) || 0), 0);
        const hasUnfixed = approvedMembers.some(m => (parseInt(m.fixed_share_amount) || 0) <= 0);
        const sumPaid = split.reduce((s, r) => {
            const m = g.members.find(mm => mm.user_id === r.userId);
            return s + (m && m.paid ? m.paid_amount : 0);
        }, 0);
        const shortfall = total - sumPaid;
        const itemsByUser = {};
        g.items.forEach(it => {
            if (!itemsByUser[it.user_id]) itemsByUser[it.user_id] = { name: it.user_name, items: [] };
            itemsByUser[it.user_id].items.push(it);
        });
        const hostMember = g.members.find(m => m.role === 'host');
        const isOrdered = g.status === 'ordered';
        const isCancelled = g.status === 'cancelled';
        const orderStatus = g.order_status || 'Pending';

        // TOP SUMMARY CARDS
        const topCards = `
            <div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
                <div style="padding:12px 20px; background:var(--surface); border:1px solid var(--line); border-radius:14px; text-align:center;">
                    <div style="font-size:10px; font-weight:800; color:var(--muted); text-transform:uppercase;">Cart Code</div>
                    <div style="font-size:24px; font-weight:900; letter-spacing:4px; color:var(--brand); font-family:'Baloo 2';">${this.esc(g.code)}</div>
                    <button class="btn btn-ghost" style="padding:2px 10px; font-size:11px; margin-top:4px;" onclick="app.copyText('${g.code}')">Copy</button>
                </div>
                <div style="padding:12px 20px; background:var(--surface); border:1px solid var(--line); border-radius:14px; text-align:center;">
                    <div style="font-size:10px; font-weight:800; color:var(--muted); text-transform:uppercase;">Status</div>
                    <div style="font-size:18px; font-weight:800; text-transform:uppercase;">${this.esc(isOrdered ? orderStatus : g.status)}</div>
                </div>
                <div style="padding:12px 20px; background:var(--surface); border:1px solid var(--line); border-radius:14px; text-align:center; flex:1;">
                    <div style="font-size:10px; font-weight:800; color:var(--muted); text-transform:uppercase;">Total Bill</div>
                    <div style="font-size:24px; font-weight:800; color:var(--brand); font-family:'Baloo 2';">${this.money(total)}</div>
                </div>
            </div>`;

        // ACTION BUTTONS AT THE TOP
        let actions = '';
        if (isReadOnly) {
            actions = `
                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
                    <div style="flex:1; padding:14px; background:rgba(240, 169, 59, 0.15); border:1px solid var(--amber); border-radius:14px; text-align:center; color:var(--ink); font-weight:700;">
                        📬 You are invited to this cart. Accept to join and split the bill.
                    </div>
                    <button class="btn btn-leaf btn-large" onclick="app.acceptInvite(${g.id})">✓ Accept Invite</button>
                    <button class="btn btn-ghost btn-large" onclick="app.declineInvite(${g.id})">Decline</button>
                </div>`;
        } else if (isHost && g.status === 'open') {
            const isDeliverySet = g.customer_name && g.phone && g.delivery_address;
            
            // 🟢 Checks if everyone is fixed but the sum doesn't equal the exact bill
            const isFixedMismatch = g.split_method === 'fixed_contribution' && !hasUnfixed && totalFixed !== total;
            const isOverTotal = g.split_method === 'fixed_contribution' && totalFixed > total;

            const canConfirm = allPaid && shortfall <= 0 && g.items.length > 0 && isDeliverySet && approvedMembers.length >= 2 && !isOverTotal && !isFixedMismatch;
            const byAdderBlocked = g.split_method === 'by_adder' && !g.all_have_items;

            let statusMsg = '';
            let isError = false;

            if (!g.items.length) statusMsg = 'Walang laman pa ang cart.';
            else if (approvedMembers.length < 2) { statusMsg = 'Kailangan ng hindi bababa sa 2 miyembro para ma-confirm.'; isError = true; }
            else if (byAdderBlocked) { statusMsg = 'Cannot confirm: "By Items" split is chosen but someone has not added any items yet.'; isError = true; }
            else if (!isDeliverySet) statusMsg = 'Kumpletuhin muna ang delivery details.';
            else if (isOverTotal) { statusMsg = 'Lumalampas ang fixed amounts sa total bill! Bawasan ang ilan.'; isError = true; }
            else if (isFixedMismatch) { statusMsg = 'Kulang ang kabuuang fixed amounts. Kailangang eksaktong magtugma ito sa Total Bill.'; isError = true; }
            else if (shortfall > 0) statusMsg = `Kulang ang bayad ng ${this.money(shortfall)}.`;
            else if (!allPaid) statusMsg = 'Hintayin munang magbayad at ma-verify ang lahat.';

            actions = `
                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
                    ${canConfirm
                        ? '<button class="btn btn-brand btn-large" onclick="app.confirmGroupOrder()">✓ Confirm & Place Order</button>'
                        : `<div style="flex:1; padding:16px; background:${isError ? 'rgba(229,96,77,0.1)' : 'var(--surface2)'}; border:${isError ? '1px solid #e5604d' : '1px solid transparent'}; border-radius:14px; text-align:center; color:${isError ? '#e5604d' : 'var(--muted)'}; font-weight:700;">
                            ${statusMsg}
                           </div>`}
                    <button class="btn btn-ghost" onclick="app.inviteToGroup()">📧 Invite via Email</button>
                    <button class="btn btn-danger" onclick="app.cancelGroup()">Cancel Bayanihan Cart</button>
                </div>`;
        } else if (g.status === 'open') {
            const blocked = me.paid == 1 && me.payment_method === 'gcash';
            actions = blocked
                ? '<div style="padding:14px; background:var(--surface2); border-radius:10px; text-align:center; font-weight:700; color:var(--muted); margin-bottom:20px;">Hindi ka pwedeng umalis: nagbayad ka na via GCash. Ipa-refund muna sa host.</div>'
                : '<button class="btn btn-ghost" style="margin-bottom:20px;" onclick="app.leaveGroup()">Leave Bayanihan Cart</button>';
        }

        // DELIVERED HIGHLIGHT
        let deliveredHighlight = '';
        if (isOrdered) {
            deliveredHighlight = `
                <div class="co-card" style="margin-bottom:20px; border-color:var(--leaf);">
                    <h3 style="color:var(--leaf); display:flex; justify-content:space-between; align-items:center;">
                        <span>🏘️ Bayanihan Order Summary</span>
                        <span class="order-status ${orderStatus === 'Delivered' ? 'status-delivered' : 'status-pending'}">${orderStatus}</span>
                    </h3>
                    <p style="color:var(--muted); margin-bottom:16px;">Order #${g.order_id} — Here is what everyone contributed:</p>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                        ${Object.entries(itemsByUser).map(([uid, grp]) => `
                            <div style="background:var(--bg); padding:16px; border-radius:14px; border:1px solid var(--line);">
                                <div style="font-weight:800; color:var(--brand); margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    ${this.esc(grp.name)}
                                </div>
                                ${grp.items.map(it => `
                                    <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600; margin-bottom:4px;">
                                        <span>${it.qty}× ${this.esc(it.name)}</span>
                                        <span>${this.money(it.price * it.qty)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        `).join('')}
                    </div>
                </div>`;
        }

        // DELIVERY DETAILS
        const editable = isHost && g.status === 'open' && !isReadOnly;
        let currentAddr = { city: '', brgy: '', street: '' };
        try {
            if (g.delivery_address && g.delivery_address.trim().startsWith('{')) {
                currentAddr = JSON.parse(g.delivery_address);
            } else if (g.delivery_address) {
                currentAddr.street = g.delivery_address;
            }
        } catch(e) {}
        
        const defaultRecipientName = g.customer_name || (hostMember ? hostMember.name : '');
        const defaultMemberObj = approvedMembers.find(m => m.name === defaultRecipientName);
        const defaultRecipientPhone = g.phone || (defaultMemberObj ? defaultMemberObj.phone : '');

        const memberOptions = approvedMembers.map(m => 
            `<option value="${this.esc(m.name)}|${this.esc(m.phone || '')}" ${defaultRecipientName === m.name ? 'selected' : ''}>${this.esc(m.name)} (${this.esc(m.phone || 'No phone')})</option>`
        ).join('');

        const cityOptions = Object.keys(this.lagunaData).map(c => 
            `<option value="${c}" ${currentAddr.city === c ? 'selected' : ''}>${c}</option>`
        ).join('');

        let brgyOptions = '<option value="" disabled selected>Pumili ng Barangay</option>';
        if (currentAddr.city && this.lagunaData[currentAddr.city]) {
            brgyOptions = Object.keys(this.lagunaData[currentAddr.city]).map(b => 
                `<option value="${b}" ${currentAddr.brgy === b ? 'selected' : ''}>${b}</option>`
            ).join('');
        }

        const deliveryHtml = `
            <div class="co-card" style="margin-bottom:0;">
                <h3>📍 Delivery Details ${!editable ? '<small style="color:var(--muted); font-weight:600; font-size:11px;">(locked)</small>' : ''}</h3>
                <div class="co-row">
                    <div class="co-field">
                        <label>Recipient (Member)</label>
                        <select id="bg-member" class="input" ${editable ? '' : 'disabled'} onchange="app.updateGroupRecipient(this.value)">
                            <option value="" disabled ${!defaultRecipientName ? 'selected' : ''}>Select member...</option>
                            ${memberOptions}
                        </select>
                    </div>
                    <div class="co-field">
                        <label>Contact Number</label>
                        <input type="text" id="bg-phone" class="input" value="${this.esc(defaultRecipientPhone || '')}" ${editable ? '' : 'disabled'} placeholder="Ilagay ang contact number">
                    </div>
                </div>
                <div class="co-row">
                    <div class="co-field">
                        <label>Lungsod</label>
                        <select id="bg-city" class="input" ${editable ? '' : 'disabled'} onchange="app.updateGroupBrgyDropdown()">
                            <option value="" disabled ${!currentAddr.city ? 'selected' : ''}>Pumili ng Lungsod</option>
                            ${cityOptions}
                        </select>
                    </div>
                    <div class="co-field">
                        <label>Barangay</label>
                        <select id="bg-brgy" class="input" ${editable ? '' : 'disabled'} onchange="app.updateGroupFee()">
                            ${brgyOptions}
                        </select>
                    </div>
                </div>
                <div class="co-row">
                    <div class="co-field">
                        <label>Additional info (Street, Bldg, Subd)</label>
                        <input type="text" id="bg-street" class="input" value="${this.esc(currentAddr.street || '')}" ${editable ? '' : 'disabled'}>
                    </div>
                    <div class="co-field">
                        <label>Payment Method (Auto)</label>
                        <input type="text" class="input" value="${g.payment_summary}" readonly style="background:var(--bg); color:var(--brand); font-weight:800;">
                    </div>
                </div>
                <div class="co-row">
                    <div class="co-field">
                        <label>Delivery Fee (₱)</label>
                        <input type="number" id="bg-fee" class="input" value="${deliveryFee}" ${editable ? '' : 'disabled'} readonly>
                    </div>
                </div>
                ${editable ? '<button class="btn btn-ghost" style="margin-top:8px;" onclick="app.saveDeliveryDetails()">Save Delivery Details</button>' : ''}
            </div>`;

        // ITEMS LIST
        const hasPaidMembers = approvedMembers.some(m => m.paid == 1);

        const itemsHtml = `
            <div class="co-card" style="margin-bottom:0; height: 100%;">
                <h3>🛒 Items (${g.items.length})</h3>
                ${g.items.length === 0
                    ? '<p style="color:var(--muted); text-align:center; padding:20px;">Walang laman ang cart.</p>'
                    : Object.entries(itemsByUser).map(([uid, grp]) => `
                        <div style="margin-bottom:16px; border-left:3px solid var(--brand); padding-left:12px;">
                            <div style="font-weight:800; color:var(--brand); margin-bottom:8px; font-size:13px;">Added by: ${this.esc(grp.name)}</div>
                            ${grp.items.map(it => `
                                <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:var(--surface2); border-radius:10px; margin-bottom:6px; gap:10px; flex-wrap:wrap;">
                                    <div style="flex:1;">
                                        <b style="font-size:13px;">${this.esc(it.name)}</b>
                                        ${it.variation ? `<div style="font-size:11px; color:var(--brand); font-weight:800;">${this.esc(it.variation)}</div>` : ''}
                                        <div style="font-size:11px; color:var(--muted);">${it.qty} × ${this.money(it.price)}</div>
                                    </div>
                                    <div style="display:flex; align-items:center; gap:10px;">
                                        <div style="font-family:'Baloo 2'; font-weight:800;">${this.money(it.price * it.qty)}</div>
                                        ${(g.status === 'open' && (it.user_id === this.user.id || isHost) && !isReadOnly) ? `
                                        <button class="btn btn-ghost" style="padding:4px 10px; font-size:11px; border-radius:6px;" onclick='app.openEditGroupItem(${JSON.stringify(it).replace(/'/g, "&#39;")})'>Edit</button>
                                    ` : ''}
                                    </div>
                                </div>`).join('')}
                        </div>`).join('')}
                ${(g.status === 'open' && me.status === 'approved' && !isReadOnly) ? `
                    <button class="btn btn-brand" style="margin-top:10px; width:100%;" onclick="app.addMoreToGroup()">+ Add More Items from Menu</button>
                ` : ''}
            </div>`;

        // SPLIT SETTINGS & APPROVALS
        let splitSettings = '';
        if (isHost && g.status === 'open') {
            splitSettings = `
                <div class="co-card" style="margin-bottom:0; height: 100%; display: flex; flex-direction: column;">
                    <h3>⚖️ Split Method</h3>
                    <!-- Changed to 1fr so they stack vertically (one per line) -->
                    <div class="pay-grid" style="grid-template-columns: 1fr; gap: 12px; flex: 1;">
                        ${[
                            ['equal', '👥 Equal', 'Pare-pareho ang bayad.'],
                            ['by_adder', '🛒 By Items', 'Bayaran ang idinagdag + equal delivery.'],
                            ['fixed_contribution', '📌 Fixed + Equal', 'Fixed amount sa may marka; rest split.'],
                            ['one_payer', '💳 One Payer', 'Ang designated payer(s) ang sasagot.']
                        ].map(([v, l, d]) => `
                            <button type="button" class="pay-opt ${g.split_method === v ? 'active' : ''}" onclick="app.setGroupSplit('${v}')" style="padding: 16px; text-align: left; display: flex; flex-direction: column; gap: 4px;">
                                <b style="font-size: 16px;">${l}</b>
                                <small style="font-size: 12px; color: var(--muted);">${d}</small>
                            </button>`).join('')}
                    </div>
                </div>`;
        }

        let approvals = '';
        if (isHost && (pendingMembers.length || invitedMembers.length)) {
            approvals = `
                <div class="co-card" style="margin-bottom:20px;">
                    <h3>👥 Pending Members</h3>
                    ${pendingMembers.map(p => `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:var(--bg); border-radius:10px; margin-bottom:6px; gap:8px; flex-wrap:wrap;">
                            <div><b>${this.esc(p.name)}</b> <span style="font-size:11px; color:var(--muted);">(requesting)</span></div>
                            <div style="display:flex; gap:6px;">
                                <button class="btn btn-leaf" style="padding:4px 10px; font-size:11px;" onclick="app.approveMember(${p.id})">Approve</button>
                                <button class="btn btn-ghost" style="padding:4px 10px; font-size:11px;" onclick="app.rejectMember(${p.id})">Reject</button>
                            </div>
                        </div>`).join('')}
                    ${invitedMembers.map(p => `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:var(--bg); border-radius:10px; margin-bottom:6px; gap:8px; flex-wrap:wrap;">
                            <div><b>${this.esc(p.name)}</b> <span style="font-size:11px; color:var(--muted);">(invited)</span></div>
                            <button class="btn btn-ghost" style="padding:4px 10px; font-size:11px;" onclick="app.rejectMember(${p.id})">Cancel Invite</button>
                        </div>`).join('')}
                </div>`;
        }

        const splitRows = split.map(s => {
            const m = g.members.find(mm => mm.user_id === s.userId);
            const isMine = s.userId === this.user.id;
            const verified = !!m.payer_verified;
            
            // 🟢 Generate Avatar Initials
            const initials = s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const avatarBg = isMine ? 'var(--brand)' : (m.role === 'host' ? 'var(--leaf)' : 'var(--wood)');

            // 🟢 Modern Status Pills
            let statusBadge = '';
            if (!m.paid) {
                statusBadge = '<span style="background: rgba(240, 169, 59, 0.15); color: #d98c1d; border: 1px solid rgba(240, 169, 59, 0.4); padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase;">Unpaid</span>';
            } else if (verified) {
                statusBadge = '<span style="background: rgba(63, 122, 69, 0.15); color: var(--leaf); border: 1px solid rgba(63, 122, 69, 0.4); padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase;">✓ Verified</span>';
            } else {
                statusBadge = '<span style="background: rgba(47, 140, 255, 0.15); color: #2f8cff; border: 1px solid rgba(47, 140, 255, 0.4); padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase;">Awaiting Verify</span>';
            }

            // 🟢 Payment Method Icon
            const methodLabel = m.payment_method === 'gcash' ? '📱 GCash' : m.payment_method === 'cash' ? '💵 Cash' : '';

            // Controls (Flags)
            let flagCtrl = '';
            if (isHost && g.status === 'open') {
                if (g.split_method === 'fixed_contribution') {
                    flagCtrl = `
                        <div style="display:flex; align-items:center; gap:6px; margin-top:6px;">
                            <span style="font-size:10px; font-weight:800; color:var(--muted);">₱ Fixed:</span>
                            <input type="number" class="input" style="width:60px; padding:2px 6px; font-size:11px; font-weight:800; border-radius:6px; border:1px solid var(--brand); background:var(--bg);" 
                                   value="${m.fixed_share_amount || 0}" min="0">
                            <button type="button" class="btn btn-leaf" style="padding: 4px 10px; font-size: 10px; border-radius: 6px; line-height: 1.2; box-shadow: none;" 
                                    onclick="app.setMemberFixedAmount(${m.id}, this.previousElementSibling.value)">Save</button>
                        </div>`;
                } else if (g.split_method === 'one_payer') {
                    flagCtrl = `
                        <label class="switch" style="transform:scale(0.6); margin-left:-5px; margin-top:6px;">
                            <input type="checkbox" ${m.is_payer ? 'checked' : ''} onchange="app.setMemberFlag(${m.id}, 'is_payer', this.checked)">
                            <span class="slider round"></span>
                        </label>
                        <span style="font-size:10px; font-weight:800; color:var(--muted); margin-left:-4px;">Payer</span>`;
                }
            }

            // Action Buttons
            const canPaySelf = isMine && !m.paid && g.status === 'open' && s.amount > 0 && !isReadOnly;
            const canVerify   = isHost && m.paid && !verified && g.status === 'open' && !isReadOnly;
            const canHostMark = isHost && !m.paid && g.status === 'open' && !isReadOnly;
            
            let actions = '';
            if (canPaySelf) {
                actions = `<button class="btn btn-brand" style="padding:6px 16px; font-size:12px; border-radius:99px; box-shadow:0 4px 10px rgba(217,91,51,0.3);" onclick="app.openPayShareModal(${m.id}, ${s.amount}, false)">Pay ${this.money(s.amount)}</button>`;
            } else if (canVerify) {
                actions = `<div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;">
                    ${m.payment_method === 'gcash' && m.payment_proof ? `<button class="btn btn-ghost" style="padding:6px 10px; font-size:11px; border-radius:99px;" onclick="app.viewProof('${m.payment_proof}')">View Proof</button>` : ''}
                    <button class="btn btn-leaf" style="padding:6px 12px; font-size:11px; border-radius:99px;" onclick="app.verifyPayment(${m.id}, true)">Verify ✓</button>
                </div>`;
            } else if (canHostMark) {
                actions = `<button class="btn btn-leaf" style="padding:6px 12px; font-size:11px; border-radius:99px;" onclick="app.openPayShareModal(${m.id}, ${s.amount}, true)">Mark Paid</button>`;
            } else if (isHost && verified && g.status === 'open' && !isReadOnly) {
                actions = `<div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;">
                    ${m.payment_method === 'gcash' && m.payment_proof ? `<button class="btn btn-ghost" style="padding:6px 10px; font-size:11px; border-radius:99px;" onclick="app.viewProof('${m.payment_proof}')">View Proof</button>` : ''}
                    <button class="btn btn-ghost" style="padding:4px 10px; font-size:10px; border-radius:99px;" onclick="app.verifyPayment(${m.id}, false)">Unverify</button>
                </div>`;
            }

            if (isHost && m.role !== 'host' && g.status === 'open' && !isReadOnly) {
                const gcashLocked = m.paid == 1 && m.payment_method === 'gcash';
                actions += ` <button class="btn btn-danger group-remove-btn" data-member-id="${m.id}" data-member-name="${this.esc(s.name)}" data-gcash-locked="${gcashLocked ? '1' : '0'}" style="padding:4px 10px; font-size:10px; border-radius:99px; ${gcashLocked ? 'opacity:0.5; cursor:not-allowed;' : ''}" title="${gcashLocked ? 'Locked: Paid via GCash' : 'Remove member'}">✕</button>`;
            }

            return `
                <div style="display:flex; align-items:center; gap:12px; padding:12px; background:var(--bg); border-radius:14px; margin-bottom:10px; border:1px solid var(--line); flex-wrap:wrap;">
                    
                    <!-- Avatar & Info -->
                    <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:150px;">
                        <div style="width:36px; height:36px; border-radius:50%; background:${avatarBg}; color:#fff; display:flex; align-items:center; justify-content:center; font-family:'Baloo 2'; font-weight:800; font-size:14px; flex-shrink:0;">
                            ${initials}
                        </div>
                        <div>
                            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                <b style="font-size:14px; color:var(--ink);">${this.esc(s.name)}</b>
                                ${isMine ? '<span style="font-size:9px; color:var(--brand); font-weight:800; background:rgba(217,91,51,0.1); padding:1px 6px; border-radius:4px;">YOU</span>' : ''}
                                ${m.role === 'host' ? '<span style="font-size:9px; color:var(--leaf); font-weight:800; background:rgba(63,122,69,0.1); padding:1px 6px; border-radius:4px;">HOST</span>' : ''}
                            </div>
                            <div style="display:flex; align-items:center; gap:6px; margin-top:4px; flex-wrap:wrap;">
                                ${statusBadge}
                                ${methodLabel ? `<span style="font-size:10px; color:var(--muted); font-weight:700;">${methodLabel}</span>` : ''}
                                ${flagCtrl}
                            </div>
                        </div>
                    </div>

                    <!-- Amount & Actions -->
                    <div style="text-align:right; display:flex; align-items:center; gap:12px; margin-left:auto;">
                        <div style="font-family:'Baloo 2'; font-size:20px; font-weight:800; color:var(--brand); line-height:1;">
                            ${this.money(s.amount)}
                        </div>
                        <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
                            ${actions}
                        </div>
                    </div>

                </div>`;
        }).join('');

        const splitBreakdownHtml = `
            <div class="co-card" style="margin-bottom:0; height: 100%; display: flex; flex-direction: column;">
                <h3 style="margin-bottom: 16px;">💰 Split Breakdown</h3>
                
                <!-- 🟢 NEW: Cleaner Summary Stats -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; background: var(--bg); padding: 12px; border-radius: 14px; border: 1px solid var(--line); text-align: center;">
                    <div>
                        <div style="font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase;">Method</div>
                        <div style="font-size: 13px; font-weight: 800; color: var(--ink);">${g.split_method === 'equal' ? 'Equal' : g.split_method === 'by_adder' ? 'By Items' : g.split_method === 'fixed_contribution' ? 'Fixed + Equal' : 'One Payer'}</div>
                    </div>
                    <div style="border-left: 1px solid var(--line); border-right: 1px solid var(--line);">
                        <div style="font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase;">Subtotal</div>
                        <div style="font-size: 13px; font-weight: 800; color: var(--ink);">${this.money(subtotal)}</div>
                    </div>
                    <div>
                        <div style="font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase;">Delivery</div>
                        <div style="font-size: 13px; font-weight: 800; color: var(--ink);">${this.money(deliveryFee)}</div>
                    </div>
                </div>

                <div style="flex: 1;">
                    ${splitRows}
                </div>

                <!-- 🟢 NEW: Bold Total Footer -->
                <div style="margin-top: 20px; padding-top: 16px; border-top: 2px dashed var(--line); display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-family: 'Baloo 2'; font-size: 20px; font-weight: 800; color: var(--ink);">TOTAL</span>
                    <span style="font-family: 'Baloo 2'; font-size: 26px; font-weight: 800; color: var(--brand);">${this.money(total)}</span>
                </div>

                <!-- Status Messages -->
                ${!allPaid && g.status === 'open'
                    ? '<div style="margin-top: 16px; padding: 10px; background: rgba(240, 169, 59, 0.1); border: 1px solid rgba(240, 169, 59, 0.3); border-radius: 8px; text-align: center; font-size: 12px; color: #d98c1d; font-weight: 800;">⏳ Hintayin munang magbayad at ma-verify ang lahat.</div>'
                    : (allPaid && g.status === 'open'
                        ? '<div style="margin-top: 16px; padding: 10px; background: rgba(63, 122, 69, 0.1); border: 1px solid rgba(63, 122, 69, 0.3); border-radius: 8px; text-align: center; font-size: 12px; color: var(--leaf); font-weight: 800;">✓ Lahat ay bayad at verified na!</div>'
                        : '')}
                ${shortfall > 0 && allPaid && g.status === 'open'
                    ? `<div style="margin-top: 8px; padding: 10px; background: rgba(229, 96, 77, 0.1); border: 1px solid rgba(229, 96, 77, 0.3); border-radius: 8px; text-align: center; font-size: 12px; color: #e5604d; font-weight: 800;">⚠️ Kulang ng ${this.money(shortfall)} sa total.</div>`
                    : ''}
                ${g.split_method === 'fixed_contribution' && approvedMembers.every(m => (parseInt(m.fixed_share_amount) || 0) > 0) && totalFixed !== total
                    ? `<div style="margin-top: 8px; padding: 10px; background: rgba(229, 96, 77, 0.1); border: 1px solid rgba(229, 96, 77, 0.3); border-radius: 8px; text-align: center; font-size: 12px; color: #e5604d; font-weight: 800;">⚠️ Paalala: Ang total ng fixed amounts ay ${this.money(totalFixed)}, pero ang bill ay ${this.money(total)}. Kailangang magtugma ito.</div>`
                    : ''}
            </div>`;

        let mainContentHtml = '';
        if (isOrdered) {
            mainContentHtml = `
                <div style="margin-bottom: 20px;">${splitBreakdownHtml}</div>
                <div style="margin-bottom: 20px;">${itemsHtml}</div>
            `;
        } else {
            mainContentHtml = `
                <!-- Top Row: Delivery & Split Breakdown -->
                <div style="display: grid; grid-template-columns: minmax(320px, 1fr) minmax(400px, 1.5fr); gap: 20px; margin-bottom: 20px; align-items: stretch;">
                    <!-- Left Column -->
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        ${splitSettings}
                        ${deliveryHtml}
                    </div>
                    <!-- Right Column -->
                    <div>
                        ${splitBreakdownHtml}
                    </div>
                </div>
                
                <!-- Bottom Row: Items List -->
                <div style="margin-bottom: 20px;">
                    ${itemsHtml}
                </div>
            `;
        }

        body.innerHTML = `
            <div class="page-head" style="margin-bottom:16px;">
                <button class="btn btn-ghost" style="margin-bottom:12px; padding:6px 14px; font-size:13px;" onclick="app.go('bayanihan')">← Back</button>
                <h1>${this.esc(g.name)}</h1>
                <p>Host: ${this.esc(hostMember.name)}</p>
            </div>
            ${isCancelled ? `<div style="background:rgba(229,96,77,0.1); border-left:3px solid #e5604d; padding:14px; border-radius:8px; margin-bottom:20px; text-align:center;"><b style="color:#e5604d;">❌ Cancelled na ang Bayanihan Cart na ito.</b></div>` : ''}
            ${topCards}
            ${actions}
            ${deliveredHighlight}
            ${approvals}
            ${mainContentHtml}`;

        document.querySelectorAll('.group-remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeMember(parseInt(btn.dataset.memberId), btn.dataset.memberName, btn.dataset.gcashLocked === '1');
            });
        });
    },

    openEditGroupItem(item) {
        this._editItemId = item.id;
        document.getElementById('egi-name').textContent = item.name;
        document.getElementById('egi-qty').value = item.qty;

        // Build options HTML
        const wrap = document.getElementById('egi-options-wrap');
        const container = document.getElementById('egi-options-container');
        
        // Find original product to get options
        const prod = this.products.find(p => p.id === item.product_id);
        if (prod && prod.options) {
            try {
                const parsedOpts = JSON.parse(prod.options);
                let html = '';
                for (const [groupName, choices] of Object.entries(parsedOpts)) {
                    const currentVal = item.variation.split(', ').find(v => v.startsWith(groupName + ':'))?.split(': ')[1] || choices[0];
                    html += `
                        <div style="margin-bottom:12px;">
                            <div style="font-size:11px; font-weight:800; color:var(--muted); margin-bottom:4px;">${groupName}</div>
                            <div class="ci-radio-pills">
                                ${choices.map(c => `
                                    <label class="ci-radio-label">
                                        <input type="radio" name="egi_opt_${groupName}" value="${this.esc(c)}" ${currentVal === c ? 'checked' : ''}>
                                        <span>${this.esc(c)}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>`;
                }
                container.innerHTML = html;
                wrap.classList.remove('hidden');
            } catch(e) { wrap.classList.add('hidden'); }
        } else {
            wrap.classList.add('hidden');
        }

        document.getElementById('edit-group-item-modal').classList.remove('hidden');
    },

    async saveGroupItemEdit() {
        const qty = parseInt(document.getElementById('egi-qty').value);
        if (isNaN(qty) || qty < 0) return this.showToast('Invalid quantity.');

        const opts = [];
        document.querySelectorAll('#egi-options-container input[type="radio"]:checked').forEach(inp => {
            opts.push(`${inp.name.replace('egi_opt_', '')}: ${inp.value}`);
        });
        const variation = opts.join(', ');

        const g = this.bayanihan.current;
        const res = await fetch('api.php?action=group-edit-item', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ group_id: g.id, item_id: this._editItemId, qty, variation })
        });
        const data = await res.json();
        if (data.ok) {
            this.closeModal('edit-group-item-modal');
            this.openGroupDetail(g.id);
        } else this.showToast(data.error || 'Failed');
    },

    // 🟢 Helpers for Delivery Details
    updateGroupRecipient(val) {
        const parts = val.split('|');
        const phoneInput = document.getElementById('bg-phone');
        phoneInput.value = parts[1] || '';
        // Always allow the host to edit the number just in case
        phoneInput.readOnly = false; 
    },
    
    updateGroupBrgyDropdown() {
        const city = document.getElementById('bg-city').value;
        const brgySelect = document.getElementById('bg-brgy');
        brgySelect.innerHTML = '<option value="" disabled selected>Pumili ng Barangay</option>';
        if (this.lagunaData[city]) {
            Object.keys(this.lagunaData[city]).forEach(b => {
                brgySelect.innerHTML += `<option value="${b}">${b}</option>`;
            });
        }
        this.updateGroupFee();
    },

    updateGroupFee() {
        const city = document.getElementById('bg-city').value;
        const brgy = document.getElementById('bg-brgy').value;
        let fee = 0;
        if (city && brgy && this.lagunaData[city] && this.lagunaData[city][brgy] !== undefined) {
            fee = this.lagunaData[city][brgy];
        }
        document.getElementById('bg-fee').value = fee;
    },

    async saveDeliveryDetails() {
        const g = this.bayanihan.current;
        const sel = document.getElementById('bg-member');
        const name = sel.options[sel.selectedIndex].text.split(' (')[0];
        const phone = document.getElementById('bg-phone').value.trim();
        const city = document.getElementById('bg-city').value;
        const brgy = document.getElementById('bg-brgy').value;
        const street = document.getElementById('bg-street').value.trim();
        const fee = parseInt(document.getElementById('bg-fee').value) || 0;

        if (!city || !brgy) return this.showToast('Pumili ng Lungsod at Barangay.');
        if (!phone) return this.showToast('Ilagay ang contact number.');
        
        const address = JSON.stringify({ street, brgy, city });
        const payload = { group_id: g.id, name, phone, address, fee };

        const res = await fetch('api.php?action=group-set-delivery', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        const data = await res.json();
        if (data.ok) { this.showToast('Delivery details saved!'); this.openGroupDetail(g.id); }
        else this.showToast(data.error || 'Failed');
    },

    // ----- Split changes (with confirmation if anyone already paid) -----
    async setGroupSplit(method) {
        const g = this.bayanihan.current;
        if (!g) return;
        const approved = g.members.filter(m => m.status === 'approved');
        const alreadyPaid = approved.filter(m => m.paid == 1);
        
        const doChange = async () => {
            await fetch('api.php?action=group-set-split', { method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ group_id: g.id, method, fixed_amount: g.fixed_amount || 0 }) });
            this.openGroupDetail(g.id);
        };

        if (alreadyPaid.length > 0) {
            const msg = `Baguhin ang split to <b>"${method.replace(/_/g,' ')}"</b>?<br><br>` +
                `⚠️ <b>${alreadyPaid.length} member(s) already paid:</b><br>` +
                `<div style="text-align: left; background: rgba(0,0,0,0.05); padding: 12px; border-radius: 8px; margin: 12px 0; line-height: 1.5;">` +
                alreadyPaid.map(m => `• ${this.esc(m.name)}`).join('<br>') +
                `</div>` +
                `Ma-reset lahat ng bayad. Tuloy?`;
            this.showConfirm('Change Split Method', msg, doChange, 'Tuloy');
        } else {
            doChange();
        }
    },

    async setGroupFixedAmount(val) {
        const g = this.bayanihan.current;
        const approved = g.members.filter(m => m.status === 'approved');
        const alreadyPaid = approved.filter(m => m.paid == 1);
        
        const doChange = async () => {
            await fetch('api.php?action=group-set-split', { method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ group_id: g.id, method: g.split_method, fixed_amount: parseInt(val) || 0 }) });
            this.openGroupDetail(g.id);
        };

        if (alreadyPaid.length > 0) {
            this.showConfirm('Change Fixed Amount', `⚠️ Ma-reset ang bayad ng <b>${alreadyPaid.length}</b> member(s).<br><br>Tuloy?`, doChange, 'Tuloy');
        } else {
            doChange();
        }
    },

    async setMemberFlag(memberId, field, value) {
        const g = this.bayanihan.current;
        const approved = g.members.filter(m => m.status === 'approved');
        const alreadyPaid = approved.filter(m => m.paid == 1);
        
        const doChange = async () => {
            await fetch('api.php?action=group-set-member-flag', { method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ group_id: g.id, member_id: memberId, field, value: value ? 1 : 0 }) });
            this.openGroupDetail(g.id);
        };

        if (alreadyPaid.length > 0) {
            this.showConfirm('Change Member Flag', `Baguhin ang <b>${field.replace('is_','')}</b> flag?<br><br>⚠️ Ma-reset ang bayad ng <b>${alreadyPaid.length}</b> member(s).<br><br>Tuloy?`, doChange, 'Tuloy');
        } else {
            doChange();
        }
    },

    async setMemberFixedAmount(memberId, val) {
        const g = this.bayanihan.current;
        const approved = g.members.filter(m => m.status === 'approved');
        const alreadyPaid = approved.filter(m => m.paid == 1);
        if (alreadyPaid.length > 0) {
            if (!confirm(`Baguhin ang fixed amount?\n\n⚠️ Ma-reset ang bayad ng ${alreadyPaid.length} member(s). Tuloy?`)) return;
        }
        await fetch('api.php?action=group-set-member-fixed-amount', { method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ group_id: g.id, member_id: memberId, amount: parseInt(val) || 0 }) });
        this.openGroupDetail(g.id);
    },

    async groupUpdateQty(itemId, delta) {
        const g = this.bayanihan.current;
        await fetch('api.php?action=group-update-qty', { method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ group_id: g.id, item_id: itemId, delta }) });
        this.openGroupDetail(g.id);
    },
    async approveMember(memberId) {
        const g = this.bayanihan.current;
        await fetch('api.php?action=group-approve-member', { method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ group_id: g.id, member_id: memberId }) });
        this.openGroupDetail(g.id);
    },
    async rejectMember(memberId) {
        const g = this.bayanihan.current;
        await fetch('api.php?action=group-reject-member', { method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ group_id: g.id, member_id: memberId }) });
        this.openGroupDetail(g.id);
    },

    openPayShareModal(memberId, amount, isHostMarking = false) {
        this._payMemberId = memberId;
        this._payAmount = amount;
        this._isHostMarking = isHostMarking;
        this._shareProof = '';
        document.getElementById('bg-pay-amount').textContent = isHostMarking ? `Mark as Paid: ${this.money(amount)}` : `Amount: ${this.money(amount)}`;
        document.getElementById('bg-share-preview').style.display = 'none';
        document.getElementById('bg-share-title').textContent = 'Upload GCash screenshot';
        document.getElementById('bg-share-drop').classList.remove('has-file');
        this.selectShareMethod('cash');
        document.getElementById('bayanihan-pay-modal').classList.remove('hidden');
    },

    selectShareMethod(method) {
        document.getElementById('bg-pay-cash').classList.toggle('active', method === 'cash');
        document.getElementById('bg-pay-gcash').classList.toggle('active', method === 'gcash');
        document.getElementById('bg-gcash-box').classList.toggle('hidden', method !== 'gcash');
        this._shareMethod = method;
    },
    handleShareProof(e) {
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
                this._shareProof = c.toDataURL('image/jpeg', 0.7);
                const prev = document.getElementById('bg-share-preview');
                prev.src = this._shareProof; prev.style.display = 'block';
                document.getElementById('bg-share-drop').classList.add('has-file');
                document.getElementById('bg-share-title').textContent = 'Screenshot attached ✓';
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    },
    async submitSharePayment() {
        const g = this.bayanihan.current;
        if (!g || !this._payMemberId) return;
        if (this._shareMethod === 'gcash' && !this._shareProof) {
            return this.showToast('I-upload muna ang GCash screenshot.');
        }
        
        const action = this._isHostMarking ? 'group-mark-paid' : 'group-member-pay';
        const payload = this._isHostMarking
            ? { group_id: g.id, member_id: this._payMemberId, paid: 1, amount: this._payAmount, method: this._shareMethod, proof: this._shareProof }
            : { group_id: g.id, method: this._shareMethod, proof: this._shareProof, amount: this._payAmount };

        const res = await fetch(`api.php?action=${action}`, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (data.ok) {
            this.closeModal('bayanihan-pay-modal');
            this.showToast(this._isHostMarking 
                ? 'Payment marked as paid and verified!' 
                : (this._shareMethod === 'gcash' ? 'Payment submitted! Hintayin ang verification ng host.' : 'Marked as cash. Host will verify.'));
            this.openGroupDetail(g.id);
        } else this.showToast(data.error || 'Failed');
    },

    async verifyPayment(memberId, verify) {
        const g = this.bayanihan.current;
        const m = g.members.find(mm => mm.id === memberId);
        if (!m) return;

        let msg = verify ? `Verify payment from <b>${this.esc(m.name)}</b>?` : `Unverify payment from <b>${this.esc(m.name)}</b>?`;
        
        if (verify && m.payment_method === 'gcash' && m.payment_proof) {
            msg += `<div style="margin-top:12px; border-radius:8px; overflow:hidden; border:1px solid var(--line);"><img src="${m.payment_proof}" style="width:100%; max-height:200px; object-fit:contain; background:#fff;"></div>`;
        }

        this.showConfirm(
            verify ? 'Verify Payment' : 'Unverify Payment',
            msg,
            async () => {
                await fetch('api.php?action=group-verify-payment', {
                    method:'POST', headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({ group_id: g.id, member_id: memberId, verify: verify ? 1 : 0 })
                });
                this.openGroupDetail(g.id);
            },
            verify ? 'Verify ✓' : 'Unverify'
        );
    },

    inviteToGroup() {
        document.getElementById('bg-invite-email').value = '';
        document.getElementById('bayanihan-invite-modal').classList.remove('hidden');
    },
    async submitInvite() {
        const g = this.bayanihan.current;
        const email = document.getElementById('bg-invite-email').value.trim();
        const res = await fetch('api.php?action=group-invite', { method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ group_id: g.id, email }) });
        const data = await res.json();
        if (data.ok) {
            this.closeModal('bayanihan-invite-modal');
            this.showToast('Invite sent!');
            this.openGroupDetail(g.id);
        } else this.showToast(data.error || 'Failed');
    },

    addMoreToGroup() {
        const g = this.bayanihan.current;
        if (!g) return;
        this._lastGroupId = g.id; // 🟢 Sets the default selection for the dropdown
        this.showToast(`Adding items to: ${g.name}`);
        this.go('home');
        setTimeout(() => this.scrollToMenu(), 200);
    },

    async confirmGroupOrder() {
        this.showConfirm(
            'Confirm Order',
            'Confirm this Bayanihan order? Stock will be deducted.',
            async () => {
                const g = this.bayanihan.current;
                const res = await fetch('api.php?action=group-confirm-order', { method:'POST', headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({ group_id: g.id }) });
                const data = await res.json();
                if (data.ok) {
                    this.showToast(`Order #${data.order_id} placed!`);
                    this.bayanihan.activeGroupId = null;
                    await this.refreshData();
                    this.go('orders');
                } else this.showToast(data.error || 'Failed');
            },
            'Confirm'
        );
    },

    async leaveGroup() {
        const g = this.bayanihan.current;
        if (!g) return;
        const me = g.members.find(m => m.user_id === this.user.id);
        
        if (me && me.paid == 1 && me.payment_method === 'gcash') {
            return this.showToast('Hindi ka pwedeng umalis: nagbayad ka na via GCash. Ipa-refund muna sa host.');
        }
        const myItems = g.items.filter(it => it.user_id === this.user.id);
        const itemCount = myItems.reduce((s, it) => s + it.qty, 0);
        const itemList = myItems.length
            ? `\n\n⚠️ MAWAWALA ang iyong ${itemCount} item(s):\n• ${myItems.map(it => `${it.qty}× ${it.name}`).join('\n• ')}`
            : '';
            
        this.showConfirm(
            'Leave Bayanihan Cart?',
            `Ma-reset din ang bayad ng iba pang miyembro.${itemList}\n\nSigurado ka ba?`,
            async () => {
                const res = await fetch('api.php?action=group-leave', { method:'POST', headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({ group_id: g.id }) });
                const data = await res.json();
                if (!data.ok) { this.showToast(data.error || 'Failed'); return; }
                this.bayanihan.activeGroupId = null;
                this.showToast('You left the Bayanihan Cart.');
                this.go('bayanihan');
            },
            'Leave'
        );
    },

    async cancelGroup() {
        const g = this.bayanihan.current;
        if (!g) return;
        const gcashPaid = g.members.filter(m => m.paid == 1 && m.payment_method === 'gcash');
        if (gcashPaid.length > 0) {
            return this.showToast(`Hindi ma-cancel: may ${gcashPaid.length} member na nagbayad via GCash. Ipa-refund muna.`);
        }
        const approvedCount = g.members.filter(m => m.status === 'approved').length;
        const itemCount = g.items.reduce((s, it) => s + it.qty, 0);
        
        this.showConfirm(
            'Cancel Bayanihan Cart? ❌',
            `• ${approvedCount} member(s) mawawalan ng access\n• ${itemCount} item(s) mawawala\n• Lahat ng bayad mawawala\n\nHINDI na maibabalik. Sigurado ka ba?`,
            async () => {
                const res = await fetch('api.php?action=group-cancel', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ group_id: g.id }) });
                const data = await res.json();
                if (!data.ok) { this.showToast(data.error || 'Failed'); return; }
                this.bayanihan.activeGroupId = null;
                this.showToast('Bayanihan Cart cancelled.');
                this.go('bayanihan');
            },
            'Yes, Cancel'
        );
    },

    async confirmAddToBayanihanNew() {
        const gid = document.getElementById('add-to-bayanihan-select').value;
        if (!gid || !this.pendingCartItem) return;
        const p = this.pendingCartItem;
        const grp = this.bayanihan.list.find(x => x.id == gid);
        const grpName = grp ? grp.name : 'Bayanihan Cart';
        
        const opts = [];
        document.querySelectorAll('#add-confirm-item-box input[type="radio"]:checked').forEach(inp => {
            opts.push(`${inp.name.replace('opt_', '')}: ${inp.value}`);
        });
        const variation = opts.join(', ');

        try {
            const res = await fetch('api.php?action=group-add-item', {
                method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ group_id: gid, product_id: p.id, qty: this.pendingQty, variation })
            });
            const data = await res.json();
            if (data.ok) {
                this.showToast(`${p.name} added to ${grpName}!`);
                this.closeAddModal();
            } else this.showToast(data.error || 'Failed');
        } catch (e) { this.showToast('Connection error'); }
    },

    // ============================================================
    // ADMIN: Bayanihan monitoring
    // ============================================================
    async renderAdminBayanihan() {
        const grid = document.getElementById('admin-groups-grid');
        if (!grid) return;
        grid.innerHTML = '<p style="text-align:center; color:var(--muted); padding:20px;">Loading...</p>';
        try {
            const res = await fetch('api.php?action=admin-list-groups');
            const groups = await res.json();
            const filter = (document.getElementById('admin-group-status')?.value) || 'all';
            const filtered = filter === 'all' ? groups : groups.filter(g => g.status === filter);

            if (!filtered.length) {
                grid.innerHTML = '<div class="empty-state"><h3>Walang Bayanihan Cart</h3><p>Wala pang gumawa ng group cart.</p></div>';
                return;
            }

            grid.innerHTML = filtered.map(g => {
                const statusClass = g.status === 'open' ? 'status-pending'
                    : g.status === 'ordered' ? 'status-delivered'
                    : g.status === 'cancelled' ? 'status-out' : 'status-shipping';
                const hasGcash = parseInt(g.gcash_paid_count) > 0;
                return `
                <div class="admin-order-card" style="cursor:pointer;" onclick="app.viewAdminGroup(${g.id})">
                    <div class="admin-order-header">
                        <div><h4>${this.esc(g.name)}</h4><span class="admin-order-date">Host: ${this.esc(g.host_name)}</span></div>
                        <span class="order-status ${statusClass}">${this.esc(g.status)}</span>
                    </div>
                    <div style="padding:12px; background:var(--surface2); border-radius:12px; text-align:center;">
                        <div style="font-size:10px; font-weight:800; color:var(--muted); text-transform:uppercase;">Code</div>
                        <div style="font-size:22px; font-weight:900; letter-spacing:4px; color:var(--brand); font-family:'Baloo 2';">${this.esc(g.code)}</div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:12px; font-weight:700;">
                        <div>👥 Members: <b>${g.member_count}</b></div>
                        <div>⏳ Pending: <b>${g.pending_count}</b></div>
                        <div>💰 Subtotal: <b style="color:var(--brand);">${this.money(g.subtotal)}</b></div>
                        <div>✅ Verified: <b>${g.verified_count}/${g.member_count}</b></div>
                    </div>
                    ${hasGcash ? `
                        <div style="padding:8px 12px; background:rgba(47,140,255,0.1); border-left:3px solid #2f8cff; border-radius:6px; font-size:11px; font-weight:800; color:#2f8cff;">
                            📱 ${g.gcash_paid_count} member(s) paid via GCash — cart locked from cancellation
                        </div>` : ''}
                </div>`;
            }).join('');
        } catch (e) { grid.innerHTML = '<p>Error loading groups.</p>'; }
    },

    async viewAdminGroup(gid) {
        try {
            const res = await fetch('api.php?action=admin-get-group', {
                method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ id: gid })
            });
            const g = await res.json();
            if (g.error) { this.showToast(g.error); return; }

            const subtotal = g.items.reduce((s, it) => s + it.price * it.qty, 0);
            const deliveryFee = parseInt(g.delivery_fee) || 0;
            const total = subtotal + deliveryFee;
            const approved = g.members.filter(m => m.status === 'approved');
            const gcashPaid = approved.filter(m => m.paid == 1 && m.payment_method === 'gcash');

            const body = document.getElementById('admin-group-detail-body');
            body.innerHTML = `
                <div class="page-head">
                    <button class="btn btn-ghost" style="margin-bottom:12px; padding:6px 14px; font-size:13px;" onclick="app.go('admin')">← Back to Dashboard</button>
                    <h1>${this.esc(g.name)}</h1>
                    <p>Host: ${this.esc(approved.find(m => m.role === 'host')?.name || '—')} · Status: <b>${this.esc(g.status)}</b></p>
                </div>

                ${gcashPaid.length ? `
                    <div style="padding:14px; background:rgba(47,140,255,0.1); border-left:4px solid #2f8cff; border-radius:10px; margin-bottom:20px;">
                        <b style="color:#2f8cff;">📱 GCash Payments Locked</b>
                        <p style="font-size:12px; margin-top:4px; color:var(--ink); font-weight:600;">
                            ${gcashPaid.length} member(s) already paid via GCash — this cart cannot be cancelled.
                        </p>
                    </div>` : ''}

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
                    <div class="co-card">
                        <h3>📍 Delivery</h3>
                        <p style="font-size:13px; font-weight:600; line-height:1.7;">
                            <b>Recipient:</b> ${this.esc(g.customer_name || '—')}<br>
                            <b>Phone:</b> ${this.esc(g.phone || '—')}<br>
                            <b>Address:</b> ${this.esc(this.formatAddress(g.delivery_address) || '—')}<br>
                            <b>Payment:</b> ${g.payment.toUpperCase()}<br>
                            <b>Delivery Fee:</b> ${this.money(deliveryFee)}
                        </p>
                    </div>
                    <div class="co-card">
                        <h3>💰 Totals</h3>
                        <p style="font-size:13px; font-weight:600; line-height:1.7;">
                            <b>Subtotal:</b> ${this.money(subtotal)}<br>
                            <b>Total:</b> <span style="color:var(--brand); font-size:18px; font-family:'Baloo 2';">${this.money(total)}</span><br>
                            <b>Split Method:</b> ${g.split_method.replace(/_/g, ' ')}<br>
                            <b>Order ID:</b> ${g.order_id || '—'}
                        </p>
                    </div>
                </div>

                <div class="co-card" style="margin-bottom:20px;">
                    <h3>👥 Members (${approved.length} approved)</h3>
                    ${g.members.map(m => {
                        const statusBadge = m.status === 'approved' ? '✅'
                            : m.status === 'pending' ? '⏳'
                            : m.status === 'invited' ? '📬' : '❌';
                        const payBadge = m.paid == 1
                            ? (m.payer_verified == 1
                                ? `<span style="color:var(--leaf); font-weight:800;">✓ Verified (${m.payment_method.toUpperCase()}) ${this.money(m.paid_amount)}</span>
                                   ${m.payment_method === 'gcash' && m.payment_proof ? `<button class="btn btn-ghost" style="padding:2px 8px; font-size:10px; margin-left:8px;" onclick="app.viewProof('${m.payment_proof}')">View Proof</button>` : ''}`
                                : `<span style="color:var(--amber); font-weight:800;">⏳ Awaiting verify (${m.payment_method.toUpperCase()})</span>`)
                            : '<span style="color:var(--muted); font-weight:700;">Unpaid</span>';
                        return `
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:var(--bg); border-radius:10px; margin-bottom:6px; gap:8px; flex-wrap:wrap;">
                                <div>
                                    <b>${statusBadge} ${this.esc(m.name)}</b>
                                    <span style="font-size:11px; color:var(--muted);">${this.esc(m.email)}</span>
                                    ${m.role === 'host' ? '<span style="font-size:10px; color:var(--leaf); font-weight:800; margin-left:6px;">HOST</span>' : ''}
                                </div>
                                <div style="font-size:12px;">${payBadge}</div>
                            </div>`;
                    }).join('')}
                </div>

                <div class="co-card">
                    <h3>🛒 Items (${g.items.length})</h3>
                    ${g.items.length === 0
                        ? '<p style="text-align:center; color:var(--muted); padding:20px;">No items.</p>'
                        : g.items.map(it => `
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:var(--surface2); border-radius:10px; margin-bottom:6px;">
                                <div>
                                    <b style="font-size:13px;">${this.esc(it.name)}</b>
                                    <div style="font-size:11px; color:var(--muted);">by ${this.esc(it.user_name)} · ${it.qty} × ${this.money(it.price)}</div>
                                </div>
                                <div style="font-family:'Baloo 2'; font-weight:800;">${this.money(it.price * it.qty)}</div>
                            </div>`).join('')}
                </div>`;
            this.go('admin-group-detail');
        } catch (e) { this.showToast('Error loading group'); }
    },

    // ============================================================
    // ADMIN: Delivery Fees
    // ============================================================
    renderAdminFees() {
        const grid = document.getElementById('admin-fees-grid');
        if (!grid) return;

        const query = (document.getElementById('admin-fee-search')?.value || '').toLowerCase();
        const filtered = this.deliveryFeesRaw.filter(f => 
            f.city.toLowerCase().includes(query) || f.barangay.toLowerCase().includes(query)
        );

        if (!filtered.length) {
            grid.innerHTML = '<p style="text-align:center; color:var(--muted); grid-column:1/-1;">No locations found.</p>';
            return;
        }

        grid.innerHTML = filtered.map(f => `
            <div class="admin-inv-card" style="flex-direction:column; align-items:stretch; gap:12px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <h4 style="color:var(--brand); font-size:15px; margin-bottom:2px;">${this.esc(f.barangay)}</h4>
                        <div style="font-size:11px; color:var(--muted); font-weight:700;">${this.esc(f.city)}</div>
                    </div>
                    <button class="qty-circle-btn" style="color:#e5604d; border-color:rgba(229,96,77,0.3); width:28px; height:28px;" onclick="app.deleteFee(${f.id})" title="Delete">✕</button>
                </div>
                <div style="display:flex; gap:8px; align-items:center;">
                    <span style="font-weight:800; color:var(--muted);">₱</span>
                    <input type="number" class="input" style="padding:6px 10px; font-size:14px; font-weight:800;" value="${f.fee}" id="fee-input-${f.id}">
                    <button class="btn btn-leaf" style="padding:6px 12px; font-size:12px;" onclick="app.saveFee(${f.id})">Save</button>
                </div>
            </div>
        `).join('');
    },

    async saveFee(id) {
        const fee = parseInt(document.getElementById(`fee-input-${id}`).value);
        if (isNaN(fee) || fee < 0) return this.showToast('Invalid fee amount.');
        
        try {
            const res = await fetch('api.php?action=admin-update-fee', {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ id, fee })
            });
            const data = await res.json();
            if (data.ok) {
                this.showToast('Fee updated!');
                await this.refreshData(); // Syncs both admin and frontend data
                this.renderAdminFees();
            } else this.showToast(data.error || 'Failed');
        } catch(e) { this.showToast('Connection error'); }
    },

    async deleteFee(id) {
        this.showConfirm('Delete Location', 'Remove this delivery location?', async () => {
            await fetch('api.php?action=admin-delete-fee', {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ id })
            });
            this.showToast('Location deleted.');
            await this.refreshData();
            this.renderAdminFees();
        }, 'Delete');
    },

    openAddFeeModal() {
        document.getElementById('new-fee-city').value = '';
        document.getElementById('new-fee-brgy').value = '';
        document.getElementById('new-fee-amount').value = '';
        document.getElementById('add-fee-modal').classList.remove('hidden');
    },

    async submitAddFee() {
        const city = document.getElementById('new-fee-city').value.trim();
        const barangay = document.getElementById('new-fee-brgy').value.trim();
        const fee = parseInt(document.getElementById('new-fee-amount').value);

        if (!city || !barangay) return this.showToast('Fill in City and Barangay.');
        if (isNaN(fee) || fee < 0) return this.showToast('Invalid fee amount.');

        try {
            const res = await fetch('api.php?action=admin-add-fee', {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ city, barangay, fee })
            });
            const data = await res.json();
            if (data.ok) {
                this.closeModal('add-fee-modal');
                this.showToast('Location added!');
                await this.refreshData();
                this.renderAdminFees();
            } else this.showToast(data.error || 'Failed');
        } catch(e) { this.showToast('Connection error'); }
    },
}

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