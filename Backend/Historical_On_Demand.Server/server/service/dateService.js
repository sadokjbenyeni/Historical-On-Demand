var moment = require('moment');
moment().format();

module.exports = function () {

    this.calenderFormat = function (dateToFormat, format = 'DD/MM/YYYY') {
        return moment(dateToFormat).format(format);
    }
}