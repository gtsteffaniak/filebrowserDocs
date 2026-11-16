---
title: "Which version should I use?"
description: "Understanding stable vs beta releases and v1.5.x vs v2.0.0"
icon: "numbers"
date: "2025-10-28T22:14:01Z"
lastmod: "2026-10-30T00:00:00Z"
order: 5
---

FileBrowser Quantum comes with two release channels (**stable** and **beta**) across **v1.5.x**, **v2.0.x**, and **v2.1.x**. Choosing the right version is an important first step.

{{% alert context="info" %}}
**Current state:** **`stable`** and **`latest`** point to **v2.0.2-stable** (current v2.0.x stable). **v1.5.x** is maintained on the **`1.5-stable`** tag only — not on `stable`/`latest`. **v2.1.x** is on the **`beta`** channel (for example **v2.1.3-beta**). Upgrading from v1.x to v2.0.x requires a one-time migration — see {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} before changing tags.
{{% /alert %}}

{{% alert context="success" %}}
**Recommended for new users:** Start with **v2.0.x (`stable` / `2.0-stable`)**. Use **`beta` / `2.1-beta`** when you want v2.1.x features before they reach stable. Stay on **`1.5-stable`** only if you must remain on legacy v1.5.x until you are ready to migrate.
{{% /alert %}}

## Release Types

### Stable Release (v2.0.x)

The `stable` and `latest` tags currently track **v2.0.x** (patch releases such as **v2.0.2-stable**). For production on the v2.0.x line, pin **`2.0-stable`** (or a full tag such as **`2.0.2-stable`**). The **`2-stable`** major tag moves to the next stable minor when v2.1.x ships — use it only if you intend to follow that upgrade. Ideal for:

- New FileBrowser Quantum installs on v2
- Production environments requiring stability
- Anyone who prefers proven, tested features

**v1.5.x** remains available on **`1.5-stable`** for legacy installs only — not recommended for new projects.

### Beta Release (v2.1.x)

The `beta` tag currently tracks **v2.1.x** (for example **v2.1.3-beta**), ahead of **v2.0.x** stable. Ideal for those who:

- Don't have a large userbase
- Want the latest features immediately
- Are comfortable with potential issues
- Want to contribute to development

{{% alert context="warning" %}}
Beta builds are frequently updated and may encounter unexpected issues. If you run the beta build, it's encouraged that you participate in beta discussions and open GitHub issues for any new issues found.
{{% /alert %}}

### Slim Release (for docker only)

`stable` and `beta` images have a `slim` variant. Slim images omit FFmpeg and bundled document preview. Slim builds also support **arm32** (for example Raspberry Pi). Ideal for those who:

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

## Major version: v1.5.x vs v2.0.x vs v2.1.x

| | v1.5.x (`1.5-stable`) | v2.0.x (`stable`, `2.0-stable`) | v2.1.x (`beta`, `2.1-beta`) |
|---|---|---|---|
| Release channel | `1.5-stable` only | `stable`, `latest`, `2.0-stable`, `2-stable` | `beta`, `2.1-beta` |
| Database | Legacy (`database.db`) | SQLite — `database.sqlite` in Docker; `filebrowser.sqlite` default on standalone | Same as v2.0.x |
| Getting started docs | Migrate via {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} | {{< doclink path="getting-started/docker" text="v2.0.x guides" />}} | Same v2 guides; see {{< doclink path="changelog/beta/" text="beta changelog" />}} for v2.1.x-only features |
| Upgrade path | Legacy maintenance only | Default for new v2 installs | Move from v2.0.x when you want v2.1.x features |
| From v1.x | N/A | Follow {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} | Migrate to v2.0.x first, then beta if desired |

## Feature Differences

Eventually, stable release gets all the same features as beta releases, but they lag behind the release schedule. Because of this, features may not come to stable for a month or two.


Other than that, the releases are identical in functionality between major versions.

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
Stable and beta tags for the same major.minor line (for example **v2.0.x**) should have the same features and functionality; patch releases may differ slightly. **v2.1.x** beta can include features not yet in **v2.0.x** stable.
{{% /alert %}}

## Docker Version Tags

When using Docker, you have access to multiple tag formats for precise version control:

### Tag Formats

- **Release type tags**: `stable`, `beta`, `latest` — `latest` matches **`stable`** (currently v2.0.x). `beta` tracks v2.1.x.
- **Full version tags**: `2.0.2-stable`, `2.1.3-beta` — pin to an exact release
- **Major.minor tags**: `2.0-stable`, `2.1-beta` — receive patch updates within that minor line
- **Major tags**: `2-stable`, `2-beta` — receive updates within that major version (when v2.1.x becomes stable, `2-stable` will move to the new stable minor — plan migrations accordingly)

Legacy v1 examples still exist (`1.5-stable`, `1.5.8-stable`, and similar) but v2 tags do **not** include `2.0-preview`.

### Choosing the Right Tag

- **For production (stay on v2.0.x)**: Use `2.0-stable` or a full tag such as `2.0.2-stable`. Treat `2-stable` as a moving tag that will advance to v2.1.x when that line becomes stable.
- **For testing v2.1.x**: Use `beta` or `2.1-beta`
- **For locking a build**: Use a full tag such as `2.0.2-stable` or `2.1.3-beta`

{{% alert context="info" %}}
All version tags are available for both regular and slim images. For example: `2.0-stable-slim`, `2-stable-slim`, `beta-slim`.
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
