---
id: smart-health-cabin-mvp-questionnaire-system-architecture
title: "MVP Questionnaire System Architecture"
date: 2026-06-23
topic: smart-health-cabin
type: mvp-spec
status: active
source:
  - ../../source/2026-06-23-expert-mvp-questionnaire-narrowdown-note/source.md
  - ../../source/2026-06-23-expert-questionnaire-authority-note/source.md
  - ../../source/2026-06-23-wu-line-hpa-adult-preventive-health-form/source.md
  - ./hpa-adult-preventive-health-questionnaire-mvp-design-note.md
  - ./module-b-questionnaire-triage-discovery.md
verified_references:
  - HPA adult preventive health service page, checked 2026-06-23
  - WHO STEPS overview and STEPS Instrument v3.2, checked 2026-06-23
  - NIH CDE PHQ-2 page, checked 2026-06-23
  - Taiwan Personal Data Protection Act Article 6 implementation-rule page, checked 2026-06-23
audience:
  - NYCU internal planning
  - imedtac feasibility discussion
  - Smart Health Cabin questionnaire implementation planning
---

# MVP Questionnaire System Architecture

## Scope

The Smart Health Cabin MVP owns an anonymous or semi-anonymous self-service
workflow for public-sector settings where residents voluntarily complete a
simple health measurement and public-health self-assessment while visiting a
government venue.

The MVP is not a hospital health-check system. It does not connect to HIS,
write medical records, issue physician-signed health certificates, produce
diagnoses, place medical orders, or provide treatment recommendations.

The MVP product name should be:

```text
自主健康量測與生活風險自評系統
```

User-facing notice:

```text
本服務提供自主健康量測、生活型態問卷、自我填答摘要與健康促進資訊。結果僅供個人健康管理與衛教參考，不作為疾病診斷、醫療處置、健檢證明、保險核保或醫療紀錄使用。如有不適或量測值持續偏離建議範圍，請洽詢醫療專業人員。
```

Place this notice on the start page, report page, and report footer.

## Evidence Basis

| Source | Evidence used | MVP implication |
| --- | --- | --- |
| HPA adult preventive health service | HPA lists basic-data questionnaire covering disease history, family history, medication history, health behavior, plus physical exam fields including height, weight, blood pressure, BMI, waist, and health consultation items such as smoking cessation, alcohol reduction, betel-nut cessation, weekly 150-minute activity, weight, diet, oral health, chronic-disease risk, and kidney-health literacy. | Use HPA adult preventive health red-box fields as the Taiwan public-sector field backbone. |
| WHO STEPS overview | WHO describes STEPS as a standardized NCD risk-factor surveillance method covering tobacco, alcohol, physical inactivity, unhealthy diet, overweight/obesity, raised blood pressure, raised glucose, and abnormal lipids, with expandable modules. | Use WHO STEPS-lite fields for public-health risk-factor structure. |
| WHO STEPS Instrument v3.2 | The instrument includes tobacco, smokeless tobacco including betel, alcohol, fruit/vegetable and salt questions, physical activity by work/transport/recreation, sedentary behavior, and physical measurements for blood pressure, height, weight, waist, and heart rate. | Adapt only the fields suitable for kiosk self-service and simple measurement. |
| NIH CDE PHQ-2 | PHQ-2 screens for depression risk, is not a final diagnosis or severity monitor, uses a 0-6 score, and positive screens should receive further PHQ-9 or professional evaluation. | Use PHQ-2 as a mood self-assessment with non-diagnostic follow-up wording. |
| Taiwan personal-data implementation-rule page | Medical and health-check data are specially regulated categories in the personal-data framework. | Default to anonymous `session_id`, avoid name, national ID, full address, and hospital-record behavior. |

## Verified Reference URLs

These links were checked on `2026-06-23` and should be re-checked before
external quotation, implementation freeze, or public-sector deployment:

| Reference | URL | Use in this spec |
| --- | --- | --- |
| HPA adult preventive health service | <https://www.hpa.gov.tw/Pages/List.aspx?nodeid=189> | Taiwan field backbone and health-consultation categories. |
| WHO STEPS overview | <https://www.who.int/teams/noncommunicable-diseases/surveillance/systems-tools/steps> | Public-health NCD risk-factor framework and expandable-module model. |
| WHO STEPS Instrument v3.2 | <https://cdn.who.int/media/docs/default-source/ncds/ncd-surveillance/steps/part5.pdf?sfvrsn=c7be3ad6_5> | Adapted tobacco, alcohol, diet, physical-activity, sedentary, and measurement fields. |
| NIH CDE PHQ-2 | <https://cde.nlm.nih.gov/formView?tinyId=XJzVz1TZDe> | PHQ-2 scope, scoring, and non-diagnostic follow-up boundary. |
| Personal Data Protection Act Article 6 implementation note | <https://www.pdpc.gov.tw/News_Content/188/844/> | Privacy posture for medical and health-check data categories. |

