---
id: 2026-06-23-expert-questionnaire-authority-note
title: "2026-06-23 Expert Opinion - Authoritative Questionnaire Sources For Smart Health Cabin"
date: 2026-06-23
topic: smart-health-cabin
type: source
status: preserved
source_owner: user-provided
language: zh-TW
related:
  - ../../workstreams/smart-health-cabin/hpa-adult-preventive-health-questionnaire-mvp-design-note.md
  - ../../workstreams/smart-health-cabin/module-b-questionnaire-triage-discovery.md
  - ../2026-06-23-wu-line-hpa-adult-preventive-health-form/source.md
---

# 2026-06-23 Expert Opinion - Authoritative Questionnaire Sources For Smart Health Cabin

## Source Boundary

This file preserves the user-provided expert opinion in full for internal
Smart Health Cabin questionnaire planning. It is an expert analysis source for
field selection, source governance, public-health positioning, MVP scoping, and
non-diagnostic report wording.

This source is not itself an approved product requirement, official legal
opinion, clinical validation package, medical-device claim, diagnosis workflow,
or permission to use any third-party questionnaire. Before company-facing
quotation, implementation freeze, public-health publication, or field
deployment, the project should verify the current official source pages,
licensing terms, local authorization requirements, and clinical/public-health
review path.

## Preserved Expert Opinion

如果這些紅匡線內問題都要放在問卷系統裡面，讓民眾在市政府的健康中心等等的地方進行簡易的健康量測服務（提供簡易的健康測量報告，但不是醫療行為，只是提供簡易的數值量測以及說明的摘要報告而已），請問我們有什麼具有公信力的問卷或者醫學會或者公共衛生相關的具有公信力的問卷或表單可以填寫呢？（不限國內、國外）

結論：可以做，而且建議不要自己發明問卷。你們應該把系統設計成「國健署成人預防保健表單作為台灣場域主幹，WHO STEPS 作為國際公共衛生主幹，再依年齡與服務情境加掛標準化模組」。這樣最有公信力，也最容易向市政府、醫療院所、廠商、法遵單位說明。

你這份紅框內容本身已經涵蓋基本資料、疾病史、長期服藥、家族史、吸菸、飲酒、檳榔、運動、咳嗽、憂鬱二題、身高體重血壓腰圍、視力、耳鼻喉口腔與簡易身體檢查等欄位，本質上就是一份成人預防保健前置問卷與基本量測表。國健署官方成人預防保健服務目前也明列服務項目包含基本資料問卷、疾病史、家族史、服藥史、健康行為、身體檢查、實驗室檢查與健康諮詢。([HPA][1])

最推薦的核心架構如下。

| 模組 | 最推薦來源 | 適合放入健康中心問卷系統的理由 |
| --- | --- | --- |
| 台灣成人健檢主表 | 國民健康署成人預防保健服務檢查紀錄結果表單 | 最貼近台灣公部門、衛生局、健康中心語境；可作為欄位主架構 |
| 慢性病與健康行為風險 | WHO STEPS Instrument | WHO 的非傳染病風險因子標準化調查工具，涵蓋菸、酒、飲食、身體活動、肥胖、血壓、血糖、血脂等，和你們健康艙量測邏輯高度吻合。([World Health Organization][2]) |
| 台灣人口健康調查參考 | 國民健康訪問調查 NHIS Taiwan | 國健署與國衛院長期辦理，內容含個人基本資料、健康狀態、健康服務利用、健康行為、健康識能，適合借用問句設計與人口學分類。([HPA][3]) |
| 國際健康行為調查 | CDC BRFSS | 美國 CDC 與各州衛生部門使用的成人健康行為風險調查，核心問卷與模組化設計很適合參考。([CDC][4]) |
| 量測＋問卷整合 | CDC NHANES | NHANES 結合問卷、身體檢查與實驗室檢查，適合參考健康艙「問卷＋量測＋報告」的資料架構。([CDC][5]) |

具體模組建議如下。

