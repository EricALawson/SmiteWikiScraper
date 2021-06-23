import { Collection, MongoClient } from 'mongodb';
import fs from 'fs';
import { ParseResult } from './ScrapeTarget';


const loginFile = './dblogin.txt';
const login = fs.readFileSync(loginFile).toString().split('\n');
const [nm, ps, db] = login.map(str => str.trim());


export async function writeToDatabase(
    parseResult: ParseResult | Error,
    name: string = nm, 
    pass: string = ps, 
    database: string = db
): Promise<ParseResult | Error> {
    const uri = `mongodb+srv://${name}:${pass}@smite-timeline-0.n3o8x.mongodb.net/${database}?retryWrites=true&w=majority`
    if (parseResult instanceof Error)
        return parseResult;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        const db = client.db(database);
        const rawHTMLCollection = db.collection("wiki-scraper-raw");
        const updateHTMLResult = await rawHTMLCollection.updateOne(
            {
                name: parseResult.name,
                type: parseResult.type
            }, 
            { $set: { html: parseResult.html } },
            { upsert: true }
        );
        const {name, ...rest} = parseResult.parseResult;
        let collection = db.collection(parseResult.type + "s");
        const updateParsedResult = await collection.updateOne(
            { name: parseResult.name }, 
            { 
                $set: rest, 
            },
            { upsert: true }
        );
        if (updateParsedResult.result.ok < updateParsedResult.result.n) {
            throw new Error('a write operation failed');
        }
    } catch (err) {
        return err; 
    } finally {
        await client.close();
    }
    return parseResult;
}
 