const app = require('express')();
const router = require('express').Router();
const mongoose = require('mongoose');
const configService = require('../../service/configService')

const Config = mongoose.model('Config');

router.get('/vat', async (req, res) => {
    try {
        let vat = await configService.getVat();
        return res.status(200).json(vat);
    }
    catch (error) {
        return res.status(404).json({ error: "VAT not found" });
    }
});

router.get('/period', async (req, res) => {
    let subscriptionPeriod = await Config.find({ id: 'periodSubscription' });
    if (!subscriptionPeriod) { return res.sendStatus(404); }
    return res.status(200).json(subscriptionPeriod);
});

router.get('/pricingTier', async (req, res) => {
    let pricingTier = await Config.find({ id: 'pricingTier' }).exec();
    if (!pricingTier) { return res.sendStatus(404); }
    return res.status(200).json(pricingTier);
});

router.put('/pricingTier', async (req, res) => {
    let pricingTier = await Config.updateOne({ id: 'pricingTier' }, { $set: { tab: req.body[0].tab } }).exec();
    if (!pricingTier) { return res.sendStatus(404); }
    return res.status(200).json({ message: 'ADTV/Pricing Tier has been updated' });
});

router.put('/vat', async (req, res) => {
    let vat = await Config.updateOne({ id: 'vat' }, { $set: { valueVat: req.body.vat } }).exec();
    if (!vat) { return res.sendStatus(404); }
    return res.status(201).json({ message: 'VAT has been updated' });
});

router.get('/downloadSetting', async (req, res) => {
    let downloadSetting = await Config.find({ id: 'downloadSetting' }).exec();
    if (!downloadSetting) { return res.sendStatus(404); }
    return res.status(200).json(downloadSetting);
});

router.put('/downloadSetting', async (req, res) => {
    let downloadSetting = await Config.updateOne({ id: 'downloadSetting' }, { $set: req.body }).exec();
    if (!downloadSetting) { return res.sendStatus(404); }
    return res.status(201).json({ message: 'Download Setting has been updated' });
});

router.get('/elastic', async (req, res) => {
    let elastic = await Config.findOne({ id: 'elastic' }).exec();
    if (!elastic) { return res.sendStatus(404); }
    return res.status(200).json(elastic);
});

module.exports = router;