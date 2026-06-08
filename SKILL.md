---
name: ai-news-video
description: "Create AI news videos from aixiaoerke.com/news using HyperFrames. Use when asked to: (1) turn AI news articles into a video, (2) create a daily/weekly AI news briefing, (3) build a video summary of latest industry stories, (4) generate a narrated video from news headlines. Supports the full workflow: fetching news from the API, selecting articles, generating a narration script, setting up design, expanding prompts, building GSAP-animated compositions with scene transitions, karaoke captions synced to TTS, adding voiceover narration, validating, and rendering."
---

# AI News Video

Turn AI news articles from aixiaoerke.com into short videos using HyperFrames. Supports the full pipeline: fetching news, scripting, design system, prompt expansion, GSAP motion graphics with transitions, karaoke captions, voiceover, validation, and rendering.

## Quick Start

1. **Fetch news:** `node scripts/fetch-news.mjs --size 10`
2. **Select** 3-10 articles and write a narration script
3. **Establish design:** copy [design-template.md](references/design-template.md) → `design.md`
4. **Expand prompt:** write `.hyperframes/expanded-prompt.md` (see [expanded-prompt-template.md](references/expanded-prompt-template.md))
5. **Generate audio** using `edge-tts` with `zh-CN-YunxiNeural`
6. **Parse SRT** for scene timing + caption groups
7. **Build composition** — scenes on track 1, karaoke captions on track 2, audio on track 3
8. **Validate:** `npx hyperframes lint && npx hyperframes validate && npx hyperframes inspect --samples 10`
9. **Render:** `npx hyperframes render --output output.mp4`

## Workflow

Follow these phases in order. Do not skip design or prompt expansion for full videos.

### 1. Content Sourcing

`node scripts/fetch-news.mjs [--size N] [--output FILE]`

Fetches latest articles from the API and outputs structured markdown. Select 3-10 articles for the video. The default size is 10.

See [site-api.md](references/site-api.md) for the full API reference.

### 2. Write Narration Script

Write the script in `.hyperframes/script.txt`. Use pure Chinese text — no English words needed since edge-tts handles Chinese natively.

**Narration pace:** edge-tts `zh-CN-YunxiNeural` speaks at ~3-4 chars/s at normal speed. Each paragraph should be about 20-30 chars for a 5-8 second scene.

**Script structure:** Title → N news paragraphs → Closing.

Mark emphasis words in a sidecar `.hyperframes/emphasis.txt` (brand names, numbers) for caption styling.

### 3. Design System

<HARD-GATE>
Before writing ANY HTML, establish visual identity. If you reach for ad-hoc colors or skip `design.md`, stop.
</HARD-GATE>

1. **If `design.md` exists** in the project root — use its exact hex codes, fonts, and motion rules
2. **If not** — copy [design-template.md](references/design-template.md) to `design.md` and customize channel name if needed

All scenes share the same skeleton (badge → headline → summary/stat). Only content and glow hue rotate per scene. See design-template for palette, typography, depth layers, and track layout.

### 4. Prompt Expansion (Mandatory)

Write `.hyperframes/expanded-prompt.md` before building HTML. Use [expanded-prompt-template.md](references/expanded-prompt-template.md).

Read:
- `design.md`
- [news-video-patterns.md](references/news-video-patterns.md) — pick scene type per news item
- [workflow.md](references/workflow.md)

The expansion must include: rhythm declaration, per-scene type + mood + depth layers + animation verbs, transition choreography, caption plan.

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

Group SRT entries by script paragraphs for scene timing. Use all entries for caption groups (see section 7).

### 6. Structure the Video

**Scene type per news item** — do not use identical layout for every item. See [news-video-patterns.md](references/news-video-patterns.md):

| Content | Scene type |
|---------|------------|
| Key number (融资, %, 参数量) | Number/Stat Card |
| Product / partnership | Headline + Summary |
| Policy / trend | Headline Card |
| Opening | Title Card |
| Ending | Closing Card |

**Video structure (example: 10 items, ~82s):**

| Scene | Content | Duration | From SRT |
|-------|---------|----------|----------|
| Scene 1 | Title | ~7s | SRT entries 1-3 |
| Scenes 2-11 | 10 news items | 5-9s each | Individual SRT groups |
| Scene 12 | Closing | ~5s | Last SRT entries |

**Scene start/duration from SRT (chain to avoid overlaps):**
```python
para_ends = [...]  # End times from SRT grouping
total_dur = int(para_ends[-1]) + 1

scene_starts = [0]
for e in para_ends[:-1]:
    scene_starts.append(int(e) + 1)

scene_durs = []
for i in range(len(scene_starts) - 1):
    scene_durs.append(scene_starts[i + 1] - scene_starts[i])
scene_durs.append(total_dur - scene_starts[-1])
```

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
- Scene layout: `div.clip.scene` on track 1, `position:absolute; inset:0; 1920×1080`
- Content: flexbox center, padding `80px 120px`, `overflow:hidden`, `word-break:break-word`
- Depth layers: `.deco-grid` (background) → `.deco-glow` (mid, hue rotates) → content (foreground)
- Persistent: `.progress-track` + `.progress-fill` on track 0
- Counter: top-right `"快讯 N/10"`, 14px, cyan index

