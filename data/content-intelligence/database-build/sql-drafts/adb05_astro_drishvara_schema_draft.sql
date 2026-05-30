-- ADB05 DRAFT_ONLY
-- NOT_EXECUTED
-- CONSUMES_ADB02_AND_ADB04A
-- CONSUMES_M_D_ID_SERIES
-- NO_SERVICE_ROLE_KEY
-- NO_SEED_INSERT
-- NO_RUNTIME_ENGINE_ACTIVATION
--
-- Drishvara Astro-Drishvara schema draft.
-- This file is a draft migration for review only.
-- It must not be executed until a later explicit SQL execution approval checkpoint.
-- It does not insert seed data.
-- It does not activate Supabase/Auth/backend runtime.
-- It does not require service-role keys.

-- ============================================================
-- 00. Shared review/status infrastructure
-- ============================================================

CREATE TABLE IF NOT EXISTS source_authorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text UNIQUE NOT NULL,
  source_title text NOT NULL,
  source_type text,
  author_or_institution text,
  tradition_or_region text,
  source_locator text,
  source_confidence_band text NOT NULL DEFAULT 'under_review',
  verification_status text NOT NULL DEFAULT 'under_editorial_verification',
  editorial_review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  copyright_or_usage_note text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS source_texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_text_id text UNIQUE NOT NULL,
  source_id text REFERENCES source_authorities(source_id),
  source_title text,
  source_locator text,
  supported_claim text,
  exact_claim_support_status text NOT NULL DEFAULT 'pending_review',
  verification_status text NOT NULL DEFAULT 'under_editorial_verification',
  editorial_review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS source_confidence_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confidence_key text UNIQUE NOT NULL,
  confidence_label text NOT NULL,
  confidence_description text,
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS editorial_review_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_status_key text UNIQUE NOT NULL,
  review_status_label text NOT NULL,
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS methodology_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  methodology_note_id text UNIQUE NOT NULL,
  methodology_module text NOT NULL,
  methodology_title text,
  method_name text,
  source_id text REFERENCES source_authorities(source_id),
  supported_claim text,
  review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 01. Panchanga master and daily-output base
-- ============================================================

