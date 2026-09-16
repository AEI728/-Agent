const path = require("node:path");

// 知识库配置集中在这里，后续增加向量数据库、Embedding 服务或对象存储时只改此处。
const knowledgeBasePath = path.resolve(
  process.env.KNOWLEDGE_BASE_PATH || path.join(process.cwd(), "knowledge-base")
);

module.exports = {
  port: Number(process.env.PORT || 4311),
  llm: {
    // PLACEHOLDER_LLM_CONFIG: 开发默认模拟；正式部署请设置 USE_MOCK_LLM=false 和 OPENAI_API_KEY。
    useMock: process.env.USE_MOCK_LLM !== "false",
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini"
  },
  rag: {
    topK: Number(process.env.RAG_TOP_K || 4),
    // MVP 使用本地结构化 JSON；后续可在 KnowledgeStore 边界替换为向量数据库。
    knowledgeBasePath
  }
};
