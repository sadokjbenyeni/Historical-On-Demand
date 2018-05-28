const app = require('express')();
const router = require('express').Router();
const request = require("request");
const mongoose = require('mongoose');

var tar = require('tar-fs')
var fs = require('fs')

const Order = mongoose.model('Order');

const config = require('../config/config.js');
const URLS = config.config();
const DOMAIN = config.domain();
const PAYMENTVERIFY = config.paymentVerify();
const PAYMENTSETUP = config.paymentSetup();
const PAYMENTKEY = config.paymentKey();


// Client Encryption Public Key : 10001|C958CBDFC34244F25D41E5B28DA3331CA52385EE3E73B2A51FD94D302CC135DD7DC49BE19EA66CCD00BAE7D26AF00BBB39C73351D4EACC10D7D023FE0ED844BD2D53FAFA9DE26D34373DB80278FB01BD00E27F0E922A3D7AB734D0AEFC48A78CAFA8F5D92FA2CBA08509F398FF9DA8B9AB909010622C6C1DB2933F8CAAD78D6AD9FCE5C46F1D679E83224A6B4B114757B81F5F62C109A5002C4FCC7EE7DA92C2762690835EAB446F4F86D88A903241E9F1930406DC01A4FEC4ED85666D7A1C99A7A46C4ADE83F7461428E6D11E78D86005732256AA632AF34E48990366FA85C463380F424294C81D16173279EB78EDF264422BFAC487CAD9C7A6E9F363AA481B
// test : https://test.adyen.com/hpp/cse/js/8215198215590909.shtml

// Library token (aka "PublicKeyToken") : 8215198215590909

// Facture du type QH_HISTO_000000n avec n auto-incrémental number

/* 
* Les états d'une commandes
* =========================
* 
* Durant le panier
* ----------------
* Pending Licensing Information : PLI
* Pending Billing Information : PBI
* Pending Submission by Client : PSC
* 
* Plateforme Quanthouse
* ---------------------
* Pending Validation by Compliance : PVC
* Pending Validation by Finance : PVF
* Pending Validation by Product : PVP
* 
* États d'avancement de la commande
* ---------------------------------
* Active : active
* Inactive : inactive
* Rejected : rejected
* Cancelled : cancelled
*/

router.post('/verify', (req, res) => {
  let options = {
    url: PAYMENTVERIFY,
    headers: { 
      'content-type': 'application/json',
      'X-API-Key': PAYMENTKEY
    },
    body: 
    { 
      'payload': req.body.payload
    }, json: true
  };
  request.post(options, function (error, response, body) {
    if (error) throw new Error(error);
    let log = body;
    log.date = new Date();
    autoValidation(body.merchantReference, log, body, res);
  });
});

router.post('/rib', (req, res) => {
  Order.updateOne( { id_cmd: req.body.idCmd }, { $set:{ 
    total: req.body.total,
    vatValue: req.body.vatValue,
    currency: req.body.currency,
    currencyTx: req.body.currencyTx,
    currencyTxUsd: req.body.currencyTxUsd
   } } )
  .then((r)=>{
    autoValidation(req.body.idCmd, {token: req.body.token, email: req.body.email, payment: 'RIB', date: new Date()}, {ok:true}, res);
  });
});


router.post('/autovalidation', (req,res) => {
  Order.findOne({ state: 'PVF' });
});


