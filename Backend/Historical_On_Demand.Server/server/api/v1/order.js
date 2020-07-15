const router = require("express").Router();
const request = require("request");
const mongoose = require("mongoose");

const Config = mongoose.model("Config");
const Order = mongoose.model("Order");
const Pool = mongoose.model("Pool");
const User = mongoose.model("User");
const Currency = mongoose.model("Currency");
const Invoice = mongoose.model("Invoice");

//const config = require('../../config/config.js');
const OrderProductLogService = require("../../service/orderProductLogService");

const DOMAIN = global.environment.domain;
const LOCALDOMAIN = global.environment.localdomain;
const PAYMENTVERIFY = global.environment.paymentVerify;
const PAYMENTSETUP = global.environment.paymentSetup;
const PAYMENTKEY = global.environment.paymentKey;

const OrderService = require("../../service/orderService");
const jwtService = require("../../service/jwtService");
const OrderFilterService = require("../../service/orderFilterService");
const OrderMailService = require("../../service/orderMailerService");
const OrderPdfService = require("../../service/orderPdfService");
const InvoiceService = require('../../service/invoiceService')
const { error } = require('winston');
const userService = require("../../service/userService");
const { calculatefeesOfOrder } = require("../../service/feesService");

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

router.post("/verify", (req, res) => {
  let options = {
    url: PAYMENTVERIFY,
    headers: {
      "content-type": "application/json",
      "X-API-Key": PAYMENTKEY,
    },
    body: {
      payload: req.body.payload,
    },
    json: true,
  };

  request.post(options, async function (error, response, body) {
    if (error) throw new Error(error);
    let log = body;
    log.date = new Date();

    await autoValidation(body.merchantReference, log, body, res, req.logger);
  });
});

router.post("/logPayement", (req, res) => {
  let options = {
    url: PAYMENTVERIFY,
    headers: {
      "content-type": "application/json",
      "X-API-Key": PAYMENTKEY,
    },
    body: {
      payload: req.body.payload,
    },
    json: true,
  };

  request.post(options, function (error, response, body) {
    body.date = new Date();
    Order.updateOne(
      { id_cmd: body.merchantReference },
      { $push: { logsPayment: body } }
    ).then((rs) => {
      res.status(201).json(rs);
    });
  });
});

router.post("/rib", async (req, res) => {
  req.logger.info({ message: "rib is calling...", className: "Order API" });
  try {
    await autoValidation(
      req.body.idCmd,
      {
        token: req.body.token,
        email: req.body.email,
        payment: "RIB",
        date: new Date(),
      },
      { ok: true },
      res,
      req.logger
    );
    return res.status(200).json({ message: "Order is submitted" });
  } catch (error) {
    req.logger.error({
      message: error.message + "\n" + error.stack,
      className: "Order API",
    });
    return res
      .status(503)
      .json(
        "An error has been raised, please contact support with identifier error: '" +
        req.headers.tokenLogger +
        "'"
      );
  }
});

router.post("/autovalidation", (req, res) => {
  Order.findOne({ state: "PVF" });
});

router.post("/save", (req, res) => {
  let total = 0;

  if (req.body.cart.currency !== "usd") {
    total = precisionRound(
      (req.body.cart.total / req.body.cart.currencyTxUsd) *
      req.body.cart.currencyTx,
      2
    );
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
      },
    }
  ).then(() => {
    let options = {
      url: PAYMENTSETUP,
      headers: {
        "content-type": "application/json",
        "X-API-Key": PAYMENTKEY,
      },
      body: {
        amount: {
          currency: req.body.cart.currency.toUpperCase(),
          value: total * 100,
        },
        reference: req.body.cart.idCmd,
        shopperReference: req.body.user.email,
        channel: "Web",
        html: true,
        origin: DOMAIN,
        returnUrl: DOMAIN + "/order/payment",
        countryCode: req.body.user.countryBilling,
        shopperLocale: "en-GB",
        merchantAccount: "QUANTHOUSECOM",
      },
      json: true,
    };

    request.post(options, function (error, response, body) {
      if (error) throw new Error(error);
      return res.status(200).json(response);
    });
  });
});

router.put("/delProductCaddy", async (req, res) => {
  const userId = jwtService.verifyToken(req.headers.authorization).id;
  var caddy = await OrderService.getRawCaddy(userId);
  var productdeletion = await OrderService.deleteProduct(
    caddy,
    req.body.id_product
  );
  if (productdeletion == 1) {
    return res.status(200).json({ message: "Order deleted" });
  } else if (productdeletion == 2) {
    return res.status(200).json({ message: "Product deleted" });
  }
  return res.status(200).json({ error: "Product Not found" });
});

// router.put('/updtProductCaddy', (req, res) => {
//   let updt = {};
//   if (req.body.begin_date) {
//     updt["products.$.begin_date"] = req.body.begin_date;
//   }
//   if (req.body.end_date) {
//     updt["products.$.end_date"] = req.body.end_date;
//   }
//   if (req.body.period) {
//     updt["products.$.period"] = req.body.period;
//   }
//   if (req.body.ht) {
//     updt["products.$.ht"] = req.body.ht;
//   }
//   // if(req.body.totalHT){
//   //   updt["totalHT"] = req.body.totalHT;
//   // }
//   if (req.body.status) {
//     updt["products.$.status"] = req.body.status;
//   }
//   Order.updateOne(
//     { id_cmd: req.body.idCmd, 'products.id_undercmd': req.body.idElem },
//     { $set: updt }
//   )

