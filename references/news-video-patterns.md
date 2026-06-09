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

### 4. Key Points Card (default for deep-dive)

Headline + 3 animated bullet points extracted from the full article content. This is the primary scene type for the enhanced workflow where each article has 3 key points.

**Elements:**
- Category badge (chip/tag, top)
- Headline (48-60px, bold, max 2 lines)
- 3 key point items, each with:
  - Numbered circle (1, 2, 3 — accent color, 28px)
  - Key point text (28-32px, lighter weight, single line max ~25 chars)
- Decorative: separator between points, numbering accent

**Typical duration:** 12-20s
**Pacing:** headline enters first, then each key point slides in sequentially as the narrator reads it

**Animation:**
| Element | Entrance | Timing |
|---------|----------|--------|
| Badge | Scale pop | 0.2s |
| Headline | Slide-up (y: 50→0) | 0.5s |
| Key Point 1 | Slide-in left (x: -30→0) | ~1.5s in (when narrator starts KP1) |
| Key Point 2 | Slide-in left (x: -30→0) | ~5-8s in (SRT boundary) |
| Key Point 3 | Slide-in left (x: -30→0) | ~10-15s in (SRT boundary) |

**Stagger key point animation by SRT timestamps**, not by fixed intervals. Each key point should appear just as the narrator starts reading it.

**HTML structure:**
```html
<div class="scene-content" id="sX-content">
  <span class="badge">行业动态</span>
  <h2 class="headline">NBA Chat 正式上线</h2>
  <div class="key-points">
    <div class="kp-item" id="sX-kp1">
      <span class="kp-num">1</span>
      <span class="kp-text">NBA联手阿里推出首个官方大模型</span>
    </div>
    <div class="kp-item" id="sX-kp2">
      <span class="kp-num">2</span>
      <span class="kp-text">基于千问，融合历史数据与球员分析</span>
    </div>
    <div class="kp-item" id="sX-kp3">
      <span class="kp-num">3</span>
      <span class="kp-text">文体娱乐成AI大模型落地核心赛道</span>
    </div>
  </div>
</div>
```

**Left-aligned layout:** Scene content is centered. The 1.2.3 numbered list block is centered within the scene, but each list item is strictly left-aligned. Add these CSS rules:

```css
.scene-content { display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 1580px; margin: 0 auto; }
.key-points { text-align: left; width: 100%; max-width: 1100px; margin: 16px auto 0 auto; }
.kp-item { display: flex; align-items: flex-start; gap: 18px; margin-bottom: 18px; width: 100%; }
.kp-num { flex-shrink: 0; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(0,212,255,0.12); color: #00d4ff; font-size: 18px; font-weight: 700; }
.kp-text { font-size: 30px; color: #e8e8f0; line-height: 1.4; flex: 1; text-align: left; }
```

### 5. Data Dashboard Card — NEW

Designed for data-heavy articles: large animated number + progress bars + supporting stats all on one screen. Best for stories with 2+ metrics or percentages.

**Elements:**
- Category badge (with `.icon-data` icon class)
- Headline (42-48px to save room for data)
- Hero stat: large animated counter (96px, accent color)
- Supporting stats: 1-2 ratio bars or comparison bars below
- Optional: small label row with secondary metrics

**Typical duration:** 12-18s
**Pacing:** headline enters, then hero counter animates in (scale+opacity), then bars fill sequentially

**Animation sequence:**
| Element | Entrance | Timing |
|---------|----------|--------|
| Badge + icon | Scale pop | 0.2s |
| Headline | Slide-up | 0.5s |
| Hero counter | Scale+opacity (expo.out) | ~1.5s (SRT) |
| Progress bar 1 | Width 0→target (power2.out) | ~5s (SRT) |
| Progress bar 2 | Width 0→target (power2.out) | ~9s (SRT) |

**HTML structure:**
```html
<div class="scene-content" id="sX-content">
  <span class="counter">快讯 <span class="counter-index">4</span>/6</span>
  <span class="badge icon-data">行业数据</span>
  <h2 class="headline" style="font-size:44px;">中国日Token调用量突破140万亿</h2>
  <div class="data-counter">
    <span class="counter-value" id="sX-hero">140万亿</span>
    <span class="counter-label">日均调用量</span>
  </div>
  <div class="ratio-bar">
    <div class="ratio-bar-track">
      <div class="ratio-bar-fill" id="sX-bar1" style="width:0%"></div>
    </div>
    <div class="ratio-bar-labels">
      <span class="bar-label">较2024年初增长</span>
      <span class="bar-value">1,000倍</span>
    </div>
  </div>
</div>
```

