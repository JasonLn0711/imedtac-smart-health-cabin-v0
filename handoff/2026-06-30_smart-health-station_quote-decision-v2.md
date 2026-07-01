---
id: 2026-06-30-smart-health-station-quote-decision-v2
title: "智慧健康量測站合作案報價決策版 v2"
date: 2026-06-30
meeting_window: 2026-06-30T23:34:19+08:00/2026-07-01T00:20:50+08:00
topic: smart-health-cabin
type: executive-quote-decision
status: superseded
audience:
  - 吳老師
  - Tomi
  - 老闆決策
  - 慧誠智醫回覆準備
source:
  - ../source/2026-06-30-expert-quote-method-update/transcript-corrected.md
  - ../source/2026-06-30-expert-quote-method-update/source.md
  - ../source/2026-07-01-tomi-line-quote-alignment-scheduling/source.md
  - ../source/2026-07-01-expert-backend-integration-quote-revision/source.md
  - ../workstreams/smart-health-cabin/2026-07-01-prof-wu-quote-meeting-deep-analysis.md
supersedes:
  - ./2026-06-30-smart-health-cabin-prof-wu-executive-quote.md
superseded_by:
  - ./2026-07-01_smart-health-station_lease-first_quote-decision-v3.md
---

# 智慧健康量測站合作案報價決策版 v2

> Status: historical draft. The current decision path is
> `2026-07-01_smart-health-station_lease-first_quote-decision-v3.md`, which
> adopts Prof. Wu's `2026-07-01` afternoon lease-first correction: deep-
> cultivation funding likely favors lease procurement, lease protects IP/control
> better than a large build-fee frame, and product strategy should emphasize
> customer connection, upgrade paths, and volume deployment.

## 合作案定位

本案以一套智慧健康量測站首次建置為主要報價框架，交付核心為問卷、Avatar
介面整合、視力自我篩檢、聽力自我篩檢、報告 / QR Code、部署驗收與後續可
授權擴充的軟體主幹。

本版採納 `2026-06-30` 週二晚間與吳老師討論後的設計：先把第一套建置費與
後續每套授權 / 維護 / 小幅客製費拆開，讓北市聯醫首案承擔建置成本，後續
慧誠智醫帶去其他院所時改用可持續的 license 與支援模式。

## 決策摘要

| 決策 | 採納版本 |
| --- | --- |
| 對外主軸 | 一台 / 一套智慧健康量測站首次建置，不再以兩台全包作為主版本。 |
| 對外承接主體 | 不寫 NYCU 直接開發或投標；正式公司主體由 Tomi / 吳老師確認。 |
| 硬體暫估 | 先以 `NTD 400,000/台` 作為保守試算，正式價格等待慧誠智醫提供。 |
| 首次軟體建置費 | 以 `NTD 900,000-1,100,000` 作為 Tomi review 的主要討論範圍。 |
| 後續每套授權 | 先以 `NTD 150,000/套` 作為討論假設，正式模型由 Tomi review。 |
| 成本佐證 | 每個項目補上人數、週數、職能與 `NTD 180,000/人月` 估算邏輯。 |
| 視力 / 聽力 | 保持自我篩檢與健康檢測支援語言，不宣稱醫療器材等級診斷。 |
| Avatar | 以 vendor 介面整合與流程交接為主；license、AI mini PC、正式 HIS 串接另案啟動。 |

## 慧誠前端分工下的智德萬版本

若慧誠智醫承接 UI/UX、Figma、kiosk 前端、前端元件與裝置操作體驗，智德萬的
報價主體可調整為後端與系統整合建置包。智德萬仍負責產品流程規格、
API/data contract、session state machine、問卷後端、Avatar/AI adapter、
視力 / 聽力結果整合、報告 / QR Code、mock server、聯調支援、QA / 驗收、
部署文件與基本資安 / 個資邊界。

此分工下的建議討論區間：

