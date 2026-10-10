---
title: "User Management"
description: "Manage users and permissions"
icon: "group"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-03T16:30:00Z"
order: 5
---

Configure users, permissions, and default user settings.

{{% alert context="warning" %}}
**v2.0.0 behavior change**

Starting in **v2.0.0**, file permissions are **per source**, not global. Each user scope (source assignment) has its own **view**, **download**, **modify**, **create**, and **delete** flags. **`view` is new in v2.0.0** — in v1.x, browsing and listing a source was always allowed once the user had that scope; v2.0.0 makes **view** an explicit grant (migration sets it to **true** on existing scopes unless you configure otherwise). Global user permissions are limited to **admin**, **api**, **share**, and **realtime** under `userDefaults.account.permissions`. File-operation defaults are `server.sources[].config.defaultPermissions` (**view**, **download**, **modify**, **create**, **delete**). v2.0.0 rejects the removed `userDefaults.permissions` key. CLI user commands also changed: use `user set` and `user promote` instead of `set -u` (see {{< doclink path="reference/cli/" text="CLI reference" />}}). See {{< doclink path="features/webdav/" text="WebDAV" />}} for how each capability maps to client operations.
{{% /alert %}}

## User Management

Users can be managed through:
- Web UI (User Management section)
- CLI commands
- API

## Default User Settings

There's two main areas that user settings are configured.

### User Source configuration

Configure defaults applied to new users:

<div class="pattern-card">

{{% alert context="warning" %}}
**Deprecated:** `createUserDir` on source `config` is deprecated (user directories under `defaultUserScope` are always created for new users when applicable). Prefer setting `defaultUserScope` only; remove `createUserDir` from new configs.
{{% /alert %}}

```yaml
server:
  sources:
    - path: "/data"
      config:
        defaultEnabled: true         # Give to all new users
        defaultUserScope: "/"       # Default access path under the source
```

</div>

### User Defaults

User defaults are configured on the `config.yaml` and are the default initial values for users when they are created.

<div class="pattern-card">

User defaults can still be listed in `config.yaml` to **bootstrap** a new instance: on first startup, values are seeded into SQLite and only the fields you set remain locked in **Settings → User management → User defaults**. After that, the database is authoritative. Remove `userDefaults` from config when you no longer need those locks on fresh installs.

Legacy flat keys (for example `hideFilesInTree`, `permissions.modify`) are no longer supported — use the nested v2 structure shown below. Move legacy `permissions.modify`, `create`, `delete`, and `download` under `userDefaults` to `server.sources[].config.defaultPermissions` for per-source defaults.

{{% alert context="info" %}}
**Note**: Config `userDefaults` do not overwrite existing users after creation. They seed universal defaults for **new** users and the admin **User defaults** template in SQLite.
{{% /alert %}}

This shape is valid on **v2.0.x** through **v2.1.x**. Omit keys you want to leave at defaults. v2.1.x also adds `listing.promptRightCloseButton`, `listing.newFileTemplate`, and `account.showAdvancedProfile`.

```yaml
userDefaults:
  sidebar:
    disableQuickToggles: false
    hideFileActions: false
    disableHideOnPreview: false
    sticky: true
    hideFiles: false
    showTools: true
  listing:
    deleteWithoutConfirming: false
    dateFormat: false
    showHidden: false
    quickDownload: false
    showSelectMultiple: false
    singleClick: false
    hideFileExt: ""
    showCopyPath: false
    deleteAfterArchive: true
    viewMode: "normal"
    gallerySize: 3
  preview:
    image: true
    video: true
    audio: true
    motionVideoPreview: true
    office: true
    popup: true
    disablePreviewExt: ""
    highQuality: true
    folder: true
    models: true
  fileViewer:
    editorQuickSave: false
    autoplayMedia: true
    disableViewingExt: ""
    disableOnlyOfficeExt: ".md .txt .pdf .html .xml"
    preferEditorForMarkdown: false
    debugOffice: false
  search:
    disableOptions: false
  ui:
    darkMode: true
    themeColor: "var(--blue)"
    customTheme: ""
    locale: "en"
  fileLoading:
    maxConcurrentUpload: 10
    uploadChunkSizeMb: 10
    clearAll: false
    downloadChunkSizeMb: 0
  account:
    permissions:
      api: false
      admin: false
      share: false
      realtime: false
    lockPassword: false
    disableSettings: false
    loginMethod: "password"
    disableUpdateNotifications: false
```

</div>

