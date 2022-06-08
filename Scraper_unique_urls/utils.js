const MAX_UNIQUE_CONTACTS = 10
const CONTACT_SCORES = {
    emails: 10,
    phones: 5,
    phonesUncertain: 0.5,
    otherwise: 1,
}
const MIN_RELEVANCE_SCORE = 11
module.exports = {
    isContentRelevant: function(obj) {
        let score = 0
        
        Object.keys(obj).forEach(elem => {
           const weight = CONTACT_SCORES[elem] ?? CONTACT_SCORES.otherwise
           if (obj[elem].length <= MAX_UNIQUE_CONTACTS){
               score += obj[elem].length * weight
           }
        })
    
        return score >= MIN_RELEVANCE_SCORE
    },
    isObjectUnique: function (obj, savedObjs){
       return savedObjs.every(elem => jaccardIndex(obj, elem) <= 0.5)
    }
}


// expect that the objects have the same keys
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

function isSocialEmpty(obj) {
    return Object.keys(obj).every(elem => obj[elem].length === 0)
}


const isSubset = (superObj, subObj) => {
    return Object.keys(subObj).every(ele => {
        if (subObj[ele].length > 0 && superObj[ele].length == 0) {
            return false
        }

       return subObj[ele].every((contact) => superObj[ele].includes(contact))
    })
}

function arrayUnion(arr1, arr2){
    return [...new Set([...arr1, ...arr2])]
}

function arrayIntersections(arr1, arr2){
    return arr1.filter(value => arr2.includes(value))
}


