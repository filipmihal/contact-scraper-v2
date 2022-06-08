const URLS= require('./unique_url.json'); 

let finalURLs = []

for(const domain in URLS){
    finalURLs = finalURLs.concat(URLS[domain])
}

for(const url of finalURLs){
    console.log(url)
}

console.log(finalURLs.length)