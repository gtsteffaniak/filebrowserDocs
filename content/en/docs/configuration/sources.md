---
title: "Sources"
description: "Configure file system sources"
icon: "folder_open"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-03T16:40:00Z"
order: 3
---

Sources are the core concept in FileBrowser - each source represents a file system location users can access.

Indexing on each source provides folder sizes used by the UI and by **indexed-size storage quotas (v2.1.x)**. Sources with indexing disabled only support **tracked usage** quotas (v2.1.x). See {{< doclink path="features/quotas/" text="Storage quotas (v2.1.x)" />}} and {{< doclink path="features/indexing/" text="Indexing" />}}.

{{% alert context="info" %}}
**v2.0.0 source config**

Deprecated source options (`indexingIntervalMinutes`, `conditionals` wrapper, old rule field names) were removed in v2.0.0. See {{< doclink path="advanced/source-configuration/sources/" text="Advanced source configuration" />}} for current rule syntax.
{{% /alert %}}

{{% alert context="warning" %}}
**Setting up authentication?** New users only receive sources with `defaultEnabled: true`. When enabling password signup, OIDC, LDAP, JWT, or proxy auth, configure `defaultEnabled` on your sources at the same time. See [defaultEnabled](#defaultenabled) below.
{{% /alert %}}

{{% alert context="warning" %}}
A source should not be a root directory or include "/var" directory on linux.
{{% /alert %}}

## Basic Configuration

### Single Source

```yaml
server:
  sources:
    - path: "/path/to/files" # Do not use a root "/" directory or include the "/var" folder
      config:
        defaultEnabled: true
auth:
  adminUsername: admin
```

When only one source is configured, source paths will be available at `http://your-server/files/path/to/file`.

### Multiple Sources

```yaml
http:
  port: 80

server:
  sources:
    - path: "/path/to/source1" # enabled for all users
      name: "My Files"
      config:
        defaultEnabled: true
    - path: "/path/to/source2" # not default enabled!
      name: "Secured Files"
```

## Common Patterns

### Personal user directories

When `createUserDir` is enabled, each user gets a folder under the source below **`defaultUserScope`**, named after their username.

```yaml
server:
  sources:
    - path: "/home/users"
      config:
        defaultEnabled: true
        createUserDir: true
        #defaultUserScope: "/" # when createUserDir is false
```

### Shared + Personal

```yaml
server:
  sources:
    - path: "/shared/common"
      name: "Shared Files"
      config:
        defaultEnabled: true
    - path: "/shared/users"
      name: "My Files"
      config:
        private: true
```

## Source Configuration Options

### path

File system path. Can be relative or absolute. Required.

```yaml
server:
  sources:
    - path: "/data/files"
```

### name

Display name for the source. Optional. If not set, uses the base name of the path.

```yaml
server:
  sources:
    - path: "/data/files"
      name: "My Files"
```

### defaultEnabled

When `true`, this source is granted to **all** users:

- On **user creation** (password signup, admin create, and auto-create via OIDC / LDAP / JWT / proxy).
- On **every server startup** (v2.0.1+): any user missing this source gets it merged into their scopes. Existing scope paths for sources the user already has are preserved.

Default: `false`. Use `false` for sources that should only be assigned manually.

```yaml
server:
  sources:
    - path: "/data/shared"
      name: "Shared"
      config:
        defaultEnabled: true
    - path: "/data/restricted"
      name: "Restricted"
      # defaultEnabled: false — assign via admin UI

auth:
  methods:
    oidc:
      enabled: true
      # clientId, clientSecret, issuerUrl, ...
```

```yaml
server:
  sources:
    - path: "/data/files"
      config:
        defaultEnabled: true
```

{{% alert context="info" %}}
**v2.0.1+:** Before v2.0.1, startup only seeded `defaultEnabled` sources for users with **empty** scopes. Partial-scope users (common after migration or after adding a second source) did not receive new default-enabled sources until you assigned them by hand. From v2.0.1 onward, missing `defaultEnabled` sources are always merged on startup.
{{% /alert %}}

<div class="pattern-card">

### defaultUserScope

This is the directory path that a user is given access to by default. This is also the parent directory path used if you enable `createUserDir`.

For example if the source is `/`, and you configure `defaultUserScope: /users` and also enable `createUserDir`, then a user named `graham` will have a scope directory created at `/users/graham` and that will be their root directory.

Defaults to root of index `/`. Should match folders under path. Used when `createUserDir` is `false`.

```yaml
server:
  sources:
    - path: "/home/users"
      config:
        defaultUserScope: "/"
```

</div>

### createUserDir

Create a user directory for each user under `defaultUserScope` + `/`+ `username`. Default: `false`.

```yaml
server:
  sources:
    - path: "/home/users"
      config:
        defaultEnabled: true
        createUserDir: true
        defaultUserScope: "/"
```

This creates `/home/users/username` for each user. For example, a user `graham` would get a folder created at `/home/users/graham` and that would be their user scope. They wouldn't be able to access `/home/users/` folder.

### denyByDefault

Deny access unless an "allow" access rule was specifically created. Default: `false`.

```yaml
server:
  sources:
    - path: "/data"
      config:
        denyByDefault: true
```

See {{< doclink path="access-control/rules/" text="Access Rules" />}} for more information.

### private

Designate source as private — currently just means no sharing permitted. Default: `false`.

```yaml
server:
  sources:
    - path: "/private/data"
      config:
        private: true
```

### disabled

Disable the source. Useful so you don't need to remove it from the config file. Default: `false`.

```yaml
server:
  sources:
    - path: "/old/data"
      config:
        disabled: true
```

### useLogicalSize

Calculate sizes based on logical size instead of disk utilization (du -sh). Folders will be 0 bytes when empty. Default: `false`.

```yaml
server:
  sources:
    - path: "/data"
      config:
        useLogicalSize: false
```

<div class="pattern-card">

### rules

List of item rules to apply to specific paths. See {{< doclink path="advanced/source-configuration/sources/" text="Advanced Source Configuration" />}} for detailed information on rule options.

```yaml
server:
  sources:
    - path: "/data"
      config:
        rules:
          - neverWatchPath: ""
            includeRootItem: ""
            fileStartsWith: ""
            folderStartsWith: ""
            fileEndsWith: ""
            folderEndsWith: ""
            folderPath: ""
            filePath: ""
            fileName: ""
            folderName: ""
            viewable: false
            ignoreHidden: false
            ignoreZeroSizeFolders: false
            ignoreSymlinks: false
```
{{% alert context="info" %}}
**Note on `ignoreSymlinks`:** FileBrowser Quantum does not follow symbolic links during indexing by default. The `ignoreSymlinks` option allows you to exclude symlinks from the index entirely. See {{< doclink path="features/indexing/#symbolic-links" text="Symbolic Links documentation" />}} for more information.
{{% /alert %}}
</div>



## Next Steps

- {{< doclink path="features/quotas/" text="Storage quotas (v2.1.x)" />}}
- {{< doclink path="advanced/source-configuration/sources/" text="Advanced Source Configuration" />}}
- {{< doclink path="configuration/authentication/" text="Configure authentication" />}}
- {{< doclink path="configuration/users/" text="Manage users" />}}
- {{< doclink path="access-control/rules/" text="Set up access rules" />}}
