(function () {
  const DISPLAY_BUILDER_V2_STATE_KEY = 'foodranked-display-builder-v2-state-v1';
  const DISPLAY_BUILDER_V2_PLACEMENT_EXPORT_KEY = 'foodranked-display-builder-v2-placement-layouts-v1';
  const VIDEO_STATE_KEY = 'foodranked-video-builder-v2-state-v1';
  const BUILDER_BUILD_ID = '20260724-v2-d-tier-death-fallback-v1';
  const AUTHOR_GRID = { width: 135, height: 240 };
  const ROOT_SPRITE_BASE = './sprites';
  const SPRITE_LIBRARY_DEFAULT_DROP_SCALE = 0.75;
  const SECTION_INDICATOR_RENDER_SEAM_BLEED_PX = 0.75;
  const CAPTION_SAFE_X = 7;
  const CAPTION_MAX_LINES = 2;
  const CAPTION_MAX_LINE_CHARS = 18;
  const CAPTION_SUMMARY_LINE_CHARS = 24;
  const CAPTION_TIER_LINE_CHARS = 28;
  const CAPTION_WORD_LOOKAHEAD_SECONDS = 0.002;
  const NARRATION_VOLUME = 1;
  const ADAM_NARRATION_VOLUME = 0.7;
  const AUDIO_REVEAL_LEAD_SECONDS = 0.11;
  const AUDIO_REVEAL_WINDOW_SECONDS = 0.36;
  const SUBMACRO_REVEAL_WINDOW_SECONDS = 1.25;
  const SUBMACRO_REVEAL_WINDOW_MAX_PROGRESS = 0.28;
  const SECTION_NARRATION_AFTER_REVEAL_PAD_SECONDS = 0.03;
  const PRO_CON_ROW_REVEAL_SECONDS = 0.18;
  const PRO_CON_ROW_STEP_SECONDS = 0.24;
  const PRO_CON_NARRATION_AFTER_REVEAL_PAD_SECONDS = 0.18;
  const MICRON_GRAPH_REVEAL_SECONDS = 0.08;
  const MICRON_BAR_AFTER_GRAPH_SECONDS = 0.38;
  const MICRON_BAR_STEP_SECONDS = 0.16;
  const MICRON_STAMP_REVEAL_SECONDS = 0.28;
  const MICRON_BAR_STAMP_REVEAL_SECONDS = 0.16;
  const MICRON_VALUE_AFTER_BAR_SECONDS = 0.08;
  const MICRON_100_FIREWORK_SECONDS = 1.35;
  const MICRON_100_FIREWORK_SPARKS = [
    { x: -7.8, y: -7.2, color: '#fff7b0' },
    { x: -3.6, y: -10.4, color: '#ffffff' },
    { x: 1.4, y: -10.8, color: '#7cf2a7' },
    { x: 6.8, y: -7.0, color: '#fff7b0' },
    { x: 8.8, y: -1.4, color: '#88d7ff' },
    { x: 5.2, y: 4.8, color: '#ffffff' },
    { x: -1.6, y: 6.2, color: '#7cf2a7' },
    { x: -7.5, y: 2.4, color: '#88d7ff' },
    { x: -9.4, y: -2.8, color: '#ffffff' },
    { x: 9.6, y: 3.3, color: '#fff7b0' },
    { x: -4.8, y: 7.5, color: '#fff7b0' },
    { x: 3.2, y: 8.0, color: '#88d7ff' }
  ];
  const MAJOR_PRO_SPARKLES = [
    { x: -10.2, y: -5.5, color: '#fff8be', size: 1.5, delay: 0.00 },
    { x: -6.8, y: 3.4, color: '#ffffff', size: 1.2, delay: 0.08 },
    { x: -1.9, y: -8.5, color: '#7cf2a7', size: 1.35, delay: 0.13 },
    { x: 3.8, y: 5.6, color: '#fff8be', size: 1.1, delay: 0.20 },
    { x: 8.6, y: -3.9, color: '#ffffff', size: 1.45, delay: 0.05 },
    { x: 12.0, y: 2.8, color: '#88d7ff', size: 1.15, delay: 0.18 },
    { x: -12.4, y: 7.6, color: '#7cf2a7', size: 1.0, delay: 0.27 },
    { x: -4.4, y: 9.0, color: '#fff8be', size: 1.35, delay: 0.32 },
    { x: 6.0, y: -9.2, color: '#ffffff', size: 1.0, delay: 0.24 },
    { x: 11.0, y: 8.2, color: '#fff8be', size: 1.25, delay: 0.36 },
    { x: -8.6, y: -1.6, color: '#ffffff', size: 1.1, delay: 0.42 },
    { x: -0.6, y: 8.4, color: '#88d7ff', size: 1.05, delay: 0.48 },
    { x: 4.9, y: -5.8, color: '#fff8be', size: 1.32, delay: 0.54 },
    { x: 13.4, y: -0.4, color: '#7cf2a7', size: 1.08, delay: 0.60 }
  ];
  const MAJOR_CON_SIREN_BEAMS = [
    { y: 0.20, width: 0.62, height: 2.0, delay: 0.00 },
    { y: 0.50, width: 0.78, height: 2.5, delay: 0.18 },
    { y: 0.78, width: 0.58, height: 1.8, delay: 0.36 }
  ];
  const STAMP_REVEAL_SECONDS = 0.36;
  const OUTRO_TIER_STAMP_REVEAL_SECONDS = STAMP_REVEAL_SECONDS;
  const OUTRO_TIER_REVEAL_LEAD_SECONDS = 0.12;
  const OUTRO_FINAL_REVEAL_BREATH_SECONDS = 1;
  const TEXT_LAYER_LINE_HEIGHT = 1.15;
  const FOOD_STAMP_REVEAL_SECONDS = 0.22;
  const STAMP_SHAKE_MAX_PIXELS = 2.8;
  const STAMP_SFX_PATH = 'audio/sfx/stamps/impact_stamp_hit.mp3';
  const STAMP_SFX_VOLUME = 0.18;
  const STAMP_SFX_VOLUME_VARIATION = 0;
  const INTRO_FOOD_STAMP_SFX_LEAD_SECONDS = 0.2;
  const STAMP_SFX_PLAYBACK_RATE_RANGE = { min: 0.93, max: 1.07 };
  const STAMP_SFX_START_OFFSET_RANGE_SECONDS = { min: 0, max: 0.045 };
  const STAMP_SFX_LEAD_SECONDS = 0.1;
  const STAMP_SFX_POOL_SIZE = 4;
  const S_TIER_STAMP_SFX_PATH = 'audio/sfx/stamps/s_tier_stamp_level_up.mp3';
  const S_TIER_STAMP_SFX_VOLUME = 0.36;
  const S_TIER_STAMP_SFX_LEAD_SECONDS = 0.16;
  const S_TIER_STAMP_SFX_POOL_SIZE = 2;
  const D_TIER_GAME_LOSE_SFX_PATH = 'audio/sfx/stamps/d_tier_game_lose.mp3';
  const D_TIER_DEATH_SFX_PATH = 'audio/sfx/stamps/d_tier_death_collapse.mp3';
  const D_TIER_GAME_LOSE_SFX_VOLUME = 0.28;
  const D_TIER_DEATH_SFX_VOLUME = 0.28;
  const D_TIER_GAME_LOSE_SFX_LEAD_SECONDS = 0.5;
  const D_TIER_GAME_LOSE_SFX_DURATION_SECONDS = 4.284;
  const D_TIER_DEATH_SFX_DELAY_SECONDS = D_TIER_GAME_LOSE_SFX_DURATION_SECONDS / 2;
  const D_TIER_STAMP_SFX_POOL_SIZE = S_TIER_STAMP_SFX_POOL_SIZE;
  const SECTION_TRANSITION_SFX_PATH = 'audio/sfx/transitions/section_transition_whoosh.mp3';
  const SECTION_TRANSITION_SFX_VOLUME = 0.22;
  const SECTION_TRANSITION_SFX_MAX_VOLUME = 2;
  const SECTION_TRANSITION_SFX_POOL_SIZE = 3;
  const MICRON_BAR_CONFIRM_SFX_PATH = 'audio/sfx/sections/microns/micron_bar_confirm_tap.mp3';
  const MICRON_BAR_CONFIRM_SFX_VOLUME = 0.22;
  const MICRON_BAR_CONFIRM_SFX_POOL_SIZE = 8;
  const MICRON_BAR_CONFIRM_SFX_PLAY_SECONDS = 0.18;
  const MICRON_BAR_CONFIRM_SFX_PLAYBACK_RATE_RANGE = { min: 0.78, max: 1.58 };
  const MICRON_100_FIREWORK_LEAD_SFX_PATH = 'audio/sfx/sections/microns/micron_100_firework_lead_pop.mp3';
  const MICRON_100_FIREWORK_LEAD_SFX_VOLUME = 0.2;
  const MICRON_100_FIREWORK_LEAD_SFX_SECONDS = 0.06;
  const MICRON_100_FIREWORK_LEAD_SFX_POOL_SIZE = 2;
  const MICRON_100_FIREWORK_SFX_PATH = 'audio/sfx/sections/microns/micron_100_firework_cluster.mp3';
  const MICRON_100_FIREWORK_SFX_VOLUME = 0.28;
  const MICRON_100_FIREWORK_CLUSTER_SFX_DELAY_SECONDS = 0.22;
  const MICRON_100_FIREWORK_SFX_POOL_SIZE = 2;
  const MAJOR_PRO_SPARKLE_SFX_PATH = 'audio/sfx/sections/pros/major_pro_sparkle_shine.mp3';
  const MAJOR_PRO_SPARKLE_SFX_VOLUME = 0.24;
  const MAJOR_PRO_SPARKLE_SFX_POOL_SIZE = 4;
  const MAJOR_CON_SIREN_SFX_PATH = 'audio/sfx/sections/cons/major_con_siren_buzzer.mp3';
  const MAJOR_CON_SIREN_SFX_VOLUME = 0.20;
  const MAJOR_CON_SIREN_SFX_POOL_SIZE = 4;
  const HIGHLIGHT_GLOW_SFX_PATH = 'audio/sfx/ui/highlight_glow_loop.mp3';
  const HIGHLIGHT_GLOW_SFX_VOLUME = 0.36;
  const HIGHLIGHT_GLOW_SFX_FADE_IN_SPEED = 5.2;
  const HIGHLIGHT_GLOW_SFX_FADE_OUT_SPEED = 3.4;
  const HIGHLIGHT_GLOW_SFX_PLAYBACK_RATE_FADE_SPEED = 4.8;
  const HIGHLIGHT_GLOW_SFX_PLAYBACK_RATE_RANGES = {
    green: { min: 1.16, max: 1.42 },
    red: { min: 0.58, max: 0.82 },
    neutral: { min: 0.9, max: 1.12 }
  };
  const HIGHLIGHT_GLOW_SFX_MIN_RATE_CHANGE = 0.12;
  const HIGHLIGHT_GLOW_SFX_STOP_THRESHOLD = 0.0015;
  const SFX_ASSET_SETTINGS = Object.freeze({
    'audio/sfx/stamps/impact_stamp_hit.mp3': {
      stampImpact: {
        volume: STAMP_SFX_VOLUME,
        volumeVariation: STAMP_SFX_VOLUME_VARIATION,
        introLeadSeconds: INTRO_FOOD_STAMP_SFX_LEAD_SECONDS,
        leadSeconds: STAMP_SFX_LEAD_SECONDS,
        playbackRateRange: STAMP_SFX_PLAYBACK_RATE_RANGE,
        startOffsetRangeSeconds: STAMP_SFX_START_OFFSET_RANGE_SECONDS
      }
    },
    'audio/sfx/stamps/traditional_stamp_hit.mp3': {
      stampImpact: {
        volume: 0.45,
        volumeVariation: STAMP_SFX_VOLUME_VARIATION,
        introLeadSeconds: INTRO_FOOD_STAMP_SFX_LEAD_SECONDS,
        leadSeconds: STAMP_SFX_LEAD_SECONDS,
        playbackRateRange: STAMP_SFX_PLAYBACK_RATE_RANGE,
        startOffsetSeconds: 0.54
      }
    },
    'audio/sfx/stamps/s_tier_stamp_level_up.mp3': {
      sTierStamp: {
        volume: S_TIER_STAMP_SFX_VOLUME,
        leadSeconds: S_TIER_STAMP_SFX_LEAD_SECONDS,
        poolSize: S_TIER_STAMP_SFX_POOL_SIZE,
        startOffsetSeconds: 0,
        playbackRate: 1
      }
    },
    'audio/sfx/stamps/d_tier_game_lose.mp3': {
      dTierGameLose: {
        volume: D_TIER_GAME_LOSE_SFX_VOLUME,
        leadSeconds: D_TIER_GAME_LOSE_SFX_LEAD_SECONDS,
        durationSeconds: D_TIER_GAME_LOSE_SFX_DURATION_SECONDS,
        deathDelaySeconds: D_TIER_DEATH_SFX_DELAY_SECONDS,
        poolSize: D_TIER_STAMP_SFX_POOL_SIZE,
        startOffsetSeconds: 0,
        playbackRate: 1
      }
    },
    'audio/sfx/stamps/d_tier_death_collapse.mp3': {
      dTierDeath: {
        volume: D_TIER_DEATH_SFX_VOLUME,
        poolSize: D_TIER_STAMP_SFX_POOL_SIZE,
        startOffsetSeconds: 0,
        playbackRate: 1
      }
    },
    'audio/sfx/transitions/section_transition_whoosh.mp3': {
      sectionTransition: {
        volume: SECTION_TRANSITION_SFX_VOLUME,
        maxVolume: SECTION_TRANSITION_SFX_MAX_VOLUME,
        timeOffsetSeconds: 0
      }
    },
    'audio/sfx/transitions/freesound_community_retro_spell_sfx_85574.mp3': {
      sectionTransition: {
        volume: 1.5,
        maxVolume: SECTION_TRANSITION_SFX_MAX_VOLUME,
        timeOffsetSeconds: 0
      }
    },
    'audio/sfx/ui/highlight_glow_loop.mp3': {
      highlightGlow: {
        volume: HIGHLIGHT_GLOW_SFX_VOLUME,
        fadeInSpeed: HIGHLIGHT_GLOW_SFX_FADE_IN_SPEED,
        fadeOutSpeed: HIGHLIGHT_GLOW_SFX_FADE_OUT_SPEED,
        playbackRateFadeSpeed: HIGHLIGHT_GLOW_SFX_PLAYBACK_RATE_FADE_SPEED,
        playbackRateRanges: HIGHLIGHT_GLOW_SFX_PLAYBACK_RATE_RANGES,
        minRateChange: HIGHLIGHT_GLOW_SFX_MIN_RATE_CHANGE,
        stopThreshold: HIGHLIGHT_GLOW_SFX_STOP_THRESHOLD
      }
    },
    'audio/sfx/ui/freesound_community_magical_background_6892.mp3': {
      highlightGlow: {
        volume: HIGHLIGHT_GLOW_SFX_VOLUME,
        fadeInSpeed: HIGHLIGHT_GLOW_SFX_FADE_IN_SPEED,
        fadeOutSpeed: HIGHLIGHT_GLOW_SFX_FADE_OUT_SPEED,
        playbackRateFadeSpeed: HIGHLIGHT_GLOW_SFX_PLAYBACK_RATE_FADE_SPEED,
        playbackRateRanges: HIGHLIGHT_GLOW_SFX_PLAYBACK_RATE_RANGES,
        minRateChange: HIGHLIGHT_GLOW_SFX_MIN_RATE_CHANGE,
        stopThreshold: HIGHLIGHT_GLOW_SFX_STOP_THRESHOLD
      }
    }
  });
  const MACRO_BAR_FILL_SFX_PATH = 'audio/sfx/sections/macros/macro_bar_fill_highscore.mp3';
  const MACRO_BAR_FILL_SFX_SOURCE_SECONDS = 9.408;
  const MACRO_BAR_FILL_SFX_VOLUME = 0.31;
  const MACRO_BAR_FILL_SFX_GAIN = 0.31;
  const MACRO_BAR_FILL_SFX_FILTER_HZ = 3600;
  const MACRO_BAR_FILL_SFX_FILTER_Q = 0.25;
  const MACRO_BAR_FILL_SFX_POOL_SIZE = 1;
  const MACRO_BAR_FILL_SFX_FADE_IN_SECONDS = 0.045;
  const MACRO_BAR_FILL_SFX_FADE_OUT_SECONDS = 0.18;
  const MACRO_BAR_FILL_SFX_ENVELOPE_STEPS = 96;
  const AUDIO_TIMELINE_SYNC_TOLERANCE_SECONDS = 0.12;
  const SPLIT_AUDIO_SCENE_SYNC_TOLERANCE_SECONDS = 0.005;
  const SPLIT_AUDIO_SCENE_TAIL_GUARD_SECONDS = 0.18;
  const SPLIT_AUDIO_OUTRO_TAIL_GUARD_SECONDS = 2;
  const SPLIT_AUDIO_REPLAY_END_MARGIN_SECONDS = 0.08;
  const SPLIT_AUDIO_FINAL_REVEAL_END_MARGIN_SECONDS = 0;
  const SPLIT_AUDIO_FINAL_REVEAL_START_GRACE_SECONDS = 0.22;
  const INTRO_RANKED_AFTER_FOOD_GAP_SECONDS = 0.32;
  const INTRO_RANKED_WORD_LEAD_SECONDS = 0.08;
  const SECTION_HOLD_SECONDS = 0.5;
  const OUTRO_HOLD_SECONDS = 0;
  const SECTION_HOLD_IDS = new Set(['intro', 'fats', 'carbs', 'protein', 'vitamins', 'minerals', 'pros', 'cons']);
  const HIDDEN_CAPTION_SECTION_IDS = new Set(['intro']);
  const MACRO_REVEAL_SECONDS = 0.08;
  const MACRO_HEAD_REVEAL_SECONDS = 0.22;
  const MACRO_BAR_START_DWELL_SECONDS = 0.5;
  const MACRO_BAR_FILL_SECONDS = 1.55;
  const MACRO_BAR_LAST_QUARTER_DURATION_MULTIPLIER = 1.65;
  const MACRO_BAR_LAST_QUARTER_END_SPEED_RATIO = 0.42;
  const MACRO_BAR_GIF_NATIVE_SECONDS = 8.1;
  const MACRO_BAR_FULL_SFX_SOURCE_SECONDS = Math.min(MACRO_BAR_FILL_SFX_SOURCE_SECONDS, MACRO_BAR_GIF_NATIVE_SECONDS);
  const MACRO_BAR_MIN_VISIBLE_FILL_RATIO = 0.0011;
  const MACRO_ROW_AFTER_BAR_SECONDS = 0.14;
  const MACRO_BAR_GIF_FRAME_STEPS = 80;
  const MACRO_BAR_GIF_FINAL_HOLD_CENTISECONDS = 65535;
  const INTRO_RANKED_SPRITE_PATH = './sprites/ui/intro_&_outro/ranked.png';
  const OUTRO_TIER_SPRITE_PATHS = Object.freeze({
    S: './sprites/ui/intro_&_outro/S_tier.png',
    A: './sprites/ui/intro_&_outro/A_tier.png',
    B: './sprites/ui/intro_&_outro/B_tier.png',
    C: './sprites/ui/intro_&_outro/C_tier.png',
    D: './sprites/ui/intro_&_outro/D_tier.png'
  });
  const OUTRO_TIER_GLOW_RGB = Object.freeze({
    S: '255, 238, 154',
    A: '112, 218, 255',
    B: '124, 242, 167',
    C: '246, 198, 95',
    D: '255, 113, 113'
  });
  const OUTRO_LIKE_SPRITE_PATH = './sprites/ui/intro_&_outro/like.png';
  const OUTRO_FOLLOW_SPRITE_PATH = './sprites/ui/intro_&_outro/follow.png';
  const OUTRO_SHARE_SPRITE_PATH = './sprites/ui/intro_&_outro/share.png';
  const INTRO_RANKED_VISIBLE_CENTER = { x: 0.5, y: 0.47 };
  const INTRO_HERO_SIZE = { ranked: 80, foodWidth: 48, foodHeight: 24 };
  const OUTRO_TIER_STAMP_SIZE = 78;
  const OUTRO_TIER_STAMP_ASSET_SIZE = 50;
  const OUTRO_CTA_STAMP_ASSET_SIZE = 15;
  const OUTRO_CTA_STAMP_SCALE = 0.5;
  const OUTRO_CTA_STAMP_SIZE = OUTRO_TIER_STAMP_SIZE * (OUTRO_CTA_STAMP_ASSET_SIZE / OUTRO_TIER_STAMP_ASSET_SIZE) * OUTRO_CTA_STAMP_SCALE;
  const OUTRO_CTA_STAMP_GAP_X = (OUTRO_TIER_STAMP_SIZE - (OUTRO_CTA_STAMP_SIZE * 3)) / 2;
  const OUTRO_CTA_STAMP_GAP_Y = 4;
  const OUTRO_CTA_STAMP_CENTER_Y = (OUTRO_TIER_STAMP_SIZE / 2) + OUTRO_CTA_STAMP_GAP_Y + (OUTRO_CTA_STAMP_SIZE / 2);
  const OUTRO_TIER_STAMP_ID = 'outro_tier_stamp';
  const OUTRO_TIER_STAMP_LEGACY_ID = 'outro_d_tier_stamp';
  const OUTRO_CTA_STAMP_ORDER = ['outro_like_stamp', 'outro_follow_stamp', 'outro_share_stamp'];
  const OUTRO_CTA_STAMP_IDS = new Set(OUTRO_CTA_STAMP_ORDER);
  const OUTRO_FINAL_REVEAL_STAMP_IDS = new Set([
    OUTRO_TIER_STAMP_ID,
    OUTRO_TIER_STAMP_LEGACY_ID,
    ...OUTRO_CTA_STAMP_ORDER
  ]);
  const OUTRO_S_TIER_PREMIUM_GLIMMERS = [
    { id: 'outro_s_tier_premium_glimmer_1', text: '*', offsetX: -36, offsetY: -33, size: 9, color: '#fff7b0', delay: 0.00 },
    { id: 'outro_s_tier_premium_glimmer_2', text: '+', offsetX: 36, offsetY: -25, size: 8, color: '#ffffff', delay: 0.12 },
    { id: 'outro_s_tier_premium_glimmer_3', text: '+', offsetX: -32, offsetY: 28, size: 8, color: '#7cf2a7', delay: 0.24 },
    { id: 'outro_s_tier_premium_glimmer_4', text: '*', offsetX: 34, offsetY: 31, size: 10, color: '#fff7b0', delay: 0.36 },
    { id: 'outro_s_tier_premium_glimmer_5', text: '*', offsetX: 0, offsetY: -42, size: 8, color: '#ffffff', delay: 0.18 },
    { id: 'outro_s_tier_premium_glimmer_6', text: '+', offsetX: 42, offsetY: 4, size: 7, color: '#88d7ff', delay: 0.30 }
  ];
  const OUTRO_CTA_WAVE_START_SECONDS = 0.18;
  const OUTRO_CTA_WAVE_STAGGER_SECONDS = 0.16;
  const OUTRO_CTA_WAVE_CYCLE_SECONDS = 1.05;
  const OUTRO_CTA_WAVE_PULSE_SECONDS = 0.46;
  const OUTRO_CTA_WAVE_LIFT = 2.2;
  const OUTRO_CTA_WAVE_SCALE = 0.14;
  const AVAILABLE_FOOD_IMAGE_IDS = new Set(['bacon', 'kale']);
  const FOOD_IMAGE_BACON_REFERENCE = {
    x: 8,
    y: 10,
    width: 23,
    height: 10,
    naturalWidth: 30,
    naturalHeight: 13
  };
  const FOOD_IMAGE_REFERENCE_SCALE = FOOD_IMAGE_BACON_REFERENCE.width / FOOD_IMAGE_BACON_REFERENCE.naturalWidth;
  const FOOD_IMAGE_REFERENCE_CENTER = {
    x: FOOD_IMAGE_BACON_REFERENCE.x + (FOOD_IMAGE_BACON_REFERENCE.width / 2),
    y: FOOD_IMAGE_BACON_REFERENCE.y + (FOOD_IMAGE_BACON_REFERENCE.height / 2)
  };
  const FOOD_IMAGE_SPRITE_SIZES = {
    bacon: { width: 30, height: 13 },
    kale: { width: 30, height: 30 }
  };
  const SUBMACRO_VALUE_COLORS = {
    green: '#7cf2a7',
    red: '#ff6f6f',
    neutral: '#ffffff'
  };
  const MACRO_BAR_GIF_SOURCE_CACHE = new Map();
  const MACRO_BAR_GIF_FRAME_CACHE = new Map();

  const DISPLAY_SCHEMA = window.FOODRANKED_DISPLAY_SCHEMA || {};

  const SECTIONS = [
    { id: 'intro', label: 'Hook', duration: 2.4, reveal: 'pop' },
    { id: 'fats', label: 'Fats', duration: 4.2, reveal: 'cascade' },
    { id: 'carbs', label: 'Carbs', duration: 3.8, reveal: 'cascade' },
    { id: 'protein', label: 'Protein', duration: 4.2, reveal: 'cascade' },
    { id: 'vitamins', label: 'Vitamins', duration: 3.6, reveal: 'wipe' },
    { id: 'minerals', label: 'Minerals', duration: 3.6, reveal: 'wipe' },
    { id: 'pros', label: 'Pros', duration: 5.2, reveal: 'slide' },
    { id: 'cons', label: 'Cons', duration: 5.2, reveal: 'slide' },
    { id: 'outro', label: 'Verdict', duration: 4.0, reveal: 'pop' }
  ];

  const VITAMIN_TEXT_SPECS = [
    { key: 'vitamin_a_dv', shortLabel: 'A' },
    { key: 'vitamin_c_dv', shortLabel: 'C' },
    { key: 'vitamin_d_dv', shortLabel: 'D' },
    { key: 'vitamin_e_dv', shortLabel: 'E' },
    { key: 'vitamin_k_dv', shortLabel: 'K' },
    { key: 'vitamin_b12_dv', shortLabel: 'B12' }
  ];

  const MINERAL_TEXT_SPECS = [
    { key: 'calcium_dv', shortLabel: 'Ca' },
    { key: 'iron_dv', shortLabel: 'Fe' },
    { key: 'magnesium_dv', shortLabel: 'Mg' },
    { key: 'potassium_dv', shortLabel: 'K' },
    { key: 'zinc_dv', shortLabel: 'Zn' }
  ];

  const MACRO_SUBMETRIC_SPECS = {
    fats: [
      { key: 'saturated_fat_g', label: 'SAT FAT', value: food => formatMacroMetric(food, 'fats', 'saturated_fat_g', 'g') },
      { key: 'polyunsaturated_fat_g', label: 'POLY FAT', value: food => formatMacroMetric(food, 'fats', 'polyunsaturated_fat_g', 'g') },
      { key: 'omega3_mg', label: 'OMEGA 3', value: food => formatMacroMetric(food, 'fats', 'omega3_mg', 'mg') },
      { key: 'cholesterol_mg', label: 'CHOLEST.', value: food => formatMacroMetric(food, 'fats', 'cholesterol_mg', 'mg') }
    ],
    carbs: [
      { key: 'fibre_g', label: 'FIBRE', value: food => formatMacroMetric(food, 'carbs', 'fibre_g', 'g') },
      { key: 'sugar_g', label: 'SUGAR', value: food => formatMacroMetric(food, 'carbs', 'sugar_g', 'g') },
      { key: 'starch_g', label: 'STARCH', value: food => formatMacroMetric(food, 'carbs', 'starch_g', 'g') },
      { key: 'glycemic_index', label: 'GI', value: food => formatMacroMetric(food, 'carbs', 'glycemic_index', '') }
    ],
    protein: [
      { key: 'collagen_g', label: 'COLLAGEN', value: food => formatMacroMetric(food, 'protein', 'collagen_g', 'g') },
      { key: 'essential_amino_acids_score', label: 'EAA', value: food => formatMacroRatio(food, 'protein', 'essential_amino_acids_score', 9) },
      { key: 'nonessential_amino_acids_score', label: 'NEAA', value: food => formatMacroRatio(food, 'protein', 'nonessential_amino_acids_score', 11) },
      { key: 'bioavailability_percent', label: 'BIOAVAIL.', value: food => formatMacroMetric(food, 'protein', 'bioavailability_percent', '%') }
    ]
  };
  const METRIC_SHORT_LABELS = {
    saturated_fat_g: 'SAT FAT',
    polyunsaturated_fat_g: 'POLY FAT',
    omega3_mg: 'OMEGA 3',
    cholesterol_mg: 'CHOLEST.',
    fibre_g: 'FIBRE',
    sugar_g: 'SUGAR',
    starch_g: 'STARCH',
    glycemic_index: 'GI',
    collagen_g: 'COLLAGEN',
    essential_amino_acids_score: 'EAA',
    nonessential_amino_acids_score: 'NEAA',
    bioavailability_percent: 'BIOAVAIL.'
  };
  const PROTEIN_QUALITY_METRIC_KEYS = new Set([
    'essential_amino_acids_score',
    'nonessential_amino_acids_score',
    'bioavailability_percent'
  ]);

  const METRIC_SPEECH_TERMS = {
    saturated_fat_g: ['saturated fat', 'sat fat'],
    polyunsaturated_fat_g: ['polyunsaturated fat', 'polyunsaturated', 'poly fat'],
    omega3_mg: ['omega 3', 'omega3'],
    cholesterol_mg: ['cholesterol'],
    fibre_g: ['fibre', 'fiber'],
    sugar_g: ['sugar'],
    starch_g: ['starch'],
    glycemic_index: ['glycemic index', 'gi'],
    collagen_g: ['collagen'],
    essential_amino_acids_score: ['essential amino', 'eaa'],
    nonessential_amino_acids_score: ['nonessential amino', 'non essential amino', 'n eaa'],
    bioavailability_percent: ['bioavailability'],
    vitamin_a_dv: ['vitamin a'],
    vitamin_c_dv: ['vitamin c'],
    vitamin_d_dv: ['vitamin d'],
    vitamin_e_dv: ['vitamin e'],
    vitamin_k_dv: ['vitamin k'],
    vitamin_b12_dv: ['vitamin b12', 'b12'],
    calcium_dv: ['calcium'],
    iron_dv: ['iron'],
    magnesium_dv: ['magnesium'],
    potassium_dv: ['potassium'],
    zinc_dv: ['zinc']
  };

  const SECTION_ANCHOR_TERMS = {
    fats: ['fat', 'saturated fat', 'fat quality'],
    carbs: ['carbs', 'lackluster'],
    protein: ['protein', 'protein quantity', 'bioavailability'],
    vitamins: ['vitamin', 'daily value'],
    minerals: ['zinc', 'daily value'],
    pros: ['pros first', 'plus side'],
    cons: ['drawbacks next', 'drawbacks'],
    outro: ['tier']
  };
  const TIER_REVEAL_RE = /^[SDCBA]\s+tier\.?$/i;

  const els = {
    foodSearch: document.getElementById('foodSearch'),
    foodList: document.getElementById('foodList'),
    layoutSource: document.getElementById('layoutSource'),
    layoutStatus: document.getElementById('layoutStatus'),
    sceneList: document.getElementById('sceneList'),
    videoStage: document.getElementById('videoStage'),
    narrationAudio: document.getElementById('narrationAudio'),
    playPause: document.getElementById('playPause'),
    audioToggle: document.getElementById('audioToggle'),
    audioStatus: document.getElementById('audioStatus'),
    timeReadout: document.getElementById('timeReadout'),
    timeScrub: document.getElementById('timeScrub'),
    timelineStrip: document.getElementById('timelineStrip'),
    activeSceneTitle: document.getElementById('activeSceneTitle'),
    sceneStatus: document.getElementById('sceneStatus'),
    sceneDuration: document.getElementById('sceneDuration'),
    revealStyle: document.getElementById('revealStyle'),
    captionSize: document.getElementById('captionSize'),
    captionText: document.getElementById('captionText'),
    resetCaptions: document.getElementById('resetCaptions'),
    copyManifest: document.getElementById('copyManifest'),
    manifestOutput: document.getElementById('manifestOutput'),
    spriteDiagnostics: document.getElementById('spriteDiagnostics'),
    copySpriteReport: document.getElementById('copySpriteReport')
  };

  const foods = Array.isArray(window.FOODS_INDEX) ? window.FOODS_INDEX : [];
  const BATCH_RESULTS_CACHE = new Map();
  const savedState = readJson(localStorage.getItem(VIDEO_STATE_KEY), {});
  const urlParams = new URLSearchParams(window.location.search);
  const requestedLayoutSourceId = urlParams.get('layoutSource') || '';
  if (Object.prototype.hasOwnProperty.call(savedState, 'audioEnabled')) {
    delete savedState.audioEnabled;
    localStorage.setItem(VIDEO_STATE_KEY, JSON.stringify(savedState));
  }
  const state = {
    foodFilter: '',
    selectedFoodId: savedState.selectedFoodId || 'bacon',
    layoutSourceId: requestedLayoutSourceId || savedState.layoutSourceId || 'display-builder-v2',
    selectedSceneId: savedState.selectedSceneId || 'intro',
    audioEnabled: true,
    currentTime: 0,
    playing: false,
    startedAt: 0,
    playheadStart: 0,
    scenes: [],
    layout: null,
    layoutOptions: [],
    backgroundKey: '',
    backgroundToken: 0,
    audioTimelineKey: '',
    audioDurationSeconds: null,
    audioInHold: false,
    splitAudioMetadataDurations: new Map(),
    stampSfxPool: [],
    stampSfxPoolIndex: 0,
    stampSfxPath: '',
    stampSfxAudioContext: null,
    stampSfxBuffer: null,
    stampSfxBufferPath: '',
    stampSfxBufferPromise: null,
    stampSfxSources: new Set(),
    playedStampSfxKeys: new Set(),
    sTierStampSfxPool: [],
    sTierStampSfxPoolIndex: 0,
    playedSTierStampSfxKeys: new Set(),
    dTierGameLoseSfxPool: [],
    dTierGameLoseSfxPoolIndex: 0,
    dTierDeathSfxPool: [],
    dTierDeathSfxPoolIndex: 0,
    dTierDeathSfxTimers: new Set(),
    playedDTierStampSfxKeys: new Set(),
    transitionSfxPool: [],
    transitionSfxPoolIndex: 0,
    transitionSfxPath: '',
    transitionSfxAudioContext: null,
    transitionSfxBuffer: null,
    transitionSfxBufferPath: '',
    transitionSfxBufferPromise: null,
    transitionSfxSources: new Set(),
    playedTransitionSfxKeys: new Set(),
    micronBarConfirmSfxPool: [],
    micronBarConfirmSfxPoolIndex: 0,
    playedMicronBarConfirmSfxKeys: new Set(),
    micron100FireworkLeadSfxPool: [],
    micron100FireworkLeadSfxPoolIndex: 0,
    micron100FireworkSfxPool: [],
    micron100FireworkSfxPoolIndex: 0,
    playedMicron100FireworkSfxKeys: new Set(),
    majorProSparkleSfxPool: [],
    majorProSparkleSfxPoolIndex: 0,
    majorProSparkleSfxPlaybackRate: 1,
    playedMajorProSparkleSfxKeys: new Set(),
    majorConSirenSfxPool: [],
    majorConSirenSfxPoolIndex: 0,
    majorConSirenSfxPlaybackRate: 1,
    playedMajorConSirenSfxKeys: new Set(),
    barFillSfxPool: [],
    barFillSfxPoolIndex: 0,
    playedBarFillSfxKeys: new Set(),
    barFillSfxAudioContext: null,
    barFillSfxBuffer: null,
    barFillSfxBufferPromise: null,
    barFillSfxSources: new Set(),
    highlightGlowSfxAudio: null,
    highlightGlowSfxPath: '',
    highlightGlowSfxFoodKey: '',
    highlightGlowSfxVolume: 0,
    highlightGlowSfxKey: '',
    highlightGlowSfxPlaybackRate: 1,
    highlightGlowSfxTargetPlaybackRate: 1,
    highlightGlowSfxLastFrameAt: performance.now(),
    spriteFailures: new Map(),
    diagnosticsTimer: 0,
    displayBuilderExportFrame: null,
    displayBuilderExportRequestedFor: '',
    displayBuilderExportStartedAt: 0,
    displayBuilderExportStatus: '',
    playbackSfxEvents: null
  };

  function readJson(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function clone(value) {
    return structuredClone(value);
  }

  function countLayoutLayers(layout) {
    return SECTIONS.reduce((total, section) => {
      const layers = layout?.sections?.[section.id]?.layers;
      return total + (Array.isArray(layers) ? layers.length : 0);
    }, 0);
  }

  function spriteReportUrl(src) {
    if (!src) return '';
    const raw = String(src);
    if (raw.startsWith('data:')) return 'inline fallback image';
    try {
      const url = new URL(raw, window.location.href);
      const repoMarker = '/Foodranked/';
      const markerIndex = url.pathname.indexOf(repoMarker);
      const path = markerIndex === -1
        ? url.pathname.replace(/^\//, '')
        : url.pathname.slice(markerIndex + repoMarker.length);
      return `${path}${url.search}`;
    } catch {
      return raw;
    }
  }

  function recordSpriteFailure(src, fallbackSrc = '', label = '') {
    const source = spriteReportUrl(src);
    if (!source || source === 'inline fallback image') return;
    const fallback = spriteReportUrl(fallbackSrc);
    const key = `${source}|${fallback}`;
    const existing = state.spriteFailures.get(key);
    state.spriteFailures.set(key, {
      source,
      fallback,
      label: label || existing?.label || '',
      count: (existing?.count || 0) + 1
    });
    scheduleSpriteDiagnostics();
  }

  function currentBrokenImages() {
    return [...document.images]
      .filter(img => img.src && (!img.complete || img.naturalWidth === 0))
      .map(img => spriteReportUrl(img.currentSrc || img.src))
      .filter(Boolean);
  }

  function spriteDiagnosticsLines(limit = 8) {
    const broken = currentBrokenImages();
    const failures = [...state.spriteFailures.values()].slice(-limit);
    const food = selectedFood();
    const foodImageIds = [...AVAILABLE_FOOD_IMAGE_IDS].sort();
    const sourceOption = selectedLayoutSourceOption();
    const sourceLabel = sourceOption?.label || 'Display Builder v2 placement export unavailable';
    const placementExport = readDisplayBuilderV2PlacementExport();
    const placementEntry = food?.id ? placementExport.layouts?.[food.id] : null;
    const allLayerCount = countLayoutLayers(state.layout);
    const lines = [
      'FoodRanked sprite report',
      `build: ${BUILDER_BUILD_ID}`,
      `page: ${window.location.href}`,
      `layout source: ${sourceLabel}`,
      `display-builder v2 selected food: ${readDisplayBuilderV2State().selectedFoodId || 'none'}`,
      `display-builder v2 placement export present: ${placementEntry ? 'yes' : 'no'}`,
      `display-builder v2 placement exported at: ${placementEntry?.exportedAt || 'none'}`,
      `selected food: ${food?.id || 'none'} (${food?.name || 'unknown'})`,
      `layout layers: ${allLayerCount}`,
      `committed custom food images: ${foodImageIds.join(', ') || 'none'}`,
      `selected food has committed image: ${hasCustomFoodImage(food) ? 'yes' : 'no, using food-type plate fallback'}`,
      `remembered failures: ${state.spriteFailures.size}`,
      `currently broken images: ${broken.length}`
    ];
    failures.forEach(item => {
      const fallback = item.fallback ? ` -> fallback ${item.fallback}` : '';
      const label = item.label ? ` (${item.label})` : '';
      lines.push(`failed ${item.source}${fallback}${label}`);
    });
    broken.slice(0, limit).forEach(src => lines.push(`broken now ${src}`));
    return lines;
  }

  function updateSpriteDiagnostics() {
    if (!els.spriteDiagnostics) return;
    const broken = currentBrokenImages();
    const issueCount = state.spriteFailures.size + broken.length;
    els.spriteDiagnostics.classList.toggle('ok', issueCount === 0);
    els.spriteDiagnostics.classList.toggle('warn', issueCount > 0);
    if (!issueCount) {
      els.spriteDiagnostics.textContent = `Sprite check OK - ${BUILDER_BUILD_ID}`;
      return;
    }
    const details = spriteDiagnosticsLines(6).slice(11);
    els.spriteDiagnostics.textContent = `Sprite issues ${issueCount} - ${BUILDER_BUILD_ID}\n${details.join('\n')}`;
  }

  function scheduleSpriteDiagnostics(delay = 300) {
    window.clearTimeout(state.diagnosticsTimer);
    state.diagnosticsTimer = window.setTimeout(updateSpriteDiagnostics, delay);
  }

  function spriteDiagnosticsReport() {
    return spriteDiagnosticsLines(20).join('\n');
  }

  function selectedFood() {
    return attachBatchResult(foods.find(food => food.id === state.selectedFoodId) || foods[0] || null);
  }

  async function loadBatchResults() {
    if (BATCH_RESULTS_CACHE.size) return;
    try {
      const response = await fetch('../data/batch-results.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      const details = Array.isArray(json?.details) ? json.details : [];
      details.forEach(item => {
        const result = item?.result;
        const id = result?.food?.id;
        if (id) BATCH_RESULTS_CACHE.set(id, result);
      });
    } catch {
      // Batch results refine arrow presentation; the builder can still render from food data alone.
    }
  }

  function attachBatchResult(food) {
    if (!food?.id) return food;
    const batchResult = BATCH_RESULTS_CACHE.get(food.id);
    return batchResult ? { ...food, batchResult } : food;
  }

  function asNumber(value, fallback = null) {
    if (value == null || value === '') return fallback;
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function cssPixels(value, fallback = 0) {
    const number = parseFloat(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function easeOutCubic(value) {
    const t = clamp(value, 0, 1);
    return 1 - Math.pow(1 - t, 3);
  }

  function formatCompactNumber(value, decimals = 1) {
    const safe = asNumber(value, null);
    if (safe == null) return 'N/A';
    if (Number.isInteger(safe)) return String(safe);
    return safe.toFixed(decimals).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
  }

  function formatMetric(value, unit) {
    const safe = asNumber(value, null);
    if (safe == null) return 'N/A';
    return `${formatCompactNumber(safe)}${unit}`;
  }

  function macroTotalValue(food, sectionId) {
    const header = food?.header || {};
    if (sectionId === 'fats') return asNumber(header.fat_g, null);
    if (sectionId === 'carbs') return asNumber(header.carb_g ?? header.carbs_g, null);
    if (sectionId === 'protein') return asNumber(header.protein_g, null);
    return null;
  }

  function hasDisplayedMacro(food, sectionId) {
    return macroTotalValue(food, sectionId) != null;
  }

  function ruleSectionKey(sectionId) {
    return sectionId === 'protein' ? 'proteins' : sectionId;
  }

  function sectionDisplayItems(food, sectionId) {
    const sectionKey = ruleSectionKey(sectionId);
    const section = food?.episode?.script?.sections?.find(item => item.key === sectionId || item.key === sectionKey);
    return Array.isArray(section?.displayItems) ? section.displayItems : [];
  }

  function metricLabelForKey(metricKey) {
    return METRIC_SHORT_LABELS[metricKey] || String(metricKey || '')
      .replace(/_dv$/i, '')
      .replace(/_mg$/i, '')
      .replace(/_g$/i, '')
      .replace(/_percent$/i, '')
      .replace(/_/g, ' ')
      .toUpperCase();
  }

  function formatDisplayItemValue(item) {
    if (!item) return 'N/A';
    if (item.displayValue != null) return String(item.displayValue);
    if (item.value == null) return 'N/A';
    const key = String(item.metricKey || '');
    if (key === 'protein_g_fallback' || key.endsWith('_g')) return formatMetric(item.value, 'g');
    if (key.endsWith('_mg')) return formatMetric(item.value, 'mg');
    if (key.endsWith('_percent')) return formatMetric(item.value, '%');
    if (key === 'essential_amino_acids_score') return `${formatCompactNumber(item.value, 0)}/${item.denominator || 9}`;
    if (key === 'nonessential_amino_acids_score') return `${formatCompactNumber(item.value, 0)}/${item.denominator || 11}`;
    return String(item.value);
  }

  function macroSubmetricSpecsForFood(sectionId, food) {
    const generatedItems = sectionId === 'protein'
      ? sectionDisplayItems(food, sectionId).filter(item => item?.metricKey).slice(0, 4)
      : [];
    if (!generatedItems.length) return MACRO_SUBMETRIC_SPECS[sectionId] || [];
    return generatedItems.map((item, index) => ({
      key: item.metricKey,
      label: metricLabelForKey(item.metricKey),
      value: currentFood => formatDisplayItemValue(sectionDisplayItems(currentFood, sectionId)[index] || item)
    }));
  }

  function macroSubmetricDisplayValue(food, sectionId, metricKey) {
    if (sectionId === 'protein' && metricKey === 'protein_g_fallback') return asNumber(food?.header?.protein_g, null);
    const displayItem = sectionDisplayItems(food, sectionId).find(item => item.metricKey === metricKey);
    const displayItemValue = asNumber(displayItem?.value, null);
    if (displayItemValue != null) return displayItemValue;
    if (displayItem && (displayItem.value == null || displayItem.displayValue === 'N/A')) return null;
    const value = asNumber(food?.metrics?.[metricKey], null);
    if (value != null) return value;
    return null;
  }

  function formatMacroMetric(food, sectionId, metricKey, unit = '') {
    return formatMetric(macroSubmetricDisplayValue(food, sectionId, metricKey), unit);
  }

  function formatMacroRatio(food, sectionId, metricKey, denominator) {
    const safe = macroSubmetricDisplayValue(food, sectionId, metricKey);
    if (safe == null) return 'N/A';
    return `${formatCompactNumber(Math.min(safe, denominator), 0)}/${denominator}`;
  }

  function hasDisplayedProteinMacro(food) {
    return hasDisplayedMacro(food, 'protein');
  }

  function proteinMetricDisplayValue(food, metricKey) {
    return macroSubmetricDisplayValue(food, 'protein', metricKey);
  }

  function formatProteinMetric(food, metricKey, unit = '') {
    return formatMetric(proteinMetricDisplayValue(food, metricKey), unit);
  }

  function formatRatio(value, denominator) {
    const safe = asNumber(value, null);
    if (safe == null) return 'N/A';
    return `${formatCompactNumber(safe, 0)}/${denominator}`;
  }

  function formatDvPercent(food, metricKey) {
    const value = asNumber(food?.metrics?.[metricKey], null);
    if (value == null || value <= 0) return 'N/A';
    return `${formatCompactNumber(value, 0)}%`;
  }

  function normalizeFoodType(foodType) {
    const raw = String(foodType || '').trim().toLowerCase();
    const aliases = {
      vegetable: 'vegetables', vegetables: 'vegetables',
      fruit: 'fruits', fruits: 'fruits',
      grain: 'grains', grains: 'grains',
      legume: 'legumes', legumes: 'legumes',
      tuber: 'tubers', tubers: 'tubers',
      nut: 'nuts', nuts: 'nuts',
      seed: 'seeds', seeds: 'seeds',
      meat: 'meats', meats: 'meats',
      dairy: 'dairy',
      oil: 'oils-and-fats', oils: 'oils-and-fats', fat: 'oils-and-fats', fats: 'oils-and-fats', 'oil-fat': 'oils-and-fats', 'oils-and-fats': 'oils-and-fats',
      misc: 'misc', miscellaneous: 'misc'
    };
    return aliases[raw] || raw || 'misc';
  }

  function prettyFoodType(foodType) {
    const normalized = normalizeFoodType(foodType);
    if (normalized === 'vegetables') return 'Veg';
    return normalized.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  function foodTypeTitle(foodType) {
    const helper = window.FOODRANKED_DISPLAY_SCHEMA?.foodTypeTitle;
    if (typeof helper === 'function') return helper(foodType);
    const labels = window.FOODRANKED_DISPLAY_SCHEMA?.foodTypeTitleLabels || {};
    return labels[normalizeFoodType(foodType)] || 'MISC';
  }

  function typeSpriteSlug(foodType) {
    const normalized = normalizeFoodType(foodType);
    return {
      vegetables: 'vegetable',
      fruits: 'fruit',
      grains: 'grain',
      legumes: 'legume',
      tubers: 'tuber',
      nuts: 'nut',
      seeds: 'seed',
      meats: 'meat',
      dairy: 'dairy',
      'oils-and-fats': 'oil_fat',
      misc: 'misc'
    }[normalized] || 'misc';
  }

  function spritePath(path) {
    if (!path) return '';
    path = canonicalSpritePath(path);
    if (/^(data:|https?:|blob:)/i.test(path)) return path;
    if (path.startsWith('./sprites/')) return `../app/${path.slice(2)}`;
    if (path.startsWith('sprites/')) return `../app/${path}`;
    if (path.startsWith('./app/')) return `../${path.slice(2)}`;
    if (path.startsWith('app/')) return `../${path}`;
    if (path.startsWith('../app/')) return path;
    return path;
  }

  function canonicalSpritePath(src) {
    if (!src || /^(data:|https?:|blob:)/i.test(src)) return src;
    const next = String(src)
      .replace('/header/food_image_plate/', '/header/food_plate/')
      .replace(/\/macros\/protein\/protein_bar_fill\.(svg|png|gif|webp)/i, '/macros_section/section_3_protein/protein_macro_bar_fill.gif')
      .replace(/\/macros_section\/section_3_protein\/protein_bar_fill\.(svg|png|gif|webp)/i, '/macros_section/section_3_protein/protein_macro_bar_fill.gif')
      .replace(/\/macros\/protein\/protein_macro_bar_fill\.(svg|png|gif|webp)/i, '/macros_section/section_3_protein/protein_macro_bar_fill.gif')
      .replace(/\/macros_section\/section_3_protein\/protein_macro_bar_fill\.(svg|png|gif|webp)/i, '/macros_section/section_3_protein/protein_macro_bar_fill.gif');
    if (next.toLowerCase().includes('/macros_section/section_3_protein/protein_macro_bar_fill.gif')) return next;
    return next
      .replace('/macros/fats/fat_bar_frame.svg', '/macros_section/macro_bar_frame.png')
      .replace('/macros/fats/fat_bar_fill.svg', '/macros_section/section_1_fats/fat_macro_bar_fill.gif')
      .replace('/macros/carbs/carb_bar_frame.svg', '/macros_section/macro_bar_frame.png')
      .replace('/macros/carbs/carb_bar_fill.svg', '/macros_section/section_2_carbs/carb_macro_bar_fill.gif')
      .replace('/macros/arrow_indicators/', '/macros_section/arrow_indicators/')
      .replace('/macros/fats/', '/macros_section/section_1_fats/')
      .replace('/macros/carbs/', '/macros_section/section_2_carbs/')
      .replace('/macros/protein/', '/macros_section/section_3_protein/')
      .replace('/micros/vitamins/', '/micros_section/vitamins/')
      .replace('/micros/minerals/', '/micros_section/minerals/')
      .replace('/pros-cons/', '/pros_and_cons/');
  }

  function docsAssetPath(path) {
    if (!path) return '';
    if (/^(data:|https?:|blob:)/i.test(path)) return path;
    if (path.startsWith('../') || path.startsWith('./')) return path;
    return `../${path}`;
  }

  function sfxProfileForFood(food = selectedFood()) {
    return food?.episode?.sfxProfile || food?.sfxProfile || null;
  }

  function sfxProfilePath(role, fallbackPath, food = selectedFood()) {
    const value = sfxProfileForFood(food)?.[role];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value === 'object' && typeof value.path === 'string' && value.path.trim()) return value.path.trim();
    return fallbackPath;
  }

  function sfxProfileRole(role, food = selectedFood()) {
    const value = sfxProfileForFood(food)?.[role];
    return value && typeof value === 'object' ? value : null;
  }

  function normalizeSfxAssetPath(path) {
    return String(path || '')
      .trim()
      .replace(/\\/g, '/')
      .replace(/^(\.\.\/|\.\/)+/, '')
      .replace(/^docs\//, '');
  }

  function sfxAssetRoleSettings(role, path) {
    const settings = SFX_ASSET_SETTINGS[normalizeSfxAssetPath(path)]?.[role];
    return settings && typeof settings === 'object' ? settings : null;
  }

  function sfxRoleSetting(role, key, path, fallback, food = selectedFood()) {
    const assetSettings = sfxAssetRoleSettings(role, path);
    if (assetSettings && Object.prototype.hasOwnProperty.call(assetSettings, key)) return assetSettings[key];
    const profileRole = sfxProfileRole(role, food);
    if (profileRole && Object.prototype.hasOwnProperty.call(profileRole, key)) return profileRole[key];
    return fallback;
  }

  function stampSfxPath(food = selectedFood()) {
    return sfxProfilePath('stampImpact', STAMP_SFX_PATH, food);
  }

  function sectionTransitionSfxPath(food = selectedFood()) {
    return sfxProfilePath('sectionTransition', SECTION_TRANSITION_SFX_PATH, food);
  }

  function sectionTransitionSfxVolume(food = selectedFood()) {
    const path = sectionTransitionSfxPath(food);
    const maxVolume = asNumber(
      sfxRoleSetting('sectionTransition', 'maxVolume', path, SECTION_TRANSITION_SFX_MAX_VOLUME, food),
      SECTION_TRANSITION_SFX_MAX_VOLUME
    );
    return clamp(
      asNumber(sfxRoleSetting('sectionTransition', 'volume', path, SECTION_TRANSITION_SFX_VOLUME, food), SECTION_TRANSITION_SFX_VOLUME),
      0,
      maxVolume
    );
  }

  function sectionTransitionSfxTimeOffsetSeconds(food = selectedFood()) {
    const path = sectionTransitionSfxPath(food);
    return asNumber(sfxRoleSetting('sectionTransition', 'timeOffsetSeconds', path, 0, food), 0);
  }

  function highlightGlowSfxPath(food = selectedFood()) {
    return sfxProfilePath('highlightGlow', HIGHLIGHT_GLOW_SFX_PATH, food);
  }

  function highlightGlowSfxFoodKey(food = selectedFood()) {
    return `${food?.id || ''}:${highlightGlowSfxPath(food)}`;
  }

  function syncHighlightGlowSfxForFood(food = selectedFood()) {
    const nextFoodKey = highlightGlowSfxFoodKey(food);
    if (state.highlightGlowSfxFoodKey === nextFoodKey) return;
    pauseHighlightGlowSfx();
    state.highlightGlowSfxAudio = null;
    state.highlightGlowSfxPath = '';
    state.highlightGlowSfxFoodKey = nextFoodKey;
  }

  function appSpritePath(path) {
    return `${ROOT_SPRITE_BASE}/${path}`.replace(/\/+/g, '/').replace(':/', '://');
  }

  function foodImagePath(food) {
    const customPath = food?.assets?.customFoodImage?.path || food?.customFoodImage?.path;
    if (customPath) return customPath;
    if (!AVAILABLE_FOOD_IMAGE_IDS.has(String(food?.id || '').toLowerCase())) return foodPlatePath(food);
    return appSpritePath(`header/food_images/${food?.id || 'bacon'}.png`);
  }

  function hasCustomFoodImage(food) {
    return Boolean(food?.assets?.customFoodImage?.path || food?.customFoodImage?.path)
      || AVAILABLE_FOOD_IMAGE_IDS.has(String(food?.id || '').toLowerCase());
  }

  function foodPlatePath(food) {
    return appSpritePath(`header/food_plate/${typeSpriteSlug(food?.foodType)}_food_plate.png`);
  }

  function foodSpriteCandidates(food) {
    return {
      primary: foodImagePath(food),
      fallback: foodPlatePath(food)
    };
  }

  function customFoodImageNaturalSize(food) {
    const id = String(food?.id || '').toLowerCase();
    const asset = food?.assets?.customFoodImage || food?.customFoodImage || {};
    const assetWidth = Number(asset.width || asset.naturalWidth || 0);
    const assetHeight = Number(asset.height || asset.naturalHeight || 0);
    if (Number.isFinite(assetWidth) && assetWidth > 0 && Number.isFinite(assetHeight) && assetHeight > 0) {
      return { width: assetWidth, height: assetHeight };
    }
    return FOOD_IMAGE_SPRITE_SIZES[id] || null;
  }

  function foodImageLayerGeometry(food) {
    const size = customFoodImageNaturalSize(food);
    if (!size) {
      if (!hasCustomFoodImage(food)) return null;
      return {
        x: FOOD_IMAGE_REFERENCE_CENTER.x - (FOOD_IMAGE_BACON_REFERENCE.width / 2),
        y: FOOD_IMAGE_REFERENCE_CENTER.y - (FOOD_IMAGE_BACON_REFERENCE.width / 2),
        width: FOOD_IMAGE_BACON_REFERENCE.width,
        height: FOOD_IMAGE_BACON_REFERENCE.width,
        naturalWidth: null,
        naturalHeight: null
      };
    }
    if (
      size.width === FOOD_IMAGE_BACON_REFERENCE.naturalWidth
      && size.height === FOOD_IMAGE_BACON_REFERENCE.naturalHeight
    ) {
      return { ...FOOD_IMAGE_BACON_REFERENCE };
    }
    const width = size.width * FOOD_IMAGE_REFERENCE_SCALE;
    const height = size.height * FOOD_IMAGE_REFERENCE_SCALE;
    return {
      x: FOOD_IMAGE_REFERENCE_CENTER.x - (width / 2),
      y: FOOD_IMAGE_REFERENCE_CENTER.y - (height / 2),
      width,
      height,
      naturalWidth: size.width,
      naturalHeight: size.height
    };
  }

  function syncFoodImageLayerGeometry(layer, food) {
    const geometry = foodImageLayerGeometry(food);
    if (!geometry) return;
    if (!layer.manualPosition) {
      layer.x = Number(geometry.x.toFixed(3));
      layer.y = Number(geometry.y.toFixed(3));
      layer.width = Number(geometry.width.toFixed(3));
      layer.height = Number(geometry.height.toFixed(3));
    }
    layer.naturalWidth = geometry.naturalWidth || null;
    layer.naturalHeight = geometry.naturalHeight || null;
    layer.preserveAspect = true;
    layer.aspectRatio = geometry.naturalHeight ? geometry.naturalWidth / geometry.naturalHeight : null;
  }

  function canvasGridUnit(axis = 'x') {
    const fallback = cssPixels(getComputedStyle(document.documentElement).getPropertyValue('--pixel-unit'), 4);
    const stageRect = els.videoStage?.getBoundingClientRect?.();
    const denominator = axis === 'y' ? AUTHOR_GRID.height : AUTHOR_GRID.width;
    const measured = denominator ? ((axis === 'y' ? stageRect?.height : stageRect?.width) / denominator) : 0;
    return Number.isFinite(measured) && measured > 0 ? measured : fallback;
  }

  function visibleCanvasGridBounds() {
    const shell = els.videoStage?.closest('.phone-shell');
    if (!shell) {
      return { left: 0, top: 0, right: AUTHOR_GRID.width, bottom: AUTHOR_GRID.height };
    }

    const pixelUnitX = canvasGridUnit('x');
    const pixelUnitY = canvasGridUnit('y');
    const stageRect = els.videoStage.getBoundingClientRect();
    const shellRect = shell.getBoundingClientRect();
    const shellStyle = getComputedStyle(shell);
    const contentLeft = shellRect.left
      + cssPixels(shellStyle.borderLeftWidth)
      + cssPixels(shellStyle.paddingLeft);
    const contentRight = shellRect.right
      - cssPixels(shellStyle.borderRightWidth)
      - cssPixels(shellStyle.paddingRight);
    const contentTop = shellRect.top
      + cssPixels(shellStyle.borderTopWidth)
      + cssPixels(shellStyle.paddingTop);
    const contentBottom = shellRect.bottom
      - cssPixels(shellStyle.borderBottomWidth)
      - cssPixels(shellStyle.paddingBottom);
    return {
      left: Math.max(0, (Math.max(stageRect.left, contentLeft) - stageRect.left) / pixelUnitX),
      right: Math.min(AUTHOR_GRID.width, (Math.min(stageRect.right, contentRight) - stageRect.left) / pixelUnitX),
      top: Math.max(0, (Math.max(stageRect.top, contentTop) - stageRect.top) / pixelUnitY),
      bottom: Math.min(AUTHOR_GRID.height, (Math.min(stageRect.bottom, contentBottom) - stageRect.top) / pixelUnitY)
    };
  }

  function introHeroLayout() {
    const visible = visibleCanvasGridBounds();
    const centerX = (visible.left + visible.right) / 2;
    const centerY = (visible.top + visible.bottom) / 2;
    const rankedSize = INTRO_HERO_SIZE.ranked;
    const ranked = {
      x: centerX - (rankedSize * INTRO_RANKED_VISIBLE_CENTER.x),
      y: centerY - (rankedSize * INTRO_RANKED_VISIBLE_CENTER.y),
      width: rankedSize,
      height: rankedSize
    };
    return {
      ranked,
      food: {
        x: ranked.x + 16,
        y: ranked.y + 20.75,
        width: INTRO_HERO_SIZE.foodWidth,
        height: INTRO_HERO_SIZE.foodHeight
      }
    };
  }

  function roundedGridNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return null;
    return Number(number.toFixed(3));
  }

  function sameFoodImageReferenceSize(size) {
    return !!size
      && Math.abs(Number(size.width) - FOOD_IMAGE_BACON_REFERENCE.naturalWidth) < 0.001
      && Math.abs(Number(size.height) - FOOD_IMAGE_BACON_REFERENCE.naturalHeight) < 0.001;
  }

  function introFoodHeroBox(food, foodBox) {
    const size = customFoodImageNaturalSize(food);
    if (!hasCustomFoodImage(food) || !size) return { ...foodBox };
    if (sameFoodImageReferenceSize(size)) {
      return {
        ...foodBox,
        naturalWidth: size.width,
        naturalHeight: size.height,
        aspectRatio: size.height ? size.width / size.height : null
      };
    }

    const scale = Math.min(
      foodBox.width / FOOD_IMAGE_BACON_REFERENCE.naturalWidth,
      foodBox.height / FOOD_IMAGE_BACON_REFERENCE.naturalHeight
    );
    const width = size.width * scale;
    const height = size.height * scale;
    const centerX = foodBox.x + (foodBox.width / 2);
    const centerY = foodBox.y + (foodBox.height / 2);
    return {
      x: roundedGridNumber(centerX - (width / 2)),
      y: roundedGridNumber(centerY - (height / 2)),
      width: roundedGridNumber(width),
      height: roundedGridNumber(height),
      naturalWidth: size.width,
      naturalHeight: size.height,
      aspectRatio: size.height ? size.width / size.height : null
    };
  }

  function introHookLayers(food) {
    const layout = introHeroLayout();
    const foodBox = introFoodHeroBox(food, layout.food);
    const rankedBox = layout.ranked;
    return [
      {
        id: 'intro_ranked_glow',
        kind: 'sprite',
        label: 'Hook ranked glow',
        src: INTRO_RANKED_SPRITE_PATH,
        x: rankedBox.x,
        y: rankedBox.y,
        z: 53,
        width: rankedBox.width,
        height: rankedBox.height,
        visible: true,
        preserveAspect: true,
        aspectRatio: 1,
        effect: 'ranked-glow'
      },
      {
        id: 'intro_food_hero',
        kind: 'sprite',
        label: 'Hook food image',
        src: foodImagePath(food),
        fallbackSrc: foodPlatePath(food),
        x: foodBox.x,
        y: foodBox.y,
        z: 54,
        width: foodBox.width,
        height: foodBox.height,
        naturalWidth: foodBox.naturalWidth || null,
        naturalHeight: foodBox.naturalHeight || null,
        visible: true,
        foodDriven: true,
        preserveAspect: true,
        aspectRatio: foodBox.aspectRatio || null
      },
      {
        id: 'intro_ranked_sprite',
        kind: 'sprite',
        label: 'Hook ranked sprite',
        src: INTRO_RANKED_SPRITE_PATH,
        x: rankedBox.x,
        y: rankedBox.y,
        z: 55,
        width: rankedBox.width,
        height: rankedBox.height,
        visible: true,
        preserveAspect: true,
        aspectRatio: 1,
        effect: 'ranked-shine'
      },
      ...introRankedGlimmerLayers(rankedBox)
    ];
  }

  function introRankedGlimmerLayers(rankedBox) {
    const scaleX = rankedBox.width / 92;
    const scaleY = rankedBox.height / 92;
    return [
      { x: rankedBox.x + (10 * scaleX), y: rankedBox.y + (6 * scaleY), delay: 0.02, text: '*', size: 11 },
      { x: rankedBox.x + (74 * scaleX), y: rankedBox.y + (12 * scaleY), delay: 0.14, text: '+', size: 9 },
      { x: rankedBox.x + (5 * scaleX), y: rankedBox.y + (66 * scaleY), delay: 0.26, text: '+', size: 9 },
      { x: rankedBox.x + (78 * scaleX), y: rankedBox.y + (61 * scaleY), delay: 0.38, text: '*', size: 11 },
      { x: rankedBox.x + (45 * scaleX), y: rankedBox.y + (0 * scaleY), delay: 0.50, text: '*', size: 8 }
    ].map((glimmer, index) => ({
      id: `intro_ranked_glimmer_${index + 1}`,
      kind: 'text',
      label: 'Hook ranked glimmer',
      text: glimmer.text,
      x: glimmer.x,
      y: glimmer.y,
      z: 64 + index,
      width: 6,
      fontSize: glimmer.size,
      align: 'center',
      visible: true,
      color: '#fff8c9',
      effect: 'ranked-glimmer',
      animationDelay: `${glimmer.delay}s`,
      sparkleDelay: glimmer.delay
    }));
  }

  function typePlatePath(food) {
    return appSpritePath(`header/food_type_plate/${typeSpriteSlug(food?.foodType)}_type_plate.png`);
  }

  function calorieBubblePath(food) {
    return appSpritePath(`header/calorie_bubble/${typeSpriteSlug(food?.foodType)}_calorie_bubble.png`);
  }

  function separatorPath(food) {
    return appSpritePath(`ui/section_separator/${typeSpriteSlug(food?.foodType)}_section_separator.png`);
  }

  function indicatorPath(food, highlighted = false) {
    return appSpritePath(`ui/section_indicator/${typeSpriteSlug(food?.foodType)}_${highlighted ? 'highlighted_' : ''}section_indicator.png`);
  }

  function readDisplayBuilderV2State() {
    const saved = readJson(localStorage.getItem(DISPLAY_BUILDER_V2_STATE_KEY), {});
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  }

  function readDisplayBuilderV2PlacementExport() {
    const saved = readJson(localStorage.getItem(DISPLAY_BUILDER_V2_PLACEMENT_EXPORT_KEY), {});
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  }

  function normalizeDisplaySectionId(sectionId) {
    const raw = String(sectionId || '').trim();
    return ({ carbohydrates: 'carbs', proteins: 'protein' })[raw] || raw;
  }

  function normalizeLayoutSections(layout) {
    if (!layout || typeof layout !== 'object') return layout;
    if (layout.selectedSectionId) layout.selectedSectionId = normalizeDisplaySectionId(layout.selectedSectionId);
    if (!layout.sections || typeof layout.sections !== 'object') return layout;

    const normalizedSections = {};
    for (const [rawSectionId, section] of Object.entries(layout.sections)) {
      const sectionId = normalizeDisplaySectionId(rawSectionId);
      if (!normalizedSections[sectionId]) {
        normalizedSections[sectionId] = section;
        continue;
      }

      const currentLayers = Array.isArray(normalizedSections[sectionId]?.layers)
        ? normalizedSections[sectionId].layers
        : [];
      const incomingLayers = Array.isArray(section?.layers) ? section.layers : [];
      const currentIds = new Set(currentLayers.map(layer => layer?.id).filter(Boolean));
      const mergedLayers = [...currentLayers];
      incomingLayers.forEach(layer => {
        if (layer?.id && currentIds.has(layer.id)) return;
        mergedLayers.push(layer);
      });
      normalizedSections[sectionId] = {
        ...(normalizedSections[sectionId] || {}),
        ...(section || {}),
        layers: mergedLayers
      };
    }
    layout.sections = normalizedSections;
    return layout;
  }

  function validLayout(layout) {
    return !!layout && typeof layout === 'object' && !!layout.sections && typeof layout.sections === 'object';
  }

  function selectedFoodLabel(foodId) {
    const food = foods.find(item => item.id === foodId);
    return food?.name || foodId || 'Selected food';
  }

  function normalizeDisplayBuilderV2PlacementOption(foodId, entry) {
    const layout = entry?.layout;
    if (!foodId || !validLayout(layout)) return null;
    const cloned = normalizeLayoutSections(clone(layout));
    return {
      id: `display-builder-v2-placement:${foodId}`,
      label: `${selectedFoodLabel(foodId)} · Display Builder v2 placement`,
      kind: 'Display Builder v2 placement export',
      updatedAt: entry.exportedAt || cloned.meta?.exportedAt || '',
      layout: normalizeLayoutSections({
        ...cloned,
        meta: {
          ...(cloned.meta || {}),
          source: DISPLAY_BUILDER_V2_PLACEMENT_EXPORT_KEY,
          sourceBuilder: 'display-builder-v2',
          foodId
        }
      })
    };
  }

  function layoutSourceOptions() {
    const food = selectedFood();
    const placementEntry = readDisplayBuilderV2PlacementExport().layouts?.[food?.id];
    const displayBuilderV2Placement = normalizeDisplayBuilderV2PlacementOption(food?.id, placementEntry);
    const options = displayBuilderV2Placement ? [displayBuilderV2Placement] : [];
    state.layoutOptions = options.filter(option => countLayoutLayers(option.layout) > 0);
    return state.layoutOptions;
  }

  function selectedLayoutSourceOption() {
    const options = layoutSourceOptions();
    return options.find(option => option.id === state.layoutSourceId) || options[0] || null;
  }

  function selectedLayoutBase(selected = selectedLayoutSourceOption()) {
    if (selected && state.layoutSourceId !== selected.id) state.layoutSourceId = selected.id;
    return selected?.layout ? clone(selected.layout) : null;
  }

  function displayBuilderV2ExportUrl(foodId) {
    const url = new URL('../display-builder-v2/index.html', window.location.href);
    url.searchParams.set('videoBuilderExportFood', foodId || '');
    url.searchParams.set('build', BUILDER_BUILD_ID);
    url.searchParams.set('t', String(Date.now()));
    return url.href;
  }

  function writeDisplayBuilderV2ExportRequestState(foodId) {
    const existing = readDisplayBuilderV2State();
    const requestedSection = SECTIONS.some(section => section.id === state.selectedSceneId)
      ? state.selectedSceneId
      : 'intro';
    localStorage.setItem(DISPLAY_BUILDER_V2_STATE_KEY, JSON.stringify({
      ...existing,
      selectedFoodId: foodId,
      selectedSectionId: requestedSection,
      selectedLayoutKey: `food:${foodId}`
    }));
  }

  function requestDisplayBuilderV2PlacementExport(food) {
    const foodId = food?.id;
    if (!foodId) return false;
    const existing = readDisplayBuilderV2PlacementExport().layouts?.[foodId];
    if (validLayout(existing?.layout)) return false;

    const now = performance.now();
    const samePendingRequest = state.displayBuilderExportRequestedFor === foodId
      && now - state.displayBuilderExportStartedAt < 10000;
    if (samePendingRequest) return false;

    state.displayBuilderExportRequestedFor = foodId;
    state.displayBuilderExportStartedAt = now;
    state.displayBuilderExportStatus = 'building';
    writeDisplayBuilderV2ExportRequestState(foodId);

    let frame = state.displayBuilderExportFrame;
    if (!frame || !document.body.contains(frame)) {
      frame = document.createElement('iframe');
      frame.title = 'Display Builder v2 placement export worker';
      frame.setAttribute('aria-hidden', 'true');
      frame.tabIndex = -1;
      frame.style.position = 'fixed';
      frame.style.left = '-10000px';
      frame.style.top = '0';
      frame.style.width = '1px';
      frame.style.height = '1px';
      frame.style.border = '0';
      frame.style.opacity = '0';
      frame.style.pointerEvents = 'none';
      state.displayBuilderExportFrame = frame;
      document.body.appendChild(frame);
    }

    frame.onload = () => {
      window.setTimeout(() => {
        const exported = readDisplayBuilderV2PlacementExport().layouts?.[foodId];
        if (validLayout(exported?.layout)) {
          state.displayBuilderExportStatus = 'ready';
          hydrateLayoutForFood({ requestExport: false });
          renderAll();
          return;
        }
        state.displayBuilderExportStatus = 'missing-source';
        if (!state.layout) {
          els.layoutStatus.textContent = 'DBv2 missing';
          els.layoutStatus.title = `${food?.name || 'Selected food'} needs a Display Builder v2 food layout before Video Builder v2 can render it · ${BUILDER_BUILD_ID}`;
          renderStage();
        }
      }, 350);
    };
    frame.src = displayBuilderV2ExportUrl(foodId);
    return true;
  }

  function getSectionLayers(layout, sectionId) {
    if (!layout.sections) layout.sections = {};
    if (!layout.sections[sectionId]) layout.sections[sectionId] = { layers: [] };
    if (!Array.isArray(layout.sections[sectionId].layers)) layout.sections[sectionId].layers = [];
    return layout.sections[sectionId].layers;
  }

  function isSpriteLayer(layer) {
    return layer?.kind === 'sprite' && typeof layer.src === 'string';
  }

  function isTextLayer(layer) {
    return layer?.kind === 'text';
  }

  function isArrowIndicatorSpriteLayer(layer) {
    if (!isSpriteLayer(layer)) return false;
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return fingerprint.includes('/arrow_indicators/') || /arrow indicator|green_arrow|red_arrow|yellow_arrow/.test(fingerprint);
  }

  function normalizeArrowIndicatorSpriteSize(layer) {
    if (!isArrowIndicatorSpriteLayer(layer)) return;
    const naturalWidth = Number(layer.naturalWidth || layer.width || 1);
    const naturalHeight = Number(layer.naturalHeight || layer.height || 1);
    const nextWidth = Math.max(1, Math.round(naturalWidth * SPRITE_LIBRARY_DEFAULT_DROP_SCALE));
    const nextHeight = Math.max(1, Math.round(naturalHeight * SPRITE_LIBRARY_DEFAULT_DROP_SCALE));
    const oldWidth = Number.isFinite(Number(layer.width)) ? Number(layer.width) : nextWidth;
    const oldHeight = Number.isFinite(Number(layer.height)) ? Number(layer.height) : nextHeight;
    if (oldWidth !== nextWidth || oldHeight !== nextHeight) {
      layer.x = Number(layer.x || 0) + ((oldWidth - nextWidth) / 2);
      layer.y = Number(layer.y || 0) + ((oldHeight - nextHeight) / 2);
    }
    layer.width = nextWidth;
    layer.height = nextHeight;
    layer.naturalWidth = naturalWidth;
    layer.naturalHeight = naturalHeight;
    layer.aspectRatio = naturalHeight ? naturalWidth / naturalHeight : null;
    layer.preserveAspect = true;
  }

  function isHeaderSprite(layer) {
    const fingerprint = `${layer?.src || ''} ${layer?.label || ''}`.toLowerCase();
    return isSpriteLayer(layer) && fingerprint.includes('/header/');
  }

  function isHeaderText(layer) {
    if (!isTextLayer(layer)) return false;
    const id = String(layer.id || '').toLowerCase();
    const fingerprint = `${layer.id || ''} ${layer.label || ''}`.toLowerCase();
    if (['food_name_text', 'kcal_label_text', 'kcal_value_text', 'basis_text', 'script_caption', 'subline_c'].includes(id)) return true;
    return /header/.test(fingerprint) && /(food|name|type|basis|100g|per|calorie|kcal|score|tier)/.test(fingerprint);
  }

  function isUiSprite(layer) {
    return isSpriteLayer(layer) && String(layer.src || '').toLowerCase().includes('/ui/');
  }

  function isSectionIndicator(layer) {
    const fingerprint = `${layer?.src || ''} ${layer?.label || ''} ${layer?.id || ''}`.toLowerCase();
    return isSpriteLayer(layer) && (fingerprint.includes('/ui/section_indicator/') || fingerprint.includes('section indicator'));
  }

  function isOutroFinalRevealStampLayer(layer) {
    const id = String(layer?.id || '').toLowerCase();
    if (OUTRO_FINAL_REVEAL_STAMP_IDS.has(id)) return true;
    const effect = String(layer?.effect || '').toLowerCase();
    return effect.includes('tier-stamp') || effect.includes('d-tier-stamp');
  }

  function outroCtaStampWaveIndex(layer) {
    const id = String(layer?.id || '').toLowerCase();
    if (!OUTRO_CTA_STAMP_IDS.has(id)) return -1;
    return OUTRO_CTA_STAMP_ORDER.indexOf(id);
  }

  function isPersistentChrome(layer) {
    if (isOutroFinalRevealStampLayer(layer)) return false;
    return isHeaderSprite(layer) || isHeaderText(layer) || isSectionIndicator(layer) || (isUiSprite(layer) && !isSectionIndicator(layer));
  }

  function isHeaderChrome(layer) {
    return isHeaderSprite(layer) || isHeaderText(layer);
  }

  function indicatorSectionIndex(sectionId) {
    return SECTIONS.findIndex(section => section.id === sectionId);
  }

  function compareIndicatorsByPosition(a, b) {
    return (Number(a.x) || 0) - (Number(b.x) || 0) || (Number(a.y) || 0) - (Number(b.y) || 0);
  }

  function isMicrosBar(layer) {
    return isSpriteLayer(layer) && /\/micros_section\/bars\/\d+(?:%25|%)_bar\./i.test(String(layer.src || ''));
  }

  function microsBarPercent(layer) {
    const match = String(layer?.src || '').match(/\/(\d+)(?:%25|%)_bar\./i);
    return match ? Number(match[1]) : null;
  }

  function layerCenterX(layer) {
    return (Number(layer?.x) || 0) + ((Number(layer?.width) || 0) / 2);
  }

  function microsColumns(layers) {
    const columns = layers
      .filter(isMicrosBar)
      .map(layer => ({ layer, percent: microsBarPercent(layer), centerX: layerCenterX(layer) }))
      .sort((a, b) => a.centerX - b.centerX || a.percent - b.percent)
      .reduce((result, item) => {
        const column = result.find(candidate => Math.abs(candidate.centerX - item.centerX) <= 4);
        if (column) {
          column.items.push(item);
          column.centerX = column.items.reduce((sum, current) => sum + current.centerX, 0) / column.items.length;
        } else {
          result.push({ centerX: item.centerX, items: [item] });
        }
        return result;
      }, []);
    return columns
      .map(column => ({ ...column, items: column.items.sort((a, b) => a.percent - b.percent) }))
      .sort((a, b) => a.centerX - b.centerX);
  }

  function nearestColumn(columns, layer, fallbackIndex) {
    if (!columns.length) return null;
    const targetX = layer ? layerCenterX(layer) : null;
    if (targetX == null) return columns[fallbackIndex] || columns[0];
    return columns.reduce((closest, column) => (
      Math.abs(column.centerX - targetX) < Math.abs(closest.centerX - targetX) ? column : closest
    ), columns[0]);
  }

  function micronutrientStep(value) {
    const safe = asNumber(value, null);
    if (safe == null || safe <= 0) return null;
    return clamp(Math.max(1, Math.floor(safe / 10)), 1, 10);
  }

  function micronSpecsForSection(sectionId) {
    if (sectionId === 'vitamins') return VITAMIN_TEXT_SPECS;
    if (sectionId === 'minerals') return MINERAL_TEXT_SPECS;
    return [];
  }

  function micronStepForColumn(sectionId, columnIndex, food = selectedFood()) {
    const spec = micronSpecsForSection(sectionId)[columnIndex];
    return spec ? micronutrientStep(food?.metrics?.[spec.key]) : null;
  }

  function maxMicronStepForSection(sectionId, food = selectedFood()) {
    return micronSpecsForSection(sectionId).reduce((maxStep, spec) => {
      return Math.max(maxStep, micronutrientStep(food?.metrics?.[spec.key]) || 0);
    }, 0);
  }

  function maxVisibleMicronBarStep(sectionId, layers = []) {
    if (sectionId !== 'vitamins' && sectionId !== 'minerals') return 0;
    return layers
      .filter(layer => layer?.visible !== false && isMicrosBar(layer))
      .reduce((maxStep, layer) => {
        const percent = microsBarPercent(layer);
        const step = percent == null ? 0 : clamp(Math.round(percent / 10), 1, 10);
        return Math.max(maxStep, step);
      }, 0);
  }

  function sectionNarrationDelaySeconds(sectionId, food = selectedFood()) {
    if (['fats', 'carbs', 'protein'].includes(sectionId)) {
      return Number((macroSubmacroRevealDelaySeconds(sectionId, food) + SECTION_NARRATION_AFTER_REVEAL_PAD_SECONDS).toFixed(3));
    }
    if (sectionId === 'vitamins' || sectionId === 'minerals') {
      const maxStep = Math.max(1, maxMicronStepForSection(sectionId, food));
      return Number((
        MICRON_GRAPH_REVEAL_SECONDS
        + MICRON_BAR_AFTER_GRAPH_SECONDS
        + ((maxStep - 1) * MICRON_BAR_STEP_SECONDS)
        + MICRON_BAR_STAMP_REVEAL_SECONDS
        + SECTION_NARRATION_AFTER_REVEAL_PAD_SECONDS
      ).toFixed(3));
    }
    if (sectionId === 'pros' || sectionId === 'cons') {
      return Number((PRO_CON_ROW_REVEAL_SECONDS + (2 * PRO_CON_ROW_STEP_SECONDS) + PRO_CON_NARRATION_AFTER_REVEAL_PAD_SECONDS).toFixed(3));
    }
    return 0;
  }

  function macroSubmacroRevealDelaySeconds(sectionId = null, food = selectedFood()) {
    return MACRO_REVEAL_SECONDS
      + MACRO_BAR_START_DWELL_SECONDS
      + macroBarFillDurationSeconds(sectionId ? macroBarFillRatio(food, sectionId) : 1)
      + MACRO_ROW_AFTER_BAR_SECONDS;
  }

  function macroBarFillDurationSeconds(fillRatio) {
    return macroBarFillMotionTiming(fillRatio).totalSeconds;
  }

  function macroBarFillMotionTiming(fillRatio) {
    const ratio = clamp(asNumber(fillRatio, 1), MACRO_BAR_MIN_VISIBLE_FILL_RATIO, 1);
    const firstSeconds = MACRO_BAR_FILL_SECONDS * ratio * 0.75;
    const tailSeconds = MACRO_BAR_FILL_SECONDS * ratio * 0.25 * MACRO_BAR_LAST_QUARTER_DURATION_MULTIPLIER;
    return {
      ratio,
      firstSeconds,
      tailSeconds,
      totalSeconds: firstSeconds + tailSeconds
    };
  }

  function macroBarFillCurrentRatio(elapsedSeconds, fillRatio) {
    const timing = macroBarFillMotionTiming(fillRatio);
    const elapsed = Math.max(0, asNumber(elapsedSeconds, 0));
    if (elapsed <= timing.firstSeconds) {
      return clamp(elapsed / MACRO_BAR_FILL_SECONDS, 0, timing.ratio * 0.75);
    }
    const tailProgress = clamp((elapsed - timing.firstSeconds) / Math.max(0.001, timing.tailSeconds), 0, 1);
    const tailPosition = cubicHermite(
      tailProgress,
      MACRO_BAR_LAST_QUARTER_DURATION_MULTIPLIER,
      MACRO_BAR_LAST_QUARTER_DURATION_MULTIPLIER * MACRO_BAR_LAST_QUARTER_END_SPEED_RATIO
    );
    return clamp((timing.ratio * 0.75) + (timing.ratio * 0.25 * tailPosition), 0, timing.ratio);
  }

  function cubicHermite(progress, startSlope, endSlope) {
    const t = clamp(progress, 0, 1);
    const t2 = t * t;
    const t3 = t2 * t;
    return ((2 * t3) - (3 * t2) + 1) * 0
      + (t3 - (2 * t2) + t) * startSlope
      + ((-2 * t3) + (3 * t2)) * 1
      + (t3 - t2) * endSlope;
  }

  function macroFillRange(foodType, sectionId) {
    if (typeof DISPLAY_SCHEMA.getMacroFillRange === 'function') {
      return DISPLAY_SCHEMA.getMacroFillRange(foodType, sectionId);
    }
    const fallback = DISPLAY_SCHEMA.defaultMacroFillRanges?.[sectionId];
    return Array.isArray(fallback) ? fallback : [0, 30];
  }

  function macroValue(food, sectionId) {
    return macroTotalValue(food, sectionId);
  }

  function macroBarFillRatio(food, sectionId) {
    const value = macroValue(food, sectionId);
    if (value == null || value <= 0) return 0;
    const [min, max] = macroFillRange(food?.foodType, sectionId);
    if (max <= min) return MACRO_BAR_MIN_VISIBLE_FILL_RATIO;
    const ratio = (value - min) / (max - min);
    return ratio <= 0 ? MACRO_BAR_MIN_VISIBLE_FILL_RATIO : clamp(ratio, 0, 1);
  }

  function syncHeader(layout, food) {
    const values = {
      kcal_value_text: String(food?.header?.kcal ?? food?.kcal ?? 'N/A'),
      basis_text: `PER\n${food?.basis?.value || 100}${String(food?.basis?.unit || 'g').toUpperCase()}`,
      script_caption: foodTypeTitle(food?.foodType),
      outro_score_value: formatScoreTally(food)
    };

    for (const section of SECTIONS) {
      for (const layer of getSectionLayers(layout, section.id)) {
        if (isTextLayer(layer)) {
          if (layer.id === 'food_name_text') {
            layer.text = headerFoodNameText(food, layer);
          } else if (values[layer.id] != null) {
            layer.text = values[layer.id];
          }
        }
        if (!isSpriteLayer(layer)) continue;
        const fingerprint = `${layer.src || ''} ${layer.label || ''}`.toLowerCase();
        if (fingerprint.includes('/header/food_images/') || /header food image$/.test(fingerprint)) {
          layer.src = foodImagePath(food);
          layer.fallbackSrc = foodPlatePath(food);
          syncFoodImageLayerGeometry(layer, food);
        } else if (fingerprint.includes('/header/food_type_plate/') || /header food type/.test(fingerprint)) {
          layer.src = typePlatePath(food);
        } else if (fingerprint.includes('/header/calorie_bubble/') || /header calorie bubble/.test(fingerprint)) {
          layer.src = calorieBubblePath(food);
        } else if (fingerprint.includes('/header/food_plate/') || fingerprint.includes('/header/food_image_plate/') || /header food image plate/.test(fingerprint)) {
          layer.src = foodPlatePath(food);
        } else if (fingerprint.includes('/ui/section_separator/') || /section separator/.test(fingerprint)) {
          layer.src = separatorPath(food);
        }
      }
    }
  }

  function syncHeaderFoodImage(layout, food) {
    for (const section of SECTIONS) {
      for (const layer of getSectionLayers(layout, section.id)) {
        if (!isSpriteLayer(layer)) continue;
        const fingerprint = `${layer.src || ''} ${layer.label || ''}`.toLowerCase();
        if (!fingerprint.includes('/header/food_images/') && !/header food image$/.test(fingerprint)) continue;
        layer.src = foodImagePath(food);
        layer.fallbackSrc = foodPlatePath(food);
        syncFoodImageLayerGeometry(layer, food);
      }
    }
  }

  function headerFoodNameText(food, layer) {
    const fit = window.FOODRANKED_DISPLAY_NAME_UTILS?.fitFoodNameForHeader?.(food, layer);
    if (fit) {
      layer.autoFontSize = fit.fontSize;
      return fit.text;
    }
    delete layer.autoFontSize;
    return String(food?.name || 'Unknown').toUpperCase();
  }

  function displayFoodNameForText(food, fallback = 'This food') {
    const rawName = String(food?.name || fallback).trim() || fallback;
    return window.FOODRANKED_DISPLAY_NAME_UTILS?.numberWordsToDigits
      ? window.FOODRANKED_DISPLAY_NAME_UTILS.numberWordsToDigits(rawName)
      : rawName;
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function displayFoodNameInText(text, food) {
    const rawName = String(food?.name || '').trim();
    const displayName = displayFoodNameForText(food, rawName || 'This food');
    if (!rawName || rawName === displayName) return String(text || '');
    return String(text || '').replace(new RegExp(escapeRegExp(rawName), 'gi'), displayName);
  }

  function syncSectionIndicators(layout, food) {
    if (!validLayout(layout)) return;
    for (const activeSection of SECTIONS) {
      const activeIndex = indicatorSectionIndex(activeSection.id);
      getSectionLayers(layout, activeSection.id)
        .filter(isSectionIndicator)
        .sort(compareIndicatorsByPosition)
        .forEach((layer, index) => {
          layer.src = indicatorPath(food, index === activeIndex);
        });
    }
  }

  function syncCurrentSectionIndicatorsForViewport() {
    if (!validLayout(state.layout)) return;
    syncSectionIndicators(state.layout, selectedFood());
  }

  function syncMacroText(layout, food) {
    for (const sectionId of ['fats', 'carbs', 'protein']) {
      const layers = getSectionLayers(layout, sectionId);
      macroSubmetricBindings(layout, sectionId, food).forEach((binding, index) => {
        const spec = binding.spec;
        const label = layers.find(layer => layer.id === `${sectionId}_submacro_label_${index + 1}`);
        const value = layers.find(layer => layer.id === `${sectionId}_submacro_value_${index + 1}`);
        if (label && !label.manualText) label.text = spec.label;
        if (value) {
          value.text = proteinQualitySpecAllowed(food, sectionId, spec) ? spec.value(food) : 'N/A';
          value.color = macroArrowPresentation(food, sectionId, spec).textColor;
        }
      });
    }
  }

  function macroScoreRows(layers) {
    const candidates = layers
      .filter(layer => isMacroScoreCard(layer) || isMacroArrow(layer))
      .map(layer => ({
        layer,
        id: layer.id || '',
        label: layer.label || '',
        src: layer.src || '',
        x: Number(layer.x) || 0,
        y: Number(layer.y) || 0,
        width: Number(layer.width) || 0,
        height: Number(layer.height) || 0
      }))
      .sort((a, b) => a.y - b.y || a.x - b.x);

    const rows = [];
    for (const item of candidates) {
      const centerY = item.y + ((item.height || 0) / 2);
      const existing = rows.find(row => Math.abs(centerY - row.centerY) <= 9);
      if (existing) {
        existing.items.push(item);
        existing.minX = Math.min(existing.minX, item.x);
        existing.maxX = Math.max(existing.maxX, item.x + item.width);
        existing.minY = Math.min(existing.minY, item.y);
        existing.maxY = Math.max(existing.maxY, item.y + item.height);
        existing.centerY = (existing.minY + existing.maxY) / 2;
      } else {
        rows.push({
          items: [item],
          minX: item.x,
          maxX: item.x + item.width,
          minY: item.y,
          maxY: item.y + item.height,
          centerY
        });
      }
    }
    return rows.sort((a, b) => a.minY - b.minY).slice(0, 4);
  }

  function macroSubmetricBindings(layout, sectionId, food = null) {
    const layers = getSectionLayers(layout, sectionId);
    const rows = macroScoreRows(layers);
    const specs = macroSubmetricSpecsForFood(sectionId, food);
    return specs.map((spec, index) => {
      const row = rows[index] || { items: [], minX: 8, maxX: 91, minY: 74 + (index * 18) };
      const arrowLayers = row.items.filter(item => isMacroArrow(item.layer)).map(item => item.layer);
      const arrowMinX = arrowLayers.length ? Math.min(...arrowLayers.map(layer => Number(layer.x) || 0)) : null;
      const valueWidth = 22;
      const labelX = clamp(Math.round(row.minX + 12), 4, 96);
      const valueX = arrowMinX == null
        ? clamp(Math.round(Math.max(labelX + 24, row.maxX - 30)), 34, 124)
        : clamp(Math.round(arrowMinX - valueWidth - 3), 34, 124);
      const y = clamp(Math.round(row.minY + 3), 42, 220);
      return {
        spec,
        row,
        arrowLayers,
        arrowMinX,
        labelX,
        valueX,
        y,
        labelWidth: Math.max(26, valueX - labelX - 4),
        valueWidth
      };
    });
  }

  function ensureMacroTextLayers(layout) {
    for (const sectionId of ['fats', 'carbs', 'protein']) {
      const layers = getSectionLayers(layout, sectionId);
      const topZ = layers.reduce((max, layer) => Math.max(max, Number(layer.z) || 0), 0) + 2;
      macroSubmetricBindings(layout, sectionId).forEach((binding, index) => {
        const labelId = `${sectionId}_submacro_label_${index + 1}`;
        const valueId = `${sectionId}_submacro_value_${index + 1}`;
        let label = layers.find(layer => layer.id === labelId);
        let value = layers.find(layer => layer.id === valueId);
        if (!label) {
          label = {
            id: labelId,
            kind: 'text',
            label: `${sectionId.toUpperCase()} score card label ${index + 1}`,
            x: binding.labelX,
            y: binding.y,
            z: topZ,
            visible: true,
            text: binding.spec.label,
            fontSize: 4,
            width: binding.labelWidth,
            align: 'left'
          };
          layers.push(label);
        }
        if (!value) {
          value = {
            id: valueId,
            kind: 'text',
            label: `${sectionId.toUpperCase()} score card value ${index + 1}`,
            x: binding.valueX,
            y: binding.y,
            z: topZ,
            visible: true,
            text: 'N/A',
            fontSize: 4,
            width: binding.valueWidth,
            align: 'right'
          };
          layers.push(value);
        }
        label.label = `${sectionId.toUpperCase()} score card label ${index + 1}`;
        label.fontSize = label.fontSize || 4;
        label.align = label.align || 'left';
        label.width = label.width || binding.labelWidth;
        label.z = label.z || topZ;
        value.label = `${sectionId.toUpperCase()} score card value ${index + 1}`;
        value.fontSize = value.fontSize || 4;
        value.align = value.align || 'right';
        value.z = value.z || topZ;
        const valueRight = (Number(value.x) || 0) + (Number(value.width) || binding.valueWidth);
        const overlapsArrowSlot = binding.arrowMinX != null && valueRight > binding.arrowMinX - 2;
        if (overlapsArrowSlot && !value.manualPosition) {
          value.x = binding.valueX;
          value.y = binding.y;
          value.width = binding.valueWidth;
        }
      });
    }
  }

  function ensureMacroTotalTextLayers(layout) {
    const specsBySection = {
      fats: [
        { id: 'fats_macro_label', label: 'FATS macro label', x: 35, y: 43, fontSize: 8, text: 'fats', width: 40, align: 'left' },
        { id: 'fats_macro_value', label: 'FATS macro grams', x: 35, y: 54, fontSize: 7, text: 'N/A', width: 34, align: 'left' }
      ],
      carbs: [
        { id: 'carbs_macro_label', label: 'CARBS macro label', x: 35, y: 43, fontSize: 8, text: 'CARBS', width: 40, align: 'left' },
        { id: 'carbs_macro_value', label: 'CARBS macro grams', x: 35, y: 54, fontSize: 7, text: 'N/A', width: 34, align: 'left' }
      ],
      protein: [
        { id: 'protein_macro_label', label: 'PROTEIN macro label', x: 35, y: 43, fontSize: 8, text: 'PROTEIN', width: 50, align: 'left' },
        { id: 'protein_macro_value', label: 'PROTEIN macro grams', x: 35, y: 54, fontSize: 7, text: 'N/A', width: 34, align: 'left' }
      ]
    };
    for (const [sectionId, specs] of Object.entries(specsBySection)) {
      const layers = getSectionLayers(layout, sectionId);
      const topZ = Math.max(9, layers.reduce((max, layer) => Math.max(max, Number(layer.z) || 0), 0) + 1);
      specs.forEach(spec => {
        let layer = layers.find(item => item.id === spec.id);
        if (!layer) {
          layer = {
            id: spec.id,
            kind: 'text',
            label: spec.label,
            x: spec.x,
            y: spec.y,
            z: topZ,
            visible: true,
            text: spec.text,
            fontSize: spec.fontSize,
            width: spec.width,
            align: spec.align
          };
          layers.push(layer);
        }
        layer.label = spec.label;
        layer.fontSize = layer.fontSize || spec.fontSize;
        layer.width = layer.width || spec.width;
        layer.align = layer.align || spec.align;
        layer.z = Math.max(Number(layer.z) || 0, topZ);
      });
    }
  }

  function syncMacroTotalTextForSection(layout, sectionId, labelText, valueText) {
    const layers = getSectionLayers(layout, sectionId);
    const label = layers.find(layer => layer.id === `${sectionId}_macro_label`);
    const value = layers.find(layer => layer.id === `${sectionId}_macro_value`);
    if (label && !label.manualText) label.text = labelText;
    if (value && !value.manualText) value.text = valueText;
  }

  function syncMacroTotalText(layout, food) {
    syncMacroTotalTextForSection(layout, 'fats', 'fats', formatMetric(food?.header?.fat_g, 'g'));
    syncMacroTotalTextForSection(layout, 'carbs', 'CARBS', formatMetric(macroTotalValue(food, 'carbs'), 'g'));
    syncMacroTotalTextForSection(layout, 'protein', 'PROTEIN', formatMetric(food?.header?.protein_g, 'g'));
  }

  function macroBarLayerSection(layer, fallbackSectionId = '') {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    if (fingerprint.includes('section_1_fats') || /\bfat(?:s)?[_ -]?(?:macro_)?bar/.test(fingerprint)) return 'fats';
    if (fingerprint.includes('section_2_carbs') || /\bcarb(?:s)?[_ -]?(?:macro_)?bar/.test(fingerprint)) return 'carbs';
    if (fingerprint.includes('section_3_protein') || /\bprotein[_ -]?(?:macro_)?bar/.test(fingerprint)) return 'protein';
    return ['fats', 'carbs', 'protein'].includes(fallbackSectionId) ? fallbackSectionId : '';
  }

  function isMacroBarFrame(layer) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return isSpriteLayer(layer) && /(macro_bar_frame|bar_frame|macro bar frame)/.test(fingerprint);
  }

  function isMacroBarFill(layer) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return isSpriteLayer(layer) && /(macro_bar_fill|bar_fill|macro bar fill)/.test(fingerprint);
  }

  const MACRO_BAR_LAYER_SPECS = {
    fats: {
      fillId: 'fats_macro_bar_fill',
      fillLabel: 'FATS macro bar fill',
      fillSrc: './sprites/macros_section/section_1_fats/fat_macro_bar_fill.gif',
      frameId: 'fats_macro_bar_frame',
      frameLabel: 'Macro bar frame',
      frameSrc: './sprites/macros_section/macro_bar_frame.png'
    },
    carbs: {
      fillId: 'carbs_macro_bar_fill',
      fillLabel: 'CARBS macro bar fill',
      fillSrc: './sprites/macros_section/section_2_carbs/carb_macro_bar_fill.gif',
      frameId: 'carbs_macro_bar_frame',
      frameLabel: 'Macro bar frame',
      frameSrc: './sprites/macros_section/macro_bar_frame.png'
    },
    protein: {
      fillId: 'protein_macro_bar_fill',
      fillLabel: 'PROTEIN macro bar fill',
      fillSrc: './sprites/macros_section/section_3_protein/protein_macro_bar_fill.gif',
      frameId: 'protein_macro_bar_frame',
      frameLabel: 'Macro bar frame',
      frameSrc: './sprites/macros_section/macro_bar_frame.png'
    }
  };

  function ensureMacroBarLayers(layout) {
    for (const [sectionId, spec] of Object.entries(MACRO_BAR_LAYER_SPECS)) {
      const layers = getSectionLayers(layout, sectionId);
      layers.forEach(layer => {
        if (!isMacroBarFill(layer) || macroBarLayerSection(layer, sectionId) !== sectionId) return;
        const isLibraryLayer = String(layer?.label || '').startsWith('Library: ') || /^lib_/i.test(String(layer?.id || ''));
        layer.src = spec.fillSrc;
        if (isLibraryLayer) return;
        layer.label = spec.fillLabel;
        if (sectionId === 'protein') layer.id = spec.fillId;
      });
      const hasFrame = spec.frameId
        ? layers.some(layer => isMacroBarFrame(layer) && macroBarLayerSection(layer, sectionId) === sectionId)
        : true;
      const hasFill = layers.some(layer => isMacroBarFill(layer) && macroBarLayerSection(layer, sectionId) === sectionId);
      if (!hasFill) {
        layers.push({
          id: spec.fillId,
          kind: 'sprite',
          label: spec.fillLabel,
          src: spec.fillSrc,
          x: 31,
          y: 48,
          z: 7,
          width: 88,
          height: 14,
          visible: true,
          foodDriven: true,
          preserveAspect: false,
          manualPosition: false
        });
      }
      if (!hasFrame) {
        layers.push({
          id: spec.frameId,
          kind: 'sprite',
          label: spec.frameLabel,
          src: spec.frameSrc,
          x: 31,
          y: 48,
          z: 8,
          width: 88,
          height: 14,
          visible: true,
          foodDriven: false,
          preserveAspect: false,
          manualPosition: false
        });
      }
    }
  }

  function syncMacroBars(layout, food) {
    for (const sectionId of ['fats', 'carbs', 'protein']) {
      const sectionLayers = getSectionLayers(layout, sectionId);
      const frameZ = sectionLayers
        .filter(isMacroBarFrame)
        .reduce((maxZ, layer) => Math.max(maxZ, Number(layer.z) || 0), 0);
      for (const layer of sectionLayers) {
        if (isMacroBarFrame(layer)) {
          layer.label = layer.label || 'Macro bar frame';
        }
        if (!isMacroBarFill(layer)) continue;
        const layerSection = macroBarLayerSection(layer, sectionId) || sectionId;
        layer.label = layer.label || `${layerSection.toUpperCase()} macro bar fill`;
        layer.fillRatio = macroBarFillRatio(food, layerSection);
        layer.fillRange = macroFillRange(food?.foodType, layerSection);
        layer.fillValue = macroValue(food, layerSection);
        layer.z = Math.max(Number(layer.z) || 0, frameZ + 1);
      }
    }
  }

  function episodeDisplayItemForSpec(food, sectionId, spec) {
    const sectionKey = ruleSectionKey(sectionId);
    const section = food?.episode?.script?.sections?.find(item => item.key === sectionId || item.key === sectionKey);
    const metricKeys = [spec.key, ...(spec.displayMetricKeys || [])];
    return (section?.displayItems || []).find(item => metricKeys.includes(item.metricKey)) || null;
  }

  function metricRuleForSpec(food, sectionId, spec) {
    if (sectionId === 'protein' && ['protein_g', 'protein_g_fallback'].includes(spec.key) && food?.ruleset?.proteinFallback) {
      return {
        metricKey: food.ruleset.proteinFallback.metricKey || 'protein_g_fallback',
        sectionKey: 'proteins',
        scoringMode: 'arrow_bands',
        polarity: 'higher_better',
        bands: food.ruleset.proteinFallback.bands || []
      };
    }
    const sectionKey = ruleSectionKey(sectionId);
    const bySection = food?.ruleset?.metricRulesBySection?.[sectionKey] || food?.ruleset?.metricRulesBySection?.[sectionId] || [];
    return bySection.find(rule => (
      rule.metricKey === spec.key
      && rule.applicability !== 'not_applicable'
      && (rule.weight ?? 1) > 0
    )) || null;
  }

  function rawMetricValueForSpec(food, sectionId, spec) {
    if (!proteinQualitySpecAllowed(food, sectionId, spec)) return null;
    if (sectionId === 'protein' && ['protein_g', 'protein_g_fallback'].includes(spec.key)) return asNumber(food?.header?.protein_g, null);
    if (['fats', 'carbs', 'protein'].includes(sectionId)) return macroSubmetricDisplayValue(food, sectionId, spec.key);
    return asNumber(food?.metrics?.[spec.key], null);
  }

  function ruleBandForValue(rule, value) {
    if (!rule || value == null) return null;
    return (rule.bands || []).find(band => {
      const aboveMin = band.min == null || value >= Number(band.min);
      const belowMax = band.max == null || value <= Number(band.max);
      return aboveMin && belowMax;
    }) || null;
  }

  function batchMetricBreakdownItemForSpec(food, sectionId, spec) {
    const sectionKey = ruleSectionKey(sectionId);
    const metricKeys = [spec.key, ...(spec.displayMetricKeys || [])];
    const breakdown = food?.batchResult?.metricBreakdown || [];
    return breakdown.find(item => {
      return metricKeys.includes(item.metricKey) && (!item.sectionKey || item.sectionKey === sectionId || item.sectionKey === sectionKey);
    }) || null;
  }

  function proteinQualitySpecAllowed(food, sectionId, spec) {
    if (sectionId !== 'protein' || !PROTEIN_QUALITY_METRIC_KEYS.has(spec.key)) return true;
    return proteinMetricDisplayValue(food, spec.key) != null
      || !!episodeDisplayItemForSpec(food, sectionId, spec)
      || !!batchMetricBreakdownItemForSpec(food, sectionId, spec);
  }

  function arrowBandForSpec(food, sectionId, spec) {
    const displayItem = episodeDisplayItemForSpec(food, sectionId, spec);
    if (displayItem?.band) return displayItem.band;
    const batchBreakdownItem = batchMetricBreakdownItemForSpec(food, sectionId, spec);
    if (batchBreakdownItem?.band) return batchBreakdownItem.band;
    const rule = metricRuleForSpec(food, sectionId, spec);
    return ruleBandForValue(rule, rawMetricValueForSpec(food, sectionId, spec))?.label || null;
  }

  function parseArrowBand(band, polarity = null) {
    const normalized = String(band || '').trim().toLowerCase();
    const named = normalized.match(/^([123])_(green|red)$/);
    if (named) return { count: Number(named[1]), color: named[2], direction: null };
    const higherWorse = polarity === 'higher_worse';
    const upCount = (normalized.match(/↑/g) || []).length;
    if (upCount) return { count: clamp(upCount, 1, 3), color: higherWorse ? 'red' : 'green', direction: 'up' };
    const downCount = (normalized.match(/↓/g) || []).length;
    if (downCount) return { count: clamp(downCount, 1, 3), color: higherWorse ? 'green' : 'red', direction: 'down' };
    return { count: 0, color: 'green', direction: null };
  }

  function macroArrowPresentation(food, sectionId, spec) {
    const rule = metricRuleForSpec(food, sectionId, spec);
    const parsed = parseArrowBand(arrowBandForSpec(food, sectionId, spec), rule?.polarity);
    const higherWorse = rule?.polarity === 'higher_worse';
    const usesProteinReferenceFallback = sectionId === 'protein' && !['protein_g', 'protein_g_fallback'].includes(spec.key);
    const proteinReferenceValue = usesProteinReferenceFallback ? rawMetricValueForSpec(food, sectionId, spec) : null;
    const proteinReferenceColor = proteinReferenceTextColor(spec.key, proteinReferenceValue);
    const proteinReferenceArrow = usesProteinReferenceFallback
      ? proteinReferenceArrowPresentation(spec.key, proteinReferenceValue)
      : null;
    const count = parsed.count || proteinReferenceArrow?.count || 0;
    const color = parsed.count ? parsed.color : proteinReferenceArrow?.color || parsed.color;
    const direction = parsed.count ? parsed.direction : proteinReferenceArrow?.direction || parsed.direction;
    const pointsDown = direction ? direction === 'down' : color === 'green' ? higherWorse : !higherWorse;
    return {
      ...parsed,
      count,
      color,
      direction,
      flipY: !!count && pointsDown,
      textColor: parsed.count
        ? (SUBMACRO_VALUE_COLORS[color] || SUBMACRO_VALUE_COLORS.neutral)
        : proteinReferenceValue != null
          ? proteinReferenceColor
          : SUBMACRO_VALUE_COLORS.neutral
    };
  }

  function proteinReferenceTextColor(metricKey, value) {
    const safe = asNumber(value, null);
    if (safe == null) return SUBMACRO_VALUE_COLORS.neutral;
    if (metricKey === 'collagen_g') return safe >= 3 ? SUBMACRO_VALUE_COLORS.green : SUBMACRO_VALUE_COLORS.red;
    if (metricKey === 'essential_amino_acids_score') return safe >= 3 ? SUBMACRO_VALUE_COLORS.green : SUBMACRO_VALUE_COLORS.red;
    if (metricKey === 'nonessential_amino_acids_score') return safe >= 4 ? SUBMACRO_VALUE_COLORS.green : SUBMACRO_VALUE_COLORS.red;
    if (metricKey === 'bioavailability_percent') return safe >= 40 ? SUBMACRO_VALUE_COLORS.green : SUBMACRO_VALUE_COLORS.red;
    return SUBMACRO_VALUE_COLORS.green;
  }

  function proteinReferenceArrowPresentation(metricKey, value) {
    const safe = asNumber(value, null);
    if (safe == null) return null;
    if (metricKey === 'collagen_g') return safe >= 3
      ? { count: 2, color: 'green', direction: null }
      : { count: 1, color: 'red', direction: null };
    if (metricKey === 'essential_amino_acids_score') {
      if (safe >= 8) return { count: 3, color: 'green', direction: null };
      if (safe >= 6) return { count: 2, color: 'green', direction: null };
      if (safe >= 3) return { count: 1, color: 'green', direction: null };
      return { count: 3, color: 'red', direction: null };
    }
    if (metricKey === 'nonessential_amino_acids_score') {
      if (safe >= 10) return { count: 3, color: 'green', direction: null };
      if (safe >= 8) return { count: 2, color: 'green', direction: null };
      if (safe >= 4) return { count: 1, color: 'green', direction: null };
      return { count: 3, color: 'red', direction: null };
    }
    if (metricKey === 'bioavailability_percent') {
      if (safe >= 85) return { count: 3, color: 'green', direction: null };
      if (safe >= 60) return { count: 2, color: 'green', direction: null };
      if (safe >= 40) return { count: 1, color: 'green', direction: null };
      return { count: 3, color: 'red', direction: null };
    }
    return { count: 1, color: 'green', direction: null };
  }

  function visibleArrowIndexes(count, total) {
    if (count >= total) return new Set(Array.from({ length: total }, (_, index) => index));
    if (count === 1) return new Set([Math.floor(total / 2)]);
    if (count === 2 && total >= 3) return new Set([0, total - 1]);
    return new Set(Array.from({ length: Math.max(0, count) }, (_, index) => index));
  }

  function syncMacroArrows(layout, food) {
    for (const sectionId of ['fats', 'carbs', 'protein']) {
      macroSubmetricBindings(layout, sectionId, food).forEach(binding => {
        const arrows = binding.arrowLayers.sort((a, b) => (Number(a.x) || 0) - (Number(b.x) || 0));
        if (!arrows.length) return;
        const presentation = macroArrowPresentation(food, sectionId, binding.spec);
        const visibleIndexes = visibleArrowIndexes(presentation.count, arrows.length);
        arrows.forEach((layer, index) => {
          layer.src = appSpritePath(`macros_section/arrow_indicators/${presentation.color === 'red' ? 'red' : 'green'}_arrow.png`);
          layer.label = `${presentation.color === 'red' ? 'Red' : 'Green'} ${presentation.flipY ? 'down' : 'up'} arrow indicator`;
          layer.flipY = !!presentation.flipY;
          layer.visible = visibleIndexes.has(index);
        });
      });
    }
  }

  function syncMicros(layout, food, sectionId, specs, labelPrefix, valuePrefix) {
    const layers = getSectionLayers(layout, sectionId);
    const columns = microsColumns(layers);
    specs.forEach((spec, index) => {
      const label = layers.find(layer => layer.id === `${labelPrefix}_${index + 1}`);
      const value = layers.find(layer => layer.id === `${valuePrefix}_${index + 1}`);
      if (label && !label.manualText) label.text = spec.shortLabel;
      if (value && !value.manualText) value.text = formatDvPercent(food, spec.key);

      const step = micronutrientStep(food?.metrics?.[spec.key]);
      const visiblePercent = step == null ? 0 : step * 10;
      const column = nearestColumn(columns, value || label, index);
      if (!column) return;
      column.items.forEach(item => {
        item.layer.visible = step != null && item.percent <= visiblePercent;
      });
      if (value) {
        if (value.manualPosition) return;
        const anchorPercent = Math.max(10, visiblePercent);
        const anchor = column.items.find(item => item.percent === anchorPercent) || column.items[0];
        if (anchor) {
          const bar = anchor.layer;
          const barWidth = Number(bar.width) || 11;
          value.width = Math.max(6, Math.min(10, barWidth));
          value.x = Math.round((Number(bar.x) || 0) + ((barWidth - value.width) / 2));
          value.y = clamp(Math.round((Number(bar.y) || 0) + 1), 44, 220);
          value.align = 'center';
          value.fontSize = 2.5;
          value.z = Math.max(Number(value.z) || 0, (Number(bar.z) || 0) + 5);
        }
      }
    });
  }

  function syncProsCons(layout, food) {
    for (const sectionId of ['pros', 'cons']) {
      const layers = getSectionLayers(layout, sectionId);
      const items = food?.contextItems?.[sectionId] || [];
      for (let index = 0; index < 3; index += 1) {
        const impact = layers.find(layer => layer.id === `${sectionId}_impact_${index + 1}`);
        const item = layers.find(layer => layer.id === `${sectionId}_item_${index + 1}`);
        if (impact && !impact.manualText) impact.text = formatImpact(items[index]?.impactLevel);
        if (item && !item.manualText) item.text = items[index]?.title || `${sectionId === 'pros' ? 'Positive' : 'Negative'} point ${index + 1}`;
      }
    }
  }

  function formatImpact(level) {
    const value = String(level || '').toLowerCase();
    if (value.includes('major')) return 'MAJOR';
    if (value.includes('minor')) return 'MINOR';
    return 'POINT';
  }

  function overallScore(food) {
    return food?.episode?.overallScore ?? food?.batchResult?.overallScore ?? food?.overallScore ?? null;
  }

  function scoreTally(food) {
    const candidates = [
      food?.episode?.rankingScore,
      food?.batchResult?.rankingScore,
      food?.rankingScore,
      food?.episode?.rankingScoreExact,
      food?.batchResult?.rankingScoreExact,
      food?.rankingScoreExact,
      food?.episode?.anomalyAdjustedScore,
      food?.batchResult?.anomalyAdjustedScore,
      food?.anomalyAdjustedScore,
      food?.episode?.anomalyAdjustedScoreExact,
      food?.batchResult?.anomalyAdjustedScoreExact,
      food?.anomalyAdjustedScoreExact,
      food?.episode?.calibratedOverallScore,
      food?.batchResult?.calibratedOverallScore,
      food?.calibratedOverallScore,
      overallScore(food)
    ];
    for (const candidate of candidates) {
      const score = asNumber(candidate, null);
      if (score != null) return score;
    }
    return null;
  }

  function scoreTier(food) {
    return food?.episode?.tier || food?.batchResult?.tier || food?.tier || food?.expectedTier || '';
  }

  function normalizedTier(value) {
    const normalized = String(value || '').trim().toUpperCase();
    const match = normalized.match(/^([SABCD])(?:\s*TIER)?\.?$/);
    const tier = match?.[1] || '';
    return OUTRO_TIER_SPRITE_PATHS[tier] ? tier : '';
  }

  function outroTierForFood(food) {
    return normalizedTier(scoreTier(food));
  }

  function outroTierSpritePath(tier) {
    return OUTRO_TIER_SPRITE_PATHS[normalizedTier(tier)] || '';
  }

  function outroTierStampLabel(tier) {
    const normalized = normalizedTier(tier);
    return normalized ? `${normalized} tier verdict stamp` : 'Tier verdict stamp';
  }

  function outroTierGlowRgb(tier) {
    return OUTRO_TIER_GLOW_RGB[normalizedTier(tier)] || OUTRO_TIER_GLOW_RGB.D;
  }

  function formatScoreTally(food) {
    const score = scoreTally(food);
    return score == null ? 'N/A' : formatCompactNumber(score, 0);
  }

  function syncOutroScoreValue(layout, food) {
    const layer = getSectionLayers(layout, 'outro').find(item => item.id === 'outro_score_value');
    if (!layer) return;
    layer.label = 'OUTRO numerical score';
    layer.text = formatScoreTally(food);
  }

  function hexToRgb(color) {
    const value = String(color || '').trim();
    const match = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) return null;
    const hex = match[1].length === 3
      ? match[1].split('').map(char => `${char}${char}`).join('')
      : match[1];
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16)
    };
  }

  function rgbToHex({ r, g, b }) {
    return `#${[r, g, b].map(value => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')).join('')}`;
  }

  function mixHexColor(from, to, amount) {
    const start = hexToRgb(from);
    const end = hexToRgb(to);
    if (!start || !end) return to;
    const t = clamp(amount, 0, 1);
    return rgbToHex({
      r: start.r + ((end.r - start.r) * t),
      g: start.g + ((end.g - start.g) * t),
      b: start.b + ((end.b - start.b) * t)
    });
  }

  function scoreGradeColor(score) {
    const safe = asNumber(score, null);
    if (safe == null) return SUBMACRO_VALUE_COLORS.neutral;
    if (safe < 20) return SUBMACRO_VALUE_COLORS.red;
    if (safe >= 60) return SUBMACRO_VALUE_COLORS.green;
    if (safe < 40) return mixHexColor(SUBMACRO_VALUE_COLORS.red, '#f6c65f', (safe - 20) / 20);
    return mixHexColor('#f6c65f', SUBMACRO_VALUE_COLORS.green, (safe - 40) / 20);
  }

  function outroScoreGlowStyle(food) {
    const tier = String(scoreTier(food)).toUpperCase();
    const score = scoreTally(food);
    if (tier === 'S' || asNumber(score, 0) >= 80) {
      return {
        gradeClass: 'score-grade-s',
        color: '#00bfa5',
        core: 'rgba(196, 255, 246, 0.98)',
        soft: 'rgba(0, 191, 165, 0.86)',
        wide: 'rgba(124, 242, 167, 0.46)'
      };
    }

    const color = scoreGradeColor(score);
    return {
      gradeClass: 'score-grade-standard',
      color,
      core: colorWithAlpha(color, 0.98),
      soft: colorWithAlpha(color, 0.72),
      wide: colorWithAlpha(color, 0.38)
    };
  }

  function applyOutroScoreGlow(node, layer, food) {
    if (String(layer?.id || '').toLowerCase() !== 'outro_score_value') return;
    const style = outroScoreGlowStyle(food);
    node.classList.add('outro-score-glow', style.gradeClass);
    node.style.color = style.color;
    node.style.setProperty('--outro-score-color', style.color);
    node.style.setProperty('--outro-score-glow-core', style.core);
    node.style.setProperty('--outro-score-glow-soft', style.soft);
    node.style.setProperty('--outro-score-glow-wide', style.wide);
  }

  function applyTierStampNodeClasses(node, layer, food) {
    if (!isOutroFinalRevealStampLayer(layer)) return;
    const tier = normalizedTier(layer?.tier || scoreTier(food));
    node.classList.add('tier-stamp');
    if (tier) {
      node.classList.add(`tier-stamp-${tier.toLowerCase()}`);
      node.style.setProperty('--tier-stamp-glow-rgb', outroTierGlowRgb(tier));
    }
    if (tier === 'S' && layer?.stampRole === 'tier') {
      node.classList.add('s-tier-premium-stamp');
    }
  }

  function outroCtaStampSpecs() {
    const stepX = OUTRO_CTA_STAMP_SIZE + OUTRO_CTA_STAMP_GAP_X;
    return [
      { id: 'outro_like_stamp', label: 'Like stamp', src: OUTRO_LIKE_SPRITE_PATH, centerOffsetX: -stepX },
      { id: 'outro_follow_stamp', label: 'Follow stamp', src: OUTRO_FOLLOW_SPRITE_PATH, centerOffsetX: 0 },
      { id: 'outro_share_stamp', label: 'Share stamp', src: OUTRO_SHARE_SPRITE_PATH, centerOffsetX: stepX }
    ];
  }

  function syncOutroSTierPremiumVfxLayers(layers, tierLayer, tier) {
    const visible = normalizedTier(tier) === 'S';
    const baseWidth = Number(tierLayer?.width) || OUTRO_TIER_STAMP_SIZE;
    const baseHeight = Number(tierLayer?.height) || OUTRO_TIER_STAMP_SIZE;
    const baseX = Number(tierLayer?.x) || 28.5;
    const baseY = Number(tierLayer?.y) || 62.5;
    const baseCenterX = baseX + (baseWidth / 2);
    const baseCenterY = baseY + (baseHeight / 2);
    const useCenterAnchor = tierLayer?.centerAnchor === 'visible-canvas';
    const baseOffsetX = Number(tierLayer?.centerOffsetX) || 0;
    const baseOffsetY = Number(tierLayer?.centerOffsetY) || 0;
    const baseZ = Number(tierLayer?.z) || 38;

    OUTRO_S_TIER_PREMIUM_GLIMMERS.forEach((spec, index) => {
      let layer = layers.find(item => item.id === spec.id);
      if (!layer) {
        layer = {
          id: spec.id,
          kind: 'text',
          label: 'S tier premium sparkle',
          text: spec.text
        };
        layers.push(layer);
      }

      layer.kind = 'text';
      layer.label = 'S tier premium sparkle';
      layer.text = spec.text;
      layer.visible = visible;
      layer.effect = 's-tier-premium-glimmer';
      layer.color = spec.color;
      layer.fontSize = spec.size;
      layer.width = spec.size;
      layer.height = spec.size;
      layer.align = 'center';
      layer.z = baseZ + 6 + index;
      layer.animationDelay = `${spec.delay}s`;
      if (useCenterAnchor) {
        layer.centerAnchor = 'visible-canvas';
        layer.centerOffsetX = baseOffsetX + spec.offsetX;
        layer.centerOffsetY = baseOffsetY + spec.offsetY;
      } else {
        layer.centerAnchor = '';
        layer.x = baseCenterX + spec.offsetX - (spec.size / 2);
        layer.y = baseCenterY + spec.offsetY - (spec.size / 2);
      }
    });
  }

  function ensureOutroTierStampLayer(layout, food) {
    const layers = getSectionLayers(layout, 'outro');
    let layer = layers.find(item => item.id === OUTRO_TIER_STAMP_ID)
      || layers.find(item => item.id === OUTRO_TIER_STAMP_LEGACY_ID);
    const hadExistingLayer = Boolean(layer);
    if (!layer) {
      layer = {
        id: OUTRO_TIER_STAMP_ID,
        kind: 'sprite',
        label: 'Tier verdict stamp',
        src: OUTRO_TIER_SPRITE_PATHS.D,
        x: 28.5,
        y: 62.5,
        z: 38,
        width: OUTRO_TIER_STAMP_SIZE,
        height: OUTRO_TIER_STAMP_SIZE,
        visible: true,
        foodDriven: false,
        preserveAspect: true,
        aspectRatio: 1,
        centerAnchor: 'visible-canvas',
        centerOffsetX: 0,
        centerOffsetY: 0,
        stampRole: 'tier',
        effect: 'tier-stamp'
      };
      layers.push(layer);
    }

    const tier = outroTierForFood(food);
    const tierSpritePath = outroTierSpritePath(tier);
    layer.id = OUTRO_TIER_STAMP_ID;
    layer.src = tierSpritePath || OUTRO_TIER_SPRITE_PATHS.D;
    layer.label = outroTierStampLabel(tier);
    layer.visible = Boolean(tierSpritePath);
    layer.tier = tier;
    layer.stampRole = 'tier';
    layer.effect = 'tier-stamp';
    if (layer.preserveAspect !== false) layer.preserveAspect = true;
    if (!Number.isFinite(Number(layer.x))) layer.x = 28.5;
    if (!Number.isFinite(Number(layer.y))) layer.y = 62.5;
    if (!Number.isFinite(Number(layer.z))) layer.z = 38;
    layer.width = OUTRO_TIER_STAMP_SIZE;
    layer.height = OUTRO_TIER_STAMP_SIZE;
    if (!Number.isFinite(Number(layer.aspectRatio))) layer.aspectRatio = 1;
    if (!hadExistingLayer && !layer.centerAnchor) layer.centerAnchor = 'visible-canvas';
    if (layer.centerAnchor === 'visible-canvas') {
      if (!Number.isFinite(Number(layer.centerOffsetX))) layer.centerOffsetX = 0;
      if (!Number.isFinite(Number(layer.centerOffsetY))) layer.centerOffsetY = 0;
    }

    outroCtaStampSpecs().forEach((spec, index) => {
      let ctaLayer = layers.find(item => item.id === spec.id);
      if (!ctaLayer) {
        ctaLayer = {
          id: spec.id,
          kind: 'sprite',
          label: spec.label,
          src: spec.src,
          x: 55.8 + (index * 11.7),
          y: 121,
          z: 39 + index,
          width: OUTRO_CTA_STAMP_SIZE,
          height: OUTRO_CTA_STAMP_SIZE,
          visible: true,
          foodDriven: false,
          preserveAspect: true,
          aspectRatio: 1,
          centerAnchor: 'visible-canvas',
          centerOffsetX: spec.centerOffsetX,
          centerOffsetY: OUTRO_CTA_STAMP_CENTER_Y,
          stampRole: 'cta',
          effect: 'tier-stamp'
        };
        layers.push(ctaLayer);
      }
      ctaLayer.label = spec.label;
      ctaLayer.src = spec.src;
      ctaLayer.visible = Boolean(tierSpritePath);
      ctaLayer.tier = tier;
      ctaLayer.stampRole = 'cta';
      ctaLayer.effect = 'tier-stamp';
      ctaLayer.preserveAspect = true;
      ctaLayer.aspectRatio = 1;
      ctaLayer.width = OUTRO_CTA_STAMP_SIZE;
      ctaLayer.height = OUTRO_CTA_STAMP_SIZE;
      ctaLayer.centerAnchor = 'visible-canvas';
      ctaLayer.centerOffsetX = spec.centerOffsetX;
      ctaLayer.centerOffsetY = OUTRO_CTA_STAMP_CENTER_Y;
      ctaLayer.z = 39 + index;
    });
    syncOutroSTierPremiumVfxLayers(layers, layer, tier);
  }

  function normalizeOutroScoreLayout(layout) {
    const layer = getSectionLayers(layout, 'outro').find(item => item.id === 'outro_score_value');
    if (!layer) return;
    layer.x = 64;
    layer.y = 24;
    layer.fontSize = 5;
    layer.width = 5;
    layer.align = 'center';
    layer.z = 11;
  }

  function deletedLayerIdSet(layout) {
    return new Set((Array.isArray(layout?.meta?.deletedLayerIds) ? layout.meta.deletedLayerIds : [])
      .map(id => String(id || '').trim())
      .filter(Boolean));
  }

  function filterDeletedLayers(layout) {
    const deletedIds = deletedLayerIdSet(layout);
    if (!deletedIds.size) return;
    for (const section of SECTIONS) {
      layout.sections[section.id].layers = getSectionLayers(layout, section.id)
        .filter(layer => !layer.id || !deletedIds.has(String(layer.id)));
    }
  }

  function hydrateLayoutForFood({ requestExport = true } = {}) {
    const food = selectedFood();
    const selectedSource = selectedLayoutSourceOption();
    const layout = selectedLayoutBase(selectedSource);
    if (!validLayout(layout)) {
      state.layout = null;
      const requested = requestExport ? requestDisplayBuilderV2PlacementExport(food) : false;
      const status = requested || state.displayBuilderExportStatus === 'building'
        ? 'building'
        : state.displayBuilderExportStatus === 'missing-source'
          ? 'missing'
          : 'missing export';
      els.layoutStatus.textContent = `DBv2 ${status}`;
      els.layoutStatus.title = `${food?.name || 'Selected food'} ${status} Display Builder v2 placement · ${BUILDER_BUILD_ID}`;
      return;
    }
    ensureOutroTierStampLayer(layout, food);
    syncHeaderFoodImage(layout, food);
    syncOutroScoreValue(layout, food);
    state.layout = layout;
    state.displayBuilderExportStatus = 'ready';
    syncSectionIndicators(layout, food);
    prewarmMacroBarGifVariants(layout, food);
    const layoutLabel = selectedSource?.label || 'Display Builder v2 placement';
    els.layoutStatus.textContent = 'DBv2 ready';
    els.layoutStatus.title = `${layoutLabel} · ${BUILDER_BUILD_ID}`;
  }

  function captionFromEpisode(food, sectionId) {
    const subtitleCues = subtitleCuesForScene(food, sectionId);
    if (subtitleCues.length) return subtitleCues.map(cue => cue.lines.join(' ')).join(' ');

    const blocks = food?.episode?.script?.narrationBlocks || [];
    if (sectionId === 'intro') return `${displayFoodNameForText(food)} ranked.`;
    if (sectionId === 'outro') {
      const summary = blocks.find(block => block.kind === 'closing_summary')?.text || food?.episode?.summary || '';
      const final = blocks.find(block => block.kind === 'final_reveal')?.text || `${food?.episode?.tier || food?.expectedTier || '—'} tier.`;
      return subtitleOnlyCaptionText([summary, final].filter(Boolean).join(' '));
    }
    const episodeKey = sectionId === 'protein' ? 'proteins' : sectionId;
    const sectionSubtitle = food?.episode?.script?.sections?.find(section => section.key === sectionId || section.key === episodeKey)?.subtitleText;
    const narrationFallback = blocks.find(block => block.kind === 'section' && (block.sectionKey === sectionId || block.sectionKey === episodeKey))?.text;
    return subtitleOnlyCaptionText(displayFoodNameInText(sectionSubtitle || narrationFallback || fallbackCaption(food, sectionId), food));
  }

  function episodeSceneId(sectionId) {
    return {
      intro: 'hook',
      protein: 'proteins',
      outro: 'final'
    }[sectionId] || sectionId;
  }

  function subtitleOnlyCaptionText(text) {
    return String(text || '')
      .replace(/\braw grams display\b/gi, 'raw values display')
      .replace(/\b([a-z]+) grams already shown\b/gi, '$1 numbers already shown')
      .replace(/\bmaintenance-and-repair\b/gi, 'maintenance repair')
      .replace(/\b(\d+(?:\.\d+)?)\s+micrograms?\b/gi, '$1mcg')
      .replace(/\b(\d+(?:\.\d+)?)\s+milligrams?\b/gi, '$1mg')
      .replace(/\b(\d+(?:\.\d+)?)\s+kilograms?\b/gi, '$1kg')
      .replace(/\b(\d+(?:\.\d+)?)\s+grams?\b/gi, '$1g')
      .replace(/\b(\d+(?:\.\d+)?)\s+calories?\b/gi, '$1kcal')
      .replace(/\bmicrograms?\b/gi, 'mcg')
      .replace(/\bmilligrams?\b/gi, 'mg')
      .replace(/\bkilograms?\b/gi, 'kg')
      .replace(/\bgrams?\b/gi, 'g')
      .replace(/\b(\d+)\.\s+(\d+)(?=\s*(?:mcg|mg|kg|kcal|g|%|\b))/gi, '$1.$2')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function subtitleCuesForScene(food, sectionId) {
    const sceneId = episodeSceneId(sectionId);
    const cues = food?.episode?.subtitles || [];
    if (!Array.isArray(cues)) return [];
    return cues
      .filter(cue => cue.sceneId === sceneId)
      .map(cue => normalizeSubtitleCue(cue, food));
  }

  function normalizeSubtitleCue(cue, food) {
    const rawLines = Array.isArray(cue?.lines) && cue.lines.length
      ? cue.lines
      : String(cue?.text || '').split(/\r?\n/);
    const text = subtitleOnlyCaptionText(displayFoodNameInText(rawLines.join(' '), food));
    const placement = captionPlacementForCue(cue, text);
    const chunks = captionChunks(text, captionLineCharsForPlacement(placement));
    const firstChunk = chunks[0] || { lines: [text].filter(Boolean), text };
    const lines = firstChunk.lines.slice(0, CAPTION_MAX_LINES);
    return {
      ...cue,
      placement,
      maxLines: CAPTION_MAX_LINES,
      maxCharactersPerLine: captionLineCharsForPlacement(placement),
      lines,
      text: lines.join('\n')
    };
  }

  function captionPlacementForCue(cue, text) {
    const normalizedText = subtitleOnlyCaptionText(text || cue?.text || (cue?.lines || []).join(' '));
    if (cue?.sceneId === 'final' && TIER_REVEAL_RE.test(normalizedText)) return 'tier-center';
    if (cue?.placement) {
      const placement = String(cue.placement);
      if (placement === 'tier-center') return 'tier-center';
      if (placement === 'summary-full') return 'summary-full';
      if (cue?.sceneId === 'final' && ['subtitle-floor', 'verdict-payoff', 'outro-center', 'center', 'center-stage'].includes(placement)) {
        return 'summary-full';
      }
      return placement;
    }
    if (cue?.sceneId === 'final') return 'summary-full';
    return 'lower-third';
  }

  function captionLineCharsForPlacement(placement) {
    if (placement === 'summary-full') return CAPTION_SUMMARY_LINE_CHARS;
    if (placement === 'tier-center') return CAPTION_TIER_LINE_CHARS;
    return CAPTION_MAX_LINE_CHARS;
  }

  function fallbackCaption(food, sectionId) {
    const name = displayFoodNameForText(food);
    const metrics = food?.metrics || {};
    const header = food?.header || {};
    const fallbacks = {
      fats: `${formatMetric(header.fat_g, 'g')} of fat. Saturated fat: ${formatMetric(metrics.saturated_fat_g, 'g')}.`,
      carbs: `${formatMetric(header.carb_g, 'g')} of carbs. Fibre: ${formatMetric(metrics.fibre_g, 'g')}.`,
      protein: `${formatMetric(header.protein_g, 'g')} of protein. Bioavailability: ${formatMetric(metrics.bioavailability_percent, '%')}.`,
      vitamins: `Vitamin support: B12 ${formatDvPercent(food, 'vitamin_b12_dv')}, E ${formatDvPercent(food, 'vitamin_e_dv')}.`,
      minerals: `Mineral support: iron ${formatDvPercent(food, 'iron_dv')}, zinc ${formatDvPercent(food, 'zinc_dv')}.`,
      pros: `${name} has three useful upside points.`,
      cons: `${name} has three practical drawbacks.`
    };
    return fallbacks[sectionId] || `${name} ranked.`;
  }

  function episodeSceneTiming(food, sectionId) {
    const episodeId = episodeSceneId(sectionId);
    return food?.episode?.sceneTimings?.find(scene => scene.id === episodeId) || null;
  }

  function buildScenes(food, previous = []) {
    return SECTIONS.map(section => {
      const existing = previous.find(scene => scene.id === section.id);
      const episodeTiming = episodeSceneTiming(food, section.id);
      const holdSeconds = sectionHoldSeconds(section.id);
      const existingHold = asNumber(existing?.holdSeconds, holdSeconds);
      const narrationDelay = sectionNarrationDelaySeconds(section.id, food);
      const narrationDuration = Math.max(
        0.4,
        asNumber(existing?.narrationDurationSeconds, null)
          ?? (asNumber(existing?.contentDurationSeconds, null) != null
            ? Math.max(0.4, asNumber(existing.contentDurationSeconds, 0) - asNumber(existing.narrationDelaySeconds, 0))
            : null)
          ?? (asNumber(existing?.duration, null) != null ? Math.max(0.4, asNumber(existing.duration, 0) - existingHold) : null)
          ?? episodeTiming?.durationSeconds
          ?? section.duration
      );
      const contentDuration = narrationDelay + narrationDuration;
      return {
        id: section.id,
        label: section.label,
        duration: Number((contentDuration + holdSeconds).toFixed(3)),
        contentDurationSeconds: Number(contentDuration.toFixed(3)),
        narrationDelaySeconds: Number(narrationDelay.toFixed(3)),
        narrationDurationSeconds: Number(narrationDuration.toFixed(3)),
        holdSeconds,
        reveal: existing?.reveal || section.reveal,
        captionSize: existing?.captionSize || 22,
        caption: existing?.caption || captionFromEpisode(food, section.id),
        subtitleCues: existing?.subtitleCues || subtitleCuesForScene(food, section.id)
      };
    });
  }

  function sectionHoldSeconds(sectionId) {
    if (sectionId === 'outro') return OUTRO_HOLD_SECONDS;
    return SECTION_HOLD_IDS.has(sectionId) ? SECTION_HOLD_SECONDS : 0;
  }

  function hideSceneCaptions(scene) {
    return HIDDEN_CAPTION_SECTION_IDS.has(scene?.id);
  }

  function sceneHoldSeconds(scene) {
    return Math.max(0, asNumber(scene?.holdSeconds, sectionHoldSeconds(scene?.id)) || 0);
  }

  function sceneContentDuration(scene) {
    const holdSeconds = sceneHoldSeconds(scene);
    return Math.max(0.4, asNumber(scene?.contentDurationSeconds, null) ?? ((asNumber(scene?.duration, 0) || 0) - holdSeconds));
  }

  function sceneNarrationDelaySeconds(scene) {
    return Math.max(0, asNumber(scene?.narrationDelaySeconds, sectionNarrationDelaySeconds(scene?.id)) || 0);
  }

  function sceneNarrationDuration(scene) {
    const storedDuration = asNumber(scene?.narrationDurationSeconds, null);
    if (storedDuration != null) return Math.max(0.4, storedDuration);
    return Math.max(0.4, sceneContentDuration(scene) - sceneNarrationDelaySeconds(scene));
  }

  function sceneNarrationProgress(scene, sceneElapsed) {
    const narrationElapsed = sceneElapsed - sceneNarrationDelaySeconds(scene);
    return clamp(narrationElapsed / sceneNarrationDuration(scene), 0, 1);
  }

  function setSceneDuration(scene, duration) {
    const holdSeconds = sceneHoldSeconds(scene);
    const narrationDelay = sceneNarrationDelaySeconds(scene);
    const safeDuration = Math.max(narrationDelay + 0.4 + holdSeconds, asNumber(duration, scene.duration) || scene.duration || 1);
    const contentDuration = Math.max(narrationDelay + 0.4, safeDuration - holdSeconds);
    scene.duration = Number(safeDuration.toFixed(3));
    scene.contentDurationSeconds = Number(contentDuration.toFixed(3));
    scene.narrationDelaySeconds = Number(narrationDelay.toFixed(3));
    scene.narrationDurationSeconds = Number(Math.max(0.4, contentDuration - narrationDelay).toFixed(3));
    scene.holdSeconds = holdSeconds;
  }

  function sceneStarts() {
    let cursor = 0;
    return state.scenes.map(scene => {
      const start = cursor;
      cursor += scene.duration;
      return { ...scene, start, end: cursor };
    });
  }

  function totalDuration() {
    return state.scenes.reduce((sum, scene) => sum + scene.duration, 0);
  }

  function totalNarrationDuration() {
    return state.scenes.reduce((sum, scene) => sum + sceneNarrationDuration(scene), 0);
  }

  function totalHoldDuration() {
    return state.scenes.reduce((sum, scene) => sum + sceneHoldSeconds(scene), 0);
  }

  function isSceneHoldAt(time = state.currentTime) {
    const scene = activeSceneAt(time);
    if (!scene) return false;
    const elapsed = clamp(time - scene.start, 0, scene.duration);
    return sceneHoldSeconds(scene) > 0 && elapsed >= sceneContentDuration(scene);
  }

  function isSceneNarrationDelayAt(time = state.currentTime) {
    const scene = activeSceneAt(time);
    if (!scene) return false;
    const delay = sceneNarrationDelaySeconds(scene);
    if (delay <= 0) return false;
    const elapsed = clamp(time - scene.start, 0, scene.duration);
    return elapsed < delay;
  }

  function videoTimeToAudioTime(time = state.currentTime) {
    const scenes = sceneStarts();
    let audioCursor = 0;
    for (const scene of scenes) {
      const narrationDelay = sceneNarrationDelaySeconds(scene);
      const narrationDuration = sceneNarrationDuration(scene);
      if (time < scene.start) return audioCursor;
      if (time <= scene.end) {
        const elapsed = clamp(time - scene.start, 0, scene.duration);
        return audioCursor + clamp(elapsed - narrationDelay, 0, narrationDuration);
      }
      audioCursor += narrationDuration;
    }
    return audioCursor;
  }

  function audioTimeToVideoTime(audioTime = 0) {
    const scenes = sceneStarts();
    let audioCursor = 0;
    for (const scene of scenes) {
      const narrationDelay = sceneNarrationDelaySeconds(scene);
      const narrationDuration = sceneNarrationDuration(scene);
      if (audioTime <= audioCursor + narrationDuration) {
        return scene.start + narrationDelay + clamp(audioTime - audioCursor, 0, narrationDuration);
      }
      audioCursor += narrationDuration;
    }
    return totalDuration();
  }

  function splitAudioSceneKey(sceneId) {
    if (sceneId === 'intro' || sceneId === 'hook') return 'intro';
    if (sceneId === 'outro' || sceneId === 'final') return 'outro';
    return ruleSectionKey(sceneId);
  }

  function splitAudioBlockSceneKey(block) {
    const kind = String(block?.kind || '').toLowerCase();
    if (kind === 'hook_food' || kind === 'hook_ranked') return 'intro';
    if (kind === 'closing_summary' || kind === 'cta' || kind === 'final_reveal') return 'outro';
    if (kind === 'section') return ruleSectionKey(block?.sectionKey);
    return null;
  }

  function splitAudioBlocksForScene(audio, sceneId) {
    if (audio?.mode !== 'split-blocks') return [];
    const sceneKey = splitAudioSceneKey(sceneId);
    return (audio.blocks || []).filter(block => splitAudioBlockSceneKey(block) === sceneKey);
  }

  function splitAudioSceneTailGuardSeconds(sceneId) {
    return splitAudioSceneKey(sceneId) === 'outro'
      ? SPLIT_AUDIO_OUTRO_TAIL_GUARD_SECONDS
      : SPLIT_AUDIO_SCENE_TAIL_GUARD_SECONDS;
  }

  function splitAudioBreathAfterBlock(sceneId, current, next) {
    if (splitAudioSceneKey(sceneId) !== 'outro') return 0;
    return String(next?.kind || '').toLowerCase() === 'final_reveal'
      ? OUTRO_FINAL_REVEAL_BREATH_SECONDS
      : 0;
  }

  function splitAudioMinimumGapAfterBlock(sceneId, current, next, baseGap) {
    if (
      splitAudioSceneKey(sceneId) === 'intro'
      && String(current?.kind || '').toLowerCase() === 'hook_food'
      && String(next?.kind || '').toLowerCase() === 'hook_ranked'
    ) {
      return Math.max(baseGap, INTRO_RANKED_AFTER_FOOD_GAP_SECONDS);
    }
    return baseGap;
  }

  function splitAudioGapAfterBlock(audio, blocks, index, sceneId = null) {
    if (index >= blocks.length - 1) return 0;
    const current = blocks[index];
    const next = blocks[index + 1];
    const manifestGap = asNumber(next.offsetSeconds, null) != null && asNumber(current.endSeconds, null) != null
      ? Math.max(0, next.offsetSeconds - current.endSeconds)
      : null;
    const baseGap = manifestGap ?? Math.max(0, asNumber(audio?.blockGapSeconds, 0) || 0);
    return splitAudioMinimumGapAfterBlock(sceneId, current, next, baseGap) + splitAudioBreathAfterBlock(sceneId, current, next);
  }

  function splitAudioBlockStartInSceneSeconds(audio, sceneId, predicate) {
    const blocks = splitAudioBlocksForScene(audio, sceneId);
    let cursor = 0;
    for (let index = 0; index < blocks.length; index += 1) {
      const block = blocks[index];
      if (predicate(block, index, blocks)) return cursor;
      cursor += Math.max(0, asNumber(block.durationSeconds, 0) || 0);
      cursor += splitAudioGapAfterBlock(audio, blocks, index, sceneId);
    }
    return null;
  }

  function splitAudioSceneDuration(audio, sceneId, { includeTailGuard = true } = {}) {
    const blocks = splitAudioBlocksForScene(audio, sceneId);
    if (!blocks.length) return null;
    const duration = blocks.reduce((sum, block, index) => {
      return sum + Math.max(0, asNumber(block.durationSeconds, 0) || 0) + splitAudioGapAfterBlock(audio, blocks, index, sceneId);
    }, 0);
    return Math.max(0.4, duration + (includeTailGuard ? splitAudioSceneTailGuardSeconds(sceneId) : 0));
  }

  function splitAudioPositionForSceneTime(audio, sceneId, sceneAudioTime) {
    const blocks = splitAudioBlocksForScene(audio, sceneId);
    if (!blocks.length) return null;
    let cursor = 0;
    const safeSceneAudioTime = Math.max(0, asNumber(sceneAudioTime, 0) || 0);
    for (let index = 0; index < blocks.length; index += 1) {
      const block = blocks[index];
      const duration = Math.max(0, asNumber(block.durationSeconds, 0) || 0);
      const isLast = index === blocks.length - 1;
      const tailGuard = isLast ? splitAudioSceneTailGuardSeconds(sceneId) : 0;
      if (safeSceneAudioTime >= cursor && safeSceneAudioTime < cursor + duration + tailGuard) {
        const localTime = safeSceneAudioTime - cursor;
        const kind = String(block?.kind || '').toLowerCase();
        const playbackLocalTime = kind === 'final_reveal' && localTime <= SPLIT_AUDIO_FINAL_REVEAL_START_GRACE_SECONDS
          ? 0
          : localTime;
        return {
          block,
          audioTime: asNumber(block.offsetSeconds, 0) + clamp(playbackLocalTime, 0, duration),
          localTime: clamp(playbackLocalTime, 0, Math.max(0, duration - 0.01)),
          inTailGuard: localTime >= duration,
          remainingSeconds: Math.max(0, duration - localTime)
        };
      }
      cursor += duration;
      const gap = splitAudioGapAfterBlock(audio, blocks, index, sceneId);
      if (safeSceneAudioTime < cursor + gap) return null;
      cursor += gap;
    }
    return null;
  }

  function splitAudioPositionShouldPlay(position) {
    if (!position?.block || position.inTailGuard) return false;
    const kind = String(position.block.kind || '').toLowerCase();
    const replayEndMarginSeconds = kind === 'final_reveal'
      ? SPLIT_AUDIO_FINAL_REVEAL_END_MARGIN_SECONDS
      : SPLIT_AUDIO_REPLAY_END_MARGIN_SECONDS;
    return position.remainingSeconds > replayEndMarginSeconds;
  }

  function audioTimelineKey(food = selectedFood(), duration = null) {
    const audio = audioForFood(food);
    return [
      food?.id || '',
      audio?.mode || '',
      audio?.take || '',
      audio?.path || '',
      audio?.manifestPath || '',
      audio?.generatedAt || '',
      Number.isFinite(duration) ? duration.toFixed(3) : ''
    ].join('|');
  }

  function calibrateSceneDurationsToAudio(duration) {
    const audioDuration = asNumber(duration, null);
    if (audioDuration == null || audioDuration <= 0 || !state.scenes.length) return false;

    const key = audioTimelineKey(selectedFood(), audioDuration);
    if (state.audioTimelineKey === key) return false;

    state.audioTimelineKey = key;
    state.audioDurationSeconds = audioDuration;
    const currentNarrationTotal = totalNarrationDuration();
    if (currentNarrationTotal <= 0 || Math.abs(currentNarrationTotal - audioDuration) <= AUDIO_TIMELINE_SYNC_TOLERANCE_SECONDS) {
      return false;
    }

    const ratio = audioDuration / currentNarrationTotal;
    const playheadAudioTime = videoTimeToAudioTime(state.currentTime);
    state.scenes = state.scenes.map(scene => {
      const narrationDelay = sceneNarrationDelaySeconds(scene);
      const narrationDuration = Math.max(0.4, sceneNarrationDuration(scene) * ratio);
      const contentDuration = narrationDelay + narrationDuration;
      const holdSeconds = sceneHoldSeconds(scene);
      return {
        ...scene,
        contentDurationSeconds: Number(contentDuration.toFixed(3)),
        narrationDelaySeconds: Number(narrationDelay.toFixed(3)),
        narrationDurationSeconds: Number(narrationDuration.toFixed(3)),
        holdSeconds,
        duration: Number((contentDuration + holdSeconds).toFixed(3))
      };
    });
    state.currentTime = clamp(audioTimeToVideoTime(playheadAudioTime * ratio), 0, totalDuration());
    return true;
  }

  function calibrateSceneDurationsToSplitAudio(audio) {
    if (audio?.mode !== 'split-blocks' || !state.scenes.length) return false;
    const blockEnds = (audio.blocks || []).map(block => asNumber(block.endSeconds, 0) || 0);
    const inferredDuration = blockEnds.length ? Math.max(...blockEnds) : null;
    const audioDuration = asNumber(audio.durationSeconds, inferredDuration);
    if (audioDuration == null || audioDuration <= 0) return false;

    const key = [
      audioTimelineKey(selectedFood(), audioDuration),
      'scene-blocks',
      `tail:${SPLIT_AUDIO_SCENE_TAIL_GUARD_SECONDS.toFixed(3)}`,
      `outro-tail:${SPLIT_AUDIO_OUTRO_TAIL_GUARD_SECONDS.toFixed(3)}`,
      `outro-breath:${OUTRO_FINAL_REVEAL_BREATH_SECONDS.toFixed(3)}`,
      `intro-ranked-gap:${INTRO_RANKED_AFTER_FOOD_GAP_SECONDS.toFixed(3)}`,
      `outro-hold:${OUTRO_HOLD_SECONDS.toFixed(3)}`
    ].join('|');
    if (state.audioTimelineKey === key) return false;

    state.audioTimelineKey = key;
    state.audioDurationSeconds = audioDuration;
    let changed = false;
    state.scenes = state.scenes.map(scene => {
      const splitDuration = splitAudioSceneDuration(audio, scene.id);
      if (splitDuration == null) return scene;
      const currentNarrationDuration = sceneNarrationDuration(scene);
      if (currentNarrationDuration + SPLIT_AUDIO_SCENE_SYNC_TOLERANCE_SECONDS >= splitDuration) return scene;

      changed = true;
      const narrationDelay = sceneNarrationDelaySeconds(scene);
      const narrationDuration = Math.max(0.4, splitDuration);
      const contentDuration = narrationDelay + narrationDuration;
      const holdSeconds = sceneHoldSeconds(scene);
      return {
        ...scene,
        contentDurationSeconds: Number(contentDuration.toFixed(3)),
        narrationDelaySeconds: Number(narrationDelay.toFixed(3)),
        narrationDurationSeconds: Number(narrationDuration.toFixed(3)),
        holdSeconds,
        duration: Number((contentDuration + holdSeconds).toFixed(3))
      };
    });
    state.currentTime = clamp(state.currentTime, 0, totalDuration());
    return changed;
  }

  function activeSceneAt(time = state.currentTime) {
    const scenes = sceneStarts();
    return scenes.find(scene => time >= scene.start && time < scene.end) || scenes[scenes.length - 1];
  }

  function persist() {
    localStorage.setItem(VIDEO_STATE_KEY, JSON.stringify({
      selectedFoodId: state.selectedFoodId,
      layoutSourceId: state.layoutSourceId,
      selectedSceneId: state.selectedSceneId
    }));
  }

  function renderLayoutSourceOptions() {
    const options = layoutSourceOptions();
    if (!options.length) {
      const food = selectedFood();
      state.layoutSourceId = '';
      els.layoutSource.innerHTML = `<option value="">${escapeHtml(`No Display Builder v2 placement for ${selectedFoodLabel(food?.id || '')}`)}</option>`;
      els.layoutSource.value = '';
      return;
    }
    els.layoutSource.innerHTML = options.map(option => (
      `<option value="${escapeHtml(option.id)}">${escapeHtml(option.label)}</option>`
    )).join('');
    if (!options.some(option => option.id === state.layoutSourceId)) state.layoutSourceId = options[0]?.id || '';
    els.layoutSource.value = state.layoutSourceId;
  }

  function renderFoodList() {
    const query = state.foodFilter.trim().toLowerCase();
    const visibleFoods = foods
      .filter(food => !query || [food.id, food.name, food.foodType, food.foodTypeLabel].filter(Boolean).some(value => String(value).toLowerCase().includes(query)))
      .slice(0, 80);
    els.foodList.innerHTML = '';
    visibleFoods.forEach(food => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `food-button${food.id === state.selectedFoodId ? ' active' : ''}`;
      button.innerHTML = `<strong>${escapeHtml(food.name)}</strong><span>${escapeHtml(food.foodTypeLabel || prettyFoodType(food.foodType))} · ${escapeHtml(String(food.header?.kcal ?? food.kcal ?? 'N/A'))} kcal</span>`;
      button.addEventListener('click', () => {
        state.selectedFoodId = food.id;
        state.layoutSourceId = '';
        state.displayBuilderExportStatus = '';
        state.currentTime = 0;
        state.selectedSceneId = 'intro';
        state.audioTimelineKey = '';
        state.audioDurationSeconds = null;
        state.scenes = buildScenes(food);
        hydrateLayoutForFood();
        syncAudioForFood();
        persist();
        renderAll();
      });
      els.foodList.appendChild(button);
    });
  }

  function renderSceneList() {
    const activeTimedScene = activeSceneAt();
    els.sceneList.innerHTML = '';
    sceneStarts().forEach(scene => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `scene-button${scene.id === activeTimedScene.id ? ' active' : ''}`;
      const holdLabel = sceneHoldSeconds(scene) ? ` · ${sceneHoldSeconds(scene).toFixed(1)}s hold` : '';
      button.innerHTML = `<strong>${escapeHtml(scene.label)}</strong><span>${scene.start.toFixed(1)}s - ${scene.end.toFixed(1)}s${holdLabel} · ${escapeHtml(scene.reveal)}</span>`;
      button.addEventListener('click', () => {
        state.currentTime = scene.start + 0.02;
        state.selectedSceneId = scene.id;
        stopPlayback();
        renderAll();
      });
      els.sceneList.appendChild(button);
    });
  }

  function renderTimelineStrip() {
    const activeTimedScene = activeSceneAt();
    const total = totalDuration();
    els.timelineStrip.innerHTML = '';
    sceneStarts().forEach(scene => {
      const segment = document.createElement('div');
      segment.className = `strip-segment${scene.id === activeTimedScene.id ? ' active' : ''}`;
      segment.style.width = `${Math.max(42, (scene.duration / total) * 100)}%`;
      const fill = document.createElement('span');
      const progress = scene.id === activeTimedScene.id
        ? clamp((state.currentTime - scene.start) / scene.duration, 0, 1)
        : state.currentTime >= scene.end ? 1 : 0;
      fill.style.transform = `scaleX(${progress})`;
      segment.appendChild(fill);
      els.timelineStrip.appendChild(segment);
    });
  }

  function syncSelectedSceneToPlayhead() {
    const timedScene = activeSceneAt();
    if (!timedScene || state.selectedSceneId === timedScene.id) return false;
    state.selectedSceneId = timedScene.id;
    return true;
  }

  function updatePlaybackControls(overrideStatus, { refreshAudioStatus = true } = {}) {
    els.playPause.textContent = state.playing ? 'Pause' : 'Play';
    if (refreshAudioStatus || overrideStatus) updateAudioControls(overrideStatus);

    const total = totalDuration();
    els.timeScrub.max = String(Math.max(1, Math.round(total * 100)));
    els.timeScrub.value = String(Math.round(state.currentTime * 100));
    els.timeReadout.textContent = `${state.currentTime.toFixed(1)}s / ${total.toFixed(1)}s`;
  }

  function renderControls() {
    syncSelectedSceneToPlayhead();
    const selected = state.scenes.find(item => item.id === state.selectedSceneId) || activeSceneAt();
    els.activeSceneTitle.textContent = selected?.label || 'Scene';
    els.sceneStatus.textContent = selected
      ? `${selected.duration.toFixed(1)}s${sceneHoldSeconds(selected) ? ` · ${sceneHoldSeconds(selected).toFixed(1)}s hold` : ''}`
      : '0.0s';
    els.sceneDuration.value = selected?.duration ?? '';
    els.revealStyle.value = selected?.reveal || 'cascade';
    els.captionSize.value = selected?.captionSize || 22;
    els.captionText.value = selected?.caption || '';
    updatePlaybackControls();
  }

  function renderManifest() {
    els.manifestOutput.value = JSON.stringify(buildManifest(), null, 2);
  }

  function buildManifest() {
    const food = selectedFood();
    const holdDuration = totalHoldDuration();
    return {
      version: 'foodranked-video-builder-v1',
      foodId: food?.id || null,
      foodName: food?.name || null,
      layoutSource: state.layoutSourceId,
      canvas: { width: AUTHOR_GRID.width, height: AUTHOR_GRID.height, aspect: '9:16' },
      audio: audioForFood(food),
      sfxProfile: sfxProfileForFood(food),
      duration: Number(totalDuration().toFixed(2)),
      narrationDuration: Number(totalNarrationDuration().toFixed(2)),
      totalHoldSeconds: Number(holdDuration.toFixed(2)),
      holdMode: holdDuration ? 'post-section-dwell' : null,
      audioHoldSeconds: Number(holdDuration.toFixed(2)),
      scenes: sceneStarts().map(scene => sceneManifestEntry(scene, food))
    };
  }

  function sceneManifestEntry(scene, food) {
    const timing = sceneTimingModel(scene);
    const layerSchedule = sceneLayerRevealSchedule(scene, food);
    const contentDuration = sceneContentDuration(scene);
    const narrationDelay = sceneNarrationDelaySeconds(scene);
    const narrationDuration = sceneNarrationDuration(scene);
    const holdSeconds = sceneHoldSeconds(scene);
    const captionsHidden = hideSceneCaptions(scene);
    return {
      id: scene.id,
      label: scene.label,
      start: Number(scene.start.toFixed(2)),
      end: Number(scene.end.toFixed(2)),
      duration: Number(scene.duration.toFixed(2)),
      contentDuration: Number(contentDuration.toFixed(2)),
      narrationDelaySeconds: Number(narrationDelay.toFixed(2)),
      narrationStart: Number((scene.start + narrationDelay).toFixed(2)),
      narrationDuration: Number(narrationDuration.toFixed(2)),
      holdSeconds: Number(holdSeconds.toFixed(2)),
      holdMode: holdSeconds ? 'post-section-dwell' : null,
      holdStart: holdSeconds ? Number((scene.start + contentDuration).toFixed(2)) : null,
      holdEnd: holdSeconds ? Number(scene.end.toFixed(2)) : null,
      reveal: scene.reveal,
      captionSize: scene.captionSize,
      caption: scene.caption,
      captionsHidden,
      subtitleCues: captionsHidden ? [] : (scene.subtitleCues || []).map(cue => {
        const chunk = timing.chunks.find(item => item.cueId && item.cueId === cue.id);
        return {
          id: cue.id,
          startSeconds: cue.startSeconds,
          endSeconds: cue.endSeconds,
          videoStartSeconds: chunk ? Number((scene.start + narrationDelay + (chunk.start * narrationDuration)).toFixed(3)) : null,
          videoEndSeconds: chunk ? Number((scene.start + narrationDelay + (chunk.end * narrationDuration)).toFixed(3)) : null,
          placement: cue.placement || null,
          maxLines: CAPTION_MAX_LINES,
          lines: cue.lines,
          text: cue.text,
          wordTimings: Array.isArray(cue.wordTimings) ? clone(cue.wordTimings) : undefined
        };
      }),
      timingModel: {
        source: timing.source || 'weighted-caption-v3',
        sceneStartSeconds: Number(scene.start.toFixed(3)),
        sceneDurationSeconds: Number(scene.duration.toFixed(3)),
        contentDurationSeconds: Number(contentDuration.toFixed(3)),
        narrationDelaySeconds: Number(narrationDelay.toFixed(3)),
        narrationDurationSeconds: Number(narrationDuration.toFixed(3)),
        holdSeconds: Number(holdSeconds.toFixed(3)),
        holdMode: holdSeconds ? 'post-section-dwell' : null,
        revealLeadSeconds: AUDIO_REVEAL_LEAD_SECONDS,
        revealWindowSeconds: AUDIO_REVEAL_WINDOW_SECONDS
      },
      revealBeats: timing.sentences.map(segment => ({
        start: Number(segment.start.toFixed(3)),
        end: Number(segment.end.toFixed(3)),
        absoluteStart: Number((scene.start + narrationDelay + (segment.start * narrationDuration)).toFixed(3)),
        absoluteEnd: Number((scene.start + narrationDelay + (segment.end * narrationDuration)).toFixed(3)),
        text: segment.text
      })),
      activeWords: timing.words.map(word => ({
        text: word.text,
        start: Number(word.start.toFixed(4)),
        end: Number(word.end.toFixed(4)),
        absoluteStart: Number((scene.start + narrationDelay + (word.start * narrationDuration)).toFixed(3)),
        absoluteEnd: Number((scene.start + narrationDelay + (word.end * narrationDuration)).toFixed(3))
      })),
      layerRevealSchedule: layerSchedule.map(entry => ({
        ...entry,
        start: Number(entry.start.toFixed(4)),
        absoluteStart: Number((scene.start + entry.startSeconds).toFixed(3))
      }))
    };
  }

  function backdropPalette(food = selectedFood()) {
    const palettes = {
      vegetables: { top: '#dff4cf', bottom: '#bfd8b0', glowA: 'rgba(219,255,183,.78)', glowB: 'rgba(108,169,104,.38)' },
      fruits: { top: '#ffe0dc', bottom: '#e7b8b5', glowA: 'rgba(255,173,165,.78)', glowB: 'rgba(219,109,101,.34)' },
      grains: { top: '#f6e7bf', bottom: '#dbc48a', glowA: 'rgba(255,235,163,.78)', glowB: 'rgba(199,151,66,.30)' },
      legumes: { top: '#e5d8c9', bottom: '#c0a78a', glowA: 'rgba(234,204,163,.76)', glowB: 'rgba(142,102,62,.28)' },
      tubers: { top: '#f5d7bf', bottom: '#d2a17d', glowA: 'rgba(255,196,144,.74)', glowB: 'rgba(182,106,58,.28)' },
      nuts: { top: '#ead8c8', bottom: '#c39b7f', glowA: 'rgba(243,207,175,.76)', glowB: 'rgba(128,77,47,.28)' },
      seeds: { top: '#f2e2c8', bottom: '#cfb48f', glowA: 'rgba(255,231,188,.76)', glowB: 'rgba(162,128,80,.26)' },
      meats: { top: '#f2d0d3', bottom: '#c08a90', glowA: 'rgba(255,188,196,.72)', glowB: 'rgba(146,61,73,.28)' },
      dairy: { top: '#f4f0e8', bottom: '#d9d2c2', glowA: 'rgba(255,255,255,.68)', glowB: 'rgba(214,196,155,.22)' },
      'oils-and-fats': { top: '#f6e7a9', bottom: '#d1b851', glowA: 'rgba(255,235,135,.74)', glowB: 'rgba(175,138,28,.28)' },
      misc: { top: '#ece7e2', bottom: '#cfc5bc', glowA: 'rgba(255,255,255,.66)', glowB: 'rgba(140,120,108,.22)' }
    };
    return palettes[normalizeFoodType(food?.foodType)] || palettes.misc;
  }

  function backgroundFieldGradient(food = selectedFood()) {
    const palette = backdropPalette(food);
    return `radial-gradient(circle at 18% 12%, ${palette.glowA}, transparent 24%), radial-gradient(circle at 82% 16%, ${palette.glowB}, transparent 28%), linear-gradient(180deg, ${palette.top} 0%, ${palette.bottom} 100%)`;
  }

  function persistentChromeLayers(sectionId, food) {
    const sectionLayers = getSectionLayers(state.layout, sectionId);
    const introLayers = getSectionLayers(state.layout, 'intro');
    const sectionHeader = sectionLayers.filter(isHeaderChrome);
    const introHeader = introLayers.filter(isHeaderChrome);
    const sectionUiChrome = sectionLayers.filter(layer => isPersistentChrome(layer) && !isHeaderChrome(layer));
    const introUiChrome = introLayers.filter(layer => isPersistentChrome(layer) && !isHeaderChrome(layer));
    return [
      ...(sectionHeader.length ? sectionHeader : introHeader),
      ...(sectionUiChrome.length ? sectionUiChrome : introUiChrome)
    ].map(clone);
  }

  function sceneContentLayers(sectionId) {
    const layers = getSectionLayers(state.layout, sectionId)
      .filter(layer => !isPersistentChrome(layer) && !isSectionIndicator(layer));
    if (sectionId === 'intro') return [...layers, ...introHookLayers(selectedFood())];
    return layers;
  }

  function sceneLayerRevealSchedule(scene, food = selectedFood()) {
    if (!state.layout || !scene) return [];
    const content = sceneContentLayers(scene.id).map((layer, index) => ({ layer, index, persistent: false }));
    const chrome = persistentChromeLayers(scene.id, food).map((layer, index) => ({ layer, index, persistent: true }));
    const layers = [...content, ...chrome].sort((a, b) => {
      return (Number(a.layer.z) || 0) - (Number(b.layer.z) || 0)
        || (a.persistent === b.persistent ? 0 : a.persistent ? 1 : -1);
    });
    const layerList = layers.map(item => item.layer);
    return layers
      .filter(({ layer }) => layer.visible !== false)
      .map(({ layer, index, persistent }) => layerRevealSchedule(layer, scene, index, persistent, layerList));
  }

  function ensureStageRoots() {
    let bg = els.videoStage.querySelector('.stage-bg');
    let phoneBg = els.videoStage.querySelector('.stage-phone-bg');
    let layerRoot = els.videoStage.querySelector('.stage-layer-root');
    let vignette = els.videoStage.querySelector('.stage-vignette');
    let caption = els.videoStage.querySelector('.caption-box');
    if (bg && phoneBg && layerRoot && vignette && caption) {
      return { bg, phoneBg, layerRoot, vignette, caption };
    }

    els.videoStage.innerHTML = '';
    bg = document.createElement('div');
    bg.className = 'stage-bg';
    phoneBg = document.createElement('div');
    phoneBg.className = 'stage-phone-bg';
    layerRoot = document.createElement('div');
    layerRoot.className = 'stage-layer-root';
    vignette = document.createElement('div');
    vignette.className = 'stage-vignette';
    caption = document.createElement('div');
    caption.className = 'caption-box';
    els.videoStage.append(bg, phoneBg, layerRoot, vignette, caption);
    return { bg, phoneBg, layerRoot, vignette, caption };
  }

  function renderStage() {
    const food = selectedFood();
    const scene = activeSceneAt();
    const roots = ensureStageRoots();
    if (!state.layout || !scene) {
      roots.layerRoot.replaceChildren();
      roots.caption.replaceChildren();
      roots.bg.replaceChildren();
      roots.bg.style.background = '';
      els.videoStage.style.backgroundColor = '#d6d6d6';
      const notice = document.createElement('div');
      notice.className = 'layer-node text pixel-text';
      notice.textContent = state.displayBuilderExportStatus === 'building'
        ? `Building Display Builder v2 placement for ${food?.name || 'this food'}...`
        : `No Display Builder v2 placement is available for ${food?.name || 'this food'}.`;
      notice.style.left = 'calc(12 * var(--pixel-unit))';
      notice.style.top = 'calc(102 * var(--pixel-unit))';
      notice.style.width = 'calc(111 * var(--pixel-unit))';
      notice.style.fontSize = 'calc(5 * var(--pixel-unit))';
      notice.style.lineHeight = '1.2';
      notice.style.textAlign = 'center';
      notice.style.color = '#ffffff';
      notice.style.zIndex = '20';
      roots.layerRoot.appendChild(notice);
      return;
    }

    const contentDuration = sceneContentDuration(scene);
    const sceneElapsed = clamp(state.currentTime - scene.start, 0, scene.duration);
    const sceneProgress = clamp(sceneElapsed / contentDuration, 0, 1);
    const narrationDelay = sceneNarrationDelaySeconds(scene);
    const narrationElapsed = sceneElapsed - narrationDelay;
    const narrationProgress = sceneNarrationProgress(scene, sceneElapsed);
    const inHold = sceneHoldSeconds(scene) > 0 && sceneElapsed >= contentDuration;
    const content = sceneContentLayers(scene.id).map((layer, index) => ({ layer, index, persistent: false }));
    const chrome = persistentChromeLayers(scene.id, food).map((layer, index) => ({ layer, index, persistent: true }));
    const layers = [...content, ...chrome].sort((a, b) => {
      return (Number(a.layer.z) || 0) - (Number(b.layer.z) || 0)
        || (a.persistent === b.persistent ? 0 : a.persistent ? 1 : -1);
    });
    els.videoStage.style.backgroundColor = state.layout?.canvas?.background || '#d6d6d6';
    roots.bg.style.background = backgroundFieldGradient(food);
    void renderDynamicBackground(roots.bg, food);

    const layerList = layers.map(item => item.layer);
    const revealSchedules = layers.map(({ layer, index, persistent }) => (
      layer.visible === false ? null : layerRevealSchedule(layer, scene, index, persistent, layerList)
    ));
    applyStageShake(roots, scene, sceneProgress, revealSchedules);
    const macroHighlightMap = macroSubmetricHighlightMap(scene, narrationProgress);
    const micronHighlightMap = micronMetricHighlightMap(scene, narrationProgress);
    const proConHighlightMap = proConNarrationHighlightMap(scene, narrationProgress);
    updateHighlightGlowSfx(strongestHighlightCue(scene, macroHighlightMap, micronHighlightMap, proConHighlightMap));
    const existingNodes = new Map(
      Array.from(roots.layerRoot.querySelectorAll('[data-render-key]')).map(node => [node.dataset.renderKey || '', node])
    );
    const nextLayerNodes = document.createDocumentFragment();
    const macroHeadSchedules = revealSchedules.filter(isMacroHeadRevealSchedule);
    const macroHeadMaxZ = layers.reduce((maxZ, { layer }, scheduleIndex) => (
      isMacroHeadRevealSchedule(revealSchedules[scheduleIndex])
        ? Math.max(maxZ, Number(layer.z) || 0)
        : maxZ
    ), 0);
    const macroHeadGroupKey = `scene:macro-head-group:${scene.id}`;
    let macroHeadGroup = null;
    if (macroHeadSchedules.length) {
      macroHeadGroup = existingNodes.get(macroHeadGroupKey);
      if (!macroHeadGroup || !macroHeadGroup.classList?.contains('macro-head-group')) {
        macroHeadGroup = document.createElement('div');
      }
      macroHeadGroup.replaceChildren();
      macroHeadGroup.removeAttribute('style');
      macroHeadGroup.className = 'layer-group macro-head-group';
      macroHeadGroup.dataset.renderKey = macroHeadGroupKey;
      macroHeadGroup.dataset.revealFamily = 'macro';
      macroHeadGroup.dataset.revealKind = 'macro-head-group';
      macroHeadGroup.style.position = 'absolute';
      macroHeadGroup.style.inset = '0';
      macroHeadGroup.style.pointerEvents = 'none';
      macroHeadGroup.style.isolation = 'isolate';
      macroHeadGroup.style.willChange = 'opacity';
      macroHeadGroup.style.opacity = String(macroHeadRevealOpacity(scene, sceneProgress, revealSchedules));
      macroHeadGroup.style.zIndex = String(macroHeadMaxZ);
      nextLayerNodes.appendChild(macroHeadGroup);
    }
    layers.forEach(({ layer, index, persistent }, renderIndex) => {
      if (layer.visible === false) return;
      const macroBarFillLayer = !persistent && isMacroBarFill(layer);
      const tagName = macroBarFillLayer ? 'CANVAS' : layer.kind === 'sprite' ? 'IMG' : 'DIV';
      const renderKey = `${persistent ? 'persistent' : 'scene'}:${layer.kind}:${layer.id || index}`;
      let node = existingNodes.get(renderKey);
      if (!node || node.tagName !== tagName) node = document.createElement(tagName.toLowerCase());
      const sectionIndicatorClass = layer.kind === 'sprite' && isSectionIndicator(layer) ? ' section-indicator-sprite' : '';
      const effectClass = layer.effect ? ` ${String(layer.effect).replace(/[^a-z0-9_-]+/gi, '-')}` : '';
      node.className = `layer-node ${layer.kind}${layer.kind === 'text' ? ' pixel-text' : ''}${sectionIndicatorClass}${effectClass}`;
      node.removeAttribute('style');
      applyTierStampNodeClasses(node, layer, food);
      if (layer.animationDelay != null) node.style.animationDelay = String(layer.animationDelay);
      node.dataset.renderKey = renderKey;
      node.dataset.layerId = layer.id || '';
      node.dataset.persistent = persistent ? 'true' : 'false';
      const revealSchedule = revealSchedules[renderIndex];
      const revealDelay = revealSchedule.start;
      node.dataset.revealDelay = revealDelay.toFixed(3);
      node.dataset.revealFamily = revealSchedule.family;
      node.dataset.revealKind = revealSchedule.kind;
      const groupedMacroHeadReveal = Boolean(macroHeadGroup && isMacroHeadRevealSchedule(revealSchedule));
      node.style.zIndex = String(
        groupedMacroHeadReveal && revealSchedule.kind === 'icon'
          ? macroHeadMaxZ + 2
          : Number(layer.z) || 0
      );
      applyLayerBox(node, layer);
      applyLayerAnimation(node, layer, scene, sceneProgress, index, persistent, revealSchedule, {
        groupedReveal: groupedMacroHeadReveal,
        opaqueSpriteReveal: shouldRevealStackedMacroSpriteOpaque(layer, revealSchedule, layerList)
      });
      const renderParent = groupedMacroHeadReveal ? macroHeadGroup : nextLayerNodes;
      if (macroBarFillLayer) {
        drawMacroBarFillCanvas(node, layer, sceneElapsed, revealSchedule);
        renderParent.appendChild(node);
        return;
      }
      if (layer.kind === 'sprite') {
        const nextSpriteSrc = spritePath(layer.src);
        if (node.dataset.spriteSrc !== nextSpriteSrc) {
          node.dataset.spriteSrc = nextSpriteSrc;
          node.src = nextSpriteSrc;
        }
        node.alt = layer.label || '';
        node.onerror = () => {
          const failedSrc = node.currentSrc || node.src || spritePath(layer.src);
          if (layer.fallbackSrc && node.src !== new URL(spritePath(layer.fallbackSrc), window.location.href).href) {
            const fallbackSrc = spritePath(layer.fallbackSrc);
            recordSpriteFailure(failedSrc, fallbackSrc, layer.label || '');
            node.dataset.spriteSrc = fallbackSrc;
            node.src = fallbackSrc;
            return;
          }
          recordSpriteFailure(failedSrc, '', layer.label || '');
        };
      } else {
        node.textContent = layer.text || '';
        node.style.color = layer.color || '#fff7e9';
        node.style.fontSize = `calc(${textLayerFontSize(layer)}px * var(--pixel-unit))`;
        if (layer.width) node.style.width = `calc(${Number(layer.width)}px * var(--pixel-unit))`;
        node.style.textAlign = layer.align || 'left';
        applyOutroScoreGlow(node, layer, food);
      }
      applySubmacroNarrationHighlight(node, scene, revealSchedule, macroHighlightMap);
      applyMicronNarrationHighlight(node, scene, revealSchedule, micronHighlightMap);
      applyProConNarrationHighlight(node, scene, revealSchedule, proConHighlightMap);
      renderParent.appendChild(node);
    });
    appendMicron100Fireworks(nextLayerNodes, scene, layers, sceneElapsed);
    appendMajorProSparkles(nextLayerNodes, scene, layers, sceneElapsed, sceneProgress, proConHighlightMap);
    appendMajorConSirenVfx(nextLayerNodes, scene, layers, sceneElapsed, sceneProgress, proConHighlightMap);
    roots.layerRoot.replaceChildren(nextLayerNodes);

    syncCaptionSafeArea(roots.caption);
    if (hideSceneCaptions(scene)) {
      roots.caption.dataset.captionKey = '';
      roots.caption.removeAttribute('aria-label');
      roots.caption.replaceChildren();
      roots.caption.style.opacity = '0';
    } else {
      const narrationActive = narrationElapsed >= 0 && !inHold;
      const frame = captionFrame(scene, narrationProgress);
      roots.caption.style.fontSize = captionFontSize(scene, frame);
      renderCaption(roots.caption, scene, narrationProgress, frame);
      roots.caption.style.opacity = narrationActive
        ? String(easeOutCubic(clamp((narrationElapsed + 0.05) * 4, 0, 1)))
        : '0';
    }
  }

  function textLayerFontSize(layer) {
    return Number(layer?.autoFontSize ?? layer?.fontSize) || 6;
  }

  function textLayerBaselineOffset(layer) {
    if (layer?.id !== 'food_name_text') return 0;
    const baseFontSize = Number(layer?.fontSize);
    const autoFontSize = Number(layer?.autoFontSize);
    if (!Number.isFinite(baseFontSize) || !Number.isFinite(autoFontSize) || autoFontSize >= baseFontSize) return 0;
    return Math.round((baseFontSize - autoFontSize) * TEXT_LAYER_LINE_HEIGHT * 1000) / 1000;
  }

  function captionFontSize(scene, frame) {
    if (frame.placement === 'tier-center') return 'calc(44px * 0.25 * var(--pixel-unit))';
    if (frame.placement === 'summary-full') return 'calc(22px * 0.25 * var(--pixel-unit))';
    return `calc(${Number(scene.captionSize) || 22}px * 0.25 * var(--pixel-unit))`;
  }

  function defaultBackgroundMotion() {
    return {
      enabled: true,
      mode: 'foodType',
      density: 12,
      opacity: 0.18,
      minDuration: 14,
      maxDuration: 24,
      minSize: 24,
      maxSize: 40,
      drift: 16
    };
  }

  function getResponsiveAssetScale() {
    const desktopComfortable = window.innerWidth >= 1600 && window.innerHeight >= 900;
    if (desktopComfortable) return 4;

    const compactLaptop = (window.innerWidth <= 1500 || window.innerHeight <= 850) && window.innerWidth > 760;
    const laptopCanvasCrop = compactLaptop;
    const tightLaptop = window.innerWidth <= 1180 && window.innerWidth > 760;
    const reservedWidth = tightLaptop ? 530 : (compactLaptop ? 660 : 690);
    const reservedHeight = tightLaptop ? 154 : (compactLaptop ? 150 : 210);
    const minimumScale = tightLaptop ? 1.12 : (compactLaptop ? 1.30 : 1.45);
    const verticalRoom = Math.max(300, window.innerHeight - reservedHeight);
    const scaleFromHeight = laptopCanvasCrop
      ? (verticalRoom - 12) / (AUTHOR_GRID.height * (7 / 9))
      : (((verticalRoom * 9) / 16) - 12) / AUTHOR_GRID.width;
    const scaleFromWidth = laptopCanvasCrop
      ? (Math.max(280, window.innerWidth - reservedWidth) - 24) / (AUTHOR_GRID.width * (7 / 9))
      : (Math.max(280, window.innerWidth - reservedWidth) - 24) / AUTHOR_GRID.width;
    return Math.max(minimumScale, Math.min(4, scaleFromHeight, scaleFromWidth));
  }

  function setCanvasScale() {
    document.documentElement.style.setProperty('--pixel-unit', String(getResponsiveAssetScale()));
  }

  async function renderDynamicBackground(field, food) {
    const motion = { ...defaultBackgroundMotion(), ...((state.layout?.canvas?.backgroundMotion) || {}) };
    const key = JSON.stringify({
      foodId: food?.id || '',
      foodType: normalizeFoodType(food?.foodType),
      motion
    });
    if (state.backgroundKey === key && field.childElementCount) return;
    state.backgroundKey = key;
    const token = state.backgroundToken + 1;
    state.backgroundToken = token;
    field.innerHTML = '';
    if (motion.enabled === false) return;

    let sourcePool = [];
    if (motion.mode === 'allFoods') {
      sourcePool = [...foods];
    } else if (motion.mode === 'selectedFood') {
      sourcePool = [food];
    } else {
      sourcePool = [food, ...foods.filter(item => item.id !== food?.id && normalizeFoodType(item.foodType) === normalizeFoodType(food?.foodType))];
    }
    sourcePool = sourcePool.filter(Boolean);
    if (!sourcePool.length && food) sourcePool = [food];
    if (!sourcePool.length) return;

    const enrichedPool = sourcePool.map(item => {
      const candidates = foodSpriteCandidates(item);
      const hasPrimary = hasCustomFoodImage(item);
      return {
        food: item,
        src: spritePath(hasPrimary ? candidates.primary : candidates.fallback),
        usedFallback: !hasPrimary,
        fallback: spritePath(candidates.fallback)
      };
    });
    if (token !== state.backgroundToken) return;

    const selectedPrimary = enrichedPool.find(item => item.food?.id === food?.id && !item.usedFallback);
    const primaryPool = enrichedPool.filter(item => !item.usedFallback);
    const renderPool = selectedPrimary
      ? [selectedPrimary, ...primaryPool.filter(item => item.food?.id !== food?.id)]
      : (primaryPool.length ? primaryPool : enrichedPool);
    const onlyFallbacks = !primaryPool.length;

    const density = Math.max(1, Number(motion.density) || defaultBackgroundMotion().density);
    const minDuration = Math.max(4, Number(motion.minDuration) || defaultBackgroundMotion().minDuration);
    const maxDuration = Math.max(minDuration, Number(motion.maxDuration) || defaultBackgroundMotion().maxDuration);
    const minSize = Math.max(12, Number(motion.minSize) || defaultBackgroundMotion().minSize);
    const maxSize = Math.max(minSize, Number(motion.maxSize) || defaultBackgroundMotion().maxSize);
    const drift = Math.max(0, Number(motion.drift) || 0);
    const opacity = Math.min(0.5, Math.max(0.04, Number(motion.opacity) || defaultBackgroundMotion().opacity));

    Array.from({ length: density }).forEach((_, index) => {
      const choice = renderPool[index % renderPool.length] || renderPool[0];
      const img = document.createElement('img');
      const progress = density <= 1 ? 0.5 : index / (density - 1);
      const sizeBias = onlyFallbacks ? 0.72 : 1;
      const size = Math.round((minSize + (maxSize - minSize) * ((index % 5) / 4 || 0)) * sizeBias);
      const duration = Math.round(minDuration + (maxDuration - minDuration) * ((index % 7) / 6 || 0) + (onlyFallbacks ? 4 : 0));
      img.className = 'bg-sprite';
      img.src = choice?.src || choice?.fallback;
      img.alt = '';
      img.style.left = `${8 + progress * 76}%`;
      img.style.top = `${-40 - (index % 5) * 26}px`;
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;
      img.style.objectFit = 'contain';
      img.style.objectPosition = 'center';
      img.style.opacity = String(onlyFallbacks ? Math.min(opacity, 0.12) : opacity);
      img.style.animationDuration = `${duration}s`;
      img.style.animationDelay = `${-(index * 1.7)}s`;
      img.style.setProperty('--drift-x', `${(index % 2 === 0 ? 1 : -1) * Math.max(2, drift - (index % 4) * 2)}px`);
      img.onerror = () => {
        const failedSrc = img.currentSrc || img.src || choice?.src;
        if (choice?.fallback && img.src !== new URL(choice.fallback, window.location.href).href) {
          recordSpriteFailure(failedSrc, choice.fallback, choice?.food?.name || '');
          img.src = choice.fallback;
          return;
        }
        recordSpriteFailure(failedSrc, '', choice?.food?.name || '');
      };
      field.appendChild(img);
    });
  }

  function captionChunks(text, maxLineChars = CAPTION_MAX_LINE_CHARS) {
    const source = subtitleOnlyCaptionText(text);
    if (!source) return [];
    const chunks = [];
    let current = '';
    source.split(/(?<=[.!?])\s+/).forEach(sentence => {
      if ((current + ' ' + sentence).trim().length > maxLineChars * CAPTION_MAX_LINES && current) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current = `${current} ${sentence}`.trim();
      }
    });
    if (current) chunks.push(current.trim());

    const wrapped = [];
    chunks.forEach(chunk => {
      let remaining = chunk;
      while (remaining) {
        const result = wrapCaptionLines(remaining, maxLineChars);
        wrapped.push({
          text: result.lines.join(' '),
          lines: result.lines
        });
        remaining = result.overflow.trim();
      }
    });
    return wrapped;
  }

  function wrapCaptionLines(text, maxLineChars = CAPTION_MAX_LINE_CHARS, maxLines = CAPTION_MAX_LINES) {
    const words = subtitleOnlyCaptionText(text)
      .replace(/\b(\d+)\.\s+(\d+)(?=\s*(?:mcg|mg|kg|kcal|g|%|\b))/gi, '$1.$2')
      .split(/\s+/)
      .filter(Boolean);
    const lines = [];
    let current = '';

    for (let index = 0; index < words.length; index += 1) {
      const word = words[index];
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length <= maxLineChars || !current) {
        current = candidate;
        continue;
      }
      lines.push(current);
      current = word;
      if (lines.length === maxLines) {
        return {
          lines,
          overflow: [current, ...words.slice(index + 1)].join(' ')
        };
      }
    }

    if (current) lines.push(current);
    return { lines: lines.slice(0, maxLines), overflow: lines.slice(maxLines).join(' ') };
  }

  function captionWordWeight(word) {
    const text = String(word || '');
    const coreLength = text.replace(/[^a-z0-9]/gi, '').length;
    const punctuationPause = /[.!?]$/.test(text) ? 0.38 : /[,;:]$/.test(text) ? 0.12 : 0;
    const numericExpansion = /\d/.test(text) ? 1.12 : 0;
    const acronymExpansion = /^[A-Z0-9]{2,}$/.test(text.replace(/[^a-z0-9]/gi, '')) ? 0.36 : 0;
    return Math.max(0.68, 0.54 + (coreLength * 0.155) + numericExpansion + acronymExpansion + punctuationPause);
  }

  function speechTokens(value) {
    return normalizeSpeechSearch(value)
      .split(' ')
      .filter(token => token.length > 0);
  }

  function captionSentences(text) {
    const source = String(text || '').replace(/\s+/g, ' ').trim();
    if (!source) return [];
    return source.split(/(?<=[.!?])\s+/).map(item => item.trim()).filter(Boolean);
  }

  function sectionAnchorSeed(scene) {
    const sectionTerms = SECTION_ANCHOR_TERMS[scene?.id] || [];
    if (sectionTerms.length) return sectionTerms;
    return [scene?.label, scene?.id].filter(Boolean);
  }

  function sceneTimingModel(scene) {
    const cueTiming = sceneCueTimingModel(scene);
    if (cueTiming) return cueTiming;

    const source = String(scene?.caption || '').replace(/\s+/g, ' ').trim();
    const rawSentences = captionSentences(source);
    if (!rawSentences.length) {
      return {
        source: 'weighted-caption-v3',
        text: '',
        duration: sceneNarrationDuration(scene),
        totalWeight: 0,
        sentences: [],
        chunks: [],
        words: [],
        anchors: {}
      };
    }

    const duration = Math.max(1, sceneNarrationDuration(scene));
    const sentences = rawSentences.map((sentence, sentenceIndex) => {
      const words = sentence.split(/\s+/).filter(Boolean).map((word, index) => ({
        text: word,
        clean: normalizeSpeechSearch(word),
        tokens: speechTokens(word),
        sentenceIndex,
        index,
        weight: captionWordWeight(word)
      }));
      const pauseWeight = sentenceIndex === rawSentences.length - 1 ? 0 : 0.1;
      return {
        text: sentence,
        sentenceIndex,
        words,
        weight: words.reduce((sum, word) => sum + word.weight, 0) + pauseWeight
      };
    });
    const totalWeight = sentences.reduce((sum, sentence) => sum + sentence.weight, 0) || 1;
    let cursor = 0;
    const timedSentences = sentences.map(sentence => {
      const start = cursor / totalWeight;
      const wordStartCursor = cursor;
      sentence.words.forEach(word => {
        const wordStart = cursor / totalWeight;
        cursor += word.weight;
        word.start = wordStart;
        word.end = cursor / totalWeight;
        word.startSeconds = word.start * duration;
        word.endSeconds = word.end * duration;
      });
      const wordEnd = cursor / totalWeight;
      cursor += Math.max(0, sentence.weight - (cursor - wordStartCursor));
      return { ...sentence, start, end: cursor / totalWeight, wordEnd };
    });

    const words = timedSentences.flatMap(sentence => sentence.words);
    const chunks = captionChunks(source).map(chunk => {
      const chunkTokens = chunk.text.split(/\s+/).filter(Boolean);
      const chunkStartIndex = words.findIndex((word, index) => (
        chunkTokens.every((token, offset) => words[index + offset]?.text === token)
      ));
      const startIndex = chunkStartIndex >= 0 ? chunkStartIndex : 0;
      const endIndex = chunkStartIndex >= 0 ? startIndex + chunkTokens.length - 1 : Math.max(0, words.length - 1);
      return {
        text: chunk.text,
        lines: chunk.lines,
        startWordIndex: startIndex,
        endWordIndex: endIndex,
        start: words[startIndex]?.start || 0,
        end: words[endIndex]?.end || 1
      };
    });

    const anchors = {};
    sectionAnchorSeed(scene).forEach(term => {
      const start = termStartForTiming({ words, sentences: timedSentences }, [term]);
      if (start != null) anchors[normalizeSpeechSearch(term)] = start;
    });

    return {
      source: 'weighted-caption-v3',
      text: source,
      duration,
      totalWeight,
      sentences: timedSentences,
      chunks,
      words: words.map((word, globalIndex) => ({ ...word, globalIndex })),
      anchors
    };
  }

  function isOutroTierCue(scene, cue) {
    if (scene?.id !== 'outro') return false;
    const text = subtitleOnlyCaptionText(cue?.text || (cue?.lines || []).join(' '));
    return cue?.placement === 'tier-center' || TIER_REVEAL_RE.test(text);
  }

  function cueWithSceneTimingOffset(scene, cue) {
    const offset = isOutroTierCue(scene, cue) ? OUTRO_FINAL_REVEAL_BREATH_SECONDS : 0;
    if (!offset) return cue;
    return {
      ...cue,
      startSeconds: asNumber(cue.startSeconds, 0) + offset,
      endSeconds: asNumber(cue.endSeconds, 0) + offset,
      wordTimings: Array.isArray(cue.wordTimings)
        ? cue.wordTimings.map(word => ({
          ...word,
          startSeconds: asNumber(word.startSeconds, 0) + offset,
          endSeconds: asNumber(word.endSeconds, 0) + offset
        }))
        : cue.wordTimings
    };
  }

  function sceneCueTimingModel(scene) {
    const cues = (scene?.subtitleCues || []).filter(cue => cue?.lines?.length);
    if (!cues.length) return null;
    const timingCues = cues.map(cue => cueWithSceneTimingOffset(scene, cue));

    const duration = Math.max(1, sceneNarrationDuration(scene));
    const sourceTimes = timingCues.flatMap(cue => {
      const values = [asNumber(cue.startSeconds, null), asNumber(cue.endSeconds, null)];
      if (Array.isArray(cue.wordTimings)) {
        cue.wordTimings.forEach(word => {
          values.push(asNumber(word.startSeconds, null), asNumber(word.endSeconds, null));
        });
      }
      return values.filter(value => Number.isFinite(value));
    });
    const sourceStart = sourceTimes.length ? Math.min(...sourceTimes) : 0;
    const sourceEnd = sourceTimes.length ? Math.max(...sourceTimes) : sourceStart + duration;
    const preserveSceneSeconds = audioForFood(selectedFood())?.mode === 'split-blocks';
    const sourceDuration = preserveSceneSeconds ? duration : Math.max(0.001, sourceEnd - sourceStart);
    const words = [];
    const chunks = [];
    let hasAlignedWords = false;

    timingCues.forEach(cue => {
      const cueText = subtitleOnlyCaptionText((cue.lines || []).join(' '));
      const timedCueWords = Array.isArray(cue.wordTimings)
        ? cue.wordTimings.filter(word => (
          word?.text
          && Number.isFinite(asNumber(word.startSeconds, null))
          && Number.isFinite(asNumber(word.endSeconds, null))
        ))
        : [];
      const cueWords = timedCueWords.length ? timedCueWords.map(word => word.text) : cueText.split(/\s+/).filter(Boolean);
      const relativeStart = clamp((asNumber(cue.startSeconds, sourceStart) - sourceStart) / sourceDuration, 0, 1);
      const relativeEnd = clamp((asNumber(cue.endSeconds, sourceEnd) - sourceStart) / sourceDuration, relativeStart + 0.001, 1);
      const span = Math.max(0.001, relativeEnd - relativeStart);
      const totalWeight = cueWords.reduce((sum, word) => sum + captionWordWeight(word), 0) || 1;
      let cursor = 0;
      const startWordIndex = words.length;

      if (timedCueWords.length) {
        hasAlignedWords = true;
        timedCueWords.forEach((wordTiming, index) => {
          const word = wordTiming.text;
          const absoluteStart = asNumber(wordTiming.startSeconds, asNumber(cue.startSeconds, sourceStart));
          const absoluteEnd = Math.max(absoluteStart + 0.001, asNumber(wordTiming.endSeconds, absoluteStart + 0.001));
          const start = clamp((absoluteStart - sourceStart) / sourceDuration, 0, 1);
          const end = clamp((absoluteEnd - sourceStart) / sourceDuration, start + 0.001, 1);
          const weight = captionWordWeight(word);
          words.push({
            text: word,
            clean: normalizeSpeechSearch(word),
            tokens: speechTokens(word),
            sentenceIndex: chunks.length,
            index,
            weight,
            start,
            end,
            startSeconds: start * duration,
            endSeconds: end * duration
          });
        });
      } else {
        cueWords.forEach((word, index) => {
          const weight = captionWordWeight(word);
          const start = relativeStart + ((cursor / totalWeight) * span);
          cursor += weight;
          const end = relativeStart + ((cursor / totalWeight) * span);
          words.push({
            text: word,
            clean: normalizeSpeechSearch(word),
            tokens: speechTokens(word),
            sentenceIndex: chunks.length,
            index,
            weight,
            start,
            end,
            startSeconds: start * duration,
            endSeconds: end * duration
          });
        });
      }
      chunks.push({
        text: cueText,
        lines: cue.lines.slice(0, CAPTION_MAX_LINES),
        placement: captionPlacementForCue(cue, cueText),
        role: cue.role || null,
        cueId: cue.id,
        startWordIndex,
        endWordIndex: Math.max(startWordIndex, words.length - 1),
        start: relativeStart,
        end: relativeEnd,
        wordEnd: words[words.length - 1]?.end || relativeEnd
      });
    });

    const timedWords = words.map((word, globalIndex) => ({ ...word, globalIndex }));
    const anchors = {};
    sectionAnchorSeed(scene).forEach(term => {
      const start = termStartForTiming({ words: timedWords, sentences: chunks }, [term]);
      if (start != null) anchors[normalizeSpeechSearch(term)] = start;
    });

    return {
      source: hasAlignedWords ? 'subtitle-forced-alignment-v1' : 'subtitle-cues-v3',
      text: timingCues.map(cue => cue.lines.join(' ')).join(' '),
      duration,
      totalWeight: words.reduce((sum, word) => sum + word.weight, 0) || 1,
      sentences: chunks.map((chunk, sentenceIndex) => ({ ...chunk, sentenceIndex })),
      chunks,
      words: timedWords,
      anchors
    };
  }

  function sceneTimedSentences(scene) {
    return sceneTimingModel(scene).sentences.map(sentence => ({
      text: sentence.text,
      start: sentence.start,
      end: sentence.end
    }));
  }

  function emptyCaptionFrame(role = 'caption-gap') {
    return {
      chunk: '',
      lines: [],
      placement: 'lower-third',
      role,
      words: [],
      activeWordIndex: -1,
      activeWord: '',
      activeWordStart: 0,
      activeWordEnd: 0
    };
  }

  function isOutroPreTierCaptionGap(scene, timing, target) {
    if (scene?.id !== 'outro') return false;
    const previousChunk = [...(timing.chunks || [])].reverse().find(chunk => target >= chunk.end);
    const nextChunk = (timing.chunks || []).find(chunk => target < chunk.start);
    if (!previousChunk || !nextChunk) return false;
    const nextText = subtitleOnlyCaptionText(nextChunk.text || '');
    return nextChunk.role === 'tier-reveal'
      || nextChunk.placement === 'tier-center'
      || TIER_REVEAL_RE.test(nextText);
  }

  function captionFrame(scene, progress) {
    const timing = sceneTimingModel(scene);
    if (!timing.words.length) return { chunk: '', lines: [], words: [], activeWordIndex: -1 };

    const lookahead = CAPTION_WORD_LOOKAHEAD_SECONDS / timing.duration;
    const target = clamp(progress + lookahead, 0, 0.999);
    const timeChunk = timing.chunks.find(chunk => target >= chunk.start && target < chunk.end);
    if (!timeChunk && isOutroPreTierCaptionGap(scene, timing, target)) return emptyCaptionFrame('pre-tier-gap');
    const candidateWords = timeChunk
      ? timing.words.slice(timeChunk.startWordIndex, timeChunk.endWordIndex + 1)
      : timing.words;
    const activeWord = candidateWords.find(word => target >= word.start && target < word.end)
      || [...candidateWords].reverse().find(word => target >= word.end)
      || candidateWords.find(word => target < word.start)
      || timing.words[timing.words.length - 1];
    const activeChunk = timeChunk
      || timing.chunks.find(chunk => activeWord.globalIndex >= chunk.startWordIndex && activeWord.globalIndex <= chunk.endWordIndex)
      || timing.chunks[0]
      || { text: timing.text, startWordIndex: 0, endWordIndex: timing.words.length - 1 };
    const chunkWords = timing.words.slice(activeChunk.startWordIndex, activeChunk.endWordIndex + 1);
    const activeWordIndex = chunkWords.findIndex(word => word.globalIndex === activeWord.globalIndex);
    const lines = captionFrameLines(activeChunk, timing.words, activeWord.globalIndex);
    return {
      chunk: activeChunk.text,
      lines,
      placement: activeChunk.placement || 'lower-third',
      role: activeChunk.role || null,
      words: chunkWords.map(word => word.text),
      activeWordIndex: activeWordIndex >= 0 ? activeWordIndex : 0,
      activeWord: activeWord.text,
      activeWordStart: activeWord.start,
      activeWordEnd: activeWord.end
    };
  }

  function captionFrameLines(chunk, words, activeGlobalIndex) {
    const maxLineChars = captionLineCharsForPlacement(chunk.placement || 'lower-third');
    const chunkLines = (chunk.lines?.length ? chunk.lines : wrapCaptionLines(chunk.text, maxLineChars).lines).slice(0, CAPTION_MAX_LINES);
    let cursor = chunk.startWordIndex;
    return chunkLines.map(line => {
      const lineWords = line.split(/\s+/).filter(Boolean);
      return lineWords.map(text => {
        const word = words[cursor];
        cursor += 1;
        return {
          text,
          active: word?.globalIndex === activeGlobalIndex
        };
      });
    });
  }

  function renderCaption(container, scene, progress, precomputedFrame = null) {
    const frame = precomputedFrame || captionFrame(scene, progress);
    if (!frame?.lines?.length) {
      container.classList.remove('summary-full', 'tier-center');
      container.classList.add('lower-third');
      container.dataset.captionKey = frame?.role || 'empty-caption';
      container.removeAttribute('aria-label');
      container.replaceChildren();
      return;
    }
    if (shouldSuppressCaptionFrame(scene, frame)) {
      container.classList.remove('summary-full', 'tier-center');
      container.classList.add('lower-third');
      container.dataset.captionKey = 'suppressed-tier-reveal';
      container.removeAttribute('aria-label');
      container.replaceChildren();
      return;
    }
    container.classList.toggle('summary-full', frame.placement === 'summary-full');
    container.classList.toggle('tier-center', frame.placement === 'tier-center');
    container.classList.toggle('lower-third', !['summary-full', 'tier-center'].includes(frame.placement));
    const key = `${frame.placement}::${frame.chunk}::${frame.activeWord}`;
    if (container.dataset.captionKey === key) return;
    container.dataset.captionKey = key;
    container.setAttribute('aria-label', frame.chunk);
    container.replaceChildren(...frame.lines.map(line => {
      const lineNode = document.createElement('div');
      lineNode.className = 'caption-line';
      line.forEach(word => {
        const node = document.createElement('span');
        node.className = `caption-word${word.active ? ' active' : ''}`;
        node.textContent = word.text;
        lineNode.appendChild(node);
      });
      return lineNode;
    }));
  }

  function shouldSuppressCaptionFrame(scene, frame) {
    if (scene?.id !== 'outro') return false;
    if (!outroTierSpritePath(scoreTier(selectedFood()))) return false;
    if (frame?.role === 'tier-reveal') return true;
    return frame?.placement === 'tier-center' && TIER_REVEAL_RE.test(subtitleOnlyCaptionText(frame?.chunk || ''));
  }

  function syncCaptionSafeArea(caption) {
    const shell = els.videoStage.closest('.phone-shell');
    if (!shell) return;

    const pixelUnit = cssPixels(getComputedStyle(document.documentElement).getPropertyValue('--pixel-unit'), 4);
    const safe = CAPTION_SAFE_X * pixelUnit;
    const stageRect = els.videoStage.getBoundingClientRect();
    const shellRect = shell.getBoundingClientRect();
    const shellStyle = getComputedStyle(shell);
    const contentLeft = shellRect.left
      + cssPixels(shellStyle.borderLeftWidth)
      + cssPixels(shellStyle.paddingLeft);
    const contentRight = shellRect.right
      - cssPixels(shellStyle.borderRightWidth)
      - cssPixels(shellStyle.paddingRight);
    const visibleLeft = Math.max(stageRect.left, contentLeft);
    const visibleRight = Math.min(stageRect.right, contentRight);
    const visibleTop = Math.max(stageRect.top, shellRect.top + cssPixels(shellStyle.borderTopWidth) + cssPixels(shellStyle.paddingTop));
    const visibleBottom = Math.min(stageRect.bottom, shellRect.bottom - cssPixels(shellStyle.borderBottomWidth) - cssPixels(shellStyle.paddingBottom));
    const leftInset = Math.max(0, visibleLeft - stageRect.left) + safe;
    const rightInset = Math.max(0, stageRect.right - visibleRight) + safe;
    const topInset = Math.max(0, visibleTop - stageRect.top);
    const bottomInset = Math.max(0, stageRect.bottom - visibleBottom);
    caption.style.setProperty('--caption-safe-left', `${leftInset.toFixed(2)}px`);
    caption.style.setProperty('--caption-safe-right', `${rightInset.toFixed(2)}px`);
    caption.style.setProperty('--caption-safe-top', `${topInset.toFixed(2)}px`);
    caption.style.setProperty('--caption-safe-bottom', `${bottomInset.toFixed(2)}px`);
  }

  function normalizeSpeechSearch(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function segmentStartForTerms(segments, terms) {
    const normalized = terms.map(normalizeSpeechSearch).filter(Boolean);
    if (!normalized.length) return null;
    for (const segment of segments) {
      const haystack = normalizeSpeechSearch(segment.text);
      if (normalized.some(term => haystack.includes(term))) return segment.start;
      if (normalized.some(term => {
        const tokens = term.split(' ').filter(token => token.length > 1);
        return tokens.length > 1 && tokens.every(token => haystack.includes(token));
      })) return segment.start;
    }
    return null;
  }

  function termStartForTiming(timing, terms) {
    const normalizedTerms = terms.map(speechTokens).filter(tokens => tokens.length);
    if (!normalizedTerms.length || !timing?.words?.length) return null;

    const tokenStream = timingTokenStream(timing);
    for (const termTokens of normalizedTerms) {
      for (let index = 0; index <= tokenStream.length - termTokens.length; index += 1) {
        const matches = termTokens.every((token, offset) => tokenStream[index + offset]?.token === token);
        if (matches) return timing.words[tokenStream[index].wordIndex]?.start;
      }
    }

    for (const termTokens of normalizedTerms) {
      if (termTokens.length !== 1 || termTokens[0].length <= 1) continue;
      const looseMatch = timing.words.find(word => (word.clean || '').includes(termTokens[0]));
      if (looseMatch) return looseMatch.start;
    }

    return segmentStartForTerms(timing.sentences || [], terms);
  }

  function timingTokenStream(timing) {
    return (timing?.words || []).flatMap((word, wordIndex) => {
      const tokens = Array.isArray(word.tokens) && word.tokens.length
        ? word.tokens
        : speechTokens(word.clean || word.text || '');
      return tokens.map(token => ({ token, wordIndex }));
    });
  }

  function termSpanForTiming(timing, terms) {
    const normalizedTerms = terms.map(speechTokens).filter(tokens => tokens.length);
    if (!normalizedTerms.length || !timing?.words?.length) return null;

    const tokenStream = timingTokenStream(timing);
    let best = null;
    for (const termTokens of normalizedTerms) {
      for (let index = 0; index <= tokenStream.length - termTokens.length; index += 1) {
        const matches = termTokens.every((token, offset) => tokenStream[index + offset]?.token === token);
        if (!matches) continue;
        const start = timing.words[tokenStream[index].wordIndex]?.start;
        const end = timing.words[tokenStream[index + termTokens.length - 1].wordIndex]?.end;
        if (start == null || end == null) continue;
        if (!best || start < best.start) best = { start, end };
      }
    }
    if (best) return best;

    const fallbackStart = termStartForTiming(timing, terms);
    if (fallbackStart == null) return null;
    const segment = (timing.sentences || []).find(item => fallbackStart >= item.start && fallbackStart <= item.end);
    return {
      start: fallbackStart,
      end: Math.max(fallbackStart + 0.04, segment?.end ?? fallbackStart + 0.14)
    };
  }

  function metricTerms(metricKey, fallbackLabel = '') {
    const fallback = normalizeSpeechSearch(fallbackLabel);
    return [
      ...(METRIC_SPEECH_TERMS[metricKey] || []),
      ...(fallback.length > 1 ? [fallbackLabel] : [])
    ].filter(Boolean);
  }

  function macroSubmetricNarrationWindow(scene, timing, spec) {
    if (!spec) return null;
    const span = termSpanForTiming(timing, metricTerms(spec.key, spec.label || spec.shortLabel || ''));
    if (!span) return null;
    const segment = (timing.chunks || timing.sentences || []).find(item => span.start >= item.start - 0.001 && span.start <= item.end + 0.001);
    return {
      start: clamp(span.start - 0.015, 0, 1),
      end: clamp(Math.max(span.end, segment?.end ?? span.end) + 0.045, 0, 1)
    };
  }

  function submacroHighlightStrength(scene, sceneProgress, window) {
    const fade = clamp(0.22 / Math.max(1, sceneNarrationDuration(scene)), 0.018, 0.08);
    const fadeIn = clamp((sceneProgress - window.start) / fade, 0, 1);
    const fadeOut = clamp((window.end - sceneProgress) / fade, 0, 1);
    return easeOutCubic(Math.min(fadeIn, fadeOut));
  }

  function macroSubmetricHighlightMap(scene, sceneProgress) {
    const sectionId = scene?.id || '';
    const specs = MACRO_SUBMETRIC_SPECS[sectionId] || [];
    if (!specs.length) return new Map();
    const timing = sceneTimingModel(scene);
    const fade = clamp(0.22 / Math.max(1, sceneNarrationDuration(scene)), 0.018, 0.08);
    const windows = specs
      .map((spec, index) => {
        const window = macroSubmetricNarrationWindow(scene, timing, spec);
        return window ? { index, window } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.window.start - b.window.start);
    const highlights = new Map();
    windows.forEach((item, index) => {
      const next = windows[index + 1];
      const window = {
        ...item.window,
        end: next ? next.window.start + fade : 1
      };
      const strength = submacroHighlightStrength(scene, sceneProgress, window);
      if (strength > 0) highlights.set(item.index, { rowIndex: item.index, strength });
    });
    return highlights;
  }

  function micronMetricHighlightMap(scene, sceneProgress) {
    const sectionId = scene?.id || '';
    const specs = micronSpecsForSection(sectionId);
    if (!specs.length) return new Map();
    const timing = sceneTimingModel(scene);
    const fade = clamp(0.22 / Math.max(1, sceneNarrationDuration(scene)), 0.018, 0.08);
    const windows = specs
      .map((spec, index) => {
        const window = macroSubmetricNarrationWindow(scene, timing, spec);
        return window ? { index, window } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.window.start - b.window.start);
    const colors = micronRelativeHighlightColors(sectionId, windows.map(item => item.index));
    const highlights = new Map();
    windows.forEach((item, index) => {
      const next = windows[index + 1];
      const window = {
        ...item.window,
        end: next ? next.window.start + fade : 1
      };
      const strength = submacroHighlightStrength(scene, sceneProgress, window);
      if (strength > 0) highlights.set(item.index, {
        columnIndex: item.index,
        color: colors.get(item.index) || micronMetricHighlightColor(sectionId, item.index),
        strength
      });
    });
    return highlights;
  }

  function proConItemTerms(sectionId, rowIndex, layer = null) {
    const item = selectedFood()?.contextItems?.[sectionId]?.[rowIndex];
    return [
      item?.title,
      item?.explanation,
      ...layerTextTerms(layer)
    ].filter(Boolean);
  }

  function proConNarrationWindow(scene, timing, sectionId, rowIndex, layer = null) {
    const span = termSpanForTiming(timing, proConItemTerms(sectionId, rowIndex, layer));
    if (!span) return null;
    return {
      start: clamp(span.start - 0.002, 0, 1),
      end: clamp(span.end + 0.004, 0, 1)
    };
  }

  function proConNarrationHighlightMap(scene, sceneProgress) {
    const sectionId = scene?.id || '';
    if (sectionId !== 'pros' && sectionId !== 'cons') return new Map();
    const timing = sceneTimingModel(scene);
    const fade = clamp(0.18 / Math.max(1, sceneNarrationDuration(scene)), 0.016, 0.055);
    const windows = [0, 1, 2]
      .map(index => {
        const window = proConNarrationWindow(scene, timing, sectionId, index);
        return window ? { index, window } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.window.start - b.window.start);
    const highlights = new Map();
    windows.forEach((item, index) => {
      const next = windows[index + 1];
      const cueWindow = {
        ...item.window,
        end: next ? next.window.start + fade : 1
      };
      const strength = easeOutCubic(clamp((sceneProgress - item.window.start) / fade, 0, 1));
      const cueStrength = submacroHighlightStrength(scene, sceneProgress, cueWindow);
      if (strength > 0) highlights.set(item.index, {
        rowIndex: item.index,
        color: sectionId === 'pros' ? SUBMACRO_VALUE_COLORS.green : SUBMACRO_VALUE_COLORS.red,
        impactLevel: selectedFood()?.contextItems?.[sectionId]?.[item.index]?.impactLevel || null,
        strength,
        cueStrength
      });
    });
    return highlights;
  }

  function strongestHighlightCue(scene, macroHighlightMap, micronHighlightMap, proConHighlightMap) {
    const sceneId = scene?.id || 'scene';
    const candidates = [];
    for (const [rowIndex, item] of macroHighlightMap || []) {
      const safeRowIndex = item?.rowIndex ?? rowIndex;
      const color = macroSubmetricHighlightColor(sceneId, safeRowIndex);
      candidates.push({
        key: `${sceneId}:macro:${safeRowIndex}`,
        tone: highlightToneFromColor(color),
        strength: clamp(asNumber(item?.strength, 0), 0, 1)
      });
    }
    for (const [columnIndex, item] of micronHighlightMap || []) {
      candidates.push({
        key: `${sceneId}:micron:${item?.columnIndex ?? columnIndex}`,
        tone: highlightToneFromColor(item?.color),
        strength: clamp(asNumber(item?.strength, 0), 0, 1)
      });
    }
    for (const [rowIndex, item] of proConHighlightMap || []) {
      candidates.push({
        key: `${sceneId}:${sceneId === 'cons' ? 'con' : 'pro'}:${item?.rowIndex ?? rowIndex}`,
        tone: sceneId === 'cons' ? 'red' : sceneId === 'pros' ? 'green' : highlightToneFromColor(item?.color),
        strength: clamp(asNumber(item?.cueStrength ?? item?.strength, 0), 0, 1)
      });
    }
    return candidates
      .filter(item => item.strength > 0)
      .sort((a, b) => b.strength - a.strength || a.key.localeCompare(b.key))[0] || { key: '', strength: 0 };
  }

  function highlightToneFromColor(color) {
    const normalized = String(color || '').trim().toLowerCase();
    if (normalized === SUBMACRO_VALUE_COLORS.green.toLowerCase() || normalized.includes('green')) return 'green';
    if (normalized === SUBMACRO_VALUE_COLORS.red.toLowerCase() || normalized.includes('red')) return 'red';
    return 'neutral';
  }

  function highlightGlowSfxSettings(path = highlightGlowSfxPath()) {
    return sfxAssetRoleSettings('highlightGlow', path) || {};
  }

  function highlightGlowSfxSetting(key, fallback, path = state.highlightGlowSfxPath || highlightGlowSfxPath()) {
    const settings = highlightGlowSfxSettings(path);
    return Object.prototype.hasOwnProperty.call(settings, key) ? settings[key] : fallback;
  }

  function highlightGlowPlaybackRateRanges(path = state.highlightGlowSfxPath || highlightGlowSfxPath()) {
    return highlightGlowSfxSetting('playbackRateRanges', HIGHLIGHT_GLOW_SFX_PLAYBACK_RATE_RANGES, path);
  }

  function randomHighlightGlowPlaybackRate(previousRate, tone = 'neutral', path = state.highlightGlowSfxPath || highlightGlowSfxPath()) {
    const ranges = highlightGlowPlaybackRateRanges(path);
    const rangeSpec = ranges[tone] || ranges.neutral || HIGHLIGHT_GLOW_SFX_PLAYBACK_RATE_RANGES.neutral;
    const min = rangeSpec.min;
    const max = rangeSpec.max;
    const range = max - min;
    const minRateChange = asNumber(
      highlightGlowSfxSetting('minRateChange', HIGHLIGHT_GLOW_SFX_MIN_RATE_CHANGE, path),
      HIGHLIGHT_GLOW_SFX_MIN_RATE_CHANGE
    );
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = min + (Math.random() * range);
      if (Math.abs(candidate - previousRate) >= minRateChange) return candidate;
    }
    const lower = clamp(previousRate - minRateChange, min, max);
    const upper = clamp(previousRate + minRateChange, min, max);
    return Math.abs(lower - previousRate) > Math.abs(upper - previousRate) ? lower : upper;
  }

  function disableAudioPitchPreservation(audio) {
    try {
      if ('preservesPitch' in audio) audio.preservesPitch = false;
      if ('mozPreservesPitch' in audio) audio.mozPreservesPitch = false;
      if ('webkitPreservesPitch' in audio) audio.webkitPreservesPitch = false;
    } catch {}
  }

  function retuneHighlightGlowSfx(audio, cue) {
    const nextKey = cue?.key || '';
    if (!nextKey || nextKey === state.highlightGlowSfxKey) return;
    const path = state.highlightGlowSfxPath || highlightGlowSfxPath();
    const playbackRate = randomHighlightGlowPlaybackRate(
      state.highlightGlowSfxTargetPlaybackRate || state.highlightGlowSfxPlaybackRate || 1,
      cue?.tone,
      path
    );
    state.highlightGlowSfxKey = nextKey;
    state.highlightGlowSfxTargetPlaybackRate = playbackRate;
    disableAudioPitchPreservation(audio);
  }

  function ensureHighlightGlowSfxAudio() {
    const food = selectedFood();
    const path = highlightGlowSfxPath(food);
    const foodKey = highlightGlowSfxFoodKey(food);
    if (state.highlightGlowSfxAudio && (state.highlightGlowSfxPath !== path || state.highlightGlowSfxFoodKey !== foodKey)) {
      pauseHighlightGlowSfx();
      state.highlightGlowSfxAudio = null;
    }
    if (!state.highlightGlowSfxAudio) {
      const audio = new Audio(docsAssetPath(path));
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = 0;
      state.highlightGlowSfxAudio = audio;
      state.highlightGlowSfxPath = path;
      state.highlightGlowSfxFoodKey = foodKey;
    }
    return state.highlightGlowSfxAudio;
  }

  function highlightGlowFrameDeltaSeconds() {
    const now = performance.now();
    const deltaSeconds = clamp((now - state.highlightGlowSfxLastFrameAt) / 1000, 0.016, 0.12);
    state.highlightGlowSfxLastFrameAt = now;
    return deltaSeconds;
  }

  function highlightGlowFadeStep(targetStrength) {
    const path = state.highlightGlowSfxPath || highlightGlowSfxPath();
    const targetVolume = state.audioEnabled && state.playing
      ? clamp(targetStrength, 0, 1) * asNumber(highlightGlowSfxSetting('volume', HIGHLIGHT_GLOW_SFX_VOLUME, path), HIGHLIGHT_GLOW_SFX_VOLUME)
      : 0;
    const deltaSeconds = highlightGlowFrameDeltaSeconds();
    const speed = targetVolume > state.highlightGlowSfxVolume
      ? asNumber(highlightGlowSfxSetting('fadeInSpeed', HIGHLIGHT_GLOW_SFX_FADE_IN_SPEED, path), HIGHLIGHT_GLOW_SFX_FADE_IN_SPEED)
      : asNumber(highlightGlowSfxSetting('fadeOutSpeed', HIGHLIGHT_GLOW_SFX_FADE_OUT_SPEED, path), HIGHLIGHT_GLOW_SFX_FADE_OUT_SPEED);
    const blend = 1 - Math.exp(-speed * deltaSeconds);
    state.highlightGlowSfxVolume += (targetVolume - state.highlightGlowSfxVolume) * blend;
    return { volume: state.highlightGlowSfxVolume, deltaSeconds };
  }

  function smoothHighlightGlowPlaybackRate(audio, deltaSeconds) {
    const path = state.highlightGlowSfxPath || highlightGlowSfxPath();
    const targetRate = state.highlightGlowSfxTargetPlaybackRate || state.highlightGlowSfxPlaybackRate || 1;
    const currentRate = asNumber(audio.playbackRate, state.highlightGlowSfxPlaybackRate || targetRate);
    const rateFadeSpeed = asNumber(
      highlightGlowSfxSetting('playbackRateFadeSpeed', HIGHLIGHT_GLOW_SFX_PLAYBACK_RATE_FADE_SPEED, path),
      HIGHLIGHT_GLOW_SFX_PLAYBACK_RATE_FADE_SPEED
    );
    const blend = 1 - Math.exp(-rateFadeSpeed * deltaSeconds);
    const nextRate = currentRate + ((targetRate - currentRate) * blend);
    state.highlightGlowSfxPlaybackRate = nextRate;
    try {
      audio.playbackRate = nextRate;
    } catch {}
  }

  function updateHighlightGlowSfx(cue) {
    const { volume, deltaSeconds } = highlightGlowFadeStep(cue?.strength || 0);
    const path = state.highlightGlowSfxPath || highlightGlowSfxPath();
    const stopThreshold = asNumber(
      highlightGlowSfxSetting('stopThreshold', HIGHLIGHT_GLOW_SFX_STOP_THRESHOLD, path),
      HIGHLIGHT_GLOW_SFX_STOP_THRESHOLD
    );
    const audio = state.highlightGlowSfxAudio || (volume > stopThreshold ? ensureHighlightGlowSfxAudio() : null);
    if (!audio) return;

    retuneHighlightGlowSfx(audio, cue);
    smoothHighlightGlowPlaybackRate(audio, deltaSeconds);
    audio.volume = clamp(volume, 0, 1);
    if (volume > stopThreshold && state.audioEnabled && state.playing) {
      const playPromise = audio.paused ? audio.play() : null;
      if (playPromise?.catch) playPromise.catch(() => {});
      return;
    }

    if (volume <= stopThreshold) {
      try {
        audio.pause();
      } catch {}
    }
  }

  function pauseHighlightGlowSfx({ reset = true } = {}) {
    const audio = state.highlightGlowSfxAudio;
    state.highlightGlowSfxVolume = 0;
    state.highlightGlowSfxKey = '';
    state.highlightGlowSfxPlaybackRate = 1;
    state.highlightGlowSfxTargetPlaybackRate = 1;
    state.highlightGlowSfxLastFrameAt = performance.now();
    if (!audio) return;
    try {
      audio.volume = 0;
      audio.playbackRate = 1;
      audio.pause();
      if (reset) audio.currentTime = 0;
    } catch {}
  }

  function macroSubmetricHighlightColor(sectionId, rowIndex) {
    const spec = MACRO_SUBMETRIC_SPECS[sectionId]?.[rowIndex];
    if (!spec) return SUBMACRO_VALUE_COLORS.neutral;
    const presentation = macroArrowPresentation(selectedFood(), sectionId, spec);
    return presentation.textColor || SUBMACRO_VALUE_COLORS[presentation.color] || SUBMACRO_VALUE_COLORS.neutral;
  }

  function micronMetricHighlightColor(sectionId, columnIndex) {
    const value = micronDvValue(sectionId, columnIndex);
    if (value == null || value < 10) return SUBMACRO_VALUE_COLORS.red;
    return SUBMACRO_VALUE_COLORS.green;
  }

  function micronDvValue(sectionId, columnIndex, food = selectedFood()) {
    const spec = micronSpecsForSection(sectionId)[columnIndex];
    return spec ? asNumber(food?.metrics?.[spec.key], null) : null;
  }

  function micronRelativeHighlightColors(sectionId, columnIndexes) {
    const colors = new Map();
    const uniqueIndexes = [...new Set(columnIndexes)].filter(index => index != null);
    const values = uniqueIndexes.map(index => ({ index, value: micronDvValue(sectionId, index) }));
    if (!values.length) return colors;
    values.forEach(item => {
      colors.set(item.index, micronMetricHighlightColor(sectionId, item.index));
    });
    return colors;
  }

  function colorWithAlpha(color, alpha) {
    const value = String(color || '').trim();
    const match = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) return value;
    const hex = match[1].length === 3
      ? match[1].split('').map(char => `${char}${char}`).join('')
      : match[1];
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1).toFixed(3)})`;
  }

  function applyNarrationHighlightStyles(node, color, strength) {
    node.classList.add('submacro-narration-highlight');
    node.style.setProperty('--submacro-highlight', color);
    node.style.setProperty('--submacro-highlight-strength', strength.toFixed(3));
    node.style.setProperty('--submacro-highlight-glow', colorWithAlpha(color, 0.9 * strength));
    node.style.setProperty('--submacro-highlight-glow-soft', colorWithAlpha(color, 0.55 * strength));
    node.style.setProperty('--submacro-highlight-glow-wide', colorWithAlpha(color, 0.3 * strength));
  }

  function applySubmacroNarrationHighlight(node, scene, revealSchedule, highlightMap) {
    if (!highlightMap || revealSchedule?.family !== 'macro') return;
    const activeHighlight = highlightMap.get(revealSchedule.rowIndex);
    if (!activeHighlight) return;
    if (!['score-card', 'arrow', 'label', 'value', 'row'].includes(revealSchedule.kind)) return;
    const color = macroSubmetricHighlightColor(scene?.id || '', activeHighlight.rowIndex);
    const strength = clamp(activeHighlight.strength, 0, 1);
    applyNarrationHighlightStyles(node, color, strength);
    if (revealSchedule.kind === 'arrow') {
      node.style.filter = [
        `brightness(${(1 + (0.24 * strength)).toFixed(3)})`,
        `saturate(${(1 + (0.32 * strength)).toFixed(3)})`,
        `drop-shadow(0 0 calc(${(1.2 + (1.8 * strength)).toFixed(2)}px * var(--pixel-unit)) ${colorWithAlpha(color, 0.42 + (0.42 * strength))})`,
        `drop-shadow(0 0 calc(${(2.2 + (1.8 * strength)).toFixed(2)}px * var(--pixel-unit)) ${colorWithAlpha(color, 0.18 + (0.2 * strength))})`
      ].join(' ');
    }
  }

  function applyMicronNarrationHighlight(node, scene, revealSchedule, highlightMap) {
    if (!highlightMap || revealSchedule?.family !== 'micron') return;
    if (revealSchedule.columnIndex == null) return;
    const activeHighlight = highlightMap.get(revealSchedule.columnIndex);
    if (!activeHighlight) return;
    if (!['dv-bar', 'icon', 'label', 'value', 'column'].includes(revealSchedule.kind)) return;
    const color = activeHighlight.color || micronMetricHighlightColor(scene?.id || '', activeHighlight.columnIndex);
    const strength = clamp(activeHighlight.strength, 0, 1);
    applyNarrationHighlightStyles(node, color, strength);
  }

  function applyProConNarrationHighlight(node, scene, revealSchedule, highlightMap) {
    if (!highlightMap || (revealSchedule?.family !== 'pros' && revealSchedule?.family !== 'cons')) return;
    if (revealSchedule.rowIndex == null) return;
    if (!['bullet', 'impact', 'item', 'row'].includes(revealSchedule.kind)) return;
    applyProConRestingState(node, layerKindClass(node, 'text'));
    const activeHighlight = highlightMap.get(revealSchedule.rowIndex);
    if (!activeHighlight) return;
    const strength = clamp(activeHighlight.strength, 0, 1);
    if (layerKindClass(node, 'text')) {
      node.style.color = '#fffdf4';
      node.style.setProperty('--pro-con-text-core-glow', colorWithAlpha('#fffdf4', 0.92 * strength));
    }
    applyNarrationHighlightStyles(node, activeHighlight.color, strength);
    node.style.setProperty('--submacro-highlight-glow', colorWithAlpha(activeHighlight.color, 0.96 * strength));
    node.style.setProperty('--submacro-highlight-glow-soft', colorWithAlpha(activeHighlight.color, 0.72 * strength));
    node.style.setProperty('--submacro-highlight-glow-wide', colorWithAlpha(activeHighlight.color, 0.46 * strength));
    node.classList.add('pro-con-point-highlight');
  }

  function layerKindClass(node, kind) {
    return node?.classList?.contains(kind);
  }

  function applyProConRestingState(node, isText) {
    node.classList.add('pro-con-row-resting');
    if (isText) node.style.color = '#d9cec1';
  }

  function seededHash(value) {
    return String(value || '').split('').reduce((hash, char) => (
      ((hash << 5) - hash + char.charCodeAt(0)) | 0
    ), 0);
  }

  function seededUnit(seed) {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
  }

  function rowIndexFromY(layer, startY, stepY, maxIndex) {
    const y = asNumber(layer?.y, null);
    if (y == null) return null;
    return clamp(Math.round((y - startY) / stepY), 0, maxIndex);
  }

  function macroRowIndex(layer) {
    const fingerprint = `${layer.id || ''} ${layer.label || ''} ${layer.src || ''}`.toLowerCase();
    if (!/(submacro|arrow indicator|green_arrow|red_arrow|yellow_arrow)/.test(fingerprint)) return null;
    return rowIndexFromY(layer, 73, 18, 3);
  }

  function proConRowIndex(layer, sectionId) {
    const id = String(layer?.id || '').toLowerCase();
    const idMatch = id.match(new RegExp(`^${sectionId}_(?:impact|item)_(\\d+)$`));
    if (idMatch) return clamp(Number(idMatch[1]) - 1, 0, 2);
    const fingerprint = `${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    if (!fingerprint.includes(sectionId === 'pros' ? 'pro' : 'con')) return null;
    return rowIndexFromY(layer, 47, 28, 2);
  }

  function micronTextIndex(layer, sectionId) {
    const id = String(layer?.id || '').toLowerCase();
    const match = id.match(new RegExp(`^${sectionId}_(?:label|percent)_(\\d+)$`));
    return match ? Number(match[1]) - 1 : null;
  }

  function micronColumnIndex(layer, sectionId, allLayers) {
    const textIndex = micronTextIndex(layer, sectionId);
    if (textIndex != null) return textIndex;
    const textboxIndex = micronBarTextboxColumnIndex(layer, sectionId);
    if (textboxIndex != null) return textboxIndex;
    const fingerprint = `${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    if (fingerprint.includes('bar_line')) return null;
    if (!/(micro|micros|dv bar|bar_line|bar)/.test(fingerprint)) return null;
    const labels = allLayers
      .filter(candidate => micronTextIndex(candidate, sectionId) != null)
      .map(candidate => ({ index: micronTextIndex(candidate, sectionId), centerX: layerCenterX(candidate) }));
    if (!labels.length) return null;
    const centerX = layerCenterX(layer);
    return labels.reduce((closest, item) => (
      Math.abs(item.centerX - centerX) < Math.abs(closest.centerX - centerX) ? item : closest
    ), labels[0]).index;
  }

  function layerTextTerms(layer) {
    const text = String(layer?.text || '').trim();
    if (!text || /^n\/a$/i.test(text)) return [];
    const words = normalizeSpeechSearch(text).split(' ').filter(word => word.length > 2);
    return [text, words.slice(0, 4).join(' ')].filter(Boolean);
  }

  function isMacroIcon(layer) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return /\/macros|macro|fat_icon|carb_icon|protein_icon/.test(fingerprint) && /icon/.test(fingerprint);
  }

  function isMacroScoreCard(layer) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return /submacro_bullet|score card sprite|bullet_point/.test(fingerprint);
  }

  function isMacroArrow(layer) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return /arrow indicator|green_arrow|red_arrow|yellow_arrow|\/arrow_indicators\//.test(fingerprint);
  }

  function macroArrowGlowRgb(layer) {
    const fingerprint = `${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    if (fingerprint.includes('red')) return '255, 111, 111';
    if (fingerprint.includes('green')) return '124, 242, 167';
    return '255, 247, 205';
  }

  function macroRevealWindowProgress(scene, seconds) {
    return Math.min(SUBMACRO_REVEAL_WINDOW_MAX_PROGRESS, Math.max(0.075, seconds / Math.max(1, sceneContentDuration(scene))));
  }

  function macroTextKind(layer, sectionId) {
    const id = String(layer?.id || '').toLowerCase();
    if (id === `${sectionId}_macro_label`) return 'macro-label';
    if (id === `${sectionId}_macro_value`) return 'macro-value';
    if (id.startsWith(`${sectionId}_submacro_label_`)) return 'label';
    if (id.startsWith(`${sectionId}_submacro_value_`)) return 'value';
    return null;
  }

  function isMacroTotalText(layer, sectionId) {
    const kind = macroTextKind(layer, sectionId);
    return kind === 'macro-label' || kind === 'macro-value';
  }

  function isMicronTitleLayer(layer, sectionId) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''}`.toLowerCase();
    return fingerprint.includes(sectionId.slice(0, -1)) && /title|main/.test(fingerprint);
  }

  function isMicronIconLayer(layer, sectionId) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return fingerprint.includes(sectionId.slice(0, -1)) && /icon/.test(fingerprint);
  }

  function isMicronBarLine(layer) {
    return String(layer?.src || '').toLowerCase().includes('/bars/bar_line.');
  }

  function micronTextKind(layer, sectionId) {
    const id = String(layer?.id || '').toLowerCase();
    if (id.match(new RegExp(`^${sectionId}_label_\\d+$`))) return 'label';
    if (id.match(new RegExp(`^${sectionId}_percent_\\d+$`))) return 'value';
    if (isMicronBarTextboxLayer(layer, sectionId)) return 'value';
    return null;
  }

  function isMicronBarTextboxLayer(layer, sectionId) {
    if (!isTextLayer(layer)) return false;
    const id = String(layer?.id || '').toLowerCase();
    return id.match(new RegExp(`^${sectionId}_bar_percent_c\\d+_\\d+$`))
      || (
        layer?.microBarTextbox === true
        && id.startsWith(`${sectionId}_`)
      );
  }

  function micronBarTextboxPercent(layer, sectionId) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''}`.toLowerCase();
    const match = fingerprint.match(new RegExp(`${sectionId}_bar_percent_c\\d+_(\\d+)`))
      || fingerprint.match(/\b(\d+)%\s*bar textbox\b/);
    return match ? Number(match[1]) : null;
  }

  function micronBarTextboxColumnIndex(layer, sectionId) {
    const match = String(layer?.id || '').toLowerCase().match(new RegExp(`^${sectionId}_bar_percent_c(\\d+)_\\d+$`));
    return match ? Number(match[1]) - 1 : null;
  }

  function proConLayerKind(layer, sectionId) {
    const id = String(layer?.id || '').toLowerCase();
    if (id.match(new RegExp(`^${sectionId}_impact_\\d+$`))) return 'impact';
    if (id.match(new RegExp(`^${sectionId}_item_\\d+$`))) return 'item';
    const fingerprint = `${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    if (/bullet|bullet_point/.test(fingerprint)) return 'bullet';
    if (/badge|impact|label/.test(fingerprint)) return 'impact';
    if (fingerprint.includes(sectionId === 'pros' ? 'pro' : 'con')) return 'item';
    return null;
  }

  function introHookLayerKind(layer) {
    const id = String(layer?.id || '').toLowerCase();
    if (id === 'intro_food_hero') return 'food-hero';
    if (id === 'intro_ranked_glow') return 'ranked-glow';
    if (id === 'intro_ranked_sprite') return 'ranked-sprite';
    if (id.startsWith('intro_ranked_glimmer_')) return 'glimmer';
    return null;
  }

  function layerRevealClassification(layer, scene, persistent, allLayers = []) {
    const sectionId = scene?.id || '';
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    if (persistent) return { family: 'chrome', kind: 'persistent' };
    if (sectionId === 'intro') return { family: 'intro', kind: introHookLayerKind(layer) || (isSpriteLayer(layer) ? 'sprite' : 'text') };
    if (sectionId === 'outro') {
      if (isOutroFinalRevealStampLayer(layer) || String(layer?.id || '').toLowerCase() === 'outro_score_value' || /score|tier|verdict/.test(fingerprint)) {
        return { family: 'outro', kind: 'tier' };
      }
      return { family: 'outro', kind: isSpriteLayer(layer) ? 'frame' : 'summary' };
    }
    if (['fats', 'carbs', 'protein'].includes(sectionId)) {
      const rowIndex = macroRowIndex(layer);
      if (isMacroBarFrame(layer)) return { family: 'macro', kind: 'bar-frame' };
      if (isMacroIcon(layer)) return { family: 'macro', kind: 'icon' };
      if (macroTextKind(layer, sectionId) === 'macro-label') return { family: 'macro', kind: 'macro-label' };
      if (isMacroBarFill(layer)) {
        return {
          family: 'macro',
          kind: 'bar-fill',
          fillRatio: asNumber(layer?.fillRatio, null),
          src: layer?.src || null
        };
      }
      if (isMacroTotalText(layer, sectionId)) return { family: 'macro', kind: macroTextKind(layer, sectionId) };
      if (rowIndex != null) {
        return {
          family: 'macro',
          kind: macroTextKind(layer, sectionId) || (isMacroArrow(layer) ? 'arrow' : isMacroScoreCard(layer) ? 'score-card' : 'row'),
          rowIndex
        };
      }
      return { family: 'macro', kind: 'decor' };
    }
    if (sectionId === 'vitamins' || sectionId === 'minerals') {
      const columnIndex = micronColumnIndex(layer, sectionId, allLayers);
      if (isMicronTitleLayer(layer, sectionId) || (isMicronIconLayer(layer, sectionId) && (Number(layer?.y) || 0) < 70)) {
        return { family: 'micron', kind: 'title' };
      }
      if (columnIndex != null) {
        return {
          family: 'micron',
          kind: micronTextKind(layer, sectionId) || (isMicrosBar(layer) ? 'dv-bar' : isMicronBarLine(layer) ? 'bar-line' : isMicronIconLayer(layer, sectionId) ? 'icon' : 'column'),
          columnIndex,
          percent: isMicronBarTextboxLayer(layer, sectionId)
            ? micronBarTextboxPercent(layer, sectionId)
            : microsBarPercent(layer)
        };
      }
      return { family: 'micron', kind: isMicronBarLine(layer) ? 'bar-line' : 'decor' };
    }
    if (sectionId === 'pros' || sectionId === 'cons') {
      const rowIndex = proConRowIndex(layer, sectionId);
      if (rowIndex != null) {
        return { family: sectionId, kind: proConLayerKind(layer, sectionId) || 'item', rowIndex };
      }
      return { family: sectionId, kind: 'decor' };
    }
    return { family: 'generic', kind: isSpriteLayer(layer) ? 'sprite' : 'text' };
  }

  function distributedRevealDelay(order, count, segments, { start = 0.05, end = 0.82 } = {}) {
    if (segments[order]) return segments[order].start;
    if (count <= 1) return start;
    return clamp(start + ((order / Math.max(1, count - 1)) * (end - start)), start, end);
  }

  function micronTierRevealAnchor(scene, sectionId, step, graphAnchor, maxStepOverride = null) {
    const maxStep = Math.max(1, asNumber(maxStepOverride, null) ?? maxMicronStepForSection(sectionId));
    const safeStep = clamp(step || 1, 1, maxStep);
    return clamp(
      graphAnchor + ((MICRON_BAR_AFTER_GRAPH_SECONDS + ((safeStep - 1) * MICRON_BAR_STEP_SECONDS)) / sceneContentDuration(scene)),
      graphAnchor,
      0.94
    );
  }

  function micronValueRevealAnchor(scene, sectionId, step, graphAnchor, maxStepOverride = null) {
    const barAnchor = micronTierRevealAnchor(scene, sectionId, step, graphAnchor, maxStepOverride);
    return clamp(
      barAnchor + ((MICRON_BAR_STAMP_REVEAL_SECONDS + MICRON_VALUE_AFTER_BAR_SECONDS) / Math.max(1, sceneContentDuration(scene))),
      barAnchor,
      0.94
    );
  }

  function isMacroHeadRevealSchedule(schedule) {
    return schedule?.family === 'macro'
      && ['icon', 'bar-frame', 'bar-fill', 'macro-label'].includes(schedule?.kind);
  }

  function macroHeadRevealOpacity(scene, sceneProgress, revealSchedules = []) {
    const schedule = revealSchedules.find(isMacroHeadRevealSchedule);
    if (!schedule) return 1;
    const sceneDuration = Math.max(1, sceneContentDuration(scene));
    const revealWindow = Math.min(0.94, Math.max(0.001, MACRO_HEAD_REVEAL_SECONDS / sceneDuration));
    return clamp(easeOutCubic((sceneProgress - schedule.start) / revealWindow), 0, 1);
  }

  function introRankedSplitAudioAnchor(scene) {
    const audio = audioForFood(selectedFood());
    if (audio?.mode !== 'split-blocks') return null;
    const rankedStartSeconds = splitAudioBlockStartInSceneSeconds(
      audio,
      scene?.id || 'intro',
      block => String(block?.kind || '').toLowerCase() === 'hook_ranked'
    );
    if (rankedStartSeconds == null) return null;
    return clamp((rankedStartSeconds + INTRO_RANKED_WORD_LEAD_SECONDS) / sceneContentDuration(scene), 0.005, 0.94);
  }

  function outroTierRevealAnchor(scene, food = selectedFood(), timing = sceneTimingModel(scene)) {
    const tier = String(food?.episode?.tier || food?.expectedTier || '').trim();
    const segments = timing.sentences || sceneTimedSentences(scene);
    const tierStart = termStartForTiming(timing, [`${tier} tier`, tier, 'tier'].filter(Boolean))
      ?? segments[Math.max(0, segments.length - 1)]?.start
      ?? 0.72;
    return clamp(tierStart - (OUTRO_TIER_REVEAL_LEAD_SECONDS / Math.max(1, sceneContentDuration(scene))), 0.005, 0.94);
  }

  function revealAnchorForLayer(layer, scene, classification, timing, index = 0, allLayers = []) {
    const sectionId = scene?.id || '';
    const segments = timing.sentences || sceneTimedSentences(scene);
    const secondsAnchor = seconds => clamp(seconds / sceneContentDuration(scene), 0.005, 0.94);

    if (sectionId === 'intro') {
      const food = selectedFood();
      const foodName = String(food?.name || '').trim();
      const firstFoodWord = foodName.split(/\s+/).find(Boolean);
      const rankedAnchor = termStartForTiming(timing, ['ranked']) ?? 0.54;
      const splitRankedAnchor = introRankedSplitAudioAnchor(scene);
      if (classification.kind === 'food-hero') {
        return termStartForTiming(timing, [foodName, firstFoodWord, 'bacon'].filter(Boolean)) ?? 0.04;
      }
      if (classification.kind === 'ranked-glow') return splitRankedAnchor ?? rankedAnchor;
      if (classification.kind === 'ranked-sprite') return splitRankedAnchor ?? rankedAnchor;
      if (classification.kind === 'glimmer') return clamp((splitRankedAnchor ?? rankedAnchor) + (asNumber(layer?.sparkleDelay, 0) || 0), 0.02, 0.9);
      return termStartForTiming(timing, [foodName, 'ranked'].filter(Boolean))
        ?? distributedRevealDelay(index, 3, segments, { start: 0.05, end: 0.58 });
    }

    if (sectionId === 'outro' && classification.kind === 'tier') {
      return outroTierRevealAnchor(scene, selectedFood(), timing);
    }

    if (['fats', 'carbs', 'protein'].includes(sectionId)) {
      if (['icon', 'bar-frame', 'bar-fill', 'decor'].includes(classification.kind)) return secondsAnchor(MACRO_REVEAL_SECONDS);
      if (classification.kind === 'macro-label') return secondsAnchor(MACRO_REVEAL_SECONDS);
      if (classification.rowIndex != null || classification.kind === 'macro-value') {
        return secondsAnchor(macroSubmacroRevealDelaySeconds(sectionId));
      }
    }

    if (sectionId === 'vitamins' || sectionId === 'minerals') {
      const graphAnchor = secondsAnchor(MICRON_GRAPH_REVEAL_SECONDS);
      const visibleBarMaxStep = maxVisibleMicronBarStep(sectionId, allLayers);
      if (classification.kind === 'title') return graphAnchor;
      if (classification.kind === 'dv-bar') {
        const barStep = clamp(Math.round((asNumber(classification.percent, 10) || 10) / 10), 1, 10);
        return micronTierRevealAnchor(scene, sectionId, barStep, graphAnchor, visibleBarMaxStep);
      }
      if (classification.kind === 'label') {
        return graphAnchor;
      }
      if (classification.kind === 'icon') {
        return graphAnchor;
      }
      if (classification.kind === 'value') {
        const textBarStep = clamp(Math.round((asNumber(classification.percent, 0) || 0) / 10), 0, 10);
        const valueStep = textBarStep || micronStepForColumn(sectionId, classification.columnIndex) || 1;
        return micronValueRevealAnchor(
          scene,
          sectionId,
          valueStep,
          graphAnchor,
          Math.max(visibleBarMaxStep, valueStep)
        );
      }
      return graphAnchor;
    }

    if (sectionId === 'pros' || sectionId === 'cons') {
      const rowIndex = classification.rowIndex;
      if (rowIndex != null) {
        return secondsAnchor(PRO_CON_ROW_REVEAL_SECONDS + (rowIndex * PRO_CON_ROW_STEP_SECONDS));
      }
    }

    const row = clamp(((Number(layer?.y) || 0) - 42) / 120, 0, 1);
    return 0.08 + (row * 0.48) + ((index % 3) * 0.025);
  }

  function layerRevealSchedule(layer, scene, index, persistent, allLayers = []) {
    const timing = sceneTimingModel(scene);
    const classification = layerRevealClassification(layer, scene, persistent, allLayers);
    let anchor = persistent ? 0 : revealAnchorForLayer(layer, scene, classification, timing, index, allLayers);
    let offset = 0;

    if (classification.family === 'intro') {
      offset = ['food-hero', 'ranked-glow', 'ranked-sprite', 'glimmer'].includes(classification.kind) ? 0 : Math.min(0.12, index * 0.025);
    }
    if (classification.family === 'macro') {
      offset = 0;
    }
    if (classification.family === 'micron') {
      offset = 0;
    }
    if (classification.family === 'pros' || classification.family === 'cons') {
      offset = 0;
    }
    if (classification.family === 'outro') {
      if (classification.kind === 'frame') offset = -0.08;
      if (classification.kind === 'tier') offset = 0;
    }

    const minimumDelay = !persistent && ['macro', 'micron', 'pros', 'cons'].includes(classification.family) ? 0.005 : 0.015;
    const delay = clamp((anchor ?? 0.08) + offset, persistent ? 0 : minimumDelay, 0.94);
    return {
      layerId: layer?.id || null,
      label: layer?.label || null,
      src: layer?.src || null,
      family: classification.family,
      kind: classification.kind,
      rowIndex: classification.rowIndex ?? null,
      columnIndex: classification.columnIndex ?? null,
      fillRatio: classification.fillRatio ?? null,
      start: delay,
      startSeconds: Number((delay * Math.max(1, sceneContentDuration(scene))).toFixed(3))
    };
  }

  function audioRevealDelayForLayer(layer, scene, index, persistent, allLayers = []) {
    return layerRevealSchedule(layer, scene, index, persistent, allLayers).start;
  }

  function layerGridBox(layer) {
    let layerX = Number(layer?.x) || 0;
    let layerY = Number(layer?.y) || 0;
    const layerWidth = Number(layer?.width) || 0;
    const layerHeight = Number(layer?.height) || 0;
    if (layer?.centerAnchor === 'visible-canvas') {
      const visible = visibleCanvasGridBounds();
      layerX = ((visible.left + visible.right) / 2) - (layerWidth / 2) + (Number(layer.centerOffsetX) || 0);
      layerY = ((visible.top + visible.bottom) / 2) - (layerHeight / 2) + (Number(layer.centerOffsetY) || 0);
    }
    return {
      left: layerX,
      top: layerY,
      right: layerX + layerWidth,
      bottom: layerY + layerHeight
    };
  }

  function boxesOverlap(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  function appendMicron100Fireworks(container, scene, layers, sceneElapsed) {
    const sectionId = scene?.id || '';
    if (sectionId !== 'vitamins' && sectionId !== 'minerals') return;
    if (maxMicronStepForSection(sectionId) < 10) return;

    layers.forEach(({ layer, persistent }) => {
      if (persistent || layer?.visible === false || !isMicrosBar(layer)) return;
      if (asNumber(microsBarPercent(layer), 0) < 100) return;

      const burstStartSeconds = MICRON_GRAPH_REVEAL_SECONDS + MICRON_BAR_AFTER_GRAPH_SECONDS + (9 * MICRON_BAR_STEP_SECONDS);
      const burstElapsed = sceneElapsed - burstStartSeconds;
      if (burstElapsed < 0 || burstElapsed > MICRON_100_FIREWORK_SECONDS) return;

      const progress = clamp(burstElapsed / MICRON_100_FIREWORK_SECONDS, 0, 1);
      const box = layerGridBox(layer);
      const centerX = (box.left + box.right) / 2;
      const centerY = box.top + 1.2;
      const fade = Math.sin(progress * Math.PI);
      const ringScale = easeOutCubic(progress);
      const zIndex = Math.max((Number(layer.z) || 0) + 50, 140);

      const core = document.createElement('div');
      core.className = 'micron-100-firework-core';
      core.style.left = `calc(${centerX.toFixed(2)}px * var(--pixel-unit))`;
      core.style.top = `calc(${centerY.toFixed(2)}px * var(--pixel-unit))`;
      core.style.width = `calc(${(0.9 + ((1 - progress) * 0.45)).toFixed(2)}px * var(--pixel-unit))`;
      core.style.height = core.style.width;
      core.style.zIndex = String(zIndex + MICRON_100_FIREWORK_SPARKS.length + 1);
      core.style.opacity = String(clamp((1 - progress) * 0.42, 0, 0.42).toFixed(3));
      core.style.transform = `translate3d(-50%, -50%, 0) scale(${(1 + (ringScale * 0.18)).toFixed(3)})`;
      container.appendChild(core);

      MICRON_100_FIREWORK_SPARKS.forEach((spark, sparkIndex) => {
        const node = document.createElement('div');
        const twinkle = sparkIndex % 2 === 0 ? Math.sin(progress * Math.PI * 5) * 0.65 : Math.cos(progress * Math.PI * 4) * 0.55;
        const driftX = spark.x * (0.22 + (ringScale * 1.05));
        const driftY = spark.y * (0.22 + (ringScale * 1.05)) + (progress * progress * 2.6);
        const size = 1.55 + (sparkIndex % 3 === 0 && progress < 0.5 ? 0.65 : 0);
        node.className = 'micron-100-firework-spark';
        node.style.left = `calc(${(centerX + driftX).toFixed(2)}px * var(--pixel-unit))`;
        node.style.top = `calc(${(centerY + driftY).toFixed(2)}px * var(--pixel-unit))`;
        node.style.width = `calc(${size.toFixed(2)}px * var(--pixel-unit))`;
        node.style.height = `calc(${size.toFixed(2)}px * var(--pixel-unit))`;
        node.style.zIndex = String(zIndex + sparkIndex);
        node.style.opacity = String(clamp((fade * 1.18) + (twinkle * 0.12), 0, 1).toFixed(3));
        node.style.background = spark.color;
        node.style.transform = `translate3d(-50%, -50%, 0) scale(${(1.24 - (progress * 0.34)).toFixed(3)})`;
        container.appendChild(node);
      });
    });
  }

  function majorContextRows(scene, layers, sectionId) {
    if (scene?.id !== sectionId) return [];
    const items = selectedFood()?.contextItems?.[sectionId] || [];
    return items
      .map((item, rowIndex) => ({ item, rowIndex }))
      .filter(({ item, rowIndex }) => rowIndex < 3 && String(item?.impactLevel || '').toLowerCase() === 'major')
      .map(({ rowIndex }) => {
        const allLayers = layers.map(item => item.layer);
        const rowLayers = layers
          .filter(({ layer, persistent }) => !persistent && layer?.visible !== false)
          .map(({ layer }) => ({ layer, classification: layerRevealClassification(layer, scene, false, allLayers) }))
          .filter(item => item.classification.family === sectionId && item.classification.rowIndex === rowIndex);
        const boxes = rowLayers.map(({ layer }) => layerGridBox(layer));
        if (!boxes.length) return null;
        const rowBox = boxes.reduce((box, item) => ({
          left: Math.min(box.left, item.left),
          top: Math.min(box.top, item.top),
          right: Math.max(box.right, item.right),
          bottom: Math.max(box.bottom, item.bottom)
        }), boxes[0]);
        const itemTextZ = rowLayers
          .filter(item => item.classification.kind === 'item' && item.layer.kind === 'text')
          .map(item => asNumber(item.layer.z, null))
          .filter(value => value != null);
        const effectZIndex = Math.max(0, (itemTextZ.length ? Math.min(...itemTextZ) : 11) - 1);
        return { rowIndex, rowBox, effectZIndex };
      })
      .filter(Boolean);
  }

  function appendMajorProSparkles(container, scene, layers, sceneElapsed, sceneProgress, proConHighlightMap) {
    for (const row of majorContextRows(scene, layers, 'pros')) {
      const activeHighlight = proConHighlightMap?.get(row.rowIndex);
      const activeStrength = clamp(asNumber(activeHighlight?.cueStrength ?? activeHighlight?.strength, 0), 0, 1);
      if (activeStrength <= 0.015) continue;

      const phase = (sceneElapsed * 1.55 + (row.rowIndex * 0.21)) % 1;
      const rowHeight = Math.max(1, row.rowBox.bottom - row.rowBox.top);
      const rowWidth = Math.max(1, row.rowBox.right - row.rowBox.left);
      const spreadLeft = Math.min(8, rowWidth * 0.12);
      const spreadRight = Math.min(12, rowWidth * 0.18);
      const spreadTop = Math.min(6, rowHeight * 0.7);
      const spreadBottom = Math.min(7, rowHeight * 0.85);
      const sparkleLeft = row.rowBox.left - spreadLeft;
      const sparkleTop = row.rowBox.top - spreadTop;
      const sparkleWidth = rowWidth + spreadLeft + spreadRight;
      const sparkleHeight = rowHeight + spreadTop + spreadBottom;
      const zIndex = row.effectZIndex;

      MAJOR_PRO_SPARKLES.forEach((spark, sparkIndex) => {
        const seed = seededHash(`major-pro-sparkle:${row.rowIndex}:${sparkIndex}`);
        const xRatio = clamp((sparkIndex + 0.35 + (seededUnit(seed) * 0.42)) / MAJOR_PRO_SPARKLES.length, 0.02, 0.98);
        const yRatio = 0.08 + (seededUnit(seed + 11) * 0.84);
        const twinklePhase = (phase + spark.delay + (sparkIndex * 0.073)) % 1;
        const twinkle = 0.7 + (Math.sin((twinklePhase * Math.PI * 2) + sparkIndex) * 0.3);
        const driftX = Math.sin((sceneProgress * Math.PI * 10) + seed) * 1.45 + (spark.x * 0.12);
        const driftY = Math.cos((sceneProgress * Math.PI * 8) + seed) * 0.95 + (spark.y * 0.08);
        const size = spark.size + (activeStrength * 0.76) + (twinkle * 0.55);
        const node = document.createElement('div');
        node.className = 'major-pro-sparkle';
        node.style.left = `calc(${(sparkleLeft + (sparkleWidth * xRatio) + driftX).toFixed(2)}px * var(--pixel-unit))`;
        node.style.top = `calc(${(sparkleTop + (sparkleHeight * yRatio) + driftY).toFixed(2)}px * var(--pixel-unit))`;
        node.style.width = `calc(${size.toFixed(2)}px * var(--pixel-unit))`;
        node.style.height = `calc(${size.toFixed(2)}px * var(--pixel-unit))`;
        node.style.zIndex = String(zIndex);
        node.style.opacity = String(clamp(activeStrength * twinkle, 0, 1).toFixed(3));
        node.style.background = spark.color;
        node.style.transform = `translate3d(-50%, -50%, 0) rotate(${sparkIndex % 2 ? 45 : 0}deg) scale(${(0.92 + (activeStrength * 0.18)).toFixed(3)})`;
        container.appendChild(node);
      });
    }
  }

  function appendMajorConSirenVfx(container, scene, layers, sceneElapsed, sceneProgress, proConHighlightMap) {
    for (const row of majorContextRows(scene, layers, 'cons')) {
      const activeHighlight = proConHighlightMap?.get(row.rowIndex);
      const activeStrength = clamp(asNumber(activeHighlight?.cueStrength ?? activeHighlight?.strength, 0), 0, 1);
      if (activeStrength <= 0.015) continue;

      const rowHeight = Math.max(1, row.rowBox.bottom - row.rowBox.top);
      const rowWidth = Math.max(1, row.rowBox.right - row.rowBox.left);
      const spreadLeft = Math.min(7, rowWidth * 0.11);
      const spreadRight = Math.min(11, rowWidth * 0.17);
      const spreadTop = Math.min(5, rowHeight * 0.6);
      const spreadBottom = Math.min(6, rowHeight * 0.7);
      const sirenLeft = row.rowBox.left - spreadLeft;
      const sirenTop = row.rowBox.top - spreadTop;
      const sirenWidth = rowWidth + spreadLeft + spreadRight;
      const sirenHeight = rowHeight + spreadTop + spreadBottom;
      const zIndex = row.effectZIndex;
      const phase = (sceneElapsed * 3.8 + (row.rowIndex * 0.27)) % 1;

      MAJOR_CON_SIREN_BEAMS.forEach((beam, beamIndex) => {
        const beamPhase = (phase + beam.delay) % 1;
        const warmPulse = 0.5 + (Math.sin((beamPhase * Math.PI * 2) + beamIndex) * 0.5);
        const coreAlpha = (0.58 + (activeStrength * 0.26)).toFixed(3);
        const midAlpha = (0.46 + (warmPulse * 0.22)).toFixed(3);
        const edgeAlpha = (0.20 + (activeStrength * 0.12)).toFixed(3);
        const node = document.createElement('div');
        node.className = 'major-con-siren-beam';
        node.style.left = `calc(${(sirenLeft + (sirenWidth * (0.18 + (beamPhase * 0.64)))).toFixed(2)}px * var(--pixel-unit))`;
        node.style.top = `calc(${(sirenTop + (sirenHeight * beam.y) + (Math.sin((sceneProgress * Math.PI * 12) + beamIndex) * 0.9)).toFixed(2)}px * var(--pixel-unit))`;
        node.style.width = `calc(${(sirenWidth * beam.width).toFixed(2)}px * var(--pixel-unit))`;
        node.style.height = `calc(${(beam.height + (activeStrength * 0.8)).toFixed(2)}px * var(--pixel-unit))`;
        node.style.zIndex = String(zIndex);
        node.style.opacity = String(clamp(activeStrength * (0.60 + (Math.sin(beamPhase * Math.PI) * 0.35)), 0, 0.96).toFixed(3));
        node.style.background = `radial-gradient(ellipse at 50% 50%, rgba(255, 246, 220, ${coreAlpha}) 0%, rgba(255, 124, 92, ${midAlpha}) 28%, rgba(255, 54, 64, ${edgeAlpha}) 58%, rgba(255, 34, 52, 0.10) 78%, rgba(255, 34, 52, 0) 100%)`;
        node.style.transform = `translate3d(-50%, -50%, 0) skewX(-18deg) scaleX(${(0.82 + (activeStrength * 0.28)).toFixed(3)})`;
        container.appendChild(node);
      });
    }
  }

  function shouldRevealStackedMacroSpriteOpaque(layer, revealSchedule, sortedLayers = []) {
    if (revealSchedule?.family !== 'macro' || !isSpriteLayer(layer)) return false;
    const layerIndex = sortedLayers.indexOf(layer);
    if (layerIndex <= 0) return false;
    const box = layerGridBox(layer);
    if (box.right <= box.left || box.bottom <= box.top) return false;
    return sortedLayers.slice(0, layerIndex).some(other => {
      if (other?.visible === false || !isSpriteLayer(other)) return false;
      const otherBox = layerGridBox(other);
      return otherBox.right > otherBox.left && otherBox.bottom > otherBox.top && boxesOverlap(box, otherBox);
    });
  }

  function applyLayerBox(node, layer) {
    let layerX = Number(layer.x) || 0;
    let layerY = Number(layer.y) || 0;
    const sectionIndicator = layer.kind === 'sprite' && isSectionIndicator(layer);
    const seamBleed = sectionIndicator ? SECTION_INDICATOR_RENDER_SEAM_BLEED_PX : 0;
    const halfSeamBleed = seamBleed / 2;
    if (layer.centerAnchor === 'visible-canvas') {
      const visible = visibleCanvasGridBounds();
      const layerWidth = Number(layer.width) || 0;
      const layerHeight = Number(layer.height) || 0;
      layerX = ((visible.left + visible.right) / 2) - (layerWidth / 2) + (Number(layer.centerOffsetX) || 0);
      layerY = ((visible.top + visible.bottom) / 2) - (layerHeight / 2) + (Number(layer.centerOffsetY) || 0);
    }
    node.style.left = `calc(${layerX}px * var(--pixel-unit)${halfSeamBleed ? ` - ${halfSeamBleed}px` : ''})`;
    node.style.top = `calc(${layerY}px * var(--pixel-unit)${halfSeamBleed ? ` - ${halfSeamBleed}px` : ''})`;
    if (layer.width) node.style.width = `calc(${Number(layer.width)}px * var(--pixel-unit)${seamBleed ? ` + ${seamBleed}px` : ''})`;
    if (layer.kind === 'sprite') {
      if (layer.height) node.style.height = `calc(${Number(layer.height)}px * var(--pixel-unit)${seamBleed ? ` + ${seamBleed}px` : ''})`;
      node.style.objectFit = layer.preserveAspect ? 'contain' : 'fill';
      if (layer.preserveAspect && layer.aspectRatio) node.style.aspectRatio = String(layer.aspectRatio);
    }
  }

  function spriteLayerRotation(layer) {
    if (layer?.kind !== 'sprite') return 0;
    const rotation = Number(layer.rotation ?? layer.rotate ?? 0);
    return Number.isFinite(rotation) ? rotation : 0;
  }

  function spriteLayerStaticTransform(layer) {
    const transforms = [];
    const rotation = spriteLayerRotation(layer);
    if (rotation) transforms.push(`rotate(${rotation}deg)`);
    if (layer?.flipY) transforms.push('scaleY(-1)');
    return transforms.join(' ');
  }

  function prewarmMacroBarGifVariants(layout, food) {
    if (!layout) return;
    for (const sectionId of ['fats', 'carbs', 'protein']) {
      for (const layer of getSectionLayers(layout, sectionId)) {
        if (!isMacroBarFill(layer)) continue;
        requestMacroBarGifFrames(spritePath(layer.src));
      }
    }
  }

  function drawMacroBarFillCanvas(canvas, layer, sceneElapsed, revealSchedule) {
    const src = spritePath(layer.src);
    const targetRatio = clamp(asNumber(layer?.fillRatio, revealSchedule?.fillRatio ?? 0), 0, 1);
    const frames = requestMacroBarGifFrames(src);
    const width = frames?.width || 104;
    const height = frames?.height || 17;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    canvas.style.imageRendering = 'pixelated';

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    if (!frames?.images?.length || targetRatio <= 0.001) return;

    const localElapsed = Math.max(0, Number(sceneElapsed) || 0);
    const fillElapsed = localElapsed - MACRO_REVEAL_SECONDS - MACRO_BAR_START_DWELL_SECONDS;
    const currentFillRatio = macroBarFillCurrentRatio(fillElapsed, targetRatio);
    if (frames.static) {
      const image = frames.images[0];
      if (!image?.complete) return;
      const fillWidth = clamp(Math.round(width * currentFillRatio), 0, width);
      if (fillWidth <= 0) return;
      ctx.drawImage(image, 0, 0, fillWidth, height, 0, 0, fillWidth, height);
      return;
    }
    const targetIndex = clamp(Math.round((frames.images.length - 1) * targetRatio), 0, frames.images.length - 1);
    const currentIndex = clamp(Math.round((frames.images.length - 1) * currentFillRatio), 0, targetIndex);
    for (let frameIndex = 0; frameIndex <= currentIndex; frameIndex += 1) {
      const image = frames.images[frameIndex];
      if (image?.complete) ctx.drawImage(image, 0, 0);
    }
  }

  function macroBarGifSource(src) {
    const cached = MACRO_BAR_GIF_SOURCE_CACHE.get(src);
    if (cached) return cached;
    const promise = fetch(src)
      .then(response => {
        if (!response.ok) throw new Error(`GIF fetch failed: ${response.status}`);
        return response.arrayBuffer();
      })
      .then(buffer => parseGifBytes(new Uint8Array(buffer)));
    MACRO_BAR_GIF_SOURCE_CACHE.set(src, promise);
    return promise;
  }

  function parseGifBytes(bytes) {
    const signature = String.fromCharCode(...bytes.slice(0, 6));
    if (!/^GIF8[79]a$/.test(signature)) throw new Error('Unsupported GIF signature');

    const packed = bytes[10];
    const width = bytes[6] | (bytes[7] << 8);
    const height = bytes[8] | (bytes[9] << 8);
    const globalColorTableSize = packed & 0x80 ? 3 * (1 << ((packed & 0x07) + 1)) : 0;
    let pos = 13 + globalColorTableSize;
    const leadParts = [bytes.slice(0, pos)];
    const frames = [];
    let pendingGce = null;
    let sawFrame = false;

    while (pos < bytes.length) {
      const marker = bytes[pos];
      if (marker === 0x3b) break;
      if (marker === 0x21) {
        const label = bytes[pos + 1];
        const end = skipGifSubBlocks(bytes, pos + 2);
        const block = bytes.slice(pos, end);
        if (label === 0xf9) {
          pendingGce = block;
        } else if (!sawFrame) {
          leadParts.push(block);
        }
        pos = end;
        continue;
      }
      if (marker === 0x2c) {
        const imageStart = pos;
        const imagePacked = bytes[pos + 9];
        pos += 10;
        if (imagePacked & 0x80) pos += 3 * (1 << ((imagePacked & 0x07) + 1));
        pos += 1;
        pos = skipGifSubBlocks(bytes, pos);
        frames.push({ gce: pendingGce, image: bytes.slice(imageStart, pos) });
        pendingGce = null;
        sawFrame = true;
        continue;
      }
      throw new Error(`Unsupported GIF block 0x${marker.toString(16)}`);
    }

    if (!frames.length) throw new Error('GIF has no frames');
    const nativeSeconds = frames.reduce((sum, frame) => sum + gifFrameDelayCentiseconds(frame.gce), 0) / 100;
    return { leadParts, frames, width, height, nativeSeconds };
  }

  function gifFrameDelayCentiseconds(gce) {
    if (!gce || gce.length < 8) return 10;
    const delay = gce[4] | (gce[5] << 8);
    return delay > 0 ? delay : 10;
  }

  function skipGifSubBlocks(bytes, pos) {
    let cursor = pos;
    while (cursor < bytes.length) {
      const size = bytes[cursor];
      cursor += 1;
      if (size === 0) break;
      cursor += size;
    }
    return cursor;
  }

  function requestMacroBarGifFrames(src) {
    const cached = MACRO_BAR_GIF_FRAME_CACHE.get(src);
    if (cached?.status === 'ready') return cached;
    if (cached?.status === 'pending') return cached;

    const entry = { status: 'pending', width: 104, height: 17, images: [] };
    MACRO_BAR_GIF_FRAME_CACHE.set(src, entry);
    if (!/\.gif(?:[?#]|$)/i.test(src)) {
      entry.static = true;
      const image = new Image();
      image.decoding = 'sync';
      image.onload = () => {
        entry.width = image.naturalWidth || entry.width;
        entry.height = image.naturalHeight || entry.height;
        entry.images = [image];
        entry.status = 'ready';
        if (state.layout) window.requestAnimationFrame(renderStage);
      };
      image.onerror = error => {
        entry.status = 'error';
        entry.error = error;
      };
      image.src = src;
      return entry;
    }
    macroBarGifSource(src)
      .then(parsed => {
        entry.width = parsed.width || entry.width;
        entry.height = parsed.height || entry.height;
        entry.nativeSeconds = asNumber(parsed.nativeSeconds, null) || MACRO_BAR_GIF_NATIVE_SECONDS;
        entry.images = parsed.frames.map((frame, index) => {
          const image = new Image();
          image.decoding = 'sync';
          image.onload = () => {
            if (state.layout) window.requestAnimationFrame(renderStage);
          };
          image.src = URL.createObjectURL(new Blob([buildSingleMacroBarFrameGifBytes(parsed, index)], { type: 'image/gif' }));
          return image;
        });
        entry.status = 'ready';
        window.requestAnimationFrame(() => {
          if (state.layout) renderStage();
        });
      })
      .catch(error => {
        entry.status = 'error';
        entry.error = error;
      });
    return entry;
  }

  function buildSingleMacroBarFrameGifBytes(parsed, frameIndex) {
    const frame = parsed.frames[frameIndex];
    const parts = [...parsed.leadParts, gifGraphicControlWithDelay(frame.gce, 100), frame.image, Uint8Array.of(0x3b)];
    return concatBytes(parts);
  }

  function gifGraphicControlWithDelay(gce, delayCs) {
    const safeDelay = clamp(Math.round(delayCs), 1, MACRO_BAR_GIF_FINAL_HOLD_CENTISECONDS);
    const out = gce && gce.length >= 8
      ? new Uint8Array(gce)
      : new Uint8Array([0x21, 0xf9, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00]);
    out[4] = safeDelay & 0xff;
    out[5] = (safeDelay >> 8) & 0xff;
    return out;
  }

  function concatBytes(parts) {
    const total = parts.reduce((sum, part) => sum + part.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    parts.forEach(part => {
      out.set(part, offset);
      offset += part.length;
    });
    return out;
  }

  function layerRevealDelay(layer, index) {
    const fingerprint = `${layer.id || ''} ${layer.label || ''} ${layer.src || ''}`.toLowerCase();
    if (fingerprint.includes('header') || ['food_name_text', 'kcal_value_text', 'basis_text', 'script_caption', 'subline_c', 'kcal_label_text'].includes(layer.id)) return 0.02;
    if (fingerprint.includes('section indicator') || fingerprint.includes('/ui/section_indicator/')) return 0.08;
    const row = clamp(((Number(layer.y) || 0) - 42) / 120, 0, 1);
    return 0.12 + (row * 0.42) + ((index % 4) * 0.035);
  }

  function isStampRevealSchedule(schedule) {
    if (!schedule) return false;
    if (schedule.family === 'intro' && ['food-hero', 'ranked-sprite'].includes(schedule.kind)) return true;
    return schedule.family === 'outro' && schedule.kind === 'tier' && OUTRO_FINAL_REVEAL_STAMP_IDS.has(String(schedule.layerId || '').toLowerCase());
  }

  function stampRevealSecondsForSchedule(schedule = null) {
    if (schedule?.family === 'intro' && schedule?.kind === 'food-hero') return FOOD_STAMP_REVEAL_SECONDS;
    if (schedule?.family === 'outro' && schedule?.kind === 'tier') return OUTRO_TIER_STAMP_REVEAL_SECONDS;
    return STAMP_REVEAL_SECONDS;
  }

  function stampRevealWindowProgress(scene, schedule = null) {
    const sceneDuration = Math.max(1, sceneContentDuration(scene));
    const revealSeconds = stampRevealSecondsForSchedule(schedule);
    const minimumProgress = schedule?.family === 'outro' && schedule?.kind === 'tier' ? 0.001 : 0.055;
    return Math.min(0.2, Math.max(minimumProgress, revealSeconds / sceneDuration));
  }

  function stampRevealRawProgress(scene, sceneProgress, schedule) {
    const sceneDuration = Math.max(1, sceneContentDuration(scene));
    const revealLead = Math.min(0.035, AUDIO_REVEAL_LEAD_SECONDS / sceneDuration);
    return (sceneProgress + revealLead - schedule.start) / stampRevealWindowProgress(scene, schedule);
  }

  function stampShakeStyle(scene, sceneProgress, revealSchedules) {
    const sceneDuration = Math.max(1, sceneContentDuration(scene));
    let strongest = 0;
    for (const schedule of revealSchedules) {
      if (!isStampRevealSchedule(schedule)) continue;
      const raw = stampRevealRawProgress(scene, sceneProgress, schedule);
      const afterStampProgress = raw - 1;
      if (afterStampProgress < 0 || afterStampProgress > 0.55) continue;
      const hit = Math.sin(clamp(afterStampProgress / 0.55, 0, 1) * Math.PI);
      const snap = Math.max(0, 1 - (afterStampProgress / 0.55));
      strongest = Math.max(strongest, hit * (0.62 + snap * 0.38));
    }
    if (strongest <= 0.015) return { transform: '', strength: 0 };

    const phase = sceneProgress * sceneDuration * 28;
    const x = (Math.sin(phase * Math.PI * 2) + (Math.sin(phase * Math.PI * 5.4) * 0.45)) * STAMP_SHAKE_MAX_PIXELS * strongest;
    const y = (Math.cos(phase * Math.PI * 2.3) + (Math.sin(phase * Math.PI * 4.2) * 0.35)) * STAMP_SHAKE_MAX_PIXELS * 0.72 * strongest;
    const rotate = Math.sin(phase * Math.PI * 3.6) * 0.34 * strongest;
    return {
      transform: `translate3d(calc(${x.toFixed(2)}px * var(--pixel-unit)), calc(${y.toFixed(2)}px * var(--pixel-unit)), 0) rotate(${rotate.toFixed(2)}deg)`,
      strength: strongest
    };
  }

  function applyStageShake(roots, scene, sceneProgress, revealSchedules) {
    const shake = stampShakeStyle(scene, sceneProgress, revealSchedules);
    [roots.bg, roots.phoneBg, roots.layerRoot, roots.vignette, roots.caption].forEach(node => {
      if (!node) return;
      node.style.transformOrigin = 'center';
      node.style.transform = shake.transform;
    });
    roots.layerRoot.dataset.stampShakeStrength = shake.strength.toFixed(3);
  }

  function stampSfxImpactTimeWithLead(scene, schedule, leadSeconds) {
    const sceneDuration = Math.max(1, sceneContentDuration(scene));
    const revealLead = Math.min(0.035, AUDIO_REVEAL_LEAD_SECONDS / sceneDuration);
    const impactProgress = clamp(schedule.start + stampRevealWindowProgress(scene, schedule) - revealLead, 0, 1);
    const impactTime = scene.start + (impactProgress * sceneContentDuration(scene));
    return Number(Math.max(scene.start, impactTime - leadSeconds).toFixed(3));
  }

  function stampSfxImpactTime(scene, schedule) {
    const path = stampSfxPath();
    if (schedule?.family === 'intro' && schedule?.kind === 'food-hero') {
      return Number((scene.start - stampSfxIntroLeadSeconds(path)).toFixed(3));
    }
    return stampSfxImpactTimeWithLead(scene, schedule, stampSfxLeadSeconds(path));
  }

  function sTierStampSfxImpactTime(scene, schedule) {
    const sceneDuration = Math.max(1, sceneContentDuration(scene));
    const revealLead = Math.min(0.035, AUDIO_REVEAL_LEAD_SECONDS / sceneDuration);
    const impactProgress = clamp(schedule.start + stampRevealWindowProgress(scene, schedule) - revealLead, 0, 1);
    const impactTime = scene.start + (impactProgress * sceneContentDuration(scene));
    return Number(Math.max(scene.start, impactTime - sTierStampSfxLeadSeconds()).toFixed(3));
  }

  function dTierGameLoseSfxImpactTime(scene, schedule) {
    return stampSfxImpactTimeWithLead(scene, schedule, dTierGameLoseSfxLeadSeconds());
  }

  function isSpecialOutroTierStampSfxSchedule(schedule) {
    if (schedule?.family !== 'outro' || schedule?.kind !== 'tier') return false;
    const tier = outroTierForFood(selectedFood());
    return tier === 'S' || tier === 'D';
  }

  function stampSfxEvents() {
    const events = new Map();
    sceneStarts().forEach(scene => {
      sceneLayerRevealSchedule(scene)
        .filter(isStampRevealSchedule)
        .filter(schedule => !isSpecialOutroTierStampSfxSchedule(schedule))
        .forEach(schedule => {
          const groupedLayerId = schedule.family === 'outro' && schedule.kind === 'tier'
            ? 'outro_final_reveal_stamps'
            : schedule.layerId || schedule.kind;
          const key = `${scene.id}:${groupedLayerId}:${schedule.start.toFixed(3)}`;
          if (events.has(key)) return;
          events.set(key, {
            key,
            sceneId: scene.id,
            layerId: groupedLayerId,
            kind: schedule.kind,
            time: stampSfxImpactTime(scene, schedule)
          });
        });
    });
    return [...events.values()].sort((a, b) => a.time - b.time || a.key.localeCompare(b.key));
  }

  function isSTierStampSfxSchedule(schedule) {
    if (outroTierForFood(selectedFood()) !== 'S') return false;
    if (schedule?.family !== 'outro' || schedule?.kind !== 'tier') return false;
    const id = String(schedule?.layerId || '').toLowerCase();
    if (id !== OUTRO_TIER_STAMP_ID && id !== OUTRO_TIER_STAMP_LEGACY_ID) return false;
    return /(?:^|\/)S_tier\.png$/i.test(String(schedule?.src || ''));
  }

  function isDTierStampSfxSchedule(schedule) {
    if (outroTierForFood(selectedFood()) !== 'D') return false;
    if (schedule?.family !== 'outro' || schedule?.kind !== 'tier') return false;
    const id = String(schedule?.layerId || '').toLowerCase();
    if (id !== OUTRO_TIER_STAMP_ID && id !== OUTRO_TIER_STAMP_LEGACY_ID) return false;
    return /(?:^|\/)D_tier\.png$/i.test(String(schedule?.src || ''));
  }

  function sTierStampSfxEvents() {
    const events = new Map();
    sceneStarts().forEach(scene => {
      sceneLayerRevealSchedule(scene)
        .filter(isSTierStampSfxSchedule)
        .forEach(schedule => {
          const key = `${scene.id}:s-tier-stamp:${schedule.start.toFixed(3)}`;
          if (events.has(key)) return;
          events.set(key, {
            key,
            sceneId: scene.id,
            layerId: schedule.layerId || OUTRO_TIER_STAMP_ID,
            kind: 's-tier-stamp',
            time: sTierStampSfxImpactTime(scene, schedule)
          });
        });
    });
    return [...events.values()].sort((a, b) => a.time - b.time || a.key.localeCompare(b.key));
  }

  function dTierStampSfxEvents() {
    const events = new Map();
    const food = selectedFood();
    sceneStarts().forEach(scene => {
      sceneLayerRevealSchedule(scene)
        .filter(isDTierStampSfxSchedule)
        .forEach(schedule => {
          const impactTime = dTierGameLoseSfxImpactTime(scene, schedule);
          const gameLoseKey = `${scene.id}:d-tier-game-lose:${schedule.start.toFixed(3)}`;
          if (!events.has(gameLoseKey)) {
            events.set(gameLoseKey, {
              key: gameLoseKey,
              sceneId: scene.id,
              layerId: schedule.layerId || OUTRO_TIER_STAMP_ID,
              kind: 'd-tier-game-lose',
              time: impactTime
            });
          }
        });
    });
    if (!events.size && outroTierForFood(food) === 'D') {
      const scene = sceneStarts().find(item => item.id === 'outro');
      if (scene) {
        const schedule = {
          family: 'outro',
          kind: 'tier',
          layerId: OUTRO_TIER_STAMP_ID,
          start: outroTierRevealAnchor(scene, food)
        };
        events.set(`${scene.id}:d-tier-game-lose:fallback`, {
          key: `${scene.id}:d-tier-game-lose:fallback`,
          sceneId: scene.id,
          layerId: OUTRO_TIER_STAMP_ID,
          kind: 'd-tier-game-lose',
          time: dTierGameLoseSfxImpactTime(scene, schedule)
        });
      }
    }
    return [...events.values()].sort((a, b) => a.time - b.time || a.key.localeCompare(b.key));
  }

  function ensureStampSfxAudioPool() {
    const path = stampSfxPath();
    if (state.stampSfxPath && state.stampSfxPath !== path) {
      pauseStampSfx();
      state.stampSfxPool = [];
      state.stampSfxPoolIndex = 0;
      state.stampSfxBuffer = null;
      state.stampSfxBufferPath = '';
      state.stampSfxBufferPromise = null;
    }
    if (!state.stampSfxPool.length) {
      state.stampSfxPool = Array.from({ length: STAMP_SFX_POOL_SIZE }, () => {
        const audio = new Audio(docsAssetPath(path));
        audio.preload = 'auto';
        audio.volume = Math.min(stampSfxVolume(path), 1);
        return audio;
      });
      state.stampSfxPath = path;
    }
    return state.stampSfxPool;
  }

  function nextStampSfxAudio() {
    ensureStampSfxAudioPool();
    const audio = state.stampSfxPool[state.stampSfxPoolIndex % state.stampSfxPool.length];
    state.stampSfxPoolIndex += 1;
    return audio;
  }

  function stampSfxSettings(path = stampSfxPath()) {
    return sfxAssetRoleSettings('stampImpact', path) || {};
  }

  function stampSfxPlaybackRateRange(path = stampSfxPath()) {
    const range = stampSfxSettings(path).playbackRateRange || STAMP_SFX_PLAYBACK_RATE_RANGE;
    return {
      min: asNumber(range.min, STAMP_SFX_PLAYBACK_RATE_RANGE.min),
      max: asNumber(range.max, STAMP_SFX_PLAYBACK_RATE_RANGE.max)
    };
  }

  function randomStampSfxPlaybackRate(path = stampSfxPath()) {
    const rangeSpec = stampSfxPlaybackRateRange(path);
    const range = rangeSpec.max - rangeSpec.min;
    return rangeSpec.min + (Math.random() * range);
  }

  function isIntroFoodStampSfxEvent(event = null) {
    return event?.sceneId === 'intro' && event?.kind === 'food-hero';
  }

  function stampSfxVolume(path = stampSfxPath()) {
    return asNumber(stampSfxSettings(path).volume, STAMP_SFX_VOLUME);
  }

  function stampSfxVolumeVariation(path = stampSfxPath()) {
    return asNumber(stampSfxSettings(path).volumeVariation, STAMP_SFX_VOLUME_VARIATION);
  }

  function randomStampSfxVolume({ clampForElement = true, path = stampSfxPath() } = {}) {
    const baseVolume = stampSfxVolume(path);
    const variation = stampSfxVolumeVariation(path);
    const volume = Math.max(0, baseVolume + ((Math.random() * 2 - 1) * variation));
    return clampForElement ? Math.min(volume, 1) : volume;
  }

  function stampSfxFilename(path = stampSfxPath()) {
    return String(path || '').split('/').pop().toLowerCase();
  }

  function stampSfxStartOffsetRange(path = stampSfxPath()) {
    const settings = stampSfxSettings(path);
    const fixedOffset = asNumber(settings.startOffsetSeconds, null);
    if (fixedOffset != null) return { min: fixedOffset, max: fixedOffset };
    const range = settings.startOffsetRangeSeconds || STAMP_SFX_START_OFFSET_RANGE_SECONDS;
    return {
      min: asNumber(range.min, STAMP_SFX_START_OFFSET_RANGE_SECONDS.min),
      max: asNumber(range.max, STAMP_SFX_START_OFFSET_RANGE_SECONDS.max)
    };
  }

  function stampSfxIntroLeadSeconds(path = stampSfxPath()) {
    return asNumber(stampSfxSettings(path).introLeadSeconds, INTRO_FOOD_STAMP_SFX_LEAD_SECONDS);
  }

  function stampSfxLeadSeconds(path = stampSfxPath()) {
    return asNumber(stampSfxSettings(path).leadSeconds, STAMP_SFX_LEAD_SECONDS);
  }

  function randomStampSfxStartOffset(audioOrDuration = null, path = stampSfxPath()) {
    const range = stampSfxStartOffsetRange(path);
    const min = range.min;
    const max = range.max;
    const duration = typeof audioOrDuration === 'number'
      ? audioOrDuration
      : Number(audioOrDuration?.duration);
    const safeMax = Number.isFinite(duration) && duration > 0
      ? Math.min(max, Math.max(min, duration - 0.08))
      : max;
    return min + (Math.random() * Math.max(0, safeMax - min));
  }

  function allowSfxPitchShift(audio) {
    if ('preservesPitch' in audio) audio.preservesPitch = false;
    if ('mozPreservesPitch' in audio) audio.mozPreservesPitch = false;
    if ('webkitPreservesPitch' in audio) audio.webkitPreservesPitch = false;
  }

  function ensureStampSfxAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!state.stampSfxAudioContext) state.stampSfxAudioContext = new AudioContextClass();
    if (state.stampSfxAudioContext.state === 'suspended') {
      state.stampSfxAudioContext.resume().catch(() => {});
    }
    return state.stampSfxAudioContext;
  }

  function stampSfxBufferPromise(path = stampSfxPath()) {
    if (state.stampSfxBufferPath !== path) {
      state.stampSfxBuffer = null;
      state.stampSfxBufferPromise = null;
      state.stampSfxBufferPath = path;
    }
    if (state.stampSfxBuffer && state.stampSfxBufferPath === path) return Promise.resolve(state.stampSfxBuffer);
    if (state.stampSfxBufferPromise && state.stampSfxBufferPath === path) return state.stampSfxBufferPromise;
    const context = ensureStampSfxAudioContext();
    if (!context) return null;
    state.stampSfxBufferPromise = fetch(docsAssetPath(path))
      .then(response => {
        if (!response.ok) throw new Error(`Stamp SFX fetch failed: ${response.status}`);
        return response.arrayBuffer();
      })
      .then(buffer => context.decodeAudioData(buffer.slice(0)))
      .then(decoded => {
        if (state.stampSfxBufferPath === path) state.stampSfxBuffer = decoded;
        return decoded;
      })
      .catch(error => {
        if (state.stampSfxBufferPath === path) {
          state.stampSfxBuffer = null;
          state.stampSfxBufferPromise = null;
        }
        throw error;
      });
    return state.stampSfxBufferPromise;
  }

  function primeStampSfx() {
    if (!state.audioEnabled) return;
    ensureStampSfxAudioPool().forEach(audio => {
      try {
        audio.load();
      } catch {}
    });
    const promise = stampSfxBufferPromise();
    if (promise?.catch) promise.catch(() => {});
  }

  function playStampHtmlSfx(event) {
    if (!state.audioEnabled || !event) return;
    const path = stampSfxPath();
    const audio = nextStampSfxAudio();
    try {
      audio.pause();
      audio.currentTime = randomStampSfxStartOffset(audio, path);
      allowSfxPitchShift(audio);
      audio.volume = randomStampSfxVolume({ clampForElement: true, path });
      audio.playbackRate = randomStampSfxPlaybackRate(path);
      const playPromise = audio.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    } catch {}
  }

  function playStampWebAudioSfx(event) {
    const path = stampSfxPath();
    const context = ensureStampSfxAudioContext();
    const promise = context ? stampSfxBufferPromise(path) : null;
    if (!context || !promise) {
      playStampHtmlSfx(event);
      return;
    }
    if (!state.stampSfxBuffer || state.stampSfxBufferPath !== path) {
      promise.catch(() => {});
      playStampHtmlSfx(event);
      return;
    }
    promise
      .then(buffer => {
        if (!state.audioEnabled || !state.playing) return;
        const source = context.createBufferSource();
        const gain = context.createGain();
        source.buffer = buffer;
        source.playbackRate.value = randomStampSfxPlaybackRate(path);
        gain.gain.value = randomStampSfxVolume({ clampForElement: false, path });
        source.connect(gain).connect(context.destination);
        state.stampSfxSources.add(source);
        source.onended = () => {
          state.stampSfxSources.delete(source);
        };
        source.start(0, randomStampSfxStartOffset(buffer.duration, path));
      })
      .catch(() => {
        playStampHtmlSfx(event);
      });
  }

  function playStampSfx(event) {
    if (!state.audioEnabled || !event) return;
    playStampWebAudioSfx(event);
  }

  function pauseStampSfx() {
    for (const source of state.stampSfxSources || []) {
      try {
        source.stop();
      } catch {}
    }
    state.stampSfxSources.clear();
    for (const audio of state.stampSfxPool || []) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }
  }

  function stampSfxShouldTriggerBetween(event, previousTime, currentTime) {
    if (!event) return false;
    if (event.time > previousTime && event.time <= currentTime) return true;
    return isIntroFoodStampSfxEvent(event)
      && event.time < 0
      && previousTime <= 0.001
      && currentTime > previousTime;
  }

  function triggerStampSfxBetween(previousTime, currentTime) {
    if (!state.playing || !state.audioEnabled || currentTime <= previousTime) return;
    for (const event of playbackSfxEvents('stamp', stampSfxEvents)) {
      if (state.playedStampSfxKeys.has(event.key)) continue;
      if (!stampSfxShouldTriggerBetween(event, previousTime, currentTime)) continue;
      state.playedStampSfxKeys.add(event.key);
      playStampSfx(event);
    }
  }

  function triggerIntroFoodStampSfxAtPlaybackStart() {
    if (!state.playing || !state.audioEnabled || state.playheadStart > 0.001) return;
    for (const event of playbackSfxEvents('stamp', stampSfxEvents)) {
      if (!isIntroFoodStampSfxEvent(event) || event.time >= 0) continue;
      if (state.playedStampSfxKeys.has(event.key)) continue;
      state.playedStampSfxKeys.add(event.key);
      playStampSfx(event);
    }
  }

  function sTierStampSfxSettings() {
    return sfxAssetRoleSettings('sTierStamp', S_TIER_STAMP_SFX_PATH) || {};
  }

  function sTierStampSfxVolume() {
    return asNumber(sTierStampSfxSettings().volume, S_TIER_STAMP_SFX_VOLUME);
  }

  function sTierStampSfxLeadSeconds() {
    return asNumber(sTierStampSfxSettings().leadSeconds, S_TIER_STAMP_SFX_LEAD_SECONDS);
  }

  function sTierStampSfxPoolSize() {
    return Math.max(1, Math.round(asNumber(sTierStampSfxSettings().poolSize, S_TIER_STAMP_SFX_POOL_SIZE)));
  }

  function sTierStampSfxStartOffsetSeconds() {
    return asNumber(sTierStampSfxSettings().startOffsetSeconds, 0);
  }

  function sTierStampSfxPlaybackRate() {
    return asNumber(sTierStampSfxSettings().playbackRate, 1);
  }

  function dTierGameLoseSfxSettings() {
    return sfxAssetRoleSettings('dTierGameLose', D_TIER_GAME_LOSE_SFX_PATH) || {};
  }

  function dTierDeathSfxSettings() {
    return sfxAssetRoleSettings('dTierDeath', D_TIER_DEATH_SFX_PATH) || {};
  }

  function dTierGameLoseSfxVolume() {
    return asNumber(dTierGameLoseSfxSettings().volume, D_TIER_GAME_LOSE_SFX_VOLUME);
  }

  function dTierDeathSfxVolume() {
    return asNumber(dTierDeathSfxSettings().volume, D_TIER_DEATH_SFX_VOLUME);
  }

  function dTierGameLoseSfxLeadSeconds() {
    return asNumber(dTierGameLoseSfxSettings().leadSeconds, D_TIER_GAME_LOSE_SFX_LEAD_SECONDS);
  }

  function dTierDeathSfxDelaySeconds() {
    return asNumber(dTierGameLoseSfxSettings().deathDelaySeconds, D_TIER_DEATH_SFX_DELAY_SECONDS);
  }

  function dTierGameLoseSfxPoolSize() {
    return Math.max(1, Math.round(asNumber(dTierGameLoseSfxSettings().poolSize, D_TIER_STAMP_SFX_POOL_SIZE)));
  }

  function dTierDeathSfxPoolSize() {
    return Math.max(1, Math.round(asNumber(dTierDeathSfxSettings().poolSize, D_TIER_STAMP_SFX_POOL_SIZE)));
  }

  function dTierGameLoseSfxStartOffsetSeconds() {
    return asNumber(dTierGameLoseSfxSettings().startOffsetSeconds, 0);
  }

  function dTierDeathSfxStartOffsetSeconds() {
    return asNumber(dTierDeathSfxSettings().startOffsetSeconds, 0);
  }

  function dTierGameLoseSfxPlaybackRate() {
    return asNumber(dTierGameLoseSfxSettings().playbackRate, 1);
  }

  function dTierDeathSfxPlaybackRate() {
    return asNumber(dTierDeathSfxSettings().playbackRate, 1);
  }

  function nextSTierStampSfxAudio() {
    if (!state.sTierStampSfxPool.length) {
      state.sTierStampSfxPool = Array.from({ length: sTierStampSfxPoolSize() }, () => {
        const audio = new Audio(docsAssetPath(S_TIER_STAMP_SFX_PATH));
        audio.preload = 'auto';
        audio.volume = Math.min(sTierStampSfxVolume(), 1);
        return audio;
      });
    }
    const audio = state.sTierStampSfxPool[state.sTierStampSfxPoolIndex % state.sTierStampSfxPool.length];
    state.sTierStampSfxPoolIndex += 1;
    return audio;
  }

  function ensureDTierGameLoseSfxAudioPool() {
    if (!state.dTierGameLoseSfxPool.length) {
      state.dTierGameLoseSfxPool = Array.from({ length: dTierGameLoseSfxPoolSize() }, () => {
        const audio = new Audio(docsAssetPath(D_TIER_GAME_LOSE_SFX_PATH));
        audio.preload = 'auto';
        audio.volume = Math.min(dTierGameLoseSfxVolume(), 1);
        return audio;
      });
    }
    return state.dTierGameLoseSfxPool;
  }

  function ensureDTierDeathSfxAudioPool() {
    if (!state.dTierDeathSfxPool.length) {
      state.dTierDeathSfxPool = Array.from({ length: dTierDeathSfxPoolSize() }, () => {
        const audio = new Audio(docsAssetPath(D_TIER_DEATH_SFX_PATH));
        audio.preload = 'auto';
        audio.volume = Math.min(dTierDeathSfxVolume(), 1);
        return audio;
      });
    }
    return state.dTierDeathSfxPool;
  }

  function primeDTierStampSfx() {
    if (!state.audioEnabled) return;
    [...ensureDTierGameLoseSfxAudioPool(), ...ensureDTierDeathSfxAudioPool()].forEach(audio => {
      try {
        audio.load();
      } catch {}
    });
  }

  function nextDTierGameLoseSfxAudio() {
    ensureDTierGameLoseSfxAudioPool();
    const audio = state.dTierGameLoseSfxPool[state.dTierGameLoseSfxPoolIndex % state.dTierGameLoseSfxPool.length];
    state.dTierGameLoseSfxPoolIndex += 1;
    return audio;
  }

  function nextDTierDeathSfxAudio() {
    ensureDTierDeathSfxAudioPool();
    const audio = state.dTierDeathSfxPool[state.dTierDeathSfxPoolIndex % state.dTierDeathSfxPool.length];
    state.dTierDeathSfxPoolIndex += 1;
    return audio;
  }

  function clearDTierDeathSfxTimers() {
    for (const timer of state.dTierDeathSfxTimers || []) {
      window.clearTimeout(timer);
    }
    state.dTierDeathSfxTimers.clear();
  }

  function scheduleDTierDeathSfx(event) {
    if (!state.audioEnabled || !event) return;
    const delayMs = Math.max(0, Math.round(dTierDeathSfxDelaySeconds() * 1000));
    const timer = window.setTimeout(() => {
      state.dTierDeathSfxTimers.delete(timer);
      if (!state.audioEnabled) return;
      playDTierStampSfx({
        ...event,
        key: `${event.key}:death-collapse`,
        kind: 'd-tier-death-collapse'
      });
    }, delayMs);
    state.dTierDeathSfxTimers.add(timer);
  }

  function playSTierStampSfx(event) {
    if (!state.audioEnabled || !event) return;
    const audio = nextSTierStampSfxAudio();
    try {
      audio.pause();
      audio.currentTime = sTierStampSfxStartOffsetSeconds();
      audio.volume = Math.min(sTierStampSfxVolume(), 1);
      audio.playbackRate = sTierStampSfxPlaybackRate();
      const playPromise = audio.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    } catch {}
  }

  function playDTierStampSfx(event) {
    if (!state.audioEnabled || !event) return;
    const isDeath = event.kind === 'd-tier-death-collapse';
    const audio = isDeath ? nextDTierDeathSfxAudio() : nextDTierGameLoseSfxAudio();
    try {
      audio.pause();
      audio.currentTime = isDeath ? dTierDeathSfxStartOffsetSeconds() : dTierGameLoseSfxStartOffsetSeconds();
      audio.volume = Math.min(isDeath ? dTierDeathSfxVolume() : dTierGameLoseSfxVolume(), 1);
      audio.playbackRate = isDeath ? dTierDeathSfxPlaybackRate() : dTierGameLoseSfxPlaybackRate();
      const playPromise = audio.play();
      if (playPromise?.catch) playPromise.catch(() => {});
      if (!isDeath) scheduleDTierDeathSfx(event);
    } catch {}
  }

  function pauseSTierStampSfx() {
    for (const audio of state.sTierStampSfxPool || []) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }
  }

  function pauseDTierStampSfx() {
    clearDTierDeathSfxTimers();
    [...(state.dTierGameLoseSfxPool || []), ...(state.dTierDeathSfxPool || [])].forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    });
  }

  function triggerSTierStampSfxBetween(previousTime, currentTime) {
    if (!state.playing || !state.audioEnabled || currentTime <= previousTime) return;
    for (const event of playbackSfxEvents('sTierStamp', sTierStampSfxEvents)) {
      if (state.playedSTierStampSfxKeys.has(event.key)) continue;
      if (event.time <= previousTime || event.time > currentTime) continue;
      state.playedSTierStampSfxKeys.add(event.key);
      playSTierStampSfx(event);
    }
  }

  function triggerDTierStampSfxBetween(previousTime, currentTime) {
    if (!state.playing || !state.audioEnabled || currentTime <= previousTime) return;
    for (const event of playbackSfxEvents('dTierStamp', dTierStampSfxEvents)) {
      if (state.playedDTierStampSfxKeys.has(event.key)) continue;
      if (event.time <= previousTime || event.time > currentTime) continue;
      state.playedDTierStampSfxKeys.add(event.key);
      playDTierStampSfx(event);
    }
  }

  function sectionTransitionSfxEvents() {
    const offsetSeconds = sectionTransitionSfxTimeOffsetSeconds();
    return sceneStarts()
      .slice(1)
      .map(scene => ({
        key: `section-transition:${scene.id}:${scene.start.toFixed(3)}`,
        sceneId: scene.id,
        time: Number((scene.start + offsetSeconds).toFixed(3))
      }));
  }

  function nextTransitionSfxAudio() {
    const path = sectionTransitionSfxPath();
    const volume = sectionTransitionSfxVolume();
    if (state.transitionSfxPath && state.transitionSfxPath !== path) {
      pauseTransitionSfx();
      state.transitionSfxPool = [];
      state.transitionSfxPoolIndex = 0;
      state.transitionSfxBuffer = null;
      state.transitionSfxBufferPath = '';
      state.transitionSfxBufferPromise = null;
    }
    if (!state.transitionSfxPool.length) {
      state.transitionSfxPool = Array.from({ length: SECTION_TRANSITION_SFX_POOL_SIZE }, () => {
        const audio = new Audio(docsAssetPath(path));
        audio.preload = 'auto';
        audio.volume = Math.min(volume, 1);
        return audio;
      });
      state.transitionSfxPath = path;
    }
    const audio = state.transitionSfxPool[state.transitionSfxPoolIndex % state.transitionSfxPool.length];
    state.transitionSfxPoolIndex += 1;
    audio.volume = Math.min(volume, 1);
    return audio;
  }

  function ensureTransitionSfxAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!state.transitionSfxAudioContext) state.transitionSfxAudioContext = new AudioContextClass();
    if (state.transitionSfxAudioContext.state === 'suspended') {
      state.transitionSfxAudioContext.resume().catch(() => {});
    }
    return state.transitionSfxAudioContext;
  }

  function transitionSfxBufferPromise(path = sectionTransitionSfxPath()) {
    if (state.transitionSfxBufferPath !== path) {
      state.transitionSfxBuffer = null;
      state.transitionSfxBufferPromise = null;
      state.transitionSfxBufferPath = path;
    }
    if (state.transitionSfxBuffer && state.transitionSfxBufferPath === path) return Promise.resolve(state.transitionSfxBuffer);
    if (state.transitionSfxBufferPromise && state.transitionSfxBufferPath === path) return state.transitionSfxBufferPromise;
    const context = ensureTransitionSfxAudioContext();
    if (!context) return null;
    state.transitionSfxBufferPromise = fetch(docsAssetPath(path))
      .then(response => {
        if (!response.ok) throw new Error(`Transition SFX fetch failed: ${response.status}`);
        return response.arrayBuffer();
      })
      .then(buffer => context.decodeAudioData(buffer.slice(0)))
      .then(decoded => {
        if (state.transitionSfxBufferPath === path) state.transitionSfxBuffer = decoded;
        return decoded;
      })
      .catch(error => {
        if (state.transitionSfxBufferPath === path) {
          state.transitionSfxBuffer = null;
          state.transitionSfxBufferPromise = null;
        }
        throw error;
      });
    return state.transitionSfxBufferPromise;
  }

  function primeTransitionSfx() {
    if (!state.audioEnabled || sectionTransitionSfxVolume() <= 1) return;
    const promise = transitionSfxBufferPromise();
    if (promise?.catch) promise.catch(() => {});
  }

  function playTransitionHtmlSfx(event) {
    if (!state.audioEnabled || !event) return;
    const audio = nextTransitionSfxAudio();
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = Math.min(sectionTransitionSfxVolume(), 1);
      const playPromise = audio.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    } catch {}
  }

  function playTransitionWebAudioSfx(event) {
    const path = sectionTransitionSfxPath();
    const volume = sectionTransitionSfxVolume();
    const context = ensureTransitionSfxAudioContext();
    const promise = context ? transitionSfxBufferPromise(path) : null;
    if (!context || !promise) {
      playTransitionHtmlSfx(event);
      return;
    }
    if (!state.transitionSfxBuffer || state.transitionSfxBufferPath !== path) {
      promise.catch(() => {});
      playTransitionHtmlSfx(event);
      return;
    }
    promise
      .then(buffer => {
        if (!state.audioEnabled || !state.playing) return;
        const source = context.createBufferSource();
        const gain = context.createGain();
        source.buffer = buffer;
        gain.gain.value = volume;
        source.connect(gain).connect(context.destination);
        state.transitionSfxSources.add(source);
        source.onended = () => {
          state.transitionSfxSources.delete(source);
        };
        source.start(0);
      })
      .catch(() => {
        playTransitionHtmlSfx(event);
      });
  }

  function playTransitionSfx(event) {
    if (!state.audioEnabled || !event) return;
    if (sectionTransitionSfxVolume() > 1) {
      playTransitionWebAudioSfx(event);
      return;
    }
    playTransitionHtmlSfx(event);
  }

  function pauseTransitionSfx() {
    for (const source of state.transitionSfxSources || []) {
      try {
        source.stop();
      } catch {}
    }
    state.transitionSfxSources.clear();
    for (const audio of state.transitionSfxPool || []) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }
  }

  function triggerTransitionSfxBetween(previousTime, currentTime) {
    if (!state.playing || !state.audioEnabled || currentTime <= previousTime) return;
    for (const event of playbackSfxEvents('transition', sectionTransitionSfxEvents)) {
      if (state.playedTransitionSfxKeys.has(event.key)) continue;
      if (event.time <= previousTime || event.time > currentTime) continue;
      state.playedTransitionSfxKeys.add(event.key);
      playTransitionSfx(event);
    }
  }

  function micronBarConfirmSfxPlaybackRate(step) {
    const safeStep = clamp(Math.round(asNumber(step, 1)), 1, 10);
    const range = MICRON_BAR_CONFIRM_SFX_PLAYBACK_RATE_RANGE.max - MICRON_BAR_CONFIRM_SFX_PLAYBACK_RATE_RANGE.min;
    return MICRON_BAR_CONFIRM_SFX_PLAYBACK_RATE_RANGE.min + (((safeStep - 1) / 9) * range);
  }

  function micronBarConfirmSfxEvents() {
    return sceneStarts()
      .filter(scene => scene.id === 'vitamins' || scene.id === 'minerals')
      .flatMap(scene => {
        const maxStep = maxMicronStepForSection(scene.id);
        if (!maxStep) return [];
        return Array.from({ length: maxStep }, (_, index) => {
          const step = index + 1;
          return {
            key: `micron-bar-confirm:${scene.id}:step-${step}`,
            sceneId: scene.id,
            step,
            time: Number((
              scene.start
              + MICRON_GRAPH_REVEAL_SECONDS
              + MICRON_BAR_AFTER_GRAPH_SECONDS
              + ((step - 1) * MICRON_BAR_STEP_SECONDS)
            ).toFixed(3)),
            playbackRate: micronBarConfirmSfxPlaybackRate(step)
          };
        });
      })
      .sort((a, b) => a.time - b.time || a.key.localeCompare(b.key));
  }

  function nextMicronBarConfirmSfxAudio() {
    if (!state.micronBarConfirmSfxPool.length) {
      state.micronBarConfirmSfxPool = Array.from({ length: MICRON_BAR_CONFIRM_SFX_POOL_SIZE }, () => {
        const audio = new Audio(docsAssetPath(MICRON_BAR_CONFIRM_SFX_PATH));
        audio.preload = 'auto';
        audio.volume = MICRON_BAR_CONFIRM_SFX_VOLUME;
        allowSfxPitchShift(audio);
        return audio;
      });
    }
    const audio = state.micronBarConfirmSfxPool[state.micronBarConfirmSfxPoolIndex % state.micronBarConfirmSfxPool.length];
    state.micronBarConfirmSfxPoolIndex += 1;
    return audio;
  }

  function playMicronBarConfirmSfx(event) {
    if (!state.audioEnabled || !event) return;
    const audio = nextMicronBarConfirmSfxAudio();
    const token = `${event.key}:${performance.now().toFixed(3)}`;
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.dataset.playToken = token;
      allowSfxPitchShift(audio);
      audio.volume = MICRON_BAR_CONFIRM_SFX_VOLUME;
      audio.playbackRate = event.playbackRate;
      const playPromise = audio.play();
      if (playPromise?.catch) playPromise.catch(() => {});
      window.setTimeout(() => {
        if (audio.dataset.playToken !== token) return;
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {}
      }, Math.round(MICRON_BAR_CONFIRM_SFX_PLAY_SECONDS * 1000));
    } catch {}
  }

  function pauseMicronBarConfirmSfx() {
    for (const audio of state.micronBarConfirmSfxPool || []) {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.dataset.playToken = '';
      } catch {}
    }
  }

  function triggerMicronBarConfirmSfxBetween(previousTime, currentTime) {
    if (!state.playing || !state.audioEnabled || currentTime <= previousTime) return;
    for (const event of playbackSfxEvents('micronBarConfirm', micronBarConfirmSfxEvents)) {
      if (state.playedMicronBarConfirmSfxKeys.has(event.key)) continue;
      if (event.time <= previousTime || event.time > currentTime) continue;
      state.playedMicronBarConfirmSfxKeys.add(event.key);
      playMicronBarConfirmSfx(event);
    }
  }

  function micron100FireworkSfxEvents() {
    return sceneStarts()
      .filter(scene => scene.id === 'vitamins' || scene.id === 'minerals')
      .filter(scene => maxMicronStepForSection(scene.id) >= 10)
      .flatMap(scene => {
        const burstTime = Number((
          scene.start
          + MICRON_GRAPH_REVEAL_SECONDS
          + MICRON_BAR_AFTER_GRAPH_SECONDS
          + (9 * MICRON_BAR_STEP_SECONDS)
        ).toFixed(3));
        return [
          {
            key: `micron-100-firework-lead:${scene.id}`,
            sceneId: scene.id,
            role: 'lead',
            time: Number(Math.max(scene.start, burstTime - MICRON_100_FIREWORK_LEAD_SFX_SECONDS).toFixed(3))
          },
          {
            key: `micron-100-firework:${scene.id}`,
            sceneId: scene.id,
            role: 'cluster',
            time: Number((burstTime + MICRON_100_FIREWORK_CLUSTER_SFX_DELAY_SECONDS).toFixed(3))
          }
        ];
      })
      .sort((a, b) => a.time - b.time || a.key.localeCompare(b.key));
  }

  function nextMicron100FireworkLeadSfxAudio() {
    if (!state.micron100FireworkLeadSfxPool.length) {
      state.micron100FireworkLeadSfxPool = Array.from({ length: MICRON_100_FIREWORK_LEAD_SFX_POOL_SIZE }, () => {
        const audio = new Audio(docsAssetPath(MICRON_100_FIREWORK_LEAD_SFX_PATH));
        audio.preload = 'auto';
        audio.volume = MICRON_100_FIREWORK_LEAD_SFX_VOLUME;
        return audio;
      });
    }
    const audio = state.micron100FireworkLeadSfxPool[state.micron100FireworkLeadSfxPoolIndex % state.micron100FireworkLeadSfxPool.length];
    state.micron100FireworkLeadSfxPoolIndex += 1;
    return audio;
  }

  function nextMicron100FireworkSfxAudio() {
    if (!state.micron100FireworkSfxPool.length) {
      state.micron100FireworkSfxPool = Array.from({ length: MICRON_100_FIREWORK_SFX_POOL_SIZE }, () => {
        const audio = new Audio(docsAssetPath(MICRON_100_FIREWORK_SFX_PATH));
        audio.preload = 'auto';
        audio.volume = MICRON_100_FIREWORK_SFX_VOLUME;
        return audio;
      });
    }
    const audio = state.micron100FireworkSfxPool[state.micron100FireworkSfxPoolIndex % state.micron100FireworkSfxPool.length];
    state.micron100FireworkSfxPoolIndex += 1;
    return audio;
  }

  function playMicron100FireworkSfx(event) {
    if (!state.audioEnabled || !event) return;
    const isLead = event.role === 'lead';
    const audio = isLead ? nextMicron100FireworkLeadSfxAudio() : nextMicron100FireworkSfxAudio();
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = isLead ? MICRON_100_FIREWORK_LEAD_SFX_VOLUME : MICRON_100_FIREWORK_SFX_VOLUME;
      audio.playbackRate = 1;
      const playPromise = audio.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    } catch {}
  }

  function pauseMicron100FireworkSfx() {
    for (const audio of state.micron100FireworkLeadSfxPool || []) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }
    for (const audio of state.micron100FireworkSfxPool || []) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }
  }

  function triggerMicron100FireworkSfxBetween(previousTime, currentTime) {
    if (!state.playing || !state.audioEnabled || currentTime <= previousTime) return;
    for (const event of playbackSfxEvents('micron100Firework', micron100FireworkSfxEvents)) {
      if (state.playedMicron100FireworkSfxKeys.has(event.key)) continue;
      if (event.time <= previousTime || event.time > currentTime) continue;
      state.playedMicron100FireworkSfxKeys.add(event.key);
      playMicron100FireworkSfx(event);
    }
  }

  function majorProSparkleSfxEvents() {
    const pros = selectedFood()?.contextItems?.pros || [];
    return sceneStarts()
      .filter(scene => scene.id === 'pros')
      .flatMap(scene => {
        const timing = sceneTimingModel(scene);
        return pros
          .map((item, rowIndex) => ({ item, rowIndex }))
          .filter(({ item, rowIndex }) => rowIndex < 3 && String(item?.impactLevel || '').toLowerCase() === 'major')
          .map(({ rowIndex }) => {
            const window = proConNarrationWindow(scene, timing, 'pros', rowIndex);
            if (!window) return null;
            return {
              key: `major-pro-sparkle:${selectedFood()?.id || 'food'}:${rowIndex}`,
              sceneId: scene.id,
              rowIndex,
              time: Number((scene.start + sceneNarrationDelaySeconds(scene) + (window.start * sceneNarrationDuration(scene))).toFixed(3))
            };
          })
          .filter(Boolean);
      })
      .sort((a, b) => a.time - b.time || a.key.localeCompare(b.key));
  }

  function nextMajorProSparkleSfxAudio() {
    if (!state.majorProSparkleSfxPool.length) {
      state.majorProSparkleSfxPool = Array.from({ length: MAJOR_PRO_SPARKLE_SFX_POOL_SIZE }, () => {
        const audio = new Audio(docsAssetPath(MAJOR_PRO_SPARKLE_SFX_PATH));
        audio.preload = 'auto';
        audio.volume = MAJOR_PRO_SPARKLE_SFX_VOLUME;
        return audio;
      });
    }
    const audio = state.majorProSparkleSfxPool[state.majorProSparkleSfxPoolIndex % state.majorProSparkleSfxPool.length];
    state.majorProSparkleSfxPoolIndex += 1;
    return audio;
  }

  function majorProSparklePlaybackRate() {
    const playbackRate = randomHighlightGlowPlaybackRate(state.majorProSparkleSfxPlaybackRate || 1, 'green');
    state.majorProSparkleSfxPlaybackRate = playbackRate;
    return playbackRate;
  }

  function playMajorProSparkleSfx(event) {
    if (!state.audioEnabled || !event) return;
    const audio = nextMajorProSparkleSfxAudio();
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = MAJOR_PRO_SPARKLE_SFX_VOLUME;
      disableAudioPitchPreservation(audio);
      audio.playbackRate = majorProSparklePlaybackRate();
      const playPromise = audio.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    } catch {}
  }

  function pauseMajorProSparkleSfx() {
    for (const audio of state.majorProSparkleSfxPool || []) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }
  }

  function triggerMajorProSparkleSfxBetween(previousTime, currentTime) {
    if (!state.playing || !state.audioEnabled || currentTime <= previousTime) return;
    for (const event of playbackSfxEvents('majorProSparkle', majorProSparkleSfxEvents)) {
      if (state.playedMajorProSparkleSfxKeys.has(event.key)) continue;
      if (event.time <= previousTime || event.time > currentTime) continue;
      state.playedMajorProSparkleSfxKeys.add(event.key);
      playMajorProSparkleSfx(event);
    }
  }

  function majorConSirenSfxEvents() {
    const cons = selectedFood()?.contextItems?.cons || [];
    return sceneStarts()
      .filter(scene => scene.id === 'cons')
      .flatMap(scene => {
        const timing = sceneTimingModel(scene);
        return cons
          .map((item, rowIndex) => ({ item, rowIndex }))
          .filter(({ item, rowIndex }) => rowIndex < 3 && String(item?.impactLevel || '').toLowerCase() === 'major')
          .map(({ rowIndex }) => {
            const window = proConNarrationWindow(scene, timing, 'cons', rowIndex);
            if (!window) return null;
            return {
              key: `major-con-siren:${selectedFood()?.id || 'food'}:${rowIndex}`,
              sceneId: scene.id,
              rowIndex,
              time: Number((scene.start + sceneNarrationDelaySeconds(scene) + (window.start * sceneNarrationDuration(scene))).toFixed(3))
            };
          })
          .filter(Boolean);
      })
      .sort((a, b) => a.time - b.time || a.key.localeCompare(b.key));
  }

  function nextMajorConSirenSfxAudio() {
    if (!state.majorConSirenSfxPool.length) {
      state.majorConSirenSfxPool = Array.from({ length: MAJOR_CON_SIREN_SFX_POOL_SIZE }, () => {
        const audio = new Audio(docsAssetPath(MAJOR_CON_SIREN_SFX_PATH));
        audio.preload = 'auto';
        audio.volume = MAJOR_CON_SIREN_SFX_VOLUME;
        return audio;
      });
    }
    const audio = state.majorConSirenSfxPool[state.majorConSirenSfxPoolIndex % state.majorConSirenSfxPool.length];
    state.majorConSirenSfxPoolIndex += 1;
    return audio;
  }

  function majorConSirenPlaybackRate() {
    const playbackRate = randomHighlightGlowPlaybackRate(state.majorConSirenSfxPlaybackRate || 1, 'red');
    state.majorConSirenSfxPlaybackRate = playbackRate;
    return playbackRate;
  }

  function playMajorConSirenSfx(event) {
    if (!state.audioEnabled || !event) return;
    const audio = nextMajorConSirenSfxAudio();
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = MAJOR_CON_SIREN_SFX_VOLUME;
      disableAudioPitchPreservation(audio);
      audio.playbackRate = majorConSirenPlaybackRate();
      const playPromise = audio.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    } catch {}
  }

  function pauseMajorConSirenSfx() {
    for (const audio of state.majorConSirenSfxPool || []) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }
  }

  function triggerMajorConSirenSfxBetween(previousTime, currentTime) {
    if (!state.playing || !state.audioEnabled || currentTime <= previousTime) return;
    for (const event of playbackSfxEvents('majorConSiren', majorConSirenSfxEvents)) {
      if (state.playedMajorConSirenSfxKeys.has(event.key)) continue;
      if (event.time <= previousTime || event.time > currentTime) continue;
      state.playedMajorConSirenSfxKeys.add(event.key);
      playMajorConSirenSfx(event);
    }
  }

  function macroBarFillSfxEvents() {
    return sceneStarts()
      .filter(scene => ['fats', 'carbs', 'protein'].includes(scene.id))
      .flatMap(scene => (
        sceneLayerRevealSchedule(scene)
          .filter(schedule => schedule.family === 'macro' && schedule.kind === 'bar-fill' && asNumber(schedule.fillRatio, 0) > 0.001)
          .map(schedule => {
            const fillRatio = clamp(asNumber(schedule.fillRatio, 0), 0, 1);
            const gifNativeSeconds = macroBarGifNativeSecondsForSrc(schedule.src);
            const fullSourceSeconds = macroBarFillSfxFullSourceSeconds(gifNativeSeconds);
            const sourceSliceSeconds = macroBarFillSfxSourceSliceSeconds(fillRatio, gifNativeSeconds);
            const targetSeconds = macroBarFillDurationSeconds(fillRatio);
            return {
              key: `macro-bar-fill:${scene.id}:${schedule.layerId || schedule.kind}:${schedule.startSeconds}`,
              sceneId: scene.id,
              layerId: schedule.layerId,
              fillRatio,
              sourceOffsetSeconds: 0,
              fullSourceSeconds,
              sourceSliceSeconds,
              gifNativeSeconds,
              gifPlaybackRate: macroBarFillSfxPlaybackRate(fillRatio, gifNativeSeconds),
              targetSeconds,
              time: Number((scene.start + schedule.startSeconds + MACRO_BAR_START_DWELL_SECONDS).toFixed(3))
            };
          })
      ))
      .sort((a, b) => a.time - b.time || a.key.localeCompare(b.key));
  }

  function buildPlaybackSfxEvents() {
    return {
      stamp: stampSfxEvents(),
      sTierStamp: sTierStampSfxEvents(),
      dTierStamp: dTierStampSfxEvents(),
      transition: sectionTransitionSfxEvents(),
      micronBarConfirm: micronBarConfirmSfxEvents(),
      micron100Firework: micron100FireworkSfxEvents(),
      majorProSparkle: majorProSparkleSfxEvents(),
      majorConSiren: majorConSirenSfxEvents(),
      barFill: macroBarFillSfxEvents()
    };
  }

  function playbackSfxEvents(key, build) {
    if (state.playing) {
      if (!state.playbackSfxEvents) state.playbackSfxEvents = buildPlaybackSfxEvents();
      return state.playbackSfxEvents[key] || [];
    }
    return build();
  }

  function macroBarGifNativeSecondsForSrc(src) {
    if (!src) return MACRO_BAR_GIF_NATIVE_SECONDS;
    const frames = requestMacroBarGifFrames(spritePath(src));
    return asNumber(frames?.nativeSeconds, null) || MACRO_BAR_GIF_NATIVE_SECONDS;
  }

  function macroBarFillSfxFullSourceSeconds(gifNativeSeconds = MACRO_BAR_GIF_NATIVE_SECONDS) {
    return Math.min(
      MACRO_BAR_FILL_SFX_SOURCE_SECONDS,
      macroBarFillSfxPlaybackRate(1, gifNativeSeconds) * macroBarFillDurationSeconds(1)
    );
  }

  function macroBarFillSfxSourceSliceSeconds(fillRatio, gifNativeSeconds = MACRO_BAR_GIF_NATIVE_SECONDS) {
    return Math.min(
      MACRO_BAR_FILL_SFX_SOURCE_SECONDS,
      macroBarFillSfxPlaybackRate(fillRatio, gifNativeSeconds) * macroBarFillDurationSeconds(fillRatio)
    );
  }

  function macroBarFillSfxPlaybackRate(fillRatio, gifNativeSeconds = MACRO_BAR_GIF_NATIVE_SECONDS) {
    return Math.max(
      0.001,
      Math.min(MACRO_BAR_FILL_SFX_SOURCE_SECONDS, Math.max(0.001, asNumber(gifNativeSeconds, MACRO_BAR_FULL_SFX_SOURCE_SECONDS))) / MACRO_BAR_FILL_SECONDS
    );
  }

  function nextBarFillSfxAudio() {
    if (!state.barFillSfxPool.length) {
      state.barFillSfxPool = Array.from({ length: MACRO_BAR_FILL_SFX_POOL_SIZE }, () => {
        const audio = new Audio(docsAssetPath(MACRO_BAR_FILL_SFX_PATH));
        audio.preload = 'auto';
        audio.volume = MACRO_BAR_FILL_SFX_VOLUME;
        allowSfxPitchShift(audio);
        return audio;
      });
    }
    const audio = state.barFillSfxPool[state.barFillSfxPoolIndex % state.barFillSfxPool.length];
    state.barFillSfxPoolIndex += 1;
    return audio;
  }

  function ensureBarFillSfxAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!state.barFillSfxAudioContext) state.barFillSfxAudioContext = new AudioContextClass();
    if (state.barFillSfxAudioContext.state === 'suspended') {
      state.barFillSfxAudioContext.resume().catch(() => {});
    }
    return state.barFillSfxAudioContext;
  }

  function barFillSfxBufferPromise() {
    if (state.barFillSfxBuffer) return Promise.resolve(state.barFillSfxBuffer);
    if (state.barFillSfxBufferPromise) return state.barFillSfxBufferPromise;
    const context = ensureBarFillSfxAudioContext();
    if (!context) return null;
    state.barFillSfxBufferPromise = fetch(docsAssetPath(MACRO_BAR_FILL_SFX_PATH))
      .then(response => {
        if (!response.ok) throw new Error(`Bar fill SFX fetch failed: ${response.status}`);
        return response.arrayBuffer();
      })
      .then(buffer => context.decodeAudioData(buffer.slice(0)))
      .then(decoded => {
        state.barFillSfxBuffer = decoded;
        return decoded;
      })
      .catch(error => {
        state.barFillSfxBufferPromise = null;
        throw error;
      });
    return state.barFillSfxBufferPromise;
  }

  function primeBarFillSfx() {
    if (!state.audioEnabled) return;
    const promise = barFillSfxBufferPromise();
    if (promise?.catch) promise.catch(() => {});
  }

  function macroBarFillSfxTiming(event, sourceDuration = MACRO_BAR_FILL_SFX_SOURCE_SECONDS) {
    const safeDuration = Math.max(0.001, asNumber(sourceDuration, MACRO_BAR_FILL_SFX_SOURCE_SECONDS));
    const targetSeconds = Math.max(0.001, asNumber(event?.targetSeconds, MACRO_BAR_FILL_SECONDS));
    const sourceSliceSeconds = Math.min(
      asNumber(event?.sourceSliceSeconds, null) ?? macroBarFillSfxSourceSliceSeconds(event?.fillRatio, event?.gifNativeSeconds),
      safeDuration
    );
    const sourceOffsetSeconds = clamp(
      asNumber(event?.sourceOffsetSeconds, 0),
      0,
      Math.max(0, safeDuration - sourceSliceSeconds)
    );
    const playbackRate = Math.max(0.001, asNumber(event?.gifPlaybackRate, null) ?? (sourceSliceSeconds / targetSeconds));
    const playSeconds = Math.min(
      targetSeconds,
      Math.max(0.001, sourceSliceSeconds / playbackRate),
      Math.max(0.001, (safeDuration - sourceOffsetSeconds) / playbackRate)
    );
    return {
      playbackRate,
      playSeconds,
      sourceOffsetSeconds,
      fadeInSeconds: Math.min(MACRO_BAR_FILL_SFX_FADE_IN_SECONDS, playSeconds * 0.4),
      fadeOutSeconds: Math.min(MACRO_BAR_FILL_SFX_FADE_OUT_SECONDS, playSeconds * 0.45)
    };
  }

  function barFillSfxEnvelope(elapsedSeconds, timing) {
    const playSeconds = Math.max(0.001, timing?.playSeconds || MACRO_BAR_FILL_SECONDS);
    const fadeInSeconds = Math.max(0, timing?.fadeInSeconds || 0);
    const fadeOutSeconds = Math.max(0, timing?.fadeOutSeconds || 0);
    const fadeIn = fadeInSeconds > 0 ? smoothstep(clamp(elapsedSeconds / fadeInSeconds, 0, 1)) : 1;
    const fadeOut = fadeOutSeconds > 0 ? smoothstep(clamp((playSeconds - elapsedSeconds) / fadeOutSeconds, 0, 1)) : 1;
    return Math.min(fadeIn, fadeOut);
  }

  function smoothstep(progress) {
    const safeProgress = clamp(progress, 0, 1);
    return safeProgress * safeProgress * (3 - (2 * safeProgress));
  }

  function applyBarFillHtmlSfxEnvelope(audio, timing) {
    const startMs = performance.now();
    const step = () => {
      if (audio.paused) return;
      const elapsedSeconds = (performance.now() - startMs) / 1000;
      audio.volume = MACRO_BAR_FILL_SFX_VOLUME * barFillSfxEnvelope(elapsedSeconds, timing);
      if (elapsedSeconds < timing.playSeconds) window.requestAnimationFrame(step);
    };
    step();
  }

  function applyBarFillWebAudioEnvelope(gain, context, timing) {
    const now = context.currentTime;
    const playSeconds = Math.max(0.001, timing.playSeconds);
    const steps = Math.max(8, MACRO_BAR_FILL_SFX_ENVELOPE_STEPS);
    const curve = Float32Array.from({ length: steps }, (_, index) => {
      const elapsedSeconds = playSeconds * (index / Math.max(1, steps - 1));
      return MACRO_BAR_FILL_SFX_GAIN * barFillSfxEnvelope(elapsedSeconds, timing);
    });
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.setValueCurveAtTime(curve, now, playSeconds);
  }

  function playBarFillHtmlSfx(event) {
    if (!state.audioEnabled || !event) return;
    const audio = nextBarFillSfxAudio();
    const timing = macroBarFillSfxTiming(event, audio.duration || MACRO_BAR_FILL_SFX_SOURCE_SECONDS);
    try {
      audio.pause();
      audio.currentTime = timing.sourceOffsetSeconds;
      allowSfxPitchShift(audio);
      audio.volume = 0;
      audio.playbackRate = timing.playbackRate;
      const playPromise = audio.play();
      if (playPromise?.catch) playPromise.catch(() => {});
      applyBarFillHtmlSfxEnvelope(audio, timing);
      window.setTimeout(() => {
        try {
          audio.pause();
          audio.currentTime = timing.sourceOffsetSeconds;
        } catch {}
      }, Math.round(timing.playSeconds * 1000));
    } catch {}
  }

  function playBarFillWebAudioSfx(event) {
    const context = ensureBarFillSfxAudioContext();
    const promise = context ? barFillSfxBufferPromise() : null;
    if (!context || !promise) {
      playBarFillHtmlSfx(event);
      return;
    }
    if (!state.barFillSfxBuffer) {
      promise.catch(() => {});
      playBarFillHtmlSfx(event);
      return;
    }
    promise
      .then(buffer => {
        if (!state.audioEnabled || !state.playing) return;
        const source = context.createBufferSource();
        const gain = context.createGain();
        const filter = context.createBiquadFilter();
        const timing = macroBarFillSfxTiming(event, buffer.duration);
        source.buffer = buffer;
        source.playbackRate.value = timing.playbackRate;
        filter.type = 'lowpass';
        filter.frequency.value = MACRO_BAR_FILL_SFX_FILTER_HZ;
        filter.Q.value = MACRO_BAR_FILL_SFX_FILTER_Q;
        applyBarFillWebAudioEnvelope(gain, context, timing);
        source.connect(filter).connect(gain).connect(context.destination);
        state.barFillSfxSources.add(source);
        source.onended = () => {
          state.barFillSfxSources.delete(source);
        };
        source.start(0, timing.sourceOffsetSeconds);
        source.stop(context.currentTime + timing.playSeconds);
      })
      .catch(() => {
        playBarFillHtmlSfx(event);
      });
  }

  function playBarFillSfx(event) {
    if (!state.audioEnabled || !event) return;
    playBarFillWebAudioSfx(event);
  }

  function pauseBarFillSfx() {
    for (const source of state.barFillSfxSources || []) {
      try {
        source.stop();
      } catch {}
    }
    state.barFillSfxSources.clear();
    for (const audio of state.barFillSfxPool || []) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }
  }

  function triggerBarFillSfxBetween(previousTime, currentTime) {
    if (!state.playing || !state.audioEnabled || currentTime <= previousTime) return;
    for (const event of playbackSfxEvents('barFill', macroBarFillSfxEvents)) {
      if (state.playedBarFillSfxKeys.has(event.key)) continue;
      if (event.time <= previousTime || event.time > currentTime) continue;
      state.playedBarFillSfxKeys.add(event.key);
      playBarFillSfx(event);
    }
  }

  function applyLayerAnimation(node, layer, scene, sceneProgress, index, persistent = false, revealSchedule = null, options = {}) {
    const baselineOffset = textLayerBaselineOffset(layer);
    if (persistent) {
      node.style.opacity = '1';
      const staticTransform = spriteLayerStaticTransform(layer);
      if (staticTransform) {
        node.style.transformOrigin = 'center';
        node.style.transform = staticTransform;
      } else if (baselineOffset > 0) {
        node.style.transformOrigin = 'bottom left';
        node.style.transform = `translate3d(0, calc(${baselineOffset}px * var(--pixel-unit)), 0)`;
      }
      return;
    }

    const delay = revealSchedule?.start ?? layerRevealDelay(layer, index);
    const sceneDuration = Math.max(1, sceneContentDuration(scene));
    const isMacroRowReveal = revealSchedule?.family === 'macro' && revealSchedule.rowIndex != null;
    const isMacroArrowReveal = isMacroRowReveal && revealSchedule?.kind === 'arrow';
    const isMacroBarFillReveal = revealSchedule?.family === 'macro' && revealSchedule?.kind === 'bar-fill';
    const isMacroHeadReveal = isMacroHeadRevealSchedule(revealSchedule);
    const isMicronReveal = revealSchedule?.family === 'micron';
    const isMicronTierReveal = isMicronReveal && ['dv-bar', 'icon', 'label', 'value'].includes(revealSchedule?.kind);
    const isProConRowReveal = (revealSchedule?.family === 'pros' || revealSchedule?.family === 'cons') && revealSchedule.rowIndex != null;
    const isIntroStampSprite = revealSchedule?.family === 'intro'
      && ['food-hero', 'ranked-glow', 'ranked-sprite'].includes(revealSchedule?.kind);
    const isOutroTierStamp = revealSchedule?.family === 'outro'
      && revealSchedule?.kind === 'tier'
      && isOutroFinalRevealStampLayer(layer);
    const isSTierPremiumStamp = isOutroTierStamp
      && normalizedTier(layer?.tier) === 'S'
      && layer?.stampRole === 'tier';
    const isIntroRankedGlow = revealSchedule?.family === 'intro' && revealSchedule?.kind === 'ranked-glow';
    const outroCtaWaveIndex = isOutroTierStamp ? outroCtaStampWaveIndex(layer) : -1;
    const isOutroCtaWaveStamp = outroCtaWaveIndex >= 0;
    const revealWindowSeconds = isIntroStampSprite || isOutroTierStamp
      ? stampRevealSecondsForSchedule(revealSchedule)
      : isMacroHeadReveal
      ? MACRO_HEAD_REVEAL_SECONDS
      : isMacroRowReveal
      ? SUBMACRO_REVEAL_WINDOW_SECONDS
      : isMicronTierReveal
        ? MICRON_BAR_STAMP_REVEAL_SECONDS
        : isMicronReveal
          ? MICRON_STAMP_REVEAL_SECONDS
      : AUDIO_REVEAL_WINDOW_SECONDS;
    const revealLead = isMacroRowReveal || isMacroHeadReveal || isMicronReveal ? 0 : Math.min(0.035, AUDIO_REVEAL_LEAD_SECONDS / sceneDuration);
    const revealWindow = isMacroHeadReveal
      ? Math.min(0.94, Math.max(0.001, revealWindowSeconds / sceneDuration))
      : isMacroRowReveal
      ? macroRevealWindowProgress(scene, revealWindowSeconds)
      : isIntroStampSprite || isOutroTierStamp
        ? stampRevealWindowProgress(scene, revealSchedule)
        : isMicronReveal
          ? Math.min(0.12, Math.max(isMicronTierReveal ? 0.008 : 0.028, revealWindowSeconds / sceneDuration))
          : Math.min(0.18, Math.max(0.045, revealWindowSeconds / sceneDuration));
    const rawRevealProgress = (sceneProgress + revealLead - delay) / revealWindow;
    const revealProgress = easeOutCubic(rawRevealProgress);
    let visible = clamp(revealProgress, 0, 1);
    let opacity = visible;
    const revealPulse = isMacroArrowReveal
      ? Math.sin(visible * Math.PI)
      : 0;
    let x = 0;
    let y = 0;
    let rotate = 0;
    let scale = layer.kind === 'text' ? 1 : 0.96 + (visible * 0.04);
    let clip = '';
    let stampImpactPulse = 0;
    const lockSpriteLayout = layer.kind === 'sprite' && !persistent && !isProConRowReveal;

    if (isMacroHeadReveal) {
      const targetFill = clamp(asNumber(layer?.fillRatio, revealSchedule?.fillRatio ?? 0), 0, 1);
      visible = options.groupedReveal
        ? (isMacroBarFillReveal && targetFill <= 0.001 ? 0 : 1)
        : (isMacroBarFillReveal && targetFill <= 0.001 ? 0 : visible);
      opacity = visible;
      scale = 1;
    } else if (isOutroTierStamp || isIntroStampSprite) {
      const impactPulse = Math.sin(visible * Math.PI);
      stampImpactPulse = impactPulse;
      const entryTilt = isOutroTierStamp || ['ranked-glow', 'ranked-sprite'].includes(revealSchedule?.kind) ? -4 : 4;
      scale = 1.62 - (visible * 0.62) + (impactPulse * 0.22);
      y += (1 - visible) * -20;
      rotate = (entryTilt * (1 - visible)) + (impactPulse * (entryTilt < 0 ? -1.4 : 1.4));
      if (isOutroCtaWaveStamp && rawRevealProgress > 1) {
        const sceneElapsedSeconds = clamp(state.currentTime - scene.start, 0, scene.duration);
        const elapsedSinceRevealStart = Math.max(0, sceneElapsedSeconds - (delay * sceneDuration));
        const waveElapsed = elapsedSinceRevealStart - revealWindowSeconds - OUTRO_CTA_WAVE_START_SECONDS;
        const localWaveElapsed = waveElapsed - (outroCtaWaveIndex * OUTRO_CTA_WAVE_STAGGER_SECONDS);
        if (localWaveElapsed >= 0) {
          const phase = localWaveElapsed % OUTRO_CTA_WAVE_CYCLE_SECONDS;
          if (phase <= OUTRO_CTA_WAVE_PULSE_SECONDS) {
            const wave = Math.sin((phase / OUTRO_CTA_WAVE_PULSE_SECONDS) * Math.PI);
            y -= wave * OUTRO_CTA_WAVE_LIFT;
            scale += wave * OUTRO_CTA_WAVE_SCALE;
          }
        }
      }
    } else if (isMacroRowReveal) {
      scale = 1;
    } else if (isMicronReveal) {
      const stampPulse = Math.sin(visible * Math.PI);
      scale = 0.965 + (visible * 0.035) + (stampPulse * (isMicronTierReveal ? 0.018 : 0.012));
      y += (1 - visible) * 2.4;
    } else if (lockSpriteLayout) {
      scale = 1;
    } else if (scene.reveal === 'slide') {
      x -= (1 - visible) * 10;
    } else if (scene.reveal === 'wipe') {
      clip = `inset(0 ${Math.round((1 - visible) * 100)}% 0 0)`;
    } else if (scene.reveal === 'pop') {
      scale = layer.kind === 'text' ? 1 : 0.8 + (visible * 0.2);
    } else {
      y += (1 - visible) * 7;
    }

    const baseRotation = spriteLayerRotation(layer);
    const totalRotation = rotate + baseRotation;
    const flip = layer.flipY ? ' scaleY(-1)' : '';
    if (options.opaqueSpriteReveal && rawRevealProgress > 0 && !isMacroHeadReveal) opacity = 1;
    y += baselineOffset;
    node.style.transformOrigin = isMacroArrowReveal || isOutroTierStamp || isIntroStampSprite || layer.flipY || baseRotation
      ? 'center'
      : baselineOffset > 0
        ? 'bottom left'
        : 'top left';
    node.style.opacity = String(opacity);
    node.style.transform = `translate3d(calc(${x}px * var(--pixel-unit)), calc(${y}px * var(--pixel-unit)), 0) rotate(${totalRotation.toFixed(2)}deg) scale(${scale})${flip}`;
    if (clip) node.style.clipPath = clip;
    if ((isOutroTierStamp || isIntroRankedGlow) && stampImpactPulse > 0.02) {
      const glowRgb = isOutroTierStamp ? outroTierGlowRgb(layer?.tier) : '255, 244, 184';
      const brightness = isSTierPremiumStamp ? 1.03 + (stampImpactPulse * 0.16) : 1.18 + (stampImpactPulse * 0.48);
      const saturate = isSTierPremiumStamp ? 1.04 + (stampImpactPulse * 0.12) : 1.18 + (stampImpactPulse * 0.38);
      const contrast = isSTierPremiumStamp ? 1.02 + (stampImpactPulse * 0.05) : 1.08 + (stampImpactPulse * 0.16);
      const coreGlow = isSTierPremiumStamp ? 1.2 + (stampImpactPulse * 2.2) : 2.2 + (stampImpactPulse * 4.8);
      const coreAlpha = isSTierPremiumStamp ? 0.22 + (stampImpactPulse * 0.14) : 0.50 + (stampImpactPulse * 0.32);
      const wideGlow = isSTierPremiumStamp ? 4.2 + (stampImpactPulse * 4.4) : 7 + (stampImpactPulse * 9);
      const wideAlpha = isSTierPremiumStamp ? 0.08 + (stampImpactPulse * 0.09) : 0.20 + (stampImpactPulse * 0.22);
      node.style.filter = [
        `brightness(${brightness.toFixed(3)})`,
        `saturate(${saturate.toFixed(3)})`,
        `contrast(${contrast.toFixed(3)})`,
        `drop-shadow(0 0 calc(${coreGlow.toFixed(2)}px * var(--pixel-unit)) rgba(${glowRgb}, ${coreAlpha.toFixed(3)}))`,
        `drop-shadow(0 0 calc(${wideGlow.toFixed(2)}px * var(--pixel-unit)) rgba(255, 255, 255, ${wideAlpha.toFixed(3)}))`
      ].join(' ');
    } else if (isMacroArrowReveal && revealPulse > 0.02) {
      const glowRgb = macroArrowGlowRgb(layer);
      const glowStrength = 0.35 + (revealPulse * 0.45);
      node.style.filter = [
        `brightness(${(1.08 + revealPulse * 0.28).toFixed(3)})`,
        `saturate(${(1.16 + revealPulse * 0.28).toFixed(3)})`,
        `drop-shadow(0 0 calc(${(1.15 + revealPulse * 2.1).toFixed(2)}px * var(--pixel-unit)) rgba(${glowRgb}, ${glowStrength.toFixed(3)}))`
      ].join(' ');
    } else if (isMacroArrowReveal) {
      const glowRgb = macroArrowGlowRgb(layer);
      node.style.filter = [
        'brightness(1.08)',
        'saturate(1.16)',
        `drop-shadow(0 0 calc(1.15px * var(--pixel-unit)) rgba(${glowRgb}, 0.35))`
      ].join(' ');
    }
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function stopPlayback({ pauseSfx = true } = {}) {
    state.playing = false;
    state.audioInHold = false;
    state.playbackSfxEvents = null;
    els.playPause.textContent = 'Play';
    if (els.narrationAudio) els.narrationAudio.pause();
    pauseHighlightGlowSfx();
    if (pauseSfx) {
      pauseStampSfx();
      pauseSTierStampSfx();
      pauseDTierStampSfx();
      pauseTransitionSfx();
      pauseMicronBarConfirmSfx();
      pauseMicron100FireworkSfx();
      pauseMajorProSparkleSfx();
      pauseMajorConSirenSfx();
      pauseBarFillSfx();
    }
  }

  function startPlayback() {
    state.playing = true;
    state.startedAt = performance.now();
    state.playheadStart = state.currentTime;
    state.highlightGlowSfxLastFrameAt = performance.now();
    state.audioInHold = false;
    state.playedStampSfxKeys = new Set();
    state.playedSTierStampSfxKeys = new Set();
    state.playedDTierStampSfxKeys = new Set();
    state.playedTransitionSfxKeys = new Set();
    state.playedMicronBarConfirmSfxKeys = new Set();
    state.playedMicron100FireworkSfxKeys = new Set();
    state.playedMajorProSparkleSfxKeys = new Set();
    state.playedMajorConSirenSfxKeys = new Set();
    state.playedBarFillSfxKeys = new Set();
    state.playbackSfxEvents = buildPlaybackSfxEvents();
    els.playPause.textContent = 'Pause';
    primeStampSfx();
    primeDTierStampSfx();
    primeTransitionSfx();
    primeBarFillSfx();
    triggerIntroFoodStampSfxAtPlaybackStart();
    syncAudioPlaybackState();
    requestAnimationFrame(tick);
  }

  function tick(now) {
    if (!state.playing) return;
    const elapsed = (now - state.startedAt) / 1000;
    const previousTime = state.currentTime;
    state.currentTime = state.playheadStart + elapsed;
    triggerTransitionSfxBetween(previousTime, state.currentTime);
    triggerStampSfxBetween(previousTime, state.currentTime);
    triggerSTierStampSfxBetween(previousTime, state.currentTime);
    triggerDTierStampSfxBetween(previousTime, state.currentTime);
    triggerMicronBarConfirmSfxBetween(previousTime, state.currentTime);
    triggerMicron100FireworkSfxBetween(previousTime, state.currentTime);
    triggerMajorProSparkleSfxBetween(previousTime, state.currentTime);
    triggerMajorConSirenSfxBetween(previousTime, state.currentTime);
    triggerBarFillSfxBetween(previousTime, state.currentTime);
    if (state.currentTime >= totalDuration()) {
      state.currentTime = totalDuration();
      stopPlayback({ pauseSfx: false });
    }
    syncAudioPlaybackState();
    renderDynamic();
    if (state.playing) requestAnimationFrame(tick);
  }

  function renderDynamic({ fullUi = false } = {}) {
    const sceneChanged = syncSelectedSceneToPlayhead();
    renderStage();
    if (fullUi || sceneChanged) renderSceneList();
    renderTimelineStrip();
    if (fullUi || sceneChanged) renderControls();
    else updatePlaybackControls(null, { refreshAudioStatus: false });
  }

  function renderAll() {
    state.currentTime = clamp(state.currentTime, 0, totalDuration());
    setCanvasScale();
    syncCurrentSectionIndicatorsForViewport();
    syncAudioForFood();
    renderLayoutSourceOptions();
    renderFoodList();
    renderSceneList();
    renderTimelineStrip();
    renderControls();
    renderManifest();
    renderStage();
    scheduleSpriteDiagnostics(650);
  }

  function updateSelectedScene(mutator) {
    const scene = state.scenes.find(item => item.id === state.selectedSceneId);
    if (!scene) return;
    mutator(scene);
    renderAll();
  }

  els.foodSearch.addEventListener('input', () => {
    state.foodFilter = els.foodSearch.value;
    renderFoodList();
  });

  els.layoutSource.addEventListener('change', () => {
    state.layoutSourceId = els.layoutSource.value;
    hydrateLayoutForFood();
    persist();
    renderAll();
  });

  window.addEventListener('storage', event => {
    if ([
      DISPLAY_BUILDER_V2_STATE_KEY,
      DISPLAY_BUILDER_V2_PLACEMENT_EXPORT_KEY
    ].includes(event.key)) {
      hydrateLayoutForFood();
      renderAll();
    }
  });

  els.playPause.addEventListener('click', () => {
    if (state.playing) {
      stopPlayback();
    } else {
      if (state.currentTime >= totalDuration()) state.currentTime = 0;
      startPlayback();
    }
  });

  els.timeScrub.addEventListener('input', () => {
    state.currentTime = Number(els.timeScrub.value) / 100;
    stopPlayback();
    syncAudioTime({ force: true });
    renderDynamic({ fullUi: true });
  });

  els.audioToggle.addEventListener('click', () => {
    if (!audioForFood(selectedFood())) return;
    state.audioEnabled = !state.audioEnabled;
    if (!state.audioEnabled) {
      els.narrationAudio.pause();
      pauseStampSfx();
      pauseSTierStampSfx();
      pauseDTierStampSfx();
      pauseHighlightGlowSfx();
      pauseTransitionSfx();
      pauseMicron100FireworkSfx();
      pauseMajorProSparkleSfx();
      pauseMajorConSirenSfx();
      pauseBarFillSfx();
    }
    else if (state.playing) syncAudioPlaybackState();
    persist();
    updateAudioControls();
  });

  els.sceneDuration.addEventListener('input', () => {
    state.audioTimelineKey = '';
    state.audioDurationSeconds = null;
    updateSelectedScene(scene => {
      setSceneDuration(scene, clamp(asNumber(els.sceneDuration.value, scene.duration), 0.4 + sceneHoldSeconds(scene), 30));
    });
  });

  els.revealStyle.addEventListener('change', () => {
    updateSelectedScene(scene => {
      scene.reveal = els.revealStyle.value;
    });
  });

  els.captionSize.addEventListener('input', () => {
    updateSelectedScene(scene => {
      scene.captionSize = clamp(asNumber(els.captionSize.value, scene.captionSize), 12, 34);
    });
  });

  els.captionText.addEventListener('input', () => {
    updateSelectedScene(scene => {
      scene.caption = els.captionText.value;
    });
  });

  els.resetCaptions.addEventListener('click', () => {
    state.scenes = buildScenes(selectedFood());
    state.currentTime = 0;
    state.selectedSceneId = 'intro';
    state.audioTimelineKey = '';
    state.audioDurationSeconds = null;
    renderAll();
  });

  els.copyManifest.addEventListener('click', async () => {
    const text = JSON.stringify(buildManifest(), null, 2);
    els.manifestOutput.value = text;
    try {
      await navigator.clipboard.writeText(text);
      els.copyManifest.textContent = 'Copied';
      setTimeout(() => { els.copyManifest.textContent = 'Copy manifest'; }, 1000);
    } catch {
      els.manifestOutput.select();
    }
  });

  els.copySpriteReport.addEventListener('click', async () => {
    const text = spriteDiagnosticsReport();
    try {
      await navigator.clipboard.writeText(text);
      els.copySpriteReport.textContent = 'Copied';
      setTimeout(() => { els.copySpriteReport.textContent = 'Copy sprite report'; }, 1000);
    } catch {
      els.spriteDiagnostics.textContent = text;
    }
  });

  window.addEventListener('resize', () => {
    setCanvasScale();
    syncCurrentSectionIndicatorsForViewport();
    renderStage();
    scheduleSpriteDiagnostics(450);
  });

  async function init() {
    await loadBatchResults();
    const food = selectedFood();
    if (!foods.some(item => item.id === state.selectedFoodId) && foods[0]) state.selectedFoodId = foods[0].id;
    state.scenes = buildScenes(food);
    hydrateLayoutForFood();
    syncAudioForFood();
    renderAll();
    requestAnimationFrame(() => {
      setCanvasScale();
      syncCurrentSectionIndicatorsForViewport();
      renderStage();
    });
  }

  function normalizeSplitAudioBlocks(blocks) {
    return (Array.isArray(blocks) ? blocks : [])
      .map(block => {
        const offsetSeconds = asNumber(block.offsetSeconds, null);
        const durationCandidates = [
          asNumber(block.durationSeconds, null),
          asNumber(block.mediaDurationSeconds, null),
          block.path ? asNumber(state.splitAudioMetadataDurations.get(block.path), null) : null
        ].filter(value => value != null && value > 0);
        const durationSeconds = durationCandidates.length ? Math.max(...durationCandidates) : null;
        return {
          id: block.id || null,
          index: asNumber(block.index, null),
          kind: block.kind || null,
          sectionKey: block.sectionKey || null,
          path: block.path || null,
          productionPath: block.productionPath || null,
          text: block.text || '',
          offsetSeconds,
          durationSeconds,
          endSeconds: offsetSeconds != null && durationSeconds != null ? offsetSeconds + durationSeconds : null
        };
      })
      .filter(block => block.path && block.offsetSeconds != null && block.durationSeconds != null && block.durationSeconds > 0)
      .sort((a, b) => a.offsetSeconds - b.offsetSeconds || (a.index ?? 0) - (b.index ?? 0));
  }

  function audioForFood(food) {
    const splitAudio = food?.episode?.splitAudio || food?.splitAudio || null;
    const splitBlocks = normalizeSplitAudioBlocks(splitAudio?.blocks);
    if (splitAudio?.mode === 'split-blocks' && splitBlocks.length) {
      let durationSeconds = asNumber(splitAudio.durationSeconds, null);
      const blockDurationSeconds = Math.max(...splitBlocks.map(block => block.endSeconds || 0));
      durationSeconds = durationSeconds == null
        ? blockDurationSeconds
        : Math.max(durationSeconds, blockDurationSeconds);
      return {
        mode: 'split-blocks',
        take: splitAudio.take || null,
        manifestPath: splitAudio.manifestPath || null,
        productionManifestPath: splitAudio.productionManifestPath || null,
        profileId: splitAudio.profileId || null,
        voiceLabel: splitAudio.voiceLabel || null,
        modelId: splitAudio.modelId || null,
        generatedAt: splitAudio.generatedAt || null,
        narrationVolume: asNumber(splitAudio.narrationVolume ?? splitAudio.playbackVolume, null),
        durationSeconds,
        blockGapSeconds: asNumber(splitAudio.blockGapSeconds, null),
        blocks: splitBlocks
      };
    }

    const audio = food?.episode?.audio || food?.audio || null;
    if (!audio?.path) return null;
    return {
      mode: 'single-audio',
      take: audio.take || null,
      path: audio.path,
      metadataPath: audio.metadataPath || null,
      productionPath: audio.productionPath || null,
      profileId: audio.profileId || null,
      voiceLabel: audio.voiceLabel || null,
      modelId: audio.modelId || null,
      generatedAt: audio.generatedAt || null,
      narrationVolume: asNumber(audio.narrationVolume ?? audio.playbackVolume, null)
    };
  }

  function splitAudioBlockAtAudioTime(audio, audioTime) {
    if (audio?.mode !== 'split-blocks') return null;
    const timelineTime = asNumber(audioTime, 0);
    for (const block of audio.blocks || []) {
      const start = block.offsetSeconds;
      const end = block.endSeconds;
      if (timelineTime >= start && timelineTime < end) {
        return {
          block,
          audioTime: timelineTime,
          localTime: clamp(timelineTime - start, 0, Math.max(0, block.durationSeconds - 0.01))
        };
      }
    }
    return null;
  }

  function splitAudioPositionForVideoTime(audio, time = state.currentTime) {
    if (audio?.mode !== 'split-blocks') return null;
    const scene = activeSceneAt(time);
    if (!scene) return null;
    const elapsed = clamp(time - scene.start, 0, scene.duration);
    const sceneAudioTime = elapsed - sceneNarrationDelaySeconds(scene);
    if (sceneAudioTime < 0) return null;
    return splitAudioPositionForSceneTime(audio, scene.id, sceneAudioTime);
  }

  function setNarrationAudioSource(path) {
    const nextSrc = new URL(docsAssetPath(path), window.location.href).href;
    els.narrationAudio.dataset.sourcePath = path || '';
    if (els.narrationAudio.src === nextSrc) return false;
    els.narrationAudio.src = nextSrc;
    els.narrationAudio.load();
    return true;
  }

  function isAdamVoiceLabel(voiceLabel) {
    return /^Adam\b/i.test(String(voiceLabel || '').trim());
  }

  function narrationVolumeForAudio(audio) {
    if (isAdamVoiceLabel(audio?.voiceLabel)) return clamp(ADAM_NARRATION_VOLUME, 0, 1);
    return clamp(asNumber(audio?.narrationVolume, NARRATION_VOLUME), 0, 1);
  }

  function syncNarrationVolumeForAudio(audio) {
    if (!els.narrationAudio) return;
    const volume = narrationVolumeForAudio(audio);
    els.narrationAudio.volume = volume;
    els.narrationAudio.dataset.volume = volume.toFixed(3);
  }

  function syncAudioForFood() {
    const food = selectedFood();
    syncHighlightGlowSfxForFood(food);
    const audio = audioForFood(food);
    if (!els.narrationAudio) return;
    if (!audio) {
      els.narrationAudio.removeAttribute('src');
      syncNarrationVolumeForAudio(null);
      els.narrationAudio.load();
      updateAudioControls();
      primeStampSfx();
      primeDTierStampSfx();
      return;
    }
    syncNarrationVolumeForAudio(audio);
    if (audio.mode === 'split-blocks') {
      calibrateSceneDurationsToSplitAudio(audio);
      syncAudioTime({ force: true });
      updateAudioControls();
      primeStampSfx();
      primeDTierStampSfx();
      return;
    }
    const sourceChanged = setNarrationAudioSource(audio.path);
    if (sourceChanged) {
      state.audioTimelineKey = '';
      state.audioDurationSeconds = null;
    }
    syncAudioTime({ force: true });
    updateAudioControls();
    primeStampSfx();
    primeDTierStampSfx();
  }

  function syncAudioPlaybackState() {
    const audio = audioForFood(selectedFood());
    if (!state.audioEnabled || !audio) return;
    const splitPosition = audio.mode === 'split-blocks' ? splitAudioPositionForVideoTime(audio) : null;
    const waitingForNarration = isSceneHoldAt(state.currentTime)
      || isSceneNarrationDelayAt(state.currentTime)
      || (audio.mode === 'split-blocks' && !splitPosition);
    if (waitingForNarration) {
      if (!state.audioInHold) {
        syncAudioTime({ force: true });
        state.audioInHold = true;
      }
      if (!els.narrationAudio.paused) els.narrationAudio.pause();
      return;
    }

    const wasInHold = state.audioInHold;
    state.audioInHold = false;
    if (state.playing && els.narrationAudio.paused) {
      if (audio.mode === 'split-blocks' && !splitAudioPositionShouldPlay(splitPosition)) return;
      playAudioFromCurrentTime({ forceSync: true });
      return;
    }
    if (wasInHold) syncAudioTime({ force: true });
  }

  function syncAudioTime({ force = false } = {}) {
    const audio = audioForFood(selectedFood());
    if (!audio) return false;
    syncNarrationVolumeForAudio(audio);
    if (audio.mode === 'split-blocks') {
      const position = splitAudioPositionForVideoTime(audio);
      if (!position?.block) return false;
      setNarrationAudioSource(position.block.path);
      try {
        if (force) els.narrationAudio.currentTime = position.localTime;
      } catch {}
      return true;
    }
    if (!els.narrationAudio?.src) return false;
    const safeTime = clamp(videoTimeToAudioTime(state.currentTime), 0, Math.max(0, totalNarrationDuration() - 0.01));
    try {
      if (force) {
        els.narrationAudio.currentTime = safeTime;
      }
    } catch {}
    return true;
  }

  function playAudioFromCurrentTime({ forceSync = true } = {}) {
    const audio = audioForFood(selectedFood());
    if (!state.audioEnabled || !audio) return;
    if (isSceneHoldAt(state.currentTime) || isSceneNarrationDelayAt(state.currentTime)) return;
    if (audio.mode === 'split-blocks') {
      const position = splitAudioPositionForVideoTime(audio);
      if (!splitAudioPositionShouldPlay(position)) return;
    }
    if (!syncAudioTime({ force: forceSync })) return;
    if (!els.narrationAudio?.src) return;
    syncNarrationVolumeForAudio(audio);
    const playPromise = els.narrationAudio.play();
    if (playPromise?.catch) {
      playPromise.catch(error => {
        if (error?.name === 'NotAllowedError') {
          state.audioEnabled = false;
          updateAudioControls('Audio blocked');
          return;
        }
        if (state.playing) syncAudioPlaybackState();
      });
    }
  }

  function updateAudioControls(overrideStatus) {
    const audio = audioForFood(selectedFood());
    if (!els.audioToggle || !els.audioStatus) return;
    els.audioToggle.disabled = !audio;
    els.audioToggle.textContent = state.audioEnabled && audio ? 'Audio on' : 'Audio off';
    const holdDuration = totalHoldDuration();
    const syncLabel = state.audioDurationSeconds
      ? ` · synced ${state.audioDurationSeconds.toFixed(1)}s${holdDuration ? ` + ${holdDuration.toFixed(1)}s dwell` : ''}`
      : '';
    const modeLabel = audio?.mode === 'split-blocks' ? ' split' : '';
    els.audioStatus.textContent = overrideStatus || (audio ? `${audio.take || 'Audio'}${modeLabel} ready${syncLabel}` : 'No audio');
  }

  els.narrationAudio.addEventListener('loadedmetadata', () => {
    if (audioForFood(selectedFood())?.mode === 'split-blocks') {
      const sourcePath = els.narrationAudio.dataset.sourcePath || '';
      const duration = asNumber(els.narrationAudio.duration, null);
      if (sourcePath && duration != null && duration > 0) {
        const previousDuration = state.splitAudioMetadataDurations.get(sourcePath);
        if (previousDuration == null || Math.abs(previousDuration - duration) > 0.01) {
          state.splitAudioMetadataDurations.set(sourcePath, duration);
          state.audioTimelineKey = '';
          if (calibrateSceneDurationsToSplitAudio(audioForFood(selectedFood()))) {
            renderDynamic({ fullUi: true });
            return;
          }
        }
      }
      updateAudioControls();
      return;
    }
    if (calibrateSceneDurationsToAudio(els.narrationAudio.duration)) {
      syncAudioTime({ force: true });
      renderAll();
      return;
    }
    updateAudioControls();
  });

  void init();
}());
