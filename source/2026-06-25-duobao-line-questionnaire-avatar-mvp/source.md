---
id: 2026-06-25-duobao-line-questionnaire-avatar-mvp
title: "2026-06-25 Duobao LINE - Questionnaire and Avatar MVP Direction"
date: 2026-06-25
topic: smart-health-cabin
type: source
status: preserved
source_owner: user-provided
participants:
  - "阿聖 Jason"
  - "許桓瑜（多寶）"
channel: LINE
time_range: "10:44-11:06"
related:
  - ../../workstreams/smart-health-cabin/module-b-questionnaire-triage-discovery.md
  - ../../workstreams/smart-health-cabin/module-c-avatar-interaction-discovery.md
  - ../../workstreams/smart-health-cabin/post-meeting-decision-log.md
---

# 2026-06-25 Duobao LINE - Questionnaire and Avatar MVP Direction

## Source Boundary

This record preserves the user-provided LINE conversation between Jason and
多寶 on 2026-06-25 for Smart Health Cabin source traceability. Its project use is
internal scoping for the questionnaire system, Avatar real-time conversation
path, and September demo focus. External claims, political context, clinical
questionnaire use, and deployment commitments remain governed by separate
verification, source, and validation paths.

## Decision Signal

The conversation shifts the MVP center from a four-module sprint toward:

```text
open questionnaire system + real-time voice Avatar Agent
```

The strongest action signal is:

- keep the system open so hospitals can input and publish questionnaires;
- use one or two credible questionnaires for the September demo;
- use PHQ-9 as the first implemented seed in this repository;
- connect the AI-visible value to ASR/LLM/TTS/Avatar guidance;
- defer hearing and vision until the questionnaire + Avatar MVP is working.

Canonical decision record:

```text
../../workstreams/smart-health-cabin/2026-06-25-questionnaire-avatar-mvp-pivot.md
```

Copied PHQ-9 source:

```text
assets/2026-06-25-phq9-zh-TW-source.pdf
extracted/2026-06-25-phq9-zh-TW-agent-readable.md
```

## Original LINE Transcript

```text
10:44 許桓瑜（多寶） 蔣萬安那個到底是真的還是假的啊
10:45 阿聖 Jason 不確定，我們聽到的都是傳聞證據
10:45 許桓瑜（多寶） 我覺得可能需要跟老師討論一下
10:45 許桓瑜（多寶） 你有開始進行這個Case 了嗎?
10:45 阿聖 Jason 最源頭的講法，是老師透過聯醫那邊得知的
10:46 阿聖 Jason 然後老師找慧誠合作
10:46 阿聖 Jason 慧誠去找 avatar 公司
10:46 阿聖 Jason 源頭目前是聯醫的總院長
10:47 阿聖 Jason 但老師他們現在沒有把細節要做什麼等等的問題問得很清楚
10:47 許桓瑜（多寶） 是啊，我覺得好像昨天苗業務好像也覺得頭很大的樣子
10:47 阿聖 Jason 老師透過總院長知道這件事情之後，他主要詢問的窗口是陳美如主任（家醫科的醫師）
10:48 阿聖 Jason 但美如主任也沒有明確的頭緒
10:48 阿聖 Jason 所以回答得很模糊
10:48 阿聖 Jason 這個也可以、那個也可以，大概這樣
10:48 許桓瑜（多寶） 基本上就是想要做一個東西但是沒有人知道要做甚麼
10:48 許桓瑜（多寶） 然後莫名其妙加了視力聽力
10:48 阿聖 Jason 所以我覺得之後一定還會再改
10:49 阿聖 Jason 大家的想像力太豐富了
10:49 許桓瑜（多寶） 這樣我反而覺得視力聽力模組先不要做
10:49 許桓瑜（多寶） 我覺得我們先把語音agent 那一塊搞起來
10:49 許桓瑜（多寶） 視力聽力基本上完全不炫酷
10:49 阿聖 Jason 我決定就兩件事情，問卷系統以及 avatar real time conversation 
10:50 阿聖 Jason *覺得*
10:50 阿聖 Jason 不是*決定*
10:50 許桓瑜（多寶） 是啊先把這兩個做起來基本上9月應該就可以交代了
10:50 阿聖 Jason 嗯嗯
10:50 阿聖 Jason 我們先搞好
10:51 阿聖 Jason 你覺得問卷要問什麼？
10:51 阿聖 Jason 跟公衛有相關的主題嗎？
10:51 許桓瑜（多寶） 這個我search 一下
10:51 阿聖 Jason 應該也要有公信力的依據
10:51 阿聖 Jason 嗯嗯
10:51 許桓瑜（多寶） 我覺得你可以先把語音互動搞起來
10:51 阿聖 Jason 可
10:51 許桓瑜（多寶） 先弄一個可以跑得動的語音模型
10:52 許桓瑜（多寶） 然後我們再慢慢把各種東西拚上去
10:52 阿聖 Jason 我先講單搞一個問卷，之後再套你的
10:52 阿聖 Jason 讓我的語音可以跑
10:52 阿聖 Jason 我這兩天把架構畫出來
10:52 許桓瑜（多寶） 你之前泌尿科的那個問卷你可以先試著照著那個做
10:52 許桓瑜（多寶） 因為我覺得他們是希望問卷是醫院輸入的
10:53 許桓瑜（多寶） 所以我們應該是一個 open 的系統
10:53 許桓瑜（多寶） 然後我們可以輸入問卷
10:53 阿聖 Jason 九月 demo 那個可能要先 narrow down 到一兩個問卷
10:53 阿聖 Jason AI 的部份放在語音對話跟 avatar
10:54 阿聖 Jason 這些應該夠做炫泡的 campaign 
10:54 許桓瑜（多寶） 我覺得那先用那個失智問卷
10:55 阿聖 Jason 嗯嗯
10:55 許桓瑜（多寶） d45b03ce-9569-4484-b51d-09e45ef02fd2.pdf
10:55 許桓瑜（多寶） 這個是MMSE 
10:56 許桓瑜（多寶） 臨床上真的會用到的指標
10:56 許桓瑜（多寶） 不過做這個好像沒有那麼簡單
10:56 許桓瑜（多寶） MMSE 基本上是真的會寫在病歷裡面的那種
10:58 許桓瑜（多寶） 96c3c6ad-a249-4200-93b3-6a32d6a19c7e.pdf
10:59 阿聖 Jason 但如果是放在市政府
11:00 阿聖 Jason 有認知功能障礙的人，會一直出現於市政府來操作這個嗎？
11:00 許桓瑜（多寶） 我是覺得先用原本的AD-8 來操作好了
11:03 許桓瑜（多寶） CGHPHD_2.pdf
11:04 阿聖 Jason 針對一般民眾，我覺得這不錯～
11:04 阿聖 Jason 大眾都能做
11:04 許桓瑜（多寶） 問chatgpt 得到的XD
11:04 許桓瑜（多寶） 我把一些能做的問卷收集一下
11:04 阿聖 Jason 我先用這個來做做看
11:05 許桓瑜（多寶） 我覺得做一個open 的system 也就是定義欄位 等等
11:05 許桓瑜（多寶） 然後這些問卷存到資料庫裏面
11:05 許桓瑜（多寶） 不要寫死
11:05 許桓瑜（多寶） 先收集問卷把各種欄位定義下來
11:05 阿聖 Jason 可以
11:05 許桓瑜（多寶） 之後再加
11:06 許桓瑜（多寶） 這樣就能快速擴充問卷
```
