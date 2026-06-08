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
- Rhythm: hook – 快讯×N (each with 3 key points) – 收尾
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
- Video scene: Key Points Card | Stat Card | Headline+Summary (pick one)

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
- **Type:** Key Points Card (default) | Headline+Summary | Stat Card
- **Category badge:** [行业动态 / 融资 / 产品发布 / ...]
- **Glow hue:** cyan
- **3 Key Points animation:** KP1 slide-in at SRT[t1], KP2 at SRT[t2], KP3 at SRT[t3]
- **Emphasis spans:** [brand names, numbers from key points]
- **Layers:** deco-grid → glow → badge pop → headline → KP1 → KP2 → KP3
- **Verbs:** back.out badge, power3.out headline, power2.out each KP (stagger by SRT)
- **Transition out:** crossfade 0.35s → S3

### S3 — [News headline 2] (~Xs)
- **Type:** ... (Key Points Card or Stat Card)
- **Glow hue:** purple
- **3 Key Points:** KP1 at SRT[t1], KP2 at SRT[t2], KP3 at SRT[t3]
- ...

(repeat for each news item)

### SN — Closing (~Xs)
- **Type:** Closing Card
- **Mood:** Warm sign-off
- **Transition in:** fade from dark 0.6s
- **Verbs:** CTA fade, logo scale

## Caption Plan
- Overlay: karaoke medium-high on track 2
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

| Content signal | Scene type | Hero element |
|----------------|------------|--------------|
| Has key number (融资, %, 参数量) | Number/Stat Card | 140px stat + label |
| Product launch / partnership | Key Points Card (default) | headline + 3 animated bullets |
| Policy / industry trend | Key Points Card | headline + 3 KPs |
| Opening | Title Card | channel + date + title |
| Ending | Closing Card | CTA + channel name |

**Use Key Points Card as default for most news items.** Switch to Stat Card only when a single number dominates the article. Vary scene types across items — at least one Stat Card if data allows.
