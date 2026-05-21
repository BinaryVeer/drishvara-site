# AG10C — Data Visualization and Chart/Graph Pipeline Planning

## Purpose

AG10C defines the governed data visualization and chart/graph pipeline for Drishvara.

It covers chart families, chart-data schemas, data-source registry doctrine, dataset normalization, derived metrics, inference logs, reusable chart templates, rendered object instances, credit rules, theme rules, mobile fallback rules and future reuse.

AG10C is planning-only. It does not fetch data, create datasets, render charts, create chart templates, insert objects, mutate articles, modify CSS/JS, activate backend/Auth/Supabase/database systems or publish anything.

## Data Lifecycle

The planned lifecycle is:

1. Data source metadata
2. Extracted data
3. Cleaned / normalized dataset
4. Derived metrics
5. Inference and interpretation log
6. Dataset-object binding
7. Article-dataset mapping
8. Reuse and learning log

## Template and Rendered Instance Model

Reusable chart templates are separated from data-bound rendered object instances.

Template reuse may be broad after approval. Rendered chart reuse is allowed only when data, context, freshness, source/credit and article relevance remain valid.

## Credit Logic

Where external source data is used:

- Data source: [source name]
- Data visualization: Drishvara

Where internal Drishvara data is used:

- Data and visualization: Drishvara

Where derived metrics are created from source data:

- Data source: [source name]
- Analysis and visualization: Drishvara

## Next Stage

AG10D — Infographic Pipeline Planning — only with explicit approval.
