---
schema_version: "1.0.0"
document_type: "questionnaire"
instrument_id: "phq9_zh_tw"
title: "病人健康狀況問卷-9 (PHQ-9)"
language: "zh-Hant-TW"
source_file: "病人健康狀況問卷-9(PHQ-9).pdf"
source_pages: [1]
lookback_period: "過去兩個星期"
scoring_unit: "points"
min_total_score: 0
max_total_score: 27
source_notice: "本問卷由 Robert L. Spitzer 博士、Janet B.W. Williams 博士、Kurt Kroenke 博士和同事用 Pfizer Inc. 提供的教育基金設計；原 PDF 註明無需准許即可複製、翻譯、展示或分發。"
---

# 病人健康狀況問卷-9（PHQ-9）

## 1. Agent-readable summary

這份文件是從 `病人健康狀況問卷-9(PHQ-9).pdf` 第 1 頁轉換而來的 AI agent readable Markdown。原表單為 PHQ-9 問卷，共 9 題。每題依「過去兩個星期」受到問題困擾的頻率作答，選項分數為 0 到 3 分。總分為 9 題分數加總，理論範圍為 0 到 27 分。

> Source fidelity rule: 除「系統實作備註」章節外，本文件只保留原 PDF 明確出現的題目、選項、分數與評分說明。原 PDF 未列出的解釋區間，不在本文件中推定。

## 2. Source prompt

在過去兩個星期，有多少時候您受到以下任何問題所困擾？

## 3. Response scale

| value | label | description |
|---:|---|---|
| 0 | 完全沒有 | 受困擾頻率為完全沒有 |
| 1 | 幾天 | 受困擾頻率為幾天 |
| 2 | 一半以上的天數 | 受困擾頻率為一半以上的天數 |
| 3 | 幾乎每天 | 受困擾頻率為幾乎每天 |

## 4. Questionnaire items

| id | order | item_text | response_type | allowed_values |
|---|---:|---|---|---|
| phq9_01 | 1 | 做事時提不起勁或沒有樂趣 | single_choice_integer | 0, 1, 2, 3 |
| phq9_02 | 2 | 感到心情低落、沮喪或絕望 | single_choice_integer | 0, 1, 2, 3 |
| phq9_03 | 3 | 入睡困難、睡不安穩或睡眠過多 | single_choice_integer | 0, 1, 2, 3 |
| phq9_04 | 4 | 感覺疲倦或沒有活力 | single_choice_integer | 0, 1, 2, 3 |
| phq9_05 | 5 | 食慾不振或吃太多 | single_choice_integer | 0, 1, 2, 3 |
| phq9_06 | 6 | 覺得自己很糟，或覺得自己很失敗，或讓自己或家人失望 | single_choice_integer | 0, 1, 2, 3 |
| phq9_07 | 7 | 對事物專注有困難，例如閱讀報紙或看電視時 | single_choice_integer | 0, 1, 2, 3 |
| phq9_08 | 8 | 動作或說話速度緩慢到別人已經察覺，或正好相反：煩躁或坐立不安、動來動去的情況更勝於平常 | single_choice_integer | 0, 1, 2, 3 |
| phq9_09 | 9 | 有不如死掉或用某種方式傷害自己的念頭 | single_choice_integer | 0, 1, 2, 3 |

## 5. Scoring model

```yaml
scoring:
  total_score:
    label: "總分"
    expression: "sum(phq9_01, phq9_02, phq9_03, phq9_04, phq9_05, phq9_06, phq9_07, phq9_08, phq9_09)"
    min: 0
    max: 27
    required_items:
      - phq9_01
      - phq9_02
      - phq9_03
      - phq9_04
      - phq9_05
      - phq9_06
      - phq9_07
      - phq9_08
      - phq9_09
  interpretation_from_source_pdf:
    - min: 10
      max: 14
      label: "輕度憂鬱"
    - min: 15
      max: 19
      label: "中度憂鬱"
    - min: 20
      max: 27
      label: "重度憂鬱"
  source_unspecified_ranges:
    - min: 0
      max: 9
      label: "原 PDF 未提供此分數區間的評分說明"
```

## 6. Normalized YAML questionnaire schema

