import { social } from 'crawlee';


function standardizeEmail(email: string){
	// update email according to official standards
	return email.toLowerCase().replace(/(\.+)(?=.*@)/g, '')
}

function filterEmails(emails: string[]): string[]{
	const emailSet: Set<string> = new Set()
	emails.forEach(email => {
		emailSet.add(standardizeEmail(email))
	})

	return Array.from(emailSet)
}

function standardizePhoneNumber(number: string){
	return number.replace(/\.|-|\)|\(|\+|\s/g, '')
}

function filterPhoneNumbers(phoneNumbers: string[], uncertainPhoneNumbers: string[]){
	const numbersMap = new Map()
	phoneNumbers.forEach((number) => {
		const stdNumber = standardizePhoneNumber(number)
		const currentNumber = numbersMap.get(stdNumber) ?? ''
		const newNumber = number.length > currentNumber.length ? number : currentNumber
		numbersMap.set(stdNumber, newNumber)
	})

	const newPhoneNumbers = Array.from(numbersMap.values())

	const newUncertain: string[] = []
	uncertainPhoneNumbers.forEach((uncertainNumber) => {
		const standardUncertain = standardizePhoneNumber(uncertainNumber)

		if(!numbersMap.get(standardUncertain)){
			newUncertain.push(uncertainNumber)
			numbersMap.set(standardUncertain, uncertainNumber)
		}
	})

	return {
		uncertainPhoneNumbers: newUncertain, phoneNumbers: newPhoneNumbers
	}
}

export function parseStandardHandlesFromHtml(html:string, data = null) {
	const parsedHandles = social.parseHandlesFromHtml(html, data)
	parsedHandles.emails = filterEmails(parsedHandles.emails)

	const newNumbers = filterPhoneNumbers(parsedHandles.phones, parsedHandles.phonesUncertain)    
	parsedHandles.phones = newNumbers.phoneNumbers
	parsedHandles.phonesUncertain = newNumbers.uncertainPhoneNumbers

	return parsedHandles
}

//     emails: ["fifo.mihal@gmail.com", "Fifomihal@gmail.com", "unique@wwe.gmail.com"],
//     phones: ["(415)-789-7802", "+1(415)-789-7804"],
//     phonesUncertain: ["4157897802", "987654321"]

// console.log(parseHandlesFromHtml(a))
