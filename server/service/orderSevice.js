const mongoose = require('mongoose');
const Orders = mongoose.model('Order');

module.exports.updateOrderMetaData = (id, note,sales) => {
    Orders.findOne({ id: id })
        .then(orderToUpdate => {
            orderToUpdate.internalNote = note;
            orderToUpdate.sales = sales;

            Orders.update(
                { _id: orderToUpdate._id },
                { $set: orderToUpdate }).then(() => true)
        });
};