## Architecture

| Component | Responsibility | MVP rule |
| --- | --- | --- |
| `Kiosk Frontend` | Touch UI for notice, questionnaire, measurement guidance, report preview, and QR download. | Choice-first, large touch targets, no free-text unless conditionally needed. |
| `Questionnaire Engine` | Versioned question rendering, skip logic, requiredness, locale, and source metadata. | Every field carries `field_id`, `source_instrument`, `field_class`, `requiredness`, and `report_behavior`. |
| `Measurement Adapter` | Captures height, weight, waist, pulse, blood pressure, vision, and hearing values or status from supported equipment. | Every measurement records `device_id`, `kiosk_id`, `measured_at`, `measurement_status`, and unit. |
| `NonDiagnosticRuleEngine` | Calculates BMI, activity minutes, PHQ-2 score, and non-diagnostic notices. | Output uses `notice_level` and `follow_up_suggestion`; never `diagnosis` or `disease_result`. |
| `Report Generator` | Creates measurement summary, answer summary, health-promotion reminders, and confirmation suggestions. | Report language says "本次量測值", "建議留意", and "建議洽專業人員確認". |
| `Admin CMS` | Manages questionnaire versions, fields, sources, field status, facility, device list, and health-promotion copy. | MVP CMS can be source registry plus version table; full generic form builder is phase 2. |
| `Data Store / Audit Log` | Stores sessions, answers, measurements, report events, and version history. | Preserve historical wording and option labels for every completed report. |

## Field Metadata Standard

Each question or measurement uses this metadata:

| Key | Meaning |
| --- | --- |
| `field_id` | Stable machine key. |
| `display_text_zh_tw` | User-facing Traditional Chinese question text. |
| `field_class` | `notice`, `user_intake`, `public_health_question`, `mental_health_screen`, `measured_value`, `computed_value`, `staff_only_disabled`, `not_mvp`. |
| `source_instrument` | `HPA_AdultPreventive_1140101`, `WHO_STEPS_v3_2_adapted`, `PHQ2`, `Local_ServiceNotice`, or `Local_KioskMeasurement`. |
| `response_type` | `single_choice`, `multi_choice`, `number`, `text`, `computed`, `measurement_status`. |
| `requiredness` | `required`, `optional`, or `conditional`. |
| `skip_logic` | Condition for display. |
| `report_behavior` | `show_summary`, `show_measurement`, `show_notice_only`, `do_not_show`, or `staff_only`. |

## 0. Service Notice And Data Handling

| field_id | display_text_zh_tw | response_type | options | requiredness | source_instrument | report_behavior |
| --- | --- | --- | --- | --- | --- | --- |
| `service_notice_ack` | 我了解本服務僅提供自主健康量測與健康促進資訊，不是醫療診斷、健檢證明或醫療處置。 | `single_choice` | `agree_start`: 我了解並開始; `exit`: 離開 | `required` | `Local_ServiceNotice` | `show_notice_only` |
| `data_mode` | 您希望本次資料如何處理？ | `single_choice` | `anonymous_session`: 僅產生本次匿名報告; `local_qr_download`: 產生 QR code 供我自行下載; `optional_contact`: 我願意留下聯絡方式接收報告 | `required` | `Local_ServiceNotice` | `show_notice_only` |
| `contact_method` | 若您選擇接收報告，請選擇方式。 | `single_choice` | `none`: 不留; `mobile`: 手機; `email`: Email | `conditional` | `Local_ServiceNotice` | `do_not_show` |
| `contact_value` | 聯絡方式 | `text` | free text | `conditional` | `Local_ServiceNotice` | `do_not_show` |

MVP default is `anonymous_session`. `optional_contact` requires a separate
consent, retention period, and deletion path before deployment.

## 1. Minimal Demographics

| field_id | display_text_zh_tw | response_type | options | requiredness | source_instrument |
| --- | --- | --- | --- | --- | --- |
| `age_years` | 請問您的年齡？ | `number` | 0-120; `prefer_not`: 不願回答 | `optional` | `HPA_AdultPreventive_1140101` |
| `sex_registered` | 請問您的出生登記性別？ | `single_choice` | `male`: 男; `female`: 女; `prefer_not`: 不願回答 | `optional` | `HPA_AdultPreventive_1140101` |
| `indigenous_status` | 請問您是否具原住民身分？ | `single_choice` | `yes`: 是; `no`: 否; `prefer_not`: 不願回答 | `optional` | `HPA_AdultPreventive_1140101` |
| `residence_city_district` | 請問您目前主要居住地？ | `single_choice` or `region_picker` | 縣市＋行政區; `prefer_not`: 不願回答 | `optional` | `HPA_AdultPreventive_1140101` |
| `education_level` | 請問您的教育程度？ | `single_choice` | `none`: 無; `elementary`: 小學; `junior_high`: 國中／初中; `senior_high_vocational`: 高中職; `college_university`: 專科／大學; `graduate`: 研究所以上; `prefer_not`: 不願回答 | `optional` | `HPA_AdultPreventive_1140101` |

