---
title: "About"
description: "Overview of office integration features"
icon: "info"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-10-03T16:40:00Z"
---

Overview of office document preview and editing capabilities.

{{% alert context="info" %}}
OnlyOffice is currently the only supported office integration. Collabora support is planned for the future.
{{% /alert %}}

## Overview

FileBrowser Quantum integrates with [OnlyOffice Document Server](https://helpcenter.onlyoffice.com/docs/installation/docs-developer-install-docker.aspx#runningonlyofficedocsusinghttps_block) to provide document preview and editing capabilities directly in the browser.

## Support Levels

**Without Integration (Default)**
- Image preview for certain formats
- Basic DOCX and EPUB viewer

**With OnlyOffice Integration**
- Wide range of preview types
- Full office editor
- Real-time collaboration

## Features

- ✅ Open and edit office documents
- ✅ Enable/disable OnlyOffice per user
- ✅ Create new files from UI
- ✅ Office document previews
- ✅ Real-time collaboration
- ✅ Share office files with editing

## Supported File Types

### Word Processing
```
.doc, .docm, .docx, .dot, .dotm, .dotx, .epub, .fb2, .fodt, .htm, .html,
.mht, .mhtml, .odt, .ott, .rtf, .stw, .sxw, .txt, .wps, .wpt, .xml
```

### Spreadsheets
```
.csv, .et, .ett, .fods, .ods, .ots, .sxc, .xls, .xlsb, .xlsm, .xlsx,
.xlt, .xltm, .xltx
```

### Presentations
```
.dps, .dpt, .fodp, .odp, .otp, .pot, .potm, .potx, .pps, .ppsm, .ppsx,
.ppt, .pptm, .pptx, .sxi
```

### Other Formats
```
.djvu, .docxf, .oform, .oxps, .pdf, .xps
```

## Native Preview Support

Without OnlyOffice, these formats have native preview:

```
.pdf, .xps, .epub, .mobi, .fb2, .cbz, .svg, .txt, .docx, .ppt, .pptx,
.xlsx, .hwp, .hwpx
```

## Configuration

To enable these office features, you need:

1. A running OnlyOffice server accessible from both server and client
2. Update config.yaml to add the integration with URL and JWT secret

### Basic Configuration

```yaml
integrations:
  office:
    url: "http://onlyoffice-server:8081"  # OnlyOffice Document Server URL
    secret: "your-secret-key"             # Optional JWT secret for security
```

### Server Settings

```yaml
server:
  baseURL: "/filebrowser"                 # Base URL for external access
  internalUrl: "http://filebrowser:80"    # (Optional) internal URL for filebrowser so other services like onlyoffice can communicate directly
```

{{% alert context="warning" %}}
`internalUrl` should be accessible from the OnlyOffice server. This is typically the docker network service name or a private address.
{{% /alert %}}

## Troubleshooting

see {{< doclink path="integrations/office/troubleshooting/" text="Troubleshooting" />}}

### Common Configuration Issues

#### 1. Docker Network Setup

If using Docker, ensure services can communicate, they both should be in the same docker network and configured properly.

```yaml
# config.yaml
http:
  port: 80
  internalUrl: "http://filebrowser:80"

integrations:
  office:
    url: "http://localhost:8081"  # URL reachable by browser -- Use the IP address of your pc if using in other devices besides the pc where you are testing
    internalUrl: "http://onlyoffice:80" # onlyoffice docker container name + internal port
    secret: "your-strong-secret"
    viewOnly: false
```

#### 2. Bare Metal Setup

This is same as previous section except that you will need to use IP address and port of the host system of the respective services. By default, both FileBrowser and OnlyOffice use port `80`. If you have set up in the same system, change `http.port` to `81` and `http.internalUrl` to `"http://<YourLocalIP>:81"`.


#### 3. Reverse Proxy Configuration

When using a reverse proxy, ensure proper headers:

{{< tabs tabTotal="2" >}}
{{< tab tabName="NGINX" >}}
```nginx
# nginx.conf
location /onlyoffice/ {
    proxy_pass http://onlyoffice:80/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```
{{< /tab >}}
{{< tab tabName="Traefik" >}}
```yaml
# Traefik labels
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.traefik.tls=true"
  - "traefik.http.routers.traefik.service=traefik"
  - "traefik.http.services.traefik.loadbalancer.server.port=80"
  - "traefik.http.services.traefik.loadbalancer.passhostheader=true"
```
{{< /tab >}}
{{< /tabs >}}

## Status Codes Reference

### OnlyOffice Callback Status Codes
- `1`: Document being edited
- `2`: Document ready for saving (closed with changes)
- `3`: Document saving error
- `4`: Document closed without changes
- `6`: Document being edited, but force save requested
- `7`: Document error

### HTTP Response Codes
- `200`: Success
- `400`: Bad request (missing parameters, invalid format)
- `403`: Forbidden (no access to source, no modify permissions)
- `404`: Not found (file not found, document ID generation failed)
- `500`: Internal server error (configuration issues, system errors)

## Next Steps

- {{< doclink path="integrations/office/configuration/" text="Configuration" />}}
- {{< doclink path="user-guides/office-integration/office-integration/" text="Office guides" />}}
- {{< doclink path="integrations/office/troubleshooting/" text="Troubleshooting" />}}
