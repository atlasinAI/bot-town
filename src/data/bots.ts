export type BuildingId =
  | 'finance'
  | 'sales'
  | 'marketing'
  | 'office'
  | 'engineering'
  | 'life';

export type BotTemplate = {
  id: string;
  name: string;
  description: string;
  building: BuildingId;
  /** Palette index for the NPC sprite (0-7). */
  palette: number;
};

export const IMPORT_BASE = 'grokbot://app/v1/bot-template?id=';

export function importUrl(id: string): string {
  return `${IMPORT_BASE}${encodeURIComponent(id)}`;
}

/**
 * Real Grok Bot templates, assigned to one building each.
 * Descriptions: SearchBotTemplates was not available in this run,
 * so each line is a neutral Chinese one-liner derived from the official name only.
 */
export const BOTS: BotTemplate[] = [
  // 会计楼
  { id: 's50bb9361d891bd788a23', name: 'Expense Manager', description: '帮你整理和跟踪日常开支。', building: 'finance', palette: 0 },
  { id: 's072bae9387b9fc03cac8', name: 'Invoice Coordinator', description: '协助整理和跟进发票相关事务。', building: 'finance', palette: 1 },
  { id: 'sb36667ce9e1fdc00cfe7', name: 'Subscription Cleaner', description: '帮你清理不再需要的订阅项目。', building: 'finance', palette: 2 },
  { id: 'q4u8YgzGQqCAOUZcg0Lgt', name: 'Credit Card Max', description: '协助管理信用卡相关事务。', building: 'finance', palette: 3 },
  { id: 's3489a5b1cfc8330c880a', name: 'Find unused subscriptions', description: '找出很少使用或闲置的订阅。', building: 'finance', palette: 4 },
  { id: 's962955812182739b4dd2', name: 'Watch subscription prices', description: '盯着订阅价格变化，避免错过调整。', building: 'finance', palette: 5 },
  { id: 's5ddf31a380c44dbc2649', name: 'Deal Watcher', description: '盯紧交易与优惠动态。', building: 'finance', palette: 6 },

  // 销售楼
  { id: 's8ff03023f140bab479f7', name: 'Sales Outbound', description: '协助开展对外销售与外联工作。', building: 'sales', palette: 0 },
  { id: 'yZ5MFQFdl32vHt6fcIJAc', name: 'Sales Call Coach', description: '为销售通话提供教练式建议。', building: 'sales', palette: 1 },
  { id: 'sb434ef300dea2b88aa58', name: 'Deal Desk Coordinator', description: '协助协调交易谈判与成交安排。', building: 'sales', palette: 2 },
  { id: 's98af8b9dcde521e1a9fa', name: 'Pipeline Analyst', description: '分析销售管道进展与结构。', building: 'sales', palette: 3 },
  { id: 'sd4333bc337078a9752ac', name: 'Account Manager', description: '协助跟进和维护客户账户。', building: 'sales', palette: 4 },
  { id: 'sa7d7f82d0068c2367a17', name: 'Account Research Specialist', description: '研究客户与账户背景信息。', building: 'sales', palette: 5 },
  { id: 's4c86a54f188668096400', name: 'Renewal Desk Operator', description: '协助处理续约相关事务。', building: 'sales', palette: 6 },
  { id: 's8b59eb62f90871ac5c36', name: 'Prospecting Plan Builder', description: '帮你制定潜在客户开拓计划。', building: 'sales', palette: 7 },
  { id: 'i03IaF768-ielyzegoGye', name: 'Outbound Prospecting', description: '协助进行对外潜在客户开拓。', building: 'sales', palette: 0 },
  { id: 's162b4ed38d6cf1d56731', name: 'CRM Operations Manager', description: '协助管理 CRM 日常运营。', building: 'sales', palette: 1 },

  // 营销楼
  { id: '0IhyZWxwbf2cFmsmroZQL', name: 'SEO & AEO Desk', description: '处理搜索引擎与回答引擎优化事务。', building: 'marketing', palette: 0 },
  { id: 'sb6d579c33f7a32d0e7af', name: 'SEO / AEO Auditor', description: '审核搜索与回答引擎优化情况。', building: 'marketing', palette: 1 },
  { id: 's634cb1edf26493e86be2', name: 'Social Media Manager', description: '协助规划和管理社交媒体内容。', building: 'marketing', palette: 2 },
  { id: 's5d2839123b973b4480f9', name: 'Newsletter Writer', description: '协助撰写电子邮件通讯。', building: 'marketing', palette: 3 },
  { id: 's59facc90a46a8b4f59da', name: 'Paid Media', description: '协助处理付费投放相关事务。', building: 'marketing', palette: 4 },
  { id: 's45471f3a8af234c13047', name: 'Paid Media Creative Strategist', description: '为付费投放制定创意策略。', building: 'marketing', palette: 5 },
  { id: 's4d10d16bdbe2391aa753', name: 'LinkedIn Campaign Manager', description: '协助管理 LinkedIn 营销活动。', building: 'marketing', palette: 6 },
  { id: 'se318a72a31fad75c277e', name: 'Marketing Calendar Owner', description: '协助维护营销日历与排期。', building: 'marketing', palette: 7 },
  { id: 'BFiw9Y7BzTQ-3jFBAro1X', name: 'AI Search Visibility', description: '关注内容在 AI 搜索中的可见度。', building: 'marketing', palette: 0 },
  { id: 'YwxIbVEWqXN-HYCxiMCoB', name: 'Copy Humanizer', description: '把文案改得更自然、更像人写的。', building: 'marketing', palette: 1 },

  // 办公楼
  { id: 'sc0a0ec3ce9c675824106', name: 'Chief of Staff', description: '协助统筹日常事务与优先级。', building: 'office', palette: 0 },
  { id: '_DnP777DCicZpaTtm9_h5', name: 'Executive Assistant', description: '提供行政与日程方面的协助。', building: 'office', palette: 1 },
  { id: 's4f048c7b7da9e010c2c3', name: 'Inbox Manager', description: '帮你整理和跟进收件箱。', building: 'office', palette: 2 },
  { id: 's634fd63ee875502d8df9', name: 'Calendar Coordinator', description: '协助协调日历与日程安排。', building: 'office', palette: 3 },
  { id: 's445a0c9a2ca4bea7729e', name: 'Meeting Prep Buddy', description: '帮你准备会议所需材料。', building: 'office', palette: 4 },
  { id: 'sb94d44175e650dbb703e', name: 'Daily Briefing Writer', description: '协助撰写每日简报。', building: 'office', palette: 5 },
  { id: 'sde2c69536d2f2564fe1b', name: 'Status Report Writer', description: '协助撰写进度与状态报告。', building: 'office', palette: 6 },
  { id: 's2a289081613e5e361c79', name: 'Deck Updater', description: '协助更新演示文稿内容。', building: 'office', palette: 7 },
  { id: 's25997c2d0308b4e76024', name: 'Presentation Designer', description: '协助设计演示文稿的版式与呈现。', building: 'office', palette: 0 },
  { id: 'AZKaQOsjrAa51Nb4xvTur', name: 'Projects Manager', description: '协助跟进项目进度与事项。', building: 'office', palette: 1 },
  { id: 'scfddc8ad204a669484d0', name: 'Hiring Screener', description: '协助筛选招聘候选人。', building: 'office', palette: 2 },
  { id: 'KDahOjiDbbAvxqx9KaGcq', name: 'Recruiting Coordinator', description: '协助协调招聘流程与安排。', building: 'office', palette: 3 },

  // 工程楼
  { id: 's2d62197e15bd11a1bd63', name: 'Bug Reproduction', description: '协助复现和整理软件缺陷。', building: 'engineering', palette: 0 },
  { id: 's2e4acfb8db3cc0669a1b', name: 'Prototype Builder', description: '协助搭建产品原型。', building: 'engineering', palette: 1 },
  { id: 's20b2c65ebeebb7362fa7', name: 'Cloud Agent Orchestrator', description: '协助编排和调度云端代理。', building: 'engineering', palette: 2 },
  { id: 's1025e1ebe0b11f048bd4', name: 'Docs Auditor', description: '审核文档的完整性与一致性。', building: 'engineering', palette: 3 },
  { id: 's7aaf6431077930df326f', name: 'Ticket Triage Specialist', description: '协助分拣和归类工单。', building: 'engineering', palette: 4 },
  { id: 's2cfcbb8a38b8e22b7d18', name: 'Playtest Operator', description: '协助组织和执行试玩测试。', building: 'engineering', palette: 5 },
  { id: 's3c76c85a840b32b8fed8', name: 'Personal Site Builder', description: '协助搭建个人网站。', building: 'engineering', palette: 6 },
  { id: "SxqbG1NT5qEw7ggmHqQu_", name: "Lingxi's Engineer Bot", description: '工程事务助手，处理开发相关工作。', building: 'engineering', palette: 7 },

  // 生活楼
  { id: 'sc693906bdeded166b7ba', name: 'Travel Coordinator', description: '协助安排行程与出行事务。', building: 'life', palette: 0 },
  { id: 'se48b1c0ce0321a5fc6c6', name: 'Gift Concierge', description: '协助挑选和安排礼物。', building: 'life', palette: 1 },
  { id: 'sd6f165284d7fd2f25e56', name: 'Apartment Scout', description: '协助寻找合适的公寓房源。', building: 'life', palette: 2 },
  { id: 's5eaf00b412a289c27e0b', name: 'Order Concierge', description: '协助跟进购物订单与配送。', building: 'life', palette: 3 },
  { id: 'pwQ612YrX3R0eACnIMlom', name: 'Haggle Bot', description: '协助在购物时进行议价。', building: 'life', palette: 4 },
  { id: 'sb05a64dbd67d4323dcbb', name: "Try it, don't pay for it", description: '帮你先试用，避免不必要的付费。', building: 'life', palette: 5 },
];

export function botsIn(building: BuildingId): BotTemplate[] {
  return BOTS.filter((b) => b.building === building);
}

export function getBot(id: string): BotTemplate | undefined {
  return BOTS.find((b) => b.id === id);
}

export function countByBuilding(): Record<BuildingId, number> {
  const out: Record<BuildingId, number> = {
    finance: 0,
    sales: 0,
    marketing: 0,
    office: 0,
    engineering: 0,
    life: 0,
  };
  for (const b of BOTS) out[b.building] += 1;
  return out;
}
