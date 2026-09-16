# 🛡️ 安心保 Insurance Agent v0.1.0

面向个人与家庭的中立保险规划助手 | Neutral insurance planning assistant powered by rule-based guidance, RAG and the OpenAI API

## 📖 项目简介

安心保是一套可本地运行的保险需求梳理 Agent，帮助用户把“想买保险”拆解成可核对、可解释的保障问题：

- 🧭 **需求画像**：通过分步对话收集保障对象、家庭责任、预算、已有保障和健康告知等信息。
- 📊 **保障配置**：根据个人/家庭画像生成医疗险、重疾险、寿险和意外险的配置顺序与预算参考。
- 🔍 **产品验算**：用续保、等待期、免赔额、责任免除、现金价值等维度比较候选方案，不点名推荐具体产品。
- 📚 **知识检索**：从本地结构化知识库检索保险概念、社保医保、险种规则、FAQ 与合规提示。
- 🤖 **双模式 Agent**：开发阶段使用模拟 LLM；配置 API Key 后可切换到 OpenAI Responses API。
- 📄 **结果导出**：将需求画像、配置建议、条款阅读指南和候选产品验算记录导出为文本。

> 本项目用于保险需求教育与方案整理，不构成承保、理赔、投资或具体保险产品推荐。正式投保前，请以保险公司最新官方条款、费率、健康告知和核保结论为准。

## 🚀 快速开始

### 方式一：本地运行

#### Step 1：克隆项目

```bash
git clone https://github.com/AEI728/-Agent.git
cd ./-Agent
```

#### Step 2：安装依赖

```bash
npm install
```

#### Step 3：创建环境变量文件

Windows PowerShell：

```powershell
Copy-Item .env.example .env
```

macOS / Linux：

```bash
cp .env.example .env
```

开发阶段保持 `USE_MOCK_LLM=true` 即可运行，无需 API Key。

#### Step 4：启动服务

```bash
npm run dev
```

浏览器打开 <http://127.0.0.1:4311>。

生产或稳定运行模式：

```bash
npm start
```

### 方式二：生成单文件演示版

将页面、样式和前端脚本合并为一个 `standalone.html`：

```bash
node build-standalone.js
```

该文件适合离线展示或作为静态原型分发。单文件版本不包含 Node.js 后端 API，完成画像后的在线 LLM/RAG 调用需要通过完整本地服务运行。

## 🔧 配置说明

### 环境变量

| 配置项 | 必填 | 默认值 | 说明 |
| --- | :---: | --- | --- |
| `USE_MOCK_LLM` | 否 | `true` | `true` 使用模拟回答；设为 `false` 才会调用 OpenAI |
| `OPENAI_API_KEY` | 正式 API 模式 | 空 | OpenAI API Key，仅在后端环境变量中配置 |
| `OPENAI_MODEL` | 否 | `gpt-4.1-mini` | Responses API 使用的模型名称 |
| `PORT` | 否 | `4311` | Express 服务端口 |
| `KNOWLEDGE_BASE_PATH` | 否 | `./knowledge-base` | 本地知识库目录 |
| `RAG_TOP_K` | 否 | `4` | 每次检索返回的最多知识条目数 |

正式 API 模式示例：

```env
USE_MOCK_LLM=false
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4.1-mini
PORT=4311
KNOWLEDGE_BASE_PATH=./knowledge-base
RAG_TOP_K=4
```

不要将 API Key 写入 `index.html`、`app.js` 或其他浏览器端文件，也不要提交 `.env`。

## 🧠 Agent 工作流程

```text
用户输入 / 快捷选项
        ↓
前端校验与答案标准化
        ↓
建立个人或家庭需求画像
        ↓
规则式建议 + 产品选择尺子 + 条款阅读指南
        ↓
POST /api/chat（完成画像后调用）
        ↓
KnowledgeStore.search：检索本地知识库
        ↓
LLMService.generate：组合画像、问题与检索上下文
        ├─ mock：返回开发阶段占位回答
        └─ openai：调用 OpenAI Responses API
        ↓
返回回答、模式和来源
        ↓
前端展示 Agent 建议并支持导出
```

前端保留规则式离线兜底逻辑；后端不可用时，用户仍可查看本地生成的基础建议。

## 🔌 API 接口

### 健康检查：`GET /api/health`

```bash
curl http://127.0.0.1:4311/api/health
```

返回当前 LLM 模式、模型、知识库路径和已加载文档数量。

### Agent 对话：`POST /api/chat`

PowerShell：

```powershell
Invoke-RestMethod http://127.0.0.1:4311/api/chat -Method Post -ContentType 'application/json' -Body '{"mode":"family","profile":{"familyMembers":"本人35岁、伴侣34岁、孩子6岁","liabilities":"房贷约120万，还有25年"},"message":"请给出下一步保障规划"}'
```

macOS / Linux：

