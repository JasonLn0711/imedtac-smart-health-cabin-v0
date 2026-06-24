---
id: 2026-06-17-smart-health-cabin-expert-tutorial-note
title: "Smart Health Cabin Bridge Folder Expert Tutorial Note"
date: 2026-06-17
topic: smart-health-cabin
type: user-provided-expert-note
status: preserved
source:
  - ../../workstreams/smart-health-cabin/README.md
  - ../../source/2026-06-17-imedtac-smart-health-cabin-requirements/source.md
---

# Smart Health Cabin Bridge Folder Expert Tutorial Note

## Source Boundary

This file preserves the user-provided expert tutorial note in full as a source
artifact for the Smart Health Cabin bridge workstream.

This source record is not itself an approved product requirement, regulatory
position, clinical validation plan, or external commitment to 慧誠智醫（imedtac
Co., Ltd.）. Derived workstream files may reuse the stable engineering framing,
meeting-preparation questions, and discovery structure, while external
standards, clinical measurement claims, regulatory statements, and technology
recommendations require separate verification before becoming stakeholder-facing
commitments.

## User-Provided Expert Note

你是一位資訊工程學系的老師，以及資深 AI Systems Engineering researcher、enterprise AI architect、technical curriculum designer。我是一個大二的資訊工程學系的大學生。請幫我撰寫教程，並且寫成一個大二的大學生可以看得懂的版本，並且寫的越詳細越好。（請以軟體工程實踐以及系統工程實踐的角度加以思考，並且請針對大二的大學生加以詳細解釋、說明，並加以舉出真實世界的實例、技術細節，以及實際選用的技術與套件名稱，並說明真實世界的實例流程等等）

```text
# 智慧健康倉過渡橋接 Folder 與 6/23 會前準備計畫

## Summary

建議在現有 ai-triage-kiosk-v0 repo 中建立一個過渡橋接資料夾：

workstreams/smart-health-cabin/

這個 folder 只負責 6/23 前後的 discovery、會議準備、需求拆解、可行性評估前提與未來搬遷索引。不要在這裡開始寫智慧健康倉的正式 app / CMS / vision / hearing 實作。若 6/23 後確認要進入報價、時程或開發，再開新 repo，例如 imedtac-smart-health-cabin-v0。

Johnny 這次信件想討論的內容應該是「技術架構 + 醫療/器材/軟體流程設計 + 合作交付範圍」三者一起，不是單純 API 技術會議，也不是單純醫療內容會議。

## Folder 設計

建立：

workstreams/smart-health-cabin/
  README.md
  2026-06-23-onsite-discovery-plan.md
  email-requirements-brief.md
  module-a-vision-hearing-discovery.md
  module-b-questionnaire-triage-discovery.md
  meeting-question-bank.md
  feasibility-response-outline.md
  reuse-from-ai-triage.md
  post-meeting-decision-log.md

各檔用途：

- README.md：說明這是 Smart Health Cabin 的過渡橋接區，不是 AI Triage 正式實作區；列出 source bundle、6/23 會議、後續是否開新 repo 的判斷門檻。
- 2026-06-23-onsite-discovery-plan.md：當天會議 agenda、參訪目標、要觀察的設備、要問的問題、會後輸出。
- email-requirements-brief.md：把 Johnny email 與 PDF 附件整理成一頁式重點，區分 source-explicit requirements 與我們推導的工程問題。
- module-a-vision-hearing-discovery.md：專門處理「視力與聽力自主量測模組」的設備、校正、UI、音訊、醫療宣稱與驗證問題。
- module-b-questionnaire-triage-discovery.md：專門處理「問卷導診分流系統」的題庫、跳題、科別建議、衛教、CMS、臨床審核與版本控管。
- meeting-question-bank.md：6/23 現場要問 Johnny / Jason Miao / 工程 / 多寶的問題清單。
- feasibility-response-outline.md：會後要交給 imedtac 的可行性、初步時程、初步經費評估大綱。
- reuse-from-ai-triage.md：列出現有 AI Triage 可重用的概念與不可直接重用的範圍。
- post-meeting-decision-log.md：6/23 後記錄決策、owner、下一步、是否開新 repo。

## Johnny 可能想討論什麼

Johnny 這封信的核心不是「請你們立刻開始做」，而是請你們先幫忙評估以下幾件事：

1. 合作範圍是否可行
   - NYCU / 多寶 / Jason 能否承接部分軟體模組？
   - 哪些由 imedtac 做，哪些由 NYCU 做？
   - CMS、UI/UX、API、ERD、source code 交付責任怎麼切？

2. 技術架構
   - 智慧健康倉前台如何跑：touch screen、browser、OS、network、device API。
   - 視力/聽力量測結果如何存、如何進報告。
   - 問卷導診如何建 schema、branching logic、CMS、JSON/API。
   - QR Code 報告與未來 HIS-ready data 怎麼設計。

3. 醫療與器材/軟體設計
   - 視力檢查是否只是 screening support，還是要更正式的量測結果。
   - 無耳機聽力測試是否可信，如何校正分貝、左右耳、環境噪音。
   - 問卷導診的科別建議與衛教內容由誰提供、誰審核、誰負責。
   - 結果文字如何避免變成診斷或正式醫療處置建議。

4. 時程與經費
   - 9 月初整合、9 月中驗收/試營運是否合理。
   - 第一版 MVP 要縮到什麼程度才可能準時。
   - 初步費用要以哪些假設估算。

所以 6/23 的討論應該準備成「需求釐清與 feasibility discovery」，不是只帶 AI Triage demo，也不是只談醫學內容。

## 6/23 前需要準備的會議資料

會前至少準備四份內部材料：

1. 一頁式需求摘要
   - 兩大模組：視力/聽力自主量測、問卷導診分流。
   - 共同交付：報告、QR Code、API/JSON、ERD、CMS、部署文件。
   - 重要日期：9 月初整合、9 月中驗收/試營運。
   - 明確標出目前仍不足以報固定價與固定工期。

2. 現場設備檢查表
   - touch screen 尺寸、解析度、安裝高度、使用距離。
   - OS、browser、kiosk mode、網路、CORS/API 呼叫限制。
   - 喇叭位置、音量控制、環境噪音、隔音後 dB。
   - 是否可拍照、錄影、取得設備規格與 API/SDK 文件。

3. 醫療/內容設計問題表
   - 視力/聽力結果的產品定位是 self-screening、參考值、還是醫療檢查？
   - 問卷導診的題庫來源、科別建議邏輯、衛教內容由誰提供與審核？
   - 是否需要醫師/院方 sign-off？
   - 報告用語是否需要「初步篩檢 / staff review / 就醫參考」範圍控制？

4. 技術與交付責任問題表
   - CMS 是 imedtac 做、NYCU 做、還是第三方平台？
   - UI/UX Figma 由誰交？
   - source code 交付範圍與授權方式是什麼？
   - HIS-ready 是只要 JSON schema，還是要實際院方串接？
   - QR Code 報告是否需要登入、期限、權限、刪除與 audit log？
```

結論：這個 `workstreams/smart-health-cabin/` 不是「開始做智慧健康倉產品」的地方，而是「在 6/23 會議前後把未知問題釐清、把風險攤開、把未來是否開新 repo 的條件寫清楚」的工程橋接區。對大二資工學生來說，這是一個很好的練習：你不是只寫程式，而是在學怎麼把一個模糊的醫療科技需求，拆成可討論、可估算、可驗證、可移交的工程工作。

下面我會用軟體工程與系統工程的角度，把整份計畫寫成教程。

---

# 智慧健康倉過渡橋接 Folder 與 6/23 會前準備計畫教程

## 1. 你現在面對的不是單純程式題，而是一個「不確定需求」的系統工程問題

很多大二學生第一次看到這類案子，會直覺想問：

「那我要用 React 還是 Vue？」
「要不要先做 UI？」
「問卷邏輯是不是寫成 JSON 就好？」
「聽力測試是不是用瀏覽器播放聲音就可以？」

這些問題都太早了。

