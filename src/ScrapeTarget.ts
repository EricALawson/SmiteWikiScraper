import { God, Item } from "@smite-timeline/smite-game-objects"

type ScrapeTarget = {
    type: 'item'|'god',
    url: URL
}

type RawHTML = ScrapeTarget & {
    html: string
}

type ParsedItem = RawHTML & {
    type: 'item',
    item: Item,
}

type ParsedGod = RawHTML & {
    type: 'god',
    god: God
}

type ParseResult = ParsedItem | ParsedGod 