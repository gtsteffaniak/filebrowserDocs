---
title: "LDAP Authentication"
description: "Integrate with LDAP directories for centralized user authentication"
icon: "security"
date: "2026-02-27T21:50:04Z"
lastmod: "2026-10-03T15:10:00Z"
---

Authenticate users against LDAP directories like Active Directory, OpenLDAP, Authentik, and other LDAP-compliant systems.

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
    ldap:
      enabled: true
      server: "ldap://ldap.example.com:389"
      baseDN: "dc=example,dc=com"
      userDN: "cn=admin,dc=example,dc=com"
      userPassword: "admin-password"  # Use environment variable
```

## Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `enabled` | `false` | Enable LDAP authentication |
| `server` | *required* | LDAP server URL (ldap://host:389 or ldaps://host:636) |
| `baseDN` | *required* | LDAP search base DN (e.g., dc=example,dc=com) |
| `userDN` | *required* | Bind DN for service account |
| `userPassword` | *required* | Password for service account |
| `userFilter` | `(&(cn=%s)(objectClass=user))` | Search filter for finding users (`%s` = login name) |
| `userIdentifier` | `""` | LDAP attribute to use as username (e.g., mail, sAMAccountName); empty uses login name |
| `groupsClaim` | `memberOf` | **v2.0.3+ (beta).** LDAP attribute for group membership. When omitted, FileBrowser uses `memberOf`. **v1.5.x (stable)** does not fill in a default. |
| `adminGroup` | `""` | LDAP group DN or CN that grants admin privileges |
| `userGroups` | `[]` | List of allowed groups (empty = allow all) |
| `disableVerifyTLS` | `false` | Disable TLS certificate verification (testing only!) |
| `logoutRedirectUrl` | `""` | URL to redirect after logout |

## How It Works

1. User enters username and password on login page
2. FileBrowser searches LDAP directory for the user using service account
3. FileBrowser attempts to bind (authenticate) as the user with provided password
4. On success, FileBrowser extracts groups from LDAP attributes
5. User is created automatically if needed and logged in with a FileBrowser session token

{{% alert context="warning" %}}
**Deprecated:** `createUser` in this block is deprecated — omit it; LDAP users are provisioned automatically on first successful login.
{{% /alert %}}

## Server URL Format

### Standard LDAP (Unencrypted)

```yaml
server: "ldap://ldap.example.com:389"
```

Default port: `389`

### LDAPS (TLS/SSL Encrypted)

```yaml
server: "ldaps://ldap.example.com:636"
```

Default port: `636`

{{% alert context="warning" %}}
**Production Recommendation**: Always use `ldaps://` (LDAP over TLS) in production to encrypt authentication credentials in transit.
{{% /alert %}}

### Custom Ports

```yaml
server: "ldap://ldap.example.com:1389"
server: "ldaps://ldap.example.com:1636"
```

## User Filter Examples

The `userFilter` determines how FileBrowser searches for users. Use `%s` as a placeholder for the username.

### Active Directory

```yaml
auth:
  methods:
    ldap:
      userFilter: "(sAMAccountName=%s)"
      # Or for email-based login:
      # userFilter: "(userPrincipalName=%s)"
```

### OpenLDAP / Standard LDAP

```yaml
auth:
  methods:
    ldap:
      userFilter: "(&(uid=%s)(objectClass=inetOrgPerson))"
```

### Authentik

```yaml
auth:
  methods:
    ldap:
      userFilter: "(&(cn=%s)(objectClass=user))"
```

### Email-Based Login

```yaml
auth:
  methods:
    ldap:
      userFilter: "(mail=%s)"
```

### Multiple Criteria

Require user to be in a specific OU:

```yaml
auth:
  methods:
    ldap:
      userFilter: "(&(cn=%s)(objectClass=user)(ou=employees))"
```

## User Identifier Mapping

By default, FileBrowser uses the login username. You can map a different LDAP attribute to be the FileBrowser username:

### Use Email as Username

```yaml
auth:
  methods:
    ldap:
      enabled: true
      userIdentifier: "mail"
      # User logs in with: john.doe
      # LDAP search finds: mail=john.doe@example.com
      # FileBrowser creates user: john.doe@example.com
```

### Active Directory - Use sAMAccountName

```yaml
auth:
  methods:
    ldap:
      enabled: true
      userIdentifier: "sAMAccountName"
      # User logs in with: john.doe
      # FileBrowser uses sAMAccountName attribute as username
```

{{% alert context="info" %}}
**Note**: The `userIdentifier` attribute must be included in the LDAP search attributes. FileBrowser automatically adds it to the search request.
{{% /alert %}}

## Group-Based Authorization

### Admin Group

Automatically grant admin privileges to users in a specific LDAP group:

```yaml
auth:
  methods:
    ldap:
      enabled: true
      adminGroup: "cn=Admins,ou=groups,dc=example,dc=com"
      # Or just the CN value:
      # adminGroup: "Admins"
```

