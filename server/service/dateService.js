var moment = require('moment');
moment().format();

module.exports = function () {

    this.calenderFormat = async function (dateToFormat, format = 'DD/MM/YYYY') {
        return moment(dateToFormat).format(format);
    }
}