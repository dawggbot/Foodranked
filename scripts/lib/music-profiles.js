const { stableChoice } = require('./sfx-profiles');

const MUSIC_PROFILE_VERSION = 1;
const AUTO_MUSIC_SELECTION_MODE = 'auto-stable-v1';

const MUSIC_ROLE_OPTIONS = Object.freeze({
  backgroundMusic: Object.freeze([
    'audio/music/freesound_community_8bit_sample_69080_loop_240s.mp3',
    'audio/music/hauntsync_retro_chiptune_adventure_318059_loop_240s.mp3',
    'audio/music/lucadialessandro_arcade_melody_295434_loop_240s.mp3',
    'audio/music/retro_bgm_chan_low_level_enemy_534609_loop_240s.mp3',
    'audio/music/retro_bgm_chan_vs_robbot_vs_534622_loop_240s.mp3'
  ])
});

const DEFAULT_MUSIC_ROLE_PATHS = Object.freeze(Object.fromEntries(
  Object.entries(MUSIC_ROLE_OPTIONS).map(([role, options]) => [role, options[0]])
));

function normalizeMusicRole(value) {
  if (typeof value === 'string' && value.trim()) return { path: value.trim() };
  if (value && typeof value === 'object' && typeof value.path === 'string' && value.path.trim()) {
    return { ...value, path: value.path.trim() };
  }
  return null;
}

function normalizeMusicProfile(profile) {
  if (!profile || typeof profile !== 'object') return null;
  const normalized = {
    version: Number(profile.version) || MUSIC_PROFILE_VERSION,
    selectionMode: profile.selectionMode || 'manual'
  };
  for (const role of Object.keys(MUSIC_ROLE_OPTIONS)) {
    const value = normalizeMusicRole(profile[role]);
    if (value) normalized[role] = value;
  }
  return normalized;
}

function autoMusicProfile(foodId) {
  const id = String(foodId || '').trim();
  const profile = {
    version: MUSIC_PROFILE_VERSION,
    selectionMode: AUTO_MUSIC_SELECTION_MODE
  };
  for (const [role, options] of Object.entries(MUSIC_ROLE_OPTIONS)) {
    profile[role] = {
      path: stableChoice(options, `foodranked:${AUTO_MUSIC_SELECTION_MODE}:${role}:${id}`)
    };
  }
  return profile;
}

function completeMusicProfile(profile, foodId) {
  if (!profile) return autoMusicProfile(foodId);
  const completed = normalizeMusicProfile(profile) || {
    version: MUSIC_PROFILE_VERSION,
    selectionMode: 'manual'
  };
  if (!completed.version) completed.version = MUSIC_PROFILE_VERSION;
  if (!completed.selectionMode) completed.selectionMode = 'manual';
  for (const [role, path] of Object.entries(DEFAULT_MUSIC_ROLE_PATHS)) {
    if (!completed[role]) completed[role] = { path };
  }
  return completed;
}

module.exports = {
  AUTO_MUSIC_SELECTION_MODE,
  DEFAULT_MUSIC_ROLE_PATHS,
  MUSIC_PROFILE_VERSION,
  MUSIC_ROLE_OPTIONS,
  autoMusicProfile,
  completeMusicProfile
};
