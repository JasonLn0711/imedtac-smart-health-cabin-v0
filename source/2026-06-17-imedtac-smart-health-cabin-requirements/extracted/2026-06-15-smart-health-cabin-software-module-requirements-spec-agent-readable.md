---
title: "智慧健康倉軟體模組開發需求說明"
source_file: "智慧健康倉軟體模組開發需求說明_20260615.pdf"
source_document_date_from_filename: "2026-06-15"
pdf_pages: 5
pdf_author_metadata: "Johnny Fang 方偉翰, imedtac Corp."
pdf_creator_metadata: "Microsoft Word"
pdf_created_metadata: "2026-06-17 04:46:03 -07:00"
converted_for: "AI agent reading / requirements extraction / implementation planning"
language: "zh-TW"
conversion_notes:
  - "PDF has extractable text; no OCR was required."
  - "Page images were rendered and visually checked for layout sanity."
  - "Source-derived requirements are separated from inferred engineering notes."
---

# 智慧健康倉軟體模組開發需求說明 - Agent-readable Markdown

## 0. Agent Reading Contract

This file converts the PDF into a Markdown structure that is easier for AI agents, coding agents, PM agents, and requirements-analysis agents to parse.

Interpretation rules:

- `source_requirement`: requirement directly derived from the PDF.
- `source_constraint`: constraint directly derived from the PDF.
- `source_deliverable`: deliverable directly derived from the PDF.
- `tbd`: item explicitly uncertain in the PDF or necessary for implementation but not specified.
- `derived_note`: engineering interpretation added during conversion; not an official source requirement.
- `agent_action`: suggested next action for implementation or clarification.

Do not treat `derived_note` or `agent_action` as contractual unless later confirmed by the project owner.

## 1. Document Metadata

| Field | Value |
|---|---|
| Document title | 智慧健康倉軟體模組開發需求說明 |
| Source file | 智慧健康倉軟體模組開發需求說明_20260615.pdf |
| Source date inferred from filename | 2026-06-15 |
| PDF page count | 5 |
| PDF author metadata | Johnny Fang 方偉翰, imedtac Corp. |
| PDF creator metadata | Microsoft Word |
| PDF creation metadata | 2026-06-17 04:46:03 -07:00 |
| Main project parties mentioned | Imedtac, 國立陽明交通大學團隊, 營運方, 診所 / 門診部 |
| Target deployment context | 台北市門診部 / 智慧健康倉 |

## 2. Executive Summary

本專案目標是開發「智慧健康倉」核心軟體模組，讓台北市民眾在門診部可自主完成基礎量測與初步分流，降低一線醫護負擔，並支援社區預防醫學。

本階段合作重點為國立陽明交通大學團隊與 Imedtac 共同推進下列模組：

1. 自我視力與聽力量測流程。
2. 問卷導診分流系統。
3. 綜合健康報告、QR Code、HIS 串接前置資料結構。
4. 前台 UI/UX、軟體流程、系統開發與後台管理系統相關建置。

核心產品原則是「流程全面數位化」。系統不輸出紙本收據；量測與分流結果需保留與醫院資訊系統 HIS 對接的介面，並在前端提供 QR Code，讓使用者以行動裝置查閱報告。

## 3. Scope

### 3.1 In Scope

| Scope ID | Type | Description | Source |
|---|---|---|---|
| SCOPE-001 | source_requirement | 智慧健康倉核心功能軟體模組開發 | p.1 |
| SCOPE-002 | source_requirement | 自我視力聽力量測流程 | p.1-p.3 |
| SCOPE-003 | source_requirement | 問卷導診分流系統 | p.1, p.3-p.4 |
| SCOPE-004 | source_requirement | UI/UX 介面規劃 | p.1, p.2-p.3 |
| SCOPE-005 | source_requirement | 軟體流程設計 | p.1 |
| SCOPE-006 | source_requirement | 系統開發 | p.1 |
| SCOPE-007 | source_requirement | 後台管理系統 / CMS 建置或介接 | p.3-p.5 |
| SCOPE-008 | source_requirement | 綜合健康報告顯示 | p.4 |
| SCOPE-009 | source_requirement | QR Code 報告連結產出 | p.1, p.4 |
| SCOPE-010 | source_requirement | HIS 串接 API 與 JSON 資料格式預留 | p.1, p.4-p.5 |

### 3.2 Explicitly Implied Non-paper Workflow

