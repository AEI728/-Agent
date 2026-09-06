const INDIVIDUAL_FIELDS = ["intent", "age", "gender", "needs", "city", "occupation", "family", "liabilities", "existing", "budget", "health"];
const FAMILY_FIELDS = ["intent", "familyMembers", "children", "parentsSupport", "liabilities", "incomeExpense", "existing", "budget", "goals", "city", "health"];
const ALL_FIELDS = [...new Set([...INDIVIDUAL_FIELDS, ...FAMILY_FIELDS])];
const OPEN_FIELDS = new Set(["familyMembers", "family", "liabilities", "existing", "health"]);

const questionBank = {
  intent: {
    question: "你好，我是小安。先确认一下：这次是想规划自己的保险，还是给全家一起规划？",
    replies: ["给自己规划", "给全家规划"]
  },
  familyMembers: {
    question: "请介绍一下家庭结构：有哪些成员、各自的年龄和关系、谁是主要经济来源。可以这样写：“本人 35 岁（主要收入来源）、伴侣 34 岁、孩子 6 岁、父母 60 岁左右”。无需填写姓名。",
    replies: []
  },
  needs: {
    question: "目前最想优先解决哪些保障诉求？可以选一项或多项，也可以直接补充你的想法。",
    replies: ["大额医疗费用", "重疾后的收入损失", "意外风险", "养老与长期照护", "家庭责任与身故保障", "还不确定，先梳理"]
  },
  age: {
    question: "了解。被保障人的年龄大约是多少？年龄会影响可选保障和保费范围。",
    replies: ["18–30 岁", "31–40 岁", "41–50 岁", "51–60 岁", "60 岁及以上"]
  },
  gender: {
    question: "还需要确认性别。不同险种的费率和健康告知可能会有差异。",
    replies: ["男", "女", "暂不说明"]
  },
  city: {
    question: "常住城市是哪里？医疗险的医院范围、惠民保等地方性保障可能与城市有关。",
    replies: ["北上广深等一线", "新一线 / 省会", "地级市", "县城 / 乡镇", "暂不说明"]
  },
  family: {
    question: "方便介绍一下你的家庭情况吗？比如是否已婚、有没有子女、是否需要赡养父母。可以这样描述：“已婚，有一个 5 岁的孩子，父母 60 多岁需要赡养”。",
    replies: []
  },
  liabilities: {
    question: "目前有没有房贷、车贷等负债？请大致说明类型和剩余金额，例如：“房贷约 80 万，还有 20 年”。没有负债直接说明即可。",
    replies: []
  },
  occupation: {
    question: "职业大致属于哪一类？不需要填写单位或具体职位，告诉我风险类别即可。",
    replies: ["办公室 / 管理类", "教育 / 医护 / 服务类", "制造 / 物流等", "高空 / 高危作业", "自由职业 / 暂不说明"]
  },
  existing: {
    question: "现在有哪些保障？请按“社保（医保 / 养老）+ 商业保险”分开说，商业险告诉我类型和大致保额即可。例如：“有职工医保和职工养老，另有一份重疾险 30 万、一份百万医疗险”。",
    replies: []
  },
  budget: {
    question: "收入水平和预算承受大致如何？不必填写精确金额，告诉我每年愿意投入多少保障型保费即可；通常建议控制在年收入的 5%–10% 内。",
    replies: ["3000 元以内", "3000–6000 元", "6000–10000 元", "1–2 万元", "2 万元以上", "先梳理需求再定"]
  },
  health: {
    question: "最后了解一下健康状况。请按实际情况说明，比如是否有慢性病、长期用药，或近年的住院、手术经历。例如：“有高血压、长期服药，近三年没有住院”。无需提供病历，投保时以正式健康告知为准。",
    replies: []
  },
  children: {
    question: "请说说子女的年龄和当前教育阶段，多个孩子请分别说明。例如：“女儿 6 岁（小学一年级）、儿子 12 岁（初中）”。没有子女请直接说明。",
    replies: []
  },
  parentsSupport: {
    question: "请介绍一下父母赡养或照护情况，比如是否需要经济支持、医疗支出大不大、由谁照护。例如：“父母在老家，每月给 2000 元生活费，医疗费用主要由他们自己承担”。",
    replies: []
  },
  incomeExpense: {
    question: "请介绍一下家庭年收入和年支出的大致结构，比如年收入多少、主要支出有哪些、大概能结余多少。例如：“家庭年收入约 25 万，房贷年还 6 万，孩子教育约 3 万，每年结余 8 万左右”。",
    replies: []
  },
  goals: {
    question: "除了眼前保障，家庭还有哪些长期目标？这会影响预算分配和保障期限。",
    replies: ["先补齐基础保障", "准备子女教育金", "规划养老与长期照护", "关注财富传承", "还在梳理长期目标"]
  }
};

