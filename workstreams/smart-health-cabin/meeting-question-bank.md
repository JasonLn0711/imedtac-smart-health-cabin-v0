---
id: smart-health-cabin-meeting-question-bank
title: "Smart Health Cabin Meeting Question Bank"
date: 2026-06-17
topic: ai-triage
type: meeting-prep
status: active
source:
  - ../../source/2026-06-17-imedtac-smart-health-cabin-requirements/source.md
  - ../../source/2026-06-17-smart-health-cabin-expert-tutorial-note/source.md
  - ./external-authority-verification.md
---

# Smart Health Cabin Meeting Question Bank

## IP-Safe Discovery Questions

Use these first so imedtac describes its own target workflow before NYCU fills
in method details.

1. 這次智慧健康倉，慧誠 / 北市聯醫希望使用者完成後，現場人員實際要收到什麼訊息或報告？
2. 若生命徵象或問卷結果看起來需要注意，現在預期通知誰：護理人員、醫師、健康中心管理人員，還是一般工作人員？
3. 在醫務室、醫院、健康中心、長照中心等不同場域，慧誠希望同一套系統維持相同流程，還是依場域調整？
4. 慧誠目前已經有明確設計方法的部分是哪些？還只是需求目標的部分是哪些？
5. 6/23 會後希望 NYCU 回覆的是需求釐清、架構建議、feasibility、初步報價，還是正式設計規格？

## Opening Questions

1. 這次北市聯醫案的第一版成功標準是 demo、pilot、院方驗收，還是正式上線？
2. 9 月初整合、9 月中驗收的範圍，是兩個模組全做，還是可以分 MVP 與後續 phase？
3. 這次希望 NYCU / 多寶 / Jason 先回覆的是 feasibility memo、正式 proposal、還是 rough quotation？
4. 6/23 現場是否可以拍照、錄影、記錄設備型號與操作流程？

## Questions For Johnny / Project Ownership

1. imedtac 希望 NYCU 主要承接哪一塊：UI/UX、前端、後端、CMS、資料格式、臨床流程、還是整體系統？
2. UI/UX Figma 是 imedtac 提供、NYCU 提供，還是共同產出？
3. CMS 文件中寫「此為 imedtac 執行，但部分資訊由陽交大提供」，這裡的分工是什麼？
4. 完整 source code 交付是指專案客製程式碼，還是包含可重用的 engine / framework？
5. 後續維運、bug fix、題庫更新、部署更新由誰負責？
6. 是否可以先用 RACI 方式確認每一項 deliverable 的 Responsible /
   Accountable / Consulted / Informed？
7. 如果 9 月只做 Narrow MVP，哪些項目一定要保留，哪些可移到 phase 2？
8. 會後回覆應該是 internal feasibility memo、imedtac-facing proposal、
   還是 hospital-facing material？

## Questions For Equipment / Engineering

1. Touch screen 尺寸、解析度、瀏覽器、OS、kiosk mode 是什麼？
2. 前台能否直接呼叫外部 HTTPS API？
3. 是否有 CORS、proxy、VPN、防火牆或 allowlist 限制？
4. 是否有本地資料庫、local storage 或 kiosk storage 限制？
5. 音訊播放能否由瀏覽器控制？是否支援固定音量、頻率、左右聲道？
6. 是否有設備 API/SDK 文件可提供？
7. 是否要支援離線模式或網路中斷 fallback？
8. 是否可以現場取得瀏覽器版本、DevTools network 行為、CORS origin、
   proxy/VPN/firewall 限制？
9. 是否允許現場安裝或開啟一個測試頁面來確認 audio、microphone、
   fullscreen/kiosk mode、QR display、network call？
10. 若未來要交付 source code，部署環境是 imedtac server、hospital
    server、cloud service，還是 kiosk local runtime？

## Questions For Module A: Vision / Hearing

