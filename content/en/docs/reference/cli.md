---
title: "CLI Commands"
description: "Command-line interface reference"
icon: "terminal"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-03T14:50:00Z"
---

{{% alert context="warning" %}}
**v2.0.0 behavior change**

Starting in **v2.0.0**, user CLI commands changed. Use `user set <username> --password [value]` instead of `set -u username,password`. Use `user promote <username>` to grant admin without changing the password. The old `set -u` form still works but prints a deprecation warning on stderr. Docker examples should mount a **data directory** (not a single `database.db` file) — see {{< doclink path="getting-started/docker/" text="Docker setup" />}}.
{{% /alert %}}

FileBrowser provides a minimal CLI for setup and user management.

## CLI migration (v2.0.0+)

```bash
# User create
set -u john,pass -c cfg          →  user set john --password pass -c cfg

# User password reset
set -u john,newpass -c cfg       →  user set john --password newpass -c cfg
                                   # or: echo 'newpass' | user set john --password -c cfg

# Create admin
set -u admin,pass -a -c cfg      →  user set admin --password pass -a -c cfg

# Promote to admin (preferred — no password change)
set -u joe,newpass -a -c cfg     →  user promote joe -c cfg

# Access rules — NO CHANGE
set rule -s access -p / -r user -v admin --allow -c cfg

# Server / setup / version — NO CHANGE
filebrowser -c cfg
filebrowser setup
filebrowser version
```

## Available Commands

### Start Server

Default command - runs the server:

```bash
./filebrowser
```

With custom config:

```bash
./filebrowser -c /path/to/config.yaml
```

### Setup

Create new configuration file:

```bash
./filebrowser setup
```

Generates `config.yaml` with defaults.

### Version

Check version information:

```bash
./filebrowser version
```

### User Management

Create or update a password-authenticated user:

```bash
./filebrowser user set username --password secret -c config.yaml
```

Prompt for password on a TTY (omit the value):

```bash
./filebrowser user set username --password -c config.yaml
```

Read password from stdin (scripts):

```bash
echo 'secret' | ./filebrowser user set username --password -c config.yaml
```

Create as admin:

```bash
./filebrowser user set username --password secret -a -c config.yaml
```

Promote an existing user to admin without changing their password:

```bash
./filebrowser user promote username -c config.yaml
```

{{% alert context="info" %}}
`user set … -a` still resets the password and clears 2FA (same as the old `set -u … -a`). Prefer `user promote` when you only need to grant admin.
{{% /alert %}}

**Deprecated** (still works with stderr warning):

```bash
./filebrowser set -u username,password [-a] [-c config.yaml]
```

### Access Rule Management

Create or update access rules via CLI:

**Allow user access:**
```bash
./filebrowser set rule -s access -p /secret -r user -v username --allow -c config.yaml
```

**Deny user access:**
```bash
./filebrowser set rule -s access -p /secret -r user -v username -c config.yaml
```

**Allow group access:**
```bash
./filebrowser set rule -s access -p /departments/sales -r group -v sales --allow -c config.yaml
```

**Deny all users:**
```bash
./filebrowser set rule -s access -p /restricted -r all -c config.yaml
```

**Rule command options:**
- `-s` / `--source` - Source name from config (not the filesystem path)
- `-p` / `--path` - Index path (e.g. `/secret`)
- `-r` / `--role` - Rule category: `user`, `group`, or `all` (for deny only)
- `-v` / `--value` - Username or groupname (not required if `-r` is `all`)
- `--allow` - Allow access (default: false, which means deny)
- `-c` / `--config` - Config file path

## Important Notes

**Always shut down the server before CLI operations**

Only one process can access the database at once.

```bash
# Stop service first
systemctl stop filebrowser

# Run CLI command
./filebrowser user set admin --password newpass -c config.yaml

# Start service
systemctl start filebrowser
```

## Docker Usage

### Stop Running Container

```bash
docker compose down
```

### Run CLI in Container

```bash
docker run -it \
  -v $(pwd)/database.db:/home/filebrowser/database.db \
  -v $(pwd)/config.yaml:/home/filebrowser/config.yaml \
  --entrypoint="" \
  ghcr.io/gtsteffaniak/filebrowser:stable sh
```

Inside container:
```bash
./filebrowser user set admin --password newpass -c config.yaml
exit
```

### One-Line Docker Commands

**Password reset**:
```bash
docker run -it --rm \
  -v $(pwd)/database.db:/home/filebrowser/database.db \
  -v $(pwd)/config.yaml:/home/filebrowser/config.yaml \
  --entrypoint="" \
  ghcr.io/gtsteffaniak/filebrowser:stable \
  ./filebrowser user set admin --password newpassword -c config.yaml
```