第一，吸菸、飲酒、檳榔、運動、飲食，建議以「國健署成人預防保健表單＋WHO STEPS」為主。WHO STEPS 是最適合你們這種市政府健康中心場域的國際主幹，因為它本來就是為國家級公共衛生監測設計，不是單一醫院診斷工具。飲酒可加 AUDIT-C 或 AUDIT；AUDIT 是 WHO 發展的 10 題酒精使用風險工具，AUDIT-C 則適合健康中心做快速前篩。([World Health Organization][6]) 運動量若要正式一點，可用 WHO GPAQ；它是 16 題，涵蓋工作、交通、休閒活動與久坐時間。([World Health Organization][7]) 若用 IPAQ 台灣版，要注意國健署頁面載明需以機關名義申請授權使用。([HPA][8])

第二，憂鬱檢測建議用 PHQ-2 作為第一層，PHQ-2 陽性時才進 PHQ-9。你們表單紅框內的兩題「過去二週情緒低落、沮喪或沒有希望」與「做事情失去興趣或樂趣」，本質上就是 PHQ-2 的核心。USPSTF 建議成人篩檢憂鬱，但也明確指出，篩檢陽性者應有後續評估、診斷確認與轉介照護流程。([USPSTF][9]) PHQ 與 GAD-7 已由 Pfizer 開放無著作權限制、免費使用。([Pfizer][10]) 所以實務上可設計為：「本結果為情緒狀態自評摘要，非診斷；若任一題為是，建議洽健康中心人員或醫療專業人員進一步評估。」

第三，焦慮可選配 GAD-2/GAD-7。若健康中心服務對象主要是一般成人，GAD-2 作為前篩較輕量；若前篩異常，再進 GAD-7。USPSTF 建議 64 歲以下成人可進行焦慮篩檢。([USPSTF][11]) 但心理健康模組一定要有轉介流程，不能只是列出「高風險」後放人離開。

第四，長者模組建議加 WHO ICOPE、CDC STEADI、SARC-F。若市政府健康中心服務很多 65 歲以上民眾，這三個很有價值。WHO ICOPE 用來快速看長者內在能力，包含認知、行動、營養、視力、聽力、憂鬱症狀等。([World Health Organization][12]) CDC STEADI 是跌倒風險工具，適合長者健康中心、社區照護站。([CDC][13]) SARC-F 是 5 題肌少症風險問卷，涵蓋肌力、行走輔助、起身、爬樓梯、跌倒；若你們後續有肌少症、握力、步速、體組成量測，SARC-F 很適合當前置問卷。([Nature][14])

第五，飲食建議不要一開始就做複雜 24 小時飲食回憶。市政府健康中心場域比較適合用「我的餐盤」做簡化飲食衛教與自評，例如蔬菜、水果、乳品、全穀、蛋白質、堅果種子攝取頻率。國健署「我的餐盤」是依台灣每日飲食指南設計，目標是讓民眾容易理解並落實健康飲食。([HPA][15]) 若做研究或大型公共衛生資料庫，再參考國民營養健康調查 NAHSIT。([HPA][16])

第六，社會需求與健康識能可以作為進階模組。若市政府想做公共衛生治理，而不是只做個人體檢，建議加入 PRAPARE 或 CMS AHC-HRSN。PRAPARE 是標準化的社會健康風險評估工具，涵蓋社會需求與健康社會決定因素，且有多語版本。([NACHC][17]) CMS AHC-HRSN 是 10 題健康相關社會需求工具，涵蓋住房、食物、交通、水電與人身安全等面向。([NAM][18]) 這類模組對市政府很有價值，因為它能把個人健康風險連到社福、長照、社區資源。

我會建議你們的產品版本這樣切：

MVP 版：國健署成人預防保健紅框欄位＋WHO STEPS core 精簡題＋PHQ-2＋身高體重腰圍血壓視力聽力基本量測。這一版最容易部署，也最不容易被質疑來源。

市政府健康中心正式版：MVP 加 AUDIT-C、GPAQ 或台灣 IPAQ 授權版、我的餐盤自評、長者 ICOPE/STEADI/SARC-F 條件式模組。

研究／治理版：正式版再加 BRFSS/NHIS 題型、PRAPARE 或 AHC-HRSN、健康識能題組，讓資料可用於公共衛生儀表板與政策評估。

