---
title: "Which version should I use?"
description: "Understanding stable vs beta releases and v1.5.x vs v2.0.0"
icon: "numbers"
date: "2025-10-28T22:14:01Z"
lastmod: "2026-10-03T15:30:00Z"
order: 5
---

FileBrowser Quantum comes with two release channels (**stable** and **beta**) and is currently transitioning from **v1.5.x** to **v2**. Choosing the right version is an important first step. v2 is not a stable release yet.

{{% alert context="info" %}}
**Current state:** **v1.5.x** is on the `stable` channel. Latest stable release: [v1.5.6-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.6-stable). **v2** is on the `beta` channel only. Latest beta release: [v2.1.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v2.1.0-beta). v2 still requires a one-time migration from v1.x. See {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} before upgrading.
{{% /alert %}}

{{% alert context="success" %}}
**Recommended for new users:** Start with **v1.5.x (`stable`)** for the most reliable experience, unless you specifically want v2.0.0 features.
{{% /alert %}}

## Release Types

### Stable Release (v1.5.x)

The `stable` release build is the most reliable version as the name implies. It currently tracks **v1.5.x** (latest [v1.5.6-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.6-stable)). It gets updated less frequently, but is ideal for:

- Those getting started with FileBrowser Quantum
- Users with a userbase that doesn't want to see occasional bugs
- Production environments requiring stability
- Anyone who prefers proven, tested features

### Beta Release (v2.x)

The `beta` release build currently tracks **v2** (latest [v2.1.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v2.1.0-beta)) and is ideal for those who:

- Don't have a large userbase
- Want the latest features immediately
- Are comfortable with potential issues
- Want to contribute to development

{{% alert context="warning" %}}
Beta builds are frequently updated and may encounter unexpected issues. If you run the beta build, it's encouraged that you participate in beta discussions and open GitHub issues for any new issues found.
{{% /alert %}}

### Slim Release (for docker only)

`stable` and `beta` images have a `slim` variant. Slim images are much smaller than its counterparts. This is because slim version do not include FFmpeg and document preview bundled along with the image. You can still integrate with OnlyOffice for document editing/viewing. the slim version also supports armv7 platform for devices such as raspberry pi. This is ideal for those who:

- Don't want preview for files
- Want to save space in disk

## Release Cadence

One major difference is the release cadence between the two versions:

<div class="release-schedule">
  <div class="release-type">
    <h4>Stable</h4>
    <p>~ 1 to 3 months</p>
  </div>
  <div class="release-type">
    <h4>Beta</h4>
    <p>~ 1 to 3 weeks</p>
  </div>
</div>

## Major version: v1.5.x vs v2

| | v1.5.x (`stable`) | v2 (`beta`) |
|---|---|---|
| Release channel | `stable`, `1.5-stable`, `1.5.6-stable` | `beta`, `2-beta`, `2.1-beta` |
| Database | Legacy (`database.db`) | New (`filebrowser.sqlite`) |
| Getting started docs | {{< doclink path="getting-started/docker-v1.5.x" text="v1.5.x guides" />}} | {{< doclink path="getting-started/docker" text="v2.0.0 guides" />}} |
| Upgrade path | Stay on stable for production | Follow {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} from v1.x |

## Feature Differences

Eventually, stable release gets all the same features as beta releases, but they lag behind the release schedule. Because of this, features may not come to stable for a month or two.


Within one major version, stable and beta builds of the same release are meant to match. v1.5.x stable and v2 beta do not: v2 is still beta-only and has its own database, config, and features.

## Version Number Meaning

