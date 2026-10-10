---
title: "Advanced Search"
description: "Search the index with sources, filters, and a configurable result limit"
icon: "manage_search"
date: "2026-10-10T00:00:00Z"
lastmod: "2026-10-10T00:00:00Z"
---

{{% alert context="info" %}}
**v2.1.x**
{{% /alert %}}

Advanced Search is available under **Tools → Advanced Search** or at `/tools/advancedSearch`. It calls `GET /api/tools/search` with the same indexed search engine as the quick search bar, plus per-source scope pickers and optional filters.

## Maximum search results (admin config)

**Config key:** `server.searchResultsLimit` (integer, minimum `1`, default `1000`)

This caps how many indexed matches a single search request may return across all selected sources. The UI and API never exceed this value.

```yaml
server:
  searchResultsLimit: 1000
```

The running limit is also exposed to the frontend as `globalVars.searchResultsLimit` (see `backend/internal/web/static.go`).

## Per-search limit (Advanced Search UI)

In **Advanced Search**, open **Show more** under search options. The **Maximum search results** control is a range slider (`1` … `searchResultsLimit`).

- Initial slider value: `min(500, searchResultsLimit)` (stored in component state as `resultLimit`).
- Each search sends `limit=<resultLimit>` on the `/api/tools/search` query string.

Quick search in the main UI does not send `limit`; the backend uses **100** matches for those requests. The **File Size Analyzer** (`largest=true`) still uses **200** and is not affected by `searchResultsLimit`.

## API

`GET /api/tools/search` accepts optional `limit` (positive integer). Values above `server.searchResultsLimit` are clamped. Omit `limit` for the quick-search default (**100**).

See also {{< doclink path="configuration/server/#minsearchlength" text="server.minSearchLength" />}} for minimum term length and {{< doclink path="features/search/" text="Search" />}} for general search behavior.

## Access

Users need the **Advanced Search** tool enabled (admin **Settings → User management → Tool access**, tool id `advancedSearch`).
