---
document_id: smart-health-cabin-software-modules-email-2026-06-17
agent_readable_version: "1.0"
source_type: Gmail PDF export
source_file: "Gmail - 智慧健康倉軟體功能模組開發需求.pdf"
source_pages: 1
source_pdf_sha256: "2971212b178bf2a5e0566f1920cc19d691ddf7b04a1ec6a230547780a9eee0ee"
pdf_created_at_utc: "2026-06-17T11:45:44Z"
email_subject: "智慧健康倉軟體功能模組開發需求"
email_sent_at: "2026-06-17 18:18 +08:00"
pdf_printed_at: "2026-06-17 19:45 +08:00"
language: zh-TW
conversion_status: "converted_from_pdf_only"
linked_document_status: "external SharePoint planning document link preserved, but not fetched or converted"
confidentiality_note: "Source contains email addresses and a confidentiality disclaimer. Treat as internal project material."
---

# 智慧健康倉軟體功能模組開發需求

## 1. 一句話摘要

iMedtac 希望與收件團隊合作開發「智慧健康倉」的兩個核心軟體模組：`視力與聽力自主量測模組`、`問卷導診分流系統`。對方目前請收件團隊先評估可行性、初步時程與初步經費，並預計在下週二參觀量測設備時進一步討論細節。

## 2. 來源與限制

- 本 Markdown 只轉換 PDF 內可見的一頁 Gmail 郵件內容。
- 郵件中提到「詳情可以參考規畫書(Link)」，該連結是外部 SharePoint 文件，不在本 PDF 內。本檔已保留連結，但沒有擷取或轉換該 SharePoint 文件內容。
- PDF 內的簽名檔與機密聲明屬於郵件元資料與法律聲明，不應被誤判為軟體需求。
- 需求細節目前偏高階，尚不足以直接估出可靠開發成本；需在設備參觀與範圍釐清後才能做較準確估算。

## 3. 郵件基本資訊

| 欄位 | 內容 |
|---|---|
| 主旨 | 智慧健康倉軟體功能模組開發需求 |
| 寄件者 | Johnny Fang 方偉翰, imedtac Corp. `<Johnny.Fang@imedtac.com>` |
| 寄送時間 | Wed, Jun 17, 2026 at 6:18 PM |
| 主要收件者 | `max870121@gmail.com`; Jason Lin `<cre062400@gmail.com>` |
| 副本 | Jason Miao 苗中聖, imedtac Corp. `<Jason.Miao@imedtac.com>`; Ken Yu 余金樹, imedtac Corp. `<Ken.Yu@imedtac.com>`; `<ytwu@nycu.edu.tw>` |
| 專案對象 | 智慧健康倉；與北市聯醫提案相關 |
| 發信目的 | 請收件團隊評估合作開發範圍、可行性、初步時程與初步經費 |
| 後續會議/參訪 | 郵件提到「下週二」兩位會到公司參觀量測設備，可進一步討論新專案細節。依郵件日期推定可能是 2026-06-23（二），仍需以實際行程確認。 |

## 4. 相關連結

| 連結類型 | 文字 | URL | 備註 |
|---|---|---|---|
| 規畫書/需求書 | Link | <https://imedtac-my.sharepoint.com/:w:/p/im0192/IQDLU8YcbQpRS7GNeXDb95bOAYN4ip0WaCZ9tCktA3ydrtM?e=gZttfH> | 郵件內「規畫書(Link)」的隱藏超連結；本轉換未抓取該文件內容。 |
| 公司網站 | iMedtac Co., Ltd. | <http://www.imedtac.com/> | 寄件者簽名檔提供。 |
| 地址搜尋 | 335, Ruiguang Rd. Neihu | <https://www.google.com/maps/search/335,+Ruiguang+Rd.+Neihu?entry=gmail&source=g> | PDF 中地址文字帶有 Google Maps 搜尋連結。 |

## 5. 原始需求：兩大核心模組

