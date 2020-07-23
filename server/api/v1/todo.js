const app = require('express')();
const router = require('express').Router();
const request = require("request");
const mongoose = require('mongoose');

const config = require('../../config/config.js');
const LOCALDOMAIN = config.localdomain();

const Order = mongoose.model('Order');
const User = mongoose.model('User');
const Pool = mongoose.model('Pool');
const randtoken = require('rand-token');

const OrderProductLogService = require('../../service/orderProductLogService');

router.param('cmd', function (req, res, next, id) {
   return res.sendStatus(422);
});


// API à appeler pour récupérer les traitement à effectuer
router.get('/', (req, res) => {
  Pool.find({
    $or:[
        {
            onetime: 1,
            status:{
              $in:["validated", "exporting"]
            }
        },
        {
            subscription:1,
            status:{
                $in:["validated", "exporting"]
            },
            searchdate: { $lte: new Date() }
        }
    ]
  })
  .then(result=>{
    res.status(200).json(result);
  });
});

router.post('/retry', (req,res)=>{
  updatePool(req.body.id_cmd, "validated");
    res.status(200).json({ok:"ok"});
});
router.put('/retryrunning', (req,res)=>{
  Pool.updateOne({id_cmd: req.body.id_cmd, begin_date: req.body.begin_date, status: "running"},{ $set: { status: "validated" } }).then(p=>{ return true;});
  res.status(200).json({ok:"ok"});
});

router.post('/verifFailed', (req,res)=>{
  let d = new Date();
  d.setHours(d.getHours() - 48);
  Pool.find({
    status: "failed", updatedAt: { $lte: d }
  })
  .then((cmd)=>{
    let error = false;
    cmd.forEach((c) => {
      try {
        var mailer = new OrderMailService(req.logger, { id: c.id_cmd.split("-")[0] });
        mailer.orderFailed({
          idCmd: c.id_cmd.split("-")[0],
          email: c.email
        });
      }
      catch(error){
        req.logger.error({message: "Error during mailing." + error.message, className: 'Mailer API'});
        error = true;
      }
      // sendMail('/api/mail/orderFailed', 
      // {
      //   idCmd: c.id_cmd.split("-")[0],
      //   email: c.email
      // });
    });
    if(error)
    {
      return res.status(500).json({reason: "An error has been thrown during the mailing, please contact support with '"+ req.headers.loggerToken + "'", mail:false});
    }
    return res.status(200);
  });
});

router.post('/verifInactive', (req,res)=>{
  // let d = new Date();
  // d.setHours(d.getHours() - 48);
  // Pool.find({
  //   status: "failed", updatedAt: { $lte: d }
  // })
  // .then((cmd)=>{
  //   cmd.forEach((c) => {
  //     sendMail('/api/mail/orderFailed', 
  //     {
  //       idCmd: c.id_cmd.spli("-")[0],
  //       email: c.email
  //     });
  //   });
  // });
});

// API Permettant au JOB de changer le status du pool qu'il souhaite traiter : running, exporting
router.put('/torun', (req, res) => {
  Order.updateOne(
    { 'products.id_undercmd'  : req.body.id_cmd.split('|')[0] },
    {
      $set: { 'products.$.status' : req.body.status }
    }
  )
  .then((p)=>{
    if(p.nModified === 1){
      updatePool(req.body.id_cmd, req.body.status, req.body.begin_date);
      res.status(201).json({"ok":"ok"});
    }
    else {
      res.status(404).json({"error":"NOT FOUND"});
    }
  })
  .catch( (err)=>{
    res.json(err);
  });
});

// API Permettant en cas de scratch serveur JOB ou arrêt/redémarrage de JOB de repêcher les pools en status running
// Traitement à effectuer en premier au lancement ou relancement du JOB
router.get('/running', (req, res) => {
  Pool.find({status:{ $in:["running"] }}).then(result => {
    res.status(200).json(result);
  })
  .catch( (err)=>{
    res.status(200).json(err);
  });
});


