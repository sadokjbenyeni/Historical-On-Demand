const mongoose = require('mongoose');
const OrderProductLog = mongoose.model('OrderProductLog');

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

module.exports = function (id, logger) {    
        this.orderId = id;
        this.logger = logger;
    
    this.addAllLogInUpdateOrder = function(orderProductLogs) {        
        if(orderProductLogs === undefined) {
            throw new Error('orderProductLogs cannot be null')
        }        
        if(Array.isArray(orderProductLogs)) {
            this.logger.info({ message: "updating list of product log ....", className: 'OrderProductLog Service' });
            return Promise.all(orderProductLogs.map((logs) => this.addLogInUpdateOrder(logs)));
        }
        else{
            return this.addLogInUpdateOrder(orderProductLogs);
        }
    }
    
    this.addLogInUpdateOrder = function(log) {
        this.logger.info({ message: "updating logs in product....", className: 'OrderProductLog Service' });
        this.logger.debug({ message: 'Logs: '+ JSON.stringify(log), className: 'OrderProductLog Service' });       
        //req.logger.info({ message: 'pushing the information in logs product for order...', className: 'orderProductLog API' });
        
        try {                
            logDbo = new OrderProductLog();            
            logDbo.id_undercmd = log.id_undercmd;
            logDbo.referer = log.referer;
            logDbo.status = log.status;
            logDbo.idUser = log.IdUser;
            logDbo.date = new Date();
            logDbo.log = log.log;
            logDbo.orderId = log.orderId;
            logDbo.productId = log.productId;
            this.logger.debug({ message: 'saving: '+ JSON.stringify(logDbo) + ' ...', className: 'OrderProductLog Service' });       
            return logDbo.save();
        }
        catch (error) {
            this.logger.error({ message: error.message, error: error, className: 'orderProductLog internal API' });
            throw err;
        }
    }

    this.Delete = async function(id_product)
    {
        try {
            this.logger.info({ message: "removing logs for '"+id_product+"' in product....", className: 'OrderProductLog Service' });
            await OrderProductLog.deleteMany({ id_undercmd: id_product }).exec();
        }
        catch(error){
            this.logger.error({ message: "Unhandle exception: " + error.message, error: error, className: 'OrderProductLog Service' });
            throw error;
        }
    }
}