autoValidation = function(idCmd, logsPayment, r, res) {
  let state = '';
  let log = {};
  Order.findOne({ id_cmd: idCmd})
  .then(o => { // Autovalidation Compliance
    log.date = new Date();
    o.products.forEach(product=>{
      if(o.state !== 'PVC') {
        if( ( product.historical_data.backfill_agreement ||
          product.historical_data.backfill_applyfee || 
          o.survey[0].dd === "1") && 
          product.onetime === 1) {
            o.state = 'PVC';
            log.status = 'PVC';
            log.referer = 'Client';
        } else {
          o.validationCompliance = true;
          log.referer = 'Autovalidation';
          o.state = 'PVP';
          log.status = 'PVP';
        }
        if(o.state !== 'PVC') {
          if( ( product.historical_data.ongoing_agreement || 
            product.historical_data.ongoing_applyfee || 
            o.survey[0].dd === "1") && 
            product.subscription === 1) {
              o.state = 'PVC';
              log.status = 'PVC';
              log.referer = 'Client';
            } else {
            o.validationCompliance = true;
            log.referer = 'Autovalidation';
            log.status = 'PVP';
            o.state = 'PVP';
          }
        }
      }
    })
    return o;
  })
  .then(o => {
    let url = '/api/mail/newOrder';
    let corp = {};
    if(o.validationCompliance) {
      corp = { 
        "email": logsPayment.email,
        "idCmd": idCmd,
        "paymentdate": logsPayment.date,
        "token": logsPayment.token,
        "service": 'Compliance'
      };
    } else {
      corp = { 
        "email": logsPayment.email,
        "idCmd": idCmd,
        "paymentdate": logsPayment.date,
        "token": logsPayment.token,
        "service": 'Product'
      };
    }
    sendMail(url, corp);
    Order.updateOne( { id_cmd: idCmd }, { $push : { logsPayment: logsPayment, logs: log }, $set:{ validationCompliance: o.validationCompliance, submissionDate: new Date(), state: o.state } } )
    .then((rs)=>{
      res.status(201).json(rs);
    });
  });
}


router.post('/save', (req, res) => {

  let total = 0;

  if (req.body.cart.currency !== 'usd') {
    total = precisionRound(((req.body.cart.total / req.body.cart.currencyTxUsd) * req.body.cart.currencyTx), 2);
  } else{
    total = precisionRound(req.body.cart.total, 2);
  }

  Order.updateOne(
    { id_cmd: req.body.cart.idCmd },
    { 
    $set: { 
      total: req.body.cart.total,
      vatValue: req.body.cart.vatValue,
      currencyTx: req.body.cart.currencyTx,
      currencyTxUsd: req.body.cart.currencyTxUsd,
    }
  })
  .then(()=>{
    let options = {
      url: PAYMENTSETUP,
      headers: { 
        'content-type': 'application/json',
        'X-API-Key': PAYMENTKEY
      },
      body: 
      { 
        "amount": { "currency": req.body.cart.currency.toUpperCase(), "value": total*100 },
        "reference": req.body.cart.idCmd,
        "shopperReference": req.body.user.email,
        "channel": "Web",
        "html": true,
        "origin": DOMAIN,
        "returnUrl": DOMAIN +'/order/payment',
        "countryCode": req.body.user.countryBilling,
        "shopperLocale": "en-GB",
        "merchantAccount": "QUANTHOUSECOM"
      }, json: true
    };
    
    request.post(options, function (error, response, body) {
      if (error) throw new Error(error);
      return res.status(200).json(response);
    });
  })
});

router.put('/delProductCaddy', (req, res) => {
  Order.update(
    { id_cmd: req.body.id_cmd },
    { 
      $pull : { products: { id_undercmd: req.body.id_product } },
      $set: { totalExchangeFees: req.body.totalFees, totalHT: req.body.totalHT}
    })
    .then((r)=>{
      Order.findOne({ id_cmd: req.body.id_cmd }).then(v=>{
        if(v.products.length === 0){
          Order.remove({ id_cmd: req.body.id_cmd }).then(d=>{
            res.status(201).json({ok:true});
          })
        } else {
          res.status(201).json({ok:true});  
        }
      });
    })
});

router.put('/updtProductCaddy', (req, res) => {
  let updt = {};
  if(req.body.begin_date){
    updt["products.$.begin_date"] = req.body.begin_date;
  }
  if(req.body.end_date){
    updt["products.$.end_date"] = req.body.end_date;
  }
  if(req.body.period){
    updt["products.$.period"] = req.body.period;
  }
  if(req.body.ht){
    updt["products.$.ht"] = req.body.ht;
  }
  // if(req.body.totalHT){
  //   updt["totalHT"] = req.body.totalHT;
  // }
  if(req.body.status){
    updt["products.$.status"] = req.body.status;
  }
  Order.updateOne(
    { id_cmd: req.body.idCmd, 'products.id_undercmd': req.body.idElem },
    { $set :  updt }
  )
  .then((r)=>{
    Order.findOne({ id_cmd: req.body.idCmd }).then(p=>{
      let totalHT = 0;
      p.products.forEach(prd=>{
        totalHT += prd.ht;
      });
      return totalHT;
    }).then(o=>{
      Order.updateOne({ id_cmd: req.body.idCmd }, {$set:{totalHT: o}}).then(()=>{
        res.status(201).json({ok:true});
      });
    })
  })
});

