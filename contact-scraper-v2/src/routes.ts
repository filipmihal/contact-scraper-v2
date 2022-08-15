import { createPuppeteerRouter, Dataset } from 'crawlee';
import * as Helper from './helpers.js';
import { DURATIONS } from './main.js';
import { parseStandardHandlesFromHtml } from './standardizedSocialHandles.js';

export const router = createPuppeteerRouter();

router.addDefaultHandler(async ({ page }) => {
    const url = await page.url()
    const pageFrame = page.mainFrame()
    const htmlMain = await pageFrame.$("html")

    if(!htmlMain){
        return
    }
  
    const start = performance.now();

    // Find every div on the webiste
    const potentialContactContents = await htmlMain.evaluate(() => Array.from(document.querySelectorAll('div, tr, td, ul, address'), element => element.innerHTML))
    const potentialWeakContents = await htmlMain.evaluate(() => Array.from(document.querySelectorAll('p, li'), element => element.innerHTML))
    const uniqueContacts = []
    let finalContacts = []

    for ( const weakElem of potentialWeakContents ) {
        const socialHandles = parseStandardHandlesFromHtml(weakElem)
        if(Helper.getNumberOfContactUnits(socialHandles) > 1){
            potentialContactContents.push(weakElem)
        }

    }

    // parse social handles for every div
    // we filter non-empty and unique objects
    for (const section of potentialContactContents) {
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

    // TODO resolve bug with subsets
    // TODO combine relatively SIMILAR OBJECTS

    // combine into one if possible
    let canFormUnit = true;
    for (let idx = 0; idx < finalContacts.length; idx++) {
        for (let idx2 = idx+1; idx2 < finalContacts.length; idx2++) {
            if(Helper.havePropertyInCommon(finalContacts[idx], finalContacts[idx2])){
                canFormUnit = false
            }
        }
    }

   if(canFormUnit){
        const fullContent  = await page.content()
        finalContacts = [parseStandardHandlesFromHtml(fullContent)]
   }

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
