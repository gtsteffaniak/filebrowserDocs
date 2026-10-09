---
title: "Stable"
description: "See what changed in stable versions"
icon: "api"
date: "2026-07-02T23:17:05Z"
lastmod: "2026-10-05T13:30:00Z"
---

{{% alert context="info" %}}
You can also check the releases on [GitHub!](https://github.com/gtsteffaniak/filebrowser/releases)
{{% /alert %}}

---

## [v1.5.8-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.8-stable)

**Security**:
 - [High] TOTP re-enrollment via `POST /api/auth/otp/generate` and `POST /api/auth/otp/verify` no longer allows anonymous callers to replace an existing second factor using only the account password; reset or replace requires an authenticated self or admin session (first-time enrollment without MFA unchanged) (GHSA-qx86-4v5r-26g5) -- thanks [@tao0845](https://github.com/tao0845).

**Notes**:
 - Supersedes v1.5.7-stable, so including its release notes for visibility.
 - [docker] upgraded ffmpeg version from 9.0.1 to 9.0.2

**Full Changelog**: [v1.5.7-stable...v1.5.8-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.5.7-stable...v1.5.8-stable)

---

## [v1.5.7-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.7-stable)

**Security**:
 - [High] TOTP re-enrollment via `POST /api/auth/otp/generate` and `POST /api/auth/otp/verify` no longer allows anonymous callers to replace an existing second factor using only the account password; reset or replace requires an authenticated self or admin session (first-time enrollment without MFA unchanged) (GHSA-qx86-4v5r-26g5) -- thanks [@tao0845](https://github.com/tao0845).

**Notes**:
 - This release has been superseded by v1.5.8-stable, as it introudces a TOTP login change that prevented login in some circumstances.
 - [docker] upgraded ffmpeg version from 9.0.1 to 9.0.2

**Full Changelog**: [v1.5.6-stable...v1.5.7-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.5.6-stable...v1.5.7-stable)

---

## [v1.5.6-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.6-stable)

**Security**:
 - [Moderate] public metadata api returns file content to anonymous share visitors, ignoring the share's download limit and file-viewer setting (GHSA-55mw-cwg7-m8f5) -- thanks [@kta1kri](https://github.com/kta1kri)

**BugFixes**:
 - Saving an existing share clears its password, even with no changes made ([issue #2898](https://github.com/gtsteffaniak/filebrowser/issues/2898))
 - Fixed infinite loading spinner on `/` and `/login` after CSP security hardening ([issue #2886](https://github.com/gtsteffaniak/filebrowser/issues/2886)) ([issue #2890](https://github.com/gtsteffaniak/filebrowser/issues/2890))

**Full Changelog**: [v1.5.5-stable...v1.5.6-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.5.5-stable...v1.5.6-stable)

---

## [v1.5.5-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.5-stable)

- Fixed onlyoffice failing to load due to strict csp security requirement introduced in v1.5.4

**Full Changelog**: [v1.5.4-stable...v1.5.5-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.5.4-stable...v1.5.5-stable)

---

## [v1.5.4-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.4-stable)

**Security**:
 - [High] Stored XSS via HTML preview: `<script>` is no longer preserved in srcdoc, the preview iframe is opaque-origin (no `allow-same-origin`), the session cookie is HttpOnly, and the SPA shell sends a `script-src` CSP inherited by srcdoc frames (GHSA-vvm6-jwrf-hgmg) -- thanks [@qrn12580](https://github.com/qrn12580)

**New Features**:
 - Added option to globally disable the "Install App" message via `frontend.disablePWAInstall`

**Notes**:
 - [docker] upgraded ffmpeg version 8.1.2 to 9.0.1

**BugFixes**:
 - "install app" message reappears after being cleared on device.
 - External subtitles fail to load on public video shares due to authenticated subtitle endpoint ([issue #2822](https://github.com/gtsteffaniak/filebrowser/issues/2822)) ([pr #2827](https://github.com/gtsteffaniak/filebrowser/pull/2827))
 - Restored upload chunk size `0` to disable chunking as documented ([issue #2202](https://github.com/gtsteffaniak/filebrowser/issues/2202)); workaround for iOS 26 multi-chunk upload stalls (issue [#2734](https://github.com/gtsteffaniak/filebrowser/issues/2734)).

**Full Changelog**: [v1.5.3-stable...v1.5.4-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.5.3-stable...v1.5.4-stable)

---

## [v1.5.3-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.3-stable)

**BugFixes**:
 - windows backslash inserted into directory URLs causing malformed paths and path escapes from parent ([issue #2815](https://github.com/gtsteffaniak/filebrowser/issues/2815)) ([issue #2816](https://github.com/gtsteffaniak/filebrowser/issues/2816))
 - root download of a shared file/folder returns HTTP 500 ([issue #2807](https://github.com/gtsteffaniak/filebrowser/issues/2807)) ([issue #2810](https://github.com/gtsteffaniak/filebrowser/issues/2810)) ([issue #2821](https://github.com/gtsteffaniak/filebrowser/issues/2821)) ([issue #2818](https://github.com/gtsteffaniak/filebrowser/issues/2818))
 - OnlyOffice is inaccessible if share has optional password ([issue #2811](https://github.com/gtsteffaniak/filebrowser/issues/2811))

**Full Changelog**: [v1.5.2-stable...v1.5.3-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.5.2-stable...v1.5.3-stable)

---

## [v1.5.2-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.2-stable)

**Security**:
 - [High] Symlink following on read paths no longer escapes source or user/share scope (GHSA-mgqf-5mf5-prfj) -- thanks [@je-lv](https://github.com/je-lv) [@KasperBuilds](https://github.com/KasperBuilds)
 - [High] Share create/update could set delete/modify/create flags beyond the owner's permissions; POST /api/share with hash could update another user's share (GHSA-x79q-5hqm-x839) -- thanks [@pant0m](https://github.com/pant0m)
 - [High] PATCH /api/share could re-point a share outside the owner's scope (GHSA-wfjp-qhvc-69wp) -- thanks [@maximeborges](https://github.com/maximeborges)
 - [High] Public upload ACL check used scope-stripped path, bypassing per-folder DENY rules (GHSA-qv53-4557-m65h) -- thanks [@hypnguyen1209](https://github.com/hypnguyen1209)
 - [Moderate] Absolute paths in API path/file parameters could bypass user scope and read files outside the source mount (GHSA-rqqq-wv83-rp74) -- thanks [@Wei-Leo](https://github.com/Wei-Leo)
 - [Moderate] Authenticated upload and pause endpoints checked access rules on scope-relative paths, bypassing per-folder DENY rules (GHSA-cw65-p35p-633w) -- thanks [@5ud0er](https://github.com/5ud0er)
 - [Moderate] Logout did not invalidate session JWTs with equivalent Base64URL spellings (GHSA-8m35-wcjh-95q7) -- thanks [@corbanvilla](https://github.com/corbanvilla) [@soh3e](https://github.com/soh3e) [@dderpym](https://github.com/dderpym) (This vulnerability was discovered as part of a U.C. Berkeley security research project by: Corban Villa, Sohee Kim, and Austin Chu)
 - [Moderate] Stored XSS via unsanitized DOCX hyperlink in DocViewer (GHSA-9wm6-jcjh-3m8c) -- thanks [@karen93shieh](https://github.com/karen93shieh) [@je-lv](https://github.com/je-lv) [@EclipsSec](https://github.com/EclipsSec)
 - [Moderate] Revoked JWTs could still authenticate on public-share and withOrWithoutUser routes until natural expiry, bypassing logout and Api-permission revocation on that surface (GHSA-4wmj-rq3c-m65v) -- thanks [@hypnguyen1209](https://github.com/hypnguyen1209)

**Full Changelog**: [v1.5.1-stable...v1.5.2-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.5.1-stable...v1.5.2-stable)

---

## [v1.5.1-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.1-stable)

**Notes**:
 - PWA installation name now capped at 30 characters instead of 12 ([issue #2699](https://github.com/gtsteffaniak/filebrowser/issues/2699))

**BugFixes**:
 - Fixed forward slash blocked in text fields when the search shortcut listener intercepts `/` ([issue #2696](https://github.com/gtsteffaniak/filebrowser/issues/2696))
 - Fixed probe canShare with the real file, not a fixed text/plain stand-in ([pr #2664](https://github.com/gtsteffaniak/filebrowser/pull/2664))
 - When the logout button is pressed, the user is redirected to an invalid URL that does not honor baseURL / externalUrl ([issue #2657](https://github.com/gtsteffaniak/filebrowser/issues/2657))
 - Fixed redirect to login when an authenticated request returns 401 (expired session)
 - Fixed uncustomized (minimal) API tokens creation needed by webdav clients ([issue #2503](https://github.com/gtsteffaniak/filebrowser/issues/2503))

**Full Changelog**: [v1.5.0-stable...v1.5.1-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.5.0-stable...v1.5.1-stable) -- **Release:**: [v1.5.1-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.1-stable).

---

## [v1.5.0-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.0-stable)

This release is based on {{< doclink path="changelog/beta/#v152-beta" text="v1.5.2-beta" />}}!

 **New Features**:
 - Added basic html viewer with relative reference support ([issue #2522](https://github.com/gtsteffaniak/filebrowser/issues/2522)).
 - Shares can have pinned files, requires a user to have edit access to share.
 - Enhanced search:
   - Now uses "lazy" match by default ([issue #2509](https://github.com/gtsteffaniak/filebrowser/issues/2509))
   - Added missing `case sensitive` option in the UI.
 - Progressive Web App (PWA) improvements:
   - Restored install prompt with sidebar install button ([issue #2086](https://github.com/gtsteffaniak/filebrowser/issues/2086)).
   - Camera and video capture buttons on upload (mobile-friendly `capture` inputs)
   - Send files to other apps via the Web Share API (`Send to app` in the context menu)
 - App notifications for file operations ([issue #2478](https://github.com/gtsteffaniak/filebrowser/issues/2478))
   - Optional browser notifications: uploads, chunked downloads, move/copy, or failures finish while the tab is in the background.
   - Single on/off toggle in Notifications settings, stored in browser local storage.

 **Notes**:
 - [docker] Upgraded ffmpeg version 8.1 to 8.1.2

 **BugFixes**:
 - Fixed OnlyOffice reopening an older editor state after a document is modified ([pr #2633](https://github.com/gtsteffaniak/filebrowser/pull/2633)) ([issue #2578](https://github.com/gtsteffaniak/filebrowser/issues/2578)).
 - Cannot "Reset and generate new two-factor code" to reset the TOTP for a user ([pr #2641](https://github.com/gtsteffaniak/filebrowser/pull/2641))([issue #2399](https://github.com/gtsteffaniak/filebrowser/issues/2399)).
 - Fixed upload shares with password ([pr #2560](https://github.com/gtsteffaniak/filebrowser/pull/2589)) ([issue #2465](https://github.com/gtsteffaniak/filebrowser/issues/2465)).
 - Fixed token when returning from preview on shares with pass ([pr #2588](https://github.com/gtsteffaniak/filebrowser/pull/2588)) ([issue #2573](https://github.com/gtsteffaniak/filebrowser/issues/2573)).
 - Fixed share undefined url after editing a existent share ([pr #2567](https://github.com/gtsteffaniak/filebrowser/pull/2567)) ([issue #2523](https://github.com/gtsteffaniak/filebrowser/issues/2523)).
 - Fixed PWA manifest `scope` and `id` so install works when the app is served under a base URL.
 - Fixed installation of a public share as a PWA. Now opens the share URL instead of the site root ([#2302](https://github.com/gtsteffaniak/filebrowser/issues/2302)).

**Full Changelog**: [v1.4.0-stable...v1.5.0-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.4.0-stable...v1.5.0-stable) -- **Release:**: [v1.5.0-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.0-stable).

---

## [v1.4.0-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.4.0-stable)

This release is based on {{< doclink path="changelog/beta/#v144-beta" text="v1.4.4-beta" />}}!

{{% alert context="danger" %}}
Breaking change: removed deprecated `source.config.disableIndexing`, see {{< doclink path="advanced/source-configuration/conditional-rules/#disable-indexing" text="rules" />}}
{{% /alert %}}

**Security**:
 - [High] Path traversal in subtitle handler allows any authenticated user to read arbitrary files ([GHSA-vvp7-h4fj-m28w](https://github.com/gtsteffaniak/filebrowser/security/advisories/GHSA-vvp7-h4fj-m28w)).
 - [Moderate] Add Rate Limiting on Authentication Endpoint Enables Brute Force Attacks ([GHSA-r4v7-6wcg-ghj5](https://github.com/gtsteffaniak/filebrowser/security/advisories/GHSA-r4v7-6wcg-ghj5)).

**New Features**:
 - Pinned files/folders ([pr #2510](https://github.com/gtsteffaniak/filebrowser/pull/2510)) ([pr #2396](https://github.com/gtsteffaniak/filebrowser/pull/2396)).
 - Markdown Image relative reference support ([issue #2355](https://github.com/gtsteffaniak/filebrowser/issues/2355)).
 - Add an option to create a new folder for unarchiving ([issue #2338](https://github.com/gtsteffaniak/filebrowser/issues/2338)).
 - Read-only source configuration via `source.config.readOnly: true` ([issue #2438](https://github.com/gtsteffaniak/filebrowser/issues/2438)).
 - Add Passkey (WebAuthn) support for passwordless authentication ([issue #2287](https://github.com/gtsteffaniak/filebrowser/issues/2287)) ([pr #2379](https://github.com/gtsteffaniak/filebrowser/pull/2379)) -- thanks [@juansoler](https://github.com/juansoler).
 - Lyrics support for audio files ([pr #2360](https://github.com/gtsteffaniak/filebrowser/pull/2360)):
   - Updated UI for audio previews!
   - New panel for desktop, on mobile lyrics are inline (below the art).
   - Supports synced lyrics, the player gets syncronized in UI.
   - Supports embedded lyrics (`ID3`, `USLT`, `flac`, `ogg`, `clyr`) and sidecar `.lrc` files with the same name as the audio file.
   - The existent `Q` shortcut in audio files will toggle the new panel visibility.
   - Added `E` shortcut to change between tabs of the new panel if it's open.
 - API log filtering support via `apiFilter` option for logging.
   - Regex filter that excludes matching full API paths from being logged. (eg. `/user\?id\=self`) Defaults to `^/health|^/favicon.ico|^/static|^/public/static`.
   - Add config option to disable `/health` endpoint logging ([issue #2291](https://github.com/gtsteffaniak/filebrowser/issues/2291)).
 - More shortcuts ([pr #2300](https://github.com/gtsteffaniak/filebrowser/pull/2300)).
   - `CTRL+F1` switch to normal view.
   - `CTRL+F2` switch to gallery view.
   - `CTRL+F3` switch to list view.
   - `Double click` on empty space to select all items.
 - Option to hide certain files in UI by extension ([pr #2403](https://github.com/gtsteffaniak/filebrowser/pull/2403)) ([issue #2277](https://github.com/gtsteffaniak/filebrowser/issues/2277)).
 - Additional search features:
   - Wildcard search similar to regex, but limited to sqlite GLOB syntax ([issue #769](https://github.com/gtsteffaniak/filebrowser/issues/769)).
   - Advanced search tool that shows all results in a listing thats sortable and actionable like a normal listing ([issue #1051](https://github.com/gtsteffaniak/filebrowser/issues/1051)).
   - Advanced search supports multiple custom scopes per search.
   - Multiple search terms with `AND` or `OR` logic support.

**Notes**:
 - Added fallback to show text in notification if copy fails ([pr #2517](https://github.com/gtsteffaniak/filebrowser/pull/2517)).
 - Added `alt`+`arrow up` shortcut as alias of `backspace` to go into parent directory ([issue #2501](https://github.com/gtsteffaniak/filebrowser/issues/2501)) ([pr #2521](https://github.com/gtsteffaniak/filebrowser/pull/2521)).
 - Added `alt`+`arrow down` shortcut as alias of `enter` to open files in Listing View ([issue #2501](https://github.com/gtsteffaniak/filebrowser/issues/2501)) ([pr #2521](https://github.com/gtsteffaniak/filebrowser/pull/2521)).
 - Updated help menu with better translations.
 - Migrate `vue-i18n` to `v11` + lazy load languages ([pr #2504](https://github.com/gtsteffaniak/filebrowser/pull/2504)) ([issue #2472](https://github.com/gtsteffaniak/filebrowser/issues/2472)).
 - Migrate `eslint` to `v10` + lint fix ([pr #2488](https://github.com/gtsteffaniak/filebrowser/pull/2488)) ([issue #2459](https://github.com/gtsteffaniak/filebrowser/issues/2459)).
 - Improved preview cancellation to improve performance when navigating UI.
 - Auth rate limiting can be disabled via `auth.disableRateLimit`.
 - Updated share hash middleware ([pr #2443](https://github.com/gtsteffaniak/filebrowser/pull/2443)).
 - Updated source info popup to include private and readOnly properties.
 - Enhanced indexing scheduler which doesn't wake the disk as often.
 - New API route `media/lyrics` used to fetch and parse lyrics (embedded or from `.lrc` sidecar) ([pr #2360](https://github.com/gtsteffaniak/filebrowser/pull/2360)).
 - Swiping down gesture in fullscreen videos exit fullscreen instead of close preview ([pr #2360](https://github.com/gtsteffaniak/filebrowser/pull/2360)).
 - Improved styles for path selection and tables.
 - Improved style of drag and drop into listing view ([pr #2407](https://github.com/gtsteffaniak/filebrowser/pull/2407)).
 - Edit Sidebar links has new `show tools in sidebar` toggle and all users have this enabled by default. can be disabled via for new users `userDefaults.sidebar.showTools: false`.
 - Update user defaults ordering ([issue #1140](https://github.com/gtsteffaniak/filebrowser/issues/1140)).
 - Save view modes and sizes into local storage instead of db ([issue #2301](https://github.com/gtsteffaniak/filebrowser/issues/2301)) ([pr #2300](https://github.com/gtsteffaniak/filebrowser/pull/2300)).

**BugFixes**:
 - Fix folder previews issue ([pr #2487](https://github.com/gtsteffaniak/filebrowser/pull/2487)) ([issue #2492](https://github.com/gtsteffaniak/filebrowser/issues/2492)).
 - Fix accidental exit on images while using gestures ([pr #2508](https://github.com/gtsteffaniak/filebrowser/pull/2508)).
 - Socket field in `config.yaml` is ignored ([issue #2497](https://github.com/gtsteffaniak/filebrowser/issues/2497)).
 - Fix keep opened file selected after closing its preview [@anpryl](https://github.com/anpryl) ([pr #2515](https://github.com/gtsteffaniak/filebrowser/pull/2515)).
 - Logout from share page now redirects to the share instead of `/Login` again ([pr #2445](https://github.com/gtsteffaniak/filebrowser/pull/2445)).
 - `This location cannot be reached` error when navigating with FileTree in shares ([pr #2445](https://github.com/gtsteffaniak/filebrowser/pull/2445)).
 - Fix FileTree rename and move actions in previews ([pr #2445](https://github.com/gtsteffaniak/filebrowser/pull/2445)).
 - Delete prompt not showing date and thumbnails in some previews ([pr #2445](https://github.com/gtsteffaniak/filebrowser/pull/2445)).
 - Fix path slash issue on windows ([pr #2451](https://github.com/gtsteffaniak/filebrowser/pull/2451)) ([issue #2433](https://github.com/gtsteffaniak/filebrowser/issues/2433)) ([issue #2419](https://github.com/gtsteffaniak/filebrowser/issues/2419)).
 - Always force url rewrite for onlyoffice internal URL. Fixes Error saving with OnlyOffice ([issue #2450](https://github.com/gtsteffaniak/filebrowser/issues/2450)).
 - Overriding a Deny with an Allow not working ([issue #2405](https://github.com/gtsteffaniak/filebrowser/issues/2405)).
 - Blue overlay when using gestures in video files on mobile ([pr #2360](https://github.com/gtsteffaniak/filebrowser/pull/2360)).
 - Playback queue wasn't updating when changing of folder ([pr #2360](https://github.com/gtsteffaniak/filebrowser/pull/2360)).
 - Navigate close settings shows "something went wrong" ([issue #2047](https://github.com/gtsteffaniak/filebrowser/issues/2047)).

**Full Changelog**: [v1.3.3-stable...v1.4.0-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.3.3-stable...v1.4.0-stable) -- **Release:**: [v1.4.0-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.4.0-stable).

---

## [v1.3.3-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.3-stable)

**Security**:
 - [Critical] Path traversal in public share PATCH allows file ops outside shared directory -- thanks [@fg0x0](https://github.com/fg0x0) and [@Revanth011](https://github.com/Revanth011) for reporting ([GHSA-qqqm-5547-774x](https://github.com/gtsteffaniak/filebrowser/security/advisories/GHSA-qqqm-5547-774x)).

**Notes**:
 - Updated share hash middleware ([pr #2443](https://github.com/gtsteffaniak/filebrowser/pull/2443)).
 - Fix path slash issue on windows ([pr #2451](https://github.com/gtsteffaniak/filebrowser/pull/2451)) ([issue #2433](https://github.com/gtsteffaniak/filebrowser/issues/2433)) ([issue #2419](https://github.com/gtsteffaniak/filebrowser/issues/2419)).

**Full Changelog**: [v1.3.2-stable...v1.3.3-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.3.2-stable...v1.3.3-stable) -- **Release**: [v1.3.3-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.3-stable).

---

## [v1.3.2-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.2-stable)

**Security**:
 - Fix critical: unauthenticated user can view source info ([GHSA-3jmg-p96m-m328](https://github.com/gtsteffaniak/filebrowser/security/advisories/GHSA-3jmg-p96m-m328)).

**Full Changelog**: [v1.3.1-stable...v1.3.2-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.3.1-stable...v1.3.2-stable) -- **Release**: [v1.3.2-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.2-stable).

---

## [v1.3.1-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.1-stable)

{{% alert context="danger" %}}
A security issue was introduced in this release which causes unauthenticated users to access source information on shares. A fix is being rolled out for [v1.3.2-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.2-stable)
{{% /alert %}}

**Security**:
 - [Critical] Unauthenticated Path Traversal in Public Share Delete Allows Arbitrary File Deletion [GHSA-fwj3-42wh-8673](https://github.com/gtsteffaniak/filebrowser/security/advisories/GHSA-fwj3-42wh-8673) (thanks [@Yesuhei](https://github.com/Yesuhei)).
 - [Moderate] Stored XSS via SVG File in Public Share (Missing CSP Header) [GHSA-mmpx-jh39-wrv6](https://github.com/gtsteffaniak/filebrowser/security/advisories/GHSA-mmpx-jh39-wrv6) (thanks [@MuxiLyuLucy](https://github.com/MuxiLyuLucy)).
 
**Notes**:
 - Creating/deleting password-based user requires reauthentication ([issue #2112](https://github.com/gtsteffaniak/filebrowser/issues/2112)).
 
**BugFixes**:
 - Fix context menu items and adjust when items show to more accurately reflect permissions.
 - Quick download icon style after icon change.
 - Missing error popup for resource creation actions (upload/create).
 - EnforcedOtp login failure until restart ([issue #2330](https://github.com/gtsteffaniak/filebrowser/issues/2330)).
 - Thumbnails for Folders only display sporadically ([issue #2353](https://github.com/gtsteffaniak/filebrowser/issues/2353)).
 - Unwanted user scope change for users with non-default scopes ([issue #2347](https://github.com/gtsteffaniak/filebrowser/issues/2347)).
 - Fix sidebar source info totals ([issue #2321](https://github.com/gtsteffaniak/filebrowser/issues/2321)) ([issue #2322](https://github.com/gtsteffaniak/filebrowser/issues/2322)) ([issue #982](https://github.com/gtsteffaniak/filebrowser/issues/982))
 - Error uploading a large number of photos -- only 100 items get uploaded ([issue #2348](https://github.com/gtsteffaniak/filebrowser/issues/2348)).
 - TOTP works for admin but fails for standard users on re-login until Docker is restarted ([issue #2330](https://github.com/gtsteffaniak/filebrowser/issues/2330)).
 - No Loginfields shown if password authentication is set to false ([issue #2331](https://github.com/gtsteffaniak/filebrowser/issues/2331)).

**Full Changelog**: [v1.3.0-stable...v1.3.1-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.3.0-stable...v1.3.1-stable) -- **Release**: [v1.3.1-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.1-stable).

---

## [v1.3.0-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.0-stable)

{{% alert context="danger" %}}
**Breaking changes:**
  - (potentially breaking) for Docker users: The default user is now `filebrowser` (1000:1000) instead of `root`. see {{< doclink path="getting-started/docker/#running-container-with-a-different-user" text="running container with a different user" />}}
{{% /alert %}}

**New Features**:
  - New Sidebar Features:
    - Sidebar tree navigation ([pr #2006](https://github.com/gtsteffaniak/filebrowser/pull/2006)) ([issue #350](https://github.com/gtsteffaniak/filebrowser/issues/350)).
    - Source usage to be customized to show os-reported values rather than calculated. This can be changed per source by editing the source link in the sidebar ([issue #1266](https://github.com/gtsteffaniak/filebrowser/issues/1266)) ([issue #982](https://github.com/gtsteffaniak/filebrowser/issues/982)).
  - Archive/Unarchive actions in UI ([issue #1252](https://github.com/gtsteffaniak/filebrowser/issues/1252)) ([issue #335](https://github.com/gtsteffaniak/filebrowser/issues/335)) ([issue #1569](https://github.com/gtsteffaniak/filebrowser/issues/1569)):
    - New api to archive/unarchive files on the server.
    - Requires `create` user permissions.
    - Archiving actions respect `server.maxArchiveSize`.
  - Added share icon to items that are shared ([issue #1420](https://github.com/gtsteffaniak/filebrowser/issues/1420)).
  - Authentication enhancements:
    - LDAP login support with OIDC feature parity ([issue #591](https://github.com/gtsteffaniak/filebrowser/issues/591)).
    - `userGroup` for OIDC and LDAP, only users in a group will get access ([issue #1964](https://github.com/gtsteffaniak/filebrowser/issues/1964)).
    - Add JWT token authentication support ([issue #1364](https://github.com/gtsteffaniak/filebrowser/issues/1364)).
  - Enhanced thumbnail and item previews.
    - Added ability to show `motion preview` for folders with multiple child items that have previews. cycles through the first 4 images.
    - Support for reading embedded images from raw image or heic/heif files ([issue #215](https://github.com/gtsteffaniak/filebrowser/issues/215)).
    - Reorganized and simplified thumbnail settings in profile settings ([issue #1968](https://github.com/gtsteffaniak/filebrowser/issues/1968)).
    - Removed `highQuality` thumbnail option, which only affected gallery view. Now it's always enabled.
    - Improved caching for unsupported images, the same file won't be attempted again with the same modtime.
    - Supports 3D model previews.
  - FileWatcher also supports watching directories.
  - Support previews for 3D model files ([issue #1273](https://github.com/gtsteffaniak/filebrowser/issues/1273)):
    - Supported formats via threejs: `GLTF`, `GLB`, `OBJ`, `STL`, `PLY`, `DAE` (Collada), `3MF`, `3DS`, `USDZ`, `USD`, `USDA`, `USDC`, `AMF`, `VRML`, `WRL`, `VTK`, `VTP`, `PCD`, `XYZ`, `VOX`, `KMZ`, `FBX`.
    - Supports animations (for formats that contain them).
    - Supports embedded textures, external neighboring file textures, or textures in `/textures` subdirectory.
  - Enhanced prompts:
    - All prompts have a taskbar with a close button.
    - Prompts can be freely moved by dragging the taskbar.
    - Prompt styling has been updated.
    - Clicking outside of prompts no longer automatically closes them.
  - WebDAV support ([issue #209](https://github.com/gtsteffaniak/filebrowser/issues/209)) -- thanks to [@reddec](https://github.com/reddec) for ([pr #1764](https://github.com/gtsteffaniak/filebrowser/pull/1764)).
    - See {{< doclink path="features/webdav" text="webdav docs" />}} on how to use.
    - Requires api an un-customized api token as a password.
    - Respects access rules.
    - Requires `download` permission to view and modify/create/delete permission to modify.
  - More user options for settings ([pr #2072](https://github.com/gtsteffaniak/filebrowser/pull/2072)) ([pr #2067](https://github.com/gtsteffaniak/filebrowser/pull/2067)):
    - Option to disable thumbnails `userDefaults.preview.audio` and `userDefaults.preview.models` for Audio and 3D Models.
    - Option to disable files in the Tree navigation `userDefaults.hideFilesInTree`.
    - Option to disable source files deletion when creating/extracting archives. `userDefaults.deleteAfterArchive`.
  - Option in settings `userDefaults.preferEditorForMarkdown` to prefer editor first for Markdown files ([pr #2160](https://github.com/gtsteffaniak/filebrowser/pull/2160)) ([issue #2136](https://github.com/gtsteffaniak/filebrowser/issues/2136)).
  - Copy to clipboard button for code blocks in Markdown Viewer ([pr #2160](https://github.com/gtsteffaniak/filebrowser/pull/2160)).
  - Add "Last modified" filter in search dialog ([issue #2157](https://github.com/gtsteffaniak/filebrowser/issues/2157)).
  - Copy/paste files and folders (`CTRL+C`/`CTRL+V`) from other apps (win explorer, thunar, finder, etc) to upload them directly ([pr #2197](https://github.com/gtsteffaniak/filebrowser/pull/2197)).
  - Caption font size can be adjusted in video settings.
  - Ability to adjust the startup check method for SQL database via `server.startupIntegrityCheck` ([issue #2221](https://github.com/gtsteffaniak/filebrowser/issues/2221)).
  - Status bar for editor and markdown viewer ([pr #2226](https://github.com/gtsteffaniak/filebrowser/pull/2226)).
  - Epub placement URL anchors to bookmark a specific location on the doc.
  - Add Requirement for Current Password When Changing Account Password or user for permissions and scope ([issue #2112](https://github.com/gtsteffaniak/filebrowser/issues/2112)).
  - Copy file path to clipboard through right-click ([issue #2204](https://github.com/gtsteffaniak/filebrowser/issues/2204)).

**Notes**:
  - User scope editing has path picker and filesystem validation.
  - Removed upx compression on docker image ([issue #2193](https://github.com/gtsteffaniak/filebrowser/issues/2193)).
  - Videos double-tap to fast-forward and rewind added.
  - Adjust Image album swipe behavior ([issue #2068](https://github.com/gtsteffaniak/filebrowser/issues/2068)).
    - Swipe animation for next/previous
    - Swipe down on the image to close and go to the parent folder.
    - Supports videos
  - Chunked uploads will save to a temporary file at the destination and be renamed on completion. Better upload pause handling ([issue #2129](https://github.com/gtsteffaniak/filebrowser/issues/2129)).
  - The Icons in the UI were updated! ([pr #2203](https://github.com/gtsteffaniak/filebrowser/pull/2203)).
    - More supported icons in the Icon Picker tool.
    - More file types have new icons across all the listings (such as `.md`, `.apk`, etc).
  - Removed upx compression on docker image ([issue #2193](https://github.com/gtsteffaniak/filebrowser/issues/2193))
  - Chunked uploads will save to a temporary file at the destination and be renamed on completion. Better upload pause handling ([issue #2129](https://github.com/gtsteffaniak/filebrowser/issues/2129)).
  - Deprecated `source.config.CreateUserDir`, now it's always `true`. If a user directory doesn't exist it will get created empty.
  - `CTRL`+`Mouse Wheel` shortcut to change listing size. Also for changing font size in editor ([pr #2250](https://github.com/gtsteffaniak/filebrowser/pull/2250)) ([issue #2227](https://github.com/gtsteffaniak/filebrowser/issues/2227)).
  - Docs preview for text and PDF has a 2-second timeout. If it hangs for whatever reason, the maximum time would be 2 seconds ([issue #2105](https://github.com/gtsteffaniak/filebrowser/issues/2105)) ([pr #2114](https://github.com/gtsteffaniak/filebrowser/pull/2114)).
  - Downloading multiple file streams the archive creation rather than using cacheDir -- thanks [@janakoram](https://github.com/janakoram) ([pr #2125](https://github.com/gtsteffaniak/filebrowser/pull/2125)) ([issue #2130](https://github.com/gtsteffaniak/filebrowser/issues/2130)).
    - `server.maxArchiveSizeGB` now defaults to 20 (GB) and only applies to archive/unarchive actions (not downloads).
    - The browser download progress bar will no longer show for archive downloads. This is the main drawback to the streaming approach.
    - Should allow for much higher parallel download support and lower cleanup maintenance.
  - Remote IP in logs now prefers `X-Forwarded-For` if it exists, then `X-Real-IP`, then lastly the standard RemoteAddr. Useful when running behind a proxy to log the public IP of each request. ([issue #2110](https://github.com/gtsteffaniak/filebrowser/issues/2110)).
  - Changed loading spinner style to be more compatible with Safari browsers.
  - Share icon does not show in the share listing or for shares for other users.
  - File Size Analyzer tool max items increased from 100 to 200.
  - Changed symlink detection logic.
  - Docker images default to `filebrowser` user instead of root.
  - Reorganized api routes:
    - Consolidated tags for swagger to be more accurately grouped.
    - Tools are all behind `/api/tools` routes.
    - `/api/raw` is deprecated (but functional). The `/api/resources/download` route will be used instead.
    - `/api/preview` has been removed and replaced with `/api/resources/preview`.
    - `/api/onlyoffice` has been replaced with `/api/office`.
    - `/api/shares` has been moved to `/api/share/list`.
    - `/api/auth/tokens` has been moved to `/api/auth/token/list` and `/api/auth/token` has been added to get specific token info.
    - `PUT /api/token` has been moved to `POST /api/token`.
    - `/public/api/shareinfo` has been moved to `/public/api/share/info`.
    - `POST /resources/bulk/delete` api has been moved to `DELETE /resources/bulk` ([issue #1984](https://github.com/gtsteffaniak/filebrowser/issues/1984)).

**BugFixes**:
  - Long folder names get cut off at the top navigation bar ([issue #1934](https://github.com/gtsteffaniak/filebrowser/issues/1934))

**Full Changelog**: [v1.2.4-stable...v1.3.0-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.2.4-stable...v1.3.0-stable) -- **Release**: [v1.3.0-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.0-stable).

---

## [v1.2.4-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.4-stable)

**Security**:
 - Anonymous user shouldn't see server folder path with the `Go to source location` button from the share page ([issue #2216](https://github.com/gtsteffaniak/filebrowser/issues/2216)).

**Notes**:
 - removed upx compression on docker images ([issue #2193](https://github.com/gtsteffaniak/filebrowser/issues/2193))

**BugFixes**:
 - Share banner URL not rendering in Open Graph (og:image) meta tags for link previews ([issue #2189](https://github.com/gtsteffaniak/filebrowser/issues/2189)).
 
**Full Changelog**: [v1.2.3-stable...v1.2.4-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.2.3-stable...v1.2.4-stable) -- **Release**: [v1.2.4-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.4-stable).

---

## [v1.2.3-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.3-stable)

**Security**:
 - Patched Username Enumeration via Authentication Timing Side-Channel ([GHSA-7789-65hx-f26w](https://github.com/gtsteffaniak/filebrowser/security/advisories/GHSA-7789-65hx-f26w)).

**Notes**:
 - Docs preview for text and pdf has a 2 second timeout. If it hangs for whatever reason, the maximum time would be 2 seconds ([issue #2105](https://github.com/gtsteffaniak/filebrowser/issues/2105)) ([issue #2114](https://github.com/gtsteffaniak/filebrowser/issues/2114)).
 - [docker] ffmpeg version upgraded to 8.1

**BugFixes**:
 - Wrong username in share settings ([issue #2147](https://github.com/gtsteffaniak/filebrowser/issues/2147)) ([pr #2148](https://github.com/gtsteffaniak/filebrowser/pull/2148)).
 - [OnlyOffice] Error when saving a file under a user scope ([issue #2133](https://github.com/gtsteffaniak/filebrowser/issues/2133)).
 - Cannot edit shared file in OnlyOffice ([issue #2143](https://github.com/gtsteffaniak/filebrowser/issues/2143))
 - Share banner seems to be not working for custom urls ([issue #2120](https://github.com/gtsteffaniak/filebrowser/issues/2120)).

**Full Changelog**: [v1.2.2-stable...v1.2.3-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.2.2-stable...v1.2.3-stable) -- **Release**: [v1.2.3-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.3-stable).

---

## [v1.2.2-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.2-stable)

{{% alert context="warning" %}}
**Breaking changes moving from 1.1.x to 1.2.x:**
- if you use global indexing rules, they have changed format -- see {{< doclink path="advanced/source-configuration/conditional-rules/" text="conditional rules" />}}.
{{% /alert %}}

**Security**:
 - Patched Stored XSS in public share page via unsanitized share metadata (text/template misuse) ([GHSA-r633-fcgp-m532](https://github.com/gtsteffaniak/filebrowser/security/advisories/GHSA-r633-fcgp-m532)).
 - Patched Incomplete Remediation of CVE-2026-27611: Password-Protected Share Bypass via `/public/api/share/info` ([GHSA-525j-95gf-766f](https://github.com/gtsteffaniak/filebrowser/security/advisories/GHSA-525j-95gf-766f)).

**New Features**:
 - "Divider" option in sidebar links to add a text or divider between links ([issue #1875](https://github.com/gtsteffaniak/filebrowser/issues/1875)).
 - Shares offer a "go to source Location" sidebar link and button when editing a share.

**Notes**:
 - Share edit/delete permissions are scoped to the user's shares rather than global ([issue #2050](https://github.com/gtsteffaniak/filebrowser/issues/2050)).
 - OIDC group claims accepted as map ([pr #1444](https://github.com/gtsteffaniak/filebrowser/pull/2084)).

**BugFixes**:
 - Fixed the requirement that the database path needed to be set in the config file, now it loads `FILEBROWSER_DATABASE` value by default, fallback to config file property.
 - Error downloading zipped directory: no such file or directory on users with scope ([issue #2015](https://github.com/gtsteffaniak/filebrowser/issues/2015)).

**Full Changelog**: [v1.2.1-stable...v1.2.2-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.2.1-stable...v1.2.2-stable) -- **Release**: [v1.2.2-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.2-stable).

---

## [v1.2.1-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.1-stable)

Read: [New Announcement](https://github.com/gtsteffaniak/filebrowser/discussions/2048)

{{% alert context="warning" %}}
**Breaking changes moving from 1.1.x to 1.2.x:**
- if you use global indexing rules, they have changed format -- see {{< doclink path="advanced/source-configuration/conditional-rules/" text="conditional rules" />}}.
{{% /alert %}}

**BugFixes**:
 - Startup icon generation order ([issue #2019](https://github.com/gtsteffaniak/filebrowser/issues/2019)).
 - Login button on shares not showing ([issue #2028](https://github.com/gtsteffaniak/filebrowser/issues/2028)).
 - Removed file watcher link in context menu for shares ([issue #2025](https://github.com/gtsteffaniak/filebrowser/issues/2025)).
 - Direct download link for single-file shares generates incorrect URL ([issue #2026](https://github.com/gtsteffaniak/filebrowser/issues/2026)).
 - Deleting files causes error ([issue #2039](https://github.com/gtsteffaniak/filebrowser/issues/2039))

**Full Changelog**: [v1.2.0-stable...v1.2.1-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.2.0-stable...v1.2.1-stable) -- **Release**: [v1.2.1-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.1-stable).

---

## [v1.2.0-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.0-stable)

Read: [New Announcement](https://github.com/gtsteffaniak/filebrowser/discussions/2048)

{{% alert context="danger" %}}
**Breaking changes moving from 1.1.x to 1.2.x:**
 - If you use global indexing rules, they have changed format -- see {{< doclink path="advanced/source-configuration/conditional-rules" text="conditional rules" />}}.

 - Docker now uses the default config `/home/filebrowser/data/config.yaml` unless otherwise configured using `FILEBROWSER_CONFIG=/home/filebrowser/config.yaml` env var to set as previously default location -- see {{< doclink path="getting-started/docker/#basic-setup-with-docker-compose" text="getting started docs" />}}.

Also see the docs for {{< doclink path="tools/overview" text="tools" />}} if you weren't aware of the features!
{{% /alert %}}

This is a major version update with many changes which could cause unexpected behavior. Upgrades should proceed with caution and report any undesirable behavior. See the changes over {{< doclink path="changelog/stable/#v113-stable" text="v1.1.3-stable" />}} below:

**New Features**:
 - SQLite-based indexing.
   - reduced memory usage, higher CPU and IO usage.
   - index persistence between restarts requires {{< doclink path="configuration/server/#cachedir" text="persistent cacheDir" />}}.
 - New tool: Realtime File Watcher -- Low latency if user has realtime permissions ([issue #917](https://github.com/gtsteffaniak/filebrowser/issues/917)).
 - Breadcrumbs act as a drop area ([pr #1785](https://github.com/gtsteffaniak/filebrowser/pull/1785))
 - Access control works with individual files too.
 - Conditionally hide symbolic links as indexing rule config ([issue #1540](https://github.com/gtsteffaniak/filebrowser/issues/1540))
 - Search multiple sources at once ([issue #848](https://github.com/gtsteffaniak/filebrowser/issues/848))
 - File uploads resume from bad internet connection ([issue #1599](https://github.com/gtsteffaniak/filebrowser/issues/1599))
 - Chunked downloads - optionally enabled in settings or `userDefaults` -- fix for `524` errors on cloudflare ([issue #1502](https://github.com/gtsteffaniak/filebrowser/issues/1502)).
 - Made size calculation consistent: defaults to "size on disk" style to mimic `du -sh`, and allows config `source.config.useLogicalSize: true` for 0 size folders and actual size file sizes. ([issue #1266](https://github.com/gtsteffaniak/filebrowser/issues/1266)).
 - Allow deleting selected duplicates from duplicate finder ([issue #1659](https://github.com/gtsteffaniak/filebrowser/issues/1659)).
 - Share changes:
   - Opengraph support for shared links.
   - Allow adding "share settings" option to customizable sidebar links ([issue #1825](https://github.com/gtsteffaniak/filebrowser/issues/1825)).
   - File picker for share favicon and banner icon.
   - Allow disabling "Login button" for shares ([issue #1673](https://github.com/gtsteffaniak/filebrowser/issues/1673))
 - Global disable onlyoffice editor via `*` file option to disable all files for a specific user ([issue #1533](https://github.com/gtsteffaniak/filebrowser/issues/1533)).
 - Resizable sidebar ([pr #1896](https://github.com/gtsteffaniak/filebrowser/pull/1896))
 - OIDC Authentication: Change Button Text via `frontend.oidcLoginButtonText` ([issue #1708](https://github.com/gtsteffaniak/filebrowser/issues/1708)).
 - Improved favicon processing ([issue #1899](https://github.com/gtsteffaniak/filebrowser/issues/1899))
   - Supports more formats.
   - Supports larger images.
   - Automatcially generates multiple favicon sizes on startup for non-svg images. Custom svg favicons need a companion `*.png` to exist broad compatibilty.
 - Enhanced media playback: Ability to control the queue from your device's lock screen and notification panel - Will also show
   metadata of the current playing media if available ([pr #1917](https://github.com/gtsteffaniak/filebrowser/pull/1917)).

**Notes**:
 - `server.cacheDirCleanup` defaults to `false` instead of `true`. For docker, you would still need to mount a cacheDir volume to persist cache between restarts.
 - Indexing rules have been streamlined, see [docs](https://filebrowserquantum.com/en/docs/advanced/source-configuration/conditional-rules/). The previous style is deprecated but still functional.
 - Improved listing load times for directories with metadata -- a two-pass approach. First a fast load to get the listing items, then a second api request to include metadata.
 - Enhanced delete prompt.
 - `bulkDelete` API added and replaces the delete API for all UI actions. See swagger docs for usage.
 - `raw` download and `patch` resource API simplified to a single source per request. See swagger docs for usage.
 - `UserScope` function re-organization, if you notice any user scope issues, please open a GitHub issue.
 - File upload resume from bad internet connection ([issue #1599](https://github.com/gtsteffaniak/filebrowser/issues/1599))
 - Upgraded imaging package and improved thumbnail generation performance ([issue #1797](https://github.com/gtsteffaniak/filebrowser/issues/1797)) ([issue #1850](https://github.com/gtsteffaniak/filebrowser/issues/1850)).
 - Updated download API to use repeated `file` query param for path instead of `files` with comma. See swagger for details  ([issue #1881](https://github.com/gtsteffaniak/filebrowser/issues/1881))
 - Better text file content detection ([issue #1726](https://github.com/gtsteffaniak/filebrowser/issues/1726))
 - More url encoding changes for API which should make things more consistent. Open issues if you see path/source not found errors.
 - Adjustments to the startup behavior for sqlite index for reusing the previous database on startup.
 - `CTRL + B` disables sticky sidebar forever ([issue #1869](https://github.com/gtsteffaniak/filebrowser/issues/1869))
 - Sharing a link for uploads - folder/file access and UX polishing ([issue #1902](https://github.com/gtsteffaniak/filebrowser/issues/1902)).
 - Improved listing view and scrolling performance.
 - Improved image viewer which will utilize recent thumbnails as a placeholder when loading the full image.
 - Small reorganization of "Share" settings to make the popup clear ([issue #1826](https://github.com/gtsteffaniak/filebrowser/issues/1826)).
 - Removed upload api behavior to assume paths ending in `/` are folders, strictly uses isDir query param.
 - Renamed public upload api query param from `targetPath` to `path`. see swagger docs.
 - Changed `/api/media/subtitles` api endpoint to better support subtitles.
 - Correcting some errors in French language ([issue #1947](https://github.com/gtsteffaniak/filebrowser/issues/1947))
 - Add Dutch `nl.json` for frontend `i18n` -- thanks [@Stephan-P](https://github.com/Stephan-P) ([issue #1957](https://github.com/gtsteffaniak/filebrowser/issues/1957)).
 - Share banner and icon images automatically serve a scaled down 1024x1024.

**Full Changelog**: [v1.1.3-stable...v1.2.0-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.1.3-stable...v1.2.0-stable) -- **Release**: [v1.2.0-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.0-stable).

---

## [v1.1.3-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.3-stable)

Resolves CVE found by [@ByteAfterlife](https://github.com/ByteAfterlife) affecting password protected share links.

**Security**:
 - Resolves [GHSA-8vrh-3pm2-v4v6](https://github.com/gtsteffaniak/filebrowser/security/advisories/GHSA-8vrh-3pm2-v4v6).

**Full Changelog**: [v1.1.2-stable...v1.1.3-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.1.2-stable...v1.1.3-stable) -- **Release**: [v1.1.3-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.3-stable).

---

## [v1.1.2-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.2-stable)

**BugFixes**:
 - Fix transversal vulnerability.
 - Fix image generation concurrency limits.

**Full Changelog**: [v1.1.1-stable...v1.1.2-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.1.1-stable...v1.1.2-stable) -- **Release**: [v1.1.2-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.2-stable).

---

## [v1.1.1-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.1-stable)

**Notes**:
 - Major git container tag request ([issue #1756](https://github.com/gtsteffaniak/filebrowser/issues/1756))
 - `showHidden` is now a backend attribute. Shares will NOT show hidden files by default unless configured to.
 - Improved listing view UI performance, especially for folders with many items. ([issue #1773](https://github.com/gtsteffaniak/filebrowser/issues/1773))

**BugFixes**:
 - Sharing broken if source `disableIndexing: true` ([issue #1742](https://github.com/gtsteffaniak/filebrowser/issues/1742))
 - Password protected share permission ([issue #1729](https://github.com/gtsteffaniak/filebrowser/issues/1729)) ([issue #1606](https://github.com/gtsteffaniak/filebrowser/issues/1606)) ([issue #1593](https://github.com/gtsteffaniak/filebrowser/issues/1593))
 - Sidebar Sliding left ([issue #1737](https://github.com/gtsteffaniak/filebrowser/issues/1737))
 - File permissions not working ([pr #1444](https://github.com/gtsteffaniak/filebrowser/pull/1762))
 - Handle `Close()` errors in archive creation ([pr #1745](https://github.com/gtsteffaniak/filebrowser/pull/1745))
 - Move custom CSS and user-selected theme styles to the end of the body ([pr #1744](https://github.com/gtsteffaniak/filebrowser/pull/1744)).
 - `SortBy` config is not respected when navigating next/previous ([pr #1787](https://github.com/gtsteffaniak/filebrowser/pull/1787)) ([issue #1786](https://github.com/gtsteffaniak/filebrowser/issues/1786)).
 - unauthenticated users unable to preview files ([issue #1792](https://github.com/gtsteffaniak/filebrowser/issues/1792))
 - File permission not correctly applied ([issue #1790](https://github.com/gtsteffaniak/filebrowser/issues/1790))
 - API Key loses `download` permission after creation despite being enabled ([issue #1799](https://github.com/gtsteffaniak/filebrowser/issues/1799)).
 - Never exclude root folder ([issue #1749](https://github.com/gtsteffaniak/filebrowser/issues/1749)).
 - Sources with "files" name not showing after 1.1.x update ([issue #1772](https://github.com/gtsteffaniak/filebrowser/issues/1772)).
 - Symbolic links can't be deleted from webui ([issue #1566](https://github.com/gtsteffaniak/filebrowser/issues/1566))
 - Panic: close of closed channel during indexing ([issue #1771](https://github.com/gtsteffaniak/filebrowser/issues/1771))
 - Public sharing returns `404` errors for album art ([issue #1792](https://github.com/gtsteffaniak/filebrowser/issues/1792))
 - Directories with some symbols in their name "fail to open" ([issue #1808](https://github.com/gtsteffaniak/filebrowser/issues/1808)).

**Full Changelog**: [v1.1.0-stable...v1.1.1-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.1.0-stable...v1.1.1-stable) -- **Release**: [v1.1.1-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.1-stable).

---

## [v1.1.0-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.0-stable)

{{% alert context="info" %}}
Upgrading from `1.0.x` you may need to add [defaultEnabled](https://filebrowserquantum.com/en/docs/advanced/source-configuration/sources/#minimal-configuration) to keep same functionality automatically adding sources for users.

Also, single-source URLs are updated: `/files/path/to/text.txt` becomes: `/files/<source name>/path/to/text.txt` to match the pattern used by multiple sources.
{{% /alert %}}

This update brings all changes present in {{< doclink path="changelog/beta/#v114-beta" text="v1.1.4-beta" />}} to stable.

**New Features**:
 - Toggle to show searching results with thumbnails ([issue #1545](https://github.com/gtsteffaniak/filebrowser/issues/1545))
 - Added tools:
   - File size analyser -- quickly show the largest files in an interactive graphical chart
   - Duplicate finder -- find probable duplicate files larger than 1MB
   - Material icon picker and previewer
 - Listing View Style updates
   - Status bar for listing view ([pr #1459](https://github.com/gtsteffaniak/filebrowser/pull/1459))
   - Duration field shows up if media is shown with duration
   - More dynamic view modes with additional styling changes
   - Total display modes consolidated into 3 main groups: `list`, `gallery` and `normal`. `icon` and `compact` modes exist as views based on display size setting.
 - Customizable sidebar links:
   - Logged-in users can have their preferences saved and synced
   - Can rearrange, add custom links, and save your preferences.
   - Can customise shares with their own custom sidebar links.
 - Dynamic scopes for OIDC ([issue #1414](https://github.com/gtsteffaniak/filebrowser/issues/1414)) ([issue #1363](https://github.com/gtsteffaniak/filebrowser/issues/1363))
 - Share and Access Rules validation:
   - If a file/path is moved/renamed in UI, its rules and shares will always follow.
   - If a file/path is moved/renamed outside UI, a warning message will show andthe  ability to associate with the new path
 - Cascade delete access in Access Management when deleting a User ([issue #1347](https://github.com/gtsteffaniak/filebrowser/issues/1347))
 - Enhanced notifications ([issue #1331](https://github.com/gtsteffaniak/filebrowser/issues/1331))
   - Added "toast" notification type support -- most success messages show as toast now.
   - Multiple stacked notifications possible
   - Notification button support, such as clicking to open a folder after moving a file.
   - Notification history (not including toasts)
   - Add swipe and visual timeout to notifications ([pr #1600](https://github.com/gtsteffaniak/filebrowser/pull/1600))
 - Choose different bind IP via `server.listen` ([issue #1573](https://github.com/gtsteffaniak/filebrowser/issues/1573))
 - Allow disabling clearing cache each startup via `server.cacheDirCleanup: false` in config ([issue #1576](https://github.com/gtsteffaniak/filebrowser/issues/1576))

**Notes**:
 - File list has loading spinner to help prevent double click issues and give better feedback.
 - Improved cacheDir startup checks.
   - Warning for slow read/write speeds below 50MB/s
   - Warning for low free space below 20GB
   - Warning if read/write latency is slow
   - Fatal for any errors reading or writing to the directory
   - Links to official docs for more info 
 - Access rules changes:
   - Denied folders won't show up in parent directory listing view ([issue #1684](https://github.com/gtsteffaniak/filebrowser/issues/1684))
   - Tools will respect access rules.
   - Shares will check access rules based on user that created the share.
 - Continue create user dir scope even if filesystem path creation fails ([issue #1509](https://github.com/gtsteffaniak/filebrowser/issues/1509)).
 - Access control cache is cleared more aggresively to ensure no delay.
 - Removed default `.ico` favicon in favor of `.svg`

**BugFixes**:
 - Passwords with special characters not working properly ([issue #1648](https://github.com/gtsteffaniak/filebrowser/issues/1648)).
 - Fix/Improve some behaviors in nextPrevious ([pr #1707](https://github.com/gtsteffaniak/filebrowser/pull/1707))
 - Files recognized as folder if they have the same name as previously deleted folders ([issue #1697](https://github.com/gtsteffaniak/filebrowser/issues/1697)).
 - Multi logger support issue ([issue #1701](https://github.com/gtsteffaniak/filebrowser/issues/1701))

**Full Changelog**: [v1.0.3-stable...v1.1.0-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.0.3-stable...v1.1.0-stable) -- **Release**: [v1.1.0-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.0-stable).

---

## [v1.0.3-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.0.3-stable)

**BugFixes**:
 - Download progress is not shown ([issue #1687](https://github.com/gtsteffaniak/filebrowser/issues/1687)).

**Full Changelog**: [v1.0.2-stable...v1.0.3-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.0.2-stable...v1.0.3-stable) -- **Release**: [v1.0.3-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.0.3-stable).

---

## [v1.0.2-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.0.2-stable)

**Notes**:
 - `[docker]` Upgraded ffmpeg 8.0 to 8.0.1

**BugFixes**:
 - Fixed HEIC conversion orientation support in the Docker image.
 - Uploading a file will silently overwrite any existing file with the same name ([issue #1564](https://github.com/gtsteffaniak/filebrowser/issues/1564)).
 - Unable to download folder as ZIP ([issue #1604](https://github.com/gtsteffaniak/filebrowser/issues/1604))
 - Issues downloading and file actions on password protected share.

**Full Changelog**: [v1.0.1-stable...v1.0.2-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.0.1-stable...v1.0.2-stable) -- **Release**: [v1.0.2-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.0.2-stable).

---

## [v1.0.1-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.0.1-stable)

**BugFixes**:
 - UserDefault always applies to newly created users ([issue #1518](https://github.com/gtsteffaniak/filebrowser/issues/1518))
 - Updating user's own password sometimes doesn't work.
 - Anonymous Share link with optional password does not allow downloads ([issue #1553](https://github.com/gtsteffaniak/filebrowser/issues/1553)).
 - Share options should go in the meta tags ([issue #1511](https://github.com/gtsteffaniak/filebrowser/issues/1511))
 - Unable to select compression format when downloading multiple files/dir via Share link (v1.0.0) ([issue #1557](https://github.com/gtsteffaniak/filebrowser/issues/1557)).
 - Fixed sidebar clipping on some browsers like safari.
 - Files show as Download is not available even though it is ([issue #1537](https://github.com/gtsteffaniak/filebrowser/issues/1537)).

**Full Changelog**: [v1.0.0-stable...v1.0.1-stable](https://github.com/gtsteffaniak/filebrowser/compare/v1.0.0-stable...v1.0.1-stable) -- **Release**: [v1.0.1-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.0.1-stable).

---

## [v1.0.0-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.0.0-stable)

{{% alert context="info" %}}
This is the initial stable release -- based on [v1.0.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.0.1-beta)

Wondering whether to use stable or beta? [Read this](https://filebrowserquantum.com/en/docs/getting-started/version/)

- **Stable** will get slower updates and will lag behind on features. This means stable will be _much less_ prone to surprise behavior from new changes.

- **Beta** is still the best option for those that can tolerate new features and the possible odd behaviors and bugs that might come from them.
{{% /alert %}}



**New Features**:
 - Login icon support added via `frontend.loginIcon` config path variable.

**Notes**:
 - Updated default login icon.
 - Stopped publishing rolling `dev` docker tag.
 - Build requirement change -- from node 18 > node 20 with npm 9.0.0+
 - Version is not shown for unauthenticated users ([issue #1444](https://github.com/gtsteffaniak/filebrowser/issues/1444))
 - Adjusted how static assets are served to better handle icon standards.
 - Fixed signup login ([issue #1444](https://github.com/gtsteffaniak/filebrowser/issues/1444))
 - Update makefile linker flags to properly set version and sha ([pr #1474](https://github.com/gtsteffaniak/filebrowser/pull/1474)).
 - Better windows build support -- `make setup` and `make dev` work as long as git is installed on windows.
 - Added better first initilization detection.
   - If filebrowser initialized and does not detect a database, a new warning message in server logs appears.
   - If theres no database on start, any admin user's first login will see a welcome message in the ui.
   - For docker, it defaults to ./data/database.db, but will also fallback to ./database.db without any additional configuration.

**BugFixes**:
 - Generating multiple HEIC previews in parallel fails ([issue #1470](https://github.com/gtsteffaniak/filebrowser/issues/1470)).
 - ? in path not always encoded right ([issue #1447](https://github.com/gtsteffaniak/filebrowser/issues/1447))
 - Fixed some condition that the halloween background doesn't load properly.
 - Some comments not showing up on config viewer in settings.

**Release**: [v1.0.0-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.0.0-stable).
