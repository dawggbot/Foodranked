(function () {
  const frame = document.getElementById('displayBuilderFrame');
  const MODE_STYLE_ID = 'layoutBuilderModeStyles';
  const LAYER_ORDER_CARD_ID = 'layoutBuilderLayerOrderCard';
  const LAYER_INDEX_ID = 'layoutBuilderLayerIndex';
  const ROTATE_CARD_ID = 'layoutBuilderRotateCard';
  const SAVED_LAYOUT_NAME_ID = 'layoutBuilderSavedLayoutName';
  const SAVED_LAYOUT_MESSAGE_ID = 'layoutBuilderSavedLayoutMessage';
  const LOCKED_LAYOUT_DOWNLOAD_ID = 'layoutBuilderDownloadLockedLayouts';
  const LAYOUT_STORAGE_KEY = 'foodranked-layout-builder-v4';
  const SAVED_LAYOUTS_KEY = 'foodranked-layout-builder-sprite-layouts-v1';
  const FOOD_LAYOUTS_KEY = 'foodranked-layout-builder-food-layouts-v1';
  const LOCKED_LAYOUT_PRESET_NAMES = ['test 1', 'test 2', 'test 3', 'test 4', 'test 5'];
  const LOCKED_LAYOUT_PRESET_NAME_SET = new Set(LOCKED_LAYOUT_PRESET_NAMES);
  const LEGACY_TEST_LAYOUT_NAME = 'test';
  const LOCKED_LAYOUT_VERSION = '20260801-layout-lockdown-v1';
  const SAVED_LAYOUT_BACKUP_INDEX_KEY = 'foodranked-layout-builder-save-backups-v1';
  const SAVED_LAYOUT_BACKUP_STORAGE_PREFIX = 'foodranked-layout-builder-before-save';
  const REVOKED_LAYOUT_SEED_VERSIONS = new Set(['20260801-current-builder-layout-v1']);
  const REVOKED_LAYOUT_SEED_SOURCES = new Set(['docs/layout-builder/canonical-test-layout.js']);
  const REVOKED_LAYOUT_SEED_IDS = new Set(['layout_test_current_builder_20260801']);
  // Locked approved view zoom: do not change without an explicit layout-builder zoom request.
  const CANVAS_VIEW_ZOOM = 1.52;
  const SECTION_IDS = ['intro', 'fats', 'carbs', 'protein', 'vitamins', 'minerals', 'pros', 'cons', 'outro'];
  const SECTION_ID_ALIASES = { carbohydrates: 'carbs', proteins: 'protein' };
  const MACRO_SECTION_IDS = ['fats', 'carbs', 'protein'];
  let selectedSavedLayoutId = '';
  let syncTimer = null;
  let syncFrame = 0;

  function getFrameWindow() {
    try {
      return frame.contentWindow || null;
    } catch {
      return null;
    }
  }

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

  function stackByHeading(doc, selector, text) {
    const normalized = text.trim().toLowerCase();
    const heading = Array.from(doc.querySelectorAll(selector))
      .find(node => node.textContent.trim().toLowerCase() === normalized);
    return heading?.closest('.stack') || null;
  }

  function hideStackByHeading(doc, selector, text) {
    const stack = stackByHeading(doc, selector, text);
    if (stack) stack.dataset.layoutBuilderHidden = 'true';
    return stack;
  }

  function showStackByHeading(doc, selector, text) {
    const stack = stackByHeading(doc, selector, text);
    if (stack) delete stack.dataset.layoutBuilderHidden;
    return stack;
  }

  function currentLayout(doc) {
    const textarea = doc.getElementById('layoutJson');
    if (textarea?.value) {
      try {
        return JSON.parse(textarea.value);
      } catch {}
    }
    try {
      const raw = getFrameWindow()?.localStorage.getItem(LAYOUT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function clone(value) {
    return structuredClone(value);
  }

  function currentSectionLayers(layout) {
    const sectionId = layout?.selectedSectionId || 'intro';
    return Array.isArray(layout?.sections?.[sectionId]?.layers) ? layout.sections[sectionId].layers : [];
  }

  function layerSortBackToFront(layers) {
    return layers
      .map((layer, originalIndex) => ({ layer, originalIndex }))
      .sort((a, b) => (Number(a.layer.z) || 0) - (Number(b.layer.z) || 0) || a.originalIndex - b.originalIndex);
  }

  function selectedLayerId(doc) {
    const explicitId = doc.body?.dataset?.selectedLayerId || '';
    if (explicitId && doc.querySelector(`#canvas .layer-node[data-layer-id="${CSS.escape(explicitId)}"], #layerList .card-button[data-layer-id="${CSS.escape(explicitId)}"]`)) {
      return explicitId;
    }
    return doc.querySelector('#layerList .card-button.active[data-layer-id]')?.dataset.layerId
      || doc.querySelector('#canvas .layer-node.selected')?.dataset.layerId
      || '';
  }

  function scheduleLayoutBuilderUiUpdate(doc) {
    if (syncFrame) return;
    syncFrame = requestAnimationFrame(() => {
      syncFrame = 0;
      if (doc?.body) updateLayoutBuilderUi(doc);
    });
  }

  function cssPixels(value) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function authorGrid() {
    const schemaGrid = getFrameWindow()?.FOODRANKED_DISPLAY_SCHEMA?.authorGrid;
    const width = Number(schemaGrid?.width);
    const height = Number(schemaGrid?.height);
    return {
      width: Number.isFinite(width) && width > 0 ? width : 105,
      height: Number.isFinite(height) && height > 0 ? height : 186.666667
    };
  }

  function layerRight(layer) {
    return (Number(layer?.x) || 0) + (Number(layer?.width) || 0);
  }

  function isSectionSeparatorLayer(layer) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return fingerprint.includes('/ui/section_separator/') || fingerprint.includes('section separator');
  }

  function isMainSectionIndicatorLayer(layer, sectionId) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return fingerprint.includes(`${sectionId}_macro_bar_frame`)
      || fingerprint.includes(`${sectionId}_macro_bar_fill`)
      || fingerprint.includes('macro bar frame')
      || fingerprint.includes('macro bar fill');
  }

  function alignedWidthForLayers(sectionId, layers) {
    const separators = layers.filter(isSectionSeparatorLayer);
    const sectionIndicators = layers.filter(layer => isMainSectionIndicatorLayer(layer, sectionId));
    if (!separators.length || !sectionIndicators.length) return null;

    const separatorLeft = Math.min(...separators.map(layer => Number(layer.x) || 0));
    const indicatorRight = Math.max(...sectionIndicators.map(layerRight));
    const width = separatorLeft + indicatorRight;
    return Number.isFinite(width) && width > 0 ? width : null;
  }

  function macroReferenceCanvasGridWidth(layout, fallbackWidth) {
    const widths = MACRO_SECTION_IDS
      .map(sectionId => {
        const layers = layout?.sections?.[sectionId]?.layers;
        return Array.isArray(layers) ? alignedWidthForLayers(sectionId, layers) : null;
      })
      .filter(width => Number.isFinite(width) && width > 0);
    if (!widths.length) return fallbackWidth;
    return Math.min(fallbackWidth, Math.max(...widths));
  }

  function alignedCanvasGridWidth(doc, fallbackWidth) {
    return macroReferenceCanvasGridWidth(currentLayout(doc), fallbackWidth);
  }

  function clearLayoutBuilderDisplayFit(shell) {
    shell.style.removeProperty('width');
    shell.style.removeProperty('height');
    shell.style.removeProperty('aspect-ratio');
    shell.style.removeProperty('border');
    shell.style.removeProperty('border-radius');
    shell.style.removeProperty('box-shadow');
    shell.style.removeProperty('background');
    shell.style.removeProperty('padding');
  }

  function fitDisplayToCanvas(shell, canvasWidth, canvasHeight) {
    shell.style.width = `${canvasWidth.toFixed(3)}px`;
    shell.style.height = `${canvasHeight.toFixed(3)}px`;
    shell.style.aspectRatio = 'auto';
    shell.style.border = '0';
    shell.style.borderRadius = '0';
    shell.style.boxShadow = 'none';
    shell.style.background = 'transparent';
    shell.style.padding = '0';
  }

  function clearCanvasViewZoom(doc) {
    const wrap = doc.querySelector('.canvas-wrap');
    if (!wrap) return;
    wrap.removeAttribute('data-layout-builder-canvas-zoom');
    wrap.style.removeProperty('width');
    wrap.style.removeProperty('height');
    wrap.style.removeProperty('--layout-builder-canvas-view-zoom');
  }

  function syncCanvasToVisibleDisplay(doc) {
    const shell = doc.querySelector('.phone-shell');
    const canvas = doc.getElementById('canvas');
    if (!shell || !canvas) return;

    const win = doc.defaultView || window;
    clearCanvasViewZoom(doc);
    clearLayoutBuilderDisplayFit(shell);
    const shellRect = shell.getBoundingClientRect();
    if (!shellRect.width || !shellRect.height) return;

    const shellStyle = win.getComputedStyle(shell);
    const displayWidth = shellRect.width
      - cssPixels(shellStyle.borderLeftWidth)
      - cssPixels(shellStyle.borderRightWidth)
      - cssPixels(shellStyle.paddingLeft)
      - cssPixels(shellStyle.paddingRight);
    const grid = authorGrid();
    const pixelUnit = Math.max(0.1, displayWidth / grid.width);
    const canvasGridWidth = alignedCanvasGridWidth(doc, grid.width);
    const canvasWidth = canvasGridWidth * pixelUnit;
    const canvasHeight = canvasGridWidth * (grid.height / grid.width) * pixelUnit;

    canvas.style.width = `${canvasWidth.toFixed(3)}px`;
    canvas.style.height = `${canvasHeight.toFixed(3)}px`;
    canvas.style.setProperty('--pixel-unit', String(pixelUnit));
    fitDisplayToCanvas(shell, canvasWidth, canvasHeight);
  }

  function syncCanvasViewZoom(doc) {
    const wrap = doc.querySelector('.canvas-wrap');
    const editor = doc.querySelector('.editor');
    const canvas = doc.getElementById('canvas');
    if (!wrap || !canvas) return;

    const canvasStyle = doc.defaultView?.getComputedStyle(canvas);
    const canvasWidth = Number.parseFloat(canvas.style.width || canvasStyle?.width || '');
    const canvasHeight = Number.parseFloat(canvas.style.height || canvasStyle?.height || '');
    if (!Number.isFinite(canvasWidth) || !Number.isFinite(canvasHeight)) return;

    const framePadding = 0;
    const editorRect = editor?.getBoundingClientRect();
    const editorStyle = editor ? doc.defaultView?.getComputedStyle(editor) : null;
    const editorPaddingX = cssPixels(editorStyle?.paddingLeft) + cssPixels(editorStyle?.paddingRight);
    const editorPaddingY = cssPixels(editorStyle?.paddingTop) + cssPixels(editorStyle?.paddingBottom);
    const editorContentWidth = editorRect?.width ? editorRect.width - editorPaddingX : 0;
    const editorContentHeight = editorRect?.height ? editorRect.height - editorPaddingY : 0;
    const maxZoomByWidth = editorContentWidth ? (editorContentWidth - framePadding) / canvasWidth : CANVAS_VIEW_ZOOM;
    const maxZoomByHeight = editorContentHeight ? (editorContentHeight - framePadding) / canvasHeight : CANVAS_VIEW_ZOOM;
    const zoom = Math.max(1, Math.min(CANVAS_VIEW_ZOOM, maxZoomByWidth, maxZoomByHeight));

    wrap.dataset.layoutBuilderCanvasZoom = 'true';
    wrap.style.setProperty('--layout-builder-canvas-view-zoom', String(zoom));
    wrap.style.width = `${((canvasWidth * zoom) + framePadding).toFixed(3)}px`;
    wrap.style.height = `${((canvasHeight * zoom) + framePadding).toFixed(3)}px`;
  }

  function filenameFromPath(path) {
    const clean = String(path || '').split(/[?#]/)[0];
    const name = clean.split('/').filter(Boolean).pop() || '';
    return name || '';
  }

  function collapseText(text) {
    return String(text || '').trim().replace(/\s+/g, ' ');
  }

  function normalizeDisplaySectionId(sectionId) {
    const raw = String(sectionId || '').trim();
    return SECTION_ID_ALIASES[raw] || raw;
  }

  function truncateLabel(label, max = 46) {
    if (label.length <= max) return label;
    return `${label.slice(0, Math.max(1, max - 3)).trimEnd()}...`;
  }

  function friendlyLayerName(layer) {
    if (!layer) return '';
    if (layer.kind === 'text') {
      const text = collapseText(layer.text);
      return text ? truncateLabel(text) : 'Empty text';
    }
    if (layer.kind === 'sprite') {
      return filenameFromPath(layer.src || layer.fallbackSrc) || 'Unnamed sprite';
    }
    return layer.label || layer.id || 'Unnamed layer';
  }

  function friendlyLayerMap(layout) {
    const layers = currentSectionLayers(layout);
    return new Map(layers.map(layer => [layer.id, { layer, label: friendlyLayerName(layer) }]));
  }

  function getSectionLayers(layout, sectionId) {
    const layers = layout?.sections?.[sectionId]?.layers;
    return Array.isArray(layers) ? layers : [];
  }

  function updateLayerLabels(doc) {
    const layout = currentLayout(doc);
    if (!layout) return;
    const layers = currentSectionLayers(layout);
    const labels = friendlyLayerMap(layout);
    const displayOrder = [...layers].sort((a, b) => (Number(b.z) || 0) - (Number(a.z) || 0));
    const buttons = Array.from(doc.querySelectorAll('#layerList .card-button'));

    buttons.forEach((button, index) => {
      const layer = displayOrder[index];
      if (!layer) return;
      button.dataset.layerId = layer.id || '';
      const strong = button.querySelector('strong');
      if (strong) strong.textContent = labels.get(layer.id)?.label || friendlyLayerName(layer);
    });

    const selectedId = selectedLayerId(doc);
    const selected = labels.get(selectedId);
    const chip = doc.getElementById('selectionChip');
    if (selected && chip) chip.textContent = `Selected: ${selected.label}`;
  }

  function applyLayoutJson(doc, layout, restoreSelectionId = '') {
    const textarea = doc.getElementById('layoutJson');
    const applyButton = doc.getElementById('applyJson');
    if (!textarea || !applyButton) return;

    textarea.value = JSON.stringify(layout, null, 2);
    try {
      getFrameWindow()?.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    } catch {}
    applyButton.click();

    window.setTimeout(() => {
      updateLayoutBuilderUi(doc);
      if (!restoreSelectionId) return;
      const target = doc.querySelector(`#canvas .layer-node[data-layer-id="${CSS.escape(restoreSelectionId)}"]`)
        || doc.querySelector(`#layerList .card-button[data-layer-id="${CSS.escape(restoreSelectionId)}"]`);
      target?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      window.setTimeout(() => updateLayoutBuilderUi(doc), 80);
    }, 140);
  }

  function ensureLayerOrderCard(doc) {
    const panel = doc.getElementById('inspectorPanel');
    if (!panel || doc.getElementById(LAYER_ORDER_CARD_ID)) return;

    const card = doc.createElement('div');
    card.id = LAYER_ORDER_CARD_ID;
    card.className = 'tool-card stack';
    card.innerHTML = `
      <h3>Layer order</h3>
      <div id="${LAYER_INDEX_ID}" class="layout-builder-index">No layer selected</div>
      <div class="toolbar-grid two">
        <button id="layoutBuilderBringForward" type="button">Bring forward</button>
        <button id="layoutBuilderBringBack" type="button">Bring back</button>
      </div>
    `;

    const firstControls = panel.querySelector('.split-2');
    if (firstControls?.nextSibling) panel.insertBefore(card, firstControls.nextSibling);
    else panel.prepend(card);

    card.querySelector('#layoutBuilderBringForward').addEventListener('click', () => reorderSelectedLayer(doc, 1));
    card.querySelector('#layoutBuilderBringBack').addEventListener('click', () => reorderSelectedLayer(doc, -1));
  }

  function updateLayerOrderCard(doc) {
    const layout = currentLayout(doc);
    const readout = doc.getElementById(LAYER_INDEX_ID);
    const forward = doc.getElementById('layoutBuilderBringForward');
    const back = doc.getElementById('layoutBuilderBringBack');
    if (!layout || !readout || !forward || !back) return;

    const layers = currentSectionLayers(layout);
    const sorted = layerSortBackToFront(layers);
    const selectedId = selectedLayerId(doc);
    const index = sorted.findIndex(item => item.layer.id === selectedId);
    const hasSelection = index >= 0;

    readout.textContent = hasSelection ? `Index ${index + 1} of ${sorted.length}` : 'No layer selected';
    back.disabled = !hasSelection || index <= 0;
    forward.disabled = !hasSelection || index >= sorted.length - 1;
  }

  function reorderSelectedLayer(doc, direction) {
    const layout = currentLayout(doc);
    if (!layout) return;

    const sectionId = layout.selectedSectionId || 'intro';
    const layers = currentSectionLayers(layout);
    const selectedId = selectedLayerId(doc);
    const sorted = layerSortBackToFront(layers);
    const currentIndex = sorted.findIndex(item => item.layer.id === selectedId);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= sorted.length) return;

    const nextOrder = [...sorted];
    [nextOrder[currentIndex], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[currentIndex]];
    const currentLayer = sorted[currentIndex].layer;
    const targetLayer = sorted[targetIndex].layer;
    const currentZ = Number(currentLayer.z) || 0;
    const targetZ = Number(targetLayer.z) || 0;
    if (currentZ !== targetZ) {
      currentLayer.z = targetZ;
      targetLayer.z = currentZ;
    }
    layout.sections[sectionId].layers = nextOrder.map(item => item.layer);
    applyLayoutJson(doc, layout, selectedId);
  }

  function ensureRotateCard(doc) {
    const spriteControls = doc.getElementById('spriteControls');
    if (!spriteControls || doc.getElementById(ROTATE_CARD_ID)) return;

    const card = doc.createElement('div');
    card.id = ROTATE_CARD_ID;
    card.className = 'tool-card stack';
    card.innerHTML = '<button id="layoutBuilderRotate90" type="button">Rotate 90°</button>';

    const spriteInfo = doc.getElementById('spriteInfo');
    if (spriteInfo?.nextSibling) spriteControls.insertBefore(card, spriteInfo.nextSibling);
    else spriteControls.prepend(card);

    card.querySelector('#layoutBuilderRotate90').addEventListener('click', () => rotateSelectedSprite(doc));
  }

  function normalizeQuarterRotation(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return ((Math.round(number / 90) * 90) % 360 + 360) % 360;
  }

  function rotateSelectedSprite(doc) {
    const spriteControls = doc.getElementById('spriteControls');
    const input = doc.getElementById('propSpriteRotation');
    if (!input || !spriteControls || spriteControls.hidden) return;

    const next = (normalizeQuarterRotation(input.value) + 90) % 360;
    input.value = String(next);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    window.setTimeout(() => updateLayoutBuilderUi(doc), 60);
  }

  function isTypingTarget(node) {
    const tagName = node?.tagName;
    return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || node?.isContentEditable;
  }

  function nudgeSelectedLayer(doc, deltaX, deltaY) {
    if (!selectedLayerId(doc)) return false;

    const inputX = doc.getElementById('propX');
    const inputY = doc.getElementById('propY');
    if (!inputX || !inputY) return false;

    if (deltaX) {
      inputX.value = String((Number(inputX.value) || 0) + deltaX);
      inputX.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (deltaY) {
      inputY.value = String((Number(inputY.value) || 0) + deltaY);
      inputY.dispatchEvent(new Event('input', { bubbles: true }));
    }

    window.setTimeout(() => updateLayoutBuilderUi(doc), 60);
    return true;
  }

  function bindKeyboardNudging(doc) {
    if (doc.body.dataset.layoutBuilderKeyboardBound) return;

    const win = getFrameWindow();
    if (!win) return;

    doc.body.dataset.layoutBuilderKeyboardBound = 'true';

    win.addEventListener('keydown', event => {
      if (isTypingTarget(doc.activeElement) || isTypingTarget(event.target)) return;

      const step = event.shiftKey ? 10 : 1;
      const directions = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step]
      };
      const direction = directions[event.key];
      if (!direction) return;

      if (nudgeSelectedLayer(doc, direction[0], direction[1])) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }

  function bindSelectionFocusExit(doc) {
    if (doc.body.dataset.layoutBuilderSelectionFocusBound) return;
    doc.body.dataset.layoutBuilderSelectionFocusBound = 'true';

    const clearTypingFocus = event => {
      if (isTypingTarget(event.target)) return;
      if (isTypingTarget(doc.activeElement)) doc.activeElement.blur();
    };

    doc.getElementById('canvas')?.addEventListener('pointerdown', clearTypingFocus, true);
    doc.getElementById('layerList')?.addEventListener('pointerdown', clearTypingFocus, true);
  }

  function bindLayerListImmediateSync(doc) {
    const layerList = doc.getElementById('layerList');
    if (!layerList || layerList.dataset.layoutBuilderObserverBound) return;

    layerList.dataset.layoutBuilderObserverBound = 'true';
    const observer = new MutationObserver(() => scheduleLayoutBuilderUiUpdate(doc));
    observer.observe(layerList, { childList: true });
  }

  function normalizeSpriteSrc(doc, src) {
    const raw = String(src || '');
    if (!raw) return '';
    if (/^\.\/?sprites\//.test(raw)) return raw;
    try {
      const url = new URL(raw, doc.location.href);
      if (url.origin === doc.location.origin) {
        const spriteIndex = url.pathname.indexOf('/sprites/');
        if (spriteIndex >= 0) return `.${url.pathname.slice(spriteIndex)}`;
      }
    } catch {}
    return raw;
  }

  function spriteItemFromChip(doc, chip) {
    const image = chip?.querySelector('img');
    const label = collapseText(chip?.querySelector('strong')?.textContent || image?.alt || 'sprite');
    const src = normalizeSpriteSrc(doc, image?.getAttribute('src') || image?.src || '');
    if (!src) return null;
    return { label, src };
  }

  function setSpriteDragGhostPosition(ghost, x, y) {
    ghost.style.transform = `translate(${Math.round(x + 12)}px, ${Math.round(y + 12)}px)`;
  }

  function createSpriteDragGhost(doc, item, startX, startY) {
    const ghost = doc.createElement('div');
    ghost.className = 'layout-builder-drag-ghost';
    const image = doc.createElement('img');
    image.src = item.src;
    image.alt = '';
    const label = doc.createElement('span');
    label.textContent = item.label;
    ghost.append(image, label);
    doc.body.appendChild(ghost);
    setSpriteDragGhostPosition(ghost, startX, startY);
    return ghost;
  }

  function dispatchSpriteDrop(doc, item, clientX, clientY) {
    const canvas = doc.getElementById('canvas');
    if (!canvas) return false;

    const payload = JSON.stringify(item);
    let event;
    try {
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('application/json', payload);
      event = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        clientX,
        clientY,
        dataTransfer
      });
    } catch {
      event = new Event('drop', { bubbles: true, cancelable: true });
      Object.defineProperties(event, {
        clientX: { value: clientX },
        clientY: { value: clientY },
        dataTransfer: {
          value: {
            dropEffect: 'copy',
            getData: type => type === 'application/json' ? payload : ''
          }
        }
      });
    }

    const dropped = canvas.dispatchEvent(event);
    window.setTimeout(() => scheduleLayoutBuilderUiUpdate(doc), 120);
    return dropped;
  }

  function bindSpriteLibraryPointerDrop(doc) {
    const library = doc.getElementById('spriteLibrary');
    const canvas = doc.getElementById('canvas');
    if (!library || !canvas || library.dataset.layoutBuilderPointerDropBound) return;

    library.dataset.layoutBuilderPointerDropBound = 'true';

    library.addEventListener('click', event => {
      const chip = event.target.closest('.sprite-chip');
      if (!chip?.dataset.layoutBuilderSuppressClick) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      delete chip.dataset.layoutBuilderSuppressClick;
    }, true);

    library.addEventListener('pointerdown', event => {
      const chip = event.target.closest('.sprite-chip');
      if (!chip || event.button !== 0) return;

      const item = spriteItemFromChip(doc, chip);
      if (!item) return;

      chip.draggable = false;
      chip.querySelectorAll('img').forEach(image => image.draggable = false);

      const startX = event.clientX;
      const startY = event.clientY;
      let dragging = false;
      let ghost = null;

      const cleanup = () => {
        doc.removeEventListener('pointermove', handleMove, true);
        doc.removeEventListener('pointerup', handleUp, true);
        doc.removeEventListener('pointercancel', handleCancel, true);
        canvas.classList.remove('drop-target');
        ghost?.remove();
      };

      const handleMove = moveEvent => {
        const distance = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
        if (!dragging && distance < 6) return;

        if (!dragging) {
          dragging = true;
          chip.dataset.layoutBuilderSuppressClick = 'true';
          ghost = createSpriteDragGhost(doc, item, moveEvent.clientX, moveEvent.clientY);
        }

        moveEvent.preventDefault();
        setSpriteDragGhostPosition(ghost, moveEvent.clientX, moveEvent.clientY);
        const dropTarget = doc.elementFromPoint(moveEvent.clientX, moveEvent.clientY)?.closest('#canvas');
        canvas.classList.toggle('drop-target', dropTarget === canvas);
      };

      const handleUp = upEvent => {
        cleanup();
        if (!dragging) return;

        upEvent.preventDefault();
        const dropTarget = doc.elementFromPoint(upEvent.clientX, upEvent.clientY)?.closest('#canvas');
        if (dropTarget === canvas) dispatchSpriteDrop(doc, item, upEvent.clientX, upEvent.clientY);
        window.setTimeout(() => delete chip.dataset.layoutBuilderSuppressClick, 0);
      };

      const handleCancel = () => {
        cleanup();
        window.setTimeout(() => delete chip.dataset.layoutBuilderSuppressClick, 0);
      };

      doc.addEventListener('pointermove', handleMove, true);
      doc.addEventListener('pointerup', handleUp, true);
      doc.addEventListener('pointercancel', handleCancel, true);
    }, true);
  }

  function updateRotateCard(doc) {
    const card = doc.getElementById(ROTATE_CARD_ID);
    const spriteControls = doc.getElementById('spriteControls');
    if (!card || !spriteControls) return;
    card.hidden = !!spriteControls.hidden;
  }

  function readSavedLayouts(win) {
    try {
      const raw = win.localStorage.getItem(SAVED_LAYOUTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const entries = Array.isArray(parsed) ? parsed : Object.values(parsed || {});
      const normalized = entries
        .filter(entry => entry && entry.id && entry.sections && typeof entry.sections === 'object')
        .map(entry => ({
          id: String(entry.id),
          name: String(entry.name || 'Untitled layout'),
          createdAt: entry.createdAt || new Date().toISOString(),
          updatedAt: entry.updatedAt || entry.createdAt || new Date().toISOString(),
          selectedFoodId: entry.selectedFoodId || '',
          selectedSectionId: entry.selectedSectionId || 'intro',
          canvas: clone(entry.canvas || null),
          meta: clone(entry.meta || {}),
          sections: clone(entry.sections)
        }));
      const kept = sortSavedLayoutEntries(normalized.filter(entry => !isRevokedLayoutSeed(entry)));
      if (kept.length !== normalized.length) {
        persistSavedLayouts(win, kept);
        win.localStorage.removeItem(FOOD_LAYOUTS_KEY);
      }
      return kept;
    } catch {
      return [];
    }
  }

  function persistSavedLayouts(win, entries) {
    win.localStorage.setItem(SAVED_LAYOUTS_KEY, JSON.stringify(entries));
  }

  function readStorageJson(win, key, fallback) {
    try {
      const raw = win.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function savedLayoutNameKey(value) {
    return collapseText(value).toLowerCase();
  }

  function isLockedLayoutName(value) {
    return LOCKED_LAYOUT_PRESET_NAME_SET.has(savedLayoutNameKey(value));
  }

  function isLockedLayoutEntry(entry) {
    return isLockedLayoutName(entry?.name);
  }

  function lockedLayoutIndex(entry) {
    const index = LOCKED_LAYOUT_PRESET_NAMES.indexOf(savedLayoutNameKey(entry?.name));
    return index >= 0 ? index : Number.POSITIVE_INFINITY;
  }

  function sortSavedLayoutEntries(entries) {
    return entries.sort((a, b) => {
      const lockedSort = lockedLayoutIndex(a) - lockedLayoutIndex(b);
      if (lockedSort) return lockedSort;
      return String(b.updatedAt).localeCompare(String(a.updatedAt)) || a.name.localeCompare(b.name);
    });
  }

  function isLegacyTestLayoutEntry(entry) {
    return savedLayoutNameKey(entry?.name) === LEGACY_TEST_LAYOUT_NAME;
  }

  function isRevokedLayoutSeed(value) {
    const meta = value?.meta || {};
    const sourcePlacementMeta = meta.sourcePlacementMeta || {};
    return REVOKED_LAYOUT_SEED_IDS.has(String(value?.id || ''))
      || REVOKED_LAYOUT_SEED_VERSIONS.has(String(meta.canonicalLayoutVersion || ''))
      || REVOKED_LAYOUT_SEED_VERSIONS.has(String(sourcePlacementMeta.canonicalLayoutVersion || ''))
      || REVOKED_LAYOUT_SEED_SOURCES.has(String(meta.canonicalLayoutSource || ''))
      || REVOKED_LAYOUT_SEED_SOURCES.has(String(sourcePlacementMeta.canonicalLayoutSource || ''));
  }

  function savedLayoutBackupName(entry, now) {
    const name = collapseText(entry?.name) || 'layout';
    const base = savedLayoutNameKey(name) === LEGACY_TEST_LAYOUT_NAME ? LEGACY_TEST_LAYOUT_NAME : name;
    return `${base} backup ${now.replace(/[:.]/g, '-')}`;
  }

  function readSavedLayoutBackupIndex(win) {
    try {
      const raw = win.localStorage.getItem(SAVED_LAYOUT_BACKUP_INDEX_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function uniqueSavedLayoutBackupStorageKey(win, suffix = '') {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const tail = attempt ? `-${attempt}` : '';
      const key = `${SAVED_LAYOUT_BACKUP_STORAGE_PREFIX}-${stamp}-${Date.now().toString(36)}${tail}${suffix}`;
      if (!win.localStorage.getItem(key)) return key;
    }
    return `${SAVED_LAYOUT_BACKUP_STORAGE_PREFIX}-${stamp}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${suffix}`;
  }

  function backupSavedLayoutBeforeReplace(win, entry, now) {
    if (!entry?.sections) return null;
    try {
      const backupId = `saved_layout_backup_${Date.now().toString(36)}`;
      const primaryKey = uniqueSavedLayoutBackupStorageKey(win);
      const secondaryKey = uniqueSavedLayoutBackupStorageKey(win, '-copy');
      const snapshot = {
        id: backupId,
        createdAt: now,
        reason: `Before replacing saved layout ${entry.name || entry.id}`,
        layout: clone(entry)
      };
      win.localStorage.setItem(primaryKey, JSON.stringify(snapshot));
      win.localStorage.setItem(secondaryKey, JSON.stringify(snapshot));
      const index = readSavedLayoutBackupIndex(win);
      index.push({
        id: backupId,
        createdAt: now,
        reason: snapshot.reason,
        layoutId: entry.id || '',
        layoutName: entry.name || '',
        primaryKey,
        secondaryKey
      });
      win.localStorage.setItem(SAVED_LAYOUT_BACKUP_INDEX_KEY, JSON.stringify(index));
      return { id: backupId, createdAt: now, primaryKey, secondaryKey };
    } catch (error) {
      console.warn('Could not create saved layout backup before replace', error);
      return null;
    }
  }

  function backupSavedLayoutEntry(entry, now, backupInfo = null) {
    if (!entry?.sections) return null;
    return {
      ...clone(entry),
      id: `${entry.id || 'layout'}_backup_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      name: savedLayoutBackupName(entry, now),
      updatedAt: now,
      meta: {
        ...(entry.meta || {}),
        savedLayoutBackup: {
          originalId: entry.id || '',
          originalName: entry.name || '',
          backedUpAt: now,
          ...(backupInfo || {})
        }
      }
    };
  }

  function layoutHasSections(layout) {
    return !!layout?.sections
      && typeof layout.sections === 'object'
      && SECTION_IDS.some(sectionId => Array.isArray(layout.sections?.[sectionId]?.layers));
  }

  function normalizedLayoutSnapshot(layout) {
    if (!layoutHasSections(layout) || isRevokedLayoutSeed(layout)) return null;
    const sections = {};
    for (const sectionId of SECTION_IDS) {
      const layers = Array.isArray(layout.sections?.[sectionId]?.layers) ? layout.sections[sectionId].layers : [];
      sections[sectionId] = { layers: clone(layers) };
    }
    return {
      canvas: clone(layout.canvas || null),
      selectedFoodId: layout.selectedFoodId || '',
      selectedSectionId: normalizeDisplaySectionId(layout.selectedSectionId) || 'intro',
      meta: clone(layout.meta || {}),
      sections
    };
  }

  function sourceLayoutForLockedCopies(doc, entries) {
    const existingLocked = [...entries]
      .filter(entry => isLockedLayoutEntry(entry) && layoutHasSections(entry))
      .sort((a, b) => lockedLayoutIndex(a) - lockedLayoutIndex(b))[0];
    if (existingLocked) return { source: normalizedLayoutSnapshot(existingLocked), sourceName: existingLocked.name, sourceId: existingLocked.id };

    const current = normalizedLayoutSnapshot(currentLayout(doc));
    if (current) return { source: current, sourceName: 'current layout builder state', sourceId: LAYOUT_STORAGE_KEY };

    const legacyTest = [...entries]
      .filter(entry => isLegacyTestLayoutEntry(entry) && !isRevokedLayoutSeed(entry) && layoutHasSections(entry))
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)) || String(b.id).localeCompare(String(a.id)))[0];
    if (legacyTest) return { source: normalizedLayoutSnapshot(legacyTest), sourceName: legacyTest.name, sourceId: legacyTest.id };

    const fallback = [...entries]
      .filter(entry => !isRevokedLayoutSeed(entry) && layoutHasSections(entry))
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)) || String(b.id).localeCompare(String(a.id)))[0];
    if (fallback) return { source: normalizedLayoutSnapshot(fallback), sourceName: fallback.name, sourceId: fallback.id };

    return { source: null, sourceName: '', sourceId: '' };
  }

  function lockedLayoutEntryFromSource(sourceLayout, name, now, existing = null, sourceInfo = {}) {
    return {
      id: existing?.id || `layout_${name.replace(/\s+/g, '_')}_${Date.now().toString(36)}`,
      name,
      createdAt: existing?.createdAt || now,
      updatedAt: existing?.updatedAt || now,
      selectedFoodId: sourceLayout.selectedFoodId || '',
      selectedSectionId: sourceLayout.selectedSectionId || 'intro',
      canvas: clone(sourceLayout.canvas || null),
      meta: {
        ...(sourceLayout.meta || {}),
        ...(existing?.meta || {}),
        lockedLayout: {
          version: LOCKED_LAYOUT_VERSION,
          lockedAt: existing?.meta?.lockedLayout?.lockedAt || now,
          lockedName: name,
          sourceName: existing?.meta?.lockedLayout?.sourceName || sourceInfo.sourceName || '',
          sourceId: existing?.meta?.lockedLayout?.sourceId || sourceInfo.sourceId || ''
        }
      },
      sections: clone(sourceLayout.sections)
    };
  }

  function backupLayoutLockdown(win, entries, sourceLayout, now) {
    try {
      const backupId = `layout_lockdown_backup_${Date.now().toString(36)}`;
      const primaryKey = uniqueSavedLayoutBackupStorageKey(win, '-lockdown');
      const secondaryKey = uniqueSavedLayoutBackupStorageKey(win, '-lockdown-copy');
      const snapshot = {
        id: backupId,
        createdAt: now,
        reason: 'Before locking layout builder copies to test 1 through test 5',
        layouts: clone(entries),
        currentLayout: clone(sourceLayout)
      };
      win.localStorage.setItem(primaryKey, JSON.stringify(snapshot));
      win.localStorage.setItem(secondaryKey, JSON.stringify(snapshot));
      const index = readSavedLayoutBackupIndex(win);
      index.push({
        id: backupId,
        createdAt: now,
        reason: snapshot.reason,
        primaryKey,
        secondaryKey
      });
      win.localStorage.setItem(SAVED_LAYOUT_BACKUP_INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.warn('Could not create layout lockdown backup', error);
    }
  }

  function hasCompleteLockedLayoutSet(entries) {
    return LOCKED_LAYOUT_PRESET_NAMES.every(name => {
      const entry = entries.find(item => savedLayoutNameKey(item.name) === name);
      return entry?.sections && entry.meta?.lockedLayout?.version === LOCKED_LAYOUT_VERSION;
    });
  }

  function ensureLockedLayoutCopies(doc, entries) {
    const win = getFrameWindow();
    if (!win) return entries;
    const now = new Date().toISOString();
    const existingLockedByName = new Map(
      entries
        .filter(entry => isLockedLayoutEntry(entry) && layoutHasSections(entry))
        .map(entry => [savedLayoutNameKey(entry.name), entry])
    );
    const sourceInfo = sourceLayoutForLockedCopies(doc, entries);
    if (!sourceInfo.source) {
      const lockedOnly = sortSavedLayoutEntries(entries.filter(isLockedLayoutEntry));
      persistSavedLayouts(win, lockedOnly);
      return lockedOnly;
    }

    const shouldRewrite = !hasCompleteLockedLayoutSet(entries)
      || entries.some(entry => !isLockedLayoutEntry(entry))
      || entries.length !== LOCKED_LAYOUT_PRESET_NAMES.length;
    if (!shouldRewrite) return sortSavedLayoutEntries(entries.filter(isLockedLayoutEntry));

    backupLayoutLockdown(win, entries, sourceInfo.source, now);
    const lockedEntries = LOCKED_LAYOUT_PRESET_NAMES.map(name => {
      const existing = existingLockedByName.get(name);
      if (existing?.meta?.lockedLayout?.version === LOCKED_LAYOUT_VERSION) return existing;
      return lockedLayoutEntryFromSource(sourceInfo.source, name, now, existing, sourceInfo);
    });
    persistSavedLayouts(win, sortSavedLayoutEntries(lockedEntries));
    return lockedEntries;
  }

  function virtualLockedLayoutEntries(doc) {
    const source = normalizedLayoutSnapshot(currentLayout(doc));
    if (!source) return [];
    const now = source.meta?.updatedAt || new Date().toISOString();
    return LOCKED_LAYOUT_PRESET_NAMES.map((name, index) => ({
      id: `layout_${name.replace(/\s+/g, '_')}_studio_working`,
      name,
      createdAt: now,
      updatedAt: now,
      selectedFoodId: source.selectedFoodId || '',
      selectedSectionId: source.selectedSectionId || 'intro',
      canvas: clone(source.canvas || null),
      meta: {
        ...(source.meta || {}),
        lockedLayout: {
          version: LOCKED_LAYOUT_VERSION,
          lockedAt: now,
          lockedName: name,
          sourceName: 'current universal working layout',
          sourceId: LAYOUT_STORAGE_KEY,
          storageMode: 'virtual',
          lockIndex: index + 1
        }
      },
      sections: clone(source.sections)
    }));
  }

  function savedLayoutsForUi(doc) {
    const win = getFrameWindow();
    if (!win) return [];
    const entries = readSavedLayouts(win);
    if (entries.length) return entries;
    return virtualLockedLayoutEntries(doc);
  }

  function prepareSavedLayoutStorageForBuilder(doc) {
    const win = getFrameWindow();
    if (!win) return null;
    try {
      win.localStorage.removeItem(FOOD_LAYOUTS_KEY);
      win.localStorage.removeItem(SAVED_LAYOUTS_KEY);
    } catch {}
    return savedLayoutsForUi(doc).find(isLockedLayoutEntry) || null;
  }

  function downloadTextFile(doc, filename, text, type = 'application/json') {
    const win = getFrameWindow() || window;
    const blob = new Blob([text], { type });
    const url = win.URL.createObjectURL(blob);
    const link = doc.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    doc.body.appendChild(link);
    link.click();
    link.remove();
    win.setTimeout(() => win.URL.revokeObjectURL(url), 1000);
  }

  function downloadLockedLayoutCopies(doc) {
    const win = getFrameWindow();
    if (!win) return;
    const lockedEntries = sortSavedLayoutEntries(savedLayoutsForUi(doc).filter(isLockedLayoutEntry));
    if (lockedEntries.length !== LOCKED_LAYOUT_PRESET_NAMES.length) {
      setSavedLayoutMessage(doc, 'Current working layout is not ready yet', true);
      return;
    }
    const exportedAt = new Date().toISOString();
    const payload = {
      exportedAt,
      storageKey: SAVED_LAYOUTS_KEY,
      lockVersion: LOCKED_LAYOUT_VERSION,
      names: [...LOCKED_LAYOUT_PRESET_NAMES],
      layouts: clone(lockedEntries)
    };
    downloadTextFile(
      doc,
      `foodranked-layout-builder-locked-test-1-5-${exportedAt.slice(0, 10)}.json`,
      JSON.stringify(payload, null, 2)
    );
    setSavedLayoutMessage(doc, 'Locked layout JSON downloaded');
  }

  function setSavedLayoutMessage(doc, message, isError = false) {
    const node = doc.getElementById(SAVED_LAYOUT_MESSAGE_ID);
    if (!node) return;
    node.textContent = message;
    node.dataset.state = isError ? 'error' : 'success';
  }

  function ensureSavedLayoutControls(doc) {
    const select = doc.getElementById('savedLayoutSelect');
    const saveButton = doc.getElementById('saveSpriteLayout');
    const loadButton = doc.getElementById('loadSpriteLayout');
    const deleteButton = doc.getElementById('deleteSpriteLayout');
    const stack = select?.closest('.stack');
    if (!select || !saveButton || !loadButton || !deleteButton || !stack) return;

    const heading = stack.querySelector('h2');
    if (heading) heading.textContent = 'Saved layouts';
    saveButton.textContent = 'Locked';

    if (!doc.getElementById(SAVED_LAYOUT_NAME_ID)) {
      const label = doc.createElement('label');
      label.textContent = 'Layout name';
      const input = doc.createElement('input');
      input.id = SAVED_LAYOUT_NAME_ID;
      input.type = 'text';
      input.autocomplete = 'off';
      input.placeholder = 'Layout name';
      label.appendChild(input);
      stack.insertBefore(label, select.closest('label'));

      const message = doc.createElement('div');
      message.id = SAVED_LAYOUT_MESSAGE_ID;
      message.className = 'layout-builder-save-message';
      message.setAttribute('aria-live', 'polite');
      stack.insertBefore(message, stack.querySelector('p.tiny.muted'));

      input.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        setSavedLayoutMessage(doc, 'Locked layouts cannot be overwritten', true);
      });
    }

    doc.getElementById('layoutBuilderRestoreTestFromPlacement')?.remove();
    if (!doc.getElementById(LOCKED_LAYOUT_DOWNLOAD_ID)) {
      const downloadButton = doc.createElement('button');
      downloadButton.id = LOCKED_LAYOUT_DOWNLOAD_ID;
      downloadButton.type = 'button';
      downloadButton.textContent = 'Download locked JSON';
      deleteButton.insertAdjacentElement('afterend', downloadButton);
      downloadButton.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        downloadLockedLayoutCopies(doc);
      }, true);
    }

    if (!stack.dataset.layoutBuilderSavedLayoutBound) {
      stack.dataset.layoutBuilderSavedLayoutBound = 'true';
      saveButton.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        setSavedLayoutMessage(doc, 'Locked layouts cannot be overwritten', true);
      }, true);
      loadButton.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        loadSelectedLayoutPreset(doc);
      }, true);
      deleteButton.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        deleteSelectedLayoutPreset(doc);
      }, true);
      select.addEventListener('change', event => {
        event.stopImmediatePropagation();
        selectedSavedLayoutId = select.value;
        populateSelectedLayoutName(doc);
        window.setTimeout(() => populateSelectedLayoutName(doc), 0);
      }, true);
    }

    const canonical = prepareSavedLayoutStorageForBuilder(doc);
    const input = doc.getElementById(SAVED_LAYOUT_NAME_ID);
    if (input) input.readOnly = true;
    saveButton.disabled = true;
    saveButton.textContent = 'Locked';
    if (canonical) selectedSavedLayoutId = canonical.id;

    renderSavedLayoutSelect(doc, canonical?.id || null);
  }

  function renderSavedLayoutSelect(doc, selectedId = null) {
    const win = getFrameWindow();
    const select = doc.getElementById('savedLayoutSelect');
    if (!win || !select) return;

    const currentSelection = selectedId ?? (select.value || selectedSavedLayoutId);
    const entries = savedLayoutsForUi(doc);
    const signature = JSON.stringify(entries.map(entry => [entry.id, entry.name, entry.updatedAt]));
    const nextSignature = `${signature}|${currentSelection}`;
    const optionValues = Array.from(select.options).map(option => [option.value, option.textContent]);
    const hasExpectedOptions = optionValues.length === entries.length + 1
      && optionValues[0]?.[0] === ''
      && entries.every(entry => optionValues.some(([value, text]) => value === entry.id && text === entry.name));
    if (select.dataset.layoutBuilderSignature === nextSignature && hasExpectedOptions) {
      if (entries.some(entry => entry.id === currentSelection)) select.value = currentSelection;
      selectedSavedLayoutId = select.value;
      const hasSelection = !!select.value;
      const selectedEntry = entries.find(entry => entry.id === select.value);
      const loadButton = doc.getElementById('loadSpriteLayout');
      const deleteButton = doc.getElementById('deleteSpriteLayout');
      const saveButton = doc.getElementById('saveSpriteLayout');
      const input = doc.getElementById(SAVED_LAYOUT_NAME_ID);
      if (loadButton) loadButton.disabled = !hasSelection;
      if (deleteButton) deleteButton.disabled = !hasSelection || isLockedLayoutEntry(selectedEntry);
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = 'Locked';
      }
      if (input) {
        input.readOnly = true;
      }
      populateSelectedLayoutName(doc);
      return;
    }

    select.innerHTML = '';

    const placeholder = doc.createElement('option');
    placeholder.value = '';
    placeholder.textContent = entries.length ? 'Select a saved layout' : 'No saved layouts yet';
    select.appendChild(placeholder);

    entries.forEach(entry => {
      const option = doc.createElement('option');
      option.value = entry.id;
      option.textContent = entry.name;
      select.appendChild(option);
    });

    if (entries.some(entry => entry.id === currentSelection)) select.value = currentSelection;
    selectedSavedLayoutId = select.value;

    const hasSelection = !!select.value;
    const selectedEntry = entries.find(entry => entry.id === select.value);
    const loadButton = doc.getElementById('loadSpriteLayout');
    const deleteButton = doc.getElementById('deleteSpriteLayout');
    const saveButton = doc.getElementById('saveSpriteLayout');
    const input = doc.getElementById(SAVED_LAYOUT_NAME_ID);
    if (loadButton) loadButton.disabled = !hasSelection;
    if (deleteButton) deleteButton.disabled = !hasSelection || isLockedLayoutEntry(selectedEntry);
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = 'Locked';
    }
    if (input) {
      input.readOnly = true;
    }
    select.dataset.layoutBuilderSignature = `${signature}|${select.value}`;
    populateSelectedLayoutName(doc);
  }

  function populateSelectedLayoutName(doc) {
    const win = getFrameWindow();
    const input = doc.getElementById(SAVED_LAYOUT_NAME_ID);
    const select = doc.getElementById('savedLayoutSelect');
    if (!win || !input || !select) return;

    const entry = savedLayoutsForUi(doc).find(item => item.id === select.value);
    if (doc.activeElement === input) return;
    input.value = entry ? entry.name : input.value;
  }

  function saveCurrentLayoutPreset(doc) {
    const select = doc.getElementById('savedLayoutSelect');
    setSavedLayoutMessage(doc, 'Locked layouts cannot be overwritten', true);
    renderSavedLayoutSelect(doc, select?.value || selectedSavedLayoutId);
    return;
  }

  function loadSelectedLayoutPreset(doc) {
    const win = getFrameWindow();
    const select = doc.getElementById('savedLayoutSelect');
    const layout = currentLayout(doc);
    if (!win || !select || !layout) return;

    const entry = savedLayoutsForUi(doc).find(item => item.id === select.value);
    if (!entry) {
      setSavedLayoutMessage(doc, 'Select a saved layout', true);
      return;
    }

    const next = {
      ...layout,
      canvas: clone(entry.canvas || layout.canvas || null),
      selectedFoodId: entry.selectedFoodId || layout.selectedFoodId || '',
      selectedSectionId: entry.selectedSectionId || layout.selectedSectionId || 'intro',
      meta: { ...(layout.meta || {}), ...(entry.meta || {}) },
      sections: clone(entry.sections)
    };
    applyLayoutJson(doc, next);
    renderSavedLayoutSelect(doc, entry.id);
    setSavedLayoutMessage(doc, 'Layout loaded');
  }

  function deleteSelectedLayoutPreset(doc) {
    const win = getFrameWindow();
    const select = doc.getElementById('savedLayoutSelect');
    if (!win || !select?.value) {
      setSavedLayoutMessage(doc, 'Select a saved layout', true);
      return;
    }

    const selectedEntry = savedLayoutsForUi(doc).find(entry => entry.id === select.value);
    if (isLockedLayoutEntry(selectedEntry)) {
      renderSavedLayoutSelect(doc, selectedEntry.id);
      setSavedLayoutMessage(doc, 'Locked layout copies are protected from deletion', true);
      return;
    }

    const deletedId = select.value;
    const entries = readSavedLayouts(win).filter(entry => entry.id !== deletedId);
    persistSavedLayouts(win, entries);
    renderSavedLayoutSelect(doc, entries[0]?.id || '');
    setSavedLayoutMessage(doc, 'Layout deleted');
  }

  function hideDisplayBuilderControls(doc) {
    hideStackByChild(doc, '#foodSearch');
    hideStackByChild(doc, '#foodList');
    hideStackByHeading(doc, 'h2', 'Selected food script');
    hideStackByHeading(doc, 'h2', 'Nutritional info');
    hideStackByHeading(doc, 'h3', 'Background motion');
    showStackByHeading(doc, 'h3', 'Move on canvas');
    showStackByHeading(doc, 'h3', 'Size');
    showStackByHeading(doc, 'h3', 'Align');
    showStackByHeading(doc, 'h3', 'Rotate');
    showStackByHeading(doc, 'h3', 'Layer');
    const staleTextSizer = doc.getElementById('layoutBuilderTextSizeTools');
    staleTextSizer?.remove();
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

      body.layout-builder-mode .layer-node.text {
        box-sizing: border-box;
        cursor: text;
        overflow: hidden;
        overflow-wrap: break-word;
        user-select: text;
        white-space: pre-wrap;
        word-break: normal;
      }

      body.layout-builder-mode .layer-node.text[contenteditable="plaintext-only"] {
        caret-color: #ffffff;
      }

      body.layout-builder-mode .app {
        gap: 4px !important;
        padding: 2px !important;
      }

      body.layout-builder-mode .editor {
        align-content: center;
        grid-template-rows: auto !important;
        max-height: none !important;
        padding: 0 !important;
      }

      body.layout-builder-mode .editor > .row:first-child,
      body.layout-builder-mode #canvasMeta,
      body.layout-builder-mode .diagnostics-row {
        display: none !important;
      }

      body.layout-builder-mode .canvas-wrap {
        align-self: center;
        justify-self: center;
        max-width: 100%;
        max-height: none !important;
        padding: 0 !important;
        overflow: visible !important;
      }

      body.layout-builder-mode .canvas-wrap[data-layout-builder-canvas-zoom="true"] .phone-shell {
        transform: scale(var(--layout-builder-canvas-view-zoom, ${CANVAS_VIEW_ZOOM}));
        transform-origin: center center;
        will-change: transform;
      }

      body.layout-builder-mode .layout-builder-index,
      body.layout-builder-mode .layout-builder-save-message {
        color: var(--muted);
        font-size: 12px;
        font-variant-numeric: tabular-nums;
      }

      body.layout-builder-mode .layout-builder-save-message[data-state="success"] {
        color: var(--good);
      }

      body.layout-builder-mode .layout-builder-save-message[data-state="error"] {
        color: var(--warn);
      }

      body.layout-builder-mode #${ROTATE_CARD_ID}[hidden] {
        display: none !important;
      }

      body.layout-builder-mode .layout-builder-drag-ghost {
        align-items: center;
        background: rgba(18, 22, 31, .92);
        border: 1px solid rgba(255, 255, 255, .18);
        border-radius: 8px;
        box-shadow: 0 10px 26px rgba(0, 0, 0, .3);
        color: var(--ink);
        display: inline-flex;
        gap: 8px;
        left: 0;
        max-width: 180px;
        padding: 7px 9px;
        pointer-events: none;
        position: fixed;
        top: 0;
        z-index: 9999;
      }

      body.layout-builder-mode .layout-builder-drag-ghost img {
        height: 32px;
        image-rendering: pixelated;
        object-fit: contain;
        width: 32px;
      }

      body.layout-builder-mode .layout-builder-drag-ghost span {
        font-size: 11px;
        line-height: 1.15;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `;
    doc.head.appendChild(style);
  }

  function updateLayoutBuilderUi(doc) {
    injectModeStyle(doc);
    doc.body.classList.add('layout-builder-mode');

    const heading = doc.querySelector('.sidebar-panel > .stack:first-child h1');
    if (heading) heading.textContent = 'Layout builder';

    hideDisplayBuilderControls(doc);
    syncCanvasToVisibleDisplay(doc);
    syncCanvasViewZoom(doc);
    ensureLayerOrderCard(doc);
    ensureRotateCard(doc);
    ensureSavedLayoutControls(doc);
    bindSelectionFocusExit(doc);
    bindLayerListImmediateSync(doc);
    updateLayerLabels(doc);
    updateLayerOrderCard(doc);
    updateRotateCard(doc);
  }

  function startModeSync() {
    window.clearInterval(syncTimer);
    syncTimer = window.setInterval(() => {
      const doc = getFrameDocument();
      if (doc?.body) updateLayoutBuilderUi(doc);
    }, 250);

    const doc = getFrameDocument();
    if (doc?.body) updateLayoutBuilderUi(doc);
  }

  frame.addEventListener('load', startModeSync);
})();
