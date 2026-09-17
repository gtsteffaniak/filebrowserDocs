---
title: "Configuration"
description: "Configure OnlyOffice integration"
icon: "settings"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-08-07T19:41:04Z"
---

Configure OnlyOffice Document Server for document editing.

{{% alert context="warning" %}}
**Upgrading to v2.0.0?**

Use a **data directory mount** (`./data:/home/filebrowser/data`) instead of bind-mounting a single `database.db` file. v2.0.0 uses SQLite — see {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} and {{< doclink path="getting-started/docker/" text="Docker setup" />}}.
{{% /alert %}}

## Basic Configuration

<div class="pattern-card">

{{% alert context="info" %}}
OnlyOffice is currently the only supported office integration. Collabora support is planned for the future.
{{% /alert %}}

```yaml
integrations:
  office:
    url: "http://onlyoffice:80"
    secret: "your_secret_here"
```

</div>

## Docker Setup

### Generate OnlyOffice Secret

Generate a secure secret via OpenSSL

```bash
openssl rand -base64 32
```

Output example:
```
TevrjpRNMmKC0JxAwY7iZ2VXLrvG1gue
```

### Docker Compose Example

<div class="pattern-card">

{{% alert context="info" %}}
Use the same secret value for `FILEBROWSER_ONLYOFFICE_SECRET` and OnlyOffice `JWT_SECRET` when JWT is enabled on the document server.
{{% /alert %}}

```yaml
services:
  filebrowser:
    image: ghcr.io/gtsteffaniak/filebrowser:stable
    ports:
      - "80:80"
    volumes:
      - ./config.yaml:/home/filebrowser/config.yaml
      - ./data:/home/filebrowser/data
      - ./data:/data
    environment:
      - FILEBROWSER_ONLYOFFICE_SECRET=your_secret_here

  onlyoffice:
    image: onlyoffice/documentserver:latest
    ports:
      - "8080:80"
    environment:
      - JWT_ENABLED=true
      - JWT_SECRET=your_secret_here
```

</div>

## HTTPS Configuration

{{% alert context="danger" %}}
Never expose OnlyOffice HTTP to internet. Always use HTTPS. See [OnlyOffice HTTPS docs](https://helpcenter.onlyoffice.com/docs/installation/docs-community-install-docker.aspx).
{{% /alert %}}

For production, use HTTPS with reverse proxy (nginx example):

```nginx
server {
    listen 443 ssl;
    server_name office.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://onlyoffice:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### External and Internal URLs

<div class="pattern-card">

```yaml
# v2.0.0+
http:
  externalUrl: "https://files.yourdomain.com"  # Public URL (browser / shares)
  internalUrl: "http://filebrowser:80"         # Docker/LAN URL OnlyOffice uses to reach FileBrowser
  baseURL: "/files"
  trustProxyHeaders: true

integrations:
  office:
    url: "https://office.yourdomain.com"       # Browser → OnlyOffice
    internalUrl: "http://onlyoffice:80"        # FileBrowser → OnlyOffice (optional)
    secret: "your-jwt-secret"
```

```yaml
# v1.4.x–v1.5.x
http:
  externalUrl: "https://files.yourdomain.com"
  internalUrl: "http://filebrowser:80"
  baseURL: "/files"
  trustedHeaders:
    - X-Forwarded-Proto
    - X-Forwarded-Host
    - X-Forwarded-For
    - X-Real-IP

integrations:
  office:
    url: "https://office.yourdomain.com"
    internalUrl: "http://onlyoffice:80"
    secret: "your-jwt-secret"
```

**Why multiple URLs?**

| Direction | Config | Purpose |
|-----------|--------|---------|
| Browser → OnlyOffice | `integrations.office.url` | Editor UI loaded in the browser |
| FileBrowser → OnlyOffice | `integrations.office.internalUrl` (or `url`) | Server-side API calls |
| OnlyOffice → FileBrowser | `http.internalUrl` → `http.externalUrl` → request | Download/callback URLs embedded in editor config |

- **`http.trustProxyHeaders`** (v2.0.0+) or **`http.trustedHeaders`** (v1.4.x–v1.5.x) affects user-facing request flows (cookies, OIDC, activity IP). Neither gates `http.internalUrl`.
- **`http.externalUrl`** is used for shares and (when `internalUrl` is unset) OnlyOffice paths — **not** for OIDC redirects.

</div>


## Next Steps

- {{< doclink path="user-guides/office-integration/office-integration/" text="Office guides" />}}
- {{< doclink path="integrations/office/troubleshooting/" text="Troubleshooting" />}}
- {{< doclink path="integrations/office/about/" text="About onlyoffice" />}}
