---
title: "Conditional Rules"
description: "Control which files and folders are indexed using conditional rules"
icon: "rule"
date: "2025-10-17T21:34:59Z"
lastmod: "2026-08-24T17:05:51Z"
---

## Overview

Conditional rules allow you to control which files and folders are indexed by FileBrowser Quantum. Use rules to exclude system files, temporary directories, or large archives while keeping your UI clean and search results relevant.

{{% alert context="warning" %}}
**v2.0.0 behavior change**

The `conditionals` wrapper on source `config` was **removed** in v2.0.0 — configure rules directly under `config.rules`. Deprecated field names (`fileNames`, `folderNames`, top-level `hidden`) are no longer accepted; use `fileName`, `folderName`, and `ignoreHidden` on rule items.
{{% /alert %}}

## Basic Structure

Rules are configured directly under `rules` in your source configuration:

```yaml
sources:
  - path: "/data"
    config:
      rules:
        - folderPath: "excluded"
        - fileName: ".DS_Store"
          ignoreHidden: true
```

## Global flags

Items such as `ignoreHidden`, `ignoreZeroSizeFolders`, and `ignoreSymlinks` can now be used as a global flag by not specifying a rule name like:


```yaml
sources:
  - path: "/data"
    config:
      rules:
        - folderPath: "/"             # (global) 
          ignoreHidden: true          # ignores all hidden
        - folderPath: "/"             # (global) 
          ignoreZeroSizeFolders: true # ignores all zero size folders
        - folderPath: "/"             # (global)
          ignoreSymlinks: true        # ignores all symlinks
```

### Disable Indexing

Indexing can be fully disabled for a source by creating a global rule with `viewable: true`. This will disable indexing but allow contents to be viewable in the UI.

```yaml
sources:
  - path: "/data"
    config:
      rules:
        - folderPath: "/"         # (global) 
          viewable: true          # allow viewing in the ui
```

On sources where indexing is disabled, **folder and scope quotas (v2.1.x)** can only use **tracked usage** measurement. See {{< doclink path="features/quotas/" text="Storage quotas (v2.1.x)" />}}.

## Rule Properties

These properties can be added to any rule to control behavior:

### `ignoreHidden`

```yaml
rules:
  - fileName: ".DS_Store"
    ignoreHidden: true
```

Skip hidden files and folders (those starting with `.` on linux and windows hidden folders) that match this rule. Hidden items don't appear in UI or search. Defaults to `false`.

### `ignoreZeroSizeFolders`

```yaml
rules:
  - folderPath: "empty-dirs"
    ignoreZeroSizeFolders: true
```

Skip folders with zero calculated size that match this rule. Empty folders or folders containing only empty folders are ignored. Defaults to `false`. Cleans up UI by hiding empty directory structures.

{{% alert context="info" %}}
You can still create folders via the UI. They must be populated by the next index scan to remain visible.
{{% /alert %}}

### `ignoreSymlinks`

```yaml
rules:
  - folderPath: "symlinks"
    ignoreSymlinks: true
```

Skip symbolic links that match this rule. Defaults to `false`. Useful for excluding symlinked directories from indexing.

## Rule Types

Individual rules are specified in the `rules` array. Each rule targets specific files or folders.

### Path-Based Rules

Target specific paths within your source.

#### `folderPath`

```yaml
rules:
  - folderPath: "temp"
  - folderPath: "cache/build"
```

Matches exact folder path relative to source root. For example, `folderPath: "logs"` matches `/data/logs` but not `/data/project/logs`. Use this to exclude specific known directories.

#### `filePath`

```yaml
rules:
  - filePath: "config/secrets.txt"
  - filePath: "data.db"
```

Matches exact file path relative to source root. For example, `filePath: "data.db"` matches `/data/data.db` but not `/data/backup/data.db`. Use this to exclude specific known files.

### Name-Based Rules (Global)

These rules apply anywhere within the source.

#### `folderName`

```yaml
rules:
  - folderName: "node_modules"
  - folderName: "__pycache__"
  - folderName: ".git"
```

Matches any folder with this exact name, anywhere in the source. For example, `folderName: "node_modules"` excludes all `node_modules` directories. Useful for excluding common folder names like cache or build directories.

#### `fileName`

```yaml
rules:
  - fileName: ".DS_Store"
  - fileName: "Thumbs.db"
  - fileName: "desktop.ini"
```

Matches any file with this exact name, anywhere in the source. For example, `fileName: ".DS_Store"` excludes all `.DS_Store` files. Useful for excluding system or temporary files by name.

### Pattern-Based Rules (Global)

Match files and folders based on name patterns.

#### `folderStartsWith`

