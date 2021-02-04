
const names = [
    'power',
    // 'critChance',
    // 'flatPenetration',
    // 'percentPenetration',
    'health',
    'mana',
    'hp5',
    'mp5',
    'speed',
    'attack\/sec',
    'physical',
    'magical',
    // 'lifesteal',
    // 'cooldownReduction',
    // 'crowdControlReduction',
    'damage',
    'progression'
]

let str = '(' + names.join('|') + ')'
const statNameRegex = new RegExp(str, 'i')
export default statNameRegex;

//TODO: make typesafe with StatBlock keys, but must also include some other stats like move speed and attack speed.
const stringToName = {
    'HP5': 'hp5',
    "hp5": "hp5",
    'MP5': 'mp5',
    "mp5": "mp5",
    'Physical':'physicalProtections',
    'Magical':'magicalProtections',
    'Attacks/Sec':'attackSpeed',
    'Speed':'moveSpeed',
    'Damage':'baseAttackDamage',
    "power":"power",
    "critChance":"critChance",
    "flatPenetration":"flatPenetration",
    "percentPenetration":"percentPenetration",
    "Health":"health",
    "Mana":"mana",
    "moveSpeed":"moveSpeed",
    "attackSpeed":"attackSpeed",
    "physicalProtections":"physicalProtections",
    "magicalProtections":"magicalProtections",
    "lifesteal":"lifesteal",
    "cooldownReduction":"cooldownReduction",
    "crowdControlReduction":"crowdControlReduction",
}

export {stringToName};