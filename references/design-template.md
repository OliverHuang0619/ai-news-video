# AI 资讯速递 — Design Template

Copy this file to the project root as `design.md` before building any composition. All colors, fonts, and motion choices MUST come from here — do not invent values at render time.

## Channel Identity

- **Name:** AI 资讯速递
- **Mood:** Dark tech, energetic, trustworthy
- **Audience:** Chinese-speaking AI industry followers
- **Platform:** 1920×1080 landscape, social + short-form

## Palette

| Role | Hex | Usage |
|------|-----|-------|
| Background | `#0a0a1a` | Full canvas |
| Background alt | `#12122a` | Subtle gradient stops |
| Primary text | `#ffffff` | Headlines, active caption words |
| Summary text | `#b0b0cc` | Body copy, inactive caption words |
| Accent (cyan) | `#00d4ff` | Numbers, brand names, active karaoke, counter index |
| Accent (purple) | `#7c3aed` | Badges, progress bar end, secondary glow |
| Surface | `rgba(255,255,255,0.05)` | Badge backgrounds |
| Caption shadow | `rgba(0,0,0,0.8)` | `text-shadow` on subtitles (no opaque bar) |

**Glow rotation per news scene (cycle in order):** cyan → purple → blue (`#3b82f6`) → green (`#10b981`) → amber (`#f59e0b`) → rose (`#f43f5e`)

## Typography

- **Font stack:** `sans-serif` only (PingFang SC / Microsoft YaHei — no Google Fonts CDN)
- **Title card:** 72px, weight 800
- **Headline:** 56px, weight 700, max 2 lines
- **Summary:** 32px, weight 400
- **Stat number:** 140px, weight 800, accent cyan
- **Badge:** 14px, weight 600, uppercase tracking
- **Counter:** 14px — `"快讯 "` muted + index in cyan
- **Caption:** 32px, weight 600

Use `window.__hyperframes.fitTextFontSize()` when headlines exceed 2 lines.

## Scene Background (Non-Negotiable)

HyperFrames headless render defaults to a **white canvas**. `body { background: #0a0a1a }` alone is not enough.

```css
.scene {
  background: #0a0a1a; /* required on every scene clip */
}
```

Without this, white headline text (`#ffffff`) becomes invisible.

## Scene Skeleton (fixed across all videos)

Every video uses the same structural template. Only content and glow hue change.

| Scene | Type | Fixed elements |
|-------|------|----------------|
| S1 | Title Card | channel name, date, hero title, `.deco-glow` |
| S2–SN | News item | counter, badge, headline, summary OR stat, `.deco-glow`, `.deco-grid` |
| SN+1 | Closing | CTA, channel name, fade to dark |

**Depth layers (every scene):**
1. Background: `.deco-grid` or `.deco-dots` (slow drift)
2. Mid: `.deco-glow` (radial gradient, scene-specific hue)
3. Foreground: content stack (badge → headline → summary/stat)

## Motion Character

| Verb | Ease | Element |
|------|------|---------|
| Pop-in | `back.out(1.7)` | Badge |
| Slide-up | `power3.out` | Headline |
| Subtle rise | `power2.out` | Summary |
| Dramatic | `expo.out` | Stat number |
| Scene enter | `opacity 0→1`, 0.1s | Whole scene |
| Scene exit | `power2.in`, 0.3s | Starts 0.3s before scene end |
| Ambient | `none` | `.deco-glow` scale 1→1.05 over scene duration |
| Progress | `none` | `.progress-fill` scaleX 0→1 over total duration |

**Hard kill:** `tl.set("#sX", { opacity: 0 }, sceneEnd)` after every scene exit tween.

## Transitions (mandatory — no jump cuts)

| From → To | Type | Duration | Ease |
|-----------|------|----------|------|
| Title → News 1 | Crossfade | 0.4s | `power2.inOut` |
| News N → News N+1 | Slide left | 0.5s | `expo.inOut` |
| Last news → Closing | Fade to dark | 0.6s | `power2.in` |

Animate every element IN via `gsap.from()`. The transition IS the exit — do not add separate exit tweens before a transition (except closing scene).

## Rhythm Template

Default pattern for 10-item briefing:

```
hook(标题) – 快讯×10 – 收尾
```

Declare tempo in `.hyperframes/expanded-prompt.md` before building HTML.

## Emphasis Rules

Wrap in `<span class="accent">` (color `#00d4ff`, weight 700):
- Brand / product names (OpenAI, 千问, etc.)
- Numbers and statistics (融资额, 参数量, 百分比)
- Key action verbs when space allows

Stat-heavy news → use **Number/Stat Card** layout (see [news-video-patterns.md](news-video-patterns.md)).

## Caption Style (karaoke overlay)

- Energy level: **medium-high** (news broadcast)
- Position: bottom 100px, full-width centered container
- Active word: `#00d4ff`, scale 1.08
- Read words: opacity 0.5
- Unread words: opacity 0.3
- Semi-transparent dark bar: `background: rgba(0,0,0,0.72)` + `text-shadow`
- Caption opacity: `1` when visible (not `0.5` — washes out on any light bleed)
- Full spec: [caption-karaoke.md](caption-karaoke.md)

## Tracks

| Track | Content |
|-------|---------|
| 0 | Progress bar |
| 1 | Scene clips (title + news + closing) |
| 2 | Caption overlay sub-composition |
| 3 | Narration audio |
