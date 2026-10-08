import { getCollection } from 'astro:content';
import { locales,href,type Locale } from '../../i18n/ui';
import { articleMeta } from '../../i18n/content';
import { updates } from '../../data/research';
export function getStaticPaths(){return locales.map(locale=>({params:{locale}}));}
const escape=(s:string)=>s.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
export async function GET({params,site}:{params:{locale:string};site:URL}){
 const l=params.locale as Locale;
 const articles=await getCollection('articles');const pubs=await getCollection('publications',({data})=>!data.draft);
 const items=[...articles.map(a=>({title:l==='zh'?articleMeta[a.id]?.title||a.data.title:a.data.title,description:l==='zh'?articleMeta[a.id]?.summary||a.data.summary:a.data.summary,date:a.data.pubDate,url:href(l,`writing/${a.data.slug||a.id}`)})),...pubs.map(p=>({title:p.data.title[l],description:p.data.abstract[l],date:p.data.date,url:href(l,`research/publications/${p.id}`)})),...updates.map(u=>({title:u.title[l],description:u.body[l],date:new Date(u.date),url:href(l,'research')+'#updates'}))].sort((a,b)=>b.date.valueOf()-a.date.valueOf());
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Untung Tanujaya · ${l==='en'?'Writing &amp; Research':'文章与研究'}</title><link>${site}${l}/</link><description>Engineering notes and research updates</description><language>${l==='zh'?'zh-CN':'en'}</language>${items.map(i=>`<item><title>${escape(i.title)}</title><link>${escape(new URL(i.url,site).href)}</link><guid>${escape(new URL(i.url,site).href)}</guid><pubDate>${i.date.toUTCString()}</pubDate><description>${escape(i.description)}</description></item>`).join('')}</channel></rss>`,{headers:{'Content-Type':'application/rss+xml; charset=utf-8'}});
}
