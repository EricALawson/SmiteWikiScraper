
import fs from 'fs';
import path from 'path';
import { closeBrowser, readListPages, scrapePage } from './scrapeWiki';
import parseGod from './parseGod';
import axios, { AxiosResponse } from 'axios';
import parseItem from './parseItem';
import { ParseResult, ScrapeResult, ScrapeTarget } from './ScrapeTarget';
import { once } from 'events';
import { batchProcess } from './batchProcess';
import { writeToDatabase } from './writeToDatabase';
import wtf from 'wtfnode';

//Webscraper Main Entrypoint
(async function() {
    try {
        const targets = await readListPages();
        await batchProcess(targets, 5, processOneURL);
    } finally {
        closeBrowser();
    }
})();

async function processOneURL(target: ScrapeTarget): Promise<ParseResult|Error> {
    let scrapeResult: null | Error | ScrapeResult = null;
    let parseResult: null | Error | ParseResult = null;
    let downloadErr: null | Error = null;
    let dbWriteErr: null | Error = null;
    try {
        scrapeResult = await scrapePage(target);
        parseResult = parsePage(scrapeResult);
        parseResult = await downloadImage(parseResult);
        parseResult = await writeToDatabase(parseResult);
        return parseResult;
    } catch (err) {
        //Expected Errors are returned, not thrown.
        //If an error is thrown, then append as much context as possible.
        if (scrapeResult) {
            err.message += '\nScrape Result:\n' + JSON.stringify(scrapeResult);
        }
        if (parseResult) {
            err.message += '\nParse Result:\n' + JSON.stringify(parseResult);
        }
        if (downloadErr) {
            err.message += '\nDownload Error:\n' + JSON.stringify(downloadErr);
        }
        if (dbWriteErr) {
            err.message += '\nDatabase Write Error:\n' + JSON.stringify(dbWriteErr);
        }
        return err;
    }
}

function parsePage(scrape: ScrapeResult | Error): ParseResult | Error {
    if (scrape instanceof Error) return scrape;
    let result;
    try {
        switch (scrape.type) {
            case 'item':
                result = parseItem(scrape.html);
                break;
            case 'god':
                result = parseGod(scrape.html);
                break;
        }
    } catch (err) {
        return err;
    }
    return Object.assign(scrape, {parseResult: result});
}

async function downloadImage(parseResult: ParseResult | Error): Promise<ParseResult | Error> {
    if (parseResult instanceof Error) return parseResult;
    const imagesDir = './images';
    const godsDir = path.join(imagesDir, 'gods');
    const itemsDir = path.join(imagesDir, 'items');
    await makeDirectory(imagesDir);
    await makeDirectory(godsDir);
    await makeDirectory(itemsDir);
    
    let dir: string;
    switch(parseResult.type) {
        case 'item': dir = itemsDir;
        break;
        case 'god': dir = godsDir;
        break;
    }

    const response: AxiosResponse<fs.ReadStream> = await axios(parseResult.parseResult.image, { responseType: 'stream' });
    const stream = response.data.pipe(fs.createWriteStream(path.join(dir, parseResult.parseResult.name + '.jpg')));
    await once(stream, 'finish');  
    stream.close();
    stream.removeAllListeners();

    return parseResult;
}

function isNodeError(err: any): err is NodeJS.ErrnoException {
    return err.code && err.code === 'EEXIST';
} 

async function makeDirectory(dirName: string): Promise<void> {
    return fs.promises.mkdir(dirName)
        .catch(err => {
            if (isNodeError(err)) return;
            throw err;
        });
}
