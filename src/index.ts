
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { readListPages, scrapePage } from './scrapeWiki';
import parseGod from './parseGod';
import axios, { AxiosResponse } from 'axios';
import parseItem from './parseItem';
import { isParseResult, ParseResult, ScrapeResult, ScrapeTarget } from './ScrapeTarget';
import { once } from 'events';
import { batchProcess } from './batchProcess';

//Webscraper Main Entrypoint
(async function() {
    const targets = await readListPages();
    await batchProcess(targets, 5, processOneURL);
})();



async function processOneURL(target: ScrapeTarget): Promise<ParseResult|Error> {
 const scrapeResult = await scrapePage(target);
 let parseResult = parsePage(scrapeResult);
 parseResult = await downloadImage(parseResult); 
 parseResult = await writeToDatabase(parseResult);
 return parseResult
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

async function writeToDatabase(parseResult: ParseResult | Error): Promise<ParseResult | Error> {
    if (parseResult instanceof Error) return parseResult;
    const login = fs.readFileSync('./dblogin.txt').toString().split('\n');
    const [name, pass, database] = login;
    const uri = "mongodb+srv://${name}:${pass}@smite-timeline-0.n3o8x.mongodb.net/${database}?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        client.connect((err: Error) => {
            const collection = client.db("smite-timeline").collection("wiki-scraper-raw");
            //console.log(collection);
            //TODO: perform actions on the collection object
            client.close();
        });
    } catch (err) {
        return err;
    } finally {
        client.close();
    }
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
