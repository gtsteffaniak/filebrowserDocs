---
title: "Translations"
description: "Update and improve language translations on FileBrowser Quantum"
icon: "translate"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-11-25T00:00:00Z"
---

Thanks for helping bring FileBrowser to more languages!

{{% alert context="info" %}}
Looking for how to update FileBrowser documentation translations? See {{< doclink path="contributing/documentation/translations" text="Application Translations" />}}
{{% /alert %}}

## Quick Start

Fixing a translation? Edit your language file (e.g. `es.json`), keep `{placeholders}` as they are, then open a pull request. The GitHub web editor works fine for this.

If you're a translator see [Improve an existing translation](#improve-an-existing-translation) and [Supported Languages](#supported-languages). The rest is mainly for contributors who change the code. 

## Translation Files

Language files are located at [frontend/src/i18n/locales/](https://github.com/gtsteffaniak/filebrowser/tree/main/frontend/src/i18n/locales). The master file is `en.json` - all other languages derive from this.

Keys are addressed with dots (e.g. `errors.notFound`), and `{count}` is a placeholder:

```json
{
  "errors": {
    "notFound": "This location can't be reached."
  },
  "prompts": {
    "deleteMessageMultiple": "Are you sure you want to delete {count} file(s)?"
  }
}
```

The rest of the i18n code lives next to it in `frontend/src/i18n/`:

- `index.ts`: contains the typed `t()` helpers, locale detection and loading.
- `locales.ts`: contains the list of languages. Every `.json` file in `locales/` must be listed here.
- `messages.generated.ts`: auto-generated from `en.json` by running `npm run i18n:types` (which runs our scripts).

Our i18n scripts are located in `frontend/scripts/i18n/`.

## Setup

You have 2 ways:

1. If you only want to be able to run the commands locally:

    - Install `Node` and `npm` (see [frontend/package.json](https://github.com/gtsteffaniak/filebrowser/blob/main/frontend/package.json)).
    - Then run `npm ci` in `frontend/`.

2. If you want to verify your changes in UI by running the server, follow [CONTRIBUTING](https://github.com/gtsteffaniak/filebrowser/blob/main/CONTRIBUTING.md) pre-requisites and setup.

To translate new keys automatically (with `i18n:sync`), you also need a DeepL API key:

1. Create a free account at [DeepL](https://www.deepl.com/en/your-account)
2. Get the API token from the account dashboard
3. Set the environment variable: `export DEEPL_API_KEY="your-api-key-here"`

You can run `i18n:types`, `i18n:cleanup` and `i18n:reorder` without an API token since those don't need it.

## Commands

This is a quick table explaining what each command does. The `npm` commands run from `frontend/` and `make` from the repository root.

| npm | make | What it does |
|---|---|---|
| `npm run i18n:types` | `make generate-translation-types` | Regenerates `messages.generated.ts` only (no DeepL) |
| `npm run i18n:sync` | `make sync-translations` | Regenerates `messages.generated.ts`, translates new keys for all the locales, then reorders them to follow `en.json` (needs `DEEPL_API_KEY`) |
| `npm run i18n:cleanup` | `make cleanup-translations` | Regenerates the types and removes keys that are no longer in `en.json` (no DeepL) |
| `npm run i18n:reorder` | `make reorder-translations` | Regenerates the types and reorders every locale to follow `en.json`, new keys are skipped (no DeepL) |
| `npm run i18n:check` | `make check-translations` | Runs the i18n checks without modifying any file, see [Checks](#checks) |
| `npm run i18n:check:strict` | | Is the same as `i18n:check`, but also lists every `$t` and `vue-i18n` import left in any file (including JavaScript) |
| `npm run lint` | | Biome only |
| | `make lint-frontend` | Biome, then `i18n:check`, then `vue-tsc` |
| `npm run typecheck` | | `vue-tsc`, checks the keys and params of `t()` in TypeScript |

## How to update translations

**Finding keys**: Search existing text in the language files or check the corresponding `*.vue` files in `frontend/src/`.

### Improve an existing translation

1. Open your language file in `frontend/src/i18n/locales/` (e.g. `es.json` for Spanish).
2. Find and update the translation you want to change, keeping every `{placeholder}` as it is in `en.json`.
3. Run `npm run i18n:check` in `frontend/` to check everything is fine.
4. Open your Pull Request.

### Add a new language

1. Start from a fresh copy of `en.json`, add it to `frontend/src/i18n/locales/<file>.json`, and translate every key, keeping every `{placeholder}`. Untranslated English keys pass the checks, so make sure none are left. With a DeepL key you can start from an empty file with just `{}` and run `make sync-translations` instead.

2. Add it to `locales` in `frontend/src/i18n/locales.ts`, in alphabetical order:

   ```ts
   ptBR: { name: 'Português (Brasil)', file: 'pt-br', tag: 'pt-br' },
   ```

   - the key (`ptBR`) is the `id` saved in the user settings.
   - `name` is what to display in UI.
   - `file` is the filename without extension.
   - `tag` is the lowercase BCP 47 tag matching `navigator.language`.

3. (Optional) If DeepL's target code isn't the file name in uppercase, add it to `DEEPL_LANGUAGES` in `frontend/scripts/i18n/sync.ts`, so `make sync-translations` can translate future keys.
4. Run `npm run i18n:check` to verify all is fine.
5. Open your Pull Request

### Add new translation fields

When adding code that needs a new key

1. Add the key to `en.json` (master file)
2. Run `make sync-translations` to translate it into every language (needs DeepL, see [Setup](#setup)). If you don't have DeepL, you can run `make generate-translation-types` and translate the keys you added by hand in each locale.
3. Use the key in code through the typed helpers (see [Typed i18n](#typed-i18n)).
5. Verify all is fine by running `make lint-frontend` (or `npm run i18n:check` with `npm run typecheck`).

### Delete a translation

1. Delete the key from `en.json`
2. Run `make cleanup-translations` (or `make sync-translations`) to remove it from all other files and regenerate the types
3. Run `make check-translations`

### Change a translation for all languages

`make sync-translations` only translates missing keys, so changing the English text alone leaves the old translation in every other language, so you need to delete the key first:

1. Delete the key from `en.json` and run `make cleanup-translations`
2. Add the key back to `en.json` with the new text
3. Run `make sync-translations` to translate it into every language
4. Verify with `make check-translations`

## Typed i18n

`t()` is type-checked against `en.json`, so: an unknown key, a missing or unknown param makes `vue-tsc` fail instead of show a raw key in the UI. The types come from `messages.generated.ts`, check [Commands](#commands) for how to regenerate it.

In TypeScript components (`<script setup lang="ts">`), use `useI18n()` from `@/i18n/index.ts` (not from `vue-i18n` directly), in both script and template:

```vue
<script setup lang="ts">
import { useI18n } from "@/i18n/index.ts";

const { t } = useI18n();
const message = t("prompts.deleteMessageMultiple", { count: 3 });
</script>

<template>
  <button>{{ t("general.cancel") }}</button>
</template>
```

Outside components, use `i18n.global.t`:

```ts
import i18n from "@/i18n/index.ts";

i18n.global.t("general.login");
```

- **Params:** Named placeholders such as `{count}` must be passed: `t("key", { count })`. `{suffix}` and `{prefix}` are decorative/optional, so callers may omit them.

- **Message syntax:** Messages can only use `{name}` placeholders, plus vue-i18n's literal interpolation (like `{'|'}` to print a pipe or an at sign). The plural separator `|`, linked messages (`@:` and `@.`) and any other braces are rejected by the generator.

- **Plain JS and Options API:** Components that aren't TypeScript yet may keep `$t('key')`. But `vue-tsc` cannot see them, so `npm run i18n:check` validates the literal keys and params in those files instead. If you're curious use `npm run i18n:check:strict` to see how many things we have left to migrate.

### Keys Stored in Data

A string stored in an object is widened to `string`, which `t()` rejects. Type the field as `PlainMessageKey` and pass the key as a plain literal:

```ts
import { type PlainMessageKey, useI18n } from "@/i18n/index.ts";

const sections: { id: string; title: PlainMessageKey }[] = [
  { id: "dirs", title: "general.folders" },
  { id: "files", title: "general.files" },
];

// template: {{ t(section.title) }}
```

## Best Practices

### Consolidate Translation Keys

If keys are simple words, consider adding them to `general` instead so they can be more generally used across the application.

### Pass Keys as Literals

All the keys must be string literals, so the tooling can check them and find unused ones, so procure choose between literals instead of building a key.

<div class="comparison-grid">
  <div class="comparison-card good-format">
    <h4>✅ Do this</h4>

```ts
const { t } = useI18n();

const label = computed(() =>
  numFiles.value === 1
    ? t("general.file")
    : t("general.files"),
);
```
  </div>

  <div class="comparison-card bad-format">
    <h4>❌ No</h4>

```ts
// every line fails i18n:check:
// "dynamic translation key"
t("general." + name);
t(`general.${name}`);

const key: string = getKey();
t(key);
```
  </div>
</div>

### Use the Typed Helpers

Import `useI18n` from `@/i18n/index.ts`, not from `vue-i18n`, and use `t()` instead of `$t()` in TypeScript Composition API components. It's the same, but `t()` is checked against `en.json`.

<div class="comparison-grid">
  <div class="comparison-card good-format">
    <h4>✅ Our import and <code>t()</code></h4>

```vue
<script setup lang="ts">
import { useI18n } from "@/i18n/index.ts";

const { t } = useI18n();
t("general.typo"); // vue-tsc error
</script>

<template>
  <button>{{ t("general.cancel") }}</button>
</template>
```
  </div>

  <div class="comparison-card bad-format">
    <h4>❌ <code>vue-i18n</code> and <code>$t()</code></h4>

```vue
<script setup lang="ts">
// i18n:check fails, import useI18n
// from "@/i18n/index.ts" instead
import { useI18n } from "vue-i18n";

const { t } = useI18n();
t("general.typo"); // raw key in the UI
</script>

<template>
  <!-- i18n:check fails, use t() -->
  <button>{{ $t("general.cancel") }}</button>
</template>
```
  </div>
</div>

Also:

- Don't pass `$t` around as a value (e.g. `helper(this.$t)`), you must call `t()` with a literal key where is needed instead.
- Don't edit `messages.generated.ts` or add keys to a locale that aren't in `en.json`.
- Don't rename or drop a `{placeholder}` in a translation, `i18n:check`.

### Choose Translation-Friendly Terms

Keep translations in mind when choosing words and terms. Select terminology that will translate well across different languages. For example, use "URL" or "hyperlink" instead of "link".

## Checks

`npm run i18n:check` runs all the checks below and reports every problem it finds at once. Will never modify a file, so it's safe to run at any time. It's part of `make lint-frontend` and also runs in CI.

1. **Locale list**: Every file in `locales/` should be listed in `src/i18n/locales.ts`, and every entry there has its file.
2. **Translations in sync**: Every locale has all the keys of `en.json` (not empty) and there's no obsolete keys.
3. **Key order**: The keys of every locale are in the same order as `en.json`.
4. **Generated types**: `messages.generated.ts` matches `en.json`.
5. **Placeholders**: Each locale uses the same `{placeholders}` as `en.json` (`{suffix}` and `{prefix}` are optional) and no unsupported message syntax.
6. **Typed usage**:
   - No `$t` or `vue-i18n` imports in TypeScript.
   - No `$t` passed around as a value in JS.
   - No dynamic keys.
   - Every literal key and params object passed to `t()`, `$t()`, `this.$t()` or `i18n.global.t()` is valid.
7. **Unused keys**: Every key of `en.json` needs to be used somewhere in `src/`. Comments and `<style>` blocks are ignored.
8. **Raw text**: `.vue` templates contain no plain text with letters, and no literal `placeholder`, it goes through `t()`.

```html
<p>{{ t("general.cancel") }}</p>             <!-- ok -->
<p>Cancel</p>                                <!-- raw text -->
<input :placeholder="t('general.search')" /> <!-- ok -->
<input placeholder="Search" />               <!-- raw text -->
<input placeholder="t('general.search')" />  <!-- missing colon: a plain string, t() is never called -->
```

### What gets ignored

- Test files: they aren't checked for typed usage, most of them mock `t` with throwaway keys. If only _one_ test has a i18n key, it will count a unused.
- Raw text inside `<i>`, `<kbd>`, `<v-icon>` (icons and keyboard shortcuts), and any element that contains the class `material-symbols`.
- Text without letters (symbols, numbers), expressions inside `{{ }}` (only a bare string literal with letters is flagged) and attribute values other than `placeholder`, `title` and `alt`.
- Comments.

For any other text that must stay untranslated, you can add a comment `<!-- i18n-ignore -->` before the node:

```html
<!-- i18n-ignore -->
<span class="size-label">{{ editorFontSize }}px</span>
```

## Supported Languages

Supported languages are limited to those supported by DeepL. To add one, follow [Add a new language](#add-a-new-language):

- Arabic (`ar.json`)
- Bulgarian (`bg.json`)
- Czech (`cz.json`)
- German (`de.json`)
- Greek (`el.json`)
- English (`en.json`) - master file
- Spanish (`es.json`)
- Basque (`eu.json`)
- Finnish (`fi.json`)
- French (`fr.json`)
- Hebrew (`he.json`)
- Hungarian (`hu.json`)
- Italian (`it.json`)
- Japanese (`ja.json`)
- Korean (`ko.json`)
- Dutch (`nl.json`)
- Dutch (Belgium) (`nl-be.json`)
- Polish (`pl.json`)
- Portuguese (Brazil) (`pt-br.json`)
- Portuguese (`pt.json`)
- Romanian (`ro.json`)
- Russian (`ru.json`)
- Slovak (`sk.json`)
- Swedish (`sv-se.json`)
- Turkish (`tr.json`)
- Ukrainian (`ua.json`)
- Chinese Simplified (`zh-cn.json`)
- Chinese Traditional (`zh-tw.json`)

## Next Steps

- {{< doclink path="contributing/features/" text="Feature development" />}}
- {{< doclink path="contributing/documentation/" text="Documentation guide" />}}

<style>
/* Comparison Grid */
.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5em;
  margin: 2em 0;
}

.comparison-card {
  padding: 1.5em;
  border-radius: 8px;
  border: 2px solid var(--gray-300);
}

.comparison-card.good-format {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.comparison-card.bad-format {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.comparison-card h4 {
  margin-top: 0;
  margin-bottom: 1em;
  font-size: 1.1em;
}

.comparison-card.good-format h4 {
  color: #10b981;
}

.comparison-card.bad-format h4 {
  color: #ef4444;
}

/* Dark mode support */
[data-dark-mode] .comparison-card {
  border-color: var(--gray-700);
}

[data-dark-mode] .comparison-card.good-format {
  border-color: #059669;
  background: rgba(5, 150, 105, 0.1);
}

[data-dark-mode] .comparison-card.bad-format {
  border-color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .comparison-grid {
    grid-template-columns: 1fr;
  }
}
</style>