import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (since __dirname is not available in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extensions of files you want to include
const includeExtensions = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.java', '.properties', '.xml',
  '.css', '.scss', '.json', '.md', '.yml', '.yaml', '.html'
]);

// Directories to ignore (case-insensitive)
const ignoreDirs = new Set([
  'node_modules', 'target', 'build', 'dist', '.git', '.idea',
  '.vscode', 'coverage', '__pycache__', '.next', 'out'
]);

// Output file
const outputFile = 'full_project_dump.txt';

let totalFiles = 0;
let output = '';

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip ignored directories
      if (ignoreDirs.has(entry.name.toLowerCase())) continue;
      walkDir(fullPath);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (includeExtensions.has(ext)) {
        const relativePath = path.relative(process.cwd(), fullPath);
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          output += `\n\n--- ${relativePath} ---\n\n${content}`;
          totalFiles++;
        } catch (err) {
          console.warn(`Skipping ${relativePath}: ${err.message}`);
        }
      }
    }
  }
}

// Start from current directory
walkDir('.');

fs.writeFileSync(outputFile, output, 'utf8');
console.log(`Done! Collected ${totalFiles} files into ${outputFile}`);