```yaml
questionnaire:
  id: "phq9_zh_tw"
  title: "病人健康狀況問卷-9 (PHQ-9)"
  language: "zh-Hant-TW"
  lookback_period: "過去兩個星期"
  instructions: "在過去兩個星期，有多少時候您受到以下任何問題所困擾？"
  response_scale:
    type: "single_choice_integer"
    required: true
    options:
      - value: 0
        label: "完全沒有"
      - value: 1
        label: "幾天"
      - value: 2
        label: "一半以上的天數"
      - value: 3
        label: "幾乎每天"
  items:
    - id: "phq9_01"
      order: 1
      text: "做事時提不起勁或沒有樂趣"
    - id: "phq9_02"
      order: 2
      text: "感到心情低落、沮喪或絕望"
    - id: "phq9_03"
      order: 3
      text: "入睡困難、睡不安穩或睡眠過多"
    - id: "phq9_04"
      order: 4
      text: "感覺疲倦或沒有活力"
    - id: "phq9_05"
      order: 5
      text: "食慾不振或吃太多"
    - id: "phq9_06"
      order: 6
      text: "覺得自己很糟，或覺得自己很失敗，或讓自己或家人失望"
    - id: "phq9_07"
      order: 7
      text: "對事物專注有困難，例如閱讀報紙或看電視時"
    - id: "phq9_08"
      order: 8
      text: "動作或說話速度緩慢到別人已經察覺，或正好相反：煩躁或坐立不安、動來動去的情況更勝於平常"
    - id: "phq9_09"
      order: 9
      text: "有不如死掉或用某種方式傷害自己的念頭"
  scoring:
    total_score_expression: "sum(items[].answer.value)"
    total_score_min: 0
    total_score_max: 27
    source_interpretation:
      - range: "10-14"
        label: "輕度憂鬱"
      - range: "15-19"
        label: "中度憂鬱"
      - range: "20-27"
        label: "重度憂鬱"
```

## 7. SurveyJS starter schema

```json
{
  "title": "病人健康狀況問卷-9 (PHQ-9)",
  "description": "在過去兩個星期，有多少時候您受到以下任何問題所困擾？",
  "showQuestionNumbers": "on",
  "pages": [
    {
      "name": "phq9_page_1",
      "elements": [
        {
          "type": "radiogroup",
          "name": "phq9_01",
          "title": "做事時提不起勁或沒有樂趣",
          "isRequired": true,
          "choices": [
            { "value": 0, "text": "完全沒有" },
            { "value": 1, "text": "幾天" },
            { "value": 2, "text": "一半以上的天數" },
            { "value": 3, "text": "幾乎每天" }
          ]
        },
        {
          "type": "radiogroup",
          "name": "phq9_02",
          "title": "感到心情低落、沮喪或絕望",
          "isRequired": true,
          "choices": [
            { "value": 0, "text": "完全沒有" },
            { "value": 1, "text": "幾天" },
            { "value": 2, "text": "一半以上的天數" },
            { "value": 3, "text": "幾乎每天" }
          ]
        },
        {
          "type": "radiogroup",
          "name": "phq9_03",
          "title": "入睡困難、睡不安穩或睡眠過多",
          "isRequired": true,
          "choices": [
            { "value": 0, "text": "完全沒有" },
            { "value": 1, "text": "幾天" },
            { "value": 2, "text": "一半以上的天數" },
            { "value": 3, "text": "幾乎每天" }
          ]
        },
        {
          "type": "radiogroup",
          "name": "phq9_04",
          "title": "感覺疲倦或沒有活力",
          "isRequired": true,
          "choices": [
            { "value": 0, "text": "完全沒有" },
            { "value": 1, "text": "幾天" },
            { "value": 2, "text": "一半以上的天數" },
            { "value": 3, "text": "幾乎每天" }
          ]
        },
        {
          "type": "radiogroup",
          "name": "phq9_05",
          "title": "食慾不振或吃太多",
          "isRequired": true,
          "choices": [
            { "value": 0, "text": "完全沒有" },
            { "value": 1, "text": "幾天" },
            { "value": 2, "text": "一半以上的天數" },
            { "value": 3, "text": "幾乎每天" }
          ]
        },
        {
          "type": "radiogroup",
          "name": "phq9_06",
          "title": "覺得自己很糟，或覺得自己很失敗，或讓自己或家人失望",
          "isRequired": true,
          "choices": [
            { "value": 0, "text": "完全沒有" },
            { "value": 1, "text": "幾天" },
            { "value": 2, "text": "一半以上的天數" },
            { "value": 3, "text": "幾乎每天" }
          ]
        },
        {
          "type": "radiogroup",
          "name": "phq9_07",
          "title": "對事物專注有困難，例如閱讀報紙或看電視時",
          "isRequired": true,
          "choices": [
            { "value": 0, "text": "完全沒有" },
            { "value": 1, "text": "幾天" },
            { "value": 2, "text": "一半以上的天數" },
            { "value": 3, "text": "幾乎每天" }
          ]
        },
        {
          "type": "radiogroup",
          "name": "phq9_08",
          "title": "動作或說話速度緩慢到別人已經察覺，或正好相反：煩躁或坐立不安、動來動去的情況更勝於平常",
          "isRequired": true,
          "choices": [
            { "value": 0, "text": "完全沒有" },
            { "value": 1, "text": "幾天" },
            { "value": 2, "text": "一半以上的天數" },
            { "value": 3, "text": "幾乎每天" }
          ]
        },
        {
          "type": "radiogroup",
          "name": "phq9_09",
          "title": "有不如死掉或用某種方式傷害自己的念頭",
          "isRequired": true,
          "choices": [
            { "value": 0, "text": "完全沒有" },
            { "value": 1, "text": "幾天" },
            { "value": 2, "text": "一半以上的天數" },
            { "value": 3, "text": "幾乎每天" }
          ]
        }
      ]
    }
  ],
  "calculatedValues": [
    {
      "name": "phq9_total_score",
      "expression": "{phq9_01} + {phq9_02} + {phq9_03} + {phq9_04} + {phq9_05} + {phq9_06} + {phq9_07} + {phq9_08} + {phq9_09}"
    }
  ]
}
```

