---
title: "Server Settings"
description: "Configure server options"
icon: "dns"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-03T14:40:00Z"
order: 2
---

{{% alert context="warning" %}}
**v2.0.0 behavior change**

In v2.0.0, `server.database` is an object with `path` (and optional `migrateFrom` during upgrade). Listening, URLs, TLS, WebDAV, and proxy options moved to the top-level `http` key — see {{< doclink path="configuration/http/" text="HTTP settings" />}}. The database is SQLite, not BoltDB (`database.db`). The standalone default file is `filebrowser.sqlite`. Official Docker images default to `/home/filebrowser/data/database.sqlite` when `path` is omitted.
{{% /alert %}}

Configure server-side behavior: database, caching, indexing, previews, sources, and logging. For port, `baseURL`, TLS, and reverse-proxy options, see {{< doclink path="configuration/http/" text="HTTP settings" />}}.

## Basic Server Configuration

```yaml
server:
  database:
    path: "filebrowser.sqlite"
  cacheDir: "tmp"
  sources:
    - path: "/srv"
```

## Configuration Options

<div class="pattern-card">

### minSearchLength

Minimum length of search query to begin searching (default: 3)

```yaml
server:
  minSearchLength: 3
```

</div>

<div class="pattern-card">

### disableUpdateCheck

Disable backend update check service

```yaml
server:
  disableUpdateCheck: false
```

</div>

<div class="pattern-card">

### numImageProcessors

Number of concurrent image processing jobs used to create previews. Default is number of CPU cores available.

```yaml
server:
  numImageProcessors: 4
```

</div>

<div class="pattern-card">

### disablePreviews

Disable all previews and thumbnails. Simple icons will be used instead.

```yaml
server:
  disablePreviews: false
```

</div>

<div class="pattern-card">

### disablePreviewResize

Disable resizing of previews for faster loading over slow connections.

```yaml
server:
  disablePreviewResize: false
```

</div>

<div class="pattern-card">

### disableTypeDetectionByHeader

Disable type detection by header. Useful if filesystem is slow.

```yaml
server:
  disableTypeDetectionByHeader: false
```

</div>

<div class="pattern-card">

### cacheDirCleanup

Whether to automatically cleanup the cache directory. Note: Docker must also mount a persistent volume to persist the cache (default: false).

```yaml
server:
  cacheDirCleanup: false
```

</div>

<div class="pattern-card">

### filesystem

Filesystem settings for file and directory creation permissions.

```yaml
server:
  filesystem:
    createFilePermission: "644"      # Unix permissions like 644, 755, 2755 (default: 644)
    createDirectoryPermission: "755" # Unix permissions like 755, 2755, 1777 (default: 755)
```

</div>

<div class="pattern-card">

### indexSqlConfig

Index database SQL configuration for performance tuning.

```yaml
server:
  indexSqlConfig:
    batchSize: 1000           # Number of items to batch in a single transaction, typically 500-5000. Higher = faster but could use more memory.
    cacheSizeMB: 32         # Size of the SQLite cache in MB
    walMode: false          # WAL journaling mode: more memory, better for busy deployments
    disableReuse: false       # If true, always create a new indexing database on startup
    startupIntegrityCheck: quickCheck  # quickCheck | probe | off — how thoroughly to verify the index DB at startup (default: quickCheck)
```

**`startupIntegrityCheck`** (default: `quickCheck`):

If you notice long delays on startup, you could configure this to `probe` (recommended) or `off` to reduce the startup check time.

- **`quickCheck`** — Runs SQLite `PRAGMA quick_check`. Thorougher on very large databases.
- **`probe`** — Lightweight check (catalog / sample read); faster for huge indexes.
- **`off`** — Minimal check beyond opening the DB; fastest boot, least safety.

</div>

<div class="pattern-card">

### sources

Configure file system sources. See {{< doclink path="configuration/sources/" text="Sources configuration" />}} for detailed information.

</div>

<div class="pattern-card">

### logging

Configure logging output and levels. See {{< doclink path="configuration/logging/" text="Logging configuration" />}} for detailed information.

</div>

<div class="pattern-card">

### database

SQLite database file path. See {{< doclink path="getting-started/config/#database-path-configuration" text="database path priority" />}} for defaults and env var overrides.

```yaml
server:
  database:
    path: "data/filebrowser.sqlite"
    migrateFrom: "database.db.old"  # one-time v1 → v2 migration only
```

**Default locations (v2.0.0+), when `path` is omitted:**
- Standalone: `./filebrowser.sqlite`
- Docker image: `/home/filebrowser/data/database.sqlite` (the image sets `FILEBROWSER_DATABASE_PATH`). A `path` in config replaces that value.

