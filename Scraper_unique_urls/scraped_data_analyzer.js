const contactObjects = require('./unique_objects.json')
const contactUrls = require('./unique_urls.json')
const { isContentRelevant,  isObjectUnique } = require('./utils')


// for(url in contactObjects){
//     if(contactObjects[url].length > 1)
//         console.log(url)
// }

// console.log(contactObjects["www.uhn.ca"])

const newResult = [];


for (const url in contactObjects){
    contactObjects[url].forEach((elem, ind) => {
            if (isContentRelevant(elem)){
                if(isObjectUnique(elem, newResult)){
                    console.log(contactUrls[url][ind])
                    newResult.push(elem)
                }
            }
        })    
}

// console.log(newResult)