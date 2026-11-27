---
title: "Interface Options"
description: "Change characteristics of the UI"
icon: "tune"
date: "2025-10-08T14:59:30Z"
lastmod: "2025-11-09T23:00:24Z"
---

Show or hide specific UI elements.

## Configuration

```yaml
frontend:
  disableDefaultLinks: false   # hides the default filebrowser links on the sidebar
  disableUsedPercentage: false # hides the used-percentage bar for each source on the sidebar
  disableNavButtons: false     # disables nav buttons on the header bar for clean minimalistic look
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `disableDefaultLinks` | `false` | Hide default sidebar links |
| `disableUsedPercentage` | `false` | Hide storage usage indicators |
| `disableNavButtons` | `false` | Hide back/forward navigation buttons |

{{% alert context="warning" %}}
**Access to sidebar is limited when `disableNavButtons` is `true`**

The `disableNavButtons` governs visibility of the left hamburger menu in the top navigation – when set to `true`, the sidebar cannot be revealed in either of the following scenarios: (1) on a narrow screens (mobile responsive view) OR (2) if `userDefaults.sidebar.sticky` is set to `false`.
{{% /alert %}}

## Disable Default Links

Hide built-in sidebar links:

```yaml
frontend:
  disableDefaultLinks: true
```

### Default Links

<img src="../images/sidebar-links-default.jpg" width=300px>

## Disable Used Percentage

Hide storage usage indicators for sources:

```yaml
frontend:
  disableUsedPercentage: true
```

Useful when disk usage info is not relevant or accurate.

## Disable Nav Buttons

Hide back/forward navigation buttons:

```yaml
frontend:
  disableNavButtons: true
```

Creates cleaner, simpler interface.

## Examples

### Minimal Interface

```yaml
frontend:
  disableDefaultLinks: true
  disableUsedPercentage: true
  disableNavButtons: true
```

### Custom Links Only

```yaml
frontend:
  disableDefaultLinks: true
  externalLinks:
    - text: "Home"
      title: "Go home"
      url: "https://company.com"
    - text: "Support"
      title: "Get help"
      url: "https://support.company.com"
```

## Next Steps

- {{< doclink path="configuration/frontend/branding/" text="Configure branding" />}}
- {{< doclink path="configuration/frontend/styling/" text="Configure styling" />}}

