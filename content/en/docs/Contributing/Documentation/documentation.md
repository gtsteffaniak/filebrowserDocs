---
title: "Documentation"
description: "Contribute to FileBrowser documentation"
icon: "article"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-03T16:40:00Z"
---

Help improve FileBrowser documentation using our Hugo-based structure.

## Documentation Structure

**Static Site Generator**: Hugo
**Theme**: Custom FileBrowser Docs Theme
**Deployment**: Auto-generated during releases
**Format**: Markdown with YAML front matter

## Repository Structure

```
docs/
├── content/docs/           # All documentation pages
├── layouts/               # Theme overrides
├── assets/               # Custom CSS/JS
└── hugo.toml             # Site configuration
```

## Creating New Pages

### 1. Add Page to Section

Create new markdown file in appropriate folder:
```bash
docs/content/docs/Configuration/new-page.md
```

### 2. Add Front Matter

```yaml
---
title: "Page Title"
description: "Brief description (40-60 chars)"
icon: "material_symbol_name"
---
```

### 3. Write Content

**No H1 headers** - Title comes from front matter. Use H2 (`##`) for sections.

```markdown
Brief introduction paragraph.

## Section Heading

Content here...

## Next Steps

- {{< doclink path="contributing/welcome/" text="Related topic" />}}
```

### 4. Test Locally

```bash
cd docs
hugo server
```

View at: `http://localhost:1313/docs/`

## Front Matter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Page title (appears in navigation and header) |
| `description` | Yes | Brief description (shows in next/prev cards) |
| `icon` | No | Material Symbol icon name |

## Icons

Uses [Material Symbols](https://fonts.google.com/icons). Search for icon, copy name, add to front matter: `icon: "settings"`

## Content Guidelines

- **Clear and concise**: Get to the point quickly
- **Actionable**: Provide steps users can follow
- **Examples**: Include code examples and configurations
- **Accurate**: Only document actual features (no speculation)

### Code Blocks

Use language-specific syntax highlighting:

````markdown
```yaml
http:
  port: 80
```

```bash
./filebrowser -c config.yaml
```
````

### Links

**Internal links**: Use absolute paths from `/docs/`
```markdown
{{< doclink path="configuration/" text="Configuration" />}}
```

**External links**: Use full URLs
```markdown
[GitHub Repository](https://github.com/gtsteffaniak/filebrowser)
```

## Documentation Best Practices

- **Keep descriptions brief**: 40-60 characters for navigation cards
- **Use consistent icons**: Related pages should use related icons
- **File structure matters**: Order is determined by file system structure
- **Cross-reference**: Add "Next Steps" section at the end

## Local Preview

Always preview changes locally before submitting:

```bash
cd docs
hugo server -D
```

Access at: `http://localhost:1313/docs/`

## Next Steps

- {{< doclink path="contributing/features/" text="Feature development" />}}
- {{< doclink path="contributing/translations/" text="Translation guide" />}}