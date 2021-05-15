import { fstat } from 'fs';
import mongodb from 'mongodb';
import fs from 'fs';
import path from 'path';
import {mkdir} from 'fs/promises'
import scrapeWiki from './scrapeWiki';
import parseGod from './parseGod';
import axios, { AxiosResponse } from 'axios';
import parseItem from './parseItem';
import God from '@smite-timeline/smite-game-objects/lib/God';
import Item from '@smite-timeline/smite-game-objects/lib/Item';

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
        //console.log(collection);
        // perform actions on the collection object
        client.close();
    });
}

export async function downloadImages(gods: God[], items: Item[]) {
    const imagesDir = './images';
    const godsDir = path.join(imagesDir, 'gods');
    const itemsDir = path.join(imagesDir, 'items');
    await mkdir(imagesDir)
        .catch((err: NodeJS.ErrnoException) => {
            if (err.code === 'EEXIST') {
                return;
            } else {
                throw err;
            }
        });
    await mkdir(godsDir)
        .catch((err: NodeJS.ErrnoException) => {
            if (err.code === 'EEXIST') {
                return;
            } else {
                throw err;
            }
        });
    await mkdir(itemsDir)
        .catch((err: NodeJS.ErrnoException) => {
            if (err.code === 'EEXIST') {
                return;
            } else {
                throw err;
            }
        });

    gods.forEach(async god => {
        const response: AxiosResponse<fs.ReadStream> = await axios(god.image, {responseType:'stream'});
        const stream = response.data.pipe(fs.createWriteStream(path.join(godsDir, god.name + '.jpg')));
        stream
            .on('finish', () => { return; })
            .on('error', err => { throw err })
    });
    items.forEach(async item => {
        const response: AxiosResponse<fs.ReadStream> = await axios(item.image, { responseType: 'stream' });
        const stream = response.data.pipe(fs.createWriteStream(path.join(itemsDir, item.name + '.jpg')));
        stream
            .on('finish', () => {return;})
            .on('error', err => {throw err})
    });
    return;
}