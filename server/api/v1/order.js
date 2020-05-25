
const router = require('express').Router();
const request = require("request");
const mongoose = require('mongoose');

const Config = mongoose.model('Config');
const Order = mongoose.model('Order');
const Pool = mongoose.model('Pool');
const User = mongoose.model('User');
const Currency = mongoose.model('Currency');

const config = require('../../config/config.js');

const DOMAIN = config.domain();
const LOCALDOMAIN = config.localdomain();
const PAYMENTVERIFY = config.paymentVerify();
const PAYMENTSETUP = config.paymentSetup();
const PAYMENTKEY = config.paymentKey();

const OrderService = require('../../service/orderService');

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
    Order.updateOne({ id_cmd: body.merchantReference }, { $push: { logsPayment: body } })
      .then((rs) => {
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

  autoValidation(req.body.idCmd, { token: req.body.token, email: req.body.email, payment: 'RIB', date: new Date() }, { ok: true }, res);
  // });
});


router.post('/autovalidation', (req, res) => {
  Order.findOne({ state: 'PVF' });
});




router.post('/save', (req, res) => {

  let total = 0;

  if (req.body.cart.currency !== 'usd') {

    total = precisionRound(((req.body.cart.total / req.body.cart.currencyTxUsd) * req.body.cart.currencyTx), 2);
  } else {

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
    .then(() => {
      let options = {
        url: PAYMENTSETUP,
        headers: {
          'content-type': 'application/json',
          'X-API-Key': PAYMENTKEY
        },
        body:
        {
          "amount": { "currency": req.body.cart.currency.toUpperCase(), "value": total * 100 },
          "reference": req.body.cart.idCmd,
          "shopperReference": req.body.user.email,
          "channel": "Web",
          "html": true,
          "origin": DOMAIN,
          "returnUrl": DOMAIN + '/order/payment',
          "countryCode": req.body.user.countryBilling,
          "shopperLocale": "en-GB",
          "merchantAccount": "QUANTHOUSECOM"
        }, json: true
      };


      request.post(options, function (error, response, body) {
        if (error) throw new Error(error);
        return res.status(200).json(response);
      });
    });
});

router.put('/delProductCaddy', (req, res) => {
  Order.update(
    { id_cmd: req.body.id_cmd },
    {
      $pull: { products: { id_undercmd: req.body.id_product } },
      $set: { totalExchangeFees: req.body.totalFees, totalHT: req.body.totalHT }
    })

    .then((r) => {
      Order.findOne({ id_cmd: req.body.id_cmd }).then(v => {

        if (v.products.length === 0) {

          Order.remove({ id_cmd: req.body.id_cmd }).then(d => {
            res.status(201).json({ ok: true });
          });
        } else {
          res.status(201).json({ ok: true });
        }
      });
    });
});

router.put('/updtProductCaddy', (req, res) => {
  let updt = {};
  if (req.body.begin_date) {
    updt["products.$.begin_date"] = req.body.begin_date;
  }
  if (req.body.end_date) {
    updt["products.$.end_date"] = req.body.end_date;
  }
  if (req.body.period) {
    updt["products.$.period"] = req.body.period;
  }
  if (req.body.ht) {
    updt["products.$.ht"] = req.body.ht;
  }
  // if(req.body.totalHT){
  //   updt["totalHT"] = req.body.totalHT;
  // }
  if (req.body.status) {
    updt["products.$.status"] = req.body.status;
  }
  Order.updateOne(
    { id_cmd: req.body.idCmd, 'products.id_undercmd': req.body.idElem },
    { $set: updt }
  )

    .then((r) => {
      Order.findOne({ id_cmd: req.body.idCmd }).then(p => {
        let totalHT = 0;

        p.products.forEach(prd => {
          totalHT += prd.ht;
        });
        return totalHT;
      }).then(o => {
        Order.updateOne({ id_cmd: req.body.idCmd }, { $set: { totalHT: o } }).then(() => {
          res.status(201).json({ ok: true });
        });
      });
    });
});

router.put('/updtCaddy', (req, res) => {

  let updt = {};
  if (req.body.survey) {
    updt.survey = req.body.survey;
  }
  if (req.body.discount) {
    updt.discount = req.body.discount.percent;
  }
  if (req.body.totaux) {
    updt.totalExchangeFees = req.body.totaux.totalExchangeFees;
    updt.totalHT = req.body.totaux.totalHT;
    updt.currencyTx = req.body.totaux.currencyTx;
    updt.currencyTxUsd = req.body.totaux.currencyTxUsd;
    updt.currency = req.body.totaux.currency;
    updt.total = req.body.totaux.totalTTC;
  }
  if (req.body.billing) {
    updt.vat = req.body.billing.vat;
    updt.currency = req.body.billing.currency;
    updt.currencyTx = req.body.billing.currencyTx;
    updt.currencyTxUsd = req.body.billing.currencyTxUsd;
    updt.vatValide = req.body.billing.vatValide;
    updt.vatValue = req.body.billing.vatValue;
    updt.payment = req.body.billing.payment;
    updt.addressBilling = req.body.billing.addressBilling;
    updt.cityBilling = req.body.billing.cityBilling;
    updt.countryBilling = req.body.billing.countryBilling;
    updt.postalCodeBilling = req.body.billing.postalCodeBilling;
  }
  if (req.body.state) {
    updt.state = req.body.state;
  }

  if (req.body.action === "periodupdt") {
    updt.totalHT = req.body.ht;
    req.body.cart.forEach(rb => {
      updt["products.$.period"] = rb.period;
      updt["products.$.ht"] = rb.ht;
      Order.updateOne(
        { id_cmd: req.body.idCmd, 'products.id_undercmd': rb.idElem },
        { $set: updt }
      ).catch(error => {
        res.status(200).json({ ok: false, error: error });
      });
    });
    res.status(201).json({ ok: true });
  } else {
    Order.updateOne({ id_cmd: req.body.idCmd }, { $set: updt })

      .then((r) => {
        res.status(201).json({ ok: true });
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
  if (req.body.referer === 'Compliance') {
    updt.validationCompliance = true;
    corp = {
      "email": req.body.email,
      "idCmd": req.body.idCmd,
      "paymentdate": new Date(),
      "service": 'Product'
    };
    // sendMail('/api/mail/newOrder', corp);
    // Email validation au pvp
    Order.findOne({ id_cmd: req.body.idCmd })
      .then(order => {
        let eids = [];

        order.products.forEach(p => {
          eids.push(p.eid);
        });
        User.find({ roleName: "Product" }, { email: true, _id: false })
          .then((users) => {
            users.forEach(user => {

              sendMail('/api/mail/newOrderHoD',
                {
                  idCmd: order.id,

                  email: user.email,

                  lastname: order.lastname,

                  firstname: order.firstname,
                  eid: eids.join(),

                  date: order.submissionDate,

                  total: totalttc(order),
                  service: "Product"
                });
            });
          });
      });
  }
  if (req.body.referer === 'Product') {
    updt.validationProduct = true;
    updt.reason = req.body.reason;
    corp = {
      "email": req.body.email,
      "reason": req.body.reason,
      "idCmd": req.body.id,
      "paymentdate": new Date(),
      "service": 'Finance'
    };
    // Email validation au pvf
    Order.findOne({ id_cmd: req.body.idCmd })
      .then(order => {
        let eids = [];

        if (req.body.status === "cancelled") {
          Pool.remove({ id: req.body.idCmd.split("-")[0] }).then(() => {
            return true;
          });
        }

        if (req.body.status === 'rejected') {

          sendMail('/api/mail/orderRejected', corp);
          return true;
        }
        if (req.body.status === 'cancelled') {

          sendMail('/api/mail/orderCancelled', corp);
          return true;
        }


        order.products.forEach(p => {
          eids.push(p.eid);
        });
        if (req.body.status !== "cancelled") {
          User.find({ roleName: "Product" }, { email: true, _id: false })
            .then((users) => {
              users.forEach(user => {

                sendMail('/api/mail/newOrderHoD',
                  {
                    idCmd: order.id,

                    email: user.email,

                    lastname: order.lastname,

                    firstname: order.firstname,
                    eid: eids.join(),

                    date: order.submissionDate,

                    total: totalttc(order),
                    service: "Finance"
                  });
              });
            });
        }
      });
    // sendMail('/api/mail/newOrder', corp);
  }
  if (req.body.referer === 'Finance' || req.body.referer === "ProductAutovalidateFinance") {
    updt.validationFinance = true;
    updt.reason = req.body.reason;

    let deb = datedebref;

    deb = verifWeek(datedebref);

    let debut = new Date(clone(deb));

    let end = dateFinref;
    let cart = [];
    let id = "";

    let item = "";
    req.body.product.forEach(p => {
      if (!p.print) { //actual product lines without Exchange fees
        p.dataset = p.quotation_level;
        p.exchangeName = p.exchange;
        if (p.subscription === 1) {

          end = new Date(endperiod(deb, p.period));

          end = verifWeekNext(end);
          p.begin_date = deb;
          p.end_date = end;
          let qhid = "";
          if (p.qhid !== null || p.qhid !== "") {
            qhid = p.qhid.toString();
          }

          let c = 0;
          for (let d = debut; d <= end; d.setDate(d.getDate() + 1)) {
            id = p.id_undercmd.split("-")[0];

            suffixe = p.id_undercmd.split("§")[1];

            addPool({
              index: p.index,
              id: req.body.id,
              // id_cmd: id + "§" + suffixe,
              // id_cmd: p.id_undercmd + '|' + c++,
              id_cmd: p.id_undercmd,
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
            index: p.index,
            id: req.body.id,
            id_cmd: p.id_undercmd,
            // id_cmd: p.id_undercmd + '|' + c++,
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
      }
    });
    corp = {
      "email": req.body.email,
      "idCmd": req.body.id
    };

    sendMail('/api/mail/orderValidated', corp);
  }
  if (req.body.referer === 'Finance' || req.body.referer === "ProductAutovalidateFinance") {
    Config.findOne({ id: "counter" }).then((cnt) => {

      let id = cnt.value;
      let prefix = "QH_HISTO_";
      let nbcar = 7;
      let idnew = id + 1;
      let nbid = nbcar - idnew.toString().length;
      for (let i = 0; i < nbid; i++) {
        prefix += "0";
      }
      updt.idCommande = prefix + idnew.toString();
      Config.updateOne({ id: "counter" }, { $inc: { value: 1 } }).then(() => {
        Order.updateOne({ id_cmd: req.body.idCmd }, { $set: updt, $push: { logs: log } })

          .then((r) => {

            pdfpost(req.body.id);
            res.status(201).json({ ok: true });
          });
      });
    });
  }
  else {
    Order.updateOne({ id_cmd: req.body.idCmd }, { $set: updt, $push: { logs: log } })

      .then((r) => {
        res.status(201).json({ ok: true });
      });
  }
});

router.put('/update', (req, res) => {
  var currencies = [];
  Currency.find({})
    .then((curs) => {
      currencies = curs;

      Order.findOne({ _id: req.body.idcmd.id_cmd })
        .then((updt) => {

          updt.id_cmd = updt.id + "-" + req.body.u.user.companyName.replace(' ', '').toLowerCase() + "-" + new Date().yyyymmdd().replace(/-/g, '');
          if (req.body.state) {

            updt.state = req.body.state;
          }
          if (req.body.cart) {
            let idx = 1;

            if (updt.products.length > 0) {

              idx = parseInt(updt.products[updt.products.length - 1].id_undercmd.split('§')[1]) + 1;
            }
            req.body.cart.forEach((elem) => {

              if (elem.backfill_fee !== 0) {
                let a_backfillfee = (elem.backfill_fee).split(' ');
                switch (a_backfillfee[1]) {
                  case 'USD':
                    elem.backfill_fee = parseFloat(a_backfillfee[0]);
                    break;
                  default:
                    elem.backfill_fee = parseFloat(a_backfillfee[0]);
                    for (let i = 0; i < currencies.length; i++) {
                      if (currencies[i]['device'] === 'USD') {
                        elem.backfill_fee = elem.backfill_fee * currencies[i]['taux'];
                      } else if (currencies[i]['device'] === a_backfillfee[1]) {
                        elem.backfill_fee = elem.backfill_fee / currencies[i]['taux'];
                      }
                    }
                }
              }
              if (elem.ongoing_fee !== 0) {
                let a_ongoingfee = (elem.ongoing_fee).split(' ');
                switch (a_ongoingfee[1]) {
                  case 'USD':
                    elem.ongoing_fee = parseFloat(a_ongoingfee[0]);
                    break;
                  default:
                    elem.ongoing_fee = parseFloat(a_ongoingfee[0]);
                    for (let i = 0; i < currencies.length; i++) {
                      if (currencies[i]['device'] === 'USD') {
                        elem.ongoing_fee = elem.ongoing_fee * currencies[i]['taux'];
                      } else if (currencies[i]['device'] === a_ongoingfee[1]) {
                        elem.ongoing_fee = elem.ongoing_fee / currencies[i]['taux'];
                      }
                    }
                }
              }


              updt.totalExchangeFees += parseFloat(elem.backfill_fee);

              updt.totalExchangeFees += parseFloat(elem.ongoing_fee);

              updt.totalHT += parseFloat(elem.ht);

              updt.products.push({
                "idx": elem.idx,
                "index": elem.index,
                "id_undercmd": updt.id + "§" + idx++,
                // "id_undercmd" : "cmd-" + req.body.idcmd.id_cmd + "-" + idx++,
                "dataset": elem.quotation_level,
                "description": elem.description,
                "pricingTier": elem.pricingTier,
                "price": elem.price,
                "backfill_fee": parseFloat(elem.backfill_fee),
                "ongoing_fee": parseFloat(elem.ongoing_fee),
                "ht": parseFloat(elem.ht),
                "onetime": elem.onetime,
                "subscription": elem.subscription,
                "period": elem.period,
                "contractid": elem.contractid,
                "eid": elem.eid,
                "qhid": elem.qhid,
                "symbol": elem.symbol,
                "historical_data": elem.historical_data,
                "exchangeName": elem.exchange,
                "assetClass": elem.assetClass,
                "mics": elem.mics,
                "begin_date_ref": elem.begin_date,
                "end_date_ref": elem.end_date,
                "begin_date": elem.begin_date_select,
                "end_date": elem.end_date_select,
                "status": elem.status,
                "logs": [
                  {
                    referer: "client",
                    status: elem.status,
                    date: new Date()
                  }
                ]
              });
            });
          }

          if (req.body.u.user && (updt.vatValide === null)) {

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

            updt.submissionDate = new Date();
            
            updt.vat = req.body.u.user.vat;
            // updt.vatValide = req.body.u.user.vatValide;

            updt.payment = req.body.u.user.payment;

            updt.currency = req.body.u.user.currency;
            // updt.currencyTx = req.body.user.currencyTx;
            for (var i = 0; i < currencies.length; i++) {

              if (currencies[i]['id'] === updt.currency) {

                updt.currencyTx = currencies[i]['taux'];
              }
              if (currencies[i]['id'] === 'usd') {

                updt.currencyTxUsd = currencies[i]['taux'];
              }
            }
          }
          if (req.body.survey) {

            updt.survey = req.body.survey;
          }
          Order.update(
            { _id: req.body.idcmd.id_cmd },
            { $set: updt })

            .then((r) => {
              return res.status(201).json({ ok: true });
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
});

router.post('/usercaddy', (req, res) => {
  const states = ['CART', 'PLI', 'PBI', 'PSC'];
  Order.find({ idUser: req.body.id, state: { $in: states } }, { id_cmd: true, state: true })
    .then((cmd) => {

      if (cmd.length > 0 && states.indexOf(cmd.state)) {
        return res.status(200).json({ id_cmd: cmd[0]._id });
      } else {
        let order = new Order();
        Order.find({}, { id: 1 }).sort({ 'id': -1 }).limit(1).then(count => {
          if (count.length > 0) {
            order.id = count[0].id + 1;
          } else {
            order.id = 1;
          }

          order.idUser = req.body.id;
          order.save((err, c) => {
            if (err) {
              req.logger.error({ message: err.message, className: 'Order API', error: error});
              return console.error(err);
            }
            return res.status(200).json({ id_cmd: c._id });
          });
        });

      }
    });
});


router.get('/listStates', (req, res) => {
  let states = [
    { id: 'CART', name: 'Cart' },
    { id: 'PLI', name: 'Pending Licensing Information' },
    { id: 'PBI', name: 'Pending Billing Information' },
    { id: 'PSC', name: 'Pending Submission by Client' },
    { id: 'PVP', name: 'Pending Validation by Product' },
    { id: 'PVC', name: 'Pending Validation by Compliance' },
    { id: 'PVF', name: 'Pending Validation by Finance' },
    { id: 'validated', name: 'Validated' },
    { id: 'active', name: 'Active' },
    { id: 'inactive', name: 'Inactive' },
    { id: 'cancelled', name: 'Cancelled' },
    { id: 'rejected', name: 'Rejected' },
    { id: 'failed', name: 'Failed' },
  ];
  return res.status(200).json({ states: states });
});

router.get('/:id', (req, res) => {
  Order.findOne({ _id: req.params.id })
      .then((cmd) => {
          return res.status(200).json({ cmd: cmd });
      });
});

router.get('/', (req, res) => {
  if (!req.headers.authorization) {
    // console.error(new Date() + " | [" + req.headers.loggerToken + "] | Order API | Access denied at this resource");
    req.logger.error({ message: "Access denied at this resource", className: "Order API"});
    return res.status(401).json({ message: 'Access denied at this resource, please contact the support with ticket identifier: ' + req.headers.loggerToken })
  }
  User.findOne({ token: req.headers.authorization }, { _id: true })
      .then((result) => {
          Order.find({ idUser: result._id })
              .collation({ locale: "en" })
              .then((orders) => {
                  orders = clientOrders(orders);
                  return res.status(200).json({ listorders: orders });
              });
      });
});

router.get('/details/:id', async (req, res) => {
  if (!req.headers.authorization) {
      return res.status(401);
  }
  var user = await User.findOne({ token: req.headers.authorization }, { _id: true }).exec();
  var order = await Order.findOne({ idUser: user._id, _id: req.params.id }).exec();
  if(!order)
  {
      return res.status(200);
  }
  try {
      order = clientOrderDetails(order);
  }
  catch (error) {
      req.logger.error({ error: error, message: error.message, className: "Order API"});
      // console.error("[" + req.headers.loggerToken + "] unhandle exception: " + error);
      return res.status(503).json({ message: "an error has been raised please contact support with this identifier [" + req.headers.loggerToken + "]" });
  }
  return res.status(200).json({ details: order });
})

clientOrders = function (orders) {

  return orders.map(order => {
      const container = {};

      container._id = order._id;
      container.id = order.id;
      container.idCommande = order.idCommande;
      container.submissionDate = order.submissionDate;
      container.state = order.state;
      container.totalHT = order.totalHT;
      container.currency = order.currency;
      container.totalExchangeFees = order.totalExchangeFees;
      container.currencyTxUsd = order.currencyTxUsd;
      container.currencyTx = order.currencyTx;
      container.discount = order.discount;
      container.vatValue = order.vatValue;
      return container;
  });
}

clientOrderDetails = function (order) {
  if (!order) {
      return {};
  }
  const container = {};
  container._id = order._id;
  container.id = order.id;
  container.idCommande = order.idCommande;
  container.submissionDate = order.submissionDate;
  container.payment = order.payment;
  container.state = order.state;
  container.companyName = order.companyName;
  container.firstname = order.firstname;
  container.lastname = order.lastname;
  container.job = order.job;
  container.countryBilling = order.countryBilling;
  container.products = order.products;
  container.products.forEach(product => {
      product.logs = null;
  });
  container.currency = order.currency;
  container.currencyTx = order.currencyTx;
  container.currencyTxUsd = order.currencyTxUsd;
  container.discount = order.discount;
  container.totalExchangeFees = order.totalExchangeFees;
  container.totalHT = order.totalHT;
  container.total = order.total;
  container.idFacture = order.idFacture;
  container.vat = order.vat;
  container.vatValide = order.vatValide;
  container.vatValue = order.vatValue;
  return container;
}


router.get('/:id', (req, res) => {
  Order.find({ idUser: req.params.id })
    .then((cmd) => {
      return res.status(200).json({ cmd: cmd });
    });
});

router.post('/', (req, res) => {
  Order.find({ idUser: req.body.user })
    .sort({ id: req.body.sort })
    .then((cmd) => {
      return res.status(200).json({ cmd: cmd });
    });
});

router.get('/idCmd/:id', (req, res) => {
  Order.findOne({ _id: req.params.id })
    .then((cmd) => {
      return res.status(200).json({ cmd: cmd });
    });
});

router.get('/retry/:id/:export', (req, res) => {
  var currentProduct;
  Order.findOne(
    { "products": { $elemMatch: { id_undercmd: req.params.id } } }
  ).then((o) => {

    o.products.forEach(p => {
      if (p.id_undercmd === req.params.id) {
        p.id_undercmd = o.id + "§" + p.idx;
        currentProduct = p;
      }
    });
    Order.updateOne(

      { id_cmd: o.id_cmd },
      {

        $set: { products: o.products }
      }
    ).then(() => {
      currentProduct.begin_date = currentProduct.begin_date_select;
      currentProduct.end_date = currentProduct.end_date_select;
      let qhid = "";
      if (currentProduct.qhid !== null || currentProduct.qhid !== "") {
        qhid = currentProduct.qhid.toString();
      }
      let data = {
        id: o.id,
        id_cmd: currentProduct.id_undercmd,
        onetime: currentProduct.onetime,
        subscription: currentProduct.subscription,
        eid: currentProduct.eid,
        contractID: currentProduct.contractid,
        qhid: qhid,
        quotation_level: currentProduct.dataset,
        searchdate: currentProduct.begin_date,
        begin_date: yyyymmdd(currentProduct.begin_date),
        end_date: yyyymmdd(currentProduct.end_date),
        status: "validated",
        export_mode: req.params.export
      };
      Pool.updateOne(
        { id_cmd: req.params.id },
        { $set: data },
        { upsert: true }
      ).then(() => {
        return res.status(200).json({ ok: "ok" });
      });
    });
  });
});


router.post('/listExport', async (req, res) => {
  let sort = {};
  sort.id = 1;
  var orders = await Order.find(req.body)
                          .sort(sort)
                          .exec();    
  if (!orders) { return res.status(404); }
  var list = orders.map(orderItem => { convertOrderExport(orderItem); });
  return res.status(200).json(list);
});

router.post('/list', async (req, res) => {
  let sort = {};
  sort.createdAt = -1;
  sort[req.body.columns[req.body.order[0].column].data] = req.body.order[0].dir;

  var orderTotalCount = Order.count({ state: { $ne: '' }, state: { $exists: true } }).exec();  
  let search = buildSearch(req);  
  var orderCount = await Order.count(search).exec();
  try{
  var orders = await Order.find(search)
    .skip(req.body.start)
    .limit(req.body.length)
    .collation({ locale: "en" })
    .sort(sort)
    .exec();
  }catch(error){
    req.logger.error({ error: error, message: error.message, className: "Order API"});
    // console.error("["+req.headers.loggerToken + "] unhandle exception: " + error); 
    return res.status(503).json({ message : "an error has been raised please contact support with this identifier ["+req.headers.loggerToken+"]" });
  }
    return res.status(200).json({ recordsFiltered: orderCount, recordsTotal: orderTotalCount, draw: req.body.draw, listorders: orders });
});



router.post('/history', (req, res) => {
  if (req.headers.authorization) {
    User.findOne({ token: req.headers.authorization }, { _id: true })
      .then((result) => {
        if(result) {
          let sort = {};
          let idUser = result._id;
          for (var i = 0; i < req.body.order.length; i++) {
            sort[req.body.columns[req.body.order[i].column].data] = req.body.order[i].dir;
          }
          Order.count({ idUser: idUser }).then((c) => {
            let search = {};
            if (idUser) {
              search['idUser'] = idUser;
            }
            Order.count(search).then((cf) => {
              Order.find(search)
                .skip(req.body.start)
                .limit(req.body.length)
                .collation({ locale: "en" })
                .sort(sort)
                .then((orders) => {
                  if (!orders) { return res.status(404); }
                  return res.status(200).json({ recordsFiltered: cf, recordsTotal: c, draw: req.body.draw, listorders: orders });
                });
            });
          });
        }
        else {
          return res.status(404);
        }
      });
  } else {
    return res.status(404);
  }
});

router.post('/caddies', (req, res) => {
  Order.find({ idUser: req.body.id, state: { $in: ['CART', 'PLI', 'PBI', 'PSC'] } })
    .then((cmd) => {
      return res.status(200).json({ cmd: cmd });
    });
});

router.post('/sortProducts', (req, res) => {
  Order.findOne({ id_cmd: req.body.idCmd })
    .then(cmd => {
      let idx = 1;
      let listProducts = [];

      cmd.products.forEach(p => {
        p.id_undercmd = cmd.id + "§" + idx++;
        listProducts.push(p);
      });

      Order.updateOne(

        { id_cmd: cmd.id_cmd },
        {
          $set: {
            products: listProducts
          }

        }).then(u => { return true; });

      return res.status(200).json({ 'ok': true });
    });
});

router.put('/updatemetadata', (req, res) => {
  if (!req.body.id) {
    return res.sendStatus(400);
  }
  return res.status(200).json({
    ok: OrderService.updateOrderMetaData(req.body.id, req.body.note, req.body.sales, req.body.type)
  });
});

buildSearch = function (req) {
  let search = {};
  search['state'] = { $ne: '' };
  search['state'] = { $exists: true };
  if (req.body.state) {
    search['state'] = req.body.state;
  }
  req.body.columns.forEach(column => {
    if (column.data === 'redistribution' && column.search.value !== '') {
      search['survey.dd'] = column.search.value;
    } else if (column.data === 'submissionDate' && column.search.value !== '') {
      let d = column.search.value.split('|');
      search['submissionDate'] = { $gte: new Date(d[0]), $lt: new Date(d[1]) };
    }
    else if (column.data === 'purchasetype' && column.search.value) {
      if (column.search.value == '1') {
        search['products'] = {
          $not: { $elemMatch: { subscription: 1, onetime: 0 } }
        };
      }
      if (column.search.value == '2') {
        search['products'] = {
          $not: { $elemMatch: { subscription: 0, onetime: 1 } }
        };
      }
      if (column.search.value == '3') {
        search['$and'] = [{ 'products': { $elemMatch: { subscription: 1, onetime: 0 } } },
        { 'products': { $elemMatch: { subscription: 0, onetime: 1 } } }];
      }

    }
    else if (column.data === 'id' && column.search.value !== '') {
      search[column.data] = parseInt(column.search.value);
    } else if ((column.data === 'total' || column.data === 'discount') && column.search.value !== '') {
      search[column.data] = parseFloat(column.search.value);
    } else if (column.search.value !== '') {
      search[column.data] = new RegExp(column.search.value, "i");
    }

  });
  if (req.body.search.value !== '') {
    search['$or'] = [
      { state: new RegExp(req.body.search.value, "i") },
      { companyName: new RegExp(req.body.search.value, "i") },
      { id_cmd: new RegExp(req.body.search.value, "i") }
    ];
  }
  return search;
}

pdfpost = function (id) {
  let options = {
    url: LOCALDOMAIN + '/api/pdf',
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
};


sendMail = function (url, corp) {
  let options = {
    url: LOCALDOMAIN + url,
    headers: {
      'content-type': 'application/json',
    },
    body: corp, json: true
  };

  request.post(options, function (error, response, body) {
    if (error) throw new Error(error);
  });
};


Date.prototype.previousDay = function () {
  this.setDate(this.getDate() - 1);
  return this;
};


Date.prototype.nextDay = function () {
  this.setDate(this.getDate() + 1);
  return this;
};


Date.prototype.nextMonth = function (period) {
  this.setMonth(this.getMonth() + period);
  return this;
};


verifWeek = function (dt) {
  dt.previousDay();
  while (dt.getDay() === 0 || dt.getDay() === 6) {
    dt.previousDay();
  }
  return dt;
};


verifWeekNext = function (dt) {
  dt.nextDay();
  while (dt.getDay() === 0 || dt.getDay() === 6) {
    dt.nextDay();
  }
  return dt;
};


Date.prototype.yyyymmdd = function () {
  var mm = this.getMonth() + 1;
  var dd = this.getDate();
  return [this.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join('');
};


yyyymmdd = function (d) {
  let dat = d.split('-');
  let mm = parseInt(dat[1]);
  let dd = parseInt(dat[2]);

  return [
    dat[0],
    (mm > 9 ? '-' : '-0') + mm,
    (dd > 9 ? '-' : '-0') + dd
  ].join('');
};



idcommande = function (prefix, nbcar) {
  Config.findOne({ id: "counter" }).then((cnt) => {

    let id = cnt.value;
    let nbid = nbcar - id.toString().length;
    for (let i = 0; i < nbid; i++) {
      prefix += "0";
    }
    let idnew = id + 1;
    prefix += idnew;
    Config.updateOne({ id: "counter" }, { $inc: { value: 1 } }).then(() => {
      return prefix;
    });
  });
};


endperiod = function (data, periode) {

  let dateclone = new Date(clone(data));
  return dateclone.setMonth(dateclone.getMonth() + periode);
};


precisionRound = function (number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
};


totalttc = function (order) {  
  if (order.currency !== 'usd') {
    return computeTotalTtcInLocalCurrency(order);
  }
  return ComputeTotalTtcUsd(order);
};


addPool = function (data) {
  Pool.findOne({ id_cmd: data.id_cmd, begin_date: data.begin_date }).then(p => {
    if (!p) {
      Pool.create(data).then(p => { return true; });
    }
  });
};



clone = function (obj) {
  try {
    var copy = JSON.parse(JSON.stringify(obj));
  } catch (ex) {
    alert("variable cloning error");
  }
  return copy;
};

convertOrderExport = function (orderItem) {
  let orderValues = {};
  orderValues["Invoice_ID"] = orderItem.id;
  orderValues["Client_ID"] = orderItem.idUser;
  orderValues["Client_Name"] = orderItem.companyName + ": " + orderItem.firstname + " " + orderItem.lastname;
  orderValues["Client_Country"] = orderItem.country;
  orderValues["Order_Date"] = orderItem.submissionDate;
  orderValues['type'] = orderItem.type;
  if (orderItem.validationFinance) {
    orderItem.logs.forEach(lo => {
      if (lo.referer === "Finance") {
        orderValues["Payment_Date"] = lo.date; // (validation by Finance)
      }
    });
  }
  orderValues["Order_Currency"] = orderItem.currency;
  orderValues["Order_Amount_Before_Taxes"] = orderItem.totalHT;
  orderValues["Exchange_Fees"] = orderItem.totalExchangeFees;
  orderValues["VAT"] = orderItem.vatValue;
  var pay = '';
  if (orderItem.payment === 'creditcard') {
    if (orderItem.logsPayment) {
      orderItem.logsPayment.forEach(ord => {
        if (ord && ord.authResponse === 'Authorised') {
          pay = ord.pspReference;
        }
      });
    }
  }
  orderValues["Payment_Method"] = orderItem.payment;
  orderValues["Payment_Reference"] = pay;
  orderValues["TOTAL_Order_Amount"] = orderItem.total; // CB : mettre la référence Adyen
  orderValues["Internal_Note"] = orderItem.internalNote;
  orderValues["sales"] = orderItem.sales;
}

computeTotalTtcInLocalCurrency = function (order) {
  var discount = 0;
  var totalHT = 0;
  totalExchangeFees = (order.totalExchangeFees / order.currencyTxUsd) * order.currencyTx;
  discount = order.discount;
  totalHT = ((order.totalHT + order.totalExchangeFees) / order.currencyTxUsd) * order.currencyTx;
  if (discount > 0) {
    totalHT = totalHT - (totalHT * (discount / 100));
  }
  totalVat = totalHT * order.vatValue;
  return precisionRound((totalHT * (1 + order.vatValue)), 2);
}

ComputeTotalTtcUsd = function (order) {
  var discount = 0;
  var totalHT = 0;
  totalExchangeFees = order.totalExchangeFees;
  discount = order.discount;
  totalHT = order.totalHT + order.totalExchangeFees;
  if (discount > 0) {
    totalHT = totalHT - (totalHT * (discount / 100));
  }
  totalVat = totalHT * order.vatValue;
  return precisionRound((totalHT * (1 + order.vatValue)), 2);
}

autoValidation = async function (idCmd, logsPayment, r, res) {
  let log = {};
  var order = await Order.findOne({ id_cmd: idCmd }).exec();
  log.date = new Date();
  let eids = [];
  let corp = {};
  let url = '/api/mail/newOrder';
  order.products.forEach(product => { eids.push(product.eid); });
  if (order.state === 'PSC') {
      autoValidationOrderStateIsPSC(corp, order, logsPayment, url, log);
  }
  order.eid = eids;
  if (order.state === "PVC") {
    // Envoi email aux compliances
    await autovalidationOrderStateIsPVC(corp, order, logsPayment);      
  }
  if (order.state === "PVP") {
    // Envoi email aux products
    await autoValidationOrderStateIsPVP(corp, order, logsPayment);
  }
  if (order.state === "PVF") {
    await autoValidationOrderStatePVF(corp, order, logsPayment);      
  }
  var updateStatus = await Order.updateOne({ id_cmd: idCmd }, 
                                           { $push: { 
                                              logsPayment: logsPayment, 
                                              logs: log }, 
                                            $set: { 
                                              validationCompliance: order.validationCompliance, 
                                              submissionDate: new Date(), 
                                              state: order.state }
                                            }).exec();      
  return  res.status(201).json(updateStatus);    
};

async function autoValidationOrderStatePVF(corp, order, logsPayment) {
  var users = await User.find({ roleName: "Finance" }, { email: true, _id: false }).exec();
  users.forEach(user => {
    sendMail('/api/mail/newOrderHoD', {
      idCmd: corp.idCmd,
      email: user.email,
      lastname: order.lastname,
      firstname: order.firstname,
      eid: order.eid.join(),
      date: logsPayment.date,
      total: totalttc(order),
      service: "Finance"
    });
  });
}

async function autoValidationOrderStateIsPVP(corp, order, logsPayment) {
  var users = await User.find({ roleName: "Product" }, { email: true, _id: false }).exec();
  users.forEach(user => {
    sendMail('/api/mail/newOrderHoD', {
      idCmd: corp.idCmd,
      email: user.email,
      lastname: order.lastname,
      firstname: order.firstname,
      eid: order.eid.join(),
      date: logsPayment.date,
      total: totalttc(order),
      service: "Product"
    });
  });
}

async function autovalidationOrderStateIsPVC(corp, order, logsPayment) {
  var users = await User.find({ roleName: "Compliance" }, { email: true, _id: false }).exec();
  users.forEach(user => {
    sendMail('/api/mail/newOrderHoD', {
      idCmd: corp.idCmd,
      email: user.email,
      lastname: order.lastname,
      firstname: order.firstname,
      eid: order.eid.join(),
      date: logsPayment.date,
      total: totalttc(order),
      service: "Compliance"
    });
  });
}

function autoValidationOrderStateIsPSC(corp, order, logsPayment, url, log) {
  corp = {
    "email": order.email,
    "idCmd": order.id,
    "paymentdate": logsPayment.date,
    "token": logsPayment.token,
    "service": 'Compliance'
  };
  sendMail(url, corp);
  order.products.forEach(product => {
    if (((product.historical_data
      && (product.historical_data.backfill_agreement || product.historical_data.backfill_applyfee))
      || order.survey[0].dd === "1") && product.onetime === 1) {
      order.state = 'PVC';
      log.status = 'PVC';
      log.referer = 'Client';
    }
    else {
      order.validationCompliance = true;
      log.referer = 'Autovalidation';
      order.state = 'PVP';
      log.status = 'PVP';
      // Envoi email aux products
    }
  });
}

module.exports = router;