const Orders = require('mongoose').orders;

module.exports.updateOrderNote = (id, note) => {
    Orders.findOne({ id: id })
        .then(orderToUpdate => {
            orderToUpdate.internalNote = note;
            Orders.update(
                { _id: orderToUpdate._id },
                { $set: orderToUpdate }).then(() => true)
        });
};
