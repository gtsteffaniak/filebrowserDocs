// scripts/translations.js
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as glob from 'glob';
import * as deepl from 'deepl-node';
import crypto from 'crypto';

// Parse command line arguments
const args = process.argv.slice(2);
const checkOnly = args.includes('--check') || args.includes('-c');
const mode = args.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'content';
const targetLang = args.find(arg => arg.startsWith('--lang='))?.split('=')[1];
const force = args.includes('--force') || args.includes('-f');

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.resolve(__dirname, '../content');
const masterContentDir = path.join(contentDir, 'en', 'docs');
const localesDir = path.resolve(__dirname, '../i18n');
const masterLocaleFile = path.join(localesDir, 'en.json');
const masterLanguageCode = 'en';

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
if (!checkOnly && !DEEPL_API_KEY) {
  console.error("❌ Missing DEEPL_API_KEY in environment.");
  process.exit(1);
}

const translator = checkOnly ? null : new deepl.DeepLClient(DEEPL_API_KEY);

// Language configuration from hugo.toml
const languages = {
  'ar': { name: 'Arabic', deepl: 'AR' },
  'cs': { name: 'Czech', deepl: 'CS' },
  'de': { name: 'German', deepl: 'DE' },
  'el': { name: 'Greek', deepl: 'EL' },
  'es': { name: 'Spanish', deepl: 'ES' },
  'fr': { name: 'French', deepl: 'FR' },
  'he': { name: 'Hebrew', deepl: 'HE' },
  'hu': { name: 'Hungarian', deepl: 'HU' },
  'is': { name: 'Icelandic', deepl: 'IS' },
  'it': { name: 'Italian', deepl: 'IT' },
  'ja': { name: 'Japanese', deepl: 'JA' },
  'ko': { name: 'Korean', deepl: 'KO' },
  'nl-be': { name: 'Dutch (Belgium)', deepl: 'NL' },
  'pl': { name: 'Polish', deepl: 'PL' },
  'pt': { name: 'Portuguese', deepl: 'PT-PT' },
  'pt-br': { name: 'Portuguese (Brazil)', deepl: 'PT-BR' },
  'ro': { name: 'Romanian', deepl: 'RO' },
  'ru': { name: 'Russian', deepl: 'RU' },
  'sk': { name: 'Slovak', deepl: 'SK' },
  'sv-se': { name: 'Swedish (Sweden)', deepl: 'SV' },
  'tr': { name: 'Turkish', deepl: 'TR' },
  'uk': { name: 'Ukrainian', deepl: 'UK' },
  'zh-cn': { name: 'Chinese (Simplified)', deepl: 'ZH-HANS' },
  'zh-tw': { name: 'Chinese (Traditional)', deepl: 'ZH-HANT' }
};

// Simplified language set for content translation
const simplifiedLanguages = {
  'de': { name: 'German', deepl: 'DE' },
  'es': { name: 'Spanish', deepl: 'ES' },
  'fr': { name: 'French', deepl: 'FR' },
  'zh-cn': { name: 'Chinese (Simplified)', deepl: 'ZH-HANS' }
};

// DeepL language mapping for i18n files
const deeplLangMap = {
  'zh-cn': 'ZH-HANS',
  'zh-tw': 'ZH-HANT',
  'pt': 'PT-PT',
  'pt-br': 'PT-BR',
  'en': 'EN',
  'en-us': 'EN-US',
  'en-gb': 'EN-GB',
  'sv-se': 'SV',
  'ua': 'UK',
  'nl-be': 'NL',
  'is': 'IS',
  'cz': 'CS',
  'cs': 'CS',
  'uk': 'UK',
};

// --- Utility Functions ---
function getContentHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

