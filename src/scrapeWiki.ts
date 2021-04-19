

import fs from 'fs';
import puppeteer, { Browser, Page } from 'puppeteer';
import { RawHTML } from './scrape';

const smiteWikiURL = 'https://smite.gamepedia.com/';
const smiteWikiItemPage = "https://smite.gamepedia.com/Items/";

export default async function scrapeWiki() {
    const browser = await puppeteer.launch();
    const items = await scrapeItems(browser);
    const gods = await scrapeGods(browser);
    browser.close();
    return { items: items, gods: gods};
}

async function scrapeGods(browser: Browser) {
    const page = await browser.newPage();
    await page.goto(smiteWikiURL);
    await page.waitForSelector("div.fpbox.smite-window span a");
    const urls = await page.$$eval("div.fpbox.smite-window span a", links => links.map(el => el.getAttribute('href')));
    page.close();
    const tableHTML: Promise<RawHTML>[] = urls.map(async (url) => {
        const fullURL = smiteWikiURL + url
        const html = readStatTable(browser.newPage(), fullURL);
        return {
            name: url,
            type: 'god',
            html: await html
        } as RawHTML;
    })
    return Promise.all(tableHTML);
};

async function scrapeItems(browser: Browser) {
    const page = await browser.newPage();
    await page.goto(smiteWikiItemPage);
    await page.waitForSelector("div.items-overview-grid");
    const partialUrls = await page.$$eval('div.items-overview-grid div > a', links => links.map(el => el.getAttribute('href')));
    const urls = partialUrls.map(tail => smiteWikiURL + tail);
    const tableHTML: Promise<RawHTML>[] = urls.map(async (url) => {
        const fullURL = smiteWikiURL + url;
        const item = readStatTable(browser.newPage(), fullURL);
        return {
            name: url,
            type: 'item',
            html: await item
        } as RawHTML;
    });
    return Promise.all(tableHTML);
}

async function readStatTable(pagePromise: Promise<Page>, url: string): Promise<string> {
    const page = await pagePromise;
    await page.goto(url);
    await page.waitForSelector('table.infobox');
    const tableHTML = await page.$eval('table.infobox', el => el.textContent);
    await page.waitForSelector('table.tabber');
    const ancestorHTML = await page.$eval('table.tabber', el => el.textContent);
    page.close();
    return tableHTML.concat(ancestorHTML);
}