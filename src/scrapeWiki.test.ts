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
    if(!page.isClosed())  page.close();
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
    return readStatTable(page, url, itemTableSelectors)
        .then( data => {
            expect(data).toBeTruthy();
            expect(data).toContain('Emperor\'s Armor');
            return data;
        });
}); 