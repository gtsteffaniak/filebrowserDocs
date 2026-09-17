---
title: "Environment Variables"
description: "Optional environment variables for configuration"
icon: "input"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-08-30T16:50:15Z"
---

The preferred configuration method is to use config.yaml. However, environment variables are available for **secrets**, **config override**, and **developer purposes**.

{{% alert context="warning" %}}
**v2.0.0 behavior change**

Database env vars changed between major versions:

- **`FILEBROWSER_DATABASE`** — **v1.x.x only** 
- **`FILEBROWSER_DATABASE_PATH`** — **v2.0.0+**

When upgrading, rename **`FILEBROWSER_DATABASE`** → **`FILEBROWSER_DATABASE_PATH`** and point it at your new SQLite file. See {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}}.
{{% /alert %}}

## Available Variables

| Variable | Config Equivalent | Description |
|----------|-------------------|-------------|
| `FILEBROWSER_CONFIG` | - | Config file path when no CLI argument provided |
| `FILEBROWSER_DATABASE` | `server.database` | **v1.x.x only.** BoltDB database file path (e.g. `database.db`). Removed in v2.0.0 — use `FILEBROWSER_DATABASE_PATH` instead. |
| `FILEBROWSER_DATABASE_PATH` | `server.database.path` | **v2.0.0+.** SQLite database file path (default: `filebrowser.sqlite`) |
| `FILEBROWSER_ADMIN_PASSWORD` | `auth.methods.password.adminPassword` | Password admin password |
| `FILEBROWSER_ONLYOFFICE_SECRET` | `integrations.office.secret` | OnlyOffice JWT secret |
| `FILEBROWSER_FFMPEG_PATH` | `integrations.media.ffmpegPath` | Path to FFmpeg binaries |
| `FILEBROWSER_OIDC_CLIENT_ID` | `auth.methods.oidc.clientId` | OIDC client ID |
| `FILEBROWSER_OIDC_CLIENT_SECRET` | `auth.methods.oidc.clientSecret` | OIDC client secret |
| `FILEBROWSER_JWT_TOKEN_SECRET` | `auth.key` | JWT signing key |
| `FILEBROWSER_TOTP_SECRET` | `auth.totpSecret` | TOTP encryption secret |
| `FILEBROWSER_RECAPTCHA_SECRET` | `auth.methods.password.recaptcha.secret` | reCAPTCHA secret key |
| `FILEBROWSER_DISABLE_AUTOMATIC_BACKUP` | N/A | Disable automatic backup |


## Usage Example

**Docker Compose**:
```yaml
services:
  filebrowser:
    image: ghcr.io/gtsteffaniak/filebrowser:stable
    environment:
      - FILEBROWSER_ADMIN_PASSWORD=secure-password
      - FILEBROWSER_ONLYOFFICE_SECRET=office-secret
    volumes:
      - ./config.yaml:/home/filebrowser/config.yaml
```

**CLI**:
```bash
export FILEBROWSER_ADMIN_PASSWORD="secure-password"
export FILEBROWSER_JWT_TOKEN_SECRET="jwt-secret"
./filebrowser -c config.yaml
```

## Next Steps

- {{< doclink path="reference/cli/" text="CLI commands" />}}
- {{< doclink path="configuration/authentication/" text="Configure authentication" />}}

