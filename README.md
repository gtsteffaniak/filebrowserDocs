# FileBrowser Quantum Documentation

A Hugo-based documentation for FileBrowser Quantum -- Automatically deploys to https://filebrowserquantum.com via github pages.

## Quick Start

### First Time Setup

```bash
make setup
```

This installs npm dependencies and checks for required tools.

### Run Development Server

```bash
make dev
```

Visit: `http://localhost:1313/`

The development server includes draft pages and live reloading.

### Build for Production

```bash
make build
```

Output is generated in the `dist/` directory (minified and optimized).

### View All Available Commands

```bash
make help
```

This displays all available make commands with descriptions.

## Documentation Standards

### Syntax

See [hugo syntax examples](content/en/docs/Contributing/Documentation/hugo-documentation.md) for formatting in hugo and see the [documentation page](https://filebrowserquantum.com/en/docs/contributing/documentation/hugo-documentation/) to see how it renders.

### Structure

```
content/en/docs/
├── _index.md                    # Documentation landing page
├── getting-started/             # Installation guides (Docker, Linux, macOS, Windows)
│   └── Migration/               # Migration guides
├── configuration/               # Configuration options
│   ├── Authentication/          # Auth methods (Password, OIDC, Proxy)
│   └── Frontend/                # UI customization (Branding, Styling, Themes)
├── access-control/              # Permissions and rules
├── shares/                      # Sharing features (Normal, Upload)
├── Integrations/                # Third-party integrations
│   ├── Media/                   # Media server integration
│   └── Office/                  # Office suite integration
├── user-guides/                 # How-to guides
│   ├── general-configuration/   # Init scripts & multiple configs
│   └── office-integration/      # Office integration examples
├── advanced/                    # Advanced features
│   └── logging/                 # Debug and troubleshooting logs
├── reference/                   # API, CLI, Environment Variables
├── Contributing/                # Contribution guidelines
│   ├── Documentation/           # Doc writing guides
│   ├── Features/                # Feature development
│   └── Translations/            # Translation guides
└── help/                        # FAQ, About, Roadmap
```

## Writing Documentation

### Create a New Page

```bash
hugo new content/en/docs/section/page-name.md
```

This will create a new page using the archetype template with all required front matter.

### Front Matter Template

Every documentation page requires the following front matter:

```yaml
---
title: "Page Title"
description: "Brief description (40-60 characters recommended)"
icon: "article"              # Material icon name
date: "2024-01-15T10:00:00Z"
lastmod: "2024-01-15T10:00:00Z"
draft: true                  # Set to false when ready to publish
toc: true                    # Enable table of contents
# order: 0                   # Optional: Manual ordering (positive=first, 0=default, negative=last)
---
```

### Automatic Ordering

The documentation uses **automatic ordering** based on file system structure:
- Pages are automatically ordered by their directory path
- Use the optional `order` field only when you need to override automatic ordering within a directory

**Order Field Examples:**
- `order: 1` - Page appears first in its directory
- `order: 2` - Page appears second in its directory listing
- `order: 0` or unset - Default alphabetical ordering
- `order: -1` - Page appears last in its directory

### Content Guidelines

- Use clear, concise language
- Include code examples with syntax highlighting
- Use doclink for relative links to other pages 
- Add troubleshooting sections where applicable
- Link to related pages
- Update `lastmod` field when making changes
- Use Material Design icons consistently

## Documentation Standards

### File Naming
- Lowercase with hyphens: `getting-started.md`
- Section index files: `_index.md`
- Use descriptive names that match the content

### Page Structure
1. **Title** (# H1) - Automatically generated from front matter
2. **Introduction** - Brief overview of the topic
3. **Main Sections** (## H2) - Primary content blocks
4. **Subsections** (### H3) - Detailed breakdowns
5. **Code Examples** - Practical demonstrations
6. **Troubleshooting** - Common issues and solutions
7. **Next Steps** - Links to related pages

### Code Blocks

Always use syntax highlighting:

```yaml
server:
  port: 80
  root: /data
```

```bash
./filebrowser -c config.yaml
```

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, FileBrowser!")
}
```

or with line numbers:
```
{{< highlight yaml "linenos=table" >}}
server:
  port: 8080
  sources:
    - path: "/data"
{{< /highlight >}}
```

### Available Shortcodes

**Custom Tabs and More:**
See [Hugo Documentation](content/en/docs/Contributing/Documentation/hugo-documentation.md) for complete shortcode reference.

## Theme

Custom theme based on [Lotus Docs](https://lotusdocs.dev/):
- Repository: https://github.com/quantumx-apps/filebrowserDocsTheme
- Local development: Theme is mounted via `go.mod` replace directive
- Features: Automatic ordering, dark mode, search, responsive design

## CI/CD & Quality Checks

### Automated Deployment

Documentation is deployed automatically on push to main branch via GitHub Actions.

### Comprehensive Validation System

This repository has a comprehensive validation system that runs the **same checks** both locally and in CI/CD. This ensures consistency and catches errors early.

#### Quick Start - Validation

```bash
# Run all validation checks (recommended before PR)
make check-all

# Quick validation (skip slow external link checks)
make check-quick

# Individual checks
make check-images           # Check image references
make check-translations     # Validate translations
make check-doclinks         # Check internal links
```

#### What Gets Validated

1. **YAML Front Matter Syntax** - Validates YAML in all markdown files
2. **Required Front Matter Fields** - Ensures title, description, icon are present
3. **Hugo Build (Strict)** - Builds with strict validation flags
4. **Hugo Audit** - Checks for:
   - Template execution errors (ZgotmplZ)
   - Nil pointer references
   - Raw HTML omissions
   - Missing translations
5. **Translation Validation** - Ensures translations are in sync
6. **Doclinks Validation** - Validates internal doclink shortcodes
7. **Internal Links** - Checks for broken relative links
8. **External Links** - Validates external URLs aren't dead (optional, slow)
9. **Image References** - Ensures all images exist
10. **TODO/FIXME Markers** - Warns about unfinished work

#### CI/CD Integration

The GitHub Actions workflow calls the **same makefile targets** you use locally, ensuring:
- ✅ No logic duplication between local and CI validation
- ✅ Test CI behavior locally before pushing
- ✅ Consistent results everywhere
- ✅ Easy to maintain and update

### Local Setup

**Install Dependencies:**
```bash
make setup
```

This installs:
- npm packages for translation/doclink scripts
- Hugo (extended version)
- Checks for `yq` (YAML validator)

**Run Validation:**
```bash
# Before every commit
make check-quick

# Before creating a PR
make check-all

# See all commands
make help
```

### Configuration Files

- `.github/workflows/pr-checks.yml` - PR validation workflow (calls makefile targets)
- `.github/workflows/validate-manual.yml` - Manual validation testing workflow
- `.github/workflows/static.yml` - Production deployment workflow
- `.htmltest.yml` - External link checker configuration

### Documentation

- [**`VALIDATION.md`**](VALIDATION.md) - Complete validation system documentation
- [**`.github/VALIDATION_QUICK_REFERENCE.md`**](.github/VALIDATION_QUICK_REFERENCE.md) - Quick reference card
- [**`.github/hooks/pre-commit.example`**](.github/hooks/pre-commit.example) - Optional pre-commit hook

### Pre-Commit Hook (Optional)

Automatically validate before every commit:

```bash
# Install the pre-commit hook
cp .github/hooks/pre-commit.example .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

This runs `make check-quick` before each commit and prevents committing if validation fails.

## Translation

Translations are managed with DeepL API integration. Set your API key first:

```bash
export DEEPL_API_KEY="your-api-key"
```

### Translation Commands

```bash
# Check translation status (no API calls)
make translate-check

# Sync all translations (content + i18n strings)
make translate

# Translate only content files
make translate-content

# Translate only i18n strings
make translate-i18n
```

Or use npm directly:
```bash
npm run translate:check
npm run translate
npm run translate:content
npm run translate:i18n
```

### Doclink Management

Convert between relative markdown links and Hugo doclink shortcodes:

```bash
# Convert relative links to doclink shortcodes
make doclinks-convert

# Check doclinks without modifying files
make doclinks-check

# Revert doclinks back to relative links
make doclinks-revert
```

## Contributing

### Documentation Contributions

1. Fork the repository
2. Create a feature branch (`git checkout -b my-improvement`)
3. Write/update documentation
   - Add new pages in `content/en/docs/`
   - Update `lastmod` field in front matter
   - Follow content guidelines above
4. Test locally with `make dev`
5. (NOT YET, please ignore) Run translation sync if you modified English content
6. Submit pull request with clear description

## Support

- Issues: https://github.com/gtsteffaniak/filebrowser/issues
- Discussions: https://github.com/gtsteffaniak/filebrowser/discussions