1. 視力測驗的目標是 preliminary screening 還是正式醫療量測？
2. 視力測驗距離是否固定？是否有站位或坐位標記？
3. 視力量表、色覺、散光、視野測驗的依據由誰提供或審核？
4. 固定喇叭不用耳機時，如何做到左右耳分別測試？
5. 隔音後 dB 數是否已有測量資料？
6. 聽力測試需要哪些頻率與 dB range？
7. 測驗失敗、不確定、環境太吵時，報告如何呈現？
8. 若採固定喇叭、不使用耳機，imedtac / hospital 是否接受
   screening-support / guided interaction wording，而不是 pure-tone threshold
   audiometry 或 `dB HL` 結果？
9. 若希望輸出更正式的視力或聽力結果，誰提供校正方法、臨床驗證路徑與
   報告用語審核？

## Questions For Module B: Questionnaire / Triage

1. 家庭醫學科全面性問卷由誰提供？
2. 科別建議與衛教內容由誰負責審核？
3. 問卷是否 patient-facing，還是 staff-review oriented？
4. 是否需要急症/紅旗 stop rule？
5. 是否只能單選/多選，還是需要數值、量尺、自由文字？
6. 題目是否需要多語系？
7. 是否要保存 branch path 與每次版本？

## Questions For Report / QR Code / Data

1. QR Code 連到什麼：網頁報告、PDF、手機頁面，還是院方系統？
2. QR report 是否需要登入、OTP、手機號、病歷號或匿名 token？
3. 報告有效期限與刪除政策是什麼？
4. 報告是否可被分享或轉傳？
5. HIS-ready 是否只需要 JSON schema，還是需要接真實 HIS test endpoint？
6. 目標資料標準是 custom JSON、HL7、FHIR，還是院方既有格式？
7. QR report 是否有有效期限、撤銷機制、刪除流程與 audit log？
8. URL 或 QR token 中是否禁止出現姓名、生日、身分證號、病歷號或其他
   可識別資訊？
9. 報告要保存當時使用的問卷版本、規則版本、設備 context、measurement
   quality 與 reviewer / publisher 資訊嗎？
10. HIS-ready 的第一版是否可先定義為 structured JSON / ERD，不承諾 live
    HIS integration？

## Questions For MVP Tiers

1. Narrow MVP 是否可接受：
   - screening-support wording；
   - reviewed fixed questionnaire；
   - rule-based branching；
   - basic report；
   - expiring QR report；
   - custom JSON export；
   - ERD and deployment note？
2. Expanded MVP 是否需要：
   - CMS draft/review/publish；
   - richer audit log；
   - device context capture；
   - FHIR mapping draft；
   - report template versioning？
3. 哪些項目不應放入 9 月第一版：
   - formal medical-grade hearing diagnosis；
   - live HIS integration；
   - autonomous AI medical recommendation；
   - complex multi-site CMS；
   - unvalidated device-measurement claims？

## Questions For External Standards / Validation

1. imedtac / hospital 是否要求遵循特定法規、醫療器材軟體流程、資安或資料交換標準？
2. 是否有指定 FHIR 版本、TW Core、HL7、院方既有格式，或只需要 custom
   JSON？
3. 是否需要 clinical validation plan、usability validation、risk register、
   cybersecurity checklist，還是目前只需要 feasibility discovery？
4. 對外文件是否需要避免引用尚未經 imedtac / hospital 確認的 FDA、ISO、
   IMDRF、FHIR 或個資法解讀？
5. ISO 14971、IEC 62304、IEC 62366-1、ISO 13485 目前要作為內部設計控制參考，
   還是正式交付物 / 驗收標準？
6. 若討論 HIS-ready，院方是否明確要求 TW Core / FHIR R4，而不是泛稱 FHIR
   或 FHIR R5？
7. 是否需要把 FDA CDS January 2026、IMDRF SaMD、ISO/IEC、FHIR/TW Core 的
   引用留在 internal memo，不放入 hospital-facing proposal？

## Closeout Questions

1. 會後希望 NYCU 何時回覆 feasibility / schedule / budget？
2. 回覆文件要給誰看：imedtac 內部、北市聯醫、教授、還是工程團隊？
3. 是否需要分成一版 internal technical memo 與一版 stakeholder-facing proposal？
4. 下一次決策會議的 owner、日期、輸出物是什麼？
