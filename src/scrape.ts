import { fstat } from 'fs';
import mongodb from 'mongodb';
import fs from 'fs';
import scrapeWiki from './scrapeWiki';
import parseGod from './parseGod';
import axios, { AxiosResponse } from 'axios';
import God from 'smite-timeline/src/data_objects/God';
import Item from 'smite-timeline/src/data_objects/Item';
import parseItem from './parseItem';

//Webscraper Main Entrypoint
(async function() {
    const {items: itemsRaw, gods: godsRaw} = await scrapeWiki();
    writeRawHtmlToDatabase(godsRaw, itemsRaw);
    const parsedGods = godsRaw.map(godRaw => parseGod(godRaw.html));
    const parsedItems = itemsRaw.map(itemRaw => parseItem(itemRaw.html));
    downloadImages(parsedGods, parsedItems);
})();

export type RawHTML = {
    name: string,
    type: "god" | "item",
    html: string
}
function writeRawHtmlToDatabase(gods: RawHTML[], items: RawHTML[]) {
    const login = fs.readFileSync('./dblogin.txt').toString().split('\n');
    const [name, pass, database] = login;
    const MongoClient = mongodb.MongoClient;
    const uri = "mongodb+srv://${name}:${pass}@smite-timeline-0.n3o8x.mongodb.net/${database}?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect((err: Error) => {
        const collection = client.db("smite-timeline").collection("wiki-scraper-raw");
        console.log(collection);
        // perform actions on the collection object
        client.close();
    });
}

async function downloadImages(gods: God[], items: Item[]) {
    gods.map(async god => {
        const response: AxiosResponse<fs.ReadStream> = await axios(god.image, {responseType:'stream'});
        response.data.pipe(fs.createWriteStream('./images/god-cards/' + god.name));
    });
    items.map(async item => {
        const response: AxiosResponse<fs.ReadStream> = await axios(item.image, { responseType: 'stream' });
        const stream = response.data.pipe(fs.createWriteStream('./images/items/' + item.name));
        stream
            .on('finish', () => {return;})
            .on('error', err => {throw err});
    });
}