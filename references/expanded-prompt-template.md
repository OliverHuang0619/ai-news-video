# Expanded Prompt Template

**Mandatory** before writing composition HTML (skip only for single-scene edits).

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

### [News 2 — headline]
- KP1: ...
- KP2: ...
- KP3: ...
- Video scene: ...

(repeat for each news item)

## Scene Map

### S1 — Title Card (~Xs)
- **Type:** Title Card
- **Mood:** Settle in, establish channel
- **Layers:** deco-grid (drift) → cyan glow → title + date
- **Verbs:** title slide-up power3.out, date fade power2.out
- **Transition out:** crossfade 0.4s → S2

### S2 — [News headline 1] (~Xs)
- **Type:** [Key Points Card | Data Dashboard Card | Comparison Card | Quote Card | Timeline Card | Stat Card]
- **Category badge:** [行业动态 / 行业数据 / 行业声音 / 趋势预测 / 政策法规 ...]
- **Badge icon class:** [icon-data / icon-product / icon-policy / icon-quote / icon-research]
- **Glow hue:** [cyan / purple / blue / green / amber / rose]
- **Rich elements:**
  - [e.g., Hero counter at SRT[t1], ratio bar at SRT[t2]]
  - [e.g., Comparison bars: left at SRT[t1], right at SRT[t2]]
  - [e.g., Quote text fades at SRT[t1], attribution at SRT[t2]]
  - [e.g., Timeline items staggered 0.3s apart from SRT[t1]]
  - [e.g., 3 KPs: KP1 at SRT[t1], KP2 at SRT[t2], KP3 at SRT[t3]]
- **Emphasis spans:** [brand names, numbers from key points]
- **Layers:** deco-grid → glow → badge pop → headline → rich elements
- **Verbs:** back.out badge, power3.out headline, [specific verbs for rich elements]
- **Transition out:** crossfade 0.35s → S3

### S3 — [News headline 2] (~Xs)
- **Type:** ... (vary from previous scene)
- **Glow hue:** purple
- **Rich elements:** ...
- ...

(repeat for each news item)

### SN — Closing (~Xs)
- **Type:** Closing Card
- **Mood:** Warm sign-off
- **Transition in:** fade from dark 0.6s
- **Verbs:** site URL fade, CTA fade, logo scale
- **On-screen content:** `aixiaoerke.com` (closing card URL text)
- **TTS script:** `可访问AI小儿科` (spoken brand; captions auto-map to domain)

## Caption Plan
- Overlay: karaoke (natural pacing) on track 2
- Group size: 3–5 words / ~4–6 Chinese chars
- Emphasis: [list brand names and stats from key points]

## Transition Choreography
| Cut | Type | Duration |
|-----|------|----------|
| S1→S2 | crossfade | 0.4s |
| S2→S3 … | crossfade | 0.35s |
| S(N-1)→SN | fade to dark | 0.6s |
```

## Scene Type Selection

Read [news-video-patterns.md](news-video-patterns.md). Pick per item:

| Content signal | Scene type | Hero element | Icon class |
|----------------|------------|--------------|------------|
| One key number (融资, %, 参数量) | Number/Stat Card | 140px stat + label | — |
| 2-3 metrics or percentages | Data Dashboard Card | animated counter + ratio bars | `icon-data` |
| Notable direct quote | Quote Card | quote block with attribution | `icon-quote` |
| Before/after, comparison | Comparison Card | dual progress bars | `icon-data` |
| Multi-year trend / prediction | Timeline Card | vertical timeline with markers | `icon-research` |
| Product launch / partnership | Key Points Card (default) | headline + 3 animated bullets | `icon-product` |
| Policy / trend | Key Points Card | headline + 3 KPs | `icon-policy` |
| Opening | Title Card | channel + date + title | — |
| Ending | Closing Card | CTA + site URL + channel name | — |

**Vary scene types across items.** Use at least one Data Dashboard or Comparison card per video. Do not use Key Points Card for every item.
