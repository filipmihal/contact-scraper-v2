import { KeyValueStore, PuppeteerCrawler, log } from 'crawlee';
import { Actor } from 'apify';
import { router } from './routes.js';

export const DURATIONS: number[] = [];
interface InputSchema {
    startUrls: string[];
    debug?: boolean;
}

await Actor.init();
let URLS: string[] = [];
const { startUrls, debug } = await KeyValueStore.getInput<InputSchema>() ?? {};
if(!startUrls){
	const actorInput = await Actor.getInput();
	console.log(actorInput);
	console.log(typeof actorInput);
	
	
} else{
	URLS = startUrls;
}
if (debug) {
	log.setLevel(log.LEVELS.DEBUG);
}

const crawler = new PuppeteerCrawler({
	maxConcurrency: 50,
	requestHandler: router,
});

await crawler.run(URLS);

DURATIONS.sort(function(a, b){return a - b})
log.info(`Median duration: ${DURATIONS[ Math.floor(DURATIONS.length / 2)]}`)


await Actor.exit();