---
title: "Access Rules"
description: "Directory-level access control"
icon: "gavel"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-03-10T00:39:22Z"
order: 2
---

Control user access to specific directories with allow/deny rules.

{{% alert context="info" %}}
Access rules for shares apply based on the user that created the share.
{{% /alert %}}

{{% alert context="warning" %}}
FileBrowser Quantum access rules differ entirely from the original FileBrowser. Rules do not carry over when migrating.
{{% /alert %}}

## How Access Control Works

### Rule Variables

1. **User scope** — The user must have the source in their scopes.
2. **Deny/Allow** — The default behavior is to allow user access, unless the source is configured with {{< doclink path="configuration/sources#denybydefault" text="denyByDefault" />}}.
3. **Access rules** — Allow/deny rules for specific directories.

### Rule evaluation

When a user accesses a file or directory:

1. **Direct path check** — Rules on the exact path are considered first.
2. **Recursive parent check** — Parent directories are checked up to the root.
3. **Default behavior** — Access is granted if no rule applies, unless **denyByDefault** is enabled.

### Path matching

Starting in **v2.1.3** (beta) and **v2.0.2** (stable), access rule paths are matched **case-insensitively** on every source. Rules are stored in lowercase, so `/Private` and `/private` are the same rule.

On upgrade, existing rules are normalized at startup: paths are lowercased, and rules that collide after normalization are merged (allow and deny lists are combined). On case-sensitive filesystems, one rule still applies to every case variant of that path — folders that differ only by letter case share the same rule.

### Rule precedence

**More specific paths override broader ones.**

- A rule on `/folder/subfolder` overrides a rule on `/folder`.
- **Allow rules take priority over deny rules** when both apply.

## Creating access rules

### In the Web UI

1. Open **User Management** or **Group Management**.
2. Edit a user or group.
3. Select a **source**.
4. Open **Access Rules**.
5. Add allow or deny rules for the directories you need.

## Source configuration

{{% alert context="info" %}}
**Using groups:** OIDC, LDAP, and JWT authentication methods often map identity provider groups to FileBrowser Quantum groups. A typical pattern is to set the source to {{< doclink path="configuration/sources#denybydefault" text="denyByDefault" />}} and then grant access with rules tied to those groups.
{{% /alert %}}

<div class="pattern-card">

### denyByDefault

Configure per source in your config:

```yaml
server:
  sources:
    - path: "/data"
      config:
        denyByDefault: true  # Deny all unless explicitly allowed
```

With `denyByDefault: true`:

- Users can see that the source exists.
- There is **no** file access without explicit **allow** rules.
- You must add allow rules for each path they should use.

</div>

## Examples

<div class="pattern-card">

### Basic deny

**Rule:** Deny user `graham` access to `/`.

**Result:** `graham` cannot access any files or directories under that scope.

</div>

<div class="pattern-card">

### Allow a subfolder only

**Rules:**

- Deny user `graham` access to `/`.
- Allow user `graham` access to `/subpath`.

**Result:** `graham` can only access `/subpath` and its subdirectories.

</div>

<div class="pattern-card">

### Deny all with exceptions

**Rules:**

- **DenyAll** on `/vip`.
- Allow user `admin` access to `/vip`.

**Result:** Only `admin` can access `/vip`.

</div>

<div class="pattern-card">

### Departmental layout

**Rules:**

- Allow group `sales` access to `/departments/sales`.
- Allow group `engineering` access to `/departments/engineering`.
- Deny all users access to `/departments`.

**Result:** Each department only reaches its own folder.

</div>

## Rule types

<div class="pattern-grid pattern-grid--rule-types">

<div class="pattern-card rule-type-card">

<span class="rule-type-card__icon" aria-hidden="true">✓</span>
<div class="rule-type-card__body">

### Allow rules

Grant access to a path (read, write, execute, delete).

</div>
</div>

<div class="pattern-card rule-type-card">

<span class="rule-type-card__icon" aria-hidden="true">✕</span>
<div class="rule-type-card__body">

### Deny rules

Explicitly deny access to a path.

</div>
</div>

<div class="pattern-card rule-type-card">

<span class="rule-type-card__icon" aria-hidden="true">⊘</span>
<div class="rule-type-card__body">

### DenyAll rules

Deny **everyone** for that path until a specific **allow** overrides it.

</div>
</div>

</div>

## Troubleshooting

For common issues and fixes, see the {{< doclink path="access-control/troubleshooting/" text="Troubleshooting guide" />}}.
