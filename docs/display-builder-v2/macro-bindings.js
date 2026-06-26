(function () {
  const MACRO_TEXT_BINDINGS = {
    fats: {
      fats_macro_label: { kind: 'staticLabel', label: 'FATS', source: 'experimental binding map' },
      fats_macro_value: { kind: 'macroTotal', field: 'header.fat_g', unit: 'g', source: 'existing macro total display' },
      fats_submacro_label_1: { kind: 'metricLabel', metricKey: 'saturated_fat_g', label: 'SAT FAT', source: 'existing macro submetric spec' },
      fats_submacro_value_1: { kind: 'metricValue', metricKey: 'saturated_fat_g', field: 'metrics.saturated_fat_g', unit: 'g', source: 'existing macro submetric spec' },
      fats_submacro_label_2: { kind: 'metricLabel', metricKey: 'polyunsaturated_fat_g', label: 'POLY FAT', source: 'existing macro submetric spec' },
      fats_submacro_value_2: { kind: 'metricValue', metricKey: 'polyunsaturated_fat_g', field: 'metrics.polyunsaturated_fat_g', unit: 'g', source: 'existing macro submetric spec' },
      fats_submacro_label_3: { kind: 'metricLabel', metricKey: 'omega3_mg', label: 'OMEGA 3', source: 'existing macro submetric spec' },
      fats_submacro_value_3: { kind: 'metricValue', metricKey: 'omega3_mg', field: 'metrics.omega3_mg', unit: 'mg', source: 'existing macro submetric spec' },
      fats_submacro_label_4: { kind: 'metricLabel', metricKey: 'cholesterol_mg', label: 'CHOLEST.', source: 'existing macro submetric spec' },
      fats_submacro_value_4: { kind: 'metricValue', metricKey: 'cholesterol_mg', field: 'metrics.cholesterol_mg', unit: 'mg', source: 'existing macro submetric spec' }
    },
    carbs: {
      carbs_macro_label: { kind: 'staticLabel', label: 'CARBS', source: 'experimental binding map' },
      carbs_macro_value: { kind: 'macroTotal', field: 'header.carb_g', alternateFields: ['header.carbs_g'], unit: 'g', source: 'existing macro total display' },
      carbs_submacro_label_1: { kind: 'metricLabel', metricKey: 'fibre_g', label: 'FIBRE', source: 'existing macro submetric spec' },
      carbs_submacro_value_1: { kind: 'metricValue', metricKey: 'fibre_g', field: 'metrics.fibre_g', unit: 'g', source: 'existing macro submetric spec' },
      carbs_submacro_label_2: { kind: 'metricLabel', metricKey: 'sugar_g', label: 'SUGAR', source: 'existing macro submetric spec' },
      carbs_submacro_value_2: { kind: 'metricValue', metricKey: 'sugar_g', field: 'metrics.sugar_g', unit: 'g', source: 'existing macro submetric spec' },
      carbs_submacro_label_3: { kind: 'metricLabel', metricKey: 'starch_g', label: 'STARCH', source: 'existing macro submetric spec' },
      carbs_submacro_value_3: { kind: 'metricValue', metricKey: 'starch_g', field: 'metrics.starch_g', unit: 'g', source: 'existing macro submetric spec' },
      carbs_submacro_label_4: { kind: 'metricLabel', metricKey: 'glycemic_index', label: 'GI', source: 'existing macro submetric spec' },
      carbs_submacro_value_4: { kind: 'metricValue', metricKey: 'glycemic_index', field: 'metrics.glycemic_index', unit: '', source: 'existing macro submetric spec' }
    },
    protein: {
      protein_macro_label: { kind: 'staticLabel', label: 'PROTEIN', source: 'experimental binding map' },
      protein_macro_value: { kind: 'macroTotal', field: 'header.protein_g', unit: 'g', source: 'existing macro total display' },
      protein_submacro_label_1: { kind: 'metricLabel', metricKey: 'collagen_g', label: 'COLLAGEN', source: 'existing macro submetric spec' },
      protein_submacro_value_1: { kind: 'metricValue', metricKey: 'collagen_g', field: 'metrics.collagen_g', unit: 'g', source: 'existing macro submetric spec' },
      protein_submacro_label_2: { kind: 'metricLabel', metricKey: 'essential_amino_acids_score', label: 'EAA', source: 'existing macro submetric spec' },
      protein_submacro_value_2: { kind: 'ratioMetricValue', metricKey: 'essential_amino_acids_score', field: 'metrics.essential_amino_acids_score', denominator: 9, source: 'existing macro submetric spec' },
      protein_submacro_label_3: { kind: 'metricLabel', metricKey: 'nonessential_amino_acids_score', label: 'NEAA', source: 'existing macro submetric spec' },
      protein_submacro_value_3: { kind: 'ratioMetricValue', metricKey: 'nonessential_amino_acids_score', field: 'metrics.nonessential_amino_acids_score', denominator: 11, source: 'existing macro submetric spec' },
      protein_submacro_label_4: { kind: 'metricLabel', metricKey: 'bioavailability_percent', label: 'BIOAVAIL.', source: 'existing macro submetric spec' },
      protein_submacro_value_4: { kind: 'metricValue', metricKey: 'bioavailability_percent', field: 'metrics.bioavailability_percent', unit: '%', source: 'existing macro submetric spec' }
    }
  };

  const MACRO_TEXT_FALLBACK_ORDER = {
    fats: ['fats_macro_value', 'fats_submacro_value_1', 'fats_submacro_value_2', 'fats_submacro_value_3', 'fats_submacro_value_4'],
    carbs: ['carbs_macro_value', 'carbs_submacro_value_1', 'carbs_submacro_value_2', 'carbs_submacro_value_3', 'carbs_submacro_value_4'],
    protein: ['protein_macro_value', 'protein_submacro_value_1', 'protein_submacro_value_2', 'protein_submacro_value_3', 'protein_submacro_value_4']
  };

  const MACRO_ARROW_ROWS = {
    fats: [
      { rowKey: 'sat_fat', metricKey: 'saturated_fat_g', label: 'Saturated fat' },
      { rowKey: 'poly_fat', metricKey: 'polyunsaturated_fat_g', label: 'Polyunsaturated fat' },
      { rowKey: 'omega3', metricKey: 'omega3_mg', label: 'Omega 3' },
      { rowKey: 'cholesterol', metricKey: 'cholesterol_mg', label: 'Cholesterol' }
    ],
    carbs: [
      { rowKey: 'fibre', metricKey: 'fibre_g', label: 'Fibre' },
      { rowKey: 'sugar', metricKey: 'sugar_g', label: 'Sugar' },
      { rowKey: 'starch', metricKey: 'starch_g', label: 'Starch' },
      { rowKey: 'glycemic_index', metricKey: 'glycemic_index', label: 'Glycemic index' }
    ],
    protein: [
      { rowKey: 'collagen', metricKey: 'collagen_g', label: 'Collagen' },
      { rowKey: 'eaa', metricKey: 'essential_amino_acids_score', label: 'Essential amino acids' },
      { rowKey: 'neaa', metricKey: 'nonessential_amino_acids_score', label: 'Non-essential amino acids' },
      { rowKey: 'bioavailability', metricKey: 'bioavailability_percent', label: 'Bioavailability' }
    ]
  };

  const PROTEIN_ROW_BINDINGS = {
    protein_g_fallback: {
      metricKey: 'protein_g_fallback',
      label: 'AMOUNT',
      longLabel: 'Protein amount',
      valueBinding: { kind: 'metricValue', metricKey: 'protein_g_fallback', field: 'header.protein_g', unit: 'g', source: 'generated protein fallback scoring' }
    },
    collagen_g: {
      metricKey: 'collagen_g',
      label: 'CLGN',
      longLabel: 'Collagen',
      valueBinding: { kind: 'metricValue', metricKey: 'collagen_g', field: 'metrics.collagen_g', unit: 'g', source: 'generated protein scoring breakdown' }
    },
    essential_amino_acids_score: {
      metricKey: 'essential_amino_acids_score',
      label: 'EAAs',
      longLabel: 'Essential amino acids',
      valueBinding: { kind: 'ratioMetricValue', metricKey: 'essential_amino_acids_score', field: 'metrics.essential_amino_acids_score', denominator: 9, source: 'generated protein scoring breakdown' }
    },
    nonessential_amino_acids_score: {
      metricKey: 'nonessential_amino_acids_score',
      label: 'N-EAAs',
      longLabel: 'Non-essential amino acids',
      valueBinding: { kind: 'ratioMetricValue', metricKey: 'nonessential_amino_acids_score', field: 'metrics.nonessential_amino_acids_score', denominator: 11, source: 'generated protein scoring breakdown' }
    },
    bioavailability_percent: {
      metricKey: 'bioavailability_percent',
      label: 'BIO-A',
      longLabel: 'Bioavailability',
      valueBinding: { kind: 'metricValue', metricKey: 'bioavailability_percent', field: 'metrics.bioavailability_percent', unit: '%', source: 'generated protein scoring breakdown' }
    }
  };

  window.FOODRANKED_MACRO_BINDINGS = {
    displaySections: ['intro', 'fats', 'carbs', 'protein', 'vitamins', 'minerals', 'pros', 'cons', 'outro'],
    macroSections: ['fats', 'carbs', 'protein'],
    proteinRows: PROTEIN_ROW_BINDINGS,
    textBindings: MACRO_TEXT_BINDINGS,
    textFallbackOrder: MACRO_TEXT_FALLBACK_ORDER,
    arrowRows: MACRO_ARROW_ROWS,
    sources: {
      textBindings: 'docs/display-builder-v2/macro-bindings.js',
      arrows: 'docs/display-builder-v2/macro-bindings.js row map plus existing display-builder row clustering'
    }
  };
})();
