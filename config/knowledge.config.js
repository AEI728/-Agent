// 知识库配置预留文件：当前不放入实际知识内容。
// 后续可在这里增加分块大小、Embedding 模型、向量库连接和来源白名单等配置。
module.exports = {
  storagePath: process.env.KNOWLEDGE_BASE_PATH || "./knowledge-base",
  ingestionEndpoint: "/api/knowledge/import",
  searchEndpoint: "/api/knowledge/search",
  sourceRequired: true
};