//     .then((r) => {
//       Order.findOne({ id_cmd: req.body.idCmd }).then(p => {
//         let totalHT = 0;

//         p.products.forEach(prd => {
//           totalHT += prd.ht;
//         });
//         return totalHT;
//       }).then(o => {
//         Order.updateOne({ id_cmd: req.body.idCmd }, { $set: { totalHT: o } }).then(() => {
//           res.status(201).json({ ok: true });
//         });
//       });
//     });
// });

router.put("/updateDiscount", async (req, res) => {
  let updatedInvoice = {};
  updatedInvoice.discount = req.body.discount;
  let invoice = await Invoice.findOne({ orderId: req.body.orderId }).exec();
  updatedInvoice.totalHT = applyDiscount(invoice.totalHTDiscountFree, invoice.totalExchangeFees, updatedInvoice.discount);
  updatedInvoice.total = updatedInvoice.totalHT + invoice.totalVat;
  try {
    await Invoice.updateOne({ orderId: req.body.orderId }, { $set: updatedInvoice }).exec();
  }
  catch (error) {
    logger.error({ message: error.message, className: "Order API" });
    logger.error({ message: error.stack, className: "Order API" });
    return res.status(503).json({ error: `an error has been raised please contact support with this identifier [${req.headers.loggerToken}]` })
  }
  return res.status(201).json({ ok: true });
});

function applyDiscount(taxFreeTotal, exchangeFees = 0, discount) {
  let exchangeFeesFreeTotal = taxFreeTotal - exchangeFees;
  return exchangeFeesFreeTotal - (exchangeFeesFreeTotal * (discount / 100)) + exchangeFees;
}

router.put("/updateEngagementPeriod", (req, res) => {
  let updatedInvoice = {};
  updatedInvoice.totalHT = req.body.ht;
  req.body.cart.forEach((product) => {
    updatedInvoice["products.$.period"] = product.period;
    updatedInvoice["products.$.ht"] = product.ht;
    try {
      Order.updateOne(
        { id_cmd: req.body.idCmd, "products.id_undercmd": product.idElem },
        { $set: updatedInvoice }
      ).exec();
    }
    catch (error) {
      logger.error({ message: error.message, className: "Order API" });
      logger.error({ message: error.stack, className: "Order API" });
      return res.status(503).json({ error: `an error has been raised please contact support with this identifier [${req.headers.loggerToken}]` })
    }
  });
  return res.status(201).json({ ok: true });
})

router.put("/state", async (req, res) => {
  let orderUpdated = {};
  let log = {};
  let corp = {};
  orderUpdated.state = req.body.status;
  log.status = req.body.status;
  log.referer = req.body.referer;
  dateref = new Date();
  datedebref = new Date();
  dateFinref = new Date();
  log.date = dateref;
  if (req.body.referer === "Compliance") {
    try {
      await UpdateStateCompliance(orderUpdated, corp, req);
    } catch (err) {
      req.logger.error({
        message: err.message + "\n" + err.stack,
        className: "Order API",
      });
      return res.status(503).json({
        message:
          "An error has been thrown, please contact support with '" +
          req.loggerToken +
          "'",
      });
    }
  }
  if (req.body.referer === "Product") {
    try {
      await UpdateStateProduct(orderUpdated, req, corp);
    } catch (err) {
      req.logger.error({
        message: err.message + "\n" + err.stack,
        className: "Order API",
      });
      return res.status(503).json({
        message:
          "An error has been thrown, please contact support with '" +
          req.headers.loggerToken +
          "'",
      });
    }
  }
  if (
    req.body.referer === "Finance" ||
    req.body.referer === "ProductAutovalidateFinance"
  ) {
    try {
      await UpdateOrderFinance(orderUpdated, req, corp, log);
      return res.status(200).json({ ok: true });
    } catch (err) {
      req.logger.error({
        message: err.message + "\n" + err.stack,
        className: "Order API",
      });
      return res.status(503).json({
        message:
          "An error has been thrown, please contact support with '" +
          req.loggerToken +
          "'",
      });
    }
  } else if (
    req.body.referer.toLowerCase() === "client" ||
    req.body.status.toLowerCase() === "cancelled"
  ) {
    req.logger.info("order updating (" + JSON.stringify(orderUpdated) + ")...");
    await Order.updateOne(
      { id_cmd: req.body.idCmd },
      { $set: orderUpdated, $push: { logs: log } }
    ).exec();
    await Invoice.updateOne(
      { orderId: req.body.id },
      { $set: orderUpdated, $push: { logs: log } }
    ).exec();

    return res.status(201).json({ ok: true });
  } else {
    req.logger.info("order updating (" + JSON.stringify(orderUpdated) + ")...");
    await Order.updateOne(
      { id_cmd: req.body.idCmd },
      { $set: orderUpdated, $push: { logs: log } }
    ).exec();
    await Invoice.updateOne(
      { orderId: req.body.id },
      { $set: orderUpdated, $push: { logs: log } }
    ).exec();
    // .then((r) => {
    return res.status(201).json({ ok: true });
  }
});

