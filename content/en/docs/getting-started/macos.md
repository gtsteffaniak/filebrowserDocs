---
title: "macOS (v2.0.0)"
description: "Install FileBrowser v2.0.x (stable) on macOS"
icon: "laptop_mac"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-30T00:00:00Z"
order: 3
---

{{% alert context="info" %}}
**This guide is for v2.0.x (stable).** Download a **stable** release from GitHub (or use `beta` for v2.1.x previews).
{{% /alert %}}

{{% alert context="warning" %}}
**Upgrading from v1.x?**

v2.0.0 requires a config update and one-time database migration. See the {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} before upgrading.
{{% /alert %}}

Run FileBrowser Quantum **v2.0.x (stable)** natively on macOS.

## Download

1. Go to the [releases page](https://github.com/gtsteffaniak/filebrowser/releases)
2. Download the **stable** `darwin-amd64-filebrowser` (Intel) or `darwin-arm64-filebrowser` (Apple Silicon) asset
3. Save to a folder (for example `~/FileBrowser/`)

## Enable Permissions

### Step 1: Make Executable

```bash
chmod +x darwin-arm64-filebrowser
```

### Step 2: Allow in Security Settings

On first run, macOS may block the binary:

1. Try to run: `./darwin-arm64-filebrowser version`
2. Open **System Settings** → **Privacy & Security** and allow FileBrowser, **or** remove quarantine:

```bash
xattr -d com.apple.quarantine ./darwin-arm64-filebrowser
```

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
  port: 8080
server:
  sources:
    - path: /Users/yourname/Documents
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

Access at `http://localhost:8080` (or your `http.port`).

## First login

When `auth.adminPassword` and `FILEBROWSER_ADMIN_PASSWORD` are unset, the terminal prints a one-time generated password; first login requires a password change.

- Non-empty `auth.adminPassword` / `FILEBROWSER_ADMIN_PASSWORD` values other than `admin` are **reapplied on every restart** — remove after setup if the UI should manage passwords.
- `admin` as the configured password is treated as unset.

**Recovery:**

```bash
./darwin-arm64-filebrowser -c config.yaml user set admin --password 'your-new-password'
```

## Run as Service (launchd)

Install the binary and config to fixed paths:

```bash
sudo mkdir -p /usr/local/etc/filebrowser /var/log/filebrowser
sudo cp darwin-arm64-filebrowser /usr/local/bin/filebrowser
sudo cp config.yaml /usr/local/etc/filebrowser/config.yaml
sudo chown root:wheel /usr/local/bin/filebrowser /usr/local/etc/filebrowser/config.yaml
```

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
    <key>WorkingDirectory</key>
    <string>/usr/local/etc/filebrowser</string>
    <key>StandardOutPath</key>
    <string>/var/log/filebrowser/stdout.log</string>
    <key>StandardErrorPath</key>
    <string>/var/log/filebrowser/stderr.log</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Load the daemon (macOS 10.10+):

```bash
sudo launchctl bootstrap system /Library/LaunchDaemons/com.filebrowser.plist
```

Find the generated admin password in `/var/log/filebrowser/stdout.log` if needed. LaunchDaemons run as **root**, so binding to port 80 is allowed; prefer `http.port: 8080` unless you need port 80.

## Troubleshooting

See {{< doclink path="getting-started/common-setup-mistakes/" text="Common setup mistakes" />}}.

## Next Steps

- {{< doclink path="configuration/sources/" text="Configure sources" />}}
- {{< doclink path="configuration/users/" text="Set up users" />}}
- {{< doclink path="integrations/" text="Enable integrations" />}}
