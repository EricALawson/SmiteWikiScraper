import { fstat } from 'fs';
import mongodb from 'mongodb';
import fs from 'fs';

//Webscraper Main Entrypoint



type RawHTML = {
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