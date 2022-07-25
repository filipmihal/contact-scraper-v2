const Apify = require('apify');
const {parseHandlesFromHtml} = require('./standardizedSocialHandles');
const _ = require('underscore');
const fs = require('fs');
const URLS = require('./input_urls.json'); 
// const URLS = require('./test_urls.json'); 

// TODO: do standardization for each contact on a page
// group single entities


const WAIT_FOR_BODY_SECS = 200
const DURATIONS = []
let totalFrames = 0
let LONELYCONTACT = 0
// const URLS= [{url: "https://baysideoc.com/contact-us/"}]  
function arrayUnion(arr1, arr2){
    return [...new Set([...arr1, ...arr2])]
}

const isSubset = (superObj, subObj) => {
    return Object.keys(subObj).every(ele => {
        if (subObj[ele].length > 0 && superObj[ele].length == 0) {
            return false
        }

       return subObj[ele].every((contact) => superObj[ele].includes(contact))
    })
}

function isSuperset(obj, objList){
    return objList.some(elem => isSubset(obj, elem) && obj !== elem)
}

function arrayIntersections(arr1, arr2){
    return arr1.filter(value => arr2.includes(value))
}
function isSocialEmpty(obj) {
    return Object.keys(obj).every(elem => obj[elem].length === 0)
}

function getContactObjectLength(obj){
    let length = 0;
    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            length += obj[key].length
        }
    }

    return length
}

function jaccardIndex (obj1, obj2){
    let unionSize = 0
    let intersections = 0
    Object.keys(obj1).forEach(elem => {
        if(elem !== "phonesUncertain"){
            unionSize += arrayUnion(obj1[elem], obj2[elem]).length       
            intersections += arrayIntersections(obj1[elem], obj2[elem]).length
        }
    })

    return intersections / unionSize
}

function isObjectUnique (obj, savedObjs){
    return savedObjs.every(elem => jaccardIndex(obj, elem) < 1)
 }

function areSocialsTheSame(obj1, obj2){
    return jaccardIndex(obj1, obj2) === 1
}

function buildDuplicityMap(objectList){
    const duplicityMap = new Map()
    for (const contactObject of objectList) {
        for (const key in contactObject) {
            if (Object.hasOwnProperty.call(contactObject, key)) {
                contactObject[key].forEach(elem => {
                    if(!duplicityMap.get(elem)){
                        duplicityMap.set(elem,1)
                    }
                    else{
                        const num = duplicityMap.get(elem)
                        duplicityMap.set(elem, num+1)
                    }
                })
                
            }
        }
    }

    return duplicityMap
}

function isContactObjectEdgeCase(contactObject){
    // it contains only uncertain phones
    for (const key in contactObject) {
        if (Object.hasOwnProperty.call(contactObject, key)) {
            if(key === 'phonesUncertain')
                continue
            else if(contactObject[key].length !== 0)
                return false
        }
    }

    return true
}


function uniqueContactSubsetInheritance(parent, heirs, duplicityMap){
    console.log(parent)
    for (const key in parent) {
        if (Object.hasOwnProperty.call(parent, key)) {
            parent[key].forEach(contactUnit => {
                const unitCount = duplicityMap.get(contactUnit)
                if(unitCount == 1){
                    if(heirs.length === 1){
                        heirs[0][key].push(contactUnit);
                    }
                    if(heirs.length > 1){
                        console.error("LONELY CONTACT: " + contactUnit)
                        LONELYCONTACT += 1
                    }
                    // heirs.forEach(heir => heir[key].push(contactUnit))
                }
                else if(unitCount > 1){
                    duplicityMap.set(contactUnit, unitCount - 1)
                }
                else{
                    throw new Error("Empty Map even though contact exists (Map not synced!!)")
                }
            })
            
        }
    }
    
}


const dir = 'apify_storage'
try{
    fs.rmdirSync(dir, { recursive: true, force: true })
}
catch{
    console.log("Could not delete folder")
}

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

        await page.waitForSelector('body', {
            timeout: WAIT_FOR_BODY_SECS * 1000,
        });

        console.log("starting search")
        console.log(page.url())
        const pageFrame = page.mainFrame()
        const htmlMain = await pageFrame.$("html")
        // console.log(await page.content())
      
        const start = performance.now();
        const divContents = await htmlMain.evaluate(() => Array.from(document.querySelectorAll('div'), element => element.innerHTML))
        const uniqueContacts = []
        const finalContacts = []

        // parse social handles for every div
        // we filter non-empty and unique objects
        for (const section of divContents) {
            const socialHandles = parseHandlesFromHtml(section)
            if(!isSocialEmpty(socialHandles) && !isContactObjectEdgeCase(socialHandles) && isObjectUnique(socialHandles, uniqueContacts)){
                uniqueContacts.push(socialHandles)
            }
        }

        
        console.log(uniqueContacts)
        
        const duplicityMap = buildDuplicityMap(uniqueContacts)
        
        // eliminate supersets
        while(uniqueContacts.length > 0){
            
            // array needs to be sorted in order to make subset logic work
            // sort descending according to number of contacts an object contains
            uniqueContacts.sort((o1, o2) => getContactObjectLength(o2)-getContactObjectLength(o1))
            const contact = uniqueContacts[0]
            uniqueContacts.shift()
            const subsets = uniqueContacts.filter(elem => isSubset(contact, elem) && contact !== elem)
            if(subsets.length > 0){
                uniqueContactSubsetInheritance(contact, subsets, duplicityMap)
            }
            else{
                finalContacts.push(contact)
            }
        }

        const duration = performance.now() - start
        DURATIONS.push(duration)
    };

    // Create a PuppeteerCrawler
    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        handlePageFunction,
    });
    // Run the crawler
    await crawler.run()

    DURATIONS.sort(function(a, b){return a - b})
    console.log(DURATIONS[ Math.floor(DURATIONS.length / 2)])
});

