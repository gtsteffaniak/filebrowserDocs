---
title: "About"
description: "About the v2.0.0 release and what changed"
icon: "info"
date: "2026-07-23T17:03:27Z"
lastmod: "2026-10-26T00:00:00Z"
order: 0
---

FileBrowser Quantum **v2.0.0** is the largest upgrade to date. It refreshes how settings, users, and history are stored, simplifies configuration, and reshapes permissions so the product can grow without hitting the limits of the old design.

{{% alert context="warning" %}}
**Upgrading from v1.x?**

v2.0.0 **requires** a config update and a one-time database migration. Back up your `database.db` before upgrading and follow the {{< doclink path="getting-started/v2/migration/" text="migration guide" />}} step by step.
{{% /alert %}}

## Why v2.0.0?

Previously, everything was kept in a simple database that organized data as key/value pairs. That worked well for the original file browser, but it was a poor fit for richer features — activity history, reporting, and fine-grained permission lookups all need structured data that is easy to query and retain over time.

v2.0.0 replaces that layout with a structured on-disk database and a dedicated state management layer (described {{< doclink path="getting-started/v2/about/#new-state-management-architecture" text="below" />}}). The goal is better performance at scale and room for features the old format could not support cleanly, while keeping everyday browsing fast.

## Feature spotlights

The guides below cover v2.0.0's largest additions in depth. For the full release list — media player updates, WebDAV, CLI changes, breaking changes, and more — see the {{< doclink path="changelog/stable/#v200-stable" text="v2.0.0-stable release notes" />}}.

<div class="feature-spotlight-grid">

{{< feature-spotlight path="features/user-permissions/" title="User permissions" icon="lock" variant="permissions" >}}
Per-source view, download, modify, create, and delete — defaults, enforcement, and which Settings page to use.
{{< /feature-spotlight >}}

{{< feature-spotlight path="features/user-defaults/" title="User defaults" icon="tune" variant="defaults" >}}
Universal profile template for new users — enforce theme, preview, and global permission defaults.
{{< /feature-spotlight >}}

{{< feature-spotlight path="features/activity/" title="Activity Viewer" icon="monitoring" variant="activity" >}}
Audit log with charts and CSV export — what is recorded, retention, and report modes.
{{< /feature-spotlight >}}

</div>

## Breaking changes

{{% alert context="warning" %}}
v2.0.0 includes many breaking changes. Read the release notes carefully before upgrading.
{{% /alert %}}

Review the full list in the {{< doclink path="changelog/stable/#v200-stable" text="v2.0.0-stable release notes" />}} and make sure you understand what affects your deployment before upgrading. The {{< doclink path="getting-started/v2/migration/" text="migration guide" />}} walks through the upgrade steps.

## API and response cleanup

v2.0.0 standardizes several API conventions that were inconsistent in v1.x:

- **Removed legacy properties** from API responses and generated config output
- **Users addressed by username** in frontend-facing APIs (not numeric `id`)
- **Partial user updates** via `PATCH` — send only the fields you want to change
- **View vs download** — separate permission grants; `/api/resources/view` for inline non-media viewing, `/api/media/stream` for audio/video with range-based chunking (both use `viewToken` from file metadata)
- **Cleaner Swagger** — reflects current shapes without deprecated fields

If you maintain scripts or integrations, review the updated Swagger page at `/swagger` after upgrading.

## New state management architecture

v2.x.x uses **write-through state management**: the application keeps working copies in memory for speed, and saves changes to the database as they happen so a restart does not lose work.

```mermaid
flowchart LR
    ui[Web UI and API]
    stateLayer[Application state layer]
    runtimeMaps[Long-lived memory cache]
    ttlCache[Short-lived user cache]
    disk[(On-disk database)]

    ui --> stateLayer
    stateLayer --> runtimeMaps
    stateLayer --> ttlCache
    stateLayer --> disk
    runtimeMaps --> disk
    ttlCache --> disk
```

**How it differs from v1.x:**

| v1.x (BoltDB / Storm) | v2.x (SQLite + state) |
|---|---|
| Simple key/value storage — fine for basic settings, awkward for history and reports | Structured tables — suited to activity logs, user data, and complex queries |
| Data often re-read from disk when not already in memory | Hot data (shares, access rules, index metadata) stays in memory for the life of the process; user records use a timed cache with disk fallback |
| Hard to add features that span users, time ranges, or event types | Built for cross-user history, reporting, and safe schema upgrades |
| Updates could touch storage from many places | One state layer handles writes — easier to keep data consistent |

The state layer uses **two caching strategies**:

- **Long-lived memory cache** — shares, access rules, groups, token metadata, and index information load at startup and stay in memory. Reads are fast and writes update memory and disk together.
- **Short-lived user cache** — kept in memory only for a short time to prevent high access disk usage. This balances speed with memory use on busy instances.

Every change is written through to the on-disk database, so restarts recover a consistent picture. Your old `database.db` is read **once** during migration (`server.database.migrateFrom`); after that, v2 uses its own database file (see the {{< doclink path="getting-started/v2/migration/" text="migration guide" />}}).

## Before you upgrade

1. **Back up** your `database.db` file to a safe location
2. **Read the migration guide** — upgrading is a multi-phase process, not a simple image tag change
3. **Plan for rollback** — keep the old database backup until you have validated the migration

## Next steps

- {{< doclink path="changelog/stable/#v200-stable" text="v2.0.0-stable changelog" />}} — full v2.0.0 feature and fix list (newer stable patches: {{< doclink path="changelog/stable/" text="stable changelog" />}}; v2.1 previews: {{< doclink path="changelog/beta/" text="beta changelog" />}})
- {{< doclink path="getting-started/v2/migration/" text="Migration guide" />}} — step-by-step upgrade from v1.x
- {{< doclink path="features/user-permissions/" text="User permissions" />}} — per-source view/download/modify/create/delete
- {{< doclink path="features/user-defaults/" text="User defaults" />}} — enforceable profile template
- {{< doclink path="features/activity/" text="Activity Viewer" />}} — audit log and reporting
- {{< doclink path="configuration/users/" text="User management" />}} — YAML config, CLI, and API reference
- {{< doclink path="reference/cli/" text="CLI reference" />}} — updated user commands
- {{< doclink path="getting-started/Migration/troubleshooting/" text="Migration troubleshooting" />}} — common issues after upgrade
