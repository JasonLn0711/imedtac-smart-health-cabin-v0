---
id: 2026-07-01-expert-backend-integration-quote-revision
title: "Expert Backend Integration Quote Revision"
date: 2026-07-01
topic: smart-health-cabin
type: source
status: preserved
source_owner: user-provided
language: zh-TW
related:
  - ../../handoff/2026-06-30_smart-health-station_quote-decision-v2.md
  - ../../source/2026-06-30-expert-quote-method-update/transcript-corrected.md
---

# 2026-07-01 Expert Backend Integration Quote Revision

## Source Boundary

This file preserves the user-provided expert recommendation for revising the
Smart Health Station quotation after considering a division of responsibility
where 慧誠 handles UI/UX and frontend work while 智德萬 keeps backend, API,
state, integration, report, QA, deployment, and acceptance-control ownership.

This is an internal quote-revision source for Tomi / Prof. Wu review. It is not
a signed external quotation, final tax treatment, hardware commitment, Avatar
vendor license confirmation, HIS integration commitment, or medical-device
validation package.

## Preserved Expert Recommendation

```text
結論：可以讓慧誠做 UI/UX 到前端，但你們不能只把「UI/UX 與前端」整包丟出去。你們至少要保留「產品流程規格、API contract、state machine、資料欄位、驗收腳本、整合測試」的控制權。否則畫面做得很漂亮，但 session、問卷狀態、Avatar 接續、報告產生、QR、錯誤處理與驗收全會卡住，最後責任還是回到智德萬。

這個拆法下，智德萬的角色應該從「四模組軟體全包」改成：

智德萬：後端、資料/API contract、模組邏輯、Avatar/AI adapter、報告/QR、部署整合、QA/驗收、基本資安與個資邊界。
慧誠：UI/UX、Figma/畫面流程、kiosk 前端、前端元件、前端裝機測試、站體操作體驗。

你們原本會議結論是：一台／一套、軟體建置費抓 NTD 900,000-1,100,000，並且要把首次建置費和後續 license fee 分開；老師也明確要求每個工作項目都要能用「人數 × 時間 × 人月單價」說明，而不是只列金額。

1. 分工原則：不要用「前端／後端」粗切，要用「責任邊界」切

慧誠可以做「人看得到、摸得到的前端」，但智德萬要定義「系統怎麼運作、資料怎麼流、錯誤怎麼處理、結果怎麼驗收」。

2. 你們現在應該新增一個「介面控制文件 ICD」

如果 UI/UX 到前端由慧誠做，第一個交付物不是開始寫程式，而是先做一份 Interface Control Document，簡稱 ICD。這份文件要鎖住雙方邊界。

ICD 至少要包含：

- User journey：從開始量測、問卷、Avatar、視力、聽力、報告、QR 的完整流程。
- Screen state：每個模組的 not_started / in_progress / completed / failed / skipped 狀態。
- API contract：OpenAPI/Swagger、endpoint、request/response JSON schema。
- Session contract：session_key、TTL、idempotency、重複送出處理。
- Error contract：錯誤碼、前端顯示文字、重試機制。
- Data contract：問卷答案、測驗結果、報告摘要、QR token、audit log。
- Mock server：慧誠前端可以先接 mock API，不必等後端全部完成。
- Acceptance script：例如「完成問卷後產生 report_id，掃 QR 可開 public report」。
- Change control：API freeze 後，任何欄位更動都走變更單。

3. 重新設計後的工作包

建議改成 8 個工作包：

- WP0 Scope lock / PM / 驗收口徑：需求邊界、時程、驗收表、風險聲明。
- WP1 Product flow + ICD：user journey、state machine、API/data contract。
- WP2 Backend API + mock server：OpenAPI、mock API、session、module status、error code。
- WP3 問卷後端與報告 mapping：問卷 schema、版本、答案、分數/旗標、report summary。
- WP4 Avatar/AI adapter：Avatar vendor 介面、狀態交接、log/privacy 邊界。
- WP5 視力/聽力邏輯與結果整合：測驗規則、結果文字、限制聲明、報告整合。
- WP6 Integration support：前後端串接、debug、測試資料、聯調會議。
- WP7 QA / security / deployment / docs：E2E 測試、個資邊界、部署文件、教育訓練。

原本可以轉給慧誠的是 UI/UX 視覺設計、Figma / prototype、kiosk 前台 shell、前端 route / component、前端裝置解析度 / 觸控互動、CSS / RWD / station UI polish。

但是智德萬仍要保留使用流程限制、API contract、session / idempotency、report / QR、E2E QA、個資與 log 邊界。

4. 金額怎麼換算？

先用 TISSA 第一類估算，因為本案仍是單一量測站應用、低於 24 人月，符合第一類「單一應用作業，或總人月 24 月含以下」的框架。TISSA 第一類人月報價中，PM 是 NTD 223,083/月、系統分析是 NTD 203,337/月、軟體開發是 NTD 181,502/月、UI/UX 是 NTD 179,306/月、AI 分析是 NTD 216,431/月、雲端地端整合是 NTD 226,912/月、資安檢測是 NTD 186,152/月、測試是 NTD 163,261/月。這些人月報價已含直接薪資、管理費與公費，但未含其他直接費用與 5% 營業稅。

來源：https://www.tissa.org.tw/News/Detail/6123

簡化成每週，就是除以 4：

- PM / 專案管理：NTD 223,083/月，約 NTD 55,800/週。
- 系統分析 / API 設計：NTD 203,337/月，約 NTD 50,800/週。
- UI/UX：NTD 179,306/月，約 NTD 44,800/週。
- 軟體開發：NTD 181,502/月，約 NTD 45,400/週。
- AI / Avatar adapter：NTD 216,431/月，約 NTD 54,100/週。
- 雲端地端整合：NTD 226,912/月，約 NTD 56,700/週。
- 資安檢測：NTD 186,152/月，約 NTD 46,500/週。
- QA 測試：NTD 163,261/月，約 NTD 40,800/週。

5. 智德萬新版工作包金額建議

建議把智德萬部分初步抓在：

建議報價：NTD 800,000 未稅
可談區間：NTD 750,000-850,000 未稅
不建議低於：NTD 700,000 未稅

偏安全版細項：

- WP0 Scope lock / PM / 驗收口徑：PM，0.25 人月，NTD 55,771。
- WP1 Product flow / ICD / API contract：系統分析，0.55 人月，NTD 111,835。
- WP2 Backend API / session / module status：軟體開發，1.10 人月，NTD 199,652。
- WP3 問卷後端 / report / QR / 資料模型：軟體開發 + DB，0.85 人月，NTD 158,342。
- WP4 Avatar / AI adapter：AI 分析，0.35 人月，NTD 75,751。
- WP5 視力/聽力結果邏輯與報告整合：軟體開發，0.50 人月，NTD 90,751。
- WP6 雲地部署 / 慧誠前端聯調：雲地整合，0.25 人月，NTD 56,728。
- WP7 E2E QA / 驗收腳本：QA，0.45 人月，NTD 73,467。
- WP8 基本資安 / 個資邊界：資安檢測，0.12 人月，NTD 22,338。
- 文件、溝通、風險緩衝與四捨五入：約 NTD 55,000。
- 合計：約 4.42 人月，約 NTD 900,000。

若慧誠前端能力強、API contract 一次鎖定、沒有反覆改流程，可以壓到：

- WP2 backend API 從 1.10 人月降到 0.90：約 -NTD 36,000。
- WP3 問卷/報告從 0.85 降到 0.70：約 -NTD 28,000。
- WP6 聯調從 0.25 降到 0.15：約 -NTD 23,000。
- WP7 QA 從 0.45 降到 0.35：約 -NTD 16,000。
- 緩衝從 55,000 降到 25,000：約 -NTD 30,000。
- 可降幅：約 NTD 130,000。

合理對外價格：

- 穩健版：NTD 850,000-900,000。
- 可談版：NTD 780,000-820,000。
- 底線版：NTD 700,000-750,000，但要刪 scope。

建議先報 NTD 850,000，內部底線抓 NTD 750,000，不要一開始就報 70 萬。

6. 慧誠 UI/UX + 前端部分，大概值多少？

慧誠這部分可粗抓：

- UX flow / Figma / 畫面原型：0.35-0.50 人月，約 NTD 63,000-90,000。
- kiosk 前端 route / component / 狀態畫面：1.00-1.40 人月，約 NTD 182,000-254,000。
- 前端裝置測試 / browser / station testing：0.20-0.30 人月，約 NTD 33,000-49,000。
- 前端 PM / 設計溝通：0.10-0.15 人月，約 NTD 22,000-33,000。
- 合計：約 1.65-2.35 人月，約 NTD 300,000-420,000。

7. 如果總價還是希望壓在 150 萬內

以一台量測站 NTD 400,000 暫估，總價 NTD 1,500,000，剩下軟體總池是：

1,500,000 - 400,000 = 1,100,000

慧誠 UI/UX + 前端與智德萬後端整合的分配：

- 慧誠 UI/UX + 前端 NTD 250,000；智德萬可報 NTD 850,000；最理想。
- 慧誠 UI/UX + 前端 NTD 300,000；智德萬可報 NTD 800,000；建議版本。
- 慧誠 UI/UX + 前端 NTD 350,000；智德萬可報 NTD 750,000；可接受，但要控 scope。
- 慧誠 UI/UX + 前端 NTD 400,000；智德萬可報 NTD 700,000；偏危險，只能做精簡整合。
- 慧誠 UI/UX + 前端 NTD 450,000；智德萬可報 NTD 650,000；不建議，智德萬風險太高。

如果總預算固定，慧誠前端拿得越多，智德萬後端整合 scope 就必須越精簡。

8. 建議對慧誠的說法

如果 UI/UX 與前端由慧誠負責，智德萬可以把本案定位調整為後端與系統整合建置包。我們會負責需求邊界、API/data contract、session 狀態、問卷資料模型、Avatar/AI adapter、視力/聽力結果邏輯、報告/QR、整合測試、部署驗收與基本資安/個資邊界。

為了避免前後端整合風險，我們建議第一階段先共同確認 ICD，也就是 interface control document，包含 API schema、screen state、error code、測試資料與驗收腳本。慧誠前端可以依這份文件開發，我們也會提供 mock server 與聯調支援。

在這個分工下，智德萬的首次建置費可從原本完整軟體建置的 NTD 900,000-1,100,000，調整為約 NTD 750,000-850,000；實際金額取決於慧誠前端是否能完整承擔 kiosk shell、UI/UX、畫面狀態與裝置測試。

9. 最重要的合約條款

一定要寫：

- API freeze date。
- 前端責任歸屬：慧誠負責 UI/UX、前端 bug、裝置相容性、觸控體驗、站體解析度、瀏覽器問題。
- 智德萬責任歸屬：API 正確性、資料儲存、報告生成、QR、模組邏輯、後端部署、整合測試支援。
- 聯調次數：含 2-3 次正式聯調；超過部分另案計費。
- 驗收依據：指定測試案例能跑完。
- 變更單：新增頁面、新問卷邏輯、新報告格式、新 API 欄位、新 HIS/EMR 串接都另案。

10. 建議採用版本

智慧健康量測站後端與系統整合建置包
報價：NTD 800,000-850,000 未稅
內部底線：NTD 750,000 未稅
前提：慧誠完整負責 UI/UX、前端實作、kiosk shell、前端裝置測試
不含：HIS/EMR 正式串接、醫材等級驗證、Avatar vendor license、硬體採購、長期維運

如果慧誠要求降到 NTD 700,000，就要刪 scope：

- 刪除完整 mock server，只提供 OpenAPI 文件。
- 聯調次數從 3 次降到 1 次。
- 問卷後台配置先不做，只做固定版本。
- 報告格式只做一版。
- 視力/聽力只做結果文字接收與報告整合，不做進階流程。
- 部署只支援一個正式環境。

不要為了配合對方做前端，就把自己的後端整合價值低估。這案子的高風險不在 UI，而在跨模組資料流、狀態管理、報告生成、驗收責任、醫療場域邊界與後續可複製性。這些才是智德萬該收錢的地方。
```
