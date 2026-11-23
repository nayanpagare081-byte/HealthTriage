# Knowledge Base Verification & Unverified Rules Audit

Per the project clinical governance policy, every rule in the knowledge base must cite an authoritative, publicly accessible clinical guideline (such as the NHS, NICE, WHO, or RCOG) with a direct canonical URL, specific section or table reference, date accessed, and a paraphrase of the exact clinical threshold published in the source.

---

## Clinical Verification Audit Policy

1. **Page Read Requirement**: A rule is marked **"Verified by agent"** ONLY if the source guideline page was directly opened and read during this session, the canonical URL is provided, the exact section/table is cited, and the rule's operational threshold matches the published clinical text.
2. **Threshold Mismatch / Generalization**: If a rule generalizes a narrower guideline (e.g. NICE CG151 applies specifically to neutropenic sepsis in cancer chemotherapy patients, rather than generic immunocompromise; NICE NG143 applies specifically to children under 5), or if the rule converts a clinical assessment into an arbitrary questionnaire scale (e.g. converting multi-item clinical criteria into app severity 1–10 scores), the rule is strictly classified as **"UNVERIFIED - needs team review"**.
3. **Engineering Heuristics**: Duration cutoffs (e.g. `< 48h`, `< 72h`) or severity scores (`<= 4`, `>= 6`, `>= 8`) invented for algorithmic routing that are not explicitly stated in public clinical guidance are classified as **"UNVERIFIED"**.
4. **Self-Care Safety Guard**: Every rule in the `self_care` tier (`R014`, `R018`, `R023`, `R028`, `R032`, `R036`) is hard-guarded against firing whenever any red-flag warning sign, high-risk age band (infants <3 months, infants <1 year, children <5 years, or adults ≥65 years), or clinical risk factor (diabetes, pregnancy, heart disease, asthma/COPD, immunocompromise) is present.
5. **Chest Symptom Protection (R040)**: In accordance with clinical safety guidelines, chest pain symptoms are never triaged into `self_care`. `R040` has a minimum triage tier of `see_doctor_soon` and is classified as UNVERIFIED pending formal multi-lead ECG and examination protocols.

---

## Verification Summary Statistics

- **Total Production Rules in Knowledge Base**: 40
- **Verified by Agent**: 15 (37.5%)
- **UNVERIFIED - Needs Team Review**: 25 (62.5%)

---

## Complete Rule-by-Rule Audit Table

