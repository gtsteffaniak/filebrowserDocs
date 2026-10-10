---
title: "Init Script Setup"
description: "Automate FileBrowser initialization with scripts"
icon: "play_circle"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-03T16:20:00Z"
---

Automated initialization scripts for FileBrowser using the API. Works across Docker, Docker Compose, Kubernetes, and bare metal deployments.

{{% alert context="warning" %}}
**v2.0.0 behavior change**

User **file** permissions (**view**, **download**, **modify**, **create**, **delete**) must be set on **`scopes[].permissions`**, not on top-level `permissions`. **`view` is new in v2.0.0** — in v1.x, browsing a scope was always allowed. Top-level `permissions` is global only: **admin**, **api**, **share**, **realtime**. User API updates use **`PATCH`** (partial payloads) and address users by **username**. See {{< doclink path="configuration/users/" text="User Management" />}} and {{< doclink path="reference/api/" text="API reference" />}}.
{{% /alert %}}

## Overview

FileBrowser creates a default admin user on first startup using credentials from your configuration. Init scripts use this account to:

1. Wait for FileBrowser to be ready (health check)
2. Authenticate using admin credentials
3. Receive a JWT token
4. Perform setup tasks (create users, configure settings, etc.)

## Quick Start

### Basic Init Script

Create `init-filebrowser.sh`:

```bash
#!/bin/bash
set -e

FILEBROWSER_URL="${FILEBROWSER_URL:-http://localhost:8080}"
ADMIN_USERNAME="${FILEBROWSER_ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${FILEBROWSER_ADMIN_PASSWORD:-admin}"

# Wait for FileBrowser
until curl -f -s "${FILEBROWSER_URL}/health" > /dev/null 2>&1; do
    echo "Waiting for FileBrowser..."
    sleep 2
done

# Get auth token
TOKEN=$(curl -s -X POST -H "X-Password: ${ADMIN_PASSWORD}" \
  "${FILEBROWSER_URL}/api/auth/login?username=${ADMIN_USERNAME}")

# Create a user
curl -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "which": [],
    "data": {
      "username": "demo",
      "password": "demo123",
      "loginMethod": "password",
      "permissions": {
        "admin": false,
        "api": false,
        "share": true,
        "realtime": false
      },
      "scopes": [
        {
          "name": "files",
          "scope": "/",
          "permissions": {
            "view": true,
            "download": true,
            "modify": true,
            "create": true,
            "delete": true
          }
        }
      ]
    }
  }' \
  "${FILEBROWSER_URL}/api/users"

echo "Initialization complete!"
```

Make it executable:
```bash
chmod +x init-filebrowser.sh
```

## Docker Compose Setup

`docker-compose.yml`:

```yaml
services:
  filebrowser:
    image: your-filebrowser:latest
    ports:
      - "8080:8080"
    environment:
      - FILEBROWSER_ADMIN_USERNAME=admin
      - FILEBROWSER_ADMIN_PASSWORD=${ADMIN_PASSWORD}
    volumes:
      - ./config.yaml:/config.yaml
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 5s
      timeout: 3s
      retries: 10

  filebrowser-init:
    image: curlimages/curl:latest
    depends_on:
      filebrowser:
        condition: service_healthy
    environment:
      - FILEBROWSER_URL=http://filebrowser:8080
      - FILEBROWSER_ADMIN_USERNAME=admin
      - FILEBROWSER_ADMIN_PASSWORD=${ADMIN_PASSWORD}
    volumes:
      - ./init-filebrowser.sh:/scripts/init-filebrowser.sh:ro
    command: sh /scripts/init-filebrowser.sh
    restart: "no"
```

Start services:
```bash
export ADMIN_PASSWORD="your-secure-password"
docker-compose up -d
docker-compose logs filebrowser-init
```

## Kubernetes Setup