MVP excludes `national_id`, `name`, complete current address, and complete
registered address. A self-service public venue does not need these identifiers
for a one-time summary report.

## 2. Personal Medical History

Use the wording "曾由醫師或醫療專業人員告知" so the system records known
history rather than asking residents to diagnose themselves.

| field_id | display_text_zh_tw | response_type | options | requiredness | source_instrument |
| --- | --- | --- | --- | --- | --- |
| `personal_medical_history` | 請勾選您曾由醫師或醫療專業人員告知，或目前正在追蹤的情形。 | `multi_choice` | `hypertension`: 高血壓; `diabetes`: 糖尿病; `hyperlipidemia`: 高血脂症; `heart_disease`: 心臟病; `stroke`: 腦中風; `kidney_disease`: 腎臟病; `hepatitis_b`: B 型肝炎; `hepatitis_c`: C 型肝炎; `mental_illness`: 精神疾病; `polio`: 小兒麻痺; `cancer`: 癌症; `other`: 其他; `none`: 以上均無; `unknown`: 不確定; `prefer_not`: 不願回答 | `optional` | `HPA_AdultPreventive_1140101` |
| `personal_medical_history_other_text` | 其他疾病史 | `text` | free text | `conditional` when `other` selected | `HPA_AdultPreventive_1140101` |

## 3. Long-Term Medication

| field_id | display_text_zh_tw | response_type | options | requiredness | source_instrument |
| --- | --- | --- | --- | --- | --- |
| `long_term_medication_status` | 請問您目前是否有固定長期服藥？例如連續使用三個月以上，或醫師長期開立處方。 | `single_choice` | `no`: 無; `yes`: 有; `unknown`: 不確定; `prefer_not`: 不願回答 | `optional` | `HPA_AdultPreventive_1140101` |
| `long_term_medication_reason` | 若有，主要是因為什麼原因服藥？ | `multi_choice` | `blood_pressure`: 血壓; `blood_sugar`: 血糖; `blood_lipid`: 血脂; `heart`: 心臟或血管; `kidney`: 腎臟; `liver`: 肝臟; `mental_health`: 情緒／睡眠／精神健康; `pain`: 疼痛; `other`: 其他; `unknown`: 不確定 | `conditional` when medication status is `yes` | `HPA_AdultPreventive_1140101` |
| `long_term_medication_other_text` | 其他服藥原因 | `text` | free text | `conditional` when `other` selected | `HPA_AdultPreventive_1140101` |

MVP does not collect medication names. Medication names belong to a higher
governance tier and can make the service look like medical intake.

## 4. Family History

| field_id | display_text_zh_tw | response_type | options | requiredness | source_instrument |
| --- | --- | --- | --- | --- | --- |
| `family_history` | 請勾選您的父母、兄弟姊妹、子女是否曾有下列情形。 | `multi_choice` | `hypertension`: 高血壓; `diabetes`: 糖尿病; `dyslipidemia`: 血脂異常; `heart_disease`: 心臟病; `stroke`: 腦中風; `mental_illness`: 精神疾病; `cancer`: 癌症; `other`: 其他; `none`: 以上均無; `unknown`: 不確定; `prefer_not`: 不願回答 | `optional` | `HPA_AdultPreventive_1140101` |
| `family_cancer_type` | 若有癌症家族史，請選擇癌症類型。 | `text` | free text in MVP | `conditional` when `cancer` selected | `HPA_AdultPreventive_1140101` |
| `family_history_other_text` | 其他家族史 | `text` | free text | `conditional` when `other` selected | `HPA_AdultPreventive_1140101` |

## 5. Tobacco Use

This module preserves the HPA six-month framing and adapts WHO STEPS tobacco
items for current use, daily use, amount, quit attempt, and secondhand smoke.