## 8. Output data contract

```yaml
answer_payload:
  respondent_session_id: "string"
  instrument_id: "phq9_zh_tw"
  completed_at: "ISO-8601 datetime"
  answers:
    phq9_01: "integer 0..3"
    phq9_02: "integer 0..3"
    phq9_03: "integer 0..3"
    phq9_04: "integer 0..3"
    phq9_05: "integer 0..3"
    phq9_06: "integer 0..3"
    phq9_07: "integer 0..3"
    phq9_08: "integer 0..3"
    phq9_09: "integer 0..3"
  computed:
    phq9_total_score: "integer 0..27"
    source_pdf_interpretation: "string | null"
    source_pdf_interpretation_allowed_values:
      - "輕度憂鬱"
      - "中度憂鬱"
      - "重度憂鬱"
      - null
```

## 9. Interpretation table from source PDF

| total_score_range | source_label |
|---|---|
| 10-14 | 輕度憂鬱 |
| 15-19 | 中度憂鬱 |
| 20-27 | 重度憂鬱 |

原 PDF 未提供 0-9 分的分類文字；系統實作時應避免自行顯示未經來源支持的標籤，除非另有臨床或公共衛生規範來源。

## 10. System implementation notes

以下為系統實作建議，不屬於原 PDF 文字：

1. 本問卷適合做為自填式量表資料收集與初步摘要，不應由系統輸出診斷結論。
2. `phq9_09` 涉及自我傷害念頭。若答題值大於 0，系統應標記為 `requires_human_review: true`，並依部署場域的人員流程處理。
3. 所有題目應設為必填。若缺漏任一題，總分不應計算或應標記為 `score_status: incomplete`。
4. 資料庫可將原始答案與計算結果分開保存：`questionnaire_response.answers` 保存 9 題原始值，`questionnaire_response_scores` 保存總分與來源分類。

## 11. Source attribution text

本問卷由 Robert L. Spitzer 博士、Janet B.W. Williams 博士、Kurt Kroenke 博士和同事用 Pfizer Inc. 提供的教育基金設計。原 PDF 註明：無需准許即可複製、翻譯、展示或分發。
