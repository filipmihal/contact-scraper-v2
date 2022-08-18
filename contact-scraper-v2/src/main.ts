import { KeyValueStore, PuppeteerCrawler, log } from 'crawlee';
import { router } from './routes.js';

export const DURATIONS: number[] = [];
interface InputSchema {
    startUrls: string[];
    debug?: boolean;
}


const { startUrls, debug } = await KeyValueStore.getInput<InputSchema>() ?? {};
if (debug) {
	log.setLevel(log.LEVELS.DEBUG);
}

const crawler = new PuppeteerCrawler({
	maxConcurrency: 50,
	requestHandler: router,
});

await crawler.run(startUrls);

DURATIONS.sort(function(a, b){return a - b})
log.info(`Median duration: ${DURATIONS[ Math.floor(DURATIONS.length / 2)]}`)