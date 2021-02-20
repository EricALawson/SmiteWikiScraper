import God from "smite-timeline/src/data_objects/God";
import StatBlock from "smite-timeline/src/data_objects/StatBlock";


export default function parseGod(html: string): God {
    const name = parseGodName(html);
    const { base: baseHealth, perLevel: perLevelHealth } = parseStat(html, 'Health');
    const { base: baseMana, perLevel: perLevelMana } = parseStat(html, 'Mana');
    const { base: basehp5, perLevel: perLevelhp5 } = parseStat(html, 'HP5');
    const { base: basemp5, perLevel: perLevelmp5 } = parseStat(html, 'MP5');
    const attackProgression = parseAttackProgression(html);
    const { baseDamage, perLevelDamage, multiplier} = parseDamage(html);
    const {attackDuration, baseAttackSpeed, perLevelAttackSpeed} = parseAttackSpeed(html);
    const moveSpeed = parseMoveSpeed(html);
    const range = parseRange(html);

    const god: God = {
        name: name,
        autoAttack: {
            progression: attackProgression,
            multiplier: multiplier,
            attackDuration: attackDuration,
            range: range,
        },
        baseMoveSpeed: moveSpeed,
        baseStats: StatBlock({
            health: baseHealth,
            mana: baseMana,
            hp5: basehp5,
            mp5: basemp5,
            autoAttackDamage: baseDamage,
            attackSpeed: baseAttackSpeed
        }),
        perLevelStats: StatBlock({
            health: perLevelHealth,
            mana: perLevelMana,
            hp5: perLevelhp5,
            mp5: perLevelmp5,
            autoAttackDamage: perLevelDamage,
            attackSpeed: perLevelAttackSpeed,
        }),
        image: "https://web2.hirez.com/smite/god-cards/" + name.toLowerCase().replace(/\s/g, "-") + ".jpg"
    } as God;
    return god;
}

export function getImage(html: string) {

}

export function parseGodName(html): string {
    const regex = /class="title">(.*?)</i;
    const match = regex.exec(html);
    if (!match) throw new Error(`could not parse god's name from:\n${html}`);
    return match[1];
}

export function parseStat(html: string, statName: string) {
    const str = String.raw`<th>${statName}.*>(?<base>\d+\.?\d*).*?(?<perLevel>\d+\.?\d*)`;
    const regex = new RegExp(str, 'i');
    const match = regex.exec(html);
    if (!match || !match.groups) throw new Error(`Stat parse failed\nRegex: ${str}`);
    const {base, perLevel} = match.groups;
    if (!base || !perLevel) throw new Error(`Stat parse was incomplete: ${statName}\nFrom:\n${html}`);
    return {
        base: parseFloat(base),
        perLevel: parseFloat(perLevel)
    };
}

export function parseDamage(html: string) {
    const regex = /<th>Damage.*>(?<base>\d+\.?\d*).*?(?<perLevel>\d+\.?\d*).*?(?<multiplier>\d+)%/i;
    const match = regex.exec(html);
    if (!match) throw new Error(`Parsing damage failed\nhtml:\n${html}`);
    const {base, perLevel, multiplier} = match.groups;
    if (!base || !perLevel || !multiplier) throw new Error(`Parse damage was incomplete\ncaptures: ${match.groups}`);
    return {
        baseDamage: parseFloat(base),
        perLevelDamage: parseFloat(perLevel),
        multiplier: parseFloat(multiplier) / 100 //percentage to decimal conversion
    };
}

export function parseAttackProgression(html: string) {
    const regex = /Progression:.*>(?<progression>(?:0?\.?\d\/?)+)/i;
    const match = regex.exec(html);
    if (!match) throw new Error(`Parsing attack progression failed\nhtml:\n${html}`);
    const progression = match.groups.progression.split('/');
    return progression.map(str => parseFloat(str));
}

export function parseAttackSpeed(html: string) {
    const {base, perLevel } = parseStat(html, 'Attack/Sec')
    return {
        attackDuration: base,
        baseAttackSpeed: 0,
        perLevelAttackSpeed: perLevel / 100 //percentage to decimal
    }
}

export function parseMoveSpeed(html:string): number {
    const regex = /Speed:.*>(?<speed>\d+\.?\d*)/i;
    const match = regex.exec(html);
    if (!match) throw new Error(`Could not parse move speed from:\n${html}`);
    const speed = match.groups.speed;
    return parseFloat(speed);
}

export function parseRange(html): number {
    const regex = /Range:.*>(?<range>\d+\.?\d*)/i;
    const match = regex.exec(html);
    if (!match) throw new Error(`Could not parse range from:\n${html}`);
    const range = match.groups.range;
    return parseFloat(range);
}