Create `filebrowser-init-job.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: filebrowser-secrets
type: Opaque
stringData:
  admin-username: admin
  admin-password: changeme-in-production

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: filebrowser-init-script
data:
  init.sh: |
    #!/bin/sh
    set -e

    until curl -f -s "${FILEBROWSER_URL}/health" > /dev/null 2>&1; do
      echo "Waiting for FileBrowser..."
      sleep 2
    done

    TOKEN=$(curl -s -X POST -H "X-Password: ${ADMIN_PASSWORD}" \
      "${FILEBROWSER_URL}/api/auth/login?username=${ADMIN_USERNAME}")

    echo "Initialization complete!"

---
apiVersion: batch/v1
kind: Job
metadata:
  name: filebrowser-init
spec:
  template:
    spec:
      restartPolicy: OnFailure
      containers:
      - name: init
        image: curlimages/curl:latest
        command: ["/bin/sh", "/scripts/init.sh"]
        env:
        - name: FILEBROWSER_URL
          value: "http://filebrowser.default.svc.cluster.local"
        - name: ADMIN_USERNAME
          valueFrom:
            secretKeyRef:
              name: filebrowser-secrets
              key: admin-username
        - name: ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: filebrowser-secrets
              key: admin-password
        volumeMounts:
        - name: init-script
          mountPath: /scripts
      volumes:
      - name: init-script
        configMap:
          name: filebrowser-init-script
          defaultMode: 0755
```

Deploy:
```bash
kubectl apply -f filebrowser-init-job.yaml
kubectl logs job/filebrowser-init
```

## Common API Operations

### Create User

```bash
curl -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "which": [],
    "data": {
      "username": "newuser",
      "password": "password123",
      "loginMethod": "password",
      "permissions": {
        "admin": false,
        "api": false,
        "share": true,
        "realtime": false
      },
      "scopes": [
        {
          "name": "files",
          "scope": "/",
          "permissions": {
            "view": true,
            "download": true,
            "modify": true,
            "create": true,
            "delete": true
          }
        }
      ]
    }
  }' \
  http://localhost:8080/api/users
```

### Create Share

```bash
curl -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/shared-folder",
    "source": "files",
    "expire": "2025-12-31T23:59:59Z",
    "password": "sharepass123"
  }' \
  http://localhost:8080/api/share
```

### List Users

```bash
curl -H "Authorization: Bearer ${TOKEN}" \
  http://localhost:8080/api/users
```

## Best Practices

### Security

- Never hardcode credentials - use environment variables or secrets
- Rotate admin password after first login
- Use HTTPS in production
- Limit network exposure

### Reliability

- Wait for health checks before init
- Make scripts idempotent (handle "already exists" errors)
- Set timeouts and retries
- Log all actions

### Maintainability

- Version control init scripts
- Document custom operations
- Use functions for modularity
- Test in staging first

## Troubleshooting

For common issues and solutions, see the {{< doclink path="access-control/troubleshooting/" text="Troubleshooting guide" />}}.

## Complete Examples

### Full Production Script

Create `init-filebrowser.sh` with comprehensive error handling:

```bash
#!/bin/bash
set -e

# Configuration from environment
FILEBROWSER_URL="${FILEBROWSER_URL:-http://localhost:8080}"
ADMIN_USERNAME="${FILEBROWSER_ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${FILEBROWSER_ADMIN_PASSWORD:-admin}"
MAX_RETRIES="${MAX_RETRIES:-30}"
RETRY_DELAY="${RETRY_DELAY:-2}"

echo "FileBrowser initialization script started"
echo "Target URL: ${FILEBROWSER_URL}"

# Function to wait for FileBrowser to be ready
wait_for_filebrowser() {
    local retries=0
    echo "Waiting for FileBrowser to be ready..."

    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -f -s "${FILEBROWSER_URL}/health" > /dev/null 2>&1; then
            echo "FileBrowser is ready!"
            return 0
        fi
        retries=$((retries + 1))
        echo "Attempt ${retries}/${MAX_RETRIES} - waiting ${RETRY_DELAY}s..."
        sleep $RETRY_DELAY
    done

    echo "ERROR: FileBrowser failed to start after ${MAX_RETRIES} attempts"
    return 1
}

# Function to get auth token
get_auth_token() {
    local username=$1
    local password=$2

    echo "Logging in as ${username}..."

    local response
    response=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "X-Password: ${password}" \
        "${FILEBROWSER_URL}/api/auth/login?username=${username}")

    local http_code=$(echo "$response" | tail -n1)
    local token=$(echo "$response" | head -n-1)

    if [ "$http_code" -eq 200 ] && [ -n "$token" ]; then
        echo "Successfully authenticated!"
        echo "$token"
        return 0
    else
        echo "ERROR: Authentication failed (HTTP ${http_code})"
        return 1
    fi
}

# Function to create user
create_user() {
    local token=$1
    local username=$2
    local password=$3
    local is_admin=${4:-false}

    echo "Creating user: ${username}..."

    local response
    response=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Authorization: Bearer ${token}" \
        -H "Content-Type: application/json" \
        -d "{
            \"which\": [],
            \"data\": {
                \"username\": \"${username}\",
                \"password\": \"${password}\",
                \"loginMethod\": \"password\",
                \"permissions\": {
                    \"admin\": ${is_admin},
                    \"api\": false,
                    \"share\": true,
                    \"realtime\": false
                },
                \"scopes\": [{
                    \"name\": \"files\",
                    \"scope\": \"/\",
                    \"permissions\": {
                        \"view\": true,
                        \"download\": true,
                        \"modify\": true,
                        \"create\": true,
                        \"delete\": true
                    }
                }]
            }
        }" \
        "${FILEBROWSER_URL}/api/users")

    local http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" -eq 201 ]; then
        echo "User ${username} created successfully"
        return 0
    elif [ "$http_code" -eq 409 ] || [ "$http_code" -eq 500 ]; then
        echo "User ${username} already exists or conflicts"
        return 0
    else
        echo "WARNING: Failed to create user ${username} (HTTP ${http_code})"
        echo "$response" | head -n-1
        return 1
    fi
}

# Main execution
main() {
    # Wait for FileBrowser to be ready
    if ! wait_for_filebrowser; then
        exit 1
    fi

    # Get authentication token
    TOKEN=$(get_auth_token "$ADMIN_USERNAME" "$ADMIN_PASSWORD")
    if [ -z "$TOKEN" ]; then
        echo "ERROR: Failed to get authentication token"
        exit 1
    fi

    echo ""
    echo "Running initialization tasks..."
    echo "Token: ${TOKEN:0:20}..."
    echo ""

    # Example: Create additional users
    create_user "$TOKEN" "demo" "demo123" false
    create_user "$TOKEN" "viewer" "viewer123" false

    # Note: Settings cannot be updated via API - they must be configured
    # through the config.yaml file or environment variables before startup

    echo ""
    echo "Initialization complete!"
}

# Run main function
main "$@"
```

Make the script executable:
```bash
chmod +x init-filebrowser.sh
```

### Production Docker Compose Setup

`docker-compose.yml`:
```yaml
version: '3.8'

services:
  filebrowser:
    image: your-filebrowser:latest
    ports:
      - "8080:8080"
    environment:
      - FILEBROWSER_ADMIN_USERNAME=admin
      - FILEBROWSER_ADMIN_PASSWORD=${ADMIN_PASSWORD:-changeme}
    volumes:
      - ./data:/data
      - ./database:/database
      - ./config.yaml:/config.yaml
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 5s
      timeout: 3s
      retries: 10
      start_period: 10s

  filebrowser-init:
    image: curlimages/curl:latest
    depends_on:
      filebrowser:
        condition: service_healthy
    environment:
      - FILEBROWSER_URL=http://filebrowser:8080
      - FILEBROWSER_ADMIN_USERNAME=admin
      - FILEBROWSER_ADMIN_PASSWORD=${ADMIN_PASSWORD:-changeme}
    volumes:
      - ./init-filebrowser.sh:/scripts/init-filebrowser.sh:ro
    command: sh /scripts/init-filebrowser.sh
    restart: "no"

volumes:
  data:
  database:
```

