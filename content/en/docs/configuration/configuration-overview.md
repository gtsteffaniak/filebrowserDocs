---
title: "Configuration Overview"
description: "Complete configuration guide for FileBrowser Quantum"
icon: "settings"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-03T16:40:00Z"
order: 1
---

{{% alert context="warning" %}}
**Upgrading to v2.0.0?**

v2.0.0 restructures config (SQLite database, `http` block, structured `userDefaults`, per-source permissions). Convert your existing `config.yaml` with the config migration tool before upgrading — see {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}}.
{{% /alert %}}

Complete configuration guide for all aspects of FileBrowser Quantum.

## Configuration Topics

- {{< doclink path="configuration/server/" text="Server Settings" />}} - Database, sources, caching
- {{< doclink path="configuration/http/" text="HTTP Settings" />}} - Port, listen address, base URL, TLS, WebDAV, proxy headers, and auth rate limiting
- {{< doclink path="configuration/sources/" text="Sources" />}} - File system source configuration
- {{< doclink path="configuration/authentication/" text="Authentication" />}} - Auth methods (password, OIDC, proxy)
- {{< doclink path="configuration/users/" text="Users" />}} - User management and permissions
- {{< doclink path="configuration/logging/" text="Logging" />}} - Configure logging output and levels
- {{< doclink path="configuration/frontend/" text="Frontend" />}} - Customize UI, branding, themes
- {{< doclink path="user-guides/general-configuration/multiple-configs/" text="Multiple Configs" />}} - Use multiple configuration files

## Basic Configuration Example

```yaml
http:
  port: 80

server:
  sources:
    - path: "/data"
      config:
        defaultEnabled: true

auth:
  adminUsername: admin
  methods:
    password:
      enabled: true
      minLength: 8

frontend:
  name: "My FileBrowser"
```

## Advanced Configuration Examples

### OIDC Configuration

```yaml
auth:
  methods:
    password:
      enabled: false # set to false if you only want to allow OIDC
    oidc:
      enabled: true                              # whether to enable OIDC authentication
      clientId: "xxx"                            # client id of the OIDC application
      clientSecret: "xxx"                        # client secret of the OIDC application
      issuerUrl: "http://localhost/application/o/filebrowser/" # URL of the OIDC provider
      scopes: "email openid profile groups"             # scopes to request from the OIDC provider
      userIdentifier: "preferred_username"       # the attribute used as username. Default/typical is "preferred_username", can also be "email" or "username", or "phone"
      disableVerifyTLS: false        # disable TLS verification for the OIDC provider. This is insecure and should only be used for testing.
      logoutRedirectUrl: ""          # if provider logout url is provided, filebrowser will also redirect to logout url. Custom logout query params are respected.
      createUser: true               # create user if it does not exist
      adminGroup: "authentik Admins" # if set, OIDC will manage whether a user is `admin` or not.
      groupsClaim: "groups"          # the JSON field name to read groups from. Default is "groups"
```

### Frontend Configuration

```yaml
frontend:
  name: "My FileBrowser"                  # display name
  disableDefaultLinks: false              # disable default links in the sidebar
  disableUsedPercentage: false            # disable used percentage for the sources in the sidebar
  externalLinks:
    - text: my home page                  # the text to display on the link  validate:required
      title: my home page                 # the title to display on hover
      url: https://domain.com/            # the url to link to  validate:required
  disableNavButtons: false                # disable the nav buttons in the sidebar
  styling:
    customCSS: "customstyles.css"         # if a valid path to a css file is provided, it will be applied for all users. (eg. "reduce-rounded-corners.css")
    lightBackground: "white"              # specify a valid CSS color property value to use as the background color in light mode
    darkBackground: "#141D24"             # Specify a valid CSS color property value to use as the background color in dark mode
    customThemes:                         # A list of custom CSS files that each user can select to override the default styling. if "default" is key name then it will be the default option.
      default:                            # by naming default, all logged-in users will see this theme by default
        description: The default theme
        css: "your-custom-theme.css"
```

### Media Integration

```yaml
integrations:
  media:
    ffmpegPath: "/usr/local/bin" # wherever you have both ffmpeg and ffprobe installed at
```

### Office Integration

```yaml
integrations:
  office:
    url: "http://onlyoffice-server:8000"  # OnlyOffice Document Server URL
    secret: "your-secret-key"             # Optional JWT secret for security
```

### Advanced Source Configuration

See  {{< doclink path="advanced/source-configuration/" text="Advanced Source Configuration" />}} for more info.

### User Directory Auto-Creation

```yaml
server:
  sources:
    - path: "/path/to/source1"
    - path: "/path/to/source2"
      config:
        defaultUserScope: "/subfolder" # include leading slash
        defaultEnabled: true
        createUserDir: true           # "/subfolder/username" directory will be created
```

## Configuration File Location

FileBrowser looks for `config.yaml` in:

1. Path specified with `-c` flag
2. Current directory
3. `FILEBROWSER_CONFIG` environment variable

## Next Steps

- {{< doclink path="configuration/sources/" text="Configure sources" />}}
- {{< doclink path="configuration/authentication/" text="Set up authentication" />}}
- {{< doclink path="configuration/users/" text="Manage users" />}}
- {{< doclink path="reference/fullconfig/" text="View full config reference" />}}
