---
title: "Migration Guide"
description: "Upgrade FileBrowser Quantum from v1.x to v2.0.0"
icon: "upgrade"
date: "2026-07-23T17:03:27Z"
lastmod: "2026-10-03T16:30:00Z"
order: 1
---

This guide walks you through upgrading an existing **FileBrowser Quantum v1.x** installation to **v2.0.0**. It does not cover migrating from the original FileBrowser project — see {{< doclink path="getting-started/migration/" text="Migration from original FileBrowser" />}} for that.

## Why migration is required

v2.0.0 replaces the BoltDB database with **SQLite** and restructures configuration and the user permission model. SQLite and the new `state` package enable activity logging, richer cross-entity queries, and better caching — but they cannot be applied automatically without a deliberate migration.

Migration happens in **four phases**:

| Phase | What you do |
|---|---|
| **1. Prepare** | Back up database, rename old DB, convert config, update env var if needed |
| **2. First run** | Validate everything migrated after first starting v2.x.x with `migrateFrom` set. |
| **3. Cleanup** | If validated, update config to final structure without `migrateFrom` and `userDefaults` |
| **4. Confirm** | Restart and final validation |

{{% alert context="danger" %}}
**Rollback policy**

**Always keep a backup of your original `database.db` file** in a safe location outside the active data directory.

