

import fs from 'fs';
import puppeteer, { Browser, Page } from 'puppeteer';
import { pipeline } from 'stream';
import { RawHTML } from '.';

export const smiteWikiURL = 'https://smite.fandom.com';
export const godListPage = 'https://smite.fandom.com';
export const itemListPage = "https://smite.fandom.com/Items";
export const godListPageSelector = 'div.fpbox.smite-window span a';
export const itemListPageSelector = 'div.items-overview-grid span a';
type PageSelector = {
    selector: string,
    required: boolean
};
export const itemTableSelectors: PageSelector[] = [
    {selector: 'table.infobox', required: true}, 
    {selector: 'table.wikitable', required: true}, 
    {selector: 'table.tabber', required: false}
];
export const godTableSelectors: PageSelector[] = [
    {selector: 'table.infobox', required: true}
];

export default async function scrapeWiki() {
    const browser = await puppeteer.launch();
    const {html: items, errors: itemErrors} = await scrapeItems(browser);
    const {html: gods, errors: godErrors} = await scrapeGods(browser);
    browser.close();
    return { items: items, gods: gods};
}

async function scrapeItems(browser: Browser) {
    return await scrape(
        browser,
        'item',
        { url: itemListPage, linkSelector: itemListPageSelector },
        itemTableSelectors
    );
}
async function scrapeGods(browser: Browser) {
    return await scrape(
        browser, 
        'god',
        { url: godListPage, linkSelector: godListPageSelector },
        godTableSelectors
    );
}

async function scrape(
    browser: Browser, 
    type: 'item'|'god', 
    listPage: {url: string, linkSelector: string}, 
    selectors: PageSelector[]
    ): Promise<{html: RawHTML[],errors: Error[]}> 
{
    const urls = await readListPageURLs(await browser.newPage(), listPage.url, listPage.linkSelector);
    const tableHTML: RawHTML[] = [];
    const errors: Error[] = [];
    for (const url of urls) {
        console.log(`reading url: ${url}`);
        const page = await browser.newPage();
        const name = urlToName(url);
        const result = await readStatTable(page, url, selectors)
                        .catch(err => {return err;});
        if (result instanceof Error) {
            console.log(`${url} failed to be read, reason: ${result}`);
            errors.push(result);
        } else {
            console.log(`${url} was read successfully\n`)
            tableHTML.push({
                name: name,
                type: type,
                html: result
            })
        }
    }

    return {html: tableHTML, errors: errors};
}

export async function readListPageURLs(page: Page, listPage: string, selector: string) {
    await page.goto(listPage);
    await page.waitForSelector(selector);
    const urls = await page.$$eval(selector, links => links.map(el => el.getAttribute('href')));
    page.close();
    const fullURLs = urls.map(url => new URL(smiteWikiURL + url));
    return fullURLs;
}


export async function readStatTable(page: Page, url: URL, selectors: PageSelector[]): Promise<string|Error> {
    await page.goto(url.toString());
    let html = "";
    for (const {selector, required} of selectors) {
        const selectorHTML = await page.$eval(selector, el => el.innerHTML)
            .catch(reason => {
                if(required) {return reason;}
                else {return "";}
            });
        html = html.concat(selectorHTML);
    }
    await page.close(); 
    return html; 
}

function urlToName(name: URL): string {
    const match = /.+\/(.*)$/.exec(name.toString());
    if(!match) throw new Error(`URL: ${name} could not be converted to a simple name`);
    const trimmedName = match[1]; //capture group from regex
    const nameWithoutHTMLApostrophe = trimmedName.replace(/%27s/g, '\'');
    const nameWithSpaces = nameWithoutHTMLApostrophe.replace('_', ' ');
    return nameWithSpaces;
}