```bash
curl -X POST http://127.0.0.1:4311/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"mode":"family","profile":{"familyMembers":"本人35岁、伴侣34岁、孩子6岁","liabilities":"房贷约120万，还有25年"},"message":"请给出下一步保障规划"}'
```

响应字段：

```json
{
  "reply": "……",
  "mode": "mock",
  "sources": [
    { "id": "faq-001", "title": "……", "source": "……", "score": 0.42 }
  ]
}
```

### 知识库导入：`POST /api/knowledge/import`

导入接口用于临时测试，数据只保存在当前进程内存中，服务重启后会清空：

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

### 查看知识库：`GET /api/knowledge`

返回已加载文档的 ID、类型、分类、标题、来源、审核状态和更新时间。

### 检索知识库：`GET /api/knowledge/search?q=医疗险`

按关键词检索本地知识，返回匹配分数和来源信息。

## 📚 知识库

MVP 已内置 6 个 JSON 文件、共 150 条结构化知识：

| 文件 | 内容 | 条数 |
| --- | --- | ---: |
| `01-concepts.json` | 保险基础概念 | 30 |
| `02-social-insurance.json` | 社保与医保 | 20 |
| `03-insurance-types.json` | 意外、医疗、重疾、寿险 | 40 |
| `04-configuration-rules.json` | 配置方法与人群模板 | 20 |
| `05-faq.json` | 高频问答 | 30 |
| `06-compliance.json` | 免责声明与禁用规则 | 10 |

字段规范、审核要求和维护方式见 [`knowledge-base/README.md`](knowledge-base/README.md)。所有政策类内容在正式上线前都应由持证顾问、法务或当地政策负责人复核。

当前检索实现是轻量关键词匹配，便于 MVP 本地运行；后续可在 `KnowledgeStore` 边界替换为 Embedding、PostgreSQL/pgvector、专用向量数据库或对象存储。

## 📁 项目结构

```text
-Agent/
├── index.html                    # 主前端页面
├── styles.css                    # 页面样式与响应式布局
├── app.js                        # 对话流程、规则建议与前端交互
├── standalone.html               # 内嵌 CSS/JS 的单文件演示版
├── build-standalone.js           # 生成 standalone.html
├── server.js                     # Express 服务与 API 入口
├── src/
│   ├── services/llm.js           # Mock / OpenAI LLM 适配层
│   └── knowledge/store.js        # 知识库加载、导入与检索
├── config/
│   ├── agent.config.js           # 端口、LLM、RAG 配置
│   └── knowledge.config.js       # 知识库接口约定
├── knowledge-base/               # 结构化保险知识库
├── scripts/validate-knowledge.js # 知识库格式与数量校验
├── docs/                         # 项目复盘与职业发展材料
├── .env.example                  # 环境变量模板
├── package.json                  # npm 脚本与依赖
└── README.md                     # 项目说明
```

## 🧪 检查与维护

JavaScript 语法和知识库完整性检查：

```bash
npm run check
```

只检查知识库：

```bash
npm run check:knowledge
```

每次新增知识条目时，请确保 `id` 唯一，并填写 `type`、`title`、`source`、`reviewedBy`、`updatedAt` 及可检索正文。政策变化时同步更新来源和审核日期。

## ⚠️ 已知限制

| 限制 | 说明 |
| --- | --- |
| 不是投保或理赔系统 | 不提供购买入口、报价承诺、承保判断或理赔结论 |
| 知识库审核 | 当前条目标记为待审核，正式上线前必须完成专业复核 |
| 检索能力 | 当前使用关键词重叠评分，不等同于生产级语义向量检索 |
| 临时导入 | `/api/knowledge/import` 仅写入内存，重启服务后失效 |
| 模拟模式 | `USE_MOCK_LLM=true` 不会调用真实模型，回答仅用于开发联调 |
| 地区差异 | 社保、医保、医院范围和产品规则可能因地区、时间和合同而变化 |

## 🔐 隐私与合规提示

- 前端咨询过程中的画像保存在当前页面内存中，刷新或重置后会清空。
- 完成画像后，前端可能将用户主动填写的必要信息发送到本地后端 `/api/chat`，以生成 Agent 回答；若启用正式 LLM，后端会将请求发送给所配置的模型服务商。
- 请勿填写姓名、身份证号、手机号、银行卡号或详细病历等敏感信息。
- 所有健康告知必须以投保时的正式问卷为准，并由用户如实填写。

## 📄 License

当前仓库未声明开源许可证。如需公开分发或二次开发，请先补充合适的 `LICENSE` 文件。

## 🙏 致谢

- [Express](https://expressjs.com/)：Node.js Web 服务框架
- [OpenAI API](https://platform.openai.com/docs/)：可选的正式 LLM 能力
- [Lucide](https://lucide.dev/)：前端图标库

Made with ❤️ for clearer and more responsible insurance planning.
