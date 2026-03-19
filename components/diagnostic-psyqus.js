// diagnostic-psyqus.js
// Run with: node diagnostic-psyqus.js

const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();

let issues = {
  duplicateCasing: [],
  brokenImports: [],
  unusedFiles: [],
};

const allFiles = [];

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && file !== 'node_modules' && file !== '.next') {
      walk(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      allFiles.push(fullPath);
    }
  });
}

function checkDuplicateCasing() {
  const map = {};

  allFiles.forEach(file => {
    const lower = file.toLowerCase();
    if (!map[lower]) {
      map[lower] = [];
    }
    map[lower].push(file);
  });

  Object.values(map).forEach(group => {
    if (group.length > 1) {
      issues.duplicateCasing.push(group);
    }
  });
}

function extractImports(content) {
  const regex = /from\s+['"](.*?)['"]/g;
  let match;
  const imports = [];

  while ((match = regex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

function resolveImport(file, imp) {
  if (imp.startsWith('.')) {
    const resolved = path.resolve(path.dirname(file), imp);
    const possibilities = [
      resolved,
      resolved + '.ts',
      resolved + '.tsx',
      path.join(resolved, 'index.ts'),
      path.join(resolved, 'index.tsx'),
    ];

    return possibilities.find(p => fs.existsSync(p));
  }

  return true; // ignore node_modules
}

function checkBrokenImports() {
  allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const imports = extractImports(content);

    imports.forEach(imp => {
      const resolved = resolveImport(file, imp);
      if (!resolved) {
        issues.brokenImports.push({ file, imp });
      }
    });
  });
}

function detectUnusedFiles() {
  const used = new Set();

  allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const imports = extractImports(content);

    imports.forEach(imp => {
      if (imp.startsWith('.')) {
        const resolved = resolveImport(file, imp);
        if (resolved) used.add(resolved);
      }
    });
  });

  allFiles.forEach(file => {
    if (!used.has(file)) {
      issues.unusedFiles.push(file);
    }
  });
}

function run() {
  console.log('🔍 Scanning project...\n');

  walk(ROOT_DIR);
  checkDuplicateCasing();
  checkBrokenImports();
  detectUnusedFiles();

  console.log('--- RESULTS ---\n');

  if (issues.duplicateCasing.length) {
    console.log('⚠️ Duplicate casing issues:');
    console.log(issues.duplicateCasing);
  }

  if (issues.brokenImports.length) {
    console.log('\n❌ Broken imports:');
    issues.brokenImports.forEach(i => console.log(i));
  }

  if (issues.unusedFiles.length) {
    console.log('\n🧹 Unused files:');
    issues.unusedFiles.forEach(f => console.log(f));
  }

  console.log('\n✅ Scan complete');
}

run();
