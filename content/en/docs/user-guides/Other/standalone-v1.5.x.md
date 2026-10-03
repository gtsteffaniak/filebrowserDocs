---
title: "Standalone docker guide (v1.5.x and earlier)"
description: "A basic working example on setting up FileBrowser v1.5.x (stable) in Docker with persistent indexing"
icon: "deployed_Code"
date: "2026-01-30T13:20:14Z"
lastmod: "2026-10-03T15:30:00Z"
---

This guide will help you set up your FileBrowser **v1.5.x** and earlier instance alone. This will be helpful for users who just want to access their files over LAN for storage.

{{% alert context="info" %}}
**This guide is for v1.5.x and older (stable).** It uses the `stable` Docker image and the **legacy database** (`database.db`) for the database.

Looking for **v2.0.0 (beta)**? See the {{< doclink path="user-guides/other/standalone" text="v2.0.0 standalone guide" />}} instead.
{{% /alert %}}

{{% alert context="warning" %}}
**Planning to upgrade to v2.0.0?**

v2.0.0 replaces the legacy database with a new database format and requires a one-time migration. Do **not** switch your image tag until you have read and followed the {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}}.
{{% /alert %}}

## Folder Structure

```
filebrowser-quantum/
├── .env
├── compose.yaml
└── files/
└── data/
    ├── config.yaml
    ├── database.db
    └── tmp/
```

## Initial Setup

- Run the commands below commands in the terminal to initialize the folder structure, or manually via the desktop.

```bash
mkdir -p data/tmp
touch .env compose.yaml data/config.yaml
```

Volume bindings needed:

  - `./data:/home/filebrowser/data` is required to set the config file, database and tmp folder.
  - Any folder you want to have access to. In this example, we use `./files` which will be created in the same directory
  - Other volume bindings that need to have access via the web.

Update the compose.yml,


```yaml title="compose.yml" linenums="1"
services:
  filebrowser:
    image: ghcr.io/gtsteffaniak/filebrowser:stable
    container_name: quantum-prod
    ports:
      - 8900:80
    restart: unless-stopped
    # user: filebrowser
    volumes:
      - ./data:/home/filebrowser/data
      - ./files:/files
      # - /other/dir:/dir # Add other sources
    environment:
      - "FILEBROWSER_CONFIG=data/config.yaml" # using our config file at ./data/config.yaml
```

{{% alert context="info" %}}
To pin a specific v1 release instead of tracking the latest stable, use a version tag such as `1.5-stable` or `1.5.6-stable`. See {{< doclink path="getting-started/version#docker-version-tags" text="Docker version tags" />}}.
{{% /alert %}}

Update the config.yaml,

```yaml
server:
  database: "data/database.db"
  cacheDir: "data/tmp"
  sources:
    - path: "/files"
      name: Home
      config:
        defaultUserScope: "/users/" # new users will get created in /users/<username>
        defaultEnabled: true # new users automatically get access to the source
        createUserDir: true # a user "bill" will see files from /files/users/bill
    - path: "/home/filebrowser" # mount the docker home folder for convenience
      name: Backend
    # Add your sources here.
  #externalUrl: 'https://<YOUR_IP>:8900' # if you plan to share externally, share links will be generated with this url
  maxArchiveSize: 50 # maxiumum pre-archive size users are allowed to download at once.
auth:
  tokenExpirationHours: 2
  methods:
    password:
      enabled: true
      minLength: 5
      signup: true
  adminUsername: admin
  adminPassword: admin # remove this after first startup if you want to change this password manually.

```

## Running container with a different user

{{% alert context="info" %}}
On `v1.2.x` and earlier, the default user is `root`.
On `v1.3.x` and later, the default user is `filebrowser` (1000:1000).
{{% /alert %}}

The easist way to update the user is through docker compose. For example to create a new user 1001:1001 "${UID}:${GID}":

```yaml title="compose.yml" linenums="1"
services:
  filebrowser:
    image: ghcr.io/gtsteffaniak/filebrowser:stable
    container_name: quantum-prod
    user: "1001:1001"
    ports:
      - 8900:80
    restart: unless-stopped
    networks:
      - proxy
    volumes:
      - ./data:/home/filebrowser/data
      - ./files:/files
```

You will also want to ensure the `data` folder has the correct permissions with `chown` command:

```bash
chown -R 1001:1001 data
```

## Using FileBrowser

### Starting the service

Change to the directory where the compose file is in your terminal and run,

```bash
docker compose up -d
```

This will pull the image and start the container. You can now access it via `http://<YOUR_IP>:8900`.

### Updating the service

Change to the directory where the compose file is in your terminal and run,

```bash
docker compose pull   # Get the new image
docker compose down   # Shutdown container
docker compose up -d  # Load new image
```

With the database and cache set up, your data will persist even with restarts.

## Next Steps

- {{< doclink path="configuration/" text="Configurations" />}}
- {{< doclink path="access-control/" text="Access Control" />}}
- {{< doclink path="features/" text="Features" />}}
- {{< doclink path="user-guides/office-integration/" text="OnlyOffice Integration" />}}
- {{< doclink path="reference/fullconfig/" text="View full config reference" />}}
