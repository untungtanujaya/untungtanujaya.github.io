export const locales = ['en', 'zh'] as const;
export type Locale = typeof locales[number];
export const href = (locale: Locale, path = '') => `/${locale}/${path ? path.replace(/^\/+|\/+$/g, '') + '/' : ''}`;
export const tr = (locale: Locale, en: string, zh: string) => locale === 'zh' ? zh : en;
export const date = (value: Date | string, locale: Locale) => new Date(value).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
export const ui = {
  en: { home: 'Overview', work: 'Work', research: 'Research', writing: 'Writing', cv: 'CV', tools: 'Tools', search: 'Search', menu: 'Menu', skip: 'Skip to content', theme: 'Appearance', system: 'System', light: 'Light', dark: 'Dark', contact: 'Get in touch', allWork: 'All work', allWriting: 'All writing', read: 'Read article', details: 'View project', print: 'Print / Save PDF', publications: 'Publications', email: 'Email', experience: 'Experience', education: 'Education', skills: 'Skills', fullDetails: 'Full responsibilities & contributions', original: 'English original', back: 'Back', min: 'min read', feed: 'RSS feed' },
  zh: { home: '概览', work: '工程实践', research: '研究', writing: '技术文章', cv: '简历', tools: '工具', search: '搜索', menu: '菜单', skip: '跳转到主要内容', theme: '外观', system: '跟随系统', light: '浅色', dark: '深色', contact: '联系我', allWork: '全部项目', allWriting: '全部文章', read: '阅读文章', details: '查看项目', print: '打印 / 保存 PDF', publications: '学术发表', email: '电子邮件', experience: '工作经历', education: '教育背景', skills: '技能', fullDetails: '完整职责与贡献', original: '英文原文', back: '返回', min: '分钟阅读', feed: 'RSS 订阅' },
} as const;