router.put("/update", async (request, res) => {
  try {
    let orderProductLogs = [];
    var currencies = [];
    var currencies = await Currency.find({}).exec();
    var orderUpdated = await Order.findOne({
      _id: request.body.idcmd.id_cmd,
    }).exec();
    orderUpdated.id_cmd =
      orderUpdated.id +
      "-" +
      request.body.u.user.companyName.replace(" ", "").toLowerCase() +
      "-" +
      new Date().yyyymmdd().replace(/-/g, "");
    if (request.body.state) {
      orderUpdated.state = request.body.state;
    }
    if (request.body.cart) {
      let idx = 1;
      if (orderUpdated.products.length > 0) {
        idx =
          parseInt(
            orderUpdated.products[
              orderUpdated.products.length - 1
            ].id_undercmd.split("§")[1]
          ) + 1;
      }
      request.body.cart.forEach((elem) => {
        if (elem.backfill_fee !== 0) {
          let a_backfillfee = elem.backfill_fee.split(" ");
          switch (a_backfillfee[1]) {
            case "USD":
              elem.backfill_fee = parseFloat(a_backfillfee[0]);
              break;
            default:
              elem.backfill_fee = parseFloat(a_backfillfee[0]);
              for (let i = 0; i < currencies.length; i++) {
                if (currencies[i]["device"] === "USD") {
                  elem.backfill_fee = elem.backfill_fee * currencies[i]["taux"];
                } else if (currencies[i]["device"] === a_backfillfee[1]) {
                  elem.backfill_fee = elem.backfill_fee / currencies[i]["taux"];
                }
              }
          }
        }
        if (elem.ongoing_fee !== 0) {
          let a_ongoingfee = elem.ongoing_fee.split(" ");
          switch (a_ongoingfee[1]) {
            case "USD":
              elem.ongoing_fee = parseFloat(a_ongoingfee[0]);
              break;
            default:
              elem.ongoing_fee = parseFloat(a_ongoingfee[0]);
              for (let i = 0; i < currencies.length; i++) {
                if (currencies[i]["device"] === "USD") {
                  elem.ongoing_fee = elem.ongoing_fee * currencies[i]["taux"];
                } else if (currencies[i]["device"] === a_ongoingfee[1]) {
                  elem.ongoing_fee = elem.ongoing_fee / currencies[i]["taux"];
                }
              }
          }
        }
        orderUpdated.totalExchangeFees += parseFloat(elem.backfill_fee);
        orderUpdated.totalExchangeFees += parseFloat(elem.ongoing_fee);
        orderUpdated.totalHT += parseFloat(elem.ht);
        var id_undercmd = orderUpdated.id + "§" + idx++;
        orderUpdated.products.push({
          idx: elem.idx,
          index: elem.index,
          id_undercmd: id_undercmd,
          dataset: elem.quotation_level,
          description: elem.description,
          pricingTier: elem.pricingTier,
          price: elem.price,
          backfill_fee: parseFloat(elem.backfill_fee),
          ongoing_fee: parseFloat(elem.ongoing_fee),
          ht: parseFloat(elem.ht),
          onetime: elem.onetime,
          subscription: elem.subscription,
          period: elem.period,
          contractid: elem.contractid,
          eid: elem.eid,
          qhid: elem.qhid,
          symbol: elem.symbol,
          historical_data: elem.historical_data,
          exchangeName: elem.exchange,
          assetClass: elem.assetClass,
          mics: elem.mics,
          begin_date_ref: elem.begin_date,
          end_date_ref: elem.end_date,
          begin_date: elem.begin_date_select,
          end_date: elem.end_date_select,
          status: elem.status,
        });
        orderProductLogs.push({
          id_undercmd: id_undercmd,
          referer: "client",
          status: elem.status,
          idUser: orderUpdated.IdUser,
          date: new Date(),
          log: "Cart updated",
          orderId: orderUpdated.id,
          productId: idx,
        });
      });
    }

    if (request.body.u.user && orderUpdated.vatValide === null) {
      orderUpdated.companyName = request.body.u.user.companyName;
      orderUpdated.companyType = request.body.u.user.companyType;
      orderUpdated.region = request.body.u.user.region;
      orderUpdated.job = request.body.u.user.job;
      orderUpdated.firstname = request.body.u.user.firstname;
      orderUpdated.lastname = request.body.u.user.lastname;
      orderUpdated.email = request.body.u.user.email;
      orderUpdated.phone = request.body.u.user.phone;
      orderUpdated.website = request.body.u.user.website;
      orderUpdated.address = request.body.u.user.address;
      orderUpdated.city = request.body.u.user.city;
      orderUpdated.country = request.body.u.user.country;
      orderUpdated.postalCode = request.body.u.user.postalCode;
      orderUpdated.addressBilling = request.body.u.user.addressBilling;
      orderUpdated.cityBilling = request.body.u.user.cityBilling;
      orderUpdated.countryBilling = request.body.u.user.countryBilling;
      orderUpdated.postalCodeBilling = request.body.u.user.postalCodeBilling;
      orderUpdated.submissionDate = new Date();
      orderUpdated.vat = request.body.u.user.vat;

      orderUpdated.payment = request.body.u.user.payment;
      orderUpdated.currency = request.body.u.user.currency;
      for (var i = 0; i < currencies.length; i++) {
        if (currencies[i]["id"] === orderUpdated.currency) {
          orderUpdated.currencyTx = currencies[i]["taux"];
        }
        if (currencies[i]["id"] === "usd") {
          orderUpdated.currencyTxUsd = currencies[i]["taux"];
        }
      }
    }
    if (request.body.survey) {
      orderUpdated.survey = request.body.survey;
    }
    await Order.updateOne(
      { _id: request.body.idcmd.id_cmd },
      { $set: orderUpdated }
    ).exec();
    try {
      var serviceLogs = new OrderProductLogService(
        orderUpdated.id,
        request.logger
      );
      request.logger.info({ message: "Order updated", className: "Order API" });
      await serviceLogs.addAllLogInUpdateOrder(orderProductLogs);
    } catch (error) {
      request.logger.error({
        message: error.message + "\n" + error.stack,
        className: "Order API",
      });
      return res.status(503).json({
        message:
          "Unhandle exception, please contact support with '" +
          request.headers.loggerToken +
          "' identifier",
      });
    }
    return res.status(201).json({ ok: true });
  } catch (err) {
    request.logger.error({
      message: "Unhandle exception during update cart: " + err.message,
      className: "Order API",
    });
    request.logger.error(err);
    return res.status(501).json({
      message:
        "Update cannot be executed please contact support with identifier '" +
        request.headers.tokenLogger +
        "'",
    });
  }
});

