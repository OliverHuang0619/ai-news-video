# AI News Video — Workflow Guide

## End-to-End Process

### Phase 1: Content Sourcing

1. Run `node scripts/fetch-news.mjs --size 10 --output .hyperframes/latest-news.md`
2. Read the output and select 3-10 articles for the video
3. **Record article IDs** from the output — you'll need them for the deep-dive phase

**API Details:** See [site-api.md](site-api.md) for endpoint documentation.

### Phase 2: Content Deep Dive & Key Points Extraction

Fetch the full article content for each selected article:

1. Run `node scripts/fetch-detail.mjs --ids 826,827,828 --output .hyperframes/article-details.md`
   — Use the IDs you recorded in Phase 1
   — This fetches each article's complete body from `/api/news/:id`

2. Prepare the analysis workspace:

   ```bash
   node scripts/extract-key-points.mjs \
     --input .hyperframes/article-details.md \
     --output .hyperframes/key-points.md \
     --script
   ```

3. **Read each article's full content** in `key-points.md`. For each article, extract **3 key points**:

   | # | Focus | Description |
   |---|-------|-------------|
   | KP1 | Core Fact | What happened? (who, what, when — 15-25 chars) |
   | KP2 | Key Data / Impact | Specific numbers, percentages, or effects (15-25 chars) |
   | KP3 | Industry Significance | Why it matters — trends, future implications (15-25 chars) |

4. Fill the 3 key points directly into `key-points.md` under each article's "关键信息提炼" section.

**Why 3 points?** — One headline is too shallow for engagement; the full summary is too long for on-screen text. Three structured points (fact → data → implication) provide the right depth for a 12-20 second scene.

**Learning from content:**
- Look for specific numbers, percentages, or amounts (融资额, 参数量, 增长率)
- Note the companies/organizations involved and their roles
- Identify the trend or pattern the article reveals about the AI industry
- Capture direct quotes when available ("Chat is dead", "两年内")

### Phase 3: Script Generation

Take the selected news and write a narration script in `.hyperframes/script.txt`.

**With 3 Key Points, the narration for each news item follows a structured pattern:**

```
[OPENING] 大家好，今天是6月8日，欢迎收看AI资讯速递。

[NEWS 1 — headline]
[Point 1: core fact narration] [Point 2: key data narration] [Point 3: significance narration]

[NEWS 2 — headline]
[Point 1] [Point 2] [Point 3]

...

[CLOSING] 以上就是今天的AI资讯，感谢收看，我们下期再见！
```

**Example — 3-point narration for one news item (~15-20 chars/point, ~48-60 chars total):**
> NBA中国联手阿里巴巴推出首个官方大模型NBA Chat。 / 基于千问大模型融合了历史数据与球员分析。 / 文体娱乐正成为大模型落地核心竞技场。

**Narration pace with 3 points:** edge-tts speaks at ~3-4 chars/s. Each key point needs ~5-8 seconds. Total per news item: ~15-25 seconds.

List brand names and numbers in `.hyperframes/emphasis.txt` for caption styling.

**Old format (single summary per article):**
```
[OPENING] 大家好，今天是6月8日，欢迎收看AI资讯速递。
[NEWS 1] 首先，NBA中国联手阿里巴巴推出了首个官方大模型"NBA Chat"…
[NEWS 2] 另一条重要消息，中国将首发公有云大模型Token性能榜…
[NEWS 3] …
[CLOSING] 以上就是今天的AI资讯，感谢收看，我们下期再见！
```

List brand names and numbers in `.hyperframes/emphasis.txt` for caption styling.

### Phase 4: Design System

<HARD-GATE>
Before writing any HTML, `design.md` must exist in the project root.
</HARD-GATE>

1. **If `design.md` exists** — extract exact hex codes, fonts, and mood
2. **If not** — copy [design-template.md](design-template.md) to project root as `design.md`

Do not invent colors at render time. Reuse `design.md` across content refreshes for visual consistency.

### Phase 5: Prompt Expansion (Mandatory)

Write `.hyperframes/expanded-prompt.md` using [expanded-prompt-template.md](expanded-prompt-template.md).

Read:
- `design.md`
- `key-points.md` (the filled 3 key points per article)
- [news-video-patterns.md](news-video-patterns.md) — assign scene type per news item
- This file

Include: rhythm declaration, per-scene beats (type, mood, layers, verbs), transition choreography, caption plan. Each news scene's animation verbs should account for the 3 key points.

**Skip only** for single-scene compositions or trivial edits.

### Phase 6: TTS + SRT

```bash
pip install edge-tts

edge-tts --voice zh-CN-YunxiNeural -f .hyperframes/script.txt \
  --write-media assets/narration.mp3 \
  --write-subtitles assets/narration.srt
```

Parse SRT for:
- **Scene timing** — group entries by script paragraph. Each news item (3 key points) spans multiple SRT entries.
- **Caption groups** — see [caption-karaoke.md](caption-karaoke.md)

Optional higher-quality word timestamps:

```bash
npx hyperframes transcribe assets/narration.mp3 --output assets/captions.json --language zh
```

### Phase 7: Structure & Rhythm Planning

1. **Scene count:** title + N news + closing
2. **Scene types:** use **Key Points Card** as default (3 animated bullets + headline). Vary with Stat Card for data-heavy news.
3. **Tempo:** `hook – 快讯×N (each with 3 KPs) – 收尾`
4. **Duration:** from SRT grouping (title ~7s, news **12-20s each** with 3 KPs, closing ~5s)

**With 3 key points:** news items are longer (12-20s each). Each key point gets ~5-8 seconds narrated screen time. Animate each KP bullet as the narrator reads it — synchronize GSAP stagger times with SRT entry timestamps.

