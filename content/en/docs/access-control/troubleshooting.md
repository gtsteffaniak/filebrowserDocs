---
title: "Troubleshooting"
description: "Common issues and solutions for access control"
icon: "bug_report"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-01-30T13:20:14Z"
order: 3
---

Common issues and solutions for access control.

## Access Rules

### Users Can't Access Files

Check:
1. User has source in scopes
2. No deny rules blocking access
3. denyByDefault is not set (or allow rules exist)
4. Rule path matches the directory (rule paths are case-insensitive; see {{< doclink path="access-control/rules/#path-matching" text="Path matching" />}})

### Rules Not Taking Effect

- Refresh browser/clear cache
- Check rule specificity
- Verify user is in expected groups
- Review rule inheritance chain