| Constraint ID | Type | Description | Source |
|---|---|---|---|
| NO-PAPER-001 | source_constraint | 系統不產出紙本收據 | p.1 |
| NO-PAPER-002 | source_constraint | 無熱感應印表機 | p.1 |
| NO-PAPER-003 | source_constraint | 不支援任何紙本列印 | p.1 |
| DIGITAL-001 | source_requirement | 量測與分流結果應以數位方式呈現、暫存、報告化、QR Code 化，並預留 HIS 對接 | p.1-p.4 |

## 4. Stakeholders and Tentative Ownership

| Stakeholder | Role in PDF | Ownership / Responsibility | Status |
|---|---|---|---|
| 國立陽明交通大學團隊 | 合作開發智慧健康倉核心功能軟體模組 | API / JSON 資料傳輸格式規劃、資料結構化、結案交付項目之一方 | source-derived |
| Imedtac | 設計規範討論方；CMS 執行方被提及 | AI avatar 設計規範需與 Imedtac 討論；CMS 由 Imedtac 執行，但部分資訊由陽交大提供 | source-derived with tbd |
| 營運方 | 未來管理問診題目與串接資料 | 可自主新增、修改、刪除、排序問診題目；未來可將資料拋轉或串接 HIS | source-derived |
| 診所 / 門診部 | 試營運與場域 | 2026 年 9 月中試營運 | source-derived |
| 一線醫護 | 系統受益者 | 系統目標之一是減輕一線醫護負擔 | source-derived |
| 民眾 / 受測者 | 前台使用者 | 自主完成視力、聽力與問卷分流流程 | source-derived |

## 5. Hardware and System Environment Constraints

| Requirement ID | Type | Requirement / Constraint | Acceptance Evidence | Source |
|---|---|---|---|---|
| ENV-001 | source_constraint | 設備安置於具備部分隔音效果之密閉式智慧健康倉內 | 場域部署說明與測試紀錄可確認隔音環境 | p.1 |
| ENV-002 | tbd | 隔音後分貝數待測量 | 需補充實測 dB 數據、測試方法、量測位置、時間、背景噪音條件 | p.1 |
| ENV-003 | source_constraint | 顯示螢幕為觸控螢幕 | UI 可在觸控螢幕完成所有操作 | p.1 |
| ENV-004 | source_constraint | 前台網頁與報告結果需具備 RWD 或彈性佈局能力 | 可在不同螢幕尺寸或載具上正常顯示 | p.1 |
| ENV-005 | source_constraint | 所有操作與身分確認（若有）皆透過觸控螢幕互動完成 | 不依賴鍵盤、滑鼠、紙本或人工輸入 | p.1 |
| ENV-006 | source_constraint | 無熱感應印表機，不支援紙本列印 | 系統流程沒有列印依賴 | p.1 |
| ENV-007 | source_constraint | 倉內配備一組固定式音訊輸出喇叭 | 語音導引與聽力檢測以固定喇叭輸出 | p.1 |
| ENV-008 | source_requirement | 固定式音訊輸出喇叭預計用於流程指引與聽力檢測 | 聲音指引與聽力測試流程皆可透過喇叭播放 | p.1 |

## 6. Functional Requirements

### 6.1 Module 1 - 視力與聽力量測流程模組

#### 6.1.1 Module Goal

| Requirement ID | Type | Requirement | Source |
|---|---|---|---|
| M1-GOAL-001 | source_requirement | 在無專業醫護人員協助下，直覺且安全地引導使用者自主完成基礎視力與聽力篩檢 | p.2 |

#### 6.1.2 Vision Measurement Flow

