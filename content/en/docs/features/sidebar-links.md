---
title: "Sidebar Customization"
description: "Sidebar Link usage and examples"
icon: "read_more"
date: "2025-12-23T00:30:21Z"
lastmod: "2026-10-05T13:30:00Z"
---

The sidebar is fully customizable per user — configure your own links, icons, and order.

Separate from links, **Settings → Profile** includes toggles for sidebar behavior (quick toggles, file actions, tree layout, and keeping the sidebar open while previewing or editing). See {{< doclink path="user-preferences/sidebar-options/" text="Sidebar options (profile settings)" />}}.

## Default configuration

By default, a user's sidebar is populated with the sources they have access to. But after a user is created they will need to update their sidebar to add/remove sources.

<img width="300" src="/images/features/sidebar/default.png">

## Customizing the sidebar

Each user can customize their sidebar in a persistent way that persists wherever that user logs in.

<img width="500" src="/images/features/sidebar/click-customize-sidebar.png">

Items can be added, removed, and re-arranged.

<img width="500" src="/images/features/sidebar/customizing.png">

## Link types

Theres currently 4 different link types:

1. **Source**: This will show the usage bar if configured and link to the source. The subpath is configurable. You can have multiple links to the same source, useful if you set different subpaths within a source.
2. **Share**: This will be a link to a share path. The subpath is also configurable.
3. **Tool**: You can link to "tools" which is the main tools page that shows all tools, or select individual tools to link directly.
4. **Custom**: This supports any URL such as "https://google.com" or any relative path on filebrowser, such as `/settings` or add even your favorite folder you frequent.

### Source link configuration

After selecting the desired source, you can configure the display name, a subpath, and an icon.

If you leave icon blank, it will default to the green/yellow/red status indicator with the progress bar. If you specify an icon, it will show a minimal button with that icon.

When editing a **source** link (**v2.0.10-beta+**), the **Limit disk usage to source filesystem** toggle switches the usage bar between:

- **Off (default):** aggregated disk total for the source path, including nested mounts. Shared pools (for example multiple ZFS datasets under one source) are counted once.
- **On:** usage for only the filesystem that contains the source root path (root-filesystem-only view).

This is stored per sidebar link (category suffix `-root` in the link data), not as a global config key.

<img width="500" src="/images/features/sidebar/edit-path.png">

### Share link configuration

Share links are similar to source links, allowing selecting a share thats available and a subpath for that share.

{{% alert context="info" %}}
In order to choose a share, a user must have "share" permissions. Otherwise, a user must use custom-links to create share links.
{{% /alert %}}

### Tool link configuration

Tool links are a list of direct links to tools. If a user selects `tools` then the link will go to the tools overview page that lists all tools.

### Custom link configuration

Custom links offer name, path, and icon support. This is a general purpose link that can act as a favorite/bookmark in the bar. Supporting external links as well as shares. A relative link is also possible, for example `/public/share/OGHKSEl-Wt4Q006pTvlKeQ`

## Customization example

You can create an unlimited number of custom links and sort them however you like. See this example

<img width="400" src="/images/features/sidebar/share.png">
