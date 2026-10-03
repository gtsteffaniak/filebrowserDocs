---
title: "Docker (v2.0.0)"
description: "Get started with FileBrowser v2.0.0 (beta) using Docker"
icon: "deployed_code"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-03T15:30:00Z"
order: 1
---

{{% alert context="info" %}}
**This guide is for v2.0.0 (beta).** It uses the `beta` Docker image and the **database** (`filebrowser.sqlite`).

Using **v1.5.x or older**? See the {{< doclink path="getting-started/docker-v1.5.x" text="v1.5.x Docker guide" />}} instead.
{{% /alert %}}

{{% alert context="warning" %}}
**Upgrading from v1.x?**

v2.0.0 uses a **new database format** and requires a one-time migration. Use a **directory mount** (`./data:/home/filebrowser/data`) rather than a single database file mount. Replace `FILEBROWSER_DATABASE` with `FILEBROWSER_DATABASE_PATH`. See the {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} before changing your image tag to `beta`.
{{% /alert %}}

The fastest way to get started with FileBrowser Quantum **v2.0.0 (beta)**.

## Available Images

Images from Docker Hub (`gtstef/filebrowser`) and GitHub Container Registry (`ghcr.io/gtsteffaniak/filebrowser`):

| Tag                | Size  | Features                            | Architectures       |
| ------------------ | ----- | ----------------------------------- | ------------------- |
| `latest`, `stable` | 60 MB | FFmpeg + document preview           | arm64, amd64        |
| `stable-slim`      | 15 MB | Core service only (no media/office) | arm64, arm32, amd64 |
| `beta`             | 60 MB | FFmpeg + document preview           | arm64, amd64        |
| `beta-slim`        | 15 MB | Core service only (no media/office) | arm64, arm32, amd64 |

Learn more about the versions and tags {{< doclink path="getting-started/version#docker-version-tags" text="here." />}}

{{% alert context="info" %}}
To pin a specific v2 release instead of tracking the latest beta, use a version tag such as `2.1-beta` or `2.1.0-beta`. `beta` and `2-beta` follow the latest v2 beta (currently [v2.1.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v2.1.0-beta)). `2.0-beta` stays on the 2.0 line and does not include 2.1.
{{% /alert %}}

## Quick Try

Test without persistence (changes not saved). In this example we run it mounting the local path:

```bash
docker run -d \
  -v $(pwd):/srv \
  -p 80:80 \
  ghcr.io/gtsteffaniak/filebrowser:beta
```

Access at `http://localhost` with `admin` / `admin`

## Basic Setup with Docker Compose

{{% alert context="warning" %}}
This set up is just to get the feel of FileBrowser before you get into customization, defining access control, etc. For regular use, Check out the slightly upgraded guide {{< doclink path="user-guides/other/standalone" text="here." />}}
{{% /alert %}}


### Step 1: Create a base folder for FileBrowser

```bash
mkdir -p filebrowser/data && cd filebrowser
```

{{% alert context="info" %}}
**Default Config Location**: In Docker, the default config location is `/home/filebrowser/data/config.yaml`. So we create a `data` directory so we can mount the config, database files, and cacheDir in the same volume. If you don't want to follow this process, you can use {{< doclink path="reference/environment-variables" text="environment variables" />}} to set the config path and database path manually.
{{% /alert %}}

### Step 2: Create Config

Add a `config.yaml` file inside the `data` directory:

```bash
touch ./data/config.yaml
```

Then fill out your config as needed, for example:

```yaml
server:
  cacheDir: /home/filebrowser/data/tmp # using the data volume so it can persist across restarts
  sources:
    - path: /folder # Do not use a root "/" directory or include the "/var" folder
      config:
        defaultEnabled: true
```

{{% alert context="info" %}}
**Important**: Source path specified in the `config.yaml` are in terms of container point of view. ({{< doclink path="getting-started/config" text="Check this page for more information on configurations." />}})
{{% /alert %}}

### Step 3: Create Docker Compose

Create `docker-compose.yaml` in the  directory.

```bash
touch docker-compose.yaml
```

Then type in the below docker configuration.