### Phase 8: Layout Before Animation

For every scene:

1. Identify the hero frame
2. Write static CSS — `.scene-content` fills scene with flex + padding
3. Three depth layers: `.deco-grid` → `.deco-glow` → content
4. Verify at 1920×1080

### Key Points Card variant:
```html
<div class="scene-content" id="sX-content">
  <span class="badge">行业动态</span>
  <h2 class="headline">[title]</h2>
  <div class="key-points">
    <div class="kp-item" id="sX-kp1">
      <span class="kp-num">1</span>
      <span class="kp-text">[Point 1: core fact]</span>
    </div>
    <div class="kp-item" id="sX-kp2">
      <span class="kp-num">2</span>
      <span class="kp-text">[Point 2: key data]</span>
    </div>
    <div class="kp-item" id="sX-kp3">
      <span class="kp-num">3</span>
      <span class="kp-text">[Point 3: significance]</span>
    </div>
  </div>
</div>
```

### Phase 9: Animation

1. Entrance via `gsap.from()` — FROM hidden TO CSS position
2. At least 3 eases per scene (`power3.out`, `expo.out`, `back.out(1.7)`)
3. Ambient `.deco-glow` scale over full scene duration
4. Stagger elements 0.1-0.2s apart
5. Hard kill: `tl.set("#sX", { opacity: 0 }, sceneEnd)`

**Rules:**
- Timelines `{ paused: true }`
- Register `window.__timelines["main"] = tl`
- No `repeat: -1`
- No async timeline building

### Key Points Card animation (add to standard scene timeline):

```javascript
// Each key point slides in as narrator reads it
// Use SRT timestamps to align the stagger:
tl.from("#sX-kp1", { x: -30, opacity: 0, duration: 0.5, ease: "power2.out" }, srtStartOfKP1);
tl.from("#sX-kp2", { x: -30, opacity: 0, duration: 0.5, ease: "power2.out" }, srtStartOfKP2);
tl.from("#sX-kp3", { x: -30, opacity: 0, duration: 0.5, ease: "power2.out" }, srtStartOfKP3);
```

### Phase 10: Scene Transitions

Every multi-scene composition MUST have transitions — no jump cuts.

| Cut | Type | Duration |
|-----|------|----------|
| Title → News 1 | Crossfade | 0.4s |
| News → News | Crossfade | 0.35s |
| Last news → Closing | Fade to dark | 0.6s |

The transition IS the exit. Do not add separate exit tweens before a transition.

### Phase 11: Karaoke Captions

Build `compositions/caption-overlay.html` on **track 2**. Full spec: [caption-karaoke.md](caption-karaoke.md).

- Medium-high energy karaoke
- SRT-driven word highlighting
- Emphasis on brands/numbers
- Hard kill + self-lint per group
- No opaque subtitle bars

### Phase 12: Audio

```html
<audio id="narration" class="clip" data-track-index="3"
       data-start="0" data-duration="TOTAL" data-volume="1.0"
       src="assets/narration.mp3"></audio>
```

Optional background music at 0.15-0.3 volume on track 4.

### Phase 13: Validation

```bash
npx hyperframes lint
npx hyperframes validate
npx hyperframes inspect --samples 10
```

**Checklist:**
- [ ] `design.md` matches rendered colors
- [ ] `key-points.md` exists with 3 points filled per article
- [ ] `expanded-prompt.md` exists with 3KP scene assignments
- [ ] Scene types vary (Key Points Card, Stat Card, Headline Card)
- [ ] 3 key points per news scene staggered by SRT timing
- [ ] No jump cuts
- [ ] Karaoke captions synced, self-lint passes
- [ ] Text fits, contrast >= 4.5:1
- [ ] Hard kills on scenes + caption groups
- [ ] `window.__timelines` registered

### Phase 14: Render

```bash
npx hyperframes render --output ai-news-june-8.mp4
```

## Quality Checks

### Style Consistency
- Reuse same `design.md` across daily videos — only content changes
- Glow hue rotates per scene but palette stays fixed
- Same badge/headline/key-points CSS classes every video

### 3 Key Points Quality
- Each point is distinct (not overlapping with another)
- Point 1 answers "what happened", Point 2 answers "what data supports this", Point 3 answers "why does this matter"
- Each point fits on one subtitle line (~25 chars max for 32px font)
- Points are ordered by information flow, not shuffled

### Text Overflow
- `window.__hyperframes.fitTextFontSize()` for long headlines
- Key points use 28-32px font to fit 3 on screen
- Test with the longest headline + key point combination

### Caption Quality
- Words highlight in sync with narration
- Captions don't cover headline or key points text (inspect at t=mid-scene)
- No ghost captions after group.end

### Animation Choreography
- No dead zones >1s without motion
- Stagger 80-150ms between related elements
- Key point entries are timed to match SRT boundaries — not evenly spaced
- Transition timing doesn't clip readable content

## Content Refresh Workflow

1. Re-fetch: `node scripts/fetch-news.mjs --size 10 --output .hyperframes/latest-news.md`
2. Re-fetch detail: `node scripts/fetch-detail.mjs --ids NEW_IDS --output .hyperframes/article-details.md`
3. Regenerate key points: `node scripts/extract-key-points.mjs --input .hyperframes/article-details.md --output .hyperframes/key-points.md --script`
4. Fill 3 key points in `key-points.md`
5. Update script + expanded-prompt (keep `design.md` unchanged)
6. Regenerate TTS + SRT
7. Update scene content and caption groups in HTML
8. Render: `npx hyperframes render --output ai-news-new.mp4`