| 版本 | 智德萬後端與整合建置費 | 適用條件 |
| --- | ---: | --- |
| 穩健版 | `NTD 850,000-900,000` 未稅 | 慧誠前端可配合 ICD，但仍需要完整 mock server、2-3 次聯調與較完整 QA。 |
| 可談版 | `NTD 780,000-820,000` 未稅 | API contract 一次鎖定、前端裝置測試由慧誠完整承擔、聯調次數受控。 |
| 底線版 | `NTD 700,000-750,000` 未稅 | 需刪減 scope：固定問卷版本、單一報告格式、有限聯調、單一正式環境。 |

第一個共同交付物應是 ICD（Interface Control Document），先鎖住 user journey、
screen state、OpenAPI / JSON schema、session TTL / idempotency、error code、
data contract、mock API、acceptance script 與 change-control rule，再進入雙方
實作。

## 建議報價版本

### A. 一套首次建置建議版

| 項目 | 金額 | 交付內容 |
| --- | ---: | --- |
| 健康量測站硬體暫估 | `NTD 400,000` | 實際規格與價格由慧誠智醫提供；本欄只作總預算配置試算。 |
| 軟體與系統首次建置 | `NTD 1,100,000` | 四模組、共用資料流程、報告 / QR、部署驗收、人員訓練與交付文件。 |
| **總計** | **`NTD 1,500,000`** | 一套首次建置完整試算。 |

### B. 一套首次建置保守版

| 項目 | 金額 | 交付內容 |
| --- | ---: | --- |
| 健康量測站硬體暫估 | `NTD 400,000` | 同上，正式價格待確認。 |
| 軟體與系統首次建置 | `NTD 900,000` | 問卷、Avatar、報告 / QR 為核心；視力 / 聽力採較精簡自我篩檢。 |
| **總計** | **`NTD 1,300,000`** | 可保留作談判彈性或 scope 精簡版本。 |

### C. 後續院所部署授權版

| 項目 | 討論假設 | 用途 |
| --- | ---: | --- |
| 軟體授權費 | `NTD 150,000/套` | 使用既有系統主幹與模組能力。 |
| 維護費 | 另議 | 依支援期間、SLA、更新頻率與現場支援方式估算。 |
| 小幅客製費 | 另議 | 問卷、報告文字、院所品牌與部署設定調整。 |
| 新模組 / 正式 HIS 整合 | 另案啟動 | 新工作流、醫療器材驗證、正式院內系統串接與資安審查。 |

## 首次建置軟體明細

| 工作包 | 建議版 | 保守版 | 人週佐證 |
| --- | ---: | ---: | --- |
| 需求確認、scope lock、驗收口徑 | `NTD 90,000` | `NTD 50,000` | 2 人 x 1 週，含 PM / SA。 |
| 系統架構、session/data/API contract | `NTD 120,000` | `NTD 80,000` | 1-2 人 x 1-1.5 週，含 SA / backend。 |
| Kiosk 前台、module registry、共用流程 | `NTD 120,000` | `NTD 80,000` | 1-2 人 x 1-1.5 週，含 frontend / integration。 |
| 問卷模組與可調整表單路徑 | `NTD 220,000` | `NTD 170,000` | 2 人 x 2 週，含 SurveyJS、版本、分數、報告映射。 |
| Avatar 介面整合 MVP | `NTD 180,000` | `NTD 140,000` | 2 人 x 1.5-2 週，含 vendor API / iframe / web component 交接。 |
| 報告、QR Code、JSON/API 匯出 | `NTD 150,000` | `NTD 130,000` | 1-2 人 x 1.5 週，含 public report 與資料輸出。 |
| 視力自我篩檢支援 | `NTD 80,000` | `NTD 70,000` | 精簡流程、距離 / 螢幕提示、報告文字。 |
| 聽力自我篩檢支援 | `NTD 80,000` | `NTD 70,000` | 精簡流程、環境 / 設備提示、報告文字。 |
| 部署、測試、驗收腳本、操作文件 | `NTD 60,000` | `NTD 110,000` | 依版本調整測試深度、文件、教育訓練與現場支援。 |
| **合計** | **`NTD 1,100,000`** | **`NTD 900,000`** | 以 `NTD 180,000/人月` 約 `NTD 45,000/人週` 作直觀換算。 |

