/* ============================================================
   Ahuja Sales India - Full E-commerce JavaScript
   Built from real data at test.ahujasalesindia.com
   ============================================================ */

'use strict';

// ============================================================
// BASE URL for real product images
// ============================================================
const IMG_BASE = 'https://test.ahujasalesindia.com/images/products/';
const LOGO_URL = 'https://test.ahujasalesindia.com/Images/logo.png';

// ============================================================
// REAL PRODUCT DATABASE (from test.ahujasalesindia.com)
// ============================================================
const products = [

    // ---- AMMONIA VALVES ----
    {
        id: 1, cat: 'ammonia-valves', name: 'Globe Valve FLANGED (2½")',
        desc: 'Heavy-duty brass flanged globe valve. Ammonia grade. N.G.V.S rated. For refrigeration piping.',
        price: 9946, mrp: 12000, img: `${IMG_BASE}B02A0BE3-11ED-423E-9996-866A9EBFEF78.jpg`,
        badge: 'hot', rating: 4.8, reviews: 9, inStock: true
    },
    {
        id: 2, cat: 'ammonia-valves', name: 'Angle Valve FLANGED (1½")',
        desc: 'Ammonia angle valve with flanged connections. S.V.S type. Ideal for cold storage lines.',
        price: 5701, mrp: 7000, img: `${IMG_BASE}64060DB0-8552-4CD6-AB2D-7A498213A87A-1.jpg`,
        badge: 'sale', rating: 4.7, reviews: 9, inStock: true
    },
    {
        id: 3, cat: 'ammonia-valves', name: 'Angle Valve FLANGED (4")',
        desc: 'Heavy 4-inch flanged angle valve for ammonia refrigeration. D.M.S rated.',
        price: 20723, mrp: 25000, img: `${IMG_BASE}61FD79F7-4A87-47C1-B727-8B254E2AF11A-1.jpg`,
        badge: null, rating: 4.6, reviews: 9, inStock: true
    },
    {
        id: 4, cat: 'ammonia-valves', name: 'Globe Valve FLANGED (¾")',
        desc: 'Small bore ammonia globe valve. Flanged. N.G.V.W rated. Corrosion-resistant body.',
        price: 2281, mrp: 2900, img: `${IMG_BASE}B02A0BE3-11ED-423E-9996-866A9EBFEF78.jpg`,
        badge: null, rating: 4.8, reviews: 11, inStock: true
    },
    {
        id: 5, cat: 'ammonia-valves', name: 'Globe Valve FLANGED (2")',
        desc: '2-inch flanged globe valve. Ammonia grade. Suitable for high pressure refrigeration systems.',
        price: 7255, mrp: 9000, img: `${IMG_BASE}B02A0BE3-11ED-423E-9996-866A9EBFEF78.jpg`,
        badge: null, rating: 4.8, reviews: 11, inStock: true
    },
    {
        id: 6, cat: 'ammonia-valves', name: 'Angle Valve FLANGED (1")',
        desc: 'Compact ammonia angle valve. Flanged connection. N.A.V.W type. For compact refrigeration systems.',
        price: 2489, mrp: 3100, img: `${IMG_BASE}64060DB0-8552-4CD6-AB2D-7A498213A87A-1.jpg`,
        badge: null, rating: 4.8, reviews: 11, inStock: true
    },
    {
        id: 7, cat: 'ammonia-valves', name: 'Inline Check Valve FLANGED (2½")',
        desc: 'Non-return inline check valve. Flanged. Prevents backflow in ammonia refrigeration lines.',
        price: 17442, mrp: 21000, img: `${IMG_BASE}61FD79F7-4A87-47C1-B727-8B254E2AF11A-1.jpg`,
        badge: 'new', rating: 4.8, reviews: 11, inStock: true
    },

    // ---- AMMONIA COMPRESSORS ----
    {
        id: 8, cat: 'ammonia-compressor', name: 'Water Cooled MX-100 (Single Stage)',
        desc: 'Single-stage water-cooled ammonia compressor. MX-100 model. For medium capacity cold storage plants.',
        price: 272635, mrp: 320000, img: `${IMG_BASE}73BE7DBA-74D6-4280-9D8F-20E53DF33E70-1.jpg`,
        badge: 'hot', rating: 4.9, reviews: 9, inStock: true
    },
    {
        id: 9, cat: 'ammonia-compressor', name: 'Water Cooled MX-200 (Single Stage)',
        desc: 'Single-stage water-cooled ammonia compressor. MX-200. High capacity cold storage solution.',
        price: 343635, mrp: 400000, img: `${IMG_BASE}73BE7DBA-74D6-4280-9D8F-20E53DF33E70-1.jpg`,
        badge: null, rating: 4.9, reviews: 9, inStock: true
    },
    {
        id: 10, cat: 'ammonia-compressor', name: 'Ammonia Compressor MX-300',
        desc: 'Large capacity single-stage ammonia compressor for industrial cold storage and freezing plants.',
        price: 415000, mrp: 490000, img: `${IMG_BASE}73BE7DBA-74D6-4280-9D8F-20E53DF33E70-1.jpg`,
        badge: null, rating: 4.8, reviews: 7, inStock: true
    },
    {
        id: 11, cat: 'ammonia-compressor', name: 'Ammonia Compressor MX-400',
        desc: 'Heavy-duty MX-400 ammonia compressor. Suitable for large industrial freezing plants.',
        price: 520000, mrp: 610000, img: `${IMG_BASE}73BE7DBA-74D6-4280-9D8F-20E53DF33E70-1.jpg`,
        badge: null, rating: 4.9, reviews: 5, inStock: true
    },
    {
        id: 12, cat: 'ammonia-compressor', name: 'Ammonia Compressor MX-600',
        desc: 'MX-600 largest series single-stage ammonia compressor. For very high capacity cold storage.',
        price: 680000, mrp: 800000, img: `${IMG_BASE}73BE7DBA-74D6-4280-9D8F-20E53DF33E70-1.jpg`,
        badge: null, rating: 5.0, reviews: 4, inStock: true
    },

    // ---- AMMONIA SPARE PARTS ----
    {
        id: 13, cat: 'ammonia-spares', name: 'Filter 5H / 5H-80 (Single Stage Standard)',
        desc: 'Suction filter for ammonia compressors. 5H single-stage standard. Protects valve plates.',
        price: 145, mrp: 200, img: `${IMG_BASE}4E7269C7-321C-4C45-AE25-BBA095365CE2-1.jpg`,
        badge: 'sale', rating: 4.9, reviews: 11, inStock: true
    },
    {
        id: 14, cat: 'ammonia-spares', name: 'Main Bearing Collar Type / P.E. PC-2',
        desc: 'Main bearing for ammonia compressor. Collar type. Compatible with PC-2 and standard MX series.',
        price: 0, mrp: 500, img: `${IMG_BASE}D53380D8-E6A5-46D1-A065-B35F3422719D-1.jpg`,
        badge: null, rating: 4.7, reviews: 11, inStock: true
    },
    {
        id: 15, cat: 'ammonia-spares', name: 'Metalex O-Ring Set (Rubber)',
        desc: 'Genuine Metalex rubber O-ring complete set for ammonia compressors and valves. Sizes vary.',
        price: 850, mrp: 1100, img: `${IMG_BASE}4E7269C7-321C-4C45-AE25-BBA095365CE2-1.jpg`,
        badge: 'hot', rating: 4.9, reviews: 15, inStock: true
    },
    {
        id: 16, cat: 'ammonia-spares', name: 'Shaft Seal (Ammonia Compressor)',
        desc: 'Genuine shaft seal for ammonia compressors. Prevents refrigerant leakage at crankshaft.',
        price: 1200, mrp: 1600, img: `${IMG_BASE}D53380D8-E6A5-46D1-A065-B35F3422719D-1.jpg`,
        badge: null, rating: 4.8, reviews: 9, inStock: true
    },
    {
        id: 17, cat: 'ammonia-spares', name: 'Valve Plate Assembly (MX Series)',
        desc: 'Complete valve plate assembly for MX series compressors. Includes suction and discharge valves.',
        price: 3500, mrp: 4500, img: `${IMG_BASE}D53380D8-E6A5-46D1-A065-B35F3422719D-1.jpg`,
        badge: null, rating: 4.7, reviews: 8, inStock: true
    },
    {
        id: 18, cat: 'ammonia-spares', name: 'Piston Ring Set (Single Stage)',
        desc: 'Piston ring set for single-stage ammonia compressors. Reduces blow-by and maintains pressure.',
        price: 680, mrp: 900, img: `${IMG_BASE}4E7269C7-321C-4C45-AE25-BBA095365CE2-1.jpg`,
        badge: null, rating: 4.8, reviews: 12, inStock: true
    },

    // ---- COLD STORAGE EQUIPMENT ----
    {
        id: 19, cat: 'cold-storage', name: 'Globe Valve Flange (Full Set)',
        desc: 'Full flanged globe valve assembly for cold storage rooms. Heavy duty. Includes nut-bolts.',
        price: 12000, mrp: 15000, img: `${IMG_BASE}B02A0BE3-11ED-423E-9996-866A9EBFEF78.jpg`,
        badge: 'hot', rating: 4.8, reviews: 9, inStock: true
    },
    {
        id: 20, cat: 'cold-storage', name: 'Air Cooling Unit (Cold Room)',
        desc: 'Evaporator air cooling unit for cold storage rooms. Includes fan motor and cooling coils.',
        price: 45000, mrp: 55000, img: `${IMG_BASE}73BE7DBA-74D6-4280-9D8F-20E53DF33E70-1.jpg`,
        badge: null, rating: 4.7, reviews: 6, inStock: true
    },
    {
        id: 21, cat: 'cold-storage', name: 'Condenser (Shell & Tube, Ammonia)',
        desc: 'Shell and tube water-cooled condenser for ammonia refrigeration systems. Various capacities.',
        price: 85000, mrp: 100000, img: `${IMG_BASE}73BE7DBA-74D6-4280-9D8F-20E53DF33E70-1.jpg`,
        badge: null, rating: 4.8, reviews: 5, inStock: true
    },
    {
        id: 22, cat: 'cold-storage', name: 'Cooling Coil (Aluminium, Cold Room)',
        desc: 'Aluminium evaporator coil for cold storage rooms. Copper tube, aluminium fins. Various tonnages.',
        price: 28000, mrp: 35000, img: `${IMG_BASE}73BE7DBA-74D6-4280-9D8F-20E53DF33E70-1.jpg`,
        badge: 'new', rating: 4.6, reviews: 8, inStock: true
    },

    // ---- ICE FACTORY EQUIPMENT ----
    {
        id: 23, cat: 'ice-factory', name: 'U-Bend (150LBS)',
        desc: 'Heavy-duty U-bend fitting for ice factory pipelines. 150LBS rated. Ammonia grade.',
        price: 3200, mrp: 4000, img: `${IMG_BASE}61FD79F7-4A87-47C1-B727-8B254E2AF11A-1.jpg`,
        badge: null, rating: 4.5, reviews: 7, inStock: true
    },
    {
        id: 24, cat: 'ice-factory', name: 'U-Bend (300LBS)',
        desc: 'High pressure U-bend for ice plant systems. 300LBS rated. Flanged ends.',
        price: 5100, mrp: 6500, img: `${IMG_BASE}61FD79F7-4A87-47C1-B727-8B254E2AF11A-1.jpg`,
        badge: null, rating: 4.6, reviews: 6, inStock: true
    },
    {
        id: 25, cat: 'ice-factory', name: 'U-Bend Fitting (16KG)',
        desc: 'Medium-duty U-bend pipe fitting. 16KG rated. For ice factory ammonia piping.',
        price: 2800, mrp: 3500, img: `${IMG_BASE}61FD79F7-4A87-47C1-B727-8B254E2AF11A-1.jpg`,
        badge: null, rating: 4.5, reviews: 5, inStock: true
    },
    {
        id: 26, cat: 'ice-factory', name: 'U-Bend Fitting (25KG)',
        desc: 'U-bend pipe fitting. 25KG rated for ice factory refrigeration piping systems.',
        price: 3600, mrp: 4500, img: `${IMG_BASE}61FD79F7-4A87-47C1-B727-8B254E2AF11A-1.jpg`,
        badge: null, rating: 4.4, reviews: 4, inStock: true
    },

    // ---- PIPE & PIPE FITTINGS ----
    {
        id: 27, cat: 'pipe-fittings', name: 'Ammonia GI Pipe (1" Class B)',
        desc: 'Galvanized iron pipe for ammonia refrigeration. Class B. IS 1239 certified. Per metre.',
        price: 320, mrp: 400, img: `${IMG_BASE}B02A0BE3-11ED-423E-9996-866A9EBFEF78.jpg`,
        badge: null, rating: 4.7, reviews: 18, inStock: true
    },
    {
        id: 28, cat: 'pipe-fittings', name: 'Ammonia GI Pipe (2" Class B)',
        desc: '2-inch GI pipe for ammonia systems. Class B. Per metre pricing. All lengths available.',
        price: 580, mrp: 720, img: `${IMG_BASE}B02A0BE3-11ED-423E-9996-866A9EBFEF78.jpg`,
        badge: null, rating: 4.7, reviews: 14, inStock: true
    },
    {
        id: 29, cat: 'pipe-fittings', name: 'Pipe Flange (2" 150LBS)',
        desc: 'Cast iron or carbon steel weld-neck flange. 2-inch 150LBS rated. For ammonia piping.',
        price: 680, mrp: 850, img: `${IMG_BASE}61FD79F7-4A87-47C1-B727-8B254E2AF11A-1.jpg`,
        badge: null, rating: 4.6, reviews: 11, inStock: true
    },

    // ---- MOTORS ----
    {
        id: 30, cat: 'motors', name: 'Electric Motor (0.5 HP, 1440 RPM)',
        desc: 'Single-phase electric motor for industrial use. 0.5HP, 1440RPM, B3 foot mounting.',
        price: 3200, mrp: 4000, img: `${IMG_BASE}73BE7DBA-74D6-4280-9D8F-20E53DF33E70-1.jpg`,
        badge: null, rating: 4.6, reviews: 9, inStock: true
    },
    {
        id: 31, cat: 'motors', name: 'Electric Motor (1 HP, 1440 RPM)',
        desc: 'Single-phase 1HP induction motor. 1440RPM, B3 foot mounting. Suitable for pumps, fans.',
        price: 4500, mrp: 5800, img: `${IMG_BASE}73BE7DBA-74D6-4280-9D8F-20E53DF33E70-1.jpg`,
        badge: null, rating: 4.7, reviews: 11, inStock: true
    },
    {
        id: 32, cat: 'motors', name: 'Electric Motor (3 HP, 3-Phase)',
        desc: 'Three-phase 3HP induction motor. 1440RPM. IE2 energy efficient. For industrial pumps.',
        price: 8500, mrp: 10500, img: `${IMG_BASE}73BE7DBA-74D6-4280-9D8F-20E53DF33E70-1.jpg`,
        badge: 'new', rating: 4.8, reviews: 8, inStock: true
    },

    // ---- DAIRY PLANT EQUIPMENT ----
    {
        id: 33, cat: 'dairy-plant', name: 'Dairy Refrigeration Valve Set',
        desc: 'Complete set of refrigeration valves for dairy chilling plant. Ammonia rated. NSF compliant.',
        price: 15000, mrp: 19000, img: `${IMG_BASE}64060DB0-8552-4CD6-AB2D-7A498213A87A-1.jpg`,
        badge: null, rating: 4.7, reviews: 5, inStock: true
    },
    {
        id: 34, cat: 'dairy-plant', name: 'Chiller Plant Spare Parts Kit',
        desc: 'Comprehensive spares kit for dairy chiller plants. Includes O-rings, gaskets, valve parts.',
        price: 8500, mrp: 11000, img: `${IMG_BASE}4E7269C7-321C-4C45-AE25-BBA095365CE2-1.jpg`,
        badge: null, rating: 4.6, reviews: 4, inStock: true
    },

    // ---- FROZEN PLANT EQUIPMENT ----
    {
        id: 35, cat: 'frozen-plant', name: 'Blast Freezer Valve Assembly',
        desc: 'Heavy-duty valve assembly for blast freezer systems. Ammonia grade. Complete with fittings.',
        price: 22000, mrp: 28000, img: `${IMG_BASE}64060DB0-8552-4CD6-AB2D-7A498213A87A-1.jpg`,
        badge: null, rating: 4.8, reviews: 3, inStock: true
    },
    {
        id: 36, cat: 'frozen-plant', name: 'Freon Compressor (Small Capacity)',
        desc: 'Freon refrigerant compressor for small blast freezer units. Suitable for R-22, R-404A.',
        price: 35000, mrp: 42000, img: `${IMG_BASE}73BE7DBA-74D6-4280-9D8F-20E53DF33E70-1.jpg`,
        badge: 'new', rating: 4.7, reviews: 4, inStock: true
    },

    // ---- CONTROL ----
    {
        id: 37, cat: 'control', name: 'Electronic Temperature Controller',
        desc: 'Digital thermostat controller for refrigeration systems. Range -50°C to +99°C. Relay output.',
        price: 1200, mrp: 1600, img: `${IMG_BASE}D53380D8-E6A5-46D1-A065-B35F3422719D-1.jpg`,
        badge: null, rating: 4.8, reviews: 12, inStock: true
    },
    {
        id: 38, cat: 'control', name: 'Pressure Switch (High/Low, Ammonia)',
        desc: 'Dual pressure switch for ammonia systems. Adjustable high and low cut-out settings.',
        price: 2800, mrp: 3500, img: `${IMG_BASE}D53380D8-E6A5-46D1-A065-B35F3422719D-1.jpg`,
        badge: null, rating: 4.7, reviews: 8, inStock: true
    },
    {
        id: 39, cat: 'control', name: 'Solenoid Valve (Ammonia, 1")',
        desc: 'Normally-closed solenoid valve for ammonia. 220V coil. NC/NO configurable. PN 25 rated.',
        price: 3500, mrp: 4400, img: `${IMG_BASE}4E7269C7-321C-4C45-AE25-BBA095365CE2-1.jpg`,
        badge: 'hot', rating: 4.9, reviews: 15, inStock: true
    },
];

