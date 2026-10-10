---
title: "Storage Quotas"
description: "Limit how much storage users, folders, and share links can use"
icon: "storage"
date: "2026-08-24T17:05:51Z"
lastmod: "2026-08-24T17:05:51Z"
order: 6
---

Storage quotas (v2.1.x) let you cap how much data can be stored in a specific place. When a cap applies, uploads that would exceed it are blocked and the UI shows how much space is used.

{{% alert context="warning" %}}
**v2.1.x feature**

Storage quotas require **FileBrowser Quantum v2.1.0 or newer**.
{{% /alert %}}

{{% alert context="info" %}}
Quotas are separate from **access rules** and **permissions**. A user might be allowed to upload to a folder but still hit a storage limit. See {{< doclink path="access-control/access-control-overview/" text="Access control overview" />}} for path visibility and {{< doclink path="features/user-permissions/" text="User permissions" />}} for create/modify rights.
{{% /alert %}}

## Three kinds of quotas

FileBrowser can enforce limits at three levels. **All applicable limits must pass** before an upload is accepted.

| Kind | Who sets it | What it limits | Typical use |
|------|-------------|----------------|-------------|
| **Folder quota** | Admin | Size of a specific folder (and everything inside it) | Cap a team project directory or customer upload area |
| **Scope quota** | Admin (per user, per source) | Storage for a user's assignment on one source | Personal home folder on a shared server ([#547](https://github.com/gtsteffaniak/filebrowser/issues/547)) |
| **Share quota** | Share owner | Files uploaded through a share link | Public upload link with a fixed cap |

### Folder quota

Admins set a limit on a **single folder** from the file browser:

1. Select one folder (not a file).
2. Open the context menu → **Storage quota**.
3. Turn on the limit, choose a **measurement style** (when indexing is enabled), pick a preset (for example 10 GB), or enter a custom size.

### Scope quota

In **Settings → User management**, expand a user's source block to set a **storage limit for this source**:

- **Indexed size** — Total size of indexed files in the user's scope folder on that source (what you see in the sidebar usage bar).
- **Tracked usage** — Counts only uploads, saves, and deletes performed through FileBrowser.