const productComparisons = {
  medical: {
    label: "医疗险",
    summary: "重点比较续保稳定性、免赔额和院外用药责任。医疗险通常按年交费，不能替代重疾险的一次性收入补偿。",
    columns: ["方案 A · 长期续保型", "方案 B · 综合医疗型", "方案 C · 基础普惠型"],
    rows: [
      ["保额", "200 万 / 年", "300 万 / 年", "100 万 / 年"],
      ["参考保费", "约 300–800 元/年", "约 500–1,200 元/年", "约 100–300 元/年"],
      ["等待期", "30 天", "30 天", "0–30 天"],
      ["健康告知", "中等，既往症需核实", "较细，含体检异常询问", "相对宽松，以当地规则为准"],
      ["免责重点", "非约定医院、既往症", "特定既往症、院外药目录", "报销比例和医院范围较有限"]
    ]
  },
  critical: {
    label: "重疾险",
    summary: "重点比较保障病种定义、赔付次数和少儿/女性特定疾病责任。重疾险通常长期交费，保额用于弥补康复期收入损失。",
    columns: ["方案 A · 纯保障型", "方案 B · 多次赔付型", "方案 C · 轻量定期型"],
    rows: [
      ["保额", "30–50 万", "30–50 万", "20–30 万"],
      ["参考保费", "约 2,000–6,000 元/年", "约 4,000–10,000 元/年", "约 1,000–3,000 元/年"],
      ["等待期", "90 天", "180 天", "90 天"],
      ["健康告知", "标准健康告知", "标准健康告知 + 部分体检项", "通常较简化，仍需如实告知"],
      ["免责重点", "既往症、未达定义标准", "分组与间隔期限制", "保障期限届满后不再承担责任"]
    ]
  },
  life: {
    label: "寿险",
    summary: "重点比较保障期限、免责条款和职业/地区限制。定期寿险主要覆盖家庭责任，不建议用储蓄型产品替代保障需求。",
    columns: ["方案 A · 定期 20 年", "方案 B · 定期至 60 岁", "方案 C · 定期 30 年"],
    rows: [
      ["保额", "50–150 万", "50–200 万", "50–150 万"],
      ["参考保费", "约 500–2,000 元/年", "约 800–3,000 元/年", "约 700–2,500 元/年"],
      ["等待期", "90–180 天", "90–180 天", "90–180 天"],
      ["健康告知", "标准告知，体检异常需核实", "标准告知，部分职业限制", "标准告知，地区规则有差异"],
      ["免责重点", "酒驾、违法犯罪等", "高危职业、战争等", "免责与等待期以条款为准"]
    ]
  },
  accident: {
    label: "意外险",
    summary: "重点比较意外医疗免赔额、职业类别和伤残赔付比例。意外险通常短期交费，适合作为低成本基础补充。",
    columns: ["方案 A · 综合意外型", "方案 B · 高危职业型", "方案 C · 老年友好型"],
    rows: [
      ["保额", "50–100 万", "50–100 万", "20–50 万"],
      ["参考保费", "约 100–500 元/年", "约 300–1,500 元/年", "约 300–1,000 元/年"],
      ["等待期", "通常无", "通常无", "通常无或 7 天"],
      ["健康告知", "通常较简化", "重点核验职业类别", "可能询问既往住院情况"],
      ["免责重点", "高危运动、酒驾等", "未如实告知职业", "既往症相关医疗费用"]
    ]
  }
};

const profile = Object.fromEntries(ALL_FIELDS.map((field) => [field, null]));
let currentField = "intent";
let isResponding = false;
let recommendations = null;
let selectedNeeds = [];

const elements = {
  workspace: document.querySelector(".workspace"),
  messages: document.getElementById("messages"),
  chatForm: document.getElementById("chatForm"),
  messageInput: document.getElementById("messageInput"),
  quickReplies: document.getElementById("quickReplies"),
  progressCount: document.getElementById("progressCount"),
  progressBar: document.getElementById("progressBar"),
  stepList: document.getElementById("stepList"),
  profileEmpty: document.getElementById("profileEmpty"),
  profileEmptyText: document.getElementById("profileEmptyText"),
  profileMode: document.getElementById("profileMode"),
  profileDetails: document.getElementById("profileDetails"),
  editProfileButton: document.getElementById("editProfileButton"),
  resetButton: document.getElementById("resetButton"),
  exportButton: document.getElementById("exportButton"),
  chatTitle: document.getElementById("chatTitle"),
  sessionStatus: document.getElementById("sessionStatus"),
  advicePanel: document.getElementById("advicePanel"),
  adviceTitle: document.getElementById("adviceTitle"),
  priorityBanner: document.getElementById("priorityBanner"),
  recommendationList: document.getElementById("recommendationList"),
  budgetLabel: document.getElementById("budgetLabel"),
  allocationBar: document.getElementById("allocationBar"),
  allocationLegend: document.getElementById("allocationLegend"),
  checklist: document.getElementById("checklist"),
  productTabs: document.getElementById("productTabs"),
  comparisonSummary: document.getElementById("comparisonSummary"),
  comparisonHead: document.getElementById("comparisonHead"),
  comparisonBody: document.getElementById("comparisonBody"),
  downloadAdviceButton: document.getElementById("downloadAdviceButton"),
  backToChatButton: document.getElementById("backToChatButton"),
  toast: document.getElementById("toast"),
  privacyModal: document.getElementById("privacyModal"),
  privacyButton: document.getElementById("privacyButton"),
  consentCheckbox: document.getElementById("consentCheckbox"),
  startConsultationButton: document.getElementById("startConsultationButton")
};

function activeFields() {
  return profile.intent === "家庭" ? FAMILY_FIELDS : INDIVIDUAL_FIELDS;
}

