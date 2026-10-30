---
title: "Docker (v2.0.0)"
description: "Get started with FileBrowser v2.0.x (stable) using Docker"
icon: "deployed_code"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-30T00:00:00Z"
order: 1
---

{{% alert context="info" %}}
**This guide is for v2.0.x (stable).** It uses the `stable` or `2.0-stable` Docker image and a SQLite database. The image default file is `database.sqlite` (see [Database Location](#database-location)). For **v2.1.x** previews, use the `beta` or `2.1-beta` tag instead — see {{< doclink path="getting-started/version/" text="release channels" />}}.
{{% /alert %}}

{{% alert context="warning" %}}
**Upgrading from v1.x?**

v2.0.x uses a **new database format** and requires a one-time migration. Use a **directory mount** (`./data:/home/filebrowser/data`) rather than a single database file mount. Replace `FILEBROWSER_DATABASE` with `FILEBROWSER_DATABASE_PATH` or `migrateFrom: "default"`. See the {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} before changing your image tag to `stable` or `2.0-stable`.
{{% /alert %}}

The fastest way to get started with FileBrowser Quantum **v2.0.x (stable)**.

## Available Images

Images from Docker Hub (`gtstef/filebrowser`) and GitHub Container Registry (`ghcr.io/gtsteffaniak/filebrowser`):

| Tag                | Features                            | Architectures       |
| ------------------ | ----------------------------------- | ------------------- |
| `latest`, `stable` | FFmpeg + document preview           | arm64, amd64        |
| `stable-slim`      | Core service only (no media/office) | arm64, arm32, amd64 |
| `beta`             | FFmpeg + document preview           | arm64, amd64        |
| `beta-slim`        | Core service only (no media/office) | arm64, arm32, amd64 |

Slim images are much smaller because they omit FFmpeg and bundled document preview. Learn more about versions and tags {{< doclink path="getting-started/version#docker-version-tags" text="here." />}}

{{% alert context="info" %}}
To pin a specific v2.0.x release instead of tracking the latest stable, use a version tag such as `2.0-stable` or `2.0.2-stable`. For v2.1.x previews, use `2.1-beta` or a full beta tag from [GitHub releases](https://github.com/gtsteffaniak/filebrowser/releases).
{{% /alert %}}

## Quick Try

Try FileBrowser with **no persistent database or config** (the SQLite DB and settings are lost when the container is removed). This example mounts the **current directory read-write** as the file source at `/folder`:

```bash
docker run -d \
  --name filebrowser \
  -v "$(pwd):/folder" \
  -p 8080:80 \
  ghcr.io/gtsteffaniak/filebrowser:stable
```

Access at `http://localhost:8080`. Find the one-time admin password:

```bash
docker logs filebrowser 2>&1 | grep -i "initial admin password"
```

Then complete **First login** below. For a persistent setup, use Docker Compose.

## Basic Setup with Docker Compose

{{% alert context="warning" %}}
This set up is just to get the feel of FileBrowser before you get into customization, defining access control, etc. For regular use, Check out the slightly upgraded guide {{< doclink path="user-guides/other/standalone" text="here." />}}
{{% /alert %}}

### Step 1: Create folders and permissions

Replace `/path/to/your/folder` with a real directory on your host (if you leave the placeholder, Docker creates an empty **root-owned** directory and uploads will fail).

```bash
mkdir -p filebrowser/data filebrowser/files && cd filebrowser
sudo chown -R 1000:1000 data files
```

{{% alert context="info" %}}
**Default config location**: In Docker, config lives at `/home/filebrowser/data/config.yaml` inside the container. Mount `./data:/home/filebrowser/data` so config, database, and cache persist. You can also set paths with {{< doclink path="reference/environment-variables" text="environment variables" />}}.
{{% /alert %}}

### Step 2: Create config.yaml

Create the file **before** any bind mount that expects a file (see {{< doclink path="getting-started/common-setup-mistakes/" text="Common setup mistakes" />}}):

```bash
touch ./data/config.yaml
```

Example:

```yaml
server:
  cacheDir: /home/filebrowser/data/tmp
  sources:
    - path: /folder
      config:
        defaultEnabled: true
```

`path` is the **in-container** path (`/folder`), not the host path. It must match the right side of your volume mount (`./files:/folder` → `path: /folder`).

### Step 3: Create Docker Compose

```yaml
services:
  filebrowser:
    image: ghcr.io/gtsteffaniak/filebrowser:stable
    volumes:
      - ./files:/folder
      - ./data:/home/filebrowser/data
    ports:
      - "8080:80"
    restart: unless-stopped
```

Use `127.0.0.1:8080:80` instead of `8080:80` if only a local reverse proxy should reach the container. Change the **left** port if host port 80 (or 8080) is already in use.

### Step 4: Start

```bash
docker compose up -d
```

### Step 5: First login {#first-login}

When `auth.adminPassword` / `auth.methods.password.adminPassword` and `FILEBROWSER_ADMIN_PASSWORD` are **unset**, FileBrowser generates a random password, logs it **once**, and requires a password change on first login.

Find the password:

```bash
docker compose logs filebrowser 2>&1 | grep -i "initial admin password"
```

Open `http://localhost:8080` (or your mapped host port), sign in, and set a new password when prompted.

**Config or env admin password**

- If you set `auth.adminPassword` or `FILEBROWSER_ADMIN_PASSWORD` to any value **other than** empty or `admin`, that password is **reapplied on every startup** (log: `Resetting admin user to default username and password.`). Remove it after setup if you want password changes made in the UI to persist across restarts.
- Setting the password to `admin` does **not** work: it is treated as unset, a random password is generated and logged, and first-login reset is still required.

**Recovery** (lost password, with Compose):

```bash
docker compose exec filebrowser filebrowser -c /home/filebrowser/data/config.yaml user set admin --password 'your-new-password'
```

See {{< doclink path="reference/cli/" text="CLI reference" />}} for `user set` options.

## Healthcheck Configuration

{{% alert context="warning" %}}
This is only needed if you change **`http.port`** in `config.yaml`. The default image healthcheck curls `http://localhost:80/health`.
{{% /alert %}}

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1
```

If FileBrowser listens on another port inside the container, override the healthcheck in `docker-compose.yaml`:

```yaml
services:
  filebrowser:
    image: ghcr.io/gtsteffaniak/filebrowser:stable
    volumes:
      - ./files:/folder
      - ./data:/home/filebrowser/data
    ports:
      - "8080:8080"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 3s
      start_period: 10s
      retries: 3
    restart: unless-stopped
```

Example `config.yaml` fragment:

```yaml
http:
  port: 8080
```

**Healthcheck options:**
- `test` - Command to run (must match your configured port)
- `interval` - Time between health checks (default: 30s)
- `timeout` - Time to wait for response (default: 3s)
- `start_period` - Grace period on startup (default: 10s)
- `retries` - Number of failures before marking unhealthy (default: 3)

## Database Location

{{% alert context="warning" %}}
**v2.0.0 change**

v2.0.0 uses SQLite, not the legacy database (`database.db`). Upgrading from v1.x? See {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}}.
{{% /alert %}}

{{% alert context="info" %}}
**Default database location (v2.0.0+)**: The Docker image sets `FILEBROWSER_DATABASE_PATH=/home/filebrowser/data/database.sqlite`. With the recommended `./data` mount, that file is `./data/database.sqlite` on the host when `server.database.path` is omitted. A path set in config wins over that environment variable. Standalone builds with no env var and no config path use `./filebrowser.sqlite`.

To persist your database, mount a volume to `/home/filebrowser/data`:

```yaml
services:
  filebrowser:
    image: ghcr.io/gtsteffaniak/filebrowser:stable
    volumes:
      - ./files:/folder
      - ./data:/home/filebrowser/data
```

See {{< doclink path="configuration/server/#database" text="Server configuration" />}} and {{< doclink path="getting-started/config/#how-to-specify-a-config-file" text="configuration file priority" />}} for more information on database paths.
{{% /alert %}}

## Running container with a different user

Docker images run as the built-in `filebrowser` user (UID:GID **1000:1000**) by default. To use a different UID:GID, set `user` in your compose file:

```yaml
services:
  filebrowser:
    image: ghcr.io/gtsteffaniak/filebrowser:stable
    user: "1001:1001"
    volumes:
      - ./files:/folder
      - ./data:/home/filebrowser/data
    ports:
      - "8080:80"
    restart: unless-stopped
```

If you choose a UID other than 1000, the mounted `data` directory and source folder need matching ownership ({{< doclink path="configuration/server#cachedir" text="See cacheDir config" />}}):

```bash
chown -R 1001:1001 ./data ./files
```

## Privileged ports and container capabilities

### In-container listen (Linux containers)

Linux treats **ports below 1024** as *privileged*: a non-root user needs the **`NET_BIND_SERVICE`** capability (or a lowered `net.ipv4.ip_unprivileged_port_start`) to bind there.

On **rootful** Docker Engine or Docker Desktop, the container still usually gets **`NET_BIND_SERVICE`** in the default capability set, so that user **can** listen on `80` or `443` without extra flags. **`bind: permission denied` on a low `http.port` shows up more often when:**

- you use a **rootless** container engine (**Docker rootless**, **Podman rootless**), or  
- the runtime uses a **stricter** capability profile (some **Podman** installs, explicit `--cap-drop`, hardened policies).

### non-root runtimes can use `NET_BIND_SERVICE`

Allow binding to ports below 1024 inside the container:

```yaml
services:
  filebrowser:
    cap_add:
      - NET_BIND_SERVICE
```

For `docker run`, use `--cap-add=NET_BIND_SERVICE`. **Podman** supports the same flag (or the equivalent in your compose file). Prefer this over `--privileged` unless you need broader host access.

Further reading: [Docker: Runtime privilege and Linux capabilities](https://docs.docker.com/engine/containers/run/#runtime-privilege-and-linux-capabilities).

## Troubleshooting

See {{< doclink path="getting-started/common-setup-mistakes/" text="Common setup mistakes" />}} for startup failures, empty UI, permission errors, and healthcheck issues.

## Next Steps

- {{< doclink path="configuration/sources/" text="Configure sources" />}}
- {{< doclink path="configuration/users/" text="Set up users" />}}
- {{< doclink path="integrations/" text="Enable integrations" />}}
