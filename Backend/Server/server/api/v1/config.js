const app = require('express')();
const router = require('express').Router();
const mongoose = require('mongoose');

const Config = mongoose.model('Config');

const configService = require('../../service/configService')
// const admin = config.admin();

router.get('/vat', async (req, res) => {
    try {
        let vat = await configService.getVat();
        return res.status(200).json(vat);
    }
    catch (error) {
        return res.status(200).json({error:"No vat found"});
    }

    
});

router.get('/period', (req, res) => {
    Config.find({ id: 'periodSubscription' })
        .then((Config) => {
            if (!Config) { return res.sendStatus(404); }
            return res.status(200).json(Config);
        });
});

router.get('/pricingTier', (req, res) => {
    Config.find({ id: 'pricingTier' })
        .then((Config) => {
            if (!Config) { return res.sendStatus(404); }
            return res.status(200).json(Config);
        });
});

router.put('/pricingTier', (req, res) => {
    Config.updateOne({ id: 'pricingTier' }, { $set: { tab: req.body[0].tab } })
        .then((Config) => {
            if (!Config) { return res.sendStatus(404); }
            return res.status(200).json({ message: 'ADTV/Pricing Tier has been updated' });
        });
});

router.put('/vat', (req, res) => {
    Config.updateOne({ id: 'vat' }, { $set: { valueVat: req.body.vat } })
        .then((Config) => {
            if (!Config) { return res.sendStatus(404); }
            return res.status(201).json({ message: 'VAT has been updated' });
        });
});

router.get('/downloadSetting', (req, res) => {
    Config.find({ id: 'downloadSetting' })
        .then((Config) => {
            if (!Config) { return res.sendStatus(404); }
            return res.status(200).json(Config);
        });
});

router.put('/downloadSetting', (req, res) => {
    Config.updateOne({ id: 'downloadSetting' }, { $set: req.body })
        .then((Config) => {
            if (!Config) { return res.sendStatus(404); }
            return res.status(201).json({ message: 'Download Setting has been updated' });
        });
});

router.get('/elastic', (req, res) => {
    Config.findOne({ id: 'elastic' })
        .then((Config) => {
            if (!Config) { return res.sendStatus(404); }
            return res.status(200).json(Config);
        });
});

module.exports = router;