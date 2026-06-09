# News Video — Composition Patterns (Remotion)

## Scene Types

### 1. Title Card (opening)

Presents the video title/channel identity and date.

**Elements:**
- Channel name/logo (top, small)
- Today's date (subtle, secondary text)
- Video title (large, bold, hero position)
- Decorative: radial glow behind title

**Typical duration:** 3-5s
**Pacing:** deliberate, allow viewer to settle in

### 2. Key Points Card (default for deep-dive)

Headline + 3 animated bullet points extracted from the full article content. This is the primary scene type.

**Elements:**
- Category badge (chip/tag, top)
- Headline (48px, bold, max 2 lines)
- 3 key point items, each with:
  - Numbered circle (1, 2, 3 — accent color)
  - Key point text (28px, lighter weight)
- Decorative: radial glow (scene-specific hue)

**Typical duration:** 12-20s
**Pacing:** headline enters first, then each key point slides in sequentially as the narrator reads it

**Animation (Remotion):**
```tsx
// Badge pop-in
const badgeScale = spring({ frame: f, fps: 30, config: { damping: 12 } });

// Headline slide-up
<h2 style={{
  transform: `translateY(${interpolate(f, [8, 28], [40, 0])}px)`,
  opacity: interpolate(f, [8, 28], [0, 1]),
}}>{headline}</h2>

// Key points stagger (each ~6s apart at 30fps)
{keyPoints.map((kp, i) => {
  const kpStart = 20 + i * 180; // frames
  return (
    <div style={{
      transform: `translateX(${interpolate(f, [kpStart, kpStart+15], [-35, 0])}px)`,
      opacity: interpolate(f, [kpStart, kpStart+15], [0, 1]),
    }}>
    ...
    </div>
  );
})}
```

### 3. Data Dashboard Card

Designed for data-heavy articles: large animated number + progress bars + supporting stats.

**Elements:**
- Category badge
- Headline (smaller, 42px to save room)
- Hero stat: large animated number (96px, accent)
- Supporting stats: 1-2 ratio bars

**Typical duration:** 12-18s

### 4. Comparison Card

Side-by-side or before/after display.

**Elements:**
- Category badge
- Headline (42px)
- Two stacked rows with dual progress bars
- Each bar: label, fill track (animated width), value

**Typical duration:** 10-16s

### 5. Quote Card

Highlights a notable statement.

**Elements:**
- Category badge (`.icon-quote`)
- Headline (38-42px)
- Large quote block with quotation marks, quote text, attribution

**Typical duration:** 6-10s

### 6. Timeline Card

Chronological progression or future prediction.

**Elements:**
- Category badge
- Headline (44px)
- Timeline block with 2-4 milestone items
- Each item: dot marker + date/year + description

**Typical duration:** 10-14s

### 7. Closing Card (ending)

Call to action and channel branding.

**Elements:**
- "Made with Remotion"
- Site URL: `aixiaoerke.com` (accent color)
- Fade to dark

**Typical duration:** 5-7s

## Scene Type Selection Guide

| Content signal | Scene type |
|----------------|------------|
| Has one key number (融资, %, 参数量) | Number/Stat Card |
| Has 2-3 metrics or percentages | Data Dashboard Card |
| Has a notable direct quote | Quote Card |
| Before/after, comparison | Comparison Card |
| Multi-year trend / prediction | Timeline Card |
| Product launch / partnership | Key Points Card (default) |
| Policy / industry trend | Key Points Card |
| Opening | Title Card |
| Ending | Closing Card |

## Color Approach

### Dark tech palette (recommended for AI news)

- **Background:** `#0a0a1a`
- **Primary text:** `#ffffff` to `#e8e8f0`
- **Accent:** `#00d4ff` or `#7c3aed` (cyan or purple)
- **Secondary accent:** `#f59e0b` or `#10b981`

## Timing Guidelines

| Element | Minimum | Comfortable |
|---------|---------|-------------|
| Title text (short) | 2s | 3-4s |
| Headline (one line) | 2.5s | 4-5s |
| Key Point (one line) | 3s | 5-7s |
| Data Dashboard | 10s | 14-18s |
| Comparison bars | 8s | 10-14s |
| Quote block | 5s | 6-10s |
| Timeline (2 items) | 8s | 10-14s |
| Big number reveal | 2s | 3-4s |
| Closing | 2s | 3-4s |

## Animation Approach (Remotion)

All animation is driven by `interpolate()` or `spring()`:

| Element | Animation | Interpolation |
|---------|-----------|---------------|
| Headline | Slide-up | `frame → [8, 28] → [40, 0]` |
| Key Point | Slide-in left | `frame → [kpStart, kpStart+15] → [-35, 0]` |
| Badge | Scale pop | `spring(frame, fps)` |
| Data counter | Scale + opacity | `frame → [s, s+24] → [0.1, 1]` |
| Progress bar | Width fill | `frame → [s, s+30] → [0, target%]` |
| Scene fade-in | Opacity | `frame → [s, s+10] → [0, 1]` |
| Quote text | Opacity + y | `frame → [s, s+18] → [0, 1]` and `[20, 0]` |
| Timeline item | Slide-in left | `frame → [s, s+15] → [-20, 0]` each item staggered |
