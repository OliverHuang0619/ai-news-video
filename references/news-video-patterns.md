# News Video — Composition Patterns

## Scene Types

### 1. Title Card (opening)

Presents the video title/channel identity and date.

**Elements:**
- Channel name/logo (top, small)
- Today's date (subtle, secondary text)
- Video title (large, bold, hero position)
- Decorative: hairline rule, radial glow behind title

**Typical duration:** 3-5s
**Pacing:** deliberate, allow viewer to settle in

### 2. Headline Card (per news item)

Presents one news headline as a bold statement.

**Elements:**
- Headline text (72-96px, bold, max 2 lines)
- Category badge (subtle chip/tag)
- Decorative: subtle background shape, dot pattern

**Typical duration:** 4-6s
**Pacing:** enter fast, hold for reading

### 3. Headline + Summary (per news item)

Headline + a short summary or key stat.

**Elements:**
- Headline (48-60px, bold, top)
- Summary (28-36px, lighter weight, below)
- Decorative: separator line, accent underline on headline

**Typical duration:** 7-10s
**Pacing:** headline enters first, summary follows, hold

### 4. Number/Stat Card (optional)

For data-driven news — highlight a key number.

**Elements:**
- Big number (120-160px, bold, accent color)
- Supporting label (24-32px)
- Brief context (20-24px)

**Typical duration:** 4-6s
**Pacing:** number animates in (count up or scale), context fades

### 5. Closing Card (ending)

Call to action or channel branding.

**Elements:**
- "Thanks for watching" or follow CTA
- Channel logo/name
- Decorative: fade to dark

**Typical duration:** 3-4s
**Pacing:** slow fade to black

## Video Structure Templates

### Daily News Briefing (30-45s)

```
Title Card (4s) → Headline 1 (5s) → H+S 1 (7s) →
Headline 2 (5s) → H+S 2 (7s) → Headline 3 (5s) →
Closing (4s)
```

**Total:** ~37s for 3 news items

### Quick Headlines (15-25s)

```
Title (3s) → Headline 1 (4s) → Headline 2 (4s) →
Headline 3 (4s) → Headline 4 (4s) → Closing (3s)
```

**Total:** ~22s for 4 headlines (no summaries)

### Deep Dive Single Story (40-60s)

```
Title (3s) → Headline (4s) → Number/Stat (5s) →
Summary 1 (8s) → Summary 2 (8s) → Quote/Impact (6s) →
Closing (4s)
```

**Total:** ~38s for one in-depth story

## Timing Guidelines

| Element | Minimum | Comfortable | Notes |
|---------|---------|-------------|-------|
| Title text (short) | 2s | 3-4s | Allow reading at natural pace |
| Headline (one line) | 2.5s | 4-5s | Chinese text reads ~3-5 chars/s |
| Headline + summary | 6s | 8-10s | Give time for both |
| Big number reveal | 2s | 3-4s | Count-up animation needs settle time |
| Transition overlap | 0.3s | 0.5s | Crossfade or wipe |
| Closing | 2s | 3-4s | Fade out |

## Color Approach

### Dark tech palette (recommended for AI news)

- **Background:** `#0a0a1a` to `#1a1a2e` (deep navy/black)
- **Primary text:** `#ffffff` to `#e8e8f0`
- **Accent:** `#00d4ff` or `#7c3aed` (cyan or purple)
- **Secondary accent:** `#f59e0b` or `#10b981` (amber or emerald)
- **Surface:** `rgba(255,255,255,0.05)` for subtle cards

### Light professional palette (alternative)

- **Background:** `#f5f5f7` (light gray)
- **Primary text:** `#1d1d1f`
- **Accent:** `#0071e3` (Apple blue)
- **Secondary:** `#86868b`

## Animation Patterns

### Headline entrance
```
from: { y: 40, opacity: 0 }
to:   { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
```

### Summary entrance (staggered after headline)
```
from: { y: 24, opacity: 0 }
to:   { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
```
Delay: 0.15-0.3s after headline

### Number count-up
```
from: { innerText: 0 }   // use a Proxy or text plugin
to:   { innerText: finalValue, duration: 1.2, ease: "expo.out" }
```

### Category badge entrance
```
from: { scale: 0, opacity: 0 }
to:   { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
```

## Transition Patterns

- **Between related scenes** (headline → same headline+summary): quick dissolve, 0.3s
- **Between different news items:** stronger transition — slide left, or blur crossfade, 0.5s
- **From content to closing:** fade to dark, 0.6-0.8s, power2.in

## TTS / Voiceover

For Chinese news narration:
- Use Kokoro TTS voice `zh_female` or `zh_male`
- Target reading speed: 3-5 Chinese characters per second
- Script should be written in natural spoken Chinese, not literary style
- Place pauses after each headline (0.3-0.5s)

## Data Source Integration

1. Run `node scripts/fetch-news.mjs --size 5 --output .hyperframes/latest-news.md`
2. Select 3-5 articles for the video
3. Write a narration script using the selected articles' titles and summaries
4. Build the composition using the scenes above

## Example: Scene Structure (3 headlines)

```html
<!-- Scene 1: Title -->
<div class="scene-content" id="s1">
  <h1 class="title">AI 资讯速递</h1>
  <p class="date">2026年6月8日</p>
</div>

<!-- Scene 2: Headline 1 -->
<div class="scene-content" id="s2">
  <span class="badge">行业动态</span>
  <h2 class="headline">NBA中国携手阿里巴巴上线"NBA Chat"</h2>
</div>

<!-- Scene 3: Headline 1 + Summary -->
<div class="scene-content" id="s3">
  <span class="badge">行业动态</span>
  <h2 class="headline">NBA中国携手阿里巴巴上线"NBA Chat"</h2>
  <p class="summary">基于阿里千问大模型开发，深度融合NBA历史数据与球员分析</p>
</div>

<!-- Scene 4: Headline 2 -->
<div class="scene-content" id="s4">
  <span class="badge">行业动态</span>
  <h2 class="headline">中国将首发公有云大模型Token性能榜</h2>
</div>

<!-- ... and so on for each news item -->
```