router.post("/usercaddy", (req, res) => {
  const states = ["CART", "PLI", "PBI", "PSC"];
  Order.find(
    { idUser: req.body.id, state: { $in: states } },
    { id_cmd: true, state: true }
  ).then((cmd) => {
    if (cmd.length > 0 && states.indexOf(cmd.state)) {
      return res.status(200).json({ id_cmd: cmd[0]._id });
    } else {
      let order = new Order();
      Order.find({}, { id: 1 })
        .sort({ id: -1 })
        .limit(1)
        .then((count) => {
          if (count.length > 0) {
            order.id = count[0].id + 1;
          } else {
            order.id = 1;
          }

          order.idUser = req.body.id;
          order.save((err, c) => {
            if (err) {
              req.logger.error({
                message: err.message,
                className: "Order API",
                error: error,
              });
              req.logger.error(err);
              return console.error(err);
            }
            return res.status(200).json({ id_cmd: c._id });
          });
        });
    }
  });
});

router.get("/listStates", (req, res) => {
  let states = [
    { id: "CART", name: "Cart" },
    { id: "PLI", name: "Pending Licensing Information" },
    { id: "PBI", name: "Pending Billing Information" },
    { id: "PSC", name: "Pending Submission by Client" },
    { id: "PVP", name: "Pending Validation by Product" },
    { id: "PVC", name: "Pending Validation by Compliance" },
    { id: "PVF", name: "Pending Validation by Finance" },
    { id: "validated", name: "Validated" },
    { id: "active", name: "Active" },
    { id: "inactive", name: "Inactive" },
    { id: "cancelled", name: "Cancelled" },
    { id: "rejected", name: "Rejected" },
    { id: "failed", name: "Failed" },
  ];
  return res.status(200).json({ states: states });
});

router.post("/submitCaddy", async (req, res) => {
  try {
    userId = jwtService.verifyToken(req.headers.authorization).id
    await OrderService.submitCaddy(
      userId,
      req.body.survey,
      req.body.currency,
      req.body.billingInfo
    );
    res.status(200).json({ ok: "true" });
  }
  catch (error) {
    return res.status(401).json({ error: error.message })
  }

});

router.post("/caddies", async (req, res) => {
  if (!req.headers.authorization) {
    return res.sendStatus(401);
  }
  userId = jwtService.verifyToken(req.headers.authorization).id
  const order = await OrderService.getCaddy(
    userId,
    req.body.currency
  );
  return res.status(200).json(order);
});
//this is a temporary web service, it will be cleared on the rework of search page
//TODO : Rework the api name
router.get("/caddy", async (req, res) => {
  if (!req.headers.authorization) {
    return res.sendStatus(401);
  }
  const userId = jwtService.verifyToken(req.headers.authorization).id;
  const order = await OrderService.getRawCaddy(userId);
  return res.status(200).json(order);
});

router.get("/:id", (req, res) => {
  Order.findOne({ _id: req.params.id }).then((cmd) => {
    return res.status(200).json({ cmd: cmd });
  });
});

router.get("/", async (req, res) => {
  if (!req.headers.authorization) {
    req.logger.error({
      message: "Access denied at this resource",
      className: "Order API",
    });
    return res.status(401).json({
      message:
        "Access denied at this resource, please contact the support with ticket identifier: " +
        req.headers.loggerToken,
    });
  }
  userId = jwtService.verifyToken(req.headers.authorization).id;
  const orders = await OrderService.getUserOrdersHistory(userId);
  res.status(200).json({ listorders: orders });
});

router.get("/details/:id", async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401);
  }
  if (!req.params.id) {
    return res.status(200).json({ error: "No order id provided in request" });
  }
  try {
    userId = jwtService.verifyToken(req.headers.authorization).id
    const order = await OrderService.getOrderDetails(
      req.params.id,
      userId
    );
    return res.status(200).json(order);
  } catch (error) {
    res.status(503).json({
      message:
        "an error has been raised please contact support with this identifier [" +
        req.headers.loggerToken +
        "]",
    });
  }
});