### Module A：視力與聽力自主量測模組

```yaml
module_id: M-A
module_name: 視力與聽力自主量測模組
source_scope: 於既有觸控螢幕之密閉健康倉內進行流程規劃與軟體開發
current_stage: high_level_requirement
source_explicit_outputs:
  - 流程規劃
  - 軟體開發
source_constraints:
  - 使用既有觸控螢幕
  - 場域為密閉健康倉
  - 量測項目包含視力與聽力
not_specified_in_pdf:
  - 量測設備型號
  - 健康倉作業系統與瀏覽器環境
  - 視力/聽力量測方法與校正標準
  - 是否需要醫材法規或臨床驗證文件
  - 是否需要與既有硬體 SDK/API 串接
  - 資料儲存、身份識別、報表與後台管理需求
```

### Module B：問卷導診分流系統

```yaml
module_id: M-B
module_name: 問卷導診分流系統
source_scope: 以家庭醫學科之全面性醫療視角設計第一階段制式問診流程
current_stage: high_level_requirement
phase_1_method: 上架制式問卷並讓使用者填答
source_explicit_goals:
  - 初步分流
  - 就醫科別建議
  - 衛教引導
future_extension:
  - 預留未來串接醫院 HIS 系統結構
important_boundary:
  - PDF 只明確提到「預留未來串接 HIS 系統結構」，不等於目前階段已要求實作完整 HIS 串接。
not_specified_in_pdf:
  - 問卷題庫內容與維護者
  - 分流邏輯規則來源
  - 就醫科別建議的醫療責任邊界
  - 衛教內容來源與審核流程
  - 使用者身份識別與資料保護要求
  - HIS 介接標準、API、認證授權、資料格式
```

## 6. 對方明確要求收件團隊先交付的評估

| 交付項目 | 說明 | 優先級 |
|---|---|---|
| 可行性評估 | 判斷兩大模組是否能在現有設備與合作條件下執行。 | 高 |
| 初步時程規劃 | 將開發拆成可執行階段，例如需求訪談、原型、MVP、測試、部署。 | 高 |
| 初步經費評估 | 估算開發、人力、測試、整合與維護成本。 | 高 |
| 設備參觀後細節討論 | 下週二到公司參觀量測設備時，釐清硬體、流程與系統整合細節。 | 高 |

## 7. AI Agent 執行任務清單

以下是根據郵件內容整理出的可執行任務。`source_explicit` 代表 PDF 文字明確提到；`derived` 代表為了完成估時、估價與可行性評估所需補問或拆解的工作。

### 7.1 Source-explicit tasks

- [ ] 評估「視力與聽力自主量測模組」在既有觸控螢幕與密閉健康倉內的可行性。
- [ ] 評估「問卷導診分流系統」第一階段制式問卷流程的可行性。
- [ ] 提出兩大模組的初步時程規劃。
- [ ] 提出兩大模組的初步經費評估。
- [ ] 在公司參觀量測設備時討論新專案細節。

### 7.2 Derived tasks for project planning

- [ ] 取得或開啟 SharePoint 規畫書原文，補齊本 PDF 未包含的需求細節。
- [ ] 釐清健康倉硬體規格：觸控螢幕尺寸、解析度、OS、瀏覽器、網路、音訊輸出、感測器/量測設備、SDK/API。
- [ ] 釐清視力量測流程：距離、字標/圖示、遮眼流程、校正、結果格式、是否需列印/匯出報告。
- [ ] 釐清聽力量測流程：耳機/喇叭、音量校正、頻率範圍、噪音控制、測試方法、結果格式。
- [ ] 釐清問卷導診分流系統的臨床規則來源、維護流程與責任邊界。
- [ ] 釐清衛教內容來源、版本管理、醫師審核機制與多語系需求。
- [ ] 定義 MVP 與未來 HIS 介接的邊界，避免把「預留介接架構」誤估成「立即完整介接」。
- [ ] 評估資料保護需求：個資、健康資料、紀錄保存、權限控管、稽核紀錄、資料刪除。
- [ ] 拆分交付階段：需求確認、UX flow、prototype、MVP、現場測試、驗收、維運。