```yaml
services:
  filebrowser:
    image: ghcr.io/gtsteffaniak/filebrowser:beta
    volumes:
      - /path/to/your/folder:/folder # Do not use a root "/" directory or include the "/var" folder
      - ./data:/home/filebrowser/data
    ports:
      - 80:80 # exposes port 80 to host, the left-side number can be changed without config.yaml changes.
    restart: unless-stopped
```

### Step 4: Start

```bash
docker compose up -d
```

### Healthcheck Configuration

{{% alert context="warning" %}}
This is only needed if you change the `server.port` in the `config.yaml` -- this is not needed for the above guide where the port remains `80` in the `config.yaml`
{{% /alert %}}

The FileBrowser Docker image includes a default healthcheck that uses port 80:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1
```

If you configure FileBrowser to use a different port in your `config.yaml`, you must override the healthcheck in your `docker-compose.yaml` to match:

```yaml
services:
  filebrowser:
    image: ghcr.io/gtsteffaniak/filebrowser:beta
    volumes:
      - /path/to/your/folder:/folder
      - ./data:/home/filebrowser/data
    ports:
      - 80:8080  # Filebrowser listens on 8080 inside docker, but here we are exposing the host port as 80 still.
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"] # port should match the internal port 8080 
      interval: 30s
      timeout: 3s
      start_period: 10s
      retries: 3
    restart: unless-stopped
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

v2.0.0 uses the **database** (default: `filebrowser.sqlite`), not the legacy database (`database.db`). Set `server.database.path` in config or use `FILEBROWSER_DATABASE_PATH`. Upgrading from v1.x? See {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}}.
{{% /alert %}}

{{% alert context="info" %}}
**Default Database Location (v2.0.0+)**: In Docker, the default is `/home/filebrowser/data/filebrowser.sqlite` when using the recommended `./data` mount. Standalone default is `./filebrowser.sqlite` in the current directory.

To persist your database, mount a volume to `/home/filebrowser/data`:

```yaml
services:
  filebrowser:
    image: ghcr.io/gtsteffaniak/filebrowser:beta
    volumes:
      - /path/to/files:/folder
      - ./data:/home/filebrowser/data  # Database and config stored here
```

See {{< doclink path="configuration/server/#database" text="Server configuration" />}} and {{< doclink path="getting-started/config/#how-to-specify-a-config-file" text="configuration file priority" />}} for more information on database paths.
{{% /alert %}}

## Running container with a different user

Docker images run as the built-in `filebrowser` user (UID:GID **1000:1000**) by default. To use a different UID:GID, set `user` in your compose file:
```yaml
services:
  filebrowser:
    image: ghcr.io/gtsteffaniak/filebrowser:beta
    user: filebrowser
    volumes:
      - /path/to/files:/folder
      - ./data:/home/filebrowser/data
    ports:
      - 80:80
    restart: unless-stopped
```

You can also specify any user UID:GID, but if you choose a UID other than 1000, you will need to make sure the mounted `data` directory has the same permissions ({{< doclink path="configuration/server#cachedir" text="See cacheDir config" />}})

for example if you wanted to use `1001:1001` user for Unraid installs.
```bash
chown -R 1001:1001 ./data
```

## Privileged ports and container capabilities

### In-container listen (Linux containers)

Linux treats **ports below 1024** as *privileged*: a non-root user needs the **`NET_BIND_SERVICE`** capability (or a lowered `net.ipv4.ip_unprivileged_port_start`) to bind there.

On **rootful** Docker Engine or Docker Desktop, the container still usually gets **`NET_BIND_SERVICE`** in the default capability set, so that user **can** listen on `80` or `443` without extra flags. **`bind: permission denied` on a low `server.port` shows up more often when:**

- you use a **rootless** container engine (**Docker rootless**, **Podman rootless**), or  
- the runtime uses a **stricter** capability profile (some **Podman** installs, explicit `--cap-drop`, hardened policies).

Because the default user is not root, **`bind: permission denied` on a low `server.port` shows up more often** in those environments when `NET_BIND_SERVICE` is not effective. It is **not** “non-root in Docker always breaks port 443 on every machine.”

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

## Next Steps

- {{< doclink path="configuration/sources/" text="Configure sources" />}}
- {{< doclink path="configuration/users/" text="Set up users" />}}
- {{< doclink path="integrations/" text="Enable integrations" />}}