router.put("/cancelValidation", async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401);
  }
  var order = await Order.findOne({ id: req.body.id }).exec();
  await Order.updateOne(
    { id: order.id },
    {
      $set: {
        validationProduct: false,
        idProForma: null,
        state: "PVP",
        logs: {
          status: "PVP",
          referer: "Compliance",
        },
      },
    }
  ).exec();

  var invoice = await Invoice.findOne({ orderId: req.body.id }).exec();
  await Invoice.updateOne(
    { orderId: invoice.orderId },
    {
      $set: {
        validationProduct: false,
        proFormaId: null,
        state: "PVP",
        logs: {
          status: "PVP",
          referer: "Compliance",
        },
      },
    }
  ).exec();
  return res.status(200).json({ ok: true });
});

router.get("/:id", (req, res) => {
  Order.find({ idUser: req.params.id }).then((cmd) => {
    return res.status(200).json({ cmd: cmd });
  });
});

router.post("/", (req, res) => {
  Order.find({ idUser: req.body.user })
    .sort({ id: req.body.sort })
    .then((cmd) => {
      return res.status(200).json({ cmd: cmd });
    });
});

router.get("/idCmd/:id", async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "No token provided" });
  }
  if (!req.params.id) {
    return res.status(200).json({ error: "No Order id provided" });
  }
  try {
    var order = await OrderService.getOrderById(req.params.id);
    return res.status(200).json({ cmd: order });
  } catch (error) {
    return res.status(503).json({ error: error.message });
  }
});

router.get("/retry/:id/:export", (req, res) => {
  var currentProduct;
  Order.findOne({
    products: { $elemMatch: { id_undercmd: req.params.id } },
  }).then((order) => {
    order.products.forEach((product) => {
      if (product.id_undercmd === req.params.id) {
        product.id_undercmd = order.id + "§" + product.idx;
        currentProduct = product;
      }
    });
    Order.updateOne(
      { id_cmd: order.id_cmd },
      {
        $set: { products: order.products },
      }
    ).then(() => {
      currentProduct.begin_date = currentProduct.begin_date_select;
      currentProduct.end_date = currentProduct.end_date_select;
      let qhid = "";
      if (currentProduct.qhid !== null || currentProduct.qhid !== "") {
        qhid = currentProduct.qhid.toString();
      }
      let data = {
        id: order.id,
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
        export_mode: req.params.export,
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

router.post("/listExport", async (req, res) => {
  let sort = {};
  sort.id = 1;
  var orders = await Order.find(req.body).sort(sort).exec();
  if (!orders) {
    return res.status(404);
  }
  var list = orders.map((orderItem) => {
    convertOrderExport(orderItem);
  });
  return res.status(200).json(list);
});

router.post("/list", async (req, res) => {
  try {
    const records = await OrderFilterService.getListOrders(
      req.body.columns[req.body.order[0].column].data,
      req.body.order[0].dir,
      req.body.start,
      req.body.length,
      req.body.state,
      req.body.columns,
      req.body.search
    );
    return res.status(200).json(records)

  }
  catch (error) {
    return res.status(503).json({ error: `an error has been raised please contact support with this identifier [${req.headers.loggerToken}]` })
  }

});

router.post("/history", async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "No token provided" });
  }
  const userId = jwtService.verifyToken(req.headers.authorization).id;
  const user = await userService.getUserById(userId);
  if (user) {
    let sort = {};
    let idUser = user._id;
    for (var i = 0; i < req.body.order.length; i++) {
      sort[req.body.columns[req.body.order[i].column].data] =
        req.body.order[i].dir;
    }
    documentsCount = await Order.countDocuments({ idUser: idUser }).exec();
    let search = {};
    if (idUser) {
      search["idUser"] = idUser;
    }
    Order.countDocuments(search).then((cf) => {
      Order.find(search)
        .sort(sort)
        .skip(req.body.start)
        .limit(req.body.length)
        .collation({ locale: "en" })
        .then((orders) => {
          if (!orders) {
            return res.status(404);
          }
          return res.status(200).json({
            recordsFiltered: cf,
            recordsTotal: documentsCount,
            draw: req.body.draw,
            listorders: orders,
          });
        });
    });
  } else {
    return res.status(404);
  }
});
router.put("/changePresubmitState", async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "No token provided" });
  }
  if (!req.body.state) {
    return res.status(200).json({ error: "No state provided" });
  }
  if (["CART", "PLI", "PBI", "PSC"].indexOf(req.body.state) == -1) {
    return res.status(200).json({ error: "Invalid State" });
  }
  try {
    const idUser = jwtService.verifyToken(req.headers.authorization).id
    var updated = await OrderService.updatePreSubmitStateCaddy(
     idUser,
      req.body.state
    );
    return res.status(200).json({ udpated: updated });
  } catch (error) {
    return res.status(200).json({ error: error.message });
  }
});

// router.post('/caddies', (req, res) => {
//   Order.find({ idUser: req.body.id, state: { $in: ['CART', 'PLI', 'PBI', 'PSC'] } })
//     .then((cmd) => {
//       return res.status(200).json({ cmd: cmd });
//     });
// });

