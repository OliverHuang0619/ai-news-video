# Karaoke Captions for AI News Video

Standard subtitle approach for this skill. Replaces per-scene static `.subtitle` bars with a dedicated caption overlay synced to SRT timing.

Read HyperFrames `references/captions.md` and `references/dynamic-techniques.md` (hyperframes skill) for full patterns. This file covers the AI-news-specific wiring.

## Why Karaoke Over Static Subtitles

| Static bar (old) | Karaoke overlay (standard) |
|------------------|----------------------------|
| Whole paragraph appears at once | Words highlight in sync with narration |
| Tied to scene div | Independent track — survives scene transitions |
| White text on white canvas | Unreadable captions | Dark bar `rgba(0,0,0,0.72)` + opacity `1` when visible |
| No emphasis on brands/numbers | Per-word accent color + scale pop |

## Pipeline

```
edge-tts → narration.srt → parse entries → display-text map → caption-overlay.html → track 2
```

**Display-text map:** TTS script uses spoken brand「AI小儿科」in the closing; `srt-to-captions.mjs` replaces it with `aixiaoerke.com` in caption divs. Timings stay 1:1 with SRT.

### 1. Generate SRT

```bash
edge-tts --voice zh-CN-YunxiNeural -f .hyperframes/script.txt \
  --write-media assets/narration.mp3 \
  --write-subtitles assets/narration.srt
```

### 2. Parse SRT to entries

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
        result.append({"start": start, "end": end, "text": text})
    return result
```

### 3. Group into caption groups (3–5 words)

Break on natural phrase boundaries. For Chinese news, group by punctuation or ~4–6 characters:

```python
def srt_to_groups(entries, max_chars=8):
    groups = []
    for entry in entries:
        text = entry["text"].strip()
        if not text:
            continue
        # Short entry = one group
        if len(text) <= max_chars:
            groups.append({
                "start": entry["start"],
                "end": entry["end"],
                "words": [{"text": text, "start": entry["start"], "end": entry["end"]}]
            })
            continue
        # Split long entries evenly across time
        chars = list(text)
        chunk_size = max_chars
        chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
        dur = entry["end"] - entry["start"]
        step = dur / len(chunks)
        for i, chunk in enumerate(chunks):
            gs = entry["start"] + i * step
            ge = entry["start"] + (i + 1) * step if i < len(chunks) - 1 else entry["end"]
            groups.append({
                "start": gs, "end": ge,
                "words": [{"text": chunk, "start": gs, "end": ge}]
            })
    return groups
```

For higher quality, use word-level timestamps:

```bash
npx hyperframes transcribe assets/narration.mp3 --output assets/captions.json --language zh
```

### 4. Wire caption overlay (sub-composition)

In `index.html`, add a composition clip on **track 2** (separate from scenes on track 1):

```html
<div id="captions" class="clip"
     data-track-index="2"
     data-start="0"
     data-duration="82"
     data-composition-id="captions"
     data-composition-src="compositions/caption-overlay.html">
</div>
```

### 5. Caption overlay HTML structure

```html
<!-- compositions/caption-overlay.html -->
<div id="caption-root" style="position:absolute;inset:0;pointer-events:none;">
  <div id="cg-0" class="caption-group" style="opacity:0">
    <span class="caption-word" data-start="0.0" data-end="0.4">大家</span>
    <span class="caption-word" data-start="0.4" data-end="0.8">好</span>
    <!-- ... -->
  </div>
  <!-- one .caption-group per phrase -->
</div>
```

### 6. Caption CSS

```css
.caption-group {
  position: absolute;
  bottom: 100px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 32px;
  font-weight: 600;
  font-family: sans-serif;
  overflow: visible; /* do NOT use hidden — clips scale pop */
}
.caption-word {
  display: inline;
  color: rgba(255, 255, 255, 0.3);
  transition: none; /* GSAP drives all motion */
}
.caption-word.read {
  color: rgba(255, 255, 255, 0.5);
}
.caption-word.active {
  color: #00d4ff;
  text-shadow: 0 0 12px rgba(0, 212, 255, 0.5), 0 2px 8px rgba(0, 0, 0, 0.8);
}
.caption-word.emphasis {
  color: #00d4ff;
  font-weight: 700;
}
```

Do **not** use `left: 50%; transform: translateX(-50%)` on the group — causes edge clipping. Use full-width + `text-align: center`.

### 7. GSAP timeline (natural pacing)

```javascript
var tl = gsap.timeline({ paused: true });
var GROUPS = [ /* from srt_to_groups() */ ];

GROUPS.forEach(function (group, gi) {
  var groupEl = document.getElementById("cg-" + gi);
  if (!groupEl) return;
  var words = groupEl.querySelectorAll(".caption-word");

  // Group entrance
  tl.fromTo(groupEl,
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" },
    group.start
  );

  // Karaoke: highlight each word
  words.forEach(function (wordEl, wi) {
    var ws = parseFloat(wordEl.dataset.start);
    var we = parseFloat(wordEl.dataset.end);
    var isEmphasis = wordEl.classList.contains("emphasis");

    tl.set(wordEl, { className: "caption-word active" + (isEmphasis ? " emphasis" : "") }, ws);
    tl.to(wordEl, {
      scale: isEmphasis ? 1.12 : 1.08,
      duration: Math.min(0.15, (we - ws) * 0.5),
      ease: "power2.out",
      transformOrigin: "center bottom"
    }, ws);
    tl.to(wordEl, { scale: 1, duration: 0.1 }, we - 0.05);
    tl.set(wordEl, { className: "caption-word read" }, we);
  });

  // Group exit + hard kill
  tl.to(groupEl, { opacity: 0, y: -8, duration: 0.15, ease: "power2.in" }, group.end - 0.15);
  tl.set(groupEl, { opacity: 0, visibility: "hidden" }, group.end);
});

window.__timelines["captions"] = tl;
```

**HyperFrames render rules for captions:**
- Use `#cg-N` string selectors in GSAP — not DOM element references
- Use only `tl.set()` / `tl.to()` / `tl.fromTo()` — **never `tl.add()` callbacks** (seek render does not run them)
- Static HTML caption divs in the sub-composition (generate via `scripts/srt-to-captions.mjs`)
- Parent `index.html` must set `#captions { z-index: 20 }` above `#scenes-container { z-index: 1 }`

### 8. Emphasis word detection

Flag words before building HTML:

- Contains digits → `.emphasis`
- Matches brand list from script (OpenAI, 阿里, 百度, etc.) → `.emphasis`
- ALL CAPS Latin tokens → `.emphasis`

### 9. Caption self-lint (required)

Before `window.__timelines["captions"] = tl`:

```javascript
GROUPS.forEach(function (group, gi) {
  var el = document.getElementById("cg-" + gi);
  if (!el) return;
  tl.seek(group.end + 0.01);
  var computed = window.getComputedStyle(el);
  if (computed.opacity !== "0" && computed.visibility !== "hidden") {
    console.warn("[caption-lint] group " + gi + " still visible at t=" + (group.end + 0.01).toFixed(2));
  }
});
tl.seek(0);
```

### 10. Overflow prevention

```javascript
var result = window.__hyperframes.fitTextFontSize(groupText, {
  fontFamily: "sans-serif",
  fontWeight: 600,
  maxWidth: 1600,
  baseFontSize: 32,
  minFontSize: 24
});
groupEl.style.fontSize = result.fontSize + "px";
```

## Checklist

- [ ] Caption overlay on track 2, scenes on track 1, audio on track 3
- [ ] One group visible at a time
- [ ] Hard kill after every group exit
- [ ] Caption bar uses `rgba(0,0,0,0.72)` for contrast
- [ ] Emphasis words get accent + larger scale pop
- [ ] Self-lint passes (no ghost captions after group.end)
- [ ] `npx hyperframes inspect --samples 10` — captions don't cover headline
