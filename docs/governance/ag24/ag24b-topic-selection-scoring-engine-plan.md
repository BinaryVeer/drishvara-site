# AG24B — Topic Selection and Scoring Engine Plan

**Status:** Governed plan only; non-active  
**Base commit:** be402f0  
**Created by:** vikash vaibhav  
**Created at:** 2026-05-25T03:21:15.930Z

## Purpose

AG24B defines the topic selection and scoring engine for Drishvara's episodic knowledge system. It consumes AG24A, AG23G, AG23F and AG23Z as source-of-truth inputs and does not repeat or replace them.

## Consumed Source-of-Truth Records

| Stage | Record | Source Path | Consumption |
|---|---|---|---|
| AG24A | Episodic Content Doctrine | `data/content-intelligence/episodes/ag24a-episodic-content-doctrine.json` | consumed_as_source_of_truth |
| AG23G | First Light Topic Scoring Model | `docs/quality/AG23G_FIRST_LIGHT_TOPIC_SCORING_MODEL.md` | consumed_as_source_of_truth |
| AG23F | First Light Source and Verification Plan | `docs/quality/AG23F_FIRST_LIGHT_SOURCE_VERIFICATION_PLAN.md` | consumed_as_source_of_truth |
| AG23Z | Homepage Daily Surface and First Light Closure | `data/content-intelligence/closure-records/ag23z-homepage-daily-surface-and-first-light-closure.json` | consumed_as_source_of_truth |

## Non-Activation Guard

AG24B is planning-only. It does not publish, deploy, activate Supabase/Auth/backend, mutate public indexes, generate articles, create live endpoints, or require secrets/tokens.

## Scoring Criteria

| Criterion | Range | Purpose |
|---|---:|---|
| Current relevance | 0 to 5 | Is the topic active, important or timely now? |
| Evergreen value | 0 to 5 | Will the topic remain useful beyond the current week? |
| Audience benefit | 0 to 5 | Will the topic teach, clarify or help the reader think better? |
| Reference availability | 0 to 5 | Are credible, reachable and relevant sources available? |
| Episode depth potential | 0 to 5 | Can the topic sustain at least 8 to 12 meaningful episodes? |
| Visual/object potential | 0 to 5 | Can diagrams, tables, infographics, timelines or examples improve the topic? |
| Drishvara brand fit | 0 to 5 | Does the topic fit Vision, Reflection and Insight? |
| Sensitivity risk | -5 to 0 | Does the topic involve high factual, political, social, legal, health or spiritual sensitivity? |
| Repetition risk | -5 to 0 | Is the topic overused, repetitive or too similar to recent content? |

## Decision Thresholds

| Decision | Score | Action |
|---|---:|---|
| Strong series candidate | 25+ | Promote to AG24C calendar planning if source and risk gates pass. |
| Topic bank | 18–24 | Retain for later improvement or timing. |
| Do not use now | Below 18 | Do not generate or publish. |

## First Light Bridge

First Light signals can enter the AG24B topic engine only as curated editorial inputs. Signals scoring 24+ may be considered for article or episode brief review if reference and risk gates pass. Signals scoring 18–23 remain First Light-only or topic-bank candidates. Signals below 18 are archived or ignored unless manually justified.

## Reference Gate

A promoted topic should target two verified references where possible. Broken, spam-like, parked, unreachable, irrelevant or unsupported links must not be treated as verified. Pending topics must be marked under editorial verification.

## AG24C Boundary

AG24B may hand off only scored candidates and planning rules to AG24C. Article generation, public publishing, deployment, backend activation and public visibility changes remain blocked.
