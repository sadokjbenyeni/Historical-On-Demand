const app = require('express')();
const router = require('express').Router();
const request = require("request");
const mongoose = require('mongoose');

var tar = require('tar-fs')
var fs = require('fs')

const Config = mongoose.model('Config');
const Order = mongoose.model('Order');
const Pool = mongoose.model('Pool');
const User = mongoose.model('User');

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

router.post('/logPayement', (req, res) => {
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
    body.date = new Date();
    Order.updateOne( { id_cmd: body.merchantReference }, { $push : { logsPayment: body} } )
    .then((rs)=>{
      res.status(201).json(rs);
    });
  });
});

router.post('/rib', (req, res) => {
  // Order.updateOne( { id_cmd: req.body.idCmd }, { $set:{ 
  //   total: req.body.total,
  //   vatValue: req.body.vatValue,
  //   currency: req.body.currency,
  //   currencyTx: req.body.currencyTx,
  //   currencyTxUsd: req.body.currencyTxUsd
  //  } } )
  // .then((r)=>{
    autoValidation(req.body.idCmd, {token: req.body.token, email: req.body.email, payment: 'RIB', date: new Date()}, {ok:true}, res);
  // });
});


router.post('/autovalidation', (req,res) => {
  Order.findOne({ state: 'PVF' });
});


