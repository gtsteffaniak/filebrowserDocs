---
title: "Troubleshooting"
description: "Common OnlyOffice integration issues and solutions"
icon: "troubleshoot"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-08-07T19:41:04Z"
---

Solutions for common OnlyOffice integration problems including connectivity, authentication, and document opening issues.

## Enable Debug logging and Debug Mode

If you are having persistent issues with OnlyOffice, the first thing should be to enable debugger mode.

### Enable Frontend Debug Mode

**Enable Debug Mode:**
1. Navigate to **Profile Settings** → **File Viewer Options**
2. Toggle **"Enable OnlyOffice Debug Mode"** to ON
3. Open any document with OnlyOffice
4. View the debug tooltip that appears automatically

{{% alert context="info" %}}
You should run the debugger with an admin user to also see backend logs.
{{% /alert %}}

![Debug Mode Example](https://github.com/user-attachments/assets/d4d88378-8017-4786-98b7-9fdfb72278a0)

#### What Debug Mode Shows

The debug tooltip provides:
- **Real-time trace** of the integration process
- **Network flow analysis** between components
- **Configuration details** including URLs and domains
- **Specific error detection** with troubleshooting advice
- **Connectivity testing** to OnlyOffice server

#### Network Flow Diagram

![Office Integration Diagram](https://github.com/user-attachments/assets/dd22561d-c26e-4b20-9a84-18310596d625)

The diagram shows the communication flow:
1. **Browser** ↔ **OnlyOffice Server**: Editor interface
2. **OnlyOffice** → **FileBrowser** (download URL): Fetches document
3. **OnlyOffice** → **FileBrowser** (callback URL): Saves changes

### Enable FileBrowser server debug logs

Configure filebrowser to run with {{< doclink path="advanced/logging/debug-logging/" text="debug logging" />}}

### Enable OnlyOffice service debug logs
In the `docker-compose.yaml` file of onlyoffice:

```yaml
onlyoffice:
  environment:
    - LOG_LEVEL=DEBUG
```

## Quick Diagnostics

### Verify OnlyOffice is Running

```bash
# Check health endpoint
curl http://<onlyoffice-server>/healthcheck

# Expected response:
{"status":"ok"}

# Check welcome page
curl http://<onlyoffice-server>/welcome
```

## Common Issues

### OnlyOffice Server Not Found

{{% alert context="danger" %}}
**Problem:** Documents don't open, connection refused errors

**Symptoms:**
- Error messages about connection refused
- Can't reach OnlyOffice server
- Documents fail to load
- Empty preview screen when opening documents
{{% /alert %}}

**Solutions:**

Verify OnlyOffice is running:

```bash
# Check Docker container status
docker ps | grep onlyoffice

# Check service health
curl http://<onlyoffice-server>/healthcheck
```

Expected response:
```json
{"status":"ok"}
```

FileBrowser needs correct URLs:

```yaml
integrations:
  office:
    url: "http://<onlyoffice-server>"       # Must be accessible from your browser
    secret: "your-jwt-secret"
```

{{% alert context="warning" %}}
- If using docker, `localhost` will NOT work if services are in separate containers. Use Docker service name or IP address.
- If you have the services in different physical devices, `localhost` also will not work, you will need to use the local IP address and ports of the respective devices in your local network. If you use a firewall make sure that's not interferring.
{{% /alert %}}

Test the URL from your browser: Navigate to the OnlyOffice URL - you should see a welcome page.

### JWT Authentication Errors

{{% alert context="danger" %}}
**Problem:** "JWT verification failed" or "Invalid token" errors

**Symptoms:**
- Documents won't open
- Authentication errors in logs
- Token validation failures
{{% /alert %}}

**Step 1: Generate JWT Secret**

Create a strong random secret:

```bash
# Generate 32-byte base64 secret
openssl rand -base64 32

# Or use uuidgen
uuidgen
```

**Step 2: Configure FileBrowser**

```yaml
integrations:
  office:
    url: "http://onlyoffice"
    secret: "your-generated-secret"  # Use the secret from Step 1
```

**Step 3: Configure OnlyOffice**

```yaml
onlyoffice:
  environment:
    - JWT_ENABLED=true
    - JWT_SECRET=your-generated-secret  # MUST match FileBrowser exactly
    - JWT_HEADER=Authorization
    - ALLOW_PRIVATE_IP_ADDRESS=true # This configuration allows private ip address on DNS lookup
```

{{% alert context="warning" %}}
The JWT secret must be **identical** in both configurations, including capitalization and special characters. Any mismatch will cause authentication failures.
{{% /alert %}}

### HTTPS and SSL/TLS Issues

{{% alert context="danger" %}}
**Problem:** Mixed content errors, SSL handshake failures

**Symptoms:**
- "Mixed content" warnings in browser
- Documents load partially then fail
- SSL certificate errors
- CORS errors with HTTPS
{{% /alert %}}

OnlyOffice does not work with HTTPS out of the box when behind a reverse proxy. You need proper SSL configuration.

{{< tabs tabTotal="3" >}}

{{< tab tabName="Development (HTTP)" >}}
For local development without SSL:

```yaml
integrations:
  office:
    url: "http://localhost:8080"

onlyoffice:
  environment:
    - JWT_ENABLED=true
    - JWT_SECRET=your-secret
```

{{% alert context="warning" %}}
HTTP is **not secure** for production. Only use for local testing. Never expose HTTP OnlyOffice to the internet.
{{% /alert %}}
{{< /tab >}}

{{< tab tabName="Production (Traefik)" >}}
Community-contributed Traefik configuration with automatic SSL:

**FileBrowser Service:**
```yaml
filebrowser:
  image: ghcr.io/gtsteffaniak/filebrowser:stable
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.filebrowser.rule=Host(`files.yourdomain.com`)"
    - "traefik.http.routers.filebrowser.entrypoints=websecure"
    - "traefik.http.routers.filebrowser.tls.certresolver=letsencrypt"
    - "traefik.http.services.filebrowser.loadbalancer.server.port=80"
  networks:
    - proxy

onlyoffice:
  image: onlyoffice/documentserver
  environment:
    - JWT_ENABLED=true
    - JWT_SECRET=your-secret
    - JWT_HEADER=Authorization
    - ONLYOFFICE_HTTPS_HSTS_ENABLED=false
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.onlyoffice.rule=Host(`office.yourdomain.com`)"
    - "traefik.http.routers.onlyoffice.entrypoints=websecure"
    - "traefik.http.routers.onlyoffice.tls.certresolver=letsencrypt"
    - "traefik.http.services.onlyoffice.loadbalancer.server.port=80"
    # Required headers for OnlyOffice
    - "traefik.http.routers.onlyoffice.middlewares=onlyoffice-headers"
    - "traefik.http.middlewares.onlyoffice-headers.headers.customrequestheaders.X-Forwarded-Proto=https"
    - "traefik.http.middlewares.onlyoffice-headers.headers.accesscontrolalloworiginlist=*"
  networks:
    - proxy

networks:
  proxy:
    external: true
```

**FileBrowser Config:**
```yaml
http:
  externalUrl: "https://files.yourdomain.com"
  internalUrl: "http://filebrowser:80"
  trustProxyHeaders: true   # v2.0.0+; on v1.4.x–v1.5.x use trustedHeaders list instead

integrations:
  office:
    url: "https://office.yourdomain.com"
    internalUrl: "http://onlyoffice:80" # (optional)
    secret: "your-secret"
```

{{% alert context="info" %}}
Key points:
- Both services behind Traefik with automatic Let's Encrypt certificates
- Custom headers required for OnlyOffice CORS
- `internalUrl` set for server-to-server communication
{{% /alert %}}
{{< /tab >}}

{{< tab tabName="Production (nginx)" >}}
nginx reverse proxy configuration:

```nginx
# OnlyOffice upstream
upstream onlyoffice {
    server onlyoffice:80;
}

server {
    listen 443 ssl http2;
    server_name office.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://onlyoffice;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

**FileBrowser Config:**
```yaml
http:
  internalUrl: "http://filebrowser:80"
  externalUrl: "https://files.yourdomain.com"
  trustProxyHeaders: true   # v2.0.0+; on v1.4.x–v1.5.x use trustedHeaders list instead

integrations:
  office:
    url: "https://office.yourdomain.com"
    internalUrl: "http://onlyoffice:80" # (optional)
    secret: "your-secret"
```
{{< /tab >}}

{{< /tabs >}}

### API Connection Errors
{{% alert context="danger" %}}
**Problem:** OnlyOffice API can't communicate with the browser.

**Symptoms:**
- Documents don't load.
- Blank pages.
- Office is accesible from browser, but not the API.
{{% /alert %}}

This is most common for users running behind a reverse proxy. If you have all correctly configured but you can't open any document, make sure that the API of onlyoffice is reachable, you can check this by visiting this URL in the browser or using the  `curl` command:

```shell
http://<office-server>/web-apps/apps/api/documents/api.js # http or https with domain name if behind reverse proxy
```

Possible causes:
- **Wrong reverse proxy configuration:** Make sure that you reverse proxy is properly configured.
- **CORS Issues:** If accessing from a different domain, ensure CORS is configured in you reverse proxy.
- **Firewall issues:** Make sure that you don't have firewalls that can be interferring.
- Connection errors.

If using docker, make sure that you are using the official onlyoffice image, since some from third parties have some custom configurations that might be conflicting.

### Private IP addresses
{{% alert context="danger" %}}
**Problem:** Issues when using private IP addresses.
**Symptoms:**
- Warnings when saving a document.
- Errors editing documents.
- You can also have some connection errors due to that.
{{% /alert %}}

OnlyOffice blocks private IP addresses (like 192.168.x.x) by default for security. This occurs when using internal URLs in your configuration.

To fix this you'll need to add an environment variable to your onlyoffice compose file:

```yaml
onlyoffice:
  environment:
    - JWT_ENABLED=true
    - JWT_SECRET=your-secret
    - ALLOW_PRIVATE_IP_ADDRESS=true # Add this
```

## Advanced Configuration

### External and Internal URLs

See {{< doclink path="integrations/office/configuration#external-and-internal-urls" text="Configuration" />}} for the full URL priority table (`http.internalUrl` → `http.externalUrl` → request).

### 401 or connection refused behind reverse proxy

When FileBrowser is on a subpath (for example `/files/`) behind HTTPS nginx:

1. Enable header trust on FileBrowser — `http.trustProxyHeaders: true` (**v2.0.0+**) or list forwarding headers under `http.trustedHeaders` (**v1.4.x–v1.5.x**).
2. Set `http.internalUrl` to a URL OnlyOffice can reach on the Docker/LAN network (for example `http://filebrowser:80`).
3. Optionally set `http.externalUrl` if OnlyOffice cannot use the internal URL but shares the same public host as users.

Download/callback URLs embedded in the editor config use that priority — they do **not** read raw `X-Forwarded-*` unless falling back to the request path with header trust enabled.

## Performance Issues

### Slow Document Loading

Document loading can be quite slow because of the many components onlyoffice needs to talk to. The best way to improve document loading times is to set `http.internalUrl` so OnlyOffice can communicate directly with FileBrowser on the same private network.

## Download Fails

Always look at the only office server logs for clues when you see "Download Failed" for clues that filebrowser itself can't see.

Some have also found the need for `ALLOW_PRIVATE_IP_ADDRESS=true`:

```yaml
onlyoffice:
  environment:
    - JWT_ENABLED=true
    - JWT_SECRET=your-generated-secret  # MUST match FileBrowser exactly
    - JWT_HEADER=Authorization
    - ALLOW_PRIVATE_IP_ADDRESS=true # This configuration allows private ip address on DNS lookup
```

## Getting Help

### Gather Information

When asking for help, provide:

1. **Logs:** Most imprtantly relevant debug logs from the server, as well as OnlyOffice server logs.
1. **Debug mode output** (screenshot from browser)
2. **Browser console errors** (F12 → Console tab)

### Community Resources

- [GitHub Issues](https://github.com/gtsteffaniak/filebrowser/issues) - Report bugs
- [GitHub Discussions](https://github.com/gtsteffaniak/filebrowser/discussions) - Ask questions
- [OnlyOffice Documentation](https://helpcenter.onlyoffice.com/) - Official OnlyOffice docs
- [Community Configurations](https://github.com/gtsteffaniak/filebrowser/discussions/1237) - Working examples

## Next Steps

- {{< doclink path="integrations/office/configuration/" text="Configuration" />}} - Set up OnlyOffice integration
- {{< doclink path="user-guides/office-integration/office-integration/" text="Office guides" />}} - Usage examples and best practices
- {{< doclink path="integrations/office/about/" text="About OnlyOffice" />}} - Features and capabilities