function questionFor(field) {
  const base = questionBank[field]?.question || "请补充这项信息。";
  if (profile.intent !== "家庭") return base;
  const familyQuestions = {
    familyMembers: questionBank.familyMembers.question,
    children: questionBank.children.question,
    parentsSupport: questionBank.parentsSupport.question,
    liabilities: "家里目前有哪些负债？请大致说明类型和剩余金额，比如房贷、车贷等。例如：“房贷约 120 万，还有 25 年”。没有负债直接说明即可。",
    incomeExpense: questionBank.incomeExpense.question,
    existing: "全家分别有哪些保障？请按成员分别说明社保（医保 / 养老）和商业险的类型、大致保额。例如：“本人：职工医保 + 重疾险 30 万；孩子：居民医保，暂无商业险”。",
    budget: "家庭每年计划投入多少预算？建议先保证基本生活和应急金，再在家庭年收入的 5%–10% 范围内安排保障型保费。",
    goals: "除了眼前保障，家庭还有哪些长期目标？这会影响预算分配和保障期限。",
    city: "全家主要常住城市是哪里？如果成员长期异地居住，也可以直接说明城市差异。医疗险医院范围和地方性保障可能与城市有关。",
    health: questionBank.health.question
  };
  return familyQuestions[field] || base;
}

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
  }
}

function timeLabel() {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());
}

function addMessage(role, text, options = {}) {
  const row = document.createElement("div");
  row.className = `message-row ${role}`;
  if (options.id) row.id = options.id;

  const avatar = role === "assistant"
    ? '<div class="message-avatar" aria-hidden="true"><i data-lucide="sparkles"></i></div>'
    : "";

  row.innerHTML = `${avatar}
    <div class="message-content">
      <p class="message-meta">${role === "assistant" ? "小安 · 保险规划助手" : "你"} &nbsp; ${timeLabel()}</p>
      <div class="message-bubble"></div>
    </div>`;

  row.querySelector(".message-bubble").textContent = text;
  elements.messages.appendChild(row);
  initIcons();
  scrollToLatest();
  return row;
}

function showTyping() {
  const row = document.createElement("div");
  row.className = "message-row assistant";
  row.id = "typingMessage";
  row.innerHTML = `
    <div class="message-avatar" aria-hidden="true"><i data-lucide="sparkles"></i></div>
    <div class="message-content">
      <p class="message-meta">小安正在整理</p>
      <div class="message-bubble typing-bubble" aria-label="正在输入"><span></span><span></span><span></span></div>
    </div>`;
  elements.messages.appendChild(row);
  initIcons();
  scrollToLatest();
}

function hideTyping() {
  document.getElementById("typingMessage")?.remove();
}

function scrollToLatest() {
  requestAnimationFrame(() => {
    elements.messages.scrollTop = elements.messages.scrollHeight;
  });
}

function renderQuickReplies(field) {
  elements.quickReplies.innerHTML = "";
  selectedNeeds = [];
  if (!field || !questionBank[field] || OPEN_FIELDS.has(field)) return;

  questionBank[field].replies.forEach((reply) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quick-reply";
    button.textContent = reply;
    if (field === "needs") {
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        if (reply === "还不确定，先梳理") {
          selectedNeeds = [reply];
        } else {
          selectedNeeds = selectedNeeds.filter((item) => item !== "还不确定，先梳理");
          selectedNeeds = selectedNeeds.includes(reply)
            ? selectedNeeds.filter((item) => item !== reply)
            : [...selectedNeeds, reply];
        }
        elements.quickReplies.querySelectorAll(".quick-reply[data-needs-option]").forEach((option) => {
          option.setAttribute("aria-pressed", String(selectedNeeds.includes(option.dataset.needsOption)));
          option.classList.toggle("selected", selectedNeeds.includes(option.dataset.needsOption));
        });
        confirmButton.disabled = selectedNeeds.length === 0;
      });
      button.dataset.needsOption = reply;
    } else {
      button.addEventListener("click", () => submitAnswer(reply));
    }
    elements.quickReplies.appendChild(button);
  });

  if (field === "needs") {
    const confirmButton = document.createElement("button");
    confirmButton.type = "button";
    confirmButton.className = "quick-reply quick-reply-confirm";
    confirmButton.textContent = "确认选择";
    confirmButton.disabled = true;
    confirmButton.addEventListener("click", () => submitAnswer(selectedNeeds.join("、")));
    elements.quickReplies.appendChild(confirmButton);
  }
}

