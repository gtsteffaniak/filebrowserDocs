---
title: "HTTP Settings"
description: "Configure HTTP listening, URLs, TLS, WebDAV, reverse-proxy headers, and auth rate limiting"
icon: "http"
date: "2026-05-22T15:40:53Z"
lastmod: "2026-11-26T16:48:00Z"
order: 4
---

{{% alert context="warning" %}}
**v2.0.0 behavior change**

All HTTP-related options moved from `server` to the top-level `http` key: `port`, `listen`, `baseURL`, `socket`, `tlsCert`, `tlsKey`, `externalUrl`, `internalUrl`, `disableWebDAV`, `trustProxyHeaders`, and `disableRateLimit`. If your config still has these under `server`, run the {{< doclink path="getting-started/v2/config-migration/" text="config migration tool" />}} or move them manually — see {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}}.
{{% /alert %}}

Configure how FileBrowser listens for HTTP traffic, how URLs are built for shares and integrations, and how the server behaves behind a reverse proxy.

```yaml
http:
  port: 80
  listen: ""                    # default: 0.0.0.0
  baseURL: "/"
  externalUrl: ""
  internalUrl: ""
  socket: ""
  socketFileMode: ""            # default: "0660" (v2.1.0+)
  socketGroup: ""               # v2.1.0+
  tlsCert: ""
  tlsKey: ""
  disableWebDAV: false
  trustProxyHeaders: false
  trustedProxies: []            # v2.1.0+
  unixSocketTrustedUIDs: []     # v2.1.0+
  unixSocketTrustedGIDs: []     # v2.1.0+
  unixSocketTrustAllLocalPeers: false # v2.1.0+
  disableRateLimit: false
```

## Configuration Options

<div class="pattern-card">

### port

TCP port FileBrowser listens on (default: `80`).

```yaml
http:
  port: 80
```

Ignored when `http.socket` is set (Unix socket mode).

{{% alert context="info" %}}
**Docker healthcheck**: If you change the port from the default (`80`), update the Docker healthcheck in your `docker-compose.yaml` to match. See {{< doclink path="getting-started/docker/#healthcheck-configuration" text="Docker healthcheck configuration" />}}.
{{% /alert %}}

{{% alert context="warning" %}}
**Privileged ports**: For ports **below 1024**, Linux only allows a non-root process to bind if it has the **`NET_BIND_SERVICE`** capability (or `net.ipv4.ip_unprivileged_port_start` is lowered). **Rootful** Docker Engine / Docker Desktop usually includes `NET_BIND_SERVICE` in the default profile. **`bind: permission denied` is more typical with rootless engines** (Docker rootless, Podman rootless).
{{% /alert %}}

</div>

<div class="pattern-card">

### listen

Address FileBrowser binds to (default: `0.0.0.0` — all interfaces).

```yaml
http:
  listen: "127.0.0.1"   # localhost only
```

Use `127.0.0.1` when a reverse proxy on the same host forwards traffic to FileBrowser.

</div>

<div class="pattern-card">

### baseURL

Subpath FileBrowser is served under (default: `/`). Required when running behind a reverse proxy on a path prefix.

```yaml
http:
  baseURL: "/files"
```

FileBrowser normalizes this to leading and trailing slashes (e.g. `/files/`). Routes, static assets, and API paths are all prefixed with this value.

</div>

<div class="pattern-card">

### socket

Unix domain socket to listen on instead of TCP `port` (default: empty — use TCP).

```yaml
http:
  socket: "/var/run/filebrowser.sock"
```

When set, `http.port` is not used. **Cannot be combined** with `tlsCert` / `tlsKey` — the server exits at startup if both are configured.

Names starting with `@` create a Linux **abstract socket**. Abstract sockets have no file permissions, ignore `socketFileMode` / `socketGroup`, and never trust forwarded client headers.

#### socketFileMode and socketGroup (v2.1.0+)

Control who can connect to a filesystem socket:

```yaml
http:
  socket: "/run/filebrowser/filebrowser.sock"
  socketFileMode: "0660"   # octal, default "0660"
  socketGroup: "caddy"     # group name or numeric GID (optional)
```

