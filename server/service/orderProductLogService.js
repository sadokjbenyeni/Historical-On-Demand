const mongoose = require('mongoose');
const Orders = mongoose.model('OrderProductLog');

module.exports.updateProductLogsByOrder = (id, productsLogs) => {
    Orders.findOne({ id: id })
        .then(orderToUpdate => {
            orderToUpdate.internalNote = note;
            orderToUpdate.sales = sales;
            orderToUpdate.type=type

            Orders.update(
                { _id: orderToUpdate._id },
                { $set: orderToUpdate }).then(() => true)
        });
};

class orderProductLogService {

    constructor(id) {
        this.orderId = id;
    }
    
    add(productsLogs) {
       if(productsLogs.isArray()) 
       {
            productsLogs.foreach(item => 
                {
                    addLog(item);
                });
            return;
       }
       addLog(productsLogs);
    }

    addLog(logDto)
    {
        OrderProductLog.save({
            referer: 'job',
            ref: logDto.id_cmd,
            extract: logDto.link,
            status: logDto.status,
            state_description: logDto.state_description,
            log: logDto.log,
            date: new Date(),
            orderId: logDto.orderId,
            id_cmd: logDto.id_cmd,
            productId: req.idx,
            idUser: logDto.idUser,
            log: logDto.log,
        })
    }
}