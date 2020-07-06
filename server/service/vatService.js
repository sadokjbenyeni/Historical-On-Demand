
const verifyVat = require('validate-vat');
const countryService = require('./countryService')

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
module.exports.applyVat = async (country, vatNumber) => {
    if (country == "FR")
        return true;
    const isvatvalid = await this.isVatValid(vatNumber.substring(0, 2), vatNumber.substring(2, vatNumber.length));
    const isUe = await countryService.isUe(country);
    return ((!isvatvalid && isUe.ue == 1))

}
