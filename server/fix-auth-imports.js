const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');
const files = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));

console.log('Fixing auth middleware imports in route files...');

for (const file of files) {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already fixed
  if (content.includes('const { verifyToken }')) {
    console.log(`${file}: Already fixed`);
    continue;
  }
  
  // Replace the auth import
  const oldImport = /const auth = require\('\.\.\/middleware\/auth'\);/g;
  const newImport = "const { verifyToken } = require('../middleware/auth');";
  
  if (content.match(oldImport)) {
    content = content.replace(oldImport, newImport);
    
    // Replace auth usage with verifyToken
    content = content.replace(/router\.(post|put|patch|delete)\('([^']+)',\s*auth,/g, 
                             'router.$1(\'$2\', verifyToken,');
    
    fs.writeFileSync(filePath, content);
    console.log(`${file}: Fixed`);
  } else {
    console.log(`${file}: No auth import found or different pattern`);
  }
}

console.log('Done fixing auth middleware imports');