function normalizeAnswer(field, rawText) {
  const text = rawText.trim();
  if (!text) return null;

  const selectedOption = questionBank[field]?.replies.includes(text);
  if (selectedOption) {
    if (field === "intent") {
      return {
        "给自己规划": "个体",
        "给全家规划": "家庭",
        "为个人配置": "个体",
        "为家庭配置": "家庭",
        "个体配置保险": "个体",
        "家庭配置保险": "家庭",
        "为自己规划": "个体",
        "给家庭补齐": "家庭",
        "给孩子投保": "个体",
        "给父母投保": "个体"
      }[text];
    }
    if (field === "needs") return text;
    return text;
  }

  if (OPEN_FIELDS.has(field)) return text.slice(0, 300);

  if (field === "needs" && /、|,|，/.test(text)) {
    const choices = text.split(/[、,，]/).map((item) => item.trim()).filter(Boolean);
    const validChoices = choices.filter((item) => questionBank.needs.replies.includes(item));
    if (validChoices.length) return [...new Set(validChoices)].join("、");
  }

  if (field === "intent") {
    if (/家庭|全家|夫妻|三代|家人/.test(text)) return "家庭";
    if (/给.{0,4}(父母|爸爸|妈妈|老人|长辈)|(父母|爸爸|妈妈|老人|长辈).{0,4}(投保|买保险|规划)/.test(text)) return "个体";
    if (/给.{0,4}(孩子|儿童|宝宝|小孩|子女)|(孩子|儿童|宝宝|小孩|子女).{0,4}(投保|买保险|规划)/.test(text)) return "个体";
    if (/我\s*\d{1,3}\s*岁|为自己|自己|本人|我想给自己/.test(text)) return "个体";
    if (/父母|爸爸|妈妈|老人|长辈|孩子|儿童|宝宝|小孩|子女|我/.test(text)) return "个体";
  }

  if (field === "familyMembers") {
    if (/夫妻二人|两口子|夫妻俩/.test(text)) return "夫妻二人";
    if (/夫妻.{0,4}(孩子|小孩|子女)|一家三口|三口之家/.test(text)) return "夫妻 + 子女";
    if (/三代|祖父母|爷爷|奶奶|外公|外婆/.test(text)) return "三代同堂";
    if (/单亲/.test(text)) return "单亲家庭";
  }

  if (field === "needs") {
    if (/医疗|住院|报销/.test(text)) return "大额医疗费用";
    if (/重疾|收入损失|康复/.test(text)) return "重疾后的收入损失";
    if (/意外/.test(text)) return "意外风险";
    if (/养老|长期照护|护理/.test(text)) return "养老与长期照护";
    if (/家庭责任|身故|寿险/.test(text)) return "家庭责任与身故保障";
  }

  if (field === "age") {
    const exactAge = text.match(/(\d{1,3})\s*岁/);
    if (exactAge) return `${Math.min(Number(exactAge[1]), 100)}岁`;
    if (/18\s*[-–到至]\s*30|18-30/.test(text)) return "18–30岁";
    if (/31\s*[-–到至]\s*40|31-40/.test(text)) return "31–40岁";
    if (/41\s*[-–到至]\s*50|41-50/.test(text)) return "41–50岁";
    if (/51\s*[-–到至]\s*60|51-60/.test(text)) return "51–60岁";
    if (/60.*以上/.test(text)) return "60岁以上";
  }

  if (field === "gender") {
    if (/暂不|不说明|不方便/.test(text)) return "暂不说明";
    if (/女|女性|女士/.test(text)) return "女";
    if (/男|男性|先生/.test(text)) return "男";
  }

  if (field === "city") {
    if (/暂不|不说明|不方便/.test(text)) return "暂不说明";
    if (/北上广深|一线/.test(text)) return "北上广深等一线";
    if (/新一线|省会/.test(text)) return "新一线 / 省会";
    if (/县城|乡镇|农村/.test(text)) return "县城 / 乡镇";
    if (/地级|市区|城市/.test(text)) return "地级市";
    if (text.length <= 16) return text;
  }

  if (field === "family") {
    if (/房贷|车贷|负债|贷款/.test(text)) return "有房贷 / 车贷等负债";
    if (/孩子|抚养|子女/.test(text)) return "有子女抚养责任";
    if (/赡养|父母|老人/.test(text)) return "有父母赡养责任";
    if (/已婚|结婚|夫妻/.test(text)) return "已婚，暂无子女";
    if (/单身|无负债|没有负债/.test(text)) return "单身，暂无负债";
  }

  if (field === "children") {
    if (/没有|暂无|无子女/.test(text)) return "暂无子女";
    if (/学龄前|幼儿园|幼儿/.test(text)) return "学龄前";
    if (/小学/.test(text)) return "小学阶段";
    if (/中学|初中|高中/.test(text)) return "中学阶段";
    if (/大学|成年/.test(text)) return "大学及以上";
  }

  if (field === "parentsSupport") {
    if (/没有|暂无/.test(text)) return "暂无赡养责任";
    if (/偶尔|不定期/.test(text)) return "偶尔提供支持";
    if (/长期|固定|每月/.test(text)) return "需要长期赡养";
    if (/医疗|年纪|年龄较大|高龄/.test(text)) return "父母年龄较大，医疗支出高";
  }

  if (field === "incomeExpense") {
    if (/稳定|结余|有余钱/.test(text)) return "收支稳定，有一定结余";
    if (/波动|不稳定|保守/.test(text)) return "收入波动，预算需保守";
    if (/房贷|车贷|贷款/.test(text)) return "房贷 / 车贷占比较高";
    if (/教育|赡养/.test(text)) return "教育 / 赡养支出占比较高";
    if (/不方便|不提供|不想说/.test(text)) return "暂不方便提供金额";
  }

  if (field === "goals") {
    if (/基础|补齐|兜底/.test(text)) return "先补齐基础保障";
    if (/教育金|教育费用|上学/.test(text)) return "准备子女教育金";
    if (/养老|照护|护理/.test(text)) return "规划养老与长期照护";
    if (/传承|遗产|财富/.test(text)) return "关注财富传承";
    if (/还在|不确定|没想好/.test(text)) return "还在梳理长期目标";
  }

  if (field === "occupation") {
    if (/高空|高危|矿|消防|建筑|危险/.test(text)) return "高空 / 高危作业";
    if (/办公室|白领|管理|行政|技术/.test(text)) return "办公室 / 管理类";
    if (/教育|老师|医护|医生|护士|服务|餐饮|零售/.test(text)) return "教育 / 医护 / 服务类";
    if (/制造|工厂|物流|运输|快递/.test(text)) return "制造 / 物流等";
    if (/自由|暂不|不说明/.test(text)) return "自由职业 / 暂不说明";
  }

  if (field === "existing") {
    if (/不清楚|不确定|不知道/.test(text)) return "不清楚，需先盘点";
    if (/没有|都没|无保障/.test(text)) return "目前暂无保障";
    if (/公司|单位|团险/.test(text)) return "医保 + 单位补充保障";
    if (/商业|重疾|医疗险|寿险|意外险/.test(text)) return "已有商业保险（保额不详）";
    if (/医保|社保/.test(text)) return "仅有基本医保";
  }

  if (field === "budget") {
    if (/再决定|先看|不确定|没想好/.test(text)) return "先梳理需求再定";
    const amount = text.match(/(?:预算|保费|每年|年交)[^\d]{0,6}(\d+(?:\.\d+)?)\s*(万|千)?\s*元?/) ||
      text.match(/(\d+(?:\.\d+)?)\s*(万|千|元)/);
    if (amount) {
      let value = Number(amount[1]);
      if (amount[2] === "万") value *= 10000;
      if (amount[2] === "千") value *= 1000;
      if (value <= 3000) return "3000 元以内";
      if (value <= 6000) return "3000–6000 元";
      if (value <= 10000) return "6000–10000 元";
      return "1–2 万元";
    }
  }

  if (field === "health") {
    if (/不方便|不想说|暂不/.test(text)) return "暂不方便说明";
    if (/住院|手术/.test(text)) return "近年住院或手术";
    if (/慢性|长期用药|高血压|糖尿病/.test(text)) return "有慢性病或长期用药";
    if (/整体健康|无异常|身体健康|健康.*正常/.test(text)) return "目前无明显异常";
    if (/小问题|结节|脂肪肝|异常/.test(text)) return "有常见小问题";
    if (/健康|正常|无异常|没有异常/.test(text)) return "目前无明显异常";
  }

  return text.length <= 28 ? text : `${text.slice(0, 28)}…`;
}