// ============================================================
// CATEGORY DEFINITIONS (from real site)
// ============================================================
const categories = [
    { id: 'ammonia-compressor', label: 'Ammonia Compressor', icon: '⚙️',
        color: 'rgba(13,71,161,0.1)', iconColor: '#0d47a1',
        sub: ['MX-100', 'MX-200', 'MX-300', 'MX-400', 'MX-600'] },
    { id: 'ammonia-spares', label: 'Ammonia Spare Parts', icon: '🔩',
        color: 'rgba(245,158,11,0.1)', iconColor: '#d97706',
        sub: ['Filters', 'Bearings', 'O-Rings', 'Shaft Seals', 'Piston Rings', 'Valve Plates'] },
    { id: 'ammonia-valves', label: 'Ammonia Valves', icon: '🔵',
        color: 'rgba(220,38,38,0.1)', iconColor: '#dc2626',
        sub: ['N.G.V.S', 'S.V.S', 'D.M.S', 'N.G.V.W', 'N.A.V.W'] },
    { id: 'cold-storage', label: 'Cold Storage Equipment', icon: '❄️',
        color: 'rgba(6,182,212,0.1)', iconColor: '#0e7490',
        sub: ['Air Cooling', 'Condensers', 'Cooling Coils', 'Compressors'] },
    { id: 'control', label: 'Control', icon: '🎛️',
        color: 'rgba(139,92,246,0.1)', iconColor: '#7c3aed',
        sub: ['Thermostats', 'Pressure Switches', 'Solenoid Valves'] },
    { id: 'dairy-plant', label: 'Dairy Plant Equipment', icon: '🥛',
        color: 'rgba(16,185,129,0.1)', iconColor: '#059669',
        sub: ['Chiller Parts', 'Refrigeration Valves'] },
    { id: 'frozen-plant', label: 'Frozen Plant Equipment', icon: '🧊',
        color: 'rgba(99,102,241,0.1)', iconColor: '#4f46e5',
        sub: ['Blast Freezers', 'Freon Compressors'] },
    { id: 'ice-factory', label: 'Ice Factories Equipments', icon: '🏭',
        color: 'rgba(14,165,233,0.1)', iconColor: '#0284c7',
        sub: ['150LBS', '300LBS', '16KG', '25KG', 'U-Bends'] },
    { id: 'motors', label: 'Motors', icon: '⚡',
        color: 'rgba(251,146,60,0.1)', iconColor: '#ea580c',
        sub: ['0.5 HP', '1 HP', '2 HP', '3 HP', '5 HP'] },
    { id: 'pipe-fittings', label: 'Pipe & Pipe Fittings', icon: '🔧',
        color: 'rgba(107,114,128,0.1)', iconColor: '#4b5563',
        sub: ['GI Pipes', 'Flanges', 'U-Bends', 'Fittings'] },
];

