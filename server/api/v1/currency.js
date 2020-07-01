const app = require('express')();
const router = require('express').Router();
const mongoose = require('mongoose');

const request = require('request');
const xml2js = require('xml2js'); // XML2JS Module
const parser = new xml2js.Parser();


//const config = require('../../config/config.js');
const CURRENCY = global.environment.currency;

const Currency = mongoose.model('Currency');

router.get('/', (req, res) => {
    Currency.find()
    .then((Currencies) => {
        if (!Currencies) { return res.sendStatus(404); }
        return res.status(200).json({currencies: Currencies});
    });
});

router.get('/rib/:id', (req, res) => {
    Currency.findOne({id: req.params.id})
    .then((rib) => {
        if (!rib) { return res.sendStatus(404); }
        return res.status(200).json({rib: rib});
    });
});

router.post('/saverib', (req, res) => {
    Currency.updateOne(
        {_id:req.body._id},
        {
            $set: {
                rib:req.body.rib,
                iban:req.body.iban,
                bic: req.body.bic,
                maxrib: req.body.maxrib
            }
        }
    )
    .then((Currencies) => {
        if (!Currencies) { return res.status(204).json({message: "Error : RIB hasn't been updated."}); }
        return res.status(200).json({message: "Bank account information has been updated successfully"});
    });
});

router.post('/', (req, res) => {
    Currency.find()
    .then((Currencies) => {
        if (!Currencies) { return res.sendStatus(404); }
        request(CURRENCY, { json: true }, (err, r, body) => {
            if (err) { 
                req.logger.error({ message: err.message, className: 'Currency API'});
                req.logger.error(err);
                return console.log(err); 
            }
            parser.parseString(body, (err, result) => {
                let tab = result['gesmes:Envelope'].Cube[0].Cube[0].Cube;
                Currencies.forEach((cur)=>{
                    if(cur.device !== 'EUR'){
                        let taux = search(cur.device, tab);
                        Currency.update({id:cur.id},{$set:{taux: taux, date: new Date()}},(e)=>{
                            if (err) { 
                                req.logger.error({ message: err.message, error: err, className: 'Currency API'}); 
                                req.logger.error(err);
                            }
                        });
                    }
                });
                res.status(200);
            });
        });
        return res.status(200);
    });
});

function search(nameKey, myArray){
    if(nameKey === 'eur'){
        return '1';
    }
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i]['$'].currency === nameKey.toUpperCase() ) {
            return myArray[i]['$'].rate;
        }
    }
}

module.exports = router;