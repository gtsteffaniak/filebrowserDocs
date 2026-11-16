---
title: "Setting Up i18n for Documentation"
description: "Step-by-step guide to enable multilingual support in your local docs"
icon: "language"
date: "2025-10-08T14:59:30Z"
lastmod: "2025-10-09T00:54:16Z"
---

# Setting Up i18n for Documentation

This guide walks you through setting up multilingual support for the FileBrowser Quantum documentation.

## Prerequisites

- Hugo and Sass/Dart Sass installed
- Access to the documentation repository
- Basic understanding of Hugo structure

## Step 1: Configure Languages

### Update hugo.toml

Add language configuration to your `hugo.toml`:

```toml
baseURL = 'https://filebrowserquantum.com/'
languageCode = 'en-us'
title = 'FileBrowser Quantum Docs'
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

[params]
  [params.docs]
    darkMode = true
    sidebarIcons = true
    titleIcon = true
    navDesc = true
```

## Step 2: Create Language Directories

### Create Directory Structure

```bash
# Create language-specific content directories
mkdir -p content/en/docs
mkdir -p content/de/docs
mkdir -p content/fr/docs
mkdir -p content/pt/docs

# Create i18n directory for translations
mkdir -p i18n
```

### Move Existing Content

```bash
# Move existing English content to en directory
mv content/docs/* content/en/docs/

# Remove old docs directory
rmdir content/docs
```

## Step 3: Create Translation Files

### Create i18n Files

Create `i18n/en.toml`:

```toml
[getting-started]
other = "Getting Started"

[configuration]
other = "Configuration"

[api-reference]
other = "API Reference"

[contributing]
other = "Contributing"

[search-placeholder]
other = "Search documentation..."

[read-more]
other = "Read more"

[last-updated]
other = "Last updated"

[table-of-contents]
other = "Table of Contents"

[previous]
other = "Previous"

[next]
other = "Next"

[home]
other = "Home"

[docs]
other = "Documentation"

[language]
other = "Language"

[theme]
other = "Theme"
```

Create `i18n/de.toml`:

```toml
[getting-started]
other = "Erste Schritte"

[configuration]
other = "Konfiguration"

[api-reference]
other = "API-Referenz"

[contributing]
other = "Mitwirken"

[search-placeholder]
other = "Dokumentation durchsuchen..."

[read-more]
other = "Weiterlesen"

[last-updated]
other = "Zuletzt aktualisiert"

[table-of-contents]
other = "Inhaltsverzeichnis"

[previous]
other = "Vorherige"

[next]
other = "Nächste"

[home]
other = "Startseite"

[docs]
other = "Dokumentation"

[language]
other = "Sprache"

[theme]
other = "Design"
```

Create `i18n/fr.toml`:

```toml
[getting-started]
other = "Premiers Pas"

[configuration]
other = "Configuration"

[api-reference]
other = "Référence API"

[contributing]
other = "Contribuer"

[search-placeholder]
other = "Rechercher dans la documentation..."

[read-more]
other = "Lire la suite"

[last-updated]
other = "Dernière mise à jour"

[table-of-contents]
other = "Table des matières"

[previous]
other = "Précédent"

[next]
other = "Suivant"

[home]
other = "Accueil"

[docs]
other = "Documentation"

[language]
other = "Langue"

[theme]
other = "Thème"
```

Create `i18n/pt.toml`:

```toml
[getting-started]
other = "Primeiros Passos"

[configuration]
other = "Configuração"

[api-reference]
other = "Referência da API"

[contributing]
other = "Contribuir"

[search-placeholder]
other = "Pesquisar documentação..."

[read-more]
other = "Ler mais"

[last-updated]
other = "Última atualização"

[table-of-contents]
other = "Índice"

[previous]
other = "Anterior"

[next]
other = "Próximo"

[home]
other = "Início"

[docs]
other = "Documentação"

[language]
other = "Idioma"

[theme]
other = "Tema"
```

## Step 4: Update Content Structure

### Create Language-Specific Index Files

Create `content/en/docs/_index.md`:

```markdown
---
title: "Documentation"
description: "Complete documentation for FileBrowser Quantum"
icon: "home"
---

Welcome to FileBrowser Quantum documentation.
```

Create `content/de/docs/_index.md`:

```markdown
---
title: "Dokumentation"
description: "Vollständige Dokumentation für FileBrowser Quantum"
icon: "home"
---

Willkommen bei der FileBrowser Quantum Dokumentation.
```

Create `content/fr/docs/_index.md`:

```markdown
---
title: "Documentation"
description: "Documentation complète pour FileBrowser Quantum"
icon: "home"
---

Bienvenue dans la documentation FileBrowser Quantum.
```

