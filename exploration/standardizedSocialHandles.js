const Apify = require('apify')

module.exports = {
    parseHandlesFromHtml
}

function standardizeEmail(email){
    // update email according to official standards
    return email.toLowerCase().replace(/(\.+)(?=.*@)/g, '')
}

function filterEmails(emails){
    const emailSet = new Set()
    emails.forEach(email => {
        emailSet.add(standardizeEmail(email))
    })

    return Array.from(emailSet)
}

function standardizePhoneNumber(number){
    return number.replace(/\.|-|\)|\(|\+|\s/g, '')
}

function filterPhoneNumbers(phoneNumbers, uncertainPhoneNumbers){
    const numbersMap = new Map()
    phoneNumbers.forEach((number) => {
        const stdNumber = standardizePhoneNumber(number)
        const currentNumber = numbersMap.get(stdNumber)
        const newNumber = number.length > currentNumber.length ? number : currentNumber
        numbersMap.set(stdNumber, newNumber)
    })

    const newUncertain = []
    uncertainPhoneNumbers.forEach((uncertainNumber) => {
        if(!numbersMap.get(standardizePhoneNumber(uncertainNumber))){
            newUncertain.push(uncertainNumber)
        }
    })

    return {
        uncertainPhoneNumbers: newUncertain, phoneNumbers: Array.from(numbersMap.values()) 
    }
}

function parseHandlesFromHtml(html, data = null) {
    const parsedHandles = Apify.utils.parseHandlesFromHtml(html, data)
    parsedHandles.emails = filterEmails(parsedHandles.emails)

    const newNumbers = filterPhoneNumbers(parsedHandles.phones, parsedHandles.phonesUncertain)    
    parsedHandles.phones = newNumbers.phoneNumbers
    parsedHandles.phonesUncertain = newNumbers.uncertainPhoneNumbers

    return parsedHandles
}