FileBrowser matches both:
- Full DN: `cn=Admins,ou=groups,dc=example,dc=com`
- CN value: `Admins`

Matching is **case-insensitive**. When both values are full DNs, the complete DN must match (same CN under a different OU does not count). CN-only matching applies only when one side is a CN without a DN.

### Restrict to Specific Groups

Only allow users in specific LDAP groups:

```yaml
auth:
  methods:
    ldap:
      enabled: true
      userGroups:
        - "cn=Employees,ou=groups,dc=example,dc=com"
        - "cn=Contractors,ou=groups,dc=example,dc=com"
        - "IT Department"  # Can use CN value
```

Users not in these groups will be denied access even with valid LDAP credentials.

Matching uses the same rules as `adminGroup`: full DN or CN-only, **case-insensitive**. For example, config `IT Department` matches LDAP `cn=IT Department,ou=groups,dc=example,dc=com`.

### Access-control groups and sources

On successful LDAP login, groups from `groupsClaim` (default `memberOf`) are synced into FileBrowser’s access-control GroupMap (write-through to the database) so {{< doclink path="access-control/rules" text="group allow/deny rules" />}} apply with {{< doclink path="configuration/sources#denybydefault" text="denyByDefault" />}}. LDAP users are auto-created on first login; source access follows the callout at the top of this page.

### Custom Groups Attribute

Change which LDAP attribute contains groups (default: `memberOf`):

```yaml
auth:
  methods:
    ldap:
      enabled: true
      groupsClaim: "groupMembership"
```

## Provider Examples

<div class="pattern-card">

### Authentik

```yaml
auth:
  methods:
    ldap:
      enabled: true
      server: "ldap://authentik.example.com:389"
      baseDN: "dc=ldap,dc=goauthentik,dc=io"
      userDN: "cn=ldapservice,ou=users,dc=ldap,dc=goauthentik,dc=io"
      userPassword: "service-account-password"
      userFilter: "(&(cn=%s)(objectClass=user))"
      adminGroup: "authentik Admins"
```

</div>

<div class="pattern-card">

### Active Directory

```yaml
auth:
  methods:
    ldap:
      enabled: true
      server: "ldaps://dc.corp.example.com:636"
      baseDN: "dc=corp,dc=example,dc=com"
      userDN: "cn=filebrowser,ou=service-accounts,dc=corp,dc=example,dc=com"
      userPassword: "service-password"
      userFilter: "(sAMAccountName=%s)"
      userIdentifier: "sAMAccountName"
      groupsClaim: "memberOf"
      adminGroup: "Domain Admins"
```

</div>

<div class="pattern-card">

### OpenLDAP

```yaml
auth:
  methods:
    ldap:
      enabled: true
      server: "ldap://openldap.example.com:389"
      baseDN: "ou=users,dc=example,dc=com"
      userDN: "cn=readonly,dc=example,dc=com"
      userPassword: "readonly-password"
      userFilter: "(&(uid=%s)(objectClass=inetOrgPerson))"
```

</div>

<div class="pattern-card">

### FreeIPA

```yaml
auth:
  methods:
    ldap:
      enabled: true
      server: "ldaps://ipa.example.com:636"
      baseDN: "cn=users,cn=accounts,dc=example,dc=com"
      userDN: "uid=admin,cn=users,cn=accounts,dc=example,dc=com"
      userPassword: "admin-password"
      userFilter: "(uid=%s)"
      groupsClaim: "memberOf"
```

</div>

## TLS Configuration

### Disable TLS Verification (Testing Only)

{{% alert context="warning" %}}
**Security Warning**: Only use for testing with self-signed certificates. Never use in production!
{{% /alert %}}

```yaml
auth:
  methods:
    ldap:
      enabled: true
      server: "ldaps://ldap.example.com:636"
      disableVerifyTLS: true  # Disables certificate verification
```

### Production TLS Setup

For production with self-signed certificates, add the CA certificate to your system's trust store instead of disabling verification.

## Environment Variables Best Practice

Store sensitive credentials in environment variables:

```bash
export FILEBROWSER_LDAP_USER_PASSWORD="your-service-account-password"
```

Reference in config:
```yaml
auth:
  methods:
    ldap:
      enabled: true
      userPassword: "${FILEBROWSER_LDAP_USER_PASSWORD}"
```

## Advanced Configuration

### Multiple OUs (Organizational Units)

Search across multiple OUs by adjusting the baseDN:

```yaml
auth:
  methods:
    ldap:
      baseDN: "dc=example,dc=com"  # Searches all OUs under domain
      userFilter: "(&(cn=%s)(objectClass=user))"
```

Or search specific OU:

```yaml
auth:
  methods:
    ldap:
      baseDN: "ou=employees,dc=example,dc=com"  # Only employees OU
      userFilter: "(cn=%s)"
```

### Nested Group Search

Active Directory supports nested groups in `memberOf`. FileBrowser uses the `memberOf` values directly, so nested group membership should work automatically in most cases.