| Requirement ID | Type | Requirement | Acceptance Evidence | Source |
|---|---|---|---|---|
| VIS-001 | source_requirement | 設計符合螢幕比例與標準測試距離之視力量表 | 視力量表規格說明需包含螢幕尺寸、顯示比例、測試距離、校正方式 | p.2 |
| VIS-002 | source_requirement | 流程需包含視力檢查 | 視力檢查流程可被使用者獨立完成 | p.2 |
| VIS-003 | source_requirement | 流程需包含對比視力檢查 | 對比視力檢查流程可被使用者獨立完成 | p.2 |
| VIS-004 | source_requirement | 流程需包含色覺檢查 | 色覺檢查流程可被使用者獨立完成 | p.2 |
| VIS-005 | source_requirement | 流程需包含散光檢查 | 散光檢查流程可被使用者獨立完成 | p.2 |
| VIS-006 | source_requirement | 流程需包含視野檢查 | 視野檢查流程可被使用者獨立完成 | p.2 |
| VIS-007 | source_requirement | 以螢幕文字引導民眾透過觸控螢幕上的大圖示按鈕互動 | UI 具有大按鈕、大圖示、清楚文字指示 | p.2 |
| VIS-008 | source_requirement | 支援「上下左右」缺口辨識互動，或其他設計於觸控螢幕完成的互動形式 | 受測者可透過觸控螢幕回應視標方向或其他檢查互動 | p.2 |
| VIS-009 | source_requirement | 搭配語音導引協助民眾完成檢查 | 視力流程包含語音導引播放 | p.2 |
| VIS-010 | source_requirement | 量測結束後，軟體需即時運算初步量測結果 | 系統可在流程結束後產生初步結果 | p.2 |
| VIS-011 | source_requirement | 初步量測結果需以視覺化結果顯示並暫存 | 畫面可視化結果；資料被暫存以供最終報告使用 | p.2 |
| VIS-012 | source_requirement | 視力量測結果最後須顯示在報告中 | 綜合健康報告含視力結果 | p.2 |
| VIS-013 | source_reference | 視力範例參考 ZEISS 線上視力測驗 | Reference: https://visionscreening.zeiss.com/zh-TW | p.2 |

#### 6.1.3 Hearing Measurement Flow

| Requirement ID | Type | Requirement | Acceptance Evidence | Source |
|---|---|---|---|---|
| HEAR-001 | source_requirement | 以螢幕文字或語音引導使用者測試 | 聽力流程可透過畫面與語音引導完成 | p.3 |
| HEAR-002 | source_requirement | 透過軟體精準控制左耳與右耳音訊輸出 | 系統具備左耳 / 右耳測試流程與聲音輸出控制邏輯 | p.3 |
| HEAR-003 | source_requirement | 分別對左耳與右耳輸出不同頻率與分貝 dB 之音訊 | 聽力測試可設定頻率與 dB 參數並播放 | p.3 |
| HEAR-004 | source_requirement | 畫面需有防呆機制 | UI 能避免誤操作、重複點擊、未完成步驟跳轉等問題 | p.3 |
| HEAR-005 | source_requirement | 畫面需有專注度提示與引導機制 | 測試過程提示受測者保持安靜與專注 | p.3 |
| HEAR-006 | source_requirement | 確保受測者在安靜狀態下點擊螢幕回饋 | UI 引導受測者聽到聲音後以觸控回饋 | p.3 |
| HEAR-007 | source_reference | 聽力範例參考 Philips 線上聽力測試 | Reference: https://www.hearingsolutions.philips.com/zh-tw/hearing-test | p.3 |
| HEAR-008 | source_constraint | 聽力測試須規劃成不用戴耳機的版本 | 測試流程不依賴耳機；使用固定喇叭時仍需設計合理測試方法 | p.3 |

#### 6.1.4 Module 1 Engineering Notes

| Note ID | Type | Note | Risk / Reason |
|---|---|---|---|
| M1-NOTE-001 | derived_note | 視力量表若要符合標準測試距離，必須明確知道螢幕尺寸、解析度、受測者位置、距離校正方式 | 若沒有校正，視力結果可能只具參考性，難以作為正式醫療檢測 |
| M1-NOTE-002 | derived_note | 不戴耳機的聽力測試會受到左右耳隔離、環境噪音、喇叭頻率響應、受測者位置影響 | 固定喇叭不易獨立刺激單耳，需確認臨床或產品定位是「篩檢」而非精密聽力檢查 |
| M1-NOTE-003 | derived_note | 需定義「初步量測結果」的演算法、分級、可視化格式與免責文字 | 避免前端顯示被誤認為診斷結論 |

### 6.2 Module 2 - 問卷導診分流系統

#### 6.2.1 Module Goal

| Requirement ID | Type | Requirement | Source |
|---|---|---|---|
| M2-GOAL-001 | source_requirement | 以家庭醫學科之全面性醫療視角設計第一階段制式問診流程 | p.3 |
| M2-GOAL-002 | source_requirement | 第一階段以上架制式問卷方式進行填答 | p.3 |
| M2-GOAL-003 | source_requirement | 達到初步分流、就醫科別建議與衛教引導效果 | p.3 |

#### 6.2.2 Frontend Questionnaire UI