function inferExtraFields(text) {
  const mappings = ["intent", "age", "gender", "needs", "family", "occupation", "existing", "budget", "health"];
  mappings.forEach((field) => {
    if (profile[field]) return;
    const normalized = normalizeAnswer(field, text);
    const recognized = {
      intent: /父母|爸爸|妈妈|老人|长辈|孩子|儿童|宝宝|小孩|子女|家庭|全家|夫妻|自己|本人|我/,
      age: /\d{1,3}\s*岁|18\s*[-–到至]\s*30|31\s*[-–到至]\s*40|41\s*[-–到至]\s*50|51\s*[-–到至]\s*60|60.*以上/,
      gender: /男性|女性|男士|女士|\b男\b|\b女\b|暂不说明/,
      needs: /医疗|住院|重疾|收入损失|意外|养老|照护|身故|寿险/,
      city: /一线|新一线|省会|地级|县城|乡镇|城市/,
      family: /房贷|负债|贷款|孩子|抚养|子女|赡养|父母|老人|已婚|结婚|夫妻|单身/,
      occupation: /办公室|白领|管理|行政|技术|教育|老师|医护|医生|护士|服务|餐饮|零售|制造|工厂|物流|运输|快递|高空|高危|自由职业/,
      existing: /不清楚|不确定|不知道|没有|无保障|公司|单位|团险|商业|重疾|医疗险|寿险|意外险|医保|社保/,
      budget: /预算|保费|每年|年交|\d+(?:\.\d+)?\s*(万|千|元)|再决定|先看|没想好/,
      health: /不方便|不想说|住院|手术|慢性|长期用药|高血压|糖尿病|小问题|结节|脂肪肝|异常|健康|正常/
    };
    if (recognized[field].test(text) && normalized) profile[field] = normalized;
  });
}

function nextMissingField() {
  return activeFields().find((field) => !profile[field]) || null;
}

function submitAnswer(rawText) {
  const text = rawText.trim();
  if (!text || isResponding) return;

  addMessage("user", text);
  elements.messageInput.value = "";
  resizeTextarea();
  elements.quickReplies.innerHTML = "";

  const answer = normalizeAnswer(currentField, text);
  if (answer) profile[currentField] = answer;
  const isQuickReply = questionBank[currentField]?.replies.includes(text);
  if (!isQuickReply && !OPEN_FIELDS.has(currentField)) inferExtraFields(text);
  updateProgress();

  currentField = nextMissingField();
  updateProgress();
  isResponding = true;
  showTyping();

  window.setTimeout(async () => {
    hideTyping();
    if (currentField) {
      addMessage("assistant", transitionText(currentField) + questionFor(currentField));
      renderQuickReplies(currentField);
    } else {
      await completeConsultation();
    }
    isResponding = false;
  }, 560);
}

function transitionText(nextField) {
  const completed = activeFields().filter((field) => profile[field]).length;
  if (completed <= 1) return "收到。";
  if (nextField === "health") return "信息已经比较完整了。";
  return "好的，我记下了。";
}

function updateProgress() {
  const fields = activeFields();
  const completeCount = fields.filter((field) => profile[field]).length;
  elements.progressCount.textContent = `${completeCount} / ${fields.length}`;
  elements.progressBar.style.width = `${(completeCount / fields.length) * 100}%`;

  fields.forEach((field) => {
    const item = elements.stepList.querySelector(`[data-field="${field}"]`);
    if (item) elements.stepList.appendChild(item);
  });
  elements.stepList.querySelectorAll("li[data-field]").forEach((item) => {
    const field = item.dataset.field;
    const visible = fields.includes(field);
    item.hidden = !visible;
    if (!visible) return;
    const icon = item.querySelector("svg, i");
    item.classList.toggle("done", Boolean(profile[field]));
    item.classList.toggle("active", !profile[field] && field === currentField);
    if (icon) icon.outerHTML = `<i data-lucide="${profile[field] ? "circle-check" : "circle"}"></i>`;
  });

  renderProfile();
  initIcons();
}

