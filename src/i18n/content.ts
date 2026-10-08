import experiences from '../data/experiences.json';
import educations from '../data/educations.json';
import projects from '../data/projects.json';
import skills from '../data/skills.json';
import type { Locale } from './ui';
const projectZh = [
 ['定制 OCR 服务与 RPA 引擎','AI 文档处理','构建基于 AI 的 OCR 微服务，将旧有基础设施迁移至 Google Gemini AI；使用 Python 并行工作池开发定制 RPA 引擎，自动提取多页运输发票，在复杂物流场景中保持较高的数据保真度。'],
 ['Pilot 系统：自主智能体与 PR 自动化','AI 辅助开发体验与工作流基础设施','在 Hostinger VPS 上设计并部署内部工程自动化工作流，结合 Claude Code CLI 与 Asana Webhook，以高推理强度配置支持自主开发流程。利用 Asana 触发器与并行工作进程编排任务，并构建能够解析提交信息、运行四层测试、执行 AI 代码审查及自动创建 Pull Request 的 CI/CD 流水线。'],
 ['CEISA 与 INSW 海关网关','物流后端服务','使用 Go/Gin 构建并发合规处理流水线，执行 PEB/PIB 报关申报；集成国家海关及电子原产地证书（INSW）API，配合具备韧性的扇出缓存与回退调度机制。'],
 ['关键业务 Web 应用','Tokopedia Plus 核心服务','使用 Golang、gRPC、GraphQL、NSQ 和 Redis 开发维护 Tokopedia Plus 付费订阅平台的高性能微服务，优化数据库查询缓存、落地页与订阅逻辑 API，并在高流量下保持服务间通信的可靠性。'],
];
const roleZh = [
 {title:'软件工程师',location:'雅加达西区',start_date:'2025年5月',end_date:'2026年6月',summary:'主导并发海关报表系统与 RPA 引擎开发，使用 Go 和 Python 将数据摄取速度提升至原来的 10 倍。',description:[
 '为物流与海关合规平台开发维护 Go 后端及 Python 微服务。在 13 个月任期内发起 367 个 Pull Request，267 次合并投入生产，在三个核心代码库中贡献超过 86,000 行稳定运行的生产代码。',
 '设计基于 goroutine 的并发工作池与 channel 扇出模式，并行获取批量文档，显著降低高流量租户查询的列表接口延迟，使生产负载下的关键读取流水线保持稳定。',
 '构建多策略 OCR 回退流水线（Gemini AI → PNG 栅格化 → PyMuPDF），结合 10 线程并行工作池提取发票与装箱单，使曾发生静默丢页的边界场景中，多页企业文档摄取完整度接近 100%。',
 '在自管 VPS 上构建 Linux 云基础设施，部署四个由 systemd 管理、通过 Restart=always 自愈的守护进程；编写幂等恢复包装器，并使用 GOMAXPROCS 限制、MemoryMax、zram zstd 交换及防止循环内测试的四层内存策略，在不增加基础设施成本的情况下消除 OOM 事件。',
 '构建并部署生产级自动化流水线，通过实时幂等 Webhook 路由将 Asana 与 Anthropic Claude API 连接，实现从需求规格到 Pull Request 的端到端自动化，同时强制 conventional commits、四层测试门禁以及上线前人工审查。',
 '优化 PostgreSQL repository 和各服务的 SQLite 隔离模式，修复高流量列表接口的多租户数据泄漏作用域缺陷，加固跨租户边界以满足企业合规审计要求。',
 '集成国家海关申报、电子原产地证验证及汇率同步等政府级外部 API，利用重试、回退及抓取机制提高上游服务中断时的可用性。',
 '实现符合 ISO 27001 原则的令牌生命周期管理、Microsoft Azure AD 单点登录，以及 Ghostscript / pdfcpu / qpdf 三层 PDF 修复流水线，降低重要监管文档上传失败率。',
 '在三个代码库中建立包含构建、单元、集成、回归及端到端检查的四层 CI 测试流程，编写 Go、Next.js standalone 和 Python 服务的多阶段 Dockerfile；以 staging 为分界建立分支模型与 SOP，要求人工提升到生产环境，禁止自动部署至客户生产环境。',
 '推动 Claude Code CLI 与 Claude API 等 AI 编程助手融入工程工作流，通过自动代码审查、提交格式约束与可复现的生产 Docker 镜像，在加快交付的同时保持工程质量。']},
 {title:'软件工程师',location:'雅加达南区',start_date:'2022年3月',end_date:'2024年8月',summary:'为 Tokopedia Plus 开发维护关键微服务与缓存系统，提升高流量下的订阅服务稳定性。',description:[
 '使用 Golang、gRPC、GraphQL、NSQ 和 Redis 开发维护 Tokopedia Plus 后端服务，保障应用性能与可靠性。','优化服务间通信并实施 Redis 缓存，加快 API 响应速度，提高资源使用效率。','使用 Datadog 实时监控系统并追踪日志，简化故障排查，减少停机。','通过严格的同事代码审查维护代码质量，并帮助初级工程师解决技术障碍。','在公司收购阶段，通过技术规划与跨职能协作支持后端运营和系统稳定。','与项目经理和利益相关者密切沟通进度及技术预期，确保功能按时交付。']},
 {title:'软件开发专员',location:'中爪哇省苏科哈佐',start_date:'2021年3月',end_date:'2022年3月',summary:'从零设计并实现内部 Web 应用，支持用户验收测试及业务流程自动化。',description:[
 '开发维护多种内部 Web 应用，与跨职能团队合作，将业务需求转化为可用软件。','根据管理层要求从零构建专用 Web 应用，负责端到端开发并满足利益相关者需求。','在用户验收测试阶段主动发现问题、修复技术缺陷，确保部署前系统稳定。','按时交付负责的应用模块，持续满足代码质量标准并改善运营工作流。']},
 {title:'软件工程实习生',location:'雅加达中区',start_date:'2019年5月',end_date:'2019年8月',summary:'在敏捷团队中协助资深工程师开发调试响应式界面组件。',description:[
 '在资深工程师指导下参与前端功能与 UI 组件开发。','协助调试并实现前端改进，提升应用响应性与用户体验。','参与敏捷团队例会及技术讨论，学习行业实践、版本控制流程与编码规范。','与工程团队协作完成日常任务，准确高效地处理分配的工单。']},
];
const educationZh = [
 {degree:'软件工程理学硕士（课程与研究相结合）',institution:'哈尔滨工业大学',location:'中国哈尔滨',completion_date:'2026年9月至今',description:'研究生学习涵盖高级软件架构、分布式系统及研究方法，将课程学习与应用研究相结合。'},
 {degree:'信息学 / 计算机科学理学学士',institution:'万隆理工学院',location:'印度尼西亚西爪哇省万隆',completion_date:'2020年10月',description:'担任年度 IT 活动住宿、餐饮及交通组负责人，展现组织与协作能力。'},
];
export const getProjects = (l: Locale) => projects.map((p,i) => l === 'zh' ? {...p,title:projectZh[i][0],subtitle:projectZh[i][1],description:projectZh[i][2],originalTitle:p.title} : {...p,originalTitle:p.title});
export const getExperiences = (l: Locale) => experiences.map((p,i) => l === 'zh' ? {...p,...roleZh[i]} : p);
export const getEducations = (l: Locale) => educations.map((p,i) => l === 'zh' ? {...p,...educationZh[i]} : p);
export const getSkills = (l: Locale) => l === 'en' ? skills : [
 {...skills[0],category:'编程语言与工具'},
 {...skills[1],category:'核心能力',items:['后端架构','API 开发与优化','微服务','并发编程','分布式系统','系统可观测性','数据库设计与优化','AI / LLM 集成']},
 {...skills[2],category:'其他优势',items:['跨职能沟通','快速解决问题','持续技术学习','DevOps 与 CI/CD','Docker 容器化','Linux 系统管理（systemd）']},
];
export const articleMeta: Record<string,{title:string;summary:string;enSummary:string}> = {
 'optimizing-go-backends':{title:'加速 Go 批量 API：去重与有界工作池',summary:'通过去重和限制并发，减少 I/O 密集型接口的不必要等待。',enSummary:'Deduplicate work and bound concurrency to spend less time waiting on downstream services.'},
 'shared-mutable-state-singleton':{title:'只在高负载下出现的 Bug：单例中的共享可变状态',summary:'识别请求之间泄漏的共享状态，让并发行为可预测。',enSummary:'Find the shared state that leaks between requests and makes concurrency unpredictable.'},
 'rate-limiting-redis-go':{title:'使用 Redis 为 Go 登录接口限流',summary:'固定窗口、首次设置 TTL，以及缓存失效时的放行策略。',enSummary:'Fixed windows, setting TTL only once, and making failure behavior explicit.'},
 'retrying-flaky-apis-go':{title:'在 Go 中重试不稳定 API：不只看状态码',summary:'结合响应体、退避、随机抖动和幂等性设计可靠重试。',enSummary:'Look beyond status codes to design retries with backoff, jitter, and idempotency.'},
 'idempotent-reprocessing-scoped-deletes':{title:'幂等重处理：不破坏已有工作的定向删除',summary:'只重算新增输入影响的结果，保留已有结果与人工修改。',enSummary:'Reprocess only the new inputs while preserving existing results and manual corrections.'},
 'rate-limit-semaphore-sliding-window':{title:'Python 限流：信号量与滑动窗口',summary:'分别控制并发数与时间窗口内的请求数，遵守服务商限额。',enSummary:'Control concurrency and requests over time as two separate limits.'},
 'testing-silently-dropped-fields':{title:'测试遗漏的更新：捕捉 Go 中静默丢失的字段',summary:'通过契约测试与纯函数，发现更新请求中被忽略的字段。',enSummary:'Use contract tests and pure functions to catch fields an update silently drops.'},
};