router.put('/updtCaddy', (req, res) => {

  let updt = {};
  if(req.body.survey){
    updt.survey = req.body.survey;
  }
  if (req.body.discount) {
    updt.discount = req.body.discount;
  }
  if (req.body.totaux) {
    updt.totalExchangeFees = req.body.totaux.totalExchangeFees;
    updt.totalHT = req.body.totaux.totalHT;
    updt.currencyTx = req.body.totaux.currencyTx;
    updt.currencyTxUsd = req.body.totaux.currencyTxUsd;
    updt.currency = req.body.totaux.currency;
    updt.total = req.body.totaux.totalTTC;
  }  
  if(req.body.cart){
    
  }
  if(req.body.billing){
    updt.vat = req.body.billing.vat;
    updt.currency = req.body.billing.currency;
    updt.currencyTx = req.body.billing.currencyTx;
    updt.currencyTxUsd = req.body.billing.currencyTxUsd;
    updt.vatValide = req.body.billing.checkvat;
    updt.vatValue = req.body.billing.vatValue;
    updt.payment = req.body.billing.payment;
    updt.addressBilling = req.body.billing.addressBilling;
    updt.cityBilling = req.body.billing.cityBilling;
    updt.countryBilling = req.body.billing.countryBilling;
    updt.postalCodeBilling = req.body.billing.postalCodeBilling;
  }
  if(req.body.state){
    updt.state = req.body.state;
  }

  Order.updateOne( { id_cmd: req.body.idCmd }, { $set :  updt } )
  .then((r)=>{
    res.status(201).json({ok:true});
  });
});

router.put('/state', (req, res) => {
  let updt = {};
  let log = {};
  let corp = {};
  updt.state = req.body.status;
  log.status = req.body.status;
  log.referer = req.body.referer;
  dateref = new Date();
  datedebref = new Date();
  dateFinref = new Date();
  log.date = dateref;
  if(req.body.referer === 'Compliance'){
    updt.validationCompliance = true;
    corp = { 
      "email": req.body.email,
      "idCmd": req.body.idCmd,
      "paymentdate": new Date(),
      "service": 'Product'
    };
    sendMail('/api/mail/newOrder', corp);
  }
  if(req.body.referer === 'Product'){
    updt.validationProduct = true;
    corp = { 
      "email": req.body.email,
      "idCmd": req.body.idCmd,
      "paymentdate": new Date(),
      "service": 'Finance'
    };
    sendMail('/api/mail/newOrder', corp);
  }
  if(req.body.referer === 'Finance'){
    updt.validationFinance = true;
    let deb = datedebref;
    deb = verifWeek(deb);
    let end = dateFinref;
    let cart = [];
    req.body.product.forEach(p=>{
      p.dataset = p.quotation_level;
      p.exchangeName = p.exchange;
      if(p.subscription === 1) {
        end.nextMonth(p.period);
        end = verifWeekNext(end);
        p.begin_date = deb;
        p.end_date = end;
      } else {
        p.begin_date = p.begin_date_select;
        p.end_date = p.end_date_select;        
      }
      cart.push(p);
      updt.products = cart;
    });
    corp = { 
      "email": req.body.email,
      "idCmd": req.body.idCmd
    };
    sendMail('/api/mail/orderValidated', corp);
  }
  Order.updateOne( { id_cmd: req.body.idCmd }, { $set: updt, $push: {logs: log} } )
  .then((r)=>{
    res.status(201).json({ok:true});
  });
})

