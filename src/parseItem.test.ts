import parseItem, { parseCost, parsePassive, parseStats } from "./parseItem";
import fs from 'fs';

describe('parseStats', () => {
    it('reads a stat value correctly', () => {
        const testStr = '<th>Stats:</th><td>+250 Health <br/>+60 Physical Protection</td></tr>';
        const result = parseStats(testStr);
        expect(result).toMatchObject({
            health: 250, physicalProtection: 60
        });
    });

    it('reads a percentage stat value as a decimal', () => {
        const testStr = '<tr style=""><th>Stats:</th><td>+8% Movement Speed</td></tr>';
        const result = parseStats(testStr);
        expect(result).toMatchObject({
            movementSpeed: 0.08,
        });
    });
});


test('parseCost', () => {
    const testStr = '<th>Total Cost:</th><td style="color:gold;">2000</td></tr>';
    const result = parseCost(testStr);
    expect(result).toBe(2000);
});

test('parsePassive', () => {
    const testStr = '<th>Passive Effect:</th><td>Damageable enemy structures within 55 units have their Attack Speed reduced by 30%.<br/> Damageable allied structures within 55 units have their Attack Speed increased by 40 %.</td></tr>';
    const result = parsePassive(testStr);
    expect(result).toBe('Damageable enemy structures within 55 units have their Attack Speed reduced by 30%. Damageable allied structures within 55 units have their Attack Speed increased by 40 %.')
});

// test('parseImageURL', () => {
//     const testHTML = ';"><a href="/File:EmperorsArmor_T3.png" class="image"><img alt="EmperorsArmor T3.png" src="https://static.wikia.nocookie.net/smite_gamepedia/images/7/78/EmperorsArmor_T3.png/revision/latest/scale-to-width-down/128?cb=20160706104440" decoding="async" width="128" height="128" /></a>';
//     const url = parseImageURL(testHTML);
//     expect(url).toBe('https://static.wikia.nocookie.net/smite_gamepedia/images/7/78/EmperorsArmor_T3.png/revision/latest/scale-to-width-down/128?cb=20160706104440')
// });

test('parse whole item', () => {
    const testHTML = fs.readFileSync('./testItemHTML.txt').toString();
    const item = parseItem(testHTML);
    expect(item).toBeDefined;
});