`socketGroup` changes the group of the socket file so that a reverse proxy running as a different user can connect to it.

#### Trusting a reverse proxy on a Unix socket (v2.1.0+)

With `trustProxyHeaders: true` on a filesystem socket, the **client IP** headers (`X-Forwarded-For`, `X-Real-IP`) are only honored from peers you allow by their Linux credentials (`SO_PEERCRED`):

```yaml
http:
  socket: "/run/filebrowser/filebrowser.sock"
  trustProxyHeaders: true
  unixSocketTrustedUIDs: [995]   # e.g. the uid of your reverse proxy user
  unixSocketTrustedGIDs: []
```

| Option | Behavior |
|--------|----------|
| `unixSocketTrustedUIDs` | Trust peers whose **user ID** is listed. |
| `unixSocketTrustedGIDs` | Trust peers whose **primary (effective) group ID** is listed. Trusts every process running with that group, not just your proxy. |
| `unixSocketTrustAllLocalPeers` | Legacy: trust any local peer when both lists are empty. Logs a warning at startup. |

If both lists are empty and `unixSocketTrustAllLocalPeers` is `false`, forwarded client IPs are ignored and the activity log and rate limiting see no client address.

{{% alert context="warning" %}}
**Only the primary group counts.** `SO_PEERCRED` reports the single effective group ID of the connecting process — **supplementary groups are not checked**. A reverse proxy that can open the socket only because it is a *member* of the socket's group (for example a `caddy` user added to an extra group, or a systemd unit using `SupplementaryGroups=`) will **not** match `unixSocketTrustedGIDs`. Check the proxy's effective group with `ps -o egid= -p <pid>`, or list its user ID in `unixSocketTrustedUIDs` instead.
{{% /alert %}}

</div>

<div class="pattern-card">

### tlsCert and tlsKey

Paths to TLS certificate and private key for HTTPS. Both must be set to enable TLS.

```yaml
http:
  tlsCert: "/path/to/cert.pem"
  tlsKey: "/path/to/key.pem"
  port: 443
```

When TLS is enabled, the server logs an `https://` URL. **Cannot be combined** with `http.socket`.

</div>

<div class="pattern-card">

### externalUrl

Public base URL used when generating links. Include scheme and host only — `baseURL` is appended automatically when needed.

```yaml
http:
  externalUrl: "https://files.example.com" # will automatically apply /files if missing
  baseURL: "/files"
```

| Used for | Not used for |
|----------|--------------|
| Share links and Open Graph metadata | OIDC `redirect_uri` (always derived from the incoming request) |
| OnlyOffice download/callback URLs when `internalUrl` is unset | WebAuthn RP ID (uses `externalUrl` when set, else request host) |
| | Session cookies or login redirects |

If unset, share links and OnlyOffice public-path URLs fall back to the incoming request (`Host` header and scheme). Behind a reverse proxy, enable header trust so request-derived URLs use the client-facing scheme and host — `http.trustProxyHeaders: true` on **v2.0.0+**, or list forwarding headers under `http.trustedHeaders` on **v1.4.x–v1.5.x**.

</div>

<div class="pattern-card">

### internalUrl

Base URL integration services use to reach FileBrowser on the **private network** (optional). HTTP is allowed. This path does **not** use `trustProxyHeaders` or `trustedHeaders` — it is a fixed configured origin, not derived from proxied client requests.

```yaml
http:
  internalUrl: "http://filebrowser:80"
  baseURL: "/files"
```

| Used for | Not used for |
|----------|--------------|
| OnlyOffice download/callback URLs (highest priority) | Share links shown in the browser |
| | OIDC redirects |

**URL priority for OnlyOffice → FileBrowser:** `internalUrl` → `externalUrl` → incoming request (with header trust enabled when behind a proxy: `trustProxyHeaders` on v2.0.0+, `trustedHeaders` on v1.4.x–v1.5.x).

Typically a Docker service name, internal DNS name, or LAN IP. See {{< doclink path="integrations/office/configuration/" text="OnlyOffice configuration" />}}.

</div>

<div class="pattern-card">

### disableWebDAV