### Production Setup with Secrets

Create `.env` file (DO NOT commit to git):
```bash
ADMIN_PASSWORD=your-secure-password-here
```

Update `docker-compose.yml`:
```yaml
version: '3.8'

services:
  filebrowser:
    image: your-filebrowser:latest
    ports:
      - "8080:8080"
    env_file:
      - .env
    environment:
      - FILEBROWSER_ADMIN_USERNAME=admin
      - FILEBROWSER_ADMIN_PASSWORD=${ADMIN_PASSWORD}
    volumes:
      - data:/data
      - database:/database
      - ./config.yaml:/config.yaml
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 5s
      timeout: 3s
      retries: 10
      start_period: 10s
    restart: unless-stopped

  filebrowser-init:
    image: curlimages/curl:latest
    depends_on:
      filebrowser:
        condition: service_healthy
    env_file:
      - .env
    environment:
      - FILEBROWSER_URL=http://filebrowser:8080
      - FILEBROWSER_ADMIN_USERNAME=admin
      - FILEBROWSER_ADMIN_PASSWORD=${ADMIN_PASSWORD}
    volumes:
      - ./init-filebrowser.sh:/scripts/init-filebrowser.sh:ro
    command: sh /scripts/init-filebrowser.sh
    restart: "no"

volumes:
  data:
    driver: local
  database:
    driver: local
```

### Advanced Kubernetes Setup

Create `filebrowser-init-job.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: filebrowser-secrets
  namespace: default
type: Opaque
stringData:
  admin-username: admin
  admin-password: changeme-in-production

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: filebrowser-init-script
  namespace: default
data:
  init.sh: |
    #!/bin/sh
    set -e

    echo "Waiting for FileBrowser to be ready..."
    RETRIES=0
    MAX_RETRIES=30

    until curl -f -s "${FILEBROWSER_URL}/health" > /dev/null 2>&1; do
      RETRIES=$((RETRIES + 1))
      if [ $RETRIES -ge $MAX_RETRIES ]; then
        echo "ERROR: FileBrowser not ready after ${MAX_RETRIES} attempts"
        exit 1
      fi
      echo "Waiting... (${RETRIES}/${MAX_RETRIES})"
      sleep 2
    done

    echo "FileBrowser is ready!"
    echo "Getting auth token..."

    TOKEN=$(curl -s -X POST -H "X-Password: ${ADMIN_PASSWORD}" \
      "${FILEBROWSER_URL}/api/auth/login?username=${ADMIN_USERNAME}")

    if [ -z "$TOKEN" ]; then
      echo "ERROR: Failed to authenticate"
      exit 1
    fi

    echo "Authenticated successfully!"
    echo "Token: ${TOKEN:0:20}..."

    # Create demo user
    echo "Creating demo user..."
    HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null \
      -X POST \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d '{"which":[],"data":{"username":"demo","password":"demo123","loginMethod":"password","permissions":{"admin":false,"api":false,"share":true,"realtime":false},"scopes":[{"name":"files","scope":"/","permissions":{"view":true,"download":true,"modify":true,"create":true,"delete":true}}]}}' \
      "${FILEBROWSER_URL}/api/users")

    if [ "$HTTP_CODE" = "201" ]; then
      echo "Demo user created successfully"
    elif [ "$HTTP_CODE" = "409" ] || [ "$HTTP_CODE" = "500" ]; then
      echo "Demo user already exists"
    else
      echo "WARNING: Failed to create demo user (HTTP ${HTTP_CODE})"
    fi

    echo "Initialization complete!"

---
apiVersion: batch/v1
kind: Job
metadata:
  name: filebrowser-init
  namespace: default
spec:
  ttlSecondsAfterFinished: 300
  backoffLimit: 3
  template:
    spec:
      restartPolicy: OnFailure
      containers:
      - name: init
        image: curlimages/curl:latest
        command: ["/bin/sh", "/scripts/init.sh"]
        env:
        - name: FILEBROWSER_URL
          value: "http://filebrowser.default.svc.cluster.local"
        - name: ADMIN_USERNAME
          valueFrom:
            secretKeyRef:
              name: filebrowser-secrets
              key: admin-username
        - name: ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: filebrowser-secrets
              key: admin-password
        volumeMounts:
        - name: init-script
          mountPath: /scripts
      volumes:
      - name: init-script
        configMap:
          name: filebrowser-init-script
          defaultMode: 0755
```

