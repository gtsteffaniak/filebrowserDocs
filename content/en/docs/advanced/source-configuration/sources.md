---
title: "Source Configuration"
description: "Understanding and configuring sources in FileBrowser Quantum"
icon: "storage"
date: "2025-10-17T21:34:59Z"
lastmod: "2026-08-24T17:05:51Z"
order: 1
---

## What are Sources?

Sources are the directories that FileBrowser Quantum makes available to users. Each source represents a filesystem path that can be browsed, searched, and managed through the web interface.

{{% alert context="warning" %}}
**v2.0.0 behavior change**

v2.0.0 **removed** source-level `indexingIntervalMinutes` (indexing always uses adaptive scheduling), the `config.conditionals` wrapper, and deprecated rule field names (`fileNames`, `folderNames`, top-level `hidden`). Use `config.rules` with `fileName`, `folderName`, and `ignoreHidden` on rule items. See {{< doclink path="advanced/source-configuration/conditional-rules/" text="Conditional rules" />}}.
{{% /alert %}}

{{% alert context="info" %}}
**Getting Started:** For basic usage, you only need to define the `path` and optionally set **defaultEnabled** to `true` so the source is granted to all users (on create and, from v2.0.1+, merged for existing users on every startup). Most other configuration options can be left at their defaults.
{{% /alert %}}

## Source Basics

### Unique Paths Required

Each source must have a **unique real filesystem path**. FileBrowser uses the actual resolved path on the filesystem to identify sources internally, not the name you assign.

```yaml
sources:
  - path: "/data"        # ✅ Valid
  - path: "/mnt/storage" # ✅ Valid - different path
  - path: "/data"        # ❌ Invalid - duplicate path
```

### Source Names

**Automatic naming:** If you don't specify a `name`, FileBrowser automatically assigns one based on the base folder name.

```yaml
sources:
  - path: "/mnt/documents"  # Name: "documents"
  - path: "/data/photos"    # Name: "photos"
```

**Custom naming:** You can specify a custom display name:

```yaml
sources:
  - path: "/mnt/documents"
    name: "Company Files"   # Custom name
```

{{% alert context="success" %}}
**Name Changes Safe:** You can change a source's `name` at any time. The backend matches sources by their real filesystem path, so existing access rules and shares will continue to work.
{{% /alert %}}

## Minimal Configuration

The simplest source configuration (same structure as `server.sources` in the generated reference `config.generated.yaml`):

```yaml
server:
  sources:
    - path: "/data"
      config:
        defaultEnabled: true
```

This creates a source that:
- Is available to all new users
- Has indexing enabled for advanced features
- Uses all default settings

### Reference: `config` and `rules`

The generated config lists every supported key. Under `config`, non-deprecated fields are:

| Field | Purpose |
|-------|---------|
| `denyByDefault` | Deny access unless an allow rule exists |
| `private` | No sharing for this source |
| `disabled` | Temporarily disable the source in config |
| `rules` | Per-path indexing and visibility rules (see {{< doclink path="advanced/source-configuration/conditional-rules/" text="Conditional Rules" />}}) |
| `defaultUserScope` | Initial path scope for new users (under `path`) |
| `defaultEnabled` | Grant this source to all users on create and (v2.0.1+) merge for existing users on startup |
| `useLogicalSize` | Use logical file sizes instead of disk usage (`du`-style); empty folders report as 0 bytes |

Example `rules` entry (field names match the generator):

```yaml
server:
  sources:
    - path: "/data"
      name: "My Files"
      config:
        defaultEnabled: true
        rules:
          - neverWatchPath: ""
            includeRootItem: ""
            fileStartsWith: ""
            folderStartsWith: ""
            fileEndsWith: ""
            folderEndsWith: ""
            folderPath: ""
            filePath: ""
            fileName: ""
            folderName: ""
            viewable: false
            ignoreHidden: false
            ignoreZeroSizeFolders: false
            ignoreSymlinks: false
```

## Indexing Overview

Sources are indexed by default, which enables:
- **Search functionality** - Fast full-text and filename search
- **Folder size calculations** - Accurate directory size reporting (also used for **indexed-size storage quotas (v2.1.x)**; use tracked usage when indexing is disabled — see {{< doclink path="features/quotas/" text="Storage quotas (v2.1.x)" />}})
- **Folder previews** - Thumbnail previews for image directories
- **Health monitoring** - Source statistics and health information

