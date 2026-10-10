---
title: "macOS (v2.0.0)"
description: "Install FileBrowser v2.0.x (stable) on macOS"
icon: "laptop_mac"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-04T17:20:00Z"
order: 3
---

{{% alert context="info" %}}
**This guide is for v2.0.x (stable).** Download a **stable** release from GitHub (or use `beta` for v2.1.x previews).

Using **v1.5.x or older**? See the {{< doclink path="getting-started/macos-v1.5.x" text="v1.5.x macOS guide" />}} instead.
{{% /alert %}}

{{% alert context="warning" %}}
**Upgrading from v1.x?**

v2.0.0 requires a config update and one-time database migration. See the {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} before upgrading.
{{% /alert %}}

Run FileBrowser Quantum **v2.0.x (stable)** natively on macOS.

## Download

1. Go to [releases page](https://github.com/gtsteffaniak/filebrowser/releases)
2. Download the **beta** `darwin-amd64-filebrowser` (Intel) or `darwin-arm64-filebrowser` (Apple Silicon) release
3. Save to a folder

## Enable Permissions

### Step 1: Make Executable

```bash
chmod +x darwin-arm64-filebrowser
```

### Step 2: Allow in Security Settings

On first run, macOS will block the app:

1. Try to run: `./darwin-arm64-filebrowser`
2. Go to **System Preferences** → **Security & Privacy**
3. Click **Allow** for FileBrowser

## Optional: Install FFmpeg

```bash
brew install ffmpeg
```

## Create Configuration

```bash
./darwin-arm64-filebrowser setup
```

Or create `config.yaml`:

```yaml
http:
  port: 80
server:
  sources:
    - path: "/Users/yourname/Documents"
      config:
        defaultEnabled: true
auth:
  adminUsername: admin
```

v2.0.0 and later read the listen port from `http.port`. A `server.port` key is rejected at startup.

## Run FileBrowser

```bash
./darwin-arm64-filebrowser -c config.yaml
```

Access at `http://localhost:80`.

On v2.x (v2.0.0+), if `adminPassword` is unset or left as `admin`, a random admin password is generated, logged once, and a password reset is required on first login. Any other value of `auth.methods.password.adminPassword` or `auth.adminPassword` is used as-is.

## Run as Service (launchd)

Create `/Library/LaunchDaemons/com.filebrowser.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.filebrowser</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/filebrowser</string>
        <string>-c</string>
        <string>/usr/local/etc/filebrowser/config.yaml</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Load service:

```bash
sudo launchctl load /Library/LaunchDaemons/com.filebrowser.plist
```

## Next Steps

- {{< doclink path="configuration/sources/" text="Configure sources" />}}
- {{< doclink path="configuration/users/" text="Set up users" />}}
- {{< doclink path="integrations/" text="Enable integrations" />}}

