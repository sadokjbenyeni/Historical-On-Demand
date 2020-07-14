var moment = require('moment');
moment().format();

module.exports = function () {

    this.calenderFormat = function (dateToFormat, format = 'DD/MM/YYYY') {
        var formattedDate = moment(dateToFormat).format(format);
        return formattedDate;
    }
}