在真實世界裡，尤其是醫療、健康檢測、院方系統、實體設備、Kiosk、CMS、報告、QR Code、HIS 串接這類案子，第一步通常不是 coding，而是 discovery，也就是需求探索。

Discovery 的目的不是做出功能，而是回答幾個更基本的問題：

這個系統到底要解決什麼問題？
哪些功能真的要做？
哪些功能只是客戶初步想像？
哪些結果會被使用者當成醫療判斷？
哪些資料會進入院方系統？
哪些設備可以控制？
哪些資料格式要交付？
誰負責內容正確性？
誰負責臨床審核？
誰負責法規風險？
9 月初整合、9 月中驗收到底是否可行？

所以你現在要建立的 `workstreams/smart-health-cabin/`，本質上是一個「工程決策暫存區」。它幫團隊在正式投入開發前，把不確定性整理成文件、問題、假設、風險與決策。

## 2. 為什麼不要直接在 ai-triage-kiosk-v0 裡開始寫智慧健康倉正式程式？

這是整個計畫最重要的工程判斷。

`ai-triage-kiosk-v0` 看起來跟智慧健康倉有關，因為兩者都可能有 Kiosk、導診、問卷、分流、醫療場域。但它們不一定是同一個產品。

AI Triage Kiosk 可能原本重點是「導診分流」。智慧健康倉則可能包含：

視力自主量測
聽力自主量測
問卷導診分流
報告產生
QR Code 報告
CMS 題庫管理
API / JSON 交付
ERD
未來 HIS-ready data
實體 touch screen
音訊設備
設備校正
醫療內容審核
可能的醫材軟體風險

這已經不是單純把現有系統加一個 feature，而是可能變成新產品線。

如果你現在直接在既有 repo 裡開始寫正式 app，會有幾個後果：

第一，產品邊界混亂。之後別人看到 repo，會搞不清楚這是 AI Triage，還是 Smart Health Cabin。

第二，需求還沒釐清就寫 code，會導致大量重工。例如你先寫了一個「聽力測試頁面」，但 6/23 現場才發現設備沒有耳機、喇叭位置不固定、環境噪音不可控、院方只接受「非醫療篩檢參考」，那你原本寫的測試流程可能大半都要改。

第三，醫療/健康相關系統不能只靠工程直覺。像 SaMD，也就是 Software as a Medical Device，是指為一個或多個醫療目的而使用、且不屬於硬體醫療器材一部分的軟體；如果系統的 intended use 被定義得太像診斷或治療建議，工程與合規負擔會完全不同。IMDRF 有 SaMD 的共通定義，FDA 也針對臨床決策支援軟體說明哪些 CDS 功能可能受到醫療器材監管、哪些可能不屬於 device CDS。([IMDRF][1])

第四，醫療軟體重視 lifecycle、risk management、usability 與 quality system。IEC 62304 是醫療器材軟體生命週期流程的標準；ISO 14971 是醫療器材風險管理標準；IEC 62366-1 則處理醫療器材可用性工程與使用錯誤風險；ISO 13485 是醫療器材品質管理系統常見框架。你現在不一定要完全套用這些標準，但你至少要用它們的工程思維：先定義用途、風險、需求、驗證方法、變更控管與責任分工。([ISO][2])

所以，建立 `workstreams/smart-health-cabin/` 是正確的。它不是正式產品目錄，而是 discovery workstream。

## 3. 什麼是 workstream？

你可以把 workstream 想成「某個議題的工作流資料夾」。

正式產品 repo 通常放：

source code
tests
database migrations
deployment scripts
API implementation
frontend pages
backend services
CI/CD config

但 workstream 放的是：

需求摘要
會議 agenda
問題清單
風險清單
可行性分析
初步架構圖
責任切分
可重用範圍
決策紀錄
會後行動項目

也就是說，workstream 的任務是「幫正式開發做準備」，不是取代正式開發。

這跟真實公司裡常見的做法很像。大型系統在進入 implementation 之前，會先有 discovery、architecture spike、technical due diligence、solution proposal、pre-sales engineering、product requirement clarification 等階段。這些階段的產物通常是文件、圖、表格與決策紀錄，而不是可部署的正式功能。

## 4. 這個資料夾的核心原則

你可以在 `README.md` 最前面寫清楚：

```md
# Smart Health Cabin Workstream

This folder is a transitional discovery and planning workspace for the Smart Health Cabin initiative.

It is NOT the production implementation of the Smart Health Cabin app, CMS, vision module, hearing module, or questionnaire triage system.

The purpose of this folder is to prepare for the 2026-06-23 onsite discovery meeting, organize requirements, identify risks, document assumptions, and define the decision threshold for whether a new repository should be created after the meeting.
```

用中文說就是：

這裡只負責釐清，不負責正式實作。
這裡只收斂問題，不先承諾交付。
這裡只做 feasibility discovery，不先報死工期與死價格。
6/23 後，如果確認進入報價、時程、開發，才開新 repo，例如 `imedtac-smart-health-cabin-v0`。

這個界線非常重要。沒有界線，專案會從一開始就失控。

## 5. 建議資料夾結構

你提供的結構是合理的：

```txt
workstreams/smart-health-cabin/
  README.md
  2026-06-23-onsite-discovery-plan.md
  email-requirements-brief.md
  module-a-vision-hearing-discovery.md
  module-b-questionnaire-triage-discovery.md
  meeting-question-bank.md
  feasibility-response-outline.md
  reuse-from-ai-triage.md
  post-meeting-decision-log.md
```

每個檔案都有明確責任。這是軟體工程裡的 separation of concerns，也就是把不同責任拆開，不要全部塞進一份混亂文件。

大二學生常犯的錯是把所有事情寫進一個 `notes.md`。一開始看起來很方便，兩天後就變成沒人敢維護的垃圾堆。好的工程文件應該像好的程式模組一樣：單一責任、可定位、可更新、可追蹤。

# Part A：每個檔案要怎麼寫

## 6. README.md：定義這個 workstream 的邊界

`README.md` 是別人進資料夾第一個看的檔案。它要回答四件事：

這是什麼？
這不是什麼？
目前依據哪些來源？
什麼情況下要開新 repo？

建議內容：

```md
# Smart Health Cabin Workstream

## Purpose

This folder is a transitional discovery workspace for the Smart Health Cabin initiative.

It supports:
- 2026-06-23 onsite discovery preparation
- requirements clarification
- technical feasibility analysis
- medical/device/software workflow discussion
- delivery responsibility scoping
- future repository migration planning

## Non-goals

This folder does NOT implement:
- production Smart Health Cabin app
- CMS
- vision testing module
- hearing testing module
- questionnaire triage engine
- HIS integration
- production QR report service

## Source Bundle

Current known sources:
- Johnny email
- attached PDF
- existing ai-triage-kiosk-v0 concepts
- 2026-06-23 onsite discussion
- future imedtac / NYCU / 多寶 / Jason Miao technical clarification

## Decision Threshold for New Repository

Create a new repository, such as `imedtac-smart-health-cabin-v0`, if after 2026-06-23 the team confirms:
- Smart Health Cabin is a distinct product scope
- formal quotation is requested
- timeline and MVP scope are agreed
- ownership of CMS / UI / API / ERD / source code is clarified
- medical content and review ownership are assigned
- deployment and device constraints are known
```

這個檔案不是給你自己看的，是給未來所有進來的人看的。三週後有人問「為什麼這些文件放在 AI Triage repo 裡？」README 要能直接回答。

## 7. 2026-06-23-onsite-discovery-plan.md：把會議當成工程任務，不是聊天

很多學生以為會議就是去聽客戶講。但工程會議不是聽故事，而是收集會影響設計的約束。

這份檔案要寫：

會議目標
參與者
議程
現場要觀察的設備
要問的問題
會後要輸出的東西

範例：

