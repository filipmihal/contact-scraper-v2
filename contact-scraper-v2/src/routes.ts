import { Dataset, createPuppeteerRouter } from 'crawlee';

export const router = createPuppeteerRouter();

router.addDefaultHandler(async ({ enqueueLinks, log, page }) => {
    log.info(`Handle Start URLs`);
    log.info(`TITLE: ${await page.title()}`)
    await enqueueLinks({
        globs: ['https://crawlee.dev/*'],
        label: 'DETAIL',
    });
});
