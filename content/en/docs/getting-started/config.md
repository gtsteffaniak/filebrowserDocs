---
title: "Configuration Files (v2.0.0)"
description: "Understanding and using configuration files in FileBrowser v2.0.0 (beta)"
icon: "settings"
date: "2025-10-23T00:50:09Z"
lastmod: "2026-10-04T17:20:00Z"
order: 6
---

{{% alert context="info" %}}
**This guide is for v2.0.0 (beta).** It uses SQLite (`server.database.path`). Standalone default filename is `filebrowser.sqlite`. The Docker image default is `database.sqlite`.

Using **v1.5.x or older**? See the {{< doclink path="getting-started/config-v1.5.x" text="v1.5.x configuration guide" />}} instead.
{{% /alert %}}

{{% alert context="warning" %}}
**Upgrading from v1.x?**

v2.0.0 removes deprecated flat config formats and moves HTTP settings from `server` to `http`. Use the config migration tool and follow the {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} before upgrading.
{{% /alert %}}

## What is a Config File?

A configuration file (config file) is a YAML file that defines how FileBrowser Quantum should work. While FileBrowser can run without a config file using default settings, a config file is *generally necessary* and allows you to customize:

- Server settings (port, database location, sources)
- Authentication methods (password, OIDC, proxy)
- User management and permissions
- Frontend customization (themes, branding)
- Media and office integrations

See an example [config file on Github](https://github.com/gtsteffaniak/filebrowser/blob/main/backend/config.yaml).

## How to Specify a Config File

FileBrowser looks for configuration in the following order of priority:

### 1. Command Line Argument
```bash
./filebrowser -c /path/to/config.yaml
```

### 2. Environment Variable
```bash
export FILEBROWSER_CONFIG="/path/to/config.yaml"
./filebrowser
```

### 3. Environment variable substitution in YAML (v2.0.10-beta+)

**Beta (v2.x) only** — not available in v1.5.x stable releases.

After the config file is loaded, string values in `config.yaml` may reference process environment variables using `$VAR` or `${VAR}`. Expansion runs on the decoded YAML tree, so secrets can contain characters that would break unquoted YAML.

```yaml
auth:
  methods:
    ldap:
      userPassword: "${FILEBROWSER_LDAP_USER_PASSWORD}"
```

When a scalar is **only** a single `$VAR` or `${VAR}` reference, the expanded value may be coerced to a boolean or number when unambiguous (for example `port: ${PORT}`). Partial substitutions and ordinary strings stay strings.

Named `FILEBROWSER_*` variables in {{< doclink path="reference/environment-variables/" text="Environment variables" />}} still override matching config keys after expansion. Prefer those variables or `${VAR}` in YAML for secrets rather than plaintext in the file.

### 4. Default Locations
- Current directory (`./config.yaml`)
- Docker default: `/home/filebrowser/data/config.yaml`

## Database Path Configuration

The database path is configured under `server.database.path`. See {{< doclink path="configuration/server/#database" text="Server configuration" />}} for details.

**Default database locations (v2.0.0+):**
- Standalone, when neither config nor `FILEBROWSER_DATABASE_PATH` sets a path: `./filebrowser.sqlite`
- Docker image, when config omits `server.database.path`: `/home/filebrowser/data/database.sqlite` (`FILEBROWSER_DATABASE_PATH` in `_docker/Dockerfile`)

**Priority for database path:**
1. `server.database.path` in `config.yaml`, when it is set
2. `FILEBROWSER_DATABASE_PATH`, when the config path is empty
3. `filebrowser.sqlite`

{{% alert context="info" %}}
**Upgrading from v1.x?** v2.0.0 uses a new database instead of the legacy database (`database.db`). Rename your old database file, set `migrateFrom`, and follow the {{< doclink path="getting-started/v2/migration/" text="migration guide" />}}. The `FILEBROWSER_DATABASE` env var is removed — use `FILEBROWSER_DATABASE_PATH` instead.
{{% /alert %}}

## Docker Configuration

### Using Docker Run
```bash
# Mount your config file
docker run -d \
  -v /path/to/your/config.yaml:/home/filebrowser/data/config.yaml \
  -v /path/to/your/folder:/folder \
  -p 80:80 \
  ghcr.io/gtsteffaniak/filebrowser:beta
```

### Using Docker Compose

<div class="pattern-card">

{{% alert context="info" %}}
Mount a host directory on `/home/filebrowser/data` if you want config, database, and cache to persist across container restarts (see {{< doclink path="getting-started/docker/" text="Docker setup" />}}).
{{% /alert %}}

```yaml
services:
  filebrowser:
    volumes:
      - '/path/to/folder:/folder'
      - './data:/home/filebrowser/data'
    ports:
      - '80:80'
    image: ghcr.io/gtsteffaniak/filebrowser:beta
    restart: unless-stopped
```

</div>

## Basic Configuration Example

Here's a minimal config file to get you started:

```yaml
server:
  sources:
    - path: "/path/to/your/files" # or '/folder' in above example (do not load the full os filesystem, must be sub path)
      config:
        defaultEnabled: true  # Grant to all users on create; v2.0.1+ also merges for existing users on startup

auth:
  methods:
    password:
      enabled: true
```

On v2.x (v2.0.0+), if `adminPassword` is unset or left as `admin`, a random admin password is generated, logged once, and a password reset is required on first login. Any other value of `auth.methods.password.adminPassword` or `auth.adminPassword` is used as-is.

## Configuration Options

FileBrowser supports extensive configuration options. You can view the complete configuration reference at:

- **Full config example**: {{< doclink path="reference/fullConfig/" text="Full Config Example" />}}
- **Current config**: In the web UI, Admins can go to Settings > System & Admin > Load Config

### Key Configuration Sections

- **Server Settings**: Port, database, sources, caching
- **Authentication**: Password, OIDC, proxy authentication
- **UsersDefaults**: New user defaults
- **Frontend**: UI customization, themes, branding
- **Integrations**: Media (FFmpeg) and office (OnlyOffice) support

## Best Practices

### 1. Keep It Simple
Only configure the settings you need. A minimal config is easier to read and maintain:

```yaml
server:
  sources:
    - path: "/data"
      config:
        defaultEnabled: true

auth:
  adminUsername: admin
```

### 2. Use Environment Variables for Secrets
Instead of putting secrets in your config file, use {{< doclink path="reference/environment-variables" text="environment variables" />}}:

```yaml
auth:
  methods:
    oidc:
      enabled: true
```

And set environment variables:
```bash
FILEBROWSER_ADMIN_PASSWORD="mysecurePassword"
FILEBROWSER_OIDC_CLIENT_ID=exampleID
FILEBROWSER_OIDC_CLIENT_SECRET=exampleSecret
```

### 3. Restart After Changes
Configuration changes require a restart to take effect:

```bash
# Stop FileBrowser
# Edit your config.yaml
# Start FileBrowser again
./filebrowser -c config.yaml
```

## Next Steps

- {{< doclink path="configuration/configuration-overview/" text="Configuration Overview" />}} - Complete configuration guide
- {{< doclink path="reference/fullconfig/" text="Full Configuration Reference" />}} - All available options
- {{< doclink path="configuration/sources/" text="Source Configuration" />}} - Configure file sources
- {{< doclink path="configuration/authentication/" text="Authentication Setup" />}} - Set up authentication methods
