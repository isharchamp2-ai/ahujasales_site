const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('parsed_data.json', 'utf8'));
const IMG_BASE = 'https://test.ahujasalesindia.com'; 

let productsCode = `// ============================================================
// REAL PRODUCT DATABASE (from AhujaSales-V1.1 website details.xls)
// ============================================================
const products = [\n`;

rawData.forEach(item => {
    if(!item.SellingRate && !item.Description) return;
    
    let name = item.Model ? `${item.SubCatergory || item.Category} ${item.Model} (${item.Size || ''})` : `${item.SubCatergory || item.Category}`;
    name = name.trim().replace(/'/g, "\\'"); // escape single quotes
    
    let cat = (item.Category || '').toLowerCase().replace(/[^a-z0-9]/g, '-');
    if(!cat) cat = 'other';
    
    let img = item.PicName ? `${IMG_BASE}${item.PicName}` : 'https://test.ahujasalesindia.com/Images/logo.png';
    let desc = (item.Description || '').replace(/\n/g, ' ').replace(/'/g, "\\'");
    
    productsCode += `    {
        id: ${item.ItemID || Math.floor(Math.random()*100000)},
        cat: '${cat}',
        name: '${name}',
        desc: '${desc}',
        price: ${item.SellingRate || 0},
        img: '${img}',
        badge: '${item.Featured == 1 ? 'hot' : item.Featured == 2 ? 'sale' : null}',
        rating: 4.8,
        reviews: ${Math.floor(Math.random() * 20 + 5)},
        inStock: ${item.AvailableQuantity > 0},
        related: [${(item.RelatedProducts || '').split(',').map(v=>parseInt(v.trim())).filter(v=>!isNaN(v)).join(',')}]
    },\n`;
});

productsCode += `];\n`;

let script = fs.readFileSync('script.js', 'utf8');

const startMarker = '// ============================================================\n// REAL PRODUCT DATABASE';
const endMarker = '// ============================================================\n// CATEGORY DEFINITIONS';
const regex = new RegExp(`${startMarker.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}[\\s\\S]*?${endMarker.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}`);

script = script.replace(regex, productsCode + '\n' + endMarker);

script = script.replace("document.getElementById('modalOverlay').classList.add('active');", `
    renderRelatedProducts(p);
    document.getElementById('modalOverlay').classList.add('active');`);

script += `

// ============================================================
// RELATED PRODUCTS
// ============================================================
function renderRelatedProducts(product) {
    const container = document.getElementById('relatedProductsContainer');
    if (!container) return;
    
    if (!product.related || product.related.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    const relatedItems = products.filter(p => product.related.includes(p.id)).slice(0, 4);
    
    if (relatedItems.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    
    const html = relatedItems.map(p => \`
        <div class="related-card" onclick="closeModal(); openBuyNow(\${p.id})" style="cursor:pointer; padding:10px; border:1px solid #e2e8f0; border-radius:8px; transition:0.2s; background:#fff" onmouseover="this.style.borderColor='#0d47a1'" onmouseout="this.style.borderColor='#e2e8f0'">
            <img src="\${p.img}" alt="\${p.name}" style="width:100%;height:100px;object-fit:contain;background:#fff;border-radius:4px" onerror="this.src='https://test.ahujasalesindia.com/Images/logo.png'">
            <h4 style="font-size:0.75rem;margin:8px 0 4px;line-height:1.2;color:#1e293b">\${p.name.substring(0,40)}...</h4>
            <span style="font-size:0.8rem;color:var(--primary);font-weight:700">₹\${p.price.toLocaleString('en-IN')}</span>
        </div>
    \`).join('');
    
    document.getElementById('relatedProductsGrid').innerHTML = html;
}
`;

fs.writeFileSync('script.js', script);
console.log('Successfully updated script.js');
