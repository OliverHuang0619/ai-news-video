---
name: ai-news-video
description: "Create AI news videos from aixiaoerke.com/news using HyperFrames. Use when asked to: (1) turn AI news articles into a video, (2) create a daily/weekly AI news briefing, (3) build a video summary of latest industry stories, (4) generate a narrated video from news headlines. Supports the full workflow: fetching news from the API, fetching per-article detail, extracting 3 key points per article, generating a narration script, setting up design, expanding prompts, building GSAP-animated compositions with scene transitions, karaoke captions synced to TTS, adding voiceover narration, validating, and rendering."
---

# AI News Video

Turn AI news articles from aixiaoerke.com into short videos using HyperFrames. Supports the full pipeline: fetching news, deep-dive content extraction, 3-key-point analysis, scripting, design system, prompt expansion, GSAP motion graphics with transitions, karaoke captions, voiceover, validation, and rendering.

## Quick Start

1. **Fetch news:** `node scripts/fetch-news.mjs --size 10`
2. **Fetch detail for selected articles:** `node scripts/fetch-detail.mjs --ids ID,ID,ID --output .hyperframes/article-details.md`
3. **Extract 3 key points per article:** read `.hyperframes/article-details.md`, analyze each article's full content, and fill in the 3 key points (see [Phase 1.5](#15-content-deep-view--key-points-extraction))
4. **Write a narration script:** each news item covers its 3 key points
5. **Establish design:** copy [design-template.md](references/design-template.md) → `design.md`
6. **Expand prompt:** write `.hyperframes/expanded-prompt.md` (see [expanded-prompt-template.md](references/expanded-prompt-template.md))
7. **Generate audio** using `edge-tts` with `zh-CN-YunxiNeural`
8. **Parse SRT** for scene timing + caption groups
9. **Build composition** — scenes on track 1, karaoke captions on track 2, audio on track 3
10. **Validate:** `npx hyperframes lint && npx hyperframes validate && npx hyperframes inspect --samples 10`
11. **Render:** `npx hyperframes render --output output.mp4`

## Workflow

Follow these phases in order. Do not skip design or prompt expansion for full videos.

### 1. Content Sourcing

```bash
node scripts/fetch-news.mjs --size 10 --output .hyperframes/latest-news.md
```

Fetches latest articles from the API and outputs structured markdown.

**Select 3-10 articles** for the video. Record their `ID` numbers from the output — you'll need them in the next phase.

See [site-api.md](references/site-api.md) for the full API reference.

### 1.5 Content Deep Dive & Key Points Extraction

After selecting articles, fetch the full detailed content for each one:

```bash
node scripts/fetch-detail.mjs --ids 826,827,828 --output .hyperframes/article-details.md
```

