require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("node:path");
const config = require("./config/agent.config");
const { KnowledgeStore } = require("./src/knowledge/store");
const { LLMService } = require("./src/services/llm");

const app = express();
const knowledgeStore = new KnowledgeStore({
  rootPath: config.rag.knowledgeBasePath,
  topK: config.rag.topK
});
const llmService = new LLMService(config.llm);

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname)));

function buildSystemPrompt(mode) {
  return `你是“安心保”保险规划 Agent。当前模式：${mode === "family" ? "家庭配置" : "个人配置"}。你只做中立的需求梳理和保障教育，不承诺承保、理赔或具体产品结果，也不点名推荐任何保险产品。
回答不能停留在险种和保额建议：对每个相关险种都要补充“优质产品画像”（可核验的硬指标）、“避坑指南”（常见的责任或销售陷阱）、“条款阅读指南”（保险责任、责任免除、释义/特别约定、健康告知）和“对比验算方法”（保额、保费、等待期、关键责任/限制、现金价值等）。引导用户拿官方条款逐项核对，明确哪些是通用经验、哪些需以最新合同和核保结论为准。回答必须区分事实、建议和不确定性；若使用外部知识，只引用检索上下文中真实存在的来源。`;
}

app.get("/api/health", async (_request, response) => {
  response.json({
    ok: true,
    llmMode: llmService.isMock ? "mock" : "openai",
    model: config.llm.model,
    rag: { enabled: true, knowledgeBasePath: config.rag.knowledgeBasePath, documents: (await knowledgeStore.list()).length }
  });
});

app.post("/api/chat", async (request, response) => {
  try {
    const { profile = {}, message = "", mode = "individual" } = request.body || {};
    const query = `${message}\n${JSON.stringify(profile)}`;
    const contexts = await knowledgeStore.search(query, config.rag.topK);
    const result = await llmService.generate({
      system: buildSystemPrompt(mode),
      user: `需求画像：${JSON.stringify(profile, null, 2)}\n用户问题：${message}`,
      contexts
    });
    response.json({
      reply: result.text,
      mode: result.mode,
      sources: contexts.map(({ id, title, source, score }) => ({ id, title, source, score }))
    });
  } catch (error) {
    console.error("/api/chat failed", error);
    response.status(500).json({ error: "Agent 暂时无法生成回答" });
  }
});

// 临时导入接口只写内存；持久知识由 knowledge-base 目录中的 JSON 管理。
app.post("/api/knowledge/import", (request, response) => {
  const imported = knowledgeStore.importDocuments(request.body?.documents || []);
  response.status(201).json({ imported, count: imported.length, storage: "memory-placeholder" });
});

app.get("/api/knowledge", async (_request, response) => {
  response.json({ rootPath: config.rag.knowledgeBasePath, documents: await knowledgeStore.list() });
});

app.get("/api/knowledge/search", async (request, response) => {
  response.json({ query: request.query.q || "", results: await knowledgeStore.search(request.query.q || "") });
});

app.get("*", (_request, response) => response.sendFile(path.join(__dirname, "index.html")));

app.listen(config.port, () => {
  console.log(`Insurance Agent running at http://127.0.0.1:${config.port}`);
  console.log(`LLM mode: ${llmService.isMock ? "mock placeholder" : `OpenAI ${config.llm.model}`}`);
  console.log(`Knowledge base path: ${config.rag.knowledgeBasePath}`);
});