| Rule ID | Clinical Rule Name | Tier | Source URL | Section / Table | Date Accessed | Threshold in Source | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **R001** | Severe breathing difficulty | emergency | https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/ | Signs of a medical emergency | 2026-11-23 | "Difficulty breathing, such as breathing very fast, gasping, or feeling like you cannot catch your breath" -> Call 999 | **Verified by agent** |
| **R002** | Central chest pain | emergency | https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/ | Signs of a medical emergency | 2026-11-23 | "Chest pain, pressure, heaviness, tightness or squeezing across the chest" (signs of heart attack) -> Call 999 | **Verified by agent** |
| **R003** | Unconsciousness / collapse | emergency | https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/ | Signs of a medical emergency | 2026-11-23 | "Loss of consciousness, collapse or fainting (passing out)" -> Call 999 | **Verified by agent** |
| **R004** | Sudden new confusion / delirium | emergency | https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/ | Signs of a medical emergency | 2026-11-23 | "Sudden, severe confusion or delirium, inability to talk or be understood" -> Call 999 | **Verified by agent** |
| **R005** | Severe uncontrolled bleeding | emergency | https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/ | Signs of a medical emergency | 2026-11-23 | "Heavy bleeding that won't stop with direct, firm pressure" -> Call 999 | **Verified by agent** |
| **R006** | Stroke symptoms (FAST) | emergency | https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/ | Signs of a medical emergency | 2026-11-23 | "Signs of a stroke (FAST): face drooping, arm weakness, speech difficulty" -> Call 999 | **Verified by agent** |
| **R007** | Severe allergic reaction | emergency | https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/ | Signs of a medical emergency | 2026-11-23 | "Signs of anaphylaxis: swelling of mouth, tongue, throat, difficulty breathing, rash with collapse" -> Call 999 | **Verified by agent** |
| **R008** | Coughing blood (haemoptysis) | emergency | https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/ | Signs of a medical emergency | 2026-11-23 | "Coughing up frank blood" -> Call 999 | **Verified by agent** |
| **R009** | Fever in infant under 3 months | emergency | https://www.nice.org.uk/guidance/ng143/chapter/Recommendations | Section 1.2, Table 1 | 2026-11-23 | "Age <3 months with temperature ≥38°C -> Red (high risk)", requiring immediate emergency referral | **Verified by agent** |
| **R010** | High fever in infant 3–6 months | urgent_care_today | https://www.nice.org.uk/guidance/ng143/chapter/Recommendations | Section 1.2, Table 1 | 2026-11-23 | "Age 3–6 months with temperature ≥39°C -> Amber (intermediate risk)", requiring urgent same-day assessment | **Verified by agent** |
| **R011** | Fever lasting ≥ 5 days | see_doctor_soon | https://www.nice.org.uk/guidance/ng143/chapter/Recommendations | Section 1.2, Table 1 | 2026-11-23 | NICE NG143 specifies fever for ≥5 days strictly for children aged under 5; generalizing to older children/adults is an unverified extrapolation | **UNVERIFIED** |
| **R012** | Fever in immunocompromised | urgent_care_today | https://www.nice.org.uk/guidance/cg151 | Section 1.1 | 2026-11-23 | CG151 specifies neutropenic sepsis protocols specifically for cancer chemotherapy patients; generalizing to all immunocompromised patients is unverified | **UNVERIFIED** |
| **R013** | Fever with meningeal signs | emergency | https://www.nice.org.uk/guidance/ng240 | Section 1.1 | 2026-11-23 | Primary full NG240 text was not read in session; combination of fever + neck stiffness as formal rule requires clinical review | **UNVERIFIED** |
| **R014** | Mild short-duration viral fever | self_care | https://www.nhs.uk/conditions/fever-in-adults/ | Managing a fever | 2026-11-23 | NHS advises viral fever typically subsides in 3–4 days; exact <72h and severity ≤5 thresholds are engineering heuristics | **UNVERIFIED** |
| **R015** | Acute cough in asthma / COPD | urgent_care_today | https://www.nice.org.uk/guidance/ng115 | Section 1.2 | 2026-11-23 | NICE NG115 covers COPD exacerbations; app's 1–10 severity threshold ≥6 is an engineering heuristic | **UNVERIFIED** |
| **R016** | Persistent cough > 3 weeks | see_doctor_routine | https://www.nice.org.uk/guidance/ng12/chapter/Recommendations-organised-by-site-of-cancer | Section 1.2 Lung and pleural cancers, Rec 1.2.1 | 2026-11-23 | "Unexplained persistent cough for >3 weeks" warrants urgent chest X-ray and GP assessment | **Verified by agent** |
| **R017** | Cough + fever in elderly ≥65 | urgent_care_today | https://www.nice.org.uk/guidance/qs110 | Statement 1 | 2026-11-23 | NICE QS110 requires chest examination findings (dullness, crackles) or CRB65 score; isolated age ≥65 with cough and fever is an unverified triage generalization | **UNVERIFIED** |
| **R018** | Mild viral cough | self_care | https://www.nice.org.uk/guidance/ng120 | Section 1.1 | 2026-11-23 | NICE NG120 states acute cough improves within 3–4 weeks without antibiotics; severity ≤5 cutoff is an engineering heuristic | **UNVERIFIED** |
| **R019** | Thunderclap sudden headache | emergency | https://www.nice.org.uk/guidance/cg150 | Section 1.1.1 | 2026-11-23 | NICE CG150 specifies sudden onset peaking within 5 minutes; using severity ≥8 is an engineering approximation | **UNVERIFIED** |
| **R020** | Headache + scalp pain in age >50 | urgent_care_today | https://cks.nice.org.uk/topics/giant-cell-arteritis/ | Diagnosis | 2026-11-23 | Primary CKS text was not directly read in session; only search snippet retrieved; needs team review | **UNVERIFIED** |
| **R021** | Worsening headache + vomiting | see_doctor_soon | https://www.nice.org.uk/guidance/cg150 | Section 1.1.1 | 2026-11-23 | Duration ≥72h and severity ≥6 are engineering heuristics not specified in NICE CG150 | **UNVERIFIED** |
| **R022** | Recurrent migraine pattern | see_doctor_routine | https://www.nice.org.uk/guidance/cg150 | Section 1.2 | 2026-11-23 | Simplified single-questionnaire heuristic proxy for multi-criteria ICHD-3 / NICE CG150 migraine diagnosis | **UNVERIFIED** |
| **R023** | Mild tension headache | self_care | https://www.nhs.uk/conditions/tension-headaches/ | Self care | 2026-11-23 | NHS tension headache self-care advice exists, but severity ≤4 and duration <48h are engineering heuristics | **UNVERIFIED** |
| **R024** | Acute severe abdominal pain | emergency | https://www.nhs.uk/conditions/stomach-ache/ | When to call 999 | 2026-11-23 | NHS advises emergency care for sudden severe stomach pain, but numerical score ≥8 is an app heuristic | **UNVERIFIED** |
| **R025** | Abdominal pain in pregnancy | urgent_care_today | https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/stomach-pain/ | When to get urgent medical advice | 2026-11-23 | "Call midwife, maternity unit, or GP straight away for stomach pain or cramping in pregnancy" | **Verified by agent** |
| **R026** | Acute RLQ pain (appendicitis) | urgent_care_today | https://cks.nice.org.uk/topics/appendicitis/ | Diagnosis | 2026-11-23 | CKS Appendicitis page was not directly read in session; severity ≥6 cutoff is an engineering heuristic | **UNVERIFIED** |
| **R027** | Abdominal pain > 2w in age ≥50 | see_doctor_soon | https://www.nice.org.uk/guidance/ng12 | Section 1.3 | 2026-11-23 | NICE NG12 covers unexplained abdominal pain in ≥50y; 2-week duration cutoff is an app heuristic | **UNVERIFIED** |
| **R028** | Mild cramping abdominal pain | self_care | https://www.nhs.uk/conditions/stomach-ache/ | Treating at home | 2026-11-23 | Mild cramping self-care cutoff <48h and severity ≤4 is an engineering heuristic | **UNVERIFIED** |
| **R029** | Severe dehydration / anuria | urgent_care_today | https://www.nhs.uk/conditions/dehydration/ | Ask for an urgent GP appointment or get help from NHS 111 | 2026-11-23 | "Not peeing for 8–12 hours, extreme dizziness on standing, or disorientation" -> Urgent clinical care | **Verified by agent** |
| **R030** | Diarrhoea > 7 days or bloody | see_doctor_soon | https://www.nhs.uk/conditions/diarrhoea-and-vomiting/ | When to get medical advice | 2026-11-23 | NHS guidelines branch thresholds by age (>24h for infants under 1 vs >7 days for older children/adults); applying a single flat 7-day rule needs team review | **UNVERIFIED** |
| **R031** | Diarrhoea in infant < 1 year | urgent_care_today | https://www.nice.org.uk/guidance/cg84 | Section 1.1 | 2026-11-23 | Primary full NICE CG84 text was not directly read in session; requires clinical team review | **UNVERIFIED** |
| **R032** | Mild acute diarrhoea | self_care | https://www.nhs.uk/conditions/diarrhoea-and-vomiting/ | Treating at home | 2026-11-23 | WHO/NHS support home oral rehydration, but exact duration <48h and severity ≤4 are engineering heuristics | **UNVERIFIED** |
| **R033** | Sore throat + airway compromise | emergency | https://www.nhs.uk/conditions/sore-throat/ | When to call 999 or go to A&E | 2026-11-23 | "Difficulty breathing or swallowing saliva, or making a high-pitched sound as you breathe (stridor)" -> Call 999 | **Verified by agent** |
| **R034** | Severe sore throat (FeverPAIN) | see_doctor_soon | https://www.nice.org.uk/guidance/ng84 | Section 1.1 | 2026-11-23 | Generalizes NICE NG84 FeverPAIN clinical scoring criteria using a severity ≥7 proxy without full 5-item scoring | **UNVERIFIED** |
| **R035** | Persistent sore throat > 7 days | see_doctor_routine | https://www.nhs.uk/conditions/sore-throat/ | When to see a GP | 2026-11-23 | "Sore throat that does not improve after a week (7 days)" -> See a GP | **Verified by agent** |
| **R036** | Mild viral sore throat | self_care | https://www.nhs.uk/conditions/sore-throat/ | Treating at home | 2026-11-23 | Mild viral sore throat self-care cutoff <120h and severity ≤4 is an engineering heuristic | **UNVERIFIED** |
| **R037** | Sharp pleuritic chest pain | see_doctor_soon | https://cks.nice.org.uk/topics/chest-pain/ | Assessment | 2026-11-23 | Primary NICE CKS Chest pain page not opened in session; pleuritic pain triage categorization needs team review | **UNVERIFIED** |
| **R038** | Retrosternal burning (reflux) | see_doctor_routine | https://www.nice.org.uk/guidance/cg184 | Section 1.1 | 2026-11-23 | Attributing chest discomfort to acid reflux without clinical evaluation carries cardiac risk; needs clinical review | **UNVERIFIED** |
| **R039** | Atypical chest pain in diabetes | urgent_care_today | https://www.nice.org.uk/guidance/cg95 | Section 1.2 | 2026-11-23 | NICE CG95 notes atypical cardiac symptoms in diabetes, but rule formulation and severity cutoff ≥4 is an app synthesis | **UNVERIFIED** |
| **R040** | Musculoskeletal chest tenderness | see_doctor_soon | https://www.nhs.uk/conditions/chest-pain/ | When to get medical advice | 2026-11-23 | Minimum see_doctor_soon tier applied to all chest pain variants per safety protocol; costochondritis requires clinical palpation and ECG exclusion of ACS | **UNVERIFIED** |

