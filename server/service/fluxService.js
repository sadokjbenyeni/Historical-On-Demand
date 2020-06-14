
const https = require('https');
const xml2js = require('xml2js'); // XML2JS Module
const parser = new xml2js.Parser();

module.exports.getRate = (currency) => {
    return new Promise(function (resolve, reject) {
        https.get('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', res => {
            // if (err) { return console.log(err); }
            if (res.statusCode != 200) {
                return reject(new Error('statusCode = ' + res.statusCode))
            }
            res.on('data', function (body) {
                parser.parseString(body, (err, parsedData) => {
                    let tab = parsedData['gesmes:Envelope'].Cube[0].Cube[0].Cube;
                    resolve(search(currency, tab));
                });
            });
        })
    })
}
module.exports.getCube = () => {
    return new Promise(function (resolve, reject) {
        https.get('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', res => {
            // if (err) { return console.log(err); }
            if (res.statusCode != 200) {
                return reject(new Error('statusCode = ' + res.statusCode))
            }
            res.on('data', function (body) {
                parser.parseString(body, (err, parsedData) => {
                    let tab = parsedData['gesmes:Envelope'].Cube[0].Cube[0].Cube;
                    resolve(tab);
                });
            });
        })
    })
}
module.exports.search = (nameKey, myArray) => {
    return search(nameKey, myArray)
}
function search(nameKey, myArray) {
    if (nameKey.toUpperCase() === 'EUR') {
        return '1';
    }
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i]['$'].currency === nameKey.toUpperCase()) {
            return myArray[i]['$'].rate;
        }
    }
}
