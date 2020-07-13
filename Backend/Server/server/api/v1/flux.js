const app = require('express')();
const router = require('express').Router();
const mongoose = require('mongoose');
const request = require('request');


//const config = require('../../config/config.js');
const APIQF = global.environment.apiqf;

const Asset = mongoose.model('Asset');
const Exchange = mongoose.model('Exchange');
const fluxservice = require('../../service/fluxService')

//Prix exprimé en dollar

router.post('/rate', async (req, res) => {
try{
  const rate = await fluxservice.getRate(req.body.currency)
  return res.status(200).json({ rate: rate });
  }catch (err)
  {
        req.logger.error({ message: err.message, className: 'Flux API'});
      req.logger.error(err);
       return res.status(500).json({ message : "an error has been thrown during the request" }); 
  }
  
});

// Attendu dataset => Trades, L1, MBL, ...
router.get('/eid/:dataset', (req, res) => {
  let t = [];
  let tabeid = [];
  //console.dir(APIQF + '/apiHoDProduct.php');
  request(APIQF + '/apiHoDProduct.php', { json: true }, (err, r, body) => {
    if (err) { 
      req.logger.error({ message: err.message, className: 'Flux API', error: err});
      req.logger.error(err);
      return console.log(err); 
    }
    objectToArray(body.hod_catalogue).forEach(c => {
      // if (objectToArray(c.dataset).indexOf(req.params.dataset) != -1 && c.is_active) {
      if (objectToArray(c.dataset).indexOf(req.params.dataset) != -1) {
        objectToArray(c.EIDs).forEach((e) => {
          tabeid.push(e);
          t.push(
            {
              eid: e,
              name: c.name,
              description: c.comment,
              desc: c.mnemo
            }
          );
        });
      }
    });
    res.status(200).json({ tabEid: tabeid, catalogue: t });
  });
});

router.get('/pricingtier', (req, res) => {
  let tier = {};
  let result = { instrument: { day: {}, month: {} }, feed: { day: {}, month: {} } };
  request.get(APIQF + '/apiHoDPricing.php', { json: true }, (err, r, body) => {
    let p = objectToArray(body.hod_catalogue);
    for (let x = 0; x < p.length; x++) {
      for (k in p[x].tier) {
        let price = objectToArray(p[x].tier[k]);
        tier = {};
        for (let j = 0; j < price.length; j++) {
          let po = price[j].split(':');
          tier[po[0]] = po[1];
        }
        result[p[x].level][p[x].recurrence][k] = tier;
      }
    }
    if (err) { 
      req.logger.error({ message: err.message, className: 'Flux API'});
      req.logger.error(err);
      return console.log(err); 
    }
    res.status(200).json(result);
  });
});

// Attendu eid => 1027, 1053, ...
router.get('/infoProduit/:eid', (req, res) => {
  request(APIQF + '/apiEID.php?eid=' + req.params.eid, { json: true }, (err, r, body) => {
    if (err) { 
      req.logger.error({ message: err.message, className: 'Flux API', error: error});
      req.logger.error(err);
      return console.log(err); 
    }
    res.status(200).json(body.eid_catalogue[req.params.eid]);
  });
});

router.get('/assets', (req, res) => {
  Asset.find({}, { _id: false })
    .then((Asset) => {
      if (!Asset) { return res.sendStatus(404); }
      return res.status(200).json(Asset);
    });
});

router.get('/exchanges', (req, res) => {
  Exchange.find({}, { _id: false })
    .then((Exchange) => {
      if (!Exchange) { return res.sendStatus(404); }
      return res.status(200).json(Exchange);
    });
});


function objectToArray(a) {
  let t = [];
  for (key in a) {
    t.push(a[key]);
  }
  return t;
}



module.exports = router;