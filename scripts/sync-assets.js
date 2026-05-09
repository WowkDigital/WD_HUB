const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
const dataFilePath = path.join(__dirname, '..', 'js', 'data.js');

function scanAssets() {
    const manifest = {};
    const items = fs.readdirSync(assetsDir);

    items.forEach(item => {
        const fullPath = path.join(assetsDir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            const files = fs.readdirSync(fullPath)
                .filter(file => /\.(png|jpe?g|gif|svg|webp)$/i.test(file))
                .map(file => `assets/${item}/${file}`);
            manifest[`assets/${item}`] = files;
        }
    });

    return manifest;
}

function updateDataFile(manifest) {
    let content = fs.readFileSync(dataFilePath, 'utf8');
    const manifestString = JSON.stringify(manifest, null, 4);
    
    // Replace the assetsManifest object in the file
    const regex = /const assetsManifest = \{[\s\S]*?\};/;
    const replacement = `const assetsManifest = ${manifestString};`;
    
    if (regex.test(content)) {
        content = content.replace(regex, replacement);
        fs.writeFileSync(dataFilePath, content);
        console.log('Successfully updated assetsManifest in js/data.js');
    } else {
        console.error('Could not find assetsManifest in js/data.js');
    }
}

const manifest = scanAssets();
updateDataFile(manifest);
