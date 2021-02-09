import StatBlock from "smite-timeline/src/data_objects/StatBlock";

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
    'progression',
    'range'
]

let str = '(' + names.join('|') + ')'
const statNameRegex = new RegExp(str, 'i')
export default statNameRegex;
