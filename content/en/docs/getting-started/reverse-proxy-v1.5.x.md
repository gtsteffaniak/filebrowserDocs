---
title: "Running behind a reverse proxy (v1.5.x)"
description: "Configure FileBrowser v1.5.x (stable) behind reverse proxies"
icon: "other_houses"
date: "2025-10-28T22:14:01Z"
lastmod: "2026-08-10T15:05:25Z"
order: 107
---

{{% alert context="info" %}}
**This guide is for v1.5.x and older (stable).** Config examples use `server.baseURL` and `http.trustedHeaders`.

Looking for **v2.0.x (stable)**? See the {{< doclink path="getting-started/reverse-proxy" text="v2.0.x reverse proxy guide" />}} instead.
{{% /alert %}}

{{% alert context="warning" %}}
**Planning to upgrade to v2.0.0?**

v2.0.0 moves HTTP settings from `server` to `http` and replaces `trustedHeaders` with `trustProxyHeaders`. Follow the {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} before upgrading.
{{% /alert %}}

Complete guide for running FileBrowser Quantum **v1.5.x (stable)** behind reverse proxies including nginx, Traefik, and Caddy with authentication, SSL, and performance optimizations.

{{% alert context="info" %}}
FileBrowser Quantum is designed to work seamlessly behind reverse proxies with proper configuration. This guide covers all major proxy types with complete examples.
{{% /alert %}}

## Overview

FileBrowser Quantum separates public and private endpoints to work efficiently with reverse proxies:

- **Public endpoints** (`/public`) - Designed for share access without reverse proxy authentication.
- **Cookie-based authentication** - Requires proper Host header forwarding
- **Real-time features** - SSE support with proper proxy configuration

### Public Route Structure

FileBrowser Quantum includes a dedicated `/public` route that contains:

- `/public/api/` - Public API endpoints for share access (hash-based authentication)
- `/public/share/` - Share pages (can work with or without user authentication)
- `/public/static/` - Static assets (CSS, JavaScript, images)

{{% alert context="info" %}}
The `/public` routes are designed to allow shares to function fully without requiring authentication at the reverse proxy level. This enables share links to work even when the reverse proxy requires authentication for other routes. Public routes also use stricter logging to prevent sensitive information leakage.
{{% /alert %}}

### Route Authentication Requirements

```
Private Routes (Require User Authentication):
├── /api/*              - Private API endpoints
├── /dav/*              - WebDAV access  
└── /swagger/           - API documentation

Public Routes (Hash-based or Optional Auth):
├── /public/api/*       - Public API (share hash authentication)
├── /public/share/*     - Share pages (optional user authentication)
└── /public/static/*   - Static assets (no authentication)

Other Routes:
├── /                   - Main UI (optional authentication)
└── /health             - Health check (no authentication)
```

When configuring your reverse proxy, you can:
- **Require authentication** for `/api/` and other private routes
- **Allow public access** to `/public/` routes for share functionality

## Basic Requirements

### Essential Headers

All reverse proxy configurations must include these headers:

```yaml
# Required headers for FileBrowser Quantum
proxy_set_header Host $host;                                  # Cookie domain scoping
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # IP chain
proxy_set_header X-Forwarded-Proto $scheme;                   # HTTP/HTTPS protocol
```

{{% alert context="info" %}}
**Note**: FileBrowser Quantum also supports `X-Forwarded-Host` as an alternative to the `Host` header for cookie domain scoping.
{{% /alert %}}

### FileBrowser Configuration

Configure FileBrowser to work with your reverse proxy:

```yaml
server:
  baseURL: "/files"                          # Base path for reverse proxy
  externalUrl: "https://files.example.com/files"   # External URL (used when generated public links)
```

## nginx Configuration

Minimal nginx configuration for FileBrowser Quantum:

