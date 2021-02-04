import { Page } from "puppeteer";
import God from "smite-timeline/src/data_objects/God";
import { StatBlock } from "smite-timeline/src/data_objects/StatBlock";
import statNameRegex from "./statNamesRegex";
 import { stringToName } from "./statNamesRegex";
 

export default async function readOneGod(pagePromise: Promise<Page>, url: string) {
    const page = await pagePromise;
    await page.goto(url)
        .catch(err => {
            console.log(err.message)
            console.log('failing url: ', + url)
        })
    const godName = url.match(/.*\/(.*)/i)[1];
    console.log('reading page for ' + godName);
    const rowTexts = await readStatsTable(page, url);
    const [baseStats, perLevelStats] = readRows(rowTexts);
    const god: God = {
        name: godName,
        baseStats: baseStats,
        perLevelStats: perLevelStats,
        image: ''
    };
    return god;
}

async function readStatsTable(page: Page, url: string): Promise<string[]> {
    await page.waitForSelector('table.infobox tr')
    const rowTexts = await page.$$eval('table.infobox tr', rows => rows.map(row => row.textContent));
    await page.close();
    return rowTexts;
}

function readRows(rowTexts: string[]) {
    const perLevelStats = StatBlock({});
    const baseStats = StatBlock({});
    for (const text of rowTexts) {
        if (!text) continue;
        // console.log(text);
        const matches = text.match(statNameRegex)
        // console.log('matches:', matches);
        if (!matches) continue;
        const statName = matches[0]
        const values = text.match(/(?<base>\d+\.?\d*).*?(?<perLevel>\d+\.?\d*)/)
        if (!values) continue;
        const [base, perLevel] = values;
        if (!base || !perLevel) continue;
        const baseStat = parseFloat(base)
        const perLevelStat = parseFloat(perLevel)
        if (statName == 'Attack/Sec') {
            baseStats['baseAttackSpeed'] = baseStat
            perLevelStats['attackSpeed'] = perLevelStat
        } else {
            baseStats[stringToName[statName]] = baseStat
            perLevelStats[stringToName[statName]] = perLevelStat
        }
    }
    return [baseStats, perLevelStats]
}