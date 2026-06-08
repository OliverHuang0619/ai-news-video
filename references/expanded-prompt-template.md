# Expanded Prompt Template

**Mandatory** before writing composition HTML (skip only for single-scene edits).

Write output to `.hyperframes/expanded-prompt.md` in the project.

## Template

```markdown
# Expanded Prompt — AI 资讯速递 [DATE]

## Identity
- Source: design.md (or design-template.md defaults)
- Rhythm: hook – 快讯×N – 收尾
- Total target duration: ~Xs (from SRT)

## Palette (from design.md — do not change)
- Background: #0a0a1a
- Accent: #00d4ff / #7c3aed
- Caption active: #00d4ff

## Scene Map

### S1 — Title Card (~Xs)
- **Type:** Title Card
- **Mood:** Settle in, establish channel
- **Layers:** deco-grid (drift) → cyan glow → title + date
- **Verbs:** title slide-up power3.out, date fade power2.out
- **Transition out:** crossfade 0.4s → S2

### S2 — [News headline 1] (~Xs)
- **Type:** Headline + Summary | Stat Card (pick one — see news-video-patterns.md)
- **Category badge:** [行业动态 / 融资 / 产品发布 / ...]
- **Glow hue:** cyan
- **Emphasis spans:** [brand names, numbers]
- **Layers:** deco-grid → glow → badge pop → headline → summary
- **Verbs:** back.out badge, power3.out headline, power2.out summary
- **Transition out:** slide left 0.5s expo.inOut → S3

### S3 — [News headline 2] (~Xs)
- **Type:** ...
- **Glow hue:** purple
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
- Emphasis: [list brand names and stats from script]

## Transition Choreography
| Cut | Type | Duration |
|-----|------|----------|
| S1→S2 | crossfade | 0.4s |
| S2→S3 … | slide left | 0.5s |
| S(N-1)→SN | fade to dark | 0.6s |
```

## Scene Type Selection

Read [news-video-patterns.md](news-video-patterns.md). Pick per item:

| Content signal | Scene type | Hero element |
|----------------|------------|--------------|
| Has key number (融资, %, 参数量) | Number/Stat Card | 140px stat + label |
| Product launch / partnership | Headline + Summary | badge + headline + summary |
| Policy / industry trend | Headline Card | 72px headline only |
| Opening | Title Card | channel + date + title |
| Ending | Closing Card | CTA + channel name |

Do not use the same scene type for every news item — vary between Headline+Summary and Stat Card when data allows.