```nginx
server {
    listen 80;
    server_name files.example.com;

    # Public endpoints (for shares - no reverse proxy auth required)
    # These routes use hash-based authentication internally
    location /files/public/ {
        proxy_pass http://filebrowser:8080/files/public/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }

    # Private endpoints (authentication required)
    location /files/ {
        proxy_pass http://filebrowser:8080/files/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        client_max_body_size 10G;
    }
}
```

{{% alert context="info" %}}
The `/public` route allows shares to function without reverse proxy authentication. This means share links (`/public/share/<hash>`) will work even if you require authentication for other routes. The share itself may still require a password or user restrictions as configured in FileBrowser.
{{% /alert %}}

### With Authentication Proxy

For environments using external authentication:

```nginx
server {
    listen 80;
    server_name files.example.com;

    # Authentication endpoint
    location = /auth/authorize {
        internal;
        proxy_pass http://auth.example.com:8080/authorize;
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
    }

    # Public endpoints (no auth)
    location /files/public/ {
        proxy_pass http://filebrowser:8080/files/public/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }

    # Private endpoints (with auth)
    location /files/ {
        auth_request /auth/authorize;
        auth_request_set $user $upstream_http_x_forwarded_user;

        proxy_pass http://filebrowser:8080/files/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-User $user;
        proxy_buffering off;
        client_max_body_size 10G;
    }
}
```

{{% alert context="warning" %}}
When using external authentication, ensure your auth service sets the `X-Forwarded-User` header with the username. FileBrowser will use this for {{< doclink path="configuration/authentication/proxy/" text="proxy authentication" />}}.
{{% /alert %}}

## Traefik Configuration

Basic Traefik labels for FileBrowser Quantum:

```yaml
# Basic routing
- "traefik.enable=true"
- "traefik.http.routers.filebrowser.rule=Host(`files.example.com`)"
- "traefik.http.services.filebrowser.loadbalancer.server.port=80"

# Public endpoints (no auth)
- "traefik.http.routers.filebrowser-public.rule=Host(`files.example.com`) && PathPrefix(`/public`)"
- "traefik.http.services.filebrowser-public.loadbalancer.server.port=80"
```

## Caddy Configuration

Minimal Caddy configuration:

```caddy
files.example.com {
    # Public endpoints (no authentication)
    handle_path /public/* {
        reverse_proxy filebrowser:80 {
            header_up Host {host}
            header_up X-Forwarded-For {remote_host}
            header_up X-Forwarded-Proto {scheme}
        }
    }

    # Private endpoints (with authentication)
    handle /* {
        reverse_proxy filebrowser:80 {
            header_up Host {host}
            header_up X-Forwarded-For {remote_host}
            header_up X-Forwarded-Proto {scheme}
        }
    }
}
```

## Upload Configuration

Essential settings for file uploads:

<div class="config-section">
  <h4>Nginx</h4>
  <pre><code>client_max_body_size 10G;
proxy_buffering off;</code></pre>
</div>

<div class="config-section">
  <h4>Traefik</h4>
  <pre><code>- "traefik.http.middlewares.filebrowser-buffering.buffering.maxRequestBodyBytes=0"</code></pre>
</div>

<div class="config-section">
  <h4>Caddy</h4>
  <pre><code>reverse_proxy filebrowser:80 {
    header_up Connection {>Connection}
    header_up Transfer-Encoding {>Transfer-Encoding}
}</code></pre>
</div>

## Server-Sent Events (SSE) Configuration

FileBrowser Quantum uses SSE for real-time features. Essential settings:

```nginx
location /files/ {
    proxy_pass http://filebrowser:8080/files/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffering off;
}
```

- Traefik should handle most of this automatically if is configured properly.

### Authorization Header Handling

{{% alert context="info" %}}
If your reverse proxy sets authorization headers, you may need to clear them for FileBrowser to avoid conflicts with its own authentication system.
{{% /alert %}}