This outputs structured markdown with:
- Full article body (300-800+ Chinese characters from the API's `summary` field)
- Per-article key-point extraction template
- Character count hint

Then generate the analysis workspace:

```bash
node scripts/extract-key-points.mjs \
  --input .hyperframes/article-details.md \
  --output .hyperframes/key-points.md \
  --script    # also emit narration skeletons
```

Now read `.hyperframes/key-points.md`. For each article, read the full content carefully and extract **3 key points**:

| Point | Purpose | Example |
|-------|---------|---------|
| **Point 1: Core Fact** | What happened — who, what, when | "OpenAI plans ChatGPT revamp in weeks" |
| **Point 2: Key Data / Impact** | Numbers, percentages, scope | "80% code written by Claude AI" |
| **Point 3: Industry Significance** | Why it matters — trends, future | "Sports consumption shifts to AI-native" |

Fill the 3 points directly in `key-points.md`. Each point should be **15-25 Chinese characters** — concise enough to fit in a single subtitle line but substantial enough to explain clearly.

**Why extract 3 points?** — A single headline is too shallow for viewer engagement; the full summary is too long for on-screen text. Three structured points give the right depth: core fact, concrete data, and broader meaning.

### 2. Write Narration Script

Write the script in `.hyperframes/script.txt`. Use pure Chinese text — no English words needed since edge-tts handles Chinese natively.

**Narration pace:** edge-tts `zh-CN-YunxiNeural` speaks at ~3-4 chars/s at normal speed. With 3 key points per news item, each news paragraph should be about **45-75 chars** (15-25 seconds) to give each point enough airtime.

**Script structure:**

```
[OPENING] 大家好，今天是6月8日，欢迎收看AI资讯速递。

[NEWS 1 title]
[Point 1: core fact] [Point 2: key data] [Point 3: significance]

[NEWS 2 title]
[Point 1] [Point 2] [Point 3]

...

[CLOSING] 以上就是今天的AI资讯，感谢收看，我们下期再见！
```

**Example — 3-point narration:**
> NBA中国联手阿里巴巴推出了首个官方大模型NBA Chat。这个模型基于阿里千问大模型开发，深度融合了NBA历史数据与球员分析。这标志着文体娱乐正成为大模型落地的核心竞技场。

Mark emphasis words in a sidecar `.hyperframes/emphasis.txt` (brand names, numbers) for caption styling.

### 3. Design System

<HARD-GATE>
Before writing ANY HTML, establish visual identity. If you reach for ad-hoc colors or skip `design.md`, stop.
</HARD-GATE>

1. **If `design.md` exists** in the project root — use its exact hex codes, fonts, and motion rules
2. **If not** — copy [design-template.md](references/design-template.md) to `design.md` and customize channel name if needed

All scenes share the same skeleton (badge → headline → key points). Only content and glow hue rotate per scene. See design-template for palette, typography, depth layers, and track layout.

### 4. Prompt Expansion (Mandatory)

Write `.hyperframes/expanded-prompt.md` before building HTML. Use [expanded-prompt-template.md](references/expanded-prompt-template.md).

Read:
- `design.md`
- `key-points.md` (the filled key points per article)
- [news-video-patterns.md](references/news-video-patterns.md) — pick scene type per news item
- [workflow.md](references/workflow.md)

The expansion must include: rhythm declaration, per-scene type + mood + depth layers + animation verbs, transition choreography, caption plan. Each news scene must account for the 3 key points — either as animated bullet points or a key-points card.

**Skip only** for single-scene edits or trivial timing fixes.

### 5. Generate TTS Audio (edge-tts)

**edge-tts** uses Microsoft's online TTS service. Requires internet access.

**Recommended male voice:** `zh-CN-YunxiNeural` (Novel style, Lively/Sunshine tone)

**Other Chinese voices:**
- `zh-CN-YunyangNeural` — Male, News, Professional
- `zh-CN-YunjianNeural` — Male, Sports/Novel, Passion
- `zh-CN-XiaoxiaoNeural` — Female, News/Novel, Warm
- `zh-CN-XiaoyiNeural` — Female, Cartoon/Novel, Lively

```bash
pip install edge-tts

edge-tts --voice zh-CN-YunxiNeural -f .hyperframes/script.txt \
  --write-media assets/narration.mp3 \
  --write-subtitles assets/narration.srt

ffprobe -v quiet -show_entries format=duration -of csv=p=0 assets/narration.mp3
```

**Parse SRT for scene timing and captions:**

```python
def parse_srt(filepath):
    with open(filepath) as f:
        content = f.read()
    result = []
    for entry in content.strip().split('\n\n'):
        lines = entry.strip().split('\n')
        if len(lines) < 3:
            continue
        def to_sec(t):
            h, m, s = t.split(':')
            return int(h) * 3600 + int(m) * 60 + float(s.replace(',', '.'))
        start, end = [to_sec(x) for x in lines[1].split(' --> ')]
        text = ' '.join(lines[2:])
        result.append((start, end, text))
    return result
```

Group SRT entries by script paragraphs for scene timing. With 3 key points per news item, you'll have roughly 3-5 SRT entries per news scene.

**Captions must be 1:1 with SRT entries** — never manually split or estimate timings:
```bash
node scripts/srt-to-captions.mjs assets/narration.srt compositions/caption-overlay.html
```
Scene `start`/`end` in GSAP must use the same SRT boundaries (see section 7).

### 6. Structure the Video

**Scene type per news item** — do not use identical layout for every item. See [news-video-patterns.md](references/news-video-patterns.md):

| Content | Scene type | Badge icon |
|---------|------------|------------|
| **3 Key Points (default)** | **Key Points Card** — headline + 3 bullets | icon-product |
| 2-3 metrics / percentages | **Data Dashboard Card** — counter + ratio bars | icon-data |
| Notable direct quote | **Quote Card** — quote block + attribution | icon-quote |
| Before/after comparison | **Comparison Card** — dual progress bars | icon-data |
| Multi-year trend / prediction | **Timeline Card** — vertical milestone markers | icon-research |
| One key number (融资, %, 参数量) | Number/Stat Card | — |
| Opening | Title Card | — |
| Ending | Closing Card | — |

For most news items, use the **Key Points Card** scene type: badge + headline + 3 animated bullet points (one per key point from the extraction). Each bullet fades/slides in sequentially as the narrator reads them.

**Video structure (example: 5 items with 3 key points each, ~90s):**

| Scene | Content | Duration | From SRT |
|-------|---------|----------|----------|
| Scene 1 | Title | ~5-6s | SRT entries 1-3 |
| Scenes 2-6 | 5 news items (3 KPs each) | 12-20s each | Individual SRT groups |
| Scene 7 | Closing | ~5-8s | Last SRT entries |

**Scene start/duration from SRT (chain to avoid overlaps):**
```python
# Group SRT entries per scene, extract first start and last end
# para_starts: first SRT start time per scene group
# para_ends: last SRT end time per scene group
para_starts = [0.1, 5.15, 22.112, ...]  # First SRT entry start per scene
para_ends   = [5.2, 22.112, 39.787, ...]  # Last SRT entry end per scene
total_dur = int(para_ends[-1]) + 1

# scene_starts = int() of each scene's first SRT start time
# (NOT int(prev_end) + 1 — that creates a ~1s gap where audio precedes visuals)
scene_starts = [0]
for s in para_starts[1:]:
    scene_starts.append(int(s))

scene_durs = []
for i in range(len(scene_starts) - 1):
    scene_durs.append(scene_starts[i + 1] - scene_starts[i])
scene_durs.append(total_dur - scene_starts[-1])

### 7. Build Composition

#### 7.1 Initialize Project

```bash
cd /path/to/project
npx hyperframes init --name "ai-news-video"
cd ai-news-video
npm install gsap
cp node_modules/gsap/dist/gsap.min.js assets/gsap.min.js
```

#### 7.2 Layout & Design

Read values from `design.md`. Defaults in [design-template.md](references/design-template.md):

- Background: `#0a0a1a`, Accent: `#00d4ff` / `#7c3aed`, Summary: `#b0b0cc`
- Scene layout: `div.clip.scene` on track 1, `position:absolute; inset:0; 1920×1080; background:#0a0a1a` (**every `.scene` must set background — renderer default is white**)
- Content: flexbox center, padding `80px 120px`, `overflow:hidden`, `word-break:break-word`
- Depth layers: `.deco-grid` (background) → `.deco-glow` (mid, hue rotates) → content (foreground)
- Persistent: `.progress-track` + `.progress-fill` on track 0
- Counter: top-right `"快讯 N/10"`, 14px, cyan index

**Emphasis in content:** wrap brands and numbers in `<span class="accent">` (`#00d4ff`, weight 700).

**3 Key Points layout:** Use a numbered list or 3 stacked cards:

```html
<div class="scene-content" id="s2-content">
  <span class="badge">行业动态</span>
  <h2 class="headline">NBA Chat 正式上线</h2>
  <div class="key-points">
    <div class="kp-item" id="s2-kp1">
      <span class="kp-num">1</span>
      <span class="kp-text">NBA中国联手阿里推出首个官方大模型</span>
    </div>
    <div class="kp-item" id="s2-kp2">
      <span class="kp-num">2</span>
      <span class="kp-text">基于千问模型，融合历史数据与球员分析</span>
    </div>
    <div class="kp-item" id="s2-kp3">
      <span class="kp-num">3</span>
      <span class="kp-text">文体娱乐成AI大模型落地核心赛道</span>
    </div>
  </div>
</div>
```

**Layout before animation:** build the hero frame as static CSS first. Use flex on `.scene-content` — reserve `position:absolute` for decoratives only.

#### 7.3 GSAP Animation Rules

**Load GSAP locally, not from CDN:**
```html
<script src="assets/gsap.min.js"></script>
```

**Never use CSS `opacity: 0`** — use `gsap.set()` or `gsap.fromTo()`.

**Initial scene hide — use `.scene` class only:**
```javascript
// CORRECT
gsap.set(".scene", { opacity: 0 });

// WRONG — matches #scenes-container, #s1-title, #s1-glow, etc. and hides the entire scene track
gsap.set("[id^='s']", { opacity: 0 });
```

**Each scene is its own clip** — do not nest all scenes inside one `#scenes-container` div. HyperFrames needs per-scene `data-start` / `data-duration`:

```html
<div id="s2" class="clip scene" data-track-index="1" data-start="8" data-duration="16">
  ...
</div>
```

GSAP tweens visibility within each scene clip; the renderer shows/hides clips by time.

**Key Points Card scene timeline (standard for deep-dive):**

```javascript
tl.to("#progress-fill", { scaleX: 1, duration: TOTAL_DURATION, ease: "none" }, 0);

// Ambient: slow glow breathe over scene
tl.to("#sX-glow", { scale: 1.05, duration: sceneDur, ease: "none" }, sceneStart);

// Standard news scene:
tl.from("#sX-counter", { x: 40, opacity: 0, duration: 0.4 }, sceneStart + 0.1);
tl.from("#sX-badge", { scale: 0, opacity: 0, duration: 0.35, ease: "back.out(1.7)" }, sceneStart + 0.2);
tl.from("#sX-headline", { y: 50, opacity: 0, duration: 0.6, ease: "power3.out" }, sceneStart + 0.5);
tl.from("#sX-summary", { y: 30, opacity: 0, duration: 0.5, ease: "power2.out" }, sceneStart + 1.1);

// 3 Key Points — staggered animation as narrator reads each one:
tl.from("#sX-kp1", { x: -30, opacity: 0, duration: 0.5, ease: "power2.out" }, sceneStart + 1.5);
tl.from("#sX-kp2", { x: -30, opacity: 0, duration: 0.5, ease: "power2.out" }, sceneStart + 5.5);
tl.from("#sX-kp3", { x: -30, opacity: 0, duration: 0.5, ease: "power2.out" }, sceneStart + 10.5);

// Stat card variant (for data-heavy news):
tl.from("#sX-stat", { y: 30, scale: 0.5, opacity: 0, duration: 0.7, ease: "expo.out" }, sceneStart + 0.5);

tl.fromTo("#sX", { opacity: 0 }, { opacity: 1, duration: 0.1 }, sceneStart);
tl.to("#sX", { opacity: 0, duration: 0.3, ease: "power2.in" }, sceneStart + sceneDur - 0.3);
tl.set("#sX", { opacity: 0 }, sceneStart + sceneDur);
```

**Animation verbs:**

| Element | Animation | Ease | Notes |
|---------|-----------|------|-------|
| Badge | `scale: 0 → 1` | `back.out(1.7)` | Pop-in |
| Headline | `y: 50 → 0` | `power3.out` | Slide-up |
| Summary | `y: 30 → 0` | `power2.out` | Stagger after headline |
| Stat number | `y: 30, scale: 0.5 → 1` | `expo.out` | For Number/Stat Card |
| **Key Point item** | **x: -30 → 0** | **`power2.out`** | **Slide-in left, staggered** |
| Deco glow | `scale: 1 → 1.05` | `none` | Full scene duration |
| Scene fade-in | `opacity: 0 → 1` | — | 0.1s |
| Scene fade-out | `opacity: 1 → 0` | `power2.in` | 0.3s before end |
| Hard kill | `tl.set(id, {opacity:0}, endTime)` | none | Required |
| Progress bar | `scaleX: 0 → 1` | `none` | Full video |

The 3 key points stagger timing should align with the SRT boundaries for their respective subtitles. Use the SRT parsed timestamps to determine when each point is being narrated.

Register: `window.__timelines["main"] = tl` with `{ paused: true }`.

#### 7.4 Scene Transitions (Mandatory)

No jump cuts. Transitions ARE the exit — do not add separate exit tweens before a transition (except closing).

| From → To | Type | Duration | Ease |
|-----------|------|----------|------|
| All scene cuts | Overlapping crossfade | 0.35s | `power2.inOut` |

**No slide-left transitions** — they expose the white renderer canvas when scenes move off-screen.

```javascript
var TRANS = 0.35;
// Incoming starts TRANS before outgoing ends — always one scene visible
tl.fromTo("#s2", { opacity: 0 }, { opacity: 1, duration: TRANS, ease: "power2.inOut" }, s2.start - TRANS);
tl.to("#s1", { opacity: 0, duration: TRANS, ease: "power2.inOut" }, s1.end - TRANS);
```

Add a persistent `#bg-plate { background: #0a0a1a }` behind all scenes. Do not add per-element exit tweens before crossfade.

Chain clip `data-start` cumulatively — `data-start + data-duration` must equal next scene's `data-start`.

#### 7.5 Karaoke Captions (Standard)

Do **not** use per-scene static `.subtitle` bars. Use a dedicated caption overlay on **track 2**.

Full implementation: [caption-karaoke.md](references/caption-karaoke.md)

```html
<div id="captions" class="clip"
     data-track-index="2" data-start="0" data-duration="82"
     data-composition-id="captions"
     data-composition-src="compositions/caption-overlay.html">
</div>
```

```css
/* captions must stack above #scenes-container (z-index: 1) */
#captions { position: absolute; inset: 0; z-index: 20; pointer-events: none; }
```

Generate captions from SRT (never hand-write timings):
```bash
node scripts/srt-to-captions.mjs assets/narration.srt compositions/caption-overlay.html
```

Summary:
- Parse SRT → caption groups (3-5 words / ~4-6 Chinese chars)
- Medium-high energy karaoke: active word `#00d4ff` + scale 1.08, read 0.5 opacity, unread 0.3
- Emphasis words (brands, numbers): scale 1.12 + `.emphasis`
- `text-shadow` for readability — no opaque background bar
- Hard kill after every group: `tl.set(groupEl, { opacity: 0, visibility: "hidden" }, group.end)`
- Run caption self-lint before registering timeline

#### 7.6 Fonts

No Google Fonts CDN — fails in headless render. Use `sans-serif` (PingFang SC / Microsoft YaHei).

#### 7.7 Audio Element

```html
<audio id="narration" class="clip" data-track-index="3"
       data-start="0" data-duration="82" data-volume="1.0"
       src="assets/narration.mp3"></audio>
```

- Must have `id` attribute
- Direct `src` attribute, not nested `<source>`
- Different track from scenes (track 3) and captions (track 2)
- `data-duration` matches total video duration

### 8. Validate & Render

```bash
npx hyperframes lint
npx hyperframes validate
npx hyperframes inspect --samples 10

npx hyperframes render --output output.mp4

ffmpeg -y -i output.mp4 -ss 5 -vframes 1 -update true /tmp/frame.jpg
ls -la /tmp/frame.jpg  # should be > 30KB
```

**Checklist:**
- [ ] `design.md` exists and all colors match
- [ ] `key-points.md` exists with 3 points filled per article
- [ ] `.hyperframes/expanded-prompt.md` written with 3KP scene types
- [ ] Scene types vary (KP Card, Data Dashboard, Comparison, Quote, Timeline, Stat Card)
- [ ] 3 key points animated sequentially, staggered by SRT timing
- [ ] Transitions between every scene — no jump cuts
- [ ] Karaoke captions on track 2, synced to SRT
- [ ] Caption self-lint passes
- [ ] Hard kills on all scenes and caption groups
- [ ] Rich visual elements used (data counter, ratio bars, quotes, timeline) when appropriate
- [ ] Badge icon classes applied per scene type
- [ ] Text fits without overflow

### 9. Known Issues & Fixes

| Issue | Symptom | Fix |
|-------|---------|-----|
| GSAP CDN failure | Black video, audio only | Install GSAP locally, copy to `assets/` |
| CSS `opacity: 0` | Elements invisible | Use `gsap.set()` or `gsap.fromTo()` |
| Text overflow | Text beyond 1920×1080 | `fitTextFontSize()`, reduce sizes, `word-break` |
| Clip track overlap | Incorrect render | Chain scene starts; start+duration=next_start |
| Audio not playing | Silent video | `id="narration"`, direct `src` |
| Font loading fails | Tofu characters | `sans-serif`, no Google Fonts |
| edge-tts not found | Command error | `pip install edge-tts` |
| edge-tts network error | Timeout | Check internet / Microsoft API access |
| Ghost captions | Text lingers after phrase | Hard kill + caption self-lint |
| Static subtitle bar | Blocks visuals, out of sync | Use karaoke overlay (section 7.5) |
| Inconsistent style | Each video looks different | Use `design.md` + expanded-prompt |
| `[id^='s']` gsap.set | White/blank video, captions only | Use `gsap.set(".scene", {opacity:0})` only |
| All scenes in one container | Scenes never render | Each `.scene` is its own `clip` with timing attrs |
| White text on white bg | Headlines invisible | `background:#0a0a1a` on every `.scene` + `text-shadow` on headlines |
| Subtitles out of sync | Captions don't match audio | Run `srt-to-captions.mjs` — 1:1 with SRT, never manual splits |
| White flash on cut | Blank frame between scenes | `#bg-plate` + overlapping crossfade, no slide-left |
| Kokoro TTS garbled | Broken Chinese | Use edge-tts instead |
| macOS `say` spells English | Letter-by-letter | Use edge-tts or Chinese equivalents |
| Key points not aligned with narration | Visual bullet lags behind/leads audio | Align KP stagger times with SRT entry timestamps for each key point |
| Key points overflow | 3 bullets exceed scene height | Reduce font sizes, use `.kp-text { font-size: 28px }`, reduce padding |
| Audio precedes scene | Narration starts before scene title/KPs appear | Use `int(srt_start)` not `int(prev_end) + 1` for scene `data-start` |
| IDs missing for detail fetch | Can't get full content | Note IDs from `fetch-news.mjs` output; use `--json` flag for cleaner parsing |

### Content Refresh

1. Re-fetch: `node scripts/fetch-news.mjs --size 10 --output .hyperframes/latest-news.md`
2. Re-fetch detail for selected articles: `node scripts/fetch-detail.mjs --ids ID,ID --output .hyperframes/article-details.md`
3. Update key points: `node scripts/extract-key-points.mjs --input .hyperframes/article-details.md --output .hyperframes/key-points.md --script`
4. Fill in the 3 key points in `key-points.md` (read full content per article)
5. Rewrite `.hyperframes/script.txt` and update `.hyperframes/expanded-prompt.md`
6. TTS + SRT: `edge-tts --voice zh-CN-YunxiNeural -f .hyperframes/script.txt --write-media assets/narration.mp3 --write-subtitles assets/narration.srt`
7. Parse SRT → scene timing + caption groups
8. Regenerate HTML (keep `design.md` unchanged for style consistency)
9. Re-render: `npx hyperframes render --output ai-news-new.mp4`

## References

| File | Purpose |
|------|---------|
| [scripts/fetch-news.mjs](scripts/fetch-news.mjs) | Fetch article list from API |
| [scripts/fetch-detail.mjs](scripts/fetch-detail.mjs) | Fetch full detail for selected articles by ID |
| [scripts/extract-key-points.mjs](scripts/extract-key-points.mjs) | Structure article content for 3-key-point extraction |
| [scripts/srt-to-captions.mjs](scripts/srt-to-captions.mjs) | Generate caption overlay from SRT |
| [design-template.md](references/design-template.md) | Copy to `design.md` — palette, typography, motion |
| [expanded-prompt-template.md](references/expanded-prompt-template.md) | Mandatory pre-build production plan |
| [caption-karaoke.md](references/caption-karaoke.md) | Karaoke subtitle overlay implementation |
| [news-video-patterns.md](references/news-video-patterns.md) | Scene types, timing, color approach |
| [workflow.md](references/workflow.md) | Extended workflow guide |
| [site-api.md](references/site-api.md) | News API reference |
