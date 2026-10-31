---
title: "Common setup mistakes"
description: "Symptoms, log lines, and fixes for fresh FileBrowser v2.0.x installs"
icon: "build"
date: "2026-10-30T00:00:00Z"
lastmod: "2026-10-30T00:00:00Z"
order: 8
---

Use this page when a new **v2.0.x (stable)** install misbehaves. For upgrades from v1.x, also see {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} and {{< doclink path="getting-started/Migration/troubleshooting/" text="migration troubleshooting" />}}.

## `config.yaml` became a directory (Docker)

**Symptom:** Container fails immediately on start.

**Log line:**

```text
error mounting ".../config.yaml" to rootfs at ".../config.yaml": ... not a directory: Are you trying to mount a directory onto a file (or vice-versa)?
```

**Fix:** Create `config.yaml` on the host **before** bind-mounting it, or mount a **data directory** instead (`./data:/home/filebrowser/data`) and put `config.yaml` inside `./data`. See {{< doclink path="getting-started/docker/" text="Docker setup" />}} and {{< doclink path="getting-started/config/" text="configuration files" />}}.

## Empty file list (wrong source path)

**Symptom:** UI loads but shows no files; uploads may fail.

**Log lines:**

```text
WARN source path ... is currently not available
ERROR ... scanner ...
```

**Fix:** `server.sources[].path` must be the **path inside the container or on the host where FileBrowser runs**, not an unmounted host path. In Docker, if you mount `/path/on/host:/folder`, use `path: /folder` in config — not `/path/on/host`. See {{< doclink path="getting-started/config/" text="configuration files" />}}.

## Upload or create fails (permission denied)

**Symptom:** You can browse but cannot upload, create folders, or edit files.

**Log line:** Often none at startup; errors appear when writing (for example `Permission denied` in the UI or API).

**Fix:** The Docker image runs as UID **1000**. Source and data directories must be writable by that user:

```bash
sudo chown -R 1000:1000 ./data /path/to/your/folder
```

Or set `user:` in Compose to match ownership on the host. See {{< doclink path="getting-started/docker/#running-container-with-a-different-user" text="running with a different user" />}}.

## Cannot open database (SQLite error 14)

**Symptom:** Container or process exits on start.

**Log line:**

```text
could not initialize state: ... unable to open database file (14)
```

**Fix:** The `./data` directory (or whatever holds the SQLite file) is often **root-owned** because Docker created it as root. Fix ownership:

```bash
sudo chown -R 1000:1000 ./data
```

## `FILEBROWSER_DATABASE` still set (v1 env var)

**Symptom:** Process refuses to start.

**Log line:**

```text
FILEBROWSER_DATABASE environment variable is deprecated. Remove it, or set server.database.migrateFrom to "default" to migrate from that path on first start.
```

**Fix:** Remove `FILEBROWSER_DATABASE`. For a one-time v1 → v2 migration, set `server.database.migrateFrom: "default"` in config (reads the old path from `FILEBROWSER_DATABASE` or `database.db`) or use an explicit path — see {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}}. For normal v2 installs use `FILEBROWSER_DATABASE_PATH` or `server.database.path` only.

## Port already in use

**Symptom:** Bind failure on start.

**Log line:**

```text
failed to bind ... address already in use
```

**Fix:** Change the **host** port in Docker (`8080:80`) or set `http.port` to something above 1024 on bare metal (for example `8080`). On Linux systemd with `http.port: 80`, add `AmbientCapabilities=CAP_NET_BIND_SERVICE` or use a non-privileged port.

## Docker container stays unhealthy after changing listen port

**Symptom:** `docker ps` shows `(unhealthy)`; app may work on the new port.

**Log / behavior:** Image healthcheck curls `http://localhost:80/health` by default.

**Fix:** If you set `http.port` to something other than `80` inside the container, override the Compose `healthcheck` to match. See {{< doclink path="getting-started/docker/#healthcheck-configuration" text="Docker healthcheck" />}}.

## `admin` / `admin` login rejected

**Symptom:** Login returns unauthorized; `admin`/`admin` never works on a fresh install.

**Fix:** When `auth.adminPassword` and `FILEBROWSER_ADMIN_PASSWORD` are unset (or set to `admin`), a **random password** is generated once in the logs and a **password change is required** on first login. See **First login** on {{< doclink path="getting-started/docker/" text="Docker" />}}, {{< doclink path="getting-started/linux/" text="Linux" />}}, {{< doclink path="getting-started/windows/" text="Windows" />}}, or {{< doclink path="getting-started/macos/" text="macOS" />}}.

## UI password change lost after restart

**Symptom:** You changed the admin password in the UI, but after restart the old password works again.

**Log line (when config/env forces reset):**

```text
Resetting admin user to default username and password.
```

**Fix:** `auth.adminPassword` or `FILEBROWSER_ADMIN_PASSWORD` (when set to any value other than empty or `admin`) is **reapplied on every startup**. Remove that setting after initial setup if you want UI-managed passwords to persist.

## Share links broken behind Caddy (`handle_path`)

**Symptom:** Public share URLs 404 or load wrong content behind Caddy.

**Fix:** Do not use `handle_path` for `/public/*` — it strips the prefix. Use `handle /public/*` or a single `reverse_proxy`. See {{< doclink path="getting-started/reverse-proxy/#caddy-configuration" text="reverse proxy (Caddy)" />}}.