CREATE TABLE IF NOT EXISTS panchang_element_master (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  element_id text UNIQUE NOT NULL,
  element_name text NOT NULL,
  element_type text NOT NULL,
  sanskrit_name text,
  iast_name text,
  definition text,
  source_id text REFERENCES source_authorities(source_id),
  verification_status text NOT NULL DEFAULT 'under_editorial_verification',
  editorial_review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tithi_master (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tithi_id text UNIQUE NOT NULL,
  tithi_number integer,
  tithi_name text NOT NULL,
  paksha text,
  angular_start_degree numeric,
  angular_end_degree numeric,
  source_id text REFERENCES source_authorities(source_id),
  verification_status text NOT NULL DEFAULT 'under_editorial_verification',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nakshatra_master (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nakshatra_id text UNIQUE NOT NULL,
  nakshatra_number integer,
  nakshatra_name text NOT NULL,
  sidereal_start_degree numeric,
  sidereal_end_degree numeric,
  source_id text REFERENCES source_authorities(source_id),
  verification_status text NOT NULL DEFAULT 'under_editorial_verification',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS yoga_master (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  yoga_id text UNIQUE NOT NULL,
  yoga_number integer,
  yoga_name text NOT NULL,
  combined_longitude_start_degree numeric,
  combined_longitude_end_degree numeric,
  source_id text REFERENCES source_authorities(source_id),
  verification_status text NOT NULL DEFAULT 'under_editorial_verification',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS karana_master (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  karana_id text UNIQUE NOT NULL,
  karana_name text NOT NULL,
  karana_type text,
  half_tithi_sequence_note text,
  source_id text REFERENCES source_authorities(source_id),
  verification_status text NOT NULL DEFAULT 'under_editorial_verification',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vara_master (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vara_id text UNIQUE NOT NULL,
  vara_name text NOT NULL,
  weekday_index integer,
  sunrise_boundary_rule text,
  source_id text REFERENCES source_authorities(source_id),
  verification_status text NOT NULL DEFAULT 'under_editorial_verification',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rashi_master (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rashi_id text UNIQUE NOT NULL,
  rashi_number integer,
  rashi_name text NOT NULL,
  sidereal_start_degree numeric,
  sidereal_end_degree numeric,
  source_id text REFERENCES source_authorities(source_id),
  verification_status text NOT NULL DEFAULT 'under_editorial_verification',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 02. Regional calendar and observance profiles
-- ============================================================

CREATE TABLE IF NOT EXISTS regional_calendar_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  regional_profile_id text UNIQUE NOT NULL,
  region_or_tradition text NOT NULL,
  rule_type text,
  rule_summary text,
  supported_rule text,
  source_id text REFERENCES source_authorities(source_id),
  source_confidence_band text NOT NULL DEFAULT 'under_review',
  verification_status text NOT NULL DEFAULT 'under_editorial_verification',
  editorial_review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  difference_handling_note text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS regional_festival_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  regional_festival_rule_id text UNIQUE NOT NULL,
  regional_profile_id text REFERENCES regional_calendar_profiles(regional_profile_id),
  festival_key text NOT NULL,
  rule_summary text,
  source_id text REFERENCES source_authorities(source_id),
  verification_status text NOT NULL DEFAULT 'under_editorial_verification',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS festival_observance_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  observance_rule_id text UNIQUE NOT NULL,
  observance_key text NOT NULL,
  observance_name text NOT NULL,
  rule_family text,
  tithi_id text REFERENCES tithi_master(tithi_id),
  nakshatra_id text REFERENCES nakshatra_master(nakshatra_id),
  regional_profile_id text REFERENCES regional_calendar_profiles(regional_profile_id),
  event_window_basis text,
  source_id text REFERENCES source_authorities(source_id),
  verification_status text NOT NULL DEFAULT 'under_editorial_verification',
  editorial_review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS muhurta_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  muhurta_rule_id text UNIQUE NOT NULL,
  muhurta_key text NOT NULL,
  muhurta_name text,
  rule_summary text,
  source_id text REFERENCES source_authorities(source_id),
  verification_status text NOT NULL DEFAULT 'under_editorial_verification',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 03. Calculation-engine support from M01/M04/M04A
-- ============================================================

CREATE TABLE IF NOT EXISTS calculation_methodologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  methodology_id text UNIQUE NOT NULL,
  methodology_module text NOT NULL,
  methodology_name text NOT NULL,
  methodology_version text,
  source_id text REFERENCES source_authorities(source_id),
  calculation_scope text,
  review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calculation_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_profile_id text UNIQUE NOT NULL,
  profile_name text NOT NULL,
  methodology_id text REFERENCES calculation_methodologies(methodology_id),
  ephemeris_profile_id text,
  ayanamsha_profile_id text,
  location_time_profile_required boolean NOT NULL DEFAULT true,
  interpolation_or_root_finding_method text,
  correction_policy text,
  review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ephemeris_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ephemeris_profile_id text UNIQUE NOT NULL,
  ephemeris_name text NOT NULL,
  ephemeris_source text NOT NULL,
  library_or_dataset_version text,
  license_or_usage_note text,
  review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ayanamsha_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ayanamsha_profile_id text UNIQUE NOT NULL,
  ayanamsha_name text NOT NULL,
  ayanamsha_basis text,
  source_id text REFERENCES source_authorities(source_id),
  review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS location_time_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_time_profile_id text UNIQUE NOT NULL,
  location_label text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  coordinate_precision text,
  coordinate_source text,
  timezone_id text NOT NULL,
  timezone_version text,
  sunrise_basis text,
  sunset_basis text,
  moonrise_basis text,
  event_window_basis text,
  review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sunrise_sunset_moonrise_event_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_window_id text UNIQUE NOT NULL,
  location_time_profile_id text REFERENCES location_time_profiles(location_time_profile_id),
  date_key date NOT NULL,
  sunrise_time timestamptz,
  sunset_time timestamptz,
  moonrise_time timestamptz,
  moonset_time timestamptz,
  pradosh_start_time timestamptz,
  pradosh_end_time timestamptz,
  parana_start_time timestamptz,
  parana_end_time timestamptz,
  calculation_profile_id text REFERENCES calculation_profiles(calculation_profile_id),
  review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS astronomical_input_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  astronomical_snapshot_id text UNIQUE NOT NULL,
  calculation_run_id text,
  input_date date NOT NULL,
  input_location text,
  timezone text,
  ephemeris_profile_id text REFERENCES ephemeris_profiles(ephemeris_profile_id),
  ayanamsha_profile_id text REFERENCES ayanamsha_profiles(ayanamsha_profile_id),
  solar_longitude numeric,
  lunar_longitude numeric,
  sidereal_solar_longitude numeric,
  sidereal_lunar_longitude numeric,
  sidereal_conversion_basis text,
  snapshot_timestamp timestamptz NOT NULL DEFAULT now(),
  review_status text NOT NULL DEFAULT 'pending_review',
  notes text
);

CREATE TABLE IF NOT EXISTS solar_lunar_longitude_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  longitude_record_id text UNIQUE NOT NULL,
  astronomical_snapshot_id text REFERENCES astronomical_input_snapshots(astronomical_snapshot_id),
  body_name text NOT NULL,
  tropical_longitude numeric,
  sidereal_longitude numeric,
  longitude_unit text NOT NULL DEFAULT 'degree',
  calculation_timestamp timestamptz NOT NULL DEFAULT now(),
  notes text
);

CREATE TABLE IF NOT EXISTS sidereal_conversion_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sidereal_conversion_id text UNIQUE NOT NULL,
  astronomical_snapshot_id text REFERENCES astronomical_input_snapshots(astronomical_snapshot_id),
  ayanamsha_profile_id text REFERENCES ayanamsha_profiles(ayanamsha_profile_id),
  tropical_value numeric,
  ayanamsha_value numeric,
  sidereal_value numeric,
  conversion_note text,
  calculation_timestamp timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interpolation_root_finding_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interpolation_log_id text UNIQUE NOT NULL,
  calculation_run_id text,
  method_name text,
  target_event text,
  start_time timestamptz,
  end_time timestamptz,
  result_time timestamptz,
  tolerance_note text,
  software_library_version text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS panchanga_formula_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formula_rule_id text UNIQUE NOT NULL,
  formula_key text NOT NULL,
  formula_name text NOT NULL,
  element_type text NOT NULL,
  formula_expression text NOT NULL,
  source_id text REFERENCES source_authorities(source_id),
  methodology_id text REFERENCES calculation_methodologies(methodology_id),
  review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS panchanga_element_intervals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interval_id text UNIQUE NOT NULL,
  calculation_run_id text,
  element_type text NOT NULL,
  element_id text,
  interval_start_time timestamptz,
  interval_end_time timestamptz,
  start_value numeric,
  end_value numeric,
  transition_time timestamptz,
  skipped_repeated_flag text,
  review_status text NOT NULL DEFAULT 'pending_review',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS panchanga_calculation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_run_id text UNIQUE NOT NULL,
  input_date date NOT NULL,
  location_time_profile_id text REFERENCES location_time_profiles(location_time_profile_id),
  calculation_profile_id text REFERENCES calculation_profiles(calculation_profile_id),
  ephemeris_profile_id text REFERENCES ephemeris_profiles(ephemeris_profile_id),
  ayanamsha_profile_id text REFERENCES ayanamsha_profiles(ayanamsha_profile_id),
  run_status text NOT NULL DEFAULT 'draft_not_executed',
  software_library_version text,
  calculation_timestamp timestamptz,
  source_registry_reference text,
  reviewer_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS panchanga_calculation_trace_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_log_id text UNIQUE NOT NULL,
  calculation_run_id text REFERENCES panchanga_calculation_runs(calculation_run_id),
  trace_step text NOT NULL,
  trace_input jsonb,
  trace_output jsonb,
  trace_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS panchang_daily_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  panchang_daily_record_id text UNIQUE NOT NULL,
  date_key date NOT NULL,
  location_time_profile_id text REFERENCES location_time_profiles(location_time_profile_id),
  regional_profile_id text REFERENCES regional_calendar_profiles(regional_profile_id),
  calculation_profile_id text REFERENCES calculation_profiles(calculation_profile_id),
  calculation_run_id text REFERENCES panchanga_calculation_runs(calculation_run_id),
  tithi_id text REFERENCES tithi_master(tithi_id),
  nakshatra_id text REFERENCES nakshatra_master(nakshatra_id),
  yoga_id text REFERENCES yoga_master(yoga_id),
  karana_id text REFERENCES karana_master(karana_id),
  vara_id text REFERENCES vara_master(vara_id),
  rashi_id text REFERENCES rashi_master(rashi_id),
  source_id text REFERENCES source_authorities(source_id),
  verification_status text NOT NULL DEFAULT 'under_editorial_verification',
  editorial_review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 04. Vrat, fasting, festival and regional/sampradaya rule engine
-- ============================================================

CREATE TABLE IF NOT EXISTS tithi_vrat_rule_families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_family_id text UNIQUE NOT NULL,
  rule_family_key text NOT NULL,
  rule_family_name text NOT NULL,
  event_window_basis text,
  tithi_dependency text,
  source_id text REFERENCES source_authorities(source_id),
  review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fasting_parana_rule_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parana_rule_profile_id text UNIQUE NOT NULL,
  rule_family_id text REFERENCES tithi_vrat_rule_families(rule_family_id),
  regional_profile_id text REFERENCES regional_calendar_profiles(regional_profile_id),
  parana_start_basis text,
  parana_end_basis text,
  conflict_resolution_note text,
  source_id text REFERENCES source_authorities(source_id),
  review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS festival_observance_rule_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_observance_rule_id text UNIQUE NOT NULL,
  observance_key text NOT NULL,
  observance_name text NOT NULL,
  rule_family_id text REFERENCES tithi_vrat_rule_families(rule_family_id),
  regional_profile_id text REFERENCES regional_calendar_profiles(regional_profile_id),
  event_window_basis text,
  calculation_dependency_note text,
  source_id text REFERENCES source_authorities(source_id),
  verification_status text NOT NULL DEFAULT 'under_editorial_verification',
  editorial_review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS regional_sampradaya_rule_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id text UNIQUE NOT NULL,
  regional_profile_id text REFERENCES regional_calendar_profiles(regional_profile_id),
  sampradaya_key text,
  rule_reference_id text,
  variant_summary text,
  conflict_visibility_required boolean NOT NULL DEFAULT true,
  source_id text REFERENCES source_authorities(source_id),
  review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS observance_conflict_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conflict_flag_id text UNIQUE NOT NULL,
  observance_key text NOT NULL,
  regional_profile_id text REFERENCES regional_calendar_profiles(regional_profile_id),
  conflict_type text NOT NULL,
  conflict_summary text,
  resolution_status text NOT NULL DEFAULT 'unresolved_review_required',
  reviewer_note text,
  public_use_allowed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 05. Corpus, daily guidance, word rotation and mantra review
-- ============================================================

CREATE TABLE IF NOT EXISTS word_corpus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id text UNIQUE NOT NULL,
  word_key text NOT NULL,
  word_devanagari text,
  word_iast text,
  word_common_transliteration text,
  word_language text,
  root_or_dhatu text,
  literal_meaning text,
  contextual_meaning text,
  short_reflection_use text,
  source_id text REFERENCES source_authorities(source_id),
  source_locator text,
  verification_status text NOT NULL DEFAULT 'under_editorial_verification',
  editorial_review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sanskrit_name_corpus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_id text UNIQUE NOT NULL,
  name_key text NOT NULL,
  name_devanagari text,
  name_iast text,
  meaning_note text,
  source_id text REFERENCES source_authorities(source_id),
  verification_status text NOT NULL DEFAULT 'under_editorial_verification',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sutra_quote_corpus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id text UNIQUE NOT NULL,
  quote_key text NOT NULL,
  source_text_family text,
  source_title text,
  chapter_section_reference text,
  original_text_short_excerpt text,
  transliteration text,
  translation_or_paraphrase text,
  context_note text,
  copyright_status_note text,
  source_id text REFERENCES source_authorities(source_id),
  source_locator text,
  verification_status text NOT NULL DEFAULT 'under_editorial_verification',
  editorial_review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reflection_prompt_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reflection_prompt_rule_id text UNIQUE NOT NULL,
  prompt_key text NOT NULL,
  prompt_theme text,
  prompt_template text,
  claim_risk_level text NOT NULL DEFAULT 'low',
  source_dependency_level text,
  editorial_review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_guidance_rule_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_guidance_rule_set_id text UNIQUE NOT NULL,
  rule_set_key text NOT NULL,
  guidance_theme text,
  linked_panchanga_elements text[],
  linked_regional_profile_id text REFERENCES regional_calendar_profiles(regional_profile_id),
  linked_word_id text REFERENCES word_corpus(word_id),
  linked_quote_id text REFERENCES sutra_quote_corpus(quote_id),
  interpretation_note text,
  tone text NOT NULL DEFAULT 'reflective',
  claim_risk_level text NOT NULL DEFAULT 'low',
  safety_note text,
  source_dependency_level text,
  editorial_review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS word_of_day_rotation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rotation_rule_id text UNIQUE NOT NULL,
  rotation_key text NOT NULL,
  word_id text REFERENCES word_corpus(word_id),
  rotation_basis text,
  exclusion_window_days integer,
  source_id text REFERENCES source_authorities(source_id),
  editorial_review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mantra_source_review_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mantra_source_review_id text UNIQUE NOT NULL,
  mantra_key text NOT NULL,
  source_id text REFERENCES source_authorities(source_id),
  mantra_text_devanagari text,
  transliteration text,
  meaning_or_context_note text,
  usage_boundary_note text,
  invented_mantra_risk boolean NOT NULL DEFAULT true,
  sanskrit_review_status text NOT NULL DEFAULT 'pending_review',
  editorial_review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mantra_candidate_review_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mantra_candidate_id text UNIQUE NOT NULL,
  mantra_key text NOT NULL,
  review_basis text,
  source_id text REFERENCES source_authorities(source_id),
  risk_level text NOT NULL DEFAULT 'under_review',
  reviewer_note text,
  public_use_allowed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS personalization_scoring_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personalization_rule_id text UNIQUE NOT NULL,
  rule_key text NOT NULL,
  rule_scope text,
  input_dependency text,
  scoring_note text,
  privacy_sensitivity text NOT NULL DEFAULT 'review_required',
  consent_required boolean NOT NULL DEFAULT true,
  activation_status text NOT NULL DEFAULT 'disabled',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 06. Guidance/reflection rule links and risk controls
-- ============================================================

CREATE TABLE IF NOT EXISTS vedic_guidance_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guidance_rule_id text UNIQUE NOT NULL,
  guidance_rule_key text NOT NULL,
  guidance_theme text,
  linked_panchanga_elements text[],
  linked_regional_profile_id text REFERENCES regional_calendar_profiles(regional_profile_id),
  linked_word_id text REFERENCES word_corpus(word_id),
  linked_quote_id text REFERENCES sutra_quote_corpus(quote_id),
  linked_reflection_prompt_id text REFERENCES reflection_prompt_rules(reflection_prompt_rule_id),
  interpretation_note text,
  tone text NOT NULL DEFAULT 'reflective',
  claim_risk_level text NOT NULL DEFAULT 'low',
  safety_note text,
  source_dependency_level text,
  editorial_review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS star_reflection_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  star_reflection_rule_id text UNIQUE NOT NULL,
  star_reflection_rule_key text NOT NULL,
  reflection_basis text,
  linked_nakshatra_id text REFERENCES nakshatra_master(nakshatra_id),
  linked_rashi_id text REFERENCES rashi_master(rashi_id),
  linked_tithi_id text REFERENCES tithi_master(tithi_id),
  linked_panchanga_context text,
  linked_regional_profile_id text REFERENCES regional_calendar_profiles(regional_profile_id),
  reflection_theme text,
  interpretation_boundary text,
  tone text NOT NULL DEFAULT 'reflective',
  claim_risk_level text NOT NULL DEFAULT 'low',
  safety_note text,
  editorial_review_status text NOT NULL DEFAULT 'pending_review',
  public_use_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guidance_context_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guidance_context_link_id text UNIQUE NOT NULL,
  guidance_rule_id text REFERENCES vedic_guidance_rules(guidance_rule_id),
  panchang_daily_record_id text REFERENCES panchang_daily_records(panchang_daily_record_id),
  claim_risk_level text,
  link_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS claim_risk_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_risk_key text UNIQUE NOT NULL,
  claim_risk_level text NOT NULL,
  blocked_public_language text[],
  safety_note text,
  public_use_allowed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 07. Validation, learning and activation audit
-- ============================================================

CREATE TABLE IF NOT EXISTS validation_learning_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  validation_cycle_id text UNIQUE NOT NULL,
  cycle_key text NOT NULL,
  validation_scope text,
  source_reference text,
  reviewer_status text NOT NULL DEFAULT 'pending_review',
  result_summary text,
  public_use_allowed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calculation_variance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variance_record_id text UNIQUE NOT NULL,
  calculation_run_id text REFERENCES panchanga_calculation_runs(calculation_run_id),
  external_reference_label text,
  variance_type text,
  variance_value text,
  variance_note text,
  resolution_status text NOT NULL DEFAULT 'pending_review',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calibration_backlog_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backlog_record_id text UNIQUE NOT NULL,
  backlog_key text NOT NULL,
  related_module text,
  issue_summary text,
  priority text NOT NULL DEFAULT 'normal',
  resolution_status text NOT NULL DEFAULT 'open',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS methodology_activation_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_audit_id text UNIQUE NOT NULL,
  methodology_module text NOT NULL,
  activation_stage text NOT NULL DEFAULT 'methodology_only',
  required_gate text,
  gate_status text NOT NULL DEFAULT 'pending_review',
  runtime_enabled boolean NOT NULL DEFAULT false,
  public_output_enabled boolean NOT NULL DEFAULT false,
  supabase_enabled boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 08. Draft indexes only — review before execution
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_source_authorities_source_id ON source_authorities(source_id);
CREATE INDEX IF NOT EXISTS idx_panchang_daily_records_date_location ON panchang_daily_records(date_key, location_time_profile_id);
CREATE INDEX IF NOT EXISTS idx_panchang_daily_records_public_use ON panchang_daily_records(public_use_allowed, editorial_review_status);
CREATE INDEX IF NOT EXISTS idx_calculation_runs_date_profile ON panchanga_calculation_runs(input_date, calculation_profile_id);
CREATE INDEX IF NOT EXISTS idx_trace_logs_run ON panchanga_calculation_trace_logs(calculation_run_id);
CREATE INDEX IF NOT EXISTS idx_word_corpus_public_use ON word_corpus(public_use_allowed, editorial_review_status);
CREATE INDEX IF NOT EXISTS idx_guidance_rules_public_use ON vedic_guidance_rules(public_use_allowed, editorial_review_status);
CREATE INDEX IF NOT EXISTS idx_festival_observance_public_use ON festival_observance_rule_registry(public_use_allowed, editorial_review_status);

-- End of ADB05 draft.
-- NOT_EXECUTED.