| Requirement ID | Type | Requirement | Acceptance Evidence | Source |
|---|---|---|---|---|
| TRIAGE-UI-001 | source_requirement | 設計適合全齡層含長者操作之友善 UI | 可用性測試涵蓋長者或低數位熟悉度使用者 | p.3 |
| TRIAGE-UI-002 | source_requirement | 字體適中 | UI 規格明定字級、行高、閱讀距離 | p.3 |
| TRIAGE-UI-003 | source_requirement | 按鈕點選區域大 | UI 規格明定觸控目標尺寸與間距 | p.3 |
| TRIAGE-UI-004 | source_requirement | 色彩對比清晰 | UI 通過基本對比檢查；適合長者閱讀 | p.3 |
| TRIAGE-UI-005 | source_requirement | 流程採用 AI 虛擬角色貫穿量測與問診流程 | UI/UX 設計有 avatar 元件、呈現位置、語音/文字互動規範 | p.3 |
| TRIAGE-UI-006 | tbd | AI Virtual Characters / Avatars 設計規範須與 Imedtac 討論後決議 | 需補 Avatar 風格、角色數量、語氣、動作、是否語音、品牌規範 | p.3 |

#### 6.2.3 CMS / Content Management Backend

| Requirement ID | Type | Requirement | Acceptance Evidence | Source |
|---|---|---|---|---|
| CMS-001 | source_requirement | 開發網頁端 Web-based 管理後台，或與第三方平台介接 | 可透過瀏覽器登入管理問卷內容 | p.4 |
| CMS-002 | source_requirement | 營運方未來可自主新增問診題目 | CMS 可新增題目 | p.4 |
| CMS-003 | source_requirement | 營運方未來可自主修改問診題目 | CMS 可編輯題目內容 | p.4 |
| CMS-004 | source_requirement | 營運方未來可自主刪除問診題目 | CMS 可刪除或停用題目 | p.4 |
| CMS-005 | source_requirement | 營運方未來可自主排序問診題目 | CMS 可排序題目或流程節點 | p.4 |
| CMS-006 | source_requirement | 後台需支援設定題目的關聯跳轉邏輯 | CMS 可設定條件式跳題 | p.4 |
| CMS-007 | source_requirement | 支援 If 選擇 A, Then 跳轉至第 5 題 類型邏輯 | CMS 有條件分支規則資料模型 | p.4 |
| CMS-008 | source_note | PDF 註記 CMS 為 Imedtac 執行，但部分資訊由陽交大提供 | 需釐清雙方交付邊界、資料格式、API 或管理介面責任 | p.4 |

#### 6.2.4 Module 2 Engineering Notes

| Note ID | Type | Note | Risk / Reason |
|---|---|---|---|
| M2-NOTE-001 | derived_note | 問卷導診需要明確區分「分流建議」與「診斷」 | 避免產生醫療責任與使用者誤解 |
| M2-NOTE-002 | derived_note | CMS 的跳題規則應以 versioned graph / decision tree 儲存 | 問卷內容更新後，歷史報告需能回溯當時版本 |
| M2-NOTE-003 | derived_note | AI avatar 若貫穿量測與問診流程，需定義其是否只是 UI 角色，或是否含語音、LLM、互動問答能力 | 不同定義會大幅影響開發範圍、風險與法規宣稱 |

### 6.3 Module 3 - 資料整合與呈現 Data Integration

| Requirement ID | Type | Requirement | Acceptance Evidence | Source |
|---|---|---|---|---|
| DATA-001 | source_requirement | 所有量測結束後，包含視力、聽力與 Triage 分流結果完成後，於螢幕上結構化呈現綜合健康報告 | 報告畫面包含三類結果並以結構化區塊顯示 | p.4 |
| DATA-002 | source_requirement | 綜合健康報告需圖表化呈現 | 報告畫面包含圖表或視覺化元件 | p.4 |
| DATA-003 | source_requirement | 畫面上須即時生成對應 QR Code | 流程結束後出現 QR Code | p.4 |
| DATA-004 | source_requirement | 使用者可用手機掃描 QR Code 後帶走報告連結或將資訊儲存於行動裝置 | QR Code 可開啟行動裝置報告頁或報告連結 | p.4 |
| HIS-001 | source_requirement | 陽交大團隊需規劃並預留標準 API 介面 | 有 API 規格文件 | p.4-p.5 |
| HIS-002 | source_requirement | 陽交大團隊需規劃資料傳輸格式 JSON | API 規格文件含 JSON payload schema | p.4-p.5 |
| HIS-003 | source_requirement | 所有量測數據與 Triage 問診結果皆須結構化 | Database / API / report data model 皆可結構化表示 | p.4 |
| HIS-004 | source_requirement | 結構化資料需便於後續營運方拋轉或串接至 HIS | 預留 HIS export / integration interface | p.4 |