**Create user**:
```bash
docker run -it --rm \
  -v $(pwd)/database.db:/home/filebrowser/database.db \
  -v $(pwd)/config.yaml:/home/filebrowser/config.yaml \
  --entrypoint="" \
  ghcr.io/gtsteffaniak/filebrowser:stable \
  ./filebrowser user set newuser --password password -c config.yaml
```

## Common Operations

### Password Reset

{{% alert context="warning" %}}
**Important**: Resetting a user's password via CLI also clears their Two-Factor Authentication (2FA). The user will need to set up 2FA again after logging in with the new password.
{{% /alert %}}

```bash
./filebrowser user set admin --password newpassword -c config.yaml
# or: echo 'newpassword' | ./filebrowser user set admin --password -c config.yaml
```

This is useful if:
- A user forgot their password
- A user lost access to their 2FA device and needs both password and 2FA reset
- You need to reset an account for security reasons

### Create New User

```bash
./filebrowser user set joe --password password -c config.yaml
```

{{% alert context="info" %}}
Always include config path, so user defaults are applied.
{{% /alert %}}

### Promote User to Admin

```bash
./filebrowser user promote joe -c config.yaml
```

To promote and reset password at the same time:

```bash
./filebrowser user set joe --password newpassword -a -c config.yaml
```

### Initial Admin Setup

After first install:

```bash
# Option 1: Use CLI
./filebrowser user set admin --password secure-password -a -c config.yaml

# Option 2: Use environment variable
export FILEBROWSER_ADMIN_PASSWORD="secure-password"
./filebrowser -c config.yaml
```

## Command Reference

### filebrowser

Start server with optional config.

**Syntax**:
```bash
./filebrowser [-c config.yaml]
```

**Options**:
- `-c` - Config file path (default: `config.yaml`)

**Examples**:
```bash
./filebrowser
./filebrowser -c /etc/filebrowser/config.yaml
```

### filebrowser setup

Create default configuration file.

**Syntax**:
```bash
./filebrowser setup
```

**Output**: Creates `config.yaml` in current directory.

### filebrowser version

Display version information.

**Syntax**:
```bash
./filebrowser version
```

**Output** (v1.5.x stable and v2.x beta):
```
FileBrowser Quantum - A modern web-based file manager
	Version 	 : v1.5.6-stable
	Commit 		 : <commit sha>
	Release Info 	 : https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.6-stable
```

### filebrowser user set

Create or update a password-authenticated user.

**Syntax**:
```bash
./filebrowser user set <username> --password [value] [-a] [-c config.yaml]
```

**Options**:
- `--password` - Password (inline value, TTY prompt when omitted, or read from stdin when piped)
- `-a` / `--admin` - Grant admin permissions
- `-c` / `--config` - Config file path
- `--no-input` - Disable interactive prompts (fail if password value is required)

**Examples**:
```bash
# Create user
./filebrowser user set john --password pass123 -c config.yaml

# Create admin
./filebrowser user set admin --password secure-pass -a -c config.yaml

# Reset password (piped)
echo 'newpass' | ./filebrowser user set john --password -c config.yaml
```

### filebrowser user promote

Grant admin permissions without changing the password.

**Syntax**:
```bash
./filebrowser user promote <username> [-c config.yaml]
```

**Example**:
```bash
./filebrowser user promote joe -c config.yaml
```

### filebrowser set (deprecated user syntax)

**Deprecated user syntax** (prints stderr warning):
```bash
./filebrowser set -u username,password [-a] [-c config.yaml]
```

Use `user set` instead. This form remains available in v2.0.0 for compatibility.

### filebrowser set rule
**Syntax**:
```bash
./filebrowser set rule -s <sourceName> -p <indexPath> -r <user|group|all> [-v <value>] [--allow] [-c config.yaml]
```

**Access Rule Options**:
- `-s` / `--source` - Source name from config (required)
- `-p` / `--path` - Index path (required)
- `-r` / `--role` - Rule category: `user`, `group`, or `all` (for deny only) (required)
- `-v` / `--value` - Username or groupname (required when `-r` is `user` or `group`)
- `--allow` - Allow access (default: false, which means deny)
- `-c` / `--config` - Config file path

**Access Rule Examples**:
```bash
# Allow user access to a path
./filebrowser set rule -s access -p /documents -r user -v john --allow -c config.yaml

# Deny group access
./filebrowser set rule -s access -p /restricted -r group -v guests -c config.yaml

# Deny all users
./filebrowser set rule -s access -p /private -r all -c config.yaml
```

## Troubleshooting

For common issues and solutions, see the {{< doclink path="access-control/troubleshooting/" text="Troubleshooting guide" />}}.

## Next Steps

- {{< doclink path="reference/environment-variables/" text="Environment variables" />}}
- {{< doclink path="reference/api/" text="API documentation" />}}
- {{< doclink path="reference/fullconfig/" text="Configuration reference" />}}

