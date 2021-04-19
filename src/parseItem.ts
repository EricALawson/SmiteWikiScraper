import Item from "smite-timeline/src/data_objects/Item";
import StatBlock from "smite-timeline/src/data_objects/StatBlock";
import {parseName, parseImageURL} from './parseGod';
import _ from 'lodash';


export default function parseItem(html: string): Item {
    html = html.replace(/(\r?\n|\r)/gm, "");
    const name = parseName(html);
    const stats = parseStats(html);
    const goldCost = parseCost(html);
    const passiveText = parsePassive(html);
    const imageURL = parseImageURL(html);
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
    const regex = /Stats:.*?<td>(\+(?:\d+) (?:.+?))<\/td>/i; // g flag is required to loop regex.exec() otherwise it does not advance and loops forever.
    let match = regex.exec(html);
    if (!match) throw new Error('Could not find stats on item: ' + html);
    const statStrs = match[1].split('<br\/>');
    const stats = {};
    const parseStatRegex = /\+(?<value>\d+) (?<statName>.+)/i;
    for (const statStr of statStrs) {
        match = parseStatRegex.exec(statStr);
        if (!match) throw new Error('stat string could not be broken into value and stat name: ' + statStr);
        let {value, statName} = match.groups;
        const camelCaseStatName = _.camelCase(statName);
        stats[camelCaseStatName] = parseFloat(value);
    }
    return StatBlock(stats);
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