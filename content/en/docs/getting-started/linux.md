---
title: "Linux (v2.0.0)"
description: "Install FileBrowser v2.0.x (stable) on Linux"
icon: "terminal"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-31T00:00:00Z"
order: 2
---

{{% alert context="info" %}}
**This guide is for v2.0.x (stable).** Download a **stable** release from GitHub (or use `beta` for v2.1.x previews).
{{% /alert %}}

{{% alert context="warning" %}}
**Upgrading from v1.x?**

v2.0.0 requires a config update and one-time database migration. See the {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} before upgrading.
{{% /alert %}}

Run FileBrowser Quantum **v2.0.x (stable)** natively on Linux using the binary releases.

## Download

Download the **stable** binary for your architecture from the [releases page](https://github.com/gtsteffaniak/filebrowser/releases), or fetch the latest stable amd64 build:

```bash
curl -LO https://github.com/gtsteffaniak/filebrowser/releases/latest/download/linux-amd64-filebrowser
FB_BIN=linux-amd64-filebrowser
```

Set `FB_BIN` to the asset you downloaded (`linux-arm64-filebrowser`, `linux-armv7-filebrowser`, `linux-riscv64-filebrowser`, and so on).

## Make Executable

```bash
chmod +x "$FB_BIN"
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

Interactive setup (writes `config.yaml` in the current directory; default source is often `./` — use an absolute path you intend to share):

```bash
./"$FB_BIN" setup
```

Or create `config.yaml` manually:

```yaml
http:
  port: 8080
server:
  sources:
    - path: /srv/files
      config:
        defaultEnabled: true
auth:
  adminUsername: admin
```

v2.0.0 and later read the listen port from `http.port`. A `server.port` key is rejected at startup.

For a **foreground** trial run, create a source directory you own (for example under your home directory) or use a path your user can read. For **systemd**, create `/srv/files` and set ownership in Step 1 below.

Port **80** requires root or **`CAP_NET_BIND_SERVICE`** when running as an unprivileged user — using **8080** avoids that for quick tests.

## Run FileBrowser

```bash
./"$FB_BIN" -c config.yaml
```

Access at `http://localhost:8080` (or your `http.port`). Watch the same terminal for a log line containing `initial admin password` (do not start a second FileBrowser process to grep for it).

## First login

When `auth.adminPassword` and `FILEBROWSER_ADMIN_PASSWORD` are unset, a random password is logged once in the **server output** and first login requires a password change.

- Read the password from the terminal where you ran `./"$FB_BIN" -c config.yaml`, or from systemd logs after service start:

```bash
sudo journalctl -u filebrowser --no-pager | grep -i "initial admin password"
```

- Values other than empty or `admin` in `auth.adminPassword` / `FILEBROWSER_ADMIN_PASSWORD` are **reapplied every restart** — remove after setup if the UI should own password changes.
- `admin` as the configured password is treated as unset (random password + forced reset).

**Recovery** (stop the running server first):

```bash
# Foreground: press Ctrl+C, then:
./"$FB_BIN" -c config.yaml user set admin --password 'your-new-password'

# systemd:
sudo systemctl stop filebrowser
sudo /usr/local/bin/filebrowser -c /opt/filebrowser/config.yaml user set admin --password 'your-new-password'
sudo systemctl start filebrowser
```

The default SQLite file is `./filebrowser.sqlite` in the process working directory unless `server.database.path` or `FILEBROWSER_DATABASE_PATH` is set.

## Run as Systemd Service

### Step 1: Create user and directories

```bash
sudo useradd -r -s /bin/false filebrowser
sudo mkdir -p /opt/filebrowser /srv/files
sudo chown filebrowser:filebrowser /opt/filebrowser /srv/files
```

### Step 2: Install binary and config

```bash
sudo mv "$FB_BIN" /usr/local/bin/filebrowser
sudo chmod +x /usr/local/bin/filebrowser
sudo mv config.yaml /opt/filebrowser/
sudo chown filebrowser:filebrowser /opt/filebrowser/config.yaml
```

Ensure `config.yaml` uses `path: /srv/files` (or another path readable by `filebrowser`).

### Step 3: Create service file

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
# Required only if http.port is 80 (privileged port):
# AmbientCapabilities=CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
```

### Step 4: Enable and start

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now filebrowser
sudo systemctl status filebrowser
```

## Troubleshooting

See {{< doclink path="getting-started/common-setup-mistakes/" text="Common setup mistakes" />}}.

## Next Steps

- {{< doclink path="configuration/sources/" text="Configure sources" />}}
- {{< doclink path="configuration/users/" text="Set up users" />}}
- {{< doclink path="integrations/" text="Enable integrations" />}}
