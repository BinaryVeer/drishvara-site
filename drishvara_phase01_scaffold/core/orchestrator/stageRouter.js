import { workflowRules } from './workflowRules.js';

export function getNextStage(stageName) {
  return workflowRules[stageName]?.next ?? null;
}
