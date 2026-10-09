---
title: "Configuration Migration"
description: "Migrate configuration from original FileBrowser"
icon: "settings_suggest"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-03T16:10:00Z"
---

Migrate your configuration from the original FileBrowser to Quantum.

{{% alert context="info" %}}
**Upgrading Quantum v1.x → v2.0.0?** This page is for the **original FileBrowser** project. Use the {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} instead.
{{% /alert %}}

## Configuration Format Changes

FileBrowser Quantum uses a YAML-based configuration file instead of command-line flags and database settings.

See {{< doclink path="getting-started/config" text="About FileBrowser Quantum config file" />}}

Quantum v1.5.x stable and v2.x beta do not share listen or database keys. Copy the example that matches the release you are installing. v2 rejects unknown keys at startup, including `server.port`, `server.address`, `server.database` as a plain string, and `auth.methods.passwordAuth`.

## Migration Process

### 1. Export Current Settings

If you are running original FileBrowser, note your current settings:

```bash
# Check command-line flags
ps aux | grep filebrowser

# Common flags to note:
# --port, --address, --baseurl, --database, --root
```

also reference your `config.json`

### 2. Create config.yaml

Create a new `config.yaml` file with your settings.

**v2.0.0-beta and later** Listen settings are under `http`. The database is a SQLite file under `server.database.path` (standalone default `filebrowser.sqlite`). Password auth is `auth.methods.password`. Global share permission is `userDefaults.account.permissions.share`. File modify/create/delete/download/view defaults are `server.sources[].config.defaultPermissions`.

```yaml
http:
  port: 8080
  listen: "0.0.0.0"
  baseURL: "/"

server:
  database:
    path: "data/filebrowser.sqlite"
  sources:
    - name: "files"
      path: "/srv"
      config:
        defaultEnabled: true
        defaultPermissions:
          view: true
          download: true
          modify: true

auth:
  methods:
    password:
      enabled: true

userDefaults:
  account:
    permissions:
      share: true
```

**v1.5.6-stable.** Listen settings stay under `server`. The address key is `server.listen`, not `server.address`. The database is a string path (`server.database`, standalone default `database.db`), not `server.database.path`. Password auth is still `auth.methods.password`. On v1.5.6, `http` only has `trustedHeaders` and `disableRateLimit`.

```yaml
server:
  port: 8080
  listen: "0.0.0.0"
  baseURL: "/"
  database: "data/database.db"
  sources:
    - name: "files"
      path: "/srv"

auth:
  methods:
    password:
      enabled: true

userDefaults:
  account:
    permissions:
      modify: true
      share: true
```

### 3. Map Old Flags to New Config

| Original Flag | v2.0.0-beta and later | v1.5.6-stable |
|--------------|------------------------|---------------|
| `--port` | `http.port` | `server.port` |
| `--address` | `http.listen` | `server.listen` |
| `--baseurl` | `http.baseURL` | `server.baseURL` |
| `--database` | `server.database.path` (or `FILEBROWSER_DATABASE_PATH`) | `server.database` (or `FILEBROWSER_DATABASE`) |
| `--root` | `server.sources[0].path` | `server.sources[0].path` |
| `--log` | `server.logging[0].levels` | `server.logging[0].levels` |

## Features Removed

The following features from original FileBrowser are not available in Quantum:

- **Terminal** - Removed for security
- **Runners** - Removed (to be replaced with better job system)
- **Command line user management** - Use config file or API

## Next Steps

- {{< doclink path="configuration/sources/" text="Set up sources" />}}
- {{< doclink path="configuration/authentication/" text="Configure authentication" />}}
- {{< doclink path="configuration/frontend/" text="Customize frontend" />}}
