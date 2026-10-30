---
title: "Database troubleshooting"
description: "Maintainer reference: SQLite layout for folder, scope, and share quotas"
icon: "bug_report"
date: "2026-10-29T12:00:00Z"
lastmod: "2026-10-29T12:00:00Z"
order: 1
---

{{% alert context="warning" %}}
**Maintainers only.** Do not direct end users or admins to edit SQLite or run the queries below. For normal verification, use {{< doclink path="features/quotas/#confirming-a-limit-is-saved" text="Confirming a limit is saved" />}} (UI only).
{{% /alert %}}

## Summary

**Expected** when limits were configured as **user scope quotas**, not **folder quotas**:

- Scope limits are persisted in **`users.user_data`** (`backendScopes[].quota`), exposed as **`scopes[].quota`** on **`GET /api/users`**.
- The **`quotas`** table holds **folder** definitions only (folder **Storage quota** / **`/api/quotas`**).
- **`quota_counters`** holds **tracked usage** (and reservations) for scope, share, and accounted folder quotas—often **without** any matching **`quotas`** row.

Applies to **FileBrowser Quantum v2.1.0+** unless the persistence model changes.

## Data model

| Kind | Limit stored in | Usage (when applicable) |
|------|-------------------|-------------------------|
| **Scope** | `users.user_data` → `backendScopes[].quota` | Indexed: index under user scope path. Accounted: `quota_counters` keyed by quota `id`. |
| **Folder** | `quotas` | Indexed: index at folder path. Accounted: `quota_counters` keyed by `quotas.id`. |
| **Share** | `shares.share_settings` → `quotaLimitBytes` | Always accounted → `quota_counters` with `quota_id = share:<hash>`. |

No foreign key links **`quota_counters`** to **`quotas`**.

### Code paths (reference)

- **`GET /api/users` scope limits:** `PrepForFrontend` → `GetFrontendScopes()` → `scopes[].quota` (not from `quotas`).
- **Scope persist:** `sqldb.UserData.backendScopes`; counters on save: `OnUserScopeQuotaChanged`.
- **Folder persist:** `CreateFolderQuota` / `UpdateFolderQuota` → `SaveFolderQuota`.

## What admins should do instead of DB work

| Goal | UI approach |
|------|-------------|
| Verify scope limit | **Settings → User management** → user → source block; refresh or restart and re-open |
| Verify folder limit | Folder → **Storage quota**; refresh or restart and re-open |
| Verify share limit | Share edit / **Settings → Shares**; visitor usage bar on upload shares |
| Verify enforcement | Upload within cap (success); exceed cap (quota error in UI) |
| Change or remove limit | Same screen where it was created—never hand-edit SQLite |

## When to treat empty `quotas` as a bug

Only if **folder** quotas were configured (**Storage quota** or **`/api/quotas`**), **`GET /api/quotas?source=…`** returns them, and **`quotas`** is still empty **after a full restart**. That path should always call **`SaveFolderQuota`**.

## Appendix: SQLite inspection (maintainers)

Use a **copy** of the database. Never instruct users to delete **`quota_counters`** rows manually; reset limits through the UI.

```sql
-- Scope limits (not in quotas)
SELECT username, user_data FROM users;

-- Folder limits only
SELECT id, source, path, user_id, limit_bytes, meter FROM quotas;

-- Tracked usage
SELECT quota_id, used_bytes, reserved_bytes FROM quota_counters;
```

API cross-check: **`GET /api/users`** → `scopes[].quota`; **`GET /api/quotas?source=…`** → folder; share APIs → **`quotaLimitBytes`**; **`GET /api/settings/sources`** → **`scopeQuota`**.

## Related documentation

- {{< doclink path="features/quotas/" text="Storage quotas" />}}
- {{< doclink path="reference/api/" text="API reference" />}}
- {{< doclink path="configuration/server/" text="Server settings" />}} — `server.database.quotas`