**CSS:** Use rich visual element styles from [design-template.md](design-template.md) (`.data-counter`, `.ratio-bar`, `.comparison-block`).

### 6. Comparison Card — NEW

Side-by-side or before/after display. Best for stories comparing two states (before/after, human/AI, past/present).

**Elements:**
- Category badge
- Headline (shorter, 42px)
- Two comparison columns or stacked rows with dual progress bars
- Each bar shows a label, fill track (animated width), and value

**Typical duration:** 10-16s
**Pacing:** headline, then left bar fills, then right bar fills

**HTML structure:**
```html
<div class="scene-content" id="sX-content">
  <span class="counter">快讯 <span class="counter-index">4</span>/6</span>
  <span class="badge icon-data">数据对比</span>
  <h2 class="headline" style="font-size:42px;">自动化流量正式超越人类</h2>
  <div class="comparison-block">
    <div class="comparison-row">
      <span class="comp-label">人类流量</span>
      <div class="comp-track">
        <div class="comp-fill" id="sX-c1" style="width:0%; background:linear-gradient(90deg,#b0b0cc,#7c3aed);"></div>
      </div>
      <span class="comp-value">42.6%</span>
    </div>
    <div class="comparison-row">
      <span class="comp-label">机器人流量</span>
      <div class="comp-track">
        <div class="comp-fill" id="sX-c2" style="width:0%"></div>
      </div>
      <span class="comp-value accent">57.4%</span>
    </div>
  </div>
</div>
```

**GSAP:**
```javascript
tl.to("#sX-c1", { width: "42.6%", duration: 0.8, ease: "power2.out" }, srtStart);
tl.to("#sX-c2", { width: "57.4%", duration: 0.8, ease: "power2.out" }, srtStart + 0.3);
```

### 7. Quote Card — NEW

Highlights a notable statement from the article. Best when the article contains a striking direct quote.

**Elements:**
- Category badge (with `.icon-quote` icon)
- Headline (shorter, 38-42px)
- Large quote block (`.quote-block`) with quotation marks, quote text, attribution
- Decorative: accent bar beneath the quote

**Typical duration:** 6-10s (quote is fast to read)
**Pacing:** badge → headline → quote text fades in → attribution fades

**HTML structure:**
```html
<div class="scene-content" id="sX-content">
  <span class="counter">快讯 <span class="counter-index">1</span>/6</span>
  <span class="badge icon-quote">行业声音</span>
  <h2 class="headline" style="font-size:38px;">OpenAI 员工直言"Chat is dead"</h2>
  <div class="quote-block">
    <span class="quote-mark">"</span>
    <p class="quote-text">聊天已死</p>
    <span class="quote-attribution" style="display:block;text-align:center;">— OpenAI高级员工谈及ChatGPT改版</span>
  </div>
</div>
```

### 8. Timeline Card — NEW

Chronological progression or future prediction. Best for stories with multi-year trends or forecasts.

**Elements:**
- Category badge
- Headline (44px)
- Timeline block with 2-4 milestone items
- Each item: dot marker + date/year (large, accent) + description
- Active/current milestone gets glowing dot

**Typical duration:** 10-14s
**Pacing:** headline, then timeline items stagger in from top to bottom

**HTML structure:**
```html
<div class="scene-content" id="sX-content">
  <span class="counter">快讯 <span class="counter-index">2</span>/6</span>
  <span class="badge icon-research">趋势预测</span>
  <h2 class="headline" style="font-size:44px;">孙正义：ASI两年内到来</h2>
  <div class="timeline-block">
    <div class="tm-item">
      <div class="tm-dot"></div>
      <span class="tm-date">2024</span>
      <span class="tm-desc">最初预测：10年</span>
    </div>
    <div class="tm-item active">
      <div class="tm-dot"></div>
      <span class="tm-date">2026</span>
      <span class="tm-desc">修正预测：2年内</span>
    </div>
  </div>
</div>
```

### 9. Number/Stat Card (original)

For data-driven news — highlight a single key number.