router.put('/update', (req, res) => {
  Order.findOne({_id: req.body.idcmd.id_cmd})
  .then((updt)=>{
    updt.id_cmd=  updt.id + "-" + req.body.u.user.companyName.replace(' ','').toLowerCase() + "-" + new Date().yyyymmdd().replace(/-/g,'');
    // updt.id_cmd=  "cmd-" + req.body.idcmd.id_cmd;
    if(req.body.state){
      updt.state = req.body.state;
    }
    if(req.body.cart){
      let idx = 1;
      if (updt.products.length > 0) {
        idx = parseInt(updt.products[updt.products.length - 1].id_undercmd.split('-')[2]) + 1;
      }
      req.body.cart.forEach((elem) => {
        updt.totalExchangeFees += parseInt(elem.backfill_fee);
        updt.totalExchangeFees += parseInt(elem.ongoing_fee);
        updt.totalHT += parseInt(elem.ht);
        updt.products.push({
          "idx" : elem.idx,
          "index" : elem.index,
          "id_undercmd" : updt.id_cmd + "-" + idx++,
          // "id_undercmd" : "cmd-" + req.body.idcmd.id_cmd + "-" + idx++,
          "dataset" : elem.quotation_level,
          "description" : elem.description,
          "pricingTier" : elem.pricingTier,
          "price" : elem.price,
          "backfill_fee" : parseInt(elem.backfill_fee),
          "ongoing_fee" : parseInt(elem.ongoing_fee),
          "ht" : parseInt(elem.ht),
          "onetime" : elem.onetime,
          "subscription" : elem.subscription,
          "period" : elem.period,
          "contractid" : elem.contractid,
          "eid" : elem.eid,
          "qhid" : elem.qhid,
          "symbol" : elem.symbol,
          "historical_data" : elem.historical_data,
          "exchangeName" : elem.exchange,
          "assetClass" : elem.assetClass,
          "mics" : elem.mics,
          "begin_date_ref" : elem.begin_date,
          "end_date_ref" : elem.end_date,
          "begin_date" : elem.begin_date_select,
          "end_date" : elem.end_date_select,
          "status" : elem.status,
          "logs" : [
            {
              referer: "client",
              status: elem.status,
              date: new Date()
            }
          ]
        });
      });
    }
    if(req.body.u.user){
      updt.companyName = req.body.u.user.companyName;
      updt.companyType = req.body.u.user.companyType;
      updt.region = req.body.u.user.region;
      updt.job = req.body.u.user.job;
      updt.firstname = req.body.u.user.firstname;
      updt.lastname = req.body.u.user.lastname;
      updt.email = req.body.u.user.email;
      updt.phone = req.body.u.user.phone;
      updt.website = req.body.u.user.website;
      updt.address = req.body.u.user.address;
      updt.city = req.body.u.user.city;
      updt.country = req.body.u.user.country;
      updt.postalCode = req.body.u.user.postalCode;
      updt.addressBilling = req.body.u.user.addressBilling;
      updt.cityBilling = req.body.u.user.cityBilling;
      updt.countryBilling = req.body.u.user.countryBilling;
      updt.postalCodeBilling = req.body.u.user.postalCodeBilling;
      updt.vat = req.body.u.user.vat;
      // updt.vatValide = req.body.u.user.vatValide;
      updt.payment = req.body.u.user.payment;
      updt.currency = req.body.u.user.currency;
      // updt.currencyTx = req.body.user.currencyTx;
    }
    if(req.body.survey){
      updt.survey = req.body.survey;
    }
  
    Order.update(
      { _id: req.body.idcmd.id_cmd },
      { $set : updt })
      .then((r)=>{
        return res.status(201).json({ok:true});
      }
    // Order.update(
    //   { _id: req.body.idcmd.id_cmd },
    //   { $set : updt }, 
    //   { $inc: { id_cmd: 1 } } )
    //   .then((r)=>{
    //     return res.status(201).json({ok:true});
    //   }
    );
  });
});

router.post('/usercaddy', (req, res) => {
  const states = ['CART', 'PLI', 'PBI', 'PSC'];
  Order.find({idUser: req.body.id, state: { $in : states }}, {id_cmd:true, state: true})
  .then((cmd)=>{
    if(cmd.length > 0 && states.indexOf(cmd.state)){
      return res.status(200).json({id_cmd: cmd[0]._id});
    } else {
      let order = new Order();
      // Order.count({idUser: req.body.id}).then(count=>{
      //   order.id = count + 1;
      //   order.idUser = req.body.id;
      //   order.save((err, c)=>{
      //     if (err) return console.error(err);
      //     return res.status(200).json({id_cmd: c._id});
      //   });
      // });

      Order.find({}, {id:1}).sort({'id':-1}).limit(1).then(count=>{
        console.dir(count);
        if(count.length > 0) {
          order.id = count[0].id + 1;
        } else {
          order.id = 1;
        }
        order.idUser = req.body.id;
        order.save((err, c)=>{
          if (err) return console.error(err);
          return res.status(200).json({id_cmd: c._id});
        });
      });

    }
  });
});

