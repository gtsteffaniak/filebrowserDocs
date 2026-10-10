---
title: "macOS (v1.5.x)"
description: "Install FileBrowser v1.5.x (stable) on macOS"
icon: "laptop_mac"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-03T14:10:00Z"
order: 103
---

{{% alert context="info" %}}
**This guide is for v1.5.x and older (stable).** Download a **stable** release from GitHub.

Looking for **v2.0.x (stable)**? See the {{< doclink path="getting-started/macos" text="v2.0.x macOS guide" />}} instead.
{{% /alert %}}

{{% alert context="warning" %}}
**Planning to upgrade to v2.0.0?**

v2.0.0 requires a config update and one-time database migration. Follow the {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} before upgrading.
{{% /alert %}}

Run FileBrowser Quantum **v1.5.x (stable)** natively on macOS.

## Download

1. Go to [releases page](https://github.com/gtsteffaniak/filebrowser/releases)
2. Download the **stable** `darwin-amd64-filebrowser` (Intel) or `darwin-arm64-filebrowser` (Apple Silicon) release
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
server:
  port: 80
  sources:
    - path: "/Users/yourname/Documents"
      config:
        defaultEnabled: true
auth:
  adminUsername: admin
```

## Run FileBrowser

```bash
./darwin-arm64-filebrowser -c config.yaml
```

Access at `http://localhost:80`

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