**Performance:** Indexing uses adaptive scanning intervals based on filesystem complexity. For typical filesystems (under 50,000 items), expect scan times under 30 seconds with minimal memory usage (100-300MB). Larger filesystems may require more resources but benefit from smart interval adjustments that reduce scan frequency.

For detailed indexing information, see {{< doclink path="features/indexing/" text="Understanding Indexing" />}}.

## Configuration Options

### `path` (required)

```yaml
path: "/data"
```

The filesystem path to the directory you want to serve. Can be absolute or relative, but must exist and be readable by FileBrowser.

### `name`

```yaml
name: "My Files"
```

Display name shown in the UI. If not specified, uses the base folder name from the path. Useful for providing user-friendly names like "Company Files" instead of just "documents".

### `defaultEnabled`

```yaml
config:
  defaultEnabled: true
```

Whether this source is automatically granted to users. Defaults to `false`.

When `true` (v2.0.1+):

- New users receive the source on create (including OIDC / LDAP / JWT / proxy auto-create).
- On every server startup, any existing user missing this source gets it merged into their scopes. Existing scope paths are preserved.

Set to `false` for sources that only admins should assign. See {{< doclink path="configuration/sources#defaultenabled" text="Sources: defaultEnabled" />}}.

### `denyByDefault`

```yaml
config:
  denyByDefault: true
```

Deny access unless an explicit "allow" access rule exists. Defaults to `false`. Use this for high-security sources where access must be explicitly granted per user or group.

{{% alert context="warning" %}}
When `denyByDefault: true`, users need explicit allow rules to access the source.
{{% /alert %}}

See {{< doclink path="access-control/access-control-overview/" text="Access Control Guide" />}} for more information.

### `private`

```yaml
config:
  private: true
```

Designate source as private, which disables sharing. Defaults to `false`. Use this to prevent users from creating public shares for sensitive data.

### `useLogicalSize`

```yaml
config:
  useLogicalSize: true
```

When `true`, sizes follow **logical** file size instead of on-disk allocation (similar intent to `du`). Empty folders report as **0 bytes**. Default is `false`.

### `defaultUserScope`

```yaml
config:
  defaultUserScope: "/subfolder"
```

Default scope path for new users created automatically via API or CLI. Defaults to `"/"` (root of source). This restricts where new users can access within the source. Include the leading slash.

Example placing users under a subfolder of the source:

```yaml
sources:
  - path: "/shared"
    config:
      defaultUserScope: "/users"
      defaultEnabled: true
```

New users are scoped under `/shared/users` (and receive a per-user directory there when applicable).

Creates `/home/john` for user `john` under the source path and scopes the user there.

### `disabled`

```yaml
config:
  disabled: true
```

Disable the source without removing it from config. Defaults to `false`. Useful for temporarily disabling a source for maintenance or testing. Users cannot access disabled sources.

## Common Configuration Patterns

### Single shared source

**Use case:** Simple shared file access.

```yaml
sources:
  - path: "/data"
    config:
      defaultEnabled: true
```

### Multi-user with personal directories

**Use case:** Each user gets private space.

```yaml
sources:
  - path: "/home"
    config:
      defaultEnabled: true
      defaultUserScope: "/"
```

### Departmental sources

**Use case:** Multiple departments with access control.

```yaml
sources:
  - path: "/dept/sales"
    name: "Sales"
  - path: "/dept/engineering"
    name: "Engineering"
```

Use access rules to control who sees what.

### Mixed public / private

**Use case:** Some sources public, others restricted.

```yaml
sources:
  - path: "/public"
    config:
      defaultEnabled: true
  - path: "/private"
    config:
      denyByDefault: true
      private: true
```

## Best Practices

1. **Start Simple** - Begin with minimal configuration and add options as needed
2. **Use Real Paths** - Always use absolute paths for production deployments
3. **Plan Access Control** - Design your access strategy before creating multiple sources
4. **Monitor Resources** - Watch memory/CPU usage after adding sources with large filesystems

## Next Steps

- {{< doclink path="advanced/source-configuration/conditional-rules/" text="Conditional Rules Guide" />}}
- {{< doclink path="access-control/access-control-overview/" text="Access Control" />}}
- {{< doclink path="features/indexing/" text="Understanding Indexing" />}}
- {{< doclink path="reference/fullconfig/" text="Full Config Reference" />}}