router.get('/:id', (req, res) => {
  Order.find({idUser: req.params.id})
  .then((cmd)=>{
    return res.status(200).json({cmd: cmd});
  });
});

router.get('/idCmd/:id', (req, res) => {
  Order.findOne({_id: req.params.id})
  .then((cmd)=>{
    return res.status(200).json({cmd: cmd});
  });
});


router.post('/list', (req, res) => {
  let sort = {};
  sort.createdAt = -1;
  sort[req.body.columns[req.body.order[0].column].data] = req.body.order[0].dir;
  Order.count({state: {$ne:''}, state: {$exists:true}}).then((c) => {
      let search = {};
      search['state'] = { $ne: '' };
      search['state'] = { $exists: true };
      if(req.body.state){
        search['state'] = req.body.state;
      }
      req.body.columns.forEach(s => {
        if(s.data === 'redistribution' && s.search.value !== '') {
          search['survey.dd'] =  s.search.value;
        } else if(s.data === 'updatedAt' && s.search.value !== '') {
          let d = s.search.value.split('|');
          search['updatedAt'] =  { $gte: new Date(d[0]), $lt: new Date(d[1]) };
        } else if(s.data === 'id' && s.search.value !== '') {
          search[s.data] =  parseInt(s.search.value);
        } else if ((s.data === 'total' || s.data === 'discount') && s.search.value !== '') {
          search[s.data] = parseFloat(s.search.value);
        } else if (s.search.value !== '') {
          search[s.data] = new RegExp(s.search.value, "i");
        }
      });
      
      if (req.body.search.value !== '') {
          search = { 
            '$or': [
              { state: new RegExp(req.body.search.value, "i") },
              { companyName: new RegExp(req.body.search.value, "i") },
              { id_cmd: new RegExp(req.body.search.value, "i") }
            ]
          };
      }
      Order.count(search).then((cf) => {
        Order.find(search)
          .skip(req.body.start)
          .limit(req.body.length)
          .sort(sort)
          .then((orders) => {
              if (!orders) { return res.status(404); }
              return res.status(200).json({recordsFiltered: cf, recordsTotal: c, draw:req.body.draw, listorders: orders});
          });
      });
  });

});

router.post('/caddies', (req, res) => {
    Order.find({idUser: req.body.id, state: { $in: ['CART', 'PLI', 'PBI', 'PSC'] }})
    .then((cmd)=>{
      return res.status(200).json({cmd: cmd});
    });
});

sendMail = function(url, corp) {
  let options = {
    url: DOMAIN + url,
    headers: {
      'content-type': 'application/json',
    },
    body: corp, json: true
  };
  request.post(options, function (error, response, body) {
    if (error) throw new Error(error);
  });
}

Date.prototype.previousDay = function() {
  this.setDate(this.getDate() - 1);
  return this;
};

Date.prototype.nextDay = function() {
  this.setDate(this.getDate() + 1);
  return this;
};

Date.prototype.nextMonth = function(period) {
  this.setMonth(this.getMonth() + period);
  return this;
};

verifWeek = function(dt) {
  dt.previousDay();
  while(dt.getDay() === 0 || dt.getDay() === 6){
    dt.previousDay();
  }
  return dt;
};

verifWeekNext = function(dt) {
  dt.nextDay();
  while(dt.getDay() === 0 || dt.getDay() === 6){
    dt.nextDay();
  }
  return dt;
};

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1;
  var dd = this.getDate();
  return [ this.getFullYear(), (mm>9 ? '' : '0') + mm,(dd>9 ? '' : '0') + dd ].join('');
};

idcommande = function(prefix, id, nbcar) {
	idf = prefix;
    let nbid = nbcar - id.toString().length;

    for (let i = 0; i < nbid; i++){
        idf+= "0";
    }
    idnew =  id + 1;
    idf += idnew;
    return idf;
}

precisionRound = function(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

module.exports = router;