const fs = require('fs');
const path = require('path');

function organizeImports(content) {
  // Séparer le fichier en lignes
  const lines = content.split('\n');
  
  // Trouver toutes les lignes d'import
  const imports = lines.filter(line => line.trim().startsWith('import'));
  const otherLines = lines.filter(line => !line.trim().startsWith('import'));
  
  // Trier les imports par groupes
  const builtinImports = imports.filter(line => !line.includes('@/') && !line.includes('./') && !line.includes('../'));
  const internalImports = imports.filter(line => line.includes('@/'));
  const relativeImports = imports.filter(line => line.includes('./') || line.includes('../'));
  
  // Trier chaque groupe alphabétiquement
  const sortedImports = [
    ...builtinImports.sort(),
    '',
    ...internalImports.sort(),
    '',
    ...relativeImports.sort(),
  ].filter(Boolean);
  
  // Reconstruire le fichier
  return [...sortedImports, '', ...otherLines].join('\n');
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      processDirectory(filePath);
    } else if (stats.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      console.log(`Processing ${filePath}`);
      const content = fs.readFileSync(filePath, 'utf8');
      const organized = organizeImports(content);
      fs.writeFileSync(filePath, organized);
    }
  });
}

// Démarrer le traitement depuis le répertoire racine
const rootDir = process.argv[2] || '.';
processDirectory(rootDir);
