---
id: 2026-06-29-johnny-line-open-measurement-station-budget-call
title: "2026-06-29 Johnny LINE Call - Open Measurement Station, Budget, Hardware, and Quote Scope"
date: 2026-06-29
topic: smart-health-cabin
type: source
status: preserved
source_owner: user-provided
participants:
  - "阿聖 Jason"
  - "Johnny（慧誠智醫 PM）"
channel: LINE call
language: zh-TW
related:
  - ../../workstreams/smart-health-cabin/2026-06-29-johnny-call-budget-scope-note.md
  - ../../workstreams/smart-health-cabin/post-meeting-decision-log.md
  - ../../workstreams/smart-health-cabin/feasibility-response-outline.md
  - ../../workstreams/smart-health-cabin/module-a-vision-hearing-discovery.md
  - ../../workstreams/smart-health-cabin/module-c-avatar-interaction-discovery.md
---

# 2026-06-29 Johnny LINE Call - Open Measurement Station, Budget, Hardware, and Quote Scope

## Source Boundary

This file preserves the user-provided cleaned transcript of a LINE call with
Johnny from 慧誠智醫 on `2026-06-29`. The transcript has already had filler
speech removed and sentence flow corrected by the user-provided conversion.

This source is an internal planning record for Smart Health Cabin scope,
budget framing, hardware assumptions, Avatar integration assumptions, and
quotation preparation. It is not a final quotation, procurement decision,
scope commitment, hardware purchase approval, clinical validation path, or
hospital-facing statement.

## Call Signal

The call establishes these working signals:

- the project direction has moved from a closed cabin body toward an open
  measurement-station presentation;
- Johnny needs NYCU to provide a plan and quote for the module scope so imedtac
  can discuss the total budget with the hospital side;
- the hospital-side requested functions still include vision/hearing, but the
  first wording should treat them as public-health style self-screening with a
  clear disclaimer and professional follow-up path;
- Avatar is expected to use or integrate a related vendor's existing service,
  not require NYCU to build a full Avatar system from nothing;
- the compute hardware is unresolved because the existing measurement-station
  computer likely cannot run the new Avatar/AI workload;
- one compact NVIDIA-class or similar mini PC option may cost around
  `NTD 120,000`, which Johnny flagged as expensive and needing internal
  discussion;
- the next working move is to provide several budget/scope versions, hardware
  minimum-spec guidance, and possible model options for Johnny and Prof. Wu to
  review.

## Preserved Cleaned Transcript

