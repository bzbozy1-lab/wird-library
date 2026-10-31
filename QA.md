# Verification — 2026-10-31

## Verified
- Browser inspection of original site and replacement: desktop 1353px, mobile iframe viewport 390×844, tablet iframe viewport 768×1024. These are responsive browser viewports, not physical iOS/Android devices.
- Original cover proportions retained. Original PDF SHA-256 matches uploaded source, 7,277,683 bytes, 27 pages. GitHub binary blob SHA verified against locally computed git blob hash during upload.
- PDF.js rendering of cover, interior pages 2–5, and final page 27. Original Arabic glyph issue resolved with outline font rendering (`disableFontFace`).
- Single mobile page, desktop double spread, page number jump, final-page next disabled, zoom 100%→125%→100%, display selector, motion checkbox, dark/light toggle, progress surviving return to details/reopen.
- Search author match and no-match, heritage empty state, reset returning one book.
- Local HTML navigation/assets exist, JavaScript syntax checks and git diff whitespace checks passed.
- Primary muted/accent text contrast against page backgrounds: light 5.47/5.35, dark 8.40/8.01.
- Independent visual review: ship after removing unreliable extracted text and supplying reader screenshots. This verdict resolves that fix list; it is not a comprehensive screen-reader audit.

## Limits
- Fullscreen control gracefully reports browser refusal in the cloud browser; actual fullscreen could not be verified there.
- Download event completion was not surfaced by the cloud browser. PDF rendering confirms successful file loading in preview; live HTTP file response and byte size to be verified after publishing.
- Canvas pages are not a verified screen-reader transcript. The original PDF text extraction is malformed. This is disclosed in reader options and an assistive description. Original file preserved unchanged.
- Turn animation is a shallow optional page rotation, not physical paper curl. Default PDF appearance is retained in both themes.
- No performance benchmark or claim of exhaustive device/browser coverage. PDF loads on reader entry only; current pages render on demand.
