const fs = require("node:fs/promises");
const path = require("node:path");

function tokenize(value) {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, " ");
  const tokens = normalized
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2);
  const chineseRuns = normalized.match(/[\u4e00-\u9fff]{2,}/g) || [];
  chineseRuns.forEach((run) => {
    for (let index = 0; index < run.length - 1; index += 1) {
      tokens.push(run.slice(index, index + 2));
    }
  });
  return tokens;
}

class KnowledgeStore {
  constructor({ rootPath, topK = 4 }) {
    this.rootPath = rootPath;
    this.topK = topK;
    this.documents = new Map();
    this.loadedFromDisk = false;
  }

  // 知识库导入接口：暂存于内存，避免在当前项目中放入真实业务资料。
  // 后续可在这里替换为 PostgreSQL/pgvector、向量数据库或对象存储写入逻辑。
  importDocuments(documents = []) {
    const imported = [];
    for (const document of documents) {
      if (!document?.content || !document?.title) continue;
      const id = String(document.id || `external-${Date.now()}-${this.documents.size + 1}`);
      const normalized = {
        id,
        title: String(document.title),
        content: String(document.content),
        source: String(document.source || "external-import"),
        updatedAt: new Date().toISOString()
      };
      this.documents.set(id, normalized);
      imported.push({ id, title: normalized.title, source: normalized.source });
    }
    return imported;
  }

  async loadFromConfiguredPath() {
    if (this.loadedFromDisk) return;
    this.loadedFromDisk = true;
    try {
      const entries = await fs.readdir(this.rootPath, { withFileTypes: true });
      const supported = new Set([".md", ".txt", ".json"]);
      for (const entry of entries) {
        if (!entry.isFile() || !supported.has(path.extname(entry.name).toLowerCase())) continue;
        const filePath = path.join(this.rootPath, entry.name);
        const content = await fs.readFile(filePath, "utf8");
        if (path.extname(entry.name).toLowerCase() === ".json") {
          try {
            const parsed = JSON.parse(content);
            this.importDocuments(Array.isArray(parsed) ? parsed : parsed.documents || []);
            continue;
          } catch {
            // 无法解析的 JSON 作为普通文本处理，避免阻塞其他知识源。
          }
        }
        this.importDocuments([{ id: entry.name, title: entry.name, content, source: filePath }]);
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  async search(query, limit = this.topK) {
    await this.loadFromConfiguredPath();
    const queryTokens = new Set(tokenize(query));
    return [...this.documents.values()]
      .map((document) => {
        const tokens = new Set(tokenize(`${document.title} ${document.content}`));
        const overlap = [...tokens].filter((token) => queryTokens.has(token)).length;
        return { ...document, score: overlap / Math.max(queryTokens.size, 1) };
      })
      .filter((document) => document.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, limit);
  }

  async list() {
    await this.loadFromConfiguredPath();
    return [...this.documents.values()].map(({ id, title, source, updatedAt }) => ({ id, title, source, updatedAt }));
  }
}

module.exports = { KnowledgeStore };