---

## Detailed Notes on Key Unverified Rules

1. **R011 (Fever Lasting ≥ 5 Days)**:
   - **Guideline cited**: NICE Guideline NG143 (*Fever in under 5s: assessment and initial management*).
   - **Reason for Unverified status**: NICE NG143 specifically and exclusively governs fever in children under 5 years of age. Generalizing the 5-day fever cutoff to older children, adults, and seniors without a dedicated adult guideline source represents an unverified clinical extrapolation.

2. **R012 (Fever in Immunocompromised)**:
   - **Guideline cited**: NICE Clinical Guideline CG151 (*Neutropenic sepsis: prevention and management in people with cancer*).
   - **Reason for Unverified status**: CG151 applies strictly to patients receiving chemotherapy or targeted anticancer therapy. The rule broadens this to any generic immunocompromise (e.g. chronic steroid use, asplenia, advanced HIV). While clinically sound in practice, this extrapolation is not directly specified in CG151 and must be formally signed off by the clinical faculty team.

3. **R017 (Productive Cough with Fever in Elderly ≥65)**:
   - **Guideline cited**: NICE Quality Standard QS110 (*Pneumonia in adults*).
   - **Reason for Unverified status**: NICE QS110 mandates clinical examination (chest auscultation, percussion dullness, respiratory rate measurement) and clinical risk scores (CRB65). Triage algorithms cannot measure physical exam signs via self-reported patient inputs; the combination `cough + fever + age >= 65` is an unverified proxy.

