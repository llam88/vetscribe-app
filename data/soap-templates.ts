export interface SOAPTemplate {
  id: string
  name: string
  category: string
  description: string
  template: {
    subjective: string
    objective: string
    assessment: string
    plan: string
  }
  isCustom?: boolean
  createdAt?: string
  updatedAt?: string
}

export const defaultSOAPTemplates: SOAPTemplate[] = [
  {
    id: 'wellness-dog',
    name: 'Canine Wellness Exam',
    category: 'Wellness',
    description: 'Standard wellness examination template for dogs',
    template: {
      subjective: `Chief Complaint: [CHIEF_COMPLAINT]
History: [PATIENT_NAME] is a [AGE] year old [BREED] [SPECIES] presenting for routine wellness examination. Owner reports [CURRENT_CONDITION]. 
Appetite: [APPETITE_STATUS]
Water consumption: [WATER_INTAKE]
Urination/Defecation: [ELIMINATION_STATUS]
Activity level: [ACTIVITY_LEVEL]
Current medications: [CURRENT_MEDICATIONS]`,
      
      objective: `Physical Examination:
Temperature: [TEMP]°F  |  Heart Rate: [HR] bpm  |  Respiratory Rate: [RR] rpm
Weight: [WEIGHT] lbs  |  BCS: [BODY_CONDITION]/9

General Appearance: [GENERAL_APPEARANCE]
HEENT: [HEAD_EYES_EARS_NOSE_THROAT]
Cardiovascular: [CARDIOVASCULAR_FINDINGS]
Respiratory: [RESPIRATORY_FINDINGS]  
Gastrointestinal: [GI_FINDINGS]
Musculoskeletal: [MSK_FINDINGS]
Neurological: [NEURO_FINDINGS]
Integumentary: [SKIN_FINDINGS]
Lymph Nodes: [LYMPH_NODES]`,

      assessment: `Assessment:
1. [PRIMARY_DIAGNOSIS]
2. [SECONDARY_DIAGNOSIS]
3. [ADDITIONAL_FINDINGS]

Prognosis: [PROGNOSIS]`,

      plan: `Plan:
1. Continue current diet and exercise routine
2. [VACCINATION_RECOMMENDATIONS]
3. [PARASITE_PREVENTION]
4. [DIAGNOSTIC_RECOMMENDATIONS]
5. [TREATMENT_PLAN]
6. Recheck in [RECHECK_INTERVAL]
7. Return immediately if [WARNING_SIGNS]

Client Education: [EDUCATION_PROVIDED]`
    }
  },
  
  {
    id: 'wellness-cat',
    name: 'Feline Wellness Exam',
    category: 'Wellness',
    description: 'Standard wellness examination template for cats',
    template: {
      subjective: `Chief Complaint: [CHIEF_COMPLAINT]
History: [PATIENT_NAME] is a [AGE] year old [BREED] [SPECIES] presenting for routine wellness examination.
Indoor/Outdoor status: [INDOOR_OUTDOOR]
Litter box habits: [LITTER_BOX_STATUS]
Appetite: [APPETITE_STATUS]
Water consumption: [WATER_INTAKE]
Activity level: [ACTIVITY_LEVEL]
Current medications: [CURRENT_MEDICATIONS]`,
      
      objective: `Physical Examination:
Temperature: [TEMP]°F  |  Heart Rate: [HR] bpm  |  Respiratory Rate: [RR] rpm
Weight: [WEIGHT] lbs  |  BCS: [BODY_CONDITION]/9

General Appearance: [GENERAL_APPEARANCE]
HEENT: [HEAD_EYES_EARS_NOSE_THROAT]
Cardiovascular: [CARDIOVASCULAR_FINDINGS]
Respiratory: [RESPIRATORY_FINDINGS]
Gastrointestinal: [GI_FINDINGS]
Musculoskeletal: [MSK_FINDINGS]
Neurological: [NEURO_FINDINGS]
Integumentary: [SKIN_FINDINGS]
Lymph Nodes: [LYMPH_NODES]`,

      assessment: `Assessment:
1. [PRIMARY_DIAGNOSIS]
2. [SECONDARY_DIAGNOSIS]
3. [ADDITIONAL_FINDINGS]

Prognosis: [PROGNOSIS]`,

      plan: `Plan:
1. Continue current diet and exercise routine
2. [VACCINATION_RECOMMENDATIONS]
3. [PARASITE_PREVENTION]
4. [DIAGNOSTIC_RECOMMENDATIONS]
5. [TREATMENT_PLAN]
6. Recheck in [RECHECK_INTERVAL]
7. Return immediately if [WARNING_SIGNS]

Client Education: [EDUCATION_PROVIDED]`
    }
  },

  {
    id: 'dental-procedure',
    name: 'Dental Cleaning/COHAT',
    category: 'Dental',
    description: 'Comprehensive Oral Health Assessment and Treatment template',
    template: {
      subjective: `Chief Complaint: Dental cleaning and oral health assessment
History: [PATIENT_NAME] is a [AGE] year old [BREED] [SPECIES] presenting for dental prophylaxis.
Previous dental work: [PREVIOUS_DENTAL]
Current oral health concerns: [ORAL_CONCERNS]
Appetite changes: [APPETITE_CHANGES]
Halitosis: [HALITOSIS_PRESENT]
Current medications: [CURRENT_MEDICATIONS]`,
      
      objective: `Pre-Anesthetic Assessment:
Temperature: [TEMP]°F  |  Heart Rate: [HR] bpm  |  Respiratory Rate: [RR] rpm
Weight: [WEIGHT] lbs

Pre-anesthetic bloodwork: [BLOODWORK_RESULTS]
Anesthesia protocol: [ANESTHESIA_PROTOCOL]

Dental Examination Under Anesthesia:
Dental grade: [DENTAL_GRADE]/4
Calculus: [CALCULUS_DESCRIPTION]
Gingivitis: [GINGIVITIS_DESCRIPTION]
Periodontal pockets: [POCKET_DEPTHS]
Missing teeth: [MISSING_TEETH]
Mobile teeth: [MOBILE_TEETH]
Fractured teeth: [FRACTURED_TEETH]
Dental radiographs: [RADIOGRAPH_FINDINGS]`,

      assessment: `Assessment:
1. Periodontal disease grade [PERIODONTAL_GRADE]/4
2. [SPECIFIC_DENTAL_PATHOLOGY]
3. [ADDITIONAL_ORAL_FINDINGS]

Prognosis: [DENTAL_PROGNOSIS]`,

      plan: `Treatment Performed:
1. Dental prophylaxis completed
2. [EXTRACTIONS_PERFORMED]
3. [ADDITIONAL_PROCEDURES]

Post-Operative Plan:
1. [PAIN_MANAGEMENT]
2. [ANTIBIOTICS_IF_INDICATED]
3. Soft food for [SOFT_FOOD_DURATION]
4. [HOME_CARE_INSTRUCTIONS]
5. Recheck in [RECHECK_INTERVAL]
6. Return immediately if [POST_OP_WARNINGS]

Home Dental Care: [HOME_CARE_RECOMMENDATIONS]`
    }
  },

  {
    id: 'sick-visit',
    name: 'Sick Visit/Problem-Focused',
    category: 'Medical',
    description: 'Template for illness or specific medical concerns',
    template: {
      subjective: `Chief Complaint: [CHIEF_COMPLAINT]
History of Present Illness: [PATIENT_NAME] is a [AGE] year old [BREED] [SPECIES] presenting with [DURATION] history of [CLINICAL_SIGNS].

Onset: [ONSET_DESCRIPTION]
Duration: [DURATION]
Progression: [PROGRESSION]
Associated signs: [ASSOCIATED_SIGNS]
Previous treatments: [PREVIOUS_TREATMENTS]
Response to treatment: [TREATMENT_RESPONSE]
Current medications: [CURRENT_MEDICATIONS]`,
      
      objective: `Physical Examination:
Temperature: [TEMP]°F  |  Heart Rate: [HR] bpm  |  Respiratory Rate: [RR] rpm
Weight: [WEIGHT] lbs  |  BCS: [BODY_CONDITION]/9

General Appearance: [GENERAL_APPEARANCE]
Attitude: [ATTITUDE]
Hydration: [HYDRATION_STATUS]
Mucous Membranes: [MM_COLOR_CRT]

System-Specific Findings:
[SYSTEM_SPECIFIC_EXAM]

Diagnostic Tests Performed:
[DIAGNOSTICS_PERFORMED]
Results: [DIAGNOSTIC_RESULTS]`,

      assessment: `Assessment:
1. [PRIMARY_DIAGNOSIS] - [CONFIDENCE_LEVEL]
2. [DIFFERENTIAL_DIAGNOSES]
3. [RULE_OUTS]

Prognosis: [PROGNOSIS]`,

      plan: `Treatment Plan:
1. [IMMEDIATE_TREATMENT]
2. [MEDICATIONS_PRESCRIBED]
3. [DIAGNOSTIC_PLAN]
4. [DIETARY_RECOMMENDATIONS]
5. [ACTIVITY_RESTRICTIONS]
6. Recheck in [RECHECK_INTERVAL]
7. Return immediately if [WARNING_SIGNS]

Client Education: [EDUCATION_PROVIDED]
Discharge Instructions: [DISCHARGE_INSTRUCTIONS]`
    }
  },

  {
    id: 'emergency',
    name: 'Emergency/Critical Care',
    category: 'Emergency',
    description: 'Template for emergency and critical care cases',
    template: {
      subjective: `Chief Complaint: [EMERGENCY_COMPLAINT]
History: [PATIENT_NAME] is a [AGE] year old [BREED] [SPECIES] presenting as an emergency for [EMERGENCY_REASON].

Time of onset: [ONSET_TIME]
Witnessed event: [WITNESSED_EVENT]
Previous episodes: [PREVIOUS_EPISODES]
Current medications: [CURRENT_MEDICATIONS]
Toxin exposure: [TOXIN_EXPOSURE]
Trauma history: [TRAUMA_HISTORY]`,
      
      objective: `Triage Assessment:
Triage Level: [TRIAGE_LEVEL]
Temperature: [TEMP]°F  |  Heart Rate: [HR] bpm  |  Respiratory Rate: [RR] rpm
Blood Pressure: [BP] mmHg  |  Weight: [WEIGHT] lbs

Primary Survey:
Airway: [AIRWAY_STATUS]
Breathing: [BREATHING_STATUS]
Circulation: [CIRCULATION_STATUS]
Disability: [NEUROLOGICAL_STATUS]

Secondary Survey:
[DETAILED_PHYSICAL_EXAM]

Diagnostic Tests:
[EMERGENCY_DIAGNOSTICS]
Results: [DIAGNOSTIC_RESULTS]`,

      assessment: `Assessment:
1. [PRIMARY_EMERGENCY_DIAGNOSIS]
2. [SECONDARY_DIAGNOSES]
3. [COMPLICATIONS]

Stability: [PATIENT_STABILITY]
Prognosis: [EMERGENCY_PROGNOSIS]`,

      plan: `Emergency Treatment:
1. [IMMEDIATE_STABILIZATION]
2. [IV_FLUID_THERAPY]
3. [EMERGENCY_MEDICATIONS]
4. [MONITORING_PLAN]
5. [DIAGNOSTIC_PLAN]
6. [SURGICAL_INTERVENTION]

Monitoring:
- [MONITORING_PARAMETERS]
- Recheck every [RECHECK_FREQUENCY]

Discharge Plan: [DISCHARGE_PLAN]
Referral: [REFERRAL_RECOMMENDATIONS]`
    }
  }
]

export const templateCategories = [
  'Wellness',
  'Medical', 
  'Dental',
  'Surgery',
  'Emergency',
  'Specialty',
  'Custom'
] as const

export type TemplateCategory = typeof templateCategories[number]
