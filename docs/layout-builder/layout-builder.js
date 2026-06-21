(function () {
  const frame = document.getElementById('displayBuilderFrame');
  const MODE_STYLE_ID = 'layoutBuilderModeStyles';
  const TEXT_TOOLS_ID = 'layoutBuilderTextSizeTools';
  let syncTimer = null;

  function getFrameDocument() {
    try {
      return frame.contentDocument || frame.contentWindow?.document || null;
    } catch {
      return null;
    }
  }

  function hideStackByChild(doc, selector) {
    const node = doc.querySelector(selector);
    const stack = node?.closest('.stack');
    if (stack) stack.dataset.layoutBuilderHidden = 'true';
  }

  function hideStackByHeading(doc, text) {
    const normalized = text.trim().toLowerCase();
    const heading = Array.from(doc.querySelectorAll('h2, h3'))
      .find(node => node.textContent.trim().toLowerCase() === normalized);
    const stack = heading?.closest('.stack');
    if (stack) stack.dataset.layoutBuilderHidden = 'true';
  }

  function setInputValue(input, value) {
    if (!input) return;
    input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function nudgeNumber(doc, inputId, delta, fallback, min = 1) {
    const input = doc.getElementById(inputId);
    if (!input) return;
    const current = Number(input.value);
    const next = Math.max(min, (Number.isFinite(current) ? current : fallback) + delta);
    setInputValue(input, Number.isInteger(next) ? next : next.toFixed(1));
  }

  function addTextSizingTools(doc) {
    const textControls = doc.getElementById('textControls');
    if (!textControls || doc.getElementById(TEXT_TOOLS_ID)) return;

    const card = doc.createElement('div');
    card.id = TEXT_TOOLS_ID;
    card.className = 'tool-card stack';
    card.hidden = true;
    card.innerHTML = `
      <h3>Text box size</h3>
      <div class="layout-text-size-readout" id="layoutTextSizeReadout">No text selected</div>
      <div class="layout-text-size-grid" aria-label="Text size controls">
        <button type="button" data-layout-font="-0.5">Font -0.5</button>
        <button type="button" data-layout-font="0.5">Font +0.5</button>
        <button type="button" data-layout-width="-1">Width -1</button>
        <button type="button" data-layout-width="1">Width +1</button>
        <button type="button" data-layout-width="-4">Width -4</button>
        <button type="button" data-layout-width="4">Width +4</button>
      </div>
    `;

    textControls.prepend(card);
    card.querySelectorAll('[data-layout-font]').forEach(button => {
      button.addEventListener('click', () => {
        nudgeNumber(doc, 'propFontSize', Number(button.dataset.layoutFont) || 0, 6, 1);
        syncTextSizingTools(doc);
      });
    });
    card.querySelectorAll('[data-layout-width]').forEach(button => {
      button.addEventListener('click', () => {
        nudgeNumber(doc, 'propWidth', Number(button.dataset.layoutWidth) || 0, 40, 1);
        syncTextSizingTools(doc);
      });
    });
  }

  function syncTextSizingTools(doc) {
    const card = doc.getElementById(TEXT_TOOLS_ID);
    const textControls = doc.getElementById('textControls');
    if (!card || !textControls) return;

    const isTextSelected = !textControls.hidden;
    card.hidden = !isTextSelected;
    if (!isTextSelected) return;

    const font = doc.getElementById('propFontSize')?.value || '6';
    const width = doc.getElementById('propWidth')?.value || 'auto';
    const readout = doc.getElementById('layoutTextSizeReadout');
    if (readout) readout.textContent = `Font ${font} | width ${width}`;
  }

  function injectModeStyle(doc) {
    if (doc.getElementById(MODE_STYLE_ID)) return;
    const style = doc.createElement('style');
    style.id = MODE_STYLE_ID;
    style.textContent = `
      body.layout-builder-mode .sidebar-panel > .stack:first-child p,
      body.layout-builder-mode [data-layout-builder-hidden="true"],
      body.layout-builder-mode .canvas-bg-field,
      body.layout-builder-mode .phone-bg,
      body.layout-builder-mode .bg-sprite {
        display: none !important;
      }

      body.layout-builder-mode #canvas {
        background-color: #d6d6d6 !important;
        background-image:
          linear-gradient(to right, rgba(0, 0, 0, .14) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, .14) 1px, transparent 1px) !important;
        background-size: calc(1px * var(--pixel-unit)) calc(1px * var(--pixel-unit)) !important;
      }

      body.layout-builder-mode #canvas.hide-grid {
        background-image: none !important;
      }

      body.layout-builder-mode #${TEXT_TOOLS_ID}[hidden] {
        display: none !important;
      }

      body.layout-builder-mode #${TEXT_TOOLS_ID} {
        border-color: rgba(111, 198, 184, .36);
        background: rgba(111, 198, 184, .08);
      }

      body.layout-builder-mode .layout-text-size-readout {
        color: var(--muted);
        font-size: 12px;
        font-variant-numeric: tabular-nums;
      }

      body.layout-builder-mode .layout-text-size-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }
    `;
    doc.head.appendChild(style);
  }

  function applyLayoutBuilderMode() {
    const doc = getFrameDocument();
    if (!doc?.body) return;

    injectModeStyle(doc);
    doc.body.classList.add('layout-builder-mode');

    const heading = doc.querySelector('.sidebar-panel > .stack:first-child h1');
    if (heading) heading.textContent = 'Layout builder';

    hideStackByChild(doc, '#foodSearch');
    hideStackByChild(doc, '#foodList');
    hideStackByHeading(doc, 'Selected food script');
    hideStackByHeading(doc, 'Nutritional info');
    hideStackByHeading(doc, 'Background motion');
    addTextSizingTools(doc);
    syncTextSizingTools(doc);
  }

  function startModeSync() {
    window.clearInterval(syncTimer);
    syncTimer = window.setInterval(applyLayoutBuilderMode, 250);
    applyLayoutBuilderMode();
  }

  frame.addEventListener('load', startModeSync);
})();
