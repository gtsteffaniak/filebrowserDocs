---
title: "Traefik Setup"
description: "Complete production setup with Traefik using Docker and Let's Encrypt"
icon: "dns"
date: "2025-10-29T22:21:43Z"
lastmod: "2026-10-03T16:30:00Z"
order: 3
---

Production-ready setup for FileBrowser Quantum and OnlyOffice behind Traefik reverse proxy with automatic HTTPS certificates from Let's Encrypt.

{{% alert context="warning" %}}
**Upgrading to v2.0.0?**

v2.0.0 uses **SQLite** (`filebrowser.sqlite`) in your data directory, not BoltDB (`database.db`). Use a directory mount for `./data` and follow the {{< doclink path="getting-started/v2/migration/" text="v2 migration guide" />}} if upgrading from v1.x.
{{% /alert %}}

{{% alert context="info" %}}
This guide is community-contributed. Special thanks to [@Kurami32](https://github.com/Kurami32) for sharing this working setup!
{{% /alert %}}

## Overview

In this guide we'll use Docker compose to setup **FileBrowser Quantum** and **OnlyOffice** behind [Traefik Reverse Proxy](https://traefik.io/traefik) for a secure production-ready deployment. You can use this guide as reference. If you want to copy-paste you also can, but remember to change all the fake info here with your own.

That said, this guide will cover:
- ✅ **Automatic HTTPS and certificate renewal** with Let's Encrypt certificates, this is managed automatically by Traefik (every 60 days approx).
- ✅ **Secure JWT authentication** between services (FileBrowser and OnlyOffice).
- ✅ **Docker compose with Traefik labels** configuration for the services.
- ✅ **A Production-ready setup** with proper security headers.

## Pre-requisites

- Docker and Docker Compose installed, see [how to install docker](https://docs.docker.com/compose/install/) for your respective OS.
- A valid and working **Domain name** and/or a **DDNS provider** configured which is required for Let's Encrypt DNS Challenge in traefik.
- **DDNS provider** [See supported providers](https://doc.traefik.io/traefik/https/acme/#providers)
- Basic understanding of Traefik, Docker, and Docker compose in general.
- Email address for Let's encrypt.

### Setting up your domain for HTTPS

To set up HTTP you need a valid domain and IP address of the server to have a secure connection. You can:

- Purchase a domain ([from this list of providers](https://community.letsencrypt.org/t/dns-providers-who-easily-integrate-with-lets-encrypt-dns-validation/86438)) and configure your DNS to point to your server IP address for Let's Encrypt to work.
- If the **purchased** domain is not in the list, then the easiest way is to change the DNS nameservers to Cloudflare by following the steps from [Offical Docs](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/).
- If you don't have a domain purchased, you can use one of the free domains from the DDNS providers and point it to the server IP address for Let's Encrypt to work.

Choosing the server IP changes the location of access. If you choose:

- Local IP address (typically, 192.168.X.Y), then you can only access when connected to that Wi-Fi.
- Public IP address (you need to port forward), then you can access anywhere from your home or even at some coffee shop. (Not recommended due to high security risk if its from home router)
- Public IP address (but from a VPS), then you can access anywhere from your home or even at some coffee shop. (Recommended with some firewall and features like fail2ban, CrowdSec setup. Out of scope for this guide).
- IP address of server in a VPN, then devices in the VPN can access to it. Even via the internet as long as the device and the server are connected to the same VPN.

{{% alert context="info" %}}
For the first few times, you may get a self-signed certificate. But after some time, you will see Let's Encrypt certificates. This is because the ACME challenge may take some time to complete.
{{% /alert %}}

## Directory Structure

A quick overview of how will look your directory structure following the steps in the guide:

{{% alert context="info" %}}
**Note:** The `.env` files on each directory of the services are [environment files](https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/#use-the-env_file-attribute) used to store sensitive information, they should go on the root folder of each service that you want to deploy, in this case, we are deploying three services **Traefik**, **Filebrowser Quantum** and **OnlyOffice**, so each directory should have its own `.env` file.

And make sure to replace all the info of the `.env` files with your **own**.
{{% /alert %}}

```shell
services/
├── filebrowser/
│   ├── data/
│   │   ├── config.yaml        # Your filebrowser configuration
│   │   └── database.db        # Database of filebrowser
│   ├── docker-compose.yaml    # Filebrowser compose file
│   └── .env                   # Environment file for filebrowser
├── onlyoffice/
│   ├── docker-compose.yaml    # Onlyoffice compose file
│   └── .env                   # Environment file for onlyofffice
└── traefik/
    ├── certs/
    │   └── acme.json          # Should have chmod 600 permissions, all the certificates will be stored on this file.
    ├── config/
    │   ├── dynamic/
    │   │   └── middlewares.yaml  # Dynamic config (File provider) of traefik, used for the security headers.
    │   └── static/
    │       └── traefik.yaml   # Static config of traefik
    ├── docker-compose.yaml    # Traefik compose file
    └── .env                   # Environment file for Traefik
```

## Step 1: Create Docker Network

All the three services must be on the same network:

```shell
docker network create \
  --driver=bridge \
  --subnet=192.168.2.0/24 \
  --gateway=192.168.2.1 \
  --ip-range=192.168.2.128/25 \
  --label=Reserved_IPs="192.168.2.2-127" \
  proxy_network
```

{{% alert context="info" %}}
**Network Explanation:**
- `subnet`: Network range for all the containers.
- `gateway`: Router IP for the network.
- `ip-range`: Dynamic IP allocation for containers without static assignment - from 128 to 255.
- `label`: Reserved IPs for containers that need them - from 2 to 127.

Which this command do is create a virtual docker network with the subnet `192.168.2.0/24` and reserve half of the IP addresses available (from `192.168.2.2` to `192.168.2.127`). The reserved IPs are for containers that you don't want to be changing its IP each time that you restart them, and how they are reserved, docker will not use them for its auto-allocation.

To assign static IPs to a container, you will need to specify the IP on the docker compose file of your service, below of the name of your docker network. For example:

```yaml
services:
  filebrowser:
    image: ghcr.io/gtsteffaniak/filebrowser:stable
    networks:
      proxy_network:                # Name of the docker network
        ipv4_address: 192.168.2.5   # IP adress that you want to use with the service, the IP will be static, don't will change.
```

If you don't want to reserve IPs, you can use this simplified version:

```shell
docker network create --driver=bridge proxy_network
```

Docker will manage **all** auto-allocate all the IPs dynamically, and will assign an available network subnet automatically. You will not have static or reserved IPs, but is fine, on this guide we will use the containers with dynamic IPs, but if you want to use a static IP, you can add the ipv4 option on the docker compose files.

{{% /alert %}}

## Step 2: Setup Traefik

### Create Traefik Directory

```shell
mkdir services && cd services
mkdir -p traefik/certs traefik/config/dynamic traefik/config/static
```

### Traefik Docker Compose

Create `traefik/docker-compose.yaml`:

```yaml
services:
  traefik:
    image: traefik:latest
    container_name: traefik
    security_opt:
      - no-new-privileges=true
    ports:
      - "80:80"
      - "443:443"
    environment:
      - DYNU_API_KEY=${DYNU_API_KEY} # we are using dynu - check the traefik documentation about other providers
      - TRAEFIK_DASHBOARD_CREDENTIALS=${TRAEFIK_DASHBOARD_CREDENTIALS}
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./config/static/traefik.yaml:/etc/traefik/traefik.yaml:ro
      - ./certs/acme.json:/var/traefik/certs/acme.json:rw
      - ./config/dynamic:/etc/traefik/config:ro
    networks:
      - proxy_network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.tls=true"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik.tls.options=default"
      - "traefik.http.routers.traefik.rule=Host(`traefik.${DOMAIN_NAME}`)"
      - "traefik.http.routers.traefik.tls.domains[0].main=${DOMAIN_NAME}"
      - "traefik.http.routers.traefik.tls.domains[0].sans=*.${DOMAIN_NAME}"
      - "traefik.http.routers.traefik.service=api@internal"
      - "traefik.http.services.traefik.loadbalancer.server.port=8080"
      - "traefik.http.services.traefik.loadbalancer.passhostheader=true"
      - "traefik.http.routers.traefik.middlewares=security-headers@file"

      # Basic auth on dashboard
      - "traefik.http.routers.traefik.middlewares=traefik-auth"
      - "traefik.http.middlewares.traefik-auth.basicauth.users=${TRAEFIK_DASHBOARD_CREDENTIALS}"

    restart: unless-stopped

networks:
  proxy_network:
    external: true
```

### Traefik Environment File

Create `traefik/.env`:

```bash
DOMAIN_NAME=your-domain.com         # Your root domain here.
DYNU_API_KEY=your-dynu-api-key-here # DDNS API Key (we are using dynu - check the traefik documentation about other providers)

# Generate with: docker run --rm httpd:alpine htpasswd -nb your-username your-password | sed -e 's/\$/\$\$/g'
TRAEFIK_DASHBOARD_CREDENTIALS=your-username:$$apr1$$5CK4UFEP$$gE8rmbSMI0Lfb9vPE9I2j/
```

**Generate dashboard credentials:**

Replace `your-username` and `your-password` with your own user and password, then paste the output in the `.env` file we created.
```bash
docker run --rm httpd:alpine htpasswd -nb your-username your-password | sed -e 's/\$/\$\$/g'
```

### Create Certificate File

```bash
touch traefik/certs/acme.json
chmod 600 traefik/certs/acme.json
```

{{% alert context="danger" %}}
The `acme.json` file **must** have `600` permissions, this is for **security**. With that permissions only the Traefik process (and you user) is able to access (read an write) the certificates stored on that file.

Also **BE SURE** that you have a copy of that file, because there is where the certificates will be stored.
{{% /alert %}}

### Traefik Configuration

Create `traefik/config/static/traefik.yaml`:

```yaml
global:
  checkNewVersion: true      # Check if new version of traefik is available
  sendAnonymousUsage: false

api:
  dashboard: true
  insecure: false

# Log level. You can use DEBUG initially for see if the certificates are being pulled correctly
log:
  level: INFO # DEBUG, INFO, WARN, ERROR, FATAL, PANIC

entryPoints:
  web:
    address: :80
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
          permanent: true

  websecure:
    address: :443
    http:
      tls:
        certResolver: letsencrypt
    transport:
      respondingTimeouts:
        readTimeout: "300s"
        writeTimeout: "300s"
        idleTimeout: "360s"
    http2:
      maxConcurrentStreams: 500
    asDefault: true

serversTransport:
  insecureSkipVerify: false
  forwardingTimeouts:
    dialTimeout: "60s"           # Time to establish TCP connection
    responseHeaderTimeout: "60s" # Time for backend to send headers
    idleConnTimeout: "90s"

http:
  timeouts:
    readTimeout: "300s"
    writeTimeout: "300s"
    idleTimeout: "360s"

tls:
  options:
    modern:
      minVersion: 'VersionTLS13'
    default:
      minVersion: 'VersionTLS12'
      cipherSuites:
        - 'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256'
        - 'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256'
        - 'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384'
        - 'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384'
        - 'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305'
        - 'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305'

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    network: "proxy_network"
    exposedByDefault: false
  file:
    directory: "/etc/traefik/config" # Directory mounted in the compose file, here we will define our security headers for the services - Also called File Provider
    watch: true

certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@provider.com  # Replace with your email
      storage: /var/traefik/certs/acme.json
      # Use staging first for testing first:
      # caServer: https://acme-staging-v02.api.letsencrypt.org/directory
      # Then switch to production:
      caServer: https://acme-v02.api.letsencrypt.org/directory # certificates for production
      dnsChallenge:
        provider: dynu
        resolvers:
        - "1.1.1.1:53"
        - "1.0.0.1:53"
        # Uncomment if having issues when pulling the certificates.
        # disablePropagationCheck: true
        # delayBeforeCheck: "60s"
```

{{% alert context="warning" %}}
**Important Configuration Updates:**
1. Replace `your-email@provider.com` with your actual email.
2. Change `dynu` with your DDNS provider and update the traefik compose and `.env` if you do.
3. Start with staging `caServer` for testing, then switch to production. Let's encrypt has a rate-limit, so if something goes wrong you are testing first.

The staging `caServer` will not give you valid TLS certificates (you will have a warning saying that the site is not secure), but you can see that they are coming from Let's encrypt on your browser, so that is how you test that is working.
{{% /alert %}}

#### Define the security middleware headers:
They will go in our dynamic config directory of traefik (Also called [File Provider](https://doc.traefik.io/traefik/reference/install-configuration/providers/others/file/)).

Create `traefik/config/dynamic/middlewares.yaml`:

```yaml
http:
#  Each middleware defined need to be referenced in each service docker-compose via labels to use them.
  middlewares:
    # Global security headers
    security-headers:
      headers:
        frameDeny: true
        sslRedirect: true
        browserXssFilter: true
        contentTypeNosniff: true
        forceSTSHeader: true
        stsIncludeSubdomains: true
        stsPreload: true
        stsSeconds: 15552000
        customFrameOptionsValue: "SAMEORIGIN"
        referrerPolicy: "strict-origin-when-cross-origin"
        customRequestHeaders:
          X-Forwarded-Proto: "https"
          X-Real-IP: "true"
          X-Forwarded-For: "true"

    # Same as security headers, but letting the site being embedded (allowing i-frames) which onlyoffice needs.
    no-frame-block:
      headers:
        sslRedirect: true
        browserXssFilter: true
        contentTypeNosniff: true
        forceSTSHeader: true
        stsIncludeSubdomains: true
        stsPreload: true
        stsSeconds: 15552000
        referrerPolicy: "strict-origin-when-cross-origin"
        customRequestHeaders:
          X-Forwarded-Proto: "https"
          X-Real-IP: "true"
          X-Forwarded-For: "true"

    # This middleware is to disable buffering, only use it if you have issues with SSE or uploading large files to filebrowser
    limit:
      buffering:
        maxRequestBodyBytes: 0
        maxResponseBodyBytes: 0
        memRequestBodyBytes: 0
        memResponseBodyBytes: 0


    # This middleware is more for internal services, like APIs or databases.
    security-minimal:
      headers:
        sslRedirect: true
        contentTypeNosniff: true
        stsPreload: true
        customRequestHeaders:
          X-Forwarded-Proto: "https"
```

### Deploy Traefik

Just like any other service using docker compose. You should be on the directory where you `docker-compose.yaml` is located and:

```shell
docker compose up -d
```

See the logs of traefik to see what's happening (CTRL+C to exit):

```shell
docker logs traefik -f
```

#### Test that traefik is working

For test if traefik is working you can visit the dashboard of traefik at: `https://traefik.your-domain.com` (the domain that you used on the `.env` file), and log in with the credentials that you generated before.

<img src="../assets/traefik-dashboard.png" alt="traefik-dashboard" />

If the page is working you did all correctly! Let's go with Filebrowser and OnlyOffice now.

{{% alert context="danger" %}}
Once you tested that all is working on the staging server, before you change to production **BE SURE** that you deleted the `acme.json` file first before pulling the new production certificates. You can just delete the content inside, or recreate the file again:

```shell
rm -rf traefik/certs/acme.json
touch traefik/certs/acme.json
chmod 600 traefik/certs/acme.json
```

After that wait ~5 minutes and test with the production certs.
{{% /alert %}}

## Step 3: Setup OnlyOffice

### Create OnlyOffice Directory

```bash
cd services # the same directory where traefik is
mkdir -p onlyoffice
```

### OnlyOffice Docker Compose

Create `onlyoffice/docker-compose.yaml`:

```yaml
services:
  onlyoffice:
    container_name: onlyoffice
    image: onlyoffice/documentserver
    environment:
      TZ: $TZ
      JWT_SECRET: $ONLYOFFICE_SECRET
      ONLYOFFICE_HTTPS_HSTS_ENABLED: false
    #ports:
     # - '8081:80'  # Commented out because traefik will handle it.
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.tls=true"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.entrypoints=websecure"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.tls.certresolver=letsencrypt"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.tls.options=default"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.rule=Host(${DOMAIN_NAME})"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.service=${TRAEFIK_SERVICE_NAME}"
      - "traefik.http.services.${TRAEFIK_SERVICE_NAME}.loadbalancer.server.port=${TRAEFIK_SERVICE_PORT}"
      - "traefik.http.services.${TRAEFIK_SERVICE_NAME}.loadbalancer.passhostheader=true"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.middlewares=no-frame-block@file"   # no-frame-block header that we defined in the middlewares.yaml config file.

      # Headers for onlyoffice, see https://github.com/ONLYOFFICE/onlyoffice-nextcloud/issues/151 for details
      - "traefik.http.middlewares.${TRAEFIK_SERVICE_NAME}-headers.headers.accesscontrolalloworiginlist=*"
    networks:
      proxy_network:
    restart: unless-stopped

networks:
  proxy_network:
    external: true
```

{{% alert context="info" %}}
**Critical for OnlyOffice:**
- `accesscontrolalloworiginlist=*`: Middleware required for CORS - without this onlyoffice don't will work with filebrowser and you will run into issues.
- `ONLYOFFICE_HTTPS_HSTS_ENABLED: false`: Since traefik will handle HTTPS, not OnlyOffice.
- We should use the `no-frame-block` middleware instead of `security-headers` to allow onlyoffice to be embedded into FileBrowser.
{{% /alert %}}

### Generate JWT Secret

```bash
openssl rand -base64 32
# Example output: KDSpcNwKAos2moijgdfi9jf9wr3wek=
```

{{% alert context="info" %}}
Save this secret - you'll need it for both FileBrowser, and OnlyOffice configuration `.env` file.
{{% /alert %}}

### OnlyOffice Environment File

Create `onlyoffice/.env`:

```bash
TRAEFIK_SERVICE_NAME=onlyoffice
TRAEFIK_SERVICE_PORT=80
DOMAIN_NAME=`office.yourdomain.com`   # Don't forget the backticks, they are critical for traefik
ONLYOFFICE_SECRET=KDSpcNwKAos2moijgdfi9jf9wr3wek=  # Your output of the openssl command
TZ=America/New_York  # Your timezone
```

### Deploy OnlyOffice

```shell
docker compose up -d
```

Check the logs to see what's happening (CTRL+C to exit):

```shell
docker logs onlyoffice -f
```

#### Test that OnlyOffice is working

- Visit your onlyoffice URL on your browser (`https://office.yourdomain.com`) , you should see something like this:

<img src="../assets/office-welcome.png" alt="office" />

- You can also verify with curl:

```shell
curl https://office.yourdomain.com/healthcheck
# Should return "true", that means that the healthcheck is active and working
```

## Step 4: Setup FileBrowser Quantum

Now let's go with Filebrowser!

### Create Filebrowser Directory

```bash
cd services  # the same directory where traefik and onlyoffice are.
mkdir -p filebrowser/data
touch filebrowser/data/database.db
```

### FileBrowser Docker Compose

{{% alert context="info" %}}
Similar to {{< doclink path="user-guides/office-integration/basic-docker-setup/" text="getting started docker guide" />}} but customized to work with Traefik. Remember to change the `volumes` block with your actual data or folders (Sources), the ones here an example.
{{% /alert %}}

Create `filebrowser/docker-compose.yaml`:

```yaml
services:
  filebrowser:
    container_name: filebrowser
    image: ghcr.io/gtsteffaniak/filebrowser:stable
    env_file: .env
    environment:
      FILEBROWSER_CONFIG: "data/config.yaml"
      FILEBROWSER_DATABASE_PATH: "data/filebrowser.sqlite"
      FILEBROWSER_ADMIN_PASSWORD: ${FILEBROWSER_ADMIN_PASSWORD}
      TZ: ${TZ}
    volumes:
      - './data:/home/filebrowser/data'
      - '/files:/files'
      - '/other/path/media:/media'
    user: filebrowser
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.tls=true"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.entrypoints=websecure"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.tls.certresolver=letsencrypt"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.tls.options=default"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.rule=Host(${DOMAIN_NAME})"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.service=${TRAEFIK_SERVICE_NAME}"
      - "traefik.http.services.${TRAEFIK_SERVICE_NAME}.loadbalancer.server.port=${TRAEFIK_SERVICE_PORT}"
      - "traefik.http.services.${TRAEFIK_SERVICE_NAME}.loadbalancer.passhostheader=true"
      - "traefik.http.routers.${TRAEFIK_SERVICE_NAME}.middlewares=security-headers@file" # Security headers, you can also add the 'limit' middleware if you have issues with large file uploads.  'security-headers@file,limit@file'

    networks:
      proxy_network:
    restart: unless-stopped

networks:
  proxy_network:
    external: true
```

### FileBrowser Environment File

Create `filebrowser/.env`:

```bash
FILEBROWSER_ADMIN_PASSWORD=YourSecurePassword
DOMAIN_NAME=files.yourdomain.com
TRAEFIK_SERVICE_NAME=filebrowser
TRAEFIK_SERVICE_PORT=80
TZ=America/New_York # Your Timezone
```

### FileBrowser Configuration

See {{< doclink path="configuration/configuration-overview/" text="configuration overview" />}} if you want better explanations about the config file.

Create `filebrowser/data/config.yaml`:

```yaml
http:
  port: 80
  baseURL: "/"
  externalUrl: "https://files.yourdomain.com"
  internalUrl: "http://filebrowser:80"

server:
  sources:
  # Sources for filebrowser, the path should match your volume mount (of the right)
    - path: "/files"
      name: "Files"
      config:
        defaultEnabled: true
        createUserDir: true
    - path: "/media"
      name: "Media"
      config:
        defaultEnabled: false
        createUserDir: false

auth:
  tokenExpirationHours: 6
  adminUsername: admin   # Your admin username, change this.
  methods:
    password:
      enabled: true
      minLength: 5 # Minimum lenght of the password
      signup: false

userDefaults:
  ui:
    darkMode: true
    locale: "en"
  fileViewer:
    disableOnlyOfficeExt: ".txt .html .md"

integrations:
  office:
    url: "https://office.yourdomain.com"       # The URL to the OnlyOffice Server that you defined in the onlyoffice .env
    internalUrl: "http://onlyoffice:80"        # Optional internal URL, uses the container name to communicate.
    secret: "KDSpcNwKAos2moijgdfi9jf9wr3wek="  # Should be the SAME as OnlyOffice secret (also in onlyoffice .env)
    viewOnly: false
```

{{% alert context="warning" %}}
**Critical Configuration:**
- `http.externalUrl`: Must match your FileBrowser domain configured in `.env` file.
- `http.internalUrl`: Uses Docker service name reachable from OnlyOffice (for example `http://filebrowser:80`).
- `integrations.office.url`: Must match your OnlyOffice domain configured on the `.env` file of OnlyOffice.
- `integrations.office.secret`: Must match OnlyOffice `JWT_SECRET` exactly (also in the onlyoffice `.env`)
{{% /alert %}}

### Deploy FileBrowser

```shell
docker compose up -d
```

Check the logs to see what is happening (CTRL+C to exit):

```shell
docker logs filebrowser -f
```

#### Test that FileBrowser is working

- Open your FileBrowser domain on your browser (`https://files.yourdomain.com`), you should see the login page.
- Login with your credentials that you configured in both: The password in the `.env` file, and the username in `config.yaml`.

## Testing the Integration

1. Navigate to your FileBrowser domain (`https://files.yourdomain.com`), and login.
2. Upload a test `.docx` (or any document) file.
3. Open the file - The file should open in OnlyOffice.
4. If all loaded fine, try to make edits and then save.
5. Verify changes persisted (close and open the file again)

### Enable Debug Mode
If you have issues with OnlyOffice, you should enable the office debug mode in FileBrowser. To do that go to `settings -> profile settings -> File Viewer Options` in UI and enable the debug mode.

<img src="../assets/office-debug-mode.png" alt="office-debug-mode" />

After that open any document and check the debug window, also check the logs of both containers as well. See {{< doclink path="integrations/office/troubleshooting/" text="troubleshooting" />}} for more detailed solutions.

## Certificate Management

### Check Certificate Status

You will need to have the `jq` package installed if you want a colored output.

```bash
# View certificate details
docker exec traefik cat /var/traefik/certs/acme.json | jq

# Check certificate expiration
openssl s_client -connect files.yourdomain.com:443 -servername files.yourdomain.com < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

### Certificate Renewal

Traefik automatically renews certificates 30 days before expiration. No manual action needed!

**Force Renewal (if needed):**

Navigate to your traefik directory.

```bash
# Stop Traefik
docker compose down -v

# Backup and clear certificates
cp certs/acme.json certs/acme.json.bak
rm -rf certs/acme.json
touch certs/acme.json
chmod 600 certs/acme.json

# Restart Traefik (will request new certificates)
docker compose up -d --force-recreate
```

## Maintenance

### Update Services

{{% alert context="info" %}}
You will need to navigate to the directory of each service (where the `docker-compose.yaml` is) and do the next commands on each.
{{% /alert %}}

```bash
docker compose pull                     # Pull the latest image available of the service.
docker compose up -d --force-recreate   # Re-create the container and restart it automatically.
```

### View Logs

```bash
docker logs filebrowser -f # or onlyoffice, traefik (by service name)
```

## Troubleshooting

### Certificates Not Generating
If you notice that you certificates are not being generated, the first thing that you should do is check your Traefik logs.

First enable `DEBUG` logs in the `traefik.yaml` config file:

```yaml
log:
  level: DEBUG # DEBUG, INFO, WARN, ERROR, FATAL, PANIC
```

Then restart the service and check the logs:

```bash
docker restart traefik
docker logs traefik -f | grep acme
```

- Also try uncommenting the last lines on the `traefik.yaml` config file.
- And check the `acme.json` file. You should see the certificates there, for that, first navigate to the directory where your services are, then do this command:

```shell
# jq is optional, is just for colorize the output.
cat traefik/certs/acme.json | jq
```

**Common issues:**
- Wrong DDNS API key, make sure that you copied it correctly from your DDNS provider.
- TXT records could not be propagated yet, you will need to wait a bit if is the first pulling the certificates, can take around 5 minutes.
- Maybe you were rate-limited due to multiple certs generation, you should use staging first for test, that way you're not rate-limited.
- Wrong `acme.json` permissions.
- Wrong domain.

### OnlyOffice Shows Blank Screen

1. Check if OnlyOffice is healthy/running:

```bash
curl https://office.yourdomain.com/healthcheck
```

Or visit your OnlyOffice domain on the browser, the page should load.

2. Verify JWT secrets match. Should be same on OnlyOffice and FileBrowser.
3. Check browser console for CORS errors.
4. Enable office debug mode in FileBrowser.

Also ensure that all the **external** URLs use `https://`:

```yaml
server:
  externalUrl: "https://files.yourdomain.com"
  internalUrl: "http://filebrowser:80"

integrations:
  office:
    url: "https://office.yourdomain.com"
    internalUrl: "http://onlyoffice:80" # (optional)
```

### Other issues

If you have other issues related with OnlyOffice and FileBrowser, you should check the {{< doclink path="integrations/office/troubleshooting/" text="Office Troubleshooting guide" />}}, which covers some of the most commons issues with solutions.

## External Resources
- [OnlyOffice Documentation](https://helpcenter.onlyoffice.com/docs)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## Next Steps

- {{< doclink path="user-guides/office-integration/office-internal-https/" text="Advanced HTTPS Configuration" />}} - Self-signed certificates and Traefik file provider
- {{< doclink path="integrations/office/troubleshooting/" text="Office Troubleshooting" />}} - Detailed troubleshooting guide
- {{< doclink path="integrations/office/configuration/" text="Configuration Reference" />}} - All configuration options

## Credits

This guide is a community-contributed guide by [@Kurami32](https://github.com/gtsteffaniak/filebrowser/discussions/1237#discussioncomment-14447935). Thank you for sharing your working setup!