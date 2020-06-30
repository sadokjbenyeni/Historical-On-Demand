
const verifyVat = require('validate-vat');


module.exports.isVatValid = async (country, number) => {
    return new Promise((resolve, reject) => {
        verifyVat(country, number, function (err, result) {
            if (err) {
                resolve(false);
            }
            else {
                resolve(result.valid);
            }
        });
    })
}
