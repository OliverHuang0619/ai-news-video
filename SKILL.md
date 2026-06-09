---
name: ai-news-video
description: "Use when asked to turn aixiaoerke.com AI news into short Remotion videos, daily or weekly AI news briefings, narrated video summaries from news headlines."
---

# AI News Video

Turn AI news articles from aixiaoerke.com into short news briefings using **Remotion** (React-based video framework). The default style is clear and credible: natural narration, well-structured key points, and motion/captions that support understanding.

## Quick Start

1. **Fetch news:** `node scripts/fetch-news.mjs --size 10`
2. **Fetch detail for selected articles:** `node scripts/fetch-detail.mjs --ids ID,ID,ID --output .hyperframes/article-details.md`
3. **Extract 3 key points per article:** read `.hyperframes/article-details.md`, analyze each article's full content, and fill in the 3 key points (see [Phase 1.5](#15-content-deep-view--key-points-extraction))
4. **Write a narration script:** each news item covers its 3 key points
5. **Establish design:** copy [design-template.md](references/design-template.md) → `design.md`
6. **Expand prompt:** write `.hyperframes/expanded-prompt.md` (see [expanded-prompt-template.md](references/expanded-prompt-template.md))
7. **Generate audio** using `edge-tts` with `zh-CN-YunyangNeural`
8. **Parse SRT** for caption timing data: `node scripts/srt-to-captions.mjs assets/narration.srt assets/captions-data.json`
9. **Scaffold Remotion project** (see [Build Composition](#6-build-composition))
10. **Render:** `npx remotion render NewsVideo output.mp4`
11. **Validate:** Check output video for visual quality, text fit, and timing accuracy

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

**Tone target:** clear tech commentator, natural and credible. Every item should cover: "what happened, why it matters, what changes next?" Use straightforward sentences, supporting data, and logical flow. Avoid hype or invented drama.

**Narration pace:** edge-tts `zh-CN-YunyangNeural` at `--rate=+5%` speaks with clear, natural pacing. With 3 key points per news item, each paragraph should be **45-70 chars** (12-18 seconds): fast enough to feel urgent, still clear enough for karaoke captions.

**Script structure:**

```
[OPENING] AI圈又加速了！今天是6月8日，欢迎收看AI资讯速递。

[NEWS 1 title]
[Hook] [Point 1: core fact] [Point 2: key data] [Point 3: significance / what changes next]

[NEWS 2 title]
[Point 1] [Point 2] [Point 3]

...

[CLOSING] 这就是今天最值得盯住的AI动态。了解更多资讯可访问AI小儿科，我们下期继续追！
```

**TTS vs on-screen brand (fixed rule):** Closing narration in `script.txt` always says **「可访问AI小儿科」** — edge-tts pronounces the Chinese brand name cleanly. **Subtitles and scene HTML** always show **`aixiaoerke.com`** (closing card URL, CTA copy). `srt-to-captions.mjs` maps `AI小儿科` → `aixiaoerke.com` in caption text automatically; do not put the domain in `script.txt`.

| Layer | Closing site reference |
|-------|------------------------|
| `script.txt` / audio | `可访问AI小儿科` |
| SRT → captions | `aixiaoerke.com` (auto-mapped) |
| Closing scene HTML | `aixiaoerke.com` |

**Natural 3-point example:**
> NBA中国直接把AI带进赛场！NBA Chat由阿里千问驱动，融合历史数据和球员分析。更关键的是，体育娱乐正在变成大模型落地的新战场。

Mark emphasis words in a sidecar `.hyperframes/emphasis.txt` (brand names, numbers) for caption styling.

### 3. Design System

<HARD-GATE>
Before writing ANY code, establish visual identity. If you reach for ad-hoc colors or skip `design.md`, stop.
</HARD-GATE>

1. **If `design.md` exists** in the project root — use its exact hex codes, fonts, and motion rules
2. **If not** — copy [design-template.md](references/design-template.md) to `design.md` and customize channel name if needed

All scenes share the same visual skeleton (badge → headline → key points). Only content and glow hue rotate per scene.

### 4. Prompt Expansion (Mandatory)

Write `.hyperframes/expanded-prompt.md` before building any components. Use [expanded-prompt-template.md](references/expanded-prompt-template.md).

Read:
- `design.md`
- `key-points.md` (the filled key points per article)
- [news-video-patterns.md](references/news-video-patterns.md) — pick scene type per news item
- [workflow.md](references/workflow.md)

The expansion must include: rhythm declaration, per-scene type + mood + depth layers + animation verbs, transition choreography, caption plan. Each news scene must account for the 3 key points — either as animated bullet points or a key-points card.

**Skip only** for single-scene edits or trivial timing fixes.

### 5. Generate TTS Audio (edge-tts)

**edge-tts** uses Microsoft's online TTS service. Requires internet access.

**Recommended voice:** `zh-CN-YunyangNeural` (News, Professional) — clear, natural, no AI flavor

**Other Chinese voices:**
- `zh-CN-YunxiNeural` — Male, Novel, Lively/Sunshine; alternate when a slightly livelier tone is desired
- `zh-CN-YunyangNeural` — Male, News, Professional
- `zh-CN-XiaoxiaoNeural` — Female, News/Novel, Warm
- `zh-CN-XiaoyiNeural` — Female, Cartoon/Novel, Lively

```bash
pip install edge-tts

edge-tts --voice zh-CN-YunyangNeural --rate=+5% \
  -f .hyperframes/script.txt \
  --write-media assets/narration.mp3 \
  --write-subtitles assets/narration.srt

ffprobe -v quiet -show_entries format=duration -of csv=p=0 assets/narration.mp3
```

**Parse SRT for caption data (Remotion JSON format):**

```bash
node scripts/srt-to-captions.mjs assets/narration.srt assets/captions-data.json
```

This generates word-level karaoke data (each word with start/end times, grouped into phrases) for the Remotion caption overlay component.

**SRT parsing for scene timing (python):**

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

**Captions must be 1:1 with SRT** — never manually split or estimate timings. Scene `durationInFrames` and caption word timings all derive from SRT parsing.

### 6. Build Composition (Remotion)

#### 6.1 Scaffold Project

This skill uses **Remotion** (not HyperFrames) for video rendering. Create a Remotion project:

```bash
cd /path/to/project
npm init -y
npm install react react-dom remotion @remotion/cli typescript @types/react @types/node
```

Or use the template (skip Tailwind, pick Blank):
```bash
npx create-video@latest news-video
```

#### 6.2 Project Structure

```
ai-news-video/
├── package.json                  # remotion + react deps
├── tsconfig.json
├── src/
│   ├── index.ts                  # registerRoot
│   ├── Root.tsx                  # Composition registration
│   ├── styles.ts                 # Shared colors and constants (from design.md)
│   ├── types.ts                  # Shared TypeScript types
│   ├── parseCaptionData.ts       # Parse captions-data.json to typed objects
│   ├── TitleScene.tsx            # Opening title card component
│   ├── NewsScene.tsx             # News item with 3 key points
│   ├── ClosingScene.tsx          # Closing / CTA
│   └── CaptionOverlay.tsx        # Karaoke caption overlay component
├── assets/
│   ├── narration.mp3             # TTS audio from edge-tts
│   └── captions-data.json        # SRT → word-level caption data (from srt-to-captions.mjs)
├── design.md
└── .hyperframes/
    ├── script.txt
    ├── article-details.md
    ├── key-points.md
    └── expanded-prompt.md
```

#### 6.3 Entry Point & Composition Registration

**src/index.ts:**
```tsx
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
```

**src/Root.tsx:**
```tsx
import { Composition } from "remotion";
import { NewsVideo } from "./NewsVideo";

// Read from expanded-prompt and SRT for these values
const TOTAL_DURATION_IN_FRAMES = Math.ceil(82 * 30); // 82 seconds × 30fps
const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="NewsVideo"
      component={NewsVideo as React.FC<Record<string, unknown>>}
      durationInFrames={TOTAL_DURATION_IN_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
```

#### 6.4 Shared Styles

**src/styles.ts:**
```ts
// Design-system constants — match design.md exactly
export const COLORS = {
  bg: "#0a0a1a",
  surfaceLight: "rgba(255,255,255,0.08)",
  surfaceMed: "rgba(255,255,255,0.05)",
  primaryText: "#ffffff",
  summaryText: "#b0b0cc",
  accent: "#00d4ff",
  accentPurple: "#7c3aed",
  accentEmerald: "#10b981",
  accentAmber: "#f59e0b",
  accentRose: "#f43f5e",
  captionBg: "rgba(0,0,0,0.72)",
};

// Glow rotation per news scene (cycle in order)
export const GLOW_HUES = [
  "#00d4ff", "#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#f43f5e",
];
```

#### 6.5 Scene Components

Each scene is a React component that receives:
- `frame`: current frame number (from `useCurrentFrame()`)
- `fps`: frames per second
- Scene-specific content (headline, key points, badge text)
- Scene timing (start frame)

**TitleScene.tsx:**
```tsx
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";

const S = {
  root: { backgroundColor: "#0a0a1a" as const, justifyContent: "center" as const, alignItems: "center" as const },
  hero: { fontFamily: "sans-serif" as const, fontWeight: 800, fontSize: 72, color: "#ffffff", margin: 0, textAlign: "center" as const },
  sub: { fontFamily: "sans-serif" as const, fontWeight: 400, fontSize: 28, color: "#b0b0cc", marginTop: 24, textAlign: "center" as const },
};

export const TitleScene: React.FC<{ sceneStart: number }> = ({ sceneStart }) => {
  const frame = useCurrentFrame();
  const fps = 30;
  const localFrame = frame - sceneStart;

  const heroOpacity = interpolate(localFrame, [5, 25], [0, 1], { extrapolateLeft: "clamp" });
  const heroY = interpolate(localFrame, [5, 25], [40, 0], { extrapolateLeft: "clamp" });
  const subOpacity = interpolate(localFrame, [20, 40], [0, 1], { extrapolateLeft: "clamp" });
  const glowScale = spring({ frame: localFrame, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={S.root}>
      {/* Decorative glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(circle, rgba(0,212,255,0.10) 0%, transparent 60%)",
        transform: `scale(${0.9 + glowScale * 0.1}) opacity ${0.6 + glowScale * 0.4}`,
      }} />
      {/* Content */}
      <h1 style={{ ...S.hero, opacity: heroOpacity, transform: `translateY(${heroY}px)` }}>
        AI 资讯速递
      </h1>
      <p style={{ ...S.sub, opacity: subOpacity }}>
        今日AI动态速览
      </p>
    </AbsoluteFill>
  );
};
```

**NewsScene.tsx (Key Points Card — the main scene type):**
```tsx
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "./styles";

interface NewsSceneProps {
  sceneStart: number;
  badgeText: string;
  headline: string;
  keyPoints: string[];
  glowColor: string;
  // Optional: rich visual elements
  statValue?: string;
  statLabel?: string;
  ratioBarLabel?: string;
  ratioBarValue?: string;
  ratioBarWidth?: number;
}

const countIn = (f: number, s: number, d: number) =>
  interpolate(f, [s, s + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const slideIn = (f: number, s: number, d: number, dist = 30) => ({
  opacity: countIn(f, s, d),
  transform: `translateY(${interpolate(f, [s, s + d], [dist, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
});

export const NewsScene: React.FC<NewsSceneProps> = ({
  sceneStart, badgeText, headline, keyPoints, glowColor,
}) => {
  const frame = useCurrentFrame();
  const f = frame - sceneStart;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center", padding: "80px 120px" }}>
      {/* Glow */}
      <div style={{
        position: "absolute", bottom: "5%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, ${glowColor}15 0%, transparent 60%)`,
        filter: "blur(50px)",
      }} />
      {/* Badge */}
      <span style={{
        ...slideIn(f, 2, 15, 10),
        padding: "8px 20px", fontSize: 14, fontWeight: 700, borderRadius: 20,
        background: "rgba(255,255,255,0.08)", color: glowColor, letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}>
        {badgeText}
      </span>
      {/* Headline */}
      <h2 style={{
        fontFamily: "sans-serif", fontWeight: 700, fontSize: 48, color: COLORS.primaryText,
        margin: "16px 0 0 0", textAlign: "center", maxWidth: 1400,
        ...slideIn(f, 8, 20),
      }}>
        {headline}
      </h2>
      {/* Key Points (3 animated bullets) */}
      <div style={{ marginTop: 40, maxWidth: 1100, width: "100%" }}>
        {keyPoints.map((kp, i) => {
          const kpStart = 20 + i * 180; // ~6 seconds apart at 30fps
          return (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20,
              ...slideIn(f, kpStart, 16, 35),
            }}>
              <span style={{
                flexShrink: 0, width: 36, height: 36, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 700, color: glowColor,
                background: `${glowColor}20`,
              }}>
                {i + 1}
              </span>
              <span style={{
                fontFamily: "sans-serif", fontSize: 28, fontWeight: 400,
                lineHeight: 1.5, color: COLORS.primaryText, flex: 1,
              }}>
                {kp}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
```

**ClosingScene.tsx:**
```tsx
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "./styles";

export const ClosingScene: React.FC<{ sceneStart: number }> = ({ sceneStart }) => {
  const frame = useCurrentFrame();
  const f = frame - sceneStart;
  const opacity = interpolate(f, [0, 20, 80, 100], [0, 1, 1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{
      backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center",
      opacity,
    }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "sans-serif", fontWeight: 300, fontSize: 24, color: COLORS.summaryText, letterSpacing: "0.1em" }}>
          MADE WITH
        </p>
        <h1 style={{
          fontFamily: "sans-serif", fontWeight: 900, fontSize: 72,
          background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentPurple})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          margin: "16px 0",
        }}>
          Remotion
        </h1>
        <div style={{ width: 120, height: 2, background: COLORS.accent, margin: "24px auto", opacity: 0.6 }} />
        <p style={{ fontFamily: "sans-serif", fontSize: 28, fontWeight: 600, color: COLORS.accent }}>
          aixiaoerke.com
        </p>
      </div>
    </AbsoluteFill>
  );
};
```

#### 6.6 Data & Scene Timing

Pass parsed news data into the main composition. Use a data file or inline scene definitions derived from `key-points.md` and SRT timings.

**src/sceneData.ts (generated per video):**
```ts
export interface SceneData {
  type: "title" | "news" | "closing";
  startFrame: number;
  durationInFrames: number;
  badgeText?: string;
  headline?: string;
  keyPoints?: string[];
  glowColor?: string;
}

// Read from expanded-prompt.md and SRT parsing
// Each news scene uses ~12-20 seconds (360-600 frames at 30fps)
export const SCENES: SceneData[] = [
  {
    type: "title", startFrame: 0, durationInFrames: 150,
  },
  {
    type: "news", startFrame: 150, durationInFrames: 480,
    badgeText: "行业动态", headline: "NBA Chat 正式上线",
    keyPoints: [
      "NBA中国联手阿里推出首个官方大模型",
      "基于千问模型，融合历史数据与球员分析",
      "文体娱乐成AI大模型落地核心赛道",
    ],
    glowColor: "#00d4ff",
  },
  // ... more news scenes ...
  {
    type: "closing", startFrame: 2460, durationInFrames: 150,
  },
];
```

#### 6.7 Main Composition (NewsVideo.tsx)

```tsx
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { TitleScene } from "./TitleScene";
import { NewsScene } from "./NewsScene";
import { ClosingScene } from "./ClosingScene";
import { CaptionOverlay } from "./CaptionOverlay";
import { SCENES } from "./sceneData";

export const NewsVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Scene track */}
      {SCENES.map((scene) => {
        if (scene.type === "title") {
          return (
            <Sequence from={scene.startFrame} durationInFrames={scene.durationInFrames}>
              <TitleScene sceneStart={scene.startFrame} />
            </Sequence>
          );
        }
        if (scene.type === "news") {
          return (
            <Sequence from={scene.startFrame} durationInFrames={scene.durationInFrames}>
              <NewsScene
                sceneStart={scene.startFrame}
                badgeText={scene.badgeText!}
                headline={scene.headline!}
                keyPoints={scene.keyPoints!}
                glowColor={scene.glowColor!}
              />
            </Sequence>
          );
        }
        if (scene.type === "closing") {
          return (
            <Sequence from={scene.startFrame} durationInFrames={scene.durationInFrames}>
              <ClosingScene sceneStart={scene.startFrame} />
            </Sequence>
          );
        }
        return null;
      })}
      {/* Caption overlay — always visible */}
      <Sequence from={0} durationInFrames={SCENES[SCENES.length - 1].startFrame + SCENES[SCENES.length - 1].durationInFrames}>
        <CaptionOverlay />
      </Sequence>
      {/* Audio */}
      <Sequence from={0} durationInFrames={SCENES[SCENES.length - 1].startFrame + SCENES[SCENES.length - 1].durationInFrames}>
        <audio src="/assets/narration.mp3" />
      </Sequence>
    </AbsoluteFill>
  );
};
```

#### 6.8 Caption Overlay (Karaoke)

The caption overlay component reads the `captions-data.json` (generated by `srt-to-captions.mjs`) and renders karaoke-style subtitles synced to the narration.

**src/CaptionOverlay.tsx:**
```tsx
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import captionData from "../assets/captions-data.json";

interface CaptionWord {
  idx: number;
  start: number;
  end: number;
  text: string;
}

interface CaptionGroup {
  id: number;
  start: number;
  end: number;
  text: string;
  words: CaptionWord[];
}

const groups = captionData as CaptionGroup[];
const JSON_FPS = 30;

export const CaptionOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const time = frame / JSON_FPS;

  // Find active caption group
  const activeGroup = groups.find((g) => time >= g.start && time <= g.end);

  if (!activeGroup) return null;

  return (
    <div style={{
      position: "absolute", bottom: 80, left: 0, right: 0,
      pointerEvents: "none", zIndex: 20,
      display: "flex", justifyContent: "center",
    }}>
      <div style={{
        maxWidth: 1600, width: "90%", textAlign: "center",
        padding: "12px 28px",
        background: "rgba(0,0,0,0.72)",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        {activeGroup.words.map((word: CaptionWord) => {
          const isActive = time >= word.start && time <= word.end;
          const isRead = time > word.end;
          const opacity = isRead ? 0.5 : isActive ? 1 : 0.35;
          const color = isActive ? "#00d4ff" : "#e8e8f0";
          const scale = isActive ? 1.08 : 1;
          const isEmphasis = /[0-9]/.test(word.text);

          return (
            <span
              key={word.idx}
              style={{
                fontFamily: "sans-serif", fontSize: 32, fontWeight: 600,
                color, opacity,
                transform: `scale(${scale})`,
                display: "inline-block",
                transition: "opacity 0.05s, transform 0.05s",
                textShadow: isActive
                  ? "0 0 12px rgba(0,212,255,0.5), 0 2px 8px rgba(0,0,0,0.8)"
                  : "0 1px 4px rgba(0,0,0,0.9)",
                lineHeight: 1.5,
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
```

**Important:** The `captions-data.json` file must be imported in a TypeScript project. Add the following to `tsconfig.json` to allow JSON imports:
```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

#### 6.9 Audio

Remotion handles audio natively with the `<Audio>` element. Place it in the main composition (see NewsVideo.tsx above).

- Audio must be in a `<Sequence>` span that covers the entire video duration
- Use a mp3 file from edge-tts output
- Remotion will automatically seek the audio to match the rendered frame, so no manual `data-start` / `data-duration` attributes needed

### 7. Validate & Render

```bash
# Check available compositions
npx remotion compositions

# Render the video
npx remotion render NewsVideo output.mp4

# For faster iteration, render a test segment:
npx remotion render NewsVideo test-segment.mp4 --frames=0-149
```

**Checklist:**
- [ ] `design.md` exists and all colors match the output
- [ ] `key-points.md` exists with 3 points filled per article
- [ ] `.hyperframes/expanded-prompt.md` written with 3KP scene assignments
- [ ] Scene types vary (Key Points Card, Data Dashboard, Comparison, Quote, Timeline, Stat Card)
- [ ] 3 key points animated sequentially, staggered to match narration timing
- [ ] Transitions between every scene — use `interpolate()` opacity transitions at scene boundaries
- [ ] Karaoke captions synced to SRT word timings
- [ ] Caption overlay has dark background (`rgba(0,0,0,0.72)`) for readability
- [ ] Emphasis words (brands, numbers) get accent color treatment
- [ ] Audio plays correctly: `assets/narration.mp3` present and referenced in `<audio>` element
- [ ] Text fits within 1920×1080 frame (no overflow)
- [ ] Final render completes: `npx remotion render NewsVideo output.mp4`

### 8. Known Issues & Fixes

| Issue | Symptom | Fix |
|-------|---------|-----|
| Remotion not found | Command error | `npm install remotion @remotion/cli` |
| Composition not found | "No composition named NewsVideo" | Check `src/Root.tsx` Composition ID spelling |
| JSON import error | "Cannot find module" | Add `resolveJsonModule: true` to tsconfig.json |
| Text overflow | Text beyond 1920×1080 | Reduce font sizes, use `maxWidth`, reduce padding |
| Audio not playing | Silent video | Ensure `assets/narration.mp3` exists, use `<audio>` in Sequence |
| Font issues | Tofu characters in Chinese text | Use `sans-serif` font-family (system fonts work) |
| edge-tts not found | Command error | `pip install edge-tts` |
| edge-tts network error | Timeout | Check internet / Microsoft API access |
| Inconsistent style | Each video looks different | Use `design.md` + expanded-prompt consistently |
| Captions out of sync | Karaoke doesn't match audio | Re-run `srt-to-captions.mjs` — timings are 1:1 with SRT |
| Scene transition no crossfade | Jump cuts between scenes | Add opacity fade-in at start of each scene component |
| White flash on render | Brief white frames | Set explicit `backgroundColor` on all `AbsoluteFill` containers |
| Caption data not reimporting | Stale timings | `captions-data.json` must be rebuilt after TTS changes |

### Content Refresh

1. Re-fetch: `node scripts/fetch-news.mjs --size 10 --output .hyperframes/latest-news.md`
2. Re-fetch detail for selected articles: `node scripts/fetch-detail.mjs --ids ID,ID --output .hyperframes/article-details.md`
3. Update key points: `node scripts/extract-key-points.mjs --input .hyperframes/article-details.md --output .hyperframes/key-points.md --script`
4. Fill in the 3 key points in `key-points.md` (read full content per article)
5. Rewrite `.hyperframes/script.txt` and update `.hyperframes/expanded-prompt.md`
6. TTS + SRT: `edge-tts --voice zh-CN-YunyangNeural --rate=+5% -f .hyperframes/script.txt --write-media assets/narration.mp3 --write-subtitles assets/narration.srt`
7. Parse SRT → caption data: `node scripts/srt-to-captions.mjs assets/narration.srt assets/captions-data.json`
8. Update scene data in `src/sceneData.ts` (headlines, key points, glow colors, timings)
9. Re-render: `npx remotion render NewsVideo ai-news-new.mp4`

## References

| File | Purpose |
|------|---------|
| [scripts/fetch-news.mjs](scripts/fetch-news.mjs) | Fetch article list from API |
| [scripts/fetch-detail.mjs](scripts/fetch-detail.mjs) | Fetch full detail for selected articles by ID |
| [scripts/extract-key-points.mjs](scripts/extract-key-points.mjs) | Structure article content for 3-key-point extraction |
| [scripts/srt-to-captions.mjs](scripts/srt-to-captions.mjs) | Parse SRT → word-level `captions-data.json` for Remotion |
| [design-template.md](references/design-template.md) | Copy to `design.md` — palette, typography, motion |
| [expanded-prompt-template.md](references/expanded-prompt-template.md) | Mandatory pre-build production plan |
| [news-video-patterns.md](references/news-video-patterns.md) | Scene types, timing, color approach |
| [workflow.md](references/workflow.md) | Extended workflow guide |
| [site-api.md](references/site-api.md) | News API reference |