If you notice **anything wrong** after upgrading — missing users, broken shares, incorrect permissions, sidebar links — **stop using v2.0.0 immediately** and roll back to your v1.x installation. Open a [GitHub issue](https://github.com/gtsteffaniak/filebrowser/issues) so the developers can investigate.
{{% /alert %}}

<div class="pattern-card pattern-card--purple">

## Phase 1 — Prepare config, env, and database paths

### Stop and back up

Stop FileBrowser, then copy `database.db` to a safe location **outside** your active data directory. Only the database file needs a backup — config changes are reversible and v2 creates a new SQLite file alongside the renamed old database.

```bash
cp database.db /path/to/safe/location/database.db.backup
```

### Rename the old database

The new SQLite database **cannot** be named `database.db`. Rename your BoltDB file **before** converting config or starting v2:

```bash
mv database.db database.db.old
```

If an unrenamed `database.db` remains in the working directory, v2.0.0 refuses to start.

### Convert and update config

Use the {{< doclink path="getting-started/v2/config-migration/" text="config migration tool" />}} to convert your v1 `config.yaml` to the v2-compatible structure.

{{% alert context="info" %}}
If you are running behind a reverse proxy, please set [http.trustProxyHeaders: true](https://filebrowserquantum.com/en/docs/getting-started/reverse-proxy/#proxy-headers-filebrowser-understands) if not already set in the config migration tool.
{{% /alert %}}

Then set the new SQLite path and point `migrateFrom` at your renamed BoltDB file:

```yaml
server:
  database:
    path: "filebrowser.sqlite" # or use FILEBROWSER_DATABASE_PATH env var
    migrateFrom: "database.db.old"
```

Paths are relative to the FileBrowser working directory (standalone) or your mounted data directory (Docker).

{{% alert context="info" %}}
**Keep `userDefaults` in config for now.** On first startup, they seed the new SQLite database. You will decide whether to keep or remove them in Phase 3.
{{% /alert %}}

### Docker and environment variables

- If you set the database path via env var, rename **`FILEBROWSER_DATABASE`** → **`FILEBROWSER_DATABASE_PATH`** and point it at the new SQLite file. `FILEBROWSER_CONFIG` is unchanged. See {{< doclink path="reference/environment-variables/" text="Environment variables" />}}.
- If you already mount a **data directory** (recommended in {{< doclink path="getting-started/docker/" text="Docker setup" />}}), no volume changes are needed.
- **Only update mounts** if you currently bind-mount a **single database file** — switch to a directory mount so the renamed BoltDB and new SQLite can coexist during migration.

</div>

<div class="pattern-card">

## Phase 2 — First run (automatic database migration)

Start FileBrowser v2.0.0 with `migrateFrom` set in your config.

When the SQLite file does not exist yet (or is empty) and the BoltDB file at `migrateFrom` is populated, FileBrowser automatically imports:

- Users and credentials
- Shares
- Access rules
- API tokens
- Index metadata
- Sidebar links

Watch the logs for migration progress:

```
Starting migration from BoltDB to SQLite
  ✓ Migrated N users
  ✓ Migrated N shares
  ...
Migration completed successfully!
```

### Verify the migration

Log in and confirm:

- [ ] All users can authenticate
- [ ] Shares work and point to the correct paths
- [ ] API tokens are present (Settings → API, or test your integrations)
- [ ] Sidebar links appear correctly for each user
- [ ] Per-source permissions look correct (User Management → expand each source scope)

Global file permissions from v1.x are copied onto each user scope during migration. Review scopes for users with multiple sources, WebDAV clients, and automation that assumed global modify/delete access. See {{< doclink path="configuration/users/" text="User Management" />}}.

**If anything is missing or incorrect**, stop the server, roll back to v1.x using your backup, and [open a GitHub issue](https://github.com/gtsteffaniak/filebrowser/issues).

</div>

<div class="pattern-card">

## Phase 3 — Cleanup after successful validation

Once you have confirmed the migration is correct:

### Remove migrateFrom

Delete the `migrateFrom` key from `config.yaml`:

```yaml
server:
  database:
    path: "filebrowser.sqlite" # or use FILEBROWSER_DATABASE_PATH env var
    # migrateFrom removed — migration is complete
```

FileBrowser no longer needs the old BoltDB file at runtime. **Keep `database.db.old` as an offline backup** — do not delete it until you are confident you will not need to roll back.

### Remove old database from active mounts

Only applies if you switched from a single-file database mount in Phase 1. If you already used a `./data` directory mount, no change is needed — keep `database.db.old` as an offline backup outside the active path if desired.

### Decide: config-controlled or UI-controlled user defaults

`userDefaults` in `config.yaml` and the admin UI **cannot both control the same settings**. Fields explicitly set in config are **locked** in Settings → User management → User defaults.

| Approach | Action |
|---|---|
| **Keep managing defaults via config** | Leave `userDefaults` in `config.yaml`. Those fields stay locked in the UI. |
| **Switch to UI-managed defaults** | Remove the `userDefaults` section from `config.yaml`. Manage defaults entirely in the admin UI. |

See {{< doclink path="configuration/users/#default-user-settings" text="Default user settings" />}} for the v2.0.0 structure.

</div>

<div class="pattern-card pattern-card--green">

## Phase 4 — Final confirmation

Restart FileBrowser without `migrateFrom` and with your chosen `userDefaults` setup.

Confirm:

- [ ] Server starts without migration or database errors
- [ ] Users, shares, and API tokens still work
- [ ] User defaults behave as expected (config-locked or UI-managed)
- [ ] `database.db.old` backup is stored safely outside the active data path

You are now running v2.0.0.

</div>

## Quick reference

**Minimal config for migration (Phase 1–2):**

```yaml
server:
  database:
    path: "filebrowser.sqlite" # or use FILEBROWSER_DATABASE_PATH env var
    migrateFrom: "database.db.old"
  sources:
    - path: "/your/files"
      config:
        defaultEnabled: true

userDefaults:
  account:
    permissions:
      admin: false
      api: true
      share: true
```

**After migration (Phase 3–4):**

```yaml
server:
  database:
    path: "filebrowser.sqlite"
  sources:
    - path: "/your/files"
      config:
        defaultEnabled: true

# userDefaults removed if switching to UI-managed defaults
```

## Related resources

- {{< doclink path="getting-started/v2/about/" text="About v2.0.0" />}} — full breaking changes, API cleanup, and state architecture
- {{< doclink path="getting-started/Migration/troubleshooting/" text="Migration troubleshooting" />}} — common issues after upgrade
- {{< doclink path="reference/cli/" text="CLI reference" />}} — updated user management commands

