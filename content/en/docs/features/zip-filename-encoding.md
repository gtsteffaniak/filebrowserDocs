---
title: "ZIP filename encoding on extract"
description: "Choose how non-Unicode ZIP entry names are decoded when extracting"
icon: "folder_zip"
date: "2026-10-10T00:00:00Z"
lastmod: "2026-10-10T00:00:00Z"
---

{{% alert context="info" %}}
**v2.1.x**
{{% /alert %}}

When you **extract** a `.zip` archive on the server, FileBrowser can decode entry names using several legacy encodings. ZIP **Unicode Path** extra fields and the UTF-8 flag still take precedence over any fallback you pick.

## Web UI

1. Select a `.zip` file and open **Extract** / **Unarchive**.
2. Choose the destination folder.
3. For ZIP files, the prompt loads a **Filename encoding** preview (`POST /api/resources/unarchive` with `"preview": true`).
4. Pick an encoding from the dropdown (the suggested option is marked when the server recommends one).
5. Review **Filename preview**, then confirm **Extract**.

Extraction stays disabled until an encoding is selected and the preview succeeds.

Supported **filenameEncoding** values (same as the API):

| Value | Typical use |
|-------|-------------|
| `utf-8` | Unicode / modern archives |
| `cp932` | Japanese (Shift JIS) |
| `gb18030` | Simplified Chinese |
| `big5` | Traditional Chinese |
| `euc-kr` | Korean |
| `cp437` | DOS Latin US |
| `windows-1252` | Western European |

Creating a new ZIP with **Create archive** does not expose encoding options; only extraction does.

## API

`POST /api/resources/unarchive` JSON body fields:

- **`filenameEncoding`** (string, optional on preview; required to extract when the archive needs a fallback): one of the values above.
- **`preview`** (boolean, optional): when `true`, returns encoding **candidates** and sample decoded names without writing files or honoring **delete after extract**.

Other fields (`fromSource`, `path`, `destination`, `deleteAfter`, etc.) are unchanged from server-side unarchive.

## Related

- {{< doclink path="configuration/server/#maxarchivesize" text="server.maxArchiveSize" />}} — size cap for archive and unarchive actions
- {{< doclink path="user-preferences/uploads-downloads/" text="Delete after archive" />}} — profile toggle for removing sources after extract