router.post("/sortProducts", (req, res) => {
  Order.findOne({ id_cmd: req.body.idCmd }).then((cmd) => {
    let idx = 1;
    let listProducts = [];

    cmd.products.forEach((p) => {
      p.id_undercmd = cmd.id + "§" + idx++;
      listProducts.push(p);
    });

    Order.updateOne(
      { id_cmd: cmd.id_cmd },
      {
        $set: {
          products: listProducts,
        },
      }
    ).then((u) => {
      return true;
    });

    return res.status(200).json({ ok: true });
  });
});

router.put("/updatemetadata", (req, res) => {
  if (!req.body.id) {
    return res.sendStatus(400);
  }
  return res.status(200).json({
    ok: OrderService.updateOrderMetaData(
      req.body.id,
      req.body.note,
      req.body.sales,
      req.body.type
    ),
  });
});
router.put("/updateProductDate", async (req, res) => {
  if (!req.headers.authorization) {
    res.statusCode(401).json("authorization token is not provided in header");
  }
  if (!req.body.idproduct) {
    return res.status(200).json({ error: "No id product provided" });
  }
  if (!req.body.dateToChange) {
    return res.status(200).json({ error: "Unknown date field to change" });
  }
  if (!req.body.date) {
    return res.status(200).json({ error: "No date value provided" });
  }
  const idUser = jwtService.verifyToken(req.headers.authorization).id
  let caddy = await OrderService.getRawCaddy(idUser);
  if (!caddy) {
    return res.status.json({
      error: "Caddy not found with the provided token",
    });
  }
  var result = OrderService.UpdateProductDate(
    caddy,
    req.body.idproduct,
    req.body.dateToChange,
    new Date(req.body.date)
  );
  if (result) return res.status(200).json({ message: "Ok" });
  else return res.status(200).json({ error: "Product not found in the caddy" });
});


pdfpost = async function (id, logger, invoiceId, invoiceType) {
  try {
    var invoice = await Invoice.findOne({ orderId: id }).exec();
    await new OrderPdfService(invoice).createInvoicePdf(
      logger,
      invoiceId,
      invoiceType
    );
  } catch (error) {
    logger.error({ message: error.message, className: "Order API" });
    logger.error({ message: error.stack, className: "Order API" });
    return false;
  }
  return true;
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
  return [
    this.getFullYear(),
    (mm > 9 ? "" : "0") + mm,
    (dd > 9 ? "" : "0") + dd,
  ].join("");
};

yyyymmdd = function (d) {
  let dat = d.split("-");
  let mm = parseInt(dat[1]);
  let dd = parseInt(dat[2]);

  return [dat[0], (mm > 9 ? "-" : "-0") + mm, (dd > 9 ? "-" : "-0") + dd].join(
    ""
  );
};

setInvoiceId = async function (prefix) {
  let config = await Config.findOne({ id: "counter" }).exec();
  let invoiceId = config.value + 1;
  while (invoiceId.toString().length < 7) {
    invoiceId = "0" + invoiceId;
  }
  return prefix + invoiceId;
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
  if (order.currency !== "usd") {
    return computeTotalTtcInLocalCurrency(order);
  }
  return ComputeTotalTtcUsd(order);
};

