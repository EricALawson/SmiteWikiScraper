

import fs from 'fs';
import puppeteer, { Browser, Page } from 'puppeteer';
import { RawHTML } from '.';

const smiteWikiURL = 'https://smite.fandom.com/';
const smiteWikiItemPage = "https://smite.fandom.com/Items";

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
    const godScrapes = await Promise.allSettled(tableHTML);
    const successfulScrapes: RawHTML[] = [];
    const failedScrapes: Error[] = [];
    godScrapes.forEach((res, index, arr) => {
        if (res.status === 'fulfilled') {
            successfulScrapes.push(arr.values[index]);
        } else {
            failedScrapes.push(arr.values[index]);
        }
    });

    printFailedScrapes(failedScrapes);

    if(successfulScrapes.length > 0) {
        return successfulScrapes;
    } else {
        throw new Error('No pages could be scraped.');
    }
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
    const godScrapes = await Promise.allSettled(tableHTML);
    const successfulScrapes: RawHTML[] = [];
    const failedScrapes: Error[] = [];
    godScrapes.forEach((res, index, arr) => {
        if (res.status === 'fulfilled') {
            successfulScrapes.push(arr.values[index]);
        } else {
            failedScrapes.push(arr.values[index]);
        }
    });

    printFailedScrapes(failedScrapes);

    if (successfulScrapes.length > 0) {
        return successfulScrapes;
    } else {
        throw new Error('No pages could be scraped.');
    };
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

function printFailedScrapes(scrapes: Error[]) {
    console.log(`${scrapes.length} pages failed to load, or did not contain expected CSS selectors`);
    scrapes.forEach(value => {
        console.log(value);
    });
}