module.exports = function () {

    this.calenderFormat = async function (dateToFormat, format = 'DD/MM/YYYY') {
        return moment(dateToFormat).format(format);
    }
}