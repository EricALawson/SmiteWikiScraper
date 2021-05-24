
import {parseName, parseImageURL} from './parseGod';
import _ from 'lodash';
import StatBlock, { ZeroStats } from '@smite-timeline/smite-game-objects/lib/StatBlock';
import Item from '@smite-timeline/smite-game-objects/lib/Item';


export default function parseItem(html: string): Item {
    html = html.replace(/(\r?\n|\r)/gm, "");
    const name = parseName(html);
    const imageURL = parseImageURL(html);
    const { itemType, tags } = parseItemType(html);
    let goldCost: number;
    try {
        goldCost = parseCost(html);
    } catch (err) {
        if (itemType != 'Relic') throw err;
        goldCost = 0;
    }
    let stats: StatBlock;
    try {
        stats = parseStats(html);
    } catch(err) {
        if (itemType != 'Consumable' && itemType != 'Relic') throw err;
        stats = ZeroStats;
    }
    let passiveText: string;
    try {
        passiveText = parsePassive(html);
    } catch (err) {
        if (itemType != 'Consumable' && itemType != 'Relic') throw err;
        passiveText = "";
    }
    const item = {
        name: name,
        goldCost: goldCost,
        stats: stats,
        image: imageURL,
        passive: passiveText
    };
    return item;
}

// export function parseName(html: string): string {
    
// }

export function parseStats(html: string): StatBlock {
    const regex = /Stats:.*?<td>(\+(?:\d+)%? (?:.+?))<\/td>/i; // g flag is required to loop regex.exec() otherwise it does not advance and loops forever.
    let match = regex.exec(html);
    if (!match) throw new Error('Could not find stats on item: ' + html);
    const statStrs = match[1].split('<br\/>');
    const stats = {};
    const parseStatRegex = /\+(?<valueStr>\d+)%? (?<statName>.+)/i;
    for (const statStr of statStrs) {
        match = parseStatRegex.exec(statStr);
        if (!match || !match.groups) throw new Error('stat string could not be broken into value and stat name: ' + statStr);
        const {valueStr, statName} = match.groups;
        let value = parseFloat(valueStr);
        if (statStr.includes('%')) value =  value / 100;
        const camelCaseStatName = _.camelCase(statName);
        stats[camelCaseStatName] = value;
    }
    return StatBlock(stats);
}

type ItemType = 'Consumable' | 'Relic' | 'Equipment';
export function parseItemType(html: string) {
    const regex = /Item Type:.*?<td>(.*?)<\/td>/i;
    const match = regex.exec(html);
    if (!match) throw new Error('Could not parse an item type from : ' + html);
    const tags = match[1].split(',').map(tag => tag.trim());
    if (tags[0] == 'Consumable' || tags[0] == 'Relic') {
        return {
            itemType: tags[0],
            tags: []
        }
    } else {
        return {
            itemType: 'Equipment',
            tags: tags
        }
    }
}

export function parseCost(html: string): number {
    const regex = /Cost:.*?>(\d+)/i;
    const match = regex.exec(html);
    if (!match) throw new Error('could not parse item gold cost from: ' + html);
    return parseFloat(match[1]);
}

export function parsePassive(html: string): string {
    const regex = /Passive Effect:.*?<td>(.*?)<\/td>/i;
    const match = regex.exec(html);
    //if (!match) throw new Error('Could not parse passive description');
    if (!match) return "";
    const passiveStr = match[1].replace("<br/>", "");
    return passiveStr; 
}

// export function parseImageURL(html: string): string {
//     const regex = /<img.*?src="(.*?)"/i;
//     const match = regex.exec(html);
//     if (!match) throw new Error(`Could not read image URL from html:\n${html}`);
//     return match[1];
// }