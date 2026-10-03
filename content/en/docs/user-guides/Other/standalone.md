---
title: "Standalone docker guide (v2.0.0)"
description: "A basic working example on setting up FileBrowser v2.0.0 in Docker with persistent indexing"
icon: "deployed_Code"
date: "2026-01-30T13:20:14Z"
lastmod: "2026-10-03T14:30:00Z"
---

This guide will help you set up your FileBrowser **v2.0.0** instance alone. This will be helpful for users who just want to access their files over LAN for storage.

{{% alert context="info" %}}
**This guide is for v2.0.0.**

Using **v1.5.x or older**? See the {{< doclink path="user-guides/other/standalone-v1.5.x" text="v1.5.x standalone guide" />}} instead.
{{% /alert %}}

## Folder Structure

```
filebrowser-quantum/
├── .env
├── compose.yaml
└── files/
└── data/
    ├── config.yaml
    ├── filebrowser.sqlite
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
    image: ghcr.io/gtsteffaniak/filebrowser:beta
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

Update the config.yaml,

```yaml
server:
  database:
    path: "data/filebrowser.sqlite"
  cacheDir: "data/tmp"
  sources:
    - path: "/files"
      name: Home
      config:
        defaultUserScope: "/users/" # new users will get created in /users/<username>
        defaultEnabled: true # all users get this source on create; v2.0.1+ also merges for existing users on startup
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
      # adminPassword: "choose-a-password" # v2.1.0+: omit or do not use "admin"

```

On **v2.1.0-beta and later**, `adminPassword: admin` is ignored. A fresh install generates a random password and logs it once (`Generated initial admin password`). The username stays `admin`. A non-default `adminPassword` under `auth.methods.password` is applied on every startup. **v1.5.x (stable)** still uses `admin` / `admin` — see the {{< doclink path="user-guides/other/standalone-v1.5.x" text="v1.5.x standalone guide" />}}.

## Running container with a different user

The easist way to update the user is through docker compose. For example to create a new user 1001:1001 "${UID}:${GID}":

```yaml title="compose.yml" linenums="1"
services:
  filebrowser:
    image: ghcr.io/gtsteffaniak/filebrowser:beta
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
