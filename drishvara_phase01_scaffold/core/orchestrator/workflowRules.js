export const workflowRules = {
  'input-normalizer': { next: 'story-drafter' },
  'story-drafter': { next: 'visual-intelligence' },
  'visual-intelligence': { next: 'integrator' },
  'integrator': { next: 'guard' },
  'guard': { next: 'publisher' },
  'publisher': { next: null }
};
