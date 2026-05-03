# M03 — Festival Rule Registry

Status: Methodology/Governance only  
Phase: M-Methodology  
Depends on: M00, M01, M02  
Runtime impact: None  
Subscriber impact: None  
Public Panchang impact: None  

## 1. Purpose

M03 defines Drishvara’s methodology for a future Festival, Vrat, and Observance Rule Registry.

M03 does not implement live festival dates, public Panchang output, subscriber guidance, Auth, Supabase, payment, external API fetch, or automatic religious recommendation.

## 2. Explicit Exclusions

M03 does not implement live festival calendar, public festival date output, subscriber festival guidance, personalized observance recommendation, Auth, Supabase, payment, subscription entitlement, external API fetch, automatic festival calculation, automatic religious recommendation, mantra generation, lucky number or colour selection, DOB-based prediction, or fear-based fasting instruction.

## 3. Relationship with Earlier Modules

M03 inherits M00 source doctrine, M00 Sanskrit integrity, M01 Panchang calculation methodology, M01 calculation-basis disclosure, M01 Drik/Thirukanitha, Siddhanta Jyotisha, and Surya Siddhanta anchors, M02 all-tithi coverage, M02 vrat and fasting-day rule families, M02 skipped/repeated tithi conflict doctrine, and M02 regional and sampradaya variant doctrine.

## 4. Registry Doctrine

Every named observance must be represented as a registry entry before it can be used by any future rule engine.

A registry entry must separate display identity, Sanskrit or traditional name, observance category, Panchang rule family, tithi/month/weekday/nakshatra/event-window targets, regional variant, sampradaya variant, source basis, Sanskrit review status, calculation review status, observance rule review status, and public activation status.

## 5. Named Observance Registry Schema

Each future registry entry must include observance_id, display_name, traditional_name, category, rule_family_refs, tithi_target, paksha_target, lunar_month_target, weekday_target, nakshatra_target, event_window_basis, regional_variants, sampradaya_variants, source_level, source_reference, sanskrit_review_status, calculation_review_status, observance_rule_review_status, public_activation_status, and activation_status.

## 6. Registry Categories

### Monthly vrat

Examples include Ekadashi, Pradosh Vrat, Sankashti Chaturthi, Vinayaka Chaturthi, Masik Shivaratri, Masik Durgashtami, Kalashtami, Skanda Sashti, Purnima Vrat, Amavasya observances, Satyanarayana Puja, and Chandra Darshan.

### Annual festival

Examples include Rama Navami, Krishna Janmashtami, Ganesha Chaturthi, Durga Ashtami, Maha Shivaratri, Holika Dahan, Diwali / Deepavali, Guru Purnima, Raksha Bandhan, Nag Panchami, Ratha Saptami, Akshaya Tritiya, Ananta Chaturdashi, Karwa Chauth, Ahoi Ashtami, Vat Savitri, and Mahalaya Amavasya.

### Solar transition / Sankranti

M03 supports the Sankranti category for solar-ingress based observances such as Mesha Sankranti and Makara Sankranti.

### Parana-linked observance

M03 supports Parana-linked observances such as Ekadashi Parana, Dwadashi Parana, and sampradaya-specific Ekadashi Parana variants.

### Regional or sampradaya observance

M03 supports regional and sampradaya observances such as Smarta Ekadashi, Vaishnava Ekadashi, Tamil calendar observances, Bengali calendar observances, Odia calendar observances, Assamese calendar observances, Nepali calendar observances, temple-specific observances, and other reviewed local traditions.

## 7. Rule Family Mapping

Named observances must map to one or more M02 rule families.

Ekadashi maps to tithi_paksha and parana_fast_breaking. Pradosh Vrat maps to sunset_pradosh_overlap. Sankashti Chaturthi maps to moonrise_overlap. Purnima Vrat maps to tithi_only. Masik Shivaratri maps to tithi_paksha. Sankranti maps to solar_transition_sankranti. Karwa Chauth maps to lunar_month_tithi and moonrise_overlap. Regional and sampradaya observances map to their relevant variant families.

## 8. Source and Sanskrit Requirements

Every registry entry must carry source status, source level under M00, source reference, Sanskrit or traditional name review status, commentary note where applicable, regional tradition note, sampradaya note, and human reviewer status.

Sanskrit terms must not be invented. If the Sanskrit name is not verified, the field must remain pending.

## 9. Regional and Sampradaya Variant Doctrine

M03 must not assume one universal festival date for every tradition.

Registry entries must support default rule family, regional override, sampradaya override, temple-specific note, family-tradition note, and human review flag.

## 10. Conflict Handling Doctrine

A named observance registry entry must support skipped tithi conflict, repeated tithi conflict, sunrise-boundary conflict, sunset/Pradosh-window conflict, moonrise-window conflict, Parana-window conflict, regional conflict, sampradaya conflict, source conflict, modern ephemeris versus classical reference conflict, and insufficient source evidence.

Public output must remain disabled if conflict status is unresolved.

## 11. Activation Status Doctrine

Each named observance must have a clear activation state: draft, source_review_pending, sanskrit_review_pending, calculation_review_pending, regional_review_pending, sampradaya_review_pending, internal_preview_only, public_ready, or disabled.

M03 entries default to non-public states.

## 12. Safety Doctrine

M03 avoids religious overclaiming.

Allowed future wording: Observed according to the selected rule family and reviewed Panchang basis. Festival observance may vary by region, sampradaya, and local Panchang tradition.

Not allowed: This is the only correct date for everyone. Everyone must fast. Ignoring this observance will cause harm. This rule guarantees divine result.

## 13. M03 Acceptance Criteria

M03 is complete when named observance registry doctrine is documented, registry schema is documented, monthly vrat category is documented, annual festival category is documented, Sankranti/solar transition category is documented, Parana-linked category is documented, regional and sampradaya variant doctrine is documented, conflict handling doctrine is documented, machine-readable M03 registry exists, validation script confirms M03 is methodology-only, and no live runtime, Auth, Supabase, payment, external API fetch, public festival dates, or subscriber output is introduced.

## 14. M03 Status

M03 establishes a named observance registry methodology.

M03 does not implement live calculation or public festival output.
