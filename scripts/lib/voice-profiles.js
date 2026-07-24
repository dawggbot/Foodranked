const VOICE_PROFILE_VERSION = 1;
const AUTO_VOICE_SELECTION_MODE = 'auto-stable-v1';
const DEFAULT_NARRATION_MODE = 'random_suitable';
const ADAM_NARRATION_VOLUME = 0.7;

function stableVoiceSeed(foodId) {
  const id = String(foodId || '').trim();
  return `foodranked:${AUTO_VOICE_SELECTION_MODE}:narration:${id}`;
}

function normalizeNarrationVoice(value) {
  if (typeof value === 'string' && value.trim()) return { mode: value.trim() };
  if (!value || typeof value !== 'object') return null;

  const normalized = { ...value };
  if (typeof normalized.mode === 'string') normalized.mode = normalized.mode.trim();
  if (typeof normalized.profileId === 'string') normalized.profileId = normalized.profileId.trim();
  if (typeof normalized.voiceId === 'string') normalized.voiceId = normalized.voiceId.trim();
  if (typeof normalized.voiceLabel === 'string') normalized.voiceLabel = normalized.voiceLabel.trim();
  if (typeof normalized.seed === 'string') normalized.seed = normalized.seed.trim();

  if (!normalized.mode && normalized.profileId) normalized.mode = 'profile';
  if (!normalized.mode && normalized.voiceId) normalized.mode = 'explicit_voice_id';
  if (!normalized.mode) normalized.mode = DEFAULT_NARRATION_MODE;
  return normalized;
}

function normalizeVoiceProfile(profile) {
  if (!profile || typeof profile !== 'object') return null;
  const normalized = {
    version: Number(profile.version) || VOICE_PROFILE_VERSION,
    selectionMode: profile.selectionMode || 'manual'
  };

  const narration = normalizeNarrationVoice(profile.narration || profile.narrator || profile.voice);
  if (narration) normalized.narration = narration;
  return normalized;
}

function autoVoiceProfile(foodId) {
  return {
    version: VOICE_PROFILE_VERSION,
    selectionMode: AUTO_VOICE_SELECTION_MODE,
    narration: {
      mode: DEFAULT_NARRATION_MODE,
      seed: stableVoiceSeed(foodId)
    }
  };
}

function completeVoiceProfile(profile, foodId) {
  if (!profile) return autoVoiceProfile(foodId);
  const completed = normalizeVoiceProfile(profile) || {
    version: VOICE_PROFILE_VERSION,
    selectionMode: 'manual'
  };
  if (!completed.version) completed.version = VOICE_PROFILE_VERSION;
  if (!completed.selectionMode) completed.selectionMode = 'manual';

  if (!completed.narration) {
    completed.narration = autoVoiceProfile(foodId).narration;
  } else if (['random', 'random_suitable'].includes(completed.narration.mode) && !completed.narration.seed) {
    completed.narration.seed = stableVoiceSeed(foodId);
  }
  return completed;
}

function voiceProfileDefaults(profile, foodId) {
  const completed = completeVoiceProfile(profile, foodId);
  const narration = completed.narration || {};
  return {
    profile: narration.profileId || null,
    voice: narration.mode && ['random', 'random_suitable'].includes(narration.mode) ? narration.mode : null,
    voiceId: narration.voiceId || null,
    voiceLabel: narration.voiceLabel || null,
    seed: narration.seed || null
  };
}

function isAdamVoiceLabel(voiceLabel) {
  return /^Adam\b/i.test(String(voiceLabel || '').trim());
}

function configuredNarrationVolumeForVoice(voiceLabel) {
  return isAdamVoiceLabel(voiceLabel) ? ADAM_NARRATION_VOLUME : null;
}

function narrationVolumeMetadata(voiceLabel) {
  const volume = configuredNarrationVolumeForVoice(voiceLabel);
  return volume == null ? {} : { narrationVolume: volume };
}

module.exports = {
  ADAM_NARRATION_VOLUME,
  AUTO_VOICE_SELECTION_MODE,
  DEFAULT_NARRATION_MODE,
  VOICE_PROFILE_VERSION,
  autoVoiceProfile,
  completeVoiceProfile,
  configuredNarrationVolumeForVoice,
  isAdamVoiceLabel,
  narrationVolumeMetadata,
  stableVoiceSeed,
  voiceProfileDefaults
};
