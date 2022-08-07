import { createPuppeteerRouter, Dataset } from 'crawlee';
import * as Helper from './helpers.js';
import { DURATIONS } from './main.js';
import { parseStandardHandlesFromHtml } from './standardizedSocialHandles.js';

export const router = createPuppeteerRouter();

router.addDefaultHandler(async ({ page, log }) => {
    const url = await page.url()
    const pageFrame = page.mainFrame()
    const htmlMain = await pageFrame.$("html")

    if(!htmlMain){
        return
    }
  
    const start = performance.now();

    // Find every div on the webiste
    const divContents = await htmlMain.evaluate(() => Array.from(document.querySelectorAll('div'), element => element.innerHTML))
    const uniqueContacts = []
    const finalContacts = []

    // parse social handles for every div
    // we filter non-empty and unique objects
    for (const section of divContents) {
        const socialHandles = parseStandardHandlesFromHtml(section)
        if(!Helper.isSocialEmpty(socialHandles) && !Helper.isContactObjectEdgeCase(socialHandles) && Helper.isObjectUnique(socialHandles, uniqueContacts)){
            uniqueContacts.push(socialHandles)
        }
    }
    
    const duplicityMap = Helper.buildDuplicityMap(uniqueContacts)
    
    // eliminate supersets
    while(uniqueContacts.length > 0){
        
        // array needs to be sorted in order to make subset logic work
        // sort descending according to number of contacts an object contains
        uniqueContacts.sort((o1, o2) => Helper.getContactObjectLength(o2)-Helper.getContactObjectLength(o1))
        const contact = uniqueContacts[0]
        uniqueContacts.shift()
        const subsets = uniqueContacts.filter(elem => Helper.isSubset(contact, elem) && contact !== elem)
        if(subsets.length > 0){
            Helper.uniqueContactSubsetInheritance(contact, subsets, duplicityMap)
        }
        else{
            finalContacts.push(contact)
        }
    }
    console.log(`CONTACT OBJECT FOR: ${await page.url()}`)
    console.log(finalContacts)

    const result = {
        depth: 0,
        referrerUrl: '',
        url,
        domain: '',
        contactObjects: finalContacts
    }

    Dataset.pushData(result)
    const duration = performance.now() - start
    DURATIONS.push(duration)

    // await enqueueLinks({
    //     globs: ['https://crawlee.dev/*'],
    //     label: 'DETAIL',
    // });
});
