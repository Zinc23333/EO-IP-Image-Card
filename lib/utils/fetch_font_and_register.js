const fs = require('fs');
const PImage = require('pureimage');

async function loadFontFromUrl(url, familyName) {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fontPath = `/tmp/${familyName}.ttf`;

    fs.writeFileSync(fontPath, buffer);

    const font = PImage.registerFont(fontPath, familyName);
    await font.load();

    return font;
}

module.exports = { loadFontFromUrl };
