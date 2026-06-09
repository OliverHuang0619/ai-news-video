# Karaoke Captions for AI News Video

Standard subtitle approach for this skill using Remotion. Replaces per-scene static subtitle bars with a dedicated caption overlay synced to SRT timing.

## Why Karaoke Over Static Subtitles

| Static bar (old) | Karaoke overlay (standard) |
|------------------|----------------------------|
| Whole paragraph appears at once | Words highlight in sync with narration |
| Tied to scene div | Independent overlay — persists across scenes |
| White text on white canvas | Unreadable captions | Dark bar `rgba(0,0,0,0.72)` with text-shadow |

## Pipeline

```
edge-tts → narration.srt → srt-to-captions.mjs → captions-data.json → CaptionOverlay.tsx
```

**Display-text map:** TTS script uses spoken brand「AI小儿科」in the closing; `srt-to-captions.mjs` replaces it with `aixiaoerke.com` in caption text. Timings stay 1:1 with SRT.

### 1. Generate SRT

```bash
edge-tts --voice zh-CN-YunxiNeural -f .hyperframes/script.txt \
  --write-media assets/narration.mp3 \
  --write-subtitles assets/narration.srt
```

### 2. Parse SRT to caption data

```bash
node scripts/srt-to-captions.mjs assets/narration.srt assets/captions-data.json
```

This generates word-level karaoke data with per-word start/end times, grouped into caption phrases (4-8 Chinese chars per group).

### 3. Remotion CaptionOverlay Component

The component reads `captions-data.json` and renders karaoke captions using `useCurrentFrame()` to determine which word is currently being spoken.

**src/CaptionOverlay.tsx:**
```tsx
import { useCurrentFrame } from "remotion";
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
const FPS = 30;

export const CaptionOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const time = frame / FPS;

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
                transition: "none",
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

### 4. Emphasis word detection

Flag words before building caption data:

- Contains digits → emphasis (accent color + scale)
- Matches brand list from script (OpenAI, 阿里, 百度, etc.) → emphasis
- ALL CAPS Latin tokens → emphasis

### 5. Overflow prevention

The caption bar uses `maxWidth: 1600, width: "90%"` to stay within safe margins. Font size is `32px` — adjust to `28px` if the longest caption group exceeds the container.

### 6. Caption checklist

- [ ] Caption overlay renders above scene content (zIndex: 20)
- [ ] One group visible at a time (find by timing)
- [ ] Dark bar `rgba(0,0,0,0.72)` for readability
- [ ] Active word gets accent color + scale pop
- [ ] Read words at opacity 0.5
- [ ] Unread words at opacity 0.35
- [ ] Emphasis (digit) words get accent color
- [ ] Caption data file rebuilt after every TTS change
