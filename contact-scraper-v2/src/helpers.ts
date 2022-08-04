import {SocialHandles} from '@crawlee/utils/internals/social'
function arrayUnion<T>(arr1: Array<T>, arr2: Array<T>){
    return [...new Set([...arr1, ...arr2])]
}

const isSubset = (superObj: SocialHandles, subObj: SocialHandles) => {
    return Object.keys(subObj).every(ele => {
        const socialIndex = ele as keyof SocialHandles
        if (subObj[socialIndex].length > 0 && superObj[socialIndex].length == 0) {
            return false
        }
       return subObj[socialIndex].every((contact) => superObj[socialIndex].includes(contact))
    })
}

function isSuperset(obj: SocialHandles, objList: SocialHandles[]){
    return objList.some(elem => isSubset(obj, elem) && obj !== elem)
}

function arrayIntersections<T>(arr1: Array<T>, arr2: Array<T>){
    return arr1.filter(value => arr2.includes(value))
}

// function isSocialEmpty(obj: SocialHandles) {
//     return Object.keys(obj).every(elem => obj[elem].length === 0)
// }

// function getContactObjectLength(obj){
//     let length = 0;
//     for (const key in obj) {
//         if (Object.hasOwnProperty.call(obj, key)) {
//             length += obj[key].length
//         }
//     }

//     return length
// }

// function jaccardIndex (obj1, obj2){
//     let unionSize = 0
//     let intersections = 0
//     Object.keys(obj1).forEach(elem => {
//         if(elem !== "phonesUncertain"){
//             unionSize += arrayUnion(obj1[elem], obj2[elem]).length       
//             intersections += arrayIntersections(obj1[elem], obj2[elem]).length
//         }
//     })

//     return intersections / unionSize
// }

// function isObjectUnique (obj, savedObjs){
//     return savedObjs.every(elem => jaccardIndex(obj, elem) < 1)
//  }

// function areSocialsTheSame(obj1, obj2){
//     return jaccardIndex(obj1, obj2) === 1
// }

// function buildDuplicityMap(objectList){
//     const duplicityMap = new Map()
//     for (const contactObject of objectList) {
//         for (const key in contactObject) {
//             if (Object.hasOwnProperty.call(contactObject, key)) {
//                 contactObject[key].forEach(elem => {
//                     if(!duplicityMap.get(elem)){
//                         duplicityMap.set(elem,1)
//                     }
//                     else{
//                         const num = duplicityMap.get(elem)
//                         duplicityMap.set(elem, num+1)
//                     }
//                 })
                
//             }
//         }
//     }

//     return duplicityMap
// }

// function isContactObjectEdgeCase(contactObject){
//     // it contains only uncertain phones
//     for (const key in contactObject) {
//         if (Object.hasOwnProperty.call(contactObject, key)) {
//             if(key === 'phonesUncertain')
//                 continue
//             else if(contactObject[key].length !== 0)
//                 return false
//         }
//     }

//     return true
// }


// function uniqueContactSubsetInheritance(parent, heirs, duplicityMap){
//     for (const key in parent) {
//         if (Object.hasOwnProperty.call(parent, key)) {
//             parent[key].forEach(contactUnit => {
//                 const unitCount = duplicityMap.get(contactUnit)
//                 if(unitCount == 1){
//                     if(heirs.length === 1){
//                         heirs[0][key].push(contactUnit);
//                     }
//                     if(heirs.length > 1){
//                         console.error("LONELY CONTACT: " + contactUnit)
//                     }
//                     // heirs.forEach(heir => heir[key].push(contactUnit))
//                 }
//                 else if(unitCount > 1){
//                     duplicityMap.set(contactUnit, unitCount - 1)
//                 }
//                 else{
//                     throw new Error("Empty Map even though contact exists (Map not synced!!)")
//                 }
//             })
            
//         }
//     }
    
// }