// converts the issue/pr numbers that are surrounded by parenthesis like (#1234) to GH issue/pr links and adds a pr/issue text.
// it works without a GH token too, but the token is only needed if you got rate-limited.
// basically does all of this (for example):
//
// (#1234) -> ([issue #1234](https://github.com/owner/repo/issues/1234)) -- or pr/discussion if the link is that
// @user -> [@user](https://github.com/user)
// v2.0.5-beta -> [v2.0.5-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v2.0.5-beta)
// https://github.com/gtsteffaniak/filebrowser/compare/v1.3.4-beta...v1.3.5-beta -> [v1.3.4-beta...v1.3.5-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.3.4-beta...v1.3.5-beta)

import fs from 'fs-extra';

const FILES = [
  'content/en/docs/changelog/stable.md',
  'content/en/docs/changelog/beta.md',
];

const args = process.argv.slice(2);
const checkOnly = args.includes('--check') || args.includes('-c');
const GH_API_TOKEN = checkOnly ? '' : (process.env.GH_API_TOKEN || '');
const REPO_OWNER = 'gtsteffaniak';
const REPO_NAME = 'filebrowser';
const RELEASE_TAG = /(\[[^\]]*\]\([^)]*\)|https?:\/\/\S+)|\b(v\d+\.\d+\.\d+-(?:stable|beta))\b/g;
const PATTERN = /(?<!\])\(#(\d+)\)/g;
const MENTIONS = /(?<![\w[/])@([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})?)/g;
// to compare diff urls in the 'full changelog' part
const COMPARE_URL_PATTERN = new RegExp(`(?<!\\]\\()https://github\\.com/${REPO_OWNER}/${REPO_NAME}/compare/([^\\s]+)`,'g');
const ISSUE_URL_PATTERN = new RegExp(`(?<!\\]\\(|[<"'=])https://github\\.com/${REPO_OWNER}/${REPO_NAME}/(pull|issues|discussions)/(\\d+)(?![\\w/#?])`, 'g');

// to skip hugo shortcodes sorrounded by `{{ }}` (just in case)
// and code blocks and content with backticks
function isSkippable(content) {
  return content.split(/(\{\{<[\s\S]*?>\}\}|```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`|\[[^\]]*\]\([^)]*\))/g);
}
function isShortcode(index) {
  return index % 2 === 1;
}
function labelFor(kind) {
  return kind === 'pull' ? 'pr' : kind === 'discussions' ? 'discussion' : 'issue';
}
function convertDirectLinks(content) {
  return content.replace(ISSUE_URL_PATTERN, (url, kind, num) => {
    return `[${labelFor(kind)} #${num}](${url})`;
  });
}

// Compare tht refs/tags never end in punctuation and trim anything trailing
function convertCompareLinks(content) {
  return content.replace(COMPARE_URL_PATTERN, (fullMatch, ref) => {
    const trailing = ref.match(/[.,;:!?)\]]+$/)?.[0] ?? '';
    const cleanRef = trailing ? ref.slice(0, -trailing.length) : ref;
    const cleanUrl = trailing ? fullMatch.slice(0, -trailing.length) : fullMatch;
    return `[${cleanRef}](${cleanUrl})${trailing}`;
  });
}

function convertReleaseTags(content) {
  return content.replace(RELEASE_TAG, (fullMatch, protectedMatch, tag) => {
    if (protectedMatch) return protectedMatch;
    return `[${tag}](https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/${tag})`;
  });
}

function convertMentions(content) {
  return content.replace(MENTIONS, (fullMatch, username) => {
    return `[@${username}](https://github.com/${username})`;
  });
}

function extractNumbers(content) {
  return [...new Set([...content.matchAll(PATTERN)].map((m) => m[1]))];
}

function needsChanges(content) {
  const parts = isSkippable(content);
  return parts.some((part, i) => {
    if (isShortcode(i)) return false;
    return (
      extractNumbers(part).length > 0 ||
      convertDirectLinks(part) !== part ||
      convertCompareLinks(part) !== part ||
      convertReleaseTags(part) !== part ||
      convertMentions(part) !== part
    );
  });
}

// returns null if not found
async function resolveType(number) {
  for (const kind of ['issues', 'discussions']) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/${kind}/${number}`;
    const headers = { Accept: 'application/vnd.github+json' };
    if (GH_API_TOKEN) headers.Authorization = `Bearer ${GH_API_TOKEN}`;
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 10000);
    try {
      let res;
      try {
        res = await fetch(url, { headers, signal: controller.signal });
      } catch (networkError) {
        console.warn(`⚠️ Error resolving #${number}: ${networkError.message}`);
        throw networkError;
      }
      if (res.status === 403 || res.status === 429) {
        console.warn(`⚠️ Seems like you got rate limited - leaving #${number} unlinked`);
        return null;
      }
      if (res.status === 404) continue;
      if (!res.ok) {
        throw new Error(`GitHub returned ${res.status} ${res.statusText} for #${number}`);
      }
      if (kind === 'issues') {
        const data = await res.json();
        return data.pull_request ? 'pull' : 'issues';
      }
      return 'discussions';
    } finally {
      clearTimeout(timeout);
    }
  }
  return null;
}

async function convert(content) {
  const parts = isSkippable(content);
  const textParts = parts.filter((_, i) => !isShortcode(i));
  const numbers = new Set(textParts.flatMap(extractNumbers));
  const types = {};
  for (const num of numbers) {
    types[num] = await resolveType(num);
  }
  return parts
    .map((part, i) => {
      if (isShortcode(i)) return part;
      let converted = convertCompareLinks(part);
      converted = convertDirectLinks(converted);
      converted = convertReleaseTags(converted);
      converted = convertMentions(converted);
      return converted.replace(PATTERN, (fullMatch, num) => {
        const type = types[num];
        if (!type) return fullMatch; // don't do anything if couldn't resolve
        return `([${labelFor(type)} #${num}](https://github.com/${REPO_OWNER}/${REPO_NAME}/${type}/${num}))`;
      });
    }).join('');
}

async function processFile(filePath) {
  if (!(await fs.pathExists(filePath))) {
    throw new Error(`⚠️ File not found: ${filePath}`);
  }
  const original = await fs.readFile(filePath, 'utf8');

  if (checkOnly) {
    if (!needsChanges(original)) {
      console.log(`☑️ ${filePath} - no changes needed!`);
      return false;
    }
    console.log(`⚠️ ${filePath} - needs some changes`);
    return true;
  }

  const updated = await convert(original);
  if (updated === original) {
    console.log(`☑️ ${filePath} - no changes needed!`);
    return false;
  }
  await fs.writeFile(filePath, updated, 'utf8');
  console.log(`✅ ${filePath} - updated`);
  return true;
}

async function main() {
  if (!GH_API_TOKEN && !checkOnly) { console.log('ℹ️ No GH_API_TOKEN set, you can be rate-limited by GH'); }
  if (checkOnly) { console.log('No files will be modified\n'); }
  console.log('Processing changelog files...\n');

  let anyChanges = false;
  for (const file of FILES) {
    const changed = await processFile(file);
    anyChanges = anyChanges || changed;
  }
  console.log(checkOnly ? '✅ Check completed' : '✅ Changelogs updated');
  if (checkOnly && anyChanges) process.exitCode = 1;
  return anyChanges;
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