addPool = function (data) {
  Pool.findOne({ id_cmd: data.id_cmd, begin_date: data.begin_date }).then(
    (p) => {
      if (!p) {
        Pool.create(data).then((p) => {
          return true;
        });
      }
    }
  );
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
  orderValues["Client_Name"] =
    orderItem.companyName +
    ": " +
    orderItem.firstname +
    " " +
    orderItem.lastname;
  orderValues["Client_Country"] = orderItem.country;
  orderValues["Order_Date"] = orderItem.submissionDate;
  orderValues["type"] = orderItem.type;
  if (orderItem.validationFinance) {
    orderItem.logs.forEach((lo) => {
      if (lo.referer === "Finance") {
        orderValues["Payment_Date"] = lo.date; // (validation by Finance)
      }
    });
  }
  orderValues["Order_Currency"] = orderItem.currency;
  orderValues["Order_Amount_Before_Taxes"] = orderItem.totalHT;
  orderValues["Exchange_Fees"] = orderItem.totalExchangeFees;
  orderValues["VAT"] = orderItem.vatValue;
  var pay = "";
  if (orderItem.payment === "creditcard") {
    if (orderItem.logsPayment) {
      orderItem.logsPayment.forEach((ord) => {
        if (ord && ord.authResponse === "Authorised") {
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
};

computeTotalTtcInLocalCurrency = function (order) {
  var discount = 0;
  var totalHT = 0;
  totalExchangeFees =
    (order.totalExchangeFees / order.currencyTxUsd) * order.currencyTx;
  discount = order.discount;
  totalHT =
    ((order.totalHT + order.totalExchangeFees) / order.currencyTxUsd) *
    order.currencyTx;
  if (discount > 0) {
    totalHT = totalHT - totalHT * (discount / 100);
  }
  totalVat = totalHT * order.vatValue;
  return precisionRound(totalHT * (1 + order.vatValue), 2);
};

ComputeTotalTtcUsd = function (order) {
  var discount = 0;
  var totalHT = 0;
  totalExchangeFees = order.totalExchangeFees;
  discount = order.discount;
  totalHT = order.totalHT + order.totalExchangeFees;
  if (discount > 0) {
    totalHT = totalHT - totalHT * (discount / 100);
  }
  totalVat = totalHT * order.vatValue;
  return precisionRound(totalHT * (1 + order.vatValue), 2);
};

autoValidation = async function (idCmd, logsPayment, r, res, logger) {
  let log = {};
  var order = await Order.findOne({ id_cmd: idCmd }).exec();
  // Order.findOne({ id_cmd: idCmd }).then(order => {
  log.date = new Date();
  let eids = [];
  let corp = {};
  order.products.forEach((product) => {
    eids.push(product.eid);
  });
  if (order.state === "PSC") {
    logger.info({ message: "PSC autovalidation", className: "Order API" });
    await autoValidationOrderStateIsPSC(order, log, logger);
  }
  order.eid = eids;
  if (order.state === "PVC") {
    logger.info("PVC autovalidation");
    // Envoi email aux compliances
    await autovalidationOrderStateIsPendingValidationByCompliance(
      corp,
      order,
      logsPayment,
      logger
    );
  }
  if (order.state === "PVP") {
    logger.info("PVP autovalidation");
    // Envoi email aux products
    await autoValidationOrderStateIsPendingValidationbyProduct(
      corp,
      order,
      logsPayment,
      logger
    );
  }
  if (order.state === "PVF") {
    logger.info("PVF autovalidation");
    await autoValidationOrderStatePendingValidationByFinance(
      corp,
      order,
      logsPayment,
      logger
    );
  }
  // var updateStatus = await Order.updateOne({ id_cmd: idCmd },
  //   {
  //     $push: {
  //       logsPayment: logsPayment,
  //       logs: log
  //     },
  //     $set: {
  //       validationCompliance: order.validationCompliance,
  //       submissionDate: new Date(),
  //       state: order.state
  //     }
  //   }).exec();
  //   return res.status(201).json(updateStatus);
  await Order.updateOne(
    { id_cmd: idCmd },
    {
      $push: {
        logsPayment: logsPayment,
        logs: log,
      },
      $set: {
        validationCompliance: order.validationCompliance,
        submissionDate: new Date(),
        state: order.state,
      },
    }
  ).exec();
  // .then(updateStatus => res.status(201).json(updateStatus));
  // });
};

async function UpdateOrderFinance(orderUpdated, req, log) {
  let corp = {};
  orderUpdated.validationFinance = true;
  orderUpdated.reason = req.body.reason;
  let deb = verifWeek(new Date());
  let debut = new Date(clone(deb));
  let end = new Date();
  let cart = [];
  req.body.product.forEach((p) => {
    if (!p.print) {
      //actual product lines without Exchange fees
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
            status: req.body.status, // peut prendre activated, toretry, nodata, active, inactive
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
          status: req.body.status, // peut prendre activated, toretry, nodata, active, inactive
        });
      }
      cart.push(p);
      orderUpdated.products = cart;
    }
  });
  corp = {
    email: req.body.email,
    idCmd: req.body.id,
  };
  try {
    var mailer = new OrderMailService(req.logger, { id: req.body.id });
    await mailer.orderValidated(corp);
  } catch (error) {
    logger.error({ message: error.message, className: "Order API" });
    logger.error({ message: error.stack, className: "Order API" });
  }
  req.logger.info("validating order...");
  orderUpdated.idCommande = await setInvoiceId("QH_HISTO_");
  req.logger.info("id commande: " + orderUpdated.idcommande);
  await Config.updateOne({ id: "counter" }, { $inc: { value: 1 } }).exec();
  await Order.updateOne(
    { id_cmd: req.body.idCmd },
    { $set: orderUpdated, $push: { logs: log } }
  ).exec();
  req.logger.info("Order updated");
  await pdfpost(
    req.body.id,
    req.logger,
    orderUpdated.idCommande,
    "Invoice Nbr"
  );
  await new InvoiceService().updateInvoiceInformation(
    req.body.id,
    orderUpdated.idCommande,
    orderUpdated.state,

  );
  return corp;
}

async function UpdateStateProduct(orderUpdated, req, corp) {
  req.logger.info({ message: "updating state product..." });
  orderUpdated.validationProduct = true;
  orderUpdated.reason = req.body.reason;
  corp = {
    email: req.body.email,
    reason: req.body.reason,
    idCmd: req.body.id,
    paymentdate: new Date(),
    service: "Finance",
  };
  // Email validation au pvf
  var order = await Order.findOne({ id_cmd: req.body.idCmd }).exec();
  var invoice = await Invoice.findOne({ orderId: order.id }).exec();
  let idProForma = await setInvoiceId("QH_ProFormaInvoice_");
  orderUpdated.idProForma = idProForma + "_" + currentDateReversed();
  let eids = [];
  if (req.body.status === "cancelled") {
    await Pool.remove({ id: req.body.idCmd.split("-")[0] }).exec();
    try {
      var mailer = new OrderMailService(req.logger, order);
      await mailer.orderCancelled(corp);
    } catch (error) {
      req.logger.error({ message: error.message, className: "Order API" });
      req.logger.error({ message: error.stack, className: "Order API" });
    }
    return true;
  }
  if (req.body.status === "rejected") {
    try {
      var mailer = new OrderMailService(req.logger, order);
      corp.reason = "order is rejected by the system"; // generic message
      if (req.body.reason) {
        corp.reason = req.body.reason;
      }
      await mailer.orderRejected(corp);
    } catch (error) {
      req.logger.error({ message: error.message, className: "Order API" });
      req.logger.error({ message: error.stack, className: "Order API" });
    }
    return true;
  }
  order.products.forEach((p) => {
    eids.push(p.eid);
  });
  req.logger.info({ message: "sending email...", className: "Order API" });
  if (req.body.status !== "cancelled") {
    var users = await User.find({ roleName: "Product" }).exec();
    var mailer = new OrderMailService(req.logger, order);
    await new OrderPdfService(invoice).createInvoicePdf(
      req.logger,
      orderUpdated.idProForma,
      "Pro Forma Invoice Nbr"
    );
    await new InvoiceService().updateProFormaInformation(
      order.id,
      orderUpdated.idProForma
    );
    users.forEach(async (user) => {
      try {
        await mailer.newOrderHod(user.email, "Finance", invoice.total);
      } catch (error) {
        req.logger.error({ message: error.message, className: "Order API" });
        req.logger.error({ message: error.stack, className: "Order API" });
      }
    });
    req.logger.info({ message: "email sent" });
  }
}

function currentDateReversed() {
  let today = new Date();
  let date = today.getFullYear().toString() + (today.getMonth() + 1).toString() + today.getDate().toString();
  let time = today.getHours().toString() + today.getMinutes().toString() + today.getSeconds().toString();
  return date + time;
}

async function UpdateStateCompliance(updt, corp, req) {
  updt.validationCompliance = true;
  corp = {
    email: req.body.email,
    idCmd: req.body.idCmd,
    paymentdate: new Date(),
    service: "Product",
  };
  // Email validation au pvp
  var order = await Order.findOne({ id_cmd: req.body.idCmd }).exec();
  let eids = [];
  order.products.forEach((p) => {
    eids.push(p.eid);
  });
  var users = await User.find({ roleName: "Product" }).exec();
  users.forEach(async (user) => {
    try {
      await mailer.newOrderHod(user.email, "Product", totalttc(order));
    } catch (error) {
      req.logger.error({ message: error.message, className: "Order API" });
      req.logger.error({ message: error.stack, className: "Order API" });
    }
  });
}

async function autoValidationOrderStatePendingValidationByFinance(
  corp,
  order,
  logsPayment,
  logger
) {
  // var users = await User.find({ roleName: "Finance" }, { email: true, _id: false, firstname: true, lastname: true }).exec();
  User.find({ roleName: "Finance" }).then((users) => {
    var mailer = new OrderMailService(logger, order);
    users.forEach(async (user) => {
      try {
        await mailer.newOrderHod(user.email, "Finance", totalttc(order));
      } catch (error) {
        logger.error({ message: error.message, className: "Order API" });
        logger.error({ message: error.stack, className: "Order API" });
      }
    });
    req.logger.info({ message: "new order hod email sent" });
  });
}

async function autoValidationOrderStateIsPendingValidationbyProduct(
  corp,
  order,
  logsPayment,
  logger
) {
  // var users = await User.find({ roleName: "Product" }, { email: true, _id: false }).exec();
  User.find({ roleName: "Product" }).then((users) => {
    var mailer = new OrderMailService(logger, order);
    users.forEach(async (user) => {
      try {
        await mailer.newOrderHod(user.email, "Product", totalttc(order));
      } catch (error) {
        logger.error({ message: error.message, className: "Order API" });
        logger.error({ message: error.stack, className: "Order API" });
      }
    });
  });
}

async function autovalidationOrderStateIsPendingValidationByCompliance(
  corp,
  order,
  logsPayment,
  logger
) {
  // var users = await User.find({ roleName: "Compliance" }, { email: true, _id: false , firstname: true, lastname: true}).exec();
  User.find({ roleName: "Compliance" }).then((users) => {
    var mailer = new OrderMailService(logger, order);
    users.forEach(async (user) => {
      try {
        await mailer.newOrderHod(user.email, "Compliance", totalttc(order));
      } catch (error) {
        logger.error({ message: error.message, className: "Order API" });
        logger.error({ message: error.stack, className: "Order API" });
      }
    });
  });
}

async function autoValidationOrderStateIsPSC(order, log, logger) {
  try {
    var mailer = new OrderMailService(logger, order);
    await mailer.newOrder(order.email);
  } catch (error) {
    logger.error({ message: error.message, className: "Order API" });
    logger.error({ message: error.stack, className: "Order API" });
  }
  order.products.forEach((product) => {
    if (
      ((product.historical_data &&
        (product.historical_data.backfill_agreement ||
          product.historical_data.backfill_applyfee)) ||
        order.survey[0].dd === "1") &&
      product.onetime === 1
    ) {
      order.state = "PVC";
      log.status = "PVC";
      log.referer = "Client";
    } else {
      order.validationCompliance = true;
      log.referer = "Autovalidation";
      order.state = "PVP";
      log.status = "PVP";
      // Envoi email aux products
    }
  });
}

module.exports = router;