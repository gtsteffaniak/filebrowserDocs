---
title: "Database troubleshooting"
description: "SQLite storage for folder, scope, and share quotas — for operators debugging API vs database mismatches"
icon: "bug_report"
date: "2026-10-29T12:00:00Z"
lastmod: "2026-10-29T12:00:00Z"
order: 1
---

This page is for **operators and maintainers** who inspect the SQLite database or compare REST responses with on-disk data. End-user quota behavior is documented in {{< doclink path="features/quotas/" text="Storage quotas" />}}.

## Symptom: limits in the users API, empty `quotas` table, rows in `quota_counters`

Reports like [GitHub issue #3293](https://github.com/gtsteffaniak/filebrowser/issues/3293) often describe:

- `GET /api/users` returns configured quota limits and scopes.
- A read-only query of `quotas` returns **zero rows**.
- `quota_counters` contains records for the affected users.

**Summary:** This is **expected** when limits were configured as **user scope quotas**, not **folder quotas**. The users API reads scope limits from the user record. The `quotas` table stores **folder** definitions only. `quota_counters` is shared by every quota kind that uses **tracked usage** (and for in-flight upload reservations), so counter rows without matching `quotas` rows is normal.

Applies to **FileBrowser Quantum v2.1.0+** and current development branches unless the quota persistence model changes.

## Data model

Three quota kinds use different persistence for **limits**. **Usage** depends on the configured meter (`index_scope`, `index_size`, or `accounted`).

| Kind | Where the limit is stored | Usage (when applicable) |
|------|---------------------------|-------------------------|
| **Scope** — User management → per-source storage limit | `users.user_data` JSON → `backendScopes[].quota` (`id`, `limitBytes`, `meter`) | **Indexed:** search index under the user’s scope path on that source. **Accounted:** `quota_counters` keyed by that `id`. |
| **Folder** — context menu → Storage quota, or `/api/quotas` | `quotas` (`id`, `source`, `path`, `user_id`, `limit_bytes`, `meter`) | **Indexed:** index at the folder path. **Accounted:** `quota_counters` keyed by `quotas.id`. |
| **Share** — `quotaLimitBytes` on the share | `shares.share_settings` JSON | Always **accounted** → `quota_counters` with `quota_id = share:<hash>`. |

The schema migration comments in the application match this split: `quotas` holds path-bound folder caps; `quota_counters` holds accounted usage for scope, share, and accounted folder quotas. There is **no foreign key** from `quota_counters` to `quotas`.

### Code paths (reference)

- Scope limits in API responses: `PrepForFrontend` → `GetFrontendScopes()` copies `BackendScopes[].Quota` into JSON field `scopes[].quota` on `GET /api/users`. This does **not** read the `quotas` table.
- Scope limit persistence: `users.user_data` via `sqldb.UserData` → `backendScopes`.
- Scope counter on save: `OnUserScopeQuotaChanged` → `EnsureQuotaCounter` / `ensureQuotaCounterMemLocked`.
- Folder limit persistence: `CreateFolderQuota` / `UpdateFolderQuota` → `SaveFolderQuota`.

## Why the three observations fit together

1. **`GET /api/users` shows limits** — Scope quotas live in each user’s persisted scopes. They appear as `scopes[].quota` after the server maps backend source paths to display names.

2. **`SELECT * FROM quotas` is empty** — Expected if only **scope** or **share** limits were configured, not **folder** quotas (folder UI or `POST /api/quotas`).

3. **`quota_counters` has rows** — Created when a scope quota with a positive limit is saved, when share quotas exist, when folder quotas use `meter = accounted`, and for reservations during uploads. Scope and share counter IDs will **not** appear in `quotas`.

## Verification (read-only)

Work on a **copy** of the database when possible.

### 1. Confirm which API showed the limits

| Limit type | API |
|------------|-----|
| User scope | `GET /api/users` → `scopes[].quota` |
| Folder | `GET /api/quotas?source=<displayName>` |
| Share | Share list/get APIs → `quotaLimitBytes` |

Logged-in users also see effective scope usage on `GET /api/settings/sources` as `scopeQuota` per source.

### 2. Inspect scope configuration in SQLite

```sql
SELECT username, user_data FROM users;
```

In `user_data`, find `backendScopes` entries with a nested `quota` object (`limitBytes`, `meter`, `id`).

### 3. Inspect folder quotas

```sql
SELECT id, source, path, user_id, limit_bytes, meter FROM quotas;
```

Non-empty only when folder quotas were configured.

### 4. Match tracked usage counters

```sql
SELECT quota_id, used_bytes, reserved_bytes FROM quota_counters;
```

- Scope **accounted** meter: `quota_id` equals the UUID in that user’s `quota.id`.
- Share caps: `quota_id` like `share:%` (share hash suffix).

If step 2 shows the limits you expect, persistence is working; the gap is **inspecting `quotas` for scope limits**, which are stored elsewhere.

## When to treat it as a bug

Only if **all** of the following hold:

- Limits were created as **folder** quotas (folder **Storage quota** or `/api/quotas`).
- `GET /api/quotas?source=…` returns them immediately after configure.
- The `quotas` table is still empty **after a full application restart** (not just in-memory state).

Folder creation should always call `SaveFolderQuota` during `CreateFolderQuota` and update handlers.

## Safe repair

| Kind | Action |
|------|--------|
| **Scope** | Edit the user in the admin UI or `PATCH /api/users` with the correct scope quota payload. Do not manually delete `quota_counters` unless you intend to reset **accounted** usage. |
| **Folder** | Recreate via the folder **Storage quota** UI or `/api/quotas`. |
| **Share** | Edit the share and set **Limit storage through this share** again. |

Removing a quota through the UI invokes `OnUserScopeQuotaRemoved` or `DeleteFolderQuota`, which removes the associated counter when the definition is removed.

## Related documentation

- {{< doclink path="features/quotas/" text="Storage quotas" />}} — user-facing behavior and UI
- {{< doclink path="reference/api/" text="API reference" />}}
- {{< doclink path="configuration/server/" text="Server settings" />}} — `server.database.quotas` flush tuning