For what each `fileLoading` field does (matching **Settings → Uploads & Downloads**), see {{< doclink path="user-preferences/uploads-downloads/" text="Uploads & Downloads (user preferences)" />}}.

`userDefaults.account.permissions` are not editable by non-admin users in the profile UI. Those global flags (**admin**, **api**, **share**, **realtime**) live on the user. File-operation defaults for a new scope come from `server.sources[].config.defaultPermissions` unless you set explicit per-source permissions in User Management.

## Creating Users

### Via Web UI

1. Log in as admin
2. Go to **User Management**
3. Click **Create User**
4. Set username, password, global permissions, and **per-source permissions** on each scope
5. Assign sources and scope paths

### Via CLI

```bash
./filebrowser user set username --password secret -c config.yaml
```

Create as admin:

```bash
./filebrowser user set username --password secret -a -c config.yaml
```

Promote an existing user to admin without changing their password:

```bash
./filebrowser user promote username -c config.yaml
```

For scripted password resets, pipe stdin:

```bash
echo 'newpassword' | ./filebrowser user set username --password -c config.yaml
```

## User Permissions

### Global permissions (all sources)

Configure on the user record; apply everywhere:

| Permission | Purpose |
|---|---|
| **Admin** | Full system access, user management, configuration |
| **API** | Create API tokens, REST API access |
| **Share** | Create and manage share links |
| **Realtime** | Real-time connections and live updates |

Admins receive full file-operation access on every source automatically.

### Per-source file permissions (v2.0.0+)

Configure **per scope** in User Management when editing a user — expand a source row to set:

| Permission | Typical use |
|---|---|
| **View** | Browse folders, list files, see properties (WebDAV `PROPFIND`). **New in v2.0.0** — in v1.x this was always granted for any source in the user's scopes |
| **Download** | Read or download file contents (`GET`, streaming, copy source) |
| **Modify** | Edit, upload/overwrite, rename, move within or across sources |
| **Create** | Create files and folders, copy into this source |
| **Delete** | Delete files and folders |

Omitting permissions on a scope when saving via API lets the server apply **Access management default permissions** for that source. Explicit values override defaults. See {{< doclink path="features/user-permissions/" text="User permissions" />}}.

### API user shape (v2.0.0+)

```json
{
  "username": "demo",
  "password": "demo123",
  "permissions": {
    "admin": false,
    "api": true,
    "share": true,
    "realtime": false
  },
  "scopes": [
    {
      "name": "files",
      "scope": "/",
      "permissions": {
        "view": true,
        "download": true,
        "modify": true,
        "create": true,
        "delete": true
      }
    }
  ]
}
```

Legacy API payloads that put `modify`, `create`, `delete`, or `download` only under top-level `permissions` are migrated on upgrade; new integrations should use `scopes[].permissions`.

## User Scopes

Scopes define which sources and paths a user can access.

### Assign Scope

In User Management:
1. Edit user
2. Select source(s)
3. Set scope path (e.g., `/`, `/subfolder`, `/users/john`)
4. Expand each source row and set **per-source permissions** (view, download, modify, create, delete)
5. Save

### Auto-Create User Directories

Per-user directories are created under each source’s `defaultUserScope` using the username (the old `createUserDir` toggle is deprecated):

<div class="pattern-card">

```yaml
server:
  sources:
    - path: "/home/users"
      config:
        defaultEnabled: true
        defaultUserScope: "/"
```

This creates `/home/users/<username>` for each new user and scopes them to that folder.

</div>

## User Groups

Groups are currently managed and provided by the LDAP or OIDC provider. Adding groups manually in technically supported via API (see swagger), but not yet implemented as a feature in the UI. Stay tuned.

## Password Management

### Set Password Requirements

Minimum password length for password authentication:

```yaml
auth:
  methods:
    password:
      minLength: 12
```

### Reset User Password

```bash
./filebrowser user set username --password newpassword -c config.yaml
```

Or pipe the password from a script:

```bash
echo 'newpassword' | ./filebrowser user set username --password -c config.yaml
```

## Two-Factor Authentication

Users can enable 2FA in their profile settings:
1. Go to **Profile** → **Security**
2. Click **Enable 2FA**
3. Scan QR code
4. Enter verification code

## API Tokens

Users with API permission can create tokens:
1. Go to **Settings** → **API Management**
2. Click **Create Token**
3. Copy and save securely

## Next Steps

- {{< doclink path="access-control/rules/" text="Configure access rules" />}}
- {{< doclink path="access-control/rules/" text="Set up groups" />}}
- {{< doclink path="configuration/authentication/" text="Configure authentication" />}}