function renderProfile() {
  const fields = activeFields();
  const entries = fields.filter((field) => profile[field]);
  const isFamilyPlan = profile.intent === "家庭";
  elements.profileMode.textContent = profile.intent ? (isFamilyPlan ? "家庭模式" : "个体模式") : "待选择";
  elements.profileEmptyText.textContent = profile.intent
    ? (isFamilyPlan ? "完成全家情况后，这里会按家庭成员整理保障需求。" : "完成回答后，这里会整理你的保障需求。")
    : "先选择个体或家庭配置，再开始整理保障需求。";
  elements.profileEmpty.hidden = entries.length > 0;
  elements.profileDetails.hidden = entries.length === 0;
  elements.editProfileButton.hidden = entries.length === 0;

  const labels = {
    intent: "保障对象",
    familyMembers: "家庭结构与成员",
    age: "年龄",
    gender: "性别",
    needs: "保障诉求",
    city: "常住城市",
    family: "家庭情况",
    occupation: "职业类别",
    liabilities: "是否有负债",
    existing: "已有保障与保额",
    budget: "收入与预算承受",
    children: "子女年龄与教育阶段",
    parentsSupport: "父母赡养情况",
    incomeExpense: "家庭收入与支出",
    goals: "长期目标",
    health: "健康状况"
  };

  elements.profileDetails.innerHTML = entries.map((field) => `
    <div class="profile-row${OPEN_FIELDS.has(field) ? " profile-row-family" : ""}">
      <dt>${labels[field]}</dt>
      <dd>${escapeHtml(profile[field])}</dd>
    </div>`).join("");
}

function ageNumber() {
  const match = profile.age?.match(/\d+/);
  if (!match) return 35;
  const first = Number(match[0]);
  if (profile.age.includes("以上")) return first + 5;
  const second = profile.age.match(/[–-](\d+)/);
  return second ? Math.round((first + Number(second[1])) / 2) : first;
}

function buildRecommendations() {
  const age = ageNumber();
  const isFamilyPlan = profile.intent === "家庭";
  const isParentPlan = !isFamilyPlan && age >= 56;
  const isChildPlan = !isFamilyPlan && age < 18;
  const hasResponsibilities = /孩子|赡养|房贷|负债|贷款/.test(`${profile.family || ""} ${profile.liabilities || ""}`) || isFamilyPlan;
  const healthComplex = /慢性病|住院|手术/.test(profile.health || "");
  const occupationRisk = /高危/.test(profile.occupation || "");

  let items;
  if (isFamilyPlan) {
    items = [
      { name: "家庭医疗险", icon: "stethoscope", color: "green", amount: "按成员配置", detail: "先按成员年龄与健康状况分别确认百万医疗、惠民保或防癌医疗的可投范围。", priority: "第一优先", share: 34 },
      { name: "家庭重疾保障", icon: "heart-pulse", color: "blue", amount: "核心成员 30–50万", detail: "优先保障家庭收入来源者，再为孩子和父母补齐适合各自年龄的额度。", priority: "核心保障", share: 30 },
      { name: "定期寿险", icon: "umbrella", color: "gold", amount: "覆盖家庭责任", detail: "按家庭支柱的负债、子女教育和赡养责任确定保额与期限。", priority: "支柱优先", share: 22 },
      { name: "意外险", icon: "accessibility", color: "coral", amount: "各成员适配", detail: "根据职业类别和年龄分别选择，关注意外医疗、伤残比例及高危职业限制。", priority: "全员补充", share: 14 }
    ];
  } else if (isParentPlan) {
    items = [
      { name: "意外险", icon: "accessibility", color: "green", amount: occupationRisk ? "50–100万" : "20–50万", detail: "优先关注意外医疗、骨折和住院津贴，留意年龄限制。", priority: "优先配置", share: 24 },
      { name: "防癌医疗险", icon: "heart-pulse", color: "blue", amount: "100万起", detail: healthComplex ? "健康异常时可重点比较防癌医疗、惠民保等可投保方案。" : "在百万医疗之外，作为核保更宽松的备选。", priority: "重点比较", share: 38 },
      { name: "百万医疗险", icon: "stethoscope", color: "gold", amount: "200万起", detail: "能通过健康告知时优先，重点看续保条件与外购药责任。", priority: "视健康配置", share: 30 },
      { name: "普惠保障", icon: "landmark", color: "coral", amount: "当地政策", detail: "确认基本医保不断缴，并了解所在地惠民保的参保窗口。", priority: "基础兜底", share: 8 }
    ];
  } else if (isChildPlan) {
    items = [
      { name: "百万医疗险", icon: "stethoscope", color: "green", amount: "200万起", detail: "覆盖大额住院费用，关注续保、免赔额和外购药。", priority: "第一优先", share: 35 },
      { name: "少儿重疾险", icon: "heart-pulse", color: "blue", amount: "50万起", detail: "优先保足额度，关注少儿特定疾病额外赔付。", priority: "核心保障", share: 42 },
      { name: "综合意外险", icon: "accessibility", color: "gold", amount: "20–50万", detail: "重点看意外医疗是否不限社保、免赔额是否合理。", priority: "必要补充", share: 15 },
      { name: "小额医疗险", icon: "bandage", color: "coral", amount: "1–2万", detail: "预算充足时补充低免赔门急诊或住院小额费用。", priority: "按需配置", share: 8 }
    ];
  } else {
    items = [
      { name: "百万医疗险", icon: "stethoscope", color: "green", amount: "200万起", detail: "覆盖大额住院支出，重点看保证续保与外购药责任。", priority: "第一优先", share: 28 },
      { name: "重疾险", icon: "heart-pulse", color: "blue", amount: age <= 40 ? "30–50万" : "20–30万", detail: "用于患病后的收入损失与康复开支，优先做足保额。", priority: "核心保障", share: 37 },
      { name: "意外险", icon: "accessibility", color: "gold", amount: occupationRisk ? "100万起" : "50–100万", detail: "覆盖意外身故伤残和意外医疗，职业类别需如实匹配。", priority: "必要补充", share: 12 },
      { name: "定期寿险", icon: "umbrella", color: "coral", amount: hasResponsibilities ? "50–150万" : "30–50万", detail: hasResponsibilities ? "保额至少覆盖负债与 5–10 年家庭责任。" : "家庭责任较轻，可低额度配置或暂缓。", priority: hasResponsibilities ? "家庭支柱必备" : "按责任配置", share: 23 }
    ];
  }

  const priority = healthComplex
    ? "先确认可投保范围，再比较责任。健康告知应逐项如实回答，不建议带病隐瞒投保。"
    : isFamilyPlan
      ? "家庭配置先做成员分层：优先保障家庭支柱，再补齐孩子与父母；不要用一张保单替代全家的不同需求。"
    : isParentPlan
      ? "父母投保先解决大额医疗和意外风险，不必为了“返还”牺牲保障额度。"
      : isChildPlan
        ? "孩子的保费应控制在家庭预算内，先保障、后储蓄，家长保障应优先做足。"
        : hasResponsibilities
          ? "家庭支柱优先补齐医疗、重疾和定期寿险，保额要覆盖负债及主要家庭责任。"
          : "先用较低预算覆盖大额医疗与收入损失风险，再按现金流逐步补齐。";

  return {
    items,
    priority,
    checklist: [
      "逐条阅读健康告知，不确定的诊疗记录先查询后再回答。",
      "比较免责条款、等待期、医院范围和续保条件，不只看保额。",
      "受益人、职业类别和常住地发生变化时，及时向保险公司确认。"
    ]
  };
}