| field_id | display_text_zh_tw | response_type | options | requiredness | source_instrument |
| --- | --- | --- | --- | --- | --- |
| `smoking_status_recent_6_months` | 最近半年來，您吸菸的情形是？ | `single_choice` | `none`: 不吸菸; `social_only`: 朋友敬菸或應酬才吸菸; `up_to_one_pack_per_day`: 平均一天約一包菸含以下; `more_than_one_pack_per_day`: 平均一天約一包菸以上; `prefer_not`: 不願回答 | `optional` | `HPA_AdultPreventive_1140101` |
| `current_tobacco_use` | 請問您目前是否使用任何菸草產品？例如紙菸、雪茄、菸斗、加熱菸或其他菸草產品。 | `single_choice` | `yes`: 是; `no`: 否; `unknown`: 不確定; `prefer_not`: 不願回答 | `optional` | `WHO_STEPS_v3_2_adapted` |
| `daily_tobacco_use` | 若目前有使用，請問是否每天使用？ | `single_choice` | `yes`: 是; `no`: 否; `not_applicable`: 不適用 | `conditional` when current use is `yes` | `WHO_STEPS_v3_2_adapted` |
| `tobacco_amount_per_day` | 若每天使用，平均每天約幾支或幾次？ | `number` | number plus unit: `cigarettes`, `sessions`, `other` | `conditional` when daily use is `yes` | `WHO_STEPS_v3_2_adapted` |
| `tobacco_amount_per_week` | 若不是每天使用，平均每週約幾支或幾次？ | `number` | number plus unit: `cigarettes`, `sessions`, `other` | `conditional` when current use is `yes` and daily use is `no` | `WHO_STEPS_v3_2_adapted` |
| `quit_attempt_12m` | 過去 12 個月，您是否曾嘗試停止使用菸草產品？ | `single_choice` | `yes`: 是; `no`: 否; `not_applicable`: 不適用; `prefer_not`: 不願回答 | `optional` | `WHO_STEPS_v3_2_adapted` |
| `secondhand_smoke_home_30d` | 過去 30 天，您在家中是否曾聞到或接觸他人吸菸的煙霧？ | `single_choice` | `yes`: 是; `no`: 否; `unknown`: 不確定; `prefer_not`: 不願回答 | `optional` | `WHO_STEPS_v3_2_adapted` |

## 6. Alcohol Use

This module keeps alcohol wording as frequency and amount summary. It does not
label alcohol-use disorder.

| field_id | display_text_zh_tw | response_type | options | requiredness | source_instrument |
| --- | --- | --- | --- | --- | --- |
| `drinking_status_recent_6_months` | 最近半年來，您喝酒的情形是？ | `single_choice` | `none`: 不喝酒; `occasional_social`: 偶爾喝酒或應酬才喝; `frequent`: 經常喝酒; `prefer_not`: 不願回答 | `optional` | `HPA_AdultPreventive_1140101` |
| `alcohol_ever` | 您是否曾喝過含酒精飲品？ | `single_choice` | `yes`: 是; `no`: 否; `prefer_not`: 不願回答 | `optional` | `WHO_STEPS_v3_2_adapted` |
| `alcohol_12m_frequency` | 過去 12 個月，您多久喝一次含酒精飲品？ | `single_choice` | `daily`: 每天; `5_6_days_week`: 每週 5-6 天; `3_4_days_week`: 每週 3-4 天; `1_2_days_week`: 每週 1-2 天; `1_3_days_month`: 每月 1-3 天; `less_than_monthly`: 少於每月一次; `never_12m`: 過去 12 個月未喝; `prefer_not`: 不願回答 | `conditional` when alcohol ever is `yes` | `WHO_STEPS_v3_2_adapted` |
| `alcohol_30d_any` | 過去 30 天，您是否有喝過含酒精飲品？ | `single_choice` | `yes`: 是; `no`: 否; `prefer_not`: 不願回答 | `conditional` when alcohol ever is `yes` | `WHO_STEPS_v3_2_adapted` |
| `alcohol_30d_occasions` | 過去 30 天，您大約有幾次喝酒？ | `number` | number; `unknown`: 不確定; `prefer_not`: 不願回答 | `conditional` when alcohol 30d any is `yes` | `WHO_STEPS_v3_2_adapted` |
| `alcohol_avg_standard_drinks` | 過去 30 天，喝酒時平均一次約喝幾個標準杯？ | `number` | number with local standard-drink showcard | `conditional` when alcohol 30d any is `yes` | `WHO_STEPS_v3_2_adapted` |
| `alcohol_max_standard_drinks` | 過去 30 天，單次最多約喝幾個標準杯？ | `number` | number; `unknown`: 不確定 | `conditional` when alcohol 30d any is `yes` | `WHO_STEPS_v3_2_adapted` |
| `alcohol_6plus_30d_times` | 過去 30 天，單次喝到 6 個標準杯以上大約幾次？ | `number` | number; `unknown`: 不確定 | `conditional` when alcohol 30d any is `yes` | `WHO_STEPS_v3_2_adapted` |

The UI must include a local standard-drink showcard. Without a showcard,
standard-cup answers are unreliable.

## 7. Betel Nut And Smokeless Tobacco

WHO STEPS includes smokeless tobacco examples such as betel; Taiwan deployment
should expose betel nut as its own culturally relevant module.

