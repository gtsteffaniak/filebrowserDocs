---
title: "macOS (v2.0.0)"
description: "Install FileBrowser v2.0.0 (beta) on macOS"
icon: "laptop_mac"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-03T14:30:00Z"
order: 3
---

{{% alert context="info" %}}
**This guide is for v2.0.0 (beta).** Download a **beta** release from GitHub.

Using **v1.5.x or older**? See the {{< doclink path="getting-started/macos-v1.5.x" text="v1.5.x macOS guide" />}} instead.
{{% /alert %}}

{{% alert context="warning" %}}
**Upgrading from v1.x?**

v2.0.0 requires a config update and one-time database migration. See the {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} before upgrading.
{{% /alert %}}

Run FileBrowser Quantum **v2.0.0 (beta)** natively on macOS.

## Download

1. Go to [releases page](https://github.com/gtsteffaniak/filebrowser/releases)
2. Download the **beta** `filebrowser-darwin-amd64` (Intel) or `filebrowser-darwin-arm64` (Apple Silicon) release
3. Save to a folder

## Enable Permissions

### Step 1: Make Executable

```bash
chmod +x filebrowser-darwin-arm64
```

### Step 2: Allow in Security Settings

On first run, macOS will block the app:

1. Try to run: `./filebrowser-darwin-arm64`
2. Go to **System Preferences** → **Security & Privacy**
3. Click **Allow** for FileBrowser

## Optional: Install FFmpeg

```bash
brew install ffmpeg
```

## Create Configuration

```bash
./filebrowser-darwin-arm64 setup
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
./filebrowser-darwin-arm64 -c config.yaml
```

Access at `http://localhost:80`.

On **v2.1.0-beta and later**, a fresh install does not sign in as `admin` / `admin`. If the password is unset or set to `admin`, FileBrowser generates a random password and logs it once (`Generated initial admin password`). The username stays `admin` unless you change it. Set `auth.methods.password.adminPassword` or `FILEBROWSER_ADMIN_PASSWORD` before the first start when you want a chosen password. That value is applied again on every startup.

**v1.5.x (stable)** still uses `admin` / `admin`. See {{< doclink path="getting-started/macos-v1.5.x" text="macOS (v1.5.x)" />}}.

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

