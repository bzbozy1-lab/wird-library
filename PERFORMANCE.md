# Performance verification — 2026-10-31

## Measured asset budgets
| Resource | Before | After | Reduction |
| --- | ---: | ---: | ---: |
|27 default reader images |8,895,980 B (2400px) |3,917,510 B (1400px) |56.0% |
|Two Arabic fonts |682,008 B (TTF) |227,420 B (WOFF2) |66.7% |
|Desktop leaf duration |620ms |380ms |240ms shorter |
|Mobile leaf duration |560ms |360ms |200ms shorter |

These byte counts are repository file sizes, not a claim that page load times improve by the same percentage. Font glyph maps, glyph order, Arabic GSUB/GPOS shaping and hmtx metrics were compared and preserved. The original PDF and cover remain unchanged.

## Bottlenecks fixed
- Desktop spread navigation previously prefetched only its first new page. Both new pages are now warmed and decoded, including cover-to-first-spread.
- Normal reading no longer decodes2400px images. It uses1000×1400 images; zoom shows these immediately while detailed1715×2400 images upgrade in place. HD failure leaves the readable image intact.
- Cache is bounded8-entry LRU, stale retries cannot remove newer entries, and unchanged resize events do not rebuild the page or interrupt a turn.
- Likely same-site HTML links are prefetched on idle/intent; book details can warm the resumed reader image(s). No PDF downloads are prefetched. Save-Data and2G skip speculative loading.
- Catalog script is deferred, tiny theme initialization inlined, both compressed fonts preloaded. Old TTF/HD assets remain available for fallback/zoom; they are not the default payload.

## Browser observations
Cloud Chrome local preview, existing session/cache; no network throttle or physical-device coverage implied:
- Initial reader commit83ms in one local observation.
- Two warmed desktop spread commits1ms and2ms; warmed mobile page commit1ms. These diagnostics end at DOM commit and exclude the leaf animation and subsequent paint; they are not INP, LCP or public-network latency scores.
- Default images naturalWidth1000; visible images naturalWidth1715 after zoom. Reader remains visible through upgrade.
- Main-page document/image prefetch hints present for local library/reader/resumed images, excluding PDF.
- Desktop and390px reader checked visually;768px library checked; light/dark fonts and Arabic shaping remain consistent.

## Automated checks
`node tests/validate.cjs` validates all54 images, original PDF SHA-256 and local HTML paths.
`node tests/reader.test.cjs` executes actual reader code against controlled DOM/Image failures: complete-spread prefetch/cache hits, progressive HD failure, stale results/retries,12s deadline, invalid book, focus fallback, no-op/real resize.
JavaScript syntax, image decoding and font metadata/Arabic shaping checks passed.

## Limits
No Lighthouse/Core Web Vitals or physical low-end-device benchmark was available through this browser. Public hosting/network latency remains outside repository control; improved asset budgets, prefetch correctness and warm-cache commits are the verified outcomes. Original PDF accessibility limitation remains disclosed.
