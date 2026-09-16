const fs = require("node:fs");
const path = require("node:path");

const rootPath = path.resolve(__dirname, "..", "knowledge-base");
const expectedCounts = {
  "01-concepts.json": 30,
  "02-social-insurance.json": 20,
  "03-insurance-types.json": 40,
  "04-configuration-rules.json": 20,
  "05-faq.json": 30,
  "06-compliance.json": 10
};
const ids = new Set();
const errors = [];
let total = 0;

for (const [fileName, expectedCount] of Object.entries(expectedCounts)) {
  const filePath = path.join(rootPath, fileName);
  let documents;
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    documents = parsed.documents;
  } catch (error) {
    errors.push(`${fileName}: JSON 无法读取或解析 (${error.message})`);
    continue;
  }

  if (!Array.isArray(documents)) {
    errors.push(`${fileName}: documents 必须是数组`);
    continue;
  }
  if (documents.length !== expectedCount) {
    errors.push(`${fileName}: 应有 ${expectedCount} 条，实际 ${documents.length} 条`);
  }

  documents.forEach((document, index) => {
    const label = `${fileName}#${index + 1}`;
    for (const field of ["id", "type", "title", "source", "reviewedBy", "updatedAt"]) {
      if (!document[field]) errors.push(`${label}: 缺少 ${field}`);
    }
    const searchableContent = document.content || document.answer || document.definition;
    if (!searchableContent) errors.push(`${label}: 缺少 content、answer 或 definition`);
    if (ids.has(document.id)) errors.push(`${label}: id ${document.id} 重复`);
    ids.add(document.id);
  });
  total += documents.length;
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`知识库校验通过：6 个文件，共 ${total} 条，无重复 ID 或必填字段缺失。`);
}