**Elements:**
- Big number (120-160px, bold, accent color)
- Supporting label (24-32px)
- Brief context (20-24px)

**Typical duration:** 4-6s
**Pacing:** number animates in (count up or scale), context fades

### 10. Closing Card (ending)

Call to action and channel branding. Always include the site URL.

**Elements:**
- "Thanks for watching" or follow CTA
- Site URL on screen: `aixiaoerke.com` (large accent text in closing scene HTML)
- TTS audio says **「可访问AI小儿科」** in `script.txt` — not the domain; captions show `aixiaoerke.com` via `srt-to-captions.mjs`
- Channel logo/name
- Decorative: fade to dark

**Typical duration:** 5-7s
**Pacing:** CTA text fades in, then fade to black

## Scene Type Selection Guide

Pick the best scene type based on article content:

| Content signal | Scene type | Hero element |
|----------------|------------|--------------|
| Has one key number (融资, %, 参数量) | Number/Stat Card | 140px stat + label |
| Has 2-3 metrics or percentages | Data Dashboard Card | animated counter + ratio bars |
| Has a notable direct quote | Quote Card | quote block with attribution |
| Before/after, human/AI comparison | Comparison Card | dual progress bars |
| Multi-year trend or prediction | Timeline Card | vertical timeline with markers |
| Product launch / partnership | Key Points Card (default) | headline + 3 animated bullets |
| Policy / industry trend | Key Points Card | headline + 3 KPs |
| Opening | Title Card | channel + date + title |
| Ending | Closing Card | CTA + site URL + channel name |

**Vary scene types across items.** Use at least one Data Dashboard or Comparison card per video to add visual variety.

## Video Structure Templates

### Data-Rich Daily Briefing (50-90s)

```
Title Card (5s) → Dashboard Card (16s) → KP Card 2 (15s) →
Comparison Card (14s) → KP Card 4 (15s) → Timeline Card (12s) →
Closing (4s)
```

**Total:** ~81s for 5 items with varied scene types

### Mixed Tempo (3 KPs + rich visuals, 60-80s)

```
Title Card (4s) → KP Card 1 (15s) → Quote Card (8s) →
KP Card 3 (15s) → Dashboard Card (14s) → Comparison Card (12s) →
Closing (4s)
```

**Total:** ~72s for 5 items

### Quick Headlines (15-25s)

```
Title (3s) → Headline 1 (4s) → Headline 2 (4s) →
Headline 3 (4s) → Headline 4 (4s) → Closing (3s)
```

**Total:** ~22s for 4 headlines (no summaries)

### Deep Dive Single Story (40-60s)

```
Title (3s) → Headline (4s) → Dashboard Card (14s) →
KP Card — 3 Points (18s) → Timeline Card (10s) →
Closing (4s)
```

**Total:** ~53s for one in-depth story with rich visuals

## Timing Guidelines

| Element | Minimum | Comfortable | Notes |
|---------|---------|-------------|-------|
| Title text (short) | 2s | 3-4s | Allow reading at natural pace |
| Headline (one line) | 2.5s | 4-5s | Chinese text reads ~3-5 chars/s |
| Key Point (one line) | 3s | 5-7s | Each of the 3 points needs its own span |
| Headline + summary | 6s | 8-10s | Give time for both |
| **Data Dashboard** | **10s** | **14-18s** | Hero counter + 1-2 bars + labels |
| **Comparison bars** | **8s** | **10-14s** | Two bars fill sequentially + labels |
| **Quote block** | **5s** | **6-10s** | Quote text + attribution |
| **Timeline (2 items)** | **8s** | **10-14s** | 2 milestone markers + labels |
| Big number reveal | 2s | 3-4s | Count-up animation needs settle time |
| Transition overlap | 0.3s | 0.5s | Crossfade |
| Closing | 2s | 3-4s | Fade out |

## Color Approach

### Dark tech palette (recommended for AI news)

- **Background:** `#0a0a1a` to `#1a1a2e` (deep navy/black)
- **Primary text:** `#ffffff` to `#e8e8f0`
- **Accent:** `#00d4ff` or `#7c3aed` (cyan or purple)
- **Secondary accent:** `#f59e0b` or `#10b981` (amber or emerald)
- **Surface:** `rgba(255,255,255,0.05)` for subtle cards

### Rich Visual Element Colors

