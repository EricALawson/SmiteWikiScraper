import fs from 'fs';
import parseGod, { parseAttackProgression, parseDamage, parseName, parseImageURL, parseStat } from './parseGod';

test('parse god\'s name', () => {
    const testStr = '<table class="infobox"><tbody><tr><th colspan="2" class="title">Baba Yaga</th></tr><tr>';
    const name = parseName(testStr);
    expect(name).toBe('Baba Yaga');
});

test('parsing common stats', () => {
    const teststr = '<tr style=""><th>Health:</th><td><font color="#23b905">400(+73)</font></td></tr>'
    const  stats = parseStat(teststr, 'Health');
    expect(stats.base).toBe(400);
    expect(stats.perLevel).toBe(73);
});

test('parsing damage', () => {
    const teststr = '<th colspan="2" style="text-align: center;">Basic Attack</th></tr><tr style=""><th>Damage:</th><td>35 (+ 1.5)<br>+ 20% of Magical Power</td></tr><tr style="">';
    const stats = parseDamage(teststr);
    expect(stats.baseDamage).toBe(35);
    expect(stats.perLevelDamage).toBe(1.5);
    expect(stats.multiplier).toBe(0.2);
});

test('parsing attack progression', () => {
    const teststr = '<th colspan="2" style="text-align: center;">Basic Attack</th></tr><tr style=""><th>Damage:</th><td>38 (+ 2.4)<br>+ 100% of Physical Power</td></tr><tr style=""><th>Progression:</th><td>1/.5/.5/.5/1.5x damage and 1/.5/.5/.5/1.5x swing time</td></tr><tr>';
    const progression = parseAttackProgression(teststr);
    expect(progression).toEqual([1, 0.5, 0.5, 0.5, 1.5]);
});

test('parsing image url', () => {
    const testHTML = '<a href="/File:SkinArt_Cerberus_Default.jpg" class="image"><img alt="SkinArt Cerberus Default.jpg" src="https://static.wikia.nocookie.net/smite_gamepedia/images/d/de/SkinArt_Cerberus_Default.jpg/revision/latest/scale-to-width-down/250?cb=20180109181100" decoding="async" width="250" height="333"></a>';
    const url = parseImageURL(testHTML);
    expect(url).toBe('https://static.wikia.nocookie.net/smite_gamepedia/images/d/de/SkinArt_Cerberus_Default.jpg/revision/latest/scale-to-width-down/250?cb=20180109181100')
});

test('parse a complete God object', () => {
    const testHTML = fs.readFileSync('./testHTML.txt').toString();
    const god = parseGod(testHTML);
    expect(god).toBeDefined;
});