## 8. 需求風險與估價前必問問題

| 類別 | 風險/問題 | 為什麼重要 |
|---|---|---|
| 硬體整合 | 現有觸控螢幕與量測設備是否有可用 API/SDK？ | 會直接影響開發難度、測試方式與時程。 |
| 量測可靠性 | 視力與聽力量測是否需要校正、標準化與臨床驗證？ | 若涉及醫療判讀或正式紀錄，風險與成本會大幅提高。 |
| 使用者流程 | 密閉健康倉內使用者是否可獨立完成操作？是否需要工作人員協助？ | 會影響 UI 設計、錯誤復原、語音/圖像提示與無障礙設計。 |
| 問卷規則 | 分流與科別建議的規則由誰提供與負責審核？ | 這是醫療責任與系統可信度核心。 |
| 衛教內容 | 衛教內容是否由醫院/醫師提供？是否需要版本控管？ | 內容若過期或不準確，會產生醫療與法遵風險。 |
| HIS 介接 | 目前只需預留架構，還是要做實際介接？ | 兩者工期與成本差距很大。 |
| 資安/個資 | 是否處理可識別病患資料、健康資料或醫療紀錄？ | 會影響加密、權限、稽核、資料保存與法規合規。 |
| 驗收標準 | 成功標準是 demo、pilot、正式上線，還是醫院驗收？ | 不同目標會導致完全不同的工程規模。 |

## 9. 建議的初步工作分解結構（WBS）

> 這一節是轉換後為 AI agent 規劃工作所補上的工程拆解，不是 PDF 原文。

```yaml
work_breakdown:
  phase_0_requirement_discovery:
    - 讀取 SharePoint 規畫書
    - 參觀健康倉與量測設備
    - 訪談 iMedtac 與醫療端利害關係人
    - 釐清 MVP / pilot / production 邊界
  phase_1_system_design:
    - 定義使用者流程與例外流程
    - 定義資料模型與 API contract
    - 定義前端 kiosk UI 架構
    - 定義後台管理與內容維護需求
    - 定義 HIS future-proof integration boundary
  phase_2_module_a_prototype:
    - 視力量測流程 prototype
    - 聽力量測流程 prototype
    - 量測結果格式與報表 prototype
    - 現場設備測試
  phase_3_module_b_prototype:
    - 制式問卷 engine
    - 分流規則 engine
    - 科別建議邏輯
    - 衛教內容輸出
    - 內容版本管理
  phase_4_mvp_integration:
    - 前端 kiosk flow 整合
    - 後端 API / database
    - 權限、紀錄、log、error handling
    - QA test cases
  phase_5_pilot_and_handover:
    - 現場測試
    - 驗收修正
    - 操作文件
    - 維運與交接
```

## 10. 不應從 PDF 直接推論的事項

- 不應直接推論目前已要求實作完整 HIS 串接；PDF 只說「預留未來串接醫院 HIS 系統結構」。
- 不應直接推論系統可以做診斷；PDF 只說初步分流、就醫科別建議與衛教引導。
- 不應直接推論硬體 API、設備型號、作業系統、資料庫、雲端環境或部署方式。
- 不應直接推論估價或工期；目前資訊不足，只能做粗估或列出估算前提。
- 不應把郵件簽名檔、地址、機密聲明視為功能需求。

## 11. 適合丟給後續 Agent 的 Prompt