```md
# 2026-06-23 Onsite Discovery Plan

## Meeting Objective

Clarify whether the Smart Health Cabin project is technically feasible, medically scoped, and deliverable within the proposed September timeline.

The meeting is not a commitment to start implementation.

## Key Discussion Areas

1. Product scope
2. Device and kiosk environment
3. Vision / hearing measurement assumptions
4. Questionnaire triage design
5. CMS ownership
6. Report and QR Code workflow
7. API / JSON / ERD / HIS-ready requirements
8. Source code delivery scope
9. Timeline and MVP reduction
10. Budget estimation assumptions

## Onsite Observation Checklist

### Kiosk / Hardware

- Touch screen size
- Resolution
- Browser
- Operating system
- Kiosk mode support
- Network policy
- USB / Bluetooth / audio device availability
- Camera / microphone permission
- Speaker position
- User standing or sitting distance
- Physical privacy
- Noise level
- Lighting condition

### Vision Measurement Environment

- Screen physical size
- Pixel density
- Expected user distance
- Whether distance can be controlled
- Whether one-eye occlusion is required
- Whether staff assistance is expected
- Whether results are screening-only

### Hearing Measurement Environment

- Headphone or speaker?
- Left/right channel separation?
- Volume can be locked?
- Ambient noise after enclosure?
- Calibration method?
- Whether test is self-screening only?
- Whether staff review is required?

## Expected Outputs After Meeting

- Updated requirement brief
- Risk register
- MVP scope proposal
- Feasibility response outline
- Ownership matrix
- Recommendation on whether to create new repo
```

這份文件的重點是：讓會議有目的。你不是去「看看情況」，你是去把會影響系統設計的未知數收集回來。

## 8. email-requirements-brief.md：把信件轉成工程需求

客戶信件通常不是規格書。它可能混合：

明確需求
暗示需求
期望
假設
時間壓力
合作模式
未定義名詞
對方自己也還沒想清楚的地方

所以這份文件要把信件拆成兩類：

source-explicit requirements：來源明確寫到的需求。
engineering-inferred questions：我們根據工程經驗推導出的問題。

範例：

```md
# Email Requirements Brief

## Source-explicit Requirements

Based on Johnny's email and attachments, the project appears to include:

1. Vision and hearing self-measurement module
2. Questionnaire-based triage module
3. Report generation
4. QR Code access
5. API / JSON output
6. ERD
7. CMS
8. Deployment documentation
9. Early September integration
10. Mid-September acceptance / trial operation

## Engineering-inferred Questions

The email does not yet clarify:

1. Whether vision/hearing results are medical measurements or screening references
2. Whether the hearing test uses speaker or calibrated headphones
3. Whether the questionnaire triage logic is rule-based, AI-assisted, or content-only
4. Who provides clinical content
5. Who approves medical wording
6. Whether CMS is custom-built or third-party
7. Whether HIS-ready means actual HIS integration or only exportable JSON schema
8. Whether QR reports require authentication, expiration, deletion, or audit logs
9. Whether source code delivery includes deployment scripts and database migrations
10. Whether NYCU owns maintenance after delivery
```

這裡你要學到一個核心能力：不要把客戶講的話直接當規格。工程師要能把自然語言轉成可驗證需求。

## 9. module-a-vision-hearing-discovery.md：視力與聽力不是單純前端畫面

這個模組最容易被低估。

很多學生會想：「視力就是顯示 E 字，聽力就是播放 beep 聲。」

這是錯的。真實系統裡，視力與聽力測試牽涉硬體、環境、校正、使用者操作、結果解讀與醫療宣稱。

### 9.1 視力測試的工程問題

視力測試不是只顯示 Snellen chart。你要知道：

螢幕尺寸是多少？
解析度是多少？
使用者距離螢幕多遠？
距離能不能固定？
是否使用 logMAR、Snellen、Tumbling E、Landolt C？
左右眼是否分開測？
如何遮眼？
是否需要工作人員協助？
測試結果是 20/20、6/6、logMAR，還是自訂等級？
使用者戴不戴眼鏡？
環境光會不會影響結果？
結果是否只做「初步篩檢參考」？

視力篩檢如果放在手機或一般螢幕上，螢幕解析度、文字大小、顯示距離都會影響準確性；有些線上視力工具也明確提醒這類工具只能作為方便篩檢，不應取代正式眼科檢查。([MDCalc][3])

所以在這份 discovery 文件裡，不要寫「我們將實作視力檢查」。你應該寫：

```md
## Vision Module Unknowns

### Product Positioning

- Is this a self-screening feature?
- Is the result intended for staff review only?
- Can the result be printed in a user-facing report?
- What wording is allowed?
- Who approves the clinical interpretation?

### Device Constraints

- Screen size:
- Resolution:
- Pixel density:
- Viewing distance:
- Lighting condition:
- User posture:
- Staff assistance:

### Engineering Risks

- Inaccurate visual angle if viewing distance is not controlled
- Font/rendering differences across browsers
- User memorization if optotypes are repeated
- Incorrect eye occlusion
- Accessibility issues for elderly users
- Medical claim risk if result is presented as diagnostic
```

### 9.2 聽力測試的工程問題

聽力比視力更麻煩。

如果用喇叭播放聲音，會遇到：

左右耳無法分離
音量不一定準
使用者位置會影響聲壓
環境噪音會遮蔽聲音
不同喇叭頻率響應不同
瀏覽器音量與 OS 音量可能不一致
沒校正就不能把播放音量直接說成 dB HL
使用者可能聽到空間反射聲
機艙隔音效果不明

正式純音聽力檢查通常會受到環境噪音與校正條件影響；英國聽力學會的純音聽力程序提到，一般情況下環境噪音若超過特定門檻就不建議進行 audiometry，相關研究也指出環境噪音會透過 masking 與分心影響純音閾值測量。([The BSA][4])

瀏覽器技術上可以用 Web Audio API 控制音源、音量、節點與音訊處理；也可以透過 `getUserMedia()` 存取麥克風，但這些 API 本身不等於醫療級校正。MDN 說明 Web Audio API 可用於控制網頁音訊來源、效果與處理；`getUserMedia()` 會要求使用者授權並回傳音訊或視訊串流。([MDN Web Docs][5])

因此 discovery 文件應該這樣寫：

```md
## Hearing Module Unknowns

### Product Positioning

- Is this a hearing screening feature only?
- Is it allowed to show frequency-specific result?
- Is it allowed to show suspected hearing loss?
- Does staff need to review the result before user sees it?

### Hardware and Environment

- Speaker or headphones?
- If headphones: model, calibration, hygiene, left/right channel separation
- If speakers: position, distance, stereo separation
- Ambient noise level inside cabin
- Whether volume can be locked
- Whether OS-level volume can be controlled
- Whether microphone can monitor noise

### Engineering Risks

- Speaker-based testing cannot reliably isolate ears
- Uncalibrated volume cannot be interpreted as clinical dB HL
- Ambient noise may invalidate threshold-like tests
- User may misunderstand screening result as diagnosis
- Browser/OS audio stack may introduce inconsistent output
```

### 9.3 可用技術與套件

若只是做「初步篩檢 demo」或「互動流程 prototype」，可考慮：

Frontend：Next.js + TypeScript + React
Audio：Web Audio API
UI：Tailwind CSS + shadcn/ui
State machine：XState
Validation：Zod
Device noise probe：`navigator.mediaDevices.getUserMedia()`
Report rendering：React PDF 或 server-side PDF generator
Data storage：PostgreSQL
API：FastAPI 或 NestJS
OpenAPI：FastAPI 內建 OpenAPI 文件能力

Next.js App Router 是檔案系統式 router，支援 React Server Components、Suspense 與 Server Functions；FastAPI 會基於 OpenAPI 自動產生互動式 API 文件。這兩個特性對 prototype、API contract 與跨團隊溝通很有幫助。([Next.js][6])

但要注意：技術可行不代表產品可行。Web Audio API 可以播聲音，不代表可以做醫療級聽力檢查。React 可以畫視力圖，不代表結果可被稱為視力診斷。工程師要分清楚「可以實作互動」與「可以宣稱測量有效」。

## 10. module-b-questionnaire-triage-discovery.md：問卷導診不是 Google Form

問卷導診分流看起來簡單，但真實情況很容易複雜化。

一個正式問卷導診系統通常包含：

題庫
題型
選項
跳題邏輯
風險警示
科別建議
衛教內容
版本控管
CMS 編輯
臨床審核
發佈流程
報告文字
API 輸出
audit log
多語系
內容有效期間
回滾機制

