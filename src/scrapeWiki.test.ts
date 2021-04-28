import puppeteer, { Browser, Page } from 'puppeteer';
import { itemListPage, itemListPageSelector, itemTableSelectors, readListPageURLs, readStatTable,  } from './scrapeWiki';

let browser: Browser;
let page: Page;

beforeAll(async () => {
    browser = await puppeteer.launch();
})

beforeEach(async () => {
    page = await browser.newPage();
})

afterEach(async () => {
    page.close();
});

afterAll(async () => {
    browser.close();
});

test('readListPageURLs',async () => {
    const urls = await readListPageURLs(page, itemListPage, itemListPageSelector);
    expect(urls.length).toBeGreaterThan(0);
    expect(urls).not.toContain(null);
    //console.log(urls);
});

test('readStatTable', async () => {
    const url = new URL('https://smite.fandom.com/wiki/Emperor%27s_Armor');
    const html = readStatTable(page, url, itemTableSelectors);
    expect(html).not.toBeFalsy();
});