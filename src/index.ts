

import fs from 'fs';
import puppeteer, { Browser, Page } from 'puppeteer';
import readOneGod from './readOneGod';

const SmiteWikiURL = 'https://smite.gamepedia.com';

(async function scrape() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(SmiteWikiURL);
    await page.waitForSelector("div.fpbox.smite-window span a");
    let urls = await page.$$eval("div.fpbox.smite-window span a", links => links.map(el => el.getAttribute('href')));
    urls = urls.map(url => SmiteWikiURL + url)
    console.log('urls: ', urls)
    // urls = urls.slice(0,1)
    const gods = {};
    for (const url of urls) {
        const god = await readOneGod(browser.newPage(), url);
        gods[god.name] = god;
    }
    // const godPromises = urls.map(url => readOneGod(browser.newPage(), url));
    // const gods = await Promise.all(godPromises)
    browser.close()
    
    const json = JSON.stringify(gods, null, 4);
    fs.writeFileSync('gods.json', json);
})();