如果你只是用 Google Form 的想法去做，會很快撞牆。

### 10.1 問卷導診的核心資料模型

最基本的問卷可以抽象成：

Questionnaire
Question
Option
Rule
Recommendation
EducationContent
Version
ReviewStatus

例如：

```json
{
  "questionnaireId": "triage-general-v1",
  "version": "1.0.0",
  "status": "draft",
  "questions": [
    {
      "id": "q_chest_pain",
      "type": "single_choice",
      "text": "您目前是否有胸痛？",
      "required": true,
      "options": [
        {
          "id": "yes",
          "label": "有",
          "score": 10,
          "nextQuestionId": "q_chest_pain_duration"
        },
        {
          "id": "no",
          "label": "沒有",
          "score": 0,
          "nextQuestionId": "q_fever"
        }
      ]
    }
  ],
  "rules": [
    {
      "id": "rule_emergency_chest_pain",
      "condition": {
        "all": [
          { "questionId": "q_chest_pain", "operator": "equals", "value": "yes" },
          { "questionId": "q_shortness_of_breath", "operator": "equals", "value": "yes" }
        ]
      },
      "recommendation": {
        "severity": "urgent",
        "message": "建議立即由現場人員協助評估。",
        "department": "急診或胸腔/心臟相關評估"
      }
    }
  ]
}
```

這裡有一個工程重點：你不要把問卷邏輯硬寫死在 React component 裡。正確做法是把「題目資料」和「顯示邏輯」分開。React 只負責根據 JSON schema 顯示題目；規則引擎負責根據答案計算下一題或建議。

### 10.2 CMS 為什麼重要？

CMS 是 Content Management System，內容管理系統。它讓非工程人員可以管理題庫、衛教文字、科別建議與版本，而不用每次都請工程師改 code。

可選技術有：

Strapi
Directus
Sanity
Payload CMS
自建 admin panel

Strapi 是開源 headless CMS，支援用內容模型建立 REST 與 GraphQL API；它的特點是可以讓內容編輯者透過後台管理內容，前端再透過 API 取用。([Strapi][7])

但 CMS 不是萬靈丹。醫療內容不是一般部落格文章。你還要有：

draft / review / approved / published 狀態
醫師或院方 sign-off
版本記錄
誰改了什麼
什麼時候上線
錯誤內容如何回滾
舊報告如何對應舊版本邏輯

所以在 discovery 文件裡，要問：

```md
## Questionnaire / Triage Unknowns

### Content Ownership

- Who provides the question bank?
- Who writes health education content?
- Who maps answers to department recommendations?
- Who clinically reviews the logic?
- Who approves user-facing text?

### CMS Requirements

- Is CMS required in MVP?
- Who will use the CMS?
- What roles are needed?
  - editor
  - reviewer
  - publisher
  - admin
- Is version history required?
- Is approval workflow required?
- Is rollback required?

### Triage Logic

- Rule-based?
- Score-based?
- AI-assisted?
- Department mapping table?
- Red-flag emergency rules?
- Can multiple departments be recommended?
- How to handle uncertainty?

### Safety Wording

- Should the system avoid diagnosis?
- Should output say “初步篩檢參考”?
- Should output say “請由現場人員或醫療專業人員確認”?
```

這些問題比「用哪個 UI 套件」重要得多。

# Part B：Johnny 這封信到底想討論什麼？

## 11. 這不是單純 API 會議

Johnny 的核心不是：「請你們幫我接 API。」

如果只是 API 會議，問題會是：

endpoint 是什麼？
request body 是什麼？
response body 是什麼？
authentication 怎麼做？
error code 有哪些？
rate limit 多少？

但現在信件提到的範圍明顯更大：

視力/聽力自主量測
問卷導診
CMS
UI/UX
API
ERD
source code
報告
QR Code
HIS-ready
9 月初整合
9 月中驗收

這表示他真正想討論的是三件事交疊：

技術架構
醫療/器材/軟體流程設計
合作交付範圍

所以你們 6/23 不能只帶 AI Triage demo，也不能只談醫學內容。你們要準備成 feasibility discovery。

## 12. 合作範圍要怎麼拆？

真實專案裡，最危險的不是技術不會做，而是「誰負責什麼」沒講清楚。

可以用 RACI matrix。RACI 是責任分工表：

Responsible：實際執行的人
Accountable：最後負責的人
Consulted：需要被諮詢的人
Informed：需要被告知的人

範例：

| 工作項目 | imedtac | NYCU | 多寶 | Jason Miao | 院方/醫師 |
| --- | --- | --- | --- | --- | --- |
| Kiosk 硬體規格 | A/R | C | C | C | I |
| 視力測試流程 | C | R | C | C | A/C |
| 聽力測試可行性 | C | R | C | C | A/C |
| 問卷題庫 | C | C | I | C | A/R |
| CMS 實作 | A? | R? | C? | C? | I |
| UI/UX Figma | A? | R? | C? | C? | C |
| API schema | C | R | C | C | I |
| ERD | C | R | I | C | I |
| 醫療文字審核 | I | C | I | C | A/R |
| 部署文件 | C | R | C | I | I |
| 驗收標準 | A/R | C | C | C | C |

注意表格裡有很多 `?`。這正是 6/23 要問的問題。

# Part C：系統架構怎麼思考？

## 13. 智慧健康倉可以拆成五層

你可以把系統想成五層：

第一層：使用者互動層
第二層：量測與問卷流程層
第三層：後端 API 與資料層
第四層：內容管理與審核層
第五層：報告、QR Code、HIS-ready 交換層

簡化架構：

```txt
[User]
  |
  v
[Touch Screen Kiosk Web App]
  |        \
  |         \-- [Vision / Hearing Interaction]
  |
  v
[Questionnaire Flow Engine]
  |
  v
[Backend API]
  |
  +--> [PostgreSQL Database]
  +--> [CMS]
  +--> [Report Generator]
  +--> [QR Code Service]
  +--> [FHIR / JSON Export Layer]
  +--> [Audit Log]
```

這張圖的重點不是技術潮不潮，而是讓每一層責任清楚。

前端 Kiosk 不應該直接決定醫療建議。
CMS 不應該直接改 production 規則而沒有審核。
QR Code 不應該裸露個資。
FHIR-ready 不應該只是一句口號。
報告文字不應該像診斷書。
資料庫要能追蹤當時用的是哪一版問卷和哪一版規則。

## 14. 前端 Kiosk：建議技術選型

若做第一版 MVP，我會建議：

Next.js + TypeScript + React
Tailwind CSS
shadcn/ui
Zod
XState
Web Audio API
PWA / kiosk mode
Playwright 做 end-to-end tests

Next.js 適合做 kiosk web app，因為它可以同時處理頁面、API route、server/client component 的分工；官方文件也明確說 App Router 是檔案系統式 router，使用 React 的 Server Components、Suspense 與 Server Functions。([Next.js][6])

Zod 可以做前端資料驗證，例如答案格式、題型格式、CMS 回來的 JSON 是否符合預期。XState 適合做流程狀態機，例如：

idle
start
vision_test_left_eye
vision_test_right_eye
hearing_instruction
hearing_test
questionnaire
review
report
finish
error

為什麼要用狀態機？因為 kiosk 流程不是一般網頁。使用者可能中途離開、點錯、設備失敗、網路斷線、報告產生失敗。狀態機可以讓流程明確，不會散落在一堆 `useState` 裡。

範例狀態：

```ts
type CabinState =
  | "idle"
  | "consent"
  | "visionInstruction"
  | "visionLeftEye"
  | "visionRightEye"
  | "hearingInstruction"
  | "hearingCalibrationCheck"
  | "hearingTest"
  | "questionnaire"
  | "generatingReport"
  | "showingQrCode"
  | "finished"
  | "error";
```

## 15. 後端 API：建議技術選型

有兩條常見路線。

路線 A：TypeScript 全端

Frontend：Next.js
Backend：NestJS 或 Next.js API routes
ORM：Prisma
Database：PostgreSQL
Validation：Zod
CMS：Strapi / Directus / Payload CMS