**Emphasis in content:** wrap brands and numbers in `<span class="accent">` (`#00d4ff`, weight 700).

**Layout before animation:** build the hero frame as static CSS first. Use flex on `.scene-content` — reserve `position:absolute` for decoratives only.

#### 7.3 GSAP Animation Rules

**Load GSAP locally, not from CDN:**
```html
<script src="assets/gsap.min.js"></script>
```

**Never use CSS `opacity: 0`** — use `gsap.set()` or `gsap.fromTo()`.

**Standard news scene timeline:**

```javascript
tl.to("#progress-fill", { scaleX: 1, duration: TOTAL_DURATION, ease: "none" }, 0);

// Ambient: slow glow breathe over scene
tl.to("#sX-glow", { scale: 1.05, duration: sceneDur, ease: "none" }, sceneStart);

// Standard news scene:
tl.from("#sX-counter", { x: 40, opacity: 0, duration: 0.4 }, sceneStart + 0.1);
tl.from("#sX-badge", { scale: 0, opacity: 0, duration: 0.35, ease: "back.out(1.7)" }, sceneStart + 0.2);
tl.from("#sX-headline", { y: 50, opacity: 0, duration: 0.6, ease: "power3.out" }, sceneStart + 0.5);
tl.from("#sX-summary", { y: 30, opacity: 0, duration: 0.5, ease: "power2.out" }, sceneStart + 1.1);
// Stat card variant:
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
| Deco glow | `scale: 1 → 1.05` | `none` | Full scene duration |
| Scene fade-in | `opacity: 0 → 1` | — | 0.1s |
| Scene fade-out | `opacity: 1 → 0` | `power2.in` | 0.3s before end |
| Hard kill | `tl.set(id, {opacity:0}, endTime)` | none | Required |
| Progress bar | `scaleX: 0 → 1` | `none` | Full video |

Register: `window.__timelines["main"] = tl` with `{ paused: true }`.

#### 7.4 Scene Transitions (Mandatory)

No jump cuts. Transitions ARE the exit — do not add separate exit tweens before a transition (except closing).

| From → To | Type | Duration | Ease |
|-----------|------|----------|------|
| Title → News 1 | Crossfade | 0.4s | `power2.inOut` |
| News N → News N+1 | Slide left (`x: -100`) | 0.5s | `expo.inOut` |
| Last news → Closing | Fade to dark | 0.6s | `power2.in` |

```javascript
// Slide-left between news items (incoming scene starts slightly before outgoing ends)
tl.fromTo("#sX", { x: 100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "expo.inOut" }, sceneStart);
tl.to("#sX-prev", { x: -100, opacity: 0, duration: 0.5, ease: "expo.inOut" }, sceneStart);
```

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
- [ ] `.hyperframes/expanded-prompt.md` written
- [ ] Scene types vary (not all Headline+Summary)
- [ ] Transitions between every scene — no jump cuts
- [ ] Karaoke captions on track 2, synced to SRT
- [ ] Caption self-lint passes
- [ ] Hard kills on all scenes and caption groups
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
| Kokoro TTS garbled | Broken Chinese | Use edge-tts instead |
| macOS `say` spells English | Letter-by-letter | Use edge-tts or Chinese equivalents |

### Content Refresh

1. Re-fetch: `node scripts/fetch-news.mjs --size 10 --output .hyperframes/latest-news.md`
2. Rewrite `.hyperframes/script.txt` and update `.hyperframes/expanded-prompt.md`
3. TTS + SRT: `edge-tts --voice zh-CN-YunxiNeural -f .hyperframes/script.txt --write-media assets/narration.mp3 --write-subtitles assets/narration.srt`
4. Parse SRT → scene timing + caption groups
5. Regenerate HTML (keep `design.md` unchanged for style consistency)
6. Re-render: `npx hyperframes render --output ai-news-new.mp4`

## References

| File | Purpose |
|------|---------|
| [design-template.md](references/design-template.md) | Copy to `design.md` — palette, typography, motion |
| [expanded-prompt-template.md](references/expanded-prompt-template.md) | Mandatory pre-build production plan |
| [caption-karaoke.md](references/caption-karaoke.md) | Karaoke subtitle overlay implementation |
| [news-video-patterns.md](references/news-video-patterns.md) | Scene types, timing, color approach |
| [workflow.md](references/workflow.md) | Extended workflow guide |
| [site-api.md](references/site-api.md) | News API reference |