#### 6.3.1 Source-mandated Data Objects

The PDF does not define exact database tables or API fields. The following object names are normalized for agent readability.

| Object | Status | Description |
|---|---|---|
| `vision_measurement_result` | source-derived concept | 視力、對比視力、色覺、散光、視野等結果 |
| `hearing_measurement_result` | source-derived concept | 左耳 / 右耳、頻率、dB、使用者回饋等結果 |
| `triage_questionnaire_result` | source-derived concept | 制式問卷作答結果、跳題路徑、初步分流、科別建議、衛教引導 |
| `integrated_health_report` | source-derived concept | 螢幕上結構化與圖表化呈現的綜合健康報告 |
| `qr_report_link` | source-derived concept | QR Code 對應的報告連結或行動裝置可保存資訊 |
| `his_export_payload` | source-derived concept | 預留給 HIS 串接的 JSON 結構化資料 |

#### 6.3.2 Derived JSON Skeleton - Not an Official API Spec

```json
{
  "schema_version": "TBD",
  "session": {
    "session_id": "TBD",
    "started_at": "TBD",
    "completed_at": "TBD",
    "site_id": "TBD",
    "device_id": "TBD"
  },
  "user_context": {
    "identity_mode": "TBD",
    "patient_id": "TBD_or_null",
    "age_group": "TBD_or_null"
  },
  "vision_measurement_result": {
    "visual_acuity": "TBD",
    "contrast_vision": "TBD",
    "color_vision": "TBD",
    "astigmatism": "TBD",
    "visual_field": "TBD",
    "summary": "TBD",
    "warnings": []
  },
  "hearing_measurement_result": {
    "left_ear": {
      "frequencies_hz": [],
      "db_levels": [],
      "responses": []
    },
    "right_ear": {
      "frequencies_hz": [],
      "db_levels": [],
      "responses": []
    },
    "summary": "TBD",
    "warnings": []
  },
  "triage_questionnaire_result": {
    "questionnaire_version": "TBD",
    "answers": [],
    "branch_path": [],
    "triage_summary": "TBD",
    "recommended_department": "TBD",
    "health_education_guidance": []
  },
  "report": {
    "report_id": "TBD",
    "report_url": "TBD",
    "qr_code_payload": "TBD"
  },
  "his_export": {
    "status": "prepared_not_sent",
    "target_system": "TBD",
    "payload_format": "JSON"
  }
}
```

## 7. Deliverables and Schedule

### 7.1 Schedule

| Requirement ID | Type | Requirement | Source |
|---|---|---|---|
| SCH-001 | source_deliverable | 預計 2026 年 9 月中旬完成驗收與交付 | p.4 |
| SCH-002 | source_deliverable | 最晚 2026 年 9 月初進行整合 | p.4 |
| SCH-003 | source_deliverable | 診所將於 2026 年 9 月中試營運 | p.4 |

### 7.2 Final Deliverables Required from NYCU Team

| Deliverable ID | Type | Deliverable | Source |
|---|---|---|---|
| DEL-001 | source_deliverable | UI/UX 介面設計規格書，例如 Figma 連結 | p.5 |
| DEL-002 | tbd | UI/UX 介面設計規格書需確認由 Imedtac 或陽交大執行 | p.5 |
| DEL-003 | source_deliverable | Triage 完整題目流程規劃邏輯跳轉規格 | p.5 |
| DEL-004 | source_deliverable | API 規格文件，含資料欄位定義，供串接 HIS 使用 | p.5 |
| DEL-005 | source_deliverable | 資料庫結構設計圖 ERD | p.5 |
| DEL-006 | source_deliverable | 前台聽力視力量測完整原始碼 | p.5 |
| DEL-007 | source_deliverable | 前台問卷問診系統完整原始碼 | p.5 |
| DEL-008 | source_deliverable | 後台管理系統 CMS 完整原始碼 | p.5 |
| DEL-009 | source_deliverable | 系統部署說明書，含環境架設需求 | p.5 |

## 8. Open Questions / TBD Items