Prisma ORM 提供 schema-first workflow、型別安全查詢、migration 與 Prisma Studio；對 TypeScript 團隊來說，這很適合讓資料模型與程式碼同步。([Prisma][8])

路線 B：Python API

Frontend：Next.js
Backend：FastAPI
ORM：SQLAlchemy
Migration：Alembic
Validation：Pydantic
Database：PostgreSQL
CMS：Strapi / Directus
Report：WeasyPrint / Playwright PDF / ReportLab

FastAPI 的優點是開發速度快，會自動產生 OpenAPI schema 與互動式文件；這對 API contract 討論非常有用。([FastAPI][9])

我的建議：如果團隊前端與全端能力較強，用 TypeScript 全端。若未來有 AI、資料分析、模型服務，FastAPI 會比較自然。第一版不要同時引入太多語言，否則維護成本會上升。

## 16. 資料庫：不要只存「最後結果」

很多學生設計資料庫時只會想存：

使用者答案
測試結果
報告 URL

這不夠。

健康/醫療流程要能追蹤：

這份報告是哪一版問卷產生的？
哪一版規則產生的？
哪一版衛教文字？
使用者看到的問題文字當時是什麼？
誰修改過題庫？
誰審核過？
結果何時產生？
QR Code 是否過期？
誰看過報告？
資料是否刪除？
是否匯出過？

一個初步 ERD 可以這樣拆：

```txt
UserSession
  id
  startedAt
  finishedAt
  kioskId
  status
  consentVersion

MeasurementResult
  id
  sessionId
  moduleType       // vision | hearing
  rawDataJson
  interpretedJson
  deviceContextJson
  createdAt

QuestionnaireVersion
  id
  questionnaireKey
  version
  status           // draft | review | approved | published | archived
  contentJson
  approvedBy
  approvedAt
  publishedAt

QuestionnaireResponse
  id
  sessionId
  questionnaireVersionId
  answersJson
  scoreJson
  createdAt

TriageRecommendation
  id
  sessionId
  questionnaireVersionId
  recommendationJson
  safetyLevel
  createdAt

Report
  id
  sessionId
  reportVersion
  reportJson
  pdfPath
  qrTokenHash
  expiresAt
  createdAt

AuditLog
  id
  actorId
  action
  targetType
  targetId
  metadataJson
  createdAt
```

你會發現這裡大量使用 JSON。這不是偷懶，而是因為 early-stage discovery 階段資料結構還沒完全穩定。不過 production 要小心：重要查詢欄位仍應該正規化，例如 `sessionId`、`version`、`status`、`createdAt`。

## 17. 報告與 QR Code：不要把報告做成公開裸連結

QR Code 很容易被低估。

天真的做法：

```txt
https://example.com/report/123
```

這很危險。任何人猜到 ID 就能看報告。

比較好的做法：

```txt
/report/view?token=<signed-random-token>
```

後端資料庫存的是 token hash，不存明文 token。token 有有效期限。報告頁面只顯示必要資訊。若含敏感資料，要考慮登入、一次性 token、短效期限、存取紀錄、刪除流程。

台灣個資法對醫療、醫療紀錄、健康檢查等資料有特別敏感的規範；官方個資保護委員會資料也說明與醫療紀錄、醫療、基因、性生活、健康檢查、犯罪前科相關的個人資料不得任意蒐集、處理或利用，除非符合法定條件。([Personal Data Protection Commission][10])

所以 QR Code 報告要問：

QR Code 有效多久？
是否需要登入？
是否只給使用者自己看？
院方人員是否可看？
報告是否可下載 PDF？
是否包含姓名、生日、電話、身分證字號？
是否可刪除？
是否記錄誰查看？
是否要 audit log？
是否要加浮水印？
是否要避免在 URL 中出現個資？

## 18. HIS-ready data：不要亂說「我們支援 HIS」

HIS 是 Hospital Information System，醫院資訊系統。HIS-ready 通常有三種程度：

第一種：只提供 JSON export。
第二種：提供符合某種醫療資料交換格式的 schema，例如 HL7 FHIR。
第三種：真的跟院方 HIS 串接，包含身份驗證、病人匹配、欄位 mapping、錯誤重送、audit log、測試環境、正式環境、資安審查。

這三種難度差非常多。

所以 6/23 要問清楚：「HIS-ready」到底是哪一種。

如果只是資料交換設計，可以先討論 HL7 FHIR。FHIR 是 HL7 發布的健康資料交換標準；FHIR 的 Observation 可表示量測、檢驗等觀察資料，DiagnosticReport 則可提供一組 Observation 的臨床或工作流程脈絡。HL7 R5 是目前官方發布版本之一，但台灣核心實作指引 TW Core v1.0.0 是基於 FHIR R4，因此若目標是台灣院方互通，應優先詢問院方或 imedtac 是否要求 FHIR R4 / TW Core，而不是自行假設 R5。([HL7][11])

範例：視力結果可以先設計成內部 JSON：

```json
{
  "module": "vision",
  "screeningOnly": true,
  "leftEye": {
    "value": "0.8",
    "unit": "decimal_acuity",
    "method": "screen-based self screening"
  },
  "rightEye": {
    "value": "1.0",
    "unit": "decimal_acuity",
    "method": "screen-based self screening"
  },
  "deviceContext": {
    "screenSizeInch": 24,
    "resolution": "1920x1080",
    "viewingDistanceCm": 300,
    "lightingControlled": false
  }
}
```

未來若要轉 FHIR Observation，再建立 mapping：

```json
{
  "resourceType": "Observation",
  "status": "final",
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/observation-category",
          "code": "exam",
          "display": "Exam"
        }
      ]
    }
  ],
  "subject": {
    "reference": "Patient/example"
  },
  "valueString": "screening result only"
}
```

注意：這只是概念範例，不是正式醫療交換規格。正式 mapping 要看院方、TW Core、欄位需求與 code system。

# Part D：6/23 會前四份材料怎麼準備

## 19. 一頁式需求摘要

這份文件給會議開場用。目標是讓所有人快速對齊。

內容可以這樣寫：

```md
# Smart Health Cabin One-page Requirement Summary

## Known Modules

### Module A: Vision / Hearing Self-measurement

Current understanding:
- User performs vision and hearing screening inside the cabin
- Results may be included in generated report
- Technical feasibility depends on screen, audio device, calibration, noise, UI flow, and medical wording

### Module B: Questionnaire Triage

Current understanding:
- User answers questionnaire
- System recommends possible department or next step
- Logic may require CMS, branching, clinical review, versioning, and report integration

## Common Deliverables Mentioned

- Kiosk UI
- Report
- QR Code report access
- API / JSON
- ERD
- CMS
- Deployment document
- Source code delivery

## Dates Mentioned

- Early September: integration
- Mid-September: acceptance / trial operation

## Current Position

The current information is insufficient for a fixed-price and fixed-schedule commitment.

A feasible quotation requires clarification of:
- product scope
- medical positioning
- device constraints
- CMS ownership
- content ownership
- API/HIS expectations
- validation requirements
- acceptance criteria
```

這份文件要避免過度承諾。你要讓對方知道：我們願意協助，但目前資訊不足以報死價格和死工期。

## 20. 現場設備檢查表

這份文件是工程師現場要拿著看的。不要只聽口頭說明，要觀察實體條件。

```md
# Onsite Device Checklist

## Display

- Screen size:
- Resolution:
- Orientation:
- Touch accuracy:
- Brightness:
- Anti-glare:
- Installation height:
- User distance:
- Sitting or standing:

## Operating Environment

- OS:
- Browser:
- Browser version:
- Kiosk mode:
- Network type:
- Firewall:
- Proxy:
- CORS restrictions:
- Offline requirement:
- Auto reboot policy:

## Audio

- Speaker model:
- Speaker location:
- Stereo support:
- Headphone availability:
- Volume control:
- OS volume lock:
- Ambient noise inside cabin:
- Noise after door closed:
- Microphone availability:
- Calibration method:

## Peripheral / Integration

- Camera:
- QR scanner:
- Printer:
- NFC / card reader:
- USB access:
- Bluetooth access:
- Device SDK:
- Vendor API documentation:

## Allowed Evidence Collection

- May we take photos?
- May we record video?
- May we measure noise?
- May we export device specs?
- May we access browser console?
- May we install test page?
```

