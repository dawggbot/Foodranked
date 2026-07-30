'use strict';

const PLACEMENT_EXPORT_KEY = 'foodranked-display-builder-v2-placement-layouts-v1';
const REQUIRED_SECTION_IDS = ['intro', 'fats', 'carbs', 'protein', 'vitamins', 'minerals', 'pros', 'cons', 'outro'];
const MACRO_SECTION_IDS = ['fats', 'carbs', 'protein'];

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
    sourcePlacementMeta.source,
    sourcePlacementMeta.sourceBuilder,
    sourcePlacementMeta.sourceLayoutKey,
    sourcePlacementMeta.sourceLayoutName,
    sourcePlacementMeta.exportBuildId
  ].map(value => String(value || '').toLowerCase()).filter(Boolean);
}

function stalePlacementReason(payload, entry, layout) {
  const joined = staleSourceStrings(payload, entry, layout).join(' ');
  if (/(?:^|\/)default-layout\.js\b|default-layout/.test(joined)) return 'default-layout.js';
  if (/(?:^|\/)docs\/app(?:\/|$)|foodranked-display-builder(?!-v2)/.test(joined)) return 'stale display builder';
  if (/(?:^|\/)display-builder-test(?:\/|$)/.test(joined)) return 'display-builder-test';
  if (/(?:^|\/)video-builder(?:\/|$)|foodranked-video-builder(?!-v2)/.test(joined)) return 'original video builder';
  return '';
}

function missingRequiredLayerIssues(layout) {
  const issues = [];
  const missingSections = REQUIRED_SECTION_IDS.filter(sectionId => !Array.isArray(layout?.sections?.[sectionId]?.layers));
  if (missingSections.length) issues.push(`missing sections: ${missingSections.join(', ')}`);

  const missingIndicators = REQUIRED_SECTION_IDS.filter(sectionId => {
    return sectionLayers(layout, sectionId).filter(isSectionIndicator).length < REQUIRED_SECTION_IDS.length;
  });
  if (missingIndicators.length) issues.push(`missing section indicators in: ${missingIndicators.join(', ')}`);

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
