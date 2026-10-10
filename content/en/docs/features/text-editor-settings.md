---
title: "In-editor settings"
description: "Configure the built-in text editor from the toolbar"
icon: "edit_note"
date: "2026-10-10T00:00:00Z"
lastmod: "2026-10-10T00:00:00Z"
---

{{% alert context="info" %}}
**v2.1.x**
{{% /alert %}}

The built-in text editor stores per-browser preferences in **local storage** (not in `config.yaml` or user profile JSON on the server). These settings apply on the device and browser where you change them.

## Open the settings prompt

While the text editor is open:

- Use the toolbar **more** menu (⋮) and choose **Editor settings**, or
- Press **Ctrl+,** ( **Cmd+,** on macOS ).

The prompt lists dropdowns and toggles for editor behavior.

## Wrap long lines

**Setting key (local storage):** `editorConfig.wrapEditorContent` (boolean, default `false`)

In the **Editor settings** prompt, enable **Wrap long lines in the editor**. When on, CodeMirror wraps long lines so horizontal scrolling is not required.

This is separate from profile **File viewer options** (`userDefaults.editorQuickSave`, `userDefaults.preferEditorForMarkdown`, etc.). See {{< doclink path="user-preferences/file-viewer-options/" text="File viewer options" />}} for those defaults.

## Reset

Use **Reset defaults** at the bottom of the **Editor settings** prompt to restore all in-editor preferences (including wrap) to their built-in defaults.

## Related

- {{< doclink path="features/previewing-files/" text="Previewing files" />}} — which file types open in the editor
- {{< doclink path="user-preferences/file-viewer-options/" text="File viewer options" />}} — profile defaults for viewers and editor shortcuts
