-- ADB14 SEED INSERTION PACKAGE
-- APPROVED_FOR_MANUAL_OPERATOR_EXECUTION
-- SOURCE: ADB12 validated seed draft packs + ADB13 validation
-- SCOPE: seed data insertion only
-- STILL_BLOCKED: runtime calculation, backend/Auth activation, RLS public policy activation, deployment, service-role exposure
-- Execute manually in Supabase SQL Editor only after confirming the correct Drishvara Phase-I project.

DO $adb14_seed_insert$
DECLARE
  seed_rows jsonb := '[
  {
    "pack_id": "ADB12-SP01",
    "pack_name": "Source Authority Seed Draft Pack",
    "table": "source_confidence_register",
    "row": {
      "confidence_key": "classical_primary",
      "confidence_label": "Classical primary",
      "public_use_allowed": false,
      "notes": "Requires source locator and review before public use."
    }
  },
  {
    "pack_id": "ADB12-SP01",
    "pack_name": "Source Authority Seed Draft Pack",
    "table": "source_confidence_register",
    "row": {
      "confidence_key": "traditional_regional",
      "confidence_label": "Traditional regional",
      "public_use_allowed": false,
      "notes": "Used where regional practice differs."
    }
  },
  {
    "pack_id": "ADB12-SP01",
    "pack_name": "Source Authority Seed Draft Pack",
    "table": "source_confidence_register",
    "row": {
      "confidence_key": "methodology_influence",
      "confidence_label": "Methodology influence",
      "public_use_allowed": false,
      "notes": "Influence record only; not a direct textual citation."
    }
  },
  {
    "pack_id": "ADB12-SP01",
    "pack_name": "Source Authority Seed Draft Pack",
    "table": "source_confidence_register",
    "row": {
      "confidence_key": "under_review",
      "confidence_label": "Under review",
      "public_use_allowed": false,
      "notes": "Default state."
    }
  },
  {
    "pack_id": "ADB12-SP01",
    "pack_name": "Source Authority Seed Draft Pack",
    "table": "editorial_review_status",
    "row": {
      "review_status_key": "pending_review",
      "review_status_label": "Pending review",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP01",
    "pack_name": "Source Authority Seed Draft Pack",
    "table": "editorial_review_status",
    "row": {
      "review_status_key": "source_verified",
      "review_status_label": "Source verified",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP01",
    "pack_name": "Source Authority Seed Draft Pack",
    "table": "editorial_review_status",
    "row": {
      "review_status_key": "editorial_approved",
      "review_status_label": "Editorial approved",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP01",
    "pack_name": "Source Authority Seed Draft Pack",
    "table": "editorial_review_status",
    "row": {
      "review_status_key": "public_ready",
      "review_status_label": "Public ready",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP01",
    "pack_name": "Source Authority Seed Draft Pack",
    "table": "source_authorities",
    "row": {
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "source_title": "Classical Panchanga Calculation Basis",
      "source_type": "methodology_basis",
      "author_or_institution": "Classical Jyotisha/Panchanga tradition",
      "tradition_or_region": "Bharat / classical Panchanga",
      "source_confidence_band": "classical_primary",
      "verification_status": "under_editorial_verification",
      "editorial_review_status": "pending_review",
      "public_use_allowed": false,
      "notes": "Draft authority record for calculation methodology; exact source locator to be reviewed."
    }
  },
  {
    "pack_id": "ADB12-SP01",
    "pack_name": "Source Authority Seed Draft Pack",
    "table": "source_authorities",
    "row": {
      "source_id": "SRC-NITYANAND-MISHRA-STYLE-DISCIPLINE",
      "source_title": "Nityanand Mishra Ji-aligned Sanskrit and Source Discipline",
      "source_type": "methodology_influence",
      "author_or_institution": "Nityanand Mishra Ji — influence/context only",
      "tradition_or_region": "Sanskrit/source-discipline orientation",
      "source_confidence_band": "methodology_influence",
      "verification_status": "under_editorial_verification",
      "editorial_review_status": "pending_review",
      "public_use_allowed": false,
      "notes": "Not a direct claim or quote; records the intended discipline of source care, Sanskrit accuracy and non-random attribution."
    }
  },
  {
    "pack_id": "ADB12-SP01",
    "pack_name": "Source Authority Seed Draft Pack",
    "table": "source_authorities",
    "row": {
      "source_id": "SRC-REGIONAL-PANCHANGA-PRACTICE",
      "source_title": "Regional Panchanga Practice Register",
      "source_type": "regional_practice_register",
      "author_or_institution": "Regional Panchanga traditions",
      "tradition_or_region": "North India, East India/Bihar/Mithila, South Indian Panchangam",
      "source_confidence_band": "traditional_regional",
      "verification_status": "under_editorial_verification",
      "editorial_review_status": "pending_review",
      "public_use_allowed": false,
      "notes": "Draft umbrella source authority for regional rule variation."
    }
  },
  {
    "pack_id": "ADB12-SP01",
    "pack_name": "Source Authority Seed Draft Pack",
    "table": "methodology_notes",
    "row": {
      "methodology_note_id": "METH-KALA-DRISHTI-DB-FIRST",
      "methodology_module": "AD09/ADB12",
      "methodology_title": "Kala-Drishti Database-first Methodology",
      "method_name": "Kala-Drishti",
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "supported_claim": "Drishvara should compute and store Panchanga/guidance from reviewed internal rule data rather than live internet lookups.",
      "review_status": "pending_review",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP02",
    "pack_name": "Panchanga Master Seed Draft Pack",
    "table": "panchang_element_master",
    "row": {
      "element_id": "EL-TITHI",
      "element_name": "Tithi",
      "element_type": "tithi",
      "definition": "Lunar day based on Moon-Sun angular separation.",
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP02",
    "pack_name": "Panchanga Master Seed Draft Pack",
    "table": "panchang_element_master",
    "row": {
      "element_id": "EL-NAKSHATRA",
      "element_name": "Nakshatra",
      "element_type": "nakshatra",
      "definition": "Lunar mansion based on sidereal Moon longitude.",
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP02",
    "pack_name": "Panchanga Master Seed Draft Pack",
    "table": "panchang_element_master",
    "row": {
      "element_id": "EL-YOGA",
      "element_name": "Yoga",
      "element_type": "yoga",
      "definition": "Element based on combined Sun and Moon longitude.",
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP02",
    "pack_name": "Panchanga Master Seed Draft Pack",
    "table": "panchang_element_master",
    "row": {
      "element_id": "EL-KARANA",
      "element_name": "Karana",
      "element_type": "karana",
      "definition": "Half-tithi division.",
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP02",
    "pack_name": "Panchanga Master Seed Draft Pack",
    "table": "panchang_element_master",
    "row": {
      "element_id": "EL-VARA",
      "element_name": "Vara",
      "element_type": "vara",
      "definition": "Weekday tied to local sunrise basis.",
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP02",
    "pack_name": "Panchanga Master Seed Draft Pack",
    "table": "tithi_master",
    "row": {
      "tithi_id": "TITHI-01-SHUKLA-PRATIPADA",
      "tithi_number": 1,
      "tithi_name": "Shukla Pratipada",
      "paksha": "Shukla",
      "angular_start_degree": 0,
      "angular_end_degree": 12,
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP02",
    "pack_name": "Panchanga Master Seed Draft Pack",
    "table": "tithi_master",
    "row": {
      "tithi_id": "TITHI-15-PURNIMA",
      "tithi_number": 15,
      "tithi_name": "Purnima",
      "paksha": "Shukla",
      "angular_start_degree": 168,
      "angular_end_degree": 180,
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP02",
    "pack_name": "Panchanga Master Seed Draft Pack",
    "table": "tithi_master",
    "row": {
      "tithi_id": "TITHI-30-AMAVASYA",
      "tithi_number": 30,
      "tithi_name": "Amavasya",
      "paksha": "Krishna",
      "angular_start_degree": 348,
      "angular_end_degree": 360,
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP02",
    "pack_name": "Panchanga Master Seed Draft Pack",
    "table": "nakshatra_master",
    "row": {
      "nakshatra_id": "NAK-01-ASHWINI",
      "nakshatra_number": 1,
      "nakshatra_name": "Ashwini",
      "sidereal_start_degree": 0,
      "sidereal_end_degree": 13.333333,
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP02",
    "pack_name": "Panchanga Master Seed Draft Pack",
    "table": "nakshatra_master",
    "row": {
      "nakshatra_id": "NAK-02-BHARANI",
      "nakshatra_number": 2,
      "nakshatra_name": "Bharani",
      "sidereal_start_degree": 13.333333,
      "sidereal_end_degree": 26.666667,
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP02",
    "pack_name": "Panchanga Master Seed Draft Pack",
    "table": "vara_master",
    "row": {
      "vara_id": "VARA-SUNDAY",
      "vara_name": "Ravivara",
      "weekday_index": 0,
      "sunrise_boundary_rule": "local_sunrise_based",
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP02",
    "pack_name": "Panchanga Master Seed Draft Pack",
    "table": "rashi_master",
    "row": {
      "rashi_id": "RASHI-01-MESHA",
      "rashi_number": 1,
      "rashi_name": "Mesha",
      "sidereal_start_degree": 0,
      "sidereal_end_degree": 30,
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP03",
    "pack_name": "Calculation Profile Seed Draft Pack",
    "table": "calculation_methodologies",
    "row": {
      "methodology_id": "METH-KALA-DRISHTI-001",
      "methodology_module": "AD09/M01",
      "methodology_name": "Kala-Drishti Panchanga Methodology",
      "methodology_version": "draft-v1",
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "calculation_scope": "panchanga_elements_and_observance_support",
      "review_status": "pending_review",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP03",
    "pack_name": "Calculation Profile Seed Draft Pack",
    "table": "ephemeris_profiles",
    "row": {
      "ephemeris_profile_id": "EPH-REVIEWED-LIBRARY-CANDIDATE",
      "ephemeris_name": "Reviewed Ephemeris Library Candidate",
      "ephemeris_source": "to_be_finalised_after_validation",
      "library_or_dataset_version": "pending",
      "review_status": "pending_review",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP03",
    "pack_name": "Calculation Profile Seed Draft Pack",
    "table": "ayanamsha_profiles",
    "row": {
      "ayanamsha_profile_id": "AYA-REVIEWED-CANDIDATE",
      "ayanamsha_name": "Reviewed Ayanamsha Candidate",
      "ayanamsha_basis": "to_be_finalised_after_source_and_calculation_validation",
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "review_status": "pending_review",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP03",
    "pack_name": "Calculation Profile Seed Draft Pack",
    "table": "calculation_profiles",
    "row": {
      "calculation_profile_id": "CALC-KALA-DRISHTI-DRAFT-001",
      "profile_name": "Kala-Drishti Draft Calculation Profile",
      "methodology_id": "METH-KALA-DRISHTI-001",
      "ephemeris_profile_id": "EPH-REVIEWED-LIBRARY-CANDIDATE",
      "ayanamsha_profile_id": "AYA-REVIEWED-CANDIDATE",
      "location_time_profile_required": true,
      "interpolation_or_root_finding_method": "to_be_finalised_after_validation",
      "review_status": "pending_review",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP03",
    "pack_name": "Calculation Profile Seed Draft Pack",
    "table": "panchanga_formula_rules",
    "row": {
      "formula_rule_id": "FORMULA-TITHI-MOON-SUN-001",
      "formula_key": "tithi_from_moon_sun_angular_separation",
      "formula_name": "Tithi from Moon-Sun angular separation",
      "element_type": "tithi",
      "formula_expression": "floor(((moon_longitude - sun_longitude) mod 360) / 12) + 1",
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "methodology_id": "METH-KALA-DRISHTI-001",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP03",
    "pack_name": "Calculation Profile Seed Draft Pack",
    "table": "panchanga_formula_rules",
    "row": {
      "formula_rule_id": "FORMULA-NAKSHATRA-MOON-001",
      "formula_key": "nakshatra_from_sidereal_moon_longitude",
      "formula_name": "Nakshatra from sidereal Moon longitude",
      "element_type": "nakshatra",
      "formula_expression": "floor(sidereal_moon_longitude / (360/27)) + 1",
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "methodology_id": "METH-KALA-DRISHTI-001",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP04",
    "pack_name": "Location and Event-window Seed Draft Pack",
    "table": "location_time_profiles",
    "row": {
      "location_time_profile_id": "LOC-INDIA-DEFAULT-REVIEW",
      "location_label": "India default review profile",
      "latitude": 23,
      "longitude": 82,
      "coordinate_precision": "country_context_placeholder",
      "coordinate_source": "review_required",
      "timezone_id": "Asia/Kolkata",
      "timezone_version": "pending",
      "sunrise_basis": "apparent_sunrise_review_required",
      "sunset_basis": "apparent_sunset_review_required",
      "moonrise_basis": "moonrise_review_required",
      "event_window_basis": "location_specific_review_required",
      "review_status": "pending_review",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP05",
    "pack_name": "Festival Vrat Observance Seed Draft Pack",
    "table": "regional_calendar_profiles",
    "row": {
      "regional_profile_id": "REG-NORTH-INDIA-GENERAL-DRAFT",
      "region_or_tradition": "North India general",
      "rule_type": "regional_profile",
      "rule_summary": "Draft regional Panchanga profile for North India.",
      "source_id": "SRC-REGIONAL-PANCHANGA-PRACTICE",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP05",
    "pack_name": "Festival Vrat Observance Seed Draft Pack",
    "table": "regional_calendar_profiles",
    "row": {
      "regional_profile_id": "REG-EAST-BIHAR-MITHILA-DRAFT",
      "region_or_tradition": "East India / Bihar / Mithila",
      "rule_type": "regional_profile",
      "rule_summary": "Draft regional Panchanga profile for East India, Bihar and Mithila contexts.",
      "source_id": "SRC-REGIONAL-PANCHANGA-PRACTICE",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP05",
    "pack_name": "Festival Vrat Observance Seed Draft Pack",
    "table": "regional_calendar_profiles",
    "row": {
      "regional_profile_id": "REG-SOUTH-PANCHANGAM-DRAFT",
      "region_or_tradition": "South Indian Panchangam",
      "rule_type": "regional_profile",
      "rule_summary": "Draft profile for South Indian Panchangam variation tracking.",
      "source_id": "SRC-REGIONAL-PANCHANGA-PRACTICE",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP05",
    "pack_name": "Festival Vrat Observance Seed Draft Pack",
    "table": "tithi_vrat_rule_families",
    "row": {
      "rule_family_id": "VRAT-SUNRISE-TOUCHING",
      "rule_family_key": "sunrise_touching",
      "rule_family_name": "Sunrise-touching tithi rule",
      "event_window_basis": "sunrise",
      "source_id": "SRC-REGIONAL-PANCHANGA-PRACTICE",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP05",
    "pack_name": "Festival Vrat Observance Seed Draft Pack",
    "table": "tithi_vrat_rule_families",
    "row": {
      "rule_family_id": "VRAT-PARANA-RULE",
      "rule_family_key": "parana_fast_breaking",
      "rule_family_name": "Parana fast-breaking rule",
      "event_window_basis": "parana_window",
      "source_id": "SRC-REGIONAL-PANCHANGA-PRACTICE",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP06",
    "pack_name": "Word Sutra Mantra Reflection Seed Draft Pack",
    "table": "word_corpus",
    "row": {
      "word_id": "WORD-DHARMA-DRAFT",
      "word_key": "dharma",
      "word_devanagari": "धर्म",
      "word_iast": "dharma",
      "word_language": "Sanskrit",
      "literal_meaning": "that which upholds / order / duty, context-dependent",
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "verification_status": "under_editorial_verification",
      "editorial_review_status": "pending_review",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP06",
    "pack_name": "Word Sutra Mantra Reflection Seed Draft Pack",
    "table": "word_corpus",
    "row": {
      "word_id": "WORD-PRATIBHA-DRAFT",
      "word_key": "pratibha",
      "word_devanagari": "प्रतिभा",
      "word_iast": "pratibhā",
      "word_language": "Sanskrit",
      "literal_meaning": "insight / radiance / intelligence, context-dependent",
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "verification_status": "under_editorial_verification",
      "editorial_review_status": "pending_review",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP06",
    "pack_name": "Word Sutra Mantra Reflection Seed Draft Pack",
    "table": "reflection_prompt_rules",
    "row": {
      "reflection_prompt_rule_id": "REFLECT-NON-DETERMINISTIC-001",
      "prompt_key": "non_deterministic_daily_reflection",
      "prompt_theme": "self_observation",
      "prompt_template": "Observe the day with steadiness; do not treat guidance as prediction.",
      "claim_risk_level": "low",
      "editorial_review_status": "pending_review",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP06",
    "pack_name": "Word Sutra Mantra Reflection Seed Draft Pack",
    "table": "word_of_day_rotation_rules",
    "row": {
      "rotation_rule_id": "ROT-WORD-DRAFT-001",
      "rotation_key": "draft_word_rotation",
      "word_id": "WORD-DHARMA-DRAFT",
      "rotation_basis": "manual_editorial_rotation",
      "exclusion_window_days": 30,
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP06",
    "pack_name": "Word Sutra Mantra Reflection Seed Draft Pack",
    "table": "mantra_source_review_registry",
    "row": {
      "mantra_source_review_id": "MANTRA-REVIEW-PENDING-001",
      "mantra_key": "review_pending_mantra_placeholder",
      "source_id": "SRC-CLASSICAL-PANCHANGA-BASIS",
      "usage_boundary_note": "No mantra is public until exact source, Sanskrit review and usage boundary are approved.",
      "invented_mantra_risk": true,
      "sanskrit_review_status": "pending_review",
      "editorial_review_status": "pending_review",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP06",
    "pack_name": "Word Sutra Mantra Reflection Seed Draft Pack",
    "table": "claim_risk_register",
    "row": {
      "claim_risk_key": "NO_DETERMINISTIC_PREDICTION",
      "claim_risk_level": "blocked",
      "blocked_public_language": [
        "guaranteed result",
        "certain prediction",
        "fear-based remedy"
      ],
      "safety_note": "Daily guidance and star reflection must remain reflective and non-deterministic.",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP07",
    "pack_name": "Validation Learning Seed Draft Pack",
    "table": "validation_learning_cycles",
    "row": {
      "validation_cycle_id": "VAL-CYCLE-PANCHANGA-BASELINE-001",
      "cycle_key": "panchanga_baseline_validation",
      "validation_scope": "tithi_nakshatra_yoga_karana_sunrise_moonrise",
      "reviewer_status": "pending_review",
      "public_use_allowed": false
    }
  },
  {
    "pack_id": "ADB12-SP07",
    "pack_name": "Validation Learning Seed Draft Pack",
    "table": "calibration_backlog_records",
    "row": {
      "backlog_record_id": "CAL-BACKLOG-EPHEMERIS-001",
      "backlog_key": "ephemeris_candidate_review",
      "related_module": "M01/ADB12",
      "issue_summary": "Select and validate ephemeris source before runtime calculation.",
      "priority": "high",
      "resolution_status": "open"
    }
  },
  {
    "pack_id": "ADB12-SP07",
    "pack_name": "Validation Learning Seed Draft Pack",
    "table": "methodology_activation_audits",
    "row": {
      "activation_audit_id": "ACT-KALA-DRISHTI-RUNTIME-LOCK-001",
      "methodology_module": "Kala-Drishti",
      "activation_stage": "methodology_only",
      "required_gate": "future_runtime_calculation_approval",
      "gate_status": "pending_review",
      "runtime_enabled": false,
      "public_output_enabled": false,
      "supabase_enabled": false
    }
  }
]'::jsonb;
  item jsonb;
  target_table text;
  row_data jsonb;
  column_list text;
  value_list text;
  affected integer := 0;
  processed integer := 0;
  inserted_total integer := 0;
BEGIN
  FOR item IN SELECT value FROM jsonb_array_elements(seed_rows) AS t(value)
  LOOP
    processed := processed + 1;
    target_table := item ->> 'table';
    row_data := item -> 'row';

    IF target_table IS NULL OR row_data IS NULL THEN
      RAISE EXCEPTION 'ADB14 seed row % missing table or row data', processed;
    END IF;

    IF to_regclass(format('public.%I', target_table)) IS NULL THEN
      RAISE EXCEPTION 'ADB14 target table not found in public schema: %', target_table;
    END IF;

    SELECT
      string_agg(format('%I', a.attname), ', ' ORDER BY a.attnum),
      string_agg(
        CASE
          WHEN format_type(a.atttypid, a.atttypmod) IN ('json', 'jsonb')
            THEN format('(%L::jsonb -> %L)::%s', row_data::text, a.attname, format_type(a.atttypid, a.atttypmod))
          WHEN a.attndims > 0
            THEN format('ARRAY(SELECT jsonb_array_elements_text(%L::jsonb -> %L))::%s', row_data::text, a.attname, format_type(a.atttypid, a.atttypmod))
          ELSE
            format('(%L::jsonb ->> %L)::%s', row_data::text, a.attname, format_type(a.atttypid, a.atttypmod))
        END,
        ', ' ORDER BY a.attnum
      )
    INTO column_list, value_list
    FROM pg_attribute a
    JOIN LATERAL jsonb_object_keys(row_data) AS k(key) ON k.key = a.attname
    WHERE a.attrelid = to_regclass(format('public.%I', target_table))
      AND a.attnum > 0
      AND NOT a.attisdropped
      AND a.attgenerated = '';

    IF column_list IS NULL OR value_list IS NULL THEN
      RAISE EXCEPTION 'ADB14 seed row % has no matching columns for table %; row=%', processed, target_table, row_data;
    END IF;

    EXECUTE format(
      'INSERT INTO public.%I (%s) VALUES (%s) ON CONFLICT DO NOTHING',
      target_table,
      column_list,
      value_list
    );

    GET DIAGNOSTICS affected = ROW_COUNT;
    inserted_total := inserted_total + affected;
  END LOOP;

  RAISE NOTICE 'ADB14 seed insertion completed. Processed rows: %, inserted rows after ON CONFLICT DO NOTHING: %', processed, inserted_total;
END
$adb14_seed_insert$;