```text
你是一位醫療軟體系統分析師與 AI Systems Engineer。請根據以下專案背景，為智慧健康倉兩個模組做可行性評估、初步時程規劃與初步經費估算。請嚴格區分「來源明確需求」與「工程上為了估算而提出的假設」。

來源明確需求：
1. 視力與聽力自主量測模組：在既有觸控螢幕之密閉健康倉內進行流程規劃與軟體開發。
2. 問卷導診分流系統：以家庭醫學科之全面性醫療視角，設計第一階段制式問診流程。第一階段以制式問卷填答進行，目標是初步分流、就醫科別建議與衛教引導，並預留未來串接醫院 HIS 系統結構。
3. 對方要求先提供可行性、初步時程、初步經費評估。

限制：
- 不要假設已要求完整 HIS 介接。
- 不要假設系統可做診斷或醫療決策。
- 不要假設硬體 API、量測設備型號或部署環境。
- 請列出估算前必問問題。
```

## 附錄 A：原文清理版

### Gmail 頁首

- 帳號：Jason Lin `<cre062400@gmail.com>`
- 主旨：智慧健康倉軟體功能模組開發需求
- 郵件數：1 message

### 郵件標頭

From: Johnny Fang 方偉翰, imedtac Corp. `<Johnny.Fang@imedtac.com>`
Date: Wed, Jun 17, 2026 at 6:18 PM
To: `max870121@gmail.com`, Jason Lin `<cre062400@gmail.com>`
Cc: Jason Miao 苗中聖, imedtac Corp. `<Jason.Miao@imedtac.com>`; Ken Yu 余金樹, imedtac Corp. `<Ken.Yu@imedtac.com>`; `<ytwu@nycu.edu.tw>`

### 郵件本文

許桓瑜醫師與 Jason 您好，

上次很快速的提供我們接下來智慧健康倉的需求，目前我們團隊正著手進行規劃與北市聯醫的提案，其中有一部分的範圍想請貴團隊執行，詳情可以參考規畫書（Link）。

本次想合作的開發範圍包含兩大核心模組：

1. 視力與聽力自主量測模組：於既有觸控螢幕之密閉健康倉內進行流程的規劃與軟體開發。

2. 問卷導診分流系統：以家庭醫學科之全面性醫療視角，設計第一階段制式問診流程（第一階段為上架制式問卷的方式進行填答），達到初步分流、就醫科別建議與衛教引導之效果，並預留未來串接醫院 HIS 系統結構。

我先就目前需求寫了需求書，想先請貴團隊進行可行性、初步的時程規劃、預估的經費初步評估，剛好下週二兩位也會到公司來參觀量測設備，我們可以就新專案討論細節。

如果有任何問題都可以進行討論。

Thanks,

Johnny

### 簽名檔

Johnny Fang / 方偉翰
iMedtac Co., Ltd. <http://www.imedtac.com/>
Rm. 4, 10F., No.335, Ruiguang Rd. Neihu Dist., Taipei City 11492, Taiwan (R.O.C)

### 機密聲明

本通訊及其所有附件所含之資訊均屬機密，僅供指定之收件人使用，未經寄件人許可不得揭露、複製或散布本通訊。若您非指定之收件人，嚴禁使用、保存或揭露本通訊之任何部分，請通知寄件人並完全刪除本通訊。網路通訊可能含有病毒，收件人應自行確認本郵件是否安全。此外，該電子訊息內容可能被變更，且網際網路並不保證該電子訊息內容之完整性，因此，慧誠智醫股份有限公司及其關係企業對於他人變更、修改、竄改或偽造之電子訊息內容，恕不負任何責任。

The information contained in this communication and attachment is confidential and is for the use of the intended recipient only. Any disclosure, copying or distribution of this communication without the sender’s consent is strictly prohibited. If you are not the intended recipient, please notify the sender and delete this communication entirely without using, retaining, or disclosing any of its contents. Internet message cannot be guaranteed to be virus-free. The recipient is responsible for ensuring that this message is virus free. Besides, the Message is susceptible to alteration and cannot guarantee the integrity of the Message. Therefore, imedtac Co., Ltd. and its affiliates shall not be liable for the Message if altered, modified, changed or falsified by any third party.