## Troubleshooting

### Connection Issues

**Problem**: `LDAP connection failed`

**Solutions:**
- Verify server URL and port (389 for ldap://, 636 for ldaps://)
- Check firewall rules allow connection to LDAP server
- For ldaps://, ensure TLS certificate is valid or use `disableVerifyTLS: true` for testing
- Test connection with `ldapsearch`:
  ```bash
  ldapsearch -x -H ldap://ldap.example.com:389 -D "cn=admin,dc=example,dc=com" -W -b "dc=example,dc=com"
  ```

### "LDAP bind (service) failed"

**Cause**: Service account credentials are incorrect.

**Solutions:**
- Verify `userDN` and `userPassword` are correct
- Check service account has read permissions in LDAP
- Ensure service account is not locked or expired
- Test bind manually with ldapsearch

### "user not found"

**Cause**: User search returned no results.

**Solutions:**
- Verify `baseDN` includes the user's location
- Check `userFilter` matches your LDAP schema
- Test search with ldapsearch:
  ```bash
  ldapsearch -x -H ldap://ldap.example.com:389 \
    -D "cn=admin,dc=example,dc=com" -W \
    -b "dc=example,dc=com" \
    "(cn=testuser)"
  ```
- Try different user filter patterns (see examples above)

### "LDAP bind (user) failed"

**Cause**: User password is incorrect.

**Solution:** User entered wrong password. This is the expected error for incorrect credentials.

### Multiple Entries Error

**Problem**: `multiple entries for user: username`

**Cause**: User search returns multiple LDAP entries.

**Solutions:**
- Make `userFilter` more specific to return only one entry
- Add objectClass filter:
  ```yaml
  userFilter: "(&(cn=%s)(objectClass=user))"
  ```
- Narrow baseDN to specific OU:
  ```yaml
  baseDN: "ou=users,dc=example,dc=com"
  ```

### Group Authorization Not Working

**Problem**: Users not getting admin rights or being blocked by `userGroups`

**Solutions:**
- Check `groupsClaim` matches your LDAP attribute (default: `memberOf`)
- Verify groups in LDAP entry:
  ```bash
  ldapsearch -x -H ldap://ldap.example.com:389 \
    -D "cn=admin,dc=example,dc=com" -W \
    -b "dc=example,dc=com" \
    "(cn=testuser)" memberOf
  ```
- Use full DN or just CN value for `adminGroup` and `userGroups`
- Check FileBrowser logs for group matching details

### User Creation Fails

Users are now automatically created on first login.

## Security Best Practices

{{% alert context="warning" %}}
**Security Checklist**:
- ✅ Use `ldaps://` (LDAP over TLS) in production
- ✅ Use dedicated service account with read-only permissions
- ✅ Store credentials in environment variables
- ✅ Configure `userGroups` to restrict access
- ✅ Use specific `userFilter` to prevent ambiguous matches
- ✅ Monitor failed login attempts
- ✅ Regularly rotate service account password
{{% /alert %}}

### Service Account Permissions

The LDAP service account needs:
- ✅ Read access to user objects in `baseDN`
- ✅ Read access to group membership attributes
- ❌ Does NOT need write access
- ❌ Does NOT need admin privileges

## Testing Your Setup

### 1. Test LDAP Connection

```bash
# Test basic connection
ldapsearch -x -H ldap://ldap.example.com:389 -D "cn=admin,dc=example,dc=com" -W

# Test user search
ldapsearch -x -H ldap://ldap.example.com:389 \
  -D "cn=admin,dc=example,dc=com" -W \
  -b "dc=example,dc=com" \
  "(cn=testuser)" memberOf
```

### 2. Check FileBrowser Startup

Look for in logs:
```
LDAP Auth configured successfully
```

### 3. Test Login

- Go to FileBrowser login page
- Enter LDAP username and password
- Check logs for detailed authentication flow

### 4. Verify User Creation

Users are automatically created on first login. Check User Management to verify.

## Migration from Password Auth

You can run LDAP alongside password authentication:

```yaml
auth:
  methods:
    password:
      enabled: true  # Keep for existing users
    ldap:
      enabled: true  # Add LDAP
```

Users can choose their auth method:
- Existing password users continue with username/password
- New LDAP users authenticate via LDAP and are auto-created
- Admin can migrate users by changing their `loginMethod`

## Performance Considerations

- LDAP authentication requires network round-trip to LDAP server
- Consider using connection pooling (handled automatically)
- For large directories, ensure efficient `userFilter` and narrow `baseDN`
- Session tokens avoid repeated LDAP lookups after initial login

## Next Steps

- {{< doclink path="configuration/authentication/oidc/" text="OIDC authentication" />}}
- {{< doclink path="configuration/authentication/jwt/" text="JWT authentication" />}}
- {{< doclink path="configuration/authentication/password/" text="Password authentication" />}}
- {{< doclink path="access-control/rules" text="Configure access rules" />}}
