## Work grid: dynamic aspect-ratio “Pinterest-like” layout (research + best-practice proposal)

### Goal
Most work is **9:16** video; some is **16:9** and **3:4**. We want a grid that:
- Preserves original aspect ratio (no forced cropping)
- Looks curated and premium (Pinterest-like)
- Is responsive (mobile/tablet/desktop)
- Requires **no manual resizing by admin**
- Avoids performance regressions (CLS, heavy video playback in grid)

### Best-practice approach (recommended)
**A) Store intrinsic media dimensions**
- On upload, capture and store:
  - `width`, `height` (or `aspect_ratio`)
  - `type` (image/video)
  - for video: a `poster_url` (thumbnail) for grid display
- Admin only does:
  - upload
  - reorder
  - publish

**B) Use a true masonry layout**
Two viable options:
1) **Column-based masonry (CSS columns)**:
   - Pros: simple, looks like Pinterest, good responsiveness
   - Cons: reading order is column-first; can feel less “row-based”
2) **JS masonry with measured heights** (balanced columns):
   - Pros: best visual balance, predictable order
   - Cons: must be careful to avoid layout shift; more code complexity

Recommendation:
- Start with **CSS columns** (fast to implement, minimal JS, great for 9:16 dominant feeds).
- Only move to JS masonry if you need strict left-to-right reading order.

**C) Grid media rules (performance + aesthetics)**
- Grid shows:
  - images: optimized thumbnails
  - videos: **poster image** + play badge (do NOT autoplay in grid)
- Use fixed aspect ratio containers derived from stored dimensions to reduce CLS.
- On click: open project page or modal (project page can host real video player).

### Responsiveness rules (suggested)
- Mobile: 1 column
- Small tablet: 2 columns
- Desktop: 3 columns
- Large desktop: 4 columns (only if content density is high)

### Admin workflow impact
- Upload media → we store dimensions automatically.
- Admin never resizes. They just reorder items.

### Next steps (before code)
1) Confirm whether you prefer:
   - **Pinterest column flow** (CSS columns) OR
   - **balanced masonry** (JS)
2) Confirm whether Work grid should:
   - Mix 9:16 + 16:9 in one grid
   - Or separate tabs/filters (e.g. “Reels” vs “Landscape”)


