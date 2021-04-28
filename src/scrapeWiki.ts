

import fs from 'fs';
import puppeteer, { Browser, Page } from 'puppeteer';
import { RawHTML } from '.';

export const smiteWikiURL = 'https://smite.fandom.com';
export const godListPage = 'https://smite.fandom.com';
export const itemListPage = "https://smite.fandom.com/Items";
export const godListPageSelector = 'div.fpbox.smite-window span a';
export const itemListPageSelector = 'div.items-overview-grid span a';
export const itemTableSelectors = ['table.infobox', 'table.tabber'];
export const godTableSelectors = ['table.infobox'];

export default async function scrapeWiki() {
    const browser = await puppeteer.launch();
    const items = await scrapeItems(browser);
    const gods = await scrapeGods(browser);
    browser.close();
    return { items: items, gods: gods};
}

async function scrapeItems(browser: Browser) {
    const urls = await readListPageURLs(await browser.newPage(), itemListPage, itemListPageSelector);
    const tableHTML: Promise<RawHTML>[] = urls.map(async (url) => {
        console.log(url);
        const item = readStatTable(await browser.newPage(), url, itemTableSelectors);
        return {
            name: urlToName(url),
            type: 'item',
            html: await item
        } as RawHTML;
    });
    const godScrapes = await Promise.allSettled(tableHTML);
    return handleFailures(godScrapes);
}

async function scrapeGods(browser: Browser) {
    const urls = await readListPageURLs(await browser.newPage(), godListPage, godListPageSelector);
    const tableHTML: Promise<RawHTML>[] = urls.map(async (url) => {
        const html = readStatTable(await browser.newPage(), url, godTableSelectors);
        return {
            name: urlToName(url),
            type: 'god',
            html: await html
        } as RawHTML;
    })
    const godScrapes = await Promise.allSettled(tableHTML);
    return handleFailures(godScrapes);
};

export async function readListPageURLs(page: Page, listPage: string, selector: string) {
    await page.goto(listPage);
    await page.waitForSelector(selector);
    const urls = await page.$$eval(selector, links => links.map(el => el.getAttribute('href')));
    page.close();
    const fullURLs = urls.map(url => new URL(smiteWikiURL + url));
    return fullURLs;
}


export async function readStatTable(page: Page, url: URL, selectors: string[]): Promise<string> {
    await page.goto(url.toString());
    selectors.forEach(async (selector) => await page.waitForSelector(selector));
    const htmlPromises: Promise<string>[] = selectors.map(async (selector) => page.$eval(selector, el => el.textContent));
    const html = await Promise.all(htmlPromises);
    page.close();
    return html.join();
}

function printFailedScrapes(scrapes: Error[]) {
    console.log(`${scrapes.length} pages failed to load, or did not contain expected CSS selectors`);
    scrapes.forEach(value => {
        console.log(value);
    });
}

function urlToName(name: URL): string {
    const match = /.+\/?(.*)$/.exec(name.toString());
    if(!match) throw new Error(`URL: ${name} could not be converted to a simple name`);
    const trimmedName = match[1]; //capture group from regex
    const nameWithoutHTMLApostrophe = trimmedName.replaceAll('%27s', '\'');
    const nameWithSpaces = nameWithoutHTMLApostrophe.replace('_', ' ');
    return nameWithSpaces;
}

function handleFailures(scrapeResults: PromiseSettledResult<RawHTML>[]): RawHTML[] {
    const successfulScrapes: RawHTML[] = [];
    const failedScrapes: Error[] = [];
    scrapeResults.forEach((res) => {
        if (res.status === 'fulfilled') {
            successfulScrapes.push(res.value);
        } else {
            failedScrapes.push(res.reason);
        }
    });

    printFailedScrapes(failedScrapes);

    if (successfulScrapes.length > 0) {
        return successfulScrapes;
    } else {
        throw new Error('No pages could be scraped.');
    }
}