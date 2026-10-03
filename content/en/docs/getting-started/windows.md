---
title: "Windows (v2.0.0)"
description: "Install FileBrowser v2.0.0 (beta) on Windows"
icon: "desktop_windows"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-03T14:30:00Z"
order: 4
---

{{% alert context="info" %}}
**This guide is for v2.0.0 (beta).** Download a **beta** release from GitHub.

Using **v1.5.x or older**? See the {{< doclink path="getting-started/windows-v1.5.x" text="v1.5.x Windows guide" />}} instead.
{{% /alert %}}

{{% alert context="warning" %}}
**Upgrading from v1.x?**

v2.0.0 requires a config update and one-time database migration. See the {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} before upgrading.
{{% /alert %}}

Run FileBrowser Quantum **v2.0.0 (beta)** natively on Windows.

## Download

1. Go to [releases page](https://github.com/gtsteffaniak/filebrowser/releases)
2. Download the **beta** `filebrowser-windows-amd64.exe` release
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
server:
  port: 80
  sources:
    - path: "C:\\Users\\YourName\\Documents"
      config:
        defaultEnabled: true
auth:
  adminUsername: admin
```

Or generate interactively:

```cmd
.\filebrowser.exe setup
```

## Run FileBrowser

```cmd
.\filebrowser.exe -c config.yaml
```

Access at `http://localhost:80`.

On **v2.1.0-beta and later**, a fresh install does not sign in as `admin` / `admin`. If the password is unset or set to `admin`, FileBrowser generates a random password and logs it once (`Generated initial admin password`). The username stays `admin` unless you change it. Set `auth.methods.password.adminPassword` or `FILEBROWSER_ADMIN_PASSWORD` before the first start when you want a chosen password. That value is applied again on every startup.

**v1.5.x (stable)** still uses `admin` / `admin`. See {{< doclink path="getting-started/windows-v1.5.x" text="Windows (v1.5.x)" />}}.

## Troubleshooting

For common issues and solutions, see the {{< doclink path="getting-started/Migration/troubleshooting/" text="Troubleshooting guide" />}}.

## Next Steps

- {{< doclink path="configuration/sources/" text="Configure sources" />}}
- {{< doclink path="configuration/authentication/" text="Set up authentication" />}}
- {{< doclink path="integrations/media/" text="Enable media integration" />}}

