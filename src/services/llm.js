const OpenAI = require("openai");

class LLMService {
  constructor(config) {
    this.config = config;
    this.isMock = config.useMock || !config.apiKey;
    this.client = this.isMock ? null : new OpenAI({ apiKey: config.apiKey });
  }

  async generate({ system, user, contexts = [] }) {
    const contextBlock = contexts.length
      ? contexts.map((item, index) => `[${index + 1}] ${item.title}\n${item.content}`).join("\n\n")
      : "暂无可用外部知识来源。";
    const groundedUser = `${user}\n\n可引用的外部知识：\n${contextBlock}`;

    if (this.isMock) {
      // PLACEHOLDER_LLM_CALL: 开发阶段模拟正式 API 输出；正式环境由下方 Responses API 调用替换。
      const citation = contexts.length ? `\n参考资料：[${contexts[0].title}]` : "";
      return {
        mode: "mock",
        text: `已收到这份保障画像。建议先按家庭责任、已有保障和健康告知确定需要比较的险种，再用“续保/责任/免责/等待期/健康告知/现金价值”这些维度核对官方条款。这里提供的是筛选标准和避坑提醒，不指向任何具体产品。${citation}`
      };
    }

    // FORMAL_LLM_API: 正式环境调用 OpenAI Responses API。不要把 API key 放到浏览器端。
    const response = await this.client.responses.create({
      model: this.config.model,
      input: [
        { role: "system", content: [{ type: "input_text", text: system }] },
        { role: "user", content: [{ type: "input_text", text: groundedUser }] }
      ]
    });
    return { mode: "openai", text: response.output_text || "暂未生成可用建议。" };
  }
}

module.exports = { LLMService };
