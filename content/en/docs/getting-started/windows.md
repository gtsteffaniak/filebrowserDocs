---
title: "Windows (v2.0.0)"
description: "Install FileBrowser v2.0.x (stable) on Windows"
icon: "desktop_windows"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-04T17:20:00Z"
order: 4
---

{{% alert context="info" %}}
**This guide is for v2.0.x (stable).** Download a **stable** release from GitHub (or use `beta` for v2.1.x previews).

Using **v1.5.x or older**? See the {{< doclink path="getting-started/windows-v1.5.x" text="v1.5.x Windows guide" />}} instead.
{{% /alert %}}

{{% alert context="warning" %}}
**Upgrading from v1.x?**

v2.0.0 requires a config update and one-time database migration. See the {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} before upgrading.
{{% /alert %}}

Run FileBrowser Quantum **v2.0.x (stable)** natively on Windows.

## Download

1. Go to [releases page](https://github.com/gtsteffaniak/filebrowser/releases)
2. Download the **beta** Windows asset `filebrowser.exe`
3. Save to a folder (e.g., `C:\FileBrowser\`)

## Optional: Install FFmpeg

For video preview support, [install FFmpeg](https://phoenixnap.com/kb/ffmpeg-windows).

## Create Configuration

Interactive setup:

```bash
.\filebrowser.exe setup
```

Or Create `config.yaml` in the same folder:

```yaml
http:
  port: 80
server:
  sources:
    - path: "C:\\Users\\YourName\\Documents"
      config:
        defaultEnabled: true
auth:
  adminUsername: admin
```

v2.0.0 and later read the listen port from `http.port`. A `server.port` key is rejected at startup.

Or generate interactively:

```cmd
.\filebrowser.exe setup
```

## Run FileBrowser

```cmd
.\filebrowser.exe -c config.yaml
```

Access at `http://localhost:80`.

On v2.x (v2.0.0+), if `adminPassword` is unset or left as `admin`, a random admin password is generated, logged once, and a password reset is required on first login. Any other value of `auth.methods.password.adminPassword` or `auth.adminPassword` is used as-is.

## Troubleshooting

For common issues and solutions, see the {{< doclink path="getting-started/Migration/troubleshooting/" text="Troubleshooting guide" />}}.

## Next Steps

- {{< doclink path="configuration/sources/" text="Configure sources" />}}
- {{< doclink path="configuration/authentication/" text="Set up authentication" />}}
- {{< doclink path="integrations/media/" text="Enable media integration" />}}