最大的法遵重點是：不要把報告寫成「診斷結果」。系統可以輸出「量測值摘要」、「填答摘要」、「健康行為提醒」、「建議洽健康中心人員或醫療專業人員確認」。避免輸出「你有高血壓」、「你有憂鬱症」、「你罹患代謝症候群」這類診斷式語句。台灣對醫療行為的既有函釋重點在於是否以治療、矯正或預防疾病為目的進行診察、診斷、治療，或基於診察診斷結果給處方、用藥、處置。([法律百科][19]) 所以產品文字、流程、轉介、角色權限要設計清楚。

我會把你們的問卷系統定位成：

「健康量測與公共衛生風險自評系統」，不是「AI 診斷系統」。核心資料來源採國健署成人預防保健表單、WHO STEPS、CDC BRFSS/NHANES；心理、飲酒、長者、肌少症、社會需求以標準化模組條件式加掛。這樣公信力、可維護性、擴充性、法遵安全性都比較好。

[1]: https://www.hpa.gov.tw/Pages/List.aspx?nodeid=189&utm_source=chatgpt.com "衛生福利部國民健康署- 成人預防保健"
[2]: https://www.who.int/teams/noncommunicable-diseases/surveillance/systems-tools/steps?utm_source=chatgpt.com "STEPwise approach to NCD risk factor surveillance (STEPS)"
[3]: https://www.hpa.gov.tw/Pages/List.aspx?nodeid=106&utm_source=chatgpt.com "衛生福利部國民健康署- 國民健康訪問調查"
[4]: https://www.cdc.gov/brfss/questionnaires/index.htm?utm_source=chatgpt.com "BRFSS - Questionnaires"
[5]: https://www.cdc.gov/nchs/nhanes/?CDC_AAref_Val=https&utm_source=chatgpt.com "National Health and Nutrition Examination Survey | CDC"
[6]: https://www.who.int/publications/i/item/WHO-MSD-MSB-01.6a?utm_source=chatgpt.com "AUDIT : the Alcohol Use Disorders Identification Test"
[7]: https://www.who.int/publications/m/item/global-physical-activity-questionnaire?utm_source=chatgpt.com "Global physical activity questionnaire (GPAQ)"
[8]: https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=876&pid=4900&utm_source=chatgpt.com "IPAQ台灣活動量調查短版及長版問卷研究工具使用申請注意 ..."
[9]: https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-depression-suicide-risk-adults "Recommendation: Depression and Suicide Risk in Adults: Screening | United States Preventive Services Taskforce"
[10]: https://www.pfizer.com/news/press-release/press-release-detail/pfizer_to_offer_free_public_access_to_mental_health_assessment_tools_to_improve_diagnosis_and_patient_care?utm_source=chatgpt.com "Pfizer To Offer Free Public Access To Mental Health ..."
[11]: https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/anxiety-adults-screening?utm_source=chatgpt.com "Recommendation: Anxiety Disorders in Adults: Screening"
[12]: https://cdn.who.int/media/docs/default-source/mca-documents/ageing/icope-training-programme/module-7/who-icope_m7_generic-care-pathways_fg.pdf?sfvrsn=4c607046_5&utm_source=chatgpt.com "generic care pathways and screening"
[13]: https://www.cdc.gov/steadi/index.html?utm_source=chatgpt.com "STEADI - Older Adult Fall Prevention"
[14]: https://www.nature.com/articles/s41598-023-39002-y?utm_source=chatgpt.com "Diagnostic performance of SARC-F and SARC-CalF in ..."
[15]: https://www.hpa.gov.tw/Pages/EBook.aspx?nodeid=3821&utm_source=chatgpt.com "衛生福利部國民健康署- 我的餐盤手冊"
[16]: https://www.hpa.gov.tw/Pages/List.aspx?nodeid=3998&utm_source=chatgpt.com "國民營養健康調查(原國民營養健康狀況變遷調查)"
[17]: https://www.nachc.org/resource/prapare/?utm_source=chatgpt.com "PRAPARE"
[18]: https://nam.edu/perspectives/standardized-screening-for-health-related-social-needs-in-clinical-settings-the-accountable-health-communities-screening-tool/?utm_source=chatgpt.com "Standardized Screening for Health-Related Social Needs ..."
[19]: https://www.legis-pedia.com/dictionary/75?utm_source=chatgpt.com "醫療行為"