During upgrade from v1.x, set `migrateFrom` to your renamed BoltDB file. Remove it after migration — see {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}}.

**Storage quotas (v2.1.0+)** (folder, per-user scope, and share caps) use additional SQLite tables added in v2.1.0. They are created automatically on upgrade; legacy Bolt imports do not carry over quota limits. See {{< doclink path="features/quotas/" text="Storage quotas (v2.1.0+)" />}}.

Optional quota counter flush tuning (v2.1.0+):

```yaml
server:
  database:
    path: "data/filebrowser.sqlite"
    quotas:
      flushIntervalSeconds: 10   # batch write interval for tracked usage counters (default 10)
      flushMaxBuffers: 500       # flush when this many dirty counters are queued (default 500)
```

</div>

<div class="pattern-card">

### maxArchiveSize

FileBrowser limits the maximum size of archive and unarchive operations (folder downloads, ZIP handling, etc.). The limit is the **combined size of files** involved, in **gigabytes**. Default is **20** GB. Set to **0** for no limit.

This cap exists because archiving uses temporary files under `cacheDir` and an unlimited value could exhaust disk or memory on the server.

Ensure you have enough free space in `cacheDir` if you raise this value. That space must be on **disk-backed** storage (see `cacheDir` below). Lowering `maxArchiveSize` only blocks oversized archives; it does not fix out-of-memory failures when `cacheDir` is on tmpfs.

```yaml
server:
  maxArchiveSize: 20   # GB; 0 = no limit (default: 20)
```

</div>

<div class="pattern-card">

### cacheDir

The `cacheDir` is a critical configuration that defines where FileBrowser stores temporary files during various operations. By default, a `tmp` folder is created in the same directory as the program is run, but this may not be ideal. For example unRAID uses a different user by default and that causes permission issues with the default cache directory creation process.

#### Important Considerations

{{% alert context="warning" %}}
**Permissions**: The user running the FileBrowser process must have read/write permissions on the cache directory. This is especially critical in Docker environments. If you're using unRAID, you must mount a volume for the cache directory. The default container user (if not uid 1000) needs write access to this directory.

**Disk Space**: The cache directory can grow significantly during large file operations. Monitor disk usage and ensure adequate space. If you are using docker -- consider mounting a sufficient volume for temp directory if you need more space.

**Reliable**: Must be available and not tampered with during runtime. Make sure its not in a location that could be moved or modified by accident. Do not use network locations!

**Not tmpfs**: Mounting the cache path with `--tmpfs`, `type: tmpfs` will cause increased memory and likely to cause OOM errors.

{{% /alert %}}

The cacheDir is used by:

- **Image preview generation**: Thumbnails and processed images are cached
- **Archive operations**: ZIP extraction and compression temporary files (folder downloads; chunked downloads spool full archives here)
- **Search indexing**: Index database files under `cacheDir/sql`
- **Document processing**: Temporary files during PDF/image conversion
- **Video processing**: Some media files during video operations

```yaml
server:
  cacheDir: "tmp" # this is default when not configured.
```

</div>

#### Docker Examples

<div class="pattern-card">

**Basic Docker Setup:**

```yaml
# docker-compose.yaml
services:
  filebrowser:
    image: ghcr.io/gtsteffaniak/filebrowser:stable
    volumes:
      - '/path/to/your/data:/srv'
      - '/var/cache/filebrowser:/tmp/filebrowser'  # Mount cache directory
    environment:
      FILEBROWSER_CONFIG: "/config/config.yaml"
```

**Corresponding config.yaml:**

```yaml
server:
  cacheDir: /tmp/filebrowser # corrosponds to above
```

{{% alert context="info" %}}
Alternatively, in Docker, we can mount a single directory called `data` that contains the config, database files, and cacheDir. Check the {{< doclink path="user-guides/Other/standalone.md" text="Standalone docker setup guide" />}} to see how it's done.
{{% /alert %}}

</div>

#### Troubleshooting

**Folder ZIP download fails (502, broken pipe, container restarts):**

Confirm `cacheDir` is on disk-backed storage, not tmpfs. Check container memory limits and free space at the mounted cache path. See `maxArchiveSize` for the archive size cap.

**Permission Issues:**

By default, FileBrowser uses UID 1000 for the user (you can change that):

```bash
# Fix permissions for cache directory
sudo chown -R 1000:1000 /var/cache/filebrowser
```

## Next Steps

- {{< doclink path="configuration/http/" text="HTTP settings" />}} — port, baseURL, TLS, WebDAV, trusted headers, and auth rate limiting
- {{< doclink path="configuration/sources/" text="Configure sources" />}}
- {{< doclink path="configuration/authentication/" text="Set up authentication" />}}
- {{< doclink path="configuration/logging/" text="Configure logging" />}}
