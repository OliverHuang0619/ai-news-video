# Expanded Prompt Template

**Mandatory** before writing any React components (skip only for single-scene edits).

Write output to `.hyperframes/expanded-prompt.md` in the project.

Read:
- `design.md` (or design-template.md defaults)
- `key-points.md` (the 3 key points per article)
- [news-video-patterns.md](news-video-patterns.md) — pick scene type per news item
- [workflow.md](workflow.md)

## Template

```markdown
# Expanded Prompt — AI 资讯速递 [DATE]

## Identity
- Source: design.md (or design-template.md defaults)
- Rhythm: hook – 快讯×N (varied scene types) – 收尾
- Total target duration: ~Xs (from SRT)

## Palette (from design.md — do not change)
- Background: #0a0a1a
- Accent: #00d4ff / #7c3aed
- Caption active: #00d4ff

## Key Points Data (from key-points.md)

### [News 1 — headline]
- KP1 (Core Fact): [extracted point]
- KP2 (Key Data): [extracted point]
- KP3 (Significance): [extracted point]
- Video scene: [scene type — see selection guide below]
- Key animation timings (from SRT):
  - Scene start frame: [frame number]
  - Scene duration: [frames]
  - KP1 entry frame: [frame]
  - KP2 entry frame: [frame]
  - KP3 entry frame: [frame]

### [News 2 — headline]
- KP1: ...
- KP2: ...
- KP3: ...
- Video scene: ...
- Animation timings: ...

(repeat for each news item)

## Scene Map

### S1 — Title Card (~Xs)
- **Type:** Title Card
- **Mood:** Settle in, establish channel
- **Layers:** bg fill → cyan glow → title + date
- **Animations:** title slide-up via interpolate, date fade
- **Duration:** [frames] (from SRT)

### S2 — [News headline 1] (~Xs)
- **Type:** [Key Points Card | Data Dashboard Card | Comparison Card | Quote Card | Timeline Card]
- **Category badge:** [行业动态 / 行业数据 / 行业声音 / 趋势预测 / 政策法规 ...]
- **Badge icon class:** [icon-data / icon-product / icon-policy / icon-quote / icon-research]
- **Glow hue:** [cyan / purple / blue / green / amber / rose]
- **Start frame:** [frame] — **Duration:** [frames]
- **Animations (Remotion interpolate/spring):**
  - Badge: spring pop-in at frame [f]
  - Headline: interpolate slide-up at frame [f] → [f+20]
  - KP1: slide-in at frame [kp1_frame] → [kp1_frame+15]
  - KP2: slide-in at frame [kp2_frame] → [kp2_frame+15]
  - KP3: slide-in at frame [kp3_frame] → [kp3_frame+15]
- **Emphasis spans:** [brand names, numbers from key points]
- **Scene entrance:** opacity fade-in over 10 frames

### S3 — [News headline 2] (~Xs)
- **Type:** ... (vary from previous scene)
- **Glow hue:** purple
- **Start frame:** [frame] — **Duration:** [frames]
- ...

(repeat for each news item)

### SN — Closing (~Xs)
- **Type:** Closing Card
- **Mood:** Warm sign-off
- **Start frame:** [frame] — **Duration:** [frames]
- **Animations:** site URL fade, Remotion gradient text
- **On-screen content:** `aixiaoerke.com` (closing card URL text)
- **TTS script:** `可访问AI小儿科` (spoken brand; captions auto-map to domain)

## Caption Plan
- Component: CaptionOverlay (reads captions-data.json)
- Group size: 4-8 Chinese chars per karaoke group
- Emphasis: [list brand names and stats from key points]

## Scene Timing Table (from SRT)

| Scene | Start (s) | End (s) | Start Frame | Duration Frames |
|-------|-----------|---------|-------------|-----------------|
| S1 | 0.0 | 5.2 | 0 | 156 |
| S2 | 5.2 | 22.1 | 156 | 507 |
| S3 | 22.1 | 39.8 | 663 | 531 |
| ... | ... | ... | ... | ... |
| Closing | ... | ... | ... | ... |
```

## Scene Type Selection

Read [news-video-patterns.md](news-video-patterns.md). Pick per item:

| Content signal | Scene type | Hero element |
|----------------|------------|--------------|
| One key number (融资, %, 参数量) | Number/Stat Card | 96px stat + label |
| 2-3 metrics or percentages | Data Dashboard Card | animated counter + ratio bars |
| Notable direct quote | Quote Card | quote block with attribution |
| Before/after, comparison | Comparison Card | dual progress bars |
| Multi-year trend / prediction | Timeline Card | vertical timeline with markers |
| Product launch / partnership | Key Points Card (default) | headline + 3 animated bullets |
| Policy / trend | Key Points Card | headline + 3 KPs |
| Opening | Title Card | channel + date + title |
| Ending | Closing Card | CTA + site URL + channel name |

**Vary scene types across items.** Use at least one Data Dashboard or Comparison card per video.
