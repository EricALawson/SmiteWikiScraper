import { Item } from "@smite-timeline/smite-game-objects";
import { ZeroStats } from "@smite-timeline/smite-game-objects/lib/StatBlock";
import { ParsedGod, ParsedItem, ParseResult } from "./ScrapeTarget";
import { writeToDatabase } from "./writeToDatabase";


describe('writeToDatabase', () => {
    const testItem: Item = {
        goldCost: 0,
        name: 'testItem',
        stats: ZeroStats,
        image: ''
    }
    const testResult: ParsedItem = {
        name: 'testResult',
        type: 'item',
        url: new URL('http://www.google.com'),
        html: '',
        parseResult: testItem
    }
    it('does not throw with a valid ParseResult object', async () => {
        expect.assertions(1);
        return expect(writeToDatabase(testResult)).resolves.not.toThrow();
    });

    // it('calls updateOne', () => {

    // });

});