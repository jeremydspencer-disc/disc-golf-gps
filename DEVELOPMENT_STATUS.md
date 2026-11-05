# Chain Chaser development status

Updated: 2026-11-05 (America/Denver).

## Pause point and release

- Development is paused after completing read-only Data Backup Preview, backup validation/export, and the approved reliability/UI work. No actual Full Backup restoration is implemented.
- Verified application release commit: `4ead21b6a2478d8edafdd8e838a5c65023342e11` — Complete read-only backup preview and reliability fixes.
- Production application: https://jeremydspencer-disc.github.io/disc-golf-gps/chain-chaser-preview.html
- Production repository: https://github.com/jeremydspencer-disc/disc-golf-gps
- GitHub Pages publishes `main`, repository root. Pushing to `main` can publish immediately. The entry point is `chain-chaser-preview.html`; `index.html` and `test.html` were intentionally removed and must remain absent.
- Application publication verified: GitHub Pages workflow [42100569846](https://github.com/jeremydspencer-disc/disc-golf-gps/actions/runs/42100569846) completed successfully for the application release SHA. The live HTML, unchanged loader, Maps configuration, logo, manifest and four course documents returned HTTP 200 and matched release bytes exactly. The preview entry and preview-only notice are in the live HTML. `index.html` and `test.html` returned 404 as intended. Verification fetched assets without reading player storage; it is not a real-device gameplay test.
- This document is committed separately after the application. Its own commit can be found with `git log -1 -- DEVELOPMENT_STATUS.md`; the application release hash above deliberately does not refer to this document's commit.

## Completed features

- Individual and local group scoring, arbitrary starting holes, completed-hole review/corrections, physical-disc IDs and snapshots, GPS/manual-pin throw recording, Undo, refresh/resume safeguards, and voice controls.
- Physical-disc management with duplicate models, colors, archival, searchable categories, editable details, and collapsible Add Disc form. Photos and existing statistics remain supported.
- Shared course library, validated cache, protected personal mappings, pinned revisions, and cache-only fallback. Courses remain Private Course (19), Mills Park (13, custom Hole 13 at 303 ft), Disc On 6th (10), and Dry Creek Main 12 / Custom 13 (2A between 2 and 3, internal ID 13). Preserve `privare-course-salt-lake-city-ut` exactly.
- Existing production Maps configuration loads automatically; optional manual overrides remain. Its configuration, library implementation, course JSON, manifest and logo were not changed in this release.
- Approved mobile Play improvements: 280px map, compact distance panel, Round score, clarified gameplay/voice statuses, preserved large touch targets and translucent map controls. Secondary page header cleanup is included.
- Reliability fixes from Steps 132A–132H: correction/Undo estimate consistency; validated mapping imports; mapping save rollback/write blocking; teammate-score rollback; stale Measure Throw GPS callback protection; physical-ID analytics grouping; unreadable mapping protection. Follow-ups correct Measure Throw error status and preserve teammate scores in normally completed history.
- Full Backup v2 exports exact stored strings with SHA-256 over UTF-16LE code units, no BOM or normalization. Saved Maps overrides are excluded by default, available only through explicit export opt-in; the production configuration key is not collected.
- Pure validation supports v1/v2 backups. Read-only preview under More → Data backup summarizes counts, compares supported keys, and identifies destination dependency conflicts. Invalid files are rejected before current-storage reads. Maps overrides cannot be restored. No Restore/Confirm execution control exists.

## Final verification

Final rerun on 2026-11-05:

- 36 Chrome component/browser checks passed; zero failures. Visible Chrome used a disposable profile, synthetic in-memory storage and the actual preview HTML/CSS/functions. No real player storage was accessed.
- 320px and 390px: dialog fits, no horizontal overflow, wrapping/scrolling works, sticky Close remains accessible. Screenshots were inspected.
- Native FileReader/Web Crypto and local JSON input tested: v1/v2, malformed JSON, invalid checksum, unsupported version, oversized file, Close/Escape, overlapping selection, stale-result rejection, sensitive-data redaction and dependency conflicts.
- Native backup downloads preserve strings and match independent Node SHA-256 calculations. Default Maps exclusion and explicit export opt-in both pass.
- Zero storage writes/app saves/configuration access in preview/export tests; no runtime JavaScript errors in those tests.
- 28 existing shared-library synthetic regression assertions passed.
- Full inline JavaScript syntax, CSS brace structure, unique HTML IDs and `git diff --check` passed.
- All four unchanged release course files matched the manifest hashes. Staged HTML matched the reviewed release bytes after explicit LF normalization; no new credentials were found.
- Earlier preview foundation: 35 synthetic tests passed before this browser-verification phase. They are prior evidence, not an additional final rerun count.
- This final gate is not a complete GPS, microphone, scoring or real-device end-to-end rerun. Broader fixes have their earlier implementation regression evidence and static review; final Android/iPhone integration remains required.

## Data protection and known limitations

- Player data is browser-origin localStorage, not an account/cloud service. Browser clearing, eviction, Guest/private-window closure, device loss or an origin change can lose it. Keep downloaded Full Backups privately outside the repository; export does not back up unsaved/session-only state.
- Preview never restores, merges, overwrites or deletes data. A valid preview is not a guaranteed restore plan. Corrupt/unreadable current data is reported, not repaired.
- Actual restore execution, safety backups, transaction journals and recovery are not implemented. Do not promise automatic recovery from a downloaded backup.
- Shared-course caching is not an offline installation of app HTML/JavaScript or satellite imagery. Fresh offline page loads may fail. New browser origins need their own disc bag and permissions.
- Local group scorekeeping is implemented; real multi-device synchronization, accounts and backend integration are not. Some existing UI describes hypothetical future synchronization; it must not be treated as implemented.
- iPhone Safari and Android Chrome microphone support, permission prompts, GPS accuracy, background behavior, mobile file pickers/downloads and long-round recovery require real-device testing.
- Personal mapping bytes, disc IDs and saved round relationships must be preserved. Never recover data by renumbering holes, guessing physical disc identity from a name, clearing storage or automatically rewriting historical records.
- Public Pages course files are publicly accessible, including Private Course mapping; the owner approved this previously. Do not put new personal records, backups, test profiles or credentials into the repository.
- Windows Defender previously flagged a PowerShell browser-test method; its false-positive status was never established. Do not use `ScriptBlock::Create`, dynamic PowerShell browser automation, hidden browser automation, security bypasses or exclusions. This verification used a visible isolated Chrome driven by a reviewed JavaScript fixture.

## Workspaces and preserved work

- Original development folder: `C:\Users\jerem\Documents\disc-golf-gps`. It intentionally remains on its older local Git baseline with accumulated app changes. It was not reset, rebased, cleaned or overwritten for release.
- Established production release workspace: `C:\Users\jerem\AppData\Local\Temp\chain-chaser-release-123J-20261104`. It began from verified remote `9cb2438c51ceea9be818e1136cc35e446cc725b2`; release pushes use the current commit explicitly (`HEAD:main`).
- Original untracked work remains local: `.gitattributes`, `AGENTS.md`, `chain-chaser-favicon.png`, `chain-chaser-logo.jpeg`, `maps-config.js`, `shared-course-library.js`, `tests/`, `tools/`. Do not indiscriminately add these: deployed copies of several supporting assets already exist on remote main.
- The development HTML's loader reference is `?v=123g`; the release preserves the unchanged production reference `?v=dd8f030cec3774e4`. The library bytes match. No other application-content difference was introduced when preparing this release; line endings were normalized to LF in the release copy.
- Final disposable evidence: `C:\Users\jerem\AppData\Local\Temp\chain-chaser-preview-browser-FglW4l` contains `browser-results.json`, screenshots, `static-results.json`, `release-review.json`, staged verification and live verification. Temporary folders may be cleaned by Windows; they are not a substitute for Git or a permanent private backup.
- Local `tools/` documents and some descriptive sections of `AGENTS.md` reflect earlier app stages. Read the safeguards, but verify architecture claims against current production code; do not run historical PowerShell automation blindly.

## Future priorities — not implemented in this release

1. Safe Full Backup restoration: validated preview, explicit replacement scope, private safety backup, quota handling, rollback/journaling and interrupted-restore recovery, without silently overwriting player data.
2. Disc Collection Export/Import with duplicate prevention and preservation of immutable physical-disc IDs and historical references.
3. Gameplay analytics: putting percentages, fairway accuracy, throwing-distance trends and course performance, using trustworthy provenance and physical identity.
4. Continued group-round synchronization and scoring improvements; define backend/account/conflict behavior before promising connected devices.
5. Final Android/iPhone integration and field testing.

## Exact resume procedure

1. Read this document and `AGENTS.md`. Ask the owner which priority is approved; do not start the next feature automatically.
2. Preserve a private copy of the original development folder and any important untracked tools/assets outside the public repository. Do not copy player backups or production key values into documentation or chat.
3. Inspect `git status --short`, `git branch --show-current`, `git log -5`, remotes and `git ls-remote origin refs/heads/main`. Do not assume the old development checkout matches production.
4. Create a fresh, isolated checkout/workspace from verified current remote main outside the old development folder. Preserve intentional deletions. Do not pull/merge/reset the dirty old checkout or force-push.
5. Compare the production HTML and supporting files with preserved local work; account for the known loader query and line endings. Transfer only verified intended work, never entire backup/test folders.
6. Use disposable browser profiles and synthetic data for mutation tests. Never clear or inspect the owner's actual browser storage. For field testing, the owner should download a fresh Full Backup on every important browser origin first.
7. Re-run JavaScript syntax, CSS/ID/whitespace checks, backup preview/export tests and existing synthetic library tests. Inspect 320px/390px layouts. Rebuild a reviewed visible-browser fixture if temporary evidence has been removed; do not install dependencies or revive the flagged PowerShell method merely to reproduce old tests.
8. On the live URL, test More → Data backup → Import Full Backup — Preview using a disposable backup. Verify the explicit preview-only notice, invalid-file rejection, Close, repeated selection, export download and no storage writes before considering any restore implementation.
9. For any later release, verify live remote main, review exact staged paths and Git blob bytes, scan additions without printing secrets, use an explicit allowlist and normal fast-forward push only after separate owner approval. Monitor Pages and compare live bytes with the committed files.

## Rollback

The previous production application baseline is `9cb2438c51ceea9be818e1136cc35e446cc725b2`. If a regression is confirmed, obtain owner approval, use an isolated current-main checkout and create a new commit reverting only the application release (or its relevant lines). Preserve all production assets, intentional entry deletions and browser data. Never force-push, reset published history, clear localStorage or use an old app rollback as an excuse to rewrite player records. Re-run tests and verify Pages after an approved rollback. Cache-only library fallback is available via `?sharedNetwork=off` for an already cached library; it is not an app offline installer or general data restore.
