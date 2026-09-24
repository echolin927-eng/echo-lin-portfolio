# Design QA — Portfolio Mosaic

- Source visual truth: `D:/作品集/个人作品集网站/tmp/portfolio-layout-reference.png`
- Implementation screenshot: `D:/作品集/个人作品集网站/tmp/portfolio-layout-wide-final.png`
- Combined comparison: `D:/作品集/个人作品集网站/tmp/portfolio-layout-comparison-final.jpg`
- Viewport: `2549 × 1079` CSS px, device scale factor `1`
- Source pixels: `2549 × 1079`
- Implementation pixels: `2549 × 1079`
- Density normalization: none required; both artifacts were compared at identical pixel dimensions.
- State: desktop, `个人作品` active, `#work` aligned to viewport top using the production absolute-position scroll handoff.

## Findings

- No actionable P0/P1/P2 differences remain.
- The one-large/two-stacked-card composition, track proportions, gaps, corner radii, section width, title hierarchy, and page rhythm match the reference.
- Intentional deviations: the implementation keeps the site's established pink/black brand tokens and uses real portfolio imagery instead of the editor placeholders shown in the reference.
- The editor-only upload, delete, preview, color, and export controls were not reproduced because they are not part of the published portfolio experience.

## Required Fidelity Surfaces

- Fonts and typography: title hierarchy and bold Chinese/Latin pairing match the reference; existing Microsoft YaHei/Manrope system is preserved.
- Spacing and layout rhythm: grid width `2140px`, grid top `354.45px`, two equal columns, `18px` gap, and feature card spanning both rows.
- Colors and visual tokens: existing pink/black portfolio theme intentionally retained; contrast remains sufficient.
- Image quality and asset fidelity: existing full-resolution project images are used with cover cropping and no placeholders or generated substitutes.
- Copy and content: reference labels are replaced with the site's real project titles, types, descriptions, and destinations.

## Focused Comparison

- A separate crop was not required because the combined `2549 × 2158` comparison keeps the title, all three cards, card labels, navigation, and gutters clearly legible.

## Interaction And Runtime Checks

- Three card links resolve to `/design`, `/detail-page-design?work=8`, and `/detail-page-design?work=1`.
- Hover state changes the card border to pink and translates the card upward by `4px`.
- No horizontal overflow at the target viewport.
- Browser console errors: none.

## Comparison History

1. P2: the global `1700px` shell made the desktop composition too narrow. Fixed with a work-section-only `2140px` shell.
2. P2: title and card group were vertically offset from the reference. Fixed with desktop top spacing of `clamp(142px, 18vh, 204px)`; final grid top is `354.45px`.
3. P2: an intermediate QA capture used `scrollIntoView`, which honored global scroll padding and exposed the previous screen. Re-captured with the production absolute-coordinate handoff; final work section top is `0px`.

## Follow-up Polish

- P3: a future reference for tablet/mobile could be used to tune those breakpoints beyond the current single-column responsive fallback.

## Implementation Checklist

- [x] Replace accordion gallery with one-large/two-stacked project grid.
- [x] Preserve real project imagery and links.
- [x] Add hover and focus states.
- [x] Add responsive single-column fallback.
- [x] Verify build, viewport fit, interactions, and console.

final result: passed