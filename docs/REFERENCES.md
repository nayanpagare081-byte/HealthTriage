# Clinical Guidelines & Academic References

This document details the public clinical guidelines and references used to codify the production rules in the **Health Triage Expert System** knowledge base (`backend/app/knowledge_base/rules.py`).

Every rule in the knowledge base is derived from published guidance issued by the National Health Service (NHS, UK), the National Institute for Health and Care Excellence (NICE, UK), the World Health Organization (WHO), and the Royal College of Obstetricians and Gynaecologists (RCOG).

---

## 1. Emergency Red-Flag Guidelines (Rules R001 – R008)

*   **Issuing Body**: National Health Service (NHS England)
*   **Guideline**: *When to call 999: Signs of a Medical Emergency*
*   **Canonical URL**: [https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/](https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**: Identifies immediate life-threatening symptoms requiring emergency ambulance dispatch (999 / 911 / 112) and A&E resuscitation:
    *   `R001`: Severe breathing difficulty (gasping, rapid breathing, unable to speak).
    *   `R002`: Acute central chest pain, pressure, heaviness, or squeezing (suspected myocardial infarction).
    *   `R003`: Loss of consciousness, sudden collapse, or persistent unresponsiveness.
    *   `R004`: Sudden acute confusion, severe delirium, or slurred speech.
    *   `R005`: Severe uncontrolled bleeding unresponsive to firm direct pressure.
    *   `R006`: Acute stroke signs (FAST: Facial drooping, Arm weakness, Speech slurring).
    *   `R007`: Severe allergic reaction / anaphylaxis (angioedema, throat swelling, wheezing, hypotension).
    *   `R008`: Haemoptysis (coughing up significant frank blood).

---

## 2. Fever in Children & Adults (Rules R009 – R014)

*   **Issuing Body**: National Institute for Health and Care Excellence (NICE)
*   **Guideline**: *NICE Guideline NG143: Fever in under 5s: assessment and initial management*
*   **Section**: Section 1.2 "Traffic light system for identifying risk of serious illness", Table 1
*   **Canonical URL**: [https://www.nice.org.uk/guidance/ng143/chapter/Recommendations](https://www.nice.org.uk/guidance/ng143/chapter/Recommendations)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R009`: Red category: Infant under 3 months with temperature $\ge 38.0^\circ\text{C}$ requires immediate referral to emergency pediatric care due to high risk of occult serious bacterial infection.
    *   `R010`: Amber category: Infant aged 3 to 6 months with temperature $\ge 39.0^\circ\text{C}$ requires same-day face-to-face urgent clinical evaluation.
    *   `R011`: Amber category: Fever persisting for $\ge 5$ days (120+ hours) warrants clinical assessment to exclude Kawasaki disease, occult abscess, or atypical infection.

*   **Issuing Body**: National Health Service (NHS England)
*   **Guideline**: *High temperature (fever) in adults*
*   **Canonical URL**: [https://www.nhs.uk/conditions/fever-in-adults/](https://www.nhs.uk/conditions/fever-in-adults/)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R014`: Home management of uncomplicated mild viral fever lasting $<72$ hours using oral antipyretics and hydration.

*   **Issuing Body**: National Institute for Health and Care Excellence (NICE)
*   **Guideline**: *NICE Clinical Guideline CG151: Neutropenic sepsis: prevention and management in people with cancer*
*   **Canonical URL**: [https://www.nice.org.uk/guidance/cg151](https://www.nice.org.uk/guidance/cg151)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R012`: Immediate urgent same-day assessment for suspected neutropenic sepsis in febrile immunocompromised patients.

*   **Issuing Body**: National Institute for Health and Care Excellence (NICE)
*   **Guideline**: *NICE Guideline NG240: Meningitis (bacterial) and meningococcal disease: recognition, diagnosis and management*
*   **Canonical URL**: [https://www.nice.org.uk/guidance/ng240](https://www.nice.org.uk/guidance/ng240)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R013`: Fever combined with neck stiffness, photophobia, or non-blanching purpuric rash.

---

## 3. Respiratory & Cough Guidelines (Rules R015 – R018)

*   **Issuing Body**: National Institute for Health and Care Excellence (NICE)
*   **Guideline**: *NICE Guideline NG12: Suspected cancer: recognition and referral*
*   **Section**: Section 1.2 "Lung and pleural cancers", Recommendation 1.2.1
*   **Canonical URL**: [https://www.nice.org.uk/guidance/ng12/chapter/Recommendations-organised-by-site-of-cancer](https://www.nice.org.uk/guidance/ng12/chapter/Recommendations-organised-by-site-of-cancer)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R016`: Unexplained persistent cough lasting $>3$ weeks ($>504$ hours) requires routine primary care review and urgent chest radiography.

*   **Issuing Body**: National Institute for Health and Care Excellence (NICE)
*   **Guideline**: *NICE Guideline NG115: Chronic obstructive pulmonary disease in over 16s: diagnosis and management*
*   **Canonical URL**: [https://www.nice.org.uk/guidance/ng115](https://www.nice.org.uk/guidance/ng115)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R015`: Acute worsening dyspnoea/cough in asthma or COPD indicating acute exacerbation.

*   **Issuing Body**: National Institute for Health and Care Excellence (NICE)
*   **Guideline**: *NICE Guideline NG120: Cough (acute): antimicrobial prescribing*
*   **Canonical URL**: [https://www.nice.org.uk/guidance/ng120](https://www.nice.org.uk/guidance/ng120)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R018`: Self-limiting nature of acute uncomplicated viral bronchitis (typically lasting 3 to 4 weeks without antibiotics).

*   **Issuing Body**: National Institute for Health and Care Excellence (NICE)
*   **Guideline**: *NICE Quality Standard QS110: Pneumonia in adults*
*   **Canonical URL**: [https://www.nice.org.uk/guidance/qs110](https://www.nice.org.uk/guidance/qs110)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R017`: High index of suspicion for community-acquired pneumonia in adults $\ge 65$ presenting with acute cough and fever.

---

## 4. Headache Guidelines (Rules R019 – R023)

*   **Issuing Body**: National Institute for Health and Care Excellence (NICE)
*   **Guideline**: *NICE Clinical Guideline CG150: Headaches in over 12s: diagnosis and management*
*   **Section**: Section 1.1 "Assessment"
*   **Canonical URL**: [https://www.nice.org.uk/guidance/cg150](https://www.nice.org.uk/guidance/cg150)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R019`: Thunderclap headache peaking within 5 minutes warrants emergency hospital referral for suspected subarachnoid haemorrhage.
    *   `R021`: Persistent worsening headache with nausea or vomiting warrants secondary headache investigation.
    *   `R022`: Episodic throbbing unilateral headache characteristic of migraine suitable for routine primary care management.

*   **Issuing Body**: NICE Clinical Knowledge Summaries (CKS)
*   **Guideline**: *Giant cell arteritis*
*   **Canonical URL**: [https://cks.nice.org.uk/topics/giant-cell-arteritis/](https://cks.nice.org.uk/topics/giant-cell-arteritis/)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R020`: New headache with scalp tenderness or visual changes in adults aged $>50$.

*   **Issuing Body**: National Health Service (NHS England)
*   **Guideline**: *Tension headaches*
*   **Canonical URL**: [https://www.nhs.uk/conditions/tension-headaches/](https://www.nhs.uk/conditions/tension-headaches/)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R023`: Self-care home management of mild tension headaches.

---

## 5. Abdominal Pain Guidelines (Rules R024 – R028)

*   **Issuing Body**: National Health Service (NHS England) & Royal College of Obstetricians and Gynaecologists (RCOG)
*   **Guideline**: *Stomach pain in pregnancy*
*   **Canonical URL**: [https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/stomach-pain/](https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/stomach-pain/)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R025`: Any unexplained stomach pain or cramping in pregnancy warrants urgent same-day obstetric evaluation.

*   **Issuing Body**: National Health Service (NHS England)
*   **Guideline**: *Stomach ache and abdominal pain*
*   **Canonical URL**: [https://www.nhs.uk/conditions/stomach-ache/](https://www.nhs.uk/conditions/stomach-ache/)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R024`: Sudden excruciating abdominal pain requiring emergency A&E referral.
    *   `R028`: Mild transient cramping abdominal discomfort suitable for home self-care.

*   **Issuing Body**: NICE Clinical Knowledge Summaries (CKS)
*   **Guideline**: *Appendicitis*
*   **Canonical URL**: [https://cks.nice.org.uk/topics/appendicitis/](https://cks.nice.org.uk/topics/appendicitis/)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R026`: Acute right lower quadrant abdominal pain with fever or nausea.

*   **Issuing Body**: National Institute for Health and Care Excellence (NICE)
*   **Guideline**: *NICE Guideline NG12: Suspected cancer: recognition and referral*
*   **Canonical URL**: [https://www.nice.org.uk/guidance/ng12](https://www.nice.org.uk/guidance/ng12)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R027`: Persistent unexplained abdominal pain in adults aged $\ge 50$.

---

## 6. Diarrhoea & Dehydration Guidelines (Rules R029 – R032)

*   **Issuing Body**: National Health Service (NHS England)
*   **Guideline**: *Dehydration*
*   **Canonical URL**: [https://www.nhs.uk/conditions/dehydration/](https://www.nhs.uk/conditions/dehydration/)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R029`: Absence of urination for $\ge 8\text{--}12$ hours or postural syncope indicating severe dehydration.

*   **Issuing Body**: National Health Service (NHS England)
*   **Guideline**: *Diarrhoea and vomiting*
*   **Canonical URL**: [https://www.nhs.uk/conditions/diarrhoea-and-vomiting/](https://www.nhs.uk/conditions/diarrhoea-and-vomiting/)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R030`: Diarrhoea lasting $>7$ days or presence of visible blood in stool.
    *   `R032`: Supportive self-care and oral rehydration salts for acute uncomplicated diarrhoea.

*   **Issuing Body**: National Institute for Health and Care Excellence (NICE)
*   **Guideline**: *NICE Clinical Guideline CG84: Diarrhoea and vomiting in children under 5*
*   **Canonical URL**: [https://www.nice.org.uk/guidance/cg84](https://www.nice.org.uk/guidance/cg84)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R031`: High dehydration risk in infants under 1 year with acute gastroenteritis.

---

## 7. Sore Throat Guidelines (Rules R033 – R036)

*   **Issuing Body**: National Health Service (NHS England) & NICE Clinical Knowledge Summaries
*   **Guideline**: *Sore throat: When to call 999*
*   **Canonical URL**: [https://www.nhs.uk/conditions/sore-throat/](https://www.nhs.uk/conditions/sore-throat/)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R033`: Inability to swallow saliva, respiratory distress, or stridor indicates acute epiglottitis or peritonsillar abscess.
    *   `R035`: Sore throat lasting $>10$ days warrants primary care consultation.
    *   `R036`: Supportive home self-care for viral pharyngitis.

*   **Issuing Body**: National Institute for Health and Care Excellence (NICE)
*   **Guideline**: *NICE Guideline NG84: Sore throat (acute): antimicrobial prescribing*
*   **Canonical URL**: [https://www.nice.org.uk/guidance/ng84](https://www.nice.org.uk/guidance/ng84)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R034`: Severe acute sore throat with high fever and absence of cough (FeverPAIN criteria).

---

## 8. Non-Red-Flag Chest Pain Variants (Rules R037 – R040)

*   **Issuing Body**: National Institute for Health and Care Excellence (NICE)
*   **Guideline**: *NICE Clinical Guideline CG95: Recent-onset chest pain of suspected cardiac origin*
*   **Canonical URL**: [https://www.nice.org.uk/guidance/cg95](https://www.nice.org.uk/guidance/cg95)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R039`: Atypical or blunted presentation of cardiac ischaemia in diabetic or elderly individuals.

*   **Issuing Body**: NICE Clinical Knowledge Summaries (CKS)
*   **Guideline**: *Chest pain: assessment and referral*
*   **Canonical URL**: [https://cks.nice.org.uk/topics/chest-pain/](https://cks.nice.org.uk/topics/chest-pain/)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R037`: Pleuritic chest pain aggravated by respiration or coughing.

*   **Issuing Body**: National Institute for Health and Care Excellence (NICE)
*   **Guideline**: *NICE Clinical Guideline CG184: Gastro-oesophageal reflux disease and dyspepsia in adults*
*   **Canonical URL**: [https://www.nice.org.uk/guidance/cg184](https://www.nice.org.uk/guidance/cg184)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R038`: Burning retrosternal discomfort provoked by meals or recumbency.

*   **Issuing Body**: National Health Service (NHS England)
*   **Guideline**: *Chest pain: causes and self-care*
*   **Canonical URL**: [https://www.nhs.uk/conditions/chest-pain/](https://www.nhs.uk/conditions/chest-pain/)
*   **Date Accessed**: 2026-11-23
*   **Clinical Scope**:
    *   `R040`: Musculoskeletal chest wall pain (costochondritis) reproducible on palpation.
