---
title: "About FileBrowser Quantum"
description: "Learn about FileBrowser Quantum"
icon: "info"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-26T00:00:00Z"
---

Learn about FileBrowser Quantum - the best free self-hosted web-based file manager.

{{% alert context="info" %}}
**v2.0.x is on the stable release channel.** See {{< doclink path="getting-started/v2/about/" text="About v2.0.0" />}} for what's new and the {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} if you are upgrading from v1.x.
{{% /alert %}}

## Overview

FileBrowser Quantum provides an easy way to access and manage your files from the web. It has a modern responsive interface that has many advanced features to manage users, access, sharing, and file preview and editing.

This version is called "Quantum" because it packs tons of advanced features into a tiny and easy-to-run file. Unlike the majority of alternative options, FileBrowser Quantum is simple to install and easy to configure.

The goal for this repo is to become the best open-source self-hosted file browsing application that exists -- **all for free**. This repo will always be free and open-source.

## How It's Different

FileBrowser Quantum is a massive fork of the file browser open-source project with the following changes:

1. ✅ **Better source configuration** — multiple sources, include/exclude rules, and {{< doclink path="configuration/sources/" text="more" />}}
2. ✅ **Login support** for OIDC, LDAP, JWT, password + 2FA, and proxy
3. ✅ **Beautiful, responsive, and customizable** user interface
4. ✅ **Streamlined configuration** via `config.yaml` config file
5. ✅ **Efficient search** — powered by SQLite {{< doclink path="features/indexing/" text="indexing" />}}
   - Real-time search results as you type
   - Real-time monitoring and updates in the UI
   - Search supports file and folder sizes, along with various filters
6. ✅ **Better listing browsing**
   - Thumbnails support includes **office**, **video**, **album artwork**, and **3D models**
   - Faster and more responsive views with animations
   - **Folder sizes** are displayed and support thumbnails
   - Navigating remembers the last scroll position
   - WebDAV support
   - Granular permissions
7. ✅ **Highly configurable** {{< doclink path="shares/options/" text="sharing options" />}}
   - Share expiration time
   - Users who can access share (including anonymous)
   - Styling and themes
   - File viewing, editing, and uploading permissions
8. ✅ **Access control** scoped to user or group and source path
9. ✅ **Developer API support**
   - Ability to create long-lived API Tokens
   - A helpful Swagger page is available at `/swagger` endpoint for API enabled users

**Notable features removed from the original fork:**

- ❌ Shell commands are completely removed and will not be returned

FileBrowser Quantum differs significantly from the original version. Many of these changes required a significant overhaul. Creating a fork was a necessary process to make the program better.

## The User Interface

The UI has a simple three-component navigation system:

1. **(Left)** Multi-action button with slide-out panel
2. **(Middle)** The powerful search bar / title
3. **(Right)** The view change toggle / overflow menu

All other functions are moved either into the action menu or pop-up menus. If the action does not depend on context, it will exist in the slide-out action panel. If the action is available based on context, it will show up as a pop-up menu.

## System Requirements

- **Memory**: 256 MB minimum
- **GPU**: Not currently used (planned)

FileBrowser Quantum uses **SQLite-based indexing** — metadata is stored on disk rather than fully loaded into memory, so large filesystems are much less likely to cause out-of-memory errors than with in-memory indexing. Scan frequency, complexity, and cache settings still affect CPU, I/O, and typical memory use. See {{< doclink path="features/indexing/" text="Indexing Overview" />}} for scan strategies, performance expectations, and configuration.

## Current Status

- **v2.0.x (`stable`)** is the current major line for new v2 installs (latest: **v2.0.2-stable**). See {{< doclink path="getting-started/v2/about/" text="About v2.0.0" />}} and {{< doclink path="getting-started/version/" text="Which version should I use?" />}}
- **v2.1.x (`beta`)** previews features ahead of v2.0.x stable
- **v1.5.x (`stable`)** remains available for deployments that have not migrated yet

See [latest announcements](https://github.com/gtsteffaniak/filebrowser/discussions) for updates.

## Comparison with Alternatives

FileBrowser Quantum compares favorably with alternatives:

| Feature | Quantum | Filebrowser | Filestash | Nextcloud | Google Drive | FileRun |
|---------|---------|-------------|-----------|-----------|--------------|---------|
| Self-hostable | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Filesystem support | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Multiple sources | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| WebDAV support | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Standalone binary | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Docker image size | 180 MB | 31 MB | 240 MB | 250 MB | ❌ | > 2 GB |
| Min. memory | 256 MB | 128 MB | 128 MB | 512 MB | ❌ | 512 MB |
| Price | Free | Free | Free | Free tier | Free tier | $99+ |
| Advanced search | ✅ | ❌ | ✅ | Configurable | ✅ | ✅ |
| Indexed search | ✅ | ❌ | ✅ | Configurable | ✅ | ✅ |
| Single sign-on | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| LDAP sign-on | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| API documentation | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Office file previews | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Themes | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Branding | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Activity log | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Open source | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

See [full comparison chart](https://github.com/gtsteffaniak/filebrowser#comparison-chart) on GitHub for the complete feature matrix.

## Why This Fork Exists

This fork exists to create the ultimate version of FileBrowser with features and improvements that would take years to merge into the original project.

### Reasons for Forking

1. **Velocity** - The original maintainers are less active, changes would be 100x slower
2. **Vision** - My changes are an opinionated departure requiring nearly complete rewrite
3. **Freedom** - Full control over features, UX, and technical decisions

If you look at the commit history, I have personally contributed more code changes than any other contributor on the original FileBrowser. This version is well over 50% my code.

## Ultimate Vision

My vision for this free software:

- **Minimal requirements** - Easy to install and configure, even for Docker
- **Feature parity** - Compete with paid alternatives while remaining free
- **Powerhouse features** - Advanced media player, job manager, duplicate detection, security scanning
- **Metrics dashboard** - User activity, system activity, job activity, API activity

None of this would be possible without creating this forked repo.

## Get Started

Ready to try it out? See {{< doclink path="getting-started/" text="Getting Started" />}}.

## Next Steps

- {{< doclink path="getting-started/" text="Getting Started" />}}
- {{< doclink path="getting-started/v2/about/" text="About v2.0.0" />}}
- {{< doclink path="features/indexing/" text="Indexing Overview" />}}
- {{< doclink path="configuration/" text="Configuration" />}}
- {{< doclink path="help/qa/" text="Q&A" />}}
- [GitHub Repository](https://github.com/gtsteffaniak/filebrowser)
