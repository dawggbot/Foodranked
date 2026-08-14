(function () {
  // One shared backdrop identity for thumbnails, DBv2, VBv2, and the app canvas.
  // Thumbnail shades are deliberately stronger so categories stay recognisable
  // when the artwork is viewed in a small grid.
  window.FOODRANKED_FOOD_TYPE_PALETTES = Object.freeze({
    vegetables: {
      label: 'Meadow Green',
      accent: '#4CAF50',
      top: '#d9f1c7',
      bottom: '#83b96d',
      glowA: 'rgba(221,255,187,.78)',
      glowB: 'rgba(65,139,79,.34)',
      thumbnailTop: '#e2f6cd',
      thumbnailMid: '#acd789',
      thumbnailBottom: '#6fa75f',
      thumbnailGlowA: 'rgba(213,255,159,.72)',
      thumbnailGlowB: 'rgba(48,124,71,.30)'
    },
    fruits: {
      label: 'Berry Rose',
      accent: '#E53970',
      top: '#f9d5e9',
      bottom: '#c96f9f',
      glowA: 'rgba(255,181,222,.76)',
      glowB: 'rgba(151,48,105,.30)',
      thumbnailTop: '#ffd9ef',
      thumbnailMid: '#e999c3',
      thumbnailBottom: '#b9588e',
      thumbnailGlowA: 'rgba(255,155,214,.70)',
      thumbnailGlowB: 'rgba(130,37,94,.30)'
    },
    grains: {
      label: 'Harvest Ochre',
      accent: '#D4A017',
      top: '#f5e4bd',
      bottom: '#b98842',
      glowA: 'rgba(255,237,172,.76)',
      glowB: 'rgba(151,101,31,.28)',
      thumbnailTop: '#f9e9b7',
      thumbnailMid: '#d6ad6b',
      thumbnailBottom: '#a77832',
      thumbnailGlowA: 'rgba(255,227,125,.68)',
      thumbnailGlowB: 'rgba(136,83,22,.28)'
    },
    legumes: {
      label: 'Bean Indigo',
      accent: '#6865A8',
      top: '#dde5f8',
      bottom: '#687cbd',
      glowA: 'rgba(210,219,255,.78)',
      glowB: 'rgba(73,70,145,.30)',
      thumbnailTop: '#e0e8fb',
      thumbnailMid: '#9eade3',
      thumbnailBottom: '#596fb2',
      thumbnailGlowA: 'rgba(199,203,255,.72)',
      thumbnailGlowB: 'rgba(64,54,132,.30)'
    },
    tubers: {
      label: 'Clay Orange',
      accent: '#BF6D2A',
      top: '#f8d6b9',
      bottom: '#cc7047',
      glowA: 'rgba(255,203,157,.74)',
      glowB: 'rgba(157,69,42,.28)',
      thumbnailTop: '#ffdbb8',
      thumbnailMid: '#ee9a55',
      thumbnailBottom: '#be5d39',
      thumbnailGlowA: 'rgba(255,186,120,.68)',
      thumbnailGlowB: 'rgba(143,54,35,.28)'
    },
    nuts: {
      label: 'Walnut Brown',
      accent: '#6D4C41',
      top: '#ead3c1',
      bottom: '#865f43',
      glowA: 'rgba(242,202,169,.74)',
      glowB: 'rgba(91,49,35,.30)',
      thumbnailTop: '#edd2bd',
      thumbnailMid: '#a77d58',
      thumbnailBottom: '#71503a',
      thumbnailGlowA: 'rgba(242,184,140,.66)',
      thumbnailGlowB: 'rgba(73,38,29,.30)'
    },
    seeds: {
      label: 'Sage Teal',
      accent: '#4E9488',
      top: '#d5f0e4',
      bottom: '#55a58d',
      glowA: 'rgba(205,255,239,.74)',
      glowB: 'rgba(43,120,111,.28)',
      thumbnailTop: '#d8f4e7',
      thumbnailMid: '#7bc6ab',
      thumbnailBottom: '#3e917b',
      thumbnailGlowA: 'rgba(184,255,230,.68)',
      thumbnailGlowB: 'rgba(34,105,99,.28)'
    },
    meats: {
      label: 'Oxblood Red',
      accent: '#8B0000',
      top: '#f1ceca',
      bottom: '#ad5658',
      glowA: 'rgba(255,185,180,.72)',
      glowB: 'rgba(126,35,44,.30)',
      thumbnailTop: '#f5d0cb',
      thumbnailMid: '#d67c78',
      thumbnailBottom: '#963e49',
      thumbnailGlowA: 'rgba(255,164,156,.66)',
      thumbnailGlowB: 'rgba(107,24,36,.30)'
    },
    dairy: {
      label: 'Milk Blue',
      accent: '#72B7D1',
      top: '#e4f3f8',
      bottom: '#8fc4d5',
      glowA: 'rgba(245,255,255,.78)',
      glowB: 'rgba(70,145,174,.26)',
      thumbnailTop: '#e8f7fb',
      thumbnailMid: '#b4dce8',
      thumbnailBottom: '#76aec6',
      thumbnailGlowA: 'rgba(255,255,255,.72)',
      thumbnailGlowB: 'rgba(53,129,160,.26)'
    },
    'oils-and-fats': {
      label: 'Sunflower Gold',
      accent: '#FFC107',
      top: '#fbefa5',
      bottom: '#d4aa22',
      glowA: 'rgba(255,242,137,.74)',
      glowB: 'rgba(173,126,11,.28)',
      thumbnailTop: '#fff0a1',
      thumbnailMid: '#e9cf47',
      thumbnailBottom: '#bf900d',
      thumbnailGlowA: 'rgba(255,232,92,.68)',
      thumbnailGlowB: 'rgba(151,105,5,.28)'
    },
    misc: {
      label: 'Wildcard Violet',
      accent: '#8E63B8',
      top: '#eeddf6',
      bottom: '#9868c4',
      glowA: 'rgba(220,180,247,.68)',
      glowB: 'rgba(80,128,171,.24)',
      thumbnailTop: '#f0e1fa',
      thumbnailMid: '#bf94df',
      thumbnailBottom: '#8955b5',
      thumbnailGlowA: 'rgba(213,157,244,.62)',
      thumbnailGlowB: 'rgba(69,131,177,.22)'
    }
  });
})();