| field_id | display_text_zh_tw | response_type | options | requiredness | source_instrument |
| --- | --- | --- | --- | --- | --- |
| `betel_nut_status_recent_6_months` | 最近半年來，您嚼檳榔的情形是？ | `single_choice` | `none`: 不嚼檳榔; `occasional_social`: 偶爾會嚼或應酬才嚼; `frequent_habitual`: 經常嚼或習慣在嚼; `prefer_not`: 不願回答 | `optional` | `HPA_AdultPreventive_1140101` |
| `current_betel_or_smokeless_tobacco` | 請問您目前是否使用檳榔或其他無煙菸草產品？ | `single_choice` | `yes`: 是; `no`: 否; `unknown`: 不確定; `prefer_not`: 不願回答 | `optional` | `WHO_STEPS_v3_2_adapted` |
| `daily_betel_use` | 若目前有使用，是否每天使用？ | `single_choice` | `yes`: 是; `no`: 否; `not_applicable`: 不適用 | `conditional` when current betel or smokeless tobacco is `yes` | `WHO_STEPS_v3_2_adapted` |
| `betel_amount_per_day_or_week` | 平均每天或每週約幾顆／幾次？ | `number` | number plus unit | `conditional` when current betel or smokeless tobacco is `yes` | `WHO_STEPS_v3_2_adapted` |

## 8. Physical Activity

The MVP keeps the HPA 150-minute weekly activity anchor and adapts WHO STEPS
physical-activity domains for a short public-health summary.

| field_id | display_text_zh_tw | response_type | options | requiredness | source_instrument |
| --- | --- | --- | --- | --- | --- |
| `exercise_recent_2_weeks_150_minutes_per_week` | 最近二週，您是否有運動或身體活動達每週 150 分鐘以上？ | `single_choice` | `none`: 沒有; `some_below_150`: 有，但未達每週 150 分鐘; `at_least_150`: 有，且每週達 150 分鐘以上; `unknown`: 不確定 | `optional` | `HPA_AdultPreventive_1140101` |
| `vigorous_activity_days_week` | 一般一週中，您有幾天會做讓呼吸或心跳明顯增加的劇烈活動？例如跑步、快速爬坡、搬重物。 | `number` | 0-7 days | `optional` | `WHO_STEPS_v3_2_adapted` |
| `vigorous_activity_minutes_day` | 有做劇烈活動的日子，平均一天約幾分鐘？ | `number` | minutes | `conditional` when vigorous days > 0 | `WHO_STEPS_v3_2_adapted` |
| `moderate_activity_days_week` | 一般一週中，您有幾天會做讓呼吸或心跳稍微增加的中等強度活動？例如快走、騎腳踏車、家務或園藝。 | `number` | 0-7 days | `optional` | `WHO_STEPS_v3_2_adapted` |
| `moderate_activity_minutes_day` | 有做中等強度活動的日子，平均一天約幾分鐘？ | `number` | minutes | `conditional` when moderate days > 0 | `WHO_STEPS_v3_2_adapted` |
| `active_transport_days_week` | 一般一週中，您有幾天會步行或騎腳踏車作為交通方式？ | `number` | 0-7 days | `optional` | `WHO_STEPS_v3_2_adapted` |
| `active_transport_minutes_day` | 有步行或騎腳踏車交通的日子，平均一天約幾分鐘？ | `number` | minutes | `conditional` when active transport days > 0 | `WHO_STEPS_v3_2_adapted` |
| `sedentary_hours_day` | 一般一天中，您坐著或躺著但沒有睡覺的時間大約多久？ | `number` | hours and minutes; `unknown`: 不確定 | `optional` | `WHO_STEPS_v3_2_adapted` |

Computed summary:

```text
weekly_activity_minutes =
  moderate_activity_days_week * moderate_activity_minutes_day
  + active_transport_days_week * active_transport_minutes_day
  + 2 * vigorous_activity_days_week * vigorous_activity_minutes_day
```

Report wording should say "本週身體活動量估計" rather than a hard diagnosis-like
pass/fail label.

## 9. Diet

The MVP uses WHO STEPS-lite fruit, vegetable, and salt behavior fields, plus a
local sugar-sweetened beverage field for health-promotion use.

| field_id | display_text_zh_tw | response_type | options | requiredness | source_instrument |
| --- | --- | --- | --- | --- | --- |
| `fruit_days_week` | 一般一週中，您有幾天會吃水果？ | `number` | 0-7 days; `unknown`: 不確定 | `optional` | `WHO_STEPS_v3_2_adapted` |
| `fruit_servings_day` | 有吃水果的日子，平均一天約幾份水果？ | `number` | servings with showcard | `conditional` when fruit days > 0 | `WHO_STEPS_v3_2_adapted` |
| `vegetable_days_week` | 一般一週中，您有幾天會吃蔬菜？ | `number` | 0-7 days; `unknown`: 不確定 | `optional` | `WHO_STEPS_v3_2_adapted` |
| `vegetable_servings_day` | 有吃蔬菜的日子，平均一天約幾份蔬菜？ | `number` | servings with showcard | `conditional` when vegetable days > 0 | `WHO_STEPS_v3_2_adapted` |
| `add_salt_or_salty_sauce_frequency` | 您是否常在吃飯前或吃飯時，再加鹽、醬油、醬料或其他鹹味調味料？ | `single_choice` | `always`: 總是; `often`: 經常; `sometimes`: 有時; `rarely`: 很少; `never`: 從不; `unknown`: 不確定 | `optional` | `WHO_STEPS_v3_2_adapted` |
| `high_salt_processed_food_frequency` | 您是否常吃高鹽加工食品？例如醃漬品、罐頭、加工肉品、泡麵、鹹零食、速食等。 | `single_choice` | `always`: 總是; `often`: 經常; `sometimes`: 有時; `rarely`: 很少; `never`: 從不; `unknown`: 不確定 | `optional` | `WHO_STEPS_v3_2_adapted` |
| `sugary_drink_frequency` | 您是否常喝含糖飲料？ | `single_choice` | `daily`: 每天; `several_per_week`: 每週數次; `several_per_month`: 每月數次; `rarely`: 很少; `never`: 從不; `unknown`: 不確定 | `optional` | `HPA_AdultPreventive_1140101` |

