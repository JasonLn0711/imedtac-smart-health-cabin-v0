---
id: 2026-06-30-expert-quote-method-update
title: "2026-06-30 Expert Quote Method Update"
date: 2026-06-30
topic: smart-health-cabin
type: source
status: preserved
source_owner: user-provided
language: zh-TW
related:
  - ../../workstreams/smart-health-cabin/2026-06-29-prof-wu-internal-quote-scenarios.md
  - ../../workstreams/smart-health-cabin/2026-07-01-prof-wu-quote-meeting-deep-analysis.md
  - ../../handoff/2026-06-30-smart-health-cabin-prof-wu-quote.md
  - ./transcript-corrected.md
---

# 2026-06-30 Expert Quote Method Update

## Source Boundary

This file preserves the user-provided expert quotation method for updating the
Smart Health Cabin internal quotation. It is an internal quote-preparation
source for Prof. Wu discussion and NYCU scope control. It is not a signed
external quotation, hardware purchase approval, Avatar vendor commercial
confirmation, HIS integration commitment, medical-device validation package, or
long-term maintenance contract.

Full corrected transcript:

```text
source/2026-06-30-expert-quote-method-update/transcript-corrected.md
```

Copy provenance:

```text
Original copied from:
/home/jnclaw/every_on_git_jnclaw/project_aura/260630_2333_withProfWu/2026-06-30_prof-wu_smart-health-station_corrected_ai-agent-transcript.md

SHA-256:
b3916446b9566759306e862272d418fcc15b5c36742d2e8d08eccd8d1cfe3da3
```

## Preserved Method Summary

The expert update changes the quote strategy from a single hardware-excluded
software quote into a three-option quotation frame:

- Version A: two-station all-in MVP package at `NTD 1,500,000`, assuming two
  hardware stations at `NTD 300,000` each and leaving `NTD 900,000` for NYCU
  software.
- Version B: NYCU four-module software and system-integration floor package at
  `NTD 1,060,000`, with hardware excluded.
- Version C: NYCU four-module software and system-integration recommended
  package at `NTD 1,500,000`, with hardware excluded.

The core conclusion is:

```text
兩台全包 150 萬可以報，但不能叫「完整四模組版」；只能叫「兩台部署＋四模組 MVP 精簡版」。
```

Reason:

```text
2 台硬體若先抓 30 萬/台，硬體已吃掉 60 萬，NYCU 軟體只剩 90 萬。這低於附件裡設定的四模組底線版 106 萬，所以必須把視力、聽力降成保守自我篩檢，把 Avatar 限定為 vendor 介面整合，不包 Avatar license、不包 AI mini PC、不包 HIS 正式串接、不包長期維運。
```

## Three Evidence Layers

### 1. 資訊服務委外人月法

The expert source cites the 中華民國資訊軟體服務商業同業公會 115 年資訊服務委外經費估算原則 as the manpower-cost basis for information-service quotation. The cited first-category manpower rates include:

| 職能 | 參考人月單價 |
| --- | ---: |
| 專案管理師 | `NTD 223,083` |
| 系統分析設計師 | `NTD 203,337` |
| 軟體開發人員 | `NTD 181,502` |
| AI 分析人員 | `NTD 216,431` |
| 雲地整合人員 | `NTD 226,912` |
| 測試人員 | `NTD 163,261` |

The expert note states that these rates include direct salary, management fee,
and public expenses, but not other direct costs or business tax. It also notes
that project person-month quantity may be estimated by expert judgment,
analogous estimation, or function-point estimation.

Source: <https://www.tissa.org.tw/News/Detail/6123>

### 2. 公開標案類比法

The expert source cites public healthcare information-system and IoT integration
procurement cases as analogous price anchors:

| 類比標案 | 決標金額 | 用途 |
| --- | ---: | --- |
| 高雄市立民生醫院「健檢資訊系統建置、轉換及租用服務」 | `NTD 950,100` | Health-check information-system build, conversion, training, and later data-processing rental service. |
| 仁德醫院 115 年「智慧科技病房 IoT 整合建置租賃服務」 | `NTD 1,499,000` | Smart ward IoT integration rental service. |
| 新北市立聯合醫院「護理資訊及護理站電子白板系統建置案」 | `NTD 4,400,000` | Nursing information and electronic whiteboard system build. |

These are not identical projects. They support the quotation argument that
healthcare information systems, IoT integration, report/data workflows, and
acceptance support commonly fall into million-NTD quotation territory.

Reference supplied by the expert source: <https://bid.twincn.com/item.aspx?sn=16606810648>

### 3. 健康量測站硬體類比法

The expert source states that a health measurement station is not merely a
tablet or computer. Market-facing smart health measurement stations commonly
combine connected hardware, software platform, app, and physiological
measurement devices such as blood pressure, blood oxygen, blood glucose,
forehead temperature, weight, and body-fat measurement. The Shuttle KHS health
station product page is used as one hardware-category reference.

The expert source also cites a public-sector procurement case, 南投縣政府衛生局
2025 年「健康量測站－隧道式血壓計設備採購案」with a `NTD 928,000` award
amount, to show that medical/health measurement station pricing can vary
substantially. Under this logic, `NTD 300,000` per station should be treated as
a low-estimate scenario, not a stable cost.

Reference supplied by the expert source: <https://tw.shuttle.com/products/productsDetail?c=medical-healthcare&pn=KHS+SERIES>

## Accepted Quote Strategy

The updated strategy is:

```text
如果 150 萬要包兩台硬體，NYCU 軟體只剩 90 萬，所以只能交付 MVP 精簡版。若要完整四模組，硬體必須另計，NYCU 軟體底線是 106 萬，建議價是 150 萬。
```

This should be written as a scope-control and budget-allocation explanation, not
as a defensive statement.
