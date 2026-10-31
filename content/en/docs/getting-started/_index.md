---
title: "Getting Started"
description: "Quick start guides for all platforms"
icon: "rocket_launch"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-30T00:00:00Z"
order: 1
---

{{% alert context="info" %}}
**Documentation versions:** Getting started guides target **v2.0.x (stable)** by default. **v2.1.x** features ship on the `beta` channel — see {{< doclink path="getting-started/version/" text="Which version should I use?" />}}.
{{% /alert %}}

## Quick start (Docker)

Copy-paste setup that works on most machines (host port **8080**, correct ownership, config before mounts):

```bash
mkdir -p filebrowser/data filebrowser/files && cd filebrowser
sudo chown -R 1000:1000 data files
cat > data/config.yaml <<'EOF'
server:
  sources:
    - path: /folder
      config:
        defaultEnabled: true
EOF
cat > docker-compose.yaml <<'EOF'
services:
  filebrowser:
    image: ghcr.io/gtsteffaniak/filebrowser:stable
    volumes:
      - ./files:/folder
      - ./data:/home/filebrowser/data
    ports:
      - "8080:80"
    restart: unless-stopped
EOF
docker compose up -d
docker compose logs -f filebrowser 2>&1 | grep -m1 -i "initial admin password"
```

If `grep` prints nothing, wait a few seconds for startup and run `docker compose logs filebrowser 2>&1 | grep -i "initial admin password"` again (or keep `-f` until the line appears).

Open `http://localhost:8080`, sign in with the generated password, complete the forced password change, then remove `FILEBROWSER_ADMIN_PASSWORD` / `auth.adminPassword` from your setup if you added them — see {{< doclink path="getting-started/docker/#first-login" text="First login (Docker)" />}}.

Stuck? See {{< doclink path="getting-started/common-setup-mistakes/" text="Common setup mistakes" />}}.

## Choose your path

| If you… | Start here |
| --- | --- |
| **New install** | {{< doclink path="getting-started/docker/" text="Docker" />}} (recommended) or {{< doclink path="getting-started/linux/" text="Linux" />}} / {{< doclink path="getting-started/windows/" text="Windows" />}} / {{< doclink path="getting-started/macos/" text="macOS" />}} for the binary |
| **Upgrading from FileBrowser Quantum v1.x** | {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} (back up `database.db` first) |
| **Running the binary on your OS** | Platform guides above; configure with {{< doclink path="getting-started/config/" text="Configuration files" />}} |

{{% alert context="warning" %}}
**Upgrading to v2.0.x from v1.x?**

v2.0.x requires a config update and a one-time database migration from the legacy format. Back up `database.db`, then follow the {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} before changing your image tag to `stable` or `2.0-stable`.
{{% /alert %}}

## Guides in this section

- {{< doclink path="getting-started/docker/" text="Docker" />}} — recommended for most users
- {{< doclink path="getting-started/linux/" text="Linux" />}}, {{< doclink path="getting-started/macos/" text="macOS" />}}, {{< doclink path="getting-started/windows/" text="Windows" />}} — native binaries
- {{< doclink path="getting-started/config/" text="Configuration files" />}} — paths, env vars, and examples
- {{< doclink path="getting-started/version/" text="Which version should I use?" />}} — stable vs beta tags
- {{< doclink path="getting-started/reverse-proxy/" text="Reverse proxy" />}} — nginx, Caddy, Traefik
- {{< doclink path="getting-started/common-setup-mistakes/" text="Common setup mistakes" />}} — symptom → log → fix
