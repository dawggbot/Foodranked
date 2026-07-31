# VBv2 MP4 Exports

VBv2's normal review surface is the web page. Use MP4 only as an export artifact after the VBv2 page looks right.

The active MP4 path is the local helper workflow because it receives the live VBv2/DBv2 placement payload from the browser before rendering:

```bash
node scripts/serve-vbv2-render-helper.js
```

Then open:

```text
http://127.0.0.1:4173/docs/video-builder-v2/index.html
```

From that local helper URL, VBv2's `Download MP4` button sends the current hydrated VBv2 placement to the renderer, waits for the render job to finish, and downloads:

```text
docs/video/episodes/<food-id>/<food-id>-vbv2.mp4
```

If port `4173` is busy, the helper prints the alternate local URL it used. If `127.0.0.1` is not reachable from the browser you are using, bind the helper to the workspace network interface:

```bash
node scripts/serve-vbv2-render-helper.js --host 0.0.0.0
```

The lower-level renderer still exists for automation and smoke tests, but it must receive a placement JSON captured from DBv2/VBv2:

```bash
node scripts/render-vbv2-mp4.js bacon --placement-json /tmp/bacon-vbv2-placement.json
```

Do not use the bare CLI command as the source for final layout review. A clean terminal context does not have the browser-local Layout Builder/DBv2 placement unless it is explicitly passed in.
