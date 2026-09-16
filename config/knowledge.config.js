// 知识库配置：MVP 从本地结构化 JSON 加载，后续可替换为向量数据库。
module.exports = {
  storagePath: process.env.KNOWLEDGE_BASE_PATH || "./knowledge-base",
  ingestionEndpoint: "/api/knowledge/import",
  searchEndpoint: "/api/knowledge/search",
  sourceRequired: true
};