When a scope quota uses **indexed size**, the sidebar shows **your usage vs your cap** for that source instead of whole-disk partition usage ([#2029](https://github.com/gtsteffaniak/filebrowser/issues/2029)).

### Share quota

On **upload shares** or normal shares with **allow create**, you can limit **storage through the link**:

- Set **Limit storage through this share** in the share dialog (same area as download limits).
- Visitors see used vs limit before uploading when a cap is set.
- Public uploads through the link also count against the **share owner's** scope quota on that source, if one exists.

Share quotas always use **tracked usage** (mutation counter). There is no indexed-size option for shares.

See {{< doclink path="shares/options/" text="Share options" />}} and {{< doclink path="shares/upload-shares/" text="Upload shares" />}}.

## Choosing a measurement style

Folder and scope quotas support two measurement styles when **indexing is enabled** on the source. You choose the style per quota in the admin UI under **Count usage by**.

When **indexing is disabled** on a source (`viewable` on the root conditional rule, or equivalent rules that disable indexing), **only tracked usage** is available. The UI hides indexed-size options and the API rejects index meters on that source.

### Indexed size

Uses folder size totals from the search index at the quota root (folder quotas) or the user's scope path (scope quotas). See {{< doclink path="features/indexing/" text="Indexing" />}}.

| Strengths | Limitations |
|-----------|-------------|
| Reflects **actual tree size** under the quota root (indexed files) | Requires indexing enabled and a successful folder size at the root |
| Good for caps on **existing data** (projects, shared folders) | **Slow to reflect** new uploads until the indexer updates folder sizes |
| Matches sidebar / listing folder sizes users already see | **Out-of-band changes** (rsync, shell copies) count once the index catches up — not instant |
| No counter drift from FileBrowser-only semantics | If indexed size is configured but size is **temporarily missing**, enforcement **falls back** to tracked usage until size is known |
| | Does **not** decrease scope usage on delete until delete hooks exist (index updates on delete via indexer) |

### Tracked usage (mutation counter)

Counts bytes in SQLite `quota_counters` when FileBrowser-mediated writes are committed (uploads, editor saves, deletes, and similar API actions). Same model as share quotas.

| Strengths | Limitations |
|-----------|-------------|
| Works **without indexing** — only option when indexing is disabled | Counts **FileBrowser-mediated changes** only, not full disk usage |
| **Immediate** reserve/commit on each write — no scan delay | **Starts at 0** when enabled; does not include files already on disk unless you seed (future UX) |
| Same model as **share quotas** — predictable for upload links | **Drifts** if files are added/removed outside FileBrowser (SFTP, rsync, shell) |
| Durable counter in SQLite (batched flush) | **Deletes not credited** in v1 — usage may stay high after deletes until delete enforcement lands |
| Admin can choose this even when indexing works (e.g. upload budget only) | Not a substitute for **filesystem disk quota** — logical cap through the app |

### Which should I use?

- Cap **total folder contents** (existing files + uploads) → **Indexed size** when indexing is on.
- Cap **changes through FileBrowser**, or indexing is off → **Tracked usage**.
- **Share links** → always tracked usage.

### Runtime fallback

If you configure **indexed size** but the index has not measured that folder yet, enforcement temporarily uses **tracked usage** so uploads are not blocked and usage is not treated as zero. The API reports `configuredMeter` vs `effectiveMeter` and `measurementStatus: accounted_fallback` until folder size is available. When the index catches up, the effective meter switches back to index-based and reported usage may jump.

Changing a quota from indexed size → tracked usage does **not** auto-seed the counter from disk; usage starts from FileBrowser writes after the change.

## What users see

| User | Quota UI |
|------|----------|
| **Everyone** | No quota UI until a limit exists for something they use |
| **Non-admin with scope quota** | Sidebar progress bar on that source (used / limit) |
| **Admin** | Folder quota in context menu; scope quotas in user edit; share quotas in share dialog; usage in **Settings → Shares** for upload links |
| **Share visitors** | Optional usage bar on upload shares with a storage cap |

There is no global “enable quotas” switch. Each limit is configured where it applies.

## Uploads and errors

When any quota applies to the destination:

- The client must send a **known total file size** before the upload body is accepted (`Content-Length` or `X-File-Total-Size` for chunked uploads). Otherwise the request is rejected with a clear error.
- If the file would exceed the limit, the server responds with **507 Insufficient Storage** and a `quota_*` error code so the UI can show a specific message.

Deletes are not blocked by quotas. Replacing a file only charges the **difference** in size (new size minus old file size).

Folder sizes and indexing behavior depend on source settings such as `useLogicalSize` — see {{< doclink path="configuration/sources/" text="Sources" />}}.

## Upgrades and migration

Quota data lives in the SQLite database (`quotas` and `quota_counters` tables). The `quotas` table includes a `meter` column (`index_size` / `index_scope` for indexed size, or `accounted` for tracked usage). Upgrading from an older SQLite schema adds these tables and columns automatically on first startup.

If you migrate from a legacy Bolt database to SQLite, users, shares, and access rules are imported as today, but **no quota limits are migrated** (Bolt never stored them). Configure quotas after migration the same as on a new install.

Optional tuning for how often tracked usage counters are flushed to disk lives under `server.database.quotas` — see {{< doclink path="configuration/server/" text="Server settings" />}}.

## Related documentation

- {{< doclink path="features/indexing/" text="Indexing" />}} — folder sizes, scan behavior, and indexed-size quotas (v2.1.x)
- {{< doclink path="configuration/sources/" text="Sources" />}} — source setup, indexing-disabled sources, and `useLogicalSize`
- {{< doclink path="advanced/source-configuration/sources/" text="Advanced source configuration" />}}
- {{< doclink path="advanced/source-configuration/conditional-rules/" text="Conditional rules" />}} — rules that disable indexing (e.g. `viewable` on root)
- {{< doclink path="access-control/access-control-overview/" text="Access control overview" />}}
- {{< doclink path="shares/options/" text="Share options" />}}
- {{< doclink path="configuration/server/" text="Server settings" />}} — database and `server.database.quotas`
