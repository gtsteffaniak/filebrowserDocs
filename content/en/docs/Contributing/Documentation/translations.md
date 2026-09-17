---
title: "Translations & i18n"
description: "How to add and manage translations for the documentation"
icon: "translate"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-03-10T00:10:42Z"
---

{{% alert context="warning" %}}
Documentation is currently English only and this guide may change.
{{% /alert %}}

# Translations & i18n

This guide explains how to add and manage translations for the FileBrowser Quantum documentation using Hugo's multilingual mode.

{{% alert context="info" %}}
Looking for how to update FileBrowser application translations? See {{< doclink path="contributing/Translations/translations" text="Application Translations" />}}
{{% /alert %}}

## Overview

The documentation supports multiple languages using Hugo's i18n (internationalization) framework. This allows users to read the documentation in their preferred language.

## Current Language Support

- **English (en)** - Default language
- **German (de)** - Available
- **French (fr)** - Available
- **Portuguese (pt)** - Available

## How i18n Works in Hugo

Hugo's multilingual framework supports:

- **Single-host configuration** - All languages on one domain
- **Multi-host configuration** - Each language on its own domain
- **Content translation** - Translate pages and content
- **String translation** - Translate UI elements and messages
- **Localization** - Dates, numbers, currencies, percentages
- **Menu translation** - Localized navigation menus

## Content Translation Methods

### Method 1: Translation by File Name

Create separate files for each language with language codes as suffixes:

```
content/docs/
├── getting-started.en.md
├── getting-started.de.md
├── getting-started.fr.md
└── getting-started.pt.md
```

**Example:**
```markdown
<!-- getting-started.en.md -->
---
title: "Getting Started"
description: "Quick start guide"
icon: "rocket_launch"
---

# Getting Started

Welcome to FileBrowser Quantum!
```

```markdown
<!-- getting-started.de.md -->
---
title: "Erste Schritte"
description: "Schnellstart-Anleitung"
icon: "rocket_launch"
---

# Erste Schritte

Willkommen bei FileBrowser Quantum!
```

### Method 2: Translation by Content Directory

Organize content in language-specific directories:

```
content/
├── en/
│   └── docs/
│       └── getting-started.md
├── de/
│   └── docs/
│       └── getting-started.md
├── fr/
│   └── docs/
│       └── getting-started.md
└── pt/
    └── docs/
        └── getting-started.md
```

### Method 3: Translation Key (Advanced)

Use `translationKey` in front matter to link pages regardless of location:

```markdown
---
title: "Getting Started"
translationKey: "getting-started"
---

# Getting Started
```

## Configuration

### Language Configuration

Configure languages in `hugo.toml`:

```toml
defaultContentLanguage = 'en'

[languages]
  [languages.en]
    contentDir = 'content/en'
    languageName = 'English'
    weight = 1
    languageCode = 'en-US'

  [languages.de]
    contentDir = 'content/de'
    languageName = 'Deutsch'
    weight = 2
    languageCode = 'de-DE'

  [languages.fr]
    contentDir = 'content/fr'
    languageName = 'Français'
    weight = 3
    languageCode = 'fr-FR'

  [languages.pt]
    contentDir = 'content/pt'
    languageName = 'Português'
    weight = 4
    languageCode = 'pt-PT'
```

### Menu Translation

Configure language-specific menus:

```toml
[languages.en.menus]
  [[languages.en.menus.main]]
    name = 'Getting Started'
    pageRef = '/docs/getting-started'
    weight = 1

[languages.de.menus]
  [[languages.de.menus.main]]
    name = 'Erste Schritte'
    pageRef = '/docs/getting-started'
    weight = 1
```

## String Translation

### Translation Files

Store translated strings in `i18n/` directory:

```
i18n/
├── en.toml
├── de.toml
├── fr.toml
└── pt.toml
```

**Example `i18n/en.toml`:**
```toml
[getting-started]
other = "Getting Started"

[api-reference]
other = "API Reference"

[search-placeholder]
other = "Search documentation..."

[read-more]
other = "Read more"
```

**Example `i18n/de.toml`:**
```toml
[getting-started]
other = "Erste Schritte"

[api-reference]
other = "API-Referenz"

[search-placeholder]
other = "Dokumentation durchsuchen..."

[read-more]
other = "Weiterlesen"
```

### Using Translations in Templates

Use the `T` function to translate strings:

```html
<!-- In templates -->
<h1>{{ T "getting-started" }}</h1>
<input placeholder="{{ T "search-placeholder" }}">
<a href="#">{{ T "read-more" }}</a>
```

### Using Translations in Content

Use Hugo's built-in `i18n` function in templates:

```go
{{ i18n "getting-started" }}
{{ i18n "search-placeholder" }}
```

## Adding a New Language

### Step 1: Configure Language

Add the new language to `hugo.toml`:

```toml
[languages]
  [languages.es]
    contentDir = 'content/es'
    languageName = 'Español'
    weight = 5
    languageCode = 'es-ES'
```

### Step 2: Create Translation Files

Create `i18n/es.toml`:

```toml
[getting-started]
other = "Primeros Pasos"

[api-reference]
other = "Referencia de API"

[search-placeholder]
other = "Buscar documentación..."
```

### Step 3: Translate Content

Create translated content files:

```markdown
<!-- content/es/docs/getting-started.md -->
---
title: "Primeros Pasos"
description: "Guía de inicio rápido"
icon: "rocket_launch"
---

# Primeros Pasos

¡Bienvenido a FileBrowser Quantum!
```

### Step 4: Update Menus

Add language-specific menu entries:

```toml
[languages.es.menus]
  [[languages.es.menus.main]]
    name = 'Primeros Pasos'
    pageRef = '/docs/getting-started'
    weight = 1
```

## Translation Workflow

### For Content Translators

1. **Choose a page to translate**
2. **Create translated version** using one of the methods above
3. **Update front matter** with translated title and description
4. **Translate content** while preserving Markdown formatting
5. **Test the translation** using `make dev`

### For String Translators

1. **Identify missing strings** using `hugo --printI18nWarnings`
2. **Add translations** to appropriate `i18n/*.toml` files
3. **Test translations** in the browser

### For Maintainers

1. **Review translations** for accuracy and consistency
2. **Update language configuration** when adding new languages
3. **Maintain translation files** and keep them synchronized

## Best Practices

### Content Translation

- **Preserve formatting** - Keep markdown structure intact
- **Maintain consistency** - Use consistent terminology
- **Update regularly** - Keep translations current with source
- **Test thoroughly** - Verify all links and references work

### String Translation

- **Use descriptive keys** - Make translation keys meaningful
- **Group related strings** - Organize translations logically
- **Provide context** - Add comments for complex translations
- **Handle plurals** - Use Hugo's pluralization features

### Technical Considerations

- **URL structure** - Consider localized URLs for better SEO
- **Asset management** - Handle language-specific assets
- **Search functionality** - Ensure search works across languages
- **Performance** - Consider build time with multiple languages

## Tools and Resources

### Translation Tools

- **DeepL API** - For automatic translation (see contributing guide)
- **Google Translate** - For quick reference
- **Native speakers** - For accurate, natural translations

### Hugo i18n Documentation

- [Hugo Multilingual Mode](https://gohugo.io/content-management/multilingual/)
- [i18n Template Functions](https://gohugo.io/functions/i18n/)
- [Language Configuration](https://gohugo.io/content-management/multilingual/#configure-languages)

### Theme i18n Support

The Lotus Docs theme supports:
- **Automatic language detection**
- **Language switcher** in navigation
- **RTL language support**
- **Localized date/time formatting**

## Troubleshooting

### Common Issues

**Missing translations:**
```bash
hugo --printI18nWarnings | grep i18n
```

**Build errors:**
- Check language configuration in `hugo.toml`
- Verify translation file syntax
- Ensure content files have correct front matter

**Menu not translating:**
- Check language-specific menu configuration
- Verify translation keys in `i18n/*.toml` files
- Use `T` function in menu templates

### Getting Help

- **Check existing translations** - Look at completed language files
- **Use translation tools** - DeepL API for automatic translation
- **Ask community** - GitHub discussions for translation help
- **Review theme docs** - Lotus Docs i18n documentation

## Example: Complete Translation

Here's a complete example of translating a page:

**Source (English):**
```markdown
---
title: "Docker Installation"
description: "Install FileBrowser using Docker"
icon: "square"
---

# Docker Installation

Install FileBrowser Quantum using Docker containers.

## Quick Start

```bash
docker run -p 8080:8080 ghcr.io/gtsteffaniak/filebrowser:stable
```
```

**Translation (German):**
```markdown
---
title: "Docker-Installation"
description: "FileBrowser mit Docker installieren"
icon: "square"
---

# Docker-Installation

Installieren Sie FileBrowser Quantum mit Docker-Containern.

## Schnellstart

```bash
docker run -p 8080:8080 ghcr.io/gtsteffaniak/filebrowser:stable
```
```

**Translation (French):**
```markdown
---
title: "Installation Docker"
description: "Installer FileBrowser avec Docker"
icon: "docker"
---

# Installation Docker

Installez FileBrowser Quantum en utilisant des conteneurs Docker.

## Démarrage rapide

```bash
docker run -p 8080:8080 ghcr.io/gtsteffaniak/filebrowser:stable
```
```

## Next Steps

- {{< doclink path="contributing/documentation/hugo-documentation/" text="Hugo Documentation" />}}
- {{< doclink path="contributing/documentation/documentation/" text="Translation Guidelines" />}}
- {{< doclink path="contributing/translations/" text="DeepL API Setup" />}}
