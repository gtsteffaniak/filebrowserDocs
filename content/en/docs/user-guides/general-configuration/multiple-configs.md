---
title: "Multiple Config Files"
description: "Use YAML anchoring for modular configuration"
icon: "inventory_2"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-03T16:30:00Z"
---

Use YAML anchoring with multi-file configuration for modular, reusable configurations.

## Overview

YAML anchoring allows you to:
- Maintain multiple configuration presets in separate files
- Switch between them instantly by changing one line
- Override specific fields when needed
- Keep your main config file clean and simple

## How It Works

{{% alert context="info" %}}
reference files must end with base file name like `*-config.yaml`. If your base file is `config.yaml`, your secondary files must be named `server-config.yaml` or `frontend-config.yaml`.
{{% /alert %}}

The main config file uses YAML merge keys (`<<:`) to include anchored configurations from separate modular files:

- `server-config.yaml` - Server settings (port, sources, logging)
- `auth-config.yaml` - Authentication configuration
- `integrations-config.yaml` - Media and office integration settings
- `frontend-config.yaml` - UI styling and themes
- `users-config.yaml` - User default settings

## Basic Concepts

### 1. Anchor Definition (`&anchor_name`)
Define a reusable configuration block with a name.

### 2. Alias Reference (`*anchor_name`)
Reference the entire anchor exactly as defined.

### 3. Merge Key (`<<: *anchor_name`)
Merge the anchor into the current context, allowing overrides.

## Quick Configuration Switching

**Example:** Switch from development to production by changing the anchor reference:

```yaml
# config.yaml - Switch environments by changing the anchor name

# For development:
server:
  <<: *server_dev

# For production (just change the anchor name):
server:
  <<: *server_production
```

## Example: Server Configurations

**File: `server-config.yaml`**
```yaml
# Development server - multiple sources, verbose logging
http_dev: &http_dev
  port: 8080
  baseURL: "/dev"

server_dev: &server_dev
  logging:
    - levels: "info|debug|warning|error"
  sources:
    - path: "/data/downloads"
      name: "downloads"
    - path: "/data/projects"
      name: "projects"

# Production server - restricted sources, minimal logging
http_production: &http_production
  port: 80
  baseURL: "/"

server_production: &server_production
  logging:
    - levels: "warning|error"
  sources:
    - path: "/data/public"
      name: "public"

# Minimal server - single source
http_minimal: &http_minimal
  port: 8080
  baseURL: "/"

server_minimal: &server_minimal
  sources:
    - path: "/data"
```

**File: `config.yaml`**
```yaml
# Simply change the anchor name to switch configurations!
# v2.0.0 and later: port and baseURL belong under http, not server.
http:
  <<: *http_dev                # Use development listen settings
  # <<: *http_production       # OR use production listen settings
  # <<: *http_minimal          # OR use minimal listen settings

server:
  <<: *server_dev              # Use development config
  # <<: *server_production     # OR use production config
  # <<: *server_minimal        # OR use minimal config
```

**To switch environments:** Just uncomment the line you want!

## Example: User Permission Presets

**File: `users-config.yaml`**
```yaml
# Admin user - global account permissions
user_admin: &user_admin
  listing:
    showHidden: true
  account:
    permissions:
      admin: true
      share: true
      api: true

# Regular user - standard account permissions
user_regular: &user_regular
  listing:
    showHidden: false
  account:
    permissions:
      admin: false
      share: true
      api: false

# Read-only user - no share or API
user_readonly: &user_readonly
  listing:
    showHidden: false
  account:
    lockPassword: true
    permissions:
      admin: false
      share: false
      api: false
```

File **view**, **download**, **modify**, **create**, and **delete** are not `userDefaults` keys on v2.0.0. Set those with `server.sources[].config.defaultPermissions`.

**File: `config.yaml`**
```yaml
# Switch default user permissions with one line!
userDefaults:
  <<: *user_regular            # Use regular user settings
  # <<: *user_admin            # OR use admin settings
  # <<: *user_readonly         # OR use readonly settings
```

## Extending Anchors

You can also extend an anchor and add/override specific fields:

**File: `server-config.yaml`**
```yaml
http_base: &http_base
  port: 80
  baseURL: "/"

server_base: &server_base
  sources:
    - path: "/data"

# Extend base and add search length
server_extended: &server_extended
  <<: *server_base             # Include everything from server_base
  minSearchLength: 10          # Add new field
```

**File: `config.yaml`**
```yaml
# Use extended config but override the port
http:
  <<: *http_base
  port: 8080                   # Override just this one field

server:
  <<: *server_extended
```

## Complete Multi-File Setup

**File: `config.yaml`** (Main config - minimal and clean!)
```yaml
server:
  <<: *server_dev

auth:
  <<: *auth_oidc

integrations:
  <<: *integrations_full

userDefaults:
  <<: *user_regular

frontend:
  <<: *frontend_multi_theme
```

**To deploy to production:** Change the anchor references:
```yaml
server:
  <<: *server_production       # Changed from *server_dev

auth:
  <<: *auth_oidc

integrations:
  <<: *integrations_no_office  # Changed from *integrations_full

userDefaults:
  <<: *user_readonly           # Changed from *user_regular

frontend:
  <<: *frontend_single_theme   # Changed from *frontend_multi_theme
```

## Benefits

1. **One-line switching** - Change entire configuration profiles instantly
2. **Modularity** - Each concern lives in its own file
3. **Reusability** - Create multiple presets and reuse across environments
4. **Maintainability** - Update one anchor to affect all configs using it
5. **Clean main config** - Main config stays simple and readable
6. **Testing** - Quickly test different configurations without code duplication

## Validation

All configurations must match the structure defined in your schema. The anchor system just provides a way to organize and reuse configuration blocks.

## Next Steps

- {{< doclink path="configuration/server/" text="Server configuration" />}}
- {{< doclink path="configuration/authentication/" text="Authentication setup" />}}
- {{< doclink path="reference/environment-variables/" text="Environment variables" />}}