async function requestAgentAdvice() {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profile: Object.fromEntries(activeFields().map((field) => [field, profile[field]])),
      mode: profile.intent === "家庭" ? "family" : "individual",
      message: "请根据这份已完成的保障需求画像，给出下一步规划建议，并引用可用知识来源。"
    })
  });
  if (!response.ok) throw new Error(`Agent API ${response.status}`);
  return response.json();
}

async function completeConsultation() {
  recommendations = buildRecommendations();
  const summary = profile.intent === "家庭"
    ? `家庭结构：${profile.familyMembers}；子女阶段：${profile.children}；长期目标：${profile.goals}`
    : `个体情况：${profile.age}、${profile.gender}；保障诉求：${profile.needs}`;
  addMessage("assistant", `谢谢你的耐心。我已根据${summary}整理了一份保障建议。\n\n这是一份通用规划，不替代持牌保险顾问的个案服务，也不构成具体产品承保或理赔承诺。`);
  try {
    const agentResult = await requestAgentAdvice();
    const sourceText = agentResult.sources?.length
      ? `\n\n参考来源：${agentResult.sources.map((source) => `[${source.title}]`).join("、")}`
      : "\n\n当前知识库暂无可引用资料。";
    addMessage("assistant", `Agent 补充建议（${agentResult.mode === "mock" ? "开发模拟" : "正式 API"}）：\n${agentResult.reply}${sourceText}`);
  } catch (error) {
    // PLACEHOLDER_AGENT_FALLBACK: API 尚未配置或后端不可用时，保留前端规则建议，正式环境应监控并处理该错误。
    console.warn("Agent API unavailable; using local recommendation.", error);
  }
  renderQuickReplies(null);
  renderAdvice();
  elements.chatTitle.textContent = profile.intent === "家庭" ? "全家的需求已梳理完成" : "你的需求已梳理完成";
  elements.sessionStatus.innerHTML = '<i data-lucide="circle-check"></i> 方案已生成';
  elements.exportButton.disabled = false;
  elements.messageInput.placeholder = "可以继续补充或重新咨询…";
  elements.messageInput.disabled = true;
  document.getElementById("sendButton").disabled = true;
  initIcons();

  window.setTimeout(() => {
    elements.advicePanel.hidden = false;
    elements.workspace.classList.add("has-advice");
    initIcons();
  }, 380);
}

function renderAdvice() {
  elements.adviceTitle.textContent = profile.intent === "家庭" ? "家庭保障建议" : "个人保障建议";
  elements.priorityBanner.innerHTML = `<i data-lucide="lightbulb"></i><span>${escapeHtml(recommendations.priority)}</span>`;
  elements.recommendationList.innerHTML = recommendations.items.map((item) => `
    <article class="recommendation-item">
      <span class="coverage-icon ${item.color}" aria-hidden="true"><i data-lucide="${item.icon}"></i></span>
      <div class="recommendation-copy">
        <h4>${item.name}</h4>
        <p>${item.detail}</p>
      </div>
      <div class="coverage-amount">${item.amount}<span class="priority-tag">${item.priority}</span></div>
    </article>`).join("");

  elements.budgetLabel.textContent = profile.budget;
  elements.allocationBar.innerHTML = recommendations.items.map((item) => `
    <span class="allocation-segment" style="width:${item.share}%" title="${item.name} ${item.share}%"></span>`).join("");
  elements.allocationLegend.innerHTML = recommendations.items.map((item) => `
    <div class="legend-item"><span class="legend-dot"></span><span>${item.name}</span><strong>${item.share}%</strong></div>`).join("");
  elements.checklist.innerHTML = recommendations.checklist.map((item) => `
    <li><i data-lucide="check-circle-2"></i><span>${item}</span></li>`).join("");
  initIcons();
  renderProductComparison("medical");
}

