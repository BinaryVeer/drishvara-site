function includesAny(text, needles = []) {
  return needles.some((needle) => text.includes(needle));
}

export function normalizePatternStage(stage = 'unknown') {
  const value = String(stage || '').toLowerCase().trim();

  const aliases = {
    'input-normalizer': 'input-normalizer',
    'input normalizer': 'input-normalizer',
    'story-drafter': 'story-drafter',
    'story drafter': 'story-drafter',
    'visual-intelligence': 'visual-intelligence',
    'visual intelligence': 'visual-intelligence',
    'integrator': 'integrator',
    'integration': 'integrator',
    'integrate': 'integrator',
    'guard': 'guard',
    'publisher': 'publisher',
    'pipeline': 'pipeline'
  };

  return aliases[value] || value || 'unknown';
}

export function classifyCorrectivePattern({ lessonType = '', stage = '', text = '' }) {
  const normalizedStage = normalizePatternStage(stage);
  const lower = String(text || '').toLowerCase();

  if (lessonType === 'success_pattern' && normalizedStage === 'pipeline') {
    return {
      patternCode: 'pipeline.publish_success',
      patternLabel: 'Pipeline publish success'
    };
  }

  if (normalizedStage === 'integrator') {
    if (
      includesAny(lower, [
        'outline',
        'bullet',
        'bullet-point',
        'meta-instruction',
        'meta-outline',
        'planning guidance',
        'planning note',
        'the article should',
        'audience-facing prose',
        'publishable copy',
        'publish-ready'
      ])
    ) {
      return {
        patternCode: 'integrator.outline_to_article_prose',
        patternLabel: 'Integrator must convert outline-style draft into article prose'
      };
    }

    if (
      includesAny(lower, [
        'visual artifact',
        'visual support',
        'visual element',
        'visual framework',
        'figure callout',
        'figure block',
        'diagram',
        'callout',
        'execution-ready visual',
        'visual storytelling requirement'
      ])
    ) {
      return {
        patternCode: 'integrator.missing_visual_execution_blocks',
        patternLabel: 'Integrator must operationalize visual elements as executable figure blocks'
      };
    }

    if (
      includesAny(lower, [
        'introduction',
        'opening',
        'conclusion',
        'closing',
        'lead',
        'synthesis',
        'synthesizes',
        'operational takeaway'
      ])
    ) {
      return {
        patternCode: 'integrator.weak_intro_or_conclusion',
        patternLabel: 'Integrator must strengthen framing or conclusion'
      };
    }

    if (lessonType === 'failure_pattern') {
      return {
        patternCode: 'integrator.general_failure',
        patternLabel: 'General integrator revision trigger'
      };
    }

    if (lessonType === 'fix_pattern') {
      return {
        patternCode: 'integrator.general_fix',
        patternLabel: 'General integrator corrective action'
      };
    }
  }

  if (normalizedStage === 'story-drafter') {
    if (
      includesAny(lower, [
        'meta-instruction',
        'meta-outline',
        'the article should',
        'outline',
        'planning note'
      ])
    ) {
      return {
        patternCode: 'story-drafter.meta_outline_language',
        patternLabel: 'Story drafter must avoid meta-outline language'
      };
    }

    return {
      patternCode: `story-drafter.${lessonType || 'general'}`,
      patternLabel: 'General story-drafter pattern'
    };
  }

  if (normalizedStage === 'visual-intelligence') {
    return {
      patternCode: 'visual-intelligence.figure_brief_standardization',
      patternLabel: 'Visual intelligence should standardize figure briefs'
    };
  }

  return {
    patternCode: `${normalizedStage}.${lessonType || 'general'}`,
    patternLabel: `General ${normalizedStage} pattern`
  };
}