autoValidation = function(idCmd, logsPayment, r, res) {
  let state = '';
  let log = {};
  let url = '/api/mail/newOrder';
  let corp = {};
Order.findOne({ id_cmd: idCmd})
  .then(o => { // Autovalidation Compliance
    log.date = new Date();
    let eids = [];
    o.products.forEach(product=>{
      eids.push(product.eid);
      if(o.state === 'PSC') {
        corp = { 
          "email": o.email,
          "idCmd": o.id,
          "paymentdate": logsPayment.date,
          "token": logsPayment.token,
          "service": 'Compliance'
        };
        sendMail(url, corp);
        if( ( (product.historical_data && (product.historical_data.backfill_agreement ||
          product.historical_data.backfill_applyfee) ) || 
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
          // Envoi email aux products
        }
      }
    })
    o.eid = eids;
    return o;
  })
  .then(o => {
    let url = '/api/mail/newOrder';
    let corp = {};
    if(o.state === "PVC") {
      // Envoi email aux compliances
      User.find({roleName:"Compliance"},{email:true, _id:false})
      .then((users)=>{ users.forEach(user => {
        sendMail('/api/mail/newOrderHoD', 
          {
            idCmd: corp.idCmd,
            email: user.email,
            lastname: o.lastname,
            firstname: o.firstname,
            eid: o.eid.join(),
            date: logsPayment.date,
            total : totalttc(o),
            service: "Compliance"
          });
        });
      });
    }
    if(o.state === "PVP") {
      // Envoi email aux products
      User.find({roleName:"Product"},{email:true, _id:false})
      .then((users)=>{ users.forEach(user => {
        sendMail('/api/mail/newOrderHoD', 
          {
            idCmd: corp.idCmd,
            email: user.email,
            lastname: o.lastname,
            firstname: o.firstname,
            eid: o.eid.join(),
            date: logsPayment.date,
            total : totalttc(o),
            service: "Product"
          });
        });
      });
    }
    if(o.state === "PVF") {
      // Envoi email aux finances
      User.find({roleName:"Finance"},{email:true, _id:false})
      .then((users)=>{ users.forEach(user => {
        sendMail('/api/mail/newOrderHoD', 
          {
            idCmd: corp.idCmd,
            email: user.email,
            lastname: o.lastname,
            firstname: o.firstname,
            eid: o.eid.join(),
            date: logsPayment.date,
            total : totalttc(o),
            service: "Finance"
          });
        });
      });
    }
    if(o.validationCompliance) {
      corp = { 
        "email": o.email,
        "idCmd": o.id,
        "paymentdate": logsPayment.date,
        "token": logsPayment.token,
        "service": 'Product'
      };
    } else {
      corp = { 
        "email": logsPayment.email,
        "idCmd": o.id,
        "paymentdate": logsPayment.date,
        "token": logsPayment.token,
        "service": 'Finance'
      };
    }
    // if(o.state === 'PSC'){ sendMail(url, corp); }
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

  if(req.body.action === "periodupdt"){
    updt.totalHT = req.body.ht;
    req.body.cart.forEach(rb=>{
      updt["products.$.period"] = rb.period;
      updt["products.$.ht"] = rb.ht;
      Order.updateOne(
        { id_cmd: req.body.idCmd, 'products.id_undercmd': rb.idElem },
        { $set :  updt }
      ).catch(error=>{
        res.status(200).json({ok:false, error: error});
      });
    });
    res.status(201).json({ok:true});
  } else {
    Order.updateOne( { id_cmd: req.body.idCmd }, { $set :  updt } )
    .then((r)=>{
      res.status(201).json({ok:true});
    });
  }
});

router.put('/state', (req, res) => {
  let updt = {};
  let log = {};
  let corp = {};
  let prefixe = "QH_HISTO_";
  let nbcar = 7;
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
    // sendMail('/api/mail/newOrder', corp);
    // Email validation au pvp
    Order.findOne({ id_cmd : req.body.idCmd})
    .then(o => {
      let eids = [];
      o.products.forEach(p => {
        eids.push(p.eid);
      });
      User.find({roleName:"Product"},{email:true, _id:false})
      .then((users)=>{ users.forEach(user => {
        sendMail('/api/mail/newOrderHoD', 
          {
            idCmd: o.id,
            email: user.email,
            lastname: o.lastname,
            firstname: o.firstname,
            eid: eids.join(),
            date: o.submissionDate,
            total : totalttc(o),
            service: "Product"
          });
        });
      });
    });
  }
  if(req.body.referer === 'Product'){
    updt.validationProduct = true;
    updt.reason = req.body.reason;
    corp = { 
      "email": req.body.email,
      "reason" : req.body.reason,
      "idCmd": req.body.id,
      "paymentdate": new Date(),
      "service": 'Finance'
    };
    // Email validation au pvf
    Order.findOne({ id_cmd : req.body.idCmd})
    .then(o => {
      let eids = [];

      if (req.body.status === "cancelled") {
        Pool.remove({ id: req.body.idCmd.split("-")[0] }).then(()=>{ 
          return true;
        });
      }

      if( req.body.status === 'rejected' ) {
        sendMail('/api/mail/orderRejected', corp);
        return true;
      }
      if( req.body.status === 'cancelled' ) {
        sendMail('/api/mail/orderCancelled', corp);
        return true;
      }

      o.products.forEach(p => {
        eids.push(p.eid);
      });
      if(req.body.status !== "cancelled"){
        User.find({roleName:"Product"},{email:true, _id:false})
        .then((users)=>{ users.forEach(user => {
          sendMail('/api/mail/newOrderHoD', 
            {
              idCmd: o.id,
              email: user.email,
              lastname: o.lastname,
              firstname: o.firstname,
              eid: eids.join(),
              date: o.submissionDate,
              total : totalttc(o),
              service: "Finance"
            });
          });
        });
      }
    });
    // sendMail('/api/mail/newOrder', corp);
  }
  if(req.body.referer === 'Finance' || req.body.referer === "ProductAutovalidateFinance"){
    updt.validationFinance = true;
    updt.reason = req.body.reason;
    let deb = datedebref;
    deb = verifWeek(datedebref);
    let debut = new Date(clone(deb));
    let end = dateFinref;
    let cart = [];
    let id = "";
    let item = "";
    req.body.product.forEach(p=>{
      p.dataset = p.quotation_level;
      p.exchangeName = p.exchange;
      if(p.subscription === 1) {
        end = new Date(endperiod(deb, p.period));
        end = verifWeekNext(end);
        p.begin_date = deb;
        p.end_date = end;
        let qhid = "";
        if (p.qhid !== null || p.qhid !== "") {
          qhid = p.qhid.toString();
        }
        let c = 0;
        for(let d= debut; d<= end; d.setDate(d.getDate() + 1)){ 
          id = p.id_undercmd.split("-")[0];
          suffixe = p.id_undercmd.split("§")[1];
          addPool({
            index: p.index,
            id: req.body.id,
            id_cmd: p.id_undercmd + '|' + c++,
            onetime: p.onetime,
            subscription: p.subscription,
            eid: p.eid,
            contractID: p.contractid,
            qhid: qhid,
            quotation_level: p.dataset,
            searchdate: new Date(d.yyyymmdd()),
            begin_date: d.yyyymmdd(),
            end_date: d.yyyymmdd(),
            status: req.body.status // peut prendre activated, toretry, nodata, active, inactive
          });
        }
        debut = new Date(clone(deb));
      } else {
        p.begin_date = p.begin_date_select;
        p.end_date = p.end_date_select;
        let qhid = "";
        if (p.qhid !== null || p.qhid !== "") {
          qhid = p.qhid.toString();
        }
        addPool({
          // index: p.index,
          id: req.body.id,
          id_cmd: p.id_undercmd,
          onetime: p.onetime,
          subscription: p.subscription,
          eid: p.eid,
          contractID: p.contractid,
          qhid: qhid,
          quotation_level: p.dataset,
          searchdate: p.begin_date,
          begin_date: yyyymmdd(p.begin_date),
          end_date: yyyymmdd(p.end_date),
          status: req.body.status // peut prendre activated, toretry, nodata, active, inactive
        });
      }
      cart.push(p);
      updt.products = cart;
    });
    corp = { 
      "email": req.body.email,
      "idCmd": req.body.id
    };
    sendMail('/api/mail/orderValidated', corp);
  // }
  // if(req.body.referer === 'Finance' || req.body.referer === "ProductAutovalidateFinance"){
    Config.findOne({id:"counter"}).then( (cnt) => {
      let id = cnt.value;
      let prefix = "QH_HISTO_";
      let nbcar = 7;
      let nbid = nbcar - id.toString().length;
      for (let i = 0; i < nbid; i++){
        prefix+= "0";
      }
      idnew =  id + 1;
      updt.idCommande = prefix + idnew.toString();
      Config.updateOne({id:"counter"}, {$inc:{value:1}}).then(()=>{
        Order.updateOne( { id_cmd: req.body.idCmd }, { $set: updt, $push: {logs: log} } )
        .then((r)=>{
          pdfpost(req.body.id);
          res.status(201).json({ok:true});
        });
      })
    });
  }
  else {
    Order.updateOne( { id_cmd: req.body.idCmd }, { $set: updt, $push: {logs: log} } )
    .then((r)=>{
      res.status(201).json({ok:true});
    });
  }
})

too = function(d){
  Pool.findOne({ id_cmd: d.id_cmd, begin_date: d.begin_date }).then(p=>{
    console.dir(p.isNew);
    // if(!p){
      Pool.create(d).then(pa=>{ return true;});
    // }
  });
}
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
        idx = parseInt(updt.products[updt.products.length - 1].id_undercmd.split('§')[1]) + 1;
      }
      req.body.cart.forEach((elem) => {
        updt.totalExchangeFees += parseFloat(elem.backfill_fee);
        updt.totalExchangeFees += parseFloat(elem.ongoing_fee);
        updt.totalHT += parseFloat(elem.ht);
        updt.products.push({
          "idx" : elem.idx,
          "index" : elem.index,
          "id_undercmd" : updt.id_cmd + "§" + idx++,
          // "id_undercmd" : "cmd-" + req.body.idcmd.id_cmd + "-" + idx++,
          "dataset" : elem.quotation_level,
          "description" : elem.description,
          "pricingTier" : elem.pricingTier,
          "price" : elem.price,
          "backfill_fee" : parseFloat(elem.backfill_fee),
          "ongoing_fee" : parseFloat(elem.ongoing_fee),
          "ht" : parseFloat(elem.ht),
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
      Order.find({}, {id:1}).sort({'id':-1}).limit(1).then(count=>{
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

router.post('/', (req, res) => {
  Order.find({idUser: req.body.user})
  .sort({id:req.body.sort})
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

router.get('/retry/:id', (req, res) => {
  Pool.updateOne({id_cmd: req.params.id},{ $set: { status: "validated" } }).then(p=>{ return true;})
  .then(()=>{
    return res.status(200).json({ok: "ok"});
  });
});


router.post('/listExport', (req, res) => {
  let sort = {};
  sort.id = 1;
    let search = {};
    Order.find(req.body)
      .sort(sort)
      .then((orders) => {
          if (!orders) { return res.status(404); }
          var list = [];
          orders.forEach(order => {
            let o = {};
            o["Invoice_ID"] =  order.id;
            o["Client_ID"] =  order.idUser;
            o["Client_Name"] = order.companyName + ": "+order.firstname+ " "+ order.lastname;
            o["Client_Country"] =  order.country;
            o["Order_Date"] =  order.submissionDate;
            if(order.validationFinance){
              order.logs.forEach(lo=>{
                if(lo.referer === "Finance"){
                  o["Payment_Date"] =  lo.date;// (validation by Finance)
                }
              });
            }
            o["Order_Currency"] =  order.currency;
            o["Order_Amount_Before_Taxes"] =  order.totalHT;
            o["Exchange_Fees"] =  order.totalExchangeFees;
            o["VAT"] =  order.vatValue;
            var pay = '';
            if(order.payment === 'creditcard'){
              if(order.logsPayment){
                order.logsPayment.forEach(ord=>{
                  if(ord && ord.authResponse === 'Authorised'){
                    pay = ord.pspReference;
                  }
                })
              }
            }
            o["Payment_Method"] =  order.payment;
            o["Payment_Reference"] =  pay;
            o["TOTAL_Order_Amount"] =  order.total;// CB : mettre la référence Adyen
            list.push(o);
          });
          return res.status(200).json(list);
      });
});
router.post('/list', (req, res) => {
  let sort = {};
  for (var i = 0; i < req.body.order.length; i++) {
    if( req.body.columns[req.body.order[i].column].data === 'redistribution' )
      sort['survey.dd'] = req.body.order[i].dir;
    else
      sort[req.body.columns[req.body.order[i].column].data] = req.body.order[i].dir;
  }
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
        } else if(s.data === 'submissionDate' && s.search.value !== '') {
          let d = s.search.value.split('|');
          search['submissionDate'] =  { $gte: new Date(d[0]), $lt: new Date(d[1]) };
        } else if(s.data === 'id' && s.search.value !== '') {
          search[s.data] =  parseInt(s.search.value);
        } else if ((s.data === 'total' || s.data === 'discount') && s.search.value !== '') {
          search[s.data] = parseFloat(s.search.value);
        } else if (s.search.value !== '') {
          search[s.data] = new RegExp(s.search.value, "i");
        }
      });
      if (req.body.search.value !== '') {
        search['$or'] = [
              { state: new RegExp(req.body.search.value, "i") },
              { companyName: new RegExp(req.body.search.value, "i") },
              { id_cmd: new RegExp(req.body.search.value, "i") }
          ];
      }
      Order.count(search).then((cf) => {
        Order.find(search)
          .skip(req.body.start)
          .limit(req.body.length)
          .collation({ locale: "en" })
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

pdfpost = function(id){
  let options = {
    url: DOMAIN + '/api/pdf',
    headers: {
      'content-type': 'application/json',
    },
    body: {
      id: id
    },
    json: true
  };
  request.post(options, function (error, response, body) {
    if (error) throw new Error(error);
  });
}

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


idcommande = function(prefix, nbcar) {
  Config.findOne({id:"counter"}).then( (cnt) => {
    let id = cnt.value;
    let nbid = nbcar - id.toString().length;
    for (let i = 0; i < nbid; i++){
      prefix+= "0";
    }
    idnew =  id + 1;
    prefix += idnew;
    Config.updateOne({id:"counter"}, {$inc:{value:1}}).then(()=>{
      return prefix;
    })
  });
}

endperiod = function(data, periode){
  let dateclone = new Date(clone(data));
  return dateclone.setMonth(dateclone.getMonth()+periode);
}

precisionRound = function(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

totalttc = function(o) {
  let totalExchangeFees = 0;
  let discount = 0;
  let totalVat = 0;
  let totalHT = 0;
  let totalTTC = 0;

  if (o.currency !== 'usd') {
    totalExchangeFees = (o.totalExchangeFees / o.currencyTxUsd) * o.currencyTx;
    discount = o.discount;
    totalHT = ( (o.totalHT + o.totalExchangeFees) / o.currencyTxUsd) * o.currencyTx;
    if(discount>0){
      totalHT = totalHT - ( totalHT * (discount / 100) );
    }
    totalVat = totalHT * o.vatValue;
    totalTTC = precisionRound((totalHT * (1 + o.vatValue)), 2);
  } else{
    totalExchangeFees = o.totalExchangeFees;
    discount = o.discount;
    totalHT = o.totalHT + o.totalExchangeFees;
    if(discount>0){
      totalHT = totalHT - ( totalHT * (discount / 100) );
    }
    totalVat = totalHT * o.vatValue;
    totalTTC = precisionRound((totalHT * (1 + o.vatValue)), 2);
  }
  return totalTTC;
}

addPool = function(data) {
  Pool.findOne({ id_cmd: data.id_cmd, begin_date: data.begin_date }).then(p=>{
    if(!p){
      Pool.create(data).then(p=>{ return true;});
    }
  });
};


clone = function(obj){
  try{
      var copy = JSON.parse(JSON.stringify(obj));
  } catch(ex){
      alert("variable cloning error");
  }
  return copy;
}

module.exports = router;