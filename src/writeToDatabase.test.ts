import { Item } from "@smite-timeline/smite-game-objects";
import { ZeroStats } from "@smite-timeline/smite-game-objects/lib/StatBlock";
import { ParsedGod, ParsedItem, ParseResult } from "./ScrapeTarget";
import { writeToDatabase } from "./writeToDatabase";
import fs from 'fs';


describe('writeToDatabase', () => {
    let login: string[];
    beforeAll(() => {
        const loginFile = './testlogin.txt';
        login = fs.readFileSync(loginFile)
            .toString()
            .split('\n')
            .map(str => str.trim());
    })

    const testItem: Item = {
        goldCost: 0,
        name: 'testItem',
        stats: ZeroStats,
        image: ''
    }

    const validParseResult: ParsedItem = {
        name: 'testResult',
        type: 'item',
        url: new URL('http://www.google.com'),
        html: '',
        parseResult: testItem
    }

    it('does not throw with a valid ParseResult object', async () => {
        expect.assertions(1);
        const result = await writeToDatabase(validParseResult, ...login)
        return expect(result).toBe(validParseResult);

    });

    // it('calls updateOne', () => {

    // });

});