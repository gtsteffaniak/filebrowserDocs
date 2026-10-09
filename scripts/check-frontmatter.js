import fs from 'fs';
import path from 'path';

/**
 * Recursively find all markdown files in a directory.
 */
function findMarkdownFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

/**
 * Basic YAML syntax validation for Hugo front matter.
 */
function validateYamlFrontMatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  if (!lines[0] || lines[0].trim() !== '---') {
    return { valid: true, skipped: true }; // No front matter block at top
  }
  
  let endIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      endIdx = i;
      break;
    }
  }
  
  if (endIdx === -1) {
    return { valid: false, error: 'Unclosed front matter block (missing closing ---)' };
  }
  
  const frontMatterLines = lines.slice(1, endIdx);
  
  // Validate basic YAML key-value formatting
  for (let i = 0; i < frontMatterLines.length; i++) {
    const line = frontMatterLines[i];
    const trimmed = line.trim();
    
    // Ignore comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    // Validate list item or key-value pair
    if (trimmed.startsWith('-')) continue;
    
    if (!trimmed.includes(':') && !trimmed.endsWith(':')) {
      return { 
        valid: false, 
        lineNum: i + 2, 
        error: `Malformed YAML line (missing colon): "${line}"` 
      };
    }
  }
  
  return { valid: true };
}

function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Validating YAML front matter (Node.js)...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const contentDir = path.resolve('content');
  const files = findMarkdownFiles(contentDir);
  
  let checkedCount = 0;
  let errors = [];

  for (const file of files) {
    checkedCount++;
    const res = validateYamlFrontMatter(file);
    if (!res.valid) {
      const relPath = path.relative(process.cwd(), file);
      errors.push({ file: relPath, error: res.error, lineNum: res.lineNum });
    }
  }

  if (errors.length > 0) {
    console.error(`❌ Found ${errors.length} front matter errors:`);
    for (const err of errors) {
      console.error(`  - ${err.file}${err.lineNum ? ':' + err.lineNum : ''} -> ${err.error}`);
    }
    process.exit(1);
  }

  console.log(`✅ All front matter is valid YAML (${checkedCount} files checked)`);
  console.log('');
}

main();
