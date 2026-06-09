# AI News Video — Workflow Guide (Remotion)

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
   | KP2 | Key Data / Impact | Specific numbers, percentages (15-25 chars) |
   | KP3 | Industry Significance | Why it matters — trends, future (15-25 chars) |

4. Fill the 3 key points directly into `key-points.md` under each article's "关键信息提炼" section.

### Phase 3: Script Generation

Write a narration script in `.hyperframes/script.txt`.

```
[OPENING] 大家好，今天是6月8日，欢迎收看AI资讯速递。

[NEWS 1]
[Point 1] [Point 2] [Point 3]

[NEWS 2]
[Point 1] [Point 2] [Point 3]

...

[CLOSING] 以上就是今天的AI资讯，感谢收看！可访问AI小儿科，我们下期再见！
```

**Brand naming split (mandatory):**
- **TTS / `script.txt`:** closing uses **「可访问AI小儿科」**
- **On-screen & captions:** `aixiaoerke.com` (auto-mapped by `srt-to-captions.mjs`)

### Phase 4: Design System

<HARD-GATE>
Before writing any code, `design.md` must exist.
</HARD-GATE>

1. **If `design.md` exists** — extract exact hex codes, fonts
2. **If not** — copy [design-template.md](design-template.md) to project root as `design.md`

### Phase 5: Prompt Expansion (Mandatory)

Write `.hyperframes/expanded-prompt.md` using [expanded-prompt-template.md](expanded-prompt-template.md).

Read:
- `design.md`
- `key-points.md`
- [news-video-patterns.md](news-video-patterns.md) — assign scene types
- This file

Include: rhythm declaration, per-scene beats (type, mood, layers, verbs), caption plan.

### Phase 6: TTS + SRT

```bash
pip install edge-tts

edge-tts --voice zh-CN-YunxiNeural -f .hyperframes/script.txt \
  --write-media assets/narration.mp3 \
  --write-subtitles assets/narration.srt
```

Parse SRT to caption data:

```bash
node scripts/srt-to-captions.mjs assets/narration.srt assets/captions-data.json
```

Extract scene timings from SRT grouping (group by paragraph for title, each news item, closing).

### Phase 7: Scene Data

From the expanded prompt and SRT timings, populate `src/sceneData.ts`:

| Scene | Type | Duration (frames) | Content |
|-------|------|-------------------|---------|
| S1 | title | 150 (5s) | Channel name, date |
| S2 | news | 480 (16s) | Badge, headline, 3 KPs |
| S3 | news | 420 (14s) | Badge, headline, 3 KPs |
| ... | ... | ... | ... |
| SN | closing | 150 (5s) | CTA, site URL |

Calculate start frames cumulatively: `S2 start = S1 start + S1 duration`, etc.

### Phase 8: Scene Components

Write Remotion components for each scene type. The main types:

1. **TitleScene** — channel name + date + decorative glow
2. **NewsScene** — badge → headline → 3 animated key point items
3. **ClosingScene** — "Made with Remotion" + site URL + fade

Each scene uses `useCurrentFrame()` with `interpolate()` and `spring()` for animation.

### Phase 9: Caption Overlay

The `CaptionOverlay` component reads `captions-data.json` and renders karaoke captions:

- Finds the active caption group by `frame / fps` matching group start/end
- Per-word highlighting (active: accent + scale, read: 0.5 opacity, unread: 0.35 opacity)
- Emphasis words (digits) get accent color

### Phase 10: Audio

```tsx
<audio src="/assets/narration.mp3" />
```

Add inside the main composition's root `<Sequence>`.

### Phase 11: Render

```bash
npx remotion render NewsVideo output.mp4
```

### Phase 12: Validation

Check the output video for:

- [ ] All scenes visible and correctly timed
- [ ] Captions synced to narration
- [ ] No white flashes or jump cuts
- [ ] Text fits within 1920×1080
- [ ] Audio plays correctly
- [ ] Design matches `design.md` colors

## Content Refresh Workflow

1. Re-fetch news: `node scripts/fetch-news.mjs --size 10 --output .hyperframes/latest-news.md`
2. Re-fetch detail: `node scripts/fetch-detail.mjs --ids NEW_IDS --output .hyperframes/article-details.md`
3. Regenerate key points: `node scripts/extract-key-points.mjs --input .hyperframes/article-details.md --output .hyperframes/key-points.md --script`
4. Fill 3 key points in `key-points.md`
5. Update script + expanded-prompt (keep `design.md` unchanged)
6. Regenerate TTS + SRT
7. Rebuild caption data: `node scripts/srt-to-captions.mjs assets/narration.srt assets/captions-data.json`
8. Update scene data in `src/sceneData.ts`
9. Render: `npx remotion render NewsVideo ai-news-new.mp4`
