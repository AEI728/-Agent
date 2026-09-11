# 小安·保险 Agent

这是一个可在 VSCode 中运行的保险需求咨询 Agent。当前项目保留原有的个人/家庭分流前端，并增加了后端 Agent API、RAG 检索层和知识库管理接口。

## 启动

```bash
npm install
copy .env.example .env
npm run dev
```

打开 <http://127.0.0.1:4311>。

开发阶段 `.env.example` 默认使用模拟 LLM：

```env
USE_MOCK_LLM=true
```

接入正式 API 时，在 `.env` 中设置：

```env
USE_MOCK_LLM=false
OPENAI_API_KEY=你的正式密钥
OPENAI_MODEL=gpt-4.1-mini
```

API key 只允许放在后端环境变量中，不能放进 `index.html` 或浏览器脚本。

## Agent 工作流

```text
用户输入/快捷选项
  -> 当前步骤校验与答案标准化
  -> 更新个人/家庭需求画像
  -> 下一步追问，直到画像完成
  -> POST /api/chat
      -> KnowledgeStore.search（RAG 检索）
      -> 组合需求画像 + 外部知识上下文
      -> LLMService.generate
          -> 开发阶段：模拟占位回答
          -> 正式环境：OpenAI Responses API
  -> 返回回答与引用来源
  -> 前端展示保障建议
```

当前前端的规则式建议仍然保留，用于离线兜底；完成画像后会额外调用后端 Agent API。

## API

### `GET /api/health`

返回当前 LLM 模式、模型名、RAG 状态、知识库预留路径和已加载文档数。

### `POST /api/chat`

请求示例：

```json
{
  "mode": "family",
  "profile": {
    "familyMembers": "本人 35 岁、伴侣 34 岁、孩子 6 岁",
    "liabilities": "房贷约 120 万，还有 25 年"
  },
  "message": "请给出下一步规划建议"
}
```

响应包含 `reply`、`mode` 和 `sources`。`sources` 是 RAG 检索命中的外部知识来源。

### `POST /api/knowledge/import`

知识库导入接口。当前文档只暂存在内存，不会向项目目录写入真实知识文件：

```json
{
  "documents": [
    {
      "id": "example-policy-guide",
      "title": "示例保险条款说明",
      "content": "外部知识正文",
      "source": "https://example.com/source"
    }
  ]
}
```

### `GET /api/knowledge/search?q=医疗险`

按关键词检索当前知识源，并返回匹配分数和来源信息。

## 知识库约定

- 配置文件：`config/agent.config.js`
- 环境变量：`KNOWLEDGE_BASE_PATH`
- 默认预留路径：`knowledge-base/`
- 当前目录只保留 `.gitkeep`，不放入业务知识文件。
- `src/knowledge/store.js` 中的 `KnowledgeStore.importDocuments` 是导入接口，`search` 是 RAG 检索接口。
- 后续可在同一接口边界替换为 PostgreSQL/pgvector、专用向量数据库、Embedding 服务或对象存储。

## 占位位置

- `src/services/llm.js` 的 `PLACEHOLDER_LLM_CALL`：开发阶段模拟输出。
- `src/services/llm.js` 的 `FORMAL_LLM_API`：正式 OpenAI Responses API 调用。
- `config/agent.config.js` 的 `PLACEHOLDER_LLM_CONFIG`：模拟/正式模式切换配置。
- `app.js` 的 `PLACEHOLDER_AGENT_FALLBACK`：后端不可用时保留前端规则建议。

## 检查

```bash
npm run check
```