function renderProductComparison(type) {
  const comparison = productComparisons[type] || productComparisons.medical;
  elements.productTabs.innerHTML = Object.entries(productComparisons).map(([key, item]) => `
    <button class="product-tab" type="button" role="tab" aria-selected="${key === type}" data-product-type="${key}">${item.label}</button>`).join("");
  elements.productTabs.querySelectorAll(".product-tab").forEach((button) => {
    button.addEventListener("click", () => renderProductComparison(button.dataset.productType));
  });

  elements.comparisonSummary.textContent = comparison.summary;
  elements.comparisonHead.innerHTML = `<tr><th scope="col">比较维度</th>${comparison.columns.map((column) => `<th scope="col">${column}</th>`).join("")}</tr>`;
  elements.comparisonBody.innerHTML = comparison.rows.map((row) => `
    <tr><th scope="row">${row[0]}</th>${row.slice(1).map((cell, index) => `<td class="${index === 2 ? "attention" : ""}">${cell}</td>`).join("")}</tr>`).join("");
  initIcons();
}

function exportAdvice() {
  if (!recommendations) return;
  const labels = {
    intent: "保障对象",
    familyMembers: "家庭结构与成员",
    age: "年龄",
    gender: "性别",
    needs: "保障诉求",
    city: "常住城市",
    family: "家庭情况",
    occupation: "职业类别",
    liabilities: "是否有负债",
    existing: "已有保障与保额",
    budget: "收入与预算承受",
    children: "子女年龄与教育阶段",
    parentsSupport: "父母赡养情况",
    incomeExpense: "家庭收入与支出",
    goals: "长期目标",
    health: "健康状况"
  };
  const profileText = activeFields().map((field) => `${labels[field]}：${profile[field]}`).join("\n");
  const itemText = recommendations.items.map((item, index) =>
    `${index + 1}. ${item.name}（${item.priority}）\n   建议额度：${item.amount}\n   关注：${item.detail}`
  ).join("\n\n");
  const checkText = recommendations.checklist.map((item, index) => `${index + 1}. ${item}`).join("\n");
  const content = `安心保 · 保险规划建议\n生成日期：${new Intl.DateTimeFormat("zh-CN", { dateStyle: "long" }).format(new Date())}\n\n【需求画像】\n${profileText}\n\n【核心提示】\n${recommendations.priority}\n\n【建议配置顺序】\n${itemText}\n\n【候选方案对比】\n${Object.values(productComparisons).map((comparison) => `${comparison.label}：${comparison.summary}`).join("\n")}\n\n【投保前核对】\n${checkText}\n\n免责声明：本建议基于通用保障逻辑，仅供需求梳理参考，不构成具体保险产品推荐、承保承诺或理赔承诺。候选对比为演示数据，正式选择时请以保险公司最新官方条款、费率及核保结论为准。`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `安心保-保险规划建议-${new Date().toISOString().slice(0, 10)}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast("咨询摘要已导出");
}

function resetConsultation() {
  ALL_FIELDS.forEach((field) => { profile[field] = null; });
  currentField = "intent";
  isResponding = false;
  recommendations = null;
  elements.messages.innerHTML = "";
  elements.advicePanel.hidden = true;
  elements.workspace.classList.remove("has-advice");
  elements.exportButton.disabled = true;
  elements.messageInput.disabled = false;
  document.getElementById("sendButton").disabled = false;
  elements.messageInput.placeholder = "说说你的情况，或点击上方选项…";
  elements.chatTitle.textContent = "先聊聊你的保障需求";
  elements.sessionStatus.innerHTML = '<i data-lucide="messages-square"></i> 咨询中';
  updateProgress();
  addMessage("assistant", questionFor("intent"));
  renderQuickReplies("intent");
  initIcons();
}

function editProfile() {
  const target = activeFields().find((field) => profile[field]) || "intent";
  profile[target] = null;
  currentField = target;
  recommendations = null;
  elements.advicePanel.hidden = true;
  elements.workspace.classList.remove("has-advice");
  elements.exportButton.disabled = true;
  elements.messageInput.disabled = false;
  document.getElementById("sendButton").disabled = false;
  addMessage("assistant", `可以，我们从“${document.querySelector(`[data-field="${target}"] span`).textContent}”重新确认。${questionFor(target)}`);
  renderQuickReplies(target);
  updateProgress();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.remove("show"), 1800);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function resizeTextarea() {
  elements.messageInput.style.height = "auto";
  elements.messageInput.style.height = `${Math.min(elements.messageInput.scrollHeight, 112)}px`;
}

elements.chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitAnswer(elements.messageInput.value);
});

elements.messageInput.addEventListener("input", resizeTextarea);
elements.messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    submitAnswer(elements.messageInput.value);
  }
});

elements.resetButton.addEventListener("click", resetConsultation);
elements.exportButton.addEventListener("click", exportAdvice);
elements.downloadAdviceButton.addEventListener("click", exportAdvice);
elements.editProfileButton.addEventListener("click", editProfile);
elements.backToChatButton.addEventListener("click", () => {
  elements.advicePanel.hidden = true;
  elements.workspace.classList.remove("has-advice");
});

elements.privacyButton.addEventListener("click", () => {
  elements.privacyModal.hidden = false;
});

elements.consentCheckbox.addEventListener("change", () => {
  elements.startConsultationButton.disabled = !elements.consentCheckbox.checked;
});

elements.startConsultationButton.addEventListener("click", () => {
  if (!elements.consentCheckbox.checked) return;
  elements.privacyModal.hidden = true;
});

document.addEventListener("DOMContentLoaded", () => {
  initIcons();
  resetConsultation();
  elements.privacyModal.hidden = false;
});
