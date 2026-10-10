---
title: "Proxy Authentication"
description: "Header-based authentication"
icon: "security"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-08-30T16:50:15Z"
order: 2
---

Authenticate based on HTTP headers -- strictly designed to be used behind a reverse proxy.

{{% alert context="warning" %}}
**Configure source access for new users**

Authentication alone does not grant file access. When a user is created (password signup, admin/CLI create, or first login via OIDC / LDAP / JWT / proxy), they only receive sources where `config.defaultEnabled: true`.

- Default is **`false`** — without this, new users may log in but see **no files**
- **One source** in config: FileBrowser auto-enables `defaultEnabled` for that source
- **Multiple sources**: set `defaultEnabled: true` on each source new users should access

See {{< doclink path="configuration/sources#defaultenabled" text="Sources: defaultEnabled" />}} for full details and examples.
{{% /alert %}}

## Configuration

{{% alert context="warning" %}}
If proxy authentication is enabled and a server is accessed without a proxy, FileBrowser will blindly accept the headers. If anyone can bypass the proxy, they can login as any proxy-based user. Take care to configure your environment securely when using this method.
{{% /alert %}}

```yaml
auth:
  methods:
    proxy:
      enabled: true
      header: "X-Forwarded-User"  # or "Remote-User"
      # Optional role/group headers (v2.1.x):
      # groupsClaim: "x-cosmos-role"  # HTTP header name for group/role value
      # userGroups: ["2", "1"]        # allow-list; omit to allow all
      # adminGroup: "2"               # group value that grants admin
      # userIdentifier: ""
      # disableVerifyTLS: false   # testing only
      # logoutRedirectUrl: ""
```

{{% alert context="info" %}}
**v2.1.x:** `groupsClaim`, `adminGroup`, and `userGroups` enable role-based access for proxy auth. For proxy auth, `groupsClaim` is the **HTTP header name** (for example `x-cosmos-role`), not a JSON claim field. Admin privileges come from `adminGroup` only. Versions before v2.1.0 ignore these options; admin is only granted when the proxy username matches `auth.adminUsername`.
{{% /alert %}}

## Options

| Option | Description |
|--------|-------------|
| `enabled` | Enable proxy authentication |
| `header` | **Required.** Header whose value is trusted as the username (must sit behind a trusted proxy) |
| `adminGroup` | **v2.1.x.** Group/role header value that grants admin privileges |
| `userGroups` | **v2.1.x.** If set, only users whose group/role header value is in this list may log in |
| `groupsClaim` | **v2.1.x.** HTTP header name for the user's group/role (required when `userGroups` or `adminGroup` is set) |
| `userIdentifier` | Field to use as username when not using the raw header value in composite setups |
| `disableVerifyTLS` | Disable TLS verification for any outbound calls (testing only) |
| `logoutRedirectUrl` | Optional URL to redirect after logout |

{{% alert context="warning" %}}
**Deprecated:** `createUser` in this block is deprecated and ignored for new configs — user provisioning behavior is always on for supported methods.
{{% /alert %}}

## Sources for proxy users

Proxy users are auto-created on first successful header auth. Source access follows the callout at the top of this page. From **v2.1.x**, proxy auth syncs group/role header values into the access-control GroupMap (write-through to the database), same as OIDC / LDAP / JWT.

## Example Use Cases

- Corporate SSO via proxy
- Kubernetes ingress authentication
- Nginx auth_request module
- Traefik ForwardAuth
- Cosmos Cloud auth proxy with role headers

<div class="pattern-card">

## Cosmos Cloud Example (v2.1.x)

Cosmos Cloud sends a username header and a numeric role header (`0` = guest, `1` = user, `2` = admin):

```yaml
auth:
  methods:
    password:
      enabled: false
    proxy:
      enabled: true
      header: "X-Cosmos-User"
      groupsClaim: "x-cosmos-role"
      userGroups:
        - "2"
        - "1"
      adminGroup: "2"
```

Expected behavior:

- Role `0` (guest): login denied, user not created
- Role `1` (user): regular user access
- Role `2` (admin): regular access plus admin privileges

</div>

<div class="pattern-card">

## Traefik Example

```yaml
http:
  middlewares:
    auth:
      forwardAuth:
        address: "https://auth.example.com/verify"
        trustForwardHeader: true
```

</div>

<div class="pattern-card">

## Nginx Example

```
map $remote_addr $uuid {
    default "demo-${remote_addr}";
}

server {
    listen 80;
    server_name localhost 127.0.0.1;

    location / {
        proxy_set_header X-Username $uuid;
        add_header X-Forwarded-User $uuid;
        proxy_pass http://filebrowser:8080/subpath;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

```

FileBrowser config:

```yaml
# v2.0.0+
http:
  trustProxyHeaders: true

auth:
  methods:
    proxy:
      enabled: true
      header: "X-Forwarded-User"
    password:
      enabled: false
```

```yaml
# v1.4.x–v1.5.x
http:
  trustedHeaders:
    - X-Forwarded-Proto
    - X-Forwarded-Host
    - X-Forwarded-For
    - X-Real-IP

auth:
  methods:
    proxy:
      enabled: true
      header: "X-Forwarded-User"
    password:
      enabled: false
```

{{% alert context="info" %}}
`auth.methods.proxy.header` names the **username** header. Client IP and scheme/host forwarding use `http.trustProxyHeaders` (**v2.0.0+**) or `http.trustedHeaders` (**v1.4.x–v1.5.x**) — see {{< doclink path="configuration/http/#trustproxyheaders" text="HTTP reverse-proxy headers" />}}.
{{% /alert %}}

</div>

## Next Steps

- {{< doclink path="configuration/authentication/oidc/" text="OIDC authentication" />}}
- {{< doclink path="configuration/users/" text="Configure users" />}}