Fruit and vegetable serving questions need local serving-size showcards.

## 10. Cough Over Two Weeks

| field_id | display_text_zh_tw | response_type | options | requiredness | source_instrument | skip_logic |
| --- | --- | --- | --- | --- | --- | --- |
| `cough_over_2_weeks` | 您是否出現咳嗽超過二週的情形？ | `single_choice` | `no`: 沒有; `yes`: 有; `unknown`: 不確定 | `optional` | `HPA_AdultPreventive_1140101` | always |
| `cough_notice_ack` | 若有咳嗽超過二週，系統將提醒您可洽詢醫療專業人員進一步確認。 | `single_choice` | `acknowledged`: 我了解 | `conditional` | `HPA_AdultPreventive_1140101` | show when `cough_over_2_weeks=yes` |

## 11. PHQ-2 Mood Self-Assessment

Use the standard 0-3 frequency scale for the two PHQ-2 items. This keeps better
signal than yes/no while preserving a short MVP.

| field_id | display_text_zh_tw | response_type | options | requiredness | source_instrument | report_behavior |
| --- | --- | --- | --- | --- | --- | --- |
| `phq2_interest` | 過去兩週，您有多常因「做事情提不起興趣或感受不到樂趣」而困擾？ | `single_choice` | `0`: 完全沒有; `1`: 好幾天; `2`: 超過一半天數; `3`: 幾乎每天 | `optional` | `PHQ2` | `show_summary` |
| `phq2_mood` | 過去兩週，您有多常因「情緒低落、沮喪或覺得沒有希望」而困擾？ | `single_choice` | `0`: 完全沒有; `1`: 好幾天; `2`: 超過一半天數; `3`: 幾乎每天 | `optional` | `PHQ2` | `show_summary` |
| `phq2_total_score` | PHQ-2 總分 | `computed` | 0-6 | `computed` | `PHQ2` | `do_not_show_raw_score_by_default` |
| `phq2_followup_notice` | 若分數較高，系統提醒：這不是診斷，建議與可信任的人、健康中心人員或醫療／心理衛生專業人員討論。 | `computed` | text | `computed` | `PHQ2` | `show_notice_only` |

Report wording:

```text
您在情緒自評中填寫了較多困擾，建議留意近期壓力與睡眠，必要時可洽詢專業資源。本結果不是診斷。
```

Do not write "疑似憂鬱症".

## 12. Basic Measurements

| field_id | display_text_zh_tw | response_type | unit/options | requiredness | source_instrument |
| --- | --- | --- | --- | --- | --- |
| `height_cm` | 身高 | `number` | cm | `optional` | `HPA_AdultPreventive_1140101`; `WHO_STEPS_v3_2_adapted` |
| `weight_kg` | 體重 | `number` | kg | `optional` | `HPA_AdultPreventive_1140101`; `WHO_STEPS_v3_2_adapted` |
| `bmi` | BMI | `computed` | kg/m2 | `computed` | `Local_KioskMeasurement` |
| `waist_cm` | 腰圍 | `number` | cm | `optional` | `HPA_AdultPreventive_1140101`; `WHO_STEPS_v3_2_adapted` |
| `pulse_per_min` | 脈搏 | `number` | beats/min | `optional` | `WHO_STEPS_v3_2_adapted` |
| `bp_cuff_size` | 血壓袖帶尺寸 | `single_choice` | `small`: 小; `medium`: 中; `large`: 大; `unknown`: 未記錄 | `optional` | `WHO_STEPS_v3_2_adapted` |
| `bp_systolic_1` | 第一次收縮壓 | `number` | mmHg | `optional` | `HPA_AdultPreventive_1140101`; `WHO_STEPS_v3_2_adapted` |
| `bp_diastolic_1` | 第一次舒張壓 | `number` | mmHg | `optional` | `HPA_AdultPreventive_1140101`; `WHO_STEPS_v3_2_adapted` |
| `bp_systolic_2` | 第二次收縮壓 | `number` | mmHg | `optional` | `WHO_STEPS_v3_2_adapted` |
| `bp_diastolic_2` | 第二次舒張壓 | `number` | mmHg | `optional` | `WHO_STEPS_v3_2_adapted` |
| `bp_systolic_3` | 第三次收縮壓 | `number` | mmHg | `optional` | `WHO_STEPS_v3_2_adapted` |
| `bp_diastolic_3` | 第三次舒張壓 | `number` | mmHg | `optional` | `WHO_STEPS_v3_2_adapted` |
| `measurement_posture` | 血壓量測姿勢 | `single_choice` | `seated`: 坐姿; `standing`: 站姿; `unknown`: 未記錄 | `optional` | `Local_KioskMeasurement` |
| `measurement_status` | 量測狀態 | `measurement_status` | `completed`: 完成; `user_skipped`: 使用者略過; `device_error`: 設備錯誤; `unable_to_complete`: 無法完成 | `required` | `Local_KioskMeasurement` |

Report wording for blood pressure:

```text
本次量測血壓為 ___ / ___ mmHg。血壓容易受休息、咖啡因、運動、情緒、量測姿勢影響；若多次量測仍偏高或偏低，建議洽詢醫療專業人員。
```

## 13. Vision Measurement

| field_id | display_text_zh_tw | response_type | options/unit | requiredness | source_instrument |
| --- | --- | --- | --- | --- | --- |
| `uses_glasses_or_contacts` | 您目前是否配戴眼鏡或隱形眼鏡？ | `single_choice` | `no`: 否; `yes_glasses`: 是，眼鏡; `yes_contacts`: 是，隱形眼鏡; `other`: 其他 | `optional` | `HPA_AdultPreventive_1140101` |
| `right_eye_uncorrected_visual_acuity` | 右眼裸眼視力 | `number` | acuity; `not_tested`; `unable` | `optional` | `HPA_AdultPreventive_1140101` |
| `left_eye_uncorrected_visual_acuity` | 左眼裸眼視力 | `number` | acuity; `not_tested`; `unable` | `optional` | `HPA_AdultPreventive_1140101` |
| `right_eye_corrected_visual_acuity` | 右眼矯正視力 | `number` | acuity; `not_tested`; `unable` | `conditional` if using correction | `HPA_AdultPreventive_1140101` |
| `left_eye_corrected_visual_acuity` | 左眼矯正視力 | `number` | acuity; `not_tested`; `unable` | `conditional` if using correction | `HPA_AdultPreventive_1140101` |
| `vision_test_distance` | 視力量測距離 | `number` | meters | `required_if_tested` | `Local_KioskMeasurement` |
| `vision_measurement_status` | 視力量測狀態 | `measurement_status` | `completed`: 完成; `skipped`: 略過; `unable_to_complete`: 無法完成; `device_error`: 設備錯誤 | `required` | `Local_KioskMeasurement` |

Report wording should say "本次視力量測結果". Do not write "近視",
"弱視", or "白內障".

## 14. Hearing Self-Report And Simple Measurement

The MVP can include self-report and simple equipment status. It should not call
the result formal audiometry or hearing diagnosis.

| field_id | display_text_zh_tw | response_type | options/unit | requiredness | source_instrument |
| --- | --- | --- | --- | --- | --- |
| `hearing_aid_use` | 您目前是否使用助聽器？ | `single_choice` | `yes`: 是; `no`: 否; `prefer_not`: 不願回答 | `optional` | `HPA_AdultPreventive_1140101` |
| `hearing_difficulty_self_report` | 平常與人交談時，您是否覺得聽不清楚或需要請對方重複？ | `single_choice` | `none`: 沒有; `mild`: 偶爾; `moderate`: 經常; `severe`: 明顯困難; `unknown`: 不確定 | `optional` | `Local_KioskMeasurement` |
| `right_ear_screen_result` | 右耳簡易聽力測試結果 | `single_choice` | `heard_test_tones`: 可聽見測試音; `needs_retest_or_followup`: 建議重新測試或洽專業確認; `unable_to_complete`: 無法完成; `not_tested`: 未測 | `optional` | `Local_KioskMeasurement` |
| `left_ear_screen_result` | 左耳簡易聽力測試結果 | `single_choice` | `heard_test_tones`: 可聽見測試音; `needs_retest_or_followup`: 建議重新測試或洽專業確認; `unable_to_complete`: 無法完成; `not_tested`: 未測 | `optional` | `Local_KioskMeasurement` |
| `hearing_test_environment_noise` | 測試環境噪音 | `number` | dB if available | `optional` | `Local_KioskMeasurement` |
| `hearing_measurement_status` | 聽力量測狀態 | `measurement_status` | `completed`: 完成; `skipped`: 略過; `device_error`: 設備錯誤; `environment_too_noisy`: 環境過吵; `unable_to_complete`: 無法完成 | `required` | `Local_KioskMeasurement` |