## 成本依據

### 資訊服務委外人月法

本案以中華民國資訊軟體服務商業同業公會 115 年資訊服務委外經費估算原則作
為人月佐證。第一類資訊服務案參考人月包含專案管理、系統分析設計、軟體開發、
AI 分析、雲地整合與測試等職能。對外文件保留簡明說明即可，不需要放入完整
會計公式。

直觀換算：

```text
NTD 180,000 / 人月
NTD 45,000 / 人週
2 人 x 1 週 ~= NTD 90,000
2 人 x 2 週 ~= NTD 180,000
```

### 公開標案類比法

公開標案可用於說明健康檢測資訊系統、IoT 整合、報告資料流程與驗收支援常
見於百萬級建置，不應把首次建置誤認成單純 app 修改費。低價標案可作為後續
license、小幅客製或既有產品導入的參考，不直接壓低首次建置費。

### 健康量測站硬體類比法

健康量測站包含連網硬體、軟體平台與生理量測設備。本版把 `NTD 400,000/台`
寫成暫估，正式報價階段由慧誠智醫提供規格、成本、售價與供貨責任。

## 另案啟動項目

| 項目 | 啟動條件 |
| --- | --- |
| Avatar vendor license / API 使用費 | vendor 提供正式商業條款後列入。 |
| AI mini PC / GPU box | 確認 Avatar、ASR、TTS 是否需要本地運算後列入。 |
| HIS / EMR 正式雙向串接 | 院方 IT、資料格式、資安審查與驗收流程確認後列入。 |
| 醫療器材等級視力 / 聽力驗證 | 啟動校正、臨床驗證、法規與醫材路徑後列入。 |
| 長期維運 | 依 SLA、支援期間、更新頻率與現場支援方式另估。 |
| 原始碼完整讓渡 | 依 IP、商用範圍、授權年限與移轉條件另議。 |

## Tomi Review 要點

Tomi 需要先確認四件事，才能回覆慧誠智醫：

1. `NTD 900,000-1,100,000` 作為第一套軟體 / 系統建置費是否合理。
2. `NTD 150,000/套` 作為後續授權討論錨點是否太低、合理，或應改成維護費 / revenue share / per-site deployment fee。
3. 對外承接主體應寫智德萬、其他公司主體，或共同合作文字。
4. IP、原始碼、know-how、商用授權與未來院所部署權利應如何寫。
5. 若慧誠承接 UI/UX 與前端，智德萬是否改採 `NTD 800,000-850,000` 未稅的後端
   與系統整合建置包，並以 ICD 作為第一階段共同驗收文件。

## 建議對慧誠智醫說法

```text
這次報價會把第一套建置費與後續院所部署分開。第一套需要完成需求確認、
系統架構、問卷、Avatar 介面、視力 / 聽力自我篩檢、報告 / QR、部署驗收與
操作文件，因此屬於首次建置費。後續若慧誠智醫帶到其他院所，可另談每套
license、維護費與小幅客製費，不會把第一套完整建置成本每次重收。
```

## 進度狀態

Status: `source preserved and quote-decision v2 drafted`.

已完成：

- `2026-06-30` 週二晚間吳老師討論逐字稿已保存。
- v2 採納一套首次建置、公司主體、建置費 / license 拆分、人週估算與 Tomi gate。
- `2026-07-01` expert backend-integration revision 已補入慧誠前端 / 智德萬後端
  與系統整合分工版本。
- Jason / Tomi LINE scheduling source 已保存；Tomi 接受 `2026-07-01 22:00`
  與 Jason、多寶快速討論約 `30` 分鐘。
- 舊版兩台全包決策稿保留為歷史版本，不再作為主建議。

下一步：

- Jason 先把本 v2 交給 Tomi review。
- Tomi / 吳老師確認公司主體、build/license 金額、慧誠前端分工版本與 IP 文字。
- 慧誠智醫提供正式硬體價格、Avatar vendor 介面與商業授權假設。
- 通過 review 後，再產出對慧誠智醫的一頁外部回覆版。