### SystemD Integration

Create `/etc/systemd/system/filebrowser.service`:

```ini
[Unit]
Description=FileBrowser Service
After=network.target

[Service]
Type=simple
User=filebrowser
Group=filebrowser
Environment="FILEBROWSER_ADMIN_USERNAME=admin"
Environment="FILEBROWSER_ADMIN_PASSWORD=changeme"
EnvironmentFile=-/etc/filebrowser/env
WorkingDirectory=/opt/filebrowser
ExecStart=/opt/filebrowser/filebrowser
ExecStartPost=/bin/sleep 5
ExecStartPost=/opt/filebrowser/init-filebrowser.sh
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

Create `/etc/filebrowser/env`:
```bash
FILEBROWSER_ADMIN_USERNAME=admin
FILEBROWSER_ADMIN_PASSWORD=your-secure-password
FILEBROWSER_URL=http://localhost:8080
```

### Setup Commands

```bash
# Create user
sudo useradd -r -s /bin/false filebrowser

# Create directories
sudo mkdir -p /opt/filebrowser
sudo mkdir -p /etc/filebrowser
sudo mkdir -p /var/lib/filebrowser

# Copy files
sudo cp filebrowser /opt/filebrowser/
sudo cp init-filebrowser.sh /opt/filebrowser/
sudo cp config.yaml /opt/filebrowser/
sudo chmod +x /opt/filebrowser/filebrowser
sudo chmod +x /opt/filebrowser/init-filebrowser.sh

# Set permissions
sudo chown -R filebrowser:filebrowser /opt/filebrowser
sudo chown -R filebrowser:filebrowser /var/lib/filebrowser
sudo chmod 600 /etc/filebrowser/env

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable filebrowser
sudo systemctl start filebrowser

# Check status
sudo systemctl status filebrowser
sudo journalctl -u filebrowser -f
```

### Advanced API Operations

#### Create User with Full Permissions

```bash
curl -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "which": [],
    "data": {
      "username": "newuser",
      "password": "password123",
      "loginMethod": "password",
      "permissions": {
        "admin": false,
        "api": false,
        "share": true,
        "realtime": false
      },
      "scopes": [
        {
          "name": "files",
          "scope": "/",
          "permissions": {
            "view": true,
            "download": true,
            "modify": true,
            "create": true,
            "delete": true
          }
        }
      ]
    }
  }' \
  http://localhost:8080/api/users
```

#### Create Share

```bash
curl -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/shared-folder",
    "source": "files",
    "expire": "2025-12-31T23:59:59Z",
    "password": "sharepass123",
    "downloadsLimit": 10,
    "allowUpload": false,
    "disableFileViewer": false,
    "disableAnonymous": false,
    "maxBandwidth": 0,
    "title": "My Share",
    "description": "Shared files"
  }' \
  http://localhost:8080/api/share
```

#### Get Settings (Read-Only)

{{% alert context="info" %}}
Settings cannot be updated via API. They must be configured in `config.yaml` before starting FileBrowser.
{{% /alert %}}

```bash
# Get all settings
curl -H "Authorization: Bearer ${TOKEN}" \
  http://localhost:8080/api/settings

