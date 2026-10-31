# Verification — 2026-10-31, gradient/reader update

## Current implementation
- Original PDF retained byte-for-byte: SHA-256 `9aec4a8dab713419e059466ec8ccb6229ea73fb14d53ed133b655c1da232b582`.
- All27 prepared WebP pages validated: nonempty WebP signatures, Pillow decoding,1715×2400 proportions. Page22 had an incomplete intermediate render; rebuilt before validation/upload.
- Reader no longer needs a browser-side PDF module, Worker, or full PDF download. Only requested page images and neighboring pages are requested; cache limited to8.
- Source of the user's device-specific loading failure was not reproduced in cloud Chrome. The earlier implementation waited on PDF.js/full-PDF setup without a deadline. New path removes those dependencies and adds12s timeout, explicit retry and original-file fallback.

## Automated checks
`node tests/validate.cjs`, `node tests/reader.test.cjs`, JavaScript syntax and `git diff --check` pass.
Reader tests run the actual script against a controlled DOM/Image environment: initial success, network image failure, retry success, timeout, unknown book, stale response protection, focus-mode fallback.

## Browser checks
- New reader opens prepared pages; interior spreads4/5,6/7,8/9,10/11 and final27 observed. Single page at320px and spread on desktop.
- Previous/next, numeric jump, page27 next disabled, return-position behavior and options controls checked.
- Leaf animation event diagnostics observed `turning`, then `completedTurns:1,lastTurn:forward,state:idle`; animation runs and completes. Optional motion and system reduced motion supported. Motion is the binding-based two-face leaf model used by CARTO, with perspective/shading; no claim of physical cloth/paper simulation.
- Fullscreen denied by cloud browser now enters usable focus mode; exit returns header. Native fullscreen success remains unverified.
-320px reader has body scrollWidth320 equal viewport320. Responsive captures include390px home and768px library.
- Both gradient themes inspected, decoded original covers preserved, opaque reading tools. Final captures made after image loading; discarded incomplete captures were not review evidence.
- Independent reviewer: ship at scoped gradient/reader polish. Documentation verification found no scoped stale facts.

## Limits
Not a physical-device or exhaustive browser audit. No measured speed benchmark; reduced initial dependency/payload is established by implementation. Original PDF is not a reliable screen-reader transcript; limitation disclosed in reader. Prepared page images retain visual text without rewriting, while the downloadable source remains original. Original PDF public HTTP download/checksum verified in prior release; live recheck follows deployment of this update.
