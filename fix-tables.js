const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('d:\\my_projects\\glowison-erp\\src\\components');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find all <table className="..."> and add whitespace-nowrap if not present
  const regex = /<table\s+className="([^"]+)"/g;
  let modified = false;
  
  content = content.replace(regex, (match, classNames) => {
    if (!classNames.includes('whitespace-nowrap')) {
      modified = true;
      return `<table className="${classNames} whitespace-nowrap"`;
    }
    return match;
  });
  
  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
