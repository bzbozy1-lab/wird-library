# وِرد — design system

Read mode. Contemporary Arabic publisher's colophon: a restrained open-book mark, a substantial Amiri wordmark, generous editorial space, and the original book leading the page. The cover—not invented decoration—carries the library's subject.

## Direction
Seven considered worlds: literary publisher's imprint, reading-room index, personal correspondence, contemporary Arabic colophon, library shelf labels, manuscript marginalia, literary periodical. The fourth direction governs this build. Decisions delegated by the user's explicit brief; code-first implementation. Roll service was unavailable; no external challenger boards were received.

## Tokens
Light: background #f8f5f9, surface #eee5ee, ink #342835, muted #6e606b, brand #59334f, accent #a14865, line #d9cdd2. Dark: background #211d24, surface #2d2530, ink #f5edef, muted #c4b4c0, brand #e8b8d5, accent #e6a1b6, line #534451.
Amiri for literary headings and wordmark; Noto Sans Arabic for controls and body. Self-hosted fonts. Body 16px desktop / 14px mobile. Headings 29–68px. Reader mobile controls use 11–12px labels and 42–44px touch controls.
Shell 1160px, desktop side margins 48px, mobile 20px. Mobile breakpoint 620px. Tablet 900px. Reader double spread default >=1100px; never double below 900px.

## Components
Outlined 1.6px SVG icons, no emoji controls. Original covers always uncropped at 5:7. Purple filled reading action, quiet secondary download action. Dedicated pages. Search uses diacritic-insensitive Arabic normalization. Dark mode follows system until explicitly set.

## Motion
Book cover gently turns on hover. Reader has optional 360ms shallow page turn; reduced-motion always wins. Not a physical paper-curl simulation.

## Reader
Independent full-height workspace. Previous/next, numeric page, zoom .75–2.5, fullscreen, download. Only visible pages rendered to canvas, neighbor PDF page prefetched, old rendering tasks cancelled. PDF.js fonts drawn as outlines to preserve source Arabic. Original PDF text extraction is malformed; no extracted transcript is exposed. The reader discloses that a screen-reader transcript is unavailable. The source PDF is unchanged.
