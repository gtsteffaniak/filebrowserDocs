---
title: "Windows (v2.0.0)"
description: "Install FileBrowser v2.0.x (stable) on Windows"
icon: "desktop_windows"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-30T00:00:00Z"
order: 4
---

{{% alert context="info" %}}
**This guide is for v2.0.x (stable).** Download a **stable** release from GitHub (or use `beta` for v2.1.x previews).
{{% /alert %}}

{{% alert context="warning" %}}
**Upgrading from v1.x?**

v2.0.0 requires a config update and one-time database migration. See the {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} before upgrading.
{{% /alert %}}

Run FileBrowser Quantum **v2.0.x (stable)** natively on Windows.

## Download

1. Go to the [releases page](https://github.com/gtsteffaniak/filebrowser/releases)
2. Download the **stable** Windows asset `filebrowser.exe`
3. Save to a folder (for example `C:\FileBrowser\`)

## Optional: Install FFmpeg

For video preview support, [install FFmpeg](https://phoenixnap.com/kb/ffmpeg-windows).

## Create Configuration

Interactive setup:

```cmd
.\filebrowser.exe setup
```

Or create `config.yaml` in the same folder (YAML accepts forward slashes in paths):

```yaml
http:
  port: 8080
server:
  sources:
    - path: C:/Users/YourName/Documents
      config:
        defaultEnabled: true
auth:
  adminUsername: admin
```

v2.0.0 and later read the listen port from `http.port`. A `server.port` key is rejected at startup.

Port **80** is often already used (IIS, other apps). **8080** is a safer default. Allow FileBrowser through **Windows Defender Firewall** when prompted for a new listener.

## Run FileBrowser

```cmd
.\filebrowser.exe -c config.yaml
```

Access at `http://localhost:8080` (or your `http.port`).

## First login

When `auth.adminPassword` and `FILEBROWSER_ADMIN_PASSWORD` are unset, the **console window** prints a one-time line containing the generated password. First login requires a password change.

- Other values for `auth.adminPassword` / `FILEBROWSER_ADMIN_PASSWORD` (except empty or `admin`) are **reapplied on every restart** — remove after setup if you change the password in the UI.
- `admin` as the configured password is treated as unset.

**Recovery** (stop the server first if it locks the database):

```cmd
.\filebrowser.exe -c config.yaml user set admin --password your-new-password
```

To run as a service, prefer **Task Scheduler** or **[NSSM](https://nssm.cc/)** so you can set the working directory to your install folder (for example `C:\FileBrowser\`). If you use **`sc.exe`**, pass an **absolute** config path — Windows services start in `System32`, so `-c config.yaml` will not find the file and may create `filebrowser.sqlite` in the wrong place:

```cmd
sc create FileBrowser binPath= "C:\FileBrowser\filebrowser.exe -c C:\FileBrowser\config.yaml" start= auto
```

## Troubleshooting

See {{< doclink path="getting-started/common-setup-mistakes/" text="Common setup mistakes" />}}.

## Next Steps

- {{< doclink path="configuration/sources/" text="Configure sources" />}}
- {{< doclink path="configuration/authentication/" text="Set up authentication" />}}
- {{< doclink path="integrations/" text="Enable integrations" />}}
