---
title: "Password Authentication"
description: "Configure password authentication"
icon: "key"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-05T13:30:00Z"
---

Password authentication uses the typical `username` and `password` to login a user. Password authentication also supports **Signup**, **recaptcha**, and **Two-Factor Authentication** features.

{{% alert context="warning" %}}
**Configure source access for new users**

Authentication alone does not grant file access. When a user is created (password signup, admin/CLI create, or first login via OIDC / LDAP / JWT / proxy), they only receive sources where `config.defaultEnabled: true`.

- Default is **`false`** — without this, new users may log in but see **no files**
- **One source** in config: FileBrowser auto-enables `defaultEnabled` for that source
- **Multiple sources**: set `defaultEnabled: true` on each source new users should access

See {{< doclink path="configuration/sources#defaultenabled" text="Sources: defaultEnabled" />}} for full details and examples.
{{% /alert %}}

## Basic Configuration

```yaml
auth:
  methods:
    password:
      enabled: true
      minLength: 5
      signup: false
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `enabled` | `true` | Enable password authentication |
| `adminUsername` | `admin` | Built-in password admin username |
| `adminPassword` | — | **v2.x beta:** random speakable password (`word-xxxxx-xx`) logged once when unset or `admin`; bootstrap admin gets `requirePasswordChange`. Any other value is used as-is |
| `minLength` | `5` | Minimum password length |
| `signup` | `false` | Allow user self-registration |
| `enforcedOtp` | `false` | Require all password users to enable Two-Factor Authentication |

## With User Signup

```yaml
auth:
  methods:
    password:
      enabled: true
      minLength: 12
      signup: true
```

## Set Admin Password

If password authentication is enabled, FileBrowser creates a built-in admin password on first startup. The username defaults to `admin`.

If `adminPassword` is unset or left as `admin` (including when `auth.methods.password.adminPassword` is unset or `admin`), a random **speakable** bootstrap password is generated, logged once, and the admin account is flagged **`requirePasswordChange`** so login is blocked until a new password is set. The generated form is `word-xxxxx-xx` (a random word from a fixed list, a 5-character code, and a 2-character code) instead of a long hex string. **v2.0+** uses this format.

### Best practice - use an environment variable:

```bash
export FILEBROWSER_ADMIN_PASSWORD="secure-password"
```

### Config-based admin password

{{% alert context="warning" %}}
If `adminPassword` is set in config, it is reset on every startup to that value. Prefer `FILEBROWSER_ADMIN_PASSWORD` for production.
{{% /alert %}}

```yaml
auth:
  methods:
    password:
      enabled: true
      adminUsername: admin
      adminPassword: "choose-a-password"
```

## Require password change (v2.0.0)

Password-based users can be required to set a new password before any other login succeeds:

- **User defaults:** `userDefaults.account.requirePasswordChange` (also configurable under **Settings → User management → User defaults**).
- **Per user:** admins can toggle **Require password change** when editing a user.
- **Bootstrap admin:** when the initial admin password is **generated** (unset/`admin` config as above), `requirePasswordChange` is set automatically.

When `requirePasswordChange` is true, normal login returns a change-password flow in the UI. The API endpoint is `POST /api/auth/password/change-required` (current password in the `X-Password` header; new password in the JSON body). After a successful change, the flag is cleared.

## Two-Factor Authentication (2FA)

Two-Factor Authentication (2FA) adds an extra layer of security to password-based logins by requiring a time-based one-time password (TOTP) in addition to the username and password.

{{% alert context="info" %}}
Two-Factor Authentication is **only available for password authentication users**. It does not apply to proxy or OIDC authentication methods.
{{% /alert %}}

### Benefits of Two-Factor Authentication

- **Enhanced Security**: Even if a password is compromised, attackers cannot access the account without the 6-digit code
- **Protection Against Phishing**: 2FA codes are time-limited and cannot be reused
- **Compliance**: Meets security requirements for many organizations and regulations
- **User Control**: Users can enable or disable 2FA from their profile settings unless `enforcedOtp` is set under `auth.methods.password`.

### How It Works

1. **Setup**: User enables 2FA in their profile settings
2. **QR Code**: A QR code is displayed that can be scanned with authenticator apps (Google Authenticator, Authy, Microsoft Authenticator, etc.)
3. **Verification**: User enters a 6-digit code from their authenticator app to complete setup
4. **Login**: After entering username and password, users with 2FA enabled must enter the current 6-digit code from their authenticator app
5. **Time-Based**: Codes refresh every 30 seconds and are valid for 2 minutes

### Configuration

#### Generate TOTP Secret

Before enabling 2FA, you must generate a secure encryption key for TOTP secrets. This key encrypts user TOTP secrets in the database.

Generate a secure random key using OpenSSL:

```bash
openssl rand -base64 32
```

Add the generated key to your configuration:


```yaml
auth:
  totpSecret: "your-generated-key-here"  # Use environment variable for security
```

{{% alert context="warning" %}}
**Security Best Practice**: Store the `totpSecret` in an environment variable rather than in the config file:

```bash
export FILEBROWSER_TOTP_SECRET="your-generated-key-here"
```
{{% /alert %}}


{{% alert context="warning" %}}
**Important**: Changing the `totpSecret` after users have enabled 2FA will make all active users with 2FA enabled unable to sign in. An admin user would need to reset/disable user's 2FA in order for users to login -- or use CLI to reset a user's password which also resets 2FA. 

- (preferred) Admin: User Management → Edit user → Disable 2FA
- CLI: perform password reset on a user {{< doclink path="reference/cli/#password-reset" text="CLI password reset" />}}

{{% /alert %}}

#### Enforce Two-Factor Authentication

Require all password users to enable 2FA:

```yaml
auth:
  methods:
    password:
      enabled: true
      enforcedOtp: true  # All password users must enable 2FA
```

When `enforcedOtp: true`:
- New password users must set up 2FA before they can log in
- Existing password users without 2FA cannot log in until they enable it
- Users are prompted to set up 2FA on their first login after enforcement is enabled

### User Management

#### Enable 2FA (User)

Users can enable 2FA from their profile settings:

1. Go to **Profile** → **Security**
2. Click **Enable 2FA** or **Generate New OTP**
3. Scan the QR code with an authenticator app
4. Enter the 6-digit code to verify and complete setup

#### Admin Management

Administrators can manage 2FA for any user:

1. Go to **User Management**
2. Edit the user
3. In the user edit dialog, toggle **2FA** on or off
4. Click **Generate New OTP** to reset a user's 2FA (useful if they lost their device)

#### Reset 2FA via CLI

If a user loses access to their authenticator device, administrators can reset their password and 2FA using the CLI. See {{< doclink path="reference/cli/#password-reset" text="CLI password reset" />}} for details.

{{% alert context="warning" %}}
Resetting a user's password via CLI also clears their Two-Factor Authentication. The user will need to set up 2FA again after logging in with the new password.
{{% /alert %}}


## Next Steps

- {{< doclink path="configuration/authentication/oidc/" text="OIDC authentication" />}}
- {{< doclink path="configuration/users/" text="Manage users" />}}
- {{< doclink path="reference/cli/" text="CLI commands" />}} for user management