Create `content/pt/docs/_index.md`:

```markdown
---
title: "Documentação"
description: "Documentação completa para FileBrowser Quantum"
icon: "home"
---

Bem-vindo à documentação do FileBrowser Quantum.
```

## Step 5: Configure Language-Specific Menus

### Update hugo.toml with Menus

Add menu configuration to your `hugo.toml`:

```toml
[languages.en.menus]
  [[languages.en.menus.main]]
    name = 'Getting Started'
    pageRef = '/docs/getting-started'
    weight = 1
  [[languages.en.menus.main]]
    name = 'Configuration'
    pageRef = '/docs/configuration'
    weight = 2
  [[languages.en.menus.main]]
    name = 'API Reference'
    pageRef = '/docs/reference'
    weight = 3

[languages.de.menus]
  [[languages.de.menus.main]]
    name = 'Erste Schritte'
    pageRef = '/docs/getting-started'
    weight = 1
  [[languages.de.menus.main]]
    name = 'Konfiguration'
    pageRef = '/docs/configuration'
    weight = 2
  [[languages.de.menus.main]]
    name = 'API-Referenz'
    pageRef = '/docs/reference'
    weight = 3

[languages.fr.menus]
  [[languages.fr.menus.main]]
    name = 'Premiers Pas'
    pageRef = '/docs/getting-started'
    weight = 1
  [[languages.fr.menus.main]]
    name = 'Configuration'
    pageRef = '/docs/configuration'
    weight = 2
  [[languages.fr.menus.main]]
    name = 'Référence API'
    pageRef = '/docs/reference'
    weight = 3

[languages.pt.menus]
  [[languages.pt.menus.main]]
    name = 'Primeiros Passos'
    pageRef = '/docs/getting-started'
    weight = 1
  [[languages.pt.menus.main]]
    name = 'Configuração'
    pageRef = '/docs/configuration'
    weight = 2
  [[languages.pt.menus.main]]
    name = 'Referência da API'
    pageRef = '/docs/reference'
    weight = 3
```

## Step 6: Test the Setup

### Build and Serve

```bash
# Build the site
hugo

# Serve locally
hugo server

# Or use the makefile
make dev
```

### Verify Language Switching

1. **Open browser** to `http://localhost:1313`
2. **Check language switcher** in navigation
3. **Switch languages** and verify content loads
4. **Check URLs** - should include language prefix (e.g., `/de/docs/`)

## Step 7: Translate Content

### Method 1: Copy and Translate

```bash
# Copy English content to other languages
cp content/en/docs/getting-started.md content/de/docs/
cp content/en/docs/getting-started.md content/fr/docs/
cp content/en/docs/getting-started.md content/pt/docs/

# Edit each file with translations
```

### Method 2: Use Translation Tools

```bash
# Install translation tools (optional)
npm install -g @hugodocs/translation-helper

# Generate translation templates
hugo-translate content/en/docs/ --output-dir content/ --languages de,fr,pt
```

## Step 8: Advanced Configuration

### Custom Language Switcher

Add to your layout files:

```html
<!-- Language Switcher -->
<div class="language-switcher">
  {{ range .Site.Home.AllTranslations }}
    <a href="{{ .RelPermalink }}" 
       class="lang-link {{ if eq .Language.Lang $.Language.Lang }}active{{ end }}">
      {{ .Language.LanguageName }}
    </a>
  {{ end }}
</div>
```

### SEO Configuration

Add language-specific meta tags:

```toml
[languages.en.params]
  description = "FileBrowser Quantum - Modern file manager for the web"
  keywords = "file manager, web, self-hosted, filebrowser"

[languages.de.params]
  description = "FileBrowser Quantum - Moderne Dateiverwaltung für das Web"
  keywords = "dateimanager, web, selbst gehostet, filebrowser"
```

## Troubleshooting

### Common Issues

**Content not showing:**
- Check `contentDir` configuration
- Verify file paths match language directories
- Ensure front matter is correct

**Menu not translating:**
- Check language-specific menu configuration
- Verify translation keys in i18n files
- Use `T` function in menu templates

**Build errors:**
- Check TOML syntax in i18n files
- Verify language configuration
- Run `hugo --printI18nWarnings`

### Debug Commands

```bash
# Check for missing translations
hugo --printI18nWarnings

# Build with verbose output
hugo --verbose

# Check specific language
hugo --environment de
```

## Next Steps

- {{< doclink path="contributing/documentation/translations/" text="Translation Workflow" />}}
- [Hugo i18n Documentation](https://gohugo.io/content-management/multilingual/)
- [Lotus Docs i18n Support](https://lotusdocs.dev/)
- {{< doclink path="contributing/translations/" text="DeepL API Setup" />}}
