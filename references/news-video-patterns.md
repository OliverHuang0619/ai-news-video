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

### 4. Key Points Card (default for deep-dive — NEW)

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

**CSS:**
```css
.key-points {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 30px;
  width: 100%;
  max-width: 1200px;
}
.kp-item {
  display: flex;
  align-items: center;
  gap: 16px;
}
.kp-num {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #00d4ff;
  color: #0a0a1a;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kp-text {
  font-size: 30px;
  font-weight: 500;
  color: #e8e8f0;
  line-height: 1.4;
}
```

### 5. Number/Stat Card (optional)

For data-driven news — highlight a key number.

**Elements:**
- Big number (120-160px, bold, accent color)
- Supporting label (24-32px)
- Brief context (20-24px)

**Typical duration:** 4-6s
**Pacing:** number animates in (count up or scale), context fades

### 6. Closing Card (ending)

Call to action or channel branding.

**Elements:**
- "Thanks for watching" or follow CTA
- Channel logo/name
- Decorative: fade to dark

**Typical duration:** 3-4s
**Pacing:** slow fade to black

## Video Structure Templates

### Daily News Briefing with 3 Key Points (50-90s)

```
Title Card (5s) → KP Card 1 (15s) → KP Card 2 (15s) →
KP Card 3 (15s) → KP Card 4 (15s) → KP Card 5 (15s) →
Closing (4s)
```

**Total:** ~84s for 5 news items, 3 key points each

### Mixed Tempo (3 KPs + quick headlines, 60-80s)

```
Title Card (4s) → KP Card 1 (15s) → Headline Card 2 (5s) →
KP Card 3 (15s) → Stat Card 4 (12s) → Headline Card 5 (5s) →
Closing (4s)
```

**Total:** ~60s for 5 items (mix of depth and speed)

### Quick Headlines (15-25s)

```
Title (3s) → Headline 1 (4s) → Headline 2 (4s) →
Headline 3 (4s) → Headline 4 (4s) → Closing (3s)
```

**Total:** ~22s for 4 headlines (no summaries)

### Deep Dive Single Story (40-60s)

```
Title (3s) → Headline (4s) → Number/Stat (5s) →
KP Card — 3 Points (20s) → Quote/Impact (8s) →
Closing (4s)
```

**Total:** ~44s for one in-depth story with 3 key points

## Timing Guidelines

| Element | Minimum | Comfortable | Notes |
|---------|---------|-------------|-------|
| Title text (short) | 2s | 3-4s | Allow reading at natural pace |
| Headline (one line) | 2.5s | 4-5s | Chinese text reads ~3-5 chars/s |
| **Key Point (one line)** | **3s** | **5-7s** | **Each of the 3 points needs its own span** |
| Headline + summary | 6s | 8-10s | Give time for both |
| Big number reveal | 2s | 3-4s | Count-up animation needs settle time |
| Transition overlap | 0.3s | 0.5s | Crossfade or wipe |
| Closing | 2s | 3-4s | Fade out |

**With 3 Key Points:** budget ~15-20s per news scene (5-7s per point).

## Color Approach

### Dark tech palette (recommended for AI news)

- **Background:** `#0a0a1a` to `#1a1a2e` (deep navy/black)
- **Primary text:** `#ffffff` to `#e8e8f0`
- **Accent:** `#00d4ff` or `#7c3aed` (cyan or purple)
- **Secondary accent:** `#f59e0b` or `#10b981` (amber or emerald)
- **Surface:** `rgba(255,255,255,0.05)` for subtle cards

### Key Points — Number colors
- Numbered circle background: use accent color (e.g. `#00d4ff`)
- Number text: use background dark (`#0a0a1a`)
- When circle is accompanied by accent border, use `rgba(0,212,255,0.2)` for unread points, full accent for active point

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

### Key Point entrance (each of the 3 points)
```
from: { x: -30, opacity: 0 }
to:   { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
```
Delay: staggered by SRT timestamps (not fixed intervals). Each KP enters when the narrator starts reading it.

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
- **Between different news items:** overlapping crossfade, 0.35s
- **From content to closing:** fade to dark, 0.6-0.8s, power2.in

All crossfades — **no slide-left transitions** (exposes white canvas).

## TTS / Voiceover

For Chinese news narration with 3 key points:
- Use edge-tts voice `zh-CN-YunxiNeural` (recommended male)
- Target reading speed: 3-4 Chinese characters per second
- Script for each news item: 3 short sentences (one per key point)
- Each sentence: 15-25 chars → ~5-8 seconds of narration
- Total per news item: ~15-25 seconds for all 3 points

**Script structure for 3 KPs:**
```
[NEWS X headline]
[KP1: Core fact — ~20 chars, 5-7s]
[KP2: Key data — ~20 chars, 5-7s]
[KP3: Significance — ~20 chars, 5-7s]
```

## Data Source Integration

1. Run `node scripts/fetch-news.mjs --size 5 --output .hyperframes/latest-news.md`
2. Select 3-5 articles for the video
3. Run `node scripts/fetch-detail.mjs --ids ID1,ID2,ID3 --output .hyperframes/article-details.md`
4. Run `node scripts/extract-key-points.mjs --input .hyperframes/article-details.md --output .hyperframes/key-points.md --script`
5. Read each article's full content and fill in 3 key points
6. Write a narration script using the 3 key points per article
7. Build the composition using the scenes above

## Example: Scene Structure (1 title + 2 news with 3 KPs + closing)

```html
<!-- Scene 1: Title -->
<div class="scene-content" id="s1">
  <h1 class="title">AI 资讯速递</h1>
  <p class="date">2026年6月8日</p>
</div>

<!-- Scene 2: News 1 — Key Points Card -->
<div class="scene-content" id="s2">
  <span class="badge">行业动态</span>
  <h2 class="headline">NBA中国携手阿里巴巴上线"NBA Chat"</h2>
  <div class="key-points">
    <div class="kp-item" id="s2-kp1">
      <span class="kp-num">1</span>
      <span class="kp-text">NBA中国联手阿里推出首个官方大模型</span>
    </div>
    <div class="kp-item" id="s2-kp2">
      <span class="kp-num">2</span>
      <span class="kp-text">基于千问，融合历史数据与球员深度分析</span>
    </div>
    <div class="kp-item" id="s2-kp3">
      <span class="kp-num">3</span>
      <span class="kp-text">文体娱乐成为大模型技术落地核心赛道</span>
    </div>
  </div>
</div>

<!-- Scene 3: News 2 — Key Points Card -->
<div class="scene-content" id="s3">
  <span class="badge">行业动态</span>
  <h2 class="headline">OpenAI 秘密推进 ChatGPT 重大改版</h2>
  <div class="key-points">
    <div class="kp-item" id="s3-kp1">
      <span class="kp-num">1</span>
      <span class="kp-text">ChatGPT将集成编码工具与AI智能体</span>
    </div>
    <div class="kp-item" id="s3-kp2">
      <span class="kp-num">2</span>
      <span class="kp-text">战略重心从多产品转向单一超级应用</span>
    </div>
    <div class="kp-item" id="s3-kp3">
      <span class="kp-num">3</span>
      <span class="kp-text">Sora等支线项目将被精简或放弃</span>
    </div>
  </div>
</div>

<!-- Scene 4: Closing -->
<div class="scene-content" id="s4">
  <p class="closing">感谢收看，我们下期再见！</p>
</div>
```

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