| TBD ID | Priority | Question | Why It Matters | Source / Basis |
|---|---|---|---|---|
| TBD-001 | High | 隔音後的實測分貝是多少？測試環境與量測標準為何？ | 直接影響不用耳機聽力測試的可信度 | p.1 |
| TBD-002 | High | 觸控螢幕尺寸、解析度、安裝高度、受測距離是否固定？ | 直接影響視力量表校正與 UI layout | p.1-p.2 |
| TBD-003 | High | 聽力測試不用耳機時，如何區分左耳與右耳？ | 固定喇叭難以做到單耳隔離 | p.3 |
| TBD-004 | High | AI avatar 是靜態角色、動畫角色、語音角色，還是 LLM-driven interactive agent？ | 影響架構、時程、風險、法規宣稱與成本 | p.3 |
| TBD-005 | High | CMS 到底由 Imedtac 或陽交大負責實作？雙方 API / 資料邊界為何？ | 交付責任不清會造成整合延遲 | p.4-p.5 |
| TBD-006 | High | UI/UX 介面設計規格書由 Imedtac 或陽交大執行？ | 交付文件責任需明確 | p.5 |
| TBD-007 | High | HIS 串接標準是自訂 JSON、HL7、FHIR，或院方既有格式？ | API 與 ERD 設計需配合院方資料交換需求 | p.4-p.5 |
| TBD-008 | Medium | 是否需要登入、身分確認、病歷號、手機號或匿名 session？ | 影響資料保護、報告查閱、HIS 對接 | p.1, p.4 |
| TBD-009 | Medium | 報告 QR Code 的有效期限、權限控制、資料保存策略為何？ | 影響資安、隱私、個資保護與維運 | p.4 |
| TBD-010 | Medium | 問卷內容由誰提供、誰審核、如何版本控管？ | 影響醫療正確性與歷史報告可追溯性 | p.3-p.5 |
| TBD-011 | Medium | 結果顯示是否需加註「初步篩檢 / 非診斷」聲明？ | 降低醫療責任與使用者誤解 | derived_note |
| TBD-012 | Medium | 是否需要後台帳號權限、audit log、內容發布流程？ | CMS 若可改問卷，需可追溯營運操作 | derived_note |

## 9. Implementation-oriented Agent Checklist

Use this checklist for a coding agent, PM agent, or systems engineering agent.

### 9.1 Requirements Clarification

- [ ] Confirm physical screen size, resolution, and fixed user distance.
- [ ] Confirm cabin sound insulation dB after measurement.
- [ ] Confirm whether hearing test is screening-only and how no-headphone design should be validated.
- [ ] Confirm avatar scope: UI-only / animated / voice-guided / LLM-interactive.
- [ ] Confirm CMS ownership and interface boundary between Imedtac and NYCU.
- [ ] Confirm HIS target data standard and integration method.
- [ ] Confirm privacy/session/report retention policy.
- [ ] Confirm whether report requires legal / medical disclaimer.

### 9.2 UI/UX Workstream

- [ ] Produce frontstage flow map: welcome -> optional identity -> vision -> hearing -> questionnaire -> report -> QR Code.
- [ ] Design large-button touch UI suitable for elderly users.
- [ ] Design voice guidance scripts for vision, hearing, and questionnaire.
- [ ] Design avatar behavior and placement after Imedtac confirmation.
- [ ] Build RWD / flexible layout for screen and mobile report page.
- [ ] Create Figma or equivalent UI/UX specification.

### 9.3 Vision Measurement Workstream

- [ ] Define test distance and calibration method.
- [ ] Implement visual acuity test.
- [ ] Implement contrast vision test.
- [ ] Implement color vision test.
- [ ] Implement astigmatism test.
- [ ] Implement visual field test.
- [ ] Implement touch-based response controls.
- [ ] Compute preliminary results immediately after tests.
- [ ] Store results for final report.

### 9.4 Hearing Measurement Workstream

- [ ] Define speaker output constraints and calibration method.
- [ ] Define frequency and dB test parameters.
- [ ] Implement left-ear / right-ear test flow or confirm feasible alternative.
- [ ] Implement text and voice guidance.
- [ ] Implement quiet-state and attention prompts.
- [ ] Implement touch-based user response.
- [ ] Store results for final report.

### 9.5 Triage Questionnaire Workstream

- [ ] Define standardized first-phase questionnaire content.
- [ ] Define question schema.
- [ ] Define branching / jump logic schema.
- [ ] Define triage output fields: department recommendation, health education guidance, summary.
- [ ] Implement elderly-friendly answering UI.
- [ ] Version questionnaire content and branching logic.

### 9.6 CMS Workstream

- [ ] Decide self-developed CMS vs third-party integration.
- [ ] Implement create / update / delete / sort questions.
- [ ] Implement conditional jump logic editor.
- [ ] Implement content versioning.
- [ ] Implement roles, permissions, and audit log if required.