```yaml
rules:
  - folderStartsWith: "tmp-"
  - folderStartsWith: "backup-"
  - folderStartsWith: "."
```

Matches folders whose names start with the specified prefix, anywhere in the source. For example, `folderStartsWith: "tmp-"` excludes `tmp-cache`, `tmp-build`, etc. Useful for excluding folders with naming conventions.

#### `folderEndsWith`

```yaml
rules:
  - folderEndsWith: ".git"
  - folderEndsWith: ".cache"
  - folderEndsWith: "-backup"
```

Matches folders whose names end with the specified suffix, anywhere in the source. For example, `folderEndsWith: ".git"` excludes `.git` folders. Useful for excluding folders by suffix pattern.

#### `fileStartsWith`

```yaml
rules:
  - fileStartsWith: "temp-"
  - fileStartsWith: "~"
  - fileStartsWith: "._"
```

Matches files whose names start with the specified prefix, anywhere in the source. For example, `fileStartsWith: "._"` excludes macOS metadata files. Useful for excluding temporary or system files.

#### `fileEndsWith`

```yaml
rules:
  - fileEndsWith: ".tmp"
  - fileEndsWith: ".log"
  - fileEndsWith: "~"
```

Matches files whose names end with the specified suffix, anywhere in the source. For example, `fileEndsWith: ".tmp"` excludes all temporary files. Useful for excluding files by extension or suffix.

### Special Rules

#### `includeRootItem`

```yaml
rules:
  - includeRootItem: "public"
  - includeRootItem: "downloads"
  - includeRootItem: "README.md"
```

Only show specified items at the root level of the source. For example, with the rules above, only `public` and `downloads` folders appear at source root. Useful for restricting visibility to specific root directories or files.

{{% alert context="warning" %}}
When using `includeRootItem`, **only** the specified items are visible at the root level. All other root items are hidden.
{{% /alert %}}

#### `neverWatchPath`

```yaml
rules:
  - neverWatchPath: "archives"
  - neverWatchPath: "historical/2020"
```

Folder is indexed once initially, then never rescanned automatically. You can still manually refresh by viewing the folder in the UI. Useful for large, rarely-changing directories to save resources.

Example:
```yaml
rules:
  - neverWatchPath: "photo-archive"  # 500GB of old photos
```

#### `viewable`

```yaml
rules:
  - folderPath: "archive"
    viewable: true
  - folderPath: "temp"
    viewable: true
```

Can be added to any rule type. Folder/file appears in UI but is excluded from search and size calculations. Useful for showing directories for browsing without indexing their contents.

Example:
```yaml
rules:
  - folderPath: "old-projects"
    viewable: true
```

Users can browse `old-projects` but it won't appear in search results or affect folder sizes.

## Complete Examples

### Clean Development Environment

Exclude common development artifacts:

```yaml
sources:
  - path: "/projects"
    config:
      rules:
        # Node.js
        - folderName: "node_modules"
        - folderName: "dist"
        - folderName: "build"
        
        # Python
        - folderName: "__pycache__"
        - folderName: ".pytest_cache"
        - folderEndsWith: ".egg-info"
        
        # General
        - folderName: ".git"
        - fileName: ".DS_Store"
        - fileEndsWith: ".log"
          ignoreHidden: true
```

### Media Library with Archives

Show archive folders but don't index them:

```yaml
sources:
  - path: "/media"
    config:
      rules:
        
        # Show but don't index archives
        - folderPath: "2020-archive"
          viewable: true
        - folderPath: "2021-archive"
          viewable: true
        
        # Never rescan large stable folders
        - neverWatchPath: "historical-collection"
          ignoreZeroSizeFolders: true
```

### Restricted Public Share

Only expose specific directories:

```yaml
sources:
  - path: "/shared"
    config:
      rules:
        # Only these folders visible at root
        - includeRootItem: "public"
        - includeRootItem: "downloads"
        - includeRootItem: "README.md"
```

## Rule Priority and Behavior

### How Rules Are Applied

1. **Rules are OR-based:** If any rule matches an item, it's excluded
2. **Name rules are global:** `folderName: "temp"` matches any `temp` folder anywhere
3. **Rule properties apply per-rule:** `ignoreHidden`, `ignoreZeroSizeFolders`, and `ignoreSymlinks` are evaluated for each matching rule
4. **Viewable overrides exclusion:** Adding `viewable: true` shows the item in UI

## Next Steps

- {{< doclink path="advanced/source-configuration/sources/" text="Source Configuration" />}}
- {{< doclink path="features/indexing/" text="Understanding Indexing" />}}
- {{< doclink path="features/quotas/" text="Storage quotas (v2.1.x)" />}} — measurement styles when indexing is on vs off