現場檢查表的價值在於：避免會後才發現「我們連設備規格都不知道」。

## 21. 醫療/內容設計問題表

這份文件不是讓工程師假裝醫師，而是確保醫療內容責任清楚。

```md
# Medical / Content Design Questions

## Vision / Hearing Positioning

- Are these features self-screening only?
- Can results be shown directly to the user?
- Should staff review results before report generation?
- What exact wording is allowed?
- What wording is prohibited?
- Is this considered a medical device function?
- Who decides the intended use?

## Questionnaire Triage

- Who provides the question bank?
- Who approves the triage logic?
- Who writes health education content?
- Who maps symptoms to departments?
- Are red-flag symptoms included?
- Is emergency escalation required?
- Can the system recommend more than one department?
- What should happen if the system is uncertain?

## Review and Sign-off

- Is physician sign-off required?
- Is hospital sign-off required?
- Is imedtac sign-off required?
- Is version approval required before publishing?
- How are content changes requested?
- How are old versions archived?
```

這裡要特別小心用語。對使用者輸出的文字建議避免：

「你患有……」
「你應該服用……」
「診斷結果是……」
「不需要就醫」
「你沒有問題」

比較安全的表述通常是：

「本結果僅供初步篩檢參考。」
「請由現場人員或醫療專業人員確認。」
「若有不適或症狀持續，請尋求醫療協助。」
「此系統不取代正式醫療診斷。」

## 22. 技術與交付責任問題表

這份文件要把工程交付切清楚。

```md
# Technical and Delivery Responsibility Questions

## CMS

- Is CMS required for MVP?
- Who builds CMS?
- Who hosts CMS?
- Who uses CMS?
- What roles are needed?
- Is approval workflow required?
- Is content versioning required?

## UI/UX

- Who provides Figma?
- Is there an existing design system?
- Are accessibility requirements defined?
- Is elderly user interaction considered?
- Is multi-language support required?

## API / JSON / ERD

- Who consumes API?
- Is JSON enough?
- Is OpenAPI spec required?
- Is ERD required as documentation only or as implementation artifact?
- Is database migration included?
- Is seed data included?

## HIS-ready

- Does HIS-ready mean export schema only?
- Does it mean FHIR?
- Does it mean actual HIS integration?
- Is there a test HIS environment?
- Who handles authentication?
- Who handles patient identity matching?

## Source Code

- Is source code delivery required?
- What license?
- Who owns future maintenance?
- Are deployment scripts included?
- Are CI/CD workflows included?
- Is documentation included?
```

這份文件的重點是避免「交付範圍無限膨脹」。

# Part E：reuse-from-ai-triage.md 要怎麼寫

## 23. 什麼可以重用？

你可以重用的是「概念」與「部分技術模式」，不一定是程式碼。

可重用：

Kiosk UI flow 的經驗
問卷流程的概念
分流結果呈現方式
報告頁面的版型概念
API contract 設計習慣
部署與環境變數管理方式
錯誤處理模式
audit log 概念
使用者 session flow
前端元件設計風格
CI/CD 設定經驗

不建議直接重用：

正式醫療邏輯
資料庫 schema
AI triage prompt
既有科別 mapping
沒有審核過的醫療文字
直接把舊 app 改成智慧健康倉
沒有版本控管的題庫
未驗證的 UI 流程
未確認合法性的診斷表述

範例：

```md
# Reuse from AI Triage

## Potentially Reusable Concepts

- Kiosk session flow
- Questionnaire UI components
- Report layout pattern
- Department recommendation display pattern
- API documentation style
- Error handling conventions
- Deployment notes
- Environment variable structure

## Not Directly Reusable

- Existing triage medical logic
- Existing symptom-to-department mapping
- Existing report wording
- Existing database schema without review
- Any AI-generated clinical recommendation without clinical validation
- Any implementation that assumes AI Triage and Smart Health Cabin are the same product

## Migration Strategy

If Smart Health Cabin becomes a formal project:
1. Create a new repository
2. Copy only reviewed reusable components
3. Rebuild data model based on confirmed requirements
4. Add versioning and auditability from the beginning
5. Separate screening modules from questionnaire triage modules
```

這份文件可以防止團隊「看起來很快」但其實把舊系統的錯誤假設帶進新產品。

# Part F：feasibility-response-outline.md 要怎麼寫

## 24. 可行性回覆不是報價單

6/23 會後，imedtac 可能想知道：

能不能做？
多久？
多少錢？
誰做？
風險是什麼？
MVP 怎麼切？

你不能直接回答「可以，兩個月」。這是不負責任的。

可行性回覆應該長這樣：

```md
# Feasibility Response Outline

## 1. Executive Summary

Based on the 2026-06-23 discovery meeting, Smart Health Cabin appears feasible as a phased MVP if scope is limited to screening-support workflows, questionnaire triage, report generation, and structured data export.

However, formal medical-grade vision/hearing measurement, real HIS integration, and full CMS approval workflow may require additional validation, regulatory review, and timeline extension.

## 2. Confirmed Scope

- Kiosk web app
- Vision/hearing screening workflow
- Questionnaire triage workflow
- Report generation
- QR Code report access
- Basic CMS or admin content management
- JSON / API export
- ERD and deployment documentation

## 3. Open Questions

- Medical positioning
- Device calibration
- Hearing test hardware
- Clinical content owner
- CMS approval workflow
- HIS integration depth
- Data retention policy
- Acceptance criteria

## 4. MVP Recommendation

### MVP Option 1: Narrow MVP

- Screening-only wording
- No formal hearing threshold claim
- Rule-based questionnaire
- Static approved content
- Basic report
- QR Code with expiring token
- JSON export only

### MVP Option 2: Expanded MVP

- CMS with draft/review/publish
- More complete audit log
- Device context capture
- FHIR mapping draft
- More formal validation test plan

### Not Recommended for MVP

- Full HIS integration
- Medical-grade hearing diagnosis
- AI-generated autonomous medical recommendation
- Complex multi-site CMS workflow
- Unvalidated device-based measurement claim

## 5. Timeline Assumptions

Timeline depends on:
- finalized scope
- device availability
- content readiness
- clinical review speed
- CMS complexity
- report approval
- integration environment

## 6. Cost Assumptions

Cost should be estimated based on:
- number of modules
- CMS complexity
- report complexity
- API/HIS depth
- validation requirements
- deployment support
- maintenance obligations

## 7. Recommended Next Step

Proceed to a short technical specification phase before fixed quotation.
```

這裡的專業點在於：你不是說不能做，而是說「在什麼假設下可以做」。

# Part G：post-meeting-decision-log.md 要怎麼寫

## 25. 決策紀錄比會議紀錄更重要

會議紀錄常常只是：

今天討論 A
某人說 B
下次再確認 C

但工程上更重要的是 decision log：

做了什麼決策？
為什麼？
誰負責？
什麼時候要完成？
還有哪些 unresolved issues？

範例：

```md
# Post-meeting Decision Log

## Decision 001: Repository Strategy

Date: 2026-06-23
Decision: Create a new repository if imedtac confirms formal development scope.
Rationale: Smart Health Cabin is broader than AI Triage and includes device, CMS, report, and possible HIS-ready requirements.
Owner: NYCU technical lead
Status: Pending imedtac confirmation

## Decision 002: Vision/Hearing Positioning

Date: 2026-06-23
Decision: Use "screening support" wording unless formal clinical validation is provided.
Rationale: Device calibration and intended use are not yet sufficient for diagnostic claims.
Owner: Clinical/content owner
Status: Pending

## Decision 003: Questionnaire Engine

Date: 2026-06-23
Decision: First version should use rule-based questionnaire logic, not autonomous AI recommendation.
Rationale: Rule-based logic is easier to review, version, validate, and explain.
Owner: Software architecture lead
Status: Proposed
```

