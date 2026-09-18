**Findings**

- [P3] Reference uses architectural video footage while the implementation uses portfolio project-cover fallbacks.
  Location: `ScrollStack` media cards.
  Evidence: source reference shows full-bleed architecture footage; current project has no supplied MP4 files, so each card correctly renders its assigned poster image.
  Impact: the card stack and interaction match, but motion fidelity depends on the final video files.
  Fix: add `motion-reel-01.mp4` through `motion-reel-05.mp4` in `public/assets/`.

**Open Questions**

- The requested reference shows a desktop 1650 x 900 card state. The available local preview was inspected at the in-app responsive viewport, so final desktop typography and crop should be rechecked after the real reels are added.

**Implementation Checklist**

1. Scroll the stack with a mouse wheel: it should advance through five cards before releasing normal page scroll.
2. Click the progress bars to jump directly to any card.
3. Replace the five poster-only video paths with supplied MP4 files when available.

**Follow-up Polish**

- Fine-tune per-video `object-position` after final video crops are available.

Source visual truth path: `C:\Users\ZHUANZ~1\AppData\Local\Temp\codex-clipboard-54150666-fad6-48ba-af8b-9c96e8ee784b.png`

Implementation evidence: in-app browser preview at `http://127.0.0.1:4173/#reels`, responsive viewport, active card 01 state; the front card uses a rounded full-bleed media frame with stacked, blurred cards behind.

Required fidelity surfaces: typography uses the portfolio's display serif and mono metadata; layout uses a centered rounded frame with layered depth; colors use black, white, pink and mint accents; images use supplied portfolio poster assets; copy is project-specific.

Final result: passed

---

# Design QA — About / Resume Section

- Source visual truth: `C:\Users\ZHUANZ~1\AppData\Local\Temp\codex-clipboard-2300dff2-7176-49e0-982c-527082813b0c.png`
- Source portrait asset: `E:\新建文件夹\微信图片_20230130225045.jpg`
- Implementation screenshot: `D:\作品集\个人作品集网站\tmp\about-implementation.png`
- Mobile screenshot: `D:\作品集\个人作品集网站\tmp\about-mobile.png`
- Side-by-side comparison: `D:\作品集\个人作品集网站\tmp\about-comparison.jpg`
- Desktop viewport: 1280 × 720 CSS px at device scale 1
- Source pixels: 1792 × 1009, normalized to 1280 × 720 for comparison
- Implementation pixels: 1280 × 720
- Mobile viewport: 390 × 844 CSS px
- State: About section visible with fixed navigation; no overlays or active interactions

## Full-view comparison evidence

The combined reference/implementation image confirms that the implementation preserves the source information hierarchy: dominant ABOUT ME title, portrait-led composition, name and role, basic information, self-introduction, work history, and career metrics. The palette and typography intentionally use the site's existing dark grid, white editorial serif, monospace labels, and pink accent instead of the reference's light resume palette.

## Focused region evidence

The desktop capture checks portrait crop, title scale, introductory copy, basic-information cells, and the first work-history row at readable size. The mobile capture checks the single-column collapse, content wrapping, portrait scale, contact links, and work-history alignment.

## Required fidelity surfaces

- Fonts and typography: display serif, Chinese sans-serif, and mono metadata maintain the established site hierarchy; no clipping or unintended overflow found.
- Spacing and layout rhythm: desktop two-column grid and mobile stack are aligned to the existing site shell and background grid. Section density is lower than the reference by design so resume content remains readable.
- Colors and visual tokens: existing `#161616` surface, white foreground, muted gray copy, and `#fd86db` accent are used consistently.
- Image quality and asset fidelity: supplied portrait is used directly at full quality with a controlled crop; no placeholder or generated substitute is present.
- Copy and content: education, discipline, experience length, contact details, self-evaluation, and all four roles are represented. Responsibilities were shortened without changing their information logic.

## Findings

No actionable P0, P1, or P2 mismatch remains. The departure from the source's yellow/light resume styling is intentional and required by the user's request to match the site's existing visual language.

## Interaction and runtime checks

- Phone and email links resolve to the expected `tel:` and `mailto:` targets.
- Desktop and 390 px mobile layouts were rendered in the in-app browser.
- Browser console errors checked: none.
- Production build completed successfully.

## Comparison history

- Pass 1: no P0/P1/P2 issues found after the responsive implementation. No corrective iteration was required.

final result: passed

---

# Design QA — Neon Cursor and Glow Trail