# Get specific property
curl -H "Authorization: Bearer ${TOKEN}" \
  "http://localhost:8080/api/settings?property=userDefaults"

# Available properties: userDefaults, frontend, auth, server, sources
```

#### Get Settings as YAML

```bash
# Get full configuration with comments
curl -H "Authorization: Bearer ${TOKEN}" \
  "http://localhost:8080/api/settings/config?full=true&comments=true"

# Get only non-default values
curl -H "Authorization: Bearer ${TOKEN}" \
  "http://localhost:8080/api/settings/config?full=false&comments=false"
```

### Troubleshooting

#### Init Script Fails to Connect

**Problem:** Script cannot reach FileBrowser service

**Solutions:**
```bash
# Check service is running
docker-compose ps
kubectl get pods

# Check health endpoint
curl http://localhost:8080/health

# Verify network connectivity
ping filebrowser
nslookup filebrowser.default.svc.cluster.local

# Check firewall rules
iptables -L
kubectl get networkpolicies
```

#### Authentication Fails

**Problem:** Cannot get token from login API

**Solutions:**
```bash
# Verify credentials are correct
echo "Username: ${FILEBROWSER_ADMIN_USERNAME}"
echo "Password: ${FILEBROWSER_ADMIN_PASSWORD}"

# Test login manually
curl -v -X POST -H "X-Password: admin" \
  "http://localhost:8080/api/auth/login?username=admin"

# Check logs for authentication errors
docker-compose logs filebrowser
kubectl logs deployment/filebrowser
```

#### Init Job Runs Multiple Times

**Problem:** Kubernetes Job retries unnecessarily

**Solutions:**
- Ensure script exits with code 0 on success
- Set `backoffLimit` in Job spec
- Make script idempotent (handle existing resources)
- Add `ttlSecondsAfterFinished` to clean up completed jobs

#### Permission Denied Errors

**Problem:** Script cannot execute or access files

**Solutions:**
```bash
# Make script executable
chmod +x init-filebrowser.sh

# Check file ownership
ls -la init-filebrowser.sh

# Verify volume mounts in Docker
docker-compose exec filebrowser-init ls -la /scripts

# Check SecurityContext in Kubernetes
kubectl describe pod <pod-name>
```

#### Cannot Update Settings

**Problem:** Trying to update settings via API

**Solution:**
Settings are read-only via the API. You must update the `config.yaml` file and restart FileBrowser for changes to take effect. This is by design to ensure configuration consistency.

### Configuration via config.yaml

Since settings cannot be updated via the API, you must configure FileBrowser through the `config.yaml` file. Here's an example:

```yaml
http:
  port: 8080
  baseURL: /

server:
  database:
    path: /database/filebrowser.sqlite
  logging:
    - output: stdout
      levels: "info|warning|error"
  sources:
    - name: files
      path: /data
      config:
        defaultEnabled: true
        defaultPermissions:
          view: true
          download: true
          modify: true
          create: true
          delete: true

auth:
  adminUsername: admin
  adminPassword: changeme
  key: random-secret-key
  tokenExpirationHours: 168
  methods:
    password:
      enabled: true
      signup: false
      enforcedOtp: false

userDefaults:
  account:
    permissions:
      admin: false
      api: false
      share: true
      realtime: false

frontend:
  name: "FileBrowser"
```

`http.port` and `http.baseURL` are the listen settings on v2.0.0 and later. `auth.methods.password` is the password method on v1.5.6-stable and on v2. Top-level `auth.adminUsername` and `auth.adminPassword` are what v2.0.x reads. On v2.1.x, `auth.methods.password.adminUsername` and `auth.methods.password.adminPassword` take priority when set. File-operation defaults belong under `server.sources[].config.defaultPermissions`, and global permissions belong under `userDefaults.account.permissions`.

## Next Steps

- {{< doclink path="reference/api/" text="API Reference" />}}
- {{< doclink path="configuration/users/" text="User configuration" />}}
- {{< doclink path="access-control/" text="Access control" />}}