這份文件可以保護團隊。三週後如果有人說「我以為你們要做完整 HIS 串接」，你可以回到 decision log 看當時是否真的決定過。

# Part H：真實世界開發流程範例

## 26. 從 6/17 到 6/23，你應該怎麼做？

今天是 2026/6/17。6/23 前不是做產品，而是做準備。

### 6/17–6/18：建立 workstream 與第一版文件

建立資料夾：

```bash
mkdir -p workstreams/smart-health-cabin
touch workstreams/smart-health-cabin/README.md
touch workstreams/smart-health-cabin/2026-06-23-onsite-discovery-plan.md
touch workstreams/smart-health-cabin/email-requirements-brief.md
touch workstreams/smart-health-cabin/module-a-vision-hearing-discovery.md
touch workstreams/smart-health-cabin/module-b-questionnaire-triage-discovery.md
touch workstreams/smart-health-cabin/meeting-question-bank.md
touch workstreams/smart-health-cabin/feasibility-response-outline.md
touch workstreams/smart-health-cabin/reuse-from-ai-triage.md
touch workstreams/smart-health-cabin/post-meeting-decision-log.md
```

開 branch：

```bash
git checkout -b workstream/smart-health-cabin-discovery
```

commit message：

```bash
git add workstreams/smart-health-cabin
git commit -m "Add Smart Health Cabin discovery workstream"
```

這個 commit 不是產品功能，所以不要寫 `feat:`。可以用：

```txt
docs: add Smart Health Cabin discovery workstream
```

### 6/19–6/20：整理 email requirements 與 question bank

把 Johnny email 拆成：

已知需求
未知問題
風險
需現場確認事項
需會後確認事項

### 6/21：整理可行性假設

先寫出三種 scope：

Narrow MVP
Expanded MVP
Not recommended for September

### 6/22：內部 review

找團隊一起看：

有沒有過度承諾？
有沒有漏問設備？
有沒有漏問醫療內容責任？
有沒有把 HIS-ready 想得太簡單？
有沒有把 CMS 想得太簡單？

### 6/23：現場 discovery

現場不是展示 showmanship，而是收斂未知數。

## 27. 6/23 當天建議 agenda

可以安排成：

```md
## Proposed Agenda

### 1. Opening and Goal Alignment — 10 min

Clarify that today's meeting is for requirements discovery and feasibility assessment.

### 2. Smart Health Cabin Product Scope — 20 min

Discuss target users, use scenarios, success criteria, and MVP expectations.

### 3. Device / Kiosk Environment Walkthrough — 30 min

Inspect touch screen, OS, browser, audio, network, and physical setup.

### 4. Module A: Vision / Hearing — 40 min

Clarify measurement positioning, hardware assumptions, calibration, output wording, and validation expectations.

### 5. Module B: Questionnaire Triage — 40 min

Clarify question source, branching logic, department mapping, health education content, CMS, and clinical review.

### 6. Report / QR Code / Data Export — 30 min

Clarify report format, privacy, expiration, API, JSON, FHIR/HIS-ready expectations.

### 7. Delivery Scope and Ownership — 30 min

Clarify UI/UX, CMS, API, ERD, source code, deployment, testing, and maintenance responsibility.

### 8. Timeline and MVP Reduction — 20 min

Discuss what must be included for September and what should be deferred.

### 9. Next Steps — 10 min

Agree on action items, owners, and date for feasibility response.
```

# Part I：meeting-question-bank.md 的問題清單

## 28. 對 Johnny 的問題

```md
## Questions for Johnny

1. What is the primary goal of Smart Health Cabin in the September pilot?
2. Is the September target a demo, trial operation, or formal acceptance?
3. Which functions are must-have for September?
4. Which functions can be deferred?
5. Who is the final decision-maker for scope?
6. Who approves medical wording?
7. Who approves UI/UX?
8. Who owns final acceptance criteria?
9. What does "HIS-ready" mean in this project?
10. Is source code handover required?
11. Is maintenance after delivery expected?
12. Is there a fixed budget range?
13. Is NYCU expected to build, advise, or co-develop?
14. Which parts does imedtac expect to own?
15. Which parts does 多寶 expect to own?
```

## 29. 對 Jason Miao / 工程端的問題

```md
## Questions for Engineering

1. What hardware will run the kiosk?
2. What OS and browser?
3. Can we run a browser-based app?
4. Is kiosk mode required?
5. Is internet always available?
6. Is the app expected to work offline?
7. Are device APIs or SDKs available?
8. Can the browser access microphone/audio devices?
9. Can the browser access camera or QR scanner?
10. Is there a printer?
11. Are there firewall or proxy restrictions?
12. Is there a staging environment?
13. How will deployment happen?
14. Who manages production servers?
15. What logging is allowed?
```

## 30. 對醫療/內容端的問題

```md
## Questions for Clinical / Content Owner

1. Are vision and hearing results screening-only?
2. What exact phrases are allowed in reports?
3. What phrases are prohibited?
4. Who provides question bank?
5. Who reviews question bank?
6. Who maps symptoms to departments?
7. Are emergency red-flag rules needed?
8. Is physician sign-off required before publishing?
9. How often will content change?
10. Are multiple languages required?
11. Are elderly users a primary user group?
12. Should the system display uncertainty?
13. Should staff review before report generation?
```

## 31. 對 CMS / 交付端的問題

```md
## Questions for CMS and Delivery

1. Is CMS required in first release?
2. Who will edit content?
3. How many roles are required?
4. Is approval workflow needed?
5. Is version history needed?
6. Is rollback needed?
7. Should CMS be custom-built or use third-party headless CMS?
8. Should content be exported as JSON?
9. Should API docs be generated?
10. Is ERD required for documentation only or implementation review?
11. Are automated tests required?
12. Is source code escrow or handover required?
```

# Part J：風險管理怎麼做？

## 32. 用簡化版 risk register，不要只寫「有風險」

醫療與健康系統的風險不能只寫成：

「聽力測試可能不準」
「時程可能趕不上」

這太粗糙。

應該寫成：

| Risk ID | 風險 | 原因 | 影響 | 可能性 | 嚴重度 | 緩解方式 | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-001 | 聽力結果被誤認為診斷 | 報告文字不清楚 | 使用者錯誤理解 | 中 | 高 | 使用 screening-only wording，臨床審核 | Clinical |
| R-002 | 喇叭無法可靠測左右耳 | 無耳機或聲道分離不足 | 結果可信度低 | 高 | 高 | MVP 不宣稱正式聽力閾值，只做流程展示或改用耳機 | Engineering |
| R-003 | 9 月時程不可行 | CMS、報告、設備、審核都未定 | 延遲交付 | 中 | 高 | 切 Narrow MVP | PM |
| R-004 | 題庫內容無人負責 | 醫療內容 owner 未定 | 無法驗收 | 中 | 高 | 6/23 指派 clinical owner | Johnny |
| R-005 | QR 報告暴露敏感資料 | URL 無權限或無期限 | 個資風險 | 中 | 高 | expiring token、audit log、最小揭露 | Backend |

ISO 14971 的精神是系統性地識別危害、估計與評估風險、控制風險，並監控控制措施是否有效。即使專案初期不正式做完整 ISO 14971 文件，你也應該用這種思路管理風險。([ISO][12])

# Part K：MVP 應該怎麼切？

## 33. 9 月若要準時，MVP 必須縮

你提供的日期是：

9 月初整合
9 月中驗收/試營運

從 6/23 到 9 月初，實際可用開發時間非常短。中間還要需求確認、UI、內容、審核、設備測試、報告、部署、驗收。若範圍不砍，失敗機率很高。

我建議分三層。

### Narrow MVP：最可能準時

包含：

Kiosk web app 基本流程
視力/聽力 screening-only 互動流程
問卷導診 rule-based engine
固定版題庫，不做完整 CMS
基本報告
QR Code 短效連結
JSON export
基本 ERD
部署文件
明確 disclaimer
基本 audit log

不包含：

完整醫療級聽力測試
正式 HIS 串接
完整 CMS 審核流程
AI 自主醫療建議
複雜多角色權限
多院區管理
完整 FHIR production integration

