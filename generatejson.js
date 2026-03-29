const fs = require('fs');
const path = require('path');

const folder = path.join(__dirname, 'arch');
const files = fs.readdirSync(folder)
  .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
  .map(f => ({
    name: f,
    url: `https://raw.githubusercontent.com/doremyswt/drmy.github.io/main/arch/${f}`,
    date: fs.statSync(path.join(folder, f)).mtime
  }))
  .sort((a, b) => b.date - a.date);

fs.writeFileSync(path.join(folder, 'images.json'), JSON.stringify(files, null, 2));
