const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let js = fs.readFileSync('script.js', 'utf8');

const idMap = {
    'ammonia-spares': 'ammonia-spare-parts',
    'cold-storage': 'cold-storage-equipment',
    'ice-factory': 'ice-factories-equipments',
    'pipe-fittings': 'pipe---pipe-fittings',
    'frozen-plant': 'frozen-plant-equipment',
    'dairy-plant': 'dairy-plant-equipment'
};

for (const [oldId, newId] of Object.entries(idMap)) {
    // Replace in script.js categories array
    js = js.replace(new RegExp(`id: '${oldId}'`, 'g'), `id: '${newId}'`);
    
    // Replace in index.html onclick="filterProducts('...')"
    html = html.replace(new RegExp(`filterProducts\\('${oldId}'\\)`, 'g'), `filterProducts('${newId}')`);
    
    // Replace in index.html data-cat="..."
    html = html.replace(new RegExp(`data-cat="${oldId}"`, 'g'), `data-cat="${newId}"`);
}

fs.writeFileSync('index.html', html);
fs.writeFileSync('script.js', js);
console.log('Fixed category IDs mapping.');
