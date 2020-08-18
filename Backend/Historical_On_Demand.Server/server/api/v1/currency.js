const app = require('express')();
const router = require('express').Router();
const mongoose = require('mongoose');
const request = require('request');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const CURRENCY = global.environment.currency;

const Currency = mongoose.model('Currency');

router.get('/', async (req, res) => {
    let currencies = await Currency.find().exec();
    if (!currencies) return res.sendStatus(404);
    return res.status(200).json({ currencies: currencies });
});

router.get('/rib/:id', async (req, res) => {
    let currency = await Currency.findOne({ id: req.params.id }).exec();
    if (!currency) { return res.sendStatus(404); }
    return res.status(200).json({ rib: currency });
});

router.post('/saverib', async (req, res) => {
    let currencies = await Currency.updateOne(
        { _id: req.body._id },
        { $set: { rib: req.body.rib, iban: req.body.iban, bic: req.body.bic, maxrib: req.body.maxrib } }).exec();
    if (!currencies) { return res.status(204).json({ message: "Error : RIB hasn't been updated." }); }
    return res.status(200).json({ message: "Bank account information has been updated successfully" });
});

router.post('/', async (req, res) => {
    let currencies = await Currency.find().exec();
    if (!currencies) return res.sendStatus(404);
    request(CURRENCY, { json: true }, (err, r, body) => {
        if (err) {
            req.logger.error({ message: err.message, className: 'Currency API' });
            req.logger.error(err);
            return console.log(err);
        }
        parser.parseString(body, (err, result) => {
            let tab = result['gesmes:Envelope'].Cube[0].Cube[0].Cube;
            currencies.forEach((cur) => {
                if (cur.device !== 'EUR') {
                    let taux = search(cur.device, tab);
                    Currency.update({ id: cur.id }, { $set: { taux: taux, date: new Date() } }, (e) => {
                        if (err) req.logger.error({ message: err.message, error: err, className: 'Currency API' });
                    });
                }
            });
            res.status(200);
        });
    });
    return res.status(200);
});


function search(key, array) {
    if (key === 'eur') return '1';
    for (var i = 0; i < array.length; i++) {
        if (array[i]['$'].currency === key.toUpperCase()) return array[i]['$'].rate;
    }
}

module.exports = router;