// --- Translation Functions ---
async function translateText(text, targetLanguage, keyPath = '') {
  if (checkOnly) {
    return text;
  }

  if (!text || typeof text !== 'string' || text.trim() === '') {
    return text;
  }

  // Skip translation for certain patterns
  if (text.match(/^#+\s*$/) || // Empty headers
      text.match(/^```/) || // Code blocks
      text.match(/^\|/) || // Tables
      text.match(/^```[\s\S]*?```$/m)) { // Code blocks
    return text;
  }

  // Skip languages object in i18n mode
  if (mode === 'i18n' && (keyPath === 'languages' || keyPath.startsWith('languages.'))) {
    return text;
  }

  const hasPlaceholders = /\{[^}]+\}/.test(text);
  let textToTranslate = text;
  const options = {};

  if (hasPlaceholders) {
    textToTranslate = text.replace(/(\{[^}]+\})/g, '<ph>$1</ph>');
    options.tagHandling = 'xml';
    options.ignoreTags = ['ph'];
  }

  try {
    let deeplTargetLang;
    if (mode === 'i18n') {
      deeplTargetLang = deeplLangMap[targetLanguage.toLowerCase()] || targetLanguage.toUpperCase();
    } else {
      deeplTargetLang = languages[targetLanguage]?.deepl || targetLanguage.toUpperCase();
    }

    const result = await translator.translateText(textToTranslate, masterLanguageCode, deeplTargetLang, options);
    
    // Delay to avoid rate-limiting
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let translatedText = result.text;

    if (hasPlaceholders) {
      translatedText = translatedText.replace(/<ph>\s*(\{[^}]+\})\s*<\/ph>/g, '$1');
    }

    return translatedText;
  } catch (err) {
    console.error(`⚠️ Translation failed for "${text.substring(0, 50)}...":`, err?.message || err);
    return text;
  }
}

// --- Content Translation Functions ---
async function needsTranslation(masterPath, targetPath, targetLang) {
  if (!await fs.pathExists(targetPath)) {
    return { needsTranslation: true, reason: 'File does not exist' };
  }

  if (force) {
    return { needsTranslation: true, reason: 'Force flag enabled' };
  }

  try {
    const masterContent = await fs.readFile(masterPath, 'utf8');
    const targetContent = await fs.readFile(targetPath, 'utf8');

    const masterHash = getContentHash(masterContent);
    const targetHash = getContentHash(targetContent);

    if (masterHash !== targetHash) {
      return { needsTranslation: true, reason: 'Master content has changed' };
    }

    if (!targetContent.includes('<!-- TRANSLATED -->')) {
      return { needsTranslation: true, reason: 'No translation marker found' };
    }

    return { needsTranslation: false, reason: 'Up to date' };
  } catch (error) {
    return { needsTranslation: true, reason: `Error checking file: ${error.message}` };
  }
}

async function processMarkdownFile(filePath, targetLang) {
  const content = await fs.readFile(filePath, 'utf8');
  const lines = content.split('\n');
  const translatedLines = [];
  
  let inCodeBlock = false;
  let inFrontMatter = false;
  let frontMatterEnded = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle front matter
    if (line === '---' && !frontMatterEnded) {
      if (inFrontMatter) {
        inFrontMatter = false;
        frontMatterEnded = true;
      } else {
        inFrontMatter = true;
      }
      translatedLines.push(line);
      continue;
    }
    
    // Skip front matter content
    if (inFrontMatter) {
      translatedLines.push(line);
      continue;
    }
    
    // Handle code blocks
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      translatedLines.push(line);
      continue;
    }
    
    // Skip code blocks
    if (inCodeBlock) {
      translatedLines.push(line);
      continue;
    }
    
    // Skip empty lines, headers without content, and special markdown
    if (line.trim() === '' || 
        line.match(/^#+\s*$/) ||
        line.match(/^\|/) ||
        line.match(/^```/) ||
        line.match(/^---/) ||
        line.match(/^<!--/) ||
        line.match(/^\[/) && line.match(/\]\(/)) {
      translatedLines.push(line);
      continue;
    }
    
    // Translate the line
    const translatedLine = await translateText(line, targetLang);
    translatedLines.push(translatedLine);
  }
  
  return translatedLines.join('\n');
}

// --- I18n Translation Functions ---
async function processKeys(masterObj, targetObj, targetLangCode, currentPathParts = []) {
  let changesMade = false;
  let meaningfulChanges = 0;

  // First pass: Add/update keys from master to target
  for (const key in masterObj) {
    if (Object.prototype.hasOwnProperty.call(masterObj, key)) {
      const currentPathPartsNext = [...currentPathParts, key];
      const currentKeyPath = currentPathPartsNext.join('.');

      const masterValue = masterObj[key];

      // Special handling for "languages" key - always copy the entire object from master
      if (key === 'languages' && currentPathParts.length === 0) {
        if (checkOnly) {
          // Don't print or count languages object copying - it's routine
        } else {
          console.log(`Copying entire "languages" object from master to ${targetLangCode}.json`);
          targetObj[key] = JSON.parse(JSON.stringify(masterValue));
        }
        changesMade = true;
        continue;
      }

      if (typeof masterValue === 'object' && masterValue !== null && !Array.isArray(masterValue)) {
        if (!targetObj[key] || typeof targetObj[key] !== 'object') {
          if (checkOnly) {
            console.log(`Would create missing object structure for "${currentKeyPath}" in ${targetLangCode}.json`);
            meaningfulChanges++;
            targetObj[key] = {};
          } else {
            console.log(`Creating missing object structure for "${currentKeyPath}" in ${targetLangCode}.json`);
            targetObj[key] = {};
          }
          changesMade = true;
        }
        const result = await processKeys(masterValue, targetObj[key], targetLangCode, currentPathPartsNext);
        if (result == "UNSUPPORTED") {
          console.log(`Skipping translation for "${targetLangCode}" due to unsupported structure.`);
          return "UNSUPPORTED";
        }
        if (typeof result === 'number') {
          meaningfulChanges += result;
          changesMade = true;
        } else if (result) {
          changesMade = true;
        }
      } else if (typeof masterValue === 'string') {
        if (!targetObj.hasOwnProperty(key) || targetObj[key] === '' || targetObj[key] === null) {
          if (checkOnly) {
            console.log(`Would translate "${currentKeyPath}" for ${targetLangCode}.json`);
            meaningfulChanges++;
          } else {
            const result = await translateText(masterValue, targetLangCode, currentKeyPath);
            if (result == "") {
              return "UNSUPPORTED";
            }
            targetObj[key] = result;
          }
          changesMade = true;
        }
      } else {
        if (!targetObj.hasOwnProperty(key)) {
          if (checkOnly) {
            console.log(`Would copy key "${currentKeyPath}" (non-string) from English to ${targetLangCode}.json`);
            meaningfulChanges++;
          } else {
            console.log(`Key "${currentKeyPath}" (non-string) missing in ${targetLangCode}.json. Copying from English.`);
            targetObj[key] = masterValue;
          }
          changesMade = true;
        }
      }
    }
  }

  // Second pass: Remove obsolete keys that exist in target but not in master
  const keysToRemove = [];
  for (const key in targetObj) {
    if (Object.prototype.hasOwnProperty.call(targetObj, key)) {
      if (!masterObj.hasOwnProperty(key)) {
        keysToRemove.push(key);
      }
    }
  }

  for (const key of keysToRemove) {
    const currentKeyPath = [...currentPathParts, key].join('.');
    if (checkOnly) {
      console.log(`Would remove obsolete key "${currentKeyPath}" from ${targetLangCode}.json`);
      meaningfulChanges++;
    } else {
      console.log(`🗑️  Removing obsolete key "${currentKeyPath}" from ${targetLangCode}.json`);
      delete targetObj[key];
    }
    changesMade = true;
  }

  return checkOnly ? meaningfulChanges : changesMade;
}

// --- Directory Management Functions ---
async function createLanguageDirectories() {
  const languagesToUse = mode === 'content' ? simplifiedLanguages : languages;
  for (const [langCode, langInfo] of Object.entries(languagesToUse)) {
    const langDir = path.join(contentDir, langCode, 'docs');
    await fs.ensureDir(langDir);
    console.log(`Created directory: ${langDir}`);
  }
}

async function getAllMarkdownFiles() {
  const pattern = path.join(masterContentDir, '**/*.md');
  return glob.sync(pattern);
}

async function copyDirectoryStructure(sourceDir, targetDir) {
  const items = await fs.readdir(sourceDir, { withFileTypes: true });
  
  for (const item of items) {
    const sourcePath = path.join(sourceDir, item.name);
    const targetPath = path.join(targetDir, item.name);
    
    if (item.isDirectory()) {
      await fs.ensureDir(targetPath);
      await copyDirectoryStructure(sourcePath, targetPath);
    }
  }
}

// --- Main Translation Functions ---
async function translateContent() {
  if (checkOnly) {
    console.log("--- Checking for content translation needs (no translations will be performed) ---");
  } else {
    console.log("--- Translating content files ---");
  }

  // Create language directories
  await createLanguageDirectories();

  // Get all markdown files
  const markdownFiles = await getAllMarkdownFiles();
  console.log(`Found ${markdownFiles.length} markdown files to process`);

  const languagesToProcess = targetLang ? [targetLang] : Object.keys(simplifiedLanguages);
  
  for (const langCode of languagesToProcess) {
    if (!simplifiedLanguages[langCode]) {
      console.warn(`Unknown language: ${langCode}`);
      continue;
    }

    console.log(`\n--- Processing language: ${simplifiedLanguages[langCode].name} (${langCode}) ---`);
    const langDir = path.join(contentDir, langCode, 'docs');
    
    // Copy directory structure first
    await copyDirectoryStructure(masterContentDir, langDir);
    
    let translatedCount = 0;
    let skippedCount = 0;
    
    for (const filePath of markdownFiles) {
      const relativePath = path.relative(masterContentDir, filePath);
      const targetPath = path.join(langDir, relativePath);
      
      try {
        if (checkOnly) {
          console.log(`Would translate: ${relativePath}`);
          translatedCount++;
        } else {
          const translatedContent = await processMarkdownFile(filePath, langCode);
          await fs.writeFile(targetPath, translatedContent, 'utf8');
          console.log(`Translated: ${relativePath}`);
          translatedCount++;
        }
      } catch (error) {
        console.error(`Error processing ${relativePath}:`, error.message);
        skippedCount++;
      }
    }
    
    console.log(`Language ${langCode}: ${translatedCount} files processed, ${skippedCount} skipped`);
  }

  if (checkOnly) {
    console.log('\n✅ Content translation check complete.');
  } else {
    console.log('\n✅ Content translation complete.');
  }
}

async function syncContentTranslations() {
  if (checkOnly) {
    console.log("--- Checking for content translation changes (no translations will be performed) ---");
  } else {
    console.warn("--- Using DeepL API for content translation ---");
  }

  // Create language directories
  await createLanguageDirectories();

  // Get all markdown files
  const markdownFiles = await getAllMarkdownFiles();
  console.log(`Found ${markdownFiles.length} markdown files to process`);

  let meaningfulChanges = 0;
  let hasMeaningfulChanges = false;

  for (const langCode of Object.keys(simplifiedLanguages)) {
    if (!simplifiedLanguages[langCode]) {
      console.warn(`Unknown language: ${langCode}`);
      continue;
    }

    console.log(`\nProcessing target language: ${langCode} (${simplifiedLanguages[langCode].name})`);
    const langDir = path.join(contentDir, langCode, 'docs');
    
    // Copy directory structure first
    await copyDirectoryStructure(masterContentDir, langDir);
    
    let translatedCount = 0;
    let skippedCount = 0;
    let upToDateCount = 0;
    
    for (const filePath of markdownFiles) {
      const relativePath = path.relative(masterContentDir, filePath);
      const targetPath = path.join(langDir, relativePath);
      
      try {
        // Check if translation is needed
        const translationCheck = await needsTranslation(filePath, targetPath, langCode);
        const shouldTranslate = translationCheck.needsTranslation;
        const reason = translationCheck.reason;
        
        if (shouldTranslate) {
          if (checkOnly) {
            console.log(`Would translate: ${relativePath} (${reason})`);
            meaningfulChanges++;
            hasMeaningfulChanges = true;
          } else {
            const translatedContent = await processMarkdownFile(filePath, langCode);
            // Add translation marker
            const finalContent = translatedContent + '\n\n<!-- TRANSLATED -->';
            await fs.writeFile(targetPath, finalContent, 'utf8');
            console.log(`Translated: ${relativePath} (${reason})`);
            translatedCount++;
          }
        } else {
          if (checkOnly) {
            // Don't print up-to-date files in check mode
          } else {
            console.log(`Skipped: ${relativePath} (${reason})`);
            upToDateCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing ${relativePath}:`, error.message);
        skippedCount++;
      }
    }
    
    if (checkOnly) {
      if (meaningfulChanges > 0) {
        console.log(`Found ${meaningfulChanges} meaningful changes needed for ${langCode}`);
      }
    } else {
      console.log(`Language ${langCode}: ${translatedCount} translated, ${upToDateCount} up-to-date, ${skippedCount} skipped`);
    }
  }

  if (checkOnly) {
    if (hasMeaningfulChanges) {
      console.log(`\n⚠️  Found ${meaningfulChanges} meaningful content translation changes needed.`);
      return 1;
    } else {
      console.log('\n✅ No meaningful content translation changes needed.');
      return 0;
    }
  } else {
    console.log('\n✅ Content translation synchronization complete (via DeepL).');
    return 0;
  }
}

async function syncI18nTranslations() {
  if (checkOnly) {
    console.log("--- Checking for translation changes (no translations will be performed) ---");
  } else {
    console.warn("--- Using DeepL API for translation ---");
  }

  if (!await fs.pathExists(masterLocaleFile)) {
    console.error(`Master locale file not found: ${masterLocaleFile}`);
    process.exit(1);
  }

  const masterContent = await fs.readJson(masterLocaleFile);
  console.log(`Loaded master translations from ${masterLocaleFile}`);

  // Only process the simplified language set: de, es, fr, zh-cn
  const supportedLanguages = ['de', 'es', 'fr', 'zh-cn'];
  const targetLocaleFiles = glob.sync(path.join(localesDir, '*.json'))
    .filter(file => {
      const langCode = path.basename(file, '.json');
      return langCode !== masterLanguageCode && supportedLanguages.includes(langCode);
    });

  let meaningfulChanges = 0;
  let hasMeaningfulChanges = false;

  for (const targetFile of targetLocaleFiles) {
    const targetLangCode = path.basename(targetFile, '.json');
    let targetContent = {};
    let fileExisted = await fs.pathExists(targetFile);

    if (fileExisted) {
      try {
        targetContent = await fs.readJson(targetFile);
        console.log(`\nProcessing target language: ${targetLangCode} (from ${targetFile})`);
      } catch (e) {
        console.warn(`Warning: Could not parse ${targetFile}. Starting fresh. Error: ${e.message}`);
        targetContent = {};
      }
    } else {
      console.log(`\nTarget file ${targetFile} not found. Will create for language: ${targetLangCode}.`);
    }

    const result = await processKeys(masterContent, targetContent, targetLangCode);

    if (checkOnly) {
      if (typeof result === 'number' && result > 0) {
        meaningfulChanges += result;
        hasMeaningfulChanges = true;
        console.log(`Found ${result} meaningful changes needed for ${targetLangCode}.json`);
      } else if (!fileExisted) {
        meaningfulChanges++;
        hasMeaningfulChanges = true;
        console.log(`Would create new file for ${targetLangCode}.json`);
      }
    } else {
      if (result || !fileExisted) {
        try {
          await fs.writeJson(targetFile, targetContent, { spaces: 2 });
          console.log(`Successfully ${result ? 'updated' : 'created'} ${targetFile}`);
        } catch (error) {
          console.error(`Error writing to ${targetFile}:`, error);
        }
      } else {
        console.log(`No changes needed for ${targetFile}`);
      }
    }
  }

  if (checkOnly) {
    if (hasMeaningfulChanges) {
      console.log(`\n⚠️  Found ${meaningfulChanges} meaningful translation changes needed.`);
      return 1;
    } else {
      console.log('\n✅ No meaningful translation changes needed.');
      return 0;
    }
  } else {
    console.log('\n✅ Translation synchronization complete (via DeepL).');
    return 0;
  }
}

// --- Main Function ---
async function main() {
  if (mode === 'content') {
    return await translateContent();
  } else if (mode === 'content-smart') {
    return await syncContentTranslations();
  } else if (mode === 'i18n') {
    return await syncI18nTranslations();
  } else {
    console.error(`❌ Invalid mode: ${mode}`);
    console.error(`Valid modes: content, content-smart, i18n`);
    process.exit(1);
  }
}

// --- CLI Usage ---
if (targetLang && !languages[targetLang]) {
  console.error(`❌ Unknown language: ${targetLang}`);
  console.error(`Available languages: ${Object.keys(languages).join(', ')}`);
  process.exit(1);
}

main()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    console.error("\n❌ An error occurred during translation:", error);
    process.exit(1);
  });
