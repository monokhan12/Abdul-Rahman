// After a deploy, tell IndexNow search engines (Bing, Yandex, Seznam, Naver...) which URLs exist,
// so new and changed pages are recrawled within hours. Bing's index also feeds ChatGPT search and Copilot.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const content = JSON.parse(readFileSync(join(root, 'src/site/content.json'), 'utf8'));
const site = new URL(content.site.url);
const key = content.site.indexNowKey;
const sitemap = readFileSync(join(root, 'dist/sitemap.xml'), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: site.host, key, keyLocation: `${site.origin}/${key}.txt`, urlList }),
});
console.log(`IndexNow: submitted ${urlList.length} URLs, HTTP ${res.status}`);