### Expanded MVP：如果資源與需求很清楚才做

包含：

簡易 CMS
draft/review/publish
版本控管
更完整 audit log
FHIR mapping draft
更完整報告模板
device context capture
內容回滾

### 不建議 9 月做

正式醫療診斷宣稱
無耳機醫療級聽力測量
完整 HIS 實際串接
AI 自主診斷建議
複雜臨床決策支援
完整醫材送審等級文件

# Part L：一個實際技術流程範例

## 34. 使用者進入智慧健康倉的完整流程

假設第一版 Narrow MVP：

```txt
1. 使用者進入智慧健康倉
2. 觸控螢幕顯示使用說明與同意聲明
3. 系統建立 UserSession
4. 使用者進行視力 screening
5. 系統記錄視力互動結果與設備 context
6. 使用者進行聽力 screening
7. 系統記錄聽力互動結果與環境/音量 context
8. 使用者回答問卷
9. Rule engine 計算分流建議
10. 系統產生報告
11. 系統產生 QR Code
12. 使用者掃 QR Code 查看報告
13. 後端保存 session、responses、report、audit log
14. 若需要，匯出 JSON 給 imedtac 或院方系統
```

這個流程裡，真正困難的不是第 4 步或第 6 步的 UI，而是資料與責任：

視力結果能不能寫進報告？
聽力結果用什麼詞？
問卷建議誰負責？
報告是否有醫療審核？
QR Code 是否保護個資？
JSON 是否符合未來 HIS mapping？
哪一版規則產生了這份建議？

## 35. API 設計範例

可以先用 REST API：

```txt
POST /api/sessions
POST /api/sessions/{sessionId}/vision-results
POST /api/sessions/{sessionId}/hearing-results
GET  /api/questionnaires/current
POST /api/sessions/{sessionId}/questionnaire-responses
POST /api/sessions/{sessionId}/triage-evaluation
POST /api/sessions/{sessionId}/reports
GET  /api/reports/{reportToken}
GET  /api/sessions/{sessionId}/export-json
```

範例 response：

```json
{
  "sessionId": "sess_01J...",
  "status": "report_ready",
  "report": {
    "reportId": "rep_01J...",
    "qrTokenExpiresAt": "2026-09-15T12:00:00+08:00",
    "screeningOnly": true
  },
  "recommendation": {
    "safetyLevel": "normal",
    "departments": ["家庭醫學科"],
    "message": "本結果僅供初步篩檢與導引參考，請依現場人員或醫療專業人員建議進一步確認。"
  }
}
```

這種 API 的設計要搭配 OpenAPI 文件。若用 FastAPI，可以自動產生 OpenAPI schema 與互動式 docs；若用 NestJS，也可以用 Swagger module 產生文件。FastAPI 這類自動文件功能很適合早期跟合作方對 API 格式。([FastAPI][9])

# Part M：大二學生要抓住的核心觀念

## 36. 你不是在寫功能，你是在降低不確定性

在學校作業裡，需求通常是固定的。老師說輸入什麼，輸出什麼，你照做。

真實世界相反。最重要的輸入常常不完整，而且會變：

客戶不知道自己真正要什麼。
醫療內容 owner 還沒指派。
設備規格還沒拿到。
法規定位還沒釐清。
HIS-ready 的意思不明。
9 月時程可能只是期待，不是可執行計畫。
交付責任還沒切。
CMS 是不是要做也不確定。

所以這個 workstream 的價值是：把「模糊」變成「可以討論的清單」。

## 37. 好工程師會先問 intended use

尤其在醫療與健康科技領域，intended use 非常重要。

同一個功能，不同 intended use，工程責任完全不同。

例如聽力功能：

如果 intended use 是「讓使用者體驗簡單聽覺互動」，風險低很多。
如果 intended use 是「初步聽力篩檢參考」，需要更謹慎的 wording、紀錄與驗證。
如果 intended use 是「判斷是否有聽損」，風險大幅上升。
如果 intended use 是「輸出正式醫療檢查結果」，那就不是普通網頁功能了。

這也是為什麼 FDA 的 CDS 指引會特別區分軟體功能是否屬於可能被監管的醫療器材軟體功能；IMDRF 的 SaMD 文件也把 intended medical purpose 放在核心位置。([U.S. Food and Drug Administration][13])

## 38. 好架構不是選最新技術，而是讓責任清楚

你可以用 Next.js、FastAPI、PostgreSQL、Prisma、Strapi、Zod、XState、Web Audio API。這些技術都合理。

但架構真正的重點是：

前端負責互動，不負責醫療判斷。
後端負責資料一致性、規則執行、報告產生。
CMS 負責內容管理，但不能繞過審核。
資料庫負責版本與 auditability。
QR Code 負責安全存取，不是公開裸連結。
FHIR/JSON export 負責未來交換，不等於已完成 HIS integration。
文件負責交付邊界與決策歷史。

技術只是工具。邊界才是架構。

## 39. 這個 folder 的最終完成標準

6/23 前，這個 folder 不需要很漂亮，但要能回答：

我們知道哪些需求？
哪些需求只是推測？
哪些問題必須現場問？
哪些功能不應該先承諾？
哪些部分可重用 AI Triage？
哪些部分需要新 repo？
會後如何產出 feasibility response？
9 月 MVP 怎麼切？
誰負責醫療內容？
誰負責 CMS？
誰負責 UI/UX？
誰負責 API/ERD/source code？
HIS-ready 到底是哪個層級？

如果這些問題能被文件化，你就完成了這個 workstream 的主要任務。

# 最後建議

我會採用你的原始方案：在現有 `ai-triage-kiosk-v0` repo 建立 `workstreams/smart-health-cabin/`，但嚴格禁止在這裡開始寫正式智慧健康倉 app、CMS、vision、hearing 或 HIS integration 程式碼。

6/23 前的工作重點是文件化 discovery。
6/23 當天的工作重點是收斂未知數。
6/23 後的工作重點是決定是否開新 repo、是否進入報價與開發。

如果 6/23 後確認要進入正式開發，我會建議新 repo 從第一天就建立這些基本工程骨架：

```txt
apps/
  kiosk-web/
  admin-cms/
  api-server/

packages/
  shared-schema/
  ui/
  questionnaire-engine/
  report-template/

docs/
  architecture/
  api/
  erd/
  risk-register/
  deployment/

infra/
  docker/
  database/
  ci/
```

這樣才不會把 discovery 文件、舊 AI Triage code、正式 Smart Health Cabin 產品混在一起。這是比較乾淨、可維護、可交付的工程路線。

[1]: https://www.imdrf.org/documents/software-medical-device-samd-key-definitions "https://www.imdrf.org/documents/software-medical-device-samd-key-definitions"
[2]: https://www.iso.org/standard/38421.html "https://www.iso.org/standard/38421.html"
[3]: https://www.mdcalc.com/calc/10060/visual-acuity-testing-snellen-chart "https://www.mdcalc.com/calc/10060/visual-acuity-testing-snellen-chart"
[4]: https://www.thebsa.org.uk/wp-content/uploads/2023/10/OD104-32-Recommended-Procedure-Pure-Tone-Audiometry-August-2018-FINAL-1.pdf "https://www.thebsa.org.uk/wp-content/uploads/2023/10/OD104-32-Recommended-Procedure-Pure-Tone-Audiometry-August-2018-FINAL-1.pdf"
[5]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API "https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API"
[6]: https://nextjs.org/docs/app "https://nextjs.org/docs/app"
[7]: https://strapi.io/ "https://strapi.io/"
[8]: https://www.prisma.io/ "https://www.prisma.io/"
[9]: https://fastapi.tiangolo.com/ "https://fastapi.tiangolo.com/"
[10]: https://www.pdpc.gov.tw/en/News_Html/165/ "https://www.pdpc.gov.tw/en/News_Html/165/"
[11]: https://hl7.org/fhir/R5/ "https://hl7.org/fhir/R5/"
[12]: https://www.iso.org/standard/72704.html "https://www.iso.org/standard/72704.html"
[13]: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software"
