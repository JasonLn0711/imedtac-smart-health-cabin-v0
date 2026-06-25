const baseUrl = process.env.RERANKER_SERVICE_URL ?? "http://localhost:8014";

async function readJson(path, init) {
  const response = await fetch(new URL(path, baseUrl), init);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${text.slice(0, 240)}`);
  }
  return JSON.parse(text);
}

try {
  const healthz = await readJson("/healthz");
  const status = await readJson("/status");
  const rerank = await readJson("/rerank", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: "症狀：胸口悶、走路會喘",
      documents: [
        { id: "doc_001", text: "胸悶與呼吸困難健康篩檢流程", metadata: { lang: "zh-TW" } },
        { id: "doc_002", text: "QR code 報告操作說明", metadata: { lang: "zh-TW" } }
      ],
      topK: 1
    })
  });
  const options = await readJson("/rerank-options", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: "我這幾天睡不好",
      questionId: "phq9_03",
      options: [
        { optionId: "0", text: "完全沒有" },
        { optionId: "1", text: "幾天" },
        { optionId: "2", text: "一半以上的天數" },
        { optionId: "3", text: "幾乎每天" }
      ],
      topK: 1
    })
  });

  if (healthz.service !== "reranker-service") throw new Error("bad healthz service");
  if (status.provider !== "qwen3_reranker_0_6b") throw new Error("bad reranker provider");
  if (rerank.results?.[0]?.id !== "doc_001") throw new Error("rerank did not rank expected document first");
  if (options.confirmationRequired !== true) throw new Error("rerank-options must require confirmation");

  console.log(JSON.stringify({ healthz, status, rerank, options }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