### 9.7 Data Integration Workstream

- [ ] Define database ERD.
- [ ] Define API field dictionary.
- [ ] Define JSON payload schema.
- [ ] Define report schema.
- [ ] Implement structured and charted report screen.
- [ ] Implement QR Code generation.
- [ ] Implement mobile report page or report link.
- [ ] Prepare HIS export interface.

### 9.8 Delivery Workstream

- [ ] Deliver UI/UX design spec.
- [ ] Deliver Triage flow and branching spec.
- [ ] Deliver API specification and field definitions.
- [ ] Deliver ERD.
- [ ] Deliver frontend source code for vision/hearing measurement.
- [ ] Deliver frontend source code for questionnaire system.
- [ ] Deliver CMS source code or integration package.
- [ ] Deliver deployment guide with environment setup requirements.
- [ ] Complete integration by early September 2026.
- [ ] Complete validation and delivery by mid-September 2026.

## 10. Suggested System Modules for Software Architecture

This section is derived from the requirements and is intended for agent planning, not a source mandate.

| Component | Responsibility | Possible Interfaces |
|---|---|---|
| `frontend-kiosk-ui` | Touchscreen UI for measurement, questionnaire, avatar guidance, report display | Browser app / kiosk mode |
| `vision-test-engine` | Vision chart rendering, interaction handling, result calculation | Internal frontend module or backend API |
| `hearing-test-engine` | Tone generation, dB/frequency control, user response capture | Web Audio API or native kiosk layer |
| `triage-questionnaire-engine` | Questionnaire rendering, branching, answer capture, triage result generation | Backend API + frontend renderer |
| `cms-admin` | Question management, sorting, branching logic, content publishing | Web admin UI |
| `report-service` | Integrated health report generation and visualization | REST API / frontend report page |
| `qr-code-service` | QR Code generation and report link mapping | REST API / frontend library |
| `his-integration-adapter` | Reserved JSON export format for future HIS integration | REST API / file export / queue, TBD |
| `data-store` | Sessions, measurement results, questionnaire versions, reports | SQL database, TBD |

## 11. Risk Register

| Risk ID | Risk | Impact | Mitigation |
|---|---|---|---|
| RISK-001 | No-headphone hearing test may not produce clinically meaningful left/right separation | High | Confirm product claim boundary; perform acoustic calibration; label as screening if needed |
| RISK-002 | Vision test accuracy depends on screen size and viewing distance | High | Fix cabin geometry; implement calibration; document limitations |
| RISK-003 | CMS ownership ambiguity | High | Define RACI and API/data boundary immediately |
| RISK-004 | HIS integration underspecified | High | Confirm target HIS standard and payload schema before API design freezes |
| RISK-005 | Avatar scope creep | Medium-High | Lock avatar behavior early; separate UI avatar from LLM-based medical interaction unless explicitly approved |
| RISK-006 | Report QR Code may expose sensitive health data if unauthenticated | High | Define token expiry, access control, data minimization, and privacy policy |
| RISK-007 | Questionnaire medical content updates may be unversioned | Medium | Use questionnaire versioning and audit logs |
| RISK-008 | September integration window is tight | High | Prioritize API contract, core flow, and report generation before advanced UI polish |

## 12. Raw Source Transcription

The following section preserves the source content in page order for traceability. Minor line wrapping may differ from the PDF.

### Page 1

```text
1. 專案概述
本專案旨在透過智慧健康倉的專案，提升台北市民眾到門診部時自主量測數據與初步
分流之便利性，實現減輕一線醫護負擔與社區預防醫學的目標。本階段將與國立陽明
交通大學團隊合作「智慧健康倉」之核心功能軟體模組，針對「自我視力聽力量測流
程」與「問卷導診分流系統」進行 UI/UX 介面規劃、軟體流程設計、系統開發與後
台管理系統之建置。
本專案的核心理念為「流程全面數位化」。系統不產出紙本收據，量測與分流結果將直
接預留與醫院資訊系統（HIS）對接之介面，並於前端提供 QR Code 供使用者以行
動裝置查閱報告

2. 硬體與系統環境限制
開發團隊進行 UI/UX 與軟體工程開發時，必須遵守以下既有規格限制：
• 場域環境：本設備安置於具備部分隔音效果之密閉式「智慧健康倉」空間內，
已具備基礎之物理隔音效果(隔音後的分貝待測量)
• 顯示螢幕：觸控螢幕。軟體介面與前台網頁/報告結果須具備 RWD（響應式網
頁設計） 或彈性佈局能力，以確保未來不同載具之相容性
• 動作輸入：所有操作與身分確認（若有）皆透過觸控螢幕互動完成。
• 輸出限制：無熱感應印表機，不支援任何紙本列印
• 音訊設備：倉內配備一組固定式音訊輸出喇叭，預計用於流程指引與聽力檢測
```

