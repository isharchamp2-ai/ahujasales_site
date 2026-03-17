const fs = require('fs');

const htmlPath = 'index.html';
const jsPath = 'script.js';

let html = fs.readFileSync(htmlPath, 'utf8');
let js = fs.readFileSync(jsPath, 'utf8');

const idMap = {
    'ammonia-spares': 'ammonia-spare-parts',
    'cold-storage': 'cold-storage-equipment',
    'ice-factory': 'ice-factories-equipments',
    'pipe-fittings': 'pipe---pipe-fittings',
    'frozen-plant': 'frozen-plant-equipment',
    'dairy-plant': 'dairy-plant-equipment'
};

for (const oldId in idMap) {
    const newId = idMap[oldId];
    
    // Replace in JS: id: 'ammonia-spares' -> id: 'ammonia-spare-parts'
    js = js.split("id: '" + oldId + "'").join("id: '" + newId + "'");
    
    // Replace in HTML: onclick="filterProducts('oldId')" -> onclick="filterProducts('newId')"
    html = html.split("filterProducts('" + oldId + "')").join("filterProducts('" + newId + "')");
    
    // Replace in HTML: data-cat="oldId"
    html = html.split('data-cat="' + oldId + '"').join('data-cat="' + newId + '"');
    
    // Replace in HTML: value="oldId"
    html = html.split('value="' + oldId + '"').join('value="' + newId + '"');
}

fs.writeFileSync(htmlPath, html);
fs.writeFileSync(jsPath, js);
console.log('Fixed IDs properly');