```nginx
location /files/ {
    proxy_set_header Authorization "";  # Clear authorization header
    proxy_pass http://filebrowser:8080/files/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Troubleshooting

### Common Issues

<div class="troubleshooting-section">
  <h4>Authentication Failures</h4>
  <p><strong>Symptoms:</strong> Users can't log in, cookies not working.</p>
  <p><strong>Solution:</strong> Ensure <code>Host</code> header is properly forwarded:</p>

{{< tabs tabTotal="3" >}}
{{< tab tabName="NGINX" >}}
```nginx
proxy_set_header Host $host;
```
{{< /tab >}}

{{< tab tabName="Traefik" >}}
```yaml
- "traefik.http.services.filebrowser.loadbalancer.passhostheader=true"
```

{{< /tab >}}
{{< /tabs >}}
</div>

<div class="troubleshooting-section">
  <h4>Upload Failures</h4>
  <p><strong>Symptoms:</strong> Large file uploads fail</p>
  <p><strong>Solution:</strong> Increase file size limit and disable buffering:</p>

{{< tabs tabTotal="2" >}}
{{< tab tabName="NGINX" >}}
```nginx
client_max_body_size 10G;
proxy_buffering off;
```
{{< /tab >}}
{{< tab tabName="Traefik" >}}
In traefik can be configured via middlewares
```yaml
http:
  middlewares:
    limit:
      buffering:
        maxRequestBodyBytes: 0
        maxResponseBodyBytes: 0
        memRequestBodyBytes: 0
        memResponseBodyBytes: 0
```
{{< /tab >}}
{{< /tabs >}}
</div>

<div class="troubleshooting-section">
  <h4>SSE Not Working</h4>
  <p><strong>Symptoms:</strong> Real-time features not updating</p>
  <p><strong>Solution:</strong> Disable buffering</p>
{{< tabs tabTotal="2" >}}
{{< tab tabName="NGINX" >}}
```nginx
proxy_buffering off;
```
{{< /tab >}}
{{< tab tabName="Traefik" >}}

Via traefik middlewares:

```yaml
http:
  middlewares:
    limit:
      buffering:
        maxRequestBodyBytes: 0
        maxResponseBodyBytes: 0
        memRequestBodyBytes: 0
        memResponseBodyBytes: 0
```
{{< /tab >}}
{{< /tabs >}}
</div>

## Next Steps

- {{< doclink path="configuration/authentication/proxy/" text="Proxy Authentication" />}} - Configure header-based authentication
- {{< doclink path="integrations/office/troubleshooting/" text="Office Integration" />}} - OnlyOffice behind reverse proxy
- {{< doclink path="user-guides/office-integration/traefik-setup/" text="Traefik Setup" />}} - Filebrowser + OnlyOffice behind traefik reverse proxy.

<style>
.config-section {
  margin: 1.5em 0;
  padding: 1em;
  border-left: 3px solid var(--primary, #0ea5e9);
  background: rgba(14, 165, 233, 0.06);
  border-radius: 4px;
}

.config-section h4 {
  margin-top: 0;
  margin-bottom: 0.5em;
  color: var(--primary);
  font-size: 1.1em;
}

.config-section pre {
  margin: 0.5em 0 0 0;
  padding: 0.75em;
  background: var(--code-block-bg);
  border-radius: 4px;
  overflow-x: auto;
}

.config-section pre code {
  background: none;
  padding: 0;
  font-size: 0.85em;
}

.troubleshooting-section {
  margin: 1em 0;
  padding: 1em;
  background: rgba(244, 67, 54, 0.05);
  border-left: 3px solid #f44336;
  border-radius: 4px;
}

.troubleshooting-section h4 {
  margin-top: 0;
  margin-bottom: 0.5em;
  color: #f44336;
  font-size: 1.1em;
}

.troubleshooting-section p {
  margin: 0.5em 0;
}

/* Dark mode support */
[data-dark-mode] .config-section {
  background: rgba(14, 165, 233, 0.12);
}

[data-dark-mode] .troubleshooting-section {
  background: rgba(244, 67, 54, 0.1);
}
</style>
