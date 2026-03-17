const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let js = fs.readFileSync('script.js', 'utf8');

// 1. Remove the static HTML sections
const staticSectionsRegex = /<!-- ===== AMMONIA VALVES SECTION ===== -->[\s\S]*?(?=<!-- ===== OUR PARTNERS ===== -->)/;
html = html.replace(staticSectionsRegex, `<!-- ===== DYNAMIC CATEGORY SECTIONS ===== -->
    <div id="dynamicCategorySections"></div>\n\n    `);
fs.writeFileSync('index.html', html);


// 2. Rewrite renderAllProductSections in script.js to dynamically loop over 'categories' array
const renderAllProductSectionsRegex = /function renderAllProductSections\(\) \{[\s\S]*?\}\n\}/;

const newRenderCode = `function renderAllProductSections() {
    const container = document.getElementById('dynamicCategorySections');
    if (!container) return;
    
    let html = '';
    
    // For each category, get the top 4 products
    categories.forEach(cat => {
        // filter products by this category
        const catProducts = products.filter(p => p.cat === cat.id);
        
        // Skip rendering a section if there are no products
        if (catProducts.length === 0) return;
        
        // Take top 4 (you could sort by rating or price here if needed)
        const topProducts = catProducts.slice(0, 4);
        
        // Alternate background colors for visual separation
        const bgClass = html.includes('bg-white') && !html.includes('style="background:#f1f5f9"') ? 'style="background:#f1f5f9"' : 'class="bg-white"';
        
        html += \`
        <section class="section-pad \${bgClass.includes('class') ? 'bg-white' : ''}" \${bgClass.includes('style') ? bgClass : ''} id="sec-\${cat.id}">
            <div class="container">
                <div class="section-header">
                    <div>
                        <h2 class="section-title" style="text-align:left;margin-bottom:5px">\${cat.label}</h2>
                        <p class="section-sub">Top selling products in \${cat.label}</p>
                    </div>
                    <button class="btn btn-outline-sm" onclick="filterProducts('\${cat.id}');document.getElementById('products').scrollIntoView({behavior:'smooth'})">View All →</button>
                </div>
                <div class="product-grid mini-grid">
                    \${topProducts.map(productCardHTML).join('')}
                </div>
            </div>
        </section>\`;
    });
    
    container.innerHTML = html;
}`;

js = js.replace(renderAllProductSectionsRegex, newRenderCode);
fs.writeFileSync('script.js', js);
console.log("Successfully updated homepage sections.");
