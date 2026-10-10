---
title: "Common Options"
description: "Options available to all share types"
icon: "checklist"
date: "2025-10-08T14:59:30Z"
lastmod: "2026-08-30T16:50:15Z"
order: 2
---

Configuration options available to both normal and upload shares. These options appear in the share creation dialog when you click the share button. The layout below matches the application share prompt, including option order.

## Share dialog

{{< fb-prompt-mock >}}

{{< fb-field label="Share Duration" type="duration" help="Duration before the share expires. Leave blank for a permanent share." />}}

{{< fb-field label="Optional Password" type="password" help="Optional password required to access this share, including authenticated users." />}}

{{< fb-field label="Share Type" type="select" options="Normal|Upload only" selected="Normal" help="Normal shares allow viewing and downloading files. Upload shares allow uploading files to the share." />}}

<div class="settings-items">

{{< fb-toggle name="Allow modify" help="Allow editing files through this share (normal shares only)." />}}

{{< fb-toggle name="Allow create" help="Allow creating and uploading files and folders through this share (normal shares only)." />}}

{{< fb-toggle name="Allow delete" help="Allow deleting files through this share (normal shares only)." />}}

</div>

{{% alert context="info" %}}
Allow modify, create, and delete only apply to **normal shares** when the source is not read-only.
{{% /alert %}}

{{< fb-settings-group >}}

{{< fb-field label="Share Theme" type="select" options="Default theme|Custom themes..." selected="Default theme" help="The theme to use for the share link." />}}

{{< fb-field label="Default view mode" type="select" options="Normal View|List View|Compact View|Gallery View" selected="Normal View" help="Set the default view mode for anonymous users viewing this share. Logged-in users can still change their view preference (normal shares only)." />}}

{{< fb-toggle name="Allow replacements" help="Allow replacing existing files when uploading." />}}

{{< fb-toggle name="Disable download" help="Prevent downloading files from this share (normal shares only)." />}}

{{< fb-toggle name="Disable File Viewer" help="Disable the built-in file viewer for this share (normal shares only)." />}}

{{< fb-toggle name="Show Quick Download" help="Display quick download buttons for files in the share (normal shares only)." />}}

{{< fb-toggle name="Disable anonymous access" help="Only authenticated users can access the share. The user must have access to the source of the share." />}}

{{< fb-toggle name="Only share to certain users" help="Only the specified users can access the share. The user must have access to the source of the share." />}}

{{< fb-field id="allowed-usernames" label="" type="text" placeholder="Enter usernames, comma-separated" />}}

{{< fb-toggle name="Enable OnlyOffice viewer" help="Allow viewing office files using OnlyOffice in this share (normal shares only, when OnlyOffice is configured)." />}}

{{< fb-field label="Enforce theme mode" type="select" options="Use user preference|Dark|Light" selected="Use user preference" help="Force a specific theme mode (dark or light) for this share, overriding user preferences." />}}

{{< fb-toggle name="Do not delete share after it expires" help="The share will not be deleted after it expires. Useful if you want to extend a share's expiration or edit it further after it expires." />}}

{{< fb-toggle name="Disable Thumbnails" help="Preview thumbnails will not be shown in the share (normal shares only)." />}}

{{< fb-toggle name="Show hidden files" help="Show hidden files in the share listing (normal shares only)." />}}

{{< fb-field label="Hide file extensions" type="text" placeholder="e.g., .txt, .log" help="Comma-separated list of file extensions to hide from the listing (normal shares only)." />}}

{{< fb-toggle name="Hide navigation buttons" help="Hide the navigation buttons on the navbar in the share to create a minimalistic look." />}}

{{< fb-toggle name="Disable share card" help="Disable the share card on the shared page in the sidebar or at the top of the page on mobile." />}}

{{< fb-toggle name="Disable sidebar" help="Disable the sidebar on the shared page." />}}

{{< fb-toggle name="Apply the downloads limit to each user" help="When enabled, the downloads limit will be applied to each user. Anonymous users will not be able to download any files from this share (normal shares only)." />}}

{{< fb-toggle name="Extract embedded subtitles" help="Extract embedded subtitles from media files on load — this can be slow for large files (normal shares only)." />}}

{{< fb-toggle name="Disable login option" help="Hide the login option on the share page." />}}

{{< fb-field label="Downloads Limit" type="number" placeholder="Leave empty for unlimited" help="The maximum number of times any file/folder from the share can be downloaded (normal shares only)." />}}

{{< fb-field label="Max Bandwidth" type="number" placeholder="kbps" help="The maximum download bandwidth in kbps. Leave empty for unlimited (normal shares only)." />}}

{{< fb-toggle name="Limit storage through this share" help="Counts bytes uploaded through this share link (v2.1.x). Uploads also count against the share owner's scope quota on that source, if one is set." />}}

{{< fb-field label="Share Theme Color" type="text" placeholder="e.g., red, rgb(33,150,243)" help="CSS color value applied to the share theme." />}}

{{< fb-field label="Share Title" type="text" placeholder="Custom page title" help="Custom page title shown on the share page." />}}

{{< fb-field label="Share Description" type="textarea" placeholder="Short description" help="Short description shown on the share page (may be used in meta tags)." />}}

{{< fb-field label="Share Banner" type="text" placeholder="https://domain.com/banner.png or /path/to/banner.png" help="Banner image URL or path accessible by the client." />}}

{{< fb-field label="Share Favicon" type="text" placeholder="https://domain.com/favicon.png or /path/to/favicon.png" help="Favicon URL or path accessible by the client." />}}

{{< /fb-settings-group >}}

{{< /fb-prompt-mock >}}

**Available time units for duration:** minutes, hours, days

When **Only share to certain users** is enabled, enter comma-separated usernames (e.g., `john, mary, admin`).

### Storage quota (v2.1.x)

For **upload shares** and normal shares with **allow create**, you can cap how much data may be uploaded through the link. When enabled, choose a preset limit (for example 1 GB or 10 GB) or enter a custom size in GB. The dialog shows **used / limit** while editing.

Full behavior, measurement types, and admin folder limits are described in {{< doclink path="features/quotas/" text="Storage quotas (v2.1.x)" />}}.

Paths for banner and favicon can be absolute URLs (`https://domain.com/image.png`) or index paths (`/path/to/image.png`).

## Share expiration behavior

By default, share links are permanent. When you set an expiration:

1. The share becomes inaccessible after the expiration time
2. Expired shares are automatically removed during system startup
3. Enable **Keep After Expiration** to retain expired shares in your list

This allows you to:

- Track how many times expired shares were accessed
- Easily re-enable expired shares with new expiration dates
- Maintain a history of shares for audit purposes

## Security best practices

1. **Use password protection** for sensitive content
2. **Set expiration dates** for temporary shares
3. **Use allowed usernames** for controlled organizational access
4. **Disable anonymous access** for internal company shares
5. **Keep after expiration** for tracking and auditing

## Next steps

- {{< doclink path="shares/customization/" text="Customize appearance" />}}
- {{< doclink path="shares/normal-shares/" text="Normal shares" />}}
- {{< doclink path="shares/upload-shares/" text="Upload shares" />}}