- Source visual truth: `C:\Users\ZHUANZ~1\AppData\Local\Temp\codex-clipboard-e8157e8c-33c1-499f-9184-1d53f755431b.png`
- Source dimensions: 400 × 400 px, transparent PNG
- Implementation route: `http://127.0.0.1:5173/design`
- Implementation asset: `D:\作品集\个人作品集网站\public\assets\neon-cursor.png`
- Intended viewport: 840 × 792 CSS px, desktop fine-pointer state
- Implementation screenshot: unavailable because the in-app browser control process was terminated twice by the Windows sandbox

## Full-view comparison evidence

Blocked. The source asset was opened and inspected, but a browser-rendered implementation screenshot could not be captured. Production build passed.

## Focused region comparison evidence

Blocked for the same browser-control failure. The implementation uses the supplied transparent PNG directly at 76 × 76 CSS px, with one primary cursor and eight progressively delayed, faded trail particles.

## Required fidelity surfaces

- Fonts and typography: not applicable to the cursor asset.
- Spacing and layout rhythm: cursor layer is fixed and pointer-events are disabled; browser capture is still required to confirm perceived scale.
- Colors and visual tokens: supplied pink-purple source asset is reused directly; added glow uses matching magenta/violet shadows.
- Image quality and asset fidelity: original transparent PNG is used without reconstruction.
- Copy and content: not applicable.

## Findings

- [P2] Browser-rendered cursor scale and trail feel remain unverified.
  Evidence: browser automation exited before a screenshot or pointer-motion test could be captured.
  Impact: build correctness is confirmed, but visual size, hotspot alignment, and motion smoothness have not been observed in the rendered page.
  Fix: reopen the local preview and inspect pointer movement at the intended desktop viewport.

## Comparison history

- Initial pass: blocked before capture; no visual fixes claimed.

final result: blocked

---

# Design QA — Stacked Paper Introduction Card

- Source asset: `C:\Users\ZhuanZ（无密码）\Desktop\231e61576ebc7908c54f90b2018144a9.png`
- Implemented asset: `D:\作品集\个人作品集网站\public\assets\stacked-paper-note.png`
- Desktop screenshot: `D:\作品集\个人作品集网站\tmp\stacked-note-desktop.png`
- Side-by-side comparison: `D:\作品集\个人作品集网站\tmp\stacked-note-comparison.jpg`
- Desktop viewport: 1280 × 720 CSS px

## Required fidelity surfaces

- The introduction module uses the supplied transparent source image directly, preserving its pink binder clip, irregular torn front sheet, and mint/pink stacked sheets on the right.
- Copy sits only on the usable front-sheet area, below the clip and inside all torn edges.
- The pink `Echo` accent and the surrounding portfolio typography remain consistent with the existing page.
- The card keeps its native aspect ratio and scales fluidly without page-level horizontal overflow.

## Findings and verification

The combined reference/implementation comparison confirms that the source silhouette, paper colors, clip position, layer order, and transparent cutout are retained. Both text blocks are inside the card bounds. Browser measurement reports no horizontal page overflow at 1280 px. Production build completed successfully.

final result: passed

---

# Design QA — Polaroid Portrait Detail

- Source visual truth: `C:\Users\ZHUANZ~1\AppData\Local\Temp\codex-clipboard-d559ec0c-a8bb-4457-9009-6f36d73f0ff6.png`
- Desktop screenshot: `D:\作品集\个人作品集网站\tmp\polaroid-desktop.png`
- Mobile screenshot: `D:\作品集\个人作品集网站\tmp\polaroid-mobile.png`
- Side-by-side comparison: `D:\作品集\个人作品集网站\tmp\polaroid-comparison.jpg`
- Desktop viewport: 1081 × 792 CSS px
- Mobile verification viewport: 389 × 843 CSS px

## Required fidelity surfaces

- The photo is smaller and enclosed by a warm off-white instant-photo frame with a deeper bottom margin.
- A real generated masking-tape asset anchors the top edge.
- A real generated blank name-tag sticker carries the hand-written `Echo` overlay with exact spelling.
- The phone number and email are positioned in the bottom margin under `CONTACT ME`.
- The existing pink smiley sticker overlaps the lower edge without covering the contact links.

## Findings and verification

No actionable P0, P1, or P2 mismatch remains. The desktop portrait measures 355 × 732 CSS px, and the 389 px mobile pass measures 319 × 606 CSS px. Both passes report equal document scroll and client widths, so the sticker overlaps introduce no horizontal overflow. Browser console warnings and errors: none. Production build: passed.

## Comparison history

- Pass 1: reduced the photo, added the deep instant-photo base, hand-written name label, and contact block.
- Pass 2: replaced provisional decorative surfaces with transparent generated tape and name-tag assets, then rechecked desktop and mobile layouts.

final result: passed

---