// ============================================================
// CART STATE
// ============================================================
let cart = JSON.parse(localStorage.getItem('ahuja_cart') || '[]');
let currentBuyProduct = null;

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    buildCategoryGrids();
    buildNavCategories();
    buildMegaMenu();
    renderAllProductSections();
    renderProducts('all');
    updateCartUI();
    setupScrollHandlers();
    setupAllCatsBtn();
});

// ============================================================
// BUILD CATEGORY SECTION
// ============================================================
function buildCategoryGrids() {
    const grid = document.getElementById('categoryGrid');
    if (!grid) return;
    grid.innerHTML = categories.map(c => `
        <div class="cat-card" onclick="filterProducts('${c.id}'); document.getElementById('products').scrollIntoView({behavior:'smooth'})">
            <div class="cat-icon" style="background:${c.color};color:${c.iconColor}">
                <span style="font-size:2rem">${c.icon}</span>
            </div>
            <h3>${c.label}</h3>
            <p style="font-size:.75rem;color:#64748b;margin-top:4px">${c.sub.slice(0,3).join(' · ')}</p>
            <span class="cat-count">${products.filter(p=>p.cat===c.id).length}+ Products</span>
        </div>
    `).join('');
}

function buildNavCategories() {
    const navList = document.getElementById('navCatList');
    if (!navList) return;
    navList.innerHTML = categories.map(c => `
        <li><a href="#products" onclick="filterProducts('${c.id}')">${c.label}</a></li>
    `).join('');
}

