import { God, Item } from "@smite-timeline/smite-game-objects"

export type ScrapeTarget = {
    name: string,
    type: 'item'|'god',
    url: URL
}

export function isScrapeTarget(obj: any): obj is ScrapeTarget {
    return obj.name && obj.type && obj.url;
}

export type ScrapeResult = ScrapeTarget & {
    html: string
}

export function isScrapeResult(obj: any): obj is ScrapeResult {
    return obj.html && isScrapeTarget(obj);
}

export type ParsedItem = ScrapeResult & {
    type: 'item',
    parseResult: Item,
}

export type ParsedGod = ScrapeResult & {
    type: 'god',
    parseResult: God
}

export type ParseResult = ParsedItem | ParsedGod 

export function isParseResult(obj: any): obj is ParseResult {
    return obj.parseResult && isScrapeResult(obj);
}