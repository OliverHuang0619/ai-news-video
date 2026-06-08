# AI News Video — Workflow Guide

## End-to-End Process

### Phase 1: Content Sourcing

1. Run `node scripts/fetch-news.mjs --size 10 --output .hyperframes/latest-news.md`
2. Read the output and select 3-10 articles for the video
3. For each selected article, extract: title, category, and a concise summary sentence
4. Write a narration script in natural spoken Chinese

**API Details:** See [site-api.md](site-api.md) for endpoint documentation.

### Phase 2: Script Generation

Take the selected news and write a narration script in `.hyperframes/script.txt`:

```
[OPENING] 大家好，今天是6月8日，欢迎收看AI资讯速递。
[NEWS 1] 首先，NBA中国联手阿里巴巴推出了首个官方大模型"NBA Chat"…
[NEWS 2] 另一条重要消息，中国将首发公有云大模型Token性能榜…
[NEWS 3] …
[CLOSING] 以上就是今天的AI资讯，感谢收看，我们下期再见！
```

List brand names and numbers in `.hyperframes/emphasis.txt` for caption styling.

### Phase 3: Design System

<HARD-GATE>
Before writing any HTML, `design.md` must exist in the project root.
</HARD-GATE>

1. **If `design.md` exists** — extract exact hex codes, fonts, and mood
2. **If not** — copy [design-template.md](design-template.md) to project root as `design.md`

Do not invent colors at render time. Reuse `design.md` across content refreshes for visual consistency.

### Phase 4: Prompt Expansion (Mandatory)

Write `.hyperframes/expanded-prompt.md` using [expanded-prompt-template.md](expanded-prompt-template.md).

Read:
- `design.md`
- [news-video-patterns.md](news-video-patterns.md) — assign scene type per news item
- This file

Include: rhythm declaration, per-scene beats (type, mood, layers, verbs), transition choreography, caption plan.

**Skip only** for single-scene compositions or trivial edits.

### Phase 5: TTS + SRT

```bash
pip install edge-tts

edge-tts --voice zh-CN-YunxiNeural -f .hyperframes/script.txt \
  --write-media assets/narration.mp3 \
  --write-subtitles assets/narration.srt
```

Parse SRT for:
- **Scene timing** — group entries by script paragraph
- **Caption groups** — see [caption-karaoke.md](caption-karaoke.md)

Optional higher-quality word timestamps:

```bash
npx hyperframes transcribe assets/narration.mp3 --output assets/captions.json --language zh
```

### Phase 6: Structure & Rhythm Planning

1. **Scene count:** title + N news + closing
2. **Scene types:** vary layout — Stat Card for data news, Headline+Summary for launches (see news-video-patterns.md)
3. **Tempo:** `hook – 快讯×N – 收尾`
4. **Duration:** from SRT grouping (title ~7s, news 5-9s each, closing ~5s)

### Phase 7: Layout Before Animation

For every scene:

1. Identify the hero frame
2. Write static CSS — `.scene-content` fills scene with flex + padding
3. Three depth layers: `.deco-grid` → `.deco-glow` → content
4. Verify at 1920×1080

### Phase 8: Animation

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

### Phase 9: Scene Transitions

Every multi-scene composition MUST have transitions — no jump cuts.

| Cut | Type | Duration |
|-----|------|----------|
| Title → News 1 | Crossfade | 0.4s |
| News → News | Slide left | 0.5s |
| Last news → Closing | Fade to dark | 0.6s |

The transition IS the exit. Do not add separate exit tweens before a transition.

### Phase 10: Karaoke Captions

Build `compositions/caption-overlay.html` on **track 2**. Full spec: [caption-karaoke.md](caption-karaoke.md).

- Medium-high energy karaoke
- SRT-driven word highlighting
- Emphasis on brands/numbers
- Hard kill + self-lint per group
- No opaque subtitle bars

### Phase 11: Audio

```html
<audio id="narration" class="clip" data-track-index="3"
       data-start="0" data-duration="TOTAL" data-volume="1.0"
       src="assets/narration.mp3"></audio>
```

Optional background music at 0.15-0.3 volume on track 4.

### Phase 12: Validation

```bash
npx hyperframes lint
npx hyperframes validate
npx hyperframes inspect --samples 10
```

**Checklist:**
- [ ] `design.md` matches rendered colors
- [ ] `expanded-prompt.md` exists
- [ ] Scene types vary across news items
- [ ] No jump cuts
- [ ] Karaoke captions synced, self-lint passes
- [ ] Text fits, contrast >= 4.5:1
- [ ] Hard kills on scenes + caption groups
- [ ] `window.__timelines` registered

### Phase 13: Render

```bash
npx hyperframes render --output ai-news-june-8.mp4
```

## Quality Checks

### Style Consistency
- Reuse same `design.md` across daily videos — only content changes
- Glow hue rotates per scene but palette stays fixed
- Same badge/headline/summary CSS classes every video

### Text Overflow
- `window.__hyperframes.fitTextFontSize()` for long headlines
- Test with longest possible headline from the batch

### Caption Quality
- Words highlight in sync with narration
- Captions don't cover headline text (inspect at t=mid-scene)
- No ghost captions after group.end

### Animation Choreography
- No dead zones >1s without motion
- Stagger 80-150ms between related elements
- Transition timing doesn't clip readable content

## Content Refresh Workflow

1. Re-fetch: `node scripts/fetch-news.mjs --size 10 --output .hyperframes/latest-news.md`
2. Update script + expanded-prompt (keep `design.md` unchanged)
3. Regenerate TTS + SRT
4. Update scene content and caption groups in HTML
5. Render: `npx hyperframes render --output ai-news-new.mp4`