Versioning follows [semantic versioning](https://semver.org/) in format and I try to follow the process version increment. This means:

<div class="version-types">
  <div class="version-type">
    <h4>Major version update (v1.0.0 → v2.0.0)</h4>
    <p>An overhaul of major features or compatibility differences.</p>
  </div>

  <div class="version-type">
    <h4>Minor version update (v1.0.0 → v1.1.0)</h4>
    <p>Can include a collection of features and changes that shouldn't cause any major compatibility issues. All changes should be made in a backwards compatible way.</p>
  </div>

  <div class="version-type">
    <h4>Patch version update (v1.0.0 → v1.0.1)</h4>
    <p>For bugfixes, and other minor changes that don't impact functionality.</p>
  </div>
</div>

{{% alert context="info" %}}
Stable and beta versions of the same major or minor version should have the exact same features and functionality. However, small differences may exist in patch version updates.
{{% /alert %}}

## Docker Version Tags

When using Docker, you have access to multiple tag formats for precise version control:

### Tag Formats

- **Release type tags**: `stable`, `beta`, `latest` - Always point to the latest version of that release type
- **Full version tags**: `1.2.5-stable`, `1.1.3-beta`, `2.0.0-preview` - Pin to a specific version
- **Major.minor tags**: `1.2-stable`, `1.1-beta`, `2.0-preview` - Automatically receive patch updates within that minor version
- **Major tags**: `1-stable`, `2-beta`, `1-preview` - Automatically receive all updates within that major version

### Choosing the Right Tag

- **For production**: Use major.minor tags (e.g., `1.2-stable`) to get bug fixes and security patches while avoiding major version changes
- **For testing**: Use release type tags (e.g., `beta`) to always get the latest version
- **For stability**: Use full version tags (e.g., `1.2.5-stable`) when you need to lock to a specific version

{{% alert context="info" %}}
All version tags are available for both regular and slim images. For example: `1.2-stable-slim`, `1-stable-slim`, etc.
{{% /alert %}}

## When to Move to Beta Instead of Stable?

I definitely need and welcome anyone that wants to use beta -- it's the best version! But it's also most likely to see issues.

So, I would recommend using stable unless there's a feature you need that only exists in beta.

If you move to beta, please join the discussions on GitHub and raise issues for things you see. Having an active beta community is one thing that helps make stable ... stable.

## What If Stable Has Bugs?

There are two types of bugs in stable:

1. **Known Bugs**:
   - Bugs that have existed and are known. Perhaps they require big changes to make work or there's some other non-trivial reason it's in stable. Please search GitHub for the issue and see if it is known or if there's a fix coming that may exist in beta. These type of issues need to be fixed over a longer period of time in beta to ensure there's no additional unintentional changes as a result of the bugfix.
2. **New Bugs**:
   - Bugs that are new and trivial. These bugs probably also exist in beta and have not been discovered yet. If this does happen and the fix is clear and simple, I may update stable directly with a *patch* release.

{{% alert context="info" %}}
All software has bugs -- and my stable release may have some still. Stable doesn't mean it's bug-free, it means it has a slower and more refined release process to ensure changes happen smoothly.
{{% /alert %}}

<style>
.release-schedule {
  display: flex;
  gap: 2rem;
  margin: 1.5rem 0;
  justify-content: center;
}

.release-type {
  text-align: center;
  padding: 1.5rem;
  border: 2px solid var(--primary, #0ea5e9);
  border-radius: 8px;
  background: rgba(14, 165, 233, 0.05);
  min-width: 150px;
}

.release-type h4 {
  margin: 0 0 0.5rem 0;
  color: var(--primary);
  font-size: 1.2em;
}

.release-type p {
  margin: 0;
  font-weight: 600;
  color: var(--text-default);
}

.version-types {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0;
}

.version-type {
  padding: 1rem;
  border-left: 4px solid var(--primary, #0ea5e9);
  background: rgba(14, 165, 233, 0.05);
  border-radius: 0 4px 4px 0;
}

.version-type h4 {
  margin: 0 0 0.5rem 0;
  color: var(--primary);
  font-size: 1.1em;
}

.version-type p {
  margin: 0;
  color: var(--text-default);
}

.bug-types {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0;
}

.bug-type {
  padding: 1rem;
  border-left: 4px solid #f59e0b;
  background: rgba(245, 158, 11, 0.05);
  border-radius: 0 4px 4px 0;
}

.bug-type h4 {
  margin: 0 0 0.5rem 0;
  color: #f59e0b;
  font-size: 1.1em;
}

.bug-type p {
  margin: 0;
  color: var(--text-default);
}

/* Dark mode support */
[data-dark-mode] .release-type {
  background: rgba(14, 165, 233, 0.1);
}

[data-dark-mode] .version-type {
  background: rgba(14, 165, 233, 0.1);
}

[data-dark-mode] .bug-type {
  background: rgba(245, 158, 11, 0.1);
}

/* Responsive design */
@media (max-width: 768px) {
  .release-schedule {
    flex-direction: column;
    align-items: center;
  }

  .release-type {
    min-width: 200px;
  }
}
</style>
