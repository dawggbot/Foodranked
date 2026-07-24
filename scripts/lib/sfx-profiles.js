const SFX_PROFILE_VERSION = 1;
const AUTO_SFX_SELECTION_MODE = 'auto-stable-v1';

const SFX_ROLE_OPTIONS = Object.freeze({
  stampImpact: Object.freeze([
    'audio/sfx/stamps/impact_stamp_hit.mp3',
    'audio/sfx/stamps/traditional_stamp_hit.mp3'
  ]),
  sectionTransition: Object.freeze([
    'audio/sfx/transitions/section_transition_whoosh.mp3',
    'audio/sfx/transitions/freesound_community_retro_spell_sfx_85574.mp3'
  ]),
  highlightGlow: Object.freeze([
    'audio/sfx/ui/highlight_glow_loop.mp3',
    'audio/sfx/ui/freesound_community_magical_background_6892.mp3'
  ])
});

const DEFAULT_SFX_ROLE_PATHS = Object.freeze(Object.fromEntries(
  Object.entries(SFX_ROLE_OPTIONS).map(([role, options]) => [role, options[0]])
));

function stableHash(value) {
  let hash = 2166136261;
  for (const char of String(value || '')) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }

  hash ^= hash >>> 16;
  hash = Math.imul(hash, 2246822507) >>> 0;
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 3266489909) >>> 0;
  hash ^= hash >>> 16;
  return hash >>> 0;
}

function stableChoice(options, seed) {
  if (!Array.isArray(options) || !options.length) return null;
  return options[stableHash(seed) % options.length];
}

function normalizeSfxRole(value) {
  if (typeof value === 'string' && value.trim()) return { path: value.trim() };
  if (value && typeof value === 'object' && typeof value.path === 'string' && value.path.trim()) {
    return { ...value, path: value.path.trim() };
  }
  return null;
}

function normalizeSfxProfile(profile) {
  if (!profile || typeof profile !== 'object') return null;
  const normalized = {
    version: Number(profile.version) || SFX_PROFILE_VERSION,
    selectionMode: profile.selectionMode || 'manual'
  };
  for (const role of Object.keys(SFX_ROLE_OPTIONS)) {
    const value = normalizeSfxRole(profile[role]);
    if (value) normalized[role] = value;
  }
  return normalized;
}

function autoSfxProfile(foodId) {
  const id = String(foodId || '').trim();
  const profile = {
    version: SFX_PROFILE_VERSION,
    selectionMode: AUTO_SFX_SELECTION_MODE
  };
  for (const [role, options] of Object.entries(SFX_ROLE_OPTIONS)) {
    profile[role] = {
      path: stableChoice(options, `foodranked:${AUTO_SFX_SELECTION_MODE}:${role}:${id}`)
    };
  }
  return profile;
}

function completeSfxProfile(profile, foodId) {
  if (!profile) return autoSfxProfile(foodId);
  const completed = normalizeSfxProfile(profile) || {
    version: SFX_PROFILE_VERSION,
    selectionMode: 'manual'
  };
  if (!completed.version) completed.version = SFX_PROFILE_VERSION;
  if (!completed.selectionMode) completed.selectionMode = 'manual';
  for (const [role, path] of Object.entries(DEFAULT_SFX_ROLE_PATHS)) {
    if (!completed[role]) completed[role] = { path };
  }
  return completed;
}

module.exports = {
  AUTO_SFX_SELECTION_MODE,
  DEFAULT_SFX_ROLE_PATHS,
  SFX_PROFILE_VERSION,
  SFX_ROLE_OPTIONS,
  autoSfxProfile,
  completeSfxProfile,
  stableChoice,
  stableHash
};
