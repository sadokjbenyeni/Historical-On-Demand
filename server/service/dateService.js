module.exports = function () {

    this.calenderFormat = function (dateToFormat) {
        return moment(dateToFormat).format('DD/MM/YYYY');
    }
}