### Page 2

```text
3. 詳細功能需求（Detailed Requirements）
模組一：視力與聽力量測流程模組
• 核心目標：在無專業醫護人員協助下，直覺且安全地引導使用者自主完成基礎
視力與聽力篩檢
• 交付任務：
o 視力自主量測流程 (UI/UX)：
▪ 設計符合螢幕比例與標準測試距離之視力量表，流程包含:
• 視力檢查
• 對比視力檢查
• 色覺檢查
• 散光檢查
• 視野檢查
▪ 以螢幕文字引導民眾透過觸控螢幕上的大圖示按鈕，進行「上下
左右」的缺口辨識互動，或是以不同互動形式設計之檢查，皆須
要在觸控螢幕上完成
▪ 另搭配語音導引，協助民眾完成檢查
▪ 數據運算邏輯：量測結束後，軟體需即時運算出初步量測結果，
並以視覺化的結果顯示並暫存，最後須顯示在報告中
▪ 視力範例參考：ZEISS 線上視力測驗
```

### Page 3

```text
o 聽力自主量測流程 (UI/UX)：
▪ 以螢幕文字或語音引導使用者測試，並透過軟體精準控制，分別
對「左耳」與「右耳」輸出不同頻率與分貝（dB）之音訊
▪ 畫面須有防呆、專注度提示與引導機制，確保受測者在安靜狀態
下點擊螢幕回饋
o 視力範例參考：Philips 線上聽力測試(注意須規劃成不用戴耳機的版本)

模組二：問卷導診分流系統
• 核心目標：以家庭醫學科之全面性醫療視角，設計第一階段制式問診流程(第一
階段為上架制式問卷的方式進行填答)，達到初步分流、就醫科別建議與衛教引
導之效果。
• 交付任務：
o 前台答題介面：
▪ 設計適合全齡層（含長者）操作之友善 UI，字體適中、按鈕點選
區域大、色彩對比清晰
▪ UI/UX 設計限制: 流程將採用 AI 虛擬角色（AI Virtual
Characters / Avatars）貫穿量測與問診流程，設計規範須與
Imedtac 進行討論後決議
o 內容上架與內容管理後台（CMS）：
```

### Page 4

```text
▪ 開發一個網頁端（Web-based）管理後台 (可自行開發或是與第
三方平台介接)，供營運方未來可自主新增、修改、刪除、排序問
診題目
▪ 後台介面需支援設定題目的關聯跳轉邏輯（如：If 選擇 A, Then
跳轉至第 5 題）
(此為 Imedtac 執行，但部分資訊由陽交大提供)

模組三：資料整合與呈現（Data Integration）
• 檢測結果顯示：所有量測結束後(含視力、聽力與 Triage 分流結果完成後)，於
螢幕上結構化、圖表化呈現綜合健康報告
• QR Code 產出：畫面上須即時生成對應之 QR Code，方便使用者用手機掃描
後，帶走報告連結或將資訊儲存於行動裝置
• 醫院資訊系統（HIS）接軌準備：
o 陽交大團隊需規劃並預留標準的 API 介面與資料傳輸格式（JSON）。
o 所有量測數據與 Triage 問診結果皆須結構化，以便後續營運方直接將
資料拋轉、串接至醫院的 HIS（Hospital Information System）

4. 交付項目（Deliverables）與期程
• 期程: 預計是 2026/9 月中旬完成驗收與交付，最晚 9 月初進行整合，診所將
於 9 月中試營運
```

### Page 5

```text
陽交大團隊於結案時需交付以下成果：
• 設計與規格文件：
o UI/UX 介面設計規格書（如 Figma 連結）(需確認由 Imedtac 或陽交
大執行)
o Triage 完整題目流程規劃邏輯跳轉規格
o API 規格文件（含資料欄位定義，供串接 HIS 使用）與資料庫結構設
計圖（ERD）
• 軟體與程式原始碼：
o 前台聽力視力量測、前台問卷問診系統、後台管理系統（CMS）之完整
原始碼（Source Code）
o 系統部署說明書（含環境架設需求）
```
