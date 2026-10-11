// Captures the ARK storefront for the ad research: scroll screenshots, scroll videos,
// product images, theme visuals and font files. Runs on GitHub Actions (open network).
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const SHOP = 'https://stspxg-ty.myshopify.com';
const THEME = '188325658714'; // "ARK —"
const OUT = path.resolve('ark-film/research/out');
const HANDLES = [
  'arcteryx-alpha-sv-jacket', 'arcteryx-beta-sl-jacket', 'arcteryx-macai-jacket',
  'arcteryx-thorium-hoody', 'arcteryx-down-vest', 'arcteryx-grid-fleece-half-zip', 'arcteryx-bird-head-toque',
];
const ONLY_IMAGES = !process.env.STORE_PASSWORD && process.env.IMAGES_ONLY === '1';
const PAGES = ONLY_IMAGES ? [] : [
  ['home', '/'],
  ['collection', '/collections/all'],
  ...HANDLES.map((h) => [h, `/products/${h}`]),
];
const VIEWPORTS = [
  ['mobile-1080x1920', { width: 1080, height: 1920 }],
  ['desktop-1440x900', { width: 1440, height: 900 }],
];

const withTheme = (p) => `${SHOP}${p}${p.includes('?') ? '&' : '?'}preview_theme_id=${THEME}`;
const save = async (rel, data) => {
  const file = path.join(OUT, rel);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, data);
};
const log = [];

const browser = await chromium.launch();

// 1. Pages: screenshots while scrolling + one scroll video per viewport.
for (const [vpName, viewport] of VIEWPORTS) {
  for (const [name, url] of PAGES) {
    const isHome = name === 'home';
    const context = await browser.newContext({
      viewport,
      recordVideo: isHome || name === HANDLES[0] ? { dir: path.join(OUT, 'video-tmp'), size: viewport } : undefined,
    });
    const page = await context.newPage();
    if (process.env.STORE_PASSWORD) {
      try {
        await page.goto(`${SHOP}/password`, { waitUntil: 'domcontentloaded', timeout: 60000 });
        // The field sits in a closed dialog behind "Enter using password": submit its form directly.
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }),
          page.evaluate((pw) => {
            const input = document.querySelector('input[type="password"]');
            input.value = pw;
            input.form.submit();
          }, process.env.STORE_PASSWORD),
        ]);
      } catch (e) { log.push(`password ${name}: ${e.message}`); }
    }
    const fonts = new Set();
    page.on('response', async (res) => {
      const u = res.url();
      if (/\.(woff2?|ttf|otf)(\?|$)/.test(u) && !fonts.has(u)) {
        fonts.add(u);
        try {
          await save(`fonts/${path.basename(new URL(u).pathname)}`, await res.body());
        } catch {}
      }
    });
    try {
      await page.goto(withTheme(url), { waitUntil: 'networkidle', timeout: 60000 });
    } catch (e) {
      log.push(`goto ${name} ${vpName}: ${e.message}`);
    }
    await page.waitForTimeout(3500); // let the intro play
    const dir = `screens/${vpName}/${name}`;
    await page.screenshot({ path: path.join(OUT, dir, '000.png') });

    // Scroll with the wheel so whichever element scrolls (window or .page-wrapper) moves.
    await page.mouse.move(viewport.width / 2, viewport.height / 2);
    const total = await page.evaluate(() => {
      const w = document.querySelector('.page-wrapper');
      const el = w && /(auto|scroll)/.test(getComputedStyle(w).overflowY) ? w : document.scrollingElement;
      return el.scrollHeight;
    });
    const step = Math.round(viewport.height * 0.5);
    let shot = 1;
    for (let y = 0; y < total + viewport.height && shot < 80; y += step) {
      // Smooth: 10 small wheel ticks per half screen, like a person scrolling.
      for (let i = 0; i < 10; i++) {
        await page.mouse.wheel(0, step / 10);
        await page.waitForTimeout(isHome ? 60 : 25);
      }
      await page.waitForTimeout(isHome ? 900 : 300);
      await page.screenshot({ path: path.join(OUT, dir, `${String(shot++).padStart(3, '0')}.png`) });
    }

    if (isHome) {
      // Page facts: text, computed fonts and colours of key elements, image URLs.
      const facts = await page.evaluate(() => {
        const pick = (sel) =>
          [...document.querySelectorAll(sel)].slice(0, 6).map((el) => {
            const cs = getComputedStyle(el);
            return {
              sel, text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 160),
              font: cs.fontFamily, weight: cs.fontWeight, size: cs.fontSize, lh: cs.lineHeight,
              ls: cs.letterSpacing, tt: cs.textTransform, color: cs.color, bg: cs.backgroundColor,
            };
          });
        return {
          title: document.title,
          styles: ['.ark-summit__mark', '.ark-summit__title', '.ark-summit__text', '.button', '.ark-chapter__word',
            '.ark-chapter__heading', '.ark-frost__letters', '.ark-display', 'h2', 'h3', 'p', 'a.ark-link'].flatMap(pick),
          images: [...new Set([...document.querySelectorAll('img')].map((i) => i.currentSrc || i.src))],
          text: document.body.innerText.slice(0, 20000),
        };
      });
      await save(`facts-${vpName}.json`, JSON.stringify(facts, null, 2));
      for (const src of facts.images) {
        if (!/ark-.*\.webp/.test(src)) continue;
        try {
          const r = await fetch(src.startsWith('//') ? `https:${src}` : src);
          await save(`theme-visuals/${path.basename(new URL(src, SHOP).pathname)}`, Buffer.from(await r.arrayBuffer()));
        } catch (e) { log.push(`visual ${src}: ${e.message}`); }
      }

      // Hover samples: first product card and first text link.
      for (const [label, sel] of [['piece', '.ark-piece'], ['link', '.ark-link'], ['button', '.ark-summit__button']]) {
        const el = page.locator(sel).first();
        if (await el.count()) {
          try {
            await el.scrollIntoViewIfNeeded();
            await el.hover();
            await page.waitForTimeout(600);
            await el.screenshot({ path: path.join(OUT, 'hover', vpName, `${label}.png`) });
          } catch (e) { log.push(`hover ${label}: ${e.message}`); }
        }
      }
    }

    const video = page.video();
    await context.close();
    if (video) {
      await fs.mkdir(path.join(OUT, 'video'), { recursive: true });
      await video.saveAs(path.join(OUT, 'video', `${name}-${vpName}.webm`));
      await video.delete();
    }
  }
}
await browser.close();

// 2. Product images, from the Admin API URL list (the CDN is public even behind the password).
const list = (await fs.readFile(path.resolve('ark-film/research/product-images.txt'), 'utf8')).trim().split('\n');
for (const [i, line] of list.entries()) {
  const [handle, url] = line.split(' ');
  try {
    const name = path.basename(new URL(url).pathname);
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    await save(`products/${handle}/${String(i + 1).padStart(2, '0')}-${name}`, Buffer.from(await r.arrayBuffer()));
  } catch (e) { log.push(`image ${url}: ${e.message}`); }
}

await fs.rm(path.join(OUT, 'video-tmp'), { recursive: true, force: true });
await save('log.txt', log.join('\n') || 'ok');
console.log(log.join('\n') || 'ok');
