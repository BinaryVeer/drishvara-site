# Architecture Overview

Drishvara Phase 01 is structured as a staged multi-agent pipeline controlled by a thin orchestrator.

## Pipeline stages
- input-normalizer
- story-drafter
- visual-intelligence
- integrator
- guard
- publisher

## Design principles
- each stage accepts structured input and returns structured output
- stage outputs are persisted for audit/debugging
- publishing is downstream from generation
- visual reasoning is a native subsystem, not a utility
