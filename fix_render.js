const fs = require('fs');
let s = fs.readFileSync('script.js', 'utf8');

const missingFunc = `
// ============================================================
// PRODUCT RENDERING
// ============================================================
function renderProducts(categoryId = 'all') {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    let filtered = products;
    if (categoryId !== 'all') {
        filtered = products.filter(p => p.cat === categoryId);
    }
    
    const searchTerm = document.getElementById('searchInput');
    if (searchTerm && searchTerm.value.trim() !== '') {
        const q = searchTerm.value.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(q) || 
            p.desc.toLowerCase().includes(q)
        );
    }
    
    // Sort logic
    const sort = document.getElementById('sortSelect');
    if (sort && sort.value) {
        if (sort.value === 'low') filtered.sort((a,b) => a.price - b.price);
        if (sort.value === 'high') filtered.sort((a,b) => b.price - a.price);
        if (sort.value === 'new') filtered.sort((a,b) => b.id - a.id);
    }

    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:50px;color:var(--text-muted)">No products found matching your criteria.</div>';
        document.getElementById('productCount').textContent = '(0 items)';
        return;
    }

    document.getElementById('productCount').textContent = \`(\${filtered.length} items)\`;
    
    // pagination (just show first 100 max to avoid lag for 4000 items)
    const maxItems = 100;
    const displayItems = filtered.slice(0, maxItems);
    
    grid.innerHTML = displayItems.map(productCardHTML).join('');
    
    if(filtered.length > maxItems) {
        grid.innerHTML += \`<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text-muted)">Showing top \${maxItems} results. Use search or filters to narrow down.</div>\`;
    }
}

function productCardHTML(product) {
    const priceStr = product.price > 0 ? '₹' + product.price.toLocaleString('en-IN') : 'Price on Request';
    const mrpStr = product.price > 0 ? '₹' + (product.price * 1.2).toLocaleString('en-IN') : '';
    const badgeHtml = product.badge && product.badge !== 'null' ? \`<span class="badge badge-\${product.badge}">\${product.badge.toUpperCase()}</span>\` : '';
    const catName = categories.find(c => c.id === product.cat)?.label || product.cat;
    
    return \`
    <div class="product-card">
        <div class="product-img">
            \${badgeHtml}
            <img src="\${product.img}" alt="\${product.name}" onerror="this.src='https://test.ahujasalesindia.com/Images/logo.png'; this.style.objectFit='contain'">
            <div class="product-actions-hover">
                <button class="btn btn-primary" onclick="openBuyNow(\${product.id})">Buy Now</button>
                <button class="icon-btn" onclick="addToCart(\${product.id})"><i class="fas fa-cart-plus"></i></button>
            </div>
        </div>
        <div class="product-body">
            <div class="product-cat" style="display:flex; justify-content:space-between; align-items:center;">
                <span>\${catName.substring(0, 25)}</span>
                \${product.inStock ? '<span class="in-stock"><i class="fas fa-check-circle"></i> In Stock</span>' : '<span style="color:#ef4444;font-size:0.72rem;font-weight:700">Out of Stock</span>'}
            </div>
            <h3 class="product-name">\${product.name.substring(0, 50)}...</h3>
            <p class="product-desc">\${product.desc.substring(0, 80)}...</p>
            <div class="product-rating">
                <div class="stars">★★★★★</div>
                <span class="rating-count">(\${product.reviews})</span>
            </div>
            <div class="product-price-row">
                <span class="price">\${priceStr}</span>
                \${mrpStr ? \`<span class="mrp">\${mrpStr}</span>\` : ''}
            </div>
        </div>
    </div>\`;
}
`;

// Insert it right before "function renderAllProductSections"
s = s.replace('function renderAllProductSections()', missingFunc + '\nfunction renderAllProductSections()');
fs.writeFileSync('script.js', s);
console.log('Fixed renderProducts function');