Disable WebDAV support (default: `false`). When `true`, the `/dav` route is not registered.

```yaml
http:
  disableWebDAV: true
```

</div>

<div class="pattern-card">

### trustProxyHeaders (v2.0.0+) / trustedHeaders (v1.4.x–v1.5.x)

How FileBrowser honors reverse-proxy forwarding headers depends on your version:

| Version | Config key | Behavior |
|---------|------------|----------|
| **v2.0.0+** | `http.trustProxyHeaders` | Single boolean (default: `false`). When `true`, honors all standard forwarding headers. |
| **v1.4.x–v1.5.x** | `http.trustedHeaders` | List of header names to trust individually. |

**v2.0.0+:**

```yaml
http:
  trustProxyHeaders: true
  listen: "127.0.0.1"   # recommended when proxy is on the same host
```

When `true`, FileBrowser honors `X-Forwarded-Host`, `X-Forwarded-Proto`, `X-Forwarded-For`, and `X-Real-IP`.

**v1.4.x–v1.5.x:**

```yaml
http:
  trustedHeaders:
    - X-Forwarded-Proto
    - X-Forwarded-Host
    - X-Forwarded-For
    - X-Real-IP
  listen: "127.0.0.1"   # recommended when proxy is on the same host
```

List only the headers your proxy sets. For OIDC or HTTPS behind a proxy, include at least `X-Forwarded-Proto` and `X-Forwarded-Host`.

Enable header trust **only** when a reverse proxy you control is the sole entry point to FileBrowser. Direct deployments (no proxy) should leave `trustProxyHeaders` false (v2.0.0+) or omit `trustedHeaders` (v1.4.x–v1.5.x).

When enabled, FileBrowser uses forwarded headers for:

| Area | Headers used |
|------|----------------|
| Client IP | `X-Forwarded-For`, then `X-Real-IP` — **v2.1.0+: only from a trusted peer** (see [trustedProxies](#trustedproxies-v210) for TCP, or the [Unix socket allowlists](#trusting-a-reverse-proxy-on-a-unix-socket-v210)) |
| Request host | `X-Forwarded-Host` |
| Request scheme | `X-Forwarded-Proto` (defaults to `https` for public URLs when host is forwarded but proto is absent) |

This affects session cookie domain, OIDC `redirect_uri`, WebAuthn RP ID/origin, share and page URLs, auth rate limiting, failed-login lockout, and activity audit IP.

{{% alert context="info" %}}
The {{< doclink path="getting-started/v2/config-migration/" text="config migration tool" />}} converts a non-empty v1.4.x–v1.5.x `trustedHeaders` list to `trustProxyHeaders: true` when upgrading to v2.0.0+.
{{% /alert %}}

{{% alert context="info" %}}
**Proxy authentication username** headers (for example `X-Forwarded-User`) are **not** controlled by this option. Set the header name under `auth.methods.proxy.header`. See {{< doclink path="configuration/authentication/proxy/" text="Proxy authentication" />}}.
{{% /alert %}}

{{% alert context="warning" %}}
If FileBrowser is reachable directly from the internet with header trust enabled, clients can spoof forwarded headers — weakening rate limiting, lockout, cookies, and URL security. Bind to `127.0.0.1` or a private network when possible.
{{% /alert %}}

See {{< doclink path="getting-started/reverse-proxy/#proxy-headers-filebrowser-understands" text="Reverse proxy: proxy headers" />}} for nginx, Traefik, and Caddy examples.

{{% alert context="info" %}}
**Authentication rate limiting**: Login and other auth routes are rate-limited by default. Enable header trust behind a proxy (`trustProxyHeaders: true` on v2.0.0+, or `trustedHeaders` on v1.4.x–v1.5.x) so per-IP limits apply to real client addresses — not the proxy. On v2.1.0+ also list the proxy in `trustedProxies` (TCP) or the Unix socket allowlists.
{{% /alert %}}

</div>

<div class="pattern-card">

### trustedProxies (v2.1.0+)

IP addresses or CIDR ranges of reverse proxies allowed to set the **client IP** headers (`X-Forwarded-For`, `X-Real-IP`) on a TCP listener. Requires `trustProxyHeaders: true`.

```yaml
http:
  trustProxyHeaders: true
  trustedProxies:
    - "127.0.0.1"
    - "172.18.0.0/16"   # e.g. a Docker network with your proxy
```

- **Empty (default):** client IP headers are ignored on TCP and the client IP resolves to the proxy address. FileBrowser logs a startup warning in this case.
- **Configured:** `X-Forwarded-For` is read from right to left, skipping entries that belong to trusted proxies; the first untrusted address is the client. This keeps client IPs correct in multi-hop setups (CDN → reverse proxy → FileBrowser).
- `X-Forwarded-Host` and `X-Forwarded-Proto` only need `trustProxyHeaders: true`; they are not checked against this list.
- Unix socket listeners use [peer credential allowlists](#trusting-a-reverse-proxy-on-a-unix-socket-v210) instead.

</div>

<div class="pattern-card">

### disableRateLimit

Turns off built-in auth route rate limiting and failed-login lockout (default: `false`).

```yaml
http:
  disableRateLimit: false
```

Leave this `false` in production. Setting it to `true` removes HTTP 429 throttling and account lockout on authentication endpoints.

</div>

## Built-in authentication rate limiting

When `disableRateLimit` is `false` and password (or other credential) auth is enabled, FileBrowser applies **per-process, in-memory** limits on `/api/auth/*` routes. Limits are not configurable via YAML; they are built into the server.

### Credential tier (login, OTP verify)

Used by `POST /api/auth/login` and `POST /api/auth/otp/verify`.

| Control | Limit |
|---------|-------|
| Per-IP token bucket | 10 requests/minute, burst 8 |
| Per-username token bucket | 10 requests/minute, burst 8 |
| Failed-login lockout | 8 consecutive `401` responses for the same IP **and** username → 15-minute lockout |

Behavior:

- **Rapid automated attempts** exhaust the token bucket and receive **HTTP 429** with a short `Retry-After` (seconds).
- **Slower guessing** that stays under the per-minute rate is blocked by **failed-login lockout**, which returns **HTTP 429** with `Retry-After=900` (15 minutes).
- A successful login clears the lockout counter for that IP and username.

Passkey login endpoints use the credential token buckets without failed-login lockout.

### Other auth tiers

| Tier | Routes (examples) | Per-key limit |
|------|-------------------|---------------|
| Moderate | logout, signup, OTP generate | 30/min, burst 10 (per IP) |
| OIDC | OIDC login and callback | 60/min, burst 20 (per IP) |
| Authenticated | token management, session renew, passkey register | 180/min, burst 60 (per logged-in username) |

### Limitations

- Limits apply **per FileBrowser process**. Restarting the server clears counters. Multiple replicas do not share state.
- Failed-login lockout is keyed by **IP + username**, not username alone. Per-username token buckets still apply when an attacker rotates IPs against one account.
- Rate limiting is disabled when `http.disableRateLimit` is `true` or when `auth.methods.noAuth` is enabled.

## Example: reverse proxy deployment

```yaml
# v2.0.0+
http:
  port: 8080
  baseURL: "/files"
  externalUrl: "https://files.example.com/files"
  trustProxyHeaders: true
  disableRateLimit: false

server:
  cacheDir: "tmp"
  sources:
    - path: "/srv"
```

```yaml
# v1.4.x–v1.5.x
http:
  port: 8080
  baseURL: "/files"
  externalUrl: "https://files.example.com/files"
  trustedHeaders:
    - X-Forwarded-Proto
    - X-Forwarded-Host
    - X-Forwarded-For
    - X-Real-IP
  disableRateLimit: false

server:
  cacheDir: "tmp"
  sources:
    - path: "/srv"
```

## Related documentation

- {{< doclink path="getting-started/reverse-proxy/" text="Running behind a reverse proxy" />}} — proxy header configuration
- {{< doclink path="configuration/server/" text="Server settings" />}} — database, cache, indexing, and sources
- {{< doclink path="configuration/authentication/" text="Authentication" />}} — login methods and password policy
- {{< doclink path="features/webdav/" text="WebDAV" />}} — WebDAV usage when `disableWebDAV` is `false`
