---
title: "Beta"
description: "See what changed in beta versions"
icon: "rocket_launch"
date: "2026-07-02T23:17:05Z"
lastmod: "2026-09-14T19:27:36Z"
---

{{% alert context="info" %}}
You can also check the releases on [GitHub!](https://github.com/gtsteffaniak/filebrowser/releases)
{{% /alert %}}

{{% alert context="warning" %}}
**v2.0.0** requires a config update and one-time database migration from v1.x. See {{< doclink path="getting-started/v2/migration/" text="Migration guide" />}} and {{< doclink path="getting-started/v2/about/" text="About v2.0.0" />}}.
{{% /alert %}}

---

## [v2.0.9-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v2.0.9-beta)

**Security**:
 - Fresh install with default `admin`/`admin` startup generates a random initial password and logs it once ([issue #2977](https://github.com/gtsteffaniak/filebrowser/issues/2977)). Updated documentation to follow.
 - OIDC login binds OAuth `state` to an HttpOnly cookie (crypto-random) and rejects tampered callbacks; post-login redirects must be same-app relative paths.
 - Login, logout, and session-expiry redirects reject open-redirect targets (`//`, `/\\`, off-site URLs); signup sends credentials in a JSON body instead of query parameters.

**Notes**:
 - Webdav always shows hidden files, ignores user preference. ([issue #3004](https://github.com/gtsteffaniak/filebrowser/issues/3004))
 - SQLite shared cache (`cache=shared`) removed from the application database connection: its table-lock conflicts bypass `busy_timeout` and fail immediately. WAL mode already allows concurrent readers.

**Bugfixes**:
 - Fixed intermittent blank page / blocked inline SPA script after CSP hardening ([issue #2995](https://github.com/gtsteffaniak/filebrowser/issues/2995))
 - ffmpeg unresponsive lock issue ([issue #2996](https://github.com/gtsteffaniak/filebrowser/issues/2996))
 - fixed token migration lockout regression from [v2.0.8-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v2.0.8-beta) ([issue #2999](https://github.com/gtsteffaniak/filebrowser/issues/2999))
 - Public shares with OnlyOffice disabled (`enableOnlyOffice=false`) now reject `/office/config` and `/office/callback` requests server-side instead of only hiding the editor in the UI
 - Session/API token registrations now record the JWT expiry; expired mappings are pruned at startup, and tokens expired beyond the same 2-minute grace window used for session rotation no longer resolve a user identity on public share routes
 - Startup now fails when the configured/env auth signing key differs from the key persisted in the application database, instead of warning and minting tokens with divergent keys
 - OnlyOffice document downloads now re-validate redirect targets against the configured document-server host, closing an SSRF gap where a redirect could send the fetch to an internal address
 - OnlyOffice "closed with changes" callbacks now keep the document key until the save succeeds, so a failed save can be retried by the document server instead of being rejected as an unknown session
 - External JWT (JwtAuth) requests now reuse an existing valid session cookie instead of minting and registering a new session token on every request
 - SQLite index and application databases configure `busy_timeout` on every pooled connection, and busy/locked detection now uses driver result codes; index batch writes and maintenance no longer report success when the DB stays busy, and index cache reads return busy errors instead of empty results so listing can fall back to the filesystem.

**Full Changelog**: [v2.0.8-beta...v2.0.9-beta](https://github.com/gtsteffaniak/filebrowser/compare/v2.0.8-beta...v2.0.9-beta)

---

## [v2.0.8-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v2.0.8-beta)

**Security**:
 - [Critical] A forged JWT could authenticate as any known `belongsTo`. Auth signing keys are now persisted in the application database and JWT validation fails closed when no key is configured. (GHSA-8f9r-wg7w-pfw) ([pr #2987](https://github.com/gtsteffaniak/filebrowser/pull/2987)) Thanks [@d3do-23](https://github.com/d3do-23) and [@whoamis3c](https://github.com/whoamis3c).
 - [Medium] Public upload shares with replacements disabled (`allowReplacements=false`) now reject overwrites when clients send `override=true`. (GHSA-3846-gh75-gp3m) Thanks [@d3do-23](https://github.com/d3do-23)
 - [Medium] OnlyOffice document-server callbacks now verify the shared `integrations.office.secret` JWT (HS256), reject unsigned callback bodies when a secret is configured, and require the callback document key to match the cached editor session for the target path (fail closed on cache miss or path lookup failure).

**New Features**:
 - add "Upload only what's missing" to the upload conflict prompt ([pr #2985](https://github.com/gtsteffaniak/filebrowser/pull/2985)) ([issue #2553](https://github.com/gtsteffaniak/filebrowser/issues/2553))

**Notes**:
 - Improved UI responsiveness for larger directories and firefox, marginal improvement to memory ([issue #1773](https://github.com/gtsteffaniak/filebrowser/issues/1773)) ([issue #2879](https://github.com/gtsteffaniak/filebrowser/issues/2879))
 - `/api/resources/download` and `/public/api/resources/download` now return HTTP 404 when the requested file or directory does not exist, instead of 500 ([issue #2981](https://github.com/gtsteffaniak/filebrowser/issues/2981))
 - `GET /api/resources` returns 400 when the `path` query parameter is missing or empty instead of 500 ([issue #2801](https://github.com/gtsteffaniak/filebrowser/issues/2801))

**Bugfixes**:
 - Public share folder and multi-file ZIP downloads were empty for anonymous visitors when the source used deny-by-default or path access rules ([issue #2631](https://github.com/gtsteffaniak/filebrowser/issues/2631)) ([issue #2365](https://github.com/gtsteffaniak/filebrowser/issues/2365))
 - 401 on pdf download button action ([pr #2978](https://github.com/gtsteffaniak/filebrowser/pull/2978))
 - OnlyOffice saves could no-op with HTTP 200 when JWT was enabled: callback POST bodies wrapped in `token` were ignored and JWT parsing omitted fields such as `url` required to download the updated document from the Document Server.

**All Changes**:
* Fix dev build by [@gtsteffaniak](https://github.com/gtsteffaniak) in [pr #2971](https://github.com/gtsteffaniak/filebrowser/pull/2971)
* cleanup pdf issues and small styling by [@gtsteffaniak](https://github.com/gtsteffaniak) in [pr #2978](https://github.com/gtsteffaniak/filebrowser/pull/2978)
* updated getters for ismobile by [@gtsteffaniak](https://github.com/gtsteffaniak) in [pr #2979](https://github.com/gtsteffaniak/filebrowser/pull/2979)
* Ismobile changes by [@gtsteffaniak](https://github.com/gtsteffaniak) in [pr #2980](https://github.com/gtsteffaniak/filebrowser/pull/2980)
* add performance tuning report by [@gtsteffaniak](https://github.com/gtsteffaniak) in [pr #2982](https://github.com/gtsteffaniak/filebrowser/pull/2982)
* Auth signing key and token migration by [@gtsteffaniak](https://github.com/gtsteffaniak) in [pr #2987](https://github.com/gtsteffaniak/filebrowser/pull/2987)
* Improve scrolling performance by [@gtsteffaniak](https://github.com/gtsteffaniak) in [pr #2986](https://github.com/gtsteffaniak/filebrowser/pull/2986)
* feat(upload): add "Upload only what's missing" to the upload conflict prompt by [@FandacqkaCorp](https://github.com/FandacqkaCorp) in [pr #2985](https://github.com/gtsteffaniak/filebrowser/pull/2985)
* fixed public replacement by [@gtsteffaniak](https://github.com/gtsteffaniak) in [pr #2988](https://github.com/gtsteffaniak/filebrowser/pull/2988)
* fix onlyoffice callback verification by [@gtsteffaniak](https://github.com/gtsteffaniak) in [pr #2989](https://github.com/gtsteffaniak/filebrowser/pull/2989)
* add resources 404 and 400 response by [@gtsteffaniak](https://github.com/gtsteffaniak) in [pr #2990](https://github.com/gtsteffaniak/filebrowser/pull/2990)

**Full Changelog**: [v2.0.2-beta...v2.0.8-beta](https://github.com/gtsteffaniak/filebrowser/compare/v2.0.2-beta...v2.0.8-beta)

---

## [v2.0.7-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v2.0.7-beta)

**New Features**:
 - Add cli init CLI command ([pr #2957](https://github.com/gtsteffaniak/filebrowser/pull/2957))

**Notes**:
 - Pop-up preview has 200ms debounce delay so it doesn't flash from moving the cursor across files quickly. 
 - Added risc-v to official releases

**Bugfixes**:
 - Hide the Replace option on upload/create conflict prompts when the user lacks modify permission (or when a public share disallows replacements), so create-only users are not offered an action that the server rejects ([issue #2837](https://github.com/gtsteffaniak/filebrowser/issues/2837))
 - Preserve Ctrl-click file selection when keyboard state is stale ([pr #2958](https://github.com/gtsteffaniak/filebrowser/pull/2958)) ([issue #2923](https://github.com/gtsteffaniak/filebrowser/issues/2923))
 - Avoid false stalls during parallel transfers ([pr #2950](https://github.com/gtsteffaniak/filebrowser/pull/2950)) ([issue #2948](https://github.com/gtsteffaniak/filebrowser/issues/2948)) thanks [@gudcks0305](https://github.com/gudcks0305)
 - Cap source usage-bar percentage at 100% when indexed size exceeds partition total ([issue #2761](https://github.com/gtsteffaniak/filebrowser/issues/2761)) ([issue #2238](https://github.com/gtsteffaniak/filebrowser/issues/2238))
 - On Linux, source partition totals sum distinct filesystems mounted under the source root (nested mounts) so usage bars match indexed content ([issue #2761](https://github.com/gtsteffaniak/filebrowser/issues/2761))

**All Changes**:
* fix(upload): avoid false stalls during parallel transfers by [@gudcks0305](https://github.com/gudcks0305) in [pr #2950](https://github.com/gtsteffaniak/filebrowser/pull/2950)
* fix: preserve Ctrl-click file selection when keyboard state is stale by [@mvanhorn](https://github.com/mvanhorn) in [pr #2958](https://github.com/gtsteffaniak/filebrowser/pull/2958)
* detect more platform types by [@gtsteffaniak](https://github.com/gtsteffaniak) in [pr #2952](https://github.com/gtsteffaniak/filebrowser/pull/2952)
* Popup debounce by [@gtsteffaniak](https://github.com/gtsteffaniak) in [pr #2961](https://github.com/gtsteffaniak/filebrowser/pull/2961)
* Add cli init command by [@zumbiepig](https://github.com/zumbiepig) in [pr #2957](https://github.com/gtsteffaniak/filebrowser/pull/2957)
* fix a few usage reporting bugs by [@gtsteffaniak](https://github.com/gtsteffaniak) in [pr #2963](https://github.com/gtsteffaniak/filebrowser/pull/2963)
* Backport risc v release by [@gtsteffaniak](https://github.com/gtsteffaniak) in [pr #2964](https://github.com/gtsteffaniak/filebrowser/pull/2964)
* Update deps v2.0.7 by [@gtsteffaniak](https://github.com/gtsteffaniak) in [pr #2965](https://github.com/gtsteffaniak/filebrowser/pull/2965)
* hide replace option for users without modify permission by [@gtsteffaniak](https://github.com/gtsteffaniak) in [pr #2966](https://github.com/gtsteffaniak/filebrowser/pull/2966)

**Full Changelog**: [v2.0.6-beta...v2.0.7-beta](https://github.com/gtsteffaniak/filebrowser/compare/v2.0.6-beta...v2.0.7-beta)

---

## [v2.0.6-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v2.0.6-beta)

**Security**:
 - Share download links no longer create links with token, instead they link to the UI prompting for password before download. If a direct download is required, the `/api/share/direct` api exists and documented by swagger ([issue #2888](https://github.com/gtsteffaniak/filebrowser/issues/2888)).

**Notes**:
 - Renaming sources updates sidebar links ([issue #2878](https://github.com/gtsteffaniak/filebrowser/issues/2878)).
 - Disabling/deleting a user source removes that source from sidebar links ([issue #2942](https://github.com/gtsteffaniak/filebrowser/issues/2942)).

**Bugfixes**:
 - Fixed disk-usage overstatement on virtiofs bind mounts ([issue #2894](https://github.com/gtsteffaniak/filebrowser/issues/2894)) ([issue #2894](https://github.com/gtsteffaniak/filebrowser/issues/2894)).
 - Support non-ASCII share passwords ([pr #2933](https://github.com/gtsteffaniak/filebrowser/pull/2933)).
 - Fall back to buffered copies when FUSE rejects fast paths ([pr #2938](https://github.com/gtsteffaniak/filebrowser/pull/2938)) ([issue #2924](https://github.com/gtsteffaniak/filebrowser/issues/2924)).
 - Preserve deleted sidebar links across restarts ([pr #2935](https://github.com/gtsteffaniak/filebrowser/pull/2935)).

**Full Changelog**: [v2.0.5-beta...v2.0.6-beta](https://github.com/gtsteffaniak/filebrowser/compare/v2.0.5-beta...v2.0.6-beta)

---

## [v2.0.5-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v2.0.5-beta)

**Security**:
 - [Moderate] public metadata api returns file content to anonymous share visitors, ignoring the share's download limit and file-viewer setting (GHSA-55mw-cwg7-m8f5) -- thanks [@kta1kri](https://github.com/kta1kri)

**New Features**:
 - Users can set default view mode and thumbnail size from Profile settings (Listing options). Admins can set the same defaults for existing users from the user edit prompt. Values persist to the account and apply on new browsers or devices; they do not override view preferences already saved locally ([issue #2884](https://github.com/gtsteffaniak/filebrowser/issues/2884)).
 - Admins can edit all profile preference defaults for existing users from the user management panel (listing, preview, sidebar, theme, and related options), matching what was previously available only for new users and global user defaults.

**Bugfixes**:
 - Fixed infinite loading spinner on `/` and `/login` after CSP security hardening ([issue #2886](https://github.com/gtsteffaniak/filebrowser/issues/2886)) ([issue #2890](https://github.com/gtsteffaniak/filebrowser/issues/2890))
 - Fixed darkmode styling bug where background wouldn't respect configured settings when not logged in
 - Fixed styling bug where padding was missing from right side of listing view.
 - Tilde paths for sources were not properly expanded. (eg "~" for home)
 - Fixed tooltip not showing up for some circumstances on mobile, improved consistency.
 - A few styling fixes for inconsistencies ([pr #2908](https://github.com/gtsteffaniak/filebrowser/pull/2908))

---

## [v2.0.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v2.0.4-beta)

- Fixed onlyoffice failing to load due to strict csp security requirement ([pr #2876](https://github.com/gtsteffaniak/filebrowser/pull/2876))

**Full Changelog**: [v2.0.3-beta...v2.0.4-beta](https://github.com/gtsteffaniak/filebrowser/compare/v2.0.3-beta...v2.0.4-beta)

---

## [v2.0.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v2.0.3-beta)

**Security**:
 - [High] Stored XSS via HTML preview: strip `<script>` from sanitized srcdoc, remove `allow-same-origin` from the preview iframe sandbox, set HttpOnly on the session cookie, and add a nonce-based `script-src` CSP on the SPA shell (GHSA-vvm6-jwrf-hgmg) -- thanks [@qrn12580](https://github.com/qrn12580)
 - [Moderate] Non-admin users could PATCH privileged fields on their own account (scopes, permissions, etc.), allowing privilege escalation; restores v1 non-admin field guard on PATCH /api/users (GHSA-p5cc-4p84-c4m2) -- thanks [@Chri6s](https://github.com/Chri6s)

**New Features**:
 - Added option to globally disable the "Install App" message via `frontend.disablePWAInstall`
 - PWA improvements for installed mobile apps: dedicated maskable icons (192/512), manifest and splash colors that follow the instance default theme, runtime `theme-color` sync on dark-mode toggle, and edge-to-edge safe-area layout for notched devices ([pr #2625](https://github.com/gtsteffaniak/filebrowser/pull/2625)) ([pr #2869](https://github.com/gtsteffaniak/filebrowser/pull/2869)) -- thanks [@APatenaude](https://github.com/APatenaude)

**Bugfixes**:
 - Fixed Fuji `.raf` thumbnail preview by extracting the camera-embedded JPEG from the RAF header (regression for files where TIFF-based raw extraction does not apply).
 - Image previews for unsupported decodable formats now return HTTP 415 immediately instead of attempting JPEG decode and returning HTTP 500.
 - OIDC: preserve the verified ID-token user identifier when falling back to the UserInfo endpoint for missing groups, so login no longer fails with HTTP 500 when UserInfo returns groups but omits the configured identifier.
 - LDAP: restore `memberOf` as the default `groupsClaim` when unset, fixing group-based admin and login authorization for existing LDAP configs after the v2.0.2 default changed to `groups`.
 - "Install app" message reappears after being cleared on device.
 - Restored upload chunk size `0` to disable chunking as documented ([issue #2202](https://github.com/gtsteffaniak/filebrowser/issues/2202)).
 - Fixed iOS 26 / WebKit multi-chunk upload stall by isolating chunk connections and returning partial chunk JSON responses ([issue #2734](https://github.com/gtsteffaniak/filebrowser/issues/2734)).
 - Sidebar folder links with custom names, icons, or styles no longer disappear after restart; multiple shortcuts to different folders on the same source are preserved ([issue #2809](https://github.com/gtsteffaniak/filebrowser/issues/2809)).
 - Adding a source to a user via scopes now auto-adds a matching sidebar link; removing a source keeps the link (shown disabled) so users can delete it manually.
 - A password reset via CLI returns user to a password method user.
 - Authentication login methods are consistently enforced without modifying existing account settings.

**Full Changelog**: [v2.0.2-beta...v2.0.3-beta](https://github.com/gtsteffaniak/filebrowser/compare/v2.0.2-beta...v2.0.3-beta)

---

## [v2.0.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v2.0.2-beta)

**Bugfixes**:
 - OIDC: `groupsClaim` value is always included in requested scopes and falls back to the UserInfo endpoint when the ID token omits the groups claim.
 - Windows: fix backslash duplication in navigation URLs, folder sizes showing 4 KB, and download/preview failures ([issue #2815](https://github.com/gtsteffaniak/filebrowser/issues/2815)) ([issue #2816](https://github.com/gtsteffaniak/filebrowser/issues/2816))
 - Wrong extension in the 'new database was created popup ([issue #2817](https://github.com/gtsteffaniak/filebrowser/issues/2817)) ([pr #2824](https://github.com/gtsteffaniak/filebrowser/pull/2824))
 - External subtitles fail to load on public video shares due to authenticated subtitle endpoint ([issue #2822](https://github.com/gtsteffaniak/filebrowser/issues/2822)) ([pr #2827](https://github.com/gtsteffaniak/filebrowser/pull/2827))
 - OnlyOffice is inaccessible on password-protected shares ([issue #2811](https://github.com/gtsteffaniak/filebrowser/issues/2811))
 - FFmpeg 9.0 incorrectly detected as below minimum 5.0.0 on Windows ([issue #2820](https://github.com/gtsteffaniak/filebrowser/issues/2820)) -- thanks [@yzxcj797](https://github.com/yzxcj797)

**Full Changelog**: [v2.0.1-beta...v2.0.2-beta](https://github.com/gtsteffaniak/filebrowser/compare/v2.0.1-beta...v2.0.2-beta)

---

## [v2.0.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v2.0.1-beta)

**Security**:
 - [High] Symlink following on read paths no longer escapes source or user/share scope (GHSA-mgqf-5mf5-prfj) -- thanks [@je-lv](https://github.com/je-lv) [@KasperBuilds](https://github.com/KasperBuilds)
 - [Moderate] Absolute paths in API path/file parameters could bypass user scope and read files outside the source mount (GHSA-rqqq-wv83-rp74) -- thanks [@Wei-Leo](https://github.com/Wei-Leo)
 - [Moderate] Logout did not invalidate session JWTs with equivalent Base64URL spellings (GHSA-8m35-wcjh-95q7) -- thanks [@corbanvilla](https://github.com/corbanvilla) [@soh3e](https://github.com/soh3e) [@dderpym](https://github.com/dderpym) (This vulnerability was discovered as part of a U.C. Berkeley security research project by: Corban Villa, Sohee Kim, and Austin Chu)
 - [Moderate] Stored XSS via unsanitized DOCX hyperlink in DocViewer (GHSA-9wm6-jcjh-3m8c) -- thanks [@karen93shieh](https://github.com/karen93shieh) [@je-lv](https://github.com/je-lv) [@EclipsSec](https://github.com/EclipsSec)
 - [Moderate] Revoked JWTs could still authenticate on public-share and withOrWithoutUser routes until natural expiry, bypassing logout and Api-permission revocation on that surface (GHSA-4wmj-rq3c-m65v) -- thanks [@hypnguyen1209](https://github.com/hypnguyen1209)

**Notes**:
 - GroupMap `SyncUserGroups` fix so JWT/OIDC/LDAP group memberships survive restart ([issue #2742](https://github.com/gtsteffaniak/filebrowser/issues/2742)).
 - Session renew is handled by client keep-alive. removed per-request `X-Renew-Token` header handling.
 - Improvements to document thumbnail generation performance.
 - behavior changes for typing to select files in listing view.
 - next/previous buttons don't hide automatically on photos ([issue #2767](https://github.com/gtsteffaniak/filebrowser/issues/2767))
 - added more actions available in advanced search ([issue #2776](https://github.com/gtsteffaniak/filebrowser/issues/2776))

**Bugfixes**:
 - GroupMap mutations (`SyncUserGroups`, add/remove group members) are write-through to SQL so JWT/OIDC/LDAP group memberships survive restart ([issue #2742](https://github.com/gtsteffaniak/filebrowser/issues/2742)).
 - `defaultEnabled` behavior change/fix so defaultEnabled means its always added to users on startup and login. (updated docs too)
 - Long uploads/downloads no longer lose the session mid-transfer: proactive session JWT keep-alive renews before expiry ([issue #2638](https://github.com/gtsteffaniak/filebrowser/issues/2638)).
 - Disable auto logout/session expiry if there are active file transfers going ([issue #2638](https://github.com/gtsteffaniak/filebrowser/issues/2638))
 - upload options get cut off on mobile ([issue #2685](https://github.com/gtsteffaniak/filebrowser/issues/2685))
 - Uploading image: image gets cut-off ([issue #2765](https://github.com/gtsteffaniak/filebrowser/issues/2765))
 - Process aborts (not just 500) during PDF thumbnail generation ([issue #2763](https://github.com/gtsteffaniak/filebrowser/issues/2763))
 - PDF preview generation prevents file uploads from completing ([issue #2752](https://github.com/gtsteffaniak/filebrowser/issues/2752))
 - Brings back double-tap to zoom images that was mistakenly removed.
 - multiple embedded subtitles with same language bug ([issue #2756](https://github.com/gtsteffaniak/filebrowser/issues/2756))
 - gallery view download button missing ([issue #2767](https://github.com/gtsteffaniak/filebrowser/issues/2767))
 - fixed HEIC rotation regression from v1.5.x
 - fixed raw image preview regression from v1.5.x
 - html viewer takes full height
 - Members without download permission receive 403 when opening text-based files despite OnlyOffice preview being enabled ([issue #2777](https://github.com/gtsteffaniak/filebrowser/issues/2777))

**Full Changelog**: [v2.0.0-beta...v2.0.1-beta](https://github.com/gtsteffaniak/filebrowser/compare/v2.0.0-beta...v2.0.1-beta)

---

## [v2.0.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v2.0.0-beta)

This version is the most significant change to date. It **requires** both a database migration and config structural changes. Use the {{< doclink path="getting-started/v2/config-migration/" text="config migration tool" />}} before upgrading from v1.x.

 **Breaking Changes**:
 - Removed: `GET /api/raw` and `GET /public/api/raw` download routes — use `/api/resources/download` instead.
 - Removed: `/share/…` URL redirect to `/public/share/…` — use `/public/share/…` directly.
 - Removed: singular `source` search api param (use `sources`), bare `scope` paths without `sourceName:` prefix, and `glob` / `useGlob` aliases (use `useWildcard`).
 - Removed `config.conditionals`, source-level `indexingIntervalMinutes` (indexing always uses adaptive scheduling), and deprecated rule fields `fileNames` / `folderNames` / top-level `hidden` — use `config.rules` with `fileName`, `folderName`, and `ignoreHidden` on rules. See {{< doclink path="access-control/rules/" text="Exclusion rules" />}}.
 - Removed: deprecated flat `userDefaults` config formats — use the {{< doclink path="getting-started/v2/config-migration/" text="config migration tool" />}} before upgrading.
 - Changed: `PUT /api/users` moved to `PATCH`. User updates are granular (partial payloads, not full user objects). Blank or `all` values for `which` are rejected.
 - Changed: HTTP-related config options moved from `server` to `http`. See {{< doclink path="configuration/http/" text="HTTP settings" />}}.
 - Changed (reverse proxy): `http.trustedHeaders` (v1.4.x–v1.5.x list) removed — use `http.trustProxyHeaders: true` when behind nginx, Traefik, or Caddy. See {{< doclink path="configuration/http/#trustproxyheaders" text="trustProxyHeaders" />}} and {{< doclink path="getting-started/reverse-proxy/" text="Reverse proxy" />}}.
 - Changed: `FILEBROWSER_DATABASE` environment variable removed — use `FILEBROWSER_DATABASE_PATH` or `server.database.path`. See {{< doclink path="reference/environment-variables/" text="Environment variables" />}}.
 - Changed: Stream API moved to `/api/media/stream`. Inline non-media viewing uses `GET /api/resources/view` (both use `viewToken` from file metadata). See {{< doclink path="reference/api/" text="API reference" />}}.
 - Changed: CLI user management — canonical commands are `user set <username> --password [value]` and `user promote <username>`; `set -u` is deprecated. See {{< doclink path="reference/cli/" text="CLI reference" />}}.
 - Changed: File permissions (**view**, **download**, **modify**, **create**, **delete**) are **per source**, not global. Global permissions are **admin**, **api**, **share**, and **realtime** only. **`view` is new** — browsing and UI preview are separate from download. See {{< doclink path="features/user-permissions/" text="User permissions" />}}.
 - Changed: Default file-operation permissions moved from `userDefaults.permissions` to **Settings → Access management** (and `server.sources[].config.defaultPermissions`). See {{< doclink path="features/user-permissions/" text="User permissions" />}}.

 **New Features**:
 - **Activity Viewer** — semantic audit log with interactive charts, table reports, and CSV export. Configurable retention (default 30 days), optional disable, and buffered writes (default 10 second flush interval). See {{< doclink path="features/activity/" text="Activity Viewer" />}}.
 - **Per-source permissions** — view, download, modify, create, delete on each user scope; deployment-wide defaults and optional **Enforce** for all non-admin users in Access management. See {{< doclink path="features/user-permissions/" text="User permissions" />}}.
 - **User defaults** — universal template for new users (profile, preview, sidebar, uploads, global admin/api/share/realtime); admins can **Enforce** individual fields and resync all non-admin users. See {{< doclink path="features/user-defaults/" text="User defaults" />}}.
 - **View vs download** — separate grants; inline UI preview via `viewToken` does not count as a download in permissions or activity logs.
 - **Media player improvements**:
   - Refreshed playback queue UI with thumbnails, session storage, and a clear-queue button ([#2575](https://github.com/gtsteffaniak/filebrowser/issues/2575)) ([#2600](https://github.com/gtsteffaniak/filebrowser/pull/2600)).
   - Loop modes: off, single, and all — none clear the existing queue ([#2600](https://github.com/gtsteffaniak/filebrowser/pull/2600)).
   - Audio visualizer for desktop ([#2575](https://github.com/gtsteffaniak/filebrowser/issues/2575)) ([#2620](https://github.com/gtsteffaniak/filebrowser/pull/2620)).
   - Audio panel state stored in local storage.
   - Gestures: swipe up for fullscreen, long-press for playback speed, single tap to pause ([#2575](https://github.com/gtsteffaniak/filebrowser/issues/2575)).
   - Videos resume fullscreen and PiP when navigating ([#2649](https://github.com/gtsteffaniak/filebrowser/pull/2649)).
 - Added `F4` shortcut to refresh the current directory and metadata ([#2600](https://github.com/gtsteffaniak/filebrowser/pull/2600)).
 - Opt-in deployment analytics — anonymized monthly config snapshot with in-app preview before sending.
 - WebDAV: set modification time via `X-OC-Mtime` header ([#2626](https://github.com/gtsteffaniak/filebrowser/pull/2626)). See {{< doclink path="features/webdav/" text="WebDAV" />}}.
 - Copy operations preserve original modification times ([#2642](https://github.com/gtsteffaniak/filebrowser/issues/2642)) ([#2647](https://github.com/gtsteffaniak/filebrowser/pull/2647)) — WebUI: files and directories; WebDAV `COPY`: files only.
 - User defaults editor in Settings and in the create/edit user prompt. See {{< doclink path="configuration/users/" text="User management" />}}.
 - CLI: `user set` with `--password` (inline, TTY prompt, or piped stdin); `user promote` for admin without password reset.

 **Notes**:
 - v2.x uses write-through state management — in-memory caches with reliable on-disk persistence. See {{< doclink path="getting-started/v2/about/#new-state-management-architecture" text="About v2.0.0" />}}.
 - Changing a **default** (User defaults or Access management permission defaults) does **not** update existing users — use **Enforce** or edit users individually. See {{< doclink path="features/user-permissions/" text="User permissions" />}}.
 - Access allow/deny rules control path visibility; they do **not** replace create/modify/delete scope permissions.
 - `user.id` is a backend property; frontend APIs use **username**. Swagger updated.
 - Removed legacy properties from API responses and generated config output.
 - Image metadata and rotation handling always built with supported libraries (64-bit OS required).
 - Default browser media player option removed — always uses themed plyr.
 - Swipe gestures to dismiss notifications ([#2672](https://github.com/gtsteffaniak/filebrowser/pull/2672)).
 - Refreshed dropdown and input styles.
 - [docker] Upgraded ffmpeg from 8.1.2 to 9.0.
 - If migration issues arise, see {{< doclink path="getting-started/migration/troubleshooting/" text="Migration troubleshooting" />}}.

**Documentation**:
 - New feature guides: {{< doclink path="features/user-permissions/" text="User permissions" />}}, {{< doclink path="features/user-defaults/" text="User defaults" />}}, {{< doclink path="features/activity/" text="Activity Viewer" />}}.
 - Updated {{< doclink path="getting-started/v2/about/" text="About v2.0.0" />}} with feature spotlight cards and clearer permission/default behavior.

---

## [v1.5.5-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.5-beta)

 **BugFixes**:
 - Fixed uncustomized (minimal) API token creation needed by WebDAV clients ([issue #2503](https://github.com/gtsteffaniak/filebrowser/issues/2503)).

**Full Changelog**: [v1.5.4-beta...v1.5.5-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.5.4-beta...v1.5.5-beta) -- **Release**: [v1.5.5-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.5-beta)

---

## [v1.5.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.4-beta)

 **Notes**:
 - PWA installation name now capped at 30 characters instead of 12 ([issue #2699](https://github.com/gtsteffaniak/filebrowser/issues/2699)).

 **BugFixes**:
 - Fixed forward slash blocked in text fields when the search shortcut listener intercepts `/` ([issue #2696](https://github.com/gtsteffaniak/filebrowser/issues/2696)).

**Full Changelog**: [v1.5.3-beta...v1.5.4-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.5.3-beta...v1.5.4-beta) -- **Release**: [v1.5.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.4-beta)

---

## [v1.5.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.3-beta)

 **BugFixes**:
 - Fixed probe `canShare` with the real file, not a fixed `text/plain` stand-in ([issue #2664](https://github.com/gtsteffaniak/filebrowser/issues/2664)).
 - When the logout button is pressed, the user is redirected to an invalid URL that does not honor `baseURL` / `externalUrl` ([issue #2657](https://github.com/gtsteffaniak/filebrowser/issues/2657)).
 - Fixed redirect to login when an authenticated request returns 401 (expired session).

**Full Changelog**: [v1.5.2-beta...v1.5.3-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.5.2-beta...v1.5.3-beta) -- **Release**: [v1.5.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.3-beta)

---

## [v1.5.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.2-beta)

 **Notes**:
 - [docker] Upgraded ffmpeg version 8.1 to 8.1.2

 **BugFixes**:
 - Fixed OnlyOffice reopening an older editor state after a document is modified ([pr #2633](https://github.com/gtsteffaniak/filebrowser/pull/2633)) ([issue #2578](https://github.com/gtsteffaniak/filebrowser/issues/2578)).
 - Cannot "Reset and generate new two-factor code" to reset the TOTP for a user ([pr #2641](https://github.com/gtsteffaniak/filebrowser/pull/2641))([issue #2399](https://github.com/gtsteffaniak/filebrowser/issues/2399)).

**Full Changelog**: [v1.5.1-beta...v1.5.2-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.5.1-beta...v1.5.2-beta) -- **Release:**: [v1.5.2-beta](https://github.com/gtsteffaniak/filebrowser/releases#release-v1.5.2-beta)

---

## [v1.5.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.1-beta)

**BugFixes**:
 - Fixed http config section being dropped so trustedHeaders and disableRateLimit apply ([pr #2602](https://github.com/gtsteffaniak/filebrowser/pull/2602)) ([issue #2560](https://github.com/gtsteffaniak/filebrowser/issues/2560)).
 - Fixed upload shares with password ([pr #2560](https://github.com/gtsteffaniak/filebrowser/pull/2589)) ([issue #2465](https://github.com/gtsteffaniak/filebrowser/issues/2465)).
 - Fixed token when returning from preview on shares with pass ([pr #2588](https://github.com/gtsteffaniak/filebrowser/pull/2588)) ([issue #2573](https://github.com/gtsteffaniak/filebrowser/issues/2573)).
 - Fixed share undefined url after editing a existent share ([pr #2567](https://github.com/gtsteffaniak/filebrowser/pull/2567)) ([issue #2523](https://github.com/gtsteffaniak/filebrowser/issues/2523)).

**Full Changelog**: [v1.5.0-beta...v1.5.1-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.5.0-beta...v1.5.1-beta) -- **Release**: [v1.5.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.1-beta).

---

## [v1.5.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.0-beta)

**New Features**:
 - Added basic `html` viewer with relative reference support ([issue #2522](https://github.com/gtsteffaniak/filebrowser/issues/2522)).
 - Shares can have pinned files, requires a user to have edit access to share.
 - Enhanced search:
   - Now uses "lazy" match by default ([issue #2509](https://github.com/gtsteffaniak/filebrowser/issues/2509)).
   - Added missing `case sensitive` option in the UI.
 - Progressive Web App (PWA) improvements:
   - Restored install prompt with sidebar install button ([issue #2086](https://github.com/gtsteffaniak/filebrowser/issues/2086)).
   - Camera and video capture buttons on upload (mobile-friendly `capture` inputs).
   - Send files to other apps via the Web Share API (`Send to app` in the context menu).
 - App notifications for file operations ([issue #2478](https://github.com/gtsteffaniak/filebrowser/issues/2478)).
   - Optional browser notifications when uploads, chunked downloads, move/copy, or failures finish while the tab is in the background.
   - Single on/off toggle in Notifications settings, stored in browser local storage.

**Notes**:
 - [Docker] Upgraded ffmpeg version `8.1` to `8.1.1`.

**BugFixes**:
 - Fixed PWA manifest `scope` and `id` so install works when the app is served under a base URL.
 - Installing a public share as a PWA now opens the share URL instead of the site root ([issue #2302](https://github.com/gtsteffaniak/filebrowser/issues/2302)).
 - Fix eslint-security linting errors ([pr #2539](https://github.com/gtsteffaniak/filebrowser/pull/2539)).

**Full Changelog**: [v1.4.4-beta...v1.5.0-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.4.4-beta...v1.5.0-beta) -- **Release**: [v1.5.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.5.0-beta).

---

## [v1.4.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.4.4-beta)

**BugFixes**:
 - Pinning/Unpinning file resets user's scope permission ([issue #2532](https://github.com/gtsteffaniak/filebrowser/issues/2532)).

**Full Changelog**: [v1.4.3-beta...v1.4.4-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.4.3-beta...v1.4.4-beta) -- **Release**: [v1.4.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.4.4-beta).


---

## [v1.4.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.4.3-beta)

{{% alert context="danger" %}}
Pinning items has a bug that can overwrite the users information with defaults.  Please do not use this release, a follow-up release will be made with a fix.
{{% /alert %}}

**Security**:
 - [High] Path traversal in subtitle handler allows any authenticated user to read arbitrary files ([GHSA-vvp7-h4fj-m28w](https://github.com/gtsteffaniak/filebrowser/security/advisories/GHSA-vvp7-h4fj-m28w))

**New Features**:
 - Pinned files/folders ([pr #2510](https://github.com/gtsteffaniak/filebrowser/pull/2510)) ([pr #2396](https://github.com/gtsteffaniak/filebrowser/pull/2396)).
 - Markdown Image relative reference support ([issue #2355](https://github.com/gtsteffaniak/filebrowser/issues/2355)).
 - Add an option to create a new folder for unarchiving ([issue #2338](https://github.com/gtsteffaniak/filebrowser/issues/2338)).

**Notes**:
 - Added fallback to show text in notification if copy fails ([pr #2517](https://github.com/gtsteffaniak/filebrowser/pull/2517)).
 - Added `alt`+`arrow up` shortcut as alias of `backspace` to go into parent directory ([issue #2501](https://github.com/gtsteffaniak/filebrowser/issues/2501)) ([pr #2521](https://github.com/gtsteffaniak/filebrowser/pull/2521))
 - Added `alt`+`arrow down` shortcut as alias of `enter` to open files in Listing View ([issue #2501](https://github.com/gtsteffaniak/filebrowser/issues/2501)) ([pr #2521](https://github.com/gtsteffaniak/filebrowser/pull/2521))
 - Updated help menu with better translations.
 - Migrate `vue-i18n` to `v11` + lazy load languages ([pr #2504](https://github.com/gtsteffaniak/filebrowser/pull/2504)) ([issue #2472](https://github.com/gtsteffaniak/filebrowser/issues/2472)).
 - Migrate `eslint` to `v10` + lint fix ([pr #2488](https://github.com/gtsteffaniak/filebrowser/pull/2488)) ([issue #2459](https://github.com/gtsteffaniak/filebrowser/issues/2459)).
 - Improved preview cancellation to improve performance when navigating UI.

**BugFixes**:
 - Fix lyrics regex parsing ([pr #2505](https://github.com/gtsteffaniak/filebrowser/pull/2505)).
 - Fix folder previews issue ([pr #2487](https://github.com/gtsteffaniak/filebrowser/pull/2487)) ([issue #2492](https://github.com/gtsteffaniak/filebrowser/issues/2492)).
 - Fix accidental exit on images while using gestures ([pr #2508](https://github.com/gtsteffaniak/filebrowser/pull/2508)).
 - Navigating using the up/down arrow keys in Listing View was "jumping randomly" in some view modes ([pr #2521](https://github.com/gtsteffaniak/filebrowser/pull/2521)).
 - Socket field in `config.yaml` is ignored ([issue #2497](https://github.com/gtsteffaniak/filebrowser/issues/2497)).
 - Fix keep opened file selected after closing its preview [@anpryl](https://github.com/anpryl) ([pr #2515](https://github.com/gtsteffaniak/filebrowser/pull/2515)).

**Full Changelog**: [v1.4.2-beta...v1.4.3-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.4.2-beta...v1.4.3-beta) -- **Release**: [v1.4.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.4.3-beta).

---

## [v1.4.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.4.2-beta)

{{% alert context="info" %}}
If you are running behind a proxy, please update your trusted headers to have the rate limits and logging apply correctly.
{{% /alert %}}

See {{< doclink path="getting-started/reverse-proxy/#client-ip-and-trusted-headers" text="updated docs" />}} and 
example new http config:

```
http:
  disableRateLimit: false # enable if you don't want rate limiting for auth routes.
  trustedHeaders:
    - X-Forwarded-For
    - X-Real-IP
```

**Security**:
 - [Moderate] Add Rate Limiting on Authentication Endpoint Enables Brute Force Attacks ([GHSA-r4v7-6wcg-ghj5](https://github.com/gtsteffaniak/filebrowser/security/advisories/GHSA-r4v7-6wcg-ghj5)).
 - [Critical] Path traversal in public share PATCH allows file ops outside shared directory -- thanks [@Revanth011](https://github.com/Revanth011) and [@fg0x0](https://github.com/fg0x0) ([GHSA-qqqm-5547-774x](https://github.com/gtsteffaniak/filebrowser/security/advisories/GHSA-qqqm-5547-774x)).

**New Features**:
 - Read-only source configuration via `source.config.readOnly: true` ([issue #2438](https://github.com/gtsteffaniak/filebrowser/issues/2438)).

**Notes**:
 - Auth rate limiting can be disabled via `auth.disableRateLimit`.
 - Updated share hash middleware ([pr #2443](https://github.com/gtsteffaniak/filebrowser/pull/2443)).
 - Updated source info popup to include `private` and `readOnly` properties.

**BugFixes**:
 - Logout from share page now redirects to the share instead of `/Login` again ([pr #2445](https://github.com/gtsteffaniak/filebrowser/pull/2445)).
 - `This location cannot be reached` error when navigating with FileTree in shares ([pr #2445](https://github.com/gtsteffaniak/filebrowser/pull/2445)).
 - Fix FileTree rename and move actions in previews ([pr #2445](https://github.com/gtsteffaniak/filebrowser/pull/2445)).
 - Delete prompt not showing date and thumbnails in some previews ([pr #2445](https://github.com/gtsteffaniak/filebrowser/pull/2445)).
 - fix path slash issue on windows ([pr #2451](https://github.com/gtsteffaniak/filebrowser/pull/2451)) ([issue #2433](https://github.com/gtsteffaniak/filebrowser/issues/2433)) ([issue #2419](https://github.com/gtsteffaniak/filebrowser/issues/2419)).
 - Always force url rewrite for onlyoffice internal URL. Fixes Error saving with OnlyOffice ([issue #2450](https://github.com/gtsteffaniak/filebrowser/issues/2450)).
 - Overriding a Deny with an Allow not working ([issue #2405](https://github.com/gtsteffaniak/filebrowser/issues/2405)).

**Full Changelog**: [v1.4.1-beta...v1.4.2-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.4.1-beta...v1.4.2-beta) -- **Release**: [v1.4.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.4.2-beta).

---

## [v1.4.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.4.1-beta)

**Security**:
 - Fix critical: unauthenticated user can view source info ([GHSA-3jmg-p96m-m328](https://github.com/advisories/GHSA-3jmg-p96m-m328)).

**Full Changelog**: [v1.4.0-beta...v1.4.1-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.4.0-beta...v1.4.1-beta) -- **Release**: [v1.4.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.4.1-beta).

---

## [v1.4.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.4.0-beta)

{{% alert context="danger" %}}
A security issue was introduced in this release which causes unauthenticated users to access source information on shares. A fix is being rolled out for `v1.4.1` and later an integration test for this to ensure future versions are secure.
{{% /alert %}}

**New Features**:
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
 - Enhanced indexing scheduler which doesn't wake the disk as often.
 - New API route `media/lyrics` used to fetch and parse lyrics (embedded or from `.lrc` sidecar) ([pr #2360](https://github.com/gtsteffaniak/filebrowser/pull/2360)).
 - Swiping down gesture in fullscreen videos exit fullscreen instead of close preview ([pr #2360](https://github.com/gtsteffaniak/filebrowser/pull/2360)).
 - Improved styles for path selection and tables.
 - Improved style of drag and drop into listing view ([pr #2407](https://github.com/gtsteffaniak/filebrowser/pull/2407)).
 - Edit Sidebar links has new `show tools in sidebar` toggle and all users have this enabled by default. can be disabled via for new users `userDefaults.sidebar.showTools: false`.
 - Update user defaults ordering ([issue #1140](https://github.com/gtsteffaniak/filebrowser/issues/1140)).
 - Save view modes and sizes into local storage instead of db ([issue #2301](https://github.com/gtsteffaniak/filebrowser/issues/2301)) ([pr #2300](https://github.com/gtsteffaniak/filebrowser/pull/2300)).

**BugFixes**:
 - Blue overlay when using gestures in video files on mobile ([pr #2360](https://github.com/gtsteffaniak/filebrowser/pull/2360)).
 - Playback queue wasn't updating when changing of folder ([pr #2360](https://github.com/gtsteffaniak/filebrowser/pull/2360)).
 - Added missing `UserDefaults.listing.showCopyPath` option to config file ([pr #2402](https://github.com/gtsteffaniak/filebrowser/pull/2402)) ([issue #2464](https://github.com/gtsteffaniak/filebrowser/issue/2364)).
 - Delete prompt thumbnail didn't worked when using it with the `delete` shortcut ([pr #2407](https://github.com/gtsteffaniak/filebrowser/pull/2407)).
 - Searching icons in the Icon picker prompt wasn't working properly ([pr #2407](https://github.com/gtsteffaniak/filebrowser/pull/2407)).
 - Drag and drop style state was stuck until page reload ([pr #2407](https://github.com/gtsteffaniak/filebrowser/pull/2407)).
 - Navigate close settings shows "something went wrong" ([pr #2407](https://github.com/gtsteffaniak/filebrowser/pull/2407)).

**Full Changelog**: [v1.3.10-beta...v1.4.0-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.3.10-beta...v1.4.0-beta) -- **Release**: [v1.4.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.4.0-beta).

---

## [v1.3.10-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.10-beta)

{{% alert context="danger" %}}
A security issue was introduced in this release which causes unauthenticated users to access source information on shares. A fix is being rolled out for 1.4.1 and later an integration test for this to ensure future versions are secure.
{{% /alert %}}

**Notes**:
 - When indexing is disabled for a source, the usage will always reported as partition size.
 - removed deprecated `source.config.disableIndexing`, see {{< doclink path="advanced/source-configuration/conditional-rules/#disable-indexing" text="rules" />}}.

**BugFixes**:
 - Disable index option not working ([issue #2385](https://github.com/gtsteffaniak/filebrowser/issues/2385)).

**Full Changelog**: [v1.3.9-beta...v1.3.10-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.3.9-beta...v1.3.10-beta) -- **Release**: [v1.3.10-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.10-beta).

---

## [v1.3.9-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.9-beta)

**Security**:
 - [Critical] Unauthenticated Path Traversal in Public Share Delete Allows Arbitrary File Deletion ([GHSA-fwj3-42wh-8673](https://github.com/gtsteffaniak/filebrowser/security/advisories/GHSA-fwj3-42wh-8673))
 - [Moderate] Stored XSS via SVG File in Public Share (Missing CSP Header) ([GHSA-mmpx-jh39-wrv6](https://github.com/gtsteffaniak/filebrowser/security/advisories/GHSA-mmpx-jh39-wrv6))

**BugFixes**:
 - Fix context menu items and adjusted when items show to more accurately reflect permissions.

**Full Changelog**: [v1.3.8-beta...v1.3.9-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.3.8-beta...v1.3.9-beta) -- **Release**: [v1.3.9-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.9-beta).

---

## [v1.3.8-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.8-beta)

**BugFixes**:
 - Quick download icon style after icon change.
 - Missing error popup for resource creatoin actions (upload/create).
 - EnforcedOtp login failure until restart ([issue #2330](https://github.com/gtsteffaniak/filebrowser/issues/2330)).
 - Thumbnails for Folders only display sporadically ([issue #2353](https://github.com/gtsteffaniak/filebrowser/issues/2353)).
 - Unwanted user scope change for users with non-default scopes ([issue #2347](https://github.com/gtsteffaniak/filebrowser/issues/2347)).
 - Fix sidebar source info totals ([issue #2321](https://github.com/gtsteffaniak/filebrowser/issues/2321)) ([issue #2322](https://github.com/gtsteffaniak/filebrowser/issues/2322)) ([issue #982](https://github.com/gtsteffaniak/filebrowser/issues/982)).
 - Error uploading a large number of photos -- only `100` items get uploaded ([issue #2348](https://github.com/gtsteffaniak/filebrowser/issues/2348)).

**Full Changelog**: [v1.3.7-beta...v1.3.8-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.3.7-beta...v1.3.8-beta) -- **Release**: [v1.3.8-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.8-beta).

---

## [v1.3.7-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.7-beta)

**Notes**:
 - Creating/Deleting password-based user requires reauthentication ([issue #2112](https://github.com/gtsteffaniak/filebrowser/issues/2112)).

**BugFixes**:
 - TOTP works for admin but fails for standard users on re-login until Docker is restarted ([issue #2330](https://github.com/gtsteffaniak/filebrowser/issues/2330)).
 - No Loginfields shown if password authentification is set to false ([issue #2331](https://github.com/gtsteffaniak/filebrowser/issues/2331)).

**Full Changelog**: [v1.3.6-beta...v1.3.7-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.3.6-beta...v1.3.7-beta) -- **Release**: [v1.3.7-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.7-beta).

---

## [v1.3.6-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.6-beta)

**BugFixes**:
 - File watcher not working for files and not respecting line count ([issue #2314](https://github.com/gtsteffaniak/filebrowser/issues/2314)).
 - "source" type link shows up multiple times when adding sidebar links if user has multiple sources.
 - JWT ES256 results in error ([issue #2188](https://github.com/gtsteffaniak/filebrowser/issues/2188)).
 - Single file shares not loading editor text content ([issue #2122](https://github.com/gtsteffaniak/filebrowser/issues/2122)).

**Full Changelog**: [v1.3.5-beta...v1.3.6-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.3.5-beta...v1.3.6-beta) -- **Release**: [v1.3.6-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.6-beta).

---

## [v1.3.5-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.5-beta)

**Notes**:
 - Any password change or admin user property change for a password user requires reauthentication ([#2112](https://github.com/gtsteffaniak/filebrowser/issues/2112))

**BugFixes**:
 - PWA icon fixes ([issue #2292](https://github.com/gtsteffaniak/filebrowser/issues/2292)).
 - Deny-rule'd folders visible in directory listings (regression from [v1.2.4-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.4-stable)) ([issue #2295](https://github.com/gtsteffaniak/filebrowser/issues/2295)).
 - OTP and password requirement fixes ([issue #2112](https://github.com/gtsteffaniak/filebrowser/issues/2112)) ([issue #2263](https://github.com/gtsteffaniak/filebrowser/issues/2263)).
 - CLI not picking up config properly.
 - Storage usage numbers on first load adjusted.
 - Some items in userDefaults are not setting defaults for new users properly ([issue #2278](https://github.com/gtsteffaniak/filebrowser/issues/2278)).
 - Fix copy to clipboard and simplify code ([pr #2281](https://github.com/gtsteffaniak/filebrowser/pull/2281)) ([issue #2274](https://github.com/gtsteffaniak/filebrowser/issues/2274)).
 - Fix search shortcut `/` and pdf previews ([pr #2307](https://github.com/gtsteffaniak/filebrowser/pull/2307)).
 - Special permissions bit not set when declared in createDirectoryPermission ([issue #2283](https://github.com/gtsteffaniak/filebrowser/issues/2283)).
 - Execute permission altered after editing sh script with FB Quantum ([issue #2309](https://github.com/gtsteffaniak/filebrowser/issues/2309)).
 - Source is red but working ([issue #2289](https://github.com/gtsteffaniak/filebrowser/issues/2289)).
 - `replace-rename` prompt wasn't working in some cases ([pr #2285](https://github.com/gtsteffaniak/filebrowser/pull/2285)) ([issue #2275](https://github.com/gtsteffaniak/filebrowser/issues/2275)).

**Full Changelog**: [v1.3.4-beta...v1.3.5-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.3.4-beta...v1.3.5-beta) -- **Release**: [v1.3.5-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.5-beta).

---

## [v1.3.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.4-beta)

**New Features**:
 - Epub placementg url anchors to bookmark a specific location on the doc.
 - Add Requirement for Current Password When Changing Account Password ([pr #2112](https://github.com/gtsteffaniak/filebrowser/pull/2112)).
 - Copy file path to clipborad through right click ([issue #2204](https://github.com/gtsteffaniak/filebrowser/issues/2204)).

**Notes**:
 - User scope editing has path picker and filesystem validation.

**BugFixes**:
 - Swiping media files doesn't respect Playback Queue ([issue #1444](https://github.com/gtsteffaniak/filebrowser/issues/2243)).
 - Audio metadata and album thumbnails doesn't work ([issue #2236](https://github.com/gtsteffaniak/filebrowser/issues/2236)).
 - Search spinner wouldn't show up sometimes while searching.
 - The default landing page source should always be the first source in the sidebar, that wasn't always respected.
 - Mouse keys not working while viewing images ([pr #2250](https://github.com/gtsteffaniak/filebrowser/pull/2250)).

**Full Changelog**: [v1.3.3-beta...v1.3.4-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.3.3-beta...v1.3.4-beta) -- **Release**: [v1.3.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.4-beta).

---

## [v1.3.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.3-beta)

**New Features**:
 - Copy/paste files and folders (`CTRL+C`/`CTRL+V`) from other apps (win explorer, thunar, finder, etc) to upload them directly ([pr #2197](https://github.com/gtsteffaniak/filebrowser/pull/2197)).
 - Caption font size can be adjusted in video settings.
 - Ability to adjust the startup check method for sql database via `server.startupIntegrityCheck` ([issue #2221](https://github.com/gtsteffaniak/filebrowser/issues/2221)).
 - Status bar for editor and markdown viewer ([pr #2226](https://github.com/gtsteffaniak/filebrowser/pull/2226)).

**Notes**:
 - `.fbx` 3D model files added to supported previews.
 - Removed `upx` compression on docker image ([issue #2193](https://github.com/gtsteffaniak/filebrowser/issues/2193)).
 - Videos double tap to `fast-forward` and `rewind` added.
 - Adjust Image album swipe behavior ([issue #2068](https://github.com/gtsteffaniak/filebrowser/issues/2068)).
   - Swipe animation for next/previous.
   - Swipe down on image to close and go to parent folder.
   - Supports videos and audios.
 - Chunked uploads will save to a temporary file at the destination and renamed on completion. Better upload pause handling ([issue #2129](https://github.com/gtsteffaniak/filebrowser/issues/2129)).
 - The Icons in the UI were updated! ([pr #2203](https://github.com/gtsteffaniak/filebrowser/pull/2203)).
   - More supported icons in the Icon Picker tool.
   - More file types have new icons across all the listings (such as `.md`, `.apk`, etc).
 - Deprecated `source.config.CreateUserDir`, now its always `true`. If a user directory doesn't exist it will get created empty.
 - `CTRL`+`Mouse Wheel` shortcut to change listing size. Also for change font size in editor ([issue #2227](https://github.com/gtsteffaniak/filebrowser/issues/2227)) ([pr #2226](https://github.com/gtsteffaniak/filebrowser/pull/2226)).

**BugFixes**:
 - Archives don't preserve file metadata ([issue #2063](https://github.com/gtsteffaniak/filebrowser/issues/2063)).
 - Chunked upload setting fails: `0` does not disable chunking as expected ([issue #2202](https://github.com/gtsteffaniak/filebrowser/issues/2202)).
 - Incorrect Chinese labels for Upload controls in Quantum UI ([issue #2191](https://github.com/gtsteffaniak/filebrowser/issues/2191)).
 - Chunked download stops after first chunk, add message explaining ([issue #2074](https://github.com/gtsteffaniak/filebrowser/issues/2074)).
 - Esc to Cancel and Enter to confirm popup ([issue #2079](https://github.com/gtsteffaniak/filebrowser/issues/2079)).
 - Language-tagged subtitle files not detected for videos ([issue #2199](https://github.com/gtsteffaniak/filebrowser/issues/2199)).
 - Unable to use proxy auth since [v1.3.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.0-beta) ([issue #2173](https://github.com/gtsteffaniak/filebrowser/issues/2173)).
 - Updating setting on a LDAP user turns the "Login Method" to password. Thus preventing further logins ([issue #2179](https://github.com/gtsteffaniak/filebrowser/issues/2179)).

**Full Changelog**: [v1.3.2-beta...v1.3.3-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.3.2-beta...v1.3.3-beta) -- **Release**: [v1.3.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.3-beta).

---

## [v1.3.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.2-beta)

**Security**:
 - Patched Username Enumeration via Authentication Timing Side-Channel ([GHSA-7789-65hx-f26w](https://github.com/advisories/GHSA-7789-65hx-f26w)).

**New Features**:
  - Option in settings `userDefaults.preferEditorForMarkdown` to prefer editor first for Markdown files ([issue #2136](https://github.com/gtsteffaniak/filebrowser/issues/2136)) ([pr #2160](https://github.com/gtsteffaniak/filebrowser/pull/2160)).
  - Copy to clipboard button for code blocks in Markdown Viewer ([pr #2160](https://github.com/gtsteffaniak/filebrowser/pull/2160)).
  - Add "Last modified" filter in search dialog ([issue #2157](https://github.com/gtsteffaniak/filebrowser/issues/2157)).

**Notes**:
 - Docs preview for text and pdf has a 2 second timeout. If it hangs for whatever reason, the maximum time would be 2 seconds. ([issue #2105](https://github.com/gtsteffaniak/filebrowser/issues/2105)) ([pr #2114](https://github.com/gtsteffaniak/filebrowser/pull/2114)).
 - Downloading multiple files streams the archive creation rather than using cacheDir -- thanks [@janakoram](https://github.com/janakoram) ([pr #2125](https://github.com/gtsteffaniak/filebrowser/pull/2125)) ([issue #2130](https://github.com/gtsteffaniak/filebrowser/issues/2130)).
   - `server.maxArchiveSizeGB` now defaults to `20 (GB)` and only applies to archive/unarchive actions (not downloads).
   - Browser download progress bar will no longer show for archive downloads. this is the main drawback to the streaming approach.
   - Should allow for much higher parallel download support and lower cleanup maintenenance.
 - [docker] ffmpeg version upgraded to `8.1`
 - Remote IP in logs now prefers `X-Forwarded-For` if it exists, then `X-Real-IP`, then lastly the standard RemoteAddr. Useful when running behind a proxy to log the public IP of each request ([issue #2110](https://github.com/gtsteffaniak/filebrowser/issues/2110)).
 - Changed loading spinner style to be more compatible with safari browsers.

**BugFixes**:
 - Wrong username in share settings ([issue #2147](https://github.com/gtsteffaniak/filebrowser/issues/2147)) ([pr #2148](https://github.com/gtsteffaniak/filebrowser/pull/2148)).
 - [OnlyOffice] Error when saving a file under a user scope ([issue #2133](https://github.com/gtsteffaniak/filebrowser/issues/2133)).
 - Cannot edit shared file in OnlyOffice ([issue #2143](https://github.com/gtsteffaniak/filebrowser/issues/2143)).
 - PWA install button disappeared ([issue #2086](https://github.com/gtsteffaniak/filebrowser/issues/2086)).
 - Deleting a root folder was possible ([issue #2128](https://github.com/gtsteffaniak/filebrowser/issues/2128)).
 - PUT resource api errors if action against a folder ([pr #2153](https://github.com/gtsteffaniak/filebrowser/pull/2153)).
 - LDAP authentication issue if a password caontains `@` symbol ([issue #2154](https://github.com/gtsteffaniak/filebrowser/issues/2154)).
 - Share banner seems to be not working for custom urls ([issue #2120](https://github.com/gtsteffaniak/filebrowser/issues/2120)).
 - Fix delete and tree navigation issues ([pr #2142](https://github.com/gtsteffaniak/filebrowser/pull/2142)).

**Full Changelog**: [v1.3.1-beta...v1.3.2-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.3.1-beta...v1.3.2-beta) -- **Release**: [v1.3.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.2-beta).

---

## [v1.3.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.1-beta)

**Security**:
 - Patched Stored XSS in public share page via unsanitized share metadata, `text/template` misuse ([GHSA-r633-fcgp-m532](https://github.com/gtsteffaniak/filebrowser/security/advisories/GHSA-r633-fcgp-m532))
 - Patched Incomplete Remediation of [CVE-2026-27611](https://github.com/advisories/GHSA-8vrh-3pm2-v4v6): Password-Protected Share Bypass via `/public/api/share/info` ([GHSA-525j-95gf-766f](https://github.com/gtsteffaniak/filebrowser/security/advisories/GHSA-525j-95gf-766f))

**New Features**:
  - More user options for settings ([pr #2072](https://github.com/gtsteffaniak/filebrowser/pull/2072)) ([pr #2067](https://github.com/gtsteffaniak/filebrowser/pull/2067)):
    - `userDefaults.preview.audio` and `userDefaults.preview.models` to disable thumbnails for Audio and 3D Models.
    - `userDefaults.hideFilesInTree` to disable files in the Tree navigation.
    - `userDefaults.deleteAfterArchive` to disable source files deletion when creating/extracting archives.

**Notes**:
 - Share icon does not show in share listing or for shares for other users.
 - File Size Analyzer tool max items increased from `100` to `200`.
 - Changed symlink detection logic.

**BugFixes**:
 - `405` response code error on Webdav in [v1.3.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.0-beta) ([issue #2054](https://github.com/gtsteffaniak/filebrowser/issues/2054)).
 - Motion Preview setting not saving when changed in profile settings.
 - Context menu on tools not working.
 - E-book thumbanils can't be disabled ([pr #2085](https://github.com/gtsteffaniak/filebrowser/pull/2085)) ([issue #2080](https://github.com/gtsteffaniak/filebrowser/issues/2080)).
 - Tools sidebar navigation ([pr #2098](https://github.com/gtsteffaniak/filebrowser/pull/2098)) ([issue #2097](https://github.com/gtsteffaniak/filebrowser/issues/2097)).
 - Drag and drop move opens Move popup ([issue #2082](https://github.com/gtsteffaniak/filebrowser/issues/2078)) ([pr #2082](https://github.com/gtsteffaniak/filebrowser/pull/2082)).

**Full Changelog**: [v1.3.0-beta...v1.3.1-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.3.0-beta...v1.3.1-beta) -- **Release**: [v1.3.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.1-beta).

---

## [v1.3.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.0-beta)

Read: [New Announcement](https://github.com/gtsteffaniak/filebrowser/discussions/2048)

{{% alert context="danger" %}}
Note: A potentially breaking change for docker users: The default user is now `filebrowser` `1000:1000` instead of root. See {{< doclink path="getting-started/docker/#running-container-with-a-different-user" text="docs" />}}.
{{% /alert %}}

**New Features**:
 - New Sidebar Features:
   - Sidebar Tree Navigation ([pr #2006](https://github.com/gtsteffaniak/filebrowser/pull/2006)) ([issue #350](https://github.com/gtsteffaniak/filebrowser/issues/350)).
   - Source usage to be customized to show os-reported values rather than calculated. This can be changed per source by editing the source link in the sidebar ([issue #1266](https://github.com/gtsteffaniak/filebrowser/issues/1266)) ([issue #982](https://github.com/gtsteffaniak/filebrowser/issues/982)).
 - Archive/Unarchive actions in UI ([issue #1252](https://github.com/gtsteffaniak/filebrowser/issues/1252)) ([issue #335](https://github.com/gtsteffaniak/filebrowser/issues/335)) ([issue #1569](https://github.com/gtsteffaniak/filebrowser/issues/1569)). 
   - New api to archive/unarchive files on the server.
   - Requires `create` user permissions.
   - Archiving actions respect `server.maxArchiveSize`.
 - Added share icon to items that are shared ([issue #1420](https://github.com/gtsteffaniak/filebrowser/issues/1420)).
 - Authentication enhancements:
   - {{< doclink path="configuration/authentication/ldap/" text="LDAP login support" />}} with OIDC feature parity ([issue #591](https://github.com/gtsteffaniak/filebrowser/issues/591)).
   - `userGroup` for OIDC and LDAP, only users in a group will get access ([issue #1964](https://github.com/gtsteffaniak/filebrowser/issues/1964)).
   - Add {{< doclink path="configuration/authentication/jwt/" text="JWT token authentication" />}} support ([issue #1364](https://github.com/gtsteffaniak/filebrowser/issues/1364)).
 - {{< doclink path="features/previewing-files/" text="Enhanced thumbnail and item previews" />}}.:
   - Added ability to show `motion preview` for folders with multiple child items that have previews, cycles through the first 4 images.
   - Support for reading embedded images from raw image or heic/heif files ([issue #215](https://github.com/gtsteffaniak/filebrowser/issues/215)).
   - Reorganized and simplified thumbnail settings in profile settings ([issue #1968](https://github.com/gtsteffaniak/filebrowser/issues/1968)).
   - Removed `highQuality` thumbnail option which only affected gallery view. Now its always enabled.
   - Improved caching for unsupported images, the same file won't be attempted again with the same modtime.
   - Supports 3D model previews.
 - FileWatcher also supports watching directories
 - Support previews for 3D model files ([issue #1273](https://github.com/gtsteffaniak/filebrowser/issues/1273)).:
   - Supported formats via threejs: `GLTF`, `GLB`, `OBJ`, `STL`, `PLY`, `DAE` (Collada), `3MF`, `3DS`, `USDZ`, `USD`, `USDA`, `USDC`, `AMF`, `VRML`, `WRL`, `VTK`, `VTP`, `PCD`, `XYZ`, `VOX`, `KMZ`.
   - Supports animations (for formats that contain them).
   - Supports embedded textures, external neighboring file textures, or textures in `/textures` subdirectory.
 - Enhanced prompts:
   - All prompts have a taskbar with a close button.
   - Prompts can be freely moved by dragging taskbar.
   - Prompt styling has been updated.
   - Clicking outside of prompts no longer automatically closes them.
 - {{< doclink path="features/webdav/" text="Added WebDAV support" />}} ([issue #209](https://github.com/gtsteffaniak/filebrowser/issues/209)). -- thanks to [@reddec](https://github.com/reddec) for ([pr #1764](https://github.com/gtsteffaniak/filebrowser/pull/1764)).
   - See docs on how to use.
   - Requires api an un-customized api token as password.
   - Respects access rules.
   - Requires download permission to view and modify/create/delete permission to modify.

**Notes**:
 - Docker images default to `filebrowser` user instead of `root`.
 - Reorganized api routes:
   - Consolidated tags for swagger to be more accurately grouped.
   - Tools are all behind `/api/tools` routes.
   - `/api/raw` is deprecated (but functional). The `/api/resources/download` route will be used instead.
   - `/api/preview` has been removed and replaced with `/api/resources/preview`.
   - `/api/onlyoffice` have been replaced with `/api/office`.
   - `/api/shares` has been moved to `/api/share/list`.
   - `/api/auth/tokens` has been moved to `/api/auth/token/list` and `/api/auth/token` added to get specific token info.
   - `PUT /api/token` has been moved to `POST /api/token`.
   - `/public/api/shareinfo` has been moved to `/public/api/share/info`.
   - `POST /resources/bulk/delete` api has been moved to `DELETE /resources/bulk` ([issue #1984](https://github.com/gtsteffaniak/filebrowser/issues/1984)).

**BugFixes**:
 - Long folder names get cut off at top navigation bar ([issue #1934](https://github.com/gtsteffaniak/filebrowser/issues/1934)).

**Full Changelog**: [v1.2.7-beta...v1.3.0-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.2.7-beta...v1.3.0-beta) -- **Release**: [v1.3.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.0-beta).

---

## [v1.2.7-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.7-beta)

{{% alert context="info" %}}
This will be the final update for 1.2.x-beta. Switch to [v1.2.0-stable](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.0-stable) for `v1.2.x` updates or wait for [v1.3.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.3.0-beta) which is due soon.
{{% /alert %}}

**BugFixes**:
 - head > title > infinitely duplicating titles ([issue #2016](https://github.com/gtsteffaniak/filebrowser/issues/2016)).
 - Proxy auth not working with Nginx, stuck at logo ([issue #2013](https://github.com/gtsteffaniak/filebrowser/issues/2013)).

**Full Changelog**: [v1.2.6-beta...v1.2.7-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.2.6-beta...v1.2.7-beta) -- **Release**: [v1.2.7-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.7-beta).

---

## [v1.2.6-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.6-beta)

Resolves CVE found by [@ByteAfterlife](https://github.com/ByteAfterlife) affecting password protected share links.

**Security**:
 - Resolves [GHSA-8vrh-3pm2-v4v6](https://github.com/gtsteffaniak/filebrowser/security/advisories/GHSA-8vrh-3pm2-v4v6)

**Full Changelog**: [v1.2.5-beta...v1.2.6-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.2.5-beta...v1.2.6-beta) -- **Release**: [v1.2.6-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.6-beta).

---

## [v1.2.5-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.5-beta)

**Notes**:
 - Dependency Updates for frontend and backend packages.
 - Upgrade to `go 1.26`
 - File list prompt interaction behavior, single-click always selects, double-click navigates ([issue #1911](https://github.com/gtsteffaniak/filebrowser/issues/1911)).

**BugFixes**:
 - `.ssa` and `.ass` subtitle files get their styling removed during conversion ([issue #1933](https://github.com/gtsteffaniak/filebrowser/issues/1933)).
 - Custom icons issue.
 - New database message for noauth ([issue #1935](https://github.com/gtsteffaniak/filebrowser/issues/1935)).

**Full Changelog**: [v1.2.4-beta...v1.2.5-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.2.4-beta...v1.2.5-beta) -- **Release**: [v1.2.5-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.5-beta).

---

## [v1.2.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.4-beta)

**Notes**:
 - Changed `/api/media/subtitles` api endpoint to better support subtitles.
 - Correcting some errors in French language ([issue #1947](https://github.com/gtsteffaniak/filebrowser/issues/1947)).
 - Add Dutch `nl.json` for frontend i18n -- thanks [@Stephan-P](https://github.com/Stephan-P) ([issue #1957](https://github.com/gtsteffaniak/filebrowser/issues/1957)).
 - Share banner and icon images automatically serve a scaled down `1024x1024`

**BugFixes**:
 - Can't access directories with space (and possibly other special characters) when browsing a public link share ([issue #1956](https://github.com/gtsteffaniak/filebrowser/issues/1956)).
 - External `.ass` subtitles are not usable in web preview ([issue #1933](https://github.com/gtsteffaniak/filebrowser/issues/1933)).
 - Filename blocking rename/move ([issue #1950](https://github.com/gtsteffaniak/filebrowser/issues/1950)).
 - EnforcedOtp: true blocks all user settings updates with HTTP `400` ([issue #1962](https://github.com/gtsteffaniak/filebrowser/issues/1962)).
 - Share favicon URL not showing up and Share description causing endless loading ([issue #1911](https://github.com/gtsteffaniak/filebrowser/issues/1911)).
 - Folder sizes not updated for changes to filesystem outside of filebrowser ([issue #1974](https://github.com/gtsteffaniak/filebrowser/issues/1974)).

**Full Changelog**: [v1.2.3-beta...v1.2.4-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.2.3-beta...v1.2.4-beta) -- **Release**: [v1.2.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.4-beta).

---

## [v1.2.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.3-beta)

**Notes**:
 - Removed upload api behavior to assume paths ending in "/" are folders, strictly uses isDir query param
 - Renamed public upload api query param from `targetPath` to `path`. see swagger docs.

**BugFixes**:
 - Fix stuck motion preview popup window.
 - Chunked uploads ignore User Scope and are saved to Source Root ([issue #1894](https://github.com/gtsteffaniak/filebrowser/issues/1894)).
 - Share delete with user scope issue.
 - Fix favicon pwa icon, having the PWA respect the favicon/loginIcon ([issue #1899](https://github.com/gtsteffaniak/filebrowser/issues/1899)).
 - Delete prompt icons show image previews.

**Full Changelog**: [v1.2.2-beta...v1.2.3-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.2.2-beta...v1.2.3-beta) -- **Release**: [v1.2.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.3-beta).

---

## [v1.2.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.2-beta)

**New Features**:
 - Resizable sidebar ([pr #1896](https://github.com/gtsteffaniak/filebrowser/pull/1896))
 - OIDC Authentication: Change Button Text via `frontend.oidcLoginButtonText` ([issue #1708](https://github.com/gtsteffaniak/filebrowser/issues/1708)).
 - Improved favicon processing ([issue #1899](https://github.com/gtsteffaniak/filebrowser/issues/1899)):
    - Supports more formats.
    - Supports larger images.
    - Automatcially generates multiple favicon sizes on startup for non-svg images. Custom svg favicons need a companion *.png to exist broad compatibilty.
 - Enhanced media playback: Ability to control the queue from your device's lock screen and notification panel - Will also show metadata of the current playing media if available ([pr #1917](https://github.com/gtsteffaniak/filebrowser/pull/1917))

**Notes**:
 - Better text file content detection ([issue #1726](https://github.com/gtsteffaniak/filebrowser/issues/1726)).
 - More url encoding changes for API which should make things more consistent. Open issues if you see path/source not found errors.
 - Adjustments to the startup behavior for sqlite index for reusing the previous database on startup
 - `CTRL`+`B` disables sticky sidebar forever ([issue #1869](https://github.com/gtsteffaniak/filebrowser/issues/1869)).
 - Added context menu back to duplicate finder.
 - Sharing a link for uploads - folder/file access and UX polishing ([issue #1902](https://github.com/gtsteffaniak/filebrowser/issues/1902)).
 - Improved listing view and scrolling performance.
 - Improved image viewer which will utilize recent thumbnails as a placeholder when loading the full image.
 - Small reorganization of "Share" settings to make the popup clear ([issue #1826](https://github.com/gtsteffaniak/filebrowser/issues/1826)).

**BugFixes**:
 - Added docker default `FILEBROWSER_CONFIG="/home/filebrowser/data/config.yaml"` back -- mistakenly removed. see {{< doclink path="getting-started/config/#3-default-locations" text="default locations" />}} ([issue #1891](https://github.com/gtsteffaniak/filebrowser/issues/1891)).
 - Fix brand text in login screen ([pr #1898](https://github.com/gtsteffaniak/filebrowser/pull/1898)).
 - Sidebar links cointains urls with 2x repeated source name ([issue #1847](https://github.com/gtsteffaniak/filebrowser/issues/1847)).
 - 2 factor auth getting overwritten if you edit the auth from admin ([issue #1819](https://github.com/gtsteffaniak/filebrowser/issues/1819)).
 - New created user's files are listing error, Probably related with language setting ([issue #1565](https://github.com/gtsteffaniak/filebrowser/issues/1565)).
 - Thumbnail generation cpu/memory and concurrency bug.
   - Added `75MB` filesize limit for image previews.
   - Optimized concurrency for large vs small images.

**Full Changelog**: [v1.2.1-beta...v1.2.2-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.2.1-beta...v1.2.2-beta) -- **Release**: [v1.2.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.2-beta).

---

## [v1.2.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.1-beta)

 **New Features**:
 - Global disable onlyoffice editor via `*` file option to disable all files for a specific user ([issue #1533](https://github.com/gtsteffaniak/filebrowser/issues/1533)).

 **Notes**:
 - Upgraded imaging package and improved thumbnail generation performance ([issue #1797](https://github.com/gtsteffaniak/filebrowser/issues/1797)) ([issue #1850](https://github.com/gtsteffaniak/filebrowser/issues/1850)).
 - Updated download api to use repeated `file` query param for path instead of `files` with comma. See swagger for details ([issue #1881](https://github.com/gtsteffaniak/filebrowser/issues/1881)).

 **BugFixes**:
 - OnlyOffice stopped working after `v1.2.0` upgrade due to download API changes.
 - Search result link to wrong path when search context other than `/` ([issue #1863](https://github.com/gtsteffaniak/filebrowser/issues/1863)).
 - File actions doesn't work if using user scopes ([issue #1879](https://github.com/gtsteffaniak/filebrowser/issues/1879)).
 - Drop items into folders doesn't work ([pr #1867](https://github.com/gtsteffaniak/filebrowser/pull/1867)) ([issue #1860](https://github.com/gtsteffaniak/filebrowser/issues/1860)).
 - Duplicate finder context menu ([issue #1862](https://github.com/gtsteffaniak/filebrowser/issues/1862)).
 - File list in previews doesn't show the parent items ([pr #1867](https://github.com/gtsteffaniak/filebrowser/pull/1867)) ([issue #1861](https://github.com/gtsteffaniak/filebrowser/issues/1861)).

**Full Changelog**: [v1.2.0-beta...v1.2.1-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.2.0-beta...v1.2.1-beta) -- **Release**: [v1.2.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.1-beta).

---

## [v1.2.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.0-beta)

{{% alert context="info" %}}
This is a major version update with many code changes which could cause unexpected behavior. Upgrades should proceed with caution and report any undesriable behavior by opening an issue on github. The index is now fully in sqlite database - see {{< doclink path="features/indexing" text="Indexing Overview" />}} for more information.
{{% /alert %}}

Sorry for the delay -- a lot of effort went into this release, specifically about fine-tuning sqlite indexing. It took me a long time to iron out the behavior, but it should be mostly there now. Enjoy and report any issues as always :)

**New Features**:
 - SQLite-based indexing:
   - Reduced memory usage, higher CPU and IO usage.
   - Index persistence between restarts requires {{< doclink path="configuration/server/#cachedir" text="persistent cacheDir" />}}.
 - New tool - "Realtime file watcher" low latency if user has realtime permissions ([issue #917](https://github.com/gtsteffaniak/filebrowser/issues/917)).
 - Access control works with individual files too.
 - Allow rename in previews ([pr #1817](https://github.com/gtsteffaniak/filebrowser/pr/1817)) ([issue #1783](https://github.com/gtsteffaniak/filebrowser/issues/1783))
 - Conditionally hide symbolic links as indexing rule config ([issue #1540](https://github.com/gtsteffaniak/filebrowser/issues/1540)).
 - External applications can connect to filebrowser over WebDAV ([issue #209](https://github.com/gtsteffaniak/filebrowser/issues/209)) ([pr #1764](https://github.com/gtsteffaniak/filebrowser/pull/1764)).
 - Make breadcrumbs act as a drop area ([pr #1785](https://github.com/gtsteffaniak/filebrowser/pull/1785)).
 - Search multiple sources at once ([issue #848](https://github.com/gtsteffaniak/filebrowser/issues/848)).
 - File uploads resume from bad internet connection ([issue #1599](https://github.com/gtsteffaniak/filebrowser/issues/1599)).
 - Chunked downloads - fix for `524` errors on cloudflare ([issue #1502](https://github.com/gtsteffaniak/filebrowser/issues/1502)).1
 - Made size calculation consistent: defaults to `size on disk` style to mimic `du -sh`, and allows config `source.config.useLogicalSize: true` for `0` size folders and actual size file sizes ([issue #1266](https://github.com/gtsteffaniak/filebrowser/issues/1266)).
 - Allow deleting selected duplicates from duplicate finder ([issue #1659](https://github.com/gtsteffaniak/filebrowser/issues/1659)).
 - Share changes:
   - Opengraph support for shared links.
   - Allow adding "share settings" option to customizable sidebar links ([issue #1825](https://github.com/gtsteffaniak/filebrowser/issues/1825)).
   - File picker for share favicon and banner icon.
   - Allow disabling "Login button" for shares ([issue #1673](https://github.com/gtsteffaniak/filebrowser/issues/1673)).

**Notes**:
 - `server.cacheDirCleanup` defaults to `false` instead of `true`. For docker, you would still need to mount a `cacheDir` volume to persist cache between restarts.
 - Indexing rules have been streamlined, see {{< doclink path="advanced/source-configuration/conditional-rules" text="docs" />}}. The previous style is deprecated but still functional.
 - Improved listing load times for directories with metadata -- a two-pass approach. First a fast load to get the listing items, then a second api request to include metadata.
 - Enhanced delete prompt.
 - `bulkDelete` API added and replaces the delete API for all UI actions. See swagger docs for usage.
 - Raw download and patch resource api simplified to a single source per request. See swagger docs for usage.
 - UserScope function re-organization, if you notice any user scope issues, please open a GitHub issue.
 - Dile upload resume from bad internet connection ([issue #1599](https://github.com/gtsteffaniak/filebrowser/issues/1599)).

**BugFixes**:
 - Source info not properly read from external storage NAS ([issue #1727](https://github.com/gtsteffaniak/filebrowser/issues/1727)).
 - Ensure user requests scopes are strongly enforced ([issue #1789](https://github.com/gtsteffaniak/filebrowser/issues/1789)).

**Full Changelog**: [v1.1.6-beta...v1.2.0-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.1.6-beta...v1.2.0-beta) -- **Release**: [v1.2.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.2.0-beta).

---

## [v1.1.6-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.6-beta)

**Notes**:
 - `showHidden` is now a backend attribute. Shares will NOT show hidden files by default unless configured to.
 - Improved listing view UI performance, especially for folders with many items ([issue #1773](https://github.com/gtsteffaniak/filebrowser/issues/1773)).

**BugFixes**:
 - `sortBy` config is not respected when navigating next/previous ([issue #1786](https://github.com/gtsteffaniak/filebrowser/issues/1786)).
 - Unauthenticated users unable to preview files ([issue #1792](https://github.com/gtsteffaniak/filebrowser/issues/1792)).
 - File permission not correctly applied ([issue #1790](https://github.com/gtsteffaniak/filebrowser/issues/1790)).
 - API Key loses `download` permission after creation despite being enabled ([issue #1799](https://github.com/gtsteffaniak/filebrowser/issues/1799)).
 - Never exclude root folder ([issue #1749](https://github.com/gtsteffaniak/filebrowser/issues/1749).
 - Sources with "files" name not showing after `v1.1.x` update ([issue #1772](https://github.com/gtsteffaniak/filebrowser/issues/1772)).
 - Symbolic links can't be deleted from WebUI. ([issue #1566](https://github.com/gtsteffaniak/filebrowser/issues/1566)).
 - Panic: close of closed channel during indexing ([issue #1771](https://github.com/gtsteffaniak/filebrowser/issues/1771)).
 - Public sharing returns `404` errors for album art ([issue #1792](https://github.com/gtsteffaniak/filebrowser/issues/1792)).
 - Directories with some symbols in their name "fail to open" ([issue #1808](https://github.com/gtsteffaniak/filebrowser/issues/1808)).

**Full Changelog**: [v1.1.5-beta...v1.1.6-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.1.5-beta...v1.1.6-beta) -- **Release**: [v1.1.6-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.6-beta).

---

## [v1.1.5-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.5-beta)

**Notes**:
 - Major git container tag request ([issue #1756](https://github.com/gtsteffaniak/filebrowser/issues/1756)).

**BugFixes**:
 - Sharing broken if source `disableIndexing: true` ([issue #1742](https://github.com/gtsteffaniak/filebrowser/issues/1742)).
 - Password protected share permission issues ([issue #1729](https://github.com/gtsteffaniak/filebrowser/issues/1729)). ([issue #1606](https://github.com/gtsteffaniak/filebrowser/issues/1606)). ([issue #1593](https://github.com/gtsteffaniak/filebrowser/issues/1593)).
 - Sidebar Sliding left ([issue #1737](https://github.com/gtsteffaniak/filebrowser/issues/1737)).
 - File permissions not working ([pr #1762](https://github.com/gtsteffaniak/filebrowser/pull/1762)).
 - Handle `Close()` errors in archive creation ([pr #1444](https://github.com/gtsteffaniak/filebrowser/pull/1745)).
 - Move custom CSS and user-selected theme styles to the end of the body ([pr #1744](https://github.com/gtsteffaniak/filebrowser/pull/1744)).

**Full Changelog**: [v1.1.4-beta...v1.1.5-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.1.4-beta...v1.1.5-beta) -- **Release**: [v1.1.5-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.5-beta).

---

## [v1.1.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.4-beta)

**New Features**:
 - Toggle to show searching results with thumbnails ([issue #1545](https://github.com/gtsteffaniak/filebrowser/issues/1545)).

**Notes**:
 - File list has loading spinner to help prevent double click issues and give better feedback.
 - Improved cacheDir startup checks.
   - Warning for slow read/write speeds below `50MB/s`
   - Warning for low free space below `20GB`.
   - Warning if read/write latency is slow.
   - Fatal for any errors reading or writing to the directory.
   - Links to official docs for more info .
 - Access rule changes:
   - Denied folders won't show up in parent directory listing view ([issue #1684](https://github.com/gtsteffaniak/filebrowser/issues/1684)).
   - Tools will respect access rules.
   - Shares will check access rules based on user that created the share.

**BugFixes**:
 - Passwords with special characters not working properly ([issue #1648](https://github.com/gtsteffaniak/filebrowser/issues/1648)).
 - Encoded filename navigation issue ([pr #1711](https://github.com/gtsteffaniak/filebrowser/pull/1711)).
 - Fix/Improve some behaviors in nextPrevious ([pr #1707](https://github.com/gtsteffaniak/filebrowser/pull/1707)).
 - Files recognized as folder if they have the same name as previously deleted folders ([issue #1697](https://github.com/gtsteffaniak/filebrowser/issues/1697)).
 - Multi logger support ([issue #1701](https://github.com/gtsteffaniak/filebrowser/issues/1701)).

**Full Changelog**: [v1.1.3-beta...v1.1.4-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.1.3-beta...v1.1.4-beta) -- **Release**: [v1.1.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.4-beta).

---

## [v1.1.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.3-beta)

**Notes**:
 - Continue create user dir scope even if filesystem path creation fails ([issue #1509](https://github.com/gtsteffaniak/filebrowser/issues/1509)).
 - Access control cache is cleared more aggresively to ensure no delay.
 - Removed default `.ico` favicon in favor of `.svg`.

**BugFixes**:
 - Indexing used size increases over time ([issue #1685](https://github.com/gtsteffaniak/filebrowser/issues/1685)).
 - Download progress is not shown ([issue #1687](https://github.com/gtsteffaniak/filebrowser/issues/1687)).

**Full Changelog**: [v1.1.2-beta...v1.1.3-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.1.2-beta...v1.1.3-beta) -- **Release**: [v1.1.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.3-beta).

---

## [v1.1.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.2-beta)

**Notes**:
 - Changes to duplicate detector.
   - Temp SQLite database each query to reduce memory pressure.
   - Max limit is 500 groups total.
 - Downloads from UI requests utf-8 formatted names to support chinese and other characters. Updated swagger docs.
 - Beta releases no longer publish to `latest` docker tag ([issue #1675](https://github.com/gtsteffaniak/filebrowser/issues/1675)).
 - Improved caption styles in plyr ([pr #1661](https://github.com/gtsteffaniak/filebrowser/pull/1661)).

**BugFixes**:
 - Better index status updates, fixing delays ([issue #1649](https://github.com/gtsteffaniak/filebrowser/issues/1649)).
 - Fixed long load times for listings with media info due sequential processing of files. 
 - Downloaded files always included `utf-8` in filename ([issue #1671](https://github.com/gtsteffaniak/filebrowser/issues/1671)).
 - Custom sidebar links allow external links like `https://google.com`.
 - Html title not populated correctly for links ([issue #1676](https://github.com/gtsteffaniak/filebrowser/issues/1676)).

**Full Changelog**: [v1.1.1-beta...v1.1.2-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.1.1-beta...v1.1.2-beta) -- **Release**: [v1.1.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.2-beta).

---

## [v1.1.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.1-beta)

**Notes**:
 - [Docker] upgraded ffmpeg `8.0` to `8.0.1`.
 - Stricter access control checks on file downloads.
 - Wrong translation on Chinese "save" button ([issue #1650](https://github.com/gtsteffaniak/filebrowser/issues/1650)).
 - Incorrect Spanish Translations in Folder Creation and Rename Actions ([issue #1626](https://github.com/gtsteffaniak/filebrowser/issues/1626)).
 - Duplicate file detector has stricter partial checksum match ([issue #1617](https://github.com/gtsteffaniak/filebrowser/issues/1617)).

**BugFixes**:
 - Added missing `exiftool` to docker image for heic conversion orientation support.
 - [v1.1.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.0-beta)
 - Incorrect naming of 1 file in directory-info ([issue #1621](https://github.com/gtsteffaniak/filebrowser/issues/1621)).
 - Disable only office viewing settings not applying.
 - OnlyOffice integration does not work behind proxy authentication ([issue #1422](https://github.com/gtsteffaniak/filebrowser/issues/1422)).
 - Newly created users "add on" to defined scope of previous user ([issue #1628](https://github.com/gtsteffaniak/filebrowser/issues/1628)) ([issue #1518](https://github.com/gtsteffaniak/filebrowser/issues/1518)).
 - Disable chown on upload / file saving ([issue #1469](https://github.com/gtsteffaniak/filebrowser/issues/1469)) ([issue #1546](https://github.com/gtsteffaniak/filebrowser/issues/1546)).
 - Uploading a file will silently overwrite any existing file with the same name ([issue #1564](https://github.com/gtsteffaniak/filebrowser/issues/1564)).
 - Share file url issue.
 - Fix drag and drop and rows in normal view ([pr #1651](https://github.com/gtsteffaniak/filebrowser/pull/1651)).
 - Some text based files are not able to edit ([issue #1567](https://github.com/gtsteffaniak/filebrowser/issues/1567)).

**Full Changelog**: [v1.1.0-beta...v1.1.1-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.1.0-beta...v1.1.1-beta) -- **Release**: [v1.1.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.1-beta).

---

## [v1.1.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.0-beta)

{{% alert context="warning" %}}
URLs for single source configurations will now include the source in the path like multi-source configurations.  Previous: `/files/path/to/text.txt` becomes: `/files/<source name>/path/to/text.txt` to match the pattern used by multiple sources. You may need to update your bookmarks on updating.
{{% /alert %}}

A lot of great progress towards many feature requests that have been open. As always, a special thanks to [@Kurami32](https://github.com) for contributing many of the new features including the new status bar and notification swipe actions. 

More than ever, treat this as a beta. I have included many changes that I didn't want to cause a stir in the past. Now, with a stable release I feel a bit more confident pushing more aggressive changes.

**New Features**:
 - Added tools
   - Size analyzer -- quickly show largest files in interactive graphical chart.
   - Duplicate finder -- find duplicate files larger than `1MB`.
   - Material icon picker and previewer.
 - Listing View Style updates:
   - Status bar for listing view ([pr #1459](https://github.com/gtsteffaniak/filebrowser/pull/1459)).
   - Duration field shows up if media is shown with duration.
   - More dynamic view modes with additional styling changes.
   - Total display modes consolidated into 3 main groups: `list`, `gallery`, `normal` -- `icon` and `compact` modes exist as views based on display size setting.
 - Customizable sidebar links:
   - Logged in users can have their preferences saved and synced.
   - Can rearrange, add custom links, and save your preferences.
   - Can customize shares with their own custom sidebar links.
 - Dynamic scopes for OIDC ([pr #1414](https://github.com/gtsteffaniak/filebrowser/pull/1414)) ([issue #1363](https://github.com/gtsteffaniak/filebrowser/issues/1363)).
 - Share and Access Rules validation:
   - If a file/path is moved/renamed in UI its rules and shares will always follow.
   - If a file/path is moved/renamed outside UI, a warning message will show and ability to associate to new path.
 - Cascade delete access in Access Management when deleting a User ([issue #1347](https://github.com/gtsteffaniak/filebrowser/issues/1347)).
 - Enhanced notifications ([issue #1331](https://github.com/gtsteffaniak/filebrowser/issues/1331)).
   - Added "toast" notification type support -- most success messages show as toast now.
   - Multiple stacked notifications possible.
   - Notification button support, such as click to open folder after moving file.
   - Notification history (not including toasts).
   - Add swipe and visual timeout to notifications ([pr #1600](https://github.com/gtsteffaniak/filebrowser/pull/1600)).
 - Choose different bind ip via `server.listen` ([issue #1573](https://github.com/gtsteffaniak/filebrowser/issues/1573)).
 - Allow disabling clearing cache each startup via `server.cacheDirCleanup: false` in config ([issue #1576](https://github.com/gtsteffaniak/filebrowser/issues/1576)).

**Notes**:
 - More efficient user update actions. Successful `PUT` actions return only `204` if successful.
 - Do not enter directory on "New Folder" action ([issue #1343](https://github.com/gtsteffaniak/filebrowser/issues/1343)).
 - Improved indexing performance - individual scanners per directory at root.
 - Improved search memory efficiency.
 - Improved scrolling performance.
 - Static file handling has been streamlined, could potentially see some changes from this.
 - No longer automatically publishing any dev builds to docker.
 - Deprecated `defaultLandingPage` option -- now determined by first source link in sidebar.
 - Improve rename prompt ([pr #1608](https://github.com/gtsteffaniak/filebrowser/pull/1608)) ([issue #1556](https://github.com/gtsteffaniak/filebrowser/issues/1556)).

**BugFixes**:
 - Uploading/editing/saving to password protected shares error.
 - Updating a share with password protection without a password removed the password.
 - Per-user download counts were not persistant accross restarts.
 - "Update" button in Chinese wraps incorrectely ([issue #1542](https://github.com/gtsteffaniak/filebrowser/issues/1542)).
 - Move/Copy folder creation ([pr #1588](https://github.com/gtsteffaniak/filebrowser/pull/1588)) ([issue #1568](https://github.com/gtsteffaniak/filebrowser/issues/1568)).

**Full Changelog**: [v1.0.1-beta...v1.1.0-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.0.1-beta...v1.1.0-beta) -- **Release**: [v1.1.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.1.0-beta).

---

## [v1.0.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.0.1-beta)

**New Features**:
 - Login icon support added via `frontend.loginIcon` config path variable.

**Notes**:
 - Updated default login icon.
 - Stopped publishing rolling `dev` docker tag.
 - Build requirement change -- from `node 18` > `node 20` with `npm 9.0.0+`.
 - Version is not shown for unauthenticated users ([issue #1444](https://github.com/gtsteffaniak/filebrowser/issues/1444)).
 - Adjusted how static assets are served to better handle icon standards.
 - Fixed signup login ([issue #1444](https://github.com/gtsteffaniak/filebrowser/issues/1444)).
 - Update makefile linker flags to properly set version and SHA ([pr #1474](https://github.com/gtsteffaniak/filebrowser/pull/1474)).
 - Better windows build support -- `make setup` and `make dev` work as long as git is installed on windows
 - Added better first initilization detection:
   - If filebrowser initialized and does not detect a database, a new warning message in server logs appears.
   - If theres no database on start, any admin user's first login will see a welcome message in the UI.
   - For docker, it defaults to `./data/database.db`, but will also fallback to `./database.db` without any additional configuration.

**BugFixes**:
 - Generating multiple HEIC previews in parallel fails ([issue #1470](https://github.com/gtsteffaniak/filebrowser/issues/1470)).
 - `?` in path not always encoded right ([issue #1447](https://github.com/gtsteffaniak/filebrowser/issues/1447)).
 - Fixed some condition that the halloween background doesn't load properly.
 - Some comments not showing up on config viewer in settings.
 - Fix next/previous buttons in OnlyOffice ([issue #1410](https://github.com/gtsteffaniak/filebrowser/issues/1410)) ([pr #1492](https://github.com/gtsteffaniak/filebrowser/pull/1492)).

**Full Changelog**: [v1.0.0-beta...v1.0.1-beta](https://github.com/gtsteffaniak/filebrowser/compare/v1.0.0-beta...v1.0.1-beta) -- **Release**: [v1.0.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.0.1-beta).

---

## [v1.0.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.0.0-beta)

The version number has been bumped to `v1.0.0`! This does mean stable is coming soon :) But this is still the beta release, just with the new naming pattern.

Check out {{< doclink path="getting-started/version" text="how releases will work" />}} going forward.

**Notes**:
 - Enhanced onlyoffice debugger with more wholistic backend logs.
 - Updated info prompt styling.
 - Share qr code links to externalUrl for entire share if exists ([issue #1329](https://github.com/gtsteffaniak/filebrowser/issues/1329)).

**BugFixes**:
 - Cookie host is set using x-Forwarded-Host to better support reverse proxies.
 - HEIC conversion not working ([issue #1460](https://github.com/gtsteffaniak/filebrowser/issues/1460)).
 - 'Prevent user changing their password' also prevents admins changing the users password. ([issue #1365](https://github.com/gtsteffaniak/filebrowser/issues/1365)).
 - OnlyOffice write problem ([issue #1397](https://github.com/gtsteffaniak/filebrowser/issues/1397)). ([issue #1068](https://github.com/gtsteffaniak/filebrowser/issues/1068)).
 - Conditionals starting with a . seem to not work. ([issue #1455](https://github.com/gtsteffaniak/filebrowser/issues/1455)).
 - Last modified in file info is empty ([issue #1443](https://github.com/gtsteffaniak/filebrowser/issues/1443)).
 - Share links: 'Default View Mode' does not apply to subfolders. ([issue #1463](https://github.com/gtsteffaniak/filebrowser/issues/1463)).

**Full Changelog**: [v0.8.11-beta...v1.0.0-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.8.11-beta...v1.0.0-beta) -- **Release**: [v1.0.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v1.0.0-beta).

---

## [v0.8.11-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.11-beta)

**New Features**:
 - OnlyOffice debugger now shows backend logs as well for admin users.
 - If proxy auth based `username` equals `auth.adminUsername`, the user will be promoted to admin.
 - Guard against accidently cancelling uploads ([issue #1419](https://github.com/gtsteffaniak/filebrowser/issues/1419)).
 - Added a quirky halloween theme that automatically applies on october 31st -- you can disable this from happening by setting `frontend.styling.disableEventThemes`.

**Notes**:
 - Removed share setting `enableOnlyOfficeEditing` -- uses value from `allowEditing`.
 - Anonymous users can now edit if a share has edit permissions enabled.
 - No "Incompatible user settings detected" message if its first setup.
 - Cookie handling revamped:
   - Fully backend managed.
   - `auth` cookie name changed to `filebrowser_quantum_jwt`.
   - Auth cookie for password users no longer session based ([issue #1439](https://github.com/gtsteffaniak/filebrowser/issues/1439)).
   - Removed state jwt state variable -- 100% cookie based.

**BugFixes**:
 - Fixed issue editing onlyoffice on shares ([issue #1397](https://github.com/gtsteffaniak/filebrowser/issues/1397)).
 - Added proper and robust logging / error handling for the onlyoffice callback. ([issue #1422](https://github.com/gtsteffaniak/filebrowser/issues/1422)). ([issue #1068](https://github.com/gtsteffaniak/filebrowser/issues/1068)).
 - If a file was moved/renamed/deleted onlyoffice would re-save the original file without error, now it gives error the file doesn't exist anymore.
 - OnlyOffice integration does not work behind proxy authentication ([issue #1422](https://github.com/gtsteffaniak/filebrowser/issues/1422)).
 - Proxy-based authentication with docker does not work unless set up with password-based login first ([issue #1226](https://github.com/gtsteffaniak/filebrowser/issues/1226)).
 - Select all bug on safari mobile ([issue #1421](https://github.com/gtsteffaniak/filebrowser/issues/1421)).
 - Dragging a item into itself ([issue #1446](https://github.com/gtsteffaniak/filebrowser/issues/1446)).

**Full Changelog**: [v0.8.10-beta...v0.8.11-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.8.10-beta...v0.8.11-beta) -- **Release**: [v0.8.11-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.11-beta).

---

## [v0.8.10-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.10-beta)

**New Features**:
 - Marquee selection to listing view -- thanks [@Kurami32](https://github.com/Kurami32) ([pr #1388](https://github.com/gtsteffaniak/filebrowser/pull/1388)) ([issue #1077](https://github.com/gtsteffaniak/filebrowser/issues/1077)).

**Notes**:
 - More changes to login auth flow.
 - Respect `FILEBROWSER_DISABLE_AUTOMATIC_BACKUP='true'` env var ([issue #1398](https://github.com/gtsteffaniak/filebrowser/issues/1398)).
 - Deprecated `conditionals.hidden` instead use `conditionals.ignoreHidden`.

**BugFixes**:
 - Fix material outline styling.
 - "Feels lonely here" when clicking at source tab ([issue #1387](https://github.com/gtsteffaniak/filebrowser/issues/1387)).
 - Anonymous upload bug 0.8.9 ([issue #1383](https://github.com/gtsteffaniak/filebrowser/issues/1383)).
 - Changing previews between documents in onlyoffice ([issue #1410](https://github.com/gtsteffaniak/filebrowser/issues/1410))
 - OnlyOffice should display user language ([issue #1061](https://github.com/gtsteffaniak/filebrowser/issues/1061)).
 - Filebrowser will hard fail when OIDC provider is not found ([issue #733](https://github.com/gtsteffaniak/filebrowser/issues/733)).
 - Some API endpoints always return `404` ([issue #849](https://github.com/gtsteffaniak/filebrowser/issues/849)).

**Full Changelog**: [v0.8.9-beta...v0.8.10-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.8.9-beta...v0.8.10-beta) -- **Release**: [v0.8.10-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.10-beta).

---

## [v0.8.9-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.9-beta)

{{% alert context="danger" %}}
If you have indexing rules -- such as [maxWatchers](https://github.com/gtsteffaniak/filebrowser/blob/39514169f17ed9586d587dd496257588ded6e532/frontend/public/config.generated.yaml#L30), [neverWatchPaths](https://github.com/gtsteffaniak/filebrowser/blob/39514169f17ed9586d587dd496257588ded6e532/frontend/public/config.generated.yaml#L31C9-L31C24), [exclude](https://github.com/gtsteffaniak/filebrowser/blob/39514169f17ed9586d587dd496257588ded6e532/frontend/public/config.generated.yaml#L32C9-L32C16) rules, [include](https://github.com/gtsteffaniak/filebrowser/blob/39514169f17ed9586d587dd496257588ded6e532/frontend/public/config.generated.yaml#L43) rules, see [the migration guide](https://filebrowserquantum.com/en/docs/user-guides/general-configuration/exclusion-rules/) for help.
{{% /alert %}}

**New Features**:
 - Playback Queue for media -- thanks [@Kurami32](https://github.com/Kurami32) ([pr #1327](https://github.com/gtsteffaniak/filebrowser/pull/1327)).
 - Ctrl+b Shortcut to toggle sidebar, open settings, search ([issue #1172](https://github.com/gtsteffaniak/filebrowser/issues/1172))
 - Add a "select all" toggle in the menu ([issue #974](https://github.com/gtsteffaniak/filebrowser/issues/974))
 - Save on exit text editor -- thanks [@srini-abhiram](https://github.com/srini-abhiram) ([pr #1334](https://github.com/gtsteffaniak/filebrowser/pull/1334)) ([issue #1241](https://github.com/gtsteffaniak/filebrowser/issues/1241))
 - Disabled indexing for subfolders but allow browsing ([issue #783](https://github.com/gtsteffaniak/filebrowser/issues/783))
 - Added more granular create/upload, delete, and download (includes viewing content) permission ([issue #1200](https://github.com/gtsteffaniak/filebrowser/issues/1200)) ([issue #1199](https://github.com/gtsteffaniak/filebrowser/issues/1199))
 - Upload settings can be adjusted directly in the upload prompt.
 - Added paste confirmation prompt when using copy/paste keyboard shortcuts.
 - Updated shares:
   - `disableDownload` to disable download and (content viewing).
   - `allowReplacements` to share permission -- prohibits replacing files on conflict ([issue #661](https://github.com/gtsteffaniak/filebrowser/issues/661))
   - Normal shares can create/upload files if given permission.

**Notes**:
 - Optimized font and icon loading.
 - The next/previous buttons will follow media queue order if playback mode has a queue.
 - All new exclude rules -- see [full config example](https://github.com/gtsteffaniak/filebrowser/wiki/Full-Config-Example)
 - The order of sources will strictly match order in `config.yaml`. Default landing page is root first source unless otherwise configured in profile settings.
 - Uploading changes ([issue #1371](https://github.com/gtsteffaniak/filebrowser/issues/1371))
   - Chunked uploading can no longer be explicitly disabled, defaults to `5MB` chunks.
   - Automatic chunked/non-chunked uploads based on size. If an item exceeds the chunk size, chunked uploading will occur. If its less than chunk size, no chunked upload.
   - To "disable" chunked upload, you an set your chunk size very large -- 0 chunk size will be reset to `5MB`.

**BugFixes**:
 - Remember the previous location after closing a preview ([issue #1336](https://github.com/gtsteffaniak/filebrowser/issues/1336))
 - Fixed issue related to multi-config parsing ([issue #1267](https://github.com/gtsteffaniak/filebrowser/issues/1267))
 - Cannot save text files, missing button ([issue #1326](https://github.com/gtsteffaniak/filebrowser/issues/1326)) ([discussion #1367](https://github.com/gtsteffaniak/filebrowser/discussions/1367)) ([pr #1338](https://github.com/gtsteffaniak/filebrowser/pull/1338)).
 - Files are being overwritten and/or content disappears ([issue #1312](https://github.com/gtsteffaniak/filebrowser/issues/1312))
 - Moving between items using next/previous will reset the req and show a responsive loading spinner -- fixing several state related issues.
 - Access management: child folders accessible stopped showing up ([issue #1332](https://github.com/gtsteffaniak/filebrowser/issues/1332))
 - Make source inaccessible if directory does not exist rather than exiting on start ([issue #1264](https://github.com/gtsteffaniak/filebrowser/issues/1264))
 - HTTP Proxy environment gets ignored since version [v0.8.6-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.6-beta) ([issue #1324](https://github.com/gtsteffaniak/filebrowser/issues/1324))
 - Album artwork preview not showing on shares.
 - Fixed OIDC logout causing a loop ([issue #995](https://github.com/gtsteffaniak/filebrowser/issues/995)) ([discussion #1361](https://github.com/gtsteffaniak/filebrowser/discussions/1361))
 - Fixed checksum failure ([issue #1372](https://github.com/gtsteffaniak/filebrowser/issues/1372))
 - Copy, paste, cut shortcuts don't work and make the UI unusable ([issue #1375](https://github.com/gtsteffaniak/filebrowser/issues/1375))
 - Fix button disabled in move/copy prompt ([pr #1339](https://github.com/gtsteffaniak/filebrowser/pull/1339)).

**Full Changelog**: [v0.8.8-beta...v0.8.9-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.8.8-beta...v0.8.9-beta) -- **Release**: [v0.8.9-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.9-beta).

---

## [v0.8.8-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.8-beta)

A special thanks to [@Kurami32](https://github.com/Kurami32) for the player features, debugging, and testing during the dev process.

Consider choosing FileBrowser Quantum on the [latest selfh.st survey](https://selfh.st/survey/2025-open?ref=reddit)!

**New Features**:
 - Ability to split configuration files via yaml anchoring ([issue #1267](https://github.com/gtsteffaniak/filebrowser/issues/1267))
   - See: How to use multiple config files.
 - Added Init Script Help wiki to examples how you can bootstrap filebrowser quantum programatically.
 - Add capability to edit files permissions ([issue #813](https://github.com/gtsteffaniak/filebrowser/issues/813))
   - See updated full config for help using `server.filesystem`.
 - Better copy/move prompt "in progress" indicator.
 - Better login error message feedback.
 - Add capability to disable certain video previews at server level. See full config for help.
 - Added ability to play media in same folder sequentially or shuffled.
 - Upload/upload only share links. ([issue #661](https://github.com/gtsteffaniak/filebrowser/issues/661))
 - Default landing directory if no other redirect is found (set profile settings) ([issue #781](https://github.com/gtsteffaniak/filebrowser/issues/781))
 - Share download limit feature can apply per user -- and disables anonymous download when enabled.
 - Docker health check ([issue #1292](https://github.com/gtsteffaniak/filebrowser/issues/1292))
 - Embedded subtitle support is now **disabled** by default, can be enabled via `integrations.media.extractEmbeddedSubtitles`. Per share configuration is also possible via `extractEmbeddedSubtitles` toggle. This change is because reading subtitles requires processing the entire file, and multi GB video files can take 10-20 seconds.

**Notes**:
 - Some standardized path format changes for access rules to ensure the rules apply. A migration check happens on startup, all rules should still be in effect without any issues, but double check.
 - Moved `server.debugMedia` to `integrations.media.debug`
 - Optimized thumbnail generation workflow:
   - More concurrency changes for video thumbnails (now half of the numImageProcessors config)
   - `15s` timeout added to preview API.
   - Preview operations are cancelled if api request is terminated.
   - Reduced io overhead for video previews.
   - You can now disable individual video file previews system wide at server config level (all enabled by default).

**BugFixes**:
 - Video plyr dark mode style issue where buttons are black instead of white.
 - Error when running without a config file ([issue #1280](https://github.com/gtsteffaniak/filebrowser/issues/1280))
 - Issue persist in `v0.8.7` with Access Management ([issue #1282](https://github.com/gtsteffaniak/filebrowser/issues/1282))
 - All static resources go through /public/static url to fix logout loop ([issue #995](https://github.com/gtsteffaniak/filebrowser/issues/995))
 - `realtime` Permission of API keys is not working ([issue #1141](https://github.com/gtsteffaniak/filebrowser/issues/1141))
 - `Path not found` when trying to share a file or folder inside a sub-directory ([issue #1139](https://github.com/gtsteffaniak/filebrowser/issues/1139))
 - Logout path redirect not working.
 - 2FA secret error ([issue #1305](https://github.com/gtsteffaniak/filebrowser/issues/1305))
 - Console errors during login/logout.
 - Fix scoped user share creation issue ([issue #1309](https://github.com/gtsteffaniak/filebrowser/issues/1309))
 - Share close button and navigation issues.
 - OnlyOffice source not found when opening shared file ([issue #1285](https://github.com/gtsteffaniak/filebrowser/issues/1285))
 - User scoped onlyoffice error saving files with Onlyoffice ([issue #1068](https://github.com/gtsteffaniak/filebrowser/issues/1068))

**Full Changelog**: [v0.8.7-beta...v0.8.8-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.8.7-beta...v0.8.8-beta) -- **Release**: [v0.8.8-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.8-beta).

---

## [v0.8.7-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.7-beta)

**New Features**:
 - `json` logging format support.

**Notes**:
 - Increased overall file size limit to retrieve metadata from `50MB` to `300MB` ([issue #1234](https://github.com/gtsteffaniak/filebrowser/issues/1234))
 - Document previews don't show up as folder previews.
 - Enabled plyr video player to rotate when entering fullscreen ([pr #1251](https://github.com/gtsteffaniak/filebrowser/issues/1251)).

**BugFixes**:
 - Fix directories empty issue when `disableIndexing` is `true` ([pr #1249](https://github.com/gtsteffaniak/filebrowser/pull/1249))
 - OIDC to Authentik behind CloudFlare with Bot Fight turned on triggers a JS challenge ([issue #1165](https://github.com/gtsteffaniak/filebrowser/issues/1165))
 - OIDC Auth - loop with expired token ([issue #995](https://github.com/gtsteffaniak/filebrowser/issues/995))
 - We lost the ability for download all? ([issue #1250](https://github.com/gtsteffaniak/filebrowser/issues/1250))
 - Directories are all empty when `disableIndexing` is `true` ([issue #1248](https://github.com/gtsteffaniak/filebrowser/issues/1248))
 - Access Management: issues on the shared folder when there's a sub folder ([issue #1208](https://github.com/gtsteffaniak/filebrowser/issues/1208))
 - User preferences for individual preview file types not getting respected (disable/enable office,image,video).
 - High server load when browsing folders with .mkv files ([issue #1259](https://github.com/gtsteffaniak/filebrowser/issues/1259))
 - 2FA can not be disabled with non-admin user ([issue #1244](https://github.com/gtsteffaniak/filebrowser/issues/1244))
 - 2FA not working on login ([issue #1243](https://github.com/gtsteffaniak/filebrowser/issues/1243))
 - Thumbnails of .m4a, .flac, and .opus are not displaying ([issue #1294](https://github.com/gtsteffaniak/filebrowser/issues/1234)) ([pr #208](https://github.com/gtsteffaniak/filebrowser/pull/1294))
 - Creating files/folders with same name overwrite each other ([issue #1242](https://github.com/gtsteffaniak/filebrowser/issues/1242))

**Full Changelog**: [v0.8.6-beta...v0.8.7-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.8.6-beta...v0.8.7-beta) -- **Release**: [v0.8.7-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.7-beta).

---

## [v0.8.6-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.6-beta)

**Notes**:
 - Please remove `indexAbumArt` config option from your config: it has been deprecated... I found a way to detect album art without impacting indexing performance -- so its default behavior.
 - Download button should be invisible before password input ([issue #1162](https://github.com/gtsteffaniak/filebrowser/issues/1162))
 - Opus files detected wrongly ([issue #1164](https://github.com/gtsteffaniak/filebrowser/issues/1164))
 - Changed autoplay behavior on plyr to not start playing if blocked instead of playing muted.
 - QR-Code disappearing / sliding out from shared link ([issue #1155](https://github.com/gtsteffaniak/filebrowser/issues/1155))
 - Audio player matches dark/light mode better.

**BugFixes**:
 - Copy/Move index update changes to be more thorough and update album artwork ([issue #1220](https://github.com/gtsteffaniak/filebrowser/issues/1220)) ([issue #1219](https://github.com/gtsteffaniak/filebrowser/issues/1219))
 - Fix preview related issues ([issue #1225](https://github.com/gtsteffaniak/filebrowser/issues/1225)) ([issue #1223](https://github.com/gtsteffaniak/filebrowser/issues/1223))
 - Scrollbar missing on user-edit-prompt in [v0.8.5-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.5-beta) ([issue #1221](https://github.com/gtsteffaniak/filebrowser/issues/1221))
 - Copy share download link inconsistency ([issue #1207](https://github.com/gtsteffaniak/filebrowser/issues/1207))
 - Fixed some onlyoffice related issues ([issue #1192](https://github.com/gtsteffaniak/filebrowser/issues/1192)) ([issue #1068](https://github.com/gtsteffaniak/filebrowser/issues/1068))
 - Creating a file, then a folder with the same name makes the folder unusable ([issue #1167](https://github.com/gtsteffaniak/filebrowser/issues/1167))
 - Fix plyr issue switching from video to audio via next/previous button.

**Full Changelog**: [v0.8.5-beta...v0.8.6-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.8.5-beta...v0.8.6-beta) -- **Release**: [v0.8.6-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.6-beta).

---

## [v0.8.5-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.5-beta)

 **New Features**:
 - Backend media metadata processing:
   - Significantly improved performance
   - Album artwork shows in listing view as preview thumbnail Album art thumbnail: Display embedded covers of mp3/flac files ([issue #925](https://github.com/gtsteffaniak/filebrowser/issues/925))
   - Folders can show album art if enabled with indexing `server.sources.config.indexAlbumArt:true`
   - Removed need for frontend dependencies.
 - Optional thumbnail support for folders -- uses first child item with thumbnail as cover. Useful in combination with album metadata support to show album covers for folders with music.
 - Remember folder view type (and sorting) for each folder ([issue #966](https://github.com/gtsteffaniak/filebrowser/issues/966))
 - Heic is supported in viewer (via ffmpeg conversion) when on non-safari browser. This can be enabled via `integrations.ffmpeg.convert.impagePreview.heic: true` ([issue #1191](https://github.com/gtsteffaniak/filebrowser/issues/1191))
 - OnlyOffice: Add option to open documents in viewer mode (`integrations.office.viewOnly`) ([issue #1193](https://github.com/gtsteffaniak/filebrowser/issues/1193))
 - Exclude folders and file names 'starting with' or wildcard option ([issue #1054](https://github.com/gtsteffaniak/filebrowser/issues/1054))
 - Added better info for failed uploads ([issue #1050](https://github.com/gtsteffaniak/filebrowser/issues/1050))
 - Upload prompt "clear completed" can be changed to "clear all" in uploads & downloads settings to clear error and conflict states as well. ([issue #1128](https://github.com/gtsteffaniak/filebrowser/issues/1128))
 - Share 'default view mode' option ([issue #1212](https://github.com/gtsteffaniak/filebrowser/issues/1212))
 - Universal Next/Previous buttons:
   - Available for all listing items (including office/markdown etc).
   - Remembers sort order from parent directory.
   - New "Quick Jump" prompt if you drag the next/previous icons. This shows other files available to "jump" directly quickly.

 **Notes**:
 - Added more tests to ensure new features work in future.
 - Caching for preview images is md5 based. Moved, renamed, or duplicate images don't get re-generated. Same album artwork shares cache.
 - Hide `@eaDir` folder by default ([issue #1212](https://github.com/gtsteffaniak/filebrowser/issues/1212))
 - Defaults to hide "[@eadir](https://github.com/eadir)" folders (common for synology) ([issue #1212](https://github.com/gtsteffaniak/filebrowser/issues/1212))
 - After move/copy, ability to move to the destination folder ([issue #999](https://github.com/gtsteffaniak/filebrowser/issues/999))

 **BugFixes**:
 - Access Management: issue with access settings ([issue #1195](https://github.com/gtsteffaniak/filebrowser/issues/1195))
 - Fix shutdown panic related to sse connection.
 - Custom theming not working in [v0.8.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.4-beta) ([issue #1204](https://github.com/gtsteffaniak/filebrowser/issues/1204))
 - Config Viewer not working ([issue #1189](https://github.com/gtsteffaniak/filebrowser/issues/1189))
 - `Path not found` when trying to share a file or folder inside a sub-directory ([issue #1139](https://github.com/gtsteffaniak/filebrowser/issues/1139))
 - Files containing `+` in shares ([issue #1089](https://github.com/gtsteffaniak/filebrowser/issues/1089))

<img width="346" height="143" alt="image" src="https://github.com/user-attachments/assets/e14340ab-bfe4-49e6-b93f-aaace1e399c3" />

<img width="391" height="237" alt="image" src="https://github.com/user-attachments/assets/b1c86efa-16d5-40b7-8193-7091e9c75b13" />

<img width="671" height="322" alt="image" src="https://github.com/user-attachments/assets/ca8a9c62-7f03-4663-8e8e-ca059370fed3" />

**Full Changelog**: [v0.8.4-beta...v0.8.5-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.8.4-beta...v0.8.5-beta) -- **Release**: [v0.8.5-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.5-beta).

---

## [v0.8.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.4-beta)

**New Features**:
 - New media player styles and features:
   - Custom Media Player: Enhanced media player using `plyr` thanks [@Kurami32](https://github.com/Kurami32) see ([pr #1160](https://github.com/gtsteffaniak/filebrowser/issues/1160))
   - Custom Media Player: Also adds support for metadata.
   - Added embeded video subtitle support for both: Native and custom player. [@maxbin123](https://github.com/maxbin123) ([pr #1072](https://github.com/gtsteffaniak/filebrowser/pull/1072)) ([pr #1157](https://github.com/gtsteffaniak/filebrowser/pull/1157))
   - Users can disable the custom player and opt for native in profile settings.
 - Option to disable backend update check via `server.disableUpdateCheck` ([issue #1134](https://github.com/gtsteffaniak/filebrowser/issues/1134))
 - Added `frontend.favicon` and `frontend.description` for html overrides.
 - OnlyOffice is now supported in shares. Both viewing and editing can be configured per-share.
 - Added only office debug view and wiki to assist with debugging ([issue #1068](https://github.com/gtsteffaniak/filebrowser/issues/1068)) ([issue #911](https://github.com/gtsteffaniak/filebrowser/issues/911)) ([issue #1074](https://github.com/gtsteffaniak/filebrowser/issues/1074))
 - Dark mode enforcement possible for shared links ([issue #1029](https://github.com/gtsteffaniak/filebrowser/issues/1029))
 - Added `System & Admin` section to settings.
   - Includes a new config viewer to see current running config (hides secrets) ([issue #838](https://github.com/gtsteffaniak/filebrowser/issues/838))
 - Added `server.minSearchLength` to allow adjusting the length requirement for search ([issue #1174](https://github.com/gtsteffaniak/filebrowser/issues/1174))

**Notes**:
 - Access management: specific folders/files with access are shown instead permission denied for parent folder.
 - Navigation no longer appends last location hash which should fix some unwanted navation behavior ([issue #1070](https://github.com/gtsteffaniak/filebrowser/issues/1070))
 - Altered the context menu style and behavior.
 - Documentation update: comma or Space separated extensions ([issue #1138](https://github.com/gtsteffaniak/filebrowser/issues/1138))
 - Files and folders can be created with `/` or `\` on the name ([issue #1126](https://github.com/gtsteffaniak/filebrowser/issues/1126))
 - Share management should not be allowed without authentication ([issue #1163](https://github.com/gtsteffaniak/filebrowser/issues/1163))
 - Question about customizing session timeout ([issue #1184](https://github.com/gtsteffaniak/filebrowser/issues/1184))

**BugFixes**:
 - Access management: delay showing rule changes in the list fixed. ([issue #1131](https://github.com/gtsteffaniak/filebrowser/issues/1131))
 - Color names are not localized ([issue #1159](https://github.com/gtsteffaniak/filebrowser/issues/1159))
 - Rename issues ([issue #1170](https://github.com/gtsteffaniak/filebrowser/issues/1170)) ([issue #1171](https://github.com/gtsteffaniak/filebrowser/issues/1171))
 - Some shortcuts not working ([issue #1056](https://github.com/gtsteffaniak/filebrowser/issues/1056))
 - Can't copy/paste text on mobile ([issue #1168](https://github.com/gtsteffaniak/filebrowser/issues/1168))
 - Can't change between images inside of the share image viewer. ([issue #1144](https://github.com/gtsteffaniak/filebrowser/issues/1144))
 - Fixed and updated translations with variables always showing english.


New onlyoffice debugger can be enabled going to `settings` > `profile settings` > `file viewer options` > `Enable OnlyOffice Debug Mode`

<img width="400" alt="image" src="https://github.com/user-attachments/assets/3eccd914-c866-4c99-89e2-8c260f921be6" />

<img width="550" alt="image" src="https://github.com/user-attachments/assets/31b66fbe-94cf-4577-af16-4f9e47dcd4e3" />

**Full Changelog**: [v0.8.3-beta...v0.8.4-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.8.3-beta...v0.8.4-beta) -- **Release**: [v0.8.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.4-beta).

---

## [v0.8.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.3-beta)

**BugFixes**:
 - Fixed search bar style bug in mobile ([issue #1147](https://github.com/gtsteffaniak/filebrowser/issues/1147))

**Full Changelog**: [v0.8.2-beta...v0.8.3-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.8.2-beta...v0.8.3-beta) -- **Release**: [v0.8.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.3-beta).

---

## [v0.8.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.2-beta)

**New Features**:
 - Added `source.config.denyByDefault` configuration to enable a `deny-by-default` access rule. A source enabled with this will deny access unless an `allow` rule was specifically created. (Similar to creating a root-level `denyAll` rule).
 - Allow OIDC user source access and permission based on username and groups is fulfilled by `denyByDefault` source with access rules ([issue #824](https://github.com/gtsteffaniak/filebrowser/issues/824))
 - "Open parent folder" in context menu and search results ([issue #1121](https://github.com/gtsteffaniak/filebrowser/issues/1121))
 - Added friendly "share not found" page.

**Notes**:
 - 8.0 ffmpeg version bundled with docker.
 - Go 1.25 upgrade with green tea GC enabled.
 - TOTP secrets accept non-secure strings, only throwing warning.
 - Adjusted download limit so it also counts viewing text "content" of files (like in editor). You can also "disable file viewing" to stop the editor from showing. lower quality file image previews are not counted as downloads.
 - Updated invalid share message to be more clear ([issue #1120](https://github.com/gtsteffaniak/filebrowser/issues/1120))

**BugFixes**:
 - Fixed /public/static routes issue.
 - Shares redirect to login ([issue #1109](https://github.com/gtsteffaniak/filebrowser/issues/1109))
 - Some static assets not available to anonymous user ([issue #1102](https://github.com/gtsteffaniak/filebrowser/issues/1102))
 - More safari style issues ([issue #1110](https://github.com/gtsteffaniak/filebrowser/issues/1110))
 - Fix public share download ([issue #1118](https://github.com/gtsteffaniak/filebrowser/issues/1118)) ([issue #1089](https://github.com/gtsteffaniak/filebrowser/issues/1089))
 - Fixed disable file viewer setting and enforced on backend.

**Full Changelog**: [v0.8.1-beta...v0.8.2-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.8.1-beta...v0.8.2-beta) -- **Release**: [v0.8.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.2-beta).

---

## [v0.8.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.1-beta)

 **New Features**:
 - API for generate download link (see swagger) ([issue #1007](https://github.com/gtsteffaniak/filebrowser/issues/1007))
 - Added `source.config.disabled` option to disable a source without removing it from config file.
 - Added `source.config.private` option to designate as private -- currently just means no sharing permitted.
 - Hide share card in share.
 - Download count for a share shows up on share management.

 **Notes**:
 - Updated description for indexingIntervalMinutes ([issue #1067](https://github.com/gtsteffaniak/filebrowser/issues/1067))

 **BugFixes**:
 - Fixed styling issues ([issue #1086](https://github.com/gtsteffaniak/filebrowser/issues/1086)) ([issue #1081](https://github.com/gtsteffaniak/filebrowser/issues/1081)) ([issue #1082](https://github.com/gtsteffaniak/filebrowser/issues/1082)) ([issue #1098](https://github.com/gtsteffaniak/filebrowser/issues/1098))
 - Fix download limit ([issue #1085](https://github.com/gtsteffaniak/filebrowser/issues/1085))
 - Fixed oidc user defaults for new user ([issue #1071](https://github.com/gtsteffaniak/filebrowser/issues/1071))
 - Shares get updated when files moved in UI ([issue #760](https://github.com/gtsteffaniak/filebrowser/issues/760))
 - Click listing behavior doesn't clear (introduced in 0.8.0) ([issue #1101](https://github.com/gtsteffaniak/filebrowser/issues/1101))
 - Show download count and limit in share list in settings ([issue #1103](https://github.com/gtsteffaniak/filebrowser/issues/1103))
 - Fix windows alt+arrow movement ([issue #1094](https://github.com/gtsteffaniak/filebrowser/issues/1094))
 - Nav memory issue for filenames with brackets ([issue #1092](https://github.com/gtsteffaniak/filebrowser/issues/1092))
 - Files with `+` in name ([issue #1089](https://github.com/gtsteffaniak/filebrowser/issues/1089))
 - Fixed editor bug in share view ([issue #1084](https://github.com/gtsteffaniak/filebrowser/issues/1084))
 - Other share related issues ([issue #1087](https://github.com/gtsteffaniak/filebrowser/issues/1087)) ([issue #1064](https://github.com/gtsteffaniak/filebrowser/issues/1064))

**Full Changelog**: [v0.8.0-beta...v0.8.1-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.8.0-beta...v0.8.1-beta) -- **Release**: [v0.8.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.1-beta).

---

## [v0.8.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.0-beta)

This is a major release, new features and changes could introduce breaking behavior. Here are the known potentially breaking changes:

- All public api and share url's get a `/public` prefix, making it easier to use with a reverse proxy. Any existing share link will still work but get redirected.
- A small change to styling you may need to update your custom styling, for example the id `#input` was renamed `#search-input`

**New Features**:
 - New access control system. You can add new allow / deny / denyAll rules for users/groups for specific paths on specific sources.
   - Groups currently only works with provided oidc groups, but will add a full group management option for manual creation. ([issue #545](https://github.com/gtsteffaniak/filebrowser/issues/545))
 - Share view changes -- now aligns with the standard listing view. This means files can be viewed and edited (if permission allows) just like a normal listing.
 - Many share links customization enhancements.
   - Only share to certain authenticated users ([issue #656](https://github.com/gtsteffaniak/filebrowser/issues/656)) ([issue #985](https://github.com/gtsteffaniak/filebrowser/issues/985))
   - One-time download links.
   - Customize share theme ([issue #827](https://github.com/gtsteffaniak/filebrowser/issues/827)) ([issue #1029](https://github.com/gtsteffaniak/filebrowser/issues/1029))
   - Share link public changes ([issue #473](https://github.com/gtsteffaniak/filebrowser/issues/473))
   - Shares can be modified/configured after creation.
   - Download throttling for shares.

**Notes**:
 - Hover effect on list/compact view ([issue #1036](https://github.com/gtsteffaniak/filebrowser/issues/1036))

**BugFixes**:
 - Fix new file "true" content issue ([issue #1048](https://github.com/gtsteffaniak/filebrowser/issues/1048))
 - Editor allows device default popup ([issue #1049](https://github.com/gtsteffaniak/filebrowser/issues/1049))

<img width="400"  alt="image" src="https://github.com/user-attachments/assets/d4f24d3a-2732-4f4f-ac88-db56ef3ebc25" />

<img width="500" alt="image" src="https://github.com/user-attachments/assets/356fab0d-3864-41bf-a424-fe1486c055dd" />

**Full Changelog**: [v0.7.18-beta...v0.8.0-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.7.18-beta...v0.8.0-beta) -- **Release**: [v0.8.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.8.0-beta).

---

## [v0.7.18-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.18-beta)

**Notes**:
 - Desktop context menu "select multiple" enabled as optional user default ([issue #1000](https://github.com/gtsteffaniak/filebrowser/issues/1000))
 - OnlyOffice readonly document types (".pages", ".numbers", ".key") list ([issue #1018](https://github.com/gtsteffaniak/filebrowser/issues/1018))
 - OnlyOffice tweaks to make more consistent, added logging ([issue #1015](https://github.com/gtsteffaniak/filebrowser/issues/1015))

**BugFixes**:
 - Fix lightBackground issue ([issue #1021](https://github.com/gtsteffaniak/filebrowser/issues/1021))
 - Fix user save issues ([issue #1020](https://github.com/gtsteffaniak/filebrowser/issues/1020)) ([issue #1027](https://github.com/gtsteffaniak/filebrowser/issues/1027))
 - Fix image preview cache issue ([issue #989](https://github.com/gtsteffaniak/filebrowser/issues/989))
 - Fix file/folder count issue ([issue #989](https://github.com/gtsteffaniak/filebrowser/issues/989))
 - Only first file was upload on drag-n-drop ([issue #1024](https://github.com/gtsteffaniak/filebrowser/issues/1024))

**Full Changelog**: [v0.7.17-beta...v0.7.18-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.7.17-beta...v0.7.18-beta) -- **Release**: [v0.7.18-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.18-beta).

---

## [v0.7.17-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.17-beta)

See an example of custom css styling that uses the `reduce-rounded-corners.css` by default and allows users to choose other themes. You can add your own themes as well that users can choose from in profile settings:

```yaml
frontend:
  styling:
    lightBackground: "#f0f0f0"   # or names of css colors
    darkBackground: "#121212"
    customCSS: "custom.css"  # custom css file always applies first, then user themes on top of that.
    customThemes:
      "default": # if "default" is specified as the name, it will be the default option
        description: "Reduce rounded corners"
        css: "reduce-rounded-corners.css" # path to css file to use
      "original":
        description: "Original rounded theme"
        css: ""  # you could default to no styling changes this way.
```

**New Features**:
 - More custom styling options (thanks [@mordilloSan](https://github.com/mordilloSan)) ([pr #9997](https://github.com/gtsteffaniak/filebrowser/pull/997))
   - Background colors can be easily set in config.
   - Provided an example `reduce-rounded-corners.css` available by default in docker. ([issue #896](https://github.com/gtsteffaniak/filebrowser/issues/896)) ([issue #837](https://github.com/gtsteffaniak/filebrowser/issues/837))
   - Added feature to specify multiple css themes that users can choose from in profile settings.
 - Swipe between photos on mobile ([issue #825](https://github.com/gtsteffaniak/filebrowser/issues/825))

**Notes**:
 - Changed partition calculations on linux for total disk size ([issue #982](https://github.com/gtsteffaniak/filebrowser/issues/982))
 - Upload conflict detection for folders offers `replace all` if the folder already exists in target location.

**BugFixes**:
 - TOTP prompt not showing generated code ([issue #996](https://github.com/gtsteffaniak/filebrowser/issues/996))
 - Select mulitple deselect on mobile ([issue #1002](https://github.com/gtsteffaniak/filebrowser/issues/1002))
 - Viewing svg images.

<img width="700" alt="image" src="https://github.com/user-attachments/assets/a4a82820-bb97-4cda-89ff-0f200b46d8ad" />

**Full Changelog**: [v0.7.16-beta...v0.7.17-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.7.16-beta...v0.7.17-beta) -- **Release**: [v0.7.17-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.17-beta).

---

## [v0.7.16-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.16-beta)

**Notes**:
 - More server logging for uploads when debug logging is enabled.

**BugFixes**:
 - Fix onlyoffice integration viewing bug ([issue #990](https://github.com/gtsteffaniak/filebrowser/issues/990))
 - Fix uploading files with exec permissions ([issue #984](https://github.com/gtsteffaniak/filebrowser/issues/984))
 - Fix redirect on no source path ([issue #989](https://github.com/gtsteffaniak/filebrowser/issues/989))
 - Refresh file info on rename ([issue #989](https://github.com/gtsteffaniak/filebrowser/issues/989))
 - Listing refreshes when uploads finish ([issue #989](https://github.com/gtsteffaniak/filebrowser/issues/989))
 - Disable edit mode for certain onlyoffice files ([issue #971](https://github.com/gtsteffaniak/filebrowser/issues/971))

**Full Changelog**: [v0.7.15-beta...v0.7.16-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.7.15-beta...v0.7.16-beta) -- **Release**: [v0.7.16-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.16-beta).

---

## [v0.7.15-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.15-beta)

**New Features**:
 - Added userDefault `disableViewingExt`. The new properties apply to all files, not just office.
 - Code blocks in markdown viewer have line numbers and each line has highlight.

**Notes**:
 - Replaced `disableOfficePreviewExt` with more generally applicable `disablePreviewExt` to disable preview for any specific file type.
 - More tooltip descriptions for settings options.

**BugFixes**:
 - Fix chinese and other language error ([issue #972](https://github.com/gtsteffaniak/filebrowser/issues/972)) ([issue #969](https://github.com/gtsteffaniak/filebrowser/issues/969))
 - Fix docker dockerfile for `docker run` ([issue #973](https://github.com/gtsteffaniak/filebrowser/issues/973))
 - Fix double slash href on single source ([issue #968](https://github.com/gtsteffaniak/filebrowser/issues/968))
 - Fix sources named "files" or "share" ([issue #949](https://github.com/gtsteffaniak/filebrowser/issues/949)) ([issue #574](https://github.com/gtsteffaniak/filebrowser/issues/574))
 - Focus input field on popups ([issue #976](https://github.com/gtsteffaniak/filebrowser/issues/976))
 - Hopeful fix for size calculation ([issue #982](https://github.com/gtsteffaniak/filebrowser/issues/982))
 - Edit button is not working on `.md` files ([issue #983](https://github.com/gtsteffaniak/filebrowser/issues/983))

**Full Changelog**: [v0.7.14-beta...v0.7.15-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.7.14-beta...v0.7.15-beta) -- **Release**: [v0.7.15-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.15-beta).

---

## [v0.7.14-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.14-beta)

**Notes**:
 - Updated translations ([issue #957](https://github.com/gtsteffaniak/filebrowser/issues/957))
 - enabled more doc types for OnlyOffice ([discussion #945](https://github.com/gtsteffaniak/filebrowser/discussions/945))

**BugFixes**:
 - No-auth user ([issue #955](https://github.com/gtsteffaniak/filebrowser/issues/955))
 - Error 403 on source name with special characters ([issue #952](https://github.com/gtsteffaniak/filebrowser/issues/952))
 - Delete pictures in previewer ([issue #456](https://github.com/gtsteffaniak/filebrowser/issues/456))
 - Trailing slash source name ([issue #920](https://github.com/gtsteffaniak/filebrowser/issues/920))
 - Image lazy loading issue causing all items to get previews at one time, not just whats in view.

**Full Changelog**: [v0.7.13-beta...v0.7.14-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.7.13-beta...v0.7.14-beta) -- **Release**: [v0.7.14-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.14-beta).

---

## [v0.7.13-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.13-beta)

{{% alert context="info" %}}
This release includes some highly requested features for uploading. There is now a full upload prompt which displays and tracks the progress of each uploaded item. There's also some big refactoring to make path issues much less likely to happen, so it should be much more consistent and reliable.

Note: Since chunk uploads are disabled by default, you'll need to enable your chunk size in settings. You can also set user defaults in your config file for new users:

```yaml
userDefaults:
  fileLoading:                  # upload and download settings
    maxConcurrentUpload: 10     # max is 10, default is 1
    uploadChunkSizeMb: 10       # 0 is disabled (default), typical is 5-50. A good first setting might be 15 MB
```

{{% /alert %}}

**New Features**:
 - Copy and Move files between sources ([issue #689](https://github.com/gtsteffaniak/filebrowser/issues/689))
 - New enhanced upload prompt:
   - Uses chunked uploads ([issue #770](https://github.com/gtsteffaniak/filebrowser/issues/770))
   - All or individual uploads can be paused/resumed.
   - Individual uploads can be retried.
   - Individual file upload progress ([issue #871](https://github.com/gtsteffaniak/filebrowser/issues/871))
   - Keeps screen on ([issue #900](https://github.com/gtsteffaniak/filebrowser/issues/900))

**Notes**:
 - Lots of UI improvements
 - Reworked a lot of the frontend path/source logic to be more consistent.
 - Updated sort behavior to be natural sort ([issue #551](https://github.com/gtsteffaniak/filebrowser/issues/551))
 - Optional quick save icon ([issue #918](https://github.com/gtsteffaniak/filebrowser/issues/918))
 - Improved language support: zh-tw chinese traditional (tawain).

**BugFixes**:
 - More accurate disk used calculation -- accounting for hard links and sparse files. ([issue #921](https://github.com/gtsteffaniak/filebrowser/issues/921))
 - Fix api key revoking mechanism.
 - Fixed shift-select ([issue #929](https://github.com/gtsteffaniak/filebrowser/issues/929))
 - Video preview images on safari ([issue #932](https://github.com/gtsteffaniak/filebrowser/issues/932))
 - Sticky mode isn't sticky ([issue #916](https://github.com/gtsteffaniak/filebrowser/issues/916))

<img width="400" alt="image" src="https://github.com/user-attachments/assets/9b95e26c-a9d1-439c-9157-bcdc6e384cbf" />

<img width="400" alt="image" src="https://github.com/user-attachments/assets/ca944feb-c62e-4029-9cec-569092f65930" />

**Full Changelog**: [v0.7.12-beta...v0.7.13-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.7.12-beta...v0.7.13-beta) -- **Release**: [v0.7.13-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.13-beta).

---

## [v0.7.12-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.12-beta)

Happy 4th of July!

The most noteworthy change is that no sources will be automatically enabled for any user. In order for a user to use a source, it needs to be added for that user. Or to keep a source available for all users, you can specify `defaultEnabled` in the source config to maintain the same behavior. See the wiki

 **New Features**:
 - Setting added `deleteWithoutConfirming`, useful for quickly deleting files -- does not apply to folders.
 - More options for minimal UI ([issue #208](https://github.com/gtsteffaniak/filebrowser/issues/745))
 - Dedicated section for sidebar customization in profile settings ([issue #437](https://github.com/gtsteffaniak/filebrowser/issues/437))

 **Notes**:
 - Filebrowser no longer requires a default source, users can be created without any sources.
 - Disables changing login type fallback behavior ([issue #620](https://github.com/gtsteffaniak/filebrowser/issues/620))
 - Uses calculated index size as "used" and total partition size as "total" ([issue #875](https://github.com/gtsteffaniak/filebrowser/issues/875))
 - Select multiple won't show up in context menu when using a desktop browser (with keyboard), opting for keyboard shortcuts.
 - Updated translations that were not complete, such as simplified chinese ([issue #895](https://github.com/gtsteffaniak/filebrowser/issues/895))
 - Larger min drop target size ([issue #902](https://github.com/gtsteffaniak/filebrowser/issues/902))
 - Refresh page after file actions ([issue #894](https://github.com/gtsteffaniak/filebrowser/issues/894))
 - Improved user PUT handler for easier user modification via API ([issue #897](https://github.com/gtsteffaniak/filebrowser/issues/897))
 - Optional sidebar actions for upload/create ([issue #885](https://github.com/gtsteffaniak/filebrowser/issues/885))

 **BugFixes**:
 - Dix delete in preview when moving between pictures. ([issue #456](https://github.com/gtsteffaniak/filebrowser/issues/456))
 - Getting file info issue when indexing is disabled.
 - Fixed initial sort order ([issue #551](https://github.com/gtsteffaniak/filebrowser/issues/551))
 - Incorrect filename Drag and Drop fixes ([issue #880](https://github.com/gtsteffaniak/filebrowser/issues/880))
 - Fix share duration always showing just now ([issue #896](https://github.com/gtsteffaniak/filebrowser/issues/896))

**Full Changelog**: [v0.7.11-beta...v0.7.12-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.7.11-beta...v0.7.12-beta) -- **Release**: [v0.7.12-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.12-beta).

---

## [v0.7.11-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.11-beta)

**Breaking Changes**:
  - `auth.resetAdminOnStart` has been removed. Instead, if you have `auth.adminPassword` set it will always be reset on startup. If you want to change your default admin password afterwards, make sure to unset `auth.adminPassword` so it doesn't get reset on startup.
  - Renamed include/exclude rules see the updated example wiki!

**New Features**:
 - More comprehensive exclude/include rules.
   - Include/exclude parts of folder names as well ([issue #854](https://github.com/gtsteffaniak/filebrowser/issues/854))
   - Include/exclude file or folder names globally.
 - `source.config.neverWatchPaths` is now functional -- a list of paths that get indexed initially, but skips re-indexing. Useful for directories you don't expect to change ever, still show up in search but get don't contribute to indexing time after initial indexing.

**Notes**:
 - Updated swagger docs ([issue #849](https://github.com/gtsteffaniak/filebrowser/issues/849))

**BugFixes**:
 - Fix version update notification for binary ([issue #836](https://github.com/gtsteffaniak/filebrowser/issues/836))
 - `ctrl-click` cache ([issue #735](https://github.com/gtsteffaniak/filebrowser/issues/735))
 - Fix admin user reset OIDC user ([issue #811](https://github.com/gtsteffaniak/filebrowser/issues/811)) ([issue #851](https://github.com/gtsteffaniak/filebrowser/issues/851))
 - Fix windows and binary muPdf ([issue #744](https://github.com/gtsteffaniak/filebrowser/issues/744))
 - Fix logout oidc ([issue #829](https://github.com/gtsteffaniak/filebrowser/issues/829)) ([issue #662](https://github.com/gtsteffaniak/filebrowser/issues/662))
 - File name upload bug ([issue #662](https://github.com/gtsteffaniak/filebrowser/issues/662))
 - Could not create share with absolute timestamps enabled ([issue #764](https://github.com/gtsteffaniak/filebrowser/issues/764))
 - Context menu off screen ([issue #828](https://github.com/gtsteffaniak/filebrowser/issues/828))

**Full Changelog**: [v0.7.10-beta...v0.7.11-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.7.10-beta...v0.7.11-beta) -- **Release**: [v0.7.11-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.11-beta).

---

## [v0.7.10-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.10-beta)

**OIDC change**: if you specify `oidc.userIdentifier: "username"`, originally this would map to `preferred_username` but now it maps to `username` explicitly. To maintain the same behavior update your config to `userIdentifier: "preferred_username"`. This was updated to allow for `username` to work as [some might need](https://github.com/gtsteffaniak/filebrowser/pull/789).

**New Features**:
 - Added settings option to stop sidebar from automatically hiding on editor and previews. ([issue #744](https://github.com/gtsteffaniak/filebrowser/issues/744))
 - Added more secrets loadable from environment variables. ([issue #790](https://github.com/gtsteffaniak/filebrowser/issues/790))
 - Include/exclude files are checked for existence to assist with configuration, will show as warning if something is configured but doesn't exist.
 - Added open in new tab link for preview items to view the raw picture, pdf, etc. Especially helpful for safari viewing PDF documents. ([issue #734](https://github.com/gtsteffaniak/filebrowser/issues/734))
 - Added autoplay media toggle in user profile, to automatically play videos and audio.

**Notes**:
 - Allowed to delete default admin user ([issue #811](https://github.com/gtsteffaniak/filebrowser/issues/811)) ([issue #762](https://github.com/gtsteffaniak/filebrowser/issues/762))
 - Better try/catch error handling for user feedback for shares ([issue #732](https://github.com/gtsteffaniak/filebrowser/issues/732))

**BugFixes**:
 - Fix share scope creation ([issue #809](https://github.com/gtsteffaniak/filebrowser/issues/809))
 - Fix oidc token logout ([issue #791](https://github.com/gtsteffaniak/filebrowser/issues/791))
 - Non-admin users OTP ([issue #815](https://github.com/gtsteffaniak/filebrowser/issues/815))
 - Linewrap issue for a few cases ([issue #810](https://github.com/gtsteffaniak/filebrowser/issues/810))
 - BaseUrl redirect issue with proxies ([issue #796](https://github.com/gtsteffaniak/filebrowser/issues/796))
 - Fix exclude still shows up in ui ([issue #797](https://github.com/gtsteffaniak/filebrowser/issues/797))
 - Copy/move functions are async ([issue #812](https://github.com/gtsteffaniak/filebrowser/issues/812))
 - Fix subtitle fetch ([issue #766](https://github.com/gtsteffaniak/filebrowser/issues/766))
 - Fix location memory issue for url encoded file names.

**Full Changelog**: [v0.7.9-beta...v0.7.10-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.7.9-beta...v0.7.10-beta) -- **Release**: [v0.7.10-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.10-beta).

---

## [v0.7.9-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.9-beta)

**New Features**:
 - Admin users will get a small notification banner for available update in sidebar with link to new release (check happens every 24 hours).

<img width="300" alt="image" src="https://github.com/user-attachments/assets/87faff7c-7b94-4347-bc92-89b1a5e04742" />

**Notes**:
 - Docker now defaults to `./data/databse.db` as the database path allowing a simplified initial `docker-compose.yaml`. Existing configurations do not need updating.
 - oidc groups header updates admin permission of existing user (either add/remove if role exists)'
 - Builds `amd64` binary with musl for compatibility (glic error) ([issue #755](https://github.com/gtsteffaniak/filebrowser/issues/755))
 - Eenamed `server.sources.config.disabled` to `server.sources.config.disableIndexing`
 - Better support for running with disabled index.
 - Small indexing behavior tweaks.
 - Markdown viewer hides sidebar ([issue #744](https://github.com/gtsteffaniak/filebrowser/issues/744))
 - Quick download only applies to files.

**BugFixes**:
 - Subtitles filename ([issue #678](https://github.com/gtsteffaniak/filebrowser/issues/678))
 - Search result links not working with custom `baseUrl` ([issue #746](https://github.com/gtsteffaniak/filebrowser/issues/746))
 - Preview error for office native preview ([issue #744](https://github.com/gtsteffaniak/filebrowser/issues/744))
 - More source name safety for special characters.
 - Shares with special character errors ([issue #753](https://github.com/gtsteffaniak/filebrowser/issues/753))
 - `backspace` navigates back a page when typing ([issue #663](https://github.com/gtsteffaniak/filebrowser/issues/663))
 - Markdown viewer scrolling ([issue #767](https://github.com/gtsteffaniak/filebrowser/issues/767))
 - Fix user permissions updated when modifying api key permissions.
 - Fix language change ([issue #487](https://github.com/gtsteffaniak/filebrowser/issues/487))

**Full Changelog**: [v0.7.8-beta...v0.7.9-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.7.8-beta...v0.7.9-beta) -- **Release**: [v0.7.9-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.9-beta).

---

## [v0.7.8-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.8-beta)

{{% alert context="info" %}}
Note: if using OIDC, please update from `v0.7.7` to resolve `invalid_grant` issue. Also - OIDC no longer creates users automatically by default -- must be enabled.
{{% /alert %}}

**New Features**:
 - More OIDC user creation options ([issue #685](https://github.com/gtsteffaniak/filebrowser/issues/685))
   - `auth.methods.oidc.createUser` must be true to automatically create user, defaults to false.
   - `auth.methods.oidc.adminGroup` allows using oidc provider group name to enable admin user creation.

**BugFixes**:
 - Fix save editor info sometimes saves wrong file. ([issue #701](https://github.com/gtsteffaniak/filebrowser/issues/701))
 - Make `ctrl` select work on mac or windows. ([issue #739](https://github.com/gtsteffaniak/filebrowser/issues/739))
 - OIDC login failures introduced in v0.7.6 ([issue #731](https://github.com/gtsteffaniak/filebrowser/issues/731))
 - OIDC respects non-default baseURL.

**Full Changelog**: [v0.7.7-beta...v0.7.8-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.7.7-beta...v0.7.8-beta) -- **Release**: [v0.7.8-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.8-beta).

---

## [v0.7.7-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.7-beta)

This release cleans up some of the native preview (image preview) feature logic. And adds simple docx and epub viewers as well. Going through all of this, I think I know how I can add full-fledge google doc and microsoft office viewer support (no edit). But, for now "onlyOffice" remains the most comprehensive solution with most compatibility and ability to fully edit. One day, I think I will be able to integrate a minimal license-free server into the docker image. But that's something for another time.

Native preview (image preview) support is also available for `linux-arm64` and `amd64` binaries, and windows `exe`.

**New Features**:
 - Since theres a wider kind of document preview types, a new `disableOfficePreviewExt` option has been added.
 - Native (and simple) docx and epub viewers.
 - Other documents like xlsx get full size image preview when opened and no onlyoffice support.

**Notes**:
 - All text mimetype files have preview support.
 - High-quality preview image sizes bumped from `512x512` to `640x640` to help make text previews readable.
 - No config is allowed and defaults to on source at current directory.

**BugFixes**:
 - Fix otp clearing on user save ([issue #699](https://github.com/gtsteffaniak/filebrowser/issues/699))
 - Admin special characters and general login improvements ([issue #594](https://github.com/gtsteffaniak/filebrowser/issues/594))
 - Updated editor caching behavior ([issue #701](https://github.com/gtsteffaniak/filebrowser/issues/701))
 - Move/copy file path issue and overwrite ([issue #687](https://github.com/gtsteffaniak/filebrowser/issues/687))
 - Fix popup preview loading on safari
 - `preview.highQuality` only affects gallery view mode. popop preview is always high quality, and icons are always low quality.

**Full Changelog**: [v0.7.6-beta...v0.7.7-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.7.6-beta...v0.7.7-beta) -- **Release**: [v0.7.7-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.7-beta).

---

## [v0.7.6-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.6-beta)

**New Features**:
 - Native document preview generation enabled for certain document types on the regular docker image (no office integration needed)
   - Supported native document preview types:
     - ".pdf",  // PDF
     - ".xps",  // XPS
     - ".epub", // EPUB
     - ".mobi", // MOBI
     - ".fb2",  // FB2
     - ".cbz",  // CBZ
     - ".svg",  // SVG
     - ".txt",  // TXT
     - ".docx", // DOCX
     - ".ppt",  // PPT
     - ".pptx", // PPTX
     - ".xlsx", // excel XLSX
     - ".hwp",  // HWP
     - ".hwp",  // HWPX
 - Proxy logout redirectUrl support via `auth.methods.proxy.logoutRedirectUrl` ([issue #684](https://github.com/gtsteffaniak/filebrowser/issues/684))

**Notes**:
 - Image loading placeholders added and remain if image can't be loaded.
 - No more arm32 support on main image -- use a `slim` tagged image.

**BugFixes**:
 - OnlyOffice and other cache issues ([issue #686](https://github.com/gtsteffaniak/filebrowser/issues/686))
 - Gallery size indicator centering ([issue #652](https://github.com/gtsteffaniak/filebrowser/issues/652))

**Full Changelog**: [v0.7.5-beta...v0.7.6-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.7.5-beta...v0.7.6-beta) -- **Release**: [v0.7.6-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.6-beta).

---

## [v0.7.5-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.5-beta)

 **New Features**
 - New `./filebrowser.exe setup` command for creating a config.yaml on first run. ([issue #675](https://github.com/gtsteffaniak/filebrowser/issues/675))
 - New 2FA/OTP support for password-based users.
 - `auth.password.enforcedOtp` option to enforce 2FA usage for password users.

 **Notes**:
 - Logging uses localtime, optional UTC config added ([issue #665](https://github.com/gtsteffaniak/filebrowser/issues/665))
 - Generated config example now includes defaults ([issue #590](https://github.com/gtsteffaniak/filebrowser/issues/590))
 - `server.debugMedia` config option added to help debug ffmpeg issues in the future (don't enable unless debugging an issue)
 - More translations additions from english settings [issue #653](https://github.com/gtsteffaniak/filebrowser/issues/653)
 - Visual tweaks ([issue #652](https://github.com/gtsteffaniak/filebrowser/issues/652))
 - Enhanced markdown viewer with code view spec.

 **BugFixes**:
 - Long video names ffmpeg issue fixed ([issue #669](https://github.com/gtsteffaniak/filebrowser/issues/669))
 - Certain files not passing content ([issue #657](https://github.com/gtsteffaniak/filebrowser/issues/657))
 - Popup viewer sometimes persists while scrolling on mobile ([issue #668](https://github.com/gtsteffaniak/filebrowser/issues/668))
 - Allow edit markdown files.
 - Rename button doesn't close prompt ([issue #664](https://github.com/gtsteffaniak/filebrowser/issues/664))
 - Webm video preview ([issue #673](https://github.com/gtsteffaniak/filebrowser/issues/673))
 - Fix signup issue ([issue #648](https://github.com/gtsteffaniak/filebrowser/issues/648))
 - Fix default source bug ([issue #666](https://github.com/gtsteffaniak/filebrowser/issues/666))
 - Fix 500 error for subtitle videos ([issue #678](https://github.com/gtsteffaniak/filebrowser/issues/678))
 - Spaces and special characters in source name ([issue #679](https://github.com/gtsteffaniak/filebrowser/issues/679))

![image](https://github.com/user-attachments/assets/28e4e67e-31a1-4107-9294-0e715e87b558)

**Full Changelog**: [v0.7.4-beta...v0.7.5-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.7.4-beta...v0.7.5-beta) -- **Release**: [v0.7.5-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.5-beta).

---

## [v0.7.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.4-beta)

**Notes**:
 - Updated German translation. ([pr #644](https://github.com/gtsteffaniak/filebrowser/pull/644))

**BugFixes**:
 - Windows `ctrl`+`click` ([issue #642](https://github.com/gtsteffaniak/filebrowser/issues/642))
 - Create user ([issue #647](https://github.com/gtsteffaniak/filebrowser/issues/647))

**Full Changelog**: [v0.7.3-beta...v0.7.4-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.7.3-beta...v0.7.4-beta) -- **Release**: [v0.7.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.4-beta).

---

## [v0.7.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.3-beta)

Note: OIDC changes require config update.

**New Features**
 - Added code highlights to text editor and enabled text editor for all asci files under 25MB
 - Motion previews for videos -- cycles screenshots of vidoes. ([issue #588](https://github.com/gtsteffaniak/filebrowser/issues/588))
 - Optionally reset default admin username/password on startup, to guarentee a username/password on startup if needed. Use by setting `auth.resetAdminOnStart` true ([issue #625](https://github.com/gtsteffaniak/filebrowser/issues/625))

**Notes**:
 - Updated translations everywhere. ([issue #627](https://github.com/gtsteffaniak/filebrowser/issues/627))
 - Office viewer is now full-screen with floating close button. ([issue #542](https://github.com/gtsteffaniak/filebrowser/issues/542))
 - OIDC config additions
   - `issuerUrl` required now to get relevant oidc configurations.
   - `disableVerifyTLS` optionally, disable verifying HTTPS provider endpoints.
   - `logoutRedirectUrl` optionally, redirect the user to this URL on logout.
   - other URL config parameters are no longer accepted -- replace with issuerUrl.
 - Admins allowed to change user login methods in user settings when creating or updating users ([issue #618](https://github.com/gtsteffaniak/filebrowser/issues/618)) ([issue #617](https://github.com/gtsteffaniak/filebrowser/issues/617))
 - Hide header when showing only office ([issue #542](https://github.com/gtsteffaniak/filebrowser/issues/542))

**BugFixes**:
 - Editor save shows notification.
 - Preview settings resetting on startup.
 - Not all languages show correctly ([issue #623](https://github.com/gtsteffaniak/filebrowser/issues/623))
 - scopes sometimes reset on startup ([issue #636](https://github.com/gtsteffaniak/filebrowser/issues/636))
 - Update save password option ([issue #587](https://github.com/gtsteffaniak/filebrowser/issues/587)) ([issue #619](https://github.com/gtsteffaniak/filebrowser/issues/619)) ([issue #615](https://github.com/gtsteffaniak/filebrowser/issues/615))

**Full Changelog**: [v0.7.2-beta...v0.7.3-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.7.2-beta...v0.7.3-beta) -- **Release**: [v0.7.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.3-beta).

---

## [v0.7.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.2-beta)

The `media` tags introduced in 0.7.0 have been removed -- all docker images have media enabled now.

**Notes**:
  - Reverts enforced user login methods types -- until suitable methods to alter are available.
  - When updating a user, updating scope always sets to the exact scope specified on updated.
  - Redirect api messages are `INFO` instead of `WARN`
  - Settings has close button instead of back ([issue #583](https://github.com/gtsteffaniak/filebrowser/issues/583))

**Bug Fixes**:
  - Hover bug when exact timestamp setting enabled ([issue #585](https://github.com/gtsteffaniak/filebrowser/issues/585))

**Full Changelog**: [v0.7.1-beta...v0.7.2-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.7.1-beta...v0.7.2-beta) -- **Release**: [v0.7.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.2-beta).

---

## [v0.7.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.1-beta)

The `media` tags introduced in v0.7.0 have been removed -- all docker images have media enabled now.

**Notes**:
  - Changes to support jwks url needed for authelia - still needs testing to ensure it works ([issue #575](https://github.com/gtsteffaniak/filebrowser/issues/575)) -- added debug logs to help identify any further issues.
  - Added apache license file back ([#599](https://github.com/gtsteffaniak/filebrowser/discussions/599))
  - Updated toggle view icons to better match.
  - Adjusted popup preview position on mobile.
  - Updated `createUserDir` logic ([issue #541](https://github.com/gtsteffaniak/filebrowser/issues/541))
    - It always creats user dir (even for admins)
    - Scope path must exist if it doesn't end in username, and if it does, the parent dir must exist
    - Enforced user login methods types -- can't be changed. a password user cannot login as oidc, etc.

**Bug Fixes**:
  - Right click context menu issue ([issue #598](https://github.com/gtsteffaniak/filebrowser/issues/598))
  - Upload file issue ([issue #597](https://github.com/gtsteffaniak/filebrowser/issues/597))
  - `defaultUserScope` is not respected ([issue #589](https://github.com/gtsteffaniak/filebrowser/issues/589))
  - `defaultEnabled` is not respected ([issue #603](https://github.com/gtsteffaniak/filebrowser/issues/603))
  - User has weird navigation bar ([issue #593](https://github.com/gtsteffaniak/filebrowser/issues/593))
  - Fix multibutton state issue for close overlay ([issue #596](https://github.com/gtsteffaniak/filebrowser/issues/596))

**Full Changelog**: [v0.7.0-beta...v0.7.1-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.7.0-beta...v0.7.1-beta) -- **Release**: [v0.7.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.1-beta).

---

## [v0.7.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.0-beta)

This release includes freeBSD binaries and new `media` docker image tags (see [ghcr](https://github.com/gtsteffaniak/filebrowser/pkgs/container/filebrowser) and [dockerhub](https://hub.docker.com/r/gtstef/filebrowser/tags))! The media versions include the video integration already configured -- but currently do not support armv7. To configure the video integration on other releases (such as the binary download from this page), you will need ffmpeg installed and the bin directory configured as part of the integration.

<img width="759" alt="image" src="https://github.com/user-attachments/assets/b171b1b5-80d9-4fec-ae3f-29d34f0e3fb4" />

See Configuration wiki example for OIDC authentication -- tested with authentik.

{{% alert context="info" %}}
This is a major beta release, it should automatically create a backup of your database, but please create a backup yourself as well. **There are changes that are not backwards compatible**!
{{% /alert %}}

**New Features**:
 - New authentication method: OIDC (OpenID Connect)
 - UI refresh:
   - Refreshed icons and styles to provide more contrast ([issue #493](https://github.com/gtsteffaniak/filebrowser/issues/493))
   - New scrollbar which includes information about the listing ([issue #304](https://github.com/gtsteffaniak/filebrowser/issues/304))
   - User-configurable popup previewer and user can control preview size of images.
   - Enhanced user settings page with more toggle options.
   - Replaced checkboxes with toggles switches ([issue #461](https://github.com/gtsteffaniak/filebrowser/issues/461))
   - Refreshed Breadcrumbs style.
   - Main navbar icon is multipurpose menu, close, back and animates
   - Enhanced source info on the UI:
     - User must have permission `realtime: true` property to get realtime events.
     - Sources shows status of the directory `ready`, `indexing`, and `unavailable`
   - Top-right overflow menu for deleting / editing files in peview ([issue #456](https://github.com/gtsteffaniak/filebrowser/issues/456))
   - Helpful UI animation for drag and drop files, to get feedback where the drop target is.
   - More consistent theme color ([issue #538](https://github.com/gtsteffaniak/filebrowser/issues/538))
 - New file preview types:
   - Video thumbnails available via new media integration, see configuration wiki for help ([issue #351](https://github.com/gtsteffaniak/filebrowser/issues/351))
   - Office file previews if you have office integration enabled. ([issue #460](https://github.com/gtsteffaniak/filebrowser/issues/460))

**Notes**:
  - `sesssionId` is now unique per window. Previously it was shared accross browser tabs.
  - `disableUsedPercentage` is a backend property now, so users can't "hack" the information to be shown.
  - Updated documentation for resources API ([issue #560](https://github.com/gtsteffaniak/filebrowser/issues/560))
  - Updated placeholder for scopes ([issue #475](https://github.com/gtsteffaniak/filebrowser/issues/475))
  - When user's API permissions are removed, any api keys the user had will be revoked.
  - `server.enableThumbnails` moved to `server.disablePreviews` defaulting to false.
  - `server.resizePreview` moved to `server.resizePreviews` (with an "s" at the end)

**Bug Fixes**:
  - Nil pointer error when source media is disconnected while running.
  - Source selection buggy ([issue #537](https://github.com/gtsteffaniak/filebrowser/issues/537))
  - Upload folder structure ([issue #539](https://github.com/gtsteffaniak/filebrowser/issues/539))
  - Editing files on multiple sources ([issue #535](https://github.com/gtsteffaniak/filebrowser/issues/535))
  - Prevent the user from changing the password ([issue #550](https://github.com/gtsteffaniak/filebrowser/issues/550))
  - Links in setting page does not navigate to correct location ([issue #474](https://github.com/gtsteffaniak/filebrowser/issues/474))
  - Url encoding issue ([issue #530](https://github.com/gtsteffaniak/filebrowser/issues/530))
  - Certain file types being treated as folders ([issue #555](https://github.com/gtsteffaniak/filebrowser/issues/555))
  - Source name with special characters ([issue #557](https://github.com/gtsteffaniak/filebrowser/issues/557))
  - Onlyoffice support on proxy auth ([issue #559](https://github.com/gtsteffaniak/filebrowser/issues/559))
  - Downloading with user scope ([issue #563](https://github.com/gtsteffaniak/filebrowser/issues/564))
  - User disableSettings property to be respected.
  - Non admin users updating admin settings.
  - Right click context issue on safari desktop.
  - office save file issue.

**Full Changelog**: [v0.6.8-beta...v0.7.0-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.6.8-beta...v0.7.0-beta) -- **Release**: [v0.7.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.7.0-beta).

---

## [v0.6.8-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.6.8-beta)

{{% alert context="warning" %}}
Hey everyone -- most of your existing configs will not work without adjustments for this release! Keep an eye on your service as you try to start it, it will tell you what needs updating. This one-time pain should make things much more helpful in the future. Thanks for understanding -- I didn't want to group this change in with v0.7.0 (which will get released in approx 2 weeks) since it includes many new features, I wanted to get configs cleaned up beforehand.
{{% /alert %}}

**New Features**
 - Environment variables are available for certain secrets.
   - See wiki
   - Thanks [@aaronkyriesenbach](https://github.com/aaronkyriesenbach) ([pr #511](https://github.com/gtsteffaniak/filebrowser/pull/511)).

**Notes**:
 - Config validation:
   - Fails when config file contains unknown fields (helps spot typos)
   - Some light value validation on certain fields
   - Removed recaptcha -- was disabled and not used before.
   - Moved `recaptcha` and `signup` configs to `auth.methods.password`

**BugFixes**:
 - Fix scope reset on restart ([issue #515](https://github.com/gtsteffaniak/filebrowser/issues/515))
 - Clicking empty space to deselect ([issue #492](https://github.com/gtsteffaniak/filebrowser/issues/492))

**Full Changelog**: [v0.6.7-beta...v0.6.8-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.6.7-beta...v0.6.8-beta) -- **Release**: [v0.6.8-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.6.8-beta).

---

## [v0.6.7-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.6.7-beta)

 **Notes**:
 - Added full tests for single source example.
 - Added descriptive error if temp dir can't be created on fatal startup
 - Clears temp directory on shutdown.
 - Removed put settings api (unused)
 - Removed more unused config properties.

 **BugFixes**:
 - Fix url encoding issue for search links when theres only one source ([issue #501](https://github.com/gtsteffaniak/filebrowser/issues/501)).
 - Files with `#` could have problems, double encoded.

**Full Changelog**: [v0.6.6-beta...v0.6.7-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.6.6-beta...v0.6.7-beta) -- **Release**: [v0.6.7-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.6.7-beta).

---

## [v0.6.6-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.6.6-beta)

{{% alert context="warning" %}}
A temp directory is now required for archive creation. By default, a `tmp` dir is created -- can be adjusted with `server.cacheDir`. If you are using an atypical user or running in an atypical environment, make sure the user that executes binary has access to create a `tmp` directory -- or mount/create a temp directory beforehand with the correct permissions.
{{% /alert %}}

 **New Feature**:
 - Limit `tar` size creation to limit server burden. For example, don't let customers try to download the entire filesystem as a zip. see `server.maxArchiveSize` on config wiki.

 **Notes**:
 - `disableUsedPercentage` also hides text and source bar.
 - Share errors show up in logs in more verbose way.
 - Archive creation occurs on disk rather than in memory, use `server.cacheDir` to determine where temp files are stored.
 - Automatically ensures leading slash for scope:
   - ([issue #472](https://github.com/gtsteffaniak/filebrowser/issues/472))
   - ([issue #476](https://github.com/gtsteffaniak/filebrowser/issues/476))

 **BugFixes**:
 - fix proxy user creation ([issue #478](https://github.com/gtsteffaniak/filebrowser/issues/478))
 - externalUrl prefix issue fixed for shares. ([issue #465](https://github.com/gtsteffaniak/filebrowser/issues/465))
 - fix File Opens Instead of Just Downloading. ([issue #480](https://github.com/gtsteffaniak/filebrowser/issues/480))
 - fix Download file name ([issue #481](https://github.com/gtsteffaniak/filebrowser/issues/481))

**Full Changelog**: [v0.6.5-beta...v0.6.6-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.6.5-beta...v0.6.6-beta) -- **Release**: [v0.6.6-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.6.6-beta).

---

## [v0.6.5-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.6.5-beta)

 **Notes**:
 - Added more share and download tests

 **BugFixes**:
 - Fix share download ([issue #465](https://github.com/gtsteffaniak/filebrowser/issues/465))
 - Fix content length size calculation issue when downloading multiple files.

**Full Changelog**: [v0.6.4-beta...v0.6.5-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.6.4-beta...v0.6.5-beta) -- **Release**: [v0.6.5-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.6.5-beta).

---

## [v0.6.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.6.4-beta)

 **BugFixes**:
 - Fix preview arow ([issue #457](https://github.com/gtsteffaniak/filebrowser/issues/457))
 - Fix password change issue.
 - Apply user defaults to public user on startup ([issue #451](https://github.com/gtsteffaniak/filebrowser/issues/451))

**Full Changelog**: [v0.6.3-beta...v0.6.4-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.6.3-beta...v0.6.4-beta) -- **Release**: [v0.6.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.6.4-beta).

---

## [v0.6.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.6.3-beta)

 **Notes**:
 - Windows directories get better naming, root directories like "D:\ get named "D", otherwise base filepath is the name when unselected "D:\path\to\folder" gets named "folder" (just like linux).
 - `.pdf` files added to default onlyoffice exclusion list.

 **BugFixes**:
 - Windows would not refresh file info automatically when viewing because of path issue.
 - Windows paths without name for "D:\" would cause issues.
 - Share path error ([issue #429](https://github.com/gtsteffaniak/filebrowser/issues/429))
 - Fix bug where resource content flag would load entire file into memory.

**Full Changelog**: [v0.6.2-beta...v0.6.3-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.6.2-beta...v0.6.3-beta) -- **Release**: [v0.6.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.6.3-beta).

---

## [v0.6.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.6.2-beta)

 **Notes**:
 - Added playwright tests for bugfixes for permantent fix for stability (except onlyoffice since it requires integrations).

 **BugFixes**:
 - Context menu should only be available inside the folder/files container ([issue #430](https://github.com/gtsteffaniak/filebrowser/issues/430))
 - drag and drop files from desktop to browser is fixed.
 - replace prompt cancel button didn't work.
 - key events on listing page not working (like delete key).
 - fixed share viewing ([issue #429](https://github.com/gtsteffaniak/filebrowser/issues/429))
 - disableUsedPercentage hides entire source ([issue #438](https://github.com/gtsteffaniak/filebrowser/issues/438))
 - `createUserDir` fix for proxy users and new users ([issue #440](https://github.com/gtsteffaniak/filebrowser/issues/440))

**Full Changelog**: [v0.6.1-beta...v0.6.2-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.6.1-beta...v0.6.2-beta) -- **Release**: [v0.6.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.6.2-beta).

---

## [v0.6.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.6.1-beta)

 **New Feature**:
 - Download size information is added, including when downloding multiple files in zip/tar.gz. The browser will see the XMB of X GB and will show browser native progress.

 **BugFixes**:
 - Fixed onlyoffice bug ([issue #418](https://github.com/gtsteffaniak/filebrowser/issues/418))
 - Fixed breadcrumbs bug ([issue #419](https://github.com/gtsteffaniak/filebrowser/issues/419))
 - Fixed search context bug ([issue #417](https://github.com/gtsteffaniak/filebrowser/issues/417))
 - Fixed sessionID for search.

**Full Changelog**: [v0.6.0-beta...v0.6.1-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.6.0-beta...v0.6.1-beta) -- **Release**: [v0.6.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.6.1-beta).


---

## [v0.6.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.6.0-beta)

{{% alert context="warning" %}}
This release includes several config changes that could cause issues. Please backup your database file before upgrading.
{{% /alert %}}
 
This release has several changes that should work without issues... however, still backup your database file first and proceed with caution. User permissions and source config changes have been updated -- and the `server.root` paramter is no longer used.

This is a significant step towards a stable release. There shouldn't be any major breaking config changes after this.

 **New Features**:
  - Multiple sources support ([issue #360](https://github.com/gtsteffaniak/filebrowser/issues/360))
    - Listing view keeps them independant, you switch between the two and the url address will have a prefix `/files/<sourcename>/path/to/file` when there is more than 1 source.
    - Search also happens independantly, with a selection toggle per source. searching current source searches the current scope in the listing view, if you toggle to an alternative source it will search from the source root.
    - Copy/moving is currently only supported within the same source -- that will come in a future release.
  - `FILEBROWSER_CONFIG` environment variable is respected if no CLI config parameter is provided. ([issue #413](https://github.com/gtsteffaniak/filebrowser/issues/413))

 **Notes**:
  - Downloads no longer open new window.
  - Swagger updated with auth api help for things like api token.
    - GET api keys now uses `name` query instead of `key`. eg `GET /api/auth/tokens?name=apikeyname`
  - User permissions simplified to four permission groups (no config change required):
    - **Removed**  : create, rename, delete, download
    - **Remaining**: admin, modify, share, api
    - `scope` is deprecated, but still supported, applies to default source. if using multiple sources, set `defaultUserScope` at the source config instead.
  - **removed** user rules and commands.
    - Commands feature has never been enabled so just removing the references.
    - Rules will come back in a different form (not applied to the user).
  - `server.root` is completely removed in favor of `server.sources`

 **BugFixes**:
  - Fix conflict resolution ([issue #384](https://github.com/gtsteffaniak/filebrowser/issues/384))
  - Many user creation page bugfixes.
  - Fix share delete ([issue #408](https://github.com/gtsteffaniak/filebrowser/issues/408))

<img width="294" alt="image" src="https://github.com/user-attachments/assets/669bca75-98d4-47c1-838b-1ffee2967d7d" />

**Full Changelog**: [v0.5.4-beta...v0.6.0-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.5.4-beta...v0.6.0-beta) -- **Release**: [v0.6.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.6.0-beta).


---

## [v0.5.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.5.4-beta)

 **BugFixes**:
  - default scope share issue. [@theryecatcher](https://github.com/theryecatcher) ([pr #387](https://github.com/gtsteffaniak/filebrowser/pull/387))
  - drag and drop on empty folders ([issue #361](https://github.com/gtsteffaniak/filebrowser/issues/361))
  - preview navigation issue ([issue #372](https://github.com/gtsteffaniak/filebrowser/issues/372))
  - auth proxy password length error ([issue #375](https://github.com/gtsteffaniak/filebrowser/issues/375))

**Full Changelog**: [v0.5.3-beta...v0.5.4-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.5.3-beta...v0.5.4-beta) -- **Release**: [v0.5.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.5.4-beta).

---

## [v0.5.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.5.3-beta)

 **New Features**:
  - onlyoffice disable filetypes for user specified file types. ([issue #346](https://github.com/gtsteffaniak/filebrowser/issues/346))

 **Notes**:
  - navbar/sidebar lightmode style tweaks.
  - any item that has utf formatted text will get editor.
  - tweaks to create options on context menu.
  - removed small delay on preview before detecting the file.

 **BugFixes**:
  - fix `/files/` prefix loading ([issue #362](https://github.com/gtsteffaniak/filebrowser/issues/362))
  - fix special characters in filename ([issue #357](https://github.com/gtsteffaniak/filebrowser/issues/357))
  - fix drag and drop ([issue #361](https://github.com/gtsteffaniak/filebrowser/issues/361))
  - fix conflict issue with creating same file after deletion.
  - fix mimetype detection ([issue #327](https://github.com/gtsteffaniak/filebrowser/issues/327))
  - subtitles for videos ([pr #358](https://github.com/gtsteffaniak/filebrowser/issues/358))
    - supports caption sidecar files : ".vtt", ".srt", ".lrc", ".sbv", ".ass", ".ssa", ".sub", ".smi"
    - embedded subtitles not yet supported.

**Full Changelog**: [v0.5.2-beta...v0.5.3-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.5.2-beta...v0.5.3-beta) -- **Release**: [v0.5.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.5.3-beta).

---

## [v0.5.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.5.2-beta)

 **New Features**:
  - Markdown file preview ([issue #343](https://github.com/gtsteffaniak/filebrowser/issues/343))
  - Easy access download button ([issue #341](https://github.com/gtsteffaniak/filebrowser/issues/341))

 **Notes**:
  - Adds message about what sharing means when creating a link.
  - api log duration is now always in milliseconds for consistency.
  - advanced index config option `fileEndsWith` is now respected.
  - Added Informative error for missing files for certificate load ([issue #354](https://github.com/gtsteffaniak/filebrowser/issues/354))

 **BugFixes**:
  - onlyoffice close window missing files ([issue #345](https://github.com/gtsteffaniak/filebrowser/issues/345))
  - fixed download link inside file preview

**Full Changelog**: [v0.5.1-beta...v0.5.2-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.5.1-beta...v0.5.2-beta) -- **Release**: [v0.5.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.5.2-beta).

---

## [v0.5.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.5.1-beta)

{{% alert context="info" %}}
Note: I changed the config for password auth again... It was a mistake just to make it a boolean, so now you can provide options, going forward this allows for more.
{{% /alert %}}

**New Features**:
- password length requirement config via `auth.methods.password.minLength` as a number of characters required.

**Bugfixes**:
- NoAuth error message "resource not found".
- CLI user configuration works and simplified see examples in the Wiki.

**Full Changelog**: [v0.5.0-beta...v0.5.1-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.5.0-beta...v0.5.1-beta) -- **Release**: [v0.5.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.5.1-beta).

---

## [v0.5.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.5.0-beta)

{{% alert context="info" %}}
Note: This Beta release includes a configuration change: `auth.method` is now deprecated. This is done to allow multiple login methods at once. Auth methods are specified via `auth.methods` instead. See example on the wiki. If you don't update your config, you'll see a warning and it will default to password method.
{{% /alert %}}

  **New Features**:
  - Upload progress notification ([issue #303](https://github.com/gtsteffaniak/filebrowser/issues/303))
  - Proxy auth auto create user when `auth.methods.proxy.createUser: true` while using proxy auth.

  **Notes**:
  - Context menu positioning tweaks.
  - Using /tmp cachedir is disabled by default, cache dir can be specified via `server.cacheDir: /tmp` to enable it. ([issue #326](https://github.com/gtsteffaniak/filebrowser/issues/326))

  **Bugfixes**:
  - Gracefully shutdown to protect database. ([issue #317](https://github.com/gtsteffaniak/filebrowser/issues/317))
  - validates auth method provided before server startup.
  - fix sidebar disk space usage calculation. ([issue #315](https://github.com/gtsteffaniak/filebrowser/issues/315))
  - Fixed proxy auth header support (make sure your proxy and server are secure!). ([issue #322](https://github.com/gtsteffaniak/filebrowser/issues/322))

**Full Changelog**: [v0.4.2-beta...v0.5.0-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.4.2-beta...v0.5.0-beta) -- **Release**: [v0.5.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.5.0-beta).

---

## [v0.4.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.4.2-beta)

  **New Features**:
  - Hidden files changes
    - Windows hidden file properties are respected -- when running on windows binary (not docker) with NTFS filesystem.
    - Windows "system" files are considered hidden.
    - Changed user property from `hideDotFiles` to `showHidden`. Defaults to false, so a user would need to must unhide hidden files if they want to view hidden files.

  **Notes**:
  - Cleaned up old and deprecated config.
  - Removed unneeded "Global settings". All system configuration is done on config yaml, See configuration wiki for more help.

  **Bugfixes**:
  - Another fix for memory ([issue #208](https://github.com/gtsteffaniak/filebrowser/issues/298))

**Full Changelog**: [v0.4.1-beta...v0.4.2-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.4.1-beta...v0.4.2-beta) -- **Release**: [v0.4.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.4.2-beta).


---

## [v0.4.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.4.1-beta)

  **New Features**:
  - Right-click actions are available on search. ([issue #273](https://github.com/gtsteffaniak/filebrowser/issues/273))

  **Notes**:
  - Delete prompt now lists all items that will be affected by delete
  - Debug and logger output tweaks.

  **Bugfixes**:
  - calculating checksums errors.
  - copy/move issues for some circumstances.
  - The previous position wasn't returned when closing a preview window ([issue #298](https://github.com/gtsteffaniak/filebrowser/issues/298))
  - fixed sources configuration mapping error (advanced `server.sources` config)

![image](https://github.com/user-attachments/assets/5c7f9ad3-67a6-4ef5-a459-539c0f3400a4)

**Full Changelog**: [v0.4.0-beta...v0.4.1-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.4.0-beta...v0.4.1-beta) -- **Release**: [v0.4.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.4.1-beta).

---

## [v0.4.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.4.0-beta)

  **New Features**:
  - Better logging ([issue #288](https://github.com/gtsteffaniak/filebrowser/issues/288))
    - Highly configurable
    - Api logs include user ([issue #287](https://github.com/gtsteffaniak/filebrowser/issues/287))
  - OnlyOffice support for editing only office files (inspired from [filebrowser/filebrowser#2954](https://github.com/filebrowser/filebrowser/pull/2954))

  **Notes**:
  - Breadcrumbs will only show on file listing (not on previews or editors)
  - Config file is now optional. It will run with default settings without one and throw a `[WARN ]` message.
  - Added more descriptions to swagger API.

**Full Changelog**: [v0.3.7-beta...v0.4.0-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.3.7-beta...v0.4.0-beta) -- **Release**: [v0.4.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.4.0-beta).

---

## [v0.3.7-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.3.7-beta)

  **Notes**:
  - Adding windows builds back to automated process... will replace manually if they throw malicious defender warnings.
  - Adding playwright tests to all pr's against dev/beta/release branches.
    - These playwright tests should help keep release more reliably stable.

  **Bugfixes**:
  - closing with the default bar issue.
  - tar.gz archive creation ([issue #282](https://github.com/gtsteffaniak/filebrowser/issues/282))

**Full Changelog**: [v0.3.6-beta...v0.3.7-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.3.6-beta...v0.3.7-beta) -- **Release**: [v0.3.7-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.3.7-beta).

---

## [v0.3.6-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.3.6-beta)

  **New Features**:
  - Adds "externalUrl" server config ([issue #272](https://github.com/gtsteffaniak/filebrowser/issues/272))

  **Notes**:
  - All views modes to show header bar for sorting.
  - other small style changes

  **Bugfixes**:
  - select and info bug after sorting ([issue #277](https://github.com/gtsteffaniak/filebrowser/issues/277))
  - downloading from shares with public user
  - Ctrl and Shift key modifiers work on listing views as expected.
  - copy/move file/folder error and show errors ([issue #278](https://github.com/gtsteffaniak/filebrowser/issues/278))
  - file move/copy context fix.

**Full Changelog**: [v0.3.5...v0.3.6-beta](https://github.com/gtsteffaniak/filebrowser/compare/v0.3.5...v0.3.6-beta) -- **Release**: [v0.3.6-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.3.6-beta).

---

## [v0.3.5-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.3.5)

  **New Features**:
  - More indexing configuration options possible. However consider waiting on using this feature, because I will soon have a full onboarding experience in the UI to manage sources instead.
    - added config file options "sources" in the server config.
    - can enable/disable indexing a specified list of directories/files
    - can enable/disable indexing hidden files
    - prepped for multiple sources (not supported yet!)
  - Theme and Branding support see updates to configuration wiki on how to use
  - Automatically expire shares ([issue #208](https://github.com/gtsteffaniak/filebrowser/issues/208))

  **Notes**:
  - MacOS application files (ending in ".app") were previously treated as folders, now they are treated as a single file.
  - No longer indexes "$RECYCLE.BIN" or "System Volume Information" directories.
  - Icon styling tweaked so all icons have a background.
  - Updated Login page styling.
  - Settings profile menu has been simplified, password changes happen in user management.
  - Improved windows compatibility and built on windows platform to fix false windows defender warning.
  - If no "root" location is provided in the server config, the default is the **current directory** (rather than `/srv` like before)

  **Bugfixes**:
  - Fixed setting share expiration time would not work due to type conversion error.
  - More safari fixes related to text-selection.
  - Sort by name value sorting ignores the extension, only sorts by name ([issue #230](https://github.com/gtsteffaniak/filebrowser/issues/230))
  - Fixed manual language selection issue.
  - Fixed exact date time issue.

New login page:

<img width="300" alt="image" src="https://github.com/user-attachments/assets/d3ed359e-a969-4f6a-9f72-94d2b68aba49" />

Example branding in sidebar:

<img width="500" alt="image2" src="https://github.com/user-attachments/assets/d8ee14ca-4495-4106-9d26-631a5937e134" />

Example user settings page:

<img width="500" alt="image3" src="https://github.com/user-attachments/assets/79757a11-669e-4597-bd3d-e41efd667a1e" />

**Full Changelog**: [v0.3.4...v0.3.5](https://github.com/gtsteffaniak/filebrowser/compare/v0.3.4...v0.3.5) -- **Release**: [v0.3.5](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.3.5).

---

## [v0.3.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.3.4)

  **Bugfixes**:
  - Safari right-click actions.
  - Some small image viewer behavior
  - Progressive webapp "install to homescreen" fix.

**Full Changelog**: [v0.3.3...v0.3.4](https://github.com/gtsteffaniak/filebrowser/compare/v0.3.3...v0.3.4) -- **Release**: [v0.3.4](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.3.4).

---

## [v0.3.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.3.3)

  **New Features**
  - Navigating remembers your previous scroll position when opening items and then navigating backwards.
  - New Icons with larger selection of file types
  - file "type" is shown on item info page.
  - added optional non-root "filebrowser" user for docker image. See [#251](https://github.com/gtsteffaniak/filebrowser/issues/251)
  - File preview supports more file types:
    - images: jpg, bmp, gif, tiff, png, svg, heic, webp.

  **Notes**:
  - The file "type" is now either "directory" or a specific mimetype such as "text/xml".
  - update safari styling.

  **Bugfixes**:
  - Delete/move file/folders sometimes wouldn't work.
  - Possible fix for context menu not showing issue. See [#251](https://github.com/gtsteffaniak/filebrowser/issues/251)
  - Fixed drag/drop not refreshing immediately to reflect changes.

**Full Changelog**: [v0.3.2...v0.3.3](https://github.com/gtsteffaniak/filebrowser/compare/v0.3.2...v0.3.3) -- **Release**: [v0.3.3](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.3.3).

---

## [v0.3.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.3.2)

  **New Features**
  - Mobile search has the same features as desktop.

  **Notes**:
  - Added compression. Helpful for browsing folders with a large number of items. Considering [#201](https://github.com/gtsteffaniak/filebrowser/issues/201) resolved, although future pagination support will still come.
  - Compressed download options limited to `.zip` and `.tar.gz`.
  - Right-click context menu stays in view.

  **Bugfixes**:
  - Search result links when non-default baseUrl configured
  - Frontend sort bug squashed [#230](https://github.com/gtsteffaniak/filebrowser/issues/230)
  - Bug which caused "noauth" method not to work after v0.3.0 routes update.

**Full Changelog**: [v0.3.1...v0.3.2](https://github.com/gtsteffaniak/filebrowser/compare/v0.3.1...v0.3.2) -- **Release**: [v0.3.2](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.3.2).

---

## [v0.3.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.3.1)

  **New Features**
  - Adds Smart Indexing by default.

  **Notes**:
  - Optimized api request response times via improved caching and simplified actions.
  - User information persists more reliably.
  - Added indexing doc to explain the expectations around indexing and how it works.
  - The index should also use less RAM than it did in v0.3.0.

  **Bugfixes**:
  - Tweaked sorting by name, fixes case sensitive and numeric sorting. [#230](https://github.com/gtsteffaniak/filebrowser/issues/230)
  - Fixed unnecessary authentication status checks each route change
  - Fix create file action issue.
  - some small javascript related issues.
  - Fixes pretty big bug viewing raw content in v0.3.0 (utf format message)

**Full Changelog**: [v0.3.0...v0.3.1](https://github.com/gtsteffaniak/filebrowser/compare/v0.3.0...v0.3.1) -- **Release**: [v0.3.1](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.3.1).

---

## [v0.3.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.3.0)

  This Release focuses on the API and making it more accessible for developers to access functions without the UI.

  **New Features**:
  - You can now long-live api tokens to interact with API from the user settings page.
    - These tokens have the same permissions as your user.
  - Helpful swagger page for API usage.
  - Some API's were refactored for friendlier API usage, moving some attributes to parameters and first looking for a api token, then using the stored cookie if none is found. This allows for all api requests from swagger page to work without a token.
  - Add file size to search preview! Should have been in last release... sorry!

  **Notes**:
  - Replaced backend http framework with go standard library.
  - Right-click Context menu can target the item that was right-clicked. To fully address [#214](https://github.com/gtsteffaniak/filebrowser/issues/214)
  - Adjusted settings menu for mobile, always shows all available cards rather than grayed out cards that need to be clicked.
  - Longer and more cryptographically secure share links based on UUID rather than base64.

  **Bugfixes**:
  - Fixed ui bug with shares with password.
  - Fixed baseurl related bugs [#228](https://github.com/gtsteffaniak/filebrowser/pull/228) Thanks [@SimLV](https://github.com/SimLV)
  - Fixed empty directory load issue.
  - Fixed image preview cutoff on mobile.
  - Fixed issue introduced in v0.2.10 where new files and folders were not showing up on ui.
  - Fixed preview issue where preview would not load after viewing video files.
  - Fixed sorting issue where files were not sorted by name by default.
  - Fixed copy file prompt issue.

**Full Changelog**: [v0.2.10...v0.3.0](https://github.com/gtsteffaniak/filebrowser/commits/v0.3.0) -- **Release**: [v0.3.0](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.3.0).

---

## [v0.2.10-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.2.10)

  **New Features**:
  - Allows user creation command line arguments ([issue #196](https://github.com/gtsteffaniak/filebrowser/issues/196)).
  - Folder sizes are always shown, leveraging the index. ([issue #138](https://github.com/gtsteffaniak/filebrowser/issues/138)).
  - Searching files based on filesize is no longer slower.

  **Bugfixes**:
  - fixes file selection usage when in single-click mode ([issue #214](https://github.com/gtsteffaniak/filebrowser/issues/214)).
  - Fixed displayed search context on root directory.
  - Fixed issue searching "smaller than" actually returned files "larger than".

  **Notes**:
  - Memory usage from index is reduced by ~40%.
  - Indexing time has increased 2x due to the extra processing time required to calculate directory sizes.
  - File size calculations use 1024 base vs previous 1000 base (matching windows explorer).

**Full Changelog**: [v0.2.9...v0.2.10](https://github.com/gtsteffaniak/filebrowser/compare/v0.2.9...v0.2.10) -- **Release**: [v0.2.10](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.2.10).

---

## [v0.2.9-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.2.9)

  This release focused on UI navigation experience. Improving keyboard navigation and adds right click context menu.

  **New Features**:
  - listing view items are middle-clickable on selected listing or when in single-click mode.
  - listing view items can be navigated via arrow keys.
  - listing view can jump to items using letters and number keys to cycle through files that start with that character.
  - You can use the enter key and backspace key to navigate backwards and forwards on selected items.
  - ctr-space will open/close the search (leaving ctr-f to browser default find prompt)
  - Added right-click context menu to replace the file selection prompt.

  **Bugfixes**:
  - Fixed drag to upload not working.
  - Fixed shared video link issues.
  - Fixed user edit bug related to other user.
  - Fixed password reset bug.
  - Fixed loading state getting stuck.

![image](https://github.com/user-attachments/assets/3d6f4619-4985-4ce3-952f-286510dff4f1)

**Full Changelog**: [v0.2.8...v0.2.9](https://github.com/gtsteffaniak/filebrowser/compare/v0.2.8...v0.2.9) -- **Release**: [v0.2.9](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.2.9).

---

## [v0.2.8-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.2.8)

<img width="1170" alt="image" src="https://github.com/user-attachments/assets/82004003-befa-4b83-bc7b-2c8fbd920dfe">

- **Feature**: New gallery view scaling options (closes [#141](https://github.com/gtsteffaniak/filebrowser/issues/141))
- **Change**: Refactored backend files functions
- **Change**: Improved UI response to filesystem changes
- **Change**: Added frontend tests for deployment integrity
- **Fix**: move/replace file prompt issue
- **Fix**: opening files from search
- **Fix**: Display count issue when hideDotFile is enabled.

**Full Changelog**: [#193](https://github.com/gtsteffaniak/filebrowser/pull/193) -- **Release**: [v0.2.8](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.2.8).

---

## [v0.2.7-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.2.7)

 - **Change**: New sidebar style and behavior.
 - **Change**: make search view and button behavior more consistent.
 - **Fix**: [upload file bug](https://github.com/gtsteffaniak/filebrowser/issues/153)
 - **Fix**: user lock out bug introduced in `0.2.6`
 - **Fix**: many minor state related issues.

**Release**: [v0.2.7](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.2.7).

## [v0.2.6-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.2.6)

This change focuses on minimizing and simplifying build process.

- **Change**: Migrated to Vite / Vue 3
- **Change**: removed npm modules
  - replaced vuex with custom state management via src/store
  - replaced noty with simple card popup notifications
  - replaced moment with simple date formatter where needed
  - replaced vue-simple-progress with vue component
- **Feature**: improved error logging
  - backend errors show the root function that called them during the error
  - frontend errors print errors to console that fail try/catch
  - all frontend errors via popup notification & print to console as well
- **Fix**: Allow editing blank text based files in editor
- tweaked listing styles
- Feature: Allow disabling the index via configuration yaml

---

## [v0.2.5-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.2.5)

- Fix: delete user prompt works using native hovers.

---

## [v0.2.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.2.4)

- Feature: [create-folder-feature](https://github.com/gtsteffaniak/filebrowser/pull/105)
- Feature: [playable shared video](https://github.com/filebrowser/filebrowser/issues/2537)
- Feature: photos, videos, and audio get embedded preview on share instead of icon
- Fix: sharable link bug, now uses special publicUser
- Bump go version to 1.22
- In prep for vue3 migration, npm modules removed:
  - js-base64
  - pretty-bytes
  - whatwg-fetch
  - lodash.throttle
  - lodash.clonedeep

---

## [v0.2.3-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.2.3)

- Feature: token expiration time now configurable
- FIX: Hidden files are still directly accessible ([issue #2698](https://github.com/gtsteffaniak/filebrowser/issues/2698)).
- FIX: search/user context bug

---

## [v0.2.2-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.2.2)

- CHG: **Speed:** (0m57s) - Decreased by 78% compared to the previous release.
- CHG: **Memory Usage:** (41MB) - Reduced by 45% compared to the previous release.
- Feature: Now utilizes the index for file browser listings!
- FIX: Editor issues fixed on save and themes.

---

## [v0.2.1-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.2.1)

- Addressed [issue #29](https://github.com/gtsteffaniak/filebrowser/issues/29) - Rules can now be configured and read from the configuration YAML.
- Addressed [issue #28](https://github.com/gtsteffaniak/filebrowser/issues/28) - Allows disabling settings per user.
- Addressed [issue #27](https://github.com/gtsteffaniak/filebrowser/issues/27) - Shortened download link for password-protected files.
- Addressed [issue #26](https://github.com/gtsteffaniak/filebrowser/issues/26) - Enables dark mode per user and improves switching performance.
- Improved styling with more rounded corners and enhanced listing design.
- Enhanced search performance.
- Fixed authentication issues.
- Added compact view mode.
- Improved view mode configuration and behavior.
- Updated the configuration file to accept new settings.

---

## [v0.2.0-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.2.0)

- **Improved UI:**
  - Enhanced the cohesive and unified look.
  - Adjusted the header bar appearance and icon behavior.
- The shell feature has been deprecated.
  - Custom commands can be executed within the Docker container if needed.
- The JSON config file is no longer used.
  - All configurations are now performed via the advanced `config.yaml`.
  - The only allowed flag is specifying the config file.
- Removed old code for migrating database versions.
- Eliminated all unused `cmd` code.

---

## [v0.1.4-beta](https://github.com/gtsteffaniak/filebrowser/releases/tag/v0.1.4)

- **Various UI fixes:**
  - Reintroduced the download button to the toolbar.
  - Added the upload button to the side menu.
  - Adjusted breadcrumb spacing.
  - Introduced a "compact" view option.
  - Fixed a slash issue with CSS right-to-left (RTL) logic.
- **Various backend improvements:**
  - Added session IDs to searches to prevent collisions.
  - Modified search behavior to include spaces in searches.
  - Prepared for full JSON configuration support.
- Made size-based searches work for both smaller and larger files.
- Modified search types not to appear in the search bar when used.

---

## v0.1.3

- Enhanced styling with improved colors, transparency, and blur effects.
- Hid the sidebar on desktop views.
- Simplified the navbar to include three buttons:
  - Open menu
  - Search
  - Toggle view
- Revised desktop search style and included additional search options.

---

## v0.1.2

- Updated the UI to better utilize search features:
  - Added more filter options.
  - Enhanced icons with colors.
  - Improved GUI styling.
- Improved search performance.
- **Index Changes:**
  - **Speed:** (0m32s) - Increased by 6% compared to the previous release.
  - **Memory Usage:** (93MB) - Increased by 3% compared to the previous release.

---

## v0.1.1

- Improved search functionality with indexing.
- **Index Changes (Baseline Results):**
  - **Speed:** (0m30s)
  - **Memory Usage:** (90MB)

---

## v0.1.0

- No changes from the original.

Forked from [filebrowser/filebrowser](https://github.com/filebrowser/filebrowser).
