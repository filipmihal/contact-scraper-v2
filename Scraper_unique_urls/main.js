const Apify = require('apify');
const _ = require('underscore');
const URLS= require('./urls.json'); 
const fs = require('fs');

function isSocialEmpty(obj) {
    return Object.keys(obj).every(elem => obj[elem].length === 0)
}

isSubset = (superObj, subObj) => {
    return Object.keys(subObj).every(ele => {
        if (subObj[ele].length > 0 && superObj[ele].length == 0) {
            return false
        }

       return subObj[ele].every((contact) => superObj[ele].includes(contact))
    })
}

const dir = 'apify_storage'
try{
    fs.rmdirSync(dir, { recursive: true, force: true })
}
catch{
    console.log("Could not delete folder")
}
const WAIT_FOR_BODY_SECS = 200
let totalFrames = 0


Apify.main(async () => {
    
    let isMainPage = true;
    const uniqueContactObjects = {}
    const uniqueUrls = {}
    // Create a RequestQueue
    const requestQueue = await Apify.openRequestQueue();
    // Define the starting URL
    if(! await requestQueue.isEmpty()){
        console.log("STORAGE IS NOT EMPTY")
        return
    }

    URLS.forEach(async (url) => {
        await requestQueue.addRequest(url);
        console.log(url)
    });

    const handlePageFunction = async ({ request, page }) => {

        console.log(page.url())

        const urlDecomp = new URL(request.url)
        const pseudoUrl = urlDecomp.protocol + '//' + urlDecomp.hostname + '/[.*]'

        await page.waitForSelector('body', {
            timeout: WAIT_FOR_BODY_SECS * 1000,
        });
        
        // link depth is max 1
        if(uniqueContactObjects[urlDecomp.hostname] === undefined){
            isMainPage = false;
            await Apify.utils.enqueueLinks({
                page,
                requestQueue,
                pseudoUrls: [pseudoUrl]
            });
        }
        
        if(uniqueContactObjects[urlDecomp.hostname] === undefined){
            uniqueContactObjects[urlDecomp.hostname] = []
            uniqueUrls[urlDecomp.hostname] = []
        }

        const uniqueCache =  uniqueContactObjects[urlDecomp.hostname]


        const frames = page.mainFrame().childFrames().length;
        totalFrames += frames

        const html = await page.content()

        const socialHandles = Apify.utils.social.parseHandlesFromHtml(html)

        console.log(`IS EMPTY: ${isSocialEmpty(socialHandles)}`)
        console.log(`JE SUBSET: ${!uniqueCache.every(elem => !isSubset(elem, socialHandles))}`)

        if(!isSocialEmpty(socialHandles) && uniqueCache.every(elem => !isSubset(elem, socialHandles))){
            console.log("PUSHING")
            uniqueCache.push(socialHandles)
            uniqueUrls[urlDecomp.hostname].push(page.url())
        }

        // const frameSocialHandles = await crawlFrames(page);
    };
    // Create a PuppeteerCrawler
    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        handlePageFunction,
    });
    // Run the crawler
    await crawler.run()
    // console.log(uniqueContactObjects)
    const uniqueUrlsJSON = JSON.stringify(uniqueUrls)
    const uniqueObjects = JSON.stringify(uniqueContactObjects)
    console.log(totalFrames)
    fs.writeFileSync('unique_url.json', uniqueUrlsJSON)
    fs.writeFileSync('unique_objects.json', uniqueObjects)
});