| Element | Color | Notes |
|---------|-------|-------|
| Progress bar fill | `linear-gradient(90deg, #00d4ff, #7c3aed)` | Default gradient |
| Comparison bar left | `#b0b0cc → #7c3aed` | For "before" / "human" side |
| Comparison bar right | `#00d4ff → #3b82f6` | For "after" / "AI" side |
| Quote mark | `#00d4ff, opacity 0.4` | Large quotation symbol |
| Timeline dot (active) | `#00d4ff + box-shadow glow` | Active milestone |
| Timeline dot (inactive) | `#b0b0cc` | Past milestones |
| Data counter value | `#00d4ff + text-shadow glow` | Hero metric number |
| Badge icon | per category color | See icon styles in design-template.md |

### Light professional palette (alternative)

- **Background:** `#f5f5f7` (light gray)
- **Primary text:** `#1d1d1f`
- **Accent:** `#0071e3` (Apple blue)
- **Secondary:** `#86868b`

## Animation Patterns

### Headline entrance
```
from: { y: 40, opacity: 0 }
to:   { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
```

### Key Point entrance (each of the 3 points)
```
from: { x: -35, opacity: 0 }
to:   { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
```
Delay: staggered by SRT timestamps.

### Data Counter entrance (hero number)
```
from: { opacity: 0, scale: 0.3 }
to:   { opacity: 1, scale: 1, duration: 0.8, ease: "expo.out" }
```

### Progress bar fill
```
from: { width: 0% }
to:   { width: TARGET%, duration: 1.0, ease: "power2.out" }
```

### Comparison bar fill (dual)
```
// Left bar
from: { width: 0% }
to:   { width: X%, duration: 0.8, ease: "power2.out" }
// Right bar (staggered)
from: { width: 0% }
to:   { width: Y%, duration: 0.8, ease: "power2.out" }
```
Delay: 0.3s between bars.

### Quote entrance
```
from: { opacity: 0, y: 20 }
to:   { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
```
Attribution fades in 0.3s after quote.

### Timeline item entrance
```
from: { opacity: 0, x: -20 }
to:   { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
```
Each item staggered by 0.3s.

### Summary entrance (staggered after headline)
```
from: { y: 24, opacity: 0 }
to:   { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
```
Delay: 0.15-0.3s after headline

### Category badge entrance
```
from: { scale: 0, opacity: 0 }
to:   { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
```

## Transition Patterns

- **Between related scenes:** quick dissolve, 0.3s
- **Between different news items:** overlapping crossfade, 0.35s
- **From content to closing:** fade to dark, 0.6-0.8s, power2.in

All crossfades — **no slide-left transitions** (exposes white canvas).

## SRT Timing for 3 Key Points

When grouping SRT entries for a news item with 3 key points, each key point usually spans 1-2 SRT entries:

```
SRT entries for News 2 (3 key points):
[14.2s - 19.1s]  NBA中国联手阿里巴巴推出了首个官方大模型NBA Chat
                  ← KP1 narration here
[19.1s - 24.3s]  这个模型基于阿里千问大模型开发，深度融合了NBA历史数据
                  ← KP2 narration here
[24.3s - 29.8s]  这标志着文体娱乐正成为大模型落地的核心竞技场
                  ← KP3 narration here
```

Align GSAP key-point animation starts with the START of each SRT entry pair:
```javascript
tl.from("#s2-kp1", { x: -30, opacity: 0, duration: 0.5 }, 14.2);  // SRT start
tl.from("#s2-kp2", { x: -30, opacity: 0, duration: 0.5 }, 19.1);  // SRT start
tl.from("#s2-kp3", { x: -30, opacity: 0, duration: 0.5 }, 24.3);  // SRT start
```

## Data Source Integration

1. Run `node scripts/fetch-news.mjs --size 5 --output .hyperframes/latest-news.md`
2. Select 3-5 articles for the video
3. Run `node scripts/fetch-detail.mjs --ids ID1,ID2,ID3 --output .hyperframes/article-details.md`
4. Run `node scripts/extract-key-points.mjs --input .hyperframes/article-details.md --output .hyperframes/key-points.md --script`
5. Read each article's full content and fill in 3 key points
6. For data-heavy articles, note specific numbers and percentages → assign Dashboard or Comparison card
7. Write a narration script using the 3 key points per article
8. Build the composition using the scene types above
