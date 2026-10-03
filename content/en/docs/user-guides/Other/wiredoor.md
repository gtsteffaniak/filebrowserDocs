---
title: "OnlyOffice integration with Wiredoor"
description: "A basic working example on setting up OnlyOffice and FileBrowser with Wiredoor"
icon: "deployed_Code"
date: "2026-01-30T13:20:14Z"
lastmod: "2026-10-03T16:40:00Z"
---

This guide shows how to integrate OnlyOffice and FileBrowser via Wiredoor. Wiredoor is a self-hosted ingress-as-a-service platform that lets you route internet traffic to internal apps, IoT, Kubernetes and more using a reverse VPN powered by WireGuard. Below steps are derived from this [discussion](https://github.com/orgs/wiredoor/discussions/110).

{{% alert context="warning" %}}
**v2.0.0 behavior change**

File permissions are **per source**. `userDefaults.permissions.modify` (and related keys) apply as **defaults for new scopes**, not as global modify access. Grant **view** and **modify** on the relevant scope in User Management if users cannot open or edit Office files after upgrade.
{{% /alert %}}

{{% alert context="warning" %}}
This guide assumes you have some knowledge on using Wiredoor. Be sure to check [Wiredoor docs to learn more](https://www.wiredoor.net/documentation) about it.
{{% /alert %}}


## Setting Up Wiredoor node

- Create a gateway node using your Wiredoor server UI
- Assign it a Docker subnet, for example: `172.18.100.0/24`
- Copy the token shown when creating the node.


## Local Setup

Example of `docker-compose.yml`:

```yaml
networks:
  wiredoor:
    driver: bridge
    ipam:
      config:
        - subnet: 172.18.100.0/24

services:
  filebrowser:
    volumes:
      - './filebrowser/data:/srv'
      - './filebrowser/database:/home/filebrowser/database'
      - './filebrowser/config.yaml:/home/filebrowser/config.yaml'
    ports:
      - 80:80
    image: ghcr.io/gtsteffaniak/filebrowser:stable
    environment:
      FILEBROWSER_ONLYOFFICE_SECRET: ${ONLYOFFICE_SECRET:?ONLYOFFICE environment variable is required in your .env file}
    restart: unless-stopped
    networks:
      - wiredoor

  onlyoffice:
    image: onlyoffice/documentserver
    environment:
      JWT_SECRET: ${ONLYOFFICE_SECRET:?ONLYOFFICE environment variable is required in your .env file}
    ports:
      - 8080:80
    networks:
      - wiredoor

  wiredoor-gw:
    image: wiredoor/wiredoor-cli:latest
    cap_add:
      - NET_ADMIN
    environment:
      WIREDOOR_URL: ${WIREDOOR_URL:?WIREDOOR_URL environment variable is required in your .env file}
      TOKEN: ${WIREDOOR_TOKEN:?WIREDOOR_TOKEN environment variable is required in your .env file}
    networks:
      - wiredoor
```

Create a `.env` file with the following:

```
ONLYOFFICE_SECRET=onlyoffice_secret
WIREDOOR_URL=https://your-wiredoor-server.com
WIREDOOR_TOKEN=YOUR_GATEWAY_NODE_TOKEN
```

Minimal Filebrowser Configuration:

```yaml
http:
  port: 80
  baseURL: "/"
  internalUrl: "http://filebrowser"
server:
  logging:
    - levels: "info|warning|error"
  sources:
    - path: "/srv"
userDefaults:
  preview:
    image: true
    popup: true
    video: false
    office: false
    highQuality: false
  darkMode: true
  disableSettings: false
  singleClick: false
  permissions:
    admin: false
    api: false
    share: false
    realtime: false
    # v2.0.0+: default per-source permissions for new scopes
    modify: true
    download: true
    create: true
    delete: true
integrations:
  office:
    url: "https://onlyoffice.example.com"   # Domain used to expose onlyoffice
```

## Exposing services via Wiredoor

Use Wiredoor to expose:

- `https://filebrowser.example.com` → `http://filebrowser:80`
- `https://onlyoffice.example.com` → `http://onlyoffice:80`

Make sure the names (`filebrowser`, `onlyoffice`) match the service names in your Compose file.

At this point, both services should be accessible independently, but the integration will still fail because of iframe restrictions.

## Patch Wiredoor's Default Security Headers

By default, Wiredoor sets X-Frame-Options: DENY, which blocks Onlyoffice from being embedded in Filebrowser’s editor view.

To fix this:

```bash
docker compose exec -u root wiredoor bash
apk add nano
nano /etc/nginx/partials/security.conf
```

Find and comment out the following lines:

```bash
# add_header X-Frame-Options "DENY" always;
# add_header X-Frame-Options "SAMEORIGIN" always;
```

Then reload NGINX:

```bash
nginx -s reload
```

The FileBrowser editor should now successfully load the OnlyOffice iframe, and you should be able to open document files with full editing functionality.