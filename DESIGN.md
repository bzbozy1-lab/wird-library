# وِرد — design system

Read mode. Contemporary Arabic publisher's colophon: a restrained open-book mark, a substantial Amiri wordmark, generous editorial space, and the original book leading the page. The cover—not invented decoration—carries the library's subject.

## Direction
Seven considered worlds: literary publisher's imprint, reading-room index, personal correspondence, contemporary Arabic colophon, library shelf labels, manuscript marginalia, literary periodical. The fourth direction governs this build. Decisions delegated by the user's explicit brief; code-first implementation. Roll service was unavailable; no external challenger boards were received.

## Tokens
Light: background #f8f5f9, surface #eee5ee, ink #342835, muted #625461, brand #59334f, accent #a14865, line #d9cdd2. Dark: background #211d24, surface #2d2530, ink #f5edef, muted #c4b4c0, brand #e8b8d5, accent #e6a1b6, line #534451.
Amiri for literary headings and wordmark; Noto Sans Arabic for controls and body. Self-hosted WOFF2 fonts with TTF fallback; complete glyph/shaping data preserved. Body 16px desktop / 14px mobile. Headings 29–68px. Reader mobile controls use 11–13px labels and 42–44px touch controls.
Shell 1160px, desktop side margins 48px, mobile 20px. Mobile breakpoint 620px. Tablet 900px. Reader double spread default >=1100px; never double below 900px.

## Components
Outlined 1.6px SVG icons, no emoji controls. Original covers always uncropped at their source proportions (715×1000 for the first cover). Purple filled reading action, quiet secondary download action. Dedicated pages. Search uses diacritic-insensitive Arabic normalization. Dark mode follows system until explicitly set.

## Background field
The user explicitly requested visible harmonious gradients in both themes. Static layered radial/linear fields: light rose #edcbd6 into pearl/lilac #f5edf7 and mist #edf5f5; dark plum #59314f into ink #201f2c and deep blue/teal #152b31. No continuous animation, noise, blur, or extra ornament. Covers have related gradients; reading controls remain opaque for legibility.

## Motion
The original CARTO reader was inspected: paper rotates around its binding with front/back faces and a moving shadow. This implementation follows that mechanism: optional 380ms desktop /360ms mobile leaf rotation through 179.5 degrees, separate front/back images, perspective and dynamic shading. Reduced-motion always wins. The last turn's animationstart/animationend events are exposed as DOM diagnostics for verification.

## Reader
Independent full-height workspace. Prepared normal images at1000×1400, WebP quality88, with1715×2400 quality92 detail upgrades on zoom; preserve proportions and original downloadable PDF. No browser-side PDF engine dependency. Current pages are decoded before replacement; old pages remain visible while waiting. Eight-entry LRU cache, complete next-spread prefetch, 12-second bounded load timeout with retry and original-file links. Classic deferred JS and bootstrap watchdog. Previous/next labels, numeric page, zoom .75–2.5, fullscreen with focus fallback, download. No extracted text transcript is exposed because the original extraction is malformed; limitation disclosed. Responsive page/spread, paper binding shadow and optional physical leaf turn. Images carry page-number and book-title labels.
