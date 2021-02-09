import { Page } from "puppeteer";
import God from "smite-timeline/src/data_objects/God";
import { StatBlock } from "smite-timeline/src/data_objects/StatBlock";
import { GodBaseStats } from "smite-timeline/src/data_objects/God";
import statNameRegex from "./statNamesRegex";
 

export default async function readOneGod(pagePromise: Promise<Page>, url: string): Promise<God> {
    const page = await pagePromise;
    await page.goto(url)
        .catch(err => {
            console.log(err.message)
            console.log('failing url: ', + url)
        })
    const godName = url.match(/.*\/(.*)/i)[1];
    console.log('reading page for ' + godName);
    const rowTexts = await readStatsTable(page, url);
    const [baseStats, perLevelStats, otherGodStats] = readRows(rowTexts);
    const god: God = Object.assign({
        name: godName,
        baseStats: baseStats,
        perLevelStats: perLevelStats,
        image: ''
    }, otherGodStats);
    return god;
}

async function readStatsTable(page: Page, url: string): Promise<string[]> {
    await page.waitForSelector('table.infobox tr');
    const rowTexts = await page.$$eval('table.infobox tr', rows => rows.map(row => row.textContent));
    await page.close();
    return rowTexts;
}

//maps row names found on the page to property names in StatBlock.
const stringToName: Record<string, keyof StatBlock> = {
    'HP5': 'hp5',
    "hp5": "hp5",
    'MP5': 'mp5',
    "mp5": "mp5",
    'Physical': 'physicalProtections',
    'Magical': 'magicalProtections',
    'Attacks/Sec': 'attackSpeed',
    'Speed': 'moveSpeed',
    "power": "power",
    "critChance": "critChance",
    "flatPenetration": "flatPenetration",
    "percentPenetration": "percentPenetration",
    "Health": "health",
    "Mana": "mana",
    "moveSpeed": "moveSpeed",
    "attackSpeed": "attackSpeed",
    "physicalProtections": "physicalProtections",
    "magicalProtections": "magicalProtections",
    "lifesteal": "lifesteal",
    "cooldownReduction": "cooldownReduction",
    "crowdControlReduction": "crowdControlReduction",
}

function readRows(rowTexts: string[]): [StatBlock, StatBlock, GodBaseStats] {
    const perLevelStats = StatBlock({});
    const baseStats = StatBlock({});
    const otherGodStats: GodBaseStats = {
        baseAttackDamage: 0,
        perLevelAttackDamage: 0,
        baseMoveSpeed: 0,
        baseAttackSpeed: 0,
        range: 0,
        attackProgression: [1],
        autoAttackPowerMultiplier: 1
    };
    for (const text of rowTexts) {
        if (!text) continue;
        const matches = text.match(statNameRegex);
        if (!matches) continue;
        const statName = matches[0]
        if (statName === 'Damage') {
            const damageRegex = /(?<base>\d+\.?\d*).*?(?<perLevel>\d+\.?\d*).*?(?<multiplier>\d+)%/;
            const value = text.match(damageRegex);
            if (!value) continue;
            const {base, perLevel, multiplier} = value.groups;
            otherGodStats.baseAttackDamage = parseFloat(base);
            otherGodStats.perLevelAttackDamage = parseFloat(perLevel);
            otherGodStats.autoAttackPowerMultiplier = parseFloat(multiplier) / 100; //percent to decimal conversion
        } else if (statName === 'Progression') {
            const progressionRegex = /(?:0?\.?\d\/?)+/
            const values = text.match(progressionRegex)
            if (!values) {
                otherGodStats.attackProgression = [1];
            } else {
                otherGodStats.attackProgression = values[0].split('/').map(x => parseFloat(x));
            }
        } else {
            const values = text.match(/(?<base>\d+\.?\d*).*?(?<perLevel>\d+\.?\d*)/);
            if (!values) continue;
            const { base, perLevel } = values.groups;
            if (!base || !perLevel) continue;
            const baseStat = parseFloat(base);
            const perLevelStat = parseFloat(perLevel);
            if (statName === 'Attack/Sec') {
                otherGodStats.baseAttackSpeed = baseStat;
                perLevelStats.attackSpeed = perLevelStat;
            } else if (statName === 'Speed') {
                otherGodStats.baseMoveSpeed = baseStat;
            } else if (statName === 'Range') {
                otherGodStats.range = baseStat;
            } else {
                baseStats[stringToName[statName]] = baseStat;
                perLevelStats[stringToName[statName]] = perLevelStat;
            }
        }
    }
    return [baseStats, perLevelStats, otherGodStats];
}
