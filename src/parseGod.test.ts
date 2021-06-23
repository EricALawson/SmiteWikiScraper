import fs from 'fs';
import parseGod, { parseAttackProgression, parseDamage, parseName, parseImageURL, parseStat, parseAttackSpeed } from './parseGod';

let fullPage: string;
beforeAll(() => {
    fullPage = fs.readFileSync('./testHTML.txt').toString();
})
test('parse god\'s name', () => {
    const name = parseName(fullPage);
    expect(name).toBe('Chang\'e');
});

test('parsing common stats', () => {
    const  stats = parseStat(fullPage, 'Health');
    expect(stats.base).toBe(410);
    expect(stats.perLevel).toBe(80);
});

test('parsing damage', () => {
    const stats = parseDamage(fullPage);
    expect(stats.baseDamage).toBe(32);
    expect(stats.perLevelDamage).toBe(1.45);
    expect(stats.multiplier).toBe(0.2);
});

test('parsing attack progression', () => {
    const teststr = '<th colspan="2" style="text-align: center;">Basic Attack</th></tr><tr style=""><th>Damage:</th><td>38 (+ 2.4)<br>+ 100% of Physical Power</td></tr><tr style=""><th>Progression:</th><td>1/.5/.5/.5/1.5x damage and 1/.5/.5/.5/1.5x swing time</td></tr><tr>';
    const progression = parseAttackProgression(teststr);
    expect(progression).toEqual([1, 0.5, 0.5, 0.5, 1.5]);
});

test('parse attack speed', ()  => {
    const speed = parseAttackSpeed(fullPage);
    expect(speed.attackDuration).toBe(1);
    expect(speed.baseAttackSpeed).toBe(0);
    expect(speed.perLevelAttackSpeed).toBe(0.0095);
})

test('parsing image url', () => {
    const testHTML = '<a href="/File:SkinArt_Cerberus_Default.jpg" class="image"><img alt="SkinArt Cerberus Default.jpg" src="https://static.wikia.nocookie.net/smite_gamepedia/images/d/de/SkinArt_Cerberus_Default.jpg/revision/latest/scale-to-width-down/250?cb=20180109181100" decoding="async" width="250" height="333"></a>';
    const url = parseImageURL(testHTML);
    expect(url).toBe('https://static.wikia.nocookie.net/smite_gamepedia/images/d/de/SkinArt_Cerberus_Default.jpg/revision/latest/scale-to-width-down/250?cb=20180109181100')
});

test('parse a complete God object', () => {
    const god = parseGod(fullPage);
    expect(god).toBeDefined;
    expect(god.autoAttack.attackDuration).toBe(1);
});