---
id: 2026-06-23-expert-mvp-questionnaire-narrowdown-note
title: "2026-06-23 Expert Narrowdown - MVP Questionnaire System Architecture"
date: 2026-06-23
topic: smart-health-cabin
type: source
status: preserved
source_owner: user-provided
language: zh-TW
related:
  - ../../workstreams/smart-health-cabin/mvp-questionnaire-system-architecture.md
  - ../../workstreams/smart-health-cabin/hpa-adult-preventive-health-questionnaire-mvp-design-note.md
  - ../2026-06-23-expert-questionnaire-authority-note/source.md
  - ../2026-06-23-wu-line-hpa-adult-preventive-health-form/source.md
---

# 2026-06-23 Expert Narrowdown - MVP Questionnaire System Architecture

## Source Boundary

This file preserves the user-provided expert narrowdown for the Smart Health
Cabin MVP questionnaire system. It is a source record for internal planning,
field selection, implementation scoping, source governance, privacy posture,
and non-diagnostic report design.

This source is not an approved legal opinion, clinical validation package,
medical-device claim, production questionnaire release, hospital integration
contract, or permission to use any third-party instrument. The derived
workstream specification should verify current official source pages,
licensing, local language wording, consent, retention, security, and
public-health review gates before deployment.

## Preserved Expert Narrowdown

`MVP 版：國健署成人預防保健紅框欄位＋WHO STEPS core 精簡題＋PHQ-2＋身高體重腰圍血壓視力聽力基本量測。這一版最容易部署，也最不容易被質疑來源。`

請給我有憑有據的問卷系統的架構以及所有問題、選項等等，以一個mvp並且可擴展的思維加以設計。（不要與任何醫院系統對接，因為這是給民眾到公部門洽公時，自由「自主簡易檢測」來使用）

結論：MVP 不要做成「醫院健檢系統」，而要做成「匿名／半匿名的自主健康量測＋公共衛生問卷＋摘要報告系統」。題庫來源建議以三層為主：國健署成人預防保健表單作為台灣欄位骨架、WHO STEPS 作為慢性病風險因子問卷骨架、PHQ-2 作為情緒困擾快速自評。國健署成人預防保健官方服務項目本來就包含疾病史、家族史、服藥史、健康行為、身高、體重、血壓、BMI、腰圍與健康諮詢等欄位；紅框表單也已整理出基本資料、疾病史、長期服藥、家族史、健康行為、憂鬱檢測、身體量測、視力、耳鼻喉口腔等內容。WHO STEPS 則是 WHO 用於非傳染病風險因子監測的標準化方法，涵蓋菸、酒、身體活動、飲食、肥胖、血壓、血糖、血脂，且可透過模組擴充。PHQ-2 可作為情緒困擾初步篩檢，NIH CDE 明確說明 PHQ-2 不是診斷工具，陽性者應再用 PHQ-9 或專業訪談評估。

重要修正：紅框內「淋巴腺腫大、甲狀腺腫大、胸部、心臟聽診、呼吸聽診、腹部、四肢」這些不是民眾自主填答題，而是醫護人員理學檢查欄位。MVP 應該把它們標成 `staff_only_disabled`，不要放到民眾自助問卷裡。否則資料品質低，也容易讓系統看起來像在做醫療檢查。

## MVP System Positioning

產品名稱建議：`自主健康量測與生活風險自評系統`

對外說法：

```text
本服務提供自主健康量測、生活型態問卷、自我填答摘要與健康促進資訊。結果僅供個人健康管理與衛教參考，不作為疾病診斷、醫療處置、健檢證明、保險核保或醫療紀錄使用。如有不適或量測值持續偏離建議範圍，請洽詢醫療專業人員。
```

這一句要放在首頁、報告頁、列印報告底部。

資料設計上，預設匿名。不要收身分證字號、姓名、完整地址。個資法把姓名、出生年月日、身分證字號、聯絡方式、健康檢查等都列為個人資料，且健康檢查資料屬高敏感類型；蒐集處理利用也不得逾越特定目的必要範圍。所以 MVP 最好的設計是：只用 `session_id`，民眾掃 QR code 下載當次報告；若要寄送或保存，才另開「自願留存聯絡方式」流程。

## System Architecture

MVP 架構可以這樣切：

- `Kiosk Frontend`: 民眾端平板／觸控螢幕。負責問卷、量測引導、報告預覽、QR code 下載。
- `Questionnaire Engine`: 題庫引擎。負責題目版本、跳題邏輯、必填規則、多語系、來源標記。每一道題都要有 `source_instrument`，例如 `HPA_AdultPreventive_1140101`、`WHO_STEPS_v3_2_adapted`、`PHQ2`。
- `Measurement Adapter`: 量測資料接收層。接身高、體重、腰圍、血壓、脈搏、視力、聽力設備。每筆量測都要記錄 `device_id`、`kiosk_id`、`measured_at`、`measurement_status`。
- `Non-diagnostic Rule Engine`: 非診斷規則引擎。只做計算與提醒，例如 BMI、運動分鐘數、PHQ-2 分數、是否咳嗽超過兩週。輸出欄位應叫 `notice_level`、`follow_up_suggestion`，不要叫 `diagnosis`、`disease_result`。
- `Report Generator`: 產出簡易摘要報告。分成「本次量測值」、「自評摘要」、「生活型態提醒」、「建議確認事項」。不要出現「正常／異常」二分法，改用「本次量測值」、「建議留意」、「建議洽專業人員確認」。
- `Admin CMS`: 公部門或廠商管理題庫、版本、場域、裝置、衛教文字、匯出統計資料。CMS 只能看去識別化統計，除非民眾明確同意留存個資。
- `Data Store / Audit Log`: 分三類資料表：`session`、`answers`、`measurements`、`report_events`。所有題目與量測都要有版本，否則半年後無法解釋當時報告依據。

## MVP Field Set

The complete MVP field set is preserved in the derived implementation
specification:

```text
../../workstreams/smart-health-cabin/mvp-questionnaire-system-architecture.md
```

The field set covers:

1. service notice and data handling choice;
2. minimal demographics;
3. personal medical history;
4. long-term medication status;
5. family history;
6. tobacco use;
7. alcohol use;
8. betel nut and smokeless tobacco;
9. physical activity;
10. diet;
11. cough over two weeks;
12. PHQ-2 mood screen;
13. height, weight, BMI, waist, pulse, and blood pressure;
14. vision measurement;
15. hearing self-report and simple measurement status;
16. fields disabled from self-service MVP because they require staff or
    clinical examination;
17. report output rules;
18. minimum data tables.
