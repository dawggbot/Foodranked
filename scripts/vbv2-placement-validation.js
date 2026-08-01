'use strict';

const PLACEMENT_EXPORT_KEY = 'foodranked-display-builder-v2-placement-layouts-v1';
const REQUIRED_SECTION_IDS = ['intro', 'fats', 'carbs', 'protein', 'vitamins', 'minerals', 'pros', 'cons', 'outro'];
const MACRO_SECTION_IDS = ['fats', 'carbs', 'protein'];
const AUTHOR_GRID = { width: 105, height: 186.666667 };
const REJECTED_PLACEMENT_BUILD_IDS = new Set([
  '20260730-vbv2-canvas-placement-parity-v1',
  '20260731-vbv2-active-tools-v1',
  'mp4-check'
]);

function safeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function validLayout(layout) {
  return !!layout && typeof layout === 'object' && !!layout.sections && typeof layout.sections === 'object';
}

function sectionLayers(layout, sectionId) {
  const layers = layout?.sections?.[sectionId]?.layers;
  return Array.isArray(layers) ? layers : [];
}

function layerFingerprint(layer) {
  return `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
}

function isSpriteLayer(layer) {
  return layer?.kind === 'sprite' && typeof layer.src === 'string';
}

function isSectionIndicator(layer) {
  const fingerprint = layerFingerprint(layer);
  return isSpriteLayer(layer) && (fingerprint.includes('/ui/section_indicator/') || fingerprint.includes('section indicator'));
}

function isMacroBarFrame(layer) {
  return isSpriteLayer(layer) && /(macro_bar_frame|bar_frame|macro bar frame)/.test(layerFingerprint(layer));
}

function isMacroBarFill(layer) {
  return isSpriteLayer(layer) && /(macro_bar_fill|bar_fill|macro bar fill)/.test(layerFingerprint(layer));
}

function placementEntryForFood(payload, food) {
  const layouts = payload?.layouts && typeof payload.layouts === 'object' && !Array.isArray(payload.layouts)
    ? payload.layouts
    : {};
  const foodId = safeSlug(food?.id || food?.name);
  const directKeys = [
    food?.id,
    food?.name,
    foodId,
    payload?.currentFoodId
  ].map(value => String(value || '')).filter(Boolean);
  for (const key of directKeys) {
    if (layouts[key]) return layouts[key];
  }
  return Object.values(layouts).find(entry => safeSlug(entry?.foodId || entry?.foodName) === foodId) || null;
}

function staleSourceStrings(payload, entry, layout) {
  const meta = layout?.meta || {};
  const sourcePlacementMeta = meta.sourcePlacementMeta && typeof meta.sourcePlacementMeta === 'object'
    ? meta.sourcePlacementMeta
    : {};
  return [
    payload?.source,
    payload?.sourceBuilder,
    payload?.key,
    payload?.buildId,
    entry?.source,
    entry?.sourceBuilder,
    entry?.sourceLayoutKey,
    entry?.sourceLayoutName,
    entry?.buildId,
    meta.source,
    meta.sourceBuilder,
    meta.sourceLayoutKey,
    meta.sourceLayoutName,
    meta.sourcePlacementSource,
    meta.sourcePlacementBuilder,
    meta.canonicalLayoutVersion,
    meta.canonicalLayoutSource,
    sourcePlacementMeta.source,
    sourcePlacementMeta.sourceBuilder,
    sourcePlacementMeta.sourceLayoutKey,
    sourcePlacementMeta.sourceLayoutName,
    sourcePlacementMeta.exportBuildId,
    sourcePlacementMeta.canonicalLayoutVersion,
    sourcePlacementMeta.canonicalLayoutSource
  ].map(value => String(value || '').toLowerCase()).filter(Boolean);
}

function stalePlacementReason(payload, entry, layout) {
  const joined = staleSourceStrings(payload, entry, layout).join(' ');
  if (/20260801-current-builder-layout-v1|canonical-test-layout/.test(joined)) return 'revoked layout seed';
  if (/(?:^|\/)default-layout\.js\b|default-layout/.test(joined)) return 'default-layout.js';
  if (/(?:^|\/)docs\/app(?:\/|$)|foodranked-display-builder(?!-v2)/.test(joined)) return 'stale display builder';
  if (/(?:^|\/)display-builder-test(?:\/|$)/.test(joined)) return 'display-builder-test';
  if (/(?:^|\/)video-builder(?:\/|$)|foodranked-video-builder(?!-v2)/.test(joined)) return 'original video builder';
  return '';
}

function adHocPlacementReason(payload, entry, layout) {
  const buildIds = [
    payload?.buildId,
    entry?.buildId,
    layout?.meta?.exportBuildId
  ].map(value => String(value || '').toLowerCase()).filter(Boolean);
  if (buildIds.some(value => value === 'mp4-check')) return 'mp4-check';
  return '';
}

function placementBuildIds(payload, entry, layout) {
  return [
    payload?.buildId,
    entry?.buildId,
    layout?.meta?.exportBuildId,
    layout?.meta?.sourcePlacementMeta?.exportBuildId,
    layout?.meta?.sourcePlacementMeta?.buildId
  ].map(value => String(value || '').toLowerCase()).filter(Boolean);
}

function rejectedBuildReason(payload, entry, layout) {
  const rejected = placementBuildIds(payload, entry, layout)
    .find(value => REJECTED_PLACEMENT_BUILD_IDS.has(value));
  return rejected || '';
}

function positiveNumber(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function layoutBounds(layout) {
  return {
    left: 0,
    top: 0,
    right: positiveNumber(layout?.canvas?.width, AUTHOR_GRID.width),
    bottom: positiveNumber(layout?.canvas?.height, AUTHOR_GRID.height)
  };
}

function layerIntersectsBounds(layer, bounds) {
  const x = Number(layer?.x) || 0;
  const y = Number(layer?.y) || 0;
  const width = positiveNumber(layer?.width || layer?.naturalWidth, 0);
  const height = positiveNumber(layer?.height || layer?.naturalHeight, 0);
  return x < bounds.right
    && x + width > bounds.left
    && y < bounds.bottom
    && y + height > bounds.top;
}

function missingRequiredLayerIssues(layout) {
  const issues = [];
  const missingSections = REQUIRED_SECTION_IDS.filter(sectionId => !Array.isArray(layout?.sections?.[sectionId]?.layers));
  if (missingSections.length) issues.push(`missing sections: ${missingSections.join(', ')}`);

  const bounds = layoutBounds(layout);
  const missingIndicators = REQUIRED_SECTION_IDS.filter(sectionId => {
    return sectionLayers(layout, sectionId).filter(isSectionIndicator).length < REQUIRED_SECTION_IDS.length;
  });
  if (missingIndicators.length) issues.push(`missing section indicators in: ${missingIndicators.join(', ')}`);
  const outOfBoundsIndicators = REQUIRED_SECTION_IDS.filter(sectionId => {
    const indicators = sectionLayers(layout, sectionId).filter(isSectionIndicator);
    return indicators.length && !indicators.some(layer => layerIntersectsBounds(layer, bounds));
  });
  if (outOfBoundsIndicators.length) {
    issues.push(`section indicators outside the MP4 canvas in: ${outOfBoundsIndicators.join(', ')}`);
  }

  const missingMacroBars = [];
  for (const sectionId of MACRO_SECTION_IDS) {
    const layers = sectionLayers(layout, sectionId);
    if (!layers.some(isMacroBarFrame)) missingMacroBars.push(`${sectionId} macro bar frame`);
    if (!layers.some(isMacroBarFill)) missingMacroBars.push(`${sectionId} macro bar fill`);
  }
  if (missingMacroBars.length) issues.push(`missing macro bar layers: ${missingMacroBars.join(', ')}`);
  return issues;
}

function validateVbv2PlacementPayload(payload, food) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('DBv2 placement payload is required.');
  }
  if (payload.key !== PLACEMENT_EXPORT_KEY) {
    throw new Error(`DBv2 placement payload must use ${PLACEMENT_EXPORT_KEY}.`);
  }
  const entry = placementEntryForFood(payload, food);
  const expectedFoodId = safeSlug(food?.id || food?.name);
  if (!entry || safeSlug(entry.foodId || entry.foodName) !== expectedFoodId) {
    throw new Error(`DBv2 placement payload does not include ${expectedFoodId}.`);
  }
  const layout = entry.layout;
  if (!validLayout(layout)) {
    throw new Error(`DBv2 placement for ${expectedFoodId} is missing a valid layout.`);
  }
  const sourceBuilder = String(layout?.meta?.sourceBuilder || entry.sourceBuilder || '').toLowerCase();
  if (!['display-builder-v2', 'video-builder-v2'].includes(sourceBuilder)) {
    throw new Error('DBv2 placement must come from DBv2/VBv2, not a stale builder.');
  }
  const staleReason = stalePlacementReason(payload, entry, layout);
  if (staleReason) {
    throw new Error(`Refusing to render from stale ${staleReason} placement. Open Layout Builder/DBv2/VBv2 and export the current placement.`);
  }
  const adHocReason = adHocPlacementReason(payload, entry, layout);
  if (adHocReason) {
    throw new Error(`Refusing to render from ad-hoc ${adHocReason} placement. Use the live VBv2 download/helper path or a fresh DBv2 placement export.`);
  }
  const rejectedBuild = rejectedBuildReason(payload, entry, layout);
  if (rejectedBuild) {
    throw new Error(`Refusing to render from rejected VBv2 placement build ${rejectedBuild}. Reload VBv2/DBv2 and export the current proof layout.`);
  }
  const layerIssues = missingRequiredLayerIssues(layout);
  if (layerIssues.length) {
    throw new Error(`DBv2 placement is incomplete for VBv2 MP4 export: ${layerIssues.join('; ')}.`);
  }
  return payload;
}

module.exports = {
  PLACEMENT_EXPORT_KEY,
  validateVbv2PlacementPayload
};