// API Permettant de valider ou non l'export et de mettre à jour la commande soit avec le status active ou failed.
// Cette appel dépile le Pool
router.put('/finish', async (req, res) => {
  req.logger.info({ message: "finish calling...", className: "TODO API"});
  let status = '';
  var id_cmd = req.body.id_cmd.split('|')[0];
  var order = await Order.findOne( { products: { $elemMatch: { "id_undercmd": id_cmd } } }, { "id":true, "email": true, 'products.$': true, _id:false  }).exec();
  var recup = {};
  if(!order || order.products.length === 0){
    req.logger.warn({ message: "order not found", className: 'Todo API'});
    return res.status(404).json({"error":"NOT FOUND"});
  }
  else {
    let products = order.products[0];
    if(products.subscription === 1){
      status = 'active';
    } else {
      status = req.body.status;
    }
    recup = {status: status, req: req.body, email: order.email, id: order.id, onetime: products.onetime, subscription: products.subscription, mailActive: order.mailActive};
  }    
  let updateValues = { 'products.$.status' : recup.status };
  updateValues.state = recup.status;
  if(recup.status === "active" && recup.mailActive) {
    req.logger.info({ message: "sending email....", className: 'Todo API'});
    var mailer = new OrderMailService(req.logger, { id: recup.id });
    mailer.orderExecuted({ email: recup.email });
    updateValues.mailActive = false;
  }
  req.logger.info({ message: "updating order "+ id_cmd + "....", className: 'Todo API'});
  await Order.updateMany({ 'products.id_undercmd': id_cmd },
    { $set: updateValues, 
      $push: { "products.$.links": { createLinkDate: new Date(), status: req.body.status, links: req.body.link, path: req.body.id_cmd, nbDownload: 0 } } })
             .exec();
  let identifiers = id_cmd.split('§');             
  try {
    updateLogsForOrder(id_cmd, req, order, identifiers);
  }
  catch(error){
    req.logger.error({ message: error.message, className: 'Todo API'});
    req.logger.error({ message: JSON.stringify(error), className:'Todo API'});
  }
  try {
    let lks = req.body.begin_date;
    if(req.body.begin_date === undefined || req.body.begin_date === '')
    {
      lks = req.body.link[0].link.split("|")[0].split("_")[0];
    }
    if(req.body.status === 'active') {
      if(req.body.subscription === 1) {        
        removePool(req.body.id_cmd, lks, order.onetime, order.subscription, req.logger);
      } else {
        removePool(req.body.id_cmd, lks, order.onetime, order.subscription, req.logger);
      }
    }
    if(req.body.status === 'failed'&& order.onetime === 1) {
      updatePool(req.body.id_cmd, req.body.status, req.body.begin_date);
      var users = await User.find({roleName:"Product"},{email:true, _id:false}).exec();
      users.forEach(user => {
        var mailer = new OrderMailService(req.logger, { id: req.body.id_cmd });
        mailer.orderFailedJob({
          idCmd: req.body.id_cmd,
          email: user.email,
          description: req.body.state_description,
          date: new Date(),
          logs: req.body.log
        });
      });      
    }
    if(req.body.status === 'failed' && order.onetime === 0) {
      removePool(req.body.id_cmd, lks, order.onetime, order.subscription, req.logger);
    }
    return res.status(200).json({"ok":"ok"});
  }  
  catch(err) {
    req.logger.error({ message: err.message, className: 'Todo API' });
    req.logger.error({ message: JSON.stringify(error), className:'Todo API'});
    return res.json(err);
  }
});

updateOrderProductLogs = ((url, logs, logger, loggerToken) => { 
  logger.debug({ message: 'Logs: '+ JSON.stringify(logs), className: 'Todo API' });       
  let options = {
    url: LOCALDOMAIN + url,
    headers: {
      'content-type': 'application/json',
      'internal': loggerToken,
      json:true
    },
    body: JSON.stringify(logs)
  };
    request.put(options, function (error, response, body) {
      if(error) {
        logger.error({ message: 'Cannot push the logs information in database; ' + error, className: 'Todo API'});
        logger.error({ message: JSON.stringify(error), className:'Todo API'});
        logger.warn({ message: JSON.stringify(response), className: 'Todo API' });        
        logger.debug({ message: JSON.stringify(logs), className: 'Todo API' });
      }
    });
  });


addPool = (data => {
  Pool.findOne({ id_cmd: data.id_cmd, begin_date: data.begin_date }).then(p=>{
    if(!p){
      Pool.create(data).then(p=>{ return true;});
    }
  });
});

updatePool = (async (id, status, date) => {
  try {
    await Pool.updateMany({id_cmd: id, begin_date: date},{ $set: { status: status } }).exec();
    return  true;
  }
  catch(error){
    logger.error({ message: error.message, className: 'Todo API'});
    logger.error({ message: JSON.stringify(error), className:'Todo API'});
    return false;
  }
});

removePool = (async (id, beginDate, onetime, subscription, logger) => {
  
    if(subscription === 1) {
      await Pool.deleteMany({id_cmd: id, begin_date: beginDate}).exec();
    } else if(onetime === 1) {
      await Pool.deleteMany({id_cmd: id}).exec();
    }
    else {
      logger.warn("Pool is not onetime and not subscription { id_cmd: "+id+ ", begin_date: "+ beginDate+ " }");
      await Pool.deleteMany({id_cmd: id, begin_date: beginDate}).exec();
    }
    return true;
  
});

Date.prototype.previousDay = function() {
  this.setDate(this.getDate() - 1);
  return this;
};

Date.prototype.nextDay = function() {
  this.setDate(this.getDate() + 1);
  return this;
};

verifWeek = function(dt) {
  dt.previousDay();
  while(dt.getDay() === 0 || dt.getDay() === 6){
    dt.previousDay();
  }
  return dt;
};

Date.prototype.yyyymmdd = function() {
  let mm = this.getMonth() + 1; // getMonth() is zero-based
  let dd = this.getDate();

  return [
    this.getFullYear(),
    (mm>9 ? '-' : '-0') + mm,
    (dd>9 ? '-' : '-0') + dd
  ].join('');
};

yyyymmdd = function(d) {
  let dat = d.split('-');
  let mm = parseInt(dat[1]);
  let dd = parseInt(dat[2]);

  return [
    dat[0],
    (mm>9 ? '-' : '-0') + mm,
    (dd>9 ? '-' : '-0') + dd
  ].join('');
};

function updateLogsForOrder(id_cmd, req, order, identifiers) {
  let logs = {};
  logs.id_undercmd = id_cmd;
  logs.referer = 'job';
  logs.status = req.body.status;
  logs.state_description = req.body.state_description;
  logs.idUser = order.IdUser;
  logs.date = new Date();
  logs.log = req.body.log;
  logs.extract = req.body.link;
  logs.orderId = order.id;
  logs.productId = identifiers[1];
  logs.identifier = id_cmd.split('§');
  req.logger.info({ message: "updating logs in product....", className: 'Todo API' });
  new OrderProductLogService(logs.orderid, req.logger).AddFinishLogsInProduct(logs);
}

module.exports = router;
