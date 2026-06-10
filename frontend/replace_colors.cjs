const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = {
  '--clr-deep-plum': '--clr-weathervane',
  '--clr-aubergine': '--clr-purple-kite',
  '--clr-mauve': '--clr-mulberry-mix',
  '--clr-mauve-lt': '--clr-benifuji',
  '--clr-dusty-lilac': '--clr-gizmo',
  '--clr-light': '--clr-portrait-pink'
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(directoryPath, function(filePath) {
  if (filePath.endsWith('.css') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    for (const [oldVar, newVar] of Object.entries(replacements)) {
      if (content.includes(oldVar)) {
        content = content.split(oldVar).join(newVar);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
