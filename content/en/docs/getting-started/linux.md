---
title: "Linux (v2.0.0)"
description: "Install FileBrowser v2.0.x (stable) on Linux"
icon: "terminal"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-30T00:00:00Z"
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
```

Other assets include `linux-arm64-filebrowser`, `linux-armv6-filebrowser`, `linux-armv7-filebrowser`, and `linux-riscv64-filebrowser`.

## Make Executable

```bash
chmod +x linux-amd64-filebrowser
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
./linux-amd64-filebrowser setup
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

Create the source directory and grant the service user access (home directories are often `750` and not readable by `filebrowser`):

```bash
sudo mkdir -p /srv/files
sudo chown filebrowser:filebrowser /srv/files   # after creating the user below, or use your own user when running in foreground
```

Port **80** requires root or **`CAP_NET_BIND_SERVICE`** when running as an unprivileged user — using **8080** avoids that for quick tests.

## Run FileBrowser

```bash
./linux-amd64-filebrowser -c config.yaml
```

Access at `http://localhost:8080` (or your `http.port`).

## First login

When `auth.adminPassword` and `FILEBROWSER_ADMIN_PASSWORD` are unset, a random password is logged once and first login requires a password change:

```bash
./linux-amd64-filebrowser -c config.yaml 2>&1 | grep -i "initial admin password"
```

With systemd (after start):

```bash
sudo journalctl -u filebrowser --no-pager | grep -i "initial admin password"
```

- Values other than empty or `admin` in `auth.adminPassword` / `FILEBROWSER_ADMIN_PASSWORD` are **reapplied every restart** — remove after setup if the UI should own password changes.
- `admin` as the configured password is treated as unset (random password + forced reset).

**Recovery:**

```bash
./linux-amd64-filebrowser -c /opt/filebrowser/config.yaml user set admin --password 'your-new-password'
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
sudo mv linux-amd64-filebrowser /usr/local/bin/filebrowser
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
