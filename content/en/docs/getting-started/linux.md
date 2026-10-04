---
title: "Linux (v2.0.0)"
description: "Install FileBrowser v2.0.0 (beta) on Linux"
icon: "terminal"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-04T16:45:00Z"
order: 2
---

{{% alert context="info" %}}
**This guide is for v2.0.0 (beta).** Download a **beta** release from GitHub.

Using **v1.5.x or older**? See the {{< doclink path="getting-started/linux-v1.5.x" text="v1.5.x Linux guide" />}} instead.
{{% /alert %}}

{{% alert context="warning" %}}
**Upgrading from v1.x?**

v2.0.0 requires a config update and one-time database migration. See the {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} before upgrading.
{{% /alert %}}

Run FileBrowser Quantum **v2.0.0 (beta)** natively on Linux using the binary releases.

## Download

1. Go to [releases page](https://github.com/gtsteffaniak/filebrowser/releases)
2. Download the appropriate **beta** binary:
   - `linux-amd64-filebrowser` (64-bit)
   - `linux-arm64-filebrowser` (64-bit)
   - `linux-armv6-filebrowser` (32-bit)
   - `linux-armv7-filebrowser` (32-bit)

## Make Executable

```bash
chmod +x filebrowser-linux-amd64
```

## Optional: Install FFmpeg

```bash
# Debian/Ubuntu
sudo apt install ffmpeg

# RHEL/CentOS/Fedora
sudo dnf install ffmpeg

# Arch Linux
sudo pacman -S ffmpeg
```

## Create Configuration

Interactive setup:

```bash
./filebrowser-linux-amd64 setup
```

Or create `config.yaml`:

```yaml
server:
  port: 80
  sources:
    - path: "/home/user/files" # Do not use a root "/" directory or include the "/var" folder
      config:
        defaultEnabled: true
auth:
  adminUsername: admin
```

## Run FileBrowser

```bash
./filebrowser-linux-amd64 -c config.yaml
```

Access at `http://localhost:80`.

On v2.x (v2.0.0+), the first startup generates an admin password and logs it once. A password reset is required on first login.

## Run as Systemd Service

### Step 1: Move Binary

```bash
sudo mv filebrowser-linux-amd64 /usr/local/bin/filebrowser
sudo chmod +x /usr/local/bin/filebrowser
```

### Step 2: Create Service File

Create `/etc/systemd/system/filebrowser.service`:

```ini
[Unit]
Description=FileBrowser Quantum
After=network.target

[Service]
Type=simple
User=filebrowser
WorkingDirectory=/opt/filebrowser
ExecStart=/usr/local/bin/filebrowser -c /opt/filebrowser/config.yaml
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### Step 3: Create User and Directory

```bash
sudo useradd -r -s /bin/false filebrowser
sudo mkdir -p /opt/filebrowser
sudo chown filebrowser:filebrowser /opt/filebrowser
```

### Step 4: Move Config

```bash
sudo mv config.yaml /opt/filebrowser/
sudo chown filebrowser:filebrowser /opt/filebrowser/config.yaml
```

### Step 5: Enable and Start

```bash
sudo systemctl daemon-reload
sudo systemctl enable filebrowser
sudo systemctl start filebrowser
```

### Check Status

```bash
sudo systemctl status filebrowser
```

## Next Steps

- {{< doclink path="configuration/sources/" text="Configure sources" />}}
- {{< doclink path="configuration/users/" text="Set up users" />}}
- {{< doclink path="integrations/" text="Enable integrations" />}}

