import scrapeGods from "./scrapeGods";
import scrapeItems from "./scrapeItems";
import yargs from 'yargs';

(async function readArguments() {
    const argv = yargs
        .command('gods', 'Scrapes SMITE wiki for god stats')
        .option('count', {
            description: 'how many pages to scrape, mainly used to scrape 1 page for testing',
            type: 'number',
        })
        .command('items', 'Scrapes SMITE wiki for item stats')
        .option('count', {
            description: 'how many pages to scrape, mainly used to scrape 1 page for testing',
            type: 'number',
        })
        .command('testgods', 'Try to scrape one god page, for testing')
        .command('testitems', 'Try to scrape one item page, for testing')
        .argv;

    console.log(argv);

    if (argv._.includes('gods')) {
        console.log('Scraping God pages');
        const gods = await scrapeGods();
    }
    if (argv._.includes('items')) {
        console.log('Scraping Item pages.');
        const items = await scrapeItems();
    }
    if (argv._.includes('testgods')) {
        console.log('testing 1 god page');
        const god = await scrapeGods(1);
        console.log(god);
    }
    if (argv._.includes('testitems')) {
        console.log('testing 1 item page');
        const item = await scrapeItems(1);
        console.log(item);
    }
    console.log('Done');
})();
