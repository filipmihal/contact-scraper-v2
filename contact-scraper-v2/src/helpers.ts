import {SocialHandles} from '@crawlee/utils/internals/social'
function arrayUnion<T>(arr1: Array<T>, arr2: Array<T>){
    return [...new Set([...arr1, ...arr2])]
}

export const isSubset = (superObj: SocialHandles, subObj: SocialHandles) => {
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

export function isSocialEmpty(obj: SocialHandles) {
    return Object.keys(obj).every(elem => {
        const socialIndex = elem as keyof SocialHandles
        return obj[socialIndex].length === 0});
}

export function getNumberOfContactUnits(obj: SocialHandles){
    return Object.keys(obj).map(elem => {
        const socialIndex = elem as keyof SocialHandles
        return obj[socialIndex].length}).reduce((partailSum, len) => partailSum+len, 0)
}

export function havePropertyInCommon(obj1: SocialHandles, obj2: SocialHandles){
    for( const elem of Object.keys(obj1)) {
        const socialIndex = elem as keyof SocialHandles
        if(obj1[socialIndex].length > 0 && obj2[socialIndex].length > 0){
            return true
        }
    }
    return false
}

export function getContactObjectLength(obj: SocialHandles){
    let length = 0;
    for (const key in obj) {
        const socialKey = key as keyof SocialHandles;
        if (Object.hasOwnProperty.call(obj, key)) {
            length += obj[socialKey].length
        }
    }

    return length
}

function jaccardIndex (obj1: SocialHandles, obj2: SocialHandles){
    let unionSize = 0
    let intersections = 0
    Object.keys(obj1).forEach(elem => {
        const socialKey = elem as keyof SocialHandles;
        if(elem !== "phonesUncertain"){
            unionSize += arrayUnion(obj1[socialKey], obj2[socialKey]).length       
            intersections += arrayIntersections(obj1[socialKey], obj2[socialKey]).length
        }
    })

    return intersections / unionSize
}

export function isObjectUnique (obj: SocialHandles, savedObjs: SocialHandles[]){
    return savedObjs.every(elem => jaccardIndex(obj, elem) < 1)
 }

function areSocialsTheSame(obj1: SocialHandles, obj2: SocialHandles){
    return jaccardIndex(obj1, obj2) === 1
}

/**
 * Builds a map of contact units found on the website
 * @param objectList 
 * @returns Map<string, number> key of the map is a contact unit, value is the number of occurences 
 */
export function buildDuplicityMap(objectList: SocialHandles[]){
    const duplicityMap = new Map<string, number>()
    for (const contactObject of objectList) {
        for (const key in contactObject) {
            if (Object.hasOwnProperty.call(contactObject, key)) {
                const socialKey = key as keyof SocialHandles;
                contactObject[socialKey].forEach(elem => {
                    const count = duplicityMap.get(elem);
                    if(!count){
                        duplicityMap.set(elem,1)
                    }
                    else{
                        duplicityMap.set(elem, count+1)
                    }
                })
                
            }
        }
    }

    return duplicityMap
}

export function isContactObjectEdgeCase(contactObject: SocialHandles){
    // it contains only uncertain phones
    for (const key in contactObject) {
        const socialKey = key as keyof SocialHandles;
        if (Object.hasOwnProperty.call(contactObject, key)) {
            // if(key === 'phonesUncertain')
            //     continue
           if(contactObject[socialKey].length !== 0)
                return false
        }
    }

    return true
}


export function uniqueContactSubsetInheritance(parent: SocialHandles, heirs: SocialHandles[], duplicityMap: Map<string, number>){
    let isNewObj = false
    const trashlObject: SocialHandles = {
        emails: [],
        phones: [],
        phonesUncertain: [],
        linkedIns: [],
        twitters: [],
        instagrams: [],
        facebooks: [],
        youtubes: [],
        tiktoks: [],
        pinterests: [],
        discords: []
    }
    for (const key in parent) {
        if (Object.hasOwnProperty.call(parent, key)) {
            const socialKey = key as keyof SocialHandles;
            parent[socialKey].forEach(contactUnit => {
                const unitCount = duplicityMap.get(contactUnit);
                if(unitCount === undefined){
                    throw new Error('Index not found in duplicity map');
                }
                if(unitCount == 1){
                    if(heirs.length === 1){
                        heirs[0][socialKey].push(contactUnit);
                    }
                    if(heirs.length > 1){
                        duplicityMap.set(contactUnit, unitCount - 1)
                        trashlObject[socialKey].push(contactUnit)
                        isNewObj = true
                    }
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

    if(isNewObj)
        return trashlObject
}

function combineObjects(obj1: SocialHandles, obj2: SocialHandles): SocialHandles {
    const finalObject: SocialHandles = {
        emails: [],
        phones: [],
        phonesUncertain: [],
        linkedIns: [],
        twitters: [],
        instagrams: [],
        facebooks: [],
        youtubes: [],
        tiktoks: [],
        pinterests: [],
        discords: []
    }
    Object.keys(obj1).forEach(elem => {
        const socialKey = elem as keyof SocialHandles
        finalObject[socialKey] = arrayUnion(obj1[socialKey], obj2[socialKey])
    })
    
    return finalObject
}

export function groupSimilarObjects(contactObjects: SocialHandles[]): SocialHandles[] {
    const mutatedObjects = JSON.parse(JSON.stringify(contactObjects)) as SocialHandles[]
    const result = []

    for (let idx = 0; idx < mutatedObjects.length; idx++) {
        let isInserted = false
        for (let idx2 = idx+1; idx2 < mutatedObjects.length; idx2++) {
            
            if(jaccardIndex(mutatedObjects[idx], mutatedObjects[idx2]) >= 0.2){
                mutatedObjects[idx2] = combineObjects(mutatedObjects[idx], mutatedObjects[idx2])
                isInserted = true
                break
            }
        }
        if (!isInserted) {
            result.push(mutatedObjects[idx])
        }  
    }

    return result
}