function buildMegaMenu() {
    const mega = document.getElementById('megaMenuCats');
    if (!mega) return;
    // Split into columns of 5
    const cols = [];
    for (let i = 0; i < categories.length; i += 3) {
        cols.push(categories.slice(i, i + 3));
    }
    mega.innerHTML = cols.map(col => `
        <div class="mega-col">
            ${col.map(c => `
                <div class="mega-cat-item" onclick="filterProducts('${c.id}'); closeMega(); document.getElementById('products').scrollIntoView({behavior:'smooth'})">
                    <span style="font-size:1.1rem">${c.icon}</span>
                    <div>
                        <strong>${c.label}</strong>
                        <small>${c.sub.slice(0,3).join(', ')}</small>
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');
}

// ============================================================
// RENDER PRODUCTS
// ============================================================
function renderAllProductSections() {
    const sections = {
        'ammonia-valves-grid': 'ammonia-valves',
        'compressor-grid': 'ammonia-compressor',
        'spares-grid': 'ammonia-spares',
        'cold-storage-grid': 'cold-storage',
    };
    for (const [gridId, cat] of Object.entries(sections)) {
        const el = document.getElementById(gridId);
        if (!el) continue;
        const items = products.filter(p => p.cat === cat).slice(0, 4);
        el.innerHTML = items.map(productCardHTML).join('');
    }
}

function filterProducts(cat) {
    document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
    const active = Array.from(document.querySelectorAll('.filter-tag'))
        .find(t => t.dataset.cat === cat || (cat === 'all' && t.dataset.cat === 'all'));
    if (active) active.classList.add('active');

    const grid = document.getElementById('productGrid');
    const filtered = cat === 'all' ? products : products.filter(p => p.cat === cat);
    grid.innerHTML = filtered.map(productCardHTML).join('');
}

function productCardHTML(p) {
    const discount = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
    const catObj = categories.find(c => c.id === p.cat);
    const catLabel = catObj ? catObj.label : p.cat;
    const priceStr = p.price > 0
        ? `₹${p.price.toLocaleString('en-IN')}`
        : '<span style="color:#64748b;font-size:.9rem">Price on Request</span>';

    const badgeHTML = p.badge
        ? `<span class="product-badge badge-${p.badge}">${p.badge === 'hot' ? '🔥 HOT' : p.badge === 'sale' ? '💸 SALE' : '✨ NEW'}</span>`
        : '';

    const stars = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '');

    return `
    <div class="product-card">
        ${badgeHTML}
        <div class="product-img">
            <img src="${p.img}" alt="${p.name}" loading="lazy"
                 onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
                 style="width:100%;height:100%;object-fit:contain;padding:15px">
            <span class="img-fallback" style="display:none;font-size:2.8rem;width:100%;height:100%;align-items:center;justify-content:center">🔧</span>
            <div class="product-img-overlay">
                <button onclick="openBuyNow(${p.id})"><i class="fas fa-bolt"></i> Buy Now</button>
                <button onclick="addToCart(${p.id})"><i class="fas fa-cart-plus"></i> Cart</button>
            </div>
        </div>
        <div class="product-body">
            <div class="product-cat">${catLabel}</div>
            <h3 class="product-name">${p.name}</h3>
            <p class="product-desc">${p.desc}</p>
            <div class="product-rating">
                <span class="stars">${stars}</span>
                <span class="rating-count">(${p.reviews} reviews)</span>
                ${p.inStock ? '<span class="in-stock">● In Stock</span>' : ''}
            </div>
            <div class="product-price-row">
                <span class="product-price">${priceStr}</span>
                ${p.price > 0 ? `<span class="product-mrp">₹${p.mrp.toLocaleString('en-IN')}</span>` : ''}
                ${discount > 0 ? `<span class="product-discount">${discount}% off</span>` : ''}
            </div>
            <div class="product-actions">
                <button class="btn btn-outline" onclick="addToCart(${p.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <button class="btn btn-primary" onclick="openBuyNow(${p.id})">
                    <i class="fas fa-bolt"></i> Buy Now
                </button>
            </div>
        </div>
    </div>`;
}

// ============================================================
// CART LOGIC
// ============================================================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(i => i.id === productId);
    if (existing) { existing.qty += 1; }
    else { cart.push({ id: productId, name: product.name, cat: product.cat, img: product.img, price: product.price, qty: 1 }); }
    saveCart(); updateCartUI(); renderCartItems();
    showToast(`Added: ${product.name.substring(0, 40)}...`);
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart(); updateCartUI(); renderCartItems();
}

function updateCartQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    saveCart(); updateCartUI(); renderCartItems();
}

function setCartQty(productId, val) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty = Math.max(1, parseInt(val) || 1);
    saveCart(); updateCartUI();
}

function saveCart() { localStorage.setItem('ahuja_cart', JSON.stringify(cart)); }

function updateCartUI() {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const count = cart.reduce((s, i) => s + i.qty, 0);
    document.getElementById('cartCount').textContent = count;
    document.getElementById('cartItemCountBadge').textContent = count;
    document.getElementById('cartTotal').textContent = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    const f = document.getElementById('cartFooter');
    if (f) f.style.display = cart.length ? 'flex' : 'none';
}

function renderCartItems() {
    const container = document.getElementById('cartItems');
    if (cart.length === 0) {
        container.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>Your cart is empty</p></div>`;
        return;
    }
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-icon">
                <img src="${item.img}" alt="${item.name}" style="width:100%;height:100%;object-fit:contain;padding:4px"
                     onerror="this.style.display='none'">
            </div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-cat">${categories.find(c=>c.id===item.cat)?.label || item.cat}</div>
                <div class="cart-item-qty-row">
                    <div class="qty-ctrl">
                        <button onclick="updateCartQty(${item.id},-1)">−</button>
                        <input type="number" value="${item.qty}" min="1" onchange="setCartQty(${item.id},this.value)">
                        <button onclick="updateCartQty(${item.id},1)">+</button>
                    </div>
                    <span class="cart-item-price">${item.price > 0 ? '₹' + (item.price * item.qty).toLocaleString('en-IN') : 'Price on Request'}</span>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})"><i class="fas fa-trash-alt"></i></button>
        </div>`).join('');
}

