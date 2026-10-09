---
title: "Debug Logging"
description: "Enable detailed logging for troubleshooting"
icon: "bug_report"
date: "2025-10-09T00:23:04Z"
lastmod: "2026-10-03T16:40:00Z"
---

Debug logging must be configured to see more detailed "debug" level logs.

{{% alert context="info" %}}
By default, FileBrowser logs all **INFO**, **ERROR**, **WARNING**, and **API** events to stdout with colors enabled. No configuration is required for basic logging.
{{% /alert %}}

## Enable Debug Logging

Simply add `debug` to the levels in your `config.yaml`:

```yaml
server:
  logging:
    - output: "stdout"
      levels: "info|warning|error|debug"  # Add debug to see detailed logs
```

## Log Levels

| Level | Description |
|-------|-------------|
| `error` | Only error messages |
| `warning` | Warnings and errors |
| `info` | General information (default) |
| `debug` | Detailed debugging information including file/line numbers |
| `api` | API request/response logs (via `apiLevels`) |

{{% alert context="info" %}}
Log levels can be specified using multiple separators: `"info|warning|error"` or `"info warning error"` or `"info,warning,error"`. Use whichever you prefer.
{{% /alert %}}

{{% alert context="warning" %}}
When debug logging is enabled, all log types will include the exact file and line number that caused the log event, not just debug logs.
{{% /alert %}}

## What Debug Logging Shows

When debug logging is enabled, you'll see detailed information about:

- HTTP request/response details
- File operations and permissions
- Authentication attempts
- Database queries
- Share creation and access
- Integration operations (OnlyOffice, FFmpeg)
- Exact file and line numbers for all log events

## Logging Configuration Examples

### Default Behavior (No Config Required)

If you don't configure logging, you get this by default:

```yaml
http:
  port: 8080
server:
  # No logging config = default stdout with colors and API logs
  sources:
    - path: "/data"
      name: "files"
```

This gives you INFO, WARNING, ERROR, and API logs to stdout with colors.

### Enable Debug Logging

```yaml
http:
  port: 8080
server:
  logging:
    - output: "stdout"
      levels: "info|warning|error|debug"
  sources:
    - path: "/data"
      name: "files"
```

### File Output

Log to a file:

```yaml
http:
  port: 8080
server:
  logging:
    - levels: "info|debug|warning|error"
      output: "/var/log/filebrowser/debug.log"
      noColors: true  # Disable colors for file output
  sources:
    - path: "/data"
      name: "files"
```

### Structured JSON Logging

Enable JSON structured logs for log aggregation tools:

```yaml
http:
  port: 8080
server:
  logging:
    - levels: "info|debug|warning|error"
      output: "stdout"
      json: true    # Output in JSON format
      utc: true     # Use UTC timestamps
  sources:
    - path: "/data"
      name: "files"
```

### Multiple Log Outputs

You can have multiple file loggers and one stdout logger:

```yaml
http:
  port: 8080
server:
  logging:
    # Console output without API logs
    - output: "stdout"
      levels: "info|warning|error"
      apiLevels: "disabled"
    # API events to separate file
    - output: "api-events.log"
      levels: "disabled"  # Only log API events
      noColors: true
    # Errors to separate file
    - output: "errors.log"
      levels: "error|warning"
      apiLevels: "disabled"
      noColors: true
  sources:
    - path: "/data"
      name: "files"
```

{{% alert context="warning" %}}
You can have as many file output loggers as you want, but **only one stdout logger**. If you configure multiple stdout loggers, only the first one will be used.
{{% /alert %}}

### API-Specific Logging

Configure separate log levels for API requests:

```yaml
http:
  port: 8080
server:
  logging:
    - output: "stdout"
      levels: "info|warning|error"
      apiLevels: "info|warning|error"  # API logs at different levels
  sources:
    - path: "/data"
      name: "files"
```

Or disable API logs entirely:

```yaml
http:
  port: 8080
server:
  logging:
    - output: "stdout"
      levels: "info|warning|error"
      apiLevels: "disabled"
  sources:
    - path: "/data"
      name: "files"
```

## Complete Production Example

For production environments, recommended logging configuration:

```yaml
http:
  port: 8080
  baseURL: "/"
server:
  database:
    path: "/database/filebrowser.sqlite"
  logging:
    # Main application logs to file
    - output: "/var/log/filebrowser/app.log"
      levels: "info|warning|error"
      noColors: true
      json: true
      utc: true
    # Error-only logs for monitoring
    - output: "/var/log/filebrowser/errors.log"
      levels: "error"
      apiLevels: "disabled"
      noColors: true
      json: true
      utc: true
    # API events to separate file
    - output: "/var/log/filebrowser/api.log"
      levels: "disabled"
      apiLevels: "info|warning|error"
      noColors: true
      json: true
      utc: true
  sources:
    - path: "/data"
      name: "files"
      config:
        denyByDefault: false

auth:
  tokenExpirationHours: 2
  methods:
    password:
      enabled: true
```

## Special Log Behaviors

### FATAL Logs

{{% alert context="danger" %}}
**FATAL** logs are considered errors and cannot be disabled. FATAL logs always print to console regardless of configuration, as they indicate the program is about to terminate.
{{% /alert %}}

### Debug Mode Line Numbers

When debug logging is enabled, **all log types** (not just debug) will include the exact file and line number that caused the log event. This helps with troubleshooting but adds overhead.

## Troubleshooting

### Terminal Shows Weird Characters

If you see `033[0m` or similar text in your logs:

```yaml
server:
  logging:
    - output: "stdout"
      levels: "info|warning|error"
      noColors: true  # Disable color codes
  sources:
    - path: "/data"
      name: "files"
```

### Enable Debug Logging Temporarily

For troubleshooting, temporarily enable debug logging:

```yaml
server:
  logging:
    - output: "stdout"
      levels: "info|warning|error|debug"  # Add debug level
  sources:
    - path: "/data"
      name: "files"
```

{{% alert context="warning" %}}
Debug logging can generate large amounts of output and includes file/line numbers for all logs. Use it only for troubleshooting and disable it in production to avoid performance impact and disk space issues.
{{% /alert %}}

### Log Rotation

FileBrowser doesn't handle log rotation internally. Use external tools like `logrotate`:

```
/var/log/filebrowser/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 filebrowser filebrowser
    sharedscripts
    postrotate
        systemctl reload filebrowser
    endscript
}
```

## Next Steps

- {{< doclink path="reference/fullconfig/" text="Configuration Reference" />}}