## Staff-Only Or Not-MVP Fields

These HPA red-box or form-adjacent fields should not appear in the resident
self-service MVP.

| Source field | MVP status | Reason |
| --- | --- | --- |
| `national_id` 身分證字號 | `not_mvp` | Anonymous self-service does not need it. |
| `name` 姓名 | `not_mvp` | Avoid turning the service into a named health-check database. |
| Complete current address | `not_mvp` | City/district is enough for public-health statistics. |
| `lymph_node_enlargement` 淋巴腺腫大 | `staff_only_disabled` | Requires physical examination. |
| `thyroid_enlargement` 甲狀腺腫大 | `staff_only_disabled` | Requires physical examination. |
| Chest, cardiac auscultation, respiratory auscultation | `staff_only_disabled` | Requires clinical examination skill and equipment. |
| Abdomen, limbs, other physical-exam abnormality | `staff_only_disabled` | Not reliable as resident self-report. |
| Urine, glucose, lipids, liver/kidney function, hepatitis B/C lab fields | `not_mvp` | Requires specimen, lab workflow, and formal examination process. |
| Physician signature, institution code | `not_mvp` | MVP is not a hospital system and does not issue formal health-check results. |

## Report Output

The report has four sections.

| Section | Content | Wording rule |
| --- | --- | --- |
| 本次量測值 | height, weight, BMI, waist, blood pressure, pulse, vision, hearing simple result. | Present values and measurement context. |
| 自評摘要 | history, medication, family history, tobacco, alcohol, betel, activity, diet, cough, PHQ-2. | Present answers as self-reported information. |
| 健康促進提醒 | smoking cessation, alcohol reduction, betel-nut cessation, regular activity, diet, weight management, oral health, mood support. | Use source-backed health-promotion language. |
| 建議確認事項 | repeat measurement, consult staff or healthcare professional, use mental-health resources when needed. | Do not state diagnosis. |

Allowed sentence patterns:

- `本次血壓量測值建議您休息後再次確認。`
- `您填寫有咳嗽超過二週，建議洽詢醫療專業人員進一步確認。`
- `您的情緒自評顯示近期困擾較多，這不是診斷，建議與專業人員或心理衛生資源討論。`
- `本報告不作為醫療診斷、醫療處置、保險、就業或正式健康檢查證明。`

Disallowed sentence patterns:

- `你有高血壓。`
- `你有憂鬱症。`
- `你罹患代謝症候群。`
- `本結果已寫入病歷。`
- `本系統已完成醫師診斷。`

## Minimum Data Tables

### `questionnaire_session`

| Column | Meaning |
| --- | --- |
| `session_id` | UUID, not national ID. |
| `kiosk_id` | Facility device. |
| `started_at` | Session start time. |
| `completed_at` | Session completion time. |
| `data_mode` | anonymous / QR / optional contact. |
| `questionnaire_version` | Version used. |
| `report_generated` | Whether a report was generated. |

### `questionnaire_answer`

| Column | Meaning |
| --- | --- |
| `session_id` | Linked session. |
| `field_id` | Stable field key. |
| `answer_value` | Stored answer code or value. |
| `answer_label` | User-facing label shown at the time. |
| `source_instrument` | HPA / WHO STEPS / PHQ-2 / local. |
| `answered_at` | Answer timestamp. |

### `measurement_result`

| Column | Meaning |
| --- | --- |
| `session_id` | Linked session. |
| `measurement_type` | height / weight / bp / vision / hearing. |
| `value` | Numeric value or coded result. |
| `unit` | cm / kg / mmHg / acuity / dB. |
| `device_id` | Device ID. |
| `measurement_status` | completed / skipped / device_error / unable_to_complete. |
| `measured_at` | Measurement timestamp. |

### `report_summary`

| Column | Meaning |
| --- | --- |
| `session_id` | Linked session. |
| `summary_json` | Report content. |
| `rule_version` | Rule version. |
| `generated_at` | Report generation time. |
| `qr_token_expiry` | QR code expiration time. |

## MVP Build Order

1. Anonymous session, service notice, QR download report.
2. Minimal demographics: age, sex, residence district, education level.
3. Personal history, long-term medication status, and family history.
4. Tobacco, alcohol, betel nut, activity, and cough fields.
5. WHO STEPS-lite fruit, vegetable, salt, physical activity, and sedentary
   behavior fields.
6. PHQ-2 standard frequency scale.
7. Height, weight, BMI, waist, blood pressure, pulse, vision, and simple hearing
   measurement.
8. Non-diagnostic summary report.

Phase 2 can add older-adult modules, fall risk, SARC-F, oral-health self-report,
social needs, health literacy, multilingual UI, and Avatar voice interaction.

The core rule remains: the questionnaire is extensible, while the MVP does not
touch HIS, orders, medical records, physician signature, formal diagnosis, or
hospital integration.
