---
title: "Self-signed certificates with Traefik"
description: "Internal HTTPS for onlyoffice using self-signed certificates with traefik"
icon: "lock"
date: "2025-12-22T20:47:25Z"
lastmod: "2026-03-10T00:10:42Z"
order: 4
---

Internal HTTPS setup for onlyoffice using self-signed certificates with traefik.

{{% alert context="info" %}}
This guide is mostly from [this discussion](https://github.com/gtsteffaniak/filebrowser/discussions/1237), if you have some issue with the guide, you can leave a comment there.
{{% /alert %}}

## Overview

In this guide we will setup OnlyOffice with internal HTTPS using generated self-signed certificates with Traefik.

{{% alert context="warning" %}}
**Recommended:** Only use this guide if you have specific security requirements. Please, check the {{< doclink path="user-guides/office-integration/traefik-setup/" text="Traefik Setup Guide" />}} first if you are starting, because this guide is intended for advanced users and we will use that guide as base for this one.
{{% /alert %}}

## OnlyOffice configuration

### Step 01: Generate OnlyOffice self-signed certificates

First navigate to your OnlyOffice directory (where you have the `docker-compose.yaml`), once there create the directory for the certificates:

```bash
mkdir -p certs && cd certs
```

After that, generate the certificates with this command:

```shell
openssl req -x509 -nodes -days 20000 -subj "/CN=onlyoffice" \
  -newkey rsa:2048 \
  -keyout onlyoffice.key \
  -out onlyoffice.crt
```

<div align="center">

#### Command explanation

| Flag | Purpose |
|------|---------|
| `-x509` | Create self-signed certificate (not a request) |
| `-nodes` | No password required |
| `-days 20000` | Valid for ~50 years (only for internal use) |
| `-subj "/CN=onlyoffice"` | Set Common Name without prompts |
| `-newkey rsa:2048` | Generate RSA 2048-bit key pair |

</div>

{{% alert context="warning" %}}
**Security Note:** Setting expiration to 20,000 days is bad practice for public certificates, but in this case is acceptable because:
- Traefik will use these certificates **only for internal verification**.
- The Browser will use and see the SSL Let's Encrypt certificates that come from Traefik.
- The certificates are never exposed publicly, as they are **only used internally**.
{{% /alert %}}

### Step 02: Update OnlyOffice with the new created certificates

You will need to mount the self-signed certificates to OnlyOffice in your `docker-compose.yaml`.

{{% alert context="info" %}}
This is the `docker-compose.yaml` form the {{< doclink path="user-guides/office-integration/traefik-setup/#traefik-docker-compose" text="previous guide" />}} modified to use with the self-signed certs.
{{% /alert %}}

```yaml
services:
  onlyoffice:
    container_name: onlyoffice
    image: onlyoffice/documentserver
    environment:
      TZ: $TZ
      JWT_SECRET: $ONLYOFFICE_SECRET
      ONLYOFFICE_HTTPS_HSTS_ENABLED: false
      # Add this two env vars
      SSL_CERTIFICATE_PATH: /var/www/onlyoffice/Data/certs/onlyoffice.crt
      SSL_KEY_PATH: /var/www/onlyoffice/Data/certs/onlyoffice.key
    # And this volume mount
    volumes:
      - ./certs:/var/www/onlyoffice/Data/certs  # Mount certificates
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.tls=true"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.entrypoints=websecure"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.tls.certresolver=letsencrypt"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.tls.options=default"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.rule=Host(${DOMAIN_NAME})"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.service=${TRAEFIK_SERVICE_NAME}"
      - "traefik.http.services.${TRAEFIK_SERVICE_NAME}.loadbalancer.server.url=${OFFICE_INTERNAL}" # change port with url, and set the container name with https
      - "traefik.http.services.${TRAEFIK_SERVICE_NAME}.loadbalancer.passhostheader=true"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.middlewares=no-frame-block@file"

      # Headers for onlyoffice, see https://github.com/ONLYOFFICE/onlyoffice-nextcloud/issues/151 for details
      - "traefik.http.middlewares.${TRAEFIK_SERVICE_NAME}-headers.headers.accesscontrolalloworiginlist=*"
    networks:
      proxy_network:
    restart: unless-stopped

networks:
  proxy_network:
    external: true

```

Then, modify the `.env` (environment) file of onlyoffice:

```env
DOMAIN_NAME=your-domain.com         # Your root domain here.
DYNU_API_KEY=your-dynu-api-key-here # DDNS API Key (we are using dynu - check the traefik documentation about other providers)

# Traefik Dashboard Credentials
# Generate with: docker run --rm httpd:alpine htpasswd -nb your-username your-password | sed -e 's/\$/\$\$/g'
TRAEFIK_DASHBOARD_CREDENTIALS=admin:$$apr1$$H6uskkkW$$IgXLP6ewTrSuBkTrqE8wj/

# Add this
OFFICE_INTERNAL=https://onlyoffice
```

{{% alert context="warning" %}}
- The certificates **MUST** be mounted at `/var/www/onlyoffice/Data/certs` (in the right side) and should be named `onlyoffice.key` and `onlyoffice.crt`.
- In the previous guide, we used port 80, but now that is not neccesary, instead we will use URL that will be used to communicate with filebrowser: `"traefik.http.services.${TRAEFIK_SERVICE_NAME}.loadbalancer.server.url=https://onlyoffice"`
- If you want, you can delete your `${TRAEFIK_SERVICE_PORT}` from your `.env` file since is no longer needed.
{{% /alert %}}

### Alternative: Traefik file provider

Instead of use traefik labels as above, we can also deploy onlyoffice using File Provider.
This is similar to when we {{< doclink path="user-guides/office-integration/traefik-setup#define-the-security-middleware-headers" text="created the middlewares.yaml" />}} file. You should have a dynamic directory that traefik reads, so, in that same directory where the `middlewares.yaml` is, create a file called `onlyoffice.yaml` or how you prefer.

- `traefik/config/dynamic/onlyoffice.yaml`:

```yaml
http:
  routers:
    onlyoffice:
      entrypoints:
        - websecure
      rule: Host(`onlyoffice.yourdomain.com`)
      tls:
        certResolver: letsencrypt
      service: onlyoffice
      middlewares:
        - onlyoffice-headers
        - no-frame-block

  services:
    onlyoffice:
      loadBalancer:
        servers:
          - url: "https://onlyoffice"  # Note: HTTPS, not HTTP
        serversTransport: onlyoffice  # Reference to transport below

  middlewares:
    onlyoffice-headers:
      headers:
        customRequestHeaders:
          X-Forwarded-Proto: "https"
        accessControlAllowOriginList:
          - "*"

  serversTransports:
    onlyoffice:
      insecureSkipVerify: true  # This skips certificate verification
```

### Step 03: Configure Traefik

Traefik needs to be told to skip certificate verification, so if you followed the {{< doclink path="user-guides/office-integration/traefik-setup/" text="previous guide" />}}, we are validating the verification of the certificates in our `traefik.yaml` static config file by setting it to `false`, we need to set it to `true`:

```yaml
serversTransport:
  insecureSkipVerify: true  # Set this to true to skip the verification
  forwardingTimeouts:
    dialTimeout: "60s"
    responseHeaderTimeout: "60s"
    idleConnTimeout: "90s"
```
{{% alert context="danger" %}}
If you don't change `insecureSkipVerify` to true, you will have the next error in the traefik logs and OnlyOffice don't will work

```shell
traefik  | 2025-11-21T15:14:17-05:00 ERR github.com/traefik/traefik/v3/pkg/proxy/httputil/proxy.go:119 > 500 Internal Server Error error="tls: failed to verify certificate: x509: certificate relies on legacy Common Name field, use SANs instead"
```
{{% /alert %}}

### Step 04: Update FileBrowser Configuration

```yaml
integrations:
  office:
    url: "https://onlyoffice.yourdomain.com"  # External HTTPS URL
    internalUrl: "https://onlyoffice" # Internal HTTPS URL, the one that we defined in the .env file which should be the container name.
    secret: "your-jwt-secret"
```

### Step 05: Re-deploy the services
Navigate to the directory of each service and then run the next command in each one:

```bash
docker compose up -d --force-recreate
```

### Verify Configuration

```bash
# Check OnlyOffice is using HTTPS (You should see that is listening to 0.0.0.0:443 and is using SSL)
docker exec onlyoffice cat /etc/onlyoffice/documentserver/nginx/ds.conf | grep ssl

# Test from Traefik perspective (Should perform the helthcheck successfully)
docker exec traefik wget --no-check-certificate https://onlyoffice/healthcheck
```
## Self-Signed Certificates with Full Verification

{{% alert context="warning" %}}
I haven't found a way to make this work with labels, so if you want the full verification, you will need to use onlyoffice with {{< doclink path="user-guides/office-integration/office-internal-https/#alternative-traefik-file-provider" text="file provider" />}}.

But the full verification is optional, we'll just make sure that traefik trust our self-signed certificate, this is more complex and is prone to fail or to have issues... So I recommend to keep skip verification and use HTTPS externally.
{{% /alert %}}

First of all, make **SURE** that you have `insecureSkipVerify` set to `false`.

- `traefik.yaml`
```yaml
serversTransport:
  insecureSkipVerify: false  # Set this to false to NOT skip the verification
  forwardingTimeouts:
    dialTimeout: "60s"
    responseHeaderTimeout: "60s"
    idleConnTimeout: "90s"
```

### Step 01: Create Certificate Configuration

You will need to create a config file for the onlyoffice certificates.

Create `onlyoffice/certs/cert.conf`:

```ini
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req

[dn]
CN = onlyoffice

[v3_req]
subjectAltName = @alt_names

[alt_names]
IP.1 = 192.168.2.125  # Static IP for OnlyOffice container
DNS.1 = onlyoffice   # Docker service name
```

{{% alert context="info" %}}
**Why IP and DNS?**
- `IP.1`: Allows verification via IP address from the onlyoffice container
- `DNS.1`: Allows verification via Docker service name

Both are required for proper certificate validation
{{% /alert %}}

### Step 02: Generate Certificates with config

```bash
cd certs
openssl req -x509 -nodes -days 20000 \
  -keyout onlyoffice.key \
  -out onlyoffice.crt \
  -config cert.conf
```

### Step 3: Assign Static IP to OnlyOffice

Update `onlyoffice/docker-compose.yaml`:

```yaml
services:
  onlyoffice:
    image: onlyoffice/documentserver
    container_name: onlyoffice
    environment:
      - JWT_ENABLED=true
      - JWT_SECRET=your-secret
      - ONLYOFFICE_HTTPS_HSTS_ENABLED=false
    volumes:
      - ./certs:/var/www/onlyoffice/Data/certs
    networks:
      proxy_network:
        ipv4_address: 192.168.2.125  # Must match cert.conf
```

{{% alert context="warning" %}}
**IP Address Rules:**
- Must be in your Docker network subnet (e.g., `192.168.2.0/24`)
- Must match exactly what's in `cert.conf`

If you followed the previous guide {{< doclink path="user-guides/office-integration/traefik-setup/#step-1-create-docker-network" text="we created a docker network" />}} with a reserved range of IPs, you can set one IP inside that range, since these IPs are reserved and the auto-allocation of traefik will never take them.

But if you used the simplified command, you will need to set a very high number to avoid the auto-allocation.
{{% /alert %}}

### Step 4: Mount Certificate in Traefik

Traefik needs access to the certificate to verify it:

{{% alert context="info" %}}
This **ONLY** is for traefik, the service, **NOT** for the whole container, traefik will trust the certificate letting us access to onlyoffice throught our domain.

That means that if we try to verify the validation from other ways like trying to use `wget` from inside the traefik container, this will be rejected saying that is "not trusted", but meanwhile we can access to onlyoffice throught the browser is fine.
{{% /alert %}}

```yaml
traefik:
  image: traefik:latest
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
    - ./config/static/traefik.yaml:/etc/traefik/traefik.yaml:ro
    - ./config/dynamic:/dynamic:ro
    - /path/to/certs/onlyoffice.crt:/certs/onlyoffice.crt:ro  # Add this
```

### Step 5: Update Traefik Dynamic Config

Create `dynamic/onlyoffice.yml`:

```yaml
http:
  routers:
    onlyoffice:
      entrypoints:
        - websecure
      rule: Host(`onlyoffice.yourdomain.com`)
      tls:
        certResolver: letsencrypt
      service: onlyoffice
      middlewares:
        - onlyoffice-headers
        - no-frame-block

  services:
    onlyoffice:
      loadBalancer:
        servers:
          - url: "https://onlyoffice"
        serversTransport: onlyoffice

  middlewares:
    onlyoffice-headers:
      headers:
        customRequestHeaders:
          X-Forwarded-Proto: "https"
        accessControlAllowOriginList:
          - "*"

  serversTransports:
    onlyoffice:
      insecureSkipVerify: false  # Change it to false
      rootCAs:
        - /certs/onlyoffice.crt  # Path inside Traefik container
```

### Step 6: Restart containers

```bash
# Restart all services
docker compose restart traefik
docker compose restart onlyoffice
docker compose restart filebrowser

# Check Traefik can verify certificate
docker exec traefik wget https://onlyoffice/healthcheck
# Should succeed without certificate errors
```

{{% alert context="info" %}}
Now Traefik should validate OnlyOffice's certificate using the provided CA, if you have issues, try to follow the troubleshooting steps, but how I said, this might not work well for some people...
{{% /alert %}}

## Check Certificate Details
If you want to check the details of your certificates you can use this commands:

```shell
# Check certificate subject and SAN (Subject Alternative Name)
openssl x509 -in certs/onlyoffice.crt -noout -text | grep -A1 "Subject:"
openssl x509 -in certs/onlyoffice.crt -noout -text | grep -A2 "Subject Alternative"

# Should show something like this:
# Subject: CN = onlyoffice
# Subject Alternative Name:
#   DNS:onlyoffice, IP Address: <configured ip address>
```

## Troubleshooting
First of all try to check logs of the apps, there you should find some essential info about why you are having the errors/issues.

```bash
docker logs traefik -f
```

```shell
docker logs onlyoffice -f
```

### Certificate Errors
If you used the full verification method, you could have some errors with the certificates.

Some common errors could be:
 - `x509: certificate signed by unknown authority`: Maybe you forget to specify the rootCAs in transport when configuting file provider for onlyoffice.
 - `x509: certificate is valid for X, not Y`: Maybe you set the wrong IP adress or DNS, either in the certificate configuration or in the container, and now is mismatching. Make sure that they are the same in both.
 - `tls: bad certificate`: You mounted a wrong path for the certificate in onlyoffice, or traefik.

### OnlyOffice not Starting with HTTPS

```bash
# Check OnlyOffice nginx config
docker exec onlyoffice cat /etc/onlyoffice/documentserver/nginx/ds.conf

# Check certificate files
docker exec onlyoffice ls -la /var/www/onlyoffice/Data/certs/

# Should show:
# -rw-r--r-- onlyoffice.crt
# -rw-r--r-- onlyoffice.key
```

### Mixed Content Errors

Ensure all URLs use `https://` in FileBrowser config:

```yaml
server:
  externalUrl: "https://files.yourdomain.com"
  internalUrl: "https://files.yourdomain.com"

integrations:
  office:
    url: "https://onlyoffice.yourdomain.com"
    internalUrl: "https://onlyoffice:80"
```

### FBQ not trusting OnlyOffice certs
If for some reason the filebrowser container doesn't trust the certificates (even configured via Traefik), you'll need to mount and update the certificates of the FileBrowser container in startup.

```yaml
services:
  filebrowser:
    container_name: filebrowser
    image: ghcr.io/gtsteffaniak/filebrowser:stable
    env_file: .env
    environment:
    # ... Existent enviroment variables
    volumes:
      - './data:/home/filebrowser/data'
      # ... Other volumes
      - /path/to/certs/onlyoffice.crt:/usr/local/share/ca-certificates/onlyoffice.crt:ro # Mount the OO certs
    labels:
    # ... Existent labels
    networks:
      proxy_network:
    restart: unless-stopped

    # trust certs and launch filebrowser
    entrypoint: sh -c "update-ca-certificates && ./filebrowser"

networks:
  proxy_network:
    external: true
```


### Other issues

If you have other issues related with OnlyOffice and FileBrowser, check the {{< doclink path="integrations/office/troubleshooting/" text="Office Troubleshooting guide" />}}, which covers some of the most commons issues with solutions.

## Next Steps

- {{< doclink path="user-guides/office-integration/basic-docker-setup/" text="Basic Docker Setup" />}} - Start here if new to Docker.
- {{< doclink path="user-guides/office-integration/traefik-setup/" text="Traefik Setup Guide" />}} - Complete services setup behind Traefik.
- {{< doclink path="integrations/office/troubleshooting/" text="Office Troubleshooting" />}} - Detailed problem solving.
- {{< doclink path="integrations/office/configuration/" text="Configuration Reference" />}} - All config options.