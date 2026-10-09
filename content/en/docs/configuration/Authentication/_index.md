---
title: "Authentication"
description: "Configure authentication methods"
icon: "lock"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-03T15:10:00Z"
order: 4
---

## Group claims

OIDC, JWT, and LDAP authentication all support group-based authorization through `adminGroup`, `userGroups`, and `groupsClaim`. When `groupsClaim` is omitted, OIDC and JWT use `groups`. LDAP on **v2.0.3+ (beta)** uses `memberOf`. **v1.5.x (stable)** does not fill in an LDAP `groupsClaim`.

| Method | Default `groupsClaim` | Notes |
|--------|----------------------|-------|
| OIDC | `groups` | Set `groupsClaim` to match your provider's claim name. Add the `groups` scope to `scopes` when your provider requires it (for example PocketID). |
| JWT | `groups` | Include a `groups` array (or your custom claim) in the external JWT payload. |
| LDAP | `memberOf` | **v2.0.3+ (beta).** Stable v1.5.x does not set a default. Override when the directory uses a different attribute. |

On successful login, groups are synced into the access-control GroupMap for {{< doclink path="access-control/rules" text="group allow/deny rules" />}}. See each method's page for provider-specific examples.