```text
我：喂，不好意思，剛才有電話。你現在在吃飯嗎？還是我晚一點再打？

Johnny (慧誠智醫 PM)：沒有，可以啊，現在可以。

我：好好。我想要問說，因為我從老師那邊得到的資訊，預算大概是 200 萬，但是有可能會被砍到大概剩下六、七成左右，所以我們目前大概是抓 120 到 150 萬。然後老師說可能需要兩台那種型號的健康艙。

Johnny (慧誠智醫 PM)：不過我們那天討論過一輪之後，實際跟總院——應該說我們的承辦人回給我們說，總院那邊後來是想要改成開放式，而不是一個艙體。硬體的需求已經被改了，我不知道老師那邊有沒有被更新到這一段。我們現階段的需求是改成有一個量測站，原本我在訊息裡面也有提到會是一個量測站。

我：就是你們原本的那一台？

Johnny (慧誠智醫 PM)：就是那天 demo 看到的那樣。只是裡面搭配的軟體，因為原本我們只有生理量測流程，現在就是要加上我們談的那些需求，把它串成一個。原本我這邊會需要的是——我那天不是把需求跟你們 brief 過了嗎？我會需要你這邊預計要怎麼來規劃這整件事，因為它就包含三個部分，大概是怎麼樣做，以及這一部分的報價。等於說我們的這一個模組是要請你們協助。

我：好。

Johnny (慧誠智醫 PM)：那我不知道老師有沒有……我不知道你們跟老師討論過後，老師有沒有了解這整個狀況？因為我這邊理解到的是，承辦其實有在問我們有沒有報價。所以對於我這邊的話，我們其實是需要知道你們這邊要怎麼進行這件事、以及你們的報價是多少，這樣我們才會比較 know-how（知道）可以怎麼樣跟院方來提這整個預算。流程大概就這樣。

我：好。那我這邊了解到老師這邊的資訊是，老師好像不太清楚我們後來把健康艙改成開放式，但我跟許醫師有跟他報告。另外就是許醫師那邊有照著上次講的，有跟老師說，因為其實視聽力跟聽力，他覺得這個部分現在要加上去是有難度的。

Johnny (慧誠智醫 PM)：這是老師這一段嗎？

我：許醫師是跟老師這樣報告。

Johnny (慧誠智醫 PM)：許醫師，OK。

我：對，但是老師沒有給相關的決策，他就是知道這件事情。

Johnny (慧誠智醫 PM)：我這邊可以回應一下，我也理解到許醫師以醫生角度的困難點。我覺得可以做的事情是，因為其實視聽力的那個模組是院方他們提出來的，那當然現在我們是有把整個 proposal（整個流程）都做成簡報，想要跟院方再討論一次，還不知道結果是什麼。但是這些抽出來、請你們做的需求，全部加起來其實就是原本院方跟我們之前談過的事情，只是我們把它整成了一個流程。所以現在聽起來這是一致的，那當然困難點會再跟他們討論。

但我覺得它比較像是——如果今天真的有困難、而這又是院方的需求，那我們可能就會提說，是不是就把視聽力當作是民眾類似公衛角度的篩檢或檢查而已，變成我們的 disclaimer（免責聲明）要寫好，比如說這個就是 for 個人使用，如果需要檢查的話還是要去找專業醫師等等。我們可能會這樣子操作，因為聽起來目前功能還是會存在的。

我：那我……

Johnny (慧誠智醫 PM)：你說、你說，大概是這樣。

我：那另外就是後來苗先生講到 Avatar 的那個部分，是確認要外包給外面的廠商做嗎？

Johnny (慧誠智醫 PM)：應該是說，它比較不像是外包。以我的理解，比較像是我們把這一整個模組請你們做，但是裡面可能有一些元素，因為依照時程的關係跟技術上的難度，可能也無法請你們從沒有到有全部開發一個自己的。所以那天面談才會提說，其實我們有接洽到一個有關係的廠商，他們其實已經有這樣子的方案，是不是我們就一起討論 Avatar 可以長什麼樣子，直接用他們的方案就好了？因為他們其實有這樣子的服務。

所以就變成是，我假設的情境是，如果你們做這些東西的前台，Avatar 的部分就由這個廠商提供，然後我們一起討論出彼此之間要怎麼串。等於說最後的流程是，你們會用他們的服務，已經串起來一個界面了，然後我們這邊可能還需要跟整個總流程看要怎麼接接。我的理解是這樣。這樣有沒有比較清楚？

我：有，大體上知道。那就是看之後如果真的要接到這個虛擬人物的話，我們就看跟對方要怎麼接、需要什麼資料。

Johnny (慧誠智醫 PM)：對，要怎麼接。對你們來講，這樣難度上也不會這麼高，不需要從頭做一個新的。因為我覺得它如果是要對外的話，如果有現成的服務可以用，事情就會比較簡單。

我：我覺得開發上面來說的話，確實主要是時間上的壓力，因為那個要微調其實需要時間。另外我還有點想要問，因為我們如果要將這些服務接上去的話，可能要像那天說的，我們要再外接另外一台小電腦。所以你們會再採購一台類似那種 `[不確定：GUTA 10]` 嗎？

Johnny (慧誠智醫 PM)：我覺得我們可以來討論，因為我目前對這個技術的規格沒有很了解。如果 Avatar 在你們這一段，我們可以來討論一下它最小的配備要多少。因為目前幾乎可以確認是不能用我們原本的那一台電腦，所以就要看哪一個比較適合，或是它可不可以其實就是一個很 fancy 的螢幕，然後後面自己接小電腦之類的。這種形式我們可以來討論。它只要反正現在就是用量測站來呈現嘛，所以只要那個小電腦可以被收起來、收在那個機構裡，應該就 OK。

我：大體上的方向是這樣。

Johnny (慧誠智醫 PM)：但我最後長什麼樣子還沒有想法。

我：我們是有看到一個規格的東西，還是說我之後跟許醫師討論完，我們整理起來給你。

Johnny (慧誠智醫 PM)：我覺得你可以跟許醫師討論完看有沒有……因為技術的這一段你們會更懂。等我這邊把流程都盡量寫好、先完成整個總流程，再來對應跟你們比較有關的部分，看彼此之間有沒有什麼想法上的落差。我們那個時候就可以更確定，比如硬體是怎樣之類的。但如果你們有時間的話，也可以先 survey 一下。

我：那你們那邊現在的總成本大概會抓在多少？因為我現在這邊……

Johnny (慧誠智醫 PM)：其實我們這邊的成本就是原本生理量測站的成本，這個是比較好預估的。只是現在的落差就是那個電腦會不一樣，但是那個價格我也不知道，因為我就不知道要採購哪一個才是適合的。

我：價格大概是一台大概 12 萬左右的一台小電腦。

Johnny (慧誠智醫 PM)：那好貴。

我：對，因為那個是……

Johnny (慧誠智醫 PM)：那我也要跟苗先生再討論。

我：對對對，因為那是 NVIDIA 那台 `[不確定：Spark]`，那一台就是很好用，但是……

Johnny (慧誠智醫 PM)：有需要用到那麼貴的嗎？還是說它其實可以用我們現在比較常用的電腦去外接，比如說 GPU 之類的？是可以這樣接的嗎？

我：如果要這樣接的話，我不知道能不能放在你們的量測站裡面。因為我講的那台小電腦，其實它的大小真的沒有很大，大概就是十幾公分見方，高度大概就是四到五公分，小小的。

Johnny (慧誠智醫 PM)：就是類似像 Mac mini 那個大小？

我：對，比 Mac 再矮一點。

Johnny (慧誠智醫 PM)：那那個機構件其實應該是還有一些些空間。但如果是以前那種電腦主機就沒有辦法，如果是小電腦的話是 OK 的。現在目前深度大概是 10 公分，高的地方其實有到 100 公分左右的一個立方體的空間，就是深度比較淺啦。

我：那這樣確實蠻好放的，如果要放那一台小電腦的話。但是如果是要放我們一般看到的電腦，可能有點吃力。

Johnny (慧誠智醫 PM)：但如果小電腦，還有沒有什麼其他的選項？除了你剛剛講的，它有什麼牌子嗎？還是說是 NVIDIA 自己出的？

我：有 NVIDIA 出的，也有微星的，還有華碩的都有，但是基本上都要 12 萬左右。本來是 10 萬塊，可是因為記憶體的關係，現在都漲到 12 萬。

Johnny (慧誠智醫 PM)：了解。那你們實驗室是有原本有什麼可以租借嗎？這也可以討論。

我：我們實驗室……我之前有去盤點過，我後來發現我們實驗室目前為止好像現在只有那種桌機，那種就很大台。所以我想說有沒有機會買小台的，可以放進去。

Johnny (慧誠智醫 PM)：我們現在是沒有。但是我覺得如果要採購的話，我可能要討論一下，因為如果假設是 12 萬的話，那等於它就幾乎佔掉我們原本生理量測站——如果是設備本身就沒有差很多，表示說電腦會太貴。所以我可能要想一想想有沒有什麼其他方法。

因為等於說現在我們這邊也還不知道那個預算是怎麼樣嘛，雖然你剛剛有分享，但那個好像是艙的預算。我不知道如果今天需求改成不是艙的話，那個會不會變。所以現在對我來講，我可能還是要先估一下成本大概落在哪裡。

我：好啊，其實我覺得我們可以先估，就先估兩個版本。因為基本上我會這樣想，是因為我問老師，老師其實他有時候比較忙，可能有的時候對方也沒有告訴他最新的訊息，所以有時候也是會有一點小落差。

Johnny (慧誠智醫 PM)：對，因為我這邊感受得到的是好像大家都有一個——就是好像 A 傳 B、B 傳 C。我現在收資訊稍微有點收集，那也要等我們把這些細節都已經大致上都有稍微確認的時候，才有辦法跟院方提這件事情（等 ready 之後），才不會很怪。想法上是這樣。

我：好，我覺得我跟老師討論，可能也只能先討論幾個比較可能的預算的版本，因為我現在也很難抓到底要怎麼拿捏。

Johnny (慧誠智醫 PM)：對，但我覺得你除了剛剛提到的那個採購，我覺得你可以建議說硬體設備是要什麼規格以上，那那個成本就看我們這邊怎麼抓。但我覺得你這邊可以估的，因為你那邊還有那個像是軟體的開發的人事費吧，我的理解是這樣。那那邊可能我覺得也要跟老師討論一下。

還是說我們的——因為我原本假想的合作方式比較像是外包一個案子給你們，所以你們就是會需要提你們的預算。也可能是別的形式，我也不知道，這一切都是有變數的。所以就變成是要看你們這邊自己的成本的估算，這可能要跟老師討論的是這一段。因為也很難說是，就如果是想要這樣的案子，應該也不會是無酬的。所以應該是院方包了一個案子給我們，我們再把裡面的東西包給你們，所以我們需要 know-how 裡面的東西，這樣才有辦法提那個預算。

我：了解，我知道。就是至少要寫得出來，才有辦法投標。

Johnny (慧誠智醫 PM)：對對對，大概是這樣。但我原本的理解是，因為我之前聽我們老闆講，他說好像原本是只有一座。我那時候聽到是只有一個量測站，先放在市府的診所裡面，然後這一個就是——因為它是為了……因為原本我們不是有提到那個 12 座的這件事嗎？那一個好像會放在明年。

但因為這一座的是已經——就是它是臨時跑出來的需求，所以就變成是好像我們這邊會先提供，所以其實我也不知道預算到底——現在有點撲朔迷離。但我覺得那個應該還好，就是反正就是你們先讓我們知道一下說，如果是開發，比如視聽力啊這些，然後你們覺得你們的成本會是多少。

我：好，就是視聽力，然後再加上那個問卷跟 Avatar。

Johnny (慧誠智醫 PM)：再加其他的。我們需要先知道一個大概。

我：好。那你們最低跟最高成本大概多少？我怕我抓到爆掉。

Johnny (慧誠智醫 PM)：沒有，如果你們抓到爆掉，我們就會討論 scope（範疇）是不是要換，或者是怎麼樣。這個有點難，因為我們現在還不知道說跟你們合作的那個 range（範圍）大概在哪邊。

我：好，那我跟老師講一下好了，我先給他幾個方案。因為我覺得他應該會問我了。

Johnny (慧誠智醫 PM)：他應該也有點不太清楚說這樣子到底要怎麼討論，所以……

我：所以他應該會請我提供，所以我也想說我要怎麼提供給他。

Johnny (慧誠智醫 PM)：是。沒關係，你可以在訊息給我好了，看有沒有什麼建議的型號，我來看看。

我：好啊好啊，沒關係，我找一下。

Johnny (慧誠智醫 PM)：好，再麻煩你。

我：不會，辛苦你了，我現在也是在頭痛這個。

Johnny (慧誠智醫 PM)：這有點難。

我：我覺得主要是最前面的源頭不知道要跟誰接洽。

Johnny (慧誠智醫 PM)：老闆一定知道他跟誰對頭嘛，但因為像我們執行的人對的是承辦，但承辦他可能不知道有這件事。

我：嗯，了解。

Johnny (慧誠智醫 PM)：因為這個比較像是老闆們他們有一天談出來的，變相是這樣。

我：可能是吃飯吃出來之類的。

Johnny (慧誠智醫 PM)：對對對。

我：好，那我知道了。

Johnny (慧誠智醫 PM)：好，那再麻煩你。

我：好，謝謝，拜拜。

Johnny (慧誠智醫 PM)：謝謝，拜拜。
```