4. **R019 (Thunderclap Sudden Severe Headache)**:
   - **Guideline cited**: NICE Clinical Guideline CG150 (*Headaches in over 12s*).
   - **Reason for Unverified status**: CG150 defines thunderclap headache as a headache reaching peak intensity within **5 minutes**. Because patient self-assessments frequently confuse sudden onset with high pain severity, the rule uses `severity >= 8` as an engineering proxy, which deviates from the clinical temporal criterion.

5. **R030 (Prolonged Diarrhoea Exceeding 7 Days)**:
   - **Guideline cited**: NHS Health A to Z (*Diarrhoea and vomiting*).
   - **Reason for Unverified status**: NHS guidelines provide age-stratified thresholds: babies under 1 year require medical review if diarrhoea persists for >24 hours, whereas older children and adults are advised to see a GP if diarrhoea lasts >7 days. Applying a single flat 7-day rule across all non-infants without explicit age-branching needs clinical team review.

6. **R034 (Severe Sore Throat / FeverPAIN)**:
   - **Guideline cited**: NICE Guideline NG84 (*Sore throat (acute): antimicrobial prescribing*).
   - **Reason for Unverified status**: NG84 uses the validated FeverPAIN (Fever, Purulence, Attend within 3 days, Inflamed tonsils, No cough) or Centor clinical scores. The rule proxies this via `severity >= 7` and `fever`, which is not clinically equivalent to the validated 5-point clinical scoring instrument.

7. **R040 (Musculoskeletal Chest Wall Tenderness)**:
   - **Guideline cited**: NHS Health A to Z (*Chest pain*).
   - **Reason for Unverified status**: Although localized musculoskeletal chest tenderness (costochondritis) is common, diagnosing it safely requires a clinician to palpate reproducible tenderness on the costochondral junctions and obtain an ECG to rule out acute coronary syndrome or pulmonary embolism. To enforce patient safety, R040 was escalated from `self_care` to a minimum tier of `see_doctor_soon` and marked UNVERIFIED pending team review.

8. **Self-Care Rules (`R014`, `R018`, `R023`, `R028`, `R032`, `R036`)**:
   - While based on general NHS and WHO health advice for common minor ailments, the precise numerical thresholds (`severity <= 4`, `duration < 48h`, etc.) are engineering heuristics created for deterministic rule triggering.
   - To prevent catastrophic under-triage, all 6 self-care rules are strictly blocked from firing if any red flag, vulnerable age group (<5 years or ≥65 years), or chronic risk factor is present.