// ============================================================
// CART SIDEBAR
// ============================================================
function openCart() {
    renderCartItems(); updateCartUI();
    document.getElementById('cartSidebar').classList.add('open');
    document.getElementById('cartOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

function checkout() {
    if (cart.length === 0) { showToast('Cart is empty!', 'error'); return; }
    const orderId = 'ASI-' + Date.now().toString().slice(-8);
    document.getElementById('orderId').textContent = orderId;
    cart = []; saveCart(); updateCartUI();
    closeCart();
    document.getElementById('orderModalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ============================================================
// BUY NOW MODAL
// ============================================================
function openBuyNow(productId) {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    currentBuyProduct = p;
    document.getElementById('modalProductName').textContent = p.name;
    document.getElementById('modalProductPrice').textContent = p.price > 0
        ? `₹${p.price.toLocaleString('en-IN')}`
        : 'Price on Request';
    document.getElementById('modalQty').value = 1;
    const imgEl = document.getElementById('modalProductImg');
    if (imgEl) { imgEl.src = p.img; imgEl.alt = p.name; }
    document.getElementById('modalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = '';
    currentBuyProduct = null;
}
function changeModalQty(delta) {
    const inp = document.getElementById('modalQty');
    inp.value = Math.max(1, parseInt(inp.value || 1) + delta);
}
function confirmBuyNow() {
    if (!currentBuyProduct) return;
    closeModal();
    document.getElementById('orderId').textContent = 'ASI-' + Date.now().toString().slice(-8);
    document.getElementById('orderModalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}
function addModalItemToCart() {
    if (!currentBuyProduct) return;
    addToCart(currentBuyProduct.id);
    closeModal(); openCart();
}
function closeOrderModal() {
    document.getElementById('orderModalOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================================
// MEGA MENU
// ============================================================
function setupAllCatsBtn() {
    const btn = document.getElementById('allCatsBtn');
    const menu = document.getElementById('megaMenu');
    if (!btn || !menu) return;
    btn.addEventListener('click', e => {
        e.stopPropagation();
        menu.classList.toggle('open');
    });
    document.addEventListener('click', () => menu.classList.remove('open'));
    menu.addEventListener('click', e => e.stopPropagation());
}
function closeMega() {
    document.getElementById('megaMenu')?.classList.remove('open');
}

// ============================================================
// SEARCH
// ============================================================
function handleSearch(e) { if (e.key === 'Enter') performSearch(); }
function performSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const catFilter = document.getElementById('searchCat').value;
    let results = products;
    if (catFilter) results = results.filter(p => p.cat === catFilter);
    if (query) results = results.filter(p =>
        p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query)
    );
    const grid = document.getElementById('productGrid');
    if (results.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:#94a3b8">
            <i class="fas fa-search" style="font-size:3rem;margin-bottom:20px;display:block;opacity:.3"></i>
            <p style="font-size:1.1rem">No products found for "<strong>${query}</strong>"</p>
            <button class="btn btn-outline" style="margin-top:20px" onclick="filterProducts('all');document.getElementById('searchInput').value=''">View All Products</button>
        </div>`;
    } else { grid.innerHTML = results.map(productCardHTML).join(''); }
    filterProductsUpdateTags('all');
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}
function filterProductsUpdateTags(cat) {
    document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
    const a = document.querySelector(`.filter-tag[data-cat="${cat}"]`);
    if (a) a.classList.add('active');
}

// ============================================================
// CONTACT FORM
// ============================================================
function submitEnquiry(e) {
    e.preventDefault();
    const name = document.getElementById('cName').value.trim();
    const phone = document.getElementById('cPhone').value.trim();
    showToast(`Thank you ${name}! Your enquiry submitted. We'll contact you on ${phone} shortly.`);
    e.target.reset();
}

// ============================================================
// TOAST
// ============================================================
let toastTimeout;
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.querySelector('i').className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
    toast.style.background = type === 'error' ? '#ef4444' : '#10b981';
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ============================================================
// SCROLL
// ============================================================
function setupScrollHandlers() {
    const btn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });
}
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

// ESC closes modals
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeOrderModal(); closeCart(); closeMega(); }
});
