---
title: "User Defaults"
description: "Universal user defaults and enforceable profile preferences in FileBrowser Quantum v2.0.0"
icon: "tune"
date: "2026-08-07T19:31:41Z"
lastmod: "2026-10-03T16:30:00Z"
order: 3
---

{{% alert context="warning" %}}
**This page applies to v2.0.0+**

User defaults have always been possible to set in the configuration file. However, in **v2.0.0+** they are now configurable and optionally enforce them in the UI by an admin user to apply to non-admin users.
{{% /alert %}}



## Overview

User defaults cover **profile and account preferences** — theme, preview behavior, sidebar layout, file viewer options, upload settings — plus **global permissions** (**admin**, **api**, **share**, **realtime**) for new users. File-operation permissions (**view**, **download**, **modify**, **create**, **delete**) are **not** part of user defaults in v2.0.0; configure those per source in **Settings → Access management** or source config. See {{< doclink path="features/user-permissions/" text="User permissions" />}}.

If any user default value is set in the config, it will be locked out from the UI. If you want to adjust them in the UI, you can remove them from the config file and edit them in the UI.

{{% alert context="warning" %}}
**Defaults do not update existing users unless they are enforced**

Changing user defaults (theme, locale, global permissions, and so on) affects **new** users. It does **not** change existing users — unless you enable **Enforce** on that field, which immediately update all non-admin users to match.
{{% /alert %}}


## Config file vs editable via web page

On **first startup**, `userDefaults` in `config.yaml` seeds database. Only fields you explicitly set in config remain **locked** in **Settings → User management → User defaults** (shown as config-locked). After initial launch and the settings will be saved in the UI and you can safely remove them from the config and adjust them freely in the UI.

```yaml
userDefaults:
  ui:
    darkMode: true
    locale: "en"
  sidebar:
    sticky: true
  account:
    permissions:
      admin: false
      api: false
      share: false
      realtime: false
  preview:
    image: true
    video: true
  fileLoading:
    maxConcurrentUpload: 10
```

For the full YAML shape, see {{< doclink path="configuration/users/#user-defaults" text="User management — User defaults" />}}.

## Opening the User defaults editor

1. Log in as admin
2. Open **Settings → User Management**
3. Click **User defaults**

The editor mirrors the profile settings users see under **Settings → Profile**, grouped by category (listing, preview, sidebar, file viewer, uploads, account, and so on). Admins edit the **template values** that apply to new users and can toggle **enforce** on individual fields.

## Enforced user defaults

When an admin enables **enforce** on a user default field:

- **All non-admin users** are updated.
- Non-admin users see enforced fields as **locked** in their Profile with an "enforced by admin" indicator.
- **Admin users are exempt** — for themselves and other admin users.

{{% alert context="info" %}}
Enforcement for **per-source file permissions** is also in **Access management**. See {{< doclink path="features/user-permissions/#enforced-source-permissions" text="Enforced source permissions" />}}.
{{% /alert %}}

## Related topics

- {{< doclink path="features/user-permissions/" text="User permissions" />}} — per-source view/download/modify/create/delete and enforced source caps
- {{< doclink path="configuration/users/" text="User management" />}} — CLI, API, and full config reference
- {{< doclink path="user-preferences/" text="User preferences" />}} — end-user profile settings guide
- {{< doclink path="getting-started/v2/about/" text="About v2.0.0" />}} — release summary and migration context
