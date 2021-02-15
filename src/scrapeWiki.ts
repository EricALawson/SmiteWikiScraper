

import fs from 'fs';
import puppeteer, { Browser, Page } from 'puppeteer';
import readOneGod from './readOneGod';

const smiteWikiURL = 'https://smite.gamepedia.com';
const smiteWikiItemPage = "https://smite.gamepedia.com/Items";

export default async function scrapeWiki() {
    const browser = await puppeteer.launch();
    const gods = await scrapeGods(browser);
    const items = await scrapeItems(browser);
    browser.close();
}

async function scrapeGods(browser: Browser) {
    const page = await browser.newPage();
    await page.goto(smiteWikiURL);
    await page.waitForSelector("div.fpbox.smite-window span a");
    let urls = await page.$$eval("div.fpbox.smite-window span a", links => links.map(el => el.getAttribute('href')));
    page.close();
    urls = urls.map(url => smiteWikiURL + url);
    const tableHTML: Promise<string>[] = [];
    for (const url of urls) {
        const god = readStatTable(browser.newPage(), url);
        tableHTML.push(god);
    }
    return Promise.all(tableHTML);
};

async function scrapeItems(browser: Browser) {
    const page = await browser.newPage();
    await page.goto(smiteWikiItemPage);
    await page.waitForSelector("div.items-overview-grid");
    const partialUrls = await page.$$eval('div.items-overview-grid div > a', links => links.map(el => el.getAttribute('href')));
    const urls = partialUrls.map(tail => smiteWikiURL + tail);
    const tableHTML: Promise<string>[] = [];
    for (const url of urls) {
        const item = readStatTable(browser.newPage(), url);
        tableHTML.push(item);
    }
    return Promise.all(tableHTML);
}

async function readStatTable(pagePromise: Promise<Page>, url: string): Promise<string> {
    const page = await pagePromise;
    await page.goto(url);
    await page.waitForSelector('table.infobox');
    const tableHTML = await page.$eval('table.infobox', el => el.textContent);
    page.close();
    return tableHTML;
}