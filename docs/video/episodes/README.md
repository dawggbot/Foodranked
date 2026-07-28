# Published VBv2 MP4s

VBv2's `Download MP4` button downloads pre-rendered MP4 files from this directory. It does not screen-record or encode the browser preview.

Use this path shape for each published video:

```text
docs/video/episodes/<food-id>/<food-id>-vbv2.mp4
```

Render one from the repo root with:

```bash
node scripts/render-vbv2-mp4.js <food-id>
```

Example:

```bash
node scripts/render-vbv2-mp4.js bacon
```

The renderer requires `ffmpeg` and uses Playwright to capture the exact VBv2 stage frame-by-frame, then mixes split narration, background music, and VBv2 SFX into a real MP4. For quick tests, render only the first few seconds:

```bash
node scripts/render-vbv2-mp4.js bacon --seconds 3 --output /tmp/bacon-test.mp4
```

For the one-button local workflow, run the helper server:

```bash
node scripts/serve-vbv2-render-helper.js
```

Then open:

```text
http://127.0.0.1:4173/docs/video-builder-v2/index.html
```

If port `4173` is busy, the helper prints the alternate local URL it used.

From that local helper URL, VBv2's `Download MP4` button will render the MP4 when it is missing, wait for the render job to finish, and then download the generated MP4.