# Design QA — About Collage Refresh

- Source visual truth: `C:\Users\ZHUANZ~1\AppData\Local\Temp\codex-clipboard-4c13409c-6aac-4787-be2e-d1f4c4267707.png`
- Desktop heading screenshot: `D:\作品集\个人作品集网站\tmp\about-collage-desktop-heading.png`
- Desktop content screenshot: `D:\作品集\个人作品集网站\tmp\about-collage-desktop-content.png`
- Responsive heading screenshot: `D:\作品集\个人作品集网站\tmp\about-collage-desktop.png`
- Responsive intro screenshot: `D:\作品集\个人作品集网站\tmp\about-collage-mobile-intro.png`
- Responsive toolkit screenshot: `D:\作品集\个人作品集网站\tmp\about-collage-mobile-content.png`
- Side-by-side comparison: `D:\作品集\个人作品集网站\tmp\about-collage-comparison.jpg`
- Desktop evidence viewport: 1081 × 792 CSS px
- Responsive evidence viewport: 531 × 792 CSS px; an isolated 389 × 843 iframe pass also verified the 390 px breakpoint metrics
- State: About section visible with fixed navigation and all three generated sticker assets loaded

## Full-view and focused comparison evidence

The source's scrapbook character is carried into the existing portfolio language through a slightly rotated instant-photo frame, off-white paper cards, hand-written intro line, black pill labels, and distributed stickers. The implementation keeps the site's dark grid, editorial serif title, mono metadata, and pink accent, so the new section feels playful while remaining part of the same website.

## Required fidelity surfaces

- Typography: hand-written `Kalam` line adds informality; the existing serif title, Chinese display type, and mono labels preserve hierarchy and readability.
- Layout rhythm: portrait, introduction, information, and experience content remain easy to scan. Slight rotations are restrained and do not move content outside the section shell.
- Colors: off-white paper cards provide the reference's tactile contrast while black, white, cyan, and pink remain aligned with the site's established palette.
- Imagery: the supplied designer portrait remains the primary image. Burst, smiley, and cat-stamp assets use genuine transparent backgrounds and are decorative with empty alt text.
- Copy: the existing biography, education, experience, contact details, and four roles remain unchanged.

## Findings

No actionable P0, P1, or P2 visual mismatch remains. At 389 CSS px, `documentElement.scrollWidth` equals `clientWidth` (373 px after scrollbar), so the collage introduces no horizontal overflow. The smallest checked layout keeps the portrait, paper note, labels, experience card, and toolkit within the content bounds.

## Interaction and runtime checks

- Fixed navigation remains visible above the collage.
- Phone and email links remain accessible.
- Decorative stickers ignore pointer input and do not block controls.
- Desktop and responsive browser captures completed.
- Browser console contains no page error entries after the final reload.
- Production build completed successfully.

## Comparison history

- Pass 1: confirmed the reference's collage hierarchy and adjusted the section with paper surfaces, tilt, chips, and three original stickers.
- Pass 2: verified the responsive stack and measured the 389 px viewport; no overflow or overlap required correction.

final result: passed

---

# Design QA — Software / AI Toolkit

- Source visual truth: `C:\Users\ZHUANZ~1\AppData\Local\Temp\codex-clipboard-4040025a-9aa4-4f98-bda2-7c853ea932a7.png`
- Implementation screenshot: `D:\作品集\个人作品集网站\tmp\toolkit-desktop.png`
- Mobile screenshot: `D:\作品集\个人作品集网站\tmp\toolkit-mobile.png`
- Side-by-side comparison: `D:\作品集\个人作品集网站\tmp\toolkit-comparison.jpg`
- Desktop viewport: 1067 × 800 CSS px at device scale 1
- Source pixels: 2379 × 444; implementation pixels: 1067 × 800
- Mobile viewport: 390 × 844 CSS px
- State: toolkit visible at the end of About, fixed navigation present

## Full-view and focused comparison evidence

The combined comparison shows the same two-category structure, compact rounded cards, icon/name pairing, dark panel surface, and cyan AI heading used by the source. The implementation deliberately uses fewer tools so labels remain readable at the portfolio's content width. The browser captures confirm that the component sits in the annotated location and collapses to two cards per row on mobile without horizontal overflow.

## Required fidelity surfaces

- Fonts and typography: mono category labels and compact sans-serif card names match the site's established hierarchy and the reference's density.
- Spacing and layout rhythm: software and AI groups remain visually distinct; card height, gaps, padding, radii, and alignment are consistent.
- Colors and visual tokens: the portfolio's dark surface and pink accents are preserved, with cyan reserved for the AI category as in the reference.
- Image quality and asset fidelity: every card uses a real local brand icon asset from an icon library or brand logo source; no placeholders, emoji, or CSS-drawn icons are used.
- Copy and content: six work tools and six AI tools are named clearly; long labels remain within their cards.

## Findings

No actionable P0, P1, or P2 issue remains. The reduced item count is an intentional responsive adaptation to the available section width.

## Interaction and runtime checks

- Desktop and 390 px mobile layouts rendered successfully.
- Card hover styling is present and does not shift surrounding layout.
- Browser console errors checked: none.
- Production build completed successfully.

## Comparison history

- Pass 1: no blocking visual or responsive issues found; no corrective iteration required.

final result: passed

---

# Design QA — Torn Note Card Cleanup

- Source visual truth: browser annotations on `http://127.0.0.1:4173/#about` targeting the introduction card, `Echo Lin`, and the basic-information block.
- Desktop screenshot: `D:\作品集\个人作品集网站\tmp\paperclip-on-panel.png`
- Mobile screenshot: `D:\作品集\个人作品集网站\tmp\torn-note-mobile.png`
- Desktop viewport: 1081 × 792 CSS px
- Mobile verification viewport: 389 × 843 CSS px

## Required fidelity surfaces

- The introduction card now uses a real generated torn-paper background with visibly fibrous edges on all four sides.
- A cropped view of the generated transparent paperclip asset sits directly across the torn paper's top edge; the extra label is no longer visible.
- Desktop introduction copy uses a single-column top-to-bottom structure.
- The highlighted name reads `Echo` with `Lin` removed.
- The complete education, experience, and duplicate contact information block below the chips has been removed.

## Findings and verification

No actionable P0, P1, or P2 issue remains. The 389 px responsive pass keeps the 334 px card within the 373 px document width with no horizontal overflow. Introduction copy remains readable inside the torn edges, and the paperclip does not overlap the first line. Browser console warnings and errors: none. Production build: passed.

## Comparison history

- Pass 1: replaced the rectangular card surface, shortened the name, and removed the annotated information region.
- Pass 2: removed the extra label, placed the paperclip directly on the panel, and changed the desktop copy to a vertical stack.

final result: passed

---

# Design QA — Expanded Torn Note

- Desktop screenshot: `D:\作品集\个人作品集网站\tmp\torn-note-expanded.png`
- Desktop viewport: 1081 × 792 CSS px
- State: full paperclip visible over the top torn edge; biography arranged vertically

## Findings and verification

The paperclip is reduced to 41 CSS px wide and its complete 136 px vertical silhouette is visible. The torn panel is now 358 CSS px high, with additional space above the headline and below the supporting paragraph. The paper texture and torn-edge silhouette remain unchanged. Document scroll width equals client width, browser console errors are empty, and the production build passes.

final result: passed

---

# Design QA — Paperclip and Star Note Card

- Source asset: `C:\Users\ZhuanZ（无密码）\Desktop\ChatGPT-Image-2026年9月9日-09_46_35.png`
- Implemented asset: `D:\作品集\个人作品集网站\public\assets\paperclip-stars-note.png`
- Desktop screenshot: `D:\作品集\个人作品集网站\tmp\paperclip-stars-note-desktop.png`
- Mobile screenshot: `D:\作品集\个人作品集网站\tmp\paperclip-stars-note-mobile.png`
- Side-by-side comparison: `D:\作品集\个人作品集网站\tmp\paperclip-stars-note-comparison.jpg`

## Findings and verification

The introduction module uses the supplied transparent image directly. The white note, pink dotted backing paper, silver paperclip, and four metallic/glitter stars remain intact. Desktop copy is placed within the white paper's central safe area, clear of the clip and corner stickers. At the 390 px responsive breakpoint, the asset receives a controlled vertical adaptation so both copy blocks remain readable while the collage motif stays recognizable. Production build passed and browser measurements show no page-level horizontal overflow. Browser logs contain one source-less `MutationObserver` error from the preview integration; no matching observer exists in the application source.

final result: passed

---

# Design QA — About Position Adjustments

- Desktop screenshot: `D:\作品集\个人作品集网站\tmp\about-position-adjustments.png`
- Desktop viewport: 1280 × 720 CSS px

## Findings and verification

The discipline line is translated 96 px upward and now clears the note card. The work-experience wrapper changes from a 70 px top margin to -30 px on desktop, producing the requested 100 px upward shift while retaining a clear gap below the skill chips. The stamp asset now belongs to the portrait and straddles the lower-right corner of the photo. Mobile keeps its existing flow spacing and places a smaller stamp at the same photo corner. Production build passed and the document has no horizontal